"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";

/* Palette de marque réutilisée dans la scène. */
const COLOR_PRIMARY = "#FF6B2C";
const COLOR_GLOW = "#FFB347";

/* Inclinaison de repos du réseau (radians). */
const REST_X = 0.3;
const REST_Y = 0.5;

interface SceneQuality {
  nodeCount: number;
  neighbors: number;
  particleCount: number;
}

/* Deux niveaux de détail : complet (desktop) et allégé (mobile / reduced-motion). */
const FULL: SceneQuality = { nodeCount: 18, neighbors: 3, particleCount: 520 };
const LITE: SceneQuality = { nodeCount: 10, neighbors: 2, particleCount: 150 };

interface NodeData {
  position: [number, number, number];
  scale: number;
  color: string;
  phase: number;
}

interface Graph {
  nodes: NodeData[];
  linePositions: Float32Array;
  lineColors: Float32Array;
}

/**
 * Construit un réseau de nœuds répartis sur une sphère (distribution de
 * Fibonacci + légère perturbation) et relie chaque nœud à ses plus proches
 * voisins. Renvoie aussi les buffers de positions/couleurs des arêtes (dégradé
 * orange le long de chaque lien) pour un unique `lineSegments`.
 */
function buildGraph({ nodeCount, neighbors }: SceneQuality): Graph {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const radius = 3.3;
  const nodes: NodeData[] = [];

  for (let i = 0; i < nodeCount; i++) {
    const y = nodeCount > 1 ? 1 - (i / (nodeCount - 1)) * 2 : 0;
    const ring = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    const jitter = () => (Math.random() - 0.5) * 0.4;

    nodes.push({
      position: [
        Math.cos(theta) * ring * radius + jitter(),
        y * radius * 0.78 + jitter(),
        Math.sin(theta) * ring * radius + jitter(),
      ],
      scale: 0.1 + Math.random() * 0.1,
      color: i % 3 === 0 ? COLOR_GLOW : COLOR_PRIMARY,
      phase: Math.random() * Math.PI * 2,
    });
  }

  // Arêtes : k plus proches voisins, dédupliquées.
  const seen = new Set<string>();
  const edges: Array<[number, number]> = [];
  for (let i = 0; i < nodes.length; i++) {
    const ranked = nodes
      .map((_, j) => {
        const [ax, ay, az] = nodes[i].position;
        const [bx, by, bz] = nodes[j].position;
        const dx = ax - bx;
        const dy = ay - by;
        const dz = az - bz;
        return { j, d: dx * dx + dy * dy + dz * dz };
      })
      .filter((entry) => entry.j !== i)
      .sort((a, b) => a.d - b.d);

    for (let k = 0; k < Math.min(neighbors, ranked.length); k++) {
      const j = ranked[k].j;
      const key = i < j ? `${i}:${j}` : `${j}:${i}`;
      if (!seen.has(key)) {
        seen.add(key);
        edges.push([i, j]);
      }
    }
  }

  const primary = new THREE.Color(COLOR_PRIMARY);
  const glow = new THREE.Color(COLOR_GLOW);
  const linePositions = new Float32Array(edges.length * 6);
  const lineColors = new Float32Array(edges.length * 6);

  edges.forEach(([a, b], idx) => {
    const pa = nodes[a].position;
    const pb = nodes[b].position;
    linePositions.set([pa[0], pa[1], pa[2], pb[0], pb[1], pb[2]], idx * 6);
    lineColors.set(
      [primary.r, primary.g, primary.b, glow.r, glow.g, glow.b],
      idx * 6
    );
  });

  return { nodes, linePositions, lineColors };
}

/** Nuage de particules réparti dans une coquille sphérique autour du réseau. */
function buildParticles(count: number): Float32Array {
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 2.6 + Math.random() * 4.6;
    positions[i * 3] = Math.sin(phi) * Math.cos(theta) * r;
    positions[i * 3 + 1] = Math.cos(phi) * r * 0.7;
    positions[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * r;
  }
  return positions;
}

interface NetworkProps {
  quality: SceneQuality;
  animated: boolean;
}

/**
 * Réseau animé : rotation lente continue, parallaxe douce suivant la souris
 * (lue au niveau de la fenêtre pour ne jamais bloquer l'interface) et pulsation
 * émissive des nœuds. Tout est figé lorsque `animated` est faux.
 */
function Network({ quality, animated }: NetworkProps) {
  const group = useRef<THREE.Group>(null);
  const particleGroup = useRef<THREE.Group>(null);
  const materials = useRef<THREE.MeshStandardMaterial[]>([]);
  const pointer = useRef({ x: 0, y: 0 });
  const spin = useRef(0);

  const { nodes, linePositions, lineColors } = useMemo(
    () => buildGraph(quality),
    [quality]
  );
  const particles = useMemo(
    () => buildParticles(quality.particleCount),
    [quality.particleCount]
  );

  // Parallaxe : suivi global du pointeur, indépendant du hit-test du canvas
  // (le canvas reste `pointer-events: none`, l'UI au-dessus reste cliquable).
  useEffect(() => {
    if (!animated) return;
    const onMove = (event: PointerEvent) => {
      pointer.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (event.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [animated]);

  useFrame((state, delta) => {
    if (!animated || !group.current) return;
    const t = state.clock.elapsedTime;
    const d = Math.min(delta, 0.1); // borne anti-saut (onglet revenu au premier plan)

    spin.current += d * 0.045;
    const targetY = REST_Y + spin.current + pointer.current.x * 0.3;
    const targetX = REST_X + pointer.current.y * -0.16;
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      targetY,
      3,
      d
    );
    group.current.rotation.x = THREE.MathUtils.damp(
      group.current.rotation.x,
      targetX,
      3,
      d
    );

    if (particleGroup.current) {
      particleGroup.current.rotation.y = t * 0.02;
    }

    for (let i = 0; i < materials.current.length; i++) {
      const material = materials.current[i];
      if (material) {
        material.emissiveIntensity = 1.5 + Math.sin(t * 1.2 + nodes[i].phase) * 0.5;
      }
    }
  });

  return (
    <group ref={group} rotation={[REST_X, REST_Y, 0]}>
      {/* Liens lumineux : un seul draw call, dégradé par sommet, mélange additif */}
      <lineSegments>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[linePositions, 3]} />
          <bufferAttribute attach="attributes-color" args={[lineColors, 3]} />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          toneMapped={false}
        />
      </lineSegments>

      {/* Nœuds émissifs (sphères facettées) */}
      {nodes.map((node, i) => (
        <mesh key={i} position={node.position} scale={node.scale}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            ref={(material) => {
              if (material) materials.current[i] = material;
            }}
            color={node.color}
            emissive={node.color}
            emissiveIntensity={1.6}
            roughness={0.3}
            metalness={0.15}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* Particules flottantes */}
      <group ref={particleGroup}>
        <points>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[particles, 3]} />
          </bufferGeometry>
          <pointsMaterial
            size={0.045}
            color={COLOR_GLOW}
            transparent
            opacity={0.65}
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </points>
      </group>
    </group>
  );
}

interface AutomationSceneProps {
  /** Version allégée et statique (mobile / prefers-reduced-motion). */
  simplified?: boolean;
}

/**
 * Scène 3D du Hero : réseau de nœuds d'automatisation (inspiration n8n) reliés
 * par des liens lumineux, particules flottantes, matériau émissif orange et
 * léger bloom. À importer dynamiquement côté client (`ssr: false`).
 *
 * Optimisations : DPR plafonné, rendu « à la demande » + bloom désactivé en
 * mode allégé, comptes de nœuds/particules réduits, anti-aliasing délégué au
 * compositeur (MSAA) en mode complet.
 */
export default function AutomationScene({ simplified = false }: AutomationSceneProps) {
  const animated = !simplified;
  const quality = simplified ? LITE : FULL;

  return (
    <Canvas
      dpr={simplified ? [1, 1] : [1, 1.5]}
      frameloop={simplified ? "demand" : "always"}
      camera={{ position: [0, 0, 9], fov: 50 }}
      gl={{ antialias: simplified, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <ambientLight intensity={0.6} />
      <pointLight
        position={[6, 4, 6]}
        intensity={45}
        color={COLOR_GLOW}
        distance={40}
        decay={2}
      />

      <Suspense fallback={null}>
        <Float
          enabled={animated}
          speed={1}
          rotationIntensity={0.35}
          floatIntensity={0.7}
          floatingRange={[-0.15, 0.15]}
        >
          <Network quality={quality} animated={animated} />
        </Float>
      </Suspense>

      {animated && (
        <EffectComposer multisampling={4}>
          <Bloom
            intensity={0.9}
            luminanceThreshold={0.15}
            luminanceSmoothing={0.9}
            mipmapBlur
            radius={0.7}
          />
        </EffectComposer>
      )}
    </Canvas>
  );
}
