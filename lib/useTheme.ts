"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY as KEY } from "./themeScript";

export type ThemeChoice = "system" | "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<ThemeChoice>("system");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved === "light" || saved === "dark" || saved === "system") setTheme(saved);
    } catch {
      /* sin acceso a localStorage: se queda en "system" */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    if (theme === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", theme);
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* no se pudo persistir la preferencia */
    }
  }, [theme, ready]);

  const cycle = useCallback(() => {
    setTheme((t) => (t === "system" ? "light" : t === "light" ? "dark" : "system"));
  }, []);

  return { theme, cycle };
}
