/** İnce kaynak sicili — modül kendi kaynağını kayıt noktasıyla ekler. */
export const AI_TOKEN_SOURCES = {
  GATEWAY: "gateway",
  STUDIO: "studio",
  ACADEMY: "academy",
  CAREER: "career",
  FREELANCER: "freelancer",
  DEVLABS: "devlabs",
  KURUMSAL: "kurumsal",
  JUNIOR: "junior",
  SUPPORT: "support",
} as const;

export type AiTokenSource = (typeof AI_TOKEN_SOURCES)[keyof typeof AI_TOKEN_SOURCES];
