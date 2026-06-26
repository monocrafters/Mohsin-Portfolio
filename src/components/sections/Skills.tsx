"use client";

import { useEffect, useState } from "react";
import { skillGroups } from "@/data/content";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionReveal from "@/components/ui/SectionReveal";
import { useSiteData } from "@/components/providers/SiteDataProvider";

const defaultSkills = skillGroups.flatMap((g) => g.items);

export default function Skills() {
  const siteData = useSiteData();
  const [label, setLabel] = useState(siteData?.content?.skillsLabel ?? "Skills");
  const [title, setTitle] = useState(siteData?.content?.skillsTitle ?? "My toolkit");
  const [skills, setSkills] = useState<string[]>(siteData?.content?.skillsItems ?? defaultSkills);

  useEffect(() => {
    if (siteData?.content) {
      setLabel(siteData.content.skillsLabel);
      setTitle(siteData.content.skillsTitle);
      setSkills(siteData.content.skillsItems);
      return;
    }
    fetch("/api/content")
      .then((r) => r.json())
      .then((d) => {
        if (d.content) {
          setLabel(d.content.skillsLabel);
          setTitle(d.content.skillsTitle);
          setSkills(d.content.skillsItems);
        }
      })
      .catch(() => {});
  }, [siteData]);

  return (
    <section id="skills" className="section-padding">
      <div className="mx-auto max-w-6xl">
        <SectionReveal>
          <SectionHeading label={label} title={title} />
        </SectionReveal>

        <SectionReveal delay={0.06}>
          <div className="glass-strong rounded-2xl p-6 sm:p-8">
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-white/60 bg-white/45 px-4 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-primary/25 hover:text-primary-dark"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </SectionReveal>
      </div>
    </section>
  );
}
