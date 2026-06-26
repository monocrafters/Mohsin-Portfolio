"use client";

import Link from "next/link";
import type { SocialLinkItem } from "@/components/ui/SocialLinks";
import { SocialIcon } from "@/components/ui/SocialLinks";
import { useSiteData } from "@/components/providers/SiteDataProvider";

export default function SidebarSocialLinks() {
  const siteData = useSiteData();
  const links = (siteData?.links ?? []).slice(0, 4);

  if (links.length === 0) return null;

  return (
    <div className="border-t border-white/50 pt-4">
      <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-text-muted">Connect</p>
      <div className="flex flex-wrap gap-2 px-1">
        {links.map((link: SocialLinkItem) => (
          <Link
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={link.label}
            className="glass flex h-9 w-9 items-center justify-center rounded-xl text-text-muted transition hover:text-primary"
          >
            <SocialIcon type={link.type} />
          </Link>
        ))}
      </div>
    </div>
  );
}
