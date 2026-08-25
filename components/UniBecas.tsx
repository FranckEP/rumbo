import { useMemo, useState } from "react";
import { BECAS_UNI } from "@/lib/becasUni";
import { INSTITUCIONES } from "@/lib/instituciones";
import { LinkOutIcon, SearchIcon } from "./icons";

const PAGE = 6;

interface Props {
  /** departamento elegido en Carreras */
  deptFilter: string;
}

export default function UniBecas({ deptFilter }: Props) {
  const [query, setQuery] = useState("");
  const [visibles, setVisibles] = useState(PAGE);
  const [abierta, setAbierta] = useState<string | null>(null);

  const lista = useMemo(() => {
    const q = query.trim().toLowerCase();
    return Object.entries(BECAS_UNI)
      .map(([clave, b]) => ({
        clave,
        b,
        u: Object.values(INSTITUCIONES).find((i) => i.clave === clave),
      }))
      .filter(({ u, b }) => {
        if (!u) return false;
        if (deptFilter !== "all" && !u.deps.includes("*") && !u.deps.includes(deptFilter)) return false;
        if (!q) return true;
        return (
          u.nombre.toLowerCase().includes(q) ||
          b.p.some((x) => x.toLowerCase().includes(q)) ||
          b.c.toLowerCase().includes(q)
        );
      })
      .sort((a, z) => a.u!.nombre.localeCompare(z.u!.nombre, "es"));
  }, [query, deptFilter]);

  const mostradas = lista.slice(0, visibles);

  return (
    <section className="beca-group">
      <div className="group-rule">
        <span className="eyebrow">De la universidad</span>
        <i />
      </div>
      <p className="group-nota">
        Estas se piden directamente a la institución, no al Estado. Tenemos las de{" "}
        {lista.length} {lista.length === 1 ? "institución" : "instituciones"}
        {deptFilter === "all" ? " del país" : ` en ${deptFilter}`}.
      </p>

      <label className="search-field uni-search">
        <SearchIcon />
        <input
          type="search"
          value={query}
          placeholder="Busca una universidad o tipo de beca…"
          aria-label="Buscar becas de universidades"
          onChange={(e) => {
            setQuery(e.target.value);
            setVisibles(PAGE);
          }}
        />
      </label>

      {lista.length === 0 && (
        <p className="empty-note">
          Ninguna institución de la muestra coincide con esa búsqueda. Prueba con otro nombre.
        </p>
      )}

      <div className="uni-beca-list">
        {mostradas.map(({ clave, b, u }) => {
          const open = abierta === clave;
          if (!u) return null;
          return (
            <div className={`uni-beca${open ? " open" : ""}`} key={clave}>
              <button
                className="uni-beca-head"
                aria-expanded={open}
                onClick={() => setAbierta(open ? null : clave)}
              >
                <span className="uni-beca-name">{u.nombre}</span>
                <span className="uni-beca-count">
                  {b.p.length} {b.p.length === 1 ? "beca" : "becas"}
                </span>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path
                    d="M3.5 5.25 7 8.75l3.5-3.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              <div className="career-body-wrap">
                <div className="career-body-inner">
                  <div className="uni-beca-body">
                    <ul className="uni-beca-progs">
                      {b.p.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                    <p className="uni-beca-cov">{b.c}</p>
                    <a href={u.url} target="_blank" rel="noopener">
                      Ver requisitos en {u.nombre} <LinkOutIcon />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {visibles < lista.length && (
        <div className="res-actions res-actions-tight">
          <button className="btn-ghost" onClick={() => setVisibles((v) => v + PAGE)}>
            Ver {Math.min(PAGE, lista.length - visibles)} instituciones más
          </button>
        </div>
      )}
    </section>
  );
}
