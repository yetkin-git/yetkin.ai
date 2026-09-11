# Footer Kalıcı Temizlik Raporu — Şirket Künyesi ve Rozet Şeridi

| Alan | Değer |
|------|--------|
| Tarih | 11 Eylül 2026 |
| Kapsam | Ana sayfa ve tüm kamu footer DOM’undan unvan / VKN / MERSİS / Manisa adresi ve SSL/PayTR rozet şeridinin kalıcı sökümü |
| Yöntem | Kod + yüzey testi + `http://localhost:3000` tarayıcı DOM ölçümü. Tahmin yok. |
| Önceki raporlar | `docs/VITRIN_SADELESTIRME_RAPORU.md`, `docs/VITRIN_DUZELTME_RAPORU_02.md` — HEAD hâlâ künye basıyordu; bu paket kaynak ve testi kilitler. |

Bu rapor `docs/` altındadır. `/docs` build fixture değildir.

---

## Adım 1 — Footer DOM temizliği

Kamu vitrininde iki footer yüzeyi vardır. İkisinden de künye satırı, `sr-only` künye ve `SecurePaymentMarks` kaldırıldı.

| Bileşen | Kullanım | Birincil görünüm |
|---------|----------|------------------|
| `components/legal/legal-site-footer.tsx` | `app/(public)/layout.tsx` — `/`, `/legal/*`, `/iletisim`, `/hakkimizda`, `/p`, `/vize` | Yalnız `LEGAL_FOOTER_LINKS` nav’ı |
| `components/legal/legal-colophon-strip.tsx` | Akademi / Kariyer / Freelancer layout + pasaport | Aynı nav; künye ve rozet yok |

`LegalHonestyCard` ve `LegalEntityColophon` (`components/legal/legal-section-articles.tsx`) footer değildir; `/legal/*` sözleşme gövdesinde durur.

Footer’da kalan linkler (SSOT `LEGAL_FOOTER_LINKS`):

- Gizlilik → `/legal/gizlilik`
- Çerez → `/legal/cerez`
- İade → `/legal/iade`
- Mesafeli satış → `/legal/mesafeli-satis`
- Kullanım şartları → `/legal/kullanim`
- Hakkımızda → `/hakkimizda`
- İletişim → `/iletisim`
- `destek@yetkin.ai` → `mailto:destek@yetkin.ai`

Kaldırılan birincil görünüm:

- `Yapınet Gayrimenkul ve E-Ticaret Limited Şirketi · VKN … · MERSİS … · İnönü Mah…`
- `data-legal-entity-colophon` + `sr-only` `LEGAL_ENTITY_COLOPHON`
- Footer altındaki SSL / 3D Secure / PayTR rozet şeridi

Kasa rozetleri durur: `purchase-button`, `wallet-top-up-form`, `quick-top-up-modal`. Sözleşme metni PayTR yazmaz.

Footer inceldiği için kamu layout alt boşluğu `pb-36` → `pb-16`.

---

## Adım 2 — SEO ve yasal hizalama

| Yüzey | Künye |
|-------|--------|
| JSON-LD `Organization` (`lib/copy/json-ld.ts` → kök `app/layout.tsx` `siteGraphJsonLd`) | `legalName` = sicil unvanı; adres `PostalAddress`. Görünür footer değildir (`application/ld+json`). |
| `/legal/*` sözleşme sayfaları | `LegalHonestyCard` + madde gövdesi + `LegalEntityColophon` (`data-legal-colophon`) |
| Ana sayfa / kamu footer / ürün şeridi | Unvan, VKN, MERSİS, adres, SSL/PayTR rozeti **yok** |

SSOT değerler (`LEGAL_ENTITY`) değişmedi:

- Unvan: Yapınet Gayrimenkul ve E-Ticaret Limited Şirketi
- VKN: 9370683361 / Akhisar V.D.
- MERSİS: 937068336100017
- Adres: İnönü Mah. 157 Sk. No:3/C Akhisar/Manisa

`/hakkimizda` ve `/iletisim` kimlik kartları durur; bunlar footer değildir. Kasa Mesafeli Satış tikleri `/legal/mesafeli-satis`.

Kalıcı kilit: `tests/kernel/legal-launch-surface.test.ts` birincil vitrin dosyalarında `LEGAL_ENTITY.*`, `LEGAL_ENTITY_COLOPHON`, `SecurePaymentMarks`, `data-legal-entity-colophon`, sicil unvanı ve VKN/MERSİS dizgilerini yasaklar; JSON-LD + `/legal/*` künyeyi zorunlu tutar. `tests/copy/seo-surface.test.ts` `Organization.legalName` olumlu, ana sayfa/footer olumsuz iddia taşır.

---

## Adım 3 — Doğrulama

`npx vitest run tests/kernel/legal-launch-surface.test.ts tests/copy/seo-surface.test.ts` — **2 dosya, 29 test, geçti**.

Tarayıcı `http://localhost:3000` (11 Eylül 2026):

| Yüzey | Beklenen | Sonuç |
|-------|----------|--------|
| `/` footer `innerText` | Gizlilik, Çerez, İade, Mesafeli satış, Kullanım şartları, Hakkımızda, İletişim, `destek@yetkin.ai` | **OK** |
| `/` `document.body.innerText` | Yapınet / VKN / MERSİS / Akhisar/Manisa yok | **OK** |
| `/` rozet | `data-ssl-mark` / `data-paytr-mark` / `data-legal-entity-colophon` yok (`markCount = 0`) | **OK** |
| JSON-LD | `Organization.legalName` sicil unvanı | **OK** (`orgHasLegalName = true`) |
| `/legal/gizlilik` | Honesty kart + madde gövdesi + sayfa altı `LegalEntityColophon`; footer yine yalnız nav | **OK** |

---

## Güncellenen dosyalar

| Dosya | Durum |
|-------|--------|
| `components/legal/legal-site-footer.tsx` | Künye + rozet yok; nav + e-posta |
| `components/legal/legal-colophon-strip.tsx` | Künye + rozet yok; nav + e-posta |
| `app/(public)/layout.tsx` | `pb-16` |
| `tests/kernel/legal-launch-surface.test.ts` | Footer olumsuz iddia + kalıcı vitrin yasağı |
| `tests/copy/seo-surface.test.ts` | JSON-LD olumlu; ana sayfa/footer künye yok |
| `docs/FOOTER_KALICI_TEMIZLIK_RAPORU.md` | Bu rapor |

Sözleşme gövdesi (`lib/copy/legal-launch.ts`) değişmedi.
