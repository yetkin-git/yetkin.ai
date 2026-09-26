# SON ONAY VE MÜHÜR — OFF-101 / OFF-201

| Alan | Değer |
|------|--------|
| Tarih | 27 Eylül 2026 |
| Dal | `off-201-stage` |
| `origin/main` | `49761f4` — bu mühür orada yok |
| `origin/main`’e uzaklık | 24 commit önde, 0 commit geride |
| İtme | Yok. Uzak dal ve canlı dağıtım bu oturumda değişmedi. |
| Test | `npm run test` — **237 dosya, 1156 test geçti**, çıkış kodu 0, süre 53 sn |

---

## 1. Commitler

Dört tedavi commit’i ve bu kapanış belgesi `off-201-stage` üzerindedir. `main`’e birleşmeye hazırdır: geçmiş düz gider, çakışma tabanı yoktur. Birleştirme ve itme bu oturumda yapılmadı.

| Commit | Konu |
|--------|------|
| `42bf6ab` | PayTR panel takma adında bozuk imza alarmı |
| `eeb30ca` | Ücretli ders sesi için imzalı izin |
| `0f8f1e3` | OFF-201 satış mandalı kapalı; 6 iptal MP3 kamu ağacından çıktı |
| `126942d` | Vatandaş metninden kasa, kokpit ve SKU etiketleri çıktı |
| Bu dosyanın commit’i | Durum yönlendirmesi, kılavuzlar ve mühür kaydı |

`ACADEMY_OFF201_LAUNCH_SALE_OPEN = false` commit `0f8f1e3` içindedir. `academyCourseSaleOpen("01_office_ai_ileri")` bu sabit kapalıyken `false` döner.

Aynı sabit `origin/main` üzerinde yoktur. `git grep` `49761f4` içinde eşleşme vermedi. Mandal, `main`’e birleşmeden ana dalda kilitli sayılmaz.

---

## 2. Canlı dal

İstenen kural `docs/ops/DURUM.md` içine yazıldı:

- Canlı site `origin/main` HEAD ile aynı commit’ten beslenir.
- Vercel → Production → Branch Tracking = `main`.
- Yerelden `vercel --prod` basılmaz.
- CI (`.github/workflows/ci.yml`) push işini yalnız `main` için koşar. Pull request de koşar. Vercel bu işi beklemeden dağıtım açabilir.

`vercel.json` yalnız bölgeyi (`fra1`) kilitler. Üretim dalını seçmez. `git.deploymentEnabled` allowlist değildir: yazılmayan dal Vercel’de açık kalır. Bu dosyaya dal yasağı konmadı; yanlış bir kalıp önizlemeyi de, `main` dağıtımını da kesebilir.

Bu ortamda `gh` ve `vercel` CLI yok. Vercel proje ayarı okunamadı ve yazılamadı. Canlı sitenin hangi commit’ten beslendiği panelden bakılmadan değişmedi.

Sıra operatördedir:

1. Vercel Production Branch = `main`. O anda canlı, `origin/main` (`49761f4`) olur. Bu commit’te OFF-201 sayfası ve `01_office_ai_ileri` MP3’leri yoktur.
2. `off-201-stage` → `main` pull request’i açılır. CI yeşil kalır. `ACADEMY_OFF201_LAUNCH_SALE_OPEN` false kalır.
3. Birleştirme `origin/main`’i ilerletir. Yeni üretim o commit’tir.

---

## 3. İptal kasetler

`HEAD` ve `origin/main` içinde şu altı dosya yoktur:

- `public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-1.mp3` … `-6.mp3`

Diskte klasör de yoktur. Arşiv kopyası `archived/academy-audio-revoked/01_office_ai_ileri` altındadır.

Uzak `origin/off-201-stage` bu silmeyi henüz taşımaz. Canlı dağıtım o uzak daldan geliyorsa altı MP3, yeni bir üretim çıkana kadar adreste durabilir.

---

## 4. Belgeler

| Yol | Durum |
|-----|--------|
| `docs/DURUM.md` | Yönlendirme. Sayı ve nakit tanığı yok. Hedef `docs/ops/DURUM.md`. |
| `docs/ops/DURUM.md` | Yaşayan kesit. OFF-201 satırı: 0/6 mühür, Kore kuyruğu, satış kapalı. Canlı yayın kuralı bu dosyada. |
| `.system_docs/ANAYASA.md` | `docs/ops/DURUM.md` ve `docs/DURUM.md` yönlendirmesi duruyor. |
| `.system_docs/MANIFESTO.md` | Aynı yönlendirme. |
| `.system_docs/PEDAGOJI.md` | Aynı yönlendirme. TTS bütçesi yazıldı. |
| `.system_docs/STORAGE_CONTRACT.md` | OFF-201 0/6. Yayın sesi kenar imzası ister. |
| `.system_docs/OPS_RUNBOOK.md` | `docs/DURUM.md` başvurusu duruyor; hedef dosya diskte var. |
| `.system_docs/DRON_CLIENT_SPEC.md` | Aynı. |
| `.system_docs/ops/ops-dron.md` | Aynı. |
| `.system_docs/ops/ops-paytr.md` | Panel yolu ile kanonik yolun HTTP kodları ayrıldı. |

Eski `docs/TEDAVI_RAPORU_01.md` … `04.md` ve `docs/TESPIT_RAPORU.md` bu kapanışla birlikte ağaçtan çıktı. Yerlerine `docs/TESPIT_RAPORU_OFF101_OFF201.md` ve `docs/TEDAVI_RAPORU_OFF101_OFF201.md` kondu.

---

## 5. Test

Koşu, kod commit’lerinden hemen önce, aynı çalışma ağacında alındı.

```
npm run test
Test Files  237 passed (237)
Tests       1156 passed (1156)
Exit code   0
```

Bu, CI’daki `npm run test` adımıdır. Surface testleri bu komutun dışındadır. GitHub Actions bu dal için koşmadı; dal itilmedi. `origin/main` üzerinde bu tedavinin testi yoktur.

---

## 6. Üç soru

### Platform bu mühürle canlıda %100 sıfır riske ulaştı mı?

Ulaşmadı. Mühür yerel daldadır. Canlı kapı hâlâ açıktır.

Kalan açıklıklar:

1. `origin/main` satış mandalını, ses iznini ve PayTR alarmını taşımaz.
2. Vercel üretim dalı bu oturumda `main` yapılamadı. Canlı commit `origin/main` ile eşitlenmedi.
3. Uzak `off-201-stage` iptal MP3’leri tutmaya devam eder. Canlı o daldan besleniyorsa dosyalar adreste durur.
4. Ses izni 4 saattir ve kullanıcıya kilitli değildir. Satın almadan indirme kapanır; alan kişi adresi iletirse süre dolana kadar dosya iner.
5. Panel takma adı bozuk imzada yine `200 OK` döner. Alarm logdur. CREDIT yazılmaz. PayTR sırı yanlışsa tahsilat Inngest mutabakatına kalır. Inngest paneli bu oturumda görülmedi.

### OFF-201 Kore fırını için ilk adım nedir?

Satış mandalı `false` kalır. Kota yokken `--seal` açılmaz. `VOICE_TTS_FALLBACK_TO_2_5` kapalı kalır. Model `gemini-3.1-flash-tts-preview`, ses Kore (Aylin).

İlk komut API çağırmaz. Ders 1’in metin ve zamanlama fişini basar:

```
npm run generate:academy-audio -- --dry-run --slug=01_office_ai_ileri --key=01_office_ai_ileri-1
```

Fiş güncel metinle tutunca insan onayıyla `--seal --confirm-gemini-spend` açılır. Aynı kapı ders 2–6 için tekrarlanır. Cue ve süre yeni kasete kilitlenir. CEO onayı bundan sonradır. Mandal ancak o onaydan sonra `true` olur.

### Core + Micro-Apps için sıradaki kritik husus nedir?

Tek kapı. Anayasa B1 çekirdeği para, katalog kimliği ve v1 hop yazarı olarak tutar. `apps/rail-is` çekirdek kodunu import etmez.

Bu tedavinin açığı ikinci kapıydı: PayTR panel takma adı kanonik webhook’un yanından `OK` döndü, kamu MP3 yolu oturumsuz indi. Yeni mikro uygulama ikinci bir tahsilat, ikinci bir oturum veya ikinci bir kamu dosya yolu açarsa CI `main`’de yeşil olsa da canlı kapı çoğalır.

Sıradaki iş, her kamu varlık ve her ödeme ağzını aynı kenar kararına bağlamak ve üretim dağıtımını yalnız `origin/main`’e kilitlemektir. Mandal ve imza, o kilit olmadan `yetkin.ai` üzerinde durmaz.
