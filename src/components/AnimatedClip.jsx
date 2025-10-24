import React from "react";

// Plays /public/anims/<id>_<type>.webm if it exists.
// type: "idle" | "attack" | "ult"
export default function AnimatedClip({ id, type="idle", width=240, height=240, className="" }) {
  const src = `/anims/${id}_${type}.webm`;
  return (
    <video
      className={className}
      width={width}
      height={height}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      onError={(e) => { e.currentTarget.style.display = "none"; }} // hide if missing
      style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45))", borderRadius: 16 }}
    />
  );
}
