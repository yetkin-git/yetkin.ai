# MAĞAZA YAYIN RAPORU — Tezgâh izolasyonu + EAS hattı + inceleme notu

| Alan | Değer |
|------|--------|
| Tarih | 13 Eylül 2026 |
| Hazırlayan | Senior Software Architect / Sistem Analisti ajanı |
| Girdi | `docs/FAZ2_TAMAMLAMA_RAPORU.md` (85/100) + Aşama 5 görevi |
| Yöntem | Sıfır varsayım. Her iddia dosya yoluna bağlıdır. |
| Teslim | Bu dosya + `docs/MAĞAZA_INCELEME_NOTU.md` |
| Closed Testing bayrağı | `publishFrozenUntilFaz1Close: false` |
| Tezgâh yüzeyi | **İzole** (`DRON_TEZGAH_STORE_ISOLATED: true`) |
| Mağaza binary hattı | **Hazır** (`apps/rail-is/eas.json`; CI eas basmaz) |
| Mağaza binary artefaktı | Bu oturumda **basılmadı** (EAS hesabı / projectId / Secrets operatör) |

---

## 0. Yönetici özeti

Faz 2 tamamlama raporu üç kilit eksiği yazmıştı: (1) Tezgâh sekmeleri inceleme uzmanına görünür, (2) `eas.json` yok, (3) IAP/HMAC inceleme notu yok. Bu oturum üçünü koda ve belgeye bağladı.

İnceleme uzmanı varsayılan yüzeyde **yalnız Akademi T3 halkasını** görür: Giriş → Cüzdan → Satın alma → Ders → Sınav → Mühürlü sertifika. “Açık işler / İşlerim” sekmesi gizlidir. Kaçak `HOME_TAB` kilit kartına düşer (`Faz 2 — Yansıtma bekleniyor`); 410 hop UI’ya bağlanmaz.

EAS development / preview / production profilleri `apps/rail-is/eas.json` içindedir. Kök `eas.json` yoktur. CI, kök `package.json` script’leri ve Dron `scripts` `eas` / `eas-cli` / `expo publish` **içermez**. Binary operatör basar.

**Kapalı test derlemesini almaya altyapı hazırdır. “%100 mağazaya sürüldü” değildir.** Pist ışıkları yandı; uçak henüz kuleye (Expo hesabı, EAS Secrets, ikon, nakit tanığı, konsol notu) teslim edilmedi.

---

## 1. TEZGÂH İZOLASYONU

### 1.1 Karar

Gizleme **ve** kilit kartı birlikte:

| Katman | Davranış |
|--------|----------|
| Sekme çubuğu | `DRON_TEZGAH_STORE_ISOLATED` açıkken “Açık işler / İşlerim / Akademi” üçlüsü **çizilmez**. Tek yüzey Akademi’dir. |
| Kaçak state | `jobs` / `bench` / `job` → `Phase2LockScreen`. JobList / Bench / teklif ekranı bağlanmaz. |
| HTTP | `loadHome` Tezgâh hop’unu çağırmaz. `refreshBench` ve 30 sn anketi durur. İstemci hâlâ `DRON_FAZ2_FROZEN` ile path’e HTTP atmaz. |
| Split / 410 | `FREELANCER_PUBLIC_SURFACE_LOCKED: true`, `MARKETPLACE_SPLIT_LIVE: false`. Değişmedi. |

İnceleme uzmanı kırık Tezgâh veya 410 kartı görmez. Apple 2.1 / Play “incomplete” riski, görünür ölü sekmeden doğmaz.

### 1.2 Dosyalar

- `apps/rail-is/src/api/hops.ts` — `DRON_TEZGAH_STORE_ISOLATED = true`
- `apps/rail-is/src/screens/Phase2LockScreen.tsx` — kilit kartı (`dron-phase2-lock`)
- `apps/rail-is/src/ui/copy.ts` — `phase2Lock` (kicker **Faz 2**, başlık **Yansıtma bekleniyor**)
- `apps/rail-is/App.tsx` — sekme gizleme + kilit; Tezgâh ekranları `tezgahOpen` arkasında
- `apps/rail-is/src/runtime/use-dron-app.ts` — `skipTezgah`; bench poll yok
- `apps/rail-is/package.json` → `yetkin.tezgahStoreIsolated: true`
- `apps/rail-is/app.config.ts` → `extra.tezgahStoreIsolated: true`

Reducer / `visibleScreen` protokol testleri durur (`HOME_TAB` jobs hâlâ `jobs` döner). İzolasyon UI + runtime kapısıdır; sahte `jobs: []` basılmaz.

### 1.3 Geri açma

Split lisans + freelancer hop sicile geri yazılınca `DRON_TEZGAH_STORE_ISOLATED = false` (hops, `package.json`, `app.config.ts` üçlüsü). Tek başına false yapmak 410 Tezgâh’ı mağazaya bağlar — yapılmaz.

---

## 2. EAS BUILD YAPILANDIRMASI

### 2.1 Ne eklendi

`apps/rail-is/eas.json`:

| Profil | Çıktı | Dağıtım |
|--------|-------|---------|
| `development` | Android APK + iOS simulator | `developmentClient`, internal |
| `preview` | Android APK | internal (kapalı test öncesi cihaz) |
| `production` | Android AAB (`app-bundle`) | mağaza; iOS IPA EAS varsayılan arşiv |

`submit.production.android`: `track: internal`, `releaseStatus: draft` — operatör onaylamadan Play’e canlı düşmez.

`cli.appVersionSource: local` — sürüm `app.config.ts` `version: "0.0.1"`.

### 2.2 CI / güvenlik — bozulmadı

| Kilit | Durum |
|-------|--------|
| Kök `eas.json` | Yok |
| `.github/workflows/ci.yml` | `eas` / `eas-cli` / `expo publish` yok; `npm run verify:prebuild` durur |
| Kök `package.json` scripts | `eas` yok |
| `apps/rail-is/package.json` scripts | `eas` / `eas build` yok (operatör global veya `npx eas-cli`) |
| `workspaces` | `["packages/*"]` — Dron workspace değildir |
| `extra.eas.projectId` | Uydurulmadı. `eas init` bağlar |
| Secrets | `service_role` yok. Üç `EXPO_PUBLIC_*` EAS Secrets |
| Gitignore | `apps/rail-is/android/`, `apps/rail-is/ios/` (yerel prebuild kalıntısı) |

Operatör reçetesi: `.system_docs/ops/ops-dron.md`.

```
cd apps/rail-is
eas init
eas secret:create --name EXPO_PUBLIC_RAIL_API_BASE --value https://yetkin.ai --scope project
eas build --profile preview --platform android
eas build --profile production --platform android
eas build --profile production --platform ios
```

Bu oturumda EAS hesabı yoktu; komutlar **koşulmadı**. APK/AAB/IPA artefaktı doğmadı.

### 2.3 Bilinçli açıklar (binary’yi durduranlar, hattı değil)

- Expo `projectId` yok — ilk `eas init` operatör + hesap.
- 1024 ikon / splash PNG yok (`public/icon.svg` mağaza paketi değildir).
- iOS Apple Team / ASC App ID `submit`’te yok (taslak Android yeter; IPA imza hesabı ister).
- Native IAP yok — doğru; inceleme notu şart.

---

## 3. İNCELEME NOTU VE IAP BİLDİRİMİ

Dosya: `docs/MAĞAZA_INCELEME_NOTU.md`

İçerik:

1. İngilizce yapıştırma bloğu (App Store Connect / Play Console).
2. HMAC `/kasa` gerekçesi: nakit SSOT Amiral defteri; native kart/WebView yok; IAP ikinci tahsilat olur.
3. Test hesabı şablonu: `E2E_T3_EMAIL` / `E2E_T3_PASSWORD` — **değer git’te yok**. Konsola operatör yazar. Yeni gmail icat edilmez.
4. Mutlu yol altı adım. Tezgâh’ın gizli olduğu açıkça yazılı.

`.env.example` boş `E2E_T3_*` durur. Bu ajan oturumunda `.env.local` okunmadı (sır tarama yasağı). “net giriş bilgisi” = şablon + kaynak anahtar adları. Dolu şifre yazmak Anayasa A5 ve `verify:no-secrets` ihlali olur.

---

## 4. DOĞRULAMA KAPILARI (bu oturum)

Koşulan (yeşil):

- `npm run typecheck:rail-is` — çıkış 0
- `tests/kernel/faz2-t3-dron-ring-surface.test.ts` — 3 test
- `tests/kernel/rail-is-dron-lab-surface.test.ts` — 10 test (EAS var; CI eas yok)
- `tests/dron/verify-dron-ui-states.test.ts` — 14 test
- `tests/dron/verify-dron-v1-protocol.test.ts` — 20 test
- `tests/kernel/faz1-operating-picture-surface.test.ts` — 6 test

Toplam bu kümede **53/53**.

Koşulmayan (neden):

- `eas build` — Expo hesabı / `projectId` bu ortamda yok; uydurulmadı
- `ops:t3-academy-loop` — canlı Amiral + PayTR HMAC tanığı hâlâ ayrı kapı (`FAZ2_TAMAMLAMA_RAPORU.md` §1.3)
- Cihaz / Expo Go E2E — native suite yok; tarayıcı Dron çizmez
- Mağaza konsoluna binary yükleme

---

## 5. SEN OLSAYDIN NE YAPARDIN?

### 5.1 Sürü Dron kapalı test derlemesini almaya %100 hazır mı?

**Altyapı: evet. Teslim: hayır.**

Hazır olan (bu oturum + Faz 2 tamamlama):

- T3 protokol + Dron Akademi UI
- Tezgâh inceleme yüzeyinden çıkarıldı
- `eas.json` üç profil; CI güvenlik kilidi durur
- İnceleme notu HMAC `/kasa` + IAP yok
- Yayın bayrağı `publishFrozenUntilFaz1Close: false`
- Üretim 503 varsayılan kapalı

Hazır olmayan (kule checklist):

1. **EAS project bağlanmadı.** `eas init` + Expo org + Android keystore / iOS cert. Uydurma UUID yazılmadı.
2. **Binary basılmadı.** Closed Testing bir AAB/IPA ister; repo hattı basmaz, operatör basar.
3. **Canlı nakit tanığı yok.** `ops:t3-academy-loop` bu ajan oturumunda koşulmadı. Fonlanmamış inceleme hesabı satın almada dürüst hata basar; sahte yeşil yok.
4. **Mağaza ikonu / splash / listing** (1024, gizlilik, Data safety) yok.
5. **Redis prod hâlâ opsiyonel.** İkinci instance kota deliği; Closed Testing tek instance ile yaşar, ölçek iddiası basılmaz.
6. **Apple 3.1.1 riski durur.** Dijital eğitim + web tahsilat, IAP’siz native iOS’ta reddedilme kapısıdır. Not yazmak riski sıfırlamaz. Play Closed Testing önce; TestFlight sonra. iOS’ta “reader” istisnası (3.1.3) satın alma CTA’sını da kısıtlar — ürün kararı IAP eklemek veya iOS’ta yükleme CTA’sını kesmek olabilir. Bu oturum IAP icat etmedi (bilinçli).
7. **Kernel `file:`** — 426 penceresi aynı commit umuduna bağlı.

Bugün `eas build --profile preview` **operatör hesabıyla** koşulabilir. Bugün “mağazaya %100 hazır, yükle” demek yalan olur.

### 5.2 Kapalı test başladıktan sonra 2. Dron ve Pazaryeri (Split) — ilk adım ne zaman?

Sıra değişmedi. Tezgâh izolasyonu ve EAS hattı **T3 saha yeşilinin yerine geçmez**.

| Sıra | Kapı | Ne zaman |
|------|------|----------|
| 1 | Staging `ops:t3-academy-loop` yeşil (HMAC CREDIT, üretimde sandbox kapalı) | Web nakit tanığı |
| 2 | `eas build --profile preview` cihaz: giriş → kasa → DEBIT → ders → sınav → mühür | Internal track |
| 3 | Play Closed Testing (T3-only, inceleme notu yapıştırılmış, fonlu `E2E_T3`) | 1–2 yeşilse |
| 4 | TestFlight — 3.1.1 notu ile; reddedilirse iOS CTA kes veya IAP ayrı kapı | Play saha yeşili sonrası tercih |
| 5 | `RATE_LIMIT_REDIS_REST_*` prod çifti | İkinci instance öncesi |
| 6 | İdari Pazaryeri (K-5) + `MARKETPLACE_SPLIT_LIVE` + freelancer hop sicile geri yazım | T3 Dron kapalı testi **saha yeşili** (inceleme onayı + en az bir gerçek DEBIT→mühür) **sonra** |
| 7 | `DRON_TEZGAH_STORE_ISOLATED = false` | 6 ile aynı commit ailesi; aksi halde 410 Tezgâh mağazaya çıkar |
| 8 | 2. Dron (`npm run dron:new -- --id=…` + `@yetkin/kernel` aynı major) | Yeni hop = meta + Zod + handler + test + paket. T3 saha yeşili + Split taslağı dururken **iskelet** açılabilir; kamu bayrağı kapalı kalır (`DRON_<ID>_OPEN` yok) |
| 9 | `FREELANCER_PUBLIC_SURFACE_LOCKED=false` | Split lisans + Tezgâh hop 2xx |

**2. Dron’u ne zaman?** Kapalı test **başladığı an değil**. İlk yeşil saha halkası (inceleme uzmanı veya iç tester: yükleme→satın alma→mühür) görüldükten sonra `dron:new` iskeleti açılır; Pazaryeri hop’u o iskelete bağlanmaz. Split’in ilk adımı idari K-5 + lisanslı PayTR Pazaryeri, Dron sekmesini açmak değil.

**Özet cümle:** Tezgâh gizlendi; EAS profili durur; inceleme notu HMAC’i anlatır. Kapalı test **yayını** için operatör `eas init` + Secrets + fonlu hesap + (dürüst olmak gerekirse) bir nakit tanığı gerekir. 2. Dron ve Split, T3 saha yeşilinden sonradır.

---

## 6. BİLİNÇLİ OLARAK YAPILMAYANLAR

- `eas build` / `eas submit` koşulmadı; Expo `projectId` icat edilmedi
- Native IAP / Play Billing / StoreKit eklenmedi
- Freelancer hop sicile geri yazılmadı; Split stub durur
- `DRON_TEZGAH_STORE_ISOLATED` false yapılmadı
- `E2E_T3` şifresi git’e yazılmadı
- Redis prod zorunlu kılınmadı
- Canlı PayTR 3DS ve cihaz E2E icat edilmedi
- `docs/TEDAVI_RAPORU.md` / `docs/FAZ2_HAZIRLIK_RAPORU.md` / `docs/FAZ2_TAMAMLAMA_RAPORU.md` tarihsel bırakıldı
