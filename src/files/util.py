import os
import re
from pathlib import Path
import anthropic
from dotenv import load_dotenv

# Load the project root .env so both ANTHROPIC_API_KEY and
# EXPO_PUBLIC_CLAUDE_API_KEY are available without manual exporting.
_env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(_env_path)

# The Anthropic SDK reads ANTHROPIC_API_KEY automatically.
# Fall back to the Expo public key if only that one is present.
if not os.environ.get("ANTHROPIC_API_KEY"):
    expo_key = os.environ.get("EXPO_PUBLIC_CLAUDE_API_KEY", "")
    if expo_key:
        os.environ["ANTHROPIC_API_KEY"] = expo_key

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = anthropic.Anthropic()
    return _client

def llm_call(prompt: str, system_prompt: str = "", model: str = "claude-sonnet-4-6") -> str:
    """Send a prompt to Claude and return the text response."""
    client = _get_client()
    messages = [{"role": "user", "content": prompt}]
    kwargs = {"model": model, "max_tokens": 4096, "messages": messages}
    if system_prompt:
        kwargs["system"] = system_prompt
    response = client.messages.create(**kwargs)
    return response.content[0].text

def extract_xml(text: str, tag: str) -> str:
    """Extract content from XML tags using regex."""
    pattern = rf"<{tag}>(.*?)</{tag}>"
    match = re.search(pattern, text, re.DOTALL)
    return match.group(1).strip() if match else ""
