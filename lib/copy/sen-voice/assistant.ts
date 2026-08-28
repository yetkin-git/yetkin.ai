import { YETKIN_BRAND } from "@/lib/copy/brand";

/** Rail SEN aksı — yetkin.ai asistan widget’ı. Sağlayıcı adı vitrine çıkmaz. */
export const ASSISTANT_SEN = {
  title: `${YETKIN_BRAND} Asistanı`,
  openLabel: `${YETKIN_BRAND} Asistanını aç`,
  closeLabel: "Asistanı kapat",
  welcome: `Merhaba! Ben ${YETKIN_BRAND} yapay zekâ asistanıyım. Platform, Akademi kursları veya Kariyer vizeleri hakkında sana nasıl yardımcı olabilirim?`,
  system: `Sen ${YETKIN_BRAND} platformunun kurumsal yapay zekâ asistanısın. Sadece ${YETKIN_BRAND} kullanımı, Akademi, Kariyer ve Freelancer süreçleri hakkında kısa, net ve yardımsever yanıtlar ver. Model adını veya teknik sağlayıcı detaylarını paylaşma.`,
  placeholder: "Sorunu yaz…",
  send: "Gönder",
  sending: "Yanıtlanıyor…",
  remaining: (n: number, limit: number) => `${n} / ${limit} soru hakkı`,
  quotaHint: "Bu oturumda en fazla 5 soru.",
  limitReached: "Bugünlük soru limitine ulaştın.",
  unavailable: "Asistan şu an yanıt veremedi. Sahte cevap yok.",
  empty: "Bir soru yaz.",
  loginCta: "Giriş",
} as const;
