import { useMemo, useState } from "react";
import { BECAS_UNI } from "@/lib/becasUni";
import { UNIS } from "@/lib/universities";
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
      .map(([id, b]) => ({ id, b, u: UNIS[id] }))
      .filter(({ u, b }) => {
        if (!u) return false;
        if (deptFilter !== "all" && !u[2].includes("*") && !u[2].includes(deptFilter)) return false;
        if (!q) return true;
        return (
          u[0].toLowerCase().includes(q) ||
          b.p.some((x) => x.toLowerCase().includes(q)) ||
          b.c.toLowerCase().includes(q)
        );
      })
      .sort((a, z) => a.u[0].localeCompare(z.u[0], "es"));
  }, [query, deptFilter]);

  const mostradas = lista.slice(0, visibles);

  return (
    <section className="beca-group">
      <div className="group-rule">
        <span className="eyebrow">
          {deptFilter === "all" ? "En las universidades" : `Universidades en ${deptFilter}`}
        </span>
        <i />
      </div>

      <p className="ctab-hint">
        Casi toda institución tiene becas propias. Estas son las de {lista.length}{" "}
        {lista.length === 1 ? "institución" : "instituciones"} de nuestra muestra
        {deptFilter === "all" ? " en el país" : ""}.
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
        {mostradas.map(({ id, b, u }) => {
          const open = abierta === id;
          return (
            <div className={`uni-beca${open ? " open" : ""}`} key={id}>
              <button
                className="uni-beca-head"
                aria-expanded={open}
                onClick={() => setAbierta(open ? null : id)}
              >
                <span className="uni-beca-name">{u[0]}</span>
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
                    <a href={u[1]} target="_blank" rel="noopener">
                      Ver requisitos en {u[0]} <LinkOutIcon />
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
