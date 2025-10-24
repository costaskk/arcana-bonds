import React, { useState } from "react";

export default function AnimatedClip({ id, type = "idle", width = 240, height = 240, className = "", poster }) {
  const [errored, setErrored] = useState(false);
  const src = `/anims/${id}_${type}.webm`;
  if (errored) return null; // hide cleanly

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
      poster={poster}
      onError={() => setErrored(true)}
      style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45))", borderRadius: 16 }}
    />
  );
}
