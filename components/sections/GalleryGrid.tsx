"use client";

import Image from "next/image";
import { useId, useState } from "react";
import Modal from "@/components/ui/Modal";
import { BLUR_DATA_URL } from "@/lib/images";

export interface GalleryPhoto {
  id: string;
  caption: string;
  emoji: string;
  date: string;
  /** Controls the tile shape, and the lightbox keeps the same shape */
  aspect: "portrait" | "landscape" | "square";
  /** Optional photo path in /public, e.g. "/gallery-1.jpg" */
  image?: string;
}

/*
Masonry layout with pure CSS, no JavaScript library.

`columns-1 sm:columns-2 lg:columns-3` makes the browser flow the tiles into 1, 2
or 3 vertical columns, and each tile has a different height (portrait, square,
landscape). CSS then pulls the next tile up into the gap under the shortest
column, which is what a masonry layout is.

Two details make it work:
- break-inside-avoid stops a tile from being split across two columns.
- mb-4 is the gutter. `gap-4` only sets the gap *between columns*, which is why
  the vertical spacing needs a margin on the tile itself.
*/

/*
Aspect ratio -> class name. Written as full strings, never assembled at
runtime, because Tailwind only generates the classes it can find in the source.
*/
const ASPECT_CLASSES: Record<GalleryPhoto["aspect"], string> = {
  portrait: "aspect-[3/4]",
  landscape: "aspect-[4/3]",
  square: "aspect-square",
};

// Gradients cycled through so neighbouring tiles do not look identical.
const TILE_GRADIENTS = [
  "bg-gradient-to-br from-brand-primary/25 via-brand-secondary/10 to-zinc-900",
  "bg-gradient-to-br from-brand-secondary/25 via-brand-primary/10 to-zinc-900",
  "bg-gradient-to-br from-brand-glow/20 via-brand-secondary/10 to-zinc-900",
  "bg-gradient-to-br from-brand-light/20 via-brand-primary/10 to-zinc-900",
];

type GalleryGridProps = {
  photos: GalleryPhoto[];
};

export default function GalleryGrid({ photos }: GalleryGridProps) {
  // Which tile is open in the lightbox. null means it is closed.
  const [selected, setSelected] = useState<GalleryPhoto | null>(null);
  // Unique id for the lightbox heading, used by aria-labelledby.
  const titleId = useId();

  return (
    <>
      <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {photos.map((photo, index) => (
          // mb-4 + break-inside-avoid are what turn these list items into the
          // staggered masonry look (see the note above).
          <li key={photo.id} className="mb-4 break-inside-avoid">
            <button
              type="button"
              onClick={() => setSelected(photo)}
              aria-haspopup="dialog"
              className="group relative block w-full overflow-hidden rounded-xl border border-white/10 transition-all duration-300 hover:border-brand-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
            >
              <span
                className={`relative flex w-full items-center justify-center overflow-hidden ${ASPECT_CLASSES[photo.aspect]} ${TILE_GRADIENTS[index % TILE_GRADIENTS.length]}`}
              >
                {photo.image ? (
                  <Image
                    src={photo.image}
                    alt={photo.caption}
                    fill
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    placeholder="blur"
                    blurDataURL={BLUR_DATA_URL}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="text-6xl transition-transform duration-300 group-hover:scale-110"
                  >
                    {photo.emoji}
                  </span>
                )}
              </span>

              {/*
                Caption scrim. Always visible below md, because a phone has no
                hover state and the caption is the only label the tile has.
                From md up it fades in on hover or keyboard focus only, so the
                grid stays clean until someone interacts with it.
              */}
              <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 pt-12 transition-opacity duration-300 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100">
                <span className="block text-sm font-semibold text-white">
                  {photo.caption}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      {/* Lightbox */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        titleId={titleId}
      >
        {selected && (
          <div>
            {/*
              The tile's own aspect ratio is kept so the lightbox feels like the
              same photo blown up. max-h-[70vh] stops a tall portrait from
              filling the whole screen, and object-contain on the image means it
              shrinks to fit instead of being squashed.
            */}
            <span
              className={`relative flex max-h-[70vh] w-full items-center justify-center overflow-hidden rounded-xl bg-zinc-950 ${ASPECT_CLASSES[selected.aspect]}`}
            >
              {selected.image ? (
                <Image
                  src={selected.image}
                  alt={selected.caption}
                  fill
                  sizes="(min-width: 768px) 60vw, 90vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span aria-hidden="true" className="text-7xl md:text-8xl">
                  {selected.emoji}
                </span>
              )}
            </span>

            <h3 id={titleId} className="mt-6 text-2xl font-bold text-white">
              {selected.caption}
            </h3>

            <p className="mt-1 text-sm text-zinc-400">{selected.date}</p>
          </div>
        )}
      </Modal>
    </>
  );
}