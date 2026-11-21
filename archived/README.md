# archived — donmuş oda tarihi

Bu klasör **git tarihi ve motor testi** içindir. Amiral derleme yüzeyi değildir.

- HTTP 410 kenarda basılır (`proxy.ts` + `isFrozenRoomApi` / `isFrozenShellPagePath`).
- `tsconfig.json` `archived/` dizinini typecheck dışı tutar.
- Vitest, `@/lib/{oda}` takma adını `archived/lib/{oda}` çevirir; canlı derleme tavanı 4 odadır.
- Canlı yeşil `tests/` (410 dizinleri `vitest.config.ts` exclude). Donmuş oda testleri `npm run test:frozen`.
- Prisma donmuş 23 model **P3’te şemadan düşer**. DROP migrasyonu yedek sonrası uygulanır; bu klasörü silmek DROP değildir.
- **SEN 410 kopyası:** `archived/lib/copy/sen-voice/` — canlı barrel (`lib/copy/sen-voice/index.ts`) basmaz; ince re-export stub’lar eski import yolunu tutar.

## `archived/academy/` — kullanılmayan Akademi modülü

Akademi odası canlı derleme ve test yükünden çıkarıldı. Kayıt defteri satırı
(`lib/dronlar/kayit.ts`, `kapali: true`) ve kenar 410'u **durur**; `/academy/*`
adresleri `isFrozenShellPagePath` ile 410 dönmeye devam eder.

| Yol | İçerik |
|---|---|
| `archived/academy/app/` | Eski `app/academy` sayfa ağacı (20 dosya) |
| `archived/academy/components/` | Kullanılmayan 50 Akademi bileşeni |
| `archived/academy/tests/` | Eski `tests/academy` (147 dosya, 653 test) |
| `archived/academy/lib/` | Yalnız artık import edilmeyen 2 modül |

Canlı ağaçta **kalan** Akademi dosyaları bilerek durur: `lib/academy/**` (canlı
ticari akışa bağlı 234 modül), `components/academy/` içindeki 6 bileşen ve
`app/api/academy/**` rotaları. Canlı kod `archived/` içinden import **etmez**;
kural `tests/kernel/academy-archive-surface.test.ts` ile mühürlüdür.

- `npm test` arşivi koşmaz (`vitest.config.ts` → `archived/**` exclude).
- `npm run test:frozen` arşiv Akademi testlerini `archived/academy/tests` altından koşar
  (147 dosya / 653 test yeşil).

Geri açmak ürün kararıdır; `VERTICAL_ROOMS` dizisine yapıştırmak yetmez.

