import { DUKKAN_CTA_LABEL, dukkanSectorById, dukkanToneById } from "@/lib/tezgah/dukkan/copy";
import { escapeHtml } from "@/lib/tezgah/dukkan/escape";
import type { DukkanDraft } from "@/lib/tezgah/dukkan/schema";
import { TETKIK_HTML_BUDGET_BYTES } from "@/lib/tezgah/tetkik/rubric";
import { scoreHomepageHtml } from "@/lib/tezgah/tetkik/score";

const HEX = /^#[0-9a-f]{6}$/i;

/**
 * Başlık ve açıklama düz metinde pencereye kilitlenir.
 * Kaçış bundan sonra uygulanır; skor aynı boyu görür.
 * Sığmayan ad, dolgu cümlesine düşer. Ham ad yapıştırılmaz.
 */
export function fitPlainWindow(lead: string, filler: string, min: number, max: number): string {
  const safeLead = lead.replace(/[^\p{L}\p{N}\s.,'-]/gu, " ").replace(/\s+/g, " ").trim();
  const base = filler.replace(/\s+/g, " ").trim();
  if (base.length < min || base.length > max) {
    throw new Error("Dükkan dolgu cümlesi pencere dışında.");
  }
  if (!safeLead) {
    return base;
  }
  const joined = `${safeLead}. ${base}`;
  if (joined.length >= min && joined.length <= max) {
    return joined;
  }
  return base;
}

export function dukkanHtmlBytes(html: string): number {
  return new TextEncoder().encode(html).length;
}

/** 100 puan, 500 KB altı, betik ve olay özniteliği yok. */
export function inspectDukkanDelivery(html: string): { ok: true; htmlBytes: number } | { ok: false } {
  const htmlBytes = dukkanHtmlBytes(html);
  if (htmlBytes <= 0 || htmlBytes >= TETKIK_HTML_BUDGET_BYTES) {
    return { ok: false };
  }
  if (/<script/i.test(html) || /javascript\s*:/i.test(html) || /<[^>]*\son[a-z0-9]+\s*=/i.test(html)) {
    return { ok: false };
  }
  const scored = scoreHomepageHtml(html, { https: true, ttfbMs: 1, htmlBytes });
  if (scored.score !== 100) {
    return { ok: false };
  }
  return { ok: true, htmlBytes };
}

function hex(value: string): string {
  if (!HEX.test(value)) {
    throw new Error("Dükkan rengi mühürlü değil.");
  }
  return value;
}

function text(value: string): string {
  return escapeHtml(value);
}

export function renderDukkanHtml(draft: DukkanDraft): string {
  if (!/^905\d{9}$/.test(draft.whatsapp)) {
    throw new Error("Dükkan numarası mühürlü değil.");
  }
  if (draft.services.length < 3 || draft.services.length > 5) {
    throw new Error("Dükkan hizmet listesi mühürlü değil.");
  }
  const sector = dukkanSectorById(draft.sector);
  const tone = dukkanToneById(draft.tone);
  const phone = draft.whatsapp;
  const title = fitPlainWindow(draft.businessName, sector.title, 10, 60);
  const description = fitPlainWindow(`${draft.businessName}, ${draft.place}`, sector.description, 50, 160);
  const cta = DUKKAN_CTA_LABEL[sector.cta];
  const services = draft.services.map((service) => `<li>${text(service)}</li>`).join("");
  const message = text(`Merhaba, ${draft.businessName} için yazıyorum.`);

  return `<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${text(title)}</title>
<meta name="description" content="${text(description)}">
<style>
:root{--paper:${hex(tone.paper)};--ink:${hex(tone.ink)};--accent:${hex(tone.accent)};--accent-ink:${hex(tone.accentInk)};--line:${hex(tone.line)}}
*{box-sizing:border-box}
body{margin:0;font-family:"Segoe UI",system-ui,sans-serif;background:var(--paper);color:var(--ink);line-height:1.5}
main{max-width:40rem;margin:0 auto;padding:1.5rem 1.25rem 6.5rem}
.mark{width:3rem;height:3rem;color:var(--accent)}
.kicker{margin:0.75rem 0 0;font-size:0.8rem;letter-spacing:0.08em;text-transform:uppercase}
.place{margin:0.25rem 0 0}
h1{margin:0.35rem 0 0;font-size:2rem;line-height:1.15}
.lead{margin:0.75rem 0 0;font-size:1.05rem}
.actions{display:flex;flex-wrap:wrap;gap:0.5rem;margin:1rem 0 0}
a.cta,button{display:inline-block;background:var(--accent);color:var(--accent-ink);text-decoration:none;border:0;border-radius:999px;padding:0.7rem 1rem;font:inherit;font-weight:700;cursor:pointer}
h2{margin:2rem 0 0.75rem;font-size:1.25rem}
ul{list-style:none;padding:0;margin:0;display:grid;gap:0.5rem}
li{padding:0.75rem 0.9rem;border:1px solid var(--line);border-radius:0.75rem}
p{margin:0.5rem 0 0}
form{display:grid;gap:0.6rem;margin-top:0.75rem}
textarea{width:100%;min-height:6rem;padding:0.7rem;border:1px solid var(--line);border-radius:0.75rem;background:var(--paper);color:var(--ink);font:inherit}
.dock{position:fixed;left:0;right:0;bottom:0;display:flex;gap:0.5rem;padding:0.75rem 1rem;background:var(--paper);border-top:1px solid var(--line)}
</style>
</head>
<body>
<main>
<svg class="mark" viewBox="0 0 64 64" aria-hidden="true">
<rect width="64" height="64" rx="14" fill="currentColor"></rect>
<circle cx="32" cy="28" r="8" fill="none" stroke="${hex(tone.accentInk)}" stroke-width="3"></circle>
<path d="M32 40v10" stroke="${hex(tone.accentInk)}" stroke-width="3"></path>
</svg>
<p class="kicker">${text(sector.label)}</p>
<p class="place">${text(draft.place)}</p>
<h1>${text(draft.businessName)}</h1>
<p class="lead">${text(sector.lead)}</p>
<p class="actions">
<a class="cta" href="https://wa.me/${phone}" target="_blank" rel="noopener">WhatsApp</a>
<a class="cta" href="tel:+${phone}">Hemen ara</a>
<a class="cta" href="https://wa.me/${phone}" target="_blank" rel="noopener">${text(cta)}</a>
</p>
<h2>Hizmetler</h2>
<ul>${services}</ul>
<h2>${text(sector.heading)}</h2>
<p>${text(sector.body)}</p>
<p>${text(sector.hours)}</p>
<h2>İletişim</h2>
<form method="get" action="https://api.whatsapp.com/send" target="_blank">
<input type="hidden" name="phone" value="${phone}">
<label>Mesaj
<textarea name="text" maxlength="400">${message}</textarea>
</label>
<button type="submit">Mesaj gönder</button>
</form>
</main>
<nav class="dock">
<a class="cta" href="https://wa.me/${phone}" target="_blank" rel="noopener">WhatsApp</a>
<a class="cta" href="tel:+${phone}">Hemen ara</a>
</nav>
</body>
</html>`;
}
