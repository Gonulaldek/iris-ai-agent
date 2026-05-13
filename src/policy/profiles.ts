export type ProfileName = "owner" | "guest";

export interface ResponseProfile {
  name: ProfileName;
  tone: "direct" | "neutral";
  verbosity: "short" | "normal";
  allowProfanityInReplies: boolean;
  systemStyle: string;         // LLM bağlandığında system prompt olarak kullanılacak
  maxOutputLines: number;      // verbosity'yi gerçeğe bağlayan sayısal sınır
}

const OWNER_PROFILE: ResponseProfile = {
  name: "owner",
  tone: "direct",
  verbosity: "normal",
  allowProfanityInReplies: true,
  maxOutputLines: 200,
  systemStyle: [
    "Kullanıcıyla doğrudan konuş.",
    "Gereksiz resmiyet kullanma.",
    "Teknik konuda teknik konuş.",
    "Emin olmadığın şeyi kesinmiş gibi söyleme.",
    "Kullanıcı owner profilindeyse daha esnek ve direkt ol."
  ].join(" ")
};

const GUEST_PROFILE: ResponseProfile = {
  name: "guest",
  tone: "neutral",
  verbosity: "short",
  allowProfanityInReplies: false,
  maxOutputLines: 30,
  systemStyle: [
    "Kullanıcıyla nötr ve kontrollü konuş.",
    "Gereksiz sertlik kullanma.",
    "Teknik konuda açık ama ölçülü ol.",
    "Belirsizlik varsa net şekilde belirt.",
    "Guest profilinde daha kontrollü davran."
  ].join(" ")
};

export function getResponseProfile(profileName: ProfileName): ResponseProfile {
  switch (profileName) {
    case "owner": return OWNER_PROFILE;
    case "guest": return GUEST_PROFILE;
    default:      return GUEST_PROFILE;
  }
}

// --- CEVABI GERÇEKTEN ŞEKİLLENDİREN FONKSİYON ---
// Bu fonksiyon agent.ts'de her tool/plan çıktısına uygulanır.

export function formatOutput(text: string, profile: ResponseProfile): string {
  const lines = text.split("\n");

  // verbosity: "short" → uzun çıktıları kırp
  if (profile.verbosity === "short" && lines.length > profile.maxOutputLines) {
    const kept = lines.slice(0, profile.maxOutputLines);
    const remaining = lines.length - profile.maxOutputLines;
    kept.push(`... (${remaining} satır daha var — owner profilinde tam görürsün)`);
    return kept.join("\n");
  }

  return text;
}

// Profil adını string'den güvenle parse eder
export function parseProfileName(raw: string): ProfileName | null {
  if (raw === "owner" || raw === "guest") return raw;
  return null;
}
