import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import Page from "@/app/page";
import Terminos from "@/app/terminos/page";

describe("aviso de derechos", () => {
  it("el pie lleva el símbolo, el año en curso y al autor", () => {
    render(<Page />);
    const legal = document.querySelector(".footer-legal")!;
    expect(legal.textContent).toContain("©");
    expect(legal.textContent).toContain(String(new Date().getFullYear()));
    expect(legal.textContent).toMatch(/Peñaloza/);
    expect(legal.textContent).toMatch(/Todos los derechos reservados/i);
  });

  it("el pie enlaza a los términos", () => {
    render(<Page />);
    const a = document.querySelector(".footer-legal a")!;
    expect(a).toHaveAttribute("href", "/terminos");
    expect(a.textContent).toMatch(/términos/i);
  });
});

describe("página de términos", () => {
  it("tiene título y forma de volver", () => {
    render(<Terminos />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Términos de uso");
    expect(document.querySelector('.back-link[href="/"]')).toBeTruthy();
  });

  it("cubre los puntos que importan", () => {
    render(<Terminos />);
    const t = document.body.textContent!;
    /* Uso libre para colegios: es el punto que evita que una secretaría crea
       que está haciendo algo indebido al recomendarla. */
    expect(t).toMatch(/gratis/i);
    expect(t).toMatch(/colegios|docentes|orientadores/i);
    /* Y lo que no se puede hacer. */
    expect(t).toMatch(/no puedes hacer/i);
    expect(t).toMatch(/derecho de autor/i);
    /* Los datos son de referencia. */
    expect(t).toMatch(/verifica/i);
    expect(t).toMatch(/SNIES/);
    /* La promesa de privacidad, que debe seguir siendo cierta. */
    expect(t).toMatch(/no recogemos ning[úu]n dato personal/i);
    /* Contacto real. */
    expect(document.querySelector('a[href^="mailto:"]')).toBeTruthy();
  });

  it("dice desde cuándo rige", () => {
    render(<Terminos />);
    expect(document.querySelector(".legal-fecha")!.textContent).toMatch(/\d{4}/);
  });

  it("la promesa de privacidad del test y la de los términos no se contradicen", () => {
    /* Si algún día se agrega analítica hay que cambiar LOS DOS textos. Este
       test existe para que no se cambie uno y se olvide el otro. */
    render(<Terminos />);
    const terminos = document.body.textContent!;
    const dicePrivado = /no recogemos ning[úu]n dato personal/i.test(terminos);
    document.body.innerHTML = "";
    render(<Page />);
    const portada = document.body.textContent!;
    const prometePrivado = /Nada sale de tu navegador/i.test(portada);
    expect(dicePrivado, "los términos ya no prometen privacidad total").toBe(prometePrivado);
  });
});

describe("archivos de autoría en el repositorio", () => {
  it("existe LICENSE con el aviso de derechos", () => {
    expect(existsSync("LICENSE")).toBe(true);
    const l = readFileSync("LICENSE", "utf8");
    expect(l).toMatch(/Copyright/i);
    expect(l).toMatch(/Peñaloza/);
    expect(l).toMatch(/Todos los derechos reservados/i);
    /* Debe decir explícitamente qué SÍ se puede hacer: si no, un colegio no
       sabe si puede usarla. */
    expect(l).toMatch(/sin pedir permiso|se permite/i);
  });

  it("existe NOTICE.md con la evidencia de autoría", () => {
    expect(existsSync("NOTICE.md")).toBe(true);
    const n = readFileSync("NOTICE.md", "utf8");
    expect(n).toMatch(/BITACORA/);
    expect(n).toMatch(/DNDA/);
  });
});
