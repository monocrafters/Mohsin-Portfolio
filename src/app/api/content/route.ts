import { NextResponse } from "next/server";
import { getPageContent, toPublicContent } from "@/lib/content-settings";

export async function GET() {
  try {
    const content = await getPageContent();
    return NextResponse.json({ content: toPublicContent(content) });
  } catch (error) {
    console.error("Content fetch:", error);
    return NextResponse.json({ error: "Failed to load content." }, { status: 500 });
  }
}
