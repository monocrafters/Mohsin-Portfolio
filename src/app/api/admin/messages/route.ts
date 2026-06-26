import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth";
import { getAllMessages } from "@/lib/messages";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const messages = await getAllMessages();
    return NextResponse.json({ messages });
  } catch (error) {
    console.error("Admin messages fetch:", error);
    return NextResponse.json({ error: "Failed to load messages." }, { status: 500 });
  }
}
