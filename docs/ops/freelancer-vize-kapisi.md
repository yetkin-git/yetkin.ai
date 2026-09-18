# Freelancer vize kapısı — teknik şartname

Vizyon ilkesi Manifesto Kural 2’dedir. Bu dosya kod ile aynı teknik ayrıntıdır.

Zaman kipi: kilitli yüzeyde canlı kapı değildir. `/freelancer` kamu 410’dur. Kapılar Split ve vitrin kilidi kalkınca uygulanır.

## Çift katman

- **Garantili kapılar (vize şartlı):** Ofis, e-ticaret, sosyal içerik, chatbot, prompt — her kapı yayın compact SKU belgesine kilitlidir. Teklif 403 (`LISTING_ACCESS_VISA_DENIED`).
- **Standart pazaryeri (vizesiz OPEN):** Yazılım/web, grafik, dijital pazarlama, çeviri, diğer — `isOpenTrialNeed`.
- **Açık Deneme (`acik-deneme`):** Aynı OPEN bayrağı.

Kimlik SSOT: `@yetkin/kernel` catalog-ids (`FREELANCER_GUARANTEED_NEED_IDS`, `FREELANCER_MARKETPLACE_NEED_IDS`).
