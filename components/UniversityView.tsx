import { useEffect, useMemo } from "react";
import { BECAS_UNI } from "@/lib/becasUni";
import { LEVEL_LABELS, RUTAS, unisPorNivel, type Career, type CareerLevel } from "@/lib/careers";
import { SECTOR_LABEL, SNIES_URL, UNIS, sectorDe } from "@/lib/universities";
import { LinkOutIcon, PinIcon } from "./icons";

const ORDER: CareerLevel[] = ["profesional", "tecnologica", "tecnica"];
const AFINES_VISIBLES = 4;

interface Props {
  uniId: string;
  career: Career & { match: number };
  /** todas las carreras ya rankeadas, para cruzar cuáles se ofrecen aquí */
  ranked: (Career & { match: number })[];
  onBack: () => void;
  onPickCareer: (name: string) => void;
  verTodasAfines: boolean;
  onVerTodasAfines: () => void;
}

export default function UniversityView({
  uniId,
  career,
  ranked,
  onBack,
  onPickCareer,
  verTodasAfines,
  onVerTodasAfines,
}: Props) {
  const u = UNIS[uniId];
  const becas = BECAS_UNI[uniId];
  const sector = sectorDe(uniId);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [uniId]);

  /** el nivel en el que esta universidad ofrece la carrera */
  const nivel = useMemo(() => {
    const por = unisPorNivel(career);
    return ORDER.find((l) => (por[l] ?? []).includes(uniId));
  }, [career, uniId]);

  const ruta = nivel ? (RUTAS[career.n] ?? []).find((r) => r.l === nivel) : undefined;

  /** otras carreras del ranking que esta misma universidad ofrece */
  const afines = useMemo(
    () => ranked.filter((c) => c.n !== career.n && c.u.includes(uniId)),
    [ranked, career.n, uniId]
  );
  const afinesVisibles = verTodasAfines ? afines : afines.slice(0, AFINES_VISIBLES);

  if (!u) return null;

  return (
    <section className="screen uni-view">
      <button className="back-link" onClick={onBack}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Volver a {career.n}
      </button>

      <header className="uni-hero panel">
        <div>
          <h2>{u[0]}</h2>
          <div className="uni-hero-chips">
            <span className="uni-chip">
              <PinIcon /> {u[2].includes("*") ? "Todo el país" : u[2].join(" · ")}
            </span>
            <span className={`uni-chip${sector === "publica" ? " uni-chip-on" : ""}`}>
              {SECTOR_LABEL[sector]}
            </span>
            {becas && (
              <span className="uni-chip uni-chip-on">
                {becas.p.length} {becas.p.length === 1 ? "beca propia" : "becas propias"}
              </span>
            )}
          </div>
        </div>
        <a className="btn" href={u[1]} target="_blank" rel="noopener">
          Sitio oficial <LinkOutIcon />
        </a>
      </header>

      <div className="uni-grid">
        <div className="uni-col">
          <div className="panel uni-career">
            <span className="eyebrow">La carrera que te trajo aquí</span>
            <div className="uni-career-head">
              <h3>{career.n}</h3>
              <span className="uni-career-match">{Math.round(career.match * 100)}%</span>
            </div>
            <div className="uni-career-meter">
              <div style={{ width: `${Math.round(career.match * 100)}%` }} />
            </div>

            <dl className="uni-facts">
              <div>
                <dt className={`ruta-lvl ruta-${nivel ?? "profesional"}`}>
                  {LEVEL_LABELS[nivel ?? "profesional"].split(" ")[0]}
                </dt>
                <dd>{ruta?.n ?? career.n}</dd>
              </div>
              {ruta?.t && (
                <div>
                  <dt className="ruta-lvl uni-fact-neutral">Duración</dt>
                  <dd>
                    {ruta.t} <em>(referencia general)</em>
                  </dd>
                </div>
              )}
            </dl>

            <p className="uni-note">
              La duración y el plan de estudios exactos los define cada universidad. Confírmalos en
              el SNIES antes de decidir.
            </p>
          </div>

          {afines.length > 0 && (
            <div className="panel">
              <h3 className="uni-sub">Otras carreras afines aquí</h3>
              <p className="uni-sub-note">
                De tus {ranked.length} carreras, estas también se ofrecen en esta universidad.
              </p>
              <div className="uni-afines">
                {afinesVisibles.map((c) => (
                  <button key={c.n} className="uni-afin" onClick={() => onPickCareer(c.n)}>
                    <span>{c.n}</span>
                    <b>{Math.round(c.match * 100)}%</b>
                  </button>
                ))}
                {!verTodasAfines && afines.length > AFINES_VISIBLES && (
                  <button className="uni-more" onClick={onVerTodasAfines}>
                    Ver las otras {afines.length - AFINES_VISIBLES}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="panel">
          <h3 className="uni-sub">Becas de esta universidad</h3>
          {becas ? (
            <>
              <p className="uni-sub-note">
                {becas.p.length} {becas.p.length === 1 ? "programa propio" : "programas propios"},
                además de las ayudas nacionales de la pestaña Becas.
              </p>
              <div className="uni-becas">
                {becas.p.map((b) => (
                  <div className="uni-beca-item" key={b}>
                    {b}
                  </div>
                ))}
              </div>
              <div className="uni-cov">
                <span className="eyebrow">A quién se las dan</span>
                <p>{becas.c}</p>
              </div>
            </>
          ) : (
            <p className="no-unis">
              No tenemos el detalle de sus becas. Búscalas en su sitio oficial como «becas» o «apoyo
              financiero».
            </p>
          )}

          <div className="uni-actions">
            <a className="btn" href={u[1]} target="_blank" rel="noopener">
              Ver requisitos de las becas <LinkOutIcon />
            </a>
            <a className="btn-ghost" href={SNIES_URL} target="_blank" rel="noopener">
              Buscar el programa en el SNIES
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
