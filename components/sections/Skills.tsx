type Skill = {
  name: string;
  icon: string;
  level: string;
};

const skills: Skill[] = [
  { name: "HTML5", icon: "🌐", level: "Advanced" },
  { name: "CSS3 / TailwindCSS", icon: "🎨", level: "Advanced" },
  { name: "JavaScript", icon: "⚡", level: "Advanced" },
  { name: "TypeScript", icon: "📘", level: "Intermediate" },
  { name: "React", icon: "⚛️", level: "Advanced" },
  { name: "Next.js", icon: "▲", level: "Advanced" },
  { name: "Node.js", icon: "🟢", level: "Intermediate" },
  { name: "Express", icon: "🚂", level: "Intermediate" },
  { name: "MongoDB", icon: "🍃", level: "Intermediate" },
  { name: "Git & GitHub", icon: "🔀", level: "Advanced" },
  { name: "Python", icon: "🐍", level: "Beginner" },
  { name: "Three.js / R3F", icon: "🎭", level: "Learning" },
];

export default function Skills() {
  return (
    <section
      id="skills"
      className="border-y border-white/10 bg-zinc-900/50 py-24 px-6 scroll-mt-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 h-1 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-500" />

        <h2 className="mb-4 text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Skills &amp; Technologies
        </h2>

        <p className="mb-12 max-w-2xl text-lg text-zinc-400">
          Technologies I work with to bring ideas to life
        </p>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="group flex flex-col items-center rounded-xl border border-white/10 bg-zinc-900 p-6 text-center transition-all duration-300 hover:scale-105 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/20"
            >
              <span className="mb-3 text-4xl" aria-hidden="true">
                {skill.icon}
              </span>
              <h3 className="mb-3 font-semibold text-white">{skill.name}</h3>
              <span className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-400">
                {skill.level}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}