# Agent Workflows

This directory turns the experimental multi-agent notes in the repo root into a practical operating guide for this project.

## What is ready to use

### Built-in Codex subagents

Use these for codebase work when you explicitly want parallel agents. Good fits:

- Independent codebase investigations, such as "find all places theme colors are hardcoded" and "find tests covering analytics".
- Disjoint implementation work where each worker owns separate files.
- Independent review of a non-trivial patch.

In this Codex environment, subagents are available through the native agent tools, not through the Claude `Task` syntax used in some of the imported notes.

### Model Chat

`tools/model-chat/model_chat.py` is the portable version of `model-chat-skill/model_chat.py`. It runs several Claude API calls with different framings, then writes outputs to:

```text
active/model-chat/<YYYYMMDD-HHMMSS>/
```

Run it from the repo root:

```bash
python3 tools/model-chat/model_chat.py "Should Outfit Oracle prioritize try-before-profile or paid tier next?" --agents 5 --rounds 3
```

Requirements:

- `ANTHROPIC_API_KEY` available to the Python process, usually via `.env`.
- Python packages: `anthropic` and `python-dotenv`.

The generated `active/` directory is ignored by git.

## What needs integration before use

### Multi-Chrome Agent Workspace

`multi-chrome-agent-workspace/` can launch isolated Chrome instances, but the worker instructions and original skill were imported from a different machine. The local workspace has been normalized enough to use as a template, but it still requires an external Claude Code session per browser agent and Chrome DevTools MCP availability.

Use it for browser-heavy tasks only when:

- The task requires JavaScript-rendered pages.
- The task can be split cleanly across independent targets.
- The user is comfortable with multiple browser windows and possible CAPTCHA/manual login handling.

Generated browser snapshots, logs, and temporary outputs are ignored by git.

### Gemini Video Passthrough

`Video-to-Action via Gemini Passthrough.md` is a useful playbook, but this session does not currently expose a Gemini video-analysis MCP tool. If that connector is installed later, the workflow can be turned into a real skill.

## Root Notes

The top-level markdown files are still useful as source material:

- `Stochastic Multi-Agent Consensus.md`: polling many agents for rankings or recommendations.
- `Agent Chatrooms.md`: structured debate among role-framed agents.
- `Subagent Verification Loops.md`: fresh-reviewer pattern for non-trivial patches.
- `Multi-Agent MCP Orchestration.md`: concept doc for MCP-managed workers.
- `GEMINI (Self Modifying).md`: self-correcting rules concept.

Treat them as patterns, not executable instructions, until they are converted to repo-local tooling.
