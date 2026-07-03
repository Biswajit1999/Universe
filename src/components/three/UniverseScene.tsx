"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import * as THREE from "three";

type SceneProps = {
  color?: string;
  compact?: boolean;
};

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let next = value;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function useVisualCapabilities() {
  const [webgl, setWebgl] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    updateMotion();
    media.addEventListener("change", updateMotion);

    const canvas = document.createElement("canvas");
    setWebgl(Boolean(canvas.getContext("webgl2") || canvas.getContext("webgl")));

    return () => media.removeEventListener("change", updateMotion);
  }, []);

  return { webgl, reducedMotion };
}

function StarCloud({ color, count, reducedMotion }: { color: string; count: number; reducedMotion: boolean }) {
  const points = useRef<THREE.Points>(null);
  const geometry = useMemo(() => {
    const random = seededRandom(count * 17);
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const accent = new THREE.Color(color);
    const ice = new THREE.Color("#bde8ff");

    for (let i = 0; i < count; i += 1) {
      const radius = 3 + random() * 6;
      const theta = random() * Math.PI * 2;
      const vertical = (random() - 0.5) * 5.5;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = vertical;
      positions[i * 3 + 2] = Math.sin(theta) * radius - 1.5;

      const starColor = random() > 0.72 ? accent : ice;
      const brightness = 0.55 + random() * 0.45;
      colors[i * 3] = starColor.r * brightness;
      colors[i * 3 + 1] = starColor.g * brightness;
      colors[i * 3 + 2] = starColor.b * brightness;
    }

    return { positions, colors };
  }, [color, count]);

  useFrame((state) => {
    if (!points.current || reducedMotion) return;
    points.current.rotation.y = state.clock.elapsedTime * 0.012;
    points.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.025;
  });

  return (
    <points ref={points} frustumCulled={false}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[geometry.positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[geometry.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.85}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function OrbitalCore({ color, compact, reducedMotion }: Required<SceneProps> & { reducedMotion: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const core = useRef<THREE.Mesh>(null);
  const satellites = useMemo(
    () => [
      { position: [2.15, 0.18, 0.2] as const, scale: 0.1 },
      { position: [-1.55, 0.72, 0.55] as const, scale: 0.07 },
      { position: [0.55, -1.18, 0.8] as const, scale: 0.08 },
      { position: [-0.35, 1.52, -0.2] as const, scale: 0.055 },
    ],
    [],
  );

  useFrame((state, delta) => {
    if (!rig.current || !core.current || reducedMotion) return;
    rig.current.rotation.y += delta * (compact ? 0.1 : 0.075);
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, state.pointer.y * 0.08, 0.025);
    rig.current.rotation.z = THREE.MathUtils.lerp(rig.current.rotation.z, -state.pointer.x * 0.08, 0.025);
    core.current.rotation.x += delta * 0.11;
    core.current.rotation.y -= delta * 0.16;
  });

  const radius = compact ? 0.72 : 0.94;
  const ring = compact ? 1.48 : 2.05;

  return (
    <group ref={rig} position={compact ? [0, 0.05, 0] : [1.55, 0.05, 0]} rotation={[0.08, -0.35, 0.05]}>
      <mesh ref={core}>
        <icosahedronGeometry args={[radius, 2]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.28}
          roughness={0.38}
          metalness={0.72}
          wireframe
          transparent
          opacity={0.88}
        />
      </mesh>

      <mesh scale={0.72}>
        <icosahedronGeometry args={[radius, 1]} />
        <meshStandardMaterial
          color="#07101d"
          emissive={color}
          emissiveIntensity={0.18}
          roughness={0.2}
          metalness={0.65}
          transparent
          opacity={0.78}
        />
      </mesh>

      <mesh rotation={[Math.PI * 0.42, 0.1, 0.16]}>
        <torusGeometry args={[ring, 0.012, 8, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.58} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh rotation={[Math.PI * 0.18, Math.PI * 0.24, -0.12]}>
        <torusGeometry args={[ring * 0.78, 0.008, 8, 140]} />
        <meshBasicMaterial color="#d9f3ff" transparent opacity={0.24} />
      </mesh>
      <mesh rotation={[Math.PI * 0.66, -Math.PI * 0.18, 0.32]}>
        <torusGeometry args={[ring * 1.2, 0.006, 8, 160]} />
        <meshBasicMaterial color={color} transparent opacity={0.2} />
      </mesh>

      {satellites.map((satellite, index) => (
        <mesh key={index} position={satellite.position} scale={satellite.scale}>
          <sphereGeometry args={[1, 16, 16]} />
          <meshBasicMaterial color={index % 2 ? "#ffffff" : color} />
        </mesh>
      ))}

      <pointLight color={color} intensity={compact ? 6 : 8} distance={7} decay={2} />
    </group>
  );
}

function DepthGrid({ color, reducedMotion }: { color: string; reducedMotion: boolean }) {
  const grid = useRef<THREE.GridHelper>(null);

  useFrame((state) => {
    if (!grid.current || reducedMotion) return;
    grid.current.position.z = (state.clock.elapsedTime * 0.16) % 0.8;
  });

  return (
    <gridHelper
      ref={grid}
      args={[18, 36, color, "#14213d"]}
      position={[0, -2.75, -1.5]}
      rotation={[0, 0, 0]}
      material-transparent
      material-opacity={0.18}
    />
  );
}

function CssFallback({ color, compact }: Required<SceneProps>) {
  return (
    <div
      className={`universe-scene-fallback ${compact ? "is-compact" : ""}`}
      style={{ "--scene-color": color } as CSSProperties}
      aria-hidden
    >
      <div className="universe-scene-orbit orbit-one" />
      <div className="universe-scene-orbit orbit-two" />
      <div className="universe-scene-core" />
    </div>
  );
}

export function UniverseScene({ color = "#7dd3fc", compact = false }: SceneProps) {
  const { webgl, reducedMotion } = useVisualCapabilities();
  const props = { color, compact };

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <CssFallback {...props} />
      {webgl && (
        <Canvas
          className="universe-webgl-canvas"
          camera={{ position: [0, compact ? 0.12 : 0.3, compact ? 5.4 : 7.2], fov: compact ? 44 : 40 }}
          dpr={[1, 1.6]}
          frameloop={reducedMotion ? "demand" : "always"}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
        >
          <fog attach="fog" args={["#05060f", compact ? 5.5 : 6.5, 14]} />
          <ambientLight intensity={0.36} />
          <directionalLight color="#d8f3ff" intensity={1.4} position={[3, 4, 5]} />
          <StarCloud color={color} count={compact ? 520 : 980} reducedMotion={reducedMotion} />
          <OrbitalCore color={color} compact={compact} reducedMotion={reducedMotion} />
          {!compact && <DepthGrid color={color} reducedMotion={reducedMotion} />}
        </Canvas>
      )}
      <div className="universe-scene-vignette" />
      <div className="universe-scene-scanline" />
    </div>
  );
}
