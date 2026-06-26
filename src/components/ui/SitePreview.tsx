"use client";

import { useEffect, useState } from "react";

type SitePreviewProps = {
  link: string;
  title: string;
  color: string;
  className?: string;
};

/**
 * Turns a project's live URL into a website screenshot preview.
 * No manual image upload required — the URL itself is the source.
 *
 * Tries thum.io first, then WordPress mShots, then a clean gradient
 * fallback with the project initial so the card never looks broken.
 */
function buildSources(link: string): string[] {
  if (!link || link === "#") return [];
  let href = link.trim();
  if (!/^https?:\/\//i.test(href)) href = `https://${href}`;
  try {
    const u = new URL(href);
    return [
      `https://image.thum.io/get/width/640/noanimate/${u.href}`,
      `https://s.wordpress.com/mshots/v1/${encodeURIComponent(u.href)}?w=640`,
    ];
  } catch {
    return [];
  }
}

export default function SitePreview({ link, title, color, className = "" }: SitePreviewProps) {
  const [sources] = useState<string[]>(() => buildSources(link));
  const [index, setIndex] = useState(0);
  const [failed, setFailed] = useState(sources.length === 0);
  const [loaded, setLoaded] = useState(false);

  // Reset when the link changes
  useEffect(() => {
    const next = buildSources(link);
    setIndex(0);
    setFailed(next.length === 0);
    setLoaded(false);
  }, [link]);

  const initial = title.charAt(0).toUpperCase();

  if (failed) {
    return (
      <div
        className={`relative flex items-center justify-center overflow-hidden ${className}`}
        style={{
          background: `linear-gradient(135deg, ${color}22 0%, ${color}44 50%, ${color}18 100%)`,
        }}
      >
        <div
          className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-30 blur-2xl"
          style={{ backgroundColor: color }}
        />
        <span
          className="text-5xl font-bold text-white/90 drop-shadow-lg"
          style={{ textShadow: `0 4px 24px ${color}88` }}
        >
          {initial}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ backgroundColor: `${color}18` }}
    >
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${color}22 0%, ${color}33 50%, ${color}18 100%)`,
          }}
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={sources[index]}
        alt={`${title} website preview`}
        loading="lazy"
        className={`h-full w-full object-cover object-top transition-opacity duration-500 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (index < sources.length - 1) {
            setIndex(index + 1);
            setLoaded(false);
          } else {
            setFailed(true);
          }
        }}
      />
      {/* subtle top-down fade so text/badges stay readable */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
    </div>
  );
}
