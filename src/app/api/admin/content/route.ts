import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getPageContent, toPublicContent, updatePageContent } from "@/lib/content-settings";
import { getMongoErrorMessage, isMongoConnectionError } from "@/lib/mongodb";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const content = await getPageContent();
    return NextResponse.json({ content: toPublicContent(content) });
  } catch (error) {
    console.error("Admin content fetch:", error);
    const message = isMongoConnectionError(error)
      ? getMongoErrorMessage(error)
      : "Failed to load content.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function PUT(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const highlights = Array.isArray(body.aboutHighlights)
      ? body.aboutHighlights.map((h: AboutHighlightInput) => ({
          label: String(h.label || "").trim(),
          value: String(h.value || "").trim(),
          unit: String(h.unit || "").trim(),
        }))
      : undefined;

    const skillsItems = Array.isArray(body.skillsItems)
      ? body.skillsItems.map(String).map((s: string) => s.trim()).filter(Boolean)
      : undefined;

    const content = await updatePageContent({
      aboutLabel: body.aboutLabel !== undefined ? String(body.aboutLabel).trim() : undefined,
      aboutTitle: body.aboutTitle !== undefined ? String(body.aboutTitle).trim() : undefined,
      aboutIntro: body.aboutIntro !== undefined ? String(body.aboutIntro).trim() : undefined,
      aboutHighlights: highlights,
      skillsLabel: body.skillsLabel !== undefined ? String(body.skillsLabel).trim() : undefined,
      skillsTitle: body.skillsTitle !== undefined ? String(body.skillsTitle).trim() : undefined,
      skillsItems,
    });

    return NextResponse.json({ content: toPublicContent(content) });
  } catch (error) {
    console.error("Admin content update:", error);
    const message = isMongoConnectionError(error)
      ? getMongoErrorMessage(error)
      : "Failed to save content.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

type AboutHighlightInput = { label?: string; value?: string; unit?: string };
