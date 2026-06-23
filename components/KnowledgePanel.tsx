"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronDown, ChevronRight, Upload } from "lucide-react";

interface DocEntry {
  source_file: string;
  section_count: number;
}

type UploadState = "idle" | "uploading" | "done" | "error";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function formatName(source_file: string): string {
  return source_file
    .replace(/\.(pdf|html|xlsx|csv)$/i, "")
    .replace(/_/g, " ")
    .replace(/-/g, " ");
}

function fileType(source_file: string): string {
  const ext = source_file.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = { pdf: "PDF", html: "HTML", xlsx: "Excel", csv: "CSV" };
  return map[ext] ?? ext.toUpperCase();
}

function isExcel(filename: string): boolean {
  return /\.(xlsx|xls|csv)$/i.test(filename);
}

export function KnowledgePanel({ collapsed }: { collapsed: boolean }) {
  const [docs, setDocs] = useState<DocEntry[]>([]);
  const [open, setOpen] = useState(true);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [uploadMsg, setUploadMsg] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDocs = () => {
    fetch(`${API_URL}/documents`)
      .then((r) => r.json())
      .then(setDocs)
      .catch(() => {});
  };

  useEffect(() => { loadDocs(); }, []);

  const handleFile = async (file: File) => {
    const endpoint = isExcel(file.name) ? "/ingest/excel" : "/ingest/pdf";
    const form = new FormData();
    form.append("file", file);

    setUploadState("uploading");
    setUploadMsg(file.name);

    try {
      const res = await fetch(`${API_URL}${endpoint}`, { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Upload failed");
      const detail = data.sections_indexed != null ? ` · ${data.sections_indexed} sections` : "";
      setUploadMsg(`Done${detail}`);
      setUploadState("done");
      loadDocs();
      setTimeout(() => setUploadState("idle"), 3000);
    } catch (e) {
      setUploadMsg(e instanceof Error ? e.message : "Upload failed");
      setUploadState("error");
      setTimeout(() => setUploadState("idle"), 4000);
    }
  };

  if (collapsed) return null;

  const totalSections = docs.reduce((sum, d) => sum + d.section_count, 0);

  return (
    <div className="border-t px-2 py-3" style={{ borderColor: "var(--border)" }}>
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 w-full px-2 py-1 rounded-[6px] transition-colors hover:bg-[#1E2024] mb-1"
      >
        <BookOpen size={12} style={{ color: "var(--accent)", flexShrink: 0 }} />
        <span className="flex-1 text-left text-[11px] font-medium tracking-[0.02em]" style={{ fontFamily: "var(--font-jetbrains)", color: "var(--secondary)" }}>
          KNOWLEDGE BASE
        </span>
        {open ? <ChevronDown size={11} style={{ color: "var(--secondary)" }} /> : <ChevronRight size={11} style={{ color: "var(--secondary)" }} />}
      </button>

      {open && (
        <div className="space-y-0.5">
          {/* Summary + upload button */}
          <div className="flex items-center justify-between px-2 pb-1">
            <p className="text-[10px]" style={{ color: "var(--secondary)", fontFamily: "var(--font-jetbrains)" }}>
              {docs.length} docs · {totalSections} sections
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadState === "uploading"}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] transition-colors hover:bg-[#1E2024] disabled:opacity-40"
              style={{ color: "var(--secondary)" }}
              title="Upload PDF or Excel"
            >
              <Upload size={10} />
              <span className="text-[10px]" style={{ fontFamily: "var(--font-jetbrains)" }}>Upload</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
            />
          </div>

          {/* Upload status */}
          {uploadState !== "idle" && (
            <div
              className="mx-2 px-2 py-1.5 rounded-[6px] text-[10px] truncate"
              style={{
                fontFamily: "var(--font-jetbrains)",
                backgroundColor: "var(--surface-2)",
                color: uploadState === "error" ? "#f87171" : uploadState === "done" ? "#4ade80" : "var(--secondary)",
              }}
            >
              {uploadState === "uploading" && "⏳ "}
              {uploadState === "done" && "✓ "}
              {uploadState === "error" && "✗ "}
              {uploadMsg}
            </div>
          )}

          {/* Doc list */}
          {docs.map((doc) => (
            <div
              key={doc.source_file}
              className="flex items-center justify-between px-2 py-1.5 rounded-[6px]"
              style={{ backgroundColor: "var(--surface-2)" }}
            >
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-medium truncate" style={{ color: "var(--foreground)" }}>
                  {formatName(doc.source_file)}
                </p>
                <p className="text-[10px]" style={{ color: "var(--secondary)", fontFamily: "var(--font-jetbrains)" }}>
                  {fileType(doc.source_file)} · {doc.section_count} sections
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
