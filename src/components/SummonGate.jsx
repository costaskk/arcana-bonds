import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Card, CardHeader, CardTitle, CardContent } from "../ui-fallbacks.jsx";
import { BANNERS, RarityWeightsBase } from "../game/data";

// Utility
const rarityGlow = (r) =>
  (RarityWeightsBase.find((w) => w.r === r) || {}).glow ||
  "from-slate-300 via-slate-200 to-slate-100";

export default function SummonGate({
  currency,
  setCurrency,
  bannerId,
  setBannerId,
  onSummon,
  lastPulls,
}) {
  const [results, setResults] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const [summoning, setSummoning] = useState(false);

  const banners = BANNERS;
  const activeBanner = banners.find((b) => b.id === bannerId) || banners[0];

  async function doSummon() {
    if (currency < 100 || summoning) return;
    setSummoning(true);
    setRevealed(false);
    setResults([]);
    // cinematic flash
    await new Promise((r) => setTimeout(r, 800));
    const pulls = await onSummon();
    setResults(pulls);
    await new Promise((r) => setTimeout(r, 1000));
    setRevealed(true);
    setSummoning(false);
  }

  // Handle earning currency (simple demo system)
  const [earned, setEarned] = useState(false);
  function earnCurrency() {
    if (earned) return;
    setCurrency((c) => c + 100);
    setEarned(true);
    alert("You earned 100 💎 for exploring the world!");
  }

  useEffect(() => {
    const dailyKey = "arcana_daily";
    const last = localStorage.getItem(dailyKey);
    const today = new Date().toDateString();
    if (last !== today) {
      setCurrency((c) => c + 150);
      localStorage.setItem(dailyKey, today);
      alert("Daily login bonus: +150 💎");
    }
  }, []);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Summoning Gate: {activeBanner.name}</span>
          <span className="text-xs opacity-80">💎 {currency}</span>
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Gate Visual */}
          <motion.div
            className="flex-1 relative rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-700"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <img
              src={`/portraits/gate_${activeBanner.id}.png`}
              alt="Summon Gate"
              className="w-full h-64 object-cover"
            />
            {summoning && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center bg-fuchsia-500/40 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div
                  className="text-3xl font-bold text-white"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  Summoning...
                </motion.div>
              </motion.div>
            )}
          </motion.div>

          {/* Banner select + summon button */}
          <div className="flex flex-col justify-between gap-3 flex-1">
            <select
              value={bannerId}
              onChange={(e) => setBannerId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
            >
              {banners.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            <Button
              className="text-white bg-fuchsia-600 hover:bg-fuchsia-500 w-full"
              onClick={doSummon}
              disabled={summoning || currency < 100}
            >
              Summon (💎100)
            </Button>

            <Button
              variant="secondary"
              className="w-full"
              onClick={earnCurrency}
              disabled={earned}
            >
              Explore World (+100 💎)
            </Button>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {revealed && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mt-4"
            >
              {results.map((u, i) => (
                <motion.div
                  key={u.rollId}
                  className="relative p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-sm"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <div
                    className={`h-1 rounded-full bg-gradient-to-r ${rarityGlow(u.rarity)}`}
                  />
                  <motion.img
                    src={`/portraits/${u.id}.png`}
                    alt={u.name}
                    className="w-full h-32 object-contain mt-2"
                    whileHover={{ scale: 1.1 }}
                  />
                  <div className="mt-2 font-semibold text-center">{u.name}</div>
                  <div className="text-xs opacity-70 text-center">{u.rarity}-Rank</div>
                  <div className="text-center text-2xl mt-1">{u.emoji}</div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
