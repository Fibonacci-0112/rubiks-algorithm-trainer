"use client";

import type { ProgressStatus } from "@rubiks/core";
import { STATUS_META } from "@/lib/catalog";

export function StatusBadge({ status }: { status: ProgressStatus }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="status-badge"
      style={{ color: meta.color, borderColor: meta.color }}
    >
      {meta.label}
    </span>
  );
}

export function DifficultyDots({ difficulty }: { difficulty: number }) {
  return (
    <span className="difficulty" aria-label={`Difficulty ${difficulty} of 5`}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={i < difficulty ? "dot on" : "dot"} />
      ))}
    </span>
  );
}
