import { useEffect, useRef, useState } from "react";

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
  { id: "intro", title: "Intro", mp3FragmentUrl: null, youtubeUrl: null, wavDownloadUrl: null },
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
  onClose: () => void;
};

export function SeedBook({ discoveredSongIds, onClose }: SeedBookProps) {
  const [playingSongId, setPlayingSongId] = useState<SeedSongId | null>(null);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  const discoveredSongs = SONG_CATALOG.filter(song => discoveredSongIds.includes(song.id));

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

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

  return (
    <div className="seedbook-layer">
      <button className="seedbook-scrim" type="button" onClick={onClose} aria-label="Cerrar el Libro de semillas" />
      <aside id="seedbook-panel" ref={panelRef} className="seedbook-panel" role="dialog" aria-modal="true" aria-labelledby="seedbook-title">
        <div className="seedbook-header">
          <div className="seedbook-heading">
            <img className="seedbook-art" src="/seedbook-art.png" alt="" aria-hidden="true" />
            <div>
              <span className="seedbook-kicker">HERBARIO SONORO · LIMONERO FUZZ</span>
              <h2 id="seedbook-title">Libro de semillas</h2>
              <p>{discoveredSongs.length} de {SONG_CATALOG.length} semillas descubiertas</p>
            </div>
          </div>
          <button ref={closeButtonRef} type="button" className="seedbook-close" onClick={onClose} aria-label="Cerrar el Libro de semillas">×</button>
        </div>

        {discoveredSongs.length === 0 ? (
          <div className="seedbook-empty">
            <span aria-hidden="true">✳</span>
            <p>Aún no hay semillas en el libro.</p>
            <small>La primera canción aparecerá al encontrar la música del portal.</small>
          </div>
        ) : (
          <ol className="seedbook-list">
            {discoveredSongs.map(song => (
              <li className="seedbook-entry" key={song.id}>
                <div className="seedbook-entry-heading">
                  <span className="seedbook-number">{String(SONG_CATALOG.indexOf(song) + 1).padStart(2, "0")}</span>
                  <h3>{song.title}</h3>
                  <span className="seedbook-collected" aria-label="Semilla descubierta">✦</span>
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
              </li>
            ))}
          </ol>
        )}
        {audioError && <p className="seedbook-error" role="status">No se pudo reproducir el MP3. Comprueba que el archivo esté disponible.</p>}
        <p className="seedbook-footnote">Los enlaces se activarán al incorporar los archivos oficiales del disco.</p>
      </aside>
    </div>
  );
}
