"use client";

import { Canvas, type ThreeEvent, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GRAPH_EDGES, GRAPH_NODES } from "@/lib/data/graph";
import type { GraphNode } from "@/lib/types";

const COLORS: Record<GraphNode["group"], string> = {
  domain: "#52dcff",
  topic: "#9d8cff",
  instrument: "#ffd76a",
  personal: "#63f5e6",
};

function position(node: GraphNode): [number, number, number] {
  const depth = ((node.id.split("").reduce((sum, letter) => sum + letter.charCodeAt(0), 0) % 9) - 4) * 0.18;
  return [(node.x - 500) / 112, (320 - node.y) / 102, node.id === "universe" ? 0.65 : depth];
}

function labelTexture(label: string, color: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 112;
  const context = canvas.getContext("2d")!;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = "600 30px Arial";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.shadowColor = color;
  context.shadowBlur = 12;
  context.fillStyle = "#dff8ff";
  context.fillText(label.toUpperCase(), 256, 56);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function GraphNodeObject({ node, active, related, onHover, onSelect }: {
  node: GraphNode;
  active: boolean;
  related: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const color = COLORS[node.group];
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null);
  useEffect(() => {
    const next = labelTexture(node.label, color);
    setTexture(next);
    return () => next.dispose();
  }, [color, node.label]);
  const radius = node.id === "universe" ? 0.34 : node.group === "domain" ? 0.24 : 0.16;

  useFrame((state) => {
    if (!group.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * 1.8 + node.x) * (active ? 0.08 : 0.025);
    group.current.scale.setScalar(pulse);
  });

  const pointer = (event: ThreeEvent<PointerEvent>, id: string | null) => {
    event.stopPropagation();
    onHover(id);
    document.body.style.cursor = id ? "pointer" : "default";
  };

  return (
    <group ref={group} position={position(node)}>
      <mesh onPointerOver={(event) => pointer(event, node.id)} onPointerOut={(event) => pointer(event, null)} onClick={(event) => { event.stopPropagation(); onSelect(node.id); }}>
        <icosahedronGeometry args={[radius, node.id === "universe" ? 2 : 1]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={active ? 1.6 : related ? 0.85 : 0.42} metalness={0.72} roughness={0.24} transparent opacity={active || related ? 1 : 0.78} wireframe={node.group === "domain" || node.id === "universe"} />
      </mesh>
      <mesh scale={active ? 1.85 : 1.45}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={active ? 0.12 : 0.045} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      {texture && <sprite position={[0, -(radius + 0.29), 0]} scale={[1.38, 0.3, 1]}>
        <spriteMaterial map={texture} transparent opacity={active || related ? 1 : 0.72} depthWrite={false} />
      </sprite>}
      {node.id === "universe" && (
        <mesh rotation={[Math.PI / 2.8, 0.2, 0]}>
          <torusGeometry args={[0.57, 0.012, 8, 96]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} />
        </mesh>
      )}
    </group>
  );
}

function EdgeField({ hover }: { hover: string | null }) {
  const base = useMemo(() => new Float32Array(GRAPH_EDGES.flatMap((edge) => {
    const from = GRAPH_NODES.find((node) => node.id === edge.from)!;
    const to = GRAPH_NODES.find((node) => node.id === edge.to)!;
    return [...position(from), ...position(to)];
  })), []);
  const active = useMemo(() => new Float32Array(GRAPH_EDGES.filter((edge) => hover && (edge.from === hover || edge.to === hover)).flatMap((edge) => {
    const from = GRAPH_NODES.find((node) => node.id === edge.from)!;
    const to = GRAPH_NODES.find((node) => node.id === edge.to)!;
    return [...position(from), ...position(to)];
  })), [hover]);
  return (
    <>
      <lineSegments>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[base, 3]} /></bufferGeometry>
        <lineBasicMaterial color="#2c7894" transparent opacity={0.28} blending={THREE.AdditiveBlending} />
      </lineSegments>
      {active.length > 0 && <lineSegments>
        <bufferGeometry><bufferAttribute attach="attributes-position" args={[active, 3]} /></bufferGeometry>
        <lineBasicMaterial color="#67e8f9" transparent opacity={0.92} blending={THREE.AdditiveBlending} />
      </lineSegments>}
    </>
  );
}

function Stars() {
  const positions = useMemo(() => {
    const values = new Float32Array(720);
    for (let index = 0; index < values.length; index += 3) {
      const seed = Math.sin(index * 999) * 43758.5453;
      const random = seed - Math.floor(seed);
      values[index] = (random - 0.5) * 16;
      values[index + 1] = ((random * 7.13) % 1 - 0.5) * 10;
      values[index + 2] = -1 - ((random * 13.7) % 1) * 6;
    }
    return values;
  }, []);
  return <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[positions, 3]} /></bufferGeometry><pointsMaterial color="#9eeaff" size={0.025} transparent opacity={0.7} depthWrite={false} /></points>;
}

function Constellation({ hover, onHover, onSelect, reducedMotion }: { hover: string | null; onHover: (id: string | null) => void; onSelect: (id: string) => void; reducedMotion: boolean }) {
  const rig = useRef<THREE.Group>(null);
  const related = useMemo(() => new Set(GRAPH_EDGES.flatMap((edge) => edge.from === hover ? [edge.to] : edge.to === hover ? [edge.from] : [])), [hover]);
  useFrame((state, delta) => {
    if (!rig.current || reducedMotion) return;
    rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, state.pointer.x * 0.075, Math.min(1, delta * 2.2));
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, state.pointer.y * 0.06, 0.025);
    rig.current.rotation.z = THREE.MathUtils.lerp(rig.current.rotation.z, -state.pointer.x * 0.018, 0.025);
  });
  return <group ref={rig}>
    <EdgeField hover={hover} />
    {GRAPH_NODES.map((node) => <GraphNodeObject key={node.id} node={node} active={hover === node.id} related={!hover || related.has(node.id)} onHover={onHover} onSelect={onSelect} />)}
  </group>;
}

export function KnowledgeGraph3D({ hover, onHover, onSelect }: { hover: string | null; onHover: (id: string | null) => void; onSelect: (id: string) => void }) {
  const [reducedMotion, setReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return (
    <Canvas camera={{ position: [0, 0.15, 10.2], fov: 42 }} dpr={[1, 1.5]} frameloop={reducedMotion ? "demand" : "always"} gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }} onPointerMissed={() => onHover(null)}>
      <fog attach="fog" args={["#020712", 8, 17]} />
      <ambientLight intensity={0.42} />
      <directionalLight color="#c9f6ff" intensity={1.6} position={[3, 5, 6]} />
      <pointLight color="#22d3ee" intensity={9} distance={9} position={[0, 0, 2]} />
      <Stars />
      <Constellation hover={hover} onHover={onHover} onSelect={onSelect} reducedMotion={reducedMotion} />
    </Canvas>
  );
}
