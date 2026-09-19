import json
import os

from google import genai

from config import GEMINI_MODEL

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))


def _compact_lore(lore: dict) -> dict:
    return {
        "title": lore.get("title", ""),
        "summary": lore.get("summary", ""),
        "characters": lore.get("characters", []),
        "events": lore.get("events", []),
        "world_context": lore.get("world_context", ""),
    }


def combine_lores(lore_a: dict, lore_b: dict) -> dict:
    """Construct one shared Lore object from two extracted story worlds."""
    prompt = f"""Combine these two extracted stories into one coherent shared narrative universe.
Preserve important characters and events, resolve conflicts sensibly, and make the result concise.
Use globally unique IDs for every character and event (prefix source-specific IDs with a_ or b_).
Preserve each source character's useful traits; every character with source traits must have a
non-empty traits array in the result. If characters are merged, combine their useful traits.
Update characters_involved and timeline to match those IDs.

STORY A:
{json.dumps(_compact_lore(lore_a), separators=(",", ":"))}

STORY B:
{json.dumps(_compact_lore(lore_b), separators=(",", ":"))}

Return ONLY valid JSON matching this exact schema:
{{
  "title": "Combined title",
  "summary": "Short shared-universe summary",
  "characters": [
    {{
      "id": "a_character_id",
      "name": "Character Name",
      "description": "Brief description",
      "traits": ["preserved source trait"],
      "relationships": {{}}
    }}
  ],
  "events": [
    {{
      "id": "a_event_1",
      "order": 1,
      "title": "Event title",
      "description": "Brief description",
      "characters_involved": ["a_character_id"],
      "location": null,
      "is_pivotal": false
    }}
  ],
  "timeline": ["a_event_1"],
  "world_context": "Short shared-world context"
}}"""

    interaction = client.interactions.create(
        model=GEMINI_MODEL,
        input=prompt,
        store=False,
    )
    raw = interaction.output_text.strip()
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()

    combined = json.loads(raw)
    required = {"title", "summary", "characters", "events", "timeline", "world_context"}
    if set(combined) != required:
        raise ValueError("Multiverse Agent returned an invalid Lore schema")

    ids = [character["id"] for character in combined["characters"]]
    ids.extend(event["id"] for event in combined["events"])
    if len(ids) != len(set(ids)):
        raise ValueError("Multiverse Agent returned duplicate character or event IDs")

    source_characters = lore_a.get("characters", []) + lore_b.get("characters", [])
    for character in combined["characters"]:
        if character.get("traits"):
            continue
        matches = [
            source
            for source in source_characters
            if source.get("id") in character.get("id", "")
            or source.get("name", "").casefold() == character.get("name", "").casefold()
        ]
        character["traits"] = [
            trait
            for source in matches
            for trait in source.get("traits", [])
        ]
    return combined
