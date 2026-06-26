import PortfolioShell from "@/components/layout/PortfolioShell";
import { getAllLinks } from "@/lib/social-links";
import { getSiteSettings, toPublicSettings } from "@/lib/site-settings";
import { getPageContent, toPublicContent } from "@/lib/content-settings";
import { contactContent, siteConfig, aboutContent, skillGroups } from "@/data/content";

const fallbackSettings = {
  name: siteConfig.name,
  title: siteConfig.title,
  email: siteConfig.email,
  location: siteConfig.location,
  available: siteConfig.available,
  contactLabel: contactContent.label,
  contactTitle: contactContent.title,
  contactDescription: contactContent.description,
};

const fallbackContent = {
  aboutLabel: aboutContent.label,
  aboutTitle: aboutContent.title,
  aboutIntro: aboutContent.intro,
  aboutHighlights: aboutContent.highlights,
  skillsLabel: "Skills",
  skillsTitle: "My toolkit",
  skillsItems: skillGroups.flatMap((g) => g.items),
};

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, links, content] = await Promise.all([
    getSiteSettings()
      .then(toPublicSettings)
      .catch(() => fallbackSettings),
    getAllLinks().catch(() => []),
    getPageContent()
      .then(toPublicContent)
      .catch(() => fallbackContent),
  ]);

  return (
    <PortfolioShell settings={settings} links={links} content={content}>
      {children}
    </PortfolioShell>
  );
}
