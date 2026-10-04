export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-zinc-950 via-zinc-900 to-black px-6 py-24 text-white">
      {/* Greeting */}
      <p className="mb-4 text-lg text-zinc-400">
        👋 Hi, I&apos;m
      </p>

      {/* Name with gradient */}
      <h1 className="mb-6 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-center text-6xl font-bold tracking-tight text-transparent sm:text-7xl md:text-8xl">
        Ashfaq Islam
      </h1>

      {/* Title */}
      <h2 className="mb-6 text-2xl font-medium text-zinc-300 sm:text-3xl">
        Full Stack Developer
      </h2>

      {/* Description */}
      <p className="mb-12 max-w-2xl text-center text-lg leading-relaxed text-zinc-400">
        I build modern, interactive <span className="text-purple-400">3D web experiences</span> that
        combine beautiful design with powerful functionality. Passionate about
        crafting clean code and delightful user interfaces.
      </p>

      {/* CTA Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <a
          href="#projects"
          className="group flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-8 font-medium text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-purple-500/50"
        >
          🚀 View Projects
        </a>
        <a
          href="#contact"
          className="flex h-12 items-center justify-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/50 px-8 font-medium text-zinc-300 backdrop-blur-sm transition-all hover:scale-105 hover:border-zinc-500 hover:text-white"
        >
          📧 Contact Me
        </a>
      </div>

      {/* Scroll hint */}
      <div className="absolute bottom-8 flex flex-col items-center gap-2 text-sm text-zinc-500">
        <span>Scroll to explore</span>
        <span className="animate-bounce">↓</span>
      </div>
    </main>
  );
}