# Spec 002 — Sesiones a salvo

- **Estado:** cumplida el 2026-11-25 (opciones aprobadas por el usuario). Lógica con `node --test`; RF-1 a
  RF-9 comprobados en Chrome a 375 px. Sin probar: móvil físico y lector de pantalla

## Objetivo

Que un fallo al leer o guardar no haga perder sesiones ni impida ver la página.

## Definiciones

- **Datos ilegibles:** hay algo guardado, pero no es una lista de sesiones.
- **Sesión válida:** la de la spec 001 (fecha real y minutos mayores que 0).
- **Copia:** reproducción exacta de unos datos ilegibles, en el mismo navegador.

## Requisitos

- **RF-1** Si los datos son ilegibles, entonces el sistema deberá crear y comprobar una copia
  antes de escribir encima.
- **RF-2** Si no se puede crear o comprobar la copia, entonces el sistema no deberá guardar
  encima de los datos ilegibles.
- **RF-3** Cuando aparezcan datos ilegibles distintos, el sistema deberá crear otra copia sin
  tocar las anteriores; si ya existe una idéntica, no deberá repetirla.
- **RF-4** Mientras haya copias, o datos ilegibles sin copia, el sistema deberá avisar y
  permitir copiarlos. Si no puede copiarlos solo, deberá mostrar el texto para hacerlo a mano.
- **RF-5** Si una sesión no es válida, entonces el sistema deberá excluirla de la lista y de
  todos los cálculos, y mostrar el resto.
- **RF-6** Cuando se guarde una sesión, el sistema deberá conservar las anteriores exactamente
  como estaban, también las no válidas.
- **RF-7** Si no se puede guardar, entonces el sistema deberá avisar, mantener lo escrito en el
  formulario y no mostrar ni sumar la sesión.
- **RF-8** Si el navegador no permite leer los datos, entonces el sistema deberá avisar y
  mostrar la página sin sesiones.
- **RF-9** Cuando un guardado posterior funcione, el sistema deberá retirar el aviso de error.

Todos los textos en español, usables a 375 px, con teclado y con lector de pantalla. No cambia
el formato de las sesiones.

## Casos límite

JSON cortado, texto vacío, nulo, número, texto u objeto (ilegibles); lista vacía o con todo
dañado (legible); números que no caben (`1e999`) conservados igual; dos daños distintos; recargar
con el mismo daño; sin espacio para la copia o para la sesión; almacenamiento bloqueado.

## Fuera de alcance

Restaurar o borrar copias desde la web, cerrar el aviso, exportar e importar, y editar o borrar
sesiones.

## Consecuencia aceptada

Una sesión con minutos incorrectos deja de contar para la racha y el mes.
