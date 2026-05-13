import fs from "node:fs/promises";
import path from "node:path";
import { ToolDefinition } from "./base";
import { resolveSafePath } from "../utils/paths";

export const writeFileTool: ToolDefinition = {
  name: "write_file",
  description: "Bir dosyaya içerik yazar. Dosya yoksa oluşturur.",
  permissionTag: "write",
  inputSchema: {
    path: "string",
    content: "string"
  },

  async execute(args, context) {
    const rawPath = args.path;
    const rawContent = args.content;

    if (typeof rawPath !== "string" || rawPath.trim() === "") {
      throw new Error("write_file için geçerli bir path gerekli.");
    }

    if (typeof rawContent !== "string") {
      throw new Error("write_file için string content gerekli.");
    }

    const safePath = resolveSafePath(context.workspaceRoot, rawPath);
    const dir = path.dirname(safePath);

    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(safePath, rawContent, "utf-8");

    return `Dosya yazıldı: ${rawPath}`;
  }
};