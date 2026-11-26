/**
 * Bağlamsal köprü — hedef sayfada **başlangıç bağlamı** üretimi.
 *
 * Denetim (443363f4): iki hedef parametreyi sessizce yutuyordu.
 *
 * 1. `/panel/hibe?kaynak=e-ticaret` ve `?kaynak=kurumsal` — sayfa `kaynak`'ı
 *    hiç okumuyordu; köprü tıklanınca kullanıcı aynı boş analiz formuna
 *    düşüyordu. Parametre "ölü"ydü.
 * 2. `/tezgah?kaynak=hibe` ipucu şeridi, kullanıcı `?tool=tetkik` ile geldiğinde
 *    de "teklif yazıcı hazır" diyordu; şablon ise yalnız `proposal` aracına
 *    uygulanıyordu. Yani vaat ile davranış ayrışıyordu.
 *
 * Bu modül **saf**tır: Next, React veya veritabanı bilmez. Böylece davranış
 * gerçekten çalıştırılarak test edilebilir (string araması değil).
 *
 * Sözleşme: kullanıcının açıkça verdiği değer **ezilmez**. Köprü yalnız boş
 * alanı doldurur. Aksi hâlde paylaşılan bir link kullanıcının yazdığını siler.
 */

import type { BridgeKaynak } from "@/lib/kernel/contextual-bridge-params";

/** Tezgâh köprü ipucu — `SEN_VOICE.bridges.tezgahHint` ile aynı şekil. */
export type TezgahBridgeHint = {
  title: string;
  body: string;
  jobPostSeed: string;
  expertiseSeed: string;
};

export type TezgahBridgeHintSet = {
  hibe: TezgahBridgeHint;
  kurumsal: TezgahBridgeHint;
};

/**
 * Tezgâh form değerlerine köprü tohumu uygular.
 *
 * `toolId` `"proposal"` değilse **hiçbir şey** yapmaz: mülakat/hibe şablonu
 * başka bir aracın alanlarına yazılırsa form çöp olur.
 * Boş alan doldurulur, dolu alan korunur.
 */
export function applyTezgahBridgeSeed(input: {
  toolId: string;
  kaynak: BridgeKaynak | null;
  values: Record<string, string>;
  hints: TezgahBridgeHintSet;
}): Record<string, string> {
  const { toolId, kaynak, values, hints } = input;
  if (toolId !== "proposal" || (kaynak !== "hibe" && kaynak !== "kurumsal")) {
    return values;
  }
  const hint = hints[kaynak];
  const next = { ...values };
  if (!next.jobPost) {
    next.jobPost = hint.jobPostSeed;
  }
  if (!next.expertise) {
    next.expertise = hint.expertiseSeed;
  }
  if (!next.deliveryMode) {
    next.deliveryMode = "summary";
  }
  return next;
}

/** Tezgâh ipucu şeridi yalnız teklif aracında ve yalnız tanınan köprüde basılır. */
export function tezgahBridgeHintFor(input: {
  toolId: string;
  kaynak: BridgeKaynak | null;
  hints: TezgahBridgeHintSet;
}): TezgahBridgeHint | null {
  const { toolId, kaynak, hints } = input;
  if (toolId !== "proposal") {
    return null;
  }
  if (kaynak === "hibe") {
    return hints.hibe;
  }
  if (kaynak === "kurumsal") {
    return hints.kurumsal;
  }
  return null;
}

/**
 * YetkinHibe analiz formunun köprüden gelen başlangıç bağlamı.
 *
 * Yalnız **katalogda tanımlı** eksen kimlikleri yazılır (NACE `47`, yatırım
 * odağı `ihracat` / `arge`). Uydurma kimlik forma yazılırsa `parseHibeAnalysis`
 * reddeder ve kullanıcı sebepsiz hata görür; bu yüzden liste burada sabittir.
 *
 * Kullanıcıya görünen metin burada **yazılmaz**: marka aksı ve kopya sahipliği
 * `lib/copy/sen-voice/bridges.ts`'tedir (`verify:sen-axis` o klasörü tarar).
 * Bu modül yalnız bir **anahtar** döner; sayfa metni `SEN_VOICE`'dan çözer.
 * Not metni **bağlantı içermez**: hedef sayfa kaynağa geri link verirse köprü
 * döngüye döner (E-Ticaret → Hibe → E-Ticaret).
 */
export type HibeBridgeNoteKey = "ecommerce" | "kurumsal";

export type HibeBridgeContext = {
  /** Forma yazılacak varsayılanlar. Kullanıcının verdiği değer önceliklidir. */
  defaults: { nace?: string; yatirim?: string; ihracat?: string };
  /** `SEN_VOICE.bridges.hibeContext` içindeki metin anahtarı. */
  noteKey: HibeBridgeNoteKey;
};

export function hibeBridgeContext(kaynak: BridgeKaynak | null): HibeBridgeContext | null {
  if (kaynak === "e-ticaret") {
    return {
      defaults: { nace: "47", yatirim: "ihracat", ihracat: "evet" },
      noteKey: "ecommerce",
    };
  }
  if (kaynak === "kurumsal") {
    return {
      defaults: { yatirim: "arge" },
      noteKey: "kurumsal",
    };
  }
  return null;
}

/**
 * Köprü bağlamını forma uygular; kullanıcının açık değerini **ezmez**.
 * `defaults` zaten kullanıcı girdisini taşıyorsa (`params.x ?? …`) bu fonksiyon
 * yalnız boş olanı doldurur.
 */
export function applyHibeBridgeDefaults(
  defaults: Record<string, string>,
  context: HibeBridgeContext | null,
): Record<string, string> {
  if (!context) {
    return defaults;
  }
  const next = { ...defaults };
  for (const [key, value] of Object.entries(context.defaults)) {
    if (value && !next[key]) {
      next[key] = value;
    }
  }
  return next;
}
