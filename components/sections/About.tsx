type Stat = {
  value: string;
  label: string;
};

const stats: Stat[] = [
  { value: "3+", label: "Years Coding" },
  { value: "10+", label: "Projects Built" },
];

export default function About() {
  return (
    <section id="about" aria-labelledby="about-heading" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        {/* Section heading */}
        <div className="mb-4 flex flex-col items-center md:items-start">
          <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-500" />
          <h2
            id="about-heading"
            className="text-center text-3xl font-bold tracking-tight text-white md:text-4xl"
          >
            About Me
          </h2>
        </div>

        <div className="mt-12 grid items-center gap-12 md:grid-cols-2 md:gap-16">
          {/* Image placeholder with gradient border and soft glow */}
          <div className="flex justify-center md:justify-start">
            <div className="relative isolate w-full max-w-[400px]">
              <div
                aria-hidden="true"
                className="absolute -inset-6 -z-10 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/20 blur-3xl md:-inset-10"
              />

              {/* TODO: Replace this placeholder with a real image using next/image */}
              <div
                role="img"
                aria-label="Photo of Ashfaq Islam"
                className="rounded-2xl bg-gradient-to-r from-purple-400 to-pink-500 p-[2px] transition-transform duration-300 hover:scale-[1.02]"
              >
                <div className="flex aspect-square items-center justify-center rounded-2xl bg-zinc-950">
                  <span aria-hidden="true" className="text-7xl md:text-8xl">
                    👨‍💻
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio, stats and CTA */}
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-zinc-100 md:text-xl">
              Hi, I&apos;m <span className="text-purple-400">Ashfaq Islam</span> — a
              passionate Full Stack Developer based in Bangladesh.
            </p>

            <p className="leading-relaxed text-zinc-400">
              I love building modern web applications with clean code and delightful
              user experiences. Currently exploring 3D web development with React
              Three Fiber.
            </p>

            <p className="leading-relaxed text-zinc-400">
              When I&apos;m not coding, I enjoy learning new technologies and
              contributing to open-source projects.
            </p>

            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-white/5 p-5 transition-colors duration-300 hover:border-purple-500/50"
                  >
                    <p className="bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-3xl font-bold text-transparent">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-zinc-400">{stat.label}</p>
                  </div>
                ))}
              </div>

              {/* TODO: Add resume.pdf to the /public folder */}
              <a
                href="/resume.pdf"
                download
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/25"
              >
                <svg
                  aria-hidden="true"
                  className="h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 3v12" />
                  <path d="m7 10 5 5 5-5" />
                  <path d="M5 21h14" />
                </svg>
                Download CV
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}