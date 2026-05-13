import fs from "node:fs/promises";
import path from "node:path";
import { ToolDefinition } from "./base";
import { resolveSafePath } from "../utils/paths";

export const inspectPackageJsonTool: ToolDefinition = {
  name: "inspect_package_json",
  description: "package.json dosyasını okur ve bağımlılıkları özetler.",
  permissionTag: "read",
  inputSchema: {
    dir: "string (opsiyonel, varsayılan: .)"
  },

  async execute(args, context) {
    const targetDir = typeof args.dir === "string" ? args.dir : ".";
    const safeDirPath = resolveSafePath(context.workspaceRoot, targetDir);
    const filePath = path.join(safeDirPath, "package.json");

    let raw: string;
    try {
      raw = await fs.readFile(filePath, "utf-8");
    } catch {
      return "package.json bulunamadı veya okunamadı.";
    }

    let pkg: Record<string, unknown>;
    try {
      pkg = JSON.parse(raw);
    } catch {
      return "package.json geçerli bir JSON değil.";
    }

    const name = typeof pkg.name === "string" ? pkg.name : "?";
    const version = typeof pkg.version === "string" ? pkg.version : "?";
    const description = typeof pkg.description === "string" ? pkg.description : "-";

    const scripts = pkg.scripts && typeof pkg.scripts === "object"
      ? Object.keys(pkg.scripts as object).join(", ") || "-"
      : "-";

    const deps = pkg.dependencies && typeof pkg.dependencies === "object"
      ? Object.keys(pkg.dependencies as object)
      : [];

    const devDeps = pkg.devDependencies && typeof pkg.devDependencies === "object"
      ? Object.keys(pkg.devDependencies as object)
      : [];

    return [
      `Paket    : ${name} v${version}`,
      `Açıklama : ${description}`,
      `Scripts  : ${scripts}`,
      ``,
      `Dependencies (${deps.length}):`,
      deps.length > 0 ? deps.map((d) => `  - ${d}`).join("\n") : "  (yok)",
      ``,
      `DevDependencies (${devDeps.length}):`,
      devDeps.length > 0 ? devDeps.map((d) => `  - ${d}`).join("\n") : "  (yok)"
    ].join("\n");
  }
};
