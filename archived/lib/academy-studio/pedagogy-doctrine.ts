/**
 * Anlatım doktrini — cold-start veri okuma değil; kavramayı oturtma.
 *
 * Gerçek Dünya & Isınmalı Pedagoji (Super Admin tespiti):
 * 0) Isınma / Genel Kültür — teknikten önce: Bu konu nedir? Ne işe yarar? Kim nerede kullanır?
 *    Soyut «yapay zekâ aracı» yok; ChatGPT, Claude, Gemini, Midjourney, OpenAI Playground adı geçer.
 * 4) Ders sonunda isteğe bağlı mikro-ödev — «Şimdi Sen Dene» veya «Ödevi Geç / Devam Et».
 *
 * Üç ilke müfredat metnine ve TTS yönergesine işlenir:
 * 1) Farklı açıdan pekiştirme (re-frame / analoji)
 * 2) Mikro-duraksama ve vurgu (can alıcı nokta)
 * 3) Kıdemli mentör duruşu (formal ansiklopedi ve sokak ağzı yok)
 *
 * 4) Doğal onaylama — «Harika!», «Süper!» gibi yapay coşku yok; Türkçe sohbet ritmi.
 *
 * 5) Kültürel analoji ve yerel benzetme (KÜLTÜREL ANALOJİ STANDARDI):
 *    Karmaşık, soyut ve teknik çelişkiler Türk kültürü ve gündelik yaşamda karşılığı olan
 *    somut benzetme, deyim ve durum örnekleriyle anlatılır. Kanonik Super Admin örneği:
 *    «Çelişen Brief» → otobüs gişesinde «yan yana iki bilet, ikisi de pencere kenarı».
 *    Bu kural tüm katalog SKU müfredatlarında karmaşık kilit noktaların anlatımında bağlayıcı pedagojik ilkedir.
 *
 * EMPHASIS / REFRAME / CONFIRM alt kümeleri `ACADEMY_MENTOR_BRIDGES` ile örtüşür.
 */

/** Can alıcı noktada ritmi yavaşlatan geçişler — TTS üç nokta ile nefes alır. */
export const ACADEMY_PEDAGOGY_EMPHASIS = [
  "Buraya dikkat...",
  "İşte işin düğümlendiği, kritik nokta tam da burası.",
  "Kırılma anı tam olarak bu adımda yaşanıyor.",
  "Saha tecrübesiyle söyleyeyim: Buradaki küçük bir detay tüm sonucu değiştirir.",
  "Şimdi bu kısmı bir kez daha farklı bir örnekle oturtalım...",
] as const;

/** Aynı fikri farklı kelime / benzetmeyle pekiştiren geçişler. */
export const ACADEMY_PEDAGOGY_REFRAME = [
  "Başka bir deyişle...",
  "Yani konuyu şöyle de özetleyebiliriz...",
  "Bunu günlük hayattan bir örnekle ele alırsak...",
] as const;

/**
 * Moderatör ↔ eğitmen onay / geçiş — Amerikan tarzı «Harika!», «Süper!» yasak.
 * Doğal Türkçe sohbet ritmi.
 */
export const ACADEMY_PEDAGOGY_CONFIRM = [
  "Evet, yani...",
  "Doğru dedin.",
  "Aynen öyle.",
  "Tam olarak bu işte.",
  "Çok doğru bir noktaya değindin.",
] as const;

/**
 * KÜLTÜREL ANALOJİ VE YEREL BENZETME İLKESİ — müfredat motoru standardı.
 * Soyut kavramı doğrudan zihinde ışık yakan Türk günlük yaşam örneğiyle pekiştir.
 */
export const ACADEMY_PEDAGOGY_CULTURAL_ANALOGY_RULES = [
  "Karmaşık, soyut ve teknik çelişkiler anlatılırken mutlaka Türk kültüründe ve gündelik yaşamda karşılığı olan somut benzetmeler, deyimler ve durum örnekleri kullanılır.",
  "«Çelişen Brief» gibi soyut kavramlar doğrudan «İkisi de pencere kenarı olsun ama yan yana oturalım» talebi gibi zihinde anında ışık yakan yerel örneklerle pekiştirilir.",
  "Bu kural tüm katalog SKU müfredatlarında karmaşık kilit noktaların anlatımında bağlayıcı pedagojik ilke olarak uygulanır.",
] as const;

/** Super Admin kanonu — yan yana iki pencere kenarı bilet (çelişen brief). */
export const ACADEMY_PEDAGOGY_CULTURAL_ANALOGY_CANON =
  "Bize yan yana iki bilet ver ama ikisi de pencere kenarı olsun" as const;

export const ACADEMY_PEDAGOGY_DOCTRINE_SUMMARY =
  "Önce ısın (nedir / ne işe yarar / kim nerede); somut marka adları kullan; kritik noktada duraksayıp vurgula; aynı fikri kültürel / yerel analojiyle pekiştir (kanon: yan yana pencere kenarı bilet); onayda «Harika!» / «Süper!» yok, doğal Türkçe geçiş kullan; isteğe bağlı mikro-ödevle kapat; kıdemli mentör duruşunda konuş." as const;
