import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { createLink, getAllLinks, type LinkType } from "@/lib/social-links";
import { normalizeSocialLinkUrl } from "@/lib/social-link-url";

export const dynamic = "force-dynamic";

const VALID_TYPES: LinkType[] = [
  "github", "linkedin", "instagram", "twitter",
  "facebook", "youtube", "email", "website", "other",
];

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const links = await getAllLinks();
    return NextResponse.json({ links });
  } catch (error) {
    console.error("Admin links fetch:", error);
    return NextResponse.json({ error: "Failed to load links." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const label = String(body.label || "").trim();
    const url = String(body.url || "").trim();
    const type = VALID_TYPES.includes(body.type) ? body.type : "other";

    if (!label || !url) {
      return NextResponse.json({ error: "Label and URL required." }, { status: 400 });
    }

    const link = await createLink({
      label,
      url: normalizeSocialLinkUrl(url, type),
      type,
      order: Number(body.order) || 0,
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    console.error("Create link error:", error);
    return NextResponse.json({ error: "Could not save link." }, { status: 500 });
  }
}
