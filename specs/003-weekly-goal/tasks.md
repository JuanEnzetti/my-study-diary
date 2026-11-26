# Tareas 003 — Objetivo semanal de estudio

- **Spec:** `specs/003-weekly-goal/spec.md` (aprobada)
- **Plan:** `specs/003-weekly-goal/plan.md` (aprobado)
- **Estado:** aprobado
- **Aprobación:** 2026-11-25, por el usuario, según transmite el agente principal: «Sí, apruebo todo»,
  en respuesta a «¿Apruebas el plan, las tareas y las tres autorizaciones?»

## Reglas

- Una tarea cada vez, en orden, y se para al terminarla.
- En T1 a T3: primero los tests, se ven fallar, después el código.
- Toda tarea termina con `node --test` en verde: los 48 tests anteriores y los nuevos.
- La interfaz se comprueba con el MCP de Chrome; lo comprobado se anota en el registro del final.
- En T2, T4 y T6 se usa la skill `local-dates` y se anota su checklist.
- Tras cada tarea se actualiza la línea de «Próximos pasos» de `MEMORY.md`, sin alargarlo.
- Si falta una decisión, se para y se pregunta.

## Lógica

- [x] **T1. Validar el objetivo escrito y el guardado.** RF-2, RF-3, RF-5, RF-16, RF-21, RF-24, RNF-5
  - Archivos: `weekly-goal.js` y `tests/weekly-goal.test.js` (nuevos).
  - Qué: `MAX_WEEKLY_GOAL`, `parseGoalInput`, `parseStoredGoal`, exportación para Node y test de
    pureza del archivo.
  - Verificación: grupos «Escrito», «Guardado» y «Pureza» del plan; `node --test`.
  - Hecho cuando: todos los valores de las dos filas de la spec (escritos y guardados) dan el
    resultado esperado.

- [x] **T2. Calcular el total semanal.** RF-7, RF-9, RF-10, RNF-5
  - Archivos: `weekly-goal.js`, `tests/weekly-goal.test.js`.
  - Qué: `getWeeklyTotal(sessions, today)` con `getWeekStart` e `isValidSession`, en el orden
    guardado y sin `sumMinutesByDate`.
  - Verificación: grupos «Total», «Calendario» y «Decimales»; `node --test`.
  - Hecho cuando: pasan lunes, domingo, los dos cambios de hora, los cruces de mes y año, y diez
    sesiones de 0,1 alternadas en dos días dan 0.9999999999999999.

- [x] **T3. Calcular el progreso.** RF-7, RF-8, RF-9, RF-14, RNF-5
  - Archivos: `weekly-goal.js`, `tests/weekly-goal.test.js`.
  - Qué: `getGoalProgress(total, goal)`.
  - Verificación: grupo «Progreso»; `node --test`.
  - Hecho cuando: texto, porcentaje y cumplido coinciden con los ejemplos y casos límite.

## Interfaz

- [x] **T4. Usar el total único con un solo «hoy».** RF-9, RF-10, RF-28 (lectura), RNF-5, RNF-6
  - Archivos: `app.js`, `index.html` (cargar `weekly-goal.js`).
  - Qué: antes de cambiar, anotar racha, mejor racha, semana, mes y mapa con datos de ejemplo
    (con decimales, futuras y dañadas). Después, `readSessions()`, un `hoyEnTexto()` compartido en
    `mostrarTodo()` por el mapa y el total, y quitar `calcularMinutosSemana` y `lunesDeLaSemana`.
  - Verificación: Chrome con los mismos datos y «hoy»; datos ilegibles y almacenamiento bloqueado;
    `node --test`.
  - Hecho cuando: los cinco resultados y la lista son iguales que antes y la consola no tiene errores.

- [x] **T5. Estructura y estilos.** RF-1, RF-8, RF-14, RF-29, RNF-1, RNF-2, RNF-3, RNF-7
  - Archivos: `index.html`, `styles.css`, `weekly-goal-view.js` (nuevo, solo el `submit` con
    `preventDefault` para que el botón no recargue).
  - Qué: barra y mensaje ocultos en el resumen; formulario, aviso y error entre el resumen y el
    mapa; roles, foco y medidas del plan.
  - Verificación: Chrome a 375 y 1280 px, mostrando a mano la barra y los textos más largos;
    medir contrastes y tamaños; `node --test`.
  - Hecho cuando: sin desplazamiento horizontal ni recortes con «10080 de 10080 min» y
    «0.30000000000000004 de 10080 min», y cumplidos los contrastes y tamaños de RNF-2 y RNF-7.

- [x] **T6. Leer el objetivo y mostrar el progreso.** RF-4, RF-5, RF-6, RF-7, RF-8, RF-9, RF-10, RF-12, RF-14, RF-21, RF-22, RF-28 (al abrir), RNF-5
  - Archivos: `weekly-goal-view.js`, `app.js`.
  - Qué: `refreshWeeklyGoal` desde `mostrarTodo()`, aviso, barra, mensaje y campo al abrir.
  - Verificación: Chrome escribiendo la clave a mano: sin ella, válida, dañada e ilegible; guardar
    sesiones; recargar con algo a medio escribir; reloj simulado (medianoche, lunes, 00:30); medir
    la barra a 0, 30, 99,67 y 100 %, y 10079 de 10080; `node --test`.
  - Hecho cuando: cada lectura muestra lo esperado, el dato dañado no cambia y la barra cumple RF-8.

- [x] **T7. Guardar y quitar el objetivo.** RF-2, RF-3, RF-4, RF-10, RF-12, RF-14, RF-23, RF-24, RF-25, RF-28
  - Archivos: `weekly-goal-view.js`.
  - Qué: intento correcto completo con botón e Intro. Los fallos se capturan sin cambiar nada; sus
    mensajes llegan en T8.
  - Verificación: Chrome: fijar, cambiar, repetir y quitar; «0300» y espacios; objetivo dañado;
    sesiones que pasan a ser ilegibles; foco; comparar sesiones y copias carácter a carácter antes
    y después; `node --test`.
  - Hecho cuando: todo intento correcto actualiza sin recargar y las sesiones y copias son idénticas.

- [x] **T8. Errores de los intentos.** RF-16, RF-18, RF-19, RF-20, RF-22, RF-25, RF-29, RNF-2, RNF-3
  - Archivos: `weekly-goal-view.js`.
  - Qué: los tres mensajes, la sustitución y la retirada del error, y el párrafo nuevo en cada error.
  - Verificación: Chrome con `setItem`, `removeItem` y `getItem` que fallan por separado, y con todo
    bloqueado; errores iguales seguidos; error y guardar sesión; error junto al aviso y al de
    sesiones; `node --test`.
  - Hecho cuando: lo guardado, el progreso, el aviso y el campo no cambian con ningún fallo.

- [x] **T9. Verificación de casos límite y accesibilidad.** Todos los RF y RNF-1 a RNF-7
  - Archivos: `specs/003-weekly-goal/tasks.md` (registro); los de código solo si algo falla.
  - Qué: repasar la tabla de casos límite fila a fila, con dos pestañas, atrás y adelante, sin
    conexión, solo teclado, árbol de accesibilidad y `file://`. Lector de pantalla, si se puede.
  - Verificación: registro con cada fila y su resultado; `node --test`.
  - Hecho cuando: todas las filas tienen resultado y la consola no tiene errores; lo no probado está
    anotado.

## Cierre

**Validación de `reviewer` (entre T9 y T10):** T10 no empieza hasta que `reviewer` haya validado.

- [x] **T10. Criterios de finalización y memoria.** Todos los RF y RNF (cierre)
  - Archivos: `specs/003-weekly-goal/spec.md` (criterios y estado), `tasks.md`, `MEMORY.md`.
  - Qué: marcar cada criterio con su prueba; comparar con los resultados anotados en T4; pasar la
    spec a «implementada»; resumir `MEMORY.md` a 50 líneas como máximo; presentar al usuario la
    propuesta de `CLAUDE.md` del plan, sin aplicarla.
  - Verificación: `node --test`; líneas de `MEMORY.md`.
  - Hecho cuando: cada criterio está marcado con su prueba o anotado como pendiente.

## Cobertura

T9 comprueba además todos los requisitos y T10 los cierra.

| Requisito | Tareas | Requisito | Tareas |
|---|---|---|---|
| RF-1 | T5 | RF-19 | T8 |
| RF-2 | T1, T7 | RF-20 | T8 |
| RF-3 | T1, T7 | RF-21 | T1, T6 |
| RF-4 | T6, T7 | RF-22 | T6, T8 |
| RF-5 | T1, T6 | RF-23 | T7 |
| RF-6 | T6 | RF-24 | T1, T7 |
| RF-7 | T2, T3, T6 | RF-25 | T7, T8 |
| RF-8 | T3, T5, T6 | RF-28 | T4, T6, T7 |
| RF-9 | T2, T3, T4, T6 | RF-29 | T5, T8 |
| RF-10 | T2, T4, T6, T7 | RNF-1 | T5, T9 |
| RF-12 | T6, T7 | RNF-2 | T5, T8, T9 |
| RF-14 | T3, T5, T6, T7 | RNF-3 | T5, T8 |
| RF-16 | T1, T8 | RNF-4 | T9 |
| RF-18 | T8 | RNF-5 | T1, T2, T3, T4, T6 |
| | | RNF-6 | T4, T9 |
| | | RNF-7 | T5, T9 |

| Casos límite (todos se repasan en T9) | Tareas |
|---|---|
| Valores escritos, espacios y ceros delante | T1, T7, T8 |
| Contenido guardado dañado o ilegible | T1, T6, T7, T8 |
| Totales, decimales, semanas, fechas, 00:30 y cambios de hora | T2, T3, T6 |
| Barra y mensaje | T3, T5, T6, T7 |
| Página abierta tras la medianoche | T6, T7 |
| Fallos al guardar o quitar y almacenamiento bloqueado | T6, T8 |
| Sesiones ilegibles o bloqueadas | T4, T6, T7 |
| Campo a medio escribir, recarga, atrás y adelante | T6, T9 |
| Dos pestañas | T9 |

| Criterio de finalización | Tareas |
|---|---|
| Comprobación de cada RF, RNF y caso límite | T9, T10 |
| Tests en verde | Todas |
| «Hoy» en lunes, domingo, cambios de hora y cruces | T2 |
| Navegador a 375 y 1280 px | T5, T9 |
| Contrastes, tamaños y barra | T5, T6 |
| Teclado y lector de pantalla | T9 |
| Sesiones y copias idénticas | T7, T9 |
| Mismos resultados que antes | T4, T10 |
| Supuestos revisados, sin dudas | Hecho al aprobar la spec; se marca en T10 |

## Registro de comprobaciones

(Se rellena al implementar.)

### T2 (2026-11-25)

- Rojo: 71 tests, 12 fallan (`getWeeklyTotal is not a function`) y 59 pasan, entre ellos el nuevo
  que solo comprueba la zona horaria. Verde: 71 de 71; también con `TZ` en Madrid, Santiago y Auckland.
- Checklist `local-dates`:
  - [x] `toISOString()` o `new Date("AAAA-MM-DD")`: ninguno en `weekly-goal.js` (búsqueda y test de
    pureza). El test usa `new Date(año, mes - 1, día, 0, 30)`, en hora local.
  - [x] 86400000 milisegundos: ninguno (búsqueda). El lunes lo da `getWeekStart`, que usa `setDate`.
  - [x] Sesión de las 00:30: test en Madrid en tres lunes, cuando en UTC aún es domingo.
  - [x] Cambio de hora: test día a día de las semanas del 29/03/2026 y 25/10/2026, y las de Nueva
    York, en cuatro zonas.
  - [x] Fechas futuras: no suman (tests de lunes y entre semana).
- Sin comprobar: navegador y comparación con el total actual (T4); reloj simulado en la página (T6).

### T4 (2026-11-25)

Datos de ejemplo en el perfil temporal de Chrome, con el reloj sustituido dentro de la página
(`Date` simulado y después `mostrarTodo()`). Capturado antes de tocar el código y repetido después.

- **Normal** (fecha: minutos, en este orden, `id` de 1 a 14): 25/11/2026: 0,1; 24/11: 0,2; 23/11: 40;
  22/11: 99; 25/11: 20 (tema `<b>html</b>`); 28/11: 500; 02/01/2027: 60; 03/11/2026: 30; 02/11: 30;
  01/11: 30; 31/10: 30; 30/10: 30; 29/10: 30; 25/11: 130,5. Delante, diez dañadas: `null`, `"x"`, 7,
  `{}`, 31/11 con 10, 24/11 con `"10"`, -5 y `null`, `"24/11/2026"` y fecha 5.
- **Alternados:** diez sesiones de 0,1, entre el 24 y el 25/11/2026.
- **Seguidos:** 24 días desde 14 antes de hoy; el día `i` (de 0 a 23) tiene 0,1 si `i` es múltiplo
  de 5 y, si no, 10 + `i` × 0,2.

| Datos y «hoy» | Racha | Mejor | Semana | Mes | Días en el mapa | Lista |
|---|---|---|---|---|---|---|
| Normal, mié 25/11/2026 12:00 | 4 | 6 | 190.8 min | 7 días | 80 | 14 |
| Normal, lun 23/11/2026 00:30 | 2 | 6 | 40 min | 5 días | 78 | 14 |
| Normal, dom 29/11/2026 23:59 | 1 | 6 | 690.8 min | 8 días | 84 | 14 |
| Normal, lun 30/11/2026 00:01 | 0 | 6 | 0 min | 8 días | 78 | 14 |
| Alternados, 25/11/2026 | 2 | 2 | 0.9999999999999999 min | 2 días | 80 | 10 |
| Seguidos, dom 29/03/2026 00:30 y 12:00 | 15 | 15 | 73.5 min | 15 días | 84 | 24 |
| Seguidos, lun 30/03/2026 00:30 | 15 | 15 | 12.8 min | 15 días | 78 | 24 |
| Seguidos, dom 25/10/2026 00:30 y 12:00 | 15 | 15 | 73.5 min | 15 días | 84 | 24 |
| Seguidos, lun 26/10/2026 00:30 | 15 | 15 | 12.8 min | 15 días | 78 | 24 |
| Seguidos, vie 01/01/2027 00:30 | 15 | 15 | 50.099999999999994 min | 1 día | 82 | 24 |
| Sin datos; `{no json`; `{"a":1}`; bloqueado (25/11/2026) | 0 | 0 | 0 min | 0 días | 80 | 0 |

- **Antes y después:** idénticos byte a byte en los 16 casos. Se compara también el récord, el nivel
  y el texto de cada día del mapa, los rótulos, el HTML de la lista, el aviso y lo guardado.
- Cargas reales después del cambio: `localStorage` bloqueado desde el inicio (mismo texto que antes;
  `readSessions()` da `null`) e ilegible (total 0, aviso y copia). Vacío: `readSessions()` da `[]`.
- Guardar una sesión a 375 px: 30.5 → 50.5 min, mapa y lista al día, la dañada intacta y sin
  desplazamiento horizontal. Consola sin mensajes en todas las cargas.
- `mostrarTodo()` pasa el mismo «hoy» al mapa y al total (comprobado con las llamadas interceptadas).
- `node --test`: 77 de 77.
- `minutosSemana` sigue en `app.js`: aún pinta el total. Se quita en T6, cuando pinte la vista.
- Checklist `local-dates`:
  - [x] `toISOString()` o `new Date("AAAA-MM-DD")`: ninguno (búsqueda; solo un comentario que avisa).
  - [x] 86400000 milisegundos: ninguno (búsqueda).
  - [x] Sesión de las 00:30: casos de las 00:30 de la tabla; en Node, la comparación siguiente.
  - [x] Cambio de hora: en Node, cálculo antiguo y `getWeeklyTotal` iguales en 3040 momentos (760 días
    a las 00:30, 02:30, 12:00 y 23:59), en Madrid, Santiago y Auckland con el cambio de hora activo.
  - [x] Fechas futuras: el 28/11 y el 02/01/2027 no suman hasta su día (tabla).
- Sin comprobar: Chrome usa America/Buenos_Aires, sin cambio de hora, así que los días de cambio
  solo se han probado con él en Node; reloj simulado antes de cargar la página (T6); lector de pantalla.

### T5 (2026-11-25)

Chrome (`file://`, perfil temporal, almacenamiento vacío), a 375 px (móvil, densidad 2) y 1280 px
(densidad 1). Barra, mensaje, aviso de RF-21, error de RF-18 y 400 cifras en el campo, puestos a mano.

| Texto | Líneas a 375 | Líneas a 1280 | Desplazamiento horizontal o recortes |
|---|---|---|---|
| «90 de 300 min» | 2 | 1 | No |
| «10080 de 10080 min» | 2 | 1 | No |
| «0.30000000000000004 de 10080 min» | 4 | 2 | No |

- Contraste con el papel (y con la línea de la cuadrícula): mensaje, aviso y etiqueta 14,74 (12,49);
  error 6,37 (5,40); valor 9,81 (8,32). Campo 15,13 y botón 10,07, con su fondo.
- Barra: lleno y vacío 10,07; contorno y papel 5,61. Foco del campo: 9,81 (8,32), y 10,07 con el blanco.
- Tamaños: valor 28 px; mensaje, aviso, error, campo y botón 16 px; etiqueta 15 px.
- Adelanto de la barra, con el ancho escrito a mano (interior de 144,5 px y 249 px): a 0 %, vacía; a
  30 %, 30 % y 29,99 %; a 99,67 % y 10079 de 10080, 2 px vacíos; a 100 %, llena. Se repite en T6.
- Al abrir: barra y mensaje ocultos; aviso y error vacíos, sin ocupar sitio y sin `display: none`.
- Botón (clic) e Intro en el campo: no recargan, no cambian el campo ni guardan nada. Tabulador del
  campo al botón; foco visible en ambos. Consola sin mensajes.
- Árbol de accesibilidad: campo con su nombre, `status` con el progreso y el mensaje, dos `alert`.
- `node --test`: 77 de 77.
- Sin comprobar: lector de pantalla y móvil físico. Con colores forzados (alto contraste), el
  relleno y el fondo de la barra quedan del mismo color; el texto sigue dando el progreso.

### T6 (2026-11-25)

Chrome (`file://`, perfil temporal, contexto aislado). Reloj sustituido antes de cargar la página;
después se avanza con la página abierta. Las sesiones se guardan enviando el formulario desde código.

- **Lecturas con «hoy» 25/11:** sin clave, «90 min», sin barra, mensaje ni aviso; con 300, «90 de 300 min».
  El domingo 22, el futuro 28 y la dañada no suman.
- **Dañado** (`mostrarTodo()` en la página): "", «abc», 0, 30.5, 20000, «0300», « 300 », «300\n», -5,
  1e3, 5000 letras y «null»: sin objetivo, con aviso, y el dato no cambia. Al recargar, probado con
  20000: igual, y campo vacío. El aviso se retira al leer uno válido o nada.
- **Ilegible** (`getItem` que falla solo con esta clave) y `localStorage` bloqueado, ambos al abrir:
  «0 min», campo vacío y aviso; con el bloqueo, también el de sesiones. Ilegible que vuelve al
  guardar una sesión: progreso, sin aviso, campo aún vacío y dato igual.
- **Sesiones ilegibles al abrir:** «0 de 300 min», aviso de sesiones y copia.
- **Campo:** al abrir, «300»; con «45x» escrito, recargar da «300». Guardar una sesión no lo toca, ni
  un error de ejemplo. Si falla el guardado de la sesión, el progreso y las sesiones no cambian.
- **Reloj:** abierta el dom 29/11 a las 23:59, cumplida; el lun a las 00:30 no cambia sola; primera
  sesión con fecha del domingo (D-3), «5 de 300» (5 era la futura del lunes); segunda, «35 de 300». Abierta
  el lun 30/11 a las 00:30: «15 de 300», sin mensaje. Lun 23/11 a las 00:30: guardar 300 suma ese día.
- **Dos pestañas:** cambiar a 400 en B no altera A; al guardar una sesión, A pasa a «301 de 400».
- El mapa y el objetivo reciben el mismo «hoy». Repintar sin cambios no toca el texto ni el aviso.

| N de M | Ancho lleno y vacío a 375 (interior 144,5 px) | A 1280 (interior 249 px) |
|---|---|---|
| 0 de 300 | 0 y 144,5 | 0 y 249 |
| 90 de 300 | 43,34 y 101,16 (30 %) | 74,69 y 174,31 (29,99 %) |
| 299 de 300 | 142,5 y 2 | 247 y 2 |
| 300 y 350 de 300 | 144,5 y 0 | 249 y 0 |
| 10079 de 10080 | 142,5 y 2 | 247 y 2 |

- 0.9999999999999999 de 1 deja 2 px (interior de 249 px). Sin desplazamiento horizontal ni consola.
- `minutosSemana` eliminada de `app.js`. `node --test`: 77 de 77.
- Checklist `local-dates`:
  - [x] `toISOString()` o `new Date("AAAA-MM-DD")`: ninguno (búsqueda; solo un comentario que avisa).
  - [x] 86400000 milisegundos: ninguno (búsqueda).
  - [x] Sesión de las 00:30: guardada y contada en la página el lunes 23/11 simulado.
  - [x] Cambio de hora: solo con los tests de Node de T2 (zonas con cambio); T6 no añade cálculos.
  - [x] Fechas futuras: el 28/11 y el 30/11 no suman hasta su día.
- Sin comprobar: cambio de hora en Chrome (su zona no lo tiene), cerrar y reabrir el navegador (el
  perfil es temporal), lector de pantalla, móvil físico, y atrás y adelante (T9).

### T7 (2026-11-25)

Chrome (`file://`, perfil temporal, contexto aislado), a 375 px (móvil) y 1280 px, con «hoy» 25/11/2026
simulado antes de cargar a 375 px. Sesiones de ejemplo con espacios, saltos de línea, dos dañadas, una
futura y una del domingo anterior, más las copias 1 y 10. Total: 350.

- **Fijar, cambiar, repetir y quitar:** vacío sin nada guardado, 300, 300 otra vez, 400 (sin mensaje), 351,
  350 (con mensaje), 1, 10080, vacío y espacios (sin barra ni mensaje). «0300» y « 300 » guardan y muestran «300».
- **No válidos** (0, abc, 10.080, 10081, 300.0, cifras árabes, 5000 cifras): no cambian nada.
- **Dañado** («abc», "", «0300», 20000): con 0 sigue igual y con aviso; con 300 se sustituye, y con vacío se
  borra; en ambos se retira el aviso. Ilegible que vuelve: vacío lo quita (D-8).
- **Sesiones ilegibles o bloqueadas con la página abierta**, también con otra semana: se mantiene 350 y
  cambian texto, barra y mensaje. Al volver a leerse, el total es el de ese momento.
- **Reloj:** dom 29/11 a las 23:59, «850 de 500 min»; lun 30/11 a las 00:30, «0 de 500 min», sin mensaje.
- **Otra pestaña** (sesión de 7 añadida a mano a lo guardado): «357 de 300 min».
- **Fallos** de `setItem`, `removeItem` y `getItem` por separado (con `getItem`, ningún borrado) y con todo
  bloqueado: objetivo, progreso, aviso y campo no cambian; con dañado y `setItem`, tampoco.
- **Teclado y ratón reales:** Intro en el campo, clic e Intro en el botón; el foco no se mueve, no recarga ni
  guarda sesiones. Al recargar, 400 se conserva.
- **Sesiones y copias** idénticas carácter a carácter tras cada intento; racha, mes, mapa, lista y aviso
  de sesiones, sin cambios. Con las sesiones ilegibles, tampoco cambian ni se crea copia.
- Sin desplazamiento horizontal. Consola sin mensajes. `node --test`: 77 de 77.
- Sin comprobar: dos pestañas reales (T9), cerrar y reabrir el navegador, lector de pantalla y móvil físico.

### T8 (2026-11-25)

Chrome (`file://`, perfil temporal, contexto aislado). 1048 comprobaciones automáticas en la página a 375 px
(móvil), sin fallos, con una sesión de 350 hoy, una dañada y una copia ilegible. Objetivo inicial: ninguno,
300, 400, «abc», "", «0300» y 20000. Fallos con métodos de `localStorage` sustituidos.

- **RF-16:** los 16 valores no válidos de la spec (miles de cifras: 5000 nueves), y «abc» con todo bloqueado.
- **RF-18:** « 0500 » con `setItem` que falla y con todo bloqueado.
- **RF-19:** `removeItem` (con objetivo), `getItem` y todo bloqueado, con campo vacío y con espacios. Sin
  nada guardado, vacío no llama a `removeItem` y es correcto. Con solo `getItem` roto, guardar 400 funciona y
  mantiene el total.
- En cada fallo no cambian lo guardado (todas las claves, carácter a carácter), progreso, aviso, racha, lista,
  avisos de sesiones ni campo. Repetido, queda un solo error y en un párrafo nuevo.
- **RF-20:** sustitución entre las tres causas; lo retiran guardar, guardar el mismo número y quitar. Guardar
  una sesión, con éxito o con fallo, no lo retira; el intento correcto no toca el error de sesiones.
- **Todo bloqueado al abrir** (antes de cargar, a 1280 px): aviso de RF-21 y de sesiones; Intro en el campo
  vacío, error de RF-19; «5» e Intro en el botón, error de RF-18. El foco no se mueve y no recarga. Al
  volver sin bloqueo, el objetivo guardado seguía igual.
- **Todo bloqueado con la página abierta**, con objetivo vigente (con y sin cumplir), sin él y con aviso.
- **RF-29:** aviso, error del objetivo, aviso y error de sesiones a la vez a 375 px: todos visibles, aviso encima
  del campo y error bajo el botón. Sin desplazamiento horizontal. Error: 16 px y #b3261e (contraste de T5).
  Árbol de accesibilidad: cada uno en su `alert`.
- Consola sin mensajes. `node --test`: 77 de 77.
- Sin comprobar: anuncio real del error repetido con lector de pantalla, móvil físico, dos pestañas (T9) y un
  bloqueo o falta de espacio reales del navegador (son simulados).

### T9 (2026-11-25)

Chrome (`file://`, perfil temporal, contexto aislado). Sin fallos: no se ha cambiado código. Cómo se comprobó:

- **A:** batería en la página, con «hoy» simulado: 251 comprobaciones a 375 px (móvil, red desconectada) y otra
  vez a 1280 px, sin fallos. La apertura se reproduce con `mostrarTodo()` y `showGoalInField()`, y los envíos
  con `requestSubmit()`. Fallos con métodos de `localStorage` sustituidos.
- **C:** carga o recarga real de la página, también sin red; los bloqueos se simulan antes de cargar.
- **P:** dos pestañas reales con el mismo almacenamiento. **Q:** además, con el espacio lleno de verdad.
- **T:** además, la lógica con `node --test`. **N:** navegación real.

| # | Fila de la spec | Resultado | Cómo |
|---|---|---|---|
| 1 | Nunca se ha guardado un objetivo | Correcto | A T |
| 2 | 300 y sin sesiones | Correcto | A T |
| 3 | 300; totales 299, 300 y 350 | Correcto | A T |
| 4 | 10080 y total 10079 | Correcto | A T |
| 5 | Objetivos 1 y 10080 | Correcto | A T |
| 6 | Valores no válidos (los 16, con objetivo, sin él y dañado) | Correcto | A T |
| 7 | «0300» y « 300 » | Correcto | A T |
| 8 | Vacío o espacios sin nada guardado; mismo número | Correcto | A |
| 9 | No válido y después vacío | Correcto | A |
| 10 | Dos intentos fallidos | Correcto, con el límite indicado | A: un párrafo nuevo en cada error; que se oiga, sin comprobar |
| 11 | Error visible y se guarda una sesión | Correcto | A |
| 12 | 350: de 300 a 400, a 300 y a ninguno | Correcto | A T |
| 13 | Cumplido el domingo; se abre el lunes | Correcto | C |
| 14 | Abierta de domingo a lunes sin acciones | Correcto | A |
| 15 | La misma, con sesión o intento | Correcto | A |
| 16 | Primera sesión y luego otra (D-3) | Correcto | A |
| 17 | Hoy lunes / domingo | Correcto | A T |
| 18 | Domingo anterior, futura o dañada | Correcto | A T |
| 19 | Varias el mismo día | Correcto | A T |
| 20 | Sesión a las 00:30 | Correcto | A T |
| 21 | Cambio de hora, mes y año | Correcto, con el límite indicado | T. Cruce de mes y año, también A; cambio de hora, no comprobado en Chrome (su zona no lo tiene) |
| 22 | 0,1 y 0,2 | Correcto | A T |
| 23 | Diez de 0,1 y objetivo 1 | Correcto | A T |
| 24 | Falla al guardar una sesión | Correcto | A Q |
| 25 | Falla al guardar el objetivo (válido, dañado, ninguno) | Correcto | A Q |
| 26 | Falla al quitar (válido o dañado) | Correcto | A |
| 27 | Bloqueado al abrir, con y sin objetivo previo | Correcto | C |
| 28 | Bloqueado después de abrir | Correcto | A |
| 29 | Guardado no válido | Correcto | A T; al recargar, C con «0300» y vacío |
| 30 | Dañado e intento no válido | Correcto | A |
| 31 | Dañado y se guarda uno válido, o vacío | Correcto | A |
| 32 | Ilegible que vuelve al recargar | Correcto | C |
| 33 | Ilegible que vuelve al guardar una sesión | Correcto | C: campo vacío; al pulsar se quita |
| 34 | Ilegible al abrir y se pulsa vacío | Correcto | C |
| 35 | Se daña con la página abierta | Correcto | A |
| 36 | Al abrir, sesiones ilegibles o bloqueadas | Correcto | C |
| 37 | Las mismas y un intento correcto | Correcto | C |
| 38 | Dejan de leerse con la página abierta | Correcto | A |
| 39 | Campo a medio escribir: sesión; recarga | Correcto | A; recarga, C |
| 40 | Atrás o adelante con la página restaurada | Correcto, con el límite indicado | N: con `file://` Chrome no la restaura, la recarga y muestra el objetivo vigente (RF-5). Servida en 127.0.0.1 sí la restaura: no cambia nada, ni el campo «45x», con el objetivo cambiado en lo guardado. Probado con atrás y con adelante (`pageshow` con `persisted`) |
| 41 | Pestañas: A 400, B guarda sesión | Correcto | P |
| 42 | Pestañas: A 400, B pulsa | Correcto | P |
| 43 | Pestañas: A quita, B pulsa | Correcto | P |
| 44 | Pestañas: A crea, B pulsa vacío | Correcto | P |
| 45 | Pestañas: A quita o daña, B no válido o falla | Correcto | P: los fallos de B, simulados |
| 46 | Pestañas: A guarda sesiones, B el objetivo | Correcto | P: el mapa y la lista de B, al guardar después una sesión |

- **Sin conexión (RNF-4):** con la red desconectada (una petición de prueba falla), se recarga la web y se fija,
  ve, cambia y quita el objetivo. Sin URL externas en el código (búsqueda).
- **Solo teclado real**, a 375 px: Tab llega al campo desde el aviso de sesiones; «300» e Intro; «x» e Intro, con
  error; «5», Tab y Espacio en el botón; Mayús+Tab, borrar e Intro. Foco de 3 px visible, no se mueve y no
  recarga. Sesiones y copia, iguales carácter a carácter tras cada paso.
- **Clic real fallido** («10.080»): error, dato y progreso igual, foco en el botón.
- **Árbol de accesibilidad:** campo con su nombre, `status` con el progreso y dos `alert`.
- **375 px:** «10080 de 10080 min», mensaje, aviso (puesto a mano) y error juntos: 28, 16, 16 y 16 px, sin recortes ni
  desplazamiento horizontal. A 1280 px, tampoco. Contrastes: los de T5 (estilos sin cambios).
- **Dos pestañas:** A no cambia hasta su siguiente lectura o intento (RF-12).
- Consola sin mensajes de la página. Aparte: la petición de prueba sin red y un 404 del servidor de prueba.
- `node --test`: 77 de 77; también con `TZ` en Madrid, Santiago, Auckland y Nueva York.
- **Anotado, no exigido por la spec:** con colores forzados, relleno y fondo de la barra se confunden.
- **No comprobado:** lector de pantalla (el anuncio real de aviso, errores repetidos, progreso y mensaje de
  RNF-2); móvil físico; cambio de hora en Chrome; cerrar y reabrir el navegador (RF-4: perfil temporal; solo
  recargas y una pestaña nueva); bloqueo real del almacenamiento por el navegador.

## Cierre (2026-11-26)

- `node --test`: 77 de 77. El test de pureza ahora también rechaza `new Date` en cualquier forma
  y `performance` (hallazgo 1 de reviewer).
- Comprobación final en Chrome a 375 px: fijar «0300» (se guarda 300), seis valores no válidos,
  cumplido, guardar una sesión, quitar, fallo al guardar, dato dañado y reparación; recarga con el
  objetivo; consola vacía; Lighthouse: accesibilidad 100.
- No registrado: el rojo de T1 y T3 no quedó anotado en este archivo; constaba en los informes de
  implementer.
- Sin comprobar: lector de pantalla, móvil físico, cerrar y reabrir el navegador, y cambio de
  hora y bloqueo reales en Chrome.
- `CLAUDE.md` actualizado con la aprobación del usuario.
