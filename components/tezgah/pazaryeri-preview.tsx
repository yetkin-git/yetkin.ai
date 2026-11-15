"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MasterSkuTransfer } from "@/components/tezgah/master-sku-transfer";
import { PAZARYERI_FILENAME } from "@/lib/tezgah/pazaryeri/copy";

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
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
  return (
    <div data-pazaryeri-preview="">
      <Card title="Katalog" eyebrow="Pazaryeri" variant="featured">
        <p className="text-sm leading-6 text-[var(--muted)]">
          Başlık tavanı kodda kesilir. Barkod, fiyat ve stok hücreleri boş kalır; onları pazaryeri panelinde siz
          doldurursunuz.
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
        <div className="mt-4 print:hidden">
          <Button type="button" variant="secondary" onClick={() => downloadCsv(PAZARYERI_FILENAME, csv)}>
            {PAZARYERI_FILENAME} indir
          </Button>
        </div>
        {signedIn ? <MasterSkuTransfer market={market} columns={columns} rows={rows} /> : null}
      </Card>
    </div>
  );
}
