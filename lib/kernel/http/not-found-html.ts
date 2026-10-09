import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";

/** Kenar HTML 404. Bilinmeyen Junior ders adresi bunu döner; gövde 200 kalmaz. */
export function renderNotFoundHtml(): string {
  const copy = PUBLIC_SEN.notFound;
  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex" />
    <title>${copy.title}</title>
    <style>
      :root { color-scheme: light; }
      body { margin: 0; min-height: 100vh; font-family: "Segoe UI", system-ui, sans-serif; background: #eef2f7; color: #0f172a; }
      main { max-width: 40rem; margin: 0 auto; padding: 4rem 1.5rem; }
      p { line-height: 1.55; }
      a { color: #1e3a5f; }
    </style>
  </head>
  <body>
    <main>
      <p>${copy.eyebrow}</p>
      <h1>${copy.title}</h1>
      <p>${copy.description}</p>
      <p><a href="/">${copy.homeCta}</a></p>
    </main>
  </body>
</html>`;
}
