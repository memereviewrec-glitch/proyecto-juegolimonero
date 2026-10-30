export type Branch = "A" | "B";

export type Response = "restart" | Branch;

export const DIALOGUE = [
  {
    prompt: "¿Hay alguien ahí?",
    restart: "Repetir la pregunta",
    a: "Llamar a la sierra",
    b: "Escuchar en silencio",
  },
  {
    prompt: "No veo a nadie. ¿Estoy solo en esta dimensión?",
    restart: "Empezar de nuevo",
    a: "Mirar las ventanas",
    b: "Escuchar el valle",
  },
  {
    prompt: "¿Hago una señal, o dejo que el mundo conteste?",
    restart: "Volver al principio",
    a: "Llamar otra vez",
    b: "Esperar en silencio",
  },
] as const;

export const C_SHARP_MINOR_SCALE = new Set(["Do#", "Re#", "Mi", "Fa#", "Sol#", "La", "Si"]);

export function isValidCSharpMinorChord(noteIds: readonly string[]) {
  const pitchClasses = new Set(noteIds);
  return pitchClasses.size >= 2 && pitchClasses.has("Do#") && [...pitchClasses].every(note => C_SHARP_MINOR_SCALE.has(note));
}

export function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

export function resolveBranch(scoreA: number, scoreB: number): Branch {
  const chanceA = clamp(50 + (scoreA - scoreB) * 12, 14, 86);
  return chanceA > 50 ? "A" : chanceA < 50 ? "B" : Math.random() < 0.5 ? "A" : "B";
}

export function dawnWalkableTop(x: number) {
  const terrain = [[0, 68], [16, 69], [30, 73], [43, 77], [58, 79], [72, 78], [84, 82], [100, 85]] as const;
  for (let index = 1; index < terrain.length; index += 1) {
    const [rightX, rightY] = terrain[index];
    const [leftX, leftY] = terrain[index - 1];
    if (x <= rightX) return leftY + (rightY - leftY) * ((x - leftX) / (rightX - leftX));
  }
  return terrain[terrain.length - 1][1];
}
