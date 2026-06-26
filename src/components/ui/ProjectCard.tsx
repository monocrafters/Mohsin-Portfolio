"use client";

import Link from "next/link";
import SitePreview from "@/components/ui/SitePreview";
import { resolveProjectLinks } from "@/lib/project-links";

export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  tags: string[];
  link: string;
  github: string;
  year: string;
  color: string;
  image?: string;
};

type ProjectCardProps = {
  project: ProjectItem;
  className?: string;
  variant?: "default" | "apple";
};

export default function ProjectCard({ project, className = "", variant = "default" }: ProjectCardProps) {
  const isApple = variant === "apple";
  const { live, github } = resolveProjectLinks(project.link, project.github);
  const showLive = Boolean(live);
  const showSource = Boolean(github);

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden transition-all duration-300 ${
        isApple
          ? "rounded-[1.75rem] bg-white/85 ring-1 ring-white/80"
          : "glass-flat rounded-2xl"
      } ${className}`}
    >
      <div className="relative">
        {project.image ? (
          <div className={`relative overflow-hidden ${isApple ? "h-48 sm:h-52" : "h-40"}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image}
              alt={project.title}
              className="h-full w-full object-cover object-top"
              loading="lazy"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent" />
          </div>
        ) : (
          <SitePreview
            link={live || github}
            title={project.title}
            color={project.color}
            className={isApple ? "h-48 sm:h-52" : "h-40"}
          />
        )}
        <span
          className={`absolute left-4 top-4 z-10 rounded-full px-2.5 py-1 text-xs font-semibold backdrop-blur-md ${
            isApple ? "bg-black/30 text-white" : "bg-white/90 text-text-secondary"
          }`}
        >
          {project.year}
        </span>
      </div>

      <div className={`flex flex-1 flex-col ${isApple ? "p-5" : "p-4"}`}>
        <h3 className={`mb-2 font-semibold tracking-tight ${isApple ? "text-lg" : ""}`}>
          {project.title}
        </h3>
        <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-text-secondary">
          {project.description}
        </p>

        <div className="mb-4 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-full px-2.5 py-0.5 text-xs ${
                isApple ? "bg-slate-100 text-text-secondary" : "bg-white/50 text-text-muted ring-1 ring-white/70"
              }`}
            >
              {tag}
            </span>
          ))}
        </div>

        {(showLive || showSource) && (
          <div className="mt-auto flex gap-2">
            {showLive && (
              <Link
                href={live}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 ${
                  showSource ? "flex-1" : "w-full"
                }`}
                style={{ backgroundColor: project.color }}
              >
                Live
              </Link>
            )}
            {showSource && (
              <Link
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-center text-sm font-semibold transition ${
                  showLive ? "flex-1" : "w-full"
                } ${
                  showLive
                    ? "bg-slate-900 text-white hover:bg-slate-800"
                    : "text-white hover:opacity-90"
                }`}
                style={!showLive ? { backgroundColor: project.color } : undefined}
              >
                <svg className="h-4 w-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 1.005 0 2.01.345 3.015 1.23.885-.24 1.815-.36 2.755-.36.945 0 1.875.12 2.76.36 1.005-.885 2.01-1.23 3.015-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                </svg>
                Source Code
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
