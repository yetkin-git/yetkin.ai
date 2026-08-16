import "server-only";

import type { LlmProviderAdapter } from "@/lib/kernel/ai/types";

/**
 * Egemen model yuvası — tipli, boş envanter tablosu değil.
 * Sağlayıcı bağlı değilken sahte metin üretmez.
 */
export const sovereignProvider: LlmProviderAdapter = {
  id: "sovereign",
  async complete() {
    throw new Error("Sovereign sağlayıcı yapılandırılmadı.");
  },
};
