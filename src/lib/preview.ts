export function isValidPreviewUrl(url: string): boolean {
  if (!url || url === "#") return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/** Microlink screenshot — no upload needed, uses live site URL */
export function getProjectPreviewUrl(url: string): string | null {
  if (!isValidPreviewUrl(url)) return null;
  const params = new URLSearchParams({
    url,
    screenshot: "true",
    meta: "false",
    embed: "screenshot.url",
  });
  return `https://api.microlink.io/?${params.toString()}`;
}
