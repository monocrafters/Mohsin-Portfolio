import { getDb, isMongoConnectionError } from "@/lib/mongodb";
import { aboutContent, skillGroups } from "@/data/content";

export type AboutHighlight = {
  label: string;
  value: string;
  unit: string;
};

export type PageContentSettings = {
  key: string;
  aboutLabel: string;
  aboutTitle: string;
  aboutIntro: string;
  aboutHighlights: AboutHighlight[];
  skillsLabel: string;
  skillsTitle: string;
  skillsItems: string[];
  updatedAt: Date;
};

const DEFAULT: Omit<PageContentSettings, "key" | "updatedAt"> = {
  aboutLabel: aboutContent.label,
  aboutTitle: aboutContent.title,
  aboutIntro: aboutContent.intro,
  aboutHighlights: aboutContent.highlights,
  skillsLabel: "Skills",
  skillsTitle: "My toolkit",
  skillsItems: skillGroups.flatMap((g) => g.items),
};

export async function getPageContent() {
  try {
    const db = await getDb();
    const doc = await db.collection<PageContentSettings>("page_content").findOne({ key: "main" });
    if (doc) return doc;
    return { key: "main", ...DEFAULT, updatedAt: new Date() };
  } catch (error) {
    if (isMongoConnectionError(error)) {
      return { key: "main", ...DEFAULT, updatedAt: new Date() };
    }
    throw error;
  }
}

export async function updatePageContent(data: Partial<Omit<PageContentSettings, "key" | "updatedAt">>) {
  const db = await getDb();
  const clean = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== undefined)
  ) as Partial<Omit<PageContentSettings, "key" | "updatedAt">>;

  await db.collection<PageContentSettings>("page_content").updateOne(
    { key: "main" },
    { $set: { ...clean, key: "main", updatedAt: new Date() } },
    { upsert: true }
  );
  return getPageContent();
}

export function toPublicContent(c: PageContentSettings) {
  return {
    aboutLabel: c.aboutLabel,
    aboutTitle: c.aboutTitle,
    aboutIntro: c.aboutIntro,
    aboutHighlights: c.aboutHighlights,
    skillsLabel: c.skillsLabel,
    skillsTitle: c.skillsTitle,
    skillsItems: c.skillsItems,
  };
}

export type PublicPageContent = ReturnType<typeof toPublicContent>;
