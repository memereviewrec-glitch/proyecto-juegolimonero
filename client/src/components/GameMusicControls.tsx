import { forwardRef, useCallback, useEffect, useId, useImperativeHandle, useRef, useState } from "react";
import { gameAssetUrl, resolveGameMusicVolume } from "../gameAudio";

export type GameMusicControlsHandle = {
  start: () => void;
};

type GameMusicControlsProps = {
  ducked: boolean;
};

export const GameMusicControls = forwardRef<GameMusicControlsHandle, GameMusicControlsProps>(
  function GameMusicControls({ ducked }, ref) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const volumeInputId = useId();
    const [volume, setVolume] = useState(36);
    const [isPlaying, setIsPlaying] = useState(false);

    const startPlayback = useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = resolveGameMusicVolume(volume, ducked);
      void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }, [ducked, volume]);

    useImperativeHandle(ref, () => ({ start: startPlayback }), [startPlayback]);

    useEffect(() => {
      const audio = audioRef.current;
      if (!audio) return;
      const initialVolume = audio.volume;
      const targetVolume = resolveGameMusicVolume(volume, ducked);
      const startedAt = performance.now();
      let frame = 0;

      const fadeVolume = (now: number) => {
        const progress = Math.min((now - startedAt) / 550, 1);
        audio.volume = initialVolume + (targetVolume - initialVolume) * progress;
        if (progress < 1) frame = requestAnimationFrame(fadeVolume);
      };

      frame = requestAnimationFrame(fadeVolume);
      return () => cancelAnimationFrame(frame);
    }, [ducked, volume]);

    const togglePlayback = () => {
      const audio = audioRef.current;
      if (!audio) return;
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
        >
          <span aria-hidden="true">{isPlaying ? "Ⅱ" : "♫"}</span>
        </button>
        <label className="sr-only" htmlFor={volumeInputId}>Volumen de la música de fondo</label>
        <input
          id={volumeInputId}
          className="game-music-volume"
          type="range"
          min="0"
          max="100"
          step="1"
          value={volume}
          onChange={event => setVolume(Number(event.currentTarget.value))}
          aria-valuetext={`${volume}%`}
          aria-label="Volumen de la música de fondo"
        />
        <audio
          ref={audioRef}
          src={gameAssetUrl("/audio/limonero-tema-fondo.mp3")}
          preload="none"
          loop
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          aria-hidden="true"
        />
      </div>
    );
  },
);
