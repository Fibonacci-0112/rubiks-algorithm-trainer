"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import {
  applyMove,
  getSolvedCubeState,
  getStateAtMoveIndex,
  type Cubie,
  type Move,
  type CubeState,
  type FaceName,
  type PlaybackSpeed,
} from "@rubiks/core";
import {
  CUBIE_SPACING,
  matrixToQuaternion,
  moveAxisAngle,
} from "@rubiks/renderer-three";
import { BASE_MOVE_MS } from "@/lib/usePlayback";

const FACE_NORMALS: Record<FaceName, [number, number, number]> = {
  U: [0, 1, 0],
  D: [0, -1, 0],
  R: [1, 0, 0],
  L: [-1, 0, 0],
  F: [0, 0, 1],
  B: [0, 0, -1],
};

const AXIS_VEC = {
  x: new THREE.Vector3(1, 0, 0),
  y: new THREE.Vector3(0, 1, 0),
  z: new THREE.Vector3(0, 0, 1),
} as const;

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

function CubieMesh({ cubie }: { cubie: Cubie }) {
  const q = useMemo(() => matrixToQuaternion(cubie.orientation), [cubie.orientation]);
  return (
    <group
      position={[
        cubie.position.x * CUBIE_SPACING,
        cubie.position.y * CUBIE_SPACING,
        cubie.position.z * CUBIE_SPACING,
      ]}
      quaternion={[q.x, q.y, q.z, q.w]}
    >
      <mesh castShadow>
        <boxGeometry args={[0.98, 0.98, 0.98]} />
        <meshStandardMaterial color="#0b0b0d" roughness={0.45} metalness={0.1} />
      </mesh>
      {cubie.stickers.map((sticker) => {
        const n = FACE_NORMALS[sticker.face];
        const dir = new THREE.Vector3(n[0], n[1], n[2]);
        const quat = new THREE.Quaternion().setFromUnitVectors(
          new THREE.Vector3(0, 0, 1),
          dir,
        );
        return (
          <mesh
            key={sticker.face}
            position={[n[0] * 0.5, n[1] * 0.5, n[2] * 0.5]}
            quaternion={[quat.x, quat.y, quat.z, quat.w]}
          >
            <planeGeometry args={[0.82, 0.82]} />
            <meshStandardMaterial
              color={sticker.color}
              roughness={0.35}
              metalness={0}
              side={THREE.DoubleSide}
            />
          </mesh>
        );
      })}
    </group>
  );
}

interface AnimState {
  move: Move;
  base: CubeState;
  start: number;
  duration: number;
  affected: Set<string>;
}

function CubeGroup({
  moves,
  index,
  speed,
}: {
  moves: Move[];
  index: number;
  speed: PlaybackSpeed;
}) {
  const solved = useMemo(() => getSolvedCubeState(), []);
  const [display, setDisplay] = useState<CubeState>(() =>
    getStateAtMoveIndex(solved, moves, index),
  );
  const [anim, setAnim] = useState<AnimState | null>(null);
  const prevIndex = useRef(index);
  const pivot = useRef<THREE.Group>(null);

  // React to index changes: animate single forward steps, snap otherwise.
  useEffect(() => {
    const prev = prevIndex.current;
    prevIndex.current = index;
    if (index === prev) return;

    if (index === prev + 1 && moves[index - 1]) {
      const move = moves[index - 1]!;
      const base = getStateAtMoveIndex(solved, moves, index - 1);
      setDisplay(base);
      setAnim({
        move,
        base,
        start: performance.now(),
        duration: BASE_MOVE_MS / speed,
        affected: new Set(affectedIds(base, move)),
      });
    } else {
      setAnim(null);
      setDisplay(getStateAtMoveIndex(solved, moves, index));
    }
  }, [index, moves, solved, speed]);

  useFrame(() => {
    if (!anim || !pivot.current) return;
    const t = Math.min(1, (performance.now() - anim.start) / anim.duration);
    const { axis, angle } = moveAxisAngle(anim.move);
    pivot.current.setRotationFromAxisAngle(AXIS_VEC[axis], angle * smoothstep(t));
    if (t >= 1) {
      pivot.current.rotation.set(0, 0, 0);
      setDisplay(applyMove(anim.base, anim.move));
      setAnim(null);
    }
  });

  const stationary = anim
    ? display.cubies.filter((c) => !anim.affected.has(c.id))
    : display.cubies;
  const turning = anim
    ? display.cubies.filter((c) => anim.affected.has(c.id))
    : [];

  return (
    <group>
      {stationary.map((c) => (
        <CubieMesh key={c.id} cubie={c} />
      ))}
      <group ref={pivot}>
        {turning.map((c) => (
          <CubieMesh key={c.id} cubie={c} />
        ))}
      </group>
    </group>
  );
}

function affectedIds(state: CubeState, move: Move): string[] {
  // Local mirror of the engine's layer selection to avoid an extra import.
  const sel = SELECTORS[move.face];
  return state.cubies.filter((c) => sel(c.position)).map((c) => c.id);
}

// Layer selectors matching @rubiks/core MOVE_DEFS.
const SELECTORS: Record<string, (p: { x: number; y: number; z: number }) => boolean> = {
  R: (p) => p.x === 1,
  L: (p) => p.x === -1,
  U: (p) => p.y === 1,
  D: (p) => p.y === -1,
  F: (p) => p.z === 1,
  B: (p) => p.z === -1,
  M: (p) => p.x === 0,
  E: (p) => p.y === 0,
  S: (p) => p.z === 0,
  x: () => true,
  y: () => true,
  z: () => true,
  Rw: (p) => p.x >= 0,
  Lw: (p) => p.x <= 0,
  Uw: (p) => p.y >= 0,
  Dw: (p) => p.y <= 0,
  Fw: (p) => p.z >= 0,
  Bw: (p) => p.z <= 0,
};

export function CubeViewerWeb({
  moves,
  index,
  speed,
}: {
  moves: Move[];
  index: number;
  speed: PlaybackSpeed;
}) {
  return (
    <div className="cube-canvas">
      <Canvas camera={{ position: [4.5, 4.5, 5.5], fov: 38 }} dpr={[1, 2]}>
        <ambientLight intensity={0.85} />
        <directionalLight position={[6, 8, 5]} intensity={1.1} />
        <directionalLight position={[-5, -3, -4]} intensity={0.35} />
        <CubeGroup moves={moves} index={index} speed={speed} />
        <OrbitControls
          enablePan={false}
          minDistance={5}
          maxDistance={12}
          enableDamping
        />
      </Canvas>
    </div>
  );
}
