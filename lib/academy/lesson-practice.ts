/**
 * Ders pratikleri — müfredat laboratuvarı.
 * Compact SKU’da Tam Ders Metni’ne basılır; hop compact-read kalır.
 * Kernel / hop sicili / cüzdan / Dron şeması bu haritadan türemez.
 */

import { ACADEMY_GMAIL_GEMINI_PROMPT } from "@/lib/academy/gmail-workspace";
import type { AcademyLessonPractice } from "@/lib/academy/lesson-body";

function officePractice(
  params: AcademyLessonPractice["params"],
  steps: AcademyLessonPractice["steps"],
  source: string,
): AcademyLessonPractice {
  return {
    params,
    steps,
    code: { language: "text", source },
  };
}

export const LESSON_PRACTICE: Record<string, AcademyLessonPractice> = {
  "01_office_ai-1": officePractice(
    [
      { label: "Senin dosyan", value: "masandaki gerçek xlsx adı (örnek: Satis_Eylul.xlsx)" },
      { label: "A1 sütun adı", value: "ilk gerçek sütun (örnek: Sipariş No)" },
    ],
    [
      "A1 hücresine ilk sütun adını yaz; birleşik başlığı çöz.",
      "Boş satırları sil; tutar ve tarihi tek tipe çek.",
      "Copilot varsa şeritten okut; yoksa dosyayı ataşla. Orijinali silme.",
    ],
    `Rol: Ofis asistanı.
Görev: Yüklediğim Excel tablosunu A1 eşiğinden düzenli tabloya çevir.
Format: Birleşik hücreleri ayır, boş satırları sil, tutarı sayı, tarihi gün-ay-yıl yap.
Kısıt: Uydurma sütun ekleme. Orijinal sayfayı silme; temiz kopyayı yan sayfada bırak.`,
  ),
  "01_office_ai-k1": officePractice(
    [
      { label: "Senin listen", value: "masandaki gerçek müşteri veya maaş dosyası adı" },
      { label: "Maske haritası", value: "ad → baş harf; telefon → kırp; IBAN → son dört" },
    ],
    [
      "Ham dosyayı sohbete yükleme. Ad, telefon, IBAN varsa dur.",
      "Maske haritasını uygula: baş harf, kırpılmış telefon, son dört hane.",
      "3. Kapıya yalnız maskeli üç satırlık soru yaz; ham kopyala-yapıştır atlanmış kapıdır.",
    ],
    `Rol: KVKK bekçisi.
Görev: Bu üç satır maskelidir. Ad yok, telefon yok, IBAN yok.
Format: Sütun adları Ürün, Adet, Bölge. Bölge bazında üç maddelik özet iste.
Kısıt: Kişi adı, açık IBAN, maaş veya T.C. kimlik üretme. Silmek yüklemeyi geri almaz.`,
  ),
  "01_office_ai-2": officePractice(
    [
      { label: "Senin tablon", value: "maskeli gerçek xlsx adı (örnek: Bolge_Satis.xlsx)" },
      { label: "Alıcı rolü", value: "üst yönetici / karar notu isteyen kişi" },
    ],
    [
      "Maskeli tabloyu Copilot veya ataşla ver; üç maddelik yönetici özeti iste.",
      "Karar notunu ayrı tut: ne oldu değil, ne yapılacak.",
      "Sayıyı kaynak hücreyle kilitle. İnsan onayı olmadan iletme.",
    ],
    `Rol: Üst düzey strateji danışmanı.
Görev: Tablodan tam üç maddelik yönetici özeti ve tek eylem cümlesi çıkar.
Format: 1) hacim ve yön 2) anomali 3) risk. En alta tek karar notu.
Kısıt: Uydurma yüzde yok. On sayfalık döküm yok. Grafik vaadi yok.`,
  ),
  "01_office_ai-3": officePractice(
    [
      { label: "Kaynak metin", value: "3. dersteki üç madde + eylem cümlesi (kendi özetin)" },
      { label: "Hedef slayt", value: "kendi pptx adın (örnek: Yonetim_Ozeti.pptx)" },
    ],
    [
      "Slayt başına tek fikir yaz; başlık iddia olsun, dolgu olmasın.",
      "Hiyerarşiyi kilitle: başlık, bir görsel yön, konuşmacı notu.",
      "Taslağı Copilot veya pptx ataşla aktar; şirket temasını sen kilitle.",
    ],
    `Rol: Sunum mimarı.
Görev: Bu üç maddeyi slayt iskeletine çevir.
Format: Slayt başına tek fikir. Konuşmacı notu slayt gövdesinden ayrı.
Kısıt: Taslağı aktar, temayı sen kilitle. Uydurma sayı ve dolgu madde yok.`,
  ),
  "01_office_ai-5": officePractice(
    [
      { label: "Şüpheli hücre", value: "kendi tablondaki hücre adresi (örnek: E14)" },
      { label: "Kaynak sütun", value: "TOPLA veya tablo motorunun baktığı sütun adı" },
    ],
    [
      "Şüpheli hücrede F2’ye bas; formül mü, düz metin mi bak.",
      "Aynı toplamı Excel TOPLA veya tablo motoruyla çapraz sor.",
      "Sapma varsa hücreyi kırmızı kilitle; modele ‘kendini denetle’ yetmez.",
    ],
    `Rol: Hata avcısı.
Görev: Bu sayı nereden geliyor? Kaynak hücreyi ve TOPLA sonucunu yaz.
Format: Hücre | formül veya değer | Excel TOPLA sonucu | sapma var/yok.
Kısıt: Modele hesaplattırma. Dil modeli matematiksel işlemci değildir.`,
  ),
  "01_office_ai-4": officePractice(
    [
      { label: "Kutu kaynağı", value: "kendi gelen kutun (Outlook veya dışa aktarılmış eml)" },
      { label: "Seçilen ileti", value: "en az beş gerçek ileti; konu satırlarını yaz" },
    ],
    [
      "Beş iletiyi etiketle: acil, aksiyon, arşivlik.",
      "İki taslak yanıt yaz; gönderme. İnsan onayı sende.",
      "İşi biteni arşive al. Çıktı aksiyon listesidir: kim, ne, ne zaman.",
    ],
    `Rol: Gelen kutusu kâtibi.
Görev: Bu beş iletiyi Acil / Aksiyon / Arşivlik diye etiketle.
Format: Gönderen | İş | Son tarih | Taslak yanıt notu. Gönderme.
Kısıt: Taslağı onaylamadan iletme. Yerleşik paneli bu derste ezberleme.`,
  ),
  "01_office_ai-g1": officePractice(
    [
      { label: "Pencere", value: "kendi Gmail’in; son 24 saat" },
      { label: "Yerleşik araç", value: "Gemini paneli (1. Kapı)" },
    ],
    [
      "Gmail’de Gemini panelini aç. Taşıma su (Ctrl+C / ekran görüntüsü) atlanmış kapıdır.",
      "Son 24 saati tablo iste: Gönderen | İş | Son tarih | Taslak yanıt notu.",
      "Hiçbir taslağı gönderme. Rutin dekont ve bülteni Arşivlik yaz.",
    ],
    `İstem:\n${ACADEMY_GMAIL_GEMINI_PROMPT}`,
  ),
  "01_office_ai-w1": officePractice(
    [
      { label: "Senin dosyan", value: "kendi docx adın (sözleşme, dilekçe veya rapor)" },
      { label: "İş türü", value: "üç işten biri: sözleşme / dilekçe / rapor — ayrı istem" },
    ],
    [
      "Dosyayı ataşla yükle. Sayfa sayfa kopyalama zahmetli yoldur.",
      "Üç işi ayrı istemle sor: sözleşme, dilekçe, rapor. Tek istemde karıştırma.",
      "Unvan, tarih, sayı ve imza sende kalır. Kanun maddesi uydurulursa sil.",
    ],
    `Rol: Uzun doküman okuyucusu.
Görev: Yüklediğim .docx dosyasını baştan sona incele.
Format: Sözleşmede cezai şart, fesih, gizlilik — sayfa numarası yaz. Dilekçede hitap, gerekçe, talep. Raporda başlık, üç madde, sonraki adım.
Kısıt: Uydurma madde ekleme. İmza, unvan ve tarih insanda. Üç iş, üç ayrı istem.`,
  ),
  "01_office_ai-6": officePractice(
    [
      { label: "Takvim bloğu", value: "bu Cuma 30 dakika (10 Excel + 10 slayt + 10 kutu)" },
      { label: "Haftalık dosyalar", value: "bir gerçek xlsx + bir pptx veya özet + kutu" },
    ],
    [
      "Cuma 30’u takvime yaz: 10 Excel, 10 slayt, 10 kutu.",
      "Gerçek tabloyu Copilot veya ataşla; slayt taslağını üç maddeyle çıkar.",
      "Kutudaki işi aynı pencerede kapat. Kişisel veri varsa maskeli yedek al.",
    ],
    `Rol: Haftalık sistem kâtibi.
Görev: Cuma 30 komutunu üç bloğa böl.
Format: 10 dakika Excel (A1 + temiz kopya) | 10 dakika slayt (üç madde + eylem) | 10 dakika kutu (etiket, taslak, arşiv).
Kısıt: Ham kopyala-yapıştır varsayılan yol değildir. 1. ve 2. kapı durmuyorsa maskeli kısa özet.`,
  ),
};
