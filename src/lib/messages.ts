import { ObjectId, type WithId } from "mongodb";
import { getDb, isMongoConnectionError } from "@/lib/mongodb";

export type ContactMessage = {
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: Date;
};

export type ContactMessageDoc = WithId<ContactMessage>;

function serialize(doc: ContactMessageDoc) {
  return {
    id: doc._id.toString(),
    name: doc.name,
    email: doc.email,
    message: doc.message,
    read: doc.read,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function createMessage(data: { name: string; email: string; message: string }) {
  const db = await getDb();
  const result = await db.collection<ContactMessage>("messages").insertOne({
    ...data,
    read: false,
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function getAllMessages() {
  try {
    const db = await getDb();
    const docs = await db
      .collection<ContactMessage>("messages")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    return docs.map((d) => serialize(d as ContactMessageDoc));
  } catch (error) {
    if (isMongoConnectionError(error)) return [];
    throw error;
  }
}

export async function markMessageRead(id: string, read: boolean) {
  const db = await getDb();
  const result = await db.collection<ContactMessage>("messages").findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: { read } },
    { returnDocument: "after" }
  );
  return !!result;
}

export async function deleteMessage(id: string) {
  const db = await getDb();
  const result = await db.collection<ContactMessage>("messages").deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function getUnreadCount() {
  try {
    const db = await getDb();
    return db.collection<ContactMessage>("messages").countDocuments({ read: false });
  } catch {
    return 0;
  }
}
