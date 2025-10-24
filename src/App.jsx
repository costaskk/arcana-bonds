import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Progress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Input,
} from "./ui-fallbacks.jsx";
import { Sparkles, Sword, Shield, Flame, Droplet, Leaf } from "lucide-react";

/* ============================================================================
   ARCANA BONDS — GACHA RPG PROTOTYPE
   ============================================================================ */

export default function GameApp() {
  const [tab, setTab] = useState("summon");
  const [summonAnimation, setSummonAnimation] = useState(false);
  const [pulledUnits, setPulledUnits] = useState([]);
  const [roster, setRoster] = useState([]);
  const [battleLog, setBattleLog] = useState([]);
  const [storyStep, setStoryStep] = useState(0);

  const units = useMemo(
    () => [
      { name: "Astra", element: "Fire", rarity: 5, power: 230 },
      { name: "Veyra", element: "Water", rarity: 4, power: 180 },
      { name: "Kael", element: "Leaf", rarity: 3, power: 140 },
      { name: "Dravon", element: "Dark", rarity: 5, power: 240 },
      { name: "Liora", element: "Light", rarity: 4, power: 190 },
    ],
    []
  );

  // -------------------------------
  // Summoning Logic
  // -------------------------------
  const summon = () => {
    setSummonAnimation(true);
    setTimeout(() => {
      const pulled = Array.from({ length: 10 }, () => {
        const roll = Math.random();
        if (roll > 0.95) return units[0];
        if (roll > 0.8) return units[1];
        if (roll > 0.6) return units[2];
        if (roll > 0.4) return units[3];
        return units[4];
      });
      setPulledUnits(pulled);
      setRoster((prev) => [...prev, ...pulled]);
      setSummonAnimation(false);
    }, 2000);
  };

  // -------------------------------
  // Battle Logic (simplified demo)
  // -------------------------------
  const startBattle = () => {
    const log = [];
    let playerPower = roster.reduce((a, b) => a + b.power, 0);
    let enemyPower = 600;
    while (playerPower > 0 && enemyPower > 0) {
      const dmg = Math.floor(Math.random() * 100);
      enemyPower -= dmg;
      log.push(`You strike for ${dmg} damage!`);
      if (enemyPower <= 0) break;
      const edmg = Math.floor(Math.random() * 80);
      playerPower -= edmg;
      log.push(`Enemy hits for ${edmg} damage!`);
    }
    log.push(playerPower > 0 ? "Victory!" : "Defeat...");
    setBattleLog(log);
  };

  // -------------------------------
  // Story progression
  // -------------------------------
  const story = [
    { text: "You awaken in the ruins of Elaria, the Arcana still pulsing faintly.", next: 1 },
    { text: "A strange whisper calls you toward the crystal altar.", next: 2 },
    { text: "A bond is forged. Your first companion joins your journey.", next: 3 },
    { text: "Your legend begins...", next: null },
  ];

  const advanceStory = () => {
    if (story[storyStep].next !== null) setStoryStep(story[storyStep].next);
  };

  const elementIcon = (el) => {
    switch (el) {
      case "Fire":
        return <Flame className="inline w-4 h-4 text-rose-500" />;
      case "Water":
        return <Droplet className="inline w-4 h-4 text-blue-500" />;
      case "Leaf":
        return <Leaf className="inline w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="inline w-4 h-4 text-amber-500" />;
    }
  };

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-center tracking-widest">
          ✦ Arcana Bonds ✦
        </h1>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex justify-center gap-2 mb-6">
            <TabsTrigger value="summon" onClick={() => setTab("summon")}>Summon</TabsTrigger>
            <TabsTrigger value="roster" onClick={() => setTab("roster")}>Roster</TabsTrigger>
            <TabsTrigger value="battle" onClick={() => setTab("battle")}>Battle</TabsTrigger>
            <TabsTrigger value="story" onClick={() => setTab("story")}>Story</TabsTrigger>
          </TabsList>

          {/* Summon Tab */}
          <TabsContent value="summon">
            <Card className="text-center">
              <CardHeader>
                <CardTitle>Summon Portal</CardTitle>
              </CardHeader>
              <CardContent>
                {!summonAnimation && (
                  <Button onClick={summon} className="mb-4">Summon x10</Button>
                )}
                <AnimatePresence>
                  {summonAnimation && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-6 text-lg text-emerald-400"
                    >
                      ✨ Summoning... ✨
                    </motion.div>
                  )}
                </AnimatePresence>
                {pulledUnits.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                    {pulledUnits.map((u, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2 rounded-xl border border-white/20 bg-white/10"
                      >
                        <div className="text-sm font-semibold">{u.name}</div>
                        <div>{elementIcon(u.element)}</div>
                        <Badge className="text-xs mt-1">{u.rarity}★</Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Roster Tab */}
          <TabsContent value="roster">
            <Card>
              <CardHeader>
                <CardTitle>Your Units</CardTitle>
              </CardHeader>
              <CardContent>
                {roster.length === 0 ? (
                  <p className="text-slate-400">No units yet — try summoning!</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {roster.map((u, i) => (
                      <div
                        key={i}
                        className="p-2 border border-slate-700 rounded-lg bg-slate-800/40"
                      >
                        <div className="font-semibold">{u.name}</div>
                        <div>{elementIcon(u.element)}</div>
                        <Badge className="text-xs">{u.rarity}★</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Battle Tab */}
          <TabsContent value="battle">
            <Card>
              <CardHeader>
                <CardTitle>Battle Simulation</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={startBattle} className="mb-4">Start Battle</Button>
                <div className="h-48 overflow-y-auto space-y-1 text-sm text-slate-300">
                  {battleLog.map((line, i) => (
                    <div key={i}>{line}</div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Story Tab */}
          <TabsContent value="story">
            <Card>
              <CardHeader>
                <CardTitle>Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{story[storyStep].text}</p>
                {story[storyStep].next !== null ? (
                  <Button onClick={advanceStory}>Continue</Button>
                ) : (
                  <p className="text-emerald-400">End of prologue.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
