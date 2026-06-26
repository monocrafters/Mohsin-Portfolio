"use client";

import { useEffect, useState } from "react";
import type { LinkType } from "@/lib/social-links";
import type { SocialLinkItem } from "@/components/ui/SocialLinks";
import { SocialIcon } from "@/components/ui/SocialLinks";

const LINK_TYPES: { value: LinkType; label: string }[] = [
  { value: "github", label: "GitHub" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "instagram", label: "Instagram" },
  { value: "twitter", label: "Twitter / X" },
  { value: "facebook", label: "Facebook" },
  { value: "youtube", label: "YouTube" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "other", label: "Other" },
];

const emptyForm = {
  label: "",
  url: "",
  type: "other" as LinkType,
  order: 0,
};

export default function LinkManager() {
  const [links, setLinks] = useState<SocialLinkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);

  async function loadLinks() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/links");
      const data = await res.json();
      if (res.ok) setLinks(data.links || []);
      else setError(data.error || "Failed to load");
    } catch {
      setError("Could not load links.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLinks(); }, []);

  function startEdit(link: SocialLinkItem) {
    setEditId(link.id);
    setForm({ label: link.label, url: link.url, type: link.type, order: link.order });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = editId
        ? await fetch(`/api/admin/links/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          })
        : await fetch("/api/admin/links", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form),
          });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        return;
      }

      cancelEdit();
      await loadLinks();
    } catch {
      setError("Could not save link.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this link?")) return;
    const res = await fetch(`/api/admin/links/${id}`, { method: "DELETE" });
    if (res.ok) loadLinks();
    else setError("Delete failed.");
  }

  return (
    <div className="glass-strong rounded-2xl p-6">
      <h2 className="mb-1 text-lg font-semibold text-text">Social Links</h2>
      <p className="mb-6 text-sm text-text-muted">
        Manage GitHub, Instagram, LinkedIn and any other links shown on your portfolio.
      </p>

      <form onSubmit={handleSubmit} className="mb-8 grid gap-3 sm:grid-cols-2">
        <input
          placeholder="Label (e.g. Instagram)"
          value={form.label}
          onChange={(e) => setForm({ ...form, label: e.target.value })}
          className="rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
          required
        />
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as LinkType })}
          className="rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm outline-none"
        >
          {LINK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
        <input
          placeholder="URL"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          className="rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 sm:col-span-2"
          required
        />
        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Saving..." : editId ? "Update Link" : "+ Add Link"}
          </button>
          {editId && (
            <button type="button" onClick={cancelEdit} className="rounded-xl border border-white/70 px-4 py-2.5 text-sm text-text-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-text-muted">Loading links...</p>
      ) : (
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/40 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="text-text-muted"><SocialIcon type={link.type} /></span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-text">{link.label}</p>
                  <p className="truncate text-xs text-text-muted">{link.url}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button type="button" onClick={() => startEdit(link)} className="text-xs font-medium text-primary hover:underline">
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(link.id)} className="text-xs font-medium text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
