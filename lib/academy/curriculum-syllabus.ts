/**
 * Kurs detayı — modül, ders türü (ses/video/doküman) ve süre.
 * Oynatıcı gövdesini açmaz; tohum müfredatından özet basar.
 */

import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import {
  academyLessonMediaMeta,
  type AcademyLessonContentKind,
} from "@/lib/academy/lesson-meta";

export type AcademySyllabusLesson = {
  key: string;
  order: number;
  title: string;
  kind: AcademyLessonContentKind;
  durationMin: number;
};

export type AcademySyllabusModule = {
  id: string;
  title: string;
  lessons: readonly AcademySyllabusLesson[];
  durationMin: number;
};

export type AcademySyllabus = {
  slug: string;
  modules: readonly AcademySyllabusModule[];
  lessons: readonly AcademySyllabusLesson[];
  durationMin: number;
  lessonCount: number;
};

const LESSONS_PER_MODULE = 4;

const MODULE_TITLES: Record<string, readonly string[]> = {
  "ai-agent-temel": [
    "Ajan, tarif ve araç",
    "Hafıza, ReAct ve kapanış ajanı",
  ],
  "ai-agent-orta": [
    "RAG, gömme ve vektör sorgu",
    "Çoklu ajan, durum, onay ve kapanış",
  ],
  "ai-agent-ileri": [
    "Graf, onarım, korkuluk ve eval",
    "Üretim kuyruğu ve kapanış odası",
  ],
  "python-temel": [
    "Değişken, tip ve karar",
    "Fonksiyon, koleksiyon ve kapanış",
  ],
  "python-orta": [
    "Sınıf, miras ve kapsül",
    "JSON, hata, HTTP ve mühür",
  ],
  "python-ileri": [
    "Decorator, üreteç ve asenkron çekirdek",
    "Süreç, metaclass ve işleme motoru",
  ],
  "fullstack-temel": [
    "HTTP, semantik iskelet, JavaScript ve fetch",
    "TypeScript sözleşmesi ve kapanış projesi",
  ],
  "fullstack-orta": [
    "React bileşen, durum, Express ve Prisma",
    "JWT kimlik ve görev takip kapanışı",
  ],
  "fullstack-ileri": [
    "App Router, RSC, mikroservis ve Redis",
    "Docker, CI/CD ve kapanış servisi",
  ],
  "security-temel": [
    "CIA üçlüsü, ağ kapısı, OWASP ve kimlik",
    "Güvenlik duvarı, etik ve kapatma projesi",
  ],
  "security-orta": [
    "Keşif, lab ağ envanteri, IDOR ve SSRF",
    "OAuth2/JWT, SAST ve kapatma projesi",
  ],
  "security-ileri": [
    "DevSecOps, IAM/KMS, olay müdahalesi ve SIEM",
    "Sıfır Güven ve kapatma senaryosu",
  ],
  "ai-temel": ["Dil modeli temelleri", "Veri ve özet", "Kaynaklı asistan ve kapanış"],
  "ux-temel": ["Araştırma ve mimari", "Figma ve tel çerçeve", "Görsel sistem ve teslim"],
  "excel-masterclass": [
    "Hücre, arama, özet ve temizlik",
    "Otomasyon ve satış dashboard kapanışı",
  ],
  "google-ads-masterclass": [
    "Hesap, eşleme, ağ ve GTM dönüşüm",
    "Kalite puanı ve kampanya kapanışı",
  ],
  "meta-ads-masterclass": [
    "Suite, kitle, format ve piksel/CAPI",
    "CBO/ABO, ROAS ve huni kapanışı",
  ],
  "eticaret-masterclass": [
    "Tezgâh, mağaza, liste ve stok senkronu",
    "Kargo/iade ve vitrin kapanışı",
  ],
  "canva-masterclass": [
    "Kalıp, kare, kâğıt ve Magic disiplini",
    "Teslim formatı ve paket kapanışı",
  ],
  "linkedin-masterclass": [
    "Profil, içerik, ICP ve outreach",
    "Konumlandırma ve pipeline kapanışı",
  ],
};

function moduleTitleFor(slug: string, moduleIndex: number): string {
  const named = MODULE_TITLES[slug]?.[moduleIndex];
  if (named) {
    return named;
  }
  return `Modül ${moduleIndex + 1}`;
}

export function curriculumSyllabusForCourseSlug(slug: string): AcademySyllabus {
  const seeds = curriculumForCourseSlug(slug);
  const lessons: AcademySyllabusLesson[] = seeds.map((lesson) => {
    const media = academyLessonMediaMeta({ ...lesson, courseSlug: slug });
    return {
      key: lesson.key,
      order: lesson.order,
      title: lesson.title,
      kind: media.kind,
      durationMin: media.durationMin,
    };
  });
  const modules: AcademySyllabusModule[] = [];
  for (let offset = 0; offset < lessons.length; offset += LESSONS_PER_MODULE) {
    const group = lessons.slice(offset, offset + LESSONS_PER_MODULE);
    const moduleIndex = modules.length;
    modules.push({
      id: `${slug}-mod-${moduleIndex + 1}`,
      title: moduleTitleFor(slug, moduleIndex),
      lessons: group,
      durationMin: group.reduce((sum, lesson) => sum + lesson.durationMin, 0),
    });
  }
  return {
    slug,
    modules,
    lessons,
    durationMin: lessons.reduce((sum, lesson) => sum + lesson.durationMin, 0),
    lessonCount: lessons.length,
  };
}
