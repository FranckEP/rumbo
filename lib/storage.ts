import type { Answers } from "./riasec";

/* Se conserva la clave original para que el progreso guardado siga sirviendo. */
const STORE_KEY = "brujula-vocacional-v1";

export interface SavedProgress {
  answers: Answers;
  idx: number;
}

export function saveProgress(answers: Answers, idx: number): void {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ answers, idx }));
  } catch {
    /* almacenamiento no disponible: se sigue sin guardar */
  }
}

export function loadProgress(): SavedProgress | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as SavedProgress | null;
    if (!data || !Array.isArray(data.answers)) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearProgress(): void {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* nada que limpiar */
  }
}

/** Hay progreso reanudable si empezó pero no terminó. */
export function isResumable(p: SavedProgress | null): p is SavedProgress {
  return (
    !!p &&
    p.answers.some((a) => a !== null) &&
    p.answers.some((a) => a === null)
  );
}
