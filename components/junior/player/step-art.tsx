import type { ReactNode } from "react";
import { EnglishSceneArt, isEnglishJuniorScene } from "@/components/junior/player/english-scenes";
import { JuniorScenePlate } from "@/components/junior/player/scene-plate";
import { isMathJuniorScene, MathSceneArt } from "@/components/junior/player/math-scenes";
import {
  JUNIOR_STAGE_ART_H,
  JUNIOR_STAGE_ART_SCALE,
  JUNIOR_STAGE_ART_W,
  JUNIOR_STAGE_VB_H,
  JUNIOR_STAGE_VB_W,
} from "@/components/junior/player/scene-ui";
import { isScienceJuniorScene, ScienceSceneArt } from "@/components/junior/player/science-scenes";
import { isSocialJuniorScene, SocialSceneArt } from "@/components/junior/player/social-scenes";
import { isTurkishJuniorScene, TurkishSceneArt } from "@/components/junior/player/turkish-scenes";
import { juniorSceneMediaForBeat } from "@/lib/junior/scene-media";
import type { JuniorVectorScene } from "@/lib/junior/types";

type ArtProps = {
  scene: JuniorVectorScene;
  beat: number;
  caption: string;
  /** 0..aktif cümle izi — Sticky Scene State (fallback bounce yasağı). */
  captionTrail?: readonly string[];
  /** Plaka ve sözsüz kaset bu ders anahtarına yazılır. */
  lessonKey?: string;
};

function Frame({
  children,
  recapClean = false,
}: {
  children: ReactNode;
  /** Özet sahnesi — önceki SoftStage çocukları bu SVG'de yoktur. */
  recapClean?: boolean;
}) {
  const ox = (JUNIOR_STAGE_VB_W - JUNIOR_STAGE_ART_W * JUNIOR_STAGE_ART_SCALE) / 2;
  const oy = (JUNIOR_STAGE_VB_H - JUNIOR_STAGE_ART_H * JUNIOR_STAGE_ART_SCALE) / 2;
  return (
    <svg
      viewBox={`0 0 ${JUNIOR_STAGE_VB_W} ${JUNIOR_STAGE_VB_H}`}
      className="pointer-events-none absolute inset-0 block h-full min-h-[300px] w-full"
      role="img"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
      data-junior-stage="cinema-16x9"
      data-junior-recap={recapClean ? "clean" : undefined}
    >
      <g transform={`translate(${ox},${oy}) scale(${JUNIOR_STAGE_ART_SCALE})`}>{children}</g>
    </svg>
  );
}

function motif(scene: JuniorVectorScene, caption: string): "pie" | "bars" | "blocks" | "push" | "graph" | "rough" | "page" | "cards" | "map" | "bowl" | "hands" | "chat" | "code" | "orbit" | "cell" | "dots" | "wave" | "wire" | "schema" | "tree" | "puzzle" | "book" | "globe" | "grid" | "history" | "caravan" | "assembly" | "chart" | "geo" {
  const text = caption.toLocaleLowerCase("tr-TR");
  if (scene === "exponent") return "blocks";
  if (scene === "fraction") return "pie";
  if (scene === "fraction-sum") return "bars";
  if (scene === "ops-order" || scene === "distribute" || scene === "number-ops" || scene === "decimal" || scene === "ratio" || scene === "algebra" || scene === "sets" || scene === "number-line") {
    return "blocks";
  }
  if (scene === "chart") return "chart";
  if (scene === "angles" || scene === "area" || scene === "circle" || scene === "prism") return "geo";
  if (scene === "force") return "push";
  if (scene === "speed") return "graph";
  if (scene === "friction") return "rough";
  if (scene === "planets" || scene === "eclipse") return "orbit";
  if (scene === "blood" || scene === "body") return "cell";
  if (scene === "particles") return "dots";
  if (scene === "sound") return "wave";
  if (scene === "circuit") return "wire";
  if (scene === "mirror") return "wave";
  if (scene === "meaning") return "schema";
  if (scene === "word-tree") return "tree";
  if (scene === "affix") return "puzzle";
  if (scene === "book") return "book";
  if (scene === "main-idea") return "page";
  if (scene === "support-idea") return "cards";
  if (scene === "place" || scene === "family" || scene === "rules") return "schema";
  if (scene === "culture" || scene === "world") return "hands";
  if (scene === "globe") return "globe";
  if (scene === "universe") return "orbit";
  if (scene === "grid") return "grid";
  if (scene === "history") return "history";
  if (scene === "caravan") return "caravan";
  if (scene === "assembly") return "assembly";
  if (/komut|satır|kod|hata|musluk/.test(text)) return "code";
  if (/harita|konum|sağdan|yön|enlem|boylam/.test(text)) return "map";
  return "chat";
}

/**
 * Özet satırı: başlık + kaset/adım öneklerini (`4.`, `10.`) temizler.
 * UI zaten `1.`/`2.`/`3.` basar; çift indeks (`2 4.`) buradan doğardı.
 */
export function cleanRecapLine(raw: string): string {
  let text = raw.replace(/\s+/gu, " ").trim();
  text = text.replace(/Bugün Neler Öğrendik\?\s*/gu, "");
  text = text.replace(/^\d+\.\s*/u, "");
  text = text.replace(/\s+/gu, " ").trim();
  return text;
}

/** Çok maddeli `1. … 2. … 3. …` bloğundan aktif madde; tek adımda tüm gövde. */
export function recapLineForActive(caption: string, active: number): string {
  const stripped = caption.replace(/\s+/gu, " ").trim().replace(/Bugün Neler Öğrendik\?\s*/gu, "");
  const items = Array.from(stripped.matchAll(/(?:^|\s)(\d+)\.\s+/gu));
  if (items.length >= 2) {
    const slots = items.map((match, index) => {
      const start = (match.index ?? 0) + match[0].length;
      const end = index + 1 < items.length ? (items[index + 1]?.index ?? stripped.length) : stripped.length;
      return cleanRecapLine(stripped.slice(start, end));
    });
    const picked = slots[Math.min(2, Math.max(0, active))] ?? slots[0];
    if (picked && picked.length > 0) return picked;
  }
  return cleanRecapLine(caption);
}

/**
 * Karatahta / SoftStage / özet sahnesi.
 * «Hazırım…» / «Bir Kez Daha…» burada yok — vector-player `playback.complete`
 * (audio.ended | currentTime ≥ duration − 1) kilidine bağlıdır; Adım 12/12 yetmez.
 */
export function JuniorStepArt({ scene, beat, caption, captionTrail, lessonKey = "" }: ArtProps) {
  /** Clean Stage Unmount: özet modunda branş SoftStage / ExponentScene ağacı DOM'da kalmaz. */
  if (beat >= 9) {
    return <RecapArt key="junior-recap-stage" beat={beat} caption={caption} scene={scene} />;
  }
  const media = juniorSceneMediaForBeat(lessonKey, beat);
  if (media.videoSrc || media.imageSrc) {
    return (
      <JuniorScenePlate videoSrc={media.videoSrc} imageSrc={media.imageSrc}>
        <JuniorVectorStepArt lessonKey={lessonKey} scene={scene} beat={beat} caption={caption} captionTrail={captionTrail} />
      </JuniorScenePlate>
    );
  }
  return (
    <JuniorVectorStepArt lessonKey={lessonKey} scene={scene} beat={beat} caption={caption} captionTrail={captionTrail} />
  );
}

function JuniorVectorStepArt({ lessonKey, scene, beat, caption, captionTrail }: ArtProps) {
  if (isEnglishJuniorScene(scene)) {
    return <EnglishSceneArt scene={scene} beat={beat} caption={caption} />;
  }
  if (isMathJuniorScene(scene)) {
    /** Canlı karatahta: caption = karaoke; captionTrail = yapışkan görsel durum. */
    return (
      <MathSceneArt
        scene={scene}
        beat={Math.min(8, beat)}
        caption={caption}
        captionTrail={captionTrail}
        lessonKey={lessonKey}
      />
    );
  }
  if (isScienceJuniorScene(scene)) {
    return (
      <ScienceSceneArt
        scene={scene}
        beat={Math.min(8, beat)}
        caption={caption}
        captionTrail={captionTrail}
        lessonKey={lessonKey}
      />
    );
  }
  if (isTurkishJuniorScene(scene)) {
    return (
      <TurkishSceneArt scene={scene} beat={Math.min(8, beat)} caption={caption} captionTrail={captionTrail} />
    );
  }
  if (isSocialJuniorScene(scene)) {
    return <SocialSceneArt scene={scene} beat={Math.min(8, beat)} caption={caption} />;
  }
  if (scene === "elective") {
    return <ElectiveMotif lessonKey={lessonKey} beat={beat} caption={caption} captionTrail={captionTrail} />;
  }
  if (beat <= 1) {
    return <WelcomeArt scene={scene} beat={beat} caption={caption} />;
  }
  return <WelcomeArt scene={scene} beat={Math.min(1, beat)} caption={caption} />;
}

function WelcomeArt({ scene, beat, caption }: ArtProps) {
  const kind = motif(scene, caption);
  const line = caption.replace(/\s+/g, " ").trim();
  const title = beat === 0 ? "Merhaba" : "Konu";
  const row1 = line.slice(0, 42);
  const row2 = line.length > 42 ? line.slice(42, 84) : "";
  return (
    <Frame>
      <text x="20" y="30" fill="#0f172a" fontSize="18" fontFamily="inherit" fontWeight="700">
        {title}
      </text>
      {kind === "chat" ? (
        <rect x="20" y="48" width="320" height="88" rx="14" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="1.75" />
      ) : (
        <rect x="20" y="48" width="320" height="88" rx="14" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.75" />
      )}
      <text x="36" y="84" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="600">
        {row1 || "Dinle ve izle."}
      </text>
      {row2 ? (
        <text x="36" y="108" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="600">
          {row2}
        </text>
      ) : null}
    </Frame>
  );
}

/**
 * Özet kartları viewBox uzayında (640×360). İç `scale()` grubuna girmez:
 * foreignObject puntoyu ikinci kez büyütüp satırı kartın sağından kesiyordu.
 * Aktif kart uzun cümleyi alır; boş kartlar ince kalır.
 */
const RECAP_ROW_TOP = 44;
const RECAP_GAP = 8;
const RECAP_IDLE_H = 32;
const RECAP_ACTIVE_H = JUNIOR_STAGE_VB_H - RECAP_ROW_TOP - RECAP_IDLE_H * 2 - RECAP_GAP * 2 - 12;
const RECAP_CARD_X = 28;
const RECAP_CARD_W = 584;

/**
 * leading-snug = 1.375. Punto, satır bloğu kutuya sığacak en büyük değerdir.
 * innerW / innerH dolgu ve indeks payı düşülmüş alandır.
 */
function recapFontPx(line: string, innerW: number, innerH: number): number {
  const text = line.trim();
  const width = Math.max(40, innerW);
  const height = Math.max(16, innerH);
  for (const size of [26, 24, 22, 20, 18, 16, 14]) {
    const chars = Math.max(6, Math.floor(width / (size * 0.58)));
    const lines = Math.max(1, Math.ceil(Math.max(1, text.length) / chars));
    if (lines * size * 1.375 <= height) return size;
  }
  return 14;
}

function recapSlots(active: number): Array<{ index: number; y: number; h: number }> {
  let y = RECAP_ROW_TOP;
  return [0, 1, 2].map((index) => {
    const h = index === active ? RECAP_ACTIVE_H : RECAP_IDLE_H;
    const slot = { index, y, h };
    y += h + RECAP_GAP;
    return slot;
  });
}

function RecapArt({ beat, caption }: ArtProps) {
  const active = Math.min(2, Math.max(0, beat - 9));
  /**
   * Tek adım metni (steps[9|10|11]) veya çok maddeli kaset bloğu.
   * `1.`/`2.`/`3.` bloğu varsa aktif madde; yoksa tüm satır (çift indeks yok).
   * Vurgu beat/caption ile aynı ms — geçiş tamponu yok.
   * Metin: foreignObject + min-h-fit — slice(0,42) kesmesi yok.
   */
  const line = recapLineForActive(caption, active);
  const slots = recapSlots(active);
  return (
    <svg
      viewBox={`0 0 ${JUNIOR_STAGE_VB_W} ${JUNIOR_STAGE_VB_H}`}
      className="pointer-events-none absolute inset-0 block h-full min-h-[300px] w-full"
      role="img"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
      data-junior-stage="cinema-16x9"
      data-junior-recap="clean"
    >
      <text x="36" y="30" fill="#0f172a" fontSize="22" fontFamily="inherit" fontWeight="700">
        Bugün Neler Öğrendik?
      </text>
      {slots.map(({ index, y, h }) => {
        const isActive = index === active;
        const textX = 44;
        const textW = RECAP_CARD_X + RECAP_CARD_W - 20 - textX;
        const textH = h - 16;
        const fontPx = recapFontPx(line, textW - 56, textH - 20);
        return (
          <g key={index} opacity={isActive ? 1 : 0.55} data-junior-recap-card={index} data-junior-recap-active={isActive ? "true" : "false"}>
            <rect
              x={RECAP_CARD_X}
              y={y}
              width={RECAP_CARD_W}
              height={h}
              rx="14"
              fill={isActive ? "#fde68a" : "#f8fafc"}
              stroke={isActive ? "#0284c7" : "#cbd5e1"}
              strokeWidth={isActive ? 3 : 1.75}
            />
            {isActive ? (
              <foreignObject x={textX} y={y + 8} width={textW} height={textH}>
                <div
                  className="box-border flex min-h-fit items-center justify-center gap-3 break-words px-3 py-2 text-center leading-snug text-slate-900"
                  data-junior-recap-line=""
                  data-junior-recap-font={fontPx}
                  style={{
                    width: `${textW}px`,
                    height: `${textH}px`,
                    fontSize: `${fontPx}px`,
                    overflowWrap: "break-word",
                    wordBreak: "normal",
                    hyphens: "none",
                  }}
                >
                  <span className="shrink-0 font-bold">{index + 1}.</span>
                  <span className="min-h-fit min-w-0 flex-1">{line}</span>
                </div>
              </foreignObject>
            ) : (
              <text
                x="48"
                y={y + h / 2 + 6}
                fill="#0f172a"
                fontSize="18"
                fontFamily="inherit"
                fontWeight="700"
              >
                {index + 1}.
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ElectiveMotif({
  lessonKey = "",
  beat,
  caption,
  captionTrail,
}: {
  lessonKey?: string;
  beat: number;
  caption: string;
  captionTrail?: readonly string[];
}) {
  const key = lessonKey.trim();
  const joined = [...(captionTrail ?? []), caption].join(" ").toLocaleLowerCase("tr-TR");
  const live = caption.toLocaleLowerCase("tr-TR");
  const step = Math.max(0, beat);

  const isSiyer = key.startsWith("jr_06_siyer") || /peygamber|siyer|emanet|merhamet|doğru söz|şefkat/.test(joined);
  const isCode = key.startsWith("jr_06_kod") || /komut|satır|kod|hata|algoritma|musluk/.test(joined);
  const isGerman = key.startsWith("jr_06_alm") || /guten morgen|guten tag|guten abend|heiße|heißt|almanca/.test(joined);
  const isFrench = key.startsWith("jr_06_fra") || /bonjour|bonsoir|salut|m'appelle|t'appelles|fransızca/.test(joined);
  const isArabic = key.startsWith("jr_06_arp") || /selamün aleyküm|aleyküm selam|sağdan sola|arapça|ب/.test(joined);

  if (isSiyer) {
    const isMercy = key === "jr_06_siyer-2" || /merhamet|şefkat|yardım|kuş/.test(joined);
    const cards = isMercy
      ? [
          { title: "Merhamet", sub: "Karşındaki kişiyi incitmemek", badge: "İncitme ✓" },
          { title: "Yumuşaklık", sub: "Gücün yettiği halde sertleşmemek", badge: "Yumuşak ✓" },
          { title: "Yardım", sub: "Merhametin görünen işi", badge: "İş ✓" },
        ]
      : [
          { title: "Doğru söz", sub: "Ağzından çıkan ile elinin yaptığı aynı", badge: "Söz ✓" },
          { title: "Emanet", sub: "Kalemi sahibine geri vermek", badge: "Geri ver ✓" },
          { title: "Söz ile iş", sub: "Sözün ile işin birleşir", badge: "Birleşir ✓" },
        ];
    return (
      <Frame>
        <text x="20" y="24" fill="#065f46" fontSize="14" fontFamily="inherit" fontWeight="700">
          {isMercy ? "Siyer · Merhamet ve Yardımlaşma" : "Siyer · Doğru Söz ve Güven"}
        </text>
        {cards.map((c, idx) => {
          const hi = idx === step % 3;
          const y = 38 + idx * 42;
          return (
            <g key={c.title}>
              <rect
                x="20"
                y={y}
                width="320"
                height="36"
                rx="8"
                fill={hi ? "#dcfce7" : "#f8fafc"}
                stroke={hi ? "#15803d" : "#cbd5e1"}
                strokeWidth="1.75"
              />
              <text x="32" y={y + 15} fill="#0f172a" fontSize="11.5" fontFamily="inherit" fontWeight="700">
                {c.title}
              </text>
              <text x="32" y={y + 29} fill="#475569" fontSize="10" fontFamily="inherit">
                {c.sub}
              </text>
              <text x="262" y={y + 22} fill="#15803d" fontSize="10.5" fontFamily="inherit" fontWeight="700">
                {c.badge}
              </text>
            </g>
          );
        })}
        <text x="20" y="182" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="600">
          {isMercy ? "Yardım, merhametin görünen işidir." : "Söz ile iş birleşirse doğru söz durur."}
        </text>
      </Frame>
    );
  }

  if (isCode) {
    const isDebug = key === "jr_06_kod-2" || /hatalı|hata|düzelt|yanlış sıra/.test(joined);
    const rows = isDebug
      ? [
          { cmd: "1. Bardağı tut", status: "✓ Doğru", ok: true },
          { cmd: "2. Bardağı bırak", status: "✗ Hatalı adım", ok: false },
          { cmd: "Düzeltme: Bardağı tut", status: "✓ Onarıldı", ok: true },
        ]
      : [
          { cmd: "1. Bardağı tut", status: "Başla →", ok: true },
          { cmd: "2. Musluğu aç", status: "İşlem →", ok: true },
          { cmd: "3. Bardak dolunca kapat", status: "Bitir ✓", ok: true },
        ];
    return (
      <Frame>
        <text x="20" y="24" fill="#3730a3" fontSize="14" fontFamily="inherit" fontWeight="700">
          {isDebug ? "Bilgisayar Bilimi · Hatalı Adımı Bulmak (Debug)" : "Bilgisayar Bilimi · Komut Sırası ve Algoritma"}
        </text>
        {rows.map((row, index) => {
          const hi = index === step % 3;
          const y = 38 + index * 42;
          return (
            <g key={row.cmd}>
              <rect
                x="20"
                y={y}
                width="320"
                height="36"
                rx="8"
                fill={!row.ok ? "#fee2e2" : hi ? "#fde68a" : "#f8fafc"}
                stroke={!row.ok ? "#dc2626" : hi ? "#4f46e5" : "#cbd5e1"}
                strokeWidth="1.75"
              />
              <text x="32" y={y + 22} fill="#0f172a" fontSize="11.5" fontFamily="inherit" fontWeight="700">
                {row.cmd}
              </text>
              <text
                x="246"
                y={y + 22}
                fill={!row.ok ? "#b91c1c" : "#15803d"}
                fontSize="10.5"
                fontFamily="inherit"
                fontWeight="700"
              >
                {row.status}
              </text>
            </g>
          );
        })}
        <text x="20" y="182" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="600">
          {isDebug ? "Hata ikinci satırdadır. Bardağı bırakmak suyu tutmaz." : "Musluğu önce açmak suyu yere döker."}
        </text>
      </Frame>
    );
  }

  if (isGerman) {
    const isIntro = key === "jr_06_alm-2" || /heiße|heißt|adın/.test(live);
    return (
      <Frame>
        <text x="20" y="24" fill="#991b1b" fontSize="14" fontFamily="inherit" fontWeight="700">
          {isIntro ? "Almanca · Kendini Tanıtma (Vorstellung)" : "Almanca · Selamlaşma (Begrüßung)"}
        </text>
        {(isIntro
          ? [
              { de: "Wie heißt du?", tr: "Adın ne?" },
              { de: "Ich heiße", tr: "Adın gelir" },
              { de: "Heiße", tr: "Tek başına cevap olmaz" },
            ]
          : [
              { de: "Guten Morgen", tr: "Günaydın" },
              { de: "Guten Tag", tr: "İyi günler" },
              { de: "Gute Nacht", tr: "İyi geceler, vedadır" },
            ]
        ).map((item, idx) => (
          <g key={item.de}>
            <rect
              x="20"
              y={38 + idx * 42}
              width="320"
              height="36"
              rx="8"
              fill={idx === step % 3 ? "#fef3c7" : "#f8fafc"}
              stroke={idx === step % 3 ? "#b45309" : "#cbd5e1"}
              strokeWidth="1.75"
            />
            <text x="32" y={60 + idx * 42} fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
              {item.de}
            </text>
            <text x="196" y={60 + idx * 42} fill="#475569" fontSize="11" fontFamily="inherit">
              {`→ ${item.tr}`}
            </text>
          </g>
        ))}
        <text x="20" y="182" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="600">
          {isIntro ? "Heiße tek başına cevap olmaz. Ich heiße ile başla." : "Hallo her saatte merhabadır. Guten Abend akşam selamıdır."}
        </text>
      </Frame>
    );
  }

  if (isFrench) {
    const isIntro = key === "jr_06_fra-2" || /appelle|appelles|adın/.test(live);
    return (
      <Frame>
        <text x="20" y="24" fill="#9d174d" fontSize="14" fontFamily="inherit" fontWeight="700">
          {isIntro ? "Fransızca · Kendini Tanıtma" : "Fransızca · Selamlaşma (Bonjour & Salut)"}
        </text>
        {(isIntro
          ? [
              { fr: "Comment tu t'appelles ?", tr: "Adın ne?" },
              { fr: "Je m'appelle", tr: "Adın gelir" },
              { fr: "Appelle", tr: "Tek başına cevap olmaz" },
            ]
          : [
              { fr: "Bonjour", tr: "Günaydın ve iyi günler" },
              { fr: "Bonsoir", tr: "Akşam" },
              { fr: "Bonne nuit", tr: "İyi geceler, vedadır" },
            ]
        ).map((item, idx) => (
          <g key={item.fr}>
            <rect
              x="20"
              y={38 + idx * 42}
              width="320"
              height="36"
              rx="8"
              fill={idx === step % 3 ? "#fce7f3" : "#f8fafc"}
              stroke={idx === step % 3 ? "#be185d" : "#cbd5e1"}
              strokeWidth="1.75"
            />
            <text x="32" y={60 + idx * 42} fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
              {item.fr}
            </text>
            <text x="196" y={60 + idx * 42} fill="#475569" fontSize="11" fontFamily="inherit">
              {`→ ${item.tr}`}
            </text>
          </g>
        ))}
        <text x="20" y="182" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="600">
          {isIntro ? "Appelle tek başına cevap olmaz. Je m'appelle ile başla." : "Salut arkadaş arasında merhabadır. Bonne nuit vedadır."}
        </text>
      </Frame>
    );
  }

  if (isArabic) {
    const isRtl = key === "jr_06_arp-2" || /sağdan sola|harf|ب|elif/.test(joined);
    return (
      <Frame>
        <text x="20" y="24" fill="#92400e" fontSize="14" fontFamily="inherit" fontWeight="700">
          {isRtl ? "Arapça · Sağdan Sola Harf ve Okuma Yönü" : "Arapça · Selamlaşma ve Karşılık"}
        </text>
        {isRtl ? (
          <g>
            <rect x="20" y="42" width="320" height="44" rx="10" fill="#fef3c7" stroke="#d97706" strokeWidth="1.75" />
            <text x="180" y="68" textAnchor="middle" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
              ← Okuma Yönü: Sağdan Sola (ب  —  ا  —  ب)
            </text>
            <rect x="20" y="96" width="152" height="58" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
            <text x="96" y="120" textAnchor="middle" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
              ب (Be) · ا (Elif)
            </text>
            <text x="96" y="140" textAnchor="middle" fill="#475569" fontSize="10.5" fontFamily="inherit">
              Ayrı harfler
            </text>
            <rect x="188" y="96" width="152" height="58" rx="10" fill="#dcfce7" stroke="#15803d" strokeWidth="1.5" />
            <text x="264" y="120" textAnchor="middle" fill="#15803d" fontSize="16" fontFamily="inherit" fontWeight="700">
              باب (Bâb)
            </text>
            <text x="264" y="140" textAnchor="middle" fill="#0f172a" fontSize="10.5" fontFamily="inherit">
              Birleşik: Kapı
            </text>
          </g>
        ) : (
          <g>
            <rect x="20" y="46" width="320" height="48" rx="10" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.75" />
            <text x="32" y="68" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
              Selamün aleyküm
            </text>
            <text x="32" y="84" fill="#475569" fontSize="10.5" fontFamily="inherit">
              Barış üzerine olsun
            </text>
            <rect x="20" y="104" width="320" height="48" rx="10" fill="#fef3c7" stroke="#d97706" strokeWidth="1.75" />
            <text x="32" y="126" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
              Ve aleyküm selam
            </text>
            <text x="32" y="142" fill="#475569" fontSize="10.5" fontFamily="inherit">
              Sana da barış olsun
            </text>
          </g>
        )}
        <text x="20" y="182" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="600">
          {isRtl ? "Arapça satır sağdan sola okunur." : "Önce selam verilir. Sonra karşılık söylenir."}
        </text>
      </Frame>
    );
  }

  // Seçmeli İngilizce (jr_06_ing-1..2) veya genel dil diyaloğu
  const isEngIntro = key === "jr_06_ing-2" || /what's your name|my name is|tanıt/.test(live);
  return (
    <Frame>
      <text x="20" y="24" fill="#1e40af" fontSize="14" fontFamily="inherit" fontWeight="700">
        {isEngIntro ? "Seçmeli İngilizce · What's your name?" : "Seçmeli İngilizce · Günün Selamları"}
      </text>
      {(isEngIntro
        ? [
            { en: "What's your name?", tr: "Adın ne?" },
            { en: "My name is", tr: "Adın gelir" },
            { en: "Name is", tr: "Tek başına cevap olmaz" },
          ]
        : [
            { en: "Good morning", tr: "Günaydın" },
            { en: "Good afternoon", tr: "Öğleden sonra" },
            { en: "Good night", tr: "İyi geceler, vedadır" },
          ]
      ).map((row, idx) => (
        <g key={row.en}>
          <rect
            x="20"
            y={38 + idx * 42}
            width="320"
            height="36"
            rx="8"
            fill={idx === step % 3 ? "#dbeafe" : "#f8fafc"}
            stroke={idx === step % 3 ? "#2563eb" : "#cbd5e1"}
            strokeWidth="1.75"
          />
          <text x="32" y={60 + idx * 42} fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
            {row.en}
          </text>
          <text x="196" y={60 + idx * 42} fill="#475569" fontSize="11" fontFamily="inherit">
            {`→ ${row.tr}`}
          </text>
        </g>
      ))}
        <text x="20" y="182" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="600">
          {isEngIntro ? "Yalnız Name is deme. My name is ile başla." : "Hello her saatte merhabadır. Good evening akşam selamıdır."}
        </text>
    </Frame>
  );
}
