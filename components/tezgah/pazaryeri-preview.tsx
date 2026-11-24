"use client";

import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { MasterSkuTransfer } from "@/components/tezgah/master-sku-transfer";
import {
  pazaryeriReklamHandoffHref,
  pazaryeriStudioPhotoHandoffHref,
} from "@/lib/tezgah/pazaryeri/bridges";
import {
  PAZARYERI_DOCX_FILENAME,
  PAZARYERI_FILENAME,
  PAZARYERI_PDF_FILENAME,
} from "@/lib/tezgah/pazaryeri/copy";
import { buildPazaryeriDocx, buildPazaryeriPdf } from "@/lib/tezgah/pazaryeri/document";

function downloadBytes(filename: string, bytes: Uint8Array, mime: string) {
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy.buffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function downloadCsv(filename: string, csv: string) {
  downloadBytes(filename, new TextEncoder().encode(csv), "text/csv;charset=utf-8");
}

function cellAt(columns: readonly string[], row: readonly string[], name: string): string {
  const index = columns.indexOf(name);
  return index < 0 ? "" : (row[index] ?? "").trim();
}

export function PazaryeriPreview({
  columns,
  rows,
  csv,
  signedIn = false,
  market = "",
}: {
  columns: readonly string[];
  rows: readonly (readonly string[])[];
  csv: string;
  signedIn?: boolean;
  market?: string;
}) {
  const firstTitle = cellAt(columns, rows[0] ?? [], "Urun Adi");
  const firstCategory = cellAt(columns, rows[0] ?? [], "Kategori");
  const firstBrand = cellAt(columns, rows[0] ?? [], "Marka");
  const productTitles = rows.map((row) => cellAt(columns, row, "Urun Adi")).filter(Boolean);
  const studioHref = pazaryeriStudioPhotoHandoffHref({
    market,
    productName: firstTitle,
    features: [firstCategory, firstBrand].filter(Boolean).join(" · "),
  });
  const reklamHref = pazaryeriReklamHandoffHref({
    brandOrMarket: firstBrand || market || "Katalog",
    category: firstCategory,
    productTitles,
  });

  return (
    <div data-pazaryeri-preview="">
      <Card title="Katalog" eyebrow="Pazaryeri" variant="featured">
        <p className="text-sm leading-6 text-[var(--muted)]">
          Başlık tavanı kodda kesilir. Barkod boş kalır. Fiyat ve stok yalnız senin girdiğin değerlerdir; LLM
          uydurmaz. Eşleşen pazaryeri kategori yolu taksonomi sözlüğünden gelir.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className="border-b border-[var(--border)] px-2 py-2 font-semibold text-[var(--foreground)]"
                  >
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`urun-${index}`}>
                  {row.map((cell, cellIndex) => (
                    <td
                      key={`${columns[cellIndex] ?? cellIndex}-${index}`}
                      className="border-b border-[var(--border)] px-2 py-2 align-top text-[var(--foreground)]"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden" data-pazaryeri-downloads="">
          <Button type="button" variant="secondary" onClick={() => downloadCsv(PAZARYERI_FILENAME, csv)}>
            {PAZARYERI_FILENAME} indir
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              downloadBytes(
                PAZARYERI_DOCX_FILENAME,
                buildPazaryeriDocx({ columns, rows }),
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              )
            }
            data-pazaryeri-docx=""
          >
            Word (.docx) İndir
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              downloadBytes(PAZARYERI_PDF_FILENAME, buildPazaryeriPdf({ columns, rows }), "application/pdf")
            }
            data-pazaryeri-pdf=""
          >
            PDF İndir
          </Button>
        </div>
        <div
          className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4 print:hidden"
          data-pazaryeri-bridges=""
        >
          <LinkButton href={studioHref as Route} variant="success" size="sm" data-pazaryeri-studio-handoff="">
            Bu Ürünler İçin Görsel Hazırla (studio-photo)
          </LinkButton>
          <LinkButton href={reklamHref} variant="outline" size="sm" data-pazaryeri-reklam-handoff="">
            Bu Katalog İçin Reklam Paketi Oluştur
          </LinkButton>
        </div>
        {signedIn ? <MasterSkuTransfer market={market} columns={columns} rows={rows} /> : null}
      </Card>
    </div>
  );
}
