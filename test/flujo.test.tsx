import { beforeEach, describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Page from "@/app/page";
import { TOTAL } from "@/lib/riasec";

/* `delay: null` quita la espera entre eventos: si no, responder las 48
   preguntas se come el limite de tiempo del test. */

function opciones() {
  return screen.queryAllByRole("button").filter((b) => b.className.includes("opt"));
}

/** Espera a que la app pase a la pregunta n (el avance va tras 120 ms). */
async function enPregunta(n: number) {
  await screen.findByText(`${n} / ${TOTAL}`);
}

/** Contesta el test entero pulsando siempre la misma posición de la escala. */
async function contesta(u: ReturnType<typeof userEvent.setup>, pos = 2) {
  for (let i = 1; i <= TOTAL; i++) {
    const ops = opciones();
    if (!ops.length) break;
    await u.click(ops[Math.min(pos, ops.length - 1)]);
    if (i < TOTAL) await enPregunta(i + 1);
  }
}

async function empieza(u: ReturnType<typeof userEvent.setup>) {
  render(<Page />);
  await u.click(screen.getAllByRole("button", { name: /empezar el test/i })[0]);
  await enPregunta(1);
}

beforeEach(() => localStorage.clear());

describe("portada", () => {
  it("abre en la portada con el botón de empezar", () => {
    render(<Page />);
    expect(screen.getAllByRole("button", { name: /empezar el test/i }).length).toBeGreaterThan(0);
  });

  it("sin progreso guardado no ofrece continuar", () => {
    render(<Page />);
    expect(screen.queryByRole("button", { name: /continuar/i })).not.toBeInTheDocument();
  });

  it("dice quién la hizo", () => {
    /* Sin fijar la forma exacta del nombre: es de Franck y puede escribirlo
       como quiera. Lo que importa es que la autoria este a la vista. */
    render(<Page />);
    const pie = document.querySelector("footer");
    expect(pie?.textContent).toMatch(/Franck/);
    expect(pie?.textContent).toMatch(/Peñaloza/);
    expect(pie?.textContent).toMatch(/Holland/);
  });
});

describe("el test", () => {
  it("empieza en la pregunta 1 de 48", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    expect(screen.getByText(`1 / ${TOTAL}`)).toBeInTheDocument();
  });

  it("ofrece cuatro opciones de respuesta", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    expect(opciones()).toHaveLength(4);
  });

  it("avanza al responder", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    await u.click(opciones()[1]);
    await enPregunta(2);
  });

  it("responder muy rápido no rompe la pantalla", async () => {
    /* Un bug real: al responder deprisa el índice se pasaba de la última
       pregunta y quedaba la pantalla en blanco. */
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    /* A propósito SIN esperar entre clics: es lo que hacía que el índice se
       pasara del total y la pantalla quedara en blanco. */
    for (let i = 0; i < TOTAL + 8; i++) {
      const ops = opciones();
      if (!ops.length) break;
      await u.click(ops[2]);
    }
    await waitFor(() => expect(document.body.textContent!.trim().length).toBeGreaterThan(80));
    expect(document.body.textContent).not.toMatch(/undefined|NaN/);
  });

  it("«Anterior» vuelve una pregunta", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    await u.click(opciones()[1]);
    await enPregunta(2);
    await u.click(screen.getByRole("button", { name: /anterior/i }));
    await enPregunta(1);
  });

  it("«Salir y guardar» deja el progreso para retomarlo", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    await u.click(opciones()[1]);
    await enPregunta(2);
    await u.click(screen.getByRole("button", { name: /salir y guardar/i }));
    expect(screen.getByRole("button", { name: /continuar donde quedé/i })).toBeInTheDocument();
  });
});

describe("resultados", () => {
  it("al terminar muestra las tres pestañas", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    await contesta(u);
    const tabs = await screen.findAllByRole("tab");
    const nombres = tabs.map((t) => t.textContent);
    expect(nombres.some((n) => /Mi perfil/.test(n!))).toBe(true);
    expect(nombres.some((n) => /Carreras/.test(n!))).toBe(true);
    expect(nombres.some((n) => /Becas/.test(n!))).toBe(true);
  });

  it("la pestaña de Becas ya no lleva contador", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    await contesta(u);
    const becas = (await screen.findAllByRole("tab")).find((t) => /Becas/.test(t.textContent!))!;
    expect(becas.textContent!.trim()).toBe("Becas");
  });

  it("solo una pestaña está seleccionada a la vez", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    await contesta(u);
    const tabs = await screen.findAllByRole("tab");
    const activas = tabs.filter((t) => t.getAttribute("aria-selected") === "true");
    expect(activas).toHaveLength(1);
  });

  it("se puede cambiar de pestaña", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    await contesta(u);
    const becas = (await screen.findAllByRole("tab")).find((t) => /Becas/.test(t.textContent!))!;
    await u.click(becas);
    expect(becas).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Del Gobierno Nacional")).toBeInTheDocument();
  });

  it("el filtro de Carreras y el de Becas comparten departamento", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    await contesta(u);

    const tabs = await screen.findAllByRole("tab");
    await u.click(tabs.find((t) => /Carreras/.test(t.textContent!))!);
    await u.click(screen.getByRole("button", { name: /departamento/i }));
    await u.click(screen.getByRole("option", { name: "Atlántico" }));

    await u.click((await screen.findAllByRole("tab")).find((t) => /Becas/.test(t.textContent!))!);
    expect(screen.getByText("En Atlántico")).toBeInTheDocument();
  });

  it("terminar el test borra el progreso guardado", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    await contesta(u);
    await screen.findAllByRole("tab");
    expect(localStorage.getItem("brujula-vocacional-v1")).toBeNull();
  });

  it("«Repetir el test» vuelve a la pregunta 1 con todo en blanco", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    await contesta(u);
    await screen.findAllByRole("tab");

    await u.click(screen.getByRole("button", { name: /repetir el test/i }));
    /* Va directo al test, no a la portada: el boton dice «repetir», no
       «volver al inicio». */
    await enPregunta(1);
    expect(opciones()).toHaveLength(4);
    /* Y en blanco: ninguna opcion viene ya marcada. */
    expect(opciones().some((o) => o.className.includes("selected"))).toBe(false);
    expect(localStorage.getItem("brujula-vocacional-v1")).toBeNull();
  });

  it("un perfil plano avisa en vez de fingir un ganador", async () => {
    const u = userEvent.setup({ delay: null });
    await empieza(u);
    await contesta(u, 2); // la misma respuesta en todo
    const tabs = await screen.findAllByRole("tab");
    await u.click(tabs.find((t) => /Carreras/.test(t.textContent!))!);
    const aviso = screen.queryByText(/muy parejo/i) ?? screen.queryByText(/prácticamente empatadas/i);
    expect(aviso, "sin aviso de empate con un perfil totalmente plano").not.toBeNull();
  });
});

describe("carreras", () => {
  async function aCarreras(u: ReturnType<typeof userEvent.setup>) {
    await empieza(u);
    await contesta(u, 3);
    const tabs = await screen.findAllByRole("tab");
    await u.click(tabs.find((t) => /Carreras/.test(t.textContent!))!);
  }

  it("lista carreras y las cuenta", async () => {
    const u = userEvent.setup({ delay: null });
    await aCarreras(u);
    const { container } = { container: document.body };
    const conteo = container.querySelector(".result-count");
    expect(conteo?.textContent).toMatch(/\d+ carreras?/);
  });

  it("el buscador filtra", async () => {
    const u = userEvent.setup({ delay: null });
    await aCarreras(u);
    await u.type(screen.getByRole("searchbox", { name: /buscar carrera/i }), "medicina");
    expect(document.querySelector(".result-count")?.textContent).toMatch(/1 carrera para/i);
  });

  it("una búsqueda sin resultados lo dice", async () => {
    const u = userEvent.setup({ delay: null });
    await aCarreras(u);
    await u.type(screen.getByRole("searchbox", { name: /buscar carrera/i }), "zzzzzz");
    expect(document.querySelector(".result-count")?.textContent).toMatch(/0 carreras/);
    expect(screen.getByText(/no encontramos|ninguna carrera|sin resultados/i)).toBeInTheDocument();
  });

  it("filtrar por nivel técnico excluye las profesiones reguladas", async () => {
    /* Medicina, Derecho y Psicología solo existen como pregrado
       universitario: no pueden aparecer bajo «Técnica». */
    const u = userEvent.setup({ delay: null });
    await aCarreras(u);
    await u.click(screen.getByRole("button", { name: /nivel de formación/i }));
    await u.click(screen.getByRole("option", { name: /Técnica/ }));
    const texto = document.body.textContent!;
    for (const n of ["Medicina", "Derecho", "Psicología", "Odontología"]) {
      expect(texto, `${n} aparece filtrando por técnica`).not.toContain(`${n}\n`);
    }
  });

  it("«Quitar filtros» los limpia", async () => {
    const u = userEvent.setup({ delay: null });
    await aCarreras(u);
    await u.click(screen.getByRole("button", { name: /departamento/i }));
    await u.click(screen.getByRole("option", { name: "Atlántico" }));
    expect(screen.getByText(/universidades en Atlántico/)).toBeInTheDocument();
    await u.click(screen.getByRole("button", { name: /quitar filtros/i }));
    expect(screen.queryByText(/universidades en Atlántico/)).not.toBeInTheDocument();
  });

  it("ordenar por A–Z reordena de verdad", async () => {
    const u = userEvent.setup({ delay: null });
    await aCarreras(u);
    const nombres = () =>
      [...document.querySelectorAll(".career-list h3, .career-name, .career-card h3")]
        .map((h) => h.textContent);
    const antes = nombres();
    expect(antes.length, "no se listó ninguna carrera").toBeGreaterThan(3);
    await u.click(screen.getByRole("button", { name: "A–Z" }));
    const despues = nombres();
    expect(despues).not.toEqual(antes);
    expect(despues).toEqual([...despues].sort((a, b) => a!.localeCompare(b!, "es")));
  });
});
