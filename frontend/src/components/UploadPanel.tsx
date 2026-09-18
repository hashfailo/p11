import { useState, useRef } from "react";
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
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setError("");
    setLoading(true);
    try {
      const { lore } = await uploadFile(file);
      onLoreLoaded(lore);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTestStory = async () => {
    const blob = new Blob([TEST_STORY], { type: "text/plain" });
    const file = new File([blob], "the_last_train.txt", { type: "text/plain" });
    await handleFile(file);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent mb-3">
            NarrativeOS
          </h1>
          <p className="text-gray-400 text-lg">
            Upload any story. Rewrite history. Talk to the characters.
          </p>
        </div>

        <div
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer
            ${dragOver ? "border-purple-400 bg-purple-900/20" : "border-gray-700 hover:border-gray-500"}`}
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
        >
          <div className="text-5xl mb-4">📄</div>
          <p className="text-xl text-gray-300 mb-2">
            Drop a .txt or .pdf file here
          </p>
          <p className="text-gray-500 text-sm">or click to browse</p>
          <input
            ref={inputRef}
            type="file"
            accept=".txt,.pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>

        <div className="flex items-center my-6">
          <div className="flex-1 h-px bg-gray-800" />
          <span className="px-4 text-gray-600 text-sm">or</span>
          <div className="flex-1 h-px bg-gray-800" />
        </div>

        <button
          onClick={handleTestStory}
          disabled={loading}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 font-semibold text-lg transition-all disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin">⏳</span> Analyzing story...
            </span>
          ) : (
            '⚡ Load Test Story — "The Last Train"'
          )}
        </button>

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-900/40 border border-red-700 text-red-300">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
