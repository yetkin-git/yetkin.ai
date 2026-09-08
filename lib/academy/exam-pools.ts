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
 * Ofis AI sınav havuzu — canlı slug `01_office_ai`.
 * Master: `docs/curriculum/01_office_ai_mastery.md`.
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
    "Excel'de karmaşık bir formül (örn. ÇOKETOPLA) yazdırmak için yapay zekâya nasıl bir girdi verilmelidir?",
    [
      "Sadece 'bana formül yaz' demek",
      "Tablonun sütun başlıklarını, koşulları ve beklenen sonucu doğal dille açıkça tarif etmek",
      "Önce Python ile script yazıp sonra Excel'e yapıştırmak",
      "Tüm hücreleri tek tek metin olarak sohbet kutusuna yapıştırmak",
    ],
    1,
  ),
  mcq(
    "q_off_3",
    "Excel'de bir formül '#BAŞV!' (#REF!) hatası veriyorsa yapay zekâya bunu onartmanın en pratik yolu nedir?",
    [
      "Excel'i kapatıp baştan kurmak",
      "Bozuk formülü, ilgili sütunların yerini ve hatayı tarif ederek hatanın kök nedenini sormak",
      "Formülü tamamen silip değerleri elle girmek",
      "Sadece 'çalışmıyor' yazıp beklemek",
    ],
    1,
  ),
  mcq(
    "q_off_4",
    "Farklı kaynaklardan gelen kaymış metinleri ve yapışık isim-telefon listelerini temizlemek için yapay zekâdan ne istenebilir?",
    [
      "Tek tek elle ayrıştırmak",
      "Ayrıştırma kuralını belirterek veriyi standart sütunlara bölen tablo veya kodsuz regex deseni üretmesini istemek",
      "Tüm verileri silip sıfırdan toplamak",
      "Veriyi PDF yapıp bırakmak",
    ],
    1,
  ),
  mcq(
    "q_off_5",
    "30 sayfalık bir sözleşmeyi yapay zekâya analiz ettirirken hangi yaklaşım en güvenli ve verimlidir?",
    [
      "Sözleşmeyi okumadan yapay zekânın 'sorun yok' demesine güvenmek",
      "Tazminat, fesih, cezai şartlar gibi kritik maddelere odaklı 'Yönetici Özeti' ve 'Risk Analizi' talep etmek",
      "Sözleşmeyi sosyal medyada paylaşmak",
      "Sadece ilk sayfayı yüklemek",
    ],
    1,
  ),
  mcq(
    "q_off_6",
    "PowerPoint sunumu hazırlarken yapay zekâdan nasıl yararlanılır?",
    [
      "Sadece rastgele resimler indirmek",
      "Rapor veya konu başlığından slayt slayt başlık, madde ve konuşmacı notları çıkarıp VBA makrosuyla tek tıkla slaytlara dökmek",
      "PowerPoint yerine düz metin dosyası açmak",
      "Sunum yapmaktan vazgeçmek",
    ],
    1,
  ),
  mcq(
    "q_off_7",
    "Yüzlerce okunmamış e-posta biriktiğinde yapay zekânın rolü ne olmalıdır?",
    [
      "Bütün mailleri okumadan silmek",
      "E-posta zincirini özetletmek, acil aksiyon maddelerini ve diplomatik yanıt taslaklarını hazırlatmak",
      "Gelen tüm maillere otomatik 'tamam' yanıtı göndermek",
      "Sunucunun fişini çekmek",
    ],
    1,
  ),
  mcq(
    "q_off_8",
    "Müşteri e-postalarını veya şirket verilerini yapay zekâya aktarırken KVKK gereği ilk adım ne olmalıdır?",
    [
      "Hiçbir değişiklik yapmadan aktarmak",
      "Şahıs isimleri, TC kimlik no, telefon, IBAN gibi kişisel verileri maskelemek ([Müşteri A], [IBAN X])",
      "Verileri herkese açık bir blogda yayınlamak",
      "Sadece şifreleri kaldırmak",
    ],
    1,
  ),
  mcq(
    "q_off_9",
    "Şirketin kamuya açıklanmamış finansal bilançoları veya ticari sırları yapay zekâya nasıl beslenmelidir?",
    [
      "Genel açık sohbetlere ham metin olarak yapıştırılmalıdır",
      "Genel açık yapay zekâ sohbetlerine asla açık metin olarak beslenmemeli, ticari sırlar korunmalıdır",
      "Rakiplere e-posta ile gönderilmelidir",
      "Her gün düzenli olarak paylaşılmalıdır",
    ],
    1,
  ),
  mcq(
    "q_off_10",
    "Yapay zekânın ürettiği resmi bir dilekçe veya teklif mektubunda 'halüsinasyon' riskine karşı kural nedir?",
    [
      "Yapay zekâ asla hata yapmaz, doğrudan gönderilir",
      "Yapay zekâ taslak hazırlar; tarih, rakam ve kanun maddelerini insan gözü denetler, imzayı ve sorumluluğu insan taşır",
      "Sorumluluk tamamen yapay zekâ şirketine aittir",
      "Metin kısaysa doğrulamaya gerek yoktur",
    ],
    1,
  ),
  mcq(
    "q_off_11",
    "Sertifika almak için Yetkin Akademi'de sınav barajı kaçtır?",
    [
      "50 puan",
      "70 puan ve üzeri",
      "100 puan tam not",
      "Baraj yoktur, satın alan herkes doğrudan alır",
    ],
    1,
  ),
  mcq(
    "q_off_12",
    "Yetkin Akademi'de sertifika ne zaman hak edilir?",
    [
      "Eğitim satın alındığı anda",
      "Müfredat tamamlanıp sertifika sınavında baraj puanı (≥70) geçildiğinde",
      "İlk derse tıklandığında",
      "Özet PDF indirildiğinde",
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
    "Toplantı notunu aksiyon planına çevirirken tarife ne eklenmelidir?",
    [
      "Yalnızca 'özetle' demek",
      "Karar, sorumlu, son tarih ve sonraki adım sütunlarını açıkça istemek",
      "Notu silip yeniden yazmak",
      "Toplantıyı kaydetmeden geçmek",
    ],
    1,
  ),
  mcq(
    "q_off_15",
    "Excel'de DÜŞEYARA (VLOOKUP) yazdırırken hangi bilgi zorunludur?",
    [
      "Sadece tablo rengi",
      "Aranan değer, arama aralığı, dönecek sütun ve tam/yaklaşık eşleşme tercihi",
      "Yalnızca dosya adı",
      "PowerPoint slayt sayısı",
    ],
    1,
  ),
  mcq(
    "q_off_16",
    "Tarihleri ve para birimlerini standartlaştırmak için yapay zekâya ne verilmelidir?",
    [
      "Rastgele örnek satırlar ve hedef format (GG.AA.YYYY, TL)",
      "Sadece 'düzelt' demek",
      "Tüm çalışma kitabını silmek",
      "Makroyu devre dışı bırakmak",
    ],
    1,
  ),
  mcq(
    "q_off_17",
    "Word'de resmi dilekçe üretirken en doğru iş bölümü hangisidir?",
    [
      "Yapay zekâ imzalar, insan bakmaz",
      "Yapay zekâ taslak yazar; unvan, tarih, sayı ve hitap insan denetimindedir",
      "Dilekçe sosyal medyada yayınlanır",
      "Yalnızca İngilizce yazılır",
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
    1,
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
    1,
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
    1,
  ),
  mcq(
    "q_off_22",
    "Gergin müşteri şikayetine diplomatik yanıtta ilk kural nedir?",
    [
      "Suçlamak ve tehdit etmek",
      "Duyguyu tanımak, somut adım ve süre vermek; hakaret etmemek",
      "Müşteriyi engellemek",
      "İç yazışmayı olduğu gibi iletmek",
    ],
    1,
  ),
  mcq(
    "q_off_23",
    "Kişisel verileri maskelemede hangisi doğrudur?",
    [
      "TC, telefon, IBAN ve isimleri takma değerlerle değiştirmek",
      "Hiçbir şey değiştirmemek",
      "Veriyi herkese açık sohbete yapıştırmak",
      "Sadece soyadı silmek",
    ],
    1,
  ),
  mcq(
    "q_off_24",
    "Ticari sır içeren bilanço yapay zekâya nasıl verilmez?",
    [
      "Genel açık sohbete ham metin olarak",
      "İç politika ve onaylı kurumsal araç ile, gerekirse özetlenerek",
      "Rakibe e-posta ile",
      "Sosyal medyada paylaşarak",
    ],
    1,
  ),
  mcq(
    "q_off_25",
    "Yapay zekânın uydurduğu kanun maddesi görülürse ne yapılır?",
    [
      "Doğrudan gönderilir",
      "İnsan resmi kaynağı kontrol eder; uydurma madde silinir veya düzeltilir",
      "Sorumluluk modele bırakılır",
      "Metin kısaysa geçilir",
    ],
    1,
  ),
  mcq(
    "q_off_26",
    "İki sütunu birleştirip 'Ad Soyad' üretmek için doğru tarife örneği nedir?",
    [
      "Kaynak sütunları, ayırıcı (boşluk) ve hedef sütun adını belirtmek",
      "Sadece 'birleştir' yazmak",
      "Satırları elle kopyalamak",
      "Dosyayı PDF yapmak",
    ],
    1,
  ),
  mcq(
    "q_off_27",
    "Bozuk formülü onartırken ekran görüntüsü yerine ne tarif edilir?",
    [
      "Formül metni, hata kodu ve ilgili sütun başlıkları",
      "Sadece 'çalışmıyor'",
      "Excel sürüm numarası tek başına",
      "Yazıcı kuyruğu",
    ],
    1,
  ),
  mcq(
    "q_off_28",
    "Ofiste yapay zekâ kullanımının pedagojik vaadi nedir?",
    [
      "Kod yazmadan rutin işi stajyere devredip stratejiye zaman açmak",
      "Tüm kararları insansız almak",
      "İnsanı işten çıkarmak",
      "Sadece resim çizmek",
    ],
    1,
  ),
  mcq(
    "q_off_29",
    "Sınavda barajı geçmek için müfredat tamamlanmış olsa bile ne gerekir?",
    [
      "Sunucuda puanlanan testte 70 ve üzeri",
      "Satın alma makbuzu",
      "İlk derse tıklamak",
      "PDF indirmek",
    ],
    1,
  ),
  mcq(
    "q_off_30",
    "Compact makale dersinde canlı TTS neden çağrılmaz?",
    [
      "İzleme anında harici ses maliyeti yoktur; mühürlü WAV yoksa sahte 'üretiliyor' da yok",
      "Tarayıcı sesi yasaktır",
      "Kart ağı ses ister",
      "Sınav sesli olmak zorundadır",
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
