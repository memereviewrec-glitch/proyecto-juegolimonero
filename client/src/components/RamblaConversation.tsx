import { useEffect, useState } from "react";
import { RAMBLA_CONVERSATION, type RamblaChoice } from "./ramblaConversationRules";
import "./rambla-conversation.css";

const ROLL_CYCLE_MS = 2400;
const SAFE_ZONE_START = 43;
const SAFE_ZONE_END = 67;
const MAX_FAILED_ATTEMPTS = 3;

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reducedMotion;
}

type RamblaConversationProps = {
  step: number;
  onChoose: (choice: RamblaChoice) => void;
};

export function RamblaConversation({ step, onChoose }: RamblaConversationProps) {
  const turn = RAMBLA_CONVERSATION[step];
  if (!turn) return null;

  return (
    <div className="rambla-overlay">
      <section className="rambla-panel rambla-dialogue-panel" role="group" aria-labelledby="rambla-dialogue-title">
        <div className="rambla-panel-kicker">
          <span>RAMBLA · CONVERSACIÓN</span>
          <span>PASO {String(step + 1).padStart(2, "0")} / 03</span>
        </div>
        <h3 id="rambla-dialogue-title">{turn.npc}</h3>
        <p className="rambla-dialogue-line" role="status" aria-live="polite">{turn.dialogue}</p>
        <div className="rambla-choice-list" role="group" aria-label="Elige cómo responder">
          {turn.choices.map((choice, index) => (
            <button
              key={`${step}-${choice.path}-${index}`}
              className="rambla-choice-button"
              type="button"
              autoFocus={index === 0}
              onClick={() => onChoose(choice)}
            >
              <span className="rambla-choice-marker" aria-hidden="true">{String.fromCharCode(65 + index)}</span>
              <span>{choice.label}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

type RamblaAttackWarningProps = {
  ready: boolean;
  onStart: () => void;
};

export function RamblaAttackWarning({ ready, onStart }: RamblaAttackWarningProps) {
  return (
    <div className="rambla-overlay">
      <section className="rambla-panel rambla-warning-panel" role="group" aria-labelledby="rambla-warning-title">
        <div className="rambla-panel-kicker">
          <span>FINAL 2 · EL SACRIFICIO CÍTRICO</span>
          <span>LA NOCHE SE CIERRA</span>
        </div>
        <h3 id="rambla-warning-title">La secta se prepara para atacar</h3>
        <p className="rambla-dialogue-line" role="status" aria-live="polite">
          Los encapuchados se abalanzan sobre el protagonista. «¡Alimenta la hoguera!». El limón debe rodar cuesta abajo para escapar.
        </p>
        {ready && (
          <button className="rambla-roll-button rambla-warning-action" type="button" onClick={onStart}>
            Prepararse para rodar
          </button>
        )}
      </section>
    </div>
  );
}

type RamblaSkillCheckProps = {
  failedAttempts: number;
  onAttempt: (success: boolean) => void;
  onRetry: () => void;
};

export function RamblaSkillCheck({ failedAttempts, onAttempt, onRetry }: RamblaSkillCheckProps) {
  const reducedMotion = usePrefersReducedMotion();
  const [position, setPosition] = useState(0);

  useEffect(() => {
    if (reducedMotion || failedAttempts >= MAX_FAILED_ATTEMPTS) return;

    let startTime: number | null = null;
    let lastUpdate = 0;
    let frameId = 0;
    const update = (time: number) => {
      if (startTime === null) startTime = time;
      if (time - lastUpdate >= 32) {
        const phase = ((time - startTime) % ROLL_CYCLE_MS) / ROLL_CYCLE_MS;
        const progress = phase < 0.5 ? phase * 2 : (1 - phase) * 2;
        setPosition(progress * 100);
        lastUpdate = time;
      }
      frameId = window.requestAnimationFrame(update);
    };

    frameId = window.requestAnimationFrame(update);
    return () => window.cancelAnimationFrame(frameId);
  }, [failedAttempts, reducedMotion]);

  const attemptsUsed = Math.min(failedAttempts, MAX_FAILED_ATTEMPTS);
  const handleRoll = () => {
    if (attemptsUsed >= MAX_FAILED_ATTEMPTS) return;
    onAttempt(position >= SAFE_ZONE_START && position <= SAFE_ZONE_END);
  };

  return (
    <div className="rambla-overlay">
      <section className="rambla-panel rambla-roll-panel" role="group" aria-labelledby="rambla-roll-title">
        <div className="rambla-panel-kicker">
          <span>FINAL 2 · TIRADA DE HABILIDAD</span>
          <span>{attemptsUsed} / {MAX_FAILED_ATTEMPTS} FALLOS</span>
        </div>
        <h3 id="rambla-roll-title">El Sacrificio Cítrico</h3>
        <p className="rambla-dialogue-line" role="status" aria-live="polite">
          Los encapuchados gritan «¡Alimenta la hoguera!». Rueda colina abajo y evita que te expriman.
        </p>

        {attemptsUsed >= MAX_FAILED_ATTEMPTS ? (
          <>
            <p className="rambla-roll-instruction" role="status">Te alcanzan antes de la bajada, pero aún puedes intentarlo otra vez.</p>
            <button className="rambla-roll-button" type="button" onClick={onRetry}>Reintentar la tirada</button>
          </>
        ) : (
          <>
            <p className="rambla-roll-instruction">
              {reducedMotion
                ? "Ajusta el control hasta la franja verde y pulsa «¡Rodar!»"
                : "Pulsa «¡Rodar!» cuando el indicador cruce la franja verde."}
            </p>
            <div className="rambla-roll-meter" role="img" aria-label="Medidor de reflejos con una franja verde segura">
              <span className="rambla-roll-safe-zone" aria-hidden="true" />
              <span className="rambla-roll-marker" aria-hidden="true" style={{ left: `${position}%` }} />
            </div>
            {reducedMotion && (
              <label className="rambla-manual-control">
                <span>Control manual del giro</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={position}
                  aria-label="Ajustar la posición del limón en el medidor"
                  onChange={event => setPosition(Number(event.currentTarget.value))}
                />
              </label>
            )}
            <button className="rambla-roll-button" type="button" onClick={handleRoll}>¡RODAR!</button>
            <p className="rambla-roll-feedback" role="status" aria-live="polite">
              {attemptsUsed === 0
                ? "Un destello marca el momento justo."
                : `La rueda patina: ${attemptsUsed} de ${MAX_FAILED_ATTEMPTS} intentos usados.`}
            </p>
          </>
        )}
      </section>
    </div>
  );
}
