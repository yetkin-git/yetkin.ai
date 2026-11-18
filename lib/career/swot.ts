/**
 * SWOT kadranı. Rozet ve tezgâh geçmişinden yazılır.
 * Merit, LP ve paralel puan yoktur. Model çağrısı yoktur.
 */

import type { YetkinCvSwotInput } from "@/lib/career/yetkincv";
import { tezgahToolById, tezgahToolHref, type TezgahToolId } from "@/lib/tezgah/catalog";

export type SwotItem = {
  id: string;
  label: string;
};

export type SwotQuadrant = {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
};

export type CareerEvidence = {
  stampTitles: readonly string[];
  certificateTitles: readonly string[];
  tezgahToolCounts: Readonly<Record<string, number>>;
  yetkinCv?: YetkinCvSwotInput | null;
};

const TRACKED_TOOLS: readonly TezgahToolId[] = ["proposal", "ecommerce", "grant", "dukkan", "reklam", "tetkik"];

function item(id: string, label: string): SwotItem {
  return { id, label };
}

function toolLabel(id: string): string {
  const tool = tezgahToolById(id as TezgahToolId);
  return tool?.label ?? id;
}

export function buildCareerSwot(input: CareerEvidence): SwotQuadrant {
  const strengths: SwotItem[] = [];
  const weaknesses: SwotItem[] = [];
  const opportunities: SwotItem[] = [];
  const threats: SwotItem[] = [];
  const stamps = input.stampTitles.map((title) => title.trim()).filter((title) => title.length > 0);
  const certificates = input.certificateTitles.map((title) => title.trim()).filter((title) => title.length > 0);
  const yetkin = input.yetkinCv ?? null;

  if (yetkin) {
    strengths.push(
      item(
        "yetkincv-score",
        `YetkinCV skoru ${yetkin.score}/100 (${yetkin.roleLabel}, ${yetkin.verticalLabel})`,
      ),
    );
    for (const [index, label] of yetkin.strongSkills.slice(0, 3).entries()) {
      strengths.push(item(`yetkincv-strong-${index}`, `Testte doğrulanan: ${label}`));
    }
    for (const [index, label] of yetkin.gapSkills.slice(0, 3).entries()) {
      weaknesses.push(item(`yetkincv-gap-${index}`, `Gelişime açık: ${label}`));
    }
    if (yetkin.cvSignals.length > 0) {
      opportunities.push(
        item("yetkincv-cv", `CV özetinde geçen başlık: ${yetkin.cvSignals.join(", ")}`),
      );
    }
    opportunities.push(
      item("yetkincv-practice", `Puanı yükselten pratik — ${yetkin.practiceHref}`),
    );
    if (yetkin.verifyHref) {
      opportunities.push(item("yetkincv-verify", `Doğrulama bağı — ${yetkin.verifyHref}`));
    }
    if (!yetkin.passed) {
      threats.push(
        item("yetkincv-bar", "Baraj 70 altı. Paylaşım puan kaydıdır, geçiş değildir."),
      );
    }
  }

  if (stamps.length > 0) {
    for (const [index, title] of stamps.slice(0, 4).entries()) {
      strengths.push(item(`stamp-${index}`, `Doğrulanmış rozet: ${title}`));
    }
  } else if (!yetkin) {
    weaknesses.push(item("no-stamp", "Henüz doğrulanmış rozet yok. YetkinCV vaka testi ilk kanıttır."));
  }

  if (certificates.length > 0) {
    strengths.push(item("record", `Kayıtlı belge: ${certificates.slice(0, 2).join(", ")}`));
  } else if (stamps.length === 0 && !yetkin) {
    weaknesses.push(item("no-record", "Tamamlanmış uzmanlık belgesi görünmüyor."));
  }

  const produced = TRACKED_TOOLS.filter((id) => (input.tezgahToolCounts[id] ?? 0) > 0);
  const quiet = TRACKED_TOOLS.filter((id) => (input.tezgahToolCounts[id] ?? 0) === 0);
  if (produced.length > 0) {
    strengths.push(
      item(
        "tezgah",
        `Tezgâh üretimi var: ${produced.slice(0, 3).map((id) => toolLabel(id)).join(", ")}`,
      ),
    );
  } else {
    weaknesses.push(item("no-tezgah", "Tezgâh arşivinde üretim yok. İlk çıktı kanıtı buradan başlar."));
  }

  if (stamps.length > 0) {
    opportunities.push(item("directory", "Rozet, uzman dizininde aynı kırılım beş kişiye ulaşınca satır açar."));
  }
  const nextTool = quiet[0] ?? produced[0] ?? "proposal";
  opportunities.push(
    item("next-tool", `Sıradaki tezgâh adımı: ${toolLabel(nextTool)} — ${tezgahToolHref(nextTool as TezgahToolId)}`),
  );
  if (quiet.includes("grant")) {
    opportunities.push(item("grant", "Hibe özeti tezgâhta ücretsiz haktan yazılır. Tam dosya katalog fiyatı ister."));
  }

  if (stamps.length === 0) {
    threats.push(item("no-proof", "Kanıt yokken uzman dizini satırı açılmaz. İş bulma vaadi yazılmaz."));
  } else {
    threats.push(item("stale", "Rozet durur; tezgâh arşivi tazelenmezse vitrin aynı kanıtta kalır."));
  }
  if (produced.length === 0) {
    threats.push(item("empty-archive", "Arşiv boşken portföy paylaşımı somut iş örneği taşımaz."));
  }

  return { strengths, weaknesses, opportunities, threats };
}
