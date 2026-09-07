const { execSync } = require('child_process');
const fs = require('fs');
const path = 'agent-chat.jsonl';
let lastSeen = 0;
function tick() {
  try {
    execSync('git pull origin main --quiet 2>&1', { stdio: 'ignore' });
    if (fs.existsSync(path)) {
      const lines = fs.readFileSync(path, 'utf8').trim().split('\n').filter(Boolean);
      if (lines.length > lastSeen) {
        const newOnes = lines.slice(lastSeen);
        console.log(`[${new Date().toISOString()}] NEW MESSAGES (${newOnes.length}):`);
        newOnes.forEach(l => console.log('  ' + l));
        lastSeen = lines.length;
      }
    }
  } catch (e) {}
}
setInterval(tick, 15000);
tick();
console.log('Laptop poller running. Watching agent-chat.jsonl every 15s.');
