import { useMemo, useState } from "react";
import { BECAS } from "@/lib/becas";
import { BECAS_UNI } from "@/lib/becasUni";
import { SECTOR_LABEL, UNIS, sectorDe } from "@/lib/universities";
import { LinkOutIcon } from "./icons";
import UniBecas from "./UniBecas";

interface Props {
  /** departamento elegido en Carreras */
  deptFilter: string;
  /** universidades que abrió en Carreras, en orden de visita */
  vistas: string[];
}

const RUTA_A = ["Matrícula Cero", "SENA — formación gratuita"];

export default function Becas({ deptFilter, vistas }: Props) {
  const [verTodas, setVerTodas] = useState(false);
  const hasDept = deptFilter !== "all";

  const rutaA = BECAS.filter((b) => RUTA_A.includes(b.n));
  /* Colfuturo es para posgrado en el exterior: no ayuda a pagar este pregrado,
     así que sale de las rutas y va al final como nota. */
  const rutaB = BECAS.filter((b) => b.grupo === "creditos" && b.tag !== "Más adelante");
  const masAdelante = BECAS.filter((b) => b.tag === "Más adelante");
  const regionales = useMemo(
    () =>
      BECAS.filter(
        (b) => b.grupo === "region" && (!hasDept || b.depts?.includes(deptFilter))
      ),
    [hasDept, deptFilter]
  );

  /** las becas del 100% que sí existen en nuestros datos */
  const cienPorCiento = useMemo(
    () =>
      Object.entries(BECAS_UNI)
        .filter(([, b]) => b.c.includes("100%") || b.p.some((p) => p.includes("100%")))
        .filter(([id]) => {
          const u = UNIS[id];
          return u && (!hasDept || u[2].includes("*") || u[2].includes(deptFilter));
        })
        .slice(0, 4),
    [hasDept, deptFilter]
  );

  const misUnis = vistas.map((id) => ({ id, u: UNIS[id], b: BECAS_UNI[id] })).filter((x) => x.u);

  return (
    <div className="tab-panel">
      <p className="tab-lede">
        Hay dos caminos para que la carrera te cueste menos, y no son excluyentes: muchos jóvenes
        combinan la gratuidad estatal con una beca de la universidad.
      </p>

      <div className="rutas-becas">
        <section className="panel ruta-beca ruta-beca-key">
          <span className="ruta-tag ruta-tag-a">Ruta A</span>
          <h3>No pagar matrícula</h3>
          <p className="ruta-lede">
            Si entras a una institución pública o al SENA, la matrícula puede costarte $0.
          </p>
          <div className="ruta-items">
            {rutaA.map((b) => (
              <a key={b.n} className="ruta-item" href={b.url} target="_blank" rel="noopener">
                <b>{b.n}</b>
                <em>{b.d}</em>
                <span className="ruta-item-go">
                  {b.linkText} <LinkOutIcon />
                </span>
              </a>
            ))}
            {cienPorCiento.length > 0 && (
              <div className="ruta-item ruta-item-static">
                <b>Becas del 100% en privadas</b>
                <em>
                  Cubren toda la matrícula si tu puntaje del Icfes es alto
                  {hasDept ? ` (en ${deptFilter})` : ""}.
                </em>
                <span className="ruta-unis">
                  {cienPorCiento.map(([id]) => (
                    <i key={id}>{UNIS[id][0]}</i>
                  ))}
                </span>
              </div>
            )}
          </div>
        </section>

        <section className="panel ruta-beca">
          <span className="ruta-tag">Ruta B</span>
          <h3>Pagar mucho menos</h3>
          <p className="ruta-lede">
            Si vas a una privada, casi todas descuentan por mérito o por tu situación económica.
          </p>
          <div className="ruta-items">
            {rutaB.map((b) => (
              <a key={b.n} className="ruta-item" href={b.url} target="_blank" rel="noopener">
                <b>{b.n}</b>
                <em>{b.d}</em>
                <span className="ruta-item-go">
                  {b.linkText} <LinkOutIcon />
                </span>
              </a>
            ))}
            <div className="ruta-item ruta-item-static">
              <b>Descuentos por Saber 11</b>
              <em>
                Tu puntaje del Icfes vale plata: del 15% al 80% de la matrícula según la
                universidad. También hay becas de deporte, arte y cultura que casi nadie reclama.
              </em>
            </div>
          </div>
        </section>
      </div>

      {misUnis.length > 0 && (
        <section className="beca-group">
          <div className="group-rule">
            <span className="eyebrow">En las universidades que miraste</span>
            <i />
          </div>
          <div className="beca-rows">
            {misUnis.map(({ id, u, b }) => (
              <a key={id} className="beca-row" href={u[1]} target="_blank" rel="noopener">
                <span className={`uni-row-sector${sectorDe(id) === "publica" ? " on" : ""}`}>
                  {SECTOR_LABEL[sectorDe(id)]}
                </span>
                <span className="beca-row-text">
                  <b>{u[0]}</b>
                  <em>{b ? b.p.slice(0, 3).join(" · ") : "Consulta sus becas en el sitio oficial"}</em>
                </span>
                <span className="beca-row-go">
                  Abrir <LinkOutIcon />
                </span>
              </a>
            ))}
          </div>
        </section>
      )}

      {regionales.length > 0 && (
        <section className="beca-group">
          <div className="group-rule">
            <span className="eyebrow">
              {hasDept ? `Solo para ${deptFilter}` : "Ayudas regionales"}
            </span>
            <i />
          </div>
          <div className="becas-grid">
            {regionales.map((b) => (
              <div className="beca" key={b.n}>
                <div className="beca-tags">
                  <span className={`beca-tag${b.gratis ? " beca-tag-free" : ""}`}>
                    {b.gratis ? "Gratis" : b.tag}
                  </span>
                  {b.gratis && <span className="beca-scope">{b.tag}</span>}
                </div>
                <h4>{b.n}</h4>
                <p>{b.d}</p>
                <a href={b.url} target="_blank" rel="noopener">
                  {b.linkText} <LinkOutIcon />
                </a>
              </div>
            ))}
          </div>
        </section>
      )}

      {masAdelante.map((b) => (
        <a key={b.n} className="beca-row beca-row-later" href={b.url} target="_blank" rel="noopener">
          <span className="beca-tag">{b.tag}</span>
          <span className="beca-row-text">
            <b>{b.n}</b>
            <em>{b.d}</em>
          </span>
          <span className="beca-row-go">
            Abrir <LinkOutIcon />
          </span>
        </a>
      ))}

      {verTodas ? (
        <UniBecas deptFilter={deptFilter} />
      ) : (
        <div className="ver-todas">
          <p>¿Quieres mirar las becas de otras instituciones?</p>
          <button className="btn-ghost" onClick={() => setVerTodas(true)}>
            Ver las becas de las {Object.keys(BECAS_UNI).length} instituciones
          </button>
        </div>
      )}
    </div>
  );
}
