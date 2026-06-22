const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function* streamChat(
  query: string,
  convId: string | null,
  sessionId: string
): AsyncGenerator<{ type: string; [key: string]: unknown }> {
  const res = await fetch(`${API_URL}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Session-ID": sessionId,
    },
    body: JSON.stringify({ query, conv_id: convId, n_results: 6 }),
  });

  if (!res.ok || !res.body) throw new Error(`API error ${res.status}`);

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        try {
          yield JSON.parse(line.slice(6));
        } catch {}
      }
    }
  }
}

export async function getConversations(sessionId: string) {
  const res = await fetch(`${API_URL}/sessions/${sessionId}/conversations`);
  if (!res.ok) return [];
  return res.json();
}

export async function deleteConversation(convId: string) {
  await fetch(`${API_URL}/conversations/${convId}`, { method: "DELETE" });
}

export async function getMessages(convId: string) {
  const res = await fetch(`${API_URL}/conversations/${convId}/messages`);
  if (!res.ok) return [];
  return res.json();
}
