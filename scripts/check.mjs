#!/usr/bin/env node
// Checks everything in this repository before a release. No dependencies.
//
// 1. Generated skills are up to date with the template.
// 2. Manifests are valid and every referenced path exists.
// 3. Skills have valid frontmatter.
// 4. Skills only contain the allowed commands, so a future edit cannot slip in a command that
//    interpolates user input.
// 5. Exposure audit: no secrets, keys, tokens, source maps, env files or unexpected file types.
//
//   node scripts/check.mjs

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, relative, resolve, extname, basename } from 'node:path';

const root = resolve(import.meta.dirname, '..');
let errors = 0;
const fail = (message) => { errors++; console.error(`ERROR: ${message}`); };
const readJson = (path) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));

// 1. Generated files
try {
  execFileSync(process.execPath, [resolve(root, 'scripts/build.mjs'), '--check'], { stdio: 'inherit' });
} catch {
  fail('generated skills are out of date');
}

// 2. Manifests
const NAME = /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/;
const marketplace = readJson('.cursor-plugin/marketplace.json');
if (!NAME.test(marketplace.name ?? '')) fail('marketplace.json: invalid name');
for (const entry of marketplace.plugins ?? []) {
  const dir = resolve(root, entry.source);
  const manifestPath = join(dir, '.cursor-plugin/plugin.json');
  if (!existsSync(manifestPath)) { fail(`${entry.source}: missing .cursor-plugin/plugin.json`); continue; }
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.name !== entry.name) fail(`${entry.source}: name "${manifest.name}" does not match marketplace entry "${entry.name}"`);
  if (!NAME.test(manifest.name ?? '')) fail(`${entry.source}: invalid plugin name`);
  for (const field of ['displayName', 'description', 'version', 'license', 'homepage', 'repository', 'logo']) {
    if (typeof manifest[field] !== 'string' || manifest[field] === '') fail(`${entry.source}: missing ${field}`);
  }
  if (!/^\d+\.\d+\.\d+$/.test(manifest.version ?? '')) fail(`${entry.source}: version must be semver`);
  if (manifest.logo && !existsSync(join(dir, manifest.logo))) fail(`${entry.source}: logo not found`);
  for (const field of ['skills', 'rules', 'agents', 'commands']) {
    for (const path of [manifest[field] ?? []].flat()) {
      if (!existsSync(join(dir, path))) fail(`${entry.source}: ${field} path not found: ${path}`);
    }
  }
  // Plugins here only use skills. Hooks and MCP servers would run code automatically; adding one
  // must be a deliberate, reviewed decision.
  for (const field of ['hooks', 'mcpServers']) {
    if (manifest[field] !== undefined) fail(`${entry.source}: ${field} is not allowed without review`);
  }
  if (existsSync(join(dir, 'mcp.json')) || existsSync(join(dir, 'hooks'))) fail(`${entry.source}: mcp.json/hooks not allowed without review`);
}

// 3 & 4. Skills
const platforms = readJson('shared/platforms.json');
for (const [platform, config] of Object.entries(platforms)) {
  const text = readFileSync(resolve(root, config.skill), 'utf8');
  const front = /^---\nname: ([^\n]+)\ndescription: ([^\n]+)\n---\n/.exec(text);
  if (!front) { fail(`${config.skill}: invalid frontmatter`); continue; }
  const [, name, description] = front;
  if (name !== basename(resolve(root, config.skill, '..'))) fail(`${config.skill}: name must match its folder`);
  if (name.length > 64 || !NAME.test(name)) fail(`${config.skill}: invalid skill name`);
  if (description.length > 1024) fail(`${config.skill}: description longer than 1024 characters`);

  const allowed = new Set([
    'node --version',
    `npx -y vibedefender@latest --resumo-json --origem ${config.source}`,
    'npx -y vibedefender@latest --json',
  ]);
  const blocks = [...text.matchAll(/```[a-z]*\n([\s\S]*?)```/g)].map((m) => m[1].trim());
  for (const block of blocks) {
    if (!allowed.has(block)) fail(`${config.skill} (${platform}): command not in the allowlist: ${block}`);
  }
  if (blocks.length !== allowed.size) fail(`${config.skill}: expected ${allowed.size} command blocks, found ${blocks.length}`);
}

// 5. Exposure audit
const ALLOWED_EXTENSIONS = new Set(['.md', '.json', '.mjs', '.yml', '.png', '']);
const ALLOWED_DOTFILES = new Set(['.gitignore', '.gitattributes']);
const SECRETS = [
  [/sk_(live|test)_[A-Za-z0-9]{8,}/, 'Stripe-style secret key'],
  [/service_role/i, 'Supabase service role reference'],
  [/eyJ[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}/, 'JWT'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'private key'],
  [/AKIA[0-9A-Z]{16}/, 'AWS access key'],
  [/gh[pousr]_[A-Za-z0-9]{20,}/, 'GitHub token'],
  [/npm_[A-Za-z0-9]{20,}/, 'npm token'],
  [/xox[abprs]-[A-Za-z0-9-]{10,}/, 'Slack token'],
  [/[a-z0-9]{20}\.supabase\.co/, 'Supabase project URL'],
  [/workers\.dev/, 'Cloudflare workers.dev URL'],
];

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '.git' || entry.name === 'node_modules') continue;
    const path = join(dir, entry.name);
    const rel = relative(root, path).replaceAll('\\', '/');
    if (entry.isDirectory()) { walk(path); continue; }
    const ext = extname(entry.name);
    if (entry.name.startsWith('.') && !ALLOWED_DOTFILES.has(entry.name)) fail(`unexpected dotfile: ${rel}`);
    if (!ALLOWED_EXTENSIONS.has(ext)) fail(`unexpected file type: ${rel}`);
    if (ext === '.mjs' && !rel.startsWith('scripts/')) fail(`script outside scripts/: ${rel}`);
    const size = statSync(path).size;
    if (size > 1_500_000) fail(`file too large: ${rel}`);
    // PNGs are checked by type and size only; this file is skipped because it lists the patterns.
    if (ext === '.png' || rel === 'scripts/check.mjs') continue;
    const text = readFileSync(path, 'utf8');
    for (const [pattern, label] of SECRETS) {
      if (pattern.test(text)) fail(`${label} in ${rel}`);
    }
    if (/sourceMappingURL/.test(text)) fail(`source map reference in ${rel}`);
  }
}
walk(root);

if (errors > 0) {
  console.error(`\n${errors} problem(s).`);
  process.exit(1);
}
console.log('check ok');
