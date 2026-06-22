"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Message, Source } from "@/lib/types";

function SourceCard({ source, index }: { source: Source; index: number }) {
  const fileName = source.source_file.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
  return (
    <div
      className="flex items-start gap-3 px-3 py-3 rounded-[10px] border transition-colors hover:border-[var(--secondary)]"
      style={{ backgroundColor: "var(--surface-2)", borderColor: "var(--border)" }}
    >
      <span
        className="flex-shrink-0 w-5 h-5 rounded-[6px] flex items-center justify-center text-[10px] font-bold mt-0.5"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-on)", fontFamily: "var(--font-jetbrains)" }}
      >
        {index + 1}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium leading-[1.4] mb-0.5" style={{ color: "var(--foreground)" }}>
          {source.section_title}
        </p>
        <div className="flex items-center gap-1.5">
          <FileText size={10} style={{ color: "var(--secondary)", flexShrink: 0 }} />
          <p className="text-[10px] truncate" style={{ color: "var(--secondary)", fontFamily: "var(--font-jetbrains)" }}>
            {fileName}
          </p>
        </div>
      </div>
    </div>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const [showSources, setShowSources] = useState(false);
  const isUser = message.role === "user";
  const hasSources = (message.sources?.length ?? 0) > 0;

  if (isUser) {
    return (
      <div className="flex justify-end mb-1">
        <div
          className="max-w-[72%] px-4 py-3 rounded-[14px] rounded-br-[4px] text-sm leading-[1.6]"
          style={{ backgroundColor: "var(--surface-2)", color: "var(--foreground)", border: "1px solid var(--border)" }}
        >
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Answer */}
      <div
        className="text-sm leading-[1.7]"
        style={{ color: "var(--foreground)" }}
      >
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-[1.05rem] font-semibold mt-5 mb-2 pb-1.5 border-b" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--foreground)", borderColor: "var(--border)" }}>
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-sm font-semibold mt-4 mb-1.5" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--foreground)" }}>
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-medium mt-3 mb-1" style={{ color: "var(--foreground)" }}>
                {children}
              </h3>
            ),
            p: ({ children }) => <p className="mb-3 last:mb-0 leading-[1.7]">{children}</p>,
            ul: ({ children }) => <ul className="mb-3 pl-4 space-y-1.5 list-none">{children}</ul>,
            ol: ({ children }) => <ol className="mb-3 pl-4 space-y-1.5 list-decimal">{children}</ol>,
            li: ({ children }) => (
              <li className="text-sm leading-[1.6] flex gap-2 items-start">
                <span className="mt-[6px] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--accent)" }} />
                <span>{children}</span>
              </li>
            ),
            strong: ({ children }) => (
              <strong style={{ color: "var(--foreground)", fontWeight: 600 }}>{children}</strong>
            ),
            em: ({ children }) => (
              <em style={{ color: "var(--secondary)" }}>{children}</em>
            ),
            code: ({ children }) => (
              <code
                className="px-1.5 py-0.5 rounded-[5px] text-[0.78rem]"
                style={{ backgroundColor: "#1a1f24", color: "var(--accent)", fontFamily: "var(--font-jetbrains)", border: "1px solid var(--border)" }}
              >
                {children}
              </code>
            ),
            blockquote: ({ children }) => (
              <blockquote
                className="border-l-2 pl-4 my-3 italic"
                style={{ borderColor: "var(--accent)", color: "var(--secondary)" }}
              >
                {children}
              </blockquote>
            ),
            hr: () => <hr className="my-4" style={{ borderColor: "var(--border)" }} />,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>

      {/* Sources */}
      {hasSources && (
        <div className="mt-1">
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[8px] text-xs transition-colors hover:bg-[var(--surface-2)]"
            style={{ color: "var(--secondary)", fontFamily: "var(--font-jetbrains)" }}
          >
            {showSources ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            <span>{message.sources!.length} source{message.sources!.length !== 1 ? "s" : ""}</span>
          </button>

          {showSources && (
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {message.sources!.map((s, i) => (
                <SourceCard key={s.section_id} source={s} index={i} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
