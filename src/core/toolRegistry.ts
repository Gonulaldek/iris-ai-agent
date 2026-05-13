import { AgentContext } from "./types";
import { ToolDefinition } from "../tools/base";


export class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  register(tool: ToolDefinition): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool zaten kayıtlı: ${tool.name}`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  async execute(
    name: string,
    args: Record<string, unknown>,
    context: AgentContext
  ): Promise<string> {
    const tool = this.tools.get(name);

    if (!tool) {
      throw new Error(`Bilinmeyen tool: ${name}`);
    }

    return tool.execute(args, context);
  }
}