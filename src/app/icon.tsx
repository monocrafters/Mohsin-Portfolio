import { ImageResponse } from "next/og";
import { loadProfileImageFile } from "@/lib/profile-image-file";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const profile = await loadProfileImageFile();
  if (profile) {
    return new Response(new Uint8Array(profile.buffer), {
      headers: { "Content-Type": profile.contentType },
    });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #2563eb, #3b82f6)",
          color: "white",
          fontSize: 14,
          fontWeight: 700,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        MA
      </div>
    ),
    { ...size }
  );
}
