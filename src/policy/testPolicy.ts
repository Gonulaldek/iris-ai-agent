import { getResponseProfile } from "./profiles";
import { getActionPolicy, isShellCommandAllowed } from "./actionPolicy";
import { getRulesText } from "./agentRules";

const profile = getResponseProfile("owner");
const actions = getActionPolicy("owner");

console.log("Profil:");
console.log(profile);

console.log("\nAction Policy:");
console.log(actions);

console.log("\nKurallar:");
console.log(getRulesText());

console.log("\nShell test 1:");
console.log(isShellCommandAllowed("dir", actions));

console.log("\nShell test 2:");
console.log(isShellCommandAllowed("shutdown /s /t 0", actions));