"use client";

import { useTheme } from "@/lib/useTheme";

const LABELS = {
  system: "Automático (según tu sistema)",
  light: "Claro",
  dark: "Oscuro",
} as const;

function Icon({ theme }: { theme: "system" | "light" | "dark" }) {
  if (theme === "light") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="3.4" fill="currentColor" />
        <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
          <path d="M8 .8v2M8 13.2v2M15.2 8h-2M2.8 8h-2M13 3l-1.4 1.4M4.4 11.6 3 13M13 13l-1.4-1.4M4.4 4.4 3 3" />
        </g>
      </svg>
    );
  }
  if (theme === "dark") {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path
          d="M13.6 9.9A6 6 0 0 1 6.1 2.4 6 6 0 1 0 13.6 9.9Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="8.5" rx="1.4" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.5 14h5M8 11v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function ThemeToggle() {
  const { theme, cycle } = useTheme();

  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={cycle}
      title={`Tema: ${LABELS[theme]}. Toca para cambiar.`}
      aria-label={`Cambiar tema. Actual: ${LABELS[theme]}`}
    >
      <Icon theme={theme} />
    </button>
  );
}
