import type { JuniorHintKind } from "@/lib/junior/content-rules";

/** Ders notu sekmesinin fasikül kopyası. Kaset transkripti bu nesneye girmez. */
export type JuniorBookletCopy = {
  concept: string;
  example: string;
  warning: string;
  recap: readonly string[];
  hint: JuniorHintKind;
  /**
   * Hero kart «Dersin Ana Sorusu». Sahne/cue anlatımından türetilmez.
   * Boşsa kart ders başlığına düşer.
   */
  heroQuestion: string;
  /** Hero kart alt bant / odak cümlesi. Sahne örneğinden türetilmez. */
  heroFocus: string;
};
