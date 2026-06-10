"use client";

import { useEffect, useMemo } from "react";
import { getAllAlgorithms } from "@rubiks/core";
import { useProgressStore } from "@/lib/progressStore";
import { STATUS_META, STATUS_ORDER } from "@/lib/catalog";

export function SettingsPanel() {
  const { byId, loaded, load } = useProgressStore();
  const total = useMemo(() => getAllAlgorithms().length, []);

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {
      NOT_STARTED: 0,
      LEARNING: 0,
      PRACTICED: 0,
      MASTERED: 0,
    };
    let tracked = 0;
    for (const row of Object.values(byId)) {
      c[row.status] = (c[row.status] ?? 0) + 1;
      tracked += 1;
    }
    c.NOT_STARTED = total - tracked + c.NOT_STARTED;
    return c;
  }, [byId, total]);

  return (
    <div className="panel">
      <h2>Your progress</h2>
      <ul className="progress-summary">
        {STATUS_ORDER.map((s) => (
          <li key={s}>
            <span className="dot" style={{ background: STATUS_META[s].color }} />
            {STATUS_META[s].label}
            <strong>{counts[s] ?? 0}</strong>
          </li>
        ))}
      </ul>
      <p className="muted">
        Tracking {total} algorithms across Beginner, F2L, OLL and PLL. Progress
        is stored locally on this device.
      </p>
    </div>
  );
}
