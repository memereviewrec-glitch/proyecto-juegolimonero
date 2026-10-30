type StoryInterludeProps = {
  text: string;
  onContinue: () => void;
};

export function StoryInterlude({ text, onContinue }: StoryInterludeProps) {
  return (
    <div className="story-interlude" role="dialog" aria-label="Narración">
      <div className="story-interlude-inner">
        <p>{text}</p>
        <button type="button" onClick={onContinue} autoFocus>
          continuar <b aria-hidden="true">▶</b>
        </button>
      </div>
    </div>
  );
}
