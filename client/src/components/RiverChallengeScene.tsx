import { useState } from "react";
import { LemonSprite } from "./GameSprites";
import "./river-challenge-scene.css";

type ChallengePhase = "shore" | "inside" | "answer";

export function RiverChallengeScene() {
  const [phase, setPhase] = useState<ChallengePhase>("shore");

  return (
    <div className={`scene-stage game-screen river-challenge-stage river-challenge-${phase}`}>
      <div className="river-challenge-world" role="group" aria-label="El reto de los Espíritus del Río">
        <div className="challenge-river-current" aria-hidden="true" />
        <div className="challenge-spirits" aria-hidden="true"><i /><i /><i /></div>
        <div className="challenge-lemon" aria-hidden="true"><LemonSprite /></div>
        <div className="river-coordinate">LF · 06</div>
      </div>
      <div className="challenge-dialogue" role="status" aria-live="polite">
        {phase === "shore" && <><span>ESPÍRITUS DEL RÍO</span><p>Has escuchado nuestras aguas. Ahora entra en ellas y descubre si sabes distinguir corriente de espejismo.</p><button type="button" onClick={() => setPhase("inside")}>adentrarse en el río <b aria-hidden="true">▶</b></button></>}
        {phase === "inside" && <><span>ESPÍRITUS DEL RÍO</span><p>El fondo se mueve bajo tus patas. No hay orilla que te diga quién eres.</p><button type="button" onClick={() => setPhase("answer")}>escuchar el reto <b aria-hidden="true">▶</b></button></>}
        {phase === "answer" && <><span>EL RÍO ESPEJO</span><p>¿Seguirás la corriente que no puedes ver, o volverás al fuego que ya conoces?</p><div className="challenge-choices"><button type="button">Seguir la corriente</button><button type="button">Mirar hacia la orilla</button></div></>}
      </div>
    </div>
  );
}
