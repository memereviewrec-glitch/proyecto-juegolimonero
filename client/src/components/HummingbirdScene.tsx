import { useEffect, useMemo, useState } from "react";
import { createAttemptTaskScope } from "../attemptTaskScope";
import { gameAssetUrl } from "../gameAudio";
import { HUMMINGBIRD_QUESTIONS, VALIANT_COURAGE_POINTS, resolveHummingbirdOutcome, type HummingbirdOutcome } from "./hummingbirdRules";
import "./hummingbird-scene.css";
import { SeedGlyph } from "./SeedGlyph";
import { LemonSprite } from "./GameSprites";

export type { HummingbirdOutcome } from "./hummingbirdRules";
export type HummingbirdPreviewAlternatives = readonly (readonly [string, string])[];

type HummingbirdSceneProps = {
  seedCollected: boolean;
  onCollectSeed: () => void;
  onOutcome?: (outcome: HummingbirdOutcome, valiantResponseCount: number) => void;
  previewAlternatives?: HummingbirdPreviewAlternatives;
};

function outcomeText(outcome: HummingbirdOutcome) {
  if (outcome === "good") return "Gracias por escucharme. Seguiré adelante con un nuevo amigo.";
  if (outcome === "bad") return "Tus palabras pesan más que las cenizas. No puedo quedarme aquí.";
  return "Aún no sé qué hacer. Me quedaré un momento en esta rama para decidir el siguiente paso.";
}

export function HummingbirdScene({ seedCollected, onCollectSeed, onOutcome, previewAlternatives }: HummingbirdSceneProps) {
  const draftAlternatives = import.meta.env.DEV ? previewAlternatives : undefined;
  const attemptTasks = useMemo(() => createAttemptTaskScope(
    (callback, delay) => window.setTimeout(callback, delay),
    id => window.clearTimeout(id),
  ), []);
  useEffect(() => () => attemptTasks.reset(), [attemptTasks]);
  const [mood, setMood] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [outcome, setOutcome] = useState<HummingbirdOutcome | null>(null);
  const [valiantResponseCount, setValiantResponseCount] = useState(0);
  const [entryComplete, setEntryComplete] = useState(false);
  const [exitingScene, setExitingScene] = useState(false);
  const [draftPreviewComplete, setDraftPreviewComplete] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setEntryComplete(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    setMood(0);
    setQuestionIndex(0);
    setOutcome(null);
    setValiantResponseCount(0);
    setDraftPreviewComplete(false);
    setExitingScene(false);
  }, [draftAlternatives]);

  const question = HUMMINGBIRD_QUESTIONS[questionIndex];
  const empathicResponse = question?.options.find(option => option.kind === "empatica")?.text ?? "";
  const visibleOptions = draftAlternatives
    ? [...(draftAlternatives[questionIndex] ?? []), empathicResponse]
    : question?.options.map(option => option.text) ?? [];

  const answer = (optionIndex: number) => {
    if (draftAlternatives) {
      if (draftPreviewComplete || !question) return;
      if (questionIndex === HUMMINGBIRD_QUESTIONS.length - 1) {
        setDraftPreviewComplete(true);
      } else {
        setQuestionIndex(index => index + 1);
      }
      return;
    }
    if (outcome || !question) return;
    const selectedOption = question.options[optionIndex];
    if (!selectedOption) return;
    const nextValiantResponseCount = valiantResponseCount + (selectedOption.kind === "valiente" ? 1 : 0);
    setValiantResponseCount(nextValiantResponseCount);
    const nextMood = Math.max(-100, Math.min(100, mood + selectedOption.moodDelta));
    setMood(nextMood);
    const nextOutcome = resolveHummingbirdOutcome(nextMood, questionIndex === HUMMINGBIRD_QUESTIONS.length - 1);
    if (nextOutcome) {
      setOutcome(nextOutcome);
      onOutcome?.(nextOutcome, nextValiantResponseCount);
      return;
    }
    setQuestionIndex(index => index + 1);
  };

  const continueFromOutcome = () => {
    if (exitingScene) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onCollectSeed();
      return;
    }
    setExitingScene(true);
    attemptTasks.schedule(onCollectSeed, 1800);
  };

  const progress = ((mood + 100) / 200) * 100;
  const moodTone = mood >= 0 ? "positive" : "negative";

  return (
    <div className={`hummingbird-scene-shell hummingbird-${outcome ?? "conversation"}${draftAlternatives ? " hummingbird-draft-preview" : ""}${draftPreviewComplete ? " hummingbird-draft-preview-complete" : ""}${!entryComplete && !outcome ? " hummingbird-entering" : ""}${exitingScene ? " hummingbird-exiting" : ""}`}>
      <div className="scene-stage game-screen hummingbird-stage">
        <div className="hummingbird-sky" aria-hidden="true" />
        <picture className="hummingbird-sprite">
          <source media="(prefers-reduced-motion: reduce)" srcSet={gameAssetUrl("/colibri-still.png")} />
          <img src={gameAssetUrl("/colibri.gif")} alt="Colibrí" />
        </picture>
        <div className="hummingbird-lemon" aria-hidden="true"><LemonSprite /></div>
        {draftAlternatives
          ? <div className="hummingbird-preview-badge" aria-hidden="true">VISTA DE DESARROLLO · BORRADOR · SIN PUNTUACIÓN</div>
          : <div className="hummingbird-meter" aria-label={`Ánimo del colibrí: ${mood} de 100`}>
              <div className="hummingbird-meter-heading"><strong>{mood > 0 ? "+" : ""}{mood}</strong></div>
              <div className="hummingbird-meter-track"><span className={moodTone} style={{ width: `${progress}%` }} /><i /></div>
              <div className="hummingbird-meter-labels"><span>−100</span><span>0</span><span>+100</span></div>
            </div>}
      </div>
      <div className="hummingbird-dialogue" role="status" aria-live="polite">
        {draftAlternatives && draftPreviewComplete ? (
          <>
            <span>FIN DE LA VISTA PREVIA · SIN PUNTUACIÓN</span>
            <p>Has recorrido los seis diálogos del borrador. No se ha calculado un desenlace, entregado una semilla ni guardado ningún cambio.</p>
            <button type="button" className="hummingbird-preview-restart" onClick={() => { setQuestionIndex(0); setDraftPreviewComplete(false); }}>Repetir vista previa</button>
          </>
        ) : outcome ? (
          <>
            <span>{outcome === "good" ? "AMISTAD" : outcome === "bad" ? "DESPEDIDA" : "DUDA"}</span>
            <p>{outcomeText(outcome)}</p>
            <p className="hummingbird-reward-copy">El colibrí te entrega una semilla para continuar el viaje.</p>
            {outcome === "good" && <p className="hummingbird-reward-copy">Empatía +10: el Colibrí acompaña a Limón.</p>}
            {valiantResponseCount > 0 && <p className="hummingbird-reward-copy">Valentía +{valiantResponseCount * VALIANT_COURAGE_POINTS} por {valiantResponseCount} {valiantResponseCount === 1 ? "respuesta valiente" : "respuestas valientes"}.</p>}
            {seedCollected && <small>El desenlace más reciente queda guardado en el Libro de Semillas.</small>}
            <button type="button" className="hummingbird-seed-button" onClick={continueFromOutcome} disabled={exitingScene} aria-label={seedCollected ? "Continuar, salir de la escena y volver al Libro de Semillas" : "Continuar, salir de la escena y recoger la semilla entregada por el colibrí"}><SeedGlyph seed="ponzona" /><b>{exitingScene ? "saliendo de la escena…" : "Continuar"}</b></button>
          </>
        ) : (
          <>
            <span>{draftAlternatives ? `BORRADOR · SIN PUNTUACIÓN · ${questionIndex + 1}/${HUMMINGBIRD_QUESTIONS.length}` : `COLIBRÍ · ${questionIndex + 1}/${HUMMINGBIRD_QUESTIONS.length}`}</span>
            <p>{question?.prompt}</p>
            <div className="hummingbird-options">
              {visibleOptions.map((option, index) => <button type="button" key={option} className={draftAlternatives ? "hummingbird-preview-option" : undefined} onClick={() => answer(index)}>{draftAlternatives ? <small>{index < 2 ? "Alternativa propuesta" : "Respuesta empática actual"}</small> : <b>{String.fromCharCode(65 + index)}</b>}{option}</button>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
