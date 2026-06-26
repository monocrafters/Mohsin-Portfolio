import { readFile } from "fs/promises";
import path from "path";
import { siteConfig } from "@/data/content";

const FALLBACK_NAMES = ["profile.png", "profile.jpg", "profile.jpeg", "profile.webp", "profile.svg"];

export async function loadProfileImageFile(): Promise<{ buffer: Buffer; contentType: string } | null> {
  const fromConfig = siteConfig.profileImage.replace(/^\//, "");
  const names = [fromConfig, ...FALLBACK_NAMES.filter((n) => n !== fromConfig)];

  for (const name of names) {
    try {
      const buffer = await readFile(path.join(process.cwd(), "public", name));
      const contentType =
        name.endsWith(".png")
          ? "image/png"
          : name.endsWith(".webp")
            ? "image/webp"
            : name.endsWith(".svg")
              ? "image/svg+xml"
              : "image/jpeg";
      return { buffer, contentType };
    } catch {
      continue;
    }
  }

  return null;
}
