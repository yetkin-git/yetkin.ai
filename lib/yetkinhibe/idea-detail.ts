/**
 * İş fikri / proje metni için canlı detay eşiği.
 * Boşluklar hariç en az 20 karakter ve en az 3 kelime → hazır.
 */

export type IdeaDetailState = "idle" | "short" | "ready";

export function assessIdeaDetail(raw: string): IdeaDetailState {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "idle";
  }
  const chars = trimmed.replace(/\s+/g, "").length;
  const words = trimmed.split(/\s+/).filter(Boolean).length;
  if (chars >= 20 && words >= 3) {
    return "ready";
  }
  return "short";
}
