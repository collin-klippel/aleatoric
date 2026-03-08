import { spawn, execFile } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const PORT = 5173;
const POLL_MS = 300;
const TIMEOUT_MS = 120_000;

/** @type {import('node:child_process').ChildProcess | undefined} */
let child;

let shuttingDown = false;

function killChild() {
  if (child && child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
  }
}

function waitForHttpOk(port) {
  const url = `http://127.0.0.1:${port}/`;
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + TIMEOUT_MS;
    const tick = () => {
      if (Date.now() > deadline) {
        reject(new Error(`Timed out waiting for docs server on port ${port}`));
        return;
      }
      const req = http.get(url, (res) => {
        res.resume();
        resolve();
      });
      req.on('error', () => {
        req.destroy();
        setTimeout(tick, POLL_MS);
      });
    };
    tick();
  });
}

function openUrl(url) {
  const platform = process.platform;
  if (platform === 'darwin') {
    execFile('open', [url]);
  } else if (platform === 'win32') {
    spawn('cmd', ['/c', 'start', '', url], {
      detached: true,
      stdio: 'ignore',
    }).unref();
  } else {
    execFile('xdg-open', [url], () => {});
  }
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  killChild();
  process.exit(code);
}

process.on('SIGINT', () => shutdown(130));
process.on('SIGTERM', () => shutdown(143));

child = spawn('npm', ['run', 'docs:dev', '-w', 'aleatoric-docs'], {
  cwd: repoRoot,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});

child.on('exit', (code, signal) => {
  if (shuttingDown) return;
  if (signal) {
    shutdown(signal === 'SIGINT' ? 130 : 1);
  } else if (code !== 0 && code !== null) {
    console.error(`docs:dev for aleatoric-docs exited with code ${code}`);
    shutdown(code);
  }
});

try {
  await waitForHttpOk(PORT);
} catch (err) {
  console.error(err);
  shutdown(1);
}

openUrl(`http://127.0.0.1:${PORT}/`);

await new Promise(() => {});
