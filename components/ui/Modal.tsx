"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  /** id of the heading rendered inside children, used by aria-labelledby */
  titleId: string;
  children: ReactNode;
};

/*
Everything keyboard focus can land on inside the panel. The -1 on tabindex
skips elements like the panel itself, which is only focusable so it can be
clicked.
*/
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/*
A shared, accessible dialog used by the Achievements cards and the Gallery
tiles.

Accessibility behaviour, all handled here so callers do not repeat it:
- role="dialog" + aria-modal tells screen readers this is a modal window.
- aria-labelledby points at the heading the caller renders with titleId.
- Focus moves to the close button when the dialog opens and returns to the
  element that opened it when it closes.
- Tab and Shift+Tab cycle inside the dialog and cannot escape it.
- Escape closes, and so does a click that started on the backdrop.
- Page scrolling is locked while it is open, so the page behind cannot move.
*/
export default function Modal({ open, onClose, titleId, children }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  // Set on the next frame after mount, so the entrance transition can play.
  const [entered, setEntered] = useState(false);
  // True only when the pointer went down on the backdrop itself. Without this,
  // a drag that starts inside the panel and ends on the backdrop would close.
  const pressedOnBackdrop = useRef(false);

  // Start hidden again every time the dialog opens, so the entrance animation
  // replays each time. This adjusts state during render rather than inside an
  // effect on purpose: React re-runs the component immediately without
  // committing anything to the DOM, which avoids an extra render pass.
  const [wasOpen, setWasOpen] = useState(open);
  if (open !== wasOpen) {
    setWasOpen(open);
    setEntered(false);
  }

  // Entrance animation. Starting hidden and flipping a state one frame later is
  // what makes the browser animate between the two classes.
  useEffect(() => {
    if (!open) return;

    const frame = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Move focus into the dialog on open, and give it back on close.
  useEffect(() => {
    if (!open) return;

    // Remember where focus came from, so it can be restored later.
    const opener = document.activeElement;

    closeButtonRef.current?.focus();

    return () => {
      // isConnected is false if the opener was removed while we were open.
      if (opener instanceof HTMLElement && opener.isConnected) {
        opener.focus();
      }
    };
  }, [open]);

  // Lock page scrolling while the dialog is open.
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const previousOverflow = body.style.overflow;
    const previousPaddingRight = body.style.paddingRight;

    // Hiding the scrollbar makes the page wider, which would shift the layout.
    // Adding back exactly the width the scrollbar took prevents that jump.
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPaddingRight;
    };
  }, [open]);

  // Keyboard handling: Escape closes, Tab is trapped inside the panel.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const panel = panelRef.current;
      if (!panel) return;

      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      // If focus somehow ended up outside the panel, pull it back in.
      const outside = !(active instanceof HTMLElement) || !panel.contains(active);

      // Wrap around: last -> first on Tab, first -> last on Shift+Tab.
      if (event.shiftKey) {
        if (active === first || outside) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last || outside) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Nothing is rendered while closed, so this component only reaches the DOM
  // after a click, which is what makes createPortal safe here.
  if (!open) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm transition-opacity duration-300 motion-reduce:transition-none ${
        entered ? "opacity-100" : "opacity-0"
      }`}
      onPointerDown={(event) => {
        pressedOnBackdrop.current = event.target === event.currentTarget;
      }}
      onClick={() => {
        if (pressedOnBackdrop.current) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-zinc-900 p-6 shadow-2xl shadow-brand-primary/20 transition-all duration-300 motion-reduce:transition-none ${
          entered ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close button. It is the first thing focused, so it must come first
            in the DOM even though it sits in the top-right corner. */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-zinc-800 text-zinc-300 transition-colors duration-300 hover:border-brand-primary/50 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
        >
          <svg
            aria-hidden="true"
            className="h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>

        {children}
      </div>
    </div>,
    document.body
  );
}