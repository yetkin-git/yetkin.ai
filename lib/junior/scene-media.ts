/**
 * Junior ders içi 16:9 plaka ve sözsüz video yolu.
 * Kaynak: docs/IC_MEDYA_ABC_ANALIZI.md (Faz 31).
 * Plaka, kapak değildir. Model kimliği kapakla aynıdır (`JUNIOR_COVER_GEN`);
 * çıkış `public/media/junior/scenes/{ders}/step-{adım}.jpg` olur.
 * Video Gemini arayüzünde elle üretilir. Bu dosya API'ye video göndermez.
 * B grubu öğretim adımı belgede yazılmaz. Adım 5, «ekrandaki çizime bakalım» köprüsüdür
 * (matematik A plakalarıyla aynı 1 tabanlı adım). Özet adımları 10–12 kart kalır.
 */

import { isJuniorCoverKey } from "@/lib/junior/covers";
import { resolvePublicMediaUrl } from "@/lib/media/public-url";

export const JUNIOR_SCENE_PUBLIC_DIR = "/media/junior/scenes" as const;

export const JUNIOR_SCENE_PROMPT_SUFFIX =
  "16:9, soft classroom illustration, cream background, sky-blue accent, no horror, no surgery, no blood splatter, no open wound, no textbook page, no logo, no watermark, no paragraph, no title banner. Never paint the digits 10-12, the word age, or any English production note onto the picture. Turkish labels exactly as written.";

export type JuniorSceneGroup = "A" | "B";

export type JuniorScenePlate = {
  group: JuniorSceneGroup;
  lessonKey: string;
  /** Oynatıcı adımı, 1 tabanlı. Beat = adım − 1. */
  step: number;
  title: string;
  prompt: string;
};

export type JuniorSceneVideo = {
  name: string;
  lessonKey: string;
  step: number;
};

const A_PLATES: readonly JuniorScenePlate[] = [
  {
    group: "A",
    lessonKey: "jr_06_fen-1",
    step: 6,
    title: "Güneş sistemindeki gezegenler",
    prompt:
      'One left-to-right row. The Sun is a star at the far left, not between the planets. Eight planets move away from the Sun in this exact order: Mercury closest, then Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune at the far right. Inner four small and rocky, outer four large gas giants. Jupiter largest. Saturn has bright rings and a soft highlight ring around it. A small Moon orbits Earth and sits outside the planet row, with the label "Ay uydu". Labels: "Güneş", "Merkür", "Venüs", "Dünya", "Mars", "Jüpiter", "Satürn", "Uranüs", "Neptün". Do not place the Sun between Mars and Jupiter.',
  },
  {
    group: "A",
    lessonKey: "jr_06_fen-2",
    step: 3,
    title: "Güneş ve Ay tutulması",
    prompt:
      'Split frame. Left, daytime solar eclipse: Sun, Moon in the middle, Earth, label "Gündüz" and "Arada Ay". Right, night lunar eclipse: Sun, Earth in the middle, Moon in shadow, label "Gece" and "Arada Dünya". Do not show a child looking at the Sun.',
  },
  {
    group: "A",
    lessonKey: "jr_06_fen-3",
    step: 2,
    title: "Destek ve hareket sistemi",
    prompt:
      'Friendly side view of a child bending an elbow. No title above the child. Upper-arm muscle shortens and pulls the forearm bone up. Labels only: "Kas kasılır", "Kemik", "Oynar eklem", "Kıkırdak". Bones support, they do not move alone.',
  },
  {
    group: "A",
    lessonKey: "jr_06_fen-4",
    step: 3,
    title: "Sindirim sistemi",
    prompt:
      'Clean digestive path from mouth to large intestine: mouth, esophagus, stomach, small intestine, large intestine. A bite of apple becomes small building blocks. Labels: "Ağız", "Yemek borusu", "Mide", "İnce bağırsak", "Kalın bağırsak". No gore.',
  },
  {
    group: "A",
    lessonKey: "jr_06_fen-5",
    step: 5,
    title: "Dolaşım sistemi",
    prompt:
      'Simple four-chamber heart and two loops. Red oxygen-rich blood to the body, blue oxygen-poor blood to the lungs. Callout: pulmonary artery carries oxygen-poor blood, label "Akciğer atardamarı oksijence fakir". Three cells: "Alyuvar", "Akyuvar", "Pulcuk".',
  },
  {
    group: "A",
    lessonKey: "jr_06_fen-7",
    step: 4,
    title: "Solunum sistemi",
    prompt:
      'Inhale: diaphragm contracts and flattens, lungs expand. Zoom to one alveolus where oxygen enters a red blood cell. Labels: "Diyafram kasılır", "Alveol", "Oksijen", "Alyuvar".',
  },
  {
    group: "A",
    lessonKey: "jr_06_fen-8",
    step: 5,
    title: "Boşaltım sistemi",
    prompt:
      'Two bean-shaped kidneys filter blood. Useful water returns to blood. Urine path: ureter, bladder, urethra. Small side icons: skin sweat, lungs, large intestine as helpers, not the main filter. Labels: "Böbrek süzer", "Üreter", "İdrar kesesi", "Üretra".',
  },
  {
    group: "A",
    lessonKey: "jr_06_fen-9",
    step: 6,
    title: "Bileşke kuvvet",
    prompt:
      'One box, two rows, no English headings. Top row: both arrows point right, labels "5 N sağa" and "3 N sağa", result arrow points right "8 N sağa". Bottom row: the "7 N sağa" arrow points right and the "4 N sola" arrow points left, result arrow points right "3 N sağa". The word sağa always means right. The word sola always means left.',
  },
  {
    group: "A",
    lessonKey: "jr_06_fen-10",
    step: 5,
    title: "Sabit süratli hareket",
    prompt:
      'A bicycle on a straight path. Equation "120 m ÷ 40 s = 3 m/s". Left graph distance-time is a rising straight line. Right graph speed-time is a horizontal line at 3.',
  },
  {
    group: "A",
    lessonKey: "jr_06_fen-11",
    step: 4,
    title: "Maddenin tanecikli yapısı",
    prompt:
      'Three boxes. Solid: particles tight and vibrating, "Katı". Liquid: particles sliding, "Sıvı". Gas: particles far apart, "Gaz". Same kind of particle, different spacing.',
  },
  {
    group: "A",
    lessonKey: "jr_06_fen-13",
    step: 5,
    title: "Madde ve ısı",
    prompt:
      'One bowl of soup, metal spoon and wooden spoon side by side. Both spoons labeled "aynı sıcaklık". Metal handle marked "iletir", wooden handle marked "yalıtır". A thermometer reads one shared degree.',
  },
  {
    group: "A",
    lessonKey: "jr_06_fen-14",
    step: 3,
    title: "Sesin yayılması",
    prompt:
      'Four panels. Desk solid "en hızlı", water "orta", air "yavaş", and outer space with a silent impact and the label "Boşlukta ses yok".',
  },
  {
    group: "A",
    lessonKey: "jr_06_fen-16",
    step: 6,
    title: "Denetleyici ve düzenleyici sistemler",
    prompt:
      'Left: hand touches a warm kettle, signal goes to spinal cord and back to the arm, label "Refleks, omurilik, hızlı". Right: a hormone droplet travels in blood, label "Hormon, yavaş". No burn injury shown.',
  },
];

const B_PLATES: readonly JuniorScenePlate[] = [
  {
    group: "B",
    lessonKey: "jr_06_fen-6",
    step: 5,
    title: "Kan grupları ve kan bağışı",
    prompt:
      'Four sealed classroom bottles in a row, labels "A", "B", "AB", "0". Small plus and minus tags "Rh +" and "Rh −". A calm chart card says "0 − genel verici" and "AB + genel alıcı". No needle, no blood bag, no hospital scare.',
  },
  {
    group: "B",
    lessonKey: "jr_06_fen-12",
    step: 5,
    title: "Yoğunluk",
    prompt:
      'A stone labeled "24 g ÷ 8 cm³ = 3 g/cm³" sinks in water. A wood block labeled "20 g ÷ 40 cm³ = 0,5 g/cm³" floats. Water is marked "1 g/cm³". Caption: "Ağır olmak batmak değildir".',
  },
  {
    group: "B",
    lessonKey: "jr_06_fen-15",
    step: 5,
    title: "Sesin maddeyle etkileşimi",
    prompt:
      'Split surfaces. Left, a hard smooth wall bounces a sound ripple back, label "Yankı, yansır". Right, a soft curtain and carpet swallow the ripple, label "Soğurulur". No second singer. No speaker logo.',
  },
  {
    group: "B",
    lessonKey: "jr_06_fen-17",
    step: 5,
    title: "Duyu organları",
    prompt:
      'A friendly eye and ear diagram. Lit side shows a red apple with labels "Göz", "Kulak". A dark panel beside it reads "Işık yok, renk yok". No injury, no medical close-up of an eyeball.',
  },
  {
    group: "B",
    lessonKey: "jr_06_fen-19",
    step: 5,
    title: "İletken ve yalıtkan maddeler",
    prompt:
      'Two simple circuits with a battery and a bulb. Left, an iron nail closes the loop and the bulb glows, label "Demir iletir". Right, a plastic eraser opens the loop and the bulb is dark, label "Plastik yalıtır". No spark, no shock.',
  },
  {
    group: "B",
    lessonKey: "jr_06_fen-20",
    step: 5,
    title: "Elektriksel direnç",
    prompt:
      'Two wires of equal length side by side. Thin wire, dim bulb, label "İnce tel, direnç büyük". Thick wire, bright bulb, label "Kalın tel, direnç küçük". No lightning, no burn.',
  },
  {
    group: "B",
    lessonKey: "jr_06_mat-8",
    step: 5,
    title: "Paydayı eşitleyerek toplama",
    prompt:
      'Half a bar becomes two quarters, then joins one quarter. Equation "1/2 + 1/4 = 2/4 + 1/4 = 3/4". Crossed-out trap "2/6". Label: "Önce denk kesir".',
  },
  {
    group: "B",
    lessonKey: "jr_06_mat-9",
    step: 5,
    title: "Kesirlerde çarpma ve bölme",
    prompt:
      'A square folded into four, one cell shaded, label "1/2 × 1/2 = 1/4". Beside it, half a bar holds two quarters, equation "1/2 ÷ 1/4 = 2". Label: "Bölmede ikinci kesir ters döner".',
  },
  {
    group: "B",
    lessonKey: "jr_06_mat-11",
    step: 5,
    title: "Cebirsel ifadeler",
    prompt:
      'A balance scale. Left pan: three pencils labeled "3x" plus two pencils "2x" and a coin "4". Right note "5x + 4". Crossed-out trap "7x". Label: "Benzer terim toplanır".',
  },
  {
    group: "B",
    lessonKey: "jr_06_mat-23",
    step: 5,
    title: "Veri toplama ve değerlendirme",
    prompt:
      'A frequency table. Elma 5, Muz 4, Üzüm 3. Column chart with those heights. Total tag "5 + 4 + 3 = 12". Tallest bar labeled "Elma".',
  },
  {
    group: "B",
    lessonKey: "jr_06_mat-18",
    step: 5,
    title: "Alan ölçü birimleri ve arazi",
    prompt:
      'A 1 m by 1 m square next to a grid note "1 m² = 10.000 cm²". Two land cards: "1 dönüm = 1.000 m²" and "1 hektar = 10.000 m²". Crossed-out trap "1 m² = 100 cm²".',
  },
  {
    group: "B",
    lessonKey: "jr_06_sosyal-9",
    step: 5,
    title: "Mutlak ve göreceli konum",
    prompt:
      'Split card. Left, a globe grid with "36°–42° kuzey" and label "Mutlak konum". Right, a school two streets ahead of a library, label "Göreceli konum". No real street names, no flag logo.',
  },
  {
    group: "B",
    lessonKey: "jr_06_sosyal-10",
    step: 5,
    title: "Türkiye’nin konumu ve iklim",
    prompt:
      'A simple map of Türkiye between Asia and Europe, three seas labeled "Karadeniz", "Ege", "Akdeniz". Three climate chips: "Karadeniz yağışlı", "Akdeniz yaz kurak", "Karasal iç kesim". No political emblem.',
  },
  {
    group: "B",
    lessonKey: "jr_06_sosyal-11",
    step: 5,
    title: "Yeryüzü şekilleri ve bitki örtüsü",
    prompt:
      'A cross-section from coast to inland. Coast "maki", mountains "Toroslar", inland "bozkır". A small note "Yükselti artınca serinler". No country flag.',
  },
  {
    group: "B",
    lessonKey: "jr_06_sosyal-12",
    step: 5,
    title: "Kaynaklar ve ekonomik faaliyet",
    prompt:
      'Four small workplace icons on a map strip: tea and hazelnut "Karadeniz", olive "Ege", wheat "İç Anadolu", citrus "Akdeniz". Caption: "İş, yerin kaynağına bağlıdır". No brand marks.',
  },
  {
    group: "B",
    lessonKey: "jr_06_sosyal-18",
    step: 5,
    title: "Devletin organları",
    prompt:
      'Three separate desks. "TBMM, yasama, kanun yazar". "Cumhurbaşkanı, yürütme, uygular". "Mahkeme, yargı, bağımsız". They do not share one chair. No party symbol, no portrait.',
  },
  {
    group: "B",
    lessonKey: "jr_06_sosyal-19",
    step: 5,
    title: "Komşularımız",
    prompt:
      'A simple outline of Türkiye with eight land-neighbor name cards around the border: "Yunanistan", "Bulgaristan", "Gürcistan", "Ermenistan", "Nahçıvan", "İran", "Irak", "Suriye". The inland lake is labeled only "Van Gölü", never in English. Caption: "Kara komşusu sınırdan değen devlettir". Seas are water, not neighbors. No flags, no conflict.',
  },
];

export const JUNIOR_SCENE_PLATES: readonly JuniorScenePlate[] = [...A_PLATES, ...B_PLATES];

/**
 * Video kuyruğu. fen-2 yalnız adım 3 kasetini taşır.
 * `jr_06_fen-2/step-6` dosyası diskte yok; kırık JPG/MP4 adresi üretilmez.
 * Aynı nedenle `jr_06_mat-19/step-5`, `jr_06_mat-7/step-5` ve `jr_06_mat-4/step-5` plakaları da listede durmaz.
 * Eksik adım vektör sahneye düşer.
 */
export const JUNIOR_SCENE_VIDEOS: readonly JuniorSceneVideo[] = [
  { name: "jr_06_fen-1_sahne6_saturn_halka", lessonKey: "jr_06_fen-1", step: 6 },
  { name: "jr_06_fen-2_sahne3_gunes_tutulmasi", lessonKey: "jr_06_fen-2", step: 3 },
  { name: "jr_06_fen-3_sahne2_kas_kemik", lessonKey: "jr_06_fen-3", step: 2 },
  { name: "jr_06_fen-4_sahne3_sindirim_yolu", lessonKey: "jr_06_fen-4", step: 3 },
  { name: "jr_06_fen-5_sahne5_iki_dolasim", lessonKey: "jr_06_fen-5", step: 5 },
  { name: "jr_06_fen-7_sahne4_alveol_alyuvar", lessonKey: "jr_06_fen-7", step: 4 },
  { name: "jr_06_fen-8_sahne5_bobrek_suzgec", lessonKey: "jr_06_fen-8", step: 5 },
  { name: "jr_06_fen-11_sahne4_kati_sivi_gaz", lessonKey: "jr_06_fen-11", step: 4 },
  { name: "jr_06_fen-14_sahne3_boslukta_ses_yok", lessonKey: "jr_06_fen-14", step: 3 },
  { name: "jr_06_fen-16_sahne6_refleks_hormon", lessonKey: "jr_06_fen-16", step: 6 },
  { name: "jr_06_fen-9_sahne6_bileske_ok", lessonKey: "jr_06_fen-9", step: 6 },
  { name: "jr_06_fen-10_sahne5_sabit_surat", lessonKey: "jr_06_fen-10", step: 5 },
];

function assertSceneCatalog(): void {
  const plates = JUNIOR_SCENE_PLATES;
  const videos = JUNIOR_SCENE_VIDEOS;
  if (plates.filter((plate) => plate.group === "A").length !== 13) {
    throw new Error("Junior sahne: A plaka 13 olmalı.");
  }
  if (plates.filter((plate) => plate.group === "B").length !== 17) {
    throw new Error("Junior sahne: B plaka 17 olmalı.");
  }
  if (plates.length !== 30) {
    throw new Error("Junior sahne: plaka 30 olmalı.");
  }
  if (videos.length !== 12) {
    throw new Error("Junior sahne: video kaseti 12 olmalı.");
  }
  const plateKeys = new Set<string>();
  for (const plate of plates) {
    if (!isJuniorCoverKey(plate.lessonKey) || plate.step < 1 || plate.step > 9) {
      throw new Error(`Junior sahne plakası geçersiz: ${plate.lessonKey} adım ${plate.step}.`);
    }
    const id = `${plate.lessonKey}:${plate.step}`;
    if (plateKeys.has(id)) {
      throw new Error(`Junior sahne plakası yineleniyor: ${id}.`);
    }
    plateKeys.add(id);
  }
  const videoKeys = new Set<string>();
  for (const video of videos) {
    if (!isJuniorCoverKey(video.lessonKey) || video.step < 1 || video.step > 9) {
      throw new Error(`Junior sahne videosu geçersiz: ${video.lessonKey} adım ${video.step}.`);
    }
    const id = `${video.lessonKey}:${video.step}`;
    if (videoKeys.has(id)) {
      throw new Error(`Junior sahne videosu yineleniyor: ${id}.`);
    }
    videoKeys.add(id);
  }
}

assertSceneCatalog();

export function juniorScenePublicPath(
  lessonKey: string,
  step: number,
  ext: "jpg" | "mp4",
): string {
  const key = lessonKey.trim();
  if (!isJuniorCoverKey(key) || !Number.isInteger(step) || step < 1 || step > 9) {
    throw new Error("Junior sahne yolu: ders veya adım geçersiz.");
  }
  return `${JUNIOR_SCENE_PUBLIC_DIR}/${key}/step-${step}.${ext}`;
}

export function juniorSceneDiskRelative(lessonKey: string, step: number, ext: "jpg" | "mp4"): string {
  const publicPath = juniorScenePublicPath(lessonKey, step, ext);
  return `public${publicPath}`;
}

export type JuniorSceneBeatMedia = {
  videoSrc: string | null;
  imageSrc: string | null;
};

/** Beat 0…8 öğretimdir. Özet (beat ≥ 9) plaka ve video almaz. */
export function juniorSceneMediaForBeat(lessonKey: string, beat: number): JuniorSceneBeatMedia {
  const key = lessonKey.trim();
  // Oynatıcıya erişim juniorLessonGate tarafından kontrol edilir (ücretsiz önizleme, aktif paket veya Super Admin denetim).
  // Dosya CDN'de yoksa JuniorScenePlate onError ile vektör sahneye düşer.
  if (!key || beat < 0 || beat >= 9) {
    return { videoSrc: null, imageSrc: null };
  }
  const step = beat + 1;
  const video = JUNIOR_SCENE_VIDEOS.some((row) => row.lessonKey === key && row.step === step);
  const image = JUNIOR_SCENE_PLATES.some((row) => row.lessonKey === key && row.step === step);
  return {
    videoSrc: video ? resolvePublicMediaUrl(juniorScenePublicPath(key, step, "mp4")) : null,
    imageSrc: image ? resolvePublicMediaUrl(juniorScenePublicPath(key, step, "jpg")) : null,
  };
}

/** jr_06_fen-1 adım 6 sözsüz kaset yolu. Dosya yokken de oynatıcı bu yolu bağlar. */
export function juniorFen1VideoPlaceholder(): string {
  return juniorScenePublicPath("jr_06_fen-1", 6, "mp4");
}
