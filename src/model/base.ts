import { RouterDecision } from "../core/types";
import { ToolRegistry } from "../core/toolRegistry";

export interface RouterModel {
  decide(userInput: string, registry: ToolRegistry): Promise<RouterDecision>;
}