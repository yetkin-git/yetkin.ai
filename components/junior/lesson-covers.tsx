type CoverProps = {
  lessonKey: string;
  subject: string;
};

const SUBJECT_WASH: Record<string, string> = {
  Matematik: "#fff7ed",
  "Fen Bilimleri": "#ecfdf5",
  Türkçe: "#f5f3ff",
  İngilizce: "#eff6ff",
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
      ) : (
        <ElectiveMark subject={subject} />
      )}
    </svg>
  );
}

export function LessonCover({ lessonKey, subject }: CoverProps) {
  return (
    <svg viewBox="0 0 320 180" className="h-full w-full" role="img" aria-hidden>
      <rect width="320" height="180" fill={wash(subject)} />
      <CoverArt lessonKey={lessonKey} subject={subject} />
    </svg>
  );
}

function CoverArt({ lessonKey, subject }: CoverProps) {
  if (lessonKey === "jr_06_mat-1") {
    return <FractionCover />;
  }
  if (lessonKey === "jr_06_mat-2") {
    return <FractionSumCover />;
  }
  if (lessonKey === "jr_06_fen-1") {
    return <ForceCover />;
  }
  if (lessonKey === "jr_06_fen-2") {
    return <FrictionCover />;
  }
  if (lessonKey === "jr_06_turkce-1") {
    return <MainIdeaCover />;
  }
  if (lessonKey === "jr_06_turkce-2") {
    return <SupportIdeaCover />;
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

function TurkceMark() {
  return (
    <>
      <rect x="12" y="10" width="24" height="28" rx="3" fill="#fff" stroke="#0f172a" strokeWidth="2" />
      <rect x="16" y="18" width="16" height="6" rx="2" fill="#fde68a" />
      <line x1="16" y1="30" x2="32" y2="30" stroke="#94a3b8" strokeWidth="2" />
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

function FrictionCover() {
  return (
    <>
      <polyline
        points="16,146 46,132 76,150 106,130 136,148 166,132 196,150 226,130 256,148 286,134 312,148"
        fill="none"
        stroke="#78716c"
        strokeWidth="3"
      />
      <rect x="124" y="88" width="72" height="48" rx="8" fill="#fde68a" stroke="#0f172a" strokeWidth="3" />
      <line x1="204" y1="112" x2="268" y2="112" stroke="#16a34a" strokeWidth="4" />
      <polygon points="268,112 256,105 256,119" fill="#16a34a" />
      <text x="204" y="100" fill="#16a34a" fontSize="13" fontFamily="inherit" fontWeight="700">
        Hareket
      </text>
      <line x1="116" y1="72" x2="48" y2="72" stroke="#e11d48" strokeWidth="4" />
      <polygon points="48,72 60,65 60,79" fill="#e11d48" />
      <text x="48" y="60" fill="#e11d48" fontSize="13" fontFamily="inherit" fontWeight="700">
        Sürtünme
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
