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

const YZ_ICERIK_QUESTIONS: AcademyExamQuestion[] = [
  {
    id: "q_yz_icerik_1",
    prompt:
      "Brief hem yalnız iki ikon hem her oda için ayrı ikon (12 oda) der. Usta ne yapar?",
    choices: [
      "12 ikon üretir; ikinci cümle geçerlidir",
      "2 ikon üretir; sayı tavanıdır",
      "Üretimi durdurur; çelişki yazılı netleşmeden Studio jetonu düşülmez",
      "Ortayı (7 ikon) teslim eder",
    ],
    correctIndex: 2,
  },
  {
    id: "q_yz_icerik_2",
    prompt: "Brief ticari kullanım, coğrafya ve süre yazmaz. Üretim başlar mı?",
    choices: [
      "Evet; yapay zekâ çıktısı kamu malıdır",
      "Evet; Studio jetonu düşünce hak müşteriye geçer",
      "Hayır; hak belirsizse üretim fail-closed durur",
      "Hayır; yalnız Super Admin onayından sonra",
    ],
    correctIndex: 2,
  },
  {
    id: "q_yz_icerik_3",
    prompt:
      "Revizyon turunda usta, onaylı prompt paketindeki negatif kısıtı sessizce siler. Bu nedir?",
    choices: [
      "İyi niyetli iyileştirme",
      "Spec ihlali; paket kilitli kalır, delta yazılı onay ister",
      "Studio'nun beklenen kullanımı",
      "Teslim şartnamesinin parçası",
    ],
    correctIndex: 1,
  },
  {
    id: "q_yz_icerik_4",
    prompt: "Müşteri daha pop yapsana der. Geçerli davranış hangisidir?",
    choices: [
      "Doygunluğu artırıp teslim etmek",
      "Yeni bir model denemek",
      "Filigran eklemek",
      "İsteği ölçülebilir kısıta çevirmeden üretim yapmamak",
    ],
    correctIndex: 3,
  },
  {
    id: "q_yz_icerik_5",
    prompt: "DELIVERY mesajında artifact URL var, dosya SHA-256 yok. Teslim tam mıdır?",
    choices: [
      "Evet; URL yeter",
      "Evet; Studio content_hash otomatik basılır, usta yazmaz",
      "Hayır; her dosya için SHA-256 (content_hash) şartnamede zorunludur",
      "Hayır; yalnız PDF hash yeter",
    ],
    correctIndex: 2,
  },
  {
    id: "q_yz_icerik_6",
    prompt:
      "Rail tanıtım banner'ında lucide ikon, geist font ve dekoratif ilerleme çubuğu kullanılır. Neden düşer?",
    choices: [
      "Quiet Luxury kanıt dilbilgisidir; hazır ikon ve süs iddia üretir, mühür taşımaz",
      "Lisans pahalıdır",
      "Next.js 16 bunları yasaklar",
      "Yalnız koyu tema zorunludur",
    ],
    correctIndex: 0,
  },
  {
    id: "q_yz_icerik_7",
    prompt:
      "Brief şu yaşayan illustratörün tarzında, ticari ikon seti der. Doğru davranış?",
    choices: [
      "Üret; model o stili zaten biliyor",
      "Reddet veya tarzı geometri / palet / ızgara kısıtına indirgemeden ticari teslim yapma",
      "Yalnız filigran ekle",
      "Kamu malı say ve teslim et",
    ],
    correctIndex: 1,
  },
  {
    id: "q_yz_icerik_8",
    prompt: "Akademi özet metninde cüzdanınızı yükleyin geçer. Usta ne yapar?",
    choices: [
      "Bırakır; resmi hitap güven verir",
      "Yalnız başlığı düzeltir",
      "İngilizceye çevirir",
      "SEN aksına çeker: satıcı-müşteri hitabı yasaktır, lonca sen der",
    ],
    correctIndex: 3,
  },
  {
    id: "q_yz_icerik_9",
    prompt:
      "Birinci tur sonrası müşteri altı yeni en-boy oranı ister, bütçe aynı. Ne olur?",
    choices: [
      "Ücretsiz revizyon; oran değişikliği stil işidir",
      "Yeni brief ve emanet farkı olmadan üretilmez",
      "DevLabs exec ile toplu basılır",
      "Yalnız ilk üç oran ücretsizdir",
    ],
    correctIndex: 1,
  },
  {
    id: "q_yz_icerik_10",
    prompt:
      "Prompt şablonu dokümanında bu komutu sunucuda çalıştır örneği vardır. Rail'de doğru ifade?",
    choices: [
      "DevLabs runner'dır; exec açıktır",
      "Studio exec'i DevLabs'a devreder",
      "DevLabs linter'dır, exec yoktur; şablon üretimi tarif eder, çalıştırmaz",
      "Super Admin exec açabilir",
    ],
    correctIndex: 2,
  },
  {
    id: "q_yz_icerik_11",
    prompt: "Bu dikeyin akademi kurs bedeli emanete alınır mı?",
    choices: [
      "Hayır; akademi anında settlement, tutar hazineye geçer; emanet freelancer işindedir",
      "Evet; sınav geçilince RELEASE",
      "Hold bps kadar emanet",
      "15 gün emanet",
    ],
    correctIndex: 0,
  },
  {
    id: "q_yz_icerik_12",
    prompt: "Sınav 70 puanın altında. SHA-256 ustalık belgesi basılır mı?",
    choices: [
      "Evet; satın alma yeter",
      "Hayır; belge yalnız baraj (70) ve müfredat mührü ile basılır",
      "Super Admin elle basar",
      "50 puan yeter, hash sonra eklenir",
    ],
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
  {
    id: "ac_yz_icerik_gorsel",
    slug: "yz-icerik-gorsel-uretim",
    title: "Yapay Zekâ Destekli İçerik ve Görsel Üretim",
    summary:
      "Ticari dikey sınavı: brief okuma, telif/kullanım hakları, prompt disiplini, revizyon yönetimi, teslim şartnamesi. Satın al öğrenme kaydıdır; SHA-256 belge baraj 70 sonrası basılır.",
    catalogUnitKey: "course:yz-icerik-gorsel-uretim",
    catalogEntryId: "cat_academy_course_yz_icerik",
    seedAmountMinor: 25_000,
    exam: {
      id: "exam_yz_icerik_gorsel",
      title: "YZ içerik ve görsel üretim müfredat sınavı",
      passScore: ACADEMY_EXAM_PASS_SCORE,
      questions: YZ_ICERIK_QUESTIONS,
    },
  },
];

export const ACADEMY_SEED_MODULE_KEY = ACADEMY_MODULE_KEY;

export const ACADEMY_SEED_CURRENCY = SETTLEMENT_CURRENCY;

export function academyCourseSeedBySlug(slug: string): AcademyCourseSeed | undefined {
  return ACADEMY_COURSE_SEEDS.find((row) => row.slug === slug);
}
