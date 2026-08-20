"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { DIMS, DIM_KEYS } from "@/lib/riasec";

type ParticleStyle = CSSProperties & { "--drift": string; "--rotate": string };

interface Particle {
  id: number;
  left: number;
  color: string;
  size: number;
  delay: number;
  duration: number;
  drift: number;
  rotate: number;
}

const COUNT = 22;

function makeParticles(): Particle[] {
  return Array.from({ length: COUNT }, (_, i) => {
    const dim = DIM_KEYS[i % DIM_KEYS.length];
    return {
      id: i,
      left: Math.random() * 100,
      color: DIMS[dim].color,
      size: 6 + Math.random() * 7,
      delay: Math.random() * 0.25,
      duration: 1.1 + Math.random() * 0.7,
      drift: (Math.random() - 0.5) * 90,
      rotate: Math.random() * 360,
    };
  });
}

/** Ráfaga breve de confeti al llegar a resultados. Se autodestruye y respeta reduced-motion. */
export default function Celebration() {
  const [particles, setParticles] = useState<Particle[] | null>(null);

  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    setParticles(makeParticles());
    const t = setTimeout(() => setParticles(null), 2200);
    return () => clearTimeout(t);
  }, []);

  if (!particles) return null;

  return (
    <div className="celebration" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="celebration-bit"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            "--drift": `${p.drift}px`,
            "--rotate": `${p.rotate}deg`,
          } as ParticleStyle}
        />
      ))}
    </div>
  );
}
