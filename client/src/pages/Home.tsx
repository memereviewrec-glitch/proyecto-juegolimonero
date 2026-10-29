import { useEffect, useMemo, useState, type MouseEvent } from "react";
import "./home.css";

type Scene = "room" | "dawn";
type RoomPhase = "guitar-cable" | "amp-cable" | "power" | "play" | "portal";
type RoomTarget = "guitar" | "amp";
type RoomAction = "plug-guitar" | "plug-amp" | "examine" | "play" | null;
type Branch = "A" | "B";
type Response = "restart" | Branch;

const NOTES = [
  { id: "C#", label: "Do♯", frequency: 277.18 },
  { id: "D#", label: "Re♯", frequency: 311.13 },
  { id: "E", label: "Mi", frequency: 329.63 },
  { id: "F#", label: "Fa♯", frequency: 369.99 },
  { id: "G#", label: "Sol♯", frequency: 415.3 },
  { id: "A", label: "La", frequency: 440 },
  { id: "B", label: "Si", frequency: 493.88 },
] as const;

const DIALOGUE = [
  {
    prompt: "¿Hay alguien ahí?",
    restart: "Volver a preguntarlo",
    a: "Llamar hacia la sierra",
    b: "Quedarse quieto y escuchar",
  },
  {
    prompt: "No veo a nadie. ¿Estoy solo en esta dimensión?",
    restart: "Empezar esta conversación otra vez",
    a: "Mirar hacia las ventanas de roca",
    b: "Escuchar el valle en silencio",
  },
  {
    prompt: "¿Hago una señal, o dejo que el mundo conteste?",
    restart: "Volver al principio",
    a: "Probar a llamar una vez más",
    b: "Esperar sin hacer ruido",
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
      <path d="M13 46h4v7h-4zM32 46h4v7h-4z" fill="#29252d" />
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

function SunSprite({ risen }: { risen: boolean }) {
  return <div className={`sun-disc${risen ? " sun-risen" : ""}`} aria-label={risen ? "Sol sobre la sierra" : "Sol detrás de la sierra"} />;
}

function playFrequencies(frequencies: number[]) {
  if (typeof window === "undefined" || frequencies.length === 0) return;
  try {
    const context = new window.AudioContext();
    const now = context.currentTime;
    frequencies.forEach((frequency, index) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "triangle";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12 / frequencies.length, now + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8 + index * 0.02);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.85 + index * 0.02);
    });
    window.setTimeout(() => void context.close(), 1200);
  } catch {
    // La reproducción de prueba es opcional; el estado visual del guion sigue funcionando.
  }
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value));
}

export default function Home() {
  const [scene, setScene] = useState<Scene>("room");
  const [roomPhase, setRoomPhase] = useState<RoomPhase>("guitar-cable");
  const [pluggedGuitar, setPluggedGuitar] = useState(false);
  const [pluggedAmp, setPluggedAmp] = useState(false);
  const [ampOn, setAmpOn] = useState(false);
  const [ampInspection, setAmpInspection] = useState(false);
  const [roomAction, setRoomAction] = useState<RoomAction>(null);
  const [lemonPosition, setLemonPosition] = useState("lemon-left");
  const [lemonFloorPoint, setLemonFloorPoint] = useState<{ x: number; bottom: number } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [lastChord, setLastChord] = useState<string[]>([]);
  const [portalOpen, setPortalOpen] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);

  const [dialogueStarted, setDialogueStarted] = useState(false);
  const [dialogueTurn, setDialogueTurn] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [silence, setSilence] = useState(false);
  const [birdsPassed, setBirdsPassed] = useState(false);
  const [sunRisen, setSunRisen] = useState(false);
  const [flowerOpen, setFlowerOpen] = useState(false);
  const [seedCollected, setSeedCollected] = useState(false);
  const [dialogueHistory, setDialogueHistory] = useState<string[]>([]);
  const [notice, setNotice] = useState("Empieza conectando el cable a la guitarra.");

  const validChord = useMemo(
    () => selectedNotes.length >= 2 && selectedNotes.includes("C#") && selectedNotes.every(note => NOTES.some(item => item.id === note)),
    [selectedNotes],
  );
  const probabilityA = clamp(50 + (scoreA - scoreB) * 12, 14, 86);
  const probabilityB = 100 - probabilityA;

  useEffect(() => {
    if (branch !== "B" || !silence || birdsPassed) return;
    const timer = window.setTimeout(() => {
      setBirdsPassed(true);
      setSunRisen(true);
      setFlowerOpen(true);
      setNotice("Una bandada cruza las ventanas y silba. El sol sale y la flor se abre.");
    }, 1700);
    return () => window.clearTimeout(timer);
  }, [branch, silence, birdsPassed]);

  function moveTo(position: string, callback: () => void) {
    setLemonFloorPoint(null);
    setIsMoving(true);
    setLemonPosition(position);
    window.setTimeout(() => {
      setIsMoving(false);
      callback();
    }, 1450);
  }

  function handleRoomStageClick(event: MouseEvent<HTMLDivElement>) {
    if (ampInspection || portalOpen || roomAction || isMoving) return;
    if (event.target instanceof Element && event.target.closest("button")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 3, 97);
    const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 3, 97);
    const walkableEdge = 53 + (Math.abs(x - 50) / 50) * 6;
    if (y < walkableEdge || y > 96) return;
    setRoomAction(null);
    setLemonPosition("lemon-free");
    setLemonFloorPoint({ x, bottom: 100 - y });
    setIsMoving(true);
    window.setTimeout(() => setIsMoving(false), 1450);
  }

  function handleRoomHotspot(target: RoomTarget) {
    if (isMoving || ampInspection || portalOpen) return;
    if (roomPhase === "guitar-cable" && target === "guitar") {
      moveTo("lemon-guitar", () => setRoomAction("plug-guitar"));
      setNotice("Has llegado a la guitarra. Conecta aquí el primer extremo del cable.");
      return;
    }
    if (roomPhase === "amp-cable" && target === "amp") {
      moveTo("lemon-amp", () => setRoomAction("plug-amp"));
      setNotice("El extremo de la guitarra ya está conectado. Falta el amplificador.");
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
    if (roomAction === "plug-guitar") {
      setPluggedGuitar(true);
      setRoomPhase("amp-cable");
      setRoomAction(null);
      setNotice("Cable conectado a la guitarra. Ahora lleva el otro extremo al amplificador.");
    } else if (roomAction === "plug-amp") {
      setPluggedAmp(true);
      setRoomPhase("power");
      setRoomAction(null);
      setNotice("Los dos extremos están conectados. Acércate al ampli y examínalo.");
    } else if (roomAction === "examine") {
      setAmpInspection(true);
      setRoomAction(null);
    } else if (roomAction === "play") {
      setRoomAction(null);
      setNotice("Selecciona una o más notas y toca la selección. Una nota sola no abre el portal.");
    }
  }

  function toggleAmplifier() {
    const nextState = !ampOn;
    setAmpOn(nextState);
    setAmpInspection(false);
    if (nextState) {
      setRoomPhase("play");
      setNotice("Altavoz encendido. Vuelve a la guitarra para tocar.");
    } else {
      setRoomPhase("power");
      setNotice("Altavoz apagado. Enciéndelo para habilitar la guitarra.");
    }
  }

  function toggleNote(noteId: string) {
    setSelectedNotes(current => current.includes(noteId) ? current.filter(note => note !== noteId) : [...current, noteId]);
  }

  function playSelection() {
    if (selectedNotes.length === 0) {
      setNotice("Elige una nota o varias antes de tocar.");
      return;
    }
    const ordered = NOTES.filter(note => selectedNotes.includes(note.id));
    setLastChord(ordered.map(note => note.label));
    playFrequencies(ordered.map(note => note.frequency));
    if (selectedNotes.length === 1) {
      setNotice(`${ordered[0].label}: suena, pero una nota sola no abre el portal.`);
      return;
    }
    if (validChord) {
      setPortalOpen(true);
      setIntroStarted(true);
      setRoomPhase("portal");
      setNotice("Acorde válido de Do♯ menor. El portal se abre y empieza la Intro.");
      return;
    }
    setNotice("Ese acorde no cumple la regla: necesita Do♯ y solo notas de la tonalidad de Do♯ menor.");
  }

  function enterDawn() {
    if (!portalOpen) return;
    setScene("dawn");
    setRoomAction(null);
    setNotice("Nueva dimensión. El limón intenta averiguar si está solo.");
  }

  function startDialogue() {
    setDialogueStarted(true);
    setDialogueTurn(0);
    setScoreA(0);
    setScoreB(0);
    setBranch(null);
    setSilence(false);
    setBirdsPassed(false);
    setSunRisen(false);
    setFlowerOpen(false);
    setSeedCollected(false);
    setDialogueHistory([]);
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
    setDialogueHistory(history => [...history, `Turno ${nextTurn}: favorece el camino ${response}`]);

    if (nextTurn < DIALOGUE.length) {
      setDialogueTurn(nextTurn);
      setNotice(`La elección favorece el camino ${response}. La conversación continúa.`);
      return;
    }

    const chanceA = clamp(50 + (nextA - nextB) * 12, 14, 86);
    const outcome: Branch = Math.random() * 100 < chanceA ? "A" : "B";
    setBranch(outcome);
    if (outcome === "A") {
      setNotice(`La conversación desemboca en el camino A (${chanceA}% de probabilidad al resolver).`);
      setDialogueHistory(history => [...history, `Desenlace: camino A (${chanceA}% de probabilidad)`]);
    } else {
      setSilence(true);
      setNotice(`La conversación desemboca en el camino B (${100 - chanceA}% de probabilidad). El limón guarda silencio.`);
      setDialogueHistory(history => [...history, `Desenlace: camino B (${100 - chanceA}% de probabilidad)`, "Silencio"]);
    }
  }

  function whistle() {
    setSunRisen(true);
    setFlowerOpen(true);
    setNotice("El limón silba. El sol asoma tras la sierra y la flor se abre.");
  }

  function collectSeed() {
    if (!flowerOpen) return;
    setSeedCollected(true);
    setNotice("Semilla recogida. «Ventana al sendero» queda como recompensa de esta pantalla.");
  }

  function setVisitedScene(nextScene: Scene) {
    if (nextScene === "dawn" && !portalOpen) return;
    setScene(nextScene);
    setRoomAction(null);
  }

  const currentDialogue = DIALOGUE[Math.min(dialogueTurn, DIALOGUE.length - 1)];
  const roomInstruction = roomPhase === "guitar-cable"
    ? "Clica cerca de la guitarra para conectar el primer extremo."
    : roomPhase === "amp-cable"
      ? "Clica cerca del amplificador para conectar el otro extremo."
      : roomPhase === "power"
        ? "Clica el amplificador, examínalo y enciende el altavoz."
        : roomPhase === "play"
          ? "Clica cerca de la guitarra y toca una nota o acorde."
          : "El acorde abrió el portal. Puedes cruzar a la segunda pantalla.";

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
        <button className={`screen-tab ${scene === "room" ? "active" : ""}`} onClick={() => setVisitedScene("room")}>
          <span className="tab-number">01</span><span><strong>El local de ensayo</strong><small>La Intro · antes del portal</small></span><span className="tab-mark">{portalOpen ? "✓" : "•"}</span>
        </button>
        <button className={`screen-tab ${scene === "dawn" ? "active" : ""}`} onClick={() => setVisitedScene("dawn")} disabled={!portalOpen}>
          <span className="tab-number">02</span><span><strong>El Cuchillo al amanecer</strong><small>Ventana al sendero</small></span><span className="tab-mark">{seedCollected ? "✓" : portalOpen ? "↗" : "⌑"}</span>
        </button>
        <div className="nav-note">{portalOpen ? "La segunda escena está abierta." : "Conecta y toca para abrir la segunda escena."}</div>
      </nav>

      <section className="workspace" aria-live="polite">
        <div className="stage-column">
          <div className="stage-heading">
            <div><span className="stage-kicker">PANTALLA {scene === "room" ? "01" : "02"}</span><h2>{scene === "room" ? "El local de ensayo" : "El Cuchillo al amanecer"}</h2></div>
            <span className="stage-location">{scene === "room" ? "ANTES DE LA OTRA DIMENSIÓN" : "ALBATERA · AMANECER"}</span>
          </div>

          {scene === "room" ? (
            <div className={`scene-stage room-stage ${ampOn ? "amp-is-on" : ""}`} onClick={handleRoomStageClick}>
              <div className="room-wall" />
              <div className="room-floor" />
              <div className="room-horizon" />
              <div className="room-empty-note">LOCAL DE ENSAYO</div>
              <div className={`cable-line ${pluggedGuitar ? "cable-at-guitar" : ""} ${pluggedAmp ? "cable-at-amp" : ""} ${pluggedGuitar && pluggedAmp ? "cable-complete" : ""}`} aria-hidden="true"><span /></div>
              <div className={`lemon-actor ${lemonFloorPoint ? "lemon-free" : lemonPosition} ${isMoving ? "walking" : ""}`} style={lemonFloorPoint ? { left: `${lemonFloorPoint.x}%`, bottom: `${lemonFloorPoint.bottom}%` } : undefined}><LemonSprite /></div>
              <button className={`hotspot guitar-hotspot ${roomPhase === "guitar-cable" || roomPhase === "play" ? "hotspot-active" : ""}`} aria-label="Zona interactiva: guitarra" onClick={() => handleRoomHotspot("guitar")} disabled={isMoving || (roomPhase !== "guitar-cable" && roomPhase !== "play")}>
                <span className="hotspot-pulse" /><GuitarSprite /><span className="object-label">GUITARRA</span>
              </button>
              <button className={`hotspot amp-hotspot ${roomPhase === "amp-cable" || roomPhase === "power" ? "hotspot-active" : ""}`} aria-label="Zona interactiva: amplificador" onClick={() => handleRoomHotspot("amp")} disabled={isMoving || (roomPhase !== "amp-cable" && roomPhase !== "power")}>
                <span className="hotspot-pulse" /><AmpSprite powered={ampOn} /><span className="object-label">AMPLIFICADOR</span>
              </button>
              {ampInspection && <div className="amp-closeup" role="dialog" aria-label="Vista frontal del amplificador">
                <span className="closeup-label">VISTA FRONTAL · ÚNICO CONTROL</span>
                <AmpSprite large powered={ampOn} />
                <button className="power-switch" onClick={toggleAmplifier} aria-label={ampOn ? "Apagar ON/OFF" : "Encender ON/OFF"}><span className={`switch-light ${ampOn ? "lit" : ""}`} />ON / OFF <span className="switch-arrow">↵</span></button>
              </div>}
              {portalOpen && <div className="portal-glow" aria-hidden="true"><span className="portal-orbit portal-orbit-one" /><span className="portal-orbit portal-orbit-two" /><span className="portal-core" /><strong>PORTAL<br />ABIERTO</strong></div>}
              <span className="stage-coordinate">LF · 01</span>
            </div>
          ) : (
            <div className={`scene-stage dawn-stage ${sunRisen ? "dawn-stage-sunrise" : ""} ${flowerOpen ? "flower-open" : ""}`}>
              <div className="dawn-sky" />
              <SunSprite risen={sunRisen} />
              <svg className="ridge-art" viewBox="0 0 900 330" preserveAspectRatio="none" aria-hidden="true" shapeRendering="crispEdges">
                <path d="M0 274 42 238 88 255 132 196 174 219 213 135 255 171 304 92 339 128 385 67 430 104 467 54 502 109 536 82 577 142 619 111 666 181 709 147 755 213 802 193 850 252 900 238 900 330 0 330Z" fill="#565064" />
                <path d="M0 287 42 255 88 270 132 211 174 234 213 150 255 186 304 107 339 143 385 82 430 119 467 69 502 124 536 97 577 157 619 126 666 196 709 162 755 228 802 208 850 267 900 253" fill="none" stroke="#403b4c" strokeWidth="8" />
                <path d="M213 160 229 137 246 159 246 185 213 184ZM577 165 594 143 611 164 611 192 577 192Z" fill="#b49eae" />
                <path d="M0 291 98 273 177 286 260 264 347 284 438 260 527 282 621 262 708 282 798 267 900 291 900 330 0 330Z" fill="#777162" />
              </svg>
              <div className="ridge-label">EL CUCHILLO · LAS VENTANAS</div>
              <div className={`bird-flock ${birdsPassed ? "birds-visible" : ""}`} aria-label={birdsPassed ? "Bandada de pájaros silbando" : undefined}><span>◆</span><span>◆</span><span>◆</span><span>♪</span></div>
              <div className="closed-flower" aria-label={flowerOpen ? "Flor abierta" : "Flor cerrada"}><span className="flower-head">{seedCollected ? "✦" : flowerOpen ? "✿" : "●"}</span><span className="flower-stem" /><span className="flower-leaf" /></div>
              <div className={`lemon-actor lemon-path ${isMoving ? "walking" : ""}`}><LemonSprite /></div>
              {!dialogueStarted && !seedCollected && <button className="thought-hotspot" onClick={startDialogue} aria-label="Iniciar el diálogo interior del limón"><span>¿ESTOY SOLO?</span></button>}
              <div className="dawn-caption">{branch === "A" ? "EL LIMÓN SILBA" : branch === "B" && birdsPassed ? "LOS PÁJAROS RESPONDEN" : sunRisen ? "EL SOL HA SALIDO" : "ANTES DEL PRIMER RAYO"}</div>
              <span className="stage-coordinate">LF · 02</span>
            </div>
          )}

          <div className="stage-footer"><span className="pixel-cursor">✣</span><span>{scene === "room" ? roomInstruction : "Sigue el diálogo y observa cómo responde el paisaje."}</span><span className="footer-state"><i /> {scene === "room" ? roomPhaseLabel(roomPhase) : seedCollected ? "SEMILLA RECOGIDA" : flowerOpen ? "FLOR ABIERTA" : branch ? `CAMINO ${branch}` : "DIÁLOGO"}</span></div>
        </div>

        <aside className="control-column">
          <div className="control-head"><div><span className="stage-kicker">PANEL DEL JUEGO</span><h3>{scene === "room" ? "El local" : "El diálogo"}</h3></div><span className="tiny-orbit">✳</span></div>
          <div className="notice-box"><span className="notice-mark">✦</span><p>{notice}</p></div>

          {scene === "room" ? <>
            <div className="progress-list" aria-label="Progreso de la pantalla uno">
              <ProgressStep done={pluggedGuitar} active={roomPhase === "guitar-cable"} number="01" label="Cable a la guitarra" />
              <ProgressStep done={pluggedAmp} active={roomPhase === "amp-cable"} number="02" label="Cable al amplificador" />
              <ProgressStep done={ampOn} active={roomPhase === "power"} number="03" label="Encender el altavoz" />
              <ProgressStep done={portalOpen} active={roomPhase === "play"} number="04" label="Tocar Do♯ menor" />
            </div>

            {roomAction && <div className="context-card"><span className="context-kicker">ACCIÓN DISPONIBLE</span><h4>{roomActionLabel(roomAction)}</h4><button className="action-button" onClick={performRoomAction}>{roomActionLabel(roomAction)} <span>→</span></button></div>}

            {roomPhase === "play" && <div className="chord-panel">
              <div className="panel-section-title"><span>01 / SONIDO</span><span className="sound-dot" /></div>
              <h4>Prueba las notas</h4>
              <p className="small-copy">Elige notas de Do♯ menor y tócalas juntas. Do♯ debe estar en el acorde.</p>
              <div className="note-picker" aria-label="Seleccionar notas de la tonalidad de Do sostenido menor">
                {NOTES.map(note => <button key={note.id} className={`note-key ${selectedNotes.includes(note.id) ? "selected" : ""}`} onClick={() => toggleNote(note.id)} aria-pressed={selectedNotes.includes(note.id)}><strong>{note.label}</strong><small>{note.id}</small></button>)}
              </div>
              <button className="action-button play-button" onClick={playSelection}>Tocar selección <span>♫</span></button>
              <div className={`chord-readout ${lastChord.length ? "has-result" : ""}`}>
                <span className="readout-label">LO QUE INTERPRETA EL SISTEMA</span>
                <strong>{lastChord.length ? lastChord.join(" + ") : "—"}</strong>
                <small>{lastChord.length === 0 ? "Elige notas para empezar" : lastChord.length === 1 ? "Nota sola · no abre el portal" : validChord ? "Do♯ menor · acorde válido" : "No cumple la regla del portal"}</small>
              </div>
              <p className="footnote">Prueba sonora sintetizada para esta exploración; no es la grabación del disco.</p>
            </div>}

            {portalOpen && <div className="unlock-card"><span className="unlock-icon">◉</span><div><span className="context-kicker">RECOMPENSA 01</span><h4>{introStarted ? "Intro activada" : "Intro disponible"}</h4><p>El acorde abre el paso. Cruza para llegar al amanecer.</p></div><button className="action-button" onClick={enterDawn}>Cruzar portal <span>→</span></button></div>}
          </> : <>
            {!dialogueStarted && !seedCollected && <div className="context-card start-dialogue-card"><span className="context-kicker">AL LLEGAR</span><h4>¿Está solo en esta dimensión?</h4><p>El limón intenta responderse a sí mismo. Sus elecciones inclinan el diálogo hacia uno de dos desenlaces.</p><button className="action-button" onClick={startDialogue}>Empezar conversación <span>→</span></button></div>}

            {dialogueStarted && !branch && <div className="dialogue-card">
              <div className="panel-section-title"><span>TURNO {dialogueTurn + 1} / {DIALOGUE.length}</span><span className="dialogue-icon">“ ”</span></div>
              <div className="thought-bubble"><span>EL LIMÓN, PARA SÍ</span><p>{currentDialogue.prompt}</p></div>
              <div className="choice-list" aria-label="Tres respuestas posibles">
                <button onClick={() => chooseResponse("restart")}><span className="choice-code">↺</span><span><strong>{currentDialogue.restart}</strong><small>Vuelve a la primera línea</small></span><span className="choice-arrow">↗</span></button>
                <button onClick={() => chooseResponse("A")}><span className="choice-code">A</span><span><strong>{currentDialogue.a}</strong><small>Inclina la probabilidad hacia A</small></span><span className="choice-arrow">↗</span></button>
                <button onClick={() => chooseResponse("B")}><span className="choice-code">B</span><span><strong>{currentDialogue.b}</strong><small>Inclina la probabilidad hacia B</small></span><span className="choice-arrow">↗</span></button>
              </div>
              <div className="probability-box"><div className="probability-head"><span>INCLINACIÓN DEL DIÁLOGO</span><span>{probabilityA}% / {probabilityB}%</span></div><div className="probability-track"><span style={{ width: `${probabilityA}%` }} /></div><div className="probability-labels"><span>CAMINO A</span><span>CAMINO B</span></div></div>
              {dialogueHistory.length > 0 && <div className="history-list"><span className="readout-label">LO QUE HA PASADO</span>{dialogueHistory.map((item, index) => <small key={`${item}-${index}`}>{item}</small>)}</div>}
            </div>}

            {branch === "A" && !sunRisen && <div className="branch-card"><span className="branch-chip">CAMINO A · LLAMAR</span><div className="thought-bubble"><span>EL LIMÓN, PARA SÍ</span><p>Quizá mi silbido alcance el otro lado.</p></div><p className="small-copy">En este desenlace, solo aparece una respuesta posible.</p><button className="action-button whistle-button" onClick={whistle}>Silbar <span>♪</span></button></div>}
            {branch === "B" && !birdsPassed && <div className="branch-card quiet-card"><span className="branch-chip">CAMINO B · ESCUCHAR</span><div className="thought-bubble"><span>EL LIMÓN GUARDA SILENCIO</span><p>…</p></div><div className="silence-meter"><span /><span /><span /></div><p className="small-copy">No aparece la opción de silbar. El silencio se mantiene un instante.</p></div>}
            {branch === "B" && birdsPassed && <div className="branch-card"><span className="branch-chip">CAMINO B · LOS PÁJAROS</span><div className="thought-bubble"><span>EL LIMÓN ESCUCHA</span><p>Un silbido cruza el cielo. No está solo.</p></div><p className="small-copy">La bandada pasa por las ventanas de la sierra. Su silbido rompe el silencio; el sol despierta la flor.</p></div>}

            {flowerOpen && !seedCollected && <div className="context-card seed-card"><span className="context-kicker">LA FLOR SE HA ABIERTO</span><h4>Una semilla en el centro</h4><p>La canción aparece como una pequeña semilla.</p><button className="action-button" onClick={collectSeed}>Coger semilla <span>→</span></button></div>}
            {seedCollected && <div className="unlock-card song-card"><span className="unlock-icon">✦</span><div><span className="context-kicker">RECOMPENSA 02 · CANCIÓN DESBLOQUEADA</span><h4>Ventana al sendero</h4><p>El amanecer ya forma parte del viaje.</p></div><button className="text-button" onClick={() => setVisitedScene("room")}>Volver al local ↗</button></div>}

            <div className="branch-summary"><div className="panel-section-title"><span>LOS DOS DESENLACES</span><span className="branch-count">{branch ? "1 / 2" : "A · B"}</span></div><div className={`branch-row ${branch === "A" ? "chosen" : ""}`}><span className="branch-letter">A</span><span><strong>El limón silba</strong><small>La señal nace de él</small></span><span className="branch-arrow">{branch === "A" ? "●" : "○"}</span></div><div className={`branch-row ${branch === "B" ? "chosen" : ""}`}><span className="branch-letter">B</span><span><strong>Silban los pájaros</strong><small>La señal llega del cielo</small></span><span className="branch-arrow">{branch === "B" ? "●" : "○"}</span></div></div>
          </>}
        </aside>
      </section>

      <section className="storyboard-section" id="storyboard">
        <div className="storyboard-heading"><div><span className="stage-kicker">DOCUMENTO DE PREPRODUCCIÓN</span><h2>El storyboard original</h2></div><span>REFERENCIA VISUAL · PANTALLAS 01–02</span></div>
        <figure className="storyboard-frame"><img src="/storyboard-pantallas-01-02.png" alt="Storyboard conceptual: el local de ensayo vacío y el limón ante El Cuchillo de Albatera al amanecer." /><figcaption><span>01 · Local de ensayo</span><span>02 · El Cuchillo al amanecer</span></figcaption></figure>
      </section>

      <footer className="site-footer"><div className="footer-mark">LF<span>✳</span></div><p>Un guion se vuelve paisaje, un clic cada vez.</p><span>PREPRODUCCIÓN · VERSIÓN 0.4</span></footer>
    </main>
  );
}

function ProgressStep({ done, active, number, label }: { done: boolean; active: boolean; number: string; label: string }) {
  return <div className={`progress-step ${done ? "done" : ""} ${active ? "current" : ""}`}><span className="progress-number">{done ? "✓" : number}</span><span>{label}</span><i /></div>;
}

function roomPhaseLabel(phase: RoomPhase) {
  const labels: Record<RoomPhase, string> = {
    "guitar-cable": "CONECTAR · 1/4",
    "amp-cable": "CONECTAR · 2/4",
    power: "ENCENDER · 3/4",
    play: "TOCAR · 4/4",
    portal: "PORTAL ABIERTO",
  };
  return labels[phase];
}

function roomActionLabel(action: Exclude<RoomAction, null>) {
  const labels: Record<Exclude<RoomAction, null>, string> = {
    "plug-guitar": "Enchufar cable a la guitarra",
    "plug-amp": "Enchufar cable al amplificador",
    examine: "Examinar amplificador",
    play: "Tocar la guitarra",
  };
  return labels[action];
}
