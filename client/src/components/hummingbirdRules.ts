export type HummingbirdOutcome = "good" | "bad" | "neutral";
export type HummingbirdResponseKind = "empatica" | "hiriente" | "valiente";

export type HummingbirdOption = {
  text: string;
  kind: HummingbirdResponseKind;
  moodDelta: number;
};

export type HummingbirdQuestion = {
  prompt: string;
  options: readonly HummingbirdOption[];
};

export type HummingbirdRewards = {
  empatia: number;
  valentia: number;
};

export const FRIENDSHIP_THRESHOLD = 80;
export const NEUTRAL_MIN_SCORE = -80;
export const IMMEDIATE_GOOD_THRESHOLD = 100;
export const EMPATHIC_MOOD_DELTA = 25;
export const HURTFUL_MOOD_DELTA = 0;
export const VALIANT_MOOD_DELTA = 10;
export const VALIANT_COURAGE_POINTS = 3;
export const FRIENDSHIP_EMPATHY_POINTS = 10;
export const HUMMINGBIRD_QUESTION_COUNT = 6;

export const HUMMINGBIRD_QUESTIONS: readonly HummingbirdQuestion[] = [
  {
    prompt: "Mi casa estaba en aquel árbol. Ahora solo quedan cenizas. No sé dónde volver.",
    options: [
      { kind: "empatica", moodDelta: EMPATHIC_MOOD_DELTA, text: "No tienes que resolverlo todo ahora. Puedes descansar un momento y luego pensamos qué hacer." },
      { kind: "valiente", moodDelta: VALIANT_MOOD_DELTA, text: "No sé qué encontraremos más allá de las cenizas, pero también me da miedo. Busquemos refugio" },
      { kind: "hiriente", moodDelta: HURTFUL_MOOD_DELTA, text: "Si no tienes casa, busca otra. Quedarte aquí no va a cambiar nada." },
    ],
  },
  {
    prompt: "Volaba de árbol en árbol, pero ya no queda ninguno. El cielo es demasiado grande cuando no tienes un lugar al que regresar.",
    options: [
      { kind: "hiriente", moodDelta: HURTFUL_MOOD_DELTA, text: "El mundo siempre ha sido grande, deja de mirar atrás y vuela" },
      { kind: "empatica", moodDelta: EMPATHIC_MOOD_DELTA, text: "Aunque el bosque haya desaparecido, aquí quedan otros animales. Si quieres, podemos buscar a quienes también necesiten ayuda." },
      { kind: "valiente", moodDelta: VALIANT_MOOD_DELTA, text: "El cielo infinito puede dar miedo, sin ser éste nuestro enemigo" },
    ],
  },
  {
    prompt: "Intenté llevar agua para apagar el fuego. Volé hasta el río tantas veces como pude, pero nunca fue suficiente. Quizá todo fue culpa mía.",
    options: [
      { kind: "valiente", moodDelta: VALIANT_MOOD_DELTA, text: "No podemos cambiar lo que ardió, pero sí decidir cómo cuidar lo que queda" },
      { kind: "hiriente", moodDelta: HURTFUL_MOOD_DELTA, text: "No pienses en eso ahora. Hay cosas que es mejor olvidar." },
      { kind: "empatica", moodDelta: EMPATHIC_MOOD_DELTA, text: "Que no pudieras apagar el incendio no significa que no hicieras nada. A veces el valor está en insistir aunque no sepamos si bastará." },
    ],
  },
  {
    prompt: "Los animales me miraban mientras volvía del río. Yo sabía que no podía salvarlos. Cada viaje me hacía sentir más pequeño.",
    options: [
      { kind: "empatica", moodDelta: EMPATHIC_MOOD_DELTA, text: "No eras pequeño por no poder salvar el bosque. Eras valiente por volver a intentarlo." },
      { kind: "valiente", moodDelta: VALIANT_MOOD_DELTA, text: "A veces pedir ayuda cuesta más que seguir solo, no necesitas demostrar que eres invencible" },
      { kind: "hiriente", moodDelta: HURTFUL_MOOD_DELTA, text: "No deberías preocuparte tanto por lo que piensen los demás." },
    ],
  },
  {
    prompt: "Un jaguar se reía de mí. Decía que mis vuelos eran inútiles. Quizá tenía razón.",
    options: [
      { kind: "valiente", moodDelta: VALIANT_MOOD_DELTA, text: "No dejes que una risa decida cuánto vale tu esfuerzo." },
      { kind: "empatica", moodDelta: EMPATHIC_MOOD_DELTA, text: "Que alguien se burle de tus intentos no convierte tus esfuerzos en inútiles. Solo demuestra que no supo verlos." },
      { kind: "hiriente", moodDelta: HURTFUL_MOOD_DELTA, text: "No pienses en el jaguar. Hay cosas más importantes." },
    ],
  },
  {
    prompt: "Ahora no tengo casa, ni bosque, ni un camino al que regresar. ¿Qué puedo hacer?",
    options: [
      { kind: "valiente", moodDelta: VALIANT_MOOD_DELTA, text: "No puedo prometerte un camino seguro, pero sí te prometo que lo andaré junto a ti" },
      { kind: "hiriente", moodDelta: HURTFUL_MOOD_DELTA, text: "seguir volando es lo que mejor sabes hacer. Sigue haciéndolo y no mires atrás" },
      { kind: "empatica", moodDelta: EMPATHIC_MOOD_DELTA, text: "No puedo devolverte tu casa, pero puedo ayudarte a encontrar un refugio con los demás animales." },
    ],
  },
];

export function getHummingbirdRewards(outcome: HummingbirdOutcome, valiantResponseCount: number): HummingbirdRewards {
  const safeCount = Number.isFinite(valiantResponseCount)
    ? Math.max(0, Math.min(HUMMINGBIRD_QUESTION_COUNT, Math.floor(valiantResponseCount)))
    : 0;
  return {
    empatia: outcome === "good" ? FRIENDSHIP_EMPATHY_POINTS : 0,
    valentia: safeCount * VALIANT_COURAGE_POINTS,
  };
}

export function resolveHummingbirdOutcome(
  score: number,
  isFinalQuestion: boolean,
): HummingbirdOutcome | null {
  if (score >= IMMEDIATE_GOOD_THRESHOLD) return "good";
  if (!isFinalQuestion) return null;
  if (score >= FRIENDSHIP_THRESHOLD) return "good";
  if (score < NEUTRAL_MIN_SCORE) return "bad";
  return "neutral";
}
