const SUGGESTIONS = [
  "Kling vs Seedance — when to use which?",
  "How do we handle motion consistency in Kling?",
  "What are the best settings for Topaz Video AI?",
  "How do we fix morphing in city shots?",
  "How does the SyncLabs lip sync workflow work?",
];

interface EmptyStateProps {
  onSuggestion: (q: string) => void;
}

export function EmptyState({ onSuggestion }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center flex-1 px-6 py-16 text-center">
      <div
        className="w-12 h-12 rounded-[14px] flex items-center justify-center font-bold text-lg mb-6"
        style={{ backgroundColor: "var(--accent)", color: "var(--accent-on)", fontFamily: "var(--font-inter-tight)" }}
      >
        SB
      </div>
      <h1
        className="text-[2rem] font-semibold tracking-[-0.03em] mb-2"
        style={{ fontFamily: "var(--font-inter-tight)", color: "var(--foreground)" }}
      >
        What are we building today?
      </h1>
      <p className="text-sm mb-10" style={{ color: "var(--secondary)" }}>
        Ask anything from Studio Blo&apos;s AI knowledge mind.
      </p>

      <div className="flex flex-wrap justify-center gap-2 max-w-xl">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onSuggestion(s)}
            className="px-3 py-1.5 rounded-[8px] text-xs border transition-colors hover:border-[var(--accent)] hover:text-[var(--foreground)]"
            style={{
              borderColor: "var(--border)",
              color: "var(--secondary)",
              fontFamily: "var(--font-jetbrains)",
            }}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
