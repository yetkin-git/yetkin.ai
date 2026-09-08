/**

 * Müfredat kimliği — Modüler Monolit çekirdek sözleşmesi.

 * Yalnız canlı SKU halkaları. Kariyer ve freelancer lib/academy import etmez.

 *

 * Boş vitrin: canlı pathway yok.

 */



export const ACADEMY_PATHWAY_IDS = [] as const;



export type AcademyPathwayId = (typeof ACADEMY_PATHWAY_IDS)[number];



const PATHWAY_ID_SET = new Set<string>(ACADEMY_PATHWAY_IDS);



export function isAcademyPathwayId(value: string): value is AcademyPathwayId {

  return PATHWAY_ID_SET.has(value);

}



export function parseAcademyPathwayId(value: string | null | undefined): AcademyPathwayId | null {

  if (!value) {

    return null;

  }

  return isAcademyPathwayId(value) ? value : null;

}



/** Vize / ilan tabelası — halka sırası (Temel → Orta → İleri). Pedagoji etiketi değildir. */

export type CatalogPathwayRings = {

  Temel: string;

  Orta?: string;

  İleri?: string;

};



/**
 * Boş vitrin dürüst tipi: canlı pathway henüz olmadığından `AcademyPathwayId = never`.
 * Sabitler tüketicilerde `never` çelişkisi üretmemesi için `Record<string, ...>` olarak
 * geniş ilan edilir; `satisfies` gelecekte halka eklendiğinde eksik girişi derleme
 * zamanında yakalamaya devam eder.
 */
export const ACADEMY_PATHWAY_TITLES: Readonly<Record<string, string>> = {} satisfies Record<
  AcademyPathwayId,
  string
>;



export const ACADEMY_PATHWAY_RINGS: Readonly<Record<string, CatalogPathwayRings>> = {} satisfies Record<
  AcademyPathwayId,
  CatalogPathwayRings
>;



export function catalogPathwayTitleById(id: string): string | null {

  if (!isAcademyPathwayId(id)) {

    return null;

  }

  return ACADEMY_PATHWAY_TITLES[id] ?? null;

}



export function catalogPathwayRingSlugs(pathwayId: AcademyPathwayId): string[] {

  const rings = ACADEMY_PATHWAY_RINGS[pathwayId];

  if (!rings) {

    return [];

  }

  const slugs: string[] = [rings.Temel];

  if (rings.Orta) {

    slugs.push(rings.Orta);

  }

  if (rings.İleri) {

    slugs.push(rings.İleri);

  }

  return slugs;

}


