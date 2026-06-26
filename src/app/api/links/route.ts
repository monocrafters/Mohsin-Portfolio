import { NextResponse } from "next/server";
import { getAllLinks } from "@/lib/social-links";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const links = await getAllLinks();
    return NextResponse.json(
      { links },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Links fetch error:", error);
    return NextResponse.json({ error: "Failed to load links." }, { status: 500 });
  }
}
