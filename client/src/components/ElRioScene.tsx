import { useEffect, useState } from "react";
import { LemonSprite } from "./GameSprites";
import { SeedGlyph } from "./SeedGlyph";
import "./el-rio-scene.css";

type RiverDepth = "shore" | "bed" | "choice";
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

const BLACK_RESPONSES: Record<FishColor, string> = {
  verde: "Pez negro: La alegría es un comienzo, no una respuesta final.",
  azul: "Pez negro: La tristeza recuerda que todo lo que vive también cambia.",
  rojo: "Pez negro: Incluso la ira guarda miedo a desaparecer.",
  amarillo: "Pez negro: La sabiduría empieza cuando aceptamos que no poseemos el principio.",
};

export function ElRioScene({ seedCollected, onCollectSeed }: ElRioSceneProps) {
  const [depth, setDepth] = useState<RiverDepth>("shore");
  const [heardFish, setHeardFish] = useState<FishColor[]>([]);
  const [thought, setThought] = useState<string | null>(null);
  const [blackThought, setBlackThought] = useState<string | null>(null);
  const [fishTalking, setFishTalking] = useState(false);
  const [whiteHeard, setWhiteHeard] = useState(seedCollected);
  const whiteUnlocked = heardFish.length === 4;

  useEffect(() => {
    if (depth !== "choice" || thought) return;
    setThought("Pez negro: Todo río nace antes de que alguien lo nombre y muere antes de que alguien lo comprenda.");
    setBlackThought(null);
    setFishTalking(true);
  }, [depth]);

  function hearFish(color: FishColor) {
    if (!heardFish.includes(color)) setHeardFish(current => [...current, color]);
    setThought(`Pez ${color}: ${FISH_THOUGHTS[color]}`);
    setBlackThought(BLACK_RESPONSES[color]);
    setFishTalking(true);
  }

  function hearWhiteFish() {
    setWhiteHeard(true);
    setThought("Pez blanco: La paz no es silencio; es dejar que todos los colores compartan el mismo cauce.");
    setBlackThought("Pez negro: Por un instante, la muerte no separa nada.");
    setFishTalking(true);
    onCollectSeed();
  }

  function closeFishThought() {
    setThought(null);
    setBlackThought(null);
    setFishTalking(false);
  }

  return (
    <div className={`scene-stage game-screen el-rio-stage el-rio-${depth}`}>
      <div className={`el-rio-world ${fishTalking ? "el-rio-fish-talking" : ""}`} role="group" aria-label="El Río. Un cauce profundo con peces de colores.">
        <div className="el-rio-light" aria-hidden="true" />
        <div className="el-rio-current" aria-hidden="true" />
        <button className="el-rio-fish el-rio-fish-green" type="button" onClick={() => hearFish("verde")} aria-label={FISH_LABELS.verde}><i /></button>
        <button className="el-rio-fish el-rio-fish-blue" type="button" onClick={() => hearFish("azul")} aria-label={FISH_LABELS.azul}><i /></button>
        <button className="el-rio-fish el-rio-fish-red" type="button" onClick={() => hearFish("rojo")} aria-label={FISH_LABELS.rojo}><i /></button>
        <button className="el-rio-fish el-rio-fish-yellow" type="button" onClick={() => hearFish("amarillo")} aria-label={FISH_LABELS.amarillo}><i /></button>
        {whiteUnlocked && <button className={`el-rio-fish el-rio-fish-white ${whiteHeard ? "el-rio-fish-white-heard" : ""}`} type="button" onClick={hearWhiteFish} aria-label="pez blanco de la paz"><i /></button>}
        <div className="el-rio-fish el-rio-fish-black" aria-label="Pez negro, no interactivo"><i /></div>
        <div className="el-rio-bed" aria-hidden="true" />
        <div className="el-rio-lemon" aria-hidden="true"><LemonSprite /></div>
        <div className="river-coordinate">LF · 07</div>
      </div>
      <div className="el-rio-dialogue" role="status" aria-live="polite">
        {thought ? <><span>{thought.startsWith("Pez blanco") ? "PEZ BLANCO" : thought.startsWith("Pez negro") ? "PEZ NEGRO" : "PENSAMIENTO DEL PEZ"}</span><p>{thought}</p>{blackThought && <><span>PEZ NEGRO</span><p className="el-rio-black-thought">{blackThought}</p></>}{thought.startsWith("Pez blanco") && <div className="el-rio-seed-reward"><SeedGlyph seed="el-rio" /><small>{seedCollected ? "Semilla añadida al Libro" : "Semilla de El Río"}</small></div>}<button type="button" onClick={closeFishThought}>continuar <b aria-hidden="true">▶</b></button></> : depth === "shore" ? <><span>EL RÍO</span><p>El camino luminoso termina bajo la superficie. Más abajo, los peces atraviesan el cauce como pensamientos de color.</p><button type="button" onClick={() => setDepth("bed")}>bajar con la corriente <b aria-hidden="true">▶</b></button></> : depth === "bed" ? <><span>EL RÍO</span><p>El limón toca el fondo. Los peces no huyen: pasan a su alrededor y dibujan preguntas en el agua.</p><button type="button" onClick={() => setDepth("choice")}>escuchar el fondo <b aria-hidden="true">▶</b></button></> : <><span>LA CORRIENTE</span><p>Una corriente te lleva hacia dos profundidades. Escucha a los peces que cruzan el cauce.</p><small className="el-rio-progress">{heardFish.length}/4 colores escuchados</small></>}
      </div>
    </div>
  );
}
