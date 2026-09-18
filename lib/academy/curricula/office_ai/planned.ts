/**
 * 01_office_ai müfredat haritası — canlı sınav yolu `lesson-index.ts` SSOT’tur.
 * Faz 1 kilit omurga (anahtarlar değişmez; sıra pedagojikdir):
 * 1 Excel → 2 KVKK → 3 Rapor → 4 Slayt → 5 Hata avı → 6 E-posta ritüeli
 * → 7 Gmail/Outlook kapısı → 8 Word → 9 Cuma 30 capstone. Sınav yalnız 9. dersten sonra.
 * Uydu (ileriki fırın, sınav yoluna girmez): 10 takvim/toplantı, 11 Excel formül/grafik, 12 PDF.
 * Üç Kapı Hiyerarşisi PEDAGOJI.md §E.10 — yalnız aktarım:
 * 1. Kapı yerleşik panel (Copilot / Gemini şeridi) → 2. Kapı ataş (xlsx/docx/pptx) → 3. Kapı maskeli kısa özet.
 * Güvenlik sınıfı ayrı eksendir: kişisel veri / şirket sırrı / kamu cümlesi. Kapı adı değildir.
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
      "Müşteri listesi, IBAN, T.C. Kimlik No, maaş ve şirket sırrını açık yapay zekâ ekranına yüklememek. Maske: Müşteri A / MASKELİ_IBAN. 3. Kapı yalnız maskeli kısa özettir.",
  },
  {
    key: "01_office_ai-2",
    title: "Rapor Otomasyonu: Tablodan Yönetim Özetine",
    status: "sealed",
    lane: "main",
    method: "direct-file-upload",
    pedagogicalObjective:
      "Temiz tablodan üç maddelik yönetim özeti ve karar notu çıkarmak. Neden üç madde: yönetici on sayfayı okumaz. Sayıları hücreden kilitle. Grafik vaadi bu derste yoktur.",
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
      "Çapraz kontrol, TOPLA kilidi, insan gözü. Yapay zekâ neden uydurur? Dil modeli işlemci değildir. Akıcı özete güvenilmez.",
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
      "Gelen kutusunu Gmail Gemini (1. Kapı) ve Outlook Copilot ile aynı rutinle yönetmeyi göstermek. Neden ChatGPT’ye kopyalamak yerine yerleşik panel? Çünkü kopyalanan gövde kutudan kopar. Aksiyon listesinde kim, ne, ne zaman kilitlenir. Mail gövdesini dış sohbete taşımak varsayılan yol değildir.",
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
  {
    key: "01_office_ai-10",
    title: "Takvim ve Toplantı AI: Outlook, Teams, Meet",
    status: "planned",
    lane: "satellite",
    method: "copilot-live",
    pedagogicalObjective:
      "Davet triyajı ve transkriptten aksiyon listesi. 1. Kapı Teams Copilot / Meet Gemini, 2. Kapı transkript ataş, 3. Kapı maskeli kısa özet. Çekirdek 9’a girmez; ileriki fırın.",
  },
  {
    key: "01_office_ai-11",
    title: "Excel Formül ve Grafik AI: XLOOKUP, Özet Tablo, Grafik",
    status: "planned",
    lane: "satellite",
    method: "direct-file-upload",
    pedagogicalObjective:
      "Formül yazdırma, TOPLA kilidi, grafik seçimi. Hata avı ile üret → kilitle → görselleştir. Çekirdek 9’a girmez; ileriki fırın.",
  },
  {
    key: "01_office_ai-12",
    title: "PDF ve Uzun Belge AI: OCR, Birleştirme, Karşılaştırma",
    status: "planned",
    lane: "satellite",
    method: "doc-upload-gemini",
    pedagogicalObjective:
      "Taranmış PDF’yi ataşla; sayfa numarası iste; uydurma maddeyi sil. KVKK maskesi PDF’te durur. Çekirdek 9’a girmez; ileriki fırın.",
  },
] as const satisfies readonly OfficeAiPlannedLesson[];

export function officeAiPlannedLessonByKey(key: string): OfficeAiPlannedLesson | null {
  return OFFICE_AI_PLANNED_LESSONS.find((lesson) => lesson.key === key.trim()) ?? null;
}
