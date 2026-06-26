"use client";

import { useEffect, useState } from "react";
import { contactContent, siteConfig } from "@/data/content";
import SectionReveal from "@/components/ui/SectionReveal";
import SocialLinks from "@/components/ui/SocialLinks";
import { useSiteData } from "@/components/providers/SiteDataProvider";

type SiteSettings = {
  name: string;
  title: string;
  email: string;
  location: string;
  available: boolean;
  contactLabel: string;
  contactTitle: string;
  contactDescription: string;
};

const defaults: SiteSettings = {
  name: siteConfig.name,
  title: siteConfig.title,
  email: siteConfig.email,
  location: siteConfig.location,
  available: siteConfig.available,
  contactLabel: contactContent.label,
  contactTitle: contactContent.title,
  contactDescription: contactContent.description,
};

export default function Contact() {
  const siteData = useSiteData();
  const [settings, setSettings] = useState<SiteSettings>(
    siteData?.settings ?? defaults
  );
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (siteData?.settings) {
      setSettings({ ...defaults, ...siteData.settings });
      return;
    }
    fetch("/api/site")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings({ ...defaults, ...d.settings });
      })
      .catch(() => {});
  }, [siteData]);

  async function copyEmail() {
    await navigator.clipboard.writeText(settings.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFeedback({ type: "error", text: data.error || "Could not send message." });
        return;
      }

      setFeedback({ type: "success", text: "Message sent! I'll get back to you soon." });
      setName("");
      setEmail("");
      setMessage("");
    } catch {
      setFeedback({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="contact" className="section-padding pb-20">
      <div className="mx-auto max-w-6xl">
        <SectionReveal>
          <div className="glass-strong overflow-hidden rounded-3xl">
            <div className="grid lg:grid-cols-5">
              {/* Left — info */}
              <div className="relative bg-gradient-to-br from-primary to-primary-light p-8 text-white lg:col-span-2 sm:p-10">
                <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
                <p className="mb-2 text-sm font-medium uppercase tracking-widest text-white/70">
                  {settings.contactLabel}
                </p>
                <h2 className="mb-3 text-2xl font-bold sm:text-3xl">{settings.contactTitle}</h2>
                <p className="mb-6 max-w-sm text-sm leading-relaxed text-white/85">
                  {settings.contactDescription}
                </p>

                {settings.available && (
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm backdrop-blur-sm">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    Available for work
                  </div>
                )}

                <button
                  type="button"
                  onClick={copyEmail}
                  className="mb-4 flex w-full items-center gap-3 rounded-2xl bg-white/15 px-4 py-3 text-left backdrop-blur-sm transition hover:bg-white/25"
                >
                  <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div className="min-w-0">
                    <p className="text-xs text-white/70">{copied ? "Copied!" : "Email"}</p>
                    <p className="truncate text-sm font-semibold">{settings.email}</p>
                  </div>
                </button>

                <p className="text-xs text-white/70">
                  {settings.location} · {settings.title}
                </p>
              </div>

              {/* Right — form */}
              <div className="flex flex-col justify-center p-6 sm:p-8 lg:col-span-3 lg:p-10">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="contact-name" className="mb-1.5 block text-xs font-medium text-text-muted">
                        Name
                      </label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="w-full rounded-xl border border-white/60 bg-white/50 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="mb-1.5 block text-xs font-medium text-text-muted">
                        Email
                      </label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@email.com"
                        className="w-full rounded-xl border border-white/60 bg-white/50 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="mb-1.5 block text-xs font-medium text-text-muted">
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      required
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Tell me about your project..."
                      className="w-full resize-none rounded-xl border border-white/60 bg-white/50 px-4 py-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  {feedback && (
                    <p
                      className={`rounded-xl px-4 py-2.5 text-sm ${
                        feedback.type === "success"
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "bg-red-50 text-red-700 ring-1 ring-red-200"
                      }`}
                    >
                      {feedback.text}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-2xl bg-primary py-3.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
                  >
                    {submitting ? "Sending..." : "Send Message"}
                  </button>
                </form>

                <div className="mt-6 border-t border-white/40 pt-6">
                  <p className="mb-3 text-center text-xs font-medium uppercase tracking-wide text-text-muted">
                    Or connect
                  </p>
                  <div className="w-full overflow-hidden">
                    <SocialLinks variant="buttons" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>

        <p className="mt-10 text-center text-xs text-text-muted">
          © {siteConfig.year} {settings.name}. All rights reserved.
        </p>
      </div>
    </section>
  );
}
