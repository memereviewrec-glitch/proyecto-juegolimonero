import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { LemonSprite } from "./GameSprites";
import { SeedGlyph } from "./SeedGlyph";
import "./campfire-scene.css";

export type CampfireFireStage = "unlit" | "lighting" | "seed";
export const CAMPFIRE_STICK_COUNT = 4;

const WALK_DURATION_MS = 3000;

type StickSpot = {
  id: number;
  left: number;
  top: number;
  rotation: number;
};

type WalkPoint = { x: number; y: number };
type PathBound = { y: number; left: number; right: number };

const STICK_SPOTS: StickSpot[] = [
  { id: 1, left: 17, top: 78, rotation: -28 },
  { id: 2, left: 83, top: 79, rotation: 23 },
  { id: 3, left: 44, top: 86, rotation: 38 },
  { id: 4, left: 78, top: 89, rotation: -35 },
];

const WALKABLE_PATH: readonly PathBound[] = [
  { y: 74, left: 18, right: 82 },
  { y: 80, left: 12, right: 88 },
  { y: 88, left: 7, right: 93 },
  { y: 97, left: 5, right: 95 },
];

type CampfireSceneProps = {
  placedStickIds: number[];
  selectedStickId: number | null;
  fireStage: CampfireFireStage;
  seedCollected: boolean;
  onPickStick: (stickId: number) => void;
  onPlaceStick: () => void;
  onIgnite: () => void;
  onCollectSeed: () => void;
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
  placedStickIds,
  selectedStickId,
  fireStage,
  seedCollected,
  onPickStick,
  onPlaceStick,
  onIgnite,
  onCollectSeed,
}: CampfireSceneProps) {
  const worldRef = useRef<HTMLDivElement>(null);
  const walkTimer = useRef<number | null>(null);
  const [lemonPoint, setLemonPoint] = useState<WalkPoint>({ x: 22, y: 86 });
  const [walking, setWalking] = useState(false);
  const allSticksPlaced = placedStickIds.length >= CAMPFIRE_STICK_COUNT;
  const status = seedCollected
    ? "La semilla de «Rambla» ya está en el Libro de Semillas."
    : fireStage === "lighting"
      ? "La hoguera empieza a prender."
      : fireStage === "seed"
        ? "Una semilla turquesa brilla sobre la hoguera. Pulsa la semilla para guardarla."
        : selectedStickId !== null
          ? `Lleva el palito al centro de la reunión · ${placedStickIds.length} de ${CAMPFIRE_STICK_COUNT}.`
          : allSticksPlaced
            ? "La leña está lista en el centro. Enciende la hoguera."
            : `Busca los palitos y llévalos al centro · ${placedStickIds.length} de ${CAMPFIRE_STICK_COUNT}.`;

  useEffect(() => () => {
    if (walkTimer.current !== null) window.clearTimeout(walkTimer.current);
  }, []);

  function moveLemon(point: WalkPoint) {
    if (walkTimer.current !== null) window.clearTimeout(walkTimer.current);
    setLemonPoint(point);
    setWalking(true);
    walkTimer.current = window.setTimeout(() => {
      setWalking(false);
      walkTimer.current = null;
    }, motionDuration(WALK_DURATION_MS));
  }

  function handleWorldClick(event: MouseEvent<HTMLDivElement>) {
    if (event.target instanceof Element && event.target.closest("button, .campfire-lemon, .campfire-flame, .campfire-stack")) return;
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
    if (event.target instanceof Element && event.target.closest("button")) return;
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
        aria-label="Valle nocturno. Haz clic en el camino o usa las flechas para mover al limón."
        onClick={handleWorldClick}
        onKeyDown={handleWorldKeyDown}
      >
        <p className="campfire-status" role="status" aria-live="polite">
          <span>{status}</span>
          <small>Haz clic en el camino para mover al limón · también puedes usar las flechas.</small>
        </p>

        {STICK_SPOTS.map(stick => {
          const placed = placedStickIds.includes(stick.id);
          const selected = selectedStickId === stick.id;
          if (placed) return null;
          return (
            <button
              key={stick.id}
              className={`campfire-stick${selected ? " is-selected" : ""}`}
              type="button"
              style={{ left: `${stick.left}%`, top: `${stick.top}%` }}
              aria-label={`${selected ? "Dejar de llevar el" : "Recoger el"} palito ${stick.id} de ${CAMPFIRE_STICK_COUNT}`}
              aria-pressed={selected}
              disabled={fireStage !== "unlit"}
              onClick={() => onPickStick(stick.id)}
            >
              <span className="campfire-stick-art" aria-hidden="true" style={{ transform: `rotate(${stick.rotation}deg)` }} />
            </button>
          );
        })}

        <div
          className={`campfire-lemon lemon-actor lemon-free${walking ? " walking" : ""}`}
          style={{ left: `${lemonPoint.x}%`, bottom: `${100 - lemonPoint.y}%` }}
          aria-hidden="true"
        >
          <LemonSprite />
        </div>
        {selectedStickId !== null && fireStage === "unlit" && <span className="campfire-carried-stick" aria-hidden="true" style={{ left: `${lemonPoint.x}%`, bottom: `${100 - lemonPoint.y + 13}%` }} />}

        {fireStage === "unlit" && (
          <button
            className={`campfire-center-target${selectedStickId !== null ? " is-ready" : ""}`}
            type="button"
            disabled={selectedStickId === null}
            onClick={onPlaceStick}
            aria-label={selectedStickId === null ? `Centro de la reunión, ${placedStickIds.length} de ${CAMPFIRE_STICK_COUNT} palitos colocados` : "Llevar el palito al centro de la reunión"}
          >
            <span className="sr-only">Colocar palito en el centro</span>
          </button>
        )}

        {placedStickIds.length > 0 && fireStage === "unlit" && (
          <div className="campfire-stack" aria-hidden="true">
            {placedStickIds.map((stickId, index) => <span className="campfire-stack-log" key={stickId} style={{ transform: `translate(-50%, -50%) rotate(${[-24, 22, 8, -8][index % 4]}deg)` }} />)}
          </div>
        )}

        {allSticksPlaced && fireStage === "unlit" && (
          <button className="campfire-ignite" type="button" onClick={onIgnite}>Encender hoguera</button>
        )}

        {fireStage !== "unlit" && (
          <div className={`campfire-flame campfire-flame-${fireStage}`} aria-hidden="true">
            <svg viewBox="0 0 64 64" shapeRendering="crispEdges">
              <rect x="10" y="47" width="44" height="9" fill="#684631" stroke="#2b2029" strokeWidth="3" />
              <path d="M15 47 25 39h7l5 7h8l7-6 4 7z" fill="#80533a" stroke="#2b2029" strokeWidth="3" />
              <path d="M22 46v-9h-6v-9h7v-9h7v10h7v-8h7v10h7v9h-7v6z" fill="#ee7840" />
              <path d="M27 45v-9h-5v-6h7v-8h5v11h7v7h-6v5z" fill="#f4bd4f" />
              <rect x="31" y="35" width="6" height="9" fill="#fff0a4" />
            </svg>
          </div>
        )}

        {fireStage === "seed" && !seedCollected && (
          <button className="campfire-seed seed-rambla" type="button" onClick={onCollectSeed} aria-label="Recoger la semilla turquesa de Rambla y añadirla al Libro de Semillas">
            <SeedGlyph seed="rambla" />
          </button>
        )}
      </div>
    </div>
  );
}
