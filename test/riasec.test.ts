import { describe, expect, it } from "vitest";
import {
  DIM_KEYS,
  MARGEN_EMPATE,
  QUESTIONS,
  TOTAL,
  cosine,
  hollandCode,
  normalized,
  scores,
  type Answers,
  type DimKey,
  type Scores,
} from "@/lib/riasec";
import { CAREERS } from "@/lib/careers";

/** Respuestas donde cada dimensión recibe un valor fijo. */
function responde(por: Partial<Record<DimKey, number>>, base = 0): Answers {
  return QUESTIONS.map((q) => por[q.dim] ?? base);
}

describe("cuestionario", () => {
  it("tiene 48 preguntas repartidas por igual entre las seis dimensiones", () => {
    expect(TOTAL).toBe(48);
    expect(QUESTIONS).toHaveLength(48);
    for (const k of DIM_KEYS) {
      expect(QUESTIONS.filter((q) => q.dim === k)).toHaveLength(8);
    }
  });

  it("no repite el texto de ninguna pregunta", () => {
    const textos = QUESTIONS.map((q) => q.text);
    expect(new Set(textos).size).toBe(textos.length);
  });
});

describe("scores y normalized", () => {
  it("suma por dimensión y trata las respuestas sin contestar como cero", () => {
    const a: Answers = QUESTIONS.map(() => null);
    const s = scores(a);
    for (const k of DIM_KEYS) expect(s[k]).toBe(0);
  });

  it("normaliza al máximo posible por dimensión", () => {
    const max = responde({}, 3); // 8 preguntas × 3 = 24 por dimensión
    const n = normalized(scores(max));
    for (const k of DIM_KEYS) expect(n[k]).toBeCloseTo(1, 5);
  });

  it("no devuelve valores fuera de 0..1", () => {
    const n = normalized(scores(responde({ I: 3, R: 2 }, 1)));
    for (const k of DIM_KEYS) {
      expect(n[k]).toBeGreaterThanOrEqual(0);
      expect(n[k]).toBeLessThanOrEqual(1);
    }
  });
});

describe("cosine (correlación centrada)", () => {
  const perfil = (p: Partial<Scores>): Scores =>
    Object.fromEntries(DIM_KEYS.map((k) => [k, p[k] ?? 0])) as Scores;

  it("da 1 a un perfil idéntico", () => {
    const p = perfil({ I: 1, R: 0.5, A: 0.2 });
    expect(cosine(p, p)).toBeCloseTo(1, 6);
  });

  it("da 0 cuando la correlación es negativa, no un número negativo", () => {
    const usuario = perfil({ I: 1, C: 0 });
    const carrera = perfil({ I: 0, C: 1 });
    const r = cosine(usuario, carrera);
    expect(r).toBe(0);
  });

  it("da 0 si algún vector es plano: no hay forma que comparar", () => {
    const plano = perfil({ R: 0.5, I: 0.5, A: 0.5, S: 0.5, E: 0.5, C: 0.5 });
    expect(cosine(plano, perfil({ I: 1 }))).toBe(0);
    expect(cosine(perfil({ I: 1 }), plano)).toBe(0);
  });

  it("ignora la intensidad y compara la forma: es el arreglo del bug de los 78-82%", () => {
    /* Dos personas con la misma FORMA pero distinto entusiasmo general
       tienen que puntuar igual contra la misma carrera. Con coseno crudo
       la entusiasta salía sistemáticamente más alta. */
    const tibio = perfil({ I: 0.4, R: 0.3, A: 0.2, S: 0.1, E: 0.1, C: 0.1 });
    const intenso = perfil({ I: 0.9, R: 0.8, A: 0.7, S: 0.6, E: 0.6, C: 0.6 });
    const carrera = perfil({ I: 1, R: 0.7, A: 0.3, S: 0.2, E: 0.1, C: 0.4 });
    expect(cosine(tibio, carrera)).toBeCloseTo(cosine(intenso, carrera), 6);
  });

  it("separa de verdad las carreras de un perfil marcado", () => {
    /* Antes del arreglo todo caía entre 70% y 90%. Con un perfil claro,
       la primera y la última deben distar bastante. */
    const usuario = normalized(scores(responde({ I: 3, R: 2 }, 0)));
    const puntos = CAREERS.map((c) => cosine(usuario, c.v)).sort((a, b) => b - a);
    expect(puntos[0] - puntos[puntos.length - 1]).toBeGreaterThan(0.3);
  });

  it("es simétrico", () => {
    const a = perfil({ I: 0.9, S: 0.2, C: 0.5 });
    const b = perfil({ I: 0.4, S: 0.8, C: 0.1 });
    expect(cosine(a, b)).toBeCloseTo(cosine(b, a), 10);
  });

  it("acepta carreras con dimensiones ausentes sin romperse", () => {
    const r = cosine(perfil({ I: 1, R: 0.5 }), { I: 1 } as Partial<Scores>);
    expect(Number.isFinite(r)).toBe(true);
    expect(r).toBeGreaterThanOrEqual(0);
  });
});

describe("hollandCode", () => {
  it("devuelve las tres dimensiones más altas, de mayor a menor", () => {
    const n = normalized(scores(responde({ I: 3, R: 2, A: 1 }, 0)));
    expect(hollandCode(n)).toEqual(["I", "R", "A"]);
  });

  it("siempre devuelve tres letras, incluso con todo empatado", () => {
    const n = normalized(scores(responde({}, 2)));
    expect(hollandCode(n)).toHaveLength(3);
  });
});

describe("empates", () => {
  it("MARGEN_EMPATE es un margen pequeño y positivo", () => {
    expect(MARGEN_EMPATE).toBeGreaterThan(0);
    expect(MARGEN_EMPATE).toBeLessThan(0.15);
  });

  it("un perfil plano deja muchas carreras dentro del margen", () => {
    const usuario = normalized(scores(responde({}, 2)));
    const puntos = CAREERS.map((c) => cosine(usuario, c.v));
    const top = Math.max(...puntos);
    const empatadas = puntos.filter((p) => top - p <= MARGEN_EMPATE);
    expect(empatadas.length).toBeGreaterThan(1);
  });
});
