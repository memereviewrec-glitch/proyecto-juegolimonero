import { SeedGlyph } from "./SeedGlyph";
import type { PhysicalSeedId } from "./seed-colors";

type StoryInterludeProps = {
  text: string;
  seed?: PhysicalSeedId;
  seedBookOpened: boolean;
  onOpenSeedBook: (seed?: PhysicalSeedId) => void;
  onContinue: () => void;
};

export function StoryInterlude({ text, seed, seedBookOpened, onOpenSeedBook, onContinue }: StoryInterludeProps) {
  return (
    <div className="story-interlude" role="dialog" aria-label="Narración">
      <div className="story-interlude-inner">
        <p>{text}</p>
        {seed ? (
          <>
            <button className="story-seed-button" type="button" onClick={() => onOpenSeedBook(seed)} aria-label="Abrir esta semilla en el Libro de Semillas">
              <SeedGlyph seed={seed} className={`story-seed-glyph story-seed-${seed}`} />
            </button>
            {seedBookOpened && <button className="story-continue-button" type="button" onClick={onContinue}>continuar el sendero <b aria-hidden="true">▶</b></button>}
          </>
        ) : (
          <button className="story-continue-button" type="button" onClick={onContinue} autoFocus>explorar <b aria-hidden="true">▶</b></button>
        )}
      </div>
    </div>
  );
}
