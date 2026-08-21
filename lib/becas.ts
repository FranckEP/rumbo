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
    n: "Matrícula Cero",
    tag: "Nacional",
    d: "La política de gratuidad del Gobierno: cubre el 100% de la matrícula de pregrado en las instituciones públicas del país. Dirigida a hogares de menores ingresos (estratos 1, 2 y 3) y con pocos requisitos.",
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
    n: "Sapiencia — Matrícula Cero Medellín",
    tag: "Medellín",
    d: "La Alcaldía financia matrícula en instituciones públicas de la ciudad y ofrece créditos condonables. Es uno de los programas municipales más grandes del país, con decenas de miles de cupos cada semestre.",
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
    d: "Créditos con líneas como «Tú eliges» (pagas poco mientras estudias), becas, subsidios y fondos especiales para comunidades étnicas, víctimas, docentes y mejores bachilleres. Abre convocatoria cada semestre.",
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
