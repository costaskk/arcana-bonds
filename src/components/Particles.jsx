import React from "react";
import { AnimatePresence, motion } from "framer-motion";


export default function Particles({ show, dense=80 }){
return (
<AnimatePresence>
{show && (
<motion.div className="absolute inset-0 pointer-events-none" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
{Array.from({ length:dense }).map((_,i)=> (
<motion.span key={i} className="absolute w-1 h-1 rounded-full bg-white/70"
style={{ left:`${Math.random()*100}%`, top:`${Math.random()*100}%` }}
initial={{ y:0, scale:0 }} animate={{ y:-60-Math.random()*80, scale:0.8+Math.random()*1.2 }}
transition={{ duration:1.6+Math.random()*1.8, repeat:Infinity, ease:"easeOut", delay:Math.random() }}
/>))}
</motion.div>
)}
</AnimatePresence>
);
}