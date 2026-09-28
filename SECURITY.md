# Security

Please report security problems in these plugins or in the VibeDefender scanner privately to **sac.vibedefender@gmail.com**. Do not open a public issue for a vulnerability.

What these plugins do, so you can review them quickly:

- They contain instructions (skills) and metadata only. No hooks, no MCP servers, no code that runs automatically.
- The only commands they ask the agent to run are `node --version`, `npx -y vibedefender@latest --resumo-json --origem <platform>` and `npx -y vibedefender@latest --json`. `scripts/check.mjs` enforces this list.
- No text from the user, from files or from tool output is ever placed into a command.
- The scanner analyzes the project locally. The plugins send nothing anywhere.
