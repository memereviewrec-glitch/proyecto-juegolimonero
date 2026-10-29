# Guía estética y de experiencia — Limonero Fuzz

## Intención

Limonero Fuzz es una pequeña aventura musical de exploración y descubrimiento. Debe sentirse como entrar en un recuerdo psicodélico: extraño pero acogedor, contemplativo y con humor sutil. La psicodelia no significa saturar cada imagen ni confundir al jugador; nace del contraste entre lo cotidiano —un local, un cable, una guitarra— y lo mágico —un portal, un limón viajero, ruinas que responden a la música—. La curiosidad y la música son el motor emocional.

**Promesa al jugador:** mirar con atención, probar algo por intuición y recibir una respuesta clara y poética del mundo.

## Dirección de arte

### Pixel art y forma

- Mantener pixel art deliberado, con bordes limpios y bloques de color consistentes. Evitar filtros de suavizado, escalados borrosos, ruido decorativo gratuito y mezcla accidental de estilos.
- Los personajes y objetos interactivos deben leerse por silueta antes que por detalle. El limón es el foco amable y reconocible: cuerpo amarillo, pequeña hoja verde y patas negras simples; sus expresiones y movimiento deben seguir siendo legibles a tamaño móvil.
- Los fondos pueden ser más ricos que los personajes, pero deben reservar contraste y espacio visual para que el limón, los objetos y las acciones importantes destaquen.
- Mantener la proporción del lienzo de juego (1180:1333) sin deformar el arte. Recortar o adaptar la composición con cuidado; no estirar sprites ni fondos. Las bandas de color oscuro pueden enmarcar el escenario cuando la pantalla sea más ancha.

### Color, luz y atmósfera

- **Local:** sombras frías y ambiente nocturno; los equipos tienen materiales cálidos y gastados. El portal introduce un color sobrenatural que atrae la mirada sin competir con la guitarra.
- **Ventana al sendero:** amanecer pastel, con rosas, melocotones y violetas, y siluetas azuladas de montañas. El cambio de luz debe comunicar apertura y calma.
- **Raíces:** piedra gris-violeta, vegetación profunda y acentos vivos en el sendero, las hojas y la flor. El verde no debe ocultar las inscripciones ni los límites transitables.
- Usar la luz como narración: el amanecer es una transformación gradual y visible, no un destello abrupto. Reservar los colores más luminosos para descubrimientos y recompensas.

### Composición y jerarquía

Cada escena debe tener un punto de atención principal y una lectura visual clara. La ruta transitable, los objetos utilizables y los elementos que pueden examinarse deben distinguirse por forma, posición, contraste o animación discreta, no por etiquetas permanentes. Evitar cubrir el arte con paneles grandes. Los diálogos pueden variar de posición para no tapar el foco de la escena y deben conservar un marco pixel art coherente.

Los primeros planos (cable, amplificador, mástil, columnas) deben sentirse como acercamientos al mismo mundo, no como pantallas de otra aplicación: mantener paleta, marco, tipografía y proporción. Mostrar solo los controles necesarios para actuar; dejar que los objetos y la acción expliquen el acertijo.

## Movimiento, sonido y música

- La animación debe ser escasa, intencionada y legible: caminar con pasos, saltar al cruzar el portal, girar el portal, crecer la flor y caer la semilla. Cada movimiento tiene que comunicar una causa o un cambio de estado.
- Preferir transiciones suaves y pausas para observar. No añadir movimiento constante a todos los elementos; el silencio visual también forma parte del tono.
- El sonido de guitarra debe sentirse físico y musical. Las notas y acordes deben responder inmediatamente a la acción y conservar su sustain; los silbidos del limón y los pájaros son dos identidades sonoras distintas.
- La música desbloqueada es un recuerdo coleccionable, no solo un premio numérico. El libro de semillas debe invitar a volver a escuchar y conectar canciones con lugares y momentos.
- Respetar la preferencia de movimiento reducido del sistema. Si una animación se acorta o se elimina, conservar una señal visual clara del resultado.

## Experiencia del jugador

### Curiosidad sin desorientación

El jugador debe poder explorar sin una lista de instrucciones sobreimpresa. Ofrecer pistas dentro del mundo: un diálogo interior después de probar la guitarra desconectada, un objeto que responde al acercarse o un cambio de estado evidente. Las zonas no transitables simplemente no deben mover al protagonista. Evitar que el jugador tenga que adivinar qué elemento es interactivo por píxeles invisibles.

### Acciones y feedback

Toda acción importante merece una respuesta inmediata: cable conectado, amplificador encendido, nota tocada, portal activado, inscripción descubierta, flor abierta, semilla recogida. El feedback debe ser breve y coherente con el mundo —animación, sonido, diálogo o cambio de luz—, no una explicación técnica. Los estados persistentes deben seguir visibles al volver a la escena.

### Ritmo y emoción

1. **Observar:** presentar un espacio legible antes de pedir una acción.
2. **Probar:** permitir manipular objetos y escuchar notas sin penalización.
3. **Comprender:** hacer que la pista o regla necesaria se deduzca de lo que el mundo ya mostró.
4. **Resolver:** reservar un instante para que el acorde, la conversación o las inscripciones tengan peso.
5. **Respirar y recompensar:** dar tiempo al portal, el amanecer o la flor para desplegarse; después ofrecer la semilla y la canción.

El tempo general es pausado y contemplativo, con pequeñas acciones manuales que dan agencia. No apurar al jugador con temporizadores, amenazas ni castigos por experimentar.

### Acertijos justos y elecciones

- La regla musical debe ser consistente y comprobable al oído y en pantalla: para abrir el portal hacen falta al menos dos notas distintas de la escala de Do♯ menor, incluido Do♯. Una nota aislada o una combinación fuera de la regla no debe producir un falso éxito.
- Al fallar, no ridiculizar ni reiniciar el progreso; explicar lo mínimo necesario y dejar probar de nuevo.
- En la conversación, las respuestas deben sentirse como elecciones de tono y atención, no como una prueba con opción correcta. La rama final recoge lo elegido y presenta solo el desenlace correspondiente.
- Evitar inventar contenido de canciones, enlaces o recompensas que todavía no existan. Señalar con honestidad lo pendiente.

## Accesibilidad y acabado

- Mantener textos y controles legibles en escritorio y móvil; no sacrificar tamaño de letra para preservar adornos.
- No depender únicamente del color para indicar conexión, disponibilidad o éxito: combinar color con forma, posición, texto breve o cambio de estado.
- Los controles deben tener áreas tocables claras; arrastrar los jacks u hojas no debe mover accidentalmente al limón.
- Mantener orden de foco y operación por teclado donde haya controles de interfaz. Evitar parpadeos y respetar `prefers-reduced-motion`.
- Antes de cerrar una escena, comprobar que los diálogos no tapan objetos esenciales, que el arte conserva proporción y que las acciones siguen siendo comprensibles en pantalla pequeña.

## Criterio de revisión

Una nueva escena, sprite o interacción encaja si: **(1)** parece pertenecer al mismo mundo de pixel art; **(2)** ayuda a leer dónde mirar o qué cambió; **(3)** tiene un propósito emocional o jugable; **(4)** recompensa la curiosidad sin castigar la experimentación; y **(5)** funciona con claridad tanto en escritorio como en móvil.
