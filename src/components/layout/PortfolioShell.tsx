import FlockBackground from "@/components/background/FlockBackground";
import GlassOverlay from "@/components/background/GlassOverlay";
import Sidebar from "@/components/layout/Sidebar";
import { SiteDataProvider, type PublicSiteSettings } from "@/components/providers/SiteDataProvider";
import type { SocialLinkItem } from "@/components/ui/SocialLinks";
import type { PublicPageContent } from "@/lib/content-settings";

export default function PortfolioShell({
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
    <SiteDataProvider settings={settings} links={links} content={content}>
      <FlockBackground />
      <GlassOverlay />
      <Sidebar />
      <div className="relative z-10 lg:pl-64">
        <main>{children}</main>
      </div>
    </SiteDataProvider>
  );
}
