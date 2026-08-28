# 01 — TESPİT RAPORU: MİMARİ VE ANAYASA

| Alan | Değer |
|------|--------|
| Görev | GÖREV 01 — Mimari ve kuralların tespiti & sorgulanması |
| Tarih | 28 Ağustos 2026 |
| Rol | Baş mimar (Cursor / Grok) — Super Admin’e, CEO kontrolünde |
| Kaynak | `.system_docs/ANAYASA.md`, `.system_docs/MANIFESTO.md`, canlı `lib/` / `app/` / `apps/rail-is`, şema, kenar, v1 hop sicili |
| PayTR | **Pasif kabul.** Merchant ve split port kodda durur; split `not_configured` → freelancer accept **503**. Sahte CREDIT önerilmez. |
| Ürün kodu | Bu raporda değiştirilmedi. |
| İlişki | 27 Ağustos `docs/TESPIT_RAPORU.md` + `docs/TEDAVI_RAPORU.md` **arka plandır, kopya değildir.** Tedavi (ProofReadPort, ALS `json.ts`, prebuild/nightly ayrımı, dil küçültme) **yapılmış sayılır.** Bu metin tedavi *sonrası* bağımsız denetimdir. |

Kurallar kutsal değildir. Yasal/mali gerçek olan ile müze travmasından doğmuş ritüel ayrılır. Çelişkide kod ve şema, şiirden üstündür; Anayasa ile Manifesto çelişirse Anayasa kazanır — **Anayasa ile disk çelişirse disk gerçektir, metin gecikmiştir.**

---

# 1. KILAVUZ DOKÜMANLARIN ACI MASIZ ANALİZİ

Belgeler `/docs` altında değil; kalıcı sicil `.system_docs/` içindedir. `/docs` günlük rapordur, derleme fixture’ı değildir. Bu ayrım doğrudur.

Hiyerarşi (fiili):

```
A1–A9 kırmızı çizgi     →  yasal / mali / güvenlik  (esnetilmez)
Manifesto Kural 1–4     →  iş modeli + duruş        (Anayasa kazanır)
Anayasa Bölüm B         →  ops / ürün notu          (tadil edilir)
PEDAGOJI.md / SEN aksı  →  anlatım ve marka         (anayasa değildir; ajan bazen sanır)
```

## 1.1 Tutulması gerekenler — ütopya değil, şirketin var olma şartı

Bunlar geliştiriciyi “bağlamaz”; şirketi mahkemeden, mağazadan ve kendi yalanından korur. **Dokunma.**

| Madde | Neden gerçek |
|-------|----------------|
| A1 tek defter `amountMinor` + `currencyCode`; float para yok; User’da bakiye yok | Muhasebe ve çift yazım. Şemada Wallet + append-only LedgerEntry + CHECK duruyor. |
| A2 / S43 ödeme kuruluşu değiliz; çekim rotası yok; usta neti cüzdana CREDIT yok | 6493 sayılı kanun / ödeme kuruluşu faaliyeti. Kodda split port `not_configured` döner; wallet-escrow “geçici banka” değildir. |
| A3 `service_role` JS/env yasağı; kenar JWT fail-closed; finansal Idempotency-Key | Sızdırılmış anahtar = RLS’i delen tanrı. Kenar `proxy.ts` imza + exp + role okur. |
| A4 sınav sunucuda; vize admin düğmesi yok; mühür yükü sabit | İş modelinin kriptografik iddiası. `exam/route.ts` motoru sunucuda puanlar, vizeyi kompoze eder. |
| A5 sahte bakiye / sahte CREDIT yok; boş yüzey vatandaş dilinde | Güven borcu. Super Admin lab bağışı (`sa_grant`) **deftere CREDIT yazmaz** — bu ayrım doğru tutulmuş. |
| A6 tek v1 zarf `{ ok, error, requestId, apiVersion, data }` | İkinci istemci (Dron) parse sözleşmesi. Üçüncü zarf gerçekten yasak kalmalı. |
| A7 4 çalışan oda + 4 sığınak; 5. oda ürün kararı | Müze travması (`yetkin_muze`: çok vitrin, sıfır halka) rasyonel bir kısıt. |
| Vize kapısı 403 | Pazaryeri kalite filtresi değil, **işin kendisi.** Gevşetilirse Rail ucuz ilan sitesi olur. |
| Akademi native IAP yasağı | Apple 3.1.1 / 3.1.3(e) ve Play. Dijital içerik vs gerçek hizmet aynı bakiyede yaşamaz. `academy-purchase` hop’u `dronForbidden`. |
| A8/A9 dürüst cümle | “Mikroservis değiliz; API-First yalnız Dron kesiti; web RSC `load`.” 27 Ağustos tadili abartıyı kesmiş. **Bu olgunluktur.** |

A9’un dış unvanı reddetmesi (`API-First Core Platform` değil) hâlâ doğru. Bu görevin kendi başlığındaki «Shared Kernel / API-First Core / Sürü Dron» dili **Anayasa’dan büyük.** Kurguyu koru; unvanı küçült.

## 1.2 Mantıksız, ütopik veya eksik maddeler

### Ütopik / kendi kendini yalanlayan

**1. Manifesto “Bir kere. Tam olarak bir kere. Üretimde.” tek ürün ölçüsü.**

Doğru disiplin cümlesidir. **Ölçü değildir.** Disk:

| Bölge | Dosya | Satır (≈) |
|-------|------:|----------:|
| `lib/academy` | 96 | 23 646 |
| `lib/kernel` | 154 | 14 691 |
| `tests` | 287 | 39 194 |
| `components/academy` | 33 | 6 539 |
| `apps/rail-is` | 37 | 4 716 |
| `lib/freelancer` | 24 | 3 306 |
| `lib/career` | 11 | 918 |
| `lib/dashboard` | 7 | 162 |

Kariyer iş modelinin kalbidir ve **en ince odadır.** Akademi bir LMS + TTS stüdyosu + pedagoji fabrikasıdır (`real-world-pedagogy.ts` ≈3 651, `field-voice.ts` ≈2 028). 27 Ağustos tespitinden bu yana akademi **büyümüştür** (o gün ≈78 dosya / 21k satır). “Platformu küçülttük, çekirdeğe indik” iddiası **akademi tavanında tutulmuyor.**

İki anayasa aynı anda yaşayamaz: ya içerik dondurulur ve ölçü “halka”dır, ya ölçü “sözleşme tek + dürüst 503 + güvenlik hijyeni” diye genişler (Manifesto 6.5’in tedavi cümlesi). **İkisi birden bağlayıcı anayasa olursa ajan akademi sineması yazar, CEO halka sormaya devam eder.**

**2. PEDAGOJI.md fiili üçüncü anayasadır.**

Anayasa B “derleme kırıcısı değildir” der. Diskte: CastRegistry tekelliği, Maya %6 yavaşlatma, 5 perdeli montaj, `semanticContentSeal`, `verify:academy-pedagogy-seals` nightly. Ajan bunu kırmızı çizgi okur. Nakit halkası dönmeden **stüdyo anayasası**dır. Konunun hakkı / esnek müfredat (25 Ağustos) doğru esnemeydi; ses-karakter mühürü o esnemeyi doldurmak için şişti.

**3. “Rail gürültüyü artırmayan tek ürün” (Manifesto 1.2).**

Pazarlama. Mühendislik kuralı olamaz. Yanlış okuma: her LLM/TTS özelliği varoluş sebebidir → gateway + dinle varsayılan açık (`ACADEMY_LESSON_LISTEN_ENABLED = true`).

**4. “Sürü Dron” henüz yoktur.**

Elde **bir** Expo lab istemcisi var (`apps/rail-is`, paket `yetkin.ai-is`). Yayın donuk. React Navigation yok; `App.tsx` tek `ScrollView` + durum makinesi. İkinci dikey native (işveren, akademi-olmayan başka zanaat) **sözleşme olarak mümkün, kabuk olarak yok.** “Sürü” bir hedef cümlesidir, mimari gerçek değil.

**5. Quiet Luxury / SEN aksı — duruş doğru, dogmalaştırma ütopya.**

27 Ağustos’ta derleme kapısından düşürüldü (doğru). `verify:sen-axis` hâlâ nightly. `lib/copy/sen-voice` 17 dosya. Yasal metin (“Kullanım Şartları”) resmi hitap ister; marka taraması bunu “ihlal” saymaya iter. Duruş kalsın. **Grep ile UI yasakları** erişilebilir CTA ve net hata mesajını iddia ihlali yapar.

### Eksik — Anayasa A’ya değil, B veya OPS’a yazılmalı

Bunlar yeni oda veya çekim rotası değildir.

1. **Çok süreçli hız tavanı.** `createInMemoryRateLimitPort` finansal ve auth yazmalarında tek replica varsayar. İkinci instance = tavan N kat. Redis mutlak yasak değil (Anayasa B); **üretim çok instance ise OPS ertelemesi güvenlik deliğidir.**
2. **PSP hold → DB seal sırası.** Split açılınca `beginHold` başarılı + DB fail = yetim kilit. PayTR pasifken uyur; **açılınca ilk ırk koşusu.** Mutabakat kancası Anayasa B’de yok.
3. **Sınav HTTP idempotency.** Satın alma ve freelancer yazmaları `Idempotency-Key` ister. Sınav POST web BFF’dir; hop sicilinde değildir (doğru — Dron sınav vermez). Çift POST politikası store unique ile kısmen tutulur, HTTP katmanında mühürlü değildir. A4 yanına bir cümle yeter.
4. **KVKK / saklama.** Anayasa kimlik/sır der, saklama süresi, silme, mesaj `body` / dispute `reportJson` minimizasyonu demez.
5. **Sır döndürme.** Credential icat edilmez yazar; JWT secret / PayTR salt / SMTP rotate demez.
6. **STORAGE_CONTRACT vs `AcademyAudioCache` + `lesson-audios`.** Beşli “bu fazda nesne depo yok” der. Akademi dinle fiili bucket + Prisma locator kullanır. Sessiz çelişki ajanı ya bucket’ı yasak sanır ya Studio’yu açmaya iter. **Ya istisna yazılsın ya sözleşme yalan olmasın.**
7. **`trendScore Float`.** Para değildir; A1 ihlali değildir. Tamsayı disiplinli şemada Float vitrin skoru yanlış tohumdur.
8. **Tedarik zinciri.** `json.ts` Next iç API’den çıktı (tedavi). `npm audit` / pin / internal import yasağı OPS’ta yok.

Bilinçli olarak **eklenmemesi** gerekenler duruyor ve doğru: çekim, 5. oda, IAP, vize gevşetme, sahte CREDIT, ikinci Dron bundle, Socket ürün yüzeyi, müzeden kopya.

## 1.3 Geliştiriciyi kilitleyen, elini kolunu bağlayan maddeler

El bağlayan ≠ yanlış. Maliyet/fayda:

| Kural / pratik | Fayda | El bağlar mı? | Yargı |
|----------------|-------|---------------|--------|
| A1–A5, S43, vize 403, IAP | Şirket yaşar | Hayır — net kapı | **Dokunma.** |
| 5. oda ürün kararı | Müze tekrarı yok | Hayır | Tut. |
| Hop sicili + OpenAPI `--check` prebuild | Dron sözleşmesi tek | Orta — `v1-contract.ts` ≈1 210 satır tanrı dosya | Tut; dosyayı böl. |
| `verify:prebuild` ⊂ `next build` (sır, para, RLS, IDOR, v1) | Yanlış merge yemez | Kabul edilebilir | Tedavi sonrası **doğru kalınlık.** |
| `verify:grep-seals` + SEN + pedagoji nightly | Marka/anlatım | Düşük (derleme değil) | Nightly’de kalsın; ajan kırmızı çizgi **sanmasın.** |
| Oda duvarı ESLint + `verify:boundaries` | Engine çapraz yazmayı keser | Orta — dosya adı mimarisi | Duvar kalsın; **kaçış isimle değil tip sözleşmesiyle.** |
| ~287 test, bir kısmı `readFileSync` + `toContain` | Metin durağanlığı | **Evet** — refactor anayasa ihlali gibi kırılır | Davranış testine kaydır; surface’i büyütme. |
| eslint / verify metni **«Anayasa §2.8»** | Hiç | Evet — **madde yok.** Anayasa A8’dir. | Stale atıf; ajan hayali madde arar. `S9-B` müze yasağı da aynı sınıf. |
| Socket.IO mutlak yasak | Müze travması | Tezgâh gerçek zamanlı değil (anket) | Şimdilik kabul; “pürüzsüz native” ile çelişir — bilinçli tavan. |
| PEDAGOJI 5 perde / CastRegistry | Anlatım tutarlılığı | **Evet** — yeni ders yazmak stüdyo işi | Ürün notu; yeni perde halkadan bağımsız **durdurulsun.** |
| Manifesto 6.5 (eski okuma): halkayı döndürmezse iş yok | Odak | Tedavide yumuşadı | Yeni okuma doğru: güvenlik hijyeni dolaylı değildir. **Eski okumaya dönme.** |

**Asıl el bağlayan şey madde metni değil, ajan kültürüdür:** her sapmada “anayasa ihlali”, her PR’da yeni `verify:*`, her cümlede mühür metaforu. 24–27 Ağustos tadilleri (grep-mimari düştü, fiyat/ders dogması kalktı, prebuild inceldi) doğru yöndeydi. Kalan bürokrasi, kırmızı çizgilerin etrafına örülmüş **mühür endüstrisi** ve akademi içerik fabrikasıdır.

Direct-offer, squad, dispute, AI chat: Manifesto “büyütülmez, dürüst kapalı kalabilir.” Kodda engine + API + UI **vardır.** “Kapalı” ≠ “yok.” Bakım yüzeyi açık; nakit halkasını döndürmez. Büyütmek Anayasa’ya aykırı; silmek bu görevin işi değil.

---

# 2. MİMARİ VE GÜVENLİK ÖN DEĞERLENDİRMESİ

## 2.1 Fiili gövde (iddia değil, disk)

yetkin.ai **mikroservis platformu değildir.** `packages/` yoktur. Shared Kernel **versiyonlu paket değildir** — `lib/kernel` klasörü + Prisma şeması + kenar.

```
Vatandaş web (Amiral)                 Native Dron (Diyar B / İş)
  Next.js App Router RSC                Expo 57, Bearer JWT, çerez yok
  lib/<oda>/load                        yalnız RAIL_V1_HOPS
  çerez oturumu (Supabase SSR)          SecureStore refresh
           \                            /
            \                          /
         proxy.ts (Next 16 kenar)
           JWT fail-closed, CORS, hop allowlist, 410, CSP nonce
                      |
              app/api/* tek handler ağacı
                      |
         lib/kernel  +  lib/{academy,career,freelancer,dashboard}
                      |
              tek Postgres (Prisma) — tek User, tek Wallet/Ledger
```

Bounded context sicili (`lib/kernel/bounded-contexts.ts`): Proof, Marketplace, Payments. Dashboard sicilde odadır, üründe salt okuma kabuktur — bu doğru.

Kernel dikey klasör import **etmez** (grep temiz). Proof okuma `ProofReadPort` çekirdektedir; kariyer akademi/freelancer iç okuma dosyasını import **etmez** (tedavi tutuluyor).

**Kalan sızıntı — dosya adı duvarını geçen, engine olmayan:**

| Kim | Ne | Neden önemli |
|-----|-----|----------------|
| `lib/career/listing-visa-scope.ts`, `visa-gate.ts`, `visa-scope-board.ts` | `lib/academy/level-pathway`, `course-titles` | Vize **kapsamı** akademi slug/yol haritasına gömülü. ProofReadPort mühür okur; kapı hâlâ müfredat kimliğini dikeyden alır. |
| `lib/freelancer/types.ts`, `engine.ts`, `schemas.ts`, `job-visa-lock.ts`, `seed.ts` | `AcademyPathwayId` | Marketplace, Proof’un müfredat kimliğini **tip olarak** taşır. |
| `lib/dashboard/academy-pulse.ts` | `lib/academy/types` | Kokpit akademi DTO’sunu bilir (kabuk vergisi; düşük risk). |
| `lib/kernel/passport/load.ts` | `prisma.careerVisaStamp` (allowlist) | Kernel klasör import etmez; dikey **tabloyu** okur. A8’in ikinci yarısı somut. |

`User` satırı academy/career/freelancer/wallet/ledger/escrow/AI ters ilişkilerini taşır. Bu sapma değil, Anayasa’nın kabul ettiği Prisma vergisi. Sonuç: **mikroservis ayrışması bu şemayla vaat edilemez.** Dron bağımsız evrilmez; `X-Rail-Min-Version` ile evrilir.

## 2.2 «Core + Micro-Apps» / Shared Kernel — uygun mu?

**Ürün stratejisi: evet. Mühendislik kimliği: hâlâ bir boy büyük.**

Doğru olan:

- Bir Amiral (akademi satışı, sınav, admin, cüzdan, yasal, CMS-olmayan katalog).
- Bir dikey Dron (İş): ilan, teklif, tezgâh, mühür gösterimi. Akademi native **satılmaz.**
- Aynı kimlik (Supabase JWT), aynı zarf, aynı kanonik handler, kenar soyma (kopya `app/api/v1` ağacı yok).
- Bilişsel yükü akademiyi cılızlaştırarak değil **istemci ayırarak** çözme (Manifesto 1.5) bu pazaryeri için doğru.
- Mağaza hukuku istemci ayrımını zorunlu kılar. İkinci bundle / akademi native yanlış olurdu.

Uygun olmayan / abartılı olan:

- Bu bir **micro-apps platformu** değil. Birinci Dron var; sürü yok; Dron kabuğu lab.
- Web API-first değil; hibrit. Model doğru. İsim “her Amiral rotasını hop siciline yaz” baskısı doğurursa BFF şişer — `DRON_CLIENT_SPEC` bunu yasaklıyor, ajan unvanı okursa unutur.
- Shared kernel’in gerçek testi: **üçüncü istemci** aynı zarfı kıra kıra konuşabiliyor mu? Kamu sertifika hop’u kısmen kanıt. İşveren native’i yok. Model ölçeklenebilir; **henüz ölçeklenmemiş.**
- Dron `App.tsx` tek kaydırma + ekran state’i. İkinci dikey uygulama bu kabuğa **takılamaz.** Sözleşme hazır; **ürün kabuğu hazır değil.**

Hüküm: dikey mobil + paylaşılan v1 sözleşme **doğru kurgulanmış.** “Amiral Gemisi + Shared Kernel + Sürü Dron” cümlesi, eldeki monolit + bir Expo lab’ini platformmuş gibi satar.

## 2.3 Defter ve güvenlik — altyapı uygun mu?

**Evet, çekirdek defter/güvenlik bu fazın hedefine uygun.** PayTR pasifken nakit iddiası yoktur; kapılar dürüst kapalıdır. Bu hastalık değil, idari kapıdır.

| Katman | Durum | Not |
|--------|-------|-----|
| Para birimi | Uygun | `amountMinor` Int, `amountKurus` yok, unique purchase `(userId, courseId)` |
| Defter | Uygun | Append-only LedgerEntry, Wallet CTE, EscrowHold ikinci bakiye değil |
| Split | Dürüst kapalı | `paytrMarketplaceSplitPort.beginHold/settle` → `not_configured` |
| Merchant | Kod var, nakit yok | Webhook HMAC/IP allowlist durur; panel kapalıysa tahsilat 503 |
| Vize | Uygun | Vizesiz teklif 403; admin vize düğmesi yok |
| Sınav | Uygun (A4) | Sunucu puanı; Dron hop değil |
| Kenar JWT | Uygun | Fail-closed; `service_role` role reddi testte |
| RLS | Kapı var | `verify:rls-status` prebuild. Prisma yazma rolü RLS’i bypass eder — **tasarım.** Anon PostgREST yazması yasak kalmalı. Uygulama rolü sızarsa RLS vatandaşı korumaz. |
| IDOR | Kapı var | `verify:idor-seals` prebuild + odalı testler |
| Idempotency | Finansal yazmalarda uygun | Sınav HTTP’de eksik |
| Rate limit | **Tek süreç** | Üretim replica’da delik |
| CSP | Trade-off belgelenmiş | `script-src` nonce + `strict-dynamic`; `style-src 'unsafe-inline'` (React/Next) |
| Super Admin lab | Dürüst | `NODE_ENV !== production` sıfır harç; üretimde kapalı; ledger CREDIT yok |
| Inngest | Dürüst | İmza boşsa 503 |
| LLM gümrük | Var | Dinle varsayılan açık — maliyet riski halkadan bağımsız |

**Canlı risk sırası (PayTR pasifken):** vize kapısının sosyal/satış baskısıyla gevşetilmesi; sahte CREDIT talebi; akademi TTS faturası; in-memory limit; “halka dönmedi diye yeni oda / yeni perde” refleksi.

**PayTR açılınca ilk teknik iş (şimdi yaz, o gün şaşırma):** hold/DB yetim kilit mutabakatı + paylaşılan rate-limit store. Kodla paneli açmak bu görevin işi değildir.

## 2.4 UI/UX pürüzsüzlüğü — altyapı uygun mu?

Hedef: Quiet Luxury = kanıtı göster, bağırma. Pürüzsüzlük = iskelet, dürüst hata, tek jest, tutarlı tempo.

**Amiral (web) — temel var, ağırlık yanlış yerde.**

Var olan doğru parçalar:

- Oda iskeleti (`RoomSkeleton`, `motion-reduce`), yazma geri bildirimi (`useCitizenWriteFeedback`), 401/403/503 vatandaş cümlesi, action-bridge toast.
- Kabuk: `app-shell`, nav progress, wallet chip, user hub, oda teması.
- Dürüst 503 accept butonunda yeşil yalan yok.

Aksayanlar:

- Akademi UI kariyerin ~33×’i. Pürüzsüzlük emeği oynatıcı/TTS/transcript/sticky’ye gitmiş (`docs/` içindeki son raporların neredeyse tamamı akademi medya). **Nakit halkası ve vize yüzeyi cilalanmıyor; stüdyo cilalanıyor.**
- `RoomSkeleton` varyantları hâlâ müze dili taşıyor (`youth`, `prize`, `sanctuary`, `shield`). Donmuş oda belleği UI’da.
- `lib/ui/room-theme.ts` donmuş oda yollarını hâlâ boyar. 410 için gerekli; ajan “canlı tema” sanır.
- Socket yok → Tezgâh anket. Teslim UX’i pürüzsüz olmayacak; bu **bilinçli tavan.** Anayasa ile “native kadar akıcı sohbet” aynı anda vaat edilmesin.

**Dron — protokol laboratuvarı, ürün kabuğu değil.**

- İnce, sözleşmeye bağlı, dürüst hata kartı (`HonestErrorCard`), dark token’lar, IAP yok, `service_role` yok. Bu **doğru lab.**
- React Navigation / bottom tabs / jest yok. Tek `ScrollView` ekran değiştirir. Mağaza pürüzsüzlüğü bu iskeletle doğmaz.
- Accept 503 vatandaşa gösterilir — dürüst, yayın ölçüsü değil.

Hüküm: defter/güvenlik altyapısı UI hedefinden **daha hazır.** Pürüzsüzlük için eksik olan tasarım sistemi değil; **akademi sinemasını durdurup 4 oda kabuğu + Dron navigator’ına emeği kaydırmak.** Quiet Luxury grep’i pürüzsüzlüğün düşmanıdır; duruş olarak kalabilir.

---

# 3. ŞEFFAF GÖRÜŞ — ZORUNLU SORULAR

## 3.1 SEN OLSAYDIN NE YAPARDIN?

Mimariyi **parçalamazdım.** İkinci Postgres, `packages/@yetkin/kernel` npm yayını, mikroservis, Kubernetes, “platform team” tiyatrosu bu şirketin ölçeğinde zarar. Tek süreç + tek defter + tek zarf, lisans ve operasyon gerçeğine uygun.

Yapardığım / yapmadığım:

1. **Dili küçültmek.** İçeride Amiral / Dron / oda / port kalsın. Dışarıda ve ajan prompt’unda: *modüler monolit, bir dikey native istemci, tek v1 zarf.* “Sürü” ancak ikinci istemci sözleşme + kabuk geçince söylenir.
2. **Akademi fabrikası ile omurgayı ayırmak.** `real-world-pedagogy.ts` / `field-voice.ts` içerik artefaktıdır, kernel değildir. Yeni Koray–Maya perdesi, yeni TTS chunk, yeni cinema’yı nakit halkası (veya en azından bir gerçek akademi tahsilatı) dönene kadar durdururdum. Pilot SKU + sunucu sınavı + mühür yeter.
3. **Kalan sızıntıyı gerçek sözleşmeye almak.** `AcademyPathwayId` (ve ilan kapısı slug sicili) `lib/kernel/proof` veya `lib/kernel/catalog-ids` altına. Kariyer ve freelancer `lib/academy` import etmesin. ProofReadPort mühür okumayı kesti; **kapsam hâlâ akademi klasörüne çivi.**
4. **Dron’a navigator vermek, ikinci bundle açmamak.** `ScrollView` lab kalsın veya ince bir native navigator (tabs: İşler / Tezgâh / Pasaport) — mağaza yayını değil, *sürü* iddiasının ön şartı. Akademi native hâlâ yok.
5. **PayTR’ye kodla hayat vermezdim.** Panel CEO/idari. Split yokken accept 503. Wallet-escrow geri açılmaz. Lab `sa_grant` CREDIT yazmaz — doğru, dokunmam.
6. **Squad / dispute / AI tahkim’i dondururdum** (silmek zorunda değil). İş tahtası + teklif + 403 + dürüst 503 gün 0 yeter.
7. **PEDAGOJI ve SEN’i ajan anayasasından çıkarırdım.** Vizyon Manifesto’da, kırmızı çizgi A’da, ops B’de. Nightly taraması kalsın; “Maya %6” PR ret sebebi olmasın.
8. **Stale atıfları keserdim.** `Anayasa §2.8` → A8. `S9-B` ya OPS notu olur ya düşer. Ajan hayali madde uygulamasın.
9. **STORAGE_CONTRACT’a akademi ders sesi istisnası yazardım** veya dinlemeyi kapatırdım. Sessiz çelişki bırakmazdım.
10. **Verify’ı şişirmezdim.** Prebuild güvenlik kalsın. Yeni `verify:*` varsayılan hayır.

Gidişatın asıl riski teknik çöküş değil: **müze travmasının tersine aşırı mühür + akademi stüdyosu.** Cilalı vitrin yerine cilalı anayasa ve cilalı ders. İkisi de halkayı döndürmez.

## 3.2 Platform kurgusu teknik olarak doğru mu? Çıkmaz sokak var mı?

**Kurgu doğru. Birkaç çıkmaz, şimdi girilirse pahalı.**

Doğru yön:

- Öğren → mühürle → kapı aç → iş emanette (PSP) → split ile usta.
- Web’de sat, mobilde iş tezgâhı; aynı kimlik ve zarf.
- Ödeme kuruluşu olmama. IAP ayrımı.

Çıkmaz sokaklar (şimdi girme):

| Çıkmaz | Neden |
|--------|--------|
| Mikroservis / şema ayrışması | User tanrı satırı + tek Postgres. Dron “bağımsız dikey DB” vaadi yalan olur. |
| Akademi native / ikinci IAP bundle | Mağaza hukuku + mühür iadesi. Anayasa bunu zaten kapatmış; satış baskısı açmaya iter. |
| Wallet-escrow geçici banka | S43. Split gecikince “şimdilik cüzdan” teklifi gelecek. Reddet. |
| `AcademyPathwayId`’yi freelancer şemasına sonsuza gömmek | Müfredat slug’ı değişince ilan tahtası kırılır. Kernel kimliği yoksa ikinci Dron aynı tipi kopyalar. |
| Tek ScrollView Dron’u “sürü” diye çoğaltmak | Her dikey yeni Expo kopyası = IAP/mağaza cehennemi + sözleşme sapması. Önce navigator + aynı hop sicili. |
| Halka dönmeden akademi içerik fabrikası | 23k satır pedagoji, 0 dönmüş halka. Müzenin 2026 versiyonu. |
| “Her web rotası v1 hop” | Amiral’i Dron kadar şişirir; sınav/IAP/admin sızar. |
| Surface-test anayasası | Refactor imkânsız; ürün donar, halka yine dönmez. |

**Kısa hüküm:** Platform kurgusu çıkmaz değil. Çıkmaz, kurgunun **unvanını ve akademi kütlesini** gerçek sanmaktır.

## 3.3 Bir sonraki aşamada somut olarak ne yapmalıyız?

PayTR’yi kodla açmak **yok.** Yeni oda **yok.** İkinci Dron bundle **yok.**

### Adım 0 — Kapsam dondur (bugün, yazılı karar)

- Yeni çalışan oda, yeni TTS perdesi, yeni verify betiği, squad/dispute büyütme, Socket, IAP yok.
- Akademi: yayın SKU listesi kilitlenir. `real-world-pedagogy` / `field-voice`’a net ek yok (bugfix hariç).
- Ajan prompt’unda unvan: **Modüler Monolit + API-First Dron Sözleşmesi.** “Shared Kernel platform / Sürü” yok.

### Adım 1 — Omurga sızıntısı (küçük PR, nakit yok)

1. `AcademyPathwayId` + ilan kapısı sicilini kernel sözleşmesine al. Kariyer/freelancer `lib/academy` import etmesin.
2. eslint/verify «Anayasa §2.8» atıfını A8 yap.
3. STORAGE_CONTRACT’a `lesson-audios` istisnası **veya** dinlemeyi lab bayrağına bağla (`LISTEN_ENABLED` üretim varsayılanı tartış).

### Adım 2 — Halka dilimi (idari ≠ kod)

CEO: PayTR **üye işyeri** paneli (merchant). Split ayrı lisans.

Kod hazır olduğunda tek vatandaş:

1. Gerçek tahsilat (merchant) → Wallet CREDIT  
2. Kurs DEBIT  
3. Ders  
4. Sunucu sınavı ≥70  
5. SHA-256 mühür + kamu doğrulama  
6. Kariyer vizesi  

Bu, freelancer split’ten **bağımsız** ilk gerçek para dilimidir. Split’i bekleyip akademiyi de dondurmak S43’ü korumaz, durdurur (Manifesto Kural 3’ün kendi uyarısı).

Freelancer accept **503 kalsın** ta ki pazaryeri split onboard edilsin.

### Adım 3 — Split açılmadan hemen önce (kod, hâlâ sahte CREDIT yok)

1. `beginHold` / DB seal yetim kilit mutabakatı.  
2. Finansal + auth rate-limit için paylaşılan store (Redis OPS kararı; Anayasa yasaklamıyor).  
3. Sınav POST idempotency politikası (web BFF).  

Sonra: bir vizeli teklif + PSP hold + teslim + kuruluş split.

### Adım 4 — UI/UX (halka ile paralel, stüdyo değil)

1. Amiral: 4 oda kabuğu + Antre + vize/teklif 403 cümlesi + dürüst 503. Oynatıcı cilası dondurulur.  
2. Dron: lab navigator (İşler / Tezgâh) — mağaza yok. Accept 503 ekranı kalsın.  
3. Quiet Luxury: duruş; yeni ikon yasağı / SEN grep’i PR bloğu değil.

### Bilinçli sonraya

- Dron mağaza yayını  
- Mührün Rail dışında makine doğrulaması (kamu sayfa zaten var)  
- İkinci Dron (işveren) — ancak v1 zarf + hop sicili üçüncü tüketiciyi taşıyınca  
- Redis dışında “platform” altyapısı  

**Tek cümlelik emir:** Yeni özellik yok. Akademi içeriğini dondur. Pathway kimliğini çekirdeğe al. PayTR pasifken sahte nakit yok. Panel açılınca **bir gerçek akademi tahsilatı + mühür.** Split ayrı idari iş. Sürü ve 5. oda bu listenin dışında.

---

# 4. SİCİL — TEK SAYFALIK ÖZET

**Ne doğru**

- Tek defter, tek zarf, tek handler, kenar soyma, hop allowlist.
- S43 ve IAP kodda: akademi merchant/cüzdan, freelancer split/503, Dron satın almaz.
- Vize 403; sınav sunucuda; kamu hash oturumsuz.
- ProofReadPort çekirdekte; kernel dikey klasör import etmez.
- Prebuild güvenlik; grep/marka nightly.
- A8/A9 dürüst: modüler monolit, API-First yalnız Dron.
- Super Admin lab bağışı defteri kirletmez.
- Donmuş 8 oda canlı `lib/` tavanında yok.

**Ne sapmış / kırılgan**

- Unvan (Shared Kernel / Sürü / API-First Core) gövdeden büyük.
- Akademi 23k+ satır ve hâlâ büyüyor; kariyer 918 satır.
- Vize kapsamı ve freelancer tipi hâlâ `lib/academy` müfredat kimliği.
- STORAGE_CONTRACT yalan (ders sesi bucket).
- Rate limit tek süreç; sınav HTTP idempotency yok; split açılınca hold/DB sırası.
- PEDAGOJI + SEN ajanı kırmızı çizgi sanıyor; eslint hayali «§2.8».
- Dron lab kabuğu; sürü yok.
- Test/grep yüzeyi ürünü dondurmaya aday.

**Ne yapılmaz**

Çekim, sahte CREDIT, vize gevşetme, IAP, 5. oda, ikinci bundle, wallet-escrow banka, müzeden kopya, PayTR’yi kodla “açmak.”

---

*Bu rapor `/docs` günlük alanındadır. Kalıcı kırmızı çizgi `.system_docs/ANAYASA.md`. Çelişkide Anayasa bağlayıcıdır; Anayasa ile disk çelişirse disk yazılır, metin tadil edilir. PayTR pasif varsayımı 28 Ağustos 2026 denetimine aittir; port kodda durur, nakit iddiası taşımaz.*
