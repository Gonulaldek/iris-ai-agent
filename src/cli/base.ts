export type Role = "system" | "user" | "assistant" | "tool";

export interface Message {
  role: Role;
  content: string;
  name?: string;
}

export interface ToolCall {
  toolName: string;
  args: Record<string, unknown>;
}

export interface AgentResponse {
  message: string;
  toolCalls?: ToolCall[];
}