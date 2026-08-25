import { useMemo } from "react";
import { BECAS, type Beca } from "@/lib/becas";
import { DEPARTAMENTOS } from "@/lib/instituciones";
import Dropdown, { type Opcion } from "./Dropdown";
import { LinkOutIcon, PinIcon } from "./icons";
import UniBecas from "./UniBecas";

interface Props {
  /** departamento activo, compartido con la pestaña Carreras */
  deptFilter: string;
  onDepto: (v: string) => void;
}

const OPC_DEPTO: Opcion[] = [
  { v: "all", t: "Todo el país" },
  ...DEPARTAMENTOS.map((d) => ({ v: d, t: d })),
];

/* Los nombres largos no caben en la píldora; la lista sí los muestra enteros. */
const DEPT_CORTO: Record<string, string> = {
  "Archipiélago de San Andrés, Providencia y Santa Catalina": "San Andrés",
  "Bogotá, D.C.": "Bogotá",
};

/**
 * Cómo pagar la carrera.
 *
 * Se agrupa por **quién da la ayuda**, que es lo accionable: dice a qué puerta
 * hay que ir a tocar. Y cada beca responde las mismas tres preguntas en el
 * mismo orden, para poder descartarlas de un vistazo.
 *
 * El filtro de departamento vive aquí además de en Carreras. Antes había que
 * volver a la otra pestaña para cambiarlo, y la mitad de esta vista depende de
 * él: mandarte a otro sitio a ajustar lo que estás mirando no tiene sentido.
 */
export default function Becas({ deptFilter, onDepto }: Props) {
  const hayDepto = deptFilter !== "all";

  const nacionales = BECAS.filter((b) => b.grupo === "nacional");
  const creditos = BECAS.filter((b) => b.grupo === "credito");

  const regionales = useMemo(
    () =>
      BECAS.filter(
        (b) => b.grupo === "region" && (!hayDepto || b.depts?.includes(deptFilter))
      ),
    [hayDepto, deptFilter]
  );

  return (
    <div className="tab-panel">
      {/* La entradilla y el filtro comparten banda. Sueltos, el parrafo
          quedaba cortado a media anchura con un vacio enorme a la derecha:
          el limite de caracteres por linea es bueno para leer, pero encima de
          un contenedor mucho mas ancho parece que el texto se trunco. Con el
          filtro al otro lado, la banda se completa y el hueco pasa a ser
          separacion entre dos cosas, no un final abrupto. */}
      <div className="becas-intro">
        <p className="tab-lede">
          Casi nadie paga el precio de lista. Estas ayudas se combinan: puedes tener la matrícula
          cubierta por el Estado y encima un descuento de la universidad.
        </p>

        <div className="filter-row">
          <Dropdown
            icono={<PinIcon />}
            titulo="Ayudas en"
            aria="Filtrar las becas por departamento"
            valor={deptFilter}
            etiqueta={hayDepto ? DEPT_CORTO[deptFilter] ?? deptFilter : "Todo el país"}
            activo={hayDepto}
            opciones={OPC_DEPTO}
            onCambio={onDepto}
          />
        </div>
      </div>

      {/* Lo primero es cuánto cuesta según a dónde entres: sin esa referencia,
          las ayudas de abajo no tienen contra qué compararse. */}
      <section className="cuanto" aria-label="Cuánto cuesta según dónde estudies">
        <div className="cuanto-cel">
          <span className="cuanto-donde">Universidad pública</span>
          <b className="cuanto-precio">$0</b>
          <span className="cuanto-nota">Con Matrícula Cero, si eres de estrato 1, 2 o 3.</span>
        </div>
        <div className="cuanto-cel">
          <span className="cuanto-donde">SENA</span>
          <b className="cuanto-precio">$0</b>
          <span className="cuanto-nota">Siempre, sin requisitos de estrato.</span>
        </div>
        <div className="cuanto-cel">
          <span className="cuanto-donde">Universidad privada</span>
          <b className="cuanto-precio">−15% a −100%</b>
          <span className="cuanto-nota">Casi todas descuentan por mérito o por tu situación.</span>
        </div>
      </section>

      <Grupo titulo="Del Gobierno Nacional" nota="Aplican en todo el país.">
        <div className={`becas-grid${nacionales.length === 1 ? " una" : ""}`}>
          {nacionales.map((b) => (
            <Tarjeta b={b} key={b.n} />
          ))}
        </div>
      </Grupo>

      <Grupo
        titulo={hayDepto ? `En ${deptFilter}` : "De tu ciudad o departamento"}
        nota={
          hayDepto
            ? "Programas de la alcaldía o la gobernación de tu zona."
            : "Elige un departamento arriba y aquí quedan solo los tuyos."
        }
      >
        {regionales.length > 0 ? (
          <div className={`becas-grid${regionales.length === 1 ? " una" : ""}`}>
            {regionales.map((b) => (
              <Tarjeta b={b} key={b.n} />
            ))}
          </div>
        ) : (
          <p className="beca-vacio">
            No tenemos programas registrados para {deptFilter}. Pregunta igual en la alcaldía y en
            la gobernación: casi todas tienen fondos de educación superior aunque no los publiquen
            bien.
          </p>
        )}
      </Grupo>

      {/* Antes aquí salían «las universidades que miraste», y salía vacío casi
          siempre: al elegir una en Carreras la app te lleva a su página, así
          que no se volvía a esta pestaña con visitas guardadas. La lista con
          buscador sí deja llegar a la institución que a uno le interesa. */}
      <UniBecas deptFilter={deptFilter} />

      <Grupo titulo="Créditos" nota="Esto sí se devuelve. Míralo cuando lo de arriba no alcance.">
        <div className={`becas-grid${creditos.length === 1 ? " una" : ""}`}>
          {creditos.map((b) => (
            <Tarjeta b={b} key={b.n} />
          ))}
        </div>
      </Grupo>
    </div>
  );
}

function Grupo({
  titulo,
  nota,
  children,
}: {
  titulo: string;
  nota: string;
  children: React.ReactNode;
}) {
  return (
    <section className="beca-group">
      <div className="group-rule">
        <span className="eyebrow">{titulo}</span>
        <i />
      </div>
      <p className="group-nota">{nota}</p>
      {children}
    </section>
  );
}

/** Siempre las mismas tres preguntas, siempre en el mismo sitio. */
function Tarjeta({ b }: { b: Beca }) {
  return (
    <article className="beca">
      <div className="beca-tags">
        <span className={`beca-tag${b.gratis ? " beca-tag-free" : ""}`}>{b.cobertura}</span>
        <span className="beca-scope">{b.tag}</span>
      </div>
      <h4>{b.n}</h4>
      {/* Cada pregunta va envuelta en un <div> (el HTML lo permite dentro de
          <dl>). Sin eso, al repartir la lista en columnas el grid colocaba
          dt y dd en celdas sueltas y las preguntas salían desordenadas:
          «Para quién», «Cuándo», «Qué necesitas». */}
      <dl className="beca-dl">
        <div className="beca-par">
          <dt>Para quién</dt>
          <dd>{b.paraQuien}</dd>
        </div>
        <div className="beca-par">
          <dt>Qué necesitas</dt>
          <dd>{b.queNecesitas}</dd>
        </div>
        {b.cuando && (
          <div className="beca-par">
            <dt>Cuándo</dt>
            <dd>{b.cuando}</dd>
          </div>
        )}
      </dl>
      <a href={b.url} target="_blank" rel="noopener">
        {b.linkText} <LinkOutIcon />
      </a>
    </article>
  );
}
