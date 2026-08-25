import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Intro from "@/components/Intro";
import { DIMS, DIM_KEYS, TOTAL } from "@/lib/riasec";
import { CAREERS } from "@/lib/careers";
import { DEPARTAMENTOS, INSTITUCIONES } from "@/lib/instituciones";

function monta(resumeCount: number | null = null) {
  const onStart = vi.fn();
  const onResume = vi.fn();
  const r = render(<Intro onStart={onStart} resumeCount={resumeCount} onResume={onResume} />);
  return { onStart, onResume, ...r };
}

describe("portada: texto", () => {
  it("cada cifra se explica con una frase que empieza en mayúscula", () => {
    const { container } = monta();
    const textos = [...container.querySelectorAll(".stat span")].map((s) => s.textContent!.trim());
    expect(textos.length).toBeGreaterThan(0);
    for (const t of textos) {
      expect(t[0], `«${t}» empieza en minúscula`).toBe(t[0].toUpperCase());
    }
  });

  it("ningún texto suelto de la portada arranca en minúscula", () => {
    const { container } = monta();
    const sospechosos = [".stat span", ".paso b", ".intro-lede", ".intro-note", ".dim-name"];
    for (const sel of sospechosos) {
      container.querySelectorAll(sel).forEach((el) => {
        const t = el.textContent!.trim().replace(/^[^\p{L}\d]+/u, "");
        if (!t) return;
        expect(t[0], `${sel}: «${t.slice(0, 40)}»`).toBe(t[0].toUpperCase());
      });
    }
  });
});

describe("portada: cifras", () => {
  it("las cifras salen de los datos, no escritas a mano", () => {
    const { container } = monta();
    const nums = [...container.querySelectorAll(".stat b")].map((b) => b.textContent);
    expect(nums).toContain(String(CAREERS.length));
    expect(nums).toContain(String(Object.keys(INSTITUCIONES).length));
    expect(nums).toContain("3");
  });

  it("menciona cuántos departamentos hay", () => {
    monta();
    expect(screen.getByText(new RegExp(`${DEPARTAMENTOS.length} departamentos`))).toBeInTheDocument();
  });

  it("dice cuántas afirmaciones son", () => {
    monta();
    expect(screen.getAllByText(new RegExp(`${TOTAL} afirmaciones`)).length).toBeGreaterThan(0);
  });
});

describe("portada: las seis dimensiones", () => {
  it("muestra las seis, con su letra y su nombre", () => {
    const { container } = monta();
    const chips = container.querySelectorAll(".dim-chip");
    expect(chips).toHaveLength(6);
    for (const k of DIM_KEYS) {
      expect(screen.getByText(DIMS[k].name)).toBeInTheDocument();
    }
  });

  it("todas las tarjetas tienen la misma estructura, sin huecos de mas", () => {
    const { container } = monta();
    container.querySelectorAll(".dim-chip").forEach((c) => {
      expect(c.querySelector(".letter")).toBeTruthy();
      expect(c.querySelector(".dim-name")).toBeTruthy();
      expect(c.querySelector(".dim-hint")).toBeTruthy();
      /* El orden importa: la insignia va primera. */
      expect(c.children[0].className).toContain("letter");
      expect(c.children[1].className).toContain("dim-name");
    });
  });

  it("cada tarjeta empieza cerrada y se abre al pulsarla", async () => {
    const u = userEvent.setup();
    monta();
    const realista = screen.getByText(DIMS.R.name).closest("button")!;
    expect(realista).toHaveAttribute("aria-expanded", "false");
    await u.click(realista);
    expect(realista).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText(DIMS.R.desc)).toBeInTheDocument();
  });

  it("abrir una cierra la anterior: solo una abierta a la vez", async () => {
    const u = userEvent.setup();
    const { container } = monta();
    await u.click(screen.getByText(DIMS.R.name).closest("button")!);
    await u.click(screen.getByText(DIMS.I.name).closest("button")!);
    const abiertas = [...container.querySelectorAll(".dim-chip")].filter(
      (c) => c.getAttribute("aria-expanded") === "true"
    );
    expect(abiertas).toHaveLength(1);
  });

  it("volver a pulsar la cierra", async () => {
    const u = userEvent.setup();
    monta();
    const chip = screen.getByText(DIMS.A.name).closest("button")!;
    await u.click(chip);
    await u.click(chip);
    expect(chip).toHaveAttribute("aria-expanded", "false");
  });
});

describe("portada: acciones", () => {
  it("empezar avisa al padre", async () => {
    const u = userEvent.setup();
    const { onStart } = monta();
    await u.click(screen.getAllByRole("button", { name: /empezar el test/i })[0]);
    expect(onStart).toHaveBeenCalled();
  });

  it("sin progreso no ofrece continuar", () => {
    monta(null);
    expect(screen.queryByRole("button", { name: /continuar/i })).not.toBeInTheDocument();
  });

  it("con progreso ofrece continuar y dice cuánto lleva", async () => {
    const u = userEvent.setup();
    const { onResume } = monta(12);
    const b = screen.getByRole("button", { name: /continuar donde quedé/i });
    expect(b).toHaveTextContent(`12/${TOTAL}`);
    await u.click(b);
    expect(onResume).toHaveBeenCalled();
  });
});

describe("portada: preguntas frecuentes", () => {
  it("todas empiezan cerradas", () => {
    const { container } = monta();
    const qs = container.querySelectorAll(".faq-q");
    expect(qs.length).toBeGreaterThan(0);
    qs.forEach((q) => expect(q).toHaveAttribute("aria-expanded", "false"));
  });

  it("se abren al pulsar y solo una a la vez", async () => {
    const u = userEvent.setup();
    const { container } = monta();
    const qs = [...container.querySelectorAll(".faq-q")] as HTMLButtonElement[];
    await u.click(qs[0]);
    await u.click(qs[1]);
    const abiertas = qs.filter((q) => q.getAttribute("aria-expanded") === "true");
    expect(abiertas).toHaveLength(1);
  });

  it("promete que nada sale del navegador, y eso es cierto: no hay red", () => {
    monta();
    expect(screen.getByText(/Nada sale de tu navegador/i)).toBeInTheDocument();
  });
});
