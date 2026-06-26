export function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export function lerp(start: number, end: number, factor: number) {
  return start + (end - start) * factor;
}
