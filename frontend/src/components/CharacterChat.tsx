import { useState, useRef, useEffect } from "react";
import { chat } from "../api";
import type { BranchContext, Character, ChatMessage, Lore } from "../types";

interface Props {
  lore: Lore;
  branch: BranchContext;
  onBack: () => void;
}

export default function CharacterChat({ lore, branch, onBack }: Props) {
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [branchType, setBranchType] = useState<"alternate" | "original">(
    "alternate",
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectCharacter = async (
    char: Character,
    branch_type: "alternate" | "original",
  ) => {
    setSelectedChar(char);
    setBranchType(branch_type);
    setMessages([]);
    setError("");
    // Send greeting
    setLoading(true);
    try {
      const res = await chat(
        char.id,
        "Hello. Tell me how you are feeling right now.",
        branch_type,
        true,
      );
      setMessages([
        {
          role: "character",
          text: res.response,
          characterName: res.character_name,
        },
      ]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedChar || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);
    setError("");
    try {
      const res = await chat(selectedChar.id, userMsg, branchType, false);
      setMessages((prev) => [
        ...prev,
        {
          role: "character",
          text: res.response,
          characterName: res.character_name,
        },
      ]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const charState = selectedChar
    ? branch.character_states[selectedChar.id]
    : null;

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Top bar */}
      <div className="border-b border-gray-800 p-4 flex items-center gap-4 bg-gray-900/50">
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-white transition-colors text-sm"
        >
          ← Back
        </button>
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
          Character Interaction
        </h1>
        {selectedChar && (
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-gray-500">Timeline:</span>
            <button
              onClick={() => selectCharacter(selectedChar, "original")}
              className={`text-xs px-3 py-1 rounded-full transition-all ${branchType === "original" ? "bg-gray-600 text-white" : "bg-gray-800 text-gray-500 hover:text-gray-300"}`}
            >
              Original
            </button>
            <button
              onClick={() => selectCharacter(selectedChar, "alternate")}
              className={`text-xs px-3 py-1 rounded-full transition-all ${branchType === "alternate" ? "bg-cyan-700 text-white" : "bg-gray-800 text-gray-500 hover:text-gray-300"}`}
            >
              Alternate
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Character selector sidebar */}
        <div className="w-64 border-r border-gray-800 bg-gray-900/30 p-4 overflow-y-auto flex-shrink-0">
          <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">
            Select Character
          </div>
          <div className="space-y-2">
            {lore.characters.map((char) => {
              const state = branch.character_states[char.id];
              const isSelected = selectedChar?.id === char.id;
              return (
                <button
                  key={char.id}
                  onClick={() => selectCharacter(char, branchType)}
                  className={`w-full text-left p-3 rounded-xl border transition-all
                    ${
                      isSelected
                        ? "border-purple-500 bg-purple-900/30"
                        : "border-gray-800 bg-gray-900 hover:border-gray-600"
                    }`}
                >
                  <div className="font-semibold text-white text-sm">
                    {char.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                    {char.description}
                  </div>
                  {state && (
                    <div className="mt-2 text-xs text-cyan-500 italic line-clamp-2">
                      "{state.emotional_state}"
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedChar && charState && (
            <div className="mt-4 p-3 bg-gray-800/60 rounded-xl border border-gray-700">
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-2">
                Current State
              </div>
              <div className="text-xs text-gray-400 space-y-1">
                <div>
                  <span className="text-gray-600">Knows:</span>{" "}
                  {charState.key_knowledge}
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>{" "}
                  {charState.status}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!selectedChar ? (
            <div className="flex-1 flex items-center justify-center text-gray-600">
              <div className="text-center">
                <div className="text-5xl mb-4">💬</div>
                <p className="text-lg">Select a character to begin</p>
                <p className="text-sm mt-2">
                  They'll respond from within the alternate timeline
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Branch badge */}
              <div
                className={`px-4 py-2 text-xs font-semibold flex items-center gap-2
                ${branchType === "alternate" ? "bg-cyan-900/30 text-cyan-400 border-b border-cyan-900/50" : "bg-gray-800/50 text-gray-400 border-b border-gray-800"}`}
              >
                <span>{branchType === "alternate" ? "🔀" : "📗"}</span>
                Talking to <strong>{selectedChar.name}</strong> in the{" "}
                <strong>{branchType}</strong> timeline
                {branchType === "alternate" && (
                  <span className="ml-1 opacity-70">
                    — {branch.divergence_summary}
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "character" && (
                      <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-sm font-bold mr-2 flex-shrink-0 mt-1">
                        {selectedChar.name[0]}
                      </div>
                    )}
                    <div
                      className={`max-w-lg rounded-2xl px-4 py-3 ${
                        msg.role === "user"
                          ? "bg-gray-700 text-white rounded-br-sm"
                          : "bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700"
                      }`}
                    >
                      {msg.role === "character" && (
                        <div className="text-xs text-purple-400 font-semibold mb-1">
                          {msg.characterName}
                        </div>
                      )}
                      <div className="text-sm leading-relaxed whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="w-8 h-8 rounded-full bg-purple-800 flex items-center justify-center text-sm font-bold mr-2 flex-shrink-0">
                      {selectedChar.name[0]}
                    </div>
                    <div className="bg-gray-800 rounded-2xl rounded-bl-sm px-4 py-3 border border-gray-700">
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {error && (
                  <div className="text-center text-red-400 text-sm bg-red-900/20 rounded-lg p-3">
                    {error}
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-gray-800 bg-gray-900/30">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendMessage()
                    }
                    placeholder={`Ask ${selectedChar.name} something...`}
                    disabled={loading}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 font-semibold transition-all disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
