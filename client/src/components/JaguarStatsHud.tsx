import type { JaguarStats } from "./jaguarRules";

export const STAT_LABELS: Record<keyof JaguarStats, string> = {
  cautela: "Cautela",
  empatia: "Empatía",
  ingenio: "Ingenio",
  valentia: "Valentía",
};

type JaguarStatsHudProps = {
  stats: JaguarStats;
  className?: string;
};

export function JaguarStatsHud({ stats, className = "" }: JaguarStatsHudProps) {
  return (
    <aside className={`jaguar-player-stats${className ? ` ${className}` : ""}`} aria-label="Estado actual del limón">
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
