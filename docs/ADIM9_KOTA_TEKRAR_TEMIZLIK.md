# Adım 9 — Tezgâh kota tekrarı temizliği

**Tarih:** 20 Kasım 2026  
**Kapsam:** `components/tezgah/workbench.tsx`, `tests/tezgah/surface.test.ts`  
**Doğrulama:** `npx tsc --noEmit` geçti; `tests/tezgah/surface.test.ts` → 10/10 geçti.

---

## Özet

`/tezgah` yüzeyinde kota göstergesi iki yerde basılıyordu. Sağ üstteki genel rozet korundu; Girdi form kartındaki ikinci `"Kalan ücretsiz hakkınız: X / Y"` satırı (ve yanındaki erken kayıt CTA’sı) tüm Tezgâh araçlarından kaldırıldı.

---

## Değişiklikler

| Dosya | Ne oldu |
|---|---|
| `components/tezgah/workbench.tsx` | `data-tezgah-quota-early` bloğu silindi. `data-tezgah-quota` portal/rozet (sağ üst) aynen kaldı. |
| `tests/tezgah/surface.test.ts` | `data-tezgah-quota-early` artık **olmaması** bekleniyor. |

---

## Korunan / kaldırılan

- **Korunan:** Sayfa sağ üstündeki `tezgahQuotaLine` rozeti (`data-tezgah-quota`).
- **Kaldırılan:** Girdi kartında araç başlığının altındaki tekrar satırı + misafir için “ücretsiz hesap aç” erken CTA satırı.
- Misafir kota dolunca mevcut `TEZGAH_GUEST_QUOTA_MESSAGE` kartı ve kayıt akışı çalışmaya devam eder.
