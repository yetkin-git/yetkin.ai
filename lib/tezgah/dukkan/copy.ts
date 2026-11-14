/**
 * Sektörel vitrinin mühürlü iskeleti. Renk ve cümle kullanıcı metninden gelmez.
 * Klinik kopyası randevu, saat ve hizmet adıyla sınırlıdır.
 */

export const DUKKAN_FILENAME = "dijital-dukkan.html" as const;

export const DUKKAN_CTA_LABEL = {
  siparis: "Sipariş ver",
  randevu: "Randevu",
  teklif: "Teklif al",
} as const;

export type DukkanCtaId = keyof typeof DUKKAN_CTA_LABEL;

export const DUKKAN_SECTORS = [
  {
    id: "restoran",
    label: "Restoran/Kafe",
    title: "Mahalle restoranı ve kafe vitrini",
    description: "Mahalle restoranı ve kafe için menü, servis saati ve sipariş kapısı bu sayfada durur.",
    lead: "Menüden seçilen hizmetler ve sipariş kapısı bu sayfada.",
    heading: "Mutfak ve masa",
    body: "Seçilen hizmetler mutfakta hazırlanır. Sipariş WhatsApp ile alınır.",
    hours: "Öğle ve akşam servisi mahalle saatine göre yürür.",
    cta: "siparis",
  },
  {
    id: "kuafor",
    label: "Kuaför/Güzellik",
    title: "Kuaför ve güzellik randevu vitrini",
    description: "Kuaför ve güzellik için randevu, bakım listesi ve çalışma saati bu sayfada durur.",
    lead: "Bakım listesi ve randevu kapısı bu sayfada durur.",
    heading: "Randevu ve bakım",
    body: "Kesim ve bakım randevusu WhatsApp ile yazılır.",
    hours: "Saat, randevu mesajında netleşir.",
    cta: "randevu",
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
    id: "klinik",
    label: "Diş/Sağlık Kliniği",
    title: "Diş ve sağlık kliniği randevu sayfası",
    description: "Diş ve sağlık kliniği için randevu saati ve hizmet adları bu sayfada durur.",
    lead: "Randevu ve çalışma saati bu sayfada durur.",
    heading: "Randevu ve saat",
    body: "Randevu saati WhatsApp ile netleşir. Aşağıdaki liste hizmet adıdır.",
    hours: "Saat, yazılan randevu notuna göre konuşulur.",
    cta: "randevu",
  },
  {
    id: "emlak",
    label: "Emlak/Danışmanlık",
    title: "Emlak ve danışmanlık görüşme vitrini",
    description: "Emlak ve danışmanlık için görüşme, portföy notu ve teklif kapısı bu sayfada durur.",
    lead: "Görüşme notu ve teklif kapısı bu sayfada durur.",
    heading: "İlan ve görüşme",
    body: "Portföy görüşmesi ve teklif, yer ve hizmet listesine göre yazılır.",
    hours: "Görüşme gün içinde WhatsApp ile ayarlanır.",
    cta: "teklif",
  },
  {
    id: "magaza",
    label: "Yerel Mağaza",
    title: "Yerel mağaza vitrini ve sipariş notu",
    description: "Yerel mağaza için vitrin, ürün notu ve sipariş kapısı bu sayfada durur.",
    lead: "Vitrin listesi ve sipariş kapısı bu sayfada durur.",
    heading: "Vitrin ve sipariş",
    body: "Listedeki hizmetler vitrinde durur. Sipariş WhatsApp ile tamamlanır.",
    hours: "Gündüz vitrin saati mahalleye göre yürür.",
    cta: "siparis",
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
