import { PHYSICAL_SEED_COLORS, type PhysicalSeedId } from "./seed-colors";

type Props = {
  seed: PhysicalSeedId;
  className?: string;
};

const BODY_PATHS: Record<PhysicalSeedId, string> = {
  intro: "M10 1h5l2 5 4 4v9l-4 3-1 7-4 2-4-4-5-2 1-8 3-4V5z",
  ventana: "M9 2h6v4h4v5h3v10h-4v6h-5v3H8v-4H4v-6H2v-9h4V6h3z",
  raices: "M10 1h5v5l4 3v9l-2 3v7h-4v3H8v-5l-4-3V11l3-3V5h3z",
  rambla: "M8 3h8l1 4 5 4-2 10-4 1-1 7-5 1-5-3-3-8 3-6z",
  "espiritus-del-rio": "M10 1h5l2 6 4 4v9l-3 3v6l-5 2-5-3-4-6 2-8 3-4z",
  "el-rio": "M8 3h8l3 4 3 7-2 9-4 1v5l-5 2-4-4-5-2 1-9 3-4z",
  "el-fuego": "M9 2h6l1 5 5 4-2 8-3 3v6l-5 2-5-4-4-7 2-8z",
};

export function SeedGlyph({ seed, className = "" }: Props) {
  const palette = PHYSICAL_SEED_COLORS[seed];
  return (
    <svg className={`seed-glyph seed-glyph-${seed} ${className}`.trim()} viewBox="0 0 24 32" aria-hidden="true" shapeRendering="crispEdges">
      <path d={BODY_PATHS[seed]} fill={palette.body} stroke={palette.outline} strokeWidth="1.6" />
      <rect x="9" y="11" width="4" height="6" fill={palette.highlight} />
      <path d="M12 6 8 2H4v4h4l4 4z" fill={palette.leaf} stroke={palette.outline} strokeWidth="1.3" />
      <path d="m12 8-3-3" stroke={palette.highlight} strokeWidth="1" />
    </svg>
  );
}
