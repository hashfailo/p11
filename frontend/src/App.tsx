import { Check, MessageCircle, Upload, GitBranch, Library, RotateCcw } from "lucide-react";
import { useState } from "react";
import UploadPanel from "./components/UploadPanel";
import LorePanel from "./components/LorePanel";
import DivergencePanel from "./components/DivergencePanel";
import CharacterChat from "./components/CharacterChat";
import type { AppStep, Lore, StoryEvent, BranchContext } from "./types";

const steps: { key: AppStep; label: string; icon: typeof Upload }[] = [
  { key: "upload", label: "Upload", icon: Upload },
  { key: "lore", label: "Lore", icon: Library },
  { key: "diverge", label: "Diverge", icon: GitBranch },
  { key: "chat", label: "Chat", icon: MessageCircle },
];

export default function App() {
  const [step, setStep] = useState<AppStep>("upload");
  const [lore, setLore] = useState<Lore | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<StoryEvent | null>(null);
  const [branch, setBranch] = useState<BranchContext | null>(null);

  const stepOrder = { upload: 0, lore: 1, diverge: 2, chat: 3 };
  const currentOrder = stepOrder[step];

  return (
    <div className="min-h-screen bg-ink text-slate-100">
      {step !== "upload" && (
        <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-ink/95 px-4 py-3 backdrop-blur-md sm:px-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
            <button onClick={() => setStep("upload")} className="flex items-center gap-2 text-sm font-semibold tracking-wide text-slate-300 transition hover:text-white">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-surface-2 text-accent shadow-neumorphic">
                <RotateCcw size={14} />
              </span>
              <span className="hidden sm:inline">P11</span>
            </button>
            <nav className="flex items-center gap-1 sm:gap-2" aria-label="Progress">
              {steps.map((item, index) => {
                const Icon = item.icon;
                const active = item.key === step;
                const complete = index < currentOrder;
                return (
                  <div key={item.key} className="flex items-center gap-1 sm:gap-2">
                    {index > 0 && <div className={`h-px w-3 sm:w-8 ${complete ? "bg-accent/60" : "bg-white/[0.08]"}`} />}
                    <div className={`flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-semibold uppercase tracking-wider transition-all duration-300 sm:px-3 ${active ? "bg-accent text-ink shadow-neumorphic" : complete ? "text-accent" : "text-slate-600"}`}>
                      {complete && !active ? <Check size={13} strokeWidth={2.5} /> : <Icon size={13} />}
                      <span className="hidden md:inline">{String(index + 1).padStart(2, "0")} {item.label}</span>
                      <span className="md:hidden">{String(index + 1).padStart(2, "0")}</span>
                    </div>
                  </div>
                );
              })}
            </nav>
            <div className="hidden text-[10px] uppercase tracking-[0.2em] text-slate-600 sm:block">Narrative laboratory</div>
          </div>
        </header>
      )}

      <main className={step !== "upload" ? "animate-fade-in" : ""}>
        {step === "upload" && <UploadPanel onLoreLoaded={(loaded) => { setLore(loaded); setStep("lore"); }} />}
        {step === "lore" && lore && (
          <LorePanel lore={lore} onSelectEvent={(event) => { setSelectedEvent(event); setStep("diverge"); }} onReset={() => { setLore(null); setBranch(null); setSelectedEvent(null); setStep("upload"); }} />
        )}
        {step === "diverge" && lore && selectedEvent && (
          <DivergencePanel lore={lore} selectedEvent={selectedEvent} onBranchReady={setBranch} onBack={() => setStep("lore")} />
        )}
        {step === "diverge" && branch && (
          <button onClick={() => setStep("chat")} className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-ink shadow-neumorphic transition duration-300 hover:brightness-110 active:scale-[0.98]">
            <MessageCircle size={17} /> Talk to characters
          </button>
        )}
        {step === "chat" && lore && branch && <CharacterChat lore={lore} branch={branch} onBack={() => setStep("diverge")} />}
      </main>
    </div>
  );
}
