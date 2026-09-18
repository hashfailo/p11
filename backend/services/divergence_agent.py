"""
Divergence Agent: Given a lore world, a selected event, and a hypothetical change,
produces a structured alternate timeline where downstream events are consequences
of the change — not a new unrelated story.
"""
import json
import os
from google import genai

from config import GEMINI_MODEL

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

def generate_alternate_timeline(lore: dict, event_id: str, what_if: str) -> dict:
    """Generate an alternate timeline from a divergence point."""
    event = next((e for e in lore["events"] if e["id"] == event_id), None)
    if not event:
        raise ValueError(f"Event {event_id} not found in lore")

    events = lore.get("events", [])
    event_index = events.index(event)
    nearby_events = events[max(0, event_index - 2):event_index + 3]
    characters = [
        {"id": character["id"], "name": character["name"], "description": character.get("description", "")}
        for character in lore.get("characters", [])
    ]
    prompt = f"""Create a concise alternate timeline for this story.

WORLD CONTEXT:
{lore.get("world_context", "")[:1200]}

NEARBY EVENTS:
{json.dumps(nearby_events, separators=(",", ":"))}

CHARACTERS:
{json.dumps(characters, separators=(",", ":"))}

DIVERGENCE EVENT:
{json.dumps({"id": event_id, "title": event["title"], "description": event["description"]}, separators=(",", ":"))}

WHAT-IF:
{what_if}

Return ONLY valid JSON, with no markdown:
{{
  "divergence_summary": "One concise sentence",
  "changed_events": [
    {{
      "id": "divergence-event",
      "order": 0,
      "title": "Short title",
      "description": "1-2 sentence description",
      "is_divergence_point": true,
      "is_changed": true
    }}
  ],
  "character_states": {{
    "character_id": {{
      "name": "Character Name",
      "status": "Short status",
      "emotional_state": "Short emotional state",
      "key_knowledge": "Short key knowledge"
    }}
  }}
}}

Return the changed divergence event followed by 1-3 concise downstream consequences.
Use the supplied event id for the divergence event and include a state for every character."""
    
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
    
    result = json.loads(raw)
    result["original_branch"] = events
    changed_events = result.pop("changed_events", None)
    if changed_events is None:
        changed_events = result.get("alternate_branch", [])
    result["alternate_branch"] = events[:event_index] + changed_events
    return result
