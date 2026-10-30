import { useEffect, useRef, useState } from "react";
import { SeedGlyph } from "./SeedGlyph";
import { getPhysicalSeedId, PHYSICAL_SEED_COLORS } from "./seed-colors";

type SongResource = {
  id: string;
  title: string;
  youtubeUrl: string | null;
  wavDownloadUrl: string | null;
};

export type SeedSongId = SongResource["id"];

// Los recursos externos se mantienen separados por canción y tipo. Se completarán
// con los archivos y enlaces oficiales del grupo cuando estén disponibles.
export const SONG_CATALOG: readonly SongResource[] = [
  { id: "intro", title: "Aurora", youtubeUrl: null, wavDownloadUrl: null },
  { id: "ventana", title: "Ventana al sendero", youtubeUrl: null, wavDownloadUrl: null },
  { id: "raices", title: "Raíces", youtubeUrl: null, wavDownloadUrl: null },
  { id: "rambla", title: "Rambla", youtubeUrl: null, wavDownloadUrl: null },
  { id: "espiritus-del-rio", title: "Espíritus del río", youtubeUrl: null, wavDownloadUrl: null },
  { id: "el-rio", title: "El río", youtubeUrl: null, wavDownloadUrl: null },
  { id: "el-fuego", title: "El fuego", youtubeUrl: null, wavDownloadUrl: null },
  { id: "nueve-sentidos", title: "Nueve sentidos", youtubeUrl: null, wavDownloadUrl: null },
  { id: "ponzona", title: "Ponzoña", youtubeUrl: null, wavDownloadUrl: null },
  { id: "el-jaguar", title: "El jaguar", youtubeUrl: null, wavDownloadUrl: null },
];

type SeedBookProps = {
  discoveredSongIds: SeedSongId[];
  previewSongId?: SeedSongId | null;
  focusSongId?: SeedSongId | null;
  onClose: () => void;
  onReplaySong: (songId: SeedSongId) => void;
};

export function SeedBook({ discoveredSongIds, previewSongId = null, focusSongId = null, onClose, onReplaySong }: SeedBookProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [pageIndex, setPageIndex] = useState(0);
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
    };
  }, []);

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
          <button ref={closeButtonRef} type="button" className="seedbook-close" onClick={onClose} aria-label="Continuar y cerrar el Libro de semillas">continuar</button>
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
                const visibleTitle = isPreview ? "Semilla bloqueada" : song.title;
                return <>
                <div className="seedbook-page-seed">
                  {seedId && <button className="seedbook-page-seed-button" type="button" onClick={() => onReplaySong(song.id)} disabled={isPreview} aria-label={`Repetir el minijuego de ${song.title}`} title={`Repetir el minijuego de ${song.title}`}>
                    <SeedGlyph seed={seedId} />
                  </button>}
                </div>
                <div className="seedbook-entry-heading">
                  <span className="seedbook-number">{String(SONG_CATALOG.indexOf(song) + 1).padStart(2, "0")}</span>
                  <h3>{visibleTitle}</h3>
                  {isPreview && <span className="seedbook-locked">bloqueada</span>}
                </div>
                <div className="seedbook-metadata" aria-label={`Recursos de ${song.title}`}>
                  <span><b>YouTube</b><small>{song.youtubeUrl ? "Enlace disponible" : "Pendiente del enlace"}</small></span>
                  <span><b>Descarga</b><small>{song.wavDownloadUrl ? "Archivo disponible" : "Pendiente del archivo"}</small></span>
                </div>
                <div className="seedbook-actions">
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
          </>
        ) : null}
        </div>
        {visibleSongs.length > 0 && <nav className="seedbook-pagination" aria-label="Páginas del Libro de semillas">
          <button type="button" onClick={() => setPageIndex(index => index - 1)} disabled={pageIndex === 0}>← anterior</button>
          <button type="button" onClick={() => setPageIndex(index => index + 1)} disabled={pageIndex === visibleSongs.length - 1}>siguiente →</button>
        </nav>}
      </aside>
    </div>
  );
}
