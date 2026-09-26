/**
 * OFF-201 canlı sahne — her cue adımı bir slayt.
 * Rozet ve split `lesson-beat-visual.ts` kaydındadır.
 * Temiz sonuç yalnız FARK ORTADA sağ panelinde açılır.
 */

import type { AcademyCinemaCueSlide } from "@/lib/academy/cinema-cue-catalog";
import {
  academyBusinessAiBeatVisual,
  ACADEMY_BUSINESS_AI_LESSON_KEYS,
  type AcademyBusinessAiLessonKey,
} from "@/lib/academy/lesson-beat-visual";

type Table = { headers: readonly string[]; rows: readonly (readonly string[])[]; note?: string };

type BeatSlide = {
  headline: string;
  subhead: string;
  bullets: readonly string[];
  table: Table;
  fileName: string;
  sheetName: string;
  formulaBar?: string;
  copilot?: { prompt: string; replyLines: readonly string[]; hideReply?: boolean };
  highlightCell?: string;
};

const COURSE = "İleri Ofis Yapay Zekâ";

const L1_RAW: Table = {
  headers: ["Satır", "Masadaki not"],
  rows: [
    ["Marmara", "Kaya Un 1 kg, 120 sipariş"],
    ["Ege", "Kaya Un 1 kg, 80 sipariş"],
    ["İç Anadolu", "satır eksik"],
    ["Son satır", "Ayşe Yılmaz, 0532 000 00 00"],
  ],
  note: "Ham not. Ad ve telefon kutuya gitmez.",
};

const L1_MASK: Table = {
  headers: ["Bölge", "Ürün", "Sipariş"],
  rows: [
    ["Marmara", "Kaya Un 1 kg", "120"],
    ["Ege", "Kaya Un 1 kg", "80"],
    ["İç Anadolu", "—", "satır eksik"],
  ],
  note: "Ad yok. Telefon yok. Eksik satır sayı değildir.",
};

const L1_CLEAN: Table = {
  headers: ["Madde", "Kaynak satır"],
  rows: [
    ["1", "Marmara, Kaya Un 1 kg, 120 sipariş"],
    ["2", "Ege, Kaya Un 1 kg, 80 sipariş"],
    ["3", "İç Anadolu satırı eksik"],
    ["Karar", "120 ve 80 okunur. Eksik satırdan sayı yok."],
  ],
  note: "Yüzde yok. Kişi adı yok.",
};

const L1_PROMPT =
  "Rol: ofis asistanı. Görev: bu üç satırdan bölge özeti çıkar. Biçim: üç madde ve bir karar cümlesi. Kısıt: kaynakta olmayan sayı ekleme. Kişi adı yazma. Eksik satırı sayıya çevirme. Satırlar: Marmara, Kaya Un 1 kg, 120 sipariş. Ege, Kaya Un 1 kg, 80 sipariş. İç Anadolu, satır eksik.";

const L2_RAW: Table = {
  headers: ["Davet", "Saat", "Not"],
  rows: [
    ["Marmara deposu", "Perşembe 10:00–10:30", "Kaya Un sevkiyatı"],
    ["Ege deposu", "Perşembe 10:00–10:30", "Kaya Un sevkiyatı"],
    ["Sahip", "yazılmamış", "Kim yazacak belli değil"],
    ["Son satır", "Selin Korkmaz", "0532 000 00 00"],
  ],
  note: "İki davet aynı saati tutmuş. Ad kutuya gitmez.",
};

const L2_MASK: Table = {
  headers: ["Depo", "Saat", "İş"],
  rows: [
    ["Marmara", "Perşembe 10:00–10:30", "Kaya Un sevkiyatı"],
    ["Ege", "Perşembe 10:00–10:30", "Kaya Un sevkiyatı"],
    ["Sahip", "yok", "Hangi Perşembe yok"],
  ],
  note: "Ad yok. Telefon yok. Yeni saat yok.",
};

const L2_CLEAN: Table = {
  headers: ["Satır", "Eylem"],
  rows: [
    ["1", "Marmara deposu, Kaya Un, Perşembe 10:00–10:30. Sahip yok."],
    ["2", "Ege deposu, Kaya Un, Perşembe 10:00–10:30. Sahip yok."],
    ["Çakışma", "İki davet aynı Perşembe 10:00'ı tutuyor."],
    ["Kilit", "Tek randevu yok. Yeni saat yok. Ad yok."],
  ],
  note: "Hangi Perşembe notta yok. Tarih uydurulmaz.",
};

const L2_PROMPT =
  "Rol: ofis asistanı. Görev: bu nottan eylem listesi çıkar ve çakışan saati işaretle. Biçim: her madde kim, ne, ne zaman desin. Çakışma ayrı bir satır olsun. Kısıt: kaynakta olmayan kişi, tarih ve saat yazma. Çakışan iki saati tek randevuya indirgeme. Kişi adı yazma. Satırlar: Marmara deposu, Perşembe 10:00–10:30. Ege deposu, Perşembe 10:00–10:30. Sahip yok. Hangi Perşembe yok.";

const L3_RAW: Table = {
  headers: ["Bölge", "Adet", "Not"],
  rows: [
    ["Marmara", "120", "B2"],
    ["Ege", "80", "B3"],
    ["Toplam", "boş", "B4"],
    ["Alt not", "Ayşe Yılmaz", "IBAN TR00…"],
  ],
  note: "B4 boş. Ad ve IBAN tablodan çıkar.",
};

const L3_MASK: Table = {
  headers: ["Bölge", "Adet"],
  rows: [
    ["Marmara", "120"],
    ["Ege", "80"],
    ["Toplam B4", "boş"],
  ],
  note: "Ad yok. IBAN yok. Boş hücre düz sayı değildir.",
};

const L3_CLEAN: Table = {
  headers: ["Hücre", "Değer"],
  rows: [
    ["B2", "120"],
    ["B3", "80"],
    ["B4", "=TOPLA(B2:B3)"],
    ["Grafik", "A2:B3. Üçüncü dilim yok."],
  ],
  note: "Hücre 200 gösterir. Yüzde yok. Düz 250 yok.",
};

const L3_PROMPT =
  "Rol: ofis asistanı. Görev: bu tablonun toplamı için formül taslağı yaz ve grafiğin hangi hücreden okunacağını söyle. Biçim: üç satır. Hücre, formül, grafik aralığı. Kısıt: kaynakta olmayan sayı yazma. Toplamı düz sayı basma. Yüzde yazma. Grafiğe kaynakta olmayan dilim ekleme. Kişi adı ve IBAN yazma. Satırlar: Marmara 120. Ege 80. Toplam hücresi B4, boş.";

const L4_RAW: Table = {
  headers: ["Sayfa", "Cümle"],
  rows: [
    ["2", "Mehmet Kaya, kimlik, IBAN"],
    ["4", "30 gün içinde ödenir"],
    ["7", "Gecikmede her ay yüzde 2"],
    ["11", "15 gün sonra sözleşme biter"],
    ["18", "Gizlilik 2 yıl sürer"],
  ],
  note: "Sayfa 22 yoktur. Sayfa 2 dışarıda kalır.",
};

const L4_MASK: Table = {
  headers: ["İş", "Aranan"],
  rows: [
    ["Ödeme günü", "sayfa numarası + tek cümle"],
    ["Gecikme oranı", "sayfa numarası + tek cümle"],
    ["Fesih süresi", "sayfa numarası + tek cümle"],
    ["Gizlilik süresi", "sayfa numarası + tek cümle"],
  ],
  note: "Taraf adı yok. Kimlik yok. IBAN yok.",
};

const L4_CLEAN: Table = {
  headers: ["İş", "Sayfa", "Cümle"],
  rows: [
    ["Ödeme günü", "4", "30 gün içinde ödenir"],
    ["Gecikme oranı", "7", "her ay yüzde 2"],
    ["Fesih süresi", "11", "15 gün sonra biter"],
    ["Gizlilik süresi", "18", "2 yıl sürer"],
  ],
  note: "22. sayfa yok. Yüzde 10 yok. Ad yok.",
};

const L4_PROMPT =
  "Rol: ofis asistanı. Görev: dört iş için maddenin geçtiği sayfa numarasını ve maddenin tek cümlesini yaz. İşler: ödeme günü, gecikme oranı, fesih süresi, gizlilik süresi. Biçim: dört satır. Her satırda işin adı, sayfa numarası ve tek cümle. Kısıt: tam analiz yazma. Dosyada olmayan sayfa yazma. Kaynakta olmayan oran yazma. Taraf adı, kimlik numarası ve IBAN yazma.";

const L5_RAW: Table = {
  headers: ["Parça", "Posta"],
  rows: [
    ["Konu", "Kaya Un, gecikme ve hesap"],
    ["Gövde", "Mehmet Kaya, telefon, IBAN, kimlik"],
    ["Stok notu", "Marmara, Kaya Un 1 kg, 120 koli"],
    ["Kural", "Bilgi. Şikayet. Kişisel veri talebi."],
  ],
  note: "Kimlik taslağa girmez. Gönder düğmesine basılmaz.",
};

const L5_MASK: Table = {
  headers: ["Sınıf", "İş"],
  rows: [
    ["Bilgi", "Marmara, Kaya Un 1 kg, 120 koli"],
    ["Şikayet", "Sevkiyat 2 gün geç. Tazminat yok."],
    ["Kişisel veri", "Kimlik ve hesap doğrulama. Metin yok."],
  ],
  note: "Ad yok. Telefon yok. IBAN yok. Kimlik yok.",
};

const L5_CLEAN: Table = {
  headers: ["Sınıf", "Taslak"],
  rows: [
    ["Bilgi", "Stok notu 120 kolidir. Başka sayı yoktur."],
    ["Şikayet", "2 gün geç kaldı. Tazminat ve yüzde yoktur."],
    ["Kişisel veri", "Talebiniz alındı. Kayıt birimine iletildi."],
    ["Kilit", "Gönderildi yok. Düğmeye basılmaz."],
  ],
  note: "200 koli yok. Yüzde 10 yok. Ad yok.",
};

const L5_PROMPT =
  "Rol: ofis asistanı. Görev: üç işi sınıflandır ve her iş için şirket kuralına uygun bir taslak cümlesi yaz. Biçim: üç satır. Sınıf, iş, taslak. Sınıflar: bilgi, şikayet, kişisel veri talebi. Kısıt: üç işi tek sınıfta birleştirme. Stok notunda olmayan sayı yazma. Tazminat ve yüzde yazma. Ad, telefon, IBAN ve kimlik yazma. Gönderildi yazma.";

const L6_RAW: Table = {
  headers: ["Dosya", "Sayı"],
  rows: [
    ["Tablo B2", "Marmara 120, Ege 80, B4 =TOPLA → 200"],
    ["Yazılı not", "Marmara 150, toplam 230, 45 gün, yüzde 10"],
    ["Sayfa 4", "30 gün içinde ödenir"],
    ["Sayfa 7", "gecikmede yüzde 2"],
    ["Alt satır", "Ayşe Yılmaz, telefon"],
  ],
  note: "Üç dosya yan yana. Ad karşılaştırma satırı değildir.",
};

const L6_MASK: Table = {
  headers: ["Karşılaştırma", "Tablo / sayfa", "Yazılı not"],
  rows: [
    ["Marmara", "120", "150"],
    ["Toplam", "200", "230"],
    ["Ödeme", "30 gün", "45 gün"],
    ["Gecikme", "yüzde 2", "yüzde 10"],
  ],
  note: "Ad yok. Telefon yok. IBAN yok. Orta sayı yok.",
};

const L6_CLEAN: Table = {
  headers: ["Satır", "Karar notu"],
  rows: [
    ["Marmara", "120. 150 uyuşmuyor. 135 yok."],
    ["Toplam", "200. 230 uyuşmuyor."],
    ["Ödeme", "30 gün. 45 gün uyuşmuyor."],
    ["Gecikme", "yüzde 2. yüzde 10 uyuşmuyor."],
  ],
  note: "Kaynaklar uyumlu yok. Ad yok.",
};

const L6_PROMPT =
  "Rol: ofis asistanı. Görev: dört karşılaştırmayı ayrı satırda yaz ve uyuşmayan sayıyı işaretle. Sonra tek karar cümlesi yaz. Karşılaştırmalar: Marmara adedi, toplam, ödeme günü, gecikme oranı. Biçim: dört satır ve bir karar cümlesi. Kısıt: kaynaklar uyumlu yazma. İki sayının ortasını alma. Ad, telefon, kimlik ve IBAN yazma.";

function stepsTable(title: string, rows: readonly (readonly string[])[]): Table {
  return {
    headers: ["Sıra", title],
    rows,
    note: "Önce onaylı araç, sonra veri sınıfı, sonra aktarım yolu.",
  };
}

function pack(
  lessonKey: AcademyBusinessAiLessonKey,
  title: string,
  fileName: string,
  beats: readonly BeatSlide[],
): readonly AcademyCinemaCueSlide[] {
  const visual = academyBusinessAiBeatVisual(lessonKey);
  if (!visual || beats.length !== 8) {
    return [];
  }
  return beats.map((beat, index) => {
    const card = visual.punchcards[index]!;
    const cueIndex = index + 1;
    const split = card.beat === "comparison";
    return {
      lessonKey,
      cueIndex,
      theme: "office",
      courseLabel: COURSE,
      lessonTitle: title,
      instructor: "Gözde",
      section: card.section,
      headline: beat.headline,
      subhead: beat.subhead,
      bullets: beat.bullets,
      tools: ["Onaylı araç"],
      layout: "excel",
      beat: card.beat === "bridge" || card.beat === "pocket" ? "task" : card.beat,
      visualMode: split ? "split" : "live",
      compare: split
        ? {
            beforeCueIndex: 3,
            beforeLabel: visual.split.beforeLabel,
            afterLabel: visual.split.afterLabel,
          }
        : undefined,
      table: beat.table,
      fileName,
      sheetName: beat.sheetName,
      formulaBar: beat.formulaBar,
      highlightCell: beat.highlightCell ?? "A1",
      copilot: beat.copilot,
    };
  });
}

const SLIDES: Record<AcademyBusinessAiLessonKey, readonly AcademyCinemaCueSlide[]> = {
  "01_office_ai_ileri-1": pack("01_office_ai_ileri-1", "Dört Parçalı İstem", "Bolge_Notu.xlsx", [
    {
      headline: "DÖRT PARÇA",
      subhead: "Dört parça aynı kutuda durur: rol, görev, biçim, kısıt.",
      bullets: ["Rol", "Görev", "Biçim", "Kısıt"],
      fileName: "Bolge_Notu.xlsx",
      sheetName: "Dört parça",
      table: {
        headers: ["Parça", "Ne işe yarar"],
        rows: [
          ["Rol", "İşin sahibi"],
          ["Görev", "Tek iş"],
          ["Biçim", "Çıktının şekli"],
          ["Kısıt", "Taşma çizgisi"],
        ],
      },
    },
    {
      headline: "ÜÇ ADIM",
      subhead: "Notu kutuya koymadan önce üç soru vardır.",
      bullets: ["Onaylı araç", "Veri sınıfı", "Aktarım yolu"],
      fileName: "Bolge_Notu.xlsx",
      sheetName: "Üç soru",
      table: stepsTable("Soru", [
        ["1", "Şirketin onayladığı araç"],
        ["2", "Verinin sınıfı"],
        ["3", "Aktarım yolu"],
      ]),
    },
    {
      headline: "HAM NOT",
      subhead: "Dört satır masada. Son satır ad ve telefon taşır.",
      bullets: ["120 sipariş", "80 sipariş", "Satır eksik", "Ad kutuda durmasın"],
      fileName: "Bolge_Notu.xlsx",
      sheetName: "Ham not",
      table: L1_RAW,
    },
    {
      headline: "ADI ÇIKAR",
      subhead: "Maskeli üç satır. Eksik satır sayıya dönmez.",
      bullets: ["Ad çıktı", "Telefon çıktı", "120 ve 80 durur"],
      fileName: "Bolge_Notu.xlsx",
      sheetName: "Maskeli",
      table: L1_MASK,
    },
    {
      headline: "ROL BAŞTA",
      subhead: "İstem aynı kutudadır. Cevap henüz açılmaz.",
      bullets: ["Rol başta", "Tek görev", "Üç madde"],
      fileName: "Bolge_Notu.xlsx",
      sheetName: "İstem",
      table: L1_MASK,
      copilot: { prompt: L1_PROMPT, replyLines: [], hideReply: true },
    },
    {
      headline: "YANLIŞ ÖZET",
      subhead: "Solda güzelce özetle. Sağda kaynak satırla eşleşen üç madde.",
      bullets: ["Uzun metin", "Üç madde", "Karar cümlesi"],
      fileName: "Bolge_Notu.xlsx",
      sheetName: "Doğru",
      table: L1_CLEAN,
      copilot: {
        prompt: L1_PROMPT,
        replyLines: [
          "Marmara, Kaya Un 1 kg, 120 sipariş.",
          "Ege, Kaya Un 1 kg, 80 sipariş.",
          "İç Anadolu satırı eksik.",
          "Karar: toplantıda 120 ve 80 okunur.",
        ],
      },
    },
    {
      headline: "KAYNAĞI KARŞILAŞTIR",
      subhead: "Üç adım. Cevabı 120 ve 80 ile karşılaştır.",
      bullets: ["Onaylı aracı aç", "Adı çıkar", "Dört parçayı yaz"],
      fileName: "Bolge_Notu.xlsx",
      sheetName: "Cep",
      table: L1_CLEAN,
    },
    {
      headline: "MASKELİ NOT",
      subhead: "Maskeli üç satır seç. Gerçek ad, telefon veya IBAN koyma.",
      bullets: ["Dört parçayla yaz", "Cevabı oku", "Kısıtı daralt"],
      fileName: "Bolge_Notu.xlsx",
      sheetName: "Sıra sende",
      table: L1_MASK,
      copilot: { prompt: L1_PROMPT, replyLines: [], hideReply: true },
    },
  ]),
  "01_office_ai_ileri-2": pack("01_office_ai_ileri-2", "Toplantı Notu ve Eylem Listesi", "Toplanti_Notu.xlsx", [
    {
      headline: "EYLEM LİSTESİ",
      subhead: "Eylem listesinde kim, ne ve ne zaman durur. Çakışan saat ayrı satırdadır.",
      bullets: ["Kim", "Ne", "Ne zaman"],
      fileName: "Toplanti_Notu.xlsx",
      sheetName: "Hatırlatma",
      table: {
        headers: ["Parça", "Bu derste"],
        rows: [
          ["Kim", "Notta yoksa sahip yazılmaz"],
          ["Ne", "Kaya Un sevkiyatı"],
          ["Ne zaman", "Perşembe 10:00–10:30"],
          ["Çakışma", "Ayrı satır"],
        ],
      },
    },
    {
      headline: "ÜÇ ADIM",
      subhead: "İki davet aynı Perşembe 10:00'ı tutmuş.",
      bullets: ["Marmara deposu", "Ege deposu", "Aynı saat"],
      fileName: "Toplanti_Notu.xlsx",
      sheetName: "İki davet",
      table: {
        headers: ["Davet", "Saat"],
        rows: [
          ["Marmara deposu", "Perşembe 10:00–10:30"],
          ["Ege deposu", "Perşembe 10:00–10:30"],
        ],
        note: "Takvime henüz yazma.",
      },
    },
    {
      headline: "İKİ DAVET",
      subhead: "Ham not ad ve telefon taşır. Hangi Perşembe yazılmamış.",
      bullets: ["Aynı 10:00", "Sahip yok", "Ad kutuda durmasın"],
      fileName: "Toplanti_Notu.xlsx",
      sheetName: "Ham not",
      table: L2_RAW,
    },
    {
      headline: "ADI ÇIKAR",
      subhead: "Depo adı ve saat kalır. Ad ve telefon çıkar.",
      bullets: ["Ad çıktı", "Tarih uydurma", "Saat uydurma"],
      fileName: "Toplanti_Notu.xlsx",
      sheetName: "Maskeli",
      table: L2_MASK,
    },
    {
      headline: "ÇAKIŞMAYI İŞARETLE",
      subhead: "Tek görev: eylem listesi ve çakışma satırı. Takvim ayrı istemdir.",
      bullets: ["Rol başta", "Çakışma ayrı satır", "Takvime yazma"],
      fileName: "Toplanti_Notu.xlsx",
      sheetName: "İstem",
      table: L2_MASK,
      copilot: { prompt: L2_PROMPT, replyLines: [], hideReply: true },
    },
    {
      headline: "ÇAKIŞAN SAAT",
      subhead: "Solda tek randevu. Sağda çakışma ayrı satırda.",
      bullets: ["Tek randevu yanlış", "İki satır ayrı", "Yeni saat yok"],
      fileName: "Toplanti_Notu.xlsx",
      sheetName: "Doğru",
      table: L2_CLEAN,
      copilot: {
        prompt: L2_PROMPT,
        replyLines: [
          "Marmara deposu, Perşembe 10:00–10:30. Sahip yok.",
          "Ege deposu, Perşembe 10:00–10:30. Sahip yok.",
          "Çakışma: iki davet aynı saati tutuyor.",
        ],
      },
    },
    {
      headline: "SAATİ AYIR",
      subhead: "Çakışan saati ayrı satırda ara. Cevabı nottaki saatlerle karşılaştır.",
      bullets: ["Onaylı takvim", "Adı çıkar", "Çakışmayı ara"],
      fileName: "Toplanti_Notu.xlsx",
      sheetName: "Cep",
      table: L2_CLEAN,
    },
    {
      headline: "KENDİ TOPLANTIN",
      subhead: "Maskeli bir toplantı notu seç. Gerçek ad veya telefon koyma.",
      bullets: ["Dört parçayla yaz", "Çakışmayı işaretle", "Tarih uydurma"],
      fileName: "Toplanti_Notu.xlsx",
      sheetName: "Sıra sende",
      table: L2_MASK,
      copilot: { prompt: L2_PROMPT, replyLines: [], hideReply: true },
    },
  ]),
  "01_office_ai_ileri-3": pack("01_office_ai_ileri-3", "Excel Formül ve Grafik", "Bolge_Adet.xlsx", [
    {
      headline: "FORMÜLÜ KİLİTLE",
      subhead: "Toplam hücreye formülle kilitlenir. Düz sayı masaya konmaz.",
      bullets: ["B4 boş", "TOPLA", "Grafik hücreden"],
      fileName: "Bolge_Adet.xlsx",
      sheetName: "Hatırlatma",
      formulaBar: "B4",
      table: {
        headers: ["Hücre", "Şimdi"],
        rows: [
          ["A1", "Bölge"],
          ["B1", "Adet"],
          ["B2", "120"],
          ["B4", "boş"],
        ],
      },
    },
    {
      headline: "ÜÇ ADIM",
      subhead: "Tablo iş hesabında. Yüzde isteme. Toplamı düz sayı yazma.",
      bullets: ["Marmara 120", "Ege 80", "B4 boş"],
      fileName: "Bolge_Adet.xlsx",
      sheetName: "Tablo",
      formulaBar: "",
      highlightCell: "B4",
      table: L3_MASK,
    },
    {
      headline: "BOŞ HÜCRE",
      subhead: "Sayfanın altında ad ve IBAN durur. Onlar formül satırı değildir.",
      bullets: ["B4 boş", "IBAN çıkar", "Üçüncü dilim yok"],
      fileName: "Bolge_Adet.xlsx",
      sheetName: "Ham tablo",
      formulaBar: "",
      highlightCell: "B4",
      table: L3_RAW,
    },
    {
      headline: "IBAN ÇIKAR",
      subhead: "Bölge ve adet kalır. B4 hâlâ boştur.",
      bullets: ["Ad çıktı", "IBAN çıktı", "Boş hücre durur"],
      fileName: "Bolge_Adet.xlsx",
      sheetName: "Maskeli",
      formulaBar: "",
      highlightCell: "B4",
      table: L3_MASK,
    },
    {
      headline: "FORMÜLÜ YAZ",
      subhead: "İstem formül taslağı ister. Hücreye sen yazarsın.",
      bullets: ["Hücre", "Formül", "Grafik aralığı"],
      fileName: "Bolge_Adet.xlsx",
      sheetName: "İstem",
      formulaBar: "",
      highlightCell: "B4",
      table: L3_MASK,
      copilot: { prompt: L3_PROMPT, replyLines: [], hideReply: true },
    },
    {
      headline: "DÜZ SAYI",
      subhead: "Solda düz 250. Sağda =TOPLA(B2:B3).",
      bullets: ["Düz sayı yanlış", "Formül kilit", "İki sütun"],
      fileName: "Bolge_Adet.xlsx",
      sheetName: "Kilit",
      formulaBar: "=TOPLA(B2:B3)",
      highlightCell: "B4",
      table: L3_CLEAN,
      copilot: {
        prompt: L3_PROMPT,
        replyLines: ["Formül B4 hücresine yazılır.", "Formül =TOPLA(B2:B3).", "Grafik A2:B3 hücrelerini okur."],
      },
    },
    {
      headline: "HÜCREYİ KONTROL ET",
      subhead: "Hücre 200 göstermeden grafik seçme.",
      bullets: ["Onaylı tablo", "IBAN'ı çıkar", "Formülü B4'e yaz"],
      fileName: "Bolge_Adet.xlsx",
      sheetName: "Cep",
      formulaBar: "=TOPLA(B2:B3)",
      highlightCell: "B4",
      table: L3_CLEAN,
    },
    {
      headline: "KENDİ TABLON",
      subhead: "Toplam hücresini boş bırak. F2 ile formülü gör.",
      bullets: ["İki adedi topla", "Hücre aynı sayıyı göstermeli", "Üçüncü dilim yok"],
      fileName: "Bolge_Adet.xlsx",
      sheetName: "Sıra sende",
      formulaBar: "",
      highlightCell: "B4",
      table: L3_MASK,
      copilot: { prompt: L3_PROMPT, replyLines: [], hideReply: true },
    },
  ]),
  "01_office_ai_ileri-4": pack("01_office_ai_ileri-4", "Uzun Belge ve Sayfa Kontrolü", "Sozlesme_Madde.xlsx", [
    {
      headline: "SAYFA KONTROLÜ",
      subhead: "Dört iş: ödeme günü, gecikme, fesih, gizlilik. Her satırın sayfası vardır.",
      bullets: ["Sayfa 4", "Sayfa 7", "Sayfa 11", "Sayfa 18"],
      fileName: "Sozlesme_Madde.xlsx",
      sheetName: "Dört iş",
      table: L4_MASK,
    },
    {
      headline: "ÜÇ ADIM",
      subhead: "Yirmi sayfa. Dosya 20. sayfada biter. 22. sayfa yoktur.",
      bullets: ["Sayfa 2 dışarıda", "Tam analiz yok", "Atlanan madde"],
      fileName: "Sozlesme_Madde.xlsx",
      sheetName: "Belge",
      table: {
        headers: ["Sınır", "Değer"],
        rows: [
          ["Son sayfa", "20"],
          ["22. sayfa", "yok"],
          ["Sayfa 2", "kimlik, dışarıda"],
        ],
      },
    },
    {
      headline: "UZUN BELGE",
      subhead: "Sayfa 2 taraf satırıdır. İş maddeleri 4, 7, 11 ve 18. sayfadadır.",
      bullets: ["30 gün", "yüzde 2", "15 gün", "2 yıl"],
      fileName: "Sozlesme_Madde.xlsx",
      sheetName: "Ham belge",
      table: L4_RAW,
    },
    {
      headline: "KİMLİĞİ ÇIKAR",
      subhead: "Dört iş adlandırılır. Taraf adı, kimlik ve IBAN gitmez.",
      bullets: ["Sayfa 2 çıktı", "Dört iş durur", "Cümle sayfadan"],
      fileName: "Sozlesme_Madde.xlsx",
      sheetName: "Maskeli",
      table: L4_MASK,
    },
    {
      headline: "SAYFAYI YAZ",
      subhead: "Her satırda işin adı, sayfa numarası ve tek cümle.",
      bullets: ["Dört satır", "Yoksa bu belgede yok", "Tam analiz yok"],
      fileName: "Sozlesme_Madde.xlsx",
      sheetName: "İstem",
      table: L4_MASK,
      copilot: { prompt: L4_PROMPT, replyLines: [], hideReply: true },
    },
    {
      headline: "ATLANAN MADDE",
      subhead: "Solda tam analiz. Sağda sayfa satırı.",
      bullets: ["Yüzde 10 yanlış", "Sayfa 22 yok", "15 gün durur"],
      fileName: "Sozlesme_Madde.xlsx",
      sheetName: "Sayfa satırı",
      table: L4_CLEAN,
      copilot: {
        prompt: L4_PROMPT,
        replyLines: ["Ödeme, sayfa 4, 30 gün.", "Gecikme, sayfa 7, yüzde 2.", "Fesih, sayfa 11, 15 gün.", "Gizlilik, sayfa 18, 2 yıl."],
      },
    },
    {
      headline: "SAYFAYI DENETLE",
      subhead: "Her satırın sayfasını aç. Görmeden yazma.",
      bullets: ["Onaylı belge", "Kimliği çıkar", "Sayfayı aç"],
      fileName: "Sozlesme_Madde.xlsx",
      sheetName: "Cep",
      table: L4_CLEAN,
    },
    {
      headline: "KENDİ BELGEN",
      subhead: "Dört maddeyi sayfa numarasıyla çıkar. 22. sayfayı sil.",
      bullets: ["Sayfayı aç", "Uydurma oranı sil", "Kimliği yazma"],
      fileName: "Sozlesme_Madde.xlsx",
      sheetName: "Sıra sende",
      table: L4_MASK,
      copilot: { prompt: L4_PROMPT, replyLines: [], hideReply: true },
    },
  ]),
  "01_office_ai_ileri-5": pack("01_office_ai_ileri-5", "E-Posta Sınıflandırma", "Is_Postasi.xlsx", [
    {
      headline: "POSTAYI AYIR",
      subhead: "Bir postada üç iş varsa her iş ayrı satırdır. Taslak gönderilmez.",
      bullets: ["Bilgi", "Şikayet", "Kişisel veri talebi"],
      fileName: "Is_Postasi.xlsx",
      sheetName: "Üç sınıf",
      table: {
        headers: ["Sınıf", "Kural"],
        rows: [
          ["Bilgi", "Yalnız stok notundan"],
          ["Şikayet", "Tazminat yazılmaz"],
          ["Kişisel veri", "Kimlik taslağa girmez"],
        ],
      },
    },
    {
      headline: "ÜÇ ADIM",
      subhead: "Konu: Kaya Un, gecikme ve hesap. Gönder düğmesine basma.",
      bullets: ["Stok sorusu", "2 gün gecikme", "Kimlik talebi"],
      fileName: "Is_Postasi.xlsx",
      sheetName: "Posta",
      table: {
        headers: ["İş", "Sınıf"],
        rows: [
          ["Stok var mı", "Bilgi"],
          ["2 gün geç kaldı", "Şikayet"],
          ["Kimliği doğrula", "Kişisel veri talebi"],
        ],
      },
    },
    {
      headline: "KARIŞIK POSTA",
      subhead: "Ham gövde ad, telefon, IBAN ve kimlik taşır.",
      bullets: ["120 koli", "2 gün", "Kimlik çıkar"],
      fileName: "Is_Postasi.xlsx",
      sheetName: "Ham posta",
      table: L5_RAW,
    },
    {
      headline: "KİMLİĞİ ÇIKAR",
      subhead: "Üç iş kalır. Kimlik metni kalmaz.",
      bullets: ["120 koli", "Tazminat yok", "Ad yok"],
      fileName: "Is_Postasi.xlsx",
      sheetName: "Maskeli",
      table: L5_MASK,
    },
    {
      headline: "SINIFI AYIR",
      subhead: "Tek görev: sınıf satırı ve taslak cümlesi. Göndermek ayrı iştir.",
      bullets: ["Üç satır", "Tek paragraf yok", "Gönderildi yok"],
      fileName: "Is_Postasi.xlsx",
      sheetName: "İstem",
      table: L5_MASK,
      copilot: { prompt: L5_PROMPT, replyLines: [], hideReply: true },
    },
    {
      headline: "TASLAK SATIRI",
      subhead: "Solda nazik paragraf. Sağda üç sınıf satırı.",
      bullets: ["200 koli yanlış", "yüzde 10 yok", "Gönderildi yok"],
      fileName: "Is_Postasi.xlsx",
      sheetName: "Üç satır",
      table: L5_CLEAN,
      copilot: {
        prompt: L5_PROMPT,
        replyLines: ["Bilgi: stok notu 120 kolidir.", "Şikayet: 2 gün geç kaldı. Tazminat yok.", "Kişisel veri: talebiniz alındı. Kayıt birimine iletildi."],
      },
    },
    {
      headline: "TASLAĞI TUT",
      subhead: "Taslağı kural kartıyla karşılaştır. Düğmeye basma.",
      bullets: ["Onaylı posta", "Kimliği çıkar", "Kurala bak"],
      fileName: "Is_Postasi.xlsx",
      sheetName: "Cep",
      table: L5_CLEAN,
    },
    {
      headline: "KENDİ POSTAN",
      subhead: "Karmaşık bir iş postasını üç sınıfa ayır. Taslağı gönderme.",
      bullets: ["Üç satır", "120 dışında sayı yok", "Gönderildi yok"],
      fileName: "Is_Postasi.xlsx",
      sheetName: "Sıra sende",
      table: L5_MASK,
      copilot: { prompt: L5_PROMPT, replyLines: [], hideReply: true },
    },
  ]),
  "01_office_ai_ileri-6": pack("01_office_ai_ileri-6", "Üç Dosyada Sayı Denetimi", "Uc_Dosya.xlsx", [
    {
      headline: "YAN YANA SAYI",
      subhead: "Tablo, yazılı not ve uzun belge yan yana durur. Uyuşmayan sayı nota girmez.",
      bullets: ["Tablo 200", "Not 230", "Sayfa 30 gün"],
      fileName: "Uc_Dosya.xlsx",
      sheetName: "Üç dosya",
      table: {
        headers: ["Dosya", "Tutan sayı"],
        rows: [
          ["Tablo", "120, 80, toplam 200"],
          ["Yazılı not", "ayrı sayfa"],
          ["Uzun belge", "30 gün, yüzde 2"],
        ],
      },
    },
    {
      headline: "ÜÇ ADIM",
      subhead: "Dört karşılaştırma: Marmara, toplam, ödeme günü, gecikme.",
      bullets: ["120", "200", "30 gün", "yüzde 2"],
      fileName: "Uc_Dosya.xlsx",
      sheetName: "Dört satır",
      table: stepsTable("Karşılaştırma", [
        ["1", "Marmara adedi"],
        ["2", "Toplam"],
        ["3", "Ödeme günü"],
        ["4", "Gecikme oranı"],
      ]),
    },
    {
      headline: "ÜÇ DOSYA",
      subhead: "Yazılı not 150, 230, 45 gün ve yüzde 10 der. Tablo ve sayfa başka sayı der.",
      bullets: ["B2 120", "Not 150", "Ad çıkar"],
      fileName: "Uc_Dosya.xlsx",
      sheetName: "Ham dosya",
      formulaBar: "=TOPLA(B2:B3)",
      table: L6_RAW,
    },
    {
      headline: "ADI ÇIKAR",
      subhead: "Dört satır yan yana. Orta sayı henüz yoktur.",
      bullets: ["Ad çıktı", "Sayfa 2 çıktı", "135 yok"],
      fileName: "Uc_Dosya.xlsx",
      sheetName: "Maskeli",
      table: L6_MASK,
    },
    {
      headline: "YAN YANA BAK",
      subhead: "İstem uyuşmayan sayıyı işaretler. Uzlaştırma ayrı iştir.",
      bullets: ["Dört satır", "Orta alma", "Karar cümlesi"],
      fileName: "Uc_Dosya.xlsx",
      sheetName: "İstem",
      table: L6_MASK,
      copilot: { prompt: L6_PROMPT, replyLines: [], hideReply: true },
    },
    {
      headline: "UYUŞMAYAN SAYI",
      subhead: "Solda orta sayı. Sağda tablo ve sayfayla eşleşen satır.",
      bullets: ["135 yok", "230 uyuşmuyor", "30 gün durur"],
      fileName: "Uc_Dosya.xlsx",
      sheetName: "Uyuşan",
      formulaBar: "=TOPLA(B2:B3)",
      table: L6_CLEAN,
      copilot: {
        prompt: L6_PROMPT,
        replyLines: ["Marmara 120. 150 uyuşmuyor.", "Toplam 200. 230 uyuşmuyor.", "Ödeme 30 gün. Gecikme yüzde 2."],
      },
    },
    {
      headline: "UYUŞMAYANI YAZMA",
      subhead: "Uyuşmayan sayıyı karar notuna yazma.",
      bullets: ["Onaylı aracı aç", "Kimliği çıkar", "Uyuşmayanı yazma"],
      fileName: "Uc_Dosya.xlsx",
      sheetName: "Cep",
      table: L6_CLEAN,
    },
    {
      headline: "ÜÇ DOSYAYI SEÇ",
      subhead: "Üç dosyayı yan yana denetle. İki sayının ortasını alma.",
      bullets: ["B2'ye bak", "Sayfa 4'ü aç", "Sayfa 7'yi aç"],
      fileName: "Uc_Dosya.xlsx",
      sheetName: "Sıra sende",
      table: L6_MASK,
      copilot: { prompt: L6_PROMPT, replyLines: [], hideReply: true },
    },
  ]),
};

export type Off201ExampleTableKey = "raw" | "mask" | "clean";

const EXAMPLE_TABLES: Record<
  AcademyBusinessAiLessonKey,
  Record<Off201ExampleTableKey, Table>
> = {
  "01_office_ai_ileri-1": { raw: L1_RAW, mask: L1_MASK, clean: L1_CLEAN },
  "01_office_ai_ileri-2": { raw: L2_RAW, mask: L2_MASK, clean: L2_CLEAN },
  "01_office_ai_ileri-3": { raw: L3_RAW, mask: L3_MASK, clean: L3_CLEAN },
  "01_office_ai_ileri-4": { raw: L4_RAW, mask: L4_MASK, clean: L4_CLEAN },
  "01_office_ai_ileri-5": { raw: L5_RAW, mask: L5_MASK, clean: L5_CLEAN },
  "01_office_ai_ileri-6": { raw: L6_RAW, mask: L6_MASK, clean: L6_CLEAN },
};

export function off201ExampleTable(
  lessonKey: string,
  key: Off201ExampleTableKey,
): Table | null {
  const lesson = EXAMPLE_TABLES[lessonKey.trim() as AcademyBusinessAiLessonKey];
  return lesson?.[key] ?? null;
}

export function loadOff201CinemaCueSlides(lessonKey: string): readonly AcademyCinemaCueSlide[] | null {
  const key = lessonKey.trim();
  if (!(ACADEMY_BUSINESS_AI_LESSON_KEYS as readonly string[]).includes(key)) {
    return null;
  }
  return SLIDES[key as AcademyBusinessAiLessonKey] ?? null;
}
