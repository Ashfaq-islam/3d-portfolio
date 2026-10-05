"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Float, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import type { Group, Mesh, Points, WebGLRenderer } from "three";
import { Color, Vector3 } from "three";

type ShapeKind = "box" | "sphere" | "torus" | "icosahedron";

interface FloatingShapeProps {
  position: [number, number, number];
  color: string;
  shape: ShapeKind;
  scale: number;
  rotationSpeed: number;
}

// Every position is a fixed value so the server and client render the same scene
// Keep these colors in sync with --color-brand-* in app/globals.css
const shapes: FloatingShapeProps[] = [
  { shape: "torus", color: "#3b82f6", position: [-3, 1.5, -2], scale: 0.6, rotationSpeed: 0.25 },
  { shape: "icosahedron", color: "#06b6d4", position: [3, -1, -1.5], scale: 0.5, rotationSpeed: 0.35 },
  { shape: "box", color: "#60a5fa", position: [2.5, 1.8, -2.5], scale: 0.4, rotationSpeed: 0.3 },
  { shape: "sphere", color: "#22d3ee", position: [-2.8, -1.5, -1.8], scale: 0.5, rotationSpeed: 0.2 },
  { shape: "torus", color: "#1e40af", position: [0, 2.2, -3], scale: 0.35, rotationSpeed: 0.4 },
  { shape: "icosahedron", color: "#67e8f9", position: [-3.5, 0, -2], scale: 0.3, rotationSpeed: 0.3 },
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

/* PARTICLE (COSMIC DUST) SETTINGS */
// How many dots. 180 is plenty for a subtle background and still one draw call.
const PARTICLE_COUNT = 180;
/*
PointsMaterial has a single `size` uniform for every point, so all dots are the
same 3D size. sizeAttenuation makes points further away render smaller, so the
random depth (z) is what creates the size variety. Because these dots sit 13 to
23 units from the camera, a size of 0.02 would be under a pixel wide and almost
invisible. 0.15 lands them at roughly 2-5 px on screen. Easy to tune here.
*/
const PARTICLE_SIZE = 0.15;
// Fixed seed for the random generator, so the layout never changes between
// renders or between the server and the browser.
const PARTICLE_SEED = 42;
// The palette each particle picks its colour from.
const PARTICLE_COLORS: string[] = [
  "#3b82f6",
  "#06b6d4",
  "#60a5fa",
  "#bfdbfe",
];
// The spawn area the dots are scattered across.
const PARTICLE_SPREAD_X = 15;
const PARTICLE_SPREAD_Y = 10;
// Particles stay between this and the camera, so they never fly past it.
const PARTICLE_Z_NEAR = -5;
const PARTICLE_Z_FAR = -15;
// Alpha range, so some dots are faint and some stand out.
const PARTICLE_ALPHA_MIN = 0.4;
const PARTICLE_ALPHA_MAX = 0.9;
// How fast the whole cloud sways. Very slow on purpose.
const DRIFT_SPEED = 0.05;
// How far the cloud is allowed to tilt and slide, in radians and world units.
const DRIFT_ROTATION_Y = 0.15;
const DRIFT_ROTATION_Z = 0.1;
const DRIFT_POSITION_Y = 0.5;

/* BLOOM SETTINGS (tune here) */
/*
"auto"  = bloom only on devices that can afford it (the default)
"on"    = always bloom, except when the visitor prefers reduced motion.
          Set to "on" to preview bloom on a low-power laptop.
"off"   = never bloom
*/
const BLOOM_MODE: "auto" | "on" | "off" = "auto";
// How strong the glow is.
const BLOOM_INTENSITY = 0.7;
/*
Anything brighter than this threshold glows. Blue and cyan are dark colours
(perceived luminance of roughly 0.2 to 0.3), so at 0.6 mostly the brightest
highlights and the light coloured particles will glow, not the shapes
themselves. If the shapes should glow, lower this towards 0.3 or raise the
shapes' emissiveIntensity.
*/
const BLOOM_LUMINANCE_THRESHOLD = 0.6;
// Softens the edge between "no glow" and "glow".
const BLOOM_LUMINANCE_SMOOTHING = 0.4;
// How far the blur spreads.
const BLOOM_RADIUS = 0.7;
// How many blur levels. Fewer levels = cheaper. Pass it explicitly so a library
// update can never silently change how expensive this is.
const BLOOM_LEVELS = 6;
/*
Anti-aliasing for the composer. Once the composer is active it renders the scene
into its own buffers, so the Canvas antialias: true no longer applies and shape
edges can look slightly jagged. 0 is the cheapest; try 2 to 4 if the edges look
bad on your screen.
*/
const BLOOM_MULTISAMPLING = 0;
// Bloom is skipped on machines at or below this many CPU cores.
const LOW_POWER_MAX_CORES = 4;
/* SCROLL PARALLAX SETTINGS (tune here) */
/*
All of these are in world units. Because the scene uses a perspective camera,
the same world offset looks smaller on screen for far away objects (the
particles sit about 18 units from the camera, the shapes about 8 to 11), which
is exactly what makes the depth illusion work.
The scene reaches its full effect after one viewport of scrolling, then clamps.
*/
// The shapes are the nearest layer, so they travel the furthest and read as
// the foreground.
const PARALLAX_SHAPES_Y = 1.5;
// The particles are the far layer, so they move much less.
const PARALLAX_PARTICLES_Y = 0.6;
// The camera drops a little as you scroll, which pushes the layers up on
// screen and adds to the feeling of looking down at the scene.
const PARALLAX_CAMERA_Y = 0.8;
// A small push back for depth. The shapes stay centred because the camera
// moves less than they do.
const PARALLAX_CAMERA_Z = 1.5;
// Smoothing for the single scroll value. A touch snappier than the mouse lerp
// so the scroll does not feel laggy.
const SCROLL_LERP_FACTOR = 0.08;

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
- The 180 dust particles are one <points> object (a single draw call) built
  from data generated once in a useMemo, so they add almost no cost.
- Bloom only mounts when the device is allowed to have it (see BLOOM_MODE and
  the low power check), so weaker machines never create its extra buffers.
- It is a single Bloom effect with multisampling 0, which is the cheapest
  useful post-processing setup. No other effects are added.
- Scroll parallax uses passive listeners (they never block scrolling), writes
  into refs instead of state (so scrolling never re-renders React), smooths the
  scroll value in exactly one place, and allocates nothing per frame.
*/

// A tiny seeded random number generator (mulberry32).
// It gives us "random looking" numbers that are always the same sequence for
// the same seed, which keeps the particle layout stable and keeps React happy
// (Math.random() during render is not allowed).
function mulberry32(seed: number): () => number {
  let state = seed;

  return () => {
    state += 0x6d2b79f5;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ParticlesProps {
  animate: boolean;
}

function Particles({ animate }: ParticlesProps) {
  const pointsRef = useRef<Points>(null);
  // Seconds of animation, accumulated from delta
  const elapsed = useRef(0);

  // Build the particle data once. useMemo with an empty dependency list means
  // this only runs on the first render, not on every frame.
  const { positions, colors } = useMemo(() => {
    const random = mulberry32(PARTICLE_SEED);

    // three Float32Arrays: one value per axis, one value per colour channel
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 4);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Step 1: scatter the particle across the area, with the depth (z) also
      // being random. That random depth is what makes far dots look smaller.
      positions[i * 3] = (random() * 2 - 1) * PARTICLE_SPREAD_X;
      positions[i * 3 + 1] = (random() * 2 - 1) * PARTICLE_SPREAD_Y;
      positions[i * 3 + 2] =
        PARTICLE_Z_NEAR + random() * (PARTICLE_Z_FAR - PARTICLE_Z_NEAR);

      // Step 2: pick one palette colour. new Color(hex) also converts the hex
      // from sRGB to the linear values three.js expects for lighting.
      const color = new Color(PARTICLE_COLORS[Math.floor(random() * PARTICLE_COLORS.length)]);
      colors[i * 4] = color.r;
      colors[i * 4 + 1] = color.g;
      colors[i * 4 + 2] = color.b;

      // Step 3: a random alpha (the 4th channel) mixes faint and bright dots
      colors[i * 4 + 3] =
        PARTICLE_ALPHA_MIN + random() * (PARTICLE_ALPHA_MAX - PARTICLE_ALPHA_MIN);
    }

    return { positions, colors };
  }, []);

  useFrame((_state, delta) => {
    if (!animate) return;

    // delta is the seconds since the last frame, so adding it up makes the
    // sway run at the same speed on a 30, 60 or 144 FPS screen.
    elapsed.current += delta;

    // Only the whole cloud moves. Touching 180 individual particles every
    // frame would be wasteful, and rotating the parent does the same job.
    if (!pointsRef.current) return;

    pointsRef.current.rotation.y =
      Math.sin(elapsed.current * DRIFT_SPEED) * DRIFT_ROTATION_Y;
    pointsRef.current.rotation.z =
      Math.sin(elapsed.current * DRIFT_SPEED * 0.6) * DRIFT_ROTATION_Z;
    pointsRef.current.position.y =
      Math.sin(elapsed.current * DRIFT_SPEED * 1.5) * DRIFT_POSITION_Y;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        {/* itemSize 3 = x, y, z per particle */}
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        {/* itemSize 4 = red, green, blue, alpha per particle */}
        <bufferAttribute attach="attributes-color" args={[colors, 4]} />
      </bufferGeometry>
      {/* vertexColors reads the colour attribute above, depthWrite={false}
          stops transparent dots from fighting each other, and toneMapped={false}
          keeps the exact palette colours instead of tone mapping them. */}
      <pointsMaterial
        size={PARTICLE_SIZE}
        sizeAttenuation
        vertexColors
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}

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
  progressRef: RefObject<number>;
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
function CameraRig({ enabled, progressRef }: CameraRigProps) {
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

    // Step 3: where the camera wants to be this frame. The scroll offsets are
    // added here, in the one place that owns the camera position, so nothing
    // else can fight over it. The existing lerp below smooths these too, so
    // the scroll motion needs no extra smoothing of its own.
    target.set(
      CAMERA_BASE[0] + mouseX * PARALLAX_X,
      CAMERA_BASE[1] +
        mouseY * PARALLAX_Y -
        progressRef.current * PARALLAX_CAMERA_Y,
      CAMERA_BASE[2] + progressRef.current * PARALLAX_CAMERA_Z
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

interface ScrollRigProps {
  progressRef: RefObject<number>;
  enabled: boolean;
}

/*
Scroll parallax, in one place.

ScrollRig owns the only scroll listener on the page. It measures how far the
Hero has been scrolled (0 to 1), smooths that number, and writes it into a
shared ref. Everything else just reads the ref, so there is only ever one
smoothing step and the layers can never drift out of sync with each other.

The value lives in a ref and not in state on purpose: scrolling must never
trigger a React re-render.
*/
function ScrollRig({ progressRef, enabled }: ScrollRigProps) {
  // The raw, not yet smoothed measurement (0 to 1)
  const target = useRef(0);

  useEffect(() => {
    // Reduced motion, or disabled for any other reason: stay at the top
    if (!enabled) {
      target.current = 0;
      progressRef.current = 0;
      return;
    }

    const update = () => {
      // How many viewports have been scrolled, clamped between 0 and 1 so the
      // effect stops once the Hero has been scrolled past
      target.current = Math.min(
        Math.max(window.scrollY / window.innerHeight, 0),
        1
      );
    };

    update();
    // Copy it straight over on mount. Without this, reloading the page halfway
    // down would start at 0 and then swoosh into place.
    progressRef.current = target.current;

    // passive: true means we never call preventDefault(), so the browser never
    // has to wait for us before scrolling
    window.addEventListener("scroll", update, { passive: true });
    // innerHeight changes when the browser bars show or hide on mobile, which
    // would otherwise make the progress jump
    window.addEventListener("resize", update, { passive: true });

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [enabled, progressRef]);

  // Priority -1 makes this run before every other useFrame callback in the same
  // frame, so CameraRig and ScrollGroup read a freshly smoothed value. Only a
  // positive priority would take over R3F's render loop, so -1 is safe.
  useFrame((_state, delta) => {
    if (!enabled) return;

    // Same frame-rate independent formula as the mouse lerp: delta is the
    // seconds since the last frame, so raising it to a power gives the same
    // feel at 30, 60 or 144 FPS.
    const t = 1 - Math.pow(1 - SCROLL_LERP_FACTOR, delta * 60);

    // Ease the current value towards the measured one
    progressRef.current += (target.current - progressRef.current) * t;
  }, -1);

  return null;
}

interface ScrollGroupProps {
  progressRef: RefObject<number>;
  factor: number;
  children: ReactNode;
}

/*
Wraps a layer of the scene in a group that slides up as the page scrolls.

Using a parent group instead of editing each layer keeps the code simple: the
child keeps its own local motion (the particles still sway, the shapes still
rotate) and the two motions compose. A positive factor moves the layer up
because progress grows from 0 to 1.
*/
function ScrollGroup({ progressRef, factor, children }: ScrollGroupProps) {
  const groupRef = useRef<Group>(null);

  useFrame(() => {
    if (!groupRef.current) return;

    groupRef.current.position.y = progressRef.current * factor;
  });

  return <group ref={groupRef}>{children}</group>;
}

// Decides whether this machine should skip bloom.
// It takes the existing renderer as an argument so we can read the GPU name
// from the context R3F already created (no second WebGL context).
function isLowPowerDevice(gl: WebGLRenderer): boolean {
  // Rule 1: few CPU cores usually means a laptop with integrated graphics
  if (
    typeof navigator.hardwareConcurrency === "number" &&
    navigator.hardwareConcurrency <= LOW_POWER_MAX_CORES
  ) {
    return true;
  }

  // Rule 2: Intel HD / UHD graphics are the chips we want to stay away from
  try {
    const context = gl.getContext();
    // This extension is how a browser exposes the real GPU name. It is often
    // blocked for privacy, in which case we simply cannot tell.
    const debugInfo = context.getExtension("WEBGL_debug_renderer_info") as {
      UNMASKED_RENDERER_WEBGL: number;
    } | null;

    if (!debugInfo) return false;

    const gpuName = String(
      context.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
    );

    return /intel.*(hd|uhd)/i.test(gpuName);
  } catch {
    // Reading the GPU name can throw, and "we do not know" must never mean
    // "turn the effect off", so we treat a failed lookup as not low power.
    return false;
  }
}

interface PostEffectsProps {
  reduceMotion: boolean;
}

/*
Bloom is the only post-processing effect in this scene. It is the expensive
part: the EffectComposer renders the scene into its own frame buffers and then
runs extra full screen passes. So it only mounts when the device and the
visitor allow it, and returning null means a low power machine pays nothing.
*/
function PostEffects({ reduceMotion }: PostEffectsProps) {
  // Reuse the renderer that React Three Fiber already made for this Canvas
  const gl = useThree((state) => state.gl);

  // Decided once instead of on every frame. useMemo keeps it stable, so the
  // composer is not rebuilt needlessly.
  const enableBloom = useMemo(() => {
    // 1. Explicitly switched off
    if (BLOOM_MODE === "off") return false;

    // 2. Accessibility wins over everything else
    if (reduceMotion) return false;

    // 3. Forced on, for previewing bloom on a low power laptop
    if (BLOOM_MODE === "on") return true;

    // 4. Otherwise use the hardware check
    return !isLowPowerDevice(gl);
  }, [gl, reduceMotion]);

  // Nothing is mounted, so no render targets and no extra passes are created
  if (!enableBloom) return null;

  return (
    /*
    No normal pass: this version of the library only creates one when
    enableNormalPass is passed (the old disableNormalPass prop is gone), and
    bloom does not need normals.
    */
    <EffectComposer multisampling={BLOOM_MULTISAMPLING}>
      <Bloom
        intensity={BLOOM_INTENSITY}
        luminanceThreshold={BLOOM_LUMINANCE_THRESHOLD}
        luminanceSmoothing={BLOOM_LUMINANCE_SMOOTHING}
        mipmapBlur
        radius={BLOOM_RADIUS}
        levels={BLOOM_LEVELS}
        blendFunction={BlendFunction.SCREEN}
      />
    </EffectComposer>
  );
}

export default function HeroScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  // Smoothed scroll progress from 0 to 1, shared by every scroll parallax
  // consumer. A ref, not state, so scrolling never re-renders React.
  const scrollProgress = useRef(0);
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
        {/* decay={0} keeps the blue rim light strong at this distance */}
        <pointLight
          position={[-5, -5, 5]}
          color="#3b82f6"
          intensity={Math.PI}
          decay={0}
        />

        {/* Procedural environment: two coloured light panels give the metallic
            shapes soft reflections without loading any HDR file */}
        <Environment resolution={32} frames={1}>
          <Lightformer
            form="rect"
            intensity={2}
            color="#3b82f6"
            position={[-3, 2, 2]}
            scale={[6, 6, 1]}
          />
          <Lightformer
            form="rect"
            intensity={1.5}
            color="#06b6d4"
            position={[3, -2, 2]}
            scale={[6, 6, 1]}
          />
        </Environment>

        {/* Scroll parallax comes first so it smooths the value before the other
            rigs read it in the same frame */}
        <ScrollRig progressRef={scrollProgress} enabled={!reduceMotion} />

        {/* Mouse parallax camera. Disabled when the visitor prefers reduced motion. */}
        <CameraRig enabled={!reduceMotion} progressRef={scrollProgress} />

        {/* Depth is handled by the particle z positions (-15 to -5), so these sit
            behind the shapes without relying on JSX order. The far layer scrolls
            slower than the shapes below it. */}
        <ScrollGroup progressRef={scrollProgress} factor={PARALLAX_PARTICLES_Y}>
          <Particles animate={!reduceMotion} />
        </ScrollGroup>

        <ScrollGroup progressRef={scrollProgress} factor={PARALLAX_SHAPES_Y}>
          <Shapes />
        </ScrollGroup>

        {/* Bloom goes last, so it is the final step before the screen */}
        <PostEffects reduceMotion={reduceMotion} />
      </Canvas>
    </div>
  );
}