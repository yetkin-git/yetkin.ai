/**
 * Excel ve Yapay Zekâ Destekli Veri Analizi Masterclass (EXC-MC) — mühürlü müfredat.
 * PEDAGOJI.md: tekil Masterclass, 4 perde, tek eğitmen, Fail-Closed.
 * Denetim: formül mantığı Fail-closed; boş aralık ortalama uydurmaz, XLOOKUP tam eşleşme.
 */

import type { AcademyExamQuestion } from "@/lib/academy/types";
import {
  academyFiveActLessonDraft,
  dialogueTurn,
  type AcademyLessonDraft,
} from "@/lib/academy/curricula/types";

function mcq(
  id: string,
  prompt: string,
  choices: readonly [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
): AcademyExamQuestion {
  return { id, prompt, choices: [...choices], correctIndex };
}

const tarik = (text: string, code?: { language: string; source: string }) =>
  dialogueTurn("tarik", text, code);
const gozde = (text: string, code?: { language: string; source: string }) =>
  dialogueTurn("gozde", text, code);

export const EXCEL_MASTERCLASS_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "excel-masterclass-1",
    order: 1,
    title: "Excel Mantığı ve Veri Giriş Mimarisi: Hücreler, Biçimlendirme ve Temel Formüller",
    dialogue: {
      warmup: [
        tarik(
          "Sen saatlerce deftere satır satır topladın mı? Akşam raporu yine yanlış çıkar. Tek tıkla otomatikleşen tartı var mı, yoksa hâlâ kalem mi?",
        ),
        gozde(
          "Var. Hücre o defter kutusudur: adres, değer, biçim ayrı durur. TOPLA (SUM), ORTALAMA (AVERAGE), SAY (COUNT) tartı formülüdür. Fail-closed (Hata Anında Kapalı): boş aralıkta ortalama uydurulmaz; n yazılmadan sonuç basılmaz.",
        ),
      ],
      problem: [
        tarik("Şirket bütçesi SUM ile yeşil duruyor. Bir hücre metin, biri boş. Ekran yine doğru mu?"),
        gozde(
          "Yanlış. SUM metni yutar, boşluğu sıfır sayar; AVERAGE boşluğu atlar, COUNT yalnız sayıyı sayar. Üçü karışınca bütçe yalan söyler. Fail-closed: n sıfırsa ortalama durur, «sıfır kâr» basılmaz.",
        ),
      ],
      development: [
        tarik("Tartıyı yaz. Boş diziyle AVERAGE kır."),
        gozde(
          "Hücre değeri sayı değilse SUM onu atlar; sen onu sıfır sanırsan bütçe şişer. n yoksa AVERAGE işlemi durur. Biçim para birimidir, değer kuruş tamsayıdır; float lira defteri bozar.",
          {
            language: "ts",
            source: `function excelSay(degerler: readonly unknown[]): number {
  return degerler.filter((v) => typeof v === "number" && Number.isFinite(v)).length;
}
function excelOrtalama(degerler: readonly unknown[]): number {
  const n = excelSay(degerler);
  if (n === 0) throw new Error("n yok; ortalama durur");
  const toplam = degerler.reduce<number>((s, v) => (typeof v === "number" ? s + v : s), 0);
  return toplam / n;
}
if (excelOrtalama([10, 20, "", null]) !== 15) throw new Error("sözleşme kırıldı");`,
          },
        ),
        tarik("Boş sütunu «ortalama sıfır» diye basarsak?"),
        gozde(
          "Sıfır kâr yalandır. Fail-closed n=0 kaydı reddeder. Defterde adres, değer, biçim ayrı durur; birini «ortalama» diye boyamak bütçeyi açmaz, kapatır.",
        ),
      ],
      conclusion: [
        tarik("Kafamda oturdu: hücre kutu, SUM tartı, boş aralık ortalama basmaz. Sonraki adım?"),
        gozde(
          "Tartı durunca arama kapısına geçeriz. Bir sonraki bölümde seni EĞER (IF), DÜŞEYARA (VLOOKUP) ve ÇAPRAZARA (XLOOKUP) bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_exc1_1",
        "SAY (COUNT) neyi sayar?",
        ["Her dolu hücreyi", "Yalnız sayı değerini; metin ve boşluk düşer", "Yalnız boşluğu", "Biçim rengini"],
        1,
      ),
      mcq(
        "q_exc1_2",
        "Fail-closed n=0 iken ORTALAMA (AVERAGE) ne yapar?",
        ["Sıfır kâr basar", "İşlemi durdurur; ortalama uydurmaz", "SUM’u kopyalar", "Metni 0 sayar"],
        1,
      ),
      mcq(
        "q_exc1_3",
        "Hücrede biçim ile değer farkı nedir?",
        ["Aynıdır", "Biçim görünen etiket, değer hesaplanan sayıdır", "Yalnız renk", "Yalnız formül çubuğu"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "excel-masterclass-2",
    order: 2,
    title: "Mantıksal ve Arama Formülleri: IF, AND/OR, DÜŞEYARA ve ÇAPRAZARA",
    dialogue: {
      warmup: [
        tarik(
          "Depoda etiket solda, fiyat sağda. Sen fiyatı soldan okumak isterken rafta yalnız sağa bakmak zorunda mısın?",
        ),
        gozde(
          "Eski DÜŞEYARA (VLOOKUP) sağa bakmak zorundadır. ÇAPRAZARA (XLOOKUP) iki yöne bakar. EĞER (IF), VE (AND), VEYA (OR) kapı cümlesidir. Fail-closed: tam eşleşme yoksa «benzer SKU» uydurulmaz.",
        ),
      ],
      problem: [
        tarik("VLOOKUP varsayılanı yaklaşık eşleşme. SKU listesi sırasız. Bütçe nasıl patlar?"),
        gozde(
          "Yaklaşık eşleşme (range_lookup TRUE) sırasız kodda komşu SKU’yu fiyatlar. Ekran yeşil, fatura yalan. XLOOKUP varsayılanı tam eşleşmedir; yoksa if_not_found veya hata durur. Fail-closed: anahtar boşsa arama durur.",
        ),
      ],
      development: [
        tarik("XLOOKUP’u yaz. Boş anahtar ve kayıp SKU’yu bir kez kır."),
        gozde(
          "VLOOKUP dördüncü argüman FALSE ister; unutursan yaklaşık eşleşme açılır. XLOOKUP o tuzağı varsayılan kapalı tutar. VE/VEYA kapıyı daraltır: ikisi de doğru değilse EĞER yalan dala düşmez.",
          {
            language: "ts",
            source: `function caprazAra(anahtar: string, kodlar: readonly string[], fiyatlar: readonly number[]): number {
  const k = anahtar.trim();
  if (!k) throw new Error("anahtar yok; arama durur");
  const i = kodlar.findIndex((c) => c === k);
  if (i < 0) throw new Error("tam eşleşme yok; fiyat uydurulmaz");
  const fiyat = fiyatlar[i];
  if (fiyat === undefined) throw new Error("sütun kırık; işlem durur");
  return fiyat;
}
if (caprazAra("A-12", ["A-12", "B-09"], [40, 90]) !== 40) throw new Error("sözleşme kırıldı");`,
          },
        ),
        tarik("«A-1» yokken «A-10»yu yakın diye basarsak?"),
        gozde(
          "Yakın SKU fatura değildir. Fail-closed tam eşleşme yoksa durur. XLOOKUP sola da bakar; VLOOKUP o kapıyı açmaz.",
        ),
      ],
      conclusion: [
        tarik("Tam eşleşme, boş anahtar yok, XLOOKUP iki yön. Sonraki adım özet mi?"),
        gozde(
          "Arama durunca özet kapısına geçeriz. Bir sonraki bölümde seni Özet Tablo (Pivot Table) ve Dilimleyici (Slicer) bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_exc2_1",
        "DÜŞEYARA (VLOOKUP) varsayılan eşleşmesi nedir?",
        ["Tam eşleşme", "Yaklaşık eşleşme; sırasız SKU’da yanlış fiyat basar", "Sola bakış", "XLOOKUP ile aynı"],
        1,
      ),
      mcq(
        "q_exc2_2",
        "Fail-closed anahtar boşken ÇAPRAZARA (XLOOKUP) ne yapar?",
        ["İlk satırı basar", "İşlemi durdurur; fiyat uydurmaz", "Yaklaşık SKU seçer", "VLOOKUP’a düşer"],
        1,
      ),
      mcq(
        "q_exc2_3",
        "XLOOKUP, VLOOKUP’tan hangi kapıyı açar?",
        ["Yalnız SUM", "Sola bakış ve varsayılan tam eşleşme", "Makro imzası", "Pivot önbelleği"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "excel-masterclass-3",
    order: 3,
    title: "Dinamik Veri Özetleme: Özet Tablo (Pivot Table) ve Dilimleyiciler (Slicers)",
    dialogue: {
      warmup: [
        tarik(
          "Yüz satır faturayı gece gece elle grupladın mı? Sabah müdür «bölge kırılımı» der, sen yine kopyala-yapıştır mı yaparsın?",
        ),
        gozde(
          "Özet Tablo (Pivot Table) o gruplama makinesidir. Dilimleyici (Slicer) makineye tıklanan filtredir. Fail-closed: fatura numarasını TOPLA diye çekmek yalandır; sayı kimliği toplanmaz, SAY ile sayılır.",
        ),
      ],
      problem: [
        tarik("Pivot’ta FaturaNo SUM alanında. Toplam 4 milyon. Ekran yeşil. Bu neyin toplamı?"),
        gozde(
          "Kimlik toplamıdır, ciro değil. Değer alanında tutar SUM, adet COUNT durur. Kaynak büyüyünce yenilemeden eski önbellek konuşur. Fail-closed: alan türü boşsa özet basılmaz.",
        ),
      ],
      development: [
        tarik("Özeti yaz. Kimlik SUM’unu bir kez kır."),
        gozde(
          "Pivot kaynak tablo ister, rastgele boyalı aralık değil. Dilimleyici o önbelleği keser; kaynak dışı sütunu dilimlemez. Yenileme yoksa dünkü defter bugünkü rapor olur.",
          {
            language: "ts",
            source: `type OzetAlan = "topla" | "say";
function pivotDeger(alan: OzetAlan, degerler: readonly number[]): number {
  if (degerler.length === 0) throw new Error("kaynak yok; özet durur");
  if (alan === "say") return degerler.length;
  return degerler.reduce((s, v) => s + v, 0);
}
function faturaKimligiToplanmaz(etiket: string): OzetAlan {
  if (!etiket.trim()) throw new Error("alan yok; özet durur");
  if (/no|id|kod/i.test(etiket)) return "say";
  return "topla";
}
if (pivotDeger(faturaKimligiToplanmaz("FaturaNo"), [101, 102]) !== 2) {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("Dilimleyici kaynakta olmayan «bölge»yi açarsa?"),
        gozde(
          "Hayalet dilim raporu kirletir. Fail-closed sütun yoksa dilim durur. Özet, kaynakla aynı defterdir.",
        ),
      ],
      conclusion: [
        tarik("Kimlik SAY, tutar SUM, dilim kaynakta. Sonraki adım kirli veri mi?"),
        gozde(
          "Özet durunca temizlik kapısına ineriz. Bir sonraki bölümde seni yinelenen, metni sütuna ve koşullu biçim bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_exc3_1",
        "Fatura numarasını Özet Tablo’da TOPLA etmek?",
        ["Ciroyu verir", "Yasaktır; kimlik SAY ile sayılır", "Dilimleyici düzeltir", "XLOOKUP yeter"],
        1,
      ),
      mcq(
        "q_exc3_2",
        "Fail-closed kaynak sütunu yokken dilimleyici ne yapar?",
        ["Hayalet dilim açar", "İşlemi durdurur; özet basılmaz", "İlk sütunu kullanır", "SUM uydurur"],
        1,
      ),
      mcq(
        "q_exc3_3",
        "Kaynak büyüyünce pivot ne ister?",
        ["Eski önbellek yeter", "Yenileme; dünkü defter bugünkü rapor olmaz", "Yalnız renk", "Makro imzası"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "excel-masterclass-4",
    order: 4,
    title: "Veri Temizleme ve Dönüştürme: Yinelenen, Metni Sütunlara ve Koşullu Biçimlendirme",
    dialogue: {
      warmup: [
        tarik(
          "Aynı müşteri üç satırda, telefon «0532 111» ve «0532111» ayrı kişi. Sen bu defteri müdüre nasıl uzatırsın?",
        ),
        gozde(
          "Uzamazsın. Yinelenenleri Kaldır anahtar sütunu ister. Metni Sütunlara Dönüştür ayırıcıyı yazar. Koşullu biçim eşik cümlesidir, süs boyası değil. Fail-closed: anahtar boşsa silme durur; «N/A» sıfır sayılmaz.",
        ),
      ],
      problem: [
        tarik("Kirli satış setinde boş SKU, çift fatura, «yok» yazısı. Pivot yine ciro basar mı?"),
        gozde(
          "Basarsa yalandır. «yok» metindir, SUM onu atlar, sen sıfır sanırsın. Çift fatura ciroyu ikiye katlar. Fail-closed: boş anahtar veya metin tutar kayıt düşer, özet ondan sonra durur.",
        ),
      ],
      development: [
        tarik("Temizleyiciyi yaz. «N/A» ve boş anahtarı kır."),
        gozde(
          "Yinelenen fatura+satır anahtarıyla düşer. Ayırıcı yoksa metin sütuna bölünmez. Koşullu biçim formülü eşik ister; «kırmızı güzel» kural değildir.",
          {
            language: "ts",
            source: `function tutarOku(ham: unknown): number {
  if (typeof ham === "number" && Number.isFinite(ham)) return ham;
  const t = String(ham ?? "").trim();
  if (!t || /^n\\/?a|yok$/i.test(t)) throw new Error("tutar yok; kayıt düşer");
  const n = Number(t.replace(",", "."));
  if (!Number.isFinite(n)) throw new Error("tutar yok; kayıt düşer");
  return n;
}
function yinelenenDus(anahtarlar: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of anahtarlar) {
    const k = raw.trim();
    if (!k) throw new Error("anahtar yok; silme durur");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}
if (yinelenenDus(["F-1", "F-1", "F-2"]).join(",") !== "F-1,F-2") throw new Error("sözleşme kırıldı");`,
          },
        ),
        tarik("«N/A»yı sıfır kabul edip SUM’a katarsak?"),
        gozde(
          "Eksik satır kâr gibi görünür. Fail-closed metin tutarı reddeder. Temizlik bitmeden pivot basılmaz.",
        ),
      ],
      conclusion: [
        tarik("Anahtar, ayırıcı, eşik. Sonraki adım yapay zekâ formül mü?"),
        gozde(
          "Defter temiz durunca otomasyon kapısına geçeriz. Bir sonraki bölümde seni ChatGPT/Copilot formül disiplini ve makro/VBA mimarisi bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_exc4_1",
        "Yinelenenleri kaldırmadan önce ne yazılır?",
        ["Renk", "Anahtar sütun; boş anahtarda silme durur", "Yalnız ilk sütun", "Makro adı"],
        1,
      ),
      mcq(
        "q_exc4_2",
        "Fail-closed «N/A» tutarı ne yapar?",
        ["Sıfır sayar", "Kaydı düşürür; SUM’a katmaz", "AVERAGE’a 0 basar", "Pivot düzeltir"],
        1,
      ),
      mcq(
        "q_exc4_3",
        "Koşullu biçim bu derste nedir?",
        ["Süs paleti", "Eşik cümlesi; kural yoksa boya durur", "XLOOKUP yerine geçer", "Dilimleyici"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "excel-masterclass-5",
    order: 5,
    title: "Yapay Zekâ İle Excel Otomasyonu: ChatGPT/Copilot Formül Yazma ve Makro/VBA",
    dialogue: {
      warmup: [
        tarik(
          "Copilot «şu formülü yaz» deyince sen yapıştırıp müdüre mi uzatırsın? Makro da «çalıştır» diye geliyor. Kapı açık mı?",
        ),
        gozde(
          "Açık değildir. ChatGPT/Copilot taslak üretir, tartı senindir. Visual Basic for Applications (VBA) imzasız makro defteri açmaz. Fail-closed: müşteri satırı tarife yapışmaz; parse edilmeyen formül yapıştırılmaz.",
        ),
      ],
      problem: [
        tarik("Yapıştırılan VLOOKUP yaklaşık eşleşmeli, makro Auto_Open. Ekran yine yeşil. Ne kırılır?"),
        gozde(
          "Yaklaşık eşleşme fiyatı, imzasız makro kapıyı. Fail-closed: formül XLOOKUP tam eşleşme değilse durur. İmza yoksa VBA çalışmaz. Kişisel veri tarife girmez.",
        ),
      ],
      development: [
        tarik("Kapıyı yaz. Ham formül ve imzasız makroyu kır."),
        gozde(
          "Model cümle üretir; sen anahtar, tam eşleşme ve if_not_found sorarsın. VBA güven merkezi imza ister. «Çalıştır da görelim» Fail-closed değildir.",
          {
            language: "ts",
            source: `function formulKabul(metin: string): string {
  const t = metin.trim();
  if (!t.startsWith("=")) throw new Error("formül yok; yapıştırma durur");
  if (/VLOOKUP\\s*\\(/i.test(t) && !/,\\s*FALSE\\s*\\)\\s*$/i.test(t) && !/,\\s*0\\s*\\)\\s*$/i.test(t)) {
    throw new Error("yaklaşık eşleşme; işlem durur");
  }
  return t;
}
function makroCalistir(imzali: boolean): "calisir" {
  if (!imzali) throw new Error("imza yok; makro durur");
  return "calisir";
}
if (formulKabul("=XLOOKUP(A2,kod,fiyat,\\"yok\\")").startsWith("=") !== true) {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("Müşteri listesini ChatGPT’ye yapıştırırsak?"),
        gozde(
          "Tarife kişisel veri girmez. Fail-closed örnek satır uydurulur, gerçek defter modelde durmaz. İmzasız Auto_Open açılmaz.",
        ),
      ],
      conclusion: [
        tarik("Taslak, doğrula, imza. Sonraki adım mini proje mi?"),
        gozde(
          "Kapılar durunca sahaya ineriz. Bir sonraki bölümde seni ham satıştan yönetim dashboard’u bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_exc5_1",
        "Copilot formülü yapıştırmadan önce ne durur?",
        ["Beğeni", "Parse ve tam eşleşme; yaklaşık VLOOKUP düşer", "Makro adı", "Renk"],
        1,
      ),
      mcq(
        "q_exc5_2",
        "Fail-closed imzasız VBA makrosu?",
        ["Auto_Open yeter", "Çalışmaz; işlem durur", "Copilot imza basar", "Pivot gizler"],
        1,
      ),
      mcq(
        "q_exc5_3",
        "Müşteri satırı ChatGPT tarifine girer mi?",
        ["Evet, zorunlu", "Hayır; kişisel veri tarife yapışmaz", "Yalnız telefon", "Makro yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "excel-masterclass-6",
    order: 6,
    title: "Mini Proje: Ham Satış Verisinden Yönetim İçin Dinamik Rapor ve Dashboard",
    dialogue: {
      warmup: [
        tarik(
          "Ham satış defteri duruyor: çift fatura, boş SKU, elle toplanmış ciro. Sen müdüre hangi panoyu uzatırsın?",
        ),
        gozde(
          "Dört kapı durmadan uzatmazsın. Temizlik, XLOOKUP bölge, pivot+dilim, dashboard. Fail-closed bir kapı açıkken teslim basılmaz. Bu iskelet sahte canlı Copilot iddiası taşımaz.",
        ),
      ],
      problem: [
        tarik("Ekranda grafik parlıyor, kaynak kirli. İş bitmiş mi sayılıyor?"),
        gozde(
          "Parıltı yalandır. Yinelenen fatura, boş anahtar, kimlik SUM, yenilenmemiş pivot — biri duruyorsa mühür vurulmaz. Dashboard kaynakla aynı defterdir.",
        ),
      ],
      development: [
        tarik("Tek fonksiyon: satırlar, bölge sözlüğü, alan türü, yenileme. Biri kırıkken dur."),
        gozde(
          "`dashboard` dört kapıyı sırayla sorar. Anahtar boşsa durur. Tutar «N/A» ise durur. Kimlik SUM ise durur. Yenileme yoksa durur. Hepsi durunca «hazir» basılır.",
          {
            language: "ts",
            source: `function dashboard(girdi: {
  anahtarlar: readonly string[];
  tutarlar: readonly unknown[];
  alanEtiket: string;
  alan: "topla" | "say";
  yenilendi: boolean;
}): "hazir" {
  if (girdi.anahtarlar.some((k) => !k.trim())) throw new Error("anahtar yok; işlem durur");
  if (girdi.tutarlar.some((t) => t === "N/A" || t === "")) throw new Error("tutar yok; kayıt düşer");
  if (/no|id|kod/i.test(girdi.alanEtiket) && girdi.alan === "topla") {
    throw new Error("kimlik toplanmaz");
  }
  if (!girdi.yenilendi) throw new Error("önbellek eski; özet durur");
  return "hazir";
}
if (
  dashboard({
    anahtarlar: ["F-1", "F-2"],
    tutarlar: [40, 90],
    alanEtiket: "Ciro",
    alan: "topla",
    yenilendi: true,
  }) !== "hazir"
) {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("Bu iskelet canlı Copilot’a veya gerçek Excel dosyasına bağlı mı? Sınavda ne ölçülür?"),
        gozde(
          "Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Dört kapı: temizlik, tam eşleşme, dürüst özet, yenilenen dashboard.",
        ),
      ],
      conclusion: [
        tarik("Masterclass kapanış bu mu: hücre, XLOOKUP, pivot, temizlik, otomasyon, dashboard, sınava gir?"),
        gozde(
          "Bu. Tekil Masterclass halkası kapanır. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_exc6_1",
        "Mini projedeki dashboard canlı Copilot mudur?",
        ["Evet, zorunlu model", "Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur", "Yalnız VBA", "Canlı dosya"],
        1,
      ),
      mcq(
        "q_exc6_2",
        "Dört kapıdan biri açıkken teslim?",
        ["Yeşil basılır", "Fail-closed; mühür vurulmaz", "Üçü yeter", "Grafik yeter"],
        1,
      ),
      mcq(
        "q_exc6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Pivot açılınca"],
        1,
      ),
    ],
  }),
] as const;

const EXCEL_MASTERCLASS_LESSON_QUIZZES: AcademyExamQuestion[] = EXCEL_MASTERCLASS_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları (30–50 bandı). */
export const EXCEL_MASTERCLASS_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...EXCEL_MASTERCLASS_LESSON_QUIZZES,
  mcq("q_exc_p1", "Hücre bu derste nedir?", ["Renk", "Adres, değer ve biçim kutusu", "Makro", "Dilim"], 1),
  mcq("q_exc_p2", "SUM boşluğu nasıl sayar?", ["Hata", "Sıfır gibi atlar; sen kâr sanırsan yalan", "COUNT ile aynı", "XLOOKUP"], 1),
  mcq("q_exc_p3", "COUNT ile COUNTA farkı?", ["Yok", "COUNT sayı, COUNTA dolu hücre", "İkisi makro", "Pivot düzeltir"], 1),
  mcq("q_exc_p4", "VLOOKUP sola bakar mı?", ["Evet", "Hayır; XLOOKUP iki yöne bakar", "Yalnız FALSE ile", "Dilim ile"], 1),
  mcq("q_exc_p5", "XLOOKUP varsayılan eşleşme?", ["Yaklaşık", "Tam eşleşme", "SUM", "Makro"], 1),
  mcq("q_exc_p6", "IF kapısı ne ister?", ["Renk", "Mantık cümlesi; VE/VEYA daraltır", "Pivot", "VBA"], 1),
  mcq("q_exc_p7", "Pivot kimlik sütunu?", ["SUM", "SAY; kimlik toplanmaz", "AVERAGE", "XLOOKUP"], 1),
  mcq("q_exc_p8", "Dilimleyici neyi keser?", ["DNS", "Pivot önbelleğini; kaynak dışı sütun durur", "Makro imzasını", "TTS"], 1),
  mcq("q_exc_p9", "«N/A» tutar mı?", ["Sıfır", "Hayır; kayıt düşer", "AVERAGE 0", "COUNT 1"], 1),
  mcq("q_exc_p10", "Yinelenen silmede anahtar boşsa?", ["İlk satır silinir", "İşlem durur", "Tümü silinir", "Pivot yeter"], 1),
  mcq("q_exc_p11", "Copilot taslağı kapı mıdır?", ["Evet", "Hayır; parse ve tam eşleşme senindir", "İmza basar", "PII ister"], 1),
  mcq("q_exc_p12", "İmzasız VBA?", ["Auto_Open", "Fail-closed; makro durur", "Copilot imzalar", "Pivot gizler"], 1),
  mcq("q_exc_p13", "Mini proje teslimi ne zaman basılır?", ["Bir kapı yetince", "Dört kapı durunca", "Satın alınca", "Grafik yeşilince"], 1),
  mcq("q_exc_p14", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
];
