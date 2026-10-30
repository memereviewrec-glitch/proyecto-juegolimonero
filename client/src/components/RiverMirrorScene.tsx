import { useState, type MouseEvent } from "react";
import { LemonSprite } from "./GameSprites";
import "./river-mirror-scene.css";

export type RiverRoute = "pacifico" | "drastico";

type RiverStep = "arrival" | "spirits" | "answer" | "revelation" | "ending";

type RiverMirrorSceneProps = {
  route: RiverRoute;
};

const RIVER_DIALOGUE = {
  pacifico: {
    context: "El limón llega creyendo que la semilla y las palabras de los encapuchados eran la máxima verdad del universo.",
    spirits: "Pequeño cítrico... tus hojas imaginarias huelen a cera caliente y tu cáscara brilla con el tinte de una falsa aurora. Dices que has encontrado la luz, pero la llama que te cautivó solo busca consumir tu pulpa en silencio. ¿Es real el conocimiento que te ata, o es solo la sombra del fuego reflejada en tu propio jugo?",
    answer: "Ellos me dieron una semilla... Me dijeron que comprendía el propósito del mundo. La oscuridad ya no me da miedo.",
    revelation: "Una semilla plantada en cenizas nunca dará frutos, limón. Te han enseñado a adorar el calor que os seca a todos. Mira tu reflejo en nuestras aguas: el verdadero conocimiento fluye, no se quema.",
    ending: "Una ola suave y fresca salpica al limón. El humo de la secta se disipa de su mente; conserva la semilla como recuerdo de lo que casi pierde.",
  },
  drastico: {
    context: "El limón llega cansado, con la cáscara raspada tras haber escapado rodando colina abajo para no ser exprimido en la hoguera.",
    spirits: "Has rodado lejos de las llamas, fugitivo del fuego. Tus costados llevan las marcas del miedo, pero tus ruedas siguen girando. ¿Buscas refugio en nuestras aguas, o solo un lugar donde detener tu carrera?",
    answer: "Rodé para salvar mi jugo, pero ahora no sé hacia dónde ir. Todo parece oscuro y confuso fuera de esa cueva.",
    revelation: "La confusión es el principio de la corriente, pequeño viajero. Quien no se atreve a rodar por los precipicios de lo desconocido, nunca descubre hacia dónde fluyen los ríos. Sigue el curso del agua: el conocimiento no se encuentra quieto junto a una hoguera, sino en el movimiento constante del mundo.",
    ending: "Las corrientes forman un camino brillante sobre la superficie. Los espíritus empujan suavemente al limón con una marea favorable hacia el mundo vasto.",
  },
} as const;

const NEXT_LABEL: Record<RiverStep, string> = {
  arrival: "acercarse a la orilla",
  spirits: "escuchar a los espíritus",
  answer: "responder al río",
  revelation: "mirar el reflejo",
  ending: "seguir la corriente",
};

export function RiverMirrorScene({ route }: RiverMirrorSceneProps) {
  const [step, setStep] = useState<RiverStep>("arrival");
  const [stoneStatus, setStoneStatus] = useState<"ground" | "carried" | "thrown">("ground");
  const [lemonPoint, setLemonPoint] = useState({ x: 28, bottom: 25 });
  const dialogue = RIVER_DIALOGUE[route];
  const resolved = step === "ending";

  function moveAlongShore(event: MouseEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("button, .river-stone")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(66, Math.min(90, ((event.clientY - bounds.top) / bounds.height) * 100));
    setLemonPoint({ x, bottom: 100 - y });
  }

  function collectStone() {
    if (stoneStatus !== "ground") return;
    setStoneStatus("carried");
  }

  function throwStone() {
    if (stoneStatus !== "carried") return;
    setStoneStatus("thrown");
    setStep("spirits");
  }

  function advance() {
    setStep(current => current === "arrival" ? "spirits" : current === "spirits" ? "answer" : current === "answer" ? "revelation" : "ending");
  }

  return (
    <div className={`scene-stage game-screen river-mirror-stage river-route-${route}`}>
      <div className="river-mirror-world" role="group" tabIndex={0} aria-label="La Orilla del Río Espejo. La franja de arena junto al agua se puede recorrer." onClick={moveAlongShore}>
        <div className="river-mist river-mist-one" aria-hidden="true" />
        <div className="river-mist river-mist-two" aria-hidden="true" />
        <div className={`river-spirits ${stoneStatus === "thrown" ? "river-spirits-awake" : ""}`} aria-label="Tres Espíritus del Río" aria-hidden={stoneStatus !== "thrown"}>
          <span className="river-spirit river-spirit-one" /><span className="river-spirit river-spirit-two" /><span className="river-spirit river-spirit-three" />
        </div>
        <div className={`river-current ${resolved ? "river-current-guiding" : ""}`} aria-hidden="true" />
        <div className={`river-lemon ${stoneStatus === "carried" ? "river-lemon-carried" : ""} ${stoneStatus === "thrown" ? "river-lemon-thrown" : ""} ${resolved ? "river-lemon-resolved" : ""}`} style={{ left: `${lemonPoint.x}%`, bottom: `${lemonPoint.bottom}%` }} aria-label="El limón">
          <LemonSprite />
        </div>
        {stoneStatus === "ground" && <button className="river-stone river-stone-ground" type="button" onClick={collectStone} aria-label="Piedra junto a la orilla" />}
        {stoneStatus === "carried" && <button className="river-target" type="button" onClick={throwStone} aria-label="Agua quieta y plateada" />}
        {stoneStatus === "thrown" && <span className="river-stone river-stone-flight" aria-hidden="true" />}
        {resolved && <div className="river-splash" aria-hidden="true"><i /><i /><i /><i /></div>}
        <div className="river-coordinate">LF · 05</div>
      </div>
      <div className="river-dialogue" role="status" aria-live="polite">
        {step === "arrival" && <><span className="river-speaker">LA ORILLA</span><p>{dialogue.context}</p></>}
        {step === "spirits" && <><span className="river-speaker">ESPÍRITUS DEL RÍO</span><p>{dialogue.spirits}</p></>}
        {step === "answer" && <><span className="river-speaker">EL LIMÓN</span><p className="river-answer">“{dialogue.answer}”</p></>}
        {step === "revelation" && <><span className="river-speaker">ESPÍRITUS DEL RÍO</span><p>{dialogue.revelation}</p></>}
        {step === "ending" && <><span className="river-speaker">EL RÍO ESPEJO</span><p>{dialogue.ending}</p><small className="river-route-note">{route === "pacifico" ? "La ilusión queda atrás." : "El viaje continúa."}</small></>}
        {!resolved && stoneStatus === "thrown" && <button className="river-dialogue-next" type="button" onClick={advance}>{NEXT_LABEL[step]} <span aria-hidden="true">▶</span></button>}
      </div>
    </div>
  );
}
