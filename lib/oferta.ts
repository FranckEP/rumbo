import ofertaJson from "./snies/oferta.json";
import { CAREERS, type CareerLevel } from "./careers";
import { INSTITUCIONES, type Institucion } from "./instituciones";

/**
 * Oferta real de cada carrera según el SNIES.
 *
 * Reemplaza las listas de universidades escritas a mano en `careers.ts`, que
 * cubrían unas pocas instituciones por carrera y había que mantener a pulso.
 * El índice se precalcula con `npm run snies:indexar` para no cargar al
 * navegador el archivo de 9.148 programas.
 */
interface OfertaCarrera {
  profesional?: Record<string, string[]>;
  tecnologica?: Record<string, string[]>;
  tecnica?: Record<string, string[]>;
  /** duración mediana real, en semestres */
  _dur?: Partial<Record<CareerLevel, number>>;
  /** matrícula mediana en pesos, redondeada; 0 o ausente si no hay dato */
  _costo?: Partial<Record<CareerLevel, number>>;
}

const ORDEN: CareerLevel[] = ["profesional", "tecnologica", "tecnica"];

/** Niveles que la carrera declara en `careers.ts`. */
const PERMITIDOS: Record<string, CareerLevel[]> = Object.fromEntries(
  CAREERS.map((c) => [c.n, c.lvl])
);

/**
 * El indice del SNIES, ya depurado.
 *
 * El filtro se aplica UNA vez aqui y no en cada funcion, a proposito: antes
 * `nivelesDe` e `institucionesDe` tenian la guarda pero `cuantasDe`,
 * `duracionDe`, `costoDe` y `departamentosDe` leian el indice crudo y se la
 * saltaban. Depurando el origen no queda ninguna puerta trasera.
 *
 * Que se depura: el mapeo automatico de nombres mete bajo una carrera
 * programas que se le parecen pero no son ella. «Tecnologia en Atencion
 * Prehospitalaria» y «Tecnologia en Radiologia» caian bajo Medicina,
 * «Tecnologia en Criminalistica» bajo Derecho, «Tecnico Profesional en Salud
 * Oral» bajo Odontologia. La ficha llegaba a decir «Medicina · Tecnologica ·
 * 15 instituciones · 6 semestres», y un joven concluia que puede ser medico
 * en tres anos. No puede: son profesiones reguladas que solo existen como
 * pregrado universitario.
 *
 * Son carreras dignas y bien pagadas, pero son OTRAS carreras. Presentarlas
 * como un atajo a la que el chico quiere es el peor error posible aqui.
 */
const OFERTA: Record<string, OfertaCarrera> = Object.fromEntries(
  Object.entries(ofertaJson as Record<string, OfertaCarrera>).map(([carrera, datos]) => {
    const permitidos = PERMITIDOS[carrera];
    if (!permitidos) return [carrera, datos];

    const limpio: OfertaCarrera = { _dur: {}, _costo: {} };
    for (const n of ORDEN) {
      if (!permitidos.includes(n)) continue;
      if (datos[n]) limpio[n] = datos[n];
      if (datos._dur?.[n] !== undefined) limpio._dur![n] = datos._dur[n];
      if (datos._costo?.[n] !== undefined) limpio._costo![n] = datos._costo[n];
    }
    return [carrera, limpio];
  })
);

export function tieneOferta(carrera: string): boolean {
  return carrera in OFERTA;
}

/** Niveles en los que esa carrera se ofrece de verdad en el país. */
export function nivelesDe(carrera: string): CareerLevel[] {
  const o = OFERTA[carrera];
  if (!o) return [];
  return ORDEN.filter((n) => o[n]);
}

/**
 * Instituciones que ofrecen esa carrera en ese nivel.
 * `depto === "all"` junta todos los departamentos.
 */
export function institucionesDe(
  carrera: string,
  nivel: CareerLevel,
  depto: string
): Institucion[] {
  const porDepto = OFERTA[carrera]?.[nivel];
  if (!porDepto) return [];

  const ids =
    depto === "all"
      ? [...new Set(Object.values(porDepto).flat())]
      : porDepto[depto] ?? [];

  return ids
    .map((id) => INSTITUCIONES[id])
    .filter((i): i is Institucion => Boolean(i))
    .sort((a, b) => {
      // Las públicas primero: para muchos jóvenes la matrícula gratuita es
      // lo que decide si pueden estudiar o no.
      if (a.sector !== b.sector) return a.sector === "publica" ? -1 : 1;
      return a.nombre.localeCompare(b.nombre, "es");
    });
}

/** Cuántas instituciones ofrecen la carrera en ese nivel y departamento. */
export function cuantasDe(carrera: string, nivel: CareerLevel, depto: string): number {
  const porDepto = OFERTA[carrera]?.[nivel];
  if (!porDepto) return 0;
  return depto === "all"
    ? new Set(Object.values(porDepto).flat()).size
    : (porDepto[depto] ?? []).length;
}

/** Duración mediana real en semestres, o undefined si no hay dato. */
export function duracionDe(carrera: string, nivel: CareerLevel): number | undefined {
  return OFERTA[carrera]?._dur?.[nivel];
}

/** Matrícula mediana por semestre, o undefined si el SNIES no la reporta. */
export function costoDe(carrera: string, nivel: CareerLevel): number | undefined {
  const c = OFERTA[carrera]?._costo?.[nivel];
  return c && c > 0 ? c : undefined;
}

export function pesos(n: number): string {
  return "$" + n.toLocaleString("es-CO", { maximumFractionDigits: 0 });
}

/** Departamentos donde esa carrera se ofrece, en cualquier nivel. */
export function departamentosDe(carrera: string): string[] {
  const o = OFERTA[carrera];
  if (!o) return [];
  const s = new Set<string>();
  for (const n of ["profesional", "tecnologica", "tecnica"] as CareerLevel[]) {
    for (const d of Object.keys(o[n] ?? {})) s.add(d);
  }
  return [...s].sort((a, b) => a.localeCompare(b, "es"));
}
