# Limonero Fuzz

Aventura narrativa de exploración y puzles en pixel art. El jugador guía a un limón por escenas conectadas, interactúa con personajes y objetos, descubre inscripciones y recoge semillas que abren el Libro de Semillas.

Esta guía sirve como mapa de continuidad para mantener el juego coherente al seguir desarrollándolo. Antes de cambiar una mecánica, revisar también [`TODO.md`](TODO.md), que recoge requisitos y trabajo pendiente.

## Desarrollo local

Requiere Node.js y pnpm (el repositorio fija `pnpm@10.18.0`). Desde la raíz:

```bash
pnpm install
pnpm dev:static
```

`dev:static` sirve el juego cliente con Vite en el puerto `3000` por defecto (o en `PORT`). Para levantar el entorno completo con el servidor de desarrollo, usar `pnpm dev`.

Comprobaciones antes de dar por terminado un cambio:

```bash
pnpm check
pnpm test
pnpm build:static
```

`pnpm build` y `pnpm start` compilan y sirven el paquete de aplicación completo. La plantilla también incluye Express, tRPC y Drizzle; el progreso del juego y el Libro de Semillas se guardan actualmente en el navegador, no en la base de datos.

## Recorrido y reglas de juego

1. **Aurora** es la introducción musical. El nombre visible es “Aurora”, pero el identificador persistente sigue siendo `intro`. No renombrarlo sin una migración compatible con el progreso ya guardado.
2. **Ventana al sendero** presenta las animaciones de pájaros y silbido. Los cuadros de diálogo deben esperar a que terminen para no cubrirlas.
3. **Raíces** pide apartar cuatro hojas de cada primer plano. Las inscripciones integradas en la piedra son exactamente `as above` y `so below`; descubrirlas ambas desbloquea la semilla y la canción de Raíces.
4. **Rambla** comienza su conversación solo cuando el limón termina de caminar dentro del círculo de la hoguera. Tres decisiones se puntúan por mayoría: dos de tres determinan el desenlace. La ruta pacífica habilita exactamente tres palitos; un clic en un palito hace que el limón camine y lo recoja, y un clic en la hoguera mientras lleva una rama hace que la deposite en el centro. Al completar las tres, otro clic enciende el fuego. La ruta drástica muestra primero una advertencia narrativa lenta sobre el ataque de la secta y luego permite iniciar la tirada de habilidad para rodar.
5. **La Orilla del Río Espejo** se desbloquea al recoger «Rambla». La piedra despierta a los Espíritus del Río y la conversación avanza en cuadros breves, con tres respuestas posibles por ruta. Tras la revelación aparece la semilla plateada de «Espíritus del río», que se recoge con un clic y se añade al Libro de Semillas.
6. **El reto del río** se abre al recoger «Espíritus del río». Se conserva la prueba intermedia de los Espíritus del Río: el limón entra en la corriente y elige cómo afrontar el cauce.
7. **El Río** se abre al completar ese reto con el limón ya situado en el fondo del cauce. No hay fases de descenso ni de escucha de la corriente: puede pulsar cuatro peces —verde/alegría, azul/tristeza, rojo/enfado y amarillo/sabiduría—. El pensamiento del pez aparece primero y, al pedir la respuesta, el mismo recuadro muestra después la contestación socrática del pez negro. Solo después de escuchar los cuatro colores aparece el pez blanco, cuyo pensamiento de paz entrega la semilla de «El Río» al Libro de Semillas.

En Rambla se prefieren textos evocadores a instrucciones literales. No añadir pistas que expliquen directamente dónde caminar o qué objeto mover, salvo que una necesidad de accesibilidad lo requiera.

## Persistencia y repeticiones

El Libro de Semillas usa la clave de `localStorage` `limonero-fuzz-seedbook-v1`. La colección de semillas/canciones es progreso global. Repetir una entrada debe cerrar el Libro y reiniciar solo los estados de ese minijuego, sin borrar la colección ni reiniciar el juego entero.

Al cambiar nombres visibles de canciones, conservar los IDs que ya estén persistidos. Si se altera el formato de datos guardados, agregar una migración o una lectura compatible con los valores antiguos.

## Mapa de archivos

| Archivo | Responsabilidad |
| --- | --- |
| `client/src/pages/Home.tsx` | Enrutamiento de escenas, estado global, progresión, guardado y reinicio específico de minijuegos. |
| `client/src/components/SeedBook.tsx` | Libro de Semillas, canciones, progreso y navegación de replay. |
| `client/src/components/CampfireScene.tsx` | Mundo interactivo de Rambla, movimiento, palitos, depósito y hoguera. |
| `client/src/components/campfireMovementRules.ts` | Geometría caminable, distancias y límites compartidos de la escena de Rambla. Mantener aquí las reglas para evitar duplicar valores en el JSX. |
| `client/src/components/RamblaConversation.tsx` | Paneles de diálogo, advertencia previa y medidor de la tirada de habilidad. |
| `client/src/components/ramblaConversationRules.ts` | Preguntas, respuestas y puntuación de los tres turnos de conversación. |
| `client/src/components/CampfireFlame.tsx` | Sprite SVG pixelado de la llama y los leños pequeños. |
| `client/src/components/RiverMirrorScene.tsx` | Escena 05 de la orilla, diálogo ramificado y desenlaces de los Espíritus del Río. |
| `client/src/components/river-mirror-scene.css` | Fondo, espíritus, corriente plateada y transiciones de la escena 05. |
| `client/src/components/RiverChallengeScene.tsx` | Escena 06 del reto intermedio de los Espíritus del Río. |
| `client/src/components/river-challenge-scene.css` | Visual acuático y personajes etéreos del reto de la escena 06. |
| `client/src/components/ElRioScene.tsx` | Escena 07 de El Río, entrada del limón en el agua y peces de colores. |
| `client/src/components/el-rio-scene.css` | Agua profunda, peces pixel art y cuadro de diálogo de la escena 07. |
| `client/src/components/ruins-column-puzzle.css` | Encuadre, zoom e interacción de los primeros planos de Raíces. |
| `client/public/ruins-column-left-inscribed-pixelated.png` | Ilustración izquierda con `as above` tallado en la piedra. |
| `client/public/ruins-column-right-inscribed-pixelated.png` | Ilustración derecha con `so below` tallado en la piedra. |
| `client/public/river-mirror-background.png` | Fondo pixel art de la Orilla del Río Espejo. |
| `client/public/el-rio-background-pixel.png` | Fondo submarino pixel art de El Río, con profundidad, raíces, vegetación y haces de luz. |
| `client/src/components/campfireMovementRules.test.ts` | Pruebas de límites y movimiento de la escena de Rambla. |
| `client/src/components/ramblaConversationRules.test.ts` | Pruebas de puntuación y desenlaces conversacionales. |
| `TODO.md` | Lista de requisitos, estado de implementación y pendientes del proyecto. |

Los estilos globales y de escena están junto a cada componente; `client/src/pages/home.css` controla el marco general del juego.

## Convenciones visuales y de interacción

- Mantener el juego a pantalla completa, sin encabezados o pestañas externas que no pertenezcan al mundo del juego.
- Usar `image-rendering: pixelated` para los recursos de pixel art y comprobar que los assets y sus inscripciones comparten una escala de píxel coherente.
- Las semillas tienen fondo transparente y un resplandor discreto según su color; evitar recuadros sólidos.
- Conservar hitboxes táctiles generosas aunque el sprite sea pequeño y mantener nombres accesibles (`aria-label`) en acciones importantes.
- La posición del limón y los objetos se expresa como porcentajes del escenario. Antes de mover un objetivo, comprobar que la ruta completa es caminable y que el personaje termina dentro del radio válido.
- Los temporizadores y animaciones deben limpiarse al desmontar componentes. Respetar `prefers-reduced-motion` y ofrecer una alternativa cuando la mecánica dependa del movimiento.

## Flujo recomendado para futuros cambios

1. Leer los criterios pertinentes en `TODO.md` y localizar el componente dueño del estado antes de editar.
2. Mantener el progreso global separado del estado temporal de cada minijuego; verificar que los replays no borran semillas ya descubiertas.
3. Añadir o actualizar pruebas de reglas puras cuando cambien puntuaciones, rutas, límites o condiciones de desbloqueo.
4. Probar la escena en el preview, incluyendo una ventana estrecha/táctil; comprobar que los cuadros no tapan animaciones y que los objetivos funcionan con un único gesto cuando así lo pide el diseño.
5. Ejecutar `pnpm check`, `pnpm test` y `pnpm build:static`; revisar también `git diff --check`.
6. No copiar secretos al cliente. `server/_core/publicConfig.ts` solo debe exponer valores expresamente públicos; las claves privadas permanecen en el servidor. Las opciones de plataforma se consultan en `webdev.config`.

Los enlaces de YouTube y descarga del Libro siguen siendo marcadores de posición hasta que se incorporen las URLs y archivos oficiales del disco; no inventar ni reemplazar esos recursos. El Libro no incluye reproductor ni espacio para MP3.
