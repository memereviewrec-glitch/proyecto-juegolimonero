import { useEffect, useMemo, useState } from "react";
import { createAttemptTaskScope } from "../attemptTaskScope";
import { flushSync } from "react-dom";
import { gameAssetUrl } from "../gameAudio";
import { SeedGlyph } from "./SeedGlyph";
import { STAT_LABELS } from "./JaguarStatsHud";
import {
  ANGRY_QUESTIONS,
  CAUTELA_THRESHOLD,
  COURAGE_THRESHOLD,
  EMPATHY_THRESHOLD,
  getFinalJaguarAdvice,
  getJaguarBranchAfterCautela,
  getJaguarHummingbirdHint,
  INGENUITY_ANSWER,
  INGENUITY_RIDDLE,
  INGENUITY_THRESHOLD,
  INNER_QUESTIONS,
  LAUGHING_QUESTIONS,
  NIGHTMARE_VOICEOVER,
  applyJaguarAnswerEffects,
  createInitialJaguarStats,
  resolveFightOutcome,
  meetsJaguarThreshold,
  scaleJaguarAnswerEffects,
  type JaguarHistory,
  type JaguarQuestion,
  type JaguarStats,
} from "./jaguarRules";
import "./jaguar-scene.css";

type JaguarSceneProps = JaguarHistory & {
  seedCollected: boolean;
  stats: JaguarStats;
  onStatsChange: (stats: JaguarStats) => void;
  onCollectSeed: () => void;
  onReturnHome: () => void;
  testMode?: boolean;
};
type DialoguePhase = "inner" | "cautela-check" | "angry-questions" | "laughing-questions" | "angry-check" | "ingenio-check" | "fight" | "nightmare" | "revelation" | "counsel" | "complete";
type Phase = DialoguePhase | "skill-result";
type Branch = "angry" | "laughing" | null;
type Approach = "empatia" | "valentia";
type EndingRoute = "empatia" | "enigmas" | "valentia" | "pesadilla";
type SkillResult = {
  stat: keyof JaguarStats;
  outcome: "success" | "failure" | "blocked";
  message: string;
  checkDetails?: string;
  nextPhase: DialoguePhase;
  nextFeedback?: string;
  nextOutcomeNote?: string;
};
const FIGHT_ROUNDS = [
  { threat: "La zarpa cae desde la izquierda.", prompt: "¿Cómo esquiva el limón?", safe: "Rodar hacia la derecha." },
  { threat: "El jaguar salta y la tierra tiembla.", prompt: "¿Cómo evita el golpe?", safe: "Esperar el último instante y deslizarse bajo las raíces." },
  { threat: "La cola barre el suelo frente a él.", prompt: "¿Cómo encuentra una salida?", safe: "Saltar sobre la roca cuando la cola pase." },
] as const;
type ViewTransitionHandle = { finished?: Promise<unknown> };
type ViewTransitionDocument = Document & { startViewTransition?: (callback: () => void) => ViewTransitionHandle };
let dialogueTransitionInProgress = false;

function runDialogueTransition(update: () => void, schedule: (callback: () => void, delay: number) => number, guard: (callback: () => void) => () => void) {
  if (typeof document === "undefined" || typeof window === "undefined" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return;
  }
  if (dialogueTransitionInProgress) return;
  dialogueTransitionInProgress = true;
  const releaseTransition = () => { dialogueTransitionInProgress = false; };
  const finishTransition = () => {
    const dialogue = document.querySelector<HTMLElement>(".jaguar-dialogue");
    if (dialogue) {
      dialogue.classList.remove("jaguar-dialogue-transitioning");
      dialogue.inert = false;
    }
    releaseTransition();
  };
  const transitionDocument = document as ViewTransitionDocument;
  if (!transitionDocument.startViewTransition) {
    const outgoing = document.querySelector<HTMLElement>(".jaguar-dialogue");
    if (!outgoing) {
      update();
      releaseTransition();
      return;
    }
    outgoing.inert = true;
    outgoing.classList.add("jaguar-dialogue-exiting");
    schedule(() => {
      flushSync(update);
      const incoming = document.querySelector<HTMLElement>(".jaguar-dialogue");
      if (!incoming) {
        releaseTransition();
        return;
      }
      incoming.classList.remove("jaguar-dialogue-exiting");
      incoming.inert = true;
      incoming.classList.add("jaguar-dialogue-entering");
      schedule(() => {
        incoming.classList.remove("jaguar-dialogue-entering");
        incoming.inert = false;
        releaseTransition();
      }, 1400);
    }, 1400);
    return;
  }
  const transition = transitionDocument.startViewTransition(guard(() => {
    flushSync(update);
    const incoming = document.querySelector<HTMLElement>(".jaguar-dialogue");
    if (incoming) {
      incoming.inert = true;
      incoming.classList.add("jaguar-dialogue-transitioning");
    }
  }));
  if (transition.finished) void transition.finished.then(guard(finishTransition), guard(finishTransition));
  else schedule(finishTransition, 2800);
}

export function JaguarScene({ dawnOutcome, ramblaOutcome, hummingbirdOutcome, riverConversationOutcome, riverChallengeOutcome, seedCollected, stats, onStatsChange, onCollectSeed, onReturnHome, testMode = false }: JaguarSceneProps) {
  const attemptTasks = useMemo(() => createAttemptTaskScope(
    (callback, delay) => window.setTimeout(callback, delay),
    id => window.clearTimeout(id),
  ), []);
  useEffect(() => () => {
    attemptTasks.reset();
    dialogueTransitionInProgress = false;
  }, [attemptTasks]);
  const transitionAction = (update: () => void) => () => runDialogueTransition(attemptTasks.guard(update), attemptTasks.schedule, attemptTasks.guard);
  const history = useMemo<JaguarHistory>(() => ({ dawnOutcome, ramblaOutcome, hummingbirdOutcome, riverConversationOutcome, riverChallengeOutcome }), [dawnOutcome, ramblaOutcome, hummingbirdOutcome, riverConversationOutcome, riverChallengeOutcome]);
  const initialStats = useMemo(() => createInitialJaguarStats(history), [history]);
  const setStats = onStatsChange;
  const [phase, setPhase] = useState<Phase>("inner");
  const [branch, setBranch] = useState<Branch>(null);
  const [innerStep, setInnerStep] = useState(0);
  const [angryStep, setAngryStep] = useState(0);
  const [laughingStep, setLaughingStep] = useState(0);
  const [approach, setApproach] = useState<Approach>("empatia");
  const [fightStep, setFightStep] = useState(0);
  const [fightFailures, setFightFailures] = useState(0);
  const [nightmareEnding, setNightmareEnding] = useState(false);
  const [ingenioFailures, setIngenioFailures] = useState(0);
  const [laughingEntryStats, setLaughingEntryStats] = useState<JaguarStats | null>(null);
  const [endingRoute, setEndingRoute] = useState<EndingRoute | null>(null);
  const [outcomeNote, setOutcomeNote] = useState("");
  const [feedback, setFeedback] = useState("");
  const [skillResult, setSkillResult] = useState<SkillResult | null>(null);
  const [seedJustCollected, setSeedJustCollected] = useState(false);
  const [shownHummingbirdHintContext, setShownHummingbirdHintContext] = useState<string | null>(null);
  const advice = useMemo(() => getFinalJaguarAdvice(stats), [stats]);

  function presentSkillResult(result: SkillResult) {
    setSkillResult(result);
    setFeedback("");
    setOutcomeNote("");
    setPhase("skill-result");
  }

  function continueAfterSkillResult() {
    if (!skillResult) return;
    const result = skillResult;
    setSkillResult(null);
    setFeedback(result.nextFeedback ?? "");
    setOutcomeNote(result.nextOutcomeNote ?? "");
    setPhase(result.nextPhase);
  }

  function applyAnswer(question: JaguarQuestion, answerIndex: number, questionIndex: number, questionSet: "inner" | "angry" | "laughing") {
    const answer = question.answers[answerIndex];
    if (!answer) return;
    setStats(applyJaguarAnswerEffects(stats, answer.effects));
    setFeedback("");
    if (questionSet === "inner") {
      if (questionIndex < INNER_QUESTIONS.length - 1) {
        setInnerStep(questionIndex + 1);
      } else {
        setPhase("cautela-check");
      }
      return;
    }
    if (questionSet === "angry") {
      // La última pregunta (3/3) ofrece dos respuestas y fija la prueba final.
      if (questionIndex === ANGRY_QUESTIONS.length - 1 && answer.approach) setApproach(answer.approach);
      if (questionIndex < ANGRY_QUESTIONS.length - 1) {
        setAngryStep(questionIndex + 1);
      } else {
        setPhase("angry-check");
      }
      return;
    }
    if (questionIndex < LAUGHING_QUESTIONS.length - 1) {
      setLaughingStep(questionIndex + 1);
    } else {
      setPhase("ingenio-check");
    }
  }

  function resolveCautela() {
    const succeeds = meetsJaguarThreshold(stats.cautela, CAUTELA_THRESHOLD);
    const nextBranch = getJaguarBranchAfterCautela(succeeds);
    if (nextBranch === "laughing") {
      setLaughingEntryStats({ ...stats });
      setBranch(nextBranch);
      setLaughingStep(0);
      presentSkillResult({
        stat: "cautela",
        outcome: "success",
        message: "El limón, antes de avanzar un paso más, preguntó \"hay alguien ahí\"?",
        checkDetails: `Cautela ${stats.cautela}% · mínimo ${CAUTELA_THRESHOLD}%`,
        nextPhase: "laughing-questions",
      });
    } else {
      setLaughingEntryStats(null);
      setBranch(nextBranch);
      setAngryStep(0);
      setApproach("empatia");
      presentSkillResult({
        stat: "cautela",
        outcome: "failure",
        message: "El limón, dio media vuelta pero, mientras salía de la cueva, pisó una rama con tan mala fortuna que el ruido de la madera crujiendo despertó al jaguar",
        checkDetails: `Cautela ${stats.cautela}% · mínimo ${CAUTELA_THRESHOLD}%`,
        nextPhase: "angry-questions",
      });
    }
  }

  function resolveAngryApproach() {
    const statValue = stats[approach];
    const threshold = approach === "empatia" ? EMPATHY_THRESHOLD : COURAGE_THRESHOLD;
    const succeeds = meetsJaguarThreshold(statValue, threshold);
    if (!succeeds) {
      setEndingRoute("pesadilla");
      setNightmareEnding(true);
      presentSkillResult({
        stat: approach,
        outcome: "blocked",
        message: approach === "empatia"
          ? "El jaguar sigue furioso. La empatía de Limón no alcanza para atravesar el rugido y la cueva se oscurece."
          : "La valentía de Limón no alcanza para resistir la embestida. El jaguar lo devora y la cueva se oscurece.",
        checkDetails: `${approach === "empatia" ? "Empatía" : "Valentía"} ${statValue}% · mínimo ${threshold}%`,
        nextPhase: "nightmare",
      });
      return;
    }
    if (approach === "empatia") {
      setEndingRoute("empatia");
      presentSkillResult({
        stat: "empatia",
        outcome: "success",
        message: "Las palabras del limón atraviesan la furia. El jaguar deja de rugir y escucha.",
        checkDetails: `Empatía ${statValue}% · mínimo ${threshold}%`,
        nextPhase: "revelation",
      });
      return;
    }
    setEndingRoute("valentia");
    setFightStep(0);
    setFightFailures(0);
    presentSkillResult({
      stat: "valentia",
      outcome: "success",
      message: "El limón sostiene la mirada del jaguar. La bestia abre un espacio para una prueba física.",
      checkDetails: `Valentía ${statValue}% · mínimo ${threshold}%`,
      nextPhase: "fight",
    });
  }

  function resolveIngenio() {
    const succeeds = meetsJaguarThreshold(stats.ingenio, INGENUITY_THRESHOLD);
    if (succeeds) {
      setEndingRoute("enigmas");
      setBranch("laughing");
      presentSkillResult({
        stat: "ingenio",
        outcome: "success",
        message: `El limón resuelve el enigma: ${INGENUITY_ANSWER}`,
        checkDetails: `Ingenio ${stats.ingenio}% · mínimo ${INGENUITY_THRESHOLD}%`,
        nextPhase: "revelation",
      });
      return;
    }
    const nextFailureCount = ingenioFailures + 1;
    setIngenioFailures(nextFailureCount);
    if (nextFailureCount >= 2) {
      const failureText = "La carcajada del jaguar se convierte en un rugido. El limón se queda sin respuesta y la sombra del jaguar lo envuelve.";
      setBranch("angry");
      setEndingRoute("pesadilla");
      setNightmareEnding(true);
      presentSkillResult({
        stat: "ingenio",
        outcome: "failure",
        message: failureText,
        checkDetails: `Ingenio ${stats.ingenio}% · mínimo ${INGENUITY_THRESHOLD}%`,
        nextPhase: "nightmare",
      });
      return;
    }
    const failureText = "El último acertijo se le escapa al limón. El jaguar suelta una carcajada y vuelve a plantear sus tres enigmas, como al principio.";
    setStats({ ...(laughingEntryStats ?? stats) });
    setBranch("laughing");
    setLaughingStep(0);
    presentSkillResult({
      stat: "ingenio",
      outcome: "failure",
      message: failureText,
      checkDetails: `Ingenio ${stats.ingenio}% · mínimo ${INGENUITY_THRESHOLD}%`,
      nextPhase: "laughing-questions",
    });
  }

  function chooseFightMove(isSafeMove: boolean) {
    const next = fightStep + 1;
    const nextFailures = fightFailures + (isSafeMove ? 0 : 1);
    setFightStep(next);
    setFightFailures(nextFailures);
    const result = resolveFightOutcome(nextFailures, next, FIGHT_ROUNDS.length);
    if (result === "nightmare") {
      setEndingRoute("pesadilla");
      setNightmareEnding(true);
      setOutcomeNote("El jaguar alcanza al limón. Su rugido llena la cueva y, por un instante, todo se vuelve oscuridad.");
      setFeedback("");
      setPhase("nightmare");
      return;
    }
    if (result === "victory") {
      setEndingRoute("valentia");
      setOutcomeNote(nextFailures === 0
        ? "El limón esquiva los tres ataques y se mantiene en pie. La fuerza del jaguar se convierte en una última revelación."
        : "Aunque un golpe alcanza al limón, consigue esquivar los otros dos y se mantiene en pie. La fuerza del jaguar se convierte en una última revelación.");
      setPhase("revelation");
      return;
    }
    setFeedback(isSafeMove ? "El limón esquiva el movimiento y encuentra el siguiente hueco." : "El ataque alcanza al limón, pero todavía puede continuar la pelea.");
  }

  function resetEncounter() {
    setStats(createInitialJaguarStats(history));
    setPhase("inner");
    setBranch(null);
    setInnerStep(0);
    setAngryStep(0);
    setLaughingStep(0);
    setApproach("empatia");
    setFightStep(0);
    setFightFailures(0);


    setNightmareEnding(false);
    setIngenioFailures(0);
    setLaughingEntryStats(null);
    setEndingRoute(null);
    setOutcomeNote("");
    setFeedback("");
    setSkillResult(null);
    setSeedJustCollected(false);
  }

  function prepareTest(kind: "angry" | "laughing" | "lowIngenio" | "secondIngenioFail" | "fight" | "fightSecondFail" | "nightmare" | "empathySuccess" | "empathyFail" | "determinationSuccess" | "determinationFail" | "ingenioSuccess" | "cautelaSuccess" | "cautelaFail") {
    const testStats: JaguarStats = {
      cautela: 72,
      empatia: 76,
      ingenio: kind === "lowIngenio" || kind === "secondIngenioFail" ? INGENUITY_THRESHOLD - 1 : 96,
      valentia: 78,
    };
    let nextStats = testStats;
    let nextPhase: Phase = "angry-questions";
    let nextBranch: Branch = "angry";
    let nextApproach: Approach = "empatia";
    let nextFightStep = 0;
    let nextFightFailures = 0;
    if (kind === "cautelaSuccess" || kind === "cautelaFail") {
      nextPhase = "cautela-check";
      nextBranch = null;
      nextStats = { ...testStats, cautela: kind === "cautelaSuccess" ? CAUTELA_THRESHOLD : CAUTELA_THRESHOLD - 1 };
    } else if (kind === "laughing") {
      nextPhase = "laughing-questions";
      nextBranch = "laughing";
    } else if (kind === "lowIngenio" || kind === "secondIngenioFail") {
      nextPhase = "ingenio-check";
      nextBranch = "laughing";
    } else if (kind === "ingenioSuccess") {
      nextPhase = "ingenio-check";
      nextBranch = "laughing";
      nextStats = { ...testStats, ingenio: INGENUITY_THRESHOLD };
    } else if (kind === "empathySuccess") {
      nextPhase = "angry-check";
      nextStats = { ...testStats, empatia: EMPATHY_THRESHOLD };
    } else if (kind === "empathyFail") {
      nextPhase = "angry-check";
      nextStats = { ...testStats, empatia: EMPATHY_THRESHOLD - 1 };
    } else if (kind === "determinationSuccess") {
      nextPhase = "angry-check";
      nextApproach = "valentia";
      nextStats = { ...testStats, valentia: COURAGE_THRESHOLD };
    } else if (kind === "determinationFail") {
      nextPhase = "angry-check";
      nextApproach = "valentia";
      nextStats = { ...testStats, valentia: COURAGE_THRESHOLD - 1 };
    } else if (kind === "fight" || kind === "fightSecondFail") {
      nextPhase = "fight";
      if (kind === "fightSecondFail") {
        nextFightStep = 2;
        nextFightFailures = 1;
      }
    } else if (kind === "nightmare") {
      nextPhase = "nightmare";
    }
    setStats(nextStats);
    const startsInLaughingRoute = kind === "laughing" || kind === "lowIngenio" || kind === "secondIngenioFail" || kind === "ingenioSuccess";
    const entrySnapshot = { ...nextStats };
    if (kind === "lowIngenio") entrySnapshot.ingenio = INGENUITY_THRESHOLD - 1;
    setLaughingEntryStats(startsInLaughingRoute ? entrySnapshot : null);
    setBranch(nextBranch);
    setInnerStep(0);
    setAngryStep(0);
    setLaughingStep(0);
    setApproach(nextApproach);
    setFightStep(nextFightStep);
    setFightFailures(nextFightFailures);

    setNightmareEnding(kind === "nightmare");
    setEndingRoute(kind === "nightmare" || kind === "determinationFail"
      ? "pesadilla"
      : kind === "ingenioSuccess" || kind === "laughing" || kind === "lowIngenio" || kind === "secondIngenioFail"
        ? "enigmas"
      : kind === "fight" || kind === "fightSecondFail" || kind === "determinationSuccess"
          ? "valentia"
          : "empatia");
    setOutcomeNote("");
    setSkillResult(null);
    setFeedback("Atajo de prueba: se mantienen disponibles las reglas y respuestas de la ruta seleccionada.");
    setPhase(nextPhase);
  }

  const question = phase === "inner"
    ? INNER_QUESTIONS[innerStep]
    : phase === "angry-questions"
      ? ANGRY_QUESTIONS[angryStep]
      : phase === "laughing-questions"
        ? LAUGHING_QUESTIONS[laughingStep]
        : null;
  const questionIndex = phase === "inner" ? innerStep : phase === "angry-questions" ? angryStep : laughingStep;
  const questionTotal = phase === "inner" ? INNER_QUESTIONS.length : phase === "angry-questions" ? ANGRY_QUESTIONS.length : LAUGHING_QUESTIONS.length;
  const hintStage = phase === "inner" || phase === "cautela-check" || phase === "angry-questions" || phase === "angry-check" || phase === "laughing-questions" || phase === "ingenio-check" ? phase : null;
  const hummingbirdHint = hintStage ? getJaguarHummingbirdHint(hintStage, approach) : null;
  const hummingbirdHintContext = question ? `${phase}:${questionIndex}` : `${phase}:${approach}`;
  const hummingbirdHintVisible = hummingbirdHint !== null && shownHummingbirdHintContext === hummingbirdHintContext;
  const nightmareArtworkVisible = nightmareEnding && (phase === "nightmare" || phase === "counsel" || phase === "complete");
  const successfulEndingArtworkVisible = !nightmareEnding && (phase === "revelation" || phase === "counsel");
  const showReturnPortal = phase === "complete" && !nightmareEnding;
  const endingArtwork = nightmareArtworkVisible
    ? "/jaguar-ending-pesadilla.webp"
    : successfulEndingArtworkVisible && endingRoute === "enigmas"
      ? "/jaguar-ending-enigmas.webp"
      : successfulEndingArtworkVisible && endingRoute === "valentia"
        ? "/jaguar-ending-valentia.webp"
      : successfulEndingArtworkVisible && endingRoute === "empatia"
          ? "/jaguar-ending-empatia.webp"
          : null;
  const showJaguarLayers = !endingArtwork && !showReturnPortal;
  const jaguarCharacterArt = branch === "angry"
    ? "/jaguar-angry-overlay.webp"
    : branch === "laughing"
      ? "/jaguar-laughing-overlay.webp"
      : null;

  return (
    <div className={`jaguar-preview-layout${testMode ? " jaguar-preview-layout-test" : ""}`}>
    <div className={`scene-stage game-screen jaguar-stage${branch ? ` jaguar-stage-${branch}` : ""}`} role="group" aria-label="El Jaguar: encuentro final con pruebas por umbral">
      <div className="jaguar-forest" aria-hidden="true">
        <img className={endingArtwork ? "jaguar-ending-art" : showReturnPortal ? "jaguar-cave-art" : "jaguar-background-art"} src={gameAssetUrl(endingArtwork ?? "/jaguar-cave-background.webp")} alt="" />
        {showJaguarLayers && <div className="jaguar-forest-shade" />}
        {showJaguarLayers && <>
          {!branch && <div className="jaguar-eyes"><i /><i /></div>}
          {branch && jaguarCharacterArt && <img className={`jaguar-character-art is-${branch}`} src={gameAssetUrl(jaguarCharacterArt)} alt="" />}
        </>}
      </div>
      {hummingbirdOutcome === "good" && showJaguarLayers && <button
        type="button"
        className={`jaguar-hummingbird-button${hummingbirdHint ? " is-help-available" : ""}${hummingbirdHintVisible ? " is-hint-open" : ""}`}
        onClick={() => hummingbirdHint && setShownHummingbirdHintContext(hummingbirdHintVisible ? null : hummingbirdHintContext)}
        disabled={!hummingbirdHint}
        aria-label={hummingbirdHint ? "Pulsar al colibrí para escuchar una pista" : "Colibrí"}
        aria-expanded={hummingbirdHint ? hummingbirdHintVisible : undefined}
        aria-controls={hummingbirdHint ? "jaguar-hummingbird-hint" : undefined}
      >
        <img className="jaguar-hummingbird" src={gameAssetUrl("/colibri.gif")} alt="" />
      </button>}
      {showReturnPortal && <div className="jaguar-home-portal" aria-hidden="true"><span /></div>}
      <main key={`${phase}-${innerStep}-${angryStep}-${laughingStep}-${fightStep}-${endingRoute ?? "none"}`} className="jaguar-dialogue" aria-live="polite">
        {feedback && <p className="jaguar-feedback" role="status">{feedback}</p>}
        {hummingbirdOutcome === "good" && hummingbirdHint && <p id="jaguar-hummingbird-hint" className="jaguar-hummingbird-hint" role="status" hidden={!hummingbirdHintVisible}>{hummingbirdHint}</p>}
        {phase === "skill-result" && skillResult && <div className="jaguar-skill-result" role="status">
          <p className="jaguar-skill-message">{skillResult.message}</p>
          <button type="button" className="jaguar-primary-button" onClick={transitionAction(continueAfterSkillResult)}>Continuar</button>
        </div>}
        {question && <>
          <div className="jaguar-speaker-row"><span>{question.speaker}</span><small>{questionIndex + 1} / {questionTotal}</small></div>
            <p className={`jaguar-prompt${question.speaker.toUpperCase().includes("JAGUAR") ? " is-jaguar" : ""}`}>{question.prompt}</p>
            <div className="jaguar-answers">
              {question.answers.map((answer, index) => (
              <button key={answer.label} type="button" className="jaguar-answer" onClick={transitionAction(() => applyAnswer(question, index, questionIndex, phase === "inner" ? "inner" : phase === "angry-questions" ? "angry" : "laughing"))}>
                <span>{answer.label}</span>
                {testMode && <small>{Object.entries(scaleJaguarAnswerEffects(answer.effects)).map(([stat, value]) => `${STAT_LABELS[stat as keyof JaguarStats]} ${Number(value) > 0 ? "+" : ""}${value}`).join(" · ")}</small>}
              </button>
            ))}
          </div>
        </>}

        {phase === "cautela-check" && <div className="jaguar-check-card">
          <span className="jaguar-check-label">EL BOSQUE CONTIENE EL ALIENTO</span>
          <p>El limón sabe que hay alguien ahí. ¿Conseguirá apartarse sin revelar que lo ha descubierto?</p>
          {testMode && <p className="jaguar-check-rule">Cautela actual: {stats.cautela}%. Con {CAUTELA_THRESHOLD}% o más el jaguar se ríe; con menos, sale enfadado.</p>}
          <button type="button" className="jaguar-primary-button" onClick={transitionAction(resolveCautela)}>Avanzar con cuidado</button>
        </div>}

        {phase === "angry-check" && <div className="jaguar-check-card">
          <span className="jaguar-check-label">{approach === "empatia" ? "ESCUCHAR TRAS EL RUGIDO" : "SOSTENERSE ANTE EL RUGIDO"}</span>
          <p>{approach === "empatia"
            ? "Bajo el rugido del jaguar, el limón percibe una herida. Decide escuchar sin juzgar: ¿alcanzará el umbral de Empatía para que el jaguar confíe en él?"
            : "El jaguar raspa la tierra y se prepara para embestir. El limón planta las raíces y sostiene la mirada: ¿alcanzará el umbral de Valentía para mantenerse firme ante el miedo?"}</p>
          {testMode && <p className="jaguar-check-rule">Ruta: {approach === "empatia" ? `Empatía ${stats.empatia}% · umbral ${EMPATHY_THRESHOLD}%` : `Valentía ${stats.valentia}% · umbral ${COURAGE_THRESHOLD}%`}</p>}
          <button type="button" className="jaguar-primary-button" onClick={transitionAction(resolveAngryApproach)}>{approach === "empatia" ? "Acercarse sin juzgar" : "Mantenerse firme"}</button>
        </div>}

        {phase === "ingenio-check" && <div className="jaguar-check-card">
          <span className="jaguar-check-label">EL ÚLTIMO ENIGMA</span>
          <p>{INGENUITY_RIDDLE}</p>
          {testMode && <p className="jaguar-threshold"><strong>{stats.ingenio}%</strong><span>Ingenio actual · umbral {INGENUITY_THRESHOLD}%</span><i><b style={{ width: `${Math.min(stats.ingenio / INGENUITY_THRESHOLD * 100, 100)}%` }} /></i></p>}
          {outcomeNote && <p className="jaguar-outcome-note">{outcomeNote}</p>}
          <button type="button" className="jaguar-primary-button" onClick={transitionAction(resolveIngenio)}>Responder al enigma</button>
        </div>}

        {phase === "fight" && <div className="jaguar-check-card jaguar-fight-card">
          <span className="jaguar-check-label">MINIJUEGO · MANTENERSE EN PIE</span>
          {testMode && <p className="jaguar-check-rule">Movimientos: {fightStep}/3 · fallos: {fightFailures}/2</p>}
          {fightStep < FIGHT_ROUNDS.length ? <>
            <p className="jaguar-fight-threat">{FIGHT_ROUNDS[fightStep].threat}</p>
              <p>{FIGHT_ROUNDS[fightStep].prompt} (movimiento {fightStep + 1} de {FIGHT_ROUNDS.length})</p>
              <div className="jaguar-answers">
                {[FIGHT_ROUNDS[fightStep].safe, "Quedarse quieto y cerrar los ojos.", "Correr directamente hacia el jaguar."].map((move, index) => (
                <button key={move} type="button" className="jaguar-answer" onClick={transitionAction(() => chooseFightMove(index === 0))}>{move}</button>
                ))}
              </div>
          </> : <p>El jaguar baja la cabeza; el sueño empieza a revelar su verdadero rostro.</p>}
        </div>}

        {phase === "nightmare" && <div className="jaguar-check-card jaguar-nightmare-card">
          <span className="jaguar-check-label">AL DESPERTAR</span>
          {outcomeNote && <p className="jaguar-outcome-note">{outcomeNote}</p>}
          <p>Un instante después, el limón abre los ojos debajo de su cama. La jungla y el jaguar se desvanecen: todo había sido un sueño. Delante de él brilla la última semilla, que había estado allí todo el tiempo.</p>
          <p>Resuena la voz en off del jaguar:</p>
          <blockquote>{NIGHTMARE_VOICEOVER}</blockquote>
          <p>El limón recoge la semilla y vuelve tranquilo a dormir.</p>
          <div className="jaguar-seed-action">
            {seedCollected || seedJustCollected ? <div className="jaguar-seed-found"><SeedGlyph seed="el-jaguar" /><span>La última semilla está en el Libro.</span></div> : <button type="button" className="jaguar-seed-button" onClick={transitionAction(() => { setSeedJustCollected(true); setPhase("complete"); onCollectSeed(); })} aria-label="Guardar la última semilla y volver a dormir"><SeedGlyph seed="el-jaguar" /><span>Guardar la semilla y volver a dormir</span></button>}
          </div>
          {(seedCollected || seedJustCollected) && <button type="button" className="jaguar-primary-button" onClick={transitionAction(() => setPhase("complete"))}>Seguir durmiendo</button>}
        </div>}

        {phase === "revelation" && <div className="jaguar-check-card jaguar-revelation-card">
          <span className="jaguar-check-label">LA VERDAD DEL SUEÑO</span>
          {outcomeNote && <p className="jaguar-outcome-note">{outcomeNote}</p>}
          <p>El jaguar deja de ser una bestia y se revela como un dios del conocimiento: ha estado hablando con el limón a través de sus sueños.</p>
          <p>Él envió <strong>el incendio y la lluvia</strong>, ambos, para poner a prueba la amistad entre el limón y el colibrí. «No era una prueba para ver si podíais vencer al fuego —dice—, sino para saber si seguiríais eligiéndoos después».</p>
          <button type="button" className="jaguar-primary-button" onClick={transitionAction(() => setPhase("counsel"))}>Escuchar el consejo final</button>
        </div>}

        {phase === "counsel" && <div className="jaguar-check-card jaguar-counsel-card">
          <span className="jaguar-check-label">{nightmareEnding ? "FINAL DE PESADILLA" : `CONSEJO DEL JAGUAR${testMode ? ` · ${STAT_LABELS[advice.stat].toUpperCase()}` : ""}`}</span>
          {nightmareEnding && <>
            <p>El limón despierta de la pesadilla. Bajo la cama encuentra la última semilla, que había estado allí todo el tiempo. Sin llegar a descubrir quién era el jaguar, la recoge.</p>
            <p>Resuena la voz en off del jaguar:</p>
            <blockquote>{NIGHTMARE_VOICEOVER}</blockquote>
            <p>Luego el limón vuelve tranquilo a dormir.</p>
          </>}
          {branch === "angry" && !nightmareEnding && <p>El jaguar entrega la última semilla sin exigir una victoria. Su furia también era parte de la prueba.</p>}
          {branch === "laughing" && <p>El jaguar deja de reírse. «Has aprendido a mirar por debajo de la primera respuesta.» Y entrega la última semilla.</p>}
          {!nightmareEnding && <blockquote>{advice.text}</blockquote>}
          <div className="jaguar-seed-action">
            {seedCollected || seedJustCollected ? <div className="jaguar-seed-found"><SeedGlyph seed="el-jaguar" /><span>La última semilla está en el Libro.</span></div> : <button type="button" className="jaguar-seed-button" onClick={transitionAction(() => { setSeedJustCollected(true); setPhase("complete"); onCollectSeed(); })} aria-label={nightmareEnding ? "Guardar la última semilla y volver a dormir" : "Recoger la última semilla de El Jaguar"}><SeedGlyph seed="el-jaguar" /><span>{nightmareEnding ? "Guardar la semilla y volver a dormir" : "Recoger la última semilla"}</span></button>}
          </div>
          {(seedCollected || seedJustCollected) && <button type="button" className="jaguar-primary-button" onClick={transitionAction(() => setPhase("complete"))}>{nightmareEnding ? "Seguir durmiendo" : "Abrir el portal"}</button>}
          {(seedCollected || seedJustCollected) && <button type="button" className="jaguar-reset-button" onClick={transitionAction(resetEncounter)}>Volver a probar el encuentro</button>}
        </div>}

        {phase === "complete" && <div className="jaguar-check-card jaguar-counsel-card">
          <span className="jaguar-check-label">{nightmareEnding ? "FINAL DE PESADILLA · SEMILLA ENCONTRADA" : "SEMILLA DEL JAGUAR · RECOGIDA"}</span>
          {nightmareEnding ? <>
            <p>La semilla que buscabas estuvo debajo de tu cama todo el tiempo, Limón. Es la semilla que te generó.</p>
            <p>La última semilla está a salvo en el Libro. El limón vuelve tranquilo a dormir, sin descubrir quién era el jaguar.</p>
            <p>Puedes consultar el Libro de Semillas desde aquí sin despertarlo.</p>
          </> : <>
            <p>El Jaguar abre de nuevo el portal. Al otro lado espera la casa del limón, junto a su árbol y al Libro de Semillas.</p>
            <button type="button" className="jaguar-primary-button" onClick={transitionAction(onReturnHome)}>Volver a casa por el portal</button>
          </>}
        </div>}
      </main>
    </div>
    {testMode && <aside className="jaguar-debug-panel" aria-label="Controles externos del modo de prueba">
      <div className="jaguar-test-tools" aria-label="Atajos de prueba de desarrollo">
        <span>MODO DE PRUEBA</span>
        <button type="button" onClick={transitionAction(resetEncounter)}>Volver al inicio · reiniciar stats</button>
        <button type="button" onClick={transitionAction(() => prepareTest("cautelaSuccess"))}>Cautela ≥ 70 → burlona / Ingenio</button>
        <button type="button" onClick={transitionAction(() => prepareTest("cautelaFail"))}>Cautela &lt; 70 → furiosa / Empatía o Valentía</button>
        <button type="button" onClick={transitionAction(() => { prepareTest("angry"); setBranch("angry"); setFeedback("Atajo de prueba: rama enfadada, después del crujido de la rama."); })}>Rama enfadada</button>
        <button type="button" onClick={transitionAction(() => { prepareTest("laughing"); setBranch("laughing"); setFeedback("Atajo de prueba: rama burlona, después de «¿Quién anda ahí?». "); })}>Rama burlona / Ingenio</button>
        <button type="button" onClick={transitionAction(() => { prepareTest("lowIngenio"); setFeedback("Atajo de prueba: Ingenio por debajo del 70%; si falla, el jaguar se ríe y repite los enigmas."); })}>Probar umbral de Ingenio 70%</button>
        <button type="button" onClick={transitionAction(() => prepareTest("ingenioSuccess"))}>Ingenio ≥ 70 → éxito</button>
        <button type="button" onClick={transitionAction(() => { prepareTest("secondIngenioFail"); setFeedback("Atajo de prueba: primera falla contabilizada; la comprobación determinista de Ingenio fallará de nuevo."); })}>Ingenio · 2.º fallo → pesadilla</button>
        <button type="button" onClick={transitionAction(() => prepareTest("empathySuccess"))}>Empatía ≥ 70% → éxito</button>
        <button type="button" onClick={transitionAction(() => { prepareTest("empathyFail"); setFeedback("Atajo de prueba: Empatía inferior a 70; conduce directamente a pesadilla."); })}>Empatía &lt; 70% → pesadilla</button>
        <button type="button" onClick={transitionAction(() => prepareTest("determinationSuccess"))}>Valentía ≥ 70% → combate</button>
        <button type="button" onClick={transitionAction(() => prepareTest("determinationFail"))}>Valentía &lt; 70% → pesadilla</button>
        <button type="button" onClick={transitionAction(() => prepareTest("fight"))}>Probar minijuego</button>
        <button type="button" onClick={transitionAction(() => { prepareTest("fightSecondFail"); setFeedback("Atajo: ya hay un movimiento fallido; falla el último para comprobar la pesadilla."); })}>Minijuego · 2 fallos → pesadilla</button>
        <button type="button" onClick={transitionAction(() => prepareTest("nightmare"))}>Probar pesadilla</button>
      </div>
    </aside>}
    </div>
  );
}
