/** Normalize project live + GitHub/source links for cards and API. */

const PLACEHOLDER = new Set(["", "#", "null", "undefined"]);

export function normalizeProjectUrl(url: unknown): string {
  const trimmed = String(url ?? "").trim();
  if (PLACEHOLDER.has(trimmed.toLowerCase())) return "";

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}

export function isGithubUrl(url: string): boolean {
  return /github\.com/i.test(url);
}

export function isValidProjectUrl(url: string): boolean {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolveProjectLinks(link: unknown, github: unknown) {
  let live = normalizeProjectUrl(link);
  let source = normalizeProjectUrl(github);

  // If GitHub was pasted in the Live URL field, treat it as source code
  if (live && isGithubUrl(live) && !source) {
    source = live;
    live = "";
  }

  return {
    live: isValidProjectUrl(live) ? live : "",
    github: isValidProjectUrl(source) ? source : "",
  };
}

export function sanitizeLinkForDb(url: string): string {
  return url || "#";
}
