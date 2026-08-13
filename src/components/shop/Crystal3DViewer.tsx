import { Suspense, useMemo, useEffect, useRef } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Shape, Size } from "@/data/products";

/* ── Size → scale factor ─────────────────────────────────── */
const SIZE_SCALE: Record<string, number> = {
  "small":              0.78,
  "medium":             1.00,
  "large":              1.28,
  "extra-large":        1.55,
  "mini-mantel":        1.75,
  "mantel":             1.95,
  "mini-presidential":  2.25,
  "large-presidential": 2.65,
};
function getSizeScale(sizeId?: string): number {
  return SIZE_SCALE[sizeId ?? ""] ?? 1.0;
}

/* ── Camera angle presets (unit direction vectors) ────────── */
export type CameraAngle = "front" | "side" | "quarter" | "top";

const ANGLE_DIR: Record<CameraAngle, [number, number, number]> = {
  front:   [0.00, 0.05, 1.00],
  side:    [1.00, 0.05, 0.20],
  quarter: [0.65, 0.35, 0.70],
  top:     [0.05, 1.00, 0.25],
};

/* ── Heart 2D shape ──────────────────────────────────────── */
function makeHeartShape(): THREE.Shape {
  const s = new THREE.Shape();
  s.moveTo(0, -0.85);
  s.bezierCurveTo( 0.45, -0.40,  0.85,  0.10,  0.65,  0.45);
  s.bezierCurveTo( 0.85,  0.82,  0.15,  0.85,  0.00,  0.55);
  s.bezierCurveTo(-0.15,  0.85, -0.85,  0.82, -0.65,  0.45);
  s.bezierCurveTo(-0.85,  0.10, -0.45, -0.40,  0.00, -0.85);
  return s;
}
const HEART_DEPTH = 0.32;

/* ── Geometry per shape ──────────────────────────────────── */
function buildGeometry(shapeId: string): THREE.BufferGeometry {
  switch (shapeId) {
    case "ball":
      return new THREE.SphereGeometry(0.82, 64, 64);
    case "ornament":
      return new THREE.SphereGeometry(0.76, 48, 48);
    case "cut-corner-diamond":
      return new THREE.OctahedronGeometry(0.88);
    case "heart":
    case "heart-keychain":
    case "heart-necklace":
      return new THREE.ExtrudeGeometry(makeHeartShape(), {
        depth: HEART_DEPTH, bevelEnabled: true,
        bevelSegments: 4, steps: 1, bevelSize: 0.05, bevelThickness: 0.05,
      });
    case "candle":
    case "urn":
      return new THREE.CylinderGeometry(0.50, 0.62, 1.60, 32);
    case "rectangle-wide":
    case "horizontal-keychain":
    case "notched-wide":
    case "dog-bone-horizontal":
      return new THREE.BoxGeometry(1.75, 1.15, 0.42);
    case "prestige":
      return new THREE.BoxGeometry(1.45, 1.45, 0.42);
    default:
      return new THREE.BoxGeometry(1.15, 1.75, 0.42);
  }
}

/* ── Photo plane size ────────────────────────────────────── */
function photoSize(shapeId: string): [number, number] {
  switch (shapeId) {
    case "ball":     case "ornament":                               return [1.05, 1.05];
    case "cut-corner-diamond":                                      return [0.95, 0.95];
    case "heart":    case "heart-keychain": case "heart-necklace":  return [0.90, 0.90];
    case "candle":   case "urn":                                    return [0.70, 1.10];
    case "rectangle-wide": case "horizontal-keychain":
    case "notched-wide":   case "dog-bone-horizontal":              return [1.52, 0.90];
    case "prestige":                                                return [1.20, 1.20];
    default:                                                        return [0.90, 1.52];
  }
}

/* ── Smooth camera animator (handles angle + scale) ─────── */
function CameraAnimator({ angle, scale }: { angle: CameraAngle; scale: number }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3(0, 0, 3.8));

  useEffect(() => {
    const dist = 3.8 * Math.max(0.72, scale * 0.82);
    const [x, y, z] = ANGLE_DIR[angle];
    const len = Math.sqrt(x*x + y*y + z*z);
    target.current.set((x/len)*dist, (y/len)*dist, (z/len)*dist);
  }, [angle, scale]);

  useFrame(() => {
    camera.position.lerp(target.current, 0.07);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

/* ── Photo texture plane ─────────────────────────────────── */
function PhotoPlane({ url, w, h }: { url: string; w: number; h: number }) {
  const texture = useTexture(url);
  useMemo(() => { texture.colorSpace = THREE.SRGBColorSpace; }, [texture]);
  return (
    <mesh>
      <planeGeometry args={[w, h]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

/* ── Crystal mesh ────────────────────────────────────────── */
function CrystalMesh({ shape, photoUrl, scale }: { shape: Shape; photoUrl: string | null; scale: number }) {
  const geo = useMemo(() => buildGeometry(shape.id), [shape.id]);
  const [pw, ph] = photoSize(shape.id);
  const isHeart = ["heart","heart-keychain","heart-necklace"].includes(shape.id);
  const zOff = isHeart ? -HEART_DEPTH / 2 : 0;

  const mat = (
    <meshPhysicalMaterial
      color="#c8deff" transmission={0.90} thickness={1.5}
      roughness={0.03} metalness={0.0} ior={1.52}
      transparent envMapIntensity={2.5}
    />
  );

  return (
    <group scale={[scale, scale, scale]}>
      <mesh geometry={geo} position={[0, 0, zOff]}>
        {/* Back faces */ }
        <meshPhysicalMaterial
          color="#c8deff" transmission={0.90} thickness={1.5}
          roughness={0.03} metalness={0.0} ior={1.52}
          transparent envMapIntensity={2.5} side={THREE.BackSide}
        />
      </mesh>
      <mesh geometry={geo} position={[0, 0, zOff]}>
        {/* Front faces */}
        <meshPhysicalMaterial
          color="#c8deff" transmission={0.90} thickness={1.5}
          roughness={0.03} metalness={0.0} ior={1.52}
          transparent envMapIntensity={2.5} side={THREE.FrontSide}
        />
      </mesh>
      {photoUrl && (
        <Suspense fallback={null}>
          <PhotoPlane url={photoUrl} w={pw} h={ph} />
        </Suspense>
      )}
    </group>
  );
}

/* ── Public component ────────────────────────────────────── */
export interface Crystal3DViewerProps {
  shape: Shape;
  photoUrl: string | null;
  size?: Size;
  angle?: CameraAngle;
}

export function Crystal3DViewer({ shape, photoUrl, size, angle = "front" }: Crystal3DViewerProps) {
  const scale = getSizeScale(size?.id);

  return (
    <Canvas
      camera={{ position: [0, 0, 3.8], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <CameraAnimator angle={angle} scale={scale} />

      <ambientLight intensity={0.50} />
      <directionalLight position={[ 4,  4,  6]} intensity={0.90} />
      <directionalLight position={[-4, -2, -4]} intensity={0.25} color="#4466bb" />
      <pointLight       position={[ 2,  2,  3]} intensity={0.50} />

      <Suspense fallback={null}>
        <Environment preset="studio" background={false} />
      </Suspense>

      <CrystalMesh shape={shape} photoUrl={photoUrl} scale={scale} />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={2.4 * scale * 0.65}
        maxDistance={7.0 * scale * 1.20}
        autoRotate
        autoRotateSpeed={0.6}
        makeDefault
      />
    </Canvas>
  );
}
