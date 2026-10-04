import type { Section } from "../types";
import { section1 } from "./section_1";
import { section2 } from "./section_2";
import { section3 } from "./section_3";
import { section4 } from "./section_4";
import { section5 } from "./section_5";
import { section6 } from "./section_6";

export { section1, section2, section3, section4, section5, section6 };

/** SM-103 ders haritası. Sıra 1 tabanlıdır. Canlı sınav yolu bu dosyada açılmaz. */
export const SM103_SECTION_MAP: readonly Section[] = [
  section1,
  section2,
  section3,
  section4,
  section5,
  section6,
];
