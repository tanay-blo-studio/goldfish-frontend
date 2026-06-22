"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { ArrowUp } from "lucide-react";

interface ChatInputProps {
  onSend: (query: string) => void;
  disabled: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const submit = () => {
    const q = value.trim();
    if (!q || disabled) return;
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    onSend(q);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  const onInput = () => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  };

  return (
    <div
      className="flex items-end gap-3 px-4 py-3 rounded-[14px] border"
      style={{ backgroundColor: "var(--surface)", borderColor: "var(--border)" }}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={onKeyDown}
        onInput={onInput}
        placeholder="Ask anything about Studio Blo's knowledge base…"
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none bg-transparent text-sm leading-[1.55] outline-none placeholder:text-[var(--secondary)] disabled:opacity-50"
        style={{ color: "var(--foreground)", fontFamily: "var(--font-inter)", maxHeight: "160px" }}
      />
      <button
        onClick={submit}
        disabled={!value.trim() || disabled}
        className="flex items-center justify-center w-8 h-8 rounded-[8px] flex-shrink-0 transition-opacity disabled:opacity-30"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-on)" }}
      >
        <ArrowUp size={15} />
      </button>
    </div>
  );
}
