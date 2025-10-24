import React from "react";
import { Button } from "../ui-fallbacks.jsx";
import AnimatedClip from "./AnimatedClip";

/* ---------- Small UI atoms ---------- */

function Gauge({ value = 0, max = 100, height = 6, className = "" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      className={`w-full rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800`}
      style={{ height }}
    >
      <div
        className={`h-full bg-emerald-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function UltGauge({ value = 0 }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full rounded-full overflow-hidden bg-slate-200/70 dark:bg-slate-800/70">
      <div
        className={`h-2 ${pct >= 100 ? "bg-fuchsia-500" : "bg-indigo-500"}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function StatusChips({ statuses = [] }) {
  if (!statuses || statuses.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {statuses.map((s, i) => (
        <span
          key={`${s.type}-${i}`}
          className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10 capitalize"
          title={JSON.stringify(s)}
        >
          {s.type}{s.turns ? ` (${s.turns})` : ""}
        </span>
      ))}
    </div>
  );
}

/* ---------- Panels ---------- */

function HPBar({ hp, max }) {
  return <Gauge value={hp} max={max} height={12} />;
}

function UnitRow({ u, i, inBattle }) {
  const slug =
    (u.id || u.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")) || `unit-${i}`;

  return (
    <div
      className={`p-2 rounded-lg ${u.alive ? "" : "opacity-50"} bg-slate-100/60 dark:bg-slate-900/40`}
    >
      <div className="flex items-stretch justify-between gap-2">
        {/* Left: avatar/info */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="text-2xl shrink-0">{u.emoji}</div>
          <div className="min-w-0">
            <div className="font-semibold truncate">{u.name}</div>
            <div className="text-[10px] opacity-70 capitalize">{u.element}</div>
            <StatusChips statuses={u.statuses} />
          </div>
        </div>

        {/* Right: gauges & clip */}
        <div className="w-48 flex flex-col gap-1 items-end">
          {/* Render the clip only during battle and while alive to avoid unnecessary work */}
          {inBattle && u.alive ? (
            <AnimatedClip id={slug} type="attack" width={120} height={120} />
          ) : null}
          <div className="w-full">
            <HPBar hp={u.hp} max={u.hpMax} />
            <div className="mt-1">
              <UltGauge value={u.ult} />
            </div>
            <div className="text-[10px] opacity-70 mt-1 flex items-center justify-between">
              <span>ULT: {u.ult}%</span>
              <span>SH: {u.shield}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SquadPanel({ title, arr, inBattle }) {
  return (
    <div className="p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
      <div className="font-semibold mb-2">{title}</div>
      <div className="space-y-2">
        {arr.map((u, i) => (
          <UnitRow key={i} u={u} i={i} inBattle={inBattle} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Main ---------- */

export default function Battle({
  team,
  enemy,
  inBattle,
  startBattle,
  turnQueue,
  setInBattle,
  battleLog,
}) {
  return (
    <div>
      {!inBattle ? (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm opacity-80 mb-2">Your Team ({team.length}/3):</div>
            <div className="flex flex-wrap gap-2">
              {team.map((u, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10"
                >
                  {u.name}
                </span>
              ))}
            </div>
            <div className="text-[11px] opacity-70 mt-2">
              Tip: Winning battles awards 💎 you can spend on summons.
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={() => startBattle(1)} disabled={team.length === 0}>
              Start (Normal)
            </Button>
            <Button
              variant="secondary"
              onClick={() => startBattle(1.6)}
              disabled={team.length === 0}
            >
              Start (Elite)
            </Button>
          </div>
        </div>
      ) : (
        <div>
          {/* Squads */}
          <div className="grid md:grid-cols-2 gap-3">
            <SquadPanel title="Your Squad" arr={team} inBattle={inBattle} />
            <SquadPanel title="Enemy Squad" arr={enemy} inBattle={inBattle} />
          </div>

          {/* Turn order + controls */}
          <div className="mt-4 p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm opacity-80">Turn order (next up):</div>
              <Button variant="secondary" onClick={() => setInBattle(false)}>
                Retreat
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap">
              {turnQueue.slice(0, 8).map((t, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10 text-xs"
                  title={`SPD-driven order • ${t.unit.name}`}
                >
                  {t.side === "player" ? "🟦" : "🟥"} {t.unit.name} · U{t.unit.ult}%
                </span>
              ))}
            </div>
            <div className="mt-3 text-sm opacity-70">
              Combat advances automatically. Ultimates fire at 100%.
            </div>
          </div>

          {/* Log */}
          <div className="mt-4 p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 max-h-64 overflow-auto">
            <div className="font-semibold mb-2">Battle Log</div>
            <div className="space-y-1 text-sm leading-relaxed">
              {battleLog.map((l, i) => (
                <div key={i}>• {l}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
