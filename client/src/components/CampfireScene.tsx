import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { LemonSprite } from "./GameSprites";
import { CampfireFlame } from "./CampfireFlame";
import { SeedGlyph } from "./SeedGlyph";
import { RamblaAttackWarning, RamblaConversation, RamblaSkillCheck } from "./RamblaConversation";
import type { RamblaChoice, RamblaOutcome } from "./ramblaConversationRules";
import { CAMPFIRE_CENTER, CAMPFIRE_DROP_POINT, CAMPFIRE_STICK_COUNT, isLemonNearCampfireCenter, type CampfirePoint } from "./campfireMovementRules";
import "./campfire-scene.css";

export type CampfireFireStage = "unlit" | "lighting" | "seed";

const WALK_DURATION_MS = 1300;
const RESPONSE_GESTURE_DURATION_MS = 1000;

type StickSpot = {
  id: number;
  left: number;
  top: number;
  rotation: number;
};

type WalkPoint = CampfirePoint;
type PathBound = { y: number; left: number; right: number };

const STICK_SPOTS: StickSpot[] = [
  { id: 1, left: 17, top: 78, rotation: -28 },
  { id: 2, left: 83, top: 79, rotation: 23 },
  { id: 3, left: 44, top: 86, rotation: 38 },
];

const WALKABLE_PATH: readonly PathBound[] = [
  { y: 64, left: 44, right: 56 },
  { y: 74, left: 18, right: 82 },
  { y: 80, left: 12, right: 88 },
  { y: 88, left: 7, right: 93 },
  { y: 97, left: 5, right: 95 },
];

type CampfireSceneProps = {
  conversationStep: number;
  conversationOutcome: RamblaOutcome | null;
  skillFailures: number;
  escapeSucceeded: boolean;
  placedStickIds: number[];
  selectedStickId: number | null;
  fireStage: CampfireFireStage;
  seedCollected: boolean;
  onPickStick: (stickId: number, lemonPoint: CampfirePoint, stickPoint: CampfirePoint, isWalking: boolean) => void;
  onPlaceStick: (lemonPoint: CampfirePoint, isWalking: boolean) => void;
  onIgnite: () => void;
  onCollectSeed: () => void;
  onChooseConversation: (choice: RamblaChoice) => void;
  onSkillAttempt: (success: boolean) => void;
  onRetrySkill: () => void;
};

function pathBoundsAt(y: number) {
  if (y < WALKABLE_PATH[0].y || y > WALKABLE_PATH[WALKABLE_PATH.length - 1].y) return null;
  for (let index = 1; index < WALKABLE_PATH.length; index += 1) {
    const right = WALKABLE_PATH[index];
    const left = WALKABLE_PATH[index - 1];
    if (y <= right.y) {
      const amount = (y - left.y) / (right.y - left.y);
      return {
        left: left.left + (right.left - left.left) * amount,
        right: left.right + (right.right - left.right) * amount,
      };
    }
  }
  return null;
}

function isOnWalkablePath(point: WalkPoint) {
  const bounds = pathBoundsAt(point.y);
  return bounds !== null && point.x >= bounds.left + 1 && point.x <= bounds.right - 1;
}

function pathSegmentIsWalkable(from: WalkPoint, to: WalkPoint) {
  return Array.from({ length: 13 }, (_, index) => index / 12).every(amount =>
    isOnWalkablePath({
      x: from.x + (to.x - from.x) * amount,
      y: from.y + (to.y - from.y) * amount,
    }),
  );
}

function motionDuration(duration: number) {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
}

export function CampfireScene({
  conversationStep,
  conversationOutcome,
  skillFailures,
  escapeSucceeded,
  placedStickIds,
  selectedStickId,
  fireStage,
  seedCollected,
  onPickStick,
  onPlaceStick,
  onIgnite,
  onCollectSeed,
  onChooseConversation,
  onSkillAttempt,
  onRetrySkill,
}: CampfireSceneProps) {
  const worldRef = useRef<HTMLDivElement>(null);
  const walkTimer = useRef<number | null>(null);
  const responseTimer = useRef<number | null>(null);
  const responseLocked = useRef(false);
  const [lemonPoint, setLemonPoint] = useState<WalkPoint>({ x: 22, y: 86 });
  const [walking, setWalking] = useState(false);
  const [skillCheckStarted, setSkillCheckStarted] = useState(false);
  const [warningReady, setWarningReady] = useState(false);
  const [responseGesture, setResponseGesture] = useState<RamblaChoice["gesture"] | null>(null);
  const allSticksPlaced = placedStickIds.length >= CAMPFIRE_STICK_COUNT;
  const sticksUnlocked = conversationOutcome === 1;
  const escapeSeedAvailable = conversationOutcome === 2 && escapeSucceeded;
  const seedAvailable = (sticksUnlocked && fireStage === "seed") || escapeSeedAvailable;
  const nearCampfireCenter = isLemonNearCampfireCenter(lemonPoint);
  const conversationApproachRequired = conversationOutcome === null && !seedCollected;
  const conversationReady = conversationApproachRequired && nearCampfireCenter && !walking;
  const skillCheckActive = conversationOutcome === 2 && !escapeSucceeded;
  const showCampfireStatus = !seedCollected && (sticksUnlocked || escapeSeedAvailable || fireStage !== "unlit");
  const status = escapeSeedAvailable
      ? "Una luz turquesa espera donde termina la caída."
    : fireStage === "lighting"
      ? "La llama aprende a respirar."
    : fireStage === "seed"
      ? "Una semilla turquesa late entre las brasas."
    : selectedStickId !== null
      ? "Un fragmento del bosque viaja con el limón."
    : sticksUnlocked
        ? walking
          ? "La noche sigue los pasos del limón."
          : allSticksPlaced
            ? "Tres ramas duermen en el círculo de piedra."
            : "La brasa sueña con el bosque."
      : "Rambla";
  const statusDetail = escapeSeedAvailable
      ? "La brisa trae un destello desde el sendero oscuro."
      : fireStage === "lighting"
        ? "Las sombras retroceden al calor recién nacido."
    : fireStage === "seed"
      ? "La canción aguarda en el resplandor turquesa."
    : selectedStickId !== null
      ? walking
        ? "La senda se curva hacia el calor."
        : "La madera conserva el perfume de la lluvia."
      : sticksUnlocked
        ? allSticksPlaced
          ? "Una chispa puede cambiar el curso de la noche."
          : "La luna guarda tres recuerdos de madera."
        : "";

  useEffect(() => () => {
    if (walkTimer.current !== null) window.clearTimeout(walkTimer.current);
    if (responseTimer.current !== null) window.clearTimeout(responseTimer.current);
  }, []);

  function chooseConversation(choice: RamblaChoice) {
    if (responseLocked.current) return;
    if (!choice.gesture) {
      onChooseConversation(choice);
      return;
    }
    responseLocked.current = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) setResponseGesture(choice.gesture);
    responseTimer.current = window.setTimeout(() => {
      setResponseGesture(null);
      responseLocked.current = false;
      responseTimer.current = null;
      onChooseConversation(choice);
    }, reducedMotion ? 0 : RESPONSE_GESTURE_DURATION_MS);
  }

  useEffect(() => {
    if (conversationOutcome !== 2 || escapeSucceeded) {
      setSkillCheckStarted(false);
      setWarningReady(false);
      return;
    }
    setSkillCheckStarted(false);
    setWarningReady(false);
    const warningTimer = window.setTimeout(() => setWarningReady(true), motionDuration(2400));
    return () => window.clearTimeout(warningTimer);
  }, [conversationOutcome, escapeSucceeded]);

  function moveLemon(point: WalkPoint, onArrival?: () => void) {
    if (walkTimer.current !== null) window.clearTimeout(walkTimer.current);
    setLemonPoint(point);
    const duration = motionDuration(WALK_DURATION_MS);
    if (duration === 0) {
      setWalking(false);
      onArrival?.();
      return;
    }
    setWalking(true);
    walkTimer.current = window.setTimeout(() => {
      setWalking(false);
      walkTimer.current = null;
      onArrival?.();
    }, duration);
  }

  function pickStickAutomatically(stick: StickSpot) {
    if (!sticksUnlocked || walking || selectedStickId !== null || fireStage !== "unlit" || placedStickIds.includes(stick.id)) return;
    const stickPoint = { x: stick.left, y: stick.top };
    if (!pathSegmentIsWalkable(lemonPoint, stickPoint)) return;
    moveLemon(stickPoint, () => onPickStick(stick.id, stickPoint, stickPoint, false));
  }

  function handleCampfireTargetClick() {
    if (walking || fireStage !== "unlit") return;
    if (selectedStickId !== null) {
      const dropPoint = { ...CAMPFIRE_DROP_POINT };
      if (!pathSegmentIsWalkable(lemonPoint, dropPoint)) return;
      moveLemon(dropPoint, () => onPlaceStick(dropPoint, false));
    } else if (allSticksPlaced) {
      onIgnite();
    }
  }

  function handleWorldClick(event: MouseEvent<HTMLDivElement>) {
    if (escapeSucceeded || conversationReady || skillCheckActive || selectedStickId !== null) return;
    if (walking) return;
    if (event.target instanceof Element && event.target.closest("button, .campfire-lemon, .campfire-flame, .campfire-stack, .rambla-overlay")) return;
    const world = worldRef.current;
    if (!world) return;
    const bounds = world.getBoundingClientRect();
    const target = {
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    };
    if (!isOnWalkablePath(target) || !pathSegmentIsWalkable(lemonPoint, target)) return;
    moveLemon(target);
  }

  function handleWorldKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (escapeSucceeded || conversationReady || skillCheckActive || selectedStickId !== null) return;
    if (walking) return;
    if (event.target instanceof Element && event.target.closest("button, input, .rambla-overlay")) return;
    const next = { ...lemonPoint };
    const step = event.shiftKey ? 9 : 5;
    if (event.key === "ArrowLeft") next.x -= step;
    else if (event.key === "ArrowRight") next.x += step;
    else if (event.key === "ArrowUp") next.y -= step;
    else if (event.key === "ArrowDown") next.y += step;
    else return;
    if (!isOnWalkablePath(next) || !pathSegmentIsWalkable(lemonPoint, next)) return;
    event.preventDefault();
    moveLemon(next);
  }

  return (
    <div className="scene-stage game-screen campfire-stage">
      <div
        className="campfire-world"
        ref={worldRef}
        role="group"
        tabIndex={0}
        aria-label="Valle nocturno. Escenario de juego interactivo."
        onClick={handleWorldClick}
        onKeyDown={handleWorldKeyDown}
      >
        {showCampfireStatus && <p className="campfire-status" role="status" aria-live="polite">
          <span>{status}</span>
          <small>{statusDetail || "La noche guarda silencio alrededor de la hoguera."}</small>
        </p>}

        {conversationReady && !responseGesture && <RamblaConversation step={conversationStep} onChoose={chooseConversation} />}
        {skillCheckActive && !skillCheckStarted && <RamblaAttackWarning ready={warningReady} onStart={() => setSkillCheckStarted(true)} />}
        {skillCheckActive && skillCheckStarted && <RamblaSkillCheck failedAttempts={skillFailures} onAttempt={onSkillAttempt} onRetry={onRetrySkill} />}

        {sticksUnlocked && fireStage === "unlit" && STICK_SPOTS.map(stick => {
          const placed = placedStickIds.includes(stick.id);
          const canStartPickup = selectedStickId === null && !walking;
          if (placed || selectedStickId === stick.id) return null;
          return (
            <button
              key={stick.id}
              className={`campfire-stick${!canStartPickup ? " is-waiting" : ""}`}
              type="button"
              style={{ left: `${stick.left}%`, top: `${stick.top}%` }}
              aria-label={`Recoger palito seco ${stick.id}`}
              disabled={!canStartPickup || !sticksUnlocked || fireStage !== "unlit"}
              onClick={() => pickStickAutomatically(stick)}
            >
              <span className="campfire-stick-art" aria-hidden="true" style={{ transform: `rotate(${stick.rotation}deg)` }} />
            </button>
          );
        })}

        <div
          className={`campfire-lemon lemon-actor lemon-free${walking ? " walking" : ""}${escapeSucceeded ? " campfire-lemon-escaping" : ""}${responseGesture ? ` campfire-lemon-${responseGesture}` : ""}`}
          style={{ left: `${lemonPoint.x}%`, bottom: `${100 - lemonPoint.y}%` }}
          aria-hidden="true"
        >
          <LemonSprite />
        </div>
        {sticksUnlocked && selectedStickId !== null && fireStage === "unlit" && <span className="campfire-carried-stick" aria-hidden="true" style={{ left: `${lemonPoint.x}%`, bottom: `${100 - lemonPoint.y + 13}%` }} />}

        {sticksUnlocked && fireStage === "unlit" && (
          <button
            className={`campfire-center-target${selectedStickId !== null || allSticksPlaced ? " is-ready" : ""}${selectedStickId === null && !allSticksPlaced || walking ? " is-walk-through" : ""}`}
            type="button"
            disabled={selectedStickId === null && !allSticksPlaced || walking}
            onClick={handleCampfireTargetClick}
            aria-label={selectedStickId === null
              ? allSticksPlaced ? "Encender la hoguera" : "Círculo de piedra junto a la hoguera"
              : "Dejar la rama junto a las brasas"}
          >
            <span className="sr-only">{selectedStickId !== null ? "Dejar la rama junto a las brasas" : allSticksPlaced ? "Encender la hoguera" : "Centro de la hoguera"}</span>
          </button>
        )}

        {sticksUnlocked && placedStickIds.length > 0 && fireStage === "unlit" && (
          <div className="campfire-stack" aria-hidden="true">
            {placedStickIds.map((stickId, index) => <span className="campfire-stack-log" key={stickId} style={{ transform: `translate(-50%, -50%) rotate(${[-18, 17, 6][index % 3]}deg)` }} />)}
          </div>
        )}

        {sticksUnlocked && fireStage !== "unlit" && (
          <div className={`campfire-flame campfire-flame-${fireStage}`} aria-hidden="true">
            <CampfireFlame />
          </div>
        )}

        {seedAvailable && !seedCollected && (
          <button className={`campfire-seed seed-rambla${escapeSeedAvailable ? " campfire-seed-escape" : ""}`} type="button" onClick={onCollectSeed} aria-label="Recoger la semilla turquesa de Rambla y añadirla al Libro de Semillas">
            <SeedGlyph seed="rambla" />
          </button>
        )}
      </div>
    </div>
  );
}
