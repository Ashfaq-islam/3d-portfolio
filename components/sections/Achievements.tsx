import AchievementsGrid from "@/components/sections/AchievementsGrid";
import type { Achievement } from "@/components/sections/AchievementsGrid";

/*
Placeholder content. Edit these entries as the real ones come in, and uncomment
the image line on any card once the photo exists in /public.
*/
const achievements: Achievement[] = [
  {
    id: "contest-2024",
    title: "Programming Contest",
    position: "1st Place",
    date: "2024",
    location: "Dhaka University",
    emoji: "🏆",
    description: "More details about this achievement coming soon.",
    // image: "/achievement-1.jpg",
  },
  {
    id: "hackathon-2023",
    title: "Hackathon",
    position: "Top 10",
    date: "2023",
    location: "BUET",
    emoji: "🚀",
    description: "More details about this achievement coming soon.",
    // image: "/achievement-2.jpg",
  },
  {
    id: "college-fest-2023",
    title: "College Fest",
    position: "Participant",
    date: "2023",
    location: "Notre Dame College",
    emoji: "🎉",
    description: "More details about this achievement coming soon.",
    // image: "/achievement-3.jpg",
  },
  {
    id: "sports-meet-2022",
    title: "Sports Meet",
    position: "Winner",
    date: "2022",
    location: "School",
    emoji: "🥇",
    description: "More details about this achievement coming soon.",
    // image: "/achievement-4.jpg",
  },
];

export default function Achievements() {
  return (
    <section
      id="achievements"
      aria-labelledby="achievements-heading"
      className="py-24 px-6 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading, same pattern as Projects and Contact */}
        <header className="mb-12">
          <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary" />

          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-brand-primary">
            Milestones
          </p>

          <h2
            id="achievements-heading"
            className="text-3xl font-bold tracking-tight text-white md:text-4xl"
          >
            Achievements &amp; Events
          </h2>

          <p className="mt-4 text-zinc-400">
            Highlights from contests, hackathons, and events
          </p>
        </header>

        {/* The cards need state for the dialog, so the grid is a client component */}
        <AchievementsGrid achievements={achievements} />
      </div>
    </section>
  );
}