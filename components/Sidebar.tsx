"use client";

import Link from "next/link";
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Conversation } from "@/lib/types";
import { KnowledgePanel } from "@/components/KnowledgePanel";

interface SidebarProps {
  conversations: Conversation[];
  activeConvId: string | null;
  collapsed: boolean;
  onSelect: (convId: string) => void;
  onNew: () => void;
  onDelete: (convId: string) => void;
  onToggle: () => void;
}

const MIN_WIDTH = 180;
const MAX_WIDTH = 480;
const DEFAULT_WIDTH = 260;

export function Sidebar({ conversations, activeConvId, collapsed, onSelect, onNew, onDelete, onToggle }: SidebarProps) {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(DEFAULT_WIDTH);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    dragging.current = true;
    startX.current = e.clientX;
    startWidth.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [width]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const delta = e.clientX - startX.current;
      const next = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, startWidth.current + delta));
      setWidth(next);
    };
    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  const sidebarWidth = collapsed ? 52 : width;

  return (
    <aside
      className="flex flex-col border-r relative"
      style={{
        width: sidebarWidth,
        minWidth: sidebarWidth,
        backgroundColor: "var(--surface)",
        borderColor: "var(--border)",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-3 border-b" style={{ borderColor: "var(--border)" }}>
        {!collapsed && (
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-[8px] flex items-center justify-center font-bold text-xs" style={{ backgroundColor: "var(--accent)", color: "var(--accent-on)" }}>
              G
            </div>
            <span className="text-sm font-semibold" style={{ fontFamily: "var(--font-inter-tight)", color: "var(--foreground)" }}>
              Goldfish
            </span>
          </Link>
        )}
        {collapsed && (
          <Link href="/" className="mx-auto hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-[8px] flex items-center justify-center font-bold text-xs" style={{ backgroundColor: "var(--accent)", color: "var(--accent-on)" }}>
              G
            </div>
          </Link>
        )}
        <button
          onClick={onToggle}
          className="p-1 rounded-md transition-colors hover:bg-[#1E2024]"
          style={{ color: "var(--secondary)", marginLeft: collapsed ? "auto" : undefined }}
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      {/* New Chat button */}
      <div className="px-2 py-2">
        <button
          onClick={onNew}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-[8px] text-sm font-medium transition-colors hover:bg-[#1E2024]"
          style={{ color: "var(--secondary)" }}
          title="New chat"
        >
          <Plus size={15} />
          {!collapsed && <span>New chat</span>}
        </button>
      </div>

      {/* Conversations */}
      {!collapsed && (
        <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
          {conversations.length === 0 && (
            <p className="text-xs px-3 py-4 text-center" style={{ color: "var(--secondary)", fontFamily: "var(--font-jetbrains)" }}>
              No conversations yet
            </p>
          )}
          {conversations.map((c) => (
            <div
              key={c.conv_id}
              className="group flex items-center gap-2 px-3 py-2 rounded-[8px] cursor-pointer transition-colors hover:bg-[#1E2024]"
              style={{
                backgroundColor: activeConvId === c.conv_id ? "var(--surface-2)" : "transparent",
              }}
              onClick={() => onSelect(c.conv_id)}
            >
              <MessageSquare size={13} style={{ color: "var(--secondary)", flexShrink: 0 }} />
              <span
                className="flex-1 text-sm truncate"
                style={{ color: activeConvId === c.conv_id ? "var(--foreground)" : "var(--secondary)" }}
              >
                {c.title}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(c.conv_id); }}
                className="opacity-20 group-hover:opacity-70 hover:!opacity-100 p-0.5 rounded transition-opacity flex-shrink-0"
                style={{ color: "var(--secondary)" }}
                title="Delete"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <KnowledgePanel collapsed={collapsed} />

      {/* Drag handle — only shown when not collapsed */}
      {!collapsed && (
        <div
          onMouseDown={onMouseDown}
          className="absolute top-0 right-0 h-full w-1 cursor-col-resize hover:bg-[#3a3d42] transition-colors"
          style={{ zIndex: 10 }}
        />
      )}
    </aside>
  );
}
