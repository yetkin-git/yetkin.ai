# Ops — Inngest

İndeks: `.system_docs/OPS_RUNBOOK.md`.

- Uygulama id: `yetkin-rail`. Serve yolu: `/api/jobs/inngest` (`auth = "webhook"`).
- Cloud: `INNGEST_EVENT_KEY` + `INNGEST_SIGNING_KEY` (çift anahtar).
- Üretimde **ikisinden biri** boşsa `serve()` açılmaz. `/api/jobs/inngest` **503**.
- `INNGEST_DEV` üretimde bypass etmez.
- `GET /api/health` `checks.inngest` yalnız Cloud sicilidir.

İşler: PayTR valör (30 dk), emanet TTL (14 gün PENDING iade), emanet TTL yaklaşım (48 saat kala). `paytr-clearing-scan`: port unconfigured ise no-op.

## Üretim 503 çıkış

```
npm run ops:runtime-readiness
```

`NODE_ENV=production` iken Inngest çifti, PayTR üçlüsü veya `DATABASE_URL` boşsa çıkış **1**.

1. Inngest Cloud → App `yetkin-rail` → Event Key + Signing Key.
2. Üretim secret store: her iki anahtar dolu. `INNGEST_DEV` yazılmaz.
3. Süreç yeniden.
4. `GET /api/health` → `checks.inngest = "configured"`.
5. Serve URL: `{NEXT_PUBLIC_APP_URL}/api/jobs/inngest`.

Webhook clearing Inngest’e defer ederken event key boşsa **503** (`deferred_unacked`). Sahte ACK yok.

SMTP boş üretim bloğu **değildir**; bildirim atlanır, nakit durmaz.

## Hayalet emanet

```
npm run ops:ghost-wallet-holds
```

CREDIT / REFUNDED / RELEASED yazılmaz. Temizlik Super Admin incelemesidir.

`LIVE_BROADCAST_SHUTDOWN` açıkken Inngest serve/send fail-closed.
