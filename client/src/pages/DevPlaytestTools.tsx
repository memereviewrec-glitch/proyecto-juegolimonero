import type { ChangeEvent } from "react";
import type { HummingbirdPreviewAlternatives } from "../components/HummingbirdScene";

export type DevFriendPreview = "saved" | "friend" | "not-friend";
export type DevHummingbirdDialoguePreview = "current" | "draft";

export const HUMMINGBIRD_DRAFT_ALTERNATIVES: HummingbirdPreviewAlternatives = [
  [
    "También me da miedo no tener un hogar. Si quieres, demos juntos el primer paso para buscar un refugio.",
    "No sé qué encontraremos más allá de las cenizas, pero no quiero que afrontes esa incertidumbre solo. Puedo acompañarte cuando estés listo.",
  ],
  [
    "El cielo puede dar miedo sin ser nuestro enemigo. Tú eliges el rumbo; yo puedo seguir por el sendero y encontrarte más adelante.",
    "No tenemos un mapa, pero podemos pedir ayuda. Buscaré a los otros animales contigo, aunque todavía no sepamos dónde termina este camino.",
  ],
  [
    "El incendio no fue tu culpa. Volver con agua pese al miedo fue valiente; si quieres ayudar otra vez, esta vez busquemos compañía.",
    "No podemos cambiar lo que ardió, pero sí decidir cómo cuidar lo que queda. Me atrevo a intentarlo contigo, sin exigirte que puedas con todo.",
  ],
  [
    "A veces pedir ayuda cuesta más que seguir solo. Si quieres, busquemos a los demás y compartamos ese peso sin fingir que no duele.",
    "No necesitas demostrar que eres invencible. Podemos volver a cuidar de los que quedan, y detenernos si el miedo o el cansancio nos alcanzan.",
  ],
  [
    "No dejaré que una burla decida cuánto vale tu esfuerzo. Podemos poner distancia sin devolver daño y seguir buscando a quienes necesiten ayuda.",
    "También asusta defender lo que uno hizo. Si quieres decirle que te hirió, te acompañaré; si prefieres alejarte, respetaré tu decisión.",
  ],
  [
    "No puedo prometerte un camino seguro, pero sí compañía para buscarlo. Demos un paso juntos, si eso es lo que quieres.",
    "Si necesitas seguir tu propio rumbo, lo respetaré. Despedirnos también puede requerir valor; no hace falta herirnos para elegir caminos distintos.",
  ],
];

type SceneOption = { id: string; number: string; title: string };

type Props = {
  scenes: readonly SceneOption[];
  selectedScene: string;
  onSceneChange: (scene: string) => void;
  onJump: () => void;
  jumpDisabled: boolean;
  friendPreview: DevFriendPreview;
  onFriendPreviewChange: (preview: DevFriendPreview) => void;
  hummingbirdDialoguePreview: DevHummingbirdDialoguePreview;
  onHummingbirdDialoguePreviewChange: (preview: DevHummingbirdDialoguePreview) => void;
};

export function DevPlaytestTools({ scenes, selectedScene, onSceneChange, onJump, jumpDisabled, friendPreview, onFriendPreviewChange, hummingbirdDialoguePreview, onHummingbirdDialoguePreviewChange }: Props) {
  const handleFriendChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onFriendPreviewChange(event.target.value as DevFriendPreview);
  };
  const handleHummingbirdDialogueChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onHummingbirdDialoguePreviewChange(event.target.value as DevHummingbirdDialoguePreview);
  };

  return (
    <aside className="dev-playtest-tools" aria-label="Herramientas de pruebas de desarrollo">
      <strong className="dev-playtest-title">Pruebas · solo desarrollo</strong>
      <p className="dev-playtest-help">El salto no cambia el progreso guardado. El borrador del colibrí tampoco da puntos.</p>
      <div className="dev-playtest-controls">
        <label>
          <span>Escena</span>
          <select value={selectedScene} onChange={event => onSceneChange(event.target.value)}>
            {scenes.map(scene => <option key={scene.id} value={scene.id}>{scene.number} · {scene.title}</option>)}
          </select>
        </label>
        <button type="button" onClick={onJump} disabled={jumpDisabled} title={jumpDisabled ? "Espera a que termine el tránsito del portal." : undefined}>Saltar a escena</button>
        <label>
          <span>Colibrí en Nueve sentidos</span>
          <select value={friendPreview} onChange={handleFriendChange}>
            <option value="saved">Según partida guardada</option>
            <option value="friend">Forzar amigo</option>
            <option value="not-friend">Forzar sin amistad</option>
          </select>
        </label>
        <label>
          <span>Diálogo del colibrí</span>
          <select value={hummingbirdDialoguePreview} onChange={handleHummingbirdDialogueChange}>
            <option value="current">Diálogo actual del juego</option>
            <option value="draft">Borrador valiente · sin puntuación</option>
          </select>
        </label>
      </div>
    </aside>
  );
}
