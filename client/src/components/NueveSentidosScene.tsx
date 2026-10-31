import "./nueve-sentidos-scene.css";

const STARS = [
  { x: 12, y: 19, size: 8, delay: 0.2, tone: "cool" },
  { x: 27, y: 31, size: 5, delay: 1.1, tone: "warm" },
  { x: 43, y: 13, size: 11, delay: 0.7, tone: "warm" },
  { x: 63, y: 24, size: 7, delay: 1.8, tone: "cool" },
  { x: 82, y: 17, size: 9, delay: 2.3, tone: "cool" },
  { x: 91, y: 42, size: 5, delay: 0.4, tone: "warm" },
  { x: 18, y: 69, size: 6, delay: 2.1, tone: "warm" },
  { x: 46, y: 57, size: 9, delay: 1.5, tone: "cool" },
  { x: 75, y: 74, size: 7, delay: 0.8, tone: "warm" },
] as const;

export function NueveSentidosScene() {
  return (
    <div
      className="scene-stage game-screen nueve-sentidos-stage"
      role="img"
      aria-label="Cielo nocturno de Nueve sentidos con nueve estrellas luminosas que emiten destellos suaves."
    >
      <div className="nueve-sentidos-sky" aria-hidden="true">
        <div className="nueve-sentidos-nebula" />
        {STARS.map((star, index) => (
          <i
            key={index}
            className={`nueve-sentidos-star nueve-sentidos-star-${star.tone}`}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `-${star.delay}s`,
            }}
          />
        ))}
        <span className="stage-coordinate">LF · 10</span>
      </div>
    </div>
  );
}
