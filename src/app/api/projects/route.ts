import { NextResponse } from "next/server";
import { getAllProjectsPublic } from "@/lib/projects";

export async function GET() {
  try {
    const projects = await getAllProjectsPublic();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Projects fetch error:", error);
    return NextResponse.json({ error: "Failed to load projects." }, { status: 500 });
  }
}
