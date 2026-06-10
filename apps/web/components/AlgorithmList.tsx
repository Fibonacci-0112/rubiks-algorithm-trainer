"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Algorithm, ProgressStatus } from "@rubiks/core";
import { useProgressStore } from "@/lib/progressStore";
import { STATUS_META, STATUS_ORDER } from "@/lib/catalog";
import { StatusBadge, DifficultyDots } from "./StatusBadge";

export function AlgorithmList({ algorithms }: { algorithms: Algorithm[] }) {
  const { byId, loaded, load } = useProgressStore();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProgressStatus | "ALL">(
    "ALL",
  );

  useEffect(() => {
    if (!loaded) void load();
  }, [loaded, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return algorithms.filter((a) => {
      const status = byId[a.id]?.status ?? "NOT_STARTED";
      if (statusFilter !== "ALL" && status !== statusFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.notation.toLowerCase().includes(q) ||
        (a.caseCode ?? "").toLowerCase().includes(q)
      );
    });
  }, [algorithms, byId, query, statusFilter]);

  return (
    <div>
      <div className="list-toolbar">
        <input
          type="search"
          placeholder="Search by name, case or notation…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ProgressStatus | "ALL")
          }
        >
          <option value="ALL">All progress</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="empty">No algorithms match your filters.</p>
      ) : (
        <ul className="algorithm-grid">
          {filtered.map((a) => {
            const status = byId[a.id]?.status ?? "NOT_STARTED";
            return (
              <li key={a.id}>
                <Link href={`/algorithm/${a.id}`} className="algorithm-card">
                  <div className="card-head">
                    <h3>{a.title}</h3>
                    <StatusBadge status={status} />
                  </div>
                  <code className="card-notation">{a.notation}</code>
                  <div className="card-foot">
                    {a.caseCode && (
                      <span className="case-chip">Case {a.caseCode}</span>
                    )}
                    <DifficultyDots difficulty={a.difficulty} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
