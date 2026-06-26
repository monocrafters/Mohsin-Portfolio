"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { navLinks, siteConfig, contactContent } from "@/data/content";
import NavIcon from "@/components/ui/NavIcon";
import HamburgerButton from "@/components/layout/HamburgerButton";
import SidebarSocialLinks from "@/components/layout/SidebarSocialLinks";
import { useLiveSiteSettings } from "@/hooks/useLiveSiteData";
import { motion, AnimatePresence } from "framer-motion";

const SCROLL_OFFSET = 140;

function resolveActiveSection(): string {
  if (typeof window === "undefined") return navLinks[0].href;

  const atBottom =
    window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
  if (atBottom) return navLinks[navLinks.length - 1].href;

  let current = navLinks[0].href;

  for (const link of navLinks) {
    const el = document.querySelector(link.href);
    if (!el) continue;
    const top = el.getBoundingClientRect().top;
    if (top <= SCROLL_OFFSET) {
      current = link.href;
    }
  }

  return current;
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const settings = useLiveSiteSettings({
    name: siteConfig.name,
    title: siteConfig.title,
    email: siteConfig.email,
    location: siteConfig.location,
    available: siteConfig.available,
    contactLabel: contactContent.label,
    contactTitle: contactContent.title,
    contactDescription: contactContent.description,
  });
  const [activeHref, setActiveHref] = useState("#home");
  const displayName = settings.name.split(" ")[0] || siteConfig.name.split(" ")[0];

  useEffect(() => {
    function syncActive() {
      setActiveHref(resolveActiveSection());
    }

    syncActive();

    if (window.location.hash && navLinks.some((l) => l.href === window.location.hash)) {
      setActiveHref(window.location.hash);
    }

    window.addEventListener("scroll", syncActive, { passive: true });
    window.addEventListener("hashchange", syncActive);
    window.addEventListener("resize", syncActive);

    return () => {
      window.removeEventListener("scroll", syncActive);
      window.removeEventListener("hashchange", syncActive);
      window.removeEventListener("resize", syncActive);
    };
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8 px-1">
        <Link href="#home" onClick={onNavigate} className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary-light text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition-transform duration-300 group-hover:scale-105">
            MA
          </div>
          <div>
            <p className="text-sm font-semibold text-text">{displayName}</p>
            <p className="text-xs text-text-muted">Portfolio</p>
          </div>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navLinks.map((link, index) => {
          const isActive = activeHref === link.href;
          return (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <Link
                href={link.href}
                onClick={() => {
                  setActiveHref(link.href);
                  onNavigate?.();
                }}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
                  isActive ? "text-primary-dark" : "text-text-secondary hover:text-primary"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="glass absolute inset-0 rounded-xl bg-white/80"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-3">
                  <span
                    className={`transition-colors duration-300 ${
                      isActive ? "text-primary" : "text-text-muted group-hover:text-primary-light"
                    }`}
                  >
                    <NavIcon name={link.icon} />
                  </span>
                  {link.label}
                </span>
                {isActive && (
                  <span className="relative z-10 ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            </motion.div>
          );
        })}
      </nav>

      <div className="mt-auto space-y-4 pt-5">
        <SidebarSocialLinks />
        {settings.available && (
          <div className="border-t border-white/50 pt-4">
            <div className="glass rounded-xl px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-medium text-text-secondary">Available for work</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [headerScrolled, setHeaderScrolled] = useState(false);
  const settings = useLiveSiteSettings({
    name: siteConfig.name,
    title: siteConfig.title,
    email: siteConfig.email,
    location: siteConfig.location,
    available: siteConfig.available,
    contactLabel: contactContent.label,
    contactTitle: contactContent.title,
    contactDescription: contactContent.description,
  });
  const displayName = settings.name.split(" ")[0] || siteConfig.name.split(" ")[0];

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onScroll = () => setHeaderScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 right-0 top-0 z-40 flex items-center justify-between px-4 py-3 transition-all duration-300 lg:hidden ${
          headerScrolled
            ? "glass-strong border-b border-white/50 shadow-sm backdrop-blur-xl"
            : "bg-transparent"
        }`}
      >
        <Link href="#home" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary-light text-xs font-bold text-white shadow-md">
            MA
          </div>
          <span className="text-sm font-semibold text-text">{displayName}</span>
        </Link>
        <HamburgerButton open={mobileOpen} onClick={() => setMobileOpen((v) => !v)} />
      </header>

      <aside className="fixed left-0 top-0 z-30 hidden h-full w-64 p-5 lg:block">
        <div className="glass-strong h-full rounded-2xl p-5">
          <SidebarContent />
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
              className="glass-strong fixed left-0 top-0 z-50 h-full w-[min(85vw,280px)] p-5 pt-20 lg:hidden"
            >
              <SidebarContent onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
