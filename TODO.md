# TODO · Explorador de pantallas Limonero Fuzz

## [x] Fondos y flujo de la primera pantalla
- La pantalla 1 conserva la composición del local y el portal del storyboard. El limón y los objetos mantienen posiciones y perspectiva del arte; el personaje se dibuja aparte para poder caminar.
- La secuencia sigue siendo enchufar el cable primero a la guitarra y luego al amplificador; examinarlo, encenderlo y tocar la guitarra.
- Para cruzar basta un acorde de Do♯ menor de dos o más notas que incluya Do♯; las díadas cuentan. Se admiten inversiones, acordes extendidos y las notas de la tonalidad de Do♯ menor. No valen notas sueltas ni acordes fuera de la tonalidad.

## [x] Resolver la conversación de la segunda pantalla según el camino mayoritario
- Cada turno normal ofrece tres respuestas: una reinicia la conversación, otra favorece A y otra B.
- La conversación suma probabilidad al camino favorecido. Si B supera el 50 %, el resultado es siempre B y los pájaros cruzan silbando para que el limón los oiga.
- Si A tiene más probabilidad que B, el resultado es siempre A; su desenlace solo ofrece «Silbar».
- Si A y B quedan exactamente empatados, la resolución se mantiene aleatoria al 50 %.
- La escena conserva el fondo de amanecer; el sol sale, la flor se abre y se puede recoger la semilla de «Ventana al sendero».

## [x] Cajas legibles y escenas de igual proporción
- Los cuadros de diálogo y de acción comparten marco pixel art, se integran dentro de la ilustración y usan texto de mayor tamaño. El diálogo avanza mediante «Siguiente» antes de presentar las respuestas.
- Ambas áreas de juego comparten dimensión y proporción responsive; en desktop cada una mide 760 × 859 px. El arte vertical del local queda centrado entre bandas negras sin deformarse.
- En ambas escenas el limón solo camina dentro del suelo transitable. Se ignoran clics en las bandas negras, pared o cielo y se conservan las interacciones de objetos.

## [x] Animar el cruce entre dimensiones
- Al pulsar «Cruzar», el limón salta hacia el portal mientras el aro y el interior giran.
- Al acabar el salto, aparece en la segunda dimensión un portal que se materializa girando delante del amanecer; se desvanece lentamente después de 4,8 segundos.
- Durante el cruce y la llegada, las dos pestañas quedan bloqueadas, se ocultan las cajas y el limón no puede moverse ni iniciar el diálogo. La navegación se habilita cuando termina la aparición.
- Las duraciones de movimiento, cruce y llegada se sincronizan con `prefers-reduced-motion`; en ese modo las guardas no mantienen al personaje bloqueado tras terminar la transición visual.

## [x] Variar la ubicación de las cajas sin tapar puntos importantes
- La caja de acciones del local se sitúa arriba a la izquierda sobre la pared despejada. En desktop la caja del amanecer se sitúa arriba a la derecha, lejos del sol y las ventanas; en móvil pasa a arriba a la izquierda para dejar libre el pico alto. Los tamaños se adaptan a cada escena.
- Las cajas evitan cubrir guitarra y amplificador, limón, portal de llegada y flor/semilla; comparten marco pixel art y texto legible.
- Cada caja nueva aparece lentamente, pasando de transparente a opaca en 1,7 segundos.

## [x] Hacer la caminata pausada y animar las patas
- El limón tarda 3,8 segundos en recorrer cada destino, manteniendo el movimiento restringido a suelo transitable en ambas escenas.
- Ambas patas alternan mientras camina y se detienen al llegar; el salto al portal tiene una animación diferenciada.

## [x] Validación final
- TypeScript (`pnpm check`) y build estático pasan; los fondos PNG y el manifiesto de rutas se incluyen en `dist/public`.
- Preview sirve la página y el manifiesto. Se probó el Do♯–Mi, la caminata de 3,8 s con animación de patas y rechazo de clics en el cielo.
- Se comprobó el inicio del salto y giro, la llegada animada, el bloqueo de las dos pestañas durante el cruce y la ausencia de cajas sobre el portal durante su llegada.
