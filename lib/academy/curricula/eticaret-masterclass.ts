/**
 * Sıfırdan E-Ticaret ve Pazar Yeri Yönetimi Masterclass (ETIC-MC) — mühürlü müfredat.
 * PEDAGOJI.md: tekil Masterclass, 4 perde, tek eğitmen, Fail-Closed.
 * Üretim: Grok 4.6. Denetim: Gemini 3.7 Flash — belgesiz mağaza, stoksuz satış, sahte kargo yok.
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

export const ETICARET_MASTERCLASS_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "eticaret-masterclass-1",
    order: 1,
    title: "Pazar Yeri Mantığı: Komisyon, Rekabet ve Stok Gerçekliği",
    intro: "Hoş geldiniz. Bu bölümde Pazar Yeri Mantığı: Komisyon, Rekabet ve Stok Gerçekliği konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Sen pazarda tezgâhı komşunun rafına koydun mu. Müşteri alır, kasa sende değil. Komisyon kesilir, iade geri gelir. Tezgâh kimin. Tezgâh pazar yeridir: Trendyol, Hepsiburada vitrini onlarındır; sen satıcı kaydısın. Komisyon, kargo ve iade kârı yer. Fail-closed (Hata Anında Kapalı): vergi ve kargo sözleşmesi yoksa tezgâh açılmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ekran yeşil, 40 sipariş. Depoda 8 kutu. Ciro yine doğru mu. Yanlış. Stoksuz satış iptal ve satıcı puanını yer. Komisyonu düşmeden «kâr» basmak yalandır. Fail-closed: stok sıfırsa ilan durur; net kâr yazılmadan sipariş şişmez.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Tezgâh kapısını yaz. Belgesiz ve stoksuz satışı bir kez kır. Pazar yeri komisyonu brütten düşer. Kargo ve iade ayrıca kesilir. Stok adedi gerçektir; «gelecek hafta gelir» ilanı açmaz. Komisyonu yok sayıp «kâr yeşil» basarsak. Brüt ciro kâr değildir. Fail-closed net düşülmeden kâr basmaz. Tezgâh durunca mağaza kapısına geçeriz.",
    summary: "Bu dersle Pazar Yeri Mantığı: Komisyon, Rekabet ve Stok Gerçekliği becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Tezgâh onlarındır, sen satıcısın, stok gerçek, komisyon düşer. Sonraki adım. Tezgâh durunca kapı kaydına geçeriz. Bir sonraki bölümde seni Trendyol ve Hepsiburada mağaza açılışı bekliyor.",
    quiz: [
      mcq(
        "q_etic1_1",
        "Pazar yerinde tezgâh kimin vitrinidir?",
        ["Senin depon", "Pazar yerinin; sen satıcı kaydısın", "Yalnız kargo firmasının", "Yalnız reklamın"],
        1,
      ),
      mcq(
        "q_etic1_2",
        "Fail-closed stok sıfırken ilan ne yapar?",
        ["Sipariş alır", "Durur; stoksuz satış açılmaz", "Komisyonu sıfırlar", "İade kapatır"],
        1,
      ),
      mcq(
        "q_etic1_3",
        "Brüt ciro kâr mıdır?",
        ["Evet", "Hayır; komisyon, kargo ve iade düşmeden kâr basılmaz", "Yalnız kargo yeter", "Puan yeter"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function tezgahAc(girdi: { vergiNo: string; kargoSozlesme: boolean; stok: number }): \"acik\" {\n  if (!girdi.vergiNo.trim()) throw new Error(\"vergi yok; tezgâh durur\");\n  if (!girdi.kargoSozlesme) throw new Error(\"kargo yok; tezgâh durur\");\n  if (!Number.isInteger(girdi.stok) || girdi.stok <= 0) throw new Error(\"stok yok; ilan durur\");\n  return \"acik\";\n}\nif (tezgahAc({ vergiNo: \"1234567890\", kargoSozlesme: true, stok: 8 }) !== \"acik\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "eticaret-masterclass-2",
    order: 2,
    title: "Trendyol ve Hepsiburada Mağaza Açılışı: Belge, Fatura ve Kargo Kapısı",
    intro: "Hoş geldiniz. Bu bölümde Trendyol ve Hepsiburada Mağaza Açılışı: Belge, Fatura ve Kargo Kapısı konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Sen tezgâha tabela astın, ruhsat yok. Zabıta gelir. Trendyol’da vergi, IBAN, kargo yokken mağaza açılır mı. Açılmaz. Mağaza kaydı vergi numarası, fatura unvanı, IBAN ve kargo sözleşmesi ister. Fail-closed: biri boşsa mağaza durur; «yarın tamamlarız» vitrin açmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Hepsiburada yeşil, fatura unvanı eşleşmiyor. İlk sipariş nasıl patlar. Ödeme senin IBAN’ına değil, kesintiye takılır. Yanlış unvan fatura iptali doğurur. Fail-closed: unvan, vergi ve IBAN aynı defterde durmadan mağaza açılmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Mağaza kapısını yaz. Boş IBAN ve kargosuz kaydı kır. Trendyol ve Hepsiburada aynı kapıyı ister: vergi, unvan, IBAN, kargo. Biri eksikse iki vitrin de durur. Sözlü «kurye arkadaşım var» sözleşme değildir. Kargo anlaşması yokken «kendi kuryem» deyip mağaza açarsak. Pazar yeri kargo fişi ister. Fail-closed sözleşme yoksa mağaza durur. Mağaza durunca liste kapısına geçeriz.",
    summary: "Bu dersle Trendyol ve Hepsiburada Mağaza Açılışı: Belge, Fatura ve Kargo Kapısı becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Vergi, unvan, IBAN, kargo. Biri boşsa mağaza yok. Sonraki adım liste mi. Mağaza durunca ürün kapısına geçeriz. Bir sonraki bölümde seni listeleme ve SEO bekliyor.",
    quiz: [
      mcq(
        "q_etic2_1",
        "Mağaza açılmadan önce hangi dörtlü durur?",
        ["Logo ve renk", "Vergi, unvan, IBAN ve kargo sözleşmesi", "Yalnız reklam", "Yalnız stok fotoğrafı"],
        1,
      ),
      mcq(
        "q_etic2_2",
        "Fail-closed IBAN boşken ne yapar?",
        ["Nakit kabul eder", "Ödemeyi durdurur; mağaza açılmaz", "Komşunun IBAN’ını kullanır", "Puan düzeltir"],
        1,
      ),
      mcq(
        "q_etic2_3",
        "«Kendi kuryem var» kargo sözleşmesi midir?",
        ["Evet", "Hayır; pazar yeri yazılı kargo fişi ister", "Yalnız Trendyol’da evet", "Puan yeter"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function magazaAc(girdi: {\n  vergiNo: string;\n  unvan: string;\n  iban: string;\n  kargoSozlesme: boolean;\n}): \"acik\" {\n  if (!girdi.vergiNo.trim() || !girdi.unvan.trim()) throw new Error(\"vergi/unvan yok; mağaza durur\");\n  if (!/^TR[0-9]{24}$/u.test(girdi.iban.replace(/\\s/gu, \"\"))) throw new Error(\"IBAN yok; ödeme durur\");\n  if (!girdi.kargoSozlesme) throw new Error(\"kargo yok; mağaza durur\");\n  return \"acik\";\n}\nif (\n  magazaAc({ vergiNo: \"1234567890\", unvan: \"Tezgah Ltd\", iban: \"TR110006400000111111111111\", kargoSozlesme: true }) !==\n  \"acik\"\n) {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "eticaret-masterclass-3",
    order: 3,
    title: "Ürün Listeleme ve SEO: Başlık, Barkod, Görsel ve Kategori",
    intro: "Hoş geldiniz. Bu bölümde Ürün Listeleme ve SEO: Başlık, Barkod, Görsel ve Kategori konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Sen pazarda tezgâha «şey» yazıp etiketsiz kutu koydun mu. Alıcı bakmaz, zabıta iner. Başlık ve barkod nerede. Liste başlığı marka + ürün + niteliktir. Barkod (GTIN) kutunun kimliğidir. Fail-closed: barkod, kategori ve kendi çekilmiş görsel yoksa ilan durur; çalıntı fotoğraf açılmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. SEO için 40 anahtar yığılmış, barkod boş, görsel netten. Sipariş gelir, iade yağar. Ne yalan. Yığın anahtar arama değil, ceza doğurur. Boş barkod mükerrer ilan ve yanlış üründür. Fail-closed: GTIN yoksa ilan durur; başlık 80 karakterde net durur, spam yığılmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Liste kapısını yaz. Boş barkod ve çalıntı görseli kır. Kategori ağacı pazar yerinindir; sen uydurmazsın. Başlıkta marka ve ölçü durur. Görsel senin çekimindir; filigranlı stok fotoğraf kapıyı açmaz. Rakibin fotoğrafını «hızlı açılsın» diye basarsak. Çalıntı görsel iade ve ceza doğurur. Fail-closed sahip yoksa ilan durur. Liste durunca stok kapısına geçeriz.",
    summary: "Bu dersle Ürün Listeleme ve SEO: Başlık, Barkod, Görsel ve Kategori becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Başlık net, barkod, kategori, kendi görsel. Sonraki adım stok mu. Liste durunca sayaç kapısına geçeriz. Bir sonraki bölümde seni stok ve fiyat otomasyonu bekliyor.",
    quiz: [
      mcq(
        "q_etic3_1",
        "İlan başlığında ne durur?",
        ["Yalnız emoji", "Marka, ürün ve nitelik; spam yığın yoktur", "Yalnız fiyat", "Rakip adı"],
        1,
      ),
      mcq(
        "q_etic3_2",
        "Fail-closed barkod (GTIN) boşken ne yapar?",
        ["Yine yayınlar", "İlanı durdurur; kimlik uydurulmaz", "SKU’yu barkod sayar", "SEO düzeltir"],
        1,
      ),
      mcq(
        "q_etic3_3",
        "Çalıntı stok fotoğrafı ile ilan?",
        ["Hızlı teslim", "Yasaktır; görsel sahip değilse ilan durur", "Filigran yeter", "Kategori düzeltir"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function ilanAc(girdi: {\n  baslik: string;\n  barkod: string;\n  kategori: string;\n  gorselSahip: boolean;\n}): \"acik\" {\n  const baslik = girdi.baslik.trim();\n  if (baslik.length < 12 || baslik.length > 80) throw new Error(\"başlık yok; ilan durur\");\n  if (!/^\\d{8,14}$/u.test(girdi.barkod.trim())) throw new Error(\"barkod yok; ilan durur\");\n  if (!girdi.kategori.trim()) throw new Error(\"kategori yok; ilan durur\");\n  if (!girdi.gorselSahip) throw new Error(\"görsel çalıntı; ilan durur\");\n  return \"acik\";\n}\nif (\n  ilanAc({ baslik: \"Marka Pamuk Tişört M Beyaz\", barkod: \"8690123456789\", kategori: \"giyim\", gorselSahip: true }) !==\n  \"acik\"\n) {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "eticaret-masterclass-4",
    order: 4,
    title: "Stok ve Fiyat Otomasyonu: Çoklu Pazar Yeri Senkronu",
    intro: "Hoş geldiniz. Bu bölümde Stok ve Fiyat Otomasyonu: Çoklu Pazar Yeri Senkronu konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Sen aynı kutuyu iki tezgâha yazdın mı. Biri sattı, öteki hâlâ «var» diyor. İkinci müşteri boş kutu alır. Sayaç nerede. Stok tek defterdir. Trendyol ve Hepsiburada aynı SKU’yu paylaşır. Fail-closed: senkron yoksa veya fiyat maliyetin altındaysa ilan durur; eksi stok satılmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. İki vitrin, stok 3. İkisi birden 3 sattı. Ekran yeşil. Ne patlar. Oversell: altı sipariş, üç kutu. İptal ve puan düşer. Fail-closed: rezervasyon düşmeden ikinci satış açılmaz; fiyat maliyeti ezmez.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Sayaç kapısını yaz. Eksi stok ve maliyet altı fiyatı kır. Merkez stok düşer, vitrinler kopyadır. Fiyat otomasyonu rakibi kör kopyalamaz; taban maliyet + komisyondur. «En ucuz olayım» tabanı ezerse kapı kapanır. Rakip 1 ₺ indirince biz de eksi kâra inersek. Kör fiyat savaşı defteri yer. Fail-closed taban altında ilan durur. Sayaç durunca kargo kapısına geçeriz.",
    summary: "Bu dersle Stok ve Fiyat Otomasyonu: Çoklu Pazar Yeri Senkronu becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Tek defter, rezerv, taban fiyat. Oversell yok. Sonraki adım kargo mu. Sayaç durunca operasyon kapısına geçeriz. Bir sonraki bölümde seni müşteri iletişimi ve kargo/iade bekliyor.",
    quiz: [
      mcq(
        "q_etic4_1",
        "İki pazar yerinde stok nasıl durur?",
        ["İki ayrı yalan sayaç", "Tek merkez defter; vitrin kopyadır", "Yalnız Trendyol sayar", "Fiyat yeter"],
        1,
      ),
      mcq(
        "q_etic4_2",
        "Fail-closed rezerv doluyken ikinci satış?",
        ["Yine satılır", "Durur; oversell açılmaz", "İade sonra düzelir", "Puan gizler"],
        1,
      ),
      mcq(
        "q_etic4_3",
        "Fiyat maliyet + komisyon tabanının altında?",
        ["Rekabet için doğru", "İlan durur; kör savaş kâr basmaz", "Pazar yeri tamamlar", "SEO düzeltir"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function stokSat(girdi: { merkez: number; rezerv: number; fiyatKurus: number; tabanKurus: number }): number {\n  if (!Number.isInteger(girdi.merkez) || girdi.merkez < 0) throw new Error(\"stok yok; satış durur\");\n  const kalan = girdi.merkez - girdi.rezerv;\n  if (kalan <= 0) throw new Error(\"rezerv dolu; oversell yok\");\n  if (!Number.isInteger(girdi.fiyatKurus) || girdi.fiyatKurus < girdi.tabanKurus) {\n    throw new Error(\"fiyat taban altında; ilan durur\");\n  }\n  return kalan - 1;\n}\nif (stokSat({ merkez: 3, rezerv: 0, fiyatKurus: 19_900, tabanKurus: 12_000 }) !== 2) {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "eticaret-masterclass-5",
    order: 5,
    title: "Müşteri İletişimi, Kargo Takibi ve İade Operasyonu",
    intro: "Hoş geldiniz. Bu bölümde Müşteri İletişimi, Kargo Takibi ve İade Operasyonu konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Sen tezgâhta soruya cevap vermeden paketi attın mı. Kutu kaybolur, müşteri bağırır. Mesaj ve kargo fişi nerede. Mesaj SLA’sı satıcı puanıdır. Kargo takip numarası fiştir. Fail-closed: takip yoksa «teslim» basılmaz; iade kaydı boşsa para iadesi uydurulmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Sohbet 48 saat suskun, kargo «yolda» ama fiş yok. Ekran teslim yeşili. Ne yalan. Sahte teslim iade ve ceza doğurur. Geç cevap puanı yer, vitrin düşer. Fail-closed: takip numarası ve süre dolmadan teslim basılmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Operasyon kapısını yaz. Fişsiz teslim ve boş iadeyi kır. Kargo kaydı barkod ve taşıyıcı ister. İade önce ürün durur, sonra para; «hemen iade ettim» fişsiz yalandır. Mesaj süresi aşıldıysa sipariş kapanmaz, puan durur. İade talebinde ürün gelmeden parayı basarsak. Fişsiz iade defteri yer. Fail-closed ürün kaydı yoksa para durur. Operasyon durunca dört kapı kapanışına geçeriz.",
    summary: "Bu dersle Müşteri İletişimi, Kargo Takibi ve İade Operasyonu becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Takip fişi, 24 saat mesaj, iade ürün önce. Sonraki adım proje mi. Operasyon durunca teslim kapısına geçeriz. Bir sonraki bölümde seni mağaza kapanış projesi bekliyor.",
    quiz: [
      mcq(
        "q_etic5_1",
        "«Teslim» ne zaman basılır?",
        ["Paket çıkınca", "Takip numarası durunca; fişsiz teslim yok", "Müşteri susunca", "Puan yeşilince"],
        1,
      ),
      mcq(
        "q_etic5_2",
        "Fail-closed mesaj 24 saati aşınca?",
        ["Sipariş kapanır", "Puan durur; SLA yalanı basılmaz", "Kargo düzeltir", "İade kapanır"],
        1,
      ),
      mcq(
        "q_etic5_3",
        "İade parası ürün kaydı yokken?",
        ["Hemen basılır", "Durur; ürün fişi önce gelir", "Puan yeter", "Komisyon düzeltir"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function teslimBas(girdi: { takipNo: string; mesajSaat: number; iadeKayit: boolean; iadeUrun: boolean }): \"ok\" {\n  if (!girdi.takipNo.trim()) throw new Error(\"takip yok; teslim durur\");\n  if (girdi.mesajSaat > 24) throw new Error(\"SLA aşıldı; puan durur\");\n  if (girdi.iadeKayit && !girdi.iadeUrun) throw new Error(\"ürün yok; para iadesi durur\");\n  return \"ok\";\n}\nif (teslimBas({ takipNo: \"TR1234567890\", mesajSaat: 4, iadeKayit: false, iadeUrun: false }) !== \"ok\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "eticaret-masterclass-6",
    order: 6,
    title: "Mini Proje: Mağaza, Liste, Stok ve Kargo Dört Kapısı",
    intro: "Hoş geldiniz. Bu bölümde Mini Proje: Mağaza, Liste, Stok ve Kargo Dört Kapısı konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Tezgâh duruyor: belgesiz mağaza, barkodsuz ilan, eksi stok, fişsiz kargo. Sen müdüre hangi vitrini uzatırsın. Dört kapı durmadan uzatmazsın. Mağaza, liste, stok, kargo. Fail-closed bir kapı açıkken teslim basılmaz. Bu iskelet canlı Trendyol hesabı iddiası taşımaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ekranda sipariş parlıyor, takip yok. İş bitmiş mi sayılıyor. Parıltı yalandır. Belgesiz mağaza, boş barkod, oversell, fişsiz teslim — biri duruyorsa mühür vurulmaz. Vitrin defterle aynıdır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Tek fonksiyon: vergi, barkod, stok, takip. Biri kırıkken dur. `vitrin` dört kapıyı sırayla sorar. Vergi boşsa durur. Barkod yoksa durur. Stok sıfırsa durur. Takip yoksa durur. Hepsi durunca «hazir» basılır. Bu iskelet canlı pazar yeri hesabına bağlı mı. Sınavda ne ölçülür. Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Dört kapı: mağaza, liste, stok, kargo.",
    summary: "Bu dersle Mini Proje: Mağaza, Liste, Stok ve Kargo Dört Kapısı becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Masterclass kapanış bu mu: tezgâh, mağaza, liste, stok, kargo, sınava gir. Bu. Tekil Masterclass halkası kapanır. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
    quiz: [
      mcq(
        "q_etic6_1",
        "Mini projedeki vitrin canlı Trendyol hesabı mıdır?",
        ["Evet, zorunlu hesap", "Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur", "Yalnız Hepsiburada", "Canlı kargo"],
        1,
      ),
      mcq(
        "q_etic6_2",
        "Dört kapıdan biri açıkken teslim?",
        ["Yeşil basılır", "Fail-closed; mühür vurulmaz", "Üçü yeter", "Sipariş yeter"],
        1,
      ),
      mcq(
        "q_etic6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Mağaza açılınca"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function vitrin(girdi: {\n  vergiNo: string;\n  barkod: string;\n  stok: number;\n  takipNo: string;\n}): \"hazir\" {\n  if (!girdi.vergiNo.trim()) throw new Error(\"vergi yok; mağaza durur\");\n  if (!/^\\d{8,14}$/u.test(girdi.barkod.trim())) throw new Error(\"barkod yok; ilan durur\");\n  if (!Number.isInteger(girdi.stok) || girdi.stok <= 0) throw new Error(\"stok yok; satış durur\");\n  if (!girdi.takipNo.trim()) throw new Error(\"takip yok; teslim durur\");\n  return \"hazir\";\n}\nif (vitrin({ vergiNo: \"1234567890\", barkod: \"8690123456789\", stok: 8, takipNo: \"TR1\" }) !== \"hazir\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
] as const;

const ETICARET_MASTERCLASS_LESSON_QUIZZES: AcademyExamQuestion[] = ETICARET_MASTERCLASS_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları (30–50 bandı). */
export const ETICARET_MASTERCLASS_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...ETICARET_MASTERCLASS_LESSON_QUIZZES,
  mcq("q_etic_p1", "Tezgâh bu derste nedir?", ["Senin depon", "Pazar yeri vitrini; sen satıcı kaydısın", "Kargo", "Reklam"], 1),
  mcq("q_etic_p2", "Stok sıfırken ilan?", ["Satılır", "Fail-closed durur", "Komisyon sıfır", "Puan yeter"], 1),
  mcq("q_etic_p3", "Brüt ciro kâr mı?", ["Evet", "Hayır; komisyon ve kargo düşer", "Puan yeter", "SEO yeter"], 1),
  mcq("q_etic_p4", "Mağaza dörtlüsü?", ["Logo", "Vergi, unvan, IBAN, kargo", "Yalnız IBAN", "Yalnız renk"], 1),
  mcq("q_etic_p5", "IBAN boşken ödeme?", ["Nakit", "Durur", "Komşu IBAN", "Puan"], 1),
  mcq("q_etic_p6", "Kendi kurye sözleşme mi?", ["Evet", "Hayır; yazılı kargo fişi", "Trendyol’da evet", "Puan"], 1),
  mcq("q_etic_p7", "Başlık ne taşır?", ["Emoji", "Marka, ürün, nitelik", "Yalnız fiyat", "Rakip"], 1),
  mcq("q_etic_p8", "Barkod boşken ilan?", ["Yayın", "Durur; GTIN yok", "SKU yeter", "SEO"], 1),
  mcq("q_etic_p9", "Çalıntı görsel?", ["Hız", "İlan durur", "Filigran yeter", "Kategori"], 1),
  mcq("q_etic_p10", "İki vitrin stok?", ["İki yalan", "Tek merkez defter", "Yalnız HB", "Fiyat"], 1),
  mcq("q_etic_p11", "Oversell?", ["Satılır", "Rezerv doluysa durur", "İade düzeltir", "Puan gizler"], 1),
  mcq("q_etic_p12", "Taban altı fiyat?", ["Rekabet", "İlan durur", "Pazar tamamlar", "SEO"], 1),
  mcq("q_etic_p13", "Mini proje teslimi?", ["Bir kapı", "Dört kapı durunca", "Satın alınca", "Sipariş yeşilince"], 1),
  mcq("q_etic_p14", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
];
