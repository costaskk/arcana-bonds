import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const pub = (p) => path.join(root, "public", p);
const manifest = JSON.parse(fs.readFileSync(path.join(root, "tools", "manifest.json"), "utf8"));

let missing = [];
for (const id of manifest.units) {
  if (manifest.requirePortrait) {
    const p = pub(path.join("portraits", `${id}.png`));
    if (!fs.existsSync(p)) missing.push(p);
  }
  for (const type of manifest.requireClips) {
    const v = pub(path.join("anims", `${id}_${type}.webm`));
    if (!fs.existsSync(v)) missing.push(v);
  }
}

if (missing.length) {
  console.log("Missing assets:");
  for (const m of missing) console.log(" -", path.relative(root, m));
  process.exitCode = 1;
} else {
  console.log("All required assets present ✅");
}
