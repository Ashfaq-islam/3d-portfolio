/*
Tiny image helpers shared by the photo components.

This file must stay safe to import from a client component: it only contains
plain string constants, no Node APIs and no file system access.
*/

/*
A 10x10 dark square, inlined as an SVG data URI.

next/image uses this as the "blur placeholder": a super small, super cheap
image that is shown immediately while the real photo downloads. Because it is
inlined in the JavaScript bundle there is no extra network request, and because
it is a flat colour it weighs almost nothing.

The SVG before it is encoded as base64:
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10">
    <rect width="10" height="10" fill="#18181b" />
  </svg>

#18181b is the same dark grey used by the surface tokens in globals.css, so the
placeholder blends into the page instead of flashing a white box.
*/
export const BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCI+PHJlY3Qgd2lkdGg9IjEwIiBoZWlnaHQ9IjEwIiBmaWxsPSIjMTgxODFiIi8+PC9zdmc+";