export function LemonSprite({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`lemon-sprite ${className}`}
      viewBox="0 0 48 56"
      role="img"
      aria-label="Limón protagonista"
      shapeRendering="crispEdges"
    >
      <path d="M20 7h8v4h7v4h5v7h3v17h-4v7h-7v4H16v-4h-6v-5H6V21h4v-6h6v-4h4z" fill="#f4c943" stroke="#29252d" strokeWidth="2" />
      <path d="M17 8h7V4h7v4h-3v4h-7v3h-6v-4h2z" fill="#719452" stroke="#29252d" strokeWidth="1.5" />
      <rect x="17" y="25" width="3" height="3" fill="#28242b" />
      <rect x="29" y="25" width="3" height="3" fill="#28242b" />
      <path d="M22 34h7v2h-7z" fill="#bd704f" />
      <g className="lemon-legs" fill="#29252d">
        <path className="lemon-leg lemon-leg-left" d="M13 46h4v7h-4z" />
        <path className="lemon-leg lemon-leg-right" d="M32 46h4v7h-4z" />
      </g>
    </svg>
  );
}
