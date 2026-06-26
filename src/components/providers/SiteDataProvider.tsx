"use client";

import { createContext, useContext } from "react";
import type { SocialLinkItem } from "@/components/ui/SocialLinks";
import type { PublicPageContent } from "@/lib/content-settings";

export type PublicSiteSettings = {
  name: string;
  title: string;
  email: string;
  location: string;
  available: boolean;
  contactLabel: string;
  contactTitle: string;
  contactDescription: string;
};

type SiteDataContextValue = {
  settings: PublicSiteSettings;
  links: SocialLinkItem[];
  content: PublicPageContent;
};

const SiteDataContext = createContext<SiteDataContextValue | null>(null);

export function SiteDataProvider({
  children,
  settings,
  links,
  content,
}: {
  children: React.ReactNode;
  settings: PublicSiteSettings;
  links: SocialLinkItem[];
  content: PublicPageContent;
}) {
  return (
    <SiteDataContext.Provider value={{ settings, links, content }}>{children}</SiteDataContext.Provider>
  );
}

export function useSiteData() {
  return useContext(SiteDataContext);
}
