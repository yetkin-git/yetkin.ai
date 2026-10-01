# FREEMIUM UI FIX RAPORU

| Alan | Değer |
|------|--------|
| Kural | Anayasa B4 ve Pedagoji §A.5 — her eğitimin ilk dersi herkese açık önizlemedir |
| Kapı | `academyCourseOffersFreePreview` (`lib/kernel/catalog-ids/free-preview.ts`) |
| Yüzey | Kurs detayı `app/academy/[slug]/page.tsx` |
| Doğrulama | `tsc --noEmit` temiz; `npm test` 242 dosya / 1191 test geçti |

---

## 1. Özet

Oynatıcı (`/academy/<slug>/oyna`) ilk dersi zaten oturumsuz açıyordu. Detay sayfası bunu satın alma duvarının arkasına gizlemişti. Lisansı olmayan ziyaretçi artık yeşil **1. Dersi Ücretsiz İzle** düğmesini hero’da ve satın alma kartında görür. Ders listesinde sınav yolunun ilk dersi **Ücretsiz / Önizleme** rozeti ve **İzle** düğmesi taşır; sonraki dersler kilit ikonu ve **Lisanslı** ibaresi taşır.

Boş kabuk (sınav yolunda ders yok) önizleme basmaz. Lisansı olan adayda önizleme rozeti basılmaz; mevcut «Derse başla / devam et» yolu durur.

---

## 2. Arayüz

| Yer | Ne görünür | Nereye gider |
|-----|------------|--------------|
| Hero | Yeşil **1. Dersi Ücretsiz İzle**, satın alma düğmesinin üstünde, aynı genişlikte | `/academy/<slug>/oyna` |
| Satın alma kartı | Aynı düğme, masaüstünde satın alma düğmesinin solunda; mobilde üstte ve tam genişlik | aynı oynatıcı |
| Süresi dolmuş lisans | Önizleme düğmesi durur. Önizlemenin süresi yoktur | aynı oynatıcı |
| Ders listesi, ilk ders | **Ücretsiz / Önizleme** + **İzle** | aynı oynatıcı |
| Ders listesi, ders 2+ | Kilit ikonu + **Lisanslı** | tıklanmaz |

Hangi satırın açık olduğu `isAcademyLessonPaywalled` ile okunur. Karar sınav yolunun ilk anahtarıdır; sıra numarası elle yazılmaz.

OFİS-101 hazırlık şeridindeki eski cümle («1. dersten itibaren sekiz ders ödeme sonrası açılır») kaldırıldı. Şerit artık 1. dersin de herkese açık olduğunu, 2. dersten itibaren lisans gerektiğini söyler.

---

## 3. Ekran teyidi

Yerel `http://localhost:3000` üzerinde bakıldı.

**`01_office_ai_ileri` (satın alma duvarı açık, ₺1.290)**

- Masaüstü hero: önizleme düğmesi satın alma düğmesinin üstünde, aynı sol hiza ve aynı genişlik (192px).
- Satın alma kartı: iki düğme yan yana; önizleme solda, «Eğitimi Satın Al — ₺1.290» sağda.
- Mobil (390px): önizleme tam genişlik (358/390) ve satın alma düğmesinin üstünde.
- Ders 1 «Dört Parçalı İstem» yanında İzle; ders 2–6 Lisanslı.
- `/academy/01_office_ai_ileri/oyna` oturumsuz açıldı. Oynatıcı 1. dersi (ses çizelgesi, Oynat) bastı. Ders 2+ listede Kilitli.

**`01_office_ai`**

- Bu yerel katalog yanıtında fiyat satırı «kayıt kapalı» idi; satın alma kartı basılmadı. Hero’daki önizleme düğmesi yine tam genişlik durdu.
- Ders listesinde 1. ders (A1) Ücretsiz / Önizleme + İzle; 2. ders kilit + Lisanslı.

---

## 4. Doğrulama komutları

```
npx tsc --noEmit -p tsconfig.json
npm test
```

`tsc` çıkış kodu 0. `npm test` iki kez koştu; ikisinde de 242 dosya, 1191 test geçti. Yeni sözleşme testi: `tests/academy/freemium-ui.test.ts`.
