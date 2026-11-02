import { useEffect, useState } from "react";
import { gameAssetUrl } from "../gameAudio";
import { SeedGlyph } from "./SeedGlyph";
import "./fire-forest-scene.css";

type FireForestSceneProps = {
  seedCollected: boolean;
  onCollectSeed: () => void;
};

type FireForestNarrativeStep = 0 | 1 | 2 | 3 | 4;

const FIRE_FOREST_BACKGROUND = "/fire-forest-burning-frames.png";

export function FireForestScene({ seedCollected, onCollectSeed }: FireForestSceneProps) {
  const [rainStarted, setRainStarted] = useState(false);
  const [fireOut, setFireOut] = useState(false);
  const [narrativeStep, setNarrativeStep] = useState<FireForestNarrativeStep>(0);
  const [postFireDialogueDismissed, setPostFireDialogueDismissed] = useState(false);
  const [backgroundReady, setBackgroundReady] = useState(false);
  const [backgroundFallback, setBackgroundFallback] = useState(false);

  useEffect(() => {
    let active = true;
    let settled = false;
    const background = new Image();
    const finishLoading = (loaded: boolean) => {
      if (settled) return;
      settled = true;
      if (!active) return;
      setBackgroundFallback(!loaded);
      setBackgroundReady(true);
    };

    background.onload = () => finishLoading(true);
    background.onerror = () => finishLoading(false);
    background.src = gameAssetUrl(FIRE_FOREST_BACKGROUND);
    if (background.complete) finishLoading(background.naturalWidth > 0);

    return () => {
      active = false;
      background.onload = null;
      background.onerror = null;
    };
  }, []);

  function continueNarrative() {
    if (!backgroundReady || fireOut) return;
    if (narrativeStep === 4) {
      setFireOut(true);
      return;
    }
    const nextStep = (narrativeStep + 1) as FireForestNarrativeStep;
    setNarrativeStep(nextStep);
    if (nextStep === 3) setRainStarted(true);
  }

  return (
    <div className={`scene-stage game-screen fire-forest-stage ${backgroundReady ? "fire-background-ready" : ""} ${backgroundFallback ? "fire-background-fallback" : ""} ${rainStarted ? "fire-rain-started" : ""} ${fireOut ? "fire-is-out" : ""}`} aria-busy={!backgroundReady}>
      <div className="fire-forest-world" role="img" aria-label="Un bosque en llamas que la lluvia apaga poco a poco">
        <div className="fire-forest-moon" aria-hidden="true" />
        <div className="fire-forest-rain" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
        {fireOut && !seedCollected && <button type="button" className="burnt-seed" onClick={onCollectSeed} aria-label="Recoger la semilla negra quemada y abrir El fuego en el Libro de Semillas">
          <SeedGlyph seed="el-fuego" />
        </button>}
        {fireOut && seedCollected && <div className="burnt-seed-collected" aria-label="Semilla quemada añadida al Libro"><SeedGlyph seed="el-fuego" /><span>semilla recogida</span></div>}
        {backgroundReady && <div className="river-coordinate">LF · 08</div>}
      </div>
      {backgroundReady && <>
        {!fireOut && <div className="fire-forest-dialogue" role="status" aria-live="polite">
          {narrativeStep === 0 && <><span>LOS ANIMALES</span><p>Los animales intentaban llevar agua del río al bosque para apagar el incendio.</p></>}
          {narrativeStep === 1 && <><span>LOS ANIMALES</span><p>Pero no lo conseguían. El agua se perdía entre las raíces y la ceniza antes de llegar.</p></>}
          {narrativeStep === 2 && <><span>EL JAGUAR</span><p>Un jaguar que pasaba por allí se reía.</p></>}
          {narrativeStep === 3 && <><span>EL CIELO</span><p>Al tiempo, llegó la lluvia.</p></>}
          {narrativeStep === 4 && <><span>LA LLUVIA</span><p>Las gotas cayeron una a una hasta apagar el fuego.</p></>}
          <button type="button" onClick={continueNarrative}>Continuar <span aria-hidden="true">→</span></button>
        </div>}
        {fireOut && !postFireDialogueDismissed && <div className="fire-forest-dialogue" role="status" aria-live="polite">
          <span>{seedCollected ? "EL LIMÓN" : "DESPUÉS DEL INCENDIO"}</span>
          <p>{seedCollected ? "La semilla conserva el calor de lo que terminó." : "Entre la ceniza ha quedado una semilla negra, quemada por el fuego."}</p>
          <button type="button" onClick={() => setPostFireDialogueDismissed(true)}>Continuar <span aria-hidden="true">→</span></button>
        </div>}
      </>}
    </div>
  );
}
