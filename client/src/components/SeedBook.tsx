import { useEffect, useRef, useState } from "react";
import { SeedGlyph } from "./SeedGlyph";
import { getPhysicalSeedId, PHYSICAL_SEED_COLORS } from "./seed-colors";

type SongResource = {
  id: string;
  title: string;
  mp3FragmentUrl: string | null;
  youtubeUrl: string | null;
  wavDownloadUrl: string | null;
};

export type SeedSongId = SongResource["id"];

// Los recursos externos se mantienen separados por canción y tipo. Se completarán
// con los archivos y enlaces oficiales del grupo cuando estén disponibles.
export const SONG_CATALOG: readonly SongResource[] = [
  { id: "intro", title: "Aurora", mp3FragmentUrl: null, youtubeUrl: null, wavDownloadUrl: null },
  { id: "ventana", title: "Ventana al sendero", mp3FragmentUrl: null, youtubeUrl: null, wavDownloadUrl: null },
  { id: "raices", title: "Raíces", mp3FragmentUrl: null, youtubeUrl: null, wavDownloadUrl: null },
  { id: "rambla", title: "Rambla", mp3FragmentUrl: null, youtubeUrl: null, wavDownloadUrl: null },
  { id: "espiritus-del-rio", title: "Espíritus del río", mp3FragmentUrl: null, youtubeUrl: null, wavDownloadUrl: null },
  { id: "el-rio", title: "El río", mp3FragmentUrl: null, youtubeUrl: null, wavDownloadUrl: null },
  { id: "el-fuego", title: "El fuego", mp3FragmentUrl: null, youtubeUrl: null, wavDownloadUrl: null },
  { id: "nueve-sentidos", title: "Nueve sentidos", mp3FragmentUrl: null, youtubeUrl: null, wavDownloadUrl: null },
  { id: "ponzona", title: "Ponzoña", mp3FragmentUrl: null, youtubeUrl: null, wavDownloadUrl: null },
  { id: "el-jaguar", title: "El jaguar", mp3FragmentUrl: null, youtubeUrl: null, wavDownloadUrl: null },
];

type SeedBookProps = {
  discoveredSongIds: SeedSongId[];
  previewSongId?: SeedSongId | null;
  focusSongId?: SeedSongId | null;
  onClose: () => void;
  onRestart: () => void;
  onReplaySong: (songId: SeedSongId) => void;
};

export function SeedBook({ discoveredSongIds, previewSongId = null, focusSongId = null, onClose, onRestart, onReplaySong }: SeedBookProps) {
  const [playingSongId, setPlayingSongId] = useState<SeedSongId | null>(null);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [restartConfirmationOpen, setRestartConfirmationOpen] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const restartTriggerRef = useRef<HTMLButtonElement | null>(null);
  const restartCancelRef = useRef<HTMLButtonElement | null>(null);
  const restoreRestartFocusRef = useRef(false);
  const discoveredSongs = SONG_CATALOG.filter(song => discoveredSongIds.includes(song.id));
  const previewSong = previewSongId && !discoveredSongIds.includes(previewSongId) ? SONG_CATALOG.find(song => song.id === previewSongId) ?? null : null;
  const visibleSongs = previewSong ? [...discoveredSongs, previewSong] : discoveredSongs;
  const currentSong = visibleSongs[pageIndex];

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const focusedIndex = focusSongId ? visibleSongs.findIndex(song => song.id === focusSongId) : -1;
    setPageIndex(focusedIndex >= 0 ? focusedIndex : previewSong ? visibleSongs.length - 1 : 0);
  }, [focusSongId, previewSongId]);

  useEffect(() => {
    if (pageIndex >= visibleSongs.length && visibleSongs.length > 0) setPageIndex(visibleSongs.length - 1);
  }, [pageIndex, visibleSongs.length]);

  useEffect(() => {
    if (restartConfirmationOpen) {
      restartCancelRef.current?.focus();
    } else if (restoreRestartFocusRef.current) {
      restoreRestartFocusRef.current = false;
      restartTriggerRef.current?.focus();
    }
  }, [restartConfirmationOpen]);

  useEffect(() => {
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])");
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (panelRef.current && !panelRef.current.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (previouslyFocused?.isConnected) previouslyFocused.focus();
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  function toggleFragment(song: SongResource) {
    if (!song.mp3FragmentUrl) return;
    if (playingSongId === song.id && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
      setPlayingSongId(null);
      return;
    }

    audioRef.current?.pause();
    const audio = new Audio(song.mp3FragmentUrl);
    audio.preload = "none";
    audio.volume = 0.9;
    audioRef.current = audio;
    setAudioError(false);
    audio.onended = () => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlayingSongId(null);
      }
    };
    setPlayingSongId(song.id);
    void audio.play().catch(() => {
      if (audioRef.current === audio) {
        audioRef.current = null;
        setPlayingSongId(null);
      }
      setAudioError(true);
    });
  }

  function cancelRestartConfirmation() {
    restoreRestartFocusRef.current = true;
    setRestartConfirmationOpen(false);
  }

  return (
    <div className="seedbook-layer">
      <button className="seedbook-scrim" type="button" onClick={onClose} aria-label="Cerrar el Libro de semillas" />
      <aside id="seedbook-panel" ref={panelRef} className="seedbook-panel" role="dialog" aria-modal="true" aria-labelledby="seedbook-title">
        <div className="seedbook-header">
          <div className="seedbook-heading">
            <img className="seedbook-art" src="/seedbook-art.png" alt="" aria-hidden="true" />
            <div>
              <p id="seedbook-title">{discoveredSongs.length} de {SONG_CATALOG.length} semillas descubiertas</p>
            </div>
          </div>
          <button ref={closeButtonRef} type="button" className="seedbook-close" onClick={onClose} aria-label="Cerrar el Libro de semillas">×</button>
        </div>

        <div className="seedbook-restart-area">
          {restartConfirmationOpen ? (
            <div className="seedbook-restart-confirmation" role="group" aria-labelledby="seedbook-restart-title" aria-describedby="seedbook-restart-description">
              <div className="seedbook-restart-copy">
                <h3 id="seedbook-restart-title">¿Reiniciar el juego?</h3>
                <p id="seedbook-restart-description">Se borrarán las semillas guardadas en este navegador y la partida volverá al inicio, con el portal cerrado.</p>
              </div>
              <div className="seedbook-restart-actions">
                <button ref={restartCancelRef} type="button" className="seedbook-restart-cancel" onClick={cancelRestartConfirmation}>Cancelar</button>
                <button type="button" className="seedbook-restart-confirm" onClick={onRestart}>Sí, reiniciar</button>
              </div>
            </div>
          ) : (
            <button ref={restartTriggerRef} type="button" className="seedbook-restart-button" onClick={() => setRestartConfirmationOpen(true)}>↻ Reiniciar juego</button>
          )}
        </div>

        <div className="seedbook-page">
        {visibleSongs.length === 0 ? (
          <div className="seedbook-empty">
            <span aria-hidden="true">✳</span>
            <p>Aún no hay semillas en el libro.</p>
            <small>La primera canción aparecerá al encontrar la música del portal.</small>
          </div>
        ) : currentSong ? (
          <>
            <div className="seedbook-page-indicator" aria-live="polite">Página {pageIndex + 1} de {visibleSongs.length}</div>
            <article className={`seedbook-entry${currentSong.id === previewSong?.id ? " seedbook-preview-entry" : ""}`}>
              {(() => {
                const song = currentSong;
                const isPreview = song.id === previewSong?.id;
                const seedId = getPhysicalSeedId(song.id);
                return <>
                <div className="seedbook-page-seed">
                  {seedId && <button className="seedbook-page-seed-button" type="button" onClick={() => onReplaySong(song.id)} disabled={isPreview} aria-label={`Repetir el minijuego de ${song.title}`} title={`Repetir el minijuego de ${song.title}`}>
                    <SeedGlyph seed={seedId} />
                  </button>}
                </div>
                <div className="seedbook-entry-heading">
                  <span className="seedbook-number">{String(SONG_CATALOG.indexOf(song) + 1).padStart(2, "0")}</span>
                  <h3>{song.title}</h3>
                  {isPreview && <span className="seedbook-locked">bloqueada</span>}
                </div>
                <div className="seedbook-metadata" aria-label={`Recursos de ${song.title}`}>
                  <span><b>Fragmento MP3</b><small>{song.mp3FragmentUrl ? "Listo para escuchar" : "Pendiente del archivo"}</small></span>
                  <span><b>YouTube</b><small>{song.youtubeUrl ? "Enlace disponible" : "Pendiente del enlace"}</small></span>
                  <span><b>Canción WAV</b><small>{song.wavDownloadUrl ? "Descarga disponible" : "Pendiente del archivo"}</small></span>
                </div>
                <div className="seedbook-actions">
                  <button type="button" className="seedbook-action seedbook-play" onClick={() => toggleFragment(song)} disabled={!song.mp3FragmentUrl}>
                    {playingSongId === song.id ? "■ Pausar fragmento" : "▶ Reproducir MP3"}
                  </button>
                  {song.youtubeUrl ? (
                    <a className="seedbook-action" href={song.youtubeUrl} target="_blank" rel="noopener noreferrer">↗ YouTube</a>
                  ) : (
                    <button type="button" className="seedbook-action" disabled>YouTube pendiente</button>
                  )}
                  {song.wavDownloadUrl ? (
                    <a className="seedbook-action" href={song.wavDownloadUrl} download>↓ Descargar WAV</a>
                  ) : (
                    <button type="button" className="seedbook-action" disabled>WAV pendiente</button>
                  )}
                </div>
                <div className="seedbook-lyrics-space" aria-label={`Espacio para la letra de ${song.title}`}><span>LETRA DE LA CANCIÓN</span></div>
                </>;
              })()}
            </article>
            <nav className="seedbook-pagination" aria-label="Páginas del Libro de semillas">
              <button type="button" onClick={() => setPageIndex(index => index - 1)} disabled={pageIndex === 0}>← anterior</button>
              <button type="button" onClick={() => setPageIndex(index => index + 1)} disabled={pageIndex === visibleSongs.length - 1}>siguiente →</button>
            </nav>
          </>
        ) : null}
        </div>
        {audioError && <p className="seedbook-error" role="status">No se pudo reproducir el MP3. Comprueba que el archivo esté disponible.</p>}
        <p className="seedbook-footnote">Las semillas descubiertas se guardan en este navegador. Los enlaces se activarán al incorporar los archivos oficiales del disco.</p>
      </aside>
    </div>
  );
}
