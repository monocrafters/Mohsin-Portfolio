import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { createProject, getAllProjects, validateProjectPayload } from "@/lib/projects";
import { getMongoErrorMessage, isMongoConnectionError } from "@/lib/mongodb";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const projects = await getAllProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Admin projects fetch:", error);
    const message = isMongoConnectionError(error)
      ? getMongoErrorMessage(error)
      : "Failed to load projects.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validated = validateProjectPayload(body);
    if ("error" in validated) {
      return NextResponse.json({ error: validated.error }, { status: 400 });
    }

    const project = await createProject({
      ...validated.data,
      tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
      year: String(body.year || new Date().getFullYear()),
      color: String(body.color || "#2563eb"),
    });

    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    console.error("Create project error:", error);
    const message = isMongoConnectionError(error)
      ? getMongoErrorMessage(error)
      : "Could not save project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
