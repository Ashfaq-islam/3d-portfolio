"use client";

import Image from "next/image";
import { useState } from "react";
import { BLUR_DATA_URL } from "@/lib/images";

type PhotoWithFallbackProps = {
  /** Path in /public, e.g. "/hero-photo.jpg" */
  src: string;
  /** Meaningful description of the photo for screen readers */
  alt: string;
  width: number;
  height: number;
  /** Tells Next.js how wide the image will render, so it can pick a size */
  sizes: string;
  /** Only for images above the fold (the Hero photo) */
  priority?: boolean;
  /** Emoji shown while the photo is missing */
  placeholderEmoji?: string;
  /** Small caption under the emoji */
  placeholderLabel?: string;
  /** Defaults to "h-full w-full object-cover", which fills the parent box */
  className?: string;
};

/*
Shows a real photo, and swaps in a styled placeholder if the file is missing.

Why this is a client component: we need to know whether the image failed to
load, and that only happens in the browser. The check itself is done by the
browser through the onError event, so there is no server side file check and
no filesystem access at all.

The parent decides the aspect ratio and the corners; this component only fills
whatever box it is given (h-full w-full object-cover).
*/
export default function PhotoWithFallback({
  src,
  alt,
  width,
  height,
  sizes,
  priority = false,
  placeholderEmoji = "👤",
  placeholderLabel = "Your Photo",
  className = "h-full w-full object-cover",
}: PhotoWithFallbackProps) {
  const [failed, setFailed] = useState(false);

  // The photo is not there (yet). Show the placeholder instead.
  if (failed) {
    return (
      <div
        role="img"
        aria-label={placeholderLabel}
        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-brand-primary/20 via-brand-secondary/10 to-zinc-900"
      >
        <span aria-hidden="true" className="text-6xl md:text-7xl">
          {placeholderEmoji}
        </span>
        <span className="text-sm text-zinc-400">{placeholderLabel}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      placeholder="blur"
      blurDataURL={BLUR_DATA_URL}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}