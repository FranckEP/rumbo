/* Universidades en Colombia (sitio oficial) */

export const SNIES_URL = "https://hecaa.mineducacion.gov.co/consultaspublicas/programas";

/** [nombre, sitio oficial, departamentos con sede principal/seccional]
 *  "*" = presencia en todo el país */
export type Uni = readonly [string, string, readonly string[]];

export const UNIS: Record<string, Uni> = {
  unal: ["U. Nacional de Colombia", "https://unal.edu.co", ["Bogotá D.C.", "Antioquia", "Caldas", "Valle del Cauca"]],
  andes: ["U. de los Andes", "https://uniandes.edu.co", ["Bogotá D.C."]],
  javeriana: ["Pontificia U. Javeriana", "https://www.javeriana.edu.co", ["Bogotá D.C.", "Valle del Cauca"]],
  udea: ["U. de Antioquia", "https://www.udea.edu.co", ["Antioquia"]],
  univalle: ["U. del Valle", "https://www.univalle.edu.co", ["Valle del Cauca"]],
  rosario: ["U. del Rosario", "https://www.urosario.edu.co", ["Bogotá D.C."]],
  externado: ["U. Externado de Colombia", "https://www.uexternado.edu.co", ["Bogotá D.C."]],
  eafit: ["U. EAFIT", "https://www.eafit.edu.co", ["Antioquia"]],
  uninorte: ["U. del Norte", "https://www.uninorte.edu.co", ["Atlántico"]],
  uis: ["U. Industrial de Santander", "https://www.uis.edu.co", ["Santander"]],
  upb: ["U. Pontificia Bolivariana", "https://www.upb.edu.co", ["Antioquia", "Santander", "Córdoba"]],
  sabana: ["U. de La Sabana", "https://www.unisabana.edu.co", ["Cundinamarca"]],
  icesi: ["U. Icesi", "https://www.icesi.edu.co", ["Valle del Cauca"]],
  distrital: ["U. Distrital", "https://www.udistrital.edu.co", ["Bogotá D.C."]],
  upn: ["U. Pedagógica Nacional", "https://www.upn.edu.co", ["Bogotá D.C."]],
  utp: ["U. Tecnológica de Pereira", "https://www.utp.edu.co", ["Risaralda"]],
  sena: ["SENA", "https://www.sena.edu.co", ["*"]],
  tadeo: ["U. Jorge Tadeo Lozano", "https://www.utadeo.edu.co", ["Bogotá D.C."]],
  bosque: ["U. El Bosque", "https://www.unbosque.edu.co", ["Bogotá D.C."]],
  ces: ["U. CES", "https://www.ces.edu.co", ["Antioquia"]],
  lasalle: ["U. de La Salle", "https://www.lasalle.edu.co", ["Bogotá D.C."]],
  escuelaing: ["Escuela Colombiana de Ingeniería", "https://www.escuelaing.edu.co", ["Bogotá D.C."]],
  konrad: ["Fund. U. Konrad Lorenz", "https://www.konradlorenz.edu.co", ["Bogotá D.C."]],
  magdalena: ["U. del Magdalena", "https://www.unimagdalena.edu.co", ["Magdalena"]],
  poli: ["Politécnico Grancolombiano", "https://www.poli.edu.co", ["Bogotá D.C.", "Antioquia"]],
  uao: ["U. Autónoma de Occidente", "https://www.uao.edu.co", ["Valle del Cauca"]],
  cesa: ["CESA", "https://www.cesa.edu.co", ["Bogotá D.C."]],
  unilibre: ["U. Libre", "https://www.unilibre.edu.co", ["Bogotá D.C.", "Atlántico", "Valle del Cauca"]],
  umng: ["U. Militar Nueva Granada", "https://www.umng.edu.co", ["Bogotá D.C.", "Cundinamarca"]],
  uptc: ["UPTC", "https://www.uptc.edu.co", ["Boyacá"]],
  colmayor: ["Colegio Mayor de Antioquia", "https://www.colmayor.edu.co", ["Antioquia"]],
  ean: ["U. EAN", "https://universidadean.edu.co", ["Bogotá D.C."]],
  udca: ["U.D.C.A", "https://www.udca.edu.co", ["Bogotá D.C."]],
  uniatlantico: ["U. del Atlántico", "https://www.uniatlantico.edu.co", ["Atlántico"]],
  unisimon: ["U. Simón Bolívar", "https://www.unisimon.edu.co", ["Atlántico"]],
  unicartagena: ["U. de Cartagena", "https://unicartagena.edu.co", ["Bolívar"]],
  unab: ["U. Autónoma de Bucaramanga", "https://unab.edu.co", ["Santander"]],
  unicordoba: ["U. de Córdoba", "https://www.unicordoba.edu.co", ["Córdoba"]],
  unicauca: ["U. del Cauca", "https://www.unicauca.edu.co", ["Cauca"]],
  uac: ["U. Autónoma del Caribe", "https://www.uac.edu.co", ["Atlántico"]],
  cuc: ["U. de la Costa (CUC)", "https://www.cuc.edu.co", ["Atlántico"]],
  unimetro: ["U. Metropolitana", "https://www.unimetro.edu.co", ["Atlántico"]],
  iub: ["Institución U. de Barranquilla", "https://www.unibarranquilla.edu.co", ["Atlántico"]],
  utb: ["U. Tecnológica de Bolívar", "https://www.utb.edu.co", ["Bolívar"]],
  curn: ["Corp. U. Rafael Núñez", "https://www.curn.edu.co", ["Bolívar"]],
  comfenalco: ["Tecnológico Comfenalco", "https://www.tecnologicocomfenalco.edu.co", ["Bolívar"]],
  unisinu: ["U. del Sinú", "https://www.unisinu.edu.co", ["Córdoba", "Bolívar"]],
  unicesar: ["U. Popular del Cesar", "https://www.unicesar.edu.co", ["Cesar"]],
  udes: ["U. de Santander (UDES)", "https://www.udes.edu.co", ["Santander", "Cesar"]],
  areandina: ["Areandina", "https://www.areandina.edu.co", ["Bogotá D.C.", "Cesar", "Risaralda"]],
  unisucre: ["U. de Sucre", "https://www.unisucre.edu.co", ["Sucre"]],
  cecar: ["CECAR", "https://cecar.edu.co", ["Sucre"]],
  uniguajira: ["U. de La Guajira", "https://www.uniguajira.edu.co", ["La Guajira"]],
  ucc: [
    "U. Cooperativa de Colombia",
    "https://www.ucc.edu.co",
    ["Bogotá D.C.", "Antioquia", "Magdalena", "Córdoba", "Cesar", "Santander", "Valle del Cauca"],
  ],
  sergio: ["U. Sergio Arboleda", "https://www.usergioarboleda.edu.co", ["Bogotá D.C.", "Magdalena", "Atlántico"]],
  unad: ["UNAD (pública, virtual)", "https://www.unad.edu.co", ["*"]],
  uniminuto: ["UNIMINUTO", "https://www.uniminuto.edu", ["*"]],
  esap: ["ESAP (pública)", "https://www.esap.edu.co", ["*"]],
  utolima: ["U. del Tolima (convenio Atlántico)", "https://ut.edu.co", ["Tolima", "Atlántico"]],
  americana: ["Corp. U. Americana", "https://americana.edu.co", ["Atlántico", "Antioquia", "Córdoba"]],
  cues: ["U. Empresarial de Salamanca (CUES)", "https://www.unisalamanca.edu.co", ["Atlántico"]],
  pca: ["Politécnico Costa Atlántica", "https://www.pca.edu.co", ["Atlántico"]],
  litoral: ["Corp. Educativa del Litoral", "https://litoral.edu.co", ["Atlántico"]],
  reformada: ["Corp. U. Reformada", "https://www.unireformada.edu.co", ["Atlántico"]],
  sanmartin: ["Fund. U. San Martín", "https://www.sanmartin.edu.co", ["Atlántico", "Bogotá D.C."]],
  cul: ["Corp. U. Latinoamericana (CUL)", "https://ul.edu.co", ["Atlántico"]],
  unicorsalud: ["Unicorsalud", "https://unicorsalud.edu.co", ["Atlántico"]],
};

/** Instituciones oficiales (públicas). El resto de UNIS es privado.
 *  Importa para el joven: en las públicas la matrícula puede costar $0
 *  por la política de gratuidad. */
const PUBLICAS = new Set([
  "unal", "udea", "univalle", "uis", "distrital", "upn", "utp", "sena",
  "magdalena", "uptc", "colmayor", "uniatlantico", "unicartagena",
  "unicordoba", "unicauca", "iub", "unicesar", "unisucre", "uniguajira",
  "unad", "esap", "utolima", "umng",
]);

export type Sector = "publica" | "privada";

export function sectorDe(id: string): Sector {
  return PUBLICAS.has(id) ? "publica" : "privada";
}

export const SECTOR_LABEL: Record<Sector, string> = {
  publica: "Pública",
  privada: "Privada",
};

export const DEPTS: string[] = [
  ...new Set(Object.values(UNIS).flatMap((u) => u[2]).filter((d) => d !== "*")),
].sort((a, b) => a.localeCompare(b, "es"));
