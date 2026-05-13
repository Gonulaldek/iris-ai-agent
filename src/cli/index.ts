/// <reference types="node" />

import * as readline from "node:readline";
import path from "node:path";
import { Agent } from "../core/agent";
import { ToolRegistry } from "../core/toolRegistry";
import { RuleRouter } from "../model/ruleRouter";
import { listDirTool } from "../tools/listDir";
import { readFileTool } from "../tools/readFile";
import { writeFileTool } from "../tools/writeFile";
import { runShellTool } from "../tools/runShell";
import { findTextTool } from "../tools/findText";
import { inspectPackageJsonTool } from "../tools/inspectPackageJson";
import { ProfileName, parseProfileName } from "../policy/profiles";

const workspaceRoot = process.cwd();
const initialProfile: ProfileName =
  process.env.AGENT_PROFILE === "guest" ? "guest" : "owner";

const registry = new ToolRegistry();
registry.register(listDirTool);
registry.register(readFileTool);
registry.register(writeFileTool);
registry.register(runShellTool);
registry.register(findTextTool);
registry.register(inspectPackageJsonTool);

const router = new RuleRouter();
const agent = new Agent(router, registry, { workspaceRoot }, initialProfile);

console.log("Mini Agent başlatıldı.");
console.log(`Çalışma alanı : ${path.resolve(workspaceRoot)}`);
console.log(`Aktif profil  : ${initialProfile}`);
console.log("Yardım için /help yaz.\n");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(): void {
  const profileLabel = agent.getProfileName();
  rl.question(`[${profileLabel}] > `, async (input: string) => {
    const trimmed = input.trim();
    const lowered = trimmed.toLowerCase();

    if (lowered === "exit" || lowered === "quit") {
      console.log("Çıkılıyor...");
      rl.close();
      return;
    }

    // Runtime profil değiştirme: /set-profile owner | /set-profile guest
    const setProfileMatch = trimmed.match(/^\/set-profile\s+(owner|guest)$/i);
    if (setProfileMatch) {
      const newProfile = parseProfileName(setProfileMatch[1].toLowerCase());
      if (newProfile) {
        agent.setProfile(newProfile);
        console.log(`Profil değiştirildi: ${newProfile}\n`);
      } else {
        console.log("Geçersiz profil. Kullanım: /set-profile owner | /set-profile guest\n");
      }
      prompt();
      return;
    }

    const output = await agent.handleInput(trimmed);
    console.log(output);
    console.log("");
    prompt();
  });
}

prompt();
