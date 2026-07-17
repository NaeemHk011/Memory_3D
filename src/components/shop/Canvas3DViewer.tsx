import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

const DEPTH = 0.14;

/*
  Label format is HEIGHTxWIDTH  e.g. "30x40" = 30" tall, 40" wide.
  Scale: 8" (smallest) → 0.875 world-units, 40" (largest) → 1.75 world-units.
  Linear mapping keeps relative size differences visible while all sizes stay
  large enough to see clearly at the default camera distance.
*/
function canvasDims(sizeLabel: string): [number, number] {
  const parts = sizeLabel.toLowerCase().split("x").map(Number);
  const printH = parts[0] || 1;
  const printW = parts[1] || 1;

  const realMax  = Math.max(printW, printH);
  const scale3D  = 0.5 + ((realMax - 8) / (40 - 8)) * 0.5; // 8"→0.5, 40"→1.0
  const maxDim3D = 1.75 * scale3D;

  const aspect = printW / printH;
  return aspect >= 1
    ? [maxDim3D, maxDim3D / aspect]     // landscape / square
    : [maxDim3D * aspect, maxDim3D];    // portrait
}

/* ── Helper: clone base texture with UV crop ─────────────────── */
function makeMat(base: THREE.Texture, ox: number, oy: number, rx: number, ry: number) {
  const t = base.clone();
  t.colorSpace = THREE.SRGBColorSpace;
  t.offset.set(ox, oy);
  t.repeat.set(rx, ry);
  t.wrapS = THREE.ClampToEdgeWrapping;
  t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
  return new THREE.MeshBasicMaterial({ map: t });
}

/* ── Canvas with gallery-wrap UV per face ────────────────────── */
function CanvasWithPhoto({ url, w, h }: { url: string; w: number; h: number }) {
  const base = useTexture(url);

  const wx = DEPTH / w;
  const wy = DEPTH / h;

  // BoxGeometry material index order: +x(right), -x(left), +y(top), -y(bottom), +z(front), -z(back)
  const mRight  = useMemo(() => makeMat(base, 1 - wx, 0,      wx, 1),  [base, wx]);
  const mLeft   = useMemo(() => makeMat(base, 0,      0,      wx, 1),  [base, wx]);
  const mTop    = useMemo(() => makeMat(base, 0,      1 - wy, 1,  wy), [base, wy]);
  const mBottom = useMemo(() => makeMat(base, 0,      0,      1,  wy), [base, wy]);
  const mFront  = useMemo(() => makeMat(base, 0,      0,      1,  1),  [base]);
  const mBack   = useMemo(() => new THREE.MeshBasicMaterial({ color: "#e8e0d0" }), []);

  return (
    <mesh>
      <boxGeometry args={[w, h, DEPTH]} />
      <primitive object={mRight}  attach="material-0" />
      <primitive object={mLeft}   attach="material-1" />
      <primitive object={mTop}    attach="material-2" />
      <primitive object={mBottom} attach="material-3" />
      <primitive object={mFront}  attach="material-4" />
      <primitive object={mBack}   attach="material-5" />
    </mesh>
  );
}

/* ── Empty canvas (no photo) ─────────────────────────────────── */
function CanvasEmpty({ w, h }: { w: number; h: number }) {
  return (
    <mesh>
      <boxGeometry args={[w, h, DEPTH]} />
      <meshBasicMaterial color="#e8e0d0" />
    </mesh>
  );
}

/* ── Model wrapper ───────────────────────────────────────────── */
function CanvasModel({ photoUrl, w, h }: { photoUrl: string | null; w: number; h: number }) {
  return photoUrl ? (
    <Suspense fallback={<CanvasEmpty w={w} h={h} />}>
      <CanvasWithPhoto url={photoUrl} w={w} h={h} />
    </Suspense>
  ) : (
    <CanvasEmpty w={w} h={h} />
  );
}

/* ── Public component ────────────────────────────────────────── */
interface Props {
  photoUrl: string | null;
  sizeLabel: string;
}

export function Canvas3DViewer({ photoUrl, sizeLabel }: Props) {
  const [w, h] = canvasDims(sizeLabel);
  const sizeScale = Math.max(w, h) / 1.75; // 0.5 for 8x8, 1.0 for 30x40

  // Camera X/Y offset scales with canvas size; Z stays fixed so sizes look different
  const camX = 0.6 * sizeScale;
  const camY = 0.2 * sizeScale;

  return (
    // key resets camera & OrbitControls when size changes
    <Canvas
      key={sizeLabel}
      camera={{ position: [camX, camY, 3.0], fov: 46 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <CanvasModel photoUrl={photoUrl} w={w} h={h} />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={1.8}
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
