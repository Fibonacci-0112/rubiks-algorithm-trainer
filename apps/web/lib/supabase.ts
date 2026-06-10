import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import type { AlgorithmProgress } from "@rubiks/core";
import type { CloudProgressRepository } from "@rubiks/db";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** True when Supabase credentials are configured (optional cloud sync). */
export const isCloudConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/** Lazily create the Supabase client, or null when not configured. */
export function getSupabase(): SupabaseClient | null {
  if (!isCloudConfigured) return null;
  if (!client) client = createClient(url!, anonKey!);
  return client;
}

interface CloudRow {
  user_id: string;
  algorithm_id: string;
  status: AlgorithmProgress["status"];
  practice_count: number;
  last_practiced_at: string | null;
  mastered_at: string | null;
  updated_at: string;
}

function toProgress(row: CloudRow): AlgorithmProgress {
  return {
    algorithmId: row.algorithm_id,
    status: row.status,
    practiceCount: row.practice_count,
    lastPracticedAt: row.last_practiced_at,
    masteredAt: row.mastered_at,
    updatedAt: row.updated_at,
    dirty: false,
  };
}

/** Supabase-backed cloud repository scoped to the signed-in user. */
export class SupabaseProgressRepository implements CloudProgressRepository {
  constructor(
    private readonly supabase: SupabaseClient,
    private readonly userId: string,
  ) {}

  async fetchAll(): Promise<AlgorithmProgress[]> {
    const { data, error } = await this.supabase
      .from("user_algorithm_progress")
      .select("*")
      .eq("user_id", this.userId);
    if (error) throw error;
    return (data as CloudRow[]).map(toProgress);
  }

  async upsert(rows: AlgorithmProgress[]): Promise<void> {
    const payload: CloudRow[] = rows.map((r) => ({
      user_id: this.userId,
      algorithm_id: r.algorithmId,
      status: r.status,
      practice_count: r.practiceCount,
      last_practiced_at: r.lastPracticedAt,
      mastered_at: r.masteredAt,
      updated_at: r.updatedAt,
    }));
    const { error } = await this.supabase
      .from("user_algorithm_progress")
      .upsert(payload, { onConflict: "user_id,algorithm_id" });
    if (error) throw error;
  }
}
