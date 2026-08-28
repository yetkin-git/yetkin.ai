import { PUBLIC_SEN } from "@/lib/copy/sen-voice/public";
import { FROZEN_DISK_ROOM_CATALOG } from "@/lib/kernel/compliance/circuit-breakers";
import { EDGE_API_FROZEN_ROOM_ERROR } from "@/lib/kernel/security/edge-api-auth";

/** Kenar HTML 410 — vatandaş dili. API JSON cümlesi EDGE_API_FROZEN_ROOM_ERROR ile aynı kalır. */
export const FROZEN_ROOM_GONE_HEADLINE = EDGE_API_FROZEN_ROOM_ERROR;

export function frozenRoomLabelFromPath(pathname: string): string {
  const match = FROZEN_DISK_ROOM_CATALOG.find(
    (room) =>
      pathname === room.path ||
      pathname.startsWith(`${room.path}/`) ||
      pathname === room.diskPath ||
      pathname.startsWith(`${room.diskPath}/`),
  );
  return match?.label ?? "Bu oda";
}

export function renderFrozenRoomGoneHtml(pathname: string): string {
  const copy = PUBLIC_SEN.gone;
  const label = frozenRoomLabelFromPath(pathname);
  const title = `${label} üretimde kapalı`;
  return `<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      :root { color-scheme: light; }
      body { margin: 0; min-height: 100vh; font-family: "Segoe UI", system-ui, sans-serif; background: #eef2f7; color: #0f172a; }
      main { max-width: 40rem; margin: 0 auto; padding: 4rem 1.5rem; }
      p { line-height: 1.55; }
      .muted { color: #5b677a; font-size: 0.875rem; }
      .eyebrow { font-size: 0.75rem; letter-spacing: 0.16em; text-transform: uppercase; color: #5b677a; }
      h1 { font-size: 1.5rem; font-weight: 600; margin: 0.5rem 0 1rem; }
      nav { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.5rem; }
      a { color: #0b63c7; text-decoration: none; font-weight: 600; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">${copy.eyebrow}</p>
      <h1>${title}</h1>
      <p>${FROZEN_ROOM_GONE_HEADLINE}</p>
      <p class="muted">${copy.description}</p>
      <p class="muted">${copy.status}</p>
      <nav>
        <a href="/">${copy.homeCta}</a>
        <a href="/academy">${copy.academyCta}</a>
        <a href="/career">${copy.careerCta}</a>
        <a href="/freelancer">${copy.freelancerCta}</a>
      </nav>
    </main>
  </body>
</html>`;
}
