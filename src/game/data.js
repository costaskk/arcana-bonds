// Elements & triangle
export const elementEdge = { ember: "gale", gale: "terra", terra: "aqua", aqua: "ember", arc: null };
export const Elements = ["ember","aqua","gale","terra","arc"];


export const RarityWeightsBase = [
{ r: "SS", p: 0.02, glow: "from-yellow-200 via-fuchsia-300 to-cyan-300" },
{ r: "S", p: 0.08, glow: "from-fuchsia-300 to-cyan-300" },
{ r: "A", p: 0.25, glow: "from-cyan-300 to-sky-300" },
{ r: "B", p: 0.65, glow: "from-slate-300 to-slate-200" },
];


// Skills & Ults
export const SKILLS = {
"Arc Strike": { pow: 1.4, crit: 0.15, tag: "single" },
"Hellbrand": { pow: 0.9, crit: 0.1, tag: "single", status: { type: "burn", chance: 0.5, turns: 2, dmgPct: 0.08 } },
"Tidal Lock": { pow: 1.0, crit: 0.1, tag: "single", status: { type: "stun", chance: 0.35, turns: 1 } },
"Stone Aegis": { pow: 0.6, crit: 0.05, tag: "self", status: { type: "shield", chance: 1.0, turns: 2, pct: 0.2 } },
"Tempest Flurry": { pow: 1.1, crit: 0.2, tag: "multi2" },
"Earthen Roar": { pow: 0.95, crit: 0.1, tag: "all", status: { type: "slow", chance: 0.4, turns: 2, spdMod: -20 } },
"Aether Chant": { pow: 0, crit: 0, tag: "allyAll", status: { type: "atkUp", chance: 1.0, turns: 2, atkMod: 25 } },
"Gale Cut-In": { pow: 1.6, crit: 0.2, tag: "single", status: { type: "bleed", chance: 0.5, turns: 2, dmgPct: 0.07 } },
};


export const ULTS = {
"Ignis Ronin": { name: "Crimson Zenith", pow: 2.1, tag: "line" },
"Tidal Warden": { name: "Abyssal Lockdown", pow: 1.7, tag: "all", add: { type: "stun", chance: 0.3, turns: 1 } },
"Arc Oracle": { name: "Starfall Surge", pow: 2.0, tag: "single", add: { type: "shock", chance: 0.6, turns: 2, dmgPct: 0.06 } },
};


// Roster — add a "portrait" glyph for the portrait component
export const BASE_UNITS = [
{ id:"ignis-ronin", name:"Ignis Ronin", element:"ember", rarity:"S", emoji:"🔥⚔️", portrait:"🔥", stats:{hp:1100, atk:155, def:85, spd:108}, skills:["Hellbrand","Arc Strike"], lore:"A wandering blade-witch whose katana sings with wildfire spirits." },
{ id:"tidal-warden", name:"Tidal Warden", element:"aqua", rarity:"A", emoji:"💧🛡️", portrait:"💧", stats:{hp:1300, atk:130, def:120, spd:96}, skills:["Tidal Lock","Arc Strike"], lore:"Guardian of the moon-tide vaults, calm as the abyss." },
{ id:"gale-duelist", name:"Gale Duelist", element:"gale", rarity:"B", emoji:"💨⚔️", portrait:"💨", stats:{hp:900, atk:120, def:80, spd:128}, skills:["Tempest Flurry","Arc Strike"], lore:"A skyborne fencer who reads the wind like a book." },
{ id:"terra-sentinel", name:"Terra Sentinel", element:"terra", rarity:"A", emoji:"⛰️🛡️", portrait:"⛰️", stats:{hp:1500, atk:110, def:150, spd:88}, skills:["Stone Aegis","Arc Strike"], lore:"A living bastion, etched with first-mountain runes." },
{ id:"arc-oracle", name:"Arc Oracle", element:"arc", rarity:"SS", emoji:"✨⚡", portrait:"✨", stats:{hp:1000, atk:175, def:95, spd:112}, skills:["Arc Strike","Tempest Flurry"], lore:"Seer of the Hollow Stars, weaving lightning into fate." },
{ id:"ember-ravager", name:"Ember Ravager", element:"ember", rarity:"A", emoji:"🔥🗡️", portrait:"🔥", stats:{hp:1050, atk:150, def:80, spd:115}, skills:["Hellbrand","Gale Cut-In"], lore:"Bandit lord crowned in cinders." },
{ id:"brine-slinger", name:"Brine Slinger", element:"aqua", rarity:"B", emoji:"🌊🏹", portrait:"🌊", stats:{hp:920, atk:118, def:75, spd:124}, skills:["Tidal Lock","Tempest Flurry"], lore:"A corsair who snares foes with moonlines." },
{ id:"cyclone-monk", name:"Cyclone Monk", element:"gale", rarity:"A", emoji:"🌀🧘", portrait:"🌀", stats:{hp:980, atk:135, def:90, spd:135}, skills:["Tempest Flurry","Aether Chant"], lore:"Breathes the mantra of storms." },
{ id:"bastion-golem", name:"Bastion Golem", element:"terra", rarity:"S", emoji:"🗿", portrait:"🗿", stats:{hp:1700, atk:120, def:170, spd:70}, skills:["Stone Aegis","Earthen Roar"], lore:"Citadel-hewn protector." },
{ id:"quantum-scribe", name:"Quantum Scribe", element:"arc", rarity:"S", emoji:"📜⚡", portrait:"📜", stats:{hp:1020, atk:165, def:95, spd:118}, skills:["Arc Strike","Aether Chant"], lore:"Writes futures in charged glyphs." },
];


export const BANNERS = [
{ id:"standard", name:"Standard Gate", desc:"Balanced rates across all units.", rates:RarityWeightsBase, featured:[] },
{ id:"starfall", name:"Starfall Vision", desc:"SS Arc Oracle rate-up; Arc units boosted.", rates:[{r:"SS",p:0.03},{r:"S",p:0.12},{r:"A",p:0.25},{r:"B",p:0.60}], featured:["arc-oracle","quantum-scribe"] },
{ id:"earthwall", name:"Earthwall Aegis", desc:"Defenders up! Terra boosted.", rates:[{r:"SS",p:0.02},{r:"S",p:0.10},{r:"A",p:0.30},{r:"B",p:0.58}], featured:["bastion-golem","terra-sentinel"] },
];


// Story nodes
export const STORY_NODES = {
start:{ id:"start", type:"camp", text:"Lumenfall Ruins — A dying fire. Your Bond stirs.", next:["n1","n2"], reward:{shards:50}},
n1:{ id:"n1", type:"battle", text:"Dockside Skirmish — Corsairs test your mettle.", next:["n3"], enemyPower:1 },
n2:{ id:"n2", type:"loot", text:"Moonvault — You find a sigil cache.", next:["n3"], reward:{shards:100} },
n3:{ id:"n3", type:"elite", text:"Windway Duel — A monk of storms blocks the bridge.", next:["n4","n5"], enemyPower:1.5 },
n4:{ id:"n4", type:"camp", text:"Wayside Shrine — Your allies breathe.", next:["boss"], reward:{heal:0.5} },
n5:{ id:"n5", type:"loot", text:"Forgotten Armory — Runes hum under dust.", next:["boss"], reward:{shards:150} },
boss:{ id:"boss", type:"boss", text:"The Ashen Gate — A guardian descends.", next:[], enemyPower:2.2 },
};