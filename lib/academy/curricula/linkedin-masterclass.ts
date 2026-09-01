/**
 * LinkedIn İle Profesyonel Marka İnşası ve B2B Müşteri Bulma Masterclass (LNK-MC) — mühürlü müfredat.
 * PEDAGOJI.md: tekil Masterclass, 4 perde, tek eğitmen, Fail-Closed.
 * Üretim: Grok 4.6. Denetim: Gemini 3.7 Flash — boş All-Star, ICP’siz InMail, kopya duvar yok.
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

export const LINKEDIN_MASTERCLASS_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "linkedin-masterclass-1",
    order: 1,
    title: "Profil Optimizasyonu: All-Star Durumu, Fotoğraf ve Başlık",
    dialogue: {
      warmup: [
        tarik(
          "Sen fuarda kartviziti boş verdin mi? İsim var, iş yok, fotoğraf yok. Karşı taraf cebine koymaz. All-Star neresi?",
        ),
        gozde(
          "Kartvizit LinkedIn profilidir. All-Star fotoğraf, başlık, özet, deneyim ve beceri ister. Fail-closed (Hata Anında Kapalı): fotoğraf veya rol+değer başlığı yoksa profil durur; «açık iş arıyorum» tek satır All-Star basmaz.",
        ),
      ],
      problem: [
        tarik("Ekran yeşil yüzde, başlık «Uzman | Guru | Ninja». Gelen kutu boş. Profil yine doğru mu?"),
        gozde(
          "Yanlış. Boş slogan kartvizit değildir. All-Star çubuğu dolu görünür, kanıt yoktur. Fail-closed: başlıkta rol ve vaat yazılmadan profil yayınlanmaz.",
        ),
      ],
      development: [
        tarik("Kartvizit kapısını yaz. Boş fotoğraf ve slogansız başlığı kır."),
        gozde(
          "Fotoğraf yüz net, arka sakin. Başlık: rol + kimin sorunu + nasıl. Özet kanıt cümlesi ister; «tutkulu» tek başına durmaz.",
          {
            language: "ts",
            source: `function profilAc(girdi: { foto: boolean; baslik: string; ozetKanit: boolean }): "allstar" {
  if (!girdi.foto) throw new Error("fotoğraf yok; profil durur");
  const b = girdi.baslik.trim();
  if (b.length < 12 || /guru|ninja|uzman\\s*\\|\\s*guru/i.test(b)) throw new Error("başlık slogan; profil durur");
  if (!girdi.ozetKanit) throw new Error("kanıt yok; All-Star basılmaz");
  return "allstar";
}
if (profilAc({ foto: true, baslik: "B2B satış: ICP net, pipeline dürüst", ozetKanit: true }) !== "allstar") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("Başlığı «Ninja Growth Hacker» deyip All-Star’ı yeşil sayarsak?"),
        gozde(
          "Çubuk yalan olabilir. Fail-closed slogan başlık durur. Kartvizit durunca içerik kapısına geçeriz.",
        ),
      ],
      conclusion: [
        tarik("Fotoğraf, rol+vaat, kanıt özet. Slogan All-Star değil. Sonraki adım içerik mi?"),
        gozde(
          "Kartvizit durunca akış kapısına geçeriz. Bir sonraki bölümde seni algoritma dostu içerik bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_lnk1_1",
        "All-Star bu derste ne ister?",
        ["Yalnız yeşil çubuk", "Fotoğraf, rol+vaat başlık, kanıtlı özet", "Yalnız emoji", "Yalnız 500 bağlantı"],
        1,
      ),
      mcq(
        "q_lnk1_2",
        "Fail-closed fotoğraf yokken profil?",
        ["Yine yayınlanır", "Durur; kartvizit boş kalmaz", "Algoritma düzeltir", "InMail yeter"],
        1,
      ),
      mcq(
        "q_lnk1_3",
        "«Guru | Ninja» başlık All-Star mıdır?",
        ["Evet, güçlü", "Hayır; slogan durur, rol+vaat yazılır", "Hashtag yeter", "Premium yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "linkedin-masterclass-2",
    order: 2,
    title: "Algoritma Dostu İçerik Üretimi: Kanca, Kanıt ve Yorum",
    dialogue: {
      warmup: [
        tarik(
          "Sen kartviziti duvara 40 hashtag ile astın mı? Kimse okumaz, algoritma cezalar. İlk satır nerede durur?",
        ),
        gozde(
          "İlk satır kancadır; «daha fazlasını gör» öncesi karar oradadır. Fail-closed: kanca yoksa, kanıt yoksa veya hashtag yığını varsa gönderi durur; beğeni avı dağıtım değildir.",
        ),
      ],
      problem: [
        tarik("«Yorumla 🔥» tuzak, 30 etiket, kanıt yok. Etkileşim sahte. Müşteri gelir mi?"),
        gozde(
          "Gelmez. Algoritma duraklama ve yorum kalitesini okur, tuzak tıklamayı değil. Fail-closed: engagement bait ve boş etiket gönderiyi durdurur.",
        ),
      ],
      development: [
        tarik("Akış kapısını yaz. Tuzak CTA ve hashtag yığınını kır."),
        gozde(
          "Kanca bir cümle. Gövde saha kanıtı. Kapanış tek soru. Yorum senin cevabınla derinleşir; «katıl» botu dağıtım değildir.",
          {
            language: "ts",
            source: `function gonderiAc(girdi: { kanca: string; kanit: boolean; hashtag: number; tuzak: boolean }): "yayin" {
  if (!girdi.kanca.trim() || girdi.kanca.trim().length < 8) throw new Error("kanca yok; gönderi durur");
  if (!girdi.kanit) throw new Error("kanıt yok; gönderi durur");
  if (!Number.isInteger(girdi.hashtag) || girdi.hashtag > 3) throw new Error("etiket yığını; gönderi durur");
  if (girdi.tuzak) throw new Error("beğeni avı; gönderi durur");
  return "yayin";
}
if (gonderiAc({ kanca: "Pipeline durdu çünkü ICP yoktu.", kanit: true, hashtag: 2, tuzak: false }) !== "yayin") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("«Yorumla kazandırayım» deyip dağıtımı şişirirsek?"),
        gozde(
          "Tuzak güven yer. Fail-closed bait durur. Akış durunca kitle kapısına geçeriz.",
        ),
      ],
      conclusion: [
        tarik("Kanca, kanıt, en çok üç etiket, tuzak yok. Sonraki adım Sales Navigator mı?"),
        gozde(
          "Akış durunca hedef kapısına geçeriz. Bir sonraki bölümde seni B2B kitle ve Sales Navigator bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_lnk2_1",
        "Algoritma dostu gönderi önce ne ister?",
        ["30 hashtag", "Kanca ve kanıt; tuzak CTA yoktur", "Yalnız emoji", "InMail"],
        1,
      ),
      mcq(
        "q_lnk2_2",
        "Fail-closed «yorumla 🔥» tuzak?",
        ["Dağıtımı büyütür", "Gönderiyi durdurur; beğeni avı yoktur", "Premium düzeltir", "Navigator yeter"],
        1,
      ),
      mcq(
        "q_lnk2_3",
        "Hashtag yığını (30 etiket)?",
        ["Keşif", "Durur; en çok üç etiket", "All-Star düzeltir", "Banner yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "linkedin-masterclass-3",
    order: 3,
    title: "B2B Hedef Kitle Tespiti: Sales Navigator ve ICP Kapısı",
    dialogue: {
      warmup: [
        tarik(
          "Sen fuarda herkese kartvizit attın mı? Gece yorgun, kimse müşteri değil. ICP ve Navigator filtresi nerede?",
        ),
        gozde(
          "ICP (Ideal Customer Profile) unvan, sektör, ölçek ve coğrafyadır. Sales Navigator o süzgeci kaydeder. Fail-closed: ICP boşken kayıtlı arama ve InMail açılmaz; «her CTO» hedef değildir.",
        ),
      ],
      problem: [
        tarik("Navigator açık, filtre yok, 2 000 kişi kaydı. InMail kotası bitti. Pipeline neden boş?"),
        gozde(
          "Yığın hedef kitle değildir. Fail-closed: sektör + unvan + ölçek yazılmadan liste durur; kayıtlı arama boş süzgeçle kaydedilmez.",
        ),
      ],
      development: [
        tarik("Kitle kapısını yaz. Boş ICP ve süzgeçsiz listeyi kır."),
        gozde(
          "Navigator lead listesi ICP cümlesine bağlıdır. Hesap listesi şirket ölçeği ister. «Türkiye’deki herkes» süzgeç değildir.",
          {
            language: "ts",
            source: `function icpKaydet(girdi: { unvan: string; sektor: string; olcek: string; cografi: string }): "liste" {
  if (!girdi.unvan.trim() || !girdi.sektor.trim()) throw new Error("ICP yok; liste durur");
  if (!girdi.olcek.trim() || !girdi.cografi.trim()) throw new Error("ölçek/coğrafya yok; liste durur");
  if (/herkes|tüm cto/i.test(girdi.unvan + " " + girdi.sektor)) throw new Error("yığın hedef; liste durur");
  return "liste";
}
if (icpKaydet({ unvan: "satınalma müdürü", sektor: "üretici", olcek: "50-200", cografi: "TR" }) !== "liste") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("«Tüm CTO’lar» deyip 2 000 kişiyi kaydedersek?"),
        gozde(
          "Yığın InMail yakar. Fail-closed ICP yoksa liste durur. Kitle durunca outreach kapısına geçeriz.",
        ),
      ],
      conclusion: [
        tarik("Unvan, sektör, ölçek, coğrafya. Yığın yok. Sonraki adım soğuk mesaj mı?"),
        gozde(
          "Kitle durunca kapı yazısına geçeriz. Bir sonraki bölümde seni cold outreach bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_lnk3_1",
        "ICP bu derste nedir?",
        ["Herkes", "Unvan, sektör, ölçek ve coğrafya süzgeci", "Yalnız şehir", "Yalnız hashtag"],
        1,
      ),
      mcq(
        "q_lnk3_2",
        "Fail-closed ICP boşken Sales Navigator listesi?",
        ["2 000 kişi kaydolur", "Durur; yığın hedef açılmaz", "Premium düzeltir", "InMail yeter"],
        1,
      ),
      mcq(
        "q_lnk3_3",
        "«Tüm CTO’lar» kayıtlı arama mıdır?",
        ["Evet, geniş net", "Hayır; yığın durur, süzgeç yazılır", "Algoritma seçer", "Banner yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "linkedin-masterclass-4",
    order: 4,
    title: "Cold Outreach: İzin, Bağlam ve Toplu Kopya Yasağı",
    dialogue: {
      warmup: [
        tarik(
          "Sen kartviziti 50 kişiye aynı mektupla attın mı? «Hızlı bir görüşme?» İlk satır spam. Kapı nasıl açılır?",
        ),
        gozde(
          "Soğuk yazı bağlam ve izin ister. Fail-closed: kopya duvar, ilk mesajda «15 dk zoom» ve ICP’siz InMail durur; KVKK/izin yoksa seri mesaj açılmaz.",
        ),
      ],
      problem: [
        tarik("50 aynı paragraf, isim mail-merge, teklif ilk cümlede. Cevap sıfır, hesap kısıtlandı. Ne kırıldı?"),
        gozde(
          "Toplu kopya spam sayılır. İlk mesaj satış değil, gerekçe ve tek sorudur. Fail-closed: özgün bağlam yoksa InMail durur.",
        ),
      ],
      development: [
        tarik("Yazı kapısını yaz. Kopya duvar ve ilk cümle teklifi kır."),
        gozde(
          "Bağlam: onların son içeriği veya saha sorunu. Tek soru. Teklif ikinci turda. Kota ICP listesinden düşer; rastgele 50 kişilik duvar yoktur.",
          {
            language: "ts",
            source: `function mesajAc(girdi: { ozgunBaglam: boolean; ilkTeklif: boolean; kopyaDuvar: boolean; icp: boolean }): "gonder" {
  if (!girdi.icp) throw new Error("ICP yok; InMail durur");
  if (girdi.kopyaDuvar) throw new Error("kopya duvar; mesaj durur");
  if (girdi.ilkTeklif) throw new Error("ilk cümle satış; mesaj durur");
  if (!girdi.ozgunBaglam) throw new Error("bağlam yok; mesaj durur");
  return "gonder";
}
if (mesajAc({ ozgunBaglam: true, ilkTeklif: false, kopyaDuvar: false, icp: true }) !== "gonder") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("«Hızlı 15 dakika» ile 50 kişiyi aynı anda basarsak?"),
        gozde(
          "Spam kapıyı kapatır. Fail-closed kopya duvar durur. Yazı durunca konumlandırma kapısına geçeriz.",
        ),
      ],
      conclusion: [
        tarik("ICP, özgün bağlam, ilk mesajda teklif yok. Sonraki adım marka mı?"),
        gozde(
          "Yazı durunca konum kapısına geçeriz. Bir sonraki bölümde seni bireysel marka konumlandırma bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_lnk4_1",
        "İlk InMail ne taşır?",
        ["15 dk zoom teklifi", "Özgün bağlam ve tek soru; ilk cümle satış değildir", "Fiyat listesi", "50 hashtag"],
        1,
      ),
      mcq(
        "q_lnk4_2",
        "Fail-closed kopya duvar 50 kişi?",
        ["Verim", "Durur; spam sayılır", "Premium gizler", "Navigator yeter"],
        1,
      ),
      mcq(
        "q_lnk4_3",
        "ICP yokken InMail kotası?",
        ["Herkese harcanır", "Durur; yığın yazı açılmaz", "Algoritma seçer", "Banner yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "linkedin-masterclass-5",
    order: 5,
    title: "Bireysel Marka Konumlandırma: Niş, Kanıt ve Tutarsız Mesaj",
    dialogue: {
      warmup: [
        tarik(
          "Sen kartvizitin bir yüzüne «her iş» yazdın mı? Fuarda kimse durmaz. Niş ve kanıt nerede durur?",
        ),
        gozde(
          "Konum bir cümledir: kimin, hangi sorun, hangi kanıt. Fail-closed: niş yoksa, kanıtsız «düşünce lideri» ve kişisel drama B2B akışına karışırsa marka durur.",
        ),
      ],
      problem: [
        tarik("Pazartesi koçluk, salı kripto, çarşamba B2B satış. Takipçi şaşkın. Pipeline neden dağılır?"),
        gozde(
          "Tutarsız yüz güven yer. Fail-closed: niş cümlesi yazılmadan içerik takvimi açılmaz; kanıtsız unvan basılmaz.",
        ),
      ],
      development: [
        tarik("Konum kapısını yaz. Kanıtsız unvan ve karışık nişi kır."),
        gozde(
          "Haftalık içerik niş cümlesine bağlıdır. Kanıt: vaka, sayı, saha. Drama ve her konu «kişisel marka» değildir.",
          {
            language: "ts",
            source: `function konumAc(girdi: { nis: string; kanit: boolean; konuSayisi: number }): "konum" {
  if (!girdi.nis.trim() || girdi.nis.trim().length < 12) throw new Error("niş yok; marka durur");
  if (!girdi.kanit) throw new Error("kanıt yok; unvan basılmaz");
  if (!Number.isInteger(girdi.konuSayisi) || girdi.konuSayisi !== 1) throw new Error("karışık niş; marka durur");
  return "konum";
}
if (konumAc({ nis: "üretici satınalmaya dürüst pipeline", kanit: true, konuSayisi: 1 }) !== "konum") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("«Düşünce lideriyim» deyip vaka basmazsak?"),
        gozde(
          "Unvan yalandır. Fail-closed kanıt yoksa marka durur. Konum durunca dört kapı kapanışına geçeriz.",
        ),
      ],
      conclusion: [
        tarik("Bir niş, kanıt, tutarlı yüz. Sonraki adım proje mi?"),
        gozde(
          "Konum durunca teslim kapısına geçeriz. Bir sonraki bölümde seni profil kapanış projesi bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_lnk5_1",
        "Bireysel marka cümlesi ne ister?",
        ["Her konu", "Kimin sorunu ve kanıt; niş tek durur", "Yalnız selfie", "Yalnız Premium"],
        1,
      ),
      mcq(
        "q_lnk5_2",
        "Fail-closed kanıtsız «düşünce lideri»?",
        ["Güçlü duruş", "Unvan basılmaz; marka durur", "Algoritma verir", "InMail yeter"],
        1,
      ),
      mcq(
        "q_lnk5_3",
        "Haftada üç niş birden?",
        ["Zenginlik", "Tutarsız yüz; takvim durur", "Hashtag birleştirir", "Navigator yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "linkedin-masterclass-6",
    order: 6,
    title: "Mini Proje: Profil, İçerik, ICP ve Outreach Dört Kapısı",
    dialogue: {
      warmup: [
        tarik(
          "Kartvizit duruyor: slogansız All-Star, tuzak gönderi, yığın liste, kopya InMail. Sen müdüre hangi pipeline’ı uzatırsın?",
        ),
        gozde(
          "Dört kapı durmadan uzatmazsın. Profil, içerik, ICP, outreach. Fail-closed bir kapı açıkken mühür vurulmaz. Bu iskelet canlı LinkedIn hesabı iddiası taşımaz.",
        ),
      ],
      problem: [
        tarik("Ekranda bağlantı parlıyor, ICP yok. İş bitmiş mi sayılıyor?"),
        gozde(
          "Parıltı yalandır. Slogan başlık, bait gönderi, yığın liste, kopya duvar — biri duruyorsa pipeline basılmaz.",
        ),
      ],
      development: [
        tarik("Tek fonksiyon: fotoğraf, kanca, ICP, bağlam. Biri kırıkken dur."),
        gozde(
          "`pipeline` dört kapıyı sırayla sorar. Fotoğraf yoksa durur. Kanca yoksa durur. ICP yoksa durur. Kopya duvar varsa durur. Hepsi durunca «hazir» basılır.",
          {
            language: "ts",
            source: `function pipeline(girdi: {
  foto: boolean;
  kanca: string;
  icp: boolean;
  kopyaDuvar: boolean;
}): "hazir" {
  if (!girdi.foto) throw new Error("fotoğraf yok; profil durur");
  if (!girdi.kanca.trim()) throw new Error("kanca yok; gönderi durur");
  if (!girdi.icp) throw new Error("ICP yok; liste durur");
  if (girdi.kopyaDuvar) throw new Error("kopya duvar; mesaj durur");
  return "hazir";
}
if (pipeline({ foto: true, kanca: "ICP yoksa InMail yanar.", icp: true, kopyaDuvar: false }) !== "hazir") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        tarik("Bu iskelet canlı LinkedIn hesabına bağlı mı? Sınavda ne ölçülür?"),
        gozde(
          "Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Dört kapı: profil, içerik, ICP, outreach.",
        ),
      ],
      conclusion: [
        tarik("Masterclass kapanış bu mu: kartvizit, akış, kitle, yazı, konum, sınava gir?"),
        gozde(
          "Bu. Tekil Masterclass halkası kapanır. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_lnk6_1",
        "Mini projedeki pipeline canlı LinkedIn hesabı mıdır?",
        ["Evet, zorunlu hesap", "Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur", "Yalnız Navigator", "Canlı InMail"],
        1,
      ),
      mcq(
        "q_lnk6_2",
        "Dört kapıdan biri açıkken teslim?",
        ["Yeşil basılır", "Fail-closed; mühür vurulmaz", "Üçü yeter", "Bağlantı yeter"],
        1,
      ),
      mcq(
        "q_lnk6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "All-Star yeşilince"],
        1,
      ),
    ],
  }),
] as const;

const LINKEDIN_MASTERCLASS_LESSON_QUIZZES: AcademyExamQuestion[] = LINKEDIN_MASTERCLASS_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları (30–50 bandı). */
export const LINKEDIN_MASTERCLASS_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...LINKEDIN_MASTERCLASS_LESSON_QUIZZES,
  mcq("q_lnk_p1", "Kartvizit bu derste nedir?", ["Kağıt", "LinkedIn profili; All-Star kanıt ister", "InMail", "Banner"], 1),
  mcq("q_lnk_p2", "Fotoğraf yokken profil?", ["Yayın", "Durur", "Algoritma", "Premium"], 1),
  mcq("q_lnk_p3", "Guru Ninja başlık?", ["Güçlü", "Slogan durur", "Hashtag", "Premium"], 1),
  mcq("q_lnk_p4", "Gönderi önce?", ["30 etiket", "Kanca ve kanıt", "Emoji", "InMail"], 1),
  mcq("q_lnk_p5", "Yorumla tuzak?", ["Dağıtım", "Durur", "Premium", "Navigator"], 1),
  mcq("q_lnk_p6", "30 hashtag?", ["Keşif", "Durur; en çok üç", "All-Star", "Banner"], 1),
  mcq("q_lnk_p7", "ICP nedir?", ["Herkes", "Unvan, sektör, ölçek, coğrafya", "Şehir", "Hashtag"], 1),
  mcq("q_lnk_p8", "ICP boş liste?", ["2 000 kişi", "Durur", "Premium", "InMail"], 1),
  mcq("q_lnk_p9", "İlk InMail?", ["Zoom teklifi", "Bağlam ve tek soru", "Fiyat", "Hashtag"], 1),
  mcq("q_lnk_p10", "Kopya duvar?", ["Verim", "Durur; spam", "Premium gizler", "Navigator"], 1),
  mcq("q_lnk_p11", "Kanıtsız lider?", ["Duruş", "Unvan basılmaz", "Algoritma", "InMail"], 1),
  mcq("q_lnk_p12", "Üç niş birden?", ["Zenginlik", "Takvim durur", "Hashtag", "Navigator"], 1),
  mcq("q_lnk_p13", "Mini proje teslimi?", ["Bir kapı", "Dört kapı durunca", "Satın alınca", "Bağlantı yeşilince"], 1),
  mcq("q_lnk_p14", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
];
