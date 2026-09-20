import { describe, expect, it } from "vitest";
import { curriculumLessonKeysForSlug } from "@/lib/academy/curricula/lesson-index";
import {
  OFFICE_AI_EXIT_KIT_SLUG,
  OFFICE_AI_FRIDAY_30_ITEMS,
  OFFICE_AI_KVKK_MASK_TEMPLATE,
  officeAiExitPromptCards,
  renderOfficeAiExitKitMarkdown,
} from "@/lib/academy/exit-kit";

describe("01_office_ai çıkış paketi", () => {
  it("9 ders kartı, Cuma 30 listesi ve KVKK şablonu basar", () => {
    const keys = curriculumLessonKeysForSlug(OFFICE_AI_EXIT_KIT_SLUG);
    expect(keys).toHaveLength(9);
    const cards = officeAiExitPromptCards();
    expect(cards).toHaveLength(9);
    expect(cards.map((card) => card.lessonKey)).toEqual([...keys]);
    expect(cards.every((card) => card.prompt.trim().length > 20)).toBe(true);
    const lessonThree = cards.find((card) => card.lessonKey === "01_office_ai-2");
    expect(lessonThree?.prompt).toBe(
      "Bu temiz tablodan toplamı ve yönü çıkar. Tam üç maddelik yönetim özetini ve tek karar cümlesini yaz. Sayıları tablodaki hücrelerden al. Uydurma yüzde ekleme.",
    );
    expect(lessonThree?.prompt).not.toMatch(/Rol:|Grafik vaadi|yönetici özeti/u);
    const lessonFour = cards.find((card) => card.lessonKey === "01_office_ai-3");
    expect(lessonFour?.prompt).toBe(
      "Bu üç maddeyi slayt başına tek fikirle taslağa çevir. Her slayt için başlığı, tek cümlelik mesajı ve parantez içinde görsel yönlendirmeyi yaz. Konuşmacı notunu slayt gövdesinden ayrı tut. Uydurma sayı ekleme.",
    );
    expect(lessonFour?.prompt).not.toMatch(/Rol:|Copilot varsa şeride yaz|iskelet|Sunum mimarı/u);
    const lessonFive = cards.find((card) => card.lessonKey === "01_office_ai-5");
    expect(lessonFive?.prompt).toBe(
      "Tablodaki satır toplamları ile genel toplam arasında çelişki olup olmadığını incele. Uyumsuz her satırı kırmızı ile işaretle ve nedenini yaz. Toplamı TOPLA formülüyle doğrula.",
    );
    expect(lessonFive?.prompt).not.toMatch(/Rol:|Hata avcısı|Hata dedektifi/u);
    const lessonEmail = cards.find((card) => card.lessonKey === "01_office_ai-4");
    expect(lessonEmail?.prompt).toBe(
      "Gelen kutumdaki okunmamış iletileri tara. Bugün ödeme veya imza bekleyenleri Acil, bu hafta cevap bekleyenleri Aksiyon, dekont ve bültenleri Arşivlik diye etiketle. Aksiyon için taslak yanıt notu yaz. Hiçbir iletiyi gönderme, hiçbirini silme.",
    );
    expect(lessonEmail?.prompt).not.toMatch(/Rol:|Gelen kutusu kâtibi/u);
    const lessonGmail = cards.find((card) => card.lessonKey === "01_office_ai-g1");
    expect(lessonGmail?.prompt).toBe(
      "Gelen kutumdaki son 24 saat içinde gelen e-postaları tara. Ödeme, onay veya acil aksiyon bekleyenleri tablo yap: Gönderen | İş | Son tarih | Taslak yanıt notu. Rutin dekont ve bültenleri Arşivlik yaz. Hiçbir taslağı gönderme.",
    );
    expect(lessonGmail?.prompt).not.toMatch(/@Gmail|Rol:|süzgeci/u);
    const lessonWord = cards.find((card) => card.lessonKey === "01_office_ai-w1");
    expect(lessonWord?.prompt).toBe(
      "Yüklediğim sözleşme dosyasını (Word belgesi) baştan sona incele. Şirketimiz aleyhine olabilecek cezai şart maddelerini, fesih koşullarını ve gizlilik yükümlülüklerini liste halinde özetle. Sayfa numarası yaz. Uydurma madde ekleme.",
    );
    expect(lessonWord?.prompt).not.toMatch(/Rol:|Belge kâtibi|Dilekçe istemi/u);
    const lessonFriday = cards.find((card) => card.lessonKey === "01_office_ai-6");
    expect(lessonFriday?.prompt).toMatch(/karar cümlesi/u);
    expect(lessonFriday?.prompt).toMatch(/ataş ile yükle/u);
    expect(lessonFriday?.prompt).toMatch(/şeritten okut/u);
    expect(lessonFriday?.prompt).toMatch(/Üçüncü on dakika kutu/u);
    expect(lessonFriday?.prompt).not.toMatch(/eylem cümlesi|düğmeden|dosya olarak ver/u);
    expect(OFFICE_AI_FRIDAY_30_ITEMS.find((item) => item.id === "excel")?.hint).toMatch(
      /Excel tablosunu ataş ile yükle/u,
    );
    expect(OFFICE_AI_FRIDAY_30_ITEMS.find((item) => item.id === "slides")?.hint).toMatch(
      /sunusunu ataş ile yükle/u,
    );
    expect(OFFICE_AI_FRIDAY_30_ITEMS.map((item) => item.id)).toEqual([
      "calendar",
      "excel",
      "slides",
      "inbox",
      "mask",
    ]);
    expect(OFFICE_AI_KVKK_MASK_TEMPLATE).toMatch(/MASKELİ_IBAN/u);
    expect(OFFICE_AI_KVKK_MASK_TEMPLATE).toMatch(/üç satır maskelidir/iu);
    const markdown = renderOfficeAiExitKitMarkdown();
    expect(markdown).toMatch(/Cuma 30/u);
    expect(markdown).toMatch(/istem kartları/iu);
    expect(markdown).toMatch(/KVKK maskeleme/u);
    expect(markdown).toMatch(/Sınav şimdi açıldı\. Baraj 70 puandır\. Satın alma o kartı basmaz\./u);
    expect(markdown).not.toMatch(/Satın alma belge basmaz/u);
    expect(markdown).not.toMatch(/Sınav kapısı 9\. ders bitince açılır/u);
  });
});
