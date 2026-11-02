import type { RiverChallengeOutcome, RiverConversationOutcome } from "./riverChoiceRules";
import type { Branch } from "../gameRules";

export type JaguarStat = "cautela" | "empatia" | "ingenio" | "valentia";
export type JaguarStats = Record<JaguarStat, number>;
export type JaguarHistory = {
  dawnOutcome?: Branch | null;
  ramblaOutcome: 1 | 2 | null;
  hummingbirdOutcome: "good" | "bad" | "neutral" | null;
  riverConversationOutcome?: RiverConversationOutcome | null;
  riverChallengeOutcome?: RiverChallengeOutcome | null;
  nueveSentidosSeedCollected?: boolean;
};
export type JaguarAnswer = {
  label: string;
  effects: Partial<JaguarStats>;
  approach?: "empatia" | "valentia";
};
export type JaguarQuestion = {
  speaker: string;
  prompt: string;
  answers: readonly JaguarAnswer[];
};

const BASE_STAT = 35;
const RIVER_CONVERSATION_EFFECTS = {
  pacifico: [
    { cautela: 4 },
    { valentia: 4 },
    { cautela: 3 },
  ],
  drastico: [
    { valentia: 5 },
    { cautela: 5 },
    { cautela: 2, valentia: 3 },
  ],
} as const satisfies Record<"pacifico" | "drastico", readonly Partial<JaguarStats>[]>;

export const CAUTELA_THRESHOLD = 70;
export const EMPATHY_THRESHOLD = 70;
export const COURAGE_THRESHOLD = 70;
export const INGENUITY_THRESHOLD = 70;
export type JaguarBranch = "angry" | "laughing";
export function getJaguarBranchAfterCautela(succeeded: boolean): JaguarBranch {
  return succeeded ? "laughing" : "angry";
}
export const INGENUITY_RIDDLE = "Caminas sobre la escoria del mundo y los espejismos de la noche, rodeado de tesoros que no puedes tocar y peligros que solo existen mientras crees en ellos. ¿Qué milagro permite que la flor florezca en el cieno sin ensuciar sus pétalos?";
export const INGENUITY_ANSWER = "El milagro no es alterar el mundo de los sueños, sino despertar en medio de ellos. El loto nace del lodo; de la misma manera, la sabiduría brota al reconocer que los fenómenos son transitorios y carentes de un núcleo propio, permitiendo que la mente permanezca libre en el mundo sin aferrarse a él.";
export const NIGHTMARE_VOICEOVER = "Tu mente misma creó la selva y al depredador. Al igual que cuando alguien se libera de las ataduras pero corre de regreso a enredarse, a menudo recreamos nuestros propios temores. El sueño muestra cómo la mente construye el miedo a la disolución, pero al despertar comprendemos que no era más que una ilusión.";

export function clampJaguarStat(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function applyJaguarEffects(stats: JaguarStats, effects: Partial<JaguarStats>): JaguarStats {
  return {
    cautela: clampJaguarStat(stats.cautela + (effects.cautela ?? 0)),
    empatia: clampJaguarStat(stats.empatia + (effects.empatia ?? 0)),
    ingenio: clampJaguarStat(stats.ingenio + (effects.ingenio ?? 0)),
    valentia: clampJaguarStat(stats.valentia + (effects.valentia ?? 0)),
  };
}

export function scaleJaguarAnswerEffects(effects: Partial<JaguarStats>): Partial<JaguarStats> {
  const scaled: Partial<JaguarStats> = {};
  for (const stat of ["cautela", "empatia", "ingenio", "valentia"] as const) {
    const value = effects[stat];
    if (value !== undefined) {
      const multiplier = stat === "ingenio" ? 0.68 : 0.7;
      scaled[stat] = value === 0 ? 0 : Math.sign(value) * Math.max(1, Math.round(Math.abs(value) * multiplier));
    }
  }
  return scaled;
}

export function applyJaguarAnswerEffects(stats: JaguarStats, effects: Partial<JaguarStats>): JaguarStats {
  return applyJaguarEffects(stats, scaleJaguarAnswerEffects(effects));
}

/** Los desenlaces previos dan inclinaciones iniciales; las respuestas de esta escena las desarrollan. */
export function createInitialJaguarStats(history: JaguarHistory): JaguarStats {
  let stats: JaguarStats = {
    cautela: BASE_STAT,
    empatia: BASE_STAT,
    ingenio: BASE_STAT,
    valentia: BASE_STAT,
  };
  if (history.dawnOutcome === "A") {
    stats = applyJaguarEffects(stats, { valentia: 7 });
  } else if (history.dawnOutcome === "B") {
    stats = applyJaguarEffects(stats, { cautela: 7 });
  }
  if (history.ramblaOutcome === 1) {
    stats = applyJaguarEffects(stats, { cautela: 7, empatia: 7 });
  } else if (history.ramblaOutcome === 2) {
    stats = applyJaguarEffects(stats, { ingenio: 5, valentia: 9 });
  }
  if (history.hummingbirdOutcome === "good") {
    stats = applyJaguarEffects(stats, { empatia: 10 });
  } else if (history.hummingbirdOutcome === "neutral") {
    stats = applyJaguarEffects(stats, { cautela: 7 });
  } else if (history.hummingbirdOutcome === "bad") {
    stats = applyJaguarEffects(stats, { valentia: 9 });
  }
  const riverConversation = history.riverConversationOutcome;
  if (riverConversation && riverConversation.choiceIndex >= 0 && riverConversation.choiceIndex < 3) {
    const effects = RIVER_CONVERSATION_EFFECTS[riverConversation.route][riverConversation.choiceIndex];
    if (effects) stats = applyJaguarEffects(stats, effects);
  }
  if (history.riverChallengeOutcome === "current") {
    stats = applyJaguarEffects(stats, { valentia: 6 });
  } else if (history.riverChallengeOutcome === "shore") {
    stats = applyJaguarEffects(stats, { cautela: 6 });
  }
  if (history.nueveSentidosSeedCollected) {
    stats = applyJaguarEffects(stats, { ingenio: 4 });
  }
  return stats;
}

export const INNER_QUESTIONS: readonly JaguarQuestion[] = [
  {
    speaker: "EL LIMÓN",
    prompt: "Dos luces doradas me miran desde la maleza. ¿Qué hago con el miedo que me aprieta la cáscara?",
    answers: [
      { label: "Respiro despacio; no todo silencio es una amenaza.", effects: { cautela: 10, empatia: 3 } },
      { label: "Observo las hojas: hasta una sombra deja pistas.", effects: { ingenio: 10, cautela: 3 } },
      { label: "Pienso en el colibrí. No he llegado hasta aquí solo.", effects: { empatia: 10, cautela: 3 } },
      { label: "Sigo adelante, aunque las rodillas me tiemblen.", effects: { valentia: 10, cautela: 3 } },
    ],
  },
  {
    speaker: "EL LIMÓN",
    prompt: "El bosque contiene la respiración. ¿Qué me enseñaron el incendio y la lluvia?",
    answers: [
      { label: "Que escuchar también puede ser una forma de protegerse.", effects: { cautela: 9, empatia: 4 } },
      { label: "Que una amistad se demuestra cuando ayudar parece inútil.", effects: { empatia: 10, valentia: 3 } },
      { label: "Que incluso el fuego y el agua dejan señales distintas.", effects: { ingenio: 10, cautela: 3 } },
      { label: "Que puedo tener miedo y aun así elegir mi siguiente paso.", effects: { valentia: 10, cautela: 3 } },
    ],
  },
  {
    speaker: "EL LIMÓN",
    prompt: "Esos ojos no parpadean. ¿Qué me inquieta más: no saber qué me mira o saberlo?",
    answers: [
      { label: "Me inquieta no saberlo; esperaré un instante más.", effects: { cautela: 10, ingenio: 3 } },
      { label: "Quiero descubrir qué oculta; cada sombra tiene un borde.", effects: { ingenio: 10, cautela: 3 } },
      { label: "Me pregunto si también está solo, como yo me sentía.", effects: { empatia: 10, cautela: 3 } },
      { label: "Sea quien sea, no dejaré que el miedo decida por mí.", effects: { valentia: 10, cautela: 3 } },
    ],
  },
];

export const ANGRY_QUESTIONS: readonly JaguarQuestion[] = [
  {
    speaker: "EL JAGUAR · FURIOSO",
    prompt: "¿Por qué te acercas a mi bosque, pequeño limón, si hasta tus pasos tiemblan?",
    answers: [
      { label: "No buscaba invadirlo. Quería entender qué escondía el silencio.", effects: { empatia: 9, ingenio: 3 } },
      { label: "No he venido a huir. Puedo sostenerme ante tu rugido.", effects: { valentia: 9, cautela: 3 } },
      { label: "No lo sé todavía; prefiero admitirlo antes que fingir.", effects: { cautela: 8, empatia: 4 } },
    ],
  },
  {
    speaker: "EL JAGUAR · FURIOSO",
    prompt: "El jaguar baja la cabeza. «Entonces dime: ¿qué harás cuando el miedo vuelva a rugir?»",
    answers: [
      { label: "Recordaré que el miedo también puede avisarme, no solo detenerme.", effects: { cautela: 7, ingenio: 4 } },
      { label: "Escucharé antes de responder con otro rugido.", effects: { empatia: 7, cautela: 4 } },
      { label: "Daré el siguiente paso, aunque no pueda ver el camino entero.", effects: { valentia: 7, cautela: 4 } },
    ],
  },
  {
    speaker: "EL JAGUAR · FURIOSO",
    prompt: "Una última pregunta antes de probar tu respuesta: ¿intentarás comprender mi furia o resistirla?",
    answers: [
      {
        label: "«No quiero vencerte. Quiero comprender qué hay detrás de tu furia.»",
        effects: { empatia: 12, cautela: 2 },
        approach: "empatia",
      },
      {
        label: "«No voy a apartarme. Me mantendré en pie aunque me embistas.»",
        effects: { valentia: 15, cautela: 2 },
        approach: "valentia",
      },
    ],
  },
];

export const LAUGHING_QUESTIONS: readonly JaguarQuestion[] = [
  {
    speaker: "EL JAGUAR · ENTRE RISAS",
    prompt: "Dime, limón: ¿qué sombra te sigue incluso cuando corres hacia la luz?",
    answers: [
      { label: "La que proyecto yo; cambia cuando cambio de lugar.", effects: { ingenio: 14, cautela: 2 } },
      { label: "La duda de que quizá la luz no tenga todas las respuestas.", effects: { ingenio: 9, empatia: 5 } },
      { label: "La del colibrí, que aun sin bosque encontró a quién acompañar.", effects: { ingenio: 7, empatia: 7 } },
    ],
  },
  {
    speaker: "EL JAGUAR · ENTRE RISAS",
    prompt: "Si una semilla sueña que es un árbol, ¿quién está soñando a quién?",
    answers: [
      { label: "Tal vez los dos: un sueño puede crecer en ambas direcciones.", effects: { ingenio: 14, empatia: 2 } },
      { label: "Quien hace la pregunta; así obliga al sueño a mirarse.", effects: { ingenio: 10, valentia: 4 } },
      { label: "Ninguno. Lo importante es lo que la semilla decide al despertar.", effects: { ingenio: 8, valentia: 6 } },
    ],
  },
  {
    speaker: "EL JAGUAR · ENTRE RISAS",
    prompt: "Último acertijo: ¿qué conocimiento desaparece en cuanto intentas poseerlo?",
    answers: [
      { label: "El que no dejas cambiar cuando alguien más te habla.", effects: { ingenio: 13, empatia: 3 } },
      { label: "El que solo sirve para sentirte por encima de los demás.", effects: { ingenio: 10, empatia: 6 } },
      { label: "El que no te atreves a poner en duda.", effects: { ingenio: 11, cautela: 4 } },
    ],
  },
];

export function meetsJaguarThreshold(stat: number, minimum: number): boolean {
  return clampJaguarStat(stat) >= clampJaguarStat(minimum);
}

export type JaguarHintStage = "inner" | "cautela-check" | "angry-questions" | "angry-check" | "laughing-questions" | "ingenio-check";

export function getJaguarHummingbirdHint(stage: JaguarHintStage, approach?: "empatia" | "valentia"): string {
  switch (stage) {
    case "inner":
      return "Escucha el borde del silencio: la Cautela crece cuando el siguiente paso no se da con prisa.";
    case "cautela-check":
      return `El bosque no se abre al apuro: esta prueba mide Cautela; el umbral es ${CAUTELA_THRESHOLD}.`;
    case "angry-questions":
      return "Al rugido se le puede responder escuchando su herida o manteniéndose firme: allí crecen Empatía y Valentía, de distinto modo.";
    case "angry-check":
      return approach === "valentia"
        ? `La raíz que resiste se llama Valentía; el umbral está en ${COURAGE_THRESHOLD}.`
        : `El rugido guarda una herida: la prueba mide Empatía, y hacen falta ${EMPATHY_THRESHOLD} para que ceda.`;
    case "laughing-questions":
      return "La risa deja una sombra; el Ingenio crece cuando encuentras otra forma de mirar la pregunta.";
    case "ingenio-check":
      return `Una flor no fuerza el acertijo: lo mira desde otro ángulo. El Ingenio debe llegar a ${INGENUITY_THRESHOLD}.`;
  }
}

export type FightOutcome = "continue" | "victory" | "nightmare";

export function resolveFightOutcome(failedMoves: number, movesAttempted: number, totalMoves = 3): FightOutcome {
  if (movesAttempted < totalMoves) return "continue";
  return failedMoves >= 2 ? "nightmare" : "victory";
}

export type JaguarAdvice = { stat: JaguarStat; text: string };
export function getFinalJaguarAdvice(stats: JaguarStats): JaguarAdvice {
  const order: JaguarStat[] = ["cautela", "empatia", "ingenio", "valentia"];
  const strongest = order.reduce((best, current) => stats[current] > stats[best] ? current : best, order[0]);
  const advice: Record<JaguarStat, string> = {
    cautela: "No confundas la quietud con la ausencia de miedo. A veces escuchar el bosque es la manera más valiente de empezar.",
    empatia: "No salvaste a nadie por ser invulnerable. Lo hiciste porque pudiste imaginar el dolor de otro sin olvidar el tuyo.",
    ingenio: "Una pregunta puede abrir más caminos que una respuesta perfecta. Sigue dudando, pero no dejes de mirar.",
    valentia: "Ser valiente no es no temblar: es elegir qué merece tu siguiente paso, incluso cuando el suelo cruje.",
  };
  return { stat: strongest, text: advice[strongest] };
}
