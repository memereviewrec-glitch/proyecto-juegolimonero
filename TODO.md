# TODO · Explorador de pantallas Limonero Fuzz

## [x] Acceso informal mediante contraseña
- Antes de mostrar el juego aparece una pantalla de acceso cuya clave se define en `client/src/components/PasswordGate.tsx`; al acertarla permite entrar durante la sesión del navegador. Es una barrera informal de interfaz y no una protección de servidor.

## [x] Escena del colibrí y canción «Ponzoña»
- La diapositiva narrativa posterior al incendio termina en «Entonces comenzó a conversar con Limón…»; no añade la explicación de amor, sabiduría y consuelo.
- La conversación tiene preguntas con tres respuestas y un medidor de ánimo que parte de 0, sube con las respuestas adecuadas y baja con las respuestas hirientes. El minijuego solo termina bien al alcanzar +100 o mal al alcanzar −100; si se acaban las preguntas sin llegar a ninguno de los dos extremos, termina en un final neutro: el colibrí duda qué hacer y se queda quieto en una rama del árbol, dudando.
- En los tres finales aparece la semilla de «Ponzoña» como recompensa clicable; al recogerla se crea/desbloquea la entrada correspondiente del Libro de Semillas.
- Solo en esta pantalla, el cuadro de diálogo se renderiza debajo del lienzo para no tapar la animación; el colibrí se muestra mucho más pequeño, Limón reutiliza el `LemonSprite` habitual y la barra de ánimo conserva un tamaño legible colocada más abajo, separada de los iconos superiores.

## [ ] Arco final: nueve sentidos y enemigo Jaguar
- Orden correcto del arco: «Ponzoña» es la canción/semilla 8 y su semilla desbloquea «Nueve Sentidos»; «Nueve Sentidos» es la canción 9 y su semilla desbloquea «El Jaguar»; «El Jaguar» es la canción 10, y su final lleva de vuelta a Casa/el local. El Jaguar es el enemigo final del viaje y la décima entrada del catálogo.
- La escena del colibrí modifica la ayuda disponible en el final: con el final positivo, el colibrí ayuda mucho; con el final neutro, ayuda un poco; con el final negativo, no ayuda. Esta consecuencia debe persistir al cambiar de pantalla y al recargar la partida.
- La ayuda del colibrí debe cambiar la resolución del enfrentamiento final, no solo un texto decorativo: se reservarán variantes de dificultad, pistas o acciones disponibles para que el jugador perciba que su decisión tuvo consecuencias.
- Si Limón consigue hacerse amigo del colibrí —final positivo de la conversación—, el colibrí lo acompaña durante «Nueve Sentidos». El final neutro permitirá una presencia o ayuda limitada, y el final negativo hará que Limón continúe sin su compañía.
- La semilla de «El Jaguar» se obtiene al completar el final; las canciones/semillas 1–9 lo preceden y la semilla 9 («Nueve Sentidos») desbloquea su acceso.

## [ ] Menú del viaje e Instagram de la banda
- El reinicio se retira del Libro de semillas y pasa a un menú desplegable independiente. Su icono aparece debajo del icono del Libro, con un tratamiento más transparente; el menú contiene «reiniciar juego» con confirmación.
- Los enlaces de Instagram se dejan para la fase final de publicación; no se inventan handles ni destinos durante el desarrollo.

## [x] Acceso inicial al Libro y texto del minijuego de guitarra
- El Libro de semillas permanece oculto durante el local y el minijuego de la guitarra; se habilita después de completar el primer cruce del portal y obtener la semilla inicial de «Aurora». En partidas ya guardadas con esa semilla, el acceso se conserva.
- En el primer plano de la guitarra, la única frase narrativa visible es exactamente «hay acordes que abren otras realidades...». Se conservan las marcas visuales del mástil y controles de tocar/volver como interfaz funcional, con etiquetas accesibles no visibles.

## [x] Transición al bosque en llamas y fuego pixel art
- La semilla blanca del pez blanco sigue visible como recompensa de «El Río». La diapositiva narrativa inmediatamente anterior al bosque en llamas no muestra la semilla negra de «El fuego»: contiene solo texto y el botón de avance.
- El incendio usa una única hoja de fondos completos (`fire-forest-burning-frames.png`): fotograma 1 con mucho fuego, fotograma 2 con menos fuego, y la secuencia repite 1, 2, 1, 2 rápidamente con `steps(2)`; no existe ninguna capa de llamas superpuesta.
- Cuando comienza la lluvia, la hoja de fondos incendiados inicia una transición progresiva hacia `fire-forest-background-after.png`, con el bosque seco, silencioso y cubierto de ceniza; la lluvia está compuesta por gotas pixeladas individuales, desfasadas y animadas con pasos discretos, sin gradientes repetidos ni líneas diagonales continuas.
- Cuando la semilla negra aparece al final, es un botón clicable; al recogerla se añade «El fuego» al Libro y se abre directamente esa nueva entrada.
- Durante los 22 segundos de la escena se cuenta la historia en cinco pasos, dejando un segundo adicional entre cambios para facilitar la lectura: los animales intentan llevar agua del río al bosque sin conseguirlo; un jaguar se ríe de sus vanos intentos; se anuncia «Al tiempo, llegó la lluvia» y en ese instante comienzan las gotas; después la lluvia apaga el incendio y aparece la semilla en una zona clicable por encima del diálogo.
- Con `prefers-reduced-motion`, el relato conserva el mismo orden usando fases estáticas de incendio, lluvia y bosque apagado; no se muestra una lluvia animada.

## [x] Pantalla 1: fondo y flujo de juego
- La pantalla 1 conserva la composición del local y el portal del storyboard; la guitarra y el amplificador mantienen sus posiciones y perspectiva. El limón se dibuja como actor independiente para poder caminar.
- En la escena principal, el arte visible de la guitarra, el cable y el amplificador queda detrás del actor limón; sus hotspots transparentes se mantienen separados por encima para conservar la interacción y la accesibilidad.
- La secuencia es conectar el cable primero a la guitarra y luego al amplificador; examinar el amplificador, encenderlo y tocar la guitarra.
- Para cruzar basta un acorde de Do♯ menor de dos o más notas que incluya Do♯; cuentan las díadas. Se admiten inversiones y extensiones dentro de la tonalidad de Do♯ menor. No valen notas sueltas ni acordes fuera de la tonalidad.

## [x] Nombre de la canción inicial: Aurora
- En el Libro de Semillas, el rótulo de desbloqueo y los mensajes que nombran la canción se muestra «Aurora», no «Intro». Se conserva `intro` como identificador interno para mantener intactos el desbloqueo del portal y el progreso local ya guardado.

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
- Las notas de las cuerdas al aire se muestran sobre la posición explícita de traste 0, antes del primer traste; no deben parecer notas del traste 1.
- Se conserva la regla del portal: al menos dos notas distintas que formen clases de nota de la escala de Do♯ menor natural, incluido Do♯. Las notas sueltas, dos posiciones de la misma clase de nota y las notas/acordes fuera de la escala no abren el portal.

## [x] Sustain y legibilidad de las vistas ampliadas
- Cada nota de guitarra tiene un sustain estable y una caída suave en una muestra MP3 de aproximadamente 2 segundos.
- En el dibujo, la cuerda grave Mi queda abajo; de abajo arriba aparecen Mi–La–Re–Sol–Si–Mi, en afinación estándar.
- Los textos de las vistas ampliadas del amplificador, el cable y el mástil aumentan alrededor de dos puntos y permanecen legibles también en el breakpoint móvil.

## [x] Pantalla 2: conversación y cierre de rama
- Cada turno normal ofrece tres respuestas: reiniciar la conversación, favorecer A o favorecer B.
- Si la probabilidad de B supera el 50 %, se elige B; si A supera a B, se elige A. Si empatan, se resuelve al azar al 50 %.
- La última pregunta muestra exactamente dos respuestas: volver al principio o ejecutar el resultado acumulado. Si predomina A, la segunda respuesta es «Silbar» y solo silba el limón; si predomina B, es «Escuchar a los pájaros silbar» y silba la bandada, no el limón.
- Elegir la salida de la rama inicia directamente el amanecer; no aparece una tercera respuesta ni se reabre el conjunto normal de tres opciones.

## [x] Escena 02: reproducir primero el desenlace visual
- Al elegir «Silbar» o «Escuchar a los pájaros silbar», el cuadro de texto se oculta mientras se reproduce, sin obstrucción, la animación correspondiente del silbido del limón o del vuelo de la bandada.
- El cuadro con el resultado vuelve a aparecer solo cuando termina la animación. Si el jugador prefiere reducir el movimiento, el juego no añade una espera artificial antes de mostrar el resultado.

## [x] Página a pantalla completa: solo el juego
- Todo el contenido visible de la página es la pantalla del juego, adaptada al viewport sin deformar el lienzo ni obligar a desplazarse por la página.
- Se quitan de la vista la marca y cabecera del sitio, el título/intro, las pestañas para elegir pantalla, los encabezados de documentación, el storyboard y el pie de página. Se conservan dentro del lienzo los controles y cuadros que forman parte del juego.

## [x] Avance del sendero entre pantallas
- Cuando se desbloquea el portal de la Intro, aparece abajo a la derecha un botón pixel art con el texto «atravesar la ventana»; solo permite entrar en «Ventana al sendero» después de resolver el acorde y abrir el portal.
- Tras recoger la semilla de «Ventana al sendero», aparece abajo a la derecha un botón pixel art con el texto «continuar el sendero» que abre «Raíces»; tras recoger la semilla de «Raíces», el mismo botón abre la reunión nocturna de «Rambla».
- El botón permanece dentro del lienzo, no se muestra mientras el destino siga bloqueado ni cuando está abierto el Libro de semillas, y no se superpone con los cuadros de diálogo.

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
- El fondo se basa en el cuadro 03 del storyboard v02: ruinas invadidas por la vegetación, camino y arco de piedra entre dos columnas. El limón se mueve únicamente sobre el camino de piedra; los clics en hierba no lo desplazan.
- Los fondos de las pantallas posteriores se basarán en los cuadros correspondientes del storyboard v02, sin sustituir esta dirección visual por fondos genéricos.
- El limón se acerca a las dos columnas de una en una. Al llegar a una columna aparece «Examinar» y se abre una vista extra de primer plano que ocupa el mismo lienzo de juego; no aparece debajo de la escena de las ruinas.
- Cada minijuego de columna llena ese mismo marco de proporción 1180:1333; la escena de las ruinas queda oculta, pero sigue montada para conservar la posición del limón al volver.
- En cada primer plano, el jugador arrastra las hojas que cubren la piedra para apartarlas. Al despejar la columna izquierda aparece exactamente «as above»; al despejar la derecha, exactamente «so below».
- Cada columna tiene exactamente cuatro hojas, algo mayores que las actuales. El plano principal muestra las columnas más cerca y el primer plano presenta una inscripción de aspecto más detallado, conservando exactamente «as above» y «so below».
- Tras descubrir ambas inscripciones, una planta crece hasta florecer y entrega la tercera semilla, que desbloquea la tercera canción «Raíces».

## [x] Primer plano agrietado e inscripciones integradas en Raíces
- Al apartar las hojas, cada columna se muestra en un primer plano mucho más cercano: la piedra llena el encuadre y sus grietas se distinguen claramente.
- «as above» y «so below» forman parte de la ilustración tallada en la piedra; no se presentan como texto o rótulo superpuesto a la escena.
- Las semillas físicas se muestran sin recuadro ni fondo sólido, con transparencia y, como máximo, un resplandor pequeño del color propio de cada semilla.

## [x] Inscripciones al mismo pixel art de las columnas
- Rediseñar el pixel art de la piedra con más definición y textura de grietas; ajustar su cuadrícula al mismo tamaño de píxel que «as above» y «so below», conservando esas palabras exactas talladas e integradas y manteniendo legible el relieve.

## [x] Pantalla 4: encuentro nocturno y hoguera
- El fondo se basa en el panel oficial 04: cielo estrellado con luna creciente, valle rocoso y figuras reunidas alrededor de un símbolo central, en el mismo pixel art deliberado del juego y la proporción estrecha del mundo de la escena 03. El limón no queda pintado en el fondo: es un actor separado que el jugador puede mover.
- La pantalla 04 solo se desbloquea después de recoger la semilla de «Raíces». El jugador recoge tres palitos y los lleva al centro de la reunión; la hoguera no se puede encender hasta que todos estén allí.
- Al encenderla comienza una animación legible del fuego que respeta `prefers-reduced-motion`. Cuando termina, aparece una semilla como control clicable y accesible; la cuarta canción «Rambla» no se añade al Libro de Semillas hasta que el jugador pulsa esa semilla.
- Las semillas descubiertas, incluida «Rambla», permanecen en el Libro de Semillas al cambiar de escena y después de recargar el juego, mediante persistencia local del navegador.

## [x] Conversación ramificada y tirada de habilidad de Rambla
- Antes de recoger palitos, el limón conversa con tres encapuchados. Cada turno tiene tres respuestas y cada una suma un punto al camino «pacifico» o al «drastico»:
  1. El líder pregunta «¿Qué es la alegría, qué es la risa, cuando las llamas siempre están ardiendo? Envueltos en la oscuridad, ¿no buscarían una luz?»; respuestas: «La luz no se busca solo con los ojos, sino con el calor que compartimos» (pacifico), «Yo solo soy una fruta intentando no asarme aquí. ¿Podemos ir al grano?» (drastico) o guardar silencio y rodar hacia atrás para huir (drastico).
  2. El segundo pregunta «Tu piel refleja el brillo de la hoguera, pero dime, pequeño cítrico: ¿es tu interior dulce néctar o amarga defensa contra las sombras?»; respuestas: «Tengo amargura por fuera para proteger lo dulce de adentro, como la vida misma» (pacifico), «Tengo tanto ácido que si me tocas, te arderán los dedos» (drastico) o «Pregúntale al fuego lo que quiera saber» (drastico).
  3. El tercero pregunta «Si el árbol que te dio la vida supiera el destino que te aguarda en este círculo, ¿te habría dejado caer al suelo o te habría retenido en sus ramas?»; respuestas: «Todo fruto cae cuando está listo para cumplir su propósito, incluso si ese propósito es este misterio» (pacifico), «Me habría guardado en una canasta lejos de ustedes y de este fuego absurdo» (drastico) o dar un pequeño bote y exhalar vapor cítrico sin responder (drastico).
- Cada respuesta da exactamente un punto a su camino. Tras tres turnos, dos o más puntos pacificos producen el final 1 «El Camino de la Iluminación»; dos o más drásticos producen el final 2 «El Sacrificio Cítrico».
- En el final 1, el líder acepta al limón como oráculo peregrino y habilita la recogida y colocación de los tres palitos. Solo entonces se puede encender la hoguera y, cuando termina la animación, recoger con un clic la semilla turquesa de Rambla.
- En el final 2, los encapuchados gritan «¡Alimenta la hoguera!» y comienza una prueba urgente de reflejos para rodar cuesta abajo: el jugador pulsa cuando el indicador entra en la franja segura. Hay tres intentos por tanda; después puede reiniciar la prueba. Con movimiento reducido se ofrece un control manual en lugar del indicador animado.
- Superar la prueba permite escapar y revela una semilla turquesa clicable en el sendero como ruta alternativa para completar Rambla; sin superarla no se desbloquea ni se recoge esa semilla.
- Después de recoger la semilla turquesa, se oculta el recuadro de estado de Rambla; la recogida y la persistencia en el Libro se mantienen.

## [x] Pausa narrativa antes de la tirada del final 2
- Tras el final 2 aparece lentamente un cuadro de texto que advierte que la secta va a atacar al protagonista y que debe rodar cuesta abajo para escapar.
- La prueba de reflejos no comienza mientras aparece el aviso; después de leerlo, el jugador inicia la tirada con una acción deliberada para preservar el ritmo de la escena.

## [x] Activación de la conversación al llegar al círculo
- Al entrar en Rambla no aparece la conversación. Primero el jugador mueve al limón; el diálogo con los encapuchados se activa solo cuando el limón ha caminado hasta el círculo de la hoguera y termina su movimiento allí.
- Antes de llegar no se muestra ningún texto que revele que el círculo es el objetivo. El jugador descubre el lugar explorando; mientras tanto siguen disponibles los controles de movimiento. Durante la conversación, el limón permanece en el círculo.

## [x] Tres palitos y gestos automáticos en Rambla
- La rama pacífica ofrece exactamente tres palitos marrones, más pequeños en pantalla. Al pulsar un palito, el limón camina hasta él y lo recoge sin una segunda pulsación.
- Con un palito cargado, basta pulsar el centro de la hoguera: el limón recorre la senda y lo deposita allí automáticamente. Los callbacks conservan las comprobaciones de proximidad y movimiento para evitar recogidas o depósitos remotos.
- Cuando las tres ramas están colocadas, pulsar la hoguera inicia una animación final más fluida, con tres leños pequeños y una llama pixelada más detallada.
- El texto de apoyo evita instrucciones literales como «acerca el palito al centro» y usa mensajes poéticos e indirectos.

## [x] Recoger cada semilla con un clic y distinguir sus colores
- La semilla de «Ventana al sendero», la de «Raíces» y la de «Rambla» se recogen pulsando directamente sobre cada semilla; los cuadros de texto pueden indicar la acción, pero no sustituyen el clic en el objeto.
- Cada semilla física tiene un color propio y consistente en su escena y en el Libro de Semillas; el color no es la única señal de disponibilidad ni el único modo de distinguirla. «Aurora» (identificador interno `intro`) continúa desbloqueándose con el portal y no se presenta como una semilla física.

## [x] Repetir minijuegos desde el Libro de Semillas
- Al pulsar el icono de una canción/semilla desbloqueada, el Libro se cierra y el juego abre la pantalla que contiene su minijuego para poder jugarlo de nuevo.
- La repetición reinicia el estado de esa pantalla, pero conserva las semillas ya descubiertas en el Libro y no revoca el acceso a las demás escenas.

## [x] Guitarra y amplificador visibles como en el storyboard
- El recorte de la Stratocaster conserva completa la punta izquierda del cuerpo, sin que quede amputada ni pegada al borde del sprite.
- En la escena principal el amplificador se ve más claro y legible, siguiendo los valores y detalles visibles en el storyboard original.

## [x] Cable conectado persistente en la escena 1
- Al terminar el minijuego del cable y volver al local, el cable queda visible recorriendo el suelo y conectando físicamente la guitarra con el amplificador; no vuelve a parecer un cable suelto.

## [x] Dos opciones en la pregunta final de Ventana al sendero
- Los turnos normales mantienen sus tres respuestas. La última pregunta muestra exactamente dos opciones: «Volver al principio de la conversación» o ejecutar el resultado acumulado hasta entonces.
- La segunda opción es «Silbar» si las respuestas anteriores llevan a A, o «Escuchar a los pájaros silbar» si llevan a B; ejecuta directamente ese desenlace y no muestra opciones A/B ni una tercera acción.

## [x] Camino transitable e inscripciones integradas en Raíces
- El limón solo puede caminar sobre el camino de piedra visible y puede alcanzar ambas columnas desde el camino; los clics en hierba u otras zonas se ignoran.
- Las hojas apartables cubren inscripciones que están pintadas/grabadas en la piedra del arte pixelado de cada columna. Al retirar las hojas aparecen exactamente «como es arriba» en la izquierda y «así es abajo» en la derecha, sin un rótulo flotante separado.

## [x] Navegador local para pruebas de escenas
- Solo en modo de desarrollo aparece un selector de las escenas ya implementadas y el botón «Saltar a escena», que permite entrar sin cumplir requisitos de desbloqueo; no añade ni borra semillas y no modifica el progreso persistente. La vista previa del colibrí puede seguir la partida o forzar temporalmente amigo/sin amistad en Nueve Sentidos, sin guardar ese resultado. El panel no se incluye en la versión de producción.

## [x] Acceso por teclado para apartar hojas en Raíces
- El arrastre con ratón o tacto se conserva. Cada hoja también se puede enfocar y apartar individualmente con Intro o Espacio; tras cada acción el foco avanza a la siguiente hoja y, al apartar la última, se revela la inscripción una sola vez. Con movimiento reducido se retira sin espera ni animación, y una indicación visible y accesible explica el control.

## [x] Libro de semillas desplegable dentro de la ventana de juego
- Tanto el botón que abre el libro como el panel desplegable están dentro del marco 1180:1333 del juego. El panel se abre sobre la escena, queda contenido por la ventana jugable y se cierra desde ahí; no aparece fijado al viewport ni sobre el encabezado exterior.

## [x] Luz psicodélica lenta y atmosférica
- Las escenas jugables actuales —local, amanecer y ruinas— y el primer plano de Raíces reciben luces psicodélicas suaves, lentas y distintas: 38 s para el local, 46 s para el amanecer, 54 s para las ruinas y 58 s para el closeup de columnas.
- El filtro permanece dentro del lienzo del juego, no intercepta interacciones ni reduce la legibilidad de los cuadros y objetos importantes, y respeta `prefers-reduced-motion`.

## [x] Descubrir las inscripciones sin pistas escritas
- Ningún diálogo o rótulo visible en Raíces dice que una columna esconde una inscripción ni anticipa sus palabras. El limón solo dice que la columna está cubierta de hojas; el jugador descubre el texto al apartarlas.
- Las palabras permanecen ocultas bajo las hojas y solo quedan visibles en la piedra cuando el jugador las arrastra fuera.

## [x] Arte original del Libro de Semillas
- La misma ilustración original de pixel art de un libro de semillas encantado aparece en el encabezado del panel y como icono visible del botón que abre el libro. El recurso conserva el estilo de las escenas existentes, tiene fondo transparente, se incluye en `client/public/seedbook-art.png`, se carga desde el propio juego y conserva legibilidad en escritorio y móvil.

## [x] Acceso al Libro de semillas: icono grande sin texto visible
- El control aparece en la esquina superior izquierda, dentro de la pantalla jugable, y muestra solo la ilustración pixel-art del libro y el contador numérico de progreso; no aparece en la franja exterior ni muestra las palabras «Libro de semillas» hasta que el panel se abre.
- En ninguna escena ni tamaño de pantalla el icono del libro tapa texto, opciones o controles de un cuadro. Todas las cajas y controles permanecen dentro del área visible del lienzo, con separación visible del icono; no se desplaza ningún cuadro fuera del marco para resolver el solapamiento.
- El icono mide al menos 58 × 58 px y el botón ofrece una zona táctil mínima de 64 × 64 px en escritorio y móvil. Conserva contraste, foco de teclado claro y un nombre accesible con el estado/progreso, además de `aria-expanded`, `aria-haspopup` y `aria-controls`.

## [x] Reiniciar partida desde el Libro de Semillas
- Dentro del panel hay un botón «Reiniciar juego». Al pulsarlo se pide confirmación; confirmar borra las semillas guardadas en este navegador, cierra todos los acertijos y vuelve al inicio con el portal cerrado. Cancelar conserva el progreso y la escena actual.

## [x] Amanecer, flor y semilla
- Ambas acciones terminales inician el mismo amanecer: el cielo se ilumina gradualmente y el sol sale.
- La flor se abre en pixel art después de comenzar el amanecer y entrega una semilla que cae desde su centro. Cuando termina la caída, la semilla se puede pulsar para recogerla; no se recoge desde el cuadro de texto.

## [x] Llegada, movimiento y presentación
- Al cruzar el portal, el limón salta hacia él; en la escena 2 sale del portal, salta y cae en el suelo. El portal gira en ambas dimensiones y aparece delante de la salida del sol.
- Durante el cruce y la llegada se bloquean las pestañas, el movimiento del limón y los cuadros de interacción.
- Las pantallas jugables 1, 2 y 3, y sus vistas extra de minijuego, comparten el mismo lienzo responsive con proporción 1180:1333; en desktop cada una mide 760 × 859 px. El local se centra con bandas negras, sin deformar el arte.
- En ambas escenas, el limón sigue el clic solo por el suelo transitable; se ignoran las bandas negras, paredes y cielo. Cada desplazamiento dura 3,8 s y las dos patas se animan mientras camina.
- Los cuadros de diálogo y de acción comparten marco pixel art, pueden variar en ubicación y tamaño según la escena para no tapar elementos importantes, y avanzan con «Siguiente» antes de presentar respuestas.
- Los cuadros aparecen mediante un fundido suave de 1,45 s. La llegada, caminata y amanecer respetan `prefers-reduced-motion`.

## [ ] Libro de semillas y canciones · recursos finales aplazados
- Un panel desplegable «Libro de semillas» permanece accesible durante la partida y añade cada semilla al descubrirla. Muestra el título y metadatos independientes de las semillas encontradas.
- Cada entrada ofrece únicamente dos acciones separadas: abrir el enlace del vídeo de YouTube y descargar la canción completa; no existe espacio ni reproductor para MP3 dentro del Libro.
- La colección incluye las diez canciones en el orden facilitado por el grupo y solo muestra como descubiertas las semillas que el jugador ya haya encontrado.
- Los enlaces oficiales de YouTube y las descargas WAV se añadirán únicamente en la fase final, cuando el grupo entregue los destinos definitivos; no se inventan canciones, enlaces ni archivos durante el desarrollo.

## [x] Notas y efectos de sonido en MP3
- Las notas seleccionadas en el mástil, de E2 a C#5 dentro de los nueve primeros trastes, y los dos silbidos del limón y los pájaros se reproducen desde archivos MP3; el juego no sintetiza estas notas mediante osciladores Web Audio.
- Cada nota conserva aproximadamente dos segundos de sustain y las muestras de acordes pueden reproducirse simultáneamente.

## [x] Validación de la versión actual
- `pnpm check`, `pnpm build:static` y `git diff --check` pasan; la build incluye el manifiesto de rutas, los fondos PNG, los sprites v2 de guitarra/amplificador, las columnas inscritas y los 36 MP3 de juego.
- En esta tanda también pasan `pnpm test` (2 archivos, 6 pruebas). Preview confirma cuatro hojas iniciales por columna, grabados ocultos antes de retirarlas, notas abiertas alineadas con traste 0, separación del Libro respecto a los cuadros y movimiento del limón en Rambla con clic y flechas. La build incluye el fondo de escena 04 sin limón estático y los primeros planos revisados.
- Se incluyen 34 muestras MP3 de guitarra entre E2 y C#5 y dos silbidos MP3; `ffprobe` confirma codec MP3 y una duración aproximada de 2 s para las notas. No quedan `AudioContext` ni osciladores en el código del juego.
- El sprite `guitar-sprite-recut-v2.png` mide 839 × 1874 px; su alfa deja 25 px libres a la izquierda y no toca ninguno de los cuatro bordes. El asset está incluido en `dist/public`.
- La ruta del banco de guitarra apunta a `/audio/guitar/`; el panel del libro recibe el foco al abrirse, atrapa Tab/Mayús+Tab, cierra con Escape y devuelve el foco al control que lo abrió.
- En Preview se usaron eventos de puntero `pointerdown`/`pointermove`/`pointerup` para conectar la punta A a la guitarra y después la punta B al amplificador; la conexión completa habilita la siguiente etapa.
- Con clics de navegador se verificó que al inicio la guitarra está activa y abre el pensamiento «La guitarra no está enchufada. Tengo que conectar el cable antes de tocar», sin mover al limón; el ampli permanece deshabilitado.
- Tras conectar primero la punta A a la guitarra y luego la B al ampli, ambos destinos quedan conectados y el hotspot del ampli se habilita.
- Se abrió el primer plano del amplificador y se verificaron su tamaño, textura de tólex/rejilla, mandos y control ON/OFF. Tras pulsar ON/OFF, el LED rojo se iluminó y el primer plano siguió abierto; «Siguiente» cerró ese primer plano.
- La escena principal empieza sin pistas ni rótulos; el diálogo solo aparece al interactuar. La ventana del cable muestra solo cable/conectores y «Volver al local». El ampli conserva únicamente controles funcionales, sin título ni indicaciones.
- Se abrió el mástil y se verificaron E–A–D–G–B–E, seis clavijas y los nueve trastes. Una nota sola y dos notas sin Do♯ no abrieron el portal; una díada Do♯–Mi en cuerdas distintas sí lo abrió.
- En el código actual los turnos normales conservan tres respuestas y la pregunta final muestra exactamente dos: «Volver al principio de la conversación» o la acción correspondiente a la rama acumulada (Silbar para A; Escuchar a los pájaros silbar para B), ejecutada directamente.
- Al recoger «Ventana al sendero», «Siguiente: Raíces» abre la tercera escena; no aparece un botón de retorno al local. La navegación de progreso tampoco habilita volver a pantallas anteriores.
- En las ruinas se caminaron las zonas del sendero, se examinó cada columna por separado y se arrastraron sus hojas: izquierda «as above», derecha «so below». Al despejar ambas, creció la flor, cayó la tercera semilla y se desbloqueó «Raíces».
- Las dos rutas del amanecer, la flor, la semilla y el salto del limón siguen verificadas de la iteración anterior; se capturaron vistas responsive de escritorio y móvil para comprobar la separación de los sprites.
