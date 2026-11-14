import type { AmountMinor } from "@/lib/kernel/money/amount-minor";

/**
 * YetkinHibe & Teşvik Motoru — paylaşılan tip sözleşmeleri.
 * Parasal alanların tümü `AmountMinor` ile mühürlenir (Anayasa A1). Kuruş yalnızca TRY kopyasında geçer.
 */

export type GrantProgramSource =
  | "KOSGEB"
  | "TUBITAK"
  | "TICARET_BAKANLIGI"
  | "KALKINMA_AJANSI"
  | "RESMI_GAZETE"
  | "BOLGESEL_AJANS";

export type GrantCallStatus = "ACTIVE" | "UPCOMING" | "CLOSING_SOON" | "CLOSED";

/** Katılım için minimum şirket profili eşikleri — uyum motoru bunlara göre skorlar. */
export type GrantEligibilityCriteria = {
  /** Boş ise sektör kısıtı yok. */
  eligibleSectorCodes: readonly string[] | null;
  minEmployeeCount: number | null;
  maxEmployeeCount: number | null;
  minCompanyAgeYears: number | null;
  maxCompanyAgeYears: number | null;
  requiresRdActivity: boolean;
  requiresExportActivity: boolean;
  requiresKobiStatus: boolean;
  requiresPatentOrUtilityModel: boolean;
};

/** Document RAG — şartname belgesinden türetilen yapılandırılmış ipuçları. */
export type GrantSpecificationRules = {
  supportHints: readonly string[];
  deadlineHints: readonly string[];
  documentHints: readonly string[];
  eligibilityHints: readonly string[];
  excerpt: string;
};

export type GrantCall = {
  id: string;
  source: GrantProgramSource;
  sourceLabel: string;
  title: string;
  summary: string;
  /** Programın toplam hibe havuzu (dönem bütçesi). */
  poolAmountMinor: AmountMinor;
  minSupportMinor: AmountMinor;
  maxSupportMinor: AmountMinor;
  /** Destek oranı — binde/yüzde değil, basis points (0-10000). */
  supportRatioBps: number;
  applicationOpensAt: string;
  applicationDeadline: string;
  eligibility: GrantEligibilityCriteria;
  requiredDocuments: readonly string[];
  tags: readonly string[];
  officialInfoUrl: string;
  /** Mühürlü şartname / uygulama esasları metni (RAG Knowledge Base). */
  specificationText?: string | null;
  /** Yapılandırılmış şartname ipuçları. */
  rulesJson?: GrantSpecificationRules | null;
};

/** Katalog çağrısı + zamana bağlı durum. Durum ve kalan gün F2 katalog katmanında hesaplanır; F3 çekirdeği bunları girdi olarak alır. */
export type GrantCallWithMeta = GrantCall & {
  status: GrantCallStatus;
  remainingDays: number;
};

export type CompanyGrantProfile = {
  companyId: string;
  sectorCode: string;
  employeeCount: number;
  companyAgeYears: number;
  annualRevenueMinor: AmountMinor;
  rdMaturityLevel: "NONE" | "EARLY" | "ESTABLISHED" | "ADVANCED";
  exportActive: boolean;
  isKobi: boolean;
  hasPatentOrUtilityModel: boolean;
  region: string;
};

/**
 * Uyum eşleştirmesinin okuduğu profil alanları (veri asgarisi). Gelir ve bölge eşleşme kuralında
 * kullanılmadığı için girdiye alınmaz; `CompanyGrantProfile` bu tipin üst kümesidir.
 */
export type GrantMatchProfile = Pick<
  CompanyGrantProfile,
  | "sectorCode"
  | "employeeCount"
  | "companyAgeYears"
  | "rdMaturityLevel"
  | "exportActive"
  | "isKobi"
  | "hasPatentOrUtilityModel"
>;

export type GrantMatchCriterionResult = {
  key: keyof GrantEligibilityCriteria | "sector" | "employeeCount" | "companyAge";
  label: string;
  satisfied: boolean;
  weightPct: number;
};

export type GrantMatchResult = {
  grantId: string;
  grantTitle: string;
  source: GrantProgramSource;
  matchScorePct: number;
  remainingDays: number;
  poolAmountMinor: AmountMinor;
  maxSupportMinor: AmountMinor;
  criteria: readonly GrantMatchCriterionResult[];
  recommendedNextStep: string;
};

export type GrantEligibilityGapStatus = "OK" | "MISSING" | "PARTIAL";

export type EcosystemBridgeModule =
  | "freelancer"
  | "studio-auto"
  | "academy"
  | "tarim";

export type GrantEligibilityGapItem = {
  criterionKey: string;
  label: string;
  status: GrantEligibilityGapStatus;
  detail: string;
  bridgeModule: EcosystemBridgeModule | null;
  bridgeHref: string | null;
  bridgeCtaLabel: string | null;
};

export type GrantEligibilityGap = {
  companyId: string;
  grantId: string;
  grantTitle: string;
  overallReadinessPct: number;
  gaps: readonly GrantEligibilityGapItem[];
  generatedAt: string;
};

/** Ekosistem köprüleriyle kapatılabilecek hazırlık sinyalleri — eksik analizi girdisi. */
export type GrantReadinessSignals = {
  hasTechnicalDrawings: boolean;
  hasConsultancySupport: boolean;
  hasCompletedRelevantTraining: boolean;
  hasBudgetPlan: boolean;
};

export type GrantEligibilityGapInput = {
  userId: string;
  companyId: string;
  grantId: string;
  profile?: Partial<CompanyGrantProfile>;
  readiness?: Partial<GrantReadinessSignals>;
};

/** KOSGEB/TÜBİTAK iş paketi — Gantt çekirdeği tek satırı. */
export type GrantWorkPackage = {
  id: string;
  name: string;
  category: "ARGE_TASARIM" | "PROTOTIP" | "TEST_DOGRULAMA" | "TICARILESME" | "YONETIM";
  startMonth: number;
  endMonth: number;
  personMonths: number;
  responsibleRole: string;
};

export type GrantBudgetLineCategory =
  | "PERSONEL"
  | "ALET_TECHIZAT"
  | "HIZMET_ALIMI"
  | "SEYAHAT"
  | "GENEL_GIDER";

export type GrantBudgetLine = {
  category: GrantBudgetLineCategory;
  label: string;
  amountMinor: AmountMinor;
  eligibleForSupport: boolean;
};

export type GrantProjectPlanInput = {
  companyId: string;
  grantId: string;
  projectTitle: string;
  monthlyPersonCostMinor: AmountMinor;
  workPackages: readonly Omit<GrantWorkPackage, "id">[];
  equipmentBudgetMinor: AmountMinor;
  serviceBudgetMinor: AmountMinor;
  travelBudgetMinor: AmountMinor;
  /** DB RAG şartname metni — verilmezse grant satırından okunur. */
  specificationText?: string | null;
};

export type GrantProjectPlan = {
  companyId: string;
  grantId: string;
  projectTitle: string;
  ganttSpanMonths: number;
  workPackages: readonly GrantWorkPackage[];
  personMonthTotal: number;
  budgetLines: readonly GrantBudgetLine[];
  totalBudgetMinor: AmountMinor;
  requestedSupportMinor: AmountMinor;
  withinProgramLimit: boolean;
  programMaxSupportMinor: AmountMinor;
  /** Şartname RAG bağlamı plana beslendi mi. */
  usedSpecificationContext: boolean;
  /**
   * Sunucu-yanı şablon bağlam metni (şartname extract dahil).
   * LLM'e bağlanmaz; RSC → istemci sınırında sızdırılmaz.
   * Etiket: «Şablon kural bütçe çıktısı».
   */
  aiContextPrompt?: string;
  /** Dürüst çıktı türü — daima şablon kural motoru. */
  budgetOutputKind: "template_rule";
};
