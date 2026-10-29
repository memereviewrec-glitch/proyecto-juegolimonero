# TODO · Explorador de pantallas Limonero Fuzz

## [x] Explorar exclusivamente las pantallas 1 y 2 del guion aprobado
- Crear un sitio web interactivo en español para explorar, visualizar y comprender el guion jugable y storyboard de Limonero Fuzz, versión 0.4.
- Conservar la estructura narrativa, lógica musical, estados, zonas clicables y atmósfera contemplativa del guion y el storyboard asociados.
- Limitar el alcance a las pantallas 1 y 2. No convertir las escenas en combate ni añadir pantallas no solicitadas.
- Dar una navegación clara entre escenas y presentar los detalles relevantes del guion y su storyboard.
- Mostrar indicadores comprensibles del progreso y estado actual, sin revelar las probabilidades de las respuestas.

## [x] Representar interacciones contextuales y zonas clicables
- Representar las zonas clicables de cada escena; las acciones contextuales se habilitan según el estado descrito y no toda la pantalla debe abrir acciones.
- En el local, el limón debe moverse por el suelo siguiendo los clics del ratón, con una animación más pausada; el movimiento no debe habilitar acciones fuera de los puntos interactivos.
- Los cuadros de diálogo, los textos y las opciones para elegir acciones deben aparecer encima de la ilustración del fondo, dentro del espacio de juego, al estilo de cajas de diálogo de juegos de aventura como Zelda o Pokémon; no deben quedar en un panel lateral separado.
- No hace falta mostrar pistas al jugador; quitar instrucciones y explicaciones visibles que indiquen qué hacer o revelen las probabilidades y los efectos de las respuestas.
- Mantener las opciones de acción, la narración necesaria y la respuesta visual de cada estado dentro del espacio de juego.

## [x] Reflejar la secuencia de la pantalla 1 y la regla musical del portal
- La secuencia obligatoria es conectar el cable primero a la guitarra y después al amplificador; después se puede examinar el amplificador y alternar su estado con el control ON/OFF; por último, se habilita tocar la guitarra.
- Mostrar cada cambio de estado durante la secuencia.
- Proporcionar una interfaz musical para tocar notas o acordes y mostrar cómo interpreta el sistema cada entrada.
- Abrir el portal solo al tocar un acorde de Do♯ menor de dos o más notas que incluya Do♯. Se admiten díadas, inversiones y extensiones cuyas notas pertenezcan a la tonalidad de Do♯ menor; las notas individuales no abren el portal.
- Al abrir el portal se refleja el inicio de la intro del disco y la transición hacia la pantalla 2.

## [x] Representar el diálogo ramificado de la pantalla 2 y sus dos desenlaces
- En cada turno normal del diálogo debe haber exactamente tres respuestas: una reinicia la conversación, una favorece el camino A y una favorece el camino B.
- La rama A culmina en el turno final con la única opción «Silbar».
- La rama B culmina en silencio, roto por una bandada de pájaros que silba y permite que el limón entienda que no está solo.
- En ambos desenlaces sale el sol, se abre la flor y queda disponible recoger la semilla de «Ventana al sendero».
- Mostrar la rama mediante el diálogo y su respuesta visual, sin panel lateral de probabilidades ni instrucciones que revelen el resultado.

## [x] Mantener la dirección visual del guion
- Presentar el contenido con pixel art ingenuo y artesanal, tranquilo y meditativo, como dibujado en MS Paint.
- Hacer ambos fondos más psicodélicos y conservar espacio para los objetos interactivos.
- Usar como fondo de la pantalla 2 la escena de amanecer del storyboard original, igual a la ilustración de referencia.
- Mantener el portal psicodélico y próximo a la referencia del storyboard, y animaciones lentas.
- Mantener fidelidad a los detalles visuales del storyboard y del documento de guion aprobado.
