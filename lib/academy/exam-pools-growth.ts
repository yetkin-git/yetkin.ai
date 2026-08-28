import type { AcademyExamQuestion } from "@/lib/academy/types";

function mcq(
  id: string,
  prompt: string,
  choices: readonly [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
): AcademyExamQuestion {
  return { id, prompt, choices: [...choices], correctIndex };
}

export const FULLSTACK_TEMEL_QUESTIONS: AcademyExamQuestion[] = [
  mcq("q_fs_1", "HTTP durum kodu ne işe yarar?", ["Süs", "Fişteki mühür; istek-yanıt dürüstlüğü", "CSS sınıfı", "DNS"], 1),
  mcq("q_fs_2", "res.ok false iken yeşil tik?", ["Doğru", "Yalan; hata yansıtılır", "Zorunlu", "Yalnız GET"], 1),
  mcq("q_fs_3", "TypeScript as any ne yapar?", ["Mühürler", "Hatayı erteler; kapı açmaz", "Hızlandırır", "Zod yerine geçer"], 1),
  mcq("q_fs_4", "Çelişen isLoading ve isSuccess?", ["SSOT", "Yasak birleşim; tek faz gerekir", "Normal React", "Context zorunlu"], 1),
  mcq("q_fs_5", "props.title çocuktan mutasyon?", ["Evet", "Hayır; tek yönlü veri", "Redux zorunlu", "CSS"], 1),
  mcq("q_fs_6", "Zod safeParse başarısızken?", ["200", "400 + issues", "500 ok:true", "Yoksay"], 1),
  mcq("q_fs_7", "PostgreSQL $1 nedir?", ["Yorum", "Parametre yer tutucusu", "Tablo adı", "JWT"], 1),
  mcq("q_fs_8", "Birleştirmeli SQL riski?", ["Hız", "Enjeksiyon kapısı", "Daha okunur", "Zod"], 1),
  mcq("q_fs_9", "Next.js App Router sayfası nerede durur?", ["public/", "app/.../page.tsx", "node_modules", "Dockerfile"], 1),
  mcq("q_fs_10", "Boş sepet ödeme başarılı iskeleti?", ["Doğru UX", "Adres yalanı; reddedilir", "SEO", "Zod"], 1),
  mcq("q_fs_11", "Express sıra hangisi?", ["handler → json", "json → validate → handler", "SQL → json", "CSS → handler"], 1),
  mcq("q_fs_12", "fetch ağı kuruldu diye iş bitti mi?", ["Evet", "Hayır; res.ok ve gövde okunur", "Evet GET’te", "Yalnız 201"], 1),
  mcq("q_fs_13", "Number(\"\") tuzağı nedir?", ["NaN her zaman", "0 olabilir; boş adet geçerli değildir", "Hata zorunlu", "Infinity"], 1),
  mcq("q_fs_14", "disabled loading iken?", ["İkinci Post atılır", "Çift tıklama yutulur", "Zod açılır", "SQL bağlanır"], 1),
  mcq("q_fs_15", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_fs_16", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet hash", "Yalnız vize"], 1),
  mcq("q_fs_17", "TestClient neyi kanıtlar?", ["Benim makinemde geçti", "Sözleşmenin her sabah aynı kartla koşması", "Figma", "SEO"], 1),
  mcq("q_fs_18", "5xx gövdede ok:true?", ["Dürüst", "Yalan; reddedilir", "Zod", "JWT"], 1),
  mcq("q_fs_19", "Bu eğitim kaç bölüm?", ["6", "12", "3", "24"], 1),
  mcq("q_fs_20", "CareerVisaStamp ne zaman?", ["Satın alınca", "Sınav barajı üstünde", "İlk derste", "Docker’da"], 1),
];

export const AI_TEMEL_QUESTIONS: AcademyExamQuestion[] = [
  mcq("q_ai_1", "Bağlam penceresi dolunca sessiz özet?", ["Doğru", "Uydurma; iş bölünür veya bellek yazılır", "Zorunlu", "Hızlıdır"], 1),
  mcq("q_ai_2", "«JSON gibi yaz» şema mıdır?", ["Evet", "Hayır; şema ve parse kapısı gerekir", "Zod’suz yeter", "CSS"], 1),
  mcq("q_ai_3", "Sır tarife girince?", ["Orta değer uydurulur", "Üretim kapanır", "Log’a yazılır", "Few-shot artar"], 1),
  mcq("q_ai_4", "Few-shot örnekleri her istekte değişirse?", ["İyidir", "Regresyon; örnek sabit kalır", "Daha yaratıcı", "JSON zorunlu"], 1),
  mcq("q_ai_5", "Getirici boşken model ne yapar?", ["Wikipedia basar", "Dürüst «belgede yok»; üretim durur", "Uydurur", "PII ekler"], 1),
  mcq("q_ai_6", "Paydasız yüzde?", ["Kanıt", "Yalan; payda yazılı olmadan basılmaz", "RAG", "Token"], 1),
  mcq("q_ai_7", "Boş tutarı 0 yapmak?", ["Temizlik", "Cehaleti gizler; eksik ayrı durur", "int64", "SQL"], 1),
  mcq("q_ai_8", "Eşik altı skorla iddia?", ["OK", "Kapalı; alıntı yoksa cümle yok", "Few-shot", "JSON"], 1),
  mcq("q_ai_9", "Tarif katmanları hangileri?", ["Yalnız kullanıcı", "sistem / kullanıcı / biçim", "Yalnız JSON", "Yalnız RAG"], 1),
  mcq("q_ai_10", "Tablo yokken ortalama istemek?", ["Veri bilimi", "Boş tezgâh; üretim durur", "Pandas zorunlu", "Prompt yeter"], 1),
  mcq("q_ai_11", "n=8 yüzde yetmiş?", ["Referandum", "Vitrin mankeni; n dipnot ister", "RAG", "JWT"], 1),
  mcq("q_ai_12", "PDF yüklemek okumak mıdır?", ["Evet", "Hayır; getiri ve alıntı okumaktır", "Evet OCR", "Token"], 1),
  mcq("q_ai_13", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_ai_14", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet hash", "Yalnız vize"], 1),
  mcq("q_ai_15", "PII log’a girer mi?", ["Evet hata ayıklama", "Hayır", "JSON modunda evet", "RAG’te evet"], 1),
  mcq("q_ai_16", "Parse hatasında çökmek?", ["Nezaket", "Hayır; yeniden sorulur", "Zorunlu", "Fail-open"], 1),
  mcq("q_ai_17", "Bu eğitim kaç bölüm?", ["6", "12", "3", "8"], 1),
  mcq("q_ai_18", "CareerVisaStamp ne zaman?", ["Satın alınca", "Sınav barajı üstünde", "İlk prompt’ta", "PDF’te"], 1),
  mcq("q_ai_19", "3D pasta kanıt mıdır?", ["Evet", "Hayır; süs grafiği reddedilir", "n büyükse evet", "RAG"], 1),
  mcq("q_ai_20", "Kaynak satırı olmayan RAG cevabı?", ["Teslim", "Teslim değil", "Few-shot yeter", "JSON yeter"], 1),
];

export const UX_TEMEL_QUESTIONS: AcademyExamQuestion[] = [
  mcq("q_ux_1", "UX ile UI farkı nedir?", ["Aynıdır", "UX yol/acı, UI yüz/piksel", "UI araştırma", "UX yalnız renk"], 1),
  mcq("q_ux_2", "Beğeni kabul ölçütü müdür?", ["Evet", "Hayır; görev tamamlanır", "Figma’da evet", "WCAG"], 1),
  mcq("q_ux_3", "Yönlendirici araştırma sorusu?", ["İyidir", "«güzel değil mi» tuzağı; reddedilir", "Kart sıralama", "Jeton"], 1),
  mcq("q_ux_4", "Stok fotoğraf persona?", ["Kanıt", "Masal; acı ve iş yazılı durur", "Yolculuk", "IA"], 1),
  mcq("q_ux_5", "Organigram menü?", ["IA", "Jargon; kullanıcı dili etiket olur", "WCAG", "Token"], 1),
  mcq("q_ux_6", "Tel çerçevede palet?", ["Erken sadakat", "Yasak; tartışma süse kaymasın", "Token", "Handoff"], 1),
  mcq("q_ux_7", "Kopyala-yapıştır düğme?", ["Component", "Borç; ana bileşen güncellenmez", "Auto layout", "8px"], 1),
  mcq("q_ux_8", "Üç birincil düğme?", ["Hiyerarşi", "Odak kırılır; birincil tek durur", "WCAG", "Persona"], 1),
  mcq("q_ux_9", "Serbest hex her ekranda?", ["Token", "Sistem ölür; jeton adı gerekir", "Prototype", "IA"], 1),
  mcq("q_ux_10", "Statik slayt akış mıdır?", ["Evet", "Hayır; tıklanır prototip görev test eder", "Figma link yeter", "WCAG"], 1),
  mcq("q_ux_11", "İkon-only düğme?", ["Şık", "Etiket yoksa kör kapı", "Token", "8px"], 1),
  mcq("q_ux_12", "«Figma’da var bakarsınız» teslim mi?", ["Evet", "Hayır; ölçü ve durum notu gerekir", "Prototype yeter", "IA yeter"], 1),
  mcq("q_ux_13", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_ux_14", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet hash", "Yalnız vize"], 1),
  mcq("q_ux_15", "8px ızgara ne işe yarar?", ["Renk", "Ritim; rastgele boşluk atölyeyi bozar", "SQL", "JWT"], 1),
  mcq("q_ux_16", "Bu eğitim kaç bölüm?", ["7", "12", "3", "6"], 1),
  mcq("q_ux_17", "CareerVisaStamp ne zaman?", ["Satın alınca", "Sınav barajı üstünde", "İlk Figma’da", "Beğenide"], 1),
  mcq("q_ux_18", "Görüşmesiz Figma?", ["Hızlı", "Tahmin; defter önce gelir", "Token", "WCAG"], 1),
  mcq("q_ux_19", "Kontrast eşiği süs müdür?", ["Evet silinir", "Hayır; erişim barajıdır", "Yalnız dark mode", "IA"], 1),
  mcq("q_ux_20", "Masterclass kapanış paketi?", ["Yalnız palet", "Kanıt, iskelet, kalıp, baraj, tutanak", "Yalnız hex", "Yalnız slayt"], 1),
];
