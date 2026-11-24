"use client";

import { useState } from "react";
import { GrantDetailWizard, type GrantWizardProgram } from "@/components/tezgah/grant-detail-wizard";
import { GrantProjectReportView } from "@/components/tezgah/grant-project-report";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/cn";
import { Input, selectValueTypoClass } from "@/components/ui/input";
import { SmartTextarea } from "@/components/ui/smart-textarea";
import { withRailApiVersion } from "@/lib/ui/rail-client-fetch";
import type { GrantDetailsInput } from "@/lib/tezgah/grant/details-input";
import type { GrantProjectReport } from "@/lib/tezgah/grant/types";
import { isGrantInvestmentFocus } from "@/lib/yetkinhibe/grant-brief-axes";
import type { GrantPrepPlanNote } from "@/lib/yetkinhibe/master-plan";
import {
  HIBE_BUSINESS_KINDS,
  HIBE_FORM_LISTS,
  hibeBusinessAudience,
  type HibeAnalysisInput,
} from "@/lib/yetkinhibe/os-brief";

const EMPTY_BRIEF_MESSAGE = "İş fikrini yaz, sektörü ve ili seç.";

const SECTIONS = [
  "1. Proje Özeti ve Hedefler",
  "2. Pazar ve İhtiyaç Analizi",
  "3. İş Paketleri ve Zaman Çizelgesi",
  "4. Bütçe ve Harcama Kalemleri",
  "5. Beklenen Etki ve Sürdürülebilirlik",
] as const;

function isReport(data: unknown): data is GrantProjectReport & { docxBase64?: string; filename?: string } {
  if (!data || typeof data !== "object") {
    return false;
  }
  const row = data as Partial<GrantProjectReport>;
  return row.tool === "grant" && typeof row.purpose === "string" && typeof row.market === "string";
}

export function HibeProjectDesk({
  seed,
  grantId,
  initialBusinessName = "",
  initialInvestmentFocus = "",
  planNote = null,
  paymentCommandKey = null,
}: {
  seed: HibeAnalysisInput | null;
  grantId: string;
  initialBusinessName?: string;
  initialInvestmentFocus?: string;
  planNote?: GrantPrepPlanNote | null;
  /**
   * Ş3 / B-03 — `/cuzdan` dönüşünden taşınan ödeme anahtarı. Ödeme ile dosya üretimi
   * **aynı** `Idempotency-Key`e bağlanır; kullanıcı formu baştan doldurmaz, üretim
   * ikinci kez tahsil etmez.
   */
  paymentCommandKey?: string | null;
}) {
  const [businessName, setBusinessName] = useState(seed?.businessName || initialBusinessName);
  const [freelancerName, setFreelancerName] = useState("");
  const [businessKind, setBusinessKind] = useState(seed?.businessKind ?? "kobi");
  const [provinceCode, setProvinceCode] = useState(seed?.provinceCode ?? "");
  const [naceGroup, setNaceGroup] = useState(seed?.naceGroup ?? "");
  const [investmentFocus, setInvestmentFocus] = useState(
    seed?.investmentFocus ??
      (isGrantInvestmentFocus(initialInvestmentFocus) ? initialInvestmentFocus : "makine_techizat"),
  );
  const [employeeCount, setEmployeeCount] = useState(seed ? String(seed.employeeCount) : "");
  const [companyAgeYears, setCompanyAgeYears] = useState(seed ? String(seed.companyAgeYears) : "");
  const [rdMaturityLevel, setRdMaturityLevel] = useState(seed?.rdMaturityLevel ?? "NONE");
  const [exportActive, setExportActive] = useState(seed?.exportActive ? "evet" : "hayir");
  const [patent, setPatent] = useState(seed?.hasPatentOrUtilityModel ? "evet" : "hayir");
  const [project, setProject] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [walletShort, setWalletShort] = useState(false);
  const generateKey = useState(() => crypto.randomUUID())[0];
  const [report, setReport] = useState<GrantProjectReport | null>(null);
  const [docx, setDocx] = useState<{ base64: string; filename: string } | null>(null);
  const [planCopied, setPlanCopied] = useState(false);

  function payload(details?: GrantDetailsInput): Record<string, unknown> {
    const audience = hibeBusinessAudience(businessKind) ?? "mevcut_kobi";
    const body: Record<string, unknown> = {
      businessName: businessName.trim(),
      freelancerName: freelancerName.trim(),
      provinceCode,
      audience,
      naceGroup,
      investmentFocus,
      employeeCount: employeeCount.trim(),
      companyAgeYears: companyAgeYears.trim(),
      rdMaturityLevel,
      exportActive,
      patent,
      project: project.trim(),
    };
    if (details) {
      body.details = details;
    }
    return body;
  }

  const briefReady =
    businessName.trim().length >= 2 &&
    freelancerName.trim().length >= 2 &&
    project.trim().length >= 2 &&
    Boolean(provinceCode) &&
    Boolean(naceGroup) &&
    /^\d+$/.test(employeeCount.trim()) &&
    /^\d+$/.test(companyAgeYears.trim());

  async function produce(details?: GrantDetailsInput) {
    if (pending) {
      return;
    }
    if (!briefReady) {
      setError(EMPTY_BRIEF_MESSAGE);
      return;
    }
    setPending(true);
    setError("");
    setWalletShort(false);
    try {
      const path = details ? "/api/tezgah/grant/dossier" : "/api/tezgah/grant/generate";
      const headers: Record<string, string> = {
        "content-type": "application/json",
        // Tam dosyada ödeme anahtarı varsa o kullanılır: aynı anahtar rezervasyonu,
        // defter DEBIT'ini ve `hibe_dossiers.command_key` satırını bağlar (Ş3).
        "Idempotency-Key": details
          ? (paymentCommandKey ?? crypto.randomUUID())
          : generateKey,
      };
      const response = await fetch(
        path,
        withRailApiVersion({
          method: "POST",
          headers,
          body: JSON.stringify(payload(details)),
        }),
      );
      const body = (await response.json()) as { ok?: boolean; error?: string; data?: unknown };
      if (!response.ok || body.ok === false || !isReport(body.data)) {
        if (response.status === 402) {
          setWalletShort(true);
        }
        setError(typeof body.error === "string" ? body.error : "Dosya üretilemedi.");
        return;
      }
      setReport(body.data);
      if (typeof body.data.docxBase64 === "string" && typeof body.data.filename === "string") {
        setDocx({ base64: body.data.docxBase64, filename: body.data.filename });
      } else {
        setDocx(null);
      }
    } catch {
      setError("Bağlantı kurulamadı. Yeniden dene.");
    } finally {
      setPending(false);
    }
  }

  function downloadDocx() {
    if (!docx) {
      return;
    }
    const bytes = Uint8Array.from(atob(docx.base64), (char) => char.charCodeAt(0));
    const url = URL.createObjectURL(
      new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = docx.filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  const programs: GrantWizardProgram[] = (report?.eligible ?? []).map((row) => ({
    grantId: row.grantId,
    title: row.title,
    sourceLabel: row.sourceLabel,
  }));

  return (
    <div className="space-y-4" data-hibe-project="">
      <ol className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {SECTIONS.map((section) => (
          <li
            key={section}
            className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium leading-5 text-emerald-950"
          >
            {section}
          </li>
        ))}
      </ol>
      <p className="text-sm leading-6 text-[var(--muted)]">
        Taslak günlük hakla üretilir. Tam dosya katalogdaki tam proje tutarını cüzdandan düşer. Resmî başvuru değildir.
      </p>
      {planNote ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4" data-hibe-plan-note="">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-950">Master plan notu</p>
          <p className="mt-2 text-sm leading-6">{planNote.scoreLine}</p>
          <p className="mt-1 text-xs leading-5 text-amber-950">{planNote.disclaimer}</p>
          <p className="mt-3 text-sm font-semibold">{planNote.windowTitle}</p>
          <p className="mt-1 text-sm leading-6">{planNote.windowDetail}</p>
          {planNote.gaps.length > 0 ? (
            <ul className="mt-3 space-y-1 text-sm leading-6">
              {planNote.gaps.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          ) : null}
          {planNote.blockers.length > 0 ? (
            <p className="mt-2 text-xs leading-5">Belge planıyla kapanmayan şart: {planNote.blockers.join(", ")}.</p>
          ) : null}
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-emerald-800"
            onClick={() => {
              void navigator.clipboard.writeText(planNote.text).then(
                () => setPlanCopied(true),
                () => setPlanCopied(false),
              );
            }}
          >
            {planCopied ? "Kopyalandı" : "Master plan notunu kopyala"}
          </button>
        </section>
      ) : null}
      <form
        className="grid gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4"
        onSubmit={(event) => {
          event.preventDefault();
          void produce();
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Firma adı
            <Input value={businessName} onChange={(event) => setBusinessName(event.target.value)} required minLength={2} className="mt-1" />
          </label>
          <label className="text-sm font-medium">
            Hazırlayan
            <Input value={freelancerName} onChange={(event) => setFreelancerName(event.target.value)} required minLength={2} className="mt-1" />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <label className="text-sm font-medium">
            İşletme türü
            <select className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" value={businessKind} onChange={(event) => setBusinessKind(event.target.value as HibeAnalysisInput["businessKind"])}>
              {HIBE_BUSINESS_KINDS.map((row) => (
                <option key={row.id} value={row.id}>{row.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            İl
            <select
              className={cn(
                "mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm",
                selectValueTypoClass(provinceCode),
              )}
              value={provinceCode}
              onChange={(event) => setProvinceCode(event.target.value)}
            >
              <option value="">İl seç</option>
              {HIBE_FORM_LISTS.provinces.map((row) => (
                <option key={row.code} value={row.code}>{row.name}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            NACE
            <select
              className={cn(
                "mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm",
                selectValueTypoClass(naceGroup),
              )}
              value={naceGroup}
              onChange={(event) => setNaceGroup(event.target.value)}
            >
              <option value="">Sektör seç</option>
              {HIBE_FORM_LISTS.nace.map((row) => (
                <option key={row.id} value={row.id}>{row.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Yatırım amacı
            <select className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" value={investmentFocus} onChange={(event) => setInvestmentFocus(event.target.value as HibeAnalysisInput["investmentFocus"])}>
              {HIBE_FORM_LISTS.foci.map((row) => (
                <option key={row.id} value={row.id}>{row.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            Çalışan
            <Input value={employeeCount} onChange={(event) => setEmployeeCount(event.target.value)} inputMode="numeric" required className="mt-1" />
          </label>
          <label className="text-sm font-medium">
            Şirket yaşı
            <Input value={companyAgeYears} onChange={(event) => setCompanyAgeYears(event.target.value)} inputMode="numeric" required className="mt-1" />
          </label>
          <label className="text-sm font-medium">
            Ar-Ge
            <select className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" value={rdMaturityLevel} onChange={(event) => setRdMaturityLevel(event.target.value as HibeAnalysisInput["rdMaturityLevel"])}>
              {HIBE_FORM_LISTS.rd.map((row) => (
                <option key={row.id} value={row.id}>{row.label}</option>
              ))}
            </select>
          </label>
          <label className="text-sm font-medium">
            İhracat
            <select className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" value={exportActive} onChange={(event) => setExportActive(event.target.value)}>
              <option value="hayir">Hayır</option>
              <option value="evet">Evet</option>
            </select>
          </label>
          <label className="text-sm font-medium">
            Patent
            <select className="mt-1 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm" value={patent} onChange={(event) => setPatent(event.target.value)}>
              <option value="hayir">Hayır</option>
              <option value="evet">Evet</option>
            </select>
          </label>
        </div>
        <label className="text-sm font-medium">
          Proje
          <div className="mt-1">
            <SmartTextarea
              context="hibe"
              value={project}
              onChange={(event) => setProject(event.target.value)}
              placeholder="İş fikrini buraya yaz…"
              maxLength={1500}
              softHint="Daha doğru sonuç için ne yapacağını birkaç kelimeyle daha aç."
              readyHint="✓ İş fikrin analiz için hazır."
            />
          </div>
        </label>
        <Button
          type="submit"
          disabled={pending}
          className="!bg-[var(--safir)] !text-white shadow-md hover:!bg-[var(--safir-deep)] disabled:opacity-70"
        >
          {pending ? "Üretiliyor…" : "Taslak dosyayı üret"}
        </Button>
        {error ? <p className="text-sm text-[var(--rose)]">{error}</p> : null}
        {walletShort ? (
          <a href="/cuzdan" className="inline-flex text-sm font-semibold text-emerald-800">
            Cüzdana bakiye yükle
          </a>
        ) : null}
      </form>
      {report ? (
        <div className="space-y-4">
          <GrantProjectReportView report={report} />
          {docx ? (
            <Button type="button" variant="outline" onClick={downloadDocx}>
              DOCX indir
            </Button>
          ) : null}
          <GrantDetailWizard
            programs={programs}
            pending={pending}
            blocked={false}
            briefReady={briefReady}
            error={error}
            initialGrantId={grantId}
            onSubmit={(details) => void produce(details)}
          />
        </div>
      ) : null}
    </div>
  );
}
