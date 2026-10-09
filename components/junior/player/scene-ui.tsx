import type { ReactNode } from "react";

/** Soft EdTech vector tokens — no hard black frames. Shared across Junior scene engines. */
export const Ink = {
  text: "#0f172a",
  muted: "#64748b",
  stroke: "#cbd5e1",
  strokeHot: "#94a3b8",
  sky: "#e0f2fe",
  skyFill: "#7dd3fc",
  amber: "#fef3c7",
  amberFill: "#fcd34d",
  green: "#dcfce7",
  greenFill: "#86efac",
  rose: "#ffe4e6",
  roseInk: "#e11d48",
  accent: "#0284c7",
  amberInk: "#b45309",
  greenInk: "#15803d",
  white: "#ffffff",
  panel: "#f8fafc",
} as const;

/** Cinema SoftStage — 16:9 viewBox; legacy 360×200 art orantılı büyütülür. */
export const JUNIOR_STAGE_VB_W = 640;
export const JUNIOR_STAGE_VB_H = 360;
export const JUNIOR_STAGE_ART_W = 360;
export const JUNIOR_STAGE_ART_H = 200;
export const JUNIOR_STAGE_ART_SCALE = Math.min(
  JUNIOR_STAGE_VB_W / JUNIOR_STAGE_ART_W,
  JUNIOR_STAGE_VB_H / JUNIOR_STAGE_ART_H,
);

/**
 * SoftStage dikey tabanı — CSS min-height yok (zero-scroll).
 * Canlı altyazı bandı varsayılan kapalı (CC toggle); board dikey bütçeyi SoftStage alır.
 * Ebeveyn board kutusu viewport’a oranlanır; SVG h-full ile doldurur.
 */
export const JUNIOR_STAGE_MIN_HEIGHT_PX = 0;
export const JUNIOR_STAGE_HEIGHT_PX = 0;

/** Sabit EdTech kartı — layout değişmez; vurgu anında (zero-delay, geçiş tamponu yok). */
export function SoftCard({
  x,
  y,
  w,
  h,
  fill,
  hot = false,
  rx = 14,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  hot?: boolean;
  rx?: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={rx}
      fill={fill}
      stroke={hot ? Ink.accent : Ink.stroke}
      strokeWidth={hot ? 3 : 1.75}
      style={{
        filter: hot ? "drop-shadow(0 0 6px rgba(2, 132, 199, 0.5))" : "none",
      }}
    />
  );
}

/** Sabit eleman vurgusu — konum sabit; opacity anında (altyazı ile aynı ms). */
export function SoftFocus({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <g opacity={active ? 1 : 0.62} data-junior-focus={active ? "on" : "off"}>
      {children}
    </g>
  );
}

/** Karatahta tek odak — altyazı bandı kapalıyken board’un tamamını doldurur. */
export function SoftStage({
  scene,
  gradientId,
  children,
}: {
  scene: string;
  gradientId: string;
  children: ReactNode;
}) {
  const ox = (JUNIOR_STAGE_VB_W - JUNIOR_STAGE_ART_W * JUNIOR_STAGE_ART_SCALE) / 2;
  const oy = (JUNIOR_STAGE_VB_H - JUNIOR_STAGE_ART_H * JUNIOR_STAGE_ART_SCALE) / 2;
  return (
    <svg
      viewBox={`0 0 ${JUNIOR_STAGE_VB_W} ${JUNIOR_STAGE_VB_H}`}
      className="pointer-events-none block h-full w-full max-h-full"
      role="img"
      aria-hidden
      data-junior-scene={scene}
      data-junior-stage="cinema-16x9"
      data-junior-stage-min-h={JUNIOR_STAGE_MIN_HEIGHT_PX}
      data-junior-stage-h={JUNIOR_STAGE_HEIGHT_PX}
      data-junior-stage-fit="viewport"
      data-junior-stage-focus="blackboard"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#f0f9ff" />
        </linearGradient>
      </defs>
      <g transform={`translate(${ox},${oy}) scale(${JUNIOR_STAGE_ART_SCALE})`}>
        <rect x="0" y="0" width={JUNIOR_STAGE_ART_W} height={JUNIOR_STAGE_ART_H} rx="18" fill={`url(#${gradientId})`} />
        {children}
      </g>
    </svg>
  );
}

export function SceneTitle({ children }: { children: string }) {
  return (
    <text x="18" y="28" fill={Ink.text} fontSize="17" fontFamily="inherit" fontWeight="700" letterSpacing="0.01em">
      {children}
    </text>
  );
}

export function SceneFoot({
  y = 178,
  fill = Ink.muted,
  children,
}: {
  y?: number;
  fill?: string;
  children: string;
}) {
  return (
    <text x="18" y={y} fill={fill} fontSize="14" fontFamily="inherit" fontWeight="500">
      {children}
    </text>
  );
}

/** Yapışkan sahne — eşleşme yoksa varsayılana sıçrama (fallback bounce) yasak. */
export type ExponentParams = { base: number; exp: number; product: number };
export type FractionParams = { num: number; den: number };
export type SpeedParams = { distance: number; time: number; speed: number };
export type AffixTrain = { root: string; wagons: string[] };
/** Gerçek / mecaz / terim — konuşulan örnek öbek + hedef kefe. */
export type MeaningPan = "gercek" | "mecaz" | "terim";
export type MeaningExample = { phrase: string; pan: MeaningPan };
/** Eş / zıt / yakın veya deyim / atasözü — konuşulan örnek. */
export type WordTreeBranch = "es" | "zit" | "yakin" | "deyim" | "atasozu";
export type WordTreeExample = { phrase: string; branch: WordTreeBranch };

export const DEFAULT_EXPONENT_PARAMS: ExponentParams = { base: 2, exp: 3, product: 8 };
export const DEFAULT_FRACTION_PARAMS: FractionParams = { num: 1, den: 4 };
export const DEFAULT_SPEED_PARAMS: SpeedParams = { distance: 120, time: 40, speed: 3 };
export const DEFAULT_AFFIX_TRAIN: AffixTrain = { root: "kök", wagons: ["ek"] };
export const DEFAULT_MEANING_EXAMPLE: MeaningExample = { phrase: "", pan: "gercek" };
export const DEFAULT_WORD_TREE_EXAMPLE: WordTreeExample = { phrase: "", branch: "es" };

/**
 * Caption izinden yapışkan parametre — yeni hit gelene kadar son geçerli durum kalır.
 * Genel konuşma / alt adımda seed’e (1 nolu şablon) geri dönmez.
 */
export function stickyRetainParams<T>(
  trail: readonly string[],
  tryParse: (caption: string) => T | null,
  seed: T,
): T {
  let last = seed;
  for (const caption of trail) {
    const hit = tryParse(caption);
    if (hit) last = hit;
  }
  return last;
}

/** Taban / üs — caption içinden `N üssü M` veya `N^M`. Eşleşme yoksa null. */
export function tryParseExponentParams(caption: string): ExponentParams | null {
  const text = caption.toLocaleLowerCase("tr-TR");
  const ussu = text.match(/(\d+)\s*üss[uü]\s*(\d+)/u);
  if (ussu) {
    const base = clampInt(Number(ussu[1]), 1, 12);
    const exp = clampInt(Number(ussu[2]), 1, 6);
    return { base, exp, product: base ** exp };
  }
  const caret = caption.match(/(\d+)\s*\^\s*(\d+)/u);
  if (caret) {
    const base = clampInt(Number(caret[1]), 1, 12);
    const exp = clampInt(Number(caret[2]), 1, 6);
    return { base, exp, product: base ** exp };
  }
  return null;
}

/** Taban / üs. `previous` verilirse eşleşme yokken ona yapışır; yoksa 2³ seed. */
export function parseExponentParams(
  caption: string,
  previous?: ExponentParams | null,
): ExponentParams {
  return tryParseExponentParams(caption) ?? previous ?? DEFAULT_EXPONENT_PARAMS;
}

/** Üslü ifade — cümle izinde doğrusal yapışkan (2³ → 10² → 5¹). */
export function stickyExponentParams(trail: readonly string[]): ExponentParams {
  return stickyRetainParams(trail, tryParseExponentParams, DEFAULT_EXPONENT_PARAMS);
}

/** Pay / payda — eşleşme yoksa null. */
export function tryParseFractionParams(caption: string): FractionParams | null {
  const text = caption.toLocaleLowerCase("tr-TR");
  const slash = text.match(/(\d+)\s*[\/÷]\s*(\d+)/u);
  if (slash) {
    return {
      num: clampInt(Number(slash[1]), 0, 12),
      den: clampInt(Number(slash[2]), 1, 12),
    };
  }
  const bolu = text.match(/(\d+)\s*bölü\s*(\d+)/u);
  if (bolu) {
    return {
      num: clampInt(Number(bolu[1]), 0, 12),
      den: clampInt(Number(bolu[2]), 1, 12),
    };
  }
  const ordinal: Array<{ re: RegExp; den: number }> = [
    { re: /yar[iı]m|ikide\s+bir/u, den: 2 },
    { re: /üçte\s+(\w+)/u, den: 3 },
    { re: /dörtte\s+(\w+)/u, den: 4 },
    { re: /beşte\s+(\w+)/u, den: 5 },
    { re: /alt[iı]da\s+(\w+)/u, den: 6 },
    { re: /sekizde\s+(\w+)/u, den: 8 },
  ];
  const wordNum: Record<string, number> = {
    bir: 1,
    iki: 2,
    üç: 3,
    uc: 3,
    dört: 4,
    dort: 4,
    beş: 5,
    bes: 5,
    altı: 6,
    alti: 6,
    yedi: 7,
    sekiz: 8,
  };
  for (const row of ordinal) {
    const m = text.match(row.re);
    if (!m) continue;
    if (row.den === 2) return { num: 1, den: 2 };
    const word = (m[1] || "bir").replace(/[^a-zçğıöşü]/gu, "");
    const num = wordNum[word] ?? 1;
    return { num: clampInt(num, 0, row.den), den: row.den };
  }
  return null;
}

/** Pay / payda — `a/b`, `a bölü b`, veya «dörtte bir». Varsayılan 1/4. */
export function parseFractionParams(
  caption: string,
  previous?: FractionParams | null,
): FractionParams {
  return tryParseFractionParams(caption) ?? previous ?? DEFAULT_FRACTION_PARAMS;
}

export function stickyFractionParams(trail: readonly string[]): FractionParams {
  return stickyRetainParams(trail, tryParseFractionParams, DEFAULT_FRACTION_PARAMS);
}

/** Yol / zaman — eşleşme yoksa null. */
export function tryParseSpeedParams(caption: string): SpeedParams | null {
  const text = caption.toLocaleLowerCase("tr-TR");
  const pair = text.match(/(\d+)\s*(?:metre|m)\b.*?(\d+)\s*(?:saniye|sn|s)\b/u);
  if (pair) {
    const distance = clampInt(Number(pair[1]), 1, 9999);
    const time = clampInt(Number(pair[2]), 1, 9999);
    return { distance, time, speed: distance / time };
  }
  const div = text.match(/(\d+)\s*(?:bölü|÷|\/)\s*(\d+)/u);
  if (div) {
    const distance = clampInt(Number(div[1]), 1, 9999);
    const time = clampInt(Number(div[2]), 1, 9999);
    return { distance, time, speed: distance / time };
  }
  return null;
}

/** Yol / zaman — `120 metre … 40 saniye` veya `120 ÷ 40`. Varsayılan 120/40 → 3. */
export function parseSpeedParams(caption: string, previous?: SpeedParams | null): SpeedParams {
  return tryParseSpeedParams(caption) ?? previous ?? DEFAULT_SPEED_PARAMS;
}

export function stickySpeedParams(trail: readonly string[]): SpeedParams {
  return stickyRetainParams(trail, tryParseSpeedParams, DEFAULT_SPEED_PARAMS);
}

/** Kök + ek — eşleşme yoksa null (seed’e sıçramaz). */
export function tryParseAffixTrain(caption: string): AffixTrain | null {
  const text = caption.toLocaleLowerCase("tr-TR");
  const known: Array<{ re: RegExp; root: string; wagons: string[] }> = [
    { re: /çiçeklik|ciceklik/u, root: "çiçek", wagons: ["lik"] },
    { re: /yazıcı|yazici/u, root: "yaz", wagons: ["ıcı"] },
    { re: /gözlük|gozluk/u, root: "göz", wagons: ["lük"] },
    { re: /taşlık|taslik/u, root: "taş", wagons: ["lık"] },
    { re: /koşucu|kosucu/u, root: "koş", wagons: ["ucu"] },
    { re: /silgi/u, root: "sil", wagons: ["gi"] },
    { re: /suluk/u, root: "su", wagons: ["luk"] },
    { re: /\bevde\b/u, root: "ev", wagons: ["de"] },
  ];
  for (const row of known) {
    if (row.re.test(text)) return { root: row.root, wagons: row.wagons };
  }
  if (/çekim|çoğul|iyelik|hal eki|bulunma/u.test(text)) return { root: "ev", wagons: ["de"] };
  if (/yapım|türet|lük/u.test(text)) return { root: "göz", wagons: ["lük"] };
  return null;
}

/** Kök + ek vagonları — caption’daki bilinen örneklerden. */
export function parseAffixTrain(caption: string, previous?: AffixTrain | null): AffixTrain {
  return tryParseAffixTrain(caption) ?? previous ?? DEFAULT_AFFIX_TRAIN;
}

export function stickyAffixTrain(trail: readonly string[]): AffixTrain {
  return stickyRetainParams(trail, tryParseAffixTrain, DEFAULT_AFFIX_TRAIN);
}

/**
 * Konuşulan örnek öbek → Gerçek / Mecaz / Terim kefesi.
 * Bilinen kalıplar + «… gerçek/mecaz/terim anlamdır» etiketi; eşleşme yoksa null.
 */
export function tryParseMeaningExample(caption: string): MeaningExample | null {
  const text = caption.toLocaleLowerCase("tr-TR");
  const known: Array<{ re: RegExp; phrase: string; pan: MeaningPan }> = [
    { re: /kulağ[ıi]\s+delik/u, phrase: "kulağı deliktir", pan: "mecaz" },
    { re: /yüzü\s+düş/u, phrase: "yüzü düştü", pan: "mecaz" },
    { re: /gözü\s+açık/u, phrase: "gözü açık", pan: "mecaz" },
    { re: /ağac[ıi]n\s+kök/u, phrase: "Ağacın kökü", pan: "gercek" },
    { re: /sorunun\s+kök/u, phrase: "Sorunun kökü", pan: "mecaz" },
    { re: /karekök|dokuzun\s+karekök/u, phrase: "karekök", pan: "terim" },
    { re: /ağır\s+taş/u, phrase: "Ağır taş", pan: "gercek" },
    { re: /ağır\s+konuş/u, phrase: "Ağır konuştu", pan: "mecaz" },
    { re: /ağırlık\s+bir\s+kuvvet|fen\s+dersinde\s+ağırlık/u, phrase: "ağırlık", pan: "terim" },
    { re: /\btansiyon\b/u, phrase: "tansiyon", pan: "terim" },
    { re: /sofradaki\s+tuz|\btuz\s+ise\s+gerçek/u, phrase: "tuz", pan: "gercek" },
    { re: /\bgöz\b.{0,40}duyu\s+organ|göz,\s*görmemizi/u, phrase: "göz", pan: "gercek" },
  ];
  let last: MeaningExample | null = null;
  for (const row of known) {
    if (row.re.test(text)) last = { phrase: row.phrase, pan: row.pan };
  }
  if (last) return last;

  const labeled =
    /([a-zçğıöşü0-9' ]{2,40}?)\s+(?:bu\s+)?(gerçek|mecaz|terim)\s+anlamd[ıi]r/giu;
  let match: RegExpExecArray | null;
  let labeledHit: MeaningExample | null = null;
  while ((match = labeled.exec(caption)) !== null) {
    const raw = (match[1] || "").replace(/\s+/gu, " ").trim();
    const panWord = (match[2] || "").toLocaleLowerCase("tr-TR");
    if (raw.length < 2) continue;
    if (/^(bu|bir|ise|olan|için|gibi|yani|ise|ise)$/iu.test(raw)) continue;
    if (/anlam|sözcük|kelime|cümle/iu.test(raw) && raw.split(/\s+/u).length <= 2) continue;
    const pan: MeaningPan =
      panWord === "mecaz" ? "mecaz" : panWord === "terim" ? "terim" : "gercek";
    const phrase = raw.charAt(0).toLocaleUpperCase("tr-TR") + raw.slice(1);
    labeledHit = { phrase: phrase.slice(0, 36), pan };
  }
  return labeledHit;
}

export function parseMeaningExample(
  caption: string,
  previous?: MeaningExample | null,
): MeaningExample {
  return tryParseMeaningExample(caption) ?? previous ?? DEFAULT_MEANING_EXAMPLE;
}

export function stickyMeaningExample(trail: readonly string[]): MeaningExample {
  return stickyRetainParams(trail, tryParseMeaningExample, DEFAULT_MEANING_EXAMPLE);
}

/**
 * Eş / zıt / yakın veya deyim / atasözü — caption’daki bilinen örnek öbek.
 * Eşleşme yoksa null (seed’e sıçramaz).
 */
export function tryParseWordTreeExample(caption: string): WordTreeExample | null {
  const text = caption.toLocaleLowerCase("tr-TR");
  const known: Array<{ re: RegExp; phrase: string; branch: WordTreeBranch }> = [
    { re: /cevap\s+ve\s+yanıt|yanıt\s+yerine\s+cevap|cevap\s+yerine\s+yanıt/u, phrase: "cevap ↔ yanıt", branch: "es" },
    { re: /kara\s+ve\s+siyah|kara\s+tahta|siyah\s+tahta/u, phrase: "kara ↔ siyah", branch: "es" },
    { re: /açık\s+ve\s+kapalı|kapı\s+açık|kapı\s+kapalı/u, phrase: "açık ↔ kapalı", branch: "zit" },
    { re: /büyük\s+ile\s+küçük|büyük\s+ve\s+küçük/u, phrase: "büyük ↔ küçük", branch: "zit" },
    { re: /güzel\s+ve\s+hoş|güzel\s+bir\s+şarkı|hoş\s+bir\s+şarkı/u, phrase: "güzel ↔ hoş", branch: "yakin" },
    { re: /erken\s+.*\s+çabuk|çabuk\s+ise\s+hız|erken\s+vakti/u, phrase: "erken ↔ çabuk", branch: "yakin" },
    { re: /doğru\s+ile\s+dürüst|doğru\s+ve\s+dürüst/u, phrase: "doğru ↔ dürüst", branch: "yakin" },
    { re: /basmak\s+ve\s+çiğnemek|çiğnemek/u, phrase: "basmak ↔ çiğnemek", branch: "yakin" },
    { re: /burnu\s+havada/u, phrase: "burnu havada", branch: "deyim" },
    { re: /kulak\s+kesil/u, phrase: "kulak kesilmek", branch: "deyim" },
    { re: /kulak\s+kabart/u, phrase: "kulak kabartmak", branch: "deyim" },
    { re: /göz\s+gezdir/u, phrase: "göz gezdirmek", branch: "deyim" },
    { re: /etekleri?\s+zil\s+çal/u, phrase: "etekleri zil çalmak", branch: "deyim" },
    { re: /damlaya\s+damlaya\s+göl/u, phrase: "Damlaya damlaya göl olur", branch: "atasozu" },
    { re: /ayağ[ıi]n[ıi]\s+yorgan/u, phrase: "Ayağını yorganına göre uzat", branch: "atasozu" },
    { re: /acele\s+işe\s+şeytan/u, phrase: "Acele işe şeytan karışır", branch: "atasozu" },
  ];
  let last: WordTreeExample | null = null;
  for (const row of known) {
    if (row.re.test(text)) last = { phrase: row.phrase, branch: row.branch };
  }
  return last;
}

export function parseWordTreeExample(
  caption: string,
  previous?: WordTreeExample | null,
): WordTreeExample {
  return tryParseWordTreeExample(caption) ?? previous ?? DEFAULT_WORD_TREE_EXAMPLE;
}

export function stickyWordTreeExample(trail: readonly string[]): WordTreeExample {
  return stickyRetainParams(trail, tryParseWordTreeExample, DEFAULT_WORD_TREE_EXAMPLE);
}

/** Pasta dilimi yolu — payda kadar eşit dilim, index 0..den-1. */
export function pieSlicePath(cx: number, cy: number, r: number, index: number, den: number): string {
  if (den <= 1) {
    return `M${cx} ${cy - r} A${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`;
  }
  const start = -Math.PI / 2 + (index * 2 * Math.PI) / den;
  const end = -Math.PI / 2 + ((index + 1) * 2 * Math.PI) / den;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy + r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy + r * Math.sin(end);
  const large = (end - start) > Math.PI ? 1 : 0;
  return `M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
}

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, Math.round(n)));
}
