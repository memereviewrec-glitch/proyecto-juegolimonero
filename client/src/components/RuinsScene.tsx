import { useEffect, useRef, useState, type MouseEvent } from "react";
import { LemonSprite } from "./GameSprites";
import type { RuinsColumnSide } from "./RuinsColumnPuzzle";
import "./ruins-scene.css";

export type RuinsFlowerStage = "hidden" | "growing" | "open" | "falling" | "seed";

type Props = {
  leftRevealed: boolean;
  rightRevealed: boolean;
  flowerStage: RuinsFlowerStage;
  seedCollected: boolean;
  onApproachColumn: (side: RuinsColumnSide) => void;
  onCollectSeed: () => void;
};

type LemonPoint = { x: number; y: number };
const WALK_DURATION_MS = 3800;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function walkableTop(x: number) {
  return 75 + Math.abs(x - 50) * 0.25;
}

function motionDuration(duration: number) {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : duration;
}

export function RuinsScene({
  leftRevealed,
  rightRevealed,
  flowerStage,
  seedCollected,
  onApproachColumn,
  onCollectSeed,
}: Props) {
  const worldRef = useRef<HTMLDivElement>(null);
  const walkTimer = useRef<number | null>(null);
  const [lemonPoint, setLemonPoint] = useState<LemonPoint>({ x: 50, y: 91 });
  const [walking, setWalking] = useState(false);

  useEffect(() => () => {
    if (walkTimer.current !== null) window.clearTimeout(walkTimer.current);
  }, []);

  function moveLemon(point: LemonPoint, afterMove?: () => void) {
    if (walkTimer.current !== null) window.clearTimeout(walkTimer.current);
    setLemonPoint({ x: clamp(point.x, 8, 92), y: clamp(point.y, 70, 97) });
    setWalking(true);
    walkTimer.current = window.setTimeout(() => {
      setWalking(false);
      walkTimer.current = null;
      afterMove?.();
    }, motionDuration(WALK_DURATION_MS));
  }

  function handlePathClick(event: MouseEvent<HTMLDivElement>) {
    if (walking || (event.target instanceof Element && event.target.closest("button"))) return;
    const world = worldRef.current;
    if (!world) return;
    const bounds = world.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right) return;
    const x = clamp(((event.clientX - bounds.left) / bounds.width) * 100, 8, 92);
    const y = clamp(((event.clientY - bounds.top) / bounds.height) * 100, 3, 97);
    if (y < walkableTop(x)) return;
    moveLemon({ x, y });
  }

  function approachColumn(side: RuinsColumnSide) {
    if (walking || (side === "left" ? leftRevealed : rightRevealed)) return;
    const x = side === "left" ? 29 : 53;
    moveLemon({ x, y: 82 }, () => onApproachColumn(side));
  }

  return (
    <div className="scene-stage ruins-stage" onClick={handlePathClick}>
      <div className="ruins-world" ref={worldRef}>
        <button
          className="ruins-column-hotspot ruins-column-left"
          type="button"
          aria-label={leftRevealed ? "Columna izquierda examinada" : "Acercarse a la columna izquierda"}
          disabled={leftRevealed || walking}
          onClick={() => approachColumn("left")}
        />
        <button
          className="ruins-column-hotspot ruins-column-right"
          type="button"
          aria-label={rightRevealed ? "Columna derecha examinada" : "Acercarse a la columna derecha"}
          disabled={rightRevealed || walking}
          onClick={() => approachColumn("right")}
        />
        <div
          className={`lemon-actor lemon-free ruins-lemon-actor${walking ? " walking" : ""}`}
          style={{ left: `${lemonPoint.x}%`, bottom: `${100 - lemonPoint.y}%` }}
        >
          <LemonSprite />
        </div>
        {flowerStage !== "hidden" && (
          <div className={`ruins-root-plant plant-${flowerStage}`} aria-label="Una planta crece entre las raíces">
            <svg viewBox="0 0 96 180" aria-hidden="true" shapeRendering="crispEdges">
              <path d="M47 174h8l-4-29-14-18 3-5 13 12 4-26h6l-2 32 17-19 5 4-19 24-5 25h8v6H38v-6z" fill="#35472f" />
              <path className="ruins-stem" d="M48 157V53h8v104z" fill="#6f9144" />
              <path className="ruins-leaf-left" d="M48 119 21 100 12 82l20 4 18 24zM51 91 67 75l19-4-7 18-25 11z" fill="#79964b" stroke="#283c2c" strokeWidth="4" />
              <path className="ruins-bloom" d="M52 49 41 36l3-16 12 9 11-13 9 8-8 15 15 5-3 13-18-4-8 14-11-7z" fill="#e6d9b1" stroke="#493f43" strokeWidth="4" />
              <rect className="ruins-flower-heart" x="52" y="38" width="13" height="13" fill="#efc64d" stroke="#493f43" strokeWidth="3" />
            </svg>
            {flowerStage === "falling" && <span className="ruins-seed-fall" aria-hidden="true" />}
            {flowerStage === "seed" && !seedCollected && (
              <button className="ruins-seed-pickup" type="button" onClick={onCollectSeed} aria-label="Coger la semilla de Raíces" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
