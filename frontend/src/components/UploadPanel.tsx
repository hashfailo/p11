import {
  Check,
  FileText,
  FolderOpen,
  GitBranch,
  LoaderCircle,
  Sparkles,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { uploadFile, uploadMultiverseFiles } from "../api";
import type { Lore, StoryMode } from "../types";

interface Props {
  onLoreLoaded: (lore: Lore, mode: StoryMode) => void;
}
const TEST_STORY = `THE LAST TRAIN

Arjun and Maya have been friends for years.

One evening, Arjun receives a mysterious letter asking him to meet someone at the railway station.

Arjun meets Maya at the station. Maya tells him that Ravi, their mutual friend, betrayed them.

Arjun becomes angry and decides to leave Hyderabad on the last train.

Ravi arrives after Arjun has left. Ravi carries evidence proving that he did not betray Arjun.

Arjun discovers the truth only after the train has departed.`;

export default function UploadPanel({ onLoreLoaded }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [mode, setMode] = useState<StoryMode>("single");
  const [storyA, setStoryA] = useState<File | null>(null);
  const [storyB, setStoryB] = useState<File | null>(null);
  const [multiverseStage, setMultiverseStage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const storyAInputRef = useRef<HTMLInputElement>(null);
  const storyBInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    setWarning("");
    setLoading(true);
    try {
      const result = await uploadFile(file);
      if (result.warning) setWarning(result.warning);
      onLoreLoaded(result.lore, "single");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };
  const handleMultiverse = async () => {
    if (!storyA || !storyB) return;
    setError("");
    setWarning("");
    setLoading(true);
    try {
      setMultiverseStage("Reading Story A");
      await new Promise((resolve) => setTimeout(resolve, 250));
      setMultiverseStage("Reading Story B");
      await new Promise((resolve) => setTimeout(resolve, 250));
      setMultiverseStage("Building the Multiverse");
      const result = await uploadMultiverseFiles(storyA, storyB);
      onLoreLoaded(result.lore, "multiverse");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
      setMultiverseStage("");
    }
  };
  const chooseFile = (file: File | undefined, source: "a" | "b") => {
    if (!file) return;
    if (source === "a") setStoryA(file);
    else setStoryB(file);
    setError("");
  };
  const handleTestStory = async () => {
    const blob = new Blob([TEST_STORY], { type: "text/plain" });
    await handleFile(
      new File([blob], "the_last_train.txt", { type: "text/plain" }),
    );
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-5 py-12 text-slate-100 sm:px-8">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-accent/[0.035] blur-3xl" />
      <div className="relative w-full max-w-3xl animate-rise-in">
        <div className="mb-10 max-w-xl">
          <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-accent">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface-2 shadow-neumorphic">
              <Sparkles size={17} />
            </span>
            Altera / Narrative laboratory
          </div>
          <h1 className="text-5xl font-semibold tracking-[-0.04em] text-stone-100 sm:text-7xl">
            Rewrite the
            <br />
            <span className="text-accent">known story.</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-400">
            Extract a world from any story, find its pivotal moments, and
            explore the timelines that could have been.
          </p>
        </div>

        <div className="mb-6 flex rounded-xl bg-surface p-1 shadow-neumorphic">
          <button
            onClick={() => setMode("single")}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition ${mode === "single" ? "bg-surface-2 text-stone-100 shadow-neumorphic-inset" : "text-slate-500 hover:text-slate-300"}`}
          >
            Single Story
          </button>
          <button
            onClick={() => setMode("multiverse")}
            className={`flex-1 rounded-lg px-4 py-3 text-sm font-semibold transition ${mode === "multiverse" ? "bg-accent text-ink shadow-neumorphic" : "text-slate-500 hover:text-slate-300"}`}
          >
            <span className="inline-flex items-center gap-2"><GitBranch size={16} /> Multiverse</span>
          </button>
        </div>

        {mode === "single" ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => inputRef.current?.click()}
            className={`group rounded-2xl border border-dashed p-8 text-center transition duration-300 sm:p-12 ${dragOver ? "border-accent bg-accent/[0.06] shadow-neumorphic-inset" : "border-white/[0.13] bg-surface shadow-neumorphic hover:border-white/25"}`}
          >
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-surface-2 text-accent shadow-neumorphic transition duration-300 group-hover:-translate-y-1">
              <UploadCloud size={26} strokeWidth={1.6} />
            </div>
            <h2 className="text-lg font-semibold text-stone-100">
              Bring a story into the lab
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Drop a .txt or .pdf file here, or click to browse
            </p>
            <div className="mt-5 flex justify-center gap-2 text-[11px] uppercase tracking-wider text-slate-600">
              <span className="rounded-md bg-surface-2 px-2 py-1">TXT</span>
              <span className="rounded-md bg-surface-2 px-2 py-1">PDF</span>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { label: "Story A", file: storyA, ref: storyAInputRef },
              { label: "Story B", file: storyB, ref: storyBInputRef },
            ].map((story, index) => (
              <button
                key={story.label}
                onClick={() => story.ref.current?.click()}
                className={`group rounded-2xl border border-dashed p-7 text-left transition duration-300 ${story.file ? "border-accent/50 bg-accent/[0.05]" : "border-white/[0.13] bg-surface shadow-neumorphic hover:border-white/25"}`}
              >
                <input
                  ref={story.ref}
                  type="file"
                  accept=".txt,.pdf"
                  className="hidden"
                  onChange={(e) => chooseFile(e.target.files?.[0], index === 0 ? "a" : "b")}
                />
                <div className="mb-5 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">{story.label}</span>
                  {story.file && <Check size={17} className="text-accent" />}
                </div>
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-accent shadow-neumorphic"><UploadCloud size={21} /></div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-stone-100">{story.file?.name || "Choose a story"}</div>
                    <div className="mt-1 text-xs text-slate-500">{story.file ? "Ready to combine" : "TXT or PDF"}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {mode === "single" && <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-xs uppercase tracking-[0.2em] text-slate-600">
            or start here
          </span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>}
        {mode === "single" ? <button
          onClick={handleTestStory}
          disabled={loading}
          className="flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-accent px-5 font-semibold text-ink shadow-neumorphic transition duration-300 hover:brightness-110 active:scale-[0.99] active:shadow-neumorphic-inset disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderCircle size={19} className="animate-spin" /> Reading the
              story...
            </>
          ) : (
            <>
              <FileText size={19} /> Load “The Last Train”
            </>
          )}
        </button> : <div>
          <p className="mt-5 text-center text-sm leading-6 text-slate-500">Altera will combine both stories into one shared narrative universe.</p>
          <button
            onClick={handleMultiverse}
            disabled={loading || !storyA || !storyB}
            className="mt-5 flex h-14 w-full items-center justify-center gap-3 rounded-xl bg-accent px-5 font-semibold text-ink shadow-neumorphic transition duration-300 hover:brightness-110 active:scale-[0.99] active:shadow-neumorphic-inset disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <><LoaderCircle size={19} className="animate-spin" /> {multiverseStage}</> : <><GitBranch size={19} /> Generate Multiverse</>}
          </button>
        </div>}
        {warning && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-accent/25 bg-accent/[0.07] p-4 text-sm text-accent">
            <FolderOpen size={17} className="mt-0.5 shrink-0" />
            {warning}
          </div>
        )}
        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-900/70 bg-red-950/30 p-4 text-sm text-red-300">
            <XCircle size={17} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
        <p className="mt-6 text-center text-xs text-slate-600">
          Your story stays in this session. No account required.
        </p>
      </div>
    </div>
  );
}
