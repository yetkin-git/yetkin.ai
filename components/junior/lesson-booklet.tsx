import { juniorHintBody, juniorHintTitle, type JuniorHintKind } from "@/lib/junior/content-rules";
import type { JuniorVectorScene } from "@/lib/junior/types";

const BUBBLE = [
  "border-sky-300 bg-sky-100 text-sky-950",
  "border-violet-300 bg-violet-100 text-violet-950",
  "border-emerald-300 bg-emerald-100 text-emerald-950",
  "border-amber-300 bg-amber-100 text-amber-950",
] as const;

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

export function LessonBooklet({
  title,
  scene,
  concept,
  example,
  warning,
  recap,
  lifeUse,
  outcomes,
  hint,
}: {
  title: string;
  scene: JuniorVectorScene;
  concept: string;
  example: string;
  warning: string;
  recap: readonly string[];
  lifeUse: string;
  outcomes: readonly string[];
  hint: JuniorHintKind;
}) {
  const rules = (recap.length > 0 ? recap : outcomes).slice(0, 3);
  const trapBody = stripHintLead(warning);
  const showTrap = hint === "trap" && trapBody.length > 0;
  const goldExtra = hint === "gold" ? trapBody : "";
  const mapNodes = outcomes.length > 0 ? outcomes.slice(0, 4) : rules;

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
        <ConceptCard title={title} concept={concept} example={example} />
      )}

      {rules.length > 0 || goldExtra ? (
        <aside data-junior-gold-tip="" className="bg-amber-50 border-l-4 border-amber-400 rounded-r-2xl px-4 py-3">
          <h4 className="text-sm font-black text-amber-950">{juniorHintTitle("gold")}</h4>
          {rules.length > 0 ? (
            <ul className="mt-2 grid gap-2">
              {rules.map((rule) => (
                <li key={rule} className="text-sm font-semibold leading-6 text-amber-950">
                  {rule}
                </li>
              ))}
            </ul>
          ) : null}
          {goldExtra ? <p className="mt-2 text-sm font-semibold leading-6 text-amber-950">{goldExtra}</p> : null}
        </aside>
      ) : null}

      {showTrap ? (
        <aside data-junior-trap-box="" className="bg-sky-50 border-l-4 border-sky-400 rounded-r-2xl px-4 py-3">
          <h4 className="text-sm font-black text-sky-950">{juniorHintTitle("trap")}</h4>
          {scene === "exponent" ? <ExponentTrap /> : null}
          <p className="mt-2 text-sm font-semibold leading-6 text-sky-950">{trapBody}</p>
        </aside>
      ) : null}

      {scene === "exponent" ? <ExponentMindMap title={title} /> : <MindMap title={title} nodes={mapNodes} />}
    </article>
  );
}

function ConceptCard({
  title,
  concept,
  example,
}: {
  title: string;
  concept: string;
  example: string;
}) {
  const lead = firstSentence(concept || title);
  const sample = firstSentence(example);
  return (
    <section
      data-junior-concept-card=""
      className="rounded-3xl bg-gradient-to-br from-sky-600 via-indigo-600 to-violet-700 px-5 py-5 text-white shadow-md"
    >
      <p className="flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-sky-100">
        <span aria-hidden className="text-base leading-none">📘</span>
        <span className="uppercase">Ana kavram</span>
      </p>
      <p className="mt-2 text-2xl font-black leading-snug">{lead}</p>
      {sample && sample !== lead ? (
        <p className="mt-3 rounded-2xl bg-white/15 px-3 py-2 text-sm font-semibold leading-6">{sample}</p>
      ) : null}
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
        <span aria-hidden className="text-base leading-none">📘</span>
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
    { label: "Taban", note: "Alttaki sayı", tone: BUBBLE[0] },
    { label: "Üs", note: "Kaç kez çarpılır", tone: BUBBLE[1] },
    { label: "2³ = 8", note: "2 × 2 × 2", tone: BUBBLE[2] },
    { label: "2³ ≠ 6", note: "2 × 3 değil", tone: BUBBLE[3] },
  ];
  return (
    <section data-junior-mind-map="" className="rounded-3xl border border-dashed border-sky-300 bg-sky-50/80 p-4">
      <h4 className="text-sm font-black text-sky-950">🧠 Görsel zihin haritası</h4>
      <div className="mt-4 grid justify-items-center gap-3">
        <p className="rounded-full bg-indigo-600 px-5 py-2 text-center text-sm font-black text-white shadow-md">{title}</p>
        <div className="h-4 w-px bg-indigo-300" aria-hidden />
        <ul className="grid w-full gap-3 sm:grid-cols-2">
          {nodes.map((node) => (
            <li key={node.label} className={`rounded-full border px-4 py-3 text-center shadow-sm ${node.tone}`}>
              <span className="block text-lg font-black">{node.label}</span>
              <span className="block text-xs font-semibold">{node.note}</span>
            </li>
          ))}
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
    <section data-junior-mind-map="" className="rounded-3xl border border-dashed border-sky-300 bg-sky-50/80 p-4">
      <h4 className="text-sm font-black text-sky-950">🧠 Görsel zihin haritası</h4>
      <div className="mt-4 grid justify-items-center gap-3">
        <p className="max-w-xs rounded-full bg-indigo-600 px-5 py-2 text-center text-sm font-black text-white shadow-md">
          {title}
        </p>
        <div className="h-4 w-px bg-indigo-300" aria-hidden />
        <ul className="grid w-full gap-3 sm:grid-cols-2">
          {nodes.map((node, index) => (
            <li
              key={node}
              className={`rounded-3xl border px-4 py-3 text-center text-sm font-semibold leading-6 shadow-sm ${BUBBLE[index % BUBBLE.length]}`}
            >
              {node}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
