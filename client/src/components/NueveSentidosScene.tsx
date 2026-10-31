import { useState, type CSSProperties } from "react";
import { gameAssetUrl, playFrequencies } from "../gameAudio";
import { LemonSprite } from "./GameSprites";
import { SeedGlyph } from "./SeedGlyph";
import { applyRhythmPick, RHYTHM_COLORS, RHYTHM_PATTERNS, type RhythmColor } from "./nueveSentidosRules";
import "./nueve-sentidos-scene.css";

type Props = {
  seedCollected: boolean;
  onCollectSeed: () => void;
  hummingbirdIsFriend: boolean;
};

type Phase = "awakening" | "rhythm" | "moon";
type SeedDropState = "idle" | "dropping" | "landed";

type AwakeningStar = {
  x: number;
  y: number;
  size: number;
};

const AWAKENING_STARS: readonly AwakeningStar[] = [
  // Dispersas de forma irregular por la franja libre entre la cabecera y el diálogo.
  { x: 28, y: 30, size: 8 },
  { x: 63, y: 29, size: 6 },
  { x: 88, y: 36, size: 10 },
  { x: 43, y: 44, size: 7 },
  { x: 66, y: 50, size: 9 },
  { x: 24, y: 54, size: 6 },
  { x: 87, y: 54, size: 8 },
];

const RHYTHM_LABELS: Record<RhythmColor, string> = {
  red: "ROJA",
  green: "VERDE",
  blue: "AZUL",
  yellow: "AMARILLA",
};

const RHYTHM_POSITIONS: Record<RhythmColor, { x: number; y: number }> = {
  red: { x: 22, y: 39 },
  green: { x: 50, y: 33 },
  blue: { x: 78, y: 40 },
  yellow: { x: 50, y: 54 },
};

const RHYTHM_HINTS = [
  "El pulso más lento deja el silencio más largo entre dos destellos; el más veloz apenas roza la noche.",
  "La luz que demora abre la danza; la que regresa en un suspiro la despide.",
  "Cuatro corazones cruzan el cielo, desde la larga espera hasta el regreso fugaz.",
] as const;

const AWAKENING_HINT = "Siete luces velan en silencio; cada destello que descansa deja sitio para una nueva melodía.";
const MOON_HINT = "La luna blanca guarda una semilla dormida; cuando la alcanzan las estrellas, cae como rocío.";

export function NueveSentidosScene({ seedCollected, onCollectSeed, hummingbirdIsFriend }: Props) {
  const [phase, setPhase] = useState<Phase>("awakening");
  const [extinguishedStars, setExtinguishedStars] = useState<number[]>([]);
  const [patternIndex, setPatternIndex] = useState(0);
  const [selectedColors, setSelectedColors] = useState<RhythmColor[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [moonTouched, setMoonTouched] = useState(false);
  const [moonDialogueStep, setMoonDialogueStep] = useState(0);
  const [hintVisible, setHintVisible] = useState(false);
  const [activeHint, setActiveHint] = useState("");
  const [seedDropState, setSeedDropState] = useState<SeedDropState>(() => seedCollected ? "landed" : "idle");

  const activePattern = RHYTHM_PATTERNS[patternIndex];
  const pathUnlocked = seedCollected || seedDropState === "landed";

  function extinguishStar(index: number) {
    if (phase !== "awakening") return;
    if (!AWAKENING_STARS[index] || extinguishedStars.includes(index)) return;
    setHintVisible(false);
    const next = [...extinguishedStars, index];
    setExtinguishedStars(next);
    if (next.length === AWAKENING_STARS.length) setPhase("rhythm");
  }

  function chooseRhythmStar(color: RhythmColor) {
    if (phase !== "rhythm" || selectedColors.includes(color)) return;
    setHintVisible(false);
    const transition = applyRhythmPick(patternIndex, selectedColors, color);
    if (transition.result === "wrong") {
      setMistakes(count => count + 1);
      setPatternIndex(transition.patternIndex);
      setSelectedColors(transition.selectedColors);
      return;
    }

    setSelectedColors(transition.selectedColors);
    if (transition.result === "complete") setPhase("moon");
  }

  function askForHint() {
    if (hintVisible) {
      setHintVisible(false);
      return;
    }

    const hint = phase === "awakening"
      ? AWAKENING_HINT
      : phase === "moon"
        ? seedCollected
          ? "La semilla lunar ya descansa en el Libro; su luz señala el camino hacia El Jaguar."
          : MOON_HINT
        : RHYTHM_HINTS[Math.min(mistakes, RHYTHM_HINTS.length - 1)];
    setActiveHint(hint);
    setHintVisible(true);
  }

  function touchMoon() {
    if (phase !== "moon") return;
    if (moonDialogueStep < 2) return;
    setHintVisible(false);
    if (seedCollected || moonTouched || seedDropState !== "idle") return;
    setMoonTouched(true);
    setSeedDropState("dropping");
    playFrequencies([523.25, 659.25]);
  }

  function finishSeedDrop() {
    if (seedDropState !== "dropping") return;
    setSeedDropState("landed");
    onCollectSeed();
  }

  return (
    <div className="scene-stage game-screen nueve-sentidos-stage" role="group" aria-label="Nueve Sentidos: cielo nocturno interactivo en tres fases">
      <div className="nueve-sentidos-sky" data-phase={phase} aria-hidden="true">
        <img className="nueve-sentidos-milky-way" src={gameAssetUrl("/nueve-sentidos-milky-way.webp")} alt="" />
        <span className="stage-coordinate">LF · 10</span>
      </div>

      {phase === "awakening" && AWAKENING_STARS.map((star, index) => (
        <button
          key={index}
          type="button"
          className={`nueve-awakening-star${extinguishedStars.includes(index) ? " is-extinguished" : ""}`}
          style={{ left: `${star.x}%`, top: `${star.y}%`, "--star-size": `${star.size}px` } as CSSProperties}
          aria-label={`Estrella ${index + 1} de ${AWAKENING_STARS.length}${extinguishedStars.includes(index) ? ", apagada" : ", pulsar para apagar su brillo"}`}
          aria-pressed={extinguishedStars.includes(index)}
          disabled={extinguishedStars.includes(index)}
          onClick={() => extinguishStar(index)}
        >
          <img className="nueve-star-gif nueve-awakening-gif" src={gameAssetUrl("/star-pulses/awakening-white.gif")} alt="" aria-hidden="true" />
          <span className="nueve-awakening-static-glyph" aria-hidden="true" />
        </button>
      ))}

      {phase === "rhythm" && RHYTHM_COLORS.map(color => {
        const position = RHYTHM_POSITIONS[color];
        const pulseMs = activePattern[color];
        const selectedIndex = selectedColors.indexOf(color);
        return (
          <button
            key={`${patternIndex}-${color}`}
            type="button"
            className={`nueve-rhythm-star nueve-rhythm-star-${color}${selectedIndex >= 0 ? " is-selected" : ""}`}
            style={{ left: `${position.x}%`, top: `${position.y}%` } as CSSProperties}
            aria-label={`Estrella ${RHYTHM_LABELS[color].toLowerCase()}, su pulso vuelve cada ${(pulseMs / 1000).toFixed(2)} segundos${selectedIndex >= 0 ? `, apagada, posición ${selectedIndex + 1}` : ""}`}
            aria-pressed={selectedIndex >= 0}
            disabled={selectedIndex >= 0}
            onClick={() => chooseRhythmStar(color)}
          >
            <img className="nueve-star-gif nueve-rhythm-gif" src={gameAssetUrl(`/star-pulses/60bpm/${color}-${pulseMs}.gif`)} alt="" aria-hidden="true" />
            <span className="nueve-rhythm-static-glyph" aria-hidden="true" />
            {selectedIndex >= 0 && <span className="nueve-rhythm-order" aria-hidden="true">{selectedIndex + 1}</span>}
          </button>
        );
      })}

      {phase === "moon" && (
        <button
          type="button"
          className={`nueve-white-moon${pathUnlocked ? " is-collected" : ""}`}
          onClick={touchMoon}
          aria-label={pathUnlocked ? "Semilla lunar recogida; camino hacia El Jaguar abierto" : "Tocar la luna blanca"}
          aria-pressed={seedCollected || moonTouched}
        >
          <span className="nueve-moon-disc" aria-hidden="true" />
        </button>
      )}

      {phase === "moon" && moonDialogueStep < 2 && (
        <div className="nueve-moon-dialogue" role="status" aria-live="polite">
          <p>{moonDialogueStep === 0
            ? "Yo soy la roca que se mueve en el vacío."
            : "Ahora conocerás a las fuerzas ocultas que dibujan nuestras órbitas"}</p>
          <button type="button" onClick={() => setMoonDialogueStep(step => step + 1)}>
            {moonDialogueStep === 0 ? "Siguiente" : "Continuar"}
          </button>
        </div>
      )}

      {phase === "moon" && seedDropState !== "idle" && (
        <div
          className={`nueve-seed-drop${seedDropState === "dropping" ? " is-dropping" : " is-landed"}`}
          aria-hidden="true"
          onAnimationEnd={event => {
            if (event.target === event.currentTarget) finishSeedDrop();
          }}
        >
          <SeedGlyph seed="nueve-sentidos" className="nueve-seed-drop-glyph" />
        </div>
      )}

      {hummingbirdIsFriend && (
        <>
          {hintVisible && (
            <div id="nueve-colibri-hint" className="nueve-hint-popover" role="status" aria-live="polite">
              {activeHint}
            </div>
          )}
          <button
            className={`nueve-hint-button${hintVisible ? " is-active" : ""}`}
            type="button"
            onClick={askForHint}
            aria-controls="nueve-colibri-hint"
            aria-expanded={hintVisible}
            aria-label={hintVisible ? "Ocultar la pista poética del colibrí" : "Pedir una pista poética al colibrí"}
          >
            <img src={gameAssetUrl("/colibri.gif")} alt="" aria-hidden="true" />
          </button>
        </>
      )}

      <div className="nueve-lemon" aria-hidden="true"><LemonSprite /></div>
    </div>
  );
}
