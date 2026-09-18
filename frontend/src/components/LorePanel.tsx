import {
  ArrowRight,
  BookOpen,
  CircleUserRound,
  Globe2,
  RotateCcw,
  Sparkles,
  Users,
} from "lucide-react";
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
    <div className="min-h-screen bg-ink px-5 py-10 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 flex items-start justify-between gap-5">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              <BookOpen size={15} /> Extracted lore
            </div>
            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-stone-100 sm:text-5xl">
              {lore.title}
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-slate-400">
              {lore.summary}
            </p>
          </div>
          <button
            onClick={onReset}
            className="flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-500 transition hover:bg-surface hover:text-slate-200"
          >
            <RotateCcw size={14} />{" "}
            <span className="hidden sm:inline">New story</span>
          </button>
        </div>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-5">
            <section className="rounded-2xl bg-surface p-5 shadow-neumorphic">
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                <Users size={15} /> Characters{" "}
                <span className="ml-auto text-slate-600">
                  {lore.characters.length}
                </span>
              </div>
              <div className="space-y-4">
                {lore.characters.map((character) => (
                  <div
                    key={character.id}
                    className="border-b border-white/[0.06] pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-2 font-semibold text-stone-100">
                      <CircleUserRound size={16} className="text-accent" />
                      {character.name}
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {character.description}
                    </p>
                    {character.traits.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {character.traits.map((trait) => (
                          <span
                            key={trait}
                            className="rounded-md bg-surface-2 px-2 py-1 text-[10px] uppercase tracking-wide text-slate-400"
                          >
                            {trait}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-2xl border border-white/[0.06] bg-surface/70 p-5">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <Globe2 size={15} /> World context
              </div>
              <p className="text-sm leading-6 text-slate-400">
                {lore.world_context}
              </p>
            </section>
          </aside>

          <section>
            <div className="mb-4 flex items-end justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
                  <Sparkles size={15} /> Timeline
                </div>
                <h2 className="mt-2 text-2xl font-semibold text-stone-100">
                  Choose where reality bends
                </h2>
              </div>
              <span className="text-xs text-slate-600">
                {orderedEvents.length} events
              </span>
            </div>
            <div className="relative space-y-3 before:absolute before:bottom-6 before:left-[18px] before:top-6 before:w-px before:bg-white/[0.08]">
              {orderedEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="group relative pl-12 animate-fade-in"
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <div
                    className={`absolute left-2 top-5 grid h-5 w-5 place-items-center rounded-full border text-[10px] font-bold transition ${event.is_pivotal ? "border-accent bg-accent text-ink" : "border-white/20 bg-ink text-slate-500 group-hover:border-accent group-hover:text-accent"}`}
                  >
                    {index + 1}
                  </div>
                  <button
                    onClick={() => onSelectEvent(event)}
                    className={`w-full rounded-xl p-5 text-left shadow-neumorphic transition duration-300 hover:-translate-y-0.5 hover:bg-surface-2 active:translate-y-0 ${event.is_pivotal ? "border border-accent/25 bg-accent/[0.045]" : "bg-surface"}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 font-semibold text-stone-100">
                          {event.title}
                          {event.is_pivotal && (
                            <span className="rounded-md bg-accent/15 px-2 py-1 text-[10px] uppercase tracking-wider text-accent">
                              Pivotal
                            </span>
                          )}
                        </div>
                        <p className="mt-2 text-sm leading-6 text-slate-400">
                          {event.description}
                        </p>
                        {event.characters_involved.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {event.characters_involved.map((id) => {
                              const character = lore.characters.find(
                                (item) => item.id === id,
                              );
                              return character ? (
                                <span
                                  key={id}
                                  className="rounded-md bg-surface-2 px-2 py-1 text-[10px] text-slate-500"
                                >
                                  {character.name}
                                </span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                      <ArrowRight
                        size={17}
                        className="mt-1 shrink-0 text-slate-600 transition group-hover:translate-x-1 group-hover:text-accent"
                      />
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
