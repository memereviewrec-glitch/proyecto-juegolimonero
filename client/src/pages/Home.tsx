import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { AmpCloseup, CableCloseup, CableSceneArt, GuitarCloseup, type FretSelection } from "../components/RoomCloseups";
import { LemonSprite } from "../components/GameSprites";
import { RuinsColumnPuzzle, type RuinsColumnSide } from "../components/RuinsColumnPuzzle";
import { RuinsScene, type RuinsFlowerStage } from "../components/RuinsScene";
import { CampfireScene, type CampfireFireStage } from "../components/CampfireScene";
import { RiverMirrorScene } from "../components/RiverMirrorScene";
import { RiverChallengeScene } from "../components/RiverChallengeScene";
import { ElRioScene } from "../components/ElRioScene";
import { FireForestScene } from "../components/FireForestScene";
import { HummingbirdScene, type HummingbirdOutcome } from "../components/HummingbirdScene";
import { NueveSentidosScene } from "../components/NueveSentidosScene";
import { JaguarScene } from "../components/JaguarScene";
import { JaguarStatsHud } from "../components/JaguarStatsHud";
import { createInitialJaguarStats, type JaguarHistory, type JaguarStats } from "../components/jaguarRules";
import type { JaguarEndingId, RewriteChapterId } from "../components/storyArchive";
import { DevPlaytestTools, type DevFriendPreview } from "./DevPlaytestTools";
import { StoryInterlude } from "../components/StoryInterlude";
import { CAMPFIRE_STICK_COUNT, canCollectCampfireStick, canPlaceCampfireStick, type CampfirePoint } from "../components/campfireMovementRules";
import { RAMBLA_CONVERSATION, resolveRamblaOutcome } from "../components/ramblaConversationRules";
import type { RamblaChoice, RamblaOutcome } from "../components/ramblaConversationRules";
import type { RiverChallengeOutcome, RiverConversationOutcome } from "../components/riverChoiceRules";
import { SeedBook, SONG_CATALOG, type SeedSongId } from "../components/SeedBook";
import { SeedGlyph } from "../components/SeedGlyph";
import type { PhysicalSeedId } from "../components/seed-colors";
import { gameAssetUrl, playFrequencies, playWhistle, stopGameAudio } from "../gameAudio";
import { clearStoredGameProgress, clearStoredRiverConversationOutcome, mergeDiscoveredSeedIds, readStoredDawnOutcome, readStoredHummingbirdFriendship, readStoredHummingbirdOutcome, readStoredJaguarEndings, readStoredRamblaOutcome, readStoredRiverChallengeOutcome, readStoredRiverConversationOutcome, readStoredSeedBookIds, saveDawnOutcome, saveHummingbirdOutcome, saveJaguarEnding, saveRamblaOutcome, saveRiverChallengeOutcome, saveRiverConversationOutcome, saveSeedBookIds } from "../gameProgressStorage";
import { DIALOGUE, clamp, dawnWalkableTop, isValidCSharpMinorChord, resolveBranch, type Branch, type Response } from "../gameRules";
import { isSceneUnlocked, type GameScene } from "../sceneAccessRules";
import { createAttemptTaskScope } from "../attemptTaskScope";
import "./home.css";

type Scene = GameScene;
const SCENE_PRESENTATION: Record<Scene, { number: string; title: string; location: string | null }> = {
  room: { number: "01", title: "El local de ensayo", location: null },
  dawn: { number: "02", title: "El Cuchillo al amanecer", location: "ALBATERA · AMANECER" },
  ruins: { number: "03", title: "Ruinas invadidas por raíces", location: "EL CAMINO · DOS COLUMNAS" },
  gathering: { number: "04", title: "Encuentro bajo la luna", location: "VALLE · NOCHE DE LUNA" },
  river: { number: "05", title: "La Orilla del Río Espejo", location: "RÍO ESPEJO · DESPUÉS DEL FUEGO" },
  "river-challenge": { number: "06", title: "El reto del río", location: "RÍO ESPEJO · LA PRUEBA" },
  "el-rio": { number: "07", title: "El Río", location: "RÍO ESPEJO · FONDO DEL CAUCE" },
  "fire-forest": { number: "08", title: "El bosque ardiendo", location: "BOSQUE · DESPUÉS DEL INCENDIO" },
  hummingbird: { number: "09", title: "El colibrí", location: "BOSQUE QUEMADO · LA RAMA" },
  "nueve-sentidos": { number: "10", title: "Nueve sentidos", location: "CIELO NOCTURNO · NUEVE SENTIDOS" },
  jaguar: { number: "11", title: "El Jaguar", location: "BOSQUE · CUEVA OCULTA DEL JAGUAR" },
};
type StoryBeat = "opening" | "portal" | "ruins" | "sect" | "river-arrival" | "spirits-challenge" | "el-rio" | "fire-forest" | "ponzona" | "ponzona-friend" | "ponzona-doubt" | "ponzona-leaves" | "nueve-sentidos-cave";
type RoomPhase = "guitar-cable" | "amp-cable" | "power" | "play" | "portal";
type RoomTarget = "guitar" | "amp" | "cable";
type RoomAction = "examine-cable" | "examine" | "play" | "guitar-unplugged" | "amp-off" | null;
type RoomView = "scene" | "cable" | "amp" | "guitar";
const REWRITE_TARGETS: Record<RewriteChapterId, Scene> = {
  dawn: "dawn",
  rambla: "gathering",
  river: "river",
  "river-challenge": "river-challenge",
  hummingbird: "hummingbird",
  jaguar: "jaguar",
};

const WALK_DURATION_MS = 2600;
const PORTAL_TRANSIT_DURATION_MS = 2800;
const PORTAL_ARRIVAL_DURATION_MS = 4800;
const DAWN_FLOWER_DELAY_MS = 2600;
const FLOWER_SEED_DROP_MS = 1900;
const LEMON_WHISTLE_DURATION_MS = 2200;
const BIRD_FLYBY_DURATION_MS = 6200;
const CAMPFIRE_LIGHT_DURATION_MS = 2200;
const BAND_INSTAGRAM_LINKS = [{ label: "Instagram de la banda", url: null }] as const;

function storyText(beat: StoryBeat, ramblaOutcome: RamblaOutcome | null) {
  if (beat === "opening") return "Había una vez un limón que quería descubrir los límites del conocimiento y la realidad.";
  if (beat === "portal") return "El limón tomó la semilla del conocimiento que salió del portal. La semilla lo arrastró para atravesar la abertura con ella en su posesión y llegar a otra dimensión. Al otro lado se encontró muy solo y comprendió que ya no sabía cómo volver a casa. Desde entonces, encontrar un hogar se convirtió en el nudo de su historia.";
  if (beat === "ruins") return "Sin saber todavía cómo volver, el limón comenzó a andar por las ruinas. Cada piedra parecía guardar una pregunta y cada raíz, un camino que no figuraba en ningún mapa.";
  if (beat === "sect") return "Tras las ruinas encontró a la secta del conocimiento oculto. Sus encapuchados hablaban de una verdad reservada para unos pocos y aguardaban junto a una hoguera, como si el fuego pudiera responder por ellos.";
  if (beat === "river-arrival") {
    const arrival = ramblaOutcome === 2
      ? "El limón escapó de la secta rodando colina abajo y llegó al río con la cáscara raspada. Seguía vivo, pero se sentía aburrido y solo después de huir."
      : "El limón creyó que la secta lo había iluminado y llegó andando hasta el río. Poseía, según él, el conocimiento supremo; aun así, se sentía aburrido y solo con tanta verdad quieta.";
    return `${arrival} Así que decidió lanzar piedras al agua, para ver si algo le respondía desde el fondo.`;
  }
  if (beat === "spirits-challenge") return "Las aguas respondieron y los Espíritus del Río se alzaron ante el limón. Después de escuchar sus palabras, lo retaron a entrar en la corriente y mirar más allá de su propio reflejo.";
  if (beat === "el-rio") return "Tras la conversación, los Espíritus del Río le recomendaron recoger las 10 semillas mágicas si quería volver a casa. Después le señalaron el fondo del cauce: allí se escondía la siguiente semilla. El limón se preparó para buscarla entre los peces y las corrientes.";
  if (beat === "ponzona-friend") return "Confiando en su nueva amistad, el colibrí entregó a Limón una semilla y decidió acompañarlo en el sendero.";
  if (beat === "ponzona-doubt") return "El miedo dejó al colibrí paralizado. No podía acompañar a Limón, pero quiso ayudarlo y le entregó una semilla para que continuara su viaje.";
  if (beat === "ponzona-leaves") return "El colibrí dejó una semilla junto a Limón y alzó el vuelo para alejarse. Limón la recogió mientras su compañero desaparecía en el cielo.";
  if (beat === "ponzona") return "Tras el incendio, todos los animales se lamentaban. En especial el colibrí, cuya casa había quedado destruida. Sin bosque al que regresar, ya no sabía qué hacer. Entonces comenzó a conversar con Limón…";
  if (beat === "nueve-sentidos-cave") return "La luz de la luna señaló el camino hasta la cueva más profunda, donde aguarda el secreto mayor guardado del bosque.";
  return "Con la semilla de «El Río» guardada en el Libro, el limón siguió la corriente. En el fondo del cauce encontró otra señal del camino, que lo condujo hasta un bosque que ardía a lo lejos. Allí no había nada que hacer salvo esperar a que llegara la lluvia.";
}

const STORY_SEEDS: Partial<Record<StoryBeat, PhysicalSeedId>> = {
  portal: "intro",
  ruins: "ventana",
  sect: "raices",
  "river-arrival": "rambla",
  "spirits-challenge": "espiritus-del-rio",
  "el-rio": "el-rio",
  "ponzona-friend": "ponzona",
  "ponzona-doubt": "ponzona",
  "ponzona-leaves": "ponzona",
  "nueve-sentidos-cave": "nueve-sentidos",
  "fire-forest": "el-rio",
};

function motionDuration(duration: number) {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
}

function restartGame() {
  if (typeof window === "undefined") return;
  if (!clearStoredGameProgress()) {
    window.alert("No se pudo borrar el progreso guardado. Comprueba los permisos de almacenamiento del navegador.");
    return;
  }
  stopGameAudio();
  window.location.reload();
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

type HomeProps = {
  openWorldExplorer?: boolean;
  openJaguarPreview?: boolean;
  openRiverChallengePreview?: boolean;
};

export default function Home({ openWorldExplorer = false, openJaguarPreview = false, openRiverChallengePreview = false }: HomeProps = {}) {
  const attemptTasks = useMemo(() => createAttemptTaskScope(
    (callback, delay) => window.setTimeout(callback, delay),
    id => window.clearTimeout(id),
  ), []);
  const scheduleAttemptTask = attemptTasks.schedule;
  useEffect(() => () => attemptTasks.reset(), [attemptTasks]);
  const isDevelopment = import.meta.env.DEV;
  const previewTestMode = isDevelopment && (openJaguarPreview || openRiverChallengePreview) && new URLSearchParams(window.location.search).get("pruebas") === "1";
  const [scene, setScene] = useState<Scene>(openJaguarPreview ? "jaguar" : openRiverChallengePreview ? "river-challenge" : "room");
  const [devSelectedScene, setDevSelectedScene] = useState<Scene>("room");
  const [devFriendPreview, setDevFriendPreview] = useState<DevFriendPreview>("saved");
  const [storyBeat, setStoryBeat] = useState<StoryBeat | null>(openWorldExplorer || openJaguarPreview || openRiverChallengePreview ? null : "opening");
  const [storySeedBookOpened, setStorySeedBookOpened] = useState(false);
  const [storySeedPreview, setStorySeedPreview] = useState<SeedSongId | null>(null);
  const [seedBookOpen, setSeedBookOpen] = useState(openWorldExplorer && !openJaguarPreview && !openRiverChallengePreview);
  const [previewChromeHidden, setPreviewChromeHidden] = useState(openJaguarPreview || openRiverChallengePreview);
  const [journeyMenuOpen, setJourneyMenuOpen] = useState(false);
  const [journeyRestartConfirm, setJourneyRestartConfirm] = useState(false);
  const journeyMenuRef = useRef<HTMLDivElement | null>(null);
  const [persistedSeedIds, setPersistedSeedIds] = useState<SeedSongId[]>(() => openWorldExplorer
    ? SONG_CATALOG.map(song => song.id)
    : readStoredSeedBookIds(SONG_CATALOG.map(song => song.id)));
  const [sceneReplayNonce, setSceneReplayNonce] = useState(0);
  const [roomPhase, setRoomPhase] = useState<RoomPhase>("guitar-cable");
  const [roomView, setRoomView] = useState<RoomView>("scene");
  const [pluggedGuitar, setPluggedGuitar] = useState(false);
  const [pluggedAmp, setPluggedAmp] = useState(false);
  const [ampOn, setAmpOn] = useState(false);
  const [roomAction, setRoomAction] = useState<RoomAction>(null);
  const [lemonPosition, setLemonPosition] = useState("lemon-left");
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
  const [dawnOutcome, setDawnOutcome] = useState<Branch | null>(readStoredDawnOutcome);
  const [birdsPassed, setBirdsPassed] = useState(false);
  const [dawnOutcomeAnimationRunning, setDawnOutcomeAnimationRunning] = useState(false);
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
  const [campfirePlacedStickIds, setCampfirePlacedStickIds] = useState<number[]>([]);
  const [selectedStickId, setSelectedStickId] = useState<number | null>(null);
  const [campfireFireStage, setCampfireFireStage] = useState<CampfireFireStage>("unlit");
  const [campfireSeedCollected, setCampfireSeedCollected] = useState(false);
  const [riverSeedCollected, setRiverSeedCollected] = useState(false);
  const [riverConversationComplete, setRiverConversationComplete] = useState(false);
  const [riverChallengeComplete, setRiverChallengeComplete] = useState(false);
  const [riverChallengeOutcome, setRiverChallengeOutcome] = useState<RiverChallengeOutcome | null>(readStoredRiverChallengeOutcome);
  const [riverConversationOutcome, setRiverConversationOutcome] = useState<RiverConversationOutcome | null>(readStoredRiverConversationOutcome);
  const [elRioSeedCollected, setElRioSeedCollected] = useState(false);
  const [elRioBlackAnsweredWhite, setElRioBlackAnsweredWhite] = useState(false);
  const [fireSeedCollected, setFireSeedCollected] = useState(false);
  const [ponzonaSeedCollected, setPonzonaSeedCollected] = useState(false);
  const [nueveSentidosSeedCollected, setNueveSentidosSeedCollected] = useState(false);
  const [nueveSentidosEpilogueReady, setNueveSentidosEpilogueReady] = useState(false);
  const [jaguarSeedCollected, setJaguarSeedCollected] = useState(false);
  const [archivedJaguarEndings, setArchivedJaguarEndings] = useState<JaguarEndingId[]>(readStoredJaguarEndings);
  const [hummingbirdIsFriend, setHummingbirdIsFriend] = useState(readStoredHummingbirdFriendship);
  const [hummingbirdOutcome, setHummingbirdOutcome] = useState<HummingbirdOutcome | null>(readStoredHummingbirdOutcome);
  const [ramblaConversationStep, setRamblaConversationStep] = useState(0);
  const [ramblaPacificPoints, setRamblaPacificPoints] = useState(0);
  const [ramblaDrasticPoints, setRamblaDrasticPoints] = useState(0);
  const [ramblaOutcome, setRamblaOutcome] = useState<RamblaOutcome | null>(null);
  const [ramblaHistoryOutcome, setRamblaHistoryOutcome] = useState<RamblaOutcome | null>(readStoredRamblaOutcome);
  const [ramblaSkillFailures, setRamblaSkillFailures] = useState(0);
  const [ramblaEscapeSucceeded, setRamblaEscapeSucceeded] = useState(false);
  const [lemonWhistling, setLemonWhistling] = useState(false);
  const [notice, setNotice] = useState("");
  const jaguarHistory = useMemo<JaguarHistory>(() => ({
    dawnOutcome,
    ramblaOutcome: ramblaHistoryOutcome,
    hummingbirdOutcome,
    riverConversationOutcome,
    riverChallengeOutcome,
    nueveSentidosSeedCollected: nueveSentidosSeedCollected || persistedSeedIds.includes("nueve-sentidos"),
  }), [dawnOutcome, ramblaHistoryOutcome, hummingbirdOutcome, riverConversationOutcome, riverChallengeOutcome, nueveSentidosSeedCollected, persistedSeedIds]);
  const initialJaguarStats = useMemo(() => createInitialJaguarStats(jaguarHistory), [jaguarHistory]);
  const [jaguarStatsSnapshot, setJaguarStatsSnapshot] = useState<{ history: JaguarHistory; stats: JaguarStats } | null>(null);
  const jaguarHudStats = jaguarStatsSnapshot?.history === jaguarHistory ? jaguarStatsSnapshot.stats : initialJaguarStats;
  const reportJaguarStats = useMemo(() => (stats: JaguarStats) => {
    setJaguarStatsSnapshot({ history: jaguarHistory, stats });
  }, [jaguarHistory]);
  const recordJaguarEnding = useMemo(() => (ending: JaguarEndingId) => {
    const storedEndings = saveJaguarEnding(ending);
    setArchivedJaguarEndings(current => [...new Set([...current, ...storedEndings, ending])]);
  }, []);

  useEffect(() => {
    if (!journeyMenuOpen) return;
    const handlePointerDown = (event: globalThis.PointerEvent) => {
      if (journeyMenuRef.current && !journeyMenuRef.current.contains(event.target as Node)) {
        setJourneyMenuOpen(false);
        setJourneyRestartConfirm(false);
      }
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [journeyMenuOpen]);

  useEffect(() => {
    if (!leftColumnRevealed || !rightColumnRevealed) return;
    setRuinsFlowerStage("growing");
    const openTimer = scheduleAttemptTask(() => setRuinsFlowerStage("open"), motionDuration(1700));
    const fallTimer = scheduleAttemptTask(() => setRuinsFlowerStage("falling"), motionDuration(3100));
    const seedTimer = scheduleAttemptTask(() => setRuinsFlowerStage("seed"), motionDuration(4200));
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(fallTimer);
      window.clearTimeout(seedTimer);
    };
  }, [leftColumnRevealed, rightColumnRevealed]);

  useEffect(() => {
    if (campfireFireStage !== "lighting") return;
    const timer = scheduleAttemptTask(() => {
      setCampfireFireStage("seed");
      setNotice("La hoguera respira bajo la luna; algo turquesa despierta entre las llamas.");
    }, motionDuration(CAMPFIRE_LIGHT_DURATION_MS));
    return () => window.clearTimeout(timer);
  }, [campfireFireStage]);

  function moveTo(position: string, callback: () => void) {
    setIsMoving(true);
    setLemonPosition(position);
    scheduleAttemptTask(() => {
      setIsMoving(false);
      callback();
    }, motionDuration(WALK_DURATION_MS));
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
    scheduleAttemptTask(() => setDawnIsMoving(false), motionDuration(WALK_DURATION_MS));
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
        moveTo("lemon-guitar", () => setRoomAction("guitar-unplugged"));
        setNotice("La guitarra no está enchufada. Tengo que conectar el cable antes de tocar.");
        return;
      }
      if (!ampOn) {
        moveTo("lemon-guitar", () => setRoomAction("amp-off"));
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
    const alreadySelected = selectedFrets.some(item => item.key === note.key);
    const nextFrets = alreadySelected
      ? selectedFrets.filter(item => item.key !== note.key)
      : [...selectedFrets.filter(item => item.stringIndex !== note.stringIndex), note];
    setSelectedFrets(nextFrets);

    if (isValidCSharpMinorChord(nextFrets.map(selectedNote => selectedNote.noteId))) {
      playFrequencies(nextFrets.map(selectedNote => selectedNote.frequency));
      setPortalOpen(true);
      setIntroStarted(true);
      setRoomPhase("portal");
      setRoomView("scene");
      setNotice("Acorde válido de Do♯ menor. El portal se abre y empieza «Aurora».");
      return;
    }

    playFrequencies([note.frequency]);
  }

  function enterDawn() {
    if (!portalOpen || portalTransit) return;
    setPortalTransit(true);
    setIsMoving(false);
    setLemonPosition("lemon-portal");
    setNotice("El limón salta hacia el portal.");
    scheduleAttemptTask(() => {
      setDawnLemonPoint(null);
      setDawnIsMoving(false);
      resetSceneAttempt("dawn");
      setScene("dawn");
      setSceneReplayNonce(version => version + 1);
      setPortalTransit(false);
      setStorySeedBookOpened(false);
      setStorySeedPreview(null);
      setStoryBeat("portal");
      setLemonPosition("lemon-left");
      setRoomAction(null);
      setArrivalPortal(true);
      setNotice("El portal aparece ante el amanecer de la otra dimensión.");
      scheduleAttemptTask(() => setArrivalPortal(false), motionDuration(PORTAL_ARRIVAL_DURATION_MS));
    }, motionDuration(PORTAL_TRANSIT_DURATION_MS));
  }

  function startDialogue() {
    attemptTasks.reset();
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
    scheduleAttemptTask(() => {
      setFlowerOpen(true);
      scheduleAttemptTask(() => setSeedAvailable(true), motionDuration(FLOWER_SEED_DROP_MS));
    }, motionDuration(DAWN_FLOWER_DELAY_MS));
  }

  function whistle(outcome: Branch | null = branch) {
    if (outcome !== "A" || sunRisen) return;
    const animationDuration = motionDuration(LEMON_WHISTLE_DURATION_MS);
    setDawnOutcome(outcome);
    saveDawnOutcome(outcome);
    setBranch(outcome);
    setDawnOutcomeAnimationRunning(animationDuration > 0);
    playWhistle("lemon");
    setLemonWhistling(true);
    scheduleAttemptTask(() => {
      setLemonWhistling(false);
      setDawnOutcomeAnimationRunning(false);
    }, animationDuration);
    beginSunrise("El limón silba. El cielo empieza a iluminarse y la flor se prepara para abrirse.");
  }

  function listenToBirds(outcome: Branch | null = branch) {
    if (outcome !== "B" || birdsPassed || sunRisen) return;
    const animationDuration = motionDuration(BIRD_FLYBY_DURATION_MS);
    setDawnOutcome(outcome);
    saveDawnOutcome(outcome);
    setBranch(outcome);
    setDawnOutcomeAnimationRunning(animationDuration > 0);
    playWhistle("birds");
    setBirdsPassed(true);
    scheduleAttemptTask(() => setDawnOutcomeAnimationRunning(false), animationDuration);
    beginSunrise("El limón mira al cielo. Los pájaros silban mientras el amanecer ilumina la sierra.");
  }

  function collectSeed() {
    if (!seedAvailable || seedCollected) return;
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
    if (ruinsFlowerStage !== "seed" || rootsSeedCollected) return;
    setRootsSeedCollected(true);
    setNotice("La tercera semilla, «Raíces», queda en tu equipaje.");
  }

  function pickCampfireStick(stickId: number, lemonPoint: CampfirePoint, stickPoint: CampfirePoint, isWalking: boolean) {
    if (ramblaOutcome !== 1 || campfireFireStage !== "unlit" || selectedStickId !== null || campfirePlacedStickIds.includes(stickId)) return;
    if (!canCollectCampfireStick(lemonPoint, stickPoint, isWalking)) return;
    setSelectedStickId(stickId);
    setNotice("La madera cruje entre las manos del limón.");
  }

  function placeCampfireStick(lemonPoint: CampfirePoint, isWalking: boolean) {
    if (ramblaOutcome !== 1 || campfireFireStage !== "unlit" || selectedStickId === null || campfirePlacedStickIds.length >= CAMPFIRE_STICK_COUNT) return;
    if (!canPlaceCampfireStick(lemonPoint, isWalking)) return;
    if (!campfirePlacedStickIds.includes(selectedStickId)) {
      setCampfirePlacedStickIds(current => current.includes(selectedStickId) ? current : [...current, selectedStickId]);
    }
    setSelectedStickId(null);
    setNotice(campfirePlacedStickIds.length + 1 >= CAMPFIRE_STICK_COUNT
      ? "Tres ramas duermen en el círculo de piedra."
      : "Una rama encuentra su lugar junto a las brasas.");
  }

  function igniteCampfire() {
    if (ramblaOutcome !== 1 || campfireFireStage !== "unlit" || campfirePlacedStickIds.length < CAMPFIRE_STICK_COUNT) return;
    setCampfireFireStage("lighting");
    setNotice("Una chispa despierta en el corazón de la noche.");
  }

  function collectCampfireSeed() {
    const fireRouteSeedReady = ramblaOutcome === 1 && campfireFireStage === "seed";
    const escapeRouteSeedReady = ramblaOutcome === 2 && ramblaEscapeSucceeded;
    if ((!fireRouteSeedReady && !escapeRouteSeedReady) || campfireSeedCollected) return;
    setCampfireSeedCollected(true);
    setNotice("Semilla de «Rambla» recogida y añadida al Libro de Semillas.");
  }

  function collectRiverSeed() {
    if (riverSeedCollected) return;
    setRiverSeedCollected(true);
    setNotice("La semilla plateada de «Espíritus del río» queda en el Libro de Semillas.");
  }

  function recordRiverConversationChoice(outcome: RiverConversationOutcome) {
    setRiverConversationOutcome(outcome);
    saveRiverConversationOutcome(outcome);
  }

  function collectElRioSeed() {
    if (elRioSeedCollected) return;
    setElRioSeedCollected(true);
    setNotice("El pez blanco entrega la semilla de «El Río» al Libro de Semillas.");
  }

  function collectFireSeed() {
    if (fireSeedCollected) return;
    setFireSeedCollected(true);
    setNotice("La semilla negra y quemada queda en el Libro de Semillas.");
    setJourneyMenuOpen(false);
    openStorySeedBook("el-fuego");
  }

  function collectPonzonaSeed() {
    if (!ponzonaSeedCollected) {
      setPonzonaSeedCollected(true);
      setNotice("El colibrí entrega una semilla y queda guardada en el Libro de Semillas.");
    } else {
      setNotice("El nuevo desenlace queda guardado; la semilla ya estaba en el Libro.");
    }
    const endingBeat: StoryBeat = hummingbirdOutcome === "good"
      ? "ponzona-friend"
      : hummingbirdOutcome === "bad"
        ? "ponzona-leaves"
        : "ponzona-doubt";
    showStory(endingBeat);
  }

  function collectNueveSentidosSeed() {
    if (nueveSentidosSeedCollected) return;
    setNueveSentidosSeedCollected(true);
    setNotice("La semilla de «Nueve sentidos» entra en el Libro. El camino hacia El Jaguar queda iluminado.");
    setJourneyMenuOpen(false);
    // La semilla se guarda sin abrir el Libro encima del botón que lleva a la diapositiva de la cueva.
    setSeedBookOpen(false);
    setStorySeedBookOpened(false);
    setStorySeedPreview(null);
  }
  function completeNueveSentidosScene() {
    setNueveSentidosEpilogueReady(true);
  }
  function collectJaguarSeed() {
    if (!jaguarSeedCollected) {
      setJaguarSeedCollected(true);
      setNotice("La última semilla queda guardada en el Libro de Semillas.");
    }
    setJourneyMenuOpen(false);
    openStorySeedBook("el-jaguar");
  }

  function returnHomeFromJaguar() {
    resetSceneAttempt("room");
    setSceneReplayNonce(version => version + 1);
    setScene("room");
    setStoryBeat(null);
    setStorySeedPreview(null);
    setSeedBookOpen(false);
    setJourneyMenuOpen(false);
    setJourneyRestartConfirm(false);
    setPreviewChromeHidden(false);
    setRoomView("scene");
    setRoomAction(null);
    setPortalTransit(false);
    setArrivalPortal(false);
    setNotice("El limón atraviesa el portal y vuelve a casa. El Libro de Semillas sigue disponible.");
  }

  function recordHummingbirdOutcome(outcome: HummingbirdOutcome) {
    setHummingbirdIsFriend(outcome === "good");
    setHummingbirdOutcome(outcome);
    saveHummingbirdOutcome(outcome);
  }

  function chooseRamblaResponse(choice: RamblaChoice) {
    if (ramblaOutcome !== null || campfireSeedCollected) return;
    const path = choice.path;
    const nextPacific = ramblaPacificPoints + (path === "pacifico" ? 1 : 0);
    const nextDrastic = ramblaDrasticPoints + (path === "drastico" ? 1 : 0);
    setRamblaPacificPoints(nextPacific);
    setRamblaDrasticPoints(nextDrastic);

    if (ramblaConversationStep < RAMBLA_CONVERSATION.length - 1) {
      setRamblaConversationStep(step => step + 1);
      return;
    }

    const outcome = resolveRamblaOutcome(nextPacific, nextDrastic);
    const riverChoiceMustBeRewritten = ramblaHistoryOutcome !== null && ramblaHistoryOutcome !== outcome;
    setRamblaOutcome(outcome);
    setRamblaHistoryOutcome(outcome);
    saveRamblaOutcome(outcome);
    if (riverChoiceMustBeRewritten) {
      setRiverConversationOutcome(null);
      clearStoredRiverConversationOutcome();
      setNotice("La ruta de Rambla ha cambiado. La respuesta de Espíritus del río queda pendiente y podrás volver directamente desde Reescribir historia.");
    } else {
      setNotice(outcome === 1
        ? "El líder ríe secamente y acepta al limón como oráculo peregrino. El fuego reconoce tres recuerdos del bosque."
        : "Los encapuchados gritan «¡Alimenta la hoguera!». El sendero tiembla bajo la sombra de la secta.");
    }
  }

  function attemptRamblaEscape(success: boolean) {
    if (ramblaOutcome !== 2 || ramblaEscapeSucceeded || ramblaSkillFailures >= 3) return;
    if (success) {
      setRamblaEscapeSucceeded(true);
      setNotice("El limón se pierde cuesta abajo. Un brillo turquesa tiembla entre las piedras.");
      return;
    }
    const failures = ramblaSkillFailures + 1;
    setRamblaSkillFailures(failures);
    setNotice(failures >= 3
      ? "La bajada se complica; puedes reintentar la tirada de habilidad."
      : `La rueda patina. Fallo ${failures} de 3; busca el momento justo y vuelve a rodar.`);
  }

  function retryRamblaEscape() {
    if (ramblaOutcome !== 2 || ramblaEscapeSucceeded || ramblaSkillFailures < 3) return;
    setRamblaSkillFailures(0);
    setNotice("La tirada vuelve a empezar. Espera la franja segura y rueda.");
  }

  function canVisitScene(nextScene: Scene) {
    return !portalTransit && !arrivalPortal && !storyBeat && isSceneUnlocked(nextScene, {
      currentScene: scene,
      discoveredSeedIds: discoveredSongIds,
      riverChallengeComplete,
      riverChallengeOutcome,
    });
  }

  function setVisitedScene(nextScene: Scene) {
    if (!canVisitScene(nextScene)) return;
    if (nextScene === "jaguar" && scene !== "jaguar") setJaguarStatsSnapshot(null);
    resetSceneAttempt(nextScene);
    setScene(nextScene);
    setSceneReplayNonce(version => version + 1);
    setRoomView("scene");
    setRoomAction(null);
    setRuinsAction(null);
    setRuinsView("scene");
  }

  function enterReplayScene(targetScene: Scene) {
    stopGameAudio();
    setSeedBookOpen(false);
    setStoryBeat(null);
    setStorySeedBookOpened(false);
    setStorySeedPreview(null);
    if (targetScene === "jaguar") setJaguarStatsSnapshot(null);
    resetSceneAttempt(targetScene);
    setScene(targetScene);
    setSceneReplayNonce(version => version + 1);
    setNotice("");
    setPortalTransit(false);
    setArrivalPortal(false);
    setRoomView("scene");
    setRoomAction(null);
    setRuinsView("scene");
    setRuinsAction(null);
    setJourneyMenuOpen(false);
    setLemonWhistling(false);
    setDawnIsMoving(false);
    setIsMoving(false);
  }

  function rewriteChapter(chapterId: RewriteChapterId) {
    if (!discoveredSongIds.includes("el-jaguar")) return;
    enterReplayScene(REWRITE_TARGETS[chapterId]);
  }

  function resetSceneAttempt(targetScene: Scene) {
    attemptTasks.reset();
    setPortalTransit(false);
    setArrivalPortal(false);
    setLemonWhistling(false);
    setDawnIsMoving(false);
    setIsMoving(false);
    setNotice("");

    if (targetScene === "room") {
      setRoomPhase("guitar-cable");
      setRoomView("scene");
      setPluggedGuitar(false);
      setPluggedAmp(false);
      setAmpOn(false);
      setRoomAction(null);
      setSelectedFrets([]);
      setPortalOpen(false);
      setIntroStarted(false);
      setLemonPosition("lemon-left");
    } else if (targetScene === "dawn") {
      setDawnLemonPoint(null);
      setDialogueStarted(false);
      setShowDialogueChoices(false);
      setDialogueTurn(0);
      setScoreA(0);
      setScoreB(0);
      setBranch(null);
      setPendingBranch(null);
      setBirdsPassed(false);
      setDawnOutcomeAnimationRunning(false);
      setSunRisen(false);
      setFlowerOpen(false);
      setSeedAvailable(false);
      setSeedCollected(false);
    } else if (targetScene === "ruins") {
      setLeftColumnRevealed(false);
      setRightColumnRevealed(false);
      setRuinsView("scene");
      setRuinsAction(null);
      setRuinsFlowerStage("hidden");
      setRootsSeedCollected(false);
    } else if (targetScene === "gathering") {
      setCampfirePlacedStickIds([]);
      setSelectedStickId(null);
      setCampfireFireStage("unlit");
      setCampfireSeedCollected(false);
      setRamblaConversationStep(0);
      setRamblaPacificPoints(0);
      setRamblaDrasticPoints(0);
      setRamblaOutcome(null);
      setRamblaSkillFailures(0);
      setRamblaEscapeSucceeded(false);
    } else if (targetScene === "river") {
      setRiverSeedCollected(false);
      setRiverConversationComplete(false);
      setRiverChallengeComplete(false);
      setElRioBlackAnsweredWhite(false);
    } else if (targetScene === "river-challenge") {
      setRiverChallengeComplete(false);
    } else if (targetScene === "el-rio") {
      setElRioSeedCollected(false);
      setElRioBlackAnsweredWhite(false);
    } else if (targetScene === "fire-forest") {
      setFireSeedCollected(false);
    } else if (targetScene === "hummingbird") {
      setPonzonaSeedCollected(false);
    } else if (targetScene === "nueve-sentidos") {
      setNueveSentidosSeedCollected(false);
      setNueveSentidosEpilogueReady(false);
    } else if (targetScene === "jaguar") {
      setJaguarStatsSnapshot(null);
    }
  }

  function jumpToDevScene() {
    if (!isDevelopment || portalTransit || arrivalPortal) return;
    stopGameAudio();
    resetSceneAttempt(devSelectedScene);
    setScene(devSelectedScene);
    setStoryBeat(null);
    setStorySeedBookOpened(false);
    setStorySeedPreview(null);
    setSeedBookOpen(false);
    setJourneyMenuOpen(false);
    setJourneyRestartConfirm(false);
    setNotice("");
    setPortalTransit(false);
    setArrivalPortal(false);
    setRoomView("scene");
    setRoomAction(null);
    setRuinsView("scene");
    setRuinsAction(null);
    setLemonWhistling(false);
    setDawnIsMoving(false);
    setIsMoving(false);
    setSceneReplayNonce(version => version + 1);
  }

  const discoveredSongIds = useMemo(() => {
    const found = new Set<SeedSongId>(persistedSeedIds);
    if (portalOpen) found.add("intro");
    if (seedCollected) found.add("ventana");
    if (rootsSeedCollected) found.add("raices");
    if (campfireSeedCollected) found.add("rambla");
    if (riverSeedCollected) found.add("espiritus-del-rio");
    if (elRioSeedCollected) found.add("el-rio");
    if (fireSeedCollected) found.add("el-fuego");
    if (ponzonaSeedCollected) found.add("ponzona");
    if (nueveSentidosSeedCollected) found.add("nueve-sentidos");
    if (jaguarSeedCollected) found.add("el-jaguar");
    return SONG_CATALOG.filter(song => found.has(song.id)).map(song => song.id);
  }, [persistedSeedIds, portalOpen, seedCollected, rootsSeedCollected, campfireSeedCollected, riverSeedCollected, elRioSeedCollected, fireSeedCollected, ponzonaSeedCollected, nueveSentidosSeedCollected, jaguarSeedCollected]);

  const nextLockedSongId = SONG_CATALOG.find(song => !discoveredSongIds.includes(song.id))?.id ?? null;
  const rewriteUnlocked = discoveredSongIds.includes("el-jaguar");
  const rewriteSummaries: Partial<Record<RewriteChapterId, string>> = {
    dawn: dawnOutcome === "A" ? "Último recuerdo: Limón silbó." : dawnOutcome === "B" ? "Último recuerdo: escuchó silbar a los pájaros." : undefined,
    rambla: ramblaHistoryOutcome === 1 ? "Último recuerdo: la ruta pacífica." : ramblaHistoryOutcome === 2 ? "Último recuerdo: la ruta drástica." : undefined,
    river: riverConversationOutcome
      ? `Último recuerdo: ruta ${riverConversationOutcome.route === "pacifico" ? "pacífica" : "drástica"}, respuesta ${riverConversationOutcome.choiceIndex + 1}.`
      : ramblaHistoryOutcome !== null ? "Pendiente: elige una respuesta para la ruta actual de Rambla." : undefined,
    "river-challenge": riverChallengeOutcome === "current" ? "Último recuerdo: siguió la corriente." : riverChallengeOutcome === "shore" ? "Último recuerdo: eligió la orilla." : undefined,
    hummingbird: hummingbirdOutcome === "good" ? "Último recuerdo: el colibrí se hizo amigo." : hummingbirdOutcome === "bad" ? "Último recuerdo: el colibrí se marchó." : hummingbirdOutcome === "neutral" ? "Último recuerdo: el colibrí quedó en duda." : undefined,
    jaguar: archivedJaguarEndings.length > 0 ? `${archivedJaguarEndings.length} final${archivedJaguarEndings.length === 1 ? "" : "es"} guardado${archivedJaguarEndings.length === 1 ? "" : "s"}.` : "El encuentro empieza con las estadísticas actuales.",
  };

  useEffect(() => {
    const merged = mergeDiscoveredSeedIds(SONG_CATALOG.map(song => song.id), persistedSeedIds, discoveredSongIds);
    saveSeedBookIds(merged);
    setPersistedSeedIds(current => current.length === merged.length && current.every((id, index) => id === merged[index]) ? current : merged);
  }, [discoveredSongIds, persistedSeedIds]);

  const hummingbirdFriendForCurrentRun = devFriendPreview === "saved" ? hummingbirdIsFriend : devFriendPreview === "friend";
  const canContinue = !storyBeat && !seedBookOpen && !portalTransit && !arrivalPortal && (
    (scene === "room" && roomView === "scene" && portalOpen)
    || (scene === "dawn" && seedCollected)
    || (scene === "ruins" && ruinsView === "scene" && rootsSeedCollected)
    || (scene === "gathering" && campfireSeedCollected)
    || (scene === "river" && riverConversationComplete && riverSeedCollected)
    || (scene === "river-challenge" && riverChallengeComplete)
    || (scene === "el-rio" && elRioSeedCollected && elRioBlackAnsweredWhite)
    || (scene === "fire-forest" && fireSeedCollected)
    || (scene === "hummingbird" && ponzonaSeedCollected)
    || (scene === "nueve-sentidos" && nueveSentidosSeedCollected && nueveSentidosEpilogueReady)
  );
  const currentDialogue = DIALOGUE[Math.min(dialogueTurn, DIALOGUE.length - 1)];
  const showOverlay = !portalTransit && !arrivalPortal && (scene === "room"
    ? roomView === "scene" && Boolean(roomAction)
    : scene === "dawn"
      ? !dawnOutcomeAnimationRunning && !seedCollected && (dialogueStarted || branch !== null || sunRisen || seedAvailable)
      : scene === "ruins"
        ? ruinsView === "scene" && (Boolean(ruinsAction) || (ruinsFlowerStage === "seed" && !rootsSeedCollected))
        : false);

  function advanceStory() {
    if (!storyBeat) return;
    if (storyBeat === "opening") {
      setStoryBeat(null);
      return;
    }
    const nextScene: Scene = storyBeat === "portal"
      ? "dawn"
      : storyBeat === "ruins"
        ? "ruins"
        : storyBeat === "sect"
          ? "gathering"
          : storyBeat === "river-arrival"
            ? "river"
            : storyBeat === "spirits-challenge"
              ? "river-challenge"
                : storyBeat === "el-rio"
                  ? "el-rio"
                  : storyBeat === "ponzona"
                    ? "hummingbird"
              : storyBeat === "ponzona-friend" || storyBeat === "ponzona-doubt" || storyBeat === "ponzona-leaves"
                ? "nueve-sentidos"
                      : storyBeat === "nueve-sentidos-cave"
                        ? "jaguar"
                        : "fire-forest";
    if (nextScene === "jaguar") setJaguarStatsSnapshot(null);
    resetSceneAttempt(nextScene);
    setScene(nextScene);
    setSceneReplayNonce(version => version + 1);
    if (storyBeat === "ponzona-friend") {
      setNotice("El cielo de Nueve sentidos se abre sobre el limón y su amigo.");
    } else if (storyBeat === "ponzona-doubt" || storyBeat === "ponzona-leaves") {
      setNotice("El cielo de Nueve sentidos se abre sobre el limón.");
    }
    setStoryBeat(null);
    setRoomView("scene");
    setRoomAction(null);
    setRuinsAction(null);
    setRuinsView("scene");
  }

  function showStory(beat: StoryBeat) {
    setJourneyMenuOpen(false);
    setStorySeedBookOpened(false);
    setStorySeedPreview(null);
    setStoryBeat(beat);
  }

  function openStorySeedBook(seed: PhysicalSeedId | undefined) {
    setStorySeedBookOpened(true);
    setStorySeedPreview(seed ?? null);
    setSeedBookOpen(true);
  }

  function continueAlongPath() {
    if (!canContinue) return;
    if (scene === "room") {
      enterDawn();
    } else if (scene === "dawn") {
      showStory("ruins");
    } else if (scene === "ruins") {
      showStory("sect");
    } else if (scene === "gathering") {
      showStory("river-arrival");
    } else if (scene === "river") {
      showStory("spirits-challenge");
    } else if (scene === "river-challenge") {
      showStory("el-rio");
    } else if (scene === "el-rio") {
      showStory("fire-forest");
    } else if (scene === "fire-forest") {
      showStory("ponzona");
    } else if (scene === "hummingbird") {
      showStory(hummingbirdOutcome === "good" ? "ponzona-friend" : hummingbirdOutcome === "bad" ? "ponzona-leaves" : "ponzona-doubt");
    } else if (scene === "nueve-sentidos" && nueveSentidosSeedCollected && nueveSentidosEpilogueReady) {
      setNueveSentidosEpilogueReady(false);
      showStory("nueve-sentidos-cave");
    }
  }

  return (
    <main className={`explorer-shell${openJaguarPreview || openRiverChallengePreview ? " explorer-shell-test-preview" : ""}`}>
      <header className="topbar">
        <a className="brand-lockup" href="#inicio" aria-label="Limonero Fuzz, inicio">
          <img src={gameAssetUrl("/limonero-mark.svg")} alt="" className="brand-icon" />
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
          <h1>Once pantallas.<br /><em>Un camino de vuelta.</em></h1>
          <p>Del primer acorde en el local vacío al encuentro con el dios del conocimiento, cada mundo abre otra pregunta en el camino de vuelta.</p>
        </div>
        <div className="intro-stamp" aria-label="Once pantallas en exploración">
          <span className="stamp-big">11</span><span>PANTALLAS<br />EN EXPLORACIÓN</span>
        </div>
      </section>

      <nav className="screen-nav" aria-label="Seleccionar pantalla">
        <button className={`screen-tab ${scene === "room" ? "active" : ""}`} onClick={() => setVisitedScene("room")} disabled={!canVisitScene("room")}>
          <span className="tab-number">01</span><span><strong>El local de ensayo</strong><small>Aurora · antes del portal</small></span><span className="tab-mark">{portalOpen ? "✓" : "•"}</span>
        </button>
        <button className={`screen-tab ${scene === "dawn" ? "active" : ""}`} onClick={() => setVisitedScene("dawn")} disabled={!canVisitScene("dawn")}>
          <span className="tab-number">02</span><span><strong>El Cuchillo al amanecer</strong><small>Ventana al sendero</small></span><span className="tab-mark">{discoveredSongIds.includes("ventana") ? "✓" : discoveredSongIds.includes("intro") ? "↗" : "⌑"}</span>
        </button>
        <button className={`screen-tab ${scene === "ruins" ? "active" : ""}`} onClick={() => setVisitedScene("ruins")} disabled={!canVisitScene("ruins")}>
          <span className="tab-number">03</span><span><strong>Ruinas invadidas</strong><small>Raíces · las dos columnas</small></span><span className="tab-mark">{discoveredSongIds.includes("raices") ? "✓" : discoveredSongIds.includes("ventana") ? "↗" : "⌑"}</span>
        </button>
        <button className={`screen-tab ${scene === "gathering" ? "active" : ""}`} onClick={() => setVisitedScene("gathering")} disabled={!canVisitScene("gathering")}>
          <span className="tab-number">04</span><span><strong>Encuentro bajo la luna</strong><small>Rambla · la hoguera</small></span><span className="tab-mark">{discoveredSongIds.includes("rambla") ? "✓" : discoveredSongIds.includes("raices") ? "↗" : "⌑"}</span>
        </button>
        <button className={`screen-tab ${scene === "river" ? "active" : ""}`} onClick={() => setVisitedScene("river")} disabled={!canVisitScene("river")}>
          <span className="tab-number">05</span><span><strong>La Orilla del Río Espejo</strong><small>Los espíritus del río</small></span><span className="tab-mark">{discoveredSongIds.includes("rambla") ? "↗" : "⌑"}</span>
        </button>
        <button className={`screen-tab ${scene === "river-challenge" ? "active" : ""}`} onClick={() => setVisitedScene("river-challenge")} disabled={!canVisitScene("river-challenge")}>
          <span className="tab-number">06</span><span><strong>El reto del río</strong><small>Los Espíritus del Río</small></span><span className="tab-mark">{discoveredSongIds.includes("espiritus-del-rio") ? "↗" : "⌑"}</span>
        </button>
        <button className={`screen-tab ${scene === "el-rio" ? "active" : ""}`} onClick={() => setVisitedScene("el-rio")} disabled={!canVisitScene("el-rio")}>
          <span className="tab-number">07</span><span><strong>El Río</strong><small>El fondo del cauce</small></span><span className="tab-mark">{isSceneUnlocked("el-rio", { currentScene: scene, discoveredSeedIds: discoveredSongIds, riverChallengeComplete, riverChallengeOutcome }) ? "↗" : "⌑"}</span>
        </button>
        <button className={`screen-tab ${scene === "fire-forest" ? "active" : ""}`} onClick={() => setVisitedScene("fire-forest")} disabled={!canVisitScene("fire-forest")}>
          <span className="tab-number">08</span><span><strong>El bosque ardiendo</strong><small>El fuego · después de la lluvia</small></span><span className="tab-mark">{discoveredSongIds.includes("el-fuego") ? "✓" : discoveredSongIds.includes("el-rio") ? "↗" : "⌑"}</span>
        </button>
        <button className={`screen-tab ${scene === "hummingbird" ? "active" : ""}`} onClick={() => setVisitedScene("hummingbird")} disabled={!canVisitScene("hummingbird")}>
          <span className="tab-number">09</span><span><strong>El colibrí</strong><small>Ponzoña · la rama quemada</small></span><span className="tab-mark">{discoveredSongIds.includes("ponzona") ? "✓" : discoveredSongIds.includes("el-fuego") ? "↗" : "⌑"}</span>
        </button>
        <button className={`screen-tab ${scene === "nueve-sentidos" ? "active" : ""}`} onClick={() => setVisitedScene("nueve-sentidos")} disabled={!canVisitScene("nueve-sentidos")}>
          <span className="tab-number">10</span><span><strong>Nueve sentidos</strong><small>Canción 09 · cielo nocturno</small></span><span className="tab-mark">{discoveredSongIds.includes("nueve-sentidos") ? "✓" : discoveredSongIds.includes("ponzona") ? "↗" : "⌑"}</span>
        </button>
        <button className={`screen-tab ${scene === "jaguar" ? "active" : ""}`} onClick={() => setVisitedScene("jaguar")} disabled={!canVisitScene("jaguar")}>
          <span className="tab-number">11</span><span><strong>El Jaguar</strong><small>La última semilla · el sueño</small></span><span className="tab-mark">{discoveredSongIds.includes("el-jaguar") ? "✓" : discoveredSongIds.includes("nueve-sentidos") ? "↗" : "⌑"}</span>
        </button>
      </nav>

      {isDevelopment && <DevPlaytestTools
        scenes={(Object.keys(SCENE_PRESENTATION) as Scene[]).map(id => ({ id, ...SCENE_PRESENTATION[id] }))}
        selectedScene={devSelectedScene}
        onSceneChange={id => setDevSelectedScene(id as Scene)}
        onJump={jumpToDevScene}
        jumpDisabled={portalTransit || arrivalPortal}
        friendPreview={devFriendPreview}
        onFriendPreviewChange={setDevFriendPreview}
      />}
      <section className={`workspace${isDevelopment ? " workspace-with-dev-tools" : ""}${!storyBeat ? " workspace-with-stats-hud" : ""}`}>
        <div className="stage-column">
          <div className="stage-heading">
            <div>
              <span className="stage-kicker">PANTALLA {SCENE_PRESENTATION[scene].number}</span>
              <h2>{SCENE_PRESENTATION[scene].title}</h2>
            </div>
            {SCENE_PRESENTATION[scene].location && <span className="stage-location">{SCENE_PRESENTATION[scene].location}</span>}
          </div>

          <div className={`game-stage-layout${scene === "jaguar" ? " game-stage-layout-jaguar" : ""}`}>
          {!previewChromeHidden && !storyBeat && <div className={`game-hud-toolbar${scene === "jaguar" ? " game-hud-toolbar-jaguar" : ""}`}>
            <div ref={journeyMenuRef} className={`journey-menu-anchor${seedBookOpen ? " journey-menu-anchor-book" : ""}`}>
              <button
                className="seedbook-toggle"
                type="button"
                onClick={() => { setSeedBookOpen(open => !open); setJourneyMenuOpen(false); }}
                aria-label={`${seedBookOpen ? "Cerrar" : "Abrir"} Libro de semillas. ${discoveredSongIds.length} de 10 semillas descubiertas.`}
                aria-haspopup="dialog"
                aria-expanded={seedBookOpen}
                aria-controls="seedbook-panel"
              >
                <img className="seedbook-toggle-icon" src={gameAssetUrl("/seedbook-art.png")} alt="" aria-hidden="true" />
                <b aria-hidden="true">{discoveredSongIds.length}/10</b>
              </button>
              <button
                className={`journey-menu-toggle${journeyMenuOpen ? " journey-menu-toggle-open" : ""}`}
                type="button"
                onClick={() => { setJourneyMenuOpen(open => !open); setSeedBookOpen(false); }}
                aria-label={`${journeyMenuOpen ? "Cerrar" : "Abrir"} menú del viaje`}
                aria-haspopup="menu"
                aria-expanded={journeyMenuOpen}
                aria-controls="journey-menu-panel"
              >
                <span aria-hidden="true">☷</span>
              </button>
              {journeyMenuOpen && <aside id="journey-menu-panel" className="journey-menu-panel" role="menu" aria-label="Menú del viaje">
                <div className="journey-menu-heading">MÁS OPCIONES</div>
                {journeyRestartConfirm ? (
                  <div className="journey-restart-confirmation" role="group" aria-label="Confirmar reinicio del juego">
                    <p>Se borrarán las semillas guardadas y el viaje volverá al inicio.</p>
                    <div className="journey-menu-actions">
                      <button type="button" role="menuitem" onClick={() => setJourneyRestartConfirm(false)}>cancelar</button>
                      <button type="button" role="menuitem" className="journey-danger" onClick={restartGame}>sí, reiniciar</button>
                    </div>
                  </div>
                ) : (
                  <button type="button" role="menuitem" className="journey-restart-button" onClick={() => setJourneyRestartConfirm(true)}>↻ reiniciar juego</button>
                )}
                <div className="journey-menu-divider" />
                {BAND_INSTAGRAM_LINKS.map(link => link.url ? (
                  <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" role="menuitem">◎ {link.label}</a>
                ) : (
                  <button key={link.label} type="button" role="menuitem" disabled>◎ {link.label} · pendiente</button>
                ))}
              </aside>}
            </div>
          </div>}

          <div className={`playfield ${scene === "room" ? "playfield-room" : "playfield-portrait"}${scene === "jaguar" ? " playfield-jaguar" : ""}${scene === "jaguar" && previewTestMode ? " playfield-jaguar-test" : ""}`}>
            {storyBeat && <StoryInterlude seed={STORY_SEEDS[storyBeat]} seedBookOpened={storySeedBookOpened} text={storyText(storyBeat, ramblaHistoryOutcome)} continueLabel={storyBeat === "opening" ? "comenzar el sendero" : undefined} onOpenSeedBook={openStorySeedBook} onContinue={advanceStory} />}
            {!previewChromeHidden && seedBookOpen && <SeedBook
              discoveredSongIds={discoveredSongIds}
              previewSongId={nextLockedSongId}
              focusSongId={storySeedPreview ?? nextLockedSongId}
              rewriteUnlocked={rewriteUnlocked}
              rewriteSummaries={rewriteSummaries}
              archivedEndingIds={archivedJaguarEndings}
              onClose={() => setSeedBookOpen(false)}
              onRewriteChapter={rewriteChapter}
            />}
            {!storyBeat && <JaguarStatsHud stats={jaguarHudStats} className="jaguar-global-stats" />}
          {scene === "room" ? (
            <div className={`scene-stage game-screen room-stage ${ampOn ? "amp-is-on" : ""} ${portalOpen ? "room-portal-open" : ""} ${portalTransit ? "room-portal-spinning" : ""}`}>
              {roomView === "scene" && <div className={`room-world${portalOpen ? " room-world-portal-open" : ""}`}>
                {portalTransit && <div className="portal-spin" aria-hidden="true" />}
                <div className="cable-art-layer" aria-hidden="true"><CableSceneArt pluggedGuitar={pluggedGuitar} pluggedAmp={pluggedAmp} /></div>
                <div className="room-object-art guitar-art" aria-hidden="true"><img className="guitar-sprite" src={gameAssetUrl("/guitar-sprite-recut-v2.png")} alt="" /></div>
                <div className="room-object-art amp-art" aria-hidden="true"><img className="amp-sprite amp-art-sprite" src={gameAssetUrl("/amp-sprite-light.png")} alt="" /></div>
                <div className={`lemon-actor ${lemonPosition} ${isMoving ? "walking" : ""} ${portalTransit ? "lemon-portal-leap" : ""}`}><LemonSprite /></div>
                <button type="button" className="hotspot cable-hotspot" aria-label="Examinar cable y conectores" onClick={() => handleRoomHotspot("cable")} disabled={isMoving || portalOpen}>
                  <span className="sr-only">Cable en el suelo</span>
                </button>
                <button type="button" className="hotspot guitar-hotspot" aria-label="Guitarra eléctrica roja" onClick={() => handleRoomHotspot("guitar")} disabled={isMoving || portalOpen}>
                  <span className="sr-only">Guitarra eléctrica roja</span>
                </button>
                <button type="button" className="hotspot amp-hotspot" aria-label="Amplificador" onClick={() => handleRoomHotspot("amp")} disabled={isMoving || !pluggedGuitar || !pluggedAmp || portalOpen}>
                  <span className="sr-only">Amplificador</span>
                </button>
              </div>}
              {roomView === "amp" && <AmpCloseup powered={ampOn} onPower={toggleAmplifier} onContinue={continueAfterAmplifier} />}
              {roomView === "cable" && <CableCloseup pluggedGuitar={pluggedGuitar} pluggedAmp={pluggedAmp} onConnect={connectCableEnd} onClose={() => setRoomView("scene")} />}
              {roomView === "guitar" && <GuitarCloseup selectedPositions={selectedFrets.map(note => note.key)} onSelectNote={toggleFret} onClose={() => setRoomView("scene")} />}
            </div>
          ) : scene === "dawn" ? (
            <div className={`scene-stage game-screen dawn-stage ${sunRisen ? "dawn-stage-sunrise" : ""}`} onClick={handleDawnStageClick}>
              {arrivalPortal && <div className="arrival-portal" aria-hidden="true" />}
              <div className="dawn-veil" aria-hidden="true" />
              {sunRisen && <div className="sunrise-glow" aria-hidden="true" />}
              <div className={`bird-flock ${birdsPassed ? "birds-visible" : ""}`} aria-label={birdsPassed ? "Bandada de pájaros silbando" : undefined}><span>◆</span><span>◆</span><span>◆</span><span>♪</span></div>
              <button type="button" className={`dawn-lemon-actor ${dawnIsMoving ? "walking" : ""} ${arrivalPortal ? "portal-exit-leap" : ""} ${lemonWhistling ? "lemon-whistling" : ""}`} style={dawnLemonPoint ? { left: `${dawnLemonPoint.x}%`, bottom: `${dawnLemonPoint.bottom}%` } : undefined} onClick={startDialogue} aria-label="Hablar con el limón" disabled={dialogueStarted || seedCollected || arrivalPortal}><LemonSprite />{lemonWhistling && <span className="lemon-whistle-note" aria-hidden="true">♪</span>}</button>
              <FlowerSprite open={flowerOpen} />
              <button type="button" className={`seed-spark ${seedAvailable ? "seed-spark-visible" : ""} ${seedCollected ? "seed-spark-collected" : ""}`} onClick={collectSeed} disabled={!seedAvailable || seedCollected} aria-label="Recoger la semilla dorada de Ventana al sendero">
                <SeedGlyph seed="ventana" />
              </button>
              <span className="stage-coordinate">LF · 02</span>
            </div>
          ) : scene === "ruins" ? (
            <RuinsScene
              key={`ruins-${sceneReplayNonce}`}
              leftRevealed={leftColumnRevealed}
              rightRevealed={rightColumnRevealed}
              flowerStage={ruinsFlowerStage}
              seedCollected={rootsSeedCollected}
              puzzleOpen={ruinsView !== "scene"}
              onApproachColumn={setRuinsAction}
              onCollectSeed={collectRootsSeed}
            />
          ) : scene === "gathering" ? (
            <CampfireScene
              key={`rambla-${sceneReplayNonce}`}
              conversationStep={ramblaConversationStep}
              conversationOutcome={ramblaOutcome}
              skillFailures={ramblaSkillFailures}
              escapeSucceeded={ramblaEscapeSucceeded}
              placedStickIds={campfirePlacedStickIds}
              selectedStickId={selectedStickId}
              fireStage={campfireFireStage}
              seedCollected={campfireSeedCollected}
              onPickStick={pickCampfireStick}
              onPlaceStick={placeCampfireStick}
              onIgnite={igniteCampfire}
              onCollectSeed={collectCampfireSeed}
              onChooseConversation={chooseRamblaResponse}
              onSkillAttempt={attemptRamblaEscape}
              onRetrySkill={retryRamblaEscape}
            />
          ) : (
            scene === "river" ? (
              <RiverMirrorScene key={`river-${sceneReplayNonce}-${ramblaHistoryOutcome ?? "pacifico"}`} route={ramblaHistoryOutcome === 2 ? "drastico" : "pacifico"} seedCollected={riverSeedCollected} onCollectSeed={collectRiverSeed} onConversationComplete={() => setRiverConversationComplete(true)} onChoiceSelected={recordRiverConversationChoice} />
            ) : scene === "river-challenge" ? (
              <RiverChallengeScene key={`river-challenge-${sceneReplayNonce}`} onComplete={outcome => { setRiverChallengeOutcome(outcome); saveRiverChallengeOutcome(outcome); setRiverChallengeComplete(true); }} onPreviewContinue={openRiverChallengePreview ? () => { resetSceneAttempt("jaguar"); setSceneReplayNonce(version => version + 1); setScene("jaguar"); } : undefined} />
            ) : scene === "el-rio" ? (
              <ElRioScene key={`el-rio-${sceneReplayNonce}`} seedCollected={elRioSeedCollected} onCollectSeed={collectElRioSeed} onBlackReplyToWhite={() => setElRioBlackAnsweredWhite(true)} />
            ) : scene === "fire-forest" ? (
              <FireForestScene key={`fire-forest-${sceneReplayNonce}`} seedCollected={fireSeedCollected} onCollectSeed={collectFireSeed} />
            ) : scene === "hummingbird" ? (
              <HummingbirdScene key={`hummingbird-${sceneReplayNonce}`} seedCollected={ponzonaSeedCollected} onCollectSeed={collectPonzonaSeed} onOutcome={recordHummingbirdOutcome} />
            ) : scene === "nueve-sentidos" ? (
              <NueveSentidosScene key={`nueve-sentidos-${sceneReplayNonce}`} seedCollected={nueveSentidosSeedCollected} onCollectSeed={collectNueveSentidosSeed} onComplete={completeNueveSentidosScene} hummingbirdIsFriend={hummingbirdFriendForCurrentRun} />
            ) : (
              <JaguarScene
                key={`jaguar-${sceneReplayNonce}`}
                seedCollected={jaguarSeedCollected}
                stats={jaguarHudStats}
                onCollectSeed={collectJaguarSeed}
                onEndingDiscovered={recordJaguarEnding}
                onReturnHome={returnHomeFromJaguar}
                onStatsChange={reportJaguarStats}
                dawnOutcome={dawnOutcome}
                ramblaOutcome={ramblaHistoryOutcome}
                hummingbirdOutcome={hummingbirdOutcome}
                riverConversationOutcome={riverConversationOutcome}
                riverChallengeOutcome={riverChallengeOutcome}
                testMode={previewTestMode}
              />
            )
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
              {roomAction && <div key={roomAction} className="dialogue-card action-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>{roomActionLabel(roomAction)}</p></div><button className="action-button" onClick={performRoomAction}>{roomAction === "guitar-unplugged" || roomAction === "amp-off" ? "Siguiente" : roomAction === "examine-cable" || roomAction === "examine" ? "Examinar" : "Tocar la guitarra"} <span aria-hidden="true">→</span></button></div>}
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
              {seedAvailable && !seedCollected && <div className="context-card seed-card seed-instruction-card" role="status"><div className="thought-bubble"><span>EL LIMÓN</span><p>{branch === "B" ? "La flor se abre. Pulsa su semilla dorada para guardarla." : "La flor se abre y me entrega una semilla. Pulsa la semilla para recogerla."}</p></div></div>}
            </> : scene === "ruins" ? <>
              {ruinsAction && <div key={`column-${ruinsAction}`} className="dialogue-card action-card"><div className="thought-bubble"><span>EL LIMÓN</span><p>{ruinsAction === "left" ? "Unas hojas secas se aferran a esta columna." : "Las hojas se enredan entre las raíces de piedra."}</p></div><button className="action-button" onClick={openRuinsPuzzle}>Examinar</button></div>}
              {ruinsFlowerStage === "seed" && !rootsSeedCollected && <div className="context-card seed-card seed-instruction-card" role="status"><div className="thought-bubble"><span>EL LIMÓN</span><p>La planta ha florecido. Pulsa la semilla verde que brilla entre las raíces.</p></div></div>}
            </> : null}
          </aside>}
          {canContinue && <button
            className={`continue-path-button ${scene === "room" ? "continue-path-portal" : "continue-path-compact"}`}
            type="button"
            onClick={continueAlongPath}
            aria-label={scene === "room" ? "Atravesar la ventana y continuar al amanecer" : "Continuar el sendero a la siguiente pantalla"}
          >
            <span>{scene === "room" ? "atravesar la ventana" : "continuar el sendero"}</span>
            <svg viewBox="0 0 18 16" aria-hidden="true" shapeRendering="crispEdges"><path d="M1 6h8V2h2v2h2v2h3v4h-3v2h-2v2H9v-4H1z" fill="currentColor" /></svg>
          </button>}
          </div>
          </div>
          <span className="sr-only" aria-live="polite" aria-atomic="true">{notice}</span>
        </div>
      </section>

      <section className="storyboard-section" id="storyboard">
        <div className="storyboard-heading"><div><span className="stage-kicker">DOCUMENTO DE PREPRODUCCIÓN</span><h2>El storyboard original</h2></div><span>REFERENCIA VISUAL · PANTALLAS 01–04</span></div>
        <figure className="storyboard-frame"><img src={gameAssetUrl("/storyboard-pantallas-01-02.png")} alt="Storyboard conceptual: el local de ensayo vacío y el limón ante El Cuchillo de Albatera al amanecer." /><figcaption><span>01 · Local de ensayo</span><span>02 · El Cuchillo al amanecer</span></figcaption></figure>
        <figure className="storyboard-frame storyboard-frame-roots"><img src={gameAssetUrl("/ruins-background.png")} alt="Fondo de las ruinas invadidas por raíces, basado en el panel 03 del storyboard v02." /><figcaption><span>03 · Ruinas y arco de piedra</span><span>Fondo adaptado del panel 03 · storyboard v02</span></figcaption></figure>
        <figure className="storyboard-frame storyboard-frame-campfire"><img src={gameAssetUrl("/scene-04-background.png")} alt="Fondo pixel art del encuentro nocturno: una reunión junto a un símbolo luminoso en un valle rocoso; el limón se mueve como actor separado." /><figcaption><span>04 · Encuentro bajo la luna</span><span>La reunión, la hoguera y la semilla de «Rambla»</span></figcaption></figure>
      </section>

      <footer className="site-footer"><div className="footer-mark">LF<span>✳</span></div><p>Un guion se vuelve paisaje, un clic cada vez.</p><span>PREPRODUCCIÓN · VERSIÓN 0.5</span></footer>
    </main>
  );
}

function roomActionLabel(action: Exclude<RoomAction, null>) {
  const labels: Record<Exclude<RoomAction, null>, string> = {
    "examine-cable": "Siempre tengo los cables por el suelo... ¿Alguien me echa un cable?",
    examine: "Tengo que enchufar esto... quizá el amplificador despierte.",
    play: "hay acordes que abren ventanas...",
    "guitar-unplugged": "La guitarra no está enchufada. Tengo que conectar el cable antes de tocar.",
    "amp-off": "La guitarra ya está conectada, pero el amplificador sigue apagado. Primero tengo que encenderlo.",
  };
  return labels[action];
}
