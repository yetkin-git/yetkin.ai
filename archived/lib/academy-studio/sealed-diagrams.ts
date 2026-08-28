/**
 * Mühürlü akademi mimari şemaları — CMS yok, tohum sicili.
 * Statik kopya: `/media/academy/diagrams/{key}.svg` (bake betiği).
 * Canlı encode / gümrük video factory çağrılmaz.
 */

import {
  ACADEMY_MICRO_VIDEO_DURATION_MAX_SEC,
  ACADEMY_MICRO_VIDEO_DURATION_MIN_SEC,
  type AcademyMicroVideoDurationSec,
} from "@/lib/academy/lesson-media";

export const ACADEMY_DIAGRAM_VIEWBOX = { width: 720, height: 300 } as const;

export const ACADEMY_DIAGRAM_INK = {
  canvas: "#f4f7fb",
  fill: "#ffffff",
  fg: "#0f172a",
  muted: "#5b677a",
  line: "rgba(15, 23, 42, 0.16)",
  grid: "rgba(15, 23, 42, 0.045)",
  safir: "#1a8cff",
  rose: "#e11d48",
  emerald: "#0f9d7a",
} as const;

export type AcademyDiagramNodeKind = "box" | "gate" | "store";

export type AcademySealedDiagramNode = {
  id: string;
  label: string;
  x: number;
  y: number;
  kind?: AcademyDiagramNodeKind;
};

export type AcademySealedDiagramEdge = {
  from: string;
  to: string;
  label?: string;
};

export type AcademySealedDiagramSpec = {
  key: string;
  nodes: readonly AcademySealedDiagramNode[];
  edges: readonly AcademySealedDiagramEdge[];
  loopSec: AcademyMicroVideoDurationSec;
};

const NODE_W = 188;
const NODE_H = 56;

function flow3(
  key: string,
  labels: readonly [string, string, string],
  loopSec: AcademyMicroVideoDurationSec,
  edgeLabels?: readonly [string, string],
): AcademySealedDiagramSpec {
  const nodes: AcademySealedDiagramNode[] = [
    { id: "a", label: labels[0], x: 120, y: 150 },
    { id: "b", label: labels[1], x: 360, y: 150 },
    { id: "c", label: labels[2], x: 600, y: 150 },
  ];
  return {
    key,
    loopSec,
    nodes,
    edges: [
      { from: "a", to: "b", label: edgeLabels?.[0] },
      { from: "b", to: "c", label: edgeLabels?.[1] },
    ],
  };
}

function gate3(
  key: string,
  labels: readonly [string, string, string],
  loopSec: AcademyMicroVideoDurationSec,
): AcademySealedDiagramSpec {
  return {
    key,
    loopSec,
    nodes: [
      { id: "a", label: labels[0], x: 120, y: 150 },
      { id: "b", label: labels[1], x: 360, y: 150, kind: "gate" },
      { id: "c", label: labels[2], x: 600, y: 150 },
    ],
    edges: [
      { from: "a", to: "b" },
      { from: "b", to: "c" },
    ],
  };
}

function tripod(
  key: string,
  labels: readonly [string, string, string],
  loopSec: AcademyMicroVideoDurationSec,
): AcademySealedDiagramSpec {
  return {
    key,
    loopSec,
    nodes: [
      { id: "a", label: labels[0], x: 360, y: 78, kind: "store" },
      { id: "b", label: labels[1], x: 170, y: 210 },
      { id: "c", label: labels[2], x: 550, y: 210 },
    ],
    edges: [
      { from: "a", to: "b" },
      { from: "a", to: "c" },
      { from: "b", to: "c" },
    ],
  };
}

function cycle4(
  key: string,
  labels: readonly [string, string, string, string],
  loopSec: AcademyMicroVideoDurationSec,
): AcademySealedDiagramSpec {
  return {
    key,
    loopSec,
    nodes: [
      { id: "a", label: labels[0], x: 200, y: 78 },
      { id: "b", label: labels[1], x: 520, y: 78 },
      { id: "c", label: labels[2], x: 520, y: 222 },
      { id: "d", label: labels[3], x: 200, y: 222 },
    ],
    edges: [
      { from: "a", to: "b" },
      { from: "b", to: "c" },
      { from: "c", to: "d" },
      { from: "d", to: "a" },
    ],
  };
}

function stack(
  key: string,
  labels: readonly string[],
  loopSec: AcademyMicroVideoDurationSec,
): AcademySealedDiagramSpec {
  const startY = labels.length === 4 ? 60 : 78;
  const gap = labels.length === 4 ? 60 : 72;
  const nodes: AcademySealedDiagramNode[] = labels.map((label, index) => ({
    id: `s${index}`,
    label,
    x: 360,
    y: startY + index * gap,
    kind: index === 0 ? "store" : "box",
  }));
  const edges: AcademySealedDiagramEdge[] = [];
  for (let index = 0; index < nodes.length - 1; index += 1) {
    edges.push({ from: nodes[index]!.id, to: nodes[index + 1]!.id });
  }
  return { key, loopSec, nodes, edges };
}

const D5 = 5 as const;
const D6 = 6 as const;
const D7 = 7 as const;
const D8 = 8 as const;

const SPECS: readonly AcademySealedDiagramSpec[] = [
  flow3("ledger-single-balance", ["Cüzdan satırı", "Kuruş tutar", "Tek yazıcı"], D6, ["tutar", "defter"]),
  gate3("price-lock-window", ["Katalog fiyat", "15 dk sabit", "Ödeme"], D7),
  flow3("settlement-exam-gate", ["Ödeme", "Ders kaydı", "Sınav belgesi"], D8, ["erişim", "baraj"]),
  gate3("interlocking-lock", ["Durum A", "Sözleşme", "Durum B"], D6),
  gate3("fail-safe-aspect", ["Eksik şema", "Reddet", "Açık yol yok"], D5),
  flow3("track-circuit", ["React", "API", "Dürüst hata"], D7),
  gate3("brief-gate", ["Brief'i yaz", "Çelişkiyi yakala / dur", "Netleşince üret"], D6),
  gate3("rights-release", ["Hak satırını kontrol et", "Eksikse üretme", "RELEASE ile devret"], D7),
  stack("prompt-packet", ["Ne istiyoruz?", "Ne istemiyoruz?", "Nasıl kabul ederiz?"], D8),
  flow3("revision-cap", ["1. düzeltme", "2. düzeltme", "Yeni iş / emanet"], D5, [
    "ölçülebilir hata",
    "kapsam şişmesi",
  ]),
  flow3("delivery-hash", ["Dosya adını kilitle", "SHA-256 yaz", "DELIVERY özeti"], D6),
  stack("task-contract", ["Hedef", "Kısıt", "Biçim", "Kabul"], D7),
  gate3("context-window", ["Kaynak", "Kimlik yok", "Pencere"], D6),
  gate3("tool-or-stop", ["Araç gerekir", "Araç yok", "Dur"], D5),
  flow3("eval-bar", ["Örnek", "Baraj", "Regresyon"], D8),
  gate3("production-gate", ["Onaylı tarif", "Delta onay", "Belge sınavı"], D7),
  stack("bim-information-model", ["Kapsam", "Süre", "Ölçüt"], D6),
  flow3("iso-19650-flow", ["EIR", "BEP", "Teslim"], D7),
  cycle4("cde-states", ["İş", "Paylaşım", "Yayın", "Arşiv"], D8),
  flow3("bim-delivery", ["Onay", "Fark", "Bitirme"], D5),
  flow3("threat-risk", ["Varlık", "Tehdit", "Risk"], D6),
  cycle4("kvkk-lifecycle", ["Topla", "Sebep", "Süre", "Sil"], D7),
  flow3("iso-27001-control", ["Kontrol", "Kanıt", "Gözden geçir"], D8),
  flow3("incident-record", ["Olay", "Kayıt", "Bildirim"], D5),
  flow3("table-types", ["Tablo", "Tip", "Kaynak"], D6),
  gate3("group-join", ["Grupla", "Payda yazılı", "Birleştir"], D7),
  stack("metric-definition", ["İsim", "Formül", "Payda"], D8),
  gate3("chart-evidence", ["Grafik", "Eksen / birim", "Süs düşer"], D5),
  flow3("reproducible-report", ["Adımlar", "Yeniden koş", "Belge"], D6),
  tripod("esg-tripod", ["Çevre", "Sosyal", "Yönetişim"], D7),
  flow3("materiality", ["Maddilik", "Çerçeve", "Konu listesi"], D8),
  gate3("greenwash-gate", ["Ölçü", "Kanıt yok", "Düşer"], D5),
  flow3("value-stream", ["Değer akışı", "Bitmiş iş", "Yığın değil"], D6),
  tripod("scrum-roles", ["PO", "Geliştirici", "SM"], D7),
  flow3("sprint-dod", ["Sprint", "Increment", "DoD"], D8),
  cycle4("empiricism", ["Şeffaflık", "Inspect", "Adapt", "Pano"], D5),
  stack("env-split", ["Geliştirme", "Önizleme", "Üretim"], D6),
  gate3("infra-as-code", ["Kod", "Sır yok", "Üretim"], D7),
  flow3("ci-sign", ["Derle", "Test", "İmza"], D8),
  flow3("cd-rollback", ["Kapı", "Sürüm", "Rollback"], D5),
  flow3("observe", ["Log", "Metrik", "İz"], D6),
  gate3("task-not-ornament", ["Görev", "Süs iddia", "Düşer"], D7),
  flow3("grid-type", ["Izgara", "Tipo", "Kontrast"], D8),
  stack("design-token", ["Renk", "Boşluk", "Tipo"], D5),
  flow3("accept-measure", ["Görev", "Ölçüt", "Belge"], D6),
  flow3("consent-scope", ["Sorun", "Paydaş", "Ölçü"], D7),
  gate3("strong-auth", ["Ödeme", "Güçlü kimlik", "Log"], D8),
  flow3("consent-revoke", ["İptal", "Kayıt", "Token değil"], D5),
  // Python Temel
  flow3("py-print-hello", ["Kaynak", "print", "Çıktı"], D6, ["çağrı", "ekran"]),
  stack("py-vars-types", ["Etiket", "Tip", "Değer"], D7),
  gate3("py-control-flow", ["Koşul", "if/else", "Dal"], D5),
  flow3("py-loops", ["range", "for", "Toplam"], D6, ["tur", "birikim"]),
  stack("py-functions", ["girdi", "def", "return"], D7),
  flow3("py-interactive", ["input", "doğrula", "sonuç"], D8, ["str→int", "özet"]),
  // Python Orta
  flow3("py-pandas-frame", ["CSV", "DataFrame", "dtypes"], D6, ["oku", "teşhis"]),
  gate3("py-select-filter", ["Seç", "Süz", "Türet"], D7),
  flow3("py-group-merge", ["Grupla", "Payda", "Birleştir"], D8, ["agg", "1:1"]),
  gate3("py-sql-bridge", ["SQL", "parametre", "DataFrame"], D5),
  flow3("py-file-auto", ["glob", "işle", "yaz"], D6, ["pathlib", "atomik"]),
  stack("py-cleanse", ["eksik", "tekrar", "kural"], D7),
  gate3("py-metric-chart", ["Metrik", "Grafik", "Kaynak"], D8),
  flow3("py-pipeline", ["oku", "dönüştür", "yaz"], D5, ["main", "hash"]),
  // Python İleri
  flow3("py-fastapi-route", ["İstek", "rota", "JSON"], D6, ["GET", "200"]),
  stack("py-pydantic-schema", ["JSON", "BaseModel", "422"], D7),
  flow3("py-di-layers", ["Rota", "Servis", "Repo"], D8, ["Depends", "iş"]),
  gate3("py-async-io", ["görevler", "gather", "sonuç"], D5),
  flow3("py-auth-headers", ["Bearer", "doğrula", "korumalı"], D6, ["401", "sır"]),
  gate3("py-error-codes", ["hata", "status", "dürüst gövde"], D7),
  flow3("py-api-test", ["TestClient", "assert", "CI"], D8, ["200", "422"]),
  stack("py-docker-image", ["build", "imaj", "çalıştır"], D5),
  flow3("py-observe-logs", ["request_id", "log", "metrik"], D6, ["ms", "PII yok"]),
  cycle4("py-capstone-api", ["Şema", "Auth", "Test", "Docker"], D7),
  // AI Temel
  flow3("ai-llm-window", ["Metin", "token", "pencere"], D6, ["böl", "tavan"]),
  stack("ai-prompt-layers", ["sistem", "kullanıcı", "biçim"], D7),
  gate3("ai-json-schema", ["JSON mod", "şema", "parse"], D5),
  flow3("ai-few-shot", ["örnek", "görev", "kabul"], D6, ["sabit", "ölçü"]),
  gate3("ai-secret-pii", ["sır/PII", "reddet", "üretim yok"], D7),
  flow3("ai-prompt-lab", ["girdi", "doğrula", "çıktı"], D8, ["şema", "yeniden"]),
  // AI Orta
  flow3("ai-rag-split", ["soru", "retriever", "üretim"], D6, ["ara", "kaynak"]),
  stack("ai-chunk-overlap", ["belge", "chunk", "overlap"], D7),
  flow3("ai-embed-space", ["metin", "vektör", "benzerlik"], D8, ["embed", "skor"]),
  gate3("ai-chroma-store", ["koleksiyon", "add", "query"], D5),
  flow3("ai-retriever-k", ["top-k", "eşik", "kaynak"], D6, ["filtre", "alıntı"]),
  flow3("ai-rag-pipeline", ["yükle", "göm", "üret"], D7, ["böl", "getir"]),
  gate3("ai-grounded-answer", ["kanıt", "uydurma", "dur"], D8),
  cycle4("ai-pdf-assistant", ["PDF", "RAG", "UI", "test"], D5),
  // AI İleri
  flow3("ai-tool-call", ["şema", "çağrı", "sonuç"], D6, ["arg", "gözlem"]),
  cycle4("ai-agent-loop", ["düşün", "araç", "gözlem", "yanıt"], D7),
  stack("ai-state-memory", ["state", "kısa", "uzun"], D8),
  flow3("ai-langgraph", ["düğüm", "kenar", "END"], D5, ["geçiş", "hata"]),
  stack("ai-crew-roles", ["rol", "görev", "teslim"], D6),
  gate3("ai-multi-handshake", ["mesaj", "sözleşme", "yürüt"], D7),
  gate3("ai-human-gate", ["riskli araç", "insan onay", "kayıt"], D8),
  flow3("ai-agent-eval", ["altın küme", "baraj", "regresyon"], D5, ["ölç", "kilit"]),
  flow3("ai-agent-observe", ["trace", "maliyet", "latency"], D6, ["id", "PII yok"]),
  cycle4("ai-multi-capstone", ["şema", "graph", "eval", "iz"], D7),
  // Full-stack Temel
  flow3("fs-http-request-response", ["İstemci", "HTTP istek", "Yanıt+status"], D6, ["fiş", "gövde"]),
  stack("fs-js-vars-functions", ["etiket", "tip", "return"], D7),
  gate3("fs-ts-compile-gate", ["interface", "tsc", "paket"], D5),
  flow3("fs-dom-honest-feedback", ["olay", "durum", "metin"], D6, ["disabled", "dürüst"]),
  gate3("fs-fetch-error-reflect", ["fetch", "!res.ok", "dürüst hata"], D7),
  cycle4("fs-typed-client-lab", ["tip", "DOM", "fetch", "yanıt"], D8),
  // Full-stack Orta
  stack("fs-react-props-contract", ["ebeveyn", "props", "JSX"], D6),
  gate3("fs-usestate-flags-trap", ["bayraklar", "çelişki", "düşür"], D7),
  flow3("fs-usereducer-ssot-phase", ["idle", "submitting", "success|error"], D8, ["SSOT", "reducer"]),
  stack("fs-list-key-controlled-form", ["id key", "value", "onChange"], D5),
  gate3("fs-context-boundary", ["tema OK", "her state değil", "yerel form"], D6),
  flow3("fs-useeffect-race-cleanup", ["effect", "cleanup", "iptal"], D7, ["yarış", "abort"]),
  flow3("fs-routing-page-contract", ["URL", "sayfa", "boş/hata"], D8, ["Link", "params"]),
  cycle4("fs-cart-ssot-capstone", ["phase", "form", "fetch", "dürüst UI"], D5),
  // Full-stack İleri
  flow3("fs-express-middleware-order", ["json", "validate", "handler"], D6, ["next", "err"]),
  gate3("fs-zod-fail-safe-400", ["şema", "safeParse", "400"], D7),
  flow3("fs-postgres-param-query", ["şema", "$1 bağla", "satır"], D8, ["CHECK", "enjeksiyon yok"]),
  stack("fs-repo-sql-no-leak", ["route", "servis", "repo"], D5),
  flow3("fs-rest-crud-resources", ["POST", "GET", "PATCH/DELETE"], D6, ["201", "kaynak"]),
  gate3("fs-jwt-bearer-gate", ["Bearer", "verify", "401/403"], D7),
  stack("fs-honest-http-errors", ["code", "message", "issues"], D8),
  cycle4("fs-tx-consistency", ["BEGIN", "yaz", "COMMIT", "ROLLBACK"], D5),
  flow3("fs-testclient-migration", ["migrate", "TestClient", "CI"], D6, ["400", "201"]),
  cycle4("fs-cart-api-capstone", ["Zod", "JWT", "tx", "test"], D7),
  // DevOps Temel
  flow3("do-cloud-shared-responsibility", ["IaaS", "PaaS", "SaaS"], D6, ["sorumluluk", "sınır"]),
  stack("do-linux-fs-permissions", ["yol", "rwx", "chmod"], D7),
  flow3("do-systemd-process-user", ["user", "process", "systemd"], D6, ["status", "journal"]),
  gate3("do-dns-port-firewall", ["DNS", "port", "deny/allow"], D6),
  gate3("do-ssh-key-bastion", ["keygen", "sshd sıkı", "bastion"], D7),
  cycle4("do-linux-cloud-inventory-lab", ["host", "servis", "port", "katman"], D8),
  // DevOps Orta
  stack("do-container-vs-vm", ["VM çekirdek", "container", "izolasyon"], D6),
  gate3("do-dockerfile-user-secret", ["FROM pin", "USER", "sır yok"], D6),
  flow3("do-compose-services-net", ["app", "db", "network"], D7, ["env_file", "volume"]),
  gate3("do-registry-sign-sbom", ["digest", "imza", "SBOM"], D6),
  flow3("do-ci-fail-closed", ["build", "test", "artifact"], D7, ["kırmızı", "kapı"]),
  flow3("do-cd-rollback-hotfix", ["onay", "deploy", "rollback"], D6, ["iz", "hotfix"]),
  gate3("do-healthcheck-observe", ["probe", "ready", "log maske"], D6),
  cycle4("do-pipeline-capstone", ["build", "scan", "sign", "deploy"], D8),
  // DevOps İleri
  flow3("do-threat-model-assets", ["varlık", "sınır", "kapı"], D6, ["tehdit", "kontrol"]),
  gate3("do-secrets-vault-rotate", ["kasa", "rotate", "iptal"], D6),
  flow3("do-sast-dast-sbom-gate", ["SAST", "DAST", "deps/SBOM"], D7, ["CVE", "fail"]),
  stack("do-iam-least-privilege", ["rol", "kapsam", "MFA"], D6),
  flow3("do-network-segmentation", ["public", "app", "private DB"], D7, ["SG", "deny"]),
  stack("do-iso27001-evidence", ["risk", "SOA", "kanıt"], D6),
  flow3("do-kvkk-inventory-breach", ["envanter", "sebep", "ihlal"], D7, ["maske", "bildirim"]),
  flow3("do-incident-response-runbook", ["tespit", "çevre", "PIR"], D6, ["rollback", "iz"]),
  gate3("do-policy-as-code-iac", ["IaC", "policy", "block merge"], D7),
  cycle4("do-devsecops-architecture-lab", ["model", "kapılar", "kanıt", "IR"], D8),
  // Flutter Temel
  flow3("fl-dart-null-safety", ["tip", "?", "kontrol"], D6, ["null", "derle"]),
  stack("fl-dart-class-collection", ["fonksiyon", "sınıf", "koleksiyon"], D7),
  flow3("fl-widget-element-render", ["Widget", "Element", "Render"], D6, ["tarif", "boya"]),
  gate3("fl-stateless-stateful", ["Stateless", "yerel state", "Stateful"], D7),
  flow3("fl-row-column-constraints", ["constraints", "Row/Column", "Expanded"], D6, ["flex", "overflow"]),
  cycle4("fl-counter-material-lab", ["MaterialApp", "State", "setState", "UI"], D8),
  // Flutter Orta
  flow3("fl-setstate-lifting", ["yerel", "lift", "callback"], D6, ["SSOT", "ata"]),
  stack("fl-inherited-provider", ["Inherited", "Provider", "scope"], D7),
  flow3("fl-riverpod-bloc-ssot", ["event/ref", "state", "UI"], D6, ["phase", "tek kaynak"]),
  gate3("fl-http-dto-errors", ["status", "DTO", "hata sınıfı"], D7),
  flow3("fl-rest-crud-ui", ["loading", "data/empty", "error"], D6, ["CRUD", "dürüst"]),
  gate3("fl-prefs-secure-storage", ["prefs", "sınıf", "secure"], D6),
  flow3("fl-sqlite-drift-migrate", ["şema", "sorgu", "migration"], D7, ["offline", "sürüm"]),
  cycle4("fl-habit-tracker-lab", ["SSOT", "REST", "cache", "UI"], D8),
  // Flutter İleri
  flow3("fl-method-channel", ["Dart", "channel", "native"], D6, ["method", "hata"]),
  stack("fl-plugin-ffi-boundary", ["API", "platform", "semver"], D7),
  gate3("fl-flavor-env-secrets", ["flavor", "define", "secret"], D6),
  flow3("fl-ci-analyze-test-build", ["analyze", "test", "artifact"], D7, ["kırmızı", "kapı"]),
  gate3("fl-android-keystore-aab", ["keystore", "AAB", "Play Signing"], D6),
  flow3("fl-ios-cert-profile-ipa", ["cert", "profil", "IPA"], D7, ["export", "dSYM"]),
  stack("fl-play-console-review", ["listing", "data safety", "track"], D6),
  flow3("fl-app-store-connect", ["metadata", "privacy", "review"], D7, ["TestFlight", "Guideline"]),
  gate3("fl-crashlytics-feature-flag", ["crash", "flag", "alert"], D6),
  cycle4("fl-cicd-store-release-lab", ["CI", "imza", "store", "gözlem"], D8),
  // Veri Bilimi Temel
  flow3("ds-question-contract", ["soru", "sözleşme", "tablo"], D6, ["birim", "FAIL"]),
  flow3("ds-numpy-broadcast", ["ndarray", "broadcast", "vektör"], D6, ["dtype", "axis"]),
  stack("ds-pandas-frame", ["Series", "DataFrame", "loc/iloc"], D7),
  gate3("ds-clean-missing", ["eksik", "tip", "tekrar"], D6),
  flow3("ds-eda-groupby", ["describe", "groupby", "grafik"], D7, ["özet", "dürüst"]),
  cycle4("ds-eda-lab", ["CSV", "temiz", "özet", "rapor"], D8),
  // Veri Bilimi Orta
  flow3("ds-ml-problem", ["özellik", "hedef", "görev"], D6, ["supervised", "ayır"]),
  gate3("ds-split-leakage", ["train", "test", "sızıntı yok"], D6),
  stack("ds-pipeline-scale", ["scale", "ColumnTransformer", "Pipeline"], D7),
  flow3("ds-linear-logistic", ["lineer", "lojistik", "katsayı"], D6, ["fit", "predict"]),
  stack("ds-tree-ensemble", ["ağaç", "orman", "boosting"], D7),
  gate3("ds-metrics-f1-roc", ["precision", "recall", "F1/ROC"], D6),
  flow3("ds-cv-search", ["KFold", "arama", "en iyi"], D7, ["CV", "seç"]),
  cycle4("ds-sklearn-capstone", ["Pipeline", "metrik", "rapor", "mühür"], D8),
  // Veri Bilimi İleri
  flow3("ds-tensor-autograd", ["tensör", "autograd", "grad"], D6, ["cihaz", "geri"]),
  stack("ds-nn-module-loss", ["Module", "kayıp", "optimizer"], D7),
  flow3("ds-dataset-loader", ["Dataset", "batch", "DataLoader"], D6, ["shuffle", "epoch"]),
  flow3("ds-mlp-train-loop", ["ileri", "kayıp", "geri adım"], D7, ["zero_grad", "step"]),
  stack("ds-cnn-conv", ["conv", "pool", "sınıf"], D6),
  flow3("ds-transfer-finetune", ["önceden", "kafa", "fine-tune"], D7, ["freeze", "öğret"]),
  gate3("ds-checkpoint-early", ["ckpt", "early stop", "aşırı uyum"], D6),
  flow3("ds-eval-drift", ["metrik", "kalibrasyon", "drift"], D7, ["eşik", "alarm"]),
  gate3("ds-onnx-serve", ["export", "ONNX", "servis"], D6),
  cycle4("ds-pytorch-deploy-lab", ["eğit", "değerlendir", "paketle", "servis"], D8),
  // Siber Temel
  gate3("sec-ethics-roe-cia", ["izin/RoE", "kapsam", "CIA"], D6),
  stack("sec-tcpip-osi-ports", ["katman", "protokol", "port"], D6),
  flow3("sec-linux-perms-proc", ["kullanıcı", "rwx", "süreç"], D7, ["izin", "sınır"]),
  flow3("sec-osint-passive", ["açık kaynak", "kayıt", "özet"], D6, ["pasif", "yetkili"]),
  gate3("sec-active-enum-lab", ["RoE", "lab hedef", "envanter"], D7),
  cycle4("sec-network-harden-lab", ["harita", "risk", "sertleştir", "doğrula"], D8),
  // Siber Orta
  flow3("sec-pentest-method", ["kapsam", "test", "rapor"], D6, ["bulgu", "öneri"]),
  stack("sec-owasp-top10", ["sınıf", "öncelik", "test gündemi"], D6),
  gate3("sec-sqli-secure", ["tespit", "parametre", "doğrula"], D7),
  flow3("sec-xss-encode", ["bağlam", "encode", "CSP"], D6, ["çıktı", "kapat"]),
  stack("sec-auth-session", ["auth", "oturum", "iptal"], D7),
  gate3("sec-idor-access", ["kimlik", "yetki", "nesne sınırı"], D6),
  flow3("sec-misconfig-tls", ["başlık", "TLS", "kapat"], D7, ["checklist", "risk"]),
  cycle4("sec-web-report-lab", ["RoE", "bulgu", "öneri", "özet"], D8),
  // Siber İleri
  stack("sec-memory-layout", ["stack", "heap", "ABI"], D6),
  flow3("sec-memory-corruption-class", ["sınıf", "tetik", "mitigaasyon"], D7, ["tespit", "yama"]),
  flow3("sec-re-static", ["ikili", "sembol", "akış"], D6, ["statik", "özet"]),
  gate3("sec-re-dynamic-sandbox", ["sandbox", "iz", "gözlem"], D7),
  flow3("sec-lateral-segment", ["segment", "trust", "lateral"], D6, ["sınır", "kavram"]),
  gate3("sec-priv-esc-detect", ["sınıf", "belirti", "tespit"], D7),
  flow3("sec-blue-ioc", ["log", "IOC", "alarm"], D6, ["kural", "iz"]),
  cycle4("sec-purple-scenario", ["senaryo", "kırmızı", "mavi", "ders"], D7),
  gate3("sec-exploit-discipline", ["sınıf", "yama önceliği", "lab"], D6),
  cycle4("sec-sim-capstone-lab", ["RoE", "senaryo", "tespit", "rapor"], D8),
  // Veritabanı Temel
  flow3("db-rel-model-keys", ["tablo", "PK/FK", "bütünlük"], D6, ["ilişki", "kısıt"]),
  stack("db-er-normalize", ["ER", "1NF–3NF", "şema"], D6),
  gate3("db-sql-ddl", ["CREATE", "ALTER", "CHECK"], D7),
  flow3("db-sql-dml-join", ["SELECT", "JOIN", "GROUP BY"], D6, ["filtre", "özet"]),
  stack("db-acid-tx", ["BEGIN", "COMMIT", "ROLLBACK"], D7),
  cycle4("db-ecommerce-schema-lab", ["ER", "DDL", "sorgu", "mühür"], D8),
  // Veritabanı Orta
  flow3("db-pg-explain", ["mimari", "buffer", "EXPLAIN"], D6, ["plan", "okuma"]),
  gate3("db-btree-selectivity", ["B-tree", "seçicilik", "maliyet"], D6),
  stack("db-partial-expr-idx", ["partial", "expression", "covering"], D7),
  flow3("db-planner-joins", ["istatistik", "join", "plan"], D6, ["hash", "nested"]),
  stack("db-vacuum-bloat", ["VACUUM", "ANALYZE", "bloat"], D7),
  gate3("db-pool-prepared", ["pool", "prepared", "parametre"], D6),
  flow3("db-mvcc-locks", ["MVCC", "kilit", "deadlock"], D7, ["izole", "timeout"]),
  cycle4("db-slow-query-lab", ["EXPLAIN", "index", "yeniden ölç", "rapor"], D8),
  // Veritabanı İleri
  flow3("db-polyglot-cap", ["SQL", "NoSQL", "CAP"], D6, ["ödünleşim", "seç"]),
  stack("db-redis-cache", ["SET/GET", "TTL", "invalidation"], D7),
  gate3("db-redis-streams", ["stream", "pub/sub", "tüketici"], D6),
  flow3("db-mongo-agg", ["belge", "index", "aggregate"], D7, ["pipeline", "özet"]),
  stack("db-mongo-model", ["gömme", "referans", "tutarlılık"], D6),
  flow3("db-kafka-partition", ["topic", "partition", "consumer"], D7, ["offset", "grup"]),
  gate3("db-outbox-events", ["TX", "outbox", "yayın"], D6),
  flow3("db-stream-idempotent", ["olay", "işle", "idempotent"], D7, ["tekrar", "güven"]),
  stack("db-lag-observe", ["lag", "offset", "alarm"], D6),
  cycle4("db-event-pipe-lab", ["üretici", "Kafka", "tüket", "store"], D8),
  // Yazılım Mimarisi Temel
  flow3("arch-oop-pillars", ["kapsül", "kalıtım", "çok biçim"], D6, ["soyut", "sözleşme"]),
  gate3("arch-solid-srp-ocp", ["SRP", "OCP", "ayır"], D6),
  stack("arch-solid-lsp-isp", ["LSP", "ISP", "ince arayüz"], D7),
  flow3("arch-solid-dip", ["port", "inject", "adapter"], D6, ["DI", "kök"]),
  gate3("arch-clean-code-smells", ["isim", "küçük fn", "koku"], D7),
  cycle4("arch-solid-refactor-lab", ["God", "ayır", "DI", "mühür"], D8),
  // Yazılım Mimarisi Orta
  flow3("arch-pattern-map", ["sorun", "kalıp", "aşırı yok"], D6, ["ne zaman", "seç"]),
  stack("arch-creational-factory", ["Factory", "Abstract", "Builder"], D6),
  gate3("arch-singleton-di", ["Singleton", "locator", "DI"], D7),
  flow3("arch-structural-adapter", ["Adapter", "Facade", "Decorator"], D6, ["sar", "uyum"]),
  stack("arch-behavioral-strategy", ["Strategy", "Observer", "Command"], D7),
  gate3("arch-behavioral-state", ["State", "Template", "Chain"], D6),
  flow3("arch-hexagonal-ports", ["domain", "port", "adapter"], D7, ["katman", "sınır"]),
  cycle4("arch-pattern-refactor-lab", ["sepet", "kalıp", "refactor", "mühür"], D8),
  // Yazılım Mimarisi İleri
  flow3("arch-mono-vs-micro", ["monolith", "böl", "mikro"], D6, ["maliyet", "sınır"]),
  stack("arch-ddd-bounded-context", ["ubiquitous", "bounded", "context"], D6),
  gate3("arch-aggregate-vo", ["aggregate", "entity", "VO"], D7),
  flow3("arch-domain-events", ["olay", "yayın", "tutarlılık"], D6, ["eventual", "sınır"]),
  stack("arch-cqrs-split", ["command", "query", "model"], D7),
  gate3("arch-outbox-idempotent", ["outbox", "idempotent", "ES uyarı"], D6),
  flow3("arch-saga-orch", ["saga", "orch", "choreo"], D7, ["adım", "telafi"]),
  stack("arch-resilience-cb", ["retry", "CB", "bulkhead"], D6),
  gate3("arch-contract-observe", ["sözleşme", "versiyon", "gözlem"], D7),
  cycle4("arch-event-micro-lab", ["olay", "servis", "saga", "mühür"], D8),
  // Ürün Yönetimi Temel
  flow3("pm-roles-map", ["PM", "PO", "BA"], D6, ["karar", "sınır"]),
  gate3("pm-problem-statement", ["keşif", "problem", "ifade"], D6),
  stack("pm-req-gathering", ["görüşme", "gereksinim", "netlik"], D7),
  flow3("pm-user-story", ["as a", "I want", "so that"], D6, ["hikâye", "değer"]),
  gate3("pm-ac-invest", ["AC", "INVEST", "öncelik"], D7),
  cycle4("pm-story-backlog-lab", ["brief", "story", "AC", "mühür"], D8),
  // Ürün Yönetimi Orta
  flow3("pm-agile-manifesto", ["değer", "ilke", "çerçeve"], D6, ["seç", "uyum"]),
  stack("pm-scrum-roles", ["PO", "SM", "Dev"], D6),
  gate3("pm-sprint-rhythm", ["plan", "daily", "review/retro"], D7),
  flow3("pm-dor-dod", ["Ready", "Done", "kapı"], D6, ["kabul", "bitiş"]),
  stack("pm-kanban-flow", ["WIP", "akış", "cycle"], D7),
  gate3("pm-jira-hierarchy", ["Epic", "Story", "Task"], D6),
  flow3("pm-jira-board", ["filtre", "board", "burndown"], D7, ["dürüst", "ölç"]),
  cycle4("pm-sprint-jira-lab", ["sprint", "WIP", "JIRA", "mühür"], D8),
  // Ürün Yönetimi İleri
  flow3("pm-analytics-funnel", ["funnel", "retention", "olay"], D6, ["ölç", "okuma"]),
  stack("pm-metric-actionable", ["vanity", "actionable", "karar"], D6),
  gate3("pm-okr-write", ["Objective", "KR", "ölçüt"], D7),
  flow3("pm-kpi-north-star", ["KPI", "North Star", "ağaç"], D6, ["hizala", "odak"]),
  stack("pm-hypothesis-design", ["hipotez", "deney", "ölçüm"], D7),
  gate3("pm-ab-testing", ["A/B", "örneklem", "anlam"], D6),
  flow3("pm-guardrail-kill", ["guardrail", "kill", "fail-closed"], D7, ["kapı", "dur"]),
  stack("pm-cohort-dashboard", ["cohort", "funnel", "panel"], D6),
  gate3("pm-decision-log", ["karar", "kanıt", "kayıt"], D7),
  cycle4("pm-okr-ab-lab", ["OKR", "A/B", "kill", "mühür"], D8),
  // UX Temel
  flow3("ux-vs-ui", ["deneyim", "arayüz", "sınır"], D6, ["UX", "UI"]),
  gate3("ux-research", ["soru", "görüşme", "bulgu"], D6),
  stack("ux-persona-journey", ["persona", "yol", "acı"], D7),
  flow3("ux-information-architecture", ["etiket", "grup", "nav"], D6, ["IA", "düzen"]),
  gate3("ux-wireframe", ["iskelet", "akış", "öncelik"], D7),
  stack("ux-figma-basics", ["frame", "layer", "bileşen"], D6),
  cycle4("ux-wireframe-figma-lab", ["araştırma", "IA", "wire", "mühür"], D8),
  // UX Orta
  flow3("ux-visual-hierarchy", ["boyut", "ağırlık", "odak"], D6, ["sıra", "vurgu"]),
  stack("ux-type-color", ["tipo", "palet", "kontrast"], D6),
  gate3("ux-components", ["atom", "bileşen", "ekran"], D7),
  flow3("ux-design-tokens", ["token", "tema", "tutarlılık"], D6, ["renk", "boşluk"]),
  stack("ux-variants", ["property", "variant", "durum"], D7),
  gate3("ux-prototype", ["akış", "etkileşim", "test"], D6),
  flow3("ux-wcag", ["kontrast", "odak", "etiket"], D7, ["a11y", "kapı"]),
  cycle4("ux-ds-lab", ["token", "bileşen", "prototip", "mühür"], D8),
  // UX İleri
  flow3("ux-handoff", ["ölçü", "özellik", "not"], D6, ["dev", "paket"]),
  stack("ux-css-vars", ["token", "--var", "tema"], D6),
  gate3("ux-react-contract", ["props", "durum", "API"], D7),
  flow3("ux-tailwind", ["token", "utility", "sınıf"], D6, ["eşle", "tema"]),
  stack("ux-responsive", ["breakpoint", "düzen", "içerik"], D7),
  gate3("ux-a11y-code", ["semantik", "ARIA", "klavye"], D6),
  flow3("ux-usability-plan", ["görev", "senaryo", "ölçüt"], D7, ["plan", "test"]),
  stack("ux-metrics-sus", ["süre", "hata", "SUS"], D6),
  gate3("ux-design-qa", ["Figma", "kod", "fark"], D7),
  cycle4("ux-handoff-a11y-lab", ["handoff", "kod", "test", "mühür"], D8),
  // Web3 Temel
  flow3("w3-blockchain-ledger", ["blok", "hash", "zincir"], D6, ["defter", "bağ"]),
  flow3("w3-crypto-hash-sign", ["hash", "imza", "Merkle"], D7, ["özet", "doğrula"]),
  gate3("w3-wallet-gas-evm", ["EOA", "gas", "EVM"], D6),
  stack("w3-solidity-skeleton", ["pragma", "contract", "constructor"], D7),
  flow3("w3-types-storage", ["storage", "memory", "mapping"], D6, ["tip", "konum"]),
  gate3("w3-visibility-events", ["visibility", "event", "require"], D7),
  cycle4("w3-simplestorage-lab", ["set", "get", "event", "mühür"], D8),
  // Web3 Orta
  flow3("w3-inheritance-modifier", ["is", "modifier", "library"], D6, ["kalıtım", "guard"]),
  gate3("w3-erc20", ["transfer", "approve", "event"], D7),
  flow3("w3-erc721", ["mint", "ownerOf", "safeTransfer"], D6, ["tokenId", "URI"]),
  stack("w3-security-model", ["tehdit", "sınır", "CEI"], D7),
  gate3("w3-reentrancy-cei", ["checks", "effects", "interact"], D6),
  flow3("w3-access-oracle", ["AccessControl", "overflow", "oracle"], D7, ["rol", "fiyat"]),
  gate3("w3-test-discipline", ["unit", "fuzz", "CI"], D6),
  cycle4("w3-secure-erc20-lab", ["token", "CEI", "test", "mühür"], D8),
  // Web3 İleri
  flow3("w3-dapp-architecture", ["UI", "ABI", "sözleşme"], D6, ["dApp", "sınır"]),
  stack("w3-ethers-provider", ["Provider", "Signer", "Contract"], D7),
  gate3("w3-web3js-abi", ["ABI", "encode", "decode"], D6),
  flow3("w3-event-indexing", ["log", "filtre", "onay"], D7, ["event", "indeks"]),
  gate3("w3-wallet-connect", ["connect", "chain", "approve"], D6),
  flow3("w3-amm-xyk", ["x*y=k", "swap", "minOut"], D7, ["LP", "slipaj"]),
  stack("w3-lending-ltv", ["teminat", "borç", "likidasyon"], D6),
  gate3("w3-oracle-feed", ["fiyat", "heartbeat", "stale"], D7),
  flow3("w3-failclosed-ux", ["pending", "confirm", "revert"], D6, ["durum", "dürüst"]),
  cycle4("w3-dapp-defi-lab", ["ethers", "event", "guard", "mühür"], D8),
  // Excel / Power BI / Sheets Temel
  flow3("ex-excel-workbook", ["ham", "hesap", "sunum"], D6, ["SSOT", "ayır"]),
  flow3("ex-excel-formulas", ["SUM", "IF", "göreli"], D7, ["formül", "kopya"]),
  gate3("ex-absolute-table", ["sabit", "$ kilit", "Tablo"], D6),
  stack("ex-pivot-table", ["boyut", "ölçü", "dilimleyici"], D7),
  gate3("ex-honest-chart", ["tür", "eksen", "birim"], D6),
  cycle4("ex-cleanse-lab", ["temizle", "Pivot", "grafik", "mühür"], D8),
  // Power BI Orta
  flow3("ex-power-query", ["al", "adım", "birleştir"], D6, ["Query", "tip"]),
  stack("ex-star-schema", ["fact", "dimension", "grain"], D7),
  flow3("ex-dax-measure", ["SUM", "CALCULATE", "bağlam"], D6, ["measure", "filtre"]),
  gate3("ex-pbi-visuals", ["kart", "matris", "etkileşim"], D7),
  flow3("ex-model-relationships", ["1:*", "anahtar", "filtre"], D6, ["ilişki", "yön"]),
  gate3("ex-rls-roles", ["rol", "filtre", "View as"], D7),
  flow3("ex-publish-refresh", ["publish", "app", "schedule"], D6, ["workspace", "yenile"]),
  cycle4("ex-dashboard-lab", ["Query", "DAX", "RLS", "mühür"], D8),
  // Sheets / Apps Script İleri
  flow3("ex-sheets-arrayformula", ["dizi", "dolum", "sürükleme yok"], D6, ["ARRAY", "satır"]),
  gate3("ex-sheets-query", ["select", "where", "group"], D7),
  stack("ex-validation-protect", ["liste", "kilitle", "named"], D6),
  flow3("ex-apps-script-menu", ["function", "Logger", "onOpen"], D7, ["script", "menü"]),
  gate3("ex-script-triggers", ["time", "olay", "tek sahip"], D6),
  flow3("ex-urlfetch-api", ["istek", "status", "JSON"], D7, ["fetch", "kapı"]),
  stack("ex-automation-flow", ["girdi", "işle", "yaz", "log"], D6),
  gate3("ex-failclosed-secrets", ["Properties", "rotasyon", "kırp"], D7),
  flow3("ex-error-retry-log", ["try", "retry", "log"], D6, ["hata", "iz"]),
  cycle4("ex-sheets-script-lab", ["QUERY", "script", "sır", "mühür"], D8),
  // İçerik & E-Ticaret Temel
  flow3("mnt-niche-position", ["izleyici", "sorun", "vaat"], D6, ["niş", "konum"]),
  flow3("mnt-script-skeleton", ["hook", "gövde", "CTA"], D7, ["senaryo", "eylem"]),
  gate3("mnt-thumb-ctr", ["kapak", "tık", "dürüstlük"], D6),
  stack("mnt-yt-seo", ["başlık", "açıklama", "etiket"], D7),
  flow3("mnt-analytics-avd", ["CTR", "AVD", "retention"], D6, ["ölç", "oku"]),
  cycle4("mnt-channel-growth-lab", ["niche", "paket", "metrik", "mühür"], D8),
  // İçerik & E-Ticaret Orta
  flow3("mnt-edit-timeline", ["ingest", "ad", "timeline"], D6, ["düzen", "akış"]),
  stack("mnt-cut-broll", ["kesim", "tempo", "B-roll"], D7),
  gate3("mnt-audio-caption", ["diyalog", "lisans", "caption"], D6),
  flow3("mnt-shorts-cadence", ["9:16", "fikir", "ritim"], D7, ["kısa", "cadence"]),
  gate3("mnt-hook-3s", ["0–3 sn", "vaat", "tut"], D6),
  stack("mnt-export-spec", ["renk", "codec", "platform"], D7),
  flow3("mnt-publish-batch", ["takvim", "batch", "DoD"], D6, ["plan", "üret"]),
  cycle4("mnt-shorts-lab", ["hook", "edit", "spec", "mühür"], D8),
  // İçerik & E-Ticaret İleri
  flow3("mnt-product-research", ["sinyal", "doğrula", "marj"], D6, ["talep", "test"]),
  gate3("mnt-supplier-listing", ["numune", "SLA", "listing"], D7),
  flow3("mnt-pdp-copy", ["fayda", "spek", "CTA"], D6, ["PDP", "kopya"]),
  stack("mnt-ads-attribution", ["trafik", "UTM", "event"], D7),
  gate3("mnt-funnel-checkout", ["PDP", "sepet", "ödeme"], D6),
  flow3("mnt-fulfillment-cs", ["SLA", "takip", "destek"], D7, ["kargo", "CS"]),
  stack("mnt-unit-economics", ["COGS", "CAC", "marj"], D6),
  gate3("mnt-legal-tax", ["belge", "iade", "iddaa"], D7),
  flow3("mnt-income-honesty", ["vaat", "kanıt", "kapı"], D6, ["dürüst", "fail-closed"]),
  cycle4("mnt-ecom-capstone", ["doğrula", "SLA", "marj", "mühür"], D8),
  // Kişisel Gelişim Temel (PD-101)
  gate3("pd-ethics-consent", ["rıza", "şeffaflık", "fail-closed"], D6),
  flow3("pd-message-skeleton", ["amaç", "kanıt", "çağrı"], D6, ["iskelet", "net"]),
  stack("pd-audience-map", ["rol", "bilgi", "ortak dil"], D7),
  flow3("pd-presence-stage", ["ses", "tempo", "beden"], D6, ["varlık", "oku"]),
  gate3("pd-objection-clarity", ["özet", "ayır", "seçim"], D7),
  cycle4("pd-persuasion-lab", ["etik", "iskelet", "sunum", "mühür"], D8),
  // Kişisel Gelişim Orta (PD-102)
  flow3("pd-eq-self-aware", ["tetik", "duygu", "adlandır"], D6, ["EQ", "fark"]),
  gate3("pd-empathy-perspective", ["yansıt", "sor", "sınır"], D6),
  stack("pd-feedback-sbi", ["durum", "davranış", "etki"], D7),
  flow3("pd-hard-talk-prep", ["amaç", "kanıt", "çıkış"], D6, ["hazırlık", "sınır"]),
  gate3("pd-conflict-interest", ["pozisyon", "çıkar", "seçenek"], D7),
  flow3("pd-lead-direction-safety", ["yön", "güvenlik", "kredi"], D6, ["lider", "iklim"]),
  stack("pd-team-climate", ["sinyal", "nabız", "ses eşitliği"], D7),
  cycle4("pd-feedback-conflict-lab", ["SBI", "hazırlık", "çıkar", "mühür"], D8),
  // Kişisel Gelişim İleri (PD-103)
  gate3("pd-nlp-ethics-frame", ["araç", "rıza", "sınır"], D6),
  flow3("pd-reframe-ethics", ["olay", "alternatif", "test"], D7, ["reframe", "etik"]),
  stack("pd-language-clarify", ["silme", "soru", "örnek"], D6),
  gate3("pd-state-resourceful", ["nefes", "durak", "niyet"], D7),
  flow3("pd-timebox-focus", ["başla", "kutu", "zil"], D6, ["odak", "sınır"]),
  stack("pd-eisenhower-matrix", ["Q1", "Q2", "Q3/Q4"], D7),
  gate3("pd-habit-loop", ["tetik", "rutin", "ödül"], D6),
  flow3("pd-deep-work-budget", ["blok", "bütçe", "kesinti"], D7, ["dikkat", "kapı"]),
  stack("pd-comms-time-os", ["ritim", "SSOT", "gözden geçir"], D6),
  cycle4("pd-personal-os-lab", ["etik", "zaman", "alışkanlık", "mühür"], D8),
  // Bulut Mimarisi Temel (CLD-101)
  flow3("cld-account-bill", ["hesap", "fatura", "kök"], D6, ["sözleşme", "şalter"]),
  gate3("cld-iam-safe", ["kullanıcı", "rol", "politika"], D6),
  flow3("cld-vpc-fence", ["parsel", "çit", "kapı"], D7, ["arsa", "red"]),
  stack("cld-ec2-garage", ["imaj", "örnek", "durdur"], D6),
  gate3("cld-s3-depot", ["kova", "kilit", "günlük"], D7),
  cycle4("cld-billing-lab", ["etiket", "bütçe", "alarm", "mühür"], D8),
  // Bulut Mimarisi Orta (CLD-102)
  flow3("cld-alb-toll", ["gişe", "şerit", "kabin"], D6, ["polis", "sağlık"]),
  gate3("cld-target-health", ["lamba", "eşik", "sök"], D6),
  stack("cld-asg-fleet", ["min", "istenen", "max"], D7),
  flow3("cld-scale-policy", ["kuyruk", "soğuma", "garaj"], D6, ["politika", "gece"]),
  gate3("cld-rds-vault", ["motor", "çit", "sır"], D7),
  flow3("cld-rds-replica", ["yedek", "şube", "tatbikat"], D6, ["kasa", "ikinci"]),
  stack("cld-lambda-kitchen", ["zil", "ışık", "tavan"], D6),
  cycle4("cld-mid-lab", ["gişe", "filo", "mahzen", "mutfak"], D8),
  // Bulut Mimarisi İleri (CLD-103)
  flow3("cld-k8s-harbor", ["kule", "rıhtım", "kutu"], D6, ["şef", "liman"]),
  gate3("cld-k8s-workload", ["pod", "servis", "dağıtım"], D6),
  stack("cld-k8s-limits", ["istek", "tavan", "sonda"], D7),
  flow3("cld-tf-blueprint", ["plan", "uygula", "imza"], D6, ["proje", "şablon"]),
  gate3("cld-tf-state", ["defter", "kilit", "sapma"], D7),
  stack("cld-tf-modules", ["modül", "ortam", "pin"], D6),
  flow3("cld-gitops-belt", ["git", "çek", "hizala"], D7, ["bant", "defter"]),
  gate3("cld-gitops-redbox", ["pin", "kırmızı", "dur"], D6),
  stack("cld-obs-secrets", ["ölçü", "kule", "kasa"], D7),
  cycle4("cld-adv-lab", ["orkestra", "proje", "bant", "mühür"], D8),
  // Veri Mühendisliği Temel (ENG-101)
  flow3("eng-pipeline-truck", ["kaynak", "hat", "kapı"], D6, ["kamyon", "fiş"]),
  gate3("eng-etl-elt-plant", ["kamyon", "tesis", "ambar"], D6),
  flow3("eng-lake-warehouse", ["göl", "un", "pazar"], D7, ["ham", "paket"]),
  stack("eng-dim-template", ["olgu", "boyut", "tane"], D6),
  gate3("eng-dbt-stamp", ["kaynak", "test", "damga"], D7),
  cycle4("eng-mart-lab", ["ham", "şablon", "damga", "payda"], D8),
  // Veri Mühendisliği Orta (ENG-102)
  flow3("eng-airflow-switch", ["kule", "vagon", "sefer"], D6, ["makas", "fiş"]),
  gate3("eng-dag-graph", ["ok", "düğüm", "döngü yok"], D6),
  stack("eng-scheduler-clock", ["aralık", "yakalama", "tavan"], D7),
  flow3("eng-task-wagon", ["üst", "alt", "süre"], D6, ["sıra", "bin"]),
  gate3("eng-sensor-lamp", ["bekle", "tavan", "kırmızı"], D7),
  stack("eng-qc-lab", ["numune", "kural", "damga"], D6),
  gate3("eng-sla-valve", ["kırmızı", "vana", "pencere"], D7),
  cycle4("eng-orta-lab", ["kule", "saat", "lab", "vana"], D8),
  // Veri Mühendisliği İleri (ENG-103)
  stack("eng-medallion-plant", ["Bronz", "Gümüş", "Altın"], D6),
  flow3("eng-bronze-bunker", ["kamyon", "bunker", "irsaliye"], D6, ["ham", "iz"]),
  gate3("eng-silver-wash", ["elek", "tartı", "test"], D7),
  flow3("eng-gold-ingot", ["payda", "tane", "vitrin"], D6, ["külçe", "sözleşme"]),
  gate3("eng-two-plants", ["kampüs", "kasa", "kapanış"], D7),
  flow3("eng-spark-rail", ["kule", "vagon", "kompartıman"], D6, ["hat", "sefer"]),
  gate3("eng-batch-stream", ["parti", "akış", "filigran"], D7),
  stack("eng-shuffle-switch", ["karışım", "çarpıklık", "tavan"], D6),
  stack("eng-cold-store", ["sıcak", "ılık", "soğuk"], D7),
  cycle4("eng-ileri-lab", ["madalya", "hat", "depo", "mühür"], D8),
  // Kalite Mühendisliği Temel (QA-101)
  flow3("qa-stamp-gate", ["senaryo", "kanıt", "damga"], D6, ["beklenen", "mühür"]),
  stack("qa-scale-pyramid", ["birim", "bütünleştirme", "tepe"], D6),
  gate3("qa-recipe-check", ["malzeme", "kazan", "sürüm"], D7),
  flow3("qa-notary-act", ["senaryo", "kanıt", "imza"], D6, ["adım", "noter"]),
  gate3("qa-defect-log", ["adım", "beklenen", "kanıt"], D7),
  cycle4("qa-temel-lab", ["damga", "terazi", "reçete", "tutanak"], D8),
  // Kalite Mühendisliği Orta (QA-102)
  flow3("qa-robot-arm", ["yol", "beklenen", "kayıt"], D6, ["kol", "iz"]),
  gate3("qa-browser-plant", ["bağlam", "kabin", "iz"], D6),
  stack("qa-grip-wait", ["rol", "görünür", "tıkla"], D7),
  gate3("qa-flaky-ban", ["zar", "karantina", "kök"], D6),
  flow3("qa-ci-barrier", ["paket", "test", "dur"], D7, ["kırmızı", "şerit"]),
  gate3("qa-cd-gate", ["yeşil", "kapı", "geri alma"], D6),
  stack("qa-vitrine-check", ["taban", "eşik", "klavye"], D7),
  cycle4("qa-orta-lab", ["kol", "yasak", "bariyer", "kapı"], D8),
  // Kalite Mühendisliği İleri (QA-103)
  flow3("qa-contract-protocol", ["tüketen", "fiş", "sağlayan"], D6, ["protokol", "sürüm"]),
  gate3("qa-consumer-slip", ["beklenen", "sahte", "kırmızı"], D6),
  flow3("qa-provider-waybill", ["vaat", "sürüm", "pencere"], D7, ["irsaliye", "silme yok"]),
  stack("qa-p95-budget", ["kuyruk", "bütçe", "payda"], D6),
  gate3("qa-k6-dam", ["senaryo", "eşik", "rapor"], D7),
  flow3("qa-load-stress", ["yük", "stres", "tavan"], D6, ["tür", "basınç"]),
  stack("qa-spike-flood", ["uzun su", "sel", "sızıntı"], D7),
  gate3("qa-budget-alarm", ["eşik", "sahip", "dur"], D6),
  flow3("qa-gate-orchestra", ["fiş", "basınç", "sevk"], D7, ["iki kilit", "gişe"]),
  cycle4("qa-ileri-lab", ["protokol", "baraj", "bütçe", "mühür"], D8),
  // Kurumsal Java Temel (JAV-101)
  flow3("jav-jvm-engine", ["yığın", "hol", "tavan"], D6, ["motor", "oda"]),
  stack("jav-oop-mold", ["kalıp", "vida", "parça"], D6),
  gate3("jav-build-machine", ["tarif", "kilit", "çıktı"], D7),
  flow3("jav-junit-stamp", ["girdi", "beklenen", "damga"], D6, ["yeşil", "koli"]),
  gate3("jav-pack-waybill", ["ad", "sürüm", "kilit"], D7),
  cycle4("jav-temel-lab", ["motor", "kalıp", "makine", "damga"], D8),
  // Kurumsal Java Orta (JAV-102)
  flow3("jav-boot-desk", ["iskelet", "profil", "kapı"], D6, ["lobi", "kart"]),
  gate3("jav-inject-card", ["tezgâh", "kart", "döngü yok"], D6),
  stack("jav-rest-counter", ["kaynak", "yöntem", "kod"], D7),
  gate3("jav-schema-400", ["şema", "dört yüz", "red"], D6),
  flow3("jav-sec-gate", ["kimlik", "yetki", "turnike"], D7, ["401", "403"]),
  gate3("jav-jpa-shelf", ["varlık", "işlem", "getiri"], D6),
  stack("jav-dto-label", ["etiket", "gişe", "gizli"], D7),
  cycle4("jav-orta-lab", ["kapı", "resepsiyon", "yasak", "mühür"], D8),
  // Kurumsal Java İleri (JAV-103)
  flow3("jav-tx-seal", ["yazı", "mühür", "geri alma"], D6, ["kasa", "kapak"]),
  gate3("jav-outbox-room", ["kasa", "fiş", "kurye"], D6),
  flow3("jav-dual-ban", ["defter", "kurye", "tek gerçek"], D7, ["yasak", "iki noter"]),
  stack("jav-queue-vault", ["bant", "işçi", "ölü raf"], D6),
  gate3("jav-secret-key", ["kasa", "dönüş", "günlük yok"], D7),
  flow3("jav-watch-tower", ["eşik", "sahip", "eylem"], D6, ["lamba", "nöbet"]),
  stack("jav-idem-slip", ["kimlik", "tavan", "sel yok"], D7),
  gate3("jav-ci-gate", ["test", "damga", "geri alma"], D6),
  flow3("jav-orch-desk", ["oda", "kasa", "kule"], D7, ["üç kilit", "gişe"]),
  cycle4("jav-ileri-lab", ["oda", "kasa", "kule", "mühür"], D8),
  // Çapraz Mobil Temel (RN-101)
  flow3("rn-passport-gate", ["gövde", "iki kabuk", "damga"], D6, ["pasaport", "gişe"]),
  stack("rn-ts-label", ["yazı", "sayı", "boş işaret"], D6),
  gate3("rn-component-hanger", ["bileşen", "özellik", "tek yön"], D7),
  flow3("rn-flex-vitrine", ["sıra", "boşluk", "taşma yok"], D6, ["vitrin", "cam"]),
  stack("rn-scroll-belt", ["liste", "anahtar", "pencere"], D7),
  cycle4("rn-temel-lab", ["pasaport", "vitrin", "bant", "mühür"], D8),
  // Çapraz Mobil Orta (RN-102)
  flow3("rn-nav-corridor", ["yığın", "geri", "üst vitrin"], D6, ["koridor", "kapı"]),
  gate3("rn-single-truth", ["yükleniyor", "veri", "hata"], D6),
  stack("rn-rest-slip", ["adres", "barkod", "teslim"], D7),
  flow3("rn-offline-vault", ["fiş", "kasa", "kurye yok"], D6, ["emanet", "önbellek"]),
  gate3("rn-fake-green-ban", ["anten yok", "kırmızı", "kuyruk"], D7),
  stack("rn-encrypted-store", ["jeton", "kasa", "düz metin yok"], D6),
  flow3("rn-drawer-key", ["tema", "jeton", "ayrı kutu"], D7, ["çekmece", "anahtar"]),
  cycle4("rn-orta-lab", ["emanet", "yasak", "kasa", "mühür"], D8),
  // Çapraz Mobil İleri (RN-103)
  flow3("rn-native-bridge", ["ad", "argüman", "hata kodu"], D6, ["tercüman", "sözlük"]),
  gate3("rn-turbo-jsi", ["turbo", "arayüz", "kopya yok"], D6),
  flow3("rn-fabric-paint", ["kumaş", "eşzamanlı", "titreme yok"], D7, ["cam", "boya"]),
  stack("rn-frame-budget", ["milisaniye", "profil", "jank yok"], D6),
  gate3("rn-ota-border", ["koli", "gümrük", "kabuk yerinde"], D7),
  flow3("rn-ci-delivery", ["test", "damga", "kırmızı dur"], D6, ["kapı", "hat"]),
  stack("rn-store-counter", ["paket", "imza", "izin"], D7),
  gate3("rn-reject-protocol", ["madde", "çanta", "düzeltme"], D6),
  flow3("rn-blackbox-kill", ["kayıt", "eşik", "kapatma"], D7, ["kutu", "nöbet"]),
  cycle4("rn-ileri-lab", ["tercüman", "gişe", "tutanak", "mühür"], D8),
  // Unity ile Oyun Geliştirme Temel (GAM-101)
  flow3("gam-stage-editor", ["hiyerarşi", "denetçi", "tahta"], D6, ["sahne", "perde"]),
  stack("gam-puppet-loop", ["uyanış", "kare", "fizik"], D6),
  gate3("gam-actor-transform", ["nesne", "duruş", "ebeveyn"], D7),
  flow3("gam-physics-strings", ["cisim", "gövde", "katman"], D6, ["yerçekimi", "ip"]),
  stack("gam-input-camera", ["harita", "eylem", "kamera"], D7),
  cycle4("gam-temel-lab", ["sahne", "ip", "gövde", "mühür"], D8),
  // Unity ile Oyun Geliştirme Orta (GAM-102)
  flow3("gam-ui-canvas", ["tuval", "ölçek", "olay"], D6, ["afiş", "perde"]),
  gate3("gam-input-cable", ["eylem", "cihaz", "bağlama"], D6),
  stack("gam-audio-pit", ["klip", "karışım", "tavan"], D7),
  flow3("gam-2d3d-skel", ["iki boyut", "üç boyut", "hedef"], D6, ["iskelet", "kalıp"]),
  gate3("gam-iap-token", ["kimlik", "fiş", "hak"], D7),
  stack("gam-build-line", ["hedef", "damga", "imza"], D6),
  flow3("gam-store-label", ["izin", "gizlilik", "not"], D7, ["etiket", "kutu"]),
  cycle4("gam-orta-lab", ["otomat", "hat", "kutu", "mühür"], D8),
  // Unity ile Oyun Geliştirme İleri (GAM-103)
  flow3("gam-addressable-set", ["adres", "etiket", "yükleme"], D6, ["dekor", "perde"]),
  gate3("gam-catalog-tag", ["etiket", "bağımlılık", "sürüm"], D6),
  flow3("gam-remote-truck", ["indirme", "imza", "geri alma"], D7, ["kamyon", "koli"]),
  stack("gam-liveops-watch", ["olay", "eşik", "sahip"], D6),
  gate3("gam-remote-note", ["bayrak", "tavan", "geri alma"], D7),
  flow3("gam-ethics-box", ["fiyat", "içerik", "tavan"], D6, ["gişe", "bilet"]),
  stack("gam-iap-promise", ["vaat", "içerik", "iade"], D7),
  gate3("gam-gambling-ban", ["madde", "kanıt", "düzeltme"], D6),
  flow3("gam-safety-rope", ["iz", "eşik", "kapatma"], D7, ["ip", "nöbet"]),
  cycle4("gam-ileri-lab", ["dekor", "gişe", "tutanak", "mühür"], D8),
  // Yapay Zekâ Model Operasyonları Temel (MLO-101)
  flow3("mlo-batch-ledger", ["un", "derece", "süre"], D6, ["defter", "parti"]),
  stack("mlo-mlflow-run", ["koşu", "parametre", "metrik"], D6),
  gate3("mlo-dvc-recipe", ["çuval", "tarih", "özet"], D7),
  flow3("mlo-registry-stamp", ["aday", "damga", "irsaliye"], D6, ["sicil", "sevk"]),
  stack("mlo-milk-drift", ["süt", "eşik", "yoğurt"], D7),
  cycle4("mlo-temel-lab", ["defter", "reçete", "damga", "mühür"], D8),
  // Sistem Tasarımı Temel (SYS-101)
  flow3("sys-scale-ledger", ["istek", "gecikme", "bellek"], D6, ["defter", "yük"]),
  stack("sys-traffic-lamp", ["şerit", "lamba", "sağlık"], D6),
  gate3("sys-buffet-cache", ["vitrin", "süre", "depo"], D7),
  flow3("sys-ptt-shard", ["semt", "defter", "anahtar"], D6, ["şube", "koli"]),
  stack("sys-mosque-tap", ["musluk", "kova", "kuyruk"], D7),
  cycle4("sys-temel-lab", ["lamba", "vitrin", "şube", "mühür"], D8),
  // Canva Temel (CANVA-101)
  flow3("canva-template-home", ["şablon", "oda", "tek iş"], D6, ["ev", "mobilya"]),
  stack("canva-drawers", ["yazı", "fotoğraf", "zemin"], D6),
  gate3("canva-id-photo", ["ölçü", "yüz", "kalıp"], D7),
  flow3("canva-shop-board", ["pano", "cümle", "üç sn"], D6, ["cam", "vaat"]),
  stack("canva-print-gate", ["kenar", "kâğıt", "kopya"], D7),
  cycle4("canva-temel-lab", ["iş", "kare", "kopya", "mühür"], D8),
  // Pratik Asistan Temel (PRA-101)
  flow3("pra-neighbor", ["komşu", "hız", "kontrol"], D6, ["yazı", "bak"]),
  stack("pra-shop-ask", ["ne", "kim", "uzunluk"], D6),
  gate3("pra-secret", ["kimlik", "cadde", "sır"], D7),
  flow3("pra-drawer", ["sohbet", "çekmece", "iş"], D6, ["kutu", "koku"]),
  stack("pra-proof", ["oku", "düzelt", "imza"], D7),
  cycle4("pra-temel-lab", ["duyuru", "ilan", "dilekçe", "mühür"], D8),
  // LinkedIn Temel (LNK-101)
  flow3("linkedin-door-plate", ["tabela", "profil", "kapı"], D6, ["vitrin", "isimlik"]),
  stack("linkedin-id-photo", ["yüz", "omuz", "zemin"], D6),
  gate3("linkedin-shop-window", ["cam", "başlık", "iş"], D7),
  flow3("linkedin-home-tour", ["kimim", "ne iş", "ulaşım"], D6, ["çekmece", "cümle"]),
  stack("linkedin-board-post", ["hafta", "cümle", "ses"], D7),
  cycle4("linkedin-temel-lab", ["foto", "başlık", "kopya", "mühür"], D8),
  // AutoCAD Temel (CAD-101)
  flow3("cad-house-map", ["kâğıt", "oda", "kapı"], D6, ["harita", "okuma"]),
  stack("cad-wall-drawers", ["duvar", "yazı", "eşya"], D6),
  gate3("cad-id-scale", ["oran", "ölçü", "yazı"], D7),
  flow3("cad-shop-signs", ["kapı", "pencere", "kuzey"], D6, ["işaret", "açılım"]),
  stack("cad-simple-room", ["duvar", "boşluk", "ad"], D7),
  cycle4("cad-temel-lab", ["oku", "oda", "kâğıt", "mühür"], D8),
  // Dijital Pazarlama Temel (Meta)
  flow3("mkt-pixel-events", ["pixel", "event", "sözlük"], D6, ["ölçüm", "kapı"]),
  flow3("mkt-campaign-structure", ["Campaign", "Ad Set", "Ad"], D7, ["hedef", "kreatif"]),
  stack("mkt-audience-types", ["interest", "lookalike", "retarget"], D6),
  gate3("mkt-creative-ab", ["hook", "tek değişken", "CTA"], D7),
  flow3("mkt-bid-budget", ["strateji", "bütçe", "öğrenme"], D6, ["bid", "tavan"]),
  cycle4("mkt-meta-report-lab", ["olay", "yapı", "rapor", "mühür"], D8),
  // Dijital Pazarlama Orta (Google)
  stack("mkt-gads-types", ["Search", "Display", "YouTube", "PMax"], D6),
  flow3("mkt-search-keywords", ["KW", "eşleme", "olumsuz"], D7, ["niyet", "rapor"]),
  gate3("mkt-quality-score", ["CTR", "alaka", "açılış"], D6),
  flow3("mkt-display-safety", ["yerleşim", "frekans", "hariç"], D7, ["güvenlik", "tavan"]),
  gate3("mkt-youtube-funnel", ["format", "hook", "hedef"], D6),
  flow3("mkt-conversion-tracking", ["tag", "consent", "attribution"], D7, ["izin", "payda"]),
  gate3("mkt-spend-discipline", ["teklif", "bütçe", "pace"], D6),
  cycle4("mkt-gads-lab", ["Search", "Display", "tag", "mühür"], D8),
  // Dijital Pazarlama İleri (SEO/Growth)
  flow3("mkt-seo-intent-serp", ["sorgu", "niyet", "format"], D6, ["SERP", "hiza"]),
  stack("mkt-keyword-map", ["tohum", "küme", "öncelik"], D7),
  flow3("mkt-onpage-seo", ["title", "içerik", "dahili link"], D6, ["H1", "hub"]),
  gate3("mkt-technical-seo", ["crawl", "index", "CWV"], D7),
  stack("mkt-content-system", ["brief", "takvim", "yeniden kullanım"], D6),
  flow3("mkt-analytics-funnel", ["olay", "adım", "payda"], D7, ["funnel", "KPI"]),
  gate3("mkt-experiment-ab", ["hipotez", "metrik", "guardrail"], D6),
  cycle4("mkt-growth-loop", ["edinim", "aktivasyon", "referral", "yeniden"], D7),
  gate3("mkt-roas-cac-gate", ["formül", "payda", "dönem"], D6),
  cycle4("mkt-seo-growth-lab", ["SEO", "içerik", "loop", "mühür"], D8),
];

export const ACADEMY_SEALED_DIAGRAMS: Readonly<Record<string, AcademySealedDiagramSpec>> =
  Object.fromEntries(SPECS.map((spec) => [spec.key, spec]));

export const ACADEMY_SEALED_DIAGRAM_KEYS = SPECS.map((spec) => spec.key);

export function academySealedDiagramByKey(key: string): AcademySealedDiagramSpec | null {
  return ACADEMY_SEALED_DIAGRAMS[key] ?? null;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function nodeStroke(kind: AcademyDiagramNodeKind | undefined): string {
  if (kind === "gate") {
    return ACADEMY_DIAGRAM_INK.rose;
  }
  if (kind === "store") {
    return ACADEMY_DIAGRAM_INK.safir;
  }
  return ACADEMY_DIAGRAM_INK.line;
}

export function academyDiagramTokenPath(spec: AcademySealedDiagramSpec): string {
  const nodes = new Map(spec.nodes.map((node) => [node.id, node]));
  const first = nodes.get(spec.edges[0]?.from ?? spec.nodes[0]!.id) ?? spec.nodes[0]!;
  const parts = [`M ${first.x} ${first.y}`];
  for (const edge of spec.edges) {
    const to = nodes.get(edge.to);
    if (!to) {
      continue;
    }
    parts.push(`L ${to.x} ${to.y}`);
  }
  return parts.join(" ");
}

export type AcademyDiagramRenderOptions = {
  animate?: boolean;
  durationSec?: number;
};

function clampLoopSec(value: number | undefined, fallback: AcademyMicroVideoDurationSec): number {
  if (
    value === undefined ||
    value < ACADEMY_MICRO_VIDEO_DURATION_MIN_SEC ||
    value > ACADEMY_MICRO_VIDEO_DURATION_MAX_SEC
  ) {
    return fallback;
  }
  return value;
}

export function renderSealedDiagramSvg(
  spec: AcademySealedDiagramSpec,
  options: AcademyDiagramRenderOptions = {},
): string {
  const { width, height } = ACADEMY_DIAGRAM_VIEWBOX;
  const duration = clampLoopSec(options.durationSec, spec.loopSec);
  const animate = options.animate === true;
  const path = academyDiagramTokenPath(spec);
  const grid: string[] = [];
  for (let x = 24; x < width; x += 24) {
    grid.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="${ACADEMY_DIAGRAM_INK.grid}" stroke-width="1"/>`,
    );
  }
  for (let y = 24; y < height; y += 24) {
    grid.push(
      `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="${ACADEMY_DIAGRAM_INK.grid}" stroke-width="1"/>`,
    );
  }
  const nodes = new Map(spec.nodes.map((node) => [node.id, node]));
  const edges = spec.edges.map((edge, index) => {
    const from = nodes.get(edge.from);
    const to = nodes.get(edge.to);
    if (!from || !to) {
      return "";
    }
    const mx = (from.x + to.x) / 2;
    const my = (from.y + to.y) / 2 - 10;
    const label = edge.label
      ? `<text x="${mx}" y="${my}" text-anchor="middle" font-size="10" fill="${ACADEMY_DIAGRAM_INK.muted}">${xmlEscape(edge.label)}</text>`
      : "";
    return `<g data-edge="${index}"><line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${ACADEMY_DIAGRAM_INK.safir}" stroke-opacity="0.45" stroke-width="1.5"/><circle cx="${to.x}" cy="${to.y}" r="2.5" fill="${ACADEMY_DIAGRAM_INK.safir}" fill-opacity="0.7"/>${label}</g>`;
  });
  const boxes = spec.nodes.map((node) => {
    const x = node.x - NODE_W / 2;
    const y = node.y - NODE_H / 2;
    const stroke = nodeStroke(node.kind);
    return `<g><rect x="${x}" y="${y}" width="${NODE_W}" height="${NODE_H}" rx="10" fill="${ACADEMY_DIAGRAM_INK.fill}" stroke="${stroke}" stroke-width="1.25"/><text x="${node.x}" y="${node.y + 4}" text-anchor="middle" font-size="12" font-weight="600" fill="${ACADEMY_DIAGRAM_INK.fg}">${xmlEscape(node.label)}</text></g>`;
  });
  const token = animate
    ? `<circle r="5.5" fill="${ACADEMY_DIAGRAM_INK.safir}" class="academy-micro-token"><animateMotion dur="${duration}s" repeatCount="indefinite" path="${path}"/></circle>`
    : `<circle cx="${spec.nodes[0]!.x}" cy="${spec.nodes[0]!.y}" r="4" fill="${ACADEMY_DIAGRAM_INK.safir}" fill-opacity="0.85"/>`;
  const style = animate
    ? `<style>@media (prefers-reduced-motion: reduce) { .academy-micro-token { display: none; } }</style>`
    : "";
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-label="${xmlEscape(spec.key)}" font-family="Segoe UI, ui-sans-serif, system-ui, sans-serif">
  <rect width="${width}" height="${height}" fill="${ACADEMY_DIAGRAM_INK.canvas}"/>
  ${style}
  <g opacity="0.9">${grid.join("")}</g>
  ${edges.join("")}
  ${boxes.join("")}
  ${token}
</svg>
`;
}

export function renderSealedDiagramSvgByKey(
  key: string,
  options: AcademyDiagramRenderOptions = {},
): string | null {
  const spec = academySealedDiagramByKey(key);
  if (!spec) {
    return null;
  }
  return renderSealedDiagramSvg(spec, options);
}