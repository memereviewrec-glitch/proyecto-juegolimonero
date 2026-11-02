import { describe, expect, it } from "vitest";
import {
  EMPATHIC_MOOD_DELTA,
  HUMMINGBIRD_QUESTIONS,
  HURTFUL_MOOD_DELTA,
  VALIANT_COURAGE_POINTS,
  VALIANT_MOOD_DELTA,
  getHummingbirdRewards,
  resolveHummingbirdOutcome,
} from "./hummingbirdRules";

describe("hummingbird outcome thresholds", () => {
  it("ends immediately in friendship only when the score reaches 100", () => {
    expect(resolveHummingbirdOutcome(100, false)).toBe("good");
    expect(resolveHummingbirdOutcome(99, false)).toBeNull();
    expect(resolveHummingbirdOutcome(80, false)).toBeNull();
  });

  it("decides a high score of 80 or more at the sixth answer", () => {
    expect(resolveHummingbirdOutcome(80, true)).toBe("good");
    expect(resolveHummingbirdOutcome(99, true)).toBe("good");
  });

  it("keeps a score below -80 in the conversation until the sixth answer", () => {
    expect(resolveHummingbirdOutcome(-81, false)).toBeNull();
    expect(resolveHummingbirdOutcome(-90, false)).toBeNull();
    expect(resolveHummingbirdOutcome(-81, true)).toBe("bad");
    expect(resolveHummingbirdOutcome(-90, true)).toBe("bad");
  });

  it("keeps scores from -80 up to, but not including, 80 in the neutral band", () => {
    expect(resolveHummingbirdOutcome(-80, false)).toBeNull();
    expect(resolveHummingbirdOutcome(0, false)).toBeNull();
    expect(resolveHummingbirdOutcome(79, false)).toBeNull();
    expect(resolveHummingbirdOutcome(-80, true)).toBe("neutral");
    expect(resolveHummingbirdOutcome(79, true)).toBe("neutral");
  });
});

describe("respuestas aprobadas del Colibrí", () => {
  it("conserva seis preguntas con una respuesta empática, una H y una V por turno", () => {
    expect(HUMMINGBIRD_QUESTIONS).toHaveLength(6);
    for (const question of HUMMINGBIRD_QUESTIONS) {
      expect(question.options).toHaveLength(3);
      expect(question.options.map(option => option.kind).sort()).toEqual(["empatica", "hiriente", "valiente"]);
      expect(question.options.find(option => option.kind === "empatica")?.moodDelta).toBe(EMPATHIC_MOOD_DELTA);
      expect(question.options.find(option => option.kind === "hiriente")?.moodDelta).toBe(HURTFUL_MOOD_DELTA);
      expect(question.options.find(option => option.kind === "valiente")?.moodDelta).toBe(VALIANT_MOOD_DELTA);
    }
  });

  it("usa literalmente las H y V seleccionadas para las seis preguntas", () => {
    const responses = HUMMINGBIRD_QUESTIONS.map(question => ({
      H: question.options.find(option => option.kind === "hiriente")?.text,
      V: question.options.find(option => option.kind === "valiente")?.text,
    }));
    expect(responses).toEqual([
      { H: "Si no tienes casa, busca otra. Quedarte aquí no va a cambiar nada.", V: "No sé qué encontraremos más allá de las cenizas, pero también me da miedo. Busquemos refugio" },
      { H: "El mundo siempre ha sido grande, deja de mirar atrás y vuela", V: "El cielo infinito puede dar miedo, sin ser éste nuestro enemigo" },
      { H: "No pienses en eso ahora. Hay cosas que es mejor olvidar.", V: "No podemos cambiar lo que ardió, pero sí decidir cómo cuidar lo que queda" },
      { H: "No deberías preocuparte tanto por lo que piensen los demás.", V: "A veces pedir ayuda cuesta más que seguir solo, no necesitas demostrar que eres invencible" },
      { H: "No pienses en el jaguar. Hay cosas más importantes.", V: "No dejes que una risa decida cuánto vale tu esfuerzo." },
      { H: "seguir volando es lo que mejor sabes hacer. Sigue haciéndolo y no mires atrás", V: "No puedo prometerte un camino seguro, pero sí te prometo que lo andaré junto a ti" },
    ]);
  });

  it("concede +3 Valentía por cada V y +10 Empatía solo si se hace amistad", () => {
    expect(VALIANT_COURAGE_POINTS).toBe(3);
    expect(getHummingbirdRewards("good", 4)).toEqual({ empatia: 10, valentia: 12 });
    expect(getHummingbirdRewards("neutral", 2)).toEqual({ empatia: 0, valentia: 6 });
    expect(getHummingbirdRewards("bad", 0)).toEqual({ empatia: 0, valentia: 0 });
  });

  it("acota el contador a las seis respuestas de la escena", () => {
    expect(getHummingbirdRewards("good", 99)).toEqual({ empatia: 10, valentia: 18 });
    expect(getHummingbirdRewards("neutral", -1)).toEqual({ empatia: 0, valentia: 0 });
  });
});
