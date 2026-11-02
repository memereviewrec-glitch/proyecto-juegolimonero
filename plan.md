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

## Diseño
Se conserva la estética aprobada del juego: Libro como objeto físico de pixel art ingenuo, papel cálido, marco oscuro, tipografía monoespaciada pequeña y botones explícitos. Las vistas son páginas internas (canciones, reescritura, finales); la repetición de un capítulo tiene una acción clara y no borra colección. La diapositiva archivada reutiliza las ilustraciones finales pixel art existentes, sin generar arte nuevo ni activar controles del combate. Movimiento y transiciones respetan el comportamiento accesible ya establecido en el Libro.


## Índice de semillas
El Libro tendrá una vista de índice ordenada con las diez canciones del catálogo. Elegir una entrada abrirá directamente su página; si la semilla aún está bloqueada, se mostrará como bloqueada y no modificará la progresión. Los títulos permanecerán ocultos tanto en pantalla como en etiquetas accesibles hasta conseguir su semilla. Se mantienen anterior/siguiente como navegación opcional para páginas contiguas.


## Interacción del glifo
En las páginas de canción, el glifo es ornamental y no inicia escenas ni minijuegos. La entrada a una escena para reescribir decisiones permanece separada y explícita en «Reescribir historia».


## Puerta de acceso informal
Actualizar la frase verificada por `PasswordGate` a la nueva frase elegida y versionar la clave de sesión para que la marca de acceso previa no desbloquee la aplicación tras recargar. Se conserva el aviso de que la puerta del navegador no es autenticación de servidor.


## Navegación del Libro
Eliminar la pestaña «Semillas»; abrir el Libro normalmente en el Índice y mantener las páginas de canciones accesibles desde sus entradas. Los accesos narrativos pueden seguir abriendo directamente la canción pertinente. Se conservan las secciones Índice, Reescribir historia y Finales según disponibilidad. En Reescribir historia, cada tarjeta muestra los cuatro valores iniciales del capítulo, calculados con las decisiones persistidas de los capítulos anteriores. `getJourneyStatsHistory` excluye la decisión del capítulo que se va a repetir y las posteriores; el mismo historial proyectado alimenta el HUD al entrar. Una nueva decisión reemplaza la anterior sin sumar dos veces; si cambia Rambla, se invalida su conversación dependiente del río. Las semillas permanecen independientes de las estadísticas y no se pierden al reescribir.


## Reto del río y diálogo aprobado del Colibrí
El reto distingue la entrada valerosa en la corriente de la retirada cautelosa hacia la orilla. Cada desenlace tiene texto propio en la escena y en el interludio siguiente, pero ambos abren el descenso a El Río; sus recompensas se mantienen en +6 de Valentía o +6 de Cautela. Un catálogo de consecuencias compartido evita que las dos capas narrativas se contradigan. La escena del Colibrí conserva seis preguntas y tres opciones por turno: la respuesta empática actual (+25 ánimo), una H elegida (−30 ánimo, sin modificar atributos) y una V aprobada (+10 ánimo y +3 Valentía). Las seis frases aprobadas están en TODO.md y en el documento de decisiones del Colibrí.

La amistad concede +10 Empatía al resolver la escena del Colibrí, no al entrar en Jaguar. Home registra el resultado y sus recompensas al final de ese capítulo; el HUD las proyecta desde ese momento y Reescribir historia sustituye la última resolución sin acumular puntos ni borrar semillas. Se elimina la bonificación de +9 Valentía del desenlace de despedida; se conserva el +7 Cautela del resultado neutral.


## Vista previa de diálogo del Colibrí
La paleta de pruebas de desarrollo podrá alternar entre el diálogo vigente y el borrador narrativo del Colibrí. La variante borrador reutilizará la escena gráfica, pero sus elecciones serán una secuencia local no puntuable: no podrán generar ánimo, desenlace, semilla ni progreso persistente. En producción no aparecerá el selector y seguirá activa solo la conversación aprobada.


## Panel de pruebas plegable
El panel solo de desarrollo tendrá un control accesible de ocultar/mostrar que permanece visible en ambos estados. Al plegarse, el contenedor del juego reducirá su separación reservada para el panel, de modo que el lienzo recupere altura tanto en escritorio como en móvil.
