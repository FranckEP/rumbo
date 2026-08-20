/** Grupos en orden de importancia para alguien que está decidiendo. */
export type BecaGrupo = "empieza" | "region" | "creditos";

export interface Beca {
  /** título */
  n: string;
  /** etiqueta corta (alcance) */
  tag: string;
  /** descripción */
  d: string;
  /** texto del enlace */
  linkText: string;
  url: string;
  grupo: BecaGrupo;
  /** no cuesta nada: aparece bajo el filtro "Gratis" */
  gratis?: boolean;
  /** departamentos donde aplica; ausente = todo el país */
  depts?: string[];
}

export const BECAS: Beca[] = [
  {
    n: "Gratuidad en la matrícula",
    tag: "Nacional",
    d: "Estudiar pregrado en universidades e instituciones públicas sin pagar matrícula. Aplica para la mayoría de jóvenes de estratos 1, 2 y 3.",
    linkText: "Ministerio de Educación",
    url: "https://www.mineducacion.gov.co",
    grupo: "empieza",
    gratis: true,
  },
  {
    n: "SENA — formación gratuita",
    tag: "Nacional",
    d: "Carreras técnicas y tecnológicas 100% gratis en todo el país, presenciales y virtuales, con práctica y contrato de aprendizaje.",
    linkText: "Oferta del SENA",
    url: "https://oferta.senasofiaplus.edu.co",
    grupo: "empieza",
    gratis: true,
  },
  {
    n: "Jóvenes a la U — ATENEA",
    tag: "Bogotá",
    d: "Programa del Distrito para estudiar gratis en universidades aliadas. Convocatorias varias veces al año.",
    linkText: "Agencia ATENEA",
    url: "https://agenciaatenea.gov.co",
    grupo: "region",
    gratis: true,
    depts: ["Bogotá D.C."],
  },
  {
    n: "Sapiencia — becas Medellín",
    tag: "Medellín",
    d: "Becas y créditos condonables de la Alcaldía para tecnólogos y pregrados en instituciones de la ciudad.",
    linkText: "Sapiencia",
    url: "https://sapiencia.gov.co",
    grupo: "region",
    depts: ["Antioquia"],
  },
  {
    n: "Becas del Distrito de Barranquilla",
    tag: "Barranquilla",
    d: "Cupos financiados en instituciones de la ciudad (como Universidad al Barrio con la IUB) y fondos distritales de educación superior.",
    linkText: "Alcaldía de Barranquilla",
    url: "https://www.barranquilla.gov.co",
    grupo: "region",
    depts: ["Atlántico"],
  },
  {
    n: "Gobernación del Atlántico",
    tag: "Atlántico",
    d: "Convocatorias y fondos de acceso a la educación superior para jóvenes atlanticenses, con apoyos de transporte y sostenimiento.",
    linkText: "Gobernación del Atlántico",
    url: "https://www.atlantico.gov.co",
    grupo: "region",
    depts: ["Atlántico"],
  },
  {
    n: "ICETEX — becas y fondos",
    tag: "Nacional",
    d: "Becas, subsidios, créditos condonables y fondos especiales (comunidades étnicas, víctimas, docentes, mejores bachilleres). Convocatorias cada semestre.",
    linkText: "Portal del ICETEX",
    url: "https://web.icetex.gov.co",
    grupo: "creditos",
  },
  {
    n: "Colfuturo — posgrado en el exterior",
    tag: "Más adelante",
    d: "Crédito-beca que condona hasta el 80% para maestrías y doctorados fuera del país. Tenlo en el radar desde ya.",
    linkText: "Colfuturo",
    url: "https://www.colfuturo.org",
    grupo: "creditos",
  },
];

export const GRUPO_TITULOS: Record<BecaGrupo, string> = {
  empieza: "Empieza por aquí",
  region: "Ayudas regionales",
  creditos: "Créditos y fondos",
};
