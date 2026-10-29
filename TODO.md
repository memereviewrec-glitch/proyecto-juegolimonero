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

## [x] Separación y pistas de los objetos en la pantalla 1
- La guitarra, el cable y el amplificador se ven como tres sprites separados, con espacio suficiente entre sí para distinguir sus zonas clicables y deducir que cada uno es un objeto interactivo.
- La guitarra se puede clicar desde el principio; antes de que ambos extremos estén conectados, el protagonista muestra un diálogo interno indicando que la guitarra no está enchufada y que hay que conectarla.
- El amplificador no se puede clicar hasta que el cable esté conectado por ambos extremos.

## [x] Tocar en el primer plano del mástil
- Al elegir «Tocar la guitarra», la escena cambia a un primer plano horizontal del mástil, con la pala, seis clavijas y cuerdas amarradas, seis cuerdas y los nueve primeros trastes visibles y numerados.
- La afinación estándar se muestra con la cuerda grave Mi abajo. De abajo arriba aparecen Mi–La–Re–Sol–Si–Mi (E2–A2–D3–G3–B3–E4). Se pueden elegir cuerdas/trastes en el mástil y tocar la selección; las notas se oyen según la altura real que corresponde a esa cuerda y traste.
- Se conserva la regla del portal: al menos dos notas distintas que formen clases de nota de la escala de Do♯ menor natural, incluido Do♯. Las notas sueltas, dos posiciones de la misma clase de nota y las notas/acordes fuera de la escala no abren el portal.

## [x] Sustain y legibilidad de las vistas ampliadas
- Cada nota de guitarra tiene un sustain estable y una caída suave en una muestra MP3 de aproximadamente 2 segundos.
- En el dibujo, la cuerda grave Mi queda abajo; de abajo arriba aparecen Mi–La–Re–Sol–Si–Mi, en afinación estándar.
- Los textos de las vistas ampliadas del amplificador, el cable y el mástil aumentan alrededor de dos puntos y permanecen legibles también en el breakpoint móvil.

## [x] Pantalla 2: conversación y cierre de rama
- Cada turno normal ofrece tres respuestas: reiniciar la conversación, favorecer A o favorecer B.
- Si la probabilidad de B supera el 50 %, se elige B; si A supera a B, se elige A. Si empatan, se resuelve al azar al 50 %.
- Si predomina A, la última parte ofrece una única opción: «Silbar»; al elegirla, silba el limón y no aparecen pájaros.
- Si predomina B, la última parte ofrece una única opción: «Mirar al cielo y escuchar a los pájaros silbar»; al elegirla, silba la bandada y no el limón. Los finales no vuelven a abrir el conjunto de tres respuestas.

## [x] Legibilidad y limpieza de las respuestas en la pantalla 2
- Los cuadros de diálogo de «Ventana al sendero» muestran las respuestas con tipografía mayor y fácil de leer.
- No aparece ningún símbolo, icono o código junto a la respuesta elegible: se quitan, entre otros, el símbolo de reinicio y las letras A y B; las opciones conservan su texto y su comportamiento.

## [x] Arte y limpieza de las pantallas 1 y 2
- La guitarra y el amplificador de la pantalla 1 usan exactamente el dibujo del fondo anterior, separado como sprites interactivos; no se ven rótulos como «CABLE», «GUITARRA» o «AMPLIFICADOR» en la escena principal.
- El primer plano del acertijo del cable no tiene letras, instrucciones ni título; solo se ven el cable y la opción «Volver al local».
- El primer plano del acertijo del amplificador tampoco muestra títulos, indicaciones ni rótulos explicativos; conserva solo el control físico ON/OFF y la acción «Siguiente» necesarios para completar el acertijo.
- El local comienza sin instrucciones, pistas ni leyendas visibles sobre los objetos; el diálogo interno solo aparece después de interactuar con la guitarra.
- Al terminar y recoger la semilla de «Ventana al sendero», la acción de avance abre la pantalla siguiente «Raíces»; no ofrece volver al local.

## [x] Pantalla 3: ruinas, inscripciones y canción «Raíces»
- El fondo se basa en el cuadro 03 del storyboard v02: ruinas invadidas por la vegetación, camino y arco de piedra entre dos columnas. El limón se mueve por el camino.
- Los fondos de las pantallas posteriores se basarán en los cuadros correspondientes del storyboard v02, sin sustituir esta dirección visual por fondos genéricos.
- El limón se acerca a las dos columnas de una en una. Al llegar a una columna aparece «Examinar» y se abre una vista extra de primer plano que ocupa el mismo lienzo de juego; no aparece debajo de la escena de las ruinas.
- Cada minijuego de columna llena ese mismo marco de proporción 1180:1333; la escena de las ruinas queda oculta, pero sigue montada para conservar la posición del limón al volver.
- En cada primer plano, el jugador arrastra las hojas que cubren la piedra para apartarlas. Al despejar la columna izquierda aparece exactamente «as above»; al despejar la derecha, exactamente «so below».
- Tras descubrir ambas inscripciones, una planta crece hasta florecer y entrega la tercera semilla, que desbloquea la tercera canción «Raíces».

## [x] Amanecer, flor y semilla
- Ambas acciones terminales inician el mismo amanecer: el cielo se ilumina gradualmente y el sol sale.
- La flor se abre en pixel art después de comenzar el amanecer y entrega una semilla que cae desde su centro. Solo se ofrece «Coger semilla» después de que termine la caída.

## [x] Llegada, movimiento y presentación
- Al cruzar el portal, el limón salta hacia él; en la escena 2 sale del portal, salta y cae en el suelo. El portal gira en ambas dimensiones y aparece delante de la salida del sol.
- Durante el cruce y la llegada se bloquean las pestañas, el movimiento del limón y los cuadros de interacción.
- Las pantallas jugables 1, 2 y 3, y sus vistas extra de minijuego, comparten el mismo lienzo responsive con proporción 1180:1333; en desktop cada una mide 760 × 859 px. El local se centra con bandas negras, sin deformar el arte.
- En ambas escenas, el limón sigue el clic solo por el suelo transitable; se ignoran las bandas negras, paredes y cielo. Cada desplazamiento dura 3,8 s y las dos patas se animan mientras camina.
- Los cuadros de diálogo y de acción comparten marco pixel art, pueden variar en ubicación y tamaño según la escena para no tapar elementos importantes, y avanzan con «Siguiente» antes de presentar respuestas.
- Los cuadros aparecen mediante un fundido suave de 1,45 s. La llegada, caminata y amanecer respetan `prefers-reduced-motion`.

## [ ] Libro de semillas y canciones
- Un panel desplegable «Libro de semillas» permanece accesible durante la partida y añade cada semilla al descubrirla. Muestra el título y metadatos independientes de las semillas encontradas.
- Cada entrada ofrece acciones separadas para reproducir el fragmento MP3 dentro del juego, abrir el enlace de YouTube y descargar la canción completa en WAV.
- La colección incluye las diez canciones en el orden facilitado por el grupo y solo muestra como descubiertas las semillas que el jugador ya haya encontrado.
- Si un archivo o enlace oficial aún no está disponible, su campo y acción aparecen pendientes/deshabilitados; no se inventan canciones, enlaces ni archivos.

## [x] Notas y efectos de sonido en MP3
- Las notas seleccionadas en el mástil, de E2 a C#5 dentro de los nueve primeros trastes, y los dos silbidos del limón y los pájaros se reproducen desde archivos MP3; el juego no sintetiza estas notas mediante osciladores Web Audio.
- Cada nota conserva aproximadamente dos segundos de sustain y las muestras de acordes pueden reproducirse simultáneamente.

## [x] Validación de la versión actual
- `pnpm check`, `pnpm build:static` y `git diff --check` pasan; el manifiesto de rutas, los fondos PNG y los 36 recursos MP3 del juego se incluyen en la build.
- Se incluyen 34 muestras MP3 de guitarra entre E2 y C#5 y dos silbidos MP3; `ffprobe` confirma codec MP3 y una duración aproximada de 2 s para las notas. No quedan `AudioContext` ni osciladores en el código del juego.
- La ruta del banco de guitarra apunta a `/audio/guitar/`; el panel del libro recibe el foco al abrirse, atrapa Tab/Mayús+Tab, cierra con Escape y devuelve el foco al control que lo abrió.
- En Preview se usaron eventos de puntero `pointerdown`/`pointermove`/`pointerup` para conectar la punta A a la guitarra y después la punta B al amplificador; la conexión completa habilita la siguiente etapa.
- Con clics de navegador se verificó que al inicio la guitarra está activa y abre el pensamiento «La guitarra no está enchufada. Tengo que conectar el cable antes de tocar», sin mover al limón; el ampli permanece deshabilitado.
- Tras conectar primero la punta A a la guitarra y luego la B al ampli, ambos destinos quedan conectados y el hotspot del ampli se habilita.
- Se abrió el primer plano del amplificador y se verificaron su tamaño, textura de tólex/rejilla, mandos y control ON/OFF. Tras pulsar ON/OFF, el LED rojo se iluminó y el primer plano siguió abierto; «Siguiente» cerró ese primer plano.
- La escena principal empieza sin pistas ni rótulos; el diálogo solo aparece al interactuar. La ventana del cable muestra solo cable/conectores y «Volver al local». El ampli conserva únicamente controles funcionales, sin título ni indicaciones.
- Se abrió el mástil y se verificaron E–A–D–G–B–E, seis clavijas y los nueve trastes. Una nota sola y dos notas sin Do♯ no abrieron el portal; una díada Do♯–Mi en cuerdas distintas sí lo abrió.
- En Preview se recorrió la ruta B hasta su acción terminal. Las tres respuestas normales se muestran sin iconos ni códigos, con 16 px de texto y una columna; la opción final «Mirar al cielo y escuchar a los pájaros silbar» no lleva ningún símbolo.
- Al recoger «Ventana al sendero», «Siguiente: Raíces» abre la tercera escena; no aparece un botón de retorno al local. La navegación de progreso tampoco habilita volver a pantallas anteriores.
- En las ruinas se caminaron las zonas del sendero, se examinó cada columna por separado y se arrastraron sus hojas: izquierda «as above», derecha «so below». Al despejar ambas, creció la flor, cayó la tercera semilla y se desbloqueó «Raíces».
- Las dos rutas del amanecer, la flor, la semilla y el salto del limón siguen verificadas de la iteración anterior; se capturaron vistas responsive de escritorio y móvil para comprobar la separación de los sprites.
