/**
 * 01_office_ai-g1 Gmail + Gemini — canlı gelen kutusu SSOT.
 * Taşıma su (kopyala-yapıştır / ekran görüntüsü) 1. ve 2. kapı dururken atlanmış kapıdır. PEDAGOJI.md §E.8–E.10.
 */

export const ACADEMY_GMAIL_WINDOW_TITLE = "Gmail" as const;
export const ACADEMY_GMAIL_FILE_NAME = "Gelen_Kutusu.gmail" as const;
export const ACADEMY_GMAIL_NATIVE_TOOL = "Gemini" as const;
export const ACADEMY_GMAIL_INBOX_HEAD = "Gelen Kutusu · son 24 saat" as const;
export const ACADEMY_GMAIL_ACTION_HEAD = "Aksiyon listesi · kutu yerinde" as const;

/** Öğrencinin Gmail Gemini paneline yazacağı gerçek istem — Prompt Terminali SSOT. */
export const ACADEMY_GMAIL_GEMINI_PROMPT =
  "@Gmail Gelen kutumdaki son 24 saat içinde gelen e-postaları tara. Ödeme, onay veya acil aksiyon bekleyenleri tablo yap: Gönderen | İş | Son tarih | Taslak yanıt notu. Rutin dekont ve bültenleri Arşivlik yaz. Hiçbir taslağı gönderme." as const;

export const ACADEMY_GMAIL_MAILS = [
  {
    id: "mail-kaya",
    cell: "A1",
    from: "Kaya Gıda A.Ş.",
    subject: "Vade bugün — 54.650 TL tahsilat onayı",
    preview: "Ödeme penceresi kapanmadan teyit isteriz",
    tag: "Ödeme",
  },
  {
    id: "mail-yonetim",
    cell: "B1",
    from: "Yönetim Kurulu",
    subject: "Sözleşme eki — acil imza onayı",
    preview: "Bugün 17:00’e kadar imza bekleniyor",
    tag: "Onay",
  },
  {
    id: "mail-bank",
    cell: "C1",
    from: "Banka Dekontu",
    subject: "Havale bildirimi — rutin dekont",
    preview: "Otomatik dekont, aksiyon yok",
    tag: "Arşivlik",
  },
  {
    id: "mail-bulletin",
    cell: "D1",
    from: "Haftalık Bülten",
    subject: "Ürün duyurusu ve kampanya özeti",
    preview: "Bilgi notu, yanıt gerekmez",
    tag: "Arşivlik",
  },
] as const;

export const ACADEMY_GMAIL_ACTION_GROUPS = [
  {
    id: "mail-kaya",
    cell: "A1",
    tone: "acil",
    mark: "🔴",
    label: "ÖDEME / ONAY",
    title: "Kaya Gıda — 54.650 TL tahsilat",
    detail: "Son 24 saatte aksiyon bekliyor",
  },
  {
    id: "mail-yonetim",
    cell: "B1",
    tone: "bekle",
    mark: "🟡",
    label: "ACİL AKSİYON",
    title: "Yönetim — imza onayı",
    detail: "Bugün 17:00’e kadar",
  },
  {
    id: "mail-bank",
    cell: "C1",
    tone: "arsiv",
    mark: "🟢",
    label: "ARŞİVLİK",
    title: "Banka dekontu + bülten",
    detail: "Rutin; gelen kutusu içinde süzüldü",
  },
] as const;

export const ACADEMY_GMAIL_CARRY_WATER_CLIP = [
  "Ctrl+C ile mail kopyala",
  "Ekran görüntüsü al",
  "ChatGPT’ye yapıştır — kutu kopuk",
] as const;

export type AcademyGmailStageKind = "disconnected" | "inbox" | "native";

/** Command boyunca yerleşik özet kapalı (Spoiler Yasağı). Sol split taşıma su. */
export function academyGmailStageKind(input: {
  pane?: "live" | "before" | "after";
  section: string;
  hideReply?: boolean;
}): AcademyGmailStageKind {
  const pane = input.pane ?? "live";
  if (pane === "after") {
    return "native";
  }
  if (pane === "before" || input.section === "TAŞIMA SU" || input.section === "GİRİŞ KÖPRÜSÜ") {
    return "disconnected";
  }
  if (input.hideReply === true || input.section === "HOŞ GELDİN" || input.section === "GEMİNİ AÇ") {
    return "inbox";
  }
  return "native";
}
