import { NextResponse } from "next/server";
import { createMessage } from "@/lib/messages";
import { getMongoErrorMessage, isMongoConnectionError } from "@/lib/mongodb";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();
    const message = String(body.message || "").trim();

    if (!name || !email || !message) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    await createMessage({ name, email, message });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact message error:", error);
    const msg = isMongoConnectionError(error)
      ? getMongoErrorMessage(error)
      : "Could not send message. Try again later.";
    return NextResponse.json({ error: msg }, { status: isMongoConnectionError(error) ? 503 : 500 });
  }
}
