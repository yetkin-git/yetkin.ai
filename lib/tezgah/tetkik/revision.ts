import type { TetkikCheckId } from "@/lib/tezgah/tetkik/rubric";
import type { TetkikReport } from "@/lib/tezgah/tetkik/types";

/** Başlık penceresi skor ile aynı: 10–60. Açıklama: 50–160. */
const TITLE_MIN = 10;
const TITLE_MAX = 60;
const DESCRIPTION_MIN = 50;
const DESCRIPTION_MAX = 160;

const TITLE_SUFFIX = " | Sipariş ve randevu";
const DESCRIPTION_TAIL =
  "sipariş, randevu ve teklif kapısı bu sayfada durur. WhatsApp ile yazın; hizmet listesi ve çalışma saati burada durur.";

const TEXT_GATES = new Set<TetkikCheckId>([
  "title",
  "metaDescription",
  "h1",
  "headingOrder",
  "whatsappOrPhone",
  "emailOrForm",
  "cta",
]);

export type TetkikRevisionFieldId = "h1" | "metaTitle" | "metaDescription" | "welcome" | "cta";

export type TetkikRevisionField = {
  id: TetkikRevisionFieldId;
  label: string;
  note: string;
  text: string;
  gap: boolean;
};

export type TetkikRevisionPack = {
  fields: readonly TetkikRevisionField[];
  leftovers: readonly string[];
  markdown: string;
};

function plainName(name: string): string {
  const clean = name.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length > 0 ? clean.slice(0, 80) : "Mahalle dükkanı";
}

function escapeCopiedHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fitTitle(name: string): string {
  const room = TITLE_MAX - TITLE_SUFFIX.length;
  let lead = plainName(name);
  if (lead.length > room) {
    lead = lead.slice(0, room).trim();
  }
  if (lead.length < 2) {
    lead = "Dükkan";
  }
  const title = `${lead}${TITLE_SUFFIX}`;
  if (title.length >= TITLE_MIN && title.length <= TITLE_MAX) {
    return title;
  }
  return `Dükkan${TITLE_SUFFIX}`;
}

function fitDescription(name: string): string {
  const joiner = " ";
  const maxLead = DESCRIPTION_MAX - DESCRIPTION_TAIL.length - joiner.length;
  let lead = plainName(name);
  if (lead.length > maxLead) {
    lead = lead.slice(0, Math.max(0, maxLead)).trim();
  }
  if (lead.length < 2) {
    lead = "Dükkan";
  }
  const text = `${lead}${joiner}${DESCRIPTION_TAIL}`;
  if (text.length >= DESCRIPTION_MIN && text.length <= DESCRIPTION_MAX) {
    return text;
  }
  const fallback = `Dükkan ${DESCRIPTION_TAIL}`;
  if (fallback.length >= DESCRIPTION_MIN && fallback.length <= DESCRIPTION_MAX) {
    return fallback;
  }
  return DESCRIPTION_TAIL.slice(0, DESCRIPTION_MAX);
}

function heading(name: string): string {
  return `${plainName(name)} — sipariş ve randevu`;
}

function welcome(name: string): string {
  const lead = plainName(name);
  return `${lead} burada. Sipariş, randevu veya teklif için aşağıdaki kapıyı kullanın. Hizmet listesi ve çalışma saati ilk ekranda durur.`;
}

function ctaBlock(name: string): string {
  const lead = escapeCopiedHtml(plainName(name));
  return [
    "WhatsApp ile yazın veya randevu bırakın. 90XXXXXXXXXX yerine kendi hattınızı yazın.",
    "",
    '<a href="https://wa.me/90XXXXXXXXXX">WhatsApp ile yazın</a>',
    '<a href="tel:+90XXXXXXXXXX">Hemen ara</a>',
    '<a href="#randevu">Randevu bırakın</a>',
    '<form id="randevu" action="#randevu">',
    '<label>Randevu notu <textarea name="not"></textarea></label>',
    '<button type="submit">Randevu bırakın</button>',
    "</form>",
    "",
    `Merhaba, ${lead} için randevu yazıyorum.`,
  ].join("\n");
}

function failed(report: TetkikReport, id: TetkikCheckId): boolean {
  const row = report.checks.find((check) => check.id === id);
  return row?.passed !== true;
}

function h1Field(report: TetkikReport, name: string): TetkikRevisionField {
  const missing = failed(report, "h1");
  const order = failed(report, "headingOrder");
  let note = "Ana başlık duruyor. Yenilemek için bunu tek h1 olarak bırakın.";
  if (missing && order) {
    note = "Tek ana başlık yok ve sıra bozuk. Bunu tek h1 yapın; alt başlıklar h2 olsun.";
  } else if (missing) {
    note = "Tek ana başlık yok. Bunu sayfanın tek h1'i olarak yapıştırın.";
  } else if (order) {
    note = "Başlık sırası bozuk. Bu h1 kalsın; sonraki başlıklar h2 olsun.";
  }
  return {
    id: "h1",
    label: "Yenilenmiş Ana Başlık (H1)",
    note,
    text: heading(name),
    gap: missing || order,
  };
}

function metaTitleField(report: TetkikReport, name: string): TetkikRevisionField {
  const gap = failed(report, "title");
  return {
    id: "metaTitle",
    label: "SEO Meta Başlık",
    note: gap
      ? "Sayfa başlığı yok ya da boyu uygun değil. Bunu title olarak yapıştırın."
      : "Başlık boyu uygun. Yenilemek için bunu title olarak kullanın.",
    text: fitTitle(name),
    gap,
  };
}

function metaDescriptionField(report: TetkikReport, name: string): TetkikRevisionField {
  const gap = failed(report, "metaDescription");
  return {
    id: "metaDescription",
    label: "SEO Meta Açıklama",
    note: gap
      ? "Arama açıklaması yok ya da boyu uygun değil. Bunu meta açıklama olarak yapıştırın."
      : "Açıklama boyu uygun. Yenilemek için bunu meta açıklama olarak kullanın.",
    text: fitDescription(name),
    gap,
  };
}

function welcomeField(report: TetkikReport, name: string): TetkikRevisionField {
  const gap = failed(report, "h1") || failed(report, "cta");
  return {
    id: "welcome",
    label: "Dönüşüm Odaklı Karşılama Metni",
    note: gap
      ? "İlk ekran karşılığı zayıf. Bu cümleyi ana başlığın altına yapıştırın."
      : "Karşılama yenilemek için hazır. Ana başlığın altında durabilir.",
    text: welcome(name),
    gap,
  };
}

function ctaField(report: TetkikReport, name: string): TetkikRevisionField {
  const door = failed(report, "whatsappOrPhone");
  const call = failed(report, "cta");
  const form = failed(report, "emailOrForm");
  let note = "Kapı duruyor. Bloğu ilk ekrana almak için kullanın.";
  if (door) {
    note = "WhatsApp veya telefon yok. Bu bloğu ilk ekrana yapıştırın.";
  } else if (call) {
    note = "Belirgin çağrı yok. Bu bloğu ilk ekrana yapıştırın.";
  } else if (form) {
    note = "Yazmak için form yok. Randevu formunu sayfaya ekleyin.";
  }
  return {
    id: "cta",
    label: "WhatsApp/Randevu Çağrı Bloğu",
    note,
    text: ctaBlock(name),
    gap: door || call || form,
  };
}

/** Tetkik eksiklerine göre yapıştırmaya hazır revizyon. Ağ çağrısı yok. */
export function buildTetkikRevisionPack(report: TetkikReport): TetkikRevisionPack {
  const name = plainName(report.businessName);
  const fields = [
    h1Field(report, name),
    metaTitleField(report, name),
    metaDescriptionField(report, name),
    welcomeField(report, name),
    ctaField(report, name),
  ] as const;
  const leftovers = report.checks
    .filter((check) => !check.passed && !TEXT_GATES.has(check.id))
    .map((check) => check.label);
  const markdown = fields.map((field) => `## ${field.label}\n${field.text}`).join("\n\n");
  return { fields, leftovers, markdown };
}
