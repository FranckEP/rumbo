import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const CSS = readFileSync("app/globals.css", "utf8");
const FUENTES = [
  "components/Intro.tsx",
  "components/Results.tsx",
  "components/CareerCard.tsx",
  "components/SummaryBar.tsx",
  "components/SiteHeader.tsx",
  "components/TestScreen.tsx",
  "components/UniversityView.tsx",
  "components/Becas.tsx",
  "components/UniBecas.tsx",
  "components/PrintReport.tsx",
  "app/page.tsx",
].map((f) => [f, readFileSync(f, "utf8")] as const);

describe("puntos medios", () => {
  it("no queda ninguno suelto en la interfaz", () => {
    /* Franck los encontraba feos, y en «Carreras· 32» además quedaba pegado a
       la palabra y separado del número, con pinta de errata. */
    for (const [ruta, src] of FUENTES) {
      const lineas = src
        .split("\n")
        .map((l, i) => [i + 1, l] as const)
        .filter(([, l]) => l.includes("\u00b7"));
      expect(
        lineas.map(([n, l]) => `${ruta}:${n} ${l.trim()}`),
        `${ruta} todavía usa «·»`
      ).toEqual([]);
    }
  });
});

describe("reglas de maquetación que ya se rompieron una vez", () => {
  /* Un selector puede aparecer varias veces (la regla base y la de movil).
     Se juntan todas para no depender de cual sale primero en el archivo. */
  function bloque(sel: string): string {
    const trozos: string[] = [];
    let i = CSS.indexOf(`${sel} {`);
    while (i >= 0) {
      trozos.push(CSS.slice(i, CSS.indexOf("}", i)));
      i = CSS.indexOf(`${sel} {`, i + 1);
    }
    if (!trozos.length) throw new Error(`sin regla para ${sel}`);
    return trozos.join("\n");
  }

  it("las tarjetas de dimensión no dejan que el botón centre su contenido", () => {
    const b = bloque(".dim-chip");
    expect(b).toMatch(/display:\s*flex/);
    expect(b).toMatch(/flex-direction:\s*column/);
    expect(b).toMatch(/justify-content:\s*flex-start/);
  });

  it("los pasos de «Cómo funciona» ponen el número encima del texto", () => {
    const b = bloque(".paso");
    expect(b).toMatch(/flex-direction:\s*column/);
    /* Y conservan su tarjeta: fondo, borde y relleno. */
    expect(b).toMatch(/background:/);
    expect(b).toMatch(/border:/);
    expect(b).toMatch(/padding:/);
  });

  it("las píldoras de filtro y el selector de orden comparten altura", () => {
    expect(bloque(".filter-row")).toMatch(/--ctl-h:/);
    expect(bloque(".filter-pill")).toMatch(/height:\s*var\(--ctl-h/);
    expect(bloque(".sort-toggle")).toMatch(/height:\s*var\(--ctl-h/);
  });

  it("el contenido de la píldora se estira para que la flecha vaya al borde", () => {
    expect(bloque(".filter-pill-txt")).toMatch(/flex:\s*1/);
  });

  it("la hoja de móvil se ancla al viewport visible, no al de diseño", () => {
    expect(CSS).toMatch(/bottom:\s*var\(--dd-teclado/);
    expect(CSS).toMatch(/--dd-visible/);
  });

  it("un grupo de una sola beca ocupa el ancho entero", () => {
    expect(CSS).toMatch(/\.becas-grid\.una\s*\{[^}]*grid-template-columns:\s*1fr/);
  });
});
