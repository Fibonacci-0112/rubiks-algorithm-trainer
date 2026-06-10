import Dexie, { type Table } from "dexie";
import type { AlgorithmProgress } from "@rubiks/core";
import type { LocalProgressRepository } from "@rubiks/db";

/** IndexedDB database (via Dexie) holding local-first progress + settings. */
class RubiksDexie extends Dexie {
  progress!: Table<AlgorithmProgress, string>;
  settings!: Table<{ key: string; value: string }, string>;

  constructor() {
    super("rubiks-algo-trainer");
    this.version(1).stores({
      progress: "algorithmId, status, dirty",
      settings: "key",
    });
  }
}

let dbInstance: RubiksDexie | null = null;

function db(): RubiksDexie {
  if (!dbInstance) dbInstance = new RubiksDexie();
  return dbInstance;
}

/** Dexie-backed implementation of the shared LocalProgressRepository. */
export class DexieProgressRepository implements LocalProgressRepository {
  async getAll(): Promise<AlgorithmProgress[]> {
    return db().progress.toArray();
  }

  async get(algorithmId: string): Promise<AlgorithmProgress | undefined> {
    return db().progress.get(algorithmId);
  }

  async put(progress: AlgorithmProgress): Promise<void> {
    await db().progress.put(progress);
  }

  async putMany(rows: AlgorithmProgress[]): Promise<void> {
    await db().progress.bulkPut(rows);
  }

  async getDirty(): Promise<AlgorithmProgress[]> {
    // `dirty` is stored as a boolean; filter in memory to avoid IndexedDB
    // boolean-index quirks.
    return (await db().progress.toArray()).filter((r) => r.dirty);
  }

  async markClean(algorithmIds: string[]): Promise<void> {
    await db().transaction("rw", db().progress, async () => {
      for (const id of algorithmIds) {
        const row = await db().progress.get(id);
        if (row && row.dirty) await db().progress.put({ ...row, dirty: false });
      }
    });
  }
}

export const localRepository = new DexieProgressRepository();
