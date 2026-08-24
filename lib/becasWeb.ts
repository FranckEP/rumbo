import datos from "./snies/becasWeb.json";

/**
 * Página de becas de cada institución, cuando se pudo hallar y comprobar.
 *
 * Se guarda el ENLACE, no el contenido. Se intentó extraer los nombres de las
 * becas automáticamente y se descartó: lo que salía mezclaba fragmentos de
 * reglamento ("la beca no es acumulable con otras"), becas de intercambio que
 * no sirven para pagar la matrícula, y porcentajes sueltos sin relación con
 * ninguna beca concreta. Publicar eso habría sido peor que no mostrar nada,
 * porque un dato equivocado no se arregla poniéndole fecha.
 *
 * Solo sobrevivieron 8 instituciones cuyos nombres se revisaron uno por uno.
 * Los datos completos (nombre + cobertura + criterios) siguen en `becasUni.ts`.
 */
interface Archivo {
  _nota: string;
  _fecha: string;
  /** código SNIES -> URL de su página de becas */
  paginas: Record<string, string>;
  /** código SNIES -> nombres revisados a mano */
  nombres: Record<string, string[]>;
}

const archivo = datos as Archivo;

export interface BecasWeb {
  url: string;
  /** puede venir vacío: entonces solo se ofrece el enlace */
  nombres: string[];
}

export function becasWebDe(id: string): BecasWeb | undefined {
  const url = archivo.paginas[id];
  if (!url) return undefined;
  return { url, nombres: archivo.nombres[id] ?? [] };
}

/** Fecha en que se comprobó la página, en formato legible. */
export function fechaLegible(): string {
  const [a, m, d] = archivo._fecha.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
