# Tareas 001 — Mapa de calor de estudio

- **Spec:** `specs/001-heat-map/spec.md`
- **Plan:** `specs/001-heat-map/plan.md`
- **Estado:** aprobadas el 2026-11-25; T1 a T10 hechas

## Reglas

- Se hace una tarea cada vez, en orden, y se para al terminarla.
- En las tareas de lógica (T1 a T6): primero los tests, se ven fallar, después el código.
- Una tarea está hecha cuando cumple su criterio y `node --test` está en verde.
- Si falta una decisión, se para y se pregunta.

## Lógica

### [x] T1 — Fechas locales
- **Archivos:** `heat-map.js` y `tests/heat-map.test.js` (nuevos).
- **Qué:** `parseLocalDate`, `formatLocalDate`, `addDays` y `getWeekStart`, y la exportación
  para Node que no afecta al navegador (D2).
- **Tests:** formato estricto y fechas imposibles (31/02, `"2026-2-3"`, ausente, no texto);
  29/02/2028; sumar y restar cruzando mes y año; cambios de hora de Madrid (29/03 y
  25/10/2026) y de otra zona; lunes de un lunes, un miércoles y un domingo; pureza del archivo
  (sin `document`, `localStorage`, `Date.now`, `new Date()` ni `toISOString`).
- **Cubre:** base de RF-1.1, RF-1.2 y RF-6.1; RNF-7.
- **Hecho cuando:** los tests pasan y ninguna función consulta el reloj.

### [x] T2 — Sesiones válidas y suma por día
- **Archivos:** `heat-map.js`, `tests/heat-map.test.js`.
- **Qué:** `isValidSession` y `sumMinutesByDate`.
- **Tests:** sesiones nulas, números, textos, sin fecha, fecha imposible; minutos 0, negativos,
  texto, vacíos, `NaN` e infinito; 20 + 20; válida más dañada; una de mañana; sesiones
  congeladas que quedan idénticas.
- **Cubre:** RF-2.2, RF-6.1, RF-6.3, RF-6.5 (lógica).
- **Hecho cuando:** los tests pasan.

### [x] T3 — Niveles de intensidad
- **Archivos:** `heat-map.js`, `tests/heat-map.test.js`.
- **Qué:** `INTENSITY_LEVELS` y `getIntensityLevel`.
- **Tests:** 0, 1, 29, 29,5, 30, 59, 60, 119, 120 y 1500; cinco entradas cuyos mínimos
  coinciden con el cálculo.
- **Cubre:** RF-2.1, RF-3.1 (datos de la leyenda).
- **Hecho cuando:** los tests pasan.

### [x] T4 — Construcción del mapa
- **Archivos:** `heat-map.js`, `tests/heat-map.test.js`.
- **Qué:** `buildHeatMap`, todavía sin rótulos de mes.
- **Tests:** hoy lunes, miércoles y domingo; del 07/09/2026 al 25/11/2026; 12 semanas; 84 días
  el domingo; huecos futuros; `isToday`; primer día y anterior al primero; cruces de mes y año,
  29/02 y cambios de hora sin repetir ni saltar días; distinto y mismo `today`; añadir una
  sesión del periodo y una anterior; lista vacía, `null`, objeto y todo dañado.
- **Cubre:** RF-1.1 a RF-1.3; RF-1.4, RF-1.5, RF-5.1 y RF-5.2 (lógica); RF-6.2, RF-6.4
  (lógica); RF-7.2 y RF-7.6 (datos).
- **Hecho cuando:** los tests pasan.

### [x] T5 — Rótulos de mes
- **Archivos:** `heat-map.js`, `tests/heat-map.test.js`.
- **Qué:** `getMonthLabels`, incorporado a `buildHeatMap` como `monthLabels`.
- **Tests:** día 1 en la primera, segunda y última columna; día 1 futuro; inicio a mitad de
  mes; 12 posiciones; meses en español.
- **Cubre:** RF-7.4, RF-7.5 (datos); RNF-3.
- **Hecho cuando:** los tests pasan.

### [x] T6 — Detalle y flechas
- **Archivos:** `heat-map.js`, `tests/heat-map.test.js`.
- **Qué:** `formatDayDetail` y `findNextDate`.
- **Tests:** texto con minutos y con 0; las cuatro direcciones, los bordes y los huecos.
- **Cubre:** RF-4.1 y RF-4.2 (lógica); RNF-3.
- **Hecho cuando:** los tests pasan.

## Interfaz

### [x] T7 — Estructura, estilos y pintado
- **Archivos:** `heat-map-view.js` (nuevo), `index.html`, `styles.css`, `app.js`.
- **Qué:** antes de cambiar nada, anotar racha, mejor racha, semana y mes con datos de ejemplo.
  Después, la sección entre el resumen y el formulario, la carga de scripts, los días, los
  rótulos, la leyenda y el borde de hoy, con lectura protegida al principio de `mostrarTodo()`.
- **Comprobación en Chrome:** posición, columnas, L, X, V, meses, huecos, hoy en los cinco
  niveles, colores con daltonismo simulado; 375 px y escritorio; datos ilegibles, `null` y
  sesiones dañadas sin modificar lo guardado; sin conexión.
- **Cubre:** RF-1 (pintado), RF-2.3, RF-3.1, RF-6.4, RF-6.5, RF-7.1 a RF-7.6; RNF-1, RNF-3 a
  RNF-6.
- **Hecho cuando:** la comprobación está anotada, la consola no tiene errores con datos
  normales y las cuatro cifras no cambian.

### [x] T8 — Detalle, selección y teclado
- **Archivos:** `heat-map-view.js`, `styles.css`.
- **Qué:** clic, toque y foco; detalle único; una parada de tabulador y flechas; marcas de
  selección y foco.
- **Comprobación en Chrome:** nada elegido al abrir; clic, toque y solo teclado; cambio de día;
  días con 0 min; nombre accesible de cada día; hoy, selección y foco a la vez.
- **Cubre:** RF-4.1 a RF-4.4; RNF-2.
- **Hecho cuando:** la comprobación está anotada y la consola no tiene errores.

### [x] T9 — Actualización al guardar
- **Archivos:** `heat-map-view.js`; `app.js` solo si hace falta.
- **Qué:** repintar al guardar, conservar la selección vigente y actualizar su detalle.
- **Comprobación en Chrome:** guardar hoy, en el periodo y antes; con el detalle visible; pasar
  la medianoche con el reloj simulado, con y sin guardar; sesión a las 00:30.
- **Cubre:** RF-1.4, RF-1.5, RF-5.1 a RF-5.3.
- **Hecho cuando:** la comprobación está anotada y la consola no tiene errores.

## Cierre

### [x] T10 — Verificación final y documentación
- **Archivos:** `MEMORY.md`, `CLAUDE.md`, `specs/001-heat-map/tasks.md`.
- **Qué:** repasar la sección 9 de la spec y todos los casos límite de la sección 7; actualizar
  la memoria; proponer el cambio de `CLAUDE.md` (archivos y tests) y aplicarlo si se aprueba.
- **Cubre:** criterios de finalización; todos los RF y RNF.
- **Hecho cuando:** cada criterio está marcado con su prueba.

## Cobertura

| Requisito | Tareas |
|---|---|
| RF-1 | T1, T4, T7, T9 |
| RF-2 | T2, T3, T7 |
| RF-3 | T3, T7 |
| RF-4 | T6, T8 |
| RF-5 | T4, T9 |
| RF-6 | T1, T2, T4, T7 |
| RF-7 | T4, T5, T7 |
| RNF-1 a RNF-7 | T1, T5, T6, T7, T8 |

## Registro de comprobaciones (2026-11-25, Chrome con perfil temporal)

- **Lógica:** `node --test`, 38 tests en verde. 13 errores introducidos a propósito en una
  copia, los 13 detectados.
- **T7:** a 375 px, 80 días de 22 px, sin desplazamiento horizontal; a 1280 px, de 29 px. Mapa
  entre el resumen y el formulario; L, X, V y sep, oct, nov en su sitio; huecos tras hoy; borde
  de hoy visible en los cinco niveles. Niveles vecinos con contraste de 1,51 a 2,05 con
  daltonismo calculado (tres tipos). Cifras iguales antes y después: 3, 4, 95 min y 7 días. La
  página no pide nada a internet.
- **T7, datos dañados:** JSON cortado, texto vacío, `null`, objeto, número, lista vacía, mezcla
  con sesiones dañadas y almacenamiento bloqueado: 80 días pintados y datos guardados sin
  cambios. Los errores anteriores del resto de la página siguen (plan, sección 10).
- **T8:** nada elegido al abrir; clic, foco y flechas con un solo detalle; día con 0 min; no
  entra en huecos; Tab entra en hoy y sale al formulario; cada día tiene nombre accesible.
- **T9:** guardar hoy, en el periodo y antes; detalle visible actualizado; a las 00:30 no cambia
  sin guardar y sí al guardar; la selección se quita si sale del periodo.
- **Consola:** sin mensajes con datos normales.
- **Sin probar:** un móvil físico, un lector de pantalla real y otros navegadores.
