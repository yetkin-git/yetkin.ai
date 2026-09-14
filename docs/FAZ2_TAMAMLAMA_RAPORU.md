# FAZ 2 TAMAMLAMA RAPORU — Canlı yayın kilidi + Dron T3 ekranları

| Alan | Değer |
|------|--------|
| Tarih | 13 Eylül 2026 |
| Hazırlayan | Senior Software Architect / Sistem Analisti ajanı |
| Girdi | `docs/FAZ2_HAZIRLIK_RAPORU.md` (83/100) + Aşama 4 görevi |
| Yöntem | Sıfır varsayım. Her iddia dosya yoluna bağlıdır. |
| Sonuç puan | **85/100** |
| Closed Testing bayrağı | `publishFrozenUntilFaz1Close: false` |
| Mağaza binary | **Hazır değil** (`eas.json` yok; CI EAS basmaz) |

---

## 0. Yönetici özeti

Hazırlık raporu köprüyü kurmuştu (16 hop, cüzdan HMAC, Redis port, T3 protokol). Bu oturum üç kilit maddesini koda bağladı:

1. **`LIVE_BROADCAST_SHUTDOWN` varsayılan kapalı.** Kod sabiti `true` değildir. Üretim 503 artık env `LIVE_BROADCAST_SHUTDOWN=true\|1` veya `SITE_MAINTENANCE_FREEZE` ister. Amiral ürün yüzeyi varsayılan olarak konuşur.
2. **Dron T3 ekranları durur.** `AcademyPlayerScreen`, `ExamScreen`, `CertificateScreen` hop’lara bağlıdır: müfredat GET/POST, sınav GET/POST, kamu sertifika GET, satın alma + kilit, nabız.
3. **`publishFrozenUntilFaz1Close: false`.** Paket ve Expo `extra` kilidi kalktı. Bu, mağaza binary’sinin basıldığı anlamına gelmez.

Puan 83 → **85**. UI ve yayın kilidi kalkışı protokol iddiasını vatandaş yüzeyine taşıdı. 90+ eşiği hâlâ canlı Redis zorunluluğu, gerçek PayTR 3DS tanığı, EAS hattı ve Tezgâh’ın Closed Testing’ten ayrı durması ister. Bu oturumda canlı nakit halkası (`ops:t3-academy-loop`) koşulmadı: yerel Amiral süreci yoktu.

**Closed Testing’e %100 hazır değiliz.** Bayraklar açık; uçak pistte, pist ışıkları henüz mağaza kulesinden onaylı değil.

---

## 1. CANLI YAYIN KİLİDİ

### 1.1 Karar

Sabiti `true` bırakıp “deploy ile açılır” yalanı durduruldu. Kilidi **env’den dinamik** okumak, `SITE_MAINTENANCE_FREEZE` acil bakımını bozmadan CEO kapatmayı geri takılabilir kılar.

| Kaynak | Davranış |
|--------|----------|
| Env boş / `"false"` / `"0"` | Kapalı. Üretim ürün 503 basmaz (geliştirme/localhost zaten yok sayılır) |
| `LIVE_BROADCAST_SHUTDOWN=true\|1` | Üretimde ürün 503; PayTR bildirim + Inngest serve/send fail-closed |
| `SITE_MAINTENANCE_FREEZE=true\|1` | Ayrı bakım donması; yasal sayfalar geçer |
| `VITEST=true` veya `NODE_ENV=development` | Her iki kilit de yok sayılır |

### 1.2 Dosyalar

- `lib/kernel/http/live-broadcast-shutdown.ts` — `isLiveBroadcastShutdownFlagOn` + `LIVE_BROADCAST_SHUTDOWN` anlık görüntü (varsayılan `false`)
- `lib/kernel/http/site-maintenance.ts` — env bag’e `LIVE_BROADCAST_SHUTDOWN` girdi; kenar her istekte okur
- `lib/kernel/env.ts` + `.env.example` — anahtar sicile yazıldı (`""` = kapalı)
- `instrumentation.ts` — uyarı `isLiveBroadcastShutdownEnvActive()` ile

### 1.3 Web T3 kontrolü

Kontrol mekanizması durur: `npm run ops:t3-academy-loop` (`scripts/ops-t3-academy-loop.ts`) + yüzey testi `tests/academy/t3-academy-loop-surface.test.ts`.

Bu oturumda **koşulan:**

- `tests/academy/t3-academy-loop-surface.test.ts` — yeşil (script PayTR HMAC, kilit, satın alma, mühür URL, CareerVisaStamp taşır; mock checkout yok)
- `tests/kernel/merchant-academy-lab-surface.test.ts` — yeşil
- `tests/kernel/four-room-smoke.test.ts` — yeşil (bellek nakit; canlı PSP değil)
- `npm run ops:runtime-readiness` — çıkış **0** (geliştirme; `NODE_ENV production=hayır`)

Bu oturumda **koşulmayan:**

- `npm run ops:t3-academy-loop` — yerel Next süreci yoktu; script `GET /api/health` için 90 sn bekler. Canlı kart / HMAC webhook CREDIT bu ajan oturumunda doğmadı.
- Tarayıcı E2E (Ödeme → Satın Alma → Ders → Sınav → Mühür) — Amiral host ayakta değildi. Native Dron ekranları Expo’dur; tarayıcıda çizilmez.

Dürüst sonuç: Web T3 **protokol ve lab iskeleti %100**; canlı CREDIT→DEBIT→mühür zinciri bu oturumda **tanık edilmedi**. Staging host + `E2E_T3_*` + PayTR sandbox HMAC olmadan “canlıda uçtan uca %100” iddiası basılmaz.

Yerel readiness notu (sır yok): `payments=configured`, `inngest=configured`, `smtp=configured`, `examSitting=unconfigured` (JWT derive fallback), `rateLimitStore=in-process-single-node`, `PAYTR_SANDBOX` yerel env’de açık (üretimde yasak), `TRUSTED_PROXY_HOPS=1` (canlı reçete 2).

---

## 2. DRON AKADEMİ / SINAV / MÜHÜR UI

Hop sicili değişmedi (**16 kayıt**). Yeni `app/api/v1` ağacı açılmadı. Dron mevcut hop’ları tüketti.

| Ekran | Dosya | Hop |
|-------|-------|-----|
| Katalog + müfredat + ders tamamlama + satın alma kapısı | `apps/rail-is/src/screens/AcademyPlayerScreen.tsx` | `GET/POST …/curriculum`, `POST …/lock`, `POST …/purchase`, `GET …/academy/pulse` |
| Sınav | `apps/rail-is/src/screens/ExamScreen.tsx` | `GET/POST …/exam` |
| Mühür | `apps/rail-is/src/screens/CertificateScreen.tsx` | `GET …/academy/certificates/{hash}` |

### 2.1 Bağ

- `apps/rail-is/src/runtime/use-dron-app.ts` — `openAcademyCourse`, `completeAcademyLesson`, `openAcademyExam`, `submitAcademyExam`, `openAcademyCertificate`, `purchaseAcademyCourse` (önce kilit, sonra DEBIT). 403 müfredat → satın alma yüzeyi; sahte lisans yok.
- `apps/rail-is/App.tsx` — varsayılan sekme **Akademi**. Tezgâh sekmeleri durur; istemci Faz 2 hop’lara HTTP atmaz (`DRON_FAZ2_FROZEN`).
- Presenter’lar fail-closed parse: `present-academy-player.ts`, `present-academy-exam.ts`, `present-academy-certificate.ts`, `present-academy-pulse.ts`.
- Vitrin beşlisi GET katalog hop’u olmadığı için `@yetkin/kernel` başlık + `DRON_ACADEMY_VITRINE_SLUGS` (`01_office_ai` … `05_prompt_practice`). SKU icadı yok.
- Native TTS hop’u yoktur; ders **okunur**. Native QR kütüphanesi yoktur; SHA-256 mühür kodu + `/academy/dogrula/{hash}` sistem tarayıcısında açılır.
- Satın alma gövdesi handler gerçeğidir (rıza + fatura + isteğe bağlı `lockId`). Native IAP yok. Kart `/kasa` iFrame’de kalır.

### 2.2 Doğrulama (kod)

- `npm run typecheck:rail-is` — OK
- `tests/kernel/faz2-t3-dron-ring-surface.test.ts` — ekranlar var; hop zinciri 16; kilitler güncel
- `tests/dron/verify-dron-ui-states.test.ts` — Akademi → player → exam yüzey parse
- `tests/dron/verify-dron-v1-protocol.test.ts` — yeşil (Tezgâh hâlâ donuk istemci)

Cihaz / Expo Go E2E bu oturumda yok.

---

## 3. KAPALI TEST KİLİDİ

`apps/rail-is/package.json` → `yetkin.publishFrozenUntilFaz1Close: false`  
`apps/rail-is/app.config.ts` → `extra.publishFrozenUntilFaz1Close: false`

Görev metni: T3 halkası [Giriş → Cüzdan → Satın Alma → Ders → Sınav → Sertifika] Dron içinde **yüzey olarak** tamamlanınca kilit kalkar. Protokol + UI bağlandı; nakit tanığı staging’de ayrıca koşulmalıdır.

Bilinçli olarak **açılmayanlar:**

- `eas.json` / EAS CLI / CI `eas` adımı — `tests/kernel/rail-is-dron-lab-surface.test.ts` hâlâ yokluğunu kilitler. Bayrak ≠ binary.
- `FREELANCER_PUBLIC_SURFACE_LOCKED` — `true`
- `MARKETPLACE_SPLIT_LIVE` — `false`
- Native IAP

Ops: `.system_docs/ops/ops-dron.md`, `.system_docs/DRON_CLIENT_SPEC.md`, `.system_docs/OPS_RUNBOOK.md`, `docs/DURUM.md` güncellendi. `docs/TEDAVI_RAPORU.md` / `docs/FAZ2_HAZIRLIK_RAPORU.md` tarihsel belgeler olarak dokunulmadı.

---

## 4. UYUM PUANI (aynı ağırlıklar)

Ağırlık: sözleşme %20, auth %15, ödeme %20, veri %20, paket %15, dikey-maliyet %5, ölçek %5.

| Boyut | Hazırlık | Bu tamamlama | Gerekçe |
|-------|----------|--------------|---------|
| Sözleşme-first | 93 | **95** | 16 hop + Dron T3 ekran bağlandı. Freelancer hâlâ yayın dışı |
| Kimlik | 72 | **72** | HMAC pasaport / refresh SDK. Değişmedi |
| Ödeme | 78 | **80** | Yayın kilidi varsayılan kapalı; CREDIT yolu açık *olabilir*. Canlı 3DS tanığı yok. Split stub. IAP yok |
| Veri paylaşımı | 87 | **94** | T3 okuma+yazma Dron UI’da. 16/53 hâlâ dar; kapsama artık yalnız protokol değil |
| Kernel paketlenmesi | 85 | **85** | `file:` workspace; registry/semver botu yok |
| Dikey açma maliyeti | 80 | **80** | Hop/Zod/ROUTE_AUTH_MAP el işi |
| Çalışma-zamanı ölçeği | 72 | **72** | Redis REST hazır, prod zorunlu değil. Yerel readiness in-process |

**Hesap:** 95×0.20 + 72×0.15 + 80×0.20 + 94×0.20 + 85×0.15 + 80×0.05 + 72×0.05  
= 19.0 + 10.8 + 16.0 + 18.8 + 12.75 + 4.0 + 3.6 = **84.95 → 85**.

Hazırlık 83 → **+2**. 90+ için: canlı T3 tanığı, Redis REST prod’da dolu, EAS hattı, Tezgâh’ın inceleme binary’sinden çıkarılması.

---

## 5. DOĞRULAMA KAPILARI (bu oturum)

Koşulan:

- `npm run typecheck:rail-is`
- `npm run ops:runtime-readiness` (çıkış 0, geliştirme)
- Vitest: live-broadcast-shutdown, faz2-t3-dron-ring, rail-is-dron-lab, site-maintenance, env-example, verify-dron-ui-states, verify-dron-v1-protocol, t3-academy-loop-surface, merchant-academy-lab-surface, runtime-readiness, faz1-operating-picture, inngest-serve-guard, four-room-smoke, paytr-clearing-scan, proxy-edge, v1-runtime-shield — yeşil

Koşulmayan (neden):

- `ops:t3-academy-loop` — Amiral HTTP yok; 90 sn health bekler
- Playwright / tarayıcı T3 — aynı neden
- Expo cihaz E2E — suite yok
- Production `ops:runtime-readiness` bloğu — `NODE_ENV≠production`

---

## 6. SEN OLSAYDIN NE YAPARDIN?

### 6.1 App Store / Google Play kapalı teste %100 hazır mıyız?

**Hayır.**

Hazır olan:

- B2C T3 **protokolü** (oturum, kasa HMAC, DEBIT satın alma, müfredat, sınav, kamu mühür)
- Dron **yüzeyi** aynı zinciri içeriden çizer
- Üretim 503 kod kilidi varsayılan kapalı
- Paket yayın bayrağı `false`

Hazır olmayan (mağaza incelemesini durduranlar):

1. **`eas.json` yok.** CI `eas` / `expo publish` yasak. Bayrağı `false` yapmak binary basmaz. Closed Testing bir store track ister; bu repo o hattı hâlâ taşımaz.
2. **Canlı nakit tanığı yok.** Bu oturumda PayTR HMAC CREDIT → akademi DEBIT → mühür koşulmadı. İnceleme hesabı yeşil halka görmeden “çalışıyor” denmez.
3. **Tezgâh sekmeleri durur.** İstemci 410’a HTTP atmaz (dürüst `DRON_FAZ2_FROZEN`), ama inceleme uzmanı “Açık işler / İşlerim” görür. `ops-dron.md` yasağı: 410 Tezgâh binary’si sürme. T3-only track için Tezgâh sekmesi gizlenmeli veya “Faz 2, yayında değil” kilit kartına indirgenmeli.
4. **Redis prod opsiyonel.** İkinci instance kota deliği. Yerel readiness `in-process-single-node`.
5. **Split / freelancer 410.** İkinci Dron veya Tezgâh Closed Testing’i T3’ten **sonra**.
6. **IAP yok** — bu doğru; inceleme notu HMAC `/kasa` olmalıdır. Not yazılmadan binary sürmek reddedilme riskidir.
7. **Kernel `file:`** — 426 penceresi aynı commit umuduna bağlı.

Closed Testing’e bugün binary sürmek, hop’u olan ama mağaza paket hattı ve nakit tanığı olmayan bir laboratuvarı mağazaya koymak olur.

### 6.2 Sonraki aşama — Pazaryeri / Split ve 2. Dron

Sıra hâlâ zorunlu. Ters sıra 410 Tezgâh’ı veya emanet-olmayan nakit SSOT’u mağazaya bağlar.

| Sıra | Kapı | Ne zaman |
|------|------|----------|
| 1 | Staging’de `ops:t3-academy-loop` yeşil (PayTR HMAC CREDIT, sandbox üretimde kapalı) | Web T3 tanığı |
| 2 | Dron internal track (EAS **eklenince**; store Closed Testing değil) | Login → kasa → satın al → ders → sınav → mühür, cihaz |
| 3 | Tezgâh sekmesini T3 binary’sinden çıkar veya kilit kartı | İnceleme 410 görmesin |
| 4 | `RATE_LIMIT_REDIS_REST_*` prod çifti | İkinci instance öncesi |
| 5 | Play Closed Testing / TestFlight (T3-only, IAP yok notu) | 1–4 yeşilse |
| 6 | İdari Pazaryeri (K-5) + `MARKETPLACE_SPLIT_LIVE` + freelancer hop sicile geri yazım | T3 Dron halkası saha yeşili **sonra** |
| 7 | 2. Dron (`npm run dron:new` + `@yetkin/kernel` aynı major) | Yeni hop = meta + Zod + handler + test + paket; sessiz ekleme yok |
| 8 | `FREELANCER_PUBLIC_SURFACE_LOCKED=false` | Split lisans + Tezgâh hop 2xx; aksi halde kamu 410 durur |

**Özet cümle:** Amiral artık varsayılan 503 değildir; Dron T3’ü çizer; mağaza kilidi protokol olarak açık. Kapalı test **yayını** için hâlâ EAS, canlı nakit tanığı ve Tezgâh izolasyonu gerekir. Split ve 2. Dron, T3 saha yeşilinden sonradır.

---

## 7. BİLİNÇLİ OLARAK YAPILMAYANLAR

- `eas.json` / EAS submit eklenmedi (CI yasağı durur)
- Freelancer hop’ları yayınlanmadı; Split stub durur
- Native IAP / WebView kart / native TTS / QR SDK eklenmedi
- Redis prod’da zorunlu kılınmadı
- `docs/TEDAVI_RAPORU.md` ve `docs/FAZ2_HAZIRLIK_RAPORU.md` tarihsel bırakıldı
- Canlı PayTR 3DS ve cihaz E2E icat edilmedi
