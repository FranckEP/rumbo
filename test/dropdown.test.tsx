import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Dropdown, { type Opcion } from "@/components/Dropdown";

const DEPTOS: Opcion[] = [
  { v: "all", t: "Todo el país" },
  { v: "Atlántico", t: "Atlántico" },
  { v: "Antioquia", t: "Antioquia" },
  { v: "Bogotá, D.C.", t: "Bogotá, D.C." },
  { v: "Bolívar", t: "Bolívar" },
  { v: "Boyacá", t: "Boyacá" },
  { v: "Caldas", t: "Caldas" },
  { v: "Cauca", t: "Cauca" },
  { v: "Cesar", t: "Cesar" },
  { v: "Chocó", t: "Chocó" },
  { v: "Córdoba", t: "Córdoba" },
  { v: "Huila", t: "Huila" },
  { v: "Meta", t: "Meta" },
  { v: "Nariño", t: "Nariño" },
];

const CORTAS: Opcion[] = [
  { v: "all", t: "Todos los niveles" },
  { v: "profesional", t: "Profesional (universitaria)" },
  { v: "tecnologica", t: "Tecnológica" },
  { v: "tecnica", t: "Técnica" },
];

function monta(props: Partial<React.ComponentProps<typeof Dropdown>> = {}) {
  const onCambio = vi.fn();
  render(
    <Dropdown
      icono={<svg />}
      titulo="Universidades en"
      aria="Filtrar por departamento"
      valor="all"
      etiqueta="Todo el país"
      opciones={DEPTOS}
      onCambio={onCambio}
      {...props}
    />
  );
  return { onCambio, boton: screen.getByRole("button", { name: /filtrar por/i }) };
}

describe("Dropdown: abrir y cerrar", () => {
  it("empieza cerrado y lo dice en aria-expanded", () => {
    const { boton } = monta();
    expect(boton).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("abre al pulsar y se queda abierto", async () => {
    const u = userEvent.setup();
    const { boton } = monta();
    await u.click(boton);
    expect(boton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("no se cierra solo al abrirse", async () => {
    /* Se cerraba en el mismo instante en que se abría: al enfocar el buscador
       el navegador desplazaba, y ese scroll disparaba el cierre. */
    const u = userEvent.setup();
    const { boton } = monta();
    await u.click(boton);
    window.dispatchEvent(new Event("scroll"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("cierra con Escape sin cambiar el valor y devuelve el foco al botón", async () => {
    const u = userEvent.setup();
    const { boton, onCambio } = monta();
    await u.click(boton);
    await u.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(onCambio).not.toHaveBeenCalled();
    expect(boton).toHaveFocus();
  });

  it("cierra al pulsar fuera", async () => {
    const u = userEvent.setup();
    const { boton } = monta();
    await u.click(boton);
    await u.click(document.body);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("el botón alterna: segundo clic lo cierra", async () => {
    const u = userEvent.setup();
    const { boton } = monta();
    await u.click(boton);
    await u.click(boton);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});

describe("Dropdown: elegir", () => {
  it("avisa del valor elegido y cierra", async () => {
    const u = userEvent.setup();
    const { boton, onCambio } = monta();
    await u.click(boton);
    await u.click(screen.getByRole("option", { name: /Atlántico/ }));
    expect(onCambio).toHaveBeenCalledWith("Atlántico");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("marca como seleccionada solo la opción activa", async () => {
    const u = userEvent.setup();
    const { boton } = monta({ valor: "Antioquia", etiqueta: "Antioquia" });
    await u.click(boton);
    const marcadas = screen
      .getAllByRole("option")
      .filter((o) => o.getAttribute("aria-selected") === "true");
    expect(marcadas).toHaveLength(1);
    expect(marcadas[0]).toHaveTextContent("Antioquia");
  });

  it("muestra la etiqueta corta en el botón, y la larga en la lista", async () => {
    const u = userEvent.setup();
    const { boton } = monta({ valor: "Bogotá, D.C.", etiqueta: "Bogotá" });
    expect(boton).toHaveTextContent("Bogotá");
    await u.click(boton);
    expect(screen.getByRole("option", { name: "Bogotá, D.C." })).toBeInTheDocument();
  });
});

describe("Dropdown: teclado", () => {
  it("abre con flecha abajo desde el botón", async () => {
    const u = userEvent.setup();
    const { boton } = monta();
    boton.focus();
    await u.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("las flechas mueven y Enter elige, en una lista corta", async () => {
    const u = userEvent.setup();
    const { boton, onCambio } = monta({ opciones: CORTAS, etiqueta: "Todos" });
    await u.click(boton);
    await u.keyboard("{ArrowDown}{ArrowDown}{Enter}");
    expect(onCambio).toHaveBeenCalledWith("tecnologica");
  });

  it("Inicio y Fin saltan a los extremos", async () => {
    const u = userEvent.setup();
    const { boton, onCambio } = monta({ opciones: CORTAS, etiqueta: "Todos" });
    await u.click(boton);
    await u.keyboard("{End}{Enter}");
    expect(onCambio).toHaveBeenCalledWith("tecnica");
  });

  it("la flecha da la vuelta al llegar al final", async () => {
    const u = userEvent.setup();
    const { boton, onCambio } = monta({ opciones: CORTAS, etiqueta: "Todos" });
    await u.click(boton);
    await u.keyboard("{ArrowUp}{Enter}"); // desde la primera, hacia atrás
    expect(onCambio).toHaveBeenCalledWith("tecnica");
  });
});

describe("Dropdown: buscador", () => {
  it("aparece solo cuando la lista es larga", async () => {
    const u = userEvent.setup();
    const { boton } = monta({ opciones: CORTAS, etiqueta: "Todos" });
    await u.click(boton);
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("en una lista larga aparece y se lleva el foco", async () => {
    const u = userEvent.setup();
    const { boton } = monta();
    await u.click(boton);
    const campo = await screen.findByRole("textbox");
    expect(campo).toHaveFocus();
  });

  it("filtra ignorando las tildes", async () => {
    const u = userEvent.setup();
    const { boton } = monta();
    await u.click(boton);
    await u.type(screen.getByRole("textbox"), "atlan");
    const ops = screen.getAllByRole("option");
    expect(ops).toHaveLength(1);
    expect(ops[0]).toHaveTextContent("Atlántico");
  });

  it("distingue la ñ", async () => {
    const u = userEvent.setup();
    const { boton } = monta();
    await u.click(boton);
    await u.type(screen.getByRole("textbox"), "nari");
    expect(screen.getAllByRole("option")[0]).toHaveTextContent("Nariño");
  });

  it("Enter elige el primer resultado filtrado", async () => {
    const u = userEvent.setup();
    const { boton, onCambio } = monta();
    await u.click(boton);
    await u.type(screen.getByRole("textbox"), "boli{Enter}");
    expect(onCambio).toHaveBeenCalledWith("Bolívar");
  });

  it("avisa cuando no hay resultados en vez de quedarse en blanco", async () => {
    const u = userEvent.setup();
    const { boton } = monta();
    await u.click(boton);
    await u.type(screen.getByRole("textbox"), "zzzzz");
    expect(screen.queryAllByRole("option")).toHaveLength(0);
    expect(screen.getByText(/sin resultados/i)).toBeInTheDocument();
  });

  it("Enter sin resultados no elige nada ni revienta", async () => {
    const u = userEvent.setup();
    const { boton, onCambio } = monta();
    await u.click(boton);
    await u.type(screen.getByRole("textbox"), "zzzzz{Enter}");
    expect(onCambio).not.toHaveBeenCalled();
  });

  it("la búsqueda se limpia al reabrir", async () => {
    const u = userEvent.setup();
    const { boton } = monta();
    await u.click(boton);
    await u.type(screen.getByRole("textbox"), "atlan");
    await u.keyboard("{Escape}");
    await u.click(boton);
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getAllByRole("option").length).toBe(DEPTOS.length);
  });
});

describe("Dropdown: accesibilidad", () => {
  it("el botón declara que abre un listbox", () => {
    const { boton } = monta();
    expect(boton).toHaveAttribute("aria-haspopup", "listbox");
  });

  it("la lista está etiquetada y las opciones tienen su rol", async () => {
    const u = userEvent.setup();
    const { boton } = monta();
    await u.click(boton);
    const lista = screen.getByRole("listbox");
    expect(lista).toHaveAttribute("aria-labelledby");
    expect(within(lista).getAllByRole("option").length).toBe(DEPTOS.length);
  });

  it("marca el control como activo cuando hay filtro puesto", () => {
    monta({ activo: true, valor: "Atlántico", etiqueta: "Atlántico" });
    expect(screen.getByRole("button", { name: /filtrar por/i }).className).toContain("on");
  });
});
