/**
 * 01_office_ai müfredat haritası — canlı sınav yolu `lesson-index.ts` SSOT’tur.
 * Ders 0 hazırlık şeridi `prep.ts` içindedir; bu diziye ve lesson-index’e girmez.
 * Aşama 2 kilit omurga (sıra pedagojikdir):
 * 1 Excel → 2 KVKK → 3 Yönetim özeti → 4 Slayt → 5 Hata avı
 * → 6 E-posta akışı (Gmail / Outlook; ritüel ilk 2 dk) → 7 Word → 8 Cuma 30.
 * Eski ritüel anahtarı `01_office_ai-4` sınav yolunda yoktur; gövde `01_office_ai-g1` içindedir.
 * Sınav yalnız 8. dersten sonra.
 * Uydu (OFF-201 taslak, OFF-101 sınav yoluna girmez): 10 takvim/toplantı, 11 Excel formül/grafik, 12 PDF.
 * OFF-201 taslağı `off-102.ts` içindedir (salt okunur projeksiyon; ana şerit 8 ders durur).
 * Üç Kapı Hiyerarşisi PEDAGOJI.md §E.10 — yalnız aktarım:
 * 1. Kapı yerleşik panel (Copilot / Gemini şeridi) → 2. Kapı ataş (Excel tablosu / Word belgesi / PowerPoint sunusu) → 3. Kapı maskeli kısa özet.
 * Güvenlik sınıfı ayrı eksendir: kişisel veri / şirket sırrı / açık katalog bilgisi. Kapı adı değildir.
 * Yerleşik araç SSOT: Outlook→Copilot, Gmail→Gemini, Excel→lisans varsa Copilot şeridi yoksa ataş (ikisi de geçerli), Word→Doğrudan Dosya Yükleme, PowerPoint→Copilot.
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
  /** Ana şerit OFF-101; uydu şerit OFF-201 taslak. 101 indeksine yazılmaz. */
  targetModuleCode: "OFF-101" | "OFF-201";
};

export const OFFICE_AI_PLANNED_LESSONS = [
  {
    key: "01_office_ai-1",
    title: "A1 Düzeni ve Temiz Veri: Düzensiz Excel → Düzenli Tablo",
    status: "sealed",
    lane: "main",
    method: "copilot-live",
    targetModuleCode: "OFF-101",
    pedagogicalObjective:
      "A1 kuralı, birleşik hücre ve tür birliği. Yükleme kimliği gizlenmiş örnek tablo üzerinden. 1. Kapı Excel Copilot, 2. Kapı ataş; maske kuralı 2. derste.",
  },
  {
    key: "01_office_ai-k1",
    title: "KVKK, Şirket Sırları ve Maskeleme: Ne Yüklenmez?",
    status: "sealed",
    lane: "main",
    method: "copy-workaround",
    targetModuleCode: "OFF-101",
    pedagogicalObjective:
      "Müşteri listesini, IBAN, T.C. Kimlik No, maaş ve şirket sırrını açık yapay zekâ ekranına yüklememek. Maske: Müşteri A, MASKELİ_IBAN. 3. Kapı yalnız maskeli kısa özettir.",
  },
  {
    key: "01_office_ai-2",
    title: "Yönetim Özetine Dönüştürme",
    status: "sealed",
    lane: "main",
    method: "direct-file-upload",
    targetModuleCode: "OFF-101",
    pedagogicalObjective:
      "Temiz tablodan üç maddelik yönetim özeti ve karar cümlesi çıkarmak. Neden üç madde: yönetici on sayfayı okumaz. Sayıları hücreden kilitle. Grafik bu derste yok; grafikleri Excel Formül dersinde (yakında) kuracağız.",
  },
  {
    key: "01_office_ai-3",
    title: "Metinden Slayta: Sunum Hazırlama",
    status: "sealed",
    lane: "main",
    method: "copilot-live",
    targetModuleCode: "OFF-101",
    pedagogicalObjective:
      "Slayt başına tek fikir. 1. Kapı PowerPoint Copilot, 2. Kapı PowerPoint sunusu ataş. VBA / Gamma / Marp zorunlu değildir.",
  },
  {
    key: "01_office_ai-5",
    title: "İstisnalar ve Hata Avı: Yapay Zekâ Yanılınca",
    status: "sealed",
    lane: "main",
    method: "direct-file-upload",
    targetModuleCode: "OFF-101",
    pedagogicalObjective:
      "Çapraz kontrol, TOPLA formülü, insan gözü. Yapay zekâ neden uydurur? Dil modeli işlemci değildir. Akıcı özete güvenilmez.",
  },
  {
    key: "01_office_ai-g1",
    title: "E-Posta Akışı: Gmail / Outlook ve Aksiyon Listesi",
    status: "sealed",
    lane: "main",
    method: "gmail-gemini",
    targetModuleCode: "OFF-101",
    pedagogicalObjective:
      "İlk iki dakika etiket, taslak, insan onayı ve arşiv. Ardından gelen kutuyu Gmail Gemini (1. Kapı) ve Outlook Copilot ile yerinde aksiyon listesine dökmek. Neden e-postayı harici sohbet ekranına yapıştırmak yerine yerleşik panel? Çünkü kopyalanan metin tarihi, göndereni ve bağlamı kaybeder. Aksiyon listesinde kim, ne, ne zaman kilitlenir. İleti gövdesini dış sohbete taşımak varsayılan yol değildir.",
  },
  {
    key: "01_office_ai-w1",
    title: "Word ve Uzun Belge İncelemesi: Sözleşme, Dilekçe, Rapor",
    status: "sealed",
    lane: "main",
    method: "doc-upload-gemini",
    targetModuleCode: "OFF-101",
    pedagogicalObjective:
      "Sözleşme, dilekçe ve raporu ataş ile yüklemeyi göstermek. Tüm dosyayı sayfa sayfa kopyalamak tek tek kopyalamadır. Belirli bir paragrafı soracaksan onu istemine eklersin.",
  },
  {
    key: "01_office_ai-6",
    title: "Haftalık Sistem: 30 Dakikalık Rutin",
    status: "sealed",
    lane: "main",
    method: "copilot-live",
    targetModuleCode: "OFF-101",
    pedagogicalObjective:
      "Cuma 30 = 10 Excel düzeni + 10 slayt kontrolü + 10 kutu sıfırlama. Üç blok bitince kısa bir Word ve hata kontrolü. Kapanış dersi; sınav kapısı yalnız bu ders bittikten sonra açılır.",
  },
  {
    key: "01_office_ai-10",
    title: "Takvim ve Toplantı AI: Outlook, Teams, Meet",
    status: "planned",
    lane: "satellite",
    method: "copilot-live",
    targetModuleCode: "OFF-201",
    pedagogicalObjective:
      "Davet triyajı ve transkriptten aksiyon listesi. 1. Kapı Teams Copilot / Meet Gemini, 2. Kapı transkript ataş, 3. Kapı maskeli kısa özet. Çekirdek 8’e girmez; OFF-201 taslak.",
  },
  {
    key: "01_office_ai-11",
    title: "Excel Formül ve Grafik AI: XLOOKUP, Özet Tablo, Grafik",
    status: "planned",
    lane: "satellite",
    method: "direct-file-upload",
    targetModuleCode: "OFF-201",
    pedagogicalObjective:
      "Formül yazdırma, TOPLA kilidi, grafik seçimi. Hata avı ile üret → kilitle → görselleştir. Çekirdek 8’e girmez; OFF-201 taslak.",
  },
  {
    key: "01_office_ai-12",
    title: "PDF ve Uzun Belge AI: OCR, Birleştirme, Karşılaştırma",
    status: "planned",
    lane: "satellite",
    method: "doc-upload-gemini",
    targetModuleCode: "OFF-201",
    pedagogicalObjective:
      "Taranmış PDF’yi ataşla; sayfa numarası iste; uydurma maddeyi sil. KVKK maskesi PDF’te durur. Çekirdek 8’e girmez; OFF-201 taslak.",
  },
] as const satisfies readonly OfficeAiPlannedLesson[];

export function officeAiPlannedLessonByKey(key: string): OfficeAiPlannedLesson | null {
  return OFFICE_AI_PLANNED_LESSONS.find((lesson) => lesson.key === key.trim()) ?? null;
}
