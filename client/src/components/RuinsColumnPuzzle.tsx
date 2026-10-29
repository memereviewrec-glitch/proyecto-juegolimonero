import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import "./ruins-column-puzzle.css";

export type RuinsColumnSide = "left" | "right";

type Props = {
  side: RuinsColumnSide;
  alreadyRevealed: boolean;
  onReveal: () => void;
  onClose: () => void;
};

type Leaf = { id: number; x: number; y: number; rotation: number };

const INITIAL_LEAVES: Leaf[] = [
  { id: 0, x: 29, y: 24, rotation: -27 },
  { id: 1, x: 47, y: 25, rotation: 18 },
  { id: 2, x: 67, y: 28, rotation: 43 },
  { id: 3, x: 36, y: 37, rotation: 34 },
  { id: 4, x: 53, y: 42, rotation: -38 },
  { id: 5, x: 30, y: 58, rotation: 20 },
  { id: 6, x: 49, y: 59, rotation: -19 },
  { id: 7, x: 69, y: 61, rotation: 39 },
];

export function RuinsColumnPuzzle({ side, alreadyRevealed, onReveal, onClose }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const revealedCallback = useRef(alreadyRevealed);
  const dragRef = useRef<{ id: number; pointerId: number; dx: number; dy: number } | null>(null);
  const [leaves, setLeaves] = useState<Leaf[]>(() => alreadyRevealed ? [] : INITIAL_LEAVES);
  const [dragging, setDragging] = useState<number | null>(null);
  const inscription = side === "left" ? "as above" : "so below";

  function beginDrag(id: number, event: ReactPointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    const stage = stageRef.current?.getBoundingClientRect();
    const leaf = leaves.find(item => item.id === id);
    if (!stage || !leaf) return;
    dragRef.current = {
      id,
      pointerId: event.pointerId,
      dx: event.clientX - (stage.left + stage.width * leaf.x / 100),
      dy: event.clientY - (stage.top + stage.height * leaf.y / 100),
    };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Pointer capture may be unavailable. */ }
    setDragging(id);
  }

  function moveLeaf(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const stage = stageRef.current?.getBoundingClientRect();
    if (!drag || !stage || drag.pointerId !== event.pointerId) return;
    const x = ((event.clientX - drag.dx - stage.left) / stage.width) * 100;
    const y = ((event.clientY - drag.dy - stage.top) / stage.height) * 100;
    setLeaves(current => current.map(leaf => leaf.id === drag.id ? { ...leaf, x, y } : leaf));
  }

  function endDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const stage = stageRef.current?.getBoundingClientRect();
    if (!drag || !stage || drag.pointerId !== event.pointerId) return;
    const x = ((event.clientX - drag.dx - stage.left) / stage.width) * 100;
    const y = ((event.clientY - drag.dy - stage.top) / stage.height) * 100;
    const outsideStone = x < 26 || x > 74 || y < 12 || y > 78;
    dragRef.current = null;
    setDragging(null);
    if (!outsideStone) return;
    setLeaves(current => {
      const remaining = current.filter(leaf => leaf.id !== drag.id);
      if (remaining.length === 0 && !revealedCallback.current) {
        revealedCallback.current = true;
        onReveal();
      }
      return remaining;
    });
  }

  return (
    <div className="ruins-puzzle" role="dialog" aria-label="Columna antigua" data-side={side}>
      <div className="ruins-puzzle-stage" ref={stageRef}>
        <span className="sr-only" aria-live="polite">{leaves.length === 0 ? inscription : ""}</span>
        {leaves.map((leaf, index) => (
          <button
            key={leaf.id}
            type="button"
            className={`ruins-puzzle-leaf${dragging === leaf.id ? " is-dragging" : ""}`}
            style={{ left: `${leaf.x}%`, top: `${leaf.y}%`, transform: `translate(-50%, -50%) rotate(${leaf.rotation}deg)` }}
            aria-label={`Apartar hoja ${index + 1}`}
            onPointerDown={event => beginDrag(leaf.id, event)}
            onPointerMove={moveLeaf}
            onPointerUp={endDrag}
            onPointerCancel={event => { if (dragRef.current?.pointerId === event.pointerId) { dragRef.current = null; setDragging(null); } }}
          >
            <svg viewBox="0 0 64 48" aria-hidden="true" shapeRendering="crispEdges">
              <path d="M4 26 11 13 24 8 36 3 51 9 60 20 53 34 40 42 24 44 12 37Z" fill="#476b36" stroke="#243b2b" strokeWidth="4" />
              <path d="m9 25 13-8 13-5 14 4 6 7-12 1-13 7-12 7-7-6Z" fill="#78934b" />
              <path d="m12 34 17-11 17-7M28 23l-4-10m11 4 5-9" fill="none" stroke="#b3a15b" strokeWidth="3" />
              <path d="m17 32 7-5m16-11 6 5m-18 1-3 7" stroke="#384f31" strokeWidth="2" />
            </svg>
          </button>
        ))}
        {leaves.length === 0 && <button type="button" className="ruins-puzzle-back" onClick={onClose}>Volver al sendero</button>}
      </div>
    </div>
  );
}
