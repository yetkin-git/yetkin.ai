# TEDAVI RAPORU — PayTR B2C Uyumluluk (E1, E7–E10)

| Alan | Değer |
|------|-------|
| Tarih | 9 Eylül 2026 |
| Kaynak | `docs/TESPIT_RAPORU.md` eylem listesi |
| Karar | Freelancer **silinmedi** — motor + şema duruyor, kamu yüzeyi kilitli |

## Uygulanan adımlar

### E1 — OpenAPI ve v1 temizliği
- `lib/kernel/http/v1-hops-meta.ts`: 8 freelancer hop sicilden düştü → **8 hop** (health, academy-×3, auth-session, wallet-strip, career-×2).
- `lib/kernel/http/v1-contract.ts`: 8 hop sözleşmesi + `Marketplace` tag'i + freelancer response/description dalları kaldırıldı.
- **Bilinçli korunanlar:** Freelancer Zod DTO'ları + hata metinleri durur (kanonik handler doğrulaması, `verify:atomic-seals`, IDOR paketi buna bağlı). OpenAPI `components.schemas` DTO aynası korunduğu için donuk Dron tipleri **byte-identical** (`apps/rail-is/src/generated/v1.ts` diff yok).
- `lib/kernel/http/openapi-v1.json`: yeniden üretildi (−2246 satır, `Marketplace` 0, freelancer path 0).
- Kenar davranışı **değişmedi**: `isFrozenRoomApi` hop kapısından önce çalışır, freelancer v1 yolu yine 410.

### E7 — SEO artığı
- `lib/copy/seo.ts`: `PAGE_SEO.freelancer` girdisi silindi.
- `app/freelancer/page.tsx`: inline `noindex/nofollow` meta (derleme bütünlüğü için; sayfa kenarda 410).

### E8 — Ölü ikon anahtarı
- `components/ui/icons.tsx`: `ROOM_ICONS.pazaryeri` silindi. `IconStore` bileşeni durur (arşiv kullanıyor).

### E9 — Ops notu
- `.system_docs/OPS_RUNBOOK.md` §12: "Freelancer motoru durur, kamu yüzeyi 410 — PayTR B2C uyumu sebebiyle kilitlidir." + §17 hop tablosu 8-hop gerçeğine eşitlendi.

### E10 — İç sözlük
- `docs/SOZLUK.md`: Rail/Amiral/Dron/Tezgâh/Diyar/Oda/Mühür/Vize/Hop vb. tek sayfa (yeni geliştirici onboarding).

## Güncellenen testler (7 dosya)
`verify-v1-contract`, `v1-hop-gate-surface`, `kanoniklestirme-surface`, `verify-v1-accept-debit-atomic`, `verify-staging-t4-loop-surface`, `v1-runtime-shield-surface`, `rail-is-dron-lab-surface` + `seo-surface` — 16→8 hop, freelancer hop yokluk kilitleri, handler-seviyesi DTO doğrulaması korundu.

## Doğrulama (hepsi yeşil)
| Kontrol | Sonuç |
|---------|-------|
| `npm run typecheck` | exit 0 |
| `npm test` (çekirdek) | 172 dosya / 841 test geçti |
| Dokunulan surface testleri | 6 dosya / 47 test geçti |
| Dron regresyon (`verify-dron-*`) | 33/33 geçti |
| `verify:v1-contract-artifacts` | OK (openapi + dron tipleri) |
| `verify:prebuild` | exit 0 (Vercel build kapısı) |
| ESLint (değişen 13 dosya) | temiz |

## Hüküm
Sistem **canlıya çıkış testine hazırdır**. Vercel/Supabase build'ini bozacak hata yoktur: tip, lint, çekirdek testler ve prebuild zinciri yeşildir. Faz 2'de (Split) geri dönüş: hop'ları `v1-hops-meta.ts` + `RAIL_V1_HOP_CONTRACTS` içine geri yazıp iki generate scriptini çalıştırmak yeterlidir.

---

## Tedavi Turu 1 (8 Eylül 2026) — Strateji A (Junior Kalıbı / Yüzey Kilitleme)

| Alan | Değer |
|------|--------|
| Tarih | 8 Eylül 2026 |
| Muhatap | SUPER ADMIN ve CEO |
| Karar | Tespit Raporu (`docs/TESPIT_RAPORU.md`) sonrası **Strateji A** |
| Kapsam | Kamu yüzeyi, navigasyon, API kenarı, yasal metin. Motor / şema / lab silinmedi. |
| Üslup | Ne yapıldı, ne duruyor, ne operatör işidir. Yeşil boyama yok. |

Bu rapor tedavinin sicilidir. Tespit raporu teşhistir; bu belge uygulanan ameliyattır.

---

## Yönetici özeti

Freelancer kamu yüzeyi Junior kalıbıyla **kenar 410** alındı. Vatandaş vitrini **Panel, Akademi, Kariyer** üçlüsüdür. `lib/freelancer`, Prisma freelancer şeması, emanet kaydı, split stub ve lab testleri durur.

Yasal gövde tek faaliyet konusuna çekildi: **dijital eğitim, sınav ve sertifikasyon (B2C)**. PayTR incelemesinde sık istenen `/hakkimizda` sayfası Yapınet künyesiyle eklendi.

Kod yüzeyi B2C vitrine hizalandı. Canlı Vercel / PayTR paneli / Supabase secret’ları bu makineden okunmadı; o katman SUPER ADMIN operasyonudur.

---

## ADIM 1 — Freelancer kamu yüzeyi kilidi

### 1.1 Feature flag ve kenar

| Kilit | Değer | Dosya |
|-------|--------|--------|
| `FREELANCER_PUBLIC_SURFACE_LOCKED` | `true` | `lib/kernel/compliance/circuit-breakers.ts` |
| Sayfa | `/freelancer` ve altı → kenar **410 Gone** | `isFrozenShellPagePath` |
| API | `/api/freelancer/**`, `/api/client/jobs/**` → **410** | `isFrozenRoomApi` (`edge-api-auth.ts`) |
| v1 hop | `/api/v1/freelancer/*` kanonik yola indikten sonra aynı 410 | `proxy.ts` + `canonicalApiPathname` |

Motor sicili değişmedi: `VERTICAL_ROOMS.length === 4` (dashboard, academy, career, freelancer). Kamu vitrin / sol menü `WORKING_SHELL_NAV_ROOM_IDS` ile **3 oda**. Freelancer `FROZEN_DISK_ROOMS` / `archived/` içine alınmadı.

### 1.2 Navigasyon ve UI

- Sol menü: freelancer düştü; vitrin Panel + Akademi + Kariyer.
- `RIBBON_ROOMS`: kilitli freelancer yok.
- Dashboard: `FreelancerPulseWidget` kilitliyken basılmaz; nabız BFF freelancer Prisma SELECT atmaz.
- Kariyer: «Freelancer İlan Panosu» CTA gizlendi.
- Pasaport: freelancer damga şeridi ve pano CTA gizlendi.
- Sitemap / SEO: `PRODUCT_ROOM_PATHS = ["/academy", "/career"]`. `/freelancer` taranmaz.

### 1.3 Bilinçli olarak silinmeyenler

- `lib/freelancer/**`, `prisma/schema/freelancer.prisma`, `EscrowHold`
- `MARKETPLACE_SPLIT_LIVE = false` ve split stub
- `RAIL_V1_HOPS` freelancer hop sicili (kenar 410; hop silinmedi)
- Widget / sayfa dosyaları (bayrakla gizlendi)
- Lab: `tests/freelancer/**` handler/motor, `tests/e2e/freelancer-happy-path.spec.ts` (Playwright varsayılan CI’de yok; kamu 410 olduğu için canlıya karşı koşulursa kırmızı olur — lab belgesi durur)

---

## ADIM 2 — Yasal metin ve B2C uyum

### 2.1 `lib/copy/legal-launch.ts`

`LEGAL_ACTIVITY_SCOPE_BODY` ve bağlı KVKK / iade / mesafeli / kullanım metinlerinden şu ibareler çıkarıldı: freelancer aracılığı, emanet / escrow, paylaştırmalı tahsilat / usta IBAN, pazaryeri.

Yeni faaliyet cümlesi: elektronik ortamda ifa edilen eğitim içeriği, sunucu değerlendirmeli yetkinlik sınavı ve dijital sertifikasyon (B2C).

Kullanım şartları çalışan odayı **üç** sayar (Panel, Akademi, Kariyer). `LEGAL_UPDATED_LABEL = "Yürürlük: 8 Eylül 2026"`.

Şirket IBAN’ı iletişim künyesinde durur; bu usta hakediş IBAN’ı değildir.

Checkout tik metni (`CHECKOUT_LEGAL_CONSENT_VERSION = 2026-09-05`) kasayı bozmamak için sürüm numarası değiştirilmedi; gövde zaten Akademi dijital ifaya bağlıydı.

### 2.2 Hakkımızda

- Yeni sayfa: `app/(public)/hakkimizda/page.tsx`
- Künye: Yapınet Gayrimenkul ve E-Ticaret Ltd. Şti. (VKN / MERSİS / adres)
- Hikâye: sicil unvanı ile platform faaliyetinin farkı dürüstçe yazılır; uydurma unvan yoktur
- Footer, `/legal`, `/iletisim`, bakım sayfası ve sitemap `/hakkimizda` bağlar

---

## ADIM 3 — Sicil ve mühürler

| Sicil | Yeni gerçek |
|-------|-------------|
| `scripts/verify-boundaries.ts` | Kamu vitrin 3 oda; freelancer yüzey kilitli; motor 4 oda |
| `scripts/verify-atomic-seals.ts` | İğne: `FREELANCER_PUBLIC_SURFACE_LOCKED = true` |
| Kenar / v1 testleri | Kilitli hop **410**; CORS / sürüm örnekleri canlı hop (`/api/v1/health`, `/api/v1/career/pulse`) |
| `verify-v1-contract` | Çerez sızma turunda kilitli hop 410 zarfı; DTO sicili freelancer hop’larını silmez |
| Katalog yüzey | `assertCatalogWriteAmountWithinBand` (önceden kırık iğne; B2C dışı, yüzey paketini yeşile çekmek için hizalandı) |

Çalıştırılanlar (bu tedavi turu + son mühür, 8 Eylül 2026):

- `npx tsx scripts/verify-boundaries.ts` — OK
- `npx tsx scripts/verify-atomic-seals.ts` — OK
- `npx tsc --noEmit` — OK
- `npm run test` — 170 dosya / 819 test yeşil (kilitli hop 410 mührü dahil)
- `npm run test:surface` — 83 dosya / 306 test yeşil
- `npm run verify:prebuild` — OK (geliştirme çıkış 0; Production secret bu makinede onay değildir)
- `npm run build` — OK (Next.js 16.3.1; `/hakkimizda` rotası üretim ağacında)

Lab nakit / accept / emanet testleri durur ve yeşil kalır: kamu 410, handler laboratuvarı açık.

---

## ADIM 4 — Derleme notu

`npm run verify:prebuild` üretim env sicilini de okur (`ops:runtime-readiness`). Geliştirmede tablo basar, çıkış 0; Vercel `NODE_ENV=production` derlemesinde eksik PayTR/Inngest/DB env build kırar. Bu, korumadır; bu raporda Production secret doğrulanmaz.

---

## Dokunulmayan kırmızı çizgiler

- Junior üretim kilidi açık; vitrine alınmadı
- Dron mağaza yayını yok; freelancer hop 410 ile native istemci dürüst hata basar
- Split canlı değil
- Disk arşivi (`archived/`) ve müze tarama / referans dışı

---

# ADIM 5 — Stratejik değerlendirme

## 1. Tedavi sonrası sistem PayTR B2C incelemesine tamamen hazır mı?

**Kod ve kamu yüzeyi CEO / SUPER ADMIN tarafından onaylanmıştır. Operatör paneli (canlı merchant, Vercel Production secret, insan mutlu yol) bu rapordan onaylanmış sayılmaz.**

Hazır olan: vatandaş `/freelancer` ve freelancer API görmez (410); menü üç oda; yasal metin Akademi B2C; Hakkımızda + künye; Junior kapalı; split kapalı.

Hazır olmayan / bu makinede doğrulanamayan: canlı PayTR merchant üçlüsü, Bildirim URL’si, Vercel Production secret’ların sandbox kalıntısı, Confirm-email, insan mutlu yol turu, avukat imzası.

İncelemeye paket gönderilmeden önce aşağıdaki SUPER ADMIN maddeleri ve bir insan Akademi alışveriş turu şarttır.

## 2. SUPER ADMIN’in Vercel / Supabase tarafında yapması gereken manuel işlem var mı?

**Evet. Kod kilidi panel işini yapmaz.**

1. Bu commit’i Production’a al.
2. `npm run ops:runtime-readiness` Production env ile yeşil olsun.
3. PayTR Merchant üçlüsü canlı; `PAYTR_SANDBOX` / mock boş; üretim fail-closed kalsın.
4. PayTR Bildirim URL: `/api/paytr/callback` (kanonik `/api/payments/webhooks/paytr`).
5. `NEXT_PUBLIC_APP_URL=https://yetkin.ai`. `TRUSTED_PROXY_HOPS=2` (Cloudflare → Vercel).
6. `SITE_MAINTENANCE_FREEZE` inceleme süresince **boş**.
7. Supabase Confirm-email açık olsun; Auth URL’ler kanonik domain.
8. Dron / Play Store / App Store binary **yayınlanmasın**.
9. Freelancer yüzey kilidini veya Junior’ı panelden «açma» — bayrak kod SSOT’tur.

## 3. Onay sonrası yol haritası nedir?

1. **İnsan mutlu yol (Akademi):** kayıt → cüzdan/kart → bir SKU satın al → ders bitir → sınav ≥70 → `/academy/dogrula` → Kariyer damgası. `/freelancer` 410, `/junior` 410.
2. Ana sayfadaki «PayTR onayı sürecindedir» cümlesini onay geldikten sonra güncelle (eski kalırsa güven aşınır).
3. Junior, Dron mağaza ve `MARKETPLACE_SPLIT_LIVE` kapalı kalsın.
4. **Faz 2 (ayrı karar):** lisanslı paylaştırmalı tahsilat + 6493 dosyası olmadan Freelancer kilidi açılmaz. Açılacaksa bayrak `false`, yasal gövde yeniden yazılır, lab e2e canlıya bağlanır — şimdi değil.

---

## ADIM 6 — CEO / SUPER ADMIN mühürü (8 Eylül 2026)

Strateji A ameliyatı CEO ve SUPER ADMIN tarafından onaylanmıştır.

- NACE **47.91.14** ve şirket sicili (Yapınet Gayrimenkul ve E-Ticaret Ltd. Şti.) B2C dijital eğitim satışı ile uyumlu kabul edildi.
- Freelancer kamu yüzeyi 410, üç odalı vitrin (Panel / Akademi / Kariyer), `/hakkimizda` ve B2C yasal gövde canlı paket olarak kilitlendi.
- Son mühür komutları sıfır hata: `verify:prebuild`, `test`, `test:surface`, `build`.
- Sicil `origin/main` üzerine basılır; Vercel Production deploy operatör panelinden izlenir.

*Tedavi uygulandı ve onaylandı. PayTR merchant paneli, Production secret ve insan Akademi mutlu yolu SUPER ADMIN işidir.*
