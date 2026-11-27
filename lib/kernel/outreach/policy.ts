/**
 * Otonom B2B outreach — saf kurallar. Ağ, DB ve çevre okuması yoktur.
 *
 * Mühürler:
 * - Yalnız kurumsal adres. Ücretsiz posta sağlayıcıları taslakta da gönderimde de reddedilir.
 * - Her gövde tek tıkla RET bağlantısını ve ticari ileti satırını **taşımak zorundadır**.
 * - Ölçülmemiş sonuç, kesin hibe, garanti ve fiyat vaadi metne giremez (spam değil, dürüstlük).
 * - Gönderen alan adı bu modülde okunmaz: `OUTREACH_FROM_EMAIL` kapısı `sender.ts` içindedir.
 */

export const OUTREACH_VERTICALS = ["KURUMSAL", "ETICARET", "HIBE"] as const;

export type OutreachVertical = (typeof OUTREACH_VERTICALS)[number];

export const OUTREACH_VERTICAL_LABELS: Record<OutreachVertical, string> = {
  KURUMSAL: "Kurumsal yetkinlik",
  ETICARET: "E-ticaret operasyonu",
  HIBE: "Hibe ve teşvik",
};

/** Dikeyin kamu yüzeyi. Gövde bu bağlantıyı aynen taşır. */
export const OUTREACH_VERTICAL_LINKS: Record<OutreachVertical, string> = {
  KURUMSAL: "https://yetkin.ai/kurumsal",
  ETICARET: "https://yetkin.ai/e-ticaret",
  HIBE: "https://yetkin.ai/tezgah?tool=grant",
};

/** Dikeyin tek cümlelik vaadi. Uydurma metrik yoktur. */
export const OUTREACH_VERTICAL_PITCH: Record<OutreachVertical, string> = {
  KURUMSAL: "Ekibin ölçülebilir yetkinlik kartını aynı masada çıkarırız.",
  ETICARET: "Ürün, stok ve kanal fiyatını tek defterde tutarız.",
  HIBE: "Açık çağrıyı katalogdan okur, uygunluk cümlesini uydurmayız.",
};

export const OUTREACH_DRAFT_STATUSES = [
  "PENDING_APPROVAL",
  "APPROVED",
  "SENT",
  "REJECTED",
  "FAILED",
] as const;

export type OutreachDraftStatus = (typeof OUTREACH_DRAFT_STATUSES)[number];

export const OUTREACH_DAILY_LIMIT_MIN = 15;
export const OUTREACH_DAILY_LIMIT_MAX = 20;
export const OUTREACH_DAILY_LIMIT_DEFAULT = 15;

export const OUTREACH_SUBJECT_MIN = 8;
export const OUTREACH_SUBJECT_MAX = 180;
export const OUTREACH_BODY_MIN = 40;
export const OUTREACH_BODY_MAX = 6000;
/** Bir seferde üretilecek en fazla taslak — panel isteği ve model maliyeti tavanı. */
export const OUTREACH_GENERATE_BATCH_MAX = 10;

/** Ticari elektronik ileti şerhi (ETK 6563 / İYS). RET hakkı cümlede açıkça durur. */
export const OUTREACH_COMMERCIAL_NOTICE =
  "Bu ileti ticari elektronik iletidir. Almak istemezsen tek tıkla çıkabilirsin.";

/**
 * Ücretsiz / şahsi posta sağlayıcıları. B2B outreach'te hedef olamaz:
 * - Şahıs kutusuna ticari ileti göndermek ETK ve KVKK açısından hukuki dayanaksızdır.
 * - Teslim edilebilirlik ve şikâyet oranı kurumsal gönderici itibarını düşürür.
 */
export const OUTREACH_FREE_MAIL_DOMAINS: readonly string[] = [
  "gmail.com",
  "googlemail.com",
  "hotmail.com",
  "hotmail.com.tr",
  "outlook.com",
  "outlook.com.tr",
  "live.com",
  "msn.com",
  "yahoo.com",
  "yahoo.com.tr",
  "icloud.com",
  "me.com",
  "yandex.com",
  "yandex.com.tr",
  "yandex.ru",
  "proton.me",
  "protonmail.com",
  "gmx.com",
  "gmx.net",
  "mail.ru",
  "aol.com",
  "zoho.com",
  "tutanota.com",
  "tuta.com",
  "hey.com",
  "qq.com",
  "163.com",
];

const FREE_SET = new Set(OUTREACH_FREE_MAIL_DOMAINS);

export const OUTREACH_EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/u;

export function normalizeOutreachEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function emailDomainOf(email: string): string {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).trim().toLowerCase() : "";
}

/** Ücretsiz sağlayıcı mı? `mail.google.com` gibi alt alan adları da reddedilir. */
export function isFreeMailbox(email: string): boolean {
  const domain = emailDomainOf(normalizeOutreachEmail(email));
  if (!domain) {
    return true;
  }
  if (FREE_SET.has(domain)) {
    return true;
  }
  for (const free of OUTREACH_FREE_MAIL_DOMAINS) {
    if (domain.endsWith(`.${free}`)) {
      return true;
    }
  }
  return false;
}

export function isCorporateMailbox(email: string): boolean {
  const value = normalizeOutreachEmail(email);
  return OUTREACH_EMAIL_RE.test(value) && !isFreeMailbox(value);
}

/**
 * Dürüstlük ve spam kapısı. İki ayrı iş yapar:
 * 1. Ölçülmemiş sonuç / kurum kararı vaadi (marka kuralı).
 * 2. Ticari ileti filtrelerini tetikleyen klasik spam kalıpları.
 */
const OVERCLAIM =
  /kesin hibe|kesin uygun|onayland[ıi]|onay ald[ıi]|%100 uygun|yüzde yüz uygun|garanti eder|garantili|iş vaadi|kazanman[ıi] garanti|hemen kazanç|risksiz kazanç/iu;

const SPAM_PATTERNS: readonly { pattern: RegExp; label: string }[] = [
  { pattern: /bedava|bedeva/iu, label: "bedava" },
  { pattern: /\bfree\b/iu, label: "free" },
  { pattern: /acil!!!|!!!{2,}/u, label: "aşırı ünlem" },
  { pattern: /\bpara kazan/iu, label: "para kazan" },
  { pattern: /\bkazan[çc] garantisi\b/iu, label: "kazanç garantisi" },
  { pattern: /s[ıi]n[ıi]rs[ıi]z/iu, label: "sınırsız" },
  { pattern: /t[ıi]kla kazan|hemen t[ıi]kla/iu, label: "tıkla kazan" },
  { pattern: /son [şs]ans|ka[çc][ıi]rma/iu, label: "son şans" },
  { pattern: /y[üu]zde y[üu]z|%\s?100/iu, label: "yüzde yüz" },
  { pattern: /d[üu]nyan[ıi]n en iyisi|piyasan[ıi]n lideri|rakipsiz/iu, label: "abartılı üstünlük" },
  { pattern: /m[üu]şteri garantisi|memmuniyet garantisi/iu, label: "garanti" },
  { pattern: /\bkap[ıi]da [öo]deme\b/iu, label: "kapıda ödeme" },
  { pattern: /\bf[ıi]rsat[ıi] ka[çc][ıi]rma\b/iu, label: "fırsat kaçırma" },
  { pattern: /whatsapp['’]?tan yaz|hemen ara/iu, label: "kanal zorlaması" },
  { pattern: /\bunsubscribe\b/iu, label: "yabancı RET sözcüğü" },
  { pattern: /\bclick here\b/iu, label: "yabancı çağrı" },
  { pattern: /\bno[- ]?reply\b/iu, label: "yanıtlanamaz kutu" },
];

export type OutreachCopyIssue =
  | { ok: true }
  | { ok: false; reason: "overclaim" | "spam" | "missing_link" | "missing_footer" | "length" };

/**
 * Taslak metninin kendi kapısı — RET altbilgisi **aranmaz** (altbilgi gönderim anında
 * taze imzayla eklenir, DB'de durmaz). Model çıktısı bu kapıdan geçmezse taslak yazılmaz.
 */
export function outreachDraftCopyIssue(input: {
  vertical: OutreachVertical;
  subject: string;
  body: string;
}): OutreachCopyIssue {
  const subject = input.subject.trim();
  const body = input.body.trim();
  const combined = `${subject}\n${body}`;
  if (subject.length < OUTREACH_SUBJECT_MIN || subject.length > OUTREACH_SUBJECT_MAX) {
    return { ok: false, reason: "length" };
  }
  if (body.length < OUTREACH_BODY_MIN || body.length > OUTREACH_BODY_MAX) {
    return { ok: false, reason: "length" };
  }
  if (!body.includes(OUTREACH_VERTICAL_LINKS[input.vertical])) {
    return { ok: false, reason: "missing_link" };
  }
  if (OVERCLAIM.test(combined)) {
    return { ok: false, reason: "overclaim" };
  }
  for (const rule of SPAM_PATTERNS) {
    if (rule.pattern.test(combined)) {
      return { ok: false, reason: "spam" };
    }
  }
  return { ok: true };
}

/** Gönderim kapısı — taslak kapısı + ticari ileti şerhi ve imzalı RET bağlantısı. */
export function outreachCopyIssue(input: {
  vertical: OutreachVertical;
  subject: string;
  body: string;
  unsubscribeUrl: string;
}): OutreachCopyIssue {
  const draftIssue = outreachDraftCopyIssue(input);
  if (!draftIssue.ok) {
    return draftIssue;
  }
  const body = input.body.trim();
  if (!body.includes(input.unsubscribeUrl) || !body.includes(OUTREACH_COMMERCIAL_NOTICE)) {
    return { ok: false, reason: "missing_footer" };
  }
  return { ok: true };
}

export const OUTREACH_ISSUE_LABELS: Record<
  Exclude<OutreachCopyIssue, { ok: true }>["reason"],
  string
> = {
  overclaim: "Metin ölçülmemiş sonuç veya kurum kararı vaadi taşıyor.",
  spam: "Metin spam filtresi tetikleyen bir kalıp taşıyor.",
  missing_link: "Metinde dikey sayfası bağlantısı yok.",
  missing_footer: "Metinde ticari ileti şerhi veya RET bağlantısı yok.",
  length: "Konu veya gövde uzunluğu sınırın dışında.",
};

/** Modelin ürettiği gövdenin altına imzalı RET satırını ekler. Idempotenttir. */
export function withUnsubscribeFooter(body: string, unsubscribeUrl: string): string {
  const clean = body.trim();
  if (clean.includes(unsubscribeUrl)) {
    return clean;
  }
  return [
    clean,
    "",
    "—",
    OUTREACH_COMMERCIAL_NOTICE,
    `Çıkmak için: ${unsubscribeUrl}`,
  ].join("\n");
}

/**
 * Şablon gövdesi — model yoksa da dürüst, kısa, ölçüsüz vaat taşımayan metin.
 * RET altbilgisi burada eklenmez: gönderim anında `withUnsubscribeFooter` basar.
 * Böylece veritabanındaki metin her gönderimde taze imza taşır.
 */
export function composeOutreachTemplate(input: {
  companyName: string;
  sector: string;
  vertical: OutreachVertical;
}): { subject: string; body: string } {
  const name = input.companyName.trim();
  const sector = input.sector.trim();
  const subject = `${name} · ${OUTREACH_VERTICAL_LABELS[input.vertical]} üzerine kısa not`;
  const body = [
    `Merhaba ${name},`,
    "",
    `${sector} tarafında ${OUTREACH_VERTICAL_LABELS[input.vertical].toLocaleLowerCase("tr-TR")} işini ${OUTREACH_VERTICAL_PITCH[input.vertical]}`,
    "",
    "Bu bir satış sözleşmesi değil. Rakam ve sonuç vaadi yazmıyorum; ilk adım sayfada duruyor.",
    "",
    `Bakmak istersen: ${OUTREACH_VERTICAL_LINKS[input.vertical]}`,
    "",
    "Yetkin",
  ].join("\n");
  return { subject, body };
}

/** Panelden gelen tek taslak düzenlemesi. */
export type OutreachDraftEdit = {
  id: string;
  recipientEmail: string;
  subject: string;
  body: string;
};

export type OutreachDraftParseResult =
  | { ok: true; value: OutreachDraftEdit }
  | { ok: false; reason: string };

function oneLine(value: string, max: number): string {
  const clean = value.replace(/[\r\n\u0000]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max);
}

export function parseOutreachDraftEdit(input: unknown): OutreachDraftParseResult {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, reason: "Taslak gövdesi yok." };
  }
  const row = input as Record<string, unknown>;
  const id = typeof row.id === "string" ? row.id.trim() : "";
  if (id.length < 8 || id.length > 40) {
    return { ok: false, reason: "Taslak kimliği yok." };
  }
  const recipientEmail = normalizeOutreachEmail(
    typeof row.recipientEmail === "string" ? row.recipientEmail : "",
  );
  if (!isCorporateMailbox(recipientEmail)) {
    return { ok: false, reason: "Alıcı kurumsal adres olmalı." };
  }
  const subject = oneLine(typeof row.subject === "string" ? row.subject : "", OUTREACH_SUBJECT_MAX);
  if (subject.length < OUTREACH_SUBJECT_MIN) {
    return { ok: false, reason: "Konu çok kısa." };
  }
  const body = (typeof row.body === "string" ? row.body : "").replace(/\u0000/g, "").trim();
  if (body.length < OUTREACH_BODY_MIN || body.length > OUTREACH_BODY_MAX) {
    return { ok: false, reason: "Gövde uzunluğu sınırın dışında." };
  }
  return { ok: true, value: { id, recipientEmail, subject, body } };
}

/** Ayar yaması. `dailyLimit` 15–20 bandı, `sendHourTrt` 6–18. */
export function parseOutreachSettingsPatch(input: unknown):
  | { ok: true; value: { isEnabled?: boolean; dailyLimit?: number; sendHourTrt?: number } }
  | { ok: false; reason: string } {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ok: false, reason: "Ayar gövdesi yok." };
  }
  const row = input as Record<string, unknown>;
  const value: { isEnabled?: boolean; dailyLimit?: number; sendHourTrt?: number } = {};
  if (row.isEnabled !== undefined) {
    if (typeof row.isEnabled !== "boolean") {
      return { ok: false, reason: "Şalter açık veya kapalı olmalı." };
    }
    value.isEnabled = row.isEnabled;
  }
  if (row.dailyLimit !== undefined) {
    const limit = Number(row.dailyLimit);
    if (
      !Number.isInteger(limit) ||
      limit < OUTREACH_DAILY_LIMIT_MIN ||
      limit > OUTREACH_DAILY_LIMIT_MAX
    ) {
      return {
        ok: false,
        reason: `Günlük tavan ${OUTREACH_DAILY_LIMIT_MIN}–${OUTREACH_DAILY_LIMIT_MAX} olmalı.`,
      };
    }
    value.dailyLimit = limit;
  }
  if (row.sendHourTrt !== undefined) {
    const hour = Number(row.sendHourTrt);
    if (!Number.isInteger(hour) || hour < 6 || hour > 18) {
      return { ok: false, reason: "Gönderim saati 06–18 arasında olmalı." };
    }
    value.sendHourTrt = hour;
  }
  if (Object.keys(value).length === 0) {
    return { ok: false, reason: "Değişen ayar yok." };
  }
  return { ok: true, value };
}

export function isOutreachVertical(value: unknown): value is OutreachVertical {
  return typeof value === "string" && (OUTREACH_VERTICALS as readonly string[]).includes(value);
}

export function isOutreachDraftStatus(value: unknown): value is OutreachDraftStatus {
  return typeof value === "string" && (OUTREACH_DRAFT_STATUSES as readonly string[]).includes(value);
}

/**
 * Günlük tavan **Türkiye gününe** göredir (UTC+3 sabit; Türkiye 2016'dan beri
 * yaz saati uygulamıyor). UTC gece yarısını kullanmak, 09:00 TRT gönderiminde
 * 00:00–03:00 arasında sayacı yanlış güne yazardı.
 */
export const OUTREACH_TRT_OFFSET_MS = 3 * 60 * 60 * 1000;

export function outreachDayStartUtc(now: Date = new Date()): Date {
  const shifted = new Date(now.getTime() + OUTREACH_TRT_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - OUTREACH_TRT_OFFSET_MS);
}

/** Kuyruk görünümü. İstemciye yalnız bu alanlar çıkar. */
export type OutreachDraftView = {
  id: string;
  companyName: string;
  recipientEmail: string;
  sector: string;
  vertical: OutreachVertical;
  sourceUrl: string | null;
  subject: string;
  body: string;
  status: OutreachDraftStatus;
  errorMessage: string;
  approvedAt: string | null;
  sentAt: string | null;
  createdAt: string;
};

export type OutreachBoardView = {
  isEnabled: boolean;
  dailyLimit: number;
  sendHourTrt: number;
  fromEmail: string | null;
  senderReady: boolean;
  senderIssue: string | null;
  counts: Record<OutreachDraftStatus, number>;
  drafts: OutreachDraftView[];
  suppressed: { email: string; reason: string; createdAt: string }[];
};

/**
 * Süper adminin elindeki liste. Kaynak etiketi `admin-csv`.
 * Adres uydurulmaz; satır bu kapıdan geçmeden kuyruğa yazılmaz.
 */
export const OUTREACH_IMPORT_SOURCE = "admin-csv";
export const OUTREACH_IMPORT_MAX_ROWS = 200;
export const OUTREACH_IMPORT_TEXT_MAX = 200_000;
/** `findings_json` içinde aranan mühür. JSON.stringify boşluk koymaz. */
export const OUTREACH_IMPORT_FINDINGS_MARK = `"source":"${OUTREACH_IMPORT_SOURCE}"`;

export type OutreachImportRejectReason =
  | "invalidEmail"
  | "personalMailbox"
  | "suppressed"
  | "duplicate"
  | "incomplete"
  | "limit";

export type OutreachImportReasons = Record<OutreachImportRejectReason, number>;

export type OutreachImportCandidate = {
  companyName: string;
  recipientEmail: string;
  sector: string;
  vertical: OutreachVertical;
  sourceNote: string;
};

export type OutreachImportPlan = {
  accepted: OutreachImportCandidate[];
  rejected: number;
  reasons: OutreachImportReasons;
};

const EMPTY_IMPORT_REASONS = (): OutreachImportReasons => ({
  invalidEmail: 0,
  personalMailbox: 0,
  suppressed: 0,
  duplicate: 0,
  incomplete: 0,
  limit: 0,
});

function clipImportCell(value: string, max: number): string {
  const stripped = value.replace(/^[=+\-@]+/u, "");
  const clean = stripped.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max);
}

function detectDelimiter(line: string): "," | ";" | "\t" {
  const counts = { ",": 0, ";": 0, "\t": 0 };
  let quoted = false;
  for (const char of line) {
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (!quoted && (char === "," || char === ";" || char === "\t")) {
      counts[char] += 1;
    }
  }
  if (counts[";"] > counts[","] && counts[";"] >= counts["\t"]) {
    return ";";
  }
  if (counts["\t"] > counts[","] && counts["\t"] > counts[";"]) {
    return "\t";
  }
  return ",";
}

function splitCsvLine(line: string, delimiter: string): string[] {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index] ?? "";
    if (quoted) {
      if (char === '"') {
        if (line[index + 1] === '"') {
          current += '"';
          index += 1;
        } else {
          quoted = false;
        }
      } else {
        current += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
      continue;
    }
    if (char === delimiter) {
      cells.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells;
}

/**
 * CSV veya satır satır yapıştırma.
 * Sütunlar: companyName, recipientEmail, sector, vertical, sourceNote.
 * Ücretsiz kutu, bozuk adres, kara liste ve kuyrukta duran adres elenir.
 * `suppressed` ve `taken` küçük harf beklenir; yine de normalize edilir.
 */
export function planOutreachImport(
  text: string,
  blocked: { suppressed: ReadonlySet<string>; taken: ReadonlySet<string> },
): OutreachImportPlan {
  const reasons = EMPTY_IMPORT_REASONS();
  const accepted: OutreachImportCandidate[] = [];
  const suppressed = new Set([...blocked.suppressed].map((email) => normalizeOutreachEmail(email)));
  const taken = new Set([...blocked.taken].map((email) => normalizeOutreachEmail(email)));
  const seen = new Set<string>();

  const source = text.replace(/^\uFEFF/, "");
  const lines = source.split(/\r?\n/);
  const firstData = lines.find((line) => line.trim().length > 0 && !line.trim().startsWith("#"));
  const delimiter = firstData ? detectDelimiter(firstData) : ",";
  let headerSkipped = false;
  let dataRows = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }
    const cells = splitCsvLine(line, delimiter);
    if (!headerSkipped && (cells[0] ?? "").replace(/^\uFEFF/, "").trim().toLowerCase() === "companyname") {
      headerSkipped = true;
      continue;
    }
    dataRows += 1;
    if (dataRows > OUTREACH_IMPORT_MAX_ROWS) {
      reasons.limit += 1;
      continue;
    }

    const companyName = clipImportCell(cells[0] ?? "", 120);
    const sector = clipImportCell(cells[2] ?? "", 80);
    const verticalRaw = (cells[3] ?? "").trim().toUpperCase();
    const vertical = isOutreachVertical(verticalRaw) ? verticalRaw : null;
    const sourceNote = clipImportCell(cells.slice(4).join(delimiter === "\t" ? " " : delimiter), 500);
    if (companyName.length < 2 || sector.length < 1 || !vertical) {
      reasons.incomplete += 1;
      continue;
    }

    const recipientEmail = normalizeOutreachEmail(cells[1] ?? "");
    if (!OUTREACH_EMAIL_RE.test(recipientEmail) || recipientEmail.length > 160) {
      reasons.invalidEmail += 1;
      continue;
    }
    if (isFreeMailbox(recipientEmail)) {
      reasons.personalMailbox += 1;
      continue;
    }
    if (suppressed.has(recipientEmail)) {
      reasons.suppressed += 1;
      continue;
    }
    if (taken.has(recipientEmail) || seen.has(recipientEmail)) {
      reasons.duplicate += 1;
      continue;
    }

    seen.add(recipientEmail);
    accepted.push({ companyName, recipientEmail, sector, vertical, sourceNote });
  }

  const rejected = Object.values(reasons).reduce((sum, count) => sum + count, 0);
  return { accepted, rejected, reasons };
}

/** Hibe kanalı ayrıdır. E-ticaret dikeyi satır etiketinde durur; kanal yedeğidir. */
export function outreachImportChannel(vertical: OutreachVertical): "WEB_TETKIK" | "TUBITAK_HIBE" {
  return vertical === "HIBE" ? "TUBITAK_HIBE" : "WEB_TETKIK";
}

export function outreachImportNote(sourceNote: string): string {
  const note = sourceNote.trim();
  const labeled = note ? `${OUTREACH_IMPORT_SOURCE} · ${note}` : OUTREACH_IMPORT_SOURCE;
  return labeled.length <= 500 ? labeled : labeled.slice(0, 500);
}

export function outreachImportFindings(row: {
  vertical: OutreachVertical;
  sourceNote: string;
}): string {
  return JSON.stringify({
    source: OUTREACH_IMPORT_SOURCE,
    vertical: row.vertical,
    sourceNote: row.sourceNote,
  });
}

/** İçe aktarılan satırın dikeyi. Etiket yoksa veya bozuksa null; kanal yedeği çağıran katmandadır. */
export function readOutreachImportVertical(findingsJson: string): OutreachVertical | null {
  if (!findingsJson.includes(OUTREACH_IMPORT_FINDINGS_MARK)) {
    return null;
  }
  try {
    const parsed = JSON.parse(findingsJson) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return null;
    }
    const row = parsed as Record<string, unknown>;
    if (row.source !== OUTREACH_IMPORT_SOURCE || !isOutreachVertical(row.vertical)) {
      return null;
    }
    return row.vertical;
  } catch {
    return null;
  }
}
