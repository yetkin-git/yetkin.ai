import {
  TEZGAH_FREE_MONTHLY_CREDITS,
  TEZGAH_GUEST_DAILY_LIMIT,
  TEZGAH_PRO_MONTHLY_CREDITS,
} from "@/lib/tezgah/catalog";
import { loadPublicPricingVitrine, type PublicVitrineItem } from "@/lib/pricing/public-vitrine";
import { TRIAL_HEADLINE, TRIAL_HONESTY_LINE, TRIAL_CANCEL_LINE } from "@/lib/pricing/trial-copy";
import { CANONICAL_SITE_ORIGIN, PAGE_SEO } from "@/lib/copy/seo";

/**
 * SEO-02 — `llms.txt` (GEO / AEO).
 *
 * 2026'da AI tarayıcıları (GPTBot, ClaudeBot, PerplexityBot, Google-Extended)
 * için `llms.txt` fiilî standarttır: site hakkında **yapılandırılmış, alıntılanabilir**
 * bir özet. `robots.ts` `*` joker ile bu botları zaten engellemiyordu; eksik olan
 * onlara yol gösteren metindi.
 *
 * Kurallar:
 * - **Fiyat uydurulmaz.** Tutarlar canlı vitrinden (`loadPublicPricingVitrine`)
 *   okunur; katalog satırı yoksa ürün "hazırlanıyor" olarak listelenir ve tutar yazılmaz.
 * - Markdown düz metindir; JSON-LD, script veya HTML gömülmez. AI botu bunu
 *   doğrudan alıntılayabilmeli.
 * - "sen" aksı — marka sesiyle aynı.
 * - `force-dynamic`: katalog tutarı değişince metin de değişir. Statik önbellek
 *   bayat fiyat yayımlar; bu, dürüstlük kuralını bozar.
 */

export const dynamic = "force-dynamic";

function priceCell(item: PublicVitrineItem): string {
  if (item.honesty === "planned" || item.amountMinor == null) {
    return item.statusLabel;
  }
  return item.priceLabel;
}

function productSection(item: PublicVitrineItem, path: string): string[] {
  const lines = [`### ${item.title}`, ""];
  lines.push(item.summary);
  lines.push("");
  lines.push(`- Fiyat: ${priceCell(item)}`);
  lines.push(`- Durum: ${item.honesty === "live" ? "Açık" : "Hazırlanıyor"}`);
  lines.push(`- Adres: ${CANONICAL_SITE_ORIGIN}${path}`);
  if (item.lines && item.lines.length > 0) {
    lines.push("- Kapsam:");
    for (const line of item.lines) {
      lines.push(`  - ${line}`);
    }
  }
  lines.push("");
  return lines;
}

export async function GET() {
  const vitrine = await loadPublicPricingVitrine();
  const body = [
    "# yetkin.ai",
    "",
    "> KOBİ'ler, e-ticaret satıcıları ve profesyoneller için pratik yapay zeka iş araçları.",
    "> Tek hesap; teklif, ürün kartı, hibe dosyası, e-ticaret yönetimi ve doğrulanabilir yetkinlik puanı.",
    "",
    "## Ne yapar",
    "",
    `- **AI Tezgâh**: misafire günde ${TEZGAH_GUEST_DAILY_LIMIT} ücretsiz üretim (kayıt gerekmez); üyeye ayda ${TEZGAH_FREE_MONTHLY_CREDITS} kredi.`,
    "  Teklif, ürün kartı, hibe proje dosyası, site analizi, reklam paketi, pazaryeri kataloğu.",
    `- **AI Tezgâh Pro**: ayda ${TEZGAH_PRO_MONTHLY_CREDITS} kredi, DOCX/ZIP teslim paketleri. Kullanılmayan kredinin %50'si sonraki aya devreder.`,
    "- **E-Ticaret İşletme**: Trendyol ve Hepsiburada tek panelde; stok, sipariş, müşteri sorusu.",
    "- **YetkinHibe**: firma uygunluk analizi ve kurum proje dosyası.",
    "- **YetkinCV**: uygulamalı vaka testi, puan, SWOT ve 30/60/90 planı ücretsizdir. Kamuya açık kariyer kartı ve uzman dizini görünürlüğü tek seferlik ücretlidir; puan satın alınmaz, test sonucundan doğar.",
    "- **Kurumsal İK**: ilan, ağırlıklı yetkinlik testi ve kısa liste.",
    "",
    "## Ürünler ve güncel fiyatlar",
    "",
    "Fiyatlar katalog satırından okunur; satır yoksa tutar yazılmaz.",
    "",
    ...productSection(vitrine.freeStart, PAGE_SEO.tezgah.path),
    ...productSection(vitrine.tezgahPro, PAGE_SEO.pricing.path),
    ...productSection(vitrine.commerce, PAGE_SEO.eTicaret.path),
    ...vitrine.commercePlans.flatMap((plan) => productSection(plan, PAGE_SEO.eTicaret.path)),
    ...productSection(vitrine.grantDossier, PAGE_SEO.pricing.path),
    ...productSection(vitrine.yetkinCv, PAGE_SEO.career.path),
    ...productSection(vitrine.kurumsal, PAGE_SEO.kurumsal.path),
    "## E-Ticaret 30 gün denemesi",
    "",
    `- ${TRIAL_HEADLINE}`,
    `- ${TRIAL_HONESTY_LINE}`,
    `- ${TRIAL_CANCEL_LINE}`,
    "",
    "## Ana sayfalar",
    "",
    `- Ana sayfa: ${CANONICAL_SITE_ORIGIN}/`,
    `- AI Tezgâh: ${CANONICAL_SITE_ORIGIN}${PAGE_SEO.tezgah.path}`,
    `- Fiyatlandırma: ${CANONICAL_SITE_ORIGIN}${PAGE_SEO.pricing.path}`,
    `- E-Ticaret: ${CANONICAL_SITE_ORIGIN}${PAGE_SEO.eTicaret.path}`,
    `- İş akışı rehberi: ${CANONICAL_SITE_ORIGIN}${PAGE_SEO.guide.path}`,
    `- YetkinCV: ${CANONICAL_SITE_ORIGIN}${PAGE_SEO.career.path}`,
    `- Kurumsal: ${CANONICAL_SITE_ORIGIN}${PAGE_SEO.kurumsal.path}`,
    `- Sözlük: ${CANONICAL_SITE_ORIGIN}${PAGE_SEO.sozluk.path}`,
    `- Web site analizi: ${CANONICAL_SITE_ORIGIN}${PAGE_SEO.tetkik.path}`,
    "",
    "## İlkeler",
    "",
    "- Sahte veri yok: referans, logo duvarı ve uydurma sayaç basılmaz.",
    "- Puan satın alınmaz; YetkinCV puanı sunucudaki vaka testi sonucundan doğar.",
    "- Fiyat koddan değil katalog satırından okunur; satır yoksa fiyat basılmaz.",
    "- Kapalı odalar (Akademi, Junior, Freelancer) kamu vitrininde listelenmez.",
    "",
  ].join("\n");

  return new Response(body, {
    status: 200,
    headers: {
      // `text/plain` + utf-8: AI botları ve tarayıcı aynı gövdeyi okur.
      "content-type": "text/plain; charset=utf-8",
      // llms.txt standardı bu yolu kökte bekler; edge/CDN 1 saat tazeler.
      "cache-control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
