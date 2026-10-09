import type { ReactNode } from "react";
import {
  Ink,
  pieSlicePath,
  SceneFoot as Foot,
  SceneTitle as Title,
  SoftCard,
  SoftFocus,
  SoftStage,
  stickyExponentParams,
  stickyFractionParams,
} from "@/components/junior/player/scene-ui";
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
 * Canlı karatahta — sabit üslü ifade sahnesi (Zero Layout Shift + Sticky Scene).
 * Yeni üslü örnek (10², 5¹) gelene kadar son geçerli çizim ekranda kalır;
 * genel konuşmada 2³ varsayılanına geri sıçramaz.
 */
export function ExponentScene({ beat, caption = "", captionTrail }: SceneCaptionProps) {
  const lower = caption.toLocaleLowerCase("tr-TR");
  const { base, exp, product } = stickyExponentParams(captionTrailOrLive(caption, captionTrail));
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
  const hotTrap = trap || beat >= 8;

  const factors = Array.from({ length: exp }, () => String(base)).join(" × ");
  const formula = `${base} üssü ${exp} = ${factors} = ${product}`;
  const gap = exp <= 3 ? 52 : exp === 4 ? 44 : 38;
  const box = exp <= 3 ? 42 : 34;
  const startX = 128;
  const resultX = Math.min(startX + exp * gap + 8, 300);

  return (
    <Stage scene="exponent">
      <SoftCard x={12} y={10} w={336} h={28} fill={Ink.panel} rx={12} hot={hasPower || beat >= 2} />
      <text x="180" y="29" textAnchor="middle" fill={Ink.text} fontSize="13" fontFamily="inherit" fontWeight="700">
        {formula}
      </text>

      <SoftFocus active={hotBase}>
        <SoftCard x={20} y={52} w={58} h={58} fill={Ink.amber} hot={hotBase} />
        <text x="49" y={90} textAnchor="middle" fill={Ink.text} fontSize="30" fontFamily="inherit" fontWeight="700">
          {base}
        </text>
        <text x="49" y={128} textAnchor="middle" fill={Ink.accent} fontSize="12" fontFamily="inherit" fontWeight="700">
          Taban
        </text>
      </SoftFocus>

      <SoftFocus active={hotExp}>
        <SoftCard x={78} y={44} w={28} h={28} fill={Ink.amberFill} rx={10} hot={hotExp} />
        <text x="92" y={64} textAnchor="middle" fill={Ink.amberInk} fontSize="16" fontFamily="inherit" fontWeight="700">
          {exp}
        </text>
        <text x="92" y={88} textAnchor="middle" fill={Ink.amberInk} fontSize="11" fontFamily="inherit" fontWeight="700">
          Üs
        </text>
      </SoftFocus>

      {Array.from({ length: exp }, (_, index) => (
        <SoftFocus key={index} active={hotFactors}>
          <SoftCard x={startX + index * gap} y={58} w={box} h={box} fill={Ink.sky} rx={12} hot={hotFactors} />
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
          {index < exp - 1 ? (
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
      ))}

      <SoftFocus active={hotProduct}>
        <SoftCard x={resultX} y={58} w={56} h={42} fill={Ink.green} rx={12} hot={hotProduct} />
        <text x={resultX + 28} y={86} textAnchor="middle" fill={Ink.greenInk} fontSize="18" fontFamily="inherit" fontWeight="700">
          = {product}
        </text>
      </SoftFocus>

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
    </Stage>
  );
}

export function OpsOrderScene({ beat }: { beat: number }) {
  const steps = ["( )", "üs", "× ÷", "+ −"];
  const active = Math.min(3, Math.max(0, beat - 1));
  const wrong = beat >= 7;
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
        3 + 4 × 2
      </text>
      {wrong ? (
        <g>
          <text x="22" y={164} fill={Ink.roseInk} fontSize="15" fontFamily="inherit" fontWeight="700">
            14 değil
          </text>
          <text x="118" y={164} fill={Ink.greenInk} fontSize="15" fontFamily="inherit" fontWeight="700">
            3 + 8 = 11
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

export function DistributeScene({ beat }: { beat: number }) {
  const open = beat >= 3;
  return (
    <Stage scene="distribute">
      <Title>Ortak çarpan ve dağılma</Title>
      <SoftCard x={22} y={52} w={50} h={50} fill={Ink.amber} hot />
      <text x="47" y={86} textAnchor="middle" fill={Ink.text} fontSize="22" fontFamily="inherit" fontWeight="700">
        6
      </text>
      <text x="86" y={86} fill={Ink.muted} fontSize="22" fontFamily="inherit" fontWeight="700">
        ×
      </text>
      <SoftCard x={108} y={46} w={124} h={62} fill={Ink.sky} hot={open} />
      <text x="170" y={86} textAnchor="middle" fill={Ink.text} fontSize="18" fontFamily="inherit" fontWeight="700">
        5 + 3
      </text>
      <text x={248} y={72} fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700" opacity={open ? 1 : 0.45}>
        6×5 + 6×3
      </text>
      <SoftCard x={248} y={84} w={88} h={28} fill={Ink.green} rx={10} hot={open} />
      <text x={260} y={104} fill={Ink.greenInk} fontSize="14" fontFamily="inherit" fontWeight="700">
        = 48
      </text>
      <Foot>{beat >= 6 ? "Ortak çarpan parantezin önüne çıkar." : "Çarpım, toplamanın üzerine dağılır."}</Foot>
    </Stage>
  );
}

export function NumberOpsScene({ beat, caption }: { beat: number; caption: string }) {
  const text = caption.toLocaleLowerCase("tr-TR");
  const mode = /asal/.test(text)
    ? "prime"
    : /ortak bölen|ortak kat|ebob|ekok/.test(text)
      ? "gcd"
      : /çarpan|kat|bölün/.test(text)
        ? "factor"
        : "problem";
  const title =
    mode === "prime" ? "Asal sayılar" : mode === "gcd" ? "Ortak bölen ve kat" : mode === "factor" ? "Çarpan ve kat" : "Doğal sayı problemi";
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
        <>
          {[1, 2, 3, 4, 6, 12].map((n, index) => (
            <g key={n}>
              <circle
                cx={48 + index * 52}
                cy="96"
                r="20"
                fill={n === 12 || beat >= index ? Ink.amber : Ink.white}
                stroke={Ink.stroke}
                strokeWidth="1.5"
              />
              <text x={48 + index * 52} y={102} textAnchor="middle" fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
                {n}
              </text>
            </g>
          ))}
          <Foot y={160} fill={Ink.accent}>
            12&apos;nin çarpanları kalansız böler.
          </Foot>
        </>
      ) : null}
      {mode === "prime" ? (
        <>
          {[2, 3, 5, 7, 11, 13].map((n, index) => (
            <g key={n}>
              <SoftCard x={26 + index * 54} y={66} w={46} h={46} fill={index <= beat ? Ink.greenFill : Ink.white} rx={12} />
              <text x={49 + index * 54} y={96} textAnchor="middle" fill={Ink.text} fontSize="16" fontFamily="inherit" fontWeight="700">
                {n}
              </text>
            </g>
          ))}
          <Foot>{beat >= 5 ? "1 asal değildir. 12 = 2 × 2 × 3" : "Yalnız 1 ve kendisi."}</Foot>
        </>
      ) : null}
      {mode === "gcd" ? (
        <>
          <text x="22" y={68} fill={Ink.text} fontSize="15" fontFamily="inherit" fontWeight="700">
            8 ve 12
          </text>
          <SoftCard x={22} y={84} w={148} h={42} fill={Ink.sky} />
          <text x="40" y={112} fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
            EBOB = 4
          </text>
          <SoftCard x={190} y={84} w={148} h={42} fill={Ink.amber} />
          <text x="208" y={112} fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
            EKOK = 24
          </text>
          <Foot y={168} fill={Ink.accent}>
            Bölen küçük listede, kat büyük listede.
          </Foot>
        </>
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

export function NumberLineScene({ beat }: { beat: number }) {
  const marks = [-4, -2, 0, 2, 4];
  return (
    <Stage scene="number-line">
      <Title>Tam sayılar ve mutlak değer</Title>
      <line x1="40" y1="100" x2="320" y2="100" stroke={Ink.strokeHot} strokeWidth="2.5" strokeLinecap="round" />
      <polygon points="320,100 308,94 308,106" fill={Ink.strokeHot} />
      {marks.map((n, index) => (
        <g key={n}>
          <line x1={60 + index * 60} y1="92" x2={60 + index * 60} y2="108" stroke={Ink.strokeHot} strokeWidth="2" />
          <text x={60 + index * 60} y={128} textAnchor="middle" fill={Ink.text} fontSize="13" fontFamily="inherit" fontWeight="700">
            {n}
          </text>
        </g>
      ))}
      {beat >= 3 ? (
        <>
          <circle cx="60" cy="100" r="8" fill={Ink.roseInk} stroke={Ink.stroke} strokeWidth="1.5" />
          <path d="M60 70 H180" stroke={Ink.accent} strokeWidth="3" strokeLinecap="round" />
          <text x="100" y={62} fill={Ink.accent} fontSize="13" fontFamily="inherit" fontWeight="700">
            |−4| = 4
          </text>
        </>
      ) : null}
      <Foot>{beat >= 5 ? "Sağdaki tam sayı daha büyüktür." : "Mutlak değer 0'a uzaklıktır."}</Foot>
    </Stage>
  );
}

export function FractionPieScene({ beat, caption = "", captionTrail }: SceneCaptionProps) {
  const { num, den } = stickyFractionParams(captionTrailOrLive(caption, captionTrail));
  const fill = beat >= 4;
  const filledCount = fill ? Math.min(num, den) : 0;
  const hotCuts = beat >= 2 && beat < 5;
  const hotLabel = beat >= 5;
  const hotTrap = beat >= 8;
  return (
    <Stage scene="fraction">
      <Title>Kesir modeli</Title>
      <circle cx="108" cy="104" r="58" fill="#fff7ed" stroke={Ink.strokeHot} strokeWidth="2" />
      {Array.from({ length: den }, (_, index) => (
        <path
          key={index}
          d={pieSlicePath(108, 104, 58, index, den)}
          fill={index < filledCount ? Ink.skyFill : "transparent"}
          stroke={hotCuts || hotLabel ? Ink.accent : Ink.strokeHot}
          strokeWidth={hotCuts || index < filledCount ? 2 : 1.5}
        />
      ))}
      <text x="196" y={80} fill={Ink.text} fontSize="15" fontFamily="inherit" fontWeight="700">
        {den} eşit parça
      </text>
      <SoftFocus active={hotLabel}>
        <SoftCard x={196} y={96} w={72} h={40} fill={Ink.sky} rx={12} hot={hotLabel} />
        <text x="232" y={124} textAnchor="middle" fill={Ink.accent} fontSize="26" fontFamily="inherit" fontWeight="700">
          {num}/{den}
        </text>
      </SoftFocus>
      <text
        x="196"
        y={160}
        fill={hotTrap ? Ink.roseInk : Ink.muted}
        fontSize="12"
        fontFamily="inherit"
        fontWeight={hotTrap ? "700" : "500"}
      >
        {hotTrap ? "Eşit değilse kesir olmaz" : beat >= 6 ? "Pay üstte, payda altta." : "Seçilen parça paydır."}
      </text>
    </Stage>
  );
}

export function FractionBarsScene({ beat, caption = "", captionTrail }: SceneCaptionProps) {
  const parsed = stickyFractionParams(captionTrailOrLive(caption, captionTrail));
  const den = 4;
  const left = 1;
  const right = Math.min(den - 1, Math.max(1, parsed.num || 2));
  const sum = Math.min(den, left + right);
  const equalize = beat >= 4 && beat <= 6;
  const hotResult = beat >= 6;
  const trap = beat >= 8;
  return (
    <Stage scene="fraction-sum">
      <Title>Kesir blokları</Title>
      <BarRow x={16} den={den} filled={left} label={`${left}/${den}`} hot={equalize} />
      <text x="148" y={70} fill={Ink.muted} fontSize="22" fontFamily="inherit" fontWeight="700">
        +
      </text>
      <BarRow x={188} den={den} filled={right} label={`${right}/${den}`} hot={equalize} />
      <SoftFocus active={hotResult}>
        <BarRow x={100} y={118} den={den} filled={sum} label={`${sum}/${den}`} hot={hotResult} />
      </SoftFocus>
      <text
        x="16"
        y={178}
        fill={trap ? Ink.roseInk : Ink.accent}
        fontSize="12"
        fontFamily="inherit"
        fontWeight="700"
      >
        {trap
          ? `Paydalar toplanmaz. Doğru: ${sum}/${den}`
          : equalize
            ? "Payda aynı kalır. Paylar toplanır."
            : "Aynı paydada bloklar birleşir."}
      </text>
    </Stage>
  );
}

function BarRow({
  x,
  y = 40,
  den,
  filled,
  label,
  hot = false,
}: {
  x: number;
  y?: number;
  den: number;
  filled: number;
  label: string;
  hot?: boolean;
}) {
  const cell = Math.min(26, Math.floor(100 / den));
  return (
    <g>
      {Array.from({ length: den }, (_, index) => (
        <rect
          key={index}
          x={x + index * cell}
          y={y}
          width={cell - 2}
          height="32"
          rx="8"
          fill={index < filled ? Ink.skyFill : Ink.white}
          stroke={hot ? Ink.amberInk : Ink.stroke}
          strokeWidth={hot ? 2 : 1.5}
        />
      ))}
      <text x={x} y={y + 52} fill={Ink.text} fontSize="13" fontFamily="inherit" fontWeight="600">
        {label}
      </text>
    </g>
  );
}

export function DecimalScene({ beat }: { beat: number }) {
  return (
    <Stage scene="decimal">
      <Title>Ondalık gösterim</Title>
      <SoftCard x={40} y={56} w={64} h={56} fill={Ink.amber} />
      <text x="72" y={94} textAnchor="middle" fill={Ink.text} fontSize="28" fontFamily="inherit" fontWeight="700">
        0
      </text>
      <text x="118" y={98} fill={Ink.text} fontSize="36" fontFamily="inherit" fontWeight="700">
        ,
      </text>
      <SoftCard x={140} y={56} w={64} h={56} fill={Ink.sky} />
      <text x="172" y={94} textAnchor="middle" fill={Ink.text} fontSize="28" fontFamily="inherit" fontWeight="700">
        5
      </text>
      <text x="72" y={144} textAnchor="middle" fill={Ink.accent} fontSize="12" fontFamily="inherit" fontWeight="700">
        Tam
      </text>
      <text x="172" y={144} textAnchor="middle" fill={Ink.accent} fontSize="12" fontFamily="inherit" fontWeight="700">
        Kesir
      </text>
      <SoftCard x={230} y={66} w={96} h={36} fill={Ink.green} rx={12} />
      <text x="278" y={90} textAnchor="middle" fill={Ink.greenInk} fontSize="16" fontFamily="inherit" fontWeight="700">
        {beat >= 4 ? "= 1/2" : "0,5"}
      </text>
      <Foot>{beat >= 6 ? "Virgüller alt alta gelir." : "Virgülün solu tam, sağı kesirdir."}</Foot>
    </Stage>
  );
}

export function RatioScene({ beat }: { beat: number }) {
  const simplified = beat >= 4;
  const left = 2;
  const right = 3;
  return (
    <Stage scene="ratio">
      <Title>Oran</Title>
      {Array.from({ length: left }, (_, i) => (
        <circle
          key={`l${i}`}
          cx={80 + i * 40}
          cy="90"
          r="14"
          fill={Ink.skyFill}
          stroke={simplified ? Ink.accent : Ink.stroke}
          strokeWidth={simplified ? 2.5 : 1.5}
        />
      ))}
      <text x="170" y={98} fill={Ink.muted} fontSize="28" fontFamily="inherit" fontWeight="700">
        :
      </text>
      {Array.from({ length: right }, (_, i) => (
        <circle
          key={`r${i}`}
          cx={210 + i * 36}
          cy="90"
          r="14"
          fill={Ink.amberFill}
          stroke={simplified ? Ink.accent : Ink.stroke}
          strokeWidth={simplified ? 2.5 : 1.5}
        />
      ))}
      <SoftCard x={16} y={128} w={88} h={32} fill={Ink.panel} rx={12} hot={simplified} />
      <text x="60" y={150} textAnchor="middle" fill={Ink.text} fontSize="16" fontFamily="inherit" fontWeight="700">
        {left} : {right}
      </text>
      <Foot y={178} fill={Ink.accent}>
        {beat >= 5 ? "Sadeleşince sıra korunur." : "Oran sırayı korur."}
      </Foot>
    </Stage>
  );
}

export function AlgebraScene({ beat }: { beat: number }) {
  const hotSum = beat >= 3;
  const trap = beat >= 7;
  return (
    <Stage scene="algebra">
      <Title>Cebirsel ifadeler</Title>
      <SoftCard x={28} y={52} w={70} h={56} fill={Ink.amber} hot={!hotSum} />
      <text x="63" y={88} textAnchor="middle" fill={Ink.text} fontSize="22" fontFamily="inherit" fontWeight="700">
        3x
      </text>
      <text x="116" y={88} fill={Ink.muted} fontSize="24" fontFamily="inherit" fontWeight="700">
        +
      </text>
      <SoftCard x={140} y={52} w={70} h={56} fill={Ink.amber} hot={!hotSum} />
      <text x="175" y={88} textAnchor="middle" fill={Ink.text} fontSize="22" fontFamily="inherit" fontWeight="700">
        2x
      </text>
      <SoftFocus active={hotSum}>
        <text x="230" y={72} fill={Ink.muted} fontSize="18" fontFamily="inherit" fontWeight="700">
          =
        </text>
        <SoftCard x={252} y={52} w={70} h={56} fill={Ink.green} hot={hotSum} />
        <text x="287" y={88} textAnchor="middle" fill={Ink.text} fontSize="22" fontFamily="inherit" fontWeight="700">
          5x
        </text>
      </SoftFocus>
      <Foot y={148} fill={Ink.accent}>
        x değişken kutusudur
      </Foot>
      <text x="28" y={176} fill={trap ? Ink.roseInk : Ink.text} fontSize="13" fontFamily="inherit" fontWeight="700">
        {trap ? "5x + 4 ≠ 9x" : "Yalnız benzer terimler toplanır."}
      </text>
    </Stage>
  );
}

export function ChartScene({ beat, caption }: { beat: number; caption: string }) {
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

export function AnglesScene({ beat }: { beat: number }) {
  return (
    <Stage scene="angles">
      <Title>Açılar</Title>
      <line x1="40" y1="140" x2="200" y2="140" stroke={Ink.strokeHot} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="120" y1="140" x2="120" y2="50" stroke={Ink.strokeHot} strokeWidth="2.5" strokeLinecap="round" />
      <line x1="120" y1="140" x2="200" y2="70" stroke={Ink.accent} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M148 140 A28 28 0 0 0 120 112" fill="none" stroke={Ink.amberInk} strokeWidth="2.5" />
      <text x="148" y={128} fill={Ink.amberInk} fontSize="13" fontFamily="inherit" fontWeight="700">
        {beat >= 4 ? "30°" : "α"}
      </text>
      <SoftCard x={214} y={60} w={124} h={64} fill={Ink.panel} rx={12} />
      <text x="228" y={86} fill={Ink.text} fontSize="12" fontFamily="inherit" fontWeight="700">
        {beat >= 5 ? "Tümler 60°" : "Komşu açı"}
      </text>
      <text x="228" y={110} fill={Ink.text} fontSize="12" fontFamily="inherit" fontWeight="700">
        {beat >= 6 ? "Bütünler 150°" : "Ters açılar eşit"}
      </text>
      <Foot y={176} fill={Ink.accent}>
        Tümler 90, bütünler 180.
      </Foot>
    </Stage>
  );
}

export function AreaScene({ beat, caption }: { beat: number; caption: string }) {
  const units = /dönüm|hektar|metre kare|ölçü/iu.test(caption);
  return (
    <Stage scene="area">
      <Title>{units ? "Alan ölçü birimleri" : "Paralelkenar ve üçgen"}</Title>
      {units ? (
        <>
          <SoftCard x={40} y={52} w={120} h={80} fill={Ink.sky} />
          <text x="100" y={100} textAnchor="middle" fill={Ink.text} fontSize="14" fontFamily="inherit" fontWeight="700">
            1 m²
          </text>
          <text x="180" y={80} fill={Ink.text} fontSize="13" fontFamily="inherit" fontWeight="700">
            1 dönüm = 1000 m²
          </text>
          <text x="180" y={108} fill={Ink.text} fontSize="13" fontFamily="inherit" fontWeight="700">
            1 hektar = 10 dönüm
          </text>
        </>
      ) : (
        <>
          <polygon points="40,140 160,140 140,60 20,60" fill={Ink.sky} stroke={Ink.strokeHot} strokeWidth="2" />
          <line x1="40" y1="140" x2="40" y2="60" stroke={Ink.roseInk} strokeWidth="2.5" strokeDasharray="5 4" />
          <text x="48" y={100} fill={Ink.roseInk} fontSize="12" fontFamily="inherit" fontWeight="700">
            h
          </text>
          <polygon points="200,140 320,140 260,60" fill={Ink.amber} stroke={Ink.strokeHot} strokeWidth="2" />
          <Foot y={176}>
            {beat >= 5 ? "Alan = taban × yükseklik / 2" : "Alan = taban × yükseklik"}
          </Foot>
        </>
      )}
    </Stage>
  );
}

export function CircleGeoScene({ beat }: { beat: number }) {
  return (
    <Stage scene="circle">
      <Title>Çember</Title>
      <circle cx="130" cy="110" r="60" fill={beat >= 4 ? Ink.sky : "none"} stroke={Ink.strokeHot} strokeWidth="2" />
      <circle cx="130" cy="110" r="4" fill={Ink.accent} />
      <line x1="130" y1="110" x2="190" y2="110" stroke={Ink.accent} strokeWidth="2.5" strokeLinecap="round" />
      <text x="150" y={100} fill={Ink.accent} fontSize="13" fontFamily="inherit" fontWeight="700">
        r
      </text>
      {beat >= 3 ? (
        <>
          <line x1="70" y1="110" x2="190" y2="110" stroke={Ink.amberInk} strokeWidth="2" strokeDasharray="4 3" />
          <text x="200" y={80} fill={Ink.amberInk} fontSize="14" fontFamily="inherit" fontWeight="700">
            çap = 2r
          </text>
        </>
      ) : null}
      <text x="200" y={120} fill={Ink.muted} fontSize="12" fontFamily="inherit">
        {beat >= 5 ? "Çember çizgi, daire iç bölge" : "Yarıçap merkeze bağlıdır"}
      </text>
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
}: {
  scene: MathJuniorScene;
  beat: number;
  caption: string;
  captionTrail?: readonly string[];
}) {
  /** Clean Stage: özet beat'te ExponentScene / Üs / Taban SoftStage çocukları mount edilmez. */
  if (beat >= 9) return null;
  if (scene === "exponent") return <ExponentScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "ops-order") return <OpsOrderScene beat={beat} />;
  if (scene === "distribute") return <DistributeScene beat={beat} />;
  if (scene === "number-ops") return <NumberOpsScene beat={beat} caption={caption} />;
  if (scene === "sets") return <SetsScene beat={beat} />;
  if (scene === "number-line") return <NumberLineScene beat={beat} />;
  if (scene === "fraction") return <FractionPieScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "fraction-sum") return <FractionBarsScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "decimal") return <DecimalScene beat={beat} />;
  if (scene === "ratio") return <RatioScene beat={beat} />;
  if (scene === "algebra") return <AlgebraScene beat={beat} />;
  if (scene === "chart") return <ChartScene beat={beat} caption={caption} />;
  if (scene === "angles") return <AnglesScene beat={beat} />;
  if (scene === "area") return <AreaScene beat={beat} caption={caption} />;
  if (scene === "circle") return <CircleGeoScene beat={beat} />;
  return <PrismScene beat={beat} caption={caption} />;
}
