/**
 * Canva ve Yapay Zekâ İle Dijital Tasarım Masterclass (CNV-MC) — mühürlü müfredat.
 * PEDAGOJI.md: tekil Masterclass, 5 perde, DialogueTurn[], Gözde %95 / Tarık %100.
 * Üretim: Grok 4.6. Denetim: Gemini 3.7 Flash — kitsiz şablon, PII’li Magic, RGB baskı yok.
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

export const CANVA_MASTERCLASS_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "canva-masterclass-1",
    order: 1,
    title: "Marka Kiti ve Tipografi: Renk, Logo ve Yazı Disiplini",
    dialogue: {
      warmup: [
        tarik(
          "Sen matbaaya kalıp vermeden her afişi ayrı boyadın mı? Dükkân her gün başka yüz. Kalıp nerede durur?",
        ),
        gozde(
          "Kalıp Brand Kit’tir: logo, hex renk, iki yazı ailesi. Fail-closed (Hata Anında Kapalı): hex ve logo yoksa şablon açılmaz; her karede serbest font basılmaz.",
        ),
      ],
      problem: [
        tarik("Ekran güzel, her post ayrı font, logo eğik. Marka yine duruyor mu?"),
        gozde(
          "Yok. Tutarsız kalıp tanınmaz. Fail-closed: kiti boşken Magic Resize bile kopya basmaz; renk kodu yazılmadan palet uydurulmaz.",
        ),
      ],
      development: [
        tarik("Kalıp kapısını yaz. Boş hex ve logosuz kiti bir kez kır."),
        gozde(
          "Logo korumalı alandır, eğilmez. Tipo hiyerarşisi: başlık bir aile, gövde ikinci. Üçüncü süs fontu kalıbı bozar.",
          {
            language: "ts",
            source: `function kitAc(girdi: { logo: boolean; hex: string; baslikFont: string; govdeFont: string }): "acik" {
  if (!girdi.logo) throw new Error("logo yok; kalıp durur");
  if (!/^#[0-9A-Fa-f]{6}$/u.test(girdi.hex.trim())) throw new Error("hex yok; renk uydurulmaz");
  if (!girdi.baslikFont.trim() || !girdi.govdeFont.trim()) throw new Error("tipo yok; kalıp durur");
  return "acik";
}
if (kitAc({ logo: true, hex: "#1A365D", baslikFont: "Inter", govdeFont: "Source Serif" }) !== "acik") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("Her karede yeni font «tazelik» diye basarsak?"),
        gozde(
          "Tazelik tanınmazlık doğurur. Fail-closed kiti boşken şablon durur. Kalıp durunca sosyal kapıya geçeriz.",
        ),
      ],
      conclusion: [
        tarik("Logo, hex, iki font. Kalıp yoksa şablon yok. Sonraki adım post mu?"),
        gozde(
          "Kalıp durunca vitrin karesine geçeriz. Bir sonraki bölümde seni sosyal medya post ve Reels tasarımı bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_cnv1_1",
        "Brand Kit bu derste nedir?",
        ["Yalnız şablon pazarı", "Logo, hex renk ve tipi hiyerarşisi kalıbı", "Yalnız Magic Write", "Yalnız PDF"],
        1,
      ),
      mcq(
        "q_cnv1_2",
        "Fail-closed hex boşken palet ne yapar?",
        ["Güzel renk uydurur", "Durur; renk basılmaz", "Magic düzeltir", "Reels yeter"],
        1,
      ),
      mcq(
        "q_cnv1_3",
        "Her karede üçüncü süs fontu?",
        ["Tazelik", "Kalıbı bozar; iki aile durur", "SEO düzeltir", "Baskı yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "canva-masterclass-2",
    order: 2,
    title: "Sosyal Medya Post ve Reels Tasarımı: Boyut, Mesaj ve Marka",
    dialogue: {
      warmup: [
        tarik(
          "Sen bakkal vitrinine tiyatro afişi astın mı? Ölçü yanlış, yazı kesilir. Post karesi ile Reels boyu aynı mı?",
        ),
        gozde(
          "Değil. Feed kare, Hikâye 9:16, Reels dikey video. Fail-closed: boyut işe uymazsa teslim durur; tek karede üç çağrı (CTA) basılmaz.",
        ),
      ],
      problem: [
        tarik("Tek şablon hem post hem Reels, üç düğme, marka yok. Beğeni var, tıklama yok. Ne kırılır?"),
        gozde(
          "Yanlış boy keser. Üç CTA mesajı yok eder. Fail-closed: kit uygulanmadan ve tek mesaj yazılmadan kare yayınlanmaz.",
        ),
      ],
      development: [
        tarik("Kare kapısını yaz. Yanlış boy ve üç CTA’yı kır."),
        gozde(
          "Magic Resize kiti olan kareyi boya uyarlar; kiti yoksa durur. Reels ilk karede kanca durur; 15 saniyede tek iş.",
          {
            language: "ts",
            source: `function kareAc(girdi: { is: "post" | "reels" | "hikaye"; boy: string; cta: number; kit: boolean }): "acik" {
  const dogru = girdi.is === "post" ? "1:1" : "9:16";
  if (girdi.boy !== dogru) throw new Error("boy yanlış; teslim durur");
  if (!girdi.kit) throw new Error("kalıp yok; kare durur");
  if (!Number.isInteger(girdi.cta) || girdi.cta !== 1) throw new Error("CTA tek durur");
  return "acik";
}
if (kareAc({ is: "reels", boy: "9:16", cta: 1, kit: true }) !== "acik") throw new Error("sözleşme kırıldı");`,
          },
        ),
        tarik("Kareyi Reels’e «sığdır» deyip kenarı kesersek?"),
        gozde(
          "Kesik yazı teslim değildir. Fail-closed boy uymazsa durur. Kare durunca broşür kapısına geçeriz.",
        ),
      ],
      conclusion: [
        tarik("Boy işe göre, tek CTA, kit üstünde. Sonraki adım sunum mu?"),
        gozde(
          "Kare durunca kâğıt kapısına geçeriz. Bir sonraki bölümde seni sunum ve broşür bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_cnv2_1",
        "Reels boyutu nedir?",
        ["1:1 kare", "9:16 dikey; feed kare ile aynı değildir", "A4", "16:9 yatay zorunlu"],
        1,
      ),
      mcq(
        "q_cnv2_2",
        "Fail-closed üç CTA bir karede?",
        ["Daha çok tıklama", "Durur; tek mesaj basılır", "Magic düzeltir", "Hashtag yeter"],
        1,
      ),
      mcq(
        "q_cnv2_3",
        "Kit yokken Magic Resize?",
        ["Her boyu basar", "Durur; kalıpsız kopya yok", "Reels gizler", "PDF yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "canva-masterclass-3",
    order: 3,
    title: "Sunum ve Broşür Hazırlama: Izgara, Okunurluk ve Baskı Payı",
    dialogue: {
      warmup: [
        tarik(
          "Sen kalıbı masaya taşırıp yazıyı kenara sıktın mı? Matbaa keser, slaytta kimse okumaz. Pay ve punto nerede?",
        ),
        gozde(
          "Izgara ve kenar payı (bleed) kâğıdın nefesidir. Fail-closed: taşan metin, 10 puntodan küçük gövde veya bleed yoksa baskı durur; slayt duvar yazısı basılmaz.",
        ),
      ],
      problem: [
        tarik("20 slayt, her biri paragraf, broşür kenarsız. Ekran dolu. İş teslim mi?"),
        gozde(
          "Hayır. Okunmayan slayt sunum değildir. Kenarsız PDF matbaada kesilir. Fail-closed: satır taşması veya bleed 3 mm yoksa dosya durur.",
        ),
      ],
      development: [
        tarik("Kâğıt kapısını yaz. Taşan metin ve bleed’siz PDF’i kır."),
        gozde(
          "Sunumda bir slayt bir fikir. Broşürde ızgara ve 3 mm pay. Logo güvenli alanda durur, kesime girmez.",
          {
            language: "ts",
            source: `function kagitAc(girdi: { tasma: boolean; punto: number; bleedMm: number }): "acik" {
  if (girdi.tasma) throw new Error("metin taşar; teslim durur");
  if (!Number.isFinite(girdi.punto) || girdi.punto < 11) throw new Error("punto küçük; okunmaz");
  if (!Number.isFinite(girdi.bleedMm) || girdi.bleedMm < 3) throw new Error("pay yok; baskı durur");
  return "acik";
}
if (kagitAc({ tasma: false, punto: 12, bleedMm: 3 }) !== "acik") throw new Error("sözleşme kırıldı");`,
          },
        ),
        tarik("Slayta tüm raporu yapıştırırsak?"),
        gozde(
          "Duvar yazısı dinletmez. Fail-closed taşma varsa durur. Kâğıt durunca Magic kapısına geçeriz.",
        ),
      ],
      conclusion: [
        tarik("Izgara, punto, 3 mm pay. Taşma yok. Sonraki adım yapay zekâ mı?"),
        gozde(
          "Kâğıt durunca stüdyo kapısına geçeriz. Bir sonraki bölümde seni Magic Studio araçları bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_cnv3_1",
        "Baskı payı (bleed) en az kaç mm durur?",
        ["0, sığsın", "3 mm; kenar kesimine pay", "Yalnız 1 px", "Magic seçer"],
        1,
      ),
      mcq(
        "q_cnv3_2",
        "Fail-closed metin taşınca?",
        ["Matbaa keser yeter", "Teslim durur; taşma basılmaz", "Küçült gizler", "RGB düzeltir"],
        1,
      ),
      mcq(
        "q_cnv3_3",
        "Bir slaytta tüm rapor?",
        ["Kapsamlı teslim", "Yasaktır; bir slayt bir fikir", "Punto 8 yeter", "PDF düzeltir"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "canva-masterclass-4",
    order: 4,
    title: "Magic Studio Yapay Zekâ Araçları: Taslak, Lisans ve PII Kapısı",
    dialogue: {
      warmup: [
        tarik(
          "Sen kalıbı Magic’e verip müşteri adını tarife yapıştırdın mı? Taslak gelir, lisans belirsiz, isim sızar. Kapı nerede?",
        ),
        gozde(
          "Magic Write ve Magic Media taslaktır, kalıp değildir. Fail-closed: kişisel veri tarife girmez; lisanssız görsel marka diye basılmaz; ham Magic metin sesin olmaz.",
        ),
      ],
      problem: [
        tarik("Magic Media güzel yüz üretti, lisans «bilinmiyor». Müşteri listesi prompt’ta. Yayınlarız mı?"),
        gozde(
          "Hayır. Bilinmeyen lisans dava doğurur. PII tarifte sızar. Fail-closed: lisans ve PII kapısı durmadan dışa aktarma açılmaz.",
        ),
      ],
      development: [
        tarik("Stüdyo kapısını yaz. PII’li prompt ve lisanssız görseli kır."),
        gozde(
          "Magic Resize kiti olanı boyar. Magic Eraser arka planı temizler; yüzü «başka biri» yapmaz. Taslak senin kalıbından geçer, ham basılmaz.",
          {
            language: "ts",
            source: `function magicOnay(girdi: { pii: boolean; lisans: "net" | "bilinmiyor"; hamMetin: boolean; kit: boolean }): "taslak" {
  if (girdi.pii) throw new Error("PII tarife girmez; üretim durur");
  if (girdi.lisans !== "net") throw new Error("lisans yok; görsel durur");
  if (girdi.hamMetin) throw new Error("ham Magic ses değildir");
  if (!girdi.kit) throw new Error("kalıp yok; taslak durur");
  return "taslak";
}
if (magicOnay({ pii: false, lisans: "net", hamMetin: false, kit: true }) !== "taslak") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("Müşteri telefonunu «kişiselleştirsin» diye prompt’a yazarsak?"),
        gozde(
          "PII tarife yapışmaz. Fail-closed sızdırma durur. Stüdyo durunca teslim formatına geçeriz.",
        ),
      ],
      conclusion: [
        tarik("Taslak, lisans net, PII yok, kit üstünde. Sonraki adım dışa aktarma mı?"),
        gozde(
          "Stüdyo durunca dosya kapısına geçeriz. Bir sonraki bölümde seni baskı ve dijital teslimat formatları bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_cnv4_1",
        "Magic Write çıktısı marka sesi midir?",
        ["Evet, ham basılır", "Hayır; taslak, kalıptan geçmeden ses olmaz", "Lisans yeter", "Reels yeter"],
        1,
      ),
      mcq(
        "q_cnv4_2",
        "Fail-closed PII prompt’tayken?",
        ["Kişiselleştirir", "Üretim durur; tarife girmez", "Magic gizler", "PDF yeter"],
        1,
      ),
      mcq(
        "q_cnv4_3",
        "Lisansı bilinmeyen Magic görsel?",
        ["Güzel yeter", "Durur; marka diye basılmaz", "Filigran yeter", "RGB düzeltir"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "canva-masterclass-5",
    order: 5,
    title: "Baskı ve Dijital Teslimat Formatları: RGB, CMYK ve Dışa Aktarma",
    dialogue: {
      warmup: [
        tarik(
          "Sen kalıbı ekran rengi ile matbaaya verdin mi? Kâğıt soluk çıkar. RGB mi, CMYK mi, hangisi kapı?",
        ),
        gozde(
          "Ekran RGB, baskı CMYK ve 300 dpi ister. Fail-closed: RGB PDF matbaaya gitmez; web PNG 72 dpi ile A4 basılmaz; font çevrilmeden paket durur.",
        ),
      ],
      problem: [
        tarik("Müşteri «PDF yeter» dedi, RGB, 72 dpi, bleed yok. Matbaa reddetti. Kim yalan söyledi?"),
        gozde(
          "Teslim işe göre seçilir. Web PNG/SVG, video MP4, baskı PDF/X + CMYK + pay. Fail-closed: profil ve dpi yazılmadan dosya durur.",
        ),
      ],
      development: [
        tarik("Dosya kapısını yaz. RGB baskı ve düşük dpi’yi kır."),
        gozde(
          "Dijital: sRGB PNG veya MP4. Baskı: CMYK, 300 dpi, 3 mm bleed, font outline veya gömülü. «Ekranda güzel» matbaa fişi değildir.",
          {
            language: "ts",
            source: `function teslimAc(girdi: { is: "web" | "baski"; profil: "sRGB" | "CMYK"; dpi: number; bleedMm: number }): "ok" {
  if (girdi.is === "baski") {
    if (girdi.profil !== "CMYK") throw new Error("RGB baskı durur");
    if (girdi.dpi < 300) throw new Error("dpi düşük; baskı durur");
    if (girdi.bleedMm < 3) throw new Error("pay yok; baskı durur");
  }
  if (girdi.is === "web" && girdi.profil !== "sRGB") throw new Error("web sRGB ister");
  return "ok";
}
if (teslimAc({ is: "baski", profil: "CMYK", dpi: 300, bleedMm: 3 }) !== "ok") throw new Error("sözleşme kırıldı");`,
          },
        ),
        tarik("Web PNG’yi «aynı dosya» deyip matbaaya atarsak?"),
        gozde(
          "İş ayrı, dosya ayrı. Fail-closed RGB baskı durur. Dosya durunca dört kapı kapanışına geçeriz.",
        ),
      ],
      conclusion: [
        tarik("Web sRGB, baskı CMYK 300 dpi pay. Sonraki adım proje mi?"),
        gozde(
          "Dosya durunca teslim kapısına geçeriz. Bir sonraki bölümde seni marka teslim projesi bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_cnv5_1",
        "Matbaa PDF hangi renk profilini ister?",
        ["Yalnız sRGB", "CMYK; RGB kâğıtta soluk kalır", "Yalnız hex", "Magic seçer"],
        1,
      ),
      mcq(
        "q_cnv5_2",
        "Fail-closed baskıda 72 dpi?",
        ["Ekran yeter", "Durur; 300 dpi ister", "PNG düzeltir", "Reels yeter"],
        1,
      ),
      mcq(
        "q_cnv5_3",
        "Web ve baskı aynı dosya mı?",
        ["Evet, PDF yeter", "Hayır; işe göre profil ve dpi ayrı durur", "Magic birleştirir", "Logo yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "canva-masterclass-6",
    order: 6,
    title: "Mini Proje: Kit, Format, AI ve Teslim Dört Kapısı",
    dialogue: {
      warmup: [
        tarik(
          "Kalıp duruyor: kitsiz kare, yanlış boy, PII’li Magic, RGB baskı. Sen müşteriye hangi paketi uzatırsın?",
        ),
        gozde(
          "Dört kapı durmadan uzatmazsın. Kit, format, AI onay, teslim. Fail-closed bir kapı açıkken mühür vurulmaz. Bu iskelet canlı Canva hesabı iddiası taşımaz.",
        ),
      ],
      problem: [
        tarik("Ekranda şablon parlıyor, hex yok. İş bitmiş mi sayılıyor?"),
        gozde(
          "Parıltı yalandır. Kitsiz kare, kesik Reels, lisanssız yüz, RGB PDF — biri duruyorsa paket basılmaz.",
        ),
      ],
      development: [
        tarik("Tek fonksiyon: kit, boy, lisans, profil. Biri kırıkken dur."),
        gozde(
          "`paket` dört kapıyı sırayla sorar. Hex yoksa durur. Boy işe uymazsa durur. Lisans net değilse durur. Baskıda CMYK değilse durur. Hepsi durunca «hazir» basılır.",
          {
            language: "ts",
            source: `function paket(girdi: {
  hex: string;
  boyDogru: boolean;
  lisans: "net" | "bilinmiyor";
  baski: boolean;
  profil: "sRGB" | "CMYK";
}): "hazir" {
  if (!/^#[0-9A-Fa-f]{6}$/u.test(girdi.hex.trim())) throw new Error("hex yok; kalıp durur");
  if (!girdi.boyDogru) throw new Error("boy yanlış; kare durur");
  if (girdi.lisans !== "net") throw new Error("lisans yok; görsel durur");
  if (girdi.baski && girdi.profil !== "CMYK") throw new Error("RGB baskı durur");
  return "hazir";
}
if (paket({ hex: "#1A365D", boyDogru: true, lisans: "net", baski: true, profil: "CMYK" }) !== "hazir") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("Bu iskelet canlı Canva hesabına bağlı mı? Sınavda ne ölçülür?"),
        gozde(
          "Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Dört kapı: kit, format, AI, teslim.",
        ),
      ],
      conclusion: [
        tarik("Masterclass kapanış bu mu: kalıp, kare, kâğıt, Magic, dosya, sınava gir?"),
        gozde(
          "Bu. Tekil Masterclass halkası kapanır. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_cnv6_1",
        "Mini projedeki paket canlı Canva hesabı mıdır?",
        ["Evet, zorunlu hesap", "Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur", "Yalnız Magic", "Canlı matbaa"],
        1,
      ),
      mcq(
        "q_cnv6_2",
        "Dört kapıdan biri açıkken teslim?",
        ["Yeşil basılır", "Fail-closed; mühür vurulmaz", "Üçü yeter", "Şablon yeter"],
        1,
      ),
      mcq(
        "q_cnv6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Şablon açılınca"],
        1,
      ),
    ],
  }),
] as const;

const CANVA_MASTERCLASS_LESSON_QUIZZES: AcademyExamQuestion[] = CANVA_MASTERCLASS_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları (30–50 bandı). */
export const CANVA_MASTERCLASS_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...CANVA_MASTERCLASS_LESSON_QUIZZES,
  mcq("q_cnv_p1", "Kalıp bu derste nedir?", ["Şablon pazarı", "Brand Kit: logo, hex, tipo", "Yalnız PDF", "Reels"], 1),
  mcq("q_cnv_p2", "Hex boşken palet?", ["Uydurulur", "Durur", "Magic düzeltir", "RGB yeter"], 1),
  mcq("q_cnv_p3", "Üçüncü süs fontu?", ["Tazelik", "Kalıbı bozar", "SEO", "Baskı"], 1),
  mcq("q_cnv_p4", "Reels boyu?", ["1:1", "9:16", "A4", "16:9 zorunlu"], 1),
  mcq("q_cnv_p5", "Üç CTA bir kare?", ["Tıklama", "Durur; tek mesaj", "Hashtag", "Magic"], 1),
  mcq("q_cnv_p6", "Kit yokken Resize?", ["Her boy", "Durur", "Reels gizler", "PDF"], 1),
  mcq("q_cnv_p7", "Bleed en az?", ["0", "3 mm", "1 px", "Magic"], 1),
  mcq("q_cnv_p8", "Taşan metin?", ["Kesilir yeter", "Teslim durur", "Küçült", "RGB"], 1),
  mcq("q_cnv_p9", "Magic ham metin ses mi?", ["Evet", "Hayır; taslak", "Lisans yeter", "Reels"], 1),
  mcq("q_cnv_p10", "PII prompt’ta?", ["Kişisel", "Üretim durur", "Magic gizler", "PDF"], 1),
  mcq("q_cnv_p11", "Lisans bilinmiyor?", ["Güzel yeter", "Görsel durur", "Filigran", "RGB"], 1),
  mcq("q_cnv_p12", "Baskı profili?", ["sRGB", "CMYK", "hex", "Magic"], 1),
  mcq("q_cnv_p13", "Mini proje teslimi?", ["Bir kapı", "Dört kapı durunca", "Satın alınca", "Şablon yeşilince"], 1),
  mcq("q_cnv_p14", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
];
