# TODO · Explorador de pantallas Limonero Fuzz

## [x] Fondos y flujo de la primera pantalla
- La pantalla 1 conserva la composición del local y el portal del storyboard. El limón y los objetos mantienen posiciones y perspectiva del arte; el personaje se dibuja aparte para poder caminar.
- La secuencia sigue siendo enchufar el cable primero a la guitarra y luego al amplificador; examinarlo, encenderlo y tocar la guitarra.
- Para cruzar el portal basta un acorde de Do♯ menor de dos o más notas que incluya Do♯; las díadas cuentan. Se admiten inversiones, acordes extendidos y las notas que correspondan a la tonalidad de Do♯ menor. No valen notas sueltas ni acordes fuera de la tonalidad.

## [x] Resolver la conversación de la segunda pantalla según el camino mayoritario
- Cada turno normal ofrece tres respuestas: una reinicia la conversación, otra favorece el camino A y otra favorece el camino B.
- La conversación suma probabilidad al camino favorecido. Si la probabilidad de B supera el 50 %, el resultado es siempre B y los pájaros cruzan silbando para que el limón los oiga.
- Si la probabilidad de A es mayor que la de B, el resultado es siempre A; su desenlace solo ofrece «Silbar».
- Si A y B quedan exactamente empatados, la resolución se mantiene aleatoria al 50 %.
- La escena conserva el fondo de amanecer de referencia; el sol sale, la flor se abre y se puede recoger la semilla de «Ventana al sendero».

## [x] Agrandar los cuadros de texto manteniendo su pixel art
- Los cuadros de diálogo y de acción comparten marco pixel art, se integran dentro de la ilustración y se anclan abajo del área de juego.
- Las cajas y opciones usan más espacio y letra mayor para facilitar la lectura; el diálogo avanza mediante «Siguiente» antes de mostrar las respuestas.
- Las zonas libres del juego conservan los clics de movimiento sin que el cuadro bloquee la interacción de sus botones.

## [x] Igualar dimensiones, proporción y movimiento en ambas pantallas
- Ambas áreas de juego comparten dimensión y proporción responsive; en la vista desktop comprobada, cada una mide 760 × 859 px.
- El arte vertical del local conserva su proporción, centrado entre bandas negras laterales; no se deforma para coincidir con el amanecer.
- En ambas escenas el limón solo se mueve al hacer clic en suelo transitable; los clics en las bandas negras, la pared o el cielo no lo desplazan, y los puntos de objeto conservan sus acciones.

## [x] Validación del sitio
- TypeScript y build estático completan sin errores; ambos fondos se sirven como PNG y el manifiesto de rutas es válido.
- En Preview se recorrió la primera escena y se probaron los finales A y B, incluidos los pájaros, el amanecer, la semilla y el acorde mínimo Do♯–Mi.
