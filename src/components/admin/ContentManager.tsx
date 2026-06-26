"use client";

import { useEffect, useState } from "react";
import { aboutContent, skillGroups } from "@/data/content";
import type { AboutHighlight } from "@/lib/content-settings";

type ContentForm = {
  aboutLabel: string;
  aboutTitle: string;
  aboutIntro: string;
  aboutHighlights: AboutHighlight[];
  skillsLabel: string;
  skillsTitle: string;
  skillsItems: string;
};

const defaults: ContentForm = {
  aboutLabel: aboutContent.label,
  aboutTitle: aboutContent.title,
  aboutIntro: aboutContent.intro,
  aboutHighlights: aboutContent.highlights,
  skillsLabel: "Skills",
  skillsTitle: "My toolkit",
  skillsItems: skillGroups.flatMap((g) => g.items).join(", "),
};

export default function ContentManager() {
  const [form, setForm] = useState<ContentForm>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/content");
      const data = await res.json();
      if (res.ok && data.content) {
        setForm({
          aboutLabel: data.content.aboutLabel,
          aboutTitle: data.content.aboutTitle,
          aboutIntro: data.content.aboutIntro,
          aboutHighlights: data.content.aboutHighlights,
          skillsLabel: data.content.skillsLabel,
          skillsTitle: data.content.skillsTitle,
          skillsItems: (data.content.skillsItems || []).join(", "),
        });
      } else setError(data.error || "Failed to load.");
    } catch {
      setError("Could not load content.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateHighlight(index: number, field: keyof AboutHighlight, value: string) {
    setForm((prev) => ({
      ...prev,
      aboutHighlights: prev.aboutHighlights.map((h, i) =>
        i === index ? { ...h, [field]: value } : h
      ),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skillsItems: form.skillsItems.split(",").map((s) => s.trim()).filter(Boolean),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save.");
        return;
      }
      if (data.content) {
        setForm({
          ...form,
          skillsItems: (data.content.skillsItems || []).join(", "),
        });
      }
      setSuccess("Content saved.");
    } catch {
      setError("Could not save content.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="glass-strong h-64 animate-pulse rounded-2xl" />;
  }

  return (
    <div>
      <div className="glass-strong mb-6 rounded-2xl px-6 py-5">
        <h1 className="text-xl font-bold text-text">About & Toolkit</h1>
        <p className="text-sm text-text-muted">Edit the About section and skills toolkit on your site.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="glass-strong space-y-4 rounded-2xl p-6">
          <h2 className="font-semibold text-text">About section</h2>
          <Field label="Label" value={form.aboutLabel} onChange={(v) => setForm({ ...form, aboutLabel: v })} />
          <Field label="Title" value={form.aboutTitle} onChange={(v) => setForm({ ...form, aboutTitle: v })} />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">Intro text</label>
            <textarea
              value={form.aboutIntro}
              onChange={(e) => setForm({ ...form, aboutIntro: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <p className="text-xs font-medium text-text-muted">Highlight cards (4)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {form.aboutHighlights.map((h, i) => (
              <div key={i} className="rounded-xl border border-white/60 bg-white/40 p-3 space-y-2">
                <input
                  placeholder="Label"
                  value={h.label}
                  onChange={(e) => updateHighlight(i, "label", e.target.value)}
                  className="w-full rounded-lg border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none"
                />
                <div className="flex gap-2">
                  <input
                    placeholder="Value"
                    value={h.value}
                    onChange={(e) => updateHighlight(i, "value", e.target.value)}
                    className="flex-1 rounded-lg border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none"
                  />
                  <input
                    placeholder="Unit"
                    value={h.unit}
                    onChange={(e) => updateHighlight(i, "unit", e.target.value)}
                    className="w-20 rounded-lg border border-white/60 bg-white/60 px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-strong space-y-4 rounded-2xl p-6">
          <h2 className="font-semibold text-text">Toolkit / Skills</h2>
          <Field label="Label" value={form.skillsLabel} onChange={(v) => setForm({ ...form, skillsLabel: v })} />
          <Field label="Title" value={form.skillsTitle} onChange={(v) => setForm({ ...form, skillsTitle: v })} />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-text-muted">
              Skills (comma separated)
            </label>
            <textarea
              value={form.skillsItems}
              onChange={(e) => setForm({ ...form, skillsItems: e.target.value })}
              rows={4}
              placeholder="React, Next.js, TypeScript..."
              className="w-full rounded-xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </section>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Content"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-text-muted">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/60 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
