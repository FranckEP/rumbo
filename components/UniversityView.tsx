import { useEffect, useMemo } from "react";
import { BECAS_UNI, comprobadaEl } from "@/lib/becasUni";
import { becasWebDe, fechaLegible } from "@/lib/becasWeb";
import { LEVEL_LABELS, RUTAS, type Career, type CareerLevel } from "@/lib/careers";
import { institucion } from "@/lib/instituciones";
import { costoDe, duracionDe, institucionesDe, nivelesDe, pesos } from "@/lib/oferta";
import { SECTOR_LABEL, SNIES_URL } from "@/lib/universities";
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
  const u = institucion(uniId);
  const becas = u?.clave ? BECAS_UNI[u.clave] : undefined;
  /* Si no hay datos curados, al menos se ofrece su página de becas. */
  const web = !becas && u ? becasWebDe(u.id) : undefined;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [uniId]);

  /** el nivel en el que esta universidad ofrece la carrera, según el SNIES */
  const nivel = useMemo(
    () =>
      ORDER.filter((l) => nivelesDe(career.n).includes(l)).find((l) =>
        institucionesDe(career.n, l, "all").some((i) => i.id === uniId)
      ),
    [career.n, uniId]
  );

  const ruta = nivel ? (RUTAS[career.n] ?? []).find((r) => r.l === nivel) : undefined;
  const dur = nivel ? duracionDe(career.n, nivel) : undefined;
  const costo = nivel ? costoDe(career.n, nivel) : undefined;

  /** otras carreras del ranking que esta misma universidad ofrece de verdad */
  const afines = useMemo(
    () =>
      ranked.filter(
        (c) =>
          c.n !== career.n &&
          nivelesDe(c.n).some((l) =>
            institucionesDe(c.n, l, "all").some((i) => i.id === uniId)
          )
      ),
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
          <h2>{u.nombre}</h2>
          <div className="uni-hero-chips">
            <span className="uni-chip">
              <PinIcon /> {u.deps.includes("*") ? "Todo el país" : u.deps.join(" · ")}
            </span>
            <span className={`uni-chip${u.sector === "publica" ? " uni-chip-on" : ""}`}>
              {SECTOR_LABEL[u.sector]}
            </span>
            {becas && (
              <span className="uni-chip uni-chip-on">
                {becas.p.length} {becas.p.length === 1 ? "beca propia" : "becas propias"}
              </span>
            )}
          </div>
        </div>
        <a className="btn" href={u.url} target="_blank" rel="noopener">
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
              {(dur || ruta?.t) && (
                <div>
                  <dt className="ruta-lvl uni-fact-neutral">Duración</dt>
                  <dd>
                    {dur ? `${dur} semestres` : ruta?.t}
                    {dur ? <em> (mediana del SNIES)</em> : <em> (referencia general)</em>}
                  </dd>
                </div>
              )}
              {costo && (
                <div>
                  <dt className="ruta-lvl uni-fact-neutral">Matrícula</dt>
                  <dd>
                    ~{pesos(costo)} por semestre <em>(mediana del SNIES)</em>
                  </dd>
                </div>
              )}
            </dl>

            <p className="uni-note">
              La duración y la matrícula son las medianas que reporta el SNIES para esta carrera y
              nivel en el país, no el dato exacto de esta universidad. Confírmalo con ella antes de
              decidir.
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
              {becas.f && (
                <p className="captura">
                  Comprobado en su sitio oficial el {comprobadaEl(becas.f)}.{" "}
                  <b>Las convocatorias cambian cada semestre: confírmalo antes de contar con una.</b>
                </p>
              )}
            </>
          ) : (
            <p className="no-unis">
              No tenemos el detalle de sus becas. Búscalas en su sitio oficial como «becas» o «apoyo
              financiero».
            </p>
          )}

          {web && (
            <>
              {web.nombres.length > 0 ? (
                <>
                  <p className="uni-sub-note">
                    Estas aparecen en su página de becas. Los requisitos y la vigencia hay que
                    confirmarlos allí.
                  </p>
                  <div className="uni-becas">
                    {web.nombres.map((b) => (
                      <div className="uni-beca-item" key={b}>
                        {b}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="uni-sub-note">
                  Esta institución tiene su propia página de becas. No listamos cuáles son porque
                  las convocatorias cambian cada semestre: preferimos mandarte a la fuente antes
                  que darte un dato viejo.
                </p>
              )}
              <p className="captura">
                Página comprobada el {fechaLegible()}.{" "}
                <b>Lo que diga su sitio es lo que manda.</b>
              </p>
            </>
          )}

          <div className="uni-actions">
            <a className="btn" href={web?.url ?? u.url} target="_blank" rel="noopener">
              {web ? "Ver su página de becas" : "Ver requisitos de las becas"} <LinkOutIcon />
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
