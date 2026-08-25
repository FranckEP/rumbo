import { useState } from "react";
import { LEVEL_LABELS, RUTAS, type Career, type CareerLevel } from "@/lib/careers";
import { BECAS_UNI } from "@/lib/becasUni";
import { costoDe, cuantasDe, duracionDe, institucionesDe, nivelesDe, pesos } from "@/lib/oferta";
import { DIMS, type DimKey } from "@/lib/riasec";
import { SECTOR_LABEL, SNIES_URL } from "@/lib/universities";
import { useCountUp } from "@/lib/useCountUp";

const ORDER: CareerLevel[] = ["profesional", "tecnologica", "tecnica"];
const UNIS_VISIBLES = 7;

type Pestana = "que" | "rutas" | "donde";
const PESTANAS: [Pestana, string][] = [
  ["que", "¿Qué es?"],
  ["rutas", "Rutas de formación"],
  ["donde", "Dónde estudiar"],
];

interface Props {
  career: Career;
  rank: number;
  match: number;
  deptFilter: string;
  open: boolean;
  onToggle: () => void;
  animDelay: number;
  /** abre la página de esa universidad para esta carrera */
  onPickUni: (uniId: string) => void;
}

export default function CareerCard({
  career,
  rank,
  match,
  deptFilter,
  open,
  onToggle,
  animDelay,
  onPickUni,
}: Props) {
  const pct = Math.round(match * 100);
  const shownPct = useCountUp(pct, true, 650);
  const [tab, setTab] = useState<Pestana>("que");
  const [nivel, setNivel] = useState<CareerLevel | null>(null);
  const [verTodas, setVerTodas] = useState(false);

  const codeLetters = (Object.entries(career.v) as [DimKey, number][])
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  const rutas = RUTAS[career.n] ?? [];
  /* Niveles e instituciones vienen del SNIES: son la oferta real y vigente,
     no una lista curada a mano que había que mantener carrera por carrera. */
  const niveles = nivelesDe(career.n);

  const nivelActivo = nivel && niveles.includes(nivel) ? nivel : niveles[0];
  const unis = nivelActivo ? institucionesDe(career.n, nivelActivo, deptFilter) : [];
  const rutaActiva = rutas.find((r) => r.l === nivelActivo);
  const dur = nivelActivo ? duracionDe(career.n, nivelActivo) : undefined;
  const costo = nivelActivo ? costoDe(career.n, nivelActivo) : undefined;
  const mostradas = verTodas ? unis : unis.slice(0, UNIS_VISIBLES);
  const ocultas = unis.length - mostradas.length;

  return (
    <div className={`career${open ? " open" : ""}`} style={{ animationDelay: `${animDelay}ms` }}>
      <button className="career-head" aria-expanded={open} onClick={onToggle}>
        <span className="career-top">
          <span className="career-rank">{String(rank).padStart(2, "0")}</span>
          <span className="career-name">{career.n}</span>
          <span className="career-code">
            {codeLetters.map(([k]) => (
              <i key={k} style={{ background: DIMS[k].soft, color: DIMS[k].color }}>
                {k}
              </i>
            ))}
          </span>
          <span className="career-match">{shownPct}%</span>
          <svg className="career-chevron" width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path
              d="M3.5 5.25 7 8.75l3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <span className="career-meter">
          <div style={{ width: `${shownPct}%` }} />
        </span>
      </button>

      <div className="career-body-wrap">
        <div className="career-body-inner">
          <div className="career-body">
            <div className="ctabs" role="tablist" aria-label={`Información de ${career.n}`}>
              {PESTANAS.map(([id, label]) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={tab === id}
                  className={`ctab${tab === id ? " ctab-on" : ""}`}
                  onClick={() => setTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>

            {tab === "que" && (
              <div className="ctab-panel">
                <p className="ctab-desc">{career.d}</p>
                <div className="fields">
                  {career.f.map((x) => (
                    <span key={x}>{x}</span>
                  ))}
                </div>
              </div>
            )}

            {tab === "rutas" && (
              <div className="ctab-panel">
                <p className="ctab-hint">
                  El mismo campo se puede estudiar por varios caminos. Estos son los programas
                  reales y su duración típica.
                </p>
                <div className="rutas">
                  {(rutas.length
                    ? rutas
                    : career.lvl.map((l) => ({ l, n: LEVEL_LABELS[l], t: "", w: undefined }))
                  ).map((r) => (
                    <div className="ruta" key={r.l + r.n}>
                      <span className={`ruta-lvl ruta-${r.l}`}>{LEVEL_LABELS[r.l].split(" ")[0]}</span>
                      <span className="ruta-name">
                        {r.n}
                        {r.w ? <em>{r.w}</em> : null}
                      </span>
                      <span className="ruta-time">{r.t}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {tab === "donde" && (
              <div className="ctab-panel">
                <div className="chip-row">
                  {niveles.map((l) => {
                    const count = cuantasDe(career.n, l, deptFilter);
                    return (
                      <button
                        key={l}
                        type="button"
                        className={`chip${nivelActivo === l ? " chip-on" : ""}`}
                        aria-pressed={nivelActivo === l}
                        onClick={() => {
                          setNivel(l);
                          setVerTodas(false);
                        }}
                      >
                        {LEVEL_LABELS[l].split(" ")[0]}
                        <b>{count}</b>
                      </button>
                    );
                  })}
                </div>

                <p className="ctab-hint">
                  {rutaActiva?.n ?? career.n}
                  {dur ? `, ${dur} semestres` : rutaActiva ? `, ${rutaActiva.t}` : ""}
                  {costo ? `, matrícula desde ${pesos(costo)}` : ""}
                  {deptFilter !== "all" ? `, en ${deptFilter}` : ""}
                </p>

                {mostradas.length ? (
                  <div className="uni-rows">
                    {mostradas.map((u) => {
                      const nBecas = u.clave ? BECAS_UNI[u.clave]?.p.length ?? 0 : 0;
                      return (
                        <button
                          type="button"
                          className="uni-row"
                          key={u.id}
                          onClick={() => onPickUni(u.id)}
                        >
                          <span className="uni-row-name">{u.nombre}</span>
                          <span className={`uni-row-sector${u.sector === "publica" ? " on" : ""}`}>
                            {SECTOR_LABEL[u.sector]}
                          </span>
                          {nBecas > 0 && (
                            <span className="uni-row-becas">
                              {nBecas} {nBecas === 1 ? "beca" : "becas"}
                            </span>
                          )}
                          <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                            <path
                              d="m6 3.5 4.5 4.5L6 12.5"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </button>
                      );
                    })}
                    {ocultas > 0 && (
                      <button type="button" className="uni-more" onClick={() => setVerTodas(true)}>
                        +{ocultas} universidades más
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="no-unis">
                    {deptFilter === "all"
                      ? "No encontramos este nivel en el registro del SNIES."
                      : `Nadie la ofrece en ${deptFilter} en este nivel, según el SNIES. Prueba con otro departamento o con otro nivel.`}
                  </p>
                )}

                <a className="snies-link" href={SNIES_URL} target="_blank" rel="noopener">
                  Verificar programas y acreditación en el SNIES (Min. Educación) →
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
