import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { GAME_MUSIC_VOLUME, gameAssetUrl } from "../gameAudio";

export type GameMusicControlsHandle = {
  start: () => void;
};

type GameMusicControlsProps = {
  muted: boolean;
  paused?: boolean;
};

export const GameMusicControls = forwardRef<GameMusicControlsHandle, GameMusicControlsProps>(
  function GameMusicControls({ muted, paused = false }, ref) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const wasPausedRef = useRef(false);
    const shouldResumeRef = useRef(false);
    const startPlaybackRef = useRef<() => void>(() => undefined);

    const startPlayback = useCallback(() => {
      const audio = audioRef.current;
      if (!audio || paused) return;
      audio.volume = GAME_MUSIC_VOLUME;
      audio.muted = muted;
      void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }, [muted, paused]);
    startPlaybackRef.current = startPlayback;

    useImperativeHandle(ref, () => ({ start: startPlayback }), [startPlayback]);

    useEffect(() => {
      const audio = audioRef.current;
      if (audio) audio.volume = GAME_MUSIC_VOLUME;
    }, []);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      if (paused) {
        if (!wasPausedRef.current) shouldResumeRef.current = isPlaying;
        wasPausedRef.current = true;
        audio.pause();
        return;
      }
      if (wasPausedRef.current) {
        wasPausedRef.current = false;
        if (shouldResumeRef.current) {
          shouldResumeRef.current = false;
          startPlaybackRef.current();
        }
      }
    }, [isPlaying, paused]);

    const togglePlayback = () => {
      const audio = audioRef.current;
      if (!audio || paused) return;
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        startPlayback();
      }
    };

    return (
      <div className="game-music-controls" aria-label="Controles de música de fondo">
        <span className="game-music-label" aria-hidden="true">MÚSICA</span>
        <button
          className="game-music-toggle"
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pausar música de fondo" : "Reproducir música de fondo"}
          aria-pressed={isPlaying}
          title={isPlaying ? "Pausar música de fondo" : "Reproducir música de fondo"}
          disabled={paused}
        >
          <span aria-hidden="true">{isPlaying ? "Ⅱ" : "♫"}</span>
        </button>
        <audio
          ref={audioRef}
          src={gameAssetUrl("/audio/limonero-tema-fondo.mp3")}
          preload="none"
          loop
          muted={muted}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          aria-hidden="true"
        />
      </div>
    );
  },
);
