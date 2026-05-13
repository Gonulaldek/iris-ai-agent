import fs from "node:fs";
import path from "node:path";
import { ToolDefinition } from "./base";
import { resolveSafePath } from "../utils/paths";

function walkAndSearch(dir: string, pattern: string, results: string[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // node_modules ve .git'i atla
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      walkAndSearch(fullPath, pattern, results);
    } else {
      try {
        const content = fs.readFileSync(fullPath, "utf-8");
        if (content.includes(pattern)) {
          results.push(fullPath);
        }
      } catch {
        // binary dosya veya okunamayan dosya, atla
      }
    }
  }
}

export const findTextTool: ToolDefinition = {
  name: "find_text",
  description: "Workspace içindeki dosyalarda belirtilen metni arar.",
  permissionTag: "read",
  inputSchema: {
    pattern: "string",
    dir: "string (opsiyonel)"
  },

  async execute(args, context) {
    const pattern = args.pattern;

    if (typeof pattern !== "string" || pattern.trim() === "") {
      throw new Error("find_text için aranacak metin (pattern) gerekli.");
    }

    const targetDir = typeof args.dir === "string" ? args.dir : ".";
    const safePath = resolveSafePath(context.workspaceRoot, targetDir);

    const results: string[] = [];
    walkAndSearch(safePath, pattern, results);

    if (results.length === 0) {
      return `"${pattern}" metni hiçbir dosyada bulunamadı.`;
    }

    const relativeResults = results.map((r) =>
      path.relative(context.workspaceRoot, r)
    );

    return [
      `"${pattern}" metni ${relativeResults.length} dosyada bulundu:`,
      ...relativeResults.map((r) => `  ${r}`)
    ].join("\n");
  }
};
