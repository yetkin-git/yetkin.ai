import { z } from "zod";
import {
  DUKKAN_SECTORS,
  DUKKAN_TONES,
  type DukkanSectorId,
  type DukkanToneId,
} from "@/lib/tezgah/dukkan/copy";

const shortText = z.string().trim().min(2).max(80);

function enumIds<T extends string>(ids: readonly T[]): [T, ...T[]] {
  const [first, ...rest] = ids;
  if (!first) {
    throw new Error("Dükkan listesi boş.");
  }
  return [first, ...rest];
}

const sectorIds = enumIds(DUKKAN_SECTORS.map((sector) => sector.id));
const toneIds = enumIds(DUKKAN_TONES.map((tone) => tone.id));

export const dukkanGenerateRequestSchema = z
  .strictObject({
    businessName: shortText,
    sector: z.enum(sectorIds),
    place: shortText,
    whatsapp: z.string().trim().min(10).max(32),
    services: z.string().trim().min(2).max(450),
    tone: z.enum(toneIds),
  })
  .superRefine((value, ctx) => {
    if (!normalizeDukkanWhatsapp(value.whatsapp)) {
      ctx.addIssue({ code: "custom", path: ["whatsapp"], message: "numara" });
    }
    if (!parseDukkanServices(value.services)) {
      ctx.addIssue({ code: "custom", path: ["services"], message: "hizmet" });
    }
  });

export type DukkanGenerateRequest = z.infer<typeof dukkanGenerateRequestSchema>;

export type DukkanDraft = {
  businessName: string;
  sector: DukkanSectorId;
  place: string;
  whatsapp: string;
  services: string[];
  tone: DukkanToneId;
};

/** `05xx`, `5xx` ve `90…` biçimleri `90` + 10 haneli cep numarasına iner. */
export function normalizeDukkanWhatsapp(raw: string): string | null {
  const trimmed = raw.trim();
  if (!/^[\d\s+\-()]+$/.test(trimmed)) {
    return null;
  }
  const digits = trimmed.replace(/\D/g, "");
  let national = "";
  if (digits.length === 12 && digits.startsWith("90")) {
    national = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    national = digits.slice(1);
  } else if (digits.length === 10) {
    national = digits;
  } else {
    return null;
  }
  if (!/^5\d{9}$/.test(national)) {
    return null;
  }
  return `90${national}`;
}

/** Satır satır 3–5 hizmet. Boş satır sayılmaz. */
export function parseDukkanServices(raw: string): string[] | null {
  const lines = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
  if (lines.length < 3 || lines.length > 5) {
    return null;
  }
  if (lines.some((line) => line.length < 2 || line.length > 80)) {
    return null;
  }
  return lines;
}

export function readDukkanDraft(input: DukkanGenerateRequest): DukkanDraft | null {
  const whatsapp = normalizeDukkanWhatsapp(input.whatsapp);
  const services = parseDukkanServices(input.services);
  if (!whatsapp || !services) {
    return null;
  }
  return {
    businessName: input.businessName.trim(),
    sector: input.sector,
    place: input.place.trim(),
    whatsapp,
    services,
    tone: input.tone,
  };
}
