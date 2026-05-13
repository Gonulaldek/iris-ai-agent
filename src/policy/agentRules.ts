// KURAL MOTORU
// Her kural artık hem metin olarak hem de çalışan kod olarak var.

export const AGENT_RULES: string[] = [
  "Agent'ın birincil görevi kullanıcı isteğini anlamak ve uygun tool ile yerine getirmektir.",
  "Agent sadece kayıtlı tool'ları kullanır.",
  "Agent çalışma alanı dışına çıkmaz.",
  "Agent tool sonucu olmadan dosya içeriği görmüş gibi davranmaz.",
  "Agent başarısız işlemlerde uydurma sonuç üretmez.",
  "Agent konuşma tarzı ile eylem yetkisini birbirine karıştırmaz.",
  "Agent riskli işlemlerde daha güvenli yolu tercih eder.",
  "Agent kullanıcı açıkça istemeden silme işlemi yapmaz.",
  "Agent shell komutlarını policy kontrolünden geçirir.",
  "Agent belirsiz isteklerde doğrudan riskli işlem yapmaz."
];

export function getRulesText(): string {
  return AGENT_RULES.map((rule, index) => `${index + 1}. ${rule}`).join("\n");
}

// --- ÇALIŞAN KURAL MOTORU ---

export interface RuleCheckResult {
  allowed: boolean;
  blockedBy?: string;
  reason?: string;
}

// Tehlikeli shell pattern'leri — denylist'ten bağımsız ikinci katman
const DANGEROUS_SHELL_PATTERNS: Array<{ pattern: RegExp; label: string }> = [
  { pattern: /rm\s+-rf?\s*[\/\\*]/i,       label: "rm -rf" },
  { pattern: /rmdir\s+\/s/i,               label: "rmdir /s" },
  { pattern: /del\s+\/[fsq]/i,             label: "del /f veya /s" },
  { pattern: /:\s*\(\s*\)\s*\{.*\}\s*;/,  label: "fork bomb" },
  { pattern: />\s*\/dev\/(s?da|nvme)/i,   label: "disk write" },
  { pattern: /mkfs\./i,                    label: "mkfs" },
  { pattern: /dd\s+if=/i,                  label: "dd komutu" },
  { pattern: /curl\s+.*\|\s*(ba)?sh/i,    label: "pipe-to-shell" },
  { pattern: /wget\s+.*\|\s*(ba)?sh/i,    label: "pipe-to-shell" },
  { pattern: /chmod\s+777/i,              label: "chmod 777" },
  { pattern: /sudo\s/i,                   label: "sudo" },
];

export function enforceRules(
  toolName: string,
  args: Record<string, unknown>
): RuleCheckResult {

  // Kural 2: Sadece kayıtlı tool'lar — bu toolRegistry tarafında zaten kontrol ediliyor
  // Burada ek olarak boş toolName kontrolü
  if (!toolName || toolName.trim() === "") {
    return {
      allowed: false,
      blockedBy: "Kural 2",
      reason: "Tool adı boş olamaz."
    };
  }

  // Kural 8 + 10: write_file için path zorunlu, içerik zorunlu
  if (toolName === "write_file") {
    const path = args.path;
    const content = args.content;

    if (typeof path !== "string" || path.trim() === "") {
      return {
        allowed: false,
        blockedBy: "Kural 10",
        reason: "write_file: Belirsiz istek — geçerli bir dosya yolu verilmedi."
      };
    }

    if (typeof content !== "string") {
      return {
        allowed: false,
        blockedBy: "Kural 10",
        reason: "write_file: İçerik string değil, işlem durduruldu."
      };
    }

    // Kural 8: Açıkça silme değil ama kritik sistem dosyalarına yazmayı engelle
    const PROTECTED_PATHS = [
      /^[\/\\]?(etc|windows|system32|boot)[\/\\]/i,
      /^\.[\/\\]?\.\.[\/\\]/,  // path traversal
    ];
    for (const p of PROTECTED_PATHS) {
      if (p.test(path)) {
        return {
          allowed: false,
          blockedBy: "Kural 7",
          reason: `write_file: Korumalı yola yazma engellendi: ${path}`
        };
      }
    }
  }

  // Kural 9 + 7: run_shell için tehlikeli pattern kontrolü
  if (toolName === "run_shell") {
    const command = args.command;

    if (typeof command !== "string" || command.trim() === "") {
      return {
        allowed: false,
        blockedBy: "Kural 10",
        reason: "run_shell: Boş komut çalıştırılamaz."
      };
    }

    for (const { pattern, label } of DANGEROUS_SHELL_PATTERNS) {
      if (pattern.test(command)) {
        return {
          allowed: false,
          blockedBy: "Kural 7",
          reason: `run_shell: Tehlikeli pattern engellendi (${label}): ${command}`
        };
      }
    }
  }

  // Kural 10: read_file / find_text için path zorunlu
  if (toolName === "read_file" || toolName === "find_text") {
    const key = toolName === "read_file" ? "path" : "pattern";
    const val = args[key];

    if (typeof val !== "string" || val.trim() === "") {
      return {
        allowed: false,
        blockedBy: "Kural 10",
        reason: `${toolName}: Belirsiz istek — "${key}" parametresi eksik.`
      };
    }
  }

  return { allowed: true };
}
