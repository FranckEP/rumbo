import { useMemo, useState } from "react";
import type { Career } from "@/lib/careers";
import { duelosPara, dimsGanadoras, preferencia } from "@/lib/desempate";
import { DIMS, cosine } from "@/lib/riasec";

interface Props {
  /** las carreras que quedaron empatadas */
  empatadas: (Career & { match: number })[];
  onCerrar: () => void;
  /** abre una carrera del resultado en la lista */
  onVerCarrera: (nombre: string) => void;
}

export default function Desempate({ empatadas, onCerrar, onVerCarrera }: Props) {
  const duelos = useMemo(() => duelosPara(empatadas), [empatadas]);
  const [i, setI] = useState(0);
  const [elecciones, setElecciones] = useState<("a" | "b")[]>([]);

  const terminado = elecciones.length >= duelos.length;

  const resultado = useMemo(() => {
    if (!terminado) return null;
    const pref = preferencia(duelos, elecciones);
    const orden = [...empatadas]
      .map((c) => ({ c, afin: cosine(pref, c.v) }))
      .sort((a, b) => b.afin - a.afin);
    return { pref, orden, ganadoras: dimsGanadoras(pref) };
  }, [terminado, duelos, elecciones, empatadas]);

  function elegir(op: "a" | "b") {
    setElecciones((prev) => [...prev, op]);
    setI((n) => n + 1);
  }

  function volverAtras() {
    setElecciones((prev) => prev.slice(0, -1));
    setI((n) => Math.max(0, n - 1));
  }

  if (duelos.length === 0) return null;

  if (resultado) {
    const [primera, ...resto] = resultado.orden;
    return (
      <section className="screen desempate">
        <p className="eyebrow">Desempate</p>
        <h2 className="desempate-h">Elegiste el día de {primera.c.n}</h2>
        <p className="desempate-lede">
          De {duelos.length} elecciones, la mayoría apuntaron a{" "}
          {resultado.ganadoras
            .slice(0, 2)
            .map(([k]) => DIMS[k].name.toLowerCase())
            .join(" y ")}
          . Así quedaron tus carreras empatadas, ordenadas por lo que acabas de elegir.
        </p>

        <div className="desempate-orden">
          {resultado.orden.map(({ c, afin }, idx) => (
            <button
              key={c.n}
              className={`desempate-fila${idx === 0 ? " gana" : ""}`}
              onClick={() => onVerCarrera(c.n)}
            >
              <span className="desempate-pos">{idx + 1}</span>
              <span className="desempate-nombre">{c.n}</span>
              <span className="desempate-barra">
                <span style={{ width: `${Math.max(4, Math.round(afin * 100))}%` }} />
              </span>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path d="m6 3.5 4.5 4.5L6 12.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>

        <div className="desempate-nota">
          <b>Esto no es un veredicto.</b>
          <p>
            Es tu propia elección puesta en orden: dijiste que prefieres ese tipo de día.
            {resto.length > 0 && (
              <>
                {" "}
                {resto[0].c.n} sigue siendo una opción real — si te quedó la duda, ve a ver a
                alguien trabajando en cada una antes de decidir.
              </>
            )}
          </p>
        </div>

        <div className="res-actions">
          <button className="btn" onClick={() => onVerCarrera(primera.c.n)}>
            Ver {primera.c.n}
          </button>
          <button
            className="btn-ghost"
            onClick={() => {
              setElecciones([]);
              setI(0);
            }}
          >
            Repetir el desempate
          </button>
          <button className="btn-ghost" onClick={onCerrar}>
            Volver a mis carreras
          </button>
        </div>
      </section>
    );
  }

  const d = duelos[i];
  return (
    <section className="screen desempate">
      <div className="progress-row">
        <span className="eyebrow">Desempate</span>
        <span className="progress-count mono">
          {i + 1} / {duelos.length}
        </span>
      </div>
      <div
        className="track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round((i / duelos.length) * 100)}
        aria-label="Progreso del desempate"
      >
        <div className="fill" style={{ width: `${(i / duelos.length) * 100}%` }} />
      </div>

      <div className="duelo">
        <h2 className="duelo-h">¿Cuál de estos dos días prefieres?</h2>
        <p className="duelo-hint">
          Escoge uno aunque los dos te gusten. Aquí no vale «las dos»: de eso se trata el
          desempate.
        </p>

        <div className="duelo-ops">
          <button className="duelo-op" onClick={() => elegir("a")}>
            {d.a}
          </button>
          <span className="duelo-o">o</span>
          <button className="duelo-op" onClick={() => elegir("b")}>
            {d.b}
          </button>
        </div>

        <div className="test-nav">
          {i > 0 ? (
            <button className="btn-ghost" onClick={volverAtras}>
              ← Anterior
            </button>
          ) : (
            <span />
          )}
          <button className="btn-ghost" onClick={onCerrar}>
            Salir del desempate
          </button>
        </div>
      </div>
    </section>
  );
}
