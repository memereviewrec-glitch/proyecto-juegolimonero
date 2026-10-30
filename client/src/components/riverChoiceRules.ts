export type RiverRoute = "pacifico" | "drastico";

export type RiverChoiceConsequence = {
  reply: string;
  ending: string;
};

const CHOICE_CONSEQUENCES: Record<RiverRoute, readonly RiverChoiceConsequence[]> = {
  pacifico: [
    { reply: "El río no te pide que olvides la llama; te enseña a no confundir su calor con un hogar.", ending: "El agua enfría la falsa certeza. El limón sigue su curso sin llevarse la hoguera dentro." },
    { reply: "Conservar tu pulpa también significa aceptar que otras voces pueden moverla.", ending: "Una corriente turquesa rodea al limón: no lo arrastra, pero le muestra que puede elegir moverse." },
    { reply: "Una semilla guarda una posibilidad, pequeño limón, no todas las respuestas.", ending: "La semilla refleja el cielo sobre el agua. El limón deja atrás la idea de que una sola verdad basta." },
  ],
  drastico: [
    { reply: "Seguir no exige ver el camino entero; basta con escuchar el siguiente movimiento del agua.", ending: "El cauce abre una curva hacia delante. El limón vuelve a rodar, esta vez sin huir del camino." },
    { reply: "Detenerse también es avanzar cuando por fin se escucha algo distinto al miedo.", ending: "La corriente baja la voz. El limón encuentra un remanso donde descansar antes de continuar." },
    { reply: "Moverse con el mundo no es obedecerlo: es aprender a responderle.", ending: "Las corrientes dibujan varios senderos plateados. El limón elige uno y sigue adelante." },
  ],
};

export function getRiverChoiceConsequence(route: RiverRoute, choiceIndex: number): RiverChoiceConsequence | null {
  return CHOICE_CONSEQUENCES[route][choiceIndex] ?? null;
}
