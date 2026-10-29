# TODO · Explorador de pantallas Limonero Fuzz

## [x] Alinear los fondos de las pantallas 1 y 2 con el storyboard aprobado
- En la pantalla 1, usar la composición del local y el portal interdimensional del storyboard de diez escenas; conservar su paleta, perspectiva, posiciones y pixel art.
- Mantener guitarra y amplificador interactivos, iniciar con el cable desconectado y reflejar la conexión por pasos; retirar del fondo el limón inmóvil para que se dibuje como personaje móvil.
- En la pantalla 2, conservar el paisaje de amanecer aportado por la banda y retirar del fondo el limón fijo, manteniendo la flor y el resto de la ilustración.

## [x] Restringir el movimiento del limón a suelo transitable en cada pantalla
- En ambas pantallas, el limón sigue los clics solo dentro de la zona de suelo; los clics en pared o cielo no cambian su destino.
- La zona transitable respeta el piso del local y el contorno ascendente del terreno de la escena de Albatera.
- Las zonas clicables de los objetos conservan sus acciones y no se confunden con clics de movimiento.

## [x] Unificar los cuadros de diálogo y de acción dentro del juego
- Mostrar todos los cuadros dentro de la ilustración y pegados a la parte inferior del área de juego, no en una columna a la derecha.
- Usar una caja compacta común con marco pixelado; recortar el texto por cuadro y avanzar con «Siguiente» antes de presentar las respuestas.
- Conservar exactamente tres respuestas por turno de la segunda pantalla: volver al inicio, favorecer el camino A o favorecer el camino B; el camino A termina con «Silbar» y el B con silencio roto por los pájaros.
- Conservar el orden de las interacciones de la primera pantalla: enchufar guitarra, enchufar amplificador, encenderlo y tocar un acorde válido de Do♯ menor antes de cruzar el portal.

## [x] Validar el sitio y sus recursos
- TypeScript y build estático completan sin errores; el manifiesto de rutas responde con HTTP 200 y JSON válido.
- Ambos fondos se sirven como PNG en Preview y aparecen incluidos en la build.
- Se comprobó la secuencia guitarra–amplificador–Do♯ menor–portal; en ambas escenas los clics en suelo mueven el personaje y los clics fuera del suelo se ignoran; la caja de diálogo queda dentro del marco y presenta tres opciones.
