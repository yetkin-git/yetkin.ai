# ANAYASA — yetkin.ai

İnsan SSOT. Ürün kodu bu dosyayı import etmez.

Bu metin iki katmandır. Üst katman değişmezdir. Alt katman operasyon ve ürün notudur; tadil edilir, greple din yapılmaz.

| Alan | Değer |
|------|--------|
| Tarih | 16 Ağustos 2026 |
| Tadil | **28 Ağustos 2026 (Adım 1 — Omurga sızıntısı):** Müfredat kimliği ve ilan kapısı sicili `lib/kernel/catalog-ids`; kariyer/freelancer `lib/academy` import etmez. Müze yasağı OPS notudur (tarihsel S9-B anayasa maddesi değildir). **27 Ağustos 2026 (Tedavi Evresi):** Mimari dil «Modüler Monolit + API-First Dron Sözleşmesi» olarak hizalandı; `verify:prebuild` yalnız güvenlik kapısı (sır, amountMinor, RLS, IDOR, v1 sözleşme); grep/marka nightly. Proof okuma `ProofReadPort` çekirdek sözleşmesidir. **25 Ağustos 2026 (Adım 2 — Anayasal Esneklik):** Müfredat ders adedi, seviye etiketi ve fiyat maktu bantları OPS/ürün notuna çekildi; sabit ders adedi, maktu fiyat bantları ve «her dikey 3 seviye» dogması kalktı. Aynı gün Adım 1: Donmuş 8 oda canlı `lib/` ve `components/` tavanından silindi. 24 Ağustos: mühür katedrali ve grep-mimari bağlayıcılığı kalktı. |
| Gövde | 4 çalışan oda + 4 çekirdek sığınak. Donmuş 8 oda asil sicil değildir |
| Kamu markası / domain | `yetkin.ai` |
| Kalıcı belgeler | `/.system_docs` |
| Ops | `.system_docs/OPS_RUNBOOK.md` |
| Vizyon | `.system_docs/MANIFESTO.md` |
| Günlük rapor | `/docs` — build fixture değildir |

Müze dizini `yetkin_muze/` ilham ve yasak listesidir. Kör kopya yasaktır.

---

# BÖLÜM A — SERT KIRMIZI ÇİZGİLER (DEĞİŞMEZLER)

Bunlar yasal / finansal / güvenlik sınırıdır. PR ile “kolaylaştırmak” için esnetilmez. Tadil: tarih + gerekçe + bu dosya.

## A1. Tek defter, tek birim

Şema ve tip adı **`amountMinor`** + `currencyCode`. Float para yasaktır. `amountKurus` kolon adı **yasaktır**.

Tek SSOT: `Wallet` satırı + append-only `LedgerEntry`. User’da bakiye kolonu yoktur. Triple-balance, `ModuleWallet`, holding havuzu ve ikinci nakit yazıcı yasaktır.

`EscrowHold` ikinci bakiye değildir. PSP işinde hold `referenceKey` / `pspPaymentId` ile yürür; Wallet yalnız Merchant akademi bakiyesidir.

Satış fiyatı kod sabiti değildir; Super Admin katalog SSOT’tur.

## A2. Ödeme kuruluşu değiliz (S43)

Nakit **hedefi:** PayTR Merchant Port ile girer; akademide harcanır. Panel veya lisans kapalıyken tahsilat dürüst **503**’tür. Sahte CREDIT yoktur. Freelancer bedeli lisanslı Pazaryeri split’tinde durur. Usta neti Rail cüzdanına CREDIT yazılmaz. Bankaya çekim yoktur. `/api/wallet/withdraw`, GİB, e-arşiv, admin çekim paneli açılmaz.

Split portu `not_configured` ise dürüst **503**. Wallet-escrow production fallback değildir.

## A3. Sır ve kimlik

`SUPABASE_SERVICE_ROLE_KEY` / `service_role` kod, `.env` ve JS istemcisinde **kullanılamaz**. Yazma Prisma postgres rolü. Kenar JWT fail-closed. Kritik yazmalarda Idempotency-Key zorunludur.

## A4. Kanıt satın alınamaz

Sınav puanı tarayıcıda hesaplanmaz — **sınav** sunucuda puanlanır. Vize admin düğmesiyle basılmaz. Mühür yükü sabittir: `userId · courseId · attemptId · score · issuedAt · curriculumSeal`. Vanity, ödeme veya sıralama bu yüke girmez.

## A5. Dürüst kapalı yüzey

Boş env/DB/ödeme → vatandaş dilinde “henüz bağlanmadı / yüklenemedi”. Sahte bakiye yok. Sahte CREDIT yok.

## A6. Tek v1 zarf

Amiral ve Dron aynı JSON’u konuşur: `{ ok, error, requestId, apiVersion, data }`. Üçüncü zarf yasaktır.

## A7. Asil sicil

Çalışan odalar: `dashboard`, `academy`, `career`, `freelancer`. Sığınaklar oda sayılmaz: `/profil`, `/cuzdan`, `/pasaport`, `/admin`. 5. çalışan oda ürün kararı ister. Donmuş 8 oda (Studio, DevLabs, Kurumsal, Hibe, Arena, Yetkinİlan, Junior, YetkinX) 410 envanteridir; `archived/` + kenar 410. **Donmuş 8 oda canlı `lib/` ve `components/` tavanında kesinlikle yoktur.**

## A8. Kernel sınırı (dürüst cümle)

**Kernel runtime dikey motor import etmez; User satırı dikey FK’leri taşır.**

Bu bir mikroservis vaadi değildir. Tek Postgres + Prisma, User satırında akademi/kariyer/freelancer ilişkilerini zorunlu kılar. Paylaşılan kernel **klasörüdür**, versiyonlu paket değildir. Fiili gövde: **Modüler Monolit + API-First Dron Sözleşmesi**. Odalar birbirinin motorunu import etmez; çapraz iş `app/api` kompozisyonu veya HTTP’dir.

Kanıt okuma çekirdek sözleşmedir (`ProofReadPort` / `lib/kernel/proof`). Müfredat ve ilan kapısı kimliği `lib/kernel/catalog-ids` sözleşmesidir. Kariyer akademi veya freelancer iç okuma dosyasını import etmez. Kariyer ve freelancer `lib/academy` klasörünü import etmez.

## A9. Amiral mimarisi (dürüst cümle)

Amiral **RSC load + v1 Dron hibritidir**. Web sayfaları çoğu yerde `lib/<oda>/load` ile sunucuda okur. Dron Bearer ile `/api/v1/...` hop sicilini konuşur. Kenar aynı handler’a soyar. “API-First” yalnız Dron kesiti için iddiadır; web BFF/RSC’dir. İkisi de yasaldır. Dış unvan “API-First Core Platform” değildir.

`eval` / `child_process` / sandbox runner yasaktır. LLM yalnız gümrük kapısından çıkar.

---

# BÖLÜM B — OPS / ÜRÜN NOTLARI

Bunlar kırmızı çizgi değildir. Değişince bu bölüm ve OPS güncellenir; her satır için yeni mühür betiği yazılmaz. Güvenlik hijyeni (RLS, IDOR, sır, dürüst 503) “dolaylı iş” diye reddedilmez.

- **Uygulama servisi** (`service_role`) Rail JS yüzeyine düşmez; ayrıntı OPS.
- Inngest uygulama id `yetkin-rail`; üretimde imza boşsa 503. Ayrıntı OPS.
- Redis mutlak yasak değildir; paylaşılan rate-limit/sayaç OPS kararıdır. Socket.IO ürün yüzeyi açılmaz.
- Dron yayını (EAS, mağaza) ayrı operasyon kararıdır. Akademi native IAP ile satılmaz.
- `verify:prebuild` derleme güvenlik kapısıdır (sır, `amountMinor`, RLS, IDOR, v1 sözleşme artefaktı). Anayasa maddesi değildir. Grep/oda duvarı/atomik string taraması ve SEN/marka `verify:grep-seals` + `verify:nightly` kovasına aittir. Para UoW, vize yüzeyi ve emanet iade kancası varsayılan `npm test` kapısındadır.
- Oda duvarı ESLint ile tutulur; `verify:boundaries` nightly tarama yardımcısıdır. Grep tek başına mimari değildir.
- Müfredat kimliği (`AcademyPathwayId`) ve freelancer ilan kapısı sicili `lib/kernel/catalog-ids` altındadır. Kariyer ve freelancer `lib/academy` import etmez.
- Müze dizini (`yetkin_muze/`) git / indeks / webpack / import dışıdır. Bu bir OPS yasağıdır; tarihsel etiket «S9-B» Anayasa maddesi değildir. Kör kopya yine yasaktır.
- Dashboard sicilde odadır, üründe salt okuma kabuktur.
- Direct-offer, squad, dispute, AI chat: halkayı döndürmeyen yüzeyler; büyütülmez, dürüst kapalı kalabilir.
- Quiet Luxury ve SEN aksı duruş / marka notudur; derleme kırıcısı değildir.
- **Akademi müfredat / fiyat esnekliği (ürün notu, kırmızı çizgi değil):** Konunun hakkı neyse o kadar ders/bölüm yazılır. Fiyatlandırma eğitimin gerçek piyasa değerine göre dinamik belirlenir (canlı tutar katalog SSOT; kodda maktu bant yok). Eğitim yapısı ihtiyaca göre tekil Masterclass veya çoklu modül olabilir; her dikeyin zorunlu üç seviyesi yoktur. Para birimi yine `amountMinor` tamsayısıdır — float para A1’de yasaktır.

Build: `prisma generate && verify:prebuild && next build`. `typecheck` ayrı CI adımıdır. `verify:nightly` ayrı CI/Nightly işidir.
