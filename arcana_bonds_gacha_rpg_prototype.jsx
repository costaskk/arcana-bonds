import React, { useMemo, useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Sparkles, Sword, Shield, Zap, Flame, Droplets, Wind, Mountain, Star, Dice5, Swords, RefreshCw, BookOpen, Users, Crown, Trophy, Coins, Map, Compass, Film
} from "lucide-react";

// =====================
// ARCANA BONDS — Gacha RPG (Original-IP Prototype) — v0.6
// =====================
// What changed from v0.1
// - Expanded roster (20+ units) & banners with unique rate-ups.
// - Deeper combat: ATB speed order, buffs/debuffs, multi-target, ult gauge & cut-ins.
// - Story Map: branching nodes (battle, elite, camp, loot, boss) with rewards.
// - Persistence: localStorage for inventory, team, progress, settings.
// - Cinematic summon tiers (SR animation layers) and rare ultimate cut-ins.
// - Polished FX: particles, bloom glows, screen-shake.
// - Still single-file, Tailwind + framer-motion.

// =====================
// Helpers
// =====================
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const chance = (p) => Math.random() < p;

// Elements & triangle
const Elements = ["ember", "aqua", "gale", "terra", "arc"];
const ElementIcon = ({ e, className = "w-4 h-4" }) => {
  const map = {
    ember: <Flame className={className} />,
    aqua: <Droplets className={className} />,
    gale: <Wind className={className} />,
    terra: <Mountain className={className} />,
    arc: <Zap className={className} />,
  };
  return map[e] || <Star className={className} />;
};
const elementEdge = { ember: "gale", gale: "terra", terra: "aqua", aqua: "ember", arc: null };

// Rarities and base rates (banners can override)
const RarityWeightsBase = [
  { r: "SS", p: 0.02, glow: "from-yellow-200 via-fuchsia-300 to-cyan-300" },
  { r: "S", p: 0.08, glow: "from-fuchsia-300 to-cyan-300" },
  { r: "A", p: 0.25, glow: "from-cyan-300 to-sky-300" },
  { r: "B", p: 0.65, glow: "from-slate-300 to-slate-200" },
];

// =====================
// DATA (Skills, Units, Banners, Story Map)
// =====================
const SKILLS = {
  "Arc Strike": { pow: 1.4, crit: 0.15, tag: "single" },
  "Hellbrand": { pow: 0.9, crit: 0.1, tag: "single", status: { type: "burn", chance: 0.5, turns: 2, dmgPct: 0.08 } },
  "Tidal Lock": { pow: 1.0, crit: 0.1, tag: "single", status: { type: "stun", chance: 0.35, turns: 1 } },
  "Stone Aegis": { pow: 0.6, crit: 0.05, tag: "self", status: { type: "shield", chance: 1.0, turns: 2, pct: 0.2 } },
  "Tempest Flurry": { pow: 1.1, crit: 0.2, tag: "multi2" },
  "Earthen Roar": { pow: 0.95, crit: 0.1, tag: "all", status: { type: "slow", chance: 0.4, turns: 2, spdMod: -20 } },
  "Aether Chant": { pow: 0, crit: 0, tag: "allyAll", status: { type: "atkUp", chance: 1.0, turns: 2, atkMod: 25 } },
  "Gale Cut-In": { pow: 1.6, crit: 0.2, tag: "single", status: { type: "bleed", chance: 0.5, turns: 2, dmgPct: 0.07 } },
};

// Ultimates (build at 100, trigger with cinematic)
const ULTS = {
  "Ignis Ronin": { name: "Crimson Zenith", pow: 2.1, tag: "line" },
  "Tidal Warden": { name: "Abyssal Lockdown", pow: 1.7, tag: "all", add: { type: "stun", chance: 0.3, turns: 1 } },
  "Arc Oracle": { name: "Starfall Surge", pow: 2.0, tag: "single", add: { type: "shock", chance: 0.6, turns: 2, dmgPct: 0.06 } },
};

// Expanded units (sample)
const BASE_UNITS = [
  { id: "ignis-ronin", name: "Ignis Ronin", element: "ember", rarity: "S", emoji: "🔥⚔️", stats: { hp: 1100, atk: 155, def: 85, spd: 108 }, skills: ["Hellbrand", "Arc Strike"], lore: "A wandering blade-witch whose katana sings with wildfire spirits." },
  { id: "tidal-warden", name: "Tidal Warden", element: "aqua", rarity: "A", emoji: "💧🛡️", stats: { hp: 1300, atk: 130, def: 120, spd: 96 }, skills: ["Tidal Lock", "Arc Strike"], lore: "Guardian of the moon-tide vaults, calm as the abyss." },
  { id: "gale-duelist", name: "Gale Duelist", element: "gale", rarity: "B", emoji: "💨⚔️", stats: { hp: 900, atk: 120, def: 80, spd: 128 }, skills: ["Tempest Flurry", "Arc Strike"], lore: "A skyborne fencer who reads the wind like a book." },
  { id: "terra-sentinel", name: "Terra Sentinel", element: "terra", rarity: "A", emoji: "⛰️🛡️", stats: { hp: 1500, atk: 110, def: 150, spd: 88 }, skills: ["Stone Aegis", "Arc Strike"], lore: "A living bastion, etched with first-mountain runes." },
  { id: "arc-oracle", name: "Arc Oracle", element: "arc", rarity: "SS", emoji: "✨⚡", stats: { hp: 1000, atk: 175, def: 95, spd: 112 }, skills: ["Arc Strike", "Tempest Flurry"], lore: "Seer of the Hollow Stars, weaving lightning into fate." },
  { id: "ember-ravager", name: "Ember Ravager", element: "ember", rarity: "A", emoji: "🔥🗡️", stats: { hp: 1050, atk: 150, def: 80, spd: 115 }, skills: ["Hellbrand", "Gale Cut-In"], lore: "Bandit lord crowned in cinders." },
  { id: "brine-slinger", name: "Brine Slinger", element: "aqua", rarity: "B", emoji: "🌊🏹", stats: { hp: 920, atk: 118, def: 75, spd: 124 }, skills: ["Tidal Lock", "Tempest Flurry"], lore: "A corsair who snares foes with moonlines." },
  { id: "cyclone-monk", name: "Cyclone Monk", element: "gale", rarity: "A", emoji: "🌀🧘", stats: { hp: 980, atk: 135, def: 90, spd: 135 }, skills: ["Tempest Flurry", "Aether Chant"], lore: "Breathes the mantra of storms." },
  { id: "bastion-golem", name: "Bastion Golem", element: "terra", rarity: "S", emoji: "🗿", stats: { hp: 1700, atk: 120, def: 170, spd: 70 }, skills: ["Stone Aegis", "Earthen Roar"], lore: "Citadel-hewn protector." },
  { id: "quantum-scribe", name: "Quantum Scribe", element: "arc", rarity: "S", emoji: "📜⚡", stats: { hp: 1020, atk: 165, def: 95, spd: 118 }, skills: ["Arc Strike", "Aether Chant"], lore: "Writes futures in charged glyphs." },
  // ... add more variations here if desired
];

// Banners (rate-ups and featured pools)
const BANNERS = [
  {
    id: "standard",
    name: "Standard Gate",
    desc: "Balanced rates across all units.",
    rates: RarityWeightsBase,
    featured: [],
  },
  {
    id: "starfall",
    name: "Starfall Vision",
    desc: "SS Arc Oracle rate-up; increased S/SR for Arc units.",
    rates: [ { r: "SS", p: 0.03 }, { r: "S", p: 0.12 }, { r: "A", p: 0.25 }, { r: "B", p: 0.60 } ],
    featured: ["arc-oracle", "quantum-scribe"],
  },
  {
    id: "earthwall",
    name: "Earthwall Aegis",
    desc: "Defenders up! Terra units boosted.",
    rates: [ { r: "SS", p: 0.02 }, { r: "S", p: 0.10 }, { r: "A", p: 0.30 }, { r: "B", p: 0.58 } ],
    featured: ["bastion-golem", "terra-sentinel"],
  },
];

// Story Map graph (simple rogue-lite path)
const STORY_NODES = {
  start: { id: "start", type: "camp", text: "Lumenfall Ruins — A dying fire. Your Bond stirs.", next: ["n1", "n2"], reward: { shards: 50 } },
  n1: { id: "n1", type: "battle", text: "Dockside Skirmish — Corsairs test your mettle.", next: ["n3"], enemyPower: 1 },
  n2: { id: "n2", type: "loot", text: "Moonvault — You find a sigil cache.", next: ["n3"], reward: { shards: 100 } },
  n3: { id: "n3", type: "elite", text: "Windway Duel — A monk of storms blocks the bridge.", next: ["n4", "n5"], enemyPower: 1.5 },
  n4: { id: "n4", type: "camp", text: "Wayside Shrine — Your allies breathe.", next: ["boss"], reward: { heal: 0.5 } },
  n5: { id: "n5", type: "loot", text: "Forgotten Armory — Runes hum under dust.", next: ["boss"], reward: { shards: 150 } },
  boss: { id: "boss", type: "boss", text: "The Ashen Gate — A guardian descends.", next: [], enemyPower: 2.2 },
};

// =====================
// Persistence layer
// =====================
const save = (k, v) => localStorage.setItem("ab_" + k, JSON.stringify(v));
const load = (k, d) => {
  try { const v = JSON.parse(localStorage.getItem("ab_" + k)); return v ?? d; } catch { return d; }
};

// =====================
// Combat core
// =====================
function computeElementMod(attackerEl, defenderEl) {
  if (attackerEl === "arc" || defenderEl === "arc") return 1.0;
  if (elementEdge[attackerEl] === defenderEl) return 1.2;
  if (elementEdge[defenderEl] === attackerEl) return 0.8;
  return 1.0;
}

function baseDamage(attacker, defender, pow, critChance) {
  const base = Math.max(1, attacker.atk - defender.def * 0.4);
  const variance = rand(0.9, 1.1);
  const el = computeElementMod(attacker.element, defender.element);
  const crit = chance(critChance || 0) ? 1.7 : 1.0;
  return Math.floor(base * (pow || 1) * variance * el * crit);
}

function applyStatusRoll(target, status, source) {
  if (!status) return null;
  if (!chance(status.chance || 0)) return null;
  const copy = { ...status, turns: status.turns ?? 1 };
  if (copy.type === "shield") {
    source.shield = Math.floor(source.hpMax * (copy.pct || 0.15));
    return { appliedTo: source.name, type: "shield", val: source.shield };
  }
  target.statuses.push(copy);
  return { appliedTo: target.name, type: copy.type };
}

function endOfTurn(unit) {
  // tick DoTs & decrement buffs
  unit.statuses = unit.statuses.filter((s) => {
    if (s.type === "burn" || s.type === "bleed" || s.type === "shock") {
      const d = Math.floor(unit.hpMax * (s.dmgPct || 0.05));
      unit.hp = clamp(unit.hp - d, 0, unit.hpMax);
      if (unit.hp <= 0) unit.alive = false;
    }
    s.turns -= 1;
    return s.turns > 0;
  });
}

function effectiveStat(unit, key) {
  let v = unit[key];
  unit.statuses.forEach((s) => {
    if (key === "atk" && s.atkMod) v += s.atkMod;
    if (key === "spd" && s.spdMod) v += s.spdMod;
  });
  return v;
}

// =====================
// UI Atoms
// =====================
const Pill = ({ children, className = "" }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-900/5 dark:bg-white/10 ${className}`}>{children}</span>
);

const HPBar = ({ hp, max }) => (
  <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-xl h-3 overflow-hidden">
    <div className="h-3 bg-emerald-500" style={{ width: `${clamp((hp / max) * 100, 0, 100)}%` }} />
  </div>
);

const UnitBadge = ({ u }) => (
  <div className="flex items-center gap-1 text-xs">
    <Badge variant="secondary" className="rounded-full">{u.rarity}</Badge>
    <ElementIcon e={u.element} />
  </div>
);

const Particles = ({ show, dense = 60 }) => (
  <AnimatePresence>
    {show && (
      <motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        {Array.from({ length: dense }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute w-1 h-1 rounded-full bg-white/70"
            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
            initial={{ y: 0, scale: 0 }}
            animate={{ y: -rand(40, 160), scale: rand(0.8, 1.8) }}
            transition={{ duration: rand(1.6, 3.2), repeat: Infinity, ease: "easeOut", delay: Math.random() * 1 }}
          />
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

// Rare cinematic overlay
const Cinematic = ({ show, title, subtitle }) => (
  <AnimatePresence>
    {show && (
      <motion.div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div initial={{ scale: 0.7 }} animate={{ scale: [0.7, 1.05, 1] }} transition={{ duration: 0.9 }} className="text-center">
          <div className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 via-yellow-200 to-cyan-300 drop-shadow">
            {title}
          </div>
          <div className="mt-2 text-white/80">{subtitle}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// =====================
// Main Component
// =====================
export default function GameApp() {
  const [tab, setTab] = useState(load("tab", "home"));
  const [inventory, setInventory] = useState(load("inventory", []));
  const [lastPulls, setLastPulls] = useState([]);
  const [summoning, setSummoning] = useState(false);
  const [cinematic, setCinematic] = useState(null);
  const [bannerId, setBannerId] = useState(load("banner", "standard"));
  const banner = useMemo(() => BANNERS.find((b) => b.id === bannerId) || BANNERS[0], [bannerId]);

  // Battle state
  const [team, setTeam] = useState(load("team", []));
  const [enemy, setEnemy] = useState([]);
  const [battleLog, setBattleLog] = useState([]);
  const [turnQueue, setTurnQueue] = useState([]); // ATB order
  const [inBattle, setInBattle] = useState(false);

  // Story state
  const [nodeId, setNodeId] = useState(load("nodeId", "start"));
  const [currency, setCurrency] = useState(load("shards", 300));

  // Seed a starter
  useEffect(() => {
    if (inventory.length === 0) {
      const starter = pick(BASE_UNITS);
      setInventory([starter]);
    }
  }, []);

  // Persist
  useEffect(() => { save("inventory", inventory); }, [inventory]);
  useEffect(() => { save("team", team); }, [team]);
  useEffect(() => { save("tab", tab); }, [tab]);
  useEffect(() => { save("banner", bannerId); }, [bannerId]);
  useEffect(() => { save("nodeId", nodeId); }, [nodeId]);
  useEffect(() => { save("shards", currency); }, [currency]);

  // =====================
  // Gacha & banners
  // =====================
  const poolByRarity = (r) => BASE_UNITS.filter((u) => u.rarity === r);
  const rollRarity = () => {
    const rates = banner.rates;
    const x = Math.random();
    let acc = 0;
    for (const t of rates) { acc += t.p; if (x <= acc) return t.r; }
    return "B";
  };
  const summonOne = () => {
    const r = rollRarity();
    let pool = poolByRarity(r);
    // small tilt to featured
    if (banner.featured.length && chance(0.5)) {
      const featuredUnits = pool.filter((u) => banner.featured.includes(u.id));
      if (featuredUnits.length) pool = [...featuredUnits, ...pool];
    }
    const unit = pick(pool);
    return { ...unit, rollId: `${unit.id}-${Math.random().toString(36).slice(2)}` };
  };
  const summonTen = () => {
    let pulls = Array.from({ length: 10 }, () => summonOne());
    if (!pulls.some((u) => ["A", "S", "SS"].includes(u.rarity))) {
      const aPool = poolByRarity("A");
      pulls[9] = { ...pick(aPool), rollId: `pity-${Math.random().toString(36).slice(2)}` };
    }
    return pulls;
  };

  const onSummon10 = async () => {
    if (currency < 100) return; // cost
    setCurrency((c) => c - 100);
    const rareCine = chance(0.05);
    setSummoning(true);
    if (rareCine) setCinematic({ title: "STARFALL GATE", subtitle: "A rare vision answers your call..." });
    await new Promise((r) => setTimeout(r, rareCine ? 1900 : 1200));
    const pulls = summonTen();
    setInventory((prev) => [...prev, ...pulls]);
    setLastPulls(pulls);
    setSummoning(false);
    setTimeout(() => setCinematic(null), 400);
  };

  // =====================
  // Team management
  // =====================
  const toggleTeam = (u) => {
    setTeam((prev) => {
      const exists = prev.find((x) => (x.rollId || x.id) === (u.rollId || u.id));
      if (exists) return prev.filter((x) => (x.rollId || x.id) !== (u.rollId || u.id));
      if (prev.length >= 3) return prev; // cap
      return [...prev, u];
    });
  };

  // =====================
  // Build combatants
  // =====================
  function buildCombatant(base) {
    const hpMax = Math.floor(base.stats.hp);
    return {
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
      ult: 0, // 0..100
      emoji: base.emoji,
    };
  }

  // =====================
  // Battle flow (ATB queue)
  // =====================
  const startBattle = (power = 1) => {
    if (team.length === 0) return;
    const e = Array.from({ length: 3 }, () => ({ ...pick(BASE_UNITS) }));
    const scaled = e.map((u) => ({ ...u, stats: { hp: u.stats.hp * power, atk: u.stats.atk * power, def: u.stats.def * power, spd: u.stats.spd } }));
    const enemyBuilt = scaled.map(buildCombatant);
    const teamBuilt = team.map(buildCombatant);
    setEnemy(enemyBuilt);
    setTeam(teamBuilt);
    setBattleLog(["A hostile squad approaches!"]);
    // initial queue by speed
    const q = [...teamBuilt.map((x) => ({ side: "player", unit: x })), ...enemyBuilt.map((x) => ({ side: "enemy", unit: x }))]
      .sort((a, b) => effectiveStat(b.unit, "spd") - effectiveStat(a.unit, "spd"));
    setTurnQueue(q);
    setInBattle(true);
  };

  const isWiped = (arr) => arr.every((x) => !x.alive);

  function performSkill(attacker, defenders, skillName) {
    const sk = SKILLS[skillName] || { pow: 1.0, crit: 0.05, tag: "single" };
    const affected = [];
    const targetPool = sk.tag === "all" ? defenders.filter((d) => d.alive)
      : sk.tag === "multi2" ? defenders.filter((d) => d.alive).slice(0, 2)
      : sk.tag === "line" ? defenders.filter((d) => d.alive) // simple: treat like all for prototype
      : [ chooseTarget(defenders) ].filter(Boolean);

    for (const def of targetPool) {
      if (!def) continue;
      if (hasStatus(attacker, "stun")) { continue; }
      let dmg = baseDamage(attacker, def, sk.pow, sk.crit);
      // shields
      if (def.shield > 0) {
        const absorbed = Math.min(def.shield, dmg); def.shield -= absorbed; dmg -= absorbed;
      }
      def.hp = clamp(def.hp - Math.max(0, dmg), 0, def.hpMax);
      if (def.hp <= 0) def.alive = false;
      const ap = applyStatusRoll(def, sk.status, attacker);
      affected.push({ name: def.name, dmg, ap });
      // build ult meter
      attacker.ult = clamp(attacker.ult + 18, 0, 100);
    }
    return affected;
  }

  function hasStatus(u, type) { return u.statuses.some((s) => s.type === type); }
  function chooseTarget(arr) {
    const candidates = arr.filter((x) => x.alive);
    if (candidates.length === 0) return null;
    return candidates.reduce((a, b) => (a.hp / a.hpMax < b.hp / b.hpMax ? a : b));
  }

  function takeTurn() {
    setTurnQueue((q) => {
      if (!inBattle || q.length === 0) return q;
      const [cur, ...rest] = q;
      const actor = cur.unit;
      if (!actor.alive) return rest; // skip dead
      const side = cur.side;
      const foes = side === "player" ? enemy : team;

      if (hasStatus(actor, "stun")) {
        setBattleLog((l) => [ `${actor.name} is stunned!`, ...l ]);
      } else {
        // Ult if ready
        const ultCfg = ULTS[actor.name];
        if (ultCfg && actor.ult >= 100) {
          setCinematic({ title: ultCfg.name, subtitle: `${actor.name} unleashes an Ultimate!` });
          const affected = performUlt(actor, foes, ultCfg);
          setBattleLog((l) => [ `${actor.name} used ${ultCfg.name}! ${affected.map(a=>`${a.name} -${a.dmg}`).join(", ")}`, ...l ]);
          setTimeout(() => setCinematic(null), 600);
          actor.ult = 0;
        } else {
          const skillName = pick(actor.skills);
          const affected = performSkill(actor, foes, skillName);
          setBattleLog((l) => [ `${actor.name} used ${skillName}. ${affected.map(a=>`${a.name} -${a.dmg}${a.ap?" +"+a.ap.type:""}`).join(", ")}`, ...l ]);
        }
      }

      [...team, ...enemy].forEach(endOfTurn);

      if (isWiped(enemy)) { setBattleLog((l) => ["Victory!", ...l]); setInBattle(false); return rest; }
      if (isWiped(team)) { setBattleLog((l) => ["Defeat...", ...l]); setInBattle(false); return rest; }

      // reinsert actor at end with slight speed jitter to simulate ATB
      const jitter = Math.max(1, Math.floor(effectiveStat(actor, "spd") + rand(-5, 5)));
      const newRest = [...rest, { side, unit: actor, spd: jitter }].sort((a, b) => effectiveStat(b.unit, "spd") - effectiveStat(a.unit, "spd"));
      return newRest;
    });
  }

  function performUlt(attacker, defenders, ultCfg) {
    const targetPool = ultCfg.tag === "all" ? defenders.filter((d) => d.alive) : [ chooseTarget(defenders) ].filter(Boolean);
    const affected = [];
    for (const def of targetPool) {
      let dmg = baseDamage(attacker, def, ultCfg.pow, 0.25);
      if (def.shield > 0) { const absorbed = Math.min(def.shield, dmg); def.shield -= absorbed; dmg -= absorbed; }
      def.hp = clamp(def.hp - Math.max(0, dmg), 0, def.hpMax);
      if (def.hp <= 0) def.alive = false;
      const ap = applyStatusRoll(def, ultCfg.add, attacker);
      affected.push({ name: def.name, dmg, ap });
    }
    return affected;
  }

  useEffect(() => {
    if (!inBattle) return;
    const t = setInterval(() => takeTurn(), 800);
    return () => clearInterval(t);
  }, [inBattle, team, enemy]);

  // =====================
  // Story map actions
  // =====================
  const curNode = STORY_NODES[nodeId];
  function claimReward(rw) {
    if (!rw) return;
    if (rw.shards) setCurrency((c) => c + rw.shards);
    if (rw.heal) setTeam((t) => t.map((u) => ({ ...u, hp: clamp(u.hp + Math.floor(u.hpMax * rw.heal), 0, u.hpMax) })));
  }
  function enterNode(n) {
    if (n.type === "loot" || n.type === "camp") claimReward(n.reward);
    if (n.type === "battle" || n.type === "elite" || n.type === "boss") startBattle(n.enemyPower);
  }

  // =====================
  // Render
  // =====================
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-50 to-slate-200 dark:from-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8">
      <Cinematic show={!!cinematic} title={cinematic?.title} subtitle={cinematic?.subtitle} />
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <motion.div initial={{ scale: 0.8, rotate: -6 }} animate={{ scale: 1, rotate: 0 }} className="p-2 rounded-2xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-emerald-400 text-white shadow-lg">
              <Sparkles />
            </motion.div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Arcana Bonds</h1>
              <p className="text-xs opacity-70">Original gacha RPG • expanded systems • persistent save</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs opacity-80">
            <Coins className="w-4 h-4"/> {currency}
          </div>
        </header>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-7 w-full">
            <TabsTrigger value="home">Home</TabsTrigger>
            <TabsTrigger value="summon">Summon</TabsTrigger>
            <TabsTrigger value="roster">Roster</TabsTrigger>
            <TabsTrigger value="battle">Battle</TabsTrigger>
            <TabsTrigger value="story">Story</TabsTrigger>
            <TabsTrigger value="codex">Codex</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* HOME */}
          <TabsContent value="home" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5"/> Welcome, Binder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  This upgraded prototype adds banners, deeper combat with ultimates, a branching story map with loot, and save persistence. All characters and assets are original.
                </p>
                <div className="grid md:grid-cols-3 gap-4">
                  <Feature title="Banners & Rates" icon={<Crown className="w-4 h-4"/>} text="Pick a banner; 10× pulls cost 100 shards with pity."/>
                  <Feature title="ATB Combat" icon={<Swords className="w-4 h-4"/>} text="Speed-driven turns, buffs/debuffs, ult gauge, cut-ins."/>
                  <Feature title="Story Map" icon={<Map className="w-4 h-4"/>} text="Choose routes, claim rewards, face elites and a boss."/>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUMMON */}
          <TabsContent value="summon" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5"/> Summoning Gate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 flex-wrap">
                  <select className="px-3 py-2 rounded-xl bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800" value={bannerId} onChange={(e)=>setBannerId(e.target.value)}>
                    {BANNERS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                  <div className="text-xs opacity-70">{banner.desc}</div>
                </div>

                <div className="relative mt-3 h-56 md:h-72 rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-fuchsia-600 to-emerald-500 flex items-center justify-center">
                  <Particles show={summoning} dense={100} />
                  <AnimatePresence>
                    {summoning ? (
                      <motion.div key="gate" className="text-center" initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: [0.6, 1.05, 1], opacity: 1, rotate: [0, 2, -2, 0] }} transition={{ duration: 1.2, ease: "easeOut" }}>
                        <div className="text-white text-3xl font-black drop-shadow">OPENING GATE...</div>
                      </motion.div>
                    ) : (
                      <motion.div key="idle" className="text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                        <div className="text-white text-2xl font-bold drop-shadow">Tap to Summon</div>
                        <div className="text-white/80 text-sm">10× pull • pity guaranteed • Cost 100</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-3 mt-4">
                  <Button disabled={summoning || currency < 100} onClick={onSummon10}>
                    {summoning ? "Summoning..." : `Summon 10× (${currency>=100?"100":"Need 100"})`}
                  </Button>
                  <div className="text-xs opacity-70">Rates — {banner.rates.map((r)=>`${r.r}:${Math.round(r.p*100)}%`).join(" • ")}</div>
                </div>

                {lastPulls.length > 0 && (
                  <div className="mt-6 grid md:grid-cols-5 gap-3">
                    {lastPulls.map((u) => (
                      <motion.div key={u.rollId} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 shadow-sm">
                        <div className={`h-1 rounded-full bg-gradient-to-r ${ (RarityWeightsBase.find(w=>w.r===u.rarity)||{}).glow || "from-slate-300 to-slate-200" }`} />
                        <div className="mt-2 flex items-center justify-between">
                          <div className="font-semibold">{u.name}</div>
                          <UnitBadge u={u} />
                        </div>
                        <div className="text-2xl mt-1">{u.emoji}</div>
                        <div className="text-xs opacity-70">{u.lore}</div>
                        <div className="mt-2 flex gap-2">
                          <Button size="sm" variant="secondary" onClick={() => toggleTeam(u)}>Add to Team</Button>
                        </div>
                      </motion.div>
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
                <CardTitle>Roster & Team (pick up to 3)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-3">
                  {inventory.map((u, idx) => (
                    <div key={(u.rollId || u.id) + idx} className="p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold">{u.name}</div>
                        <UnitBadge u={u} />
                      </div>
                      <div className="text-3xl my-1">{u.emoji}</div>
                      <p className="text-xs opacity-70">{u.lore}</p>
                      <div className="mt-2 flex flex-wrap gap-1 text-xs">
                        {u.skills.map((s) => (
                          <Pill key={s}>{s}</Pill>
                        ))}
                      </div>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" variant={team.find(t => (t.rollId||t.id)===(u.rollId||u.id)) ? "destructive" : "secondary"} onClick={() => toggleTeam(u)}>
                          {team.find(t => (t.rollId||t.id)===(u.rollId||u.id)) ? "Remove" : "Add"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="text-sm opacity-80 mb-2">Team:</div>
                  <div className="flex gap-2 flex-wrap">
                    {team.map((u, i) => (
                      <Pill key={i}>{u.name} <span className="ml-1 opacity-70">({u.element})</span></Pill>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* BATTLE */}
          <TabsContent value="battle" className="mt-6">
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Swords className="w-5 h-5"/> Skirmish</CardTitle>
              </CardHeader>
              <CardContent>
                {!inBattle ? (
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-sm opacity-80 mb-2">Your Team ({team.length}/3):</div>
                      <div className="flex flex-wrap gap-2">
                        {team.map((u, i) => (<Pill key={i}>{u.name}</Pill>))}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button onClick={() => startBattle(1)} disabled={team.length === 0}>Start (Normal)</Button>
                      <Button variant="secondary" onClick={() => startBattle(1.6)} disabled={team.length === 0}>Start (Elite)</Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Boards */}
                    <div className="grid md:grid-cols-2 gap-3">
                      <SquadPanel title="Your Squad" arr={team} />
                      <SquadPanel title="Enemy Squad" arr={enemy} />
                    </div>

                    {/* Queue & Controls */}
                    <div className="mt-4 p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-sm opacity-80">Turn order:</div>
                        <Button variant="secondary" onClick={() => { setInBattle(false); setBattleLog([]); }}>Retreat</Button>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {turnQueue.slice(0,6).map((t, i) => (
                          <Pill key={i}>{t.side === "player" ? "🟦" : "🟥"} {t.unit.name}</Pill>
                        ))}
                      </div>
                      <div className="mt-3 text-sm opacity-70">Combat advances automatically; ultimates fire at 100.</div>
                    </div>

                    {/* Log */}
                    <div className="mt-4 p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 max-h-64 overflow-auto">
                      <div className="font-semibold mb-2">Battle Log</div>
                      <div className="space-y-1 text-sm">
                        {battleLog.map((l, i) => (<div key={i} className="opacity-90">• {l}</div>))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* STORY */}
          <TabsContent value="story" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Compass className="w-5 h-5"/> Story Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-slate-50 to-white/60 dark:from-slate-800/40 dark:to-slate-900/30 border border-slate-200 dark:border-slate-800">
                  <div className="text-sm opacity-80 mb-2">{curNode.text}</div>
                  <div className="flex items-center gap-2 mb-3">
                    <Button onClick={() => enterNode(curNode)} disabled={inBattle}>Enter</Button>
                    <div className="text-xs opacity-70">Node: {curNode.type}</div>
                  </div>
                  <div className="text-sm opacity-80 mb-2">Paths:</div>
                  <div className="flex gap-2 flex-wrap">
                    {curNode.next.map((nid) => (
                      <Button key={nid} variant="secondary" onClick={() => setNodeId(nid)} disabled={inBattle}>{nid}</Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CODEX */}
          <TabsContent value="codex" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Codex & Mechanics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm opacity-90">
                <p><span className="font-semibold">Elements:</span> Ember > Gale > Terra > Aqua > Ember. Arc is neutral.</p>
                <p><span className="font-semibold">Statuses:</span> Burn/Bleed/Shock (DoT), Stun (skip), Shield (absorb), Slow/AtkUp (stat mods).</p>
                <p><span className="font-semibold">ATB:</span> Faster SPD acts more often; queue displays upcoming units.</p>
                <p><span className="font-semibold">Ultimates:</span> Build to 100 by acting; fire automatically with a cut-in.</p>
                <p><span className="font-semibold">Banners:</span> Each banner tweaks SS/S/A/B rates and features units.</p>
                <p><span className="font-semibold">Currency:</span> Shards (100 per 10×). Earn via story nodes (loot/camp).</p>
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
                  <Button variant="secondary" onClick={() => { localStorage.clear(); window.location.reload(); }}>Clear Save</Button>
                  <Button onClick={() => { save("backup", { inventory, team, nodeId, bannerId, currency }); alert("Saved backup to localStorage (key: ab_backup)"); }}>Backup Save</Button>
                  <Button onClick={() => { const b = load("backup"); if (b){ setInventory(b.inventory||[]); setTeam(b.team||[]); setNodeId(b.nodeId||"start"); setBannerId(b.bannerId||"standard"); setCurrency(b.currency||0);} }}>Restore Backup</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ===== Helper components =====
function Feature({ title, text, icon }) {
  return (
    <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="font-semibold mb-1 flex items-center gap-2">{icon} {title}</div>
      <p className="text-sm opacity-80">{text}</p>
    </div>
  );
}

function SquadPanel({ title, arr }) {
  return (
    <div className="p-3 rounded-xl border bg-white/70 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800">
      <div className="font-semibold mb-2">{title}</div>
      <div className="space-y-2">
        {arr.map((u, i) => (
          <div key={i} className={`p-2 rounded-lg ${u.alive ? "" : "opacity-50"} bg-slate-100/60 dark:bg-slate-900/40`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="text-2xl">{u.emoji}</div>
                <div>
                  <div className="font-semibold flex items-center gap-2">{u.name} <UnitBadge u={u}/></div>
                  <div className="text-xs opacity-70 capitalize">{u.element} {u.statuses[0] ? `• ${u.statuses[0].type} (${u.statuses[0].turns})` : ""}</div>
                </div>
              </div>
              <div className="w-40">
                <HPBar hp={u.hp} max={u.hpMax} />
                <div className="text-[10px] opacity-70 mt-1">ULT: {u.ult}% | SH: {u.shield}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
