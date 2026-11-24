# yetkin.ai

Yetkinliğini kanıtlayan yapay zekâ eğitimleri. Öğrendiğini mühürle. Mührün kapıyı açsın. İşin güvende olsun.

Vatandaş ve dış dünya markası **yetkin.ai**. npm paketi `yetkin.ai`. Lab veritabanı (`yetkin_rail_lab`), Inngest app id (`yetkin-rail`) ve dizin yolu `apps/rail-is` operasyonel kimlik olarak durur.

## Oda kaydı

Tek kaynak `lib/dronlar/kayit.ts` (`DRON_KAYIT`). `kapali: true` olan yol kenarda **410** döner. Oda sayısı belgede ayrıca sabitlenmez; satır kayıttan okunur.

| Oda | Yol | Kayıt | Yüzey |
|-----|-----|-------|--------|
| Panel | `/dashboard` | açık | kamu vitrin |
| Akademi | `/academy` | kapalı / askıda | satır `vitrin: true`, kenar 410, satış vaadi değil |
| YetkinCV | `/career` | açık | kamu vitrin, ücretsiz değerlendirme |
| Freelancer | `/freelancer` | kapalı / askıda | satır `vitrin: true`, kenar 410, nakit iddiası yok |
| AI Tezgâh | `/tezgah` | açık | müstakil oda (`vitrin: false`) |
| Junior | `/junior` | açık | müstakil oda; satış ayrı kilit |
| Young | `/young` | kapalı | müstakil oda, kenar 410 |
| YetkinHibe | `/hibe` | açık (`yetkinhibe`) | müstakil oda |
| E-Ticaret | `/e-ticaret` (kamu vitrini); kokpit `/panel/e-ticaret` | kayıt dışı | kokpit `COMMERCE_NAV` |
| Kurumsal | `/kurumsal` | sayfa açık | teklif; donmuş disk kimliği `kurumsal` bu yolu kapatmaz |
| Kamu kanıt (oda değil) | `/vize` | — | oturumsuz mühür kartı |

**Açık (`kapali: false`):** Panel, YetkinCV, AI Tezgâh, Junior, YetkinHibe.

**Kapalı / askıda (`kapali: true`):** Akademi, Freelancer, Young.

**Junior:** Oda açıktır. Satış `JUNIOR_CHECKOUT_OPEN` boşken `isJuniorCheckoutLocked` ile kilitlidir; kasa **410** kalır. Bu, oda kapısı değildir.

**Kimlik tuzağı:** Donmuş disk kimliği `hibe` canlı oda değildir. Canlı kimlik `yetkinhibe`, yol `/hibe`. Donmuş disk kimliği `kurumsal`, `/kurumsal` ve `/kurumsal/ilanlar` sayfalarını kapatmaz.

Freelancer’da lisanslı Split bağlı değilken accept **503**. Sahte bakiye veya sahte CREDIT yazılmaz (fail-closed). Tahsilat kanalı **PayTR Merchant**. Saf sözleşmeler `@yetkin/kernel` paketindedir.

Kimlik Supabase Auth, nakit tek `amountMinor` defteri, dış sözleşme `/api/v1`. Gövde **Pragmatik Monolit + İnce Sözleşme Paketi + Tek Native İstemci**dir (Anayasa B1). İnce sözleşme paketi `@yetkin/kernel`dir. Tek native istemci `apps/rail-is`tir.

## Bağlama

Kalıcı belgeler `.system_docs/` altındadır (`ANAYASA.md`, `MANIFESTO.md`, `OPS_RUNBOOK.md`, `STORAGE_CONTRACT.md`). Günlük rapor `/docs` — build fixture değildir.

```
cp .env.example .env.local
npm install
npm run ops:migrate
npm run dev
```

Tek native istemci (`apps/rail-is`, paket `yetkin.ai-is`) mağaza ve vatandaş yüzünde **yetkin.ai** yazar. Yayın kilidi `publishFrozenUntilFaz1Close: false`dır. CI binary basmaz; operatör `apps/rail-is/eas.json` ile basar.
