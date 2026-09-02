import type { Metadata } from "next";
import SiteHeader from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Términos de uso — Rumbo",
  description:
    "Condiciones de uso de Rumbo: qué puedes hacer con la herramienta, qué no, y cómo se tratan tus datos.",
};

const ACTUALIZADO = "25 de agosto de 2026";

/**
 * Términos de uso.
 *
 * Escritos para que los entienda un joven de once, no para que los entienda un
 * abogado. Si una cláusula no se puede explicar en una frase corta, es que no
 * hacía falta. Lo que sí importa que quede claro: la herramienta es gratis y
 * de uso libre, el código no; los datos son de referencia y hay que verificar
 * en la fuente; y no se recoge ningún dato personal.
 */
export default function Terminos() {
  return (
    <>
      <div className="shell">
        <SiteHeader />

        <section className="screen legal">
          <a className="back-link" href="/">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M10 3.5 5.5 8l4.5 4.5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Volver a Rumbo
          </a>

          <h1>Términos de uso</h1>
          <p className="legal-fecha">Última actualización: {ACTUALIZADO}</p>

          <p className="legal-lede">
            Rumbo es una herramienta de orientación vocacional gratuita, hecha para jóvenes de
            Colombia. Estos términos están escritos para que se entiendan. Si algo no queda claro,
            escribe y se aclara.
          </p>

          <h2>1. Puedes usarla, y es gratis</h2>
          <p>
            Cualquier persona puede usar Rumbo sin pagar, sin registrarse y sin pedir permiso.
            Colegios, docentes, orientadores, secretarías de educación y organizaciones pueden
            recomendarla, proyectarla en clase, compartir el enlace e imprimir los resultados para
            trabajar con sus estudiantes. Eso es justo para lo que se hizo.
          </p>

          <h2>2. Lo que no puedes hacer</h2>
          <ul>
            <li>Copiar el código, los textos o los datos para publicar tu propia versión.</li>
            <li>Venderla, revenderla ni cobrar por acceder a ella.</li>
            <li>Presentarla como propia o quitarle la autoría.</li>
            <li>Usar su contenido dentro de otro producto sin autorización escrita.</li>
          </ul>
          <p>
            El código, los textos y las bases de datos elaboradas para Rumbo están protegidos por
            derecho de autor. Si quieres integrarla en un programa institucional o adaptarla, pide
            autorización: la respuesta casi siempre va a ser que sí.
          </p>

          <h2>3. El resultado es una guía, no un veredicto</h2>
          <p>
            Rumbo aplica el modelo RIASEC de John L. Holland, que describe intereses, no
            capacidades ni destino. El resultado sirve para explorar y para conversar con tu
            familia, tus profesores y gente que ya trabaja en lo que te llama la atención. No
            sustituye a un orientador profesional ni decide por ti.
          </p>

          <h2>4. Los datos son de referencia: verifica siempre</h2>
          <p>
            La información de instituciones y programas proviene del SNIES del Ministerio de
            Educación Nacional. Las becas se revisaron contra el sitio oficial de cada institución
            y cada ficha muestra la fecha en que se comprobó.
          </p>
          <p>
            <strong>
              Aun así, las convocatorias, los requisitos, las duraciones y los costos cambian.
            </strong>{" "}
            Antes de tomar cualquier decisión, confirma en el sitio oficial de la institución y
            verifica el registro calificado del programa en el SNIES. Rumbo no se hace responsable
            de decisiones tomadas solo con lo que aparece aquí.
          </p>

          <h2>5. Tus respuestas no salen de tu dispositivo</h2>
          <p>
            No hay cuentas, ni correo, ni contraseñas. Todo el test se calcula en tu navegador. Si
            sales a la mitad, tu avance se guarda únicamente en tu propio dispositivo y puedes
            borrarlo repitiendo el test o limpiando los datos del navegador.
          </p>
          <p>
            <strong>No recogemos ningún dato personal.</strong> Ni nombre, ni edad, ni colegio, ni
            correo, ni tus respuestas. Por eso no hay tratamiento de datos personales que
            autorizar. Si esto cambiara alguna vez, se avisará aquí y en la portada antes de que
            ocurra.
          </p>

          <h2>6. Enlaces a otros sitios</h2>
          <p>
            Rumbo enlaza a sitios de universidades, del ICETEX, del SENA, de alcaldías y
            gobernaciones. Esos sitios tienen sus propias reglas y sus propias políticas de datos.
            No controlamos su contenido ni respondemos por él.
          </p>

          <h2>7. Puede cambiar o dejar de estar disponible</h2>
          <p>
            Es un proyecto personal, gratuito y en desarrollo. Puede cambiar, actualizarse o dejar
            de estar en línea sin aviso previo. Se ofrece tal como está, sin garantías de
            disponibilidad.
          </p>

          <h2>8. Autoría y contacto</h2>
          <p>
            Rumbo fue creado por <strong>Franck Echeverría Peñaloza</strong>. Para permisos,
            convenios con instituciones, correcciones de datos o cualquier otra cosa, escribe a{" "}
            <a href="mailto:franck200402@gmail.com">franck200402@gmail.com</a>.
          </p>

          <p className="legal-cierre">
            © {new Date().getFullYear()} Franck Echeverría Peñaloza. Todos los derechos reservados.
          </p>
        </section>
      </div>
    </>
  );
}
