/**
 * Tur 3 sinema slayt kataloğu — cue kartı içerik SSOT.
 * Bake `scripts/render-academy-cinema-cues.ts` JPG yazar; izlemede generate yok.
 */

export const ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS = [
  "01_office_ai-1",
  "01_office_ai-2",
  "01_office_ai-3",
  "01_office_ai-4",
  "01_office_ai-5",
  "01_office_ai-6",
  "02_ecommerce_ai-1",
  "02_ecommerce_ai-2",
  "02_ecommerce_ai-3",
  "02_ecommerce_ai-4",
  "02_ecommerce_ai-5",
  "02_ecommerce_ai-6",
  "03_social_media_ai-1",
  "03_social_media_ai-2",
  "03_social_media_ai-3",
  "03_social_media_ai-4",
  "03_social_media_ai-5",
  "03_social_media_ai-6",
  "04_chatbot_nocode-1",
  "04_chatbot_nocode-2",
  "04_chatbot_nocode-3",
  "04_chatbot_nocode-4",
  "04_chatbot_nocode-5",
  "04_chatbot_nocode-6",
  "05_prompt_practice-1",
  "05_prompt_practice-2",
  "05_prompt_practice-3",
  "05_prompt_practice-4",
  "05_prompt_practice-5",
  "05_prompt_practice-6",
] as const;

export type AcademyCinemaCueSlideLessonKey = (typeof ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS)[number];

export type AcademyCinemaCueLayout =
  | "problem"
  | "chat"
  | "excel"
  | "email"
  | "word"
  | "pptx"
  | "outlook"
  | "listing"
  | "shield"
  | "flow"
  | "whatsapp"
  | "reels"
  | "prompt"
  | "keys";

export type AcademyCinemaThemeId = "office" | "commerce" | "social" | "bot" | "prompt";

export type AcademyCinemaCueSlide = {
  lessonKey: AcademyCinemaCueSlideLessonKey;
  cueIndex: number;
  theme: AcademyCinemaThemeId;
  courseLabel: string;
  lessonTitle: string;
  instructor: string;
  section: string;
  headline: string;
  subhead: string;
  bullets: readonly string[];
  tools: readonly string[];
  layout: AcademyCinemaCueLayout;
  stats?: readonly { label: string; value: string }[];
  table?: { headers: readonly string[]; rows: readonly (readonly string[])[]; note?: string };
  chat?: { role: string; prompt: string; replyTitle: string; replyLines: readonly string[] };
  messages?: readonly { from: "bot" | "user"; text: string }[];
  nodes?: readonly { title: string; sub: string }[];
  keys?: readonly { n: string; title: string; body: string }[];
  warning?: string;
  fieldTask?: string;
};

type OverlayDraft = Omit<
  AcademyCinemaCueSlide,
  "lessonKey" | "theme" | "courseLabel" | "lessonTitle" | "instructor"
>;

type LessonDraft = {
  title: string;
  theme: AcademyCinemaThemeId;
  courseLabel: string;
  instructor: string;
  cues: readonly OverlayDraft[];
};

const OFFICE = {
  theme: "office" as const,
  courseLabel: "Ofis AI · Excel Word PPT Outlook",
  instructor: "Gözde",
};
const COMMERCE = {
  theme: "commerce" as const,
  courseLabel: "E-Ticaret AI · Trendyol HB Amazon",
  instructor: "Aylin",
};
const SOCIAL = {
  theme: "social" as const,
  courseLabel: "Sosyal Medya AI · Reels Fabrikası",
  instructor: "Deniz",
};
const BOT = {
  theme: "bot" as const,
  courseLabel: "Kodsuz Chatbot · Voiceflow Botpress",
  instructor: "Kaan",
};
const PROMPT = {
  theme: "prompt" as const,
  courseLabel: "Prompt Atölyesi · ChatGPT Claude Perplexity",
  instructor: "Gözde",
};

const LESSONS: Record<AcademyCinemaCueSlideLessonKey, LessonDraft> = {
  "01_office_ai-1": {
    ...OFFICE,
    title: "Ofiste Yapay Zekâ Devrimi: Günlük 2 Saatten Nasıl Tasarruf Edilir?",
    cues: [
      {
        cueIndex: 1,
        section: "Giriş & Problem",
        layout: "problem",
        headline: "Günün iki saati nereye gidiyor?",
        subhead: "Asıl iş duruyor; zaman hırsızları masayı yiyor.",
        bullets: [
          "Gelen kutusu şişmiş, tablo kaymış, toplantı notu dağınık, slayt boş.",
          "Haftada on saat. Ayda kırk saat. Yılda neredeyse koca bir ay.",
          "Kod yok. Formül ezberi yok. Masadaki stajyere iş diliyle konuşacaksın.",
        ],
        tools: ["ChatGPT", "Copilot", "Excel", "Outlook"],
        stats: [
          { label: "E-posta", value: "40 dk" },
          { label: "Dağınık tablo", value: "35 dk" },
          { label: "Toplantı özeti", value: "30 dk" },
          { label: "Sunum çilesi", value: "25 dk" },
          { label: "Haftada", value: "10 saat" },
          { label: "Ayda", value: "40 saat" },
        ],
      },
      {
        cueIndex: 2,
        section: "Garsonu Göster",
        layout: "chat",
        headline: "Dağınık not → yönetici özeti",
        subhead: "Rol, görev, format. Senin aklından geçeni bilemez.",
        bullets: [
          "Kıdemli yönetici asistanı rolü ver.",
          "En fazla üç maddelik özet + aksiyon tablosu iste.",
          "On sekiz saniyede hamallık kalkar; onay sende kalır.",
        ],
        tools: ["ChatGPT", "Claude", "Gemini", "Copilot"],
        chat: {
          role: "Kıdemli yönetici asistanı",
          prompt:
            "Dağınık toplantı notunu 3 maddelik yönetici özetine çevir. Sorumlu, görev ve kritik tarih sütunlu aksiyon tablosu ver. Dil sakin ve kurumsal olsun.",
          replyTitle: "Aksiyon tablosu",
          replyLines: [
            "Depo — barkod yüzünden İzmir sevkiyatı 2 gün aksıyor.",
            "Mali İşler — bütçe revizyonu cuma; yoksa alımlar durur.",
            "Çağrı — 45 iade; salı tekrar toplanılacak.",
          ],
        },
      },
      {
        cueIndex: 3,
        section: "Excel & Veri Süzgeci",
        layout: "excel",
        headline: "Formülü ezberleme, işi anlat",
        subhead: "DÜŞEYARA / ÇOKETOPLA stresi kalkar. Niyet Türkçe konuşur.",
        bullets: [
          "Sütun, tarih aralığı ve istisnayı söyle.",
          "Gelen formülü kopyala, bir satırla kontrol et.",
          "Yanlışsa düzeltmeyi de iş dilinde söyle.",
        ],
        tools: ["Excel", "ChatGPT", "Copilot"],
        table: {
          headers: ["Müşteri", "Tarih", "Tutar", "Durum"],
          rows: [
            ["Müşteri A", "03.09", "4.200 ₺", "OK"],
            ["Müşteri B", "07.09", "-180 ₺", "İade"],
            ["Müşteri C", "12.09", "8.750 ₺", "OK"],
            ["Toplam (iade hariç)", "", "12.950 ₺", "süzüldü"],
          ],
          note: "Eksi bakiyeler ayrı liste. Formülü sen yazma; tarifi ver.",
        },
      },
      {
        cueIndex: 4,
        section: "E-Posta & Üslup Dönüşümü",
        layout: "email",
        headline: "Stresi metinden ayır",
        subhead: "Üç üslup iste. Kişisel veri yapıştırma. Onay sende.",
        bullets: [
          "Yumuşak hatırlatma · resmi talep · son uyarı.",
          "Müşteri A, Firma 1, maskeli tutar yeter.",
          "Konu satırını da iste. Göndermeden oku.",
        ],
        tools: ["Outlook", "ChatGPT", "Copilot"],
        chat: {
          role: "Kurumsal yazışma editörü",
          prompt:
            "Bu mail çok sert. Muhasebeye gidecek. Net olsun, kapıyı kapatmasın. Üç üslup ver. Gerçek ad/telefon yok.",
          replyTitle: "Üç ton",
          replyLines: [
            "1) Yumuşak hatırlatma — vade ve sonraki adım.",
            "2) Resmi soğukkanlı talep — tarih + maskeli tutar.",
            "3) Son uyarı — kapı açık, tehdit yok.",
          ],
        },
      },
      {
        cueIndex: 5,
        section: "Kapanış & Saha Görevi",
        layout: "keys",
        headline: "Bugün bir angaryayı devret",
        subhead: "Küçük olsun. Mükemmel olmasın. Bitmiş olsun.",
        bullets: ["Stajyer rakip değil.", "Rol + görev + format.", "Maskele ve çalıştır."],
        tools: ["ChatGPT", "Excel", "Outlook"],
        keys: [
          { n: "01", title: "Stajyer", body: "Doğru rol ve net sınır = haftada on saat." },
          { n: "02", title: "Tarife", body: "Yalnız soru sorma. Kim, ne, nasıl teslim." },
          { n: "03", title: "Kalkan", body: "Kişisel veri ve şirket sırrı şablona döner." },
        ],
        fieldTask: "Son toplantının üç cümlelik notunu aynı şablona yapıştır; aksiyon tablosunu kendine postala.",
      },
    ],
  },
  "01_office_ai-2": {
    ...OFFICE,
    title: "Excel'de Formül Ezberlemeye Son: Doğal Dille Tablo ve Formül Sihirbazlığı",
    cues: [
      {
        cueIndex: 1,
        section: "Giriş & Köprü",
        layout: "problem",
        headline: "Parantez baskısı masadan kalkıyor",
        subhead: "Stajyer niyeti okuyamaz. Sırları sen sakla.",
        bullets: [
          "Rol, verinin yapısı ve istenen sonuç olmadan mucize yok.",
          "Gerçek ad yok. Gizli ciro yok. Müşteri A, Şube 1 yeter.",
          "Bugün parantez değil, niyet konuşacak.",
        ],
        tools: ["Excel", "ChatGPT", "Copilot"],
        stats: [
          { label: "Fonksiyon ezberi", value: "0" },
          { label: "Niyet cümlesi", value: "1" },
          { label: "Kontrol satırı", value: "1" },
          { label: "Onay", value: "sen" },
        ],
      },
      {
        cueIndex: 2,
        section: "Parantez Cehennemi",
        layout: "excel",
        headline: "Kalp DÜŞEYARA'da hızlanır",
        subhead: "Yok hatası kendini suçlatmasın. Niyeti tarif et.",
        bullets: [
          "İzmir + 5.000 ₺ üstü satış: eski sende öğleden sonra.",
          "Beş yüz fonksiyonu aklında tutacak kişi sen değilsin.",
          "Formülü yazmak stajyerin işi. Sen yönetici kal.",
        ],
        tools: ["Excel", "Copilot"],
        table: {
          headers: ["Sipariş", "Şube", "Temsilci", "Tutar"],
          rows: [
            ["A-104", "İzmir", "Elif", "5.400 ₺"],
            ["A-118", "Ankara", "Can", "2.100 ₺"],
            ["A-129", "İzmir", "Mert", "7.800 ₺"],
            ["#YOK!", "?", "?", "parantez"],
          ],
          note: "Eşittir, noktalı virgül, sütun sırası — stajyer koyar.",
        },
      },
      {
        cueIndex: 3,
        section: "Metinden Formüle",
        layout: "chat",
        headline: "Türkçe söyle, formülü o yazsın",
        subhead: "Çift köprü: metinden formüle, formülden metne.",
        bullets: [
          "Türkçe Excel ve İngilizce Excel için ayrı ayrı iste.",
          "Aralıkları tek tek anlatsın. Temiz blokta versin.",
          "İade satırlarını düş. Şu şubeyi hariç tut.",
        ],
        tools: ["Excel", "ChatGPT", "Copilot"],
        chat: {
          role: "Kıdemli veri analisti · Excel uzmanı",
          prompt:
            "İzmir şubesinde 5.000 ₺ üstü satışların toplamını F2'ye yaz. Türkçe ve İngilizce formül ayrı. İade satırlarını düş. Mantığı iki cümlede anlat.",
          replyTitle: "ÇOKETOPLAŞ.ÇOKLU / SUMIFS",
          replyLines: [
            "TR: =ÇOKETOPLAŞ.ÇOKLU(D:D;B:B;\"İzmir\";D:D;\">5000\")",
            "EN: =SUMIFS(D:D;B:B;\"İzmir\";D:D;\">5000\")",
            "Süzgeç 1 şube, süzgeç 2 tutar eşiği.",
          ],
        },
      },
      {
        cueIndex: 4,
        section: "Hata Doktoru",
        layout: "excel",
        headline: "Kırmızı hücrede panik yok",
        subhead: "Teşhisi stajyerine bırak. ÇAPRAZARA sütun sırasına kilitlenmez.",
        bullets: [
          "Formülü yapıştır, tabloyu anlat, amacı söyle.",
          "Nedenini bir cümlede istesin. Düzelti kopyalanabilir gelsin.",
          "Yılan formülü Türkçe çözdür; kapalı kutu açılır.",
        ],
        tools: ["Excel", "ChatGPT"],
        table: {
          headers: ["Kod", "Ad", "Fiyat", "Formül"],
          rows: [
            ["K-12", "Kâğıt A4", "84 ₺", "#BAŞV!"],
            ["K-12", "Kâğıt A4", "84 ₺", "DÜŞEYARA → 4. sütun"],
            ["K-12", "Kâğıt A4", "84 ₺", "ÇAPRAZARA kod+fiyat"],
            ["Sonuç", "", "84 ₺", "hücre susar"],
          ],
          note: "Aralık üç sütun. Sen dördü istedin. Excel başvuru üretir.",
        },
      },
      {
        cueIndex: 5,
        section: "Kapanış & Saha Görevi",
        layout: "keys",
        headline: "Kendi hücrende çalışan formül",
        subhead: "Kanıtın cebinde olmadan üçüncü bölüme geçme.",
        bullets: ["Sütununu anlat.", "Hata kodundan korkma.", "Sürümü baştan söyle."],
        tools: ["Excel", "ChatGPT"],
        keys: [
          { n: "01", title: "Niyet", body: "Formül ismini unut. Sütunu ve eşiği söyle." },
          { n: "02", title: "Doktor", body: "YOK / DEĞER hatası = teşhis isteği." },
          { n: "03", title: "Yerel", body: "TR noktalı virgül, EN virgül." },
        ],
        fieldTask: "Gerçek bir şube+eşik ihtiyacını yazdır, F2'ye yapıştır, çalıştığını gör.",
      },
    ],
  },
  "01_office_ai-3": {
    ...OFFICE,
    title: "Dağınık ve Bozuk Verileri Saniyeler İçinde Temizleme, Ayrıştırma ve Birleştirme",
    cues: [
      {
        cueIndex: 1,
        section: "Giriş & Köprü",
        layout: "problem",
        headline: "Çöp veri kabusu",
        subhead: "İsimler karışık, telefonlar kırık, tarihler iki dil.",
        bullets: [
          "Ad soyad tek sütuna yapışmış. Birinde 05, birinde +90.",
          "Eski usul iki saati yer. Bugün tek komutla standart tablo.",
          "Maskele. Canlı müşteri listesini modele yapıştırma.",
        ],
        tools: ["Excel", "ChatGPT", "Power Query"],
        stats: [
          { label: "Kirli satır", value: "1.204" },
          { label: "Tekrar", value: "86" },
          { label: "Tarih dilimi", value: "2" },
          { label: "Temizlik", value: "1 tarife" },
        ],
      },
      {
        cueIndex: 2,
        section: "Çöp Veri Kabusu",
        layout: "excel",
        headline: "Önce kirli sayfayı göster",
        subhead: "Stajyer çöpü görsün; sırları sen sakla.",
        bullets: [
          "Küçük/büyük harf, boşluk, gizli karakter.",
          "Başlık kaymış dışa aktarım: önce başlığı düzelt.",
          "Yinelenen müşteriyi birleştir, boş satırı at.",
        ],
        tools: ["Excel"],
        table: {
          headers: ["Ham ad", "Telefon", "Tarih", "Not"],
          rows: [
            ["ayşe  YILMAZ", "5551112233", "3.9.26", "çift boşluk"],
            ["AYŞE YILMAZ", "+905551112233", "03/09/2026", "yinelenen"],
            ["mehmet,demir", "0555 222 33 44", "2026-09-03", "tek sütun"],
            ["—", "yok", "??", "atılacak"],
          ],
          note: "Örnek satır. Gerçek listeyi maskele.",
        },
      },
      {
        cueIndex: 3,
        section: "İki Strateji",
        layout: "chat",
        headline: "İki strateji: süz veya yeniden yaz",
        subhead: "Küçük kiri formülle, büyük kiri stajyerle.",
        bullets: [
          "YALIN / BIRLEŞTIR / METİNBÖL Excel'de kalsın.",
          "Desenli çöpü modele ver: kuralı yaz, tabloyu bas.",
          "Çıktı: Ad | Soyad | E.164 telefon | ISO tarih.",
        ],
        tools: ["Excel", "ChatGPT", "Copilot"],
        chat: {
          role: "Veri temizlik mimarı",
          prompt:
            "Bu örnek satırları standartlaştır. Ad ve soyadı ayır. Telefonu +90 ile yaz. Tarihi YYYY-AA-GG yap. Yineleneni birleştir. Kuralı madde madde yaz.",
          replyTitle: "Teslim şeması",
          replyLines: [
            "Ad / Soyad ayrıldı, başlık düzgün.",
            "Telefon E.164: +905551112233",
            "Tarih 2026-09-03 · yinelenen 1 satır.",
          ],
        },
      },
      {
        cueIndex: 4,
        section: "Tarih, Telefon & Desen",
        layout: "excel",
        headline: "Deseni bir kez kilitle",
        subhead: "Yarın gelen dışa aktarım aynı tarife ile geçer.",
        bullets: [
          "Tarih metinse önce gerçek tarihe çevir.",
          "Telefon: boşluk ve parantezi at, ülke kodu ekle.",
          "Şablonunu kaydet. İkinci kez düşünme.",
        ],
        tools: ["Excel", "Copilot"],
        table: {
          headers: ["Ad", "Soyad", "Telefon", "Tarih"],
          rows: [
            ["Ayşe", "Yılmaz", "+905551112233", "2026-09-03"],
            ["Mehmet", "Demir", "+905552223344", "2026-09-03"],
            ["Müşteri A", "—", "+905553334455", "2026-09-04"],
            ["Kural", "kilitli", "E.164", "ISO"],
          ],
          note: "Temiz çıktı. Formül ezberi yok; desen var.",
        },
      },
      {
        cueIndex: 5,
        section: "Kapanış & Saha Görevi",
        layout: "keys",
        headline: "Bir kirli sütunu bugün temizle",
        subhead: "Kanıt: öncesi / sonrası yan yana.",
        bullets: ["Maskele.", "Kuralı yazdır.", "Kendi dosyana taşı."],
        tools: ["Excel", "ChatGPT"],
        keys: [
          { n: "01", title: "Örnek", body: "Canlı müşteri listesi modele gitmez." },
          { n: "02", title: "Kural", body: "Desen bir kez, tekrar bedava." },
          { n: "03", title: "Kontrol", body: "On satırı gözle doğrula." },
        ],
        fieldTask: "Tek kirli sütunu standartlaştır; öncesi-sonrası ekranını kendine sakla.",
      },
    ],
  },
  "01_office_ai-4": {
    ...OFFICE,
    title: "Word ve Resmi Yazışmalarda Profesyonel Raporlama ve Şablon Üretimi",
    cues: [
      {
        cueIndex: 1,
        section: "Giriş & Köprü",
        layout: "problem",
        headline: "Beyaz sayfa imleci",
        subhead: "Resmi yazı korkutur. İskelet korkutmaz.",
        bullets: [
          "Boş Word, boş konu satırı, gece yarısı taslak.",
          "Stajyer gövdeyi kursun. Başlığı sen onayla.",
          "Kurumsal ton: kısa, net, kapıyı kapatmayan.",
        ],
        tools: ["Word", "ChatGPT", "Copilot"],
        stats: [
          { label: "Boş sayfa", value: "korku" },
          { label: "İskelet", value: "3 dk" },
          { label: "Onay", value: "sen" },
          { label: "Sır", value: "maskeli" },
        ],
      },
      {
        cueIndex: 2,
        section: "Beyaz Sayfa",
        layout: "word",
        headline: "Rapor iskeleti önce gelir",
        subhead: "Giriş, durum, karar. Her bölümde tek mesaj.",
        bullets: [
          "Rol: kıdemli kurumsal editör.",
          "Format: başlık + 3 bölüm + madde özet.",
          "Gerçek ciro ve isim yok. Şube 1 yeter.",
        ],
        tools: ["Word", "Copilot"],
        chat: {
          role: "Kıdemli kurumsal editör",
          prompt:
            "Şube 1 operasyon notunu bir sayfalık yönetici raporuna çevir. Giriş, durum, karar. Jargon yok. En fazla 220 kelime.",
          replyTitle: "Word iskeleti",
          replyLines: [
            "1. Giriş — neden bu not masada.",
            "2. Durum — üç risk, sahipsiz iş yok.",
            "3. Karar — cuma sahibi ve tarih.",
          ],
        },
      },
      {
        cueIndex: 3,
        section: "Üç Ton",
        layout: "email",
        headline: "Aynı içerik, üç alıcı",
        subhead: "Ekibe sakin, yöneticiye kısa, dışarıya resmi.",
        bullets: [
          "Tek kaynak metin, üç teslim.",
          "Tehdit yok. Kapı açık.",
          "Konu satırı da üç versiyon.",
        ],
        tools: ["Word", "Outlook", "ChatGPT"],
        chat: {
          role: "Yazışma mimarı",
          prompt: "Aynı kararı üç tona çevir: ekip, yönetici, dış paydaş. Her biri 80 kelimeyi geçmesin.",
          replyTitle: "Üç teslim",
          replyLines: [
            "Ekip — ne değişir, kim ne yapar.",
            "Yönetici — tek sayfa, tek karar.",
            "Dışarı — resmi, tarihli, maskeli.",
          ],
        },
      },
      {
        cueIndex: 4,
        section: "Özet, Risk & Kriz",
        layout: "word",
        headline: "Risk kutusunu sen doldurursun",
        subhead: "Model uydurmasın diye ‘bilmiyorsan yazma’ kalkanı.",
        bullets: [
          "Kriz taslağı: durum, etki, sonraki adım.",
          "Hukuk ve KVKK cümlesini uydurtma.",
          "Şiir kalan her paragrafı sil.",
        ],
        tools: ["Word", "ChatGPT"],
        warning: "Olmayan mahkeme kararı, olmayan politika maddesi yok. Boşluğu doldurtma.",
      },
      {
        cueIndex: 5,
        section: "Kapanış & Saha Görevi",
        layout: "keys",
        headline: "Bir sayfalık rapor bitmiş olsun",
        subhead: "İskelet cebinde olmadan slayta geçme.",
        bullets: ["İskelet.", "Üç ton.", "Kalkan."],
        tools: ["Word", "ChatGPT"],
        keys: [
          { n: "01", title: "İskelet", body: "Boş sayfada imleç izleme." },
          { n: "02", title: "Ton", body: "Alıcıya göre kısalt." },
          { n: "03", title: "Kalkan", body: "Uydurma cümleyi sil." },
        ],
        fieldTask: "Dağınık bir notu bir sayfalık yönetici raporuna çevir ve kaydet.",
      },
    ],
  },
  "01_office_ai-5": {
    ...OFFICE,
    title: "3 Dakikada Sıfırdan PowerPoint Sunumu ve Görsel Tasarım Mimarisi",
    cues: [
      {
        cueIndex: 1,
        section: "Giriş & Köprü",
        layout: "problem",
        headline: "Boş beyaz slayt",
        subhead: "On dakika arayış iki dakikaya insin.",
        bullets: [
          "Her slaytta tek mesaj. Giriş, durum, karar.",
          "Görsel süs değil; mesajın iskeleti.",
          "Sen başlığı onayla. O gövdeyi kursun.",
        ],
        tools: ["PowerPoint", "Copilot", "ChatGPT"],
        stats: [
          { label: "Eski süre", value: "10+ dk" },
          { label: "İskelet", value: "3 dk" },
          { label: "Slayt mesajı", value: "1" },
          { label: "Süs", value: "yok" },
        ],
      },
      {
        cueIndex: 2,
        section: "Beyaz Slayt",
        layout: "pptx",
        headline: "Dört taş: başlık, kanıt, görsel, kapanış",
        subhead: "Yönetici sunumu roman değildir.",
        bullets: [
          "Kapak — tek vaat.",
          "Durum — üç sayı veya üç madde.",
          "Karar — ne istiyorsun, ne zaman.",
        ],
        tools: ["PowerPoint", "Copilot"],
        nodes: [
          { title: "Kapak", sub: "Tek cümle vaat" },
          { title: "Durum", sub: "Üç kanıt" },
          { title: "Seçenek", sub: "A / B" },
          { title: "Karar", sub: "Sahip + tarih" },
        ],
      },
      {
        cueIndex: 3,
        section: "Dört Taş",
        layout: "chat",
        headline: "Üç maddeyi slayt diline çevir",
        subhead: "Her karta tek mesaj. Jargon yok.",
        bullets: [
          "Konuşmacı notunu ayrı iste.",
          "Görsel tarif: ikon, sayı, şema — stok fotoğraf değil.",
          "12 punto altı yok. Salon okusun.",
        ],
        tools: ["ChatGPT", "PowerPoint"],
        chat: {
          role: "Yönetici sunum mimarı",
          prompt:
            "Bu üç maddeyi 6 slaytlık yönetici sunumuna çevir. Her slaytta tek mesaj. Konuşmacı notu ayrı. Görsel fikir ikon/sayı.",
          replyTitle: "6 slayt iskeleti",
          replyLines: [
            "1 Kapak · 2 Problem · 3 Kanıt",
            "4 Seçenek · 5 Karar · 6 Sonraki adım",
            "Not: slaytta cümle, notta hikâye.",
          ],
        },
      },
      {
        cueIndex: 4,
        section: "VBA & Sahne",
        layout: "pptx",
        headline: "Sahneyi kilitle, makroya tapma",
        subhead: "VBA sihir değil. Önce mesaj, sonra otomasyon.",
        bullets: [
          "Tekrarlayan aylık paketi şablona bağla.",
          "Uydurma grafik verisi yok — senin üç sayın.",
          "Sahnede tek bakışta karar görünsün.",
        ],
        tools: ["PowerPoint", "Excel"],
        nodes: [
          { title: "Mesaj", sub: "Tek bakışta karar" },
          { title: "Kanıt", sub: "Üç sayı, pasta yok" },
          { title: "Sahip", sub: "Kim + ne zaman" },
          { title: "Makro", sub: "Mesajdan sonra" },
        ],
        warning: "Sahte eksen, 3D pasta, okunmayan dipnot yok. Yönetici 8 saniyede anlasın.",
      },
      {
        cueIndex: 5,
        section: "Kapanış & Saha Görevi",
        layout: "keys",
        headline: "Altı slayt, bir karar",
        subhead: "İskeleti kendi PowerPoint'ine yapıştır.",
        bullets: ["Tek mesaj.", "Sen onayla.", "Süs yok."],
        tools: ["PowerPoint", "ChatGPT"],
        keys: [
          { n: "01", title: "Mesaj", body: "Slayt roman değildir." },
          { n: "02", title: "Taş", body: "Kapak, durum, seçenek, karar." },
          { n: "03", title: "Sahne", body: "8 saniyede okunan kart." },
        ],
        fieldTask: "Üç maddelik notu 6 slayt iskeletine çevir; kapak başlığını sen yaz.",
      },
    ],
  },
  "01_office_ai-6": {
    ...OFFICE,
    title: "Outlook ve E-Posta Trafiğini Otomatize Etme: Zorlu Müşterilere Kusursuz Yanıtlar",
    cues: [
      {
        cueIndex: 1,
        section: "Giriş & Köprü",
        layout: "problem",
        headline: "Gelen kutu bir vardiya",
        subhead: "Kırk dakika trafik. Triage yoksa gün biter.",
        bullets: [
          "Bayrak, ertele, delege, sil — dört kapı.",
          "Öfke taslakta kalsın. Sabah gönder.",
          "Thread'i modele bütün şirket maili olarak yapıştırma.",
        ],
        tools: ["Outlook", "Copilot", "ChatGPT"],
        stats: [
          { label: "Günlük mail", value: "40 dk" },
          { label: "Triage", value: "4 kapı" },
          { label: "Öfke", value: "taslak" },
          { label: "Onay", value: "sabah" },
        ],
      },
      {
        cueIndex: 2,
        section: "Gelen Kutu",
        layout: "outlook",
        headline: "Önce süz, sonra yaz",
        subhead: "Copilot özetlesin. Sen kapıyı seç.",
        bullets: [
          "Bugün / bu hafta / arşiv.",
          "CC kalabalığını tek cümlelik özet.",
          "Kişisel veri ve ek şifreyi modele verme.",
        ],
        tools: ["Outlook", "Copilot"],
        table: {
          headers: ["Kim", "Konu", "Kapı", "Süre"],
          rows: [
            ["Mali", "Bütçe cuma", "Bugün", "2 dk"],
            ["CC: 12 kişi", "FYI zinciri", "Arşiv özet", "30 sn"],
            ["Müşteri A", "Sert şikayet", "Taslak", "onaylı"],
            ["Newsletter", "—", "Sil", "0"],
          ],
          note: "Triage olmadan cevap yazmak ameleliktir.",
        },
      },
      {
        cueIndex: 3,
        section: "Triage & Özet",
        layout: "chat",
        headline: "Zinciri üç maddeye indir",
        subhead: "Karar, sahip, tarih. Gerisi gürültü.",
        bullets: [
          "Rol: yönetici asistanı.",
          "Çıktı: 3 madde + önerilen cevap taslağı.",
          "Sert üslubu ayır, diplomatik taslak bas.",
        ],
        tools: ["Outlook", "ChatGPT", "Copilot"],
        chat: {
          role: "Yönetici asistanı",
          prompt:
            "Bu zinciri 3 maddede özetle. Karar gereken tek noktayı işaretle. Diplomatik cevap taslağı ver. İsimleri maskele.",
          replyTitle: "Triage çıktısı",
          replyLines: [
            "Karar: cuma bütçe — sahip Mali.",
            "Gürültü: CC tekrarı, silinebilir.",
            "Taslak: sakin, tarihli, kapı açık.",
          ],
        },
      },
      {
        cueIndex: 4,
        section: "Diplomasi & Matris",
        layout: "email",
        headline: "Zor müşteri matrisi",
        subhead: "Sert / yumuşak / son uyarı — sen seçersin.",
        bullets: [
          "Gece taslağı sabah gider.",
          "Konu satırı maskeli tutar + tarih.",
          "İç yazışma ayrı, dış yazışma ayrı.",
        ],
        tools: ["Outlook", "ChatGPT"],
        warning: "Tehdit, aşağılama, yasal olmayan ceza vaadi yok. Diplomasi imzandır.",
      },
      {
        cueIndex: 5,
        section: "Kapanış & Güvenlik",
        layout: "keys",
        headline: "Kutu senin vardiyan değil",
        subhead: "Triage + taslak + kalkan. Modül kapanır.",
        bullets: ["Dört kapı.", "Sabah onay.", "Maske."],
        tools: ["Outlook", "Copilot"],
        keys: [
          { n: "01", title: "Triage", body: "Her mail cevap değildir." },
          { n: "02", title: "Taslak", body: "Öfke gece, imza sabah." },
          { n: "03", title: "Kalkan", body: "Thread sırrı modele gitmez." },
        ],
        fieldTask: "Bugünkü gelen kutudan 5 maili dört kapıya ayır; bir zoru diplomatik taslağa çevir.",
      },
    ],
  },
  "02_ecommerce_ai-1": {
    ...COMMERCE,
    title: "E-Ticarette Yapay Zekâ Devrimi: Pazaryerlerinde Öne Çıkma ve Mağaza Asistanlığı",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Mağazanın amelesi olma",
        subhead: "Panel, barkod, kargom nerede. Büyüme yoksa vardiya var.",
        bullets: [
          "Trendyol / Hepsiburada sekmesi açık, depo kapanmaz.",
          "Başlık romanı satmaz. Dönüşüm ve filtre satar.",
          "YZ şair değil; 7/24 operasyon müdürü.",
        ],
        tools: ["Trendyol", "Hepsiburada", "ChatGPT"],
        stats: [
          { label: "Rakip", value: "onlarca" },
          { label: "Başlık süresi", value: "saatler" },
          { label: "Kod", value: "yok" },
          { label: "Müdür", value: "7/24" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "listing",
        headline: "Ham not → SEO vitrin paketi",
        subhead: "Başlık hiyerarşisi + 5 kurşun + 4 filtre + iade notu.",
        bullets: [
          "Tip + ürün + kapasite + 2 fayda + materyal.",
          "Mobil: kalın fayda, tek cümle kanıt.",
          "Kapağı makinede yıkama uyarısı 1 yıldızı keser.",
        ],
        tools: ["ChatGPT", "Claude", "Trendyol", "Hepsiburada"],
        table: {
          headers: ["Alan", "Teslim"],
          rows: [
            ["SEO başlık", "Akıllı LED termos 500 ml · sızdırmaz çelik"],
            ["Vitrin 1", "Dokunmatik sıcaklık — ağız yanmaz"],
            ["Filtre", "500 ml · SUS 304 · 12s sıcak / 24s soğuk"],
            ["İade notu", "Kapak elde yıkanır"],
          ],
        },
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Kör yapıştırma yok",
        subhead: "Marka ihlali, mucize iddia, maliyet sızıntısı.",
        bullets: [
          "Stanley gibi yaz / Nike geçir — askıya alma.",
          "Hastalık %100 iyileşir — ceza kapıda.",
          "Toptancı maliyeti ve fabrika adı istemde yok.",
        ],
        tools: ["Trendyol", "Hepsiburada", "ChatGPT"],
        warning: "Müşteri A, sipariş 1, maskeli tutar. Onay sende kalır.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Vitrinin ilk dilimi",
        subhead: "Kendi ürününün listelemesini görmeden 2. bölüme geçme.",
        bullets: ["Müdür, şair değil.", "Yapılandırılmış komut.", "İade notu kârı korur."],
        tools: ["ChatGPT", "Satıcı paneli"],
        keys: [
          { n: "01", title: "Müdür", body: "Algoritma ve filtre için çalıştır." },
          { n: "02", title: "Paket", body: "Başlık, 5 madde, 4 etiket, uyarı." },
          { n: "03", title: "Kalkan", body: "Tescil, abartı, maliyet — hayır." },
        ],
        fieldTask: "Tedarikçi ham notunu Mağaza Satış Direktörü tarifine yapıştır; başlığı panele koy.",
      },
    ],
  },
  "02_ecommerce_ai-2": {
    ...COMMERCE,
    title: "SEO Odaklı Ürün Açıklaması Yazımı: Arama Motorlarında ve Pazaryerlerinde İlk Sıraya Çıkma",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Detaya giren müşteri kaçmasın",
        subhead: "İki satır savruk açıklama bounce üretir.",
        bullets: [
          "Savaş vitrinde biter sanılır; asıl savaş açıklamadadır.",
          "Özellik değil fayda. AIDA / PAS stajyere öğretilir.",
          "Anahtar kelime kümesi şiiri değil, kümedir.",
        ],
        tools: ["Trendyol", "Google", "ChatGPT"],
        stats: [
          { label: "Bounce", value: "yüksek" },
          { label: "Açıklama", value: "2 satır" },
          { label: "Hedef", value: "Sepete ekle" },
          { label: "Şablon", value: "AIDA" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "listing",
        headline: "Fayda iskeleti + kelime kümesi",
        subhead: "H1 vaat, H2 itiraz, kapanış CTA.",
        bullets: [
          "Küme: çelik termos, 500 ml, sızdırmaz, LED kapak.",
          "Her özellik bir müşteri sorusunu kapatsın.",
          "Mobilde kısa paragraf, kalın ara başlık.",
        ],
        tools: ["ChatGPT", "Claude", "Hepsiburada"],
        table: {
          headers: ["Blok", "İş"],
          rows: [
            ["A — Dikkat", "LED kapak: ağız yanmaz"],
            ["I — İlgi", "12s sıcak / 24s soğuk kanıt"],
            ["D — Arzu", "araç bardaklığı + süzgeç"],
            ["A — Eylem", "Sepete ekle + iade notu"],
          ],
        },
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Spam kelime yığını yasak",
        subhead: "Algoritma şişirmeyi görür. Müşteri de görür.",
        bullets: [
          "Aynı kelimeyi on kez dizme.",
          "Rakip marka adı açıklamaya girmez.",
          "Ölçü uydurma: bilmiyorsan yazma.",
        ],
        tools: ["ChatGPT", "Trendyol"],
        warning: "Tıbbi iddia ve ‘%100’ mucize cümlesi açıklamada da yok.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Açıklamayı panele yapıştır",
        subhead: "Sepete ekle mıknatısı burada kurulur.",
        bullets: ["Fayda.", "Küme.", "CTA."],
        tools: ["Satıcı paneli", "ChatGPT"],
        keys: [
          { n: "01", title: "Fayda", body: "Özellik cümlesi soruyu kapatsın." },
          { n: "02", title: "Küme", body: "Arama + pazaryeri aynı dil." },
          { n: "03", title: "Dürüstlük", body: "Uydurma ölçü yok." },
        ],
        fieldTask: "Bir ürünün açıklamasını AIDA iskeletiyle yeniden yaz ve kaydet.",
      },
    ],
  },
  "02_ecommerce_ai-3": {
    ...COMMERCE,
    title: "Müşteri Yorumları ve Soru-Cevap Analitiği: İadeleri Önleme ve İkna Edici Yanıtlar",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "1 yıldız sermayeyi yer",
        subhead: "Soru-cevap yükü ve iade, puanı çökertir.",
        bullets: [
          "Duygu analizi: kronik kusur cımbızla çıkar.",
          "Haksız yoruma diplomatik kriz yanıtı.",
          "Q&A otonom, ama onay sende.",
        ],
        tools: ["Trendyol", "Hepsiburada", "ChatGPT"],
        stats: [
          { label: "1 yıldız", value: "iade" },
          { label: "Soru", value: "gece" },
          { label: "Sentiment", value: "tarama" },
          { label: "Onay", value: "sen" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "chat",
        headline: "Yorumları kümele, kusuru adlandır",
        subhead: "Kapak / kargo / ölçü — üç kova yeter.",
        bullets: [
          "Rol: CX analisti.",
          "Çıktı: tema, örnek cümle, vitrin düzeltmesi.",
          "Gerçek sipariş no ve telefon yok.",
        ],
        tools: ["ChatGPT", "Claude"],
        chat: {
          role: "CX ve iade analisti",
          prompt:
            "Bu maskeli yorumları üç temada kümele. Kronik kusuru bir cümlede adlandır. Vitrine eklenecek bir uyarı öner. Sipariş no yok.",
          replyTitle: "Sentiment kovaları",
          replyLines: [
            "Kapak — bulaşık makinesi.",
            "Kargo — ezik kutu (lojistik).",
            "Ölçü — 500 ml net yazılmamış.",
          ],
        },
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Kavga etme, kaydı düzelt",
        subhead: "Hakaret cevabı puanı daha çok yer.",
        bullets: [
          "Haksız yorum: kanıt + sakin ton + çözüm.",
          "Haklı kusur: özür + düzeltme + SKU notu.",
          "Tıbbi / yasal vaat cevapta da yok.",
        ],
        tools: ["Satıcı paneli", "ChatGPT"],
        warning: "Müşteriyi teşhir etme. Ekran görüntüsünü açık modele yapıştırma.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir temayı vitrine geri yaz",
        subhead: "Q&A kapalı döngü: cevap + açıklama güncellemesi.",
        bullets: ["Kümele.", "Yanıtla.", "Vitrine taşı."],
        tools: ["ChatGPT", "Trendyol"],
        keys: [
          { n: "01", title: "Tema", body: "Tek yıldız = teşhis." },
          { n: "02", title: "Diplomasi", body: "Kavga satmaz." },
          { n: "03", title: "Döngü", body: "Cevap vitrini besler." },
        ],
        fieldTask: "Son 10 yorumu üç kovaya ayır; bir vitrin maddesini güncelle.",
      },
    ],
  },
  "02_ecommerce_ai-4": {
    ...COMMERCE,
    title: "Rakip ve Fiyat Analizi: Buybox ve Pazar Rekabetinde Akıllı Konumlanma",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Kör fiyat savaşı kârı sıfırlar",
        subhead: "Buybox kaybı panik indirim değildir.",
        bullets: [
          "YZ fiyat robotu değil; kârlılık direktörü.",
          "Rakibin zayıf noktası: kargo, aksesuar, açıklama.",
          "Bundle, zararına kırışın yerine geçer.",
        ],
        tools: ["Amazon", "Trendyol", "ChatGPT"],
        stats: [
          { label: "Buybox", value: "kayıp?" },
          { label: "Marj", value: "erir" },
          { label: "Silah", value: "değer" },
          { label: "Panik", value: "yasak" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "excel",
        headline: "Rakip kartı + kâr simülasyonu",
        subhead: "Komisyon, kargo, hedef marj — üç girdi.",
        bullets: [
          "Rakip başlık / puan / kargo günü tablosu.",
          "Senin farkın: filtre, paket, garanti.",
          "Fiyatı modele ‘en ucuz ol’ diye söyletme.",
        ],
        tools: ["Excel", "ChatGPT", "Amazon"],
        table: {
          headers: ["Oyuncu", "Fiyat", "Kargo", "Zayıf"],
          rows: [
            ["Rakip A", "189 ₺", "3 gün", "Açıklama yok"],
            ["Rakip B", "175 ₺", "5 gün", "1 yıldız kapak"],
            ["Sen", "199 ₺", "1 gün", "LED + süzgeç"],
            ["Hamle", "bundle", "hız", "değer önerisi"],
          ],
          note: "Birim maliyet sembolik. Fatura yapıştırılmaz.",
        },
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Rakip metnini çalma",
        subhead: "Kopya başlık algoritmayı doyurmaz, hukuku azdırır.",
        bullets: [
          "Ekran görüntüsü kişisel veri içerebilir — kırp.",
          "Dumping simülasyonu: zararı sayıyla göster.",
          "Buybox tekliği vaadi uydurma olmasın.",
        ],
        tools: ["ChatGPT", "Pazaryeri"],
        warning: "Tedarikçi faturası ve net marj açık modele gitmez.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir bundle taslağı çıkar",
        subhead: "Fiyat kırmak yerine değer yaz.",
        bullets: ["Kart.", "Marj.", "Paket."],
        tools: ["Excel", "ChatGPT"],
        keys: [
          { n: "01", title: "İstihbarat", body: "Zayıf noktayı cımbızla." },
          { n: "02", title: "Marj", body: "Komisyon + kargo hesapta." },
          { n: "03", title: "Değer", body: "Bundle Buybox’tan güçlüdür." },
        ],
        fieldTask: "Üç rakibi tabloya dök; bir değer önerisi cümlesi yaz.",
      },
    ],
  },
  "02_ecommerce_ai-5": {
    ...COMMERCE,
    title: "Pazaryeri Görsel Konsepti ve Sosyal Vitrin Metinleri",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "0,8 saniyede tıklama",
        subhead: "Beyaz fon fabrika fotoğrafı CTR öldürür.",
        bullets: [
          "Telefon kamerası + doğru istem = stüdyo sahnesi.",
          "İnfografik ölçü şeması iadeyi keser.",
          "Reels kancası mağazaya dış trafik akar.",
        ],
        tools: ["Midjourney", "Canva", "ChatGPT"],
        stats: [
          { label: "Karar", value: "0,8 sn" },
          { label: "Stüdyo", value: "istem" },
          { label: "İnfografik", value: "ölçü" },
          { label: "Hook", value: "3 sn" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "reels",
        headline: "Yaşam tarzı sahne + ölçü kartı",
        subhead: "Galeri: kahraman kare, detay, infografik, uyarı.",
        bullets: [
          "Işık, açı, doku — Midjourney / DALL·E tarifi.",
          "Canva’da milimetrik şema: 500 ml, yükseklik, ağız.",
          "TikTok/Reels: ilk 3 saniye parmak dursun.",
        ],
        tools: ["Midjourney", "Canva AI", "CapCut"],
        nodes: [
          { title: "Kahraman", sub: "Masaüstü lifestyle" },
          { title: "Detay", sub: "LED kapak makro" },
          { title: "Ölçü", sub: "İnfografik" },
          { title: "Hook", sub: "3 sn kanca" },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Ünlü yüz ve tescil yok",
        subhead: "Taklit sahne hesap uyutur.",
        bullets: [
          "Rakip ambalajını üretme.",
          "Ölçüyü uydurma; infografik yalanı iade doğurur.",
          "Müşteri DM ekran görüntüsü yok.",
        ],
        tools: ["Midjourney", "Canva"],
        warning: "Marka kalkanı görselde de geçerli. Onay sende.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir kare + bir kanca",
        subhead: "Galeriye tek yaşam tarzı sahne ekle.",
        bullets: ["Sahne.", "Ölçü.", "Hook."],
        tools: ["Midjourney", "Canva", "ChatGPT"],
        keys: [
          { n: "01", title: "CTR", body: "İlk kare tıklamadır." },
          { n: "02", title: "Ölçü", body: "İnfografik iadeyi keser." },
          { n: "03", title: "Kanca", body: "3 saniye, sonra satış." },
        ],
        fieldTask: "Bir ürün için lifestyle istemi ve 3 sn Reels kancası yaz.",
      },
    ],
  },
  "02_ecommerce_ai-6": {
    ...COMMERCE,
    title: "Kriz ve İade Yönetimi: 7/24 Otonom Mağaza Asistanlığı & Masterclass Kapanışı",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Kargo hasarı gece gelir",
        subhead: "Puan çöker, reklam pahalanır, sen uyanırsın.",
        bullets: [
          "Yanlış SKU, gecikme, ezik kutu — protokol hazır olsun.",
          "Telafi paketi: sakinleştir, iadeyi durdur, kayıt aç.",
          "Seller score beş risk alanında izlenir.",
        ],
        tools: ["Trendyol", "ChatGPT", "Outlook"],
        stats: [
          { label: "Kriz", value: "7/24" },
          { label: "Puan", value: "kırılgan" },
          { label: "Protokol", value: "1" },
          { label: "Onay", value: "sen" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "chat",
        headline: "Kriz protokolü şablonu",
        subhead: "Durum, empati, çözüm, süre, takip.",
        bullets: [
          "Rol: kıdemli CX müdürü.",
          "Sipariş no maskeli. Adres yok.",
          "Çıktı: müşteri mesajı + iç not + SKU uyarısı.",
        ],
        tools: ["ChatGPT", "Claude"],
        chat: {
          role: "Kıdemli CX müdürü",
          prompt:
            "Kargo hasarı senaryosu. Müşteri A, sipariş 1. Empati + 48 saat çözüm + iç kayıt. Adres/telefon yok. İadeyi durduracak telafi öner.",
          replyTitle: "Protokol",
          replyLines: [
            "Müşteri: geçmiş olsun + değişim/ikame.",
            "İç: lojistik kaydı, SKU fotoğraf kuralı.",
            "Süre: 48 saat, takip cümlesi.",
          ],
        },
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Suçlama ve yalan vaat yok",
        subhead: "Kargo firmasını müşteri önünde yakma.",
        bullets: [
          "Yasal olmayan ceza / tehdit yok.",
          "Puanı ‘silin’ diye yalvartma — politika ihlali.",
          "Master prompt şirketin sırrını içermez.",
        ],
        tools: ["Pazaryeri", "ChatGPT"],
        warning: "Master System Prompt’ta maliyet, IBAN, gerçek müşteri yok.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Otonom müdür, sen genel müdürsün",
        subhead: "SEO, vitrin, fiyat, görsel, kriz — tek omurga.",
        bullets: ["Protokol.", "Skor.", "Master prompt."],
        tools: ["ChatGPT", "Satıcı paneli"],
        keys: [
          { n: "01", title: "Protokol", body: "Kriz 8 saniyede şablon." },
          { n: "02", title: "Skor", body: "Beş risk, haftalık tarama." },
          { n: "03", title: "Omurga", body: "Tek master, maskeli girdi." },
        ],
        fieldTask: "Bir kriz senaryosu için 5 satırlık protokol yaz ve kaydet.",
      },
    ],
  },
  "03_social_media_ai-1": {
    ...SOCIAL,
    title: "İçerik Üretiminde Paradigma Değişimi & Fabrika Mantığı",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Bugün ne paylaşacağım paniği",
        subhead: "Zanaatkâr tempo: Pazartesi fikir, Cuma tükeniş.",
        bullets: [
          "Üç saat tasarım, yirmi dört beğeni.",
          "Bant yoksa tükeniş vardır. Sen genel müdürsün.",
          "YZ ilham perisi değil; içerik fabrikası.",
        ],
        tools: ["ChatGPT", "Claude", "Instagram"],
        stats: [
          { label: "Beğeni", value: "24" },
          { label: "Saat", value: "5+" },
          { label: "Bant", value: "yok" },
          { label: "Rol", value: "GM" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "reels",
        headline: "Tek girdi, otuz çıktı",
        subhead: "Beş sütun × altı kanca = 30 gün.",
        bullets: [
          "Acı, mit, kanıt, yaşam, satış.",
          "Algoritma: kanca, izlenme, kaydet/paylaş.",
          "Lumina Glow vakası — senin ürüne aynı matematik.",
        ],
        tools: ["ChatGPT", "Claude", "Metricool"],
        nodes: [
          { title: "Girdi", sub: "Ham ürün notu" },
          { title: "Metin", sub: "5×6 kanca" },
          { title: "Görsel", sub: "MJ / Canva" },
          { title: "Yayın", sub: "Metricool" },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Otuz fikri kör yapıştırma",
        subhead: "Tescil, ünlü yüz, tıbbi mucize — hesap uyur.",
        bullets: [
          "İlham bekleme; fabrika beklemez.",
          "KVKK: DM ekranı ve gerçek isim yok.",
          "Kapı kilitliyse bant durur — bugün bir hesap.",
        ],
        tools: ["Midjourney", "CapCut", "ChatGPT"],
        warning: "Reklam Kurulu abartıyı görür. Onay sende.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Beş sütunu kâğıda yaz",
        subhead: "Takvim taslağı elinde olmadan görsele geçme.",
        bullets: ["Fabrika.", "30 çıktı.", "Üç metrik."],
        tools: ["ChatGPT", "Claude"],
        keys: [
          { n: "01", title: "Bant", body: "Usta gibi tek tek üretme." },
          { n: "02", title: "Matris", body: "5 sütun, 6 kanca." },
          { n: "03", title: "Metrik", body: "Kanca · izlenme · kaydet." },
        ],
        fieldTask: "Bir ürün seç; beş sütuna birer fikir yaz, modeli altıya tamamlat.",
      },
    ],
  },
  "03_social_media_ai-2": {
    ...SOCIAL,
    title: "Midjourney & Canva AI ile Stüdyo Kalitesinde Visual Factory",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Stüdyo kirası masadan kalksın",
        subhead: "Işık, manken, set — istem anatomisi yeter.",
        bullets: [
          "Midjourney v6 ticari kare. Flux Discord’suz kapı.",
          "Stil tutarlılığı: --cref / marka paleti.",
          "Canva Bulk Create: 10 dakikada 30 şablon.",
        ],
        tools: ["Midjourney", "Flux", "Canva"],
        stats: [
          { label: "Stüdyo", value: "0 ₺" },
          { label: "Kapı", value: "midjourney.com" },
          { label: "Flux", value: "fal.ai" },
          { label: "Canva", value: "canva.com" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "reels",
        headline: "Işık + açı + doku tarifi",
        subhead: "Kahraman kare, yaşam tarzı, detay makro.",
        bullets: [
          "Kamera: 50mm, yumuşak pencere ışığı, mermer, buhar.",
          "Negatif: logo yok, ünlü yüz yok, rakip ambalaj yok.",
          "Canva: logo, güvenli alan, 4:5 ve 9:16 kırpım.",
        ],
        tools: ["Midjourney", "Canva Magic Studio"],
        nodes: [
          { title: "Prompt", sub: "Işık / lens / sahne" },
          { title: "Kare", sub: "4 varyasyon" },
          { title: "Marka", sub: "Canva kilit" },
          { title: "Toplu", sub: "30 post" },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Taklit stil ve tescil",
        subhead: "‘Şu markanın kapağı gibi’ yasak.",
        bullets: [
          "Gerçek müşteri fotoğrafını eğitme setine atma.",
          "Ücretsiz kota bitince sessiz düşme — planın olsun.",
          "Ölçüsüz ürün karesi iade doğurur; infografik ayrı.",
        ],
        tools: ["Midjourney", "Canva"],
        warning: "Ticari kullanım lisansını kapıdan doğrula.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir kare bas, şablona kilitle",
        subhead: "Canva marka kiti olmadan kancaya geçme.",
        bullets: ["Anatomi.", "Tutarlılık.", "Toplu."],
        tools: ["Midjourney", "Canva"],
        keys: [
          { n: "01", title: "Tarif", body: "Işık, açı, doku." },
          { n: "02", title: "Kalkan", body: "Tescil ve yüz yok." },
          { n: "03", title: "Hız", body: "Bulk Create 30’luk." },
        ],
        fieldTask: "Tek ürün için 1 Midjourney istemi ve 1 Canva şablonu üret.",
      },
    ],
  },
  "03_social_media_ai-3": {
    ...SOCIAL,
    title: "Yapay Zekâ Destekli Metin Yazarlığı & Kanca (Hook) Mühendisliği",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "0,8 saniyede parmak dursun",
        subhead: "Beğeni eskidi. Kaydet ve paylaş yaşar.",
        bullets: [
          "Beş kanca: acı, merak, mit, kanıt, fırsat.",
          "Storyboard saniye saniye yazılır.",
          "CTA: DM tüneli, ManyChat, link değil şiir.",
        ],
        tools: ["ChatGPT", "Claude", "CapCut"],
        stats: [
          { label: "Dikkat", value: "0,8 sn" },
          { label: "Kanca türü", value: "5" },
          { label: "Beğeni", value: "eski" },
          { label: "Kaydet", value: "hedef" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "reels",
        headline: "Saniye saniye storyboard",
        subhead: "0–3 kanca, 3–12 kanıt, 12–15 CTA.",
        bullets: [
          "Ekran yazısı konuşma metninden kısa olsun.",
          "Mit çürütme: ‘Leke %100 gitmez — işte asıl kural’.",
          "CTA tek iş: kaydet / DM / link.",
        ],
        tools: ["ChatGPT", "CapCut"],
        nodes: [
          { title: "0–3s", sub: "Kanca" },
          { title: "3–12s", sub: "Kanıt" },
          { title: "12–15s", sub: "CTA" },
          { title: "Metrik", sub: "Kaydet" },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Clickbait ceza yer",
        subhead: "Kanca vaadi videoda ödenmeli.",
        bullets: [
          "Tıbbi mucize ve rakip iftira yok.",
          "Müşteri yorumunu izinsiz yüzle kullanma.",
          "Şiir kanca çöptür; acıya otursun.",
        ],
        tools: ["ChatGPT", "Instagram"],
        warning: "Platform taklit ses / telif kancasına katıdır.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Beş kancadan birini çek",
        subhead: "Storyboard 15 satırı geçmesin.",
        bullets: ["Tür.", "Saniye.", "CTA."],
        tools: ["ChatGPT", "Claude"],
        keys: [
          { n: "01", title: "Kanca", body: "Beş tür, bir vaat." },
          { n: "02", title: "Zaman", body: "15 saniye matematik." },
          { n: "03", title: "Tünel", body: "CTA tek iş." },
        ],
        fieldTask: "Bir ürün için 5 kanca yaz; birini 15 sn storyboard’a dök.",
      },
    ],
  },
  "03_social_media_ai-4": {
    ...SOCIAL,
    title: "AI Avatarlar ve Seslendirme Teknolojileri (HeyGen & ElevenLabs)",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Kamera korkusu masadan kalksın",
        subhead: "Stüdyo ve mikrofon şart değil. Dudak senkronu şart.",
        bullets: [
          "HeyGen / D-ID avatar veya 2 dakikalık ikiz.",
          "ElevenLabs: nefes alan Türkçe.",
          "Mimik doğallığı kalite kontroldür — sen onayla.",
        ],
        tools: ["HeyGen", "ElevenLabs", "D-ID"],
        stats: [
          { label: "Kamera", value: "opsiyonel" },
          { label: "Kapı", value: "heygen.com" },
          { label: "Ses", value: "elevenlabs.io" },
          { label: "Lip-sync", value: "kilit" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "chat",
        headline: "Metin → ses → dudak",
        subhead: "Kısa cümle, vurgu işareti, nefes payı.",
        bullets: [
          "Script 80–120 kelime. Jargon yok.",
          "Ses: sakin, satış bağırmayan.",
          "Avatar bakış ve arka plan markaya kilit.",
        ],
        tools: ["ElevenLabs", "HeyGen", "ChatGPT"],
        chat: {
          role: "Reels konuşma yazarı",
          prompt:
            "15 saniyelik serum kancası. Kamera korkusu olan kurucu konuşsun. Bağırmadan, 90 kelime, CTA kaydet.",
          replyTitle: "Script iskeleti",
          replyLines: [
            "Kanca 2 cümle.",
            "Kanıt 3 cümle.",
            "CTA 1 cümle — kaydet.",
          ],
        },
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Başkasının sesini klonlama",
        subhead: "İzinsiz ikiz hukuk ve platform ihlalidir.",
        bullets: [
          "Müşteri yüzünü avatara basma.",
          "Tıbbi tavsiye avatar ağzından çıkmaz.",
          "Kota bitince yayın durur — fallback metin kare.",
        ],
        tools: ["HeyGen", "ElevenLabs"],
        warning: "Kendi sesin / kendi yüzün veya lisanslı stok avatar.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir 15 sn klip bas",
        subhead: "Kapı adlarını deftere yaz.",
        bullets: ["Script.", "Ses.", "Sync."],
        tools: ["HeyGen", "ElevenLabs"],
        keys: [
          { n: "01", title: "İkiz", body: "Kamera şart değil." },
          { n: "02", title: "Ses", body: "Nefes ve vurgu." },
          { n: "03", title: "İzin", body: "Yüz ve ses senin." },
        ],
        fieldTask: "90 kelimelik script yaz; ElevenLabs kapısını aç, bir cümleyi dinle.",
      },
    ],
  },
  "03_social_media_ai-5": {
    ...SOCIAL,
    title: "CapCut AI & Otonom Video Kurgu Hattı",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Kurgu ameleliği bitsin",
        subhead: "Yüzde yetmiş beş sessiz izler. Altyazı şart.",
        bullets: [
          "Script-to-Video iskelet, sen ritmi kilitlersin.",
          "2,5 sn kuralı: B-roll ve kesme.",
          "Runway / Kling: statik kareden kamera hareketi.",
        ],
        tools: ["CapCut", "Runway", "Kling"],
        stats: [
          { label: "Sessiz izleme", value: "%75" },
          { label: "Kesme", value: "2,5 sn" },
          { label: "CapCut", value: "capcut.com" },
          { label: "Runway", value: "app.runwayml.com" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "reels",
        headline: "9:16 hat: altyazı + B-roll + SFX",
        subhead: "Kelime vurgulu Auto Captions, PiP, ritim.",
        bullets: [
          "Hook karesi ilk karede dolu olsun.",
          "Kling/Runway hareketi 3–5 sn, abartma.",
          "Müzik telifsiz; ses markayı ezmesin.",
        ],
        tools: ["CapCut", "Runway", "Kling"],
        nodes: [
          { title: "Script", sub: "CapCut AI" },
          { title: "Caption", sub: "Vurgulu kelime" },
          { title: "B-roll", sub: "2,5 sn" },
          { title: "Export", sub: "9:16" },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Telif müzik ve sahte B-roll",
        subhead: "Trend ses tuzağı hesabı vurur.",
        bullets: [
          "Yüz tanıyan stok klip müşteri sanılır — kullanma.",
          "Aşırı AI titreme kalite düşürür; kes.",
          "Altyazı hatası anlamı bozarsa yayınlama.",
        ],
        tools: ["CapCut", "Kling"],
        warning: "klingai.com ve Runway kapısı kilitliyse bant durur. Bugün hesap.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir dikey taslak export",
        subhead: "Altyazısız videoyu yayınlama.",
        bullets: ["Kesme.", "Caption.", "9:16."],
        tools: ["CapCut", "Runway"],
        keys: [
          { n: "01", title: "Sessiz", body: "Altyazı zorunlu." },
          { n: "02", title: "Ritim", body: "2,5 saniye kuralı." },
          { n: "03", title: "Hareket", body: "Kling/Runway dozunda." },
        ],
        fieldTask: "15 sn kancayı CapCut’ta altyazılı 9:16’ya kilitle.",
      },
    ],
  },
  "03_social_media_ai-6": {
    ...SOCIAL,
    title: "Otonom İçerik Yayınlama, Ticari Modeller ve Modül Kapanışı",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Klasörde çürüyen 30 kare",
        subhead: "Üretim bitti sanılır. Dağıtım başlamamıştır.",
        bullets: [
          "Metricool / Buffer / Publer kuyruğu.",
          "CCaaS: paket gelir, saat satışı değil.",
          "İtiraz matematiği: ‘ben yapamam’ biter.",
        ],
        tools: ["Metricool", "Buffer", "Publer"],
        stats: [
          { label: "Kuyruk", value: "30 gün" },
          { label: "Kapı", value: "metricool.com" },
          { label: "Paket", value: "CCaaS" },
          { label: "Sen", value: "GM" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "flow",
        headline: "Takvim protokolü",
        subhead: "Üret → onay → kuyruk → rapor.",
        bullets: [
          "Pazartesi onay, hafta içi otomatik basım.",
          "Platform kırpımı: 4:5, 9:16, 1:1.",
          "Rapor: kanca, izlenme, kaydet — beğeni değil.",
        ],
        tools: ["Metricool", "ChatGPT"],
        nodes: [
          { title: "Onay", sub: "Sen" },
          { title: "Kuyruk", sub: "Metricool" },
          { title: "Basım", sub: "IG / TT / Shorts" },
          { title: "Rapor", sub: "3 metrik" },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Otomatik basım kriz doğurur",
        subhead: "Onaysız kuyruk markayı yakar.",
        bullets: [
          "Kriz günü kuyruğu durdur.",
          "Müşteri paketinde lisans ve revizyon SLA yaz.",
          "Rakip ifşa ve mucize vaat kuyruğa girmez.",
        ],
        tools: ["Metricool", "Buffer"],
        warning: "Şifreleri stajyere emanet etme. Kapı senin.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Yedi günü kuyruğa diz",
        subhead: "Fabrika ancak basınca fabrikadır.",
        bullets: ["Kuyruk.", "SLA.", "Rapor."],
        tools: ["Metricool", "ChatGPT"],
        keys: [
          { n: "01", title: "Dağıtım", body: "Klasör satış değildir." },
          { n: "02", title: "CCaaS", body: "Paket, saat değil." },
          { n: "03", title: "Fren", body: "Krizde kuyruk durur." },
        ],
        fieldTask: "Yedi içerik taslağını takvime yaz; birini Metricool kapısından tanı.",
      },
    ],
  },
  "04_chatbot_nocode-1": {
    ...BOT,
    title: "Chatbot Dünyasına Giriş ve Zihniyet Değişimi",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Gece üçte susmayan hat",
        subhead: "Klinik kapalı, DM bakılmıyor, rakip kapatıyor.",
        bullets: [
          "Menü robotu satış kapatmaz. Bir’e bas, ikiye bas.",
          "Cuma 23:45 diş kırık — sabah cevap geç kalır.",
          "Bot nöbet tutar. Kalite kontrol sende.",
        ],
        tools: ["WhatsApp", "Voiceflow", "Botpress"],
        stats: [
          { label: "Kayıp", value: "gece" },
          { label: "Menü bot", value: "çöp" },
          { label: "Hedef", value: "randevu" },
          { label: "Kod", value: "yok" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "whatsapp",
        headline: "Satış kapatan diyalog",
        subhead: "NovaDent: 0,4 sn, geçici kaplama, yarın 10:30.",
        bullets: [
          "Her mesaj eylemle biter. Fiyat basıp susma.",
          "İki kapı: Voiceflow prototip, Botpress WhatsApp beyni.",
          "OpenAI anahtarı ekran görüntüsüne ve git’e yok.",
        ],
        tools: ["Voiceflow", "Botpress", "WhatsApp"],
        messages: [
          { from: "user", text: "Ön diş kırık. Zirkonyum hemen yapılır mı?" },
          { from: "bot", text: "Geçmiş olsun. Aynı gün geçici kaplama mümkün. Yarın 10:30 uygun — randevu ister misiniz?" },
          { from: "user", text: "Evet." },
          { from: "bot", text: "İsim ve telefon alayım. Konum ve danışman bildirimi gidecek." },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Bot antibiyotik yazmaz",
        subhead: "Teşhis yok. Randevu var. Fallback insana.",
        bullets: [
          "Menü botunu akıllı sanma.",
          "Gece mesajını sabaha bırakma.",
          "Gerçek hasta, röntgen, kimlik açık modele yapışmaz.",
        ],
        tools: ["Voiceflow", "Botpress", "OpenAI"],
        warning: "KVKK onayı olmadan canlıya basma. Kota bitince sessiz düşme.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Üç niyet, iki bilgi",
        subhead: "Randevu. Fiyat. Acil. İsim + telefon. İnsan adı.",
        bullets: ["Diyalog.", "İki kapı.", "Fallback."],
        tools: ["voiceflow.com", "botpress.com", "make.com"],
        keys: [
          { n: "01", title: "Eylem", body: "Her mesaj bir sonraki adım." },
          { n: "02", title: "Kapı", body: "VF web, BP WhatsApp." },
          { n: "03", title: "İnsan", body: "Bilmezse devret." },
        ],
        fieldTask: "Kendi işin için 3 niyet ve hayati 2 bilgiyi yaz; botun devredeceği isim.",
      },
    ],
  },
  "04_chatbot_nocode-2": {
    ...BOT,
    title: "Voiceflow ile İlk Web Chatbot'unu Tasarla (Görsel Akış ve Mantık)",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Tuval boş, sözleşme bekliyor",
        subhead: "On beş dakikada prototip. Kod yok.",
        bullets: [
          "Intent, utterance, entity — kodsuz isimler.",
          "Carousel, değişken, If/Else.",
          "Web vitrini Voiceflow; WhatsApp omurga sonra.",
        ],
        tools: ["Voiceflow", "ChatGPT"],
        stats: [
          { label: "Kapı", value: "voiceflow.com" },
          { label: "Prototip", value: "15 dk" },
          { label: "Kod", value: "0" },
          { label: "Yayın", value: "web" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "flow",
        headline: "Karşılama → niyet → kart → kapanış",
        subhead: "New Assistant. Tuval. İlk ok.",
        bullets: [
          "Regex: telefon formatı.",
          "Değişken: {name} {phone} {intent}.",
          "Carousel: üç hizmet kartı, tek CTA.",
        ],
        tools: ["Voiceflow"],
        nodes: [
          { title: "Karşılama", sub: "Güven cümlesi" },
          { title: "Niyet", sub: "Randevu / fiyat" },
          { title: "Topla", sub: "İsim + telefon" },
          { title: "Kapat", sub: "Onay + insan" },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Ansiklopedi tuvali",
        subhead: "On düğme satış kapatmaz. Üç niyet yeter.",
        bullets: [
          "Entity kaçarsa tekrar sor, tahmin etme.",
          "Testte sahte isim. Canlı PII yok.",
          "Yayın tuşu ≠ KVKK onayı.",
        ],
        tools: ["Voiceflow"],
        warning: "Fallback düğmesi görünür olsun. Sessiz döngü yok.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "İlk oku çiz",
        subhead: "Tuvalde dört kutu görmeden Botpress’e geçme.",
        bullets: ["Intent.", "Değişken.", "Fallback."],
        tools: ["voiceflow.com"],
        keys: [
          { n: "01", title: "Tuval", body: "Görsel akış sözleşmedir." },
          { n: "02", title: "Topla", body: "İki bilgi, formatlı." },
          { n: "03", title: "Fren", body: "İnsan düğmesi." },
        ],
        fieldTask: "Voiceflow’da New Assistant aç; karşılama ve bir niyet kutusu koy.",
      },
    ],
  },
  "04_chatbot_nocode-3": {
    ...BOT,
    title: "Botpress ile Derinleşme ve Yapay Zekâ (LLM) Entegrasyonu",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Belge beyni yoksa uydurur",
        subhead: "RAG: tedavi kılavuzu ders kitabı olur.",
        bullets: [
          "Botpress Studio + Knowledge Base.",
          "Guardrail, duygu, çok dil, fallback.",
          "Sıcaklık düşük. Ansiklopedi yasağı devam.",
        ],
        tools: ["Botpress", "OpenAI"],
        stats: [
          { label: "Kapı", value: "botpress.com" },
          { label: "RAG", value: "KB" },
          { label: "Sıcaklık", value: "düşük" },
          { label: "Uydurma", value: "kes" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "flow",
        headline: "KB → eşik → cevap → eylem",
        subhead: "Anlamsal eşik altında ‘bilmiyorum + insan’.",
        bullets: [
          "PDF kılavuz: fiyat aralığı, süreç, hazırlık.",
          "Cevap kaynak cümlesi göstersin.",
          "Duygu: öfke → insan.",
        ],
        tools: ["Botpress", "Knowledge Base"],
        nodes: [
          { title: "KB", sub: "Kılavuz PDF" },
          { title: "Eşik", sub: "Skor kalkanı" },
          { title: "Cevap", sub: "Kaynaklı" },
          { title: "İnsan", sub: "Fallback" },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Teşhis ve ilaç yok",
        subhead: "Guardrail: tıbbi tavsiye niyeti insan.",
        bullets: [
          "KB’de olmayanı tamamlatma.",
          "Anahtarı repo’ya basma.",
          "Çok dil: TR varsayılan, EN açık; karıştırma.",
        ],
        tools: ["Botpress", "platform.openai.com"],
        warning: "Halüsinasyon = boşluk doldurma. Ray = kısıt + KB.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir PDF yükle, bir soru sor",
        subhead: "Kaynaksız cevabı yayınlama.",
        bullets: ["KB.", "Eşik.", "Guardrail."],
        tools: ["Botpress", "OpenAI"],
        keys: [
          { n: "01", title: "Kitap", body: "RAG ders kitabıdır." },
          { n: "02", title: "Eşik", body: "Düşük skor = insan." },
          { n: "03", title: "Ray", body: "Teşhis yasak." },
        ],
        fieldTask: "Sahte kılavuz PDF ile bir soru-cevap dene; kaynağı gör.",
      },
    ],
  },
  "04_chatbot_nocode-4": {
    ...BOT,
    title: "WhatsApp API ve Meta Entegrasyon Savaşları",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Yeşil tik yarın, zihin bugün",
        subhead: "Telefon uygulaması ≠ Cloud API.",
        bullets: [
          "İşletme doğrulama, sandbox, rate limit.",
          "24 saat kuralı, şablon onay, spam kalkanı.",
          "Click-to-WhatsApp reklam ayrı hat.",
        ],
        tools: ["Meta", "WhatsApp Cloud API", "Botpress"],
        stats: [
          { label: "Kapı", value: "developers.facebook.com" },
          { label: "24s", value: "pencere" },
          { label: "Şablon", value: "onaylı" },
          { label: "Tik", value: "sonra" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "whatsapp",
        headline: "Sandbox’ta diyalog, canlıda kalkan",
        subhead: "ManyChat hızlı reklam; Botpress belge beyni.",
        bullets: [
          "Test numarası, sahte isim.",
          "Şablon: randevu hatırlatma, pazarlama değil teşhis.",
          "Hız limiti dolunca kuyruk, spam değil.",
        ],
        tools: ["Meta", "Botpress", "ManyChat"],
        messages: [
          { from: "bot", text: "NovaDent hatırlatma: yarın 10:30. Onay için 1 yazın." },
          { from: "user", text: "1" },
          { from: "bot", text: "Kaydınız alındı. Konum pin’i geliyor. Değişiklik için danışman." },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Şablon reddi ve 24s dışına satış",
        subhead: "Pencere kapalıysa sadece onaylı template.",
        bullets: [
          "Toplu pazarlama ban yer.",
          "Kişisel numarayı API sanma.",
          "Reklam tıklaması niyeti bota bağlanmazsa para yanar.",
        ],
        tools: ["Meta", "WhatsApp"],
        warning: "Canlı hasta verisi sandbox’a karışmasın.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Kapıyı tanı, tiki beklet",
        subhead: "developers.facebook.com ürünü: WhatsApp.",
        bullets: ["Sandbox.", "24s.", "Şablon."],
        tools: ["Meta", "Botpress"],
        keys: [
          { n: "01", title: "API", body: "Uygulama değil bulut." },
          { n: "02", title: "Pencere", body: "24 saat kuralı." },
          { n: "03", title: "Onay", body: "Şablon + KVKK." },
        ],
        fieldTask: "Meta geliştirici kapısını aç; WhatsApp ürününü listele, canlı basma.",
      },
    ],
  },
  "04_chatbot_nocode-5": {
    ...BOT,
    title: "Dış Dünya Bağlantıları (Webhooks, Make.com ve CRM)",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Bot adada kalmasın",
        subhead: "İsim alındı, takvim boş, CRM kör.",
        bullets: [
          "Webhook garson: siparişi mutfağa taşır.",
          "Make.com senaryo: Sheets, Airtable, takvim.",
          "Human handoff: bot susar, insan alır.",
        ],
        tools: ["Make.com", "Botpress", "Google Sheets"],
        stats: [
          { label: "Kapı", value: "make.com" },
          { label: "Garson", value: "webhook" },
          { label: "Hafıza", value: "Data Store" },
          { label: "Handoff", value: "insan" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "flow",
        headline: "Topla → webhook → yaz → bildir",
        subhead: "Paralel: satır + takvim + Slack/mail.",
        bullets: [
          "Asenkron cevap: ‘kaydınız alındı’ hemen.",
          "Hata senaryosu: mutfak düşerse insan.",
          "Çift yönlü: müsait slot sor, bota dön.",
        ],
        tools: ["Make.com", "Botpress", "Airtable"],
        nodes: [
          { title: "Bot", sub: "İsim + telefon" },
          { title: "Make", sub: "Senaryo" },
          { title: "Sheet", sub: "Satır" },
          { title: "Takvim", sub: "Slot" },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Çift kayıt ve sızan PII",
        subhead: "Idempotent yaz. Log’da telefon maskeli.",
        bullets: [
          "Webhook sırrını git’e basma.",
          "Sonsuz döngü: bot ↔ Make ping-pong yok.",
          "Acil: botu sustur, insanı bağla.",
        ],
        tools: ["Make.com", "CRM"],
        warning: "Canlı röntgen ve kimlik senaryoya hiç girmez.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir satır yazan senaryo",
        subhead: "Ada botu işletme botu değildir.",
        bullets: ["Garson.", "Hafıza.", "Handoff."],
        tools: ["make.com", "Botpress"],
        keys: [
          { n: "01", title: "Taşı", body: "Webhook garson." },
          { n: "02", title: "Yaz", body: "Sheet/CRM tek kaynak." },
          { n: "03", title: "Fren", body: "Hata = insan." },
        ],
        fieldTask: "Make.com’da boş senaryo aç; webhook + Sheets modülünü tanı, canlı PII yok.",
      },
    ],
  },
  "04_chatbot_nocode-6": {
    ...BOT,
    title: "Ticari Fırsat: Müşterilere Chatbot Satmak ve Modül Kapanışı",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "CaaS: nöbeti paketle",
        subhead: "Kurulum bir kez, bakım aylık. Saat satma.",
        bullets: [
          "İki katmanlı fiyat: kurulum + retainer.",
          "SLA: cevap süresi, handoff, kota.",
          "Demo bot randevu alır; slayt satmaz.",
        ],
        tools: ["Voiceflow", "Botpress", "Make.com"],
        stats: [
          { label: "Model", value: "CaaS" },
          { label: "Kurulum", value: "bir kez" },
          { label: "Bakım", value: "aylık" },
          { label: "Demo", value: "canlı" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "chat",
        headline: "İtiraz → sayı → demo",
        subhead: "Gece kaybı × ortalama bilet = paket bedeli.",
        bullets: [
          "Soğuk açılış: 3 niyet, 2 bilgi, 1 insan.",
          "Sözleşme: KVKK, kapsam, revizyon hakkı.",
          "Prompt atölyesine köprü: dil aynı.",
        ],
        tools: ["ChatGPT", "Voiceflow"],
        chat: {
          role: "CaaS satış mimarı",
          prompt:
            "Klinik itirazı: bot yanlış söyler. 80 kelimelik sakin cevap + demo teklifi. Fiyat uydurma. Fallback insan vurgula.",
          replyTitle: "İtiraz kalkanı",
          replyLines: [
            "Bot teşhis yazmaz, randevu alır.",
            "KB + eşik + insan fren.",
            "Canlı demo: 3 niyet, 4 dakika.",
          ],
        },
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Kapsamsız satış pişmanlık",
        subhead: "WhatsApp tikini ‘biz hallederiz’ diye vaat etme.",
        bullets: [
          "Meta doğrulama müşteri işi olabilir — yaz.",
          "Sınırsız revizyon retainer’ı öldürür.",
          "Hasta verisi senin laptop’unda arşivlenmez.",
        ],
        tools: ["SLA", "Sözleşme"],
        warning: "Demo maskeli. Canlı veri yok.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir teklif iskeleti yaz",
        subhead: "Prompt masasında görüşürüz — dil aynı.",
        bullets: ["Paket.", "SLA.", "Demo."],
        tools: ["Voiceflow", "Botpress"],
        keys: [
          { n: "01", title: "CaaS", body: "Nöbet paketlenir." },
          { n: "02", title: "SLA", body: "Süre, fren, kota." },
          { n: "03", title: "Demo", body: "Bot randevu alsın." },
        ],
        fieldTask: "Tek sayfalık teklif: 3 niyet, kurulum, aylık, handoff ismi.",
      },
    ],
  },
  "05_prompt_practice-1": {
    ...PROMPT,
    title: "Yapay Zekâ ile Doğru İletişim & Prompt Zihniyeti",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Boş kutu Google değildir",
        subhead: "Fihrist arar. Model problem çözer.",
        bullets: [
          "‘Pazarlama planı yaz’ klişe basar.",
          "Üç kapı: chatgpt.com, claude.ai, perplexity.ai.",
          "Ücretsiz kota yeter. Kapı kilitliyse bant durur.",
        ],
        tools: ["ChatGPT", "Claude", "Perplexity"],
        stats: [
          { label: "Google", value: "fihrist" },
          { label: "Model", value: "asistan" },
          { label: "Tuzak", value: "az kelime" },
          { label: "Taş", value: "5" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "prompt",
        headline: "Beş taş: rol görev bağlam kısıt çıktı",
        subhead: "Kadıköy Moda kahve vakası — klişe vs çerçeve.",
        bullets: [
          "Rol şapka, görev fiil, bağlam sahne.",
          "Kısıt kalkan, çıktı teslim şekli.",
          "Aynı taş üç kapıda da çalışır.",
        ],
        tools: ["ChatGPT", "Claude", "Perplexity"],
        nodes: [
          { title: "Rol", sub: "3. dalga yazar" },
          { title: "Görev", sub: "3 metin" },
          { title: "Bağlam", sub: "Etiyopya, 18s" },
          { title: "Kısıt", sub: "klişe yasak" },
          { title: "Çıktı", sub: "başlık + CTA" },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Halüsinasyon boşluk doldurur",
        subhead: "Olmayan 2024 etik kitabı üç başlık basar.",
        bullets: [
          "Bilmiyorum refleksi varsayılan açık değil.",
          "Kısıt: uydurma, ‘veride yok’ de.",
          "Maske: isim, IBAN, telefon yok.",
        ],
        tools: ["ChatGPT", "Claude", "Perplexity"],
        warning: "Prompt süslü cümle değil; ray döşeme sanatıdır.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Tek cümleyi beş taşa çevir",
        subhead: "Uçurumu ekranda görmeden Few-Shot’a geçme.",
        bullets: ["Fihrist değil.", "Beş taş.", "Üç kapı."],
        tools: ["chatgpt.com", "claude.ai", "perplexity.ai"],
        keys: [
          { n: "01", title: "Zihin", body: "Google gibi fırlatma." },
          { n: "02", title: "Taş", body: "Rol görev bağlam kısıt çıktı." },
          { n: "03", title: "Ray", body: "Kısıt + maske." },
        ],
        fieldTask: "‘Bana bir mail yaz’ isteminin altına beş satır ekle; iki sonucu yan yana koy.",
      },
    ],
  },
  "05_prompt_practice-2": {
    ...PROMPT,
    title: "İleri Seviye Prompt Teknikleri (Few-Shot & Chain-of-Thought)",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Sıfır örnek = kaygan ray",
        subhead: "Zor mantıkta model kısa yol arar. Sen örnekle kilitlersin.",
        bullets: [
          "Few-Shot: 2–3 altın örnek, sonra asıl iş.",
          "CoT: adım adım düşün, sonra cevap.",
          "Perplexity kaynak ister; uydurma dipnotu kes.",
        ],
        tools: ["ChatGPT", "Claude", "Perplexity"],
        stats: [
          { label: "Örnek", value: "2–3" },
          { label: "CoT", value: "adım" },
          { label: "Kısa yol", value: "yasak" },
          { label: "Kaynak", value: "iste" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "prompt",
        headline: "Örnekle öğret, adımla kilitle",
        subhead: "Girdi → istenen format örneği → yeni girdi.",
        bullets: [
          "Örnekler senin kaliteni taşır.",
          "CoT: ara sonuçları yazdır, sonra nihai.",
          "Kısıt: ‘emin değilsen dur’.",
        ],
        tools: ["ChatGPT", "Claude"],
        chat: {
          role: "Mantık denetçisi",
          prompt:
            "İki örnek sınıflandırma veriyorum (pozitif/negatif/nötr). Üçüncü metni aynı şemada sınıflandır. Önce adımları yaz, sonra etiket. Uydurma yok.",
          replyTitle: "Few-Shot + CoT",
          replyLines: [
            "Adım 1: ipuçları.",
            "Adım 2: eleme.",
            "Etiket: nötr — gerekçe tek cümle.",
          ],
        },
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Zehirli örnek ve sahte CoT",
        subhead: "Kötü örnek kaliteyi çoğaltır. Uzun düşünme ≠ doğru.",
        bullets: [
          "Örnekte PII olmasın.",
          "Matematikte ara adımı doğrula.",
          "Perplexity: link yoksa iddia zayıf.",
        ],
        tools: ["Claude", "Perplexity"],
        warning: "Model ‘adım adım’ yazıp yine uydurabilir. Sen kontrol et.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir göreve iki örnek ekle",
        subhead: "Sıfır hataya giden yol örnek + adım.",
        bullets: ["Few-Shot.", "CoT.", "Doğrula."],
        tools: ["ChatGPT", "Claude"],
        keys: [
          { n: "01", title: "Örnek", body: "Kaliteyi çoğaltır." },
          { n: "02", title: "Adım", body: "Kısa yolu keser." },
          { n: "03", title: "Kanıt", body: "Kaynak veya hesap." },
        ],
        fieldTask: "Sınıflandırma veya özet işine 2 örnek koy; CoT iste; sonucu elle doğrula.",
      },
    ],
  },
  "05_prompt_practice-3": {
    ...PROMPT,
    title: "İş Hayatında ve Metin Üretiminde Prompt Mühendisliği",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Ofis metni klişe basmasın",
        subhead: "Mail, brif, tutanak — aynı beş taş, farklı teslim.",
        bullets: [
          "Alıcı, amaç, uzunluk, yasak kelime.",
          "Marka sesi: örnek paragraf Few-Shot.",
          "Hukuk uydurma: ‘avukat değil, taslak’ kalkanı.",
        ],
        tools: ["ChatGPT", "Claude", "Word"],
        stats: [
          { label: "Teslim", value: "mail/brif" },
          { label: "Ses", value: "örnekle" },
          { label: "Hukuk", value: "taslak" },
          { label: "Onay", value: "sen" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "chat",
        headline: "Brif → taslak → üç ton",
        subhead: "Tek kaynak, üç alıcı. Word’e yapıştırılabilir blok.",
        bullets: [
          "Rol: kurumsal editör.",
          "Kısıt: 120 kelime, jargon yok, kapı açık.",
          "Çıktı: konu + gövde + sonraki adım.",
        ],
        tools: ["ChatGPT", "Claude", "Copilot"],
        chat: {
          role: "Kurumsal editör",
          prompt:
            "Şube 1 gecikme brifini yönetici mailine çevir. 120 kelime. Konu satırı ayrı. Tehdit yok. İsim maskeli.",
          replyTitle: "Teslim",
          replyLines: [
            "Konu: Şube 1 — cuma aksiyonu",
            "Gövde: durum + sahip.",
            "Adım: teyit isteği.",
          ],
        },
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Gizli brifi yapıştırma",
        subhead: "Müşteri sözleşmesi açık modele gitmez.",
        bullets: [
          "Şablonlaştır: Firma 1, tutar köşeli parantez.",
          "İtibar krizi taslağı hukuk onayı ister.",
          "Claude uzun metin; yine de sır yok.",
        ],
        tools: ["Claude", "ChatGPT"],
        warning: "Üretilen metin imza değildir. Göndermeden oku.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir gerçek maili yeniden yaz",
        subhead: "Önce-sonra uçurumu dosyala.",
        bullets: ["Taş.", "Ton.", "Maske."],
        tools: ["ChatGPT", "Word"],
        keys: [
          { n: "01", title: "Alıcı", body: "Teslim şeklini baştan söyle." },
          { n: "02", title: "Ses", body: "Örnek paragraf ver." },
          { n: "03", title: "İmza", body: "Sen gönderirsin." },
        ],
        fieldTask: "Bu haftaki bir maili beş taşla yeniden yaz; eskiyi silme, karşılaştır.",
      },
    ],
  },
  "05_prompt_practice-4": {
    ...PROMPT,
    title: "Veri Analizi, Problem Çözme ve Karar Destek Promptları",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Tabloyu şiirle okutma",
        subhead: "Karar destek: varsayım, metrik, seçenek, risk.",
        bullets: [
          "Örnek satır ver, tüm mizanı yapıştırma.",
          "CoT: ara toplamları yazdır.",
          "Perplexity dış kaynak; iç tablo senin.",
        ],
        tools: ["ChatGPT", "Claude", "Excel", "Perplexity"],
        stats: [
          { label: "Girdi", value: "örnek" },
          { label: "Çıktı", value: "seçenek" },
          { label: "Uydurma sayı", value: "yasak" },
          { label: "Karar", value: "sen" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "excel",
        headline: "Soru → süzgeç → üç seçenek",
        subhead: "Her seçenek: artı, eksi, varsayım.",
        bullets: [
          "Rol: karar analisti, muhasebeci değil.",
          "Kısıt: tabloda yoksa ‘yok’ de.",
          "Çıktı: tablo + öneri + sonraki veri ihtiyacı.",
        ],
        tools: ["Excel", "Claude", "ChatGPT"],
        table: {
          headers: ["Seçenek", "Etki", "Risk", "Varsayım"],
          rows: [
            ["A — stok tut", "nakit korunur", "stoksuz kalma", "talep düz"],
            ["B — +20%", "ciro", "iade", "kampanya tutar"],
            ["C — bundle", "marj", "operasyon", "kargo sığar"],
            ["Eksik", "gerçek iade %", "—", "veride yok"],
          ],
          note: "Sayı yoksa uydurma. Eksik satırı iste.",
        },
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Sahte kesinlik",
        subhead: "Model güven cümlesi kanıt değildir.",
        bullets: [
          "Regresyon masalı, 3 satırla ‘trend’ yok.",
          "Kişisel maaş / IBAN analizde yok.",
          "Dış istatistik: Perplexity + link.",
        ],
        tools: ["Perplexity", "Claude"],
        warning: "Karar senin. Model seçenek üretir.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir mikro tabloyla üç seçenek",
        subhead: "Eksik veriyi de yazdır.",
        bullets: ["Örnek satır.", "Seçenek.", "Eksik."],
        tools: ["Excel", "ChatGPT"],
        keys: [
          { n: "01", title: "Girdi", body: "Örnek, tüm defter değil." },
          { n: "02", title: "Seçenek", body: "Artı eksi varsayım." },
          { n: "03", title: "Dürüstlük", body: "Yoksa yok de." },
        ],
        fieldTask: "5 satırlık örnek tabloyla 3 karar seçeneği üret; uydurma sayıyı sil.",
      },
    ],
  },
  "05_prompt_practice-5": {
    ...PROMPT,
    title: "Görsel ve Multimodal Yapay Zekâ için Prompt Mühendisliği",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "‘Güzel bir görsel yap’ yetmez",
        subhead: "Sahne, ışık, lens, negatif, teslim oranı.",
        bullets: [
          "Metin beş taş + görsel anatomi.",
          "Referans: stil tarifi, tescilli kapak değil.",
          "Çıktı: 1:1, 4:5, 16:9 ayrı söyle.",
        ],
        tools: ["ChatGPT", "Midjourney", "Canva"],
        stats: [
          { label: "Sahne", value: "zorunlu" },
          { label: "Negatif", value: "logo/yüz" },
          { label: "Oran", value: "söyle" },
          { label: "Tescil", value: "yasak" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "reels",
        headline: "Multimodal tarife",
        subhead: "Görüntüyü tarif et, metni kilitle, varyasyonu sınırla.",
        bullets: [
          "Ürün: malzeme, ışık, zemin, boş alan logo için.",
          "Yasak: ünlü, rakip, okunaksız yazı.",
          "3 varyasyon, 1 kahraman kare.",
        ],
        tools: ["Midjourney", "ChatGPT", "Canva"],
        nodes: [
          { title: "Özne", sub: "Ürün / sahne" },
          { title: "Işık", sub: "Pencere / gece" },
          { title: "Lens", sub: "50mm / makro" },
          { title: "Negatif", sub: "logo, yüz" },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Yüz, çocuk, tescil, yalan ölçü",
        subhead: "Multimodal kalkan metinden sıkı.",
        bullets: [
          "Müşteri fotoğrafını ‘güzelleştir’ diye yükleme.",
          "İnfografik sayıyı model uydurmasın.",
          "Deepfake ses/yüz yok.",
        ],
        tools: ["Midjourney", "ChatGPT"],
        warning: "Kişisel görüntü açık modele gitmez. Stok veya kendi ürünün.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "Bir görsel istemini anatomiye çevir",
        subhead: "Kütüphaneye kaydetmeden önce kalkanı yaz.",
        bullets: ["Sahne.", "Negatif.", "Oran."],
        tools: ["ChatGPT", "Midjourney"],
        keys: [
          { n: "01", title: "Anatomi", body: "Işık lens zemin." },
          { n: "02", title: "Negatif", body: "Yüz tescil yazı." },
          { n: "03", title: "Teslim", body: "Oran ve adet." },
        ],
        fieldTask: "Tek ürün için tam anatomili görsel prompt yaz; negatif listesini ekle.",
      },
    ],
  },
  "05_prompt_practice-6": {
    ...PROMPT,
    title: "Kendi Prompt Kütüphaneni Oluşturmak ve Modül Kapanışı",
    cues: [
      {
        cueIndex: 1,
        section: "Isınma & İş Problemi",
        layout: "problem",
        headline: "Sohbet geçmişi kütüphane değildir",
        subhead: "Kaybolan sihirli istem yarın yok. Kart sistemi var.",
        bullets: [
          "Her kart: isim, iş, beş taş, kalkan, örnek çıktı.",
          "Ofis, vitrin, sosyal, bot — aynı dil.",
          "Versiyon: v1, ne değişti, tarih.",
        ],
        tools: ["ChatGPT", "Notion", "Docs"],
        stats: [
          { label: "Kart", value: "SSOT" },
          { label: "Sohbet", value: "geçici" },
          { label: "Kalkan", value: "her kartta" },
          { label: "Mezuniyet", value: "Katman 1" },
        ],
      },
      {
        cueIndex: 2,
        section: "Temel Yöntem",
        layout: "prompt",
        headline: "Kütüphane iskeleti",
        subhead: "Klasör: Mail, Excel, Vitrin, Kanca, Bot, Karar.",
        bullets: [
          "Kart başlığı fiille başlasın: ‘Özetle’, ‘Süz’, ‘Kanca yaz’.",
          "Değişken: [ÜRÜN], [ALICI], [TARİH].",
          "Test notu: son doğrulanan çıktı tarihi.",
        ],
        tools: ["Docs", "ChatGPT", "Claude"],
        nodes: [
          { title: "Mail", sub: "3 ton" },
          { title: "Excel", sub: "niyet→formül" },
          { title: "Vitrin", sub: "SEO paket" },
          { title: "Bot", sub: "niyet+fallback" },
          { title: "Görsel", sub: "anatomi" },
        ],
      },
      {
        cueIndex: 3,
        section: "İstisna & Kritik Durum",
        layout: "shield",
        headline: "Kütüphaneye sır koyma",
        subhead: "Paylaşılan kart maskeli şablon olur.",
        bullets: [
          "API anahtarı kartta yok.",
          "Eski kartı silme; v2 aç, v1 arşiv.",
          "Çalışmayan kartı yıldızlama.",
        ],
        tools: ["Docs", "ChatGPT"],
        warning: "Kütüphane şirket malıdır. Açık sohbete yapıştırarak sızdırma.",
      },
      {
        cueIndex: 4,
        section: "Özet & Saha Görevi",
        layout: "keys",
        headline: "İlk beş kartı yaz",
        subhead: "Katman 1 kapanır. Dil cebinde kalır.",
        bullets: ["Kart.", "Değişken.", "Kalkan."],
        tools: ["ChatGPT", "Claude", "Perplexity"],
        keys: [
          { n: "01", title: "SSOT", body: "Sohbet değil kart." },
          { n: "02", title: "Taş", body: "Her kartta beş." },
          { n: "03", title: "Orkestra", body: "Sen şefsin, model çalar." },
        ],
        fieldTask: "Mail, Excel, vitrin, kanca, karar için birer kart iskeleti kaydet.",
      },
    ],
  },
};

function asSlide(
  lessonKey: AcademyCinemaCueSlideLessonKey,
  draft: LessonDraft,
  cue: OverlayDraft,
): AcademyCinemaCueSlide {
  return {
    lessonKey,
    theme: draft.theme,
    courseLabel: draft.courseLabel,
    lessonTitle: draft.title,
    instructor: draft.instructor,
    ...cue,
  };
}

export function loadAcademyCinemaCueSlides(lessonKey: string): readonly AcademyCinemaCueSlide[] {
  const key = lessonKey.trim() as AcademyCinemaCueSlideLessonKey;
  const draft = LESSONS[key];
  if (!draft) {
    return [];
  }
  return draft.cues.map((cue) => asSlide(key, draft, cue));
}

export function listAcademyCinemaCueSlides(): readonly AcademyCinemaCueSlide[] {
  return ACADEMY_CINEMA_CUE_SLIDE_LESSON_KEYS.flatMap((lessonKey) => loadAcademyCinemaCueSlides(lessonKey));
}

export function academyCinemaCueSlideFileName(slide: Pick<AcademyCinemaCueSlide, "lessonKey" | "cueIndex">): string {
  return `${slide.lessonKey}-cue-${slide.cueIndex}.jpg`;
}

export function academyCinemaCueSlidePublicPathFromSlide(
  slide: Pick<AcademyCinemaCueSlide, "lessonKey" | "cueIndex">,
): string {
  return `/academy/cinema/${academyCinemaCueSlideFileName(slide)}`;
}
