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
2. Üretimde `PAYTR_SANDBOX` **yok sayılır**. Bayrak doluysa tahsilat canlı moda alınır; fonksiyon throw etmez. `test_mode` üretimde `0` kalır.
3. `PAYTR_ALLOW_MOCK_CHECKOUT` üretimde boş. CREDIT yazmaz.
4. `NEXT_PUBLIC_APP_URL` üretimde `https://` genel köken.
5. `PAYTR_WEBHOOK_IP_ALLOWLIST` isteğe bağlı. Kod env doluyken resmi host’ları birleştirir.
6. `TRUSTED_PROXY_HOPS`: Cloudflare → Vercel canlı = **2**.

Preview’a canlı üçlü yazılmaz.

## Mağaza paneli

1. Mağaza aktif ve iFrame yetkisi açık.
2. Bildirim URL: `https://yetkin.ai/api/paytr/callback`. Doğrulanmış bildirim ve boş gövde yoklaması HTTP 200 düz metin `OK`. Geçersiz imza ve `production_safety` 403 döner; PayTR bu yanıtta yeniden dener.
3. Bu URL’ye üyelik / JWT / WAF bot fight konmaz (`auth = "webhook"`).
4. `merchant_ok_url` / `merchant_fail_url` `/cuzdan` dönüşüdür. CREDIT yazmaz.

## Runtime kalkan

Bildirim iki yoldan gelir. Panel takma adı kanonik `POST` fonksiyonunu yeniden dışa verir; HTTP kodu bu iki yol arasında ayrılmaz. İmza tutmazsa CREDIT yazılmaz.

Doğrulanmamış bildirimin durumu `paytrUnverifiedNotificationStatus` (`lib/kernel/payments/paytr/callback-guard.ts`) ile belirlenir. Handler aynı eşlemeyi uygular. Boş gövde yoklaması bu fonksiyona girmez.

| Yol | Geçersiz imza | `production_safety` | `missing_credentials` / `invalid_payload` | Boş gövde (yoklama) |
|-----|----------------|---------------------|------------------------------------------|---------------------|
| Kanonik `/api/payments/webhooks/paytr` | 403 | 403 | 400 | 200 düz metin `OK` |
| Panel takma adı `/api/paytr/callback` | 403 | 403 | 400 | 200 düz metin `OK` |

Geçersiz imza ve `production_safety` 403 döner. Gövde JSON `rejected` olur; CREDIT yazılmaz. PayTR 403 yanıtında bildirimi yeniden deneyebilir. Bozuk gövde 400 döner. Boş gövde yoklaması 200 düz metin `OK` döner ve valör değildir. Resmî PayTR IP’si de geçersiz imzada 403 alır.

Kanonik yolda allowlist dışı IP, imza kapısından önce `ip_not_allowed` ile 403 döner. Panel takma adında aynı IP `paytr.webhook.ip_bypassed` uyarısı yazar ve HMAC kapısına devam eder; imza tutmazsa yine 403.

Kurtarma Inngest mutabakatıdır: `paytr-clearing-scan` her 30 dakikada `PENDING`, `PAID` ve son 7 gün `FAILED` siparişleri PayTR durum sorgusuna sorar. `paid` ve tutar eşleşirse CLEARED. PSP `failed` veya 2 saat `PENDING` ise FAILED. PSP yoksa sipariş `psp_unavailable` ile PENDING kalır.

Inngest anahtarları yoksa yedek `GET /api/cron/paytr-reconcile` rotasıdır. `vercel.json` `crons` ifadesi `0 3 * * *` (UTC, günde bir). Hobby planı günde birden sık cron ifadesini dağıtımda reddeder; `*/30 * * * *` bu dosyaya yazılmaz. Pro plana geçilince aynı yolun ifadesi otuz dakikaya çekilebilir.

Otuz dakikadan sık tarama, aynı rotaya dışarıdan gider. `CRON_SECRET` üretimde dolu olmalıdır. Boşsa rota 503, başlık tutmazsa 401 döner. Oturum rotayı açmaz.

```
curl -fsS -H "Authorization: Bearer $CRON_SECRET" "$NEXT_PUBLIC_APP_URL/api/cron/paytr-reconcile"
```

Webhook, Inngest serve, bu cron ve `npm run ops:reconcile-paytr-pending -- --apply` lisans kancalarını mutabakattan önce kaydeder (`registerPaytrValorLicenseHooks`). Kayıt yoksa CLEARED cüzdana yazılır ve lisans açılmaz.

- HMAC: `merchant_oid + merchant_salt + status + total_amount`, timing-safe.
- Aynı `merchant_oid` tekil CREDIT: `FOR UPDATE` + unique idempotency + CLEARED kısa devre.
- `total_amount === amountMinor` değilse clearing yok.
- Clearing throw → Inngest defer. `inngest.send` düşerse `"OK"` dönülmez.
- Üretim `user_ip` loopback / RFC1918 / IPv6 ise get-token fail-closed.
- `LIVE_BROADCAST_SHUTDOWN` açıkken webhook 503 (CREDIT yok, retry).

İlk canlı tanık şartı: `PaymentOrder.status=CLEARED` + `LedgerEntry` CREDIT + cüzdan `amount_minor`. Elle SQL CREDIT yasak.

## Canlı nakit tanığı (kalıcı sicil)

**18 Eylül 2026 — ₺15,00 PayTR CLEARED canlı kart tanığı alındı (Bakiye ₺10,00 -> ₺25,00, CREDIT defter kaydı oluşturuldu).** Super Admin, canlı iframe + 3D Secure. `amount_minor` 1000 → 2500; CLEARED 1500. Tam `merchant_oid` bu belgeye basılmaz. Operatör prosedürü bu sicildeki «Canlı nakit tanığı» bölümüdür (ayrı prosedür dosyası yoktur).
