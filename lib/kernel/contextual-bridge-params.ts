/**
 * Bağlamsal geçiş köprüleri — query parametre sanitizer.
 *
 * Köprü URL'leri yalnız bilgi / ön-doldurma taşır (`kaynak`, `pozisyon`, `konu`).
 * TCKN, VKN, telefon, IBAN ve e-posta query string'ine yazılmaz; okurken de reddedilir.
 *
 * Denetim (443363f4 sonrası) — eski sürüm şu payload'ları **geçiriyordu**:
 *
 * | payload | eski sonuç | neden |
 * |---|---|---|
 * | `java\u200Bscript:alert(1)` | geçti | sıfır genişlikli boşluk anahtar kelimeyi bölüyor |
 * | `on\u200Bclick=alert(1)` | geçti | aynı sebep |
 * | `＜script＞` (fullwidth) | geçti | ASCII olmayan açılı parantez `[<>]`'ye takılmıyor |
 * | `Müdür\u202Egnp.exe` | geçti | bidi override ile görsel kimlik sahteciliği |
 * | `Satış Müdürü, VKN:1234567890` | geçti | PII testi yalnız **tam** rakam dizgesine bakıyordu |
 * | `Pozisyon 05321234567` | geçti | gömülü telefon kalıbı yoktu |
 * | `%3Cscript%3E…` | geçti | çift çözümleme yüzeyi taranmıyordu |
 * | 200.000 karakter | işlendi | regex tüm ham gövde üzerinde koşuyordu |
 *
 * Yeni sıra sabittir: **sınırla → kontrol karakterini reddet → NFKC → görünmez
 * karakterleri düşür → çözümle-ve-tara → PII reddi → temizle → kırp.**
 * Reddetmek (boş dize) sessizce onarmaktan önce gelir: sessiz onarım saldırganın
 * payload'ının bir kısmını sayfaya taşır.
 */

/**
 * İzinli `kaynak` değerleri — beş aktif merkez.
 * `tezgah` **hedeftir**, köprü kaynağı değildir (`BridgeEmitKaynak` dışında kalır):
 * Tezgâh'tan çıkan bir köprü yoktur, ama param sözleşmesi beş merkezi tanır.
 */
export const BRIDGE_KAYNAK_VALUES = [
  "e-ticaret",
  "hibe",
  "kurumsal",
  "kariyer",
  "tezgah",
] as const;

export type BridgeKaynak = (typeof BRIDGE_KAYNAK_VALUES)[number];

/** Şerit çizen merkezler — Tezgâh köprü **yaymaz**. */
export const BRIDGE_EMIT_KAYNAK_VALUES = [
  "e-ticaret",
  "hibe",
  "kurumsal",
  "kariyer",
] as const;

export type BridgeEmitKaynak = (typeof BRIDGE_EMIT_KAYNAK_VALUES)[number];

/**
 * Köprü hedef seçimi — **saf**. Denetim (443363f4) bulgusu: şerit `targets`
 * dizisini olduğu gibi basıyordu, yani
 *
 * - `?kaynak=hibe` ile Hibe'ye gelen kullanıcıya Hibe'ye dön diyen köprü,
 * - kendi merkezine giden köprü (E-Ticaret ekranında E-Ticaret),
 * - 3+ hedef (reklam şeridi gibi görünen gürültü)
 *
 * ekrana çıkabiliyordu. Kural burada tek yerde durur ve **çalıştırılarak**
 * test edilir; bileşen yalnız çizim yapar.
 */
export function selectBridgeTargets<T extends { id?: string }>(input: {
  from: string;
  cameFrom?: string | null;
  targets: readonly T[];
  /** Ekran başına en fazla köprü. Anayasa: 2. */
  limit?: number;
}): T[] {
  const limit = input.limit ?? 2;
  const from = input.from.trim();
  const cameFrom = input.cameFrom?.trim() || null;
  const seen = new Set<string>();
  const picked: T[] = [];
  for (const target of input.targets) {
    if (picked.length >= limit) {
      break;
    }
    const id = target.id?.trim() || null;
    if (id) {
      // Kendine veya gelinen merkeze köprü yok: döngü ve gürültü.
      if (id === from || (cameFrom && id === cameFrom)) {
        continue;
      }
      if (seen.has(id)) {
        continue;
      }
      seen.add(id);
    }
    picked.push(target);
  }
  return picked;
}

/** Köprü query'sinde taşınabilen tek anahtarlar. Başkası yazılmaz, okunmaz. */
export const BRIDGE_QUERY_KEYS = ["kaynak", "pozisyon", "konu"] as const;

export type BridgeQueryKey = (typeof BRIDGE_QUERY_KEYS)[number];

/**
 * Ham girdi tavanı. Regex'ler bu sınırın **ötesine** bakmaz: 200 KB'lik bir
 * `pozisyon` gövdesi taranmaz, doğrudan reddedilir (bkz. `sanitizeBridgeQueryValue`).
 */
const MAX_RAW_LEN = 512;

/** Kontrol karakterleri: CRLF enjeksiyonu, NUL ve sekme kaçırma. **Reddedilir.** */
const CONTROL_CHARS = /[\u0000-\u001F\u007F]/;

/**
 * Görünmez ve yön değiştiren karakterler (Cf + sıfır genişlik + bidi + varyasyon
 * seçicileri + BOM). Anahtar kelime bölmek (`java\u200Bscript:`) ve görsel
 * kimlik sahteciliği (`\u202E`) buradan gelir; **düşürülür**.
 */
const INVISIBLE_CHARS =
  /[\u00AD\u061C\u070F\u115F\u1160\u17B4\u17B5\u180B-\u180F\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u206F\uFE00-\uFE0F\uFEFF\uFFF9-\uFFFB]/g;

/** Etiket / açılı parantez — NFKC sonrası ASCII olmayan biçimler de yakalanır. */
const ANGLE_OR_TAG = /[<>]|<\/?[a-z]/i;
const SCRIPTISH = /javascript:|vbscript:|data:text\/html|data:image\/svg|on[a-z]+\s*=/i;
/** HTML varlık kaçışı — `&#60;script&#62;` çözüldüğünde etikete döner. */
const HTML_ENTITY = /&#(?:x?[0-9a-f]{1,6});?/i;
const EMAIL_LIKE = /@/;
/** Tam rakam dizgesi: 10 hane VKN veya 11 hane TCKN (ayraçlar temizlenmiş hâlde). */
const TAX_OR_NATIONAL_ID = /^\d{10,11}$/;
/**
 * Gömülü PII: başlık içine iliştirilmiş VKN/TCKN, telefon veya IBAN.
 * Ayraçlar (` ` `.` `-` `(` `)` `/` `+`) atıldıktan sonra 10+ hane bitişik rakam
 * dizgesi kimlik numarası ya da telefondur; pozisyon adı böyle bir dizi taşımaz.
 */
const DIGIT_RUN = /\d{10,}/;
/** `TR` + 24 hane IBAN. */
const IBAN_LIKE = /^TR\d{24}$/i;
/**
 * "VKN:123…", "Telefon: 0532…", "e-posta: …" gibi **açık** PII etiketi.
 * Ayraç (`:` / `=`) zorunlu: "Vergi Uzmanı" gerçek bir pozisyon adıdır ve
 * yanlışlıkla reddedilmemelidir. Etiketsiz çıplak numarayı `DIGIT_RUN` yakalar.
 */
const PII_LABEL =
  /\b(?:vkn|tckn|tck|vergi\s*(?:no|numarası)?|iban|telefon|tel|gsm|e-?posta|e-?mail)\s*[:=]/i;

function firstRaw(raw: string | string[] | null | undefined): string {
  if (raw == null) {
    return "";
  }
  return Array.isArray(raw) ? (raw[0] ?? "") : raw;
}

/** Tek geçişli yüzde çözümleme. Bozuk `%` dizisi girdiyi olduğu gibi bırakır. */
function decodeOnce(value: string): string {
  if (!/%[0-9a-f]{2}/i.test(value)) {
    return value;
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Gömülü PII var mı? Rakam dizgesi ayraçlardan arındırılarak aranır: `0532 123 45 67`
 * da `1234567890` da yakalanır. Kısa sayılar (ör. "3 vardiya") serbest kalır.
 */
function hasEmbeddedPii(value: string): boolean {
  if (PII_LABEL.test(value)) {
    return true;
  }
  const compact = value.replace(/[\s.\-()/+]/g, "");
  if (IBAN_LIKE.test(compact)) {
    return true;
  }
  return DIGIT_RUN.test(compact);
}

/**
 * Genel köprü metin sanitizer.
 * HTML / script / kontrol karakterlerini **reddeder**; PII kalıplarını reddeder.
 */
export function sanitizeBridgeQueryValue(
  raw: string | string[] | null | undefined,
  maxLen = 120,
): string {
  const rawValue = firstRaw(raw);
  /**
   * Sert tavan: hiçbir meşru pozisyon / konu 512 karakter değildir (`maxLen`
   * zaten 160 / 120). Sınırı aşan gövde **reddedilir**, kırpılmaz — kırpmak
   * saldırganın payload'ının bir kısmını sayfaya taşır ve DoS yüzeyini
   * "sessizce kabul edilmiş" hâle getirir.
   */
  if (rawValue.length > MAX_RAW_LEN) {
    return "";
  }
  const bounded = rawValue.trim();
  if (!bounded) {
    return "";
  }
  // CRLF / NUL / sekme: enjeksiyon denemesidir, kozmetik gürültü değil.
  if (CONTROL_CHARS.test(bounded)) {
    return "";
  }
  // NFKC: fullwidth `＜script＞` → `<script>`; fullwidth harfler ASCII'ye iner.
  const normalized = bounded.normalize("NFKC").replace(INVISIBLE_CHARS, "").trim();
  if (!normalized) {
    return "";
  }
  const inspected = decodeOnce(normalized);
  if (
    ANGLE_OR_TAG.test(inspected) ||
    SCRIPTISH.test(inspected) ||
    HTML_ENTITY.test(inspected) ||
    EMAIL_LIKE.test(inspected)
  ) {
    return "";
  }
  if (TAX_OR_NATIONAL_ID.test(inspected.replace(/[\s.-]/g, "")) || hasEmbeddedPii(inspected)) {
    return "";
  }
  // XSS yüzeyini daralt: tırnak / ters eğik çizgi düşürülür.
  const cleaned = normalized
    .replace(/["'`\\]/g, "")
    .replace(/\s+/g, " ")
    .slice(0, Math.max(1, maxLen))
    .trim();
  return cleaned;
}

/** Allowlist `kaynak` — tanınmayan değer `null`. Yalnız `[a-z0-9-]` kabul edilir. */
export function parseBridgeKaynak(
  raw: string | string[] | null | undefined,
): BridgeKaynak | null {
  const value = sanitizeBridgeQueryValue(raw, 32);
  if (!value || !/^[a-z0-9-]+$/i.test(value)) {
    return null;
  }
  const lowered = value.toLowerCase();
  for (const id of BRIDGE_KAYNAK_VALUES) {
    if (id === lowered) {
      return id;
    }
  }
  return null;
}

/** Şerit yayan merkez mi? `tezgah` burada `false` — Tezgâh köprü yaymaz. */
export function isBridgeEmitKaynak(
  kaynak: BridgeKaynak | null,
): kaynak is BridgeEmitKaynak {
  return kaynak != null && kaynak !== "tezgah";
}

/** Kurumsal ilan başlığı ön-doldurma — 3–160 karakter; PII reddedilir. */
export function parseBridgePozisyon(raw: string | string[] | null | undefined): string {
  const value = sanitizeBridgeQueryValue(raw, 160);
  if (value.length < 3) {
    return "";
  }
  return value;
}

/** İsteğe bağlı konu ipucu — kısa, PII'siz. */
export function parseBridgeKonu(raw: string | string[] | null | undefined): string {
  return sanitizeBridgeQueryValue(raw, 120);
}

/** Query anahtarı köprü sözleşmesinde mi? Bilinmeyen anahtar taşınmaz. */
export function isBridgeQueryKey(key: string): key is BridgeQueryKey {
  return (BRIDGE_QUERY_KEYS as readonly string[]).includes(key);
}

/**
 * Ham sorgu dizesinden **yalnız** köprü anahtarlarını, sanitize edilmiş
 * değerleriyle yeniden kurar. `?` ile başlamayan çıktı döner (`""` olabilir).
 *
 * Kullanım: giriş dönüşü (`/login?next=…`). `next` açık yön savunması sorguyu
 * düşürür; bu yardımcı yalnız iki izinli anahtarı geri koyar, böylece kullanıcının
 * ön-doldurması oturum açtıktan sonra kaybolmaz ve yeni bir yüzey açılmaz.
 */
export function sanitizeBridgeSearch(
  search: string | URLSearchParams | null | undefined,
): string {
  const params =
    search instanceof URLSearchParams
      ? search
      : new URLSearchParams(typeof search === "string" ? search.replace(/^\?/, "") : "");
  const out = new URLSearchParams();
  const kaynak = parseBridgeKaynak(params.get("kaynak"));
  if (kaynak) {
    out.set("kaynak", kaynak);
  }
  const pozisyon = parseBridgePozisyon(params.get("pozisyon"));
  if (pozisyon) {
    out.set("pozisyon", pozisyon);
  }
  const konu = parseBridgeKonu(params.get("konu"));
  if (konu) {
    out.set("konu", konu);
  }
  return out.toString();
}
