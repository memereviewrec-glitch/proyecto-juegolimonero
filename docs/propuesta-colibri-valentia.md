# Diálogo aprobado: Colibrí y valentía con empatía

**Estado: implementado y validado en la versión de trabajo.**

La conversación conserva las seis preguntas, la respuesta empática actual de cada pregunta y tres opciones por turno. En cada una se conserva la respuesta hiriente (H) indicada y se incorpora la respuesta valiente (V) aprobada aquí. Las demás respuestas hirientes originales se retiran.

| Pregunta | H que se conserva | V aprobada |
|---|---|---|
| **1. Perdió su casa y no sabe dónde volver.** | «Si no tienes casa, busca otra. Quedarte aquí no va a cambiar nada.» | «No sé qué encontraremos más allá de las cenizas, pero también me da miedo. Busquemos refugio» |
| **2. Sin árboles, el cielo parece demasiado grande.** | «El mundo siempre ha sido grande, deja de mirar atrás y vuela» | «El cielo infinito puede dar miedo, sin ser éste nuestro enemigo» |
| **3. No pudo apagar el incendio y se siente culpable.** | «No pienses en eso ahora. Hay cosas que es mejor olvidar.» | «No podemos cambiar lo que ardió, pero sí decidir cómo cuidar lo que queda» |
| **4. No pudo salvar a los animales y se sintió pequeño.** | «No deberías preocuparte tanto por lo que piensen los demás.» | «A veces pedir ayuda cuesta más que seguir solo, no necesitas demostrar que eres invencible» |
| **5. El Jaguar se burló y el Colibrí duda de sus esfuerzos.** | «No pienses en el jaguar. Hay cosas más importantes.» | «No dejes que una risa decida cuánto vale tu esfuerzo.» |
| **6. No tiene casa ni camino y pregunta qué hacer.** | «seguir volando es lo que mejor sabes hacer. Sigue haciéndolo y no mires atrás» | «No puedo prometerte un camino seguro, pero sí te prometo que lo andaré junto a ti» |

## Respuestas empáticas actuales

La tercera opción empática que ya existe en cada pregunta se conserva sin cambios. Mantiene su efecto actual de **+25 al ánimo del Colibrí**; no se reemplaza por las frases V.

## Puntuación y desenlaces

- Una respuesta **H** no suma ni resta ánimo ni estadísticas.
- Cada respuesta **V** suma **+10 al ánimo del Colibrí** y **+3 a Valentía**.
- Si la resolución es de amistad y el Colibrí acompaña a Limón, se suman **+10 de Empatía al final de la escena del Colibrí**. No se espera hasta entrar en la escena del Jaguar.
- Se elimina el anterior **+9 de Valentía** asociado al desenlace de despedida. El desenlace neutral conserva su bonificación vigente de **+7 de Cautela**.
- Las semillas y los desenlaces previos siguen guardados. Al reescribir la historia, la última resolución del Colibrí sustituye sus recompensas previas; repetir la escena no acumula puntos.
- La vista previa de desarrollo sigue siendo solo un borrador: no suma ánimo ni estadísticas y no modifica el desenlace o el progreso.

Con estos deltas, las opciones nuevas no reducen el ánimo; por tanto, el umbral negativo de despedida deja de alcanzarse en una conversación nueva, aunque se conserva la rama de compatibilidad con desenlaces ya guardados. Los umbrales restantes no cambian.
