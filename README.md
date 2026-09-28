# VibeDefender plugins

Plugins that bring the [VibeDefender](https://vibedefender.com.br) security scanner to AI coding tools.

**This repository does not contain the scanner.** Each plugin is a thin adapter: it tells the agent to run the published `vibedefender` package from npm in the user's project and to report its result. Detection rules, scoring and everything else live in the scanner, which is proprietary and distributed on npm. When the scanner improves, every plugin benefits immediately, without a plugin update.

| Platform | Folder | Status |
| --- | --- | --- |
| Cursor | [`plugins/cursor`](plugins/cursor) | Ready for Marketplace review |

## Layout

```
shared/skill/SKILL.template.md   The one skill, shared by every platform
shared/platforms.json            Per-platform values (the --origem attribution id, output paths)
plugins/<platform>/              Platform manifest, generated skill, assets and listing README
.cursor-plugin/marketplace.json  Cursor marketplace index for this repository
scripts/build.mjs                Generates each platform's SKILL.md from the template
scripts/check.mjs                Validates manifests, skills and runs the exposure audit
scripts/contract-test.mjs        Runs the published scanner and checks the integration contract
```

## Integration contract

Plugins call the scanner with `--resumo-json`, which prints a JSON summary (`contract: 1`): score, number of problems, per-check status, plan status and the plans link. It never contains file paths, line numbers, code or fix prompts — those come from `vibedefender --json` and only for plans that unlock them. Fields may be added within contract 1; if a field changes meaning or is removed, the contract number goes up and plugins tell the user to update.

## Development

```
node scripts/build.mjs          # after editing shared/skill/SKILL.template.md
node scripts/check.mjs          # before every commit
node scripts/contract-test.mjs  # needs Node 20+ and internet (downloads the scanner)
```

Plugins may only run the commands allowlisted in `scripts/check.mjs`. Hooks and MCP servers are rejected by the check until explicitly reviewed.

## Security

See [SECURITY.md](SECURITY.md).

## License

MIT for the contents of this repository. The VibeDefender scanner is proprietary and licensed separately.
