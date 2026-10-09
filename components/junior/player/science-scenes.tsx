import type { ReactNode } from "react";
import {
  Ink,
  stickySpeedParams,
  SceneFoot,
  SceneTitle,
  SoftCard,
  SoftFocus,
  SoftStage,
} from "@/components/junior/player/scene-ui";
import type { JuniorVectorScene } from "@/lib/junior/types";

export type ScienceJuniorScene =
  | "force"
  | "speed"
  | "friction"
  | "planets"
  | "eclipse"
  | "body"
  | "blood"
  | "particles"
  | "sound"
  | "circuit";

export function isScienceJuniorScene(scene: JuniorVectorScene): scene is ScienceJuniorScene {
  return (
    scene === "force" ||
    scene === "speed" ||
    scene === "friction" ||
    scene === "planets" ||
    scene === "eclipse" ||
    scene === "body" ||
    scene === "blood" ||
    scene === "particles" ||
    scene === "sound" ||
    scene === "circuit"
  );
}

export function scienceRecapName(scene: JuniorVectorScene): string | null {
  if (scene === "force") return "Kuvvet";
  if (scene === "speed") return "Sürat";
  if (scene === "friction") return "Sürtünme";
  if (scene === "planets") return "Gezegen";
  if (scene === "eclipse") return "Tutulma";
  if (scene === "body") return "Sistem";
  if (scene === "blood") return "Dolaşım";
  if (scene === "particles") return "Madde";
  if (scene === "sound") return "Ses";
  if (scene === "circuit") return "Devre";
  return null;
}

function Stage({ scene, children }: { scene: Parameters<typeof SoftStage>[0]["scene"]; children: ReactNode }) {
  return (
    <SoftStage scene={scene} gradientId="sci-stage-bg">
      {children}
    </SoftStage>
  );
}

function Arrow({
  x1,
  x2,
  y,
  color,
  label,
}: {
  x1: number;
  x2: number;
  y: number;
  color: string;
  label: string;
}) {
  const forward = x2 > x1;
  const tip = forward
    ? `${x2},${y} ${x2 - 12},${y - 7} ${x2 - 12},${y + 7}`
    : `${x2},${y} ${x2 + 12},${y - 7} ${x2 + 12},${y + 7}`;
  const textX = Math.min(x1, x2);
  return (
    <g>
      <line x1={x1} y1={y} x2={forward ? x2 - 12 : x2 + 12} y2={y} stroke={color} strokeWidth="4" />
      <polygon points={tip} fill={color} />
      <text x={textX} y={y - 10} fill={color} fontSize="12" fontFamily="inherit" fontWeight="700">
        {label}
      </text>
    </g>
  );
}

/** Bileşke kuvvet: sabit sahne; yalnız ok vurgusu kayar (kutunun yeri oynamaz). */
export function ForceScene({ beat }: { beat: number }) {
  const balanced = beat >= 7;
  const hotPush = beat >= 1 && beat <= 3;
  const hotPull = beat >= 4 && beat <= 6;
  const title = balanced ? "Dengelenmiş kuvvet" : hotPull ? "Zıt yön — fark alınır" : "Aynı yön toplanır";

  return (
    <Stage scene="force">
      <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {title}
      </text>
      <line x1="24" y1="156" x2="336" y2="156" stroke="#94a3b8" strokeWidth="3" />
      <rect x={156} y="84" width="64" height="52" rx="8" fill="#fde68a" stroke="#0284c7" strokeWidth="2" />
      <SoftFocus active={hotPush || balanced}>
        <Arrow x1={28} x2={120} y={108} color="#e11d48" label={balanced ? "6 N" : "Sağa"} />
      </SoftFocus>
      <SoftFocus active={hotPull || balanced}>
        <Arrow x1={148} x2={36} y={128} color="#2563eb" label={balanced ? "6 N" : "Sola"} />
      </SoftFocus>
      <text
        x="200"
        y="108"
        fill="#15803d"
        fontSize="14"
        fontFamily="inherit"
        fontWeight="700"
        opacity={balanced ? 1 : 0.25}
      >
        Bileşke 0
      </text>
      <text x="24" y="176" fill="#0f172a" fontSize="13" fontFamily="inherit">
        {balanced ? "Eşit zıt oklar dengelenir." : hotPull ? "Zıt yönlerde fark alınır." : "Aynı yönlü oklar toplanır."}
      </text>
    </Stage>
  );
}

/** Sabit sürat: yol-zaman ve sürat-zaman; mesafe/zaman yapışkan izden. */
export function SpeedScene({
  beat,
  caption = "",
  captionTrail,
}: {
  beat: number;
  caption?: string;
  captionTrail?: readonly string[];
}) {
  const trail = captionTrail && captionTrail.length > 0 ? captionTrail : caption.trim() ? [caption] : [];
  const { distance, time, speed } = stickySpeedParams(trail);
  const speedLabel = Number.isInteger(speed) ? String(speed) : speed.toFixed(1);
  const showSpeedGraph = beat >= 5;
  const trap = beat >= 7;
  const title = trap
    ? "Yolla zamanı çarpma"
    : showSpeedGraph
      ? "Sürat yatay kalır"
      : beat >= 3
        ? "Yol zamanla artar"
        : "Sürat = yol ÷ zaman";

  return (
    <Stage scene="speed">
      <SceneTitle>{title}</SceneTitle>
      <line x1="48" y1="160" x2="300" y2="160" stroke={Ink.strokeHot} strokeWidth="2" />
      <line x1="48" y1="160" x2="48" y2="48" stroke={Ink.strokeHot} strokeWidth="2" />
      <text x="304" y="164" fill={Ink.muted} fontSize="12" fontFamily="inherit">
        zaman
      </text>
      <text x="16" y="44" fill={Ink.muted} fontSize="12" fontFamily="inherit">
        {showSpeedGraph ? "sürat" : "yol"}
      </text>
      {showSpeedGraph ? (
        <line x1="48" y1="96" x2="280" y2="96" stroke={Ink.roseInk} strokeWidth="4" />
      ) : (
        <line x1="48" y1="150" x2="260" y2={beat >= 2 ? 70 : 120} stroke={Ink.accent} strokeWidth="4" />
      )}
      {beat >= 4 && !showSpeedGraph ? (
        <SoftCard x={150} y={82} w={180} h={28} fill={Ink.sky} rx={10} />
      ) : null}
      {beat >= 4 && !showSpeedGraph ? (
        <text x="240" y="102" textAnchor="middle" fill={Ink.accent} fontSize="13" fontFamily="inherit" fontWeight="700">
          {distance} m ÷ {time} s = {speedLabel} m/s
        </text>
      ) : null}
      {trap ? (
        <>
          <text x="160" y="176" fill={Ink.roseInk} fontSize="14" fontFamily="inherit" fontWeight="700">
            {distance} × {time} değil
          </text>
          <line x1="158" y1="170" x2="268" y2="182" stroke={Ink.roseInk} strokeWidth="2" />
        </>
      ) : (
        <SceneFoot y={184}>Sabit süratte eşit zamanda eşit yol.</SceneFoot>
      )}
    </Stage>
  );
}

/** Sürtünme: kutu ve zemin sabit; yalnız ok vurgusu / dipnot kayar. */
export function FrictionScene({ beat }: { beat: number }) {
  const rough = beat <= 3 || beat === 6;
  const trap = beat >= 8;
  const longFriction = beat === 2 || beat === 3 || beat === 6;
  const boxX = 156;
  const title = trap
    ? "Sıfır değil. Sürtünme kuvvettir."
    : rough
      ? "Pürüzlü yer — sürtünme uzar"
      : "Düz yer — sürtünme kısalır";

  return (
    <Stage scene="friction">
      <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {title}
      </text>
      <polyline
        points="20,150 48,136 76,154 104,132 132,154 160,134 188,154 216,132 244,154 272,136 300,154 336,140"
        fill="none"
        stroke="#78716c"
        strokeWidth={rough ? 4 : 2}
        opacity={rough ? 1 : 0.25}
      />
      <line
        x1="20"
        y1="150"
        x2="340"
        y2="150"
        stroke="#7dd3fc"
        strokeWidth="4"
        opacity={rough ? 0.2 : 1}
      />
      <rect x={boxX} y="98" width="68" height="44" rx="8" fill="#fde68a" stroke="#0284c7" strokeWidth="2" />
      <SoftFocus active={!trap}>
        <Arrow x1={boxX + 72} x2={boxX + (longFriction ? 130 : 150)} y={120} color="#16a34a" label="Hareket" />
        <Arrow
          x1={boxX - 8}
          x2={boxX - (longFriction ? 78 : 40)}
          y={78}
          color="#e11d48"
          label={trap ? "Az kaldı" : "Sürtünme"}
        />
      </SoftFocus>
      <text
        x="24"
        y="176"
        fill={trap ? "#e11d48" : "#0f172a"}
        fontSize="13"
        fontFamily="inherit"
        fontWeight={trap ? "700" : "500"}
      >
        {trap ? "Sürtünme sıfır yazılmaz." : "Sürtünme ters yönde bir kuvvettir."}
      </text>
    </Stage>
  );
}

/** Güneş sistemi: 8 gezegen + Güneş sabit; yalnız vurgu kayar. */
export function PlanetScene({ beat }: { beat: number }) {
  const names = ["Merkür", "Venüs", "Dünya", "Mars", "Jüpiter", "Satürn", "Uranüs", "Neptün"];
  const focus = Math.min(names.length - 1, Math.max(0, beat));
  return (
    <Stage scene="planets">
      <text x="16" y="24" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Güneş sistemi sırası
      </text>
      <ellipse cx="40" cy="100" rx="18" ry="18" fill="none" stroke="#fbbf24" strokeWidth="1.5" opacity="0.5" />
      <ellipse cx="40" cy="100" rx="48" ry="28" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      <ellipse cx="40" cy="100" rx="92" ry="48" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      <circle cx="40" cy="100" r="18" fill="#fde68a" stroke="#0284c7" strokeWidth="2" />
      <text x="22" y="148" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
        Güneş
      </text>
      {names.map((name, index) => {
        const cx = 78 + index * 34;
        const active = index === focus;
        return (
          <g
            key={name}
            opacity={active ? 1 : 0.55}
            data-junior-focus={active ? "on" : "off"}
          >
            <circle
              cx={cx}
              cy={100}
              r={name === "Jüpiter" ? 14 : name === "Satürn" ? 12 : name === "Dünya" ? 9 : 7}
              fill={name === "Dünya" ? "#38bdf8" : name === "Mars" ? "#fb923c" : name === "Jüpiter" ? "#fcd34d" : "#e2e8f0"}
              stroke={active ? "#0284c7" : "#cbd5e1"}
              strokeWidth={active ? 2.5 : 1.5}
            />
            {name === "Satürn" ? (
              <ellipse cx={cx} cy={100} rx="18" ry="5" fill="none" stroke="#92400e" strokeWidth="1.5" />
            ) : null}
            {name === "Dünya" ? (
              <circle
                cx={cx + 14}
                cy={84}
                r="4"
                fill="#cbd5e1"
                stroke="#cbd5e1"
                strokeWidth="1"
                opacity={beat >= 6 ? 1 : 0.2}
              />
            ) : null}
            <text x={cx} y={172} textAnchor="middle" fill="#0f172a" fontSize="9" fontFamily="inherit" fontWeight={active ? "700" : "500"}>
              {name.slice(0, 3)}
            </text>
          </g>
        );
      })}
      <text x="16" y="192" fill="#0f172a" fontSize="12" fontFamily="inherit">
        {beat >= 7 ? "Ay uydudur. Sıraya yazılmaz." : `${names[focus]} vurgulanır.`}
      </text>
    </Stage>
  );
}

/** Güneş / Ay tutulması hizası. */
export function EclipseScene({ beat }: { beat: number }) {
  const solar = beat < 4;
  return (
    <Stage scene="eclipse">
      <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {solar ? "Güneş tutulması, gündüz" : "Ay tutulması, gece"}
      </text>
      <circle cx="48" cy="100" r="26" fill="#fde68a" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="30" y="148" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
        Güneş
      </text>
      {solar ? (
        <>
          <polygon points="74,100 150,88 150,112" fill="#0f172a" opacity="0.15" />
          <circle cx="150" cy="100" r="16" fill="#0f172a" />
          <circle cx="270" cy="100" r="28" fill="#38bdf8" stroke="#cbd5e1" strokeWidth="1.5" />
          <text x="138" y="148" fill="#0f172a" fontSize="12" fontFamily="inherit">
            Ay
          </text>
          <text x="248" y="148" fill="#0f172a" fontSize="12" fontFamily="inherit">
            Dünya
          </text>
          {beat >= 2 ? (
            <text x="180" y="176" fill="#b45309" fontSize="12" fontFamily="inherit" fontWeight="700">
              Arada Ay vardır
            </text>
          ) : null}
        </>
      ) : (
        <>
          <polygon points="74,100 170,86 170,114" fill="#0f172a" opacity="0.12" />
          <circle cx="170" cy="100" r="28" fill="#38bdf8" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="286" cy="100" r="16" fill="#cbd5e1" stroke="#cbd5e1" strokeWidth="2" />
          <text x="150" y="148" fill="#0f172a" fontSize="12" fontFamily="inherit">
            Dünya
          </text>
          <text x="274" y="148" fill="#0f172a" fontSize="12" fontFamily="inherit">
            Ay
          </text>
          {beat >= 5 ? (
            <text x="180" y="176" fill="#b45309" fontSize="12" fontFamily="inherit" fontWeight="700">
              Arada Dünya vardır
            </text>
          ) : null}
        </>
      )}
      {beat >= 7 ? (
        <text x="16" y="192" fill="#e11d48" fontSize="12" fontFamily="inherit" fontWeight="700">
          Güneş&apos;e çıplak gözle bakma.
        </text>
      ) : null}
    </Stage>
  );
}

type BodyMode = "skeleton" | "digest" | "breath" | "kidney" | "nerve" | "sense" | "aid";

function bodyMode(caption: string): BodyMode {
  const text = caption.toLocaleLowerCase("tr-TR");
  if (/sindir|enzim|safra|bağırsak|mide|çiğne|villus/.test(text)) return "digest";
  if (/soluk|akciğer|diyafram|alveol|nefes/.test(text)) return "breath";
  if (/böbrek|idrar|ter|boşalt|süz/.test(text)) return "kidney";
  if (/sinir|hormon|refleks|omurilik|denet/.test(text)) return "nerve";
  if (/göz|kulak|dil|deri|tat|duyu|burun|ışık/.test(text)) return "sense";
  if (/112|kanama|yardım|güven|bilinç/.test(text)) return "aid";
  return "skeleton";
}

/** Vücut sistemleri: caption ile iskelet / sindirim / solunum / boşaltım / sinir / duyu / ilk yardım. */
export function BodyScene({ beat, caption }: { beat: number; caption: string }) {
  const mode = bodyMode(caption);
  const title =
    mode === "digest"
      ? "Sindirim yolu"
      : mode === "breath"
        ? "Solunum"
        : mode === "kidney"
          ? "Boşaltım"
          : mode === "nerve"
            ? "Denetim"
            : mode === "sense"
              ? "Duyu organları"
              : mode === "aid"
                ? "İlk yardım"
                : "Destek ve hareket";

  return (
    <Stage scene="body">
      <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {title}
      </text>
      {mode === "skeleton" ? (
        <>
          <circle cx="90" cy="58" r="16" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="90" y1="74" x2="90" y2="132" stroke="#cbd5e1" strokeWidth="5" />
          <line x1="90" y1="92" x2="52" y2="118" stroke="#cbd5e1" strokeWidth="4" />
          <line x1="90" y1="92" x2="128" y2="118" stroke="#cbd5e1" strokeWidth="4" />
          <line x1="90" y1="132" x2="64" y2="168" stroke="#cbd5e1" strokeWidth="4" />
          <line x1="90" y1="132" x2="116" y2="168" stroke="#cbd5e1" strokeWidth="4" />
          {beat >= 2 ? (
            <ellipse cx="118" cy="100" rx="14" ry="22" fill="#fecaca" stroke="#cbd5e1" strokeWidth="2" opacity="0.85" />
          ) : null}
          <text x="160" y="80" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
            Kemik destekler
          </text>
          <text x="160" y="104" fill="#0f172a" fontSize="13" fontFamily="inherit">
            {beat >= 3 ? "Kas çeker" : "Eklem menteşedir"}
          </text>
          <text x="160" y="128" fill="#0369a1" fontSize="12" fontFamily="inherit">
            {beat >= 5 ? "Kıkırdak esnektir" : "İkisi birlikte hareket eder"}
          </text>
        </>
      ) : null}
      {mode === "digest" ? (
        <>
          <ellipse cx="70" cy="52" rx="22" ry="14" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
          <text x="56" y="56" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
            Ağız
          </text>
          <line x1="70" y1="66" x2="70" y2="96" stroke="#cbd5e1" strokeWidth="1.5" />
          <ellipse cx="88" cy="118" rx="28" ry="20" fill="#fdba74" stroke="#cbd5e1" strokeWidth="2" />
          <text x="72" y="122" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
            Mide
          </text>
          <path d="M110 130 C150 110 170 150 210 120 C240 100 260 140 290 128" fill="none" stroke="#86efac" strokeWidth="8" strokeLinecap="round" />
          <text x="200" y="168" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
            {beat >= 4 ? "İnce bağırsak · emilim" : "Sindirim yolu"}
          </text>
          {beat >= 5 ? (
            <text x="16" y="188" fill="#b45309" fontSize="12" fontFamily="inherit">
              Safra enzim değildir. Emilim midede değil.
            </text>
          ) : null}
        </>
      ) : null}
      {mode === "breath" ? (
        <>
          <ellipse cx="120" cy="90" rx="28" ry="40" fill="#bae6fd" stroke="#cbd5e1" strokeWidth="2" />
          <ellipse cx="180" cy="90" rx="28" ry="40" fill="#bae6fd" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="150" y1="40" x2="150" y2="70" stroke="#cbd5e1" strokeWidth="1.5" />
          <path
            d={`M90 ${beat >= 3 ? 148 : 138} Q150 ${beat >= 3 ? 168 : 152} 210 ${beat >= 3 ? 148 : 138}`}
            fill="none"
            stroke="#b45309"
            strokeWidth="4"
          />
          <text x="230" y="80" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
            Akciğer
          </text>
          <text x="230" y="104" fill="#0f172a" fontSize="12" fontFamily="inherit">
            {beat >= 3 ? "Diyafram kasılır" : "Soluk alınır"}
          </text>
          <text x="230" y="128" fill="#0369a1" fontSize="12" fontFamily="inherit">
            {beat >= 5 ? "Alveollerde gaz değişimi" : "Hava yolu açık"}
          </text>
        </>
      ) : null}
      {mode === "kidney" ? (
        <>
          <ellipse cx="100" cy="80" rx="28" ry="36" fill="#fda4af" stroke="#cbd5e1" strokeWidth="2" />
          <ellipse cx="180" cy="80" rx="28" ry="36" fill="#fda4af" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="100" y1="116" x2="140" y2="150" stroke="#cbd5e1" strokeWidth="2" />
          <line x1="180" y1="116" x2="150" y2="150" stroke="#cbd5e1" strokeWidth="2" />
          <ellipse cx="150" cy="162" rx="22" ry="14" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
          <text x="230" y="76" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
            Böbrekler
          </text>
          <text x="230" y="100" fill="#0f172a" fontSize="12" fontFamily="inherit">
            Kanı süzer
          </text>
          <text x="230" y="124" fill="#0369a1" fontSize="12" fontFamily="inherit">
            {beat >= 4 ? "Ter ayrı yoldur" : "İdrar yolu"}
          </text>
        </>
      ) : null}
      {mode === "nerve" ? (
        <>
          <ellipse cx="120" cy="58" rx="36" ry="28" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
          <text x="100" y="62" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
            Beyin
          </text>
          <line x1="120" y1="86" x2="120" y2="168" stroke="#cbd5e1" strokeWidth="6" />
          {[0, 1, 2, 3].map((index) => (
            <circle
              key={index}
              cx={120 + (index % 2 === 0 ? -28 : 28)}
              cy={100 + index * 16}
              r="5"
              fill={beat >= index + 1 ? "#38bdf8" : "#e2e8f0"}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
          ))}
          <text x="200" y="90" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
            Sinir hızlıdır
          </text>
          <text x="200" y="114" fill="#0f172a" fontSize="12" fontFamily="inherit">
            {beat >= 4 ? "Hormon uzun sürer" : "Omurilik ileti taşır"}
          </text>
          <text x="200" y="138" fill="#0369a1" fontSize="12" fontFamily="inherit">
            {beat >= 5 ? "Refleks omurilikte" : "Denetim birlikte"}
          </text>
        </>
      ) : null}
      {mode === "sense" ? (
        <>
          {[
            { label: "Göz", x: 40 },
            { label: "Kulak", x: 110 },
            { label: "Burun", x: 180 },
            { label: "Dil", x: 250 },
            { label: "Deri", x: 310 },
          ]
            .slice(0, beat >= 4 ? 5 : beat >= 2 ? 3 : 2)
            .map((item) => (
              <g key={item.label}>
                <circle cx={item.x} cy={100} r="22" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
                <text x={item.x} y={104} textAnchor="middle" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
                  {item.label}
                </text>
              </g>
            ))}
          <text x="16" y="168" fill="#0f172a" fontSize="12" fontFamily="inherit">
            {beat >= 5 ? "Kulak dengeyi de taşır." : "Almaçlar haberi alır."}
          </text>
        </>
      ) : null}
      {mode === "aid" ? (
        <>
          <rect x="120" y="50" width="100" height="100" rx="12" fill="#fff" stroke="#e11d48" strokeWidth="3" />
          <rect x="158" y="68" width="24" height="64" fill="#e11d48" />
          <rect x="138" y="88" width="64" height="24" fill="#e11d48" />
          <text x="240" y="90" fill="#0f172a" fontSize="22" fontFamily="inherit" fontWeight="700">
            112
          </text>
          <text x="16" y="176" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
            {beat >= 5 ? "Bilinci kapalıya su verme." : "Önce güvenlik, sonra yardım."}
          </text>
        </>
      ) : null}
    </Stage>
  );
}

/** Dolaşım / kalp döngüsü veya kan grupları. */
export function BloodScene({ beat, caption }: { beat: number; caption: string }) {
  const groups = /grup|bağış|Rh|0 eksi|verici/u.test(caption);
  return (
    <Stage scene="blood">
      <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {groups ? "Kan grupları" : "Kalp ve dolaşım"}
      </text>
      {groups ? (
        <>
          {["A", "B", "AB", "0"].map((label, index) => (
            <g key={label}>
              <rect
                x={24 + index * 82}
                y="70"
                width="70"
                height="48"
                rx="10"
                fill={index === Math.min(beat, 3) ? "#fecaca" : "#fff"}
                stroke="#cbd5e1"
                strokeWidth="2"
              />
              <text x={48 + index * 82} y="100" fill="#0f172a" fontSize="18" fontFamily="inherit" fontWeight="700">
                {label}
              </text>
            </g>
          ))}
          <text x="24" y="156" fill="#0369a1" fontSize="13" fontFamily="inherit">
            Rh artı ve eksi de uyuma katılır.
          </text>
          {beat >= 6 ? (
            <text x="24" y="180" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
              0 eksi en genel verici sayılır.
            </text>
          ) : null}
        </>
      ) : (
        <>
          <path
            d="M150 70 C190 40 250 70 250 110 C250 150 190 170 150 150 C110 170 50 150 50 110 C50 70 110 40 150 70"
            fill="#fecaca"
            stroke="#cbd5e1"
            strokeWidth="2"
          />
          <text x="128" y="118" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
            Kalp
          </text>
          <ellipse cx="300" cy="70" rx="28" ry="18" fill="#bae6fd" stroke="#cbd5e1" strokeWidth="2" />
          <text x="282" y="74" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
            Akciğer
          </text>
          {beat >= 2 ? (
            <>
              <path d="M170 80 C220 60 270 60 290 70" fill="none" stroke="#2563eb" strokeWidth="3" />
              <path d="M290 80 C250 120 190 130 160 120" fill="none" stroke="#e11d48" strokeWidth="3" />
              <text x="200" y="52" fill="#2563eb" fontSize="11" fontFamily="inherit" fontWeight="700">
                Küçük
              </text>
            </>
          ) : null}
          {beat >= 3 ? (
            <>
              <path d="M130 130 C80 160 40 150 30 120" fill="none" stroke="#16a34a" strokeWidth="3" />
              <path d="M30 100 C60 60 110 55 140 70" fill="none" stroke="#dc2626" strokeWidth="3" />
              <text x="16" y="176" fill="#15803d" fontSize="12" fontFamily="inherit" fontWeight="700">
                Büyük dolaşım vücuda gider
              </text>
            </>
          ) : null}
          {beat >= 5 ? (
            <text x="160" y="192" fill="#e11d48" fontSize="11" fontFamily="inherit" fontWeight="700">
              Akciğer atardamarı oksijence fakir taşır
            </text>
          ) : (
            <text x="200" y="176" fill="#0f172a" fontSize="12" fontFamily="inherit">
              {beat >= 1 ? "Dört odacık pompalar" : "Kan damarda dolaşır"}
            </text>
          )}
        </>
      )}
    </Stage>
  );
}

type ParticleMode = "solid" | "liquid" | "gas" | "density" | "heat";

function particleMode(caption: string, beat: number): ParticleMode {
  const text = caption.toLocaleLowerCase("tr-TR");
  if (/yoğun|yüzer|batar|santimetreküp|kütlenin hacme|kütle bölü|gram bölü/.test(text)) return "density";
  if (/ısı ilet|ısı bir enerji|ısı aktar|iletken|yalıtkan|kaşık|strafor|mont.*ısı|metaller ısı|sıcaklık.*derece/.test(text)) {
    return "heat";
  }
  if (/gaz|buhar|koku/.test(text)) return "gas";
  if (/sıvı|kayar/.test(text)) return "liquid";
  if (/katı|titreş/.test(text)) return "solid";
  if (beat >= 5) return "gas";
  if (beat >= 2) return "liquid";
  return "solid";
}

/** Tanecik halleri, yoğunluk kulesi veya ısı iletimi. */
export function ParticleScene({ beat, caption }: { beat: number; caption: string }) {
  const mode = particleMode(caption, beat);
  const title =
    mode === "density"
      ? "Yoğunluk kulesi"
      : mode === "heat"
        ? "Isı iletimi"
        : mode === "gas"
          ? "Gaz tanecikleri"
          : mode === "liquid"
            ? "Sıvı tanecikleri"
            : "Katı tanecikleri";

  const spots =
    mode === "solid"
      ? [
          [70, 80],
          [100, 80],
          [130, 80],
          [70, 110],
          [100, 110],
          [130, 110],
        ]
      : mode === "liquid"
        ? [
            [64, 90],
            [102, 78],
            [136, 98],
            [78, 122],
            [118, 124],
          ]
        : [
            [60, 70],
            [150, 60],
            [230, 90],
            [90, 130],
            [190, 140],
            [280, 120],
          ];

  return (
    <Stage scene="particles">
      <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {title}
      </text>
      {mode === "heat" ? (
        <>
          <rect x="48" y="60" width="22" height="90" rx="4" fill="#d97706" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="48" y="50" width="22" height="14" rx="3" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="120" y="60" width="22" height="90" rx="4" fill="#a8a29e" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="120" y="50" width="22" height="14" rx="3" fill="#fafaf9" stroke="#cbd5e1" strokeWidth="2" />
          <text x="40" y="172" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
            Metal iletir
          </text>
          <text x="112" y="172" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
            Tahta yalıtır
          </text>
          <text x="200" y="100" fill="#0369a1" fontSize="13" fontFamily="inherit">
            Isı enerjidir
          </text>
          <text x="200" y="124" fill="#0f172a" fontSize="12" fontFamily="inherit">
            Sıcaklık derecedir
          </text>
        </>
      ) : null}
      {mode === "density" ? (
        <>
          <rect x="80" y="48" width="90" height="120" rx="8" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="1.5" />
          <rect x="84" y="52" width="82" height="28" fill="#fde68a" opacity="0.9" />
          <rect x="84" y="80" width="82" height="40" fill="#38bdf8" opacity="0.55" />
          <rect x="84" y="120" width="82" height="44" fill="#b45309" opacity="0.55" />
          <text x="190" y="70" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
            Yağ · yüzer
          </text>
          <text x="190" y="104" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
            Su ≈ 1 g/cm³
          </text>
          <text x="190" y="140" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
            Bal · batar
          </text>
          {beat >= 4 ? (
            <text x="190" y="172" fill="#e11d48" fontSize="12" fontFamily="inherit" fontWeight="700">
              Ağır değil, yoğun olan batar
            </text>
          ) : (
            <text x="190" y="172" fill="#0369a1" fontSize="12" fontFamily="inherit">
              d = m ÷ V
            </text>
          )}
        </>
      ) : null}
      {mode === "solid" || mode === "liquid" || mode === "gas"
        ? spots.map(([x, y]) => (
            <circle key={`${mode}-${x}-${y}`} cx={x} cy={y} r="10" fill="#38bdf8" stroke="#cbd5e1" strokeWidth="2" />
          ))
        : null}
      {(mode === "solid" || mode === "liquid" || mode === "gas") && beat >= 4 ? (
        <text x="200" y="100" fill="#0f172a" fontSize="12" fontFamily="inherit">
          {mode === "solid" ? "Sıkı titreşir" : mode === "liquid" ? "Kayarak kayar" : "Serbest dağılır"}
        </text>
      ) : null}
    </Stage>
  );
}

/** Ses dalgası, ortam hızı, yankı ve soğurma. */
export function SoundScene({ beat, caption }: { beat: number; caption: string }) {
  const text = caption.toLocaleLowerCase("tr-TR");
  const echo = /yankı|yansır|duvar|soğur|perde|halı|yalıtım/.test(text);
  const medium = /katı|sıvı|gaz|ortam|sürat|340|boşluk|uzay/.test(text);
  const title = echo
    ? beat >= 6
      ? "Perde ve halı soğurur"
      : "Yankı yansımadır"
    : medium
      ? "Ortam hızı değişir"
      : "Ses tanecikle gider";

  return (
    <Stage scene="sound">
      <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {title}
      </text>
      <circle cx="48" cy="100" r="12" fill="#0f172a" />
      <path d="M78 78 q30 22 0 44" fill="none" stroke="#0369a1" strokeWidth="3" />
      <path d="M98 64 q46 36 0 72" fill="none" stroke="#0369a1" strokeWidth="3" />
      <path d="M118 50 q62 50 0 100" fill="none" stroke="#7dd3fc" strokeWidth="2" />
      {medium && !echo ? (
        <>
          <rect x="200" y="60" width="40" height="90" rx="6" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="250" y="80" width="40" height="70" rx="6" fill="#bae6fd" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="300" y="100" width="40" height="50" rx="6" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
          <text x="208" y="170" fill="#0f172a" fontSize="10" fontFamily="inherit" fontWeight="700">
            Katı
          </text>
          <text x="258" y="170" fill="#0f172a" fontSize="10" fontFamily="inherit" fontWeight="700">
            Sıvı
          </text>
          <text x="308" y="170" fill="#0f172a" fontSize="10" fontFamily="inherit" fontWeight="700">
            Gaz
          </text>
        </>
      ) : null}
      {echo ? <rect x="250" y="60" width="18" height="80" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" /> : null}
      {echo && beat >= 6 ? (
        <rect x="278" y="60" width="36" height="80" rx="6" fill="#bbf7d0" stroke="#cbd5e1" strokeWidth="2" />
      ) : null}
      <text x="16" y="184" fill="#0f172a" fontSize="12" fontFamily="inherit">
        {beat >= 3 && !echo ? "Boşlukta ses durur." : echo && beat >= 6 ? "Soğurma yalıtımdır." : "Titreşim madde ister."}
      </text>
    </Stage>
  );
}

/** Elektrik devresi: tam şablon sabit; pil / tel / lamba yalnız vurgulanır. */
export function CircuitScene({ beat, caption }: { beat: number; caption: string }) {
  const text = caption.toLocaleLowerCase("tr-TR");
  const resistance = /direnç|kesit|nikel|kalınlaş|tel uzad|uzun tel|kalın tel|parlak|sönük|ampul/.test(text);
  const salt = /tuz|saf su|ıslak/.test(text);
  const thickWire = resistance && (/kalın|parlak/.test(text) || beat >= 6);
  const lampOn = !(beat === 3 && !resistance) && !(/yalıtkan|plastik/.test(text) && beat === 3);
  const hotBattery = beat <= 1;
  const hotWire = beat >= 1;
  const hotLamp = beat >= 2;

  return (
    <Stage scene="circuit">
      <SceneTitle>
        {resistance ? "Direnç boy ve kesitle değişir" : salt ? "Tuzlu su iletir" : "İletken yolu açar"}
      </SceneTitle>
      <SoftFocus active={hotBattery}>
        <SoftCard x={36} y={78} w={40} h={28} fill={Ink.amber} rx={8} hot={hotBattery} />
        <text x="56" y="96" textAnchor="middle" fill={Ink.text} fontSize="11" fontFamily="inherit" fontWeight="700">
          Pil
        </text>
      </SoftFocus>
      <SoftFocus active={hotWire}>
        <line x1={76} y1={92} x2={resistance ? 130 : 150} y2={92} stroke={Ink.strokeHot} strokeWidth={thickWire ? 8 : 3} />
        {resistance ? (
          <path d="M130 92 l8 -12 8 24 8 -24 8 24 8 -12" fill="none" stroke={Ink.amberInk} strokeWidth="3" />
        ) : null}
        <line x1={resistance ? 178 : 150} y1={92} x2={210} y2={92} stroke={Ink.strokeHot} strokeWidth="2" />
        <line x1="250" y1="92" x2="300" y2="92" stroke={Ink.strokeHot} strokeWidth="2" />
        <line x1="300" y1="92" x2="300" y2="140" stroke={Ink.strokeHot} strokeWidth="2" />
        <line x1="300" y1="140" x2="56" y2="140" stroke={Ink.strokeHot} strokeWidth="2" />
        <line x1="56" y1="140" x2="56" y2="106" stroke={Ink.strokeHot} strokeWidth="2" />
      </SoftFocus>
      <SoftFocus active={hotLamp}>
        <circle
          cx="232"
          cy="92"
          r="18"
          fill={lampOn ? (thickWire ? Ink.amberFill : "#fef08a") : "#e2e8f0"}
          stroke={hotLamp ? Ink.accent : Ink.stroke}
          strokeWidth={hotLamp ? 2.5 : 2}
        />
      </SoftFocus>
      <SceneFoot y={176}>
        {beat === 3 && !resistance
          ? "Yalıtkan bağlanınca lamba söner"
          : resistance
            ? thickWire
              ? "Kalın tel: düşük direnç, parlak lamba"
              : "Uzun tel: yüksek direnç"
            : salt
              ? "Saf su yalıtır, tuzlu su iletir"
              : "Metal iletir, plastik yalıtır"}
      </SceneFoot>
    </Stage>
  );
}

export function ScienceSceneArt({
  scene,
  beat,
  caption,
  captionTrail,
}: {
  scene: ScienceJuniorScene;
  beat: number;
  caption: string;
  captionTrail?: readonly string[];
}) {
  if (scene === "force") return <ForceScene beat={beat} />;
  if (scene === "speed") return <SpeedScene beat={beat} caption={caption} captionTrail={captionTrail} />;
  if (scene === "friction") return <FrictionScene beat={beat} />;
  if (scene === "planets") return <PlanetScene beat={beat} />;
  if (scene === "eclipse") return <EclipseScene beat={beat} />;
  if (scene === "blood") return <BloodScene beat={beat} caption={caption} />;
  if (scene === "body") return <BodyScene beat={beat} caption={caption} />;
  if (scene === "particles") return <ParticleScene beat={beat} caption={caption} />;
  if (scene === "sound") return <SoundScene beat={beat} caption={caption} />;
  return <CircuitScene beat={beat} caption={caption} />;
}
