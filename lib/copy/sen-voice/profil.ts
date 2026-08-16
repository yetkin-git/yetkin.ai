/** Rail SEN aksı — kimlik sığınağı. Müze sen-voice kopyalanmaz. */
export const PROFIL_SEN = {
  eyebrow: "Vatandaş kimlik sığınağı",
  title: "Profil",
  description:
    "Bu hesap kime ait, çekirdek User satırından okunur. Görünen adını güncellersin; e-posta Auth katmanında kalır.",
  stats: {
    nameLabel: "Görünen ad",
    nameHintSet: "User.displayName",
    nameHintEmpty: "Oturumla yazılır; kayıtta boş gelebilir",
    localeLabel: "Dil",
    localeHint: "User.locale / timeZone",
    joinedLabel: "Kayıt",
    joinedHintLive: "User.createdAt",
    joinedHintPending: "Satır bağlanınca yıl görünür",
    guest: "Oturum yok",
    waiting: "Bekleniyor",
  },
  auth: "Kimlik kartı oturum ister. Sahte profil basılmaz.",
  unboundBadge: "Liste henüz yüklenemedi — örnek düzen",
  unboundBody:
    "Veritabanı bağlanınca gerçek User satırı burada durur. Uydurma ad yok. Oturum e-postası Auth’tan gelir; o dürüsttür.",
  missingBadge: "Kimlik satırı henüz yok",
  missingBody:
    "Auth UUID var; public.users satırı yok. handle_new_user tetikleyicisi çalışınca kart dolar. E-posta oturumdan gösterilir.",
  honestyTitle: "Kimlik dürüstlüğü",
  honestyBody:
    "Görünen ad public.users satırına yazılır; e-posta Auth tetikleyicisiyle senkron kalır. Şifre User tablosunda durmaz. Freelancer vitrini ve KYC bu çekirdeğe eklenmez.",
  card: {
    title: "Kimlik kartı",
    eyebrow: "Çekirdek User",
    intro: "Görünen ad oturum sahibine aittir. E-posta Auth SSOT’tur; bu form onu yazmaz.",
    name: "Görünen ad",
    email: "E-posta",
    locale: "Dil",
    timeZone: "Saat dilimi",
    createdAt: "Kayıt tarihi",
  },
} as const;
