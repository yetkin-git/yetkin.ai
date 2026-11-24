import type { GrantProgramSource } from "@/lib/yetkinhibe/types";
import { KOSGEB_IS_PLANI } from "@/lib/yetkinhibe/templates/kosgeb-is-plani";
import { TUBITAK_PRODIS_1501 } from "@/lib/yetkinhibe/templates/tubitak-prodis-1501";
import { TUBITAK_PRODIS_1507 } from "@/lib/yetkinhibe/templates/tubitak-prodis-1507";
import { TICARET_IHRACAT } from "@/lib/yetkinhibe/templates/ticaret-ihracat";
import { KAYS_KALKINMA } from "@/lib/yetkinhibe/templates/kays-kalkinma";
import { TKDK_IPARD } from "@/lib/yetkinhibe/templates/tkdk-ipard";
import type { GrantInstitutionTemplate } from "@/lib/yetkinhibe/templates/types";

export type { GrantInstitutionTemplate } from "@/lib/yetkinhibe/templates/types";

const AGENCY_PREFIXES = [
  "istka",
  "izka",
  "bebka",
  "geka",
  "mevka",
  "karacadag",
  "ankaraka",
  "marka",
  "kays",
] as const;

/** Kimliği kurum şablonuna düşmeyen çağrı. Kimlik metne yazılmaz. */
const UNMAPPED: GrantInstitutionTemplate = {
  id: "kurum-secilemedi",
  title: "Kurum şablonu seçilemedi",
  sections: [{ id: "baslik", title: "Kurum başlıkları", required: true }],
  requiredFields: [{ id: "baslik", label: "Kurum başlığı katalog kimliğinden seçilemedi", required: true }],
  workPackages: [
    { id: "genel", name: "Genel iş paketi", successMeasure: "Kurum başlığı seçilmeden ölçüt yazılmaz." },
  ],
  successCriteriaLabel: "Başarı ölçütü: kurum şablonu seçilmeden iddia yazılmaz.",
};

const BY_ID = new Map<string, GrantInstitutionTemplate>(
  [KOSGEB_IS_PLANI, TUBITAK_PRODIS_1501, TUBITAK_PRODIS_1507, TICARET_IHRACAT, KAYS_KALKINMA, TKDK_IPARD, UNMAPPED].map(
    (template) => [template.id, template],
  ),
);

export function templateById(id: string | null | undefined): GrantInstitutionTemplate | null {
  if (!id) {
    return null;
  }
  return BY_ID.get(id) ?? null;
}

function sourceFromGrantId(grantId: string): GrantProgramSource | null {
  if (grantId.startsWith("kosgeb")) {
    return "KOSGEB";
  }
  if (grantId.startsWith("tubitak")) {
    return "TUBITAK";
  }
  if (grantId.startsWith("ticaret")) {
    return "TICARET_BAKANLIGI";
  }
  if (grantId.startsWith("tkdk") || grantId.includes("ipard")) {
    return "TKDK_IPARD";
  }
  if (grantId.startsWith("tarim")) {
    return "TARIM_BAKANLIGI";
  }
  if (grantId.startsWith("sanayi")) {
    return "SANAYI_BAKANLIGI";
  }
  if (grantId.startsWith("iskur")) {
    return "ISKUR";
  }
  if (grantId.startsWith("ab-")) {
    return "AB_FONLARI";
  }
  if (AGENCY_PREFIXES.some((prefix) => grantId.startsWith(prefix))) {
    return "KALKINMA_AJANSI";
  }
  return null;
}

function isSource(value: string | null | undefined): value is GrantProgramSource {
  return (
    value === "KOSGEB" ||
    value === "TUBITAK" ||
    value === "TICARET_BAKANLIGI" ||
    value === "KALKINMA_AJANSI" ||
    value === "TKDK_IPARD" ||
    value === "TARIM_BAKANLIGI" ||
    value === "SANAYI_BAKANLIGI" ||
    value === "ISKUR" ||
    value === "AB_FONLARI"
  );
}

/**
 * Çağrı kimliği ve kaynak şablonu seçer.
 * 1501 sanayi dosyası, 1507 KOBİ dosyasıdır. Diğer TÜBİTAK kodları 1501 iskeletine düşer;
 * 1512 ve 1812 KOBİ çizgisinde 1507 iskeletini kullanır.
 */
export function templateForGrant(input: {
  grantId: string;
  source?: string | null;
  title?: string | null;
}): GrantInstitutionTemplate {
  const grantId = input.grantId.trim().toLowerCase();
  const blob = `${grantId} ${(input.title ?? "").toLowerCase()}`;
  if (blob.includes("1501")) {
    return TUBITAK_PRODIS_1501;
  }
  if (blob.includes("1507") || blob.includes("1512") || blob.includes("1812")) {
    return TUBITAK_PRODIS_1507;
  }
  const source = isSource(input.source) ? input.source : sourceFromGrantId(grantId);
  if (source === "KOSGEB" || source === "SANAYI_BAKANLIGI" || source === "ISKUR") {
    return KOSGEB_IS_PLANI;
  }
  if (source === "TUBITAK") {
    return TUBITAK_PRODIS_1501;
  }
  if (source === "TICARET_BAKANLIGI") {
    return TICARET_IHRACAT;
  }
  if (source === "KALKINMA_AJANSI" || source === "AB_FONLARI") {
    return KAYS_KALKINMA;
  }
  if (source === "TKDK_IPARD" || source === "TARIM_BAKANLIGI") {
    return TKDK_IPARD;
  }
  return UNMAPPED;
}

/** Şablon ağacı. Tutar basılmaz. */
export function templateOutline(templateId: string | null | undefined): readonly string[] {
  const template = templateById(templateId);
  if (!template) {
    return [];
  }
  return [
    template.title,
    ...template.sections.map((section) => (section.required ? `${section.title} (zorunlu)` : section.title)),
    ...template.requiredFields.map((field) => field.label),
    ...template.workPackages.map((row) => `${row.name} — ${row.successMeasure}`),
    template.successCriteriaLabel,
  ];
}
