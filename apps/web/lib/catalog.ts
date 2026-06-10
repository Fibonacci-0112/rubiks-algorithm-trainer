import type { AlgorithmMethod, ProgressStatus } from "@rubiks/core";

export interface MethodMeta {
  method: AlgorithmMethod;
  slug: string;
  label: string;
  blurb: string;
}

export const METHOD_META: MethodMeta[] = [
  {
    method: "BEGINNER",
    slug: "beginner",
    label: "Beginner Method",
    blurb: "Layer-by-layer fundamentals to solve your first cube.",
  },
  {
    method: "F2L",
    slug: "f2l",
    label: "F2L",
    blurb: "First two layers in intuitive pairs — the heart of CFOP speed.",
  },
  {
    method: "OLL",
    slug: "oll",
    label: "OLL",
    blurb: "Orient the last layer so the top face is one solid color.",
  },
  {
    method: "PLL",
    slug: "pll",
    label: "PLL",
    blurb: "Permute the last layer to finish the solve. All 21 cases.",
  },
];

export function methodFromSlug(slug: string): MethodMeta | undefined {
  return METHOD_META.find((m) => m.slug === slug);
}

export function metaForMethod(method: AlgorithmMethod): MethodMeta {
  return METHOD_META.find((m) => m.method === method)!;
}

export const STATUS_META: Record<
  ProgressStatus,
  { label: string; color: string }
> = {
  NOT_STARTED: { label: "Not Started", color: "#64748b" },
  LEARNING: { label: "Learning", color: "#f59e0b" },
  PRACTICED: { label: "Practiced", color: "#3b82f6" },
  MASTERED: { label: "Mastered", color: "#22c55e" },
};

export const STATUS_ORDER: ProgressStatus[] = [
  "NOT_STARTED",
  "LEARNING",
  "PRACTICED",
  "MASTERED",
];
