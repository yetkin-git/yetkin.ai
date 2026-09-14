# Ops — Dron

İndeks: `.system_docs/OPS_RUNBOOK.md`. Sözleşme: `.system_docs/DRON_CLIENT_SPEC.md`. Shared Kernel: `@yetkin/kernel`.

Paket `yetkin.publishFrozenUntilFaz1Close: false`. T3 Akademi yüzeyi (müfredat / sınav / mühür) Dron UI'dadır. Play Closed Testing ve Apple TestFlight **protokol olarak açık**. Mağaza binary hattı `apps/rail-is/eas.json` (development / preview / production). **CI `eas` / `eas-cli` / `expo publish` koşmaz** — binary operatör basar. Kapalı teste 410/404 Tezgâh hop'u sürmek yapılmaz. `DRON_TEZGAH_STORE_ISOLATED: true` — "Açık işler / İşlerim" sekmesi gizlidir; kaçak yüzey `Phase2LockScreen` (Faz 2 — Yansıtma bekleniyor). İnceleme notu: `docs/MAĞAZA_INCELEME_NOTU.md`.

Native env yalnız `EXPO_PUBLIC_RAIL_API_BASE` + `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`. `service_role` yoktur. Dron `@yetkin/kernel` paketini tüketir; hop meta codegen-kopya değildir.

## `RAIL_DRON_ORIGINS` — üretimde boş

Boş allowlist = `/api/v1` cevaplarında CORS başlığı **yazılmaz**. Native `fetch` Origin basmaz. Joker `*` yasak.

## Cüzdan yükleme — IAP yok

Dron cüzdan okur ve `POST /api/v1/wallet/top-up` (Bearer + Idempotency-Key) ile yükleme başlatır. Kart PayTR iFrame'dedir; native IAP yoktur. Kenar HMAC pasaportu sistem tarayıcısında `/kasa` açar — çerez oturumu istenmez. Web `/cuzdan` sığınağı durur. Akademi satın alma (cüzdan DEBIT) v1 hop'tur.

## HTTP 426

Kenar `/api/v1` (health ve `OPTIONS` hariç) `X-Rail-Min-Version` ister. Kilit ekranı: **“Lütfen uygulamayı güncelleyiniz”**. `minVersion` düşürerek yeşil boyama yasaktır.

## V1 hop sicili

SSOT: `@yetkin/kernel` `RAIL_V1_HOPS_META` + Amiral Zod. `RAIL_V1_HOPS`, **16 kayıt**. Yazma hop'ları (satın alma, kilit, müfredat, sınav, cüzdan yükleme, portföy, profil) Bearer + Idempotency-Key. Müfredat/sınav GET okuma hop'ları T3 halkası içindir. Freelancer path'leri kilitliyken kenar 410.

Amiral çerezle `/api/...`, Dron Bearer ile `/api/v1/...` aynı handler'ı konuşur.

## Closed Testing — T3 B2C

1. Amiral: `LIVE_BROADCAST_SHUTDOWN` boş (varsayılan kapalı); `RAIL_DRON_ORIGINS` boş; sandbox yok; Inngest çift anahtar.
2. Dron env (EAS Secrets, git'e yazılmaz): `EXPO_PUBLIC_RAIL_API_BASE` + `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
3. İnceleme notu: `docs/MAĞAZA_INCELEME_NOTU.md`. IAP yoktur; yükleme v1 hop + HMAC `/kasa`. Akademi oynatıcı / sınav / mühür Dron UI'dadır. Tezgâh sekmesi yoktur.
4. Binary: `cd apps/rail-is` sonra `eas init` (bir kez; `extra.eas.projectId` uydurulmaz) → `eas build --profile preview` (internal APK) veya `--profile production --platform android` (AAB) / `--platform ios` (IPA). Kök `eas.json` yoktur. `npx eas-cli` yeter; repo `eas-cli` bağımlılığı ve CI adımı **yoktur**.
5. Hâlâ kapalı: freelancer GET/POST (istemci HTTP atmaz), refund, dispute, native IAP, S43 çekim, Split.
