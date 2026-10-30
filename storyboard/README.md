# Storyboard — Limonero Fuzz

Carpeta de referencia narrativa y visual del juego. Incluye copias de paneles oficiales en `referencias/` y enlaces a los fondos finales que la aplicación utiliza desde `client/public`.

## Secuencia

### 01 — El local y el portal

El limón explora un local al anochecer. Descubre guitarra, cable y amplificador; conecta primero el cable a la guitarra y después al amplificador, lo enciende y toca un acorde válido de Do♯ menor. El portal se activa y el protagonista lo cruza.

### 02 — Ventana al sendero

El limón llega a un camino entre montañas al amanecer. La conversación ramificada acumula decisiones hacia A o B. En su cierre, el jugador ejecuta el desenlace correspondiente: el limón silba o escucha silbar a los pájaros. El amanecer, la flor y la semilla cierran esta rama y desbloquean la canción «Ventana al sendero».

### 03 — Raíces

En unas ruinas cubiertas de vegetación, el limón recorre un sendero de piedra y examina dos columnas. Aparta las hojas y revela las inscripciones «as above» y «so below». Al descubrir ambas, florece una planta y aparece la tercera semilla, que desbloquea «Raíces».

### 04 — Encuentro bajo la luna

Después de encontrar la semilla de «Raíces», el limón llega a una reunión nocturna en un valle rocoso. El jugador recoge cuatro palitos, los lleva uno por uno al centro del círculo y enciende la hoguera. Al terminar la animación del fuego aparece la semilla de «Rambla»; hay que pulsarla para añadirla al Libro de Semillas.
El limón es un actor separado del fondo y se puede mover por el sendero haciendo clic o usando las flechas. La semilla de «Rambla» es turquesa y se recoge directamente al pulsarla.

## Referencias visuales

- [Pantallas 01–02](referencias/pantallas-01-02.png): composición del local y escena del camino al amanecer.
- [Amanecer](referencias/amanecer.png): referencia ampliada de la escena y el motivo de la flor.
- La implementación de la escena 03 se guía por `client/public/ruins-background.png` y los primeros planos `client/public/ruins-column-*-inscribed-v2.png`; las inscripciones se conservan exactamente como «as above» y «so below».
- [Panel oficial 04](referencias/panel-04.png): composición de la reunión nocturna compartida para el desarrollo de la nueva escena.
- [Fondo pixel art 04](../client/public/scene-04-background.png): arte final integrado, ajustado a la proporción del mundo jugable.

## Dirección de arte y experiencia

Consulta la [guía estética del juego](GUIA-ESTETICA.md) para los principios de pixel art, paleta, composición, animación y sonido, además del tono, ritmo, feedback, diseño de acertijos y accesibilidad de la experiencia del jugador.

## Fuente de implementación

El flujo detallado de interacciones, acertijos, reglas y criterios de arte se mantiene en `TODO.md`, junto con el código de las escenas en `client/src/`.
