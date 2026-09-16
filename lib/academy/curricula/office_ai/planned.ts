/**
 * 01_office_ai müfredat haritası — canlı sınav yolu `lesson-index.ts` SSOT’tur.
 * Faz 1 kilit omurga (anahtarlar değişmez; sıra pedagojikdir):
 * 1 Excel → 2 KVKK → 3 Rapor → 4 Slayt → 5 Hata avı → 6 E-posta ritüeli
 * → 7 Gmail/Outlook kapısı → 8 Word → 9 Cuma 30 capstone. Sınav yalnız 9. dersten sonra.
 * Üç Kapı Hiyerarşisi PEDAGOJI.md §E.10.
 * Yerleşik araç SSOT: Outlook→Copilot, Gmail→Gemini, Word/Excel→Doğrudan Dosya Yükleme, PowerPoint→Copilot.
 */

export const OFFICE_AI_PLANNED_LESSON_STATUS = ["planned", "baking", "sealed"] as const;
export const OFFICE_AI_PLANNED_LESSON_LANE = ["main", "satellite"] as const;

export type OfficeAiPlannedLessonStatus = (typeof OFFICE_AI_PLANNED_LESSON_STATUS)[number];
export type OfficeAiPlannedLessonLane = (typeof OFFICE_AI_PLANNED_LESSON_LANE)[number];
export type OfficeAiPlannedLessonMethod =
  | "gmail-gemini"
  | "doc-upload-gemini"
  | "direct-file-upload"
  | "copilot-live"
  | "copy-workaround";

export type OfficeAiPlannedLesson = {
  key: string;
  title: string;
  status: OfficeAiPlannedLessonStatus;
  lane: OfficeAiPlannedLessonLane;
  method: OfficeAiPlannedLessonMethod;
  pedagogicalObjective: string;
};

export const OFFICE_AI_PLANNED_LESSONS = [
  {
    key: "01_office_ai-1",
    title: "Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo",
    status: "sealed",
    lane: "main",
    method: "copilot-live",
    pedagogicalObjective:
      "A1 eşiği, birleşik hücre ve tür birliği. 1. Kapı Excel Copilot, 2. Kapı ataş, 3. Kapı maskeli kısa özet.",
  },
  {
    key: "01_office_ai-k1",
    title: "KVKK, Şirket Sırları ve Maskeleme: Ne Yüklenmez?",
    status: "sealed",
    lane: "main",
    method: "direct-file-upload",
    pedagogicalObjective:
      "Kişisel veri ve şirket sırrını ham haliyle yüklememek. Yükleme alışkanlığından önce 3. Kapı yalnız maskeli kısa özettir.",
  },
  {
    key: "01_office_ai-2",
    title: "Rapor Otomasyonu: Tablodan Yönetim Özetine",
    status: "sealed",
    lane: "main",
    method: "direct-file-upload",
    pedagogicalObjective:
      "Temiz tablodan üç maddelik yönetim özeti ve karar notu çıkarmak. Grafik vaadi bu derste yoktur.",
  },
  {
    key: "01_office_ai-3",
    title: "Sunum Fabrikası: Metinden Slayta",
    status: "sealed",
    lane: "main",
    method: "copilot-live",
    pedagogicalObjective:
      "Slayt başına tek fikir. 1. Kapı PowerPoint Copilot, 2. Kapı .pptx ataş. VBA / Gamma / Marp zorunlu değildir.",
  },
  {
    key: "01_office_ai-5",
    title: "İstisnalar & Hata Avı: AI Yanılınca",
    status: "sealed",
    lane: "main",
    method: "direct-file-upload",
    pedagogicalObjective:
      "Çapraz kontrol, TOPLA kilidi, insan gözü. Akıcı özete güvenilmez.",
  },
  {
    key: "01_office_ai-4",
    title: "E-Posta Akışı: Gelen Kutusu Sıfırlama",
    status: "sealed",
    lane: "main",
    method: "copilot-live",
    pedagogicalObjective:
      "Etiket → taslak → insan onayı → arşiv ritüeli. Yerleşik panel ve aksiyon tablosu G1 dersindedir.",
  },
  {
    key: "01_office_ai-g1",
    title: "Gmail + Gemini ile Gelen Kutusu ve Aksiyon Listesi",
    status: "sealed",
    lane: "main",
    method: "gmail-gemini",
    pedagogicalObjective:
      "Gelen kutusunu Gmail Gemini (1. Kapı) ve Outlook Copilot ile aynı rutinle yönetmeyi göstermek. Mail gövdesini dış sohbete taşımak varsayılan yol değildir.",
  },
  {
    key: "01_office_ai-w1",
    title: "Word ve Uzun Doküman Analizi: Sözleşme, Dilekçe, Rapor",
    status: "sealed",
    lane: "main",
    method: "doc-upload-gemini",
    pedagogicalObjective:
      "Sözleşme, dilekçe ve raporu ataş ile yüklemeyi göstermek. Tüm dosyayı sayfa sayfa kopyalamak zahmetli yoldur. Spesifik bir paragrafı soracaksan onu istemine eklersin.",
  },
  {
    key: "01_office_ai-6",
    title: "Haftalık Sistem: 30 Dakikalık Rutin",
    status: "sealed",
    lane: "main",
    method: "copilot-live",
    pedagogicalObjective:
      "Cuma 30 = 10 Excel + 10 slayt + 10 kutu. Kapanış dersi; sınav kapısı yalnız bu ders bittikten sonra açılır.",
  },
] as const satisfies readonly OfficeAiPlannedLesson[];

export function officeAiPlannedLessonByKey(key: string): OfficeAiPlannedLesson | null {
  return OFFICE_AI_PLANNED_LESSONS.find((lesson) => lesson.key === key.trim()) ?? null;
}
