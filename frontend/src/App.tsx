import { useState } from "react";
import UploadPanel from "./components/UploadPanel";
import LorePanel from "./components/LorePanel";
import DivergencePanel from "./components/DivergencePanel";
import CharacterChat from "./components/CharacterChat";
import type { AppStep, Lore, StoryEvent } from "./types";
import type { BranchContext } from "./types";

export default function App() {
  const [step, setStep] = useState<AppStep>("upload");
  const [lore, setLore] = useState<Lore | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<StoryEvent | null>(null);
  const [branch, setBranch] = useState<BranchContext | null>(null);

  // Step indicator
  const steps: { key: AppStep; label: string }[] = [
    { key: "upload", label: "1. Upload" },
    { key: "lore", label: "2. Explore Lore" },
    { key: "diverge", label: "3. What If?" },
    { key: "chat", label: "4. Talk to Characters" },
  ];

  return (
    <div className="bg-gray-950 min-h-screen">
      {/* Progress bar — hide on upload screen */}
      {step !== "upload" && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur border-b border-gray-800 px-6 py-2">
          <div className="max-w-6xl mx-auto flex items-center gap-2">
            {steps.map((s, i) => {
              const stepOrder = { upload: 0, lore: 1, diverge: 2, chat: 3 };
              const current = stepOrder[step];
              const sOrder = stepOrder[s.key];
              return (
                <div key={s.key} className="flex items-center gap-2">
                  {i > 0 && (
                    <div
                      className={`h-px w-6 ${sOrder <= current ? "bg-purple-500" : "bg-gray-700"}`}
                    />
                  )}
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full transition-all
                    ${s.key === step ? "bg-purple-600 text-white" : sOrder < current ? "text-purple-400" : "text-gray-600"}`}
                  >
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className={step !== "upload" ? "pt-10" : ""}>
        {step === "upload" && (
          <UploadPanel
            onLoreLoaded={(l) => {
              setLore(l);
              setStep("lore");
            }}
          />
        )}

        {step === "lore" && lore && (
          <LorePanel
            lore={lore}
            onSelectEvent={(event) => {
              setSelectedEvent(event);
              setStep("diverge");
            }}
            onReset={() => {
              setLore(null);
              setBranch(null);
              setSelectedEvent(null);
              setStep("upload");
            }}
          />
        )}

        {step === "diverge" && lore && selectedEvent && (
          <DivergencePanel
            lore={lore}
            selectedEvent={selectedEvent}
            onBranchReady={(ctx) => {
              setBranch(ctx);
            }}
            onBack={() => setStep("lore")}
          />
        )}

        {step === "diverge" && branch && (
          <div className="fixed bottom-6 right-6">
            <button
              onClick={() => setStep("chat")}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 font-semibold shadow-xl shadow-purple-900/40 transition-all text-white"
            >
              💬 Talk to Characters →
            </button>
          </div>
        )}

        {step === "chat" && lore && branch && (
          <CharacterChat
            lore={lore}
            branch={branch}
            onBack={() => setStep("diverge")}
          />
        )}
      </div>
    </div>
  );
}
