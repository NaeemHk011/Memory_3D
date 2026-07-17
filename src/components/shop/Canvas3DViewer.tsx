import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useTexture } from "@react-three/drei";
import * as THREE from "three";

/* ── Size label → canvas [w, h] in 3D units ─────────────────── */
function canvasDims(sizeLabel: string): [number, number] {
  const map: Record<string, [number, number]> = {
    "8x8":   [1.62, 1.62],
    "11x14": [1.27, 1.62],
    "12x12": [1.62, 1.62],
    "16x20": [1.42, 1.78],
    "18x24": [1.35, 1.80],
    "24x36": [1.20, 1.80],
    "30x40": [1.35, 1.80],
  };
  return map[sizeLabel] ?? [1.5, 1.5];
}

const DEPTH = 0.14;

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

  const wx = DEPTH / w; // fraction of image that wraps on left/right
  const wy = DEPTH / h; // fraction of image that wraps on top/bottom

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
function CanvasModel({ photoUrl, sizeLabel }: { photoUrl: string | null; sizeLabel: string }) {
  const [w, h] = canvasDims(sizeLabel);
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
  return (
    <Canvas
      camera={{ position: [0.6, 0.2, 3.0], fov: 46 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <CanvasModel photoUrl={photoUrl} sizeLabel={sizeLabel} />

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
