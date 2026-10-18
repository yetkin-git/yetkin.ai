# TEDAVİ RAPORU — Canlı Ders Koçu (Selim Öğretmen)

**Tarih:** 2026-10-18  
**Karar sahibi:** SUPER_ADMIN  
**Hedef:** `http://localhost:3000/junior/ders/jr_06_mat-5` — sağ ray «Hızlı araçlar»  
**Durum:** Tedavi tamamlandı. Selim Öğretmen sohbet paneli sağ raydan açılır; bağlamsal Sokratik yanıtlar canlı.

---

## ADIM 1 — Teşhis

Stüdyo düzeninde sağ ray (`Mat5FocusedLayout`) yalnız üç araç taşıyordu: Etkinlikler, Soru Bankası, Ders Notu. Öğrencinin aktif sahnede takıldığı noktayı anında sorabileceği canlı koç yoktu.

| Boşluk | Etki |
|--------|------|
| Sağ rayda koç sekmesi yok | Takılma anında yardım yolu kopuk |
| Ders/sahne bağlamı yok | Genel sohbet pedagojiye oturmuyor |
| Sokratik üslup yok | Doğrudan cevap riski |

---

## ADIM 2 — Tedavi

### 1) Sağ panel entegrasyonu

- `JuniorHubModule` genişletildi: `"tutor"`
- Hızlı araçlar listesine **Selim Öğretmen'e Sor** eklendi
- Panel slotu: `module === "tutor"` → `LiveTutorPanel`

### 2) Bağlamsal farkındalık + pedagoji

- API: `POST /api/junior/live-tutor` (`auth: public`)
- Sunucu bağlamı: `lessonKey`, mühürlü özet (`conceptSeal`), ders notu özeti, kazanımlar, aktif sahne
- Player `junior:live-tutor-scene` olayı ile sahne başlığı / alt başlık / cue indeksini panoya iletir
- Sistem promptu Sokratik: doğrudan cevap yok, ipucu + soru, 6. sınıf üslubu
- Misafir: deterministik yerel Sokratik yanıt (sıfır risk önizleme)
- Oturum: `LITE_STREAM` model rolü (`model-roles.ts`) + Junior token kaynağı

### 3) Arayüz

- Kompakt sohbet: Selim «S» rozeti, öğrenci/öğretmen balonları
- Hızlı çipler:
  - 💡 Bu kuralı bir örnekle açıklar mısın?
  - 🔍 Rakamları toplamı kuralını anlayamadım.
  - 🎯 Bana bununla ilgili 1 soru sor!
- Metin kutusu + gönder

### Dokunulan dosyalar

| Dosya | Rol |
|-------|-----|
| `lib/junior/live-tutor-policy.ts` | Kota, prompt, çipler, yerel yanıt |
| `lib/junior/live-tutor.ts` | Bağlam yükleme + LLM/local cevap |
| `app/api/junior/live-tutor/route.ts` | HTTP kapısı |
| `components/junior/live-tutor-panel.tsx` | Sohbet UI |
| `components/junior/activity-hub.tsx` | `tutor` modül tipi |
| `components/junior/activity-studio.tsx` | Hızlı araç + slot |
| `components/junior/lesson-chain.tsx` | Tutor paneli bağlama |
| `components/junior/pilot-player/JuniorPilotPlayer.tsx` | Sahne olayı |
| `lib/kernel/security/route-auth-map.ts` | `verify:api-auth` yenilemesi |
| `tests/junior/live-tutor.test.ts` | Politika + cevap testleri |

### Korunan sözleşmeler

- Model kimliği `lib/kernel/ai/model-roles.ts` üzerinden; gömülü eski model yok
- Mühürlü ders içeriği (`mat/5`, timeline) değiştirilmedi
- Etkinlik / quiz / ders notu SSOT’una dokunulmadı

---

## ADIM 3 — Doğrulama

### Ortam

`http://localhost:3000/junior/ders/jr_06_mat-5` → sağ ray **Selim Öğretmen'e Sor**

### Kanıt (DOM / davranış)

| Ölçüm | Sonuç |
|-------|--------|
| `data-junior-studio-tool="tutor"` | var |
| `data-junior-live-tutor` sohbet paneli | var |
| Karşılama mesajı (Sokratik) | evet |
| 3 hızlı çip | evet |
| Çip tıklanınca yanıt | evet — «24 / 2 kuralı» ipucu |
| Aktif sahne etiketi | «Bölünebilme Dedektifleri · 12 Bilye Deneyi» |
| Unit test `tests/junior/live-tutor.test.ts` | **7/7 geçti** |
| `verify:api-auth` | OK — route public |

### Görsel durum

- Sağ rayda dördüncü araç: Selim Öğretmen'e Sor
- Ana alanda kompakt sky/emerald sohbet kartı
- Öğretmen rozeti + hızlı çipler + giriş alanı

---

## SUPER_ADMIN notu

Sıfır risk: misafir önizlemede LLM çağrılmaz; yerel Sokratik şablonlar ders mühürüne bağlıdır. Oturumlu kullanıcıda LITE_STREAM + günlük 12 soru kotası. Ders dışı sohbet kapalıdır. Model haritası dokunulmadı; kod `model-roles.ts` okur.
