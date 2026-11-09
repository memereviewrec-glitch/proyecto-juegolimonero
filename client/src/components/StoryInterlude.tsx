import { SeedGlyph } from "./SeedGlyph";
import type { PhysicalSeedId } from "./seed-colors";
import { LemonSprite } from "./GameSprites";

type StoryInterludeProps = {
  text: string;
  continueLabel?: string;
  startAsLemon?: boolean;
  seed?: PhysicalSeedId;
  seedBookOpened: boolean;
  onOpenSeedBook: (seed?: PhysicalSeedId) => void;
  onContinue: () => void;
};

export function StoryInterlude({ text, continueLabel = "continuar sendero", startAsLemon = false, seed, seedBookOpened, onOpenSeedBook, onContinue }: StoryInterludeProps) {
  return (
    <div className={`story-interlude${startAsLemon ? " story-interlude-opening" : ""}`} role="dialog" aria-label={startAsLemon ? continueLabel : "Narración"} tabIndex={0}>
      <div className="story-interlude-inner">
        {text.trim() && <p>{text}</p>}
        {seed ? (
          <>
            <button className="story-seed-button" type="button" onClick={() => onOpenSeedBook(seed)} aria-label="Abrir esta semilla en el Libro de Semillas">
              <SeedGlyph seed={seed} className={`story-seed-glyph story-seed-${seed}`} />
            </button>
            {seedBookOpened && <button className="story-continue-button" type="button" onClick={onContinue}>continuar sendero <b aria-hidden="true">▶</b></button>}
          </>
        ) : startAsLemon ? (
          <button className="story-continue-button story-start-button" type="button" onClick={onContinue} aria-label={continueLabel} autoFocus>
            <span className="story-start-lemon" aria-hidden="true"><LemonSprite /></span>
            <span>{continueLabel}</span>
          </button>
        ) : (
          <button className="story-continue-button" type="button" onClick={onContinue} autoFocus>{continueLabel} <b aria-hidden="true">▶</b></button>
        )}
      </div>
    </div>
  );
}
