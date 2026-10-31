/**
 * OFF-101 ilk ders çalışma paketi.
 * Tam çıkış paketi (8 istem kartı, Cuma 30, KVKK) lisansla açılır.
 * PDF fırını kapalıdır (`ACADEMY_STUDIO_GONE.pdf`). Paket zip olarak iner.
 */

export const OFF101_STARTER_PACK_NAME = "off-101-ilk-ders-calisma.zip" as const;

const EXCEL_CHECKLIST = `OFF-101 · İlk ders çalışma dosyası
A1 kontrol listesi

1. A1 hücresine ilk gerçek sütun adını yaz. Logo, genel başlık veya birleşik hücre A1'de durmasın.
2. Birleşik hücreleri çöz. Aradaki boş satırları sil.
3. Tarih, metin ve sayıyı tek tipe getir. Sayıyı standart sayı formatında bırak.
4. Orijinali silme. Temiz kopyayı yan sayfada al.
5. Gerçek müşteri adı veya IBAN taşıyan dosyayı bu derste yükleme.
`;

/** Mühürlü ilk ders istemi. `ACADEMY_OFFICE_AI_1_COPILOT_PROMPT` ile birebir. */
const FIRST_LESSON_PROMPT =
  "Sana sunduğum bu ham veri içinde yer alan birleştirilmiş hücreleri tek tek ayır, aralardaki gereksiz boş satırları sil ve sayıları standart sayı formatına getir.";

export type OfficeAiStarterFile = {
  name: string;
  body: string;
};

export function officeAiStarterPackFiles(): readonly OfficeAiStarterFile[] {
  return [
    { name: "excel-a1-kontrol.txt", body: EXCEL_CHECKLIST },
    { name: "ilk-ders-istem.txt", body: `${FIRST_LESSON_PROMPT}\n` },
  ];
}

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let crc = n;
    for (let k = 0; k < 8; k += 1) {
      crc = (crc & 1) !== 0 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
    }
    table[n] = crc >>> 0;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i += 1) {
    const byte = data[i] ?? 0;
    const row = CRC_TABLE[(crc ^ byte) & 0xff] ?? 0;
    crc = row ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function concatBytes(parts: readonly Uint8Array[]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

/** Sıkıştırmasız zip (method 0). İsimler ASCII. Gövde UTF-8. */
export function buildStoredZip(files: readonly { name: string; body: string }[]): Uint8Array {
  const encoder = new TextEncoder();
  const locals: Uint8Array[] = [];
  const centrals: Uint8Array[] = [];
  let offset = 0;
  for (const file of files) {
    const name = encoder.encode(file.name);
    const data = encoder.encode(file.body);
    const crc = crc32(data);
    const local = new Uint8Array(30 + name.length + data.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(8, 0, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, name.length, true);
    local.set(name, 30);
    local.set(data, 30 + name.length);
    locals.push(local);

    const central = new Uint8Array(46 + name.length);
    const centralView = new DataView(central.buffer);
    centralView.setUint32(0, 0x02014b50, true);
    centralView.setUint16(4, 20, true);
    centralView.setUint16(6, 20, true);
    centralView.setUint32(16, crc, true);
    centralView.setUint32(20, data.length, true);
    centralView.setUint32(24, data.length, true);
    centralView.setUint16(28, name.length, true);
    centralView.setUint32(42, offset, true);
    central.set(name, 46);
    centrals.push(central);
    offset += local.length;
  }
  const centralBytes = concatBytes(centrals);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06054b50, true);
  endView.setUint16(8, files.length, true);
  endView.setUint16(10, files.length, true);
  endView.setUint32(12, centralBytes.length, true);
  endView.setUint32(16, offset, true);
  return concatBytes([...locals, centralBytes, end]);
}

export function officeAiStarterPackZip(): Uint8Array {
  return buildStoredZip(officeAiStarterPackFiles());
}
