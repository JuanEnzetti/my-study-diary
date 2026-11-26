# MEMORY.md — Diario de Estudio
Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no
aporte.
## Estado actual
- Sesiones (fecha, tema, minutos), lista, racha, mejor racha con "¡Nuevo récord!" y resumen
"Esta semana" (minutos de lunes a hoy) y "Este mes" (días distintos con sesión).
- Diseño "cuaderno de cuadros" (skill `.claude/skills/frontend-design`): papel
cuadriculado, margen rojo, tinta azul, serif del sistema (Palatino/Georgia) para títulos
y números, sans del sistema para el resto. Sin tarjetas.
- Mapa de calor de 12 semanas: `heat-map.js` (lógica pura), `heat-map-view.js` (interfaz) y
`tests/heat-map.test.js` (38 tests). La constitución se aplica solo al código nuevo.
- Datos protegidos (spec 002): `session-data.js` (lógica), copias `diario-estudio-copia-N` y
aviso si algo no se puede leer. Se guarda añadiendo texto, sin reescribir lo anterior.
- Objetivo semanal (spec 003): `weekly-goal.js` y `weekly-goal-view.js`, clave
`diario-estudio-objetivo-semanal`; barra y «¡Objetivo cumplido!» bajo «Esta semana».
- Datos en localStorage.
## Decisiones (y por qué)
- Sin backend ni dependencias: cualquiera debe poder abrirlo con doble clic.
- Fecha editable en el formulario: permite registrar días pasados y ver la racha crecer.
- La mejor racha se calcula cada vez a partir de las sesiones y no se guarda: así no
cambia el formato de los datos y nunca se desincroniza.
- Las reglas del proyecto están solo en `CLAUDE.md` (AGENTS.md se eliminó): una única
fuente de reglas.
- El aviso de récord compara racha actual === mejor racha: la actual nunca puede ser
mayor porque está incluida en el cálculo de la mejor. Un empate con una racha antigua
también muestra el aviso (confirmado por el usuario).
- Total semanal: semana de lunes a domingo (la del calendario en España; el lunes vuelve
a 0) y formato "N min", igual que la lista. Lo decidió Claude a petición del usuario.
- Días del mes: mes del calendario (el día 1 vuelve a 0), formato "N días", en la misma
tarjeta que la semana para no llenar el móvil de tarjetas. Lo decidió Claude a petición
del usuario. Compara el prefijo "AAAA-MM": no hace aritmética de fechas.
- Diseño: lo único grande es la racha (número en tinta azul); el rotulador fluorescente
amarillo solo marca "¡Nuevo récord!". Colores en variables de `:root` en styles.css.
Sin Google Fonts: serían una dependencia externa y fallarían sin internet.
## Aprendizajes y errores a evitar
- Las reglas llegaron a describir mal los campos de las sesiones (`date/topic/minutes`).
Comprobar siempre en `app.js` antes de fiarse de la documentación.
- Para probar horas concretas (00:30, cambio de hora) en Node: sustituir `Date` por una
subclase cuyo `new Date()` sin argumentos devuelva esa hora, con `TZ=Europe/Madrid`.
- Probar la interfaz con el MCP `chrome-devtools` (`.mcp.json`): `cmd /c npx` por Windows,
`--isolated` (perfil temporal), sin telemetría ni CrUX. Cada llamada necesita `pageId`.
Si sale "Rejected", el usuario debe pasarlo de `disabledMcpjsonServers` a
`enabledMcpjsonServers` en `.claude/settings.local.json` (es su permiso, no de Claude).
## Próximos pasos
- Specs 001, 002-data-safety y 003-weekly-goal implementadas (003 el 2026-11-26, con el agente
`coordinator`). Falta que el usuario pruebe móvil físico, lector de pantalla y, en la 003,
cerrar y reabrir el navegador.
- Arreglar aparte: con la página abierta de domingo a lunes, el formulario sigue en domingo.
- Publicado (2026-11-26): github.com/JuanEnzetti/my-study-diary y my-study-diary-iota.vercel.app
(solo la web, por `.vercelignore`; cabeceras en `vercel.json`). Commits con correo noreply.
`.env.local` lleva un token de Vercel: nunca subirlo. Desplegar: `npx vercel deploy --prod`.
