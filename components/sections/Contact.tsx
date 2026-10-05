"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";

interface FormData {
  name: string;
  email: string;
  message: string;
}

// Only the fields that are wrong get an entry, so it's all optional
type FormErrors = Partial<Record<keyof FormData, string>>;

type SocialLink = {
  name: string;
  href: string;
  icon: ReactNode;
};

// TODO: Replace with real social profile URLs
const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    href: "#",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
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
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
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
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M18.9 2.5h3.3l-7.2 8.24L23.4 21.5h-6.6l-5.17-6.76-5.92 6.76H2.4l7.7-8.8L2 2.5h6.77l4.68 6.18 5.45-6.18Zm-1.16 17h1.83L7.5 4.4H5.55L17.74 19.5Z" />
      </svg>
    ),
  },
];

// Very simple email check: something@something.tld
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shared input styles, with a red border when the field has an error
function getInputClassName(hasError: boolean): string {
  return `w-full rounded-xl border bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 transition-colors duration-300 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 ${
    hasError ? "border-red-500/60" : "border-white/10"
  }`;
}

function validate(values: FormData): FormErrors {
  const nextErrors: FormErrors = {};

  if (!values.name.trim()) {
    nextErrors.name = "Name is required";
  }

  if (!values.email.trim()) {
    nextErrors.email = "Email is required";
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    nextErrors.email = "Please enter a valid email address";
  }

  if (!values.message.trim()) {
    nextErrors.message = "Message is required";
  }

  return nextErrors;
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Works for both <input> and <textarea> because we read e.target.name
  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    const field = name as keyof FormData;

    setFormData((previous) => ({ ...previous, [field]: value }));

    // Clear this field's error and hide the success message while typing
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
    setIsSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(formData);
    setErrors(nextErrors);

    // Stop here if something is wrong
    if (Object.keys(nextErrors).length > 0) return;

    // TODO: Connect to a real backend/API later (no fetch for now)
    console.log("Contact form submitted:", formData);

    setFormData({ name: "", email: "", message: "" });
    setIsSubmitted(true);
  }

  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="py-24 px-6 scroll-mt-20"
    >
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <header className="mb-12">
          <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-500" />

          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-purple-400">
            Contact
          </p>

          <h2
            id="contact-heading"
            className="text-3xl font-bold tracking-tight text-white md:text-4xl"
          >
            Let&apos;s Work Together
          </h2>

          <p className="mt-4 text-zinc-400">
            Have a project in mind? Let&apos;s talk.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Contact details and social links */}
          <div>
            <ul className="space-y-4">
              <li className="flex items-center gap-4 rounded-xl border border-white/10 bg-zinc-900/50 p-5 transition-colors duration-300 hover:border-purple-500/50">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
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
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-zinc-400">Email</p>
                  <a
                    href="mailto:ashfaqislam223539@gmail.com"
                    className="break-all text-white transition-colors duration-300 hover:text-purple-400 focus-visible:outline-none focus-visible:text-purple-400"
                  >
                    ashfaqislam223539@gmail.com
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-4 rounded-xl border border-white/10 bg-zinc-900/50 p-5 transition-colors duration-300 hover:border-purple-500/50">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <svg
                    aria-hidden="true"
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21s7-5.34 7-11a7 7 0 1 0-14 0c0 5.66 7 11 7 11Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm text-zinc-400">Location</p>
                  <p className="text-white">Bangladesh</p>
                </div>
              </li>
            </ul>

            {/* Social profiles */}
            <div className="mt-10">
              <p className="mb-4 text-zinc-400">Find me on</p>
              <ul className="flex gap-4">
                {socialLinks.map((social) => (
                  <li key={social.name}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${social.name} profile`}
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-zinc-900 text-zinc-300 transition-all duration-300 hover:scale-110 hover:border-purple-500/50 hover:text-purple-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
                    >
                      {social.icon}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact form */}
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 md:p-8">
            <form onSubmit={handleSubmit} noValidate className="space-y-6">
              <div>
                <label
                  htmlFor="contact-name"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Name
                </label>
                <input
                  id="contact-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Your name"
                  value={formData.name}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? "contact-name-error" : undefined}
                  className={getInputClassName(Boolean(errors.name))}
                />
                {errors.name && (
                  <p id="contact-name-error" role="alert" className="mt-2 text-sm text-red-400">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-email"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Email
                </label>
                <input
                  id="contact-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "contact-email-error" : undefined}
                  className={getInputClassName(Boolean(errors.email))}
                />
                {errors.email && (
                  <p id="contact-email-error" role="alert" className="mt-2 text-sm text-red-400">
                    {errors.email}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="mb-2 block text-sm font-medium text-zinc-300"
                >
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="Tell me about your project..."
                  value={formData.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={errors.message ? "contact-message-error" : undefined}
                  className={`${getInputClassName(Boolean(errors.message))} resize-y`}
                />
                {errors.message && (
                  <p id="contact-message-error" role="alert" className="mt-2 text-sm text-red-400">
                    {errors.message}
                  </p>
                )}
              </div>

              {/* Success message for screen readers and sighted users */}
              {isSubmitted && (
                <div
                  role="status"
                  aria-live="polite"
                  className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-green-400"
                >
                  Thanks! I&apos;ll get back to you soon.
                </div>
              )}

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-3 font-medium text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}