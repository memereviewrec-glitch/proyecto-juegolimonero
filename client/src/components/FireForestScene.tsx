import { useEffect, useState } from "react";
import { SeedGlyph } from "./SeedGlyph";
import "./fire-forest-scene.css";

type FireForestSceneProps = {
  seedCollected: boolean;
  onCollectSeed: () => void;
};

export function FireForestScene({ seedCollected, onCollectSeed }: FireForestSceneProps) {
  const [rainStarted, setRainStarted] = useState(false);
  const [fireOut, setFireOut] = useState(false);

  useEffect(() => {
    const startTimer = window.setTimeout(() => setRainStarted(true), 900);
    const outTimer = window.setTimeout(() => setFireOut(true), 7600);
    return () => {
      window.clearTimeout(startTimer);
      window.clearTimeout(outTimer);
    };
  }, []);

  return (
    <div className={`scene-stage game-screen fire-forest-stage ${rainStarted ? "fire-rain-started" : ""} ${fireOut ? "fire-is-out" : ""}`}>
      <div className="fire-forest-world" role="img" aria-label="Un bosque en llamas que se apaga poco a poco bajo la lluvia">
        <div className="fire-forest-moon" aria-hidden="true" />
        <div className="fire-forest-trees" aria-hidden="true"><i /><i /><i /><i /><i /></div>
        <div className="fire-forest-flames" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>
        <div className="fire-forest-rain" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></div>
        {fireOut && !seedCollected && <button type="button" className="burnt-seed" onClick={onCollectSeed} aria-label="Recoger la semilla negra quemada">
          <SeedGlyph seed="el-fuego" />
        </button>}
        {fireOut && seedCollected && <div className="burnt-seed-collected" aria-label="Semilla quemada añadida al Libro"><SeedGlyph seed="el-fuego" /><span>semilla recogida</span></div>}
        <div className="river-coordinate">LF · 08</div>
      </div>
      <div className="fire-forest-dialogue" role="status" aria-live="polite">
        {!rainStarted && <><span>EL BOSQUE</span><p>El bosque arde en silencio. El limón espera.</p></>}
        {rainStarted && !fireOut && <><span>LA LLUVIA</span><p>Las nubes llegan. No hay nada que hacer salvo esperar a que el agua apague el fuego.</p></>}
        {fireOut && !seedCollected && <><span>DESPUÉS DEL INCENDIO</span><p>Entre la ceniza ha quedado una semilla negra, quemada por el fuego.</p></>}
        {fireOut && seedCollected && <><span>EL LIMÓN</span><p>La semilla conserva el calor de lo que terminó.</p></>}
      </div>
    </div>
  );
}
