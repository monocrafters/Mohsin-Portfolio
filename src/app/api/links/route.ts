import { NextResponse } from "next/server";
import { getAllLinks } from "@/lib/social-links";

export async function GET() {
  try {
    const links = await getAllLinks();
    return NextResponse.json({ links });
  } catch (error) {
    console.error("Links fetch error:", error);
    return NextResponse.json({ error: "Failed to load links." }, { status: 500 });
  }
}
