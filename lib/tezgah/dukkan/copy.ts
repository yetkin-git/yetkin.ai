/**
 * Sektörel vitrinin mühürlü iskeleti. Renk ve cümle kullanıcı metninden gelmez.
 * Klinik kopyası randevu, saat ve hizmet adıyla sınırlıdır.
 */

export const DUKKAN_FILENAME = "dijital-dukkan.html" as const;
export const DUKKAN_ZIP_FILENAME = "dijital-dukkan.zip" as const;
export const DUKKAN_PUBLISH_GUIDE_FILENAME = "YAYINLAMA_REHBERI.md" as const;

export const DUKKAN_CTA_LABEL = {
  siparis: "Sipariş ver",
  randevu: "Randevu",
  teklif: "Teklif al",
} as const;

export type DukkanCtaId = keyof typeof DUKKAN_CTA_LABEL;

/** Dürüst yapısal kontrol rozetleri — sahte hız/100 skoru yoktur. */
export const DUKKAN_STRUCTURAL_SEALS = [
  { id: "viewport", label: "Mobil Uyumlu (Viewport)" },
  { id: "xss", label: "Sıfır Script / XSS Korumalı" },
  { id: "conversion", label: "WhatsApp & Telefon Dönüşüm Hattı" },
  { id: "seo", label: "Semantik SEO Başlık Yapısı" },
] as const;

export type DukkanSealId = (typeof DUKKAN_STRUCTURAL_SEALS)[number]["id"];

export const DUKKAN_SECTORS = [
  {
    id: "eticaret",
    label: "E-Ticaret / Butik",
    title: "Butik ve e-ticaret vitrin sayfası",
    description: "Butik ve e-ticaret için vitrin listesi, sipariş notu ve iletişim kapısı bu sayfada durur.",
    lead: "Vitrin listesi ve sipariş kapısı bu sayfada durur.",
    heading: "Vitrin ve sipariş",
    body: "Listedeki hizmetler vitrinde durur. Sipariş WhatsApp ile tamamlanır.",
    hours: "Gündüz vitrin saati mahalleye göre yürür.",
    cta: "siparis",
  },
  {
    id: "klinik",
    label: "Klinik / Sağlık",
    title: "Klinik ve sağlık randevu sayfası",
    description: "Klinik ve sağlık için randevu saati ve hizmet adları bu sayfada durur.",
    lead: "Randevu ve çalışma saati bu sayfada durur.",
    heading: "Randevu ve saat",
    body: "Randevu saati WhatsApp ile netleşir. Aşağıdaki liste hizmet adıdır.",
    hours: "Saat, yazılan randevu notuna göre konuşulur.",
    cta: "randevu",
  },
  {
    id: "restoran",
    label: "Kafe / Restoran",
    title: "Mahalle restoranı ve kafe vitrini",
    description: "Mahalle restoranı ve kafe için menü, servis saati ve sipariş kapısı bu sayfada durur.",
    lead: "Menüden seçilen hizmetler ve sipariş kapısı bu sayfada.",
    heading: "Mutfak ve masa",
    body: "Seçilen hizmetler mutfakta hazırlanır. Sipariş WhatsApp ile alınır.",
    hours: "Öğle ve akşam servisi mahalle saatine göre yürür.",
    cta: "siparis",
  },
  {
    id: "hukuk",
    label: "Mali Müşavir / Hukuk",
    title: "Mali müşavir ve hukuk görüşme notu",
    description: "Mali müşavir ve hukuk için görüşme, dosya notu ve teklif kapısı bu sayfada durur.",
    lead: "Görüşme notu ve teklif kapısı bu sayfada durur.",
    heading: "Görüşme ve dosya",
    body: "Görüşme konusu listedeki hizmetlere göre yazılır. Teklif WhatsApp ile konuşulur.",
    hours: "Görüşme günü WhatsApp ile netleşir.",
    cta: "teklif",
  },
  {
    id: "insaat",
    label: "İnşaat / Mimarlık",
    title: "İnşaat ve mimarlık keşif sayfası",
    description: "İnşaat ve mimarlık için keşif, proje notu ve teklif kapısı bu sayfada durur.",
    lead: "Keşif notu ve teklif kapısı bu sayfada durur.",
    heading: "Keşif ve proje",
    body: "Yerinde keşif ve teklif, listedeki hizmetlere göre konuşulur.",
    hours: "Keşif günü WhatsApp ile ayarlanır.",
    cta: "teklif",
  },
  {
    id: "egitim",
    label: "Eğitim / Akademi",
    title: "Eğitim ve akademi kayıt vitrini",
    description: "Eğitim ve akademi için program listesi, kayıt notu ve iletişim kapısı bu sayfada durur.",
    lead: "Program listesi ve kayıt kapısı bu sayfada durur.",
    heading: "Program ve kayıt",
    body: "Kayıt ve program seçimi WhatsApp ile yazılır.",
    hours: "Ders saati kayıt mesajında netleşir.",
    cta: "randevu",
  },
  {
    id: "guzellik",
    label: "Güzellik / Bakım",
    title: "Güzellik ve bakım randevu vitrini",
    description: "Güzellik ve bakım için randevu, bakım listesi ve çalışma saati bu sayfada durur.",
    lead: "Bakım listesi ve randevu kapısı bu sayfada durur.",
    heading: "Randevu ve bakım",
    body: "Kesim ve bakım randevusu WhatsApp ile yazılır.",
    hours: "Saat, randevu mesajında netleşir.",
    cta: "randevu",
  },
  {
    id: "oto",
    label: "Oto Servis",
    title: "Oto servis randevu ve teklif notu",
    description: "Oto servis için randevu, bakım listesi ve teklif kapısı bu sayfada durur.",
    lead: "Bakım listesi ve randevu kapısı bu sayfada durur.",
    heading: "Bakım ve randevu",
    body: "Servis randevusu WhatsApp ile yazılır. Teklif listedeki işlere göre konuşulur.",
    hours: "Randevu saati mesajda netleşir.",
    cta: "randevu",
  },
  {
    id: "emlak",
    label: "Emlak",
    title: "Emlak görüşme ve portföy vitrini",
    description: "Emlak için görüşme, portföy notu ve teklif kapısı bu sayfada durur.",
    lead: "Görüşme notu ve teklif kapısı bu sayfada durur.",
    heading: "İlan ve görüşme",
    body: "Portföy görüşmesi ve teklif, yer ve hizmet listesine göre yazılır.",
    hours: "Görüşme gün içinde WhatsApp ile ayarlanır.",
    cta: "teklif",
  },
  {
    id: "servis",
    label: "Teknik Servis",
    title: "Teknik servis keşif ve teklif notu",
    description: "Teknik servis için keşif, arıza notu ve teklif kapısı bu sayfada durur.",
    lead: "Keşif notu ve teklif kapısı bu sayfada durur.",
    heading: "Arıza ve keşif",
    body: "Yerinde keşif ve teklif, listedeki hizmetlere göre konuşulur.",
    hours: "Keşif gün içinde WhatsApp ile ayarlanır.",
    cta: "teklif",
  },
  {
    id: "lojistik",
    label: "Lojistik / Nakliye",
    title: "Lojistik ve nakliye teklif sayfası",
    description: "Lojistik ve nakliye için rota notu, sevkiyat listesi ve teklif kapısı bu sayfada durur.",
    lead: "Sevkiyat notu ve teklif kapısı bu sayfada durur.",
    heading: "Sevkiyat ve rota",
    body: "Sevkiyat ve teklif, listedeki hizmetlere göre WhatsApp ile yazılır.",
    hours: "Sevkiyat saati mesajda netleşir.",
    cta: "teklif",
  },
  {
    id: "yazilim",
    label: "Yazılım / Ajans",
    title: "Yazılım ve ajans teklif vitrini",
    description: "Yazılım ve ajans için hizmet listesi, brif notu ve teklif kapısı bu sayfada durur.",
    lead: "Hizmet listesi ve teklif kapısı bu sayfada durur.",
    heading: "Brif ve teklif",
    body: "Brif ve teklif, listedeki hizmetlere göre WhatsApp ile konuşulur.",
    hours: "Görüşme saati mesajda netleşir.",
    cta: "teklif",
  },
] as const;

export type DukkanSector = (typeof DUKKAN_SECTORS)[number];
export type DukkanSectorId = DukkanSector["id"];

export const DUKKAN_TONES = [
  {
    id: "sicak",
    label: "Sıcak",
    paper: "#fff7f2",
    ink: "#3b2418",
    accent: "#c45c26",
    accentInk: "#fffaf6",
    line: "#f0d7c8",
  },
  {
    id: "sakin",
    label: "Sakin",
    paper: "#f3f7f8",
    ink: "#1c2b33",
    accent: "#2f5f6e",
    accentInk: "#f7fbfc",
    line: "#d5e3e8",
  },
  {
    id: "net",
    label: "Net",
    paper: "#f6f6f4",
    ink: "#161616",
    accent: "#111111",
    accentInk: "#f6f6f4",
    line: "#d9d9d4",
  },
  {
    id: "gece",
    label: "Gece",
    paper: "#14161c",
    ink: "#f3efe6",
    accent: "#e0b15a",
    accentInk: "#1a1408",
    line: "#2c3140",
  },
  {
    id: "dogal",
    label: "Doğal",
    paper: "#f3f6ef",
    ink: "#243024",
    accent: "#3f6b45",
    accentInk: "#f7faf4",
    line: "#d5e3d4",
  },
] as const;

export type DukkanTone = (typeof DUKKAN_TONES)[number];
export type DukkanToneId = DukkanTone["id"];

export function dukkanSectorById(id: DukkanSectorId): DukkanSector {
  const sector = DUKKAN_SECTORS.find((item) => item.id === id);
  if (!sector) {
    throw new Error("Dükkan sektörü yok.");
  }
  return sector;
}

export function dukkanToneById(id: DukkanToneId): DukkanTone {
  const tone = DUKKAN_TONES.find((item) => item.id === id);
  if (!tone) {
    throw new Error("Dükkan tonu yok.");
  }
  return tone;
}

function assertWindow(value: string, min: number, max: number, label: string): void {
  if (value.length < min || value.length > max) {
    throw new Error(`${label} boyu ${value.length}; pencere ${min}-${max}.`);
  }
}

for (const sector of DUKKAN_SECTORS) {
  assertWindow(sector.title, 10, 60, `${sector.id} başlık`);
  assertWindow(sector.description, 50, 160, `${sector.id} açıklama`);
}
