import React, { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "../ui-fallbacks.jsx";
import Particles from "./Particles";
import { BANNERS } from "../game/data";

export default function SummonGate({ currency, setCurrency, bannerId, setBannerId, onSummon }) {
  const [summoning, setSummoning] = useState(false);
  const banner = BANNERS.find((b) => b.id === bannerId) || BANNERS[0];

  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap">
        <select
          className="px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800"
          value={bannerId}
          onChange={(e) => setBannerId(e.target.value)}
        >
          {BANNERS.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        <div className="text-xs opacity-70">{banner.desc}</div>
      </div>

      <div className="relative mt-3 h-56 md:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-emerald-500 flex items-center justify-center">
        <Particles show={summoning} dense={120} />
        {!summoning ? (
          <div className="text-center text-white">
            <div className="text-2xl font-bold drop-shadow">Tap to Summon</div>
            <div className="text-white/80 text-sm">10× pull • pity guaranteed • Cost 100</div>
          </div>
        ) : (
          <div className="text-center text-white text-3xl font-black drop-shadow flex items-center gap-2">
            <Sparkles /> OPENING GATE...
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 mt-4">
        <Button
          disabled={summoning || currency < 100}
          onClick={async () => {
            setSummoning(true);
            await onSummon();
            setSummoning(false);
          }}
        >
          {summoning ? "Summoning..." : `Summon 10× (${currency >= 100 ? "100" : "Need 100"})`}
        </Button>
        <div className="text-xs opacity-70">
          Rates — {banner.rates.map((r) => `${r.r}:${Math.round(r.p * 100)}%`).join(" • ")}
        </div>
      </div>
    </div>
  );
}
