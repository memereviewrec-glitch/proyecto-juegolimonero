import { useMemo, useState, type MouseEvent } from "react";
import { AmpCloseup, CableCloseup, CableSceneArt, GuitarCloseup, type FretSelection } from "../components/RoomCloseups";
import "./home.css";

type Scene = "room" | "dawn";
type RoomPhase = "guitar-cable" | "amp-cable" | "power" | "play" | "portal";
type RoomTarget = "guitar" | "amp" | "cable";
type RoomAction = "examine-cable" | "examine" | "play" | null;
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

function LemonSprite({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`lemon-sprite ${className}`}
      viewBox="0 0 48 56"
      role="img"
      aria-label="Limón protagonista"
      shapeRendering="crispEdges"
    >
      <path d="M20 7h8v4h7v4h5v7h3v17h-4v7h-7v4H16v-4h-6v-5H6V21h4v-6h6v-4h4z" fill="#f4c943" stroke="#29252d" strokeWidth="2" />
      <path d="M17 8h7V4h7v4h-3v4h-7v3h-6v-4h2z" fill="#719452" stroke="#29252d" strokeWidth="1.5" />
      <rect x="17" y="25" width="3" height="3" fill="#28242b" />
      <rect x="29" y="25" width="3" height="3" fill="#28242b" />
      <path d="M22 34h7v2h-7z" fill="#bd704f" />
      <g className="lemon-legs" fill="#29252d">
        <path className="lemon-leg lemon-leg-left" d="M13 46h4v7h-4z" />
        <path className="lemon-leg lemon-leg-right" d="M32 46h4v7h-4z" />
      </g>
    </svg>
  );
}

function AmpSprite({ large = false, powered = false }: { large?: boolean; powered?: boolean }) {
  return (
    <svg
      className={`amp-sprite${large ? " amp-sprite-large" : ""}`}
      viewBox="0 0 128 116"
      role="img"
      aria-label={powered ? "Amplificador encendido" : "Amplificador apagado"}
      shapeRendering="crispEdges"
    >
      <rect x="13" y="12" width="102" height="96" fill="#28252e" stroke="#1e1b22" strokeWidth="4" />
      <rect x="19" y="18" width="90" height="16" fill="#d8c8a0" stroke="#1e1b22" strokeWidth="3" />
      <rect x="26" y="23" width="5" height="5" fill={powered ? "#d55e42" : "#77716b"} />
      <rect x="38" y="22" width="6" height="6" fill="#4b4650" />
      <rect x="53" y="22" width="6" height="6" fill="#4b4650" />
      <rect x="68" y="22" width="6" height="6" fill="#4b4650" />
      <rect x="82" y="22" width="6" height="6" fill="#4b4650" />
      <rect x="22" y="40" width="84" height="59" fill="#403b43" stroke="#17151a" strokeWidth="3" />
      <path d="M27 46h74v3H27zm0 9h74v3H27zm0 9h74v3H27zm0 9h74v3H27zm0 9h74v3H27zm0 9h74v3H27z" fill="#615a61" />
      <rect x="11" y="104" width="14" height="5" fill="#18161c" />
      <rect x="103" y="104" width="14" height="5" fill="#18161c" />
    </svg>
  );
}

function GuitarSprite() {
  return (
    <svg className="guitar-sprite" viewBox="0 0 96 176" role="img" aria-label="Guitarra eléctrica roja" shapeRendering="crispEdges">
      <path d="M42 5h12v58h-5v16h8l8 8-2 13 8 9-2 14-12 10H37l-12-10-2-14 8-9-2-13 8-8h8V63h-3z" fill="#b64745" stroke="#2c2630" strokeWidth="3" />
      <path d="M43 7h10v62H43z" fill="#d6ad83" stroke="#2c2630" strokeWidth="2" />
      <path d="M44 16h8m-8 7h8m-8 7h8m-8 7h8m-8 7h8m-8 7h8" stroke="#594a4a" strokeWidth="2" />
      <path d="M39 82h18v37H39z" fill="#eadfcb" stroke="#2c2630" strokeWidth="2" />
      <path d="M31 98h34m-34 7h34m-34 7h34" stroke="#51464b" strokeWidth="2" />
      <circle cx="48" cy="91" r="3" fill="#2c2630" />
      <path d="M46 8h4m-8-4h12" stroke="#2c2630" strokeWidth="3" />
    </svg>
  );
}

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

function playFrequencies(frequencies: number[]) {
  if (typeof window === "undefined" || frequencies.length === 0) return;
  try {
    const context = new window.AudioContext();
    const now = context.currentTime;
    const noteDuration = 2;
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const peakGain = 0.12 / frequencies.length;
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(peakGain, now + 0.025);
      gain.gain.setValueAtTime(peakGain, now + noteDuration - 0.3 + index * 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + noteDuration + index * 0.02);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + noteDuration + 0.05 + index * 0.02);
    });
    window.setTimeout(() => void context.close(), 2300);
  } catch {
    // La reproducción de prueba es opcional; el estado visual del guion sigue funcionando.
  }
}

function playWhistle(source: "lemon" | "birds") {
  if (typeof window === "undefined" || typeof window.AudioContext === "undefined") return;
  let context: AudioContext | undefined;
  try {
    context = new window.AudioContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const notes = source === "birds"
      ? [{ at: 0, length: 0.16, from: 1480, to: 1980 }, { at: 0.22, length: 0.15, from: 1710, to: 2240 }, { at: 0.46, length: 0.19, from: 1560, to: 2100 }]
      : [{ at: 0, length: 0.45, from: 920, to: 1330 }, { at: 0.56, length: 0.48, from: 1110, to: 1580 }];
    oscillator.type = "sine";
    oscillator.connect(gain);
    gain.connect(context.destination);
    gain.gain.setValueAtTime(0.0001, now);
    notes.forEach(note => {
      const start = now + note.at;
      oscillator.frequency.setValueAtTime(note.from, start);
      oscillator.frequency.exponentialRampToValueAtTime(note.to, start + note.length * 0.7);
      oscillator.frequency.exponentialRampToValueAtTime(note.from, start + note.length);
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.025, start + 0.025);
      gain.gain.setValueAtTime(0.025, start + note.length * 0.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + note.length);
    });
    const duration = notes[notes.length - 1].at + notes[notes.length - 1].length;
    oscillator.start(now);
    oscillator.stop(now + duration + 0.04);
    void context.resume();
    window.setTimeout(() => { void context?.close(); }, (duration + 0.2) * 1000);
  } catch {
    if (context) void context.close();
  }
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
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
  const [birdsPassed, setBirdsPassed] = useState(false);
  const [sunRisen, setSunRisen] = useState(false);
  const [flowerOpen, setFlowerOpen] = useState(false);
  const [seedAvailable, setSeedAvailable] = useState(false);
  const [seedCollected, setSeedCollected] = useState(false);
  const [lemonWhistling, setLemonWhistling] = useState(false);
  const [notice, setNotice] = useState("Acércate al cable y examínalo para conectar sus dos extremos.");

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
    if (isMoving || roomView !== "scene" || portalOpen) return;
    if (target === "cable") {
      moveTo("lemon-cable", () => setRoomAction("examine-cable"));
      setNotice("El cable une los instrumentos. Examínalo para conectar sus dos puntas.");
      return;
    }
    if (roomPhase === "power" && target === "amp") {
      moveTo("lemon-amp", () => setRoomAction("examine"));
      setNotice("El cable está conectado por ambos extremos. Examina el amplificador.");
      return;
    }
    if (roomPhase === "play" && target === "guitar") {
      moveTo("lemon-guitar", () => setRoomAction("play"));
      setNotice("El amplificador está encendido. Ya puedes tocar.");
    }
  }

  function performRoomAction() {
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

    const nextA = scoreA + (response === "A" ? 1 : 0);
    const nextB = scoreB + (response === "B" ? 1 : 0);
    const nextTurn = dialogueTurn + 1;
    setScoreA(nextA);
    setScoreB(nextB);

    if (nextTurn < DIALOGUE.length) {
      setDialogueTurn(nextTurn);
      setShowDialogueChoices(false);
      setNotice(`La elección favorece el camino ${response}. La conversación continúa.`);
      return;
    }

    const chanceA = clamp(50 + (nextA - nextB) * 12, 14, 86);
    const outcome: Branch = chanceA > 50 ? "A" : chanceA < 50 ? "B" : Math.random() < 0.5 ? "A" : "B";
    setBranch(outcome);
    if (outcome === "A") {
      setNotice("La conversación desemboca en el camino A. Solo queda una opción: silbar.");
    } else {
      setNotice("La conversación desemboca en el camino B. El limón guarda silencio y escucha.");
    }
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

  function whistle() {
    if (branch !== "A" || sunRisen) return;
    playWhistle("lemon");
    setLemonWhistling(true);
    window.setTimeout(() => setLemonWhistling(false), motionDuration(LEMON_WHISTLE_DURATION_MS));
    beginSunrise("El limón silba. El cielo empieza a iluminarse y la flor se prepara para abrirse.");
  }

  function listenToBirds() {
    if (branch !== "B" || birdsPassed || sunRisen) return;
    playWhistle("birds");
    setBirdsPassed(true);
    beginSunrise("El limón mira al cielo. Los pájaros silban mientras el amanecer ilumina la sierra.");
  }

  function collectSeed() {
    if (!seedAvailable) return;
    setSeedCollected(true);
    setNotice("Semilla recogida. «Ventana al sendero» queda como recompensa de esta pantalla.");
  }

  function setVisitedScene(nextScene: Scene) {
    if (portalTransit || arrivalPortal) return;
    if (nextScene === "dawn" && !portalOpen) return;
    setScene(nextScene);
    setRoomView("scene");
    setRoomAction(null);
  }

  const currentDialogue = DIALOGUE[Math.min(dialogueTurn, DIALOGUE.length - 1)];
  const showOverlay = !portalTransit && !arrivalPortal && (scene === "room"
    ? roomView === "scene" && (Boolean(roomAction) || portalOpen)
    : dialogueStarted || branch !== null || sunRisen || seedAvailable || seedCollected);

  return (
    <main className="explorer-shell">
      <header className="topbar">
        <a className="brand-lockup" href="#inicio" aria-label="Limonero Fuzz, inicio">
          <img src="/limonero-mark.svg" alt="" className="brand-icon" />
          <span><strong>Limonero Fuzz</strong><small>EXPLORADOR DEL GUION</small></span>
        </a>
        <div className="topbar-right">
          <span className="status-dot" /> <span>Preproducción interactiva</span>
          <a className="top-link" href="#storyboard">Ver storyboard</a>
        </div>
      </header>

      <section className="intro-band" id="inicio">
        <div className="intro-copy">
          <div className="eyebrow"><span>DISCO · 10 CANCIONES</span><span className="eyebrow-line" /></div>
          <h1>Dos pantallas.<br /><em>Un camino de vuelta.</em></h1>
          <p>Explora el comienzo del viaje: del primer acorde en un local vacío al amanecer detrás de El Cuchillo.</p>
        </div>
        <div className="intro-stamp" aria-label="Dos pantallas disponibles">
          <span className="stamp-big">02</span><span>PANTALLAS<br />EN EXPLORACIÓN</span>
        </div>
      </section>

      <nav className="screen-nav" aria-label="Seleccionar pantalla">
        <button className={`screen-tab ${scene === "room" ? "active" : ""}`} onClick={() => setVisitedScene("room")} disabled={portalTransit || arrivalPortal}>
          <span className="tab-number">01</span><span><strong>El local de ensayo</strong><small>La Intro · antes del portal</small></span><span className="tab-mark">{portalOpen ? "✓" : "•"}</span>
        </button>
        <button className={`screen-tab ${scene === "dawn" ? "active" : ""}`} onClick={() => setVisitedScene("dawn")} disabled={!portalOpen || portalTransit || arrivalPortal}>
          <span className="tab-number">02</span><span><strong>El Cuchillo al amanecer</strong><small>Ventana al sendero</small></span><span className="tab-mark">{seedCollected ? "✓" : portalOpen ? "↗" : "⌑"}</span>
        </button>
      </nav>

      <section className="workspace">
        <div className="stage-column">
          <div className="stage-heading">
            <div><span className="stage-kicker">PANTALLA {scene === "room" ? "01" : "02"}</span><h2>{scene === "room" ? "El local de ensayo" : "El Cuchillo al amanecer"}</h2></div>
            <span className="stage-location">{scene === "room" ? "ANTES DE LA OTRA DIMENSIÓN" : "ALBATERA · AMANECER"}</span>
          </div>

          <div className={`playfield ${scene === "dawn" ? "playfield-portrait" : "playfield-room"}`}>
          {scene === "room" ? (
            <div className={`scene-stage room-stage ${ampOn ? "amp-is-on" : ""} ${portalOpen ? "room-portal-open" : ""} ${portalTransit ? "room-portal-spinning" : ""}`} onClick={handleRoomStageClick}>
              {roomView === "scene" && <div className="room-world">
                <div className={`cable-floor-prop ${pluggedGuitar && pluggedAmp ? "cable-floor-connected" : ""}`} aria-hidden="true"><CableSceneArt /></div>
                {portalTransit && <div className="portal-spin" aria-hidden="true" />}
                <div className={`lemon-actor ${lemonFloorPoint ? "lemon-free" : lemonPosition} ${isMoving ? "walking" : ""} ${portalTransit ? "lemon-portal-leap" : ""}`} style={lemonFloorPoint ? { left: `${lemonFloorPoint.x}%`, bottom: `${lemonFloorPoint.bottom}%` } : undefined}><LemonSprite /></div>
                <button className="hotspot cable-hotspot" aria-label="Examinar cable y conectores" onClick={() => handleRoomHotspot("cable")} disabled={isMoving} />
                <button className="hotspot guitar-hotspot" aria-label="Zona interactiva: guitarra" onClick={() => handleRoomHotspot("guitar")} disabled={isMoving || roomPhase !== "play"} />
                <button className="hotspot amp-hotspot" aria-label="Zona interactiva: amplificador" onClick={() => handleRoomHotspot("amp")} disabled={isMoving || roomPhase !== "power"} />
                <span className="stage-coordinate">LF · 01</span>
              </div>}
              {roomView === "amp" && <AmpCloseup powered={ampOn} onPower={toggleAmplifier} onContinue={continueAfterAmplifier} onClose={() => setRoomView("scene")} />}
              {roomView === "cable" && <CableCloseup pluggedGuitar={pluggedGuitar} pluggedAmp={pluggedAmp} onConnect={connectCableEnd} onClose={() => setRoomView("scene")} />}
              {roomView === "guitar" && <GuitarCloseup selectedPositions={selectedFrets.map(note => note.key)} onSelectNote={toggleFret} onPlay={playSelection} onClose={() => setRoomView("scene")} />}
            </div>
          ) : (
            <div className={`scene-stage dawn-stage ${sunRisen ? "dawn-stage-sunrise" : ""}`} onClick={handleDawnStageClick}>
              {arrivalPortal && <div className="arrival-portal" aria-hidden="true" />}
              <div className="dawn-veil" aria-hidden="true" />
              {sunRisen && <div className="sunrise-glow" aria-hidden="true" />}
              <div className={`bird-flock ${birdsPassed ? "birds-visible" : ""}`} aria-label={birdsPassed ? "Bandada de pájaros silbando" : undefined}><span>◆</span><span>◆</span><span>◆</span><span>♪</span></div>
              <button type="button" className={`dawn-lemon-actor ${dawnIsMoving ? "walking" : ""} ${arrivalPortal ? "portal-exit-leap" : ""} ${lemonWhistling ? "lemon-whistling" : ""}`} style={dawnLemonPoint ? { left: `${dawnLemonPoint.x}%`, bottom: `${dawnLemonPoint.bottom}%` } : undefined} onClick={startDialogue} aria-label="Hablar con el limón" disabled={dialogueStarted || seedCollected || arrivalPortal}><LemonSprite />{lemonWhistling && <span className="lemon-whistle-note" aria-hidden="true">♪</span>}</button>
              <FlowerSprite open={flowerOpen} />
              <span className={`seed-spark ${flowerOpen ? "seed-spark-visible" : ""} ${seedCollected ? "seed-spark-collected" : ""}`} aria-hidden="true" />
              <span className="stage-coordinate">LF · 02</span>
            </div>
          )}

          {showOverlay && <aside key={scene === "room" ? `room-${roomPhase}-${roomAction ?? "none"}` : `dawn-${dialogueTurn}-${showDialogueChoices}-${branch ?? "none"}-${flowerOpen}-${seedCollected}`} className={`control-column ${scene === "room" ? "room-controls" : "dawn-controls"}`} aria-label="Cuadro de diálogo del juego">
            {scene === "room" ? <>
              {roomAction && <div key={roomAction} className="dialogue-card action-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>{roomActionLabel(roomAction)}</p></div><button className="action-button" onClick={performRoomAction}>{roomActionLabel(roomAction)} <span>→</span></button></div>}
              {portalOpen && <div className="unlock-card"><span className="unlock-icon">◉</span><div><span className="context-kicker">INTRO</span><h4>{introStarted ? "Intro activada" : "Intro"}</h4></div><button className="action-button" onClick={enterDawn}>Cruzar <span>→</span></button></div>}
            </> : <>
              {dialogueStarted && !branch && <div key={`line-${dialogueTurn}-${showDialogueChoices}`} className="dialogue-card">
                {!showDialogueChoices ? <div className="thought-bubble"><span>EL LIMÓN</span><p>{currentDialogue.prompt}</p><button className="dialogue-next" onClick={advanceDialogue}>Siguiente <span>▶</span></button></div> : <div className="choice-list" aria-label="Tres respuestas posibles">
                  <button onClick={() => chooseResponse("restart")}><span className="choice-code">↺</span><strong>{currentDialogue.restart}</strong><span className="choice-arrow">▶</span></button>
                  <button onClick={() => chooseResponse("A")}><span className="choice-code">A</span><strong>{currentDialogue.a}</strong><span className="choice-arrow">▶</span></button>
                  <button onClick={() => chooseResponse("B")}><span className="choice-code">B</span><strong>{currentDialogue.b}</strong><span className="choice-arrow">▶</span></button>
                </div>}
              </div>}
              {branch === "A" && !sunRisen && <div className="branch-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>Quizá mi silbido alcance el otro lado.</p></div><button className="action-button whistle-button" onClick={whistle}>Silbar <span>♪</span></button></div>}
              {branch === "B" && !birdsPassed && <div className="branch-card quiet-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>El silencio se extiende. Miro hacia las ventanas.</p></div><button className="action-button sky-listen-button" onClick={listenToBirds}>Mirar al cielo y escuchar a los pájaros silbar <span>→</span></button></div>}
              {sunRisen && !seedAvailable && <div className="branch-card sunrise-status-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>{branch === "B" ? "Los pájaros silban mientras el cielo se ilumina." : "Mi silbido resuena mientras el cielo se ilumina."}</p></div></div>}
              {seedAvailable && !seedCollected && <div className="context-card seed-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>{branch === "B" ? "La flor se abre. La bandada ya no está sola." : "La flor se abre y me entrega una semilla."}</p></div><button className="action-button" onClick={collectSeed}>Coger semilla <span>→</span></button></div>}
              {seedCollected && <div className="unlock-card song-card"><div><span className="context-kicker">CANCIÓN DESBLOQUEADA</span><h4>Ventana al sendero</h4></div><button className="text-button" onClick={() => setVisitedScene("room")}>Volver al local ↗</button></div>}
            </>}
          </aside>}
          </div>
          <span className="sr-only" aria-live="polite" aria-atomic="true">{notice}</span>
        </div>
      </section>

      <section className="storyboard-section" id="storyboard">
        <div className="storyboard-heading"><div><span className="stage-kicker">DOCUMENTO DE PREPRODUCCIÓN</span><h2>El storyboard original</h2></div><span>REFERENCIA VISUAL · PANTALLAS 01–02</span></div>
        <figure className="storyboard-frame"><img src="/storyboard-pantallas-01-02.png" alt="Storyboard conceptual: el local de ensayo vacío y el limón ante El Cuchillo de Albatera al amanecer." /><figcaption><span>01 · Local de ensayo</span><span>02 · El Cuchillo al amanecer</span></figcaption></figure>
      </section>

      <footer className="site-footer"><div className="footer-mark">LF<span>✳</span></div><p>Un guion se vuelve paisaje, un clic cada vez.</p><span>PREPRODUCCIÓN · VERSIÓN 0.4</span></footer>
    </main>
  );
}

function roomActionLabel(action: Exclude<RoomAction, null>) {
  const labels: Record<Exclude<RoomAction, null>, string> = {
    "examine-cable": "Examinar cable",
    examine: "Examinar amplificador",
    play: "Tocar la guitarra",
  };
  return labels[action];
}
