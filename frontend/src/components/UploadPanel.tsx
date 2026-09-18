import {
  FileText,
  FolderOpen,
  LoaderCircle,
  Sparkles,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { uploadFile } from "../api";
import type { Lore } from "../types";

interface Props {
  onLoreLoaded: (lore: Lore) => void;
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
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    setWarning("");
    setLoading(true);
    try {
      const result = await uploadFile(file);
      if (result.warning) setWarning(result.warning);
      onLoreLoaded(result.lore);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
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
            P11 / Narrative laboratory
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

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/[0.08]" />
          <span className="text-xs uppercase tracking-[0.2em] text-slate-600">
            or start here
          </span>
          <div className="h-px flex-1 bg-white/[0.08]" />
        </div>
        <button
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
        </button>
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
