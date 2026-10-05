import About from "@/components/sections/About";
import Skills from "@/components/sections/Skills";
import Projects from "@/components/sections/Projects";
import Achievements from "@/components/sections/Achievements";
import Gallery from "@/components/sections/Gallery";
import Contact from "@/components/sections/Contact";
import Footer from "@/components/sections/Footer";
import HeroScene from "@/components/three/HeroScene";
import TiltPhotoCard from "@/components/ui/TiltPhotoCard";

export default function Home() {
  return (
    <>
      <main
        id="home"
        className="relative isolate flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-900 to-black px-6 py-28 text-white md:py-24"
      >
        {/* 3D background layer, sits behind the Hero content */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <HeroScene />
        </div>

        {/*
          flex-1 + items-center centres the two columns vertically inside the
          min-h-screen section. The scroll hint lives outside this wrapper, so
          it can never sit on top of the buttons on a short screen.
        */}
        <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center">
          <div className="grid w-full grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-12">
            {/*
              order-first puts the photo above the text on mobile (one column),
              md:order-last moves it to the right-hand column on desktop.
            */}
            <div className="order-first flex justify-center md:order-last md:justify-end">
              <div className="w-full max-w-[260px] md:max-w-sm lg:max-w-md">
                <TiltPhotoCard
                  src="/hero-photo.jpg"
                  alt="Portrait of Ashfaq Islam"
                />
              </div>
            </div>

            <div className="text-center md:text-left">
              {/* Greeting */}
              <p className="mb-4 text-lg text-zinc-400">👋 Hi, I&apos;m</p>

              {/* Name with gradient. The sizes step up slowly so the name still
                  fits the half width column between 768px and 1024px. */}
              <h1 className="mb-6 bg-gradient-to-r from-brand-primary via-brand-secondary to-brand-glow bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl md:text-left">
                Ashfaq Islam
              </h1>

              {/* Title */}
              <h2 className="mb-6 text-2xl font-medium text-zinc-300 sm:text-3xl">
                Full Stack Developer
              </h2>

              {/* Description */}
              <p className="mb-12 max-w-2xl text-lg leading-relaxed text-zinc-400">
                I build modern, interactive{" "}
                <span className="text-brand-primary">3D web experiences</span> that
                combine beautiful design with powerful functionality. Passionate about
                crafting clean code and delightful user interfaces.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
                <a
                  href="#projects"
                  className="group flex h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary px-8 font-medium text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-brand-primary/50"
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
            </div>
          </div>
        </div>

        {/* Scroll hint. Hidden on mobile, where the photo and buttons already
            fill the screen, and kept in the normal flow so it never overlaps
            the content above it. */}
        <div className="relative z-10 mx-auto mt-10 hidden w-full max-w-6xl shrink-0 items-center justify-center gap-2 pb-4 text-sm text-zinc-500 md:flex">
          <span>Scroll to explore</span>
          <span className="animate-bounce">↓</span>
        </div>
      </main>

      <About />
      <Skills />
      <Projects />
      <Achievements />
      <Gallery />
      <Contact />
      <Footer />
    </>
  );
}