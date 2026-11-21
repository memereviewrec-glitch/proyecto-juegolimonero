import { useCallback, useEffect, useLayoutEffect, useRef, useState, type SyntheticEvent } from "react";
import { GAME_MUSIC_VOLUME, gameAssetUrl } from "../gameAudio";
import { LemonSprite } from "./GameSprites";
import {
  SECRET_MAZE_CENTER,
  SECRET_MAZE_START,
  SECRET_QUESTION,
  SECRET_SLEEPING_TEXT,
  SECRET_TREE_INSCRIPTION,
  advanceSecretScreen,
  moveSecretLemon,
  type SecretMazeMask,
  type SecretMazeDirection,
  type SecretMazePosition,
  type SecretScreen,
} from "./jaguarSecretRules";
import "./jaguar-secret-path.css";

const SECRET_TREE_ART = gameAssetUrl("/jaguar-secret-tree-background.webp");
const SECRET_MAZE_ROOTS_BACKGROUND = gameAssetUrl("/jaguar-secret-maze-roots-background.webp");
const SECRET_OWL_BRANCHES_ART = gameAssetUrl("/jaguar-secret-owl-branches-background.webp");

type JaguarSecretPathProps = {
  onReturnHome: () => void;
  muted: boolean;
  onFinScreenChange: (visible: boolean) => void;
};

const SECRET_MUSIC_FADE_MS = 3200;

export function JaguarSecretPath({ onReturnHome, muted, onFinScreenChange }: JaguarSecretPathProps) {
  const secretMusicRef = useRef<HTMLAudioElement | null>(null);
  const [screen, setScreen] = useState<SecretScreen>("question");
  const [lemonPosition, setLemonPosition] = useState<SecretMazePosition>(SECRET_MAZE_START);
  const [mazeMask, setMazeMask] = useState<SecretMazeMask | null>(null);
  const [treeArtUnavailable, setTreeArtUnavailable] = useState(false);
  const [riddleAnswer, setRiddleAnswer] = useState("");
  const [showFallAtDoor, setShowFallAtDoor] = useState(false);

  useEffect(() => {
    const audio = secretMusicRef.current;
    if (!audio) return;
    audio.volume = GAME_MUSIC_VOLUME;
    audio.loop = true;
    void audio.play().catch(() => undefined);
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    if (secretMusicRef.current) secretMusicRef.current.muted = muted;
  }, [muted]);

  const finScreenVisible = screen === "riddle-solved" || screen === "final-image";
  useLayoutEffect(() => {
    onFinScreenChange(finScreenVisible);
    return () => onFinScreenChange(false);
  }, [finScreenVisible, onFinScreenChange]);

  useEffect(() => {
    if (screen !== "riddle-solved") return;
    const audio = secretMusicRef.current;
    if (!audio) return;
    const initialVolume = audio.volume;
    const startedAt = performance.now();
    let frame = 0;
    const fade = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / SECRET_MUSIC_FADE_MS);
      audio.volume = initialVolume * (1 - progress);
      if (progress >= 1) {
        audio.pause();
        return;
      }
      frame = window.requestAnimationFrame(fade);
    };
    frame = window.requestAnimationFrame(fade);
    return () => window.cancelAnimationFrame(frame);
  }, [screen]);

  const transitionSecretPath = (action: Parameters<typeof advanceSecretScreen>[1]) => setScreen(current => advanceSecretScreen(current, action));
  const submitRiddle = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalize = (value: string) => value.trim().toLocaleLowerCase("es").replace(/\s+/g, " ").replace(/[.,!?¿¡]/g, "");
    const correct = normalize(riddleAnswer) === "vacio";
    if (correct) {
      // El destino posterior a acertar queda pendiente de diseño.
      setScreen("riddle-solved");
      return;
    }
    setShowFallAtDoor(true);
    setScreen("tree");
  };
  const renderRiddleKeyboard = () => <form className="jaguar-secret-letter-keyboard" onSubmit={submitRiddle}>
    <output className="jaguar-secret-answer-display" aria-label="Respuesta escrita">{riddleAnswer || " "}</output>
    <div className="jaguar-secret-letter-rows" aria-label="Teclado de letras">
      {["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"].map(row => <div className="jaguar-secret-letter-row" key={row}>
        {Array.from(row).map(letter => <button type="button" key={letter} onClick={() => setRiddleAnswer(current => (current + letter).slice(0, 24))}>{letter}</button>)}
      </div>)}
    </div>
    <div className="jaguar-secret-keyboard-actions">
      <button type="button" onClick={() => setRiddleAnswer(current => current.slice(0, -1))}>BORRAR</button>
      <button type="submit">RESPONDER</button>
    </div>
  </form>;

  const moveLemon = useCallback((direction: SecretMazeDirection) => {
    if (!mazeMask) return;
    const result = moveSecretLemon(lemonPosition, direction, mazeMask);
    if (result.escaped) {
      setScreen(advanceSecretScreen("maze", "escape-maze"));
      return;
    }
    if (!result.blocked) setLemonPosition(result.position);
  }, [lemonPosition, mazeMask]);

  const buildMazeMask = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context || !canvas.width || !canvas.height) return;
    context.drawImage(image, 0, 0);
    try {
      const rgba = context.getImageData(0, 0, canvas.width, canvas.height).data;
      const alpha = new Uint8Array(canvas.width * canvas.height);
      for (let pixel = 0; pixel < alpha.length; pixel++) alpha[pixel] = rgba[pixel * 4 + 3]!;
      setMazeMask({ width: canvas.width, height: canvas.height, alpha });
    } catch {
      setMazeMask(null);
    }
  };

  useEffect(() => {
    if (screen !== "maze") return;
    const handleKeyDown = (event: KeyboardEvent) => {
      const directions: Record<string, SecretMazeDirection> = {
        ArrowUp: "up", w: "up", W: "up",
        ArrowDown: "down", s: "down", S: "down",
        ArrowLeft: "left", a: "left", A: "left",
        ArrowRight: "right", d: "right", D: "right",
      };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      moveLemon(direction);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [moveLemon, screen]);

  const treeBackground = () => (
    <>
      {treeArtUnavailable
        ? <img className="jaguar-secret-tree-art" src={gameAssetUrl("/jaguar-secret-tree-fallback.svg")} alt={SECRET_TREE_INSCRIPTION} />
        : <>
            <img className="jaguar-secret-tree-art" src={SECRET_TREE_ART} alt={SECRET_TREE_INSCRIPTION} onError={() => setTreeArtUnavailable(true)} />
          </>}
    </>
  );

  const stageLabel = screen === "question" ? "El secreto bajo las raíces" : screen === "sleep-interlude" ? "Palabras para no despertar" : screen === "fall-interlude" || screen === "riddle-fail" ? "Limón ha caído del árbol" : screen === "owl" || screen === "riddle" ? "La lechuza entre las ramas" : screen === "riddle-solved" ? "Fin" : screen === "final-image" ? "Imagen final de Limonero" : screen === "canopy-entry" ? "La entrada secreta a la copa" : screen === "tree" || screen === "cave-offer" ? "El árbol de las raíces" : screen === "maze" ? "Laberinto secreto de raíces" : "A la superficie";

  return (
    <section className={`scene-stage game-screen jaguar-stage jaguar-secret-stage is-${screen}`} role="group" aria-label={stageLabel}>
      <audio ref={secretMusicRef} src={gameAssetUrl("/audio/secret-epilogue.mp3")} preload="auto" loop muted={muted} aria-hidden="true" />
      <div className="jaguar-secret-background" aria-hidden="true">
        {screen === "final-image"
          ? <img className="jaguar-secret-final-image" src={gameAssetUrl("/limonero-secret-logo-jaguar.png")} alt="" />
          : screen === "tree" || screen === "cave-offer" || screen === "surface" || screen === "canopy-entry" || screen === "riddle-fail"
          ? treeBackground()
          : screen === "maze"
            ? <img className="jaguar-secret-maze-roots-bg" src={SECRET_MAZE_ROOTS_BACKGROUND} alt="" />
            : screen === "owl" || screen === "riddle" || screen === "riddle-solved"
              ? <img className="jaguar-secret-owl-background" src={SECRET_OWL_BRANCHES_ART} alt="" />
            : <img src={gameAssetUrl("/jaguar-cave-background.webp")} alt="" />}
      </div>

      {screen === "question" && <>
        <div className="jaguar-secret-question jaguar-secret-card" role="group" aria-labelledby="jaguar-secret-question-text">
          <span className="jaguar-secret-kicker">AL OTRO LADO DEL SUEÑO</span>
          <p id="jaguar-secret-question-text">{SECRET_QUESTION}</p>
          <div className="jaguar-secret-actions">
            <button type="button" onClick={() => transitionSecretPath("wake")}>Despertar a Limón</button>
            <button type="button" onClick={() => transitionSecretPath("stay-asleep")}>No despertarlo</button>
          </div>
        </div>
      </>}

      {screen === "fall-interlude" && <div className="jaguar-secret-fall-interlude" role="group" aria-label="Diapositiva narrativa">
        <p>Limón ha caído del árbol.</p>
        <button type="button" onClick={() => transitionSecretPath("continue-fall")}>Continuar</button>
      </div>}

      {screen === "sleep-interlude" && <div className="jaguar-secret-fall-interlude" role="group" aria-label="Palabras para no despertar a Limón">
        <p>{SECRET_SLEEPING_TEXT}</p>
        <button type="button" onClick={() => transitionSecretPath("continue-sleep")}>Continuar</button>
      </div>}

      {screen === "owl" && <button
        type="button"
        className="jaguar-secret-owl-hotspot"
        aria-label="Tocar a la lechuza para escuchar el acertijo"
        onClick={() => transitionSecretPath("meet-owl")}
      />}

      {screen === "canopy-entry" && <div className="jaguar-secret-card jaguar-secret-canopy-card" role="group">
        <p>Limón encontró la entrada secreta a la copa del árbol.</p>
        <button type="button" onClick={() => transitionSecretPath("meet-owl")}>Continuar</button>
      </div>}

      {screen === "riddle" && <div className="jaguar-secret-card jaguar-secret-riddle-card" role="group" aria-label="El acertijo de la lechuza">
        <p>No son iguales, pero uno refleja al otro.<br />Lo que sucede en uno puede encontrarse, en el otro.<br />Si quieres comprender el cielo, observa la tierra. Si quieres comprender tus pies, observa tus alas. Si quieres comprender adentro y afuera... Dime limón, ¿qué eres?</p>
        {renderRiddleKeyboard()}
      </div>}

      {screen === "riddle-solved" && <div className="jaguar-secret-card jaguar-secret-riddle-card" role="status"><p>fin...</p><button type="button" onClick={() => setScreen("final-image")}>Continuar</button></div>}

      {screen === "riddle-fail" && <div className="jaguar-secret-card jaguar-secret-canopy-card" role="group">
        <p>Limón ha caído del árbol.</p>
        <button type="button" onClick={() => { setLemonPosition(SECRET_MAZE_START); transitionSecretPath("return-to-door"); }}>Volver a la puerta</button>
      </div>}

      {(screen === "tree" || screen === "cave-offer") && <>
        <LemonSprite className="jaguar-secret-lemon jaguar-secret-lemon-at-tree" />
        {screen === "tree" && <button
          type="button"
          className="jaguar-secret-cave-hotspot"
          aria-label="Tocar la entrada de la cueva bajo las raíces"
          onClick={() => transitionSecretPath("touch-cave")}
        />}
        {screen === "cave-offer" && <div className="jaguar-secret-card jaguar-secret-cave-card" role="group" aria-label="Entrada a la cueva">
          <p>La cueva se abre entre las raíces. ¿Quieres entrar?</p>
          <div className="jaguar-secret-actions">
          <button type="button" onClick={() => { setLemonPosition(SECRET_MAZE_START); transitionSecretPath("enter-cave"); }}>Entrar en la cueva</button>
            <button type="button" onClick={() => transitionSecretPath("leave-cave")}>Quedarme afuera</button>
          </div>
        </div>}
        {screen === "tree" && showFallAtDoor && <div className="jaguar-secret-card jaguar-secret-cave-card" role="group" aria-label="Limón vuelve a la puerta">
          <p>Limón ha caído del árbol.</p>
          <button type="button" onClick={() => setShowFallAtDoor(false)}>Continuar</button>
        </div>}
      </>}

      {screen === "maze" && <>
        <p className="jaguar-secret-maze-heading">LLEGA AL CENTRO</p>
        <div className="jaguar-secret-maze-board" role="group" aria-label="Laberinto de raíces. Guía a Limón desde la entrada superior hasta el centro.">
          <img className="jaguar-secret-maze-art" src={gameAssetUrl("/jaguar-secret-maze-art.png")} alt="" aria-hidden="true" onLoad={buildMazeMask} />
          <span className="jaguar-secret-maze-center" style={{ left: `${SECRET_MAZE_CENTER.x}%`, top: `${SECRET_MAZE_CENTER.y}%` }} aria-hidden="true" />
          <div className="jaguar-secret-maze-lemon-slot" style={{ left: `${lemonPosition.x}%`, top: `${lemonPosition.y}%` }}>
            <LemonSprite className="jaguar-secret-maze-lemon" />
          </div>
        </div>
        <nav className="jaguar-secret-dpad" aria-label="Mover a Limón por el laberinto">
          <span />
          <button type="button" aria-label="Mover arriba" onClick={() => moveLemon("up")} disabled={!mazeMask}>↑</button>
          <span />
          <button type="button" aria-label="Mover a la izquierda" onClick={() => moveLemon("left")} disabled={!mazeMask}>←</button>
          <button type="button" className="jaguar-secret-dpad-center" aria-label="Limón está en esta posición" tabIndex={-1} disabled>●</button>
          <button type="button" aria-label="Mover a la derecha" onClick={() => moveLemon("right")} disabled={!mazeMask}>→</button>
          <span />
          <button type="button" aria-label="Mover abajo" onClick={() => moveLemon("down")} disabled={!mazeMask}>↓</button>
          <span />
        </nav>
        <p className="jaguar-secret-maze-controls">Usa las flechas o los controles para llegar al centro</p>
      </>}

      {screen === "surface" && <>
        <LemonSprite className="jaguar-secret-lemon jaguar-secret-lemon-at-surface" />
        <div className="jaguar-secret-card jaguar-secret-surface-card" role="group" aria-label="Final del laberinto">
          <span className="jaguar-secret-kicker">COMO ES ARRIBA, ASÍ ES ABAJO</span>
          <p>Limón vuelve a la superficie. El árbol guarda silencio.</p>
          <button type="button" onClick={onReturnHome}>Volver a casa</button>
        </div>
      </>}
    </section>
  );
}
