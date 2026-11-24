import { buildDocxDocument } from "@/lib/yetkinhibe/docx-document";
import type { DocumentBlock } from "@/lib/yetkinhibe/document-block";
import { buildPlainPdf } from "@/lib/yetkinhibe/plain-pdf";
import { parseSealedReklamMarkdown } from "@/lib/tezgah/reklam/guard";
import type { ReklamPackage } from "@/lib/tezgah/reklam/types";

function budgetBlocks(pack: ReklamPackage): DocumentBlock[] {
  const { budget } = pack;
  if (budget.totalBudgetTl == null) {
    return [
      {
        kind: "table",
        headers: ["Kanal", "Pay"],
        rows: [
          ["Soğuk Test", `%${budget.coldTestPct}`],
          ["Yeniden Pazarlama", `%${budget.remarketingPct}`],
          ["Kazanan Ölçekleme", `%${budget.scalePct}`],
        ],
      },
      { kind: "p", text: "Tutar girilmedi; yalnız yüzdesel dağılım gösterilir." },
    ];
  }
  return [
    {
      kind: "table",
      headers: ["Kanal", "Pay", "Tutar"],
      rows: [
        ["Soğuk Test", `%${budget.coldTestPct}`, `${budget.coldTestTl} TL`],
        ["Yeniden Pazarlama", `%${budget.remarketingPct}`, `${budget.remarketingTl} TL`],
        ["Kazanan Ölçekleme", `%${budget.scalePct}`, `${budget.scaleTl} TL`],
        ["Toplam", "%100", `${budget.totalBudgetTl} TL`],
      ],
    },
  ];
}

export function reklamPackageToBlocks(pack: ReklamPackage): DocumentBlock[] {
  const blocks: DocumentBlock[] = [
    { kind: "h1", text: pack.businessName },
    { kind: "p", text: `${pack.place} · ${pack.sectorLabel}` },
    { kind: "h2", text: "Bütçe dağılımı" },
    ...budgetBlocks(pack),
  ];

  for (const variant of pack.variants) {
    blocks.push(
      { kind: "h2", text: variant.heading },
      { kind: "p", text: `Açı: ${variant.angle}` },
      {
        kind: "table",
        headers: ["Alan", "Metin"],
        rows: [
          ["Google Başlık 1", variant.googleHeadlines[0]],
          ["Google Başlık 2", variant.googleHeadlines[1]],
          ["Google Başlık 3", variant.googleHeadlines[2]],
          ["Google Açıklama 1", variant.googleDescriptions[0]],
          ["Google Açıklama 2", variant.googleDescriptions[1]],
          ["Meta Ana Metin", variant.metaPrimary],
          ["Meta Başlık", variant.metaHeadline],
          ["Kadraj", variant.frame],
          ["Görsel üstü yazı", variant.overlay],
          ["Gösterilmeyecek", variant.hidden],
        ],
      },
      { kind: "p", text: `Anahtar kelimeler: ${variant.keywords.join("; ")}` },
      { kind: "p", text: `Negatif anahtar kelimeler: ${variant.negatives.join("; ")}` },
    );
  }

  blocks.push(
    { kind: "h2", text: "Hedef kitle" },
    { kind: "p", text: `Şehir: ${pack.place}` },
    { kind: "p", text: `İlgi alanları: ${pack.interests}` },
    { kind: "h2", text: "Amaç çağrısı" },
    { kind: "p", text: pack.aimCta },
    { kind: "p", text: pack.disclaimer },
  );
  return blocks;
}

export function buildReklamDocx(packOrMarkdown: ReklamPackage | string): Uint8Array {
  const pack = typeof packOrMarkdown === "string" ? parseSealedReklamMarkdown(packOrMarkdown) : packOrMarkdown;
  if (!pack) {
    return buildDocxDocument([{ kind: "p", text: "Reklam paketi okunamadı." }]);
  }
  return buildDocxDocument(reklamPackageToBlocks(pack));
}

export function buildReklamPdf(packOrMarkdown: ReklamPackage | string): Uint8Array {
  const pack = typeof packOrMarkdown === "string" ? parseSealedReklamMarkdown(packOrMarkdown) : packOrMarkdown;
  if (!pack) {
    return buildPlainPdf([{ kind: "p", text: "Reklam paketi okunamadı." }]);
  }
  return buildPlainPdf(reklamPackageToBlocks(pack));
}
