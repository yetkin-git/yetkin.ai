"use client";

import { useEffect, useState } from "react";
import { ElectiveBoard } from "@/components/junior/elective-board";
import { Button } from "@/components/ui/button";
import { juniorLessonNote } from "@/lib/junior/lesson-note";
import type { JuniorVectorScene } from "@/lib/junior/types";

type Beat = { caption: string };

const BEATS: Record<JuniorVectorScene, readonly Beat[]> = {
  fraction: [
    { caption: "Bir bütün duruyor. Henüz bölünmedi." },
    { caption: "Kesir, bütünün eşit parçasıdır." },
    { caption: "Bütün dört eşit parçaya ayrıldı." },
    { caption: "Dört parçanın boyu aynıdır." },
    { caption: "Bir parça seçildi. Seçilen parça paydır." },
    { caption: "Pay 1 üstte durur. Payda 4 altta durur." },
    { caption: "Soru: Dört dilimden biri alındı. Kesir nedir?" },
    { caption: "Çözüm: Pay 1, payda 4. Sonuç dörtte birdir." },
    { caption: "Tuzak: Eşit değilse kesir olmaz. Okunuş dörtte birdir." },
  ],
  "fraction-sum": [
    { caption: "Solda dörtte bir duruyor." },
    { caption: "Sağa dörtte iki geldi." },
    { caption: "İki kesrin paydası da 4." },
    { caption: "Paylar 1 ve 2 toplanacak." },
    { caption: "Kural: Aynı paydada paylar toplanır." },
    { caption: "Toplam pay 1 artı 2, yani 3." },
    { caption: "Payda 4 yerinde kaldı." },
    { caption: "Sonuç dörtte üçtür." },
    { caption: "Tuzak: Paydaları toplama. 3/8 bu işlemin sonucu değildir." },
  ],
  force: [
    { caption: "Cisim duruyor. Üstünde ok yok." },
    { caption: "Kuvvet, itme veya çekmedir." },
    { caption: "İtme oku sağa doğru uzar." },
    { caption: "Cisim okun baktığı yöne kayar." },
    { caption: "Çekme oku ters yöne döner." },
    { caption: "Cisim bu kez sola gelir." },
    { caption: "Ok, kuvvetin yönünü gösterir." },
    { caption: "Örnek: Kapı sağa itilir. Çekmece ters yöne çekilir." },
    { caption: "Tuzak: Yön yazılmazsa cevap eksik kalır. Çekme de kuvvettir." },
  ],
  friction: [
    { caption: "Cisim pürüzlü yerde duruyor." },
    { caption: "Hareket oku sağa bakar." },
    { caption: "Sürtünme oku ters yöne bakar." },
    { caption: "Pürüz artınca ters ok uzar." },
    { caption: "Yer düzleşince sürtünme oku kısalır." },
    { caption: "Buzda ok kısadır. Sürtünme sıfır değildir." },
    { caption: "Pürüzlü taban tutuşu artırır." },
    { caption: "Örnek: Buzda kaymak kolaydır. Sürtünme azdır." },
    { caption: "Tuzak: Sürtünme yoktur deme. Azdır ve bir kuvvettir." },
  ],
  "main-idea": [
    { caption: "Metin sayfası açıldı." },
    { caption: "Satırlar geldi. Henüz seçim yok." },
    { caption: "Ortadaki cümle öne çıktı." },
    { caption: "Bu cümle ana fikirdir." },
    { caption: "Alttaki satırlar ayrıntıdır." },
    { caption: "Ana fikir tek cümleyle söylenir." },
    { caption: "Soru: Yazar ağaç hakkında ne demek istiyor?" },
    { caption: "Çözüm: Ağaçlar canlılara yarar sağlar." },
    { caption: "Tuzak: Örnek cümle ana fikir değildir. Konu da ana fikir değildir." },
  ],
  "support-idea": [
    { caption: "Ana fikir tek cümle olarak duruyor." },
    { caption: "İlk yardımcı fikir alta geldi." },
    { caption: "İkinci yardımcı fikir de geldi." },
    { caption: "İkisi de ana fikre bağlandı." },
    { caption: "Yardımcı fikir taşır. Yerine geçmez." },
    { caption: "İki cümle de aynı ana fikri besler." },
    { caption: "Soru: Gölge ve yuva cümleleri hangi fikirdir?" },
    { caption: "Çözüm: İkisi de yardımcı fikirdir." },
    { caption: "Tuzak: Yardımcı cümleyi ikinci ana fikir sanma." },
  ],
  elective: [
    { caption: "Seçmeli ders açıldı." },
    { caption: "Kavram söylendi." },
    { caption: "Örnek ekrana geldi." },
    { caption: "Örnek adım adım durdu." },
    { caption: "Kural bir cümleyle söylendi." },
    { caption: "Aynı kural bir kez daha söylendi." },
    { caption: "Soru soruldu." },
    { caption: "Çözüm söylendi." },
    { caption: "Tuzak ayrıca durdu." },
  ],
};

type VectorPlayerProps = {
  scene: JuniorVectorScene;
  mebNote: string;
  lifeUse: string;
  steps?: readonly string[];
  /** Geniş ekranda oynatıcı ve ders notu kalan yüksekliği doldurur. */
  fill?: boolean;
};

export function VectorPlayer({ scene, mebNote, lifeUse, steps, fill = false }: VectorPlayerProps) {
  const beats =
    steps && steps.length > 0 ? steps.map((caption) => ({ caption })) : BEATS[scene];
  const [playing, setPlaying] = useState(false);
  const [beat, setBeat] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduceMotion(media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!playing) {
      return;
    }
    if (reduceMotion) {
      setBeat(beats.length - 1);
      return;
    }
    const timer = window.setInterval(() => {
      setBeat((current) => (current + 1) % beats.length);
    }, 3600);
    return () => window.clearInterval(timer);
  }, [playing, reduceMotion, beats.length]);

  function toggle() {
    if (playing) {
      setPlaying(false);
      setBeat(0);
      return;
    }
    setBeat(reduceMotion ? beats.length - 1 : 0);
    setPlaying(true);
  }

  const caption = beats[beat]?.caption ?? beats[0]?.caption ?? "";
  const note = juniorLessonNote(mebNote, lifeUse);
  const stageClass = fill
    ? "h-[300px] max-h-[300px] lg:h-full lg:max-h-full lg:min-h-0"
    : "h-[300px] max-h-[300px]";

  return (
    <div className={`grid items-stretch gap-2 lg:grid-cols-2 ${fill ? "lg:h-full lg:min-h-0" : ""}`}>
      <div
        className={`flex ${stageClass} flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white`}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] px-2 py-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--safir-deep)]">
            Video / Görsel Oynatıcı
          </p>
          <Button type="button" size="sm" variant={playing ? "outline" : "primary"} onClick={toggle}>
            {playing ? "Durdur" : "Oynat"}
          </Button>
        </div>
        <div className="min-h-0 flex-1 bg-[linear-gradient(180deg,#fff_0%,#f8fafc_100%)] px-1">
          <Scene scene={scene} beat={beat} steps={steps} />
        </div>
        <div className="flex shrink-0 flex-col gap-0.5 border-t border-[var(--border)] px-2 py-1">
          <div className="flex items-center gap-1">
            <div className="flex shrink-0" role="group" aria-label="Oynatıcı adımları">
              {beats.map((item, index) => (
                <button
                  key={`${scene}-${index}`}
                  type="button"
                  aria-label={`Adım ${index + 1}`}
                  aria-current={index === beat ? "step" : undefined}
                  className="flex h-6 w-5 items-center justify-center"
                  onClick={() => setBeat(index)}
                >
                  <span
                    className={
                      index === beat
                        ? "h-1.5 w-3 rounded-full bg-[var(--safir)]"
                        : "h-1.5 w-1.5 rounded-full bg-[var(--border-strong)]"
                    }
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-medium text-[var(--safir-deep)]">
              Adım {beat + 1} / {beats.length}
            </p>
          </div>
          <p className="line-clamp-2 text-xs leading-4" aria-live="polite">
            {caption}
          </p>
        </div>
      </div>

      <article
        className={`flex ${stageClass} min-h-0 flex-col overflow-hidden rounded-xl border border-[var(--border)] bg-white p-2.5`}
      >
        <h3 className="shrink-0 text-xs font-semibold text-[var(--safir-deep)]">Ders Notu</h3>
        <p className="mt-1 min-h-0 flex-1 overflow-y-auto whitespace-pre-line text-sm leading-5">{note}</p>
      </article>
    </div>
  );
}

function Scene({
  scene,
  beat,
  steps,
}: {
  scene: JuniorVectorScene;
  beat: number;
  steps?: readonly string[];
}) {
  if (scene === "elective") {
    const lines = steps && steps.length > 0 ? steps : BEATS.elective.map((item) => item.caption);
    return <ElectiveBoard beat={beat} steps={lines} />;
  }
  if (scene === "fraction") {
    return <FractionScene beat={beat} />;
  }
  if (scene === "fraction-sum") {
    return <FractionSumScene beat={beat} />;
  }
  if (scene === "force") {
    return <ForceScene beat={beat} />;
  }
  if (scene === "friction") {
    return <FrictionScene beat={beat} />;
  }
  if (scene === "support-idea") {
    return <SupportIdeaScene beat={beat} />;
  }
  return <MainIdeaScene beat={beat} />;
}

function FractionScene({ beat }: { beat: number }) {
  if (beat >= 8) {
    return (
      <svg viewBox="0 0 360 200" className="block h-full w-full" role="img" aria-hidden preserveAspectRatio="xMidYMid meet">
        <Pie cx={78} cy={78} r={48} cuts equal fill />
        <text x="40" y="146" fill="#15803d" fontSize="14" fontFamily="inherit" fontWeight="700">
          Eşit: kesir
        </text>
        <Pie cx={250} cy={78} r={48} cuts equal={false} fill={false} />
        <path d="M214 78 L232 96 L268 48" fill="none" stroke="#e11d48" strokeWidth="4" />
        <text x="196" y="146" fill="#e11d48" fontSize="14" fontFamily="inherit" fontWeight="700">
          Eşit değil
        </text>
        <text x="40" y="178" fill="#0f172a" fontSize="14" fontFamily="inherit">
          Okunuş: dörtte bir. Birde dört değil.
        </text>
      </svg>
    );
  }

  const cuts = beat >= 2;
  const fill = beat >= 4;
  const pull = beat === 6 || beat === 7;
  const showFraction = beat === 5 || beat === 7;
  const right =
    beat === 0
      ? ["1 bütün", "Henüz bölünmedi"]
      : beat === 1
        ? ["Kesir", "Eşit parça ister"]
        : beat === 2
          ? ["4 eşit parça", "Çizgiler bölüyor"]
          : beat === 3
            ? ["Boylar aynı", "Dört parça eşit"]
            : beat === 4
              ? ["Pay", "Seçilen parça"]
              : beat === 5
                ? ["Pay 1", "Payda 4"]
                : beat === 6
                  ? ["Soru", "1 dilim alındı"]
                  : ["Sonuç", "Dörtte bir"];

  return (
    <svg viewBox="0 0 360 200" className="block h-full w-full" role="img" aria-hidden preserveAspectRatio="xMidYMid meet">
      <g transform={pull ? "translate(0 0)" : undefined}>
        <Pie cx={108} cy={92} r={64} cuts={cuts} equal={cuts} fill={fill} pull={pull} />
      </g>
      {beat === 3 ? (
        <>
          <text x="96" y="70" fill="#0369a1" fontSize="11" fontFamily="inherit">
            eşit
          </text>
          <text x="128" y="70" fill="#0369a1" fontSize="11" fontFamily="inherit">
            eşit
          </text>
          <text x="96" y="118" fill="#0369a1" fontSize="11" fontFamily="inherit">
            eşit
          </text>
          <text x="128" y="118" fill="#0369a1" fontSize="11" fontFamily="inherit">
            eşit
          </text>
        </>
      ) : null}
      <text x="196" y="72" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
        {right[0]}
      </text>
      <text x="196" y="96" fill="#0f172a" fontSize="14" fontFamily="inherit">
        {right[1]}
      </text>
      {showFraction ? (
        <text x="196" y="140" fill="#0369a1" fontSize="32" fontFamily="inherit" fontWeight="700">
          1/4
        </text>
      ) : null}
      {beat === 6 ? (
        <text x="196" y="140" fill="#b45309" fontSize="28" fontFamily="inherit" fontWeight="700">
          ?
        </text>
      ) : null}
    </svg>
  );
}

function Pie({
  cx,
  cy,
  r,
  cuts,
  equal,
  fill,
  pull = false,
}: {
  cx: number;
  cy: number;
  r: number;
  cuts: boolean;
  equal: boolean;
  fill: boolean;
  pull?: boolean;
}) {
  const top = cy - r;
  const right = cx + r;
  const bottom = cy + r;
  const left = cx - r;
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill="#fff7ed" stroke="#0f172a" strokeWidth="3" />
      {fill ? (
        <path
          d={`M${cx} ${cy} L${cx} ${top} A${r} ${r} 0 0 1 ${right} ${cy} Z`}
          fill="#38bdf8"
          transform={pull ? `translate(16 -10)` : undefined}
        />
      ) : null}
      {cuts && equal ? (
        <>
          <line x1={cx} y1={top} x2={cx} y2={bottom} stroke="#0f172a" strokeWidth="2" />
          <line x1={left} y1={cy} x2={right} y2={cy} stroke="#0f172a" strokeWidth="2" />
        </>
      ) : null}
      {cuts && !equal ? (
        <>
          <line x1={cx} y1={top} x2={cx + 8} y2={bottom} stroke="#0f172a" strokeWidth="2" />
          <line x1={left + 18} y1={cy - 16} x2={right} y2={cy + 20} stroke="#0f172a" strokeWidth="2" />
        </>
      ) : null}
    </g>
  );
}

function FractionSumScene({ beat }: { beat: number }) {
  const showRight = beat >= 1;
  const emphasizePayda = beat === 2 || beat === 6;
  const showAdd = beat >= 3 && beat < 8;
  const showPayMath = beat === 5 || beat === 4;
  const showStay = beat === 6;
  const showResult = beat === 7;
  const trap = beat >= 8;

  return (
    <svg viewBox="0 0 360 200" className="block h-full w-full" role="img" aria-hidden preserveAspectRatio="xMidYMid meet">
      <Bar x={16} filled={1} label="1/4" hot={emphasizePayda} />
      {showRight ? <Bar x={188} filled={2} label="2/4" hot={emphasizePayda} /> : null}
      {showAdd ? (
        <text x="132" y="62" fill="#0f172a" fontSize="22" fontFamily="inherit">
          +
        </text>
      ) : null}
      {beat === 4 ? (
        <text x="16" y="128" fill="#0f172a" fontSize="15" fontFamily="inherit">
          Paylar toplanır. Payda kalır.
        </text>
      ) : null}
      {showPayMath ? (
        <text x="16" y="156" fill="#0369a1" fontSize="18" fontFamily="inherit" fontWeight="700">
          1 + 2 = 3
        </text>
      ) : null}
      {showStay ? (
        <text x="150" y="156" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
          Payda 4 kalır
        </text>
      ) : null}
      {showResult ? (
        <>
          <text x="16" y="128" fill="#0f172a" fontSize="14" fontFamily="inherit">
            Sonuç
          </text>
          <Bar x={78} y={108} filled={3} label="3/4" />
        </>
      ) : null}
      {trap ? (
        <>
          <text x="16" y="128" fill="#e11d48" fontSize="18" fontFamily="inherit" fontWeight="700">
            3/8
          </text>
          <line x1="14" y1="122" x2="58" y2="132" stroke="#e11d48" strokeWidth="3" />
          <text x="78" y="128" fill="#15803d" fontSize="18" fontFamily="inherit" fontWeight="700">
            Doğru: 3/4
          </text>
          <text x="16" y="168" fill="#0f172a" fontSize="14" fontFamily="inherit">
            Paydalar toplanmaz.
          </text>
        </>
      ) : null}
    </svg>
  );
}

function Bar({
  x,
  y = 28,
  filled,
  label,
  hot = false,
}: {
  x: number;
  y?: number;
  filled: number;
  label: string;
  hot?: boolean;
}) {
  return (
    <g>
      {[0, 1, 2, 3].map((index) => (
        <rect
          key={index}
          x={x + index * 26}
          y={y}
          width="24"
          height="32"
          rx="4"
          fill={index < filled ? "#38bdf8" : "#fff"}
          stroke={hot ? "#b45309" : "#0f172a"}
          strokeWidth={hot ? 3 : 2}
        />
      ))}
      <text x={x} y={y + 52} fill="#0f172a" fontSize="14" fontFamily="inherit">
        {label}
      </text>
    </g>
  );
}

function ForceScene({ beat }: { beat: number }) {
  const summary = beat >= 8;
  const example = beat === 7;
  const shift = beat === 3 || beat === 4 ? 40 : beat === 5 ? -36 : 0;
  const showPush = beat === 2 || beat === 3 || summary;
  const showPull = beat === 4 || beat === 5 || summary;
  const title =
    beat === 0
      ? "Cisim duruyor"
      : beat === 1
        ? "Kuvvet: itme veya çekme"
        : beat === 2
          ? "İtme oku sağa"
          : beat === 3
            ? "Cisim sağa kaydı"
            : beat === 4
              ? "Çekme ters yönde"
              : beat === 5
                ? "Cisim sola geldi"
                : beat === 6
                  ? "Ok yönü gösterir"
                  : example
                    ? "Kapı sağa itilir"
                    : "Yön şart. Çekme de kuvvettir.";

  return (
    <svg viewBox="0 0 360 200" className="block h-full w-full" role="img" aria-hidden preserveAspectRatio="xMidYMid meet">
      <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit">
        {title}
      </text>
      {example ? (
        <>
          <rect x="168" y="48" width="18" height="92" rx="2" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
          <circle cx="180" cy="96" r="3" fill="#0f172a" />
          <Arrow x1={196} x2={300} y={92} color="#e11d48" label="İtme" />
          <text x="16" y="176" fill="#0f172a" fontSize="13" fontFamily="inherit">
            Çekmece ters yöne çekilir.
          </text>
        </>
      ) : (
        <>
          <line x1="24" y1="156" x2="336" y2="156" stroke="#94a3b8" strokeWidth="3" />
          {showPush ? <Arrow x1={28} x2={120 + (summary ? 0 : shift)} y={108} color="#e11d48" label="İtme" /> : null}
          <rect x={156 + shift} y="84" width="64" height="52" rx="8" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
          {showPull ? <Arrow x1={148 + shift} x2={36} y={108} color="#2563eb" label="Çekme" /> : null}
          {beat === 1 ? (
            <text x="24" y="176" fill="#0f172a" fontSize="13" fontFamily="inherit">
              Büyüklüğü vardır. Birimi newton.
            </text>
          ) : null}
          {beat === 6 ? (
            <>
              <Arrow x1={24} x2={110} y={64} color="#e11d48" label="Yön" />
              <Arrow x1={300} x2={214} y={64} color="#2563eb" label="Ters yön" />
            </>
          ) : null}
        </>
      )}
    </svg>
  );
}

function FrictionScene({ beat }: { beat: number }) {
  const rough = beat <= 3 || beat === 6;
  const trap = beat >= 8;
  const longFriction = beat === 2 || beat === 3 || beat === 6;
  const showMotion = beat >= 1 && beat < 8;
  const showFriction = beat >= 2 && beat < 8;
  const boxX = rough ? 124 : beat >= 5 ? 188 : 150;
  const title = trap
    ? "Sıfır değil. Sürtünme kuvvettir."
    : beat === 7
      ? "Örnek: buzda sürtünme az"
      : beat === 6
        ? "Pürüzlü taban tutuşu artırır"
        : beat === 5
          ? "Kısa ok, yok olan ok değildir"
          : beat === 4
            ? "Düz yer"
            : beat === 3
              ? "Pürüz artınca ok uzar"
              : rough
                ? "Pürüzlü yer"
                : "Düz yer";

  return (
    <svg viewBox="0 0 360 200" className="block h-full w-full" role="img" aria-hidden preserveAspectRatio="xMidYMid meet">
      <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit">
        {title}
      </text>
      {rough && !trap ? (
        <polyline
          points="20,150 48,136 76,154 104,132 132,154 160,134 188,154 216,132 244,154 272,136 300,154 336,140"
          fill="none"
          stroke="#78716c"
          strokeWidth={beat === 3 ? 5 : 3}
        />
      ) : (
        <line x1="20" y1="150" x2="340" y2="150" stroke="#7dd3fc" strokeWidth="4" />
      )}
      {!trap ? (
        <rect x={boxX} y="98" width="68" height="44" rx="8" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
      ) : (
        <rect x="168" y="98" width="68" height="44" rx="8" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
      )}
      {beat === 6 ? <rect x={boxX + 8} y="138" width="52" height="8" rx="2" fill="#44403c" /> : null}
      {showMotion ? (
        <Arrow x1={boxX + 72} x2={boxX + (longFriction ? 130 : 150)} y={120} color="#16a34a" label="Hareket" />
      ) : null}
      {showFriction ? (
        <Arrow
          x1={boxX - 8}
          x2={boxX - (longFriction ? 78 : 40)}
          y={78}
          color="#e11d48"
          label="Sürtünme"
        />
      ) : null}
      {trap ? (
        <>
          <Arrow x1={150} x2={96} y={78} color="#e11d48" label="Az kaldı" />
          <text x="24" y="176" fill="#e11d48" fontSize="16" fontFamily="inherit" fontWeight="700">
            0
          </text>
          <line x1="20" y1="170" x2="40" y2="182" stroke="#e11d48" strokeWidth="3" />
          <text x="52" y="176" fill="#0f172a" fontSize="14" fontFamily="inherit">
            Sürtünme sıfır yazılmaz.
          </text>
        </>
      ) : null}
    </svg>
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
  const tip = forward ? `${x2},${y} ${x2 - 12},${y - 7} ${x2 - 12},${y + 7}` : `${x2},${y} ${x2 + 12},${y - 7} ${x2 + 12},${y + 7}`;
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

function MainIdeaScene({ beat }: { beat: number }) {
  const lines = beat >= 1;
  const focus = beat === 2 || beat === 3 || beat === 5;
  const named = beat >= 3 && beat < 6;
  const question = beat === 6;
  const answer = beat === 7 || beat >= 8;
  const trap = beat >= 8;

  return (
    <svg viewBox="0 0 360 200" className="block h-full w-full" role="img" aria-hidden preserveAspectRatio="xMidYMid meet">
      <rect x="28" y="16" width="304" height="168" rx="12" fill="#fff" stroke="#0f172a" strokeWidth="3" />
      <text x="44" y="40" fill="#64748b" fontSize="13" fontFamily="inherit">
        {question ? "Soru" : answer ? "Çözüm" : "Metin"}
      </text>
      {lines && !question && !answer ? (
        <>
          <rect x="44" y="52" width="272" height="28" rx="6" fill={focus || named ? "#fde68a" : "#f8fafc"} stroke="#0f172a" strokeWidth="2" />
          <text x="54" y="71" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
            {named ? "Ana fikir" : "Ortadaki cümle"}
          </text>
          {beat >= 4 ? (
            <>
              <text x="54" y="104" fill={trap ? "#e11d48" : "#64748b"} fontSize="13" fontFamily="inherit">
                {trap ? "örnek ana fikir değildir" : "ayrıntı: örnek"}
              </text>
              <text x="54" y="126" fill="#64748b" fontSize="13" fontFamily="inherit">
                ayrıntı: sayı
              </text>
            </>
          ) : null}
          {beat === 5 ? (
            <text x="54" y="156" fill="#0369a1" fontSize="16" fontFamily="inherit" fontWeight="700">
              Tek cümle yeter.
            </text>
          ) : null}
        </>
      ) : null}
      {question ? (
        <>
          <text x="44" y="78" fill="#0f172a" fontSize="14" fontFamily="inherit">
            Ağaç gölge verir.
          </text>
          <text x="44" y="102" fill="#0f172a" fontSize="14" fontFamily="inherit">
            Kuş ağaca yuva yapar.
          </text>
          <text x="44" y="126" fill="#0f172a" fontSize="14" fontFamily="inherit">
            Ağaç canlıya yarar sağlar.
          </text>
          <text x="44" y="162" fill="#b45309" fontSize="14" fontFamily="inherit" fontWeight="700">
            Yazar ne demek istiyor?
          </text>
        </>
      ) : null}
      {answer ? (
        <>
          <text x="44" y="72" fill={trap ? "#e11d48" : "#64748b"} fontSize="13" fontFamily="inherit">
            Gölge verir. Ayrıntı.
          </text>
          {trap ? <line x1="44" y1="68" x2="168" y2="68" stroke="#e11d48" strokeWidth="2" /> : null}
          <text x="44" y="96" fill="#64748b" fontSize="13" fontFamily="inherit">
            Yuva yapar. Ayrıntı.
          </text>
          <rect x="44" y="112" width="260" height="32" rx="8" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
          <text x="54" y="133" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
            Ağaç canlıya yarar sağlar.
          </text>
          {trap ? (
            <text x="44" y="166" fill="#0f172a" fontSize="13" fontFamily="inherit">
              Konu ağaçtır. Yargı ana fikirdir.
            </text>
          ) : null}
        </>
      ) : null}
    </svg>
  );
}

function SupportIdeaScene({ beat }: { beat: number }) {
  const showLeft = beat >= 1;
  const showRight = beat >= 2;
  const link = beat >= 3;
  const same = beat === 5;
  const question = beat === 6;
  const solved = beat === 7 || beat >= 8;

  return (
    <svg viewBox="0 0 360 200" className="block h-full w-full" role="img" aria-hidden preserveAspectRatio="xMidYMid meet">
      <rect x="90" y="16" width="180" height="36" rx="8" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
      <text x="118" y="39" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Ana fikir
      </text>
      {showLeft && !question ? (
        <>
          <rect x="24" y="108" width="140" height="34" rx="8" fill="#e0f2fe" stroke="#0f172a" strokeWidth="2" />
          <text x="36" y="130" fill="#0f172a" fontSize="13" fontFamily="inherit">
            {solved ? "Gölge: yardımcı" : "Yardımcı fikir"}
          </text>
        </>
      ) : null}
      {showRight && !question ? (
        <>
          <rect x="196" y="108" width="140" height="34" rx="8" fill="#e0f2fe" stroke="#0f172a" strokeWidth="2" />
          <text x="208" y="130" fill="#0f172a" fontSize="13" fontFamily="inherit">
            {solved ? "Yuva: yardımcı" : "Yardımcı fikir"}
          </text>
        </>
      ) : null}
      {link && !question ? (
        <>
          <line x1="150" y1="52" x2="94" y2="108" stroke="#0f172a" strokeWidth="2" />
          <line x1="210" y1="52" x2="266" y2="108" stroke="#0f172a" strokeWidth="2" />
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
    </svg>
  );
}
