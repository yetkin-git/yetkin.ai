import {
  FREELANCER_JOB_MAX_MINOR,
  FREELANCER_JOB_MIN_MINOR,
} from "@/lib/freelancer/schemas";
import { PLATFORM_TREASURY_USER_ID } from "@/lib/kernel/escrow/engine";
import { SETTLEMENT_CURRENCY } from "@/lib/kernel/money/currency";
import { HOLD_BPS_DEFAULT, HOLD_BPS_MAX, HOLD_BPS_MIN } from "@/lib/kernel/pricing/hold-bps";

/**
 * Ops freelancer vitrin tohum sicili (ADIM 11).
 * İlan tutarı `freelancer_jobs.budget_minor` satırındadır; katalog taban/hold
 * bandı Admin sicilidir (S11-A). Motor bütçe bandını hâlâ kod sabitinden keser.
 * SQL: `supabase/migrations/20260814110000_freelancer_job_seed.sql`.
 * Sahte bid / sözleşme / EscrowHold / vize / cüzdan bakiyesi yok.
 */
export type FreelancerCatalogSeed = {
  id: string;
  unitKey: string;
  unitType: "MINOR" | "BPS";
  seedAmountMinor: number;
  seedMinMinor: number;
  seedMaxMinor: number;
  description: string;
};

export type FreelancerJobSeed = {
  id: string;
  title: string;
  brief: string;
  budgetMinor: number;
};

export const FREELANCER_SEED_MODULE_KEY = "freelancer" as const;

export const FREELANCER_SEED_CURRENCY = SETTLEMENT_CURRENCY;

/** Hazine sentinel — Auth login değildir. Sahte kullanıcı INSERT yok. */
export const FREELANCER_SEED_CLIENT_ID = PLATFORM_TREASURY_USER_ID;

export const FREELANCER_JOB_FLOOR_UNIT_KEY = "job-posting:floor" as const;

export const FREELANCER_ESCROW_HOLD_UNIT_KEY = "escrow:hold" as const;

export const FREELANCER_CATALOG_SEEDS: readonly FreelancerCatalogSeed[] = [
  {
    id: "cat_freelancer_job_posting_floor",
    unitKey: FREELANCER_JOB_FLOOR_UNIT_KEY,
    unitType: "MINOR",
    seedAmountMinor: FREELANCER_JOB_MIN_MINOR,
    seedMinMinor: FREELANCER_JOB_MIN_MINOR,
    seedMaxMinor: FREELANCER_JOB_MAX_MINOR,
    description: "Freelancer mühürlü ilan bütçe tabanı / tavanı.",
  },
  {
    id: "cat_freelancer_escrow_hold",
    unitKey: FREELANCER_ESCROW_HOLD_UNIT_KEY,
    unitType: "BPS",
    seedAmountMinor: HOLD_BPS_DEFAULT,
    seedMinMinor: HOLD_BPS_MIN,
    seedMaxMinor: HOLD_BPS_MAX,
    description: "Freelancer emanet platform hold bandı (1000–1500 bps).",
  },
];

export const FREELANCER_JOB_SEEDS: readonly FreelancerJobSeed[] = [
  {
    id: "fj_rail_icon_set",
    title: "Yapay Zekâ Destekli İkon ve İllüstrasyon Seti Teslimi",
    brief:
      "Alıcı: Yetkin Rail (platform kendi ihtiyacı; organik talep değildir). Dikey: yapay zekâ destekli içerik ve görsel üretim. Teklif Kariyer Vizesi (akademi sertifikası) ister. Kapsam: 16 adet tek renk SVG ikon (12 oda + 4 sığınak). 24px ızgara, 2px stroke, Quiet Luxury. Lucide, geist ve hazır set yok. Her ikon yerel SVG; dış CDN yok. Yaşayan illustratör tarzı taklidi yok. Teslim (DELIVERY): SVG kaynak + 256px PNG önizleme, ad kuralı is-anahtari.svg, her dosya SHA-256 listesi, kilitli prompt paketi (negatif kısıt, ızgara, palet). İki revizyon turu. Tur 3 yeni emanet farkı ister. Bütçe emanete teklif kabulünde kilitlenir. Sahte settlement yok.",
    budgetMinor: 850_000,
  },
  {
    id: "fj_rail_ql_banners",
    title: "Rail Quiet Luxury Tanıtım Görselleri ve Banner Üretimi",
    brief:
      "Alıcı: Yetkin Rail. Dikey: yapay zekâ destekli içerik ve görsel üretim. Teklif Kariyer Vizesi ister. Bu iş platformun kendi tanıtım yüzeyi içindir; organik talep diye sunulmaz. Kapsam: üç ölçü — 1440x480 web üst şerit, 1080x1080 kare, 1200x630 paylaşım kartı. Metin: Öğrendiğini mühürle. Mührün kapıyı açsın. İşin emanette dursun. Stok insan fotoğrafı yok. Lucide ikon, geist font, dekoratif ilerleme çubuğu ve cam efekti düşer. Sistem tipi, yerel SVG, sükûnet. Teslim: PNG + kaynak prompt paketi, her dosya SHA-256, palet hex listesi. İki revizyon. Ölçülemeyen daha pop isteği kısıta çevrilmeden üretilmez. Bütçe kabulde EscrowHold ile kilitlenir.",
    budgetMinor: 750_000,
  },
  {
    id: "fj_rail_academy_copy",
    title: "Akademi Müfredat Özet Metinlerinin Düzenlenmesi",
    brief:
      "Alıcı: Yetkin Rail. Dikey: yapay zekâ destekli içerik ve görsel üretim. Teklif Kariyer Vizesi ister. İş, yz-icerik-gorsel-uretim kursunun beş ders özetini vatandaş diline çekmektir; sınav şıklarını sızdırmaz. Kapsam: Brief Okuma, Telif/Kullanım Hakları, Prompt Disiplini, Revizyon Yönetimi, Teslim Şartnamesi. Her özet 120-180 sözcük. SEN aksı: sen, siz değil. cüzdanınız, hesabınız, hoş geldiniz yasak. Satın al belge basmaz; baraj 70 ve SHA-256 mühür ders metninde doğru kalır. Teslim: tek Markdown, ders sırası tohumla aynı, SHA-256. İki revizyon. Yeni ders icat edilmez (CMS yok). Bütçe kabulde emanete kilitlenir.",
    budgetMinor: 350_000,
  },
  {
    id: "fj_rail_devlabs_prompts",
    title: "DevLabs Örnek Prompt Şablonları Dokümantasyonu",
    brief:
      "Alıcı: Yetkin Rail. Dikey: yapay zekâ destekli içerik ve görsel üretim. Teklif Kariyer Vizesi ister. DevLabs linter'dır, runner değildir; exec yoktur. Şablon komutu tarif eder, sunucuda çalıştırmaz. Kapsam: 8 kilitli prompt paketi (hedef, negatif kısıt, kabul ölçütü, yasak girdi). Konular: ikon ızgarası, Quiet Luxury banner, SEN metin, hash listesi, brief çelişkisi, telif fail-closed, revizyon deltası, teslim checklist. Gizli anahtar, vatandaş kimliği ve bakiye prompta girmez. Teslim: tek Markdown, her şablon ayrı başlık, dosya SHA-256. İki revizyon. Exec örneği, çalıştır butonu ve sahte runner düşer. Bütçe kabulde emanete kilitlenir.",
    budgetMinor: 400_000,
  },
  {
    id: "fj_rail_seal_social",
    title: "Mühürlü Kanıt Sosyal Medya Şablon Tasarımları",
    brief:
      "Alıcı: Yetkin Rail. Dikey: yapay zekâ destekli içerik ve görsel üretim. Teklif Kariyer Vizesi ister. YetkinX sosyal ağ değildir; beğeni, takipçi, boost yok. Şablon, /academy/dogrula/[hash] kamu doğrulamasını taşır. userId sızmaz. Hash 64 hex görünür. Kapsam: 1080x1080 ve 1200x630, iki tema (açık/koyu). Cümle: Kanıt burada. Rail kendini tanıtmaz. Quiet Luxury: hazır ikon seti, geist, ilerleme çubuğu yok. Vanity metrik (görüntülenme, beğeni) yüzeye girmez. Teslim: PNG + katman notu + prompt paketi + her dosya SHA-256. İki revizyon. Filigran finalde yok. Bütçe kabulde emanete kilitlenir. Bu ilan Yetkin Rail kendi kanıt yüzeyi içindir.",
    budgetMinor: 600_000,
  },
];

export function freelancerJobSeedById(id: string): FreelancerJobSeed | undefined {
  return FREELANCER_JOB_SEEDS.find((row) => row.id === id);
}
