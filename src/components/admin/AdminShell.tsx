"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import HamburgerButton from "@/components/layout/HamburgerButton";

export type AdminTab = "overview" | "projects" | "links" | "site" | "content" | "messages";

type AdminShellProps = {
  username: string;
  children: (tab: AdminTab) => React.ReactNode;
};

const NAV: { id: AdminTab; label: string; icon: string }[] = [
  { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { id: "projects", label: "Projects", icon: "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" },
  { id: "links", label: "Social Links", icon: "M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" },
  { id: "site", label: "Site Info", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
  { id: "content", label: "About & Skills", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
  { id: "messages", label: "Messages", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
];

function SidebarNav({
  active,
  onChange,
  onNavigate,
  unreadCount,
}: {
  active: AdminTab;
  onChange: (t: AdminTab) => void;
  onNavigate?: () => void;
  unreadCount: number;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => {
            onChange(item.id);
            onNavigate?.();
          }}
          className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
            active === item.id ? "text-primary-dark" : "text-text-secondary hover:text-primary"
          }`}
        >
          {active === item.id && (
            <span className="glass absolute inset-0 rounded-xl bg-white/80" />
          )}
          <svg className="relative z-10 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
          </svg>
          <span className="relative z-10 flex flex-1 items-center justify-between gap-2">
            {item.label}
            {item.id === "messages" && unreadCount > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </span>
        </button>
      ))}
    </nav>
  );
}

export default function AdminShell({ username, children }: AdminShellProps) {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    fetch("/api/admin/messages")
      .then((r) => r.json())
      .then((d) => {
        const count = (d.messages || []).filter((m: { read: boolean }) => !m.read).length;
        setUnreadCount(count);
      })
      .catch(() => {});
  }, [tab]);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin_login");
    router.refresh();
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#e8eef8]">
      <div className="bg-orb bg-orb-blue animate-orb-a absolute -left-[5%] top-[5%] h-[35vh] w-[35vh] rounded-full" />
      <div className="bg-orb bg-orb-orange animate-orb-b absolute bottom-[5%] right-[0%] h-[30vh] w-[30vh] rounded-full" />

      <header className="fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-4 py-4 lg:hidden">
        <p className="text-sm font-semibold text-text">Admin</p>
        <HamburgerButton open={mobileOpen} onClick={() => setMobileOpen((v) => !v)} />
      </header>

      <div className="relative z-10 flex min-h-[100dvh]">
        <aside className="hidden w-64 shrink-0 p-5 lg:block">
          <div className="glass-strong sticky top-5 flex h-[calc(100dvh-2.5rem)] flex-col rounded-2xl p-5">
            <div className="mb-6">
              <p className="text-xs font-medium uppercase tracking-wide text-text-muted">Admin Panel</p>
              <p className="mt-1 font-semibold text-text">{username}</p>
            </div>
            <SidebarNav active={tab} onChange={setTab} unreadCount={unreadCount} />
            <div className="mt-auto space-y-2 border-t border-white/50 pt-4">
              <Link href="/" className="block rounded-xl px-3 py-2 text-sm text-text-secondary hover:text-primary">
                View Site
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-white hover:bg-primary-dark"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm lg:hidden"
                onClick={() => setMobileOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 320, damping: 32 }}
                className="glass-strong fixed left-0 top-0 z-50 flex h-full w-[min(85vw,280px)] flex-col p-5 pt-20 lg:hidden"
              >
                <SidebarNav
                  active={tab}
                  onChange={setTab}
                  onNavigate={() => setMobileOpen(false)}
                  unreadCount={unreadCount}
                />
                <div className="mt-auto space-y-2 border-t border-white/50 pt-4">
                  <Link href="/" className="block rounded-xl px-3 py-2 text-sm text-text-secondary">
                    View Site
                  </Link>
                  <button type="button" onClick={handleLogout} className="w-full rounded-xl bg-primary py-2 text-sm font-semibold text-white">
                    Logout
                  </button>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 overflow-y-auto px-4 py-20 lg:px-6 lg:py-8">
          <div className="mx-auto max-w-4xl">{children(tab)}</div>
        </main>
      </div>
    </div>
  );
}
