"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Sidebar } from "@/components/Sidebar";
import { MessageBubble } from "@/components/MessageBubble";
import { ChatInput } from "@/components/ChatInput";
import { EmptyState } from "@/components/EmptyState";
import { Message, Conversation, Source } from "@/lib/types";
import { streamChat, getConversations, deleteConversation, getMessages } from "@/lib/api";
import { getSessionId } from "@/lib/session";

export default function Home() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const sessionId = useRef<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sessionId.current = getSessionId();
    loadConversations();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversations = async () => {
    const convs = await getConversations(sessionId.current);
    setConversations(convs);
  };

  const selectConversation = async (convId: string) => {
    setActiveConvId(convId);
    const msgs = await getMessages(convId);
    setMessages(
      msgs.map((m: { msg_id: string; role: "user" | "assistant"; content: string; sources: Source[]; created_at: string }) => ({
        id: m.msg_id,
        role: m.role,
        content: m.content,
        sources: m.sources || [],
        createdAt: new Date(m.created_at),
      }))
    );
  };

  const startNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleDelete = async (convId: string) => {
    await deleteConversation(convId);
    if (activeConvId === convId) startNewChat();
    setConversations((prev) => prev.filter((c) => c.conv_id !== convId));
  };

  const sendMessage = useCallback(async (query: string) => {
    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: query,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setStreaming(true);

    const assistantId = crypto.randomUUID();
    const assistantMsg: Message = { id: assistantId, role: "assistant", content: "", createdAt: new Date() };
    setMessages((prev) => [...prev, assistantMsg]);

    let currentConvId = activeConvId;
    let sources: Source[] = [];

    try {
      for await (const event of streamChat(query, currentConvId, sessionId.current)) {
        if (event.type === "chunk") {
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: m.content + (event.text as string) } : m)
          );
        } else if (event.type === "sources") {
          sources = event.sources as Source[];
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, sources } : m)
          );
        } else if (event.type === "done") {
          currentConvId = event.conv_id as string;
          setActiveConvId(currentConvId);
          await loadConversations();
        } else if (event.type === "error") {
          setMessages((prev) =>
            prev.map((m) => m.id === assistantId ? { ...m, content: "Something went wrong. Please try again." } : m)
          );
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => m.id === assistantId ? { ...m, content: "Connection error. Is the API running?" } : m)
      );
    } finally {
      setStreaming(false);
    }
  }, [activeConvId]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        conversations={conversations}
        activeConvId={activeConvId}
        collapsed={sidebarCollapsed}
        onSelect={selectConversation}
        onNew={startNewChat}
        onDelete={handleDelete}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      <main className="flex flex-col flex-1 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-6 py-3 border-b flex-shrink-0"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
        >
          <span
            className="text-sm font-semibold"
            style={{ fontFamily: "var(--font-inter-tight)", color: "var(--secondary)" }}
          >
            {conversations.find((c) => c.conv_id === activeConvId)?.title ?? "New conversation"}
          </span>
          <span
            className="text-xs"
            style={{ color: "var(--secondary)", fontFamily: "var(--font-jetbrains)" }}
          >
            Studio Blo Mind
          </span>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <EmptyState onSuggestion={sendMessage} />
          ) : (
            <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
              {messages.map((m) => (
                <div key={m.id} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  {m.role === "assistant" && (
                    <div className="flex-shrink-0 w-7 h-7 rounded-[8px] flex items-center justify-center font-bold text-[11px] mt-0.5" style={{ backgroundColor: "var(--accent)", color: "var(--accent-on)", fontFamily: "var(--font-inter-tight)" }}>
                      G
                    </div>
                  )}
                  <div className={m.role === "user" ? "w-full" : "flex-1 min-w-0"}>
                    <MessageBubble message={m} />
                  </div>
                </div>
              ))}
              {streaming && messages[messages.length - 1]?.role === "assistant" && messages[messages.length - 1]?.content === "" && (
                <div className="flex gap-3 items-center">
                  <div className="w-7 h-7 rounded-[8px] flex-shrink-0" style={{ backgroundColor: "var(--accent)" }} />
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ backgroundColor: "var(--secondary)", animationDelay: `${i * 0.18}s` }} />
                    ))}
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <div
          className="flex-shrink-0 px-6 py-4 border-t"
          style={{ borderColor: "var(--border)", backgroundColor: "var(--background)" }}
        >
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={sendMessage} disabled={streaming} />
            <p className="text-center mt-2 text-xs" style={{ color: "var(--secondary)", fontFamily: "var(--font-jetbrains)" }}>
              Answers are generated from Studio Blo&apos;s internal documents.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
