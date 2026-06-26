import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { deleteLink, updateLink, type LinkType } from "@/lib/social-links";
import { normalizeSocialLinkUrl } from "@/lib/social-link-url";

export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

const VALID_TYPES: LinkType[] = [
  "github", "linkedin", "instagram", "twitter",
  "facebook", "youtube", "email", "website", "other",
];

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;
    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (body.label !== undefined) update.label = String(body.label).trim();
    if (body.url !== undefined) {
      const type = VALID_TYPES.includes(body.type) ? body.type : "other";
      update.url = normalizeSocialLinkUrl(String(body.url).trim(), type);
    }
    if (body.type !== undefined && VALID_TYPES.includes(body.type)) update.type = body.type;
    if (body.order !== undefined) update.order = Number(body.order);

    const link = await updateLink(id, update);
    return NextResponse.json({ link });
  } catch (error) {
    console.error("Update link error:", error);
    const message = error instanceof Error ? error.message : "Failed to update link.";
    const status = message === "Invalid link id" || message === "Link not found" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;
    const deleted = await deleteLink(id);
    if (!deleted) return NextResponse.json({ error: "Link not found." }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete link error:", error);
    const message = error instanceof Error ? error.message : "Failed to delete link.";
    const status = message === "Invalid link id" ? 400 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
