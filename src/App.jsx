import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Swords, Map as MapIcon, Coins, BookOpen } from "lucide-react";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "./ui-fallbacks.jsx";

import { BASE_UNITS, BANNERS, RarityWeightsBase, STORY_NODES, ULTS } from "./game/data";
import { clamp, rand, pick, chance, effectiveStat, endOfTurn, performSkill, performUlt } from "./game/combat";
import { save, load } from "./game/persist";

import Cinematic from "./components/Cinematic";
import SummonGate from "./components/SummonGate";
import Roster from "./components/Roster";
import Battle from "./components/Battle";
import StoryMap from "./components/StoryMap";
import AnimatedClip from "./components/AnimatedClip";

export default function App() {
  const [tab, setTab] = useState(load("tab", "home"));

  // collections
  const [inventory, setInventory] = useState(load("inventory", []));
  const [team, setTeam] = useState(load("team", []));

  // battle
  const [battleLog, setBattleLog] = useState([]);
  const [turnQueue, setTurnQueue] = useState([]);
  const [inBattle, setInBattle] = useState(false);
  const [enemy, setEnemy] = useState([]);

  // gacha
  const [bannerId, setBannerId] = useState(load("banner", "standard"));
  const [lastPulls, setLastPulls] = useState([]);

  // story & currency
  const [nodeId, setNodeId] = useState(load("nodeId", "start"));
  const [currency, setCurrency] = useState(load("shards", 300));

  // cinematics / ults
  const [cinematic, setCinematic] = useState(null);
  const [ultingId, setUltingId] = useState(null);

  // seed a starter
  useEffect(() => {
    if (inventory.length === 0) setInventory([pick(BASE_UNITS)]);
  }, []);

  // persist
  useEffect(() => save("inventory", inventory), [inventory]);
  useEffect(() => save("team", team), [team]);
  useEffect(() => save("tab", tab), [tab]);
  useEffect(() => save("banner", bannerId), [bannerId]);
  useEffect(() => save("nodeId", nodeId), [nodeId]);
  useEffect(() => save("shards", currency), [currency]);

  // gacha helpers
  const poolByRarity = (r) => BASE_UNITS.filter((u) => u.rarity === r);
  const rollRarity = () => {
    const rates = (BANNERS.find((b) => b.id === bannerId) || BANNERS[0]).rates;
    const x = Math.random();
    let acc = 0;
    for (const t of rates) {
      acc += t.p;
      if (x <= acc) return t.r;
    }
    return "B";
  };
  const summonOne = () => {
    const r = rollRarity();
    let pool = poolByRarity(r);
    const banner = BANNERS.find((b) => b.id === bannerId) || BANNERS[0];
    if (banner.featured.length && chance(0.5)) {
      const f = pool.filter((u) => banner.featured.includes(u.id));
      if (f.length) pool = [...f, ...pool];
    }
    const unit = pick(pool);
    return { ...unit, rollId: `${unit.id}-${Math.random().toString(36).slice(2)}` };
  };
  const summonTen = () => {
    let pulls = Array.from({ length: 10 }, () => summonOne());
    if (!pulls.some((u) => ["A", "S", "SS"].includes(u.rarity))) {
      const a = poolByRarity("A");
      pulls[9] = { ...pick(a), rollId: `pity-${Math.random().toString(36).slice(2)}` };
    }
    return pulls;
  };
  async function handleSummon() {
    if (currency < 100) return [];
    setCurrency((c) => c - 100);
    const pulls = summonTen();
    setInventory((p) => [...p, ...pulls]);
    setLastPulls(pulls);
    return pulls;
  }

  // team management
  const toggleTeam = (u) =>
    setTeam((prev) => {
      const exists = prev.find((x) => (x.rollId || x.id) === (u.rollId || u.id));
      if (exists) return prev.filter((x) => (x.rollId || x.id) !== (u.rollId || u.id));
      if (prev.length >= 3) return prev;
      return [...prev, u];
    });

  // combat setup
  function buildCombatant(base) {
    const hpMax = Math.floor(base.stats.hp);
    return {
      id: base.id, // keep id for animation lookups
      name: base.name,
      element: base.element,
      rarity: base.rarity,
      skills: base.skills,
      hpMax,
      hp: hpMax,
      atk: base.stats.atk,
      def: base.stats.def,
      spd: base.stats.spd,
      shield: 0,
      alive: true,
      statuses: [],
      ult: 0,
      emoji: base.emoji,
    };
  }

  const startBattle = (power = 1) => {
    if (team.length === 0) return;
    const e = Array.from({ length: 3 }, () => ({ ...pick(BASE_UNITS) }));
    const scaled = e.map((u) => ({
      ...u,
      stats: { hp: u.stats.hp * power, atk: u.stats.atk * power, def: u.stats.def * power, spd: u.stats.spd },
    }));
    const enemyBuilt = scaled.map(buildCombatant);
    const teamBuilt = team.map(buildCombatant);
    setEnemy(enemyBuilt);
    setTeam(teamBuilt);
    setBattleLog(["A hostile squad approaches!"]);

    const q = [
      ...teamBuilt.map((x) => ({ side: "player", unit: x })),
      ...enemyBuilt.map((x) => ({ side: "enemy", unit: x })),
    ].sort((a, b) => effectiveStat(b.unit, "spd") - effectiveStat(a.unit, "spd"));
    setTurnQueue(q);
    setInBattle(true);
  };

  const isWiped = (arr) => arr.every((x) => !x.alive);

  function takeTurn() {
    setTurnQueue((q) => {
      if (!inBattle || q.length === 0) return q;
      const [cur, ...rest] = q;
      const actor = cur.unit;
      if (!actor.alive) return rest;

      const foes = cur.side === "player" ? enemy : team;

      const hasUltCfg = !!ULTS[actor.name];
      if (actor.statuses.some((s) => s.type === "stun")) {
        setBattleLog((l) => [`${actor.name} is stunned!`, ...l]);
      } else if (hasUltCfg && actor.ult >= 100) {
        // show cinematic + optional ult clip
        const ultCfg = ULTS[actor.name];
        const slug =
          (actor.id ||
            actor.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")) || "unit";
        setUltingId(slug);
        setCinematic({ title: ultCfg.name, subtitle: `${actor.name} unleashes an Ultimate!` });

        const affected = performUlt(actor, foes);
        setBattleLog((l) => [
          `${actor.name} used ${ultCfg.name}! ${affected.map((a) => `${a.name} -${a.dmg}`).join(", ")}`,
          ...l,
        ]);

        // close overlay shortly after
        setTimeout(() => {
          setCinematic(null);
          setUltingId(null);
        }, 900);
      } else {
        const skillName = pick(actor.skills);
        const affected = performSkill(actor, foes, skillName);
        setBattleLog((l) => [
          `${actor.name} used ${skillName}. ${affected
            .map((a) => `${a.name} -${a.dmg}${a.ap ? " +" + a.ap.type : ""}`)
            .join(", ")}`,
          ...l,
        ]);
      }

      [...team, ...enemy].forEach(endOfTurn);

      if (isWiped(enemy)) {
        setBattleLog((l) => ["Victory!", ...l]);
        setInBattle(false);
        return rest;
      }
      if (isWiped(team)) {
        setBattleLog((l) => ["Defeat...", ...l]);
        setInBattle(false);
        return rest;
      }

      const jitter = Math.max(1, Math.floor(effectiveStat(actor, "spd") + rand(-5, 5)));
      const newRest = [...rest, { side: cur.side, unit: actor, spd: jitter }].sort(
        (a, b) => effectiveStat(b.unit, "spd") - effectiveStat(a.unit, "spd")
      );
      return newRest;
    });
  }

  useEffect(() => {
    if (!inBattle) return;
    const t = setInterval(() => takeTurn(), 800);
    return () => clearInterval(t);
  }, [inBattle, team, enemy]);

  // story helpers
  const curNode = STORY_NODES[nodeId];
  function claimReward(rw) {
    if (!rw) return;
    if (rw.shards) setCurrency((c) => c + rw.shards);
    if (rw.heal)
      setTeam((t) =>
        t.map((u) => ({ ...u, hp: clamp(u.hp + Math.floor(u.hpMax * rw.heal), 0, u.hpMax) }))
      );
  }
  function enterNode(n) {
    if (n.type === "loot" || n.type === "camp") claimReward(n.reward);
    if (["battle", "elite", "boss"].includes(n.type)) startBattle(n.enemyPower);
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      {/* Cinematic overlay with optional ult video */}
      <Cinematic show={!!cinematic} title={cinematic?.title} subtitle={cinematic?.subtitle}>
        {ultingId ? <AnimatedClip id={ultingId} type="ult" width={420} height={420} /> : null}
      </Cinematic>

      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ scale: 0.8, rotate: -6 }}
              animate={{ scale: 1, rotate: 0 }}
              className="p-2 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-emerald-400 text-white shadow-lg"
            >
              <Sparkles />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Arcana Bonds</h1>
              <p className="text-xs opacity-70">Gacha RPG • portraits • story • roster • persistence</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs opacity-80">
            <Coins className="w-4 h-4" /> {currency}
          </div>
        </header>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="home" onClick={() => setTab("home")}>
              Home
            </TabsTrigger>
            <TabsTrigger value="summon" onClick={() => setTab("summon")}>
              Summon
            </TabsTrigger>
            <TabsTrigger value="roster" onClick={() => setTab("roster")}>
              Roster
            </TabsTrigger>
            <TabsTrigger value="battle" onClick={() => setTab("battle")}>
              Battle
            </TabsTrigger>
            <TabsTrigger value="story" onClick={() => setTab("story")}>
              Story
            </TabsTrigger>
            <TabsTrigger value="settings" onClick={() => setTab("settings")}>
              Settings
            </TabsTrigger>
          </TabsList>

          {/* HOME */}
          <TabsContent value="home" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" /> Welcome, Binder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm opacity-90">
                <p>
                  New build adds animated portraits, roster/battle polish, and an ultimate cinematic
                  overlay with optional video clips.
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Summon via banners with pity.</li>
                  <li>Build a team of 3 and fight ATB battles.</li>
                  <li>Branching story nodes with rewards.</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUMMON */}
          <TabsContent value="summon" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Summoning Gate</CardTitle>
              </CardHeader>
              <CardContent>
                <SummonGate
                  currency={currency}
                  setCurrency={setCurrency}
                  bannerId={bannerId}
                  setBannerId={setBannerId}
                  onSummon={handleSummon}
                />
                {lastPulls.length > 0 && (
                  <div className="mt-6 grid md:grid-cols-5 gap-3">
                    {lastPulls.map((u) => (
                      <div
                        key={u.rollId}
                        className="p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-sm"
                      >
                        <div
                          className={`h-1 rounded-full bg-gradient-to-r ${
                            (RarityWeightsBase.find((w) => w.r === u.rarity) || {}).glow ||
                            "from-slate-300 to-slate-200"
                          }`}
                        />
                        <div className="mt-2 font-semibold">{u.name}</div>
                        <div className="text-2xl mt-1">{u.emoji}</div>
                        <div className="text-xs opacity-70">{u.lore}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ROSTER */}
          <TabsContent value="roster" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Roster & Team (3 max)</CardTitle>
              </CardHeader>
              <CardContent>
                <Roster inventory={inventory} team={team} toggleTeam={toggleTeam} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* BATTLE */}
          <TabsContent value="battle" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="w-5 h-5" /> Skirmish
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Battle
                  team={team}
                  enemy={enemy}
                  inBattle={inBattle}
                  startBattle={startBattle}
                  turnQueue={turnQueue}
                  setInBattle={setInBattle}
                  battleLog={battleLog}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* STORY */}
          <TabsContent value="story" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapIcon className="w-5 h-5" /> Story Map
                </CardTitle>
              </CardHeader>
              <CardContent>
                <StoryMap
                  curNode={STORY_NODES[nodeId]}
                  inBattle={inBattle}
                  setNodeId={setNodeId}
                  enterNode={enterNode}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings & Save</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}
                  >
                    Clear Save
                  </Button>
                  <Button
                    onClick={() => {
                      save("backup", { inventory, team, nodeId, bannerId, currency });
                      alert("Saved backup to localStorage (key: ab_backup)");
                    }}
                  >
                    Backup Save
                  </Button>
                  <Button
                    onClick={() => {
                      const b = load("backup");
                      if (b) {
                        setInventory(b.inventory || []);
                        setTeam(b.team || []);
                        setNodeId(b.nodeId || "start");
                        setBannerId(b.bannerId || "standard");
                        setCurrency(b.currency || 0);
                      }
                    }}
                  >
                    Restore Backup
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
