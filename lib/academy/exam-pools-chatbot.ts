import type { AcademyExamQuestion } from "@/lib/academy/types";
import { mcq } from "@/lib/academy/exam-pools-growth";

/**
 * Kodsuz chatbot sınav havuzu — canlı slug `04_chatbot_nocode`.
 * Master: `docs/curriculum/04_chatbot_mastery.md`.
 */
export const CHATBOT_NOCODE_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  mcq(
    "q_bot_1",
    "Kodsuz akıllı chatbotun pedagojik olarak doğru konumu nedir?",
    [
      "İnsanın yerine geçen otonom hekim veya avukat",
      "İlk filtrelemeyi yapan, randevu/satış kapatan; insanı rutin amelelikten kurtaran dijital temsilci",
      "Yalnızca menü tuşlarıyla çalışan IVR",
      "Müşteriye Wikipedia maddesi okuyan ansiklopedi",
    ],
    1,
  ),
  mcq(
    "q_bot_2",
    "Eski nesil kural tabanlı botun temel kusuru nedir?",
    [
      "Çok pahalı olması",
      "Dar kalıpların dışına çıkamayıp '1-2-3 yazınız' döngüsüne saplanması",
      "Çok hızlı cevap vermesi",
      "WhatsApp'ta çalışmaması",
    ],
    1,
  ),
  mcq(
    "q_bot_3",
    "Amatör SSS botunun satış hatası nedir?",
    [
      "Fiyatı hiç söylememesi",
      "Cevabı ansiklopedi gibi verip eylemsiz bırakması; CTA ile randevuya bağlamaması",
      "Çok kibar konuşması",
      "Emoji kullanması",
    ],
    1,
  ),
  mcq(
    "q_bot_4",
    "Voiceflow bu müfredatta nasıl konumlanır?",
    [
      "Yalnızca WhatsApp Cloud API motoru",
      "Diyalog tasarımının Figma'sı: web widget, görsel prototip ve karar ağacı",
      "Muhasebe yazılımı",
      "E-posta pazarlama aracı",
    ],
    1,
  ),
  mcq(
    "q_bot_5",
    "Botpress bu müfredatta nasıl konumlanır?",
    [
      "Yalnızca kapak tasarımı",
      "RAG bilgi tabanı ve WhatsApp/Telegram gibi kanallarla derin entegrasyon motoru",
      "Sadece slayt sunumu",
      "Ödeme tahsilat POS'u",
    ],
    1,
  ),
  mcq(
    "q_bot_6",
    "Profesyonel hibrit strateji nedir?",
    [
      "Yalnızca ManyChat kullanmak",
      "Voiceflow ile 15 dakikada görsel prototip satmak; WhatsApp+RAG için Botpress ve Make.com bağlamak",
      "Önce Python API yazmak",
      "Botu Excel'de tutmak",
    ],
    1,
  ),
  mcq(
    "q_bot_7",
    "Intent (niyet) nedir?",
    [
      "Botun logo rengi",
      "Kullanıcının kafasındaki ana amaç (ör. Randevu_Almak)",
      "Webhook URL'si",
      "Yeşil tik başvurusu",
    ],
    1,
  ),
  mcq(
    "q_bot_8",
    "Utterance (ifade) nedir?",
    [
      "Aynı niyeti anlatan onlarca farklı doğal cümle örneği",
      "Tek bir zorunlu menü tuşu",
      "PDF dosya adı",
      "Meta reklam bütçesi",
    ],
    0,
  ),
  mcq(
    "q_bot_9",
    "Entity (varlık) neyi cımbızlar?",
    [
      "Botun kişilik metnini",
      "Cümledeki somut veri parçalarını: tarih, saat, isim, telefon",
      "Sunucu IP adresini",
      "Sınav barajını",
    ],
    1,
  ),
  mcq(
    "q_bot_10",
    "Voiceflow Carousel kartı ne işe yarar?",
    [
      "Ses kaydı alır",
      "Yatay kaydırılabilir görsel kartlarla hekim/tedavi vitrini sunar",
      "WhatsApp şablon onayı ister",
      "Fatura keser",
    ],
    1,
  ),
  mcq(
    "q_bot_11",
    "Telefon numarası alınırken neden regex/format kontrolü gerekir?",
    [
      "Estetik için",
      "Yanlış formatlı numaranın randevu ve CRM kaydını bozmaması için",
      "Meta bunu gizli tutar",
      "Sınav sorusu üretmek için",
    ],
    1,
  ),
  mcq(
    "q_bot_12",
    "RAG (Retrieval-Augmented Generation) mutfak benzetmesinde kütüphane görevlisi ne yapar?",
    [
      "Yemek uydurur",
      "Belgeden ilgili parçayı çekip şefe uzatır; şef belgeye sadık cevap verir",
      "Mutfağı kapatır",
      "Müşteriyi kovar",
    ],
    1,
  ),
  mcq(
    "q_bot_13",
    "Anlamsal benzerlik eşiği (similarity threshold) neden konur?",
    [
      "Botu yavaşlatmak için",
      "Soru bilgi tabanıyla yeterince uyuşmuyorsa uydurmayı kesip Fallback'e gitmek için",
      "Reklam maliyetini artırmak için",
      "Yeşil tik almak için",
    ],
    1,
  ),
  mcq(
    "q_bot_14",
    "Botpress Knowledge Base'e PDF atarken kritik kalite kuralı nedir?",
    [
      "Taranmış resim (OCR'siz görüntü) yeterlidir",
      "Seçilebilir temiz metin; H1/H2 hiyerarşisi anlamayı hızlandırır",
      "Dosya şifreli olmalıdır",
      "Yalnızca İngilizce PDF kabul edilir",
    ],
    1,
  ),
  mcq(
    "q_bot_15",
    "Klinik botunda Guardrails'ın tıbbi kırmızı çizgisi nedir?",
    [
      "Fiyat asla söylenmez",
      "Teşhis, tedavi garantisi ve ilaç dozu yok; kesin tanı hekim muayenesine bırakılır",
      "Hasta ismi kaydedilmez",
      "Bot yalnızca İngilizce konuşur",
    ],
    1,
  ),
  mcq(
    "q_bot_16",
    "Standart WhatsApp Business uygulamasının kurumsal sınırı nedir?",
    [
      "Mesaj gönderememesi",
      "Tek telefona hapsolması; çoklu operatör ve Cloud API omurgası olmaması",
      "Fotoğraf gönderememesi",
      "Türkçe desteklememesi",
    ],
    1,
  ),
  mcq(
    "q_bot_17",
    "WhatsApp 24 saat kuralı pratikte ne anlama gelir?",
    [
      "Bot günde 24 saat kapalıdır",
      "Kullanıcı mesajından sonra serbest pencere sınırlıdır; sonrasında onaylı şablon (template) gerekir",
      "Her mesaj 24 saat gecikmeyle gider",
      "Yeşil tik 24 saatte düşer",
    ],
    1,
  ),
  mcq(
    "q_bot_18",
    "Şablon mesaj (template message) neden Meta onayı ister?",
    [
      "Tasarım estetiği için",
      "Spam kalkanı: işletmenin kullanıcıyı izinsiz bombardıman etmesini engellemek için",
      "Fatura kesmek için",
      "Sınav barajını ayarlamak için",
    ],
    1,
  ),
  mcq(
    "q_bot_19",
    "ManyChat ile Botpress tercihi nasıl ayrışır?",
    [
      "ManyChat her zaman yasaktır",
      "ManyChat hızlı reklam/DM otomasyonu; derin RAG ve kanal mühendisliği için Botpress",
      "İkisi aynı üründür",
      "Botpress yalnızca e-posta gönderir",
    ],
    1,
  ),
  mcq(
    "q_bot_20",
    "Webhook chatbot'u operasyon memuruna nasıl çevirir?",
    [
      "Sohbet metnini PDF basar",
      "Toplanan JSON'u Make.com üzerinden Sheets, takvim ve CRM'e aktarır",
      "Botu sessize alır",
      "Yeşil tik üretir",
    ],
    1,
  ),
  mcq(
    "q_bot_21",
    "Human Handoff ne zaman tetiklenmelidir?",
    [
      "Her mesajda",
      "Acil durum, öfke, belirsizlik veya Guardrails ihlali: bot susup canlı temsilciye devreder",
      "Yalnızca mesai saatlerinde",
      "Asla; bot her şeyi çözer",
    ],
    1,
  ),
  mcq(
    "q_bot_22",
    "Asenkron webhook yanıtı neden önemlidir?",
    [
      "Botun daha yavaş görünmesi için",
      "Dış sistem cevabı gecikse bile diyaloğun kilitlenmemesi ve sonra dönmesi için",
      "Meta cezası almak için",
      "Sınav süresini uzatmak için",
    ],
    1,
  ),
  mcq(
    "q_bot_23",
    "Click-to-WhatsApp reklamının bot mimarisindeki yeri nedir?",
    [
      "Reklam tıklanınca sohbeti boş bırakmak",
      "Reklamdan düşen niyeti botun karşılayıp randevu/lead akışına bağlamak",
      "Reklamı kapatmak",
      "Yalnızca e-posta toplamak",
    ],
    1,
  ),
  mcq(
    "q_bot_24",
    "Chatbot as a Service (CaaS) ticari modeli nedir?",
    [
      "Botu ücretsiz GitHub'a koymak",
      "KOBİ'ye kurulum ücreti + aylık bakım/SLA paketi satmak",
      "Yalnızca kendi kliniğinde kullanmak",
      "WhatsApp'tan rastgele spam atmak",
    ],
    1,
  ),
  mcq(
    "q_bot_25",
    "Hasta/müşteri verisi bota veya Make.com'a giderken KVKK kuralı nedir?",
    [
      "Ham TC, telefon ve şikayet metni her yere yapıştırılır",
      "Kişisel veriler maskelenir; yalnızca iş için gerekli alanlar aktarılır",
      "KVKK chatbot'u kapsamaz",
      "Veriler Twitter'da paylaşılır",
    ],
    1,
  ),
  mcq(
    "q_bot_26",
    "Duygu analizi botta ne işe yarar?",
    [
      "Reklam bütçesini hesaplar",
      "Öfke veya acil acı sinyalinde Human Handoff ve empati protokolünü tetikler",
      "Yeşil tik üretir",
      "Sınav sorusu basar",
    ],
    1,
  ),
  mcq(
    "q_bot_27",
    "If/Else karar dalında 'acil ağrı' niyeti gelince doğru davranış nedir?",
    [
      "Rutin fiyat menüsüne devam",
      "Rutin soruları atlayıp nöbetçi hekim / acil hatta yönlendirmek",
      "Sohbeti kapatmak",
      "PDF katalog göndermek",
    ],
    1,
  ),
  mcq(
    "q_bot_28",
    "Voiceflow widget yayınında gömme kodu ne sağlar?",
    [
      "WhatsApp Cloud API onayı",
      "Web sitesine birkaç satırlık embed ile canlı sohbet penceresi",
      "PayTR tahsilatı",
      "Sertifika hash'i",
    ],
    1,
  ),
  mcq(
    "q_bot_29",
    "Yetkin Akademi'de sertifika barajı kaçtır?",
    [
      "50 puan",
      "70 puan ve üzeri",
      "100 puan tam not",
      "Baraj yoktur; satın alan herkes doğrudan alır",
    ],
    1,
  ),
  mcq(
    "q_bot_30",
    "Sertifika ne zaman hak edilir?",
    [
      "Eğitim satın alındığı anda",
      "Müfredat tamamlanıp sunucu tarafında puanlanan sınavda baraj (≥70) geçildiğinde",
      "İlk bot yayınlandığında",
      "Özet PDF indirildiğinde",
    ],
    1,
  ),
];
