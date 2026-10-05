"use client";

/*
HOW TO TEST THIS TEMPORARILY
1. Open app/page.tsx
2. Add: import RotatingCube from "@/components/three/RotatingCube";
3. Render <RotatingCube /> anywhere inside the returned JSX, then run `pnpm dev`
   and check that a purple cube is rotating on the page.
4. Delete the import and the tag when you are done testing.
If the cube does not appear, check that the wrapper <div> has an explicit height.
*/

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

// A single cube that spins on every animation frame
function Cube() {
  // useRef gives us a direct handle to the three.js mesh object
  const meshRef = useRef<Mesh>(null);

  // useFrame runs before every render frame.
  // delta is the time (in seconds) since the last frame, so multiplying by it
  // keeps the rotation speed the same on 60Hz and 120Hz screens.
  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    meshRef.current.rotation.x += delta * 0.5;
    meshRef.current.rotation.y += delta * 0.5;
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1.5, 1.5, 1.5]} />
      <meshStandardMaterial color="#a855f7" />
    </mesh>
  );
}

export default function RotatingCube() {
  return (
    // The Canvas fills its parent, so the parent needs a real height.
    // The background stays transparent to match the page.
    <div className="h-[400px] w-full">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={Math.PI} decay={0} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} />

        <Cube />
      </Canvas>
    </div>
  );
}