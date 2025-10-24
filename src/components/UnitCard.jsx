import React from "react";
import Portrait from "./Portrait";
import UnitBadge from "./UnitBadge";
import AnimatedClip from "./AnimatedClip";
import { Button } from "../ui-fallbacks.jsx";

export default function UnitCard({ unit, onAdd, inTeam }) {
  const slug =
    unit.id || unit.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  return (
    <div className="p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
      <div className="flex items-center justify-between">
        <div className="font-semibold">{unit.name}</div>
        <UnitBadge u={unit} />
      </div>

      <div className="mt-2 grid grid-cols-[auto,1fr] gap-3 items-center">
        <Portrait id={slug} glyph={unit.portrait || unit.emoji} rarity={unit.rarity} size={88} />
        <div className="relative">
          <AnimatedClip id={slug} type="idle" width={220} height={220} />
          {/* faint fallback mark so the card never looks empty */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="text-5xl opacity-20">{unit.emoji}</span>
          </div>
        </div>
      </div>

      <p className="text-xs opacity-70 mt-1">{unit.lore}</p>
      <div className="mt-2 flex flex-wrap gap-1 text-xs">
        {unit.skills.map((s) => (
          <span key={s} className="px-2 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10">
            {s}
          </span>
        ))}
      </div>

      <div className="mt-2">
        <Button size="sm" variant={inTeam ? "destructive" : "secondary"} onClick={onAdd}>
          {inTeam ? "Remove" : "Add to Team"}
        </Button>
      </div>
    </div>
  );
}
