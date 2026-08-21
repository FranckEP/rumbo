"use client";

import { useEffect, useMemo, useState } from "react";
import Becas from "./Becas";
import CareerCard from "./CareerCard";
import Celebration from "./Celebration";
import Desempate from "./Desempate";
import DimBar from "./DimBar";
import { PdfIcon, SearchIcon, ShareIcon, SlidersIcon } from "./icons";
import PrintReport from "./PrintReport";
import Radar from "./Radar";
import SummaryBar from "./SummaryBar";
import UniversityView from "./UniversityView";
import { BECAS } from "@/lib/becas";
import { BECAS_UNI } from "@/lib/becasUni";
import { CAREERS, LEVEL_LABELS, type CareerLevel } from "@/lib/careers";
import {
  DIMS,
  DIM_KEYS,
  MARGEN_EMPATE,
  cosine,
  hollandCode,
  normalized,
  scores,
  type Answers,
  type DimKey,
  type Scores,
} from "@/lib/riasec";
import { DEPTS } from "@/lib/universities";

const PAGE_SIZE = 8;
type SortMode = "match" | "alpha";
type LevelFilter = "all" | CareerLevel;
type Tab = "perfil" | "carreras" | "becas";

interface Props {
  answers: Answers;
  onRestart: () => void;
  onToast: (msg: string) => void;
}

export default function Results({ answers, onRestart, onToast }: Props) {
  const [tab, setTab] = useState<Tab>("perfil");
  const [visibleCareers, setVisibleCareers] = useState(PAGE_SIZE);
  const [query, setQuery] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [sortMode, setSortMode] = useState<SortMode>("match");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [openCareers, setOpenCareers] = useState<Set<string>>(new Set());
  /** universidad abierta: {carrera, universidad} */
  const [uniView, setUniView] = useState<{ career: string; uni: string } | null>(null);
  const [verTodasAfines, setVerTodasAfines] = useState(false);
  /** universidades que ya abrió, para personalizar la pestaña de becas */
  const [unisVistas, setUnisVistas] = useState<string[]>([]);
  const [enDesempate, setEnDesempate] = useState(false);

  function abrirUni(career: string, uni: string) {
    setUniView({ career, uni });
    setVerTodasAfines(false);
    setUnisVistas((prev) => (prev.includes(uni) ? prev : [uni, ...prev].slice(0, 5)));
  }
  const [barsReady, setBarsReady] = useState(false);
  const [hoverDim, setHoverDim] = useState<DimKey | null>(null);
  const [shareState, setShareState] = useState<"idle" | "done">("idle");

  const { s, n, code, allZero, ranked } = useMemo(() => {
    const s = scores(answers);
    const n = normalized(s);
    return {
      s,
      n,
      code: hollandCode(s),
      allZero: DIM_KEYS.every((k) => s[k] === 0),
      ranked: CAREERS.map((c) => ({ ...c, match: cosine(n, c.v) })).sort(
        (a, b) => b.match - a.match
      ),
    };
  }, [answers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = ranked;
    if (levelFilter !== "all") out = out.filter((c) => c.lvl.includes(levelFilter));
    if (q) {
      out = out.filter(
        (c) =>
          c.n.toLowerCase().includes(q) ||
          c.f.some((f) => f.toLowerCase().includes(q)) ||
          c.d.toLowerCase().includes(q)
      );
    }
    if (sortMode === "alpha") return [...out].sort((a, b) => a.n.localeCompare(b.n, "es"));
    return out;
  }, [ranked, levelFilter, query, sortMode]);

  const activeFilters = (deptFilter !== "all" ? 1 : 0) + (levelFilter !== "all" ? 1 : 0);

  /* Cuántas carreras están tan cerca del primer lugar que el orden entre ellas
     no significa nada. Decirlo es más útil que fingir una jerarquía. */
  const empatadas = useMemo(() => {
    if (!ranked.length) return [];
    const tope = ranked[0].match;
    return ranked.filter((c) => tope - c.match <= MARGEN_EMPATE);
  }, [ranked]);

  useEffect(() => {
    setVisibleCareers(PAGE_SIZE);
  }, [query, levelFilter, sortMode]);

  useEffect(() => {
    const id = requestAnimationFrame(() => setBarsReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const barOrder = useMemo(() => [...DIM_KEYS].sort((a, b) => s[b] - s[a]), [s]);

  function toggleCareer(name: string) {
    setOpenCareers((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }

  function goTab(t: Tab) {
    setTab(t);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function copyResults() {
    const text = buildSummary(code, n, ranked.slice(0, 5));

    if (navigator.share) {
      try {
        await navigator.share({ title: "Mi resultado en Rumbo", text });
        flashShared();
        return;
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        /* si falla el share nativo, seguimos con copiar al portapapeles */
      }
    }

    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(flashShared)
        .catch(() => fallbackCopy(text, flashShared));
    } else {
      fallbackCopy(text, flashShared);
    }
  }

  function flashShared() {
    onToast("Copiado ✓");
    setShareState("done");
    setTimeout(() => setShareState("idle"), 2000);
  }

  if (allZero) {
    return (
      <section className="screen">
        <div className="res-head">
          <p className="eyebrow">Tus resultados</p>
          <h2>Hmm… respondiste que nada va contigo</h2>
          <p>
            Vuelve a intentarlo eligiendo con sinceridad lo que más disfrutas: el test necesita
            contrastes para orientarte.
          </p>
        </div>
        <div className="res-actions">
          <button className="btn" onClick={onRestart}>
            Repetir el test
          </button>
        </div>
      </section>
    );
  }

  if (enDesempate && empatadas.length > 1) {
    return (
      <Desempate
        empatadas={empatadas}
        onCerrar={() => setEnDesempate(false)}
        onVerCarrera={(nombre) => {
          setEnDesempate(false);
          setTab("carreras");
          setQuery("");
          setOpenCareers(new Set([nombre]));
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }

  /* La página de universidad reemplaza los resultados mientras está abierta:
     es una vista propia, no un panel dentro de la lista. */
  if (uniView) {
    const c = ranked.find((x) => x.n === uniView.career);
    if (c) {
      return (
        <UniversityView
          uniId={uniView.uni}
          career={c}
          ranked={ranked}
          verTodasAfines={verTodasAfines}
          onVerTodasAfines={() => setVerTodasAfines(true)}
          onBack={() => {
            setUniView(null);
            setVerTodasAfines(false);
          }}
          onPickCareer={(name) => abrirUni(name, uniView.uni)}
        />
      );
    }
  }

  return (
    <section className="screen">
      <Celebration />

      <SummaryBar code={code} topCareer={ranked[0]} hoverDim={hoverDim} onHover={setHoverDim} />

      <div className="tabs" role="tablist" aria-label="Secciones de resultados">
        {(
          [
            ["perfil", "Mi perfil", null],
            ["carreras", "Carreras", ranked.length],
            ["becas", "Becas", BECAS.length + Object.keys(BECAS_UNI).length],
          ] as [Tab, string, number | null][]
        ).map(([id, label, count]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={`tab${tab === id ? " tab-on" : ""}`}
            onClick={() => goTab(id)}
          >
            {label}
            {count !== null && <b>· {count}</b>}
          </button>
        ))}
      </div>

      {tab === "perfil" && (
        <div className="tab-panel">
          <p className="tab-lede">
            Tus intereses más fuertes son {DIMS[code[0]].name.toLowerCase()} y{" "}
            {DIMS[code[1]].name.toLowerCase()}. Esto es lo que significan.
          </p>

          <div className="res-grid">
            <div className="panel">
              <h3>Tu mapa de intereses</h3>
              <div className="radar-box">
                <Radar n={n} ready={barsReady} hovered={hoverDim} onHover={setHoverDim} />
              </div>
            </div>

            <div className="panel">
              <h3>Puntaje por dimensión</h3>
              <div>
                {barOrder.map((k) => (
                  <DimBar
                    key={k}
                    dim={k}
                    pct={Math.round(n[k] * 100)}
                    active={barsReady}
                    hovered={hoverDim === k}
                    onHover={setHoverDim}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="blurb-grid">
            {code.slice(0, 2).map((k) => (
              <div className="panel blurb" key={k}>
                <h4>
                  <span className="tag" style={{ background: DIMS[k].soft, color: DIMS[k].color }}>
                    {k}
                  </span>
                  {DIMS[k].name}
                </h4>
                <p>{DIMS[k].desc}</p>
              </div>
            ))}
          </div>

          <div className="panel next-step">
            <div>
              <b>¿Y ahora qué?</b>
              <p>Mira las {ranked.length} carreras ordenadas por afinidad con este perfil.</p>
            </div>
            <button className="btn" onClick={() => goTab("carreras")}>
              Ver mis carreras →
            </button>
          </div>
        </div>
      )}

      {tab === "carreras" && (
        <div className="tab-panel">
          <div className="search-bar">
            <label className="search-field">
              <SearchIcon />
              <input
                type="search"
                value={query}
                placeholder="Busca una carrera…"
                aria-label="Buscar carrera"
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <button
              type="button"
              className={`filter-toggle${activeFilters ? " has-filters" : ""}`}
              aria-expanded={filtersOpen}
              onClick={() => setFiltersOpen((v) => !v)}
            >
              <SlidersIcon /> Filtros
              {activeFilters > 0 && <span className="badge">{activeFilters}</span>}
            </button>
          </div>

          {filtersOpen && (
            <div className="filter-bar">
              <label htmlFor="deptSel">Universidades en</label>
              <select id="deptSel" value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
                <option value="all">Todo el país</option>
                {DEPTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <label htmlFor="levelSel">Nivel</label>
              <select
                id="levelSel"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value as LevelFilter)}
              >
                <option value="all">Todos</option>
                <option value="profesional">{LEVEL_LABELS.profesional}</option>
                <option value="tecnologica">{LEVEL_LABELS.tecnologica}</option>
                <option value="tecnica">{LEVEL_LABELS.tecnica}</option>
              </select>

              <div className="filter-actions">
                <div className="sort-toggle" role="group" aria-label="Ordenar carreras">
                  <button
                    type="button"
                    className={sortMode === "match" ? "active" : ""}
                    onClick={() => setSortMode("match")}
                  >
                    Afinidad
                  </button>
                  <button
                    type="button"
                    className={sortMode === "alpha" ? "active" : ""}
                    onClick={() => setSortMode("alpha")}
                  >
                    A–Z
                  </button>
                </div>

                {activeFilters > 0 && (
                  <button
                    type="button"
                    className="clear-filters"
                    onClick={() => {
                      setDeptFilter("all");
                      setLevelFilter("all");
                    }}
                  >
                    Limpiar
                  </button>
                )}
              </div>
            </div>
          )}

          {!query && ranked[0] && ranked[0].match < 0.5 && (
            <div className="empate">
              <b>Tu perfil salió muy parejo</b>
              <p>
                Ninguna carrera destaca con fuerza porque tus respuestas repartieron el interés
                entre varias áreas. No es un error ni algo malo: significa que todavía estás
                explorando. Mira las primeras cinco y fíjate en lo que hacen día a día, no en el
                porcentaje.
              </p>
            </div>
          )}

          {!query && empatadas.length > 1 && ranked[0] && ranked[0].match >= 0.5 && (
            <div className="empate">
              <b>{empatadas.length} carreras te quedaron prácticamente empatadas</b>
              <p>
                {empatadas.map((c) => c.n).join(", ")} están a menos de{" "}
                {Math.round(MARGEN_EMPATE * 100)} puntos entre sí: el orden entre ellas no
                significa nada. Podemos desempatarlas comparando cómo sería tu día en cada una.
              </p>
              <button className="btn" onClick={() => setEnDesempate(true)}>
                Desempatar estas {empatadas.length} →
              </button>
            </div>
          )}

          <p className="result-count">
            {filtered.length} {filtered.length === 1 ? "carrera" : "carreras"}
            {query ? ` para «${query}»` : ""}
            {deptFilter !== "all" ? ` · universidades en ${deptFilter}` : ""}
          </p>

          <div className="career-list">
            {filtered.length === 0 && (
              <p className="empty-note">
                No encontramos carreras con esos filtros. Prueba con otra palabra o limpia los
                filtros.
              </p>
            )}
            {filtered.slice(0, visibleCareers).map((c, i) => (
              <CareerCard
                key={c.n}
                career={c}
                rank={ranked.indexOf(c) + 1}
                match={c.match}
                deptFilter={deptFilter}
                open={openCareers.has(c.n)}
                onToggle={() => toggleCareer(c.n)}
                animDelay={Math.min(i, 7) * 40}
                onPickUni={(uni) => abrirUni(c.n, uni)}
              />
            ))}
          </div>

          {visibleCareers < filtered.length && (
            <div className="res-actions">
              <button
                className="btn-ghost"
                onClick={() => setVisibleCareers((v) => Math.min(v + PAGE_SIZE, filtered.length))}
              >
                Ver {Math.min(PAGE_SIZE, filtered.length - visibleCareers)} carreras más
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "becas" && <Becas deptFilter={deptFilter} vistas={unisVistas} />}

      <div className="res-actions">
        <button className="btn" onClick={copyResults}>
          <ShareIcon />
          {shareState === "done" ? "¡Listo! ✓" : "Compartir mis resultados"}
        </button>
        <button className="btn-ghost" onClick={() => window.print()}>
          <PdfIcon />
          Descargar PDF
        </button>
        <button className="btn-ghost" onClick={onRestart}>
          Repetir el test
        </button>
      </div>

      <PrintReport code={code} n={n} ranked={ranked} deptFilter={deptFilter} />

      <p className="disclaimer">
        Este test es una guía de exploración, no un veredicto. Las universidades listadas son una
        muestra, no un ranking: hay muchas más instituciones en Colombia que ofrecen cada carrera.
        Los niveles (profesional, tecnológica, técnica) son una referencia general: confirma la
        oferta y duración exactas en cada institución. Verifica siempre el registro calificado y la
        acreditación del programa en el SNIES antes de decidir.
      </p>
    </section>
  );
}

function buildSummary(code: DimKey[], n: Scores, top: { n: string; match: number }[]): string {
  return [
    "🧭 Mi resultado en Rumbo",
    `Código Holland: ${code.join("")} (${code.map((k) => DIMS[k].name).join(" · ")})`,
    "",
    "Perfil RIASEC:",
    ...DIM_KEYS.map((k) => `  ${k} ${DIMS[k].name}: ${Math.round(n[k] * 100)}%`),
    "",
    "Carreras más afines:",
    ...top.map((c, i) => `  ${i + 1}. ${c.n} (${Math.round(c.match * 100)}%)`),
  ].join("\n");
}

function fallbackCopy(text: string, done: () => void) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.style.position = "fixed";
  ta.style.opacity = "0";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
    done();
  } catch {
    /* el navegador bloqueó la copia */
  }
  document.body.removeChild(ta);
}
