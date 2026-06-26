import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function mimeFromExtension(ext: string): string | null {
  const map: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
  };
  return map[ext] ?? null;
}

function resolveMime(file: File): string | null {
  if (file.type && ALLOWED.has(file.type)) return file.type;

  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const fromExt = mimeFromExtension(ext);
  if (fromExt) return fromExt;

  return null;
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    const mime = resolveMime(file);
    if (!mime) {
      return NextResponse.json({ error: "Only JPG, PNG, WebP or GIF allowed." }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be under 2 MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64 = buffer.toString("base64");
    const url = `data:${mime};base64,${base64}`;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
