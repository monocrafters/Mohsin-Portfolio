"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import ProjectCard, { type ProjectItem } from "@/components/ui/ProjectCard";

type Props = {
  projects: ProjectItem[];
};

/** Desktop — original horizontal row with 4 cards + arrow controls */
export function ProjectsDesktopCarousel({ projects }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const syncState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 8);
    setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncState();
    el.addEventListener("scroll", syncState, { passive: true });
    window.addEventListener("resize", syncState);
    return () => {
      el.removeEventListener("scroll", syncState);
      window.removeEventListener("resize", syncState);
    };
  }, [projects, syncState]);

  function scrollByDir(dir: "prev" | "next") {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-project-card]");
    const step = card ? card.offsetWidth + 16 : el.clientWidth * 0.25;
    el.scrollBy({ left: dir === "next" ? step : -step, behavior: "smooth" });
  }

  if (projects.length === 0) {
    return <p className="text-center text-sm text-text-muted">No projects yet.</p>;
  }

  return (
    <div className="relative">
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByDir("prev")}
          disabled={!canPrev}
          aria-label="Previous projects"
          className="glass flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:text-primary disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => scrollByDir("next")}
          disabled={!canNext}
          aria-label="Next projects"
          className="glass flex h-9 w-9 items-center justify-center rounded-xl text-text-secondary hover:text-primary disabled:opacity-30"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div ref={trackRef} className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
        {projects.map((project) => (
          <div
            key={project.id}
            data-project-card
            className="w-[calc((100%-3rem)/4)] shrink-0"
          >
            <ProjectCard project={project} variant="default" className="h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

const AUTO_MS = 4500;

/** Mobile — peek next card, auto-advance, counter + dots */
export function ProjectsMobileCarousel({ projects }: Props) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const pausedRef = useRef(false);
  const touchRef = useRef(false);

  const syncIndex = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-project-card]");
    if (!card) return;
    const step = card.offsetWidth + 12;
    const index = Math.round(el.scrollLeft / step);
    setActiveIndex(Math.min(Math.max(index, 0), projects.length - 1));
  }, [projects.length]);

  const scrollTo = useCallback(
    (index: number, smooth = true) => {
      const el = trackRef.current;
      if (!el) return;
      const card = el.querySelector<HTMLElement>("[data-project-card]");
      if (!card) return;
      const step = card.offsetWidth + 12;
      el.scrollTo({ left: step * index, behavior: smooth ? "smooth" : "auto" });
      setActiveIndex(index);
    },
    []
  );

  const activeRef = useRef(0);
  useEffect(() => {
    activeRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    syncIndex();
    el.addEventListener("scroll", syncIndex, { passive: true });
    return () => el.removeEventListener("scroll", syncIndex);
  }, [projects, syncIndex]);

  useEffect(() => {
    if (projects.length <= 1) return;

    const timer = setInterval(() => {
      if (pausedRef.current || touchRef.current) return;
      const next = (activeRef.current + 1) % projects.length;
      scrollTo(next);
    }, AUTO_MS);

    return () => clearInterval(timer);
  }, [projects.length, scrollTo]);

  if (projects.length === 0) {
    return <p className="text-center text-sm text-text-muted">No projects yet.</p>;
  }

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="text-xs font-medium text-text-muted">
          Swipe to explore
          <span className="ml-1 text-primary">→</span>
        </p>
        <span className="rounded-full bg-white/60 px-2.5 py-1 text-xs font-semibold text-text-secondary ring-1 ring-white/70">
          {activeIndex + 1} / {projects.length}
        </span>
      </div>

      <div
        ref={trackRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 pl-[7px] pr-[7px]"
        onTouchStart={() => {
          touchRef.current = true;
          pausedRef.current = true;
        }}
        onTouchEnd={() => {
          touchRef.current = false;
          window.setTimeout(() => {
            pausedRef.current = false;
          }, 3000);
        }}
        onMouseEnter={() => {
          pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
      >
        {projects.map((project, i) => (
          <div
            key={project.id}
            data-project-card
            className={`w-[calc(100%-2.5rem)] shrink-0 snap-start transition-transform duration-300 ${
              i === activeIndex ? "scale-100" : "scale-[0.98] opacity-90"
            }`}
          >
            <ProjectCard project={project} variant="default" className="h-full" />
          </div>
        ))}
      </div>

      {projects.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-2">
          {projects.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Project ${i + 1}`}
              onClick={() => {
                scrollTo(i);
                pausedRef.current = true;
                window.setTimeout(() => {
                  pausedRef.current = false;
                }, 4000);
              }}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex ? "h-2 w-6 bg-primary" : "h-2 w-2 bg-primary/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
