"use client";

import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import {
  DUKKAN_ECOMMERCE_HREF,
  dukkanReklamHandoffHref,
} from "@/lib/tezgah/dukkan/bridges";
import {
  DUKKAN_FILENAME,
  DUKKAN_ZIP_FILENAME,
  type DukkanSectorId,
} from "@/lib/tezgah/dukkan/copy";
import type { DukkanSealResult } from "@/lib/tezgah/dukkan/render";

const DUKKAN_SANDBOX = "allow-popups allow-popups-to-escape-sandbox allow-forms";

function downloadHtml(filename: string, html: string) {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadZip(filename: string, base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  const blob = new Blob([bytes], { type: "application/zip" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export function DukkanPreview({
  html,
  seals,
  zipBase64,
  zipFilename = DUKKAN_ZIP_FILENAME,
  businessName,
  sector,
  place,
  services,
}: {
  html: string;
  seals: readonly DukkanSealResult[];
  zipBase64: string;
  zipFilename?: string;
  businessName: string;
  sector: DukkanSectorId;
  place: string;
  services: readonly string[];
}) {
  const reklamHref = dukkanReklamHandoffHref({ businessName, sector, place, services });
  const sealLine = seals
    .filter((seal) => seal.passed)
    .map((seal) => `${seal.label} ✓`)
    .join(" • ");

  return (
    <div data-dukkan-preview="">
      <Card title="Dijital dükkan" eyebrow="Yapısal kontrol mühürleri" variant="featured">
        <p className="text-sm leading-6 text-[var(--muted)]" data-dukkan-seals="">
          {sealLine || "Yapısal mühürler doğrulanıyor."}
        </p>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Önizleme iframe içinde durur ve betik çalıştırmaz. Dosyayı https ile yayınla. Düz http adresi
          güvenli adres maddesini düşürür. Sahte hız skoru yoktur.
        </p>
        <iframe
          title="Dijital dükkan önizlemesi"
          className="mt-4 h-[32rem] w-full rounded-xl border border-[var(--border)] bg-white"
          sandbox={DUKKAN_SANDBOX}
          srcDoc={html}
        />
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <Button type="button" variant="secondary" onClick={() => downloadHtml(DUKKAN_FILENAME, html)}>
            {DUKKAN_FILENAME} indir
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadZip(zipFilename, zipBase64)}
            data-dukkan-zip=""
          >
            {zipFilename} indir
          </Button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden" data-dukkan-bridges="">
          <LinkButton href={reklamHref} variant="success" size="sm" data-dukkan-reklam-handoff="">
            Bu Dükkan İçin Reklam Paketi Oluştur
          </LinkButton>
          <LinkButton href={DUKKAN_ECOMMERCE_HREF as Route} variant="outline" size="sm" data-dukkan-ecommerce="">
            E-Ticaret Mağazası Aç
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}
