"use client";

import { useState } from "react";
import { juniorCoverAlt } from "@/lib/junior/cover-alt";
import { juniorCoverSrc } from "@/lib/junior/covers";

type CoverProps = {
  lessonKey: string;
  subject: string;
  title?: string;
  grade?: number;
};

const SUBJECT_WASH: Record<string, string> = {
  Matematik: "#fff7ed",
  "Fen Bilimleri": "#ecfdf5",
  Türkçe: "#f5f3ff",
  İngilizce: "#eff6ff",
  "Sosyal Bilgiler": "#fffbeb",
  Almanca: "#fef2f2",
  Fransızca: "#fdf2f8",
  Siyer: "#f0fdf4",
  "Bilgisayar Bilimi": "#eef2ff",
  Arapça: "#fffbeb",
};

function wash(subject: string): string {
  return SUBJECT_WASH[subject] ?? "#fff7ed";
}

export function SubjectMark({ subject }: { subject: string }) {
  return (
    <svg viewBox="0 0 48 48" className="h-12 w-12" role="img" aria-hidden>
      <rect width="48" height="48" rx="14" fill={wash(subject)} />
      {subject === "Fen Bilimleri" ? (
        <FenMark />
      ) : subject === "Türkçe" ? (
        <TurkceMark />
      ) : subject === "Matematik" ? (
        <MatMark />
      ) : subject === "Sosyal Bilgiler" ? (
        <SosyalMark />
      ) : (
        <ElectiveMark subject={subject} />
      )}
    </svg>
  );
}

export function LessonCover({ lessonKey, subject, title, grade }: CoverProps) {
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const alt = juniorCoverAlt({ title, subject, grade });
  let src: string | null = null;
  try {
    src = lessonKey.trim() ? juniorCoverSrc(lessonKey) : null;
  } catch {
    src = null;
  }
  if (src && failedKey !== lessonKey) {
    return (
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover"
        onError={() => setFailedKey(lessonKey)}
      />
    );
  }
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-label={alt}>
      <rect width="320" height="180" fill={wash(subject)} />
      <CoverArt lessonKey={lessonKey} subject={subject} />
    </svg>
  );
}

function CoverArt({ lessonKey, subject }: CoverProps) {
  if (lessonKey === "jr_06_mat-1") {
    return <ExponentCover />;
  }
  if (lessonKey === "jr_06_mat-11") {
    return <FractionSumCover />;
  }
  if (lessonKey.startsWith("jr_06_fen-")) {
    return <FenCover lessonKey={lessonKey} />;
  }
  if (lessonKey === "jr_06_turkce-1" || lessonKey === "jr_06_turkce-4" || lessonKey === "jr_06_turkce-5" || lessonKey === "jr_06_turkce-6" || lessonKey === "jr_06_turkce-7") {
    return <MeaningCover />;
  }
  if (lessonKey === "jr_06_turkce-8") {
    return <MainIdeaCover />;
  }
  if (lessonKey === "jr_06_turkce-9") {
    return <SupportIdeaCover />;
  }
  if (lessonKey === "jr_06_turkce-2" || lessonKey === "jr_06_turkce-3" || lessonKey === "jr_06_turkce-13") {
    return <WordTreeCover />;
  }
  if (lessonKey === "jr_06_turkce-14" || lessonKey === "jr_06_turkce-15" || lessonKey === "jr_06_turkce-16") {
    return <AffixCover />;
  }
  if (lessonKey.startsWith("jr_06_turkce-")) {
    return <BookCover />;
  }
  if (lessonKey.startsWith("jr_06_sosyal-")) {
    return <SosyalCover lessonKey={lessonKey} />;
  }
  if (lessonKey.startsWith("jr_06_ing_main-")) {
    return <IngMainCover lessonKey={lessonKey} />;
  }
  if (subject === "Fen Bilimleri") {
    return <ForceCover />;
  }
  if (subject === "Türkçe") {
    return <MainIdeaCover />;
  }
  if (subject === "Matematik") {
    return <FractionCover />;
  }
  if (subject === "Sosyal Bilgiler") {
    return <PlaceCover />;
  }
  return <ElectiveCover subject={subject} />;
}

function ElectiveMark({ subject }: { subject: string }) {
  const letter = subject.slice(0, 1);
  return (
    <>
      <rect x="10" y="10" width="28" height="28" rx="8" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      <text x="24" y="29" textAnchor="middle" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        {letter}
      </text>
    </>
  );
}

function ElectiveCover({ subject }: { subject: string }) {
  return (
    <>
      <rect x="36" y="36" width="248" height="108" rx="16" fill="#fff" stroke="#0f172a" strokeWidth="3" />
      <text x="160" y="84" textAnchor="middle" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
        {subject}
      </text>
      <text x="160" y="114" textAnchor="middle" fill="#0369a1" fontSize="14" fontFamily="inherit">
        Seçmeli ders
      </text>
    </>
  );
}

function MatMark() {
  return (
    <>
      <circle cx="24" cy="24" r="14" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      <path d="M24 24 L24 10 A14 14 0 0 1 38 24 Z" fill="#38bdf8" />
      <line x1="24" y1="10" x2="24" y2="38" stroke="#0f172a" strokeWidth="1.5" />
      <line x1="10" y1="24" x2="38" y2="24" stroke="#0f172a" strokeWidth="1.5" />
    </>
  );
}

function FenMark() {
  return (
    <>
      <rect x="16" y="16" width="16" height="14" rx="3" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
      <line x1="32" y1="23" x2="42" y2="23" stroke="#e11d48" strokeWidth="3" />
      <polygon points="42,23 36,19 36,27" fill="#e11d48" />
    </>
  );
}

function SosyalMark() {
  return (
    <>
      <circle cx="24" cy="24" r="14" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      <path d="M24 12 L28 20 L24 18 L20 20 Z" fill="#b45309" />
      <path d="M14 28 H34" stroke="#0f172a" strokeWidth="1.5" />
      <path d="M24 16 V32" stroke="#0f172a" strokeWidth="1.5" />
    </>
  );
}

function TurkceMark() {
  return (
    <>
      <rect x="12" y="10" width="24" height="28" rx="3" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      <rect x="16" y="18" width="16" height="6" rx="2" fill="#fde68a" />
      <line x1="16" y1="30" x2="32" y2="30" stroke="#94a3b8" strokeWidth="2" />
    </>
  );
}

function ExponentCover() {
  return (
    <>
      <text x="78" y="78" fill="#0f172a" fontSize="42" fontFamily="inherit" fontWeight="700">
        2
      </text>
      <text x="108" y="52" fill="#b45309" fontSize="22" fontFamily="inherit" fontWeight="700">
        3
      </text>
      <text x="132" y="78" fill="#0f172a" fontSize="28" fontFamily="inherit" fontWeight="700">
        = 8
      </text>
      <text x="78" y="118" fill="#0369a1" fontSize="16" fontFamily="inherit">
        taban ve üs
      </text>
      <text x="78" y="146" fill="#0f172a" fontSize="14" fontFamily="inherit">
        2 × 2 × 2
      </text>
    </>
  );
}

function FenCover({ lessonKey }: { lessonKey: string }) {
  const order = Number(lessonKey.slice("jr_06_fen-".length));
  if (order === 1) return <PlanetCover />;
  if (order === 2) return <EclipseCover />;
  if (order === 5 || order === 6) return <BloodCover />;
  if (order === 9 || order === 10) return <ForceCover />;
  if (order >= 11 && order <= 13) return <ParticleCover />;
  if (order === 14 || order === 15) return <SoundCover />;
  if (order === 19 || order === 20) return <CircuitCover />;
  return <BodyCover />;
}

function PlanetCover() {
  return (
    <>
      <circle cx="70" cy="90" r="28" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
      <text x="54" y="96" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
        Güneş
      </text>
      <circle cx="140" cy="90" r="10" fill="#94a3b8" stroke="#0f172a" strokeWidth="2" />
      <circle cx="178" cy="90" r="12" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
      <circle cx="220" cy="90" r="16" fill="#fb923c" stroke="#0f172a" strokeWidth="2" />
      <text x="120" y="140" fill="#0f172a" fontSize="14" fontFamily="inherit">
        sekiz gezegen
      </text>
    </>
  );
}

function MeaningCover() {
  return (
    <>
      <rect x="28" y="48" width="80" height="72" rx="10" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      <text x="40" y="90" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
        Gerçek
      </text>
      <rect x="120" y="48" width="80" height="72" rx="10" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
      <text x="136" y="90" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
        Mecaz
      </text>
      <rect x="212" y="48" width="80" height="72" rx="10" fill="#e0f2fe" stroke="#0f172a" strokeWidth="2" />
      <text x="230" y="90" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
        Terim
      </text>
    </>
  );
}

function SosyalCover({ lessonKey }: { lessonKey: string }) {
  const order = Number(lessonKey.slice("jr_06_sosyal-".length));
  if (order === 1) return <RolesCover />;
  if (order === 2 || order === 3) return <HarmonyCover />;
  if (order === 9) return <PlaceCover />;
  if (order === 5 || order === 6 || order === 7) return <HistoryCover />;
  if (order === 8 || order === 20) return <CaravanCover />;
  if (order === 4 || (order >= 14 && order <= 18)) return <AssemblyCover />;
  return <GlobeCover />;
}

function RolesCover() {
  return (
    <>
      <rect x="24" y="40" width="84" height="96" rx="12" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      <text x="40" y="96" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Kardeş
      </text>
      <rect x="118" y="40" width="84" height="96" rx="12" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
      <text x="130" y="96" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Öğrenci
      </text>
      <rect x="212" y="40" width="84" height="96" rx="12" fill="#e0f2fe" stroke="#0f172a" strokeWidth="2" />
      <text x="228" y="96" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Oyuncu
      </text>
    </>
  );
}

function IngMainCover({ lessonKey }: { lessonKey: string }) {
  const order = Number(lessonKey.slice("jr_06_ing_main-".length));
  if (order <= 2) {
    return (
      <>
        <circle cx="78" cy="90" r="42" fill="#fff" stroke="#0f172a" strokeWidth="3" />
        <line x1="78" y1="90" x2="78" y2="58" stroke="#0369a1" strokeWidth="3" />
        <line x1="78" y1="90" x2="58" y2="112" stroke="#b45309" strokeWidth="3" />
        <text x="136" y="84" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
          seven o'clock
        </text>
        <text x="136" y="112" fill="#0369a1" fontSize="14" fontFamily="inherit">
          I wake up
        </text>
      </>
    );
  }
  if (order <= 4) {
    return (
      <>
        <rect x="36" y="70" width="160" height="52" rx="14" fill="#fff" stroke="#0f172a" strokeWidth="3" />
        <ellipse cx="70" cy="96" rx="14" ry="10" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
        <rect x="100" y="86" width="28" height="16" rx="3" fill="#f59e0b" stroke="#0f172a" strokeWidth="2" />
        <text x="210" y="96" fill="#15803d" fontSize="16" fontFamily="inherit" fontWeight="700">
          I like
        </text>
      </>
    );
  }
  if (order <= 6) {
    return (
      <>
        <rect x="36" y="78" width="28" height="52" fill="#e0f2fe" stroke="#0f172a" strokeWidth="2" />
        <rect x="70" y="58" width="32" height="72" fill="#bae6fd" stroke="#0f172a" strokeWidth="2" />
        <rect x="108" y="70" width="28" height="60" fill="#fff" stroke="#0f172a" strokeWidth="2" />
        <text x="156" y="96" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
          bigger
        </text>
      </>
    );
  }
  if (order <= 8) {
    return (
      <>
        <circle cx="70" cy="88" r="22" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
        <ellipse cx="130" cy="86" rx="26" ry="14" fill="#e2e8f0" stroke="#0f172a" strokeWidth="2" />
        <text x="176" y="96" fill="#0369a1" fontSize="16" fontFamily="inherit" fontWeight="700">
          sunny
        </text>
      </>
    );
  }
  if (order <= 10) {
    return (
      <>
        <circle cx="90" cy="96" r="36" fill="none" stroke="#0f172a" strokeWidth="3" />
        <line x1="90" y1="60" x2="90" y2="132" stroke="#b45309" strokeWidth="2" />
        <line x1="54" y1="96" x2="126" y2="96" stroke="#b45309" strokeWidth="2" />
        <text x="150" y="100" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
          fun
        </text>
      </>
    );
  }
  if (order <= 12) {
    return (
      <>
        <circle cx="70" cy="90" r="28" fill="#e0f2fe" stroke="#0f172a" strokeWidth="3" />
        <text x="48" y="94" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
          doctor
        </text>
        <text x="120" y="96" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
          was / were
        </text>
      </>
    );
  }
  if (order <= 14) {
    return (
      <>
        <circle cx="64" cy="72" r="16" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
        <rect x="120" y="88" width="64" height="36" rx="6" fill="#fff" stroke="#0f172a" strokeWidth="3" />
        <text x="200" y="110" fill="#0369a1" fontSize="16" fontFamily="inherit" fontWeight="700">
          swam
        </text>
      </>
    );
  }
  if (order <= 16) {
    return (
      <>
        <rect x="36" y="48" width="120" height="90" rx="4" fill="#fff7ed" stroke="#0f172a" strokeWidth="3" />
        <line x1="36" y1="78" x2="156" y2="78" stroke="#0f172a" strokeWidth="2" />
        <line x1="36" y1="108" x2="156" y2="108" stroke="#0f172a" strokeWidth="2" />
        <text x="176" y="96" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
          on the shelf
        </text>
      </>
    );
  }
  if (order <= 18) {
    return (
      <>
        <rect x="40" y="70" width="36" height="48" rx="4" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
        <rect x="86" y="70" width="36" height="48" rx="4" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
        <rect x="132" y="70" width="36" height="48" rx="4" fill="#86efac" stroke="#0f172a" strokeWidth="2" />
        <text x="184" y="100" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
          should
        </text>
      </>
    );
  }
  return (
    <>
      <rect x="40" y="64" width="70" height="56" rx="6" fill="#fff" stroke="#0f172a" strokeWidth="3" />
      <path d="M58 96 l10 10 l20 -22" fill="none" stroke="#15803d" strokeWidth="4" />
      <text x="130" y="98" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
        one vote
      </text>
    </>
  );
}

function FractionCover() {
  return (
    <>
      <circle cx="118" cy="90" r="58" fill="#fff" stroke="#0f172a" strokeWidth="3" />
      <path d="M118 90 L118 32 A58 58 0 0 1 176 90 Z" fill="#38bdf8" />
      <line x1="118" y1="32" x2="118" y2="148" stroke="#0f172a" strokeWidth="2" />
      <line x1="60" y1="90" x2="176" y2="90" stroke="#0f172a" strokeWidth="2" />
      <text x="198" y="84" fill="#0f172a" fontSize="28" fontFamily="inherit" fontWeight="700">
        1/4
      </text>
      <text x="198" y="112" fill="#0369a1" fontSize="14" fontFamily="inherit">
        eşit parça
      </text>
    </>
  );
}

function FractionSumCover() {
  return (
    <>
      <Bars x={24} y={48} filled={1} />
      <text x="148" y="78" fill="#0f172a" fontSize="28" fontFamily="inherit" fontWeight="700">
        +
      </text>
      <Bars x={176} y={48} filled={2} />
      <text x="24" y="128" fill="#0f172a" fontSize="14" fontFamily="inherit">
        Payda aynı kalır
      </text>
      <Bars x={148} y={112} filled={3} />
    </>
  );
}

function Bars({ x, y, filled }: { x: number; y: number; filled: number }) {
  return (
    <g>
      {[0, 1, 2, 3].map((index) => (
        <rect
          key={index}
          x={x + index * 28}
          y={y}
          width="24"
          height="32"
          rx="4"
          fill={index < filled ? "#38bdf8" : "#fff"}
          stroke="#0f172a"
          strokeWidth="2"
        />
      ))}
    </g>
  );
}

function ForceCover() {
  return (
    <>
      <line x1="28" y1="142" x2="292" y2="142" stroke="#94a3b8" strokeWidth="4" />
      <rect x="124" y="78" width="72" height="56" rx="8" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
      <line x1="40" y1="106" x2="112" y2="106" stroke="#e11d48" strokeWidth="4" />
      <polygon points="112,106 100,99 100,113" fill="#e11d48" />
      <text x="40" y="92" fill="#e11d48" fontSize="13" fontFamily="inherit" fontWeight="700">
        İtme
      </text>
      <line x1="196" y1="64" x2="124" y2="64" stroke="#2563eb" strokeWidth="4" />
      <polygon points="124,64 136,57 136,71" fill="#2563eb" />
      <text x="150" y="52" fill="#2563eb" fontSize="13" fontFamily="inherit" fontWeight="700">
        Çekme
      </text>
    </>
  );
}

function EclipseCover() {
  return (
    <>
      <circle cx="70" cy="88" r="28" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
      <circle cx="118" cy="88" r="14" fill="#0f172a" />
      <circle cx="210" cy="88" r="22" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
      <text x="70" y="146" fill="#0f172a" fontSize="14" fontFamily="inherit">
        Gündüz tutulması
      </text>
    </>
  );
}

function BloodCover() {
  return (
    <>
      <circle cx="78" cy="90" r="22" fill="#ef4444" stroke="#0f172a" strokeWidth="2" />
      <circle cx="118" cy="78" r="18" fill="#fecaca" stroke="#0f172a" strokeWidth="2" />
      <circle cx="150" cy="108" r="10" fill="#fca5a5" stroke="#0f172a" strokeWidth="2" />
      <text x="180" y="86" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
        A B AB 0
      </text>
      <text x="180" y="112" fill="#0369a1" fontSize="14" fontFamily="inherit">
        kan hücresi
      </text>
    </>
  );
}

function BodyCover() {
  return (
    <>
      <circle cx="118" cy="48" r="16" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
      <line x1="118" y1="64" x2="118" y2="120" stroke="#0f172a" strokeWidth="3" />
      <line x1="118" y1="80" x2="78" y2="108" stroke="#0f172a" strokeWidth="3" />
      <line x1="118" y1="80" x2="158" y2="108" stroke="#0f172a" strokeWidth="3" />
      <line x1="118" y1="120" x2="86" y2="156" stroke="#0f172a" strokeWidth="3" />
      <line x1="118" y1="120" x2="150" y2="156" stroke="#0f172a" strokeWidth="3" />
      <text x="176" y="96" fill="#0f172a" fontSize="14" fontFamily="inherit">
        kemik ve kas
      </text>
    </>
  );
}

function ParticleCover() {
  return (
    <>
      <circle cx="70" cy="78" r="10" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
      <circle cx="96" cy="78" r="10" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
      <circle cx="70" cy="104" r="10" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
      <circle cx="96" cy="104" r="10" fill="#38bdf8" stroke="#0f172a" strokeWidth="2" />
      <circle cx="180" cy="70" r="8" fill="#7dd3fc" stroke="#0f172a" strokeWidth="2" />
      <circle cx="220" cy="100" r="8" fill="#7dd3fc" stroke="#0f172a" strokeWidth="2" />
      <circle cx="250" cy="64" r="8" fill="#7dd3fc" stroke="#0f172a" strokeWidth="2" />
      <text x="150" y="146" fill="#0f172a" fontSize="14" fontFamily="inherit">
        katı ve gaz
      </text>
    </>
  );
}

function SoundCover() {
  return (
    <>
      <circle cx="70" cy="90" r="10" fill="#0f172a" />
      <path d="M96 70 q28 20 0 40" fill="none" stroke="#0369a1" strokeWidth="3" />
      <path d="M112 58 q44 32 0 64" fill="none" stroke="#0369a1" strokeWidth="3" />
      <path d="M128 46 q60 44 0 88" fill="none" stroke="#0369a1" strokeWidth="3" />
      <text x="168" y="96" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
        yankı
      </text>
    </>
  );
}

function CircuitCover() {
  return (
    <>
      <rect x="40" y="70" width="48" height="36" rx="6" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
      <circle cx="180" cy="88" r="22" fill="#fef08a" stroke="#0f172a" strokeWidth="3" />
      <line x1="88" y1="88" x2="158" y2="88" stroke="#0f172a" strokeWidth="3" />
      <text x="214" y="94" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
        iletken
      </text>
    </>
  );
}

function MainIdeaCover() {
  return (
    <>
      <rect x="70" y="28" width="180" height="128" rx="12" fill="#fff" stroke="#0f172a" strokeWidth="3" />
      <text x="88" y="56" fill="#64748b" fontSize="13" fontFamily="inherit">
        Metin
      </text>
      <rect x="88" y="68" width="144" height="32" rx="8" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
      <text x="100" y="89" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
        Ana fikir
      </text>
      <text x="100" y="122" fill="#94a3b8" fontSize="13" fontFamily="inherit">
        ayrıntı
      </text>
      <text x="100" y="142" fill="#94a3b8" fontSize="13" fontFamily="inherit">
        örnek
      </text>
    </>
  );
}

function PlaceCover() {
  return (
    <>
      <rect x="48" y="28" width="160" height="120" rx="12" fill="#fff" stroke="#0f172a" strokeWidth="3" />
      <line x1="48" y1="88" x2="208" y2="88" stroke="#94a3b8" strokeWidth="2" />
      <line x1="128" y1="28" x2="128" y2="148" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="128" cy="88" r="8" fill="#b45309" />
      <text x="224" y="72" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
        Enlem
      </text>
      <text x="224" y="108" fill="#0369a1" fontSize="16" fontFamily="inherit" fontWeight="700">
        Boylam
      </text>
    </>
  );
}

function HarmonyCover() {
  return (
    <>
      <circle cx="90" cy="88" r="28" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
      <circle cx="230" cy="88" r="28" fill="#bae6fd" stroke="#0f172a" strokeWidth="3" />
      <path d="M122 100 H198" stroke="#b45309" strokeWidth="4" />
      <text x="108" y="150" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
        Birlikte
      </text>
    </>
  );
}

function HistoryCover() {
  return (
    <>
      <path d="M36 120 H284" stroke="#b45309" strokeWidth="3" />
      <circle cx="70" cy="120" r="12" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
      <circle cx="160" cy="120" r="12" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
      <circle cx="250" cy="120" r="12" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
      <text x="48" y="154" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Hun
      </text>
      <text x="124" y="154" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Talas
      </text>
      <text x="214" y="154" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Anadolu
      </text>
    </>
  );
}

function CaravanCover() {
  return (
    <>
      <path d="M28 120 C100 70 180 140 292 84" fill="none" stroke="#b45309" strokeWidth="3" />
      <rect x="70" y="72" width="84" height="36" rx="8" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
      <text x="86" y="95" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Kervan
      </text>
      <text x="180" y="150" fill="#0369a1" fontSize="14" fontFamily="inherit">
        İpek ve fikir
      </text>
    </>
  );
}

function AssemblyCover() {
  return (
    <>
      <rect x="28" y="48" width="80" height="80" rx="10" fill="#fff" stroke="#0f172a" strokeWidth="3" />
      <rect x="120" y="48" width="80" height="80" rx="10" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
      <rect x="212" y="48" width="80" height="80" rx="10" fill="#fff" stroke="#0f172a" strokeWidth="3" />
      <text x="40" y="94" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
        Yasama
      </text>
      <text x="128" y="94" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
        Yürütme
      </text>
      <text x="228" y="94" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
        Yargı
      </text>
    </>
  );
}

function GlobeCover() {
  return (
    <>
      <circle cx="120" cy="90" r="52" fill="#e0f2fe" stroke="#0f172a" strokeWidth="3" />
      <ellipse cx="120" cy="90" rx="52" ry="14" fill="none" stroke="#b45309" strokeWidth="2" />
      <text x="190" y="78" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
        Türkiye
      </text>
      <text x="190" y="108" fill="#0369a1" fontSize="14" fontFamily="inherit">
        İklim ve yer
      </text>
    </>
  );
}

function SupportIdeaCover() {
  return (
    <>
      <rect x="78" y="24" width="164" height="40" rx="8" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
      <text x="112" y="50" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
        Ana fikir
      </text>
      <line x1="120" y1="64" x2="78" y2="104" stroke="#0f172a" strokeWidth="2" />
      <line x1="200" y1="64" x2="242" y2="104" stroke="#0f172a" strokeWidth="2" />
      <rect x="28" y="104" width="120" height="36" rx="8" fill="#e0f2fe" stroke="#0f172a" strokeWidth="2" />
      <text x="40" y="127" fill="#0f172a" fontSize="13" fontFamily="inherit">
        Yardımcı fikir
      </text>
      <rect x="172" y="104" width="120" height="36" rx="8" fill="#e0f2fe" stroke="#0f172a" strokeWidth="2" />
      <text x="184" y="127" fill="#0f172a" fontSize="13" fontFamily="inherit">
        Yardımcı fikir
      </text>
    </>
  );
}

function WordTreeCover() {
  return (
    <>
      <line x1="160" y1="150" x2="160" y2="70" stroke="#92400e" strokeWidth="6" />
      <circle cx="160" cy="58" r="22" fill="#86efac" stroke="#0f172a" strokeWidth="2" />
      <circle cx="100" cy="96" r="18" fill="#fde68a" stroke="#0f172a" strokeWidth="2" />
      <circle cx="220" cy="96" r="18" fill="#e0f2fe" stroke="#0f172a" strokeWidth="2" />
      <text x="118" y="168" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Söz ağacı
      </text>
    </>
  );
}

function AffixCover() {
  return (
    <>
      <rect x="48" y="64" width="100" height="52" rx="10" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
      <text x="72" y="96" fill="#0f172a" fontSize="18" fontFamily="inherit" fontWeight="700">
        kök
      </text>
      <rect x="172" y="64" width="100" height="52" rx="10" fill="#e0f2fe" stroke="#0f172a" strokeWidth="3" />
      <text x="200" y="96" fill="#0f172a" fontSize="18" fontFamily="inherit" fontWeight="700">
        ek
      </text>
    </>
  );
}

function BookCover() {
  return (
    <>
      <path d="M70 36 h80 v110 h-80 z" fill="#fff" stroke="#0f172a" strokeWidth="3" />
      <path d="M150 36 h80 v110 h-80 z" fill="#fff7ed" stroke="#0f172a" strokeWidth="3" />
      <text x="86" y="96" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        Sayfa
      </text>
    </>
  );
}
