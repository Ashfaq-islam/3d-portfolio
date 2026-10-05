"use client";

import PhotoWithFallback from "@/components/ui/PhotoWithFallback";
import { useEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

// How far the card leans at its most extreme, in degrees. Keep it small: a big
// tilt looks flashy but makes the photo hard to read.
const MAX_TILT_DEG = 5;

// Short while the pointer is moving (so it feels connected to the mouse) and
// slow when it snaps back to flat.
const MOVE_TRANSITION_MS = 150;
const RESET_TRANSITION_MS = 500;

// The OS level "reduce motion" setting.
const REDUCE_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type TiltPhotoCardProps = {
  src: string;
  alt: string;
};

/*
A portrait photo card that leans towards the pointer, with no library and no
React state.

WHY NO STATE. Writing the pointer position into React state would re-render the
component on every single mouse move, which is exactly what makes cheap
"3D tilt" effects stutter on a laptop like an Intel i5-7200U. Instead the
handler only writes numbers into a ref and schedules one animation frame, so
React does no work at all while the mouse moves.

The transform is written straight onto the DOM node instead.
*/
export default function TiltPhotoCard({ src, alt }: TiltPhotoCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  // Latest pointer position, normalised. Read inside the animation frame.
  const pointer = useRef({ x: 0, y: 0 });
  // The pending frame id, so we never queue two frames for one movement.
  const frameRef = useRef<number | null>(null);
  // Read inside the pointer handlers without re-creating them.
  const reduceMotionRef = useRef(false);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia(REDUCE_MOTION_QUERY).matches;

    // A frame that is still queued when the card goes away must be cancelled,
    // otherwise it would fire against an unmounted node.
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, []);

  // Applies a transform on the next frame, collapsing many pointer events into
  // a single style write per frame.
  function scheduleTransform(
    transform: string,
    durationMs: number,
    options: { priority?: boolean } = {}
  ) {
    const card = cardRef.current;
    if (!card) return;

    // Movement updates are skipped while a frame is already queued, because the
    // newest pointer position is already the one being written. A reset is
    // different: if the pointer leaves while a move is still queued, that move
    // would land last and leave the card stuck tilted. So a reset cancels the
    // pending frame and is always the last write.
    if (frameRef.current !== null) {
      if (!options.priority) return;
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      card.style.transition = `transform ${durationMs}ms ease-out`;
      card.style.transform = transform;
      frameRef.current = null;
    });
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    // Touch has no hover position to follow, and reduced motion means no tilt.
    if (event.pointerType === "touch" || reduceMotionRef.current) return;

    // Where is the pointer inside the card? getBoundingClientRect gives the
    // card's position and size on screen right now.
    const rect = event.currentTarget.getBoundingClientRect();

    // Turn the pixel position into -0.5 ... 0.5 on each axis:
    // -0.5 is the left/top edge, 0 is dead centre, +0.5 is the right/bottom
    // edge. Dividing by the size is what makes it resolution independent.
    pointer.current.x = (event.clientX - rect.left) / rect.width - 0.5;
    pointer.current.y = (event.clientY - rect.top) / rect.height - 0.5;

    // TILT MATH
    // Multiplying by 2 means a pointer at the very edge (-0.5 or +0.5) gives
    // the full MAX_TILT_DEG, and dead centre gives 0 degrees.
    // rotateY spins around the vertical axis (the card turns left/right).
    // rotateX spins around the horizontal axis, and it is negated because
    // moving the pointer up should tip the top of the card away from you.
    const rotateY = pointer.current.x * 2 * MAX_TILT_DEG;
    const rotateX = -pointer.current.y * 2 * MAX_TILT_DEG;

    scheduleTransform(
      `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
      MOVE_TRANSITION_MS
    );
  }

  function handlePointerLeave() {
    pointer.current.x = 0;
    pointer.current.y = 0;
    // priority: true, so the reset cannot be dropped by a queued move frame.
    scheduleTransform("rotateX(0deg) rotateY(0deg)", RESET_TRANSITION_MS, {
      priority: true,
    });
  }

  return (
    // perspective on the parent is what turns a flat div into a 3D space.
    <div
      className="flex justify-center"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={cardRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-brand-primary/30"
      >
        <PhotoWithFallback
          src={src}
          alt={alt}
          width={800}
          height={1000}
          sizes="(min-width: 768px) 40vw, 260px"
          priority
          placeholderLabel="Your Photo"
        />
      </div>
    </div>
  );
}