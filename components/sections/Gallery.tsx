import GalleryGrid from "@/components/sections/GalleryGrid";
import type { GalleryPhoto } from "@/components/sections/GalleryGrid";

/*
Placeholder content. Edit the captions as the real ones come in, and uncomment
the image line on any tile once the photo exists in /public.
*/
const photos: GalleryPhoto[] = [
  {
    id: "college-fest-2024",
    caption: "College Fest 2024",
    emoji: "🎤",
    date: "Date coming soon",
    aspect: "portrait",
    // image: "/gallery-1.jpg",
  },
  {
    id: "hackathon-night",
    caption: "Hackathon Night",
    emoji: "💻",
    date: "Date coming soon",
    aspect: "landscape",
    // image: "/gallery-2.jpg",
  },
  {
    id: "team-meetup",
    caption: "Team Meetup",
    emoji: "🤝",
    date: "Date coming soon",
    aspect: "square",
    // image: "/gallery-3.jpg",
  },
  {
    id: "programming-contest",
    caption: "Programming Contest",
    emoji: "🏆",
    date: "Date coming soon",
    aspect: "landscape",
    // image: "/gallery-4.jpg",
  },
  {
    id: "it-club-workshop",
    caption: "IT Club Workshop",
    emoji: "🛠️",
    date: "Date coming soon",
    aspect: "portrait",
    // image: "/gallery-5.jpg",
  },
  {
    id: "sports-meet",
    caption: "Sports Meet",
    emoji: "🥇",
    date: "Date coming soon",
    aspect: "square",
    // image: "/gallery-6.jpg",
  },
  {
    id: "campus-life",
    caption: "Campus Life",
    emoji: "🎓",
    date: "Date coming soon",
    aspect: "portrait",
    // image: "/gallery-7.jpg",
  },
  {
    id: "late-night-coding",
    caption: "Late-Night Coding",
    emoji: "🌙",
    date: "Date coming soon",
    aspect: "landscape",
    // image: "/gallery-8.jpg",
  },
  {
    id: "project-demo-day",
    caption: "Project Demo Day",
    emoji: "🚀",
    date: "Date coming soon",
    aspect: "square",
    // image: "/gallery-9.jpg",
  },
];

export default function Gallery() {
  return (
    <section
      id="gallery"
      aria-labelledby="gallery-heading"
      className="border-y border-white/10 bg-zinc-900/50 py-24 px-6 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading, same pattern as Projects and Contact */}
        <header className="mb-12">
          <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary" />

          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-brand-primary">
            Moments
          </p>

          <h2
            id="gallery-heading"
            className="text-3xl font-bold tracking-tight text-white md:text-4xl"
          >
            Photo Gallery
          </h2>

          <p className="mt-4 text-zinc-400">
            Snapshots from events, fests, and life
          </p>
        </header>

        {/* The tiles need state for the lightbox, so the grid is a client component */}
        <GalleryGrid photos={photos} />
      </div>
    </section>
  );
}