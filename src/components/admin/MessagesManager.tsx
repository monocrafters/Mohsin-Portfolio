"use client";

import { useEffect, useState } from "react";

type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function MessagesManager() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/messages");
      const data = await res.json();
      if (res.ok) setMessages(data.messages || []);
      else setError(data.error || "Failed to load messages.");
    } catch {
      setError("Could not load messages.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggleRead(msg: Message) {
    try {
      const res = await fetch(`/api/admin/messages/${msg.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: !msg.read }),
      });
      if (res.ok) {
        setMessages((prev) =>
          prev.map((m) => (m.id === msg.id ? { ...m, read: !m.read } : m))
        );
      }
    } catch {
      setError("Could not update message.");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    try {
      const res = await fetch(`/api/admin/messages/${id}`, { method: "DELETE" });
      if (res.ok) setMessages((prev) => prev.filter((m) => m.id !== id));
    } catch {
      setError("Could not delete message.");
    }
  }

  const unread = messages.filter((m) => !m.read).length;

  return (
    <div>
      <div className="glass-strong mb-6 rounded-2xl px-6 py-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-text">Messages</h1>
            <p className="text-sm text-text-muted">Contact form submissions from your portfolio.</p>
          </div>
          {unread > 0 && (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
              {unread} unread
            </span>
          )}
        </div>
      </div>

      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-strong h-20 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : messages.length === 0 ? (
        <div className="glass-strong rounded-2xl p-8 text-center text-sm text-text-muted">
          No messages yet.
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((msg) => {
            const expanded = expandedId === msg.id;
            return (
              <article
                key={msg.id}
                className={`glass-strong rounded-2xl p-4 transition ${
                  !msg.read ? "ring-2 ring-primary/30" : ""
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {!msg.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />}
                      <p className="font-semibold text-text">{msg.name}</p>
                    </div>
                    <a
                      href={`mailto:${msg.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {msg.email}
                    </a>
                    <p className="mt-1 text-xs text-text-muted">
                      {new Date(msg.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : msg.id)}
                      className="rounded-lg bg-white/50 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary"
                    >
                      {expanded ? "Hide" : "Read"}
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleRead(msg)}
                      className="rounded-lg bg-white/50 px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary"
                    >
                      {msg.read ? "Mark unread" : "Mark read"}
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(msg.id)}
                      className="rounded-lg bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {expanded && (
                  <p className="mt-3 whitespace-pre-wrap rounded-xl bg-white/40 p-4 text-sm leading-relaxed text-text-secondary">
                    {msg.message}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
