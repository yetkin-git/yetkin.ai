import { normalizePathname } from "@/lib/kernel/security/edge-guard";
import { COURSE_REGISTRY } from "@yetkin/kernel/catalog-ids/course-registry";
import { isAcademyRetiredStorefrontSlug } from "@/lib/academy/retired-storefront";

/**
 * Soft 404 kapısı — gövde akmadan önce adres var mı?
 *
 * Next 16'da `notFound()` bir `loading.tsx` Suspense sınırının altında
 * render edilirse yanıt 200 akar (ölçüm tablosu `lib/academy/route-existence.ts`).
 * Kök `app/loading.tsx` tüm ağacı sardığı için **hiçbir** render-zamanı kapısı
 * durum kodunu 404'e çeviremez; kenar `proxy` bunu akış başlamadan keser.
 *
 * **Neden `lib/academy` altında.** Dikey→çekirdek yönü serbesttir; çekirdeğin
 * dikeyi import etmesi B1 import duvarına aykırıdır (`verify:boundaries`).
 * Bu yüzden kapının tek evi burasıdır; `proxy.ts` yalnız bu modülü çağırır.
 *
 * Burada yalnız **biçim ve slug haritası** okunur: DB, disk ve oturum yok.
 * Biçim geçerli ama kayıt yoksa sayfa açılır ve dürüst "kayıt yok" gövdesini basar
 * (kimlik/gizlilik gereği varlık doğrulanmaz).
 */

/**
 * Vitrin kabuğunda olan slug'lar. `pilot-sku.ts` bu listeyi canlı ses mührüne
 * göre daraltır; kenar diske bakmaz, kayıt defterinin vitrin sırasını okur.
 * Yayın/`is_published` ve fiyat kararı sayfada kalır — burada yalnız *adres var mı*
 * sorusu cevaplanır.
 */
const ADULT_VITRINE_SLUGS: readonly string[] = COURSE_REGISTRY.filter(
  (row) => row.audience === "adult" && row.canon && row.vitrineOrder !== null,
).map((row) => row.slug);

const OFF201_SLUG = "01_office_ai_ileri" as const;

export type AcademySlugVerdict = "ok" | "missing" | "retired";

/** `/academy/[slug]` adresi var mı? `retired` = next.config 301 basar, 404 basma. */
export function academySlugVerdict(rawSlug: string): AcademySlugVerdict {
  const slug = decodeSegment(rawSlug);
  if (!slug) {
    return "missing";
  }
  // Emekli vitrin SKU'ları 301 ile /academy'ye iner; 404 basmak yönlendirmeyi gölgeler.
  if (isAcademyRetiredStorefrontSlug(slug)) {
    return "retired";
  }
  if (slug === OFF201_SLUG) {
    return "ok";
  }
  return ADULT_VITRINE_SLUGS.includes(slug) ? "ok" : "missing";
}

/** `publicTalent.ts` ile aynı desen; sayfa varlık doğrulamaz, biçim doğrular. */
const PUBLIC_TALENT_ID_PATTERN = /^[A-Za-z0-9_-]{6,64}$/;

/** `parseSha256Hex` ile aynı desen. */
const SHA256_HEX_PATTERN = /^[a-f0-9]{64}$/i;

export function publicTalentIdIsWellFormed(rawId: string): boolean {
  return PUBLIC_TALENT_ID_PATTERN.test(decodeSegment(rawId));
}

export function certificateHashIsWellFormed(rawHash: string): boolean {
  return SHA256_HEX_PATTERN.test(decodeSegment(rawHash).trim().toLowerCase());
}

const ACADEMY_STOREFRONT_RE = /^\/academy\/([^/]+)$/;
const CERTIFICATE_VERIFY_RE = /^\/academy\/dogrula\/([^/]+)$/;
const PUBLIC_TALENT_RE = /^\/vize\/([^/]+)$/;
const CLAIM_TOKEN_RE = /^\/claim\/([^/]+)$/;
const MAGAZA_RE = /^\/magaza\/([^/]+)$/;
/** `parseSlug` ile aynı desen. Kapı Commerce motorunu import etmez. */
const MAGAZA_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Kurumsal satış/İK yüzeyinin **kapalı** çocuk listesi.
 *
 * `/kurumsal` Faz 1'de donmuş odadan çıktı; artık canlı vitrin + kokpit. Ama
 * oda kapısı kalkarken **adres kapısı** gelmedi: `/kurumsal/ilan/yeni`,
 * `/kurumsal/herhangi-bir-sey` gibi hiç var olmamış alt yollar Next'in kendi
 * 404'üne düşüyor ve kök `app/loading.tsx` akışı yüzünden **HTTP 200** ile
 * gövde basıyor (soft 404 — ölçüldü: `/kurumsal/ilan/yeni` → 200).
 *
 * Kapı **kapalı beyaz liste**dir: yalnız burada sayılan çocuklar geçer. Yeni bir
 * kurumsal alt sayfa eklenirse buraya da yazılmalıdır; yoksa gerçek 404 döner.
 */
const KURUMSAL_ALLOWED_CHILDREN = new Set(["ilanlar"]);

/**
 * `/academy/<segment>` altında duran **statik** sayfalar. Bunlar dinamik slug değildir;
 * kapıya takılırsa gerçek sayfalar 404 olur (ölçüldü: `/academy/dogrula` → 404 regresyonu).
 */
const ACADEMY_STATIC_SEGMENTS = new Set([
  "certificates",
  "ileri",
  "dogrula",
  "courses",
  "rehber",
]);

/**
 * `null` = yol var (devam et). Dolu = bu adres hiç var olmamıştır → 404.
 *
 * Kapsam bilerek dardır: yalnız üç dinamik kamu segmenti. Kilitli oynatıcı ve
 * çıkış paketi `auth-307` / `redirect` kollarında kalır; onlara dokunulmaz.
 */
export function missingPublicSurfacePath(pathname: string): string | null {
  const path = normalizePathname(pathname);

  const storefront = ACADEMY_STOREFRONT_RE.exec(path);
  if (storefront) {
    const slug = storefront[1] ?? "";
    if (ACADEMY_STATIC_SEGMENTS.has(decodeSegment(slug))) {
      return null;
    }
    return academySlugVerdict(slug) === "missing" ? path : null;
  }

  const verify = CERTIFICATE_VERIFY_RE.exec(path);
  if (verify) {
    return certificateHashIsWellFormed(verify[1] ?? "") ? null : path;
  }

  const talent = PUBLIC_TALENT_RE.exec(path);
  if (talent) {
    return publicTalentIdIsWellFormed(talent[1] ?? "") ? null : path;
  }

  const magaza = MAGAZA_RE.exec(path);
  if (magaza) {
    const slug = decodeSegment(magaza[1] ?? "");
    return slug.length >= 1 && slug.length <= 48 && MAGAZA_SLUG_RE.test(slug) ? null : path;
  }

  // Faz 3 / §4.1 — `/claim/[token]`. Token biçimi base64url 43 karakterdir;
  // biçim bozuksa gövde akmadan 404. Geçerli biçimde kayıt yoksa sayfa
  // "geçerli değil" der (varlık sızdırılmaz) ve 200 akar.
  const claim = CLAIM_TOKEN_RE.exec(path);
  if (claim) {
    return /^[A-Za-z0-9_-]{43}$/u.test(decodeSegment(claim[1] ?? "")) ? null : path;
  }

  // Kurumsal yüzeyi: `/kurumsal` ve `/kurumsal/ilanlar` açık; diğer alt yollar
  // hiç var olmamıştır → gerçek 404 (soft 404 kapanır).
  if (path.startsWith("/kurumsal/")) {
    const child = path.slice("/kurumsal/".length).split("/")[0] ?? "";
    return KURUMSAL_ALLOWED_CHILDREN.has(child) ? null : path;
  }

  return null;
}

function decodeSegment(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) {
    return "";
  }
  try {
    return decodeURIComponent(trimmed);
  } catch {
    return "";
  }
}
