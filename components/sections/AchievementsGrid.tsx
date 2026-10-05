"use client";

import Image from "next/image";
import { useId, useState } from "react";
import Modal from "@/components/ui/Modal";
import { BLUR_DATA_URL } from "@/lib/images";

export interface Achievement {
  id: string;
  title: string;
  position: string;
  date: string;
  location: string;
  emoji: string;
  description: string;
  /** Optional photo path in /public, e.g. "/achievement-1.jpg" */
  image?: string;
}

/*
Background gradients cycled through so the cards do not all look identical.

These are written out as complete strings on purpose: Tailwind scans the source
code for class names, so a class name built at runtime (like
`bg-${color}`) would never be found and the style would silently disappear.
*/
const CARD_GRADIENTS = [
  "bg-gradient-to-br from-brand-primary/25 via-brand-secondary/10 to-zinc-900",
  "bg-gradient-to-br from-brand-secondary/25 via-brand-primary/10 to-zinc-900",
  "bg-gradient-to-br from-brand-light/20 via-brand-primary/10 to-zinc-900",
  "bg-gradient-to-br from-brand-glow/20 via-brand-secondary/10 to-zinc-900",
];

type AchievementsGridProps = {
  achievements: Achievement[];
};

export default function AchievementsGrid({ achievements }: AchievementsGridProps) {
  // Which card is open in the dialog. null means the dialog is closed.
  const [selected, setSelected] = useState<Achievement | null>(null);
  // A unique id for the dialog heading, so aria-labelledby always points at
  // exactly one element even with several grids on the page.
  const titleId = useId();

  return (
    <>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {achievements.map((item, index) => (
          // A <button>, not a <div onClick>: keyboard and screen reader users
          // can then open the dialog with Enter or Space for free.
          //
          // Everything inside is a <span>, because a button may only contain
          // phrasing content.
          <button
            key={item.id}
            type="button"
            onClick={() => setSelected(item)}
            aria-haspopup="dialog"
            className="group w-full rounded-2xl border border-white/10 bg-zinc-900/50 p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:border-brand-primary/50 hover:shadow-xl hover:shadow-brand-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
          >
            <span
              className={`relative flex aspect-video items-center justify-center overflow-hidden rounded-xl ${CARD_GRADIENTS[index % CARD_GRADIENTS.length]}`}
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="text-6xl transition-transform duration-300 group-hover:scale-110 md:text-7xl"
                >
                  {item.emoji}
                </span>
              )}
            </span>

            <span className="mt-4 block text-lg font-bold text-white">
              {item.title}
            </span>
            <span className="mt-1 block text-sm font-medium text-brand-primary">
              {item.position}
            </span>
            <span className="mt-1 block text-sm text-zinc-400">
              {item.date} &bull; {item.location}
            </span>
          </button>
        ))}
      </div>

      {/*
        The dialog only exists in the DOM while a card is selected, which is
        what lets the Modal render through a portal into document.body.
      */}
      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        titleId={titleId}
      >
        {selected && (
          <div>
            <span
              className={`relative flex aspect-video items-center justify-center overflow-hidden rounded-xl ${CARD_GRADIENTS[achievements.indexOf(selected) % CARD_GRADIENTS.length]}`}
            >
              {selected.image ? (
                <Image
                  src={selected.image}
                  alt={selected.title}
                  fill
                  sizes="(min-width: 768px) 60vw, 90vw"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span aria-hidden="true" className="text-7xl md:text-8xl">
                  {selected.emoji}
                </span>
              )}
            </span>

            <h3 id={titleId} className="mt-6 text-2xl font-bold text-white">
              {selected.title}
            </h3>

            <p className="mt-1 font-medium text-brand-primary">
              {selected.position}
            </p>

            <p className="mt-1 text-sm text-zinc-400">
              {selected.date} &bull; {selected.location}
            </p>

            <p className="mt-4 leading-relaxed text-zinc-300">
              {selected.description}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}