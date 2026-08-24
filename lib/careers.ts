import type { Scores } from "./riasec";

export type CareerLevel = "profesional" | "tecnologica" | "tecnica";

export const LEVEL_LABELS: Record<CareerLevel, string> = {
  profesional: "Profesional (universitaria)",
  tecnologica: "Tecnológica",
  tecnica: "Técnica",
};

/** Carreras: vector RIASEC con pesos 0–1 */
export interface Career {
  /** nombre */
  n: string;
  /** vector RIASEC */
  v: Partial<Scores>;
  /** descripción */
  d: string;
  /** campos de trabajo */
  f: string[];
  /** ids de universidades (ver lib/universities.ts) */
  u: string[];
  /** niveles en los que realmente se ofrece en Colombia (SENA e institutos incluidos) */
  lvl: CareerLevel[];
}

/* Las profesiones reguladas (medicina, derecho, psicología, arquitectura, odontología,
   veterinaria...) solo existen a nivel profesional/universitario en Colombia. El resto
   se marca también como tecnológica y/o técnica cuando el SENA o institutos técnicos
   ofrecen realmente un programa equivalente o muy cercano. */
export const CAREERS: Career[] = [
  { n: "Medicina", v: { I: 1, S: 0.85, R: 0.4 }, d: "Diagnosticar y tratar enfermedades combinando ciencia rigurosa con el trato directo a pacientes.", f: ["Hospitales", "Investigación clínica", "Salud pública"], u: ["unal", "udea", "javeriana", "bosque", "uninorte", "unicartagena", "unisinu", "unimetro", "uniatlantico", "unisimon", "cuc", "unilibre", "sanmartin"], lvl: ["profesional"] },
  { n: "Enfermería", v: { S: 1, C: 0.55, R: 0.45 }, d: "Cuidar la salud de las personas en el día a día: atención directa, procedimientos y acompañamiento.", f: ["Clínicas", "Emergencias", "Cuidado comunitario"], u: ["unal", "univalle", "javeriana", "udea", "uninorte", "unicartagena", "unimetro", "curn", "unisucre", "areandina", "unisimon", "cuc"], lvl: ["profesional", "tecnica"] },
  { n: "Psicología", v: { S: 1, I: 0.75, A: 0.35 }, d: "Entender la mente y el comportamiento para acompañar a personas, equipos y comunidades.", f: ["Clínica", "Educativa", "Organizacional"], u: ["unal", "andes", "javeriana", "konrad", "uninorte", "unab", "unisimon", "cuc", "cecar", "uac", "unimetro", "reformada", "uniminuto", "unad"], lvl: ["profesional"] },
  { n: "Ingeniería de Software", v: { I: 1, C: 0.6, R: 0.45 }, d: "Diseñar y construir aplicaciones, sistemas y productos digitales resolviendo problemas con código.", f: ["Desarrollo web", "Apps móviles", "Inteligencia artificial"], u: ["unal", "andes", "eafit", "distrital", "uninorte", "icesi", "utb", "cuc", "magdalena", "iub", "uac", "unisimon", "americana", "pca", "reformada", "uniminuto", "cul", "unicorsalud"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Ciencia de Datos", v: { I: 1, C: 0.75, E: 0.35 }, d: "Convertir datos en decisiones: estadística, programación y comunicación de hallazgos.", f: ["Analítica", "Machine learning", "Investigación"], u: ["andes", "eafit", "icesi", "uninorte"], lvl: ["profesional", "tecnologica"] },
  { n: "Ingeniería Civil", v: { R: 0.95, I: 0.7, C: 0.55 }, d: "Diseñar y construir la infraestructura del mundo: edificios, puentes, carreteras y obras hidráulicas.", f: ["Construcción", "Estructuras", "Gestión de obras"], u: ["unal", "andes", "escuelaing", "uis", "uninorte", "unicauca", "cuc", "utb", "unicartagena", "unisucre", "unisimon"], lvl: ["profesional", "tecnologica"] },
  { n: "Ingeniería Mecánica / Mecatrónica", v: { R: 1, I: 0.75, C: 0.4 }, d: "Crear y mantener máquinas, robots y sistemas automatizados que mueven la industria.", f: ["Robótica", "Automatización", "Manufactura"], u: ["unal", "uis", "utp", "umng", "uniatlantico", "uninorte", "utb", "uac", "unicordoba", "unisimon", "iub"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Ingeniería Industrial", v: { E: 0.8, C: 0.75, I: 0.6 }, d: "Optimizar procesos, recursos y equipos para que empresas y operaciones funcionen mejor.", f: ["Logística", "Calidad", "Gestión de operaciones"], u: ["unal", "andes", "javeriana", "uis", "uninorte", "uniatlantico", "cuc", "utb", "unicordoba", "comfenalco", "uac", "unisimon", "americana", "reformada", "uniminuto", "cul", "unad", "unicorsalud"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Ingeniería Ambiental", v: { I: 0.85, R: 0.7, S: 0.5 }, d: "Proteger ecosistemas y diseñar soluciones frente a la contaminación y el cambio climático.", f: ["Sostenibilidad", "Gestión de recursos", "Energías limpias"], u: ["unal", "andes", "lasalle", "udea", "cuc", "uniguajira", "unicordoba", "unicorsalud"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Arquitectura", v: { A: 0.95, R: 0.6, I: 0.55 }, d: "Imaginar y proyectar espacios donde la gente vive, estudia y trabaja, uniendo arte y técnica.", f: ["Diseño urbano", "Interiorismo", "Construcción sostenible"], u: ["unal", "andes", "javeriana", "upb", "uninorte", "uniatlantico", "cuc", "uac"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Diseño Gráfico / UX", v: { A: 1, E: 0.5, I: 0.4 }, d: "Comunicar ideas con imagen: marcas, interfaces, editorial y experiencias digitales.", f: ["Branding", "Diseño de interfaces", "Ilustración"], u: ["unal", "tadeo", "javeriana", "upb", "uninorte", "uac", "sergio"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Cine y Comunicación Audiovisual", v: { A: 1, E: 0.55, I: 0.35 }, d: "Contar historias con cámara, sonido y montaje: cine, series, documental y contenido digital.", f: ["Dirección", "Producción", "Postproducción"], u: ["unal", "magdalena", "javeriana", "poli", "uao", "uac"], lvl: ["profesional", "tecnica"] },
  { n: "Música y Artes Escénicas", v: { A: 1, S: 0.5, E: 0.4 }, d: "Vivir de crear e interpretar: composición, ejecución, teatro y danza.", f: ["Interpretación", "Composición", "Producción musical"], u: ["unal", "javeriana", "eafit", "distrital", "uniatlantico", "unab", "reformada"], lvl: ["profesional"] },
  { n: "Periodismo y Comunicación", v: { A: 0.8, S: 0.65, E: 0.6 }, d: "Investigar y contar lo que pasa: reportajes, medios digitales y comunicación estratégica.", f: ["Prensa", "Medios digitales", "Comunicación corporativa"], u: ["javeriana", "externado", "udea", "sabana", "uninorte", "uao", "uac", "sergio", "uniminuto"], lvl: ["profesional"] },
  { n: "Publicidad y Marketing", v: { E: 0.9, A: 0.75, S: 0.4 }, d: "Conectar marcas con personas mediante creatividad, campañas y análisis del consumidor.", f: ["Marketing digital", "Creatividad publicitaria", "Investigación de mercados"], u: ["tadeo", "poli", "uao", "sergio", "unilibre", "sanmartin"], lvl: ["profesional", "tecnologica"] },
  { n: "Administración de Empresas", v: { E: 1, C: 0.65, S: 0.45 }, d: "Dirigir organizaciones: estrategia, finanzas, personas y crecimiento de negocios.", f: ["Gestión", "Emprendimiento", "Consultoría"], u: ["andes", "cesa", "eafit", "externado", "uninorte", "unab", "cuc", "magdalena", "ucc", "cecar", "uniatlantico", "uac", "unisimon", "americana", "cues", "pca", "reformada", "uniminuto", "sanmartin", "litoral", "esap", "unad", "unicorsalud"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Economía", v: { I: 0.9, E: 0.65, C: 0.6 }, d: "Analizar cómo se producen y distribuyen los recursos para orientar decisiones públicas y privadas.", f: ["Análisis económico", "Banca", "Políticas públicas"], u: ["unal", "andes", "externado", "rosario", "uninorte", "uniatlantico", "unicartagena", "magdalena"], lvl: ["profesional"] },
  { n: "Contabilidad y Finanzas", v: { C: 1, E: 0.55, I: 0.4 }, d: "Llevar el pulso financiero de las organizaciones: registros, impuestos, auditoría e inversión.", f: ["Auditoría", "Tributación", "Finanzas corporativas"], u: ["unal", "externado", "javeriana", "unilibre", "uniatlantico", "cuc", "ucc", "unicesar", "cecar", "comfenalco", "uac", "unisimon", "americana", "cues", "reformada", "uniminuto", "sanmartin", "cul", "litoral", "utolima"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Derecho", v: { E: 0.85, S: 0.65, C: 0.6 }, d: "Defender derechos y resolver conflictos usando la argumentación y el marco legal.", f: ["Litigio", "Derecho corporativo", "Derechos humanos"], u: ["externado", "rosario", "unal", "andes", "uninorte", "unilibre", "unicartagena", "unisimon", "sergio", "cecar", "curn", "unisinu", "uac", "cuc", "americana", "reformada", "sanmartin"], lvl: ["profesional"] },
  { n: "Relaciones Internacionales", v: { E: 0.8, S: 0.7, I: 0.55 }, d: "Trabajar entre países y culturas: diplomacia, cooperación y comercio global.", f: ["Diplomacia", "Cooperación internacional", "Comercio exterior"], u: ["rosario", "externado", "javeriana", "uninorte"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Educación / Docencia", v: { S: 1, A: 0.5, C: 0.45 }, d: "Formar a las nuevas generaciones: enseñar, diseñar experiencias de aprendizaje y acompañar.", f: ["Educación inicial", "Secundaria", "Educación especial"], u: ["upn", "udea", "distrital", "javeriana", "uniatlantico", "unicauca", "unicordoba", "uniguajira", "magdalena", "unicesar", "uninorte", "unisimon", "unilibre", "iub", "reformada", "uniminuto", "cul", "utolima"], lvl: ["profesional"] },
  { n: "Trabajo Social", v: { S: 1, E: 0.5, C: 0.4 }, d: "Intervenir en problemáticas sociales acompañando a personas y comunidades vulnerables.", f: ["Comunidades", "Familia", "Políticas sociales"], u: ["unal", "externado", "lasalle", "unicartagena", "unisimon", "cecar", "uniguajira", "unimetro", "uniminuto"], lvl: ["profesional"] },
  { n: "Biología", v: { I: 1, R: 0.6, A: 0.3 }, d: "Estudiar la vida en todas sus formas, del laboratorio a los ecosistemas.", f: ["Genética", "Ecología", "Biotecnología"], u: ["unal", "andes", "udea", "javeriana", "uniatlantico", "unicordoba", "magdalena", "unisucre"], lvl: ["profesional"] },
  { n: "Química y Farmacia", v: { I: 0.95, C: 0.6, R: 0.5 }, d: "Investigar sustancias y desarrollar medicamentos y productos que cuidan la salud.", f: ["Laboratorio", "Industria farmacéutica", "Control de calidad"], u: ["unal", "udea", "icesi", "uis", "uniatlantico", "unicartagena"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Veterinaria", v: { I: 0.8, R: 0.75, S: 0.5 }, d: "Cuidar la salud y el bienestar de los animales, de mascotas a fauna silvestre.", f: ["Clínica de animales", "Zootecnia", "Fauna silvestre"], u: ["unal", "lasalle", "ces", "udca", "unicordoba", "unisucre", "sanmartin"], lvl: ["profesional"] },
  { n: "Agronomía", v: { R: 1, I: 0.6, C: 0.4 }, d: "Producir alimentos de forma eficiente y sostenible trabajando con la tierra y la tecnología.", f: ["Cultivos", "Agrotecnología", "Gestión rural"], u: ["unal", "lasalle", "uptc", "udca", "unicordoba", "magdalena", "uniatlantico"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Gastronomía", v: { R: 0.8, A: 0.7, E: 0.55 }, d: "Crear experiencias con la cocina: técnica, creatividad y gestión de restaurantes.", f: ["Cocina profesional", "Pastelería", "Gestión de restaurantes"], u: ["sena", "sabana", "colmayor"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Turismo y Hotelería", v: { E: 0.85, S: 0.75, C: 0.4 }, d: "Diseñar y operar experiencias de viaje y hospitalidad para personas de todo el mundo.", f: ["Hotelería", "Agencias y destinos", "Eventos"], u: ["externado", "sena", "utp", "colmayor", "magdalena", "uniguajira", "uniatlantico", "uac", "cuc"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Fisioterapia", v: { S: 0.9, R: 0.65, I: 0.5 }, d: "Recuperar el movimiento y la calidad de vida de las personas a través del cuerpo.", f: ["Rehabilitación", "Deporte", "Terapia física"], u: ["rosario", "unal", "ces", "udca", "unisimon", "unimetro", "udes", "unilibre"], lvl: ["profesional"] },
  { n: "Odontología", v: { R: 0.7, I: 0.7, S: 0.6 }, d: "Cuidar la salud bucal combinando precisión manual, ciencia y atención al paciente.", f: ["Clínica dental", "Ortodoncia", "Cirugía oral"], u: ["unal", "javeriana", "bosque", "ces", "unicartagena", "unimetro", "unisinu", "uninorte", "sanmartin"], lvl: ["profesional", "tecnica"] },
  { n: "Recursos Humanos", v: { S: 0.85, E: 0.65, C: 0.55 }, d: "Cuidar el talento de las organizaciones: selección, desarrollo y bienestar de las personas.", f: ["Selección", "Capacitación", "Cultura organizacional"], u: ["sena", "ean", "externado", "poli", "uniminuto", "iub"], lvl: ["profesional", "tecnologica", "tecnica"] },
  { n: "Ciencias del Deporte", v: { S: 0.75, R: 0.75, E: 0.5 }, d: "Entrenar, enseñar y potenciar el rendimiento físico y la vida activa de las personas.", f: ["Entrenamiento", "Educación física", "Gestión deportiva"], u: ["upn", "udca", "udea", "uniatlantico", "unicordoba", "uac", "uniminuto", "cul"], lvl: ["profesional", "tecnica"] },
];

/** Una ruta de formación concreta y relacionada con la carrera:
 *  el mismo campo se puede estudiar como programa profesional, tecnológico
 *  o técnico (con nombres distintos). Duraciones típicas en semestres. */
export interface Ruta {
  l: CareerLevel;
  /** nombre del programa relacionado */
  n: string;
  /** duración típica */
  t: string;
  /** dónde se ofrece (ejemplos) */
  w?: string;
}

/* La tabla que decía qué institución ofrecía cada nivel se eliminó: esa
   información ahora sale del SNIES (lib/oferta.ts), con 9.148 programas reales
   en vez de una lista escrita a mano. El campo `u` de cada carrera tampoco se
   usa para "dónde estudiar"; se conserva solo como referencia histórica. */

export const RUTAS: Record<string, Ruta[]> = {
  "Medicina": [
    { l: "profesional", n: "Medicina", t: "12–14 sem.", w: "Solo universitaria; incluye internado y luego servicio social" },
  ],
  "Enfermería": [
    { l: "profesional", n: "Enfermería", t: "8–9 sem.", w: "Universidades" },
    { l: "tecnica", n: "Auxiliar de Enfermería (técnico laboral)", t: "2–3 sem.", w: "SENA e institutos de salud" },
  ],
  "Psicología": [
    { l: "profesional", n: "Psicología", t: "9–10 sem.", w: "Solo universitaria" },
  ],
  "Ingeniería de Software": [
    { l: "profesional", n: "Ingeniería de Sistemas / de Software", t: "9–10 sem.", w: "Universidades (incl. Unicorsalud)" },
    { l: "tecnologica", n: "Tecnología en Análisis y Desarrollo de Software", t: "5–6 sem.", w: "SENA, IUB" },
    { l: "tecnica", n: "Técnico en Programación de Software", t: "2–3 sem.", w: "SENA" },
  ],
  "Ciencia de Datos": [
    { l: "profesional", n: "Ciencia de Datos / Estadística", t: "8–9 sem.", w: "Universidades" },
    { l: "tecnologica", n: "Tecnología en Big Data / Gestión de la Información", t: "5–6 sem.", w: "SENA" },
  ],
  "Ingeniería Civil": [
    { l: "profesional", n: "Ingeniería Civil", t: "10 sem.", w: "Universidades" },
    { l: "tecnologica", n: "Tecnología en Construcción / Obras Civiles", t: "5–6 sem.", w: "SENA" },
  ],
  "Ingeniería Mecánica / Mecatrónica": [
    { l: "profesional", n: "Ing. Mecánica / Mecatrónica", t: "10 sem.", w: "Universidades" },
    { l: "tecnologica", n: "Tecn. en Mantenimiento Electromecánico", t: "5–6 sem.", w: "SENA, IUB" },
    { l: "tecnica", n: "Técnico en Mecánica Industrial / Automotriz", t: "2–3 sem.", w: "SENA" },
  ],
  "Ingeniería Industrial": [
    { l: "profesional", n: "Ingeniería Industrial", t: "9–10 sem.", w: "Universidades (incl. Unicorsalud)" },
    { l: "tecnologica", n: "Tecn. en Gestión de la Producción / Logística", t: "5–6 sem.", w: "SENA, Unicorsalud" },
    { l: "tecnica", n: "T.P. en Operación de Procesos Industriales", t: "2–3 sem.", w: "IUB" },
  ],
  "Ingeniería Ambiental": [
    { l: "profesional", n: "Ingeniería Ambiental", t: "10 sem.", w: "Universidades (incl. Unicorsalud)" },
    { l: "tecnologica", n: "Tecn. en Gestión / Saneamiento Ambiental", t: "5–6 sem.", w: "SENA" },
    { l: "tecnica", n: "Técnico laboral en Saneamiento Ambiental", t: "2 sem.", w: "Unicorsalud, SENA" },
  ],
  "Arquitectura": [
    { l: "profesional", n: "Arquitectura", t: "10 sem.", w: "Universidades" },
    { l: "tecnologica", n: "Tecn. en Modelado Digital / Gestión de la Construcción", t: "5–6 sem.", w: "U. del Atlántico" },
    { l: "tecnica", n: "T.P. en Expresión Gráfica Arquitectónica; Dibujo Arquitectónico", t: "2–3 sem.", w: "U. del Atlántico, SENA" },
  ],
  "Diseño Gráfico / UX": [
    { l: "profesional", n: "Diseño Gráfico / Diseño Digital", t: "8 sem.", w: "Universidades" },
    { l: "tecnologica", n: "Tecn. en Producción de Multimedia", t: "5–6 sem.", w: "SENA" },
    { l: "tecnica", n: "T.P. en Producción Gráfica y Multimedial", t: "2–3 sem.", w: "IUB, SENA" },
  ],
  "Cine y Comunicación Audiovisual": [
    { l: "profesional", n: "Cine / Comunicación Audiovisual", t: "8–9 sem.", w: "Universidades" },
    { l: "tecnica", n: "Técnico en Producción Audiovisual", t: "2–3 sem.", w: "SENA" },
  ],
  "Música y Artes Escénicas": [
    { l: "profesional", n: "Música, Lic. en Música, Danza, Arte Dramático", t: "8–10 sem.", w: "U. del Atlántico (Bellas Artes), Reformada, UNAL" },
  ],
  "Periodismo y Comunicación": [
    { l: "profesional", n: "Comunicación Social y Periodismo", t: "8–9 sem.", w: "Universidades" },
  ],
  "Publicidad y Marketing": [
    { l: "profesional", n: "Publicidad / Mercadeo", t: "8–9 sem.", w: "Universidades" },
    { l: "tecnologica", n: "Tecnología en Mercadeo", t: "5–6 sem.", w: "SENA" },
  ],
  "Administración de Empresas": [
    { l: "profesional", n: "Administración de Empresas / Negocios", t: "9 sem.", w: "Universidades (incl. Unicorsalud)" },
    { l: "tecnologica", n: "Tecn. en Gestión Administrativa", t: "5–6 sem.", w: "SENA, IUB, Unicorsalud" },
    { l: "tecnica", n: "Técnico en Asistencia Administrativa", t: "2 sem.", w: "SENA, Unicorsalud" },
  ],
  "Economía": [
    { l: "profesional", n: "Economía", t: "9–10 sem.", w: "Solo universitaria" },
  ],
  "Contabilidad y Finanzas": [
    { l: "profesional", n: "Contaduría Pública", t: "9–10 sem.", w: "Universidades" },
    { l: "tecnologica", n: "Tecn. en Gestión Contable y Financiera", t: "5–6 sem.", w: "SENA, Litoral" },
    { l: "tecnica", n: "Técnico en Contabilización de Operaciones", t: "2–3 sem.", w: "SENA" },
  ],
  "Derecho": [
    { l: "profesional", n: "Derecho", t: "10 sem.", w: "Solo universitaria" },
  ],
  "Relaciones Internacionales": [
    { l: "profesional", n: "Relaciones / Negocios Internacionales", t: "8–9 sem.", w: "Universidades" },
    { l: "tecnologica", n: "Tecn. en Negociación Internacional / Comercio Exterior", t: "5–6 sem.", w: "SENA, CUES, Politécnico Costa Atlántica" },
    { l: "tecnica", n: "T.P. en Operaciones de Comercio Exterior", t: "2–3 sem.", w: "IUB, Litoral" },
  ],
  "Educación / Docencia": [
    { l: "profesional", n: "Licenciaturas (infantil, idiomas, matemáticas…)", t: "8–10 sem.", w: "Solo universitaria" },
  ],
  "Trabajo Social": [
    { l: "profesional", n: "Trabajo Social", t: "8–9 sem.", w: "Solo universitaria" },
  ],
  "Biología": [
    { l: "profesional", n: "Biología", t: "8–10 sem.", w: "Solo universitaria" },
  ],
  "Química y Farmacia": [
    { l: "profesional", n: "Química / Química y Farmacia", t: "10 sem.", w: "Universidades" },
    { l: "tecnologica", n: "Tecn. en Regencia de Farmacia", t: "5–6 sem.", w: "UNAD" },
    { l: "tecnica", n: "T.P. en Regencia Farmacéutica; Aux. de Servicios Farmacéuticos", t: "2–3 sem.", w: "U. del Tolima, SENA" },
  ],
  "Veterinaria": [
    { l: "profesional", n: "Medicina Veterinaria y Zootecnia", t: "10 sem.", w: "Solo universitaria" },
  ],
  "Agronomía": [
    { l: "profesional", n: "Agronomía / Ing. Agroindustrial", t: "9–10 sem.", w: "Universidades" },
    { l: "tecnologica", n: "Tecn. en Producción / Transformación Agropecuaria", t: "5–6 sem.", w: "SENA, U. del Atlántico" },
    { l: "tecnica", n: "Técnicos agropecuarios", t: "2–3 sem.", w: "SENA, U. del Atlántico" },
  ],
  "Gastronomía": [
    { l: "profesional", n: "Gastronomía", t: "8 sem.", w: "La Sabana, Colegio Mayor de Antioquia" },
    { l: "tecnologica", n: "Tecnología en Gastronomía", t: "5–6 sem.", w: "SENA" },
    { l: "tecnica", n: "Técnico en Cocina", t: "2–3 sem.", w: "SENA" },
  ],
  "Turismo y Hotelería": [
    { l: "profesional", n: "Adm. de Empresas Turísticas y Hoteleras", t: "8–9 sem.", w: "Externado, U. del Atlántico, UAC, CUC" },
    { l: "tecnologica", n: "Tecn. en Gestión Turística / Hotelera", t: "5–6 sem.", w: "U. del Atlántico, SENA" },
    { l: "tecnica", n: "T.P. en Operación Turística", t: "2–3 sem.", w: "U. del Atlántico, SENA" },
  ],
  "Fisioterapia": [
    { l: "profesional", n: "Fisioterapia", t: "9–10 sem.", w: "Solo universitaria" },
  ],
  "Odontología": [
    { l: "profesional", n: "Odontología", t: "10 sem.", w: "Universidades" },
    { l: "tecnica", n: "Auxiliar en Salud Oral (técnico laboral)", t: "2–3 sem.", w: "Institutos de salud" },
  ],
  "Recursos Humanos": [
    { l: "profesional", n: "Gestión Humana / Adm. en Seguridad y Salud en el Trabajo", t: "8–9 sem.", w: "UNIMINUTO, EAN" },
    { l: "tecnologica", n: "Tecn. en Gestión del Talento Humano / SST", t: "5–6 sem.", w: "SENA, IUB" },
    { l: "tecnica", n: "Técnico en Recursos Humanos", t: "2 sem.", w: "SENA" },
  ],
  "Ciencias del Deporte": [
    { l: "profesional", n: "Lic. en Educación Física / Deporte y Cultura Física", t: "8–9 sem.", w: "UPN, U. del Atlántico, UAC" },
    { l: "tecnica", n: "Técnico en Entrenamiento Deportivo", t: "2–3 sem.", w: "SENA" },
  ],
};
