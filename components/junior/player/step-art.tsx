import type { ReactNode } from "react";
import { EnglishSceneArt, isEnglishJuniorScene } from "@/components/junior/player/english-scenes";
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
import type { JuniorVectorScene } from "@/lib/junior/types";

type ArtProps = {
  scene: JuniorVectorScene;
  beat: number;
  caption: string;
  /** 0..aktif cümle izi — Sticky Scene State (fallback bounce yasağı). */
  captionTrail?: readonly string[];
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
      className="pointer-events-none block h-full w-full"
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
  if (scene === "meaning") return "schema";
  if (scene === "word-tree") return "tree";
  if (scene === "affix") return "puzzle";
  if (scene === "book") return "book";
  if (scene === "main-idea") return "page";
  if (scene === "support-idea") return "cards";
  if (scene === "place") return "schema";
  if (scene === "culture") return "hands";
  if (scene === "globe") return "globe";
  if (scene === "grid") return "grid";
  if (scene === "history") return "history";
  if (scene === "caravan") return "caravan";
  if (scene === "assembly") return "assembly";
  if (/komut|satır|kod|hata|musluk/.test(text)) return "code";
  if (/harita|konum|sağdan|yön|enlem|boylam/.test(text)) return "map";
  return "chat";
}

function LocationPin({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g data-junior-pin="konum">
      <line x1={cx} y1={cy + 5} x2={cx} y2={cy + 20} stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="8" fill="#f97316" stroke="#0f172a" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="3" fill="#fff7ed" />
    </g>
  );
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
export function JuniorStepArt({ scene, beat, caption, captionTrail }: ArtProps) {
  /** Clean Stage Unmount: özet modunda branş SoftStage / ExponentScene ağacı DOM'da kalmaz. */
  if (beat >= 9) {
    return <RecapArt key="junior-recap-stage" beat={beat} caption={caption} scene={scene} />;
  }
  if (isEnglishJuniorScene(scene)) {
    return <EnglishSceneArt scene={scene} beat={beat} caption={caption} />;
  }
  if (isMathJuniorScene(scene)) {
    /** Canlı karatahta: caption = karaoke; captionTrail = yapışkan görsel durum. */
    return (
      <MathSceneArt scene={scene} beat={Math.min(8, beat)} caption={caption} captionTrail={captionTrail} />
    );
  }
  if (isScienceJuniorScene(scene)) {
    return (
      <ScienceSceneArt scene={scene} beat={Math.min(8, beat)} caption={caption} captionTrail={captionTrail} />
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
  if (beat <= 1) {
    return <WelcomeArt scene={scene} beat={beat} caption={caption} />;
  }
  if (scene === "elective") {
    return <ElectiveMotif beat={beat} caption={caption} />;
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

function RecapArt({ beat, caption }: ArtProps) {
  const active = Math.min(2, Math.max(0, beat - 9));
  /**
   * Tek adım metni (steps[9|10|11]) veya çok maddeli kaset bloğu.
   * `1.`/`2.`/`3.` bloğu varsa aktif madde; yoksa tüm satır (çift indeks yok).
   * Vurgu beat/caption ile aynı ms — geçiş tamponu yok.
   * Metin: foreignObject + break-words — slice(0,42) kesmesi yok.
   */
  const line = recapLineForActive(caption, active);
  /** 360×200 art: başlık + 3 kart; aktif madde wrap ile tam görünür (slice yok). */
  const rowH = 52;
  const rowGap = 3;
  const rowTop = 32;
  return (
    <Frame recapClean>
      <text x="20" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        Bugün Neler Öğrendik?
      </text>
      {[0, 1, 2].map((index) => {
        const y = rowTop + index * (rowH + rowGap);
        const isActive = index === active;
        return (
          <g key={index} opacity={isActive ? 1 : 0.55}>
            <rect
              x="14"
              y={y}
              width="332"
              height={rowH}
              rx="8"
              fill={isActive ? "#fde68a" : "#f8fafc"}
              stroke={isActive ? "#0284c7" : "#cbd5e1"}
              strokeWidth={isActive ? 3 : 1.75}
            />
            <text x="26" y={y + 30} fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
              {index + 1}.
            </text>
            {isActive ? (
              <foreignObject x="46" y={y + 4} width="292" height={rowH - 8}>
                <div
                  className="box-border flex h-full w-full items-center break-words text-sm leading-snug text-slate-900 md:text-base"
                  style={{ overflowWrap: "break-word", wordBreak: "normal", hyphens: "none" }}
                >
                  {line}
                </div>
              </foreignObject>
            ) : (
              <text x="50" y={y + 30} fill="#0f172a" fontSize="13" fontFamily="inherit">
                ·
              </text>
            )}
          </g>
        );
      })}
    </Frame>
  );
}

function ElectiveMotif({ beat, caption }: { beat: number; caption: string }) {
  const kind = motif("elective", caption);
  const step = Math.max(0, beat - 2);
  if (kind === "code") {
    return (
      <Frame>
        {[0, 1, 2].map((index) => (
          <rect
            key={index}
            x="48"
            y={48 + index * 40}
            width="260"
            height="30"
            rx="6"
            fill={index === step % 3 ? "#fde68a" : "#f8fafc"}
            stroke="#0f172a"
            strokeWidth="2"
          />
        ))}
        <text x="60" y="68" fill="#0f172a" fontSize="13" fontFamily="inherit">
          1. komut
        </text>
        <text x="60" y="108" fill="#0f172a" fontSize="13" fontFamily="inherit">
          2. komut
        </text>
        <text x="60" y="148" fill="#0f172a" fontSize="13" fontFamily="inherit">
          3. komut
        </text>
      </Frame>
    );
  }
  if (kind === "map") {
    return (
      <Frame>
        <ellipse cx="150" cy="100" rx="70" ry="70" fill="#bae6fd" stroke="#cbd5e1" strokeWidth="2" />
        <ellipse cx="150" cy="100" rx="70" ry="16" fill="none" stroke="#b45309" strokeWidth="2" />
        <ellipse cx="150" cy="78" rx="52" ry="10" fill="none" stroke="#0369a1" strokeWidth="2" />
        <ellipse cx="150" cy="122" rx="52" ry="10" fill="none" stroke="#0369a1" strokeWidth="2" />
        <ellipse cx="150" cy="100" rx="22" ry="70" fill="none" stroke="#7c3aed" strokeWidth="2" />
        <LocationPin cx={148} cy={78} />
        <text x="250" y="104" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
          {step % 2 === 0 ? "Sağ" : "Sol"}
        </text>
      </Frame>
    );
  }
  const leftOn = step % 2 === 0;
  return (
    <Frame>
      <rect x="28" y="48" width="140" height="48" rx="14" fill={leftOn ? "#e0f2fe" : "#f8fafc"} stroke="#0f172a" strokeWidth="2" />
      <rect x="190" y="108" width="140" height="48" rx="14" fill={leftOn ? "#f8fafc" : "#fde68a"} stroke="#0f172a" strokeWidth="2" />
      <text x="44" y="78" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        {leftOn ? "Merhaba" : "Soru"}
      </text>
      <text x="206" y="138" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
        {leftOn ? "Karşılık" : "Cevap"}
      </text>
    </Frame>
  );
}
