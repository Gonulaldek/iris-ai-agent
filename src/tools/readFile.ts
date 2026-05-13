import fs from "node:fs/promises";
import { ToolDefinition } from "./base";
import { resolveSafePath } from "../utils/paths";

export const readFileTool: ToolDefinition = {
  name: "read_file",
  description: "Bir dosyanın içeriğini okur.",
  permissionTag: "read",
  inputSchema: {
    path: "string"
  },

  async execute(args, context) {
    const rawPath = args.path;

    if (typeof rawPath !== "string" || rawPath.trim() === "") {
      throw new Error("read_file için geçerli bir path gerekli.");
    }

    const safePath = resolveSafePath(context.workspaceRoot, rawPath);
    const content = await fs.readFile(safePath, "utf-8");

    return content;
  }
};