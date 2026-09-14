# Mağaza inceleme notu — yetkin.ai (Rail İş / Dron)

| Alan | Değer |
|------|--------|
| Uygulama | yetkin.ai |
| Paket | `apps/rail-is` (Expo) |
| Android | `rail.yetkin.is` |
| iOS | `rail.yetkin.is` |
| Sürüm | `0.0.1` |
| Track | Google Play Closed Testing / Apple TestFlight |
| Yüzey | Yalnız Akademi T3 halkası |
| Native IAP | **Yok** |

Bu belge App Store Connect Review Notes ve Google Play Console “Review notes / Testing instructions” alanına yapıştırılmak içindir. **Şifre git’e yazılmaz.** Operatör aşağıdaki şablonu kendi `E2E_T3_*` değerleriyle doldurur ve yalnız mağaza konsoluna yapıştırır.

Kaynak kod: `apps/rail-is`. Hop: `POST /api/v1/wallet/top-up` → HMAC `/kasa`. Tezgâh: `DRON_TEZGAH_STORE_ISOLATED`.

---

## English (paste into App Store Connect / Play Console)

**What this build is**

yetkin.ai is a Turkish career-learning app. This closed-test binary exposes only the Academy loop:

Sign in → Wallet strip → Top up via HMAC `/kasa` (PayTR 3-D Secure iframe in the system browser) → Purchase a course (wallet DEBIT hop) → Read a lesson → Take the exam → View the sealed SHA-256 certificate.

There are **no In-App Purchase SKUs**, no StoreKit, no Google Play Billing, no native card form, and no WebView that hosts the card fields. Card data stays inside PayTR’s iframe on `https://yetkin.ai/kasa`.

**Why not IAP**

Digital course access is a **wallet debit on the yetkin.ai ledger**, shared with the website. The native client is a thin Bearer hop client (`@yetkin/kernel`). Charging twice (IAP + ledger) would double-bill. The HMAC passport (`POST /api/v1/wallet/top-up`) opens Safari / Chrome Custom Tabs; the app never stores PAN, CVV, or a checkout cookie.

**What you will not see**

Job board / freelance bench tabs (“Açık işler”, “İşlerim”) are **hidden** in this build. They are not broken screens. Marketplace Split is not live. Please review only the Academy path above.

**Demo account** (operator fills before submit — do not commit):

- Email: `[E2E_T3_EMAIL — paste from operator vault]`
- Password: `[E2E_T3_PASSWORD — paste from operator vault]`
- Expected: the account can sign in with Supabase email/password. Wallet should already hold enough TRY credit to buy the vitrine course `01_office_ai` without a live card charge. If you still tap “Cüzdanı web'de yükle”, the system browser opens `/kasa` with a PayTR iframe.

**Happy path**

1. Open the app. Sign in with the demo account.
2. Confirm the wallet strip shows a live balance (not a fake ₺0).
3. Open the first Academy course. If locked, tap purchase (wallet DEBIT — not IAP).
4. Complete a lesson (“Dersi tamamla”).
5. Start the exam, answer all questions, submit.
6. Open the sealed certificate. SHA-256 hash is shown; “Doğrulama sayfasını aç” opens `/academy/dogrula/{hash}` in the system browser.

---

## Türkçe (operatör / iç not)

### IAP yerine HMAC Kasa

| Soru | Cevap |
|------|--------|
| Native IAP var mı? | Hayır. StoreKit / Play Billing SKU yoktur. |
| Kart nerede? | PayTR iFrame, `https://yetkin.ai/kasa?` HMAC pasaportu. Native form ve WebView kart **yok**. |
| Nasıl açılır? | Dron `POST /api/v1/wallet/top-up` (Bearer + Idempotency-Key) → `checkoutPassportUrl` → `Linking.openURL`. |
| Satın alma nedir? | Akademi `POST /api/v1/academy/courses/{id}/purchase` cüzdan DEBIT hop’u. Mağaza içi tüketim IAP değildir. |
| Neden böyle? | Nakit SSOT Amiral defteridir. Web ve Dron aynı bakiyeyi konuşur. IAP ikinci tahsilat olur. |

### Test hesabı (konsola yaz; git’e yazma)

Kaynak env (Amiral, commit edilmez): `E2E_T3_EMAIL`, `E2E_T3_PASSWORD`.

| Alan | Konsol değeri |
|------|----------------|
| E-posta | Operatör: `E2E_T3_EMAIL` |
| Şifre | Operatör: `E2E_T3_PASSWORD` |
| Ön koşul | Hesap e-posta onaylı. Cüzdanında vitrin SKU (`01_office_ai`) DEBIT’ine yetecek `amountMinor` CREDIT durur. Yeni gmail icat edilmez (Auth kotası). |
| Kart | İnceleme için zorunlu değildir (önceden fonlanmış hesap). Zorunlu olursa HMAC `/kasa` + PayTR 3DS; sandbox üretimde yasaktır. |

Şifreyi bu markdown dosyasına yapıştırmayın. Mağaza konsolu inceleme notu sır tutar; git tutmaz.

### İnceleme uzmanının görmemesi gerekenler

- “Açık işler” / “İşlerim” sekmeleri bu binary’de **yoktur** (`DRON_TEZGAH_STORE_ISOLATED`).
- 410/404 Tezgâh hop’u UI’ya bağlanmaz.
- Split, refund, dispute, çekim (S43) kapalıdır.

Kaçak state olursa kilit kartı: **“Faz 2 — Yansıtma bekleniyor”** (`Phase2LockScreen`). Bu bir hata ekranı değildir.

---

## Operatör kontrol listesi (göndermeden)

1. Staging veya üretim Amiral’de `npm run ops:t3-academy-loop` yeşil (PayTR HMAC CREDIT tanığı).
2. İnceleme hesabı fonlu; `E2E_T3_*` konsola yapıştırıldı.
3. EAS Secrets: `EXPO_PUBLIC_RAIL_API_BASE`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`. `service_role` yok.
4. `eas init` bir kez; uydurma `projectId` yok.
5. `eas build --profile production` AAB/IPA; submit `draft` / internal. CI eas basmaz.
6. Bu notun İngilizce bloğu mağaza konsoluna yapıştırıldı.
