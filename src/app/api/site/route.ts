import { NextResponse } from "next/server";
import { getSiteSettings, toPublicSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const settings = await getSiteSettings();
    return NextResponse.json(
      { settings: toPublicSettings(settings) },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Site settings fetch:", error);
    return NextResponse.json({ error: "Failed to load site info." }, { status: 500 });
  }
}
