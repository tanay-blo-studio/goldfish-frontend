export interface Source {
  section_id: string;
  section_title: string;
  source_file: string;
  intent_summary: string;
  intent_category: string;
  modality: string;
  tools_mentioned: string[];
  rerank_score: number | null;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  createdAt: Date;
}

export interface Conversation {
  conv_id: string;
  title: string;
  updated_at: string;
  last_message?: string;
}
