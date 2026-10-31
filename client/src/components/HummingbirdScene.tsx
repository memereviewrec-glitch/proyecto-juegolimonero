import { useEffect, useState } from "react";
import { gameAssetUrl } from "../gameAudio";
import "./hummingbird-scene.css";
import { SeedGlyph } from "./SeedGlyph";
import { LemonSprite } from "./GameSprites";

export type HummingbirdOutcome = "good" | "bad" | "neutral";

type HummingbirdSceneProps = {
  seedCollected: boolean;
  onCollectSeed: () => void;
  onOutcome?: (outcome: HummingbirdOutcome) => void;
};

type HummingbirdOption = {
  text: string;
  delta: number;
};

type HummingbirdQuestion = {
  prompt: string;
  options: readonly HummingbirdOption[];
};

const QUESTIONS: readonly HummingbirdQuestion[] = [
  {
    prompt: "Mi casa estaba en aquel árbol. Ahora solo quedan cenizas. No sé dónde volver.",
    options: [
      { text: "No tienes que resolverlo todo ahora. Puedes descansar un momento y luego pensamos qué hacer.", delta: 25 },
      { text: "Todos hemos perdido cosas. Tendrás que acostumbrarte.", delta: -30 },
      { text: "Si no tienes casa, busca otra. Quedarte aquí no va a cambiar nada.", delta: -30 },
    ],
  },
  {
    prompt: "Volaba de árbol en árbol, pero ya no queda ninguno. El cielo es demasiado grande cuando no tienes un lugar al que regresar.",
    options: [
      { text: "El mundo siempre ha sido grande. Eso no significa que tenga que importarte.", delta: -30 },
      { text: "Aunque el bosque haya desaparecido, aquí quedan otros animales. Si quieres, podemos buscar a quienes también necesiten ayuda.", delta: 25 },
      { text: "Deja de mirar atrás y vuela. Los pájaros deberían saber hacer eso.", delta: -30 },
    ],
  },
  {
    prompt: "Intenté llevar agua para apagar el fuego. Volé hasta el río tantas veces como pude, pero nunca fue suficiente. Quizá todo fue culpa mía.",
    options: [
      { text: "Si hubieras llevado más agua, tal vez el bosque seguiría vivo.", delta: -30 },
      { text: "No pienses en eso ahora. Hay cosas que es mejor olvidar.", delta: -30 },
      { text: "Que no pudieras apagar el incendio no significa que no hicieras nada. A veces el valor está en insistir aunque no sepamos si bastará.", delta: 25 },
    ],
  },
  {
    prompt: "Los animales me miraban mientras volvía del río. Yo sabía que no podía salvarlos. Cada viaje me hacía sentir más pequeño.",
    options: [
      { text: "No eras pequeño por no poder salvar el bosque. Eras valiente por volver a intentarlo.", delta: 25 },
      { text: "Al menos aprendiste que no todos los problemas pueden resolverse.", delta: -30 },
      { text: "No deberías preocuparte tanto por lo que piensen los demás.", delta: -30 },
    ],
  },
  {
    prompt: "Un jaguar se reía de mí. Decía que mis vuelos eran inútiles. Quizá tenía razón.",
    options: [
      { text: "El jaguar tenía razón. La próxima vez deberías dejar que el fuego se lo llevara a él.", delta: -30 },
      { text: "Que alguien se burle de tus intentos no convierte tus esfuerzos en inútiles. Solo demuestra que no supo verlos.", delta: 25 },
      { text: "No pienses en el jaguar. Hay cosas más importantes.", delta: -30 },
    ],
  },
  {
    prompt: "Ahora no tengo casa, ni bosque, ni un camino al que regresar. ¿Qué puedo hacer?",
    options: [
      { text: "Nada. Ya has hecho bastante.", delta: -30 },
      { text: "Seguir volando es lo único que sabes hacer. Hazlo y deja de pensar.", delta: -30 },
      { text: "No puedo devolverte tu casa, pero puedo ayudarte a encontrar un refugio con los demás animales.", delta: 25 },
    ],
  },
];

function outcomeText(outcome: HummingbirdOutcome) {
  if (outcome === "good") return "Gracias por escucharme. Seguiré adelante con un nuevo amigo.";
  if (outcome === "bad") return "Tus palabras pesan más que las cenizas. No puedo quedarme aquí.";
  return "Aún no sé qué hacer. Me quedaré un momento en esta rama para decidir el siguiente paso.";
}

export function HummingbirdScene({ seedCollected, onCollectSeed, onOutcome }: HummingbirdSceneProps) {
  const [mood, setMood] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [outcome, setOutcome] = useState<HummingbirdOutcome | null>(null);
  const [entryComplete, setEntryComplete] = useState(false);
  const [friendshipExit, setFriendshipExit] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setEntryComplete(true), 2200);
    return () => window.clearTimeout(timer);
  }, []);

  const question = QUESTIONS[questionIndex];
  const answer = (delta: number) => {
    if (outcome || !question) return;
    const nextMood = Math.max(-100, Math.min(100, mood + delta));
    if (nextMood >= 100) {
      setMood(100);
      setOutcome("good");
      onOutcome?.("good");
      return;
    }
    if (nextMood <= -100) {
      setMood(-100);
      setOutcome("bad");
      onOutcome?.("bad");
      return;
    }
    if (questionIndex === QUESTIONS.length - 1) {
      setMood(nextMood);
      setOutcome("neutral");
      onOutcome?.("neutral");
      return;
    }
    setMood(nextMood);
    setQuestionIndex(index => index + 1);
  };

  const collectSeed = () => {
    if (seedCollected || friendshipExit) return;
    if (outcome !== "good" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onCollectSeed();
      return;
    }
    setFriendshipExit(true);
    window.setTimeout(onCollectSeed, 1350);
  };

  const progress = ((mood + 100) / 200) * 100;
  const moodTone = mood >= 0 ? "positive" : "negative";

  return (
    <div className={`hummingbird-scene-shell hummingbird-${outcome ?? "conversation"}${!entryComplete && !outcome ? " hummingbird-entering" : ""}${friendshipExit ? " hummingbird-friendship-exit" : ""}`}>
      <div className="scene-stage game-screen hummingbird-stage">
      <div className="hummingbird-sky" aria-hidden="true" />
      <picture className="hummingbird-sprite">
        <source media="(prefers-reduced-motion: reduce)" srcSet={gameAssetUrl("/colibri-still.png")} />
        <img src={gameAssetUrl("/colibri.gif")} alt="Colibrí" />
      </picture>
      <div className="hummingbird-lemon" aria-hidden="true"><LemonSprite /></div>
      <div className="hummingbird-meter" aria-label={`Ánimo del colibrí: ${mood} de 100`}>
        <div className="hummingbird-meter-heading"><strong>{mood > 0 ? "+" : ""}{mood}</strong></div>
        <div className="hummingbird-meter-track"><span className={moodTone} style={{ width: `${progress}%` }} /><i /></div>
        <div className="hummingbird-meter-labels"><span>−100</span><span>0</span><span>+100</span></div>
      </div>
      </div>
      <div className="hummingbird-dialogue" role="status" aria-live="polite">
        {outcome ? (
          <>
            <span>{outcome === "good" ? "AMISTAD" : outcome === "bad" ? "DESPEDIDA" : "DUDA"}</span>
            <p>{outcomeText(outcome)}</p>
            {!seedCollected && <button type="button" className="hummingbird-seed-button" onClick={collectSeed} disabled={friendshipExit} aria-label="Recoger la semilla de Ponzoña y abrir el Libro de Semillas"><SeedGlyph seed="ponzona" /><b>{friendshipExit ? "el colibrí se acerca…" : "recoger semilla de Ponzoña"}</b></button>}
            {seedCollected && <small>La semilla de Ponzoña ya está en el Libro de Semillas.</small>}
          </>
        ) : (
          <>
            <span>COLIBRÍ · {questionIndex + 1}/{QUESTIONS.length}</span>
            <p>{question.prompt}</p>
            <div className="hummingbird-options">
              {question.options.map((option, index) => <button type="button" key={option.text} onClick={() => answer(option.delta)}><b>{String.fromCharCode(65 + index)}</b>{option.text}</button>)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
