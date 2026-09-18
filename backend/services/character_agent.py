"""
Character Agent: Simulates a character speaking from within a specific narrative branch.
The character only knows what they would know given their position in the alternate timeline.
"""
import os
from google import genai

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))


def build_character_system_prompt(character: dict, lore: dict, branch_context: dict, branch_type: str) -> str:
    """Build the system prompt for a character in a specific timeline branch."""
    char_name = character["name"]
    char_desc = character.get("description", "")
    char_traits = ", ".join(character.get("traits", []))
    
    # Get character's state in this branch
    char_states = branch_context.get("character_states", {})
    char_state = char_states.get(character["id"], {})
    char_status = char_state.get("status", "")
    char_emotions = char_state.get("emotional_state", "")
    char_knowledge = char_state.get("key_knowledge", "")
    
    # Get the relevant events for context
    if branch_type == "alternate":
        events = branch_context.get("alternate_branch", [])
    else:
        events = branch_context.get("original_branch", lore.get("events", []))
    
    events_summary = "\n".join([
        f"- {e['title']}: {e['description']}"
        for e in events
    ])
    
    world_context = lore.get("world_context", "")
    
    return f"""You are roleplaying as {char_name} from the story "{lore.get('title', 'the story')}".

CHARACTER PROFILE:
- Name: {char_name}
- Description: {char_desc}
- Personality traits: {char_traits}

YOUR CURRENT SITUATION ({"ALTERNATE" if branch_type == "alternate" else "ORIGINAL"} TIMELINE):
- Status: {char_status}
- Emotional state: {char_emotions}
- What you know: {char_knowledge}

THE EVENTS THAT HAVE OCCURRED IN YOUR TIMELINE:
{events_summary}

WORLD CONTEXT: {world_context}

CRITICAL RULES:
1. You ARE {char_name}. Speak in first person, in character at all times.
2. You ONLY know what happened in YOUR timeline above. Do NOT reference events from other timelines.
3. React emotionally and authentically based on your emotional state above.
4. You do NOT know you are in a "story" or "simulation". You think this is real life.
5. Keep responses conversational and in character — 2-4 sentences usually.
6. If asked about events you wouldn't know, say so in character.
7. Draw on your personality traits to color how you speak and react."""


def chat_with_character(
    character: dict,
    lore: dict,
    branch_context: dict,
    branch_type: str,
    message: str,
    previous_interaction_id: str = None,
) -> tuple[str, str]:
    """
    Chat with a character. Returns (response_text, interaction_id).
    Uses stateful conversation via previous_interaction_id.
    """
    system_prompt = build_character_system_prompt(character, lore, branch_context, branch_type)
    
    if previous_interaction_id:
        # Continue the conversation
        interaction = client.interactions.create(
            model="gemini-3-flash-preview",
            input=message,
            previous_interaction_id=previous_interaction_id,
            system_instruction=system_prompt,
            store=True,
        )
    else:
        # Start fresh conversation
        interaction = client.interactions.create(
            model="gemini-3-flash-preview",
            input=message,
            system_instruction=system_prompt,
            store=True,
        )
    
    return interaction.output_text, interaction.id
