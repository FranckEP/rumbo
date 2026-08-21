import { BECAS } from "@/lib/becas";
import { BECAS_UNI } from "@/lib/becasUni";
import { LEVEL_LABELS, RUTAS, unisPorNivel, type Career, type CareerLevel } from "@/lib/careers";
import { DIMS, DIM_KEYS, PROFILE_TITLES, type DimKey, type Scores } from "@/lib/riasec";
import { SECTOR_LABEL, SNIES_URL, UNIS, sectorDe } from "@/lib/universities";

const ORDER: CareerLevel[] = ["profesional", "tecnologica", "tecnica"];
const N_CARRERAS = 10;
const N_UNIS = 8;

interface Props {
  code: DimKey[];
  n: Scores;
  ranked: (Career & { match: number })[];
  deptFilter: string;
}

/** Informe completo para imprimir o guardar como PDF. Fuera de impresión no se
 *  ve (display:none en pantalla), así que no afecta la interfaz. */
export default function PrintReport({ code, n, ranked, deptFilter }: Props) {
  const hoy = new Date().toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const top = ranked.slice(0, N_CARRERAS);
  const principal = ranked[0];
  const orden = [...DIM_KEYS].sort((a, b) => n[b] - n[a]);

  /** universidades de la carrera principal, filtradas por departamento */
  const unisPrincipal = principal
    ? ORDER.flatMap((l) => (unisPorNivel(principal)[l] ?? []).map((id) => ({ id, l })))
        .filter(({ id }) => {
          const u = UNIS[id];
          return u && (deptFilter === "all" || u[2].includes("*") || u[2].includes(deptFilter));
        })
        .slice(0, N_UNIS)
    : [];

  return (
    <div className="print-report" aria-hidden="true">
      <header className="pr-head">
        <div>
          <div className="pr-brand">Rumbo</div>
          <div className="pr-sub">Test vocacional · modelo RIASEC (Holland)</div>
        </div>
        <div className="pr-date">{hoy}</div>
      </header>

      <h1 className="pr-title">
        Tu perfil: {PROFILE_TITLES[code[0]]}
        {code[1] ? ` · ${DIMS[code[1]].name}` : ""}
      </h1>
      <p className="pr-lede">
        Código Holland <b>{code.join("-")}</b> — las tres dimensiones que más te definen son{" "}
        {code.map((k) => DIMS[k].name.toLowerCase()).join(", ")}.
      </p>

      <h2 className="pr-h2">Tu perfil en las seis dimensiones</h2>
      <table className="pr-table">
        <tbody>
          {orden.map((k) => (
            <tr key={k}>
              <td className="pr-dim-letter">{k}</td>
              <td className="pr-dim-name">{DIMS[k].name}</td>
              <td className="pr-bar-cell">
                <span className="pr-bar">
                  <span style={{ width: `${Math.round(n[k] * 100)}%` }} />
                </span>
              </td>
              <td className="pr-pct">{Math.round(n[k] * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="pr-blurbs">
        {code.slice(0, 2).map((k) => (
          <div key={k}>
            <b>
              {k} · {DIMS[k].name}
            </b>
            <p>{DIMS[k].desc}</p>
          </div>
        ))}
      </div>

      <h2 className="pr-h2">Tus {N_CARRERAS} carreras más afines</h2>
      <table className="pr-table pr-table-lines">
        <thead>
          <tr>
            <th>#</th>
            <th>Carrera</th>
            <th>Niveles disponibles</th>
            <th>Afinidad</th>
          </tr>
        </thead>
        <tbody>
          {top.map((c, i) => (
            <tr key={c.n}>
              <td className="pr-rank">{String(i + 1).padStart(2, "0")}</td>
              <td className="pr-career">{c.n}</td>
              <td className="pr-levels">
                {c.lvl.map((l) => LEVEL_LABELS[l].split(" ")[0]).join(" · ")}
              </td>
              <td className="pr-pct">{Math.round(c.match * 100)}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {principal && (
        <>
          <h2 className="pr-h2">
            Dónde estudiar {principal.n}
            {deptFilter !== "all" ? ` en ${deptFilter}` : ""}
          </h2>
          <div className="pr-rutas">
            {(RUTAS[principal.n] ?? []).map((r) => (
              <div key={r.l + r.n}>
                <b>{LEVEL_LABELS[r.l].split(" ")[0]}</b> · {r.n} · {r.t}
              </div>
            ))}
          </div>
          {unisPrincipal.length > 0 && (
            <table className="pr-table pr-table-lines">
              <thead>
                <tr>
                  <th>Institución</th>
                  <th>Sector</th>
                  <th>Becas propias</th>
                  <th>Sitio oficial</th>
                </tr>
              </thead>
              <tbody>
                {unisPrincipal.map(({ id }) => (
                  <tr key={id}>
                    <td className="pr-career">{UNIS[id][0]}</td>
                    <td>{SECTOR_LABEL[sectorDe(id)]}</td>
                    <td>{BECAS_UNI[id]?.p.length ?? 0}</td>
                    <td className="pr-url">{UNIS[id][1].replace("https://", "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      <h2 className="pr-h2">Cómo pagarla</h2>
      <div className="pr-becas">
        {BECAS.map((b) => (
          <div className="pr-beca" key={b.n}>
            <b>{b.n}</b>
            <span className="pr-beca-tag">{b.tag}</span>
            <p>{b.d}</p>
            <span className="pr-url">{b.url.replace("https://", "")}</span>
          </div>
        ))}
      </div>

      {principal && unisPrincipal.some(({ id }) => BECAS_UNI[id]) && (
        <>
          <h3 className="pr-h3">Becas de las universidades de tu carrera principal</h3>
          <div className="pr-becas-uni">
            {unisPrincipal
              .filter(({ id }) => BECAS_UNI[id])
              .map(({ id }) => (
                <div key={id}>
                  <b>{UNIS[id][0]}:</b> {BECAS_UNI[id].p.join(" · ")}
                </div>
              ))}
          </div>
        </>
      )}

      <footer className="pr-foot">
        <p>
          Este informe es una guía de exploración, no un veredicto. Las universidades listadas son
          una muestra: hay más instituciones en Colombia que ofrecen cada carrera, y las duraciones
          son una referencia general. Verifica el registro calificado y la acreditación de cada
          programa en el SNIES ({SNIES_URL.replace("https://", "")}) antes de decidir.
        </p>
        <p className="pr-credit">Rumbo · creado por Franck E. Peñaloza · basado en el modelo RIASEC de John L. Holland</p>
      </footer>
    </div>
  );
}
