import type { Route } from "next";
import { IconArrow, IconCheck, IconPassport, IconSpark, IconStore, IconTrophy } from "@/components/ui/icons";
import { cn } from "@/components/ui/cn";
import type { WorkflowModuleId } from "@/lib/rehber/workflows";
import { moduleTotalLabel, workflowModule, workflowStepHref } from "@/lib/rehber/workflows";

/**
 * Platformun uçtan uca çalışma mantığı — modüller arası akış şeması.
 *
 * Dört modül birbirinin yerine geçmez; bir zincirdir:
 * AI Tezgâh (üret) → E-Ticaret (sat) → YetkinHibe (finanse et) → YetkinCV / Vize (kanıtla).
 *
 * Teknik gerçek: saf HTML + semantik `<ol>` ve SVG ok başları. JavaScript gerekmez,
 * istemci bileşeni değildir. Mobilde ok aşağı, masaüstünde sağa bakar. Oklar
 * `aria-hidden` olduğu için ekran okuyucu zinciri sıralı liste olarak okur.
 */

type ChainNode = {
  id: WorkflowModuleId;
  step: string;
  title: string;
  body: string;
  href: Route;
  icon: typeof IconSpark;
  tone: string;
};

const CHAIN_NODES: readonly ChainNode[] = [
  {
    id: "tezgah",
    step: "1 · Üret",
    title: "AI Tezgâh",
    body: "Ürün kartı, teklif ve ticari metni günlük ücretsiz hakla üret.",
    href: "/tezgah",
    icon: IconSpark,
    tone: "bg-[var(--safir-soft)] text-[var(--safir-deep)]",
  },
  {
    id: "ecommerce",
    step: "2 · Sat",
    title: "E-Ticaret İşletme OS",
    body: "Trendyol ve Hepsiburada'da stok, sipariş ve müşteri sorusunu tek panelden yönet.",
    href: "/e-ticaret",
    icon: IconStore,
    tone: "bg-[var(--emerald-soft)] text-[var(--emerald)]",
  },
  {
    id: "hibe",
    step: "3 · Finanse et",
    title: "YetkinHibe",
    body: "Sektörüne uyan açık çağrıyı eşleştir, kurum şablonuna proje dosyası taslağı üret.",
    href: "/hibe",
    icon: IconTrophy,
    tone: "bg-[var(--amber-soft)] text-[var(--amber)]",
  },
  {
    id: "career",
    step: "4 · Kanıtla",
    title: "YetkinCV & Vize",
    body: "Uygulamalı testle puanı al, doğrulanabilir kamu kanıt bağını paylaş.",
    href: "/career",
    icon: IconPassport,
    tone: "bg-[var(--safir-soft)] text-[var(--safir-deep)]",
  },
] as const;

/**
 * Akış oku — aynı SVG iki yönde döner: masaüstünde sağa (kartın sağ kenarında),
 * mobil/tablette aşağı (kartın altında). Dekoratiftir; hedef metni `sr-only` ile
 * zincir bağlamını korur.
 */
function ChainArrow({ label, vertical }: { label: string; vertical?: boolean }) {
  return (
    <span
      aria-hidden
      data-workflow-flow-arrow={vertical ? "down" : "side"}
      className={cn(
        "pointer-events-none z-10 flex text-[var(--safir)]/50",
        vertical
          ? "justify-center py-1 lg:hidden"
          : "absolute -right-5 top-1/2 hidden -translate-y-1/2 lg:flex",
      )}
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" role="presentation">
        <path
          d="M4 12h14M12 6l6 6-6 6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function WorkflowFlowMap({ activeId }: { activeId: WorkflowModuleId }) {
  return (
    <section
      aria-labelledby="rehber-akis-basligi"
      data-workflow-flow-map=""
      className="mt-6 rounded-[var(--radius-card)] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm"
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">
            Uçtan uca akış
          </p>
          <h2 id="rehber-akis-basligi" className="mt-1 text-lg font-semibold tracking-tight">
            Üret → Sat → Finanse et → Kanıtla
          </h2>
        </div>
        <p className="max-w-md text-xs leading-5 text-[var(--muted)]">
          Modüller birbirinin yerine geçmez; bir zincirdir. Aşağıdaki adımlar bu zincirin tek bir
          halkasını açar.
        </p>
      </div>

      {/* Zincir semantiği: sıralı liste. Oklar dekoratiftir (aria-hidden). */}
      <ol className="mt-4 grid gap-3 lg:grid-cols-4">
        {CHAIN_NODES.map((node, index) => {
          const active = node.id === activeId;
          const chainModule = workflowModule(node.id);
          const Icon = node.icon;
          const last = index === CHAIN_NODES.length - 1;
          return (
            <li key={node.id} className="relative">
              <div
                data-workflow-flow-node={node.id}
                data-workflow-flow-node-active={active ? "true" : "false"}
                className={cn(
                  "h-full rounded-2xl border p-4 transition",
                  active
                    ? "border-[var(--safir)] bg-[var(--safir-soft)]/60 shadow-sm"
                    : "border-[var(--border)] bg-[var(--surface)]",
                )}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl",
                      node.tone,
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                    {node.step}
                  </p>
                  {active ? (
                    <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-[var(--safir)] px-2 py-0.5 text-[10px] font-bold text-white">
                      <IconCheck className="h-3 w-3" />
                      Açık
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm font-semibold tracking-tight text-[var(--foreground)]">
                  {node.title}
                </p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{node.body}</p>
                {chainModule ? (
                  <p className="mt-2 text-[11px] font-medium text-[var(--safir-deep)]">
                    {chainModule.steps.length} adım · {moduleTotalLabel(chainModule)}
                  </p>
                ) : null}
                <a
                  href={workflowStepHref(node.href)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--safir-deep)] hover:underline"
                >
                  {active ? "Bu modülün adımları aşağıda" : "Bu modülü aç"}
                  <IconArrow className="h-3 w-3" />
                </a>
              </div>
              {last ? null : (
                <>
                  <ChainArrow label={`${node.title} sonrası`} />
                  <ChainArrow label={`${node.title} sonrası`} vertical />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
