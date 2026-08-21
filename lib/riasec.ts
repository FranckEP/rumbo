export type DimKey = "R" | "I" | "A" | "S" | "E" | "C";

export type Scores = Record<DimKey, number>;

export interface Dimension {
  name: string;
  color: string;
  soft: string;
  hint: string;
  desc: string;
}

export const DIM_KEYS: DimKey[] = ["R", "I", "A", "S", "E", "C"];

export const DIMS: Record<DimKey, Dimension> = {
  R: {
    name: "Realista",
    color: "var(--dim-r)",
    soft: "var(--dim-r-soft)",
    hint: "Manos, herramientas y acción",
    desc: "Te gusta lo concreto: construir, reparar, moverte, trabajar con herramientas, máquinas o al aire libre. Aprendes haciendo.",
  },
  I: {
    name: "Investigador",
    color: "var(--dim-i)",
    soft: "var(--dim-i-soft)",
    hint: "Analizar, descubrir, entender",
    desc: "Te mueve la curiosidad: analizar problemas, buscar el porqué de las cosas, experimentar y trabajar con ideas y datos.",
  },
  A: {
    name: "Artístico",
    color: "var(--dim-a)",
    soft: "var(--dim-a-soft)",
    hint: "Crear y expresar",
    desc: "Necesitas crear y expresarte: diseño, música, escritura, imagen. Prefieres la libertad y la originalidad a las rutinas.",
  },
  S: {
    name: "Social",
    color: "var(--dim-s)",
    soft: "var(--dim-s-soft)",
    hint: "Ayudar y enseñar a otros",
    desc: "Las personas son tu centro: enseñar, cuidar, acompañar, resolver conflictos. Disfrutas cuando tu trabajo mejora la vida de alguien.",
  },
  E: {
    name: "Emprendedor",
    color: "var(--dim-e)",
    soft: "var(--dim-e-soft)",
    hint: "Liderar, convencer, lograr",
    desc: "Te atraen los retos y el liderazgo: convencer, negociar, iniciar proyectos, tomar decisiones y competir por metas ambiciosas.",
  },
  C: {
    name: "Convencional",
    color: "var(--dim-c)",
    soft: "var(--dim-c-soft)",
    hint: "Orden, datos y precisión",
    desc: "Tu fuerte es el orden: organizar información, seguir procesos, trabajar con números y hacer que todo funcione con precisión.",
  },
};

export const PROFILE_TITLES: Record<DimKey, string> = {
  R: "Constructor",
  I: "Explorador",
  A: "Creador",
  S: "Guía",
  E: "Líder",
  C: "Organizador",
};

const QUESTIONS_BY_DIM: Record<DimKey, string[]> = {
  R: [
    "Armar o reparar cosas con mis propias manos",
    "Entender cómo funcionan los motores y las máquinas",
    "Trabajar al aire libre, en el campo o la naturaleza",
    "Usar herramientas o equipos técnicos",
    "Construir un mueble o un objeto desde cero",
    "Cuidar animales o cultivar plantas",
    "Hacer deporte o actividades físicas exigentes",
    "Instalar o configurar equipos electrónicos",
  ],
  I: [
    "Resolver problemas de lógica o matemática",
    "Hacer experimentos para comprobar una idea",
    "Leer sobre ciencia, tecnología o descubrimientos",
    "Analizar datos para encontrar patrones",
    "Preguntarme el porqué de las cosas hasta hallar la respuesta",
    "Programar o entender cómo funciona el software",
    "Investigar un tema a fondo por mi cuenta",
    "Debatir teorías o ideas complejas",
  ],
  A: [
    "Dibujar, pintar o diseñar",
    "Escribir cuentos, poemas o guiones",
    "Tocar un instrumento o crear música",
    "Imaginar mundos, personajes o ideas nuevas",
    "Actuar, bailar o presentarme en un escenario",
    "Tomar fotos o grabar y editar videos",
    "Decorar espacios o combinar colores y estilos",
    "Expresar lo que siento a través del arte",
  ],
  S: [
    "Ayudar a alguien a entender un tema difícil",
    "Escuchar los problemas de mis amigos y aconsejarlos",
    "Trabajar en equipo para lograr algo juntos",
    "Cuidar a personas enfermas o mayores",
    "Participar en voluntariados o causas sociales",
    "Enseñar a otras personas algo que sé hacer",
    "Hacer que un grupo se sienta bienvenido e incluido",
    "Mediar cuando hay conflictos entre personas",
  ],
  E: [
    "Liderar un equipo o un proyecto",
    "Convencer a otros de una idea que me apasiona",
    "Vender algo o negociar un precio",
    "Crear un negocio propio",
    "Hablar en público con seguridad",
    "Tomar decisiones rápidas bajo presión",
    "Competir y ponerme metas ambiciosas",
    "Organizar eventos y lograr que la gente participe",
  ],
  C: [
    "Mantener mis apuntes y archivos perfectamente ordenados",
    "Seguir instrucciones detalladas paso a paso",
    "Trabajar con números, cuentas o presupuestos",
    "Hacer listas y planificar mi semana",
    "Revisar textos o datos buscando errores",
    "Clasificar y organizar información",
    "Manejar hojas de cálculo o bases de datos",
    "Cumplir plazos y reglas con precisión",
  ],
};

export interface Question {
  dim: DimKey;
  text: string;
}

/* Orden intercalado: R,I,A,S,E,C, R,I,A,S,E,C, ... */
export const QUESTIONS: Question[] = (() => {
  const list: Question[] = [];
  for (let i = 0; i < 8; i++) {
    for (const k of DIM_KEYS) list.push({ dim: k, text: QUESTIONS_BY_DIM[k][i] });
  }
  return list;
})();

export const TOTAL = QUESTIONS.length; // 48
export const MAX_PER_DIM = 8 * 3; // 24

export const SCALE = [
  { v: 0, label: "No va conmigo" },
  { v: 1, label: "Un poco" },
  { v: 2, label: "Bastante" },
  { v: 3, label: "Totalmente yo" },
] as const;

/* ================= Puntuación ================= */

export type Answers = (number | null)[];

export function scores(answers: Answers): Scores {
  const s: Scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
  QUESTIONS.forEach((q, i) => {
    s[q.dim] += answers[i] ?? 0;
  });
  return s;
}

export function normalized(s: Scores): Scores {
  const n = {} as Scores;
  for (const k of DIM_KEYS) n[k] = s[k] / MAX_PER_DIM;
  return n;
}

export function hollandCode(s: Scores): DimKey[] {
  return [...DIM_KEYS].sort((a, b) => s[b] - s[a]).slice(0, 3);
}

/**
 * Afinidad entre el perfil del joven y una carrera.
 *
 * Compara la FORMA de los dos perfiles, no su tamaño: a cada vector se le
 * resta su propio promedio antes de correlacionarlos. Sin ese centrado, como
 * todas las respuestas son positivas, el cálculo medía sobre todo cuánto
 * respondió "sí" la persona en general — y todas las carreras salían entre
 * 70% y 90%, sin poder distinguir una de otra. Un perfil que respondía alto a
 * todo llegaba a tener 1.7 puntos de diferencia entre su carrera n.º 1 y su
 * n.º 8, lo que hacía el resultado inservible.
 *
 * Devuelve 0 cuando la carrera no tiene nada que ver con el perfil (la
 * correlación es nula o negativa): eso es información útil, no un error.
 */
export function cosine(user: Scores, career: Partial<Scores>): number {
  const mediaU = DIM_KEYS.reduce((a, k) => a + (user[k] || 0), 0) / DIM_KEYS.length;
  const mediaC = DIM_KEYS.reduce((a, k) => a + (career[k] || 0), 0) / DIM_KEYS.length;

  let dot = 0;
  let mu = 0;
  let mc = 0;
  for (const k of DIM_KEYS) {
    const u = (user[k] || 0) - mediaU;
    const c = (career[k] || 0) - mediaC;
    dot += u * c;
    mu += u * u;
    mc += c * c;
  }
  if (mu === 0 || mc === 0) return 0;
  return Math.max(0, dot / (Math.sqrt(mu) * Math.sqrt(mc)));
}

/** Carreras dentro de este margen del primer lugar están, en la práctica,
 *  empatadas: la diferencia no es evidencia de nada. */
export const MARGEN_EMPATE = 0.04;
