/** Sıkıştırmasız zip. Uzman tezgâhı dış kütüphane indirmez. */

const CRC_TABLE = new Uint32Array(256);
for (let index = 0; index < 256; index += 1) {
  let crc = index;
  for (let bit = 0; bit < 8; bit += 1) {
    crc = (crc & 1) === 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1;
  }
  CRC_TABLE[index] = crc >>> 0;
}

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = CRC_TABLE[(crc ^ byte) & 0xff]! ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export type ZipTextFile = {
  name: string;
  text: string;
  bytes?: never;
};

export type ZipBinaryFile = {
  name: string;
  bytes: Uint8Array;
  text?: never;
};

export type ZipFile = ZipTextFile | ZipBinaryFile;

function u16(value: number): number[] {
  return [value & 0xff, (value >> 8) & 0xff];
}

function u32(value: number): number[] {
  return [value & 0xff, (value >> 8) & 0xff, (value >> 16) & 0xff, (value >> 24) & 0xff];
}

function concat(parts: number[][]): Uint8Array {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

function bytesOf(text: string): number[] {
  return [...new TextEncoder().encode(text)];
}

function fileData(file: ZipFile): Uint8Array {
  if ("bytes" in file && file.bytes) {
    return file.bytes;
  }
  return new TextEncoder().encode(file.text ?? "");
}

/** 16 Kasım 2026 12:00. Çıktı her çağrıda aynı bayttır. */
const ZIP_TIME = (12 << 11) | (0 << 5);
const ZIP_DATE = ((2026 - 1980) << 9) | (11 << 5) | 16;

export function buildStoreZip(files: readonly ZipFile[]): Uint8Array {
  const locals: number[][] = [];
  const centrals: number[][] = [];
  let offset = 0;
  for (const file of files) {
    const name = bytesOf(file.name);
    const data = [...fileData(file)];
    const crc = crc32(Uint8Array.from(data));
    const local = [
      ...u32(0x04034b50),
      ...u16(20),
      ...u16(0x0800),
      ...u16(0),
      ...u16(ZIP_TIME),
      ...u16(ZIP_DATE),
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
      ...name,
      ...data,
    ];
    locals.push(local);
    centrals.push([
      ...u32(0x02014b50),
      ...u16(20),
      ...u16(20),
      ...u16(0x0800),
      ...u16(0),
      ...u16(ZIP_TIME),
      ...u16(ZIP_DATE),
      ...u32(crc),
      ...u32(data.length),
      ...u32(data.length),
      ...u16(name.length),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u16(0),
      ...u32(0),
      ...u32(offset),
      ...name,
    ]);
    offset += local.length;
  }
  const centralBytes = centrals.flat();
  const eocd = [
    ...u32(0x06054b50),
    ...u16(0),
    ...u16(0),
    ...u16(files.length),
    ...u16(files.length),
    ...u32(centralBytes.length),
    ...u32(offset),
    ...u16(0),
  ];
  return concat([...locals, centralBytes, eocd]);
}

export function readStoreZip(bytes: Uint8Array): ZipTextFile[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const files: ZipTextFile[] = [];
  let offset = 0;
  while (offset + 30 <= bytes.length) {
    if (view.getUint32(offset, true) !== 0x04034b50) {
      break;
    }
    const method = view.getUint16(offset + 8, true);
    const crc = view.getUint32(offset + 14, true);
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const data = bytes.slice(dataStart, dataStart + size);
    if (method !== 0 || crc32(data) !== crc) {
      throw new Error("Zip kaydı okunamadı.");
    }
    files.push({
      name: new TextDecoder().decode(bytes.slice(nameStart, nameStart + nameLength)),
      text: new TextDecoder().decode(data),
    });
    offset = dataStart + size;
  }
  return files;
}

/** İkili (PNG vb.) girişleri de okur. */
export function readStoreZipEntries(
  bytes: Uint8Array,
): { name: string; data: Uint8Array }[] {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const files: { name: string; data: Uint8Array }[] = [];
  let offset = 0;
  while (offset + 30 <= bytes.length) {
    if (view.getUint32(offset, true) !== 0x04034b50) {
      break;
    }
    const method = view.getUint16(offset + 8, true);
    const crc = view.getUint32(offset + 14, true);
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const dataStart = nameStart + nameLength + extraLength;
    const data = bytes.slice(dataStart, dataStart + size);
    if (method !== 0 || crc32(data) !== crc) {
      throw new Error("Zip kaydı okunamadı.");
    }
    files.push({
      name: new TextDecoder().decode(bytes.slice(nameStart, nameStart + nameLength)),
      data,
    });
    offset = dataStart + size;
  }
  return files;
}
