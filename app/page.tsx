"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Intro from "@/components/Intro";
import Results from "@/components/Results";
import SiteHeader from "@/components/SiteHeader";
import TestScreen from "@/components/TestScreen";
import Toast from "@/components/Toast";
import { TOTAL, type Answers } from "@/lib/riasec";
import {
  clearProgress,
  isResumable,
  loadProgress,
  saveProgress,
  type SavedProgress,
} from "@/lib/storage";

type Screen = "intro" | "test" | "results";

const emptyAnswers = (): Answers => new Array(TOTAL).fill(null);

export default function Page() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);
  const [finishing, setFinishing] = useState(false);
  const [resumeCount, setResumeCount] = useState<number | null>(null);
  const [toast, setToast] = useState({ message: "", visible: false });

  const savedRef = useRef<SavedProgress | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* Progreso guardado: solo existe en el navegador. */
  useEffect(() => {
    const saved = loadProgress();
    if (isResumable(saved)) {
      savedRef.current = saved;
      setResumeCount(saved.answers.filter((a) => a !== null).length);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 2200);
  }, []);

  const handleAnswer = useCallback(
    (v: number) => {
      const next = [...answers];
      next[idx] = v;
      setAnswers(next);

      if (timerRef.current) clearTimeout(timerRef.current);

      if (idx < TOTAL - 1) {
        saveProgress(next, idx);
        setDirection(1);
        /* El tope evita pasarse del total cuando dos respuestas muy seguidas
           deciden la rama con un idx viejo pero avanzan sobre el actual. */
        timerRef.current = setTimeout(() => setIdx((i) => Math.min(i + 1, TOTAL - 1)), 120);
      } else {
        setFinishing(true);
        clearProgress();
        savedRef.current = null;
        setResumeCount(null);
        timerRef.current = setTimeout(() => {
          setScreen("results");
          setFinishing(false);
        }, 250);
      }
    },
    [answers, idx]
  );

  /* Atajos de teclado durante el test: 1–4 responden, ← retrocede. */
  useEffect(() => {
    if (screen !== "test") return;
    const onKey = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) handleAnswer(parseInt(e.key, 10) - 1);
      if (e.key === "ArrowLeft" && idx > 0) {
        setDirection(-1);
        setIdx((i) => i - 1);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [screen, idx, handleAnswer]);

  function startTest() {
    setAnswers(emptyAnswers());
    setIdx(0);
    setDirection(1);
    setFinishing(false);
    setScreen("test");
  }

  function resumeTest() {
    const saved = savedRef.current;
    if (!saved) return;
    setAnswers(saved.answers);
    setIdx(Math.min(saved.idx, TOTAL - 1));
    setDirection(1);
    setFinishing(false);
    setScreen("test");
  }

  function quitTest() {
    saveProgress(answers, idx);
    const saved = loadProgress();
    if (isResumable(saved)) {
      savedRef.current = saved;
      setResumeCount(saved.answers.filter((a) => a !== null).length);
    } else {
      savedRef.current = null;
      setResumeCount(null);
    }
    setScreen("intro");
  }

  function restartTest() {
    clearProgress();
    savedRef.current = null;
    setResumeCount(null);
    setAnswers(emptyAnswers());
    setIdx(0);
    setDirection(1);
    setFinishing(false);
    setScreen("test");
  }

  return (
    <>
      <div className="shell">
        <SiteHeader />

        {screen === "intro" && (
          <Intro onStart={startTest} resumeCount={resumeCount} onResume={resumeTest} />
        )}

        {screen === "test" && (
          <TestScreen
            idx={idx}
            answers={answers}
            progress={finishing ? 100 : (idx / TOTAL) * 100}
            direction={direction}
            onAnswer={handleAnswer}
            onBack={() => {
              setDirection(-1);
              setIdx((i) => Math.max(0, i - 1));
            }}
            onQuit={quitTest}
          />
        )}

        {screen === "results" && (
          <Results answers={answers} onRestart={restartTest} onToast={showToast} />
        )}

        <footer>
          <p>
            Creado por <strong>Franck Echeverría Peñaloza</strong>. Basado en la teoría de tipos
            vocacionales de John L. Holland (RIASEC)
          </p>
          <p className="footer-legal">
            © {new Date().getFullYear()} Franck Echeverría Peñaloza. Todos los derechos reservados.{" "}
            <a href="/terminos">Términos de uso</a>
          </p>
        </footer>
      </div>

      <Toast message={toast.message} visible={toast.visible} />
    </>
  );
}
