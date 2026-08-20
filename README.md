# Rumbo

Test vocacional RIASEC (modelo de John L. Holland) para jóvenes: 48 afirmaciones, perfil en las
seis dimensiones, código Holland, ranking de 32 carreras por afinidad, universidades en Colombia
filtrables por departamento y becas oficiales.

Creado por **Franck E. Peñaloza**.

## Correr el proyecto

```bash
npm install
npm run dev     # http://localhost:3000
```

```bash
npm run build   # build de producción
npm run start   # servir el build
```

## Estructura

| Ruta | Qué hay |
| --- | --- |
| [app/layout.tsx](app/layout.tsx) | Metadatos, fuentes (`next/font`) y `<html>` |
| [app/page.tsx](app/page.tsx) | Máquina de estados: intro → test → resultados |
| [app/globals.css](app/globals.css) | Tokens de color, modo claro/oscuro y todos los estilos |
| [lib/riasec.ts](lib/riasec.ts) | Dimensiones, las 48 preguntas y el cálculo del perfil |
| [lib/careers.ts](lib/careers.ts) | Las 32 carreras con su vector RIASEC |
| [lib/universities.ts](lib/universities.ts) | 55 universidades con sitio oficial y departamentos |
| [lib/storage.ts](lib/storage.ts) | Guardado del progreso en `localStorage` |
| [components/](components/) | Intro, TestScreen, Results, Radar, CareerCard, Becas, Toast |

Todo corre en el navegador: no hay backend y ninguna respuesta sale del dispositivo. El progreso
se guarda en `localStorage` bajo la clave `brujula-vocacional-v1`.

La versión original de una sola página está en [legacy/index.html](legacy/index.html) como
referencia.

## Notas

- La afinidad con cada carrera es la **similitud coseno** entre el vector RIASEC del usuario
  (normalizado 0–1) y el de la carrera.
- Las universidades listadas son una muestra, no un ranking. La fuente oficial para verificar
  programas y acreditación es el SNIES del Ministerio de Educación.
