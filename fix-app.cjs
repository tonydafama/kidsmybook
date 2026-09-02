const fs = require("fs");
const path = "src/App.tsx";
const lines = fs.readFileSync(path, "utf8").split(/\r?\n/);
// Remove leftover orphaned HomePage body (1-indexed 261-397)
const next = [...lines.slice(0, 260), ...lines.slice(397)].join("\n");
fs.writeFileSync(path, next.endsWith("\n") ? next : next + "\n");
console.log("removed leftover lines, now", next.split("\n").length, "lines");
