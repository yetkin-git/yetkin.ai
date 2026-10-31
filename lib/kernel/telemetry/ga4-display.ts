/**
 * GA4 boyut etiketinin ekran karşılığı.
 * Bilinmeyen değer olduğu gibi kalır; kategori uydurulmaz.
 */

const CHANNEL_LABELS: Record<string, string> = {
  Direct: "Doğrudan",
  "Organic Search": "Organik arama",
  "Paid Search": "Ücretli arama",
  "Organic Social": "Organik sosyal",
  "Paid Social": "Ücretli sosyal",
  Email: "E-posta",
  Affiliates: "İş ortakları",
  Referral: "Yönlendirme",
  Display: "Görüntülü",
  Video: "Video",
  "Paid Video": "Ücretli video",
  Audio: "Ses",
  "Paid Other": "Diğer ücretli",
  "Cross-network": "Çapraz ağ",
  "Organic Shopping": "Organik alışveriş",
  "Paid Shopping": "Ücretli alışveriş",
  Unassigned: "Atanmamış",
  "(not set)": "Belirsiz",
  "(other)": "Diğer",
};

export function formatGa4Count(count: number): string {
  return new Intl.NumberFormat("tr-TR").format(Math.max(0, Math.trunc(count)));
}

export function labelGa4Channel(label: string): string {
  return CHANNEL_LABELS[label] ?? label;
}

export function labelGa4Country(label: string): string {
  if (label === "(not set)") {
    return "Belirsiz";
  }
  if (label === "(other)") {
    return "Diğer";
  }
  return label;
}
