import { JUNIOR_ELECTIVE_INTRO_LABEL, JUNIOR_ELECTIVE_QUOTA } from "@/lib/junior/limits";

export type ElectiveShelfCard = {
  title: string;
  /** `juniorElectiveOpenable` sonucu. */
  packageOpen: boolean;
};

/** Vitrin cümlesi. Sabit «sesi yok» hükmü taşımaz; mühür sonucunu okur. */
export function formatJuniorElectiveShelfNote(courses: readonly ElectiveShelfCard[]): string {
  const open = courses.filter((course) => course.packageOpen);
  const held = courses.filter((course) => !course.packageOpen);
  const quota = `Hazır olan kartlardan en fazla ${JUNIOR_ELECTIVE_QUOTA} ders pakete yazılır.`;
  if (open.length === 0) {
    return `Mühür kapısını geçen seçmeli kart yok. Vitrine hazır ders olarak yazılmaz. İngilizce, 6. Sınıf İngilizce kartındadır. ${quota}`;
  }
  const heldNote =
    held.length > 0
      ? ` ${held.map((course) => course.title).join(", ")} paket fiyatına girmez.`
      : "";
  const intro = `Seçmeli kart «${JUNIOR_ELECTIVE_INTRO_LABEL}» ibaresini taşır. Yıllık seçmeli müfredat değildir. İngilizce, 6. Sınıf İngilizce kartındadır. Seçmeli rafta ikinci bir İngilizce kartı yoktur.`;
  return `${open.map((course) => course.title).join(", ")} mühürlüdür ve pakete yazılabilir.${heldNote} ${intro} ${quota}`;
}
