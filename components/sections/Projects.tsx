interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  liveUrl: string;
  githubUrl: string;
  image?: string;
  emoji: string;
}

// TODO: Replace with real URLs and images
const projects: Project[] = [
  {
    id: 1,
    title: "3D Portfolio Website",
    description:
      "An interactive portfolio with 3D scenes, scroll animations, and a custom admin panel. Built as a showcase of modern web tech.",
    tags: ["Next.js", "React Three Fiber", "TypeScript", "TailwindCSS"],
    liveUrl: "#",
    githubUrl: "#",
    emoji: "🎨",
  },
  {
    id: 2,
    title: "E-Commerce Platform",
    description:
      "Full-stack e-commerce store with product catalog, cart, checkout, and admin dashboard. Features JWT authentication and Stripe integration.",
    tags: ["React", "Node.js", "MongoDB", "Stripe"],
    liveUrl: "#",
    githubUrl: "#",
    emoji: "🛒",
  },
  {
    id: 3,
    title: "Task Manager App",
    description:
      "Productivity app for managing tasks with drag-and-drop boards, real-time sync, and team collaboration. Includes dark mode and keyboard shortcuts.",
    tags: ["Next.js", "Prisma", "PostgreSQL", "WebSockets"],
    liveUrl: "#",
    githubUrl: "#",
    emoji: "✅",
  },
];

export default function Projects() {
  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="bg-zinc-950 py-24 px-6 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <header className="mb-12">
          <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary" />

          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-brand-primary">
            My Work
          </p>

          <h2
            id="projects-heading"
            className="text-3xl font-bold tracking-tight text-white md:text-4xl"
          >
            Featured Projects
          </h2>

          <p className="mt-4 text-zinc-400">Some things I&apos;ve built</p>
        </header>

        {/* One card per project */}
        <div className="space-y-12 md:space-y-16">
          {projects.map((project, index) => {
            // Odd projects flip the image to the right on desktop only
            const isReversed = index % 2 !== 0;

            return (
              <article
                key={project.id}
                className="group rounded-2xl border border-white/10 bg-zinc-900/50 p-6 transition-all duration-300 hover:scale-[1.02] hover:border-brand-primary/50 hover:shadow-xl hover:shadow-brand-primary/10 md:p-8"
              >
                <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-2 md:gap-12">
                  {/* Screenshot placeholder */}
                  <div className={isReversed ? "md:order-2" : "md:order-1"}>
                    {/* TODO: Replace the emoji placeholder with a real screenshot using next/image when project.image exists */}
                    <div
                      role="img"
                      aria-label={`${project.title} preview`}
                      className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-brand-primary/20 via-brand-secondary/10 to-zinc-900"
                    >
                      <span
                        aria-hidden="true"
                        className="text-6xl transition-transform duration-300 group-hover:scale-110 md:text-7xl"
                      >
                        {project.emoji}
                      </span>
                    </div>
                  </div>

                  {/* Title, description, tags and links */}
                  <div className={isReversed ? "md:order-1" : "md:order-2"}>
                    <h3 className="text-2xl font-bold text-white">{project.title}</h3>

                    <p className="mt-4 leading-relaxed text-zinc-400">
                      {project.description}
                    </p>

                    <ul className="mt-6 flex flex-wrap gap-2">
                      {project.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full border border-white/10 bg-zinc-900 px-3 py-1 text-xs text-zinc-300 transition-colors duration-300 hover:border-brand-primary/50 md:text-sm"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 flex flex-wrap gap-4">
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Live demo of ${project.title}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary px-6 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-primary/25"
                      >
                        Live Demo →
                      </a>

                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Source code of ${project.title}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 font-medium text-white transition-colors duration-300 hover:border-brand-primary/50 hover:text-brand-accent"
                      >
                        <svg
                          aria-hidden="true"
                          className="h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.3-.54-1.53.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.63-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
                        </svg>
                        Source Code
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Link to the full project list */}
        <div className="mt-12 text-center md:mt-16">
          {/* TODO: Replace with real GitHub profile URL */}
          <a
            href="https://github.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 transition-colors duration-300 hover:text-brand-accent hover:underline"
          >
            View more on GitHub →
          </a>
        </div>
      </div>
    </section>
  );
}