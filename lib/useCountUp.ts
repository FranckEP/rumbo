"use client";

import { useEffect, useState } from "react";

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Cuenta de 0 al valor objetivo con easing, mientras `active` sea true. */
export function useCountUp(target: number, active: boolean, duration = 700): number {
  const [value, setValue] = useState(active ? target : 0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    if (prefersReducedMotion() || duration <= 0) {
      setValue(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);

  return value;
}
