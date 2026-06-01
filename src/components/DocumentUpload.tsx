// DocumentUpload.tsx
// A drag-and-drop area where the user attaches deal documents (offering memo,
// rent roll, T12, financials). Today the files are attached and listed but not
// yet read by AI — the analysis runs on the numbers from the Analyze tab. The
// component is built so that, once an API key + backend are added, these exact
// files get sent to Claude for extraction.

import { useRef, useState } from "react";

interface DocumentUploadProps {
  files: File[];
  onChange: (files: File[]) => void;
}

const ACCEPTED = ".pdf,.csv,.xlsx,.xls,.txt";

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentUpload({ files, onChange }: DocumentUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function addFiles(list: FileList | null) {
    if (!list) return;
    onChange([...files, ...Array.from(list)]);
  }

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="card p-4">
      <h3 className="section-label mb-3">Deal Documents</h3>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition ${
          dragging
            ? "border-indigo-500 bg-indigo-50"
            : "border-slate-300 hover:border-indigo-400"
        }`}
      >
        <span className="text-3xl">📄</span>
        <p className="mt-2 text-sm font-medium text-slate-600">
          Drop files here or click to upload
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Offering memo, rent roll, T12, financials — PDF, Excel, or CSV
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          multiple
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Attached files */}
      {files.length > 0 && (
        <ul className="mt-3 space-y-1">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-1.5 text-sm"
            >
              <span className="truncate text-slate-700">{file.name}</span>
              <span className="ml-2 flex items-center gap-3 text-xs text-slate-400">
                {formatSize(file.size)}
                <button
                  type="button"
                  onClick={() => removeFile(i)}
                  className="text-rose-500 hover:underline"
                >
                  Remove
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Honest demo-mode notice */}
      <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-700">
        <strong>Demo mode:</strong> document reading by AI isn't enabled yet. The
        analysis below uses the numbers from the <strong>Analyze</strong> tab.
        Add an Anthropic API key (see ROADMAP) to have Claude read these files
        and extract the numbers automatically.
      </p>
    </div>
  );
}
