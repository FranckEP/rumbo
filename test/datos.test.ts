import { describe, expect, it } from "vitest";
import { BECAS, GRUPO_TITULOS } from "@/lib/becas";
import { BECAS_UNI, comprobadaEl } from "@/lib/becasUni";
import { CAREERS, LEVEL_LABELS, type CareerLevel } from "@/lib/careers";
import { DEPARTAMENTOS, INSTITUCIONES, institucion } from "@/lib/instituciones";
import { DIM_KEYS } from "@/lib/riasec";

const NIVELES: CareerLevel[] = ["profesional", "tecnologica", "tecnica"];

describe("carreras", () => {
  it("no repite nombres", () => {
    const n = CAREERS.map((c) => c.n);
    expect(new Set(n).size).toBe(n.length);
  });

  it("cada carrera tiene un vector RIASEC válido y no vacío", () => {
    for (const c of CAREERS) {
      const claves = Object.keys(c.v);
      expect(claves.length, `${c.n} sin dimensiones`).toBeGreaterThan(0);
      for (const k of claves) {
        expect(DIM_KEYS, `${c.n} usa la dimensión desconocida ${k}`).toContain(k);
        const v = c.v[k as (typeof DIM_KEYS)[number]]!;
        expect(v, `${c.n}.${k} fuera de 0..1`).toBeGreaterThan(0);
        expect(v, `${c.n}.${k} fuera de 0..1`).toBeLessThanOrEqual(1);
      }
    }
  });

  it("ningún vector es plano: no se podría correlacionar", () => {
    for (const c of CAREERS) {
      const vals = DIM_KEYS.map((k) => c.v[k] ?? 0);
      expect(new Set(vals).size, `${c.n} tiene todas las dimensiones iguales`).toBeGreaterThan(1);
    }
  });

  it("cada carrera declara al menos un nivel, y todos son válidos", () => {
    for (const c of CAREERS) {
      expect(c.lvl.length, `${c.n} sin nivel`).toBeGreaterThan(0);
      for (const l of c.lvl) expect(NIVELES, `${c.n}: nivel ${l}`).toContain(l);
      expect(new Set(c.lvl).size, `${c.n} repite niveles`).toBe(c.lvl.length);
    }
  });

  it("las profesiones reguladas solo existen como profesional", () => {
    const reguladas = ["Medicina", "Derecho", "Psicología", "Odontología", "Veterinaria"];
    for (const n of reguladas) {
      const c = CAREERS.find((x) => x.n === n);
      if (!c) continue;
      expect(c.lvl, `${n} no debería ofrecerse fuera de profesional`).toEqual(["profesional"]);
    }
  });

  it("tiene descripción y campos de trabajo", () => {
    for (const c of CAREERS) {
      expect(c.d.length, `${c.n} sin descripción`).toBeGreaterThan(20);
      expect(c.f.length, `${c.n} sin campos`).toBeGreaterThan(0);
    }
  });

  it("cada nivel tiene etiqueta", () => {
    for (const l of NIVELES) expect(LEVEL_LABELS[l]).toBeTruthy();
  });
});

describe("becas nacionales y regionales", () => {
  it("no repite nombres", () => {
    const n = BECAS.map((b) => b.n);
    expect(new Set(n).size).toBe(n.length);
  });

  it("todos los campos obligatorios están completos", () => {
    for (const b of BECAS) {
      expect(b.n, "beca sin nombre").toBeTruthy();
      expect(b.cobertura, `${b.n} sin cobertura`).toBeTruthy();
      expect(b.tag, `${b.n} sin alcance`).toBeTruthy();
      expect(b.paraQuien.length, `${b.n}: «para quién» muy corto`).toBeGreaterThan(30);
      expect(b.queNecesitas.length, `${b.n}: «qué necesitas» muy corto`).toBeGreaterThan(30);
      expect(b.linkText, `${b.n} sin texto de enlace`).toBeTruthy();
    }
  });

  it("todas las urls son https y bien formadas", () => {
    for (const b of BECAS) {
      expect(() => new URL(b.url), `${b.n}: url inválida`).not.toThrow();
      expect(b.url.startsWith("https://"), `${b.n}: url no es https`).toBe(true);
    }
  });

  it("la cobertura cabe en un distintivo", () => {
    /* Una cobertura larga rompía el ancho de la página en móvil:
       «Crédito; algunas líneas condonan parte» medía 432 px en 375. */
    for (const b of BECAS) {
      expect(b.cobertura.length, `${b.n}: cobertura demasiado larga para el distintivo`)
        .toBeLessThanOrEqual(24);
    }
  });

  it("los departamentos existen tal cual en el SNIES", () => {
    /* Este es el test que habría atrapado el fallo de Bogotá: becas.ts decía
       «Bogotá D.C.» sin coma y el SNIES escribe «Bogotá, D.C.», así que la
       beca de ATENEA no aparecía nunca. */
    for (const b of BECAS) {
      for (const d of b.depts ?? []) {
        expect(DEPARTAMENTOS, `${b.n}: el departamento «${d}» no existe en el SNIES`).toContain(d);
      }
    }
  });

  it("cada grupo usado tiene título", () => {
    for (const b of BECAS) {
      expect(GRUPO_TITULOS[b.grupo], `grupo ${b.grupo} sin título`).toBeTruthy();
    }
  });

  it("hay al menos una beca nacional y un crédito", () => {
    expect(BECAS.some((b) => b.grupo === "nacional")).toBe(true);
    expect(BECAS.some((b) => b.grupo === "credito")).toBe(true);
  });

  it("las regionales declaran departamento y las nacionales no", () => {
    for (const b of BECAS) {
      if (b.grupo === "region") {
        expect(b.depts?.length, `${b.n}: regional sin departamento`).toBeGreaterThan(0);
      } else {
        expect(b.depts, `${b.n}: no regional pero con departamento`).toBeUndefined();
      }
    }
  });
});

describe("becas por universidad", () => {
  const claves = Object.values(INSTITUCIONES)
    .map((i) => i.clave)
    .filter(Boolean) as string[];

  it("cada clave corresponde a una institución real", () => {
    for (const k of Object.keys(BECAS_UNI)) {
      expect(claves, `la clave «${k}» no corresponde a ninguna institución`).toContain(k);
    }
  });

  it("ninguna institución tiene la lista de becas vacía", () => {
    for (const [k, b] of Object.entries(BECAS_UNI)) {
      expect(b.p.length, `${k} sin becas`).toBeGreaterThan(0);
      expect(b.c.length, `${k} sin descripción de cobertura`).toBeGreaterThan(40);
    }
  });

  it("no repite el nombre de una beca dentro de la misma institución", () => {
    for (const [k, b] of Object.entries(BECAS_UNI)) {
      expect(new Set(b.p).size, `${k} repite alguna beca`).toBe(b.p.length);
    }
  });

  it("las fechas de comprobación son válidas y no están en el futuro", () => {
    const hoy = new Date();
    for (const [k, b] of Object.entries(BECAS_UNI)) {
      if (!b.f) continue;
      expect(b.f, `${k}: fecha con formato raro`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const d = new Date(b.f);
      expect(Number.isNaN(d.getTime()), `${k}: fecha inválida`).toBe(false);
      expect(d.getTime(), `${k}: fecha en el futuro`).toBeLessThanOrEqual(hoy.getTime() + 864e5);
      expect(comprobadaEl(b.f), `${k}: no se pudo formatear`).toBeTruthy();
    }
  });

  it("comprobadaEl devuelve undefined si no hay fecha", () => {
    expect(comprobadaEl(undefined)).toBeUndefined();
  });

  it("las instituciones del Atlántico que revisamos tienen fecha", () => {
    const revisadas = ["uninorte", "cuc", "iub", "unisimon", "uac", "americana", "reformada"];
    for (const k of revisadas) {
      expect(BECAS_UNI[k], `falta ${k}`).toBeDefined();
      expect(BECAS_UNI[k].f, `${k} sin fecha de comprobación`).toBeTruthy();
    }
  });
});

describe("instituciones", () => {
  it("los ids son consistentes con la clave del registro", () => {
    for (const [id, i] of Object.entries(INSTITUCIONES)) {
      expect(i.id, `${id}: id descuadrado`).toBe(id);
    }
  });

  it("todas tienen nombre y al menos un departamento", () => {
    for (const i of Object.values(INSTITUCIONES)) {
      expect(i.nombre?.trim(), `${i.id} sin nombre`).toBeTruthy();
      expect(i.deps.length, `${i.nombre} sin departamentos`).toBeGreaterThan(0);
    }
  });

  it("las urls que hay son https y bien formadas", () => {
    for (const i of Object.values(INSTITUCIONES)) {
      if (!i.url) continue;
      expect(() => new URL(i.url), `${i.nombre}: url inválida`).not.toThrow();
      expect(i.url.startsWith("https://"), `${i.nombre}: url no es https`).toBe(true);
    }
  });

  it("el sector es público o privado", () => {
    for (const i of Object.values(INSTITUCIONES)) {
      expect(["publica", "privada"], `${i.nombre}: sector ${i.sector}`).toContain(i.sector);
    }
  });

  it("las claves cortas no se repiten", () => {
    const cl = Object.values(INSTITUCIONES).map((i) => i.clave).filter(Boolean);
    expect(new Set(cl).size).toBe(cl.length);
  });

  it("DEPARTAMENTOS no tiene repetidos, está ordenado y no incluye el comodín", () => {
    expect(new Set(DEPARTAMENTOS).size).toBe(DEPARTAMENTOS.length);
    expect(DEPARTAMENTOS).not.toContain("*");
    const ordenado = [...DEPARTAMENTOS].sort((a, b) => a.localeCompare(b, "es"));
    expect(DEPARTAMENTOS).toEqual(ordenado);
  });

  it("institucion() encuentra por id y no revienta con uno inexistente", () => {
    const alguno = Object.keys(INSTITUCIONES)[0];
    expect(institucion(alguno)?.id).toBe(alguno);
    expect(institucion("no-existe-12345")).toBeUndefined();
  });
});
