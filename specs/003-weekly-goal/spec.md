# Spec 003 — Objetivo semanal de estudio

Estado: implementada el 2026-11-26 (pendiente de probar con lector de pantalla y al
cerrar y reabrir el navegador)

(S-n): depende de un supuesto confirmado por el usuario. (D-n): decisión del usuario. Los
números son estables y no se reutilizan: RF-11, 13, 15, 17, 26 y 27 se han fusionado con otros; RF-30
y S-21 se retiraron por decisión del usuario.

## Contexto y objetivo

El diario muestra los minutos estudiados esta semana, pero no dice si son muchos o pocos para
lo que la persona se propone.

**Objetivo:** que la persona pueda fijar cuántos minutos quiere estudiar cada semana y vea
cuánto lleva, para motivarse a cumplirlo.

## Usuarios

Una persona que registra su propio estudio, en el móvil o en el ordenador, con ratón, pantalla
táctil, teclado o lector de pantalla. No hay cuentas ni varios perfiles.

## Historias de usuario

- HU-1. Como estudiante, quiero fijar, cambiar o quitar mi objetivo semanal de minutos para
  adaptarlo a lo que puedo estudiar.
- HU-2. Como estudiante, quiero ver cuánto llevo respecto al objetivo para saber si voy bien.
- HU-3. Como estudiante, quiero ver un mensaje cuando lo cumpla para motivarme.
- HU-4. Como estudiante, quiero que un fallo con el objetivo no afecte a mis sesiones para no
  perder mi historial.

## Definiciones

- **Hoy:** la fecha local de la persona, nunca UTC.
- **Semana:** de lunes a domingo, en fecha local.
- **Sesión válida:** la de la spec 001 (fecha real y minutos que son un número finito mayor
  que 0).
- **Total semanal:** la suma de los minutos de todas las sesiones válidas con fecha desde el lunes
  de la semana de hoy hasta hoy, ambos incluidos. Se calcula, no se guarda (S-1).
- **Objetivo válido:** un número entero de 1 a 10.080 minutos, ambos incluidos.
- **Objetivo escrito válido:** lo escrito en el campo, sin contar los espacios de los extremos,
  tiene solo cifras del 0 al 9 y su valor es un objetivo válido. Se admiten ceros delante (S-5).
- **Objetivo guardado:** lo que esté guardado como objetivo, sea válido o no. Es válido si su
  contenido es solo las cifras de un objetivo válido, sin ceros delante ni ningún otro carácter
  (S-13).
- **Lectura:** cada vez que una página lee el objetivo guardado: al abrirla o recargarla y al
  guardar en ella una sesión con éxito. Un intento no es una lectura.
- **Objetivo vigente:** es propio de cada página (cada pestaña con la web abierta). Lo decide lo
  más reciente en ella: su última lectura, que da el objetivo si encontró uno válido y ninguno en
  otro caso, o su último intento correcto, que da el objetivo si lo guardó y ninguno si el campo
  estaba vacío. Lo que cambie otra pestaña, o un daño posterior, no cuenta hasta la siguiente
  lectura.
- **Objetivo dañado o ilegible:** hay un objetivo guardado que no es válido (dañado), o el
  navegador no permite leerlo (ilegible). Que no haya nada guardado no es un daño.
- **Sesiones que no se pueden leer:** los datos son ilegibles según la spec 002, o el navegador
  no permite leerlos (RF-8 de esa spec).
- **Campo vacío:** la persona no ha escrito nada en él, o solo espacios (S-5). Algo escrito que no
  se pueda interpretar como número no es un campo vacío.
- **Intento:** pulsar «Guardar objetivo», o Intro en su campo. Es **correcto** si guarda un
  objetivo, si lo quita o si, con el campo vacío, comprueba que no había nada guardado.
- **Actualizar el progreso:** volver a calcular y mostrar el total, el texto, la barra y el
  mensaje de cumplido.

## Requisitos funcionales

### Fijar, cambiar y quitar

- RF-1: EL SISTEMA muestra siempre, entre el resumen y el mapa de calor, un campo con la
  etiqueta «Objetivo semanal (minutos)» y un botón «Guardar objetivo», haya o no objetivo. El
  «formulario» de RF-7.1 de la spec 001 es el de sesiones, que sigue después del mapa (S-14,
  S-15).
- RF-2: CUANDO la persona pulse «Guardar objetivo» con un objetivo escrito válido, EL SISTEMA lo
  guarda como único objetivo, en sustitución del guardado, aunque otra pestaña lo haya cambiado
  (D-2). Guardar el mismo número también es un intento correcto.
- RF-3: CUANDO la persona pulse «Guardar objetivo» con el campo vacío, EL SISTEMA quita el
  objetivo guardado sin pedir confirmación, también si está dañado (D-1), si lo creó otra pestaña
  (D-2) o si es válido, era ilegible y vuelve a poder leerse (D-8). Si no había nada guardado, es
  un intento correcto sin nada que quitar.
- RF-4: EL SISTEMA conserva el mismo objetivo guardado cada semana, también al cerrar y volver a
  abrir la web en el mismo navegador, hasta que la persona lo cambie o lo quite.
- RF-5: CUANDO se abra o recargue la web, EL SISTEMA muestra en el campo el objetivo vigente,
  aunque hubiera otra cosa a medio escribir; si no hay objetivo, o está dañado o ilegible, lo
  muestra vacío (S-4, S-19).
- RF-6: CUANDO se guarde una sesión, o el objetivo cambie en otra pestaña, EL SISTEMA no cambia el
  campo del objetivo, lo haya editado o no la persona: manda la última pulsación (D-2, S-4).
- RF-24: CUANDO un intento correcto guarde un objetivo, EL SISTEMA muestra en el campo el número
  guardado, sin ceros delante ni espacios; si el campo estaba vacío, queda vacío y sin espacios
  (S-12).
- RF-25: CUANDO la persona pulse Intro en el campo del objetivo, EL SISTEMA hace lo mismo que al
  pulsar «Guardar objetivo», sin guardar ninguna sesión. Tras cualquier intento, mantiene el foco
  en el control en el que estaba (S-16).

### Ver el progreso

- RF-7: MIENTRAS haya un objetivo vigente, EL SISTEMA muestra en «Esta semana» el texto
  «N de M min», donde N es el total semanal de la última actualización del progreso (o el que
  mantenga RF-28), con sus decimales y sin redondeo (D-5), y M el objetivo vigente.
  *Ejemplo: «90 de 300 min».*
- RF-8: MIENTRAS haya un objetivo vigente, EL SISTEMA muestra debajo de «Esta semana» una barra
  llena en la proporción N / M, con un máximo del 100 %. *Ejemplos: 90 de 300, al 30 %; 350 de
  300, al 100 %.* Si N < M, deja al menos 2 px vacíos al final; si N = 0, la muestra vacía entera.
  En lo demás se desvía como máximo 1 punto porcentual o 2 px, lo que sea mayor (S-18).
- RF-9: MIENTRAS no haya un objetivo vigente, EL SISTEMA muestra «N min», como hasta ahora, sin
  barra, sin mensaje de objetivo cumplido y sin ningún objetivo por defecto.
- RF-10: CUANDO en una página haya una lectura o un intento correcto, EL SISTEMA actualiza su
  progreso con la fecha local de ese momento, sin necesidad de recargar; si la semana es nueva,
  cuenta desde su lunes. El total semanal se calcula, según su definición, a partir de todas las
  sesiones guardadas en ese momento, también las guardadas desde otra pestaña (salvo RF-28). El
  intento correcto deja los demás datos como estaban hasta la siguiente actualización completa:
  abrir, recargar o guardar una sesión (S-2, S-3).
- RF-12: MIENTRAS en una página no haya una nueva lectura ni un intento correcto, EL SISTEMA
  mantiene el progreso que mostraba, incluido «¡Objetivo cumplido!», aunque pase la medianoche
  (D-4) o cambien los datos guardados desde otra pestaña (S-2).
- RF-28: SI las sesiones no se pueden leer durante un intento correcto, porque son ilegibles o
  porque el navegador no permite leerlas, ENTONCES EL SISTEMA mantiene el total que mostraba y
  actualiza con él el resto del progreso (S-17). Si no se pueden leer al abrir o recargar, el
  total es 0.

### Objetivo cumplido

- RF-14: MIENTRAS haya un objetivo vigente y el total semanal mostrado sea igual o mayor que él,
  EL SISTEMA muestra «¡Objetivo cumplido!» justo debajo de la barra (S-15), sin animación ni
  amarillo fluorescente, reservado a «¡Nuevo récord!» (S-11). Al actualizar el progreso, lo
  retira si el total es menor o ya no hay objetivo.

### Errores

- RF-16: SI en un intento lo escrito no está vacío y no es un objetivo escrito válido, ENTONCES
  EL SISTEMA muestra «Escribe un número entero de 1 a 10080, sin puntos ni comas.», conserva el
  objetivo guardado, no actualiza el progreso y no borra lo escrito (S-14, S-17).
- RF-18: SI no se puede guardar el objetivo, ENTONCES EL SISTEMA muestra «El objetivo no se ha
  guardado. Revisa si el navegador tiene espacio y permite guardar datos, y vuelve a
  intentarlo.», conserva el objetivo guardado, sea válido o no, deja el campo como estaba y
  mantiene sin volver a leer el progreso y el aviso que mostraba (S-14, S-17).
- RF-19: SI no se puede quitar el objetivo, o no se puede comprobar si lo hay, ENTONCES EL
  SISTEMA muestra «El objetivo no se ha quitado. Revisa si el navegador permite guardar datos, y
  vuelve a intentarlo.» y, por lo demás, actúa como en RF-18; el campo sigue vacío (S-14, S-17).
- RF-20: CUANDO haya un intento correcto, EL SISTEMA retira el error del objetivo y no muestra
  ningún mensaje de confirmación (D-6). Si un intento falla, el error nuevo sustituye al
  anterior. Guardar una sesión, con éxito o no, no retira el error (S-6, S-20).
- RF-21: SI una lectura encuentra el objetivo dañado o ilegible, ENTONCES EL SISTEMA funciona en
  esa página, desde esa lectura, como si no hubiera objetivo y avisa con «No se ha podido leer el objetivo semanal. Si habías guardado
  uno, ahora no se muestra.» (S-14).
- RF-22: MIENTRAS la última lectura de la página haya encontrado el objetivo dañado o ilegible y
  no haya después un intento correcto en ella, EL SISTEMA no lo borra ni lo modifica desde esa
  página, y mantiene el aviso. Retira el aviso con un intento correcto, o si una nueva lectura
  encuentra un objetivo válido o nada guardado (S-6).
- RF-29: EL SISTEMA muestra el aviso encima del campo del objetivo y el error debajo del botón,
  como texto y no como ventana emergente. Pueden verse a la vez, también junto al aviso y el
  error de sesiones, sin sustituirlos (S-6, S-15).
- RF-23: EL SISTEMA guarda el objetivo aparte de las sesiones y, al leerlo, guardarlo o quitarlo,
  no modifica las sesiones, sus copias ni su formato.

## Requisitos no funcionales

- RNF-1 Móvil: a 375 px de ancho, el texto, la barra, el mensaje, los avisos y el formulario
  del objetivo se ven completos, sin recortes ni desplazamiento horizontal, también con «10080
  de 10080 min». Ese texto, o un total muy largo, puede ocupar varias líneas (S-8).
- RNF-2 Accesibilidad: el objetivo se puede fijar, cambiar y quitar solo con teclado, con foco
  visible. Un lector de pantalla puede conocer el nombre del campo y el progreso, y anuncia el
  aviso, los errores (también el mismo error si se repite en otro intento), los cambios de
  progreso y la aparición de «¡Objetivo cumplido!». La información no depende solo del color ni
  de la barra. Contraste mínimo: 4,5:1 en textos, y 3:1 en el foco respecto a su fondo, entre la
  parte llena y la vacía de la barra (S-9, S-16), y entre el contorno de la barra, esté vacía o
  llena, y el color del papel que la rodea, sin contar las líneas de la cuadrícula (S-22).
- RNF-3 Idioma: todos los textos y mensajes propios están en español y son los fijados en esta
  spec, sin depender del idioma del navegador (S-9). Se exceptúa «Infinity» en una suma extrema
  (fuera de alcance).
- RNF-4 Sin conexión: con la red desconectada se puede abrir la web y fijar, ver, cambiar y
  quitar el objetivo (S-9).
- RNF-5 Comprobable: la validación del objetivo y el progreso, incluido el total que usa, se
  pueden comprobar automáticamente para cualquier «hoy». Cada actualización usa un único «hoy»
  para su lunes y su fin, y el mismo total para el texto, con o sin objetivo, la barra y el
  mensaje: no hay dos cálculos distintos (S-9).
- RNF-6 Compatibilidad: quien ya tenía sesiones empieza sin objetivo, y ve las mismas sesiones,
  en el mismo orden y con los mismos datos que antes.
- RNF-7 Coherencia: no resta protagonismo a la racha: ningún texto nuevo es más grande que el
  valor de «Esta semana», y el mensaje, el aviso y los errores no superan el tamaño del texto
  normal (S-9, S-18).

## Casos límite

| Caso | Resultado esperado |
|---|---|
| Nunca se ha guardado un objetivo y se puede leer | «N min», sin barra, mensaje ni aviso |
| Objetivo 300 y sin sesiones esta semana | «0 de 300 min», barra al 0 % |
| Objetivo 300; totales 299, 300 y 350 | Sin mensaje; mensaje; mensaje. Barra al 99,67 %, 100 % y 100 % |
| Objetivo 10080 y total 10079 | Sin mensaje; la barra deja al menos 2 px vacíos |
| Objetivos 1 y 10080 | Se aceptan |
| 0, 000, -5, +300, 30.5, 30,5, «abc», «-», 1e3, 300.0, 10.080, «10 080», 10081, cifras de otros sistemas (٣٠٠, ３００) o un número de miles de cifras no nulas | Error de RF-16; se conservan el objetivo guardado y lo escrito |
| «0300» o « 300 » | Se guarda 300 y el campo muestra «300» |
| Campo vacío o solo espacios sin nada guardado, o se guarda el mismo número | Intento correcto: se actualiza el total y se retira el error |
| Valor no válido y después vacío | Se quita el objetivo y se retira el error |
| Dos intentos fallidos: por causas distintas; con el mismo error | Solo se ve el último; sigue visible y se anuncia otra vez |
| Error del objetivo visible y se guarda una sesión | El error sigue |
| Total 350 y el objetivo pasa de 300 a 400; de 400 a 300; de 300 a ninguno | «350 de 400 min» sin mensaje; «350 de 300 min» con mensaje; «350 min» sin barra ni mensaje |
| Objetivo cumplido el domingo; se abre el lunes | «0 de 300 min» (o lo de ese lunes), sin mensaje |
| Página abierta de domingo a lunes sin acciones, objetivo cumplido | No cambia sola: sigue el mensaje (D-4) |
| La misma página, y se guarda una sesión o hay un intento correcto | Se cuenta desde el nuevo lunes; el mensaje sigue solo si se cumple con ese total |
| Página abierta de domingo a lunes; se guarda la primera sesión y luego otra | Limitación aceptada (D-3): si se deja la fecha propuesta, la primera queda con fecha del domingo y no suma en la semana nueva (actualmente no se puede elegir una posterior a la propuesta); la siguiente, si se deja la fecha propuesta, que ya es la del lunes, sí |
| Hoy es lunes / hoy es domingo | Solo cuenta el lunes / cuentan los siete días |
| Sesión del domingo anterior, futura o dañada | No suma |
| Varias sesiones el mismo día | Suman todas |
| Sesión registrada a las 00:30 con la web abierta ese mismo día | Cuenta en el día local |
| Semana con cambio de hora, o que cruza de mes o de año | Ningún día falta ni se repite |
| Sesiones antiguas con decimales: 0,1 y 0,2 | «0.30000000000000004 de M min», como ahora (D-5) |
| Diez sesiones de 0,1 y objetivo 1 | «0.9999999999999999 de 1 min», sin mensaje y con 2 px vacíos: se acepta esa falta de precisión (D-5) |
| Falla al guardar una sesión | El progreso no cambia |
| Falla al guardar (por ejemplo, sin espacio), con objetivo válido, dañado o sin él | Error, junto al aviso si lo había; lo guardado y lo que se veía no cambian; se mantiene lo escrito |
| Falla al quitar un objetivo válido o dañado | Igual que la fila anterior; el campo queda vacío |
| Almacenamiento bloqueado ya al abrir, con o sin objetivo previo | Sin objetivo, aviso de RF-21 y aviso de sesiones; al intentar guardar o quitar, se añade el error |
| Almacenamiento bloqueado después de abrir y se intenta guardar o quitar | Error; siguen el progreso que se veía y el campo; no aparece el aviso hasta la siguiente lectura |
| Objetivo guardado con contenido vacío, letras, 0, decimal, 20000, «0300», « 300 » o cualquier otra cosa no válida | Sin objetivo, aviso, no se borra, tampoco al recargar; las sesiones no cambian |
| Objetivo dañado y se intenta guardar un valor no válido | Error junto al aviso; el dato dañado sigue igual |
| Objetivo dañado y se guarda uno válido, o vacío | Se sustituye, o se borra sin confirmación (D-1); se retira el aviso |
| Objetivo ilegible que vuelve a leerse al recargar | Se muestra, también en el campo; se retira el aviso |
| Objetivo ilegible que vuelve a leerse al guardar una sesión | Se muestra y se retira el aviso, pero el campo no cambia: si está vacío y se pulsa, se quita sin confirmación (D-8) |
| Objetivo ilegible al abrir, el navegador vuelve a permitir el acceso y se pulsa con el campo vacío sin una lectura previa | Si era válido, se quita sin confirmación (D-8); se retira el aviso |
| Objetivo que se daña con la página abierta y se guarda una sesión | Pasa a verse sin objetivo, con aviso; el campo no cambia y, al pulsar, se guarda lo que muestre |
| Al abrir, sesiones ilegibles o que el navegador no permite leer, y objetivo válido | «0 de M min» y el aviso de sesiones que ya existe |
| Las mismas sesiones, aún sin poder leerse, y hay un intento correcto | El total sigue en 0 |
| Con la página abierta, las sesiones pasan a ser ilegibles o el navegador deja de permitir leerlas, y hay un intento correcto | Se mantiene el total mostrado, no 0, aunque haya cambiado la semana; el resto usa ese total |
| Con un objetivo a medio escribir: se guarda una sesión; se recarga | No se pierde; el campo muestra el objetivo vigente |
| Se vuelve a la página con atrás o adelante y el navegador la restaura tal como estaba | Como una página que seguía abierta: no cambia nada |
| Dos pestañas: A cambia 300 por 400 y B, con «300» en el campo, guarda una sesión | B muestra el progreso con 400; su campo sigue en «300» (D-2) |
| Dos pestañas: A cambia 300 por 400 y B, con «300» en el campo, pulsa | Se repone 300 (D-2) |
| Dos pestañas: A quita el objetivo y B, con «300» en el campo, pulsa | Se restaura 300 (D-2) |
| Dos pestañas: A crea un objetivo y B, con el campo vacío, pulsa | Se quita sin confirmación (D-2) |
| Dos pestañas: A quita o daña el objetivo y en B hay un intento no válido o que falla | B muestra el error y mantiene su campo, su progreso y su aviso; lo guardado no cambia. En su siguiente lectura, B queda sin objetivo, con aviso solo si está dañado |
| Dos pestañas: A guarda sesiones y B guarda el objetivo | El total de B las incluye; racha, mes, mapa y lista de B, desde su siguiente actualización completa |

## Fuera de alcance

Confirmado por el usuario:

- Más de un objetivo, u objetivos distintos para semanas concretas.
- Animaciones al cumplirlo y objetivo por defecto.
- Cambiar el formato de las sesiones.
- Mensaje de confirmación al guardar o quitar el objetivo (D-6), confirmación antes de borrar uno
  dañado (D-1) o uno válido que era ilegible y vuelve a leerse (D-8), y sincronizar el campo entre
  pestañas (D-2).
- Cambiar cómo se ve una suma tan extrema que no cabe como número: se sigue viendo «Infinity», como
  hoy.
- Corregir la fecha que propone el formulario de sesiones tras la medianoche: se arreglará aparte
  (D-3).

Confirmado como supuesto (S-10):

- Historial de objetivos y semanas cumplidas.
- Notificaciones y recordatorios.
- Objetivos diarios o por tema.
- Cambios en la racha, la mejor racha, el mes y el mapa de calor.
- Copiar o recuperar un objetivo dañado, o pedir confirmación antes de quitar uno válido
  (salvo el caso ya decidido en D-8).

## Supuestos confirmados

El usuario los confirmó todos al aprobar la spec: «Sí, apruebo todo» (D-7).

- **S-1 Progreso:** usa el total semanal de las definiciones: de lunes a hoy, fecha local, sesiones
  válidas, sin futuras y sumando todas las del mismo día; la misma regla que ya usa «Esta semana».
- **S-2 Actualización:** al abrir, recargar o guardar una sesión. Que no cambie solo tras la
  medianoche coincide con el mapa (el mensaje de cumplido ya está decidido en D-4).
- **S-3 Al guardar o quitar el objetivo** se recalcula también el total, con la fecha de ese
  momento; los demás datos esperan a la siguiente actualización completa.
- **S-4 Contenido del campo:** al abrir muestra el objetivo vigente, para que pulsar sin tocar nada
  no lo quite mientras no haya cambiado después. Al no sincronizarse (D-2), si cambia en otra
  pestaña, pulsar repone lo que muestre el campo. El objetivo ilegible que vuelve a leerse ya está
  decidido en D-8.
- **S-5 Qué se acepta:** solo cifras del 0 al 9, sin separador de miles; «10.080» no vale y
  «10080» sí. Se ignoran los espacios de los extremos y los ceros delante, y un campo solo con
  espacios cuenta como vacío.
- **S-6 Avisos:** el error es texto, no ventana emergente, y se retira en el siguiente intento
  correcto. El aviso de objetivo dañado se retira, además, si el dato vuelve a leerse (RF-22).
- **S-7 Números:** «N de M min» sin separador de miles y escritos como el total actual.
- **S-8 Móvil:** a 375 px «N de M min» puede ocupar más de una línea.
- **S-9 Calidad:** RNF-1 a RNF-5, los contrastes de RNF-2 y el límite de tamaño de RNF-7.
- **S-10 Fuera de alcance:** los puntos que esa sección indica con S-10.
- **S-11 Amarillo:** el mensaje de cumplido no usa el amarillo fluorescente.
- **S-12 Campo tras guardar:** muestra el número guardado («0300» pasa a «300»); tras quitar,
  queda vacío aunque hubiera espacios.
- **S-13 Dato guardado:** solo es válido con las cifras justas. Uno con ceros delante o espacios
  está dañado, aunque al escribirlo en el campo se aceptaran.
- **S-14 Textos:** la etiqueta y los mensajes literales de RF-1, RF-16, RF-18, RF-19 y RF-21.
- **S-15 Posiciones:** formulario entre resumen y mapa; mensaje de cumplido debajo de la barra;
  aviso encima del campo; error debajo del botón.
- **S-16 Teclado y lector:** Intro equivale a pulsar, el foco no se mueve y un error repetido se
  anuncia de nuevo.
- **S-17 Intentos con problemas:** un valor no válido o un fallo no releen nada ni actualizan el
  progreso. Si las sesiones dejan de leerse, guardar el objetivo mantiene el total y no cambia
  el aviso de sesiones, que se revisa en la siguiente actualización completa.
- **S-18 Medidas:** la tolerancia y los 2 px vacíos de RF-8, y el tamaño máximo del mensaje, el
  aviso y los errores de RNF-7, como concreción de «discreto».
- **S-19 Recarga:** en el campo manda el objetivo vigente, no lo que estuviera a medio escribir.
  Volver a una página que el navegador conservaba equivale a tenerla abierta.
- **S-20 Errores sucesivos:** solo se ve el último, y permanece al guardar una sesión.
- **S-22 Contorno de la barra:** contraste 3:1 con el papel, para ver dónde acaba la parte vacía.

## Criterios de finalización

- [x] Cada RF, RNF y caso límite tiene al menos una comprobación superada: automática o, si es de
      interfaz, manual anotada. *Prueba: T9 (46 filas) y reviewer, RF por RF. Salvo RF-4 al cerrar
      y reabrir el navegador y RNF-2 con lector real: anotados como no comprobados.*
- [x] Todas las comprobaciones automáticas, nuevas y anteriores, están en verde. *Prueba:
      `node --test`, 77 de 77 (2026-11-26).*
- [x] La lógica se ha comprobado con «hoy» en lunes, en domingo, en las dos semanas de cambio de
      hora y en semanas que cruzan de mes y de año.
- [x] Probado en un navegador real a 375 px y a 1280 px: sin desplazamiento horizontal, sin
      textos recortados y sin errores en la consola.
- [x] Medidos los contrastes de RNF-2, los tamaños de RNF-7 y la barra de RF-8. *Prueba: reviewer.*
- [x] Fijar, cambiar y quitar el objetivo, probado solo con teclado y con lector de pantalla; si
      no se ha podido, queda anotado. *Teclado: probado. Lector de pantalla: no probado.*
- [x] Comparados antes y después de fijar, cambiar y quitar el objetivo: las sesiones y copias
      guardadas son idénticas carácter a carácter.
- [x] Con las mismas sesiones y el mismo «hoy», la racha, la mejor racha, el total semanal,
      el mes y el mapa dan los mismos resultados que antes de esta versión.
- [x] El usuario ha revisado los supuestos y no quedan dudas abiertas. *Aprobados el 2026-11-25.*

## Dudas abiertas

Resueltas por el usuario: D-1 (RF-3), D-2 (RF-2, RF-3, RF-6), D-3 (casos límite y fuera de alcance),
D-4 (RF-12), D-5 (RF-7), D-6 (RF-20), D-7 (supuestos) y D-8 (RF-3).

- **D-8:** se acepta que pulsar con el campo vacío quite sin confirmación un objetivo válido que era
  ilegible y vuelve a leerse.

- **D-7:** cerrada. A la pregunta «¿Apruebas la spec 003 y sus supuestos S-1 a S-20 y S-22?», el
  usuario respondió «Sí, apruebo todo». No quedan dudas abiertas.
