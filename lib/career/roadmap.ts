/**
 * 30/60/90 eylem planı. SWOT kanıtından yazılır.
 * Merit, LP ve cüzdan harcı yoktur. Model çağrısı yoktur.
 */

import { buildCareerSwot, type CareerEvidence } from "@/lib/career/swot";
import { tezgahToolHref, type TezgahToolId } from "@/lib/tezgah/catalog";

export type RoadmapWindow = {
  id: "d30" | "d60" | "d90";
  title: string;
  body: string;
  href: string;
  cta: string;
};

const TOOLS: readonly TezgahToolId[] = ["proposal", "ecommerce", "grant", "dukkan", "reklam", "tetkik"];

function nextTool(input: CareerEvidence): TezgahToolId {
  const quiet = TOOLS.find((id) => (input.tezgahToolCounts[id] ?? 0) === 0);
  return quiet ?? "proposal";
}

export function buildCareerRoadmap(input: CareerEvidence): readonly [RoadmapWindow, RoadmapWindow, RoadmapWindow] {
  const swot = buildCareerSwot(input);
  const tool = nextTool(input);
  const href = tezgahToolHref(tool);
  const strength = swot.strengths[0]?.label ?? "İlk kanıt henüz yok.";
  const gap = swot.weaknesses[0]?.label ?? "Gelişime açık alan seçilmedi.";
  const stamped = input.stampTitles.length > 0;
  const yetkin = input.yetkinCv ?? null;
  if (yetkin) {
    const practice = yetkin.practiceHref;
    const gap = yetkin.gapSkills[0] ?? "Seçilen uzmanlık";
    return [
      {
        id: "d30",
        title: "İlk 30 gün",
        body: `${gap} için tek pratik vaka üret. Puan bu çıktıyla değil, sonraki testle değişir.`,
        href: practice,
        cta: "Pratik vakayı aç",
      },
      {
        id: "d60",
        title: "30–60 gün",
        body: `${yetkin.verticalLabel} odağında ikinci çıktıyı arşive yaz. Tezgâh, e-ticaret veya YetkinHibe.`,
        href: practice,
        cta: "İkinci çıktıyı üret",
      },
      {
        id: "d90",
        title: "60–90 gün",
        body: yetkin.passed
          ? "Barajı geçen puanın doğrulama bağını paylaş. Bağ, sunucudaki SHA-256 kaydıdır."
          : "Baraj altındaki puan geçiş değildir. Aynı vaka testini yeniden çöz.",
        href: yetkin.passed && yetkin.verifyHref ? yetkin.verifyHref : "/career#yetkincv",
        cta: yetkin.passed ? "Doğrulama bağını aç" : "Teste dön",
      },
    ];
  }
  return [
    {
      id: "d30",
      title: "İlk 30 gün",
      body: `${gap} Bu pencerede tek tezgâh aracında bir çıktı üret ve arşive yaz.`,
      href,
      cta: "Tezgâhta üret",
    },
    {
      id: "d60",
      title: "30–60 gün",
      body: `${strength} İkinci pencerede aynı araçtan iki çıktı daha ekle. Puan yoksa YetkinCV vaka testine otur.`,
      href: stamped ? href : "/tezgah",
      cta: stamped ? "Arşivi büyüt" : "Tezgâhta üret",
    },
    {
      id: "d90",
      title: "60–90 gün",
      body: stamped
        ? "Üçüncü pencerede kamu vizesini paylaş. Dizin satırı, aynı kırılımda beş kişi şartına bağlıdır."
        : "Üçüncü pencerede test kanıtı olmadan dizin satırı açılmaz. Pratik vaka Tezgâh, e-ticaret veya YetkinHibe üzerindedir.",
      href: stamped ? "/uzmanlar" : "/panel/hibe",
      cta: stamped ? "Uzman dizinine bak" : "YetkinHibe’yi aç",
    },
  ];
}

function safePracticeHref(href: string): string {
  if (href.includes("..") || href.includes("\\") || href.includes("://") || !/^\/(?!\/)[A-Za-z0-9/?=&._~%-]*$/.test(href)) {
    return "/tezgah";
  }
  return href;
}

/** İlanın eksik yetkinliğine göre 30/60/90. Puan burada değişmez; sonraki test yazar. */
export function buildJobGapRoadmap(input: {
  skillLabel: string;
  points: number;
  jobTitle: string;
  companyName: string;
  practiceHref: string;
  daysRemaining: number;
  closesBar: boolean;
}): readonly [RoadmapWindow, RoadmapWindow, RoadmapWindow] {
  const href = safePracticeHref(input.practiceHref);
  const gap = `${input.skillLabel} puanını +${input.points} artırmalısın`;
  const ceiling = input.closesBar
    ? ""
    : " Bu tek beceri 100 olsa da baraj başka yetkinlikte kalabilir.";
  return [
    {
      id: "d30",
      title: "İlk 30 gün",
      body: `${input.companyName} · ${input.jobTitle}. ${gap}${ceiling} Bu pencerede tek pratik vaka üret. Puan bu çıktıyla değil, sonraki YetkinCV testiyle değişir.`,
      href,
      cta: "Pratik vakayı aç",
    },
    {
      id: "d60",
      title: "30–60 gün",
      body: `${input.skillLabel} odağında ikinci çıktıyı arşive yaz. İlan kapanışına ${input.daysRemaining} gün var.`,
      href,
      cta: "İkinci çıktıyı üret",
    },
    {
      id: "d90",
      title: "60–90 gün",
      body: "Aynı vaka testini yeniden çöz. Ağırlıklı puan barajı geçince başvuru yolu açılır.",
      href: "/career#yetkincv",
      cta: "YetkinCV testine dön",
    },
  ];
}
