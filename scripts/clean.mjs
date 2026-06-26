import { rmSync } from "node:fs";

const paths = [".next", "node_modules/.cache"];

for (const path of paths) {
  try {
    rmSync(path, { recursive: true, force: true });
    console.log(`Removed ${path}`);
  } catch {
    // ignore
  }
}

console.log("Cache cleared.");
