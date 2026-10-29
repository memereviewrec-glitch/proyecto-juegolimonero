# TODO · Explorador de pantallas Limonero Fuzz

## [x] Pantalla 1: fondo y flujo de juego
- La pantalla 1 conserva la composición del local y el portal del storyboard; la guitarra y el amplificador mantienen sus posiciones y perspectiva. El limón se dibuja como actor independiente para poder caminar.
- La secuencia es conectar el cable primero a la guitarra y luego al amplificador; examinar el amplificador, encenderlo y tocar la guitarra.
- Para cruzar basta un acorde de Do♯ menor de dos o más notas que incluya Do♯; cuentan las díadas. Se admiten inversiones y extensiones dentro de la tonalidad de Do♯ menor. No valen notas sueltas ni acordes fuera de la tonalidad.

## [x] Pantalla 2: conversación y cierre de rama
- Cada turno normal ofrece tres respuestas: reiniciar la conversación, favorecer A o favorecer B.
- Si la probabilidad de B supera el 50 %, se elige B; si A supera a B, se elige A. Si empatan, se resuelve al azar al 50 %.
- Si predomina A, la última parte ofrece una única opción: «Silbar»; al elegirla, silba el limón y no aparecen pájaros.
- Si predomina B, la última parte ofrece una única opción: «Mirar al cielo y escuchar a los pájaros silbar»; al elegirla, silba la bandada y no el limón. Los finales no vuelven a abrir el conjunto de tres respuestas.

## [x] Amanecer, flor y semilla
- Ambas acciones terminales inician el mismo amanecer: el cielo se ilumina gradualmente y el sol sale.
- La flor se abre en pixel art después de comenzar el amanecer y entrega una semilla que cae desde su centro. Solo se ofrece «Coger semilla» después de que termine la caída.

## [x] Llegada, movimiento y presentación
- Al cruzar el portal, el limón salta hacia él; en la escena 2 sale del portal, salta y cae en el suelo. El portal gira en ambas dimensiones y aparece delante de la salida del sol.
- Durante el cruce y la llegada se bloquean las pestañas, el movimiento del limón y los cuadros de interacción.
- Ambas áreas de juego mantienen la misma proporción responsive; en desktop miden 760 × 859 px. El local vertical se centra con bandas negras, sin deformar el arte.
- En ambas escenas, el limón sigue el clic solo por el suelo transitable; se ignoran las bandas negras, paredes y cielo. Cada desplazamiento dura 3,8 s y las dos patas se animan mientras camina.
- Los cuadros de diálogo y de acción comparten marco pixel art, pueden variar en ubicación y tamaño según la escena para no tapar elementos importantes, y avanzan con «Siguiente» antes de presentar respuestas.
- Los cuadros aparecen mediante un fundido suave de 1,45 s. La llegada, caminata y amanecer respetan `prefers-reduced-motion`.

## [x] Validación final
- `pnpm check` y `pnpm build:static` pasan; el manifiesto de rutas y los fondos PNG se incluyen en la build y sirven en Preview.
- En Preview se recorrieron ambas ramas: el final A silba con el limón; el B da una única acción para mirar/escuchar y muestra a los pájaros. En ambas se ilumina el cielo, se abre la flor, cae la semilla y aparece su opción de recogida.
- La transición mostró el portal, el salto de salida y el descenso del limón hasta el suelo; las pestañas quedan bloqueadas hasta terminar la llegada.
