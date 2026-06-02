import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

const NODE_COUNT = 80;

function NeuralMesh({ activeIndex, setActiveIndex }: { activeIndex: number | null; setActiveIndex: (i: number | null) => void }) {
  const groupRef = useRef<THREE.Group>(null);

  const { positions, edges } = useMemo(() => {
    const pos: THREE.Vector3[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      // distribute on a sphere with slight noise
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = 2 * Math.PI * Math.random();
      const r = 2 + (Math.random() - 0.5) * 0.4;
      pos.push(new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.sin(phi) * Math.sin(theta),
        r * Math.cos(phi),
      ));
    }
    const es: [number, number][] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        if (pos[i].distanceTo(pos[j]) < 1.4) es.push([i, j]);
      }
    }
    return { positions: pos, edges: es };
  }, []);

  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const arr: number[] = [];
    edges.forEach(([a, b]) => {
      arr.push(positions[a].x, positions[a].y, positions[a].z);
      arr.push(positions[b].x, positions[b].y, positions[b].z);
    });
    g.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
    return g;
  }, [positions, edges]);

  useFrame((_, dt) => {
    if (groupRef.current) groupRef.current.rotation.y += dt * 0.12;
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={lineGeo}>
        <lineBasicMaterial color="#2dd4a8" transparent opacity={0.25} />
      </lineSegments>
      {positions.map((p, i) => (
        <mesh
          key={i}
          position={p}
          onPointerOver={(e) => { e.stopPropagation(); setActiveIndex(i); }}
          onPointerOut={() => setActiveIndex(null)}
          scale={activeIndex === i ? 1.8 : 1}
        >
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial
            color={activeIndex === i ? "#73ffb8" : "#22d3ee"}
            emissive={activeIndex === i ? "#73ffb8" : "#0891b2"}
            emissiveIntensity={activeIndex === i ? 2.5 : 1.2}
          />
        </mesh>
      ))}
    </group>
  );
}

const FOOD_NODES = ["Vitamin D", "Iron", "Omega-3", "Magnesium", "B12", "Zinc", "Polyphenols", "Fiber"];

export const NeuralBrain3D = () => {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section id="brain" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mb-10">
          <div className="font-mono text-xs uppercase tracking-widest text-neon mb-3">// Neural core</div>
          <h2 className="font-display text-4xl md:text-5xl font-bold">The <span className="text-gradient">neural</span> behind the bite.</h2>
          <p className="text-muted-foreground mt-3">Interactive 3D representation of the ingredient → nutrient → health graph powering Neural+Bites.</p>
        </div>

        <div className="glass-strong rounded-3xl border-glow overflow-hidden grid lg:grid-cols-[1fr_280px]">
          <div className="h-[500px] relative">
            <Canvas camera={{ position: [0, 0, 6], fov: 50 }} dpr={[1, 2]}>
              <ambientLight intensity={0.4} />
              <pointLight position={[5, 5, 5]} intensity={1.2} color="#2dd4a8" />
              <pointLight position={[-5, -5, -5]} intensity={0.8} color="#a78bfa" />
              <NeuralMesh activeIndex={active} setActiveIndex={setActive} />
              <OrbitControls enablePan={false} enableZoom={false} autoRotate={false} />
            </Canvas>
            <div className="absolute top-4 left-4 glass rounded-full px-3 py-1.5 text-[10px] font-mono uppercase text-muted-foreground">Drag to orbit · hover nodes</div>
          </div>
          <div className="p-6 border-l border-border/40 space-y-3">
            <div className="font-mono text-xs uppercase tracking-widest text-neon">Live signals</div>
            <div className="space-y-2">
              {FOOD_NODES.map((n, i) => {
                const isActive = active != null && active % FOOD_NODES.length === i;
                return (
                  <div key={n} className={`glass rounded-xl p-3 flex justify-between items-center transition-all ${isActive ? "border-glow scale-[1.02]" : ""}`}>
                    <span className="text-sm">{n}</span>
                    <span className={`font-mono text-xs ${isActive ? "text-neon" : "text-muted-foreground"}`}>
                      {Math.round(40 + Math.sin(i * 1.7 + Date.now() / 1000) * 30 + 30)}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};