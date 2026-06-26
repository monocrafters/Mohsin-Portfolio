"use client";

import Link from "next/link";
import SitePreview from "@/components/ui/SitePreview";

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

function hasLiveLink(link: string) {
  return link && link !== "#" && link.trim().length > 0;
}

function hasGithub(github: string) {
  return github && github !== "#" && github.trim().length > 0;
}

type ProjectCardProps = {
  project: ProjectItem;
  className?: string;
  variant?: "default" | "apple";
};

export default function ProjectCard({ project, className = "", variant = "default" }: ProjectCardProps) {
  const isApple = variant === "apple";
  const showLive = hasLiveLink(project.link);
  const showCode = hasGithub(project.github);

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
            link={project.link}
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

        {(showLive || showCode) && (
          <div className="mt-auto flex gap-2">
            {showLive && (
              <Link
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 ${
                  showCode ? "flex-1" : "w-full"
                }`}
                style={{ backgroundColor: project.color }}
              >
                Live
              </Link>
            )}
            {showCode && (
              <Link
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`rounded-xl py-2.5 text-center text-sm font-semibold transition ${
                  showLive ? "flex-1" : "w-full"
                } ${
                  isApple
                    ? "bg-slate-100 text-text-secondary hover:bg-slate-200"
                    : "bg-white/50 text-text-secondary ring-1 ring-white/70 hover:text-primary"
                }`}
                style={!showLive ? { backgroundColor: project.color, color: "#fff" } : undefined}
              >
                {showLive ? "Code" : "Source Code"}
              </Link>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
