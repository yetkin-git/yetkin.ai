/**
 * Code 128B — harici kütüphane yok.
 * Yüksek kontrastlı SVG. Sessiz bölge barkod okuyucu için bırakılır.
 */

const CODE128_PATTERNS = [
  "11011001100",
  "11001101100",
  "11001100110",
  "10010011000",
  "10010001100",
  "10001001100",
  "10011001000",
  "10011000100",
  "10001100100",
  "11001001000",
  "11001000100",
  "11000100100",
  "10110011100",
  "10011011100",
  "10011001110",
  "10111001100",
  "10011101100",
  "10011100110",
  "11001110010",
  "11001011100",
  "11001001110",
  "11011100100",
  "11001110100",
  "11101101110",
  "11101001100",
  "11100101100",
  "11100100110",
  "11101100100",
  "11100110100",
  "11100110010",
  "11011011000",
  "11011000110",
  "11000110110",
  "10100011000",
  "10001011000",
  "10001000110",
  "10110001000",
  "10001101000",
  "10001100010",
  "11010001000",
  "11000101000",
  "11000100010",
  "10110111000",
  "10110001110",
  "10001101110",
  "10111011000",
  "10111000110",
  "10001110110",
  "11101110110",
  "11010001110",
  "11000101110",
  "11011101000",
  "11011100010",
  "11011101110",
  "11101011000",
  "11101000110",
  "11100010110",
  "11101101000",
  "11101100010",
  "11100011010",
  "11101111010",
  "11001000010",
  "11110001010",
  "10100110000",
  "10100001100",
  "10010110000",
  "10010000110",
  "10000101100",
  "10000100110",
  "10110010000",
  "10110000100",
  "10011010000",
  "10011000010",
  "10000110100",
  "10000110010",
  "11000010010",
  "11001010000",
  "11110111010",
  "11000010100",
  "10001111010",
  "10100111100",
  "10010111100",
  "10010011110",
  "10111100100",
  "10011110100",
  "10011110010",
  "11110100100",
  "11110010100",
  "11110010010",
  "11011011110",
  "11011110110",
  "11110110110",
  "10101111000",
  "10100011110",
  "10001011110",
  "10111101000",
  "10111100010",
  "11110101000",
  "11110100010",
  "10111011110",
  "10111101110",
  "11101011110",
  "11110101110",
  "11010000100",
  "11010010000",
  "11010011100",
  "1100011101011",
] as const;

const START_B = 104;
const STOP = 106;
const QUIET_MODULES = 10;

export type Code128Encode = {
  codes: number[];
  checksum: number;
  modules: string;
};

/** Code 128B. Boş, uzun veya ASCII dışı metin `null` döner. */
export function encodeCode128B(value: string): Code128Encode | null {
  const text = value.trim();
  if (text.length < 1 || text.length > 48) {
    return null;
  }
  const codes: number[] = [START_B];
  for (let index = 0; index < text.length; index += 1) {
    const charCode = text.charCodeAt(index);
    if (charCode < 32 || charCode > 126) {
      return null;
    }
    codes.push(charCode - 32);
  }
  let sum = codes[0] ?? 0;
  for (let index = 1; index < codes.length; index += 1) {
    sum += (codes[index] ?? 0) * index;
  }
  const checksum = sum % 103;
  codes.push(checksum);
  codes.push(STOP);
  let modules = "";
  for (const code of codes) {
    const pattern = CODE128_PATTERNS[code];
    if (!pattern) {
      return null;
    }
    modules += pattern;
  }
  return { codes, checksum, modules };
}

function escapeAttr(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
}

/**
 * Takip kodu veya sipariş numarası için taranabilir SVG.
 * Sessiz bölge 10 modül. Çubuklar siyah, zemin beyaz.
 */
export function renderCode128Svg(
  value: string,
  options?: { module?: number; height?: number },
): string | null {
  const encoded = encodeCode128B(value);
  if (!encoded) {
    return null;
  }
  const moduleWidth = options?.module != null && options.module >= 1 && options.module <= 8 ? options.module : 2;
  const barHeight = options?.height != null && options.height >= 24 && options.height <= 240 ? options.height : 72;
  const quiet = QUIET_MODULES * moduleWidth;
  const width = quiet * 2 + encoded.modules.length * moduleWidth;
  const height = barHeight + 8;
  let rects = "";
  let x = quiet;
  for (const bit of encoded.modules) {
    if (bit === "1") {
      rects += `<rect x="${x}" y="4" width="${moduleWidth}" height="${barHeight}" fill="#000"/>`;
    }
    x += moduleWidth;
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${escapeAttr(value.trim())}"><rect width="100%" height="100%" fill="#fff"/>${rects}</svg>`;
}
