import { AgentContext } from "../core/types";

export type ToolPermissionTag = "none" | "read" | "write" | "shell" | "delete";

export interface ToolDefinition {
  name: string;
  description: string;
  permissionTag: ToolPermissionTag;
  inputSchema: Record<string, unknown>;
  execute(args: Record<string, unknown>, context: AgentContext): Promise<string>;
}