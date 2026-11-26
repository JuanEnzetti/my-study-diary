# Diario de Estudio

Web para registrar sesiones de estudio y motivarse viendo la racha de días seguidos.
Es un proyecto didáctico: HTML, CSS y JavaScript puros, sin dependencias ni paso de
compilación, pensado para que pueda entenderlo alguien que empieza a programar.

## Funcionalidades

- **Registrar sesiones** con fecha, tema y minutos. La fecha es la de hoy por defecto y se
  puede cambiar a un día anterior, pero no a uno futuro. Los minutos deben ser un número
  entero mayor que 0.
- **Racha actual**: días consecutivos con al menos una sesión que terminan hoy. Si hoy aún
  no has estudiado pero ayer sí, la racha sigue viva.
- **Mejor racha** del historial, con el aviso «¡Nuevo récord!» cuando la racha actual la
  iguala.
- **Resumen**: minutos de esta semana (de lunes a hoy) y días distintos estudiados este mes.
- **Objetivo semanal**: fijas cuántos minutos quieres estudiar cada semana (de 1 a 10 080) y
  ves «N de M min» con una barra de progreso y el mensaje «¡Objetivo cumplido!». Dejar el
  campo vacío y guardar quita el objetivo.
- **Mapa de calor** de las últimas 12 semanas: cada día tiene más intensidad cuantos más
  minutos se estudiaron. Al tocar un día, o al llegar a él con el teclado, se muestran su
  fecha y sus minutos.
- **Lista de sesiones**, de la más reciente a la más antigua.
- **Protección de los datos**: si los datos guardados no se pueden leer, la web conserva una
  copia antes de escribir encima y muestra un aviso para copiarlos. Las sesiones dañadas no
  se muestran, pero tampoco se borran.

Todas las fechas se calculan con la hora local, nunca en UTC. La interfaz está en español y
se adapta al móvil.

## Cómo usarla

Abre `index.html` con doble clic en el navegador. No necesita servidor, instalación ni
conexión a internet.

## Dónde se guardan los datos

Todo se guarda en el `localStorage` de tu navegador; nada se envía a ningún servidor. Por
eso los datos solo existen en ese navegador y en ese dispositivo, y se pierden si borras los
datos del sitio.

| Clave | Contenido |
|---|---|
| `diario-estudio-sesiones` | Lista de sesiones: `{ id, fecha: "AAAA-MM-DD", tema, minutos }` |
| `diario-estudio-objetivo-semanal` | Objetivo semanal en minutos, por ejemplo `"300"` |
| `diario-estudio-copia-N` | Copias de datos que no se pudieron leer |

## Estructura

| Archivo | Responsabilidad |
|---|---|
| `index.html` | Estructura de la página |
| `styles.css` | Estilos: diseño de cuaderno de cuadros, adaptado al móvil |
| `app.js` | Formulario, lista, racha, mes y conexión del resto |
| `session-data.js` | Lógica pura para leer y guardar sesiones sin perder datos |
| `heat-map.js` / `heat-map-view.js` | Lógica pura e interfaz del mapa de calor |
| `weekly-goal.js` / `weekly-goal-view.js` | Lógica pura e interfaz del objetivo semanal |
| `tests/` | Tests de la lógica pura |

Los scripts se cargan como scripts clásicos, no como módulos, para que la web funcione al
abrirla directamente desde el disco (`file://`).

## Tests

La lógica pura se prueba con el ejecutor de tests que incluye Node.js, sin instalar paquetes:

```bash
node --test
```

Hay 77 tests. Necesitas una versión de Node.js con `node:test` (se ha probado con la 26). La
interfaz se comprueba a mano en el navegador.

## Cómo se ha desarrollado

El proyecto sigue un flujo de *Spec-Driven Development*: cada funcionalidad nueva tiene una
especificación, un plan y unas tareas antes de escribir código.

- `docs/constitution.md`: principios del proyecto (simplicidad, la spec manda, lógica
  separada de la interfaz, tests como puerta, datos sagrados e idioma).
- `specs/NNN-nombre/`: `spec.md`, `plan.md` y `tasks.md` de cada funcionalidad.
- `CLAUDE.md` y `MEMORY.md`: reglas y estado del proyecto para el asistente de código.
- `.claude/`: agentes, comandos y skills propios del flujo. Las skills de terceros que figuran
  en `skills-lock.json` no se incluyen en el repositorio.

## Limitaciones conocidas

- No se pueden editar ni borrar sesiones desde la web.
- No hay exportación, importación ni sincronización entre dispositivos.
- Si la página se queda abierta de un día para otro, los datos no se actualizan hasta
  recargarla o guardar algo.
