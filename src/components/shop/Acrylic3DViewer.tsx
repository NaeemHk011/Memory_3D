import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

const DEPTH = 0.05; // acrylic is thin (~6mm)

/*
  Label format is WIDTHxHEIGHT  e.g. "20x30" = 20" wide, 30" tall.
  Scale: 7" (smallest max dim) → 0.875 units, 30" (largest) → 1.75 units.
*/
function panelDims(sizeLabel: string): [number, number] {
  const parts = sizeLabel.toLowerCase().split("x").map(Number);
  const printW = parts[0] || 1;
  const printH = parts[1] || 1;

  const realMax  = Math.max(printW, printH);
  const scale3D  = 0.5 + ((realMax - 7) / (30 - 7)) * 0.5; // 7"→0.5, 30"→1.0
  const maxDim3D = 1.75 * scale3D;

  const aspect = printW / printH;
  return aspect >= 1
    ? [maxDim3D, maxDim3D / aspect]     // landscape
    : [maxDim3D * aspect, maxDim3D];    // portrait
}

/* ── Panel with photo on front ───────────────────────────────── */
function AcrylicWithPhoto({ url, w, h }: { url: string; w: number; h: number }) {
  const texture = useTexture(url);
  useMemo(() => { texture.colorSpace = THREE.SRGBColorSpace; }, [texture]);

  const mPhoto = useMemo(() => new THREE.MeshBasicMaterial({ map: texture }), [texture]);
  const mBack  = useMemo(() => new THREE.MeshBasicMaterial({ color: "#f5f0e8" }), []);
  // Four thin acrylic edges — clone so each face gets its own instance
  const mR = useMemo(() => new THREE.MeshBasicMaterial({ color: "#cce5ff" }), []);
  const mL = useMemo(() => new THREE.MeshBasicMaterial({ color: "#cce5ff" }), []);
  const mT = useMemo(() => new THREE.MeshBasicMaterial({ color: "#cce5ff" }), []);
  const mB = useMemo(() => new THREE.MeshBasicMaterial({ color: "#cce5ff" }), []);

  return (
    <mesh>
      <boxGeometry args={[w, h, DEPTH]} />
      <primitive object={mR}     attach="material-0" />
      <primitive object={mL}     attach="material-1" />
      <primitive object={mT}     attach="material-2" />
      <primitive object={mB}     attach="material-3" />
      <primitive object={mPhoto} attach="material-4" />
      <primitive object={mBack}  attach="material-5" />
    </mesh>
  );
}

/* ── Empty panel (no photo) ──────────────────────────────────── */
function AcrylicEmpty({ w, h }: { w: number; h: number }) {
  return (
    <mesh>
      <boxGeometry args={[w, h, DEPTH]} />
      <meshBasicMaterial color="#e8e8e8" />
    </mesh>
  );
}

/* ── Model wrapper ───────────────────────────────────────────── */
function AcrylicModel({ photoUrl, w, h }: { photoUrl: string | null; w: number; h: number }) {
  return photoUrl ? (
    <Suspense fallback={<AcrylicEmpty w={w} h={h} />}>
      <AcrylicWithPhoto url={photoUrl} w={w} h={h} />
    </Suspense>
  ) : (
    <AcrylicEmpty w={w} h={h} />
  );
}

/* ── Public component ────────────────────────────────────────── */
interface Props {
  photoUrl: string | null;
  sizeLabel: string;
}

export function Acrylic3DViewer({ photoUrl, sizeLabel }: Props) {
  const [w, h] = panelDims(sizeLabel);
  const sizeScale = Math.max(w, h) / 1.75; // 0.5 for 5x7, 1.0 for 20x30

  const camX = 0.5 * sizeScale;
  const camY = 0.15 * sizeScale;

  return (
    // key resets camera & OrbitControls when size changes
    <Canvas
      key={sizeLabel}
      camera={{ position: [camX, camY, 2.8], fov: 46 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <AcrylicModel photoUrl={photoUrl} w={w} h={h} />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={1.5}
        maxDistance={6.0}
        minAzimuthAngle={-Math.PI * 0.18}
        maxAzimuthAngle={Math.PI * 0.18}
        minPolarAngle={Math.PI * 0.35}
        maxPolarAngle={Math.PI * 0.65}
        makeDefault
      />
    </Canvas>
  );
}
