import { describe, expect, it } from "vitest";
import { CAREERS, type CareerLevel } from "@/lib/careers";
import { DEPARTAMENTOS, INSTITUCIONES } from "@/lib/instituciones";
import {
  costoDe,
  cuantasDe,
  departamentosDe,
  duracionDe,
  institucionesDe,
  nivelesDe,
  pesos,
  tieneOferta,
} from "@/lib/oferta";

const NIVELES: CareerLevel[] = ["profesional", "tecnologica", "tecnica"];

/* Profesiones reguladas en Colombia: solo existen como pregrado
   universitario. Un técnico o tecnólogo "parecido" es otra carrera. */
const REGULADAS = ["Medicina", "Derecho", "Odontología", "Veterinaria", "Psicología"];

describe("niveles ofrecidos", () => {
  it("nunca devuelve un nivel que la carrera no declara", () => {
    for (const c of CAREERS) {
      for (const n of nivelesDe(c.n)) {
        expect(c.lvl, `${c.n}: se ofrece ${n} pero no lo declara`).toContain(n);
      }
    }
  });

  it("las profesiones reguladas solo salen como profesional", () => {
    /* El mapeo del SNIES colaba «Tecnología en Atención Prehospitalaria» bajo
       Medicina y «Tecnología en Criminalística» bajo Derecho. La ficha decía
       «Medicina · Tecnológica · 15 instituciones» y eso es mentira. */
    for (const n of REGULADAS) {
      if (!tieneOferta(n)) continue;
      expect(nivelesDe(n), `${n} muestra un nivel que no le corresponde`).toEqual(["profesional"]);
    }
  });

  it("tampoco devuelve instituciones para un nivel prohibido", () => {
    for (const n of REGULADAS) {
      for (const nivel of ["tecnologica", "tecnica"] as CareerLevel[]) {
        expect(
          institucionesDe(n, nivel, "all"),
          `${n} lista instituciones en ${nivel}`
        ).toHaveLength(0);
        expect(cuantasDe(n, nivel, "all"), `${n} cuenta instituciones en ${nivel}`).toBe(0);
      }
    }
  });

  it("toda carrera con oferta tiene al menos un nivel", () => {
    for (const c of CAREERS) {
      if (!tieneOferta(c.n)) continue;
      expect(nivelesDe(c.n).length, `${c.n} con oferta pero sin niveles`).toBeGreaterThan(0);
    }
  });

  it("una carrera inexistente no revienta", () => {
    expect(nivelesDe("Carrera Que No Existe")).toEqual([]);
    expect(tieneOferta("Carrera Que No Existe")).toBe(false);
    expect(institucionesDe("Carrera Que No Existe", "profesional", "all")).toEqual([]);
  });
});

describe("instituciones por carrera", () => {
  it("devuelve instituciones reales del registro, sin repetir", () => {
    for (const c of CAREERS.slice(0, 12)) {
      for (const n of nivelesDe(c.n)) {
        const is = institucionesDe(c.n, n, "all");
        const ids = is.map((i) => i.id);
        expect(new Set(ids).size, `${c.n}/${n} repite instituciones`).toBe(ids.length);
        for (const i of is) {
          expect(INSTITUCIONES[i.id], `${c.n}/${n}: institución fantasma ${i.id}`).toBeDefined();
        }
      }
    }
  });

  it("ordena las públicas primero", () => {
    for (const c of CAREERS.slice(0, 12)) {
      for (const n of nivelesDe(c.n)) {
        const is = institucionesDe(c.n, n, "all");
        const primeraPrivada = is.findIndex((i) => i.sector === "privada");
        if (primeraPrivada === -1) continue;
        const publicaTardia = is.slice(primeraPrivada).some((i) => i.sector === "publica");
        expect(publicaTardia, `${c.n}/${n}: una pública quedó detrás de una privada`).toBe(false);
      }
    }
  });

  it("filtrar por departamento devuelve un subconjunto del país", () => {
    const c = CAREERS.find((x) => tieneOferta(x.n))!;
    const n = nivelesDe(c.n)[0];
    const todas = new Set(institucionesDe(c.n, n, "all").map((i) => i.id));
    for (const d of departamentosDe(c.n).slice(0, 5)) {
      for (const i of institucionesDe(c.n, n, d)) {
        expect(todas, `${c.n}: ${i.nombre} aparece en ${d} pero no en el total`).toContain(i.id);
      }
    }
  });

  it("un departamento inventado devuelve lista vacía", () => {
    const c = CAREERS.find((x) => tieneOferta(x.n))!;
    expect(institucionesDe(c.n, nivelesDe(c.n)[0], "Ruritania")).toEqual([]);
  });

  it("cuantasDe coincide con el largo de institucionesDe", () => {
    for (const c of CAREERS.slice(0, 10)) {
      for (const n of nivelesDe(c.n)) {
        expect(cuantasDe(c.n, n, "all")).toBe(institucionesDe(c.n, n, "all").length);
      }
    }
  });

  it("departamentosDe devuelve solo departamentos conocidos", () => {
    for (const c of CAREERS.slice(0, 15)) {
      for (const d of departamentosDe(c.n)) {
        expect(DEPARTAMENTOS, `${c.n}: departamento desconocido «${d}»`).toContain(d);
      }
    }
  });
});

describe("duración y costo", () => {
  const PLAUSIBLE: Record<CareerLevel, [number, number]> = {
    profesional: [6, 14],
    tecnologica: [3, 9],
    tecnica: [1, 7],
  };

  it("ninguna duración es absurda: el bug de los «27 semestres»", () => {
    /* El SNIES da la duración en unidades de PERIODICIDAD, no en semestres.
       Sin convertir, una tecnológica salía con 27 semestres. */
    for (const c of CAREERS) {
      for (const n of nivelesDe(c.n)) {
        const d = duracionDe(c.n, n);
        if (d == null) continue;
        const [min, max] = PLAUSIBLE[n];
        expect(d, `${c.n}/${n}: ${d} semestres`).toBeGreaterThanOrEqual(min);
        expect(d, `${c.n}/${n}: ${d} semestres`).toBeLessThanOrEqual(max);
        expect(Number.isFinite(d)).toBe(true);
      }
    }
  });

  it("una profesional dura más que su propia tecnológica", () => {
    for (const c of CAREERS) {
      const niveles = nivelesDe(c.n);
      if (!niveles.includes("profesional") || !niveles.includes("tecnologica")) continue;
      const p = duracionDe(c.n, "profesional");
      const t = duracionDe(c.n, "tecnologica");
      if (p == null || t == null) continue;
      expect(p, `${c.n}: profesional (${p}) no dura más que tecnológica (${t})`).toBeGreaterThan(t);
    }
  });

  it("los costos son positivos y de un orden razonable", () => {
    for (const c of CAREERS) {
      for (const n of nivelesDe(c.n)) {
        const v = costoDe(c.n, n);
        if (v == null || v === 0) continue;
        expect(v, `${c.n}/${n}: matrícula de ${v}`).toBeGreaterThan(100_000);
        expect(v, `${c.n}/${n}: matrícula de ${v}`).toBeLessThan(60_000_000);
      }
    }
  });
});

describe("pesos", () => {
  it("formatea en pesos colombianos con separador de miles", () => {
    const s = pesos(3_200_000);
    expect(s).toMatch(/3[.,\s]?200[.,\s]?000/);
  });

  it("no muestra decimales", () => {
    expect(pesos(1_500_000)).not.toMatch(/[,.]\d{2}$/);
  });
});
