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

export type RouterDecision =
  | { type: "message"; content: string }
  | { type: "tool_call"; toolName: string; args: Record<string, unknown> }
  | { type: "plan"; steps: Array<{ toolName: string; args: Record<string, unknown> }> };

export interface AgentContext {
  workspaceRoot: string;
}
