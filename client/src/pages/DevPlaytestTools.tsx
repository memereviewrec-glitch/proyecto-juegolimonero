import type { ChangeEvent } from "react";

export type DevFriendPreview = "saved" | "friend" | "not-friend";

type SceneOption = { id: string; number: string; title: string };

type Props = {
  scenes: readonly SceneOption[];
  selectedScene: string;
  onSceneChange: (scene: string) => void;
  onJump: () => void;
  jumpDisabled: boolean;
  friendPreview: DevFriendPreview;
  onFriendPreviewChange: (preview: DevFriendPreview) => void;
};

export function DevPlaytestTools({ scenes, selectedScene, onSceneChange, onJump, jumpDisabled, friendPreview, onFriendPreviewChange }: Props) {
  const handleFriendChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onFriendPreviewChange(event.target.value as DevFriendPreview);
  };

  return (
    <aside className="dev-playtest-tools" aria-label="Herramientas de pruebas de desarrollo">
      <strong className="dev-playtest-title">Pruebas · solo desarrollo</strong>
      <p className="dev-playtest-help">El salto no cambia el progreso guardado.</p>
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
      </div>
    </aside>
  );
}
