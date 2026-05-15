# Multi-Chrome Agent Workspace

This workspace is a local template for running several browser workers against separate Chrome profiles.

## Layout

- `launch_chrome.sh`: starts isolated Chrome instances on ports `9223` through `9227`.
- `kill_chrome.sh`: stops those Chrome instances and removes their temp profiles.
- `chat.md`: shared task board for the orchestrator and browser workers.
- `chrome-agent-N/.mcp.json`: Chrome DevTools MCP config for agent `N`.
- `chrome-agent-N/CLAUDE.md`: worker instructions.

## Basic Flow

From the repo root:

```bash
bash multi-chrome-agent-workspace/launch_chrome.sh 3
```

Then start one external Claude Code session per worker directory:

```bash
cd multi-chrome-agent-workspace/chrome-agent-1 && claude
cd multi-chrome-agent-workspace/chrome-agent-2 && claude
cd multi-chrome-agent-workspace/chrome-agent-3 && claude
```

Each worker should read `../chat.md`, execute only its assigned section, and append status/results under its agent heading.

When complete:

```bash
bash multi-chrome-agent-workspace/kill_chrome.sh
```

## Current Limitations

- This requires Chrome DevTools MCP availability in each external Claude session.
- Nested Claude Code sessions may be blocked by environment variables; start workers from normal terminal tabs when possible.
- CAPTCHA, login, and anti-bot pages require manual handling or skipping.
- The checked-in `chat.md` and old snapshots are examples from a prior run, not current source of truth.

## Git Hygiene

Worker logs, browser snapshots, and generated task outputs should stay untracked. The workspace structure and MCP configs are source; run artifacts are not.
