/** Becas y ayudas de pregrado que ofrece cada institución.
 *  Las claves son las mismas de UNIS (lib/universities.ts), así que la lista
 *  hereda el nombre, el sitio oficial y los departamentos de allí. */
export interface BecaUni {
  /** programas de beca */
  p: string[];
  /** cobertura y criterios principales */
  c: string;
  /** fecha en que se comprobó contra el sitio oficial (AAAA-MM-DD) */
  f?: string;
}

export const BECAS_UNI: Record<string, BecaUni> = {
  unal: {
    p: ["Mejores Bachilleres", "PAES / PEAMA", "Exención de derechos académicos", "Beca Auxiliar Docente", "Movilidad académica"],
    c: "Cobertura total o parcial de matrícula para mejores bachilleres de colegios seleccionados; exención por promedio alto; apoyos por contraprestación docente o investigativa.",
  },
  andes: {
    p: ["Quiero Estudiar", "Beca Preferente", "Ver+ Beca Tech / Geociencias", "Fundación Mazda / Ocmaes", "Decidí / Quiero Enseñar", "Pa'lante Pacífico / Yerly"],
    c: "Cubre entre el 5% y el 95% de la matrícula según necesidad y mérito; Quiero Estudiar pide devolver el 20% de los ingresos tras graduarse; hay becas específicas de STEM y licenciaturas.",
  },
  javeriana: {
    p: ["Excelencia Académica (80%)", "Bachiller Destacado / ACODESI / Fe y Alegría", "Ingresa a la Javeriana (50%)", "Auxilio poblaciones NARP (10%)", "Estímulo Cruz San Pedro Claver", "Descuento hermanos"],
    c: "Exención del 40% al 80% de matrícula por resultado en Saber 11 o promedio ponderado; apoyo por necesidad económica; incentivos por diversidad étnica.",
  },
  udea: {
    p: ["Gratuidad estatal", "Matrícula de Honor (100%)", "Auxilios de Bienestar Universitario", "Monitorías académicas"],
    c: "Matrícula en $0 para estratos 1, 2 y 3; exención completa para el primer puesto de cada programa; subsidios de alimentación y transporte.",
  },
  univalle: {
    p: ["Gratuidad estatal", "Matrícula de Honor", "Monitorías estudiantiles", "Subsidios de sostenimiento"],
    c: "Financiación del 100% de la matrícula bajo la política nacional; exención total por promedios sobresalientes; estímulos económicos por monitoría.",
  },
  rosario: {
    p: ["Mérito URosario (Saber 11)", "Sueño Ser UR - Colsubsidio", "UR Semilla", "Deportista Destacado (90%)", "Becas socioeconómicas", "Alianzas Jóvenes a la E / ATENEA"],
    c: "Cobertura del 30% al 100% según puntaje Saber 11; hasta 95% financiado en alianza con Colsubsidio; modelos de beca parcial más crédito sin interés.",
  },
  externado: {
    p: ["Excelencia académica", "Matrículas de Honor", "Auxilios socioeconómicos", "Descuentos por convenio"],
    c: "Descuentos y exenciones parciales por promedio ponderado destacado, con facilidades de pago e incentivos financieros institucionales.",
  },
  eafit: {
    p: ["Talento y Aliados (40%–100%)", "Rescate - Vamos Pa'lante", "Fundación Fraternidad Medellín", "Sapiencia (Medellín)", "Fondo Amigos de EAFIT"],
    c: "Exención del 40% al 100% de la matrícula combinada con auxilios de sostenimiento; financiación conjunta con empresas e instituciones aliadas.",
  },
  uninorte: {
    p: ["Pro-Excelencia Promigas (100% de toda la carrera)", "Orgullo Caribe (hasta 90%)", "Álvaro Jaramillo Vengoechea (hasta 80%)", "Karl C. Parrish (hasta 80%)", "Excelencia Deportiva (hasta 80%)", "Marvel Moreno (hasta 50%, mujeres)", "Profesor Alberto Assa (50%)", "Hospital Universidad del Norte (20%, Enfermería)", "Comedal (internos de Medicina)"],
    c: "Nueve becas de pregrado, con cobertura del 20% al 100%. Pro-Excelencia Promigas paga la carrera completa a bachilleres de estratos 1 a 3. Jaramillo Vengoechea aplica a todos los programas menos Medicina y Odontología. Marvel Moreno es solo para mujeres en Ingeniería, Economía, Música, Matemáticas y Negocios.",
    f: "2026-08-23",
  },
  uis: {
    p: ["Gratuidad estatal", "Matrícula de Honor por facultad", "Auxiliaturas docentes e investigativas", "Movilidad internacional (AUIP, Alianza Pacífico)"],
    c: "Cobertura total de matrícula por ley estatal; exención semestral por excelencia académica; convenios internacionales de movilidad subsidiada.",
  },
  upb: {
    p: ["Honoris Causa / Excelencia", "Fondo Social UPB", "Descuentos por consanguinidad y convenios"],
    c: "Descuentos parciales y totales sobre la matrícula según promedio académico o puntaje de admisión; auxilios mediante fondo social propio.",
  },
  sabana: {
    p: ["Beca Xperience", "Excelencia Aspirantes", "Promoción socioeconómica", "Fondo Fundación U. de La Sabana"],
    c: "Cobertura parcial o total para aspirantes con desempeño excepcional en pruebas de acceso y Saber 11; becas renovables sujetas a promedio mínimo.",
  },
  icesi: {
    p: ["Icesi A Tu Medida", "Beca Pilas / Liderazgo", "Inclusión socioeconómica", "Descuentos por rendimiento"],
    c: "Exenciones del 25% al 100% del valor del semestre para jóvenes del suroccidente con alto mérito académico e ingresos limitados.",
  },
  distrital: {
    p: ["Gratuidad estatal", "Matrícula de Honor (100%)", "Subsidios de bienestar", "Monitorías académicas"],
    c: "Acceso gratuito bajo la reglamentación nacional; exoneración total de matrícula para los promedios más altos de cada facultad.",
  },
  upn: {
    p: ["Gratuidad estatal", "Exención a promedios sobresalientes", "Monitorías y apoyos estudiantiles"],
    c: "Financiación estatal del 100% de la matrícula ordinaria; exención de pago para estudiantes destacados en programas de licenciatura.",
  },
  utp: {
    p: ["Gratuidad estatal", "Matrícula de Honor", "Becas de trabajo interno", "Bonos de alimentación y transporte"],
    c: "Gratuidad estatal para población elegible; exención de matrícula a los mejores promedios; subsidios gestionados por bienestar universitario.",
  },
  sena: {
    p: ["Formación técnica y tecnológica 100% gratuita", "Apoyos de sostenimiento FIC", "Fondo Emprender"],
    c: "Educación superior técnica y tecnológica sin cobro de matrícula, con subsidios mensuales de sostenimiento para aprendices.",
  },
  tadeo: {
    p: ["Excelencia Académica Tadeo", "Mérito artístico y científico", "Descuentos por convenio"],
    c: "Descuentos de hasta el 50% en la matrícula por promedios destacados y reconocimientos de excelencia en artes, diseño y ciencias.",
  },
  bosque: {
    p: ["Excelencia académica", "Becas Fundacionales El Bosque", "Descuentos para grupo familiar"],
    c: "Descuentos del 10% al 50% sobre la matrícula por rendimiento académico superior y evaluación socioeconómica del comité institucional.",
  },
  ces: {
    p: ["Becas Fundadores CES", "Apoyo socioeconómico", "Convenios financieros"],
    c: "Apoyo en el costo semestral para estudiantes de alto desempeño en salud y ciencias biológicas que presenten vulnerabilidad económica.",
  },
  lasalle: {
    p: ["Lasallistas de Excelencia", "Auxilios San Juan Bautista", "Descuentos por convenio"],
    c: "Coberturas parciales sobre la matrícula para estudiantes nuevos y antiguos; incentivos para formación agronómica y desarrollo rural.",
  },
  escuelaing: {
    p: ["Beca Julio Garavito Armero", "Promoción académica", "Auxilios socioeconómicos"],
    c: "Exención total o parcial de matrícula para los promedios y puntajes Saber 11 más destacados en ingeniería y ciencias aplicadas.",
  },
  konrad: {
    p: ["Excelencia académica", "Mérito investigativo", "Descuentos por hermanos y convenios"],
    c: "Exenciones parciales de matrícula para estudiantes regulares que mantengan los primeros lugares de promedio en su facultad.",
  },
  magdalena: {
    p: ["Gratuidad estatal", "Talento Magdalena", "Rendimiento académico y deporte"],
    c: "Cobertura total de matrícula para los mejores bachilleres de colegios públicos del Magdalena, sumada a la gratuidad estatal.",
  },
  poli: {
    p: ["Excelencia académica", "Fondo Huella Grancolombiana", "Convenios empresariales"],
    c: "Descuentos del 10% al 50% en programas presenciales y virtuales; becas condonables por impacto social comunitario y rendimiento escolar.",
  },
  uao: {
    p: ["Excelencia UAO", "Talento deportivo y cultural", "Auxilios socioeconómicos"],
    c: "Exenciones del 25% al 100% del semestre para bachilleres de alto rendimiento y deportistas destacados a nivel departamental o nacional.",
  },
  cesa: {
    p: ["Mérito CESA", "Fondo de Liderazgo y Emprendimiento", "Auxilios socioeconómicos"],
    c: "Cobertura parcial del semestre en Administración de Empresas para jóvenes con perfil sobresaliente de liderazgo y mérito académico.",
  },
  unilibre: {
    p: ["Becas a la Excelencia (estratos 1 a 3)", "Subsidio del 25% con crédito ICETEX", "Descuento para mayores de 25 años en jornada nocturna", "Descuento por reconocimiento en ciencia, cultura, tecnología o deporte", "Bono por referidos"],
    c: "Las Becas a la Excelencia piden estar en estratos 1, 2 o 3 y haber sido admitido en pregrado. Quien tenga crédito ICETEX y esté en Sisbén 1 a 4 con estrato 1 o 2 recibe además un subsidio del 25% del valor de la matrícula.",
    f: "2026-08-23",
  },
  umng: {
    p: ["Becas de Honor por promedio", "Descuentos fuerza pública y familiares", "Auxilios socioeconómicos"],
    c: "Exención total o parcial por rendimiento académico superior; descuentos especiales para personal activo o retirado del sector defensa.",
  },
  uptc: {
    p: ["Gratuidad estatal", "Matrícula de Honor", "Estímulos deportivos y culturales"],
    c: "Exención de derechos académicos bajo gratuidad nacional; matrícula a costo $0 para los primeros puestos de cada programa.",
  },
  colmayor: {
    p: ["Gratuidad estatal", "Sapiencia / Presupuesto Participativo", "Rendimiento académico"],
    c: "Cobertura del 100% de la matrícula por política estatal más recursos municipales de Medellín para estudiantes en situación vulnerable.",
  },
  ean: {
    p: ["EAN Impacto / Liderazgo", "Excelencia académica", "Descuentos por alianzas"],
    c: "Descuentos del 15% al 50% en la matrícula de pregrado para estudiantes destacados en Saber 11 e innovación emprendedora.",
  },
  udca: {
    p: ["Rendimiento académico", "Responsabilidad social", "Descuentos por grupo familiar"],
    c: "Deducciones sobre el costo semestral para estudiantes sobresalientes en áreas agropecuarias, ambientales y de la salud.",
  },
  uniatlantico: {
    p: ["Gratuidad estatal (100% de la matrícula ordinaria)", "Exención por primer puesto del programa", "Apoyos de alimentación y transporte"],
    c: "Universidad pública: el Gobierno Nacional asume la matrícula ordinaria neta de los estudiantes de pregrado que cumplan el reglamento de gratuidad. Encima hay exenciones por ser el primer promedio de cada programa.",
    f: "2026-08-23",
  },
  unisimon: {
    p: ["Beca del 100% (matrícula de toda la carrera e idiomas)", "Becas por excelencia académica", "Becas creciendo juntos (convenios)"],
    c: "La beca completa cubre el 100% de la matrícula durante toda la carrera y el 100% de los niveles de idiomas exigidos. Las de excelencia piden mantener promedio de 3.5 o 3.8 según la modalidad. Los convenios se gestionan en convenios@unisimon.edu.co.",
    f: "2026-08-23",
  },
  unicartagena: {
    p: ["Gratuidad estatal", "Becas de Honor por rendimiento", "Subsidios de bienestar"],
    c: "Financiación estatal integral bajo la ley de gratuidad; exoneración semestral de matrícula para los promedios más altos por facultad.",
  },
  unab: {
    p: ["Excelencia UNAB", "Mérito deportivo y artístico", "Descuentos institucionales"],
    c: "Descuentos y exenciones acumulables por desempeño en Saber 11 y por representación deportiva o cultural regional.",
  },
  unicordoba: {
    p: ["Gratuidad estatal", "Exención de derechos académicos", "Estímulos por deporte y cultura"],
    c: "Exención del costo de matrícula ordinaria por ley pública; exención adicional por promedio ponderado superior a 4.0 cada período.",
  },
  unicauca: {
    p: ["Gratuidad estatal", "Matrícula de Honor", "Apoyos socioeconómicos de bienestar"],
    c: "Cobertura del 100% de la matrícula bajo normatividad estatal; exoneración de pago para los mejores puntajes semestrales por programa.",
  },
  uac: {
    p: ["Beca de excelencia académica (promedio desde 4.50)", "Descuento para egresados (hasta 10%)", "Descuento para familiares de estudiantes (hasta 10%)", "Convenios institucionales"],
    c: "La Autónoma trabaja con descuentos educativos antes que con becas completas: hasta 10% para egresados y para familiares de estudiantes activos, más la beca de excelencia, que exige promedio acumulado de 4.50 o más.",
    f: "2026-08-23",
  },
  cuc: {
    p: ["La Beca de tu Vida (100% de toda la carrera)", "Beca Talento (hasta 100%)", "Opción Atlántico (hasta 100%)", "Convenios empresariales (15% a 100%)", "BEA Excelencia Académica (50% y 25%)", "Deportistas (25% a 50%)", "Participación cultural (25% a 50%)", "Semilleros de investigación (25% a 50%)", "Minorías y población especial (hasta 50%)", "Grupos familiares, tres hermanos (hasta 50%)", "Primer semestre (hasta 40%)", "Monitores académicos (hasta 15%)", "Hijos de graduados (15%)", "Colegios en convenio (15%)", "Graduados CUC (15%)"],
    c: "Quince becas y descuentos institucionales, muchos acumulables con la matrícula de un solo programa. La Beca de tu Vida cubre el 100% de toda la carrera para egresados recientes de colegios oficiales de Barranquilla con Saber 11 desde 370 puntos. BEA entrega dos cupos del 50% y cuatro del 25% en cada programa.",
    f: "2026-08-23",
  },
  unimetro: {
    p: ["Crédito directo y financiación a largo plazo", "Convenios con ICETEX, bancos, cooperativas y cajas de compensación"],
    c: "No maneja becas propias de pregrado. Lo que ofrece es financiación: crédito reembolsable a largo plazo, en el que la universidad no le cobra la matrícula ordinaria al estudiante y este la paga a través del ICETEX.",
    f: "2026-08-23",
  },
  iub: {
    p: ["Gratuidad estatal (100% de la matrícula ordinaria)", "IUB al Barrio (100%)", "Mayor promedio del programa (100%)", "Logros deportivos, artísticos o de investigación nacionales (100%)", "Monitores destacados (50%)", "Comunidades minoritarias (50%)", "Logros departamentales (30%)", "Prácticas investigativas (20%)", "Grupos artísticos, deportivos y semilleros (15%)", "Beca Inclusión IUB", "Inscripción gratuita para bachilleres de colegios distritales"],
    c: "Institución pública del Distrito, antes conocida como ITSA. La matrícula la cubre la gratuidad estatal y encima hay estímulos escalonados del 15% al 100% por promedio, deporte, arte, investigación y monitorías. Beca Inclusión está dirigida a comunidades afro, indígenas y personas desplazadas.",
    f: "2026-08-23",
  },
  utb: {
    p: ["Premio a la Excelencia UTB", "Premio UTB al Talento Caribe", "Descuentos e incentivos financieros"],
    c: "Cobertura de hasta el 100% del semestre para bachilleres de la Región Caribe con desempeño sobresaliente en Saber 11.",
  },
  curn: {
    p: ["Excelencia académica", "Auxilios socioeconómicos", "Descuentos por convenios educativos"],
    c: "Reducción porcentual de matrícula para graduados con altos promedios escolares y alianzas con instituciones educativas locales.",
  },
  comfenalco: {
    p: ["Becas por afiliación Comfenalco", "Excelencia académica", "Descuentos institucionales"],
    c: "Tarifas preferenciales y exenciones parciales para trabajadores o beneficiarios afiliados a la Caja de Compensación Comfenalco Bolívar.",
  },
  unisinu: {
    p: ["Elías Bechara Zainúm", "Auxilios socioeconómicos", "Descuentos para grupos familiares"],
    c: "Descuentos sobre el costo semestral por rendimiento académico de excelencia y ayudas financieras del programa fundacional.",
  },
  unicesar: {
    p: ["Gratuidad estatal", "Exención por rendimiento", "Estímulos de bienestar universitario"],
    c: "Financiación del 100% de la matrícula con recursos estatales; exención de pago para el promedio más alto de cada programa.",
  },
  udes: {
    p: ["Mérito académico UDES", "Institucionales socioeconómicas", "Descuentos por convenios marco"],
    c: "Descuentos sobre la matrícula por promedio académico superior a la media de la facultad y por alianzas territoriales.",
  },
  areandina: {
    p: ["Excelencia académica", "Descuentos por alianzas regionales", "Apoyos socioeconómicos"],
    c: "Deducciones en la matrícula presencial y virtual por mérito académico acumulado y convenios con organizaciones del sector privado.",
  },
  unisucre: {
    p: ["Gratuidad estatal", "Matrícula de Honor", "Auxilios de alimentación y transporte"],
    c: "Financiación estatal total bajo la política pública de gratuidad; exención de matrícula para los promedios más altos por carrera.",
  },
  cecar: {
    p: ["Excelencia académica", "Auxilios socioeconómicos CECAR", "Descuentos por convenios colectivos"],
    c: "Reducciones del costo semestral asignadas por el comité de becas a estudiantes con promedio superior y limitaciones de ingreso familiar.",
  },
  uniguajira: {
    p: ["Gratuidad estatal", "Ordenanza de subsidio a la matrícula", "Exenciones por excelencia"],
    c: "Gratuidad estatal combinada con aportes de la Gobernación de La Guajira para población vulnerable y comunidades étnicas.",
  },
  ucc: {
    p: ["Solidarias Cooperativas", "Excelencia académica", "Descuentos por convenio colectivo"],
    c: "Descuentos del 10% al 30% en la matrícula por mérito escolar y acuerdos con el sector cooperativo y de la economía solidaria.",
  },
  sergio: {
    p: ["Don Rodrigo Noguera Laborde", "Deportivo-culturales", "Descuentos por convenios"],
    c: "Exenciones del 20% al 80% del semestre para aspirantes con puntajes destacados en Saber 11 o méritos en representación deportiva.",
  },
  unad: {
    p: ["Gratuidad estatal", "Descuentos por convenios (certificado electoral)", "Becas por monitorías"],
    c: "Cobertura total de matrícula a distancia para quienes cumplen los requisitos de gratuidad; convenios acumulables con descuentos adicionales.",
  },
  uniminuto: {
    p: ["Honor Académico (100% del semestre siguiente)", "Socioeconómicas (20% a 35%)", "Espíritu UNIMINUTO (deporte, cultura y servicio social)", "Descuento por convenio", "Descuento por pronto pago"],
    c: "Honor Académico exime la matrícula completa del semestre siguiente a quien tenga el mejor promedio del programa, por encima de 4.5 y sin materias perdidas. Las socioeconómicas van del 20% al 35% para estratos 1 a 3 con promedio sobre 4.0 y 40 horas de servicio social por semestre.",
    f: "2026-08-23",
  },
  esap: {
    p: ["Exención 100% de matrícula", "Becas Ley de Juventudes", "Estímulos académicos especiales"],
    c: "Matrícula subsidiada al 100% en Administración Pública Territorial bajo el régimen normativo de exención estatal especial.",
  },
  utolima: {
    p: ["Gratuidad estatal", "Exenciones por alto rendimiento", "Auxilios de bienestar"],
    c: "Financiación estatal completa del semestre en modalidad presencial y a distancia para estudiantes de estratos 1, 2 y 3.",
  },
  americana: {
    p: ["Mejor promedio del programa (100%)", "Beca de Excelencia, segundo mejor de la facultad (75%)", "Convenio Gobernación del Atlántico (35% a 70%)", "Incentivos deportivos y culturales"],
    c: "El mejor promedio de cada programa queda exento del 100% de la matrícula del periodo siguiente, siempre que haya aprobado todo, no repita ni retire materias y tenga promedio desde 4.2. El segundo mejor de la facultad recibe el 75%.",
    f: "2026-08-23",
  },
  pca: {
    p: ["Becas por solicitud, caso por caso", "Alivios financieros para pregrado", "Descuento por caja de compensación"],
    c: "No publica un listado de becas con nombres y porcentajes: las atiende por solicitud. Sí ofrece alivios financieros y descuentos por caja de compensación. Hay que preguntar en ayuda@pca.edu.co o al 605 319 8672.",
    f: "2026-08-23",
  },
  reformada: {
    p: ["Alicia Winter (100%, mujeres, estudio-trabajo)", "Mérito Académico Estudiante del SER (100% de toda la carrera)", "Talento Especial Iglesia Presbiteriana (50%, Música)", "Inscripción gratuita para estudiantes nuevos"],
    c: "Alicia Winter cubre el 100% hasta por tres periodos a mujeres en situación económica vulnerable, desde quinto semestre y con promedio sobre 4.5. La beca del SER es para egresados del Colegio Americano de Barranquilla con mención de mérito y dura toda la carrera, manteniendo promedio de 3.7.",
    f: "2026-08-23",
  },
  cul: {
    p: ["Descuentos puntuales sobre inscripción y matrícula"],
    c: "No tiene un programa de becas propio. Los descuentos que publica son puntuales y van atados a fechas de inscripción, así que hay que preguntar por la convocatoria que esté abierta.",
    f: "2026-08-23",
  },
  unicorsalud: {
    p: ["Beca del 50% en Ingeniería (primer semestre)", "Beca del 25% en técnicos laborales (primer semestre)", "Cobertura del 20% en los periodos siguientes"],
    c: "Trabaja con becas de entrada: 50% del primer semestre en los programas de Ingeniería y 25% en los técnicos laborales por competencias. De ahí en adelante todos los programas mantienen un 20% sobre el valor de la matrícula. Son convocatorias promocionales: hay que confirmar cuál está abierta.",
    f: "2026-08-23",
  },
};

/** Fecha de comprobación contra el sitio oficial, en formato legible. */
export function comprobadaEl(f?: string): string | undefined {
  if (!f) return undefined;
  const [a, m, d] = f.split("-").map(Number);
  return new Date(a, m - 1, d).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
