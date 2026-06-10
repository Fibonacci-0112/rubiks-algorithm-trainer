"use client";

import type { PlaybackSpeed } from "@rubiks/core";
import type { Playback } from "@/lib/usePlayback";

const SPEEDS: PlaybackSpeed[] = [0.5, 1, 1.5, 2];

export function PlaybackControls({ playback }: { playback: Playback }) {
  const {
    index,
    moveCount,
    isPlaying,
    speed,
    toggle,
    stepBackward,
    stepForward,
    reset,
    setSpeed,
  } = playback;

  return (
    <div className="playback">
      <div className="playback-buttons">
        <button onClick={reset} aria-label="Reset" title="Reset">
          ⟲
        </button>
        <button
          onClick={stepBackward}
          disabled={index === 0}
          aria-label="Step backward"
          title="Step backward"
        >
          ◀◀
        </button>
        <button
          className="primary"
          onClick={toggle}
          aria-label={isPlaying ? "Pause" : "Play"}
          title={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? "❚❚" : "►"}
        </button>
        <button
          onClick={stepForward}
          disabled={index >= moveCount}
          aria-label="Step forward"
          title="Step forward"
        >
          ▶▶
        </button>
      </div>

      <div className="playback-meta">
        <span className="move-counter">
          Move {index} / {moveCount}
        </span>
        <label className="speed">
          Speed
          <select
            value={speed}
            onChange={(e) =>
              setSpeed(Number(e.target.value) as PlaybackSpeed)
            }
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
