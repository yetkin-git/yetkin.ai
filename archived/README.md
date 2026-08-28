# archived — donmuş oda tarihi

Bu klasör **git tarihi ve motor testi** içindir. Amiral derleme yüzeyi değildir.

- HTTP 410 kenarda basılır (`proxy.ts` + `isFrozenRoomApi` / `isFrozenShellPagePath`).
- `tsconfig.json` `archived/` dizinini typecheck dışı tutar.
- Vitest, `@/lib/{oda}` takma adını `archived/lib/{oda}` çevirir; canlı derleme tavanı 4 odadır.
- Canlı yeşil `tests/` (410 dizinleri `vitest.config.ts` exclude). Donmuş oda testleri `npm run test:frozen`.
- Prisma donmuş 23 model **P3’te şemadan düşer**. DROP migrasyonu yedek sonrası uygulanır; bu klasörü silmek DROP değildir.
- **SEN 410 kopyası:** `archived/lib/copy/sen-voice/` — canlı barrel (`lib/copy/sen-voice/index.ts`) basmaz; ince re-export stub’lar eski import yolunu tutar.

Geri açmak ürün kararıdır; `VERTICAL_ROOMS` dizisine yapıştırmak yetmez.
