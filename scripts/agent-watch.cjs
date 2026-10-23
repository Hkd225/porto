/**
 * agent-watch.cjs — babysits the local chat agent.
 *
 * Spawns scripts/agent-dev.cjs and keeps it alive:
 *   - respawn 3s after any exit (with a restart counter + timestamp)
 *   - every 15s a quiet port probe (GET /api/chat — 404 means alive):
 *     if the child looks alive but the port is dead, it is killed so the
 *     exit handler can do the respawn
 *
 * Run instead of chat:dev:  node scripts/agent-watch.cjs
 * Logs land in the shell's own output — restarts are visible evidence.
 */

const { spawn } = require('node:child_process');
const path = require('node:path');

const DEV = path.join(__dirname, 'agent-dev.cjs');
const PORT = Number(process.env.CHAT_PORT || 8787);
const URL = `http://localhost:${PORT}/api/chat`;

let proc = null;
let restarts = 0;

const stamp = () => new Date().toLocaleTimeString('en-GB');

function start(reason) {
  restarts++;
  proc = spawn(process.execPath, [DEV], { stdio: 'inherit' });
  console.log(`[watch] ${stamp()} start #${restarts} (${reason}) pid=${proc.pid}`);

  proc.on('exit', (code, sig) => {
    console.log(`[watch] ${stamp()} agent-dev exit code=${code} sig=${sig}`);
    setTimeout(() => start('respawn'), 3000);
  });
}

start('cold');

/* the periodic check */
setInterval(async () => {
  if (!proc || proc.exitCode !== null) return; /* exit handler is on it */
  try {
    await fetch(URL, { signal: AbortSignal.timeout(4000) });
  } catch {
    console.log(`[watch] ${stamp()} port probe failed — restarting the child`);
    try {
      proc.kill();
    } catch {
      /* already gone */
    }
  }
}, 15_000);

process.on('SIGINT', () => {
  if (proc) proc.kill();
  process.exit(0);
});
