"use client";
/* eslint-disable @next/next/no-img-element */

import { useState } from "react";

import { juniorCoverAlt } from "@/lib/junior/cover-alt";
import { juniorCoverManifestHash, juniorCoverSrc } from "@/lib/junior/covers";

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

const SUBJECT_ACCENT: Record<string, { border: string; badgeBg: string; badgeText: string; symbol: string }> = {
  Matematik: { border: "#f59e0b", badgeBg: "#fef3c7", badgeText: "#92400e", symbol: "∑ ÷ ×" },
  "Fen Bilimleri": { border: "#10b981", badgeBg: "#d1fae5", badgeText: "#065f46", symbol: "⚛ ★" },
  Türkçe: { border: "#8b5cf6", badgeBg: "#ede9fe", badgeText: "#5b21b6", symbol: "Aa · ? !" },
  İngilizce: { border: "#3b82f6", badgeBg: "#dbeafe", badgeText: "#1e40af", symbol: "EN · A–Z" },
  "Sosyal Bilgiler": { border: "#d97706", badgeBg: "#fef3c7", badgeText: "#92400e", symbol: "🌍 🧭" },
  Almanca: { border: "#ef4444", badgeBg: "#fee2e2", badgeText: "#991b1b", symbol: "DE · Hallo" },
  Fransızca: { border: "#ec4899", badgeBg: "#fce7f3", badgeText: "#9d174d", symbol: "FR · Bonjour" },
  Siyer: { border: "#16a34a", badgeBg: "#dcfce7", badgeText: "#166534", symbol: "☪ Ahlak" },
  "Bilgisayar Bilimi": { border: "#6366f1", badgeBg: "#e0e7ff", badgeText: "#3730a3", symbol: "</> Kod" },
  Arapça: { border: "#d97706", badgeBg: "#fef3c7", badgeText: "#92400e", symbol: "ع · ←" },
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

export function FallbackLessonCover({
  lessonKey,
  subject,
  title,
  grade = 6,
  alt,
}: CoverProps & { alt: string }) {
  const bg = wash(subject);
  const theme = SUBJECT_ACCENT[subject] ?? {
    border: "#0284c7",
    badgeBg: "#e0f2fe",
    badgeText: "#075985",
    symbol: subject.slice(0, 2).toUpperCase(),
  };
  const headline = (title ?? subject).trim();
  const line1 = headline.length > 36 ? `${headline.slice(0, 36).trim()}…` : headline;
  return (
    <svg
      viewBox="0 0 640 360"
      className="h-full w-full object-cover"
      role="img"
      aria-label={alt}
      data-junior-cover-fallback={lessonKey}
    >
      <rect width="640" height="360" fill={bg} />
      <circle cx="540" cy="80" r="110" fill={theme.badgeBg} opacity="0.65" />
      <circle cx="96" cy="300" r="80" fill={theme.badgeBg} opacity="0.5" />
      <rect
        x="28"
        y="24"
        width="584"
        height="312"
        rx="24"
        fill="#ffffff"
        fillOpacity="0.82"
        stroke={theme.border}
        strokeWidth="3"
      />
      <rect x="52" y="48" width="118" height="36" rx="18" fill={theme.badgeBg} />
      <text
        x="111"
        y="71"
        textAnchor="middle"
        fill={theme.badgeText}
        fontSize="15"
        fontFamily="inherit"
        fontWeight="700"
      >
        {`${grade}. Sınıf`}
      </text>
      <rect x="444" y="48" width="144" height="36" rx="18" fill={theme.badgeBg} />
      <text
        x="516"
        y="71"
        textAnchor="middle"
        fill={theme.badgeText}
        fontSize="15"
        fontFamily="inherit"
        fontWeight="700"
      >
        {theme.symbol}
      </text>
      <text x="52" y="152" fill={theme.badgeText} fontSize="22" fontFamily="inherit" fontWeight="700">
        {subject}
      </text>
      <text x="52" y="198" fill="#0f172a" fontSize="26" fontFamily="inherit" fontWeight="700">
        {line1}
      </text>
      <line x1="52" y1="236" x2="260" y2="236" stroke={theme.border} strokeWidth="4" strokeLinecap="round" />
      <text x="52" y="278" fill="#475569" fontSize="16" fontFamily="inherit" fontWeight="600">
        Yetkin Junior · İnteraktif Ders Sahnesi
      </text>
    </svg>
  );
}

/** Katalog kapağı. Diskteki/CDN'deki 1280×720 JPEG; manifestte olmayan seçmeli derslerde veya yükleme hatasında SVG branş kartına düşer. */
export function LessonCover({ lessonKey, subject, title, grade }: CoverProps) {
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const alt = juniorCoverAlt({ title, subject, grade });
  const inManifest = Boolean(juniorCoverManifestHash(lessonKey));
  if (!inManifest || failedKey === lessonKey) {
    return <FallbackLessonCover lessonKey={lessonKey} subject={subject} title={title} grade={grade} alt={alt} />;
  }
  const src = juniorCoverSrc(lessonKey);
  return (
    <img
      src={src}
      alt={alt}
      width={1280}
      height={720}
      decoding="async"
      onError={() => setFailedKey(lessonKey)}
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
