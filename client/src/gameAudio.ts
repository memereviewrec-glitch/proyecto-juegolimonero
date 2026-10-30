const activeGameAudio = new Set<HTMLAudioElement>();

/** Resolves a public asset against Vite's configured base path (including GitHub Pages). */
export function gameAssetUrl(path: string): string {
  const base = import.meta.env.BASE_URL.endsWith("/") ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  return `${base}${path.replace(/^\/+/, "")}`;
}

export function stopGameAudio() {
  activeGameAudio.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  activeGameAudio.clear();
}

function playMp3Sample(source: string, volume: number) {
  if (typeof window === "undefined") return;
  const audio = new Audio(gameAssetUrl(source));
  audio.volume = Math.max(0, Math.min(1, volume));
  activeGameAudio.add(audio);
  const remove = () => activeGameAudio.delete(audio);
  audio.addEventListener("ended", remove, { once: true });
  void audio.play().catch(remove);
}

export function playFrequencies(frequencies: number[]) {
  if (typeof window === "undefined" || frequencies.length === 0) return;
  stopGameAudio();
  frequencies.forEach(frequency => {
    const midi = Math.round(69 + 12 * Math.log2(frequency / 440));
    if (midi < 40 || midi > 73) return;
    playMp3Sample(`/audio/guitar/guitar-midi-${midi}.mp3`, 0.48 / frequencies.length);
  });
}

export function playWhistle(source: "lemon" | "birds") {
  stopGameAudio();
  playMp3Sample(source === "birds" ? "/audio/bird-whistles.mp3" : "/audio/lemon-whistle.mp3", 0.32);
}
