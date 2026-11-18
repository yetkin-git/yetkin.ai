/** İstemci güvenli YetkinCV sözlüğü. Soru bankası ve SHA-256 burada yoktur. */

export const YETKINCV_ROLES = [
  { id: "corporate", label: "Kurumsal Çalışan" },
  { id: "specialist", label: "Uzman" },
  { id: "freelancer", label: "Freelancer" },
] as const;

export const YETKINCV_VERTICALS = [
  { id: "ecommerce", label: "E-Ticaret", practiceHref: "/e-ticaret" },
  { id: "grant", label: "Hibe & Proje Yönetimi", practiceHref: "/hibe" },
  { id: "marketing", label: "Dijital Pazarlama", practiceHref: "/tezgah?tool=reklam" },
  { id: "office", label: "Ofis & Operasyon", practiceHref: "/tezgah?tool=tetkik" },
  { id: "software", label: "Yazılım/AI", practiceHref: "/tezgah" },
] as const;

export type YetkinCvRoleId = (typeof YETKINCV_ROLES)[number]["id"];
export type YetkinCvVerticalId = (typeof YETKINCV_VERTICALS)[number]["id"];

export type YetkinCvPublicQuestion = {
  id: string;
  kind: "choice" | "case";
  skillLabel: string;
  prompt: string;
  choices: readonly string[];
};

export type YetkinCvCardView = {
  score: number;
  passed: boolean;
  roleLabel: string;
  verticalLabel: string;
  skills: readonly { id: string; label: string; score: number }[];
  certificateHash: string;
  verifyPath: string;
  issuedAt: string;
};
