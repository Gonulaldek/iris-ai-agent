import fs from "node:fs/promises";
import path from "node:path";
import { ToolDefinition } from "./base";
import { resolveSafePath } from "../utils/paths";

export const listDirTool: ToolDefinition = {
  name: "list_dir",
  description: "Bir klasördeki dosya ve klasörleri listeler.",
  permissionTag: "read",
  inputSchema: {
    path: "string"
  },

  async execute(args, context) {
    const rawPath = typeof args.path === "string" ? args.path : ".";
    const safePath = resolveSafePath(context.workspaceRoot, rawPath);

    const entries = await fs.readdir(safePath, { withFileTypes: true });

    if (entries.length === 0) {
      return "Klasör boş.";
    }

    const lines = entries
      .sort((a, b) => a.name.localeCompare(b.name, "tr"))
      .map((entry) => {
        const fullPath = path.join(rawPath, entry.name);
        return entry.isDirectory()
          ? `[DIR]  ${fullPath}`
          : `[FILE] ${fullPath}`;
      });

    return lines.join("\n");
  }
};