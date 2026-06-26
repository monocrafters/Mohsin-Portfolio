import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { deleteProject, updateProject } from "@/lib/projects";
import { getMongoErrorMessage, isMongoConnectionError } from "@/lib/mongodb";
import { ObjectId } from "mongodb";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await context.params;
    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (body.title !== undefined) update.title = String(body.title).trim();
    if (body.description !== undefined) update.description = String(body.description).trim();
    if (body.tags !== undefined) update.tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
    if (body.link !== undefined) update.link = String(body.link);
    if (body.github !== undefined) update.github = String(body.github);
    if (body.year !== undefined) update.year = String(body.year);
    if (body.color !== undefined) update.color = String(body.color);
    if (body.image !== undefined) update.image = String(body.image).trim() || undefined;

    const project = await updateProject(id, update);
    return NextResponse.json({ project });
  } catch (error) {
    console.error("Update project error:", error);
    return NextResponse.json({ error: "Failed to update project." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          error:
            "Invalid project id. These are demo projects shown offline — connect MongoDB to manage real projects.",
        },
        { status: 400 }
      );
    }

    const deleted = await deleteProject(id);
    if (!deleted) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete project error:", error);
    const message = isMongoConnectionError(error)
      ? getMongoErrorMessage(error)
      : "Failed to delete project.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
