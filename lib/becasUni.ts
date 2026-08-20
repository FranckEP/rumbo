/** Becas y ayudas de pregrado que ofrece cada institución.
 *  Las claves son las mismas de UNIS (lib/universities.ts), así que la lista
 *  hereda el nombre, el sitio oficial y los departamentos de allí. */
export interface BecaUni {
  /** programas de beca */
  p: string[];
  /** cobertura y criterios principales */
  c: string;
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
    p: ["Orgullo Caribe", "Mejor Icfes (hasta 100%)", "Marvel Moreno (50%)", "Álvaro Jaramillo Vengoechea (hasta 80%)", "Profesor Alberto Assa (50%)"],
    c: "Cobertura del 20% al 100% en matrícula e idiomas para bachilleres del Caribe con excelencia y necesidad socioeconómica; incluye incentivo para mujeres en STEM.",
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
    p: ["Excelencia académica", "Exención por primer puesto", "Descuentos por convenio o familiares"],
    c: "Exoneración del 50% al 100% de la matrícula para los mejores promedios acumulados en cada seccional.",
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
    p: ["Gratuidad estatal", "Exención por promedio académico", "Apoyos de alimentación y transporte"],
    c: "Cubrimiento completo de los derechos de matrícula por política del Estado; exenciones por primer puesto en cada programa.",
  },
  unisimon: {
    p: ["Excelencia Simón Bolívar", "Deportivas y culturales", "Auxilios socioeconómicos"],
    c: "Deducciones en el valor del semestre por puntajes altos en Saber 11 e incentivos para deportistas de selección y gestores culturales.",
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
    p: ["Excelencia académica", "Deportivo-culturales", "Descuentos por convenios colectivos"],
    c: "Reducciones del 15% al 50% en la matrícula para estudiantes con méritos académicos sobresalientes o representación en competencias nacionales.",
  },
  cuc: {
    p: ["Excelencia CUC", "Mérito investigativo y deportivo", "Descuentos socioeconómicos"],
    c: "Exenciones de matrícula asignadas por desempeño en Saber 11 e integración activa a los semilleros de investigación de la institución.",
  },
  unimetro: {
    p: ["Mérito académico en salud", "Auxilios socioeconómicos", "Descuentos por convenios marco"],
    c: "Descuentos parciales sobre la matrícula para estudiantes con promedios altos en carreras de la salud que demuestren necesidad financiera.",
  },
  iub: {
    p: ["Gratuidad estatal", "Becas Alcaldía de Barranquilla (PML)", "Estímulos por promedio académico"],
    c: "Matrícula cubierta al 100% combinando recursos del Gobierno Nacional y programas sociales del Distrito de Barranquilla.",
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
    p: ["Socioeconómicas Padre García-Herreros", "Excelencia académica", "Descuentos por alianzas sociales"],
    c: "Subsidios directos y reducciones del costo de la matrícula ordinaria para comunidades de ingresos bajos en todo el país.",
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
    p: ["Excelencia académica", "Auxilios financieros institucionales", "Descuentos por convenios sociales"],
    c: "Reducciones en la matrícula por rendimiento escolar superior y apoyos financieros para garantizar la permanencia estudiantil.",
  },
  cues: {
    p: ["Mérito académico", "Auxilios socioeconómicos", "Descuentos por convenio empresarial"],
    c: "Descuentos sobre el valor del semestre por promedio alto de secundaria y por vínculos con organizaciones empresariales de la región.",
  },
  pca: {
    p: ["Rendimiento académico", "Descuentos por convenios empresariales"],
    c: "Planes de descuento y estímulos económicos parciales para estudiantes de programas técnicos, tecnológicos y profesionales.",
  },
  litoral: {
    p: ["Inclusión educativa", "Descuentos por convenios socioeconómicos"],
    c: "Subsidios parciales de matrícula orientados a la formación técnica profesional de jóvenes en condición de vulnerabilidad.",
  },
  reformada: {
    p: ["Vocacionales y servicio social", "Excelencia académica", "Descuentos institucionales"],
    c: "Becas parciales asignadas por rendimiento académico y por vinculación a proyectos de desarrollo comunitario e impacto social.",
  },
  sanmartin: {
    p: ["Excelencia académica", "Descuentos por convenios y familiares"],
    c: "Descuentos sobre el valor de la matrícula para estudiantes regulares que se destaquen por promedio académico ponderado.",
  },
  cul: {
    p: ["Mérito académico", "Descuentos institucionales y auxilios"],
    c: "Deducciones porcentuales de matrícula para estudiantes de alto rendimiento y recursos económicos limitados.",
  },
  unicorsalud: {
    p: ["Excelencia académica en salud", "Auxilios socioeconómicos"],
    c: "Exención parcial para estudiantes con promedios destacados en las carreras del área de la salud y las ciencias de la vida.",
  },
};
