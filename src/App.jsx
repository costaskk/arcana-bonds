import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Swords,
  Map as MapIcon,
  Coins,
  BookOpen,
  Home,
  Settings,
  Users,
  Crown,
  Library,
} from "lucide-react";

import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "./ui-fallbacks.jsx";

import {
  BASE_UNITS,
  BANNERS,
  STORY_NODES,
  ULTS,
} from "./game/data";
import {
  clamp,
  rand,
  pick,
  chance,
  effectiveStat,
  endOfTurn,
  performSkill,
  performUlt,
} from "./game/combat";
import { save, load } from "./game/persist";

import Cinematic from "./components/Cinematic";
import SummonGate from "./components/SummonGate";
import Roster from "./components/Roster";
import Battle from "./components/Battle";
import StoryMap from "./components/StoryMap";
import AnimatedClip from "./components/AnimatedClip";
import Collection from "./components/Collection";

// ======================== MAIN APP ======================== //
export default function App() {
  const [inventory, setInventory] = useState(load("inventory", []));
  const [team, setTeam] = useState(load("team", []));
  const [battleLog, setBattleLog] = useState([]);
  const [turnQueue, setTurnQueue] = useState([]);
  const [inBattle, setInBattle] = useState(false);
  const [enemy, setEnemy] = useState([]);
  const [bannerId, setBannerId] = useState(load("banner", "standard"));
  const [lastPulls, setLastPulls] = useState([]);
  const [nodeId, setNodeId] = useState(load("nodeId", "start"));
  const [currency, setCurrency] = useState(load("shards", 300));
  const [cinematic, setCinematic] = useState(null);
  const [ultingId, setUltingId] = useState(null);

  // starter unit
  useEffect(() => {
    if (inventory.length === 0) setInventory([pick(BASE_UNITS)]);
  }, []);

  // persistence
  useEffect(() => save("inventory", inventory), [inventory]);
  useEffect(() => save("team", team), [team]);
  useEffect(() => save("banner", bannerId), [bannerId]);
  useEffect(() => save("nodeId", nodeId), [nodeId]);
  useEffect(() => save("shards", currency), [currency]);

  // ========== GACHA ==========
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
      if (f.length) pool = [...f, ...f, ...pool];
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
    if (currency < 100) return null;
    setCurrency((c) => c - 100);
    const pulls = summonTen();
    setInventory((p) => [...p, ...pulls]);
    setLastPulls(pulls);
    return pulls;
  }

  // ========== TEAM ==========
  const toggleTeam = (u) =>
    setTeam((prev) => {
      const exists = prev.find((x) => (x.rollId || x.id) === (u.rollId || u.id));
      if (exists) return prev.filter((x) => (x.rollId || x.id) !== (u.rollId || u.id));
      if (prev.length >= 3) return prev;
      return [...prev, u];
    });

  // ========== COMBAT ==========
  function buildCombatant(base) {
    const hpMax = Math.floor(base.stats.hp);
    return {
      id: base.id,
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
        const ultCfg = ULTS[actor.name];
        const slug =
          actor.id || actor.name?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") || "unit";
        setUltingId(slug);
        setCinematic({ title: ultCfg.name, subtitle: `${actor.name} unleashes an Ultimate!` });

        const affected = performUlt(actor, foes);
        setBattleLog((l) => [
          `${actor.name} used ${ultCfg.name}! ${affected.map((a) => `${a.name} -${a.dmg}`).join(", ")}`,
          ...l,
        ]);

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
        setBattleLog((l) => ["Victory! (+50 💎)", ...l]);
        setCurrency((c) => c + 50); // earn from battle
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

  // ========== STORY ==========
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

  // ======================== UI ======================== //
  return (
    <Router>
      <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
        <Cinematic show={!!cinematic} title={cinematic?.title} subtitle={cinematic?.subtitle}>
          {ultingId ? <AnimatedClip id={ultingId} type="ult" width={420} height={420} /> : null}
        </Cinematic>

        <header className="flex flex-wrap items-center justify-between mb-8 border-b border-slate-300/40 dark:border-slate-700/60 pb-4">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg hover:text-fuchsia-500 transition">
            <Sparkles className="text-fuchsia-500" />
            Arcana Bonds
          </Link>
          <nav className="flex flex-wrap gap-4 text-sm mt-3 md:mt-0">
            <NavLink to="/" icon={<Home size={16} />} text="Home" />
            <NavLink to="/summon" icon={<Crown size={16} />} text="Summon" />
            <NavLink to="/roster" icon={<Users size={16} />} text="Roster" />
            <NavLink to="/collection" icon={<Library size={16} />} text="Collection" />
            <NavLink to="/battle" icon={<Swords size={16} />} text="Battle" />
            <NavLink to="/story" icon={<MapIcon size={16} />} text="Story" />
            <NavLink to="/settings" icon={<Settings size={16} />} text="Settings" />
          </nav>
          <div className="flex items-center gap-1 text-xs opacity-80 mt-3 md:mt-0">
            <Coins className="w-4 h-4" /> {currency}
          </div>
        </header>

        <main className="mx-auto max-w-6xl">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route
                path="/summon"
                element={
                  <SummonGate
                    currency={currency}
                    setCurrency={setCurrency}
                    bannerId={bannerId}
                    setBannerId={setBannerId}
                    onSummon={handleSummon}
                    lastPulls={lastPulls}
                  />
                }
              />
              <Route path="/roster" element={<Roster inventory={inventory} team={team} toggleTeam={toggleTeam} />} />
              <Route path="/collection" element={<Collection inventory={inventory} />} />
              <Route
                path="/battle"
                element={
                  <Battle
                    team={team}
                    enemy={enemy}
                    inBattle={inBattle}
                    startBattle={startBattle}
                    turnQueue={turnQueue}
                    setInBattle={setInBattle}
                    battleLog={battleLog}
                  />
                }
              />
              <Route
                path="/story"
                element={<StoryMap curNode={curNode} inBattle={inBattle} setNodeId={setNodeId} enterNode={enterNode} />}
              />
              <Route
                path="/settings"
                element={<SettingsPage inventory={inventory} team={team} nodeId={nodeId} bannerId={bannerId} currency={currency} setInventory={setInventory} setTeam={setTeam} setNodeId={setNodeId} setBannerId={setBannerId} setCurrency={setCurrency} />}
              />
              <Route path="*" element={<HomePage />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

// ========== EXTRA PAGES ==========
function HomePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" /> Welcome, Binder
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm opacity-90">
        <p>
          Arcana Bonds is a gacha RPG project featuring deep combat, summons,
          and branching story maps. Latest build adds improved gates, rewards,
          and collection tracking.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Summon through themed gates with pity system.</li>
          <li>Earn 💎 from battles and story nodes.</li>
          <li>View owned and missing units in Collection.</li>
        </ul>
      </CardContent>
    </Card>
  );
}

function SettingsPage({ inventory, team, nodeId, bannerId, currency, setInventory, setTeam, setNodeId, setBannerId, setCurrency }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Settings & Save</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <Button variant="secondary" onClick={() => { localStorage.clear(); window.location.reload(); }}>
            Clear Save
          </Button>
          <Button onClick={() => { save("backup", { inventory, team, nodeId, bannerId, currency }); alert("Saved backup to localStorage (key: ab_backup)"); }}>
            Backup Save
          </Button>
          <Button onClick={() => {
            const b = load("backup");
            if (b) {
              setInventory(b.inventory || []);
              setTeam(b.team || []);
              setNodeId(b.nodeId || "start");
              setBannerId(b.bannerId || "standard");
              setCurrency(b.currency || 0);
            }
          }}>
            Restore Backup
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function NavLink({ to, icon, text }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-fuchsia-500/10 hover:text-fuchsia-400 transition"
    >
      {icon} {text}
    </Link>
  );
}
