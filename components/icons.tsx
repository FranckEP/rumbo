import type { SVGProps } from "react";

/**
 * Set de íconos lineales a medida (16x16, currentColor) para mantener el mismo
 * lenguaje visual del logo y de los íconos ya hechos a mano (LinkIcon, chevron,
 * ThemeToggle) en vez de mezclar con emojis del sistema operativo.
 */

function base(props: SVGProps<SVGSVGElement>) {
  return { width: 16, height: 16, viewBox: "0 0 16 16", fill: "none", "aria-hidden": true, ...props } as const;
}

export function ClockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="8" cy="8" r="6.3" stroke="currentColor" strokeWidth="1.4" />
      <path d="M8 4.7V8l2.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChartIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M2.8 13V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M8 13V4.6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M13.2 13V7.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M1.6 13.5h12.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}

export function CapIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M8 3.1 14.2 6 8 8.9 1.8 6 8 3.1Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4.6 7.2v2.9c0 .9 1.5 1.7 3.4 1.7s3.4-.8 3.4-1.7V7.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14.2 6v3.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function CoinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M9.9 6.1c0-.8-.9-1.3-1.9-1.3s-1.9.5-1.9 1.3c0 1.9 3.8.9 3.8 2.8 0 .8-.9 1.3-1.9 1.3s-1.9-.5-1.9-1.3M8 4.2v7.6"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <rect x="3.2" y="7.1" width="9.6" height="6.2" rx="1.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.4 7.1V5.3a2.6 2.6 0 0 1 5.2 0v1.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="10.1" r=".9" fill="currentColor" />
    </svg>
  );
}

export function PinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path
        d="M8 14s4.6-4.3 4.6-7.7A4.6 4.6 0 0 0 3.4 6.3C3.4 9.7 8 14 8 14Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="6.3" r="1.6" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export function LinkOutIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base({ width: 11, height: 11, viewBox: "0 0 12 12", ...props })}>
      <path d="M4 2h6v6M10 2 4.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.5 10.5 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SlidersIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 4.5h11M4.5 8h7M6.5 11.5h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ShareIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path
        d="M11 2.5h2.5V5M13.5 2.5 8.5 7.5M6.5 3.5H4a1.5 1.5 0 0 0-1.5 1.5v7A1.5 1.5 0 0 0 4 13.5h7a1.5 1.5 0 0 0 1.5-1.5V9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function FlagIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...base(props)}>
      <path d="M3.6 13.7V2.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M3.6 3c2-1 3.6.6 5.6-.3 1.2-.6 2-.2 3.2.2v6c-1.2-.4-2-.8-3.2-.2-2 .9-3.6-.7-5.6.3V3Z"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
}
