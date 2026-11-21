import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { GAME_MUSIC_VOLUME, gameAssetUrl } from "../gameAudio";

export type GameMusicControlsHandle = {
  start: () => void;
};

type GameMusicControlsProps = {
  muted: boolean;
};

export const GameMusicControls = forwardRef<GameMusicControlsHandle, GameMusicControlsProps>(
  function GameMusicControls({ muted }, ref) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const startPlayback = useCallback(() => {
      const audio = audioRef.current;
      if (!audio) return;
      audio.volume = GAME_MUSIC_VOLUME;
      audio.muted = muted;
      void audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }, [muted]);

    useImperativeHandle(ref, () => ({ start: startPlayback }), [startPlayback]);

    useEffect(() => {
      const audio = audioRef.current;
      if (audio) audio.volume = GAME_MUSIC_VOLUME;
    }, []);

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
