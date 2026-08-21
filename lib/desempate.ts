import type { Career } from "./careers";
import { DIM_KEYS, type DimKey, type Scores } from "./riasec";

/**
 * Desempate por elección forzada.
 *
 * Cuando varias carreras quedan empatadas, preguntar "¿cuál te gusta más?" no
 * sirve: la respuesta honesta de un joven indeciso es "las dos". Así que en vez
 * de comparar CARRERAS comparamos DÍAS: dos formas concretas de pasar la
 * jornada, una por cada dimensión, y hay que escoger una. Sin empate posible.
 *
 * Las preguntas no están escritas por carrera (serían cientos de combinaciones)
 * sino por par de dimensiones: 15 pares cubren cualquier empate.
 */
export interface Duelo {
  /** dimensión que gana si elige la opción A */
  ka: DimKey;
  kb: DimKey;
  a: string;
  b: string;
}

/* Solo los 15 pares distintos, en el orden de DIM_KEYS (R I A S E C). */
type Par =
  | "RI" | "RA" | "RS" | "RE" | "RC"
  | "IA" | "IS" | "IE" | "IC"
  | "AS" | "AE" | "AC"
  | "SE" | "SC"
  | "EC";

const DUELOS: Record<Par, [string, string][]> = {
  RI: [
    ["Desarmar el motor y encontrar la pieza dañada", "Entender por qué falló esa pieza y calcular cómo evitarlo"],
    ["Construir el prototipo con tus manos", "Diseñar el experimento que prueba si el prototipo sirve"],
  ],
  RA: [
    ["Levantar una estructura que aguante 50 años", "Que la gente se detenga a mirar lo que hiciste"],
    ["Trabajar con materiales, herramientas y medidas exactas", "Trabajar con ideas, colores y formas que aún no existen"],
  ],
  RS: [
    ["Reparar tú mismo lo que está roto", "Enseñarle a otro a repararlo"],
    ["Una jornada al aire libre moviendo el cuerpo", "Una jornada acompañando a alguien que la está pasando mal"],
  ],
  RE: [
    ["Ser quien ejecuta la obra", "Ser quien consigue el contrato de la obra"],
    ["Que tu trabajo se mida en cosas terminadas", "Que tu trabajo se mida en acuerdos cerrados"],
  ],
  RC: [
    ["Estar en el terreno resolviendo lo que aparezca", "Estar en la oficina asegurando que todo cuadre"],
    ["Improvisar con lo que hay a mano", "Seguir el procedimiento al pie de la letra"],
  ],
  IA: [
    ["Encontrar la respuesta correcta", "Encontrar una respuesta que nadie había imaginado"],
    ["Que tu trabajo lo validen los datos", "Que tu trabajo emocione a alguien"],
  ],
  IS: [
    ["Estudiar la enfermedad", "Acompañar al enfermo"],
    ["Un día entero concentrado, en silencio", "Un día entero hablando con gente distinta"],
  ],
  IE: [
    ["Investigar a fondo antes de decidir", "Decidir rápido y corregir en el camino"],
    ["Que te reconozcan por tener razón", "Que te reconozcan por haberlo logrado"],
  ],
  IC: [
    ["Buscar por qué los números dan así", "Asegurar que los números estén bien registrados"],
    ["Preguntas abiertas sin respuesta conocida", "Tareas claras con un resultado verificable"],
  ],
  AS: [
    ["Crear algo tuyo, aunque nadie lo entienda al principio", "Hacer algo que le sirva hoy a alguien concreto"],
    ["Que tu obra hable por ti", "Que la gente te busque para hablar contigo"],
  ],
  AE: [
    ["Diseñar la campaña", "Vender la campaña al cliente"],
    ["Libertad total sobre lo que haces", "Presupuesto y equipo para hacerlo grande"],
  ],
  AC: [
    ["Que no haya dos días iguales", "Que cada día tenga su rutina clara"],
    ["Romper el formato", "Perfeccionar el formato"],
  ],
  SE: [
    ["Acompañar a alguien hasta que salga adelante", "Dirigir un equipo hasta cumplir la meta"],
    ["Que confíen en ti para contarte un problema", "Que confíen en ti para tomar la decisión"],
  ],
  SC: [
    ["Atender personas todo el día", "Organizar información todo el día"],
    ["Que tu día dependa de quién llegue", "Que tu día esté planeado desde la mañana"],
  ],
  EC: [
    ["Arriesgar por algo que puede salir muy bien", "Asegurar que nada salga mal"],
    ["Abrir el negocio", "Llevar las cuentas del negocio"],
  ],
};

/** clave normalizada del par, en el orden de DIM_KEYS */
function par(a: DimKey, b: DimKey): { key: Par; ka: DimKey; kb: DimKey } {
  const ia = DIM_KEYS.indexOf(a);
  const ib = DIM_KEYS.indexOf(b);
  const [x, y] = ia < ib ? [a, b] : [b, a];
  return { key: `${x}${y}` as Par, ka: x, kb: y };
}

/**
 * Elige los duelos que de verdad separan a las carreras empatadas: para cada
 * par de dimensiones mide qué tanto discrepan las candidatas en ese contraste.
 * Preguntar por dimensiones donde todas coinciden no desempata nada.
 */
export function duelosPara(carreras: Career[], maxDuelos = 8): Duelo[] {
  if (carreras.length < 2) return [];

  const puntajes: { key: Par; ka: DimKey; kb: DimKey; spread: number }[] = [];
  for (let i = 0; i < DIM_KEYS.length; i++) {
    for (let j = i + 1; j < DIM_KEYS.length; j++) {
      const { key, ka, kb } = par(DIM_KEYS[i], DIM_KEYS[j]);
      const contrastes = carreras.map((c) => (c.v[ka] ?? 0) - (c.v[kb] ?? 0));
      const spread = Math.max(...contrastes) - Math.min(...contrastes);
      puntajes.push({ key, ka, kb, spread });
    }
  }

  puntajes.sort((a, b) => b.spread - a.spread);
  const utiles = puntajes.filter((p) => p.spread > 0.15);
  const elegidos = (utiles.length ? utiles : puntajes).slice(0, Math.ceil(maxDuelos / 2));

  const duelos: Duelo[] = [];
  for (const p of elegidos) {
    for (const [a, b] of DUELOS[p.key]) {
      duelos.push({ ka: p.ka, kb: p.kb, a, b });
      if (duelos.length >= maxDuelos) return duelos;
    }
  }
  return duelos;
}

/** Vector de preferencia construido con las elecciones del desempate. */
export function preferencia(duelos: Duelo[], elecciones: ("a" | "b")[]): Scores {
  const p: Scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  duelos.forEach((d, i) => {
    const e = elecciones[i];
    if (e === "a") p[d.ka] += 1;
    else if (e === "b") p[d.kb] += 1;
  });
  return p;
}

/** Cuántas veces ganó cada dimensión, de mayor a menor (solo las que ganaron). */
export function dimsGanadoras(pref: Scores): [DimKey, number][] {
  return DIM_KEYS.map((k) => [k, pref[k]] as [DimKey, number])
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1]);
}
