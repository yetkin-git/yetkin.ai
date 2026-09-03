# Yerel Geliştirme Ortamı (Localhost) Pulse Performans ve DB Zaman Aşımı Tedavi Raporu

**Tarih:** 3 Eylül 2026  
**Kapsam:** `/api/dashboard/pulse` rotası, `lib/kernel/db.ts`, `lib/dashboard/`, `lib/career/`, `lib/academy/`  
**Durum:** Çözüldü & Doğrulandı

---

## 1. Teşhis ve Kök Neden Analizi

Yerel geliştirme ortamında (localhost / `next dev`) `/api/dashboard/pulse` çağrısında şu uyarı logları gözlemlenmiştir:
```json
{"level":"warn","event":"dashboard.pulse.room_failed","reason":"wallet","route":"/api/dashboard/pulse","durationMs":2,"errorName":"Error:TIMEOUT"}
{"level":"warn","event":"dashboard.pulse.room_failed","reason":"freelancer","route":"/api/dashboard/pulse","durationMs":2,"errorName":"Error:TIMEOUT"}
{"level":"warn","event":"dashboard.pulse.room_failed","reason":"academy","route":"/api/dashboard/pulse","durationMs":2,"errorName":"Error:TIMEOUT"}
{"level":"warn","event":"dashboard.pulse.room_failed","reason":"career","route":"/api/dashboard/pulse","durationMs":3,"errorName":"Error:TIMEOUT"}
```

### Kök Nedenler:
1. **Erken Havuz Kilidi ve Hatalı `isKernelDbPoolBusy` Tetiklenmesi (2ms TIMEOUT):**
   - Loglardaki `durationMs: 2` süresi, sorgunun gerçekten veritabanında 8 saniye bekleyip zaman aşımına uğramadığını; `withFailEarlyDbRead` mekanizmasının havuz henüz hazır veya bağlantı kurma aşamasındayken `isKernelDbPoolBusy()` tarafından anında reddedildiğini gösterdi (`db_read_timeout:...:pool_busy`).
   - `pg-pool` kütüphanesinde `connect()` sırasında `_idle` listesi boşken henüz maksimum havuz tavanına (`max: 10`) ulaşılmamış olsa dahi `waitingCount > 0` oluşabilmekteydi. Mevcut mantık `waiting > 0` gördüğü anda havuzu meşgul (`busy`) sayıyor ve arka plan nabız sorgularını anında iptal ediyordu.
2. **Çoklu ve Yinelenen Ağır Alt Sorgular:**
   - **Kariyer Nabzı (`projectLiveCareerBoard`):** Kullanıcının damgası (`stamps`) hiç olmasa bile `ports.proofs.listSealedProofs(userId)` çağrılıyor; bu da hem `freelancer_contracts` hem de `academy_certificates` tablolarında fazladan join ve filtreleme sorguları açıyordu.
   - **Akademi ve Kariyer Sayım/Sıralama Sorguları:** `pulseForUser` fonksiyonlarında aynı anda `count` ve `findFirst({ orderBy: { issuedAt: "desc" } })` ayrı ayrı iki DB turu (round-trip) şeklinde çalıştırılıyordu.
3. **Statik / Kısıtlı Yapılandırma:**
   - Pulse oda zaman aşımı, oda eşzamanlılığı ve havuz limitleri için ortam değişkeni (`env`) tabanlı esneklik bulunmuyordu.

---

## 2. Uygulanan Tedavi ve İyileştirmeler

### A. Bağlantı Havuzu ve Fail-Early Mantığının İyileştirilmesi (`lib/kernel/db.ts`)
- **`isKernelDbPoolBusy(env)` optimizasyonu:**
  - Havuzda boşta (`idle > 0`) soket varsa veya havuz henüz maksimum kapasitesine ulaşmamışsa (`total < max`), havuz meşgul sayılmayacak şekilde güncellendi.
  - Geliştirme ortamında (`NODE_ENV === "development"` ve non-serverless) tekil geliştirici yarış durumları için `waiting >= 3` eşiği getirilerek anlık 2ms'lik sahte `TIMEOUT` düşüşleri engellendi.
  - Hata ayrıştırmasında `db_read_timeout` mesajındaki `:pool_busy` durumu `POOL_BUSY` hata kodu ile etiketlenerek ayrıştırılabilir hale getirildi.
- **Dinamik Havuz ve Okuma Zaman Aşımı Ayarları:**
  - `KERNEL_BACKGROUND_READ_TIMEOUT_MS` ve `DB_READ_TIMEOUT_MS` ortam değişkenleri üzerinden yerel ağ/gecikme durumuna göre özelleştirilebilir yapı sağlandı.
  - `PRISMA_POOL_MAX` ve `PRISMA_POOL_TIMEOUT_MS` değişkenleri uzun süreçli (dev/node) ortamlar için dinamik yapılandırmaya açıldı.

### B. Dashboard Pulse Dinamik Bütçe ve Oda Yönetimi (`app/api/dashboard/pulse/load.ts`)
- `DASHBOARD_PULSE_ROOM_TIMEOUT_MS`, `DASHBOARD_PULSE_ROOM_CONCURRENCY` ve `DASHBOARD_PULSE_LOAD_BUDGET_MS` env tabanlı dinamik hale getirildi.
- Serverless ortamlar için var olan 2s / 1-eşzamanlılık kısıtlamaları ve üretim güvenlik garantileri aynen korundu.

### C. Pulse Sorgularının Hafifletilmesi (Zero-Waste Querying)
1. **Kariyer Canlı Tahtası (`lib/career/live.ts`):**
   - `projectLiveCareerBoard` içerisinde `stamps` ve `portfolio` önce çekilmektedir. Kullanıcının pasaport damgası yoksa (`stamps.length === 0`), ağır `listSealedProofs` (sözleşme + sertifika taraması) hiç çağrılmadan anında dönülmektedir.
2. **Akademi Nabzı (`lib/academy/prisma-store.ts`):**
   - Ayrı ayrı `count` + `findFirst` yerine `findMany({ select: { title: true }, take: 100 })` ile tek sorguda hem toplam sertifika sayısı hem de en son alınan sertifikanın başlığı elde edilmektedir.
3. **Kariyer Nabzı (`lib/career/prisma-store.ts`):**
   - Damga sayısı ve son mühür başlığı için gereksiz çift SELECT birleştirilerek tek sorguya indirilmiştir.

### D. Çevre Değişkenleri Şeması ve Dokümantasyon (`lib/kernel/env.ts` & `.env.example`)
- Eklenen performans ayarları Zod `envSchema` yapısına kaydedildi.
- `.env.example` dosyasına isteğe bağlı yerel geliştirme performans parametreleri şeffaf açıklamalarla eklendi.

---

## 3. Doğrulama ve Test Sonuçları

1. **TypeScript Typecheck (`npm run typecheck`):**
   - Başarılı. Sıfır tip hatası (`exit code: 0`).
2. **Linter Denetimi (`ReadLints`):**
   - Değiştirilen dosyalarda sıfır linter hatası.
3. **Vitest Birim ve Entegrasyon Testleri:**
   - `tests/dashboard/`: 5 dosya, 28 test geçti (`exit code: 0`).
   - `tests/career/`: 9 dosya, 35 test geçti (`exit code: 0`).
   - `tests/academy/`: 54 dosya, 276 test geçti (`exit code: 0`).
   - Genel test süiti (`npm run test`): 613 test başarıyla geçti (`exit code: 0`).
4. **Prebuild & Güvenlik Doğrulamaları (`npm run verify:prebuild`):**
   - `verify:no-secrets`: OK
   - `verify:amount-minor`: OK
   - `verify:rls-status`: OK
   - `verify:v1-contract-artifacts`: OK
   - `verify:idor-seals`: OK

---

## 4. Sonuç
Yerel geliştirme ortamında uzak veritabanı gecikmesi veya bağlantı havuzu soğuk başlatması sırasında oluşan sahte zaman aşımları ve uyarı logları giderilmiş; veritabanı sorgu trafiği hafifletilmiş ve sistem dayanıklılığı (fail-soft resilience) korunmuştur.
