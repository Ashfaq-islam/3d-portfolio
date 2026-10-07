"use client";

import { useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { apiFetch } from "@/lib/api";
import type { ApiResponse } from "@/lib/api";

interface FormData {
  name: string;
  email: string;
  message: string;
}

// Only the fields that are wrong get an entry, so it's all optional
type FormErrors = Partial<Record<keyof FormData, string>>;

// The subset of form fields the backend can return validation errors for
type ContactField = "name" | "email" | "message";

// Shape of `data` in the 201 response from POST /api/contact
interface ContactSubmitData {
  id: string;
}

// Kept in one place so the wording never drifts from the JSX
const SUCCESS_MESSAGE = "Thanks! I'll get back to you soon.";

// Fallback when the server rejects the message without a usable error string
function getSubmitErrorMessage(result: ApiResponse<ContactSubmitData>): string {
  if (result.error) return result.error;
  // 400 with per-field details but no summary: point the user at the fields
  if (
    result.status === 400 &&
    result.details &&
    result.details.length > 0
  ) {
    return "Please fix the highlighted fields.";
  }
  if (result.status === 429) {
    return "Too many messages. Please try again in a few minutes.";
  }
  return "Something went wrong. Please try again.";
}

type SocialGroup = "professional" | "social";

type SocialLink = {
  name: string;
  href: string;
  icon: ReactNode;
  group: SocialGroup;
};

// TODO: Replace with real social profile URLs
const socialLinks: SocialLink[] = [
  {
    name: "GitHub",
    href: "#",
    group: "professional",
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
    group: "professional",
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
    name: "LeetCode",
    href: "#",
    group: "professional",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M13.483 0a1.374 1.374 0 0 0-.961.438L7.116 6.226l-3.854 4.126a5.266 5.266 0 0 0-1.209 2.104 5.35 5.35 0 0 0-.125.513 5.527 5.527 0 0 0 .062 2.362 5.83 5.83 0 0 0 .349 1.017 5.938 5.938 0 0 0 1.271 1.818l4.277 4.193.039.038c2.248 2.165 5.852 2.133 8.063-.074l2.396-2.392c.54-.54.54-1.414.003-1.955a1.378 1.378 0 0 0-1.951-.003l-2.396 2.392a3.021 3.021 0 0 1-4.205.038l-.02-.019-4.276-4.193c-.652-.64-.972-1.469-.948-2.263a2.68 2.68 0 0 1 .066-.523 2.545 2.545 0 0 1 .619-1.164L9.13 8.114c1.058-1.134 3.204-1.27 4.43-.278l3.501 2.831c.593.48 1.461.387 1.94-.207a1.384 1.384 0 0 0-.207-1.943l-3.5-2.831c-.8-.647-1.766-1.045-2.774-1.202l2.015-2.158A1.384 1.384 0 0 0 13.483 0zm-2.866 12.815a1.38 1.38 0 0 0-1.38 1.382 1.38 1.38 0 0 0 1.38 1.382H20.79a1.38 1.38 0 0 0 1.38-1.382 1.38 1.38 0 0 0-1.38-1.382z" />
      </svg>
    ),
  },
  {
    name: "X",
    href: "#",
    group: "professional",
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
    name: "Facebook",
    href: "#",
    group: "social",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.52 1.5-3.91 3.77-3.91 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33V22c4.78-.79 8.44-4.94 8.44-9.94Z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    href: "#",
    group: "social",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9a3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06.36 2.23.41C8.42 2.17 8.8 2.16 12 2.16Zm0 3.89a5.95 5.95 0 1 0 0 11.9 5.95 5.95 0 0 0 0-11.9Zm0 9.82a3.87 3.87 0 1 1 0-7.74 3.87 3.87 0 0 1 0 7.74Zm6.05-10.06a1.39 1.39 0 1 1-2.78 0 1.39 1.39 0 0 1 2.78 0Z" />
      </svg>
    ),
  },
  {
    name: "Reddit",
    href: "#",
    group: "social",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
      </svg>
    ),
  },
  {
    name: "Discord",
    href: "#",
    group: "social",
    icon: (
      <svg
        aria-hidden="true"
        className="h-5 w-5"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M19.3 5.36A16.4 16.4 0 0 0 15.44 4l-.3.5a15.2 15.2 0 0 1 3.6 1.8 13.9 13.9 0 0 0-11.5 0A15.2 15.2 0 0 1 10.9 4.5L10.6 4a16.4 16.4 0 0 0-3.9 1.36C4.3 9.3 3.5 13.1 3.8 16.85a16.5 16.5 0 0 0 5 2.52l1-1.7a10.7 10.7 0 0 1-1.7-.83l.42-.32a11.6 11.6 0 0 0 9.9 0l.42.32c-.52.33-1.1.62-1.7.83l1 1.7a16.5 16.5 0 0 0 5-2.52c.36-4.34-.74-8.1-2.84-11.49ZM9.7 14.5c-.97 0-1.76-.9-1.76-2s.77-2 1.76-2 1.78.9 1.76 2c0 1.1-.77 2-1.76 2Zm4.6 0c-.97 0-1.76-.9-1.76-2s.77-2 1.76-2 1.78.9 1.76 2c0 1.1-.77 2-1.76 2Z" />
      </svg>
    ),
  },
];

const professionalLinks = socialLinks.filter((link) => link.group === "professional");
const socialGroupLinks = socialLinks.filter((link) => link.group === "social");

// Very simple email check: something@something.tld
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Shared input styles, with a red border when the field has an error
function getInputClassName(hasError: boolean): string {
  return `w-full rounded-xl border bg-zinc-900 px-4 py-3 text-white placeholder:text-zinc-500 transition-colors duration-300 focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary/50 ${
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

interface SocialGroupListProps {
  label: string;
  id: string;
  links: SocialLink[];
}

function SocialGroupList({ label, id, links }: SocialGroupListProps) {
  return (
    <div>
      <p id={id} className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
        {label}
      </p>
      <ul aria-labelledby={id} className="grid grid-cols-4 gap-4 place-items-center">
        {links.map((social) => (
          <li key={social.name}>
            <a
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${social.name} profile`}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-zinc-900 text-zinc-300 transition-all duration-300 hover:scale-110 hover:border-brand-primary/50 hover:text-brand-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-black"
            >
              {social.icon}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Contact() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Server/network error banner shown above the submit button
  const [submitError, setSubmitError] = useState<string | null>(null);
  // Shown after 5s so the user knows a cold backend can take up to a minute
  const [showSlowHint, setShowSlowHint] = useState(false);

  // Works for both <input> and <textarea> because we read e.target.name
  function handleChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;
    const field = name as keyof FormData;

    setFormData((previous) => ({ ...previous, [field]: value }));

    // Clear this field's error and hide the success/error messages while typing
    setErrors((previous) => {
      if (!previous[field]) return previous;
      const next = { ...previous };
      delete next[field];
      return next;
    });
    setIsSubmitted(false);
    setSubmitError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Ignore repeat submits (e.g. a double click) while a request is in flight
    if (isSubmitting) return;

    setSubmitError(null);
    setIsSubmitted(false);

    const nextErrors = validate(formData);
    setErrors(nextErrors);

    // Stop here if something is wrong
    if (Object.keys(nextErrors).length > 0) return;

    setIsSubmitting(true);

    // Started in the handler (not useEffect) to avoid setState-in-effect lint
    // issues. 5 seconds is long enough that fast responses never see it.
    const slowHintTimer = window.setTimeout(() => setShowSlowHint(true), 5000);

    try {
      const result = await apiFetch<ContactSubmitData>("/api/contact", {
        method: "POST",
        // Send trimmed values so the server stores clean data
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          message: formData.message.trim(),
        }),
      });

      if (result.success) {
        setFormData({ name: "", email: "", message: "" });
        setErrors({});
        setIsSubmitted(true);
      } else {
        // Map server-side field errors onto the matching inputs, so their
        // inline messages appear just like the client-side ones.
        if (result.details && result.details.length > 0) {
          const fieldErrors: Partial<Record<ContactField, string>> = {};
          for (const detail of result.details) {
            const { field, message } = detail;
            if (field === "name" || field === "email" || field === "message") {
              fieldErrors[field] = message;
            }
          }
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
          }
        }
        setSubmitError(getSubmitErrorMessage(result));
      }
    } catch {
      // apiFetch never throws today, but keep a safety net so the form can
      // never get stuck in a submitting state without feedback.
      setSubmitError("Something went wrong. Please try again.");
    } finally {
      window.clearTimeout(slowHintTimer);
      setShowSlowHint(false);
      setIsSubmitting(false);
    }
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
          <div className="mb-4 h-1 w-12 rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary" />

          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-brand-primary">
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

        {/* lg:items-stretch makes both columns the same height on desktop, so the
            form card lines up with the details column. */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-stretch">
          {/* Contact details and social links. h-full + mt-auto pushes the social
              block to the bottom so it sits on the same baseline as the form's
              submit button. On mobile the column has no fixed height, so the
              heights are natural. */}
          <div className="flex h-full flex-col gap-4">
            <ul className="space-y-4">
              <li className="flex items-center gap-4 rounded-xl border border-white/10 bg-zinc-900/50 p-5 transition-colors duration-300 hover:border-brand-primary/50">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
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
                    className="break-all text-white transition-colors duration-300 hover:text-brand-accent focus-visible:outline-none focus-visible:text-brand-accent"
                  >
                    ashfaqislam223539@gmail.com
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-4 rounded-xl border border-white/10 bg-zinc-900/50 p-5 transition-colors duration-300 hover:border-brand-primary/50">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
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

              <li className="flex items-center gap-4 rounded-xl border border-white/10 bg-zinc-900/50 p-5 transition-colors duration-300 hover:border-brand-primary/50">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
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
                    <rect x="7" y="2" width="10" height="20" rx="2.5" />
                    <path d="M11 18.5h2" />
                  </svg>
                </span>

                <div className="min-w-0">
                  <p className="text-sm text-zinc-400">Phone</p>

                  <a
                    href="tel:+8801973327179"
                    className="block break-all text-white transition-colors duration-300 hover:text-brand-accent focus-visible:outline-none focus-visible:text-brand-accent"
                  >
                    +880 1973-327179
                  </a>
                  <p className="text-xs text-zinc-400">Banglalink</p>

                  <a
                    href="tel:+8801825722447"
                    className="mt-3 block break-all text-white transition-colors duration-300 hover:text-brand-accent focus-visible:outline-none focus-visible:text-brand-accent"
                  >
                    +880 1825-722447
                  </a>
                  <p className="text-xs text-zinc-400">Robi</p>
                </div>
              </li>
            </ul>

            {/* Social profiles. mt-auto pushes this block to the bottom of the
                column. */}
            <div className="mt-auto pt-10">
              <p className="text-zinc-400">Find me on</p>

              <div className="mt-6 space-y-6">
                <SocialGroupList
                  label="Professional"
                  id="professional-links"
                  links={professionalLinks}
                />
                <SocialGroupList
                  label="Social"
                  id="social-links"
                  links={socialGroupLinks}
                />
              </div>
            </div>
          </div>

          {/* Contact form. h-full + flex flex-col lets the Message field grow, so
              this card ends at the same height as the column on its left. */}
          <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-900/50 p-6 md:p-8">
            <form
              onSubmit={handleSubmit}
              noValidate
              aria-busy={isSubmitting}
              className="flex flex-1 flex-col space-y-6"
            >
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

              {/* flex-1 lets this field take up the slack, so the textarea can fill it and
                  the form card matches the height of the left column. */}
              <div className="flex flex-1 flex-col">
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
                  className={`${getInputClassName(Boolean(errors.message))} h-full min-h-[8rem] resize-none`}
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
                  {SUCCESS_MESSAGE}
                </div>
              )}

              {/* Server/network error banner (same box style as success, red) */}
              {submitError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-400"
                >
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                className="w-full rounded-xl bg-gradient-to-r from-brand-primary to-brand-secondary py-3 font-medium text-white transition-all duration-300 enabled:hover:scale-[1.02] enabled:hover:shadow-lg enabled:hover:shadow-brand-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </button>

              {/* Explains the wait while the Render free tier cold-starts */}
              {showSlowHint && (
                <p aria-live="polite" className="text-sm text-zinc-400">
                  Still sending... the first message can take up to a minute
                  while the server wakes up.
                </p>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}