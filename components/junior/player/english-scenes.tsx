import type { ReactNode } from "react";
import { SoftStage } from "@/components/junior/player/scene-ui";
import type { JuniorVectorScene } from "@/lib/junior/types";

export type EnglishJuniorScene =
  | "clock"
  | "tray"
  | "skyline"
  | "weather"
  | "fair"
  | "badge"
  | "shelf"
  | "holiday"
  | "recycle"
  | "ballot"
  | "family"
  | "universe"
  | "world"
  | "rules";

export function isEnglishJuniorScene(scene: JuniorVectorScene): scene is EnglishJuniorScene {
  return (
    scene === "clock" ||
    scene === "tray" ||
    scene === "skyline" ||
    scene === "weather" ||
    scene === "fair" ||
    scene === "badge" ||
    scene === "shelf" ||
    scene === "holiday" ||
    scene === "recycle" ||
    scene === "ballot" ||
    scene === "family" ||
    scene === "universe" ||
    scene === "world" ||
    scene === "rules"
  );
}

export function englishRecapName(scene: JuniorVectorScene): string | null {
  if (scene === "clock") return "Saat";
  if (scene === "tray") return "Tepsi";
  if (scene === "skyline") return "Şehir";
  if (scene === "weather") return "Hava";
  if (scene === "fair") return "Lunapark";
  if (scene === "badge") return "Meslek";
  if (scene === "shelf") return "Kitaplık";
  if (scene === "holiday") return "Geçmiş";
  if (scene === "recycle") return "Dönüşüm";
  if (scene === "ballot") return "Oy";
  if (scene === "family") return "Aile";
  if (scene === "universe") return "Uzay";
  if (scene === "world") return "Ülkeler";
  if (scene === "rules") return "Sınıf Kuralları";
  return null;
}

function Stage({ scene, children }: { scene: Parameters<typeof SoftStage>[0]["scene"]; children: ReactNode }) {
  return (
    <SoftStage scene={scene} gradientId="eng-stage-bg">
      {children}
    </SoftStage>
  );
}

function lower(caption: string): string {
  return caption.toLocaleLowerCase("tr-TR");
}

/** Saat / günlük rutin vs he-she-it simple present. */
function clockMode(caption: string): "time" | "present" {
  const text = lower(caption);
  if (
    /\bhe\b|\bshe\b|wakes|goes|doesn't|does she|simple present|özne|brushes|watches|yakının|fiile s|fiile s veya/.test(
      text,
    )
  ) {
    return "present";
  }
  return "time";
}

/** Analog saat + dijital şerit; half past / quarter / o'clock. */
export function ClockScene({ beat, caption }: { beat: number; caption: string }) {
  const mode = clockMode(caption);
  const text = lower(caption);
  const half = /half past|buçuk/.test(text);
  const quarter = /quarter|çeyrek/.test(text);
  const timeLabel = half
    ? "half past seven"
    : quarter
      ? "quarter past / quarter to"
      : beat <= 1
        ? "What time is it?"
        : "seven o'clock";

  if (mode === "present") {
    return (
      <Stage scene="clock">
        <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          I / He / She — simple present
        </text>
        <rect x="20" y="44" width="150" height="56" rx="10" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
        <text x="32" y="68" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
          I wake up
        </text>
        <text x="32" y="88" fill="#0369a1" fontSize="12" fontFamily="inherit">
          fiil yalın
        </text>
        <rect x="190" y="44" width="150" height="56" rx="10" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
        <text x="202" y="68" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
          He wakes up
        </text>
        <text x="202" y="88" fill="#b45309" fontSize="12" fontFamily="inherit">
          +s / +es
        </text>
        <rect x="20" y="116" width="100" height="40" rx="8" fill="#fff7ed" stroke="#cbd5e1" strokeWidth="2" />
        <text x="34" y="142" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
          go → goes
        </text>
        <rect x="130" y="116" width="100" height="40" rx="8" fill="#fff7ed" stroke="#cbd5e1" strokeWidth="2" />
        <text x="142" y="142" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
          have → has
        </text>
        <rect x="240" y="116" width="100" height="40" rx="8" fill={beat >= 6 ? "#fecdd3" : "#fff7ed"} stroke="#cbd5e1" strokeWidth="2" />
        <text x="248" y="142" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
          {beat >= 6 ? "doesn't + yalın" : "does → ?"}
        </text>
        <text x="20" y="184" fill="#0f172a" fontSize="12" fontFamily="inherit">
          Günlük aktivite zaman çizelgesi: I vs He/She
        </text>
      </Stage>
    );
  }

  return (
    <Stage scene="clock">
      <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {timeLabel}
      </text>
      <circle cx="100" cy="108" r="54" fill="#fff7ed" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx="100" cy="108" r="4" fill="#0f172a" />
      <text x="92" y="68" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
        12
      </text>
      <text x="140" y="114" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
        3
      </text>
      <text x="94" y="156" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
        6
      </text>
      <text x="52" y="114" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
        9
      </text>
      <line
        x1="100"
        y1="108"
        x2={half ? 100 : quarter ? 62 : 78}
        y2={half ? 150 : quarter ? 108 : 148}
        stroke="#b45309"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="108"
        x2={half ? 100 : quarter ? 62 : 100}
        y2={half ? 150 : quarter ? 108 : 62}
        stroke="#0369a1"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="178" y="56" width="160" height="36" rx="8" fill="#0f172a" stroke="#cbd5e1" strokeWidth="2" />
      <text x="190" y="80" fill="#86efac" fontSize="16" fontFamily="inherit" fontWeight="700">
        {half ? "07:30" : quarter ? "09:45" : "07:00"}
      </text>
      <text x="178" y="118" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
        I wake up
      </text>
      <text x="178" y="140" fill="#0369a1" fontSize="12" fontFamily="inherit">
        at seven o&apos;clock
      </text>
      {beat >= 5 ? (
        <text x="178" y="164" fill="#b45309" fontSize="12" fontFamily="inherit">
          I go to school at eight
        </text>
      ) : null}
      <text x="16" y="188" fill="#0f172a" fontSize="11" fontFamily="inherit">
        Analog saat · dijital şerit · günlük rutin
      </text>
    </Stage>
  );
}

/** Likes/dislikes kalp şeması vs some/any sepeti. */
function trayMode(caption: string): "likes" | "some" {
  const text = lower(caption);
  if (/some|any|can i have|rica|please|bread|sepette/.test(text)) return "some";
  return "likes";
}

export function TrayScene({ beat, caption }: { beat: number; caption: string }) {
  const mode = trayMode(caption);
  if (mode === "some") {
    return (
      <Stage scene="tray">
        <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Can I have some…?
        </text>
        <rect x="28" y="48" width="120" height="100" rx="14" fill="#ecfdf5" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="48" y="78" fill="#15803d" fontSize="14" fontFamily="inherit" fontWeight="700">
          some
        </text>
        <text x="40" y="104" fill="#0f172a" fontSize="11" fontFamily="inherit">
          olumlu
        </text>
        <ellipse cx="88" cy="128" rx="28" ry="14" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="200" y="48" width="120" height="100" rx="14" fill="#fff1f2" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="228" y="78" fill="#e11d48" fontSize="14" fontFamily="inherit" fontWeight="700">
          any
        </text>
        <text x="214" y="104" fill="#0f172a" fontSize="11" fontFamily="inherit">
          soru / olumsuz
        </text>
        <ellipse cx="260" cy="128" rx="28" ry="14" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
        <text x="28" y="176" fill="#0f172a" fontSize="12" fontFamily="inherit">
          {beat >= 5 ? "some olumlu. any soru ve olumsuz." : "Some / Any sepeti"}
        </text>
      </Stage>
    );
  }

  return (
    <Stage scene="tray">
      <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        I like / I don&apos;t like
      </text>
      <rect x="24" y="48" width="200" height="90" rx="16" fill="#fff7ed" stroke="#cbd5e1" strokeWidth="1.5" />
      <ellipse cx="64" cy="92" rx="18" ry="14" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="96" y="78" width="36" height="22" rx="4" fill="#f59e0b" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="148" y="72" width="22" height="34" rx="6" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M186 76 h16 v28 h-16 z" fill="#fb923c" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx="260" cy="72" r="22" fill="#fecdd3" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M248 72 h24 M260 60 v24" stroke="#e11d48" strokeWidth="3" strokeLinecap="round" />
      <text x="246" y="78" fill="#fff" fontSize="14" fontFamily="inherit" fontWeight="700">
        ♥
      </text>
      <text x="238" y="112" fill="#15803d" fontSize="13" fontFamily="inherit" fontWeight="700">
        like
      </text>
      <g opacity={beat >= 2 ? 1 : 0.35}>
        <circle cx="312" cy="72" r="22" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M300 72 h24" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" />
        <text x="286" y="112" fill="#e11d48" fontSize="12" fontFamily="inherit" fontWeight="700">
          don&apos;t like
        </text>
      </g>
      <text x="24" y="172" fill="#0f172a" fontSize="12" fontFamily="inherit">
        Yiyecek / içecek menü kartı · likes / dislikes
      </text>
    </Stage>
  );
}

/** Present continuous şehir vs bigger/cheaper terazi. */
function skylineMode(caption: string): "continuous" | "compare" {
  const text = lower(caption);
  if (/bigger|cheaper|than|more |karşılaştır|er alır|expensive|better/.test(text)) return "compare";
  return "continuous";
}

export function SkylineScene({ beat, caption }: { beat: number; caption: string }) {
  const mode = skylineMode(caption);
  if (mode === "compare") {
    const leftHeavy = beat % 2 === 0;
    return (
      <Stage scene="skyline">
        <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          bigger / cheaper — comparative
        </text>
        <line x1="180" y1="48" x2="180" y2="120" stroke="#cbd5e1" strokeWidth="4" />
        <line
          x1={leftHeavy ? 100 : 120}
          y1={leftHeavy ? 130 : 110}
          x2={leftHeavy ? 260 : 240}
          y2={leftHeavy ? 110 : 130}
          stroke="#cbd5e1"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect
          x="70"
          y={leftHeavy ? 118 : 98}
          width="70"
          height="44"
          rx="8"
          fill="#bae6fd"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <text x="82" y={leftHeavy ? 146 : 126} fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
          bigger
        </text>
        <rect
          x="220"
          y={leftHeavy ? 98 : 118}
          width="70"
          height="44"
          rx="8"
          fill="#fde68a"
          stroke="#cbd5e1"
          strokeWidth="2"
        />
        <text x="228" y={leftHeavy ? 126 : 146} fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
          cheaper
        </text>
        <text x="16" y="184" fill="#0f172a" fontSize="12" fontFamily="inherit">
          Karşılaştırma terazisi · than köprüsü
        </text>
      </Stage>
    );
  }

  const walkLeft = beat % 2 === 0;
  return (
    <Stage scene="skyline">
      <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        She is walking — now
      </text>
      <rect x="24" y="88" width="36" height="72" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="66" y="64" width="42" height="96" fill="#bae6fd" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="114" y="78" width="34" height="82" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="154" y="70" width="48" height="90" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx="250" cy="108" r="12" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="250" y1="120" x2="250" y2="150" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="250" y1="132" x2={walkLeft ? 232 : 268} y2="146" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="250" y1="150" x2="236" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />
      <line x1="250" y1="150" x2="266" y2="170" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="214" y="56" fill="#0369a1" fontSize="13" fontFamily="inherit" fontWeight="700">
        present continuous
      </text>
      <text x="16" y="188" fill="#0f172a" fontSize="12" fontFamily="inherit">
        Şehir içi canlı aksiyon · am / is / are + -ing
      </text>
    </Stage>
  );
}

/** Hava ikon şeridi vs duygu yüzleri. */
function weatherMode(caption: string): "sky" | "feel" {
  const text = lower(caption);
  if (/happy|anxious|scared|feel|duygu|excited|how do you feel|scary|kalpten/.test(text)) {
    return "feel";
  }
  return "sky";
}

export function WeatherScene({ beat, caption }: { beat: number; caption: string }) {
  const mode = weatherMode(caption);
  if (mode === "feel") {
    return (
      <Stage scene="weather">
        <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          How do you feel?
        </text>
        <circle cx="70" cy="100" r="28" fill="#fef08a" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="60" cy="92" r="3" fill="#0f172a" />
        <circle cx="80" cy="92" r="3" fill="#0f172a" />
        <path d="M58 110 q12 12 24 0" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <text x="48" y="148" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
          happy
        </text>
        <circle cx="180" cy="100" r="28" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="170" cy="92" r="3" fill="#0f172a" />
        <circle cx="190" cy="92" r="3" fill="#0f172a" />
        <path d="M168 116 q12 -4 24 0" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <text x="152" y="148" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
          anxious
        </text>
        <circle cx="290" cy="100" r="28" fill="#fecdd3" stroke="#cbd5e1" strokeWidth="2" />
        <circle cx="280" cy="92" r="3" fill="#0f172a" />
        <circle cx="300" cy="92" r="3" fill="#0f172a" />
        <path d="M278 118 q12 -10 24 0" fill="none" stroke="#cbd5e1" strokeWidth="2" />
        <text x="268" y="148" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
          scared
        </text>
        <text x="16" y="184" fill="#0f172a" fontSize="12" fontFamily="inherit">
          {beat >= 5 ? "I am / I feel · scary ≠ scared" : "Duygu ifadeleri karakterleri"}
        </text>
      </Stage>
    );
  }

  return (
    <Stage scene="weather">
      <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        What&apos;s the weather like?
      </text>
      <circle cx="70" cy="90" r="26" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
      <text x="48" y="140" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
        sunny
      </text>
      <ellipse cx="170" cy="86" rx="30" ry="18" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
      {beat >= 2 ? (
        <>
          <line x1="152" y1="112" x2="144" y2="136" stroke="#0369a1" strokeWidth="3" />
          <line x1="170" y1="112" x2="162" y2="136" stroke="#0369a1" strokeWidth="3" />
          <line x1="188" y1="112" x2="180" y2="136" stroke="#0369a1" strokeWidth="3" />
        </>
      ) : null}
      <text x="148" y="160" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
        rainy
      </text>
      <rect x="250" y="70" width="70" height="50" rx="10" fill="#bae6fd" stroke="#cbd5e1" strokeWidth="2" />
      <text x="264" y="100" fill="#0369a1" fontSize="14" fontFamily="inherit" fontWeight="700">
        cold
      </text>
      <text x="16" y="188" fill="#0f172a" fontSize="12" fontFamily="inherit">
        Hava durumu ikon şeridi · sunny / rainy / cold
      </text>
    </Stage>
  );
}

/** Dönme dolap rides vs fuarda excited/scared. */
function fairMode(caption: string): "rides" | "emotion" {
  const text = lower(caption);
  if (/excited|scared|about|ghost|how do you feel|duygu|heyecan/.test(text)) return "emotion";
  return "rides";
}

export function FairScene({ beat, caption }: { beat: number; caption: string }) {
  const mode = fairMode(caption);
  const lights = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <Stage scene="fair">
      <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {mode === "emotion" ? "I am excited about / scared of" : "The ferris wheel is fun"}
      </text>
      <ellipse cx="180" cy="176" rx="150" ry="14" fill="#bbf7d0" opacity="0.9" data-junior-scene-ground="lunapark" />
      <rect x="24" y="150" width="10" height="22" fill="#94a3b8" />
      <polygon points="24,150 46,142 24,136" fill="#f97316" />
      <line x1="110" y1="168" x2="110" y2="96" stroke="#94a3b8" strokeWidth="5" />
      <circle cx="110" cy="88" r="46" fill="#e0f2fe" stroke="#94a3b8" strokeWidth="3" data-junior-hero="dolap" />
      <circle cx="110" cy="88" r="8" fill="#fde68a" stroke="#b45309" strokeWidth="2" />
      <line x1="110" y1="42" x2="110" y2="134" stroke="#b45309" strokeWidth="2" />
      <line x1="64" y1="88" x2="156" y2="88" stroke="#b45309" strokeWidth="2" />
      <line x1="78" y1="56" x2="142" y2="120" stroke="#b45309" strokeWidth="2" />
      <line x1="78" y1="120" x2="142" y2="56" stroke="#b45309" strokeWidth="2" />
      {lights.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const cx = 110 + Math.cos(rad) * 46;
        const cy = 88 + Math.sin(rad) * 46;
        return <circle key={deg} cx={cx} cy={cy} r="3.2" fill={deg % 90 === 0 ? "#fde68a" : "#fb7185"} data-junior-helper="ışık" />;
      })}
      <rect x="100" y="36" width="20" height="12" rx="3" fill="#fde68a" stroke="#94a3b8" strokeWidth="1.5" data-junior-helper="kabin" />
      <rect x="146" y="80" width="18" height="12" rx="3" fill="#bae6fd" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="101" y="124" width="18" height="12" rx="3" fill="#fb923c" stroke="#94a3b8" strokeWidth="1.5" />
      <rect x="198" y="118" width="78" height="30" rx="10" fill="#ef4444" stroke="#94a3b8" strokeWidth="2" data-junior-helper="araba" />
      <rect x="214" y="124" width="22" height="10" rx="2" fill="#fee2e2" />
      <circle cx="216" cy="152" r="8" fill="#334155" />
      <circle cx="258" cy="152" r="8" fill="#334155" />
      <text x="204" y="108" fill="#0f172a" fontSize="11" fontFamily="inherit">
        bumper cars
      </text>
      {mode === "emotion" ? (
        <>
          <rect x="190" y="44" width="150" height="28" rx="8" fill="#ecfdf5" stroke="#cbd5e1" strokeWidth="2" />
          <text x="200" y="63" fill="#15803d" fontSize="11" fontFamily="inherit" fontWeight="700">
            excited about
          </text>
          <rect x="190" y="78" width="150" height="28" rx="8" fill="#fff1f2" stroke="#cbd5e1" strokeWidth="2" />
          <text x="208" y="97" fill="#e11d48" fontSize="11" fontFamily="inherit" fontWeight="700">
            scared of
          </text>
        </>
      ) : (
        <text x="200" y="64" fill="#0f172a" fontSize="12" fontFamily="inherit">
          {beat >= 3 ? "fun · exciting · boring" : "rides"}
        </text>
      )}
      <text x="16" y="188" fill="#0f172a" fontSize="12" fontFamily="inherit">
        Lunapark dönme dolap · rides sahnesi
      </text>
    </Stage>
  );
}

/** Meslek rozetleri ve ekipmanları (doctor / architect / vet). */
export function BadgeScene({ beat, caption }: { beat: number; caption: string }) {
  const showAn = /an architect|sesli|a ya da an/.test(lower(caption)) || beat >= 3;
  return (
    <Stage scene="badge">
      <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        What does she do?
      </text>
      <circle cx="70" cy="100" r="36" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="48" y="92" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
        doctor
      </text>
      <path d="M62 108 h16 M70 100 v16" stroke="#e11d48" strokeWidth="3" />
      <circle cx="180" cy="100" r="36" fill="#fde68a" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="150" y="92" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
        architect
      </text>
      <path d="M164 112 l16 -16 l16 16" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx="290" cy="100" r="36" fill="#ecfdf5" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="276" y="92" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
        vet
      </text>
      <ellipse cx="290" cy="116" rx="10" ry="7" fill="#0f172a" />
      <text x="16" y="168" fill="#0f172a" fontSize="12" fontFamily="inherit">
        {showAn ? "a doctor · an architect · a vet" : "Meslekler ve ekipmanları"}
      </text>
      <text x="16" y="188" fill="#b45309" fontSize="11" fontFamily="inherit">
        İlk sese göre a / an
      </text>
    </Stage>
  );
}

/** Okuma sahnesi vs yer edatı kutusu. */
function shelfMode(caption: string): "reading" | "place" {
  const text = lower(caption);
  if (/in |on |under|behind|next to|yer edat|konum|shelf|bag|bed|door/.test(text) && !/reading|favourite|okuma|story/.test(text)) {
    return "place";
  }
  if (/in |on |under|behind|next to/.test(text)) return "place";
  return "reading";
}

export function ShelfScene({ beat, caption }: { beat: number; caption: string }) {
  const mode = shelfMode(caption);
  if (mode === "place") {
    return (
      <Stage scene="shelf">
        <text x="16" y="24" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
          in · on · under · behind · next to
        </text>
        <rect x="40" y="50" width="160" height="110" rx="6" fill="#fff7ed" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="40" y1="90" x2="200" y2="90" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="40" y1="130" x2="200" y2="130" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="56" y="58" width="20" height="26" fill="#38bdf8" stroke="#cbd5e1" strokeWidth="2" />
        <text x="78" y="76" fill="#0369a1" fontSize="10" fontFamily="inherit">
          on
        </text>
        <circle cx="100" cy="108" r="10" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
        <text x="114" y="112" fill="#0f172a" fontSize="10" fontFamily="inherit">
          in
        </text>
        <rect x="150" y="142" width="28" height="14" rx="3" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
        <text x="128" y="154" fill="#0f172a" fontSize="10" fontFamily="inherit">
          under
        </text>
        <rect x="220" y="60" width="120" height="28" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        <text x="232" y="79" fill="#0f172a" fontSize="11" fontFamily="inherit">
          behind
        </text>
        <rect x="220" y="100" width="120" height="28" rx="6" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
        <text x="232" y="119" fill="#0f172a" fontSize="11" fontFamily="inherit">
          next to
        </text>
        <text x="16" y="188" fill="#0f172a" fontSize="12" fontFamily="inherit">
          Yer yön edat kutusu
        </text>
      </Stage>
    );
  }

  return (
    <Stage scene="shelf">
      <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        I like reading
      </text>
      <path d="M48 56 h70 v100 h-70 z" fill="#fff" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M118 56 h70 v100 h-70 z" fill="#fff7ed" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="118" y1="56" x2="118" y2="156" stroke="#cbd5e1" strokeWidth="2" />
      <text x="62" y="110" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
        story
      </text>
      <text x="210" y="90" fill="#0f172a" fontSize="13" fontFamily="inherit">
        favourite book
      </text>
      <text x="210" y="118" fill="#0369a1" fontSize="12" fontFamily="inherit">
        {beat >= 3 ? "I read every day" : "Kitap okuma sahnesi"}
      </text>
      <text x="16" y="188" fill="#0f172a" fontSize="12" fontFamily="inherit">
        Kitaplık · okumaktan söz etmek
      </text>
    </Stage>
  );
}

/** Was/were takvim, düzenli geçmiş fiiller, tatil havası. */
function holidayMode(caption: string): "was" | "verbs" | "trip" {
  const text = lower(caption);
  if (
    /picnic|it was sunny|it was rainy|it was hot|it was windy|it was snowy|güneşli bir piknik|hava durumu|tatil yağmur|because|so we/.test(
      text,
    )
  ) {
    return "trip";
  }
  if (
    /\bi was\b|\bthey were\b|\bwe were\b|\bshe was\b|\bwas she\b|\bwere you\b|\bwere they\b|yesterday|on monday|in 2015|born|geçmiş tarih|dün okul|geçmiş an|tekil özn|çoğul özn/.test(
      text,
    )
  ) {
    return "was";
  }
  if (/visited|swam|played|swimmed|went|did you|düzenli fiil/.test(text)) return "verbs";
  return "verbs";
}

export function HolidayScene({ beat, caption }: { beat: number; caption: string }) {
  const mode = holidayMode(caption);

  if (mode === "was") {
    return (
      <Stage scene="holiday">
        <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          was / were — geçmiş takvim
        </text>
        <rect x="24" y="44" width="200" height="120" rx="10" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="24" y="44" width="200" height="28" rx="10" fill="#bae6fd" stroke="#cbd5e1" strokeWidth="2" />
        <text x="70" y="64" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
          yesterday
        </text>
        {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, index) => (
          <g key={day}>
            <rect
              x={36 + index * 36}
              y="88"
              width="30"
              height="28"
              rx="4"
              fill={index === 2 ? "#fde68a" : "#f8fafc"}
              stroke="#cbd5e1"
              strokeWidth="1.5"
            />
            <text x={40 + index * 36} y="106" fill="#0f172a" fontSize="9" fontFamily="inherit">
              {day}
            </text>
          </g>
        ))}
        <text x="36" y="144" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
          I was · They were
        </text>
        <rect x="240" y="56" width="100" height="40" rx="8" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
        <text x="258" y="82" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
          was
        </text>
        <rect x="240" y="108" width="100" height="40" rx="8" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
        <text x="254" y="134" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
          were
        </text>
        <text x="16" y="188" fill="#0f172a" fontSize="11" fontFamily="inherit">
          {beat >= 5 ? "on Monday · in 2015" : "Geçmiş zaman takvimi"}
        </text>
      </Stage>
    );
  }

  if (mode === "trip") {
    return (
      <Stage scene="holiday">
        <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          It was sunny · holiday
        </text>
        <circle cx="64" cy="72" r="18" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
        <path d="M24 150 Q90 110 180 150" fill="#38bdf8" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="210" y="108" width="70" height="46" rx="8" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1="210" y1="124" x2="280" y2="124" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="248" y="96" width="16" height="14" rx="3" fill="#b45309" stroke="#cbd5e1" strokeWidth="2" />
        <text x="24" y="184" fill="#0f172a" fontSize="12" fontFamily="inherit">
          Tatil görseli · hava + etkinlik
        </text>
      </Stage>
    );
  }

  return (
    <Stage scene="holiday">
      <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        visited · swam · played
      </text>
      <rect x="28" y="56" width="90" height="70" rx="10" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
      <text x="42" y="96" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
        visited
      </text>
      <rect x="132" y="56" width="90" height="70" rx="10" fill="#bae6fd" stroke="#cbd5e1" strokeWidth="2" />
      <text x="150" y="96" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
        swam
      </text>
      <rect x="236" y="56" width="90" height="70" rx="10" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
      <text x="250" y="96" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
        played
      </text>
      <text x="28" y="160" fill="#e11d48" fontSize="12" fontFamily="inherit">
        swimmed ✕
      </text>
      <text x="140" y="160" fill="#15803d" fontSize="12" fontFamily="inherit" fontWeight="700">
        swam ✓
      </text>
      <text x="16" y="188" fill="#0f172a" fontSize="12" fontFamily="inherit">
        Düzenli / düzensiz geçmiş fiiller
      </text>
    </Stage>
  );
}

/** Geri dönüşüm kutuları vs should/shouldn't paneli. */
function recycleMode(caption: string): "bins" | "should" {
  const text = lower(caption);
  if (/should|shouldn't|öner|yapılmamas|lights|turn off/.test(text)) return "should";
  return "bins";
}

export function RecycleScene({ beat, caption }: { beat: number; caption: string }) {
  const mode = recycleMode(caption);
  if (mode === "should") {
    return (
      <Stage scene="recycle">
        <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          should / shouldn&apos;t
        </text>
        <rect x="28" y="52" width="140" height="90" rx="12" fill="#ecfdf5" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="52" y="90" fill="#15803d" fontSize="16" fontFamily="inherit" fontWeight="700">
          should
        </text>
        <text x="44" y="118" fill="#0f172a" fontSize="11" fontFamily="inherit">
          önerilen iş
        </text>
        <rect x="192" y="52" width="140" height="90" rx="12" fill="#fff1f2" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="208" y="90" fill="#e11d48" fontSize="14" fontFamily="inherit" fontWeight="700">
          shouldn&apos;t
        </text>
        <text x="210" y="118" fill="#0f172a" fontSize="11" fontFamily="inherit">
          kaçınılan iş
        </text>
        <text x="28" y="176" fill="#0f172a" fontSize="12" fontFamily="inherit">
          {beat >= 5 ? "You should turn off the lights." : "Should / Shouldn't paneli"}
        </text>
      </Stage>
    );
  }

  return (
    <Stage scene="recycle">
      <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        recycle
      </text>
      <circle cx="64" cy="78" r="28" fill="#86efac" stroke="#cbd5e1" strokeWidth="2" />
      <ellipse cx="64" cy="78" rx="12" ry="28" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M78 62 l10 -8 l-4 12" fill="#15803d" stroke="#cbd5e1" strokeWidth="1" />
      <rect x="120" y="88" width="40" height="58" rx="6" fill="#38bdf8" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="170" y="88" width="40" height="58" rx="6" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="220" y="88" width="40" height="58" rx="6" fill="#86efac" stroke="#cbd5e1" strokeWidth="2" />
      <text x="126" y="122" fill="#0f172a" fontSize="11" fontFamily="inherit">
        kâğıt
      </text>
      <text x="180" y="122" fill="#0f172a" fontSize="11" fontFamily="inherit">
        cam
      </text>
      <text x="224" y="122" fill="#0f172a" fontSize="11" fontFamily="inherit">
        plastik
      </text>
      <text x="16" y="178" fill="#0f172a" fontSize="12" fontFamily="inherit">
        Geri dönüşüm · Çöpü yere atma. Kutuya bırak.
      </text>
    </Stage>
  );
}

/** Oy sandığı, dijital vatandaşlık veya sınıf kuralı puan tablosu. */
function ballotMode(caption: string): "vote" | "rules" | "digital" {
  const text = lower(caption);
  if (/dijital|ekran|paylaşım|fotoğraf|vatandaşlık|izinsiz|hakaret/.test(text)) {
    return "digital";
  }
  if (
    /right|responsibility|hak|sorumluluk|raise our|respect your|i have the right|sınıf kural|puan tablosu|listen|clean/.test(
      text,
    )
  ) {
    return "rules";
  }
  return "vote";
}

export function BallotScene({ beat, caption }: { beat: number; caption: string }) {
  const mode = ballotMode(caption);
  if (mode === "digital") {
    return (
      <Stage scene="ballot">
        <text x="16" y="24" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
          Dijital Vatandaşlık · İzin ve Söz Hakkı
        </text>
        {[
          { title: "İzin Hakkı", detail: "Fotoğraf ve özel not izinsiz paylaşılmaz", badge: "Sor → Paylaş", fill: "#e0f2fe" },
          { title: "Söz Hakkı", detail: "Düşünce söylenir; hakaret hak değildir", badge: "Saygılı Dil", fill: "#fef3c7" },
          { title: "Ekran Sorumluluğu", detail: "Çekimde olmak ≠ yayında olmak", badge: "Önce İzin ✓", fill: "#dcfce7" },
        ].map((card, index) => (
          <g key={card.title}>
            <rect
              x="20"
              y={42 + index * 42}
              width="320"
              height="36"
              rx="8"
              fill={index === beat % 3 ? "#fde68a" : card.fill}
              stroke={index === beat % 3 ? "#b45309" : "#cbd5e1"}
              strokeWidth="1.5"
            />
            <text x="32" y={58 + index * 42} fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
              {card.title}
            </text>
            <text x="32" y={72 + index * 42} fill="#334155" fontSize="10" fontFamily="inherit">
              {card.detail}
            </text>
            <text x="254" y={64 + index * 42} fill="#0f172a" fontSize="10" fontFamily="inherit" fontWeight="700">
              {card.badge}
            </text>
          </g>
        ))}
        <text x="20" y="186" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="600">
          Göndermeden önce sor: Bu paylaşım kimin hakkını etkiler?
        </text>
      </Stage>
    );
  }
  if (mode === "rules") {
    return <ClassroomRulesScene beat={beat} caption={caption} />;
  }

  return (
    <Stage scene="ballot">
      <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        We vote
      </text>
      <rect x="36" y="70" width="90" height="70" rx="8" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x="58" y="54" width="46" height="18" rx="3" fill="#0f172a" />
      <path d="M70 100 l10 10 l22 -24" fill="none" stroke="#15803d" strokeWidth="4" />
      <rect x="160" y="64" width="78" height="36" rx="8" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
      <rect x="248" y="64" width="78" height="36" rx="8" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
      <text x="176" y="86" fill="#0f172a" fontSize="12" fontFamily="inherit">
        aday
      </text>
      <text x="264" y="86" fill="#0f172a" fontSize="12" fontFamily="inherit">
        aday
      </text>
      <text x="36" y="174" fill="#0f172a" fontSize="13" fontFamily="inherit">
        Okul seçim sandığı · Bir kişi, bir oy.
      </text>
    </Stage>
  );
}

export function FamilyScene({ beat, caption }: { beat: number; caption: string }) {
  const text = lower(caption);
  const hasGotFocus = /has got|\bhe\b|\bshe\b/.test(text);
  const members = [
    { en: "mother", tr: "anne", active: /mother|anne/.test(text) },
    { en: "father", tr: "baba", active: /father|baba/.test(text) },
    { en: "sister", tr: "kız kardeş", active: /sister|kız kardeş/.test(text) },
    { en: "brother", tr: "erkek kardeş", active: /brother|erkek kardeş/.test(text) },
  ];
  return (
    <Stage scene="family">
      <text x="16" y="24" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Family Life · have got / has got
      </text>
      {members.map((m, idx) => {
        const x = 16 + idx * 82;
        const hi = m.active || (!members.some((item) => item.active) && idx === beat % 4);
        return (
          <g key={m.en}>
            <rect
              x={x}
              y="36"
              width="76"
              height="68"
              rx="10"
              fill={hi ? "#fef3c7" : "#f8fafc"}
              stroke={hi ? "#b45309" : "#cbd5e1"}
              strokeWidth={hi ? "2" : "1.5"}
            />
            <circle cx={x + 38} cy="56" r="11" fill={hi ? "#fde68a" : "#e0f2fe"} stroke="#64748b" strokeWidth="1.5" />
            <text x={x + 38} y="82" textAnchor="middle" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
              {m.en}
            </text>
            <text x={x + 38} y="96" textAnchor="middle" fill="#475569" fontSize="9.5" fontFamily="inherit">
              ({m.tr})
            </text>
          </g>
        );
      })}
      <rect
        x="16"
        y="114"
        width="156"
        height="46"
        rx="8"
        fill={!hasGotFocus ? "#dcfce7" : "#f8fafc"}
        stroke={!hasGotFocus ? "#15803d" : "#cbd5e1"}
        strokeWidth="1.5"
      />
      <text x="26" y="132" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
        I / you / we / they → have got
      </text>
      <text x="26" y="148" fill="#15803d" fontSize="10.5" fontFamily="inherit" fontWeight="600">
        &quot;I have got a sister.&quot;
      </text>
      <rect
        x="184"
        y="114"
        width="160"
        height="46"
        rx="8"
        fill={hasGotFocus ? "#dcfce7" : "#f8fafc"}
        stroke={hasGotFocus ? "#15803d" : "#cbd5e1"}
        strokeWidth="1.5"
      />
      <text x="194" y="132" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
        he / she / it → has got
      </text>
      <text x="194" y="148" fill="#15803d" fontSize="10.5" fontFamily="inherit" fontWeight="600">
        &quot;She has got a brother.&quot;
      </text>
      <text x="16" y="182" fill="#0f172a" fontSize="11" fontFamily="inherit">
        Sahiplik: özneye göre have got veya has got seçilir.
      </text>
    </Stage>
  );
}

export function UniverseScene({ beat, caption }: { beat: number; caption: string }) {
  const text = lower(caption);
  const isFutureMode = /will|won't|planetarium|space museum|planetaryum|uzay müzesi|gelecek|yarın/.test(text);
  return (
    <Stage scene="universe">
      <rect x="14" y="12" width="332" height="172" rx="12" fill="#0f172a" />
      <text x="26" y="32" fill="#f8fafc" fontSize="13.5" fontFamily="inherit" fontWeight="700">
        {isFutureMode ? "Universe · will / won't & Planetarium" : "Universe · Sun, Moon, Star, Planet"}
      </text>
      {/* Sun */}
      <circle cx="62" cy="88" r="24" fill="#fbbf24" stroke="#fde68a" strokeWidth="2.5" />
      <text x="62" y="92" textAnchor="middle" fill="#0f172a" fontSize="10.5" fontFamily="inherit" fontWeight="700">
        Sun
      </text>
      {/* Orbit & Planet */}
      <ellipse cx="148" cy="88" rx="52" ry="30" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="4 3" />
      <circle cx="136" cy="72" r="13" fill="#38bdf8" stroke="#bae6fd" strokeWidth="2" />
      <text x="136" y="76" textAnchor="middle" fill="#0f172a" fontSize="9" fontFamily="inherit" fontWeight="700">
        Planet
      </text>
      {/* Moon */}
      <circle cx="176" cy="64" r="8" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="176" y="50" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontFamily="inherit" fontWeight="700">
        Moon
      </text>
      {/* Stars */}
      <circle cx="106" cy="48" r="2.5" fill="#fde68a" />
      <circle cx="192" cy="96" r="2.5" fill="#fde68a" />
      <text x="192" y="110" textAnchor="middle" fill="#fde68a" fontSize="9" fontFamily="inherit">
        stars ★
      </text>
      {isFutureMode ? (
        <g>
          <rect x="212" y="42" width="124" height="44" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="220" y="58" fill="#bae6fd" fontSize="10" fontFamily="inherit" fontWeight="700">
            will (gelecek plan)
          </text>
          <text x="220" y="74" fill="#f8fafc" fontSize="9.5" fontFamily="inherit">
            We will visit planetarium
          </text>
          <rect x="212" y="94" width="124" height="44" rx="8" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.5" />
          <text x="220" y="110" fill="#fde68a" fontSize="10" fontFamily="inherit" fontWeight="700">
            won&apos;t (will not)
          </text>
          <text x="220" y="126" fill="#f8fafc" fontSize="9.5" fontFamily="inherit">
            space museum · {beat % 2 === 0 ? "tomorrow" : "next week"}
          </text>
        </g>
      ) : (
        <g>
          <rect x="212" y="42" width="124" height="44" rx="8" fill="#1e293b" stroke="#fde68a" strokeWidth="1.5" />
          <text x="220" y="58" fill="#fde68a" fontSize="10" fontFamily="inherit" fontWeight="700">
            Tekil → there is
          </text>
          <text x="220" y="74" fill="#f8fafc" fontSize="9.5" fontFamily="inherit">
            There is one Sun.
          </text>
          <rect x="212" y="94" width="124" height="44" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
          <text x="220" y="110" fill="#bae6fd" fontSize="10" fontFamily="inherit" fontWeight="700">
            Çoğul → there are
          </text>
          <text x="220" y="126" fill="#f8fafc" fontSize="9.5" fontFamily="inherit">
            There are eight planets.
          </text>
        </g>
      )}
      <text x="26" y="168" fill="#cbd5e1" fontSize="10.5" fontFamily="inherit">
        {isFutureMode
          ? "Gelecek tahmini: will + yalın fiil · Olumsuz: won't"
          : "Sun (Güneş) · Moon (Ay) · Star (Yıldız) · Planet (Gezegen)"}
      </text>
    </Stage>
  );
}

export function WorldCultureScene({ beat, caption }: { beat: number; caption: string }) {
  const text = lower(caption);
  const rows = [
    {
      country: "Turkey",
      nationality: "Turkish",
      sentence: "I am from Turkey. I am Turkish.",
      active: /turkey|turkish|türkiye|türk/.test(text),
    },
    {
      country: "Japan",
      nationality: "Japanese",
      sentence: "She is from Japan. She is Japanese.",
      active: /japan|japanese|japon/.test(text),
    },
    {
      country: "England",
      nationality: "English",
      sentence: "He is from England. He is English.",
      active: /england|english|ingiltere|ingiliz/.test(text),
    },
  ];
  return (
    <Stage scene="world">
      <text x="16" y="24" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        World &amp; Culture · Country → Nationality
      </text>
      {rows.map((row, index) => {
        const hi = row.active || (!rows.some((r) => r.active) && index === beat % 3);
        const y = 36 + index * 42;
        return (
          <g key={row.country}>
            <rect
              x="16"
              y={y}
              width="328"
              height="36"
              rx="8"
              fill={hi ? "#fef3c7" : "#f8fafc"}
              stroke={hi ? "#b45309" : "#cbd5e1"}
              strokeWidth={hi ? "2" : "1.5"}
            />
            <rect x="24" y={y + 6} width="74" height="24" rx="5" fill="#e0f2fe" />
            <text x="61" y={y + 22} textAnchor="middle" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
              {row.country}
            </text>
            <text x="108" y={y + 22} fill="#64748b" fontSize="12" fontFamily="inherit" fontWeight="700">
              →
            </text>
            <rect x="122" y={y + 6} width="82" height="24" rx="5" fill="#dcfce7" />
            <text x="163" y={y + 22} textAnchor="middle" fill="#15803d" fontSize="11" fontFamily="inherit" fontWeight="700">
              {row.nationality}
            </text>
            <text x="212" y={y + 22} fill="#334155" fontSize="9.5" fontFamily="inherit">
              {row.sentence}
            </text>
          </g>
        );
      })}
      <text x="16" y="182" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="600">
        from + Country (Ülke) · I am + Nationality (Milliyet)
      </text>
    </Stage>
  );
}

export function ClassroomRulesScene({ beat, caption }: { beat: number; caption: string }) {
  const text = lower(caption);
  const rules = [
    { label: "raise hand", tr: "parmak kaldır", kind: "responsibility", active: /raise|parmak/.test(text) },
    { label: "listen & respect", tr: "dinle ve saygı duy", kind: "responsibility", active: /listen|respect|dinle|saygı/.test(text) },
    { label: "keep class clean", tr: "sınıfı temiz tut", kind: "responsibility", active: /clean|temiz/.test(text) },
  ];
  return (
    <Stage scene="rules">
      <text x="16" y="24" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Classroom Rules · Right &amp; Responsibility
      </text>
      <rect x="16" y="34" width="154" height="32" rx="7" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
      <text x="26" y="48" fill="#0369a1" fontSize="10.5" fontFamily="inherit" fontWeight="700">
        Right (Hak)
      </text>
      <text x="26" y="61" fill="#0f172a" fontSize="10" fontFamily="inherit">
        speak in turn · safe class
      </text>
      <rect x="178" y="34" width="166" height="32" rx="7" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
      <text x="188" y="48" fill="#15803d" fontSize="10.5" fontFamily="inherit" fontWeight="700">
        Responsibility (Sorumluluk)
      </text>
      <text x="188" y="61" fill="#0f172a" fontSize="10" fontFamily="inherit">
        we listen &amp; follow rules
      </text>
      {rules.map((row, index) => {
        const hi = row.active || (!rules.some((r) => r.active) && index === beat % 3);
        const y = 74 + index * 30;
        return (
          <g key={row.label}>
            <rect
              x="16"
              y={y}
              width="328"
              height="25"
              rx="6"
              fill={hi ? "#fde68a" : "#f8fafc"}
              stroke={hi ? "#b45309" : "#cbd5e1"}
              strokeWidth="1.5"
            />
            <text x="28" y={y + 17} fill="#0f172a" fontSize="11.5" fontFamily="inherit" fontWeight="700">
              {row.label}
            </text>
            <text x="168" y={y + 17} fill="#475569" fontSize="10.5" fontFamily="inherit">
              ({row.tr})
            </text>
            <text x="318" y={y + 17} fill="#15803d" fontSize="12" fontFamily="inherit" fontWeight="700">
              ✓
            </text>
          </g>
        );
      })}
      <text x="16" y="182" fill="#0f172a" fontSize="10.5" fontFamily="inherit" fontWeight="600">
        Sınıf kuralları puan tablosu · I have the right to speak, and I listen to my friends.
      </text>
    </Stage>
  );
}

export function EnglishSceneArt({
  scene,
  beat,
  caption,
}: {
  scene: EnglishJuniorScene;
  beat: number;
  caption: string;
}) {
  if (scene === "clock") return <ClockScene beat={beat} caption={caption} />;
  if (scene === "tray") return <TrayScene beat={beat} caption={caption} />;
  if (scene === "skyline") return <SkylineScene beat={beat} caption={caption} />;
  if (scene === "weather") return <WeatherScene beat={beat} caption={caption} />;
  if (scene === "fair") return <FairScene beat={beat} caption={caption} />;
  if (scene === "badge") return <BadgeScene beat={beat} caption={caption} />;
  if (scene === "shelf") return <ShelfScene beat={beat} caption={caption} />;
  if (scene === "holiday") return <HolidayScene beat={beat} caption={caption} />;
  if (scene === "recycle") return <RecycleScene beat={beat} caption={caption} />;
  if (scene === "family") return <FamilyScene beat={beat} caption={caption} />;
  if (scene === "universe") return <UniverseScene beat={beat} caption={caption} />;
  if (scene === "world") return <WorldCultureScene beat={beat} caption={caption} />;
  if (scene === "rules") return <ClassroomRulesScene beat={beat} caption={caption} />;
  return <BallotScene beat={beat} caption={caption} />;
}
