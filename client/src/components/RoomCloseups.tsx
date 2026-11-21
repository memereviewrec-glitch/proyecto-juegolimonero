import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";

type CableEnd = "a" | "b";
type CableTarget = "guitar" | "amp";
type Point = { x: number; y: number };

export type FretSelection = {
  key: string;
  stringIndex: number;
  stringName: string;
  tuning: string;
  fret: number;
  noteId: string;
  label: string;
};

const STRINGS = [
  { name: "Mi", tuning: "E2", midi: 40 },
  { name: "La", tuning: "A2", midi: 45 },
  { name: "Re", tuning: "D3", midi: 50 },
  { name: "Sol", tuning: "G3", midi: 55 },
  { name: "Si", tuning: "B3", midi: 59 },
  { name: "Mi", tuning: "E4", midi: 64 },
] as const;

const VISUAL_STRING_ORDER = [5, 4, 3, 2, 1, 0] as const;

const PITCH_NAMES = ["Do", "Do♯", "Re", "Re♯", "Mi", "Fa", "Fa♯", "Sol", "Sol♯", "La", "La♯", "Si"] as const;

function noteAt(stringIndex: number, fret: number): FretSelection {
  const open = STRINGS[stringIndex];
  const midi = open.midi + fret;
  const pitchIndex = midi % 12;
  return {
    key: `${stringIndex}-${fret}`,
    stringIndex,
    stringName: open.name,
    tuning: open.tuning,
    fret,
    noteId: PITCH_NAMES[pitchIndex].replace("♯", "#"),
    label: PITCH_NAMES[pitchIndex],
  };
}

export function CableSceneArt() {
  const start = { x: 264, y: 1218 };
  const end = { x: 708, y: 1136 };
  const cablePath = `M ${start.x} ${start.y} C 335 1260, 391 1407, 493 1382 C 587 1358, 635 1313, 610 1260 C 585 1206, 518 1219, 485 1274 C 454 1325, 501 1352, 549 1328 C 618 1294, 611 1210, 641 1170 C 661 1144, 685 1143, ${end.x} ${end.y}`;

  return (
    <svg className="cable-scene-art" viewBox="0 0 981 1604" aria-hidden="true" shapeRendering="crispEdges">
      <path d={cablePath} fill="none" stroke="#211923" strokeWidth="28" strokeLinecap="square" strokeLinejoin="miter" opacity=".85" />
      <path d={cablePath} fill="none" stroke="#29232d" strokeWidth="21" strokeLinecap="square" strokeLinejoin="miter" />
      <path d={cablePath} fill="none" stroke="#65505a" strokeWidth="13" strokeLinecap="square" strokeLinejoin="miter" />
      <path d={cablePath} fill="none" stroke="#b09479" strokeWidth="3" strokeDasharray="3 13" strokeLinecap="square" opacity=".9" />
      <path d={cablePath} fill="none" stroke="#17151c" strokeWidth="2" strokeDasharray="1 7" strokeLinecap="square" opacity=".8" />
      <g transform={`translate(${start.x - 24} ${start.y - 14}) rotate(-12 20 14)`}>
        <path d="M0 4h29v20H0z" fill="#211d25" stroke="#17151d" strokeWidth="4" />
        <path d="M22 1h30v26H22z" fill="#b69a74" stroke="#28222b" strokeWidth="4" />
        <path d="M30 3v22m8-22v22m8-22v22" stroke="#5c5360" strokeWidth="2" />
        <path d="M48 7h19v14H48z" fill="#ded5c1" stroke="#28222b" strokeWidth="3" />
        <path d="M65 10h16v8H65z" fill="#777074" stroke="#28222b" strokeWidth="2" />
        <circle cx="5" cy="14" r="3" fill="#e6b84f" />
      </g>
      <g transform={`translate(${end.x - 50} ${end.y - 14}) rotate(168 40 14)`}>
        <path d="M0 4h29v20H0z" fill="#211d25" stroke="#17151d" strokeWidth="4" />
        <path d="M22 1h30v26H22z" fill="#b69a74" stroke="#28222b" strokeWidth="4" />
        <path d="M30 3v22m8-22v22m8-22v22" stroke="#5c5360" strokeWidth="2" />
        <path d="M48 7h19v14H48z" fill="#ded5c1" stroke="#28222b" strokeWidth="3" />
        <path d="M65 10h16v8H65z" fill="#777074" stroke="#28222b" strokeWidth="2" />
        <circle cx="5" cy="14" r="3" fill="#e6b84f" />
      </g>
    </svg>
  );
}

export function AmpCloseup({ powered, onPower, onContinue }: { powered: boolean; onPower: () => void; onContinue: () => void }) {
  return (
    <div className="room-closeup amp-closeup" role="dialog" aria-label="Primer plano frontal del amplificador">
      <svg className="amp-detail-art" viewBox="0 0 760 520" role="img" aria-label="Amplificador antiguo con tólex gastado, rejilla tejida, ribete y controles">
        <defs>
          <pattern id="ampTolexGrain" width="12" height="12" patternUnits="userSpaceOnUse">
            <rect width="12" height="12" fill="#40333a" />
            <path d="M0 2h3m3 0h1M2 7h2m5 3h3M8 5h2" stroke="#78625a" strokeWidth="1" opacity=".55" />
            <path d="M4 4h1m4 4h2M1 11h2" stroke="#1d1a20" strokeWidth="1" opacity=".8" />
          </pattern>
          <pattern id="ampGrilleWeave" width="10" height="10" patternUnits="userSpaceOnUse">
            <rect width="10" height="10" fill="#98836a" />
            <path d="M0 1h10M0 6h10M1 0v10M6 0v10" stroke="#d0bc96" strokeWidth="2" opacity=".8" />
            <path d="M3 0v10M0 3h10M8 0v10M0 9h10" stroke="#51474a" strokeWidth="1.4" opacity=".78" />
          </pattern>
          <pattern id="ampTolexWear" width="92" height="77" patternUnits="userSpaceOnUse">
            <path d="M4 11l18-4 7 3-14 4m51 13 13-4 7 2-11 4M18 59l8-3 9 2-12 3m37 8 17-5" fill="none" stroke="#c29a70" strokeWidth="2" opacity=".46" />
            <path d="M38 27l2-9m21 32 8-2m-50 0 4-3" fill="none" stroke="#17151a" strokeWidth="3" opacity=".85" />
          </pattern>
          <linearGradient id="ampCabinetShade" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#725348" /><stop offset=".48" stopColor="#342b31" /><stop offset="1" stopColor="#1e1c22" /></linearGradient>
          <linearGradient id="ampMetal" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#ede2c7" /><stop offset=".45" stopColor="#a69982" /><stop offset="1" stopColor="#625b5b" /></linearGradient>
        </defs>
        <ellipse cx="380" cy="479" rx="294" ry="19" fill="#201b25" opacity=".32" />
        <path d="M91 61Q101 43 125 43h512q24 0 32 22l23 378q-2 18-23 21H98q-20-5-21-23z" fill="#211e24" stroke="#17151c" strokeWidth="9" />
        <path d="M102 57q7-9 24-9h508q13 0 20 14l19 366H88z" fill="url(#ampCabinetShade)" stroke="#bb9a72" strokeWidth="9" />
        <path d="M102 57q7-9 24-9h508q13 0 20 14l19 366H88z" fill="url(#ampTolexGrain)" opacity=".82" />
        <path d="M102 57q7-9 24-9h508q13 0 20 14l19 366H88z" fill="url(#ampTolexWear)" opacity=".7" />
        <path d="M102 57l41-9-13 15-28 8m557-10 17 24-16 2m-575 315 19-7-3 19m578-18 17-6-8 24" fill="#c2a07b" opacity=".7" />
        <path d="M126 89h510v48H126z" fill="#25242a" stroke="#bd9d6c" strokeWidth="4" />
        <path d="M141 99h474v27H141z" fill="#d7c59f" stroke="#5c4c48" strokeWidth="2" />
        {[205, 345, 482, 567].map((x, index) => <g key={x}>
          <circle cx={x} cy="102" r="19" fill="#28242a" stroke="#d1bd92" strokeWidth="4" />
          <circle cx={x} cy="102" r="12" fill="#e1d4b6" stroke="#4c4143" strokeWidth="2" />
          <path d={`M${x} 93v9`} stroke="#403840" strokeWidth="3" />
          <circle cx={x} cy="123" r="2.6" fill={index === 3 && powered ? "#ef3443" : "#554b4d"} style={index === 3 && powered ? { filter: "drop-shadow(0 0 5px #f13a48)" } : undefined} />
        </g>)}
        <rect x="124" y="154" width="520" height="259" rx="2" fill="#29252b" stroke="#d0b88d" strokeWidth="7" />
        <rect x="138" y="168" width="492" height="231" fill="url(#ampGrilleWeave)" stroke="#514246" strokeWidth="4" />
        <path d="M153 179h460v205H153z" fill="none" stroke="#e1cba1" strokeWidth="2" opacity=".6" />
        <path d="M195 186l43 5m-97 38 27-7m377 172 56-11m-357-30 31 3m197-157 49-3" stroke="#5a4b48" strokeWidth="5" opacity=".7" />
        <circle cx="384" cy="282" r="94" fill="#786a5e" fillOpacity=".13" stroke="#514746" strokeWidth="8" />
        <circle cx="384" cy="282" r="67" fill="none" stroke="#d0bb93" strokeWidth="3" opacity=".5" />
        <circle cx="384" cy="282" r="14" fill="#554a4b" stroke="#d0bb93" strokeWidth="3" />
        <path d="M325 224q58-42 116 1M322 343q63 37 124-2" fill="none" stroke="#544749" strokeWidth="4" opacity=".72" />
        <rect x="290" y="389" width="190" height="22" fill="#3e3438" stroke="#bfaa82" strokeWidth="2" />
        <path d="M106 58l28-8 11 5-20 17m508 1 12 24-14 8M93 404l18-14 12 8-14 20m523-5 16-15 12 13-22 17" fill="none" stroke="#d5b58c" strokeWidth="5" opacity=".78" />
        <circle cx="114" cy="72" r="4" fill="url(#ampMetal)" /><circle cx="650" cy="72" r="4" fill="url(#ampMetal)" />
        <circle cx="105" cy="400" r="4" fill="url(#ampMetal)" /><circle cx="651" cy="403" r="4" fill="url(#ampMetal)" />
        <path d="M150 430h41v17h-41zm443 0h41v17h-41z" fill="#231f25" stroke="#a68e71" strokeWidth="4" />
      </svg>
      <div className="amp-closeup-controls">
        <span className={`amp-input-jack ${powered ? "amp-input-lit" : ""}`} aria-hidden="true" />
        <button className="power-switch" onClick={onPower} aria-label={powered ? "Apagar amplificador" : "Encender amplificador"} aria-pressed={powered}><span className={`switch-light ${powered ? "lit" : ""}`} /><span className="switch-label">ON / OFF</span></button>
        {powered && <button className="closeup-next" onClick={onContinue}>Siguiente</button>}
      </div>
    </div>
  );
}

export function CableCloseup({
  pluggedGuitar,
  pluggedAmp,
  onConnect,
  onClose,
}: {
  pluggedGuitar: boolean;
  pluggedAmp: boolean;
  onConnect: (end: CableEnd, target: CableTarget) => void;
  onClose: () => void;
}) {
  const workbenchRef = useRef<HTMLDivElement>(null);
  const targetRefs = useRef<Record<CableTarget, HTMLButtonElement | null>>({ guitar: null, amp: null });
  const [draggingEnd, setDraggingEnd] = useState<CableEnd | null>(null);
  const [keyboardEnd, setKeyboardEnd] = useState<CableEnd | null>(null);
  const [freePoints, setFreePoints] = useState<Record<CableEnd, Point>>({ a: { x: 34, y: 46 }, b: { x: 67, y: 58 } });

  const points: Record<CableEnd, Point> = {
    a: pluggedGuitar ? { x: 13, y: 54 } : freePoints.a,
    b: pluggedAmp ? { x: 87, y: 54 } : freePoints.b,
  };
  const start = { x: points.a.x * 10, y: points.a.y * 5 };
  const end = { x: points.b.x * 10, y: points.b.y * 5 };
  const cablePath = `M ${start.x} ${start.y} C ${start.x - 100} ${start.y - 120}, 170 62, 355 180 C 548 305, 365 431, 258 296 C 191 212, 328 142, 485 239 C 626 326, ${end.x + 95} ${end.y + 105}, ${end.x} ${end.y}`;
  const nextEnd: CableEnd | null = !pluggedGuitar ? "a" : !pluggedAmp ? "b" : null;

  function pointFromEvent(event: ReactPointerEvent<HTMLDivElement>) {
    const rect = workbenchRef.current?.getBoundingClientRect();
    if (!rect) return null;
    return {
      x: Math.max(5, Math.min(95, ((event.clientX - rect.left) / rect.width) * 100)),
      y: Math.max(10, Math.min(90, ((event.clientY - rect.top) / rect.height) * 100)),
    };
  }

  function beginDrag(endName: CableEnd, event: ReactPointerEvent<HTMLButtonElement>) {
    if (endName !== nextEnd) return;
    event.preventDefault();
    event.stopPropagation();
    try {
      workbenchRef.current?.setPointerCapture(event.pointerId);
    } catch {
      // El arrastre sigue gestionándose desde la zona de trabajo si la captura nativa no existe.
    }
    setDraggingEnd(endName);
  }

  function movePlug(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingEnd) return;
    const point = pointFromEvent(event);
    if (point) setFreePoints(current => ({ ...current, [draggingEnd]: point }));
  }

  function dropPlug(event: ReactPointerEvent<HTMLDivElement>) {
    if (!draggingEnd) return;
    event.preventDefault();
    const droppedEnd = draggingEnd;
    const target = (Object.keys(targetRefs.current) as CableTarget[]).find(name => {
      const rect = targetRefs.current[name]?.getBoundingClientRect();
      return Boolean(rect && event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom);
    });
    if (target) {
      onConnect(droppedEnd, target);
      setKeyboardEnd(null);
    } else {
      setFreePoints(current => ({ ...current, [droppedEnd]: droppedEnd === "a" ? { x: 34, y: 46 } : { x: 67, y: 58 } }));
    }
    setDraggingEnd(null);
  }

  function connectFromKeyboard(target: CableTarget) {
    if (!keyboardEnd) return;
    onConnect(keyboardEnd, target);
    setKeyboardEnd(null);
  }

  return (
    <div className="room-closeup cable-closeup" role="dialog" aria-label="Primer plano del cable de guitarra">
      <div className="cable-workbench" ref={workbenchRef} onPointerMove={movePlug} onPointerUp={dropPlug} onPointerCancel={() => setDraggingEnd(null)}>
        <svg className="cable-coil-art" viewBox="0 0 1000 500" aria-hidden="true" preserveAspectRatio="none">
          <path d={cablePath} fill="none" stroke="#211b24" strokeWidth="34" strokeLinecap="round" />
          <path d={cablePath} fill="none" stroke="#5c4a4c" strokeWidth="23" strokeLinecap="round" />
          <path d={cablePath} fill="none" stroke="#9a795f" strokeWidth="3" strokeDasharray="9 16" strokeLinecap="round" />
        </svg>
        <div className="cable-endpoint cable-target-wrap guitar-target-wrap">
          <button ref={node => { targetRefs.current.guitar = node; }} className={`cable-drop-target ${pluggedGuitar ? "target-connected" : ""}`} data-cable-target="guitar" onClick={() => connectFromKeyboard("guitar")} aria-label="Destino: entrada de guitarra">
            <svg viewBox="0 0 110 80" aria-hidden="true"><path d="M20 14h70v52H20z" fill="#a34e49" stroke="#211d25" strokeWidth="6" /><path d="M32 23h46v34H32z" fill="#ddd0b5" stroke="#2b252d" strokeWidth="4" /><circle cx="55" cy="41" r="8" fill="#27232b" stroke="#c3a876" strokeWidth="4" /><path d="M44 59h22" stroke="#4a3e46" strokeWidth="4" /></svg>
          </button>
        </div>
        <div className="cable-endpoint cable-target-wrap amp-target-wrap">
          <button ref={node => { targetRefs.current.amp = node; }} className={`cable-drop-target amp-target ${pluggedAmp ? "target-connected" : ""}`} data-cable-target="amp" onClick={() => connectFromKeyboard("amp")} aria-label="Destino: entrada de amplificador">
            <svg viewBox="0 0 110 80" aria-hidden="true"><path d="M13 16h84v53H13z" fill="#45343a" stroke="#211d25" strokeWidth="6" /><path d="M22 23h66v30H22z" fill="#b7a27f" stroke="#27232b" strokeWidth="4" /><circle cx="55" cy="39" r="9" fill="#29242b" stroke="#d0b783" strokeWidth="4" /><circle cx="55" cy="39" r="3" fill="#17151a" /><path d="M27 59h55" stroke="#d5c6a6" strokeWidth="3" /></svg>
          </button>
        </div>
        {(["a", "b"] as const).map(endName => {
          const point = points[endName];
          const connected = endName === "a" ? pluggedGuitar : pluggedAmp;
          const active = nextEnd === endName;
          return <button
            key={endName}
            className={`cable-jack-handle ${active ? "jack-active" : ""} ${connected ? "jack-connected" : ""} ${draggingEnd === endName ? "jack-dragging" : ""}`}
            style={{ left: `${point.x}%`, top: `${point.y}%` }}
            onPointerDown={event => beginDrag(endName, event)}
            onClick={() => { if (active && !draggingEnd) setKeyboardEnd(endName); }}
            aria-label={`Punta ${endName.toUpperCase()}${connected ? " conectada" : active ? ", arrastrar" : ", espera su turno"}`}
            aria-pressed={keyboardEnd === endName}
            aria-disabled={!active}
            type="button"
          >
            <svg viewBox="0 0 154 66" aria-hidden="true"><path d="M9 25h25v16H9z" fill="#312a32" stroke="#211b24" strokeWidth="4" /><path d="M30 18h51v30H30z" fill="#c2af87" stroke="#27232b" strokeWidth="4" /><path d="M39 19v28m12-28v28m12-28v28" stroke="#665963" strokeWidth="3" /><path d="M80 22h35v22H80z" fill="#e3d8c0" stroke="#27232b" strokeWidth="4" /><path d="M114 26h27v14h-27z" fill="#bfc0bb" stroke="#29252e" strokeWidth="3" /><path d="M138 29h11v8h-11z" fill="#4b4650" stroke="#29252e" strokeWidth="2" /><circle cx="18" cy="33" r="3" fill="#e8bd55" /></svg>
          </button>;
        })}
      </div>
      <div className="cable-closeup-footer">
        <button className="closeup-back" onClick={onClose}>Volver al local</button>
      </div>
    </div>
  );
}

const GUITAR_CLUE = "donde sospecho, dorados sosiegos. Donde sostengo dolores al soslayo";

export function PaperSprite() {
  return (
    <svg className="paper-floor-sprite" viewBox="0 0 144 92" aria-hidden="true" shapeRendering="crispEdges">
      <path d="M12 12h112v68H19L8 70z" fill="#2c2430" opacity=".7" />
      <path d="M8 7h111l17 13v62H18L5 69z" fill="#d7c99f" stroke="#342b34" strokeWidth="5" />
      <path d="M119 7v16h17" fill="#f1e5c4" stroke="#342b34" strokeWidth="4" />
      <path d="M20 34h30m8 0h37M20 45h24m9 0h52M20 56h35m8 0h39" stroke="#786d62" strokeWidth="3" opacity=".75" />
      <path d="M13 66h35m7 0h14" stroke="#aa9b78" strokeWidth="2" opacity=".8" />
      <path d="M15 15h12m84 0h3M14 73h3m104 1h5" stroke="#f8edcc" strokeWidth="2" opacity=".75" />
    </svg>
  );
}

export function PaperCloseup({ onClose }: { onClose: () => void }) {
  return (
    <div className="room-closeup paper-closeup" role="dialog" aria-modal="true" aria-label="Papel encontrado en el suelo">
      <div className="paper-sheet" role="document">
        <span className="paper-pixel-fold" aria-hidden="true" />
        <p className="paper-clue">{GUITAR_CLUE}</p>
      </div>
      <button className="closeup-back paper-closeup-back" onClick={onClose}>Volver al local <span aria-hidden="true">←</span></button>
    </div>
  );
}

export function GuitarCloseup({
  selectedPositions,
  onSelectNote,
  onClose,
}: {
  selectedPositions: string[];
  onSelectNote: (note: FretSelection) => void;
  onClose: () => void;
}) {
  const nutX = 200;
  const fretEndX = 1000;
  const scaleLength = (fretEndX - nutX) / (1 - 2 ** (-9 / 12));
  const fretX = Array.from({ length: 10 }, (_, fret) => fret === 0 ? nutX : nutX + scaleLength * (1 - 2 ** (-fret / 12)));
  const openFretCenter = (nutX + fretX[1]) / 2;
  const stringY = VISUAL_STRING_ORDER.map((_, row) => 143 + row * 34);
  const inlayFrets = [3, 5, 7, 9];

  function activate(note: FretSelection) {
    onSelectNote(note);
  }

  function handleKeyDown(event: React.KeyboardEvent<SVGRectElement>, note: FretSelection) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activate(note);
    }
  }

  return (
    <div className="room-closeup guitar-closeup" role="dialog" aria-label="Primer plano del mástil de guitarra">
      <div className="fretboard-scroll" role="region" tabIndex={0} aria-label="Mástil ampliado: desplázate hacia abajo para recorrer los nueve trastes">
        <svg className="guitar-fretboard-svg" viewBox="0 0 800 1080" role="group" aria-label="Mástil de guitarra vertical ampliado, con clavijero, seis cuerdas y nueve trastes">
          <defs>
            <linearGradient id="fretboardWood" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#bc8b58" /><stop offset=".5" stopColor="#744e3c" /><stop offset="1" stopColor="#402f32" /></linearGradient>
            <linearGradient id="headstockWood" x1="0" x2="1"><stop stopColor="#b96152" /><stop offset="1" stopColor="#713e44" /></linearGradient>
            <linearGradient id="stringMetal" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#fff5d8" /><stop offset=".5" stopColor="#bcb7b0" /><stop offset="1" stopColor="#5f5960" /></linearGradient>
          </defs>
          <g transform="translate(915 0) scale(2.4 1.05) rotate(90)">
          <path d="M24 157 38 130Q50 108 82 100l44-9q29-5 47 17l11 18v210l-11 15q-18 22-47 17l-44-9q-32-7-44-30l-14-26 9-35-12-33 12-33-12-33z" fill="url(#headstockWood)" stroke="#29242c" strokeWidth="9" />
          <path d="M34 158 46 135q12-20 39-27l39-8q25-4 41 16l9 14v198l-9 13q-16 20-41 16l-39-8q-27-6-39-25l-12-22 8-32-10-32 10-32-10-32z" fill="#fff0d2" fillOpacity=".08" stroke="#d6b087" strokeWidth="3" />
          <path d="M48 150q37-25 84-27m-83 190q41 24 82 25m-89-162 18-7m-13 105 17 7" fill="none" stroke="#f3c590" strokeWidth="3" opacity=".42" />
          <path d="M43 236c10-18 24-18 34 0-10 18-24 18-34 0z" fill="#e6d4b2" stroke="#493b3b" strokeWidth="4" />
          <path d="M60 224v24m-10-12h20" stroke="#9a6658" strokeWidth="4" />
          <path d="M177 116h817v223H177z" fill="url(#fretboardWood)" stroke="#2b242b" strokeWidth="9" />
          <path d="M184 125h809v12H184z" fill="#ddd2bb" stroke="#42343a" strokeWidth="3" />
          <text x={openFretCenter} y="119" className="fret-number fret-number-open" textAnchor="middle" transform={`rotate(-90 ${openFretCenter} 119)`}>0</text>
          {stringY.map((y, row) => {
            const stringIndex = VISUAL_STRING_ORDER[row];
            const pegX = 150 - row * 18;
            const pegY = 116;
            const stringWidth = stringIndex === 0 ? 3.2 : stringIndex === 5 ? 1.4 : 2.2;
            return <g key={`tuner-${stringIndex}`}>
              <path d={`M ${pegX} ${pegY} L 184 ${y}`} fill="none" stroke="#312b31" strokeWidth={stringWidth + 2} opacity=".75" />
              <path d={`M ${pegX} ${pegY} L 184 ${y}`} fill="none" stroke="url(#stringMetal)" strokeWidth={stringWidth} />
              <path d={`M ${pegX} ${pegY - 2} V ${pegY - 21}`} stroke="#403941" strokeWidth="8" />
              <path d={`M ${pegX} ${pegY - 2} V ${pegY - 21}`} stroke="url(#stringMetal)" strokeWidth="5" />
              <circle cx={pegX} cy={pegY} r="12" fill="#27232a" stroke="#d9c9a9" strokeWidth="4" />
              <circle cx={pegX} cy={pegY} r="6" fill="url(#stringMetal)" stroke="#625a5a" strokeWidth="2" />
              <path d={`M ${pegX} ${pegY - 18} V ${pegY - 27}`} stroke="#d8cfbc" strokeWidth="5" />
              <rect x={pegX - 14} y={pegY - 46} width="28" height="20" rx="8" fill="#c9c0ae" stroke="#39343a" strokeWidth="4" />
              <rect x={pegX - 8} y={pegY - 42} width="16" height="12" rx="5" fill="#eee4cc" stroke="#736b67" strokeWidth="2" />
              <circle cx={pegX} cy={pegY - 36} r="2.5" fill="#5f5960" />
            </g>;
          })}
          {Array.from({ length: 9 }, (_, index) => {
            const fret = index + 1;
            const x = fretX[fret];
            const center = (x + (fret === 9 ? fretEndX : fretX[fret + 1])) / 2;
            return <g key={`fret-${fret}`}>
              <path d={`M ${x} 127 V 334`} stroke="#d8d0c1" strokeWidth="7" />
              <path d={`M ${x + 4} 127 V 334`} stroke="#3d3235" strokeWidth="2" opacity=".75" />
              <text x={center} y="119" className="fret-number" textAnchor="middle" transform={`rotate(-90 ${center} 119)`}>{fret}</text>
              {inlayFrets.includes(fret) && <circle cx={center} cy="235" r="9" fill="#d9ccb0" stroke="#59464a" strokeWidth="3" />}
              {fret === 9 && <circle cx={center} cy="235" r="3" fill="#7c5b4a" />}
            </g>;
          })}
          <path d="M 183 128 V 336" stroke="#332c33" strokeWidth="18" />
          <path d="M 183 128 V 336" stroke="#e5d8bd" strokeWidth="12" />
          <path d="M 186 128 V 336" stroke="#8c7c70" strokeWidth="2" />
          {stringY.map((y, row) => {
            const stringIndex = VISUAL_STRING_ORDER[row];
            return <g key={`string-${stringIndex}`}>
              <path d={`M 184 ${y} H 992`} stroke="#373038" strokeWidth="5" opacity=".65" />
              <path d={`M 184 ${y - 1} H 992`} stroke="url(#stringMetal)" strokeWidth={stringIndex === 0 ? 2.8 : stringIndex === 5 ? 1.2 : 1.7} />
              <text x={openFretCenter} y={y - 8} className="open-note-label" textAnchor="middle" transform={`rotate(-90 ${openFretCenter} ${y - 8})`}>{STRINGS[stringIndex].tuning}</text>
            </g>;
          })}
          {stringY.flatMap((y, row) => {
            const stringIndex = VISUAL_STRING_ORDER[row];
            return Array.from({ length: 10 }, (_, fret) => {
              const note = noteAt(stringIndex, fret);
              const left = fret === 0 ? nutX : fretX[fret];
              const right = fret === 9 ? 1000 : fretX[fret + 1];
              const center = (left + right) / 2;
              const active = selectedPositions.includes(note.key);
              return <g key={note.key}>
                <rect x={left + 3} y={y - 14} width={Math.max(10, right - left - 6)} height="28" rx="5" fill={active ? "#f1d878" : "transparent"} fillOpacity={active ? ".74" : "0"} stroke={active ? "#f7e8aa" : "transparent"} strokeWidth="2" role="button" tabIndex={0} aria-label={`${STRINGS[stringIndex].tuning}, ${fret === 0 ? "traste 0, cuerda al aire" : `traste ${fret}`}: ${note.label}`} aria-pressed={active} onClick={() => activate(note)} onKeyDown={event => handleKeyDown(event, note)} />
                {active && <text x={center} y={y + 5} className={`selected-note-label ${fret === 0 ? "open-string-note-label" : ""}`} textAnchor="middle" transform={`rotate(-90 ${center} ${y + 5})`}>{note.label}</text>}
              </g>;
            });
          })}
          </g>
        </svg>
      </div>
      <div className="guitar-closeup-footer">
        <div className="fretboard-actions"><button className="closeup-back" onClick={onClose} aria-label="Volver al local" title="Volver al local">↗</button></div>
      </div>
    </div>
  );
}
