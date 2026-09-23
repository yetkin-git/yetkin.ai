/**
 * Ders pratikleri — müfredat laboratuvarı.
 * Compact SKU’da Tam Ders Metni’ne basılır; hop compact-read kalır.
 * Kernel / hop sicili / cüzdan / Dron şeması bu haritadan türemez.
 */

import {
  ACADEMY_OFFICE_AI_5_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_6_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_G1_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_W1_COPILOT_PROMPT,
  ACADEMY_OFFICE_AI_W1_DILEKCE_PROMPT,
  ACADEMY_OFFICE_AI_W1_RAPOR_PROMPT,
} from "@/lib/academy/lesson-beat-visual";
import { ACADEMY_KVKK_DELETE_BUTTON_SUMMARY } from "@/lib/academy/kvkk-workspace";
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
      { label: "Senin dosyan", value: "kendi temiz deneme tablon (müşteri adı ve IBAN içermez)" },
      { label: "A1 sütun adı", value: "ilk gerçek sütun (örnek: Sipariş No)" },
    ],
    [
      "A1 hücresine ilk sütun adını yaz; birleşik başlığı çöz.",
      "Boş satırları sil; tutar ve tarihi tek tipe çek.",
      "Copilot düğmesi varsa hücreleri doğrudan düzenler. Yoksa dosyayı ataşla yükle; yapay zekâ orijinali değiştirmez, temiz tabloyu kopyalayıp Excel'ine yapıştırırsın. Kişisel verileri maskeleme kuralı 2. derste.",
    ],
    `Rol: Ofis asistanı.
Görev: Yüklediğim Excel tablosunu A1 kuralıyla düzenli tabloya çevir.
Format: Birleşik hücreleri ayır, boş satırları sil, tutarı sayı, tarihi gün-ay-yıl yap.
Kısıt: Uydurma sütun ekleme. Orijinal sayfayı koru; temiz kopyayı yan sayfada bırak.`,
  ),
  "01_office_ai-k1": officePractice(
    [
      { label: "Senin listen", value: "masandaki gerçek müşteri veya maaş dosyası adı" },
      { label: "Maske haritası", value: "Ayşe Kaya → Müşteri A; telefon → MASKELİ_TELEFON; IBAN → MASKELİ_IBAN" },
    ],
    [
      `Ham dosyayı sohbet yapay zekâsının ekranına yükleme. ${ACADEMY_KVKK_DELETE_BUTTON_SUMMARY} Ad, telefon, IBAN, T.C. Kimlik No varsa dur.`,
      "Maske haritasını uygula: Ayşe Kaya yerine Müşteri A, telefon yerine MASKELİ_TELEFON, IBAN yerine MASKELİ_IBAN.",
      "3. Kapıya yalnız maskeli üç satırlık sorunu yaz; ham kopyala-yapıştır atlanmış kapıdır.",
    ],
    `Rol: Ofis asistanı.
Görev: Bu üç satır maskelidir. Ad yok, telefon yok. Sütun adları Ürün, Adet, Bölge. Bölge bazında üç maddelik özet iste.
Format: Üç maddelik özet. Kişi adı yok.
Kısıt: A1 kuralı düzgün olsa bile ham kimlik yazma. Kişi adı, açık IBAN, maaş veya T.C. Kimlik No üretme. Silmek yüklemeyi geri almaz.`,
  ),
  "01_office_ai-2": officePractice(
    [
      { label: "Senin tablon", value: "maskeli gerçek Excel tablosu adı (örnek: Bölge Satış Excel tablosu)" },
      { label: "Alıcı rolü", value: "üst yönetici / karar cümlesi isteyen kişi" },
    ],
    [
      "Saha sırası: maskeli tabloyu Copilot veya ataşla ver; üç maddelik yönetim özeti iste. Kişi adı, IBAN veya müşteri sırrı varsa önce maskele.",
      "Karar cümlesini ayrı tut: ne oldu değil, ne yapılacak.",
      "Sayıyı kaynak hücreyle kilitle. İnsan onayı olmadan iletme.",
    ],
    `Rol: Ofis asistanı.
Görev: Bu temiz tablodan toplamı ve yönü çıkar. Tam üç maddelik yönetim özetini ve tek karar cümlesini yaz. Sayıları tablodaki hücrelerden al. Uydurma yüzde ekleme.
Format: 1) hacim ve yön 2) sapan nokta 3) risk. En alta tek karar cümlesi.
Kısıt: Uydurma yüzde yok.`,
  ),
  "01_office_ai-3": officePractice(
    [
      { label: "Kaynak metin", value: "3. dersteki üç madde + karar cümlesi (kendi özetin)" },
      { label: "Hedef slayt", value: "kendi PowerPoint sunusu adın (örnek: Yönetim Özeti PowerPoint sunusu)" },
    ],
    [
      "Saha sırası: slayt başına tek fikir yaz; başlık iddia olsun, dolgu olmasın.",
      "Sırayı kilitle: başlık, görsel yön, konuşmacı notu.",
      "Taslağı Copilot veya PowerPoint sunusu olarak ataşla aktar; şirket temasını sen kilitle.",
    ],
    `Rol: Sunum tasarımcısı.
Görev: Bu üç maddeyi slayt başına tek fikirle taslağa çevir. Her slayt için başlığı, tek cümlelik mesajı ve parantez içinde görsel yönlendirmeyi yaz. Konuşmacı notunu slayt gövdesinden ayrı tut. Uydurma sayı ekleme.
Format: Slayt başına tek fikir. Konuşmacı notu slayt gövdesinden ayrı.
Kısıt: Taslağı aktar, temayı sen kilitle. Uydurma sayı ve dolgu madde yok.`,
  ),
  "01_office_ai-5": officePractice(
    [
      { label: "Şüpheli hücre", value: "kendi tablondaki hücre adresi (örnek: E14)" },
      { label: "Kaynak hücre", value: "TOPLA veya tablo motorunun baktığı hücre adı" },
    ],
    [
      "Saha sırası: şüpheli hücrede F2’ye bas; formül mü, düz metin mi bak. Kişi adı, IBAN veya şirket sırrı varsa önce maskele; ham tabloyu sohbete bırakma.",
      "Aynı toplamı Excel TOPLA veya tablo motoruyla çapraz sor.",
      "Sapma varsa hücreyi kırmızıyla işaretle, sonra kilitle; modele ‘kendini denetle’ yetmez.",
    ],
    `Rol: Sayı kontrolü.
Görev: ${ACADEMY_OFFICE_AI_5_COPILOT_PROMPT}
Format: Hücre | formül veya değer | Excel TOPLA sonucu | sapma var/yok.
Kısıt: Modele hesaplattırma. Dil modeli matematiksel işlemci değildir.`,
  ),
  "01_office_ai-g1": officePractice(
    [
      { label: "Pencere", value: "kendi Gmail’in; son 24 saat (en az üç gerçek ileti)" },
      { label: "Yerleşik araç", value: "Gemini paneli (1. Kapı); Outlook varsa Copilot şeridi" },
    ],
    [
      "Saha sırası: önce etiket (acil, aksiyon, arşivlik), taslak ve insan onayı; arşiv silmek değildir. Sonra Gemini paneli Gmail’in içindedir; iletiyi dışarı taşıma.",
      "Son 24 saati tablo iste: Gönderen | İş | Son tarih | Taslak yanıt notu. Ödeme, onay ve acil aksiyonu ayrı satıra al.",
      "Hiçbir taslağı gönderme. Rutin dekont ve bülteni Arşivlik yaz; taslak notunda tarihi kilitle.",
    ],
    `Rol: Gelen kutusu süzgeci (yerleşik panel).
İstem:
${ACADEMY_OFFICE_AI_G1_COPILOT_PROMPT}
Kısıt: Kutu dışına kopyalama. Taslak notu gönder tuşu değildir.`,
  ),
  "01_office_ai-w1": officePractice(
    [
      { label: "Senin dosyan", value: "kendi Word belgesi adın (sözleşme, dilekçe veya rapor; gerçek dosya)" },
      { label: "İş türü", value: "üç işten biri: sözleşme / dilekçe / rapor — ayrı istem, ayrı soru" },
    ],
    [
      "Saha sırası: Dosyayı doğrudan yükle; bütün hâliyle modele ver. Sayfa sayfa kopyalama tek tek kopyalamadır. Kişi adı, IBAN veya ticari sır varsa önce maskele; ham Word belgesini sohbete yükleme.",
      "Üç işi ayrı istemle sor: sözleşmede cezai şart + fesih + gizlilik (sayfa numarası iste), dilekçede hitap + gerekçe + talep, raporda başlık + üç madde + sonraki adım.",
      "Unvan, tarih, sayı ve imzayı sen yazarsın. Kanun maddesi uydurulursa sil; sayfa numarasız listeyi tekrar sor.",
    ],
    `Rol: Belge kâtibi.
Sözleşme istemi: ${ACADEMY_OFFICE_AI_W1_COPILOT_PROMPT}
Dilekçe istemi: ${ACADEMY_OFFICE_AI_W1_DILEKCE_PROMPT}
Rapor istemi: ${ACADEMY_OFFICE_AI_W1_RAPOR_PROMPT}
Kısıt: Uydurma madde ekleme. İmza, unvan ve tarih insanda. Üç iş, üç ayrı istem.`,
  ),
  "01_office_ai-6": officePractice(
    [
      { label: "Takvim bloğu", value: "bu Cuma 30 dakika (10 Excel + 10 slayt + 10 kutu; tekrar her hafta)" },
      { label: "Haftalık dosyalar", value: "bir gerçek Excel tablosu + bir PowerPoint sunusu veya özet + kendi kutun" },
    ],
    [
      "Saha sırası: Cuma 30’u takvime yaz: başlık Cuma 30, süre 30 dakika, tekrar her hafta. 10 Excel, 10 slayt, 10 kutu.",
      "Gerçek tabloyu Copilot veya ataş ile yükle (A1 + temiz kopya); slayt taslağını üç madde + karar cümlesiyle çıkar.",
      "Kutudaki işi aynı pencerede kapat: etiket, taslak, insan onayı, arşiv. Kişisel veri varsa önce maskele.",
    ],
    `Rol: Haftalık sistem kâtibi.
Görev: ${ACADEMY_OFFICE_AI_6_COPILOT_PROMPT}
Format: 10 dakika Excel (A1 + temiz kopya) | 10 dakika slayt (üç madde + karar) | 10 dakika kutu (etiket, taslak, onay, arşiv).
Kısıt: Ham kopyala-yapıştır varsayılan yol değildir. 1. ve 2. kapı durmuyorsa maskeli kısa özet.`,
  ),
};
