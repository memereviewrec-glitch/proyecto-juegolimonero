type StoryInterludeProps = {
  frame: string;
  text: string;
  onContinue: () => void;
};

export function StoryInterlude({ frame, text, onContinue }: StoryInterludeProps) {
  return (
    <div className="story-interlude" role="dialog" aria-label={`Fotograma narrativo ${frame}`}>
      <div className="story-interlude-inner">
        <span className="story-interlude-frame">FOTOGRAMA {frame}</span>
        <p>{text}</p>
        <button type="button" onClick={onContinue} autoFocus>
          continuar <b aria-hidden="true">▶</b>
        </button>
      </div>
    </div>
  );
}
