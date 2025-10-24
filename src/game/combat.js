import { elementEdge, SKILLS, ULTS } from "./data";


export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const rand = (min, max) => Math.random() * (max - min) + min;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const chance = (p) => Math.random() < p;


export function computeElementMod(attackerEl, defenderEl){
if (attackerEl === "arc" || defenderEl === "arc") return 1.0;
if (elementEdge[attackerEl] === defenderEl) return 1.2;
if (elementEdge[defenderEl] === attackerEl) return 0.8;
return 1.0;
}


export function baseDamage(attacker, defender, pow, critChance){
const base = Math.max(1, attacker.atk - defender.def * 0.4);
const variance = rand(0.9, 1.1);
const el = computeElementMod(attacker.element, defender.element);
const crit = chance(critChance || 0) ? 1.7 : 1.0;
return Math.floor(base * (pow || 1) * variance * el * crit);
}


export function applyStatusRoll(target, status, source){
if (!status) return null;
if (!chance(status.chance || 0)) return null;
const copy = { ...status, turns: status.turns ?? 1 };
if (copy.type === "shield") { source.shield = Math.floor(source.hpMax * (copy.pct || 0.15)); return { appliedTo: source.name, type: "shield", val: source.shield }; }
target.statuses.push(copy);
return { appliedTo: target.name, type: copy.type };
}


export function endOfTurn(unit){
unit.statuses = unit.statuses.filter((s)=>{
if (["burn","bleed","shock"].includes(s.type)){
const d = Math.floor(unit.hpMax * (s.dmgPct || 0.05));
unit.hp = clamp(unit.hp - d, 0, unit.hpMax);
if (unit.hp <= 0) unit.alive = false;
}
s.turns -= 1; return s.turns > 0;
});
}


export function effectiveStat(unit, key){
let v = unit[key];
unit.statuses.forEach((s)=>{ if (key === "atk" && s.atkMod) v += s.atkMod; if (key === "spd" && s.spdMod) v += s.spdMod; });
return v;
}


export function hasStatus(u, type){ return u.statuses.some((s)=>s.type===type); }
export function chooseTarget(arr){
const candidates = arr.filter((x)=>x.alive);
if (candidates.length === 0) return null;
return candidates.reduce((a,b)=>(a.hp/a.hpMax < b.hp/b.hpMax ? a : b));
}


export function performSkill(attacker, defenders, skillName){
const sk = SKILLS[skillName] || { pow: 1.0, crit: 0.05, tag: "single" };
const affected = [];
const pool = sk.tag === "all" ? defenders.filter((d)=>d.alive)
: sk.tag === "multi2" ? defenders.filter((d)=>d.alive).slice(0,2)
: sk.tag === "line" ? defenders.filter((d)=>d.alive)
: [ chooseTarget(defenders) ].filter(Boolean);


for (const def of pool){
if (!def) continue; if (hasStatus(attacker, "stun")) continue;
let dmg = baseDamage(attacker, def, sk.pow, sk.crit);
if (def.shield>0){ const absorbed = Math.min(def.shield, dmg); def.shield -= absorbed; dmg -= absorbed; }
def.hp = clamp(def.hp - Math.max(0, dmg), 0, def.hpMax); if (def.hp<=0) def.alive=false;
const ap = applyStatusRoll(def, sk.status, attacker);
affected.push({ name:def.name, dmg, ap });
attacker.ult = clamp(attacker.ult + 18, 0, 100);
}
return affected;
}


export function performUlt(attacker, defenders){
const ultCfg = ULTS[attacker.name];
const pool = ultCfg.tag === "all" ? defenders.filter((d)=>d.alive) : [ chooseTarget(defenders) ].filter(Boolean);
const affected = [];
for (const def of pool){
let dmg = baseDamage(attacker, def, ultCfg.pow, 0.25);
if (def.shield>0){ const absorbed = Math.min(def.shield, dmg); def.shield -= absorbed; dmg -= absorbed; }
def.hp = clamp(def.hp - Math.max(0, dmg), 0, def.hpMax); if (def.hp<=0) def.alive=false;
const ap = applyStatusRoll(def, ultCfg.add, attacker);
affected.push({ name:def.name, dmg, ap });
}
attacker.ult = 0;
return affected;
}