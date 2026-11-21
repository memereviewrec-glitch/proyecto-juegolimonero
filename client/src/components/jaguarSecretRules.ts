export const SECRET_QUESTION = "Crees que limón sigue durmiendo, pero... ¿Cómo podríamos saberlo? Al fin y al cabo, ¿cómo puede un limón despertar?";
export const SECRET_SLEEPING_TEXT = "Partir, partir, partir a lo alto, partir a lo más alto, despertar, así sea. No hay ignorancia, ni fin de la ignorancia. No hay vejez y muerte, ni fin de la vejez y muerte. No hay sufrimiento, ni origen, ni cesación, ni camino. No hay sabiduría, ni logro, ni no-logro";
export const SECRET_TREE_INSCRIPTION = "como es arriba, así es abajo";

export type SecretScreen = "question" | "sleep-interlude" | "fall-interlude" | "tree" | "cave-offer" | "owl" | "maze" | "canopy-entry" | "riddle" | "riddle-fail" | "riddle-solved" | "final-image" | "surface";
export type SecretScreenAction = "wake" | "continue-fall" | "stay-asleep" | "continue-sleep" | "touch-cave" | "enter-cave" | "leave-cave" | "escape-maze" | "meet-owl" | "return-to-door";

export function advanceSecretScreen(screen: SecretScreen, action: SecretScreenAction): SecretScreen {
  if (screen === "question" && action === "wake") return "fall-interlude";
  if (screen === "fall-interlude" && action === "continue-fall") return "tree";
  if (screen === "question" && action === "stay-asleep") return "sleep-interlude";
  if (screen === "sleep-interlude" && action === "continue-sleep") return "owl";
  if (screen === "tree" && action === "touch-cave") return "cave-offer";
  if (screen === "cave-offer" && action === "enter-cave") return "maze";
  if (screen === "cave-offer" && action === "leave-cave") return "tree";
  if (screen === "maze" && action === "escape-maze") return "canopy-entry";
  if (screen === "canopy-entry" && action === "meet-owl") return "riddle";
  if (screen === "riddle" && action === "return-to-door") return "riddle-fail";
  if (screen === "riddle-fail" && action === "return-to-door") return "tree";
  return screen;
}

/** Posición normalizada en el PNG del laberinto: x/y en porcentaje de la imagen. */
export type SecretMazePosition = { x: number; y: number };
export type SecretMazeDirection = "up" | "down" | "left" | "right";
export type SecretMazeMask = { width: number; height: number; alpha: Uint8Array };
export type SecretMazeMove = { position: SecretMazePosition; escaped: boolean; blocked: boolean };

// Limón comienza fuera del perímetro sudeste y entra por la abertura inferior derecha.
export const SECRET_MAZE_START: SecretMazePosition = { x: 92, y: 62 };
export const SECRET_MAZE_CENTER: SecretMazePosition = { x: 50, y: 50 };
export const SECRET_MAZE_WALL_ALPHA = 80;
const MOVE_DISTANCE = 1.15;
const MOVE_SAMPLE_DISTANCE = 0.12;
const WALL_CLEARANCE_PX = 4;

function imagePixel(position: SecretMazePosition, mask: SecretMazeMask): { x: number; y: number } {
  return {
    x: Math.round(position.x / 100 * (mask.width - 1)),
    y: Math.round(position.y / 100 * (mask.height - 1)),
  };
}

export function canOccupyMazePosition(position: SecretMazePosition, mask: SecretMazeMask, clearancePx = WALL_CLEARANCE_PX): boolean {
  if (position.x < 0 || position.x > 100 || position.y < 0 || position.y > 100) return false;
  const pixel = imagePixel(position, mask);
  const radius = Math.max(0, Math.ceil(clearancePx));
  for (let y = pixel.y - radius; y <= pixel.y + radius; y++) {
    for (let x = pixel.x - radius; x <= pixel.x + radius; x++) {
      if (x < 0 || x >= mask.width || y < 0 || y >= mask.height) return false;
      if (mask.alpha[y * mask.width + x]! >= SECRET_MAZE_WALL_ALPHA) return false;
    }
  }
  return true;
}

export function hasReachedMazeCenter(position: SecretMazePosition, tolerance = 2.2): boolean {
  return Math.hypot(position.x - SECRET_MAZE_CENTER.x, position.y - SECRET_MAZE_CENTER.y) <= tolerance;
}

export function moveSecretLemon(position: SecretMazePosition, direction: SecretMazeDirection, mask: SecretMazeMask): SecretMazeMove {
  const delta: Record<SecretMazeDirection, SecretMazePosition> = {
    up: { x: 0, y: -MOVE_DISTANCE },
    down: { x: 0, y: MOVE_DISTANCE },
    left: { x: -MOVE_DISTANCE, y: 0 },
    right: { x: MOVE_DISTANCE, y: 0 },
  };
  const offset = delta[direction];
  const steps = Math.ceil(MOVE_DISTANCE / MOVE_SAMPLE_DISTANCE);
  let next = position;
  for (let step = 1; step <= steps; step++) {
    const progress = Math.min(step * MOVE_SAMPLE_DISTANCE, MOVE_DISTANCE);
    const candidate = { x: position.x + offset.x * progress, y: position.y + offset.y * progress };
    if (!canOccupyMazePosition(candidate, mask)) {
      return { position: next, escaped: hasReachedMazeCenter(next), blocked: next === position };
    }
    next = candidate;
    if (hasReachedMazeCenter(next)) return { position: next, escaped: true, blocked: false };
  }
  return { position: next, escaped: hasReachedMazeCenter(next), blocked: false };
}
