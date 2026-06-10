"use client";

import { create } from "zustand";
import {
  applyStatusChange,
  createProgress,
  type AlgorithmProgress,
  type ProgressStatus,
} from "@rubiks/core";
import { syncProgress } from "@rubiks/db";
import { localRepository } from "./dexie";
import {
  SupabaseProgressRepository,
  getSupabase,
  isCloudConfigured,
} from "./supabase";

interface ProgressState {
  loaded: boolean;
  byId: Record<string, AlgorithmProgress>;
  userId: string | null;
  syncing: boolean;
  /** Load all local progress into the store. */
  load: () => Promise<void>;
  /** Change an algorithm's status (local-first, then enqueue sync). */
  setStatus: (
    algorithmId: string,
    status: ProgressStatus,
    options?: { countPractice?: boolean },
  ) => Promise<void>;
  /** Record the current signed-in user (or null when logged out). */
  setUser: (userId: string | null) => void;
  /** Run a sync pass if logged in. UI never blocks on this. */
  sync: () => Promise<void>;
}

function statusFor(
  byId: Record<string, AlgorithmProgress>,
  algorithmId: string,
): AlgorithmProgress {
  return byId[algorithmId] ?? createProgress(algorithmId);
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  loaded: false,
  byId: {},
  userId: null,
  syncing: false,

  async load() {
    const rows = await localRepository.getAll();
    const byId: Record<string, AlgorithmProgress> = {};
    for (const row of rows) byId[row.algorithmId] = row;
    set({ byId, loaded: true });
  },

  async setStatus(algorithmId, status, options) {
    const current = statusFor(get().byId, algorithmId);
    const next = applyStatusChange(current, status, {
      countPractice: options?.countPractice,
    });
    // 1. Update local immediately (optimistic + persisted).
    set((s) => ({ byId: { ...s.byId, [algorithmId]: next } }));
    await localRepository.put(next);
    // 2. Enqueue sync without blocking the UI.
    if (get().userId) void get().sync();
  },

  setUser(userId) {
    set({ userId });
  },

  async sync() {
    const { userId, syncing } = get();
    if (syncing) return;
    const supabase = getSupabase();
    if (!userId || !supabase || !isCloudConfigured) return;
    set({ syncing: true });
    try {
      const cloud = new SupabaseProgressRepository(supabase, userId);
      await syncProgress(localRepository, cloud);
      await get().load();
    } catch (err) {
      // Non-fatal: local data remains the source of truth.
      console.error("Progress sync failed", err);
    } finally {
      set({ syncing: false });
    }
  },
}));
