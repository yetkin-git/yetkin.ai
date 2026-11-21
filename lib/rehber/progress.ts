import "server-only";

import { loadOwnerStores } from "@/lib/commerce/cockpit-load";
import { getSession } from "@/lib/kernel/auth/session";
import { readTezgahProActive } from "@/lib/tezgah/paid-lane";
import { readHibeCommandCounts } from "@/lib/yetkinhibe/os-load";
import type { WorkflowModuleId, WorkflowProgress } from "@/lib/rehber/workflows";

/**
 * /rehber canlı durum okuyucusu.
 *
 * Kural: **asla fırlatmaz.** Oturum yoksa, veritabanı düşükse, tablo yoksa veya
 * herhangi bir port hata verirse ziyaretçi görünümüne (`completed: []`) düşer.
 * Hiçbir yazma yapmaz; yalnız okur. Bu yüzden kamu sayfası DB'nin sağlığına bağlanmaz.
 *
 * Eşikler gerçek veriden türetilir, tahmin edilmez:
 * - E-Ticaret Adım 1-2: kullanıcının en az bir mağazası varsa (kanal bağlantısı mağaza
 *   kaydını gerektirir). Mağaza yoksa hiçbir adım işaretlenmez.
 * - Tezgâh Adım 2: aktif Pro aboneliği varsa.
 * - Hibe Adım 1-2: kayıtlı işletme profili varsa.
 * - Kariyer Adım 1-2: en az bir vize damgası varsa.
 */

const GUEST: WorkflowProgress = { completed: [], note: null };

type Reader = {
  completed: number[];
  note: string | null;
};

function progressFrom(reader: Reader): WorkflowProgress {
  return { completed: [...new Set(reader.completed)].sort((a, b) => a - b), note: reader.note };
}

export async function readWorkflowProgress(): Promise<
  Partial<Record<WorkflowModuleId, WorkflowProgress>>
> {
  const empty: Partial<Record<WorkflowModuleId, WorkflowProgress>> = {
    ecommerce: GUEST,
    hibe: GUEST,
    tezgah: GUEST,
    career: GUEST,
  };

  let session: { id: string } | null = null;
  try {
    session = await getSession();
  } catch {
    return empty;
  }
  if (!session?.id) {
    return empty;
  }

  const userId = session.id;

  const [stores, proActive, hibe, career] = await Promise.all([
    loadOwnerStores(userId).catch(() => ({ kind: "down" as const })),
    readTezgahProActive(userId).catch(() => false),
    readHibeCommandCounts(userId).catch(() => ({ live: false, profiles: 0, dossiers: 0 })),
    loadCareerStampCount(userId),
  ]);

  const hasStore = stores.kind === "ok" && stores.value.length > 0;
  const storeCount = stores.kind === "ok" ? stores.value.length : 0;

  return {
    ecommerce: hasStore
      ? progressFrom({
          completed: [1, 2],
          note: `${storeCount} mağaza bağlı. Katalog eşleştirmesi panelde.`,
        })
      : GUEST,
    hibe:
      hibe.live && hibe.profiles > 0
        ? progressFrom({
            completed: [1, 2],
            note:
              hibe.dossiers > 0
                ? `${hibe.profiles} işletme profili, ${hibe.dossiers} proje dosyası hazır.`
                : `${hibe.profiles} işletme profili kayıtlı. Eşleştirme hazır.`,
          })
        : GUEST,
    tezgah: proActive
      ? progressFrom({ completed: [1, 2], note: "Tezgâh Pro aktif." })
      : GUEST,
    career:
      career > 0
        ? progressFrom({
            completed: [1, 2],
            note: `${career} doğrulanmış damga sicilde.`,
          })
        : GUEST,
  };
}

/**
 * Kariyer damga sayısı. Doğrudan `lib/career/load` kullanılır; heal yazmasın diye
 * yalnız okuma yapan nabız okunur. Hata sessizce 0'a düşer.
 */
async function loadCareerStampCount(userId: string): Promise<number> {
  try {
    const { loadCareerLivePulse } = await import("@/lib/career/load");
    const pulse = await loadCareerLivePulse(userId);
    return pulse?.visaCount ?? 0;
  } catch {
    return 0;
  }
}
