"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input, INPUT_SURFACE_CLASS, selectValueTypoClass } from "@/components/ui/input";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { cn } from "@/components/ui/cn";
import { GRANT_DETAIL_DURATIONS, type GrantDetailDuration, type GrantDetailsInput } from "@/lib/tezgah/grant/details-input";
import {
  GRANT_DOSSIER_NO_ELIGIBLE,
  GRANT_DOSSIER_WIZARD_NOTE,
} from "@/lib/yetkinhibe/grant-project-notes";

export type GrantWizardProgram = {
  grantId: string;
  title: string;
  sourceLabel: string;
};

function digits(value: string, max: number): boolean {
  return new RegExp(`^\\d{1,${max}}$`).test(value);
}

function readyDetails(state: {
  targetGrantId: string;
  durationMonths: string;
  totalBudgetLira: string;
  personnelLira: string;
  equipmentLira: string;
  serviceLira: string;
  teamHeadcount: string;
  teamExpertise: string;
  outputGoal: string;
  programs: readonly GrantWizardProgram[];
}): boolean {
  const duration = Number(state.durationMonths);
  const durationOk = duration === 12 || duration === 18 || duration === 24;
  const headcount = Number(state.teamHeadcount);
  const amounts = [state.totalBudgetLira, state.personnelLira, state.equipmentLira, state.serviceLira];
  if (!amounts.every((value) => digits(value, 10))) {
    return false;
  }
  const total = Number(state.totalBudgetLira);
  const sum = Number(state.personnelLira) + Number(state.equipmentLira) + Number(state.serviceLira);
  return (
    state.programs.some((program) => program.grantId === state.targetGrantId) &&
    durationOk &&
    total >= 1 &&
    total <= 1_000_000_000 &&
    sum === total &&
    Number.isInteger(headcount) &&
    headcount >= 1 &&
    headcount <= 5_000 &&
    state.teamExpertise.trim().length >= 12 &&
    state.teamExpertise.trim().length <= 800 &&
    state.outputGoal.trim().length >= 12 &&
    state.outputGoal.trim().length <= 800
  );
}

export function GrantDetailWizard({
  programs,
  pending,
  blocked,
  briefReady,
  error,
  initialGrantId = "",
  onSubmit,
}: {
  programs: readonly GrantWizardProgram[];
  pending: boolean;
  blocked: boolean;
  briefReady: boolean;
  error: string;
  initialGrantId?: string;
  onSubmit: (details: GrantDetailsInput) => void;
}) {
  const [targetGrantId, setTargetGrantId] = useState(initialGrantId);
  const [durationMonths, setDurationMonths] = useState("");
  const [totalBudgetLira, setTotalBudgetLira] = useState("");
  const [personnelLira, setPersonnelLira] = useState("");
  const [equipmentLira, setEquipmentLira] = useState("");
  const [serviceLira, setServiceLira] = useState("");
  const [teamHeadcount, setTeamHeadcount] = useState("");
  const [teamExpertise, setTeamExpertise] = useState("");
  const [outputGoal, setOutputGoal] = useState("");

  const amountsReady = [totalBudgetLira, personnelLira, equipmentLira, serviceLira].every((value) => digits(value, 10));
  const sumMismatch =
    amountsReady &&
    Number(personnelLira) + Number(equipmentLira) + Number(serviceLira) !== Number(totalBudgetLira);
  const ready =
    briefReady &&
    readyDetails({
      targetGrantId,
      durationMonths,
      totalBudgetLira,
      personnelLira,
      equipmentLira,
      serviceLira,
      teamHeadcount,
      teamExpertise,
      outputGoal,
      programs,
    });

  function submit(event: FormEvent) {
    event.preventDefault();
    const duration = Number(durationMonths);
    if (!ready || pending || blocked || programs.length === 0) {
      return;
    }
    if (duration !== 12 && duration !== 18 && duration !== 24) {
      return;
    }
    const details: GrantDetailsInput = {
      targetGrantId,
      durationMonths: duration as GrantDetailDuration,
      totalBudgetLira: totalBudgetLira.trim(),
      personnelLira: personnelLira.trim(),
      equipmentLira: equipmentLira.trim(),
      serviceLira: serviceLira.trim(),
      teamHeadcount: teamHeadcount.trim(),
      teamExpertise: teamExpertise.trim(),
      outputGoal: outputGoal.trim(),
    };
    onSubmit(details);
  }

  return (
    <details
      data-grant-detail-wizard=""
      className="rounded-[var(--radius-card)] border border-[color-mix(in_srgb,var(--safir)_18%,transparent)] bg-[var(--surface)] print:hidden"
    >
      <summary className="cursor-pointer px-6 py-4 text-base font-semibold text-[var(--foreground)]">
        Başvuru Dosyasını Derinleştir (Kuruma Özel Ek Bilgiler)
      </summary>
      <div className="px-6 pb-6">
        <p className="text-sm leading-6 text-[var(--muted)]">{GRANT_DOSSIER_WIZARD_NOTE}</p>
        {programs.length === 0 ? (
          <p className="mt-3 text-sm leading-6 text-[var(--foreground)]">{GRANT_DOSSIER_NO_ELIGIBLE}</p>
        ) : null}
        <form className="mt-4" onSubmit={submit}>
          <fieldset disabled={pending || programs.length === 0} className="space-y-4 disabled:opacity-70">
            <legend className="sr-only">Kuruma özel ek bilgiler</legend>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Hedeflenen Destek Programı Seçimi
              <select
                className={cn("mt-1", INPUT_SURFACE_CLASS, selectValueTypoClass(targetGrantId))}
                value={targetGrantId}
                onChange={(event) => setTargetGrantId(event.target.value)}
              >
                <option value="">Program seç</option>
                {programs.map((program) => (
                  <option key={program.grantId} value={program.grantId}>
                    {program.sourceLabel} — {program.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Proje Süresi (Ay)
              <select
                className={cn("mt-1", INPUT_SURFACE_CLASS, selectValueTypoClass(durationMonths))}
                value={durationMonths}
                onChange={(event) => setDurationMonths(event.target.value)}
              >
                <option value="">12, 18 veya 24 ay</option>
                {GRANT_DETAIL_DURATIONS.map((months) => (
                  <option key={months} value={months}>
                    {months} ay
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Tahmini Toplam Proje Bütçesi (TL)
              <Input
                inputMode="numeric"
                autoComplete="off"
                maxLength={10}
                value={totalBudgetLira}
                placeholder="180000"
                onChange={(event) => setTotalBudgetLira(event.target.value)}
              />
            </label>
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-[var(--foreground)]">Ana Gider Kalemleri</legend>
              <label className="block text-sm text-[var(--foreground)]">
                Personel
                <Input
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={10}
                  value={personnelLira}
                  placeholder="80000"
                  onChange={(event) => setPersonnelLira(event.target.value)}
                />
              </label>
              <label className="block text-sm text-[var(--foreground)]">
                Makine-Teçhizat
                <Input
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={10}
                  value={equipmentLira}
                  placeholder="70000"
                  onChange={(event) => setEquipmentLira(event.target.value)}
                />
              </label>
              <label className="block text-sm text-[var(--foreground)]">
                Yazılım/Hizmet Alımı
                <Input
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={10}
                  value={serviceLira}
                  placeholder="30000"
                  onChange={(event) => setServiceLira(event.target.value)}
                />
              </label>
            </fieldset>
            {sumMismatch ? (
              <p className="text-sm text-[var(--rose)]">Kalemler toplam bütçeyle aynı olmalı.</p>
            ) : null}
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium text-[var(--foreground)]">
                Proje Ekibi & Ar-Ge / Teknik Yetkinlik Özeti
              </legend>
              <label className="block text-sm text-[var(--foreground)]">
                Personel sayısı
                <Input
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={4}
                  value={teamHeadcount}
                  placeholder="6"
                  onChange={(event) => setTeamHeadcount(event.target.value)}
                />
              </label>
              <label className="block text-sm text-[var(--foreground)]">
                Uzmanlıklar
                <div className="mt-1">
                  <SmartTextarea
                    context="hibe"
                    rows={4}
                    maxLength={800}
                    value={teamExpertise}
                    placeholder="Uzmanlıklarını buraya yaz…"
                    onChange={(event) => setTeamExpertise(event.target.value)}
                    softHint="Biraz daha detay ekleyin (roller, deneyim, araçlar)…"
                  />
                </div>
              </label>
            </fieldset>
            <label className="block text-sm font-medium text-[var(--foreground)]">
              Beklenen Somut Çıktı & Ticarileşme / İhracat Hedefi
              <div className="mt-1">
                <SmartTextarea
                  context="hibe"
                  rows={4}
                  maxLength={800}
                  value={outputGoal}
                  placeholder="Talebini buraya yaz…"
                  onChange={(event) => setOutputGoal(event.target.value)}
                  softHint="Biraz daha detay ekleyin (çıktı, pazar, hedef)…"
                />
              </div>
            </label>
            {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
            <Button type="submit" disabled={!ready || pending || blocked || programs.length === 0}>
              {pending ? "Üretiliyor" : "Tam Proje Dosyasını Oluştur"}
            </Button>
          </fieldset>
        </form>
      </div>
    </details>
  );
}
