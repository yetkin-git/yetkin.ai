import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { ACADEMY_MODULE_KEY } from "@/lib/academy/types";
import type { AcademyExamQuestion } from "@/lib/academy/types";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";

/**
 * Ops akademi tohum sicili (ADIM 8).
 * Motor bu tutarları import-time fiyat olarak kullanmaz; canlı tutar
 * `PriceCatalogEntry` satırından, kurs `AcademyCourse` satırından okunur (S11-A).
 * SQL: `supabase/migrations/20260814090000_academy_course_seed.sql`.
 */
export type AcademyCourseSeed = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  catalogUnitKey: string;
  catalogEntryId: string;
  seedAmountMinor: number;
  exam: {
    id: string;
    title: string;
    passScore: number;
    questions: AcademyExamQuestion[];
  };
};

const RAIL_TEMEL_QUESTIONS: AcademyExamQuestion[] = [
  {
    id: "q_rail_temel_1",
    prompt: "Yetkin Rail nakit tutarını hangi birimde tutar?",
    choices: ["float TL", "amountMinor", "wei", "kuruş string"],
    correctIndex: 1,
  },
  {
    id: "q_rail_temel_2",
    prompt: "Kurs satın alma anında ustalık belgesi basılır mı?",
    choices: [
      "Evet, settlement ile birlikte",
      "Hayır; belge müfredat sınavı ≥70 sonrası basılır",
      "Yalnız Super Admin basar",
      "İade sonrası otomatik basılır",
    ],
    correctIndex: 1,
  },
  {
    id: "q_rail_temel_3",
    prompt: "Akademi kurs ödemesinde emanet (escrow) var mıdır?",
    choices: [
      "Evet, teslim teyidine kadar",
      "Hayır; anında settlement, tutar platform hazinesine geçer",
      "Yalnız 15 gün emanet",
      "Hold bps kadar emanet",
    ],
    correctIndex: 1,
  },
  {
    id: "q_rail_temel_4",
    prompt: "CheckoutPriceLock süresi nedir?",
    choices: ["1 dakika", "15 dakika", "24 saat", "Süresiz"],
    correctIndex: 1,
  },
];

const RAY_SINYAL_QUESTIONS: AcademyExamQuestion[] = [
  {
    id: "q_ray_sinyal_1",
    prompt: "Anklaşman (interlocking) temel görevi nedir?",
    choices: [
      "Hız rekoru tutmak",
      "Çelişen güzergâhları aynı anda kilitlememek",
      "Bilet satmak",
      "Trafo gerilimini yükseltmek",
    ],
    correctIndex: 1,
  },
  {
    id: "q_ray_sinyal_2",
    prompt: "Fail-safe sinyal ilkesi hangisidir?",
    choices: [
      "Arıza yeşil yakar",
      "Arıza en kısıtlayıcı (kırmızı / dur) duruma düşer",
      "Arıza hattı kapatmaz",
      "Arıza sarı yakmak zorundadır",
    ],
    correctIndex: 1,
  },
  {
    id: "q_ray_sinyal_3",
    prompt: "Ray devresi (track circuit) neyi tespit eder?",
    choices: [
      "Yolcu sayısını",
      "Kesimde tren varlığını",
      "Bilet türünü",
      "Hava sıcaklığını",
    ],
    correctIndex: 1,
  },
  {
    id: "q_ray_sinyal_4",
    prompt: "Kırmızı aspektin işletme anlamı nedir?",
    choices: ["Geçilebilir", "Dur — güzergâh kapalı veya korunuyor", "Hızlan", "Makas serbest"],
    correctIndex: 1,
  },
];

export const ACADEMY_COURSE_SEEDS: readonly AcademyCourseSeed[] = [
  {
    id: "ac_rail_temel",
    slug: "rail-temel",
    title: "Yetkin Rail: Tek Nakit Defter ve Settlement",
    summary:
      "Mühürlü emek muhasebesi: amountMinor, CheckoutPriceLock, anında settlement. Satın al öğrenme kaydıdır; ustalık belgesi sınav kapısıdır.",
    catalogUnitKey: "course:rail-temel",
    catalogEntryId: "cat_academy_course_rail_temel",
    seedAmountMinor: 25_000,
    exam: {
      id: "exam_rail_temel",
      title: "Rail temeli müfredat sınavı",
      passScore: ACADEMY_EXAM_PASS_SCORE,
      questions: RAIL_TEMEL_QUESTIONS,
    },
  },
  {
    id: "ac_ray_sinyal",
    slug: "rayli-sinyal-emniyet",
    title: "Raylı Sistemler: Sinyal, Emniyet ve Anklaşman Temeli",
    summary:
      "Teknik işletme müfredatı: fail-safe, anklaşman, ray devresi ve kırmızı aspekt. Mühendislik yetkinliği sınavla mühürlenir.",
    catalogUnitKey: "course:rayli-sinyal-emniyet",
    catalogEntryId: "cat_academy_course_ray_sinyal",
    seedAmountMinor: 49_000,
    exam: {
      id: "exam_ray_sinyal",
      title: "Sinyal ve emniyet müfredat sınavı",
      passScore: ACADEMY_EXAM_PASS_SCORE,
      questions: RAY_SINYAL_QUESTIONS,
    },
  },
];

export const ACADEMY_SEED_MODULE_KEY = ACADEMY_MODULE_KEY;

export const ACADEMY_SEED_CURRENCY = SETTLEMENT_CURRENCY;

export function academyCourseSeedBySlug(slug: string): AcademyCourseSeed | undefined {
  return ACADEMY_COURSE_SEEDS.find((row) => row.slug === slug);
}
