import { buildStoreZip } from "@/lib/tezgah/pro/zip";
import type { DocumentBlock } from "@/lib/yetkinhibe/document-block";

const W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
const R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function paragraph(text: string, style: "Heading1" | "Heading2" | "Normal", bold = false): string {
  const lines = text.split(/\r?\n/);
  return lines
    .map((line) => {
      const run = bold ? `<w:r><w:rPr><w:b/></w:rPr><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r>` : `<w:r><w:t xml:space="preserve">${escapeXml(line)}</w:t></w:r>`;
      return `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr>${run}</w:p>`;
    })
    .join("");
}

const BORDER = `<w:top w:val="single" w:sz="4" w:space="0" w:color="666666"/><w:left w:val="single" w:sz="4" w:space="0" w:color="666666"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="666666"/><w:right w:val="single" w:sz="4" w:space="0" w:color="666666"/><w:insideH w:val="single" w:sz="4" w:space="0" w:color="666666"/><w:insideV w:val="single" w:sz="4" w:space="0" w:color="666666"/>`;
const CELL_BORDER = `<w:top w:val="single" w:sz="4" w:space="0" w:color="666666"/><w:left w:val="single" w:sz="4" w:space="0" w:color="666666"/><w:bottom w:val="single" w:sz="4" w:space="0" w:color="666666"/><w:right w:val="single" w:sz="4" w:space="0" w:color="666666"/>`;

function cell(text: string, header: boolean): string {
  const body = paragraph(text.length > 0 ? text : "—", "Normal", header);
  return `<w:tc><w:tcPr><w:tcBorders>${CELL_BORDER}</w:tcBorders></w:tcPr>${body}</w:tc>`;
}

function table(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const width = Math.max(headers.length, 1);
  const head = `<w:tr>${headers.map((header) => cell(header, true)).join("")}</w:tr>`;
  const body = rows
    .map((row) => {
      const cells = Array.from({ length: width }, (_, index) => cell(row[index] ?? "", false));
      return `<w:tr>${cells.join("")}</w:tr>`;
    })
    .join("");
  return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblBorders>${BORDER}</w:tblBorders></w:tblPr>${head}${body}</w:tbl>`;
}

function contents(blocks: readonly DocumentBlock[]): string {
  const titles: string[] = [];
  for (const block of blocks) {
    if (block.kind === "h1" || block.kind === "h2") {
      titles.push(block.text);
    }
  }
  if (titles.length < 2) {
    return "";
  }
  return `${paragraph("İçindekiler", "Heading2")}${titles.map((title) => paragraph(title, "Normal")).join("")}`;
}

function blockXml(block: DocumentBlock): string {
  if (block.kind === "table") {
    return table(block.headers, block.rows);
  }
  if (block.kind === "h1") {
    return paragraph(block.text, "Heading1");
  }
  if (block.kind === "h2") {
    return paragraph(block.text, "Heading2");
  }
  return paragraph(block.text, "Normal");
}

/** Başlık stilli, kenar boşluklu, tablolu DOCX. */
export function buildDocxDocument(blocks: readonly DocumentBlock[]): Uint8Array {
  const bodyBlocks = blocks.filter((block) => block.kind !== "p" || block.text.trim().length > 0);
  const firstHeading = bodyBlocks.findIndex((block) => block.kind === "h1");
  const xmlBlocks = bodyBlocks.map(blockXml);
  if (firstHeading >= 0) {
    xmlBlocks.splice(firstHeading + 1, 0, contents(bodyBlocks));
  }
  const document = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="${W}" xmlns:r="${R}"><w:body>${xmlBlocks.join("")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="567" w:footer="567" w:gutter="0"/><w:footerReference w:type="default" r:id="rIdFooter"/></w:sectPr></w:body></w:document>`;
  const styles = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="${W}"><w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:rPr><w:sz w:val="22"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:uiPriority w:val="9"/><w:qFormat/><w:pPr><w:outlineLvl w:val="0"/><w:spacing w:before="360" w:after="160"/></w:pPr><w:rPr><w:b/><w:sz w:val="32"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:uiPriority w:val="9"/><w:qFormat/><w:pPr><w:outlineLvl w:val="1"/><w:spacing w:before="280" w:after="80"/></w:pPr><w:rPr><w:b/><w:sz w:val="26"/></w:rPr></w:style></w:styles>`;
  const footer = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:ftr xmlns:w="${W}"><w:p><w:r><w:t xml:space="preserve">Sayfa </w:t></w:r><w:r><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:instrText xml:space="preserve"> PAGE </w:instrText></w:r><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p></w:ftr>`;
  return buildStoreZip([
    {
      name: "[Content_Types].xml",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/word/footer.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>`,
    },
    {
      name: "_rels/.rels",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>`,
    },
    {
      name: "word/_rels/document.xml.rels",
      text: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rIdFooter" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer.xml"/></Relationships>`,
    },
    { name: "word/styles.xml", text: styles },
    { name: "word/footer.xml", text: footer },
    { name: "word/document.xml", text: document },
  ]);
}
