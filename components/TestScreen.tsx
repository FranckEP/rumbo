import { DIMS, QUESTIONS, SCALE, TOTAL, type Answers } from "@/lib/riasec";

interface Props {
  idx: number;
  answers: Answers;
  progress: number;
  direction: 1 | -1;
  onAnswer: (v: number) => void;
  onBack: () => void;
  onQuit: () => void;
}

export default function TestScreen({
  idx,
  answers,
  progress,
  direction,
  onAnswer,
  onBack,
  onQuit,
}: Props) {
  const q = QUESTIONS[idx];
  if (!q) return null;
  const d = DIMS[q.dim];

  return (
    <section className="screen">
      <div className="progress-row">
        <span className="eyebrow">Pregunta</span>
        <span className="progress-count mono">
          {idx + 1} / {TOTAL}
        </span>
      </div>
      <div
        className="track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
        aria-label="Progreso del test"
      >
        <div className="fill" style={{ width: `${progress}%`, background: d.color }} />
      </div>

      <div
        key={idx}
        className={`q-card${direction === 1 ? " q-anim-fwd" : " q-anim-back"}`}
      >
        <span className="q-dim">
          <span className="dot" style={{ background: d.color }} />
          <span>{d.name}</span>
        </span>
        <h2 className="q-text">{q.text}</h2>
        <p className="q-prompt">¿Qué tanto va contigo esta actividad?</p>

        <div className="opts">
          {SCALE.map((s, i) => (
            <button
              key={s.v}
              className={`opt${answers[idx] === s.v ? " selected" : ""}`}
              onClick={() => onAnswer(s.v)}
            >
              <span>{s.label}</span>
              <span className="key">{i + 1}</span>
            </button>
          ))}
        </div>

        <p className="kbd-hint">Atajos: teclas 1–4 para responder, ← para volver</p>

        <div className="test-nav">
          <button
            className="btn-ghost"
            onClick={onBack}
            style={{ visibility: idx === 0 ? "hidden" : "visible" }}
          >
            ← Anterior
          </button>
          <button className="btn-ghost" onClick={onQuit}>
            Salir y guardar
          </button>
        </div>
      </div>
    </section>
  );
}
