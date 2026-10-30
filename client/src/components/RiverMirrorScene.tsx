import { useEffect, useRef, useState, type MouseEvent } from "react";
import { LemonSprite } from "./GameSprites";
import { SeedGlyph } from "./SeedGlyph";
import "./river-mirror-scene.css";

export type RiverRoute = "pacifico" | "drastico";
type RiverStep = "arrival" | "spirits-1" | "spirits-2" | "spirits-3" | "answer" | "revelation-1" | "revelation-2" | "ending";

type RiverMirrorSceneProps = {
  route: RiverRoute;
  seedCollected: boolean;
  onCollectSeed: () => void;
};

const RIVER_DIALOGUE = {
  pacifico: {
    context: "El limón llega creyendo que la semilla y las palabras de los encapuchados eran la máxima verdad del universo.",
    spiritLines: [
      "Pequeño cítrico... tus hojas imaginarias huelen a cera caliente.",
      "Tu cáscara brilla con el tinte de una falsa aurora.",
      "Dices que has encontrado la luz, pero la llama que te cautivó solo busca consumirte en silencio.",
    ],
    answerPrompt: "El río espera una respuesta.",
    choices: [
      "Quizá confundí el calor con la luz. Quiero mirar otra vez.",
      "No necesito que nadie me diga qué pensar. Mi pulpa sigue siendo mía.",
      "Ellos me dieron una semilla y yo la tomé por una verdad completa.",
    ],
    revelationLines: [
      "Una semilla plantada en cenizas nunca dará frutos, limón.",
      "El verdadero conocimiento fluye: no se quema ni te ata.",
    ],
    ending: "Una ola suave y fresca salpica al limón. El humo de la secta se disipa de su mente.",
  },
  drastico: {
    context: "El limón llega cansado, con la cáscara raspada tras haber escapado rodando colina abajo.",
    spiritLines: [
      "Has rodado lejos de las llamas, fugitivo del fuego.",
      "Tus costados llevan las marcas del miedo, pero tus ruedas siguen girando.",
      "¿Buscas refugio en nuestras aguas, o solo un lugar donde detener tu carrera?",
    ],
    answerPrompt: "El río pregunta hacia dónde quiere rodar el limón.",
    choices: [
      "Seguiré rodando aunque todavía no vea el camino.",
      "Quiero detenerme un momento y escuchar hacia dónde llama la corriente.",
      "Si el mundo fluye, aprenderé a moverme con él sin volver a la hoguera.",
    ],
    revelationLines: [
      "La confusión es el principio de la corriente, pequeño viajero.",
      "El conocimiento no se encuentra quieto junto a una hoguera: vive en el movimiento del mundo.",
    ],
    ending: "Las corrientes forman un camino brillante sobre la superficie y una marea favorable espera al limón.",
  },
} as const;

const NEXT_LABEL: Partial<Record<RiverStep, string>> = {
  arrival: "...",
  "spirits-1": "...",
  "spirits-2": "...",
  "spirits-3": "responder al río",
  "revelation-1": "...",
  "revelation-2": "seguir la corriente",
};

export function RiverMirrorScene({ route, seedCollected, onCollectSeed }: RiverMirrorSceneProps) {
  const [step, setStep] = useState<RiverStep>("arrival");
  const [stoneStatus, setStoneStatus] = useState<"ground" | "throwing" | "thrown">("ground");
  const [lemonPoint, setLemonPoint] = useState({ x: 28, bottom: 25 });
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const throwTimer = useRef<number | null>(null);
  const dialogue = RIVER_DIALOGUE[route];
  const resolved = step === "ending";

  useEffect(() => () => {
    if (throwTimer.current !== null) window.clearTimeout(throwTimer.current);
  }, []);

  function moveAlongShore(event: MouseEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("button, .river-stone")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = Math.max(10, Math.min(90, ((event.clientX - bounds.left) / bounds.width) * 100));
    const y = Math.max(66, Math.min(90, ((event.clientY - bounds.top) / bounds.height) * 100));
    setLemonPoint({ x, bottom: 100 - y });
  }

  function collectStone() {
    if (stoneStatus !== "ground") return;
    setStoneStatus("throwing");
    const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 900;
    throwTimer.current = window.setTimeout(() => {
      setStoneStatus("thrown");
      setStep("spirits-1");
      throwTimer.current = null;
    }, duration);
  }

  function advance() {
    setStep(current => {
      if (current === "spirits-1") return "spirits-2";
      if (current === "spirits-2") return "spirits-3";
      if (current === "spirits-3") return "answer";
      if (current === "revelation-1") return "revelation-2";
      if (current === "revelation-2") return "ending";
      return current;
    });
  }

  function chooseAnswer(answer: string) {
    setSelectedAnswer(answer);
    setStep("revelation-1");
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
        <div className={`river-lemon ${stoneStatus === "throwing" ? "river-lemon-throwing" : ""} ${stoneStatus === "thrown" ? "river-lemon-thrown" : ""} ${resolved ? "river-lemon-resolved" : ""}`} style={{ left: `${lemonPoint.x}%`, bottom: `${lemonPoint.bottom}%` }} aria-label="El limón">
          <LemonSprite />
        </div>
        {stoneStatus === "ground" && <button className="river-stone river-stone-ground" type="button" onClick={collectStone} aria-label="Piedra junto a la orilla" />}
        {stoneStatus === "throwing" && <span className="river-stone river-stone-flight" aria-hidden="true" />}
        {stoneStatus === "thrown" && <img className="river-ripples" src="/river-stone-ripples.gif" alt="" aria-hidden="true" />}
        {resolved && !seedCollected && <button className="river-seed" type="button" onClick={onCollectSeed} aria-label="Recoger la semilla plateada de Espíritus del río"><SeedGlyph seed="espiritus-del-rio" /></button>}
        <div className="river-coordinate">LF · 05</div>
      </div>
      <div className="river-dialogue" role="status" aria-live="polite">
        {step === "arrival" && <><span className="river-speaker">LA ORILLA</span><p>{dialogue.context}</p></>}
        {step.startsWith("spirits-") && <><span className="river-speaker">ESPÍRITUS DEL RÍO</span><p>{dialogue.spiritLines[Number(step.slice(-1)) - 1]}</p></>}
        {step === "answer" && <><span className="river-speaker">EL LIMÓN</span><p className="river-answer">{dialogue.answerPrompt}</p><div className="river-choice-list" aria-label="Respuestas posibles del limón">{dialogue.choices.map(choice => <button key={choice} type="button" onClick={() => chooseAnswer(choice)}>{choice}</button>)}</div></>}
        {step.startsWith("revelation-") && <><span className="river-speaker">{step === "revelation-1" ? "EL LIMÓN" : "ESPÍRITUS DEL RÍO"}</span><p className={step === "revelation-1" ? "river-answer" : ""}>{step === "revelation-1" ? `“${selectedAnswer}”` : dialogue.revelationLines[1]}</p>{step === "revelation-1" && <p>{dialogue.revelationLines[0]}</p>}</>}
        {step === "ending" && <><span className="river-speaker">EL RÍO ESPEJO</span><p>{dialogue.ending}</p><small className="river-route-note">{seedCollected ? "La semilla ya descansa en el Libro." : "Algo plateado espera entre el agua y la orilla."}</small></>}
        {!resolved && stoneStatus === "thrown" && step !== "answer" && <button className="river-dialogue-next" type="button" onClick={advance}>{NEXT_LABEL[step] ?? "..."} <span aria-hidden="true">▶</span></button>}
      </div>
    </div>
  );
}
