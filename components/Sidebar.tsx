"use client";

import Link from "next/link";
import { Plus, MessageSquare, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Conversation } from "@/lib/types";

interface SidebarProps {
  conversations: Conversation[];
  activeConvId: string | null;
  collapsed: boolean;
  onSelect: (convId: string) => void;
  onNew: () => void;
  onDelete: (convId: string) => void;
  onToggle: () => void;
}

export function Sidebar({ conversations, activeConvId, collapsed, onSelect, onNew, onDelete, onToggle }: SidebarProps) {
  return (
    <aside
      className="flex flex-col border-r transition-all duration-200"
      style={{
        width: collapsed ? "52px" : "260px",
        minWidth: collapsed ? "52px" : "260px",
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
              className="group flex items-center gap-2 px-3 py-2 rounded-[8px] cursor-pointer transition-colors"
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
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded transition-opacity"
                style={{ color: "var(--secondary)" }}
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}
