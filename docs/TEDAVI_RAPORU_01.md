# Tedavi Raporu 01 — Zemin izolasyonu

Tarih: 26 Eylül 2026  
Dal: `off-201-stage` (main üzerinden, reset veya clean yok)

## Ne yapıldı

Çalışma ağacı `main` üzerindeyken yeni dal açıldı ve tüm değişiklikler bu dalda commit edildi. `main` oynatılmadı.

Stash listesinde tek kayıt vardı: `stash@{0}`, 5 Eylül 2026, `WIP on main: c4c3cbf`. Taban commit güncel `main`’in atasıydı; gövde bugünkü çalışma ağacından ayrı, eski bir WIP’ti. `git stash drop` ile silindi (`c0233bda9a602e53288329ab93db848abbc25aca`). Reflog bir süre bu kaydı tutar.

Boş `.tmp/` silindi. `public/media/academy/audio/01_office_ai_ileri/01_office_ai_ileri-6.mp3` diskten silindi ve commit’e girmedi. Ders 3–5 MP3’leri mühürlü varlık olarak duruyor. Ders 1–2 kasetleri `archived/academy-audio-revoked/` altında.

`verify:web-security-seals` betiği ve `scripts/verify-web-security-seals.ts` `tests/kernel/origin-guard.test.ts` dosyasını zorunlu sayıyor. Betiği başka dosyaya kaydırmak mühür zincirini kırardı. Dosya yazıldı: çerezli `sec-fetch-site: cross-site` ve `https://evil.example` yazması 403, `/api/v1/` yolu skip.

`section_4.ts` sınav dizisinden çıkarılmış durumda duruyor; dosya silinmedi. Konuşma metni, cue ve zamanlama `archived/academy/01_office_ai-4/` altına taşındı. `off-102.ts` silindi.

## Commit’ler

`main..off-201-stage`, eskiden yeniye:

| Commit | Özet |
| --- | --- |
| `46c195d` | `feat(academy): add OFF-201 curriculum structure and exams` — `office_ai_2`, sınav havuzu, ileri JSON/cue/zamanlama/konuşma metni, diskten JSON yükleyici |
| `96a1a16` | `feat(academy): add sealed audio assets for OFF-201 (lessons 3-5)` — üç mühürlü MP3 |
| `5b4f93b` | `fix(academy): cleanup OFF-101 lesson 4 remnants` — `off-102` silindi, ders 4 gövdesi arşive alındı |
| `fe12875` | `fix(payments): wallet refund and paytr webhook updates` — iade, PayTR webhook, lisans köprüsü |
| `9669464` | `fix(auth): email confirmation and exemption routes` — send-email kancası, tekrar gönder, muafiyet, ders asistanı |
| `2bb4023` | `docs: update operational status and cleanup deleted reports` — eski fırın raporları silindi, `docs/ops/DURUM.md` ve anayasa notları güncellendi |
| `4acf06d` | `feat(academy): align catalog, player, and production seals` — oynatıcı, katalog, faz-2 taslakları, Rail katalog |
| `4ab896b` | `feat(academy): refresh OFF-101 sealed lesson audio` — 101 mühürlü MP3 yenilemesi |
| `53bc4ee` | `chore(academy): archive revoked Gemini 2.5 cassettes for OFF-201 lessons 1-2` |
| `6d98282` | `fix(copy): refresh legal pages, seo, and citizen voice` |
| `7b5bebd` | `chore(tooling): add happy-dom and the citizen license reset script` |
| `00ed2db` | `fix(kernel): update shell, security seals, and origin guard test` |
| `d8595bf` | `fix(academy): keep fixture courses purchasable and align lesson 4 seals` — ilk test turundaki 28 kırığı |

İstenen altı paket ayrı commit. Ağacın geri kalanı aynı dalda, konuya göre ek commit’lerde. Tek dev commit yok.

İlk `npm test` 17 dosyada 28 test kırdı (satış kapısı `sample-course`’u kapatıyordu, silinen `docs/DURUM.md` hâlâ bir kısa yönlendirme olarak aranıyordu, w1 kelime sayacı 1249 iken alan 1254’tü). `d8595bf` bunları hizaladı. Katalog haritasındaki aday olmayan SKU satılmıyor. OFF-201 satışı kapalı: ders 1, 2 ve 6 mühürsüz.

## Test

Komut: `npm test` (`vitest run`, surface dosyaları hariç)

İkinci tur:

- Test dosyası: 236 geçti
- Test: 1152 geçti
- Süre: 61.40 sn
- Çıkış kodu: 0

`tests/kernel/origin-guard.test.ts` bu turda 3/3 geçti.

## OFF-201 yeniden seslendirme hazır mı?

Kod zemini hazır. Ücretli fırın hazır değil.

Hazır olanlar:

- Konuşma metinleri, cue, zamanlama ve sınav JSON’ları commit’te.
- Ders 3–5 MP3 oynatıcı yolunda.
- Ders 1–2 iptal kaseti arşivde; oynatıcı `ACADEMY_TTS_REVOKED_CASSETTES` ile açmaz.
- Ders 6 MP3 diskte yok. Kuyruk: `ACADEMY_TTS_REBAKE_QUEUE` → ders 1, 2, 6.
- Ses sırası: Kore, Puck, Fenrir, Aoede, Leda, Zephyr (`ACADEMY_OFF201_LESSON_TTS_VOICE`).
- `academyCourseSaleOpen("01_office_ai_ileri")` altı ders mühürlenene kadar false.

Hazır olmayan: Gemini 3.1 Flash TTS kotası bu turda harcanmadı. `--seal` açılmadı. Kota doluyken fırın durur; 2.5’e düşülmez.

## E. Danışma

### 1. Sen olsaydın ne yapardın?

Dalı `origin`’e basar, Vercel’in bu dal için Preview deployment üretmesini beklerdim. Production Branch `main` kalır. Preview yeşil olduktan ve Paket 2 ders 1, 2 ve 6’yı Gemini 3.1 ile mühürledikten sonra `off-201-stage` → `main` pull request’i açardım.

Canlı hattı bugün bu dala bağlamak, satışı kapalı ve üç dersi sessiz bir OFF-201’i production’a alır. Bağlantı adımı yine de şu: Vercel proje ayarı → Git → Production Branch = `off-201-stage`, önce `git push -u origin off-201-stage`. Bunu Paket 2 mühüründen önce yapmam.

### 2. Kontrol ve öneri

Hayır. `git status` temizlenince derleme veya test girdisi küçülmedi. Aynı kaynak dosyalar okunuyor. İkinci `npm test` 61.40 sn sürdü. Boş `.tmp` ve silinen tek MP3 bu süreyi değiştirmez. Kirli ağaç riski hız değil, hangi sürümün canlıya gideceğinin belirsizliğiydi.

### 3. Master plan — Paket 2

Sıradaki iş seslendirme, fiyat değil.

1. Kota penceresini doğrula. `VOICE_TTS_FALLBACK_TO_2_5` kapalı kalsın.
2. Ders 3–5’e `--seal` verme. Yerel MP3 duruyor.
3. Önce dry-run, API yok.
4. Kota açıkken yalnız ders 1 (Kore), ders 2 (Puck) ve ders 6 (Zephyr) için `npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai_ileri --key=...`
5. Yeni kasetler oynatıcı yoluna girince iptal listesinden ve fırın kuyruğundan düşünce, satış kapısı kendiliğinden açılır. Fiyat o kapı açıldıktan sonra katalog satırında kilitlenir. Kapı kapalıyken fiyat yazmak satış açmaz.
