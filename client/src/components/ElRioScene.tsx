import { useState } from "react";
import { LemonSprite } from "./GameSprites";
import "./el-rio-scene.css";

type RiverDepth = "shore" | "bed" | "choice";

export function ElRioScene() {
  const [depth, setDepth] = useState<RiverDepth>("shore");

  return (
    <div className={`scene-stage game-screen el-rio-stage el-rio-${depth}`}>
      <div className="el-rio-world" role="group" aria-label="El Río. Un cauce profundo con peces de colores.">
        <div className="el-rio-light" aria-hidden="true" />
        <div className="el-rio-current" aria-hidden="true" />
        <div className="el-rio-fish el-rio-fish-one" aria-hidden="true"><i /></div>
        <div className="el-rio-fish el-rio-fish-two" aria-hidden="true"><i /></div>
        <div className="el-rio-fish el-rio-fish-three" aria-hidden="true"><i /></div>
        <div className="el-rio-fish el-rio-fish-four" aria-hidden="true"><i /></div>
        <div className="el-rio-bed" aria-hidden="true" />
        <div className="el-rio-lemon" aria-hidden="true"><LemonSprite /></div>
        <div className="river-coordinate">LF · 06</div>
      </div>
      <div className="el-rio-dialogue" role="status" aria-live="polite">
        {depth === "shore" && <><span>EL RÍO</span><p>El camino luminoso termina bajo la superficie. Más abajo, los peces atraviesan el cauce como pensamientos de color.</p><button type="button" onClick={() => setDepth("bed")}>bajar con la corriente <b aria-hidden="true">▶</b></button></>}
        {depth === "bed" && <><span>EL RÍO</span><p>El limón toca el fondo. Los peces no huyen: pasan a su alrededor y dibujan preguntas en el agua.</p><button type="button" onClick={() => setDepth("choice")}>escuchar el fondo <b aria-hidden="true">▶</b></button></>}
        {depth === "choice" && <><span>LA CORRIENTE</span><p>Una corriente te lleva hacia dos profundidades. ¿Qué color seguirás?</p><div className="el-rio-choices"><button type="button">El resplandor dorado</button><button type="button">La sombra azul</button></div></>}
      </div>
    </div>
  );
}
