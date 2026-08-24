# Bitácora de Rumbo

Registro de lo construido, **por qué** se decidió así, y las trampas encontradas.
Sirve para retomar el trabajo sin depender del historial de una conversación.

Última actualización: **23 de agosto de 2026**

---

## 1. Qué es y dónde vive

Rumbo es un test vocacional RIASEC (modelo de John L. Holland) para jóvenes
colombianos: 48 afirmaciones → perfil en seis dimensiones → carreras ordenadas
por afinidad → dónde estudiarlas → cómo pagarlas.

- **Proyecto principal:** `C:\Users\Edinson\Documentos\rumbo` (Next.js + React + TypeScript)
- **Artifact publicado:** https://claude.ai/code/artifact/95660b34-edab-4399-8ec9-4117128c7ccf
  — versión HTML de un solo archivo. **Está desactualizada**: no tiene el rediseño
  de resultados ni nada posterior. El proyecto Next es la fuente de verdad.
- **HTML original:** archivado en `legacy/index.html`.
- **Autor:** Franck E. Peñaloza.

Sin desplegar todavía. El plan es Vercel (`vercel login` + `vercel --prod`).

---

## 2. Decisiones de arquitectura (y sus porqués)

### 2.1 Sin base de datos: los datos son estáticos

Se evaluó Supabase para los datos del SNIES y **se descartó**. El razonamiento,
con números reales:

- El dataset útil pesa **1,9 MB en crudo, ~86 KB comprimido**. Es pequeño.
- Nadie **escribe** en esos datos: son de referencia y se actualizan cuando el
  SNIES publica (una o dos veces al año).
- Servirlos estáticos desde la CDN gana en velocidad (sin viaje al servidor ni
  arranque en frío), en costo, y **preserva la promesa de privacidad** de la
  portada: "nada sale de tu navegador". Con Supabase cada búsqueda sería una
  consulta a un servidor y habría que reescribir ese texto.
- El plan gratuito de Supabase **pausa el proyecto tras una semana sin
  actividad** — inaceptable si un colegio comparte el enlace.

**Reconsiderar solo si aparece escritura**: cuentas de usuario, guardar
resultados en servidor, edición de datos sin redesplegar, o analítica.

### 2.2 Todo corre en el navegador

No hay backend. El progreso del test se guarda en `localStorage`
(`lib/storage.ts`). El PDF se genera con `window.print()` y CSS de impresión,
sin librerías.

---

## 3. El algoritmo de afinidad

### 3.1 El error que tenía y cómo se arregló

`cosine()` en `lib/riasec.ts` comparaba los vectores **tal cual**. Como todas las
respuestas son positivas, terminaba midiendo *cuánto respondió "sí" la persona
en general* y no *qué forma tiene su perfil*. Consecuencia: todo salía entre
70% y 90% y nada se distinguía.

Diferencia entre la carrera n.º 1 y la n.º 8, medida con perfiles reales:

| Perfil | Antes | Ahora |
| --- | --- | --- |
| R-S-I (caso real, el hermano de Franck) | 12 pts | **41 pts** |
| Alguien que responde alto a todo | **1,7 pts** | **38 pts** |

**El arreglo:** se le resta a cada vector su propio promedio antes de
correlacionarlos (correlación centrada). Eso elimina el "entusiasmo general" y
compara la forma del perfil, que es de lo que trata el modelo de Holland.
Devuelve `0` cuando la correlación es nula o negativa: eso es información útil
("esto no va contigo"), no un error.

**No revertir esto sin leer lo anterior.** El comentario está en el código.

### 3.2 Efecto secundario cubierto

Los porcentajes ahora son más bajos y honestos. Para que eso no desanime hay
dos avisos en la pestaña Carreras:

- **"Tu perfil salió muy parejo"** cuando el primero es menor a 50%.
- **"N carreras te quedaron prácticamente empatadas"** cuando varias están
  dentro de `MARGEN_EMPATE` (0.04). El orden entre ellas no significa nada y la
  app lo dice en vez de fingir una jerarquía.

### 3.3 El desempate

Nació de un caso real: el hermano de Franck responde "las dos" a todo. El
problema no es de información sino de decisión, así que ningún porcentaje más
preciso lo resuelve.

`lib/desempate.ts` + `components/Desempate.tsx`: cuando hay empate, 8 preguntas
de **elección forzada** que no comparan carreras sino **días** ("Estudiar la
enfermedad" vs "Acompañar al enfermo").

**Decisión de diseño clave:** los duelos NO están escritos por carrera (serían
cientos de combinaciones y se romperían al agregar carreras) sino **por par de
dimensiones**. 15 pares cubren cualquier empate posible. Y la app **elige cuáles
preguntar**: mide en qué contrastes discrepan más las carreras empatadas y
pregunta solo por esos, porque preguntar por algo en lo que todas coinciden no
desempata nada.

El resultado dice "Elegiste el día de X", no "tu carrera es X", y aclara que no
es un veredicto.

---

## 4. Interfaz

### 4.1 Estructura de resultados

Tres pestañas: **Mi perfil · Carreras · Becas**, con una **barra resumen fija**
arriba (código Holland + tipo + mejor match).

> Se propuso convertirlo en un flujo de 3 pasos ("conócete → elige → cómo
> pagarla"). **Franck lo rechazó**: las pestañas se quedan como están.

### 4.2 Tarjeta de carrera

Al abrirse tiene tres pestañas internas: **¿Qué es? · Rutas de formación ·
Dónde estudiar**. Antes había un modal aparte; **se eliminó** (`LevelModal.tsx`
ya no existe) y su contenido vive dentro de la tarjeta.

En "Dónde estudiar", las universidades son **filas seleccionables** que muestran
si son públicas o privadas y cuántas becas propias tienen.

### 4.3 Página universidad × carrera

`components/UniversityView.tsx`. Se abre al tocar una universidad y reemplaza la
vista de resultados (con botón de volver). Muestra la institución, la carrera
ahí (nivel y duración), **las otras carreras del ranking que esa misma
universidad ofrece** (calculado, y clicables) y sus becas.

Donde no hay dato, lo dice y manda al SNIES en vez de inventarlo.

### 4.4 Becas

Reestructuradas en dos rutas que no son excluyentes:

- **Ruta A · No pagar matrícula** — Matrícula Cero, SENA, becas del 100%.
- **Ruta B · Pagar mucho menos** — ICETEX, descuentos por Saber 11.

Debajo: las becas de **las universidades que el joven abrió** en Carreras, y las
regionales. La lista completa de las 67 instituciones quedó detrás de un botón.

Colfuturo se sacó de las rutas: es para posgrado en el exterior y no ayuda a
pagar este pregrado. Va al final, marcado "Más adelante".

"Gratuidad en la matrícula" se renombró a **Matrícula Cero**, que es el nombre
oficial del programa y como lo buscan los jóvenes.

### 4.5 Portada

Hero + **Cómo funciona** (3 pasos) + **Qué vas a encontrar** (cifras calculadas
desde los datos, se actualizan solas) + las seis dimensiones + **Antes de
empezar** (4 preguntas frecuentes) + CTA repetido.

### 4.6 Informe PDF

`components/PrintReport.tsx` + bloque `@media print` en `globals.css`.
Botón "Descargar PDF" junto a "Compartir mis resultados"; usa `window.print()`,
sin librerías, y el texto del PDF queda seleccionable.

> **Trampa:** el informe vive dentro de `.screen`. Las reglas de impresión **no
> pueden ocultar ancestros** (un ancestro en `display:none` esconde al hijo por
> más `!important` que lleve). Por eso se ocultan
> `.screen > *:not(.print-report)`, no `.shell > *`.

---

## 5. Datos del SNIES

### 5.1 El importador

`scripts/importar-snies.py` — Python, **sin dependencias** (usa `zipfile` de la
librería estándar). Es herramienta de mantenimiento, no parte del build.

    npm run snies -- "C:/Users/Edinson/Downloads/Programas.xlsx"
    npm run snies:faltantes

Del archivo original (31.875 filas):

| | |
| --- | --- |
| Descarta programas **inactivos** | 13.727 |
| Descarta **posgrados** | 9.000 |
| **Quedan: pregrado activo** | **9.148 programas** |
| **Instituciones** | **292** |

**Agrupa por institución PADRE.** El SNIES registra cada sede como institución
aparte (UNAL tiene 7 códigos) y las une con `CÓDIGO_INSTITUCIÓN_PADRE`. Agrupar
bajó de 336 a 292 y evita buscar el mismo dominio varias veces.

**Datos que el archivo trae y antes no teníamos:** costo de matrícula (68% de
los programas), duración real en periodos (99%), modalidad, municipio exacto y
sector oficial/privado.

**Dos arreglos de codificación:** el archivo trae UTF-8 leído como latin-1
(`Bogot?` → `Bogotá`) y además guarda varios nombres **sin tildes en origen**
(`Administracion` → `Administración`), corregido con un diccionario.

### 5.2 Archivos generados

| Archivo | Qué es |
| --- | --- |
| `lib/snies/instituciones.json` | 292 instituciones: nombre, sector, carácter, departamentos |
| `lib/snies/programas.json` | 9.148 programas de pregrado activo |
| `lib/snies/codigos.json` | Nuestras 67 universidades → su código SNIES |
| `lib/snies/enlaces.json` | 40 dominios nuevos resueltos (tanda 1) |
| `lib/snies/faltantes.json` | 185 instituciones sin enlace, por prioridad |

### 5.3 Los enlaces: cobertura actual

| | |
| --- | --- |
| Instituciones con enlace | **226** |
| Programas cubiertos | **8.644 de 9.148 (94%)** |
| Faltan | 66 instituciones (504 programas) |

Por departamento (top 10): Bogotá, D.C. 85%, Antioquia 91%, Valle del Cauca 87%, Atlántico 95%, Santander 92%, Bolívar 86%, Caldas 99%, Norte de Santander 98%, Cundinamarca 87%, Tolima 92%.

Cinco tandas: 48% → 73% → 84% → 90% → 93% → **94%**. Se paró ahí: las 66
restantes son institutos muy pequeños y escuelas militares y policiales sin
patrón de dominio, y la última tanda solo aportó 1 punto. **Seguir no compensa
el riesgo de equivocar un enlace.**

Casos que quedaron sin resolver a propósito, por falta de evidencia: el
Politécnico Santafé de Bogotá y el Politécnico Icaft (a ambos se les propuso
`politecnico.edu.co`, que es de otra institución) y la U. Autónoma Indígena
Intercultural del Cauca. **Es preferible dejarlos sin enlace que adivinar.**

---

## 6. Trampas encontradas (no repetirlas)

### 6.1 Emparejar instituciones por nombre asigna enlaces equivocados

"Tecnológico de Antioquia" y "Universidad de Antioquia" son entidades distintas,
pero al quitarles el tipo quedan idénticas. El primer emparejador le puso a la
UdeA el enlace del Tecnológico.

**Regla:** un enlace mal asignado es **peor** que uno faltante. El emparejador
debe preferir no emparejar antes que adivinar, y las 67 de `codigos.json` se
resolvieron **a mano** y se verificaron contra el archivo.

### 6.2 Un HTTP 200 no prueba que el sitio sea de esa institución

- `politecnico.edu.co` responde 200 pero es el **Instituto Politécnico de
  Bucaramanga**, no el Politécnico Colombiano Jaime Isaza Cadavid
  (`politecnicojic.edu.co`) ni el Politécnico Internacional
  (`politecnicointernacional.edu.co`).
- `unicatolica.edu.co` responde 200 pero es la **Católica Lumen Gentium** de
  Cali, no la Universidad Católica Luis Amigó (`funlam.edu.co`), ni la Católica
  de Manizales (`ucm.edu.co`), ni la Católica del Norte (`ucn.edu.co`).
- `medellin.edu.co` es la **Secretaría de Educación de Medellín**, no la
  Universidad de Medellín (`udem.edu.co`).
- `unimaria.edu.co` es otra fundación, no la María Cano (`fumc.edu.co`).
- `unimayor.edu.co` es el Colegio Mayor **del Cauca** (lo dice su propia web:
  Popayán), no el Mayor de Cartagena ni el de Cundinamarca.
- `unicolombia.edu.co` no es la Institución Universitaria de Colombia
  (`universitariadecolombia.edu.co`).

- `universal.edu.co` es un **centro de idiomas**, no la Corporación Universal de
  Investigación y Tecnología (`corporacionuniversal.edu.co`).
- `uniautonoma.edu.co` es la Autónoma **del Cauca** (su web dice Popayán), no la
  Autónoma Indígena Intercultural.
- `virtual.edu.co` no es la Universitaria Virtual Internacional (`uvirtual.edu.co`).
- `academia.edu.co` es un **colegio cristiano de Sincelejo**, no la Academia de
  Dibujo Profesional ni la Academia Superior de Artes.
- `bellasartes.edu.co` no identifica a ninguna de las dos "Bellas Artes": la de
  Medellín es `bellasartesmed.edu.co` y la de Bolívar es `unibac.edu.co`.
- `cea.edu.co` es la Corporación Educativa **Adventista**, no el Centro de
  Estudios Aeronáuticos.
- `unicolombia.edu.co` se propuso para TRES instituciones distintas y no es
  ninguna: Universitaria de Colombia es `universitariadecolombia.edu.co`, U de
  Colombia es `udecolombia.edu.co` e IDEAS es `ideas.edu.co`.
- `ingenierosmilitares.edu.co` responde, pero sirve la página por defecto de
  XAMPP: un servidor sin configurar, no un sitio institucional.

Todos estos habrían quedado mal enlazados si se aceptaba el primer dominio que
respondiera.

**El verificador también da falsos positivos** cuando una sola palabra coincide:
aprobó `medellin.edu.co` y `politecnico.edu.co` porque compartían una palabra con
el nombre. Por eso ignora términos genéricos (medellín, bogotá, politécnico,
católica, mayor, central…) y exige coincidencias distintivas. Aun así, **revisar
a mano lo que marque DUDOSO sigue siendo necesario**.

Por eso existe `scripts/verificar.py`: **lee el `<title>` del sitio** y lo
compara con el nombre del SNIES. Este paso no es opcional.

### 6.3 curl y la codificación

`verificar.py` debe leer la salida de curl como **bytes y decodificar UTF-8
explícito**. Si se deja que el shell decida, los títulos llegan mal codificados
y la comparación de palabras falla (la U. del Quindío salió como "dudosa" siendo
correcta).

### 6.4 Sitios sin `<title>`

Algunos sitios se renderizan con JavaScript y no tienen título estático
(`usco.edu.co`, Universidad Surcolombiana). Hay que verificarlos leyendo el
cuerpo de la página o buscando en la web.

### 6.5 Dominio comprometido

**`corsalud.edu.co` redirige a un sitio de apuestas.** Nunca enlazarlo. El
dominio vigente de esa institución es `unicorsalud.edu.co`.

### 6.6 Un `<span>` no respeta altura

`.career-meter` (la barra de afinidad) es un `<span>`: sin `display: block` se
ignoran su altura y sus márgenes verticales, y la barra **no se dibujaba en
ninguna parte**, dejando un hueco vacío en la tarjeta.

### 6.7 `overflow-x: auto` crea barra vertical

Al poner `overflow-x: auto`, CSS convierte el eje Y en `auto`. Con el
`margin-bottom: -1px` de las pestañas internas, el contenido sobresalía 1px y
Windows dibujaba una barra de scroll vertical con flechas. Solución:
`overflow-y: hidden`.

### 6.8 La duración del SNIES NO viene en semestres

`NÚMERO_PERIODOS_DE_DURACIÓN` está en unidades de la columna
`PERIODICIDAD`, que puede ser Semestral, Mensual, Trimestral, Cuatrimestral o
Anual. Sin convertir, la ficha mostraba **"Tecnología en Animación Digital: 27
semestres"** — eran 27 MESES (4,5 semestres). Afectaba a más de 1.000
programas: 635 reportan 24 y 409 reportan 27, todos mensuales.

La conversión está en `A_SEMESTRES` dentro de `importar-snies.py`. Además,
`indexar.py` descarta duraciones fuera de rango por nivel (profesional 6–14,
tecnológica 3–9, técnica 1–7): el SNIES trae ~39 errores de digitación, como
una "Tecnología en Actuación" de 27 semestres.

### 6.9 Raspar los nombres de las becas NO funcionó

Se intentó extraer automáticamente las becas de los 159 sitios sin datos
curados (`scripts/raspar-becas.py`). Resultado: 28 con nombres, 23 con página
pero sin nombres legibles, 108 sin página encontrable.

Y de esos 28, **la mayoría era inservible o engañoso**:

- fragmentos de reglamento como si fueran becas: *"La beca no es acumulable con
  otras"*, *"Las becas son personales e intransferibles"*;
- becas que **no pagan la matrícula**: la U. Piloto mostraba "Becas para
  artistas con Bilbao Arte" (una residencia en España) y Pascual Bravo "Becas
  de movilidad Alianza del Pacífico" (intercambios);
- porcentajes sin sentido: la U. de Manizales salía con
  `[5,10,15,20,25,30,35,40,50,60,70,100]`, que son *todos* los números con `%`
  de la página;
- convocatorias vencidas ("Becas a mejor promedio 2024-2").

**Fecha de captura y aviso no arreglan un dato equivocado.** Se conservaron
solo 8 instituciones revisadas a mano y, sobre todo, lo que sí sirve: la
**URL de la página de becas de 51 instituciones**, que no caduca.

Si alguien retoma esto: el problema no es el extractor sino la fuente. Cada
sitio estructura sus becas distinto y mezcla en la misma página reglamentos,
intercambios y convocatorias viejas. Sin revisión humana, no sale.

### 6.10 Bug de índice al responder rápido

En `app/page.tsx`, dos respuestas muy seguidas decidían la rama con un `idx`
viejo pero avanzaban sobre el actual, pasándose del total y **rompiendo la app
con pantalla en blanco**. Corregido con un tope (`Math.min(i + 1, TOTAL - 1)`) y
una guarda en `TestScreen`.

---

## 7. Pendientes

1. **Resolver los 80 enlaces restantes**, por tandas
   (`npm run snies:faltantes`). Rinde poco: son institutos muy pequeños.
2. **Mapear el 8% de programas que quedó fuera** (Teología, Filosofía,
   Historia, Antropología y tecnicaturas nicho). No tienen arquetipo en las 32
   carreras: forzarlos sería peor que dejarlos fuera. La alternativa real es
   agregar arquetipos nuevos.
3. **Desplegar en Vercel** y, si se quiere, dominio propio.
4. **Actualizar el artifact** o retirarlo, para que no confunda estando
   desactualizado.
5. Revisar los enlaces de becas **cada semestre**: las convocatorias cambian.
6. **Comprobar las becas de las instituciones fuera del Atlántico** contra su
   sitio oficial, como se hizo en la sección 7ter. Las que no tienen campo
   `f` en `lib/becasUni.ts` son texto sin verificar.

---

## 7bis. El SNIES conectado a la app

Los 9.148 programas **ya se usan en la interfaz**. La cadena es:

    programas.json --(mapear.py)--> mapeo.json --(indexar.py)--> oferta.json --> la app

1. `scripts/mapear.py` traduce los **2.489 nombres de programa** del SNIES a los
   32 arquetipos, con patrones por carrera. Cubre el **92%** de los programas.
   *El orden de las reglas importa*: "Medicina Veterinaria" tiene que caer en
   Veterinaria antes que en Medicina, y "Licenciatura en Educación Física" en
   Ciencias del Deporte antes que en Educación.
2. `scripts/indexar.py` precalcula `oferta.json` (**56 KB**): por carrera,
   nivel y departamento, qué instituciones la ofrecen, más la **duración y la
   matrícula medianas reales**. No se puede importar `programas.json` (1,8 MB)
   al bundle; por eso el índice.
3. `lib/instituciones.ts` unifica el registro con el **código SNIES como
   identidad**: nombre y sector salen del SNIES, el sitio web de donde esté
   verificado, y `clave` conserva el enlace con las becas de `becasUni.ts`.
4. `lib/oferta.ts` es la API que consumen los componentes. **Las públicas se
   listan primero**: para muchos jóvenes la gratuidad decide si pueden estudiar.

Efecto: Psicología pasó de 14 universidades curadas a **83 reales**, y la ficha
de universidad muestra duración y matrícula del SNIES en vez de "referencia
general".

Se eliminó de `careers.ts` la tabla `NIVEL_UNIS` y `unisPorNivel()`: ya no
mandaban nada, y dejar datos curados que nadie usa confunde al que lee después.
El campo `u` de cada carrera quedó como referencia histórica.

> **Programas sin enlace no se muestran.** Si la institución no tiene sitio
> verificado, la ficha no tendría a dónde mandar al joven. Son 532 programas.

---

## 7ter. Revisión de becas del Atlántico (23 ago 2026)

Franck notó que Uninorte y la CUC tenían más becas de las que mostraba Rumbo.
Tenía razón, y el problema era peor de lo que parecía: **la mayoría de las
fichas del Atlántico eran texto genérico plausible**, del tipo «Excelencia
académica / Auxilios socioeconómicos / Descuentos por convenios», que nadie
había comprobado contra el sitio de la institución. Sonaba bien y no
significaba nada.

Se revisaron una por una contra la fuente oficial. Resultado:

| Institución | Antes | Ahora | Fuente |
|---|---|---|---|
| CUC | 3 | **15** | `cuc.edu.co/becas-institucionales` |
| IUB (antes ITSA) | 3 | **11** | `unibarranquilla.edu.co/becas-estimulos` |
| Uninorte | 5 | **9** | `uninorte.edu.co/web/apoyo-financiero/becas-pregrado` |
| Unilibre, Uniminuto | 2–3 | 5 | sitio oficial |
| UAC, Americana, Reformada | 3 | 4 | sitio oficial |
| Uniatlántico, Unisimón, Unicorsalud, PCA | 2–3 | 3 | sitio oficial |
| Unimetro | 3 | 2 | sitio oficial |
| CUL | 2 | 1 | sitio oficial |
| CUES, Litoral, San Martín | 2–3 | **retiradas** | sin fuente comprobable |

Detalles que solo aparecen mirando la fuente:

- **ITSA e IUB son la misma institución.** ITSA se renombró Institución
  Universitaria de Barranquilla; `itsa.edu.co` y `unibarranquilla.edu.co`
  llevan al mismo sitio. Buscar por ambos nombres devuelve resultados
  cruzados que parecen de dos entidades distintas.
- La beca **«Mejor Icfes (hasta 100%)»** que Rumbo le atribuía a Uninorte
  **no existe** en su página. Era un dato viejo o inventado.
- **Unimetro no da becas propias.** Solo financiación (crédito reembolsable
  que el estudiante paga vía ICETEX). Decirle a un joven que hay becas ahí
  sería mandarlo a perder el viaje.
- **CUL tampoco tiene programa de becas**, solo descuentos puntuales atados a
  fechas de inscripción.
- El reglamento de becas que publica la UAC es el **Acuerdo 02 de 2002**: 24
  años viejo. No sirve como fuente de lo vigente.

### Lo que se retiró y por qué

CUES, Litoral y San Martín salieron del archivo. No es que no tengan becas:
es que no se pudo comprobar cuáles. Dejar la lista genérica habría sido
mantener el mismo error que se estaba corrigiendo. Sin entrada, la ficha
muestra el aviso que manda al sitio oficial, que es la verdad disponible.

### Campo nuevo: `f`

`BecaUni` ahora tiene `f?: string` con la fecha (AAAA-MM-DD) en que se
comprobó contra el sitio oficial, y la ficha la muestra:

> Comprobado en su sitio oficial el 23 de agosto de 2026. Las convocatorias
> cambian cada semestre: confírmalo antes de contar con una.

Sin fecha, un dato de becas no se puede auditar: no hay forma de saber si
lleva seis meses podrido. Con fecha, cualquiera que abra la ficha sabe qué
tan viejo es lo que está leyendo.

Las instituciones de fuera del Atlántico **siguen sin comprobar** y sin `f`.
Ese es el próximo lote.

---

## 8. Comandos

    npm run dev                   # desarrollo
    npm run build                 # build de producción
    npx tsc --noEmit              # chequeo de tipos
    npm run snies -- <archivo>    # reimportar datos del SNIES
    npm run snies:faltantes       # instituciones sin enlace, por prioridad
    npm run snies:mapear          # programas del SNIES -> 32 arquetipos
    npm run snies:indexar         # construye el índice que usa la app

    python scripts/dominios.py 40        # proponer dominios para las 40 más grandes
    python scripts/verificar.py x.json   # comprobar que cada dominio SEA de esa institución
