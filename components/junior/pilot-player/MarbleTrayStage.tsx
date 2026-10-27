"use client";

import type { ReactElement } from "react";
import type { SceneGraphState } from "@/lib/junior/pilot-engine/state-reducer";

const MARBLE_PALETTE = [
  { main: "#22d3ee", mid: "#0891b2", deep: "#164e63", glow: "rgba(34,211,238,0.45)" },
  { main: "#38bdf8", mid: "#0284c7", deep: "#0c4a6e", glow: "rgba(56,189,248,0.45)" },
  { main: "#a78bfa", mid: "#7c3aed", deep: "#4c1d95", glow: "rgba(167,139,250,0.45)" },
  { main: "#34d399", mid: "#059669", deep: "#064e3b", glow: "rgba(52,211,153,0.45)" },
  { main: "#fbbf24", mid: "#d97706", deep: "#78350f", glow: "rgba(251,191,36,0.45)" },
  { main: "#f472b6", mid: "#db2777", deep: "#831843", glow: "rgba(244,114,182,0.45)" },
] as const;

/** Tuval 960×280. Bilye yarıçapı genişliğin ~%3'ü; dar ekranda da tepsiyi doldurur. */
const SCATTERED_POSITIONS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 90, y: 112 },
  { x: 246, y: 112 },
  { x: 402, y: 112 },
  { x: 558, y: 112 },
  { x: 714, y: 112 },
  { x: 870, y: 112 },
  { x: 90, y: 214 },
  { x: 246, y: 214 },
  { x: 402, y: 214 },
  { x: 558, y: 214 },
  { x: 714, y: 214 },
  { x: 870, y: 214 },
];

type MarbleCoord = {
  x: number;
  y: number;
  isRemainder: boolean;
  groupIdx: number;
};

type TrayBox = {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
};

function placeMarblesInBox(
  box: TrayBox,
  count: number,
  groupIdx: number,
  isRemainder: boolean,
): MarbleCoord[] {
  if (count <= 0) {
    return [];
  }
  const cols = Math.min(count, count > 3 ? 3 : count);
  const rows = Math.ceil(count / cols);
  const coords: MarbleCoord[] = [];
  for (let index = 0; index < count; index += 1) {
    const col = index % cols;
    const row = Math.floor(index / cols);
    coords.push({
      x: box.x + (box.w * (col + 1)) / (cols + 1),
      y: box.y + 26 + ((box.h - 34) * (row + 1)) / (rows + 1),
      isRemainder,
      groupIdx,
    });
  }
  return coords;
}

function computeMarbleLayout(
  count: number,
  groupSize: number | null,
  groups: number,
  remainder: number,
): { marbles: MarbleCoord[]; boxes: TrayBox[]; remainderZone: TrayBox | null; radius: number } {
  if (!groupSize || groupSize <= 0 || groups <= 0) {
    return {
      marbles: Array.from({ length: count }, (_, idx) => {
        const pos = SCATTERED_POSITIONS[idx % SCATTERED_POSITIONS.length]!;
        return { x: pos.x, y: pos.y, isRemainder: false, groupIdx: -1 };
      }),
      boxes: [],
      remainderZone: null,
      radius: count > 12 ? 28 : 44,
    };
  }

  const margin = 16;
  const top = 40;
  const gap = 12;
  const usableW = 960 - margin * 2;
  const usableH = 280 - top - 8;
  const hasRemainder = remainder > 0;
  const remW = hasRemainder ? 150 : 0;
  const cols = hasRemainder ? Math.max(1, groups) : groups <= 4 ? 2 : 3;
  const rows = hasRemainder ? 1 : Math.ceil(groups / cols);
  const gridW = usableW - (hasRemainder ? remW + gap : 0);
  const boxW = (gridW - gap * Math.max(0, cols - 1)) / cols;
  const boxH = hasRemainder ? usableH : (usableH - gap * Math.max(0, rows - 1)) / rows;
  const boxes: TrayBox[] = [];
  const marbles: MarbleCoord[] = [];

  for (let group = 0; group < groups; group += 1) {
    const col = hasRemainder ? group : group % cols;
    const row = hasRemainder ? 0 : Math.floor(group / cols);
    const box: TrayBox = {
      x: margin + col * (boxW + gap),
      y: top + row * (boxH + gap),
      w: boxW,
      h: boxH,
      label: `${group + 1}. Kutu (${groupSize})`,
    };
    boxes.push(box);
    marbles.push(...placeMarblesInBox(box, groupSize, group, false));
  }

  let remainderZone: TrayBox | null = null;
  if (hasRemainder) {
    remainderZone = {
      x: margin + groups * (boxW + gap),
      y: top,
      w: remW,
      h: boxH,
      label: "Dışarıda Artan!",
    };
    marbles.push(...placeMarblesInBox(remainderZone, remainder, -1, true));
  }

  const radius = groupSize >= 5 ? 18 : groupSize >= 3 ? 20 : 22;
  return { marbles, boxes, remainderZone, radius };
}

/**
 * 3 Katmanlı Cam Bilye (`MarbleGem`):
 * 1) Alt yumuşak gölge (Drop Shadow)
 * 2) Radyal cam gövde gradyanı
 * 3) Sol üst mercek parlama noktası (Specular Highlight)
 */
function MarbleGem(props: {
  index: number;
  x: number;
  y: number;
  radius: number;
  isRemainder: boolean;
  visible: boolean;
}): ReactElement {
  const { index, x, y, radius, isRemainder, visible } = props;
  const R = radius;
  const color = isRemainder
    ? { main: "#fb7185", mid: "#e11d48", deep: "#881337", glow: "rgba(244,63,94,0.65)" }
    : MARBLE_PALETTE[index % MARBLE_PALETTE.length]!;
  const gradId = `marble-gem-grad-${index}-${isRemainder ? "rem" : "ok"}`;

  return (
    <g
      style={{
        transform: `translate(${x}px, ${y}px) scale(${visible ? 1 : 0.2})`,
        opacity: visible ? 1 : 0,
        transition:
          "transform 680ms cubic-bezier(0.34, 1.56, 0.64, 1), opacity 360ms ease-out",
      }}
    >
      <defs>
        <radialGradient id={gradId} cx="32%" cy="28%" r="68%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.92" />
          <stop offset="28%" stopColor={color.main} />
          <stop offset="72%" stopColor={color.mid} />
          <stop offset="100%" stopColor={color.deep} />
        </radialGradient>
      </defs>

      {/* 1. Katman: Alt Yumuşak Gölge */}
      <ellipse cx={0} cy={R * 0.9} rx={R * 0.82} ry={R * 0.28} fill="rgba(2, 6, 23, 0.55)" />

      {/* Artan bilye ise pembe/kırmızı uyarı halkası */}
      {isRemainder ? (
        <circle
          cx={0}
          cy={0}
          r={R * 1.28}
          fill="none"
          stroke="#fb7185"
          strokeWidth={3}
          strokeDasharray="6 4"
          opacity={0.95}
        />
      ) : null}

      {/* 2. Katman: 3B Radyal Cam Gövde */}
      <circle
        cx={0}
        cy={0}
        r={R}
        fill={`url(#${gradId})`}
        stroke={isRemainder ? "#ffe4e6" : "rgba(255,255,255,0.45)"}
        strokeWidth={2}
      />

      {/* 3. Katman: Mercek Yansıması (Specular Highlight) */}
      <ellipse
        cx={-R * 0.32}
        cy={-R * 0.35}
        rx={R * 0.32}
        ry={R * 0.18}
        transform={`rotate(-24 ${-R * 0.32} ${-R * 0.35})`}
        fill="rgba(255, 255, 255, 0.78)"
      />
      <circle cx={-R * 0.52} cy={-R * 0.12} r={R * 0.09} fill="rgba(255, 255, 255, 0.55)" />

      {/* Bilye numarası */}
      <text
        x={0}
        y={R * 0.22}
        textAnchor="middle"
        fill="#ffffff"
        fontSize={R * 0.55}
        fontWeight={800}
        style={{ textShadow: "0 1px 3px rgba(0,0,0,0.75)" }}
      >
        {index + 1}
      </text>
    </g>
  );
}

export function MarbleTrayStage(props: { state: SceneGraphState }): ReactElement {
  const { state } = props;
  const { marblesSpawned, marbleCount, marbleGroup, callout } = state;
  const count = marblesSpawned ? marbleCount : 0;
  const layout = computeMarbleLayout(
    count,
    marbleGroup.groupSize,
    marbleGroup.groups,
    marbleGroup.remainder,
  );

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden">
      <svg
        viewBox="0 0 960 280"
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 h-full w-full select-none"
        role="img"
        aria-label={
          marblesSpawned
            ? `${marbleCount} bilye ve çarpan kutuları sahnesi`
            : "Bilye tepsisi"
        }
      >
        {/* Üst Bilgi Rozeti — bilyeler gelince görünür; öncesinde dedektif karşılama masası durur */}
        {marblesSpawned ? (
          <g transform="translate(24, 12)">
            <rect
              x={0}
              y={0}
              width={280}
              height={26}
              rx={13}
              fill="rgba(34, 211, 238, 0.14)"
              stroke="rgba(34, 211, 238, 0.4)"
            />
            <text x={140} y={18} textAnchor="middle" fill="#67e8f9" fontSize={14} fontWeight={800}>
              {`TOPLAM: ${marbleCount} CAM BİLYE`}
            </text>
          </g>
        ) : (
          <g data-junior-detective-welcome-desk="">
            <rect
              x={24}
              y={16}
              width={912}
              height={248}
              rx={22}
              fill="rgba(15, 23, 42, 0.82)"
              stroke="rgba(34, 211, 238, 0.38)"
              strokeWidth={2}
            />
            <rect
              x={48}
              y={34}
              width={290}
              height={30}
              rx={15}
              fill="rgba(34, 211, 238, 0.16)"
              stroke="rgba(34, 211, 238, 0.45)"
            />
            <text x={193} y={54} textAnchor="middle" fill="#67e8f9" fontSize={13} fontWeight={800}>
              BÖLÜNEBİLME DEDEKTİFLERİ MASASI
            </text>
            <text x={48} y={98} fill="#f8fafc" fontSize={22} fontWeight={900}>
              {state.title || "Çarpanlar, Katlar ve Bölünebilme"}
            </text>
            <text x={48} y={124} fill="#cbd5e1" fontSize={14} fontWeight={600}>
              {state.subtitle || "Uzun bölme yapmadan, tek bakışta karar verme rehberi"}
            </text>
            <g transform="translate(48, 146)">
              <rect
                x={0}
                y={0}
                width={205}
                height={88}
                rx={14}
                fill="rgba(30, 41, 59, 0.9)"
                stroke="rgba(56, 189, 248, 0.4)"
              />
              <text x={16} y={28} fill="#38bdf8" fontSize={13} fontWeight={800}>
                1. Bilye Tepsisi Deneyi
              </text>
              <text x={16} y={50} fill="#e2e8f0" fontSize={12} fontWeight={600}>
                Kalansız bölen = Çarpan
              </text>
              <text x={16} y={70} fill="#94a3b8" fontSize={11} fontWeight={600}>
                Çarpan ≤ Sayı · Kat ≥ Sayı
              </text>
            </g>
            <g transform="translate(269, 146)">
              <rect
                x={0}
                y={0}
                width={205}
                height={88}
                rx={14}
                fill="rgba(30, 41, 59, 0.9)"
                stroke="rgba(251, 191, 36, 0.4)"
              />
              <text x={16} y={28} fill="#fbbf24" fontSize={13} fontWeight={800}>
                2. Son Basamaklar
              </text>
              <text x={16} y={50} fill="#e2e8f0" fontSize={12} fontWeight={600}>
                2, 5 ve 10: Birler basamağı
              </text>
              <text x={16} y={70} fill="#94a3b8" fontSize={11} fontWeight={600}>
                4 Kuralı: Son iki basamak
              </text>
            </g>
            <g transform="translate(490, 146)">
              <rect
                x={0}
                y={0}
                width={205}
                height={88}
                rx={14}
                fill="rgba(30, 41, 59, 0.9)"
                stroke="rgba(52, 211, 153, 0.4)"
              />
              <text x={16} y={28} fill="#34d399" fontSize={13} fontWeight={800}>
                3. Rakamlar Toplamı
              </text>
              <text x={16} y={50} fill="#e2e8f0" fontSize={12} fontWeight={600}>
                3 ve 9: Basamakları topla
              </text>
              <text x={16} y={70} fill="#94a3b8" fontSize={11} fontWeight={600}>
                Toplam 3 veya 9&apos;un katı mı?
              </text>
            </g>
            <g transform="translate(711, 146)">
              <rect
                x={0}
                y={0}
                width={201}
                height={88}
                rx={14}
                fill="rgba(30, 41, 59, 0.9)"
                stroke="rgba(167, 139, 250, 0.4)"
              />
              <text x={16} y={28} fill="#c4b5fd" fontSize={13} fontWeight={800}>
                4. Çifte Koşul (6)
              </text>
              <text x={16} y={50} fill="#e2e8f0" fontSize={12} fontWeight={600}>
                Hem 2 hem 3 aynı anda!
              </text>
              <text x={16} y={70} fill="#94a3b8" fontSize={11} fontWeight={600}>
                7 Dedektif Kuralı Hazır
              </text>
            </g>
          </g>
        )}

        {/* Denklem / Durum Hapı */}
        {marbleGroup.equation ? (
          <g transform="translate(520, 12)">
            <rect
              x={0}
              y={0}
              width={416}
              height={26}
              rx={13}
              fill={marbleGroup.remainder > 0 ? "rgba(244, 63, 94, 0.22)" : "rgba(16, 185, 129, 0.22)"}
              stroke={marbleGroup.remainder > 0 ? "#fb7185" : "#34d399"}
              strokeWidth={1.5}
            />
            <text
              x={208}
              y={18}
              textAnchor="middle"
              fill={marbleGroup.remainder > 0 ? "#fecdd3" : "#a7f3d0"}
              fontSize={15}
              fontWeight={900}
            >
              {marbleGroup.equation}
            </text>
          </g>
        ) : marblesSpawned ? (
          <g transform="translate(560, 12)">
            <rect
              x={0}
              y={0}
              width={376}
              height={26}
              rx={13}
              fill="rgba(251, 191, 36, 0.14)"
              stroke="rgba(251, 191, 36, 0.38)"
            />
            <text x={188} y={18} textAnchor="middle" fill="#fde68a" fontSize={14} fontWeight={700}>
              Bilyeler masaya dizildi!
            </text>
          </g>
        ) : null}

        {/* Kutu Bölmeleri */}
        {layout.boxes.map((box) => (
          <g key={box.label}>
            <rect
              x={box.x}
              y={box.y}
              width={box.w}
              height={box.h}
              rx={16}
              fill="rgba(15, 23, 42, 0.65)"
              stroke="rgba(56, 189, 248, 0.48)"
              strokeWidth={2.5}
            />
            <text
              x={box.x + box.w / 2}
              y={box.y + 20}
              textAnchor="middle"
              fill="#93c5fd"
              fontSize={14}
              fontWeight={800}
            >
              {box.label}
            </text>
          </g>
        ))}

        {/* Kalan Bilye Bölmesi (5'erli gruplamada) */}
        {layout.remainderZone ? (
          <g>
            <rect
              x={layout.remainderZone.x}
              y={layout.remainderZone.y}
              width={layout.remainderZone.w}
              height={layout.remainderZone.h}
              rx={16}
              fill="rgba(136, 19, 55, 0.32)"
              stroke="#fb7185"
              strokeWidth={2.5}
              strokeDasharray="6 4"
            />
            <text
              x={layout.remainderZone.x + layout.remainderZone.w / 2}
              y={layout.remainderZone.y + 22}
              textAnchor="middle"
              fill="#fda4af"
              fontSize={12}
              fontWeight={800}
              textLength={132}
              lengthAdjust="spacingAndGlyphs"
            >
              {layout.remainderZone.label}
            </text>
          </g>
        ) : null}

        {/* 12 Cam Bilye (Yay Fiziği ile Koordinatlar Arası Kayar) */}
        {layout.marbles.map((coord, idx) => (
          <MarbleGem
            key={`marble-${idx}`}
            index={idx}
            x={coord.x}
            y={coord.y}
            radius={layout.radius}
            isRemainder={coord.isRemainder}
            visible={marblesSpawned}
          />
        ))}
      </svg>

      {/* Kavram çağrısı tuvalin altında durur; bilye ölçeğini düşürmez. */}
      {callout ? (
        <div className="absolute inset-x-2 bottom-2 z-10 flex items-center gap-3 rounded-xl border border-amber-400/40 bg-slate-950/90 px-4 py-2 text-amber-100 shadow-lg">
          <span className="shrink-0 rounded-lg bg-amber-400 px-2.5 py-1 text-xs font-black tracking-wide text-slate-950">
            {callout.badge}
          </span>
          <p className="text-xs font-bold leading-snug sm:text-sm">{callout.text}</p>
        </div>
      ) : null}
    </div>
  );
}
