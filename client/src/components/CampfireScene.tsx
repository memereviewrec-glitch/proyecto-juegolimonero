import { LemonSprite } from "./GameSprites";
import "./campfire-scene.css";

export type CampfireFireStage = "unlit" | "lighting" | "seed";
export const CAMPFIRE_STICK_COUNT = 4;

type StickSpot = {
  id: number;
  left: number;
  top: number;
  rotation: number;
};

const STICK_SPOTS: StickSpot[] = [
  { id: 1, left: 15, top: 70, rotation: -28 },
  { id: 2, left: 84, top: 72, rotation: 23 },
  { id: 3, left: 44, top: 86, rotation: 38 },
  { id: 4, left: 78, top: 89, rotation: -35 },
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
  const allSticksPlaced = placedStickIds.length >= CAMPFIRE_STICK_COUNT;
  const status = seedCollected
    ? "La semilla de «Rambla» ya está en el Libro de Semillas."
    : fireStage === "lighting"
      ? "La hoguera empieza a prender."
      : fireStage === "seed"
        ? "Una semilla brilla sobre la hoguera. Pulsa la semilla para guardarla."
        : selectedStickId !== null
          ? `Lleva el palito al centro de la reunión · ${placedStickIds.length} de ${CAMPFIRE_STICK_COUNT}.`
          : allSticksPlaced
            ? "La leña está lista en el centro. Enciende la hoguera."
            : `Busca los palitos y llévalos al centro · ${placedStickIds.length} de ${CAMPFIRE_STICK_COUNT}.`;

  return (
    <div className="scene-stage game-screen campfire-stage">
      <div className="campfire-world">
        <p className="campfire-status" role="status" aria-live="polite">{status}</p>

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

        <div className="campfire-lemon lemon-actor lemon-free" aria-hidden="true">
          <LemonSprite />
        </div>
        {selectedStickId !== null && fireStage === "unlit" && <span className="campfire-carried-stick" aria-hidden="true" />}

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
          <button className="campfire-seed" type="button" onClick={onCollectSeed} aria-label="Recoger la semilla de Rambla y añadirla al Libro de Semillas">
            <svg viewBox="0 0 24 32" shapeRendering="crispEdges" aria-hidden="true">
              <path d="M10 2h5v4h4v6h3v9h-4v6h-5v3H8v-4H4v-7H2v-8h4V6h4z" fill="#e5b948" stroke="#392d31" strokeWidth="2" />
              <rect x="9" y="10" width="5" height="6" fill="#fff0a0" />
              <path d="M12 5 8 1H4v4h4z" fill="#7d9b58" stroke="#392d31" strokeWidth="1" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
