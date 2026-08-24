import instJson from "./snies/instituciones.json";
import enlacesJson from "./snies/enlaces.json";
import codigosJson from "./snies/codigos.json";
import { UNIS, type Sector } from "./universities";

/**
 * Registro único de instituciones, con el código SNIES como identidad.
 *
 * Antes cada universidad vivía en `universities.ts` con una clave inventada
 * ("unal", "uninorte"). Eso servía para 67 instituciones curadas a mano, pero
 * la oferta real del SNIES habla en códigos oficiales. Aquí se unen las dos
 * fuentes: el nombre y el sector salen del SNIES (que es la fuente oficial) y
 * el sitio web sale de donde lo tengamos verificado.
 */
export interface Institucion {
  id: string;
  nombre: string;
  sector: Sector;
  deps: string[];
  url: string;
  /** clave antigua en universities.ts, si la tiene: la usan las becas */
  clave?: string;
}

interface FilaSnies {
  id: string;
  nombre: string;
  sector: string;
  caracter: string;
  deps: string[];
  buscar: string;
}

const codigos = codigosJson as Record<string, string>;
const enlaces = enlacesJson as Record<string, string>;

/** código SNIES → clave antigua (unal, uninorte…) */
const claveDe: Record<string, string> = {};
for (const [clave, cod] of Object.entries(codigos)) {
  if (!clave.startsWith("_")) claveDe[cod] = clave;
}

export const INSTITUCIONES: Record<string, Institucion> = {};

for (const fila of instJson as FilaSnies[]) {
  const clave = claveDe[fila.id];
  // El sitio oficial viene de universities.ts si la institución ya estaba
  // curada allí; si no, del listado que se resolvió y verificó contra el SNIES.
  const url = clave ? UNIS[clave]?.[1] : enlaces[fila.id];
  if (!url) continue; // sin enlace no se puede mostrar: no hay a dónde mandar al joven

  INSTITUCIONES[fila.id] = {
    id: fila.id,
    nombre: clave ? UNIS[clave][0] : fila.nombre,
    sector: fila.sector === "publica" ? "publica" : "privada",
    deps: fila.deps,
    url,
    clave,
  };
}

/** Departamentos donde hay al menos una institución con enlace. */
export const DEPARTAMENTOS: string[] = [
  ...new Set(Object.values(INSTITUCIONES).flatMap((i) => i.deps)),
]
  .filter((d) => d && d !== "*")
  .sort((a, b) => a.localeCompare(b, "es"));

export function institucion(id: string): Institucion | undefined {
  return INSTITUCIONES[id];
}
