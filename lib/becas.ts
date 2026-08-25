/**
 * Ayudas para pagar el pregrado.
 *
 * Cada beca responde SIEMPRE las mismas tres preguntas, en el mismo orden:
 * qué cubre, para quién es y qué hay que cumplir. Antes cada una era un
 * párrafo suelto y no se podían comparar entre sí: había que leerlas enteras
 * para darse cuenta de si aplicaban o no. Con la estructura fija se leen en
 * diagonal y se descartan rápido las que no van con uno, que es lo que de
 * verdad hace falta cuando se están mirando ocho.
 */

/** Quién la da. Determina dónde se pide, que es lo que hay que saber. */
export type BecaGrupo = "nacional" | "region" | "credito";

export interface Beca {
  /** título */
  n: string;
  /** qué cubre, corto: va en el distintivo */
  cobertura: string;
  /** dónde aplica */
  tag: string;
  /** a quién va dirigida */
  paraQuien: string;
  /** requisitos concretos */
  queNecesitas: string;
  /** cuándo se pide, si se sabe */
  cuando?: string;
  /** texto del enlace */
  linkText: string;
  url: string;
  grupo: BecaGrupo;
  /** no cuesta nada: se destaca */
  gratis?: boolean;
  /** departamentos donde aplica; ausente = todo el país.
   *  Los nombres tienen que coincidir EXACTOS con los del SNIES
   *  (`lib/snies/instituciones.json`), incluida la coma de «Bogotá, D.C.». */
  depts?: string[];
}

export const BECAS: Beca[] = [
  {
    n: "Matrícula Cero",
    cobertura: "100% de la matrícula",
    tag: "Todo el país",
    paraQuien:
      "Quien entre a una universidad o institución pública. Es la ayuda que más gente usa en Colombia y la primera que hay que mirar.",
    queNecesitas:
      "Estar admitido en una institución pública y venir de un hogar de estratos 1, 2 o 3. No pide promedio alto ni puntaje del Icfes.",
    cuando: "Se aplica al matricularte: no hay que postularse aparte.",
    linkText: "Ministerio de Educación",
    url: "https://www.mineducacion.gov.co",
    grupo: "nacional",
    gratis: true,
  },
  {
    n: "SENA",
    cobertura: "Gratis, siempre",
    tag: "Todo el país",
    paraQuien:
      "Quien quiera un técnico o un tecnólogo, presencial o virtual, en cualquier parte del país. Incluye práctica con contrato de aprendizaje.",
    queNecesitas:
      "Ser bachiller para los programas tecnológicos; varios técnicos piden solo hasta noveno. La inscripción es en línea.",
    cuando: "Abre convocatorias varias veces al año.",
    linkText: "Oferta del SENA",
    url: "https://oferta.senasofiaplus.edu.co",
    grupo: "nacional",
    gratis: true,
  },
  {
    n: "Jóvenes a la U — ATENEA",
    cobertura: "100% de la matrícula",
    tag: "Bogotá",
    paraQuien: "Bachilleres de Bogotá, para estudiar en universidades aliadas del Distrito.",
    queNecesitas: "Residir en Bogotá y postularte cuando abra la convocatoria.",
    cuando: "Varias convocatorias al año.",
    linkText: "Agencia ATENEA",
    url: "https://agenciaatenea.gov.co",
    grupo: "region",
    gratis: true,
    depts: ["Bogotá, D.C."],
  },
  {
    n: "Sapiencia — Medellín",
    cobertura: "Matrícula cubierta",
    tag: "Antioquia",
    paraQuien:
      "Jóvenes de Medellín, para estudiar en instituciones públicas de la ciudad. Es uno de los programas municipales más grandes del país, con decenas de miles de cupos cada semestre.",
    queNecesitas: "Residir en Medellín y postularte en la convocatoria. También ofrece créditos condonables.",
    linkText: "Sapiencia",
    url: "https://sapiencia.gov.co",
    grupo: "region",
    depts: ["Antioquia"],
  },
  {
    n: "Distrito de Barranquilla",
    cobertura: "Hasta el 100%",
    tag: "Atlántico",
    paraQuien:
      "Bachilleres de colegios de Barranquilla. Incluye programas como IUB al Barrio, con matrícula completa.",
    queNecesitas: "Ser egresado de un colegio de la ciudad. Los requisitos exactos cambian con cada convocatoria.",
    linkText: "Alcaldía de Barranquilla",
    url: "https://www.barranquilla.gov.co",
    grupo: "region",
    depts: ["Atlántico"],
  },
  {
    n: "Gobernación del Atlántico",
    cobertura: "Apoyo parcial",
    tag: "Atlántico",
    paraQuien: "Jóvenes del Atlántico que estudien dentro del departamento. Son apoyos parciales, no matrícula completa.",
    queNecesitas:
      "Depende de la convocatoria. Suele pedir estrato bajo y buen puntaje en Saber 11; a veces incluye transporte y alimentación.",
    linkText: "Gobernación del Atlántico",
    url: "https://www.atlantico.gov.co",
    grupo: "region",
    depts: ["Atlántico"],
  },
  {
    n: "ICETEX",
    cobertura: "Crédito, no beca",
    tag: "Todo el país",
    paraQuien:
      "Quien necesita financiar una privada, o el sostenimiento en una pública. También maneja fondos y becas para comunidades étnicas, víctimas, docentes y mejores bachilleres.",
    queNecesitas:
      "Estar admitido, un deudor solidario y cumplir el puntaje de Sisbén de la línea. Con «Tú eliges» pagas poco mientras estudias, y algunas líneas condonan parte de la deuda si te gradúas a tiempo.",
    cuando: "Convocatoria cada semestre.",
    linkText: "Portal del ICETEX",
    url: "https://web.icetex.gov.co",
    grupo: "credito",
  },
];

export const GRUPO_TITULOS: Record<BecaGrupo, string> = {
  nacional: "Del Gobierno Nacional",
  region: "De tu ciudad o departamento",
  credito: "Créditos",
};
