import React from "react";
import { Button, Card, CardHeader, CardTitle, CardContent } from "../ui-fallbacks.jsx";

export default function StoryMap({ curNode, inBattle, setNodeId, enterNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Story Map</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-3 rounded-2xl bg-gradient-to-tr from-slate-50 to-white/60 dark:from-slate-800/40 dark:to-slate-900/30 border border-slate-200 dark:border-slate-800">
          <div className="text-sm opacity-80 mb-2">{curNode.text}</div>
          <div className="flex items-center gap-2 mb-3">
            <Button onClick={() => enterNode(curNode)} disabled={inBattle}>Enter</Button>
            <div className="text-xs opacity-70">Tip: loot/camp nodes grant 💎 or healing.</div>
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
  );
}
