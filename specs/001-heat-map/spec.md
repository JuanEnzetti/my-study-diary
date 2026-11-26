# Spec 001 — Mapa de calor de estudio

- **Estado:** aprobada el 2026-11-25; RF-1.3, RF-5.2, RF-6.2, RF-6.4 y «Periodo» aclarados ese día
- **Fecha:** 2026-11-25

## 1. Contexto y objetivo

El Diario de Estudio muestra la racha, la mejor racha, los minutos de la semana y los días
estudiados del mes. Son números sueltos: no dejan ver de un vistazo qué días se estudió ni
cuánto.

**Objetivo:** mostrar la constancia y la intensidad de las últimas 12 semanas en un mapa de
calor, para que la persona vea su progreso y se motive a seguir.

## 2. Usuarios

Una persona que registra su propio estudio, en el móvil o en el ordenador, con ratón,
pantalla táctil, teclado o lector de pantalla. No hay cuentas ni varios perfiles.

## 3. Historias de usuario

- **HU-1:** Como estudiante, quiero ver qué días he estudiado en las últimas 12 semanas,
  para comprobar mi constancia.
- **HU-2:** Como estudiante, quiero que los días con más minutos destaquen más, para
  distinguir los días intensos de los ligeros.
- **HU-3:** Como estudiante, quiero consultar la fecha y los minutos de un día, para conocer
  el dato exacto.
- **HU-4:** Como estudiante, quiero que el mapa se actualice al registrar una sesión, para
  ver el efecto al momento.

## 4. Definiciones

- **Hoy:** la fecha local de la persona, nunca UTC.
- **Semana:** de lunes a domingo.
- **Periodo:** los días desde el lunes de hace 11 semanas hasta hoy, ambos incluidos.
- **Sesión válida:** tiene una fecha que existe en el calendario y unos minutos que son un
  número finito mayor que 0.
- **Minutos del día:** la suma de los minutos de todas las sesiones válidas de esa fecha.
- **Niveles de intensidad:**

| Nivel | Minutos del día |
|---|---|
| 0 | 0 (sin estudio) |
| 1 | más de 0 y menos de 30 |
| 2 | desde 30 y menos de 60 |
| 3 | desde 60 y menos de 120 |
| 4 | 120 o más |

## 5. Requisitos funcionales

### RF-1 — Periodo mostrado
- **RF-1.1** El sistema deberá mostrar los días comprendidos entre el lunes de hace 11
  semanas y hoy, ambos incluidos. *Ejemplo: si hoy es miércoles 25/11/2026, desde el lunes
  07/09/2026 hasta el 25/11/2026.*
- **RF-1.2** El sistema deberá agrupar los días por semanas de lunes a domingo, en orden
  cronológico.
- **RF-1.3** Mientras haya días de la semana actual posteriores a hoy, el sistema no deberá
  presentarlos como días sin estudio ni permitir consultarlos: su lugar quedará en hueco.
- **RF-1.4** Cuando se abra o recargue la aplicación, o se guarde una sesión, el sistema
  deberá calcular el periodo con la fecha local de ese momento.
- **RF-1.5** Mientras la aplicación siga abierta tras la medianoche sin recargarse ni guardar
  una sesión, el sistema deberá mantener el mapa con el día anterior.

### RF-2 — Intensidad de cada día
- **RF-2.1** El sistema deberá asignar a cada día el nivel que corresponda a sus minutos
  según la tabla de niveles.
- **RF-2.2** Cuando un día tenga varias sesiones válidas, el sistema deberá sumar sus
  minutos antes de asignar el nivel.
- **RF-2.3** El sistema deberá mostrar mayor intensidad de color cuanto mayor sea el nivel,
  y los cinco niveles deberán distinguirse entre sí.

### RF-3 — Leyenda
- **RF-3.1** El sistema deberá mostrar una leyenda con los cinco niveles y los minutos que
  representa cada uno.

### RF-4 — Detalle de un día
- **RF-4.1** Cuando la persona toque un día, haga clic en él o llegue a él con el teclado,
  el sistema deberá mostrar como texto su fecha completa en español y sus minutos. *Ejemplo:
  «martes, 24 de noviembre de 2026: 75 min».*
- **RF-4.2** Si el día no tiene estudio, entonces el sistema deberá mostrar su fecha y
  «0 min».
- **RF-4.3** Cuando la persona elija otro día, el sistema deberá sustituir el detalle
  anterior por el nuevo.
- **RF-4.4** Mientras no se haya elegido ningún día, el sistema no deberá mostrar el detalle
  de ninguno.

### RF-5 — Actualización
- **RF-5.1** Cuando se guarde una sesión con fecha dentro del periodo, el sistema deberá
  actualizar el día correspondiente sin recargar la página.
- **RF-5.2** Cuando se guarde una sesión con fecha anterior al periodo, el sistema no deberá
  cambiar los minutos ni el nivel de ningún día del mapa, salvo el cambio de periodo de
  RF-1.4 si ha pasado la medianoche.
- **RF-5.3** Si se guarda una sesión del día cuyo detalle está visible, entonces el sistema
  deberá actualizar también ese detalle.

### RF-6 — Datos dañados o ausentes
- **RF-6.1** Si una sesión guardada no es válida, entonces el sistema deberá ignorarla en el
  mapa y mostrar el resto, sin avisar.
- **RF-6.2** Si no hay sesiones válidas en el periodo, entonces el sistema deberá mostrar el
  mapa con todos los días del periodo en nivel 0.
- **RF-6.3** Si una sesión tiene fecha posterior a hoy, entonces el sistema deberá ignorarla
  en el mapa.
- **RF-6.4** Si no se puede leer ninguna de las sesiones guardadas, entonces el sistema
  deberá mostrar el mapa con todos los días del periodo en nivel 0.
- **RF-6.5** El sistema no deberá borrar ni modificar ninguna sesión guardada, sea válida o
  no, para mostrar el mapa.

### RF-7 — Ubicación, orientación y rótulos
- **RF-7.1** El sistema deberá mostrar el mapa después del resumen de la semana y el mes, y
  antes del formulario.
- **RF-7.2** El sistema deberá mostrar cada semana como una columna, con la más antigua a la
  izquierda y la actual a la derecha, y los días de lunes (arriba) a domingo (abajo).
- **RF-7.3** El sistema deberá rotular las filas del lunes, miércoles y viernes con «L», «X»
  y «V».
- **RF-7.4** Cuando una semana mostrada contenga el día 1 de un mes que no sea posterior a
  hoy, el sistema deberá mostrar el nombre abreviado de ese mes sobre su columna.
- **RF-7.5** Si la primera semana no contiene el día 1 de un mes, y la segunda tampoco,
  entonces el sistema deberá mostrar sobre la primera el mes de su lunes.
- **RF-7.6** El sistema deberá distinguir el día de hoy con un borde, sin cambiar el color
  de su nivel.

## 6. Requisitos no funcionales

- **RNF-1 Móvil:** a 375 px de ancho deberán verse las 12 semanas sin desplazamiento
  horizontal.
- **RNF-2 Accesibilidad:** la información no deberá depender solo del color; con lector de
  pantalla deberán poder conocerse la fecha y los minutos de cada día. El foco del teclado
  deberá ser visible.
- **RNF-3 Idioma:** todos los textos visibles deberán estar en español.
- **RNF-4 Datos:** el mapa se calcula a partir de las sesiones guardadas, sin guardar nada
  nuevo ni cambiar su formato.
- **RNF-5 Sin conexión:** el mapa deberá funcionar sin internet.
- **RNF-6 Coherencia:** el mapa deberá respetar el estilo visual existente y no restar
  protagonismo a la racha.
- **RNF-7 Comprobable:** los cálculos deberán poder comprobarse automáticamente para
  cualquier fecha de «hoy».

## 7. Casos límite

| Caso | Resultado esperado |
|---|---|
| Sesiones de 29, 30, 59, 60, 119 y 120 min en días distintos | Niveles 1, 2, 2, 3, 3 y 4 |
| Dos sesiones de 20 min el mismo día | 40 min, nivel 2 |
| Un día con más de 24 horas registradas | Nivel 4; se muestran los minutos guardados |
| Hoy es lunes | La semana actual solo muestra el lunes |
| Hoy es domingo | Se muestran los 84 días |
| Sesión del primer día del periodo | Se muestra |
| Sesión del día anterior al primero | No se muestra |
| El periodo cruza de mes o de año, o incluye un 29 de febrero | Todos los días aparecen una vez y en su sitio |
| Cambio de hora (marzo u octubre) | Ningún día se repite ni falta |
| Sesión registrada a las 00:30 | Cuenta en el día local |
| Fecha imposible (31 de febrero) o ausente | Se ignora en el mapa y se conserva guardada |
| Minutos 0, negativos, vacíos o de texto | Se ignora en el mapa y se conserva guardada |
| Un día con una sesión válida y otra dañada | Solo suma la válida |
| Datos guardados ilegibles por completo | Mapa en nivel 0; mostrarlo no los modifica |
| Página abierta desde ayer y se guarda una sesión hoy | El mapa pasa al nuevo día |
| Hoy está seleccionado | Se distinguen el borde de hoy y la selección o el foco |

## 8. Fuera de alcance

- Ver periodos anteriores o elegir otra duración.
- Filtrar por tema.
- Registrar, editar o borrar sesiones desde el mapa.
- Configurar los tramos de minutos o los colores.
- Exportar o compartir el mapa.
- Avisar de las sesiones dañadas o repararlas.
- Proteger los datos ilegibles al guardar una sesión nueva: afecta a toda la aplicación y
  requiere su propia spec.
- Cambiar los cálculos actuales de racha, mejor racha, semana y mes.

## 9. Criterios de finalización

- [x] Se cumplen todos los criterios de RF-1 a RF-7 y los RNF.
- [x] Cada caso límite de la sección 7 tiene una comprobación automática o, si es visual,
      una comprobación manual anotada.
- [x] Todas las comprobaciones automáticas están en verde.
- [x] Probado en un navegador real a 375 px y en escritorio, sin errores en la consola.
- [x] Probado solo con teclado.
- [x] Las sesiones guardadas antes de esta versión siguen intactas.
- [x] La racha, la mejor racha, la semana y el mes dan los mismos resultados que antes.
- [x] No quedan dudas abiertas en la sección 10.

## 10. Dudas abiertas

Ninguna. Las dudas DA-1 a DA-6 se resolvieron el 2026-11-25 y están recogidas en RF-1, RF-6 y
RF-7.
