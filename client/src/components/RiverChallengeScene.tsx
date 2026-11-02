import { useState } from "react";
import { LemonSprite } from "./GameSprites";
import { RIVER_CHALLENGE_ROUTES } from "./riverChallengeRules";
import type { RiverChallengeOutcome } from "./riverChoiceRules";
import "./river-challenge-scene.css";

type ChallengePhase = "shore" | "inside" | "answer" | "complete";

type RiverChallengeSceneProps = { onComplete: (outcome: RiverChallengeOutcome) => void; onPreviewContinue?: () => void };

export function RiverChallengeScene({ onComplete, onPreviewContinue }: RiverChallengeSceneProps) {
  const [phase, setPhase] = useState<ChallengePhase>("shore");
  const [outcome, setOutcome] = useState<RiverChallengeOutcome | null>(null);

  function completeChallenge(nextOutcome: RiverChallengeOutcome) {
    if (outcome !== null) return;
    setOutcome(nextOutcome);
    setPhase("complete");
    onComplete(nextOutcome);
  }

  return (
    <div className={`scene-stage game-screen river-challenge-stage river-challenge-${phase}${outcome ? ` river-challenge-route-${outcome}` : ""}`}>
      <div className="river-challenge-world" role="group" aria-label="El reto de los Espíritus del Río">
        <div className="challenge-river-current" aria-hidden="true" />
        <div className="challenge-spirits" aria-hidden="true"><i /><i /><i /></div>
        <div className="challenge-lemon" aria-hidden="true"><LemonSprite /></div>
        <div className="river-coordinate">LF · 06</div>
      </div>
      <div className="challenge-dialogue" role="status" aria-live="polite">
        {phase === "shore" && <><span>ESPÍRITUS DEL RÍO</span><p>Has escuchado nuestras aguas. Acércate y escucha el reto: hay más de un camino hacia el fondo.</p><button type="button" onClick={() => setPhase("inside")}>acercarse al agua <b aria-hidden="true">▶</b></button></>}
        {phase === "inside" && <><span>ESPÍRITUS DEL RÍO</span><p>El limón da un primer paso en el agua tranquila. La corriente espera más adelante; la orilla aún queda a su alcance.</p><button type="button" onClick={() => setPhase("answer")}>escuchar el reto <b aria-hidden="true">▶</b></button></>}
        {phase === "answer" && <><span>EL RÍO ESPEJO</span><p>¿Entrarás en la corriente sin miedo, o te retirarás hacia la orilla mientras los espíritus abren las aguas?</p><div className="challenge-choices"><button type="button" onClick={() => completeChallenge("current")}>{RIVER_CHALLENGE_ROUTES.current.choice}</button><button type="button" onClick={() => completeChallenge("shore")}>{RIVER_CHALLENGE_ROUTES.shore.choice}</button></div></>}
        {phase === "complete" && outcome && <><span>EL RÍO ESPEJO</span><p>{RIVER_CHALLENGE_ROUTES[outcome].reply}</p>{onPreviewContinue && <button type="button" onClick={onPreviewContinue}>Ver sus stats iniciales en Jaguar</button>}</>}
      </div>
    </div>
  );
}
