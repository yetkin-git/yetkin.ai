# Ders erişim onarımı

Tarih: 2026-09-28

## Belirti

OFF-101 (`01_office_ai`) ve OFF-201 (`01_office_ai_ileri`) oynatıcısında 1. ders açılıyor, 2–6. dersler listede soluk (`disabled`, `opacity-45`) kalıyordu.

## Neden

Oynatıcı sayfası müfredatı `loadAcademyCurriculum` ile çekerken oturumun `emailConfirmedAt` alanını iletmiyordu. Super Admin kapısı (`isSuperAdminActor` / `hasAcademyAdminBypass`) doğrulanmış e-posta ister. Alan düşünce aktör vatandaş sayılıyor, katalog yalnız sıradaki dersi (`nextLessonKey`) açıyordu. Aynı kimlik düşüşü müfredat, ses izni, ders asistanı ve sınav API çağrılarında da vardı.

## Onarım

- Oynatıcı sayfası ve ilgili akademi API rotaları `emailConfirmedAt` değerini aktöre iletiyor.
- `academyPlayerCatalogFullyOpen`: Super Admin bypass veya ticari kayıt (`hasCommercialAcademyEnrolment`) varsa katalogdaki bütün dersler `open: true`.
- Açık ders oynatıcı listesinde devre dışı kalmıyor; solukluk yalnız kapalı satıra uygulanıyor.
- Kayıtlı ve Super Admin aktör atlanan dersi de tamamlayabiliyor. Kaydı olmayan oturumda sıra kilidi duruyor.

## Doğrulama

`tests/academy/curriculum-player.test.ts` — ticari kayıttan sonra OFF-101 derslerinin tümü açık. Super Admin üretim senaryosu satın alma satırı yazmadan bütün dersleri açmaya devam ediyor.
