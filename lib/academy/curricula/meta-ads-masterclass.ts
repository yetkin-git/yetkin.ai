/**
 * Meta Business Suite ile Instagram ve Facebook Reklamcılığı Masterclass (META-MC).
 * PEDAGOJI.md: tekil Masterclass, 4 perde, tek eğitmen, Fail-Closed.
 * Üretim: Grok 4.6. Denetim: Gemini 3.7 Flash — pikselsiz harcama yok; CAPI value lira, kuruş değil.
 */

import type { AcademyExamQuestion } from "@/lib/academy/types";
import {
  academyInstructorLessonDraft,
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

export const META_ADS_MASTERCLASS_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "meta-ads-masterclass-1",
    order: 1,
    title: "Meta Business Suite ve Reklam Yöneticisi (Ads Manager) Kurulumu",
    intro: "Hoş geldiniz. Bu bölümde Meta Business Suite ve Reklam Yöneticisi (Ads Manager) Kurulumu konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Sen vitrini yanlış mahalleye mi kurdun. Gelen bakıp geçiyor, kasa susuyor. Vitrin kirası yine gidiyor. Kapı neresi. Vitrin Meta Business Suite’tir. Reklam Yöneticisi (Ads Manager) o vitrinin kasa defteridir. Fail-closed (Hata Anında Kapalı): piksel yoksa harcama açılmaz; sayfa ve fatura yoksa hesap durur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ekran yeşil, erişim yağıyor. Kasa boş. Bütçe yine doğru mu. Yanlış. Piksel yokken erişim satış değildir. Fail-closed: iş portföyü, sayfa ve piksel durmadan kampanya açılmaz. Beğeni ciro sayılmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Hesap kapısını yaz. Pikselsiz bütçeyi bir kez kır. Business Suite > hesap > sayfa > piksel. Ads Manager kampanya katıdır. Fatura ve piksel boşsa vitrin asılmaz. Erişim sayacı kasa değildir. Piksel yokken «erişim gelsin» diye bütçe açarsak. Vitrin boş mahalleye bakar. Fail-closed piksel yoksa harcama durur. Sonraki bölümde seni kitle bekliyor.",
    summary: "Bu dersle Meta Business Suite ve Reklam Yöneticisi (Ads Manager) Kurulumu becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Suite, sayfa, piksel, fatura. Sonraki adım kitle mi. Vitrin durunca davetiye kapısına geçeriz. Bir sonraki bölümde seni özel ve benzer kitle bekliyor.",
    quiz: [
      mcq(
        "q_meta1_1",
        "Ads Manager kampanyası açılmadan önce ne durur?",
        ["Yalnız beğeni", "Sayfa, piksel ve fatura; yoksa harcama açılmaz", "Yalnız Reels", "Yalnız CBO"],
        1,
      ),
      mcq(
        "q_meta1_2",
        "Fail-closed piksel boşken ne yapar?",
        ["Erişim yeter sayılır", "İşlemi durdurur; bütçe uydurulmaz", "Lookalike açar", "CBO düzeltir"],
        1,
      ),
      mcq(
        "q_meta1_3",
        "Business Suite bu derste nedir?",
        ["Yalnız sohbet", "Vitrin; sayfa ve piksel orada durur", "Yalnız Instagram şifresi", "Yalnız e-posta"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function vitrinAc(girdi: { sayfa: boolean; piksel: boolean; fatura: boolean }): \"acik\" {\n  if (!girdi.sayfa) throw new Error(\"sayfa yok; hesap durur\");\n  if (!girdi.piksel) throw new Error(\"piksel yok; harcama durur\");\n  if (!girdi.fatura) throw new Error(\"fatura yok; hesap durur\");\n  return \"acik\";\n}\nif (vitrinAc({ sayfa: true, piksel: true, fatura: true }) !== \"acik\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "meta-ads-masterclass-2",
    order: 2,
    title: "Hedef Kitle (Targeting) Oluşturma: Özel ve Benzer (Lookalike) Kitlesi",
    intro: "Hoş geldiniz. Bu bölümde Hedef Kitle (Targeting) Oluşturma: Özel ve Benzer (Lookalike) Kitlesi konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Davetiyeyi mahalle bekçisine mi dağıttın, yoksa geçen yıl kasa fişi kesenlere mi. Kim gelir. Özel kitle kasa fişidir: satın alan, siteye gelen. Benzer (Lookalike) o fişten komşu arar. Fail-closed: kaynak kitle satın alan değilse benzer açılmaz; piksel yoksa kitle durur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Lookalike kaynak «sayfa beğenen». Bütçe satış. Ekran yeşil. Ne patlar. Beğenen satın alan değildir. Fail-closed: kaynak olay purchase değilse benzer durur. Özel kitle e-posta listesi boşsa yükleme durur. Yanlış mahalle bütçeyi yer.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Kitle kapısını yaz. Beğeni kaynağını ve pikselsiz benzeri kır. Özel kitle: müşteri listesi veya piksel purchase. Lookalike yüzde 1 o kaynaktan. İlgi yığını soğuk mahalledir; piksel yokken ilgiyle satış boyanmaz. Sayfa beğeneni kaynak deyip yüzde 10 Lookalike açarsak. Mahalle kayar. Fail-closed purchase kaynağı yoksa benzer durur. Sonraki bölümde seni format ve kreatif bekliyor.",
    summary: "Bu dersle Hedef Kitle (Targeting) Oluşturma: Özel ve Benzer (Lookalike) Kitlesi becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Purchase kaynak, piksel, dar benzer. Sonraki adım Reels mi. Davetiye durunca vitrin yüzüne geçeriz. Bir sonraki bölümde seni Reels, görsel, atlıkarınca ve kreatif test bekliyor.",
    quiz: [
      mcq(
        "q_meta2_1",
        "Lookalike kaynağı sayfa beğenisi olunca Fail-closed?",
        ["Yüzde 10 yeter", "Durur; kaynak purchase ister", "CBO düzeltir", "Reels düzeltir"],
        1,
      ),
      mcq(
        "q_meta2_2",
        "Özel kitle bu derste nedir?",
        ["Her ilgi yığını", "Kasa fişi: satın alan veya piksel olayı", "Yalnız yaş aralığı", "Yalnız şehir"],
        1,
      ),
      mcq(
        "q_meta2_3",
        "Piksel yokken kitle oluşturmak?",
        ["İlgi yeter", "Fail-closed; kitle durur", "CAPI gizler", "ABO yeter"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function kitleAc(girdi: { piksel: boolean; kaynak: \"purchase\" | \"begeni\"; n: number }): \"ozel\" | \"benzer\" {\n  if (!girdi.piksel) throw new Error(\"piksel yok; kitle durur\");\n  if (girdi.kaynak !== \"purchase\") throw new Error(\"kaynak zayıf; benzer durur\");\n  if (girdi.n < 100) throw new Error(\"kaynak dar; benzer durur\");\n  return \"benzer\";\n}\nif (kitleAc({ piksel: true, kaynak: \"purchase\", n: 400 }) !== \"benzer\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "meta-ads-masterclass-3",
    order: 3,
    title: "Reklam Formatları: Reels, Görsel, Atlıkarınca (Carousel) ve Kreatif Testleri",
    intro: "Hoş geldiniz. Bu bölümde Reklam Formatları: Reels, Görsel, Atlıkarınca (Carousel) ve Kreatif Testleri konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Vitrinde tek kartvizit, yanda Reels, yanda atlıkarınca. Sen hangisinin sattığını bilmeden hepsine aynı kasa mı yazıyorsun. Format yüzdür, kasa pikseldir. Reels, görsel, atlıkarınca (Carousel) ayrı kreatif adıdır. Fail-closed: piksel yoksa test basılmaz; aynı anda on yüzü «kazanan» saymak yalandır.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Üç format bir reklamda, öğrenme yarım, bütçe iki kat. Ne kırılır. Öğrenme sıfırlanır, kazanan kaybolur. Fail-closed: piksel purchase yokken kreatif test durur. Format değişince öğrenme yeniden başlar; ölçek o anda durur.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Kreatif kapısını yaz. Pikselsiz testi ve on yüzü birden kır. Bir reklam setinde sınırlı kreatif. Kazanan piksel purchase ile seçilir, beğeni ile değil. Reels dikey vaat, atlıkarınca kat, görsel tek iddia. Üçü ayrı durur. Beğeni yüksek diye kazanan ilan edersek. Beğeni kasa değildir. Fail-closed purchase yoksa kazanan basılmaz. Sonraki bölümde seni piksel ve CAPI bekliyor.",
    summary: "Bu dersle Reklam Formatları: Reels, Görsel, Atlıkarınca (Carousel) ve Kreatif Testleri becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Format ayrı, piksel seçer, öğrenme kırılmasın. Sonraki adım ölçü mü. Yüz durunca kasa kamerasına ineriz. Bir sonraki bölümde seni Meta Piksel ve Dönüşüm API’si bekliyor.",
    quiz: [
      mcq(
        "q_meta3_1",
        "Kreatif kazananı ne seçer?",
        ["Beğeni", "Piksel purchase; beğeni kasa değildir", "Yalnız Reels süresi", "Yalnız CBO"],
        1,
      ),
      mcq(
        "q_meta3_2",
        "Fail-closed piksel yokken format testi?",
        ["On yüz açılır", "Durur; test basılmaz", "Lookalike yeter", "ABO gizler"],
        1,
      ),
      mcq(
        "q_meta3_3",
        "Öğrenme fazında bütçeyi ikiye katlamak?",
        ["Hızlı çıkar", "Öğrenmeyi kırar; ölçek o anda durur", "CAPI düzeltir", "Carousel düzeltir"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "type Format = \"reels\" | \"gorsel\" | \"atlikarinca\";\nfunction kreatifTest(girdi: { piksel: boolean; adet: number; format: Format }): Format {\n  if (!girdi.piksel) throw new Error(\"piksel yok; test durur\");\n  if (girdi.adet < 1 || girdi.adet > 5) throw new Error(\"yüz sayısı; test durur\");\n  return girdi.format;\n}\nif (kreatifTest({ piksel: true, adet: 3, format: \"reels\" }) !== \"reels\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "meta-ads-masterclass-4",
    order: 4,
    title: "Meta Piksel (Pixel) ve Dönüşüm API'si (CAPI) Entegrasyonu",
    intro: "Hoş geldiniz. Bu bölümde Meta Piksel (Pixel) ve Dönüşüm API'si (CAPI) Entegrasyonu konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Kasa kamerası tarayıcıyı görüyor, kurye defteri sunucuyu. Sen yalnız kameraya güvenip defteri atar mısın. Piksel tarayıcı, Dönüşüm API’si (CAPI) sunucudur. Fail-closed: ikisi de event_id ile durmadan harcama açılmaz. event_id yoksa çift sayım ROAS’ı şişirir.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Piksel var, CAPI yok, iOS kesiyor. ROAS 8 görünüyor. Ne yalan. Tarayıcı eksik sayar veya çift basar. Fail-closed: CAPI + event_id + purchase değeri durmadan ROAS uydurulmaz. E-posta hash yoksa eşleşme zayıf, öğrenme kördür.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Ölçü kapısını yaz. Tek piksel, boş event_id ve değersiz purchase’ı kır. Piksel tarayıcıda, CAPI sunucuda, aynı event_id. Purchase value lira cinsinden dürüst durur; 990 geçer, 99.000 kuruş CAPI’ye basılmaz. Dedup yoksa iki satış bir sipariş olur. iOS’ta CAPI yoksa kasa kördür. CAPI yokken bütçeyi ikiye katlarsak. Kör öğrenme büyür. Fail-closed ölçü durmadan ölçek açılmaz. Sonraki bölümde seni A/B, CBO/ABO ve ROAS bekliyor.",
    summary: "Bu dersle Meta Piksel (Pixel) ve Dönüşüm API'si (CAPI) Entegrasyonu becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Piksel, CAPI, event_id, değer. Sonraki adım bütçe mi. Kasa kamerası durunca cüzdan kapısına geçeriz. Bir sonraki bölümde seni A/B, CBO/ABO ve ROAS bekliyor.",
    quiz: [
      mcq(
        "q_meta4_1",
        "Piksel ile CAPI nasıl birleşir?",
        ["Yalnız piksel yeter", "Aynı event_id ile dedup; biri eksikse harcama durur", "Beğeni birleştirir", "CBO birleştirir"],
        1,
      ),
      mcq(
        "q_meta4_2",
        "Fail-closed event_id boşken ne yapar?",
        ["İki satış basar", "Durur; çift sayım ROAS’ı şişirmez", "Lookalike düzeltir", "Reels düzeltir"],
        1,
      ),
      mcq(
        "q_meta4_3",
        "Purchase değeri sıfırken ROAS?",
        ["8 kabul", "Uydurulmaz; değer yoksa ölçü durur", "CPA gizler", "ABO gizler"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function olcuDogrula(girdi: {\n  piksel: boolean;\n  capi: boolean;\n  eventId: string;\n  deger: number;\n}): \"hazir\" {\n  if (!girdi.piksel || !girdi.capi) throw new Error(\"piksel/CAPI yok; harcama durur\");\n  if (!girdi.eventId.trim()) throw new Error(\"event_id yok; çift sayım durur\");\n  if (!(girdi.deger > 0)) throw new Error(\"değer yok; ROAS uydurulmaz\");\n  return \"hazir\";\n}\nif (olcuDogrula({ piksel: true, capi: true, eventId: \"e-9\", deger: 990 }) !== \"hazir\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "meta-ads-masterclass-5",
    order: 5,
    title: "A/B Testleri, Bütçe Optimizasyonu (CBO/ABO) ve ROAS Analizi",
    intro: "Hoş geldiniz. Bu bölümde A/B Testleri, Bütçe Optimizasyonu (CBO/ABO) ve ROAS Analizi konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. İki vitrin, tek cüzdan. Sen cüzdanı mahalleye mi bırakırsın, yoksa her vitrine ayrı kasa mı. Kampanya Bütçe Optimizasyonu (CBO; Advantage Campaign Budget) cüzdanı kampanyaya verir. Reklam Seti Bütçesi (ABO) her sete ayrı kasa. Fail-closed: piksel purchase yokken ROAS basılmaz; öğrenmede bütçe %20 üstü artmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. CBO, üç set, biri soğuk ilgi, ROAS «ortalama 4». Ekran yeşil. Ne yalan. CBO bütçeyi güçlü sete kaydırır; zayıf set öğrenemez. Ortalama ROAS zayıfı gizler. Fail-closed: değer yoksa ROAS durur. A/B’de tek değişken durur; üçü birden değişmez.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Bütçe kapısını yaz. Öğrenmede %50 artış ve değersiz ROAS’ı kır. A/B tek kapı: kitle veya kreatif, ikisi birden değil. CBO test bitince; ABO kitle ayrımında. ROAS purchase value (lira) ister. Öğrenme yaklaşık 50 purchase ve 7 gün ister; %20 üstü artış kapıyı sıfırlar. A/B’de kitle ve kreatifı aynı anda değiştirirsek. Kazanan kaybolur. Fail-closed tek değişken durur. Sonraki bölümde seni satış hunisi bekliyor.",
    summary: "Bu dersle A/B Testleri, Bütçe Optimizasyonu (CBO/ABO) ve ROAS Analizi becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Tek değişken, öğrenme %20, ROAS değerli. Sonraki adım huni mi. Cüzdan durunca hunye ineriz. Bir sonraki bölümde seni e-ticaret veya yerel satış hunisi bekliyor.",
    quiz: [
      mcq(
        "q_meta5_1",
        "CBO neyi dağıtır?",
        ["Yalnız beğeniyi", "Kampanya cüzdanını setlere; piksel yoksa açılmaz", "Yalnız Reels’i", "Yalnız e-postayı"],
        1,
      ),
      mcq(
        "q_meta5_2",
        "Fail-closed öğrenmede bütçe %50 artınca?",
        ["Hızlı çıkar", "Ölçek durur; öğrenme kırılır", "ROAS 8 basılır", "Lookalike yeter"],
        1,
      ),
      mcq(
        "q_meta5_3",
        "A/B testinde iki kapı birden?",
        ["Hızlı kazanan", "Yasak; tek değişken durur", "CBO birleştirir", "CAPI birleştirir"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function butceAc(girdi: {\n  piksel: boolean;\n  deger: number;\n  ogrenme: boolean;\n  artisYuzde: number;\n}): \"cbo\" | \"abo\" {\n  if (!girdi.piksel || !(girdi.deger > 0)) throw new Error(\"ROAS uydurulmaz\");\n  if (girdi.ogrenme && girdi.artisYuzde > 20) throw new Error(\"öğrenme kırılır; ölçek durur\");\n  return girdi.ogrenme ? \"abo\" : \"cbo\";\n}\nif (butceAc({ piksel: true, deger: 990, ogrenme: false, artisYuzde: 10 }) !== \"cbo\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "meta-ads-masterclass-6",
    order: 6,
    title: "Mini Proje: E-Ticaret veya Yerel İşletme İçin Satış Odaklı Reklam Huni (Funnel) İnşası",
    intro: "Hoş geldiniz. Bu bölümde Mini Proje: E-Ticaret veya Yerel İşletme İçin Satış Odaklı Reklam Huni (Funnel) İnşası konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Vitrin, davetiye, kasa duruyor. Sen müdüre hangi huniyi uzatırsın — pikselsiz erişim mi. Dört kapı durmadan uzatmazsın. Piksel/CAPI, kitle, kreatif, bütçe. Fail-closed bir kapı açıkken teslim basılmaz. Bu iskelet canlı Ads Yöneticisi iddiası taşımaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ekranda huni parlıyor, event_id yok. İş bitmiş mi sayılıyor. Parıltı yalandır. CAPI yok, beğeni kaynağı, öğrenmede %50 artış, değersiz ROAS — biri duruyorsa mühür vurulmaz. Huni kaynakla aynı defterdir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Tek fonksiyon: ölçü, kaynak, öğrenme, değer. Biri kırıkken dur. `huniTeslim` dört kapıyı sırayla sorar. Piksel/CAPI/event_id yoksa durur. Kaynak purchase değilse durur. Öğrenmede büyük artış durur. Değer yoksa ROAS durur. Hepsi durunca «hazir» basılır. Bu iskelet canlı Meta hesabına bağlı mı. Sınavda ne ölçülür. Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Dört kapı: ölçü, kitle, öğrenme, değer.",
    summary: "Bu dersle Mini Proje: E-Ticaret veya Yerel İşletme İçin Satış Odaklı Reklam Huni (Funnel) İnşası becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Masterclass kapanış bu mu: Suite, kitle, format, piksel, CBO, huni, sınava gir. Bu. Tekil Masterclass halkası kapanır. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
    quiz: [
      mcq(
        "q_meta6_1",
        "Mini projedeki huni canlı Ads Yöneticisi midir?",
        ["Evet, zorunlu hesap", "Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur", "Yalnız Reels", "Canlı fatura"],
        1,
      ),
      mcq(
        "q_meta6_2",
        "Dört kapıdan biri açıkken teslim?",
        ["Yeşil basılır", "Fail-closed; mühür vurulmaz", "Üçü yeter", "Erişim yeter"],
        1,
      ),
      mcq(
        "q_meta6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Vitrin açılınca"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function huniTeslim(girdi: {\n  piksel: boolean;\n  capi: boolean;\n  eventId: string;\n  kaynak: \"purchase\" | \"begeni\";\n  ogrenme: boolean;\n  artisYuzde: number;\n  deger: number;\n}): \"hazir\" {\n  if (!girdi.piksel || !girdi.capi || !girdi.eventId.trim()) {\n    throw new Error(\"ölçü yok; harcama durur\");\n  }\n  if (girdi.kaynak !== \"purchase\") throw new Error(\"kaynak zayıf\");\n  if (girdi.ogrenme && girdi.artisYuzde > 20) throw new Error(\"öğrenme kırılır\");\n  if (!(girdi.deger > 0)) throw new Error(\"ROAS uydurulmaz\");\n  return \"hazir\";\n}\nif (\n  huniTeslim({\n    piksel: true,\n    capi: true,\n    eventId: \"e-1\",\n    kaynak: \"purchase\",\n    ogrenme: false,\n    artisYuzde: 0,\n    deger: 990,\n  }) !== \"hazir\"\n) {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
] as const;

const META_ADS_MASTERCLASS_LESSON_QUIZZES: AcademyExamQuestion[] = META_ADS_MASTERCLASS_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları (30–50 bandı). */
export const META_ADS_MASTERCLASS_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...META_ADS_MASTERCLASS_LESSON_QUIZZES,
  mcq("q_meta_p1", "Vitrin bu derste nedir?", ["Renk", "Meta Business Suite ve sayfa", "Yalnız Reels", "Yalnız e-posta"], 1),
  mcq("q_meta_p2", "Erişim satış mıdır?", ["Evet", "Hayır; piksel yoksa harcama durur", "CBO yeter", "Beğeni yeter"], 1),
  mcq("q_meta_p3", "Lookalike beğeni kaynağı?", ["Yüzde 10 yeter", "Fail-closed; purchase ister", "ABO gizler", "Reels gizler"], 1),
  mcq("q_meta_p4", "Özel kitle nedir?", ["İlgi yığını", "Kasa fişi: satın alan / piksel", "Yalnız yaş", "Yalnız şehir"], 1),
  mcq("q_meta_p5", "Kreatif kazananı?", ["Beğeni", "Piksel purchase", "Süre", "CBO"], 1),
  mcq("q_meta_p6", "Öğrenmede %50 bütçe?", ["Hız", "Kırılır; ölçek durur", "ROAS 8", "Lookalike"], 1),
  mcq("q_meta_p7", "Piksel + CAPI?", ["Yalnız piksel", "event_id dedup", "Beğeni", "ABO"], 1),
  mcq("q_meta_p8", "event_id boşken?", ["İki satış", "Durur; çift sayım yok", "CBO düzeltir", "Reels düzeltir"], 1),
  mcq("q_meta_p9", "Değersiz purchase ROAS?", ["8 kabul", "Uydurulmaz", "CPA gizler", "Carousel gizler"], 1),
  mcq("q_meta_p10", "CBO ne dağıtır?", ["Beğeni", "Kampanya cüzdanını", "Yalnız Reels", "Yalnız e-posta"], 1),
  mcq("q_meta_p11", "A/B iki kapı birden?", ["Hızlı", "Yasak; tek değişken", "CAPI birleştirir", "Lookalike birleştirir"], 1),
  mcq("q_meta_p12", "Mini proje teslimi?", ["Bir kapı", "Dört kapı durunca", "Satın alınca", "Grafik yeşilince"], 1),
  mcq("q_meta_p13", "Bu iskelet canlı hesap mıdır?", ["Evet", "Hayır; kapı sözleşmesi", "Yalnız API", "Business zorunlu"], 1),
  mcq("q_meta_p14", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
];
