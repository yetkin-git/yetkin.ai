"use client";

import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import type { DukkanSectorId } from "@/lib/tezgah/dukkan/copy";
import {
  reklamDukkanHandoffHref,
  reklamStudioPhotoHandoffHref,
} from "@/lib/tezgah/reklam/bridges";
import {
  REKLAM_FILE_STEM,
  REKLAM_GOOGLE_CSV_FILENAME,
  REKLAM_META_CSV_FILENAME,
} from "@/lib/tezgah/reklam/copy";
import { buildGoogleAdsCsv, buildMetaAdsCsv } from "@/lib/tezgah/reklam/csv";
import { buildReklamDocx, buildReklamPdf } from "@/lib/tezgah/reklam/document";
import { parseSealedReklamMarkdown } from "@/lib/tezgah/reklam/guard";

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

function downloadText(filename: string, text: string, mime: string) {
  downloadBytes(filename, new TextEncoder().encode(text), mime);
}

function Deliverable({ markdown }: { markdown: string }) {
  return (
    <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap rounded-xl bg-[var(--surface-muted)] p-4 text-sm leading-6 text-[var(--foreground)]">
      {markdown}
    </pre>
  );
}

export function ReklamPreview({
  markdown,
  googleCsv,
  metaCsv,
  businessName,
  sector,
  place,
  offer,
  onCopy,
  copied,
}: {
  markdown: string;
  googleCsv: string;
  metaCsv: string;
  businessName: string;
  sector: DukkanSectorId;
  place: string;
  offer: string;
  onCopy: () => void;
  copied: boolean;
}) {
  const pack = parseSealedReklamMarkdown(markdown);
  const creativeBrief =
    pack?.variants[0]
      ? `Kadraj: ${pack.variants[0].frame} | Görsel üstü yazı: ${pack.variants[0].overlay} | Gösterilmeyecek: ${pack.variants[0].hidden}`
      : offer;
  const dukkanHref = reklamDukkanHandoffHref({ businessName, sector, place, offer });
  const studioHref = reklamStudioPhotoHandoffHref({ businessName, creativeBrief });

  const resolvedGoogleCsv = googleCsv || (pack ? buildGoogleAdsCsv(pack) : "");
  const resolvedMetaCsv = metaCsv || (pack ? buildMetaAdsCsv(pack) : "");

  return (
    <div data-reklam-preview="">
      <Card title="Reklam paketi" eyebrow="A/B kampanya matrisi" variant="featured">
        <Deliverable markdown={markdown} />
        <div className="mt-5 flex flex-wrap gap-2 print:hidden" data-reklam-downloads="">
          <Button type="button" variant="secondary" onClick={onCopy}>
            {copied ? "Kopyalandı" : "Tek Tıkla Kopyala"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadText(`${REKLAM_FILE_STEM}.md`, markdown, "text/markdown")}
          >
            .md İndir
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => downloadText(`${REKLAM_FILE_STEM}.txt`, markdown, "text/plain")}
          >
            .txt İndir
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!resolvedGoogleCsv}
            onClick={() =>
              downloadText(REKLAM_GOOGLE_CSV_FILENAME, resolvedGoogleCsv, "text/csv;charset=utf-8")
            }
            data-reklam-google-csv=""
          >
            Google Ads CSV İndir
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={!resolvedMetaCsv}
            onClick={() => downloadText(REKLAM_META_CSV_FILENAME, resolvedMetaCsv, "text/csv;charset=utf-8")}
            data-reklam-meta-csv=""
          >
            Meta Ads CSV İndir
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              downloadBytes(
                `${REKLAM_FILE_STEM}.docx`,
                buildReklamDocx(pack ?? markdown),
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              )
            }
            data-reklam-docx=""
          >
            Word (.docx) İndir
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              downloadBytes(`${REKLAM_FILE_STEM}.pdf`, buildReklamPdf(pack ?? markdown), "application/pdf")
            }
            data-reklam-pdf=""
          >
            PDF İndir
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 border-t border-[var(--border)] pt-4 print:hidden" data-reklam-bridges="">
          <LinkButton href={dukkanHref} variant="success" size="sm" data-reklam-dukkan-handoff="">
            Bu Kampanya İçin Dijital Dükkan Kur
          </LinkButton>
          <LinkButton href={studioHref as Route} variant="outline" size="sm" data-reklam-studio-handoff="">
            Reklam Görseli Hazırla (studio-photo)
          </LinkButton>
        </div>
      </Card>
    </div>
  );
}
