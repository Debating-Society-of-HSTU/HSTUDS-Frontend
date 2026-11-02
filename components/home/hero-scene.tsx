'use client';

import * as React from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  Environment,
  Lightformer,
  Float,
  Sparkles,
  SpotLight,
  MeshReflectorMaterial,
  useTexture,
  AdaptiveDpr,
} from '@react-three/drei';

/* ------------------------------------------------------------------ */
/* Lectern — the speaker's podium, wearing the society's seal          */
/* ------------------------------------------------------------------ */

const LECTERN_W = 1.7;

function Lectern() {
  const logo = useTexture('/logo.png', (t) => {
    t.colorSpace = THREE.SRGBColorSpace;
  });

  const body = React.useMemo(() => {
    // Side profile (x = front/back, y = height); the front leans toward the audience
    const s = new THREE.Shape();
    s.moveTo(-0.5, 0);
    s.lineTo(0.45, 0);
    s.lineTo(0.6, 1.95);
    s.lineTo(0.68, 2.2);
    s.lineTo(-0.62, 1.92);
    s.lineTo(-0.5, 1.85);
    s.closePath();
    const g = new THREE.ExtrudeGeometry(s, {
      depth: LECTERN_W,
      bevelEnabled: true,
      bevelThickness: 0.04,
      bevelSize: 0.04,
      bevelSegments: 4,
    });
    g.translate(0, 0, -LECTERN_W / 2);
    return g;
  }, []);

  // The front face tilts forward by ~4.4°
  const tilt = Math.atan2(0.15, 1.95);

  return (
    <group>
      <mesh geometry={body} rotation-y={-Math.PI / 2} castShadow receiveShadow>
        <meshPhysicalMaterial color="#0b1022" metalness={0.3} roughness={0.35} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>

      {/* Front panel details */}
      <group position={[0, 0, 0.5]} rotation-x={tilt}>
        {[0.25, 1.78].map((y) => (
          <mesh key={y} position={[0, y, 0.07]}>
            <boxGeometry args={[LECTERN_W + 0.02, 0.035, 0.02]} />
            <meshStandardMaterial color="#f5c35b" metalness={1} roughness={0.25} />
          </mesh>
        ))}
        {/* Seal medallion */}
        <mesh position={[0, 1.08, 0.075]} rotation-x={Math.PI / 2}>
          <cylinderGeometry args={[0.47, 0.47, 0.04, 64]} />
          <meshStandardMaterial color="#f5c35b" metalness={1} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.08, 0.1]}>
          <circleGeometry args={[0.42, 64]} />
          <meshStandardMaterial map={logo} roughness={0.5} />
        </mesh>
      </group>

      <Microphone />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Gooseneck microphone with a live "on air" ring                      */
/* ------------------------------------------------------------------ */

function Microphone() {
  const led = React.useRef<THREE.MeshStandardMaterial>(null);

  const { neck, headPos, headQuat } = React.useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.38, 2.1, 0.25),
      new THREE.Vector3(0.4, 2.45, 0.2),
      new THREE.Vector3(0.36, 2.75, 0.0),
      new THREE.Vector3(0.3, 2.88, -0.28),
    ]);
    const end = curve.getPoint(1);
    const tangent = curve.getTangent(1).normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), tangent);
    return { neck: new THREE.TubeGeometry(curve, 64, 0.022, 12, false), headPos: end, headQuat: q };
  }, []);

  useFrame(({ clock }) => {
    if (led.current) led.current.emissiveIntensity = 2.5 + Math.sin(clock.elapsedTime * 3) * 1.5;
  });

  return (
    <group>
      <mesh position={[0.38, 2.1, 0.25]}>
        <cylinderGeometry args={[0.06, 0.08, 0.06, 24]} />
        <meshStandardMaterial color="#c0c6d4" metalness={1} roughness={0.15} />
      </mesh>
      <mesh geometry={neck}>
        <meshStandardMaterial color="#d6dbe6" metalness={1} roughness={0.12} />
      </mesh>
      <group position={headPos} quaternion={headQuat}>
        <mesh position={[0, 0.04, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.048, 0.012, 12, 32]} />
          <meshStandardMaterial ref={led} color="#ef4444" emissive="#ef4444" emissiveIntensity={3} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.13, 0]}>
          <cylinderGeometry args={[0.05, 0.04, 0.16, 24]} />
          <meshStandardMaterial color="#d6dbe6" metalness={1} roughness={0.15} />
        </mesh>
        {/* Foam windscreen */}
        <mesh position={[0, 0.26, 0]} scale={[1, 1.25, 1]}>
          <sphereGeometry args={[0.075, 32, 32]} />
          <meshStandardMaterial color="#111827" roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Speech bubbles — Government (blue) and Opposition (amber)           */
/* ------------------------------------------------------------------ */

function bubbleShape(w: number, h: number, r: number, tailRight: boolean) {
  const s = new THREE.Shape();
  const x0 = -w / 2;
  const y0 = -h / 2;
  // Tail sits on the bottom edge, on the side facing the lectern
  const tx = tailRight ? w / 2 - r - 0.15 : -(w / 2 - r - 0.15);
  s.moveTo(x0 + r, y0);
  if (tailRight) {
    s.lineTo(tx - 0.3, y0);
    s.lineTo(tx + 0.12, y0 - 0.4);
    s.lineTo(tx + 0.05, y0);
  } else {
    s.lineTo(tx - 0.05, y0);
    s.lineTo(tx - 0.12, y0 - 0.4);
    s.lineTo(tx + 0.3, y0);
  }
  s.lineTo(x0 + w - r, y0);
  s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
  s.lineTo(x0 + w, y0 + h - r);
  s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
  s.lineTo(x0 + r, y0 + h);
  s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
  s.lineTo(x0, y0 + r);
  s.quadraticCurveTo(x0, y0, x0 + r, y0);
  return s;
}

/** An opening quotation mark ("6" shape): a ball with a tail sweeping up. */
function quoteShapes(rad: number) {
  const ball = new THREE.Shape();
  ball.absarc(0, 0, rad, 0, Math.PI * 2, false);
  const tail = new THREE.Shape();
  tail.moveTo(-rad, 0);
  tail.quadraticCurveTo(-rad * 1.1, rad * 2.4, rad * 0.9, rad * 3.1);
  tail.lineTo(rad * 1.0, rad * 2.6);
  tail.quadraticCurveTo(-rad * 0.1, rad * 2.0, 0, rad * 0.5);
  tail.closePath();
  return [ball, tail];
}

function SpeechBubble({
  color,
  side,
  ...props
}: { color: string; side: 'gov' | 'opp' } & React.ComponentProps<'group'>) {
  const { bubble, quote } = React.useMemo(() => {
    const b = new THREE.ExtrudeGeometry(bubbleShape(1.7, 1.15, 0.4, side === 'gov'), {
      depth: 0.22,
      bevelEnabled: true,
      bevelThickness: 0.08,
      bevelSize: 0.08,
      bevelSegments: 6,
      curveSegments: 24,
    });
    b.translate(0, 0, -0.11);
    const q = new THREE.ExtrudeGeometry(quoteShapes(0.11), {
      depth: 0.06,
      bevelEnabled: true,
      bevelThickness: 0.02,
      bevelSize: 0.02,
      bevelSegments: 3,
    });
    return { bubble: b, quote: q };
  }, [side]);

  // Government opens the case (“), Opposition answers it (”)
  const flip = side === 'opp';

  return (
    <group {...props}>
      <Float speed={1.6} rotationIntensity={0.25} floatIntensity={0.6}>
        <mesh geometry={bubble} castShadow>
          <meshPhysicalMaterial
            color={color}
            metalness={0.35}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.05}
            iridescence={0.35}
            envMapIntensity={1.4}
          />
        </mesh>
        <group position={[0, 0.02, 0.2]} rotation-z={flip ? Math.PI : 0}>
          {[-0.17, 0.17].map((x) => (
            <mesh key={x} geometry={quote} position={[x, -0.12, 0]}>
              <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.3} />
            </mesh>
          ))}
        </group>
      </Float>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Stage: velvet curtain, reflective floor, spotlight                  */
/* ------------------------------------------------------------------ */

function Curtain() {
  const geo = React.useMemo(() => {
    const g = new THREE.PlaneGeometry(36, 14, 360, 1);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      pos.setZ(i, Math.sin(x * 2.4) * 0.22 + Math.sin(x * 0.7) * 0.15);
    }
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <mesh geometry={geo} position={[0, 5, -4.5]} receiveShadow>
      <meshStandardMaterial color="#1a2350" roughness={0.75} metalness={0.1} />
    </mesh>
  );
}

function Floor({ cheap }: { cheap: boolean }) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.04, 0]} receiveShadow>
      <planeGeometry args={[40, 20]} />
      {cheap ? (
        <meshStandardMaterial color="#05070f" roughness={0.4} metalness={0.6} />
      ) : (
        <MeshReflectorMaterial
          resolution={512}
          blur={[400, 120]}
          mixBlur={1}
          mixStrength={6}
          roughness={0.8}
          depthScale={1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#05070f"
          metalness={0.6}
          mirror={0.5}
        />
      )}
    </mesh>
  );
}

function StageLight() {
  const light = React.useRef<THREE.SpotLight>(null);
  const scene = useThree((s) => s.scene);

  React.useEffect(() => {
    const l = light.current;
    if (!l) return;
    l.target.position.set(0, 0.8, 0);
    scene.add(l.target);
    return () => {
      scene.remove(l.target);
    };
  }, [scene]);

  return (
    <SpotLight
      ref={light}
      position={[0.6, 7.5, 2.2]}
      angle={0.42}
      penumbra={0.7}
      distance={14}
      attenuation={9}
      anglePower={5}
      intensity={120}
      color="#fff4dc"
      opacity={0.7}
      castShadow
    />
  );
}

/** Gentle parallax — the whole stage leans toward the pointer. */
function Rig({ children }: { children: React.ReactNode }) {
  const group = React.useRef<THREE.Group>(null);
  useFrame((state, delta) => {
    if (!group.current) return;
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, state.pointer.x * 0.18, 3, delta);
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -state.pointer.y * 0.04, 3, delta);
  });
  return <group ref={group}>{children}</group>;
}

/**
 * Frames the stage for the current viewport shape: on wide screens the lectern sits
 * on the right (copy on the left); on narrow ones it is centred above the copy.
 */
function CameraRig() {
  const { camera, size } = useThree();

  React.useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const tanHalf = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    if (size.width >= 1024 && aspect > 1.2) {
      const z = 10;
      const halfW = z * tanHalf * aspect;
      cam.position.set(-0.4 * halfW, 2.0, z);
    } else {
      // Fit both bubbles across the width, keep the stage in the upper part of the screen
      const halfH = Math.max(3.3, 3.0 / aspect);
      cam.position.set(0, 4 - 0.7 * halfH, halfH / tanHalf);
    }
    // Look straight ahead with a slight downward tilt (R3F otherwise aims at the origin)
    cam.lookAt(cam.position.x, cam.position.y - 0.35, 0);
    cam.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

/** Reflections for the glossy surfaces, built from lightformers — no HDR download. */
function Studio() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2} position={[0, 6, 2]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} color="#ffffff" />
      <Lightformer form="rect" intensity={3} position={[-6, 1, 2]} rotation-y={Math.PI / 2} scale={[6, 8, 1]} color="#3b82f6" />
      <Lightformer form="rect" intensity={3} position={[6, 1, 2]} rotation-y={-Math.PI / 2} scale={[6, 8, 1]} color="#f59e0b" />
      <Lightformer form="rect" intensity={1} position={[0, 2, 8]} scale={[8, 4, 1]} color="#c7d2fe" />
    </Environment>
  );
}

export default function HeroScene() {
  // Client-only component (loaded with ssr: false), so window is safe here
  const [reduced] = React.useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [small] = React.useState(() => window.innerWidth < 1024);
  // Positioned by CameraRig once the canvas knows its size

  return (
    <Canvas
      shadows
      dpr={[1, small ? 1.5 : 2]}
      frameloop={reduced ? 'demand' : 'always'}
      camera={{ position: [0, 2, 10], fov: 35 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      eventSource={document.body}
      eventPrefix="client"
    >
      <color attach="background" args={['#01030c']} />
      <fog attach="fog" args={['#01030c', 9, 22]} />
      <AdaptiveDpr pixelated />
      <CameraRig />

      <ambientLight intensity={0.15} />
      {/* Cool rim from the government benches, warm from the opposition */}
      <pointLight position={[-5, 3, 1]} intensity={25} color="#3b82f6" />
      <pointLight position={[5, 3, 1]} intensity={25} color="#f59e0b" />
      <StageLight />

      <Rig>
        <React.Suspense fallback={null}>
          <Lectern />
        </React.Suspense>
        <SpeechBubble side="gov" color="#2563eb" position={[-1.8, 3.05, 0.2]} rotation={[0, 0.35, 0.06]} />
        <SpeechBubble side="opp" color="#f59e0b" position={[1.8, 3.35, -0.4]} rotation={[0, -0.35, -0.06]} />
        <Curtain />
        <Floor cheap={small} />
        {/* Dust drifting through the spotlight beam */}
        <Sparkles count={small ? 30 : 60} scale={[2.5, 5, 2.5]} position={[0.3, 3, 1]} size={1.6} speed={0.25} opacity={0.5} color="#fff4dc" />
      </Rig>

      <Studio />
    </Canvas>
  );
}
