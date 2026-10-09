import type { ReactNode } from "react";
import {
  Ink,
  stickyAffixTrain,
  stickyMeaningExample,
  stickyWordTreeExample,
  SceneFoot,
  SceneTitle,
  SoftCard,
  SoftFocus,
  SoftStage,
  type MeaningPan,
  type WordTreeBranch,
} from "@/components/junior/player/scene-ui";
import type { JuniorVectorScene } from "@/lib/junior/types";

function captionTrailOrLive(caption: string, captionTrail?: readonly string[]): readonly string[] {
  if (captionTrail && captionTrail.length > 0) return captionTrail;
  return caption.trim() ? [caption] : [];
}

function fitPhrase(phrase: string, max = 28): string {
  const text = phrase.replace(/\s+/gu, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(1, max - 1))}…`;
}

function panCenterX(pan: MeaningPan): number {
  if (pan === "mecaz") return 180;
  if (pan === "terim") return 290;
  return 70;
}

function branchCenterX(branch: WordTreeBranch): number {
  if (branch === "zit" || branch === "atasozu") return 180;
  if (branch === "yakin") return 290;
  if (branch === "deyim") return 98;
  return 70;
}

export type TurkishJuniorScene =
  | "meaning"
  | "word-tree"
  | "affix"
  | "book"
  | "main-idea"
  | "support-idea";

export function isTurkishJuniorScene(scene: JuniorVectorScene): scene is TurkishJuniorScene {
  return (
    scene === "meaning" ||
    scene === "word-tree" ||
    scene === "affix" ||
    scene === "book" ||
    scene === "main-idea" ||
    scene === "support-idea"
  );
}

export function turkishRecapName(scene: JuniorVectorScene): string | null {
  if (scene === "meaning") return "Anlam";
  if (scene === "word-tree") return "Ağaç";
  if (scene === "affix") return "Ek";
  if (scene === "book") return "Sayfa";
  if (scene === "main-idea") return "Pusula";
  if (scene === "support-idea") return "Yardımcı";
  return null;
}

function Stage({ scene, children }: { scene: Parameters<typeof SoftStage>[0]["scene"]; children: ReactNode }) {
  return (
    <SoftStage scene={scene} gradientId="turk-stage-bg">
      {children}
    </SoftStage>
  );
}

/** Gerçek / mecaz / terim terazisi; söz sanatı kartı; neden-amaç-koşul şeması. */
export function MeaningScene({
  beat,
  caption,
  captionTrail,
}: {
  beat: number;
  caption: string;
  captionTrail?: readonly string[];
}) {
  const text = caption.toLocaleLowerCase("tr-TR");
  const mode = /benzet|kişileştir|konuştur|karşıt|söz sanat|abart/.test(text)
    ? "figure"
    : /öznel|nesnel/.test(text)
      ? "judge"
      : /neden|amaç|koşul|şart|çünkü|için/.test(text)
        ? "link"
        : /örtülü|ima|yorum|kapıyı çarp/.test(text)
          ? "hinted"
          : "sense";

  if (mode === "figure") {
    const cards = [
      { label: "Benzetme", tip: "gibi, kadar", fill: "#fff" },
      { label: "Kişileştirme", tip: "insan hali", fill: beat >= 2 ? "#fde68a" : "#fff" },
      { label: "Konuşturma", tip: "söz söyler", fill: beat >= 4 ? "#e0f2fe" : "#fff" },
      { label: "Karşıtlık", tip: "zıtlar bir arada", fill: beat >= 5 ? "#fecdd3" : "#fff" },
    ];
    return (
      <Stage scene="meaning">
        <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Söz sanatı kartı
        </text>
        {cards.map((card, index) => (
          <g key={card.label}>
            <rect
              x={16 + (index % 2) * 170}
              y={40 + Math.floor(index / 2) * 68}
              width="158"
              height="56"
              rx="10"
              fill={card.fill}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <text
              x={28 + (index % 2) * 170}
              y={64 + Math.floor(index / 2) * 68}
              fill="#0f172a"
              fontSize="14"
              fontFamily="inherit"
              fontWeight="700"
            >
              {card.label}
            </text>
            <text
              x={28 + (index % 2) * 170}
              y={84 + Math.floor(index / 2) * 68}
              fill="#64748b"
              fontSize="12"
              fontFamily="inherit"
            >
              {card.tip}
            </text>
          </g>
        ))}
      </Stage>
    );
  }

  if (mode === "judge") {
    return (
      <Stage scene="meaning">
        <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Öznel ve nesnel
        </text>
        <rect x="24" y="48" width="140" height="100" rx="12" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="54" y="88" fill="#0f172a" fontSize="18" fontFamily="inherit" fontWeight="700">
          Nesnel
        </text>
        <text x="40" y="118" fill="#64748b" fontSize="12" fontFamily="inherit">
          Ölçülür, kanıtlanır
        </text>
        <rect
          x="196"
          y="48"
          width="140"
          height="100"
          rx="12"
          fill={beat >= 2 ? "#fde68a" : "#fff"}
          stroke="#cbd5e1"
          strokeWidth="3"
        />
        <text x="228" y="88" fill="#0f172a" fontSize="18" fontFamily="inherit" fontWeight="700">
          Öznel
        </text>
        <text x="214" y="118" fill="#64748b" fontSize="12" fontFamily="inherit">
          Kişiye göre değişir
        </text>
      </Stage>
    );
  }

  if (mode === "link") {
    const rows = [
      { from: "Neden", to: "Sonuç", tip: "çünkü, için" },
      { from: "Amaç", to: "Sonuç", tip: "diye, amacıyla" },
      { from: "Koşul", to: "Sonuç", tip: "se / sa" },
    ];
    const shown = beat >= 5 ? 3 : beat >= 3 ? 2 : 1;
    return (
      <Stage scene="meaning">
        <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Neden · amaç · koşul şeması
        </text>
        {rows.slice(0, shown).map((row, index) => (
          <g key={row.from}>
            <rect x="20" y={44 + index * 48} width="88" height="36" rx="8" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
            <text x="36" y={67 + index * 48} fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
              {row.from}
            </text>
            <line x1="116" y1={62 + index * 48} x2="196" y2={62 + index * 48} stroke="#cbd5e1" strokeWidth="2" />
            <polygon points={`${196},${62 + index * 48} 186,56 186,68`} fill="#0f172a" />
            <rect x="204" y={44 + index * 48} width="88" height="36" rx="8" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
            <text x="222" y={67 + index * 48} fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
              {row.to}
            </text>
            <text x="300" y={67 + index * 48} fill="#64748b" fontSize="11" fontFamily="inherit">
              {row.tip}
            </text>
          </g>
        ))}
      </Stage>
    );
  }

  const example = stickyMeaningExample(captionTrailOrLive(caption, captionTrail));
  const spoken = example.phrase.trim();

  if (mode === "hinted") {
    const hintedLine = /kapıyı\s+çarp/u.test(text)
      ? "Kapıyı çarparak çıktı."
      : spoken
        ? fitPhrase(spoken, 34)
        : "Kapıyı çarparak çıktı.";
    return (
      <Stage scene="meaning">
        <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Örtülü anlam
        </text>
        <SoftCard x={28} y={48} w={304} h={44} fill={Ink.sky} rx={12} hot />
        <text x="44" y="76" fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
          {hintedLine}
        </text>
        <rect
          x="28"
          y={beat >= 4 ? 112 : 120}
          width="140"
          height="40"
          rx="10"
          fill="#fff"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <text x="44" y={beat >= 4 ? 138 : 146} fill="#64748b" fontSize="13" fontFamily="inherit">
          Açık: kapı çarptı
        </text>
        {beat >= 3 ? (
          <>
            <rect x="192" y="112" width="140" height="40" rx="10" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
            <text x="208" y="138" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
              Örtülü: kızgın
            </text>
          </>
        ) : null}
      </Stage>
    );
  }

  const activePan = spoken
    ? example.pan
    : beat >= 6
      ? "terim"
      : beat >= 2
        ? "mecaz"
        : "gercek";
  const pans: Array<{ id: MeaningPan; label: string; tip: string; x: number }> = [
    { id: "gercek", label: "Gerçek", tip: "somut ilk anlam", x: 20 },
    { id: "mecaz", label: "Mecaz", tip: "benzetme yolu", x: 130 },
    { id: "terim", label: "Terim", tip: "alanın sözü", x: 240 },
  ];
  const arrowX = panCenterX(activePan);
  const panY = spoken ? 108 : 78;
  const panH = spoken ? 52 : 70;

  return (
    <Stage scene="meaning">
      <text x="16" y="22" fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
        Anlam terazisi
      </text>
      {spoken ? (
        <g data-junior-example="meaning">
          <SoftCard x={28} y={30} w={304} h={38} fill={Ink.amber} rx={12} hot />
          <text x="180" y="54" textAnchor="middle" fill={Ink.text} fontSize="15" fontFamily="inherit" fontWeight="700">
            {fitPhrase(spoken, 32)}
          </text>
          <line x1="180" y1="70" x2={arrowX} y2={panY - 4} stroke={Ink.accent} strokeWidth="2.5" />
          <polygon
            points={`${arrowX},${panY - 2} ${arrowX - 6},${panY - 12} ${arrowX + 6},${panY - 12}`}
            fill={Ink.accent}
          />
        </g>
      ) : (
        <>
          <line x1="40" y1="56" x2="320" y2="56" stroke="#92400e" strokeWidth="4" strokeLinecap="round" />
          <line x1="180" y1="56" x2="180" y2="72" stroke="#92400e" strokeWidth="3" />
          <circle cx="180" cy="48" r="6" fill="#92400e" />
        </>
      )}
      {pans.map((pan) => {
        const hot = pan.id === activePan;
        const fill =
          pan.id === "mecaz" && (hot || beat >= 2)
            ? Ink.amber
            : pan.id === "terim" && (hot || beat >= 4)
              ? Ink.sky
              : hot
                ? Ink.green
                : Ink.white;
        return (
          <SoftFocus key={pan.id} active={hot}>
            <SoftCard x={pan.x} y={panY} w={100} h={panH} fill={fill} rx={10} hot={hot} />
            <text
              x={pan.x + 50}
              y={panY + (spoken ? 22 : 34)}
              textAnchor="middle"
              fill={Ink.text}
              fontSize="15"
              fontFamily="inherit"
              fontWeight="700"
            >
              {pan.label}
            </text>
            <text
              x={pan.x + 50}
              y={panY + (spoken ? 40 : 56)}
              textAnchor="middle"
              fill={Ink.muted}
              fontSize="11"
              fontFamily="inherit"
            >
              {pan.tip}
            </text>
          </SoftFocus>
        );
      })}
      <SceneFoot y={spoken ? 178 : 176} fill={spoken ? Ink.accent : Ink.text}>
        {spoken
          ? activePan === "mecaz"
            ? "Bu örnek mecaz kefesine bağlanır."
            : activePan === "terim"
              ? "Bu örnek terim kefesine bağlanır."
              : "Bu örnek gerçek kefesine bağlanır."
          : beat >= 6
            ? "Karekök bir terimdir."
            : "Cümle hangi kefeyi seçer?"}
      </SceneFoot>
    </Stage>
  );
}

/** Eş / zıt / yakın dalları; çok anlamlılık; deyim ve atasözü. */
export function WordTreeScene({
  beat,
  caption,
  captionTrail,
}: {
  beat: number;
  caption: string;
  captionTrail?: readonly string[];
}) {
  const text = caption.toLocaleLowerCase("tr-TR");
  const mode = /deyim|atasöz/.test(text) ? "idiom" : /eş anlam|zıt|yakın/.test(text) ? "pair" : "tree";
  const example = stickyWordTreeExample(captionTrailOrLive(caption, captionTrail));
  const spoken = example.phrase.trim();

  if (mode === "idiom") {
    const hotDeyim = spoken ? example.branch === "deyim" : beat < 4;
    const hotAta = spoken ? example.branch === "atasozu" : beat >= 4;
    const arrowX = spoken ? branchCenterX(example.branch === "atasozu" ? "atasozu" : "deyim") : null;
    return (
      <Stage scene="word-tree">
        <text x="16" y="22" fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
          Deyim ve atasözü
        </text>
        {spoken ? (
          <g data-junior-example="word-tree">
            <SoftCard x={28} y={30} w={304} h={34} fill={Ink.amber} rx={12} hot />
            <text x="180" y="52" textAnchor="middle" fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
              {fitPhrase(spoken, 34)}
            </text>
            {arrowX !== null ? (
              <>
                <line x1="180" y1="66" x2={arrowX} y2="88" stroke={Ink.accent} strokeWidth="2.5" />
                <polygon
                  points={`${arrowX},90 ${arrowX - 6},80 ${arrowX + 6},80`}
                  fill={Ink.accent}
                />
              </>
            ) : null}
          </g>
        ) : null}
        <SoftFocus active={hotDeyim}>
          <SoftCard x={24} y={spoken ? 96 : 52} w={148} h={spoken ? 56 : 88} fill={Ink.amber} rx={12} hot={hotDeyim} />
          <text x="98" y={spoken ? 122 : 92} textAnchor="middle" fill={Ink.text} fontSize="16" fontFamily="inherit" fontWeight="700">
            Deyim
          </text>
          {!spoken ? (
            <text x="98" y="118" textAnchor="middle" fill={Ink.muted} fontSize="12" fontFamily="inherit">
              Kalıp anlatım
            </text>
          ) : null}
        </SoftFocus>
        <SoftFocus active={hotAta}>
          <SoftCard x={188} y={spoken ? 96 : 52} w={148} h={spoken ? 56 : 88} fill={Ink.sky} rx={12} hot={hotAta} />
          <text x="262" y={spoken ? 122 : 92} textAnchor="middle" fill={Ink.text} fontSize="16" fontFamily="inherit" fontWeight="700">
            Atasözü
          </text>
          {!spoken ? (
            <text x="262" y="118" textAnchor="middle" fill={Ink.muted} fontSize="12" fontFamily="inherit">
              Öğüt verir
            </text>
          ) : null}
        </SoftFocus>
        <SceneFoot y={176}>
          {spoken
            ? example.branch === "atasozu"
              ? "Bu örnek atasözü paneline bağlanır."
              : "Bu örnek deyim paneline bağlanır."
            : beat >= 4
              ? "Deyim kalıptır. Atasözü öğüttür."
              : "İkisi de hazır sözdür."}
        </SceneFoot>
      </Stage>
    );
  }

  if (mode === "pair") {
    const branches: Array<{ id: WordTreeBranch; label: string; tip: string; x: number }> = [
      { id: "es", label: "Eş", tip: "aynı anlam", x: 70 },
      { id: "zit", label: "Zıt", tip: "ters anlam", x: 180 },
      { id: "yakin", label: "Yakın", tip: "benzer anlam", x: 290 },
    ];
    const shown = beat >= 4 ? 3 : beat >= 2 ? 2 : 1;
    const activeBranch =
      spoken && (example.branch === "es" || example.branch === "zit" || example.branch === "yakin")
        ? example.branch
        : null;
    const arrowX = activeBranch ? branchCenterX(activeBranch) : null;
    return (
      <Stage scene="word-tree">
        <text x="16" y="22" fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
          Sözcük ilişkisi ağacı
        </text>
        {spoken ? (
          <g data-junior-example="word-tree">
            <SoftCard x={40} y={28} w={280} h={30} fill={Ink.amber} rx={12} hot />
            <text x="180" y="48" textAnchor="middle" fill={Ink.text} fontSize="13" fontFamily="inherit" fontWeight="700">
              {fitPhrase(spoken, 30)}
            </text>
            {arrowX !== null ? (
              <>
                <line x1="180" y1="60" x2={arrowX} y2={98} stroke={Ink.accent} strokeWidth="2.5" />
                <polygon
                  points={`${arrowX},100 ${arrowX - 6},90 ${arrowX + 6},90`}
                  fill={Ink.accent}
                />
              </>
            ) : null}
          </g>
        ) : (
          <>
            <line x1="180" y1="150" x2="180" y2="78" stroke="#92400e" strokeWidth="6" />
            <circle cx="180" cy="64" r="22" fill="#86efac" stroke="#cbd5e1" strokeWidth="2" />
            <text x="164" y="70" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
              söz
            </text>
          </>
        )}
        {branches.slice(0, shown).map((branch) => {
          const hot = activeBranch === branch.id;
          return (
            <SoftFocus key={branch.label} active={hot || !spoken}>
              <line
                x1="180"
                y1={spoken ? 70 : 78}
                x2={branch.x}
                y2={spoken ? 112 : 118}
                stroke="#92400e"
                strokeWidth="3"
              />
              <circle
                cx={branch.x}
                cy={spoken ? 122 : 128}
                r={28}
                fill={hot ? Ink.amberFill : Ink.amber}
                stroke={hot ? Ink.accent : Ink.stroke}
                strokeWidth={hot ? 3 : 2}
              />
              <text
                x={branch.x}
                y={spoken ? 118 : 124}
                textAnchor="middle"
                fill={Ink.text}
                fontSize="13"
                fontFamily="inherit"
                fontWeight="700"
              >
                {branch.label}
              </text>
              <text
                x={branch.x}
                y={spoken ? 134 : 140}
                textAnchor="middle"
                fill={Ink.muted}
                fontSize="10"
                fontFamily="inherit"
              >
                {branch.tip}
              </text>
            </SoftFocus>
          );
        })}
      </Stage>
    );
  }

  return (
    <Stage scene="word-tree">
      <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        Söz varlığı ağacı
      </text>
      <line x1="180" y1="168" x2="180" y2="78" stroke="#92400e" strokeWidth="6" />
      <circle cx="180" cy="64" r="24" fill="#86efac" stroke="#cbd5e1" strokeWidth="2" />
      <text x="158" y="70" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
        kök söz
      </text>
      {beat >= 1 ? (
        <>
          <line x1="180" y1="88" x2="110" y2="118" stroke="#92400e" strokeWidth="3" />
          <circle cx="100" cy="128" r="20" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
          <text x="100" y="133" textAnchor="middle" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
            anlam 1
          </text>
        </>
      ) : null}
      {beat >= 2 ? (
        <>
          <line x1="180" y1="88" x2="250" y2="118" stroke="#92400e" strokeWidth="3" />
          <circle cx="260" cy="128" r="20" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
          <text x="260" y="133" textAnchor="middle" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
            anlam 2
          </text>
        </>
      ) : null}
      {beat >= 4 ? (
        <>
          <line x1="180" y1="88" x2="180" y2="138" stroke="#92400e" strokeWidth="3" />
          <circle cx="180" cy="156" r="16" fill="#fecdd3" stroke="#cbd5e1" strokeWidth="2" />
          <text x="180" y="160" textAnchor="middle" fill="#0f172a" fontSize="10" fontFamily="inherit" fontWeight="700">
            +
          </text>
        </>
      ) : null}
      <text x="16" y="188" fill="#0f172a" fontSize="12" fontFamily="inherit">
        Okudukça dal çoğalır.
      </text>
    </Stage>
  );
}

/** Kök lokomotifi + ek vagonları — yapışkan iz; genel cümlede seed’e sıçramaz. */
export function AffixScene({
  beat,
  caption,
  captionTrail,
}: {
  beat: number;
  caption: string;
  captionTrail?: readonly string[];
}) {
  const text = caption.toLocaleLowerCase("tr-TR");
  const mode = /çekim|çoğul|iyelik|hal eki|ilgi|bulunma/.test(text)
    ? "inflect"
    : /yapım|türet|gözlük|lük/.test(text)
      ? "derive"
      : "root";
  const trail = captionTrail && captionTrail.length > 0 ? captionTrail : caption.trim() ? [caption] : [];
  const train = stickyAffixTrain(trail);
  const engine = beat >= 1 ? train.root : "kök";
  const visibleWagons = beat >= 2 ? train.wagons.slice(0, Math.max(1, beat - 1)) : [];
  const showVerbRoot = beat >= 5 && mode === "root" && /yaz|fiil/.test(text);
  const note =
    mode === "derive"
      ? "Yapım eki yeni sözcük türetir."
      : mode === "inflect"
        ? "Çekim eki görev verir; kök aynı kalır."
        : beat >= 5
          ? "İsim kökü mak-mek almaz."
          : "Kök daha küçüğe ayrılmaz.";
  const wagonFills = [Ink.sky, Ink.rose, Ink.green];

  return (
    <Stage scene="affix">
      <SceneTitle>
        {mode === "inflect" ? "Çekim ekleri treni" : mode === "derive" ? "Yapım ekleri treni" : "Kök ve ek treni"}
      </SceneTitle>
      <SoftCard x={24} y={70} w={96} h={56} fill={Ink.amber} rx={12} hot />
      <SoftCard x={104} y={86} w={22} h={24} fill={Ink.amberFill} rx={6} />
      <circle cx="44" cy="136" r="10" fill={Ink.strokeHot} />
      <circle cx="96" cy="136" r="10" fill={Ink.strokeHot} />
      <text x="72" y="104" textAnchor="middle" fill={Ink.text} fontSize="16" fontFamily="inherit" fontWeight="700">
        {engine}
      </text>
      <text x="40" y="60" fill={Ink.muted} fontSize="11" fontFamily="inherit">
        kök
      </text>
      {visibleWagons.map((wagon, index) => {
        const x = 148 + index * 110;
        return (
          <g key={`${wagon}-${index}`}>
            <line x1={x - 22} y1={98} x2={x} y2={98} stroke={Ink.strokeHot} strokeWidth="2" />
            <SoftCard x={x} y={70} w={88} h={56} fill={wagonFills[index % wagonFills.length] ?? Ink.sky} rx={12} />
            <circle cx={x + 20} cy={136} r={10} fill={Ink.strokeHot} />
            <circle cx={x + 68} cy={136} r={10} fill={Ink.strokeHot} />
            <text x={x + 44} y={104} textAnchor="middle" fill={Ink.text} fontSize="16" fontFamily="inherit" fontWeight="700">
              {wagon}
            </text>
            <text x={x + 10} y={60} fill={Ink.muted} fontSize="11" fontFamily="inherit">
              {mode === "derive" ? "yapım" : mode === "inflect" ? "çekim" : "ek"}
            </text>
          </g>
        );
      })}
      {showVerbRoot ? (
        <g>
          <line x1="258" y1="98" x2="278" y2="98" stroke={Ink.strokeHot} strokeWidth="2" />
          <SoftCard x={278} y={70} w={70} h={56} fill={Ink.rose} rx={12} />
          <circle cx="294" cy="136" r="10" fill={Ink.strokeHot} />
          <circle cx="330" cy="136" r="10" fill={Ink.strokeHot} />
          <text x="313" y="104" textAnchor="middle" fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
            yaz
          </text>
          <text x="286" y="60" fill={Ink.muted} fontSize="11" fontFamily="inherit">
            fiil kökü
          </text>
        </g>
      ) : null}
      <SceneFoot y={172}>{note}</SceneFoot>
    </Stage>
  );
}

/** Paragraf piramidi, metin türleri, büyük harf kartları, noktalama ailesi. */
export function BookScene({ beat, caption }: { beat: number; caption: string }) {
  const text = caption.toLocaleLowerCase("tr-TR");
  const mode = /giriş|gelişme|sonuç|akış|bozan/.test(text)
    ? "flow"
    : /öykü|betim|açıklama|tartış|anlatım|örnekleme/.test(text)
      ? "mode"
      : /hikâ|anı|mektup|tiyatro|gezi/.test(text)
        ? "genre"
        : /büyük harf|özel ad|rakam|sayı|ekim|pazartesi|ahmet|ankara/.test(text)
          ? "caps"
          : /bitişik|ayrı yaz|bağlaç|soru eki|evde|mi'nin| de | da |,\s*ki|\bki\b|\bmi\b/.test(text)
            ? "spell"
            : "mark";

  if (mode === "flow") {
    return (
      <Stage scene="book">
        <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Paragraf piramidi
        </text>
        <polygon points="180,40 260,88 100,88" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
        <text x="156" y="72" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
          Giriş
        </text>
        <rect x="88" y="96" width="184" height="36" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
        <text x="148" y="120" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
          Gelişme
        </text>
        <rect x="64" y="140" width="232" height="32" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
        <text x="150" y="162" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
          Sonuç
        </text>
        {beat >= 5 ? (
          <text x="16" y="190" fill="#e11d48" fontSize="12" fontFamily="inherit" fontWeight="700">
            Akışı bozan cümle çıkarılır.
          </text>
        ) : (
          <text x="16" y="190" fill="#64748b" fontSize="12" fontFamily="inherit">
            Üç kat aynı konudadır.
          </text>
        )}
      </Stage>
    );
  }

  if (mode === "genre") {
    const genres = ["Hikâye", "Anı", "Mektup", "Tiyatro", "Gezi"];
    const shown = beat >= 5 ? 5 : beat >= 3 ? 3 : 2;
    return (
      <Stage scene="book">
        <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Metin türleri ağacı
        </text>
        <line x1="180" y1="48" x2="180" y2="78" stroke="#92400e" strokeWidth="4" />
        <circle cx="180" cy="40" r="14" fill="#86efac" stroke="#cbd5e1" strokeWidth="2" />
        {genres.slice(0, shown).map((name, index) => {
          const x = 36 + index * 64;
          return (
            <g key={name}>
              <line x1="180" y1="78" x2={x + 24} y2="110" stroke="#92400e" strokeWidth="2" />
              <rect x={x} y="112" width="56" height="48" rx="8" fill={index % 2 ? "#fde68a" : "#e0f2fe"} stroke="#cbd5e1" strokeWidth="2" />
              <text x={x + 28} y="142" textAnchor="middle" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
                {name}
              </text>
            </g>
          );
        })}
      </Stage>
    );
  }

  if (mode === "mode") {
    const modes = ["Öyküleme", "Betimleme", "Açıklama", "Tartışma"];
    const shown = beat >= 4 ? 4 : beat >= 2 ? 2 : 1;
    return (
      <Stage scene="book">
        <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Anlatım biçimleri
        </text>
        {modes.slice(0, shown).map((name, index) => (
          <g key={name}>
            <rect
              x={20 + (index % 2) * 170}
              y={48 + Math.floor(index / 2) * 64}
              width="150"
              height="50"
              rx="10"
              fill={index === 0 ? "#fde68a" : "#fff"}
              stroke="#cbd5e1"
              strokeWidth="2"
            />
            <text
              x={40 + (index % 2) * 170}
              y={78 + Math.floor(index / 2) * 64}
              fill="#0f172a"
              fontSize="14"
              fontFamily="inherit"
              fontWeight="700"
            >
              {name}
            </text>
          </g>
        ))}
      </Stage>
    );
  }

  if (mode === "caps") {
    const cards = [
      { big: "Ahmet", tip: "özel ad" },
      { big: "Ankara", tip: "yer adı" },
      { big: "Pazartesi", tip: "belirli gün" },
    ];
    const shown = beat >= 4 ? 3 : beat >= 2 ? 2 : 1;
    return (
      <Stage scene="book">
        <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Büyük harf kural kartları
        </text>
        {cards.slice(0, shown).map((card, index) => (
          <g key={card.big}>
            <rect x={20 + index * 112} y="52" width="100" height="88" rx="12" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x={40 + index * 112} y="96" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
              {card.big}
            </text>
            <text x={36 + index * 112} y="122" fill="#64748b" fontSize="12" fontFamily="inherit">
              {card.tip}
            </text>
          </g>
        ))}
        <text x="16" y="176" fill="#0f172a" fontSize="12" fontFamily="inherit">
          {beat >= 5 ? "Genel ay adı küçük kalır. Saat rakamla yazılır." : "Cümle başı ve özel ad büyür."}
        </text>
      </Stage>
    );
  }

  if (mode === "spell") {
    return (
      <Stage scene="book">
        <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          de · da · ki · mi yazımı
        </text>
        <rect x="24" y="52" width="148" height="72" rx="12" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
        <text x="52" y="84" fill="#0f172a" fontSize="18" fontFamily="inherit" fontWeight="700">
          evde
        </text>
        <text x="48" y="108" fill="#64748b" fontSize="12" fontFamily="inherit">
          bulunma eki bitişik
        </text>
        <rect x="188" y="52" width="148" height="72" rx="12" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
        <text x="220" y="84" fill="#0f172a" fontSize="18" fontFamily="inherit" fontWeight="700">
          o da
        </text>
        <text x="214" y="108" fill="#64748b" fontSize="12" fontFamily="inherit">
          bağlaç ayrı yazılır
        </text>
        <text x="24" y="160" fill="#0f172a" fontSize="13" fontFamily="inherit">
          {beat >= 4 ? "ki bağlacı ayrı, mi soru eki ayrıdır." : "Ek bitişik, bağlaç ayrıdır."}
        </text>
      </Stage>
    );
  }

  const marks = [
    { glyph: ".", name: "Nokta" },
    { glyph: ",", name: "Virgül" },
    { glyph: ";", name: "N. virgül" },
    { glyph: ":", name: "İki nokta" },
    { glyph: "…", name: "Üç nokta" },
    { glyph: "?", name: "Soru" },
    { glyph: "!", name: "Ünlem" },
    { glyph: "'", name: "Kesme" },
    { glyph: "«»", name: "Tırnak" },
  ];
  const focusMarks = /üç nokta|soru|ünlem|kesme|tırnak/.test(text)
    ? marks.slice(4)
    : marks.slice(0, 4);
  const shown = beat >= 5 ? focusMarks.length : beat >= 3 ? Math.min(3, focusMarks.length) : 2;

  return (
    <Stage scene="book">
      <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        Noktalama ailesi
      </text>
      {focusMarks.slice(0, shown).map((mark, index) => (
        <g key={mark.name}>
          <circle
            cx={48 + index * 72}
            cy="100"
            r="28"
            fill={index === Math.min(beat, shown - 1) ? "#fde68a" : "#fff"}
            stroke="#cbd5e1"
            strokeWidth="2"
          />
          <text x={48 + index * 72} y="106" textAnchor="middle" fill="#0f172a" fontSize="18" fontFamily="inherit" fontWeight="700">
            {mark.glyph}
          </text>
          <text x={48 + index * 72} y="148" textAnchor="middle" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
            {mark.name}
          </text>
        </g>
      ))}
      <text x="16" y="180" fill="#0369a1" fontSize="12" fontFamily="inherit">
        {beat >= 6 ? "Her işaretin ayrı görevi vardır." : "Nokta bitirir, virgül nefes aldırır."}
      </text>
    </Stage>
  );
}

/** Ana fikir pusulası: konu yönü ile yargı yönü. */
export function MainIdeaScene({ beat }: { beat: number }) {
  const lines = beat >= 1;
  const focus = beat === 2 || beat === 3 || beat === 5;
  const named = beat >= 3 && beat < 6;
  const question = beat === 6;
  const answer = beat === 7 || beat >= 8;
  const trap = beat >= 8;

  return (
    <Stage scene="main-idea">
      <text x="16" y="24" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Ana fikir pusulası
      </text>
      <circle cx="78" cy="108" r="44" fill="#fff7ed" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="78" y1="108" x2="78" y2="72" stroke="#e11d48" strokeWidth="3" />
      <polygon points="78,64 72,76 84,76" fill="#e11d48" />
      <text x="62" y="164" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
        yargı
      </text>
      <rect x="140" y="40" width="200" height="132" rx="12" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="156" y="64" fill="#64748b" fontSize="12" fontFamily="inherit">
        {question ? "Soru" : answer ? "Çözüm" : "Metin"}
      </text>
      {lines && !question && !answer ? (
        <>
          <rect
            x="156"
            y="76"
            width="168"
            height="28"
            rx="6"
            fill={focus || named ? "#fde68a" : "#f8fafc"}
            stroke="#cbd5e1"
            strokeWidth="2"
          />
          <text x="166" y="95" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
            {named ? "Ana fikir" : "Konu: orman"}
          </text>
          {beat >= 4 ? (
            <>
              <text x="166" y="124" fill={trap ? "#e11d48" : "#64748b"} fontSize="12" fontFamily="inherit">
                {trap ? "örnek ≠ ana fikir" : "ayrıntı: temiz hava"}
              </text>
              <text x="166" y="146" fill="#64748b" fontSize="12" fontFamily="inherit">
                ayrıntı: yuva
              </text>
            </>
          ) : null}
        </>
      ) : null}
      {question ? (
        <>
          <text x="156" y="96" fill="#0f172a" fontSize="13" fontFamily="inherit">
            Konu: ormanların yararı
          </text>
          <text x="156" y="120" fill="#0f172a" fontSize="13" fontFamily="inherit">
            Havayı temizler.
          </text>
          <text x="156" y="152" fill="#b45309" fontSize="13" fontFamily="inherit" fontWeight="700">
            Asıl yargı hangisi?
          </text>
        </>
      ) : null}
      {answer ? (
        <>
          <text x="156" y="92" fill="#64748b" fontSize="12" fontFamily="inherit">
            Konu yargı değildir.
          </text>
          <rect x="156" y="108" width="168" height="36" rx="8" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
          <text x="166" y="131" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
            Ormanları korumalıyız.
          </text>
        </>
      ) : null}
    </Stage>
  );
}

/** Ana fikri besleyen yardımcı fikir kutuları. */
export function SupportIdeaScene({ beat }: { beat: number }) {
  const showLeft = beat >= 1;
  const showRight = beat >= 2;
  const link = beat >= 3;
  const same = beat === 5;
  const question = beat === 6;
  const solved = beat === 7 || beat >= 8;

  return (
    <Stage scene="support-idea">
      <rect x="90" y="16" width="180" height="36" rx="8" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
      <text x="118" y="39" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Ana fikir
      </text>
      {showLeft && !question ? (
        <>
          <rect x="24" y="108" width="140" height="34" rx="8" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
          <text x="36" y="130" fill="#0f172a" fontSize="13" fontFamily="inherit">
            {solved ? "Gölge: yardımcı" : "Yardımcı fikir"}
          </text>
        </>
      ) : null}
      {showRight && !question ? (
        <>
          <rect x="196" y="108" width="140" height="34" rx="8" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
          <text x="208" y="130" fill="#0f172a" fontSize="13" fontFamily="inherit">
            {solved ? "Yuva: yardımcı" : "Yardımcı fikir"}
          </text>
        </>
      ) : null}
      {link && !question ? (
        <>
          <line x1="150" y1="52" x2="94" y2="108" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="210" y1="52" x2="266" y2="108" stroke="#cbd5e1" strokeWidth="2" />
        </>
      ) : null}
      {beat === 4 ? (
        <text x="24" y="168" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
          Yerine geçmez. Ana fikir tektir.
        </text>
      ) : null}
      {same ? (
        <text x="24" y="168" fill="#0369a1" fontSize="13" fontFamily="inherit">
          İkisi de aynı ana fikri besler.
        </text>
      ) : null}
      {question ? (
        <>
          <text x="36" y="96" fill="#0f172a" fontSize="14" fontFamily="inherit">
            Gölge verir.
          </text>
          <text x="36" y="120" fill="#0f172a" fontSize="14" fontFamily="inherit">
            Yuva olur.
          </text>
          <text x="36" y="156" fill="#b45309" fontSize="14" fontFamily="inherit" fontWeight="700">
            Bunlar hangi fikirdir?
          </text>
        </>
      ) : null}
      {beat >= 8 ? (
        <>
          <text x="24" y="168" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
            Yerine geçmez.
          </text>
          <text x="200" y="168" fill="#e11d48" fontSize="12" fontFamily="inherit">
            2. ana fikir
          </text>
          <line x1="200" y1="164" x2="268" y2="164" stroke="#e11d48" strokeWidth="2" />
        </>
      ) : null}
    </Stage>
  );
}

export function TurkishSceneArt({
  scene,
  beat,
  caption,
  captionTrail,
}: {
  scene: TurkishJuniorScene;
  beat: number;
  caption: string;
  captionTrail?: readonly string[];
}) {
  if (scene === "meaning") {
    return <MeaningScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  }
  if (scene === "word-tree") {
    return <WordTreeScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  }
  if (scene === "affix") return <AffixScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "book") return <BookScene beat={beat} caption={caption} />;
  if (scene === "support-idea") return <SupportIdeaScene beat={beat} />;
  return <MainIdeaScene beat={beat} />;
}
