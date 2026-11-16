/**
 * Gelen kutu yanıtı yalnız onaylı ürün kartından kurulur.
 * Fiyat, teslim süresi ve kartta olmayan ölçü yazılmaz.
 */

export type ReplyAttribute = {
  column: string;
  value: string;
};

export type ReplyCard = {
  title: string;
  description: string;
  otherNote: string;
  attributes: readonly ReplyAttribute[];
  approvedStockQty: number;
  criticalStockQty: number;
};

export type ReplyFacts = {
  features: string[];
  measures: string[];
  usage: string[];
  stock: string;
};

const MEASURE = /ölçü|olcu|boyut|ebat|en\b|boy\b|yükseklik|yukseklik|çap|cap/i;
const USAGE = /kullanım|kullanim|talimat|bakım|bakim|yıkama|yikama/i;
const PRICE_WORD = /(?:₺|\btl\b|\btry\b|kuruş|kurus|fiyat)/i;

export function stockFact(approved: number, critical: number): string {
  if (!Number.isInteger(approved) || approved <= 0) {
    return "Onaylı stok yok.";
  }
  if (critical > 0 && approved <= critical) {
    return `Onaylı stok ${approved} adet. Bu miktar kritik eşiğin üstünde değil.`;
  }
  return `Onaylı stok ${approved} adet.`;
}

function clip(value: string): string {
  const trimmed = value.trim().replace(/\s+/g, " ");
  return trimmed.length > 240 ? `${trimmed.slice(0, 237)}...` : trimmed;
}

function scrubPrice(text: string): string {
  const parts = text.split(/(?<=[.!?])\s+/);
  return parts
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !PRICE_WORD.test(part) && !/\d+\s*(?:tl|₺)/i.test(part))
    .join(" ")
    .trim();
}

export function approvedReplyFacts(card: ReplyCard): ReplyFacts {
  const features: string[] = [];
  const measures: string[] = [];
  const usage: string[] = [];
  for (const row of card.attributes) {
    const column = clip(row.column);
    const value = clip(row.value);
    if (!column || !value || PRICE_WORD.test(column) || PRICE_WORD.test(value)) {
      continue;
    }
    const line = `${column}: ${value}`;
    if (features.length < 8) {
      features.push(line);
    }
    if (MEASURE.test(column) || MEASURE.test(value)) {
      measures.push(line);
    }
    if (USAGE.test(column) || USAGE.test(value)) {
      usage.push(line);
    }
  }
  const described = scrubPrice(`${card.description}\n${card.otherNote}`);
  if (described.length >= 2) {
    usage.push(`Kart metni: ${clip(described)}`);
  }
  return {
    features,
    measures,
    usage,
    stock: stockFact(card.approvedStockQty, card.criticalStockQty),
  };
}

export function replyPrompt(card: ReplyCard, message: string): { system: string; user: string } {
  const facts = approvedReplyFacts(card);
  const lines = [
    `Ürün: ${clip(card.title) || "adsız kart"}`,
    facts.features.length > 0 ? `Özellikler: ${facts.features.join(" | ")}` : "Özellik kartta yok.",
    facts.measures.length > 0 ? `Ölçüler: ${facts.measures.join(" | ")}` : "Ölçü kartta yok.",
    facts.usage.length > 0 ? `Kullanım: ${facts.usage.join(" | ")}` : "Kullanım talimatı kartta yok.",
    facts.stock,
    `Müşteri metni: ${clip(message)}`,
  ];
  return {
    system:
      "E-ticaret gelen kutusu için nazik ve kısa yanıt yaz. Yalnızca verilen kart satırlarını kullan. Fiyat, indirim, teslim süresi, kampanya ve kartta olmayan ölçü uydurma. Fiyat sorulursa kartta fiyat olmadığını söyle. En çok dört cümle.",
    user: lines.join("\n"),
  };
}

export function templateReply(card: ReplyCard): string {
  const facts = approvedReplyFacts(card);
  const title = clip(card.title) || "Ürün";
  return [
    `${title} için karttaki kayda göre yazıyorum.`,
    facts.features.length > 0 ? `Özellikler: ${facts.features.join("; ")}.` : "Özellik kartta yazılmamış.",
    facts.measures.length > 0 ? `Ölçüler: ${facts.measures.join("; ")}.` : "Ölçü kartta yazılmamış.",
    facts.usage.length > 0 ? `Kullanım: ${facts.usage.join("; ")}.` : "Kullanım talimatı kartta yazılmamış.",
    facts.stock,
    "Kartta olmayan bir bilgi eklemiyorum.",
  ].join(" ");
}

export function replyStaysOnCard(text: string, card: ReplyCard): boolean {
  const reply = text.trim();
  if (reply.length < 2 || PRICE_WORD.test(reply)) {
    return false;
  }
  const allowed = replyPrompt(card, "").user;
  const numbers = reply.match(/\d+/g) ?? [];
  return numbers.every((token) => allowed.includes(token));
}

export async function composeCardReply(
  card: ReplyCard,
  message: string,
  invoke?: (prompt: { system: string; user: string }) => Promise<string | null>,
): Promise<string> {
  const fallback = templateReply(card).slice(0, 2000);
  if (!invoke) {
    return fallback;
  }
  const prompted = await invoke(replyPrompt(card, message));
  const text = prompted?.trim() ?? "";
  if (!replyStaysOnCard(text, card)) {
    return fallback;
  }
  return text.slice(0, 2000);
}
