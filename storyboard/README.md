# Storyboard — Limonero Fuzz

Carpeta de referencia narrativa y visual del juego. Las imágenes aquí son copias organizadas de assets ya existentes en `client/public`; los originales se mantienen en su ubicación porque la aplicación los utiliza.

## Secuencia

### 01 — El local y el portal

El limón explora un local al anochecer. Descubre guitarra, cable y amplificador; conecta primero el cable a la guitarra y después al amplificador, lo enciende y toca un acorde válido de Do♯ menor. El portal se activa y el protagonista lo cruza.

### 02 — Ventana al sendero

El limón llega a un camino entre montañas al amanecer. La conversación ramificada acumula decisiones hacia A o B. En su cierre, el jugador ejecuta el desenlace correspondiente: el limón silba o escucha silbar a los pájaros. El amanecer, la flor y la semilla cierran esta rama y desbloquean la canción «Ventana al sendero».

### 03 — Raíces

En unas ruinas cubiertas de vegetación, el limón recorre un sendero de piedra y examina dos columnas. Aparta las hojas y revela las inscripciones «as above» y «so below». Al descubrir ambas, florece una planta y aparece la tercera semilla, que desbloquea «Raíces».

## Referencias visuales

- [Pantallas 01–02](referencias/pantallas-01-02.png): composición del local y escena del camino al amanecer.
- [Amanecer](referencias/amanecer.png): referencia ampliada de la escena y el motivo de la flor.
- La implementación de la escena 03 se guía por las referencias de las ruinas y columnas de `client/public/ruins-background.png` y `client/public/ruins-column-*.png`.

## Fuente de implementación

El flujo detallado de interacciones, acertijos, reglas y criterios de arte se mantiene en `TODO.md`, junto con el código de las escenas en `client/src/`.
