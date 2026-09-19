export interface Character {
  id: string;
  name: string;
  description: string;
  traits: string[];
  relationships: Record<string, string>;
}

export interface StoryEvent {
  id: string;
  order: number;
  title: string;
  description: string;
  characters_involved: string[];
  location: string | null;
  is_pivotal: boolean;
  // alternate branch fields
  is_divergence_point?: boolean;
  is_changed?: boolean;
}

export interface Lore {
  title: string;
  summary: string;
  characters: Character[];
  events: StoryEvent[];
  timeline: string[];
  world_context: string;
}

export interface CharacterState {
  name: string;
  status: string;
  emotional_state: string;
  key_knowledge: string;
}

export interface BranchContext {
  divergence_summary: string;
  original_branch: StoryEvent[];
  alternate_branch: StoryEvent[];
  character_states: Record<string, CharacterState>;
}

export interface ChatMessage {
  role: "user" | "character";
  text: string;
  characterName?: string;
}

export type AppStep = "upload" | "lore" | "diverge" | "chat";
export type StoryMode = "single" | "multiverse";
