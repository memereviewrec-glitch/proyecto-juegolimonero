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
  const [pluggedGuitar, setPluggedGuitar] = useState(false);
  const [pluggedAmp, setPluggedAmp] = useState(false);
  const [ampOn, setAmpOn] = useState(false);
  const [ampInspection, setAmpInspection] = useState(false);
  const [roomAction, setRoomAction] = useState<RoomAction>(null);
  const [lemonPosition, setLemonPosition] = useState("lemon-left");
  const [lemonFloorPoint, setLemonFloorPoint] = useState<{ x: number; bottom: number } | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [dawnLemonPoint, setDawnLemonPoint] = useState<{ x: number; bottom: number } | null>(null);
  const [dawnIsMoving, setDawnIsMoving] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [portalOpen, setPortalOpen] = useState(false);
  const [introStarted, setIntroStarted] = useState(false);

  const [dialogueStarted, setDialogueStarted] = useState(false);
  const [showDialogueChoices, setShowDialogueChoices] = useState(false);
  const [dialogueTurn, setDialogueTurn] = useState(0);
  const [scoreA, setScoreA] = useState(0);
  const [scoreB, setScoreB] = useState(0);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [silence, setSilence] = useState(false);
  const [birdsPassed, setBirdsPassed] = useState(false);
  const [sunRisen, setSunRisen] = useState(false);
  const [flowerOpen, setFlowerOpen] = useState(false);
  const [seedCollected, setSeedCollected] = useState(false);
  const [notice, setNotice] = useState("Empieza conectando el cable a la guitarra.");

  const validChord = useMemo(
    () => selectedNotes.length >= 2 && selectedNotes.includes("C#") && selectedNotes.every(note => NOTES.some(item => item.id === note)),
    [selectedNotes],
  );
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
    if (ampInspection || roomAction || isMoving) return;
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
    window.setTimeout(() => setIsMoving(false), 1450);
  }

  function handleDawnStageClick(event: MouseEvent<HTMLDivElement>) {
    if (dawnIsMoving) return;
    if (event.target instanceof Element && event.target.closest("button")) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 7, 93);
    const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 3, 96);
    if (y < dawnWalkableTop(x) + 2 || y > 95) return;
    setDawnLemonPoint({ x, bottom: 100 - y });
    setDawnIsMoving(true);
    window.setTimeout(() => setDawnIsMoving(false), 1450);
  }

  function advanceDialogue() {
    setShowDialogueChoices(true);
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
    setShowDialogueChoices(false);
    setDialogueTurn(0);
    setScoreA(0);
    setScoreB(0);
    setBranch(null);
    setSilence(false);
    setBirdsPassed(false);
    setSunRisen(false);
    setFlowerOpen(false);
    setSeedCollected(false);
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
      setSilence(true);
      setNotice("La conversación desemboca en el camino B. El limón guarda silencio y escucha.");
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
  const showOverlay = scene === "room"
    ? Boolean(roomAction) || roomPhase === "play" || portalOpen
    : dialogueStarted || branch !== null || flowerOpen || seedCollected;

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
      </nav>

      <section className="workspace">
        <div className="stage-column">
          <div className="stage-heading">
            <div><span className="stage-kicker">PANTALLA {scene === "room" ? "01" : "02"}</span><h2>{scene === "room" ? "El local de ensayo" : "El Cuchillo al amanecer"}</h2></div>
            <span className="stage-location">{scene === "room" ? "ANTES DE LA OTRA DIMENSIÓN" : "ALBATERA · AMANECER"}</span>
          </div>

          <div className={`playfield ${scene === "dawn" ? "playfield-portrait" : "playfield-room"}`}>
          {scene === "room" ? (
            <div className={`scene-stage room-stage ${ampOn ? "amp-is-on" : ""} ${portalOpen ? "room-portal-open" : ""}`} onClick={handleRoomStageClick}>
              <div className="room-world">
                <div className={`cable-line ${pluggedGuitar ? "cable-at-guitar" : ""} ${pluggedAmp ? "cable-at-amp" : ""} ${pluggedGuitar && pluggedAmp ? "cable-complete" : ""}`} aria-hidden="true"><span /></div>
                <div className={`lemon-actor ${lemonFloorPoint ? "lemon-free" : lemonPosition} ${isMoving ? "walking" : ""}`} style={lemonFloorPoint ? { left: `${lemonFloorPoint.x}%`, bottom: `${lemonFloorPoint.bottom}%` } : undefined}><LemonSprite /></div>
                <button className="hotspot guitar-hotspot" aria-label="Zona interactiva: guitarra" onClick={() => handleRoomHotspot("guitar")} disabled={isMoving || (roomPhase !== "guitar-cable" && roomPhase !== "play")} />
                <button className="hotspot amp-hotspot" aria-label="Zona interactiva: amplificador" onClick={() => handleRoomHotspot("amp")} disabled={isMoving || (roomPhase !== "amp-cable" && roomPhase !== "power")} />
                {ampInspection && <div className="amp-closeup" role="dialog" aria-label="Vista frontal del amplificador">
                  <span className="closeup-label">VISTA FRONTAL · ÚNICO CONTROL</span>
                  <AmpSprite large powered={ampOn} />
                  <button className="power-switch" onClick={toggleAmplifier} aria-label={ampOn ? "Apagar ON/OFF" : "Encender ON/OFF"}><span className={`switch-light ${ampOn ? "lit" : ""}`} />ON / OFF <span className="switch-arrow">↵</span></button>
                </div>}
                <span className="stage-coordinate">LF · 01</span>
              </div>
            </div>
          ) : (
            <div className={`scene-stage dawn-stage ${sunRisen ? "dawn-stage-sunrise" : ""}`} onClick={handleDawnStageClick}>
              <div className="dawn-veil" aria-hidden="true" />
              <div className={`bird-flock ${birdsPassed ? "birds-visible" : ""}`} aria-label={birdsPassed ? "Bandada de pájaros silbando" : undefined}><span>◆</span><span>◆</span><span>◆</span><span>♪</span></div>
              <button type="button" className={`dawn-lemon-actor ${dawnIsMoving ? "walking" : ""}`} style={dawnLemonPoint ? { left: `${dawnLemonPoint.x}%`, bottom: `${dawnLemonPoint.bottom}%` } : undefined} onClick={startDialogue} aria-label="Hablar con el limón" disabled={dialogueStarted || seedCollected}><LemonSprite /></button>
              <span className={`seed-spark ${flowerOpen ? "seed-spark-visible" : ""} ${seedCollected ? "seed-spark-collected" : ""}`} aria-hidden="true" />
              <span className="stage-coordinate">LF · 02</span>
            </div>
          )}

          {showOverlay && <aside className={`control-column ${scene === "room" ? "room-controls" : "dawn-controls"}`} aria-label="Cuadro de diálogo del juego">
            {scene === "room" ? <>
              {roomAction && <div className="dialogue-card action-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>{roomActionLabel(roomAction)}</p></div><button className="action-button" onClick={performRoomAction}>{roomActionLabel(roomAction)} <span>→</span></button></div>}
              {roomPhase === "play" && <div className="chord-panel"><div className="note-picker" aria-label="Notas de la guitarra">
                {NOTES.map(note => <button key={note.id} className={`note-key ${selectedNotes.includes(note.id) ? "selected" : ""}`} onClick={() => toggleNote(note.id)} aria-pressed={selectedNotes.includes(note.id)}><strong>{note.label}</strong><small>{note.id}</small></button>)}
              </div><button className="action-button play-button" onClick={playSelection}>Tocar <span>♫</span></button></div>}
              {portalOpen && <div className="unlock-card"><span className="unlock-icon">◉</span><div><span className="context-kicker">INTRO</span><h4>{introStarted ? "Intro activada" : "Intro"}</h4></div><button className="action-button" onClick={enterDawn}>Cruzar <span>→</span></button></div>}
            </> : <>
              {dialogueStarted && !branch && <div className="dialogue-card">
                {!showDialogueChoices ? <div className="thought-bubble"><span>EL LIMÓN</span><p>{currentDialogue.prompt}</p><button className="dialogue-next" onClick={advanceDialogue}>Siguiente <span>▶</span></button></div> : <div className="choice-list" aria-label="Tres respuestas posibles">
                  <button onClick={() => chooseResponse("restart")}><span className="choice-code">↺</span><strong>{currentDialogue.restart}</strong><span className="choice-arrow">▶</span></button>
                  <button onClick={() => chooseResponse("A")}><span className="choice-code">A</span><strong>{currentDialogue.a}</strong><span className="choice-arrow">▶</span></button>
                  <button onClick={() => chooseResponse("B")}><span className="choice-code">B</span><strong>{currentDialogue.b}</strong><span className="choice-arrow">▶</span></button>
                </div>}
              </div>}
              {branch === "A" && !sunRisen && <div className="branch-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>Quizá mi silbido alcance el otro lado.</p></div><button className="action-button whistle-button" onClick={whistle}>Silbar <span>♪</span></button></div>}
              {branch === "B" && !birdsPassed && <div className="branch-card quiet-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>…</p></div><div className="silence-meter"><span /><span /><span /></div></div>}
              {flowerOpen && !seedCollected && <div className="context-card seed-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>{branch === "B" ? "Un silbido cruza el cielo. No está solo." : "El silbido alcanza el otro lado."}</p></div><button className="action-button" onClick={collectSeed}>Coger semilla <span>→</span></button></div>}
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
    "plug-guitar": "Enchufar cable a la guitarra",
    "plug-amp": "Enchufar cable al amplificador",
    examine: "Examinar amplificador",
    play: "Tocar la guitarra",
  };
  return labels[action];
}
