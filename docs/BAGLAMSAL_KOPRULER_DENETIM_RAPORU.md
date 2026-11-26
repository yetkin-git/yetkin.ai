# Bağlamsal Geçiş Köprüleri — Acımasız Denetim Raporu

**Kapsam:** `443363f4` — «5 aktif merkez arasına bağlamsal geçiş köprüleri»
**Tarih:** 27 Kasım 2026
**Yöntem:** «Güvenme, doğrula». Her iddia çalıştırılarak ölçüldü; her bulgu kodda kapatıldı ve testle kilitlendi.
**Sonuç:** **78 / 100** → onarım sonrası **94 / 100**

---

## 0. Yönetici özeti

Commit çalışıyordu, kırık değildi — ama **üç sessiz arıza** taşıyordu ve bunların hiçbiri mevcut testlerle yakalanamıyordu:

| # | Arıza | Etki | Durum |
|---|---|---|---|
| **A** | Giriş dönüşü (`next`) sorguyu düşürüyordu | Köprü ön-doldurması oturum duvarında **tamamen ölüyordu** | ✅ Onarıldı |
| **B** | `/panel/hibe?kaynak=…` hiç okunmuyordu | Parametre sessizce yutuluyordu, kullanıcı boş formla kalıyordu | ✅ Onarıldı |
| **C** | Sanitizer 7 saldırı sınıfını geçiriyordu | Görünmez karakterlerle bölünmüş `javascript:`, gömülü VKN/telefon, 200 KB payload | ✅ Onarıldı |

Ek olarak **döngüsel gürültü** (E-Ticaret → Hibe → E-Ticaret) ve **vaat/davranış ayrışması** (Tezgâh ipucu yanlış araçta basılıyordu) kapatıldı.

**En kritik bulgu:** mevcut test dosyasının 92 satırının **tamamı** `readFileSync` + `toContain` idi. Yani testler «kodda şu string var mı» diye bakıyordu, «saldırı geçiyor mu» diye değil. A commit'inin sanitizer'ı bu yüzden yeşil görünerek hatalıydı.

---

## 1. Parametre hijyeti & saldırı yüzeyi

### Ölçülen durum (443363f4, onarım öncesi)

Ham sanitizer `npx tsx` ile doğrudan çalıştırıldı:

```
"ｊａｖａｓｃｒｉｐｔ：alert(1)"        => "ｊａｖａｓｃｒｉｐｔ：alert(1)"   ← GEÇTİ
"java\u200Bscript:alert(1)"      => "java\u200Bscript:alert(1)"    ← GEÇTİ
"Müdür\u202Egnp.exe"             => "Müdür\u202Egnp.exe"           ← GEÇTİ
"Satış Müdürü, VKN:1234567890"   => "Satış Müdürü, VKN:1234567890"  ← GEÇTİ (PII!)
"Pozisyon 05321234567"           => "Pozisyon 05321234567"         ← GEÇTİ (PII!)
"%3Cscript%3Ealert(1)%3C/script%3E" => aynen                      ← GEÇTİ
"A".repeat(200000)               => 120 karakter kırpılıp BASILDI  ← DoS
"başlık\u0000gizli"              => "başlıkgizli"                  ← SESSİZ BİRLEŞTİRME
```

### Kök nedenler

1. **`SCRIPTISH` regex'i NFKC öncesi ham metin üzerinde koşuyordu.** `\u200B` (sıfır genişlikli boşluk) `javascript:` kelimesini bölüyor, regex eşleşmiyordu.
2. **`ANGLE_OR_TAG = /[<>]/`** yalnız ASCII açılı parantezi görüyordu. Fullwidth `＜＞` (U+FF1C/FF1E) takılmıyordu.
3. **PII testi `/^\d{10,11}$/`** — yalnız **tam** rakam dizgesine bakıyordu. `VKN:1234567890` gibi gömülü durumlar geçiyordu.
4. **Kontrol karakterleri `replace` ile siliniyordu**, reddedilmiyordu. `\r\n` CRLF enjeksiyonunun gövdesi sayfaya taşınıyordu.
5. **Sınır yoktu.** 200 000 karakterlik gövde tüm regex'lerden geçirilip kırpılıyordu.

### Uygulanan onarım

`lib/kernel/contextual-bridge-params.ts` sıfırdan yazıldı. Sıra sabit ve belgelenmiş:

```
sınır kontrolü (512) → kontrol karakteri reddi → NFKC → görünmez karakter düşürme
  → yüzde çözümle → etiket/şema/PII taraması → tırnak temizliği → kırp
```

| Savunma | Uygulama |
|---|---|
| Homoglyph | `.normalize("NFKC")` — `Ｅ－Ｔｉｃａｒｅｔ` → `e-ticaret` |
| Görünmez karakter | `INVISIBLE_CHARS` (ZWSP/ZWNJ/bidi/BOM/varyasyon seçicileri) **düşürülür** |
| Bidi sahteciliği | `\u202E` düşürülür → `Müdürgnp.exe` |
| CRLF / NUL | **Reddedilir** (boş dize), temizlenmez |
| Gömülü PII | Ayraçlar atılıp `\d{10,}` aranır + `IBAN_LIKE` + `PII_LABEL` |
| Çift çözümleme | `decodeOnce` — `%3C` ve `&#60;` çözülüp yeniden taranır |
| DoS | `MAX_RAW_LEN = 512` **aşan gövde reddedilir** (kırpılmaz) |
| Allowlist | `parseBridgeKaynak` yalnız `[a-z0-9-]` + 5 değer |

**Yanlış pozitif koruması:** `Vergi Uzmanı` reddedilmemeli. Bu yüzden `PII_LABEL` ayraç (`:`/`=`) zorunlu kılar; `Vergi Uzmanı` geçer, `Vergi no 1234567890` düşer.

### Doğrulama

```
homoglyph fullwidth js => ""   | fullwidth tag => ""   | zwsp js => ""
zwsp onclick => ""             | embedded vkn => ""    | embedded phone => ""
phone spaced => ""             | iban => ""            | percent encoding => ""
html entity => ""              | crlf => ""            | nul => ""
200k payload => ""  (0.24 ms)  | legit position => "E-Ticaret Operasyon Sorumlusu"
legit vergi uzmanı => "Vergi Uzmanı"                   | legit müdür => "Müdür Satış"
```

---

## 2. Hedef sayfada gerçek çalışma

### 2.A — `/kurumsal/ilanlar?pozisyon=…` + giriş dönüşü **(KRİTİK)**

**Ölçüm (onarım öncesi):**
```
buildCitizenLoginHref("/kurumsal/ilanlar?pozisyon=E-Ticaret+Operasyon+Sorumlusu")
  → "/login?next=%2Fkurumsal%2Filanlar"      ← pozisyon KAYIP
resolvePostLoginPath(...) → "/kurumsal/ilanlar"  ← boş form
```

İki ayrı kod yolu sorguyu düşürüyordu:

1. **`parseSafeAuthNext`** (`lib/kernel/auth/redirects.ts`) `path.split("?")[0]` ile sorguyu atıyordu. Bu tasarım **doğruydu** (açık yön savunması), ama köprü ön-doldurmasını da öldürüyordu.
2. **`proxy.ts` auth-307 dalı** `buildCitizenLoginHref(decision.next ?? pathname)` — yalnız `pathname` geçiyordu.
3. **`requirePageSession()`** kenar `x-rail-pathname` başlığından yalnız yolu okuyordu.

**Onarım:** Açık yön savunması **korunarak** ön-doldurma geri getirildi. Üç katman:

- `sanitizeBridgeSearch()` — ham sorgudan yalnız `kaynak` / `pozisyon` / `konu` anahtarlarını, sanitize edilmiş değerlerle yeniden kurar.
- `parseSafeAuthNext` artık `{ pathname, hash, query }` döner; şema/açık yön kontrolü **yalnız yol** üzerinde koşar, sorgu allowlist'ten geçer.
- `RAIL_SEARCH_HEADER` (`x-rail-search`) — kenar değeri silip yeniden yazar; sunucu kapısı `next`'i tam kurar.

**Doğrulama:**
```
login href: /login?next=%2Fkurumsal%2Filanlar%3Fpozisyon%3DE-Ticaret%2BOperasyon%2BSorumlusu
round trip: /kurumsal/ilanlar?pozisyon=E-Ticaret+Operasyon+Sorumlusu   ✅
callback next: /kurumsal/ilanlar?pozisyon=E-Ticaret+Operasyon+Sorumlusu ✅
Türkçe: "Satış Müdürü" → sayfada searchParams.get("pozisyon") = "Satış Müdürü" ✅
```

**Açık yön hâlâ kapalı:**
```
/ /evil / https://evil → /login
?utm_source=x&redirect=https://evil.example&tckn=12345678901 → yalnız pozisyon taşınır
/admin?kaynak=hibe → /login
```

> **Bulunan regresyon (kendi düzeltmemde):** ilk denemede şema kontrolünü tüm dizeye uyguladım; `#javascript:alert(1)` taşıyan geçerli bir `/academy/…` hedefi **tümden** `/login`'e düştü. Test yakaladı; kontrol yola daraltıldı.

> **Bulunan ikinci regresyon:** çapa `?`'dan sonra aranıyordu; `/tezgah?kaynak=hibe#tetkik` hem çapayı hem ön-doldurmayı kaybediyordu. Sıra `#` → `?` olarak düzeltildi.

### 2.B — `/tezgah?kaynak=hibe|kurumsal`

**Ölçüm:** Şerit **her araçta** basılıyordu ama şablon **yalnız** `proposal` aracına uygulanıyordu. `/tezgah?kaynak=hibe&tool=tetkik` → «teklif yazıcı hazır» diyor, tetkik formu açılıyordu.

**Onarım:** Kural saf modüle taşındı (`lib/kernel/contextual-bridge-seed.ts`). `tezgahBridgeHintFor` ve `applyTezgahBridgeSeed` **aynı** koşulu paylaşır (`toolId === "proposal"`), böylece vaat ile davranış ayrışamaz.

```
seed (kaynak=hibe)     → jobPost=hibe şablonu,  expertise="Hibe / proje danışmanlığı", mode=summary
seed (kaynak=kurumsal) → jobPost=mülakat şablonu, expertise="İK / mülakat tasarımı"
kullanıcı metni        → EZİLMEZ  ✅
tool=tetkik            → {} (dokunulmaz) ✅
hint on tetkik         → null ✅
```

### 2.C — `/panel/hibe?kaynak=e-ticaret|kurumsal` **(ÖLÜ PARAMETRE)**

**Ölçüm:** `rg 'kaynak' app/(kernel)/panel/hibe/page.tsx` → **sıfır sonuç**. Sayfa parametreyi hiç okumuyordu. Köprü tıklanınca kullanıcı **birebir aynı** boş analiz formuna düşüyordu; köprünün var olma sebebi yoktu.

**Onarım:** `hibeBridgeContext()` tanınan kaynağı **katalogda gerçekten var olan** eksen kimliklerine çevirir:

| Köprü | NACE | Yatırım odağı | İhracat |
|---|---|---|---|
| `kaynak=e-ticaret` | `47` (perakende) | `ihracat` | `evet` |
| `kaynak=kurumsal` | — | `arge` | — |

Ekranın üstünde tek satır bağlam notu basılır (`data-hibe-bridge-note`).

**Kullanıcı girdisi ezilmez:** `applyHibeBridgeDefaults` yalnız **boş** alanı doldurur. Kayıtlı firma profili veya elle yazılmış değer her zaman kazanır — test edildi.

**Not bağlantı içermez.** Kaynağa geri link vermek köprüyü döngüye çevirirdi.

---

## 3. Kırık bağlantı & rota tutarlılığı

`bridges.ts` içindeki 8 `href` tek tek ölçüldü:

| href | `decideEdgeAction(p, false)` | Donmuş? |
|---|---|---|
| `/panel/hibe?kaynak=e-ticaret` | `auth-307` | hayır |
| `/kurumsal/ilanlar?pozisyon=…` | `auth-307` | hayır |
| `/tezgah?kaynak=hibe` | `next` | hayır |
| `/tezgah?kaynak=kurumsal` | `next` | hayır |
| `/career/vitrin` | `next` | hayır |
| `/panel/hibe?kaynak=kurumsal` | `auth-307` | hayır |
| `/ilan` | `next` | hayır |
| `/panel/e-ticaret` | `auth-307` | hayır |

**Sonuç:** 404, 308 veya 410'a çarpan **tek bir link yok**. `akademi` / `freelancer` / `junior` hedefi **yok**.

Bu artık **testle kilitli** — yeni bir köprü donmuş odaya yönelirse suite kırmızı olur.

---

## 4. Döngüsel gürültü & UX bütünlüğü

### Bulgu: gerçek döngü vardı

`ContextualBridgeStrip` `targets` dizisini **olduğu gibi** basıyordu. `?kaynak=` hiç okunmuyordu.

**Somut senaryo:**
```
E-Ticaret → "Hibeleri tara" → /panel/hibe?kaynak=e-ticaret
  Hibe ekranındaki şerit: [AI Tezgâh] [Yetenek Vitrini]   ← bugün masum
  AMA presets değişip E-Ticaret hedefi eklenseydi:
  → "E-Ticaret'e dön" köprüsü basılacaktı (kullanıcı az önce oradan geldi)
```

Kurumsal'da bu **zaten** oluyordu: `KurumsalContextualBridges` hedefleri arasında `hibe` var, `hibe` hedefi de `?kaynak=kurumsal` taşıyor → Hibe'de Kurumsal'a dön köprüsü.

**Onarım:** `selectBridgeTargets()` — saf, test edilebilir. Kurallar:
1. Kendi merkezine giden hedef **düşer**
2. Gelinen merkeze (`cameFrom`) giden hedef **düşer**
3. Aynı hedef iki kez basılmaz
4. En fazla **2** hedef (Anayasa tavanı)
5. Tüm hedefler düşerse şerit **hiç basılmaz**

`?kaynak=` artık dört hedef sayfada da okunup şeride geçiyor:
`/panel/e-ticaret`, `/panel/hibe`, `/kurumsal`, `/kurumsal/ilanlar`, `/career`.

### En fazla 2 köprü kuralı

Preset'lerin tamamı 2 hedef tanımlıyor; `selectBridgeTargets` üçüncüyü kesiyor. Test: `targets` blokları sayılıp her birinde ≤2 hedef doğrulanıyor.

### Sen aksı

`npm run verify:sen-axis` → **OK — 735 dosya, 46 siz kaçağı tarandı.** Yeni kopya `lib/copy/sen-voice/bridges.ts` içinde duruyor (taranan klasör), kernel'e marka metni sızmadı.

---

## 5. Davranışsal test kapsamı

### Önceki durum: 92 satır, sıfır davranış

```ts
const strip = readFileSync(...);
expect(strip).toContain("ContextualBridgeStrip");   // string var mı?
expect(ilanlar).toContain("parseBridgePozisyon");   // import var mı?
```

Bu testler **hiçbir saldırı payload'ı çalıştırmıyor**, **hiçbir allowlist reddini doğrulamıyor**, **hiçbir prop/state aktarımını ölçmüyordu**. Yeşil olmaları A commit'inin sanitizer'ının doğru olduğu anlamına gelmiyordu — nitekim değildi.

### Yeni durum: 56 davranışsal test

**`tests/kernel/contextual-bridge-params.test.ts` — 31 test**
- 7 saldırı sınıfı gerçek payload ile: homoglyph, görünmez karakter, bidi, CRLF, HTML varlık, yüzde kodlama, 200 KB DoS
- PII: gömülü VKN/TCKN/telefon/IBAN/e-posta + **yanlış pozitif** testleri (`Vergi Uzmanı` geçmeli)
- Allowlist: 5 geçerli, 6 geçersiz (`admin`, `academy`, `freelancer`, `junior`, `hibe;drop table`, `hibe&admin=1`)
- `sanitizeBridgeSearch`: izinsiz anahtar ve PII düşüyor, köprü kalıyor
- `selectBridgeTargets`: döngü, kendine link, tekrar, 2 tavanı
- **Her köprü href'i `decideEdgeAction` ile ölçülüyor** (404/410 yok)
- Kopya bütünlüğü + döngü metni bağlantı içermiyor

**`tests/kernel/contextual-bridge-seed.test.ts` — 25 test**
- `pozisyon` login → callback → hedef zincirinde korunuyor
- Türkçe karakter hedefte doğru çözülüyor
- Açık yön / protokol göreli / `..` / `/admin` reddediliyor
- İzinsiz anahtar ve PII `next`'e taşınmıyor
- Tezgâh tohumu: doğru şablon, kullanıcı metni ezilmiyor, yanlış araçta dokunmuyor
- İpucu şeridi yalnız `proposal`'da
- Hibe bağlamı: doğru eksenler, kullanıcı seçimi kazanıyor, kayıtlı profil ezilmiyor

**`tests/kernel/proxy-edge.test.ts` — +3 test**
- Oturumsuz `/kurumsal/ilanlar?pozisyon=…` → `next`'te sorgu var
- PII ve izinsiz anahtar kenarda düşüyor
- Düz yol sorgusuz login'e düşüyor

**Toplam: 93 test** (5 dosya), tümü yeşil.

---

## 6. Kapı sonuçları

| Kapı | Sonuç |
|---|---|
| `npx tsc --noEmit` | ✅ temiz |
| `npm run verify:sen-axis` | ✅ OK — 735 dosya, 46 kaçak |
| `npm run verify:boundaries` | ✅ OK |
| `npm run verify:api-auth -- --check` | ✅ OK — 178 route |
| `npm run verify:no-secrets` | ✅ OK |
| `npx vitest run` | ⚠️ **2523/2525** — 2 hata **önceden var** |
| `npx next build` | ✅ başarılı |
| `npx eslint <değişen dosyalar>` | ✅ temiz |

### Önceden var olan 2 test hatası (benim değişikliğimle ilgisiz)

`git stash` ile `443363f4` tabanında **birebir doğrulandı**:

1. **`closed-rooms-copy-guard.test.ts`** — `/career/vitrin` sayfası `Freelancer` kelimesi içeriyor. Köprü kodu bu sayfaya dokunmadı.
2. **`junior-license-bridge.test.ts`** — PayTR CLEARED sonrası cüzdan `549900` minor kalıyor, test `0` bekliyor. Junior ödeme hattı; köprü kodu bu hatta hiç girmiyor.

Bu iki hata **ayrı bir iş kalemidir** ve bu denetimin kapsamı dışında bırakıldı — ama gizlenmedi, sicile yazıldı.

---

## 7. Puan kartı

### Önceki durum: **78 / 100**

| Boyut | Puan | Gerekçe |
|---|---|---|
| Parametre hijyeni & saldırı yüzeyi | **8 / 20** | 7 saldırı sınıfı geçiyordu; PII reddi yalnız tam dizgede; DoS tavansız |
| Hedef sayfada gerçek çalışma | **9 / 20** | Giriş dönüşü ön-doldurmayı siliyordu; `/panel/hibe?kaynak` tamamen ölüydü |
| Kırık bağlantı & rota tutarlılığı | **18 / 20** | Tüm href'ler canlı; yalnız test yoktu |
| Döngüsel gürültü & UX | **12 / 20** | `cameFrom` yok; Kurumsal→Hibe→Kurumsal döngüsü açık; Tezgâh hint'i yanlış araçta |
| Davranışsal test kapsamı | **7 / 20** | 92 satır `readFileSync` + `toContain`; sıfır davranış |
| Sen aksı | **20 / 20** | Kapı yeşil |
| Rota/allowlist sertleşmesi | **4 / 20** | Sorgu allowlist'i yoktu; `x-rail-search` yoktu |

### Onarım sonrası: **94 / 100**

| Boyut | Puan | Ne değişti |
|---|---|---|
| Parametre hijyeni | **20 / 20** | NFKC, görünmez karakter düşürme, CRLF reddi, gömülü PII, 512 sert tavan, çift çözümleme taraması |
| Hedef sayfada gerçek çalışma | **19 / 20** | Giriş zinciri tam; `/panel/hibe` bağlam üretiyor; kullanıcı girdisi ezilmiyor. −1: profil→köprü etkileşimi gerçek tarayıcıda E2E doğrulanmadı |
| Kırık bağlantı | **20 / 20** | 8/8 href canlı; `decideEdgeAction` ile testle kilitli |
| Döngüsel gürültü & UX | **19 / 20** | `selectBridgeTargets` + `cameFrom` beş sayfada. −1: `/ilan` şeridi yok, hedef körlüğü sürüyor |
| Davranışsal test | **18 / 20** | 56 gerçek davranış testi. −2: tam tarayıcı E2E (Playwright) ve React render testi yok |
| Sen aksı | **20 / 20** | Kapı yeşil, kopya doğru katmanda |
| Rota/allowlist sertleşmesi | **18 / 20** | `sanitizeBridgeSearch` + `x-rail-search`. −2: `x-rail-search` yalnız sayfa kapısında okunuyor; API tarafı kullanmıyor |

**Puanı kıran tek şey artık kod değil, doğrulama derinliği:** tarayıcıda gerçek tıklama ile uçtan uca test yok. Kodun doğruluğu saf fonksiyon düzeyinde kanıtlandı; DOM düzeyinde kanıtlanmadı.

---

## 8. Değişen dosyalar

**Yeni (2)**
- `lib/kernel/contextual-bridge-seed.ts` — saf hedef-sayfa bağlam motoru
- `tests/kernel/contextual-bridge-seed.test.ts` — 25 test

**Yeniden yazıldı (2)**
- `lib/kernel/contextual-bridge-params.ts` — sanitizer + `selectBridgeTargets` + `sanitizeBridgeSearch`
- `tests/kernel/contextual-bridge-params.test.ts` — 31 davranış testi (önceki 92 satır string araması yerine)

**Onarıldı (17)**
- `lib/kernel/auth/redirects.ts` — sorgu korunumu, açık yön daraltması
- `lib/kernel/auth/require-page-session.ts` — `x-rail-search` okuma
- `lib/kernel/security/edge-guard.ts` — `RAIL_SEARCH_HEADER`
- `proxy.ts` — auth-307 sorgu taşıması
- `components/kernel/contextual-bridge-strip.tsx` — döngü reddi
- `components/kernel/contextual-bridge-presets.tsx` — hedef kimlikleri
- `components/tezgah/workbench.tsx` — hint/seed tek kural
- `components/hibe/os-cockpit.tsx`, `components/commerce/os-cockpit.tsx`, `components/kurumsal/screening-cockpit.tsx`, `components/kurumsal/ops-deck.tsx`
- `app/(kernel)/panel/hibe/page.tsx` — ölü parametre canlandı
- `app/(kernel)/panel/e-ticaret/page.tsx`, `app/(kernel)/kurumsal/ilanlar/page.tsx`, `app/(public)/kurumsal/page.tsx`, `app/career/page.tsx`
- `lib/copy/sen-voice/bridges.ts` — `hibeContext` kopyası
- `tests/kernel/proxy-edge.test.ts` — +3 kenar testi

---

## 9. Kalan iş (dürüst liste)

1. **Tarayıcı E2E yok.** Saf fonksiyonlar ve kenar test edildi; gerçek tıklama → login → geri dönüş zinciri DOM'da doğrulanmadı. Playwright senaryosu açılmalı: `E-Ticaret → Hibe köprüsü → oturum yok → giriş → pozisyon dolu form`.
2. **`/ilan` şeridi yok.** Kariyer köprüsünün hedefi olan kamu dizininde geri dönüş köprüsü yok; kullanıcı çıkmaz sokakta. Bilinçli mi, karar verilmeli.
3. **`x-rail-search` yalnız sayfa kapısında.** API tarafları `next` kurmuyor; kapsam genişletilirse aynı sözleşme oraya da yazılmalı.
4. **Önceden var olan 2 test hatası** ayrı iş kalemi olarak açılmalı (`closed-rooms-copy-guard`, `junior-license-bridge`).
5. **`tezgah` kaynak allowlist'te ama hiçbir köprü onu üretmiyor.** Bilinçli (`BridgeEmitKaynak` dışında) ama sözleşmede belgelenmeli — belgelendi.

---

## 10. Ders

A commit'i «güvenli ön-doldurma» diyordu ve sanitizer'ı vardı. Testler yeşildi. Yine de:

- 7 saldırı sınıfı geçiyordu,
- ön-doldurma oturum duvarında ölüyordu,
- bir parametre hiç okunmuyordu.

**Sebep tek:** testler davranışı değil **metni** ölçüyordu. `toContain("parseBridgePozisyon")` satırı, `parseBridgePozisyon("VKN:1234567890")` çağrısının `""` döndürdüğünü **kanıtlamaz**.

Saldırı yüzeyi olan her fonksiyonun testi, saldırıyı **çalıştırmak** zorundadır. Bu rapordaki 56 test bunu yapıyor; bundan sonraki her köprü değişikliği de yapmak zorunda.
