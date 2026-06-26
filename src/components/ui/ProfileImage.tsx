"use client";

import { useState } from "react";
import Image from "next/image";

type ProfileImageProps = {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  sizes?: string;
};

export default function ProfileImage({
  src,
  alt,
  fallback = "/profile.png",
  className = "object-cover",
  sizes = "(max-width: 768px) 288px, 320px",
}: ProfileImageProps) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      priority
      className={className}
      sizes={sizes}
      onError={() => setImgSrc(fallback)}
    />
  );
}
