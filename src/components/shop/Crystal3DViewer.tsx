import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Shape } from "@/data/products";

/* ── Heart 2D shape for extrusion ──────────────────────────── */
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

/* ── Geometry per shape ID ───────────────────────────────────── */
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
        depth: HEART_DEPTH,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: 0.05,
        bevelThickness: 0.05,
      });
    case "candle":
    case "urn":
      return new THREE.CylinderGeometry(0.50, 0.62, 1.60, 32, 1, false);
    case "rectangle-wide":
    case "horizontal-keychain":
    case "notched-wide":
    case "dog-bone-horizontal":
      return new THREE.BoxGeometry(1.75, 1.15, 0.42);
    case "prestige":
      return new THREE.BoxGeometry(1.45, 1.45, 0.42);
    default:
      // rectangle-tall, vertical-keychain, notched-tall, dog-bone-vertical, desk-lamp
      return new THREE.BoxGeometry(1.15, 1.75, 0.42);
  }
}

/* ── Photo plane dimensions [width, height] inside crystal ──── */
function photoSize(shapeId: string): [number, number] {
  switch (shapeId) {
    case "ball":     case "ornament":       return [1.05, 1.05];
    case "cut-corner-diamond":              return [0.95, 0.95];
    case "heart":    case "heart-keychain": case "heart-necklace":
                                            return [0.90, 0.90];
    case "candle":   case "urn":            return [0.70, 1.10];
    case "rectangle-wide": case "horizontal-keychain":
    case "notched-wide":   case "dog-bone-horizontal": return [1.52, 0.90];
    case "prestige":                        return [1.20, 1.20];
    default:                                return [0.90, 1.52];
  }
}

/* ── Photo texture plane (Suspense-based) ────────────────────── */
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

/* ── Crystal mesh + optional photo ──────────────────────────── */
function CrystalMesh({ shape, photoUrl }: { shape: Shape; photoUrl: string | null }) {
  const geo = useMemo(() => buildGeometry(shape.id), [shape.id]);
  const [pw, ph] = photoSize(shape.id);
  const isHeart = shape.id === "heart" || shape.id === "heart-keychain" || shape.id === "heart-necklace";
  const zOff = isHeart ? -HEART_DEPTH / 2 : 0;

  return (
    <group>
      {/* Back faces */}
      <mesh geometry={geo} position={[0, 0, zOff]}>
        <meshPhysicalMaterial
          color="#c8deff"
          transmission={0.90}
          thickness={1.5}
          roughness={0.03}
          metalness={0.0}
          ior={1.52}
          transparent
          envMapIntensity={2.5}
          side={THREE.BackSide}
        />
      </mesh>
      {/* Front faces */}
      <mesh geometry={geo} position={[0, 0, zOff]}>
        <meshPhysicalMaterial
          color="#c8deff"
          transmission={0.90}
          thickness={1.5}
          roughness={0.03}
          metalness={0.0}
          ior={1.52}
          transparent
          envMapIntensity={2.5}
          side={THREE.FrontSide}
        />
      </mesh>
      {/* Photo etched inside */}
      {photoUrl && (
        <Suspense fallback={null}>
          <PhotoPlane url={photoUrl} w={pw} h={ph} />
        </Suspense>
      )}
    </group>
  );
}

/* ── Public component ────────────────────────────────────────── */
interface Props {
  shape: Shape;
  photoUrl: string | null;
}

export function Crystal3DViewer({ shape, photoUrl }: Props) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3.8], fov: 50 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.50} />
      <directionalLight position={[ 4,  4,  6]} intensity={0.90} />
      <directionalLight position={[-4, -2, -4]} intensity={0.25} color="#4466bb" />
      <pointLight       position={[ 2,  2,  3]} intensity={0.50} />

      {/* HDR environment (loads async, enhances glass material) */}
      <Suspense fallback={null}>
        <Environment preset="studio" background={false} />
      </Suspense>

      <CrystalMesh shape={shape} photoUrl={photoUrl} />

      <OrbitControls
        enablePan={false}
        enableZoom
        minDistance={2.4}
        maxDistance={7.0}
        autoRotate
        autoRotateSpeed={0.6}
        makeDefault
      />
    </Canvas>
  );
}
