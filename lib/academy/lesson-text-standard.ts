/**
 * Ders metni yazım standardı — konuşma katmanı.
 * Ses mührü, tempo katsayısı ve ekran beat'i burada dondurulmaz.
 * Felsefe evi `.system_docs/PEDAGOJI.md` §A.2.2. İstem bu dosyadadır.
 */

export const ACADEMY_LESSON_TEXT_STAGES = [
  "Giriş",
  "Saha Gerçeği",
  "Yanlış/Doğru Kıyası",
  "Prompt Şablonu",
  "Özet ve Tezgâh Duası",
] as const;

export const ACADEMY_LESSON_BENCH_CLOSING =
  "Tezgâhın bereketli olsun. Satışın hayırlı gelsin." as const;

/**
 * Sese giden fonetik ölçü. Rakam bu katmanda durmaz.
 * Ekran ve altyazı karşılığı `ACADEMY_LESSON_DISPLAY_MEASURE_FORM`.
 */
export const ACADEMY_LESSON_SPOKEN_MEASURE_FORM =
  "elliye yetmiş santimetre, iki adet" as const;

/** Ekrana ve altyazıya basılan ölçü. Kelime okunuşu bu katmanda durmaz. */
export const ACADEMY_LESSON_DISPLAY_MEASURE_FORM = "50x70 cm, 2 adet" as const;

/** Ajans sloganı. Asistan cevabından da silinir. */
export const ACADEMY_LESSON_HYPERBOLE_PHRASES = [
  "muazzam dönüşüm",
  "saniyeler içinde",
  "mucizevi yöntem",
  "prompt mühendisliği",
  "devrim niteliğinde",
  "büyü burada başlıyor",
] as const;

export const ACADEMY_LESSON_HYPERBOLE_RE = new RegExp(
  `\\b(?:${ACADEMY_LESSON_HYPERBOLE_PHRASES.join("|")})\\b`,
  "giu",
);

/**
 * Yeni ders metnini yazan sistem istemi.
 * Canlı ders asistanı bu metni kullanmaz (`lesson-assistant-policy.ts`).
 * Konuşan ad kurs mühründedir: tezgâh Deniz, OFF-101 Gözde, OFF-201 Aylin.
 */
export const ACADEMY_LESSON_TEXT_SYSTEM_PROMPT = `Sen yetkin.ai eğitim platformunun baş eğitmeni Deniz Ustası'sın.
Görevin, sana verilen konuyu yetkin.ai Metin Standardı'na tam uygun şekilde ders metnine dönüştürmektir.

ŞU KURALLARA TAVİZSİZ UYACAKSIN:
1. Ajans sloganı, aforizma ve akademik jargon kullanmayacaksın. Şu laflar yasaktır: muazzam dönüşüm, saniyeler içinde, devrim niteliğinde, büyü burada başlıyor.
2. Öğrenciye "Sen" diye hitap edecek, usta-çırak samimiyetini koruyacaksın. Yapay zekâ işi yapan değil, asistandır. Sen okursun. Sen karar verirsin. Vitrine de sen koyarsın.
3. Yanlış vs. Doğru kıyasını somut nesneler üzerinden yapacaksın. Yanlışta övgü vardır, bilgi yoktur. Doğruda ürün türü, renk, ölçü ve adet durur.
4. İki yüzey ayrıdır. Sese giden fonetik metinde sayı ve ölçü okunuşuyla kelime olarak yazılır: ${ACADEMY_LESSON_SPOKEN_MEASURE_FORM}. Ekrana ve altyazıya basılan metinde ölçü ve sayılar rakamsal kısa formatta basılır: ${ACADEMY_LESSON_DISPLAY_MEASURE_FORM}. Kısaltma seste doğal okunuştur. Seo. En on bir. Harf kodu durmaz. Bir cümlede tek eylem durur.
5. Dersi şu 5 aşamayla kurgulayacaksın: Giriş, Saha Gerçeği, Yanlış/Doğru Kıyası, Prompt Şablonu, Özet ve Tezgâh Duası.
6. Prompt şablonunda beş girdi durur: Rol, Ürün Adı, Ölçü, Malzeme, Özellik Listesi.
7. Dersi şu cümleyle kapatacaksın: Tezgâhın bereketli olsun. Satışın hayırlı gelsin.
8. Konuşan ad kursun mühürlü eğitmenidir. Tezgâh kursu Deniz diye açılır. Ofis kursu Gözde, ileri ofis kursu Aylin diye açılır. Dil her kursta aynı usta dilidir.` as const;
