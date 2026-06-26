import type { LinkType } from "@/lib/social-links";

export function normalizeSocialLinkUrl(url: string, type: LinkType = "other"): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  if (type === "email") {
    if (trimmed.startsWith("mailto:")) return trimmed;
    return trimmed.includes("@") ? `mailto:${trimmed}` : trimmed;
  }

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  return `https://${trimmed}`;
}
