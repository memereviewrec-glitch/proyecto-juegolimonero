import { useEffect, useMemo, useState, type MouseEvent } from "react";
import { AmpCloseup, CableCloseup, CableSceneArt, GuitarCloseup, type FretSelection } from "../components/RoomCloseups";
import { LemonSprite } from "../components/GameSprites";
import { RuinsColumnPuzzle, type RuinsColumnSide } from "../components/RuinsColumnPuzzle";
import { RuinsScene, type RuinsFlowerStage } from "../components/RuinsScene";
import { SeedBook, type SeedSongId } from "../components/SeedBook";
import "./home.css";

type Scene = "room" | "dawn" | "ruins";
type RoomPhase = "guitar-cable" | "amp-cable" | "power" | "play" | "portal";
type RoomTarget = "guitar" | "amp" | "cable";
type RoomAction = "examine-cable" | "examine" | "play" | "guitar-unplugged" | "amp-off" | null;
type RoomView = "scene" | "cable" | "amp" | "guitar";
type Branch = "A" | "B";
type Response = "restart" | Branch;

const WALK_DURATION_MS = 3800;
const PORTAL_TRANSIT_DURATION_MS = 2800;
const PORTAL_ARRIVAL_DURATION_MS = 4800;
const DAWN_FLOWER_DELAY_MS = 2600;
const FLOWER_SEED_DROP_MS = 1900;
const LEMON_WHISTLE_DURATION_MS = 2200;

function motionDuration(duration: number) {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
}

const C_SHARP_MINOR_SCALE = new Set(["Do#", "Re#", "Mi", "Fa#", "Sol#", "La", "Si"]);

const DIALOGUE = [
  {
    prompt: "¿Hay alguien ahí?",
    restart: "Repetir la pregunta",
    a: "Llamar a la sierra",
    b: "Escuchar en silencio",
  },
  {
    prompt: "No veo a nadie. ¿Estoy solo en esta dimensión?",
    restart: "Empezar de nuevo",
    a: "Mirar las ventanas",
    b: "Escuchar el valle",
  },
  {
    prompt: "¿Hago una señal, o dejo que el mundo conteste?",
    restart: "Volver al principio",
    a: "Llamar otra vez",
    b: "Esperar en silencio",
  },
];

function FlowerSprite({ open }: { open: boolean }) {
  return (
    <svg className={`flower-bloom${open ? " flower-bloom-open" : ""}`} viewBox="0 0 64 64" aria-hidden="true" shapeRendering="crispEdges">
      <g className="flower-petals" fill="#f4edcf" stroke="#6e5d6c" strokeWidth="2">
        <rect x="27" y="3" width="10" height="18" />
        <rect x="42" y="9" width="15" height="10" />
        <rect x="43" y="26" width="17" height="10" />
        <rect x="39" y="40" width="14" height="12" />
        <rect x="26" y="42" width="12" height="17" />
        <rect x="11" y="39" width="14" height="12" />
        <rect x="4" y="25" width="17" height="11" />
        <rect x="8" y="10" width="15" height="11" />
      </g>
      <g className="flower-heart">
        <rect x="25" y="25" width="15" height="15" fill="#f2ca52" stroke="#514348" strokeWidth="2" />
        <rect x="29" y="29" width="4" height="4" fill="#fff0a2" />
      </g>
    </svg>
  );
}

const activeGameAudio = new Set<HTMLAudioElement>();

function stopGameAudio() {
  activeGameAudio.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  activeGameAudio.clear();
}

function playMp3Sample(source: string, volume: number) {
  if (typeof window === "undefined") return;
  const audio = new Audio(source);
  audio.volume = Math.max(0, Math.min(1, volume));
  activeGameAudio.add(audio);
  const remove = () => activeGameAudio.delete(audio);
  audio.addEventListener("ended", remove, { once: true });
  void audio.play().catch(remove);
}

function playFrequencies(frequencies: number[]) {
  if (typeof window === "undefined" || frequencies.length === 0) return;
  stopGameAudio();
  frequencies.forEach(frequency => {
    const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
    if (midi < 40 || midi > 73) return;
    playMp3Sample(`/audio/guitar/guitar-midi-${midi}.mp3`, 0.48 / frequencies.length);
  });
}

function playWhistle(source: "lemon" | "birds") {
  stopGameAudio();
  playMp3Sample(source === "birds" ? "/audio/bird-whistles.mp3" : "/audio/lemon-whistle.mp3", 0.32);
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

function resolveBranch(scoreA: number, scoreB: number): Branch {
  const chanceA = clamp(50 + (scoreA - scoreB) * 12, 14, 86);
  return chanceA > 50 ? "A" : chanceA < 50 ? "B" : Math.random() < 0.5 ? "A" : "B";
}

function dawnWalkableTop(x: number) {
  const terrain = [[0, 68], [16, 69], [30, 73], [43, 77], [58, 79], [72, 78], [84, 82], [100, 85]] as const;
  for (let index = 1; index < terrain.length; index += 1) {
    const [rightX, rightY] = terrain[index];
    const [leftX, leftY] = terrain[index - 1];
    if (x <= rightX) return leftY + (rightY - leftY) * ((x - leftX) / (rightX - leftX));
  }
  return terrain[terrain.length - 1][1];
}

export default function Home() {
  const [scene, setScene] = useState<Scene>("room");
  const [seedBookOpen, setSeedBookOpen] = useState(false);
  const [roomPhase, setRoomPhase] = useState<RoomPhase>("guitar-cable");
  const [roomView, setRoomView] = useState<RoomView>("scene");
  const [pluggedGuitar, setPluggedGuitar] = useState(false);
  const [pluggedAmp, setPluggedAmp] = useState(false);
  const [ampOn, setAmpOn] = useState(false);
  const [roomAction, setRoomAction] = useState<RoomAction>(null);
  const [lemonPosition, setLemonPosition] = useState("lemon-left");
  const [lemonFloorPoint, setLemonFloorPoint] = useState<{ x: number; bottom: number } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [dawnLemonPoint, setDawnLemonPoint] = useState<{ x: number; bottom: number } | null>(null);
  const [dawnIsMoving, setDawnIsMoving] = useState(false);
  const [selectedFrets, setSelectedFrets] = useState<FretSelection[]>([]);
  const [portalOpen, setPortalOpen] = useState(false);
  const [portalTransit, setPortalTransit] = useState(false);
  const [arrivalPortal, setArrivalPortal] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);

  const [dialogueStarted, setDialogueStarted] = useState(false);
  const [showDialogueChoices, setShowDialogueChoices] = useState(false);
  const [dialogueTurn, setDialogueTurn] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [pendingBranch, setPendingBranch] = useState<Branch | null>(null);
  const [birdsPassed, setBirdsPassed] = useState(false);
  const [sunRisen, setSunRisen] = useState(false);
  const [flowerOpen, setFlowerOpen] = useState(false);
  const [seedAvailable, setSeedAvailable] = useState(false);
  const [seedCollected, setSeedCollected] = useState(false);
  const [leftColumnRevealed, setLeftColumnRevealed] = useState(false);
  const [rightColumnRevealed, setRightColumnRevealed] = useState(false);
  const [ruinsView, setRuinsView] = useState<"scene" | RuinsColumnSide>("scene");
  const [ruinsAction, setRuinsAction] = useState<RuinsColumnSide | null>(null);
  const [ruinsFlowerStage, setRuinsFlowerStage] = useState<RuinsFlowerStage>("hidden");
  const [rootsSeedCollected, setRootsSeedCollected] = useState(false);
  const [lemonWhistling, setLemonWhistling] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!leftColumnRevealed || !rightColumnRevealed) return;
    setRuinsFlowerStage("growing");
    const openTimer = window.setTimeout(() => setRuinsFlowerStage("open"), motionDuration(1700));
    const fallTimer = window.setTimeout(() => setRuinsFlowerStage("falling"), motionDuration(3100));
    const seedTimer = window.setTimeout(() => setRuinsFlowerStage("seed"), motionDuration(4200));
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(fallTimer);
      window.clearTimeout(seedTimer);
    };
  }, [leftColumnRevealed, rightColumnRevealed]);

  const validChord = useMemo(
    () => {
      const pitchClasses = new Set(selectedFrets.map(note => note.noteId));
      return pitchClasses.size >= 2 && pitchClasses.has("Do#") && [...pitchClasses].every(note => C_SHARP_MINOR_SCALE.has(note));
    },
    [selectedFrets],
  );

  function moveTo(position: string, callback: () => void) {
    setLemonFloorPoint(null);
    setIsMoving(true);
    setLemonPosition(position);
    window.setTimeout(() => {
      setIsMoving(false);
      callback();
    }, motionDuration(WALK_DURATION_MS));
  }

  function handleRoomStageClick(event: MouseEvent<HTMLDivElement>) {
    if (roomView !== "scene" || roomAction || isMoving || portalTransit) return;
    if (event.target instanceof Element && event.target.closest("button")) return;
    const world = event.currentTarget.querySelector(".room-world");
    if (!world) return;
    const bounds = world.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right) return;
    const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 8, 92);
    const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 3, 97);
    if (y < 78 || y > 96) return;
    setRoomAction(null);
    setLemonPosition("lemon-free");
    setLemonFloorPoint({ x, bottom: 100 - y });
    setIsMoving(true);
    window.setTimeout(() => setIsMoving(false), motionDuration(WALK_DURATION_MS));
  }

  function handleDawnStageClick(event: MouseEvent<HTMLDivElement>) {
    if (dawnIsMoving || arrivalPortal) return;
    if (event.target instanceof Element && event.target.closest("button")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 7, 93);
    const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 3, 96);
    if (y < dawnWalkableTop(x) + 2 || y > 95) return;
    setDawnLemonPoint({ x, bottom: 100 - y });
    setDawnIsMoving(true);
    window.setTimeout(() => setDawnIsMoving(false), motionDuration(WALK_DURATION_MS));
  }

  function advanceDialogue() {
    setShowDialogueChoices(true);
  }

  function handleRoomHotspot(target: RoomTarget) {
    if (isMoving || roomAction || roomView !== "scene" || portalOpen) return;
    if (target === "cable") {
      moveTo("lemon-cable", () => setRoomAction("examine-cable"));
      setNotice("El cable une los instrumentos. Examínalo para conectar sus dos puntas.");
      return;
    }
    if (target === "guitar") {
      if (!pluggedGuitar || !pluggedAmp) {
        setRoomAction("guitar-unplugged");
        setNotice("La guitarra no está enchufada. Tengo que conectar el cable antes de tocar.");
        return;
      }
      if (!ampOn) {
        setRoomAction("amp-off");
        setNotice("La guitarra ya está conectada, pero el amplificador sigue apagado.");
        return;
      }
      moveTo("lemon-guitar", () => setRoomAction("play"));
      setNotice("El amplificador está encendido. Ya puedes tocar.");
      return;
    }
    if (target === "amp" && pluggedGuitar && pluggedAmp) {
      moveTo("lemon-amp", () => setRoomAction("examine"));
      setNotice(ampOn ? "El amplificador está encendido." : "El cable está conectado por ambos extremos. Examina y enciende el amplificador.");
    }
  }

  function performRoomAction() {
    if (roomAction === "guitar-unplugged" || roomAction === "amp-off") {
      setRoomAction(null);
      return;
    }
    if (roomAction === "examine-cable") {
      setRoomView("cable");
      setRoomAction(null);
    } else if (roomAction === "examine") {
      setRoomView("amp");
      setRoomAction(null);
    } else if (roomAction === "play") {
      setRoomView("guitar");
      setRoomAction(null);
      setNotice("Pulsa una cuerda y un traste; después toca la selección.");
    }
  }

  function connectCableEnd(end: "a" | "b", target: "guitar" | "amp") {
    if (end === "a" && target === "guitar" && !pluggedGuitar && roomPhase === "guitar-cable") {
      setPluggedGuitar(true);
      setRoomPhase("amp-cable");
      setNotice("Primera punta conectada a la guitarra. Ahora lleva la otra al amplificador.");
      return;
    }
    if (end === "b" && target === "amp" && pluggedGuitar && !pluggedAmp && roomPhase === "amp-cable") {
      setPluggedAmp(true);
      setRoomPhase("power");
      setNotice("Las dos puntas están conectadas. Acércate al amplificador para examinarlo.");
      return;
    }
    setNotice(end === "a" ? "Primero arrastra la punta A a la guitarra." : "La punta B va después, a la entrada del amplificador.");
  }

  function toggleAmplifier() {
    const nextState = !ampOn;
    setAmpOn(nextState);
    if (nextState) {
      setNotice("El piloto rojo está encendido. Pulsa «Siguiente» para continuar.");
    } else {
      setRoomPhase("power");
      setNotice("Altavoz apagado. Enciéndelo para habilitar la guitarra.");
    }
  }

  function continueAfterAmplifier() {
    if (!ampOn) return;
    setRoomPhase("play");
    setRoomView("scene");
    setNotice("Altavoz encendido. Vuelve a la guitarra para tocar.");
  }

  function toggleFret(note: FretSelection) {
    setSelectedFrets(current => current.some(item => item.key === note.key)
      ? current.filter(item => item.key !== note.key)
      : [...current.filter(item => item.stringIndex !== note.stringIndex), note]);
  }

  function playSelection() {
    if (selectedFrets.length === 0) {
      setNotice("Pulsa una posición del mástil antes de tocar.");
      return;
    }
    playFrequencies(selectedFrets.map(note => note.frequency));
    const pitchClasses = new Set(selectedFrets.map(note => note.noteId));
    if (selectedFrets.length === 1) {
      setNotice(`${selectedFrets[0].label}: suena, pero una nota sola no abre el portal.`);
      return;
    }
    if (pitchClasses.size < 2) {
      setNotice("Las posiciones elegidas repiten la misma clase de nota; añade una nota diferente para formar un acorde.");
      return;
    }
    if (validChord) {
      setPortalOpen(true);
      setIntroStarted(true);
      setRoomPhase("portal");
      setRoomView("scene");
      setNotice("Acorde válido de Do♯ menor. El portal se abre y empieza la Intro.");
      return;
    }
    setNotice(`Ese conjunto (${selectedFrets.map(note => note.label).join(" · ")}) no abre el portal: usa Do♯ y solo notas de Do♯ menor.`);
  }

  function enterDawn() {
    if (!portalOpen || portalTransit) return;
    setPortalTransit(true);
    setIsMoving(false);
    setLemonFloorPoint(null);
    setLemonPosition("lemon-portal");
    setNotice("El limón salta hacia el portal.");
    window.setTimeout(() => {
      setDawnLemonPoint(null);
      setDawnIsMoving(false);
      setScene("dawn");
      setPortalTransit(false);
      setLemonPosition("lemon-left");
      setLemonFloorPoint(null);
      setRoomAction(null);
      setArrivalPortal(true);
      setNotice("El portal aparece ante el amanecer de la otra dimensión.");
      window.setTimeout(() => setArrivalPortal(false), motionDuration(PORTAL_ARRIVAL_DURATION_MS));
    }, motionDuration(PORTAL_TRANSIT_DURATION_MS));
  }

  function startDialogue() {
    setDialogueStarted(true);
    setShowDialogueChoices(false);
    setDialogueTurn(0);
    setScoreA(0);
    setScoreB(0);
    setBranch(null);
    setPendingBranch(null);
    setBirdsPassed(false);
    setSunRisen(false);
    setFlowerOpen(false);
    setSeedAvailable(false);
    setSeedCollected(false);
    setLemonWhistling(false);
    setNotice("El limón inicia una conversación consigo mismo.");
  }

  function chooseResponse(response: Response) {
    if (response === "restart") {
      startDialogue();
      setNotice("La conversación vuelve directamente a su primera línea.");
      return;
    }
    if (dialogueTurn >= DIALOGUE.length - 1 || branch !== null) return;

    const nextA = scoreA + (response === "A" ? 1 : 0);
    const nextB = scoreB + (response === "B" ? 1 : 0);
    const nextTurn = dialogueTurn + 1;
    setScoreA(nextA);
    setScoreB(nextB);

    if (nextTurn < DIALOGUE.length) {
      setDialogueTurn(nextTurn);
      setShowDialogueChoices(false);
      if (nextTurn === DIALOGUE.length - 1) {
        const outcome = resolveBranch(nextA, nextB);
        setPendingBranch(outcome);
        setNotice(`Las respuestas anteriores llevan al camino ${outcome}. La última pregunta ya solo ofrece su desenlace o reiniciar.`);
      } else {
        setNotice(`La elección favorece el camino ${response}. La conversación continúa.`);
      }
      return;
    }
  }

  function chooseFinalResponse() {
    if (!pendingBranch || branch !== null) return;
    setShowDialogueChoices(false);
    if (pendingBranch === "A") whistle("A");
    else listenToBirds("B");
  }

  function beginSunrise(message: string) {
    if (sunRisen) return;
    setSunRisen(true);
    setNotice(message);
    window.setTimeout(() => {
      setFlowerOpen(true);
      window.setTimeout(() => setSeedAvailable(true), motionDuration(FLOWER_SEED_DROP_MS));
    }, motionDuration(DAWN_FLOWER_DELAY_MS));
  }

  function whistle(outcome: Branch | null = branch) {
    if (outcome !== "A" || sunRisen) return;
    setBranch(outcome);
    playWhistle("lemon");
    setLemonWhistling(true);
    window.setTimeout(() => setLemonWhistling(false), motionDuration(LEMON_WHISTLE_DURATION_MS));
    beginSunrise("El limón silba. El cielo empieza a iluminarse y la flor se prepara para abrirse.");
  }

  function listenToBirds(outcome: Branch | null = branch) {
    if (outcome !== "B" || birdsPassed || sunRisen) return;
    setBranch(outcome);
    playWhistle("birds");
    setBirdsPassed(true);
    beginSunrise("El limón mira al cielo. Los pájaros silban mientras el amanecer ilumina la sierra.");
  }

  function collectSeed() {
    if (!seedAvailable) return;
    setSeedCollected(true);
    setNotice("Semilla recogida. «Ventana al sendero» queda como recompensa de esta pantalla.");
  }

  function openRuinsPuzzle() {
    if (!ruinsAction) return;
    setRuinsView(ruinsAction);
    setRuinsAction(null);
  }

  function revealRuinsColumn(side: RuinsColumnSide) {
    if (side === "left") setLeftColumnRevealed(true);
    else setRightColumnRevealed(true);
  }

  function collectRootsSeed() {
    if (ruinsFlowerStage !== "seed") return;
    setRootsSeedCollected(true);
    setNotice("La tercera semilla, «Raíces», queda en tu equipaje.");
  }

  function setVisitedScene(nextScene: Scene) {
    if (portalTransit || arrivalPortal) return;
    if (nextScene === "room" && scene !== "room") return;
    if (nextScene === "dawn" && (!portalOpen || scene === "ruins")) return;
    if (nextScene === "ruins" && !seedCollected) return;
    setScene(nextScene);
    if (nextScene === "ruins") setNotice("");
    setRoomView("scene");
    setRoomAction(null);
    setRuinsAction(null);
    setRuinsView("scene");
  }

  const discoveredSongIds: SeedSongId[] = [];
  if (portalOpen) discoveredSongIds.push("intro");
  if (seedCollected) discoveredSongIds.push("ventana");
  if (rootsSeedCollected) discoveredSongIds.push("raices");
  const currentDialogue = DIALOGUE[Math.min(dialogueTurn, DIALOGUE.length - 1)];
  const showOverlay = !portalTransit && !arrivalPortal && (scene === "room"
    ? roomView === "scene" && (Boolean(roomAction) || portalOpen)
    : scene === "dawn"
      ? dialogueStarted || branch !== null || sunRisen || seedAvailable || seedCollected
      : ruinsView === "scene" && (Boolean(ruinsAction) || ruinsFlowerStage === "seed" || rootsSeedCollected));

  return (
    <main className="explorer-shell">
      <header className="topbar">
        <a className="brand-lockup" href="#inicio" aria-label="Limonero Fuzz, inicio">
          <img src="/limonero-mark.svg" alt="" className="brand-icon" />
          <span><strong>Limonero Fuzz</strong><small>EXPLORADOR DEL GUION</small></span>
        </a>
        <div className="topbar-right">
          <span className="status-dot" /> <span className="status-copy">Preproducción interactiva</span>
          <a className="top-link" href="#storyboard">Ver storyboard</a>
        </div>
      </header>

      <section className="intro-band" id="inicio">
        <div className="intro-copy">
          <div className="eyebrow"><span>DISCO · 10 CANCIONES</span><span className="eyebrow-line" /></div>
          <h1>Tres pantallas.<br /><em>Un camino de vuelta.</em></h1>
          <p>Del primer acorde en el local vacío al amanecer de El Cuchillo y las ruinas cubiertas de raíces.</p>
        </div>
        <div className="intro-stamp" aria-label="Tres pantallas disponibles">
          <span className="stamp-big">03</span><span>PANTALLAS<br />EN EXPLORACIÓN</span>
        </div>
      </section>

      <nav className="screen-nav" aria-label="Seleccionar pantalla">
        <button className={`screen-tab ${scene === "room" ? "active" : ""}`} onClick={() => setVisitedScene("room")} disabled={scene !== "room" || portalTransit || arrivalPortal}>
          <span className="tab-number">01</span><span><strong>El local de ensayo</strong><small>La Intro · antes del portal</small></span><span className="tab-mark">{portalOpen ? "✓" : "•"}</span>
        </button>
        <button className={`screen-tab ${scene === "dawn" ? "active" : ""}`} onClick={() => setVisitedScene("dawn")} disabled={!portalOpen || scene === "ruins" || portalTransit || arrivalPortal}>
          <span className="tab-number">02</span><span><strong>El Cuchillo al amanecer</strong><small>Ventana al sendero</small></span><span className="tab-mark">{seedCollected ? "✓" : portalOpen ? "↗" : "⌑"}</span>
        </button>
        <button className={`screen-tab ${scene === "ruins" ? "active" : ""}`} onClick={() => setVisitedScene("ruins")} disabled={!seedCollected || portalTransit || arrivalPortal}>
          <span className="tab-number">03</span><span><strong>Ruinas invadidas</strong><small>Raíces · las dos columnas</small></span><span className="tab-mark">{rootsSeedCollected ? "✓" : seedCollected ? "↗" : "⌑"}</span>
        </button>
      </nav>

      <section className="workspace">
        <div className="stage-column">
          <div className="stage-heading">
            <div><span className="stage-kicker">PANTALLA {scene === "room" ? "01" : scene === "dawn" ? "02" : "03"}</span><h2>{scene === "room" ? "El local de ensayo" : scene === "dawn" ? "El Cuchillo al amanecer" : "Ruinas invadidas por raíces"}</h2></div>
            {scene !== "room" && <span className="stage-location">{scene === "dawn" ? "ALBATERA · AMANECER" : "EL CAMINO · DOS COLUMNAS"}</span>}
          </div>

          <div className={`playfield ${scene === "room" ? "playfield-room" : "playfield-portrait"}`}>
            <button
              className="seedbook-toggle"
              type="button"
              onClick={() => setSeedBookOpen(open => !open)}
              aria-label={`${seedBookOpen ? "Cerrar" : "Abrir"} Libro de semillas. ${discoveredSongIds.length} de 10 semillas descubiertas.`}
              aria-haspopup="dialog"
              aria-expanded={seedBookOpen}
              aria-controls="seedbook-panel"
            >
              <svg className="seedbook-toggle-icon" viewBox="0 0 36 36" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
                <path fill="#302638" d="M3 9h10c3 0 5 1 7 3 2-2 4-3 7-3h6v20h-9c-2 0-3 1-4 2-1-1-2-2-4-2H3z" />
                <path fill="#f1e5c7" d="M6 12h7c3 0 5 1 6 2v12c-1-1-3-2-6-2H6z" />
                <path fill="#fff7e4" d="M21 14c1-1 3-2 5-2h4v12h-4c-2 0-4 1-5 2z" />
                <rect x="19" y="14" width="2" height="13" fill="#a97756" />
                <path d="M8 16h8v1H8zm0 4h8v1H8zm12-1h7v1h-7z" fill="#bdac8d" />
                <rect x="17" y="7" width="2" height="7" fill="#39754f" />
                <rect x="14" y="8" width="3" height="2" fill="#67a96e" />
                <rect x="12" y="6" width="3" height="2" fill="#67a96e" />
                <rect x="20" y="6" width="3" height="2" fill="#67a96e" />
                <rect x="23" y="4" width="2" height="2" fill="#67a96e" />
                <rect x="17" y="13" width="3" height="2" fill="#d5a849" />
              </svg>
              <span className="seedbook-toggle-label">Libro de semillas</span>
              <b aria-hidden="true">{discoveredSongIds.length}/{10}</b>
            </button>
            {seedBookOpen && <SeedBook discoveredSongIds={discoveredSongIds} onClose={() => setSeedBookOpen(false)} />}
          {scene === "room" ? (
            <div className={`scene-stage game-screen room-stage ${ampOn ? "amp-is-on" : ""} ${portalOpen ? "room-portal-open" : ""} ${portalTransit ? "room-portal-spinning" : ""}`} onClick={handleRoomStageClick}>
              {roomView === "scene" && <div className="room-world">
                {portalTransit && <div className="portal-spin" aria-hidden="true" />}
                <div className="cable-art-layer" aria-hidden="true"><CableSceneArt pluggedGuitar={pluggedGuitar} pluggedAmp={pluggedAmp} /></div>
                <div className={`lemon-actor ${lemonFloorPoint ? "lemon-free" : lemonPosition} ${isMoving ? "walking" : ""} ${portalTransit ? "lemon-portal-leap" : ""}`} style={lemonFloorPoint ? { left: `${lemonFloorPoint.x}%`, bottom: `${lemonFloorPoint.bottom}%` } : undefined}><LemonSprite /></div>
                <button type="button" className="hotspot cable-hotspot" aria-label="Examinar cable y conectores" onClick={() => handleRoomHotspot("cable")} disabled={isMoving || portalOpen}>
                  <span className="sr-only">Cable en el suelo</span>
                </button>
                <button type="button" className="hotspot guitar-hotspot" aria-label="Guitarra eléctrica roja" onClick={() => handleRoomHotspot("guitar")} disabled={isMoving || portalOpen}>
                  <img className="guitar-sprite" src="/guitar-sprite-recut-v2.png" alt="" />
                </button>
                <button type="button" className="hotspot amp-hotspot" aria-label="Amplificador" onClick={() => handleRoomHotspot("amp")} disabled={isMoving || !pluggedGuitar || !pluggedAmp || portalOpen}>
                  <img className="amp-sprite" src="/amp-sprite-light.png" alt="" />
                </button>
              </div>}
              {roomView === "amp" && <AmpCloseup powered={ampOn} onPower={toggleAmplifier} onContinue={continueAfterAmplifier} />}
              {roomView === "cable" && <CableCloseup pluggedGuitar={pluggedGuitar} pluggedAmp={pluggedAmp} onConnect={connectCableEnd} onClose={() => setRoomView("scene")} />}
              {roomView === "guitar" && <GuitarCloseup selectedPositions={selectedFrets.map(note => note.key)} onSelectNote={toggleFret} onPlay={playSelection} onClose={() => setRoomView("scene")} />}
            </div>
          ) : scene === "dawn" ? (
            <div className={`scene-stage game-screen dawn-stage ${sunRisen ? "dawn-stage-sunrise" : ""}`} onClick={handleDawnStageClick}>
              {arrivalPortal && <div className="arrival-portal" aria-hidden="true" />}
              <div className="dawn-veil" aria-hidden="true" />
              {sunRisen && <div className="sunrise-glow" aria-hidden="true" />}
              <div className={`bird-flock ${birdsPassed ? "birds-visible" : ""}`} aria-label={birdsPassed ? "Bandada de pájaros silbando" : undefined}><span>◆</span><span>◆</span><span>◆</span><span>♪</span></div>
              <button type="button" className={`dawn-lemon-actor ${dawnIsMoving ? "walking" : ""} ${arrivalPortal ? "portal-exit-leap" : ""} ${lemonWhistling ? "lemon-whistling" : ""}`} style={dawnLemonPoint ? { left: `${dawnLemonPoint.x}%`, bottom: `${dawnLemonPoint.bottom}%` } : undefined} onClick={startDialogue} aria-label="Hablar con el limón" disabled={dialogueStarted || seedCollected || arrivalPortal}><LemonSprite />{lemonWhistling && <span className="lemon-whistle-note" aria-hidden="true">♪</span>}</button>
              <FlowerSprite open={flowerOpen} />
              <span className={`seed-spark ${flowerOpen ? "seed-spark-visible" : ""} ${seedCollected ? "seed-spark-collected" : ""}`} aria-hidden="true" />
              <span className="stage-coordinate">LF · 02</span>
            </div>
          ) : (
            <RuinsScene
              leftRevealed={leftColumnRevealed}
              rightRevealed={rightColumnRevealed}
              flowerStage={ruinsFlowerStage}
              seedCollected={rootsSeedCollected}
              puzzleOpen={ruinsView !== "scene"}
              onApproachColumn={setRuinsAction}
              onCollectSeed={collectRootsSeed}
            />
          )}

          {scene === "ruins" && ruinsView !== "scene" && <div className="scene-stage game-screen roots-closeup-stage">
            <RuinsColumnPuzzle
              side={ruinsView}
              alreadyRevealed={ruinsView === "left" ? leftColumnRevealed : rightColumnRevealed}
              onReveal={() => revealRuinsColumn(ruinsView)}
              onClose={() => setRuinsView("scene")}
            />
          </div>}

          {showOverlay && <aside key={scene === "room" ? `room-${roomPhase}-${roomAction ?? "none"}` : scene === "dawn" ? `dawn-${dialogueTurn}-${showDialogueChoices}-${branch ?? "none"}-${flowerOpen}-${seedCollected}` : `ruins-${ruinsAction ?? "none"}-${ruinsFlowerStage}-${rootsSeedCollected}`} className={`control-column ${scene === "room" ? "room-controls" : scene === "dawn" ? "dawn-controls" : "dawn-controls ruins-controls"}`} aria-label="Cuadro de diálogo del juego">
            {scene === "room" ? <>
              {roomAction && <div key={roomAction} className="dialogue-card action-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>{roomActionLabel(roomAction)}</p></div><button className="action-button" onClick={performRoomAction}>{roomAction === "guitar-unplugged" || roomAction === "amp-off" ? "Siguiente" : roomActionLabel(roomAction)} <span aria-hidden="true">→</span></button></div>}
              {portalOpen && <div className="unlock-card"><span className="unlock-icon">◉</span><div><span className="context-kicker">INTRO</span><h4>{introStarted ? "Intro activada" : "Intro"}</h4></div><button className="action-button" onClick={enterDawn}>Cruzar <span>→</span></button></div>}
            </> : scene === "dawn" ? <>
              {dialogueStarted && !branch && <div key={`line-${dialogueTurn}-${showDialogueChoices}`} className="dialogue-card">
                {!showDialogueChoices ? <div className="thought-bubble"><span>EL LIMÓN</span><p>{currentDialogue.prompt}</p><button className="dialogue-next" onClick={advanceDialogue}>Siguiente <span>▶</span></button></div> : <div className="choice-list" aria-label={dialogueTurn === DIALOGUE.length - 1 ? "Dos opciones finales" : "Tres respuestas posibles"}>
                  {dialogueTurn === DIALOGUE.length - 1 ? <>
                    <button onClick={() => chooseResponse("restart")}><strong>Volver al principio de la conversación</strong></button>
                    <button className="final-route-choice" onClick={chooseFinalResponse} disabled={!pendingBranch}><strong>{pendingBranch === "A" ? "Silbar" : "Escuchar a los pájaros silbar"}</strong></button>
                  </> : <>
                    <button onClick={() => chooseResponse("restart")}><strong>{currentDialogue.restart}</strong></button>
                    <button onClick={() => chooseResponse("A")}><strong>{currentDialogue.a}</strong></button>
                    <button onClick={() => chooseResponse("B")}><strong>{currentDialogue.b}</strong></button>
                  </>}
                </div>}
              </div>}
              {branch === "A" && !sunRisen && <div className="branch-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>Quizá mi silbido alcance el otro lado.</p></div><button className="action-button whistle-button" onClick={() => whistle()}>Silbar</button></div>}
              {branch === "B" && !birdsPassed && <div className="branch-card quiet-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>El silencio se extiende. Miro hacia las ventanas.</p></div><button className="action-button sky-listen-button" onClick={() => listenToBirds()}>Mirar al cielo y escuchar a los pájaros silbar</button></div>}
              {sunRisen && !seedAvailable && <div className="branch-card sunrise-status-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>{branch === "B" ? "Los pájaros silban mientras el cielo se ilumina." : "Mi silbido resuena mientras el cielo se ilumina."}</p></div></div>}
              {seedAvailable && !seedCollected && <div className="context-card seed-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>{branch === "B" ? "La flor se abre. La bandada ya no está sola." : "La flor se abre y me entrega una semilla."}</p></div><button className="action-button" onClick={collectSeed}>Coger semilla</button></div>}
              {seedCollected && <div className="unlock-card song-card"><div><span className="context-kicker">CANCIÓN DESBLOQUEADA</span><h4>Ventana al sendero</h4></div><button className="text-button" onClick={() => setVisitedScene("ruins")}>Siguiente: Raíces</button></div>}
            </> : <>
              {ruinsAction && <div key={`column-${ruinsAction}`} className="dialogue-card action-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>{ruinsAction === "left" ? "Unas hojas secas se aferran a esta columna." : "Las hojas se enredan entre las raíces de piedra."}</p></div><button className="action-button" onClick={openRuinsPuzzle}>Examinar</button></div>}
              {ruinsFlowerStage === "seed" && !rootsSeedCollected && <div className="context-card seed-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>La planta ha florecido y deja una semilla entre las raíces.</p></div><button className="action-button" onClick={collectRootsSeed}>Coger semilla</button></div>}
              {rootsSeedCollected && <div className="unlock-card song-card"><div><span className="context-kicker">CANCIÓN DESBLOQUEADA · 03</span><h4>Raíces</h4></div><span className="roots-seed-note">La tercera semilla</span></div>}
            </>}
          </aside>}
          </div>
          <span className="sr-only" aria-live="polite" aria-atomic="true">{notice}</span>
        </div>
      </section>

      <section className="storyboard-section" id="storyboard">
        <div className="storyboard-heading"><div><span className="stage-kicker">DOCUMENTO DE PREPRODUCCIÓN</span><h2>El storyboard original</h2></div><span>REFERENCIA VISUAL · PANTALLAS 01–03</span></div>
        <figure className="storyboard-frame"><img src="/storyboard-pantallas-01-02.png" alt="Storyboard conceptual: el local de ensayo vacío y el limón ante El Cuchillo de Albatera al amanecer." /><figcaption><span>01 · Local de ensayo</span><span>02 · El Cuchillo al amanecer</span></figcaption></figure>
        <figure className="storyboard-frame storyboard-frame-roots"><img src="/ruins-background.png" alt="Fondo de las ruinas invadidas por raíces, basado en el panel 03 del storyboard v02." /><figcaption><span>03 · Ruinas y arco de piedra</span><span>Fondo adaptado del panel 03 · storyboard v02</span></figcaption></figure>
      </section>

      <footer className="site-footer"><div className="footer-mark">LF<span>✳</span></div><p>Un guion se vuelve paisaje, un clic cada vez.</p><span>PREPRODUCCIÓN · VERSIÓN 0.5</span></footer>
    </main>
  );
}

function roomActionLabel(action: Exclude<RoomAction, null>) {
  const labels: Record<Exclude<RoomAction, null>, string> = {
    "examine-cable": "Examinar cable",
    examine: "Examinar amplificador",
    play: "Tocar la guitarra",
    "guitar-unplugged": "La guitarra no está enchufada. Tengo que conectar el cable antes de tocar.",
    "amp-off": "La guitarra ya está conectada, pero el amplificador sigue apagado. Primero tengo que encenderlo.",
  };
  return labels[action];
}
