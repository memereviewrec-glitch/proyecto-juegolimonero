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
type Speaker = "EL LIMÓN" | "EL CIELO" | "EL COLIBRÍ";

type AwakeningStar = {
  x: number;
  y: number;
  size: number;
  reflection: string;
};

const AWAKENING_STARS: readonly AwakeningStar[] = [
  { x: 12, y: 20, size: 8, reflection: "El silencio también tiene un pulso, aunque todavía no sepa nombrarlo." },
  { x: 27, y: 31, size: 6, reflection: "Una luz lejana me recuerda que percibir también es esperar." },
  { x: 43, y: 14, size: 10, reflection: "Cada destello deja una huella distinta sobre mi cáscara." },
  { x: 63, y: 24, size: 7, reflection: "La noche no está vacía: respira entre una estrella y otra." },
  { x: 82, y: 18, size: 9, reflection: "Veo la luz antes de comprender el camino que dibuja." },
  { x: 91, y: 43, size: 6, reflection: "El cielo parece inmenso, pero un destello cabe en un instante." },
  { x: 18, y: 68, size: 7, reflection: "La luz vuelve distinta cuando dejo de perseguirla." },
  { x: 46, y: 57, size: 9, reflection: "Mi pulpa reconoce un ritmo antes de entenderlo." },
  { x: 75, y: 70, size: 8, reflection: "Nueve luces, nueve maneras de sentir la misma noche." },
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
  yellow: { x: 50, y: 58 },
};

const HINTS = [
  "El aleteo rápido del colibrí no teme al tiempo; compara cuánto tarda cada destello en volver a encenderse.",
  "Busca primero el pulso que regresa sin demora. Deja para el final al que duerme más entre un brillo y otro.",
  "No midas la fuerza de la luz, sino el espacio entre sus latidos: el más breve abre el camino y el más largo lo cierra.",
] as const;

const OPENING_HINT = "Cada estrella guarda un pulso. Observa sus destellos; cuando las nueve hayan despertado, el cielo planteará su pregunta.";
const MOON_HINT = "Las cuatro luces ya comparten un mismo compás. La luna blanca guarda la semilla que conduce al último canto.";

export function NueveSentidosScene({ seedCollected, onCollectSeed, hummingbirdIsFriend }: Props) {
  const [phase, setPhase] = useState<Phase>("awakening");
  const [awakenedStars, setAwakenedStars] = useState<number[]>([]);
  const [patternIndex, setPatternIndex] = useState(0);
  const [selectedColors, setSelectedColors] = useState<RhythmColor[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [moonTouched, setMoonTouched] = useState(false);
  const [dialogue, setDialogue] = useState("Nueve luces esperan bajo la noche. Toca cada una y observa cómo despierta su brillo.");
  const [speaker, setSpeaker] = useState<Speaker>("EL CIELO");

  const activePattern = RHYTHM_PATTERNS[patternIndex];
  const pathUnlocked = seedCollected || moonTouched;

  function awakenStar(index: number) {
    if (phase !== "awakening") return;
    const star = AWAKENING_STARS[index];
    if (!star) return;
    if (awakenedStars.includes(index)) {
      setSpeaker("EL LIMÓN");
      setDialogue(star.reflection);
      return;
    }
    const next = [...awakenedStars, index];
    setAwakenedStars(next);
    if (next.length === AWAKENING_STARS.length) {
      setPhase("rhythm");
      setSpeaker("EL CIELO");
      setDialogue("Las nueve luces despiertan cuatro pulsos. Ordénalos desde el destello más rápido hasta el más lento.");
      return;
    }
    setSpeaker("EL LIMÓN");
    setDialogue(star.reflection);
  }

  function chooseRhythmStar(color: RhythmColor) {
    if (phase !== "rhythm" || selectedColors.includes(color)) return;
    const transition = applyRhythmPick(patternIndex, selectedColors, color);
    if (transition.result === "wrong") {
      setMistakes(count => count + 1);
      setPatternIndex(transition.patternIndex);
      setSelectedColors(transition.selectedColors);
      setSpeaker("EL CIELO");
      setDialogue("El orden se deshace. Las cuatro estrellas cambian por completo su compás; vuelve a observarlas.");
      return;
    }

    const next = transition.selectedColors;
    setSelectedColors(next);
    if (transition.result === "complete") {
      setPhase("moon");
      setSpeaker("EL CIELO");
      setDialogue("Los cuatro pulsos se encuentran. Una luna blanca emerge sobre el firmamento.");
      return;
    }

    setSpeaker("EL LIMÓN");
    setDialogue(next.length < 3
      ? "Ese latido encuentra su lugar. Escuchemos cuál vuelve después."
      : "Tres pulsos ya se reconocen; falta el que tarda más en regresar.");
  }

  function askForHint() {
    setSpeaker("EL COLIBRÍ");
    if (phase === "awakening") {
      setDialogue(OPENING_HINT);
      return;
    }
    if (phase === "moon") {
      setDialogue(seedCollected ? "La semilla ya descansa en el Libro. El sendero hacia El Jaguar está abierto." : MOON_HINT);
      return;
    }
    const hint = HINTS[Math.min(mistakes, HINTS.length - 1)];
    setDialogue(hint);
  }

  function touchMoon() {
    if (phase !== "moon") return;
    setSpeaker("EL LIMÓN");
    if (seedCollected || moonTouched) {
      setDialogue("La semilla lunar ya reposa en el Libro. Una senda de estrellas conduce hacia El Jaguar.");
      return;
    }
    setMoonTouched(true);
    playFrequencies([523.25, 659.25]);
    setDialogue("La luna entrega la semilla de Nueve Sentidos. El camino hacia El Jaguar queda iluminado.");
    onCollectSeed();
  }

  const phaseNumber = phase === "awakening" ? "01 / 03" : phase === "rhythm" ? "02 / 03" : "03 / 03";
  const phaseTitle = phase === "awakening" ? "EL DESPERTAR DEL CIELO" : phase === "rhythm" ? "EL RITMO DE LAS CUATRO ESTRELLAS" : "LA LUNA BLANCA";
  const instruction = phase === "awakening"
    ? `Toca las nueve estrellas para despertar sus destellos · ${awakenedStars.length}/9`
    : phase === "rhythm"
      ? "Observa sus destellos y actívalas de la más rápida a la más lenta."
      : seedCollected
        ? "La semilla está en el Libro. El camino hacia El Jaguar se ha abierto."
        : "Pulsa la luna blanca para recoger la semilla final.";

  return (
    <div className="scene-stage game-screen nueve-sentidos-stage" role="group" aria-label="Nueve Sentidos: acertijo nocturno en tres fases">
      <div className="nueve-sentidos-sky" data-phase={phase} aria-hidden="true">
        <div className="nueve-sentidos-nebula" />
        <div className={`nueve-jaguar-trail${phase === "moon" && pathUnlocked ? " is-unlocked" : ""}`} />
        <span className="stage-coordinate">LF · 10</span>
      </div>

      <header className="nueve-phase-card" aria-live="polite">
        <span className="nueve-phase-count">{phaseNumber}</span>
        <h3>{phaseTitle}</h3>
        <p>{instruction}</p>
        {phase === "rhythm" && mistakes > 0 && <small className="nueve-mistake-count">El cielo ha cambiado de ritmo · {mistakes} {mistakes === 1 ? "intento" : "intentos"}</small>}
      </header>

      {phase === "awakening" && AWAKENING_STARS.map((star, index) => (
        <button
          key={index}
          type="button"
          className={`nueve-awakening-star${awakenedStars.includes(index) ? " is-awake" : ""}`}
          style={{ left: `${star.x}%`, top: `${star.y}%`, "--star-size": `${star.size}px` } as CSSProperties}
          aria-label={`Estrella ${index + 1} de 9${awakenedStars.includes(index) ? ", destello despierto" : ", pulsar para despertar su destello"}`}
          aria-pressed={awakenedStars.includes(index)}
          onClick={() => awakenStar(index)}
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
            <span className="nueve-rhythm-color-label">{RHYTHM_LABELS[color]}</span>
            {selectedIndex >= 0 && <span className="nueve-rhythm-order" aria-hidden="true">{selectedIndex + 1}</span>}
            <span className="nueve-rhythm-speed-note" aria-hidden="true">{(pulseMs / 1000).toFixed(2)} s</span>
          </button>
        );
      })}

      {phase === "moon" && (
        <button
          type="button"
          className={`nueve-white-moon${pathUnlocked ? " is-collected" : ""}`}
          onClick={touchMoon}
          aria-label={seedCollected ? "Semilla lunar recogida; camino hacia El Jaguar abierto" : "Tocar la luna blanca y recoger la semilla de Nueve Sentidos"}
          aria-pressed={seedCollected || moonTouched}
        >
          <span className="nueve-moon-disc" aria-hidden="true" />
          {pathUnlocked && <SeedGlyph seed="nueve-sentidos" className="nueve-moon-seed" />}
          <span className="nueve-moon-label">{pathUnlocked ? "SEMILLA" : "LUNA"}</span>
        </button>
      )}

      <div className="nueve-lemon" aria-hidden="true"><LemonSprite /></div>
      <div className="nueve-dialogue" role="status" aria-live="polite" aria-atomic="true">
        <div className="nueve-dialogue-copy">
          <span className="nueve-speaker">{speaker}</span>
          <p>{dialogue}</p>
        </div>
        {hummingbirdIsFriend && <button className="nueve-hint-button" type="button" onClick={askForHint} aria-label="Pedir una pista poética al colibrí">
          <img src={gameAssetUrl("/colibri.gif")} alt="" aria-hidden="true" />
          <span>PISTA</span>
        </button>}
      </div>
    </div>
  );
}
