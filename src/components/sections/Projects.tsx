"use client";

import { type ProjectItem } from "@/components/ui/ProjectCard";
import { ProjectsDesktopCarousel, ProjectsMobileCarousel } from "@/components/ui/ProjectsCarousel";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionReveal from "@/components/ui/SectionReveal";

type ProjectsProps = {
  initialProjects?: ProjectItem[];
};

export default function Projects({ initialProjects = [] }: ProjectsProps) {
  const projects = initialProjects;

  return (
    <section id="projects" className="section-padding overflow-hidden">
      <div className="mx-auto max-w-6xl">
        <SectionReveal>
          <SectionHeading label="Projects" title="Selected work" />
        </SectionReveal>

        <SectionReveal delay={0.08}>
          {projects.length === 0 ? (
            <p className="text-center text-sm text-text-muted">No projects yet.</p>
          ) : (
            <>
              <div className="lg:hidden">
                <ProjectsMobileCarousel projects={projects} />
              </div>
              <div className="hidden lg:block">
                <ProjectsDesktopCarousel projects={projects} />
              </div>
            </>
          )}
        </SectionReveal>
      </div>
    </section>
  );
}
