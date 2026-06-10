"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useMemo } from "react";
import { parseAlgorithm, type Algorithm } from "@rubiks/core";
import { metaForMethod } from "@/lib/catalog";
import { usePlayback } from "@/lib/usePlayback";
import { PlaybackControls } from "./PlaybackControls";
import { NotationStrip } from "./NotationStrip";
import { ProgressSelector } from "./ProgressSelector";
import { DifficultyDots } from "./StatusBadge";

// The 3D viewer is browser-only; load it without SSR.
const CubeViewerWeb = dynamic(
  () => import("./CubeViewerWeb").then((m) => m.CubeViewerWeb),
  {
    ssr: false,
    loading: () => <div className="cube-canvas cube-loading">Loading 3D cube…</div>,
  },
);

export function AlgorithmDetail({ algorithm }: { algorithm: Algorithm }) {
  const moves = useMemo(
    () => parseAlgorithm(algorithm.notation),
    [algorithm.notation],
  );
  const playback = usePlayback(moves);
  const meta = metaForMethod(algorithm.method);

  return (
    <div className="detail">
      <nav className="breadcrumb">
        <Link href="/learn">Learn</Link>
        <span>/</span>
        <Link href={`/learn/${meta.slug}`}>{meta.label}</Link>
        <span>/</span>
        <span>{algorithm.title}</span>
      </nav>

      <header className="detail-head">
        <div>
          <h1>{algorithm.title}</h1>
          <p className="subtitle">
            {meta.label}
            {algorithm.caseCode ? ` · Case ${algorithm.caseCode}` : ""}
          </p>
        </div>
        <DifficultyDots difficulty={algorithm.difficulty} />
      </header>

      <div className="detail-body">
        <section className="viewer-col">
          <CubeViewerWeb
            moves={moves}
            index={playback.index}
            speed={playback.speed}
          />
          <PlaybackControls playback={playback} />
        </section>

        <aside className="info-col">
          <h2>Notation</h2>
          <NotationStrip moves={moves} index={playback.index} />
          <code className="full-notation">{algorithm.notation}</code>
          <ProgressSelector algorithmId={algorithm.id} />
          <p className="hint">
            Tip: use step forward / backward to study each turn, then play it at
            full speed to build muscle memory.
          </p>
        </aside>
      </div>
    </div>
  );
}
