"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Move, PlaybackSpeed } from "@rubiks/core";

/** Base duration of a single quarter/half turn at 1x speed, in ms. */
export const BASE_MOVE_MS = 480;

export interface Playback {
  index: number;
  isPlaying: boolean;
  speed: PlaybackSpeed;
  moveCount: number;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  reset: () => void;
  setSpeed: (speed: PlaybackSpeed) => void;
}

/**
 * Headless playback controller for a move sequence. `index` is the number of
 * moves applied (0 == solved). Auto-advance timing is matched to the cube
 * viewer's animation duration so visuals and state stay in sync.
 */
export function usePlayback(moves: Move[]): Playback {
  const moveCount = moves.length;
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<PlaybackSpeed>(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset when the algorithm (move list) changes.
  useEffect(() => {
    setIndex(0);
    setIsPlaying(false);
  }, [moves]);

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  // Drive auto-advance while playing.
  useEffect(() => {
    if (!isPlaying) return;
    if (index >= moveCount) {
      setIsPlaying(false);
      return;
    }
    timer.current = setTimeout(() => {
      setIndex((i) => Math.min(i + 1, moveCount));
    }, BASE_MOVE_MS / speed);
    return clearTimer;
  }, [isPlaying, index, moveCount, speed]);

  const play = useCallback(() => {
    setIndex((i) => (i >= moveCount ? 0 : i));
    setIsPlaying(true);
  }, [moveCount]);

  const pause = useCallback(() => setIsPlaying(false), []);
  const toggle = useCallback(
    () => (isPlaying ? pause() : play()),
    [isPlaying, pause, play],
  );

  const stepForward = useCallback(() => {
    setIsPlaying(false);
    setIndex((i) => Math.min(i + 1, moveCount));
  }, [moveCount]);

  const stepBackward = useCallback(() => {
    setIsPlaying(false);
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setIndex(0);
  }, []);

  return {
    index,
    isPlaying,
    speed,
    moveCount,
    play,
    pause,
    toggle,
    stepForward,
    stepBackward,
    reset,
    setSpeed,
  };
}
