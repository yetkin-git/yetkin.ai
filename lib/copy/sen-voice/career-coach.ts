import { CAREER_ACTION_PLAN_DISCLAIMER } from "@/lib/copy/sen-voice/career";

/** Kariyer koçu. Kazanılmamış rozet doğrulanmış yazılmaz. İş ve gelir vaadi yoktur. */
export const CAREER_COACH_DISCLAIMER =
  "Bu taslak işe yerleşmeyi veya gelir elde etmeyi garanti etmez. Doğrulanmış rozet yalnız Akademi sınavından gelen listedekilerdir." as const;

export const CAREER_COACH_SEN = {
  eyebrow: "Kariyer koçu",
  title: "CV, SWOT ve koç diyaloğu",
  lead: "Hedef rolünü, deneyim özetini ve çalışma biçimini yaz. Doğrulanmış rozetlerin sicilden bağlanır. Kazanmadığın belge doğrulanmış yazılmaz.",
  targetRoleLabel: "Hedeflediğin rol veya alan",
  targetRolePlaceholder: "Freelancer dijital danışman",
  experienceLabel: "Mevcut deneyim ve beceri özeti",
  experiencePlaceholder: "Ürün kartı yazdım. Sosyal medya takvimi kurdum.",
  goalLabel: "Çalışma hedefi",
  goals: [
    { id: "full_time", label: "Tam zamanlı iş" },
    { id: "freelancer", label: "Freelancer" },
    { id: "own_business", label: "Kendi işini kurma" },
  ],
  generateCta: "CV ve SWOT üret",
  generating: "Koç hazırlıyor…",
  fallbackNote:
    "Canlı model bu tur yanıt vermedi. Taslak, yazdığın özet ve sicildeki doğrulanmış rozetlerle hazırlandı.",
  missingKeyNote:
    "Yapay zekâ anahtarı tanımlı değil. Taslak, yazdığın özet ve sicildeki doğrulanmış rozetlerle hazırlandı.",
  llmNote: "Taslak, yazdığın özet ve doğrulanmış rozetlerden üretildi.",
  cvTitle: "Profesyonel CV ve freelancer vitrin metni",
  copyCta: "Metni kopyala",
  printCta: "Yazdır",
  copied: "Kopyalandı",
  copyFail: "Kopyalanamadı",
  swotTitle: "Kişisel SWOT analizi",
  strengths: "Güçlü yönler",
  weaknesses: "Gelişim alanları",
  opportunities: "Fırsatlar",
  threats: "Tehditler",
  offersTitle: "Bu profille en iyi yapabileceğin 3 iş / freelancer hizmeti",
  tezgahCta: "AI Tezgâh'ta dene",
  roadmapTitle: "Gelişim ve beceri yol haritası",
  dialogueTitle: "Kariyer koçu diyaloğu",
  dialogueLead:
    "CV ve SWOT bağlamı durur. İlana göre uyarla, gelişim alanını kapat veya ilk teklifi yaz.",
  dialoguePlaceholder: "CV'mi şu ilana göre uyarla",
  sendCta: "Gönder",
  suggestions: [
    "CV'mi şu ilana göre uyarla",
    "Zayıf yönlerimi nasıl kapatırım?",
    "İlk freelancer teklifimi nasıl yazarım?",
  ],
  emptyBadges:
    "Bağlanacak doğrulanmış rozet yok. Akademi sınavı geçilmeden rozet doğrulanmış yazılmaz.",
  badgeBound: (count: number) =>
    `${count} doğrulanmış rozet bu talebe bağlanır. Listede olmayan belge doğrulanmış yazılmaz.`,
  error: "Koç şu an cevap veremedi. Biraz sonra yeniden dene.",
  invalid: "Hedef rol, deneyim özeti ve çalışma hedefi gerekli.",
  disclaimer: CAREER_COACH_DISCLAIMER,
  planDisclaimer: CAREER_ACTION_PLAN_DISCLAIMER,
} as const;
