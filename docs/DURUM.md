# DURUM — yetkin.ai (haftalık)

| Alan | Değer |
|------|--------|
| Tarih | 13 Eylül 2026 |
| Kaynak | Faz 2 hazırlık (cüzdan hop + Redis port) |

- Kamu vitrin: Panel + Akademi + Kariyer + `/vize` kanıt URL’si.
- Freelancer kamu 410; Split stub.
- Mühürlü ders: **1** (`01_office_ai-1`).
- Video katmanı: terk.
- Motor 2: keşif.
- Dron: T3 Akademi UI bağlı; Tezgâh Closed Testing'te izole (`tezgahStoreIsolated: true`). `publishFrozenUntilFaz1Close: false`. `@yetkin/kernel` v1.0.0 tüketir. EAS profilleri `apps/rail-is/eas.json`; CI eas basmaz.
- v1 hop: 16 kayıt (7 yazma). Cüzdan top-up + müfredat/sınav GET+POST + kamu sertifika.
- `LIVE_BROADCAST_SHUTDOWN`: varsayılan kapalı (13 Eylül 2026). Acil kapatma env `true|1`.
