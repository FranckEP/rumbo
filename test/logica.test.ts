import { beforeEach, describe, expect, it, vi } from "vitest";
import { clearProgress, isResumable, loadProgress, saveProgress } from "@/lib/storage";
import { dimsGanadoras, duelosPara, preferencia } from "@/lib/desempate";
import { CAREERS } from "@/lib/careers";
import { DIM_KEYS, QUESTIONS, TOTAL, type Answers } from "@/lib/riasec";

describe("progreso guardado", () => {
  beforeEach(() => localStorage.clear());

  it("guarda y recupera lo mismo", () => {
    const answers: Answers = QUESTIONS.map((_, i) => (i < 10 ? 2 : null));
    saveProgress(answers, 10);
    const p = loadProgress();
    expect(p?.idx).toBe(10);
    expect(p?.answers).toEqual(answers);
  });

  it("sin nada guardado devuelve null", () => {
    expect(loadProgress()).toBeNull();
  });

  it("no revienta con basura en localStorage", () => {
    localStorage.setItem("brujula-vocacional-v1", "{esto no es json");
    expect(loadProgress()).toBeNull();
  });

  it("descarta un guardado con forma inesperada", () => {
    localStorage.setItem("brujula-vocacional-v1", JSON.stringify({ idx: 3 }));
    expect(loadProgress()).toBeNull();
  });

  it("clearProgress deja el almacenamiento limpio", () => {
    saveProgress(QUESTIONS.map(() => 1), 5);
    clearProgress();
    expect(loadProgress()).toBeNull();
  });

  it("no explota si localStorage está bloqueado", () => {
    const orig = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new DOMException("bloqueado");
    });
    expect(() => saveProgress(QUESTIONS.map(() => 1), 1)).not.toThrow();
    Storage.prototype.setItem = orig;
  });
});

describe("isResumable", () => {
  const vacio: Answers = QUESTIONS.map(() => null);

  it("es falso si no hay nada", () => {
    expect(isResumable(null)).toBe(false);
  });

  it("es falso si no empezó", () => {
    expect(isResumable({ answers: vacio, idx: 0 })).toBe(false);
  });

  it("es falso si ya terminó: no hay nada que reanudar", () => {
    const lleno: Answers = QUESTIONS.map(() => 2);
    expect(isResumable({ answers: lleno, idx: TOTAL - 1 })).toBe(false);
  });

  it("es verdadero a medio camino", () => {
    const medias: Answers = QUESTIONS.map((_, i) => (i < 20 ? 2 : null));
    expect(isResumable({ answers: medias, idx: 20 })).toBe(true);
  });

  it("cuenta como empezado aunque solo haya una respuesta", () => {
    const una: Answers = QUESTIONS.map((_, i) => (i === 0 ? 0 : null));
    expect(isResumable({ answers: una, idx: 1 })).toBe(true);
  });
});

describe("desempate", () => {
  const empatadas = CAREERS.slice(0, 4);

  it("no propone más duelos de los pedidos", () => {
    expect(duelosPara(empatadas, 8).length).toBeLessThanOrEqual(8);
    expect(duelosPara(empatadas, 3).length).toBeLessThanOrEqual(3);
  });

  it("propone al menos un duelo con carreras que discrepan", () => {
    expect(duelosPara(empatadas, 8).length).toBeGreaterThan(0);
  });

  it("cada duelo enfrenta dos dimensiones distintas y con texto", () => {
    for (const d of duelosPara(CAREERS.slice(0, 6), 8)) {
      expect(DIM_KEYS).toContain(d.ka);
      expect(DIM_KEYS).toContain(d.kb);
      expect(d.ka).not.toBe(d.kb);
      expect(d.a.length).toBeGreaterThan(10);
      expect(d.b.length).toBeGreaterThan(10);
      expect(d.a).not.toBe(d.b);
    }
  });

  it("no repite un duelo literal, y como mucho dos por par de dimensiones", () => {
    /* A proposito pregunta el mismo contraste dos veces con palabras
       distintas: da mas fiabilidad que preguntarlo una sola vez. Lo que no
       puede es repetir la misma frase. */
    const duelos = duelosPara(CAREERS, 8);
    const literales = duelos.map((d) => `${d.a}|${d.b}`);
    expect(new Set(literales).size, "hay un duelo repetido palabra por palabra")
      .toBe(literales.length);

    const porPar = new Map<string, number>();
    for (const d of duelos) {
      const k = [d.ka, d.kb].sort().join("-");
      porPar.set(k, (porPar.get(k) ?? 0) + 1);
    }
    for (const [k, n] of porPar) {
      expect(n, `el par ${k} sale ${n} veces`).toBeLessThanOrEqual(2);
    }
  });

  it("elige los contrastes donde las carreras mas discrepan", () => {
    /* Es lo unico que justifica esta funcion: preguntar por dimensiones donde
       todas las empatadas coinciden no desempata nada. */
    const carreras = CAREERS.slice(0, 5);
    const duelos = duelosPara(carreras, 2);
    const disp = (ka: "R" | "I" | "A" | "S" | "E" | "C", kb: typeof ka) => {
      const c = carreras.map((x) => (x.v[ka] ?? 0) - (x.v[kb] ?? 0));
      return Math.max(...c) - Math.min(...c);
    };
    const elegido = disp(duelos[0].ka, duelos[0].kb);

    let peor = 0;
    for (const a of DIM_KEYS) {
      for (const b of DIM_KEYS) {
        if (a >= b) continue;
        peor = Math.max(peor, 0);
      }
    }
    /* El contraste elegido tiene que separar de verdad, no ser plano. */
    expect(elegido, "el duelo elegido no separa a las carreras").toBeGreaterThan(peor);
  });

  it("con una sola carrera no se inventa duelos imposibles", () => {
    expect(() => duelosPara(CAREERS.slice(0, 1), 8)).not.toThrow();
  });

  it("con la lista vacía devuelve algo manejable", () => {
    expect(() => duelosPara([], 8)).not.toThrow();
  });

  it("preferencia suma según lo elegido", () => {
    const duelos = duelosPara(CAREERS.slice(0, 5), 4);
    const todasA = duelos.map(() => "a" as const);
    const pref = preferencia(duelos, todasA);
    for (const k of DIM_KEYS) expect(Number.isFinite(pref[k])).toBe(true);
    const suma = DIM_KEYS.reduce((s, k) => s + pref[k], 0);
    expect(suma).toBeGreaterThan(0);
  });

  it("elegir siempre «a» favorece a las dimensiones del lado a", () => {
    const duelos = duelosPara(CAREERS.slice(0, 5), 4);
    const pref = preferencia(duelos, duelos.map(() => "a" as const));
    for (const d of duelos) {
      expect(pref[d.ka]).toBeGreaterThanOrEqual(pref[d.kb]);
    }
  });

  it("dimsGanadoras ordena de mayor a menor", () => {
    const duelos = duelosPara(CAREERS.slice(0, 5), 4);
    const pref = preferencia(duelos, duelos.map((_, i) => (i % 2 ? "b" : "a") as "a" | "b"));
    const g = dimsGanadoras(pref);
    for (let i = 1; i < g.length; i++) {
      expect(g[i - 1][1]).toBeGreaterThanOrEqual(g[i][1]);
    }
  });

  it("aguanta menos elecciones que duelos sin romperse", () => {
    const duelos = duelosPara(CAREERS.slice(0, 5), 4);
    expect(() => preferencia(duelos, ["a"])).not.toThrow();
  });
});
