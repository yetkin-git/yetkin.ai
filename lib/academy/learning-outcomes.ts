/**
 * Antre öğrenim çıktıları — vitrin kartı değil, kurs sayfası (2 nolu) sicili.
 * Client-safe: sınav şıkkı yok.
 */

import type { AcademyCourseTitleSlug } from "@/lib/academy/course-titles";

export const ACADEMY_LEARNING_OUTCOMES: Record<AcademyCourseTitleSlug, readonly string[]> = {
  "python-temel": [
    "Değişken, tip, kontrol akışı ve fonksiyonu dürüst isimlerle yazarsın.",
    "Listeler, sözlükler ve dosya giriş-çıkışıyla küçük veri işini bitirirsin.",
    "Girdi doğrular, hata yakalar, tekrarlayan işi döngü ve fonksiyona indigersin.",
    "Pandas tablo sözleşmesi ve parametreli Yapılandırılmış Sorgu Dili köprüsünü okursun.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "fullstack-temel": [
    "İstemci-sunucu ve Hipermetin Aktarım Protokolü durum kodunu dürüst okursun.",
    "TypeScript sözleşmesi, Belge Nesne Modeli ve fetch hata yansımasını kurarsın.",
    "React bileşen, durum makinesi ve Next.js sayfa yönlendirmesini bağlarsın.",
    "Node.js / Express kapısında şema doğrulama ve parametreli sorgu yazarsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "ai-temel": [
    "Token, bağlam penceresi ve üretim tarifi katmanlarını ayırırsın.",
    "Yapılandırılmış çıktı, few-shot ve sır/kişisel veri yasağını uygularsın.",
    "Tablo okur, temizler, metrik paydasını yazmadan yüzde basmazsın.",
    "Kaynaklı getiri (RAG) ile uydurmayı keser, kanıt satırı istersin.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
  "ux-temel": [
    "Kullanıcı Deneyimi ile Kullanıcı Arayüzü sınırını çizersin.",
    "Araştırma, persona, yolculuk ve bilgi mimarisini kanıtla kurarsın.",
    "Tel çerçeve ve Figma’da çerçeve, otomatik yerleşim, bileşen kullanırsın.",
    "İzgara, tipo, jeton, prototip ve erişilebilirlik barajını teslim paketine bağlarsın.",
    "Sınav barajı (≥70) üstünde SHA-256 mühür ve kariyer vizesi damgası alırsın.",
  ],
};

export function academyLearningOutcomesForSlug(slug: string): readonly string[] {
  return ACADEMY_LEARNING_OUTCOMES[slug as AcademyCourseTitleSlug] ?? [];
}
