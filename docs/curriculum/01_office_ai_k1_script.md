# 01_office_ai-k1 — KVKK, Şirket Sırları ve Maskeleme

Ses: Gözde / Callirrhoe. Punchcard 8. Compact makalede Mini sınav yok.

## Punchcard

GİRİŞ KÖPRÜSÜ · HOŞ GELDİN · YASAK LİSTE · MASKELE · ÜÇÜNCÜ KAPI · FARK ORTADA · CEBİNE KOY · SIRA SENDE

## Omurga

1. Kapı yerleşik panel, 2. Kapı ataş, 3. Kapı yalnız maskeli kısa özet. Ham kutu ve ekran görüntüsü zinciri atlanmış kapıdır.
Kişisel veri (ad, telefon, IBAN, kimlik, maaş) ve şirket sırrı ham haliyle yüklenmez.

## Bake

```
npx tsx scripts/generate-academy-lesson-audio.ts --dry-run --slug=01_office_ai --key=01_office_ai-k1
npx tsx scripts/generate-academy-lesson-audio.ts --seal --confirm-gemini-spend --force --no-db --slug=01_office_ai --key=01_office_ai-k1
```

Konuşma SSOT: `lib/academy/spoken-scripts/01_office_ai-k1.md`
Cue: `lib/academy/lesson-cues/01_office_ai-k1.json`
