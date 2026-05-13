import { ToolRegistry } from "./toolRegistry";
import { AgentContext } from "./types";
import { RouterModel } from "../model/base";
import { ProfileName, getResponseProfile, formatOutput } from "../policy/profiles";
import { getActionPolicy, isToolAllowed, isShellCommandAllowed } from "../policy/actionPolicy";
import { getRulesText, enforceRules } from "../policy/agentRules";

export class Agent {
  constructor(
    private readonly router: RouterModel,
    private readonly registry: ToolRegistry,
    private readonly context: AgentContext,
    private profileName: ProfileName          // readonly kaldırıldı → set-profile destekler
  ) {}

  // Runtime'da profil değiştirme
  setProfile(name: ProfileName): void {
    this.profileName = name;
  }

  getProfileName(): ProfileName {
    return this.profileName;
  }

  // Tool çalıştırma: kural motoru + policy + execution
  private async executeTool(
    toolName: string,
    args: Record<string, unknown>
  ): Promise<string> {

    // 1. Kural motoru kontrolü (agentRules)
    const ruleCheck = enforceRules(toolName, args);
    if (!ruleCheck.allowed) {
      return `⛔ Engellendi [${ruleCheck.blockedBy}]: ${ruleCheck.reason}`;
    }

    // 2. Tool var mı?
    const tool = this.registry.get(toolName);
    if (!tool) {
      return `Tool hatası: Bilinmeyen tool: ${toolName}`;
    }

    // 3. Policy kontrolü (profil bazlı yetki)
    const actionPolicy = getActionPolicy(this.profileName);
    const permissionCheck = isToolAllowed(tool.permissionTag, actionPolicy);
    if (!permissionCheck.allowed) {
      return `Tool engellendi: ${permissionCheck.reason}`;
    }

    // 4. Shell ek denylist kontrolü
    if (tool.permissionTag === "shell") {
      const command = args.command;
      if (typeof command !== "string") {
        return "Tool hatası: shell komutu geçersiz.";
      }
      const shellCheck = isShellCommandAllowed(command, actionPolicy);
      if (!shellCheck.allowed) {
        return `Shell engellendi: ${shellCheck.reason}`;
      }
    }

    // 5. Çalıştır
    try {
      return await this.registry.execute(toolName, args, this.context);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Bilinmeyen tool hatası";
      return `Tool hatası: ${message}`;
    }
  }

  async handleInput(userInput: string): Promise<string> {
    const decision = await this.router.decide(userInput, this.registry);
    const profile = getResponseProfile(this.profileName);
    let output: string;

    // MESAJ
    if (decision.type === "message") {
      if (decision.content === "TOOL_LIST_REQUEST") {
        const tools = this.registry.list();
        if (tools.length === 0) return "Hiç tool kayıtlı değil.";
        return tools
          .map((t) => `- ${t.name} [${t.permissionTag}]: ${t.description}`)
          .join("\n");
      }

      if (decision.content === "PROFILE_INFO_REQUEST") {
        const policy = getActionPolicy(this.profileName);
        return [
          `Aktif profil  : ${profile.name}`,
          `Ton           : ${profile.tone}`,
          `Çıktı limiti  : ${profile.maxOutputLines} satır`,
          `Küfür tolerans: ${profile.allowProfanityInReplies ? "açık" : "kapalı"}`,
          "",
          "Yetkiler:",
          `  Read   : ${policy.allowRead}`,
          `  Write  : ${policy.allowWrite}`,
          `  Shell  : ${policy.allowShell}`,
          `  Delete : ${policy.allowDelete}`,
        ].join("\n");
      }

      if (decision.content === "RULES_REQUEST") {
        return getRulesText();
      }

      return decision.content;
    }

    // TEK TOOL
    if (decision.type === "tool_call") {
      const result = await this.executeTool(decision.toolName, decision.args);
      output = `[${decision.toolName}]\n${result}`;
      return formatOutput(output, profile);   // ← profile artık cevabı şekillendiriyor
    }

    // ÇOK ADIMLI PLAN
    if (decision.type === "plan") {
      const lines: string[] = [`Plan: ${decision.steps.length} adım`, ""];
      for (const [i, step] of decision.steps.entries()) {
        lines.push(`▶ Adım ${i + 1}: ${step.toolName}`);
        const result = await this.executeTool(step.toolName, step.args);
        lines.push(result, "");
      }
      output = lines.join("\n");
      return formatOutput(output, profile);   // ← plan çıktısı da kırpılıyor
    }

    return "Bilinmeyen karar tipi.";
  }
}
