import { ObjectId, type WithId } from "mongodb";
import { getDb, isMongoConnectionError } from "@/lib/mongodb";
import { resolveProjectLinks, sanitizeLinkForDb } from "@/lib/project-links";

export type Project = {
  title: string;
  description: string;
  tags: string[];
  link: string;
  github: string;
  year: string;
  color: string;
  image?: string;
  createdAt: Date;
};

export type ProjectDoc = WithId<Project>;

const SEED_PROJECTS: Project[] = [
  {
    title: "Shop Inventory",
    description: "Stock tracking for a local retail store.",
    tags: ["Next.js", "Node.js", "PostgreSQL"],
    link: "#",
    github: "#",
    year: "2025",
    color: "#2563eb",
    createdAt: new Date(),
  },
  {
    title: "Clinic Booking",
    description: "Online appointments with admin panel.",
    tags: ["React", "Express", "MongoDB"],
    link: "#",
    github: "#",
    year: "2024",
    color: "#16a34a",
    createdAt: new Date(),
  },
  {
    title: "Portfolio Template",
    description: "Fast portfolio for a designer friend.",
    tags: ["Next.js", "Tailwind"],
    link: "#",
    github: "#",
    year: "2024",
    color: "#7c3aed",
    createdAt: new Date(),
  },
  {
    title: "Team Dashboard",
    description: "Task tracking — replaced Google Sheets.",
    tags: ["React", "TypeScript", "Firebase"],
    link: "#",
    github: "#",
    year: "2023",
    color: "#ea580c",
    createdAt: new Date(),
  },
];

function serializeProject(doc: ProjectDoc) {
  const resolved = resolveProjectLinks(doc.link, doc.github);
  return {
    id: doc._id.toString(),
    title: doc.title,
    description: doc.description,
    tags: doc.tags,
    link: sanitizeLinkForDb(resolved.live),
    github: sanitizeLinkForDb(resolved.github),
    year: doc.year,
    color: doc.color,
    image: doc.image || "",
  };
}

export function normalizeProjectInput(data: {
  link?: string;
  github?: string;
}) {
  const resolved = resolveProjectLinks(data.link, data.github);
  return {
    link: sanitizeLinkForDb(resolved.live),
    github: sanitizeLinkForDb(resolved.github),
  };
}

export function validateProjectPayload(body: {
  title?: string;
  description?: string;
  link?: string;
  github?: string;
  image?: string;
}) {
  const title = String(body.title || "").trim();
  const description = String(body.description || "").trim();
  const image = String(body.image || "").trim();
  const resolved = resolveProjectLinks(body.link, body.github);

  if (!title || !description) {
    return { error: "Title and description required." as const };
  }

  return {
    data: {
      title,
      description,
      link: sanitizeLinkForDb(resolved.live),
      github: sanitizeLinkForDb(resolved.github),
      image: image || undefined,
    },
  };
}

export async function seedProjectsIfEmpty() {
  const db = await getDb();
  const collection = db.collection<Project>("projects");
  const count = await collection.countDocuments();
  if (count === 0) {
    await collection.insertMany(SEED_PROJECTS);
  }
}

export async function getAllProjects() {
  try {
    await seedProjectsIfEmpty();
    const db = await getDb();
    const docs = await db
      .collection<Project>("projects")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map(serializeProject);
  } catch (error) {
    if (isMongoConnectionError(error)) {
      throw error;
    }
    throw error;
  }
}

/** Public site — show demo projects if DB is down */
export async function getAllProjectsPublic() {
  try {
    return await getAllProjects();
  } catch (error) {
    if (isMongoConnectionError(error)) {
      return SEED_PROJECTS.map((p, i) => ({
        id: String(i + 1),
        ...p,
        image: "",
      }));
    }
    throw error;
  }
}

export async function createProject(data: Omit<Project, "createdAt">) {
  const db = await getDb();
  const result = await db.collection<Project>("projects").insertOne({
    ...data,
    createdAt: new Date(),
  });
  const doc = await db.collection<Project>("projects").findOne({ _id: result.insertedId });
  if (!doc) throw new Error("Failed to create project");
  return serializeProject(doc as ProjectDoc);
}

export async function deleteProject(id: string) {
  const db = await getDb();
  const result = await db.collection<Project>("projects").deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function updateProject(id: string, data: Partial<Omit<Project, "createdAt">>) {
  const db = await getDb();
  const result = await db.collection<Project>("projects").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: data },
    { returnDocument: "after" }
  );
  if (!result) throw new Error("Project not found");
  return serializeProject(result as ProjectDoc);
}
