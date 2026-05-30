"""
Outfit Oracle — Orchestrator-Workers consultation engine.

Note: `from __future__ import annotations` is required for Python 3.9
compatibility — it defers annotation evaluation so `X | None` syntax works
without the Python 3.10+ union operator.


The orchestrator reads the weather, occasion, and style profile, then
dynamically decides which outfit "lenses" are most valuable for that specific
context.  Each worker generates a complete outfit set for its assigned lens.

Run:
    python orchestrator.py

Requires ANTHROPIC_API_KEY in the environment.
"""

from __future__ import annotations

import json
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
from util import extract_xml, llm_call

RESULTS_DIR = Path(__file__).parent / "results"
RESULTS_DIR.mkdir(exist_ok=True)

MODEL = "claude-sonnet-4-6"


# ── Data model ────────────────────────────────────────────────────────────────

@dataclass
class WeatherInput:
    city: str
    country: str
    temp: float          # °C
    feels_like: float    # °C
    condition: str       # e.g. "Overcast"
    humidity: int        # %
    wind_speed: float    # km/h


@dataclass
class StyleProfile:
    keywords: list[str] = field(default_factory=list)   # e.g. ["Minimal", "Classic"]
    budget: str = "contemporary"                          # high-street | contemporary | luxury
    personality: str = "editorial"                        # diplomatic | editorial | savage
    temp_sensitivity: str = "normal"                      # runs-cold | normal | runs-hot
    name: str = "The Regular"


@dataclass
class OutfitLens:
    type: str           # e.g. "polished-commuter"
    description: str    # orchestrator's brief for the worker
    vibe: str           # worker output
    verdict: str        # worker output
    rating: int         # 1–5
    outfits: list[dict] # OutfitItem list
    avoid: list[str]


# ── XML parsing ───────────────────────────────────────────────────────────────

def parse_tasks(tasks_xml: str) -> list[dict]:
    tasks: list[dict] = []
    current: dict = {}
    for line in tasks_xml.split("\n"):
        line = line.strip()
        if not line:
            continue
        if line.startswith("<task>"):
            current = {}
        elif line.startswith("<type>"):
            current["type"] = line[6:-7].strip()
        elif line.startswith("<description>"):
            current["description"] = line[13:-14].strip()
        elif line.startswith("</task>"):
            if "description" in current:
                current.setdefault("type", "default")
                tasks.append(current)
    return tasks


# ── Prompts ───────────────────────────────────────────────────────────────────

ORCHESTRATOR_PROMPT = """
You are the Outfit Oracle's strategic mind. Study this consultation and determine
the 2–4 most valuable outfit approaches for this exact context.

CONSULTATION:
  City:        {city}, {country}
  Temperature: {temp}°C (feels like {feels_like}°C)
  Condition:   {condition}
  Humidity:    {humidity}% | Wind: {wind_speed} km/h
  Occasion:    {occasion}
  Gender:      {gender}
  Aesthetic:   {keywords}
  Budget:      {budget}
  Temp sense:  {temp_sensitivity}
  Voice:       {personality}

Choose lenses that are specific to THIS context — not generic categories.
Examples of good lenses:
  - "storm-ready editorial"  for a gale-force rain day
  - "power-dressing-in-heat" for a formal meeting in 34°C
  - "coastal-minimalist"     for a sunny seaside weekend
  - "après-ski-glam"         for a cold ski-town evening

Return ONLY this XML — no preamble, no markdown:

<analysis>
Explain the key tension points in this consultation (weather severity × occasion
formality × aesthetic × budget) and why you chose each lens.
</analysis>

<tasks>
    <task>
        <type>lens-name-hyphenated</type>
        <description>Precise brief for this lens: what it must prioritise, what distinguishes it from the other lenses, any specific items or styling constraints tied to the weather/occasion/profile.</description>
    </task>
</tasks>
"""

# Double-brace {{ }} escapes literal braces inside a .format() template.
WORKER_PROMPT = """
You are the Outfit Oracle — a devastatingly chic AI fashion authority.
Generate a complete outfit recommendation for your assigned lens.

WEATHER:
  City:        {city}, {country}
  Temperature: {temp}°C (feels like {feels_like}°C)
  Condition:   {condition}
  Humidity:    {humidity}% | Wind: {wind_speed} km/h

CONSULTATION:
  Occasion:   {occasion}
  Gender:     {gender}
  Aesthetic:  {keywords}
  Budget:     {budget}
  Temp sense: {temp_sensitivity}

YOUR LENS:  {task_type}
BRIEF:      {task_description}

The vibe, choices, and verdict must fully embody the assigned lens — not a generic
recommendation. Be specific to the actual weather numbers and occasion.

Respond ONLY with a valid JSON object inside <response> tags.
No markdown, no backticks, no text outside the tags.

<response>
{{
  "vibe": "3–5 word vibe name specific to this lens",
  "verdict": "2–3 punchy sentences about this lens and why it works today. Reference actual temp/condition.",
  "rating": 3,
  "outfits": [
    {{ "category": "Top",         "item": "specific item", "detail": "styling note",             "accentColor": "mint"     }},
    {{ "category": "Bottom",      "item": "specific item", "detail": "styling note",             "accentColor": "lavender" }},
    {{ "category": "Outer Layer", "item": "specific item or None needed", "detail": "reasoning", "accentColor": "coral"    }},
    {{ "category": "Footwear",    "item": "specific item", "detail": "practical+stylish reason", "accentColor": "lemon"    }},
    {{ "category": "Accessories", "item": "specific items","detail": "completes the look",       "accentColor": "iris"     }}
  ],
  "avoid": ["item the Oracle vetoes for this lens", "another mistake", "one more wrong choice"]
}}
</response>
"""


# ── Orchestrator ──────────────────────────────────────────────────────────────

class OutfitOracle:
    """
    Orchestrator-workers consultation engine.

    Usage:
        oracle = OutfitOracle()
        lenses = oracle.consult(weather, occasion, gender, profile)
    """

    def __init__(self, model: str = MODEL):
        self.model = model

    def consult(
        self,
        weather: WeatherInput,
        occasion: str = "Any",
        gender: str = "Women",
        profile: StyleProfile | None = None,
    ) -> list[OutfitLens]:
        profile = profile or StyleProfile()
        ctx = self._build_context(weather, occasion, gender, profile)

        # ── Phase 1: orchestrator ─────────────────────────────────────────────
        orch_prompt = ORCHESTRATOR_PROMPT.format(**ctx)
        orch_response = llm_call(orch_prompt, model=self.model)

        analysis  = extract_xml(orch_response, "analysis")
        tasks_xml = extract_xml(orch_response, "tasks")
        tasks     = parse_tasks(tasks_xml)

        self._print_header("ORCHESTRATOR ANALYSIS")
        print(analysis)

        self._print_header(f"IDENTIFIED {len(tasks)} LENSES")
        for i, t in enumerate(tasks, 1):
            print(f"\n  {i}. {t['type'].upper()}")
            print(f"     {t['description']}")

        self._print_header("GENERATING OUTFITS")

        # ── Phase 2: workers ──────────────────────────────────────────────────
        lenses: list[OutfitLens] = []
        for i, task in enumerate(tasks, 1):
            print(f"  [{i}/{len(tasks)}] {task['type']} …")
            worker_prompt = WORKER_PROMPT.format(
                task_type=task["type"],
                task_description=task["description"],
                **ctx,
            )
            raw = llm_call(worker_prompt, model=self.model)
            json_str = extract_xml(raw, "response")

            if not json_str.strip():
                print(f"  ⚠  Worker '{task['type']}' returned empty content — skipping.")
                continue

            try:
                data = json.loads(json_str)
            except json.JSONDecodeError as e:
                print(f"  ⚠  Worker '{task['type']}' returned invalid JSON: {e} — skipping.")
                continue

            lenses.append(OutfitLens(
                type=task["type"],
                description=task["description"],
                vibe=data.get("vibe", ""),
                verdict=data.get("verdict", ""),
                rating=data.get("rating", 3),
                outfits=data.get("outfits", []),
                avoid=data.get("avoid", []),
            ))

        # ── Display ───────────────────────────────────────────────────────────
        self._print_header("RESULTS")
        for i, lens in enumerate(lenses, 1):
            print(f"\n{'─' * 60}")
            print(f"  Lens {i}: {lens.type.upper()}")
            print(f"  Vibe:   {lens.vibe}")
            print(f"  Effort: {'●' * lens.rating}{'○' * (5 - lens.rating)}")
            print(f"\n  {lens.verdict}\n")
            for item in lens.outfits:
                print(f"  {item.get('category', ''):12} {item.get('item', '')}")
                print(f"             {item.get('detail', '')}")
            if lens.avoid:
                print(f"\n  AVOID: {', '.join(lens.avoid)}")

        self._save(weather, occasion, gender, profile, lenses)
        return lenses

    # ── Helpers ───────────────────────────────────────────────────────────────

    @staticmethod
    def _build_context(
        w: WeatherInput,
        occasion: str,
        gender: str,
        p: StyleProfile,
    ) -> dict:
        return {
            "city":             w.city,
            "country":          w.country,
            "temp":             w.temp,
            "feels_like":       w.feels_like,
            "condition":        w.condition,
            "humidity":         w.humidity,
            "wind_speed":       w.wind_speed,
            "occasion":         occasion,
            "gender":           gender,
            "keywords":         ", ".join(p.keywords) if p.keywords else "no preference",
            "budget":           p.budget,
            "personality":      p.personality,
            "temp_sensitivity": p.temp_sensitivity,
        }

    @staticmethod
    def _save(
        weather: WeatherInput,
        occasion: str,
        gender: str,
        profile: StyleProfile,
        lenses: list[OutfitLens],
    ) -> None:
        slug = f"{weather.city.lower().replace(' ', '-')}_{occasion.lower()}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        # ── JSON (machine-readable, matches OracleVerdict shape) ──────────────
        payload = {
            "consultedAt": datetime.now().isoformat(),
            "input": {
                "city": weather.city,
                "country": weather.country,
                "temp": weather.temp,
                "feelsLike": weather.feels_like,
                "condition": weather.condition,
                "humidity": weather.humidity,
                "windSpeed": weather.wind_speed,
                "occasion": occasion,
                "gender": gender,
                "profile": asdict(profile),
            },
            "lenses": [asdict(l) for l in lenses],
        }
        json_path = RESULTS_DIR / f"{slug}.json"
        json_path.write_text(json.dumps(payload, indent=2, ensure_ascii=False))

        # ── Markdown (human-readable) ─────────────────────────────────────────
        lines = [
            f"# Outfit Oracle — {weather.city}, {weather.country}",
            f"**{occasion} · {gender} · {weather.temp}°C (feels {weather.feels_like}°C) · {weather.condition}**",
            f"*{datetime.now().strftime('%Y-%m-%d %H:%M')}*\n",
        ]
        for i, lens in enumerate(lenses, 1):
            lines += [
                f"---\n## Lens {i}: {lens.type.replace('-', ' ').title()}",
                f"**Vibe:** {lens.vibe}  |  **Effort:** {'●' * lens.rating}{'○' * (5 - lens.rating)}\n",
                f"> {lens.verdict}\n",
            ]
            for piece in lens.outfits:
                lines.append(f"- **{piece.get('category', '')}** — {piece.get('item', '')}")
                lines.append(f"  *{piece.get('detail', '')}*")
            if lens.avoid:
                lines.append(f"\n**Avoid:** {' · '.join(lens.avoid)}")
            lines.append("")

        md_path = RESULTS_DIR / f"{slug}.md"
        md_path.write_text("\n".join(lines), encoding="utf-8")

        print(f"\n  Saved → results/{slug}.json")
        print(f"  Saved → results/{slug}.md")

    @staticmethod
    def _print_header(title: str) -> None:
        print("\n" + "=" * 60)
        print(f"  {title}")
        print("=" * 60)


# ── Demo ──────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    oracle = OutfitOracle()

    # Example 1 — rainy London work day, minimalist professional
    print("\n\n▶  CONSULTATION 1: Rainy London, Work, Minimalist")
    oracle.consult(
        weather=WeatherInput(
            city="London", country="UK",
            temp=12, feels_like=9,
            condition="Heavy Rain",
            humidity=88, wind_speed=22,
        ),
        occasion="Work",
        gender="Women",
        profile=StyleProfile(
            keywords=["Minimal", "Quiet Luxury", "Classic"],
            budget="contemporary",
            personality="editorial",
            temp_sensitivity="runs-cold",
        ),
    )

    # Example 2 — hot Barcelona weekend, no profile
    print("\n\n▶  CONSULTATION 2: Hot Barcelona, Weekend, No Profile")
    oracle.consult(
        weather=WeatherInput(
            city="Barcelona", country="Spain",
            temp=34, feels_like=37,
            condition="Sunny",
            humidity=45, wind_speed=8,
        ),
        occasion="Weekend",
        gender="Men",
    )
