import type { ReactNode } from "react";

type FooterLink = {
  name: string;
  href: string;
};

type SocialLink = {
  name: string;
  href: string;
  icon: ReactNode;
  // Only the real social profiles open in a new tab, email stays in place
  external: boolean;
};

// Same anchors the Navbar uses, so the footer links stay in sync
const quickLinks: FooterLink[] = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Contact", href: "#contact" },
];

// TODO: Replace with real social profile URLs
const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    href: "#",
    external: true,
    icon: (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.03c-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.2.08 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.96 0-1.32.47-2.39 1.24-3.23-.13-.3-.54-1.53.11-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.23 0 4.63-2.8 5.65-5.48 5.95.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "#",
    external: true,
    icon: (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.5h4v11H3v-11Zm6.5 0h3.83v1.5h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76v5.69h-4v-5.05c0-1.2-.02-2.75-1.7-2.75-1.7 0-1.96 1.31-1.96 2.66v5.14h-4v-11Z" />
      </svg>
    ),
  },
  {
    name: "Twitter",
    href: "#",
    external: true,
    icon: (
      <svg
        aria-hidden="true"
        className="h-4 w-4"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M18.9 2.5h3.3l-7.2 8.24L23.4 21.5h-6.6l-5.17-6.76-5.92 6.76H2.4l7.7-8.8L2 2.5h6.77l4.68 6.18 5.45-6.18Zm-1.16 17h1.83L7.5 4.4H5.55L17.74 19.5Z" />
      </svg>
    ),
  },
  {
    name: "Email",
    href: "mailto:ashfaqislam223539@gmail.com",
    external: false,
    icon: (
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
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 7-10 6L2 7" />
      </svg>
    ),
  },
];

export default function Footer() {
  // Read the year at render time so it never goes out of date
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-white/10 bg-zinc-950 py-12 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Logo, quick links and social icons */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <p className="text-xl font-bold text-white">
              Ashfaq<span className="text-brand-primary">.</span>
            </p>
            <p className="mt-4 max-w-xs text-zinc-400">
              Building modern 3D web experiences from Bangladesh.
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-semibold text-white">Quick Links</h2>
            <nav aria-label="Footer navigation">
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-zinc-400 transition-colors duration-300 hover:text-brand-accent focus-visible:outline-none focus-visible:text-brand-accent"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <h2 className="mb-4 font-semibold text-white">Connect</h2>
            <ul className="flex gap-3">
              {socialLinks.map((social) => (
                <li key={social.name}>
                  <a
                    href={social.href}
                    aria-label={`${social.name} profile`}
                    target={social.external ? "_blank" : undefined}
                    rel={social.external ? "noopener noreferrer" : undefined}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-300 transition-all duration-300 hover:scale-110 hover:border-brand-primary/50 hover:text-brand-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                  >
                    {social.icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright and back to top */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-zinc-500 md:flex-row">
          <p>&copy; {year} Ashfaq Islam. All rights reserved.</p>

          <p>Built with Next.js &amp; React Three Fiber</p>

          <a
            href="#home"
            className="group inline-flex items-center gap-1 transition-colors duration-300 hover:text-brand-accent focus-visible:outline-none focus-visible:text-brand-accent"
          >
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:-translate-y-0.5"
            >
              ↑
            </span>
            Back to top
          </a>
        </div>
      </div>
    </footer>
  );
}