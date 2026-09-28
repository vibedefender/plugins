#!/usr/bin/env node
// Runs the published VibeDefender scanner exactly as the plugins do and checks the integration
// contract they rely on. Needs Node 20+ and internet (npx downloads the scanner).
//
//   node scripts/contract-test.mjs

import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const windows = process.platform === 'win32';
let failures = 0;
const check = (ok, message) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${message}`); if (!ok) failures++; };

// Fixed arguments only. On Windows, npx is a .cmd file and must go through the shell.
function scan(cwd) {
  const args = ['-y', 'vibedefender@latest', '--resumo-json', '--origem', 'ci'];
  const result = spawnSync(windows ? 'npx.cmd' : 'npx', args, {
    cwd,
    encoding: 'utf8',
    shell: windows,
    timeout: 300_000,
    env: { ...process.env, VIBEDEFENDER_TELEMETRIA: '0', NO_COLOR: '1' },
  });
  let json = null;
  try { json = JSON.parse(result.stdout); } catch { /* reported below */ }
  return { code: result.status, json, stderr: result.stderr };
}

// A folder with files: this repository.
{
  const r = scan(root);
  check(r.json !== null, 'stdout is a single JSON object');
  check(r.json?.contract === 1 && r.json?.tool === 'vibedefender', 'contract 1');
  check(typeof r.json?.score === 'number' && r.json.score >= 0 && r.json.score <= 100, 'score between 0 and 100');
  check(Array.isArray(r.json?.checks) && r.json.checks.length > 0, 'per-check results');
  check(r.json?.account?.status === 'not-connected', 'no account on CI');
  check(r.json?.links?.plans?.includes('utm_source=ci'), 'plans link carries the attribution');
  check(r.code === 0 || r.code === 1, `exit code 0 or 1 (got ${r.code})`);
  if (r.json === null) console.error(r.stderr);
}

// An empty folder: no score, a warning, exit code 0.
{
  const empty = mkdtempSync(join(tmpdir(), 'vibedefender-empty-'));
  const r = scan(empty);
  check(r.json?.score === null && r.json?.warnings?.includes('no-files'), 'empty folder: no score, no-files warning');
  check(r.code === 0, 'empty folder: exit code 0');
  rmSync(empty, { recursive: true, force: true });
}

console.log(failures === 0 ? '\ncontract ok' : `\n${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
