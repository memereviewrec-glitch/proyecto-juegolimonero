import type { JaguarStats } from "./jaguarRules";

export const STAT_LABELS: Record<keyof JaguarStats, string> = {
  cautela: "Cautela",
  empatia: "Empatía",
  ingenio: "Ingenio",
  valentia: "Valentía",
};

type JaguarStatsHudProps = {
  stats: JaguarStats;
  gainNotice?: { id: number; gains: Partial<JaguarStats> } | null;
  className?: string;
};

export function JaguarStatsHud({ stats, gainNotice = null, className = "" }: JaguarStatsHudProps) {
  return (
    <aside className={`jaguar-player-stats${className ? ` ${className}` : ""}`} aria-label="Estado actual del limón">
      {gainNotice && <div key={gainNotice.id} className="stat-gain-message" role="status" aria-live="polite" aria-atomic="true">
        <strong>¡Sumas puntos!</strong>
        {(Object.keys(STAT_LABELS) as (keyof JaguarStats)[]).filter(stat => (gainNotice.gains[stat] ?? 0) > 0).map(stat => (
          <span key={stat}>{STAT_LABELS[stat]} +{gainNotice.gains[stat]}</span>
        ))}
      </div>}
      <section className="jaguar-stats" aria-label="Barras de porcentaje de los cuatro rasgos">
        {(Object.keys(STAT_LABELS) as (keyof JaguarStats)[]).map(stat => (
          <div key={stat} className={`jaguar-stat jaguar-stat-${stat}`}>
            <div><span>{STAT_LABELS[stat]}</span><strong>{stats[stat]}%</strong></div>
            <div className="jaguar-stat-meter" role="progressbar" aria-label={STAT_LABELS[stat]} aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats[stat]}><i style={{ width: `${stats[stat]}%` }} /></div>
          </div>
        ))}
      </section>
    </aside>
  );
}
