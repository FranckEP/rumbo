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

### 4.2bis Los filtros, a la vista (23 ago 2026)

Estaban detrás de un botón «Filtros» con icono de deslizadores. Franck: *«siento
que no los usan porque no están a simple vista»*. Tenía razón, y el motivo es
básico: **nadie abre un menú llamado «Filtros» para encontrar algo que no sabe
que existe**. El de departamento —que es el que de verdad importa, «¿dónde
puedo estudiar esto cerca de mí?»— era invisible.

Ahora son **dos píldoras siempre visibles** que llevan escrito su propio valor:

    [📍 UNIVERSIDADES EN / Todo el país ▾]  [🎓 NIVEL / Todos ▾]      [Afinidad|A–Z]

Cada píldora dice a la vez **qué filtra** y **cómo está**, sin abrir nada. Al
activarse se pinta con el color de acento. El botón «Filtros», el panel
desplegable y el estado `filtersOpen` desaparecieron.

**Detalle de implementación:** el `<select>` nativo va encima de la píldora en
`position:absolute; inset:0; opacity:0`. Se ve la píldora, pero toda ella es
zona de toque y en el celular abre el selector del sistema, que es lo más
cómodo que hay. Sigue siendo un `<select>` real: enfocable, con `aria-label`,
y funciona con teclado.

**Lo que se rompió en móvil y cómo se midió.** Con las dos píldoras al 50%
quedaban **85 px de texto visible**. Ahí no cabe «Archipiélago de San Andrés,
Providencia y Santa Catalina» (380 px reales) ni «Norte de Santander»: se
cortaban a nada. Dos arreglos:

1. En pantallas ≤620 px la píldora de departamento se lleva la fila entera;
   nivel y orden comparten la segunda.
2. `DEPT_CORTO` y `NIVEL_CORTO` en `Results.tsx` acortan **lo que se muestra**
   («San Andrés», «Bogotá», «Profesional»). El `<option>` conserva el nombre
   oficial, que es el que hay que reconocer al elegir.

**«Quitar filtros»** se movió a la línea del conteo. Suelto en la fila de
filtros caía en una tercera fila él solo y se comía alto antes de que se viera
la primera carrera. Junto al conteo queda al lado del texto que ya explica qué
filtro está puesto («32 carreras · universidades en Atlántico»), que es donde
tiene sentido.

Medido en el navegador: escritorio 1 fila de 50 px; móvil 375 px, 2 filas de
109 px en total, sin desborde horizontal ni texto recortado en el peor caso.

### 4.2ter El desplegable propio (23 ago 2026)

Los filtros ya estaban a la vista, pero al abrirlos aparecía la lista del
`<select>` nativo. Franck: *«no me gusta que cuando abro el dropdown de los
filtros no tiene nada de diseño»*. Y no había forma de arreglarlo por CSS:
**`<option>` casi no acepta estilos en ningún navegador**, así que en medio de
una interfaz diseñada se abría cromo del sistema operativo.

`components/Dropdown.tsx` lo reemplaza. Conserva todo lo que el nativo daba
gratis: `role="listbox"`, flechas, Inicio/Fin, Escape, cierre al tocar fuera y
el foco de vuelta al botón. Cuando la lista pasa de 12 opciones aparece un
**buscador**, que sustituye al *typeahead* del nativo y además sirve en el
celular, donde no hay teclado para escribir a ciegas. Busca sin tildes:
«atlan» encuentra Atlántico.

En móvil el panel es una **hoja anclada al borde inferior** con fondo oscuro,
asa y opciones de 49 px. En escritorio cuelga del botón y se voltea hacia
arriba si abajo no cabe.

#### Tres trampas, todas medidas en el navegador

**1. `position: fixed` no siempre es respecto a la ventana.** La hoja salía de
335 px centrada en la columna y desbordada 114 px por debajo de la pantalla.
Un ancestro con `animation` o `transform` —los hay, por las entradas
animadas— se convierte en **bloque contenedor de los elementos fijos**. La
solución es montar el panel en `<body>` con `createPortal`. Se hace **siempre**,
no solo en móvil: la primera versión decidía con un estado alimentado por
`matchMedia`, y el evento `change` no llegaba al emular el celular, así que la
hoja se quedaba mal puesta. Al ir portado, en escritorio las coordenadas hay
que calcularlas a mano contra el rectángulo del botón.

**2. El panel se cerraba solo al abrirlo.** Como va fijo, se despegaría del
botón al desplazar la página, así que se cierra con el scroll (es lo que hace
el nativo). Pero al abrir se enfoca el buscador, **el navegador desplaza para
hacerlo visible**, ese scroll llega al cierre y el panel desaparecía en el
mismo instante. Dos arreglos: `focus({ preventScroll: true })` y que el
desplazamiento de dentro del panel no cuente.

**3. `scrollIntoView` también mueve a los ancestros.** Mantener visible la
opción activa con `scrollIntoView({block:"nearest"})` desplazaba de paso la
página, y volvía a disparar el cierre. Se cambió por mover `scrollTop` de la
lista a mano, que no toca nada de arriba.

**4. El teclado del celular tapaba la hoja.** Al tocar el buscador, la hoja
quedaba detrás del teclado. `position: fixed` se ancla al **viewport de
diseño**, y ese no encoge cuando sale el teclado: solo encoge el **viewport
visual**. Además, el cierre por `resize` remataba el problema, porque abrir el
teclado dispara un `resize` de ventana en Android y el panel se cerraba solo.

El arreglo tiene tres partes:

- `visualViewport` mide lo que de verdad se ve. Con eso se calculan dos
  variables CSS sobre el panel: `--dd-teclado` (cuántos píxeles tapa) y
  `--dd-visible` (alto realmente visible).
- El CSS usa `bottom: var(--dd-teclado, 0px)` en vez de `bottom: 0`, y
  `max-height: min(74vh, calc(var(--dd-visible, 100vh) - 48px))`. La hoja sube
  lo justo y encoge para caber entre el teclado y el borde de arriba.
- La hoja pasa a `display: flex; flex-direction: column` y la lista a
  `flex: 1; min-height: 0`, para que se reparta sola el alto que quede. El
  `max-height: 52vh` que tenía antes no sabía nada del teclado.
- El cierre por `scroll`/`resize` **solo aplica en escritorio**. En móvil la
  hoja va pegada al borde inferior, no se despega de nada, y cerrarla por
  `resize` era justo lo que la mataba al salir el teclado.

Medido con un teclado simulado de 336 px sobre `visualViewport`: la hoja pasa
de 600 px de alto pegada a 812, a 428 px terminando exactamente en 476, que es
el borde superior del teclado. Buscador y lista siguen visibles y se puede
escribir; al cerrarse el teclado vuelve exacta a su sitio.

> **Nota para quien verifique esto en el panel del navegador de Claude Code:**
> si la vista previa está oculta, la página **no compone cuadros** y las
> animaciones CSS se congelan en su primer fotograma. La hoja se mide
> `translateY(100%)` y parece rota sin estarlo. Para medir el estado de reposo
> hay que poner `panel.style.animation = "none"` antes de leer el rectángulo.

Comprobado: escritorio 1280×800, panel de 340 px alineado con el botón, 7 px
debajo, dentro de la pantalla, lista con desplazamiento; móvil 375 px, hoja a
ancho completo pegada al borde inferior. Buscar «boliv» + Enter deja el filtro
en Bolívar; dos flechas + Enter en Nivel dejan Tecnológica; Escape cierra sin
cambiar nada y devuelve el foco.

### 4.3 Página universidad × carrera

`components/UniversityView.tsx`. Se abre al tocar una universidad y reemplaza la
vista de resultados (con botón de volver). Muestra la institución, la carrera
ahí (nivel y duración), **las otras carreras del ranking que esa misma
universidad ofrece** (calculado, y clicables) y sus becas.

Donde no hay dato, lo dice y manda al SNIES en vez de inventarlo.

### 4.4 Becas (rehecha el 23 ago 2026)

Franck: *«varias personas me han informado que no entienden bien la parte de
las becas, esa vista siento que está un poco desordenada»*. Al mirarla con
calma el problema no era el orden, era **el eje**.

#### Lo que estaba mal

Se organizaba en **Ruta A · No pagar matrícula** y **Ruta B · Pagar mucho
menos**. Eso parte por si pagas o no la matrícula, pero **eso no es una
decisión que el joven tome**: es una consecuencia de a dónde entre. Encima las
dos rutas se presentaban como excluyentes aunque el texto dijera lo contrario,
así que la gente creía que tenía que elegir una.

Además:

- Dentro de las rutas había bloques (`ruta-item-static`) que **parecían enlaces
  y no llevaban a ninguna parte**: «Becas del 100% en privadas», «Descuentos
  por Saber 11». Un callejón sin salida se lee como algo roto.
- Cada beca era **un párrafo suelto**. Para saber si aplicaba había que leerla
  entera, y no se podían comparar dos entre sí.
- **Colfuturo** salía como fila huérfana sin encabezado, entre las ayudas
  regionales. Es para posgrado en el exterior: ruido puro para quien está
  eligiendo pregrado.
- Las becas de universidad, que son de lo más accionable, estaban **al final
  detrás de un botón**.

#### Lo que hay ahora

El eje es **quién da la ayuda**, porque eso sí es accionable: dice a qué puerta
hay que ir a tocar.

1. **Cuánto cuesta según dónde entres** — una tira de tres celdas (Pública $0 ·
   SENA $0 · Privada −15% a −100%). Sin esa referencia las ayudas de abajo no
   tienen contra qué compararse.
2. **Del Gobierno Nacional** — Matrícula Cero, SENA.
3. **De tu ciudad o departamento** — filtrado por el departamento elegido en
   Carreras, con texto propio cuando no hay nada registrado.
4. **De la universidad** — las que abrió en Carreras, más el acceso a las 64.
5. **Créditos** — ICETEX, con la advertencia de que *esto sí se devuelve*.
6. **Para más adelante** — Colfuturo, fuera del flujo.

Y cada beca responde **las mismas tres preguntas, en el mismo orden y en el
mismo sitio**: «Para quién», «Qué necesitas», «Cuándo». Ese es el arreglo de
comprensión de verdad: se leen en diagonal y se descarta rápido lo que no
aplica, que es lo que hace falta cuando estás mirando ocho.

#### Un fallo latente que apareció de paso

`becas.ts` tenía `depts: ["Bogotá D.C."]` **sin coma**, pero el SNIES escribe
`"Bogotá, D.C."`. Nunca coincidían, así que **Jóvenes a la U — ATENEA no
aparecía jamás** para quien filtraba por Bogotá. Corregido, y anotado en el
tipo: esos nombres tienen que ser idénticos a los de
`lib/snies/instituciones.json`.

#### Dos cosas que solo se ven midiendo

- La cobertura iba en un distintivo, y «Crédito; algunas líneas condonan parte»
  medía **432 px en una pantalla de 375**: rompía el ancho de toda la página.
  Un distintivo es una etiqueta, no una frase. Se acortaron los textos
  («Crédito, no beca») y se le puso `max-width: 100%` como red de seguridad.
- `.becas-grid` usaba `auto-fit`, que colapsa las pistas vacías: **una ficha
  sola se estiraba a 860 px**. Con `auto-fill` la tarjeta mide igual haya una
  o cinco.

Comprobado: escritorio 1280, tira en una fila y fichas de 423 px parejas;
móvil 375, tira en tres filas con el precio a la derecha y sin desborde
horizontal. Con Bogotá seleccionado aparece ATENEA; con Cauca, el texto de
«no tenemos programas registrados».

#### Segunda pasada (25 ago 2026)

Franck, después de verla: *«el texto no se ve bien, quisiera que aquí también
apareciera el filtro… quita el número de becas (72)… elimina Colfuturo… y la
parte de la universidad debería tener también un filtro, porque cuando eligen
la universidad en Carreras los manda directo a la página de la universidad»*.

- **Filtro propio en Becas.** El departamento se elegía solo en Carreras, pero
  media vista depende de él. Ahora hay un `Dropdown` aquí que comparte estado
  con el de Carreras: se cambia en cualquiera de las dos y las dos quedan
  iguales.
- **Fuera el contador «72»** de la pestaña. Sumaba becas nacionales más
  instituciones: un número que no significaba nada para nadie.
- **Fuera Colfuturo**, por ahora. Con él se fue el grupo `despues`.
- **Fuera «las universidades que miraste».** Esa era la observación fina de
  Franck: al elegir una universidad en Carreras la app **te lleva a su
  página**, así que nadie volvía a Becas con visitas guardadas y la sección
  salía vacía casi siempre. En su lugar va la lista completa con su buscador,
  filtrada por el departamento. Se retiró también el estado `unisVistas` de
  `Results.tsx`, que quedó sin lectores.
- **Texto más legible.** Casi todo el texto de apoyo estaba en `--ink-faint`
  (#7A8294) y por debajo de 0,85 rem. Subió a `--ink-soft` y a tamaños que se
  sostienen. Medido en la propia página: de 7,9:1 a 15,6:1 en tema claro y de
  8,2:1 a 13,6:1 en oscuro, todo por encima del mínimo de 4,5:1.

##### El desplegable se cerraba solo, otra vez

Al abrir el filtro en Becas no pasaba nada. Misma causa que la trampa 2 de la
sección 4.2ter, por otro camino: la píldora estaba más abajo en una página
larga, el navegador **desplazó para hacerla visible al enfocarla**, y ese
desplazamiento llegaba al cierre por scroll.

Ya se había parcheado una vez (`preventScroll`) y volvió a aparecer, así que
esta vez se cambió el enfoque en lugar de añadir otra excepción: **al desplazar
se RECOLOCA el panel, no se cierra**. Solo se cierra si el botón se fue del
todo de la pantalla, que es cuando ya no queda a qué anclarse. Eso elimina la
clase entera de fallo y además se comporta mejor: el panel sigue al botón en
vez de desaparecer.

> Lección: cuando un mismo fallo vuelve por otra puerta, el parche estaba en el
> sitio equivocado.

Comprobado: el filtro de Becas abre, elige Antioquia y deja solo Sapiencia; el
título del grupo pasa a «En Antioquia»; la lista de universidades queda en las
14 de Antioquia; y al volver a Carreras el filtro está en Antioquia. Móvil de
375 px sin desborde.

#### La entradilla de Becas (25 ago 2026)

El parrafo de arriba («Casi nadie paga el precio de lista...») se cortaba a
media anchura y dejaba un vacio grande a la derecha. El limite de caracteres
por linea es correcto para leer, pero encima de un contenedor mucho mas ancho
**parece que el texto se trunco**.

No se quito el limite, que habria dado lineas de 90 caracteres. Se emparejo la
entradilla con el filtro en una misma banda: texto a la izquierda, filtro
pegado a la derecha. Asi la banda se completa y el hueco pasa a leerse como
separacion entre dos cosas, no como un final abrupto. En movil se apilan, los
dos a ancho completo.

Ademas `text-wrap: balance` en la entradilla: las lineas iban 625 y 462 px, y
ahora 537 y 549. Donde no este soportado se ignora sin romper nada.

#### Repaso sobre capturas (25 ago 2026)

Seis cosas que Franck vio en pantalla. La primera destapó un fallo real.

**Los filtros salían desordenados en móvil.** Y las reglas estaban escritas,
solo que **apuntaban al elemento equivocado**. Al meter `Dropdown`, los
elementos flex de `.filter-row` dejaron de ser las `.filter-pill` y pasaron a
ser los `.dd` que las envuelven. Dimensionar `.filter-pill` desde la fila ya no
hacía nada, y `.filter-pill + .filter-pill` no llegaba a coincidir nunca porque
cada píldora vive en su propio `.dd`. Corregido a `.filter-row > .dd`. Ahora en
móvil: departamento a fila entera, y nivel + orden repartidos a medias en la
segunda, en vez de quedar el orden solo y descolgado a la derecha.

> Lección: al envolver un elemento en un componente, los selectores que lo
> dimensionaban desde fuera dejan de aplicar en silencio. No falla nada, no
> avisa nadie: simplemente se ignora.

**El punto suelto.** La pestaña decía `Carreras· 32`: el punto pegado a la
palabra y separado del número, que se leía como una errata. Ahora el contador
es una pastilla con forma propia. En la línea de resultados, `32 carreras ·
universidades en Antioquia` pasó a `32 carreras con universidades en
Antioquia`.

**Minúsculas donde no iban.** Las notas de la tira de precios eran frases
sueltas que arrancaban en minúscula y sin punto final («con Matrícula Cero, si
eres de estrato 1, 2 o 3»), y se leían como recortadas.

**Hueco bajo «Puntaje por dimensión».** Las barras son más bajas que el radar y
sobraba un vacío al fondo de la tarjeta. Encoger la tarjeta la habría dejado
descuadrada al lado del radar, así que las barras se reparten el alto
disponible (`justify-content: space-between`). Las dos tarjetas miden 427 px y
debajo de la última barra solo queda el relleno normal de 35 px.

**ICETEX en una columna.** Siendo la única beca de su grupo, salía en una
tarjeta estrecha con tres huecos vacíos al lado. Ahora un grupo de una sola
ficha ocupa el ancho entero (clase `.una`), y como entonces sobra ancho, las
tres preguntas se reparten en columnas en vez de quedar en una tira larga.

**Y el error que eso destapó:** al pasar la `<dl>` a grid, `dt` y `dd` se
colocaban como celdas sueltas y las preguntas salían **desordenadas**: «Para
quién», «Cuándo», «Qué necesitas». Se arregló envolviendo cada par en un
`<div>` — el HTML lo permite dentro de `<dl>` — para que cada pregunta sea una
sola celda del grid.

**Los tres controles, del mismo tamano.** Las pildoras llevaban dos lineas
(rotulo en mayusculas + valor) y el selector de orden una sola, asi que la fila
tenia tres alturas distintas. Ahora `.filter-row` define `--ctl-h` y los tres
la usan: 50 px en escritorio, 44 px en movil. En movil se oculta el rotulo en
mayusculas para que la pildora quepa en una linea a esa altura; el icono ya
dice de que va el filtro (chincheta = lugar, birrete = nivel) y el texto entero
sigue en el `aria-label` y en el titulo del panel al abrirlo.

**El contenido apinado al principio.** Igualar el ancho de las pildoras dejo
otro problema a la vista: dentro, el icono, el valor y la flecha se quedaban
juntos a la izquierda y la pildora se veia medio vacia por la derecha. Faltaba
que el bloque de texto creciera (`flex: 1 1 auto` en `.filter-pill-txt`); asi
la flecha se va al borde, como en un desplegable de toda la vida. En
escritorio no cambia nada, porque alli la pildora se ajusta a su contenido y
no hay hueco que repartir.

En la segunda fila de movil, `flex: 1 1 0` daba 161 y 167 px porque el ancho
minimo del contenido del selector de orden se imponia. Con
`flex: 0 0 calc(50% - 4px)` el reparto no depende del contenido y quedan
exactos: 163,6 px cada uno.

Comprobado: móvil 375 px, fila de filtros en dos filas de 109 px sin desborde;
escritorio 1280, ICETEX a 860 px con las tres preguntas en orden de izquierda a
derecha, y las demás fichas apiladas como antes.

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

## 7quater. Tests (25 ago 2026)

El proyecto no tenia ninguno. Ahora hay **176 en 9 archivos**, con Vitest y
Testing Library:

    npm test         # una pasada
    npm run test:watch

| Archivo | Cubre |
|---|---|
| `riasec.test.ts` | Cuestionario, puntajes, correlacion centrada, codigo Holland, empates |
| `datos.test.ts` | Integridad de carreras, becas, instituciones y departamentos |
| `oferta.test.ts` | Niveles, instituciones por carrera, duraciones y costos |
| `logica.test.ts` | Progreso guardado, reanudacion y desempate |
| `dropdown.test.tsx` | Abrir, cerrar, teclado, buscador, accesibilidad |
| `becas.test.tsx` | Agrupacion, filtro por departamento, lista de universidades |
| `intro.test.tsx` | Portada: cifras, dimensiones, acciones, preguntas |
| `flujo.test.tsx` | Recorrido completo: portada -> 48 preguntas -> resultados |
| `estilo.test.ts` | Reglas de maquetacion que ya se rompieron una vez |

### El fallo grave que aparecio al escribirlos

Un test decia «las profesiones reguladas solo existen como profesional». Fallo,
y al tirar del hilo salio esto:

| Carrera | Mostraba | Programas que colaba |
|---|---|---|
| **Medicina** | Tecnologica (15 instituciones) | Atencion Prehospitalaria, Radiologia, Citohistologia |
| **Derecho** | Tecnologica (16) | Criminalistica, Investigacion Judicial |
| **Odontologia** | Tecnica (1) | Tecnico Profesional en Salud Oral |
| **Veterinaria** | Tecnologica (1) | Enfermeria Veterinaria |

La ficha llegaba a decir «Medicina · Tecnologica · 15 instituciones · 6
semestres». Un joven leia eso y concluia que puede ser medico en tres anos. No
puede. Son carreras dignas y bien pagadas, pero son **otras carreras**.

**Por que fallaba:** `careers.ts` ya declaraba `lvl: ["profesional"]` para esas
carreras, pero `nivelesDe()` leia solo `oferta.json` y **nunca miraba ese
campo**. El guardarrail existia y estaba muerto. Encima el filtro de nivel si
usaba `careers.lvl`, asi que filtrar por «Tecnica» excluia Medicina y al mismo
tiempo abrirla mostraba una ruta tecnologica: dos fuentes de verdad que se
contradecian.

**El arreglo:** el indice se depura **una vez al cargarlo**, no en cada
funcion. La primera version puso la guarda en `nivelesDe` e `institucionesDe`,
y `cuantasDe`, `duracionDe`, `costoDe` y `departamentosDe` se la saltaban
leyendo el indice crudo. Depurando el origen no queda ninguna puerta trasera.

### Otras cosas que salieron

- **Odontologia** declaraba `lvl: ["profesional", "tecnica"]`. Corregido.
- `Dropdown` podia lanzar en el clic-fuera si el evento llegaba sin un nodo
  como `target`.
- Los tests documentan de paso el diseno real: `duelosPara` **repite a
  proposito** cada par de dimensiones con dos redacciones distintas, y
  «Repetir el test» vuelve a la pregunta 1, no a la portada.

### Detalles de montaje

- `testTimeout: 30_000` y `userEvent.setup({ delay: null })`: los tests de
  flujo responden las 48 preguntas de verdad.
- El avance entre preguntas va tras un `setTimeout` de 120 ms, asi que hay que
  esperarlo (`findByText`), no basta con hacer clic.
- `jsdom` no trae `matchMedia`, `scrollTo` ni CSS: las comprobaciones de
  maquetacion se hacen leyendo `globals.css` como texto, no con
  `getComputedStyle`.

---

## 7quinquies. Repaso visual (25 ago 2026)

- **Puntos medios fuera.** Franck: *«recuerda quitar todos los puntos medios
  que te dije que no se veian bien esteticamente»*. Se retiraron los 18 que
  quedaban en toda la interfaz y el informe PDF. Donde separaban datos ahora
  hay comas; donde separaban carrera y porcentaje, el porcentaje va en su
  propia pastilla. `estilo.test.ts` vigila que no vuelva ninguno.
- **Mayusculas iniciales** en las cifras de la portada.
- **Las seis dimensiones, alineadas.** Un `<button>` **centra su contenido
  verticalmente** por defecto. Como la rejilla estira las seis tarjetas a la
  misma altura y las pistas ocupan una o dos lineas, la de una linea bajaba su
  bloque entero la mitad de la diferencia: la insignia de «Artistico» quedaba
  8 px mas abajo (medido: 1645 frente a 1637). En columna flex arrancan todas
  arriba.
- **El numero de «Como funciona»** paso de al lado a encima del texto: el
  parrafo gana 44 px de ancho en tarjetas de 215.

---

## 8. Comandos

    npm run dev                   # desarrollo
    npm run build                 # build de producción
    npx tsc --noEmit              # chequeo de tipos
    npm run snies -- <archivo>    # reimportar datos del SNIES
    npm run snies:faltantes       # instituciones sin enlace, por prioridad
    npm run snies:mapear          # programas del SNIES -> 32 arquetipos
    npm run snies:indexar

    npm test              # 176 tests
    npm run test:watch         # construye el índice que usa la app

    python scripts/dominios.py 40        # proponer dominios para las 40 más grandes
    python scripts/verificar.py x.json   # comprobar que cada dominio SEA de esa institución
