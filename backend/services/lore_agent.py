"""
Lore Agent: Extracts structured narrative world from raw source text.
Produces characters, events, timeline, and relationships.
"""
import json
import os
from google import genai

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

LORE_EXTRACTION_PROMPT = """You are a narrative analysis expert. Analyze the following story text and extract a structured narrative world.

Return ONLY valid JSON with this exact structure:
{
  "title": "story title or best guess",
  "summary": "2-3 sentence summary of the story",
  "characters": [
    {
      "id": "unique_snake_case_id",
      "name": "Character Name",
      "description": "brief description of character",
      "traits": ["trait1", "trait2"],
      "relationships": {"other_character_id": "relationship description"}
    }
  ],
  "events": [
    {
      "id": "event_1",
      "order": 1,
      "title": "Short event title",
      "description": "What happens in this event",
      "characters_involved": ["character_id1", "character_id2"],
      "location": "where it happens or null",
      "is_pivotal": true
    }
  ],
  "timeline": ["event_1", "event_2", "event_3"],
  "world_context": "Brief description of the setting/world"
}

Rules:
- events must be in chronological order
- every event must have a unique id like event_1, event_2, etc.
- timeline is just the ordered list of event ids
- is_pivotal marks events that are major turning points
- Return ONLY the JSON, no markdown, no explanation

Story text:
{text}"""


def extract_lore(text: str) -> dict:
    """Extract structured lore from story text using LLM."""
    prompt = LORE_EXTRACTION_PROMPT.replace("{text}", text)
    
    interaction = client.interactions.create(
        model="gemini-3-flash-preview",
        input=prompt,
        store=False,
    )
    
    raw = interaction.output_text.strip()
    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    
    lore = json.loads(raw)
    return lore
