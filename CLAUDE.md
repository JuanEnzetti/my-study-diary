# CLAUDE.md — Diario de Estudio
Web estática para registrar sesiones de estudio y motivarse viendo la racha de días
seguidos. Proyecto didáctico: el código debe poder entenderlo alguien que empieza a
programar.
## Stack y estructura
- HTML, CSS y JavaScript puros: sin frameworks, librerías, npm, bundler ni build.
- `index.html` (estructura), `styles.css` (estilos), `app.js` (lógica y datos).
- `heat-map.js` (lógica pura, en inglés), `heat-map-view.js` (interfaz del mapa) y `tests/`
(tests de la lógica).
- `session-data.js` (lógica para leer y guardar sesiones sin perder datos).
- `weekly-goal.js` (lógica pura del objetivo semanal) y `weekly-goal-view.js` (su interfaz).
- Debe funcionar abriendo `index.html` con doble clic (`file://`): nada de módulos ES
(`type="module"`), `fetch` a archivos locales ni nada que requiera servidor.
## Convenciones
- Textos de la interfaz en español.
- Código simple, nombres descriptivos y comentarios solo donde aporten.
- Diseño limpio y responsive; cualquier pantalla nueva debe verse bien en el móvil.
## Datos
- localStorage, clave `diario-estudio-sesiones`: array de `{ id, fecha: "AAAA-MM-DD", tema,
minutos }` (`id` es `Date.now()` al guardar).
- Clave `diario-estudio-objetivo-semanal`: el objetivo, solo cifras ("300"). Sin clave, no
hay objetivo.
- Si cambias la forma de los datos, mantén compatibilidad con lo ya guardado o el usuario
perderá sus sesiones.
## Fechas y racha (fácil equivocarse)
- Trabaja siempre con la fecha local del usuario. Nunca uses `toISOString()` ni `new
Date("AAAA-MM-DD")`: se interpretan en UTC y desplazan el día.
- Racha = días consecutivos con al menos 1 sesión que terminan hoy. Si hoy no hay sesión
pero ayer sí, la racha sigue viva y se cuenta desde ayer.
- Varias sesiones el mismo día cuentan como un solo día. Las fechas futuras no suman.
- Mejor racha = la secuencia más larga de días consecutivos con sesión en todo el
historial (sin fechas futuras). Se calcula a partir de las sesiones, no se guarda.
- Semana = de lunes a domingo en fecha local (`getWeekStart`). El total semanal suma
los minutos de las sesiones válidas desde el lunes hasta hoy; su única fuente es
`getWeeklyTotal`. Se calcula, no se guarda.
- Mes = del día 1 a hoy en fecha local (prefijo "AAAA-MM" de `hoyEnTexto()`). "Este mes"
cuenta los días distintos con sesión, sin fechas futuras. Se calcula, no se guarda.
- Para cualquier cambio con fechas, usa la skill `local-dates` y su checklist.
## Forma de trabajar
- Haz solo lo que se pide: no añadas funcionalidades por tu cuenta.
- Cambios pequeños y enfocados; no reescribas lo que ya funciona.
- Al terminar, resume qué has cambiado y cualquier decisión que deba revisar.
## Memoria
- Al empezar, lee `MEMORY.md` para conocer el estado del proyecto y las decisiones
tomadas.
- Al terminar una tarea, actualízalo: estado actual, decisiones importantes (con su
porqué) y errores a evitar.
- Mantenlo breve (máximo ~50 líneas): resume o elimina lo que ya no aporte.
- Si algo se convierte en una regla permanente, propón moverlo a `CLAUDE.md` en lugar de
dejarlo en la memoria.
- No guardes nunca datos sensibles (claves, tokens, datos personales).
## Comandos
- Tests: `node --test`
## Reglas
- Lee `docs/constitution.md` y la spec activa (`specs/NNN-*/`) antes de tocar código. 
## Límites
- ✅ Siempre: respetar las reglas de fechas y racha, mantener los textos en español.
- ✅ Siempre: actualizar `MEMORY.md` al terminar cada tarea.
- ⚠️ Pregunta antes: crear archivos nuevos, cambiar el formato de los datos guardados.
- 🚫 Nunca: añadir dependencias, frameworks o un paso de build.
## Verificación
- La lógica nueva se prueba con `node --test`; la interfaz, con el MCP de Chrome DevTools.
Después de cada cambio, verifica con el MCP de Chrome
DevTools: abre `index.html`, prueba la funcionalidad, revisa la consola y comprueba la
vista móvil. 
- Para empezar de cero: DevTools → Application → Local Storage → borrar la clave
`diario-estudio-sesiones` y las que empiecen por `diario-estudio-copia-` (si no, el aviso de
datos ilegibles seguirá saliendo).
