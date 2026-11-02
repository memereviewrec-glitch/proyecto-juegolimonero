import { useEffect, useRef, useState } from "react";
import { gameAssetUrl } from "../gameAudio";
import { SeedGlyph } from "./SeedGlyph";
import { getPhysicalSeedId } from "./seed-colors";
import { JAGUAR_ENDINGS, REWRITE_CHAPTERS, type JaguarEndingId, type RewriteChapterId } from "./storyArchive";

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
  { id: "ponzona", title: "Ponzoña", youtubeUrl: null, wavDownloadUrl: null },
  { id: "nueve-sentidos", title: "Nueve sentidos", youtubeUrl: null, wavDownloadUrl: null },
  { id: "el-jaguar", title: "El jaguar", youtubeUrl: null, wavDownloadUrl: null },
];

type SeedBookProps = {
  discoveredSongIds: SeedSongId[];
  previewSongId?: SeedSongId | null;
  focusSongId?: SeedSongId | null;
  rewriteUnlocked: boolean;
  rewriteSummaries: Partial<Record<RewriteChapterId, string>>;
  archivedEndingIds: JaguarEndingId[];
  onClose: () => void;
  onRewriteChapter: (chapterId: RewriteChapterId) => void;
};

type BookView = "songs" | "index" | "rewrite" | "endings" | "ending";

export function SeedBook({ discoveredSongIds, previewSongId = null, focusSongId = null, rewriteUnlocked, rewriteSummaries, archivedEndingIds, onClose, onRewriteChapter }: SeedBookProps) {
  const panelRef = useRef<HTMLElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const onCloseRef = useRef(onClose);
  const [pageIndex, setPageIndex] = useState(0);
  const [view, setView] = useState<BookView>(focusSongId ? "songs" : "index");
  const [selectedIndexSongId, setSelectedIndexSongId] = useState<SeedSongId | null>(null);
  const [selectedEndingId, setSelectedEndingId] = useState<JaguarEndingId | null>(null);
  const discoveredSongs = SONG_CATALOG.filter(song => discoveredSongIds.includes(song.id));
  const previewSong = previewSongId && !discoveredSongIds.includes(previewSongId) ? SONG_CATALOG.find(song => song.id === previewSongId) ?? null : null;
  const visibleSongs = previewSong ? [...discoveredSongs, previewSong] : discoveredSongs;
  const currentSong = selectedIndexSongId
    ? SONG_CATALOG.find(song => song.id === selectedIndexSongId)
    : visibleSongs[pageIndex];
  const currentSongLocked = currentSong ? !discoveredSongIds.includes(currentSong.id) : false;
  const selectedEnding = JAGUAR_ENDINGS.find(ending => ending.id === selectedEndingId && archivedEndingIds.includes(ending.id));

  function openIndexSong(songId: SeedSongId) {
    const visibleIndex = visibleSongs.findIndex(song => song.id === songId);
    if (visibleIndex >= 0) {
      setPageIndex(visibleIndex);
      setSelectedIndexSongId(null);
    } else {
      setSelectedIndexSongId(songId);
    }
    setView("songs");
  }

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const focusedIndex = focusSongId ? visibleSongs.findIndex(song => song.id === focusSongId) : -1;
    setPageIndex(focusedIndex >= 0 ? focusedIndex : previewSong ? visibleSongs.length - 1 : 0);
    if (focusSongId) {
      setSelectedIndexSongId(null);
      setView("songs");
    }
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
            <img className="seedbook-art" src={gameAssetUrl("/seedbook-art.png")} alt="" aria-hidden="true" />
            <div>
              <p id="seedbook-title">{discoveredSongs.length} de {SONG_CATALOG.length} semillas descubiertas</p>
            </div>
          </div>
          <button ref={closeButtonRef} type="button" className="seedbook-close" onClick={onClose} aria-label="Continuar y cerrar el Libro de semillas">continuar</button>
        </div>

        <nav className="seedbook-library-tabs" aria-label="Secciones del Libro de semillas">
          <button type="button" className={view === "index" ? "seedbook-tab seedbook-tab-active" : "seedbook-tab"} aria-pressed={view === "index"} onClick={() => setView("index")}>Índice</button>
          {rewriteUnlocked && <button type="button" className={view === "rewrite" ? "seedbook-tab seedbook-tab-active" : "seedbook-tab"} aria-pressed={view === "rewrite"} onClick={() => setView("rewrite")}>Reescribir historia</button>}
          {rewriteUnlocked && archivedEndingIds.length > 0 && <button type="button" className={view === "endings" || view === "ending" ? "seedbook-tab seedbook-tab-active" : "seedbook-tab"} aria-pressed={view === "endings" || view === "ending"} onClick={() => setView("endings")}>Finales · {archivedEndingIds.length}</button>}
        </nav>

        <div className="seedbook-page">
        {view === "songs" && (visibleSongs.length === 0 ? (
          <div className="seedbook-empty">
            <span aria-hidden="true">✳</span>
            <p>Aún no hay semillas en el libro.</p>
            <small>La primera canción aparecerá al encontrar la música del portal.</small>
          </div>
        ) : currentSong ? (
          <>
            <div className="seedbook-page-indicator" aria-live="polite">Página {SONG_CATALOG.indexOf(currentSong) + 1} de {SONG_CATALOG.length}{currentSongLocked ? " · bloqueada" : ""}</div>
            <article className={`seedbook-entry${currentSongLocked ? " seedbook-preview-entry" : ""}`}>
              {(() => {
                const song = currentSong;
                const isPreview = currentSongLocked;
                const seedId = getPhysicalSeedId(song.id);
                const visibleTitle = isPreview ? "Semilla bloqueada" : song.title;
                const accessibleSongTitle = isPreview ? "semilla bloqueada" : song.title;
                return <>
                <div className="seedbook-page-seed">
                  {seedId && <div className="seedbook-page-seed-display" aria-hidden="true"><SeedGlyph seed={seedId} /></div>}
                </div>
                <div className="seedbook-entry-heading">
                  <span className="seedbook-number">{String(SONG_CATALOG.indexOf(song) + 1).padStart(2, "0")}</span>
                  <h3>{visibleTitle}</h3>
                  {isPreview && <span className="seedbook-locked">bloqueada</span>}
                </div>
                <div className="seedbook-metadata" aria-label={`Recursos de ${accessibleSongTitle}`}>
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
                <div className="seedbook-lyrics-space" aria-label={`Espacio para la letra de ${accessibleSongTitle}`}><span>LETRA DE LA CANCIÓN</span></div>
                </>;
              })()}
            </article>
          </>
        ) : null)}
        {view === "index" && <section className="seedbook-index-view" aria-labelledby="seedbook-index-title">
          <div className="seedbook-page-indicator">CATÁLOGO COMPLETO · EN ORDEN</div>
          <h3 id="seedbook-index-title">Índice de semillas</h3>
          <div className="seedbook-index-list">
            {SONG_CATALOG.map((song, index) => {
              const seedId = getPhysicalSeedId(song.id);
              const isDiscovered = discoveredSongIds.includes(song.id);
              const visibleTitle = isDiscovered ? song.title : "Semilla bloqueada";
              const accessibleTitle = isDiscovered ? song.title : "semilla bloqueada";
              return <button key={song.id} type="button" className={`seedbook-index-entry${isDiscovered ? "" : " seedbook-index-entry-locked"}`} onClick={() => openIndexSong(song.id)} aria-label={`Ir a la página ${index + 1}: ${accessibleTitle}`}>
                <span className="seedbook-index-seed" aria-hidden="true">{seedId && <SeedGlyph seed={seedId} />}</span>
                <span className="seedbook-index-number">{String(index + 1).padStart(2, "0")}</span>
                <strong>{visibleTitle}</strong>
                <span className="seedbook-index-status">{isDiscovered ? "descubierta" : "bloqueada"}</span>
                <span className="seedbook-index-arrow" aria-hidden="true">→</span>
              </button>;
            })}
          </div>
        </section>}
        {view === "rewrite" && rewriteUnlocked && <section className="seedbook-rewrite-view" aria-labelledby="seedbook-rewrite-title">
          <div className="seedbook-page-indicator">UN CAPÍTULO CADA VEZ · LAS SEMILLAS NO SE PIERDEN</div>
          <h3 id="seedbook-rewrite-title">Elige qué recuerdo quieres volver a vivir</h3>
          <p className="seedbook-rewrite-note">Las estadísticas vuelven al momento de ese capítulo: Ventana al sendero empieza en 35. La nueva decisión sustituye la anterior; las demás siguen guardadas. Después puedes volver directamente al Jaguar con las estadísticas recalculadas.</p>
          <div className="seedbook-rewrite-list">
            {REWRITE_CHAPTERS.map(chapter => <button key={chapter.id} type="button" className="seedbook-rewrite-chapter" onClick={() => onRewriteChapter(chapter.id)}>
              <span className="seedbook-rewrite-heading"><strong>{chapter.title}</strong><small>{rewriteSummaries[chapter.id] ?? "Todavía no hay una decisión guardada."}</small></span>
              <span className="seedbook-rewrite-description">{chapter.description}</span>
              <span className="seedbook-rewrite-action">volver a vivir →</span>
            </button>)}
          </div>
        </section>}
        {view === "endings" && rewriteUnlocked && <section className="seedbook-endings-view" aria-labelledby="seedbook-endings-title">
          <div className="seedbook-page-indicator">RECUERDOS DEL JAGUAR</div>
          <h3 id="seedbook-endings-title">Finales encontrados</h3>
          <p className="seedbook-rewrite-note">Cada página muestra el arte del final que ya alcanzaste. Abrirla no vuelve a iniciar el encuentro.</p>
          <div className="seedbook-ending-list">
            {JAGUAR_ENDINGS.filter(ending => archivedEndingIds.includes(ending.id)).map(ending => <button key={ending.id} type="button" className="seedbook-ending-card" onClick={() => { setSelectedEndingId(ending.id); setView("ending"); }}>
              <img src={gameAssetUrl(ending.artwork)} alt="" aria-hidden="true" />
              <span><strong>{ending.title}</strong><small>{ending.summary}</small></span>
              <b aria-hidden="true">ver diapositiva →</b>
            </button>)}
          </div>
        </section>}
        {view === "ending" && selectedEnding && <article className="seedbook-ending-slide" aria-labelledby="seedbook-ending-title">
          <div className="seedbook-page-indicator">FINAL CONSEGUIDO</div>
          <img className="seedbook-ending-art" src={gameAssetUrl(selectedEnding.artwork)} alt={`Ilustración pixel art: ${selectedEnding.title}`} />
          <h3 id="seedbook-ending-title">{selectedEnding.title}</h3>
          <p>{selectedEnding.summary}</p>
          <button type="button" className="seedbook-ending-back" onClick={() => setView("endings")}>← volver al archivo de finales</button>
        </article>}
        </div>
        {view === "songs" && visibleSongs.length > 0 && !selectedIndexSongId && <nav className="seedbook-pagination" aria-label="Páginas del Libro de semillas">
          <button type="button" onClick={() => { setSelectedIndexSongId(null); setPageIndex(index => index - 1); }} disabled={pageIndex === 0}>← anterior</button>
          <button type="button" onClick={() => { setSelectedIndexSongId(null); setPageIndex(index => index + 1); }} disabled={pageIndex === visibleSongs.length - 1}>siguiente →</button>
        </nav>}
      </aside>
    </div>
  );
}
