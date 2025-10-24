import React from "react";
import { Button } from "../ui-fallbacks.jsx";
import AnimatedClip from "./AnimatedClip";

function HPBar({ hp, max }) {
  const pct = Math.max(0, Math.min(100, (hp / max) * 100));
  return (
    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-xl h-3 overflow-hidden">
      <div className="h-3 bg-emerald-500" style={{ width: `${pct}%` }} />
    </div>
  );
}

function SquadPanel({ title, arr }) {
  return (
    <div className="p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
      <div className="font-semibold mb-2">{title}</div>
      <div className="space-y-2">
        {arr.map((u, i) => {
          const slug =
            (u.id || u.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")) || `unit-${i}`;
          return (
            <div
              key={i}
              className={`p-2 rounded-lg ${u.alive ? "" : "opacity-50"} bg-slate-100/60 dark:bg-slate-900/40`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">{u.emoji}</div>
                  <div>
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-[10px] opacity-70 capitalize">{u.element}</div>
                  </div>
                </div>
                <div className="w-44 flex flex-col items-end">
                  <AnimatedClip id={slug} type="attack" width={120} height={120} />
                  <div className="w-full">
                    <HPBar hp={u.hp} max={u.hpMax} />
                    <div className="text-[10px] opacity-70 mt-1">ULT: {u.ult}% | SH: {u.shield}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Battle({ team, enemy, inBattle, startBattle, turnQueue, setInBattle, battleLog }) {
  return (
    <div>
      {!inBattle ? (
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm opacity-80 mb-2">Your Team ({team.length}/3):</div>
            <div className="flex flex-wrap gap-2">
              {team.map((u, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10">
                  {u.name}
                </span>
              ))}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button onClick={() => startBattle(1)} disabled={team.length === 0}>
              Start (Normal)
            </Button>
            <Button variant="secondary" onClick={() => startBattle(1.6)} disabled={team.length === 0}>
              Start (Elite)
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid md:grid-cols-2 gap-3">
            <SquadPanel title="Your Squad" arr={team} />
            <SquadPanel title="Enemy Squad" arr={enemy} />
          </div>

          <div className="mt-4 p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
            <div className="text-sm opacity-80 mb-1">Turn order (next up):</div>
            <div className="flex gap-2 flex-wrap">
              {turnQueue.slice(0, 6).map((t, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10">
                  {t.side === "player" ? "🟦" : "🟥"} {t.unit.name}
                </span>
              ))}
            </div>
            <div className="mt-3 flex justify-end">
              <Button variant="secondary" onClick={() => setInBattle(false)}>
                Retreat
              </Button>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 max-h-64 overflow-auto">
            <div className="font-semibold mb-2">Battle Log</div>
            <div className="space-y-1 text-sm">
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
