import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, CardHeader, CardTitle, CardContent } from "../ui-fallbacks.jsx";
import { BANNERS, RarityWeightsBase } from "../game/data";
import { useNavigate } from "react-router-dom";

const rarityGlow = (r) =>
  (RarityWeightsBase.find((w) => w.r === r) || {}).glow || "from-slate-300 via-slate-200 to-slate-100";

export default function SummonGate({
  currency,
  setCurrency,
  bannerId,
  setBannerId,
  onSummon,
  lastPulls = [],
}) {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [summoning, setSummoning] = useState(false);
  const [earned, setEarned] = useState(false);

  const activeBanner = BANNERS.find((b) => b.id === bannerId) || BANNERS[0];

  // daily bonus
  useEffect(() => {
    const key = "ab_daily";
    const today = new Date().toDateString();
    const last = localStorage.getItem(key);
    if (last !== today) {
      setCurrency((c) => c + 150);
      localStorage.setItem(key, today);
    }
  }, [setCurrency]);

  async function doSummon() {
    if (summoning) return;
    if (currency < 100) {
      alert("Not enough 💎 to summon. Earn more by exploring Story or winning Battles.");
      navigate("/story");
      return;
    }
    setSummoning(true);
    setRevealed(false);
    setResults([]);

    await new Promise((r) => setTimeout(r, 550)); // portal flash
    const pulls = await onSummon();
    if (!pulls) { setSummoning(false); return; }
    setResults(pulls);
    await new Promise((r) => setTimeout(r, 700));
    setRevealed(true);
    setSummoning(false);
  }

  function exploreEarn() {
    if (earned) return;
    setCurrency((c) => c + 100);
    setEarned(true);
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Summoning Gate: {activeBanner.name}</span>
          <span className="text-xs opacity-80">💎 {currency}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-[1.4fr_1fr] gap-4">
          {/* GATE VISUAL */}
          <motion.div
            className="relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700 min-h-56 md:min-h-64"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img
              src={`/portraits/gate_${activeBanner.id}.png`}
              alt={`${activeBanner.name} Gate`}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
            {summoning && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-fuchsia-600/50 via-indigo-600/40 to-emerald-600/50 flex items-center justify-center backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <motion.div
                  className="text-3xl font-black text-white drop-shadow"
                  animate={{ scale: [1, 1.1, 1], rotate: [0, 1.5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.1 }}
                >
                  Opening Gate…
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* CONTROLS */}
          <div className="flex flex-col gap-3">
            <select
              value={bannerId}
              onChange={(e) => setBannerId(e.target.value)}
              className="w-full rounded-xl border border-slate-600 bg-slate-900/70 text-slate-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
            >
              {BANNERS.map((b) => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-slate-100">
                  {b.name}
                </option>
              ))}
            </select>

            <div className="text-xs opacity-80 -mt-1">{activeBanner.desc}</div>

            <Button className="text-white bg-fuchsia-600 hover:bg-fuchsia-500" onClick={doSummon} disabled={summoning}>
              Summon (💎 100)
            </Button>

            <Button variant="secondary" onClick={exploreEarn} disabled={earned}>
              Explore World (+100 💎)
            </Button>

            <div className="text-xs opacity-70">
              Rates — {activeBanner.rates.map((r) => `${r.r}:${Math.round(r.p * 100)}%`).join(" • ")}
            </div>
          </div>
        </div>

        {/* RESULTS */}
        <AnimatePresence>
          {revealed && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-5"
            >
              {results.map((u, i) => (
                <motion.div
                  key={u.rollId}
                  className="relative p-3 rounded-xl border bg-slate-50/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${rarityGlow(u.rarity)}`} />
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">{u.name}</div>
                    <div className="text-xs opacity-70">{u.rarity}</div>
                  </div>
                  <div className="mt-2 flex items-center justify-center">
                    <img
                      src={`/portraits/${u.id}.png`}
                      alt={u.name}
                      className="w-24 h-24 object-contain drop-shadow"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  </div>
                  <div className="text-2xl text-center mt-1">{u.emoji}</div>
                  <div className="text-[11px] opacity-70 text-center">{u.lore}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
