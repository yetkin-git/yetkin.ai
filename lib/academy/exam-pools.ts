import type { AcademyExamQuestion } from "@/lib/academy/types";
import type { CurriculumModule } from "@/lib/academy/curricula/types";
import {
  ACADEMY_EXAM_POOL_MAX,
  ACADEMY_EXAM_POOL_MIN,
} from "@/lib/academy/exam-duration";
import { ECOMMERCE_AI_EXAM_QUESTIONS } from "@/lib/academy/exam-pools-ecommerce";
import { SOCIAL_MEDIA_AI_EXAM_QUESTIONS } from "@/lib/academy/exam-pools-social";
import { CHATBOT_NOCODE_EXAM_QUESTIONS } from "@/lib/academy/exam-pools-chatbot";
import { PROMPT_PRACTICE_EXAM_QUESTIONS } from "@/lib/academy/exam-pools-prompt";
import { mcq } from "@/lib/academy/exam-pools-growth";
export { ECOMMERCE_AI_EXAM_QUESTIONS } from "@/lib/academy/exam-pools-ecommerce";
export { SOCIAL_MEDIA_AI_EXAM_QUESTIONS } from "@/lib/academy/exam-pools-social";
export { CHATBOT_NOCODE_EXAM_QUESTIONS } from "@/lib/academy/exam-pools-chatbot";
export { PROMPT_PRACTICE_EXAM_QUESTIONS } from "@/lib/academy/exam-pools-prompt";

/**
 * Ofis AI mühür havuzu — canlı slug `01_office_ai`.
 * 42 özgün kök; ders mini sınavı (`q_off_l*`) gömülmez.
 * Platform-meta («baraj kaç», «sınav ne zaman») yok. Yalnız öğretilen ofis refleksi.
 */
export const OFFICE_AI_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  mcq(
    "q_off_1",
    "Ofiste yapay zekâyı konumlandırırken pedagojik olarak en doğru yaklaşım nedir?",
    [
      "Mühendislik düzeyinde kodlama gerektiren karmaşık bir yazılım",
      "Masada oturan ve doğru talimatlarla çalışan akıllı bir dijital stajyer",
      "Tüm kararları insansız alan otonom bir yönetici",
      "Sadece grafik ve resim çizen bir tasarım aracı",
    ],
    1,
  ),
  mcq(
    "q_off_2",
    "Cuma mesaisinde gelen Excel’de logo ve birleşik boş satırlar üstte, asıl başlık A4’tedir. A1 eşiği için ilk iş nedir?",
    [
      "A1’i boş bırakıp yapay zekâya ‘veri dördüncü satırdan başlıyor’ diye uzun tarif yazmak",
      "Üstteki dekoratif ve boş satırları temizleyip ilk sütun başlığını A1’e oturtmak",
      "İlk üç satırı gizleyip tabloyu PDF yapmak",
      "Birleşik hücreleri olduğu gibi bırakmak",
    ],
    1,
  ),
  mcq(
    "q_off_3",
    "Tutar hücresi sayı gibi durur ama TOPLA’ya girmez. Gizli kesme işaretini açığa çıkarmanın pratik yolu nedir?",
    [
      "Hücreyi sarıya boyamak",
      "Şüpheli hücreye tıklayıp F2 ile düzenleme modunda baştaki metin ayracını görmek",
      "Yazı tipini değiştirmek",
      "Sütunu PDF’e basmak",
    ],
    1,
  ),
  mcq(
    "q_off_4",
    "Excel tablosunu yapay zekâya verirken Üç Kapı sırası hangisidir?",
    [
      "Önce gemini.google.com, sonra ataş, en son Copilot şeridi",
      "1. Kapı yerleşik panel (Copilot / Gemini şeridi), 2. Kapı ataş (Excel tablosu, Word belgesi, PowerPoint sunusu), 3. Kapı maskeli kısa özet",
      "Önce VBA, sonra ekran görüntüsü zinciri",
      "Ham tabloyu her zaman dış sohbete yapıştırmak",
    ],
    1,
  ),
  mcq(
    "q_off_5",
    "30 sayfalık bir sözleşmeyi yapay zekâya analiz ettirirken hangi yaklaşım en güvenli ve verimlidir?",
    [
      "Sözleşmeyi okumadan yapay zekânın 'sorun yok' demesine güvenmek",
      "Cezai şart, fesih ve gizlilik gibi kritik maddelere odaklı özet ve risk listesi talep etmek",
      "Sözleşmeyi sosyal medyada paylaşmak",
      "Sadece ilk sayfayı yüklemek",
    ],
    1,
  ),
  mcq(
    "q_off_6",
    "PowerPoint taslağı çıkarırken öğretilen doğru kapı hangisidir?",
    [
      "VBA makrosu yazdırıp tek tıkla slayt basmak",
      "Copilot varsa şeride yazmak; yoksa PowerPoint sunusunu ataşlamak",
      "Gamma veya Marp olmadan slayt yapılamaz demek",
      "Tüm paragrafları tek slayta yapıştırıp puntoyu küçültmek",
    ],
    1,
  ),
  mcq(
    "q_off_7",
    "Yüzlerce okunmamış e-posta biriktiğinde yapay zekânın rolü ne olmalıdır?",
    [
      "Bütün mailleri okumadan silmek",
      "İletileri önem etiketine ayırtmak, taslak hazırlatmak; göndermeyi insana bırakmak",
      "Gelen tüm maillere otomatik 'tamam' yanıtı göndermek",
      "Sunucunun fişini çekmek",
    ],
    1,
  ),
  mcq(
    "q_off_8",
    "Düzensiz bütçe dosyasını düzenli tabloya çekerken denetim güvenliğini tutan yaklaşım hangisidir?",
    [
      "Orijinal sayfayı silip tek sayfada devam etmek",
      "Orijinal düzensiz sayfayı koruyup yeni sayfada A1’den düzenli tablo kurmak ve yan yana doğrulamak",
      "Birleşik hücreleri tek hamlede çözüp boşluklara sıfır yazmak",
      "Tabloyu e-posta gövdesine yapıştırıp oradan kontrol etmek",
    ],
    1,
  ),
  mcq(
    "q_off_9",
    "Üç maddelik yönetim özetinde ‘karar notu’ ile gözlem cümlesi arasındaki fark nedir?",
    [
      "Gözlem finans, karar notu insan kaynaklarıdır",
      "Gözlem tabloyu özetler; karar notu onay, bütçe veya yön ister",
      "Karar notu sayı taşımaz",
      "Gözlem mutlaka teknik jargon ister",
    ],
    1,
  ),
  mcq(
    "q_off_10",
    "Yapay zekânın satış özetinde satır toplamı ile genel toplam çelişirse kural nedir?",
    [
      "Model asla hata yapmaz, doğrudan gönderilir",
      "Yapay zekâ taslak hazırlar; kritik sayıyı insan kaynak evrattan kilitler",
      "Sorumluluk modele aittir",
      "Metin kısaysa doğrulamaya gerek yoktur",
    ],
    1,
  ),
  mcq(
    "q_off_11",
    "Yapay zekânın akıcı yönetim özeti inandırıcı durur. Hata avında ilk kilit nedir?",
    [
      "Metin akıcıysa sayıyı kilitlemeye gerek yoktur",
      "Kritik sayıyı kaynak evraktan veya TOPLA ile insan kilitler",
      "Model imza atabilir",
      "Sıcaklığı düşürmek yeter",
    ],
    1,
  ),
  mcq(
    "q_off_12",
    "Cuma 30 dakikalık rutin nasıl bölünür?",
    [
      "Yalnız e-posta, üç kez",
      "10 dakika Excel + 10 dakika slayt + 10 dakika kutu",
      "Bütün haftayı tek oturumda bitirmek",
      "Kaseti iki kez dinlemek",
    ],
    1,
  ),
  mcq(
    "q_off_13",
    "Yapay zekâya 'bana bir rapor yaz' demek neden zayıf bir tariftir?",
    [
      "Çünkü yapay zekâ Türkçe anlamaz",
      "Çünkü alıcı, amaç, biçim ve kısıt yoksa stajyer genel geçer metin üretir",
      "Çünkü rapor ancak Excel'de yazılır",
      "Çünkü tarif her zaman en az 2000 kelime olmalıdır",
    ],
    1,
  ),
  mcq(
    "q_off_14",
    "Gelen kutusunu yapay zekâyla sıfırlarken doğru sıra hangisidir?",
    [
      "Hepsine otomatik yanıt gönder, sonra sil",
      "Önem etiketi, taslak, insan onayı, arşiv",
      "Son üç günü çöpe at",
      "Yalnız bültenleri oku",
    ],
    1,
  ),
  mcq(
    "q_off_15",
    "Bölge satırları 50.450, modelin genel toplamı 59.450 ise en güvenilir adım nedir?",
    [
      "Modele üç kez daha ‘emin misin’ diye sormak",
      "Genel toplamı e-tablo TOPLA formülüne yazdırıp aritmetiği tablo motoruna bırakmak",
      "Satırları silip model toplamını tek gerçek saymak",
      "Sıcaklığı artırıp yeni toplam üretmek",
    ],
    1,
  ),
  mcq(
    "q_off_16",
    "Düzensiz tabloda sayı gibi görünen metin hücreleri varsa yapay zekâya ne tarif edilir?",
    [
      "Sadece ‘düzelt’ demek",
      "Hangi sütunun sayı, hangisinin metin olması gerektiği ve gizli kesme işareti şüphesi",
      "Tüm çalışma kitabını silmek",
      "Makroyu devre dışı bırakmak",
    ],
    1,
  ),
  mcq(
    "q_off_17",
    "Cuma 30 dakikalık ofis rutininin amacı nedir?",
    [
      "Sınavı Cuma 30 kapanış dersinden önce açmak",
      "Excel, slayt ve e-postayı takvimde duran kısa bir bloğa bağlamak",
      "Bütün haftayı tek oturumda bitirmek",
      "Kaseti iki kez dinlemek",
    ],
    1,
  ),
  mcq(
    "q_off_18",
    "Uzun bir rapordan yönetici özeti isterken hedef kitle nasıl belirtilir?",
    [
      "Belirtilmez, model tahmin eder",
      "Alıcı rolü (genel müdür, finans) ve beklenen madde sayısı yazılır",
      "Sadece ilk paragraf kopyalanır",
      "Rapor PDF'e çevrilip bırakılır",
    ],
    1,
  ),
  mcq(
    "q_off_19",
    "PowerPoint konuşmacı notları için yapay zekâdan ne istenmelidir?",
    [
      "Slayt başına 1-2 dakikalık konuşma iskeleti ve geçiş cümlesi",
      "Sadece rastgele emoji",
      "Slaytları silmek",
      "Videoya dönüştürmek",
    ],
    0,
  ),
  mcq(
    "q_off_20",
    "Boş slayt sendromunu kırmak için ilk tarife ne konur?",
    [
      "Konu, süre, kitle ve slayt sayısı",
      "Sadece 'güzel olsun'",
      "Şirket logosunun piksel boyutu",
      "Yazıcı ayarı",
    ],
    0,
  ),
  mcq(
    "q_off_21",
    "Gelen kutusunu önceliklendirirken yapay zekâya hangi etiketler verilebilir?",
    [
      "Acil / bu hafta / bilgi amaçlı gibi açık kovalar",
      "Hepsini sil",
      "Otomatik 'tamam' yanıtı",
      "Sunucu kapat",
    ],
    0,
  ),
  mcq(
    "q_off_22",
    "Yapay zekânın yazdığı tedarikçi yanıt taslağı için doğru kural nedir?",
    [
      "Taslağı okumadan göndermek",
      "Parametreyi ve tonu verip taslak aldırmak, insanın kontrol edip onaylaması",
      "Yanıtlamayı atlayıp iletiyi arşivlemek",
      "Modele sert üslup seçtirip hukuki onaysız basmak",
    ],
    1,
  ),
  mcq(
    "q_off_23",
    "Metinden slayt çıkarırken ‘görsel yönlendirme’ kutusunun işi nedir?",
    [
      "Telifli stok görsel satın almak",
      "Grafik türü, hiyerarşi veya şema için somut tasarım önerisi vermek",
      "Konuşmacının kelimesi kelimesine metnini saklamak",
      "Yazı tipi boyutunu kilitlemek",
    ],
    1,
  ),
  mcq(
    "q_off_24",
    "CRM ekran görüntüsünü sohbet kutusuna yapıştırmak neden üçüncü kapı değildir?",
    [
      "Ekran görüntüsü her zaman maskelidir",
      "Ham kimlik ve sır görüntüde durur; üçüncü kapı yalnız maskeli kısa özettir",
      "PDF yapmak üçüncü kapıdır",
      "Copilot şeridi ekran görüntüsü ister",
    ],
    1,
  ),
  mcq(
    "q_off_25",
    "Vergi matrahı veya net ciro gibi yüksek riskli sayıda ‘insan gözü kilidi’ ne demektir?",
    [
      "Yalnız başlık formatına bakmak",
      "Ayda bir rastgele hücre seçmek",
      "Kaynak belgeden uzmanla doğrulanmış değeri sabitlemek; modeli serbest bırakmamak",
      "Tüm formülleri silmek",
    ],
    2,
  ),
  mcq(
    "q_off_26",
    "İç içe birleşik hücre ve ara toplamlı ham veride ilk refleks hangisidir?",
    [
      "Orijinali silmek",
      "Birleşik hücre ve boş satır düzenini tarife yazıp temiz tabloyu yeni sayfada istemek",
      "Hepsini PDF yapmak",
      "Yalnız rengi değiştirmek",
    ],
    1,
  ),
  mcq(
    "q_off_27",
    "Yerleşik araç eşleşmesi hangisidir?",
    [
      "Outlook’a Gemini, Gmail’e Copilot zorlanır",
      "Outlook → Copilot, Gmail → Gemini, Word/Excel → ataş ile dosya yükleme",
      "Her yerde yalnızca ChatGPT",
      "Eşleşme yoktur",
    ],
    1,
  ),
  mcq(
    "q_off_28",
    "Yapay zekâ resmî dilekçe taslağı yazdı. Hangisi insanda kalır?",
    [
      "Hitap satırını modele bırakmak",
      "Tarih, sayı, unvan ve imza; uydurma kanun maddesini silmek",
      "Kanun maddesini modelden olduğu gibi basmak",
      "Dilekçeyi ataşlamadan sayfa sayfa kopyalamak",
    ],
    1,
  ),
  mcq(
    "q_off_29",
    "Yönetim özeti isterken tarife en az hangisi konur?",
    [
      "Yalnız ‘özetle’ demek",
      "Alıcı rolü, üç madde ve bir karar veya eylem cümlesi",
      "Tüm satırları slayta yapıştırmak",
      "Grafik rengi ve punto",
    ],
    1,
  ),
  mcq(
    "q_off_30",
    "Slayt yüzeyinin metin yığını olmaması için detay nereye konur?",
    [
      "Tüm açıklama slayta yapıştırılır, punto küçültülür",
      "Ana mesaj slaytta kalır; bağlam konuşmacı notuna alınır",
      "Görsel yönlendirme iptal edilir",
      "Metin rastgele dağıtılır",
    ],
    1,
  ),
  mcq(
    "q_off_31",
    "Gelen kutusunu Gmail dışına kopyalamadan süzmenin doğru yolu hangisidir?",
    [
      "Maili seçip ChatGPT penceresine yapıştırmak",
      "Ekran görüntüsü alıp harici sohbete yüklemek",
      "Gmail yan panelindeki Gemini’ye istemi yazıp kutuyu yerinde taramak",
      "Mailleri PDF’e basıp modele vermek",
    ],
    2,
  ),
  mcq(
    "q_off_32",
    "Üç kapı hiyerarşisinde öğretilen varsayılan yol hangisi değildir?",
    [
      "Gmail içinde Gemini paneli",
      "Word veya Excel dosyasını ataş ile yükleme",
      "Maili kopyalayıp ekran görüntüsüyle dış sohbete taşıma",
      "Copilot lisansı varsa şeritten okutma",
    ],
    2,
  ),
  mcq(
    "q_off_33",
    "30 sayfalık sözleşmede cezai şart ve fesih farklı sayfalardadır. En güvenilir analiz hangisidir?",
    [
      "Sayfaları ayrı ayrı kopyalayıp sohbete yapıştırmak",
      "Sözleşmeyi Word belgesi olarak ataşlayıp dosyanın bütününü inceletmek",
      "Yalnız ilk sayfayı yüklemek",
      "Ekran görüntüsü zinciri basmak",
    ],
    1,
  ),
  mcq(
    "q_off_34",
    "Üç Kapı’da 3. kapı (son çare) hangisidir?",
    [
      "Bütün gelen kutusunu ekran görüntüsüyle dış sohbete taşımak",
      "Ham bilançoyu sayfa sayfa yapıştırmak",
      "İsim, IBAN ve ticari sır maskelenmiş kısa özet yapıştırmak",
      "Copilot dururken şeridi atlayıp hamal taşımak",
    ],
    2,
  ),
  mcq(
    "q_off_35",
    "Word’de sözleşme, dilekçe ve rapor aynı ataş kapısından gider. Doğru istem disiplini hangisidir?",
    [
      "Üç işi tek istemde karıştırmak",
      "Her işi ayrı istemle sormak; imza ve tarihi insanda bırakmak",
      "Kanun maddesini modelden olduğu gibi basmak",
      "Dosyayı ataşlamadan sayfa sayfa kopyalamak",
    ],
    1,
  ),
  mcq(
    "q_off_36",
    "PowerPoint’te 1. Kapı hangisidir?",
    [
      "Gamma hesabı açmak",
      "Marp ile markdown derlemek",
      "Şeritteki Copilot paneline istemi yazmak",
      "VBA makrosu üretmek",
    ],
    2,
  ),
  mcq(
    "q_off_37",
    "Müşteri adı, telefon ve IBAN aynı tabloda durur. Yapay zekâya vermeden önce doğru refleks hangisidir?",
    [
      "Ham tabloyu olduğu gibi sohbete yapıştırmak",
      "Adı, telefonu ve IBAN’ı maskeleyip kısa soru bırakmak",
      "CRM’in tüm ekran görüntüsünü yüklemek",
      "Dosyayı silip modeli tahmin ettirmek",
    ],
    1,
  ),
  mcq(
    "q_off_38",
    "Kamu ürün kataloğu ile kişiye bağlı müşteri satırı aynı güvenlik sınıfında mıdır?",
    [
      "Evet; ikisi de ataşla yüklenir",
      "Hayır; kamu katalog cümlesi gidebilir, kişiye bağlı satır ham haliyle gitmez",
      "KVKK yalnızca e-postayı kapsar",
      "Model sildiği için yüklemek serbesttir",
    ],
    1,
  ),
  mcq(
    "q_off_39",
    "Copilot veya Gemini lisansı, ham müşteri listesini sohbete yüklemeyi yasal kılar mı?",
    [
      "Evet; kiracı lisansı ruhsattır",
      "KVKK yalnızca e-postayı kapsar",
      "Hayır; lisans, kişisel veri ve şirket sırrı kuralını değiştirmez",
      "Model sildiği için yüklemek serbesttir",
    ],
    2,
  ),
  mcq(
    "q_off_40",
    "Şirket sırrı (henüz açıklanmamış fiyat, maliyet) sohbete nasıl gider?",
    [
      "Kişisel veri olmadığı için serbestçe yapıştırılır",
      "Ham haliyle gitmez; kamu cümlesi veya maskeli kısa özet yeter",
      "Yalnız PDF’e basılır",
      "Model imza atarsa serbesttir",
    ],
    1,
  ),
  mcq(
    "q_off_41",
    "Sohbet kutusuna yanlışlıkla müşteri listesi yapıştırıldı. Hangisi yanlıştır?",
    [
      "Sohbet arşiv değildir; silmek yüklemiş olmayı geri almaz",
      "Bundan sonra maske refleksini kilitlemek gerekir",
      "Mesajı silmek KVKK ihlalini hiç olmamış sayar",
      "İnsan bekçidir; model bekçi değildir",
    ],
    2,
  ),
  mcq(
    "q_off_42",
    "Maskelemek ne demektir?",
    [
      "Dosyayı silmek",
      "Ayşe Kaya yerine Müşteri A, IBAN yerine MASKELİ_IBAN yazıp soruyu bırakmak",
      "Adı baş harfe, IBAN’ı son dört haneye indirip soruyu bırakmak",
      "Tüm satırları PDF yapmak",
    ],
    1,
  ),
];

const MODULE_POOLS: Record<string, readonly AcademyExamQuestion[]> = {
  "CURR-OFFICE-AI-101": OFFICE_AI_EXAM_QUESTIONS,
  "CURR-ECOMMERCE-AI-102": ECOMMERCE_AI_EXAM_QUESTIONS,
  "CURR-SOCIAL-MEDIA-AI-103": SOCIAL_MEDIA_AI_EXAM_QUESTIONS,
  "CURR-CHATBOT-NOCODE-104": CHATBOT_NOCODE_EXAM_QUESTIONS,
  "CURR-PROMPT-PRACTICE-105": PROMPT_PRACTICE_EXAM_QUESTIONS,
};

/** Canlı yayın slug havuzu — ingest edilmiş kanon SKU. */
const POOL_BY_SLUG: Record<string, readonly AcademyExamQuestion[]> = {
  "01_office_ai": OFFICE_AI_EXAM_QUESTIONS,
  "02_ecommerce_ai": ECOMMERCE_AI_EXAM_QUESTIONS,
  "03_social_media_ai": SOCIAL_MEDIA_AI_EXAM_QUESTIONS,
  "04_chatbot_nocode": CHATBOT_NOCODE_EXAM_QUESTIONS,
  "05_prompt_practice": PROMPT_PRACTICE_EXAM_QUESTIONS,
};

function assertAcademyExamPool(label: string, pool: readonly AcademyExamQuestion[]): void {
  if (pool.length < ACADEMY_EXAM_POOL_MIN || pool.length > ACADEMY_EXAM_POOL_MAX) {
    throw new Error(
      `${label} sınav havuzu ${ACADEMY_EXAM_POOL_MIN}–${ACADEMY_EXAM_POOL_MAX} aralığında olmalıdır (${pool.length}).`,
    );
  }
  const seen = new Set<string>();
  for (const question of pool) {
    if (seen.has(question.id)) {
      throw new Error(`${label} tekrarlayan soru kimliği: ${question.id}`);
    }
    seen.add(question.id);
    if (question.choices.length !== 4) {
      throw new Error(`${label} ${question.id} tam 4 şık ister.`);
    }
    if (
      !Number.isInteger(question.correctIndex) ||
      question.correctIndex < 0 ||
      question.correctIndex >= question.choices.length
    ) {
      throw new Error(`${label} ${question.id} doğru şık indeksi geçersiz.`);
    }
  }
}

assertAcademyExamPool("01_office_ai", OFFICE_AI_EXAM_QUESTIONS);
assertAcademyExamPool("02_ecommerce_ai", ECOMMERCE_AI_EXAM_QUESTIONS);
assertAcademyExamPool("03_social_media_ai", SOCIAL_MEDIA_AI_EXAM_QUESTIONS);
assertAcademyExamPool("04_chatbot_nocode", CHATBOT_NOCODE_EXAM_QUESTIONS);
assertAcademyExamPool("05_prompt_practice", PROMPT_PRACTICE_EXAM_QUESTIONS);

/**
 * Modül bazlı dinamik sınav havuzu çözücü.
 * Yeni CurriculumModule yapısını doğrudan destekler.
 */
export function academyExamPoolForModule(module: CurriculumModule): AcademyExamQuestion[] {
  if (module.examQuestions && module.examQuestions.length > 0) {
    return [...module.examQuestions];
  }
  return [...(MODULE_POOLS[module.moduleCode] ?? [])];
}

/**
 * Kurs slug veya modül koduna göre sınav havuzunu döner.
 */
export function academyExamPoolForSlug(slug: string): AcademyExamQuestion[] {
  const fromSlug = POOL_BY_SLUG[slug];
  if (fromSlug && fromSlug.length > 0) {
    return [...fromSlug];
  }
  const fromModule = MODULE_POOLS[slug];
  if (fromModule && fromModule.length > 0) {
    return [...fromModule];
  }
  return [];
}
