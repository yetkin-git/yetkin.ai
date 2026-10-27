import { juniorHintBody, juniorHintTitle, type JuniorHintKind } from "@/lib/junior/content-rules";
import type { JuniorVectorScene } from "@/lib/junior/types";

const NODE_ICON = ["🔍", "🎯", "✨", "📌"] as const;

const NODE_CARD_LUXE =
  "rounded-xl border border-slate-200/90 shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-md";

const NODE_TONE = [
  {
    card: `${NODE_CARD_LUXE} bg-sky-50/90 text-sky-950`,
    icon: "bg-sky-500 text-white",
    chip: "border-sky-200 bg-white text-sky-800",
  },
  {
    card: `${NODE_CARD_LUXE} bg-violet-50/90 text-violet-950`,
    icon: "bg-violet-500 text-white",
    chip: "border-violet-200 bg-white text-violet-800",
  },
  {
    card: `${NODE_CARD_LUXE} bg-emerald-50/90 text-emerald-950`,
    icon: "bg-emerald-500 text-white",
    chip: "border-emerald-200 bg-white text-emerald-800",
  },
  {
    card: `${NODE_CARD_LUXE} bg-amber-50/90 text-amber-950`,
    icon: "bg-amber-500 text-white",
    chip: "border-amber-200 bg-white text-amber-800",
  },
] as const;

type NodeTone = (typeof NODE_TONE)[number];

function pickNodeTone(index: number): NodeTone {
  return NODE_TONE[index % NODE_TONE.length] ?? NODE_TONE[0]!;
}

function firstSentence(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const match = clean.match(/^[\s\S]*?[.!?](?=\s|$)/u);
  return (match?.[0] ?? clean).trim();
}

function lastSentence(text: string): string {
  const parts = text
    .replace(/\s+/g, " ")
    .trim()
    .split(/(?<=[.!])\s+/u)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
  return parts[parts.length - 1] ?? "";
}

function stripHintLead(text: string): string {
  return juniorHintBody(text);
}

function isDivisionDetectiveCopy(...parts: readonly string[]): boolean {
  const blob = parts.join(" ");
  const hasLastDigit =
    /2,\s*5(?:\s*ve\s*|,\s*)10/u.test(blob) || /Son Basamak Dedektif/u.test(blob);
  const hasDigitSum = /3\s*ve\s*9|Rakam Toplamı Dedektif/u.test(blob);
  return hasLastDigit && hasDigitSum;
}

function HighlightMark({ children }: { children: string }) {
  return (
    <span className="rounded bg-amber-100/80 px-1.5 py-0.5 font-bold text-amber-900">{children}</span>
  );
}

/** Bu kapsülün çip haritası: çarpan/kat ve 2, 3, 4, 5, 6, 9, 10. */
const MEB_DIVISION_DETECTIVES = [
  {
    icon: "🧩",
    iconTone: "bg-indigo-500 text-white",
    title: "Çarpan ve Kat",
    marks: ["≤", "≥"] as const,
    tipKind: "compare" as const,
    example: "Örnek: 6'nın çarpanı 6, katı da 6",
  },
  {
    icon: "💡",
    iconTone: "bg-amber-400 text-amber-950",
    title: "Son Basamak Dedektifleri",
    marks: ["2", "5", "10"] as const,
    tipKind: "ones" as const,
    example: "Örnek: 24 → sonu 4, çift ✓",
  },
  {
    icon: "🔎",
    iconTone: "bg-orange-500 text-white",
    title: "Son İki Basamak (4)",
    marks: ["4"] as const,
    tipKind: "lastTwo" as const,
    example: "Örnek: 116 → son iki 16 ✓",
  },
  {
    icon: "🧮",
    iconTone: "bg-violet-500 text-white",
    title: "Rakam Toplamı Dedektifleri",
    marks: ["3", "9"] as const,
    tipKind: "digitSum" as const,
    example: "Örnek: 18 → 1+8=9 ✓",
  },
  {
    icon: "🤝",
    iconTone: "bg-teal-500 text-white",
    title: "Çifte Koşul (6)",
    marks: ["6"] as const,
    tipKind: "both" as const,
    example: "Örnek: 24 → 2✓ ve 3✓ → 6✓",
  },
] as const;

function DetectiveTip({ kind }: { kind: (typeof MEB_DIVISION_DETECTIVES)[number]["tipKind"] }) {
  if (kind === "compare") {
    return (
      <>
        Çarpan sayıya <HighlightMark>eşit ya da küçük</HighlightMark>. Kat{" "}
        <HighlightMark>eşit ya da büyük</HighlightMark>.
      </>
    );
  }
  if (kind === "ones") {
    return (
      <>
        Yalnızca <HighlightMark>birler basamağına</HighlightMark> bak!
      </>
    );
  }
  if (kind === "lastTwo") {
    return (
      <>
        100, 4&apos;e tam bölündüğü için <HighlightMark>son iki basamak</HighlightMark> yeter.
      </>
    );
  }
  if (kind === "both") {
    return (
      <>
        Hem <HighlightMark>2</HighlightMark>&apos;ye hem <HighlightMark>3</HighlightMark>&apos;e aynı anda.
      </>
    );
  }
  return (
    <>
      Rakamları topla, <HighlightMark>kata</HighlightMark> bak!
    </>
  );
}

function mindMapExample(node: string): string | null {
  const text = node.toLocaleLowerCase("tr-TR");
  if (text.includes("çarpan") || (text.includes("kat") && !text.includes("kata"))) {
    return "Örnek: 6 → çarpan 1,2,3,6 ✓";
  }
  if (text.includes("son iki") || text.includes("(4)")) {
    return "Örnek: 116 → son iki 16 ✓";
  }
  if (text.includes("çifte koşul") || text.includes("(6)")) {
    return "Örnek: 24 → 2✓ ve 3✓ → 6✓";
  }
  if (text.includes("2, 5") || text.includes("son rakam") || text.includes("birler")) {
    return "Örnek: 24 → sonu 4, çift ✓";
  }
  if (text.includes("3 ve 9") || text.includes("3, 9") || text.includes("rakam toplam")) {
    return "Örnek: 24 → 2+4=6 ✓";
  }
  return null;
}

export function LessonBooklet({
  title,
  scene,
  concept,
  example: _example,
  warning,
  recap,
  lifeUse,
  outcomes,
  hint,
  heroQuestion = "",
  heroFocus = "",
}: {
  title: string;
  scene: JuniorVectorScene;
  concept: string;
  /** Booklet API uyumu; hero kart artık bu alandan okumaz. */
  example: string;
  warning: string;
  recap: readonly string[];
  lifeUse: string;
  outcomes: readonly string[];
  hint: JuniorHintKind;
  /** Pedagojik ana soru SSOT. Sahne/cue cümlesinden türetilmez. */
  heroQuestion?: string;
  /** Hero alt bant / odak cümlesi SSOT. */
  heroFocus?: string;
}) {
  void _example;
  const rules = (recap.length > 0 ? recap : outcomes).slice(0, 3);
  const trapBody = stripHintLead(warning);
  const showTrap = hint === "trap" && trapBody.length > 0;
  const goldExtra = hint === "gold" ? trapBody : "";
  const mapNodes = outcomes.length > 0 ? outcomes.slice(0, 4) : rules;
  const showGold = rules.length > 0 || goldExtra.length > 0;
  const detectiveGold = showGold && isDivisionDetectiveCopy(...rules, goldExtra, ...mapNodes);

  return (
    <article
      data-junior-booklet=""
      className="grid gap-4 rounded-[1.75rem] border border-amber-200 bg-[#fff8ee] p-4 shadow-[0_10px_28px_rgba(120,72,12,0.08)] sm:p-5"
    >
      <header className="border-b border-dashed border-amber-300 pb-3">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-amber-800">Yardımcı kaynak</p>
        <h3 className="mt-1 text-xl font-black tracking-tight text-slate-900">{title}</h3>
      </header>

      {scene === "exponent" ? (
        <ExponentConceptCard lifeUse={lifeUse} concept={concept} />
      ) : (
        <ConceptCard title={title} heroQuestion={heroQuestion} heroFocus={heroFocus} />
      )}

      {showGold ? (
        <aside data-junior-gold-tip="" className="rounded-r-2xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3">
          <h4 className="text-sm font-black text-amber-950">{juniorHintTitle("gold")}</h4>
          {detectiveGold ? (
            <DetectiveGoldBadges />
          ) : (
            <GoldRuleBadges rules={rules} goldExtra={goldExtra} />
          )}
        </aside>
      ) : null}

      {showTrap ? (
        <aside data-junior-trap-box="" className="rounded-r-2xl border-l-4 border-sky-400 bg-sky-50 px-4 py-3">
          <h4 className="text-sm font-black text-sky-950">{juniorHintTitle("trap")}</h4>
          {scene === "exponent" ? <ExponentTrap /> : null}
          <p className="mt-2 text-sm font-semibold leading-6 text-sky-950">{trapBody}</p>
        </aside>
      ) : null}

      {scene === "exponent" ? (
        <ExponentMindMap title={title} />
      ) : detectiveGold ? (
        <DetectiveMindMap title={title} />
      ) : (
        <MindMap title={title} nodes={mapNodes} />
      )}
    </article>
  );
}

const GOLD_CARD_LUXE =
  "rounded-xl border border-slate-200/90 bg-white shadow-sm transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md";

function DetectiveGoldBadges() {
  return (
    <div className="mt-3 grid gap-3 sm:grid-cols-2">
      {MEB_DIVISION_DETECTIVES.map((row) => (
        <div key={row.title} className={`${GOLD_CARD_LUXE} p-3`}>
          <div className="flex items-start gap-3">
            <span
              aria-hidden
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-xl shadow-sm ${row.iconTone}`}
            >
              {row.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-amber-950">{row.title}</p>
              <p className="mt-1 flex flex-wrap gap-1 text-xs font-bold">
                {row.marks.map((mark) => (
                  <HighlightMark key={mark}>{mark}</HighlightMark>
                ))}
              </p>
              <p className="mt-2 text-sm font-semibold leading-6 text-amber-950">
                <DetectiveTip kind={row.tipKind} />
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DetectiveMindMap({ title }: { title: string }) {
  return (
    <section
      data-junior-mind-map=""
      className="rounded-3xl border border-slate-200 bg-gradient-to-b from-sky-50/90 to-white p-4 shadow-sm"
    >
      <h4 className="text-sm font-black text-sky-950">🧠 Görsel zihin haritası</h4>
      <div className="mt-4 grid justify-items-center gap-0">
        <p className="max-w-xs rounded-full bg-indigo-600 px-5 py-2 text-center text-sm font-black text-white shadow-md">
          {title}
        </p>
        <div className="h-5 w-0.5 bg-gradient-to-b from-indigo-500 to-indigo-300" aria-hidden />
        <div className="mb-1 h-0.5 w-[min(100%,18rem)] rounded-full bg-indigo-200" aria-hidden />
        <ul className="grid w-full gap-3 sm:grid-cols-2">
          {MEB_DIVISION_DETECTIVES.map((row, index) => {
            const tone = pickNodeTone(index);
            return (
              <li key={row.title} className={`px-4 py-3 text-center ${tone.card}`}>
                <span
                  aria-hidden
                  className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-lg shadow-sm ${tone.icon}`}
                >
                  {row.icon}
                </span>
                <span className="block text-sm font-black leading-snug">{row.title}</span>
                <span className="mt-1 flex flex-wrap justify-center gap-1 text-xs font-bold">
                  {row.marks.map((mark) => (
                    <HighlightMark key={mark}>{mark}</HighlightMark>
                  ))}
                </span>
                <p className="mt-2 text-xs font-semibold leading-5 text-slate-700">
                  <DetectiveTip kind={row.tipKind} />
                </p>
                <span
                  className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone.chip}`}
                >
                  {row.example}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function GoldRuleBadges({ rules, goldExtra }: { rules: readonly string[]; goldExtra: string }) {
  return (
    <div className="mt-3 grid gap-2">
      {rules.map((rule, index) => (
        <div
          key={rule}
          className={`flex items-start gap-3 px-3 py-2.5 ${GOLD_CARD_LUXE}`}
        >
          <span
            aria-hidden
            className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400 text-sm font-black text-amber-950"
          >
            {index + 1}
          </span>
          <p className="text-sm font-semibold leading-6 text-amber-950">{rule}</p>
        </div>
      ))}
      {goldExtra ? (
        <p className="rounded-2xl border border-dashed border-amber-300 bg-amber-100/50 px-3 py-2 text-sm font-semibold leading-6 text-amber-950">
          {goldExtra}
        </p>
      ) : null}
    </div>
  );
}

function ConceptCard({
  title,
  heroQuestion,
  heroFocus,
}: {
  title: string;
  heroQuestion: string;
  heroFocus: string;
}) {
  // Sahne/cue/life cümlesi ASLA hero'ya düşmez; yalnız pedagojik SSOT veya ders başlığı.
  const lead = heroQuestion.trim() || title.trim();
  const focus = heroFocus.trim();
  return (
    <section
      data-junior-concept-card=""
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-700 px-5 py-5 text-white shadow-md"
    >
      <div className="relative z-10 flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/15 px-3 py-1 text-xs font-bold text-sky-50 backdrop-blur-[2px]">
            <span aria-hidden className="text-sm leading-none">
              🎯
            </span>
            <span>Dersin Ana Sorusu</span>
          </p>
          <p className="mt-2 text-2xl font-black leading-snug tracking-tight sm:text-[1.7rem]">{lead}</p>
          {focus && focus !== lead ? (
            <p className="mt-3 rounded-2xl bg-white/15 px-3 py-2 text-sm font-semibold leading-6 backdrop-blur-[2px]">
              {focus}
            </p>
          ) : null}
        </div>
        <div
          aria-hidden
          className="hidden h-16 w-16 shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/15 text-3xl shadow-[0_8px_24px_rgba(15,23,42,0.25)] backdrop-blur-sm sm:flex"
        >
          🧩
        </div>
      </div>
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10 blur-2xl"
      />
    </section>
  );
}

function ExponentConceptCard({ lifeUse, concept }: { lifeUse: string; concept: string }) {
  const caption = lastSentence(lifeUse) || firstSentence(concept);
  const folds = [
    { layers: 1, label: "Düz", mark: "kâğıt" },
    { layers: 2, label: "2 kat", mark: "2" },
    { layers: 3, label: "4 kat", mark: "2×2" },
    { layers: 4, label: "8 kat", mark: "2³" },
  ] as const;
  return (
    <section
      data-junior-concept-card=""
      className="overflow-hidden rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-700 px-5 py-5 text-white shadow-md"
    >
      <p className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-sky-100">
        <span aria-hidden className="text-base leading-none">
          📘
        </span>
        <span className="uppercase">Ana kavram</span>
      </p>
      <p className="mt-2 text-center text-5xl font-black tracking-tight sm:text-6xl">2³ = 8</p>
      <p className="mt-1 text-center text-xl font-bold text-sky-100">2 × 2 × 2</p>
      <p className="mx-auto mt-2 max-w-md text-center text-sm font-semibold leading-6 text-white/90">
        {firstSentence(concept)}
      </p>
      <div data-junior-paper-fold="booklet" className="mt-4 grid grid-cols-4 gap-2">
        {folds.map((fold) => (
          <div key={fold.label} className="flex flex-col items-center gap-2">
            <div className="relative h-16 w-14" aria-hidden>
              {Array.from({ length: fold.layers }, (_, index) => (
                <span
                  key={index}
                  className="absolute h-9 w-11 rounded-sm border border-orange-200 bg-[#fff7ed] shadow-sm"
                  style={{ top: index * 3, left: index * 2 }}
                />
              ))}
            </div>
            <span className="text-center text-xs font-black">{fold.label}</span>
            <span className="text-center text-[11px] font-bold text-sky-100">{fold.mark}</span>
          </div>
        ))}
      </div>
      {caption ? <p className="mt-3 text-center text-sm font-semibold leading-6">{caption}</p> : null}
    </section>
  );
}

function ExponentTrap() {
  return (
    <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <p className="rounded-2xl bg-white px-3 py-3 text-center text-3xl font-black text-emerald-700">2³ = 8</p>
      <p className="text-center text-2xl font-black text-rose-700">≠</p>
      <p className="rounded-2xl bg-white px-3 py-3 text-center text-3xl font-black text-rose-700 line-through decoration-rose-500">
        2 × 3 = 6
      </p>
    </div>
  );
}

function ExponentMindMap({ title }: { title: string }) {
  const nodes = [
    { label: "Taban", note: "Alttaki sayı", example: "Örnek: 2³ → taban 2 ✓" },
    { label: "Üs", note: "Kaç kez çarpılır", example: "Örnek: 2³ → üs 3 ✓" },
    { label: "2³ = 8", note: "2 × 2 × 2", example: "Örnek: 2×2×2=8 ✓" },
    { label: "2³ ≠ 6", note: "2 × 3 değil", example: "Örnek: 2×3=6 ✗" },
  ];
  return (
    <section
      data-junior-mind-map=""
      className="rounded-3xl border border-slate-200 bg-gradient-to-b from-sky-50/90 to-white p-4 shadow-sm"
    >
      <h4 className="text-sm font-black text-sky-950">🧠 Görsel zihin haritası</h4>
      <div className="mt-4 grid justify-items-center gap-0">
        <p className="rounded-full bg-indigo-600 px-5 py-2 text-center text-sm font-black text-white shadow-md">
          {title}
        </p>
        <div className="h-5 w-0.5 bg-gradient-to-b from-indigo-500 to-indigo-300" aria-hidden />
        <div className="mb-1 h-0.5 w-[min(100%,18rem)] rounded-full bg-indigo-200" aria-hidden />
        <ul className="grid w-full gap-3 sm:grid-cols-2">
          {nodes.map((node, index) => {
            const tone = pickNodeTone(index);
            return (
              <li
                key={node.label}
                className={`px-4 py-3 text-center ${tone.card}`}
              >
                <span
                  aria-hidden
                  className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-lg shadow-sm ${tone.icon}`}
                >
                  {NODE_ICON[index % NODE_ICON.length]}
                </span>
                <span className="block text-lg font-black">{node.label}</span>
                <span className="block text-xs font-semibold">{node.note}</span>
                <span
                  className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone.chip}`}
                >
                  {node.example}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function MindMap({ title, nodes }: { title: string; nodes: readonly string[] }) {
  if (nodes.length === 0) {
    return null;
  }
  return (
    <section
      data-junior-mind-map=""
      className="rounded-3xl border border-slate-200 bg-gradient-to-b from-sky-50/90 to-white p-4 shadow-sm"
    >
      <h4 className="text-sm font-black text-sky-950">🧠 Görsel zihin haritası</h4>
      <div className="mt-4 grid justify-items-center gap-0">
        <p className="max-w-xs rounded-full bg-indigo-600 px-5 py-2 text-center text-sm font-black text-white shadow-md">
          {title}
        </p>
        <div className="h-5 w-0.5 bg-gradient-to-b from-indigo-500 to-indigo-300" aria-hidden />
        <div className="mb-1 h-0.5 w-[min(100%,18rem)] rounded-full bg-indigo-200" aria-hidden />
        <ul className="grid w-full gap-3 sm:grid-cols-2">
          {nodes.map((node, index) => {
            const tone = pickNodeTone(index);
            const example = mindMapExample(node);
            return (
              <li
                key={node}
                className={`px-4 py-3 text-center ${tone.card}`}
              >
                <span
                  aria-hidden
                  className={`mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full text-lg shadow-sm ${tone.icon}`}
                >
                  {NODE_ICON[index % NODE_ICON.length]}
                </span>
                <p className="text-sm font-semibold leading-6">{node}</p>
                {example ? (
                  <span
                    className={`mt-2 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${tone.chip}`}
                  >
                    {example}
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}