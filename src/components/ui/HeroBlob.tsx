"use client";

import { useId, useState } from "react";
import { motion } from "framer-motion";

const BLOB_PATH =
  "M9.19024 145.964C34.0253 76.5814 114.865 54.7299 184.111 29.4823C245.804 6.98884 311.86 -14.9503 370.735 14.143C431.207 44.026 467.948 107.508 477.191 174.311C485.897 237.229 454.931 294.377 416.506 344.954C373.74 401.245 326.068 462.801 255.442 466.189C179.416 469.835 111.552 422.137 65.1576 361.805C17.4835 299.81 -17.1617 219.583 9.19024 145.964Z";

type HeroBlobProps = {
  src: string;
  alt: string;
  fallback?: string;
};

export default function HeroBlob({ src, alt, fallback = "/profile.svg" }: HeroBlobProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const clipId = useId().replace(/:/g, "");

  return (
    <motion.div
      className="relative mx-auto w-full max-w-[260px] sm:max-w-[320px] md:max-w-[360px] lg:max-w-[440px]"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <svg
        className="w-full drop-shadow-2xl drop-shadow-blue-500/20"
        viewBox="0 0 479 467"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={alt}
      >
        <defs>
          <clipPath id={`hero-blob-clip-${clipId}`} clipPathUnits="userSpaceOnUse">
            <path d={BLOB_PATH} />
          </clipPath>
        </defs>

        {/* Blue blob background — same on mobile & desktop */}
        <path d={BLOB_PATH} className="fill-primary" />

        {/* SVG image + clipPath — Safari-safe (no foreignObject) */}
        <image
          href={imgSrc}
          x="37"
          y="-50"
          width="429"
          height="550"
          clipPath={`url(#hero-blob-clip-${clipId})`}
          preserveAspectRatio="xMidYMin slice"
          onError={() => setImgSrc(fallback)}
        />
      </svg>
    </motion.div>
  );
}
