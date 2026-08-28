/**
 * Byte-mode QR (ISO/IEC 18004) — sürüm 1–10, ECC L.
 * Client-safe: node:crypto yok. Telefon kamerası /academy/dogrula/[hash] okur.
 */

export type AcademyQrMatrix = {
  size: number;
  modules: ReadonlyArray<ReadonlyArray<boolean>>;
};

type QrBlock = { data: number; ec: number };

type QrVersion = {
  version: number;
  size: number;
  dataCodewords: number;
  blocks: readonly QrBlock[];
  alignment: readonly number[];
};

const QR_L: readonly QrVersion[] = [
  { version: 1, size: 21, dataCodewords: 19, blocks: [{ data: 19, ec: 7 }], alignment: [] },
  { version: 2, size: 25, dataCodewords: 34, blocks: [{ data: 34, ec: 10 }], alignment: [6, 18] },
  { version: 3, size: 29, dataCodewords: 55, blocks: [{ data: 55, ec: 15 }], alignment: [6, 22] },
  { version: 4, size: 33, dataCodewords: 80, blocks: [{ data: 80, ec: 20 }], alignment: [6, 26] },
  { version: 5, size: 37, dataCodewords: 108, blocks: [{ data: 108, ec: 26 }], alignment: [6, 30] },
  { version: 6, size: 41, dataCodewords: 136, blocks: [{ data: 68, ec: 18 }, { data: 68, ec: 18 }], alignment: [6, 34] },
  { version: 7, size: 45, dataCodewords: 156, blocks: [{ data: 78, ec: 20 }, { data: 78, ec: 20 }], alignment: [6, 22, 38] },
  { version: 8, size: 49, dataCodewords: 194, blocks: [{ data: 97, ec: 24 }, { data: 97, ec: 24 }], alignment: [6, 24, 42] },
  { version: 9, size: 53, dataCodewords: 232, blocks: [{ data: 116, ec: 30 }, { data: 116, ec: 30 }], alignment: [6, 26, 46] },
  {
    version: 10,
    size: 57,
    dataCodewords: 274,
    blocks: [
      { data: 68, ec: 18 },
      { data: 68, ec: 18 },
      { data: 69, ec: 18 },
      { data: 69, ec: 18 },
    ],
    alignment: [6, 28, 50],
  },
];

const EXP = new Uint8Array(512);
const LOG = new Uint8Array(256);

(function initGf() {
  let value = 1;
  for (let i = 0; i < 255; i += 1) {
    EXP[i] = value;
    LOG[value] = i;
    value <<= 1;
    if (value & 0x100) {
      value ^= 0x11d;
    }
  }
  for (let i = 255; i < 512; i += 1) {
    EXP[i] = EXP[i - 255] ?? 0;
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) {
    return 0;
  }
  return EXP[(LOG[a] ?? 0) + (LOG[b] ?? 0)] ?? 0;
}

function rsGenerator(ecCount: number): number[] {
  let poly = [1];
  for (let i = 0; i < ecCount; i += 1) {
    const next = new Array<number>(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j += 1) {
      const coeff = poly[j] ?? 0;
      next[j] = (next[j] ?? 0) ^ coeff;
      next[j + 1] = (next[j + 1] ?? 0) ^ gfMul(coeff, EXP[i] ?? 0);
    }
    poly = next;
  }
  return poly;
}

function reedSolomon(data: readonly number[], ecCount: number): number[] {
  const gen = rsGenerator(ecCount);
  const msg = [...data, ...new Array<number>(ecCount).fill(0)];
  for (let i = 0; i < data.length; i += 1) {
    const coef = msg[i] ?? 0;
    if (coef === 0) {
      continue;
    }
    for (let j = 0; j < gen.length; j += 1) {
      msg[i + j] = (msg[i + j] ?? 0) ^ gfMul(gen[j] ?? 0, coef);
    }
  }
  return msg.slice(data.length);
}

function utf8Bytes(text: string): number[] {
  const encoded = new TextEncoder().encode(text);
  return [...encoded];
}

function bitBuffer(): { bits: number[]; push(value: number, length: number): void } {
  const bits: number[] = [];
  return {
    bits,
    push(value: number, length: number) {
      for (let i = length - 1; i >= 0; i -= 1) {
        bits.push((value >>> i) & 1);
      }
    },
  };
}

function bitsToCodewords(bits: number[], count: number): number[] {
  const padded = [...bits];
  const remainder = padded.length % 8;
  if (remainder > 0) {
    for (let i = 0; i < 8 - remainder; i += 1) {
      padded.push(0);
    }
  }
  const words: number[] = [];
  for (let i = 0; i < padded.length && words.length < count; i += 8) {
    let word = 0;
    for (let b = 0; b < 8; b += 1) {
      word = (word << 1) | (padded[i + b] ?? 0);
    }
    words.push(word);
  }
  const padBytes = [0xec, 0x11];
  let pad = 0;
  while (words.length < count) {
    words.push(padBytes[pad % 2] ?? 0);
    pad += 1;
  }
  return words;
}

function selectVersion(byteLength: number): QrVersion | null {
  const modeBits = 4;
  const lengthBits = (version: number) => (version <= 9 ? 8 : 16);
  for (const spec of QR_L) {
    const capacityBits = spec.dataCodewords * 8;
    const needed = modeBits + lengthBits(spec.version) + byteLength * 8 + 4;
    if (needed <= capacityBits) {
      return spec;
    }
  }
  return null;
}

function functionModules(size: number, alignment: readonly number[]): boolean[][] {
  const reserved = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
  function mark(r: number, c: number) {
    if (r >= 0 && c >= 0 && r < size && c < size) {
      reserved[r]![c] = true;
    }
  }
  function finder(row: number, col: number) {
    for (let r = -1; r <= 7; r += 1) {
      for (let c = -1; c <= 7; c += 1) {
        mark(row + r, col + c);
      }
    }
  }
  finder(0, 0);
  finder(0, size - 7);
  finder(size - 7, 0);
  for (let i = 0; i < size; i += 1) {
    mark(6, i);
    mark(i, 6);
  }
  for (const row of alignment) {
    for (const col of alignment) {
      if ((row === 6 && col === 6) || (row === 6 && col === size - 7) || (row === size - 7 && col === 6)) {
        continue;
      }
      for (let r = -2; r <= 2; r += 1) {
        for (let c = -2; c <= 2; c += 1) {
          mark(row + r, col + c);
        }
      }
    }
  }
  for (let i = 0; i < 9; i += 1) {
    mark(8, i);
    mark(i, 8);
    mark(8, size - 1 - i);
    mark(size - 1 - i, 8);
  }
  mark(8, 8);
  if (size >= 45) {
    for (let i = 0; i < 6; i += 1) {
      for (let j = 0; j < 3; j += 1) {
        mark(i, size - 11 + j);
        mark(size - 11 + j, i);
      }
    }
  }
  return reserved;
}

function placeFinder(grid: boolean[][], row: number, col: number) {
  for (let r = 0; r <= 6; r += 1) {
    for (let c = 0; c <= 6; c += 1) {
      const onOuter = r === 0 || r === 6 || c === 0 || c === 6;
      const inCore = r >= 2 && r <= 4 && c >= 2 && c <= 4;
      grid[row + r]![col + c] = onOuter || inCore;
    }
  }
}

function placeTiming(grid: boolean[][]) {
  const size = grid.length;
  for (let i = 0; i < size; i += 1) {
    grid[6]![i] = i % 2 === 0;
    grid[i]![6] = i % 2 === 0;
  }
}

function placeAlignment(grid: boolean[][], alignment: readonly number[]) {
  const size = grid.length;
  for (const row of alignment) {
    for (const col of alignment) {
      if ((row === 6 && col === 6) || (row === 6 && col === size - 7) || (row === size - 7 && col === 6)) {
        continue;
      }
      for (let r = -2; r <= 2; r += 1) {
        for (let c = -2; c <= 2; c += 1) {
          const onOuter = Math.abs(r) === 2 || Math.abs(c) === 2;
          grid[row + r]![col + c] = onOuter || (r === 0 && c === 0);
        }
      }
    }
  }
}

function maskBit(mask: number, row: number, col: number): boolean {
  switch (mask) {
    case 0:
      return (row + col) % 2 === 0;
    case 1:
      return row % 2 === 0;
    case 2:
      return col % 3 === 0;
    case 3:
      return (row + col) % 3 === 0;
    case 4:
      return (Math.floor(row / 2) + Math.floor(col / 3)) % 2 === 0;
    case 5:
      return ((row * col) % 2) + ((row * col) % 3) === 0;
    case 6:
      return (((row * col) % 2) + ((row * col) % 3)) % 2 === 0;
    default:
      return (((row + col) % 2) + ((row * col) % 3)) % 2 === 0;
  }
}

function bchFormat(data: number): number {
  let rem = data << 10;
  const gen = 0x537;
  for (let i = 14; i >= 10; i -= 1) {
    if ((rem >>> i) & 1) {
      rem ^= gen << (i - 10);
    }
  }
  return ((data << 10) | rem) ^ 0x5412;
}

function placeFormat(grid: boolean[][], mask: number) {
  const bits = bchFormat((0b01 << 3) | mask);
  const size = grid.length;
  for (let i = 0; i < 15; i += 1) {
    const dark = ((bits >>> i) & 1) === 1;
    if (i < 6) {
      grid[i]![8] = dark;
      grid[8]![size - 1 - i] = dark;
    } else if (i === 6) {
      grid[7]![8] = dark;
      grid[8]![size - 1 - i] = dark;
    } else if (i === 7) {
      grid[8]![8] = dark;
      grid[8]![7] = dark;
    } else if (i === 8) {
      grid[8]![7] = dark;
      grid[size - 8]![8] = dark;
    } else {
      grid[8]![14 - i] = dark;
      grid[size - 15 + i]![8] = dark;
    }
  }
  grid[size - 8]![8] = true;
}

function placeData(grid: boolean[][], reserved: boolean[][], codewords: readonly number[], mask: number) {
  const size = grid.length;
  const bits: number[] = [];
  for (const word of codewords) {
    for (let b = 7; b >= 0; b -= 1) {
      bits.push((word >>> b) & 1);
    }
  }
  let bit = 0;
  let upward = true;
  for (let col = size - 1; col > 0; col -= 2) {
    if (col === 6) {
      col -= 1;
    }
    for (let i = 0; i < size; i += 1) {
      const row = upward ? size - 1 - i : i;
      for (const c of [col, col - 1]) {
        if (c < 0 || reserved[row]![c]) {
          continue;
        }
        const raw = bits[bit] === 1;
        grid[row]![c] = maskBit(mask, row, c) ? !raw : raw;
        bit += 1;
      }
    }
    upward = !upward;
  }
}

function interleave(spec: QrVersion, data: readonly number[]): number[] {
  const blocks: { data: number[]; ec: number[] }[] = [];
  let offset = 0;
  for (const block of spec.blocks) {
    const slice = data.slice(offset, offset + block.data);
    offset += block.data;
    blocks.push({ data: slice, ec: reedSolomon(slice, block.ec) });
  }
  const out: number[] = [];
  const maxData = Math.max(...blocks.map((block) => block.data.length));
  for (let i = 0; i < maxData; i += 1) {
    for (const block of blocks) {
      const value = block.data[i];
      if (value !== undefined) {
        out.push(value);
      }
    }
  }
  const maxEc = Math.max(...blocks.map((block) => block.ec.length));
  for (let i = 0; i < maxEc; i += 1) {
    for (const block of blocks) {
      const value = block.ec[i];
      if (value !== undefined) {
        out.push(value);
      }
    }
  }
  return out;
}

export function encodeAcademyQrMatrix(text: string): AcademyQrMatrix | null {
  const payload = utf8Bytes(text);
  const spec = selectVersion(payload.length);
  if (!spec) {
    return null;
  }
  const buf = bitBuffer();
  buf.push(0b0100, 4);
  buf.push(payload.length, spec.version <= 9 ? 8 : 16);
  for (const byte of payload) {
    buf.push(byte, 8);
  }
  buf.push(0, 4);
  const data = bitsToCodewords(buf.bits, spec.dataCodewords);
  const codewords = interleave(spec, data);
  const size = spec.size;
  const reserved = functionModules(size, spec.alignment);
  const grid = Array.from({ length: size }, () => Array.from({ length: size }, () => false));
  placeFinder(grid, 0, 0);
  placeFinder(grid, 0, size - 7);
  placeFinder(grid, size - 7, 0);
  placeTiming(grid);
  placeAlignment(grid, spec.alignment);
  const mask = 0;
  placeData(grid, reserved, codewords, mask);
  placeFormat(grid, mask);
  placeFinder(grid, 0, 0);
  placeFinder(grid, 0, size - 7);
  placeFinder(grid, size - 7, 0);
  return { size, modules: grid };
}

export function academyQrSvg(
  text: string,
  options?: { cell?: number; margin?: number; dark?: string; light?: string },
): string {
  const matrix = encodeAcademyQrMatrix(text);
  const cell = options?.cell ?? 4;
  const margin = options?.margin ?? 2;
  const dark = options?.dark ?? "#0f172a";
  const light = options?.light ?? "#ffffff";
  if (!matrix) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${cell * 8}" height="${cell * 8}" viewBox="0 0 ${cell * 8} ${cell * 8}"><rect width="100%" height="100%" fill="${light}"/></svg>`;
  }
  const dim = (matrix.size + margin * 2) * cell;
  const rects: string[] = [`<rect width="${dim}" height="${dim}" fill="${light}"/>`];
  for (let r = 0; r < matrix.size; r += 1) {
    for (let c = 0; c < matrix.size; c += 1) {
      if (!matrix.modules[r]![c]) {
        continue;
      }
      const x = (c + margin) * cell;
      const y = (r + margin) * cell;
      rects.push(`<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${dark}"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${dim}" height="${dim}" viewBox="0 0 ${dim} ${dim}" shape-rendering="crispEdges">${rects.join("")}</svg>`;
}
