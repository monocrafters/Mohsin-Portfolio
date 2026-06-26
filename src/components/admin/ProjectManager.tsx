"use client";

import { useEffect, useRef, useState } from "react";
import type { ProjectItem } from "@/components/ui/ProjectCard";

const COLORS = ["#2563eb", "#16a34a", "#7c3aed", "#ea580c", "#0891b2", "#db2777"];

const emptyForm = {
  title: "",
  description: "",
  tags: "",
  link: "",
  github: "",
  image: "",
  year: String(new Date().getFullYear()),
  color: COLORS[0],
};

export default function ProjectManager() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadProjects() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/projects");
      const data = await res.json();
      if (res.ok) setProjects(data.projects || []);
      else setError(data.error || "Failed to load");
    } catch {
      setError("Could not load projects.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  function startEdit(p: ProjectItem) {
    setEditId(p.id);
    setForm({
      title: p.title,
      description: p.description,
      tags: p.tags.join(", "),
      link: p.link === "#" ? "" : p.link,
      github: p.github === "#" ? "" : p.github,
      image: p.image || "",
      year: p.year,
      color: p.color,
    });
  }

  function cancelEdit() {
    setEditId(null);
    setForm(emptyForm);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Upload failed.");
        return;
      }
      setForm((prev) => ({ ...prev, image: data.url }));
    } catch {
      setError("Could not upload image.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      link: form.link.trim() || "#",
      github: form.github.trim() || "#",
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    try {
      const res = editId
        ? await fetch(`/api/admin/projects/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/projects", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed.");
        return;
      }

      cancelEdit();
      await loadProjects();
    } catch {
      setError("Could not save. Check MongoDB connection.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this project?")) return;
    const res = await fetch(`/api/admin/projects/${id}`, { method: "DELETE" });
    if (res.ok) loadProjects();
    else setError("Delete failed.");
  }

  return (
    <div className="glass-strong rounded-2xl p-6">
      <h2 className="mb-1 text-lg font-semibold text-text">Projects</h2>
      <p className="mb-6 text-sm text-text-muted">
        Live URL se auto preview aata hai. Agar site nahi hai to cover image upload karein aur GitHub
        link add karein.
      </p>

      <form onSubmit={handleSubmit} className="mb-8 grid gap-3 sm:grid-cols-2">
        <input
          placeholder="Project title *"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 sm:col-span-2"
          required
        />
        <textarea
          placeholder="Short description *"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="min-h-[80px] rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 sm:col-span-2"
          required
        />
        <input
          placeholder="Tags (comma separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          placeholder="Year"
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
          className="rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
        />
        <input
          placeholder="Live website URL (optional — auto preview)"
          value={form.link}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
          className="rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 sm:col-span-2"
        />
        <input
          placeholder="GitHub / source code URL (optional)"
          value={form.github}
          onChange={(e) => setForm({ ...form, github: e.target.value })}
          className="rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 sm:col-span-2"
        />

        <div className="space-y-2 sm:col-span-2">
          <p className="text-xs font-medium text-text-muted">Cover image (optional)</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              placeholder="Image URL or upload below"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              className="min-w-0 flex-1 rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            />
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="shrink-0 rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-primary disabled:opacity-60"
            >
              {uploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>
          {form.image && (
            <div className="relative h-28 w-full overflow-hidden rounded-xl ring-1 ring-white/60 sm:w-48">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.image} alt="Cover preview" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => setForm({ ...form, image: "" })}
                className="absolute right-2 top-2 rounded-lg bg-black/50 px-2 py-0.5 text-xs text-white"
              >
                Remove
              </button>
            </div>
          )}
          <p className="text-xs text-text-muted">
            Kam se kam ek cheez zaroori: Live URL, cover image, ya GitHub link.
          </p>
        </div>

        <select
          value={form.color}
          onChange={(e) => setForm({ ...form, color: e.target.value })}
          className="rounded-xl border border-white/70 bg-white/60 px-4 py-2.5 text-sm outline-none sm:col-span-2"
        >
          {COLORS.map((c) => (
            <option key={c} value={c}>
              Accent {c}
            </option>
          ))}
        </select>
        <div className="flex gap-2 sm:col-span-2">
          <button
            type="submit"
            disabled={saving || uploading}
            className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-60"
          >
            {saving ? "Saving..." : editId ? "Update Project" : "+ Add Project"}
          </button>
          {editId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-white/70 px-4 py-2.5 text-sm text-text-secondary"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-sm text-text-muted">Loading projects...</p>
      ) : (
        <ul className="space-y-2">
          {projects.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-white/60 bg-white/40 px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-text">{p.title}</p>
                <p className="truncate text-xs text-text-muted">
                  {p.year} · {p.image ? "Custom image" : p.link !== "#" ? p.link : "No live URL"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(p)}
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="text-xs font-medium text-red-600 hover:underline"
                >
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
