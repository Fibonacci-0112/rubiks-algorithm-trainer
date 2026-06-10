# Rubik's Cube Algorithm Trainer

An interactive 3D Rubik's cube learning experience. View algorithms as animated
3D cube rotations, step through each move, replay difficult sequences, and track
your learning progress — for the Beginner Method, F2L, OLL and PLL.

This repository implements SPEC-1 as a pnpm + Turborepo monorepo with shared
TypeScript packages backing a Next.js web app (and a planned Expo mobile app).

## What's implemented

| Area | Status |
| --- | --- |
| Notation parser (faces, slices, rotations, wide moves, aliases) | ✅ |
| Cube state engine (27 cubies, physically correct moves) | ✅ |
| Replay-to-index playback (step forward/backward) | ✅ |
| Progress model + sync merge conflict rules | ✅ |
| Seeded content: Beginner, F2L, OLL, full 21-case PLL | ✅ |
| Seed validation + CI | ✅ |
| 3D renderer (Three.js / R3F) with per-move animation | ✅ |
| Web app: learn paths, algorithm detail, playback controls | ✅ |
| Local-first progress (IndexedDB via Dexie) | ✅ |
| Optional Supabase auth + cloud sync | ✅ (guest mode by default) |
| Mobile app (Expo) | 🚧 scaffolding planned next |

**Tests:** 80 unit tests across parser, cube transitions, progress merge rules,
seed content and renderer geometry.

## Monorepo layout

```
apps/
  web/                 Next.js App Router web app
packages/
  core/                Parser, cube engine, progress model, seeded algorithms
  renderer-three/      Three.js scene + pure animation/quaternion geometry
  db/                  Local/cloud repository contracts + sync engine
  config/              Shared tsconfig
supabase/
  migrations/          Cloud progress schema + RLS
```

## Getting started

```bash
pnpm install

# Run the web app
pnpm --filter @rubiks/web dev      # http://localhost:3000

# Quality gates
pnpm -r test                        # all unit tests
pnpm -r typecheck                   # all packages
pnpm --filter @rubiks/core validate:seed
pnpm --filter @rubiks/web build     # production build (57 static pages)
```

### Optional cloud sync

The app is fully usable without an account (local-first guest mode). To enable
cross-device sync, apply `supabase/migrations/0001_initial.sql` to a Supabase
project and set, for the web app:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## How the cube engine works

The cube is modeled as 27 cubies, each with an integer grid position
(`{-1,0,1}³`) and an integer 3×3 rotation matrix for orientation — no floating
point drift. A move selects the affected layer, applies a quarter-turn rotation
matrix to those cubies' positions and orientations, and snaps to the grid. The
renderer derives a quaternion from each cubie's orientation matrix.

Move directions were derived to match a physical cube (e.g. an `R` turn sends
front stickers to the up face) and verified by tests against known move orders
(face turns order 4, the sexy move order 6, H-perm order 2, etc.).

"Solved" is defined visually (every face one uniform color) so that an
invisible in-place center rotation isn't treated as unsolved.

## Build order followed

The implementation follows the spec's build order: monorepo → shared config →
`core` (parser, cube, progress) → tests → seeded content → seed CI →
`renderer-three` → `db`/sync → web app shell → web 3D viewer → web detail page →
local progress → optional Supabase login + sync.
