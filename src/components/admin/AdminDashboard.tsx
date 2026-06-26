"use client";

import { useEffect, useState } from "react";
import AdminShell from "@/components/admin/AdminShell";
import ProjectManager from "@/components/admin/ProjectManager";
import LinkManager from "@/components/admin/LinkManager";
import SiteInfoManager from "@/components/admin/SiteInfoManager";
import ContentManager from "@/components/admin/ContentManager";
import MessagesManager from "@/components/admin/MessagesManager";
import { siteConfig } from "@/data/content";

type AdminDashboardProps = {
  username: string;
};

export default function AdminDashboard({ username }: AdminDashboardProps) {
  const [siteName, setSiteName] = useState(siteConfig.name);
  const [siteEmail, setSiteEmail] = useState(siteConfig.email);
  const [available, setAvailable] = useState(siteConfig.available);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/site")
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) {
          setSiteName(d.settings.name);
          setSiteEmail(d.settings.email);
          setAvailable(d.settings.available);
        }
      })
      .catch(() => {});

    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d) => setMessageCount((d.messages || []).length))
      .catch(() => {});
  }, []);

  return (
    <AdminShell username={username}>
      {(tab) => {
        if (tab === "projects") return <ProjectManager />;
        if (tab === "links") return <LinkManager />;
        if (tab === "site") return <SiteInfoManager />;
        if (tab === "content") return <ContentManager />;
        if (tab === "messages") return <MessagesManager />;

        return (
          <>
            <div className="glass-strong mb-6 rounded-2xl px-6 py-5">
              <h1 className="text-xl font-bold text-text">Dashboard</h1>
              <p className="text-sm text-text-muted">Welcome back, {username}</p>
            </div>
            <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Site", value: siteName },
                { label: "Status", value: available ? "Open" : "Busy" },
                { label: "Email", value: siteEmail },
                { label: "Messages", value: String(messageCount) },
              ].map((s) => (
                <div key={s.label} className="glass-strong rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-wide text-text-muted">{s.label}</p>
                  <p className="mt-1 truncate text-sm font-semibold text-text">{s.value}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-text-muted">
              Manage <strong>Projects</strong>, <strong>About & Skills</strong>,{" "}
              <strong>Site Info</strong>, and read <strong>Messages</strong> from the sidebar.
            </p>
          </>
        );
      }}
    </AdminShell>
  );
}
