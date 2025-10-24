import React from "react";
import { Flame, Droplets, Wind, Mountain, Zap, Star } from "lucide-react";

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

export default function UnitBadge({ u }) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/10">{u.rarity}</span>
      <ElementIcon e={u.element} />
    </div>
  );
}
