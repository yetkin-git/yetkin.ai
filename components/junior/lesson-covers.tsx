"use client";

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

/** Katalog kapağı. Diskteki 1280×720 JPEG. Yükleme hatasında şablon SVG basılmaz. */
export function LessonCover({ lessonKey, subject, title, grade }: CoverProps) {
  const alt = juniorCoverAlt({ title, subject, grade });
  const src = juniorCoverSrc(lessonKey);
  return (
    <img
      src={src}
      alt={alt}
      width={1280}
      height={720}
      decoding="async"
      className="h-full w-full object-cover"
    />
  );
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
