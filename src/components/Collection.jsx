import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui-fallbacks.jsx";
import { BASE_UNITS, RarityWeightsBase } from "../game/data";

const glow = (r) =>
  (RarityWeightsBase.find((w) => w.r === r) || {}).glow || "from-slate-300 via-slate-200 to-slate-100";

export default function Collection({ inventory }) {
  const ownedIds = useMemo(() => new Set(inventory.map((u) => u.id)), [inventory]);
  const all = BASE_UNITS;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Collection</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {all.map((u) => {
            const owned = ownedIds.has(u.id);
            return (
              <div key={u.id} className={`p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 ${owned ? "" : "opacity-60"}`}>
                <div className={`h-1 rounded-full bg-gradient-to-r ${glow(u.rarity)}`} />
                <div className="mt-2 font-semibold text-center">{u.name}</div>
                <div className="flex items-center justify-center mt-1">
                  <img src={`/portraits/${u.id}.png`} onError={(e) => (e.currentTarget.style.display = "none")} className="w-20 h-20 object-contain" />
                </div>
                <div className="text-xs text-center mt-1">{u.rarity}-Rank • {u.element}</div>
                <div className={`text-[11px] text-center mt-1 ${owned ? "text-emerald-500" : "text-slate-400"}`}>
                  {owned ? "Owned" : "Missing"}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
