/**
 * Mini SaaS üretici. Çalışır HTML ve React metni yerelde basılır.
 * Ağ çağrısı yalnız üretilen API betiğinin kendi düğmesindedir.
 * F2.7: 8 iş aracı + feature → kod yönlendirme.
 */

import type { SaasPlatformId, SaasWidgetId } from "@/lib/tezgah/pro/options";
import { SAAS_WIDGETS, saasWidgetById } from "@/lib/tezgah/pro/options";
import { escapeHtml, oneLine } from "@/lib/tezgah/pro/text";
import { buildStoreZip, type ZipTextFile } from "@/lib/tezgah/pro/zip";

export const SAAS_ZIP_FILENAME = "mini-saas.zip";
export const SAAS_INSTALL_GUIDE_HEADING = "Nereye ve Nasıl Eklenir? (3 Adımda Kurulum)";
export const SAAS_BUILDER_ARCHIVE_KIND = "saas-builder-v1" as const;
export const SAAS_HTML_FILENAME = "index.html";
export const SAAS_WIDGET_JS_FILENAME = "widget.js";
export const SAAS_REACT_FILENAME = "App.jsx";

export type SaasBuilderInput = {
  widget: SaasWidgetId;
  title: string;
  detail: string;
  feature: string;
  platform: SaasPlatformId;
};

export type SaasBuilderPack = {
  filename: typeof SAAS_ZIP_FILENAME;
  html: string;
  widgetJs: string;
  react: string;
  installGuide: string;
  files: ZipTextFile[];
  zip: Uint8Array;
  summary: string;
  widget: SaasWidgetId;
  feature: string;
  title: string;
  detail: string;
  platform: SaasPlatformId;
};

export type SaasBuilderArchive = {
  kind: typeof SAAS_BUILDER_ARCHIVE_KIND;
  title: string;
  widget: SaasWidgetId;
  platform: SaasPlatformId;
  feature: string;
  detail: string;
  html: string;
  widgetJs: string;
  reactJsx: string;
  guide: string;
  summary: string;
};

const WIDGET_LABELS: Record<SaasWidgetId, string> = {
  cargo: "Kargo & Desi Hesaplayıcı",
  margin: "Kâr Marjı, KDV & Pazaryeri Komisyon Hesaplayıcı",
  quote: "Müşteri Hızlı Fiyat / Paket Hesaplayıcı",
  order: "Sipariş & WhatsApp Ön Talep Formu",
  booking: "Randevu & Ön Görüşme Talep Bileşeni",
  counter: "Kampanya Geri Sayım & Stok Uyarı Şeridi",
  faq: "Etkileşimli SSS & Müşteri Karar Asistanı",
  api: "Canlı JSON / Duyuru Veri Kartı",
};

const PLATFORM_LABELS: Record<SaasPlatformId, string> = {
  html: "Genel HTML / Hazır E-Ticaret",
  wordpress: "WordPress",
  react: "React / Next.js",
};

/** Anahtar kelime → araç. Kullanıcı widget'ı açıkça değiştirmediyse kullanılır. */
const FEATURE_KEYWORD_ROWS: readonly { id: SaasWidgetId; words: readonly string[] }[] = [
  { id: "cargo", words: ["kargo", "desi", "beden", "ölçü", "desi hesab", "paket boyutu"] },
  {
    id: "margin",
    words: ["marj", "kâr", "kar marj", "kdv", "komisyon", "pazaryeri komisyon", "maliyet", "karlılık"],
  },
  {
    id: "quote",
    words: ["fiyat", "teklif", "paket hesap", "fiyatlandır", "ücret hesap", "hızlı fiyat", "paket fiyat"],
  },
  { id: "order", words: ["sipariş", "whatsapp", "ön talep", "sipariş form", "talep form", "whatsapp form"] },
  {
    id: "booking",
    words: ["randevu", "görüşme", "rezervasyon", "ön görüşme", "appointment", "takvim", "randevu form"],
  },
  {
    id: "counter",
    words: ["geri sayım", "sayaç", "kampanya", "stok uyarı", "countdown", "bitiş tarihi", "stok şerit"],
  },
  { id: "faq", words: ["sss", "sıkça", "soru", "asistan", "faq", "karar asistan", "sık sorulan"] },
  { id: "api", words: ["api", "json", "duyuru", "veri kart", "endpoint", "canlı veri", "canlı json"] },
];

export function guessSaasWidgetFromFeature(feature: string): SaasWidgetId {
  const hay = feature.toLocaleLowerCase("tr-TR");
  let best: SaasWidgetId = "cargo";
  let bestScore = 0;
  for (const row of FEATURE_KEYWORD_ROWS) {
    let score = 0;
    for (const word of row.words) {
      if (hay.includes(word)) {
        score += word.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      best = row.id;
    }
  }
  return best;
}

/** Serbest özellik metninden güvenli etiketler (üretilen koda gömülür). */
export function readFeatureTags(feature: string): string[] {
  const parts = feature
    .split(/[,;|/·•]+/)
    .map((part) => oneLine(part, 40))
    .filter((part) => part.length >= 2);
  if (parts.length > 0) {
    return parts.slice(0, 6);
  }
  const whole = oneLine(feature, 60);
  return whole.length >= 2 ? [whole] : [];
}

function installSteps(platform: SaasPlatformId): readonly [string, string, string] {
  if (platform === "wordpress") {
    return [
      "Yönetim panelinde Sayfalar veya Yazılar bölümünü aç. Hedef sayfayı düzenle veya yeni sayfa oluştur.",
      "Özel HTML bloğu veya «HTML» eklentisi ile zip içindeki `index.html` gövdesini (form ve başlık kısmını) sayfaya ekle. `widget.js` içeriğini aynı sayfada ikinci bir HTML bloğunun sonuna `<script>…</script>` olarak yapıştır; child tema veya kod snippet eklentisi kullanman önerilir.",
      "Sayfayı yayınla, önbellek eklentisi varsa temizle ve canlı sayfada bileşenin çalıştığını doğrula.",
    ];
  }
  if (platform === "react") {
    return [
      "Zip içindeki `App.jsx` dosyasını projenin `components/` klasörüne kopyala (Next.js App Router için `app/` veya `components/`).",
      "Hedef sayfa veya düzen dosyasında bileşeni `import` et ve JSX içinde render et. Gerekirse `'use client'` satırını üstte bırak; sayaç ve form etkileşimi istemci tarafındadır.",
      "`npm run dev` ile yerelde test et; ardından `npm run build` ve deploy ile canlıya al.",
    ];
  }
  return [
    "Zip dosyasını indir ve içindeki `index.html` ile `widget.js` dosyalarını aç.",
    "Statik sitede: `index.html` içeriğini sayfana uyarla veya gövde kısmını mevcut şablonuna yapıştır. `widget.js` betiğini sayfa sonunda `<script>` içinde çalıştır. Hazır e-ticaret panellerinde «Özel HTML / kod alanı» varsa aynı iki parçayı sırayla ekle.",
    "Dosyayı sunucuya yükle veya panelde kaydedip önizlemede formun ve sayacın çalıştığını kontrol et.",
  ];
}

export function buildSaasInstallGuide(input: {
  platform: SaasPlatformId;
  widget: SaasWidgetId;
  title: string;
  feature: string;
}): string {
  const [step1, step2, step3] = installSteps(input.platform);
  return [
    `**Altyapı:** ${PLATFORM_LABELS[input.platform]}`,
    `**Bileşen:** ${WIDGET_LABELS[input.widget]}`,
    `**Başlık:** ${input.title}`,
    `**İstenen özellik:** ${input.feature}`,
    "",
    "## Adım 1",
    step1,
    "",
    "## Adım 2",
    step2,
    "",
    "## Adım 3",
    step3,
    "",
    "Paketteki `index.html`, `widget.js` ve `App.jsx` aynı bileşenin farklı taşıma biçimleridir. Önce bu rehbere göre hedef altyapınızı seçin.",
    "",
  ].join("\n");
}

const PAGE_STYLE = [
  "body{font-family:system-ui,sans-serif;margin:24px;color:#142033;background:#fff}",
  "label{display:block;margin-top:12px;font-size:14px}",
  "input,textarea,button,select{font:inherit;margin-top:4px}",
  "input,textarea,select{display:block;width:min(100%,360px);padding:8px;border:1px solid #cbd5e1;border-radius:10px}",
  "button{background:#1d4ed8;color:#fff;border:0;border-radius:10px;padding:8px 14px;cursor:pointer}",
  "#sonuc{margin-top:16px;white-space:pre-wrap}",
  ".feature{margin:8px 0 16px;padding:10px 12px;border-radius:10px;background:#f1f5f9;font-size:13px;line-height:1.45}",
  ".tags{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 12px;padding:0;list-style:none}",
  ".tags li{background:#e2e8f0;border-radius:999px;padding:4px 10px;font-size:12px}",
  ".faq-item{border:1px solid #cbd5e1;border-radius:10px;margin-top:8px;overflow:hidden}",
  ".faq-item button{width:100%;text-align:left;background:#f8fafc;color:#142033;border-radius:0}",
  ".faq-item .cevap{display:none;padding:10px 12px;font-size:14px;background:#fff}",
  ".faq-item.open .cevap{display:block}",
  ".stok-uyari{margin-top:12px;padding:8px 12px;border-radius:10px;background:#fef3c7;color:#92400e;font-size:13px}",
].join("");

function featureBlock(feature: string): string {
  const tags = readFeatureTags(feature);
  const tagList =
    tags.length > 0
      ? `<ul class="tags" data-feature-tags="">${tags.map((tag) => `<li>${escapeHtml(tag)}</li>`).join("")}</ul>`
      : "";
  return [
    `<p class="feature" data-saas-feature="">İstenen özellik: ${escapeHtml(feature)}</p>`,
    tagList,
  ].join("");
}

function featureReactLines(feature: string): string[] {
  const tags = readFeatureTags(feature);
  return [
    `  const feature = ${JSON.stringify(feature)};`,
    `  const tags = ${JSON.stringify(tags)};`,
  ];
}

function page(title: string, body: string, script: string): string {
  return [
    "<!DOCTYPE html>",
    '<html lang="tr">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    `<style>${PAGE_STYLE}</style>`,
    "</head>",
    "<body>",
    body,
    `<script>${script}</script>`,
    "</body>",
    "</html>",
  ].join("");
}

export function readCounterDeadline(raw: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(raw.trim());
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = match[4] ? Number(match[4]) : 0;
  const minute = match[5] ? Number(match[5]) : 0;
  if (month < 1 || month > 12 || day < 1 || day > 31 || hour > 23 || minute > 59) {
    return null;
  }
  const date = new Date(year, month - 1, day, hour, minute, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${year}-${pad(month)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`;
}

export function readApiUrl(raw: string): string | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.href.length > 300) {
    return null;
  }
  return url.href;
}

type WidgetSources = { html: string; react: string; script: string };

function cargoSources(title: string, detail: string, feature: string): WidgetSources {
  const script = [
    `var FEATURE=${JSON.stringify(feature)};`,
    "function desiBand(desi){",
    "if(desi<=1)return 'küçük paket';",
    "if(desi<=5)return 'standart paket';",
    "if(desi<=15)return 'büyük paket';",
    "return 'iri paket';",
    "}",
    "function sizeBand(chest){",
    "if(chest<88)return 'XS';",
    "if(chest<96)return 'S';",
    "if(chest<104)return 'M';",
    "if(chest<112)return 'L';",
    "if(chest<120)return 'XL';",
    "return 'XXL';",
    "}",
    "document.getElementById('hesap').addEventListener('submit',function(event){",
    "event.preventDefault();",
    "var en=Number(document.getElementById('en').value);",
    "var boy=Number(document.getElementById('boy').value);",
    "var yuk=Number(document.getElementById('yuk').value);",
    "var gogus=Number(document.getElementById('gogus').value);",
    "var lines=['Özellik: '+FEATURE];",
    "if(en>0&&boy>0&&yuk>0){",
    "var desi=en*boy*yuk/3000;",
    "lines.push('Desi: '+desi.toFixed(2)+' ('+desiBand(desi)+')');",
    "}",
    "if(gogus>0){",
    "lines.push('Örnek beden: '+sizeBand(gogus)+'. Marka tablosu esastır.');",
    "}",
    "document.getElementById('sonuc').textContent=lines.length>1?lines.join('\\n'):'En az bir ölçü yaz.';",
    "});",
  ].join("");
  const html = page(
    title,
    [
      `<h1>${escapeHtml(title)}</h1>`,
      featureBlock(feature),
      `<p>${escapeHtml(detail)}</p>`,
      `<p>Desi = en × boy × yükseklik / 3000. Beden eşikleri örnektir.</p>`,
      '<form id="hesap">',
      '<label>En cm<input id="en" inputmode="decimal"></label>',
      '<label>Boy cm<input id="boy" inputmode="decimal"></label>',
      '<label>Yükseklik cm<input id="yuk" inputmode="decimal"></label>',
      '<label>Göğüs cm<input id="gogus" inputmode="decimal"></label>',
      '<button type="submit">Hesapla</button>',
      "</form>",
      '<p id="sonuc"></p>',
    ].join(""),
    script,
  );
  const react = [
    "import { useState } from 'react';",
    "export function HesapWidget() {",
    ...featureReactLines(feature),
    "  const [out, setOut] = useState('');",
    "  function onSubmit(event) {",
    "    event.preventDefault();",
    "    const data = new FormData(event.currentTarget);",
    "    const en = Number(data.get('en'));",
    "    const boy = Number(data.get('boy'));",
    "    const yuk = Number(data.get('yuk'));",
    "    const gogus = Number(data.get('gogus'));",
    "    const lines = ['Özellik: ' + feature];",
    "    if (en > 0 && boy > 0 && yuk > 0) {",
    "      const desi = (en * boy * yuk) / 3000;",
    "      lines.push('Desi: ' + desi.toFixed(2));",
    "    }",
    "    if (gogus > 0) lines.push('Örnek beden. Marka tablosu esastır.');",
    "    setOut(lines.length > 1 ? lines.join('\\n') : 'En az bir ölçü yaz.');",
    "  }",
    "  return (",
    "    <form onSubmit={onSubmit}>",
    `      <h1>{${JSON.stringify(title)}}</h1>`,
    "      <p data-saas-feature=\"\">{feature}</p>",
    "      <ul>{tags.map(function (tag) { return <li key={tag}>{tag}</li>; })}</ul>",
    "      <label>En cm<input name=\"en\" /></label>",
    "      <label>Boy cm<input name=\"boy\" /></label>",
    "      <label>Yükseklik cm<input name=\"yuk\" /></label>",
    "      <label>Göğüs cm<input name=\"gogus\" /></label>",
    "      <button type=\"submit\">Hesapla</button>",
    "      <pre>{out}</pre>",
    "    </form>",
    "  );",
    "}",
  ].join("\n");
  return { html, react, script };
}

function marginSources(title: string, detail: string, feature: string): WidgetSources {
  const script = [
    `var FEATURE=${JSON.stringify(feature)};`,
    "document.getElementById('marj').addEventListener('submit',function(event){",
    "event.preventDefault();",
    "var maliyet=Number(document.getElementById('maliyet').value);",
    "var satis=Number(document.getElementById('satis').value);",
    "var kdv=Number(document.getElementById('kdv').value);",
    "var komisyon=Number(document.getElementById('komisyon').value);",
    "if(!(maliyet>0)||!(satis>0)){document.getElementById('sonuc').textContent='Maliyet ve satış fiyatı gerekli.';return;}",
    "var kdvOran=Math.max(0,Math.min(100,kdv||0))/100;",
    "var komOran=Math.max(0,Math.min(100,komisyon||0))/100;",
    "var netSatis=satis/(1+kdvOran);",
    "var komTutari=netSatis*komOran;",
    "var kalan=netSatis-komTutari-maliyet;",
    "var marj=netSatis>0?(kalan/netSatis)*100:0;",
    "document.getElementById('sonuc').textContent=[",
    "'Özellik: '+FEATURE,",
    "'KDV hariç net: '+netSatis.toFixed(2),",
    "'Komisyon: '+komTutari.toFixed(2),",
    "'Kalan: '+kalan.toFixed(2),",
    "'Marj %: '+marj.toFixed(1),",
    "].join('\\n');",
    "});",
  ].join("");
  const html = page(
    title,
    [
      `<h1>${escapeHtml(title)}</h1>`,
      featureBlock(feature),
      `<p>${escapeHtml(detail)}</p>`,
      "<p>KDV ve komisyon oranları yüzde olarak girilir. Fiyat uydurulmaz; senin girdiğin rakamlar hesaplanır.</p>",
      '<form id="marj">',
      '<label>Ürün maliyeti<input id="maliyet" inputmode="decimal"></label>',
      '<label>Satış fiyatı (KDV dahil)<input id="satis" inputmode="decimal"></label>',
      '<label>KDV %<input id="kdv" inputmode="decimal" value="20"></label>',
      '<label>Pazaryeri komisyon %<input id="komisyon" inputmode="decimal" value="15"></label>',
      '<button type="submit">Marjı hesapla</button>',
      "</form>",
      '<p id="sonuc"></p>',
    ].join(""),
    script,
  );
  const react = [
    "import { useState } from 'react';",
    "export function MarjHesap() {",
    ...featureReactLines(feature),
    "  const [out, setOut] = useState('');",
    "  function onSubmit(event) {",
    "    event.preventDefault();",
    "    const data = new FormData(event.currentTarget);",
    "    const maliyet = Number(data.get('maliyet'));",
    "    const satis = Number(data.get('satis'));",
    "    const kdv = Math.max(0, Math.min(100, Number(data.get('kdv')) || 0)) / 100;",
    "    const komisyon = Math.max(0, Math.min(100, Number(data.get('komisyon')) || 0)) / 100;",
    "    if (!(maliyet > 0) || !(satis > 0)) { setOut('Maliyet ve satış fiyatı gerekli.'); return; }",
    "    const netSatis = satis / (1 + kdv);",
    "    const komTutari = netSatis * komisyon;",
    "    const kalan = netSatis - komTutari - maliyet;",
    "    const marj = netSatis > 0 ? (kalan / netSatis) * 100 : 0;",
    "    setOut(['Özellik: ' + feature, 'KDV hariç net: ' + netSatis.toFixed(2), 'Komisyon: ' + komTutari.toFixed(2), 'Kalan: ' + kalan.toFixed(2), 'Marj %: ' + marj.toFixed(1)].join('\\n'));",
    "  }",
    "  return (",
    "    <form onSubmit={onSubmit}>",
    `      <h1>{${JSON.stringify(title)}}</h1>`,
    "      <p data-saas-feature=\"\">{feature}</p>",
    "      <label>Ürün maliyeti<input name=\"maliyet\" /></label>",
    "      <label>Satış fiyatı<input name=\"satis\" /></label>",
    "      <label>KDV %<input name=\"kdv\" defaultValue=\"20\" /></label>",
    "      <label>Komisyon %<input name=\"komisyon\" defaultValue=\"15\" /></label>",
    "      <button type=\"submit\">Marjı hesapla</button>",
    "      <pre>{out}</pre>",
    "    </form>",
    "  );",
    "}",
  ].join("\n");
  return { html, react, script };
}

function quoteSources(title: string, detail: string, feature: string): WidgetSources {
  const script = [
    `var FEATURE=${JSON.stringify(feature)};`,
    "document.getElementById('teklif').addEventListener('submit',function(event){",
    "event.preventDefault();",
    "var paket=document.getElementById('paket').value.trim()||'Paket';",
    "var birim=Number(document.getElementById('birim').value);",
    "var adet=Number(document.getElementById('adet').value);",
    "var indirim=Math.max(0,Math.min(100,Number(document.getElementById('indirim').value)||0));",
    "if(!(birim>0)||!(adet>0)){document.getElementById('sonuc').textContent='Birim fiyat ve adet gerekli.';return;}",
    "var ara=birim*adet;",
    "var dusum=ara*(indirim/100);",
    "var toplam=ara-dusum;",
    "document.getElementById('sonuc').textContent=[",
    "'Özellik: '+FEATURE,",
    "'Paket: '+paket,",
    "'Ara toplam: '+ara.toFixed(2),",
    "'İndirim: '+dusum.toFixed(2)+' (%'+indirim+')',",
    "'Toplam: '+toplam.toFixed(2),",
    "'Bu tutar teklif taslağıdır; fatura/ödeme bu bileşende yok.'",
    "].join('\\n');",
    "});",
  ].join("");
  const html = page(
    title,
    [
      `<h1>${escapeHtml(title)}</h1>`,
      featureBlock(feature),
      `<p>${escapeHtml(detail)}</p>`,
      '<form id="teklif">',
      '<label>Paket adı<input id="paket" maxlength="80"></label>',
      '<label>Birim fiyat<input id="birim" inputmode="decimal"></label>',
      '<label>Adet<input id="adet" inputmode="numeric" value="1"></label>',
      '<label>İndirim %<input id="indirim" inputmode="decimal" value="0"></label>',
      '<button type="submit">Fiyatı hesapla</button>',
      "</form>",
      '<p id="sonuc"></p>',
    ].join(""),
    script,
  );
  const react = [
    "import { useState } from 'react';",
    "export function HizliFiyat() {",
    ...featureReactLines(feature),
    "  const [out, setOut] = useState('');",
    "  function onSubmit(event) {",
    "    event.preventDefault();",
    "    const data = new FormData(event.currentTarget);",
    "    const paket = String(data.get('paket') || '').trim() || 'Paket';",
    "    const birim = Number(data.get('birim'));",
    "    const adet = Number(data.get('adet'));",
    "    const indirim = Math.max(0, Math.min(100, Number(data.get('indirim')) || 0));",
    "    if (!(birim > 0) || !(adet > 0)) { setOut('Birim fiyat ve adet gerekli.'); return; }",
    "    const ara = birim * adet;",
    "    const dusum = ara * (indirim / 100);",
    "    const toplam = ara - dusum;",
    "    setOut(['Özellik: ' + feature, 'Paket: ' + paket, 'Ara toplam: ' + ara.toFixed(2), 'İndirim: ' + dusum.toFixed(2), 'Toplam: ' + toplam.toFixed(2), 'Fatura/ödeme bu bileşende yok.'].join('\\n'));",
    "  }",
    "  return (",
    "    <form onSubmit={onSubmit}>",
    `      <h1>{${JSON.stringify(title)}}</h1>`,
    "      <p data-saas-feature=\"\">{feature}</p>",
    "      <label>Paket adı<input name=\"paket\" /></label>",
    "      <label>Birim fiyat<input name=\"birim\" /></label>",
    "      <label>Adet<input name=\"adet\" defaultValue=\"1\" /></label>",
    "      <label>İndirim %<input name=\"indirim\" defaultValue=\"0\" /></label>",
    "      <button type=\"submit\">Fiyatı hesapla</button>",
    "      <pre>{out}</pre>",
    "    </form>",
    "  );",
    "}",
  ].join("\n");
  return { html, react, script };
}

function orderSources(title: string, detail: string, feature: string): WidgetSources {
  const script = [
    `var FEATURE=${JSON.stringify(feature)};`,
    "document.getElementById('siparis').addEventListener('submit',function(event){",
    "event.preventDefault();",
    "var ad=document.getElementById('ad').value.trim();",
    "var tel=document.getElementById('tel').value.trim();",
    "var not=document.getElementById('not').value.trim();",
    "if(ad.length<2||tel.replace(/\\D/g,'').length<10){",
    "document.getElementById('sonuc').textContent='Ad ve telefon gerekli.';",
    "return;",
    "}",
    "var mesaj='Merhaba, '+ad+' / '+tel+(not?(' / '+not):'')+' — '+FEATURE;",
    "document.getElementById('sonuc').textContent='WhatsApp ön talep metni hazır:\\n'+mesaj+'\\nKanal gönderimi bu sayfada yok; metni kopyalayıp WhatsApp\\'a yapıştır.';",
    "});",
  ].join("");
  const html = page(
    title,
    [
      `<h1>${escapeHtml(title)}</h1>`,
      featureBlock(feature),
      `<p>${escapeHtml(detail)}</p>`,
      '<form id="siparis">',
      '<label>Ad<input id="ad" required></label>',
      '<label>Telefon<input id="tel" required></label>',
      '<label>Not<textarea id="not" rows="3"></textarea></label>',
      '<button type="submit">WhatsApp metnini hazırla</button>',
      "</form>",
      '<p id="sonuc"></p>',
    ].join(""),
    script,
  );
  const react = [
    "import { useState } from 'react';",
    "export function SiparisFormu() {",
    ...featureReactLines(feature),
    "  const [out, setOut] = useState('');",
    "  function onSubmit(event) {",
    "    event.preventDefault();",
    "    const data = new FormData(event.currentTarget);",
    "    const ad = String(data.get('ad') || '').trim();",
    "    const tel = String(data.get('tel') || '').replace(/\\D/g, '');",
    "    const not = String(data.get('not') || '').trim();",
    "    if (ad.length < 2 || tel.length < 10) { setOut('Ad ve telefon gerekli.'); return; }",
    "    setOut('WhatsApp ön talep metni hazır: ' + ad + ' / ' + tel + (not ? (' / ' + not) : '') + ' — ' + feature + '. Kanal gönderimi bu bileşende yok.');",
    "  }",
    "  return (",
    "    <form onSubmit={onSubmit}>",
    `      <h1>{${JSON.stringify(title)}}</h1>`,
    "      <p data-saas-feature=\"\">{feature}</p>",
    "      <label>Ad<input name=\"ad\" required /></label>",
    "      <label>Telefon<input name=\"tel\" required /></label>",
    "      <label>Not<textarea name=\"not\" /></label>",
    "      <button type=\"submit\">WhatsApp metnini hazırla</button>",
    "      <p>{out}</p>",
    "    </form>",
    "  );",
    "}",
  ].join("\n");
  return { html, react, script };
}

function bookingSources(title: string, detail: string, feature: string): WidgetSources {
  const script = [
    `var FEATURE=${JSON.stringify(feature)};`,
    "document.getElementById('randevu').addEventListener('submit',function(event){",
    "event.preventDefault();",
    "var ad=document.getElementById('ad').value.trim();",
    "var tel=document.getElementById('tel').value.trim();",
    "var gun=document.getElementById('gun').value.trim();",
    "var saat=document.getElementById('saat').value.trim();",
    "var not=document.getElementById('not').value.trim();",
    "if(ad.length<2||tel.replace(/\\D/g,'').length<10||!gun){",
    "document.getElementById('sonuc').textContent='Ad, telefon ve tercih edilen gün gerekli.';",
    "return;",
    "}",
    "document.getElementById('sonuc').textContent=['Ön görüşme talebi hazır.','Özellik: '+FEATURE,'Ad: '+ad,'Tel: '+tel,'Gün: '+gun+(saat?(' Saat: '+saat):''),(not?('Not: '+not):''),'Takvim kaydı / onay bu bileşende yok.'].filter(Boolean).join('\\n');",
    "});",
  ].join("");
  const html = page(
    title,
    [
      `<h1>${escapeHtml(title)}</h1>`,
      featureBlock(feature),
      `<p>${escapeHtml(detail)}</p>`,
      '<form id="randevu">',
      '<label>Ad<input id="ad" required></label>',
      '<label>Telefon<input id="tel" required></label>',
      '<label>Tercih edilen gün<input id="gun" type="date" required></label>',
      '<label>Saat aralığı<input id="saat" placeholder="Örn. 14:00-15:00" maxlength="40"></label>',
      '<label>Not<textarea id="not" rows="3"></textarea></label>',
      '<button type="submit">Randevu talebini hazırla</button>',
      "</form>",
      '<p id="sonuc"></p>',
    ].join(""),
    script,
  );
  const react = [
    "import { useState } from 'react';",
    "export function RandevuFormu() {",
    ...featureReactLines(feature),
    "  const [out, setOut] = useState('');",
    "  function onSubmit(event) {",
    "    event.preventDefault();",
    "    const data = new FormData(event.currentTarget);",
    "    const ad = String(data.get('ad') || '').trim();",
    "    const tel = String(data.get('tel') || '').replace(/\\D/g, '');",
    "    const gun = String(data.get('gun') || '').trim();",
    "    if (ad.length < 2 || tel.length < 10 || !gun) { setOut('Ad, telefon ve gün gerekli.'); return; }",
    "    setOut('Ön görüşme talebi hazır. Özellik: ' + feature + '. Takvim kaydı bu bileşende yok.');",
    "  }",
    "  return (",
    "    <form onSubmit={onSubmit}>",
    `      <h1>{${JSON.stringify(title)}}</h1>`,
    "      <p data-saas-feature=\"\">{feature}</p>",
    "      <label>Ad<input name=\"ad\" required /></label>",
    "      <label>Telefon<input name=\"tel\" required /></label>",
    "      <label>Gün<input name=\"gun\" type=\"date\" required /></label>",
    "      <label>Saat<input name=\"saat\" /></label>",
    "      <label>Not<textarea name=\"not\" /></label>",
    "      <button type=\"submit\">Randevu talebini hazırla</button>",
    "      <p>{out}</p>",
    "    </form>",
    "  );",
    "}",
  ].join("\n");
  return { html, react, script };
}

function counterSources(title: string, deadline: string, feature: string): WidgetSources {
  const stamp = JSON.stringify(deadline);
  const script = [
    `var hedef=${stamp};`,
    `var FEATURE=${JSON.stringify(feature)};`,
    "function tick(){",
    "var parca=hedef.split(/[-T:]/);",
    "var bitis=new Date(Number(parca[0]),Number(parca[1])-1,Number(parca[2]),Number(parca[3]),Number(parca[4]),0,0).getTime();",
    "var kalan=bitis-Date.now();",
    "var hedefNokta=document.getElementById('sonuc');",
    "if(kalan<=0){hedefNokta.textContent='Süre doldu. Özellik: '+FEATURE;return;}",
    "var gun=Math.floor(kalan/86400000);",
    "var saat=Math.floor((kalan%86400000)/3600000);",
    "var dakika=Math.floor((kalan%3600000)/60000);",
    "hedefNokta.textContent=gun+' gün '+saat+' saat '+dakika+' dakika';",
    "}",
    "tick();setInterval(tick,1000);",
  ].join("");
  const html = page(
    title,
    [
      `<h1>${escapeHtml(title)}</h1>`,
      featureBlock(feature),
      `<p>Bitiş: ${escapeHtml(deadline)}</p>`,
      `<p class="stok-uyari" data-stock-warn="">Stok / kampanya uyarısı: ${escapeHtml(feature)}</p>`,
      '<p id="sonuc">Sayaç açılıyor</p>',
    ].join(""),
    script,
  );
  const react = [
    "export function KampanyaSayaci() {",
    ...featureReactLines(feature).map((line) => line.replace(/^ {2}/, "  ")),
    "  const [out, setOut] = React.useState('Sayaç açılıyor');",
    "  React.useEffect(function () {",
    `    var parca = ${stamp}.split(/[-T:]/);`,
    "    var bitis = new Date(Number(parca[0]), Number(parca[1]) - 1, Number(parca[2]), Number(parca[3]), Number(parca[4]), 0, 0).getTime();",
    "    function tick() {",
    "      var kalan = bitis - Date.now();",
    "      if (kalan <= 0) { setOut('Süre doldu. Özellik: ' + feature); return; }",
    "      setOut(Math.floor(kalan / 86400000) + ' gün');",
    "    }",
    "    tick();",
    "    var timer = setInterval(tick, 1000);",
    "    return function () { clearInterval(timer); };",
    "  }, [feature]);",
    "  return React.createElement('div', null,",
    `    React.createElement('h1', null, ${JSON.stringify(title)}),`,
    "    React.createElement('p', { 'data-saas-feature': '' }, feature),",
    "    React.createElement('p', { className: 'stok-uyari' }, 'Stok / kampanya uyarısı: ' + feature),",
    "    React.createElement('p', null, out)",
    "  );",
    "}",
  ].join("\n");
  return { html, react, script };
}

function faqSources(title: string, detail: string, feature: string): WidgetSources {
  const tags = readFeatureTags(feature);
  const items =
    tags.length > 0
      ? tags.map((tag, index) => ({
          q: `${tag} hakkında ne bilmeliyim?`,
          a: `${detail || title}: ${tag} için kısa yanıt. Karar asistanı önerisi — senin yazdığın özellik: ${feature}.`,
          id: `faq-${index + 1}`,
        }))
      : [
          {
            q: "Bu bileşen ne işe yarar?",
            a: `${detail || title}. İstenen özellik: ${feature}.`,
            id: "faq-1",
          },
          {
            q: "Nasıl karar verebilirim?",
            a: "Aşağıdaki seçenekleri oku; ihtiyacına uyan maddeyi aç. Canlı operatör / ödeme bu bileşende yok.",
            id: "faq-2",
          },
        ];
  const itemsJson = JSON.stringify(
    items.map((item) => ({
      id: item.id,
      q: item.q,
      a: item.a,
    })),
  );
  const script = [
    `var FEATURE=${JSON.stringify(feature)};`,
    `var ITEMS=${itemsJson};`,
    "var kutu=document.getElementById('sss');",
    "ITEMS.forEach(function(item){",
    "var wrap=document.createElement('div');",
    "wrap.className='faq-item';",
    "wrap.setAttribute('data-faq-id',item.id);",
    "var btn=document.createElement('button');",
    "btn.type='button';",
    "btn.textContent=item.q;",
    "var cevap=document.createElement('div');",
    "cevap.className='cevap';",
    "cevap.textContent=item.a;",
    "btn.addEventListener('click',function(){wrap.classList.toggle('open');});",
    "wrap.appendChild(btn);",
    "wrap.appendChild(cevap);",
    "kutu.appendChild(wrap);",
    "});",
    "document.getElementById('karar').addEventListener('click',function(){",
    "document.getElementById('sonuc').textContent='Karar asistanı: «'+FEATURE+'» ihtiyacına göre SSS maddelerini aç. Ödeme / randevu bu bileşende yok.';",
    "});",
  ].join("");
  const listHtml = ""; // filled by script for XSS safety with textContent
  const html = page(
    title,
    [
      `<h1>${escapeHtml(title)}</h1>`,
      featureBlock(feature),
      `<p>${escapeHtml(detail)}</p>`,
      `<div id="sss">${listHtml}</div>`,
      '<button id="karar" type="button">Karar asistanı özeti</button>',
      '<p id="sonuc"></p>',
    ].join(""),
    script,
  );
  const react = [
    "import { useState } from 'react';",
    "export function SssAsistan() {",
    ...featureReactLines(feature),
    `  const items = ${itemsJson};`,
    "  const [openId, setOpenId] = useState('');",
    "  const [out, setOut] = useState('');",
    "  return (",
    "    <div>",
    `      <h1>{${JSON.stringify(title)}}</h1>`,
    "      <p data-saas-feature=\"\">{feature}</p>",
    "      {items.map(function (item) {",
    "        return (",
    "          <div key={item.id} className={openId === item.id ? 'faq-item open' : 'faq-item'}>",
    "            <button type=\"button\" onClick={function () { setOpenId(openId === item.id ? '' : item.id); }}>{item.q}</button>",
    "            {openId === item.id ? <div className=\"cevap\">{item.a}</div> : null}",
    "          </div>",
    "        );",
    "      })}",
    "      <button type=\"button\" onClick={function () { setOut('Karar asistanı: «' + feature + '». Ödeme / randevu bu bileşende yok.'); }}>Karar asistanı özeti</button>",
    "      <p>{out}</p>",
    "    </div>",
    "  );",
    "}",
  ].join("\n");
  return { html, react, script };
}

function apiSources(title: string, url: string, feature: string): WidgetSources {
  const href = JSON.stringify(url);
  const script = [
    `var adres=${href};`,
    `var FEATURE=${JSON.stringify(feature)};`,
    "document.getElementById('oku').addEventListener('click',function(){",
    "var hedef=document.getElementById('sonuc');",
    "hedef.textContent='Okunuyor — '+FEATURE;",
    "fetch(adres,{headers:{accept:'application/json'}}).then(function(response){",
    "if(!response.ok)throw new Error('okunamadı');",
    "return response.json();",
    "}).then(function(data){",
    "hedef.textContent=JSON.stringify(data).slice(0,500);",
    "}).catch(function(){hedef.textContent='Yanıt okunamadı.';});",
    "});",
  ].join("");
  const html = page(
    title,
    [
      `<h1>${escapeHtml(title)}</h1>`,
      featureBlock(feature),
      `<p>Adres: ${escapeHtml(url)}</p>`,
      "<p>Anahtar bu sayfaya yazılmaz. Sır sunucuda kalır.</p>",
      '<button id="oku" type="button">JSON / duyuru oku</button>',
      '<p id="sonuc"></p>',
    ].join(""),
    script,
  );
  const react = [
    "export function ApiOkuyucu() {",
    ...featureReactLines(feature).map((line) => line.replace(/^ {2}/, "  ")),
    "  const [out, setOut] = React.useState('');",
    "  async function onClick() {",
    "    setOut('Okunuyor — ' + feature);",
    "    try {",
    `      const response = await fetch(${href}, { headers: { accept: 'application/json' } });`,
    "      if (!response.ok) throw new Error('okunamadı');",
    "      const data = await response.json();",
    "      setOut(JSON.stringify(data).slice(0, 500));",
    "    } catch (error) { setOut('Yanıt okunamadı.'); }",
    "  }",
    `  return React.createElement('div', null, React.createElement('h1', null, ${JSON.stringify(title)}), React.createElement('p', { 'data-saas-feature': '' }, feature), React.createElement('button', { type: 'button', onClick }, 'JSON / duyuru oku'), React.createElement('pre', null, out));`,
    "}",
  ].join("\n");
  return { html, react, script };
}

function resolveSources(input: {
  widget: SaasWidgetId;
  title: string;
  detail: string;
  feature: string;
}): WidgetSources | null {
  if (input.widget === "cargo") {
    return cargoSources(input.title, input.detail, input.feature);
  }
  if (input.widget === "margin") {
    return marginSources(input.title, input.detail, input.feature);
  }
  if (input.widget === "quote") {
    return quoteSources(input.title, input.detail, input.feature);
  }
  if (input.widget === "order") {
    return orderSources(input.title, input.detail, input.feature);
  }
  if (input.widget === "booking") {
    return bookingSources(input.title, input.detail, input.feature);
  }
  if (input.widget === "counter") {
    const deadline = readCounterDeadline(input.detail);
    if (!deadline) {
      return null;
    }
    return counterSources(input.title, deadline, input.feature);
  }
  if (input.widget === "faq") {
    return faqSources(input.title, input.detail, input.feature);
  }
  const url = readApiUrl(input.detail);
  if (!url) {
    return null;
  }
  return apiSources(input.title, url, input.feature);
}

export function resolveSaasWidgetId(raw: string, feature: string): SaasWidgetId | null {
  if (saasWidgetById(raw)) {
    return raw as SaasWidgetId;
  }
  if (feature.trim().length >= 2) {
    return guessSaasWidgetFromFeature(feature);
  }
  return null;
}

export function buildSaasWidget(input: SaasBuilderInput): SaasBuilderPack | null {
  const title = oneLine(input.title, 80);
  const detail = oneLine(input.detail, 300);
  const feature = oneLine(input.feature, 300);
  if (title.length < 2 || detail.length < 2 || feature.length < 2) {
    return null;
  }
  if (!SAAS_WIDGETS.some((row) => row.value === input.widget)) {
    return null;
  }
  const sources = resolveSources({ widget: input.widget, title, detail, feature });
  if (!sources || sources.html.includes("<script src") || sources.html.length > 20000) {
    return null;
  }
  const installGuide = buildSaasInstallGuide({
    platform: input.platform,
    widget: input.widget,
    title,
    feature,
  });
  const files: ZipTextFile[] = [
    { name: SAAS_HTML_FILENAME, text: sources.html },
    { name: SAAS_WIDGET_JS_FILENAME, text: sources.script },
    { name: SAAS_REACT_FILENAME, text: sources.react },
    { name: "KURULUM_REHBERI.md", text: `# ${SAAS_INSTALL_GUIDE_HEADING}\n\n${installGuide}` },
    {
      name: "README.txt",
      text: "Bu paket index.html dosyasıyla tarayıcıda açılır. App.jsx aynı bileşenin React karşılığıdır. Kurulum için KURULUM_REHBERI.md dosyasını okuyun. Fiyat yazılmaz.\n",
    },
  ];
  return {
    filename: SAAS_ZIP_FILENAME,
    html: sources.html,
    widgetJs: sources.script,
    react: sources.react,
    installGuide,
    files,
    zip: buildStoreZip(files),
    summary: `Mini SaaS: ${title}. ${SAAS_ZIP_FILENAME} hazır.`,
    widget: input.widget,
    feature,
    title,
    detail,
    platform: input.platform,
  };
}

export function encodeSaasBuilderArchive(pack: SaasBuilderPack): string {
  const archive: SaasBuilderArchive = {
    kind: SAAS_BUILDER_ARCHIVE_KIND,
    title: pack.title,
    widget: pack.widget,
    platform: pack.platform,
    feature: pack.feature,
    detail: pack.detail,
    html: pack.html,
    widgetJs: pack.widgetJs,
    reactJsx: pack.react,
    guide: pack.installGuide,
    summary: pack.summary,
  };
  return JSON.stringify(archive);
}

export function parseSaasBuilderArchive(raw: string): SaasBuilderArchive | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{")) {
    return null;
  }
  try {
    const parsed = JSON.parse(trimmed) as Partial<SaasBuilderArchive>;
    if (parsed.kind !== SAAS_BUILDER_ARCHIVE_KIND) {
      return null;
    }
    if (
      typeof parsed.html !== "string" ||
      typeof parsed.widgetJs !== "string" ||
      typeof parsed.reactJsx !== "string" ||
      typeof parsed.guide !== "string" ||
      typeof parsed.title !== "string" ||
      typeof parsed.feature !== "string" ||
      !saasWidgetById(String(parsed.widget ?? ""))
    ) {
      return null;
    }
    return parsed as SaasBuilderArchive;
  } catch {
    return null;
  }
}

export function archiveToSaasZip(archive: SaasBuilderArchive): Uint8Array {
  return buildStoreZip([
    { name: SAAS_HTML_FILENAME, text: archive.html },
    { name: SAAS_WIDGET_JS_FILENAME, text: archive.widgetJs },
    { name: SAAS_REACT_FILENAME, text: archive.reactJsx },
    {
      name: "KURULUM_REHBERI.md",
      text: `# ${SAAS_INSTALL_GUIDE_HEADING}\n\n${archive.guide}`,
    },
    {
      name: "README.txt",
      text: "Bu paket index.html dosyasıyla tarayıcıda açılır. App.jsx aynı bileşenin React karşılığıdır. Kurulum için KURULUM_REHBERI.md dosyasını okuyun. Fiyat yazılmaz.\n",
    },
  ]);
}
