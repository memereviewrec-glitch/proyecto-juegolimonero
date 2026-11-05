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
- Durante los 22 segundos de la escena se cuenta la historia en cinco pasos, dejando un segundo adicional entre cambios para facilitar la lectura: los animales intentan llevar agua del río al bosque sin conseguirlo; un jaguar que pasaba por allí se ríe; se anuncia «Al tiempo, llegó la lluvia» y en ese instante comienzan las gotas; después la lluvia apaga el incendio y aparece la semilla en una zona clicable por encima del diálogo.
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
- Cuando las tres ramas están colocadas, pulsar la hoguera hace que el limón se aparte hacia un lado del sendero; al llegar, comienza la animación final con tres leños pequeños y una llama pixelada más detallada. La semilla turquesa de Rambla aparece debajo del fuego, más abajo en el lienzo y sin salirse de la pantalla de juego.
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


## [x] Ajustes narrativos del Río, el incendio y la transición hacia El Jaguar
- En la diapositiva del Río, los Espíritus recomiendan recoger «las 10 semillas mágicas» para volver a casa; se conserva la continuación que señala el fondo del cauce y prepara la búsqueda de la siguiente semilla.
- En la escena del incendio, la frase describe «Un jaguar que pasaba por allí se reía» y no dice que se reía de los animales por sus vanos intentos de apagarlo.
- Tras recoger la semilla de Ponzoña en cualquiera de los tres finales del colibrí, aparece una diapositiva con el glifo clicable de esa semilla. Si el colibrí es amigo, dice «Después de la conversación, el colibrí y el limón se sentaron a observar las estrellas»; en los finales neutral o malo, dice «Después de la conversación, el limón se sentó a solas a mirar el cielo nocturno». El glifo abre la entrada descubierta de Ponzoña en el Libro; luego el camino continúa a Nueve Sentidos.
- Al completar Nueve Sentidos, la diapositiva narrativa conserva la recomendación de visitar al Jaguar e incluye al colibrí solo si el limón se hizo su amigo. Después se muestra la diapositiva de cueva con el glifo clicable de la semilla física «Nueve Sentidos»; continuar desde ella lleva directamente a la escena 11 del Jaguar, evitando volver a Nueve Sentidos y dejar la progresión bloqueada. La recomendación no aparece en el diálogo jugable de la Luna.
- La escena Jaguar permanece bloqueada en la navegación hasta recoger «Nueve sentidos», y solo ofrece continuar hacia el hogar al llegar a un final exitoso. Los previews de desarrollo no alteran esta progresión normal. La elección del reto del río se guarda para mantener su bonificación inicial a Jaguar después de recargar o repetir escenas y se elimina al reiniciar toda la partida.
- La respuesta elegida en la primera conversación de los Espíritus del Río, después de lanzar la piedra, también influye en las estadísticas iniciales de Jaguar y se persiste. En la ruta pacífica, las respuestas 1/2/3 añaden respectivamente Cautela +4, Valentía +4 y Cautela +3; en la ruta drástica, añaden Valentía +5, Cautela +5, y Cautela +2/Valentía +3. Solo afectan Cautela o Valentía —no Ingenio— y se acumulan con la elección separada del reto posterior del río.
- Validación tras integrar las nuevas diapositivas y las bonificaciones del Río: `pnpm check`, `pnpm test` (56 pruebas), `pnpm build:static` y `git diff --cached --check` pasan. Las pruebas verifican que la respuesta inicial se guarda, se valida, modifica Cautela/Valentía y se borra al reiniciar el progreso.


## [x] Quitar la recomendación del diálogo jugable de Nueve Sentidos
- La pantalla de la Luna conserva las dos frases existentes («Yo soy la roca que se mueve en el vacío.» y «Ahora conocerás a las fuerzas ocultas que dibujan nuestras órbitas») y no muestra un cuadro adicional que recomiende ir a hablar con el Jaguar.
- No se modifica ninguna diapositiva narrativa, incluida la de la cueva posterior a Nueve Sentidos, ni las pistas poéticas del colibrí.

## [x] Añadir la tercera línea del diálogo de la Luna
- Después de sus dos frases actuales y antes de recoger la semilla, la Luna muestra un cuadro de diálogo adicional con el texto «Toma esta semilla, te ayudará en tu viaje.»
- Los tres cuadros se presentan uno a uno; la interacción con la Luna queda bloqueada hasta cerrar el tercero.

## [x] Añadir una quinta estrella a la secuencia rítmica
- La fase de ritmo tiene cinco estrellas pulsables y se completa tocándolas de la más lenta a la más rápida.
- La nueva estrella blanca parpadea con el pulso de una blanca con puntillo: 3 segundos por ciclo a 60 BPM.
- `nueveSentidosRules.test.ts` comprueba cinco pulsos distintos, el orden ascendente y que cada ciclo de patrón conserva la estrella blanca a 3000 ms.

## [x] Recoger la semilla lunar pulsando la semilla
- Después de cerrar los tres diálogos, el jugador recoge la semilla pulsándola cuando ha caído; la Luna no debe ser el objetivo clicable para continuar.
- La caída comienza al cerrar el tercer diálogo; la semilla queda como botón táctil y accesible al aterrizar, y solo su pulsación registra la semilla y habilita la continuación.

## [x] Restaurar el avance desde la Luna hacia la diapositiva de la cueva
- Al tocar la Luna, recoger la semilla de «Nueve Sentidos» y completar su diálogo, el Libro debe actualizarse sin abrirse automáticamente encima de la pantalla jugable.
- Con la semilla recogida y el epílogo listo debe aparecer el botón «continuar sendero»; al pulsarlo se muestra la diapositiva narrativa de la cueva y desde ella se continúa a Jaguar.
- `collectNueveSentidosSeed` registra la semilla y cierra cualquier overlay del Libro; `canContinue` vuelve a habilitarse y `continueAlongPath` abre `nueve-sentidos-cave`, cuya continuación lleva a Jaguar.

## [x] HUD global de estadísticas y alcanzabilidad de los finales del Jaguar
- Mostrar las cuatro barras de estadísticas en todas las pantallas jugables, pero no en ninguna diapositiva narrativa; deben reflejar las estadísticas vigentes y sincronizarse con los cambios realizados en Jaguar.
- Analizar los cuatro finales de Jaguar (Empatía, Enigmas, Valentía y Pesadilla), comprobar con las reglas e historiales posibles que cada uno es alcanzable, describir sus requisitos y dificultad, y ajustar mecánicas solo si algún final resultara imposible.
- Las pruebas de `client/src/components/jaguarRules.test.ts` recorren Enigmas con un historial válido y Cautela ≥70, y Empatía/Valentía con Cautela <70. Sin bonificaciones previas, Cautela parte de 35 y no alcanza 70 ni tomando las tres respuestas más cautelosas.

## [x] Separar el botón de avance del HUD de estadísticas
- En las pantallas jugables que muestran el botón «continuar sendero», mantener visibles las barras y colocar el botón un poco más abajo, sin superponerlas, también en pantallas móviles.

## [x] Hacer deterministas las pruebas de habilidad de El Jaguar
- Cautela, Empatía, Ingenio y Valentía comparan los puntos con el umbral determinista 70; no hay d100 ni tiradas forzadas.
- La última respuesta de Valentía conserva su efecto de +15 (tras el escalado, +11); una ruta válida de la rama furiosa sigue permitiendo superar Valentía 70.
- La probabilidad de una prueba determinista es 100% al alcanzar el umbral y 0% al quedar por debajo; la probabilidad de cada final depende de las elecciones previas, el historial y la estrategia del jugador, no del azar.

## [x] Ayuda opcional del colibrí en El Jaguar
- Si el colibrí es amigo, antes de cada comprobación de atributo puede revelar qué atributo se pone a prueba y qué umbral hay que alcanzar.
- Durante las preguntas puede dar una pista sobre el tipo de respuestas que fortalece el atributo útil, sin señalar una respuesta/opción concreta.
- El colibrí solo revela la pista al pulsar su GIF en la escena; las pistas son enigmáticas, opcionales y el colibrí no aparece ni ayuda si no se hizo amigo.

## [x] Referir la semilla de El Río en la diapositiva posterior
- Tras completar la escena jugable «El Río», la diapositiva que abre camino al incendio menciona que Limón ya guarda en el Libro la semilla de «El Río» e incluye su glifo clicable.
- La historia de `fire-forest` contiene esa mención y `STORY_SEEDS` asocia el glifo clicable con la entrada «El Río»; `pnpm check`, `pnpm test` (58) y `pnpm build:static` pasan.

## [x] Intercambiar las ramas después de Cautela en Jaguar
- Cautela exitosa debe conducir a la rama burlona/de Ingenio; Cautela fallida, a la rama furiosa/de Empatía o Valentía. Actualizar también el relato y los controles de prueba, manteniendo los cortes deterministas de main.
- Ingenio baja a 70, según la decisión del usuario. Con la rama burlona tras superar Cautela, una ruta de historial válido llega a Cautela 70 e Ingenio 80; Empatía y Valentía también se alcanzan en la rama furiosa con Cautela bajo 70. Cautela todavía requiere bonificaciones previas para alcanzarse desde el perfil base.
- `jaguarRules.test.ts` verifica el destino de ambos resultados de Cautela, las rutas de Empatía, Enigmas y Valentía, y los desenlaces Victoria/Pesadilla del combate; toda la suite pasa con 59 pruebas.

## [x] Ajustes de diapositivas narrativas tras el colibrí y de avance de El Río
- Tras finalizar la conversación jugable del colibrí, la semilla de Ponzoña se entrega en la diapositiva narrativa siguiente; no se modifica el contenido ni la mecánica de esa conversación.
- Hay tres diapositivas según el desenlace: en el final malo, el colibrí deja la semilla en la escena y se marcha volando; en el final neutral/de duda, explica que el miedo lo paraliza y no puede acompañar a Limón, pero le entrega la semilla para ayudarlo; en el final amistoso, entrega voluntariamente la semilla y acompaña a Limón.
- En todas las diapositivas narrativas salvo la primera, el botón dice «continuar sendero»; la primera conserva «comenzar el sendero».
- En El Río, el botón global «continuar sendero» no aparece hasta que el pez negro haya respondido al pez blanco. No se cambian los textos ni la conversación de la escena jugable.

## [x] Exigir una nueva superación para avanzar tras cada repetición
- Las banderas que habilitan «continuar sendero» representan el intento actual, no el hecho de que la semilla ya esté guardada en el Libro; al recargar o volver a una escena se reinicia su mecánica y el botón permanece oculto hasta completarla de nuevo.
- El reinicio se aplica al entrar desde el Libro de Semillas, la navegación de escenas, las diapositivas narrativas y el selector de desarrollo. Las semillas guardadas siguen desbloqueando escenas y conservan su entrada en el Libro.
- Los botones de selección y su acción comparten una regla de desbloqueo persistido; completar el intento sigue siendo una condición distinta del acceso a la escena.
- Los temporizadores y las acciones diferidas de sala, Amanecer, Colibrí y Jaguar se cancelan o invalidan al reiniciar/desmontar el intento; no pueden entregar recompensas ni abrir interludios en otro intento.
- Repetir Rambla reinicia su conversación y su mecánica, pero conserva el último desenlace histórico para el HUD, la ruta del Río y las estadísticas iniciales de Jaguar hasta que una nueva resolución lo sustituya.
- Al pulsar «Volver a casa» tras Jaguar, la sala reinicia su mecánica sin borrar semillas ni historial: su botón de avance no aparece hasta superarla de nuevo. Decisión explícita del usuario del 2 de noviembre de 2026.
- Cobertura añadida: 13 pruebas de acceso a escenas y 6 de aislamiento de tareas diferidas. La suite combinada pasa con 78 pruebas.

## [x] Recompensas de atributos en la escena del silbido
- En «Ventana al sendero», silbar da exactamente +7 Valentía y observar/escuchar a los pájaros da exactamente +7 Cautela; no modifica los otros atributos.
- El desenlace se aplica al ejecutar la acción final, se refleja en el HUD y se conserva al avanzar, recargar y reiniciar el encuentro del Jaguar.
- Repetir la escena conserva la decisión previa hasta completar una nueva acción final, que la sustituye sin acumular recompensas; reiniciar el juego borra también esta decisión y no se alteran las semillas guardadas al repetir.

## [x] Acceso al Libro y al menú fuera del lienzo
- Sacar el icono del Libro de semillas y el icono del menú de la pantalla de juego; colocarlos en una fila superior a la barra de estadísticas.

## [x] Diálogos y transición del incendio
- Cada caja de diálogo del incendio tiene un botón visible «Continuar».
- El incendio permanece visible a lo largo de la narración; no empieza a llover ni cambia al fondo posterior hasta que el relato llega a la lluvia enviada por el cielo.

## [x] Progresión anticipada de entradas bloqueadas del Libro
- Al empezar una pantalla que contiene una semilla, el Libro muestra ya la entrada de esa canción aunque el jugador no haya terminado la pantalla, marcada como bloqueada/no recogida.
- Cuando se recoge una semilla, la entrada de la canción siguiente aparece también en el Libro, pero marcada como bloqueada. Las canciones futuras no se marcan como recogidas antes de obtener su semilla.

## [x] Diálogo móvil del colibrí y recompensa de una semilla
- Los diálogos del colibrí permiten desplazamiento vertical y en móvil se puede llegar a leer y accionar la parte inferior.
- Al final, el texto solo dice que el colibrí dio una semilla; no la llama «semilla de Ponzoña» ni revela su nombre de canción.

## [x] Nueve estrellas y recompensa de Ingenio
- Antes del minijuego rítmico del cielo estrellado se ven nueve estrellas blancas, no siete; la pista del colibrí dice «nueve».
- La semilla no produce ningún sonido al caer desde la luna y recogerla suma exactamente +4 de Ingenio.

## [x] Textos de las pruebas del Jaguar
- Si se falla la prueba de Cautela, el mensaje dice exactamente: «El limón dio media vuelta pero mientras salía de la cueva, pisó una rama, con tal mala fortuna que el jaguar percibió el miedo de Limón tras escuchar el crujido de la madera, y salió furioso de su escondite».
- La rama del Jaguar burlón que aparece con Cautela mejorada muestra exactamente: «El limón, antes de avanzar un paso más, preguntó \"hay alguien ahí\"?».
- En la pregunta de la prueba de Valentía no se menciona «el umbral»; se pregunta «¿alcanzará la valentía de Limón para mantenerse firme ante el miedo?».
- En la pregunta de la prueba de Empatía no se menciona «el umbral»; la pregunta es exactamente «¿Conseguirá el limón que el jaguar confíe en él?».
- Evidencia: los mensajes solicitados están en `JaguarScene.tsx` y los cálculos de Cautela, Empatía y Valentía permanecen intactos. `pnpm check`, `pnpm test` (86 pruebas), `pnpm build:static` y `git diff --check` pasan.

## [x] Encuadre del Jaguar burlón
- El Jaguar burlón se hace más pequeño y se centra para que quede completamente dentro de la pantalla.

## [x] Caja final y libro de la pesadilla
- La primera frase de la última caja dice exactamente «Los sueños son semillas que plantamos en el mundo.»; se elimina de esa caja la frase desde «La semilla que buscabas» hasta «que te generó». Después conserva el mensaje de que la última semilla está a salvo en el libro y Limón vuelve tranquilo a dormir.
- La animación/carga del libro se muestra por encima de la última caja de diálogo.
- Evidencia previa: al recoger la semilla final, el callback abre el Libro con «El jaguar» enfocado; su capa (`z-index: 300`) queda sobre el cuadro.

## [x] Botonera lateral exclusiva para ordenador
- En ordenador, los iconos del Libro de semillas y del menú se muestran en un lateral fuera del lienzo, no en la fila superior, para que la pantalla de juego conserve toda su altura visible.
- En móvil, los dos iconos se mantienen en su fila superior actual y no se trasladan al lateral.
- A partir de 1.000 px, la botonera se ancla al lateral derecho del lienzo sin ocupar altura; en anchos menores conserva la fila superior. `pnpm check`, `pnpm test` (86 pruebas), `pnpm build:static` y `git diff --check` pasan.

## [x] Texto del minijuego de guitarra
- Al tocar la guitarra, el enunciado dice «hay acordes que abren ventanas...» y no pregunta sobre la belleza de las notas musicales.
- Evidencia: `Home.tsx` muestra ese enunciado en la acción de tocar; TypeScript, 86 pruebas y el build estático pasan.

## [x] Pista narrativa de entrada a Rambla
- Al principio de Rambla, los encapuchados piden a Limón que se acerque al círculo, como pista diegética para que se entienda que hay que clicar dentro del círculo de encapuchados.
- Evidencia: el rótulo de estado `role="status"` anuncia «Los encapuchados te llaman desde el círculo» y «Limón, acércate al círculo» antes de que llegue al centro. `pnpm check`, `pnpm test` (86 pruebas), `pnpm build:static` y `git diff --check` pasan.

## [x] Actualización de bonificaciones del Río y del Jaguar
- En Espíritus del río, la tercera respuesta de la ruta pacífica («Ellos me dieron una semilla…») suma Ingenio +4; la tercera respuesta de la ruta drástica («Si el mundo fluye…») suma Empatía +5.
- En la primera pregunta interior del Jaguar: «Respiro despacio…» suma Cautela +7 e Ingenio +3; «Observo las hojas…» suma Ingenio +7 y Cautela +3; «Pienso en el colibrí…» suma Empatía +7 y Valentía +2; «Sigo adelante…» suma Valentía +7 y Empatía +2.
- En la segunda pregunta interior del Jaguar, «El fuego y el agua dejan señales distintas» suma Ingenio +7 y Cautela +7.
- En la tercera pregunta interior: «Quiero descubrir qué oculta» suma Ingenio +7 y Empatía +4; «Me pregunto si también está solo» suma Empatía +7 y Cautela +5; «No dejaré que el miedo decida» suma Valentía +7 y Cautela +5.
- En la segunda pregunta del Jaguar furioso: «El miedo también puede avisarme» suma Cautela +3 y Valentía +5; «Escucharé antes de responder» suma Empatía +5 y Cautela +3; «Daré el siguiente paso» suma Valentía +5 e Ingenio +3.
- En la pregunta final del Jaguar furioso, comprender la furia suma Empatía +8 y Cautela +2; resistirla y mantenerse en pie suma Valentía +11 y Cautela +2.
- En el primer enigma del Jaguar burlón: sombra propia suma Ingenio +6 y Cautela +5; dudar de que la luz tenga todas las respuestas suma Ingenio +10 y Empatía +4; recordar al colibrí suma Ingenio +5 y Empatía +7.
- En el segundo enigma: «Tal vez los dos…» suma Ingenio +5 y Empatía +5; quien hace la pregunta suma Ingenio +10 y Valentía +4; lo que la semilla decide suma Ingenio +8 y Valentía +4.
- En el tercer enigma: no dejar que el conocimiento cambie suma Ingenio +9 y Empatía +2; usarlo para sentirse superior suma Ingenio +7 y Empatía +6; no atreverse a cuestionarlo suma Ingenio +10 y Cautela +3.
- Si falla Cautela, el mensaje dice exactamente «El limón dio media vuelta pero, mientras salía de la cueva, pisó una rama con tan mala fortuna que el Jaguar percibió el miedo del limón al hacer crujir la madera, entonces salió furioso de su escondite».
- Evidencia: efectos finales comprobados mediante `scaleJaguarAnswerEffects`, los dos outcomes del Río verificados con estadísticas iniciales, `pnpm check`, `pnpm test` (88 pruebas, incluida la frase literal del fallo), `pnpm build:static` y `git diff --check` pasan.

## [x] Modo «Reescribir historia» desde el Libro de semillas
- El acceso a «Reescribir historia» aparece en el Libro solo una vez completado el encuentro con Jaguar y recogida su semilla final.
- Desde el Libro el jugador puede entrar directamente, sin rehacer el resto del juego, a Amanecer, Rambla, Espíritus del río, reto del río, Colibrí o Jaguar para volver a tomar decisiones y repetir solo ese capítulo/encuentro.
- Una nueva decisión sustituye la decisión anterior de esa escena; no se acumulan las bonificaciones anteriores y las semillas ya descubiertas y el acceso a las escenas se conservan.
- Las estadísticas del siguiente encuentro con Jaguar se recalculan desde 35 para cada atributo usando la decisión vigente de cada capítulo, sin exigir reiniciar ni volver a jugar la historia completa.
- Si la nueva resolución de Rambla cambia la ruta pacífica/drástica, se elimina la respuesta previa dependiente de Espíritus del río, se indica que está pendiente y el jugador puede abrir directamente ese capítulo desde el modo de reescritura para elegir una respuesta válida para la nueva ruta.
- Evidencia: seis destinos se enrutan directamente desde el Libro, la invalidación de Espíritus del río se prueba en almacenamiento, las semillas se conservan al repetir, y `pnpm check`, `pnpm test` (90 pruebas), `pnpm build:static` y `git diff --check` pasan; auditoría de solo lectura sin hallazgos.

## [x] Archivo de finales del Jaguar dentro del Libro
- Al conseguir uno de los finales —Empatía, Enigmas, Valentía o Pesadilla—, se guarda el identificador del final; repetir el mismo no crea duplicados y conseguir un final distinto añade otro registro.
- Tras completar Jaguar, el Libro permite abrir una diapositiva resumen por cada final conseguido, con su ilustración pixel art correspondiente.
- Abrir una diapositiva del archivo solo visualiza el final; no inicia Jaguar, no reinicia el encuentro y no repite el combate.
- El archivo y las decisiones guardadas se limpian con el reinicio total del juego; las semillas se conservan al reescribir capítulos.
- Evidencia: los cuatro recursos de arte existen, los identificadores se deduplican y se borran en reinicio con pruebas automatizadas; las diapositivas son una vista interna del Libro sin callback de combate. `pnpm check`, `pnpm test` (90 pruebas), `pnpm build:static` y `git diff --check` pasan; auditoría de solo lectura sin hallazgos.


## [x] Índice de semillas del Libro
- El Libro incluye una página de índice con las diez semillas, sus títulos y el orden del catálogo.
- Al pulsar cualquier semilla del índice, se abre directamente la página de esa canción, sin tener que avanzar página por página con «anterior» y «siguiente».
- Si la semilla aún está bloqueada, su página se abre en estado bloqueado; el índice no altera la progresión ni concede semillas.
- El título de una canción solo es visible después de conseguir su semilla; las entradas bloqueadas del índice y sus etiquetas accesibles no revelan el título.
- Evidencia: nombres visuales y accesibles condicionados a que la semilla esté descubierta; `onReplaySong`, `replaySong` y `REPLAY_TARGETS` eliminados del flujo del glifo. `pnpm check`, `pnpm test` (90 pruebas), `pnpm build:static` y `git diff --check` pasan.


## [x] Glifo de semilla no interactivo
- Al pulsar el glifo de una semilla en su página del Libro, no se inicia la escena ni el minijuego asociado.
- La navegación a capítulos reescribibles sigue disponible desde su acceso explícito de «Reescribir historia».
- Evidencia: el glifo se renderiza en un contenedor no interactivo y el único acceso a escenas desde SeedBook permanece en la sección explícita de reescritura.


## [x] Frase de acceso informal (versión anterior)
- La versión previa cambió `0123456789` por `gran catalizador`, con marca de sesión versionada y aviso de que no era protección de servidor. Esta frase se reemplazó posteriormente; la contraseña vigente queda registrada en «Cambiar contraseña informal de acceso» al final de este TODO.
- Evidencia histórica: el código de la versión previa versionaba `ACCESS_KEY`; `pnpm check`, `pnpm test` (90 pruebas) y `pnpm build:static` pasaron en esa actualización.


## [x] Retirar la pestaña «Semillas» del Libro
- La pestaña «Semillas» desaparece de la navegación interna del Libro.
- El Libro abre inicialmente el Índice; elegir una entrada de semilla sigue abriendo su página de canción y los accesos narrativos a una canción concreta siguen funcionando.
- Se conservan las pestañas disponibles de Índice, Reescribir historia y Finales.
- Evidencia: el índice es la vista inicial si no hay foco narrativo explícito, y el efecto conserva la apertura directa de canciones en los accesos narrativos. `pnpm check`, `pnpm test` (90 pruebas), `pnpm build:static` y `git diff --check` pasan.


## [x] Estadísticas al volver a un capítulo desde Reescribir historia
- Entrar de nuevo en Ventana al sendero muestra exactamente 35 de Cautela, Empatía, Ingenio y Valentía antes de tomar la nueva decisión, incluso después de terminar Jaguar.
- El HUD de cada capítulo solo incluye las decisiones anteriores y, cuando se resuelve el intento actual, su nueva bonificación; no incluye resultados de capítulos posteriores ni respuestas del encuentro anterior con Jaguar.
- Se conservan semillas, finales y decisiones guardadas independientes. Al volver directamente a Jaguar se usan las decisiones vigentes del viaje y se reinicia su encuentro, sin duplicar puntos ni obligar a repetir todos los capítulos.
- Las reentradas en Río, Colibrí y Nueve sentidos no aplican la recompensa anterior del capítulo antes de resolver el nuevo intento.
- «Volver a probar el encuentro» dentro de Jaguar mantiene el +4 de Ingenio de Nueve sentidos al recalcular su historial inicial.
- Evidencia: ocho pruebas de regresión cronológica; recorrido visual Libro → Reescribir historia → Ventana confirmado con cuatro valores de 35% y colección intacta. Auditoría independiente detectó el historial incompleto del reinicio interno de Jaguar, corregido pasando y memorizando la semilla de Nueve sentidos. `pnpm check`, `pnpm test` (98 pruebas), `pnpm build:static` y `git diff --check` pasan.


## [x] Reto del río: dos caminos hacia el fondo
- Entrar en la corriente sin miedo representa Valentía y mantiene su recompensa de +6; retirarse hacia la orilla mientras los espíritus abren las aguas representa Cautela y mantiene su +6.
- La elección, su respuesta posterior y la diapositiva de descenso distinguen ambas rutas; no se presenta retirarse como seguir la corriente ni como regresar al fuego.
- Ambas elecciones permiten descender al fondo del río y acceder a El Río.
- Evidencia: consecuencias compartidas en escena e interludio, posición final de Limón específica por ruta y tres pruebas que verifican narración, recompensa y acceso. `pnpm check`, `pnpm test` (101 pruebas), `pnpm build:static` y `git diff --check` pasan.

## [x] Propuesta narrativa del Colibrí, sin cambios en el juego
- Presentar primero un borrador para sustituir las respuestas hirientes por alternativas valientes y empáticas, conservando las seis preguntas como referencia.
- No aplicar todavía esos textos, modificar deltas de ánimo ni cambiar las bonificaciones por desenlace; la variante de +9 una sola vez tras cuatro elecciones valientes permanece pendiente de aprobación explícita.
- Evidencia: `docs/propuesta-colibri-valentia.md` contiene doce alternativas y una despedida respetuosa, con reglas marcadas como pendientes; los archivos ejecutables del Colibrí y del balance no tienen diferencias respecto a la versión anterior.


## [x] Vista previa de desarrollo de los diálogos del Colibrí
- Los controles de desarrollo permiten cambiar entre el diálogo actual y el borrador narrativo, sin modificar los textos oficiales de producción.
- El borrador permite recorrer las seis preguntas y sus respuestas candidatas en la escena del Colibrí, con una marca visible «borrador · sin puntuación».
- Elegir respuestas en esta vista solo avanza la previsualización: no suma ni resta ánimo, no decide amistad/despedida, no entrega semillas, no guarda un desenlace ni altera el progreso.
- Evidencia: la prueba de navegador recorrió los seis cuadros, llegó al fin de la vista previa sin desenlace y mostró las cuatro estadísticas aún en 35; el build de producción excluye el texto borrador. `pnpm check`, `pnpm test` (101 pruebas), `pnpm build:static` y `git diff --check` pasan.


## [x] Panel de pruebas plegable
- Añadir un botón visible para ocultar o mostrar el panel de controles de desarrollo.
- Al plegarlo, el botón permanece visible para volver a abrirlo y el lienzo del juego recupera el espacio vertical que deja libre el panel.
- Evidencia: en Preview el botón alterna ambos estados, queda visible plegado, y el panel vuelve expandido tras recargar. La reserva del workspace baja de 104 a 52 px y la escena conserva la proporción 1180:1333 (0.8852) en ambos estados; CSS contempla el breakpoint móvil. `pnpm check`, `pnpm test` (101), `pnpm build:static` y `git diff --check` pasan; los controles de desarrollo y el borrador no aparecen en el bundle de producción.


## [x] Diálogo y recompensas aprobadas del Colibrí
- Mantener las seis preguntas actuales y tres respuestas por pregunta: la respuesta empática actual permanece sin cambios; en cada turno se conserva la H seleccionada y se usa la V indicada. Las frases son:
  1. H «Si no tienes casa, busca otra. Quedarte aquí no va a cambiar nada.»; V «No sé qué encontraremos más allá de las cenizas, pero también me da miedo. Busquemos refugio».
  2. H «El mundo siempre ha sido grande, deja de mirar atrás y vuela»; V «El cielo infinito puede dar miedo, sin ser éste nuestro enemigo».
  3. H «No pienses en eso ahora. Hay cosas que es mejor olvidar.»; V «No podemos cambiar lo que ardió, pero sí decidir cómo cuidar lo que queda».
  4. H «No deberías preocuparte tanto por lo que piensen los demás.»; V «A veces pedir ayuda cuesta más que seguir solo, no necesitas demostrar que eres invencible».
  5. H «No pienses en el jaguar. Hay cosas más importantes.»; V «No dejes que una risa decida cuánto vale tu esfuerzo.»
  6. H «seguir volando es lo que mejor sabes hacer. Sigue haciéndolo y no mires atrás»; V «No puedo prometerte un camino seguro, pero sí te prometo que lo andaré junto a ti».
- Cada respuesta H resta −30 al ánimo del Colibrí y no modifica Cautela, Empatía, Ingenio ni Valentía. Cada V suma +10 al ánimo del Colibrí y actualiza Valentía +3 inmediatamente en el HUD. Al resolver la escena, el total de V se guarda una sola vez y no se vuelve a sumar. La respuesta empática actual conserva su delta de +25 al ánimo.
- Si el desenlace crea amistad y el Colibrí acompaña a Limón, se añaden +10 de Empatía al resolver el final de la escena del Colibrí, no al entrar en Jaguar. El desenlace neutral conserva +7 de Cautela; se elimina el +9 de Valentía que antes se concedía con la despedida.
- Al reescribir el capítulo, la nueva resolución sustituye la recompensa anterior: los puntos no se acumulan por repetición y las semillas descubiertas no se pierden. El borrador de desarrollo sigue sin puntuar ni alterar el progreso.
- Evidencia: `pnpm check` pasa; `pnpm test` pasa con 110 pruebas; `pnpm build:static` compila. En el Preview, una V cambió Valentía de 35 a 38 y una segunda de 38 a 41; el ánimo también subió +10 por respuesta. El bundle contiene las seis frases V y excluye las frases H retiradas y el borrador de desarrollo. La revisión independiente confirmó que el total se guarda una sola vez y no se duplica al resolver; la semilla queda preservada. Una prueba de seis H confirma ánimo −100 y desenlace negativo al terminar la conversación.


## [x] Estadísticas heredadas al reescribir historia
- Al entrar a un capítulo desde «Reescribir historia», el limón comienza con los cambios de estadística ya guardados en las escenas anteriores. Se excluye la decisión del capítulo que se va a reescribir y las posteriores hasta que se jueguen; las decisiones posteriores no se borran.
- «Rambla» comienza con los cambios guardados en «Ventana al sendero»; «Espíritus del río» comienza con los de «Rambla»; «El reto del río» incluye la conversación guardada de «Espíritus del río»; «El colibrí» comienza con todos los cambios guardados antes de su escena, incluidos los del río. El mismo principio se aplica a los demás capítulos reescribibles y a la entrada de Jaguar.
- El Libro muestra en cada tarjeta de reescritura los valores iniciales de Cautela, Empatía, Ingenio y Valentía; al entrar en el capítulo, el HUD coincide con esos valores.
- Los valores se reconstruyen a partir de decisiones y recompensas persistidas, sin un acumulador paralelo. Resolver el capítulo reemplaza su desenlace anterior y su efecto se cuenta una sola vez; cambiar Rambla sigue invalidando la respuesta del río que dependa de esa ruta. Reescribir no elimina semillas descubiertas.
- Evidencia: `journeyStats.test.ts` verifica los valores de entrada de Rambla, río, reto del río, Colibrí, Nueve sentidos y Jaguar a partir del historial guardado; el agente de revisión no encontró problemas. En el preview se ven las cuatro estadísticas iniciales en cada tarjeta. `pnpm check`, `pnpm test` (110 pruebas), `pnpm build:static` y `git diff --check` pasan; no se añade un acumulador duplicado ni se modifica el guardado de semillas.


## [x] Justificación de textos en diapositivas narrativas
- Justificar a ambos márgenes el texto narrativo de todas las diapositivas `StoryInterlude`; la última línea del párrafo permanece alineada al inicio.
- No cambiar la alineación ni el diseño de los botones de continuación, glifos de semillas ni cuadros de diálogo que aparecen dentro de las escenas. La justificación se mantiene en escritorio y móvil.
- Evidencia: el Preview calcula `text-align: justify` y `text-align-last: start` para el párrafo narrativo; `pnpm check`, `pnpm test` (110 pruebas), `pnpm build:static` y `git diff --check` pasan. La regla está limitada a `.story-interlude p`, así que no altera botones, semillas ni paneles de diálogo de las escenas.


## [x] Panel del Libro elevado para caber en pantalla
- Elevar solo el panel del Libro para que no quede oculta su parte inferior cuando el área de juego no cabe en la altura de la pantalla.
- No mover el icono/botón del Libro. Mantener el panel centrado respecto al escenario, limitado al alto visible y con su contenido desplazable en móviles y pantallas bajas.
- Evidencia: en Preview el panel empieza en y=0 y termina en y=1100, igual que el viewport; el icono no se desplazó porque no se alteraron sus reglas. En móvil conserva el alto `100dvh` y el área interna sigue desplazable. `pnpm check`, `pnpm test` (110), `pnpm build:static` y `git diff --check` pasan.


## [x] Suavizar la despedida triste del Colibrí
- En el desenlace negativo, reemplazar «Tus palabras pesan más que las cenizas. No puedo quedarme aquí» por «Me da pena despedirme, Limón. Necesito seguir volando por mi cuenta, al menos por ahora».
- La despedida debe seguir siendo triste, pero expresar la necesidad de seguir por su cuenta sin reprochar a Limón. No cambiar el umbral, la puntuación, la etiqueta «DESPEDIDA», la entrega de semilla ni los otros desenlaces.
- Evidencia: el bundle de producción incluye la nueva despedida y excluye la anterior; `pnpm check`, `pnpm test` (110 pruebas), `pnpm build:static` y `git diff --check` pasan. Solo cambia el texto de `outcome === "bad"`; los demás desenlaces y recompensas permanecen intactos.


## [x] Cambiar contraseña informal de acceso
- Cambiar la contraseña informal exacta a `nko23`, sustituyendo `gran catalizador`.
- Versionar la clave de sesión para que una autorización guardada con la versión anterior ya no abra el juego y se solicite la nueva contraseña. Mantener el acceso como barrera informal de interfaz, no autenticación de servidor.
- Evidencia: `PasswordGate` ahora compara con `nko23` y usa `limonero-access-granted-v3`; el bundle incluye la clave nueva y no la anterior. `pnpm check`, `pnpm test` (110 pruebas), `pnpm build:static` y `git diff --check` pasan.
