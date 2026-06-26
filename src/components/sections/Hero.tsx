"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { heroContent, siteConfig } from "@/data/content";
import HeroBlob from "@/components/ui/HeroBlob";
import RoleRotator from "@/components/ui/RoleRotator";
import SocialLinks from "@/components/ui/SocialLinks";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function Hero() {
  return (
    <section id="home" className="relative flex min-h-[100dvh] items-center section-padding">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <motion.div initial="hidden" animate="visible" className="order-2 lg:order-1">
            <motion.p
              custom={0}
              variants={fadeUp}
              className="mb-3 text-sm font-medium tracking-wide text-primary"
            >
              {heroContent.greeting}
            </motion.p>

            <motion.h1
              custom={1}
              variants={fadeUp}
              className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
            >
              <span className="text-gradient">{heroContent.headline}</span>
            </motion.h1>

            <motion.div custom={2} variants={fadeUp} className="mb-4">
              <RoleRotator roles={heroContent.roles} />
            </motion.div>

            <motion.p
              custom={3}
              variants={fadeUp}
              className="mb-8 max-w-md text-base text-text-secondary"
            >
              {heroContent.tagline}
            </motion.p>

            <motion.div custom={4} variants={fadeUp} className="flex flex-wrap gap-3">
              <Link
                href="#projects"
                className="group inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary-dark"
              >
                {heroContent.ctaPrimary}
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <Link
                href="#contact"
                className="glass inline-flex items-center rounded-xl px-6 py-3 text-sm font-semibold text-primary-dark transition-all duration-300 hover:-translate-y-0.5"
              >
                {heroContent.ctaSecondary}
              </Link>
            </motion.div>

            <motion.div custom={5} variants={fadeUp} className="mt-8 flex flex-wrap items-center gap-4">
              <SocialLinks variant="icons" />
              <span className="text-sm text-text-muted">{siteConfig.location}</span>
            </motion.div>
          </motion.div>

          <div className="order-1 mb-2 flex justify-center sm:mb-0 lg:order-2">
            <HeroBlob src={siteConfig.profileImage} alt={siteConfig.name} />
          </div>
        </div>
      </div>
    </section>
  );
}
