"use client";

import { motion } from "framer-motion";

type HamburgerButtonProps = {
  open: boolean;
  onClick: () => void;
};

export default function HamburgerButton({ open, onClick }: HamburgerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="glass group relative z-50 flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10 lg:hidden"
    >
      <div className="relative h-4 w-5">
        <motion.span
          className="absolute left-0 block h-[2px] w-full rounded-full bg-primary-dark"
          animate={{
            top: open ? "50%" : "0%",
            rotate: open ? 45 : 0,
            translateY: open ? "-50%" : "0%",
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />
        <motion.span
          className="absolute left-0 top-1/2 block h-[2px] w-full -translate-y-1/2 rounded-full bg-primary"
          animate={{
            opacity: open ? 0 : 1,
            scaleX: open ? 0 : 1,
          }}
          transition={{ duration: 0.2 }}
        />
        <motion.span
          className="absolute left-0 block h-[2px] w-full rounded-full bg-primary-light"
          animate={{
            bottom: open ? "50%" : "0%",
            rotate: open ? -45 : 0,
            translateY: open ? "50%" : "0%",
          }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />
      </div>
    </button>
  );
}
