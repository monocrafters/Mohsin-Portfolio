import { getDb, isMongoConnectionError } from "@/lib/mongodb";
import { contactContent, siteConfig } from "@/data/content";

export type SiteSettings = {
  key: string;
  name: string;
  title: string;
  email: string;
  location: string;
  available: boolean;
  contactLabel: string;
  contactTitle: string;
  contactDescription: string;
  updatedAt: Date;
};

const DEFAULT: Omit<SiteSettings, "key" | "updatedAt"> = {
  name: siteConfig.name,
  title: siteConfig.title,
  email: siteConfig.email,
  location: siteConfig.location,
  available: siteConfig.available,
  contactLabel: contactContent.label,
  contactTitle: contactContent.title,
  contactDescription: contactContent.description,
};

export async function getSiteSettings() {
  try {
    const db = await getDb();
    const doc = await db.collection<SiteSettings>("site_settings").findOne({ key: "main" });
    if (doc) return doc;
    return { key: "main", ...DEFAULT, updatedAt: new Date() };
  } catch (error) {
    if (isMongoConnectionError(error)) {
      return { key: "main", ...DEFAULT, updatedAt: new Date() };
    }
    throw error;
  }
}

export async function updateSiteSettings(data: Partial<Omit<SiteSettings, "key" | "updatedAt">>) {
  const db = await getDb();
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  ) as Partial<Omit<SiteSettings, "key" | "updatedAt">>;

  await db.collection<SiteSettings>("site_settings").updateOne(
    { key: "main" },
    { $set: { ...clean, key: "main", updatedAt: new Date() } },
    { upsert: true }
  );
  return getSiteSettings();
}

export function toPublicSettings(s: SiteSettings) {
  return {
    name: s.name,
    title: s.title,
    email: s.email,
    location: s.location,
    available: s.available,
    contactLabel: s.contactLabel,
    contactTitle: s.contactTitle,
    contactDescription: s.contactDescription,
  };
}
