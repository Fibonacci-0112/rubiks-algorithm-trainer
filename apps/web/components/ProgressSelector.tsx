"use client";

import { useEffect } from "react";
import type { ProgressStatus } from "@rubiks/core";
import { STATUS_META, STATUS_ORDER } from "@/lib/catalog";
import { useProgressStore } from "@/lib/progressStore";

export function ProgressSelector({ algorithmId }: { algorithmId: string }) {
  const { byId, loaded, load, setStatus } = useProgressStore();

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const current = byId[algorithmId]?.status ?? "NOT_STARTED";

  return (
    <div className="progress-selector">
      <span className="label">Progress</span>
      <div className="status-buttons">
        {STATUS_ORDER.map((status) => (
          <button
            key={status}
            className={status === current ? "active" : ""}
            style={
              status === current
                ? { borderColor: STATUS_META[status].color, color: STATUS_META[status].color }
                : undefined
            }
            onClick={() =>
              setStatus(algorithmId, status, {
                countPractice:
                  status === "PRACTICED" || status === "MASTERED",
              })
            }
          >
            {STATUS_META[status as ProgressStatus].label}
          </button>
        ))}
      </div>
    </div>
  );
}
