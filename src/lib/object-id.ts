import { ObjectId } from "mongodb";

export function parseObjectId(id: string): ObjectId | null {
  if (!id || !ObjectId.isValid(id)) return null;
  try {
    return new ObjectId(id);
  } catch {
    return null;
  }
}
