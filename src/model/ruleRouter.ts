import { RouterDecision } from "../core/types";
import { ToolRegistry } from "../core/toolRegistry";
import { RouterModel } from "./base";

function cleanQuoted(text: string): string {
  return text.trim().replace(/^[\"']|[\"']$/g, "");
}

export class RuleRouter implements RouterModel {
  async decide(userInput: string, _registry: ToolRegistry): Promise<RouterDecision> {
    const trimmed = userInput.trim();
    const lowered = trimmed.toLowerCase();

    if (trimmed === "") {
      return { type: "message", content: "Boş komut aldım." };
    }

    // --- KOMUTLAR ---
    if (lowered === "/help") {
      return {
        type: "message",
        content: [
          "Komutlar:",
          "/help",
          "/tools",
          "/profile",
          "/rules",
          "",
          "Örnekler:",
          "list .",
          "burayı listele",
          "package.json dosyasını oku",
          "read package.json",
          "write notes.txt => merhaba dunya",
          "notes.txt dosyasına şunu yaz: test",
          "run dir",
          "komutu çalıştır: dir",
          "ara: resolveSafePath",
          "bağımlılıkları göster",
          "projeyi incele"
        ].join("\n")
      };
    }

    if (lowered === "/tools") {
      return { type: "message", content: "TOOL_LIST_REQUEST" };
    }

    if (lowered === "/profile") {
      return { type: "message", content: "PROFILE_INFO_REQUEST" };
    }

    if (lowered === "/rules") {
      return { type: "message", content: "RULES_REQUEST" };
    }

    // --- LIST ---
    if (/^list(\s+.+)?$/i.test(trimmed)) {
      const match = trimmed.match(/^list(?:\s+(.+))?$/i);
      return {
        type: "tool_call",
        toolName: "list_dir",
        args: { path: match?.[1]?.trim() || "." }
      };
    }

    if (
      lowered === "burayı listele" ||
      lowered === "dosyaları göster" ||
      lowered === "klasörleri göster" ||
      lowered === "buradaki dosyaları göster"
    ) {
      return {
        type: "tool_call",
        toolName: "list_dir",
        args: { path: "." }
      };
    }

    // --- READ ---
    if (/^read\s+.+$/i.test(trimmed)) {
      const match = trimmed.match(/^read\s+(.+)$/i);
      const targetPath = match?.[1]?.trim();

      if (!targetPath) {
        return { type: "message", content: "Okumak için bir dosya yolu vermelisin." };
      }

      return {
        type: "tool_call",
        toolName: "read_file",
        args: { path: cleanQuoted(targetPath) }
      };
    }

    if (/^(.+)\s+dosyasını\s+oku$/i.test(trimmed)) {
      const match = trimmed.match(/^(.+)\s+dosyasını\s+oku$/i);
      const targetPath = match?.[1]?.trim();

      if (targetPath) {
        return {
          type: "tool_call",
          toolName: "read_file",
          args: { path: cleanQuoted(targetPath) }
        };
      }
    }

    if (/^(.+)\s+dosyasını\s+aç$/i.test(trimmed)) {
      const match = trimmed.match(/^(.+)\s+dosyasını\s+aç$/i);
      const targetPath = match?.[1]?.trim();

      if (targetPath) {
        return {
          type: "tool_call",
          toolName: "read_file",
          args: { path: cleanQuoted(targetPath) }
        };
      }
    }

    // --- WRITE ---
    if (/^write\s+(.+?)\s*=>\s*([\s\S]+)$/i.test(trimmed)) {
      const match = trimmed.match(/^write\s+(.+?)\s*=>\s*([\s\S]+)$/i);
      const targetPath = match?.[1]?.trim();
      const content = match?.[2];

      if (targetPath && typeof content === "string") {
        return {
          type: "tool_call",
          toolName: "write_file",
          args: {
            path: cleanQuoted(targetPath),
            content
          }
        };
      }
    }

      if (/^(.+)\s+dosyasına\s+şunu\s+yaz\s*:\s*([\s\S]+)$/i.test(trimmed)) {
      const match = trimmed.match(/^(.+)\s+dosyasına\s+şunu\s+yaz\s*:\s*([\s\S]+)$/i);
      const targetPath = match?.[1]?.trim();
      const content = match?.[2];

      if (targetPath && typeof content === "string") {
        return {
          type: "tool_call",
          toolName: "write_file",
          args: {
            path: cleanQuoted(targetPath),
            content
          }
        };
      }
    }

    // --- SHELL ---
    if (/^run\s+.+$/i.test(trimmed)) {
      const match = trimmed.match(/^run\s+(.+)$/i);
      const command = match?.[1]?.trim();

      if (command) {
        return {
          type: "tool_call",
          toolName: "run_shell",
          args: { command }
        };
      }
    }

    if (/^komutu\s+çalıştır:\s*(.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^komutu\s+çalıştır:\s*(.+)$/i);
      const command = match?.[1]?.trim();

      if (command) {
        return {
          type: "tool_call",
          toolName: "run_shell",
          args: { command }
        };
      }
    }

    // --- FIND TEXT ---
    if (/^ara:\s*(.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^ara:\s*(.+)$/i);
      const pattern = match?.[1]?.trim();



      if (pattern) {
        return {
          type: "tool_call",
          toolName: "find_text",
          args: { pattern }
        };
      }
    }

    if (/^(metin\s+)?ara[:\s]+(.+)$/i.test(trimmed)) {
      const match = trimmed.match(/^(?:metin\s+)?ara[:\s]+(.+)$/i);
      const pattern = match?.[1]?.trim();

      if (pattern) {
        return {
          type: "tool_call",
          toolName: "find_text",
          args: { pattern }
        };
      }
    }

    if (/^(.+)\s+(metnini|kelimesini)\s+ara$/i.test(trimmed)) {
      const match = trimmed.match(/^(.+)\s+(?:metnini|kelimesini)\s+ara$/i);
      const pattern = match?.[1]?.trim();

      if (pattern) {
        return {
          type: "tool_call",
          toolName: "find_text",
          args: { pattern }
        };
      }
    }

    // --- INSPECT PACKAGE.JSON ---
    if (
      lowered === "bağımlılıkları göster" ||
      lowered === "dependencies" ||
      lowered === "package.json" ||
      lowered === "package.json'ı incele" ||
      lowered === "paketleri göster"
    ) {
      return {
        type: "tool_call",
        toolName: "inspect_package_json",
        args: {}
      };
    }

    if (/package\.json/i.test(lowered) && /incele|göster|oku|bağımlılık/i.test(lowered)) {
      return {
        type: "tool_call",
        toolName: "inspect_package_json",
        args: {}
      };
    }

    // --- PLAN: projeyi incele ---
    if (
      lowered === "projeyi incele" ||
      lowered === "projeye bak" ||
      lowered === "proje analizi" ||
      lowered === "proje özeti"
    ) {
      return {
        type: "plan",
        steps: [
          { toolName: "list_dir", args: { path: "." } },
          { toolName: "inspect_package_json", args: {} }
        ]
      };
    }

      // Kısa dosya okuma: "notes.txt oku", "notes.txt aç"
      if (/^(.+\.\w+)\s+(oku|aç)$/i.test(trimmed)) {
          const match = trimmed.match(/^(.+\.\w+)\s+(oku|aç)$/i);
          const targetPath = match?.[1]?.trim();
          if (targetPath) {
              return { type: "tool_call", toolName: "read_file", args: { path: cleanQuoted(targetPath) } };
          }
      }

      // Tek kelime shell komutları: "dir", "ls", "pwd"
      const QUICK_SHELL: Record<string, string> = {
          "dir": "dir", "ls": "ls", "pwd": "pwd", "cls": "cls", "clear": "clear"
      };
      if (QUICK_SHELL[lowered]) {
          return { type: "tool_call", toolName: "run_shell", args: { command: QUICK_SHELL[lowered] } };
      }

     

      

    return {
      type: "message",
      content: [
        "Henüz bunu tam anlayamadım. Şunları deneyebilirsin:",
        "  burayı listele",
        "  package.json dosyasını oku",
        "  write notes.txt => merhaba",
        "  run dir",
        "  ara: resolveSafePath",
        "  bağımlılıkları göster",
        "  projeyi incele"
      ].join("\n")
    };
  }
}
