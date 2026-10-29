# TODO · Explorador de pantallas Limonero Fuzz

## [x] Pantalla 1: fondo y flujo de juego
- La pantalla 1 conserva la composición del local y el portal del storyboard; la guitarra y el amplificador mantienen sus posiciones y perspectiva. El limón se dibuja como actor independiente para poder caminar.
- La secuencia es conectar el cable primero a la guitarra y luego al amplificador; examinar el amplificador, encenderlo y tocar la guitarra.
- Para cruzar basta un acorde de Do♯ menor de dos o más notas que incluya Do♯; cuentan las díadas. Se admiten inversiones y extensiones dentro de la tonalidad de Do♯ menor. No valen notas sueltas ni acordes fuera de la tonalidad.

## [x] Primer plano detallado del amplificador
- Al elegir «Examinar amplificador», el amplificador ocupa una vista frontal grande y legible, conserva la acción ON/OFF y muestra detalles de tólex antiguo desgastado y una rejilla de altavoz de aspecto antiguo.

## [x] Confirmación tras encender el amplificador
- Al pulsar ON/OFF, una luz roja visible en el propio botón se enciende y el jugador permanece en el primer plano del amplificador; la vista no se cierra automáticamente.
- Solo al pulsar «Siguiente» se abandona el primer plano y se vuelve al local para continuar hacia la guitarra.

## [x] Examinar y conectar el cable con arrastre
- El cable y sus dos conectores jack se distinguen claramente en la escena. Al acercarse al cable aparece la acción «Examinar cable», que abre un primer plano independiente, como la vista del amplificador.
- En el primer plano se arrastra un extremo del cable a la guitarra y, después, el otro extremo al amplificador. La secuencia obligatoria sigue siendo guitarra primero, amplificador después; la conexión incorrecta no avanza el acertijo.
- La interfaz muestra los destinos guitarra/amplificador, el estado de cada extremo y una forma clara de volver al local. El arrastre no mueve al limón ni dispara la caminata del escenario.

## [x] Tocar en el primer plano del mástil
- Al elegir «Tocar la guitarra», la escena cambia a un primer plano horizontal del mástil, con la pala, seis clavijas y cuerdas amarradas, seis cuerdas y los nueve primeros trastes visibles y numerados.
- La afinación estándar se muestra con la cuerda grave Mi abajo. De abajo arriba aparecen Mi–La–Re–Sol–Si–Mi (E2–A2–D3–G3–B3–E4). Se pueden elegir cuerdas/trastes en el mástil y tocar la selección; las notas se oyen según la altura real que corresponde a esa cuerda y traste.
- Se conserva la regla del portal: al menos dos notas distintas que formen clases de nota de la escala de Do♯ menor natural, incluido Do♯. Las notas sueltas, dos posiciones de la misma clase de nota y las notas/acordes fuera de la escala no abren el portal.

## [x] Sustain y legibilidad de las vistas ampliadas
- Cada nota de guitarra tiene un sustain estable y una caída suave, con 2 segundos de duración programada por nota antes de detener el oscilador.
- En el dibujo, la cuerda grave Mi queda abajo; de abajo arriba aparecen Mi–La–Re–Sol–Si–Mi, en afinación estándar.
- Los textos de las vistas ampliadas del amplificador, el cable y el mástil aumentan alrededor de dos puntos y permanecen legibles también en el breakpoint móvil.

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

## [x] Validación de la versión actual
- `pnpm check`, `pnpm build:static` y `git diff --check` pasan; el manifiesto de rutas y los fondos PNG se incluyen en la build y sirven en Preview.
- En Preview se usaron eventos de puntero `pointerdown`/`pointermove`/`pointerup` para conectar la punta A a la guitarra y después la punta B al amplificador; la conexión completa habilita la siguiente etapa.
- Se abrió el primer plano del amplificador y se verificaron su tamaño, textura de tólex/rejilla, mandos y control ON/OFF. También se abrió el mástil y se verificaron E–A–D–G–B–E, seis clavijas y los nueve trastes.
- Una nota sola y dos notas sin Do♯ no abrieron el portal; una díada Do♯–Mi en cuerdas distintas sí lo abrió. Las dos rutas del amanecer, la flor, la semilla y el salto del limón siguen verificadas de la iteración anterior.
- Tras pulsar ON/OFF, el LED rojo del botón se iluminó y el primer plano siguió abierto; «Siguiente» cerró ese primer plano y habilitó la guitarra.
- En la vista del mástil, Preview muestra de arriba abajo E4–B3–G3–D3–A2–E2, por lo que la grave E2 queda abajo. Se midieron rótulos del primer plano de 11–19 px; el audio programa 2 segundos antes del final de cada nota.
