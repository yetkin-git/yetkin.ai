"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DUKKAN_FILENAME } from "@/lib/tezgah/dukkan/copy";

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

export function DukkanPreview({ html, score }: { html: string; score: number }) {
  return (
    <div data-dukkan-preview="">
      <Card title="Dijital dükkan" eyebrow={`Öz-skor ${score} / 100`} variant="featured">
        <p className="text-sm leading-6 text-[var(--muted)]">
          Önizleme iframe içinde durur ve betik çalıştırmaz. Dosyayı https ile yayınla. Düz http adresi
          güvenli adres maddesini düşürür.
        </p>
        <iframe
          title="Dijital dükkan önizlemesi"
          className="mt-4 h-[32rem] w-full rounded-xl border border-[var(--border)] bg-white"
          sandbox={DUKKAN_SANDBOX}
          srcDoc={html}
        />
        <div className="mt-4 print:hidden">
          <Button type="button" variant="secondary" onClick={() => downloadHtml(DUKKAN_FILENAME, html)}>
            {DUKKAN_FILENAME} indir
          </Button>
        </div>
      </Card>
    </div>
  );
}
