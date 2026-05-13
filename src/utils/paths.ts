import path from "node:path";

export function resolveSafePath(workspaceRoot: string, targetPath: string): string {
  const resolved = path.resolve(workspaceRoot, targetPath);
  const normalizedRoot = path.resolve(workspaceRoot);

  if (
    resolved !== normalizedRoot &&
    !resolved.startsWith(normalizedRoot + path.sep)
  ) {
    throw new Error("Çalışma alanı dışına çıkılamaz.");
  }

  return resolved;
}