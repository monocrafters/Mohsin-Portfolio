type Bird = {
  ox: number;
  oy: number;
  rot: number;
  scale: number;
};

type Flock = {
  id: number;
  color: string;
  birds: Bird[];
  duration: number;
  delay: number;
  pathClass: string;
};

const BIRD_PATH = "M0 2 L4 0 L8 2 L6 2.5 L4 1.5 L2 2.5 Z";

/* Fixed positions — no Math.sin (avoids SSR/client float mismatch) */
const FORMATIONS: Record<number, Bird[]> = {
  5: [
    { ox: 0, oy: -4, rot: -8, scale: 0.75 },
    { ox: -18, oy: 4, rot: -5, scale: 0.83 },
    { ox: -36, oy: -2, rot: -2, scale: 0.91 },
    { ox: -52, oy: 6, rot: 1, scale: 0.99 },
    { ox: -68, oy: 0, rot: 4, scale: 0.75 },
  ],
  7: [
    { ox: 0, oy: -4, rot: -8, scale: 0.75 },
    { ox: -18, oy: 4, rot: -5, scale: 0.83 },
    { ox: -36, oy: -2, rot: -2, scale: 0.91 },
    { ox: -52, oy: 6, rot: 1, scale: 0.99 },
    { ox: -68, oy: 0, rot: 4, scale: 0.75 },
    { ox: -84, oy: 8, rot: 7, scale: 0.83 },
    { ox: -98, oy: 2, rot: -2, scale: 0.91 },
  ],
  9: [
    { ox: 0, oy: -4, rot: -8, scale: 0.75 },
    { ox: -18, oy: 4, rot: -5, scale: 0.83 },
    { ox: -36, oy: -2, rot: -2, scale: 0.91 },
    { ox: -52, oy: 6, rot: 1, scale: 0.99 },
    { ox: -68, oy: 0, rot: 4, scale: 0.75 },
    { ox: -84, oy: 8, rot: 7, scale: 0.83 },
    { ox: -98, oy: 2, rot: -2, scale: 0.91 },
    { ox: -112, oy: 6, rot: 1, scale: 0.99 },
    { ox: -126, oy: 4, rot: -2, scale: 0.75 },
  ],
};

const FLOCKS: Flock[] = [
  { id: 1, color: "rgba(59,130,246,0.22)", birds: FORMATIONS[7], duration: 52, delay: 0, pathClass: "flock-path-a" },
  { id: 2, color: "rgba(239,68,68,0.18)", birds: FORMATIONS[5], duration: 58, delay: -12, pathClass: "flock-path-b" },
  { id: 3, color: "rgba(34,197,94,0.19)", birds: FORMATIONS[9], duration: 64, delay: -24, pathClass: "flock-path-c" },
  { id: 4, color: "rgba(234,179,8,0.16)", birds: FORMATIONS[5], duration: 48, delay: -8, pathClass: "flock-path-d" },
];

const DOTS = [
  { left: "12%", top: "18%", color: "rgba(59,130,246,0.2)", dur: 44, delay: 0 },
  { left: "78%", top: "22%", color: "rgba(239,68,68,0.16)", dur: 52, delay: -6 },
  { left: "45%", top: "38%", color: "rgba(34,197,94,0.17)", dur: 48, delay: -12 },
  { left: "88%", top: "55%", color: "rgba(234,179,8,0.15)", dur: 56, delay: -3 },
  { left: "22%", top: "62%", color: "rgba(249,115,22,0.17)", dur: 50, delay: -18 },
  { left: "65%", top: "72%", color: "rgba(59,130,246,0.15)", dur: 46, delay: -9 },
  { left: "35%", top: "82%", color: "rgba(239,68,68,0.14)", dur: 54, delay: -15 },
  { left: "92%", top: "12%", color: "rgba(34,197,94,0.14)", dur: 42, delay: -21 },
];

function FlockGroup({ flock }: { flock: Flock }) {
  return (
    <div
      className={`flock-group ${flock.pathClass}`}
      style={{
        animationDuration: `${flock.duration}s`,
        animationDelay: `${flock.delay}s`,
      }}
    >
      <svg
        viewBox="-20 -20 120 40"
        className="h-8 w-32 sm:h-10 sm:w-40"
        style={{ color: flock.color }}
        aria-hidden="true"
      >
        <g transform="translate(50, 20)">
          {flock.birds.map((bird, i) => (
            <g
              key={i}
              transform={`translate(${bird.ox}, ${bird.oy}) rotate(${bird.rot}) scale(${bird.scale})`}
              className="flock-bird"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <path d={BIRD_PATH} fill="currentColor" />
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

export default function FlockBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-[#e8eef8]" aria-hidden="true">
      {/* Color orbs — visible through glass */}
      <div className="bg-orb bg-orb-blue animate-orb-a absolute -left-[10%] top-[5%] h-[45vh] w-[45vh] rounded-full" />
      <div className="bg-orb bg-orb-red animate-orb-b absolute right-[-5%] top-[15%] h-[38vh] w-[38vh] rounded-full" />
      <div className="bg-orb bg-orb-green animate-orb-c absolute bottom-[10%] left-[15%] h-[40vh] w-[40vh] rounded-full" />
      <div className="bg-orb bg-orb-yellow animate-orb-a absolute bottom-[20%] right-[10%] h-[32vh] w-[32vh] rounded-full" />
      <div className="bg-orb bg-orb-orange animate-orb-b absolute left-[40%] top-[40%] h-[28vh] w-[28vh] rounded-full" />

      <div className="flock-layer">
        {FLOCKS.map((flock) => (
          <FlockGroup key={flock.id} flock={flock} />
        ))}
      </div>

      <div className="pointer-events-none absolute inset-0">
        {DOTS.map((dot, i) => (
          <span
            key={i}
            className="flock-dot absolute block h-0.5 w-2.5 -rotate-[20deg]"
            style={{
              left: dot.left,
              top: dot.top,
              backgroundColor: dot.color,
              clipPath: "polygon(0% 50%, 50% 0%, 100% 50%, 50% 100%)",
              animationDuration: `${dot.dur}s`,
              animationDelay: `${dot.delay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
