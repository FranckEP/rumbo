"use client";

import { useState } from "react";
import { CapIcon, ChartIcon, ClockIcon, CoinIcon, LockIcon, PinIcon } from "./icons";
import { BECAS } from "@/lib/becas";
import { BECAS_UNI } from "@/lib/becasUni";
import { CAREERS } from "@/lib/careers";
import { DIMS, DIM_KEYS, TOTAL, type DimKey } from "@/lib/riasec";
import { DEPARTAMENTOS, INSTITUCIONES } from "@/lib/instituciones";
import { SNIES_URL } from "@/lib/universities";

/* Los números salen de los datos, no a mano: si mañana agregas una carrera o
   una universidad, la portada se actualiza sola. */
const N_CARRERAS = CAREERS.length;
const N_UNIS = Object.keys(INSTITUCIONES).length;
const N_DEPTS = DEPARTAMENTOS.length;
const N_BECAS = BECAS.length + Object.keys(BECAS_UNI).length;

const PASOS = [
  {
    t: "Respondes 48 afirmaciones",
    d: `Cosas concretas que podrías hacer —"armar algo con mis manos", "escuchar a un amigo"— y dices qué tanto van contigo. Entre 6 y 8 minutos, sin registrarte.`,
  },
  {
    t: "Descubres quién eres",
    d: "Tu código Holland y tus seis dimensiones en un mapa: qué te mueve, en qué eres fuerte y qué áreas te interesan menos.",
  },
  {
    t: "Decides con datos",
    d: `Tus ${N_CARRERAS} carreras ordenadas por afinidad, con los caminos para estudiar cada una, en qué universidades cerca de ti, y cómo pagarla.`,
  },
];

const PREGUNTAS = [
  {
    q: "¿Cuánto cuesta?",
    a: "Nada. No hay cuenta, ni correo, ni pagos.",
  },
  {
    q: "¿Guardan mis respuestas?",
    a: "No. Todo se calcula en tu navegador y tu avance se guarda solo en tu dispositivo, por si sales a la mitad.",
  },
  {
    q: "¿El resultado decide por mí?",
    a: "No. Es una guía para explorar y para conversar con tu familia, tus profesores y gente que ya trabaja en lo que te llama la atención.",
  },
  {
    q: "¿De dónde salen las universidades?",
    a: "De sus sitios oficiales. Cada carrera trae el enlace al SNIES del Ministerio de Educación para que verifiques el registro y la acreditación del programa.",
  },
];

interface Props {
  onStart: () => void;
  /** número de respuestas ya contestadas, o null si no hay progreso reanudable */
  resumeCount: number | null;
  onResume: () => void;
}

export default function Intro({ onStart, resumeCount, onResume }: Props) {
  const [expanded, setExpanded] = useState<DimKey | null>(null);
  const [abierta, setAbierta] = useState<number | null>(null);

  return (
    <section className="screen">
      <div className="hero">
        <div className="hero-glow" aria-hidden="true" />
        <p className="eyebrow">Test de intereses y habilidades</p>
        <h1>Descubre hacia dónde apunta tu vocación</h1>
        <p className="lede">
          Responde {TOTAL} afirmaciones sobre lo que te gusta hacer y lo que se te da bien. Al final
          obtendrás tu perfil en las seis dimensiones del modelo RIASEC —el más usado en orientación
          vocacional en el mundo— y las carreras que más se parecen a ti, ordenadas por afinidad.
        </p>
        <div className="hero-meta">
          <span><ClockIcon /> 6–8 minutos</span>
          <span><ChartIcon /> Perfil con gráfico + código Holland</span>
          <span><CapIcon /> {N_CARRERAS} carreras con universidades en Colombia</span>
          <span><CoinIcon /> Becas y apoyos oficiales</span>
          <span><LockIcon /> Nada sale de tu navegador</span>
        </div>
      </div>

      <div className="intro-actions">
        <button className="btn" onClick={onStart}>
          Empezar el test →
        </button>
        {resumeCount !== null && (
          <button className="btn-ghost" onClick={onResume}>
            Continuar donde quedé ({resumeCount}/{TOTAL})
          </button>
        )}
      </div>

      <section className="intro-block">
        <h2 className="intro-h2">Cómo funciona</h2>
        <div className="pasos">
          {PASOS.map((p, i) => (
            <div className="paso" key={p.t}>
              <span className="paso-n">{i + 1}</span>
              <div>
                <b>{p.t}</b>
                <p>{p.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="intro-block">
        <h2 className="intro-h2">Qué vas a encontrar</h2>
        <div className="stats">
          <div className="stat">
            <b>{N_CARRERAS}</b>
            <span>carreras evaluadas, cada una con su porcentaje de afinidad contigo</span>
          </div>
          <div className="stat">
            <b>{N_UNIS}</b>
            <span>
              instituciones públicas y privadas, filtrables por {N_DEPTS} departamentos
            </span>
          </div>
          <div className="stat">
            <b>{N_BECAS}</b>
            <span>becas y apoyos: nacionales, de tu región y de cada universidad</span>
          </div>
          <div className="stat">
            <b>3</b>
            <span>niveles por carrera: profesional, tecnológica y técnica</span>
          </div>
        </div>
        <p className="intro-note">
          <PinIcon /> No todo es una carrera de diez semestres: en cada área te mostramos también
          las rutas técnicas y tecnológicas, que son más cortas y llevan al mismo campo.
        </p>
      </section>

      <section className="intro-block">
        <h2 className="intro-h2">Las seis dimensiones que vas a medir</h2>
        <p className="intro-lede">
          El modelo RIASEC describe seis formas de relacionarse con el trabajo. Tu resultado es la
          mezcla de las tres que más te definen. Toca cada una para ver qué significa.
        </p>
        <div className="dim-band">
          {DIM_KEYS.map((k) => {
            const d = DIMS[k];
            const isOpen = expanded === k;
            return (
              <button
                type="button"
                className={`dim-chip${isOpen ? " expanded" : ""}`}
                key={k}
                aria-expanded={isOpen}
                onClick={() => setExpanded((cur) => (cur === k ? null : k))}
              >
                <span className="letter" style={{ background: d.soft, color: d.color }}>
                  {k}
                </span>
                <div className="dim-name">{d.name}</div>
                <div className="dim-hint">{d.hint}</div>
                <div className="dim-desc-wrap">
                  <div className="dim-desc-inner">
                    <p className="dim-desc">{d.desc}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="intro-block">
        <h2 className="intro-h2">Antes de empezar</h2>
        <div className="faq">
          {PREGUNTAS.map((p, i) => {
            const open = abierta === i;
            return (
              <div className={`faq-item${open ? " open" : ""}`} key={p.q}>
                <button
                  className="faq-q"
                  aria-expanded={open}
                  onClick={() => setAbierta(open ? null : i)}
                >
                  <span>{p.q}</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path
                      d="M3.5 5.25 7 8.75l3.5-3.5"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <div className="career-body-wrap">
                  <div className="career-body-inner">
                    <p className="faq-a">{p.a}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="intro-cta">
        <div>
          <b>¿Listo?</b>
          <p>
            {TOTAL} preguntas, ninguna respuesta correcta o incorrecta. Solo responde con
            sinceridad.
          </p>
        </div>
        <button className="btn" onClick={onStart}>
          Empezar el test →
        </button>
      </div>

      <p className="disclaimer">
        Rumbo es una guía de exploración, no un veredicto. Verifica siempre el registro calificado y
        la acreditación del programa en el{" "}
        <a href={SNIES_URL} target="_blank" rel="noopener">
          SNIES
        </a>{" "}
        antes de decidir.
      </p>
    </section>
  );
}
