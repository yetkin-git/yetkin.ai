/**
 * YetkinCV vaka bankası ve puan hesabı.
 * Doğru şık istemciye gitmez. Puan, akademi sınav motoruyla aynı tam sayı yüzde formülüdür.
 * CV metni saklanmaz; kamu kartı yalnız kapalı sözlükten üretilen sinyali taşır.
 * Sahte ilan, sahte şirket ve sahte logo yoktur.
 */

import { parseSha256Hex, sha256Hex } from "@/lib/kernel/crypto/sha256";
import {
  YETKINCV_ROLES,
  YETKINCV_VERTICALS,
  type YetkinCvCardView,
  type YetkinCvPublicQuestion,
  type YetkinCvRoleId,
  type YetkinCvVerticalId,
} from "@/lib/career/yetkincv-options";

export {
  YETKINCV_ROLES,
  YETKINCV_VERTICALS,
  type YetkinCvCardView,
  type YetkinCvPublicQuestion,
  type YetkinCvRoleId,
  type YetkinCvVerticalId,
} from "@/lib/career/yetkincv-options";

export const YETKINCV_PASS_SCORE = 70 as const;
export const YETKINCV_PAYLOAD_VERSION = "yetkin-rail.career.yetkincv.v1" as const;
export const YETKINCV_CATALOG_MODULE = "career" as const;
export const YETKINCV_CATALOG_UNIT = "yetkincv-exam" as const;
export const YETKINCV_SITTING_MS = 45 * 60 * 1000;
export const YETKINCV_CV_MIN = 40 as const;
export const YETKINCV_CV_MAX = 6000 as const;

export type YetkinCvQuestion = {
  id: string;
  kind: "choice" | "case";
  skillId: string;
  skillLabel: string;
  prompt: string;
  choices: readonly string[];
  correctIndex: number;
};

export type YetkinCvAnswer = {
  questionId: string;
  choiceIndex: number;
};

export type YetkinCvSkillScore = {
  id: string;
  label: string;
  score: number;
  correct: number;
  total: number;
};

export type YetkinCvSwotInput = {
  score: number;
  passed: boolean;
  roleLabel: string;
  verticalLabel: string;
  practiceHref: string;
  verifyHref: string | null;
  strongSkills: readonly string[];
  gapSkills: readonly string[];
  cvSignals: readonly string[];
};

type Axis = { id: string; label: string; needles: readonly string[] };

const CV_AXES: readonly Axis[] = [
  { id: "stock", label: "stok ve sipariş", needles: ["stok", "sipariş", "kargo", "iade"] },
  { id: "channel", label: "pazaryeri", needles: ["pazaryeri", "trendyol", "hepsiburada", "n11"] },
  { id: "grant", label: "hibe dosyası", needles: ["hibe", "kosgeb", "tübitak", "tubitak", "uygunluk"] },
  { id: "budget", label: "bütçe", needles: ["bütçe", "butce", "maliyet", "harcama"] },
  { id: "ads", label: "reklam", needles: ["reklam", "kampanya", "dönüşüm", "donusum"] },
  { id: "content", label: "içerik", needles: ["içerik", "icerik", "sosyal medya", "metin"] },
  { id: "sheet", label: "tablo", needles: ["excel", "tablo", "rapor", "e-posta", "eposta"] },
  { id: "privacy", label: "veri gizliliği", needles: ["kvkk", "kişisel veri", "kisisel veri", "maske"] },
  { id: "software", label: "yazılım", needles: ["api", "test", "prompt", "otomasyon", "yazılım", "yazilim"] },
];

function q(
  id: string,
  kind: YetkinCvQuestion["kind"],
  skillId: string,
  skillLabel: string,
  prompt: string,
  choices: readonly string[],
  correctIndex: number,
): YetkinCvQuestion {
  return { id, kind, skillId, skillLabel, prompt, choices, correctIndex };
}

const BANK: Record<YetkinCvVerticalId, readonly YetkinCvQuestion[]> = {
  ecommerce: [
    q(
      "ec-stock",
      "choice",
      "stock",
      "Stok",
      "Aynı ürün iki pazaryeri kanalında satılıyor. Bir kanalda 4 adet satış düştü, depo sayımı hâlâ 20. İlk doğru adım hangisidir?",
      [
        "İki kanalın stokunu da elle 20 yazmak",
        "Satışı düşen kanalın stoğunu düşürmek ve diğer kanalı aynı depo adediyle hizalamak",
        "Ürünü her iki kanalda da yayından kaldırmak",
        "Fiyatı düşürüp stoğu yok saymak",
      ],
      1,
    ),
    q(
      "ec-return",
      "choice",
      "returns",
      "İade",
      "Müşteri ürünü açmadan iade etti. Kanal iade kaydı var, depo ürünü henüz saymadı. Sipariş durumuna ne yazılır?",
      [
        "Teslim edildi, iade yok",
        "İade yolda; depo sayımı gelmeden stok artmaz",
        "Satış hiç olmamış gibi siparişi sil",
        "Aynı gün yeni satış diye işlemek",
      ],
      1,
    ),
    q(
      "ec-vat",
      "choice",
      "price",
      "Fiyat",
      "Ürün kartındaki satış fiyatı KDV dahil 120. KDV hariç tutarı kartta ayrıca göstermek istiyorsun. Hangisi dürüsttür?",
      [
        "120 yazıp KDV hariç diye etiketlemek",
        "KDV oranını belirtip hariç tutarı oranla ayırmak",
        "KDV satırını boş bırakıp 120'yi her iki yere yazmak",
        "Kargo ücretini fiyata gizleyip KDV yok demek",
      ],
      1,
    ),
    q(
      "ec-copy",
      "choice",
      "listing",
      "Ürün kartı",
      "Ürün açıklamasında ölçmediğin bir teslim süresi yazmak ne üretir?",
      [
        "Doğrulanmış operasyon kaydı",
        "Kartta duran ama ölçülmemiş bir vaat",
        "SHA-256 mühür",
        "Kanal stoğunun kendiliğinden düzelmesi",
      ],
      1,
    ),
    q(
      "ec-case",
      "case",
      "case",
      "Vaka",
      "Vaka: Sabah bir kanal 0 stok gösteriyor, depo rafında 6 kutu duruyor, diğer kanal hâlâ satışa açık. Müşteriye bugün kargolanacak sipariş var. Ne yaparsın?",
      [
        "Altı kutuyu da kapalı kanala ayırıp açık siparişi bekletirim",
        "Açık siparişi depodan ayırır, kanal stoklarını sayılan 6 ile hizalar, 0 görünen kanalı sayım bitene kadar kapalı tutarım",
        "Her iki kanalda da stok 99 yazar, siparişi yarına bırakırım",
        "Ürün fotoğrafını değiştirip stoğu olduğu gibi bırakırım",
      ],
      1,
    ),
  ],
  grant: [
    q(
      "gr-fit",
      "choice",
      "fit",
      "Uygunluk",
      "Destek programının çağrı metni yazılım giderini kapsamıyor. Dosyaya ne yazılır?",
      [
        "Yazılım giderini eğitim diye adlandırıp eklemek",
        "Gideri kapsam dışı diye işaretleyip dosyadan çıkarmak",
        "Toplam bütçeyi şişirip kalemi gizlemek",
        "Çağrı metnini dosyaya koymamak",
      ],
      1,
    ),
    q(
      "gr-budget",
      "choice",
      "budget",
      "Bütçe",
      "Bütçe tablosunda personel satırı teklif mektubundaki adam-ay ile uyuşmuyor. İlk düzeltme nedir?",
      [
        "Yalnız toplam hücreyi yuvarlamak",
        "Adam-ay, birim ücret ve satır tutarını aynı kaynağa bağlamak",
        "Personel satırını silip tutarı makine kalemine taşımak",
        "Eski yılın bütçesini kopyalamak",
      ],
      1,
    ),
    q(
      "gr-proof",
      "choice",
      "evidence",
      "Kanıt",
      "Proje dosyasında faaliyet yazıyorsun ama faturası yok. Satır nasıl durur?",
      [
        "Tamamlandı ve ödendi",
        "Planlandı; ödeme kanıtı yok",
        "Kurum onayladı",
        "Hibe hesabına yattı",
      ],
      1,
    ),
    q(
      "gr-claim",
      "choice",
      "claim",
      "İddia",
      "Henüz başvurmadığın bir program için CV'ye ne yazılmaz?",
      [
        "Başvuru taslağı hazırladığım",
        "Desteği kazandım",
        "Çağrı metnini okuduğum",
        "Uygunluk kontrolü yaptığım",
      ],
      1,
    ),
    q(
      "gr-case",
      "case",
      "case",
      "Vaka",
      "Vaka: KOBİ, yazılım lisansını hibe dosyasına koymak istiyor. Çağrı bu kalemi dışlıyor, eğitim kalemi ise açık. Ne yaparsın?",
      [
        "Lisans faturasını eğitim katılımı diye yeniden adlandırırım",
        "Lisansı kapsam dışı bırakır, eğitim kalemini yalnız gerçek eğitim belgesiyle yazarım",
        "Toplam bütçeyi ikiye böler, lisans satırını siler gibi gösteririm",
        "Onay yazısı yokken «kurum kabul etti» satırı eklerim",
      ],
      1,
    ),
  ],
  marketing: [
    q(
      "mk-claim",
      "choice",
      "claim",
      "İddia",
      "Reklam metninde ölçmediğin «3 günde satış ikiye katlanır» cümlesi ne işe yarar?",
      [
        "Kampanya hedefini kanıtlar",
        "Ölçülmemiş vaattir; metinden çıkarılır",
        "Dönüşüm oranı yerine geçer",
        "SHA-256 kodu üretir",
      ],
      1,
    ),
    q(
      "mk-audience",
      "choice",
      "audience",
      "Kitle",
      "Kampanya, satın almış müşteriye değil siteyi bir kez açmış herkese gidiyor. İlk düzeltme hangisidir?",
      [
        "Bütçeyi ikiye katlamak",
        "Kitleyi ölçülen segmente daraltmak ve dışarıdakini ayrı tutmak",
        "Aynı metni tüm ülkeye açmak",
        "Tıklamayı satış diye yazmak",
      ],
      1,
    ),
    q(
      "mk-measure",
      "choice",
      "measure",
      "Ölçüm",
      "Reklam paneli 400 tıklama, sipariş defteri 12 satış gösteriyor. Rapora hangisi yazılır?",
      [
        "400 satış",
        "400 tıklama ve 12 kayıtlı satış; ikisi ayrı sayılır",
        "412 dönüşüm",
        "Satış yok, yalnız tıklama silinir",
      ],
      1,
    ),
    q(
      "mk-proof",
      "choice",
      "proof",
      "Kanıt",
      "Müşteri yorumu ekran görüntüsü yok. Kampanya slaytına ne konmaz?",
      [
        "Yorum toplamadık",
        "4,9 puan ve 200 yorum",
        "Yorum isteği taslağı",
        "Ölçüm boş",
      ],
      1,
    ),
    q(
      "mk-case",
      "case",
      "case",
      "Vaka",
      "Vaka: Ajans, stokta olmayan ürün için «bugün kargoda» reklamı açmak istiyor. Depo sayımı 0. Ne yaparsın?",
      [
        "Reklamı açar, stok düşünce durdururum",
        "Reklamı açmam; stok 0 iken teslim vaadi yazmam",
        "Komşu ürünün stok adedini bu ürüne yazarım",
        "Eski kampanyanın satışını bu ürünün satışı diye gösteririm",
      ],
      1,
    ),
  ],
  office: [
    q(
      "of-sheet",
      "choice",
      "sheet",
      "Tablo",
      "Aylık raporda aynı sipariş iki satırda duruyor. Toplamı göndermeden önce ne yapılır?",
      [
        "Toplamı elle şişirmek",
        "Çift satırı tek sipariş kaydına indirmek",
        "Boş satırları satış saymak",
        "Geçen ayın toplamını kopyalamak",
      ],
      1,
    ),
    q(
      "of-mail",
      "choice",
      "mail",
      "Yazışma",
      "Müşteri listesini genel bir sohbet aracına yapıştırmadan önce ne kontrol edilir?",
      [
        "Listenin renkleri",
        "Kişisel veri var mı ve araç bu veriyi işlemeye uygun mu",
        "Listenin satır sayısı tek mi",
        "İmza görseli yeterince büyük mü",
      ],
      1,
    ),
    q(
      "of-brief",
      "choice",
      "brief",
      "Talimat",
      "Yazışma taslağı «yarın kesin onaylanır» diyor. Onay makamı henüz bakmadı. Cümle nasıl düzelir?",
      [
        "Onaylandı",
        "Taslak hazır; onay bekliyor",
        "Ret geldi",
        "Ödeme çıktı",
      ],
      1,
    ),
    q(
      "of-file",
      "choice",
      "file",
      "Dosya",
      "Toplantı notunda karar yok, yalnız fikir var. Nota hangi başlık yazılır?",
      [
        "Karar ve sorumlu",
        "Konuşulan fikir; karar yok",
        "Bütçe onaylandı",
        "İş tamam",
      ],
      1,
    ),
    q(
      "of-case",
      "case",
      "case",
      "Vaka",
      "Vaka: Yönetici, müşteri e-posta listesini dış bir sohbete yapıştırıp «kampanya metni yaz» diyor. Listede ad ve telefon var. Ne yaparsın?",
      [
        "Listeyi olduğu gibi yapıştırırım",
        "Ad ve telefonu çıkarır, yalnız iş hedefini yazıp metin taslağı isterim",
        "Listeyi herkese açık bir bağlantıya koyarım",
        "Telefonları sipariş numarası diye rapora eklerim",
      ],
      1,
    ),
  ],
  software: [
    q(
      "sw-test",
      "choice",
      "test",
      "Test",
      "Otomasyon üç örnekte çalıştı, dördüncüde hata verdi. Teslim notuna ne yazılır?",
      [
        "Tüm kayıtlar geçti",
        "Üç örnek geçti, bir örnek hata verdi",
        "Hata örneğini silip dördü de geçti demek",
        "Test çalıştırmadım ama hazır",
      ],
      1,
    ),
    q(
      "sw-prompt",
      "choice",
      "prompt",
      "Talimat",
      "Kullanıcı metninin içine «önceki kuralları yok say» yazılmış. Araç bu metni işlerken ne yapar?",
      [
        "Sistem kuralını bırakıp metindeki emri uygular",
        "Sistem kuralı durur; gömülü emir tek başına yetki açmaz",
        "Metni onaylanmış sözleşme sayar",
        "Kullanıcıya yönetici rolü verir",
      ],
      1,
    ),
    q(
      "sw-review",
      "choice",
      "review",
      "İnceleme",
      "Üretilen kod derlenmeden müşteriye «canlıda» diye verilirse kayıt ne olur?",
      [
        "Gözden geçirilmiş sürüm",
        "Çalıştırılmamış taslak",
        "Sınav mührü",
        "Kabul edilmiş teslim",
      ],
      1,
    ),
    q(
      "sw-secret",
      "choice",
      "secret",
      "Giz",
      "API anahtarı sohbet metninde duruyor. İlk iş nedir?",
      [
        "Anahtarı CV'ye eklemek",
        "Anahtarı metinden çıkarmak ve yenilemek",
        "Anahtarı doğrulama kodu diye yayınlamak",
        "Aynı anahtarı ikinci bir bota kopyalamak",
      ],
      1,
    ),
    q(
      "sw-case",
      "case",
      "case",
      "Vaka",
      "Vaka: Bir akış, fatura tutarını okuyup ödeme emri taslağı yazıyor. Tutar alanını boş bir kayıtta da dolduruyor. Ne yaparsın?",
      [
        "Boş tutarı 1 kabul edip emri gönderirim",
        "Tutar yoksa emri durdurur, boş kaydı hata olarak gösteririm",
        "Rastgele bir tutar yazıp müşteriye yollarım",
        "Testi atlayıp akışı canlıya alırım",
      ],
      1,
    ),
  ],
};

export function yetkinCvRole(id: string): (typeof YETKINCV_ROLES)[number] | null {
  return YETKINCV_ROLES.find((row) => row.id === id) ?? null;
}

export function yetkinCvVertical(id: string): (typeof YETKINCV_VERTICALS)[number] | null {
  return YETKINCV_VERTICALS.find((row) => row.id === id) ?? null;
}

export function yetkinCvPracticeHref(verticalId: string): string {
  return yetkinCvVertical(verticalId)?.practiceHref ?? "/tezgah";
}

export function yetkinCvQuestions(verticalId: string): readonly YetkinCvQuestion[] | null {
  const vertical = yetkinCvVertical(verticalId);
  if (!vertical) {
    return null;
  }
  return BANK[vertical.id];
}

export function yetkinCvPublicQuestions(
  questions: readonly YetkinCvQuestion[],
): YetkinCvPublicQuestion[] {
  return questions.map((question) => ({
    id: question.id,
    kind: question.kind,
    skillLabel: question.skillLabel,
    prompt: question.prompt,
    choices: question.choices,
  }));
}

export function yetkinCvQuestionsByIds(
  verticalId: string,
  ids: readonly string[],
): YetkinCvQuestion[] | null {
  const bank = yetkinCvQuestions(verticalId);
  if (!bank || ids.length === 0) {
    return null;
  }
  const byId = new Map(bank.map((question) => [question.id, question]));
  const picked: YetkinCvQuestion[] = [];
  for (const id of ids) {
    const question = byId.get(id);
    if (!question || picked.some((row) => row.id === id)) {
      return null;
    }
    picked.push(question);
  }
  return picked;
}

/** Dikeyin gerçek alt testleri. Doğru şık bu listede yoktur. */
export function yetkinCvSkillCatalog(verticalId: string): { key: string; label: string }[] | null {
  const bank = yetkinCvQuestions(verticalId);
  if (!bank) {
    return null;
  }
  const skills: { key: string; label: string }[] = [];
  for (const question of bank) {
    if (skills.some((row) => row.key === question.skillId)) {
      continue;
    }
    skills.push({ key: question.skillId, label: question.skillLabel });
  }
  return skills;
}

/** İlanın seçtiği becerilerin soruları. Bankada olmayan anahtar soru üretmez. */
export function yetkinCvQuestionsForSkills(
  verticalId: string,
  skillIds: readonly string[],
): YetkinCvQuestion[] | null {
  const bank = yetkinCvQuestions(verticalId);
  if (!bank || skillIds.length === 0) {
    return null;
  }
  const wanted = new Set(skillIds);
  if (wanted.size !== skillIds.length) {
    return null;
  }
  const picked = bank.filter((question) => wanted.has(question.skillId));
  const covered = new Set(picked.map((question) => question.skillId));
  for (const skillId of wanted) {
    if (!covered.has(skillId)) {
      return null;
    }
  }
  return picked;
}

/**
 * Tam sayı yüzde: floor((doğru * 100) / toplam).
 * `gradeAcademyExam` ile aynı formül. API mühürlemeden önce motor puanıyla karşılaştırır.
 */
export function gradeYetkinCvExam(
  questions: readonly YetkinCvQuestion[],
  answers: readonly YetkinCvAnswer[],
): { score: number; correctCount: number; total: number } {
  const byId = new Map(answers.map((answer) => [answer.questionId, answer.choiceIndex]));
  let correctCount = 0;
  for (const question of questions) {
    if (byId.get(question.id) === question.correctIndex) {
      correctCount += 1;
    }
  }
  const total = questions.length;
  const score = total === 0 ? 0 : Math.trunc((correctCount * 100) / total);
  return { score, correctCount, total };
}

export function yetkinCvSkillBreakdown(
  questions: readonly YetkinCvQuestion[],
  answers: readonly YetkinCvAnswer[],
): YetkinCvSkillScore[] {
  const byId = new Map(answers.map((answer) => [answer.questionId, answer.choiceIndex]));
  const buckets = new Map<string, YetkinCvSkillScore>();
  for (const question of questions) {
    const current = buckets.get(question.skillId) ?? {
      id: question.skillId,
      label: question.skillLabel,
      score: 0,
      correct: 0,
      total: 0,
    };
    current.total += 1;
    if (byId.get(question.id) === question.correctIndex) {
      current.correct += 1;
    }
    buckets.set(question.skillId, current);
  }
  return [...buckets.values()].map((row) => ({
    ...row,
    score: row.total === 0 ? 0 : Math.trunc((row.correct * 100) / row.total),
  }));
}

export function normalizeYetkinCvText(raw: string): string {
  return raw.replace(/\s+/g, " ").trim();
}

export function yetkinCvDigest(normalized: string): string {
  return sha256Hex(normalized);
}

export function yetkinCvSignals(normalized: string): string[] {
  const haystack = normalized.toLocaleLowerCase("tr");
  const hits: string[] = [];
  for (const axis of CV_AXES) {
    if (axis.needles.some((needle) => haystack.includes(needle))) {
      hits.push(axis.label);
    }
  }
  return hits.slice(0, 6);
}

export function yetkinCvSkillSeal(skills: readonly YetkinCvSkillScore[]): string {
  return skills.map((row) => `${row.id}:${row.score}:${row.correct}/${row.total}`).join("|");
}

export function yetkinCvHashPayload(input: {
  userId: string;
  sittingId: string;
  roleId: string;
  verticalId: string;
  score: number;
  issuedAt: Date;
  cvDigest: string;
  skillSeal: string;
}): string {
  return [
    YETKINCV_PAYLOAD_VERSION,
    input.userId,
    input.sittingId,
    input.roleId,
    input.verticalId,
    String(input.score),
    input.issuedAt.toISOString(),
    input.cvDigest,
    input.skillSeal,
  ].join("\n");
}

export function computeYetkinCvHash(input: {
  userId: string;
  sittingId: string;
  roleId: string;
  verticalId: string;
  score: number;
  issuedAt: Date;
  cvDigest: string;
  skillSeal: string;
}): string {
  return sha256Hex(yetkinCvHashPayload(input));
}

export function yetkinCvVerifyPath(hash: string): string | null {
  const parsed = parseSha256Hex(hash);
  if (!parsed) {
    return null;
  }
  return `/vize/${parsed}`;
}

export function toYetkinCvSwotInput(input: {
  score: number;
  roleId: string;
  verticalId: string;
  skills: readonly Pick<YetkinCvSkillScore, "label" | "score">[];
  certificateHash: string;
  cvSignals: readonly string[];
}): YetkinCvSwotInput | null {
  const role = yetkinCvRole(input.roleId);
  const vertical = yetkinCvVertical(input.verticalId);
  if (!role || !vertical) {
    return null;
  }
  if (!Number.isInteger(input.score) || input.score < 0 || input.score > 100) {
    return null;
  }
  return {
    score: input.score,
    passed: input.score >= YETKINCV_PASS_SCORE,
    roleLabel: role.label,
    verticalLabel: vertical.label,
    practiceHref: vertical.practiceHref,
    verifyHref: input.score >= YETKINCV_PASS_SCORE ? yetkinCvVerifyPath(input.certificateHash) : null,
    strongSkills: input.skills.filter((row) => row.score >= YETKINCV_PASS_SCORE).map((row) => row.label),
    gapSkills: input.skills.filter((row) => row.score < YETKINCV_PASS_SCORE).map((row) => row.label),
    cvSignals: input.cvSignals.filter((row) => row.trim().length > 0).slice(0, 6),
  };
}

export function toYetkinCvCardView(input: {
  score: number;
  roleId: string;
  verticalId: string;
  skills: readonly YetkinCvSkillScore[];
  certificateHash: string;
  issuedAt: Date;
}): YetkinCvCardView | null {
  const role = yetkinCvRole(input.roleId);
  const vertical = yetkinCvVertical(input.verticalId);
  const verifyPath = yetkinCvVerifyPath(input.certificateHash);
  if (!role || !vertical || !verifyPath) {
    return null;
  }
  if (!Number.isInteger(input.score) || input.score < 0 || input.score > 100) {
    return null;
  }
  return {
    score: input.score,
    passed: input.score >= YETKINCV_PASS_SCORE,
    roleLabel: role.label,
    verticalLabel: vertical.label,
    skills: input.skills.map((row) => ({ id: row.id, label: row.label, score: row.score })),
    certificateHash: parseSha256Hex(input.certificateHash) ?? input.certificateHash,
    verifyPath,
    issuedAt: input.issuedAt.toISOString(),
  };
}

export type YetkinCvStartInput = {
  roleId: YetkinCvRoleId;
  verticalId: YetkinCvVerticalId;
  cvText: string;
};

export type YetkinCvSubmitInput = {
  sittingId: string;
  answers: YetkinCvAnswer[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function parseYetkinCvStart(raw: unknown): { ok: true; value: YetkinCvStartInput } | { ok: false; error: string } {
  if (!isRecord(raw)) {
    return { ok: false, error: "İstek gövdesi okunamadı." };
  }
  const role = yetkinCvRole(typeof raw.roleId === "string" ? raw.roleId : "");
  const vertical = yetkinCvVertical(typeof raw.verticalId === "string" ? raw.verticalId : "");
  if (!role || !vertical) {
    return { ok: false, error: "Hedef pozisyon ve uzmanlık listeden seçilir." };
  }
  const cvText = normalizeYetkinCvText(typeof raw.cvText === "string" ? raw.cvText : "");
  if (cvText.length < YETKINCV_CV_MIN) {
    return { ok: false, error: "CV özeti en az 40 karakter olmalı." };
  }
  if (cvText.length > YETKINCV_CV_MAX) {
    return { ok: false, error: "CV özeti 6000 karakteri aşamaz." };
  }
  return { ok: true, value: { roleId: role.id, verticalId: vertical.id, cvText } };
}

export function parseYetkinCvSubmit(
  raw: unknown,
): { ok: true; value: YetkinCvSubmitInput } | { ok: false; error: string } {
  if (!isRecord(raw)) {
    return { ok: false, error: "İstek gövdesi okunamadı." };
  }
  const sittingId = typeof raw.sittingId === "string" ? raw.sittingId.trim() : "";
  if (!/^[a-z0-9_-]{8,40}$/i.test(sittingId)) {
    return { ok: false, error: "Sınav oturumu bulunamadı." };
  }
  if (!Array.isArray(raw.answers) || raw.answers.length === 0 || raw.answers.length > 12) {
    return { ok: false, error: "Cevap listesi geçersiz." };
  }
  const answers: YetkinCvAnswer[] = [];
  for (const row of raw.answers) {
    if (!isRecord(row) || typeof row.questionId !== "string" || typeof row.choiceIndex !== "number") {
      return { ok: false, error: "Cevap satırı geçersiz." };
    }
    if (!Number.isInteger(row.choiceIndex) || row.choiceIndex < 0 || row.choiceIndex > 7) {
      return { ok: false, error: "Şık indeksi geçersiz." };
    }
    answers.push({ questionId: row.questionId, choiceIndex: row.choiceIndex });
  }
  return { ok: true, value: { sittingId, answers } };
}
