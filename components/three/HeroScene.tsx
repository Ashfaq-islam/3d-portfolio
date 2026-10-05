"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Mesh } from "three";
import { Vector3 } from "three";

type ShapeKind = "box" | "sphere" | "torus" | "icosahedron";

interface FloatingShapeProps {
  position: [number, number, number];
  color: string;
  shape: ShapeKind;
  scale: number;
  rotationSpeed: number;
}

// Every position is a fixed value so the server and client render the same scene
const shapes: FloatingShapeProps[] = [
  { shape: "torus", color: "#a855f7", position: [-3, 1.5, -2], scale: 0.6, rotationSpeed: 0.25 },
  { shape: "icosahedron", color: "#ec4899", position: [3, -1, -1.5], scale: 0.5, rotationSpeed: 0.35 },
  { shape: "box", color: "#c084fc", position: [2.5, 1.8, -2.5], scale: 0.4, rotationSpeed: 0.3 },
  { shape: "sphere", color: "#f472b6", position: [-2.8, -1.5, -1.8], scale: 0.5, rotationSpeed: 0.2 },
  { shape: "torus", color: "#8b5cf6", position: [0, 2.2, -3], scale: 0.35, rotationSpeed: 0.4 },
  { shape: "icosahedron", color: "#f9a8d4", position: [-3.5, 0, -2], scale: 0.3, rotationSpeed: 0.3 },
];

/* CAMERA PARALLAX SETTINGS */
// Where the camera sits when the cursor is centred. Shared by the Canvas and
// the CameraRig below so there is a single source of truth.
const CAMERA_BASE: [number, number, number] = [0, 0, 8];
// How far the camera may drift left/right (0.5) and up/down (0.3). Small
// values keep the movement subtle instead of distracting.
const PARALLAX_X = 0.5;
const PARALLAX_Y = 0.3;
// How quickly the camera catches up. 0.05 is the value used at 60 FPS.
const LERP_FACTOR = 0.05;
// After this many milliseconds without a pointer move, treat the cursor as
// centred so the camera drifts back to its base position.
const IDLE_RESET_MS = 2000;

/*
PERFORMANCE NOTES (tuned for a mid-range laptop with integrated graphics)
- Only 6 shapes, each with a very low-poly geometry (16 segment spheres, 12/24
  segment toruses, flat-shaded icosahedrons). More detail would not be visible
  behind the Hero text and would cost frames.
- dpr is capped at [1, 2] so the canvas never renders above 2x pixel density,
  which is the single biggest win on an Intel i5-7200U.
- The scene switches frameloop to "demand" as soon as the Hero leaves the
  screen, so scrolling past it stops all GPU work.
- "demand" is also used when the visitor prefers reduced motion, so the shapes
  stay visible as one static frame instead of animating.
- The Environment is procedural (no downloaded HDR) with frames={1}, so its
  reflections are baked a single time and never re-rendered.
*/

// Picks the geometry for a shape. All sizes give a bounding radius of ~1,
// so the scale prop controls how big each shape looks.
function ShapeGeometry({ shape }: { shape: ShapeKind }) {
  switch (shape) {
    case "box":
      return <boxGeometry args={[1.6, 1.6, 1.6]} />;
    case "sphere":
      return <sphereGeometry args={[1, 16, 16]} />;
    case "torus":
      return <torusGeometry args={[1, 0.35, 12, 24]} />;
    case "icosahedron":
      return <icosahedronGeometry args={[1, 0]} />;
  }
}

function FloatingShape({
  position,
  color,
  shape,
  scale,
  rotationSpeed,
}: FloatingShapeProps) {
  // useRef gives us a direct handle to the three.js mesh
  const meshRef = useRef<Mesh>(null);

  // useFrame runs before every frame. delta is the seconds since the last
  // frame, so the speed stays the same on 60Hz and 120Hz screens.
  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.x += delta * rotationSpeed;
    meshRef.current.rotation.y += delta * rotationSpeed * 0.8;
  });

  return (
    // Float from drei adds the gentle up and down bobbing
    <Float
      speed={1.2}
      rotationIntensity={0.2}
      floatIntensity={0.8}
      floatingRange={[-0.1, 0.1]}
    >
      <mesh ref={meshRef} position={position} scale={scale}>
        <ShapeGeometry shape={shape} />
        <meshStandardMaterial
          color={color}
          metalness={0.4}
          roughness={0.3}
          emissive={color}
          emissiveIntensity={0.15}
        />
      </mesh>
    </Float>
  );
}

function Shapes() {
  // viewport.width tells us how wide the visible area is at the camera distance
  const { viewport } = useThree();

  // On phones the visible width is small, so pull the x positions inward to
  // stop shapes from drifting off screen
  const xScale = Math.min(1, viewport.width / 8);

  return (
    <group>
      {shapes.map((item) => (
        <FloatingShape
          key={`${item.shape}-${item.position.join("-")}`}
          position={[
            item.position[0] * xScale,
            item.position[1],
            item.position[2],
          ]}
          color={item.color}
          shape={item.shape}
          scale={item.scale}
          rotationSpeed={item.rotationSpeed}
        />
      ))}
    </group>
  );
}

// Reads the OS level "reduce motion" setting
const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

// Read once on the first render. window does not exist while the page is
// pre-rendered on the server, so we fall back to false there.
function getInitialReduceMotion(): boolean {
  if (typeof window === "undefined") return false;

  return window.matchMedia(REDUCE_MOTION_QUERY).matches;
}

interface CameraRigProps {
  enabled: boolean;
}

/*
Moves the camera slightly with the cursor for a parallax effect.

WHY WE LISTEN ON window INSTEAD OF USING state.pointer
The Hero canvas has `pointer-events: none` (that is what keeps the Hero text
and buttons clickable). React Three Fiber's built-in `state.pointer` only
updates from pointer events fired on the canvas element itself, so with
pointer events disabled it would stay stuck at (0, 0) and the parallax would
never move. Listening on `window` works no matter what the CSS says.
The cursor position is stored in a ref instead of state so moving the mouse
never triggers a React re-render.
*/
function CameraRig({ enabled }: CameraRigProps) {
  // Normalised cursor position: -1 (left/top edge) to 1 (right/bottom edge)
  const mouse = useRef({ x: 0, y: 0 });
  // Timestamp of the last real pointer move
  const lastMove = useRef(0);
  // Scratch Vector3 for the camera's next position. Created once and reused,
  // because allocating inside useFrame would create garbage every frame.
  const target = useMemo(() => new Vector3(), []);

  useEffect(() => {
    if (!enabled) return;

    const handlePointerMove = (event: PointerEvent) => {
      // Touch input has no hover position to follow, so ignore it
      if (event.pointerType === "touch") return;

      mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      lastMove.current = performance.now();
    };

    // When the cursor leaves the window, ease back to the centre
    const handlePointerLeave = () => {
      mouse.current.x = 0;
      mouse.current.y = 0;
    };

    // passive: true tells the browser we never call preventDefault(), so it
    // does not have to wait for us before scrolling
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.documentElement.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [enabled]);

  useFrame((state, delta) => {
    // Step 1: never move the camera when the rig is switched off
    if (!enabled) return;

    // Step 2: if the cursor has been still for a moment, act as if it is in
    // the centre of the screen so the camera returns to its base position
    const isIdle = performance.now() - lastMove.current > IDLE_RESET_MS;
    const mouseX = isIdle ? 0 : mouse.current.x;
    const mouseY = isIdle ? 0 : mouse.current.y;

    // Step 3: where the camera wants to be this frame
    target.set(
      CAMERA_BASE[0] + mouseX * PARALLAX_X,
      CAMERA_BASE[1] + mouseY * PARALLAX_Y,
      CAMERA_BASE[2]
    );

    // Step 4: move a little bit closer to that spot every frame instead of
    // snapping, which is what makes the motion feel smooth.
    // 1 - (1 - 0.05)^(delta * 60) equals 0.05 on a 60 FPS screen. Raising
    // delta to the power scales the same feel on 30 or 144 FPS screens, so the
    // speed never changes with frame rate.
    const t = 1 - Math.pow(1 - LERP_FACTOR, delta * 60);
    state.camera.position.lerp(target, t);

    // Step 5: keep looking at the middle of the scene so it stays centred
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [reduceMotion, setReduceMotion] = useState<boolean>(
    getInitialReduceMotion
  );

  // Stop animating while the Hero is scrolled out of view
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  // Respect the "reduce motion" accessibility setting, and keep up with it if
  // the visitor changes it in their system settings while the page is open
  useEffect(() => {
    const query = window.matchMedia(REDUCE_MOTION_QUERY);

    const handleChange = (event: MediaQueryListEvent) => {
      setReduceMotion(event.matches);
    };

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  return (
    <div ref={containerRef} className="h-full w-full">
      <Canvas
        camera={{ position: CAMERA_BASE, fov: 50 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: "none" }}
        frameloop={isVisible && !reduceMotion ? "always" : "demand"}
      >
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 5, 5]} intensity={0.8} />
        {/* decay={0} keeps the purple rim light strong at this distance */}
        <pointLight
          position={[-5, -5, 5]}
          color="#a855f7"
          intensity={Math.PI}
          decay={0}
        />

        {/* Procedural environment: two coloured light panels give the metallic
            shapes soft reflections without loading any HDR file */}
        <Environment resolution={32} frames={1}>
          <Lightformer
            form="rect"
            intensity={2}
            color="#a855f7"
            position={[-3, 2, 2]}
            scale={[6, 6, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.5}
            color="#ec4899"
            position={[3, -2, 2]}
            scale={[6, 6, 1]}
          />
        </Environment>

        {/* Mouse parallax camera. Disabled when the visitor prefers reduced motion. */}
        <CameraRig enabled={!reduceMotion} />

        <Shapes />
      </Canvas>
    </div>
  );
}