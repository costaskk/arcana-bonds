import React, { useState } from "react";
import { motion } from "framer-motion";

// Portrait tries to load /public/portraits/<id>.png.
// If it fails, it falls back to the procedural ring + glyph.
export default function Portrait({ id, glyph, rarity="B", size=96, className="" }) {
  const [errored, setErrored] = useState(false);
  const ring = rarity === "SS" ? "from-yellow-200 via-fuchsia-300 to-cyan-300"
    : rarity === "S"  ? "from-fuchsia-300 to-cyan-300"
    : rarity === "A"  ? "from-cyan-300 to-sky-300"
    :                   "from-slate-300 to-slate-200";

  if (!errored) {
    return (
      <div className={`relative inline-block ${className}`} style={{ width:size, height:size }}>
        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${ring} blur-sm opacity-70`} />
        <motion.img
          src={`/portraits/${id}.png`}
          alt={`${id} portrait`}
          className="relative w-full h-full rounded-full object-cover border border-white/15 bg-slate-900/60"
          onError={() => setErrored(true)}
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.35 }}
        />
      </div>
    );
  }

  // Fallback (no image found)
  return (
    <div className={`relative inline-block ${className}`} style={{ width:size, height:size }}>
      <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${ring} blur-sm opacity-70`} />
      <motion.div
        className="relative w-full h-full rounded-full bg-slate-900/60 flex items-center justify-center border border-white/15"
        animate={{ y: [0,-2,0] }} transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
      >
        <span style={{ fontSize: size*0.45 }} aria-hidden>{glyph}</span>
      </motion.div>
    </div>
  );
}
