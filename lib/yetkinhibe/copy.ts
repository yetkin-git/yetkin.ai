/**
 * YetkinHibe F3 metinleri — muze `SEN_VOICE.hibe` (match, gap, errors) ve
 * `SEN_VOICE.kurumsal.failClosed` alt kümesinin birebir kopyasıdır.
 *
 * F3 çekirdeği metinleri yalnız döndürür; yüzeye (sayfa, rota) F3b/F4 aşamasında çıkar.
 * Bazı metinler kapalı odalara işaret eder (Freelancer, YetkinCAD, Proje Asistanı).
 * Yüzeye çıkmadan önce A5 (dürüst kapalı yüzey) kontrolünden geçmelidir.
 *
 * F3b: `match.nextStep*` metinleri rota yanıtına çıkmaz. Kapalı odaya (Proje Asistanı) ve
 * henüz açılmamış F4 akışına (eksik analizi) işaret ettikleri için A5 kontrolü geçmemiştir.
 * Rota uyum bandını (`READY`, `GAP`, `NOT_READY`) döndürür; metin F6'da denetimle eklenir.
 * `errors.invalidMatchProfile` ve `errors.catalogUnavailable` F3b'de yazılan rota metinleridir.
 */
export const YETKINHIBE_COPY = {
  match: {
    nextStepReady: "Uyumun yüksek — proje hazırlama asistanına geçebilirsin.",
    nextStepGapAnalysis:
      "Orta düzey uyum — eksik analizini çalıştırarak hazırlığını netleştir.",
    nextStepNotReady: "Bu çağrı için henüz hazır değilsin — eksik analizini incele.",
  },
  gap: {
    criterionSatisfiedDetail: (label: string) => `${label} şartını karşılıyorsun.`,
    criterionMissingDetail: (label: string) =>
      `${label} şartın henüz karşılanmıyor — profilini veya hazırlık dosyanı güncelleyerek kapatabilirsin.`,
    rdActivityOk: "Ar-Ge yenilikçi yön tanımın net.",
    rdActivityMissing:
      "Ar-Ge yenilikçi yön tanımı eksik — danışmanlık desteğiyle netleştirebilirsin.",
    technicalDrawingsOk: "Teknik çizim / prototip dokümantasyonun hazır.",
    technicalDrawingsMissing:
      "Teknik çizim / prototip dokümantasyonu eksik — YetkinCAD ile hızlıca üretebilirsin.",
    consultancyOk: "Danışmanlık / mevzuat desteğin sağlanmış.",
    consultancyMissing:
      "Danışmanlık / mevzuat desteği eksik — Freelancer veya uzman danışman üzerinden uzman bulabilirsin.",
    trainingOk: "Hibe başvuru eğitimini tamamlamışsın.",
    trainingMissing:
      "Hibe başvuru eğitimi eksik — Akademi'de ilgili eğitimi tamamlayabilirsin.",
    budgetPlanOk: "Bütçe / zaman çizelgesi taslağın hazır.",
    budgetPlanMissing:
      "Bütçe / zaman çizelgesi taslağın eksik — Proje Asistanı'nda birkaç dakikada oluşturabilirsin.",
    exportOk: "İhracat faaliyet kanıtın mevcut.",
    exportMissing: "İhracat faaliyet kanıtı eksik.",
    patentOk: "Patent / faydalı model tescilin mevcut.",
    patentMissing: "Patent / faydalı model tescili eksik.",
  },
  errors: {
    grantNotFound: "Bu hibe çağrısı bulunamadı.",
    applicationNotFound: "Bu hibe dosyası bulunamadı.",
    invalidMatchProfile: "Eşleştirme bilgisi eksik ya da geçersiz. Alanları kontrol et.",
    matchProfileTooLarge: "Eşleştirme bilgisi çok büyük.",
    catalogUnavailable: "Hibe kataloğu şu an okunamıyor.",
  },
  failClosed: {
    companyMembershipRequired:
      "Bu şirketin çalışanı değilsin — kurumsal işlem sunucu tarafında kapatıldı.",
  },
} as const;
