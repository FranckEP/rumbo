"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { ChevronIcon } from "./icons";

/**
 * Desplegable propio, en reemplazo del `<select>` nativo.
 *
 * El nativo tenía la ventaja de abrir el selector del sistema en el celular,
 * pero su lista **no se puede diseñar**: `<option>` casi no acepta estilos en
 * ningún navegador, así que el panel salía como cromo del sistema en medio de
 * una interfaz que sí tiene diseño.
 *
 * Esto lo reemplaza sin perder nada de lo que el nativo daba gratis:
 * `role="listbox"`, navegación con flechas, Inicio/Fin, Escape, cierre al
 * tocar fuera y el foco de vuelta al botón. Cuando la lista es larga aparece
 * un buscador, que es lo que reemplaza al *typeahead* del nativo y además
 * sirve en el celular, donde no hay teclado para escribir a ciegas.
 *
 * En pantallas chicas el panel se ancla abajo como hoja, que se alcanza con el
 * pulgar; en escritorio cuelga del botón y se voltea hacia arriba si no cabe.
 */

export interface Opcion {
  v: string;
  t: string;
}

interface Props {
  icono: ReactNode;
  /** qué filtra, en mayúsculas pequeñas sobre el valor */
  titulo: string;
  valor: string;
  /** texto que se muestra: puede ser más corto que el de la opción */
  etiqueta: string;
  opciones: Opcion[];
  onCambio: (v: string) => void;
  /** pinta el control como activo */
  activo?: boolean;
  /** para lectores de pantalla */
  aria: string;
}

/** Desde aquí la lista se vuelve incómoda de recorrer a ojo. */
const UMBRAL_BUSCADOR = 12;

function sinTildes(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export default function Dropdown({
  icono,
  titulo,
  valor,
  etiqueta,
  opciones,
  onCambio,
  activo,
  aria,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const [arriba, setArriba] = useState(false);
  const [busca, setBusca] = useState("");
  const [activa, setActiva] = useState(0);
  const [esMovil, setEsMovil] = useState(false);

  const raiz = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const lista = useRef<HTMLDivElement>(null);
  const campo = useRef<HTMLInputElement>(null);
  const id = useId();

  const conBuscador = opciones.length > UMBRAL_BUSCADOR;

  /* La hoja de móvil se monta en <body> (ver abajo), así que hay que saber en
     qué modo estamos en el momento de renderizar, no solo desde el CSS. */
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 620px)");
    const leer = () => setEsMovil(mq.matches);
    leer();
    mq.addEventListener("change", leer);
    return () => mq.removeEventListener("change", leer);
  }, []);

  const visibles = useMemo(() => {
    if (!busca.trim()) return opciones;
    const q = sinTildes(busca.trim());
    return opciones.filter((o) => sinTildes(o.t).includes(q));
  }, [opciones, busca]);

  const cerrar = useCallback(
    (devolverFoco = true) => {
      setAbierto(false);
      setBusca("");
      if (devolverFoco) boton.current?.focus();
    },
    []
  );

  const elegir = useCallback(
    (v: string) => {
      onCambio(v);
      cerrar();
    },
    [onCambio, cerrar]
  );

  /* Al abrir, la opción puesta es la activa: las flechas arrancan desde donde
     está el usuario y no desde el principio de la lista. */
  useEffect(() => {
    if (!abierto) return;
    const i = opciones.findIndex((o) => o.v === valor);
    setActiva(i < 0 ? 0 : i);
  }, [abierto, opciones, valor]);

  /* Hacia dónde cuelga el panel y cuánto puede crecer la lista.
     No basta con un umbral fijo: con 33 departamentos el panel mide 350 px y
     se salía por debajo de la ventana. Se mide el hueco real de cada lado, se
     elige el mayor y la lista se limita a lo que quepa ahí, así el panel
     siempre termina dentro de la pantalla y lo que sobra se desplaza.
     En móvil no aplica: ahí va anclado al borde inferior como hoja. */
  useLayoutEffect(() => {
    if (!abierto || !boton.current) return;
    if (window.matchMedia("(max-width: 620px)").matches) {
      setArriba(false);
      return;
    }
    const r = boton.current.getBoundingClientRect();
    const MARGEN = 16;
    const abajo = window.innerHeight - r.bottom - MARGEN;
    const encima = r.top - MARGEN;
    const va = abajo < 240 && encima > abajo;
    setArriba(va);

    /* Lo que el panel gasta fuera de la lista: título, buscador y relleno. */
    const marco = (panel.current?.offsetHeight ?? 0) - (lista.current?.offsetHeight ?? 0);
    const hueco = Math.max((va ? encima : abajo) - marco, 120);
    lista.current?.style.setProperty("--dd-lista-max", `${Math.min(hueco, 264)}px`);
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;
    /* El buscador se lleva el foco; si no hay, lo toma la lista para que las
       flechas funcionen de inmediato. */
    const t = window.setTimeout(() => {
      if (conBuscador) campo.current?.focus();
      else lista.current?.focus();
    }, 0);

    const fuera = (e: PointerEvent) => {
      /* El panel de móvil vive fuera de `raiz`, así que se comprueba aparte;
         si no, tocar dentro de la hoja la cerraría. */
      const t = e.target as Node;
      if (raiz.current?.contains(t) || panel.current?.contains(t)) return;
      cerrar(false);
    };
    document.addEventListener("pointerdown", fuera);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("pointerdown", fuera);
    };
  }, [abierto, conBuscador, cerrar]);

  /* La opción activa siempre visible al moverse con el teclado. */
  useEffect(() => {
    if (!abierto) return;
    lista.current
      ?.querySelector<HTMLElement>('[data-activa="1"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [abierto, activa, visibles]);

  function teclas(e: React.KeyboardEvent) {
    const n = visibles.length;
    if (e.key === "Escape") {
      e.preventDefault();
      cerrar();
      return;
    }
    if (e.key === "Tab") {
      cerrar(false);
      return;
    }
    if (!n) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiva((i) => (i + 1) % n);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiva((i) => (i - 1 + n) % n);
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiva(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiva(n - 1);
    } else if (e.key === "Enter" || (e.key === " " && !conBuscador)) {
      e.preventDefault();
      const o = visibles[activa];
      if (o) elegir(o.v);
    }
  }

  /* El índice activo apunta a la lista filtrada: al escribir hay que
     devolverlo al principio o queda señalando algo que ya no está. */
  useEffect(() => {
    setActiva(0);
  }, [busca]);

  /* En móvil esto se monta en <body>. Tiene que ser así: la hoja va en
     `position: fixed` pegada al borde inferior, y un ancestro con `animation`
     o `transform` (los hay, por las entradas animadas) se convierte en bloque
     contenedor de los elementos fijos. Sin el portal la hoja salía de 335 px
     centrada en la columna y desbordada 114 px por debajo de la pantalla. */
  const flotante = (
    <>
      <div className="dd-backdrop" aria-hidden="true" onClick={() => cerrar(false)} />
      <div ref={panel} className={`dd-panel${arriba ? " up" : ""}`} onKeyDown={teclas}>
        <div className="dd-asa" aria-hidden="true" />
        <p className="dd-titulo" id={`${id}-t`}>
          {titulo}
        </p>

        {conBuscador && (
          <input
            ref={campo}
            type="text"
            className="dd-busca"
            value={busca}
            placeholder="Escribe para buscar…"
            aria-label={`Buscar en ${titulo}`}
            aria-controls={`${id}-l`}
            onChange={(e) => setBusca(e.target.value)}
          />
        )}

        <div
          ref={lista}
          id={`${id}-l`}
          className="dd-lista"
          role="listbox"
          aria-labelledby={`${id}-t`}
          tabIndex={conBuscador ? -1 : 0}
        >
          {visibles.map((o, i) => (
            <button
              key={o.v}
              type="button"
              role="option"
              aria-selected={o.v === valor}
              data-activa={i === activa ? "1" : undefined}
              className={`dd-op${o.v === valor ? " sel" : ""}${i === activa ? " act" : ""}`}
              onPointerMove={() => setActiva(i)}
              onClick={() => elegir(o.v)}
            >
              <span>{o.t}</span>
              {o.v === valor && (
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="m3.5 8.5 3 3 6-7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </button>
          ))}

          {visibles.length === 0 && <p className="dd-vacio">Sin resultados para «{busca}»</p>}
        </div>
      </div>
    </>
  );

  return (
    <div className={`dd${abierto ? " open" : ""}`} ref={raiz}>
      <button
        type="button"
        ref={boton}
        className={`filter-pill${activo ? " on" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={abierto}
        aria-label={aria}
        onClick={() => setAbierto((v) => !v)}
        onKeyDown={(e) => {
          if (!abierto && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            setAbierto(true);
          }
        }}
      >
        {icono}
        <span className="filter-pill-txt">
          <span className="filter-pill-k">{titulo}</span>
          <b>{etiqueta}</b>
        </span>
        <ChevronIcon className="dd-caret" />
      </button>

      {abierto && (esMovil ? createPortal(flotante, document.body) : flotante)}
    </div>
  );
}
