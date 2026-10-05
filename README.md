# 3D Portfolio Website

A personal portfolio built with Next.js and React Three Fiber. The Hero has a
lightweight 3D particle background, and the rest of the page is a dark,
blue/cyan themed one-page site with an About, Skills, Projects, Achievements,
Gallery, Contact and Footer section.

## Tech Stack

### Frontend

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript** (strict mode)
- **TailwindCSS 4** (CSS-first config, brand colours in `app/globals.css`)
- **React Three Fiber + drei + postprocessing** (Hero particle scene, Bloom)
- **three.js**

### Backend (planned, not built yet)

- **Node.js + Express**
- **MongoDB Atlas**
- **JWT authentication**

### Deployment (planned, nothing is live yet)

- **Vercel** (frontend)
- **Render** (backend, later phase)
- **MongoDB Atlas** (database, later phase)

## Getting Started

This project uses **pnpm**, not npm.

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Other useful commands:

```bash
pnpm build   # production build
pnpm start   # serve the production build
pnpm lint    # ESLint
```

### Environment variables

Copy the example file and fill in what you need:

```bash
cp .env.example .env.local
```

| Variable                | Where it is used                                   | Visibility                |
| ----------------------- | -------------------------------------------------- | ------------------------- |
| `NEXT_PUBLIC_SITE_URL`  | `app/layout.tsx` metadata (`metadataBase`, canonical) | Public — sent to the browser |
| `MONGODB_URI`           | Future backend only (not read anywhere yet)        | Server-only               |
| `JWT_SECRET`            | Future backend only (not read anywhere yet)        | Server-only               |

Anything named `NEXT_PUBLIC_*` is bundled into the browser, so never put a
secret behind that prefix. `MONGODB_URI` and `JWT_SECRET` are only ever read in
server code.

## Project Structure

```text
3d-portfolio/
├── app/                  # Next.js App Router pages, global CSS, layout
├── components/
│   ├── sections/         # About, Skills, Projects, Achievements, Gallery, Contact, Footer
│   ├── three/            # HeroScene (React Three Fiber) and helpers
│   └── ui/               # Shared pieces: Modal, PhotoWithFallback, TiltPhotoCard
├── lib/                  # Small shared helpers (e.g. image data URLs)
├── public/               # Static assets (photos, resume.pdf)
└── .env.example          # Template for environment variables
```

## Deployment

**Nothing is deployed yet.** The site currently runs only on your machine, and
the backend and database do not exist. The contact form validates and logs to
the console instead of sending anything. This section is the plan to follow when
you are ready to publish.

### 1. Frontend — Vercel

1. Push the project to a GitHub repository.
2. Go to [vercel.com](https://vercel.com), import the repository.
3. Vercel detects Next.js and reads the framework preset automatically. It also
   detects **pnpm** from `pnpm-lock.yaml`, so install and build commands are
   filled in for you — do not change them.
4. Add one environment variable: `NEXT_PUBLIC_SITE_URL`, set to your production
   address (for example `https://your-site.vercel.app`).
5. Click **Deploy**. Every push to the main branch then redeploys automatically.

### 2. Backend — Render (future phase)

1. Create a **Web Service** connected to the same repository (or a separate one).
2. Fill in the build and start commands once the Express server exists, e.g.
   build `npm install`, start `node server.js` (placeholders for now).
3. Add the server-only environment variables `MONGODB_URI` and `JWT_SECRET` under
   *Environment* in the Render dashboard. Never commit them.
4. Allow the Vercel site URL in the backend's CORS settings, so the browser
   accepts requests from the live site.

### 3. Database — MongoDB Atlas (future phase)

1. Create a free **M0** cluster.
2. Create a database user with a strong password.
3. Configure **Network Access**. *Allow access from anywhere* (`0.0.0.0/0`) is
   the simplest option and fine for a hobby project, but it means the database
   can be reached from any IP — anyone who has your connection string can try to
   connect. Adding only your Render service's outbound IP is stricter and safer,
   but the IP can change, so you would have to update it when it does.
4. Copy the connection string into `MONGODB_URI` in Render (never in the repo).

### 4. After deploying

- Add your photos to `public/` (`hero-photo.jpg`, `about-photo.jpg`,
  `gallery-1.jpg` … `gallery-9.jpg`) and point the data arrays in the section
  files at them.
- Add `public/resume.pdf` so the About "Download CV" link works.
- Replace the placeholder `"#"` social URLs in `components/sections/Contact.tsx`
  and `components/sections/Footer.tsx`.

## License

MIT