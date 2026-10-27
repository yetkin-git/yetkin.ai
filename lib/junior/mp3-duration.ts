/**
 * MP3 süresini ilk kareden okur. Tüm dosyayı PCM'e çözmez.
 * Xing/Info kare sayısı varsa onu, yoksa sabit bit hızı ile dosya boyunu kullanır.
 */

const MPEG1_L3_KBPS = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0];
const MPEG2_L3_KBPS = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0];
const SAMPLE_RATE_V1 = [44100, 48000, 32000];
const SAMPLE_RATE_V2 = [22050, 24000, 16000];
const SAMPLE_RATE_V25 = [11025, 12000, 8000];

function id3v2Size(prefix: Buffer): number {
  if (prefix.length < 10 || prefix.toString("ascii", 0, 3) !== "ID3") {
    return 0;
  }
  const size =
    ((prefix[6]! & 0x7f) << 21) |
    ((prefix[7]! & 0x7f) << 14) |
    ((prefix[8]! & 0x7f) << 7) |
    (prefix[9]! & 0x7f);
  return 10 + size;
}

/**
 * `prefix` dosyanın başıdır. `fileBytes` tüm MP3 boyudur.
 * Çözülemezse `null`.
 */
export function mp3DurationMsFromPrefix(prefix: Buffer, fileBytes: number): number | null {
  if (fileBytes <= 0 || prefix.length < 4) {
    return null;
  }
  const start = id3v2Size(prefix);
  const limit = Math.min(prefix.length - 4, start + 8192);
  for (let index = Math.max(0, start); index < limit; index += 1) {
    if (prefix[index] !== 0xff || (prefix[index + 1]! & 0xe0) !== 0xe0) {
      continue;
    }
    const headerB = prefix[index + 1]!;
    const headerC = prefix[index + 2]!;
    const versionBits = (headerB >> 3) & 0x3;
    const layerBits = (headerB >> 1) & 0x3;
    if (versionBits === 1 || layerBits !== 1) {
      continue;
    }
    const bitrateIndex = (headerC >> 4) & 0xf;
    const sampleRateIndex = (headerC >> 2) & 0x3;
    if (bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) {
      continue;
    }
    const mpeg1 = versionBits === 3;
    const mpeg25 = versionBits === 0;
    const bitrateKbps = (mpeg1 ? MPEG1_L3_KBPS : MPEG2_L3_KBPS)[bitrateIndex] ?? 0;
    const sampleRate = mpeg1
      ? SAMPLE_RATE_V1[sampleRateIndex]
      : mpeg25
        ? SAMPLE_RATE_V25[sampleRateIndex]
        : SAMPLE_RATE_V2[sampleRateIndex];
    if (!bitrateKbps || !sampleRate) {
      continue;
    }
    const samplesPerFrame = mpeg1 ? 1152 : 576;
    const channelMode = (prefix[index + 3]! >> 6) & 0x3;
    const sideInfoBytes = mpeg1 ? (channelMode === 3 ? 17 : 32) : channelMode === 3 ? 9 : 17;
    const xingAt = index + 4 + sideInfoBytes;
    if (xingAt + 16 <= prefix.length) {
      const tag = prefix.toString("ascii", xingAt, xingAt + 4);
      if ((tag === "Xing" || tag === "Info") && prefix.readUInt32BE(xingAt + 4) & 1) {
        const frames = prefix.readUInt32BE(xingAt + 8);
        if (frames > 0) {
          return Math.round((frames * samplesPerFrame * 1000) / sampleRate);
        }
      }
    }
    const audioBytes = Math.max(0, fileBytes - index);
    return Math.round((audioBytes * 8 * 1000) / (bitrateKbps * 1000));
  }
  return null;
}
