# Plan: reescritura de historia y archivo de finales

## Implementación
- El acceso a «Reescribir historia» aparece en el Libro de semillas solo después de obtener la última semilla de Jaguar. Desde ahí se selecciona un capítulo relevante y se reinicia únicamente su intento: Amanecer, Rambla, Espíritus del río, reto del río, Colibrí o el encuentro Jaguar. Las semillas descubiertas permanecen intactas; la nueva resolución reemplaza el desenlace guardado y las estadísticas de Jaguar se vuelven a calcular desde la base 35 con el historial vigente.
- El HUD muestra la base 35 más las decisiones previas al capítulo actual; su propia bonificación solo se añade al resolver el nuevo intento. En Ventana al sendero la reentrada es 35 en los cuatro atributos. Las decisiones posteriores permanecen guardadas pero no se anticipan en el HUD; al saltar a Jaguar vuelven a formar parte del cálculo vigente. La puntuación del encuentro anterior del Jaguar no se usa fuera de su escena.
- Si se cambia la ruta de Rambla, se borra la respuesta anterior de Espíritus del río, porque sus opciones dependían de esa ruta; el Libro marca esa decisión como pendiente de volver a elegir. La navegación de reescritura permite entrar directamente en ese capítulo, sin volver a completar las escenas intermedias.
- El Jaguar registra de forma persistente los identificadores de los finales distintos al alcanzar la pantalla final correspondiente: Empatía, Enigmas, Valentía y Pesadilla. El Libro ofrece un archivo de finales conseguidos con una diapositiva resumen e ilustración pixel art ya existente para cada final; abrirla solo muestra esa imagen y su síntesis, sin iniciar `JaguarScene` ni el combate.
- La persistencia sigue en `localStorage` y el reinicio total borra archivo y elecciones, pero nunca se borra una semilla por repetir un capítulo. Los finales se guardan como conjunto deduplicado.

## Estructura del proyecto
- `client/src/pages/Home.tsx`: orquesta navegación directa a capítulos, invalida la decisión de río al cambiar Rambla, calcula el acceso desbloqueado y conecta Libro con Jaguar.
- `client/src/components/SeedBook.tsx` y `client/src/pages/home.css`: añaden vistas de reescritura y archivo en el panel existente, adaptables a móvil y coherentes con su pixel art.
- `client/src/components/JaguarScene.tsx` y `jaguarRules.ts`: notifican el final alcanzado y comparten el catálogo de identificadores/arte/resúmenes para la visualización sin combate.
- `client/src/components/HummingbirdScene.tsx` y `hummingbirdRules.ts`: clasifican las respuestas empática, H y V, aplican los deltas aprobados y notifican la recompensa al resolver la escena.
- `client/src/pages/Home.tsx`, `gameProgressStorage.ts`, `journeyStats.ts` y `jaguarRules.ts`: guardan la última recompensa del Colibrí, la proyectan al terminar su capítulo y la sustituyen al reescribir sin acumularla; también persisten finales únicos y limpian progreso cuando corresponde.
- `client/src/components/StoryInterlude.tsx`, `GameSprites.tsx` y `home.css`: presentan la apertura sin párrafo, con el limón pixel art como botón «comenzar el sendero», y mantienen el texto literal del cruce del portal.
- `client/src/seedSceneNavigation.ts`, `SeedBook.tsx` y `Home.tsx`: conectan el glifo de cada semilla ya descubierta con su escena correspondiente, conservando el historial guardado y sin conceder semillas ni sumar recompensas al navegar.
- `client/src/components/CampfireScene.tsx`, `campfire-scene.css` y `hummingbird-scene.css`: ajustan el hotspot circular de Rambla y disponen las respuestas del Colibrí para que su texto completo sea visible en escritorio, manteniendo el scroll móvil.

## Diseño
Se conserva la estética aprobada del juego: Libro como objeto físico de pixel art ingenuo, papel cálido, marco oscuro, tipografía monoespaciada pequeña y botones explícitos. Las vistas son páginas internas (canciones, reescritura, finales); la repetición de un capítulo tiene una acción clara y no borra colección. La diapositiva archivada reutiliza las ilustraciones finales pixel art existentes, sin generar arte nuevo ni activar controles del combate. Movimiento y transiciones respetan el comportamiento accesible ya establecido en el Libro.

## Encuadre del Jaguar en escritorio
Reutilizar los overlays pixel art existentes del Jaguar furioso y burlón. En `jaguar-scene.css`, usar `.jaguar-forest > img.jaguar-character-art` para que las reglas del sprite prevalezcan sobre el selector genérico del fondo y restablecer `inset` antes de centrarlo; ambos overlays usan `object-fit: contain`. En escritorio (`min-width:900px`), el furioso usa `top:5%`, `width:clamp(220px,54%,400px)` y `height:60%`; el burlón usa `top:8%`, `width:clamp(190px,42%,320px)` y `height:52%`. Conservar los valores móviles existentes (`top:7%/height:62%` para el furioso y `top:9%/width:clamp(120px,44%,220px)/height:48%` para el burlón), el fondo, los cuadros, los controles y la lógica de combate.


## Índice de semillas
El Libro tendrá una vista de índice ordenada con las diez canciones del catálogo. Elegir una entrada abrirá directamente su página; si la semilla aún está bloqueada, se mostrará como bloqueada y no modificará la progresión. Los títulos permanecerán ocultos tanto en pantalla como en etiquetas accesibles hasta conseguir su semilla. Se mantienen anterior/siguiente como navegación opcional para páginas contiguas.


## Interacción del glifo
La regla anterior de glifo ornamental queda sustituida: en la página de una canción descubierta, pulsar su semilla lleva a la escena correspondiente, respetando el progreso guardado. El mapa es Aurora→local, Ventana al sendero→amanecer, Raíces→ruinas, Rambla→hoguera, Espíritus del río→orilla, El río→fondo del cauce, El fuego→bosque ardiendo, Ponzoña→Colibrí, Nueve sentidos→cielo estrellado y El Jaguar→Jaguar. Las semillas bloqueadas siguen sin ser accionables y sus títulos permanecen ocultos. El retorno reinicia solo el intento de esa escena, conserva todas las semillas ya descubiertas y usa las estadísticas persistidas anteriores al capítulo; entrar o volver a recoger una semilla no duplica puntos ni premios. La nueva resolución reemplaza la decisión previa, igual que en «Reescribir historia».


## Puerta de acceso informal
La contraseña verificada por `PasswordGate` es exactamente `nko23`. Versionar la clave de sesión para que la marca de acceso previa no desbloquee la aplicación tras recargar. Se conserva el aviso de que la puerta del navegador no es autenticación de servidor.


## Navegación del Libro
Eliminar la pestaña «Semillas»; abrir el Libro normalmente en el Índice y mantener las páginas de canciones accesibles desde sus entradas. Los accesos narrativos pueden seguir abriendo directamente la canción pertinente. Se conservan las secciones Índice, Reescribir historia y Finales según disponibilidad. En Reescribir historia, cada tarjeta muestra los cuatro valores iniciales del capítulo, calculados con las decisiones persistidas de los capítulos anteriores. `getJourneyStatsHistory` excluye la decisión del capítulo que se va a repetir y las posteriores; el mismo historial proyectado alimenta el HUD al entrar. Una nueva decisión reemplaza la anterior sin sumar dos veces; si cambia Rambla, se invalida su conversación dependiente del río. Las semillas permanecen independientes de las estadísticas y no se pierden al reescribir.


## Reto del río y diálogo aprobado del Colibrí
El reto distingue la entrada valerosa en la corriente de la retirada cautelosa hacia la orilla. Cada desenlace tiene texto propio en la escena y en el interludio siguiente, pero ambos abren el descenso a El Río; sus recompensas se mantienen en +6 de Valentía o +6 de Cautela. Un catálogo de consecuencias compartido evita que las dos capas narrativas se contradigan. La escena del Colibrí conserva seis preguntas y tres opciones por turno: la respuesta empática actual (+25 ánimo), una H elegida (−30 ánimo, sin modificar atributos) y una V aprobada (+10 ánimo y +3 Valentía). Cada V actualiza el HUD inmediatamente; al resolver, se persiste el total una sola vez. Las seis frases aprobadas están en TODO.md y en el documento de decisiones del Colibrí.

La amistad concede +10 Empatía al resolver la escena del Colibrí, no al entrar en Jaguar. Home registra el resultado y sus recompensas al final de ese capítulo; las V ya aplicadas durante la conversación se reemplazan por el total persistido, evitando duplicarlas. Reescribir historia sustituye la última resolución sin acumular puntos ni borrar semillas. Se elimina la bonificación de +9 Valentía del desenlace de despedida; se conserva el +7 Cautela del resultado neutral.

En escritorio, las tres opciones del Colibrí se muestran en una columna legible, con texto que envuelve líneas y botones de altura automática; el panel dispone de altura suficiente para evitar cortes en una ventana de escritorio habitual. En móvil se conserva el desplazamiento vertical ya aprobado.


## Vista previa de diálogo del Colibrí
La paleta de pruebas de desarrollo podrá alternar entre el diálogo vigente y el borrador narrativo del Colibrí. La variante borrador reutilizará la escena gráfica, pero sus elecciones serán una secuencia local no puntuable: no podrán generar ánimo, desenlace, semilla ni progreso persistente. En producción no aparecerá el selector y seguirá activa solo la conversación aprobada.


## Panel de pruebas plegable
El panel solo de desarrollo tendrá un control accesible de ocultar/mostrar que permanece visible en ambos estados. Al plegarse, el contenedor del juego reducirá su separación reservada para el panel, de modo que el lienzo recupere altura tanto en escritorio como en móvil.


## Diapositivas narrativas
En `StoryInterlude`, justificar a ambos márgenes el párrafo narrativo y dejar la última línea alineada al inicio. No cambiar la alineación de botones, glifos de semilla ni cuadros de diálogo integrados en las escenas; la regla se aplica también en móvil.

La primera diapositiva no contiene texto narrativo: muestra únicamente el botón «comenzar el sendero», representado con el `LemonSprite` pixel art. Después de cruzar el portal, la segunda diapositiva presenta literalmente: «El limón tomó la semilla que salió del portal. La semilla lo arrastró para atravesar la abertura con ella en su posesión y llegar a otro lugar. Al otro lado se encontró muy solo y comprendió que ya no sabía cómo volver a casa.» No se añade otra frase a ese texto.


## Presentación inicial de Rambla
La diapositiva que introduce Rambla muestra literalmente: «Tras las ruinas encontró unos encapuchados, hablaban de una verdad reservada para unos pocos y aguardaban junto a una hoguera, como si el fuego pudiera responder por ellos.» En `campfire-scene.css`, se amplía el área circular interactiva centrada en el círculo de encapuchados, manteniéndola separada de los puntos de recogida de ramas y de otros controles.


## Posición vertical del Libro
El panel modal del Libro se ancla al alto visible de la ventana y se eleva respecto al área del juego, sin alterar el botón/icono que lo abre. El ancho sigue la proporción del escenario y el contenido conserva su desplazamiento interno en pantallas pequeñas.


## Despedida triste del Colibrí
En el desenlace negativo, sustituir el reproche por una frase triste pero amable: «Me da pena despedirme, Limón. Necesito seguir volando por mi cuenta, al menos por ahora». Mantener intactos el desenlace, su puntuación y la recompensa de la escena.


## Pista del primer plano de guitarra
`GuitarCloseup` muestra la frase exacta «donde sospecho, dorados sosiegos. Donde sostengo dolores al soslayo» inmediatamente después del área desplazable del mástil y antes de los controles inferiores. El texto se mantiene centrado, legible y responsive, con la paleta crema/dorada del minijuego; no reemplaza instrucciones, marcas ni controles.
