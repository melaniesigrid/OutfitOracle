# Model Chat Tool

Runs several Claude API calls with different agent framings, collects a debate transcript, and writes a synthesis.

## Run

```bash
python3 tools/model-chat/model_chat.py "What should we build next?" --agents 5 --rounds 3
```

Interactive mode:

```bash
python3 tools/model-chat/model_chat.py "Debate the onboarding architecture" --interactive
```

## Requirements

- `ANTHROPIC_API_KEY` in the environment or repo `.env`
- Python packages:

```bash
python3 -m pip install -r tools/model-chat/requirements.txt
```

## Output

Generated files are written to:

```text
active/model-chat/<YYYYMMDD-HHMMSS>/
```

`active/` is ignored by git.
