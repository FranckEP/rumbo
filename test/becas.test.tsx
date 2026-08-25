import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Becas from "@/components/Becas";
import { BECAS } from "@/lib/becas";
import { BECAS_UNI } from "@/lib/becasUni";

function monta(deptFilter = "all") {
  const onDepto = vi.fn();
  render(<Becas deptFilter={deptFilter} onDepto={onDepto} />);
  return { onDepto };
}

/** Devuelve la sección cuyo encabezado coincide. */
function grupo(titulo: string | RegExp) {
  const eyebrow = screen.getByText(titulo);
  const sec = eyebrow.closest("section");
  if (!sec) throw new Error(`sin sección para ${titulo}`);
  return sec;
}

describe("Becas: estructura", () => {
  it("agrupa por quién da la ayuda", () => {
    monta();
    expect(screen.getByText("Del Gobierno Nacional")).toBeInTheDocument();
    expect(screen.getByText("De tu ciudad o departamento")).toBeInTheDocument();
    expect(screen.getByText("De la universidad")).toBeInTheDocument();
    expect(screen.getByText("Créditos")).toBeInTheDocument();
  });

  it("cada grupo lleva una nota que explica de qué va", () => {
    const { container } = render(<Becas deptFilter="all" onDepto={vi.fn()} />);
    const notas = container.querySelectorAll(".group-nota");
    expect(notas.length).toBeGreaterThanOrEqual(4);
    notas.forEach((n) => expect(n.textContent!.length).toBeGreaterThan(20));
  });

  it("empieza diciendo cuánto cuesta según dónde estudies", () => {
    monta();
    const tira = screen.getByLabelText(/cuánto cuesta/i);
    expect(within(tira).getByText("Universidad pública")).toBeInTheDocument();
    expect(within(tira).getByText("SENA")).toBeInTheDocument();
    expect(within(tira).getByText("Universidad privada")).toBeInTheDocument();
    expect(within(tira).getAllByText("$0")).toHaveLength(2);
  });

  it("las notas de precio son frases completas: empiezan en mayúscula y cierran", () => {
    const { container } = render(<Becas deptFilter="all" onDepto={vi.fn()} />);
    container.querySelectorAll(".cuanto-nota").forEach((n) => {
      const t = n.textContent!.trim();
      expect(t[0], `«${t}» empieza en minúscula`).toBe(t[0].toUpperCase());
      expect(t.endsWith("."), `«${t}» sin punto final`).toBe(true);
    });
  });

  it("cada beca responde las mismas tres preguntas, en el mismo orden", () => {
    const { container } = render(<Becas deptFilter="all" onDepto={vi.fn()} />);
    const fichas = container.querySelectorAll(".beca");
    expect(fichas.length).toBeGreaterThan(0);
    fichas.forEach((f) => {
      const dts = [...f.querySelectorAll("dt")].map((d) => d.textContent);
      expect(dts.slice(0, 2)).toEqual(["Para quién", "Qué necesitas"]);
      if (dts.length > 2) expect(dts[2]).toBe("Cuándo");
    });
  });

  it("cada pregunta y su respuesta van juntas, para que las columnas no las desordenen", () => {
    const { container } = render(<Becas deptFilter="all" onDepto={vi.fn()} />);
    container.querySelectorAll(".beca-par").forEach((p) => {
      expect(p.querySelector("dt")).toBeTruthy();
      expect(p.querySelector("dd")).toBeTruthy();
    });
  });

  it("un grupo con una sola beca ocupa el ancho entero", () => {
    const { container } = render(<Becas deptFilter="all" onDepto={vi.fn()} />);
    container.querySelectorAll(".becas-grid").forEach((g) => {
      const n = g.querySelectorAll(".beca").length;
      expect(g.classList.contains("una"), `grid con ${n} fichas`).toBe(n === 1);
    });
  });

  it("todos los enlaces de beca abren fuera y sin filtrar el referente", () => {
    const { container } = render(<Becas deptFilter="all" onDepto={vi.fn()} />);
    container.querySelectorAll(".beca a").forEach((a) => {
      expect(a).toHaveAttribute("target", "_blank");
      expect(a.getAttribute("rel")).toContain("noopener");
    });
  });

  it("no queda rastro de Colfuturo", () => {
    const { container } = render(<Becas deptFilter="all" onDepto={vi.fn()} />);
    expect(container.textContent).not.toMatch(/colfuturo/i);
  });
});

describe("Becas: filtro por departamento", () => {
  it("tiene su propio filtro, sin mandarte a Carreras", () => {
    monta();
    expect(screen.getByRole("button", { name: /filtrar las becas/i })).toBeInTheDocument();
  });

  it("sin departamento invita a elegir uno aquí mismo", () => {
    monta();
    expect(screen.getByText(/elige un departamento arriba/i)).toBeInTheDocument();
  });

  it("avisa al padre del departamento elegido", async () => {
    const u = userEvent.setup();
    const { onDepto } = monta();
    await u.click(screen.getByRole("button", { name: /filtrar las becas/i }));
    await u.click(screen.getByRole("option", { name: "Atlántico" }));
    expect(onDepto).toHaveBeenCalledWith("Atlántico");
  });

  it("con Atlántico deja solo las del Atlántico", () => {
    monta("Atlántico");
    const g = grupo("En Atlántico");
    const titulos = within(g).getAllByRole("heading", { level: 4 }).map((h) => h.textContent);
    expect(titulos).toContain("Distrito de Barranquilla");
    expect(titulos).toContain("Gobernación del Atlántico");
    expect(titulos.join(" ")).not.toMatch(/Sapiencia/);
  });

  it("con Bogotá aparece ATENEA: el fallo de la coma", () => {
    /* `becas.ts` decía «Bogotá D.C.» y el SNIES «Bogotá, D.C.», así que no
       coincidían nunca y esta beca no salía jamás. */
    monta("Bogotá, D.C.");
    const titulos = within(grupo("En Bogotá, D.C."))
      .getAllByRole("heading", { level: 4 })
      .map((h) => h.textContent);
    expect(titulos.join(" ")).toMatch(/ATENEA/);
  });

  it("en un departamento sin programas lo dice, en vez de dejar el hueco vacío", () => {
    monta("Cauca");
    const g = grupo("En Cauca");
    expect(within(g).getByText(/no tenemos programas registrados/i)).toBeInTheDocument();
    expect(within(g).getByText(/pregunta igual en la alcaldía/i)).toBeInTheDocument();
  });

  it("las nacionales y el crédito salen con cualquier departamento", () => {
    for (const d of ["all", "Atlántico", "Cauca", "Vaupés"]) {
      const { unmount } = render(<Becas deptFilter={d} onDepto={vi.fn()} />);
      expect(screen.getByText("Matrícula Cero"), d).toBeInTheDocument();
      expect(screen.getByText("ICETEX"), d).toBeInTheDocument();
      unmount();
    }
  });
});

describe("Becas: universidades", () => {
  it("lista instituciones con buscador, sin depender de lo que hayas visitado", () => {
    monta();
    const g = grupo("De la universidad");
    expect(within(g).getByRole("searchbox")).toBeInTheDocument();
  });

  it("filtra las instituciones por el departamento activo", () => {
    monta("Atlántico");
    const g = grupo("De la universidad");
    expect(g.textContent).toMatch(/en Atlántico/);
  });

  it("el buscador encuentra por nombre de institución", async () => {
    const u = userEvent.setup();
    monta();
    const g = grupo("De la universidad");
    await u.type(within(g).getByRole("searchbox"), "Norte");
    const nombres = within(g).getAllByRole("button", { expanded: false }).map((b) => b.textContent);
    expect(nombres.join(" ")).toMatch(/Norte/);
  });

  it("cuando no encuentra nada lo dice", async () => {
    const u = userEvent.setup();
    monta();
    const g = grupo("De la universidad");
    await u.type(within(g).getByRole("searchbox"), "zzzzzzz");
    expect(within(g).getByText(/ninguna institución/i)).toBeInTheDocument();
  });

  it("cada institución muestra cuántas becas tiene", async () => {
    const u = userEvent.setup();
    monta();
    const g = grupo("De la universidad");
    await u.type(within(g).getByRole("searchbox"), "Norte");
    expect(within(g).getByText(/\d+ becas?/)).toBeInTheDocument();
  });

  it("al desplegar una institución muestra sus becas y el enlace oficial", async () => {
    const u = userEvent.setup();
    monta();
    const g = grupo("De la universidad");
    await u.type(within(g).getByRole("searchbox"), "Norte");
    const cabecera = within(g).getAllByRole("button", { name: /Norte/ })[0];
    expect(cabecera).toHaveAttribute("aria-expanded", "false");
    await u.click(cabecera);
    expect(cabecera).toHaveAttribute("aria-expanded", "true");
    expect(within(g).getByText(/Ver requisitos en/)).toBeInTheDocument();
  });
});

describe("Becas: datos que llegan a pantalla", () => {
  it("muestra todas las becas nacionales y de crédito que hay en los datos", () => {
    monta();
    const titulos = screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent);
    for (const b of BECAS.filter((x) => x.grupo !== "region")) {
      expect(titulos, `falta ${b.n}`).toContain(b.n);
    }
  });

  it("el catálogo de instituciones no está vacío", () => {
    expect(Object.keys(BECAS_UNI).length).toBeGreaterThan(50);
  });
});
