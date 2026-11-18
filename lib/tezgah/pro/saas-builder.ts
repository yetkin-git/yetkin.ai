/**
 * Mini SaaS üretici. Çalışır HTML ve React metni yerelde basılır.
 * Ağ çağrısı yalnız üretilen API betiğinin kendi düğmesindedir.
 */

import type { SaasPlatformId, SaasWidgetId } from "@/lib/tezgah/pro/options";
import { escapeHtml, oneLine } from "@/lib/tezgah/pro/text";
import { buildStoreZip, type ZipTextFile } from "@/lib/tezgah/pro/zip";

export const SAAS_ZIP_FILENAME = "mini-saas.zip";
export const SAAS_INSTALL_GUIDE_HEADING = "Nereye ve Nasıl Eklenir? (3 Adımda Kurulum)";

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
  react: string;
  installGuide: string;
  files: ZipTextFile[];
  zip: Uint8Array;
  summary: string;
};

const WIDGET_LABELS: Record<SaasWidgetId, string> = {
  cargo: "Kargo desi ve beden hesabı",
  order: "Özel sipariş formu",
  counter: "Kampanya sayacı",
  api: "API entegrasyon betiği",
};

const PLATFORM_LABELS: Record<SaasPlatformId, string> = {
  html: "Genel HTML / Hazır E-Ticaret",
  wordpress: "WordPress",
  react: "React / Next.js",
};

function installSteps(platform: SaasPlatformId): readonly [string, string, string] {
  if (platform === "wordpress") {
    return [
      "Yönetim panelinde Sayfalar veya Yazılar bölümünü açın. Hedef sayfayı düzenleyin veya yeni sayfa oluşturun.",
      "Özel HTML bloğu veya «HTML» eklentisi ile zip içindeki `index.html` gövdesini (form ve başlık kısmını) sayfaya ekleyin. `widget.js` içeriğini aynı sayfada ikinci bir HTML bloğunun sonuna `<script>…</script>` olarak yapıştırın; child tema veya kod snippet eklentisi kullanmanız önerilir.",
      "Sayfayı yayınlayın, önbellek eklentisi varsa temizleyin ve canlı sayfada bileşenin çalıştığını doğrulayın.",
    ];
  }
  if (platform === "react") {
    return [
      "Zip içindeki `App.jsx` dosyasını projenizin `components/` klasörüne kopyalayın (Next.js App Router için `app/` veya `components/`).",
      "Hedef sayfa veya düzen dosyasında bileşeni `import` edin ve JSX içinde render edin. Gerekirse `'use client'` satırını üstte bırakın; sayaç ve form etkileşimi istemci tarafındadır.",
      "`npm run dev` ile yerelde test edin; ardından `npm run build` ve deploy ile canlıya alın.",
    ];
  }
  return [
    "Zip dosyasını indirin ve içindeki `index.html` ile `widget.js` dosyalarını açın.",
    "Statik sitede: `index.html` içeriğini sayfanıza uyarlayın veya gövde kısmını mevcut şablonunuza yapıştırın. `widget.js` betiğini sayfa sonunda `<script>` içinde çalıştırın. Hazır e-ticaret panellerinde «Özel HTML / kod alanı» varsa aynı iki parçayı sırayla ekleyin.",
    "Dosyayı sunucuya yükleyin veya panelde kaydedip önizlemede formun ve sayacın çalıştığını kontrol edin.",
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
  "input,textarea,button{font:inherit;margin-top:4px}",
  "input,textarea{display:block;width:min(100%,360px);padding:8px;border:1px solid #cbd5e1;border-radius:10px}",
  "button{background:#1d4ed8;color:#fff;border:0;border-radius:10px;padding:8px 14px;cursor:pointer}",
  "#sonuc{margin-top:16px;white-space:pre-wrap}",
].join("");

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

function cargoSources(title: string, detail: string): { html: string; react: string; script: string } {
  const heading = escapeHtml(title);
  const note = escapeHtml(detail);
  const script = [
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
    "var lines=[];",
    "if(en>0&&boy>0&&yuk>0){",
    "var desi=en*boy*yuk/3000;",
    "lines.push('Desi: '+desi.toFixed(2)+' ('+desiBand(desi)+')');",
    "}",
    "if(gogus>0){",
    "lines.push('Örnek beden: '+sizeBand(gogus)+'. Marka tablosu esastır.');",
    "}",
    "document.getElementById('sonuc').textContent=lines.join('\\n')||'En az bir ölçü yaz.';",
    "});",
  ].join("");
  const html = page(
    title,
    [
      `<h1>${heading}</h1>`,
      `<p>${note}</p>`,
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
    "  const [out, setOut] = useState('');",
    "  function onSubmit(event) {",
    "    event.preventDefault();",
    "    const data = new FormData(event.currentTarget);",
    "    const en = Number(data.get('en'));",
    "    const boy = Number(data.get('boy'));",
    "    const yuk = Number(data.get('yuk'));",
    "    const gogus = Number(data.get('gogus'));",
    "    const lines = [];",
    "    if (en > 0 && boy > 0 && yuk > 0) {",
    "      const desi = (en * boy * yuk) / 3000;",
    "      lines.push('Desi: ' + desi.toFixed(2));",
    "    }",
    "    if (gogus > 0) lines.push('Örnek beden. Marka tablosu esastır.');",
    "    setOut(lines.join('\\n') || 'En az bir ölçü yaz.');",
    "  }",
    "  return (",
    "    <form onSubmit={onSubmit}>",
    `      <h1>{${JSON.stringify(title)}}</h1>`,
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

function orderSources(title: string, detail: string): { html: string; react: string; script: string } {
  const script = [
    "document.getElementById('siparis').addEventListener('submit',function(event){",
    "event.preventDefault();",
    "var ad=document.getElementById('ad').value.trim();",
    "var tel=document.getElementById('tel').value.trim();",
    "var not=document.getElementById('not').value.trim();",
    "if(ad.length<2||tel.replace(/\\D/g,'').length<10){",
    "document.getElementById('sonuc').textContent='Ad ve telefon gerekli.';",
    "return;",
    "}",
    "document.getElementById('sonuc').textContent='Sipariş notu hazır: '+ad+' / '+tel+(not?(' / '+not):'')+'. Kanal gönderimi bu sayfada yok.';",
    "});",
  ].join("");
  const html = page(
    title,
    [
      `<h1>${escapeHtml(title)}</h1>`,
      `<p>${escapeHtml(detail)}</p>`,
      '<form id="siparis">',
      '<label>Ad<input id="ad" required></label>',
      '<label>Telefon<input id="tel" required></label>',
      '<label>Not<textarea id="not" rows="3"></textarea></label>',
      '<button type="submit">Notu hazırla</button>',
      "</form>",
      '<p id="sonuc"></p>',
    ].join(""),
    script,
  );
  const react = [
    "import { useState } from 'react';",
    "export function SiparisFormu() {",
    "  const [out, setOut] = useState('');",
    "  function onSubmit(event) {",
    "    event.preventDefault();",
    "    const data = new FormData(event.currentTarget);",
    "    const ad = String(data.get('ad') || '').trim();",
    "    const tel = String(data.get('tel') || '').replace(/\\D/g, '');",
    "    if (ad.length < 2 || tel.length < 10) { setOut('Ad ve telefon gerekli.'); return; }",
    "    setOut('Sipariş notu hazır. Kanal gönderimi bu bileşende yok.');",
    "  }",
    "  return (",
    "    <form onSubmit={onSubmit}>",
    `      <h1>{${JSON.stringify(title)}}</h1>`,
    "      <label>Ad<input name=\"ad\" required /></label>",
    "      <label>Telefon<input name=\"tel\" required /></label>",
    "      <label>Not<textarea name=\"not\" /></label>",
    "      <button type=\"submit\">Notu hazırla</button>",
    "      <p>{out}</p>",
    "    </form>",
    "  );",
    "}",
  ].join("\n");
  return { html, react, script };
}

function counterSources(title: string, deadline: string): { html: string; react: string; script: string } {
  const stamp = JSON.stringify(deadline);
  const script = [
    `var hedef=${stamp};`,
    "function tick(){",
    "var parca=hedef.split(/[-T:]/);",
    "var bitis=new Date(Number(parca[0]),Number(parca[1])-1,Number(parca[2]),Number(parca[3]),Number(parca[4]),0,0).getTime();",
    "var kalan=bitis-Date.now();",
    "var hedefNokta=document.getElementById('sonuc');",
    "if(kalan<=0){hedefNokta.textContent='Süre doldu.';return;}",
    "var gun=Math.floor(kalan/86400000);",
    "var saat=Math.floor((kalan%86400000)/3600000);",
    "var dakika=Math.floor((kalan%3600000)/60000);",
    "hedefNokta.textContent=gun+' gün '+saat+' saat '+dakika+' dakika';",
    "}",
    "tick();setInterval(tick,1000);",
  ].join("");
  const html = page(
    title,
    [`<h1>${escapeHtml(title)}</h1>`, `<p>Bitiş: ${escapeHtml(deadline)}</p>`, '<p id="sonuc">Sayaç açılıyor</p>'].join(
      "",
    ),
    script,
  );
  const react = [
    "export function KampanyaSayaci() {",
    "  const [out, setOut] = React.useState('Sayaç açılıyor');",
    "  React.useEffect(function () {",
    `    var parca = ${stamp}.split(/[-T:]/);`,
    "    var bitis = new Date(Number(parca[0]), Number(parca[1]) - 1, Number(parca[2]), Number(parca[3]), Number(parca[4]), 0, 0).getTime();",
    "    function tick() {",
    "      var kalan = bitis - Date.now();",
    "      if (kalan <= 0) { setOut('Süre doldu.'); return; }",
    "      setOut(Math.floor(kalan / 86400000) + ' gün');",
    "    }",
    "    tick();",
    "    var timer = setInterval(tick, 1000);",
    "    return function () { clearInterval(timer); };",
    "  }, []);",
    "  return React.createElement('p', null, out);",
    "}",
  ].join("\n");
  return { html, react, script };
}

function apiSources(title: string, url: string): { html: string; react: string; script: string } {
  const href = JSON.stringify(url);
  const script = [
    `var adres=${href};`,
    "document.getElementById('oku').addEventListener('click',function(){",
    "var hedef=document.getElementById('sonuc');",
    "hedef.textContent='Okunuyor';",
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
      `<p>Adres: ${escapeHtml(url)}</p>`,
      '<p>Anahtar bu sayfaya yazılmaz. Sır sunucuda kalır.</p>',
      '<button id="oku" type="button">JSON oku</button>',
      '<p id="sonuc"></p>',
    ].join(""),
    script,
  );
  const react = [
    "export function ApiOkuyucu() {",
    "  const [out, setOut] = React.useState('');",
    "  async function onClick() {",
    "    setOut('Okunuyor');",
    "    try {",
    `      const response = await fetch(${href}, { headers: { accept: 'application/json' } });`,
    "      if (!response.ok) throw new Error('okunamadı');",
    "      const data = await response.json();",
    "      setOut(JSON.stringify(data).slice(0, 500));",
    "    } catch (error) { setOut('Yanıt okunamadı.'); }",
    "  }",
    `  return React.createElement('div', null, React.createElement('h1', null, ${JSON.stringify(title)}), React.createElement('button', { type: 'button', onClick }, 'JSON oku'), React.createElement('pre', null, out));`,
    "}",
  ].join("\n");
  return { html, react, script };
}

export function buildSaasWidget(input: SaasBuilderInput): SaasBuilderPack | null {
  const title = oneLine(input.title, 80);
  const detail = oneLine(input.detail, 300);
  const feature = oneLine(input.feature, 300);
  if (title.length < 2 || detail.length < 2 || feature.length < 2) {
    return null;
  }
  let sources: { html: string; react: string; script: string } | null = null;
  if (input.widget === "cargo") {
    sources = cargoSources(title, detail);
  } else if (input.widget === "order") {
    sources = orderSources(title, detail);
  } else if (input.widget === "counter") {
    const deadline = readCounterDeadline(detail);
    if (!deadline) {
      return null;
    }
    sources = counterSources(title, deadline);
  } else {
    const url = readApiUrl(detail);
    if (!url) {
      return null;
    }
    sources = apiSources(title, url);
  }
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
    { name: "index.html", text: sources.html },
    { name: "widget.js", text: sources.script },
    { name: "App.jsx", text: sources.react },
    { name: "KURULUM_REHBERI.md", text: `# ${SAAS_INSTALL_GUIDE_HEADING}\n\n${installGuide}` },
    {
      name: "README.txt",
      text: "Bu paket index.html dosyasıyla tarayıcıda açılır. App.jsx aynı bileşenin React karşılığıdır. Kurulum için KURULUM_REHBERI.md dosyasını okuyun. Fiyat yazılmaz.\n",
    },
  ];
  return {
    filename: SAAS_ZIP_FILENAME,
    html: sources.html,
    react: sources.react,
    installGuide,
    files,
    zip: buildStoreZip(files),
    summary: `Mini SaaS: ${title}. ${SAAS_ZIP_FILENAME} hazır.`,
  };
}
