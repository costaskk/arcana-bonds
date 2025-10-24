import React from "react";
import UnitCard from "./UnitCard";


export default function Roster({ inventory, team, toggleTeam }){
return (
<div>
<div className="grid md:grid-cols-3 gap-3">
{inventory.map((u, idx)=>{
const inTeam = !!team.find(t => (t.rollId||t.id)===(u.rollId||u.id));
return <UnitCard key={(u.rollId||u.id)+idx} unit={u} inTeam={inTeam} onAdd={()=>toggleTeam(u)} />
})}
</div>
<div className="mt-4">
<div className="text-sm opacity-80 mb-2">Team:</div>
<div className="flex gap-2 flex-wrap">
{team.map((u,i)=>(<span key={i} className="px-2 py-0.5 rounded-full bg-slate-900/5 dark:bg-white/10">{u.name} <span className="opacity-70">({u.element})</span></span>))}
</div>
</div>
</div>
);
}