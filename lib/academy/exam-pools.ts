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
    "Ofiste yapay zekâyı masana nasıl oturtursun?",
    [
      "Kod yazman gereken karmaşık bir yazılım gibi",
      "Masadaki asistanın gibi: doğru istemle çalışır",
      "Tüm kararları senin yerine alan bir yönetici gibi",
      "Yalnız grafik ve resim çizen bir tasarım aracı gibi",
    ],
    1,
  ),
  mcq(
    "q_off_2",
    "Cuma mesaisinde gelen Excel’de logo ve birleşik boş satırlar üstte, asıl başlık A4’tedir. A1 kuralı için ilk iş nedir?",
    [
      "A1’i boş bırakıp yapay zekâya ‘veri dördüncü satırdan başlıyor’ diye uzun anlat",
      "Üstteki dekoratif ve boş satırları temizleyip ilk sütun başlığını A1’e oturt",
      "İlk üç satırı gizleyip tabloyu belgeye çevir",
      "Birleşik hücreleri olduğu gibi bırak",
    ],
    1,
  ),
  mcq(
    "q_off_3",
    "Tutar hücresi sayı gibi durur ama TOPLA’ya girmez. Gizli kesme işaretini açığa çıkarmanın pratik yolu nedir?",
    [
      "Hücreyi sarıya boya",
      "Şüpheli hücreye tıkla, klavyenin üstündeki F2 tuşuna bas (Mac'te Fn+F2) — hücre düzenleme açılır; kesme işaretini kontrol et",
      "Yazı tipini değiştir",
      "Sütunu belgeye bas",
    ],
    1,
  ),
  mcq(
    "q_off_4",
    "Excel tablosunu yapay zekâya verirken Üç Kapı sırası hangisidir?",
    [
      "Önce harici sohbet sitesine gitmek, sonra ataş, en son Copilot şeridi",
      "1. Kapı yerleşik panel (Copilot / Gemini şeridi), 2. Kapı ataş (Excel tablosu, Word belgesi, PowerPoint sunusu), 3. Kapı maskeli kısa özet",
      "Önce VBA, sonra ekran görüntüsü zinciri",
      "Ham tabloyu her zaman dış sohbete yapıştırmak",
    ],
    1,
  ),
  mcq(
    "q_off_5",
    "30 sayfalık bir sözleşmeyi yapay zekâya çözerken ne yaparsın?",
    [
      "Sözleşmeyi okumadan yapay zekânın 'sorun yok' demesine güvenirsin",
      "Cezai şart, fesih ve gizlilik gibi kritik maddelere odaklı özet ve risk listesi istersin",
      "Sözleşmeyi sosyal medyada paylaşırsın",
      "Sadece ilk sayfayı yüklersin",
    ],
    1,
  ),
  mcq(
    "q_off_6",
    "PowerPoint taslağını hangi kapıdan verirsin?",
    [
      "Boş slayta metni aynen yapıştırıp puntoyu küçültmek",
      "Copilot varsa şeride yazmak; yoksa PowerPoint sunusunu ataşlamak",
      "Önce tema süsleyip mesajı sona bırakmak",
      "On maddeyi tek slayta yığmak",
    ],
    1,
  ),
  mcq(
    "q_off_7",
    "Yüzlerce okunmamış e-posta biriktiğinde ne yaparsın?",
    [
      "Bütün iletileri okumadan silersin",
      "İletileri önem etiketine ayırırsın, taslak istersin; göndermezsin, sen onaylarsın",
      "Gelen tüm iletilere otomatik 'tamam' yanıtı gönderirsin",
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
    "Üç maddelik yönetim özetinde karar cümlesi ile gözlem cümlesi arasındaki fark nedir?",
    [
      "Gözlem finans, karar cümlesi insan kaynaklarıdır",
      "Gözlem tabloyu özetler; karar cümlesi onay, bütçe veya yön ister",
      "Karar cümlesi sayı taşımaz",
      "Gözlem mutlaka teknik jargon ister",
    ],
    1,
  ),
  mcq(
    "q_off_10",
    "Yapay zekânın satış özetinde satır toplamı ile genel toplam çelişirse ne yaparsın?",
    [
      "Model asla hata yapmaz, doğrudan gönderilir",
      "Yapay zekâ taslak hazırlar; kritik sayıyı kaynak hücreden kilitlersin",
      "Sorumluluk modele aittir",
      "Metin kısaysa doğrulamaya gerek yoktur",
    ],
    1,
  ),
  mcq(
    "q_off_11",
    "Yapay zekânın akıcı yönetim özeti inandırıcı durur. Hata avında ilk neyi kilitlersin?",
    [
      "Metin akıcıysa sayıyı kilitlemeye gerek yoktur",
      "Kritik sayıyı kaynak hücreden veya TOPLA ile kilitlersin",
      "Model imza atabilir",
      "Modele üç kez daha ‘emin misin’ diye sormak yeter",
    ],
    1,
  ),
  mcq(
    "q_off_12",
    "Cuma 30 dakikalık rutini nasıl bölersin?",
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
    "Yapay zekâya 'bana bir rapor yaz' demek neden zayıf bir istemdir?",
    [
      "Çünkü yapay zekâ Türkçe anlamaz",
      "Çünkü alıcı, amaç, Biçim ve kısıt yoksa masadaki asistan genel geçer metin üretir",
      "Çünkü rapor ancak Excel'de yazılır",
      "Çünkü istem her zaman en az 2000 kelime olmalıdır",
    ],
    1,
  ),
  mcq(
    "q_off_14",
    "Gelen kutusunu yapay zekâyla sıfırlarken hangi sırayla kapatırsın?",
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
    "Cari satırları 50.450, modelin genel toplamı 59.450 ise ne yaparsın?",
    [
      "Modele üç kez daha ‘emin misin’ diye sormak",
      "Genel toplamı Excel TOPLA formülüne yazıp aritmetiği Excel’e hesaplatmak",
      "Satırları silip model toplamını tek gerçek saymak",
      "Kişi adı geçen ham tabloyu aynen sohbete yapıştırmak",
    ],
    1,
  ),
  mcq(
    "q_off_16",
    "Düzensiz tabloda sayı gibi görünen metin hücreleri varsa yapay zekâya hangi istemi yazarsın?",
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
    "Cuma 30 dakikalık ofis rutini ne işe yarar?",
    [
      "Excel'i Pazartesi, slaytı Çarşamba, kutuyu Cuma yapmak",
      "Excel, slayt ve e-postayı takvime yazdığın kısa bir bloğa bağlamak",
      "Bütün haftayı tek oturumda bitirmek",
      "Kaseti iki kez dinlemek",
    ],
    1,
  ),
  mcq(
    "q_off_18",
    "Uzun bir rapordan yönetim özeti isterken alıcı nasıl belirtilir?",
    [
      "Belirtilmez, model tahmin eder",
      "Alıcı rolünü (genel müdür, finans müdürü) ve beklenen madde sayısını yazarsın",
      "Sadece ilk paragraf kopyalanır",
      "Rapor PDF'e çevrilip bırakılır",
    ],
    1,
  ),
  mcq(
    "q_off_19",
    "PowerPoint konuşmacı notları için yapay zekâdan ne istersin?",
    [
      "Slayt başına konuşma taslağı ve notunu istersin.",
      "Sadece rastgele emoji",
      "Slaytları silmek",
      "Videoya dönüştürmek",
    ],
    0,
  ),
  mcq(
    "q_off_20",
    "Boş slayt stresini yenmek için ilk isteme ne koyarsın?",
    [
      "Tek fikir, görsel yönlendirme ve konuşmacı notu",
      "Sadece 'güzel olsun'",
      "Şirket logosunun piksel boyutu",
      "Yazıcı ayarı",
    ],
    0,
  ),
  mcq(
    "q_off_21",
    "Gelen kutusunu sıralarken yapay zekâya hangi etiketleri verirsin?",
    [
      "Acil / Aksiyon / Arşivlik gibi açık etiketler",
      "Hepsini sil",
      "Otomatik 'tamam' yanıtı",
      "Sunucu kapat",
    ],
    0,
  ),
  mcq(
    "q_off_22",
    "Yapay zekânın yazdığı tedarikçi yanıt taslağı için ne yaparsın?",
    [
      "Taslağı okumadan göndermek",
      "Tarih ve tutarı verip taslak ister, sen kontrol edip onaylarsın",
      "Yanıtlamayı atlayıp iletiyi arşivlemek",
      "Modele sert dil yazdırıp okumadan göndermek",
    ],
    1,
  ),
  mcq(
    "q_off_23",
    "Metinden slayt çıkarırken görsel yönlendirmeyi neden yazarsın?",
    [
      "Telifli stok görsel satın almak",
      "Hangi grafiği koyacağını ve başlık-madde sırasını parantezde tarif edersin",
      "Konuşmacının kelimesi kelimesine metnini saklamak",
      "Yazı tipi boyutunu kilitlemek",
    ],
    1,
  ),
  mcq(
    "q_off_24",
    "Müşteri programı (CRM) ekran görüntüsünü sohbet kutusuna yapıştırmak neden üçüncü kapı değildir?",
    [
      "Ekran görüntüsü her zaman maskelidir",
      "Ham kimlik ve sır görüntüde durur; üçüncü kapı yalnız maskeli kısa özettir",
      "PDF yapmak üçüncü kapıdır",
      "Copilot paneli ekran görüntüsü ister",
    ],
    1,
  ),
  mcq(
    "q_off_25",
    "Vergi matrahı veya net ciro gibi kritik sayıyı neden insan gözüyle kilitlersin?",
    [
      "Yalnız başlık formatına bakarsın",
      "Ayda bir rastgele hücre seçersin",
      "Kaynak evraktan insan gözüyle doğrulanmış değeri sabitlersin; modeli serbest bırakmazsın",
      "Tüm formülleri silersin",
    ],
    2,
  ),
  mcq(
    "q_off_26",
    "İç içe birleşik hücre ve ara toplamlı ham veride ilk refleks hangisidir?",
    [
      "Orijinali silmek",
      "Birleşik hücre ve boş satır düzenini istemine yazıp temiz tabloyu yeni sayfada iste",
      "Hepsini PDF yapmak",
      "Yalnız rengi değiştirmek",
    ],
    1,
  ),
  mcq(
    "q_off_27",
    "Yerleşik araç hangi kutuda hangisidir?",
    [
      "Outlook’a Gemini, Gmail’e Copilot zorlanır",
      "Outlook → Copilot, Gmail → Gemini, Word/Excel dosyası ataş, PowerPoint Copilot",
      "Her yerde yalnızca ChatGPT",
      "Eşleşme yoktur",
    ],
    1,
  ),
  mcq(
    "q_off_28",
    "Dilekçede tarihi, sayıyı ve imzayı neden sen yazarsın?",
    [
      "Çünkü model resmi mühürü senin yerine basar",
      "Çünkü model taslak yazar; unvan, tarih, sayı ve imza sendedir",
      "Çünkü kanun maddesini modelden olduğu gibi kabul edersin",
      "Çünkü dilekçeyi yüklemeden sayfa sayfa kopyalaman yeter",
    ],
    1,
  ),
  mcq(
    "q_off_29",
    "Yönetim özeti isterken isteme en az hangisi konur?",
    [
      "Yalnız ‘özetle’ demek",
      "Alıcı rolü, üç madde ve tek karar cümlesi",
      "Tüm satırları slayta yapıştırmak",
      "Grafik rengi ve punto",
    ],
    1,
  ),
  mcq(
    "q_off_30",
    "Slayt metin yığını olmasın diye detayı nereye koyarsın?",
    [
      "Tüm açıklama slayta yapıştırılır, punto küçültülür",
      "Ana mesajı slaytta tutarsın; detayı konuşmacı notuna yazarsın.",
      "Görsel yönlendirme iptal edilir",
      "Metin rastgele dağıtılır",
    ],
    1,
  ),
  mcq(
    "q_off_31",
    "Gelen kutusunu Gmail dışına kopyalamadan nasıl süzersin?",
    [
      "İletiyi seçip ChatGPT penceresine yapıştırırsın",
      "Ekran görüntüsü alıp dış sohbete yüklersin",
      "Yerleşik Gemini paneline istemi yazarsın; kutuyu yerinde tararsın.",
      "İletileri belgeye çevirip modele verirsin",
    ],
    2,
  ),
  mcq(
    "q_off_32",
    "Birinci ve ikinci kapı dururken hangi yolu atlanmış kapı sayarsın?",
    [
      "Gmail içinde Gemini panelini açarsın",
      "Word veya Excel belgesini ataş ile yüklersin",
      "İletiyi kopyalayıp ekran görüntüsüyle dış sohbete taşırsın",
      "Copilot lisansın varsa şeritten okutursun",
    ],
    2,
  ),
  mcq(
    "q_off_33",
    "30 sayfalık sözleşmede cezai şart ve fesih farklı sayfalardadır. Dosyayı nasıl incelersin?",
    [
      "Her maddeyi ayrı sohbete kopyalarsın",
      "Sözleşmeyi Word belgesi olarak yükler, dosyanın bütününü incelersin",
      "Yalnız kapak sayfasını okutursun",
      "Ekran görüntüsü zincirini dış sohbete taşırsın",
    ],
    1,
  ),
  mcq(
    "q_off_34",
    "Üç kapıda son çarede ne yaparsın?",
    [
      "Bütün gelen kutusunu ekran görüntüsüyle dış sohbete taşırsın",
      "Ham dekontları sayfa sayfa yapıştırırsın",
      "Ad, IBAN ve ticari sır maskelenmiş kısa özet yapıştırırsın",
      "Copilot dururken paneli atlayıp ham listeyi taşırsın",
    ],
    2,
  ),
  mcq(
    "q_off_35",
    "Word’de sözleşme, dilekçe ve rapor aynı ataş kapısından gider. Üç işi tek istemde mi sorarsın, ayrı ayrı mı?",
    [
      "Üç işi tek istemde karıştırırsın",
      "Her işi ayrı istemle sorarsın; imza ve tarihi sende bırakırsın",
      "Kanun maddesini modelden olduğu gibi kabul edersin",
      "Dosyayı yüklemeden sayfa sayfa kopyalarsın",
    ],
    1,
  ),
  mcq(
    "q_off_36",
    "PowerPoint’te 1. Kapı hangisidir?",
    [
      "Önce tema süsleyip mesajı sona bırakmak",
      "Konuşmacı notunu slayt gövdesine basmak",
      "Şeritteki Copilot paneline istemi yazmak",
      "On maddeyi tek slayta yığmak",
    ],
    2,
  ),
  mcq(
    "q_off_37",
    "Müşteri adı, telefon ve IBAN aynı tabloda durur. Yapay zekâya vermeden önce doğru refleks hangisidir?",
    [
      "Ham tabloyu olduğu gibi sohbete yapıştırmak",
      "Adı, telefonu ve IBAN’ı maskeleyip kısa sorunu yazmak",
      "Müşteri programının tüm ekran görüntüsünü yüklemek",
      "Dosyayı silip modeli tahmin ettirmek",
    ],
    1,
  ),
  mcq(
    "q_off_38",
    "Açık katalog bilgisi ile kişiye bağlı müşteri satırı aynı türden midir?",
    [
      "Evet; ikisini de ataşla yüklersin",
      "Hayır; açık katalog bilgisi gidebilir, kişiye bağlı satır ham haliyle gitmez",
      "KVKK yalnızca e-postayı kapsar",
      "Model sildiği için yüklemek serbesttir",
    ],
    1,
  ),
  mcq(
    "q_off_39",
    "Copilot veya Gemini lisansı, ham müşteri listesini sohbete yüklemeyi yasal kılar mı?",
    [
      "Evet; lisans yeterlidir",
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
      "Ham haliyle gitmez; açık katalog bilgisi veya maskeli kısa özet yeter",
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
      "İnsan onaylar; model onaylamaz",
    ],
    2,
  ),
  mcq(
    "q_off_42",
    "Maskelemek ne demektir?",
    [
      "Dosyayı silmek",
      "Ayşe Kaya yerine Müşteri A, IBAN yerine MASKELİ_IBAN yazıp sorunu yazmak",
      "Adı baş harfe, IBAN’ı son dört haneye indirip sorunu yazmak",
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
