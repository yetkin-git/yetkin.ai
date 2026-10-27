import type { ReactNode } from "react";
import {
  Ink,
  SceneFoot as Foot,
  SceneTitle as Title,
  SceneReveal,
  SoftCard,
  SoftFocus,
  SoftStage,
  stickyExponentParams,
  useJuniorSceneProps,
} from "@/components/junior/player/scene-ui";
import {
  detectDivisibilityBoard,
  numberOpsFactorSubject,
  positiveFactors,
  spokenFactorProduct,
  stickyNumberOpsMode,
  type DivisibilityBoardState,
} from "@/lib/junior/scene-sync";
import type { JuniorVectorScene } from "@/lib/junior/types";

/** Canlı cümle + önceki cümle izi — yapışkan sahne parametresi için. */
type SceneCaptionProps = {
  beat: number;
  caption?: string;
  /** 0..aktif cümle (dahil); yoksa yalnız canlı caption. */
  captionTrail?: readonly string[];
};

function captionTrailOrLive(caption: string, captionTrail?: readonly string[]): readonly string[] {
  if (captionTrail && captionTrail.length > 0) return captionTrail;
  return caption.trim().length > 0 ? [caption] : [];
}

export type MathJuniorScene =
  | "exponent"
  | "ops-order"
  | "distribute"
  | "number-ops"
  | "sets"
  | "number-line"
  | "decimal"
  | "ratio"
  | "algebra"
  | "chart"
  | "angles"
  | "area"
  | "circle"
  | "prism"
  | "fraction"
  | "fraction-sum";

export function isMathJuniorScene(scene: JuniorVectorScene): scene is MathJuniorScene {
  return (
    scene === "exponent" ||
    scene === "ops-order" ||
    scene === "distribute" ||
    scene === "number-ops" ||
    scene === "sets" ||
    scene === "number-line" ||
    scene === "decimal" ||
    scene === "ratio" ||
    scene === "algebra" ||
    scene === "chart" ||
    scene === "angles" ||
    scene === "area" ||
    scene === "circle" ||
    scene === "prism" ||
    scene === "fraction" ||
    scene === "fraction-sum"
  );
}

export function mathRecapName(scene: JuniorVectorScene): string | null {
  if (scene === "exponent") return "Üs";
  if (scene === "ops-order") return "Sıra";
  if (scene === "distribute") return "Dağılma";
  if (scene === "number-ops") return "Sayı";
  if (scene === "sets") return "Küme";
  if (scene === "number-line") return "Doğru";
  if (scene === "fraction") return "Kesir";
  if (scene === "fraction-sum") return "Kesir";
  if (scene === "decimal") return "Ondalık";
  if (scene === "ratio") return "Oran";
  if (scene === "algebra") return "Cebir";
  if (scene === "chart") return "Grafik";
  if (scene === "angles") return "Açı";
  if (scene === "area") return "Alan";
  if (scene === "circle") return "Çember";
  if (scene === "prism") return "Hacim";
  return null;
}

function Stage({ scene, children }: { scene: MathJuniorScene; children: ReactNode }) {
  return (
    <SoftStage scene={scene} gradientId="math-stage-bg">
      {children}
    </SoftStage>
  );
}

/**
 * Kâğıt katları. Adım 1 (beat 0) düz bir yaprak: 2³ = 8 yok.
 * 2 / 4 / 8 kat, cümle izinde sırayla açılır.
 */
function paperFoldLayers(beat: number, heard: string): number {
  if (beat <= 0) return 1;
  const text = heard.toLocaleLowerCase("tr-TR");
  if (/8 kat|2³|2\^3/u.test(text)) return 8;
  if (/4 kat/u.test(text)) return 4;
  if (/2 kat|2'ye katlı/u.test(text)) return 2;
  return 1;
}

/**
 * Canlı karatahta — sabit üslü ifade sahnesi (Zero Layout Shift + Sticky Scene).
 * Yeni üslü örnek (10², 5¹) gelene kadar son geçerli çizim ekranda kalır;
 * genel konuşmada 2³ varsayılanına geri sıçramaz.
 * Adım 1’de sonuç (2³ = 8) çizilmez; kat ve çarpım kutuları adımla açılır.
 */
export function ExponentScene({ beat, caption = "", captionTrail }: SceneCaptionProps) {
  const sceneProps = useJuniorSceneProps("exponent");
  const heard = captionTrailOrLive(caption, captionTrail).join(" ");
  const lower = caption.toLocaleLowerCase("tr-TR");
  const { base, exp, product } = stickyExponentParams(captionTrailOrLive(caption, captionTrail));
  const paperLayers = paperFoldLayers(beat, heard);
  const paperLabel =
    paperLayers >= 8 ? "8 kat" : paperLayers >= 4 ? "4 kat" : paperLayers >= 2 ? "2 kat" : "Kâğıt";
  /** Sonuç yazısı Adım 1’de kapalı. «2³ = 8» cümlesi gelince, sonraki üs örneğine geçilene kadar durur. */
  const showFoldEquation =
    beat > 0 && base === 2 && exp === 3 && /2³\s*=\s*8|2\^3\s*=\s*8/u.test(heard);
  const talkBase = /taban/u.test(lower);
  const talkExp = /(?:\büs\b|üstü|üstte\s+küçük|üss[uü])/u.test(lower);
  const talkExpand = /çarpı|yan yana|kez çarp|tekrarlı çarp|üst üste/u.test(lower);
  const talkResult = /sonuç|eder|demektir/u.test(lower);
  const trap = /tuzak|çarpı 3 san|2 çarpı 3|altı eder|\b6 eder\b/u.test(lower);
  const hasPower = /(\d+)\s*üss[uü]\s*(\d+)/u.test(lower) || /(\d+)\s*\^\s*(\d+)/u.test(caption);

  const hotBase = talkBase || (hasPower && !talkExp && !talkExpand && !talkResult && !trap) || beat <= 1;
  const hotExp = talkExp && !trap;
  const hotFactors = (talkExpand || beat >= 3) && !trap && !talkResult;
  const hotProduct = (talkResult || beat >= 5) && !trap;
  const hotTrap = trap || beat >= 7;
  /** Adım 1 taban; 2 üs; 3 çarpımlar; sonra eşitlik, sonuç, tuzak. Konum sabit. */
  const showBase = true;
  const showExponent = beat >= 1;
  const showFactors = beat >= 2;
  const showEquality = beat >= 3;
  const showProduct = beat >= 5;
  const showTrap = beat >= 7;
  /** Çarpım kutuları teker teker. Adım 1–2’de hiçbiri yok; sonra 1, 2 ve üs kadar. */
  const factorLimit = beat >= 4 ? exp : beat >= 3 ? Math.min(2, exp) : beat >= 2 ? 1 : 0;

  const factors = Array.from({ length: exp }, () => String(base)).join(" × ");
  const formula = !showEquality
    ? ""
    : showProduct
      ? `${base} üssü ${exp} = ${factors} = ${product}`
      : `${base} üssü ${exp} = ${factors}`;
  const gap = exp <= 3 ? 52 : exp === 4 ? 44 : 38;
  const box = exp <= 3 ? 42 : 34;
  const startX = 128;
  const resultX = Math.min(startX + exp * gap + 8, 300);

  return (
    <Stage scene="exponent">
      <SceneReveal show={showEquality}>
        <SoftCard x={12} y={10} w={336} h={28} fill={Ink.panel} rx={12} hot={hasPower || beat >= 2} />
        <text x="180" y="29" textAnchor="middle" fill={Ink.text} fontSize="13" fontFamily="inherit" fontWeight="700">
          {formula}
        </text>
      </SceneReveal>

      <SceneReveal show={showBase}>
        <SoftFocus active={hotBase}>
          <SoftCard x={20} y={52} w={58} h={58} fill={Ink.amber} hot={hotBase} />
          <text x="49" y={90} textAnchor="middle" fill={Ink.text} fontSize="30" fontFamily="inherit" fontWeight="700">
            {base}
          </text>
          <text x="49" y={128} textAnchor="middle" fill={Ink.accent} fontSize="12" fontFamily="inherit" fontWeight="700">
            Taban
          </text>
        </SoftFocus>
      </SceneReveal>

      <SceneReveal show={showExponent}>
        <SoftFocus active={hotExp}>
          <SoftCard x={78} y={44} w={28} h={28} fill={Ink.amberFill} rx={10} hot={hotExp} />
          <text x="92" y={64} textAnchor="middle" fill={Ink.amberInk} fontSize="16" fontFamily="inherit" fontWeight="700">
            {exp}
          </text>
          <text x="92" y={88} textAnchor="middle" fill={Ink.amberInk} fontSize="11" fontFamily="inherit" fontWeight="700">
            Üs
          </text>
        </SoftFocus>
      </SceneReveal>

      <g
        data-junior-hero={sceneProps.hero}
        data-junior-layers={paperLayers}
        data-junior-paper-fold={paperLayers}
        data-junior-fold-equation={showFoldEquation ? "on" : "off"}
      >
        {Array.from({ length: 8 }, (_, index) => (
          <SceneReveal key={`sheet-${index}`} show={index < paperLayers}>
            <rect
              x={128 + (index % 4) * 5}
              y={112 - Math.floor(index / 4) * 4}
              width={34}
              height={24}
              rx={3}
              fill={index % 2 === 0 ? "#fff7ed" : "#ffedd5"}
              stroke="#d6d3d1"
              strokeWidth="1.25"
            />
            {paperLayers > 1 ? (
              <line
                x1={128 + (index % 4) * 5 + 17}
                y1={114 - Math.floor(index / 4) * 4}
                x2={128 + (index % 4) * 5 + 17}
                y2={134 - Math.floor(index / 4) * 4}
                stroke="#fdba74"
                strokeWidth="1"
              />
            ) : null}
          </SceneReveal>
        ))}
        <text x="186" y="128" fill={Ink.text} fontSize="13" fontFamily="inherit" fontWeight="700">
          {paperLabel}
        </text>
        <SceneReveal show={showFoldEquation}>
          <text x="248" y="128" fill={Ink.greenInk} fontSize="13" fontFamily="inherit" fontWeight="700">
            2³ = 8
          </text>
        </SceneReveal>
      </g>

      <SceneReveal show={showFactors}>
      <g data-junior-factors={factorLimit}>
      {Array.from({ length: exp }, (_, index) => (
        <SceneReveal key={index} show={index < factorLimit}>
        <SoftFocus active={hotFactors}>
          <SoftCard x={startX + index * gap} y={58} w={box} h={box} fill={Ink.sky} rx={12} hot={hotFactors} />
          <line
            x1={startX + index * gap + box / 2}
            y1={62}
            x2={startX + index * gap + box / 2}
            y2={58 + box - 6}
            stroke="#fdba74"
            strokeWidth="1.25"
            data-junior-fold="kat"
          />
          <text
            x={startX + index * gap + box / 2}
            y={58 + box / 2 + 7}
            textAnchor="middle"
            fill={Ink.text}
            fontSize={exp <= 3 ? 20 : 16}
            fontFamily="inherit"
            fontWeight="700"
          >
            {base}
          </text>
          {index < exp - 1 && index + 1 < factorLimit ? (
            <text
              x={startX + index * gap + box + (gap - box) / 2}
              y={58 + box / 2 + 7}
              textAnchor="middle"
              fill={Ink.muted}
              fontSize="18"
              fontFamily="inherit"
              fontWeight="700"
            >
              ×
            </text>
          ) : null}
        </SoftFocus>
        </SceneReveal>
      ))}
      </g>
      </SceneReveal>

      <SceneReveal show={showProduct}>
        <SoftFocus active={hotProduct}>
          <SoftCard x={resultX} y={58} w={56} h={42} fill={Ink.green} rx={12} hot={hotProduct} />
          <text x={resultX + 28} y={86} textAnchor="middle" fill={Ink.greenInk} fontSize="18" fontFamily="inherit" fontWeight="700">
            = {product}
          </text>
        </SoftFocus>
      </SceneReveal>

      <SceneReveal show={showTrap}>
      <g
        opacity={hotTrap ? 1 : 0.16}
        data-junior-focus={hotTrap ? "on" : "off"}
      >
        <SoftCard x={16} y={148} w={120} h={36} fill={Ink.rose} rx={12} hot={hotTrap} />
        <text x="32" y={172} fill={Ink.roseInk} fontSize="15" fontFamily="inherit" fontWeight="700">
          {base} × {exp} = {base * exp}
        </text>
        <line x1="28" y1="164" x2="124" y2="172" stroke={Ink.roseInk} strokeWidth="2.5" strokeLinecap="round" />
        <SoftCard x={148} y={148} w={160} h={36} fill={Ink.green} rx={12} hot={hotTrap} />
        <text x="162" y={172} fill={Ink.greenInk} fontSize="15" fontFamily="inherit" fontWeight="700">
          {`Doğru: ${base}^${exp} = ${product}`}
        </text>
      </g>
      </SceneReveal>

      <SceneReveal show={showFactors}>
        <text
          x="18"
          y="192"
          fill={Ink.muted}
          fontSize="11"
          fontFamily="inherit"
          fontWeight="500"
          opacity={hotTrap ? 0.2 : 1}
        >
          Üs, tabanı kaç kez çarpacağını söyler.
        </text>
      </SceneReveal>
    </Stage>
  );
}

export function OpsOrderScene({ beat, caption = "", captionTrail }: SceneCaptionProps) {
  const trailText = captionTrailOrLive(caption, captionTrail).join(" ");
  const exprMatch = /(\d+)\s*\+\s*(\d+)\s*[×x*·]\s*(\d+)/u.exec(caption) ?? /(\d+)\s*\+\s*(\d+)\s*[×x*·]\s*(\d+)/u.exec(trailText);
  const a = exprMatch ? Number(exprMatch[1]) : 3;
  const b = exprMatch ? Number(exprMatch[2]) : 4;
  const c = exprMatch ? Number(exprMatch[3]) : 2;
  const mulResult = b * c;
  const rightResult = a + mulResult;
  const wrongResult = (a + b) * c;
  const steps = ["( )", "üs", "× ÷", "+ −"];
  const lower = caption.toLocaleLowerCase("tr-TR");
  const active = /parantez/.test(lower)
    ? 0
    : /\büs\b|kuvvet/.test(lower)
      ? 1
      : /çarp|böl/.test(lower)
        ? 2
        : /topla|çıkar/.test(lower)
          ? 3
          : Math.min(3, Math.max(0, beat - 1));
  const wrong = beat >= 7 || /tuzak|yanlış|değil/.test(lower);
  return (
    <Stage scene="ops-order">
      <Title>İşlem önceliği</Title>
      {steps.map((label, index) => (
        <g key={label}>
          <SoftCard
            x={22 + index * 84}
            y={48}
            w={74}
            h={46}
            fill={index === active ? Ink.amber : Ink.white}
            hot={index === active}
            rx={14}
          />
          <text x={59 + index * 84} y={78} textAnchor="middle" fill={Ink.text} fontSize="16" fontFamily="inherit" fontWeight="700">
            {label}
          </text>
        </g>
      ))}
      <text x="22" y={128} fill={Ink.text} fontSize="18" fontFamily="inherit" fontWeight="700">
        {`${a} + ${b} × ${c} = ${a} + ${mulResult} = ${rightResult}`}
      </text>
      {wrong ? (
        <g>
          <text x="22" y={164} fill={Ink.roseInk} fontSize="15" fontFamily="inherit" fontWeight="700">
            {`${wrongResult} değil`}
          </text>
          <text x="118" y={164} fill={Ink.greenInk} fontSize="15" fontFamily="inherit" fontWeight="700">
            {`${a} + ${mulResult} = ${rightResult}`}
          </text>
        </g>
      ) : (
        <Foot y={164} fill={Ink.accent}>
          {beat >= 4 ? "Önce çarp, sonra topla." : "Önce parantez ve üs."}
        </Foot>
      )}
    </Stage>
  );
}

export function DistributeScene({ beat, caption = "", captionTrail }: SceneCaptionProps) {
  const trailText = captionTrailOrLive(caption, captionTrail).join(" ");
  const distMatch =
    /(\d+)\s*[×x*·]\s*\(\s*(\d+)\s*\+\s*(\d+)\s*\)/u.exec(caption) ??
    /(\d+)\s*[×x*·]\s*\(\s*(\d+)\s*\+\s*(\d+)\s*\)/u.exec(trailText);
  const factor = distMatch ? Number(distMatch[1]) : 6;
  const left = distMatch ? Number(distMatch[2]) : 5;
  const right = distMatch ? Number(distMatch[3]) : 3;
  const total = factor * (left + right);
  const open = beat >= 3 || /dağıl|ortak çarpan/.test(caption.toLocaleLowerCase("tr-TR"));
  return (
    <Stage scene="distribute">
      <Title>Ortak çarpan ve dağılma</Title>
      <SoftCard x={22} y={52} w={50} h={50} fill={Ink.amber} hot />
      <text x="47" y={86} textAnchor="middle" fill={Ink.text} fontSize="22" fontFamily="inherit" fontWeight="700">
        {factor}
      </text>
      <text x="86" y={86} fill={Ink.muted} fontSize="22" fontFamily="inherit" fontWeight="700">
        ×
      </text>
      <SoftCard x={108} y={46} w={124} h={62} fill={Ink.sky} hot={open} />
      <text x="170" y={86} textAnchor="middle" fill={Ink.text} fontSize="18" fontFamily="inherit" fontWeight="700">
        {`${left} + ${right}`}
      </text>
      <text x={248} y={72} fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700" opacity={open ? 1 : 0.45}>
        {`${factor}×${left} + ${factor}×${right}`}
      </text>
      <SoftCard x={248} y={84} w={88} h={28} fill={Ink.green} rx={10} hot={open} />
      <text x={260} y={104} fill={Ink.greenInk} fontSize="14" fontFamily="inherit" fontWeight="700">
        {`= ${total}`}
      </text>
      <Foot>{beat >= 6 ? "Ortak çarpan parantezin önüne çıkar." : "Çarpım, toplamanın üzerine dağılır."}</Foot>
    </Stage>
  );
}

function FactorChips({ beat, factors, subject }: { beat: number; factors: readonly number[]; subject: number }) {
  const twoRows = factors.length > 6;
  const columns = twoRows ? Math.ceil(factors.length / 2) : factors.length;
  const pitch = twoRows ? 70 : 52;
  const radius = twoRows ? 16 : 20;
  const origin = 180 - ((columns - 1) * pitch) / 2;
  return (
    <>
      {factors.map((n, index) => {
        const column = twoRows ? index % columns : index;
        const row = twoRows ? Math.floor(index / columns) : 0;
        const cx = origin + column * pitch;
        const cy = twoRows ? 74 + row * 46 : 96;
        return (
          <g key={`${n}-${index}`}>
            <circle
              cx={cx}
              cy={cy}
              r={radius}
              fill={n === subject || beat >= index ? Ink.amber : Ink.white}
              stroke={Ink.stroke}
              strokeWidth="1.5"
            />
            <text
              x={cx}
              y={cy + 5}
              textAnchor="middle"
              fill={Ink.text}
              fontSize={twoRows ? "13" : "14"}
              fontFamily="inherit"
              fontWeight="700"
            >
              {n}
            </text>
          </g>
        );
      })}
    </>
  );
}

export function DivisibilityBoard({
  state,
  product,
}: {
  state: DivisibilityBoardState;
  product: { left: number; right: number; product: number } | null;
}) {
  if (state.kind === "last-digit") {
    const cards = [
      { num: 24, tens: "2", ones: "4", bracket: "2[4]", note: "Çift rakam" },
      { num: 15, tens: "1", ones: "5", bracket: "1[5]", note: "Sonu 0 veya 5" },
      { num: 30, tens: "3", ones: "0", bracket: "3[0]", note: "Sonu 0" },
    ] as const;
    const allBadges = ["✓ 2'ye Bölünür", "✓ 5'e Bölünür", "✓ 10'a Bölünür"] as const;
    return (
      <g data-junior-divisibility-board="last-digit" data-active-number={state.subject}>
        {cards.map((card, idx) => {
          const active = card.num === state.subject;
          const x = 18 + idx * 110;
          return (
            <g key={card.num}>
              <SoftCard
                x={x}
                y={44}
                w={102}
                h={70}
                fill={active ? Ink.skyFill : Ink.white}
                hot={active}
                rx={12}
              />
              {/* Onlar basamağı */}
              <text
                x={x + 28}
                y={82}
                textAnchor="middle"
                fill={Ink.text}
                fontSize="22"
                fontFamily="inherit"
                fontWeight="800"
              >
                {card.tens}
              </text>
              {/* Neon Birler Basamağı Kutusu */}
              <rect
                x={x + 46}
                y={54}
                width="38"
                height="36"
                rx="8"
                fill={active ? "#ecfeff" : Ink.amber}
                stroke={active ? "#06b6d4" : Ink.strokeHot}
                strokeWidth={active ? "2.5" : "1.8"}
                data-divisibility-ones={card.ones}
              />
              <text
                x={x + 65}
                y={79}
                textAnchor="middle"
                fill={active ? "#0e7490" : Ink.text}
                fontSize="20"
                fontFamily="inherit"
                fontWeight="800"
              >
                {card.ones}
              </text>
              <text
                x={x + 51}
                y={105}
                textAnchor="middle"
                fill={active ? Ink.accent : Ink.muted}
                fontSize="10"
                fontFamily="inherit"
                fontWeight="700"
              >
                {`${card.bracket} · ${card.note}`}
              </text>
            </g>
          );
        })}
        {allBadges.map((badge, idx) => {
          const lit = state.badges.includes(badge);
          const bx = 18 + idx * 110;
          return (
            <g key={badge}>
              <SoftCard
                x={bx}
                y={122}
                w={102}
                h={26}
                fill={lit ? Ink.green : Ink.white}
                hot={lit}
                rx={8}
              />
              <text
                x={bx + 51}
                y={139}
                textAnchor="middle"
                fill={lit ? Ink.greenInk : Ink.muted}
                fontSize="10.5"
                fontFamily="inherit"
                fontWeight="700"
              >
                {badge}
              </text>
            </g>
          );
        })}
        <Foot y={168} fill={Ink.accent}>
          {product
            ? `${product.left} × ${product.right} = ${product.product}`
            : `Son basamak: ${state.bracketed} → ${state.badges.join(" · ")}`}
        </Foot>
      </g>
    );
  }

  const isNine = state.rule === 9;
  const d1 = isNine ? "1" : "2";
  const d2 = isNine ? "8" : "4";
  const sum = isNine ? "9" : "6";
  const sumBadges = ["✓ 3'e Bölünür", "✓ 9'a Bölünür"] as const;

  return (
    <g data-junior-divisibility-board="digit-sum" data-active-number={state.subject}>
      {/* Rakam toplama kutuları ve toplama oku */}
      <SoftCard x={22} y={48} w={48} h={48} fill={Ink.amber} hot rx={12} />
      <text x={46} y={79} textAnchor="middle" fill={Ink.text} fontSize="22" fontFamily="inherit" fontWeight="800">
        {d1}
      </text>
      <text x={82} y={78} textAnchor="middle" fill={Ink.accent} fontSize="20" fontFamily="inherit" fontWeight="800">
        +
      </text>
      <SoftCard x={94} y={48} w={48} h={48} fill={Ink.amber} hot rx={12} />
      <text x={118} y={79} textAnchor="middle" fill={Ink.text} fontSize="22" fontFamily="inherit" fontWeight="800">
        {d2}
      </text>
      {/* Toplama oku */}
      <line x1={150} y1={72} x2={182} y2={72} stroke={Ink.accent} strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="182,67 192,72 182,77" fill={Ink.accent} />
      <SoftCard x={198} y={48} w={54} h={48} fill={Ink.green} hot rx={12} />
      <text x={225} y={79} textAnchor="middle" fill={Ink.greenInk} fontSize="22" fontFamily="inherit" fontWeight="800">
        {sum}
      </text>
      <text x={264} y={68} fill={Ink.text} fontSize="12" fontFamily="inherit" fontWeight="800">
        2 + 4 = 6
      </text>
      <text x={264} y={86} fill={Ink.muted} fontSize="10.5" fontFamily="inherit" fontWeight="700">
        {isNine ? "1 + 8 = 9 (9'un katı)" : "6, 3'ün katıdır!"}
      </text>
      {sumBadges.map((badge, idx) => {
        const lit = state.badges.includes(badge);
        const bx = 22 + idx * 156;
        return (
          <g key={badge}>
            <SoftCard x={bx} y={110} w={144} h={30} fill={lit ? Ink.green : Ink.white} hot={lit} rx={10} />
            <text
              x={bx + 72}
              y={129}
              textAnchor="middle"
              fill={lit ? Ink.greenInk : Ink.muted}
              fontSize="12"
              fontFamily="inherit"
              fontWeight="700"
            >
              {badge}
            </text>
          </g>
        );
      })}
      <Foot y={164} fill={Ink.accent}>
        {product
          ? `${product.left} × ${product.right} = ${product.product}`
          : `Rakamları topla: ${state.sumExpression} → ${state.badges.join(" · ")}`}
      </Foot>
    </g>
  );
}

export function NumberOpsScene({ beat, caption = "", captionTrail }: SceneCaptionProps) {
  const trail = captionTrailOrLive(caption, captionTrail);
  const mode = stickyNumberOpsMode(trail);
  const subject = numberOpsFactorSubject(trail);
  const factors = positiveFactors(subject);
  const product = spokenFactorProduct(caption);
  const divisibility = detectDivisibilityBoard(caption);
  const title =
    mode === "prime"
      ? "Asal sayılar"
      : mode === "gcd"
        ? "Ortak bölen ve kat"
        : mode === "factor"
          ? divisibility
            ? "Bölünebilme tahtası"
            : "Çarpan ve kat"
          : "Doğal sayı problemi";
  return (
    <Stage scene="number-ops">
      <Title>{title}</Title>
      {mode === "problem" ? (
        <>
          {[0, 1, 2, 3].map((row) => (
            <g key={row}>
              {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                <rect
                  key={col}
                  x={40 + col * 28}
                  y={52 + row * 26}
                  width="22"
                  height="20"
                  rx="6"
                  fill={beat >= 3 ? Ink.skyFill : Ink.white}
                  stroke={Ink.stroke}
                  strokeWidth="1.5"
                />
              ))}
            </g>
          ))}
          <text x="40" y={176} fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
            {beat >= 5 ? "4 × 7 = 28" : "4 sıra × 7 kitap"}
          </text>
        </>
      ) : null}
      {mode === "factor" ? (
        divisibility ? (
          <DivisibilityBoard state={divisibility} product={product} />
        ) : (
          <>
            <FactorChips beat={beat} factors={factors} subject={subject} />
            <Foot y={156} fill={Ink.accent}>
              {product
                ? `${product.left} × ${product.right} = ${product.product}`
                : `${subject} sayısının çarpanları kalansız böler.`}
            </Foot>
          </>
        )
      ) : null}
      {mode === "prime" || mode === "gcd" ? (
        <Foot>çizim yok</Foot>
      ) : null}
    </Stage>
  );
}

export function SetsScene({ beat }: { beat: number }) {
  return (
    <Stage scene="sets">
      <Title>Kümeler</Title>
      <ellipse cx="120" cy="108" rx="70" ry="50" fill={Ink.sky} stroke={Ink.strokeHot} strokeWidth="2" />
      <ellipse cx="220" cy="108" rx="70" ry="50" fill={Ink.amber} stroke={Ink.strokeHot} strokeWidth="2" fillOpacity="0.7" />
      <text x="90" y={98} fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
        A
      </text>
      <text x="230" y={98} fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
        B
      </text>
      {beat >= 3 ? (
        <text x="156" y={116} fill={Ink.accent} fontSize="13" fontFamily="inherit" fontWeight="700">
          ortak
        </text>
      ) : null}
      <Foot y={180}>{beat >= 6 ? "Ortak eleman birleşimde bir kez yazılır." : "Eleman bellidir. Boş küme boştur."}</Foot>
    </Stage>
  );
}

export function NumberLineScene(_props: SceneCaptionProps) {
  return (
    <Stage scene="number-line">
      <Title>Sayı doğrusu</Title>
      <Foot>çizim yok</Foot>
    </Stage>
  );
}

export function FractionPieScene(_props: SceneCaptionProps) {
  return (
    <Stage scene="fraction">
      <Title>Kesir</Title>
      <Foot>çizim yok</Foot>
    </Stage>
  );
}

export function FractionBarsScene(_props: SceneCaptionProps) {
  return (
    <Stage scene="fraction-sum">
      <Title>Kesir</Title>
      <Foot>çizim yok</Foot>
    </Stage>
  );
}

export function DecimalScene({ beat: _beat, caption = "", captionTrail }: SceneCaptionProps) {
  const trail = captionTrailOrLive(caption, captionTrail);
  const joined = trail.join(" ").toLocaleLowerCase("tr-TR");
  const live = caption.toLocaleLowerCase("tr-TR");

  const isOpsMode = /2,40|1,35|3,75|37,5|4,8|2,4|alt alta|tahmin|yuvarla/.test(joined);
  const isRepeatingMode = /devirli|0,333|1\/3|0,25|1\/4|5\/10|25\/100/.test(joined);

  if (isOpsMode) {
    const isMul10 = /37,5|10 ile çarp|sağa kay/.test(live);
    const isDiv2 = /4,8|2,4|ikiye böl|böl/.test(live);
    return (
      <Stage scene="decimal">
        <Title>Ondalık gösterimlerle işlem ve tahmin</Title>
        <SoftCard x={18} y={44} w={164} h={96} fill={Ink.white} hot={!isMul10 && !isDiv2} rx={12} />
        <text x="32" y={66} fill={Ink.muted} fontSize="11" fontFamily="inherit" fontWeight="700">
          Virgüller alt alta:
        </text>
        <text x="52" y={88} fill={Ink.text} fontSize="16" fontFamily="inherit" fontWeight="700">
          {"  2 , 40"}
        </text>
        <text x="36" y={108} fill={Ink.text} fontSize="16" fontFamily="inherit" fontWeight="700">
          {"+ 1 , 35"}
        </text>
        <line x1="34" y1="114" x2="148" y2="114" stroke={Ink.strokeHot} strokeWidth="2" />
        <text x="52" y={132} fill={Ink.greenInk} fontSize="17" fontFamily="inherit" fontWeight="700">
          {"  3 , 75"}
        </text>

        <SoftCard x={194} y={44} w={148} h={44} fill={isMul10 ? Ink.amber : Ink.sky} hot={isMul10} rx={10} />
        <text x="268" y={63} textAnchor="middle" fill={Ink.text} fontSize="11" fontFamily="inherit" fontWeight="700">
          10 ile çarpım (virgül sağa)
        </text>
        <text x="268" y={80} textAnchor="middle" fill={Ink.accent} fontSize="13.5" fontFamily="inherit" fontWeight="700">
          3,75 × 10 = 37,5
        </text>

        <SoftCard x={194} y={96} w={148} h={44} fill={isDiv2 ? Ink.amber : Ink.green} hot={isDiv2} rx={10} />
        <text x="268" y={115} textAnchor="middle" fill={Ink.text} fontSize="11" fontFamily="inherit" fontWeight="700">
          Bölme ve Tahmin
        </text>
        <text x="268" y={132} textAnchor="middle" fill={Ink.greenInk} fontSize="13.5" fontFamily="inherit" fontWeight="700">
          4,8 ÷ 2 = 2,4
        </text>

        <Foot y={176} fill={Ink.accent}>
          {isMul10 ? "10 ile çarpınca virgül 1 basamak sağa kayar." : "Toplamada virgüller aynı hizada durur."}
        </Foot>
      </Stage>
    );
  }

  if (isRepeatingMode) {
    const focusThird = /1\/3|0,333|devirli|üçte bir/.test(live);
    const focusQuarter = /1\/4|0,25|25\/100|dörtte bir/.test(live);
    return (
      <Stage scene="decimal">
        <Title>Kesir, ondalık ve devirli gösterim</Title>
        {[
          { frac: "1/2 = 5/10", dec: "= 0,5", note: "Sonlu ondalık", hot: !focusThird && !focusQuarter },
          { frac: "1/4 = 25/100", dec: "= 0,25", note: "Payda 100", hot: focusQuarter },
          { frac: "1/3 = 1 ÷ 3", dec: "= 0,333… (0,3̄)", note: "Devirli ondalık", hot: focusThird },
        ].map((row, idx) => (
          <g key={row.frac}>
            <SoftCard
              x={18}
              y={42 + idx * 40}
              w={324}
              h={34}
              fill={row.hot ? Ink.amber : Ink.white}
              hot={row.hot}
              rx={10}
            />
            <text x="30" y={64 + idx * 40} fill={Ink.text} fontSize="13.5" fontFamily="inherit" fontWeight="700">
              {row.frac}
            </text>
            <text x="150" y={64 + idx * 40} fill={Ink.greenInk} fontSize="14" fontFamily="inherit" fontWeight="700">
              {row.dec}
            </text>
            <text x="262" y={64 + idx * 40} fill={Ink.muted} fontSize="11" fontFamily="inherit" fontWeight="600">
              {row.note}
            </text>
          </g>
        ))}
        <Foot y={180} fill={Ink.accent}>
          {focusThird ? "Tekrar eden rakamın üstüne devir çizgisi konur." : "Payda 10 veya 100 yapılınca ondalık doğrudan yazılır."}
        </Foot>
      </Stage>
    );
  }

  // jr_06_mat-4: Basamak değeri (3,25) ve karşılaştırma (0,4 = 0,40 > 0,35, 12,50 = 12,5)
  const compareFocus = /0,4|0,35|0,40|12,50|12,5|büyük|karşılaştır/.test(live);
  const decMatch = /(\d+),(\d+)/u.exec(caption) ?? /(\d+),(\d+)/u.exec(joined);
  const wholePart = decMatch?.[1] ?? "3";
  const fracPart = decMatch?.[2] ?? "25";
  const tenths = fracPart[0] ?? "2";
  const hundredths = fracPart[1] ?? "";

  return (
    <Stage scene="decimal">
      <Title>Ondalık gösterim ve basamak değeri</Title>
      <SoftCard x={24} y={48} w={64} h={54} fill={Ink.amber} hot={!compareFocus} />
      <text x="56" y={84} textAnchor="middle" fill={Ink.text} fontSize="26" fontFamily="inherit" fontWeight="700">
        {wholePart}
      </text>
      <text x="98" y={88} fill={Ink.text} fontSize="32" fontFamily="inherit" fontWeight="700">
        ,
      </text>
      <SoftCard x={114} y={48} w={56} h={54} fill={Ink.sky} hot={!compareFocus} />
      <text x="142" y={84} textAnchor="middle" fill={Ink.text} fontSize="26" fontFamily="inherit" fontWeight="700">
        {tenths}
      </text>
      {hundredths ? (
        <>
          <SoftCard x={178} y={48} w={56} h={54} fill={Ink.green} hot={!compareFocus} />
          <text x="206" y={84} textAnchor="middle" fill={Ink.text} fontSize="26" fontFamily="inherit" fontWeight="700">
            {hundredths}
          </text>
        </>
      ) : null}
      <text x="56" y={120} textAnchor="middle" fill={Ink.accent} fontSize="11" fontFamily="inherit" fontWeight="700">
        Tam
      </text>
      <text x="142" y={120} textAnchor="middle" fill={Ink.accent} fontSize="11" fontFamily="inherit" fontWeight="700">
        Onda bir
      </text>
      {hundredths ? (
        <text x="206" y={120} textAnchor="middle" fill={Ink.accent} fontSize="11" fontFamily="inherit" fontWeight="700">
          Yüzde bir
        </text>
      ) : null}
      <SoftCard x={244} y={48} w={102} h={54} fill={compareFocus ? Ink.amber : Ink.panel} rx={12} hot={compareFocus} />
      <text x="295" y={72} textAnchor="middle" fill={Ink.text} fontSize="12" fontFamily="inherit" fontWeight="700">
        0,4 = 0,40
      </text>
      <text x="295" y={92} textAnchor="middle" fill={Ink.greenInk} fontSize="12.5" fontFamily="inherit" fontWeight="700">
        0,40 &gt; 0,35
      </text>
      <Foot y={168}>
        {compareFocus
          ? "0,4 = 0,40 olduğu için 0,35'ten büyüktür · 12,50 = 12,5"
          : `${wholePart},${fracPart} · Virgülün solu tam, sağı onda bir ve yüzde birdir.`}
      </Foot>
    </Stage>
  );
}

export function RatioScene({ beat, caption = "", captionTrail }: SceneCaptionProps) {
  const trail = captionTrailOrLive(caption, captionTrail).join(" ");
  const ratioMatch = /(\d+)\s*[:/]\s*(\d+)/u.exec(caption) ?? /(\d+)\s*[:/]\s*(\d+)/u.exec(trail);
  const parsedLeft = ratioMatch ? Math.min(6, Math.max(1, Number(ratioMatch[1]))) : 2;
  const parsedRight = ratioMatch ? Math.min(6, Math.max(1, Number(ratioMatch[2]))) : 3;
  const simplified = beat >= 4 || /sadeleş|en sade|2\s*[:/]\s*3/.test(caption.toLocaleLowerCase("tr-TR"));
  const left = parsedLeft;
  const right = parsedRight;
  return (
    <Stage scene="ratio">
      <Title>Oran</Title>
      {Array.from({ length: left }, (_, i) => (
        <circle
          key={`l${i}`}
          cx={44 + i * Math.min(34, Math.floor(110 / left))}
          cy="86"
          r="12"
          fill={Ink.skyFill}
          stroke={simplified ? Ink.accent : Ink.stroke}
          strokeWidth={simplified ? 2.5 : 1.5}
        />
      ))}
      <text x="170" y={94} fill={Ink.muted} fontSize="28" fontFamily="inherit" fontWeight="700">
        :
      </text>
      {Array.from({ length: right }, (_, i) => (
        <circle
          key={`r${i}`}
          cx={198 + i * Math.min(30, Math.floor(130 / right))}
          cy="86"
          r="12"
          fill={Ink.amberFill}
          stroke={simplified ? Ink.accent : Ink.stroke}
          strokeWidth={simplified ? 2.5 : 1.5}
        />
      ))}
      <SoftCard x={16} y={124} w={144} h={34} fill={Ink.panel} rx={12} hot={simplified} />
      <text x="88" y={146} textAnchor="middle" fill={Ink.text} fontSize="15" fontFamily="inherit" fontWeight="700">
        {`${left} : ${right} = ${left * 2} : ${right * 2}`}
      </text>
      <Foot y={178} fill={Ink.accent}>
        {beat >= 5 ? "Sadeleşince sıra korunur." : "Oran sırayı korur."}
      </Foot>
    </Stage>
  );
}

export function AlgebraScene({ beat, caption = "", captionTrail }: SceneCaptionProps) {
  const trail = captionTrailOrLive(caption, captionTrail);
  const joined = trail.join(" ").toLocaleLowerCase("tr-TR");
  const live = caption.toLocaleLowerCase("tr-TR");

  const isPatternMode = /örüntü|adım sayısı|4, 7, 10|3, 6, 9|2, 4, 6/.test(joined);
  const isAlgorithmMode = /algoritma|girdi|çıktı|2x \+ 6|x yerine 4|x yerine 5/.test(joined);

  if (isPatternMode) {
    const is369 = /3, 6, 9|üçer/.test(live);
    const is246 = /2, 4, 6|ikişer/.test(live);
    const terms = is369 ? [3, 6, 9, 12, 15] : is246 ? [2, 4, 6, 8, 10] : [4, 7, 10, 13, 16];
    const stepDiff = is369 ? "+3" : is246 ? "+2" : "+3";
    const ruleLabel = is369 ? "Kural: 3n (3 × adım)" : is246 ? "Kural: 2n (2 × adım)" : "Kural: +3 artış (5. adım = 16)";
    return (
      <Stage scene="algebra">
        <Title>Sayı ve şekil örüntüleri</Title>
        {terms.map((val, idx) => (
          <g key={`${val}-${idx}`}>
            <SoftCard
              x={18 + idx * 66}
              y={48}
              w={54}
              h={56}
              fill={idx === 4 ? Ink.green : idx === beat % 5 ? Ink.amber : Ink.white}
              hot={idx === 4 || idx === beat % 5}
              rx={10}
            />
            <text x={45 + idx * 66} y={66} textAnchor="middle" fill={Ink.muted} fontSize="9.5" fontFamily="inherit" fontWeight="700">
              {`${idx + 1}. adım`}
            </text>
            <text x={45 + idx * 66} y={92} textAnchor="middle" fill={Ink.text} fontSize="18" fontFamily="inherit" fontWeight="700">
              {val}
            </text>
            {idx < 4 ? (
              <text x={78 + idx * 66} y={120} textAnchor="middle" fill={Ink.accent} fontSize="11" fontFamily="inherit" fontWeight="700">
                {stepDiff}
              </text>
            ) : null}
          </g>
        ))}
        <SoftCard x={18} y={132} w={320} h={32} fill={Ink.panel} rx={10} />
        <text x="178" y={153} textAnchor="middle" fill={Ink.text} fontSize="13" fontFamily="inherit" fontWeight="700">
          {ruleLabel}
        </text>
        <Foot y={182} fill={Ink.accent}>
          Sabit artış kuralı her adımda aynı kalır.
        </Foot>
      </Stage>
    );
  }

  if (isAlgorithmMode) {
    const xVal = /x yerine 5|5 koy|16/.test(live) ? 5 : 4;
    const midVal = 2 * xVal;
    const outVal = midVal + 6;
    return (
      <Stage scene="algebra">
        <Title>Cebirsel ifadede algoritma (Girdi → Kural → Çıktı)</Title>
        <SoftCard x={16} y={48} w={74} h={52} fill={Ink.sky} hot rx={10} />
        <text x="53" y={68} textAnchor="middle" fill={Ink.muted} fontSize="10" fontFamily="inherit" fontWeight="700">
          Girdi (x)
        </text>
        <text x="53" y={88} textAnchor="middle" fill={Ink.text} fontSize="17" fontFamily="inherit" fontWeight="700">
          {`x = ${xVal}`}
        </text>
        <text x="98" y={78} fill={Ink.muted} fontSize="16" fontFamily="inherit" fontWeight="700">
          →
        </text>
        <SoftCard x={112} y={48} w={112} h={52} fill={Ink.amber} hot rx={10} />
        <text x="168" y={68} textAnchor="middle" fill={Ink.muted} fontSize="10" fontFamily="inherit" fontWeight="700">
          İşlem Sırası
        </text>
        <text x="168" y={88} textAnchor="middle" fill={Ink.text} fontSize="13.5" fontFamily="inherit" fontWeight="700">
          {`2×${xVal} = ${midVal} → +6`}
        </text>
        <text x="232" y={78} fill={Ink.muted} fontSize="16" fontFamily="inherit" fontWeight="700">
          →
        </text>
        <SoftCard x={246} y={48} w={98} h={52} fill={Ink.green} hot rx={10} />
        <text x="295" y={68} textAnchor="middle" fill={Ink.greenInk} fontSize="10" fontFamily="inherit" fontWeight="700">
          Çıktı (2x + 6)
        </text>
        <text x="295" y={88} textAnchor="middle" fill={Ink.greenInk} fontSize="18" fontFamily="inherit" fontWeight="700">
          {`= ${outVal}`}
        </text>
        <SoftCard x={16} y={114} w={328} h={34} fill={Ink.panel} rx={10} />
        <text x="180" y={136} textAnchor="middle" fill={Ink.text} fontSize="12.5" fontFamily="inherit" fontWeight="700">
          x = 4 için 2(4) + 6 = 14 · x = 5 için 2(5) + 6 = 16
        </text>
        <Foot y={176} fill={Ink.accent}>
          Önce katsayı ile çarpılır (2x), sonra sabit terim (+6) eklenir.
        </Foot>
      </Stage>
    );
  }

  const hotSum = beat >= 3;
  const trap = beat >= 7 || /9x|tuzak|birleşmez/.test(live);
  const is4x10 = /4x \+ 10|kırtasiye/.test(live);
  const leftTerm = is4x10 ? "4x" : "3x";
  const rightTerm = is4x10 ? "10" : "2x";
  const resultTerm = is4x10 ? "4x+10" : "5x";
  return (
    <Stage scene="algebra">
      <Title>Cebirsel ifadeler</Title>
      <SoftCard x={28} y={52} w={70} h={56} fill={Ink.amber} hot={!hotSum} />
      <text x="63" y={88} textAnchor="middle" fill={Ink.text} fontSize="22" fontFamily="inherit" fontWeight="700">
        {leftTerm}
      </text>
      <text x="116" y={88} fill={Ink.muted} fontSize="24" fontFamily="inherit" fontWeight="700">
        +
      </text>
      <SoftCard x={140} y={52} w={70} h={56} fill={is4x10 ? Ink.sky : Ink.amber} hot={!hotSum} />
      <text x="175" y={88} textAnchor="middle" fill={Ink.text} fontSize="22" fontFamily="inherit" fontWeight="700">
        {rightTerm}
      </text>
      <SoftFocus active={hotSum}>
        <text x="230" y={72} fill={Ink.muted} fontSize="18" fontFamily="inherit" fontWeight="700">
          =
        </text>
        <SoftCard x={252} y={52} w={84} h={56} fill={Ink.green} hot={hotSum} />
        <text x="294" y={88} textAnchor="middle" fill={Ink.text} fontSize={is4x10 ? "17" : "22"} fontFamily="inherit" fontWeight="700">
          {resultTerm}
        </text>
      </SoftFocus>
      <Foot y={148} fill={Ink.accent}>
        x değişken kutusudur · Katsayı öndeki çarpandır
      </Foot>
      <text x="28" y={176} fill={trap ? Ink.roseInk : Ink.text} fontSize="13" fontFamily="inherit" fontWeight="700">
        {trap ? "5x + 4 ≠ 9x (Sabit terim x'li terime eklenmez)" : "Yalnız benzer terimler toplanır: 3x + 2x = 5x"}
      </text>
    </Stage>
  );
}

export function ChartScene({
  beat,
  caption,
  lessonKey,
}: {
  beat: number;
  caption: string;
  lessonKey?: string;
}) {
  const probability =
    lessonKey === "jr_06_mat-26" || /olasılık|tura|atış|yirmide beş/iu.test(caption);
  if (probability) {
    const heads = 5;
    return (
      <Stage scene="chart">
        <Title>Gözleme dayalı olasılık</Title>
        {Array.from({ length: 20 }, (_, index) => {
          const col = index % 10;
          const row = Math.floor(index / 10);
          const head = index < heads;
          return (
            <circle
              key={index}
              cx={36 + col * 30}
              cy={78 + row * 36}
              r="11"
              fill={head ? Ink.amberFill : Ink.skyFill}
              stroke={head ? Ink.accent : Ink.stroke}
              strokeWidth="1.5"
            />
          );
        })}
        <Foot y={168} fill={Ink.accent}>
          {beat >= 3 ? "20 atışta 5 tura · yirmide beş" : "Pay istenen sonuç, payda deneme sayısı"}
        </Foot>
        <text x="28" y="190" fill={Ink.text} fontSize="12" fontFamily="inherit" fontWeight="700">
          5 kez gelmek, olasılığın 5 olması demek değildir
        </text>
      </Stage>
    );
  }
  const analysis = /ortalama|açıklık|analiz/iu.test(caption);
  const heights = analysis ? [40, 60, 80] : [80, 64, 48];
  const labels = analysis ? ["4", "6", "8"] : ["Elma", "Muz", "Üzüm"];
  return (
    <Stage scene="chart">
      <Title>{analysis ? "Veri analizi" : "Veri toplama"}</Title>
      <line x1="40" y1="150" x2="300" y2="150" stroke={Ink.strokeHot} strokeWidth="2" strokeLinecap="round" />
      <line x1="40" y1="150" x2="40" y2="40" stroke={Ink.strokeHot} strokeWidth="2" strokeLinecap="round" />
      {heights.map((h, index) => (
        <g key={labels[index]}>
          <rect
            x={70 + index * 80}
            y={150 - h}
            width="40"
            height={h}
            rx="8"
            fill={index === 0 ? Ink.skyFill : index === 1 ? Ink.amberFill : Ink.greenFill}
            stroke={Ink.stroke}
            strokeWidth="1.5"
          />
          <text x={90 + index * 80} y={172} textAnchor="middle" fill={Ink.text} fontSize="12" fontFamily="inherit" fontWeight="700">
            {labels[index]}
          </text>
        </g>
      ))}
      {analysis && beat >= 3 ? (
        <line x1="70" y1="90" x2="270" y2="90" stroke={Ink.roseInk} strokeWidth="2.5" strokeDasharray="6 4" strokeLinecap="round" />
      ) : null}
      {!analysis && beat >= 4 ? (
        <polyline points="90,70 170,86 250,102" fill="none" stroke={Ink.accent} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      ) : null}
      <Foot y={192} fill={Ink.accent}>
        {analysis ? "Ortalama 6, açıklık 4" : "Sıklık en çok elmadadır"}
      </Foot>
    </Stage>
  );
}

export function AnglesScene(_props: SceneCaptionProps) {
  return (
    <Stage scene="angles">
      <Title>Açılar</Title>
      <Foot>çizim yok</Foot>
    </Stage>
  );
}

export function AreaScene(_props: { beat: number; caption: string }) {
  return (
    <Stage scene="area">
      <Title>Alan</Title>
      <Foot>çizim yok</Foot>
    </Stage>
  );
}

export function CircleGeoScene(_props: { beat: number }) {
  return (
    <Stage scene="circle">
      <Title>Çember</Title>
      <Foot>çizim yok</Foot>
    </Stage>
  );
}

export function PrismScene({ beat, caption }: { beat: number; caption: string }) {
  const liquid = /litre|mililitre|sıvı|desimetre/iu.test(caption);
  return (
    <Stage scene="prism">
      <Title>{liquid ? "Sıvı ölçme" : "Prizma ve hacim"}</Title>
      {liquid ? (
        <>
          <SoftCard x={80} y={48} w={80} h={112} fill={Ink.white} rx={14} />
          <rect x="84" y={beat >= 4 ? 90 : 120} width="72" height={beat >= 4 ? 66 : 36} rx="8" fill={Ink.skyFill} />
          <text x="190" y={90} fill={Ink.text} fontSize="15" fontFamily="inherit" fontWeight="700">
            1 L = 1000 mL
          </text>
          <text x="190" y={120} fill={Ink.accent} fontSize="14" fontFamily="inherit" fontWeight="700">
            1 dm³ = 1 L
          </text>
          <text x="190" y={150} fill={Ink.muted} fontSize="12" fontFamily="inherit">
            {beat >= 5 ? "2,5 L = 2500 mL" : "Seviyeyi oku"}
          </text>
        </>
      ) : (
        <>
          <polygon points="80,70 180,50 180,130 80,150" fill={Ink.sky} stroke={Ink.stroke} strokeWidth="1.5" />
          <polygon points="180,50 260,70 260,150 180,130" fill={Ink.skyFill} stroke={Ink.stroke} strokeWidth="1.5" />
          <polygon points="80,70 180,50 260,70 160,90" fill="#e0f2fe" stroke={Ink.stroke} strokeWidth="1.5" />
          <SoftCard x={80} y={158} w={200} h={28} fill={Ink.panel} rx={10} />
          <text x="180" y={178} textAnchor="middle" fill={Ink.text} fontSize="13" fontFamily="inherit" fontWeight="700">
            {beat >= 4 ? "V = 4 × 3 × 2 = 24 cm³" : "a × b × c"}
          </text>
        </>
      )}
    </Stage>
  );
}

export function MathSceneArt({
  scene,
  beat,
  caption,
  captionTrail,
  lessonKey,
}: {
  scene: MathJuniorScene;
  beat: number;
  caption: string;
  captionTrail?: readonly string[];
  lessonKey?: string;
}) {
  /** Clean Stage: özet beat'te ExponentScene / Üs / Taban SoftStage çocukları mount edilmez. */
  if (beat >= 9) return null;
  if (scene === "exponent") return <ExponentScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "ops-order") return <OpsOrderScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "distribute") return <DistributeScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "number-ops") {
    return <NumberOpsScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  }
  if (scene === "sets") return <SetsScene beat={beat} />;
  if (scene === "number-line") return <NumberLineScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "fraction") return <FractionPieScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "fraction-sum") return <FractionBarsScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "decimal") return <DecimalScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "ratio") return <RatioScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "algebra") return <AlgebraScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "chart") return <ChartScene beat={beat} caption={caption} lessonKey={lessonKey} />;
  if (scene === "angles") return <AnglesScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "area") return <AreaScene beat={beat} caption={caption} />;
  if (scene === "circle") return <CircleGeoScene beat={beat} />;
  return <PrismScene beat={beat} caption={caption} />;
}
