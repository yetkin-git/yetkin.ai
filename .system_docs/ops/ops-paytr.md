# Ops — PayTR

Anayasa A2. İndeks: `.system_docs/OPS_RUNBOOK.md`.

PayTR tek düğme değildir. Birinin açılması diğerini yeşile boyamaz. **Kamu nakit kanalı Merchant Port’tur.** Split bağlı değilken freelancer nakit kabulü 503; kamu yüzeyi 410.

| Port | Vatandaş adı | Ne döner? | Kod | İdari kapı |
|------|----------------|-----------|-----|------------|
| **Merchant Port** | Akademi / üye işyeri (iFrame API) | Cüzdan CREDIT → kurs DEBIT → sınav → mühür | `paymentsPort.merchant` | Mağaza paneli + üçlü env |
| **Pazaryeri Split Port** | Freelancer emaneti | `beginHold` / `settle`; usta IBAN’ına kuruluş dağıtır | `paymentsPort.split` | Alt satıcı onboard + lisanslı sözleşme. Gün 0 **kasıtlı stub** |

Health `checks.payments=configured` yalnız **Merchant** üçlüsünün dolu olduğunu söyler.

Kanonik bildirim yolu: `{NEXT_PUBLIC_APP_URL}/api/payments/webhooks/paytr`. PayTR Mağaza Paneli Bildirim URL: `https://yetkin.ai/api/paytr/callback` (aynı handler).

## Canlı üçlü

1. `PAYTR_MERCHANT_ID` / `_KEY` / `_SALT` canlı değerler.
2. Üretimde `PAYTR_SANDBOX` **boş**. `"1"` throw eder.
3. `PAYTR_ALLOW_MOCK_CHECKOUT` üretimde boş. CREDIT yazmaz.
4. `NEXT_PUBLIC_APP_URL` üretimde `https://` genel köken.
5. `PAYTR_WEBHOOK_IP_ALLOWLIST` isteğe bağlı. Kod env doluyken resmi host’ları birleştirir.
6. `TRUSTED_PROXY_HOPS`: Cloudflare → Vercel canlı = **2**.

Preview’a canlı üçlü yazılmaz.

## Mağaza paneli

1. Mağaza aktif ve iFrame yetkisi açık.
2. Bildirim URL: `https://yetkin.ai/api/paytr/callback`. Yanıt HTTP 200 düz metin `OK`.
3. Bu URL’ye üyelik / JWT / WAF bot fight konmaz (`auth = "webhook"`).
4. `merchant_ok_url` / `merchant_fail_url` `/cuzdan` dönüşüdür. CREDIT yazmaz.

## Runtime kalkan

- HMAC: `merchant_oid + merchant_salt + status + total_amount`, timing-safe. Geçersiz imza 403. CREDIT yok.
- Üçlü eksik: 400 `missing_credentials` (Destek IP URL testi 200 OK, CREDIT yok).
- Aynı `merchant_oid` tekil CREDIT: `FOR UPDATE` + unique idempotency + CLEARED kısa devre.
- `total_amount === amountMinor` değilse clearing yok.
- Clearing throw → Inngest defer. `inngest.send` düşerse `"OK"` dönülmez.
- Üretim `user_ip` loopback / RFC1918 / IPv6 ise get-token fail-closed.
- `LIVE_BROADCAST_SHUTDOWN` açıkken webhook 503 (CREDIT yok, retry).

İlk canlı tanık şartı: `PaymentOrder.status=CLEARED` + `LedgerEntry` CREDIT + cüzdan `amount_minor`. Elle SQL CREDIT yasak.

## Canlı nakit tanığı (kalıcı sicil)

**18 Eylül 2026 — ₺15,00 PayTR CLEARED canlı kart tanığı alındı (Bakiye ₺10,00 -> ₺25,00, CREDIT defter kaydı oluşturuldu).** Super Admin, canlı iframe + 3D Secure. `amount_minor` 1000 → 2500; CLEARED 1500. Tam `merchant_oid` bu belgeye basılmaz. Operatör prosedürü bu sicildeki «Canlı nakit tanığı» bölümüdür (ayrı prosedür dosyası yoktur).
