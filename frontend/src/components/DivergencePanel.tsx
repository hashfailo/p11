import { useState } from "react";
import { diverge } from "../api";
import type { BranchContext, Lore, StoryEvent } from "../types";

interface Props {
  lore: Lore;
  selectedEvent: StoryEvent;
  onBranchReady: (ctx: BranchContext) => void;
  onBack: () => void;
}

export default function DivergencePanel({
  selectedEvent,
  onBranchReady,
  onBack,
}: Props) {
  const [whatIf, setWhatIf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [branch, setBranch] = useState<BranchContext | null>(null);

  const handleDiverge = async () => {
    if (!whatIf.trim()) return;
    setError("");
    setLoading(true);
    try {
      const { branch_context } = await diverge(selectedEvent.id, whatIf);
      setBranch(branch_context);
      onBranchReady(branch_context);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const getEventColor = (
    event: StoryEvent & { is_divergence_point?: boolean; is_changed?: boolean },
  ) => {
    if (event.is_divergence_point)
      return "border-amber-500 bg-amber-900/20 text-amber-200";
    if (event.is_changed) return "border-cyan-500 bg-cyan-900/20 text-cyan-200";
    return "border-gray-700 bg-gray-900 text-gray-300";
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={onBack}
            className="text-gray-500 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-bold text-white">What If Explorer</h1>
        </div>

        {/* Selected Event */}
        <div className="bg-amber-900/20 border border-amber-700/50 rounded-xl p-4 mb-6">
          <div className="text-xs text-amber-400 font-semibold uppercase tracking-wide mb-1">
            Divergence Point
          </div>
          <div className="font-semibold text-amber-200">
            {selectedEvent.title}
          </div>
          <div className="text-sm text-amber-300/70 mt-1">
            {selectedEvent.description}
          </div>
        </div>

        {/* What-If Input */}
        {!branch && (
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Describe your hypothetical change:
            </label>
            <textarea
              value={whatIf}
              onChange={(e) => setWhatIf(e.target.value)}
              placeholder={`e.g. "What if Maya never told Arjun that Ravi betrayed him?"`}
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-none"
            />
            <button
              onClick={handleDiverge}
              disabled={loading || !whatIf.trim()}
              className="mt-4 w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 font-semibold transition-all disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⚙️</span> Generating alternate
                  timeline...
                </span>
              ) : (
                "⚡ Generate Alternate Timeline"
              )}
            </button>
            {error && (
              <div className="mt-3 p-3 rounded-lg bg-red-900/40 border border-red-700 text-red-300 text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        {/* Timeline Comparison */}
        {branch && (
          <div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              <div className="text-xs text-purple-400 font-semibold uppercase tracking-wide mb-1">
                Divergence Summary
              </div>
              <div className="text-gray-300">{branch.divergence_summary}</div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Original */}
              <div>
                <h2 className="text-lg font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <span>📗</span> Original Timeline
                </h2>
                <div className="space-y-2">
                  {branch.original_branch.map((event, i) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-gray-800 text-gray-500 flex items-center justify-center text-xs flex-shrink-0 mt-3">
                        {i + 1}
                      </div>
                      <div className="flex-1 p-3 rounded-lg border border-gray-700 bg-gray-900">
                        <div className="font-medium text-gray-300 text-sm">
                          {event.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {event.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alternate */}
              <div>
                <h2 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
                  <span>🔀</span> Alternate Timeline
                </h2>
                <div className="space-y-2">
                  {branch.alternate_branch.map((event, i) => (
                    <div key={event.id} className="flex gap-3">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-3
                        ${event.is_divergence_point ? "bg-amber-700 text-amber-200" : event.is_changed ? "bg-cyan-800 text-cyan-200" : "bg-gray-800 text-gray-500"}`}
                      >
                        {i + 1}
                      </div>
                      <div
                        className={`flex-1 p-3 rounded-lg border ${getEventColor(event)}`}
                      >
                        <div className="font-medium text-sm">
                          {event.title}
                          {event.is_divergence_point && (
                            <span className="ml-2 text-xs bg-amber-800/60 text-amber-300 px-1.5 py-0.5 rounded">
                              diverge
                            </span>
                          )}
                          {event.is_changed && !event.is_divergence_point && (
                            <span className="ml-2 text-xs bg-cyan-800/60 text-cyan-300 px-1.5 py-0.5 rounded">
                              changed
                            </span>
                          )}
                        </div>
                        <div className="text-xs opacity-70 mt-1">
                          {event.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Character States */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
              <h2 className="text-lg font-semibold text-purple-300 mb-4">
                Character States in Alternate Timeline
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(branch.character_states).map(([id, state]) => (
                  <div key={id} className="bg-gray-800/60 rounded-lg p-3">
                    <div className="font-semibold text-white mb-1">
                      {state.name}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      <span className="text-gray-600">Status:</span>{" "}
                      {state.status}
                    </div>
                    <div className="text-xs text-gray-400 mb-1">
                      <span className="text-gray-600">Feels:</span>{" "}
                      {state.emotional_state}
                    </div>
                    <div className="text-xs text-gray-400">
                      <span className="text-gray-600">Knows:</span>{" "}
                      {state.key_knowledge}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setBranch(null);
                  setWhatIf("");
                }}
                className="flex-1 py-3 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-all"
              >
                Try Different What-If
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
