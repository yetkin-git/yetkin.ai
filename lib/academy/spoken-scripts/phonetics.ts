/**
 * Cue ekran terimi ↔ TTS fonetiği. İstemci güvenli — disk yok.
 * Sıra önemli: uzun biçim önce.
 */

const ACADEMY_CUE_DISPLAY_PHONETICS: readonly { display: string; spoken: string }[] = [
  { display: "developers.facebook.com", spoken: "developers nokta feysbuk nokta kom" },
  { display: "business.facebook.com", spoken: "biznis nokta feysbuk nokta kom" },
  { display: "platform.openai.com", spoken: "platform nokta open ey ay nokta kom" },
  { display: "perplexity.ai", spoken: "perpleksiti nokta ey ay" },
  { display: "chatgpt.com", spoken: "çetcipiti nokta kom" },
  { display: "claude.ai", spoken: "klod nokta ey ay" },
  { display: "voiceflow.com", spoken: "voysflov nokta kom" },
  { display: "botpress.com", spoken: "botpres nokta kom" },
  { display: "Chain-of-Thought", spoken: "Çeyn ov tot" },
  { display: "Critique and Refine", spoken: "kritik and rıfayn" },
  { display: "Pre-Mortem", spoken: "Pri mortem" },
  { display: "Zero-Shot", spoken: "Ziro şat" },
  { display: "Few-Shot", spoken: "Fyu şat" },
  { display: "One-Shot", spoken: "Van şat" },
  { display: "New chat", spoken: "nü çet" },
  { display: "Perplexity", spoken: "Perpleksiti" },
  { display: "Anthropic", spoken: "Antrapik" },
  { display: "Click-to-WhatsApp", spoken: "klik tu Vatsap" },
  { display: "Knowledge Base", spoken: "Nalıc Beyz" },
  { display: "Human Handoff", spoken: "insana devir" },
  { display: "Make.com", spoken: "Meyk nokta kom" },
  { display: "make.com", spoken: "meyk nokta kom" },
  { display: "OpenAI", spoken: "Open ey ay" },
  { display: "Voiceflow", spoken: "Voysflov" },
  { display: "Botpress", spoken: "Botpres" },
  { display: "Guardrails", spoken: "Gardreyls" },
  { display: "Airtable", spoken: "Eyrteybl" },
  { display: "HubSpot", spoken: "Hapsıpat" },
  { display: "Webhooks", spoken: "Vebhuklar" },
  { display: "Webhook", spoken: "Vebhuk" },
  { display: "Fallback", spoken: "Folbek" },
  { display: "Sandbox", spoken: "Sendboks" },
  { display: "Carousel", spoken: "Kerousel" },
  { display: "Bitrix", spoken: "Bitriks" },
  { display: "Office 365", spoken: "Ofis üç yüz altmış beş" },
  { display: "PowerPoint", spoken: "Pauer Point" },
  { display: "Alt+F11", spoken: "Alt Ef on bir" },
  { display: "Sentiment Analysis", spoken: "Sentıment Analisiz" },
  { display: "Closed-Loop", spoken: "Klouzd lup" },
  { display: "ChatGPT", spoken: "Çetcipiti" },
  { display: "Vision", spoken: "Vijın" },
  { display: "SWOT", spoken: "Svot" },
  { display: "WhatsApp", spoken: "Vatsap" },
  { display: "Shopify", spoken: "Şopifay" },
  { display: "Trendyol", spoken: "Trend yol" },
  { display: "Hepsiburada", spoken: "Hepsi burada" },
  { display: "ElevenLabs", spoken: "Ilevın Labs" },
  { display: "Metricool", spoken: "Metrikul" },
  { display: "ManyChat", spoken: "Meniçet" },
  { display: "LinkedIn", spoken: "Linkıdin" },
  { display: "YouTube Shorts", spoken: "Yutub Şorts" },
  { display: "CCaaS", spoken: "Si si ey as" },
  { display: "Midjourney", spoken: "Midcörni" },
  { display: "Discord", spoken: "Diskord" },
  { display: "HeyGen", spoken: "Heycen" },
  { display: "CapCut", spoken: "Kepkat" },
  { display: "Runway", spoken: "Ranvey" },
  { display: "Publer", spoken: "Pabler" },
  { display: "Buffer", spoken: "Bafer" },
  { display: "Kling", spoken: "Kiling" },
  { display: "Flux", spoken: "Flaks" },
  { display: "Reels", spoken: "Rils" },
  { display: "D-ID", spoken: "Di aydi" },
  { display: "DALL-E", spoken: "Dal i" },
  { display: "Instagram", spoken: "İnstegram" },
  { display: "TikTok", spoken: "Tik tok" },
  { display: "Canva", spoken: "Kanva" },
  { display: "Amazon", spoken: "Ama zon" },
  { display: "Buybox", spoken: "Baybaks" },
  { display: "Bundle", spoken: "Bantıl" },
  { display: "Copilot", spoken: "Kopilot" },
  { display: "Gemini", spoken: "Cemini" },
  { display: "Claude", spoken: "Klod" },
  { display: "Insert", spoken: "İnsört" },
  { display: "Gamma", spoken: "Gama" },
  { display: "Teams", spoken: "Tims" },
  { display: "WordPress", spoken: "Vördpres" },
  { display: "Word", spoken: "Vörd" },
  { display: "SEO", spoken: "Es i o" },
  { display: "AIDA", spoken: "Ayda" },
  { display: "CaaS", spoken: "Si ey as" },
  { display: "CTA", spoken: "Si ti a" },
  { display: "CRM", spoken: "Si ar em" },
  { display: "JSON", spoken: "Ceyson" },
  { display: "LLM", spoken: "El el em" },
  { display: "NLU", spoken: "En el yu" },
  { display: "RAG", spoken: "Rag" },
  { display: "SLA", spoken: "Es el ey" },
  { display: "PAS", spoken: "Pas" },
  { display: "H1", spoken: "He bir" },
  { display: "Meta", spoken: "Me ta" },
  { display: "BPA", spoken: "Be pe a" },
  { display: "LED", spoken: "Led" },
  { display: "F2", spoken: "Ef iki" },
  { display: "F5", spoken: "Ef beş" },
  { display: "+90", spoken: "artı doksan" },
];

/** Ekran terimini TTS'in şaşırmayacağı fonetiğe çevirir. */
export function applyAcademyCueDisplayPhonetics(text: string): string {
  let out = text;
  for (const row of ACADEMY_CUE_DISPLAY_PHONETICS) {
    out = out.replaceAll(row.display, row.spoken);
  }
  return out.replace(/(^|[.!?…]\s+)artı doksan/gu, (_full, prefix: string) => `${prefix}Artı doksan`);
}

/**
 * "Ayda" hem AIDA okunuşu hem takvim dilidir.
 * "Ayda kırk saat" / "Ayda otuz dikey" ay kullanımıdır; AIDA'ya çevrilmez.
 */
const AYDA_MONTH_DURATION_AFTER =
  /^\s+(?:\d+|bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on|yirmi|otuz|kırk|elli|altmış|yetmiş|seksen|doksan|yüz|bin)\b/u;

function replaceSpokenAydaWithDisplay(text: string): string {
  return text.replace(/\bAyda\b/gu, (match, offset, full) => {
    const rest = String(full).slice(Number(offset) + match.length);
    if (AYDA_MONTH_DURATION_AFTER.test(rest)) {
      return match;
    }
    return "AIDA";
  });
}

/** TTS fonetiğini teleprompter/cue ekran terimine çevirir. */
export function applyAcademySpokenPhoneticsToDisplay(text: string): string {
  let out = text;
  for (const row of ACADEMY_CUE_DISPLAY_PHONETICS) {
    if (row.display === "+90") {
      out = out.replaceAll("Artı doksan", row.display).replaceAll("artı doksan", row.display);
    } else if (row.display === "AIDA") {
      out = replaceSpokenAydaWithDisplay(out);
    } else {
      out = out.replaceAll(row.spoken, row.display);
    }
  }
  return out;
}
