import { useEffect, useMemo, useState } from "react";
import { LemonSprite } from "./GameSprites";
import { SeedGlyph } from "./SeedGlyph";
import "./el-rio-scene.css";

type FishColor = "verde" | "azul" | "rojo" | "amarillo";

type ElRioSceneProps = {
  seedCollected: boolean;
  onCollectSeed: () => void;
};

const FISH_THOUGHTS: Record<FishColor, string> = {
  verde: "La corriente me hace cosquillas. Hoy todo parece posible.",
  azul: "Nado despacio para que nadie vea cuánto pesa mi tristeza.",
  rojo: "¡Aparta tus burbujas! El agua también tiene límites.",
  amarillo: "Cada destello conoce un camino, incluso cuando el fondo parece oscuro.",
};

const FISH_LABELS: Record<FishColor, string> = {
  verde: "pez verde",
  azul: "pez azul",
  rojo: "pez rojo",
  amarillo: "pez amarillo",
};

const FISH_COLORS: readonly FishColor[] = ["verde", "azul", "rojo", "amarillo"];

const BLACK_RESPONSES: Record<FishColor, string> = {
  verde: "La alegría es un comienzo, no una respuesta final.",
  azul: "La tristeza recuerda que todo lo que vive también cambia.",
  rojo: "Incluso la ira guarda miedo a desaparecer.",
  amarillo: "La sabiduría empieza cuando aceptamos que no poseemos el principio.",
};

export function ElRioScene({ seedCollected, onCollectSeed }: ElRioSceneProps) {
  const fishLanes = useMemo(() => ({
    green: 22 + Math.random() * 39,
    blue: 22 + Math.random() * 39,
    red: 22 + Math.random() * 39,
    yellow: 22 + Math.random() * 39,
    white: 22 + Math.random() * 39,
    black: 22 + Math.random() * 39,
  }), []);
  const [heardFish, setHeardFish] = useState<FishColor[]>([]);
  const [thought, setThought] = useState<string | null>(null);
  const [blackThought, setBlackThought] = useState<string | null>(null);
  const [activeFish, setActiveFish] = useState<FishColor | "blanco" | "negro" | null>(null);
  const [showingBlackReply, setShowingBlackReply] = useState(false);
  const [whiteHeard, setWhiteHeard] = useState(seedCollected);
  const whiteUnlocked = heardFish.length === 4;

  useEffect(() => {
    setThought("Todo río nace antes de que alguien lo nombre y muere antes de que alguien lo comprenda.");
    setBlackThought(null);
    setActiveFish("negro");
    setShowingBlackReply(false);
  }, []);

  function hearFish(color: FishColor) {
    if (!heardFish.includes(color)) setHeardFish(current => [...current, color]);
    setThought(FISH_THOUGHTS[color]);
    setBlackThought(BLACK_RESPONSES[color]);
    setActiveFish(color);
    setShowingBlackReply(false);
  }

  function hearWhiteFish() {
    setWhiteHeard(true);
    setThought("La paz no es silencio; es dejar que todos los colores compartan el mismo cauce.");
    setBlackThought("Por un instante, la muerte no separa nada.");
    setActiveFish("blanco");
    setShowingBlackReply(false);
    onCollectSeed();
  }

  function closeFishThought() {
    setThought(null);
    setBlackThought(null);
    setActiveFish(null);
    setShowingBlackReply(false);
  }

  function showBlackReply() {
    setShowingBlackReply(true);
  }

  const speakerFish = showingBlackReply && blackThought ? "negro" : activeFish;

  return (
    <div className="scene-stage game-screen el-rio-stage">
      <div className="el-rio-world" role="group" aria-label="El Río. Un cauce profundo con peces de colores.">
        <div className="el-rio-light" aria-hidden="true" />
        <div className="el-rio-current" aria-hidden="true" />
        <div className="el-rio-fish-counter" role="progressbar" aria-label="Peces de colores escuchados" aria-valuemin={0} aria-valuemax={4} aria-valuenow={heardFish.length}>
          {FISH_COLORS.map(color => <i key={color} className={`el-rio-fish-counter-dot el-rio-counter-${color} ${heardFish.includes(color) ? "el-rio-fish-counter-heard" : ""}`} aria-hidden="true" />)}
          <span aria-hidden="true">{heardFish.length}/4</span>
        </div>
        <button className="el-rio-fish el-rio-fish-green" style={{ top: `${fishLanes.green}%` }} type="button" onClick={() => hearFish("verde")} aria-label={FISH_LABELS.verde}><i /></button>
        <button className="el-rio-fish el-rio-fish-blue" style={{ top: `${fishLanes.blue}%` }} type="button" onClick={() => hearFish("azul")} aria-label={FISH_LABELS.azul}><i /></button>
        <button className="el-rio-fish el-rio-fish-red" style={{ top: `${fishLanes.red}%` }} type="button" onClick={() => hearFish("rojo")} aria-label={FISH_LABELS.rojo}><i /></button>
        <button className="el-rio-fish el-rio-fish-yellow" style={{ top: `${fishLanes.yellow}%` }} type="button" onClick={() => hearFish("amarillo")} aria-label={FISH_LABELS.amarillo}><i /></button>
        {whiteUnlocked && <button className={`el-rio-fish el-rio-fish-white ${whiteHeard ? "el-rio-fish-white-heard" : ""}`} style={{ top: `${fishLanes.white}%` }} type="button" onClick={hearWhiteFish} aria-label="pez blanco de la paz"><i /></button>}
        <div className="el-rio-fish el-rio-fish-black" style={{ top: `${fishLanes.black}%` }} aria-label="Pez negro, no interactivo"><i /><b aria-hidden="true" /><em aria-hidden="true" /></div>
        <div className="el-rio-bed" aria-hidden="true" />
        <div className="el-rio-lemon" aria-hidden="true"><LemonSprite /></div>
        <div className="river-coordinate">LF · 07</div>
      </div>
      <div className="el-rio-dialogue" role="status" aria-live="polite">
        {thought ? <><span className={`el-rio-speaker el-rio-speaker-${speakerFish ?? "unknown"}`}>PEZ {speakerFish?.toUpperCase()}</span><p>{showingBlackReply && blackThought ? blackThought : thought}</p>{!showingBlackReply && activeFish === "blanco" && <div className="el-rio-seed-reward"><SeedGlyph seed="el-rio" /><small>{seedCollected ? "Semilla añadida al Libro" : "Semilla bloqueada"}</small></div>}<button type="button" onClick={showingBlackReply || !blackThought ? closeFishThought : showBlackReply}>{showingBlackReply || !blackThought ? "continuar" : "escuchar la respuesta"} <b aria-hidden="true">▶</b></button></> : <><span className="el-rio-speaker el-rio-speaker-rio">EL RÍO</span><p>El limón ya descansa en el fondo del cauce. Los peces atraviesan el agua como pensamientos de color.</p></>}
      </div>
    </div>
  );
}
