"use client";

import type { Move } from "@rubiks/core";

/**
 * Shows the algorithm notation token-by-token, highlighting the moves already
 * played (index) and the move currently animating.
 */
export function NotationStrip({
  moves,
  index,
}: {
  moves: Move[];
  index: number;
}) {
  return (
    <div className="notation-strip" aria-label="Algorithm notation">
      {moves.map((move, i) => {
        const played = i < index;
        const current = i === index - 1;
        return (
          <span
            key={i}
            className={[
              "token",
              played ? "played" : "",
              current ? "current" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {move.raw}
          </span>
        );
      })}
    </div>
  );
}
