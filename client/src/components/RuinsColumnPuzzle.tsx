import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
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
  { id: 0, x: 50, y: 39, rotation: -24 },
  { id: 1, x: 51, y: 60, rotation: 21 },
  { id: 2, x: 29, y: 68, rotation: 29 },
  { id: 3, x: 71, y: 68, rotation: -33 },
];

export function RuinsColumnPuzzle({ side, alreadyRevealed, onReveal, onClose }: Props) {
  const stageRef = useRef<HTMLDivElement>(null);
  const revealedCallback = useRef(alreadyRevealed);
  const dragRef = useRef<{ id: number; pointerId: number; dx: number; dy: number } | null>(null);
  const leafRefs = useRef(new Map<number, HTMLButtonElement>());
  const backRef = useRef<HTMLButtonElement>(null);
  const focusAfterRemoval = useRef<number | "back" | null>(null);
  const [leaves, setLeaves] = useState<Leaf[]>(() => alreadyRevealed ? [] : INITIAL_LEAVES);
  const [dragging, setDragging] = useState<number | null>(null);
  const [leaving, setLeaving] = useState<number | null>(null);
  const inscription = side === "left" ? "como es arriba" : "así es abajo";

  useEffect(() => {
    const target = focusAfterRemoval.current;
    if (target === null) return;
    focusAfterRemoval.current = null;
    if (target === "back") backRef.current?.focus();
    else leafRefs.current.get(target)?.focus();
  }, [leaves]);

  function removeLeaf(id: number) {
    setLeaves(current => {
      const index = current.findIndex(leaf => leaf.id === id);
      if (index < 0) return current;
      const remaining = current.filter(leaf => leaf.id !== id);
      focusAfterRemoval.current = remaining.length ? remaining[Math.min(index, remaining.length - 1)].id : "back";
      if (remaining.length === 0 && !revealedCallback.current) {
        revealedCallback.current = true;
        onReveal();
      }
      return remaining;
    });
  }

  function activateByKeyboard(id: number, event: ReactKeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    if (leaving !== null) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) removeLeaf(id);
    else setLeaving(id);
  }

  function finishKeyboardRemoval(id: number) {
    if (leaving !== id) return;
    setLeaving(null);
    removeLeaf(id);
  }

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
    removeLeaf(drag.id);
  }

  return (
    <div className="ruins-puzzle" role="dialog" aria-label="Columna antigua" data-side={side}>
      <div className="ruins-puzzle-stage" ref={stageRef}>
        <span className="sr-only" aria-live="polite">{leaves.length === 0 ? inscription : ""}</span>
        <p className="ruins-puzzle-keyboard-hint" id="ruins-puzzle-keyboard-hint">Teclado: enfoca una hoja y pulsa Intro o Espacio para apartarla.</p>
        {leaves.map((leaf, index) => (
          <button
            key={leaf.id}
            type="button"
            ref={element => { if (element) leafRefs.current.set(leaf.id, element); else leafRefs.current.delete(leaf.id); }}
            className={`ruins-puzzle-leaf${dragging === leaf.id ? " is-dragging" : ""}${leaving === leaf.id ? " is-leaving" : ""}`}
            style={{ left: `${leaf.x}%`, top: `${leaf.y}%`, transform: `translate(-50%, -50%) rotate(${leaf.rotation}deg)` }}
            aria-label={`Apartar hoja ${index + 1}`}
            aria-describedby="ruins-puzzle-keyboard-hint"
            onKeyDown={event => activateByKeyboard(leaf.id, event)}
            onAnimationEnd={() => finishKeyboardRemoval(leaf.id)}
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
        {leaves.length === 0 && <button ref={backRef} type="button" className="ruins-puzzle-back" onClick={onClose}>Volver al sendero</button>}
      </div>
    </div>
  );
}
