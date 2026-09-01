/**
 * Büyüme SKU laboratuvarları — AI Temel / UX.
 * Full-Stack Temel pratikleri `lesson-practice-fullstack.ts` içindedir.
 * Python Temel pratikleri `lesson-practice-python.ts` içindedir.
 */

import type { AcademyLessonPractice } from "@/lib/academy/lesson-body";

function pack(
  params: ReadonlyArray<readonly [string, string]>,
  steps: readonly string[],
  language: string,
  source: string,
): AcademyLessonPractice {
  return {
    params: params.map(([label, value]) => ({ label, value })),
    steps,
    code: { language, source: source.trim() },
  };
}

const AI_PRACTICE: Record<string, AcademyLessonPractice> = {
  "ai-temel-1": pack(
    [["token", "parça"], ["pencere", "tavan"], ["yasak", "sessiz özet"], ["iş", "böl veya yaz"]],
    ["Pencere dolunca ne yapılmayacağını yaz.", "İş bölme cümlesi ekle.", "Sessiz özeti reddet."],
    "txt",
    `tavan doldu → özet uydurma
tavan doldu → işi böl veya belleği dışarı yaz`,
  ),
  "ai-temel-2": pack(
    [["sistem", "yasa"], ["kullanıcı", "iş"], ["biçim", "kalıp"], ["yasak", "tek paragrafa yığmak"]],
    ["Üç katmanı ayrı satır yaz.", "Sır yasağını sisteme koy.", "İş cümlesini kullanıcıya koy."],
    "txt",
    `sistem: sır yapıştırma
kullanıcı: tabloyu özetle
biçim: üç madde + kaynak`,
  ),
  "ai-temel-3": pack(
    [["JSON", "şema"], ["parse", "kapı"], ["yasak", "JSON gibi yaz"], ["FAIL", "geçersiz ceyson"]],
    ["Şema satırı yaz.", "Parse başarısızken dur.", "«JSON gibi» cümlesini reddet."],
    "json",
    `{"ok": true, "items": []}`,
  ),
  "ai-temel-4": pack(
    [["örnek", "sabit"], ["kabul", "ölçü"], ["yasak", "değişen ilham"], ["beğeni", "tur değil"]],
    ["İki sabit örnek yaz.", "Kabul ölçütünü bir satırda yaz.", "Beğeniyi tur sayma."],
    "txt",
    `örnek1: {sku, qty}
örnek2: {sku, qty}
kabul: alanlar dolu, yasak yok`,
  ),
  "ai-temel-5": pack(
    [["sır", "anahtar/PII"], ["FAIL", "üretim yok"], ["yasak", "ortasını uydur"], ["log", "sır yok"]],
    ["Tarife anahtar yapıştırma kuralını yaz.", "Yasak iğnede dur.", "Log’a sır koyma."],
    "txt",
    `sır görünce üretim = kapalı
orta değer uydurma = yasak`,
  ),
  "ai-temel-6": pack(
    [["girdi", "doğrula"], ["parse", "try"], ["yeniden", "sor"], ["yasak", "çök"]],
    ["Geçersiz ceyson’da mesaj bas.", "Döngüyle yeniden sor.", "Boş girdide üretme."],
    "py",
    `import json
ham = input("ceyson: ")
try:
    json.loads(ham)
except json.JSONDecodeError:
    print("Lütfen şemaya uyan çıktı ver.")`,
  ),
  "ai-temel-7": pack(
    [["birim", "yazılı"], ["payda", "yazılı"], ["FAIL", "tablo yok"], ["yasak", "uydurma yüzde"]],
    ["Soru sözleşmesini üç satır yaz.", "Tablo yokken üretimi kes.", "Paydasız yüzde reddet."],
    "txt",
    `birim: kuruş
payda: tamamlanan sipariş
FAIL: tablo yok`,
  ),
  "ai-temel-8": pack(
    [["eksik", "cehalet"], ["sıfır", "iddiadır"], ["tip", "int64"], ["yasak", "fillna(0) kör"]],
    ["Boş tutarı 0 yapmama gerekçesi yaz.", "dtype kontrolü ekle.", "Tekrar satırı düş."],
    "py",
    `eksik = df["amount_kurus"].isna().sum()
assert df["amount_kurus"].dtype == "int64" or eksik > 0`,
  ),
  "ai-temel-9": pack(
    [["n", "dipnot"], ["payda", "yazılı"], ["3D pasta", "red"], ["yasak", "küçük n yüzde"]],
    ["n=8 yüzde yasağını yaz.", "Payda satırı ekle.", "Süs grafiği reddet."],
    "txt",
    `metrik: tamamlanma_orani
payda: assigned_count
n: dipnot`,
  ),
  "ai-temel-10": pack(
    [["getirici", "önce"], ["üretim", "sonra"], ["boş", "sus"], ["yasak", "genel bilgi doldur"]],
    ["Getirici boşken dur.", "Kaynak satırı iste.", "Wikipedia üslubunu reddet."],
    "txt",
    `retriever boş → "belgede yok"
kaynak yok → üretim yok`,
  ),
  "ai-temel-11": pack(
    [["eşik", "skor"], ["alıntı", "parça id"], ["FAIL", "eşik altı"], ["yasak", "benzer bir şey vardı"]],
    ["Eşik altı kuralını yaz.", "Alıntı kimliği ekle.", "Tahmini doldurmayı reddet."],
    "txt",
    `skor < eşik → belgede yok
alıntı yok → iddia yok`,
  ),
  "ai-temel-12": pack(
    [["PDF", "yükle"], ["RAG", "getir"], ["alıntı", "zorunlu"], ["PII", "tarife girmez"]],
    ["Dört kabul maddesini yaz.", "Kaynaksız özeti reddet.", "Sır yasağını tekrarla."],
    "txt",
    `şema + temizlik + getiri + alıntı
eksik halka → teslim yok`,
  ),
};

const UX_PRACTICE: Record<string, AcademyLessonPractice> = {
  "ux-temel-1": pack(
    [["UX", "yol/acı"], ["UI", "yüz"], ["yasak", "beğeniyi kabul saymak"], ["görev", "tamamlanır"]],
    ["Bir görev cümlesi yaz.", "Bir süs cümlesi yaz.", "Hangisinin UX olduğunu işaretle."],
    "txt",
    `görev: üç adımda ödemeyi bitir
süs: mor gölge hoş`,
  ),
  "ux-temel-2": pack(
    [["soru", "yönsüz"], ["görüşme", "dinle"], ["bulgu", "not"], ["yasak", "içerideki zevk"]],
    ["Yönlendirici olmayan bir soru yaz.", "«güzel değil mi» tuzağını reddet.", "Bir bulgu satırı ekle."],
    "txt",
    `soru: ödemeyi nerede aradın?
bulgu: fiyat menüde yok`,
  ),
  "ux-temel-3": pack(
    [["persona", "kanıtlı yüz"], ["yolculuk", "adımlar"], ["acı", "kırılan iş"], ["yasak", "stok fotoğraf masalı"]],
    ["Acı noktasını bir cümlede yaz.", "Yolculukta ödeme adımını atlama.", "Sahte yaşı sil."],
    "txt",
    `yüz: kasiyer, gece vardiyası
acı: ödeme üç dakikada bulunmuyor`,
  ),
  "ux-temel-4": pack(
    [["etiket", "kullanıcı dili"], ["grup", "raf"], ["kart", "sıralama"], ["yasak", "organigram menü"]],
    ["İnsan dilinde bir etiket yaz.", "Şirket jargonunu reddet.", "Bir grup adı ekle."],
    "txt",
    `etiket: Fiyat
yasak: Teklif yönetimi`,
  ),
  "ux-temel-5": pack(
    [["tel", "gri kutu"], ["öncelik", "birincil eylem"], ["yasak", "erken palet"], ["sadakat", "düşük"]],
    ["Birincil eylemi yaz.", "Rengi tel çerçeveden çıkar.", "Akış sorusunu not et."],
    "txt",
    `birincil: Satın Al
iskelet: gri kutu, palet yok`,
  ),
  "ux-temel-6": pack(
    [["frame", "sahne"], ["auto layout", "dizilim"], ["component", "kalıp"], ["yasak", "kopyala-yapıştır düğme"]],
    ["Üç Figma kuralı yaz.", "Ana bileşen güncellemesini not et.", "El ile piksel itmeyi reddet."],
    "txt",
    `frame + auto layout + component
kopyalanmış düğme = borç`,
  ),
  "ux-temel-7": pack(
    [["bulgu", "defter"], ["IA", "raf"], ["wire", "iskelet"], ["Figma", "kalıp"]],
    ["Dört halkayı sırayla yaz.", "Figma-only teslimi reddet.", "Bir işe bağla."],
    "txt",
    `bulgu → bilgi mimarisi → tel çerçeve → Figma
eksik halka → teslim yok`,
  ),
  "ux-temel-8": pack(
    [["odak", "tek birincil"], ["ızgara", "8px"], ["yasak", "her kutu bağırır"], ["ritim", "yazılı"]],
    ["Birincil / ikincil / üçüncül yaz.", "Üç birincil düğmeyi reddet.", "8px ritmini not et."],
    "txt",
    `birincil: Satın Al
ikincil: İncele
üçüncül: Paylaş`,
  ),
  "ux-temel-9": pack(
    [["renk", "token"], ["boşluk", "token"], ["tipo", "token"], ["yasak", "ekrana özel hex"]],
    ["Üç jeton adı yaz.", "Serbest hex’i reddet.", "Tema değişimini not et."],
    "txt",
    `color-text
space-4
font-lg`,
  ),
  "ux-temel-10": pack(
    [["prototype", "tıklanır"], ["görev", "ölçülür"], ["yasak", "statik slayt akış"], ["hata", "not"]],
    ["Üç ekranlı senaryo yaz.", "Bir görev ölçütü ekle.", "Slaytı akış sayma."],
    "txt",
    `görev: sepete ekle, öde
ölçüt: süre + hata sayısı`,
  ),
  "ux-temel-11": pack(
    [["kontrast", "eşik"], ["odak", "halka"], ["etiket", "ad"], ["yasak", "ikon-only"]],
    ["Üç kontrol maddesi yaz.", "Açık gri metni reddet.", "Odak halkasını silme."],
    "txt",
    `kontrast ≥ eşik
odak görünür
düğmenin adı var`,
  ),
  "ux-temel-12": pack(
    [["aralık", "yazılı"], ["tipo", "yazılı"], ["durum", "hover/disabled"], ["yasak", "link yeter"]],
    ["Üç satırlık el teslimi yaz.", "«Figma’da var» cümlesini reddet.", "Hover durumunu ekle."],
    "txt",
    `aralık: space-4
tipo: font-lg
durum: default / hover / disabled`,
  ),
};

export const ACADEMY_GROWTH_LESSON_PRACTICE: Record<string, AcademyLessonPractice> = {
  ...AI_PRACTICE,
  ...UX_PRACTICE,
};
