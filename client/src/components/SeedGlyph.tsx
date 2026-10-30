import { PHYSICAL_SEED_COLORS, type PhysicalSeedId } from "./seed-colors";

type Props = {
  seed: PhysicalSeedId;
  className?: string;
};

export function SeedGlyph({ seed, className = "" }: Props) {
  const palette = PHYSICAL_SEED_COLORS[seed];
  return (
    <svg className={`seed-glyph ${className}`.trim()} viewBox="0 0 24 32" aria-hidden="true" shapeRendering="crispEdges">
      <path d="M9 2h6v4h4v5h3v10h-4v6h-5v3H8v-4H4v-6H2v-9h4V6h3z" fill={palette.body} stroke={palette.outline} strokeWidth="1.6" />
      <rect x="9" y="11" width="4" height="6" fill={palette.highlight} />
      <path d="M12 6 8 2H4v4h4l4 4z" fill={palette.leaf} stroke={palette.outline} strokeWidth="1.3" />
      <path d="m12 8-3-3" stroke={palette.highlight} strokeWidth="1" />
    </svg>
  );
}
