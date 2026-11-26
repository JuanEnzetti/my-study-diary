# Plan 003 — Objetivo semanal de estudio

- **Spec:** `specs/003-weekly-goal/spec.md` (aprobada)
- **Estado:** aprobado
- **Aprobación:** 2026-11-25, por el usuario, según transmite el agente principal: «Sí, apruebo todo»,
  en respuesta a «¿Apruebas el plan, las tareas y las tres autorizaciones?»
- **Validación:** `reviewer`, entre T9 y T10
- **Fecha:** 2026-11-25

## 1. Archivos

| Archivo | Cambio | Responsabilidad | Cubre |
|---|---|---|---|
| `weekly-goal.js` | Nuevo | Lógica pura: validar el objetivo y calcular total y progreso | RF-2, 3, 7 a 10, 14, 16, 21; RNF-5 |
| `weekly-goal-view.js` | Nuevo | Leer, guardar y quitar el objetivo; pintar progreso, aviso y error; formulario | RF-1 a 10, 12, 14, 16, 18 a 25, 28, 29; RNF-2 |
| `tests/weekly-goal.test.js` | Nuevo | Tests de `weekly-goal.js` con `node --test` | RNF-5 |
| `app.js` | Modificado | Distinguir sesiones ilegibles de lista vacía; un único «hoy» en `mostrarTodo()`; llamar a la vista | RF-5, 6, 10, 28; RNF-5, RNF-6 |
| `index.html` | Modificado | Barra y mensaje en el resumen, formulario del objetivo y dos scripts | RF-1, 8, 14, 29; RNF-2 |
| `styles.css` | Modificado | Barra, mensaje, formulario, aviso, error y foco | RF-8, 14; RNF-1, 2, 7 |

`heat-map.js`, `heat-map-view.js` y `session-data.js` no cambian. Orden de carga, con scripts
clásicos: `session-data.js`, `heat-map.js`, `heat-map-view.js`, `weekly-goal.js`,
`weekly-goal-view.js`, `app.js`.

### Autorizaciones del usuario (concedidas con la aprobación de la cabecera)
- Archivos nuevos: `weekly-goal.js`, `weekly-goal-view.js` y `tests/weekly-goal.test.js`.
- Clave nueva de localStorage: `diario-estudio-objetivo-semanal`.
- Quitar `calcularMinutosSemana`, `lunesDeLaSemana` y `minutosSemana` de `app.js`.

## 2. Datos

- **Clave:** `diario-estudio-objetivo-semanal`. No empieza por `diario-estudio-copia-`, así que
  nunca se confunde con una copia de sesiones (RF-23).
- **Formato:** solo las cifras, por ejemplo `300`. Sin clave no hay objetivo. No hay migración: quien
  ya tenía sesiones no tiene la clave (RNF-6).
- **Estado de cada página, en memoria:** `currentGoal` (número o `null`) y `currentTotal`. Es el
  «objetivo vigente» y el «total mostrado» de la spec. Sin temporizadores ni evento `storage`
  (RF-6, RF-12).

## 3. Funciones puras (`weekly-goal.js`)

| Función | Qué devuelve | Cubre |
|---|---|---|
| `parseGoalInput(text)` | `{ status, goal }`; `status` es `"empty"`, `"valid"` o `"invalid"`; `goal` es `null` si no es válido | RF-2, 3, 16, 24 |
| `parseStoredGoal(text)` | `{ goal, isDamaged }`; `null` da `{ goal: null, isDamaged: false }` | RF-5, 21 |
| `getWeeklyTotal(sessions, today)` | Minutos de lunes a hoy, con `getWeekStart` e `isValidSession` | RF-7, 9, 10; RNF-5 |
| `getGoalProgress(total, goal)` | `{ text, percent, isAchieved }`. Sin objetivo: `percent` es `null` e `isAchieved`, `false` | RF-7, 8, 9, 14 |

Constante: `MAX_WEEKLY_GOAL = 10080`.

`getWeeklyTotal` no usa `sumMinutesByDate`: agrupar por día cambia el orden de la suma. Con diez
sesiones de 0,1 alternadas en dos días daría 1 en vez de 0.9999999999999999. Suma desde 0 en el
orden guardado, como el cálculo actual.

## 4. Algoritmo en pseudocódigo

```text
validar lo escrito(texto):                                        RF-2, RF-3, RF-16
  quitar espacios de los extremos
  vacío → "empty"
  solo cifras 0-9 y valor de 1 a 10080 → "valid", con el número
  otro caso → "invalid"

validar lo guardado(texto):                                       RF-21
  null → sin objetivo, no dañado
  si es válido y String(número) es igual al texto → objetivo
  otro caso → dañado

total semanal(sesiones, hoy):                                     RF-10, RNF-5
  lunes ← getWeekStart(hoy); total ← 0
  para cada sesión válida, en orden: si lunes ≤ fecha ≤ hoy, sumar

progreso(total, objetivo):                                        RF-7, RF-8, RF-9, RF-14
  sin objetivo → "N min", sin porcentaje ni cumplido
  con objetivo → "N de M min", porcentaje = mínimo(N / M × 100, 100), cumplido si N ≥ M

mostrarTodo():    (al abrir o recargar, y tras guardar una sesión con éxito)
  sesiones ← cargarSesiones(); hoy ← hoyEnTexto(), una sola vez
  mapa con ese hoy; racha, mes y lista como ahora
  refreshWeeklyGoal(sesiones, hoy)

refreshWeeklyGoal(sesiones, hoy):                                 RF-10, RF-21, RF-22
  leer el objetivo, con try/catch
  currentGoal ← objetivo, o null si falta, está dañado o es ilegible
  aviso ← mostrado solo si está dañado o es ilegible
  currentTotal ← total semanal(sesiones, hoy)
  pintar progreso          (no toca el campo ni el error: RF-6, RF-20)

arranque, tras mostrarTodo(): showGoalInField()                   RF-5

intento (submit del formulario del objetivo):                     RF-25
  preventDefault; no se mueve el foco
  no válido → error de RF-16 y terminar
  intentar:
    vacío → si getItem no es null, removeItem                     RF-3
    válido → setItem con String(número)                           RF-2
  si falla → error de RF-18 o RF-19 y terminar, sin releer nada
  currentGoal ← número o null; campo ← número o vacío             RF-24
  quitar error y aviso                                            RF-20, RF-22
  sesiones ← readSessions()
  si no es null: currentTotal ← total semanal(sesiones, hoyEnTexto())   RF-28
  pintar progreso          (no llama a mostrarTodo: RF-10, S-17)
```

### Cambios en `app.js`
- `readSessions()` (nueva): sesiones válidas, o `null` si son ilegibles o el navegador no deja
  leerlas. `cargarSesiones()` pasa a devolver `readSessions() || []`: mismo resultado que ahora.
- Se quitan `calcularMinutosSemana`, `lunesDeLaSemana` y `minutosSemana`, sin más usos: dejarlos
  sería un segundo cálculo del total (RNF-5). La racha, la mejor racha y el mes no se tocan.

## 5. Interfaz

```text
Esta semana            | Este mes            ← bloque izquierdo: role="status"
90 de 300 min          | 7 días
[barra]                                     ← aria-hidden: el texto ya dice lo mismo
¡Objetivo cumplido!

[aviso: role="alert"]
Objetivo semanal (minutos)
[campo]
[Guardar objetivo]
[error: role="alert"]

Últimas 12 semanas …
```

- **Campo:** `type="text"`, `inputmode="numeric"`, `autocomplete="off"`, sin `maxlength`, `required`
  ni `placeholder`. `type="number"` daría vacío con «abc» y borraría el objetivo (RF-16).
  `autocomplete="off"`, más escribir el valor al arrancar, impide que una recarga restaure lo que
  estaba a medio escribir (RF-5).
- **Formulario propio:** Intro lo envía sin tocar el de sesiones (RF-25). Sin encabezado: no hay
  textos que la spec no fije (RNF-3).
- **Barra:** `div` con contorno de 1 px `--lapiz`, fondo blanco y relleno `--tinta`. Ancho del
  relleno: `100%` si está cumplido; si no, `min(P%, 100% - 2px)`. Con N = 0 es `min(0%, …)`, vacía.
  Sin transiciones ni esquinas redondeadas (RF-8, RF-14).
- **Ocultar:** atributo `hidden` en barra y mensaje, sin `display` en su CSS.
- **Móvil:** columnas `minmax(0, 1fr)` en el resumen y `overflow-wrap: anywhere` en el valor, para
  que «0.30000000000000004 de 10080 min» no se salga (RNF-1).
- **Tamaños:** mensaje, aviso y error a 1rem como máximo; nada supera los 1.75rem del valor (RNF-7).
- **Foco del campo:** contorno de 3 px `--tinta`; la sombra actual (18 % de opacidad) no llega a
  3:1. Solo para este campo (RNF-2).
- **Anuncios:** el texto del progreso y el aviso solo se escriben si cambian. El error se muestra
  siempre con un párrafo nuevo (`replaceChildren`), para que se anuncie aunque sea el mismo. Los
  contenedores de aviso y error están siempre en la página, sin `display: none` al estar vacíos.

Textos: los literales de RF-1, 7, 9, 14, 16, 18, 19 y 21, escritos con `textContent`.

## 6. Decisiones técnicas

| # | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| P1 | Clave propia con solo cifras | Aparte de las sesiones, trivial de validar | Objeto JSON: más casos dañados |
| P2 | Lógica y vista en archivos separados | Constitución 3, igual que el mapa | Todo en `app.js`: no se puede probar en Node |
| P3 | Sumar en el orden guardado | Mismo resultado con decimales (D-5) | Sumar los días de `sumMinutesByDate` |
| P4 | Un solo total, en `weekly-goal.js` | RNF-5 | Mantener `calcularMinutosSemana` al lado |
| P5 | `type="text"` con `inputmode` | Conserva lo escrito y distingue vacío de no válido | `type="number"` |
| P6 | Recordar el último total en memoria | RF-12 y RF-28 | Leerlo del texto de la página |
| P7 | Al quitar, `getItem` antes de `removeItem` | Si no se puede comprobar, no se borra nada (RF-19) | `removeItem` directo |
| P8 | No releer tras `setItem` o `removeItem` | Si fallan, lanzan un error | Comprobación extra que la spec no pide |
| P9 | Barra `aria-hidden` y texto en `role="status"` | El texto es el progreso completo; una sola voz | `role="progressbar"`: lo leería dos veces |
| P10 | El test deja las funciones de `heat-map.js` en `globalThis` | En el navegador ya son globales; el código no necesita cargarlas | `require` condicional dentro de `weekly-goal.js` |
| P11 | Párrafo nuevo en cada error | Anuncia el error repetido sin temporizadores | Vaciar y escribir con `setTimeout`: carreras entre intentos |

## 7. Estrategia de tests

`node --test`, sin instalar nada; primero en rojo. Ahora hay 48 en verde.

| Grupo | Qué comprueba | Cubre |
|---|---|---|
| Escrito | 1, 10080, «0300», « 300 », vacío, espacios; y toda la fila de valores no válidos de la spec, con miles de cifras | RF-2, 3, 16, 24 |
| Guardado | `null`, 1, 300, 10080; "", letras, 0, decimal, 20000, «0300», « 300 », «300\n» | RF-5, 21 |
| Total | Hoy lunes y domingo; domingo anterior, futura y dañada; varias el mismo día; lista vacía; sesiones congeladas | RF-7, 9, 10 |
| Calendario | Semanas de 29/03/2026 y 25/10/2026, cruces de mes y año; con varias zonas horarias como en `heat-map.test.js` | RF-10; RNF-5 |
| Decimales | 0,1 + 0,2; diez de 0,1 en un día y alternadas en dos | RF-7; D-5 |
| Progreso | 0, 90, 299, 300 y 350 de 300; 10079 de 10080; 0.9999999999999999 de 1; sin objetivo | RF-7, 8, 9, 14 |
| Pureza | Sin `document`, `localStorage`, `Date.now`, `new Date()` ni `toISOString` | RNF-5 |

El almacenamiento, el formulario y la pintura se comprueban en Chrome (MCP), también con
`localStorage` sustituido para que falle y con el reloj simulado antes de cargar la página.

## 8. Riesgos y límites

- **Lectores de pantalla:** no todos anuncian igual un `alert` ya presente al abrir o repetido. Se
  comprueba el árbol de accesibilidad y, si se puede, con un lector; si no, se anota.
- **Nombres globales:** los scripts clásicos comparten espacio; los nombres nuevos no deben
  coincidir con los existentes.
- **`weekly-goal-view.js` usa `readSessions` y `hoyEnTexto` de `app.js`:** se cargan después, pero
  solo se llaman al pulsar, cuando ya existen.
- **Redondeo de píxeles:** los 2 px vacíos se miden en la página a 375 y 1280 px.
- **Fuera:** el fallo de fecha propuesta de domingo a lunes (D-3).

## 9. Cobertura

| Requisito | Dónde | Cómo se comprueba |
|---|---|---|
| RF-1, RF-29 | `index.html`, vista | Manual |
| RF-2, 3, 16, 24 | `parseGoalInput`, vista | Tests y manual |
| RF-4, 5, 6, 12, 18 a 20, 22, 23, 25, 28 | Vista, `app.js` | Manual |
| RF-7, 8, 9, 14 | `getGoalProgress`, vista, estilos | Tests y manual |
| RF-10 | `getWeeklyTotal`, vista, `app.js` | Tests y manual |
| RF-21 | `parseStoredGoal`, vista | Tests y manual |
| RNF-1, 2, 7 | `index.html`, estilos, vista | Manual, con medidas |
| RNF-3, RNF-4, RNF-6 | Todo | Manual |
| RNF-5 | `weekly-goal.js`, `mostrarTodo()` | Tests y revisión |

## 10. Propuesta para `CLAUDE.md` (no se aplica sin aprobación)

- **Stack:** añadir `weekly-goal.js` (lógica pura) y `weekly-goal-view.js` (interfaz del objetivo).
- **Datos:** añadir la clave `diario-estudio-objetivo-semanal` (solo cifras, 1 a 10080; sin clave,
  no hay objetivo).
- **Fechas:** en la regla de la semana, cambiar `lunesDeLaSemana` por `getWeekStart` y decir que el
  total lo calcula `getWeeklyTotal`, única fuente, sumando en el orden guardado.
