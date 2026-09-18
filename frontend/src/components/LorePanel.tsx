import type { Lore, StoryEvent } from "../types";

interface Props {
  lore: Lore;
  onSelectEvent: (event: StoryEvent) => void;
  onReset: () => void;
}

export default function LorePanel({ lore, onSelectEvent, onReset }: Props) {
  const orderedEvents = lore.timeline
    .map((id) => lore.events.find((e) => e.id === id))
    .filter(Boolean) as StoryEvent[];

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {lore.title}
            </h1>
            <p className="text-gray-400 mt-1">{lore.summary}</p>
          </div>
          <button
            onClick={onReset}
            className="px-4 py-2 rounded-lg border border-gray-700 text-gray-400 hover:border-gray-500 hover:text-white transition-all text-sm"
          >
            ↩ New Story
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Characters */}
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold text-purple-300 mb-3 flex items-center gap-2">
              <span>👥</span> Characters
            </h2>
            <div className="space-y-3">
              {lore.characters.map((c) => (
                <div
                  key={c.id}
                  className="bg-gray-900 rounded-xl p-4 border border-gray-800"
                >
                  <div className="font-semibold text-white">{c.name}</div>
                  <div className="text-sm text-gray-400 mt-1">
                    {c.description}
                  </div>
                  {c.traits.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.traits.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded-full"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-gray-900/60 rounded-xl border border-gray-800">
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">
                World Context
              </div>
              <div className="text-sm text-gray-400">{lore.world_context}</div>
            </div>
          </div>

          {/* Timeline */}
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-cyan-300 mb-3 flex items-center gap-2">
              <span>⏱</span> Timeline — Select an event to create a "What If?"
            </h2>
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-800" />
              <div className="space-y-3">
                {orderedEvents.map((event, idx) => (
                  <div key={event.id} className="relative pl-14">
                    <div
                      className="absolute left-3 top-4 w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs font-bold
                      bg-gray-950 border-cyan-600 text-cyan-400"
                    >
                      {idx + 1}
                    </div>
                    <button
                      onClick={() => onSelectEvent(event)}
                      className={`w-full text-left p-4 rounded-xl border transition-all group
                        ${
                          event.is_pivotal
                            ? "border-amber-700/60 bg-amber-900/10 hover:bg-amber-900/20"
                            : "border-gray-800 bg-gray-900 hover:bg-gray-800"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-white group-hover:text-cyan-300 transition-colors">
                            {event.title}
                            {event.is_pivotal && (
                              <span className="ml-2 text-xs px-2 py-0.5 bg-amber-900/60 text-amber-400 rounded-full font-normal">
                                pivotal
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {event.description}
                          </div>
                          {event.characters_involved.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {event.characters_involved.map((cid) => {
                                const ch = lore.characters.find(
                                  (c) => c.id === cid,
                                );
                                return ch ? (
                                  <span
                                    key={cid}
                                    className="text-xs px-2 py-0.5 bg-gray-800 text-gray-400 rounded-full"
                                  >
                                    {ch.name}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>
                        <span className="text-gray-600 group-hover:text-cyan-400 text-lg transition-colors flex-shrink-0">
                          ⚡
                        </span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
