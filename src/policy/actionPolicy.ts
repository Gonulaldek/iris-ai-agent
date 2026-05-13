import { ProfileName } from "./profiles";
import { ToolPermissionTag } from "../tools/base";

export interface ActionPolicy {
  profile: ProfileName;
  allowRead: boolean;
  allowWrite: boolean;
  allowShell: boolean;
  allowDelete: boolean;
  workspaceOnly: boolean;
  shellDenylist: string[];
}

const COMMON_DENYLIST: string[] = [
  "format",
  "shutdown",
  "restart-computer",
  "stop-computer",
  "remove-item -recurse",
  "del /f /s",
  "rd /s /q",
  "diskpart",
  "reg delete",
  "net user",
  "sc delete"
];

const OWNER_POLICY: ActionPolicy = {
  profile: "owner",
  allowRead: true,
  allowWrite: true,
  allowShell: true,
  allowDelete: false,
  workspaceOnly: true,
  shellDenylist: COMMON_DENYLIST
};

const GUEST_POLICY: ActionPolicy = {
  profile: "guest",
  allowRead: true,
  allowWrite: false,
  allowShell: false,
  allowDelete: false,
  workspaceOnly: true,
  shellDenylist: COMMON_DENYLIST
};

export function getActionPolicy(profileName: ProfileName): ActionPolicy {
  switch (profileName) {
    case "owner":
      return OWNER_POLICY;
    case "guest":
      return GUEST_POLICY;
    default:
      return GUEST_POLICY;
  }
}

export function isToolAllowed(
  permissionTag: ToolPermissionTag,
  policy: ActionPolicy
): { allowed: boolean; reason?: string } {
  switch (permissionTag) {
    case "none":
      return { allowed: true };

    case "read":
      return policy.allowRead
        ? { allowed: true }
        : { allowed: false, reason: "Bu profilde okuma yetkisi kapalı." };

    case "write":
      return policy.allowWrite
        ? { allowed: true }
        : { allowed: false, reason: "Bu profilde yazma yetkisi kapalı." };

    case "shell":
      return policy.allowShell
        ? { allowed: true }
        : { allowed: false, reason: "Bu profilde shell yetkisi kapalı." };

    case "delete":
      return policy.allowDelete
        ? { allowed: true }
        : { allowed: false, reason: "Bu profilde silme yetkisi kapalı." };

    default:
      return { allowed: false, reason: "Bilinmeyen yetki etiketi." };
  }
}

export function isShellCommandAllowed(
  command: string,
  policy: ActionPolicy
): { allowed: boolean; reason?: string } {
  if (!policy.allowShell) {
    return {
      allowed: false,
      reason: "Bu profilde shell kullanımı kapalı."
    };
  }

  const normalized = command.trim().toLowerCase();

  for (const blocked of policy.shellDenylist) {
    if (normalized.includes(blocked.toLowerCase())) {
      return {
        allowed: false,
        reason: `Komut denylist tarafından engellendi: ${blocked}`
      };
    }
  }

  return { allowed: true };
}