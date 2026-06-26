import { ObjectId, type WithId } from "mongodb";
import { getDb, isMongoConnectionError } from "@/lib/mongodb";

export type LinkType =
  | "github"
  | "linkedin"
  | "instagram"
  | "twitter"
  | "facebook"
  | "youtube"
  | "email"
  | "website"
  | "other";

export type SocialLink = {
  label: string;
  url: string;
  type: LinkType;
  order: number;
  createdAt: Date;
};

export type SocialLinkDoc = WithId<SocialLink>;

const SEED_LINKS: SocialLink[] = [
  { label: "GitHub", url: "https://github.com", type: "github", order: 0, createdAt: new Date() },
  { label: "LinkedIn", url: "https://linkedin.com", type: "linkedin", order: 1, createdAt: new Date() },
  { label: "Instagram", url: "https://instagram.com", type: "instagram", order: 2, createdAt: new Date() },
];

function serializeLink(doc: SocialLinkDoc) {
  return {
    id: doc._id.toString(),
    label: doc.label,
    url: doc.url,
    type: doc.type,
    order: doc.order,
  };
}

export async function seedLinksIfEmpty() {
  const db = await getDb();
  const collection = db.collection<SocialLink>("social_links");
  const count = await collection.countDocuments();
  if (count === 0) {
    await collection.insertMany(SEED_LINKS);
  }
}

export async function getAllLinks() {
  try {
    await seedLinksIfEmpty();
    const db = await getDb();
    const docs = await db
      .collection<SocialLink>("social_links")
      .find({})
      .sort({ order: 1, createdAt: 1 })
      .toArray();
    return docs.map(serializeLink);
  } catch (error) {
    if (isMongoConnectionError(error)) {
      return SEED_LINKS.map((l, i) => ({
        id: String(i + 1),
        label: l.label,
        url: l.url,
        type: l.type,
        order: l.order,
      }));
    }
    throw error;
  }
}

export async function createLink(data: Omit<SocialLink, "createdAt">) {
  const db = await getDb();
  const result = await db.collection<SocialLink>("social_links").insertOne({
    ...data,
    createdAt: new Date(),
  });
  const doc = await db.collection<SocialLink>("social_links").findOne({ _id: result.insertedId });
  if (!doc) throw new Error("Failed to create link");
  return serializeLink(doc as SocialLinkDoc);
}

export async function updateLink(id: string, data: Partial<Omit<SocialLink, "createdAt">>) {
  const db = await getDb();
  const result = await db.collection<SocialLink>("social_links").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: data },
    { returnDocument: "after" }
  );
  if (!result) throw new Error("Link not found");
  return serializeLink(result as SocialLinkDoc);
}

export async function deleteLink(id: string) {
  const db = await getDb();
  const result = await db.collection<SocialLink>("social_links").deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}
