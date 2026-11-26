/** Rail SEN aksı — odalar arası bağlamsal geçiş köprüleri. */

export const BRIDGES_SEN = {
  eyebrow: "Sonraki adım",
  ecommerce: {
    title: "Mağaza operasyonundan sonraki adım",
    body: "İhracat / dijitalleşme desteğini tara veya e-ticaret ekibin için ilan aç.",
    hibe: {
      label: "YetkinHibe",
      cta: "Mağazan için ihracat ve dijitalleşme hibelerini tara",
      href: "/panel/hibe?kaynak=e-ticaret",
    },
    kurumsal: {
      label: "Kurumsal",
      cta: "E-ticaret operasyon ekibi için ilan aç",
      href: "/kurumsal/ilanlar?pozisyon=E-Ticaret+Operasyon+Sorumlusu",
    },
  },
  hibe: {
    title: "Hibe dosyasından sonraki adım",
    body: "Proje metnini Tezgâh'ta taslakla veya rozetli uzmanları Yetenek Vitrini'nde incele.",
    tezgah: {
      label: "AI Tezgâh",
      cta: "Proje özeti ve bütçe gerekçesi taslağını 30 saniyede üret",
      href: "/tezgah?kaynak=hibe",
    },
    vitrin: {
      label: "Yetenek Vitrini",
      cta: "Proje ekibin için rozetli uzmanları incele",
      href: "/career/vitrin",
    },
  },
  kurumsal: {
    title: "İlan ve elemeden sonraki adım",
    body: "Mülakat sorularını Tezgâh'ta üret veya yeni istihdam / Ar-Ge desteklerini tara.",
    tezgah: {
      label: "AI Tezgâh",
      cta: "Bu pozisyon için yapılandırılmış mülakat soruları üret",
      href: "/tezgah?kaynak=kurumsal",
    },
    hibe: {
      label: "YetkinHibe",
      cta: "Yeni istihdam ve Ar-Ge personel desteklerini gör",
      href: "/panel/hibe?kaynak=kurumsal",
    },
  },
  career: {
    title: "Rozet ve sınavdan sonraki adım",
    body: "YetkinCV puanınla açık ilanlara başvur veya kendi mağazanı kur.",
    ilan: {
      label: "Açık ilanlar",
      cta: "YetkinCV puanınla eşleşen açık ilanlara başvur",
      href: "/ilan",
    },
    ecommerce: {
      label: "E-Ticaret",
      cta: "Kendi markanı ve mağazanı kur",
      href: "/panel/e-ticaret",
    },
  },
  tezgahHint: {
    hibe: {
      title: "Hibe köprüsü",
      body: "Proje özeti ve bütçe gerekçesi için teklif yazıcı hazır. İhtiyacı düzenle, «Üret»e bas.",
      jobPostSeed:
        "Hibe proje özeti ve bütçe gerekçesi taslağı üret. Kapsam, hedefler, kalemler ve gerekçe maddelerini net yaz.",
      expertiseSeed: "Hibe / proje danışmanlığı",
    },
    kurumsal: {
      title: "Kurumsal köprüsü",
      body: "Yapılandırılmış mülakat soruları için teklif yazıcı hazır. Pozisyonu ekle, «Üret»e bas.",
      jobPostSeed:
        "Bu pozisyon için yapılandırılmış mülakat soruları üret. Yetkinlik bazlı, puanlanabilir ve tarafsız soru seti yaz.",
      expertiseSeed: "İK / mülakat tasarımı",
    },
  },
} as const;
