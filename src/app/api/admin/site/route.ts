import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getSiteSettings, toPublicSettings, updateSiteSettings } from "@/lib/site-settings";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ settings: toPublicSettings(settings) });
  } catch (error) {
    console.error("Admin site fetch:", error);
    return NextResponse.json({ error: "Failed to load." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const settings = await updateSiteSettings({
      name: body.name !== undefined ? String(body.name).trim() : undefined,
      title: body.title !== undefined ? String(body.title).trim() : undefined,
      email: body.email !== undefined ? String(body.email).trim() : undefined,
      location: body.location !== undefined ? String(body.location).trim() : undefined,
      available: body.available !== undefined ? Boolean(body.available) : undefined,
      contactLabel: body.contactLabel !== undefined ? String(body.contactLabel).trim() : undefined,
      contactTitle: body.contactTitle !== undefined ? String(body.contactTitle).trim() : undefined,
      contactDescription: body.contactDescription !== undefined ? String(body.contactDescription).trim() : undefined,
    });
    return NextResponse.json({ settings: toPublicSettings(settings) });
  } catch (error) {
    console.error("Admin site update:", error);
    return NextResponse.json({ error: "Failed to save." }, { status: 500 });
  }
}
