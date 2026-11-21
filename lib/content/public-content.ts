/**
 * Kamu içerik yüzeylerinin (sözlük, rehber, yasal) okuma yolu.
 *
 * Tespit §5.5: bu sayfaların verisi tamamen dosya sabitlerinden gelir ama her
 * istekte aynı iş yeniden yapılıyordu. Ağır olan kısım sayfa derlemesi değil
 * **kayıt çözümü ve dizin taraması**dır; ikisi de burada tek kez hesaplanır ve
 * süreç içi önbelleğe alınır (`lib/content/cache.ts`).
 *
 * Sayfa gövdesi istek anında nonce CSP ile basılmaya devam eder; bu katman
 * yalnız veriyi paylaşır. Yetkilendirme, oturum veya çerez burada okunmaz.
 */

import { createContentCache } from "@/lib/content/cache";
import {
  GLOSSARY_TERMS,
  glossaryPath,
  glossaryTerm,
  type GlossaryTerm,
} from "@/lib/copy/glossary";
import { PUBLIC_GUIDES, guidePath, publicGuide, type PublicGuide } from "@/lib/copy/guides";
import {
  LEGAL_LAUNCH_SECTIONS,
  legalSectionBySlug,
  type LegalLaunchSection,
} from "@/lib/copy/legal-launch";

const cache = createContentCache<unknown>();

/** Test/operasyon kancası — dağıtımda zaten boşalır. */
export function clearPublicContentCache(): void {
  cache.clear();
}

export function loadGlossaryTerms(): Promise<readonly GlossaryTerm[]> {
  return cache.read("glossary:terms", () => GLOSSARY_TERMS) as Promise<readonly GlossaryTerm[]>;
}

export async function loadGlossaryTerm(slug: string): Promise<GlossaryTerm | null> {
  const key = `glossary:term:${slug}`;
  return cache.read(key, () => glossaryTerm(slug)) as Promise<GlossaryTerm | null>;
}

export function glossaryEntryPath(slug: string): string {
  return glossaryPath(slug);
}

export function loadPublicGuides(): Promise<readonly PublicGuide[]> {
  return cache.read("guides:all", () => PUBLIC_GUIDES) as Promise<readonly PublicGuide[]>;
}

export async function loadPublicGuide(slug: string): Promise<PublicGuide | null> {
  const key = `guides:guide:${slug}`;
  return cache.read(key, () => publicGuide(slug)) as Promise<PublicGuide | null>;
}

export function guideEntryPath(slug: string): string {
  return guidePath(slug);
}

export function loadLegalSections(): Promise<readonly LegalLaunchSection[]> {
  return cache.read("legal:sections", () => LEGAL_LAUNCH_SECTIONS) as Promise<readonly LegalLaunchSection[]>;
}

export async function loadLegalSection(slug: string): Promise<LegalLaunchSection | null> {
  const key = `legal:section:${slug}`;
  return cache.read(key, () => legalSectionBySlug(slug) ?? null) as Promise<LegalLaunchSection | null>;
}
