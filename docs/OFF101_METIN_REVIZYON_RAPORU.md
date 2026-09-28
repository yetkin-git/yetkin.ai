# OFF-101 metin revizyon raporu

Tarih: 28 Eylül 2026. Ses çağrısı yok. Kota bugün dokunulmadı.

Kaynak: `lib/academy/spoken-scripts/01_office_ai-*.md` (OFF-201 hariç), aynı cümleler `lib/academy/curricula/office_ai/` makalelerinde ve `lib/academy/lesson-cues/01_office_ai-*.json` paragraf dizilerinde. Mühürlü saat `lesson-audio-timings/` yerinde durur; el ile yazılmaz. Yarınki `--seal` o saati yeniden basar.

Pedagoji ölçütü: `.system_docs/PEDAGOJI.md` §A.2 ve §E.2. Günlük dil, tek iş, tek cümle. Aktarım sırasının adı üç adımdır. «Kapı» ve «taşıma su» stüdyo kısaltmasıdır.

## Cue eşleşmesi

Konuşma paragrafı ile cue paragrafı aynı düzeltmeyi aldı. Hazırlık şeridi (`01_office_ai-0`) birebir hiza testi geçti. Sekiz dersin nefes paketi hâlâ ders başına 10 istek (`tests/academy/tts-breath-chunks.test.ts`). Cümle nefesi fırında 0,4 sn olarak basılır; kaynak metne `[pause]` yazılmaz. Paragraf sayısı değişmedi. Saat damgaları eski kasetindir; metin değişince karaoke saati yarınki mühürle kayar.

## Ders ders

| Ders | Düzeltme |
|------|----------|
| `01_office_ai-0` | «kapı sırası» → üç adım. «Sihirli değildir / sihirli cümle / jargon» kalktı. Büyük dil modeli, sohbet yapay zekâsından sonra anılır. |
| `01_office_ai-1` | Yolculuk, zaman tuzağı, arkana yaslan, bir çırpıda, kökünden hamle, hayati adım, dönüşümün hızı, cebine koy çerçevesi kalktı. A1, üç adım, ataş ve maske köprüsü durur. |
| `01_office_ai-k1` | «Cebine üç kural koy» → «Üç kuralı yaz.» Büyük dil modeli günlük karşılıktan sonra gelir. Kapanış «Sıradaki ders rapordur» durur. |
| `01_office_ai-2` | Parlama, berrak özet, sahneye çıkış, satır avı ve biz dili kalktı. Karar cümlesi ve hücre kilidi durur. |
| `01_office_ai-3` | Dakikalar içinde, devasa, havalı şablon, şablon kaosu tekerlemesi, bağırma ve «en hızlı akış» kalktı. Vurucu mesaj kuralı ve görsel yönlendirme durur. Terim sırası: gözün bakma sırası, sonra görsel hiyerarşi. Otomatik makro; VBA vatandaş cümlesinde yok. |
| `01_office_ai-5` | Kürsü cümlesi ve «kör güven» kalktı. Uydurma sayı, 59.450 ve TOPLA kilidi durur. |
| `01_office_ai-g1` | «Asıl kapı» → asıl yol. Rozet metni `KUTUDAN KOPUK`. Sahne anahtarı `TAŞIMA SU` durur; Gmail sahnesi bu anahtarla açılır. «Peki e-posta triyajı nedir?» sorusu durur; hemen ardından günlük tanım vardır. |
| `01_office_ai-w1` | «Atlanmış kapı / üçüncü kapı» → atlanmış adım / üçüncü adım. «Cebine üç adım koy» → «Üç adımı yaz.» |
| `01_office_ai-6` | «Yerleşik kapı» → yerleşik panel. «Cebine üç kural koy» → «Üç kuralı yaz.» «Sınav kapısı» durur; bu, aktarım sırasının adı değildir. |

Sinema kartı alt yazılarında aynı aktarım kısaltması düzeltildi (`lib/academy/cinema-cue-catalog.ts`): onaylı araç, Gmail paneli, ataş yolu, sıradaki ders. `ŞABLON KAOSU` rozeti sahne anahtarı olarak durur; konuşma metni bu adı tekerleme diye kurmaz.

## Yarın mühürlenene kadar duranlar

- `lesson-audio-timings/` eski kaset dökümüdür. İçinde «Sıradaki kapı», «cebine koy» ve eski cümleler durur. Yarınki `--seal` bunu kaynak metne çeker.
- Oynatıcı `SIRA SENDE` rozetini hâlâ `SIRA SİZDE` diye gösterir (`academyCitizenPunchcardLabel`). Konuşma ve cue kaynağı `SIRA SENDE` dir. Bu eşleme metin dosyasında değildir.
- Gemini 2.5 açılmaz. Ses Gözde / Callirrhoe. Çağrı kimliği `academyBakeVoiceModelId()`.

## Yarınki fırın

Önce kuru tarama. Harici çağrı yok.

```powershell
npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-0
npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-1
npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-k1
npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-2
npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-3
npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-5
npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-g1
npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-w1
npm run generate:academy-audio -- --dry-run --slug=01_office_ai --key=01_office_ai-6
```

Kuru tarama 10’ar istek bandını gösterince, kota yenilendikten sonra aynı sırayla mühür. Sekiz ders 80 istek eder. Hazırlık şeridi ayrıca sayılır. Günlük tavan yetmezse sırayı bozma; dur, ertesi güne bırak. `--no-fallback` alt modeli kapalı tutar.

```powershell
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-0
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-1
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-k1
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-2
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-3
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-5
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-g1
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-w1
npm run generate:academy-audio -- --seal --confirm-gemini-spend --force --no-db --no-fallback --slug=01_office_ai --key=01_office_ai-6
```

Bugün bu komutlar çalıştırılmaz.
