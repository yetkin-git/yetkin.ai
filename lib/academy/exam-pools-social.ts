import type { AcademyExamQuestion } from "@/lib/academy/types";
import { mcq } from "@/lib/academy/exam-pools-growth";

/**
 * Sosyal medya fabrikası sınav havuzu — canlı slug `03_social_media_ai`.
 * Master: `docs/curriculum/05_social_media_factory.md`.
 */
export const SOCIAL_MEDIA_AI_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  mcq(
    "q_sm_1",
    "İçerik üretiminde pedagojik olarak doğru zihniyet hangisidir?",
    [
      "Her gün ilham perisini bekleyip tek tek zanaatkar üretimi yapmak",
      "Tek girdiyle çok çıktı üreten endüstriyel montaj hattı (fabrika) kurmak",
      "Yalnızca trend seslere göre rastgele video çekmek",
      "Tüm işi bir sosyal medya asistanına bırakıp denetlememek",
    ],
    1,
  ),
  mcq(
    "q_sm_2",
    "'İçerik atomizasyonu' (1 girdi → 30 çıktı) ne anlama gelir?",
    [
      "Aynı görseli 30 kez paylaşmak",
      "Tek bir ürün veya fikirden beş sütunla 30 günlük takvim türetmek",
      "30 farklı ürüne aynı metni yazmak",
      "Algoritmaya 30 hashtag basmak",
    ],
    1,
  ),
  mcq(
    "q_sm_3",
    "30 günlük içerik matrisinin beş sütunu hangileridir?",
    [
      "Fiyat, kargo, iade, stok, yorum",
      "Acı noktası, mit çürütme, sosyal kanıt, yaşam tarzı, doğrudan satış",
      "Renk, logo, slogan, müzik, filtre",
      "Reels, Story, Post, Live, Newsletter",
    ],
    1,
  ),
  mcq(
    "q_sm_4",
    "Kullanıcının parmağını durduran kanca (hook) penceresi yaklaşık kaç saniyedir?",
    [
      "İlk 10 saniye yeterlidir",
      "Yaklaşık 0.8 saniye; kanca atılmazsa içerik yok sayılır",
      "Videonun son 3 saniyesi",
      "Yalnızca kapak görseli yeterlidir",
    ],
    1,
  ),
  mcq(
    "q_sm_5",
    "Beş psikolojik kanca türü hangileridir?",
    [
      "Renk, font, müzik, filtre, hashtag",
      "Acı, merak, mit çürütme, kanıt, fırsat",
      "Fiyat, stok, kargo, iade, puan",
      "Like, yorum, kaydet, paylaş, takip",
    ],
    1,
  ),
  mcq(
    "q_sm_6",
    "Kanca oranı (hook rate) pratikte neyi ölçer?",
    [
      "Toplam takipçi sayısını",
      "İlk 3 saniyede videoda kalan izleyici oranını",
      "Reklam bütçesini",
      "Hashtag sayısını",
    ],
    1,
  ),
  mcq(
    "q_sm_7",
    "Algoritmanın süper metrikleri olarak öne çıkan eylemler hangileridir?",
    [
      "Yalnızca beğeni",
      "Kaydetme ve paylaşma",
      "Yalnızca profil ziyareti",
      "Yalnızca hikâye yanıtı",
    ],
    1,
  ),
  mcq(
    "q_sm_8",
    "Midjourney ticari görsel promptunun temel anatomisi nedir?",
    [
      "Sadece ürün adını yazmak",
      "Özne, çevre, ışık, kamera/lens ve teknik parametreler",
      "Yalnızca '--v 6.0' eklemek",
      "Türkçe sloganı tırnak içinde göndermek",
    ],
    1,
  ),
  mcq(
    "q_sm_9",
    "Dikey Reels formatı için Midjourney parametresi hangisidir?",
    [
      "--ar 1:1",
      "--ar 9:16",
      "--ar 16:9",
      "--ar 4:3",
    ],
    1,
  ),
  mcq(
    "q_sm_10",
    "Canva Bulk Create (Toplu Oluşturma) ne işe yarar?",
    [
      "Tek bir görseli rastgele yeniden çizer",
      "Bir şablona tablo bağlayıp 30 markalı postu tek tıkla basar",
      "Videoyu otomatik yayınlar",
      "Takipçi satın alır",
    ],
    1,
  ),
  mcq(
    "q_sm_11",
    "Canva Brand Kit neden fabrikada zorunlu bir istasyondur?",
    [
      "Algoritma logoyu zorunlu tutar",
      "Renk, yazı tipi ve logo bir kez tanımlanır; 30 sayfaya kurumsal kimlik uygulanır",
      "Marka kiti ücretsiz reklam verir",
      "Yalnızca PDF dışa aktarır",
    ],
    1,
  ),
  mcq(
    "q_sm_12",
    "Magic Expand ne zaman kullanılır?",
    [
      "Metni İngilizceye çevirmek için",
      "Kare görseli 9:16 dikeye doğal şekilde uzatmak için",
      "Hashtag üretmek için",
      "Ses klonlamak için",
    ],
    1,
  ),
  mcq(
    "q_sm_13",
    "Kuru 'beğen ve takip et' CTA'sı yerine ne yapılmalıdır?",
    [
      "Daha fazla emoji eklemek",
      "ManyChat, Tidio veya DM otomasyonuna bağlanan dönüşümlü eylem çağrısı kurmak",
      "Videoyu sessiz paylaşmak",
      "Yorumları kapatmak",
    ],
    1,
  ),
  mcq(
    "q_sm_14",
    "ElevenLabs bu fabrikada hangi istasyonu doldurur?",
    [
      "Kapak tasarımı",
      "Doğal tonlamalı, nefes alan seslendirme ve ses klonlama",
      "Takvim planlama",
      "Reklam bütçesi yönetimi",
    ],
    1,
  ),
  mcq(
    "q_sm_15",
    "HeyGen'in pedagojik vaadi nedir?",
    [
      "Kamera ve stüdyo zorunluluğunu kaldırıp hiper-gerçekçi avatarla metni okutmak",
      "Yalnızca stok video aramak",
      "Instagram hesabını otomatik kapatmak",
      "PDF sertifika basmak",
    ],
    0,
  ),
  mcq(
    "q_sm_16",
    "Lip-sync (dudak senkronizasyonu) neden kritiktir?",
    [
      "Algoritma yalnızca dudak hareketi sayar",
      "Avatarın konuşması doğal durmazsa güven ve tutundurma düşer",
      "Yasal olarak zorunludur",
      "Ses dosyasını küçültür",
    ],
    1,
  ),
  mcq(
    "q_sm_17",
    "CapCut dikey kurguda görsel değişim ritmi için verilen kural nedir?",
    [
      "Sahne 15 saniyede bir değişir",
      "Yaklaşık 2.5 saniyelik görsel değişim kuralı",
      "Tek plan 60 saniye tutulur",
      "Yalnızca yavaş çekim kullanılır",
    ],
    1,
  ),
  mcq(
    "q_sm_18",
    "CapCut Auto Captions neden 'dinamik kelime vurgulu' olmalıdır?",
    [
      "Altyazısız video yasaktır",
      "Sessiz izlemede kelime kelime vurgu tutundurmayı ve erişilebilirliği artırır",
      "Altyazı reklam maliyetini düşürür",
      "Yalnızca İngilizce içerikte gerekir",
    ],
    1,
  ),
  mcq(
    "q_sm_19",
    "Kısa dikey video için doğru çerçeve hangisidir?",
    [
      "16:9 yatay sinema",
      "9:16 dikey format (Reels / Shorts / TikTok)",
      "21:9 ultra geniş",
      "Yalnızca kare 1:1",
    ],
    1,
  ),
  mcq(
    "q_sm_20",
    "Otonom yayınlama için müfredatta geçen araç ailesi hangisidir?",
    [
      "Excel, Word, PowerPoint",
      "Buffer, Metricool ve Publer",
      "Git, Docker, Kubernetes",
      "PayTR, iyzico, Stripe",
    ],
    1,
  ),
  mcq(
    "q_sm_21",
    "CCaaS (Content Creator as a Service) modeli nedir?",
    [
      "Ücretsiz içerik bağışı",
      "Fabrika gücünü markalara aylık paket halinde satmak",
      "Yalnızca kendi hesabına içerik üretmek",
      "Stok fotoğraf sitesi açmak",
    ],
    1,
  ),
  mcq(
    "q_sm_22",
    "Fabrikadaki insanın doğru rolü nedir?",
    [
      "Her kareyi elle kesen içerik amelesi",
      "İstasyonları denetleyen ve kalite kontrolü yapan genel müdür",
      "Yalnızca hashtag yazan asistan",
      "Algoritmayı tahmin eden kahin",
    ],
    1,
  ),
  mcq(
    "q_sm_23",
    "Midjourney `--style raw` parametresi ne işe yarar?",
    [
      "Görseli siyah-beyaz yapar",
      "Aşırı süslemeyi kesip fotogerçekçiliği artırır",
      "Videoya çevirir",
      "Türkçe altyazı ekler",
    ],
    1,
  ),
  mcq(
    "q_sm_24",
    "Lifestyle fotoğrafta pedagojik hedef nedir?",
    [
      "Ürünü beyaz fonda tek başına göstermek",
      "Ürünü gerçek kullanım sahnesinde, doğal insan ve ışıkla göstermek",
      "Yalnızca logo basmak",
      "Fiyat etiketini kocaman yazmak",
    ],
    1,
  ),
  mcq(
    "q_sm_25",
    "Storyboard'un ilk 0–3 saniyesi neyi taşımalıdır?",
    [
      "Uzun marka hikâyesi",
      "Kanca ve şok: ani görsel + kalın başlık + çarpıcı soru",
      "Fiyat listesi",
      "Kapanış jingle'ı",
    ],
    1,
  ),
  mcq(
    "q_sm_26",
    "B-roll stok sahneler CapCut hattında neden eklenir?",
    [
      "Videoyu yasal olarak uzatmak için",
      "2.5 saniyelik ritimde görsel çeşitlilik ve tutundurma sağlamak için",
      "Ses dosyasını gizlemek için",
      "Hashtag sayısını artırmak için",
    ],
    1,
  ),
  mcq(
    "q_sm_27",
    "Yapay zekâya ticari görsel ürettirirken marka riski nasıl yönetilir?",
    [
      "Rakip tescilli isimleri prompt'a yazmak serbesttir",
      "Tescilli marka ve yüzleri izinsiz taklit etmemek; kendi ürün ve sahneyi tarif etmek",
      "Başka markanın logosunu Magic Eraser ile kopyalamak",
      "Ünlü yüzleri izinsiz klonlamak",
    ],
    1,
  ),
  mcq(
    "q_sm_28",
    "Henry Ford benzetmesinin içerik fabrikasına uyarlanması nedir?",
    [
      "Her ustanın arabayı baştan yapması",
      "İşi istasyonlara bölmek: metin, görsel, ses, kurgu, dağıtım",
      "Tek kişilik zanaatı yüceltmek",
      "Üretimi tamamen durdurmak",
    ],
    1,
  ),
  mcq(
    "q_sm_29",
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
    "q_sm_30",
    "Sertifika ne zaman hak edilir?",
    [
      "Eğitim satın alındığı anda",
      "Müfredat tamamlanıp sunucu tarafında puanlanan sınavda baraj (≥70) geçildiğinde",
      "İlk Reels paylaşıldığında",
      "Özet PDF indirildiğinde",
    ],
    1,
  ),
];
