export const ACADEMY_SEN = {
  catalog: {
    eyebrow: "Akademi",
    title: "Öne çıkan kurslar",
    description:
      "Kursu seç, fiyatı onayla, bakiyeden öde. Dersler SETTLED kayıttan sonra açılır. Ustalık belgesi müfredat sınavı (≥70) sonrası basılır.",
    certificatesCta: "Sertifikalar",
    live: (count: number) => `Canlı sicil — ${count} kurs`,
    unbound: "Liste henüz yüklenemedi — örnek düzen",
  },
  course: {
    eyebrow: "Kurs · Akademi",
    catalogCta: "Katalog",
    noPrice: "Katalog fiyatı yok — satın alma kapalı",
    notPurchasable: "Bu kurs şu an satın alınamaz.",
    loginLead: "Satın almak için",
    loginCta: "giriş yap",
    ownedExam: (passScore: number) =>
      `Müfredat tamam. Sertifika ≥${passScore} puan ister. Satın alma belge basmaz.`,
    ownedNoExam: "Satın alma mühürlendi. Müfredat oynatıcısı dersleri açar; sınav kapısı dersler bitince gelir.",
    certificateEyebrow: "Ustalık belgesi",
    certificateBody: "Sınav kapısı geçildi. SHA256 mühür kariyer vizesine aktarılır.",
    examEyebrow: "Müfredat sınavı",
    purchaseEyebrow: "Kilit ve settlement",
    purchaseBody: (lockMinutes: number) =>
      `Emanet yok. Fiyat kilidi ${lockMinutes} dakika; debit sonrası tutar platform hazinesine geçer.`,
  },
  settlement: {
    title: "Satın alma öncesi",
    steps: (lockMinutes: number) =>
      [
        {
          key: "lock",
          label: "Fiyat kilidi",
          detail: `Katalog tutarı ${lockMinutes} dakika mühürlenir. Süre dolunca kilit düşer.`,
        },
        {
          key: "settle",
          label: "Settlement",
          detail: "Bakiye debit; tutar platform hazinesine geçer. Emanet (escrow) yoktur.",
        },
        {
          key: "record",
          label: "Öğrenme kaydı",
          detail: "Kayıt sınav kapısını açar. SHA256 ustalık belgesi bu adımda basılmaz.",
        },
      ] as const,
  },
  purchase: {
    cta: "Cüzdandan satın al",
    locking: (lockMinutes: number) => `Fiyat kilidi alınıyor — ${lockMinutes} dakika geçerli.`,
    settling: "Settlement: bakiye düşülüyor, emanet yok.",
    lockFail: "Fiyat kilidi alınamadı.",
    buyFail: "Satın alma tamamlanamadı.",
  },
  exam: {
    barajHint: (passScore: number) => `Baraj ${passScore}. Satın alma sertifika basmaz.`,
    unanswered: "Tüm soruları yanıtla.",
    submit: "Sınavı gönder",
    pending: "Değerlendiriliyor…",
    failClosed: "Sınav değerlendirilemedi.",
    passed: (score: number) => `Baraj geçildi (${score}). SHA256 mühür ve kariyer vizesi basıldı.`,
    failed: (score: number) =>
      `Barajın altında (${score}). Sertifika basılmaz; öğrenme kaydı durur, yeniden dene.`,
    retryHint: "Yeniden gönderilebilir. Belge yalnız baraj üstünde basılır.",
    locked: "Sınav kapısı müfredat tamamlanınca açılır.",
  },
  player: {
    eyebrow: "Müfredat oynatıcısı",
    catalogCta: "Kursa dön",
    locked: "Satın alma mühürlenmeden ders içeriği açılmaz.",
    lockedBody: "SETTLED öğrenme kaydı gerekir. Fiyat kilidi ve settlement kurs sayfasındadır.",
    progress: (done: number, total: number) => `${done} / ${total} ders tamam`,
    completeCta: "Dersi tamamla",
    completing: "Mühürleniyor…",
    completeFail: "Ders tamamlanamadı.",
    examReady: "Müfredat kapandı. Sınav kapısı açıldı (≥70).",
    examCta: "Sınava geç",
    alreadyDone: "Ders mühürlü",
    nextHint: "Sıradaki ders açık. Atlanan ders tamamlanmaz.",
    openCta: "Müfredatı aç",
    lessonCount: (count: number) => `${count} ders`,
  },
  certificates: {
    eyebrow: "Sertifikalar",
    title: "Sertifikalar",
    description:
      "Ustalık belgesi sınav kapısı (≥70) ve SHA256 hash ile basılır. Satın alma öğrenme kaydıdır.",
    catalogCta: "Katalog",
    auth: "Sertifikalar oturum ister.",
    unbound: "Liste henüz yüklenemedi.",
    empty:
      "Henüz sertifika yok. Kursu satın al, müfredat sınavını ≥70 ile geç. Satın alma tek başına ustalık belgesi değildir.",
    sealed: "Mühürlü",
    hashLabel: "SHA256 mühür",
    scoreLabel: "Puan",
    issuedLabel: "Veriliş",
    verifyCta: "Doğrula",
  },
  verify: {
    eyebrow: "Sertifika doğrula",
    title: "SHA256 mühür",
    valid: "Mühür geçerli",
    mismatch: "Mühür tutmuyor",
    incomplete: "Mühür eksik",
    missing: "Sicilde yok",
    invalidFormat: "Hash biçimi SHA256 (64 hex) değil.",
    missingBody: "Bu hash akademi sicilinde yok. Uydurma geçerli damga basılmaz.",
    mismatchBody:
      "Kayıt var; yeniden hesaplanan SHA256 saklanan hash ile örtüşmüyor. Belge güvenilir sayılmaz.",
    incompleteBody:
      "Kayıt var; deneme, puan veya müfredat mühürü eksik olduğu için mühür yeniden hesaplanamaz.",
    validBody:
      "Saklanan hash, vatandaş kimliği + kurs + deneme + puan + basım anı + müfredat mühürü üzerinden yeniden üretildi ve tuttu. Müfredat mühürü SKU ders anahtarlarının sıralı SHA256 özetidir.",
    privacy: "Vatandaş kimliği bu sayfada gösterilmez.",
    algorithm: "SHA256",
    hashedFieldsLabel: "Hash kapsamı",
    curriculumSealLabel: "Müfredat mühürü",
    scoreLabel: "Puan",
    issuedLabel: "Basım",
    courseCta: "Kursa dön",
    catalogCta: "Katalog",
  },
} as const;
