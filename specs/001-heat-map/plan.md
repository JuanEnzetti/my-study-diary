# Plan 001 — Mapa de calor de estudio

- **Spec:** `specs/001-heat-map/spec.md`
- **Estado:** aprobado el 2026-11-25
- **Fecha:** 2026-11-25

## 1. Archivos

| Archivo | Cambio | Responsabilidad | Cubre |
|---|---|---|---|
| `heat-map.js` | Nuevo | Lógica pura del mapa, en inglés. Sin DOM, sin `localStorage` y sin consultar el reloj | RF-1, RF-2, RF-3, RF-4 (texto), RF-6, RF-7.3 a 7.5 |
| `heat-map-view.js` | Nuevo | Pintar el mapa y la leyenda; selección y teclado. No calcula fechas ni niveles | RF-2.3, RF-3, RF-4, RF-5, RF-7 |
| `tests/heat-map.test.js` | Nuevo | Tests de la lógica con `node --test` | Ver sección 7 |
| `index.html` | Modificado | Sección del mapa entre el resumen y el formulario; carga de los dos scripts nuevos antes de `app.js` | RF-7.1 |
| `styles.css` | Modificado | Cuadrícula, colores, leyenda, hoy, selección y foco | RF-2.3, RF-3.1, RF-7.2, RF-7.6, RNF-1, RNF-2, RNF-6 |
| `app.js` | Modificado | Solo leer las sesiones y llamar a la vista desde `mostrarTodo()` | RF-1.4, RF-5, RF-6.4 |

No cambian el formato de los datos, la clave de guardado ni los cálculos actuales.

Orden de carga con `<script src>` clásico: `heat-map.js`, `heat-map-view.js`, `app.js`. Así
funciona con doble clic.

## 2. Datos que maneja la lógica

- **Fecha:** texto `"AAAA-MM-DD"` en hora local. `today` siempre es un parámetro.
- **Sesión:** la guardada hoy, con `fecha` y `minutos`. Esos nombres no se traducen porque
  son datos del usuario (principio 5).
- **Día:** `{ date, minutes, level, isToday }`, o `null` si es posterior a hoy.
- **Mapa:** `{ weeks, monthLabels }`. `weeks` son 12 listas de 7 posiciones, de lunes a
  domingo. `monthLabels` son 12 posiciones: un texto o `null`.

## 3. Funciones puras (`heat-map.js`)

| Función | Qué devuelve | Cubre |
|---|---|---|
| `parseLocalDate(text)` | Fecha local, o `null` si no tiene formato estricto o no existe | RF-6.1 |
| `formatLocalDate(date)` | `"AAAA-MM-DD"` con los componentes locales | RF-1.1 |
| `addDays(dateText, amount)` | Otra fecha en texto, sumando con `setDate` | RF-1.1 |
| `getWeekStart(dateText)` | El lunes de esa semana | RF-1.1, RF-1.2 |
| `isValidSession(session)` | Si tiene fecha real y minutos numéricos finitos mayores que 0 | RF-6.1 |
| `sumMinutesByDate(sessions, today)` | Minutos por fecha, sin sesiones inválidas ni futuras | RF-2.2, RF-6.1, RF-6.3 |
| `getIntensityLevel(minutes)` | Nivel de 0 a 4 | RF-2.1 |
| `getMonthLabels(weekStarts, today)` | Los 12 rótulos de mes o `null` | RF-7.4, RF-7.5 |
| `formatDayDetail(day)` | «martes, 24 de noviembre de 2026: 75 min» | RF-4.1, RF-4.2 |
| `buildHeatMap(sessions, today)` | El mapa completo; no modifica `sessions` | RF-1, RF-2, RF-6, RF-7.2, RF-7.6 |
| `findNextDate(heatMap, date, key)` | La fecha a la que lleva una flecha, o la misma si no hay | RF-4.1 |

`INTENSITY_LEVELS` es una constante con el mínimo de cada nivel y su texto de leyenda; la
usan el cálculo y la leyenda, para que no puedan discrepar (RF-2.1, RF-3.1).

## 4. Algoritmo en pseudocódigo

```text
construir mapa(sesiones, hoy):                                  RF-1, RF-2, RF-6
  si sesiones no es una lista: usar una lista vacía             RF-6.4
  minutosPorFecha ← sumar minutos(sesiones, hoy)
  primerLunes ← lunes de la semana de hoy, menos 77 días        RF-1.1
  para semana de 0 a 11:                                        RF-1.2, RF-7.2
    lunes ← primerLunes más semana × 7 días
    para día de 0 a 6:
      fecha ← lunes más día días
      si fecha > hoy: añadir hueco                              RF-1.3
      si no:
        minutos ← minutosPorFecha[fecha], o 0                   RF-6.2
        añadir { fecha, minutos, nivel, esHoy: fecha = hoy }    RF-2.1, RF-7.6
  rótulos ← rótulos de mes(lunes de cada semana, hoy)
  devolver semanas y rótulos

sumar minutos(sesiones, hoy):
  para cada sesión:
    si no es válida: ignorarla                                  RF-6.1
    si su fecha > hoy: ignorarla                                RF-6.3
    sumar sus minutos a su fecha                                RF-2.2
  (nunca se escribe en las sesiones recibidas)                  RF-6.5

nivel(minutos):                                                 RF-2.1
  0 → 0;  < 30 → 1;  < 60 → 2;  < 120 → 3;  resto → 4

rótulos de mes(lunes, hoy):
  para cada semana: si contiene un día 1 no posterior a hoy,
    rótulo ← mes abreviado de ese día                           RF-7.4
  si la semana 0 y la 1 no contienen un día 1:
    rótulo de la semana 0 ← mes de su lunes                     RF-7.5
```

## 5. Cómo se pinta

### Estructura
```text
[Resumen: Esta semana | Este mes]
Últimas 12 semanas
     sep     oct      nov           ← RF-7.4, RF-7.5
L    ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢ ▢        ← RF-7.2, RF-7.3
     ▢ ▢ ▢ …
X    ▢ ▢ ▢ …
…
martes, 24 de noviembre…: 75 min    ← RF-4
▢ 0 min  ▢ Menos de 30  ▢ 30 o más  ▢ 60 o más  ▢ 120 o más   ← RF-3
[Formulario]
```

- **Días:** cada día es un `<button type="button">` con un `aria-label` igual a su detalle
  (RF-4.1, RNF-2). Los futuros son huecos sin botón (RF-1.3).
- **Tamaño:** a 375 px la hoja deja 317 px útiles, medidos en la captura anterior. Con 16 px
  de rótulos, 4 px de separación y 3 px entre días, cada día mide unos 22 px (RNF-1).
- **Textos:** todos en español (RNF-3) y escritos con `textContent`.
- **Detalle:** párrafo con altura reservada, vacío hasta elegir un día (RF-4.4).
- **Leyenda:** lista generada desde `INTENSITY_LEVELS` (RF-3.1).

### Colores (RF-2.3)
| Nivel | Color | Contraste con el anterior |
|---|---|---|
| 0 | `#ffffff`, con borde `#c9d3e1` (claro, para no destacar más que el nivel 1) | — |
| 1 | `#c3d0f0` | 1,54 |
| 2 | `#8da3dc` | 1,62 |
| 3 | `#5470bf` | 1,89 |
| 4 | `#1f3a93` (la tinta) | 2,13 |

Los niveles vecinos se distinguen por claridad, no solo por tono. El número exacto está
siempre en el detalle y en el `aria-label` (RNF-2).

### Hoy, selección y foco
- **Hoy:** borde grafito por fuera, separado del día, que no tapa el color (RF-7.6). El
  grafito pegado a la tinta solo da 1,50 de contraste; por eso se separa.
- **Seleccionado:** punto blanco con contorno grafito en el centro.
- **Foco de teclado:** anillo interior blanco y grafito. Las tres marcas pueden coincidir.

### Comportamiento
```text
pintar mapa(sesiones, hoy):                                     RF-1.4, RF-5.1
  mapa ← construir mapa(sesiones, hoy)
  si el día seleccionado ya no está en el mapa: quitar selección
  pintar rótulos, días y leyenda
  si hay selección: pintar su detalle actualizado               RF-5.3

al hacer clic, tocar o recibir el foco un día:                  RF-4.1
  seleccionarlo y sustituir el detalle                          RF-4.3
al pulsar una flecha:
  arriba/abajo: día anterior/siguiente de la misma semana
  izquierda/derecha: semana anterior/siguiente
  si el destino existe, mover el foco
```

- **Teclado:** el mapa es una sola parada de tabulador. Empieza en hoy o en el día elegido.
- **Selección:** vive en memoria; no se guarda y se pierde al recargar (RNF-4).
- **Actualización:** `mostrarTodo()` ya se ejecuta al abrir y tras cada guardado. No hay
  temporizadores, así que tras la medianoche el mapa no cambia solo (RF-1.4, RF-1.5, RF-5).
- **Datos dañados:** el mapa se pinta **lo primero** en `mostrarTodo()`, con una lectura
  protegida: si la lectura falla o no da una lista, recibe una vacía (RF-6.4).

## 6. Decisiones técnicas

| # | Decisión | Por qué | Alternativa descartada |
|---|---|---|---|
| D1 | Funciones de fecha propias del mapa | Decisión del usuario: no tocar código que funciona y no tiene tests | Extraer las de `app.js`: sin duplicados, pero más riesgo |
| D2 | Scripts clásicos; `heat-map.js` se exporta solo si existe `module` | Funciona con `file://` y con `node --test` | Módulos ES: el navegador los bloquea con doble clic |
| D3 | Lógica y vista en archivos separados | Principio 3: se prueba sin navegador | Todo en `app.js`: no se puede importar en los tests |
| D4 | `today` como texto `"AAAA-MM-DD"` | Sin horas ni zonas que desplacen el día; se compara como texto | Recibir un `Date` |
| D5 | Cuadrícula CSS con botones | Accesible y sin librerías | `canvas` o SVG: habría que recrear teclado y lectores |
| D6 | Una parada de tabulador y flechas | Decisión del usuario | Tabulador en los 84 días |
| D7 | Detalle en un párrafo fijo | Sirve en táctil y no tapa el mapa | Globo flotante |
| D8 | Repintar el mapa entero | 84 elementos: simple y suficiente | Actualizar solo el día cambiado |
| D9 | Meses en una lista fija en español | Mismo resultado en todos los navegadores | `Intl`: abrevia distinto según la versión |
| D10 | Leyenda «Menos de 30», «30 o más»… | Es exacta también con decimales | «1–29»: no incluye 29,5 |
| D11 | Textos largos de fecha con `toLocaleDateString("es-ES")` | Es lo que ya usa la lista | Componerlos a mano |

Los archivos nuevos no son dependencias ni exigen build (principio 1).

## 7. Estrategia de tests

Se ejecutan con `node --test`, sin instalar nada (`node:test` y `node:assert`). Primero se
escriben los tests de cada función, se ven fallar y después se implementa. No se avanza en
rojo (principio 4).

| Grupo | Qué comprueba | Cubre |
|---|---|---|
| Periodo | Hoy lunes, miércoles y domingo; 25/11/2026 empieza el 07/09/2026; 12 semanas; 84 días el domingo | RF-1.1 a 1.3 |
| «Hoy» | Cambiar `today` cambia el periodo, y con el mismo `today` no cambia | RF-1.4, RF-1.5 |
| Calendario | Cruce de mes y año, 29/02/2028, cambios de hora de Madrid (29/03 y 25/10/2026) y de otra zona | RF-1.2 |
| Niveles | 0, 1, 29, 29,5, 30, 59, 60, 119, 120 y 1500 | RF-2.1 |
| Suma | 20 + 20 da 40; válida más dañada | RF-2.2, RF-6.1 |
| Leyenda | Cinco entradas cuyos mínimos coinciden con `getIntensityLevel` | RF-3.1 |
| Detalle | Con minutos y con 0 | RF-4.1, RF-4.2 |
| Flechas | Cuatro direcciones, bordes del mapa y huecos futuros | RF-4.1 |
| Actualización | Añadir una sesión del periodo cambia solo su día; una anterior no cambia nada | RF-5.1, RF-5.2 |
| Datos dañados | Nulos, números, textos, sin fecha, 31/02, `"2026-2-3"`, minutos 0, negativos, texto, `NaN` e infinito | RF-6.1 |
| Vacíos | Lista vacía, `null`, objeto y lista con todo dañado | RF-6.2, RF-6.4 |
| Futuras | Una sesión de mañana no suma | RF-6.3 |
| Sin efectos | Las sesiones congeladas quedan idénticas | RF-6.5 |
| Rótulos | Día 1 en la primera, segunda y última columna; día 1 futuro; inicio a mitad de mes | RF-7.4, RF-7.5 |
| Pureza | `heat-map.js` no contiene `document`, `localStorage`, `Date.now`, `new Date()` ni `toISOString` | RNF-7 |

El caso de las 00:30 se cubre porque la lógica recibe el día ya en texto; que `app.js` dé el
día local correcto se comprueba en Chrome con el reloj simulado.

### Comprobación manual con Chrome DevTools
Solo lo que necesita navegador:

| Qué | Cubre |
|---|---|
| Orden en pantalla, columnas, L, X, V y borde de hoy en los cinco niveles | RF-7.1 a 7.3, RF-7.6 |
| Colores distinguibles, también simulando daltonismo | RF-2.3 |
| Clic, toque y teclado; un solo detalle; nada seleccionado al abrir | RF-4 |
| Guardar hoy, en el periodo y antes; detalle visible actualizado | RF-5 |
| Pasar la medianoche con el reloj simulado | RF-1.4, RF-1.5 |
| Datos ilegibles, `null` y sesiones dañadas; lo guardado queda idéntico | RF-6 |
| 375 px y escritorio, sin conexión y consola | RNF-1, RNF-5, RNF-6 |
| Racha, mejor racha, semana y mes, iguales antes y después | Sección 9 de la spec |

## 8. Cobertura

| Requisito | Dónde | Cómo se comprueba |
|---|---|---|
| RF-1 | `buildHeatMap`, `mostrarTodo()` | Tests y manual |
| RF-2 | `getIntensityLevel`, `sumMinutesByDate`, estilos | Tests y manual |
| RF-3 | `INTENSITY_LEVELS`, vista | Tests y manual |
| RF-4 | `formatDayDetail`, `findNextDate`, vista | Tests y manual |
| RF-5 | `mostrarTodo()`, vista | Tests y manual |
| RF-6 | `isValidSession`, `sumMinutesByDate`, lectura protegida | Tests y manual |
| RF-7 | `getMonthLabels`, vista, estilos | Tests y manual |

| Principio | Cómo se cumple |
|---|---|
| 1 Simplicidad | Archivos planos, sin dependencias ni build |
| 2 La spec manda | Solo lo que pide la spec; decisiones consultadas |
| 3 Lógica separada | `heat-map.js` es puro y recibe `today` |
| 4 Tests | `node --test` antes de cada paso |
| 5 Datos | El mapa solo lee; no cambia el formato |
| 6 Idioma | Código nuevo en inglés; interfaz en español |

## 9. Orden de trabajo

1. Anotar los resultados actuales de racha, mejor racha, semana y mes.
2. Tests y lógica: fechas, periodo, validación, niveles, rótulos, detalle y flechas.
3. Sección, estilos y vista.
4. Conexión en `app.js`.
5. `node --test` y comprobación en Chrome.
6. `MEMORY.md` y, si se aprueba, `CLAUDE.md`.

## 10. Riesgos y límites

- **Errores actuales con datos dañados:** si lo guardado es `null` o un objeto, o hay
  elementos nulos o sin fecha, los cálculos actuales fallan. El mapa se pinta igualmente,
  pero el resto de la página no. Corregirlo queda fuera de la spec.
- **Pérdida de datos ya existente:** si el JSON está corrupto, guardar otra sesión lo
  sobrescribe. El mapa no lo causa ni lo arregla, pero choca con el principio 5.
- **Código anterior:** sigue en español y sin tests; los principios 3, 4 y 6 se aplican solo
  a lo nuevo, por decisión del usuario.
- **Nombres globales:** los scripts clásicos comparten espacio. Los nombres nuevos, en
  inglés, no deben coincidir con los de `app.js`.
- **`CLAUDE.md`:** dice que el proyecto tiene tres archivos y que no hay tests; habrá que
  actualizarlo.
