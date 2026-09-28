#!/usr/bin/env node
// Generates each platform's SKILL.md from the single source in shared/skill/SKILL.template.md.
//
// One skill, many platforms: the only thing that changes per platform is the `--origem` value,
// which tells the VibeDefender website which integration a visitor came from. Edit the template,
// run `node scripts/build.mjs`, and commit the generated files.
//
//   node scripts/build.mjs          write the generated files
//   node scripts/build.mjs --check  fail if a generated file is out of date

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const template = readFileSync(resolve(root, 'shared/skill/SKILL.template.md'), 'utf8');
const platforms = JSON.parse(readFileSync(resolve(root, 'shared/platforms.json'), 'utf8'));
const checkOnly = process.argv.includes('--check');

const NOTICE = '<!-- Generated from shared/skill/SKILL.template.md by scripts/build.mjs. Edit the template, not this file. -->';

let stale = 0;
for (const [platform, config] of Object.entries(platforms)) {
  if (!/^[a-z0-9][a-z0-9-]{0,31}$/.test(config.source)) {
    throw new Error(`${platform}: invalid source "${config.source}"`);
  }
  // The notice goes right after the frontmatter: a SKILL.md must start with it.
  const body = template.replaceAll('{{SOURCE}}', config.source);
  const end = body.indexOf('\n---\n', 4);
  if (!body.startsWith('---\n') || end === -1) throw new Error('template: missing frontmatter');
  const output = `${body.slice(0, end + 5)}\n${NOTICE}\n${body.slice(end + 5)}`;
  if (output.includes('{{')) throw new Error(`${platform}: unreplaced placeholder`);

  const target = resolve(root, config.skill);
  const current = existsSync(target) ? readFileSync(target, 'utf8') : null;
  if (current === output) continue;
  if (checkOnly) {
    console.error(`out of date: ${config.skill} (run node scripts/build.mjs)`);
    stale++;
    continue;
  }
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, output);
  console.log(`wrote ${config.skill}`);
}

if (stale > 0) process.exit(1);
