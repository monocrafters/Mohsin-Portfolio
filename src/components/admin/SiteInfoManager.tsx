"use client";

import { useEffect, useState } from "react";
import { contactContent, siteConfig } from "@/data/content";

type SiteForm = {
  name: string;
  title: string;
  email: string;
  location: string;
  available: boolean;
  contactLabel: string;
  contactTitle: string;
  contactDescription: string;
};

const defaults: SiteForm = {
  name: siteConfig.name,
  title: siteConfig.title,
  email: siteConfig.email,
  location: siteConfig.location,
  available: siteConfig.available,
  contactLabel: contactContent.label,
  contactTitle: contactContent.title,
  contactDescription: contactContent.description,
};

export default function SiteInfoManager() {
  const [form, setForm] = useState<SiteForm>(defaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/site");
      const data = await res.json();
      if (res.ok && data.settings) setForm({ ...defaults, ...data.settings });
      else setError(data.error || "Failed to load site info.");
    } catch {
      setError("Could not load site info.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateField<K extends keyof SiteForm>(key: K, value: SiteForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/site", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to save.");
        return;
      }

      if (data.settings) setForm({ ...defaults, ...data.settings });
      setSuccess("Site info saved.");
    } catch {
      setError("Could not save site info.");
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
        <h1 className="text-xl font-bold text-text">Site Info</h1>
        <p className="text-sm text-text-muted">Contact section copy and profile details shown on the site.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-strong space-y-5 rounded-2xl p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" value={form.name} onChange={(v) => updateField("name", v)} />
          <Field label="Title" value={form.title} onChange={(v) => updateField("title", v)} />
          <Field label="Email" value={form.email} onChange={(v) => updateField("email", v)} type="email" />
          <Field label="Location" value={form.location} onChange={(v) => updateField("location", v)} />
        </div>

        <label className="flex items-center gap-3 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={form.available}
            onChange={(e) => updateField("available", e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
          />
          Available for work (shows badge on site)
        </label>

        <hr className="border-white/50" />

        <Field label="Contact label" value={form.contactLabel} onChange={(v) => updateField("contactLabel", v)} />
        <Field label="Contact title" value={form.contactTitle} onChange={(v) => updateField("contactTitle", v)} />
        <div>
          <label className="mb-1.5 block text-xs font-medium text-text-muted">Contact description</label>
          <textarea
            value={form.contactDescription}
            onChange={(e) => updateField("contactDescription", e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-white/60 bg-white/50 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {error && <p className="rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}
        {success && <p className="rounded-xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</p>}

        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save Site Info"}
        </button>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-text-muted">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/60 bg-white/50 px-4 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
      />
    </div>
  );
}
