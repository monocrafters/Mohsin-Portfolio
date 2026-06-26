"use client";

import { useEffect, useState } from "react";
import { aboutContent } from "@/data/content";
import SectionHeading from "@/components/ui/SectionHeading";
import SectionReveal from "@/components/ui/SectionReveal";
import { useSiteData } from "@/components/providers/SiteDataProvider";

const defaults = {
  aboutLabel: aboutContent.label,
  aboutTitle: aboutContent.title,
  aboutIntro: aboutContent.intro,
  aboutHighlights: aboutContent.highlights,
};

export default function About() {
  const siteData = useSiteData();
  const [content, setContent] = useState({
    aboutLabel: siteData?.content?.aboutLabel ?? defaults.aboutLabel,
    aboutTitle: siteData?.content?.aboutTitle ?? defaults.aboutTitle,
    aboutIntro: siteData?.content?.aboutIntro ?? defaults.aboutIntro,
    aboutHighlights: siteData?.content?.aboutHighlights ?? defaults.aboutHighlights,
  });

  useEffect(() => {
    if (siteData?.content) {
      setContent({
        aboutLabel: siteData.content.aboutLabel,
        aboutTitle: siteData.content.aboutTitle,
        aboutIntro: siteData.content.aboutIntro,
        aboutHighlights: siteData.content.aboutHighlights,
      });
      return;
    }
    fetch("/api/content")
      .then((r) => r.json())
      .then((d) => {
        if (d.content) {
          setContent({
            aboutLabel: d.content.aboutLabel,
            aboutTitle: d.content.aboutTitle,
            aboutIntro: d.content.aboutIntro,
            aboutHighlights: d.content.aboutHighlights,
          });
        }
      })
      .catch(() => {});
  }, [siteData]);

  return (
    <section id="about" className="section-padding">
      <div className="mx-auto max-w-6xl">
        <SectionReveal>
          <SectionHeading label={content.aboutLabel} title={content.aboutTitle} />
        </SectionReveal>

        <SectionReveal delay={0.08}>
          <p className="glass-strong mb-6 max-w-lg rounded-2xl px-5 py-4 text-sm text-text-secondary sm:text-base">
            {content.aboutIntro}
          </p>
        </SectionReveal>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {content.aboutHighlights.map((item, i) => (
            <SectionReveal key={`${item.label}-${i}`} delay={i * 0.06}>
              <div className="glass-strong group rounded-2xl p-5 text-center transition-transform duration-300 hover:-translate-y-1">
                <p className="text-3xl font-bold text-gradient sm:text-4xl">
                  {item.value}
                  {item.unit && (
                    <span className="text-lg font-semibold text-primary-light">{item.unit}</span>
                  )}
                </p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-text-muted">
                  {item.label}
                </p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
