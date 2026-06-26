"use client";

import { useEffect, useState } from "react";
import { useSiteData, type PublicSiteSettings } from "@/components/providers/SiteDataProvider";
import type { SocialLinkItem } from "@/components/ui/SocialLinks";

export function useLiveSiteSettings(fallback: PublicSiteSettings): PublicSiteSettings {
  const siteData = useSiteData();
  const [settings, setSettings] = useState<PublicSiteSettings>(siteData?.settings ?? fallback);

  useEffect(() => {
    if (siteData?.settings) setSettings(siteData.settings);

    fetch("/api/site", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (d.settings) setSettings(d.settings);
      })
      .catch(() => {});
  }, [siteData]);

  return settings;
}

export function useLiveSocialLinks(): SocialLinkItem[] {
  const siteData = useSiteData();
  const [links, setLinks] = useState<SocialLinkItem[]>(siteData?.links ?? []);

  useEffect(() => {
    if (siteData?.links) setLinks(siteData.links);

    fetch("/api/links", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => setLinks(d.links || []))
      .catch(() => setLinks([]));
  }, [siteData]);

  return links;
}
