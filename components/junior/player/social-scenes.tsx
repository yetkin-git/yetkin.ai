import type { ReactNode } from "react";
import { SoftStage } from "@/components/junior/player/scene-ui";
import type { JuniorVectorScene } from "@/lib/junior/types";

export type SocialJuniorScene =
  | "place"
  | "culture"
  | "globe"
  | "grid"
  | "history"
  | "caravan"
  | "assembly";

export function isSocialJuniorScene(scene: JuniorVectorScene): scene is SocialJuniorScene {
  return (
    scene === "place" ||
    scene === "culture" ||
    scene === "globe" ||
    scene === "grid" ||
    scene === "history" ||
    scene === "caravan" ||
    scene === "assembly"
  );
}

export function socialRecapName(scene: JuniorVectorScene): string | null {
  if (scene === "place") return "Rol";
  if (scene === "culture") return "Uyum";
  if (scene === "globe") return "Küre";
  if (scene === "grid") return "Izgara";
  if (scene === "history") return "Tarih";
  if (scene === "caravan") return "Kervan";
  if (scene === "assembly") return "Meclis";
  return null;
}

function Stage({ scene, children }: { scene: Parameters<typeof SoftStage>[0]["scene"]; children: ReactNode }) {
  return (
    <SoftStage scene={scene} gradientId="soc-stage-bg">
      {children}
    </SoftStage>
  );
}

function LocationPin({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g data-junior-pin="konum">
      <line x1={cx} y1={cy + 5} x2={cx} y2={cy + 20} stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="8" fill="#f97316" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="3" fill="#fff7ed" />
    </g>
  );
}

/** Yalnızca mutlak / göreceli konum (sosyal-9). Değer-rol dersine bağlanmaz. */
function EarthGrid({ grid, pin }: { grid: boolean; pin: boolean }) {
  return (
    <g data-junior-earth="kure">
      <circle cx="118" cy="104" r="72" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="1.5" />
      <ellipse cx="118" cy="104" rx="72" ry="7" fill="none" stroke="#b45309" strokeWidth="2.5" data-junior-equator="cizgi" />
      <text x="198" y="108" fill="#b45309" fontSize="13" fontFamily="inherit" fontWeight="700">
        Ekvator
      </text>
      {grid ? (
        <>
          <ellipse cx="118" cy="78" rx="58" ry="8" fill="none" stroke="#0369a1" strokeWidth="2" />
          <ellipse cx="118" cy="130" rx="58" ry="8" fill="none" stroke="#0369a1" strokeWidth="2" />
          <ellipse cx="118" cy="104" rx="22" ry="72" fill="none" stroke="#7c3aed" strokeWidth="2" />
          <ellipse cx="118" cy="104" rx="46" ry="72" fill="none" stroke="#7c3aed" strokeWidth="2" />
          <text x="198" y="72" fill="#0369a1" fontSize="12" fontFamily="inherit" fontWeight="700">
            Paralel / Enlem
          </text>
          <text x="198" y="146" fill="#7c3aed" fontSize="12" fontFamily="inherit" fontWeight="700">
            Meridyen / Boylam
          </text>
        </>
      ) : null}
      {pin ? <LocationPin cx={148} cy={86} /> : null}
    </g>
  );
}

/** sosyal-1 — Ev / Okul / Saha roller sabit; yalnız vurgu kayar. Ekvator yok. */
export function PlaceScene({ beat }: { beat: number; caption: string }) {
  const roles = [
    { label: "Ev", role: "Kardeş", fill: "#fff", value: "Yardımlaşma" },
    { label: "Okul", role: "Öğrenci", fill: "#fde68a", value: "Saygı" },
    { label: "Saha", role: "Oyuncu", fill: "#e0f2fe", value: "Sorumluluk" },
  ];
  const focus = beat >= 4 ? 2 : beat >= 2 ? 1 : 0;
  return (
    <Stage scene="place">
      <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        Toplumsal rol ve değerler
      </text>
      {roles.map((item, index) => (
        <g
          key={item.label}
          opacity={index === focus ? 1 : 0.55}
          data-junior-focus={index === focus ? "on" : "off"}
        >
          <rect
            x={20 + index * 114}
            y="42"
            width="104"
            height="96"
            rx="12"
            fill={item.fill}
            stroke={index === focus ? "#0284c7" : "#cbd5e1"}
            strokeWidth={index === focus ? 3 : 2}
          />
          <text x={72 + index * 114} y="68" textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="inherit">
            {item.label}
          </text>
          <text x={72 + index * 114} y="96" textAnchor="middle" fill="#0f172a" fontSize="16" fontFamily="inherit" fontWeight="700">
            {item.role}
          </text>
          <text x={72 + index * 114} y="122" textAnchor="middle" fill="#b45309" fontSize="12" fontFamily="inherit" fontWeight="700">
            {item.value}
          </text>
        </g>
      ))}
      <text x="16" y="176" fill="#0369a1" fontSize="13" fontFamily="inherit" fontWeight="700">
        {beat >= 5 ? "Rol değişir. Değer kalır." : "Değer ilkedir. Rol görevdir."}
      </text>
    </Stage>
  );
}

/** sosyal-2/3 — Yardımlaşma köprüsü veya önyargı kırma kartları. */
export function CultureScene({ beat, caption }: { beat: number; caption: string }) {
  const prejudice = /önyargı|duvar|tanımadan|ayrımcılık|empati/iu.test(caption);
  if (prejudice) {
    const cards = [
      { label: "Tanımadan", tip: "Hüküm verme", fill: beat >= 1 ? "#fecdd3" : "#fff" },
      { label: "Soru sor", tip: "Empati kur", fill: beat >= 3 ? "#fde68a" : "#fff" },
      { label: "Duvarı kır", tip: "Birlikte ol", fill: beat >= 5 ? "#bbf7d0" : "#fff" },
    ];
    return (
      <Stage scene="culture">
        <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Önyargıyı kırma kartları
        </text>
        {cards.map((card, index) => (
          <g key={card.label}>
            <rect
              x={16 + index * 114}
              y="48"
              width="104"
              height="88"
              rx="12"
              fill={card.fill}
              stroke="#cbd5e1"
              strokeWidth="3"
            />
            <text x={68 + index * 114} y="88" textAnchor="middle" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
              {card.label}
            </text>
            <text x={68 + index * 114} y="114" textAnchor="middle" fill="#64748b" fontSize="12" fontFamily="inherit">
              {card.tip}
            </text>
          </g>
        ))}
        <text x="16" y="176" fill="#0f172a" fontSize="13" fontFamily="inherit">
          Tanımadan karar verme.
        </text>
      </Stage>
    );
  }

  return (
    <Stage scene="culture">
      <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {beat >= 4 ? "Birlikte tamamlarız" : "Yardımlaşma"}
      </text>
      <circle cx="78" cy="100" r="28" fill="#fde68a" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="78" y="106" textAnchor="middle" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
        Sen
      </text>
      <circle cx="250" cy="100" r="28" fill="#bae6fd" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x="250" y="106" textAnchor="middle" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
        Arkadaş
      </text>
      <path d="M110 108 H218" stroke="#b45309" strokeWidth="5" strokeLinecap="round" />
      {beat >= 2 ? (
        <text x="140" y="96" fill="#b45309" fontSize="12" fontFamily="inherit" fontWeight="700">
          Kalem / kitap
        </text>
      ) : null}
      <text x="16" y="176" fill="#0f172a" fontSize="13" fontFamily="inherit">
        Farklı olmak ayrı durmak değildir.
      </text>
    </Stage>
  );
}

/**
 * sosyal-10/11 coğrafya-iklim; 12/13 kaynak-ekonomi; 19 komşular.
 * Paralel/meridyen yalnız grid sahnesindedir.
 */
export function GlobeScene({ beat, caption }: { beat: number; caption: string }) {
  const text = caption.toLocaleLowerCase("tr-TR");
  const climate = /iklim|yağış|karadeniz|akdeniz|karasal|marmara|bavul/.test(text);
  const land = /dağ|orman|maki|bozkır|ova|bitki|yükselti|yeryüzü/.test(text);
  const economy = /tarım|turizm|maden|sanayi|fındık|zeytin|çay|kaynak|ekonomik|faaliyet|ticaret/.test(text);
  const neighbor = /komşu|sınır|nahçıvan|yunanistan|bulgaristan|gürcistan|ermeni|iran|irak|suriye/.test(text);
  const sustain = /güneş|rüzgar|geri dönüş|tasarruf|sürdür|tükene|yenilen|kömür|petrol/.test(text);

  if (economy || sustain) {
    const nodes = sustain
      ? [
          { label: "Kaynak", tip: "Doğa" },
          { label: "Koru", tip: "Tasarruf" },
          { label: "Yenile", tip: "Güneş / rüzgâr" },
        ]
      : [
          { label: "Kaynak", tip: "Toprak / maden" },
          { label: "Üretim", tip: "Tarım / sanayi" },
          { label: "Tüketim", tip: "Sofra / hizmet" },
        ];
    const shown = beat >= 4 ? 3 : beat >= 2 ? 2 : 1;
    return (
      <Stage scene="globe">
        <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          {sustain ? "Kaynağı koru" : "Kaynaklar ve ekonomi akışı"}
        </text>
        {nodes.slice(0, shown).map((node, index) => (
          <g key={node.label}>
            <rect
              x={24 + index * 112}
              y="56"
              width="96"
              height="72"
              rx="12"
              fill={index === 1 ? "#fde68a" : "#fff"}
              stroke="#cbd5e1"
              strokeWidth="3"
            />
            <text x={72 + index * 112} y="88" textAnchor="middle" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
              {node.label}
            </text>
            <text x={72 + index * 112} y="112" textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="inherit">
              {node.tip}
            </text>
            {index < shown - 1 ? (
              <path
                d={`M${124 + index * 112} 92 H${132 + index * 112}`}
                stroke="#b45309"
                strokeWidth="3"
                markerEnd="url(#social-arrow)"
              />
            ) : null}
          </g>
        ))}
        <defs>
          <marker id="social-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L6,3 L0,6 Z" fill="#b45309" />
          </marker>
        </defs>
        <text x="16" y="176" fill="#15803d" fontSize="13" fontFamily="inherit" fontWeight="700">
          {sustain ? "Güneş ve rüzgâr yenilenir." : "Ürün, bölgenin kaynağına bağlıdır."}
        </text>
      </Stage>
    );
  }

  if (neighbor) {
    const neighbors = ["Yunanistan", "Bulgaristan", "Gürcistan", "Ermenistan", "İran", "Irak", "Suriye", "Nahçıvan"];
    const shown = Math.min(neighbors.length, beat >= 5 ? 8 : beat >= 3 ? 5 : 3);
    return (
      <Stage scene="globe">
        <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Komşu ülkeler köprüsü
        </text>
        <circle cx="180" cy="108" r="36" fill="#86efac" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="180" y="114" textAnchor="middle" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
          Türkiye
        </text>
        {neighbors.slice(0, shown).map((name, index) => {
          const angle = (index / 8) * Math.PI * 2 - Math.PI / 2;
          const x = 180 + Math.cos(angle) * 88;
          const y = 108 + Math.sin(angle) * 58;
          return (
            <g key={name}>
              <line x1="180" y1="108" x2={x} y2={y} stroke="#b45309" strokeWidth="1.5" />
              <circle cx={x} cy={y} r="10" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="2" />
              <text x={x} y={y + 28} textAnchor="middle" fill="#0f172a" fontSize="10" fontFamily="inherit" fontWeight="700">
                {name.slice(0, 8)}
              </text>
            </g>
          );
        })}
        <text x="16" y="192" fill="#0369a1" fontSize="12" fontFamily="inherit">
          Sekiz kara komşu · barış ve dayanışma
        </text>
      </Stage>
    );
  }

  const title = climate ? "İklim çeşitliliği" : land ? "Yeryüzü ve bitki" : "Türkiye'nin yeri";
  return (
    <Stage scene="globe">
      <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {title}
      </text>
      <ellipse cx="150" cy="112" rx="92" ry="58" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="1.5" />
      <path
        d="M88 108 C110 78 150 70 190 86 C220 98 230 120 210 138 C180 158 120 152 96 132 C84 122 80 114 88 108 Z"
        fill="#86efac"
        stroke="#cbd5e1"
        strokeWidth="2"
      />
      <text x="132" y="118" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
        Türkiye
      </text>
      {climate || beat >= 3 ? (
        <>
          <text x="260" y="72" fill="#0369a1" fontSize="13" fontFamily="inherit" fontWeight="700">
            Karadeniz
          </text>
          <text x="260" y="100" fill="#b45309" fontSize="13" fontFamily="inherit" fontWeight="700">
            Karasal
          </text>
          <text x="260" y="128" fill="#15803d" fontSize="13" fontFamily="inherit" fontWeight="700">
            Akdeniz
          </text>
          <text x="260" y="156" fill="#7c3aed" fontSize="12" fontFamily="inherit" fontWeight="700">
            Marmara
          </text>
        </>
      ) : null}
      {land ? (
        <text x="16" y="176" fill="#0f172a" fontSize="12" fontFamily="inherit">
          Orman · maki · bozkır · yükselti
        </text>
      ) : (
        <text x="16" y="176" fill="#0369a1" fontSize="12" fontFamily="inherit">
          Üç tarafı deniz · köprü ülke
        </text>
      )}
    </Stage>
  );
}

/** sosyal-9 — Dünya paralel / meridyen küresi (tek konum konusu). */
export function GridScene({ beat, caption }: { beat: number; caption: string }) {
  const relative = /göreceli|sokak|yakın|göre/iu.test(caption) || beat >= 5;
  return (
    <Stage scene="grid">
      <text x="16" y="24" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {relative ? "Göreceli konum" : "Mutlak konum"}
      </text>
      <g data-junior-globe="dunya-enlem-boylam">
        <EarthGrid grid pin={!relative} />
      </g>
      {relative ? (
        <text x="198" y="168" fill="#0369a1" fontSize="12" fontFamily="inherit" fontWeight="700">
          Bir yere göre anlatılır
        </text>
      ) : (
        <text x="198" y="168" fill="#0f172a" fontSize="12" fontFamily="inherit">
          Enlem ve boylam sabittir
        </text>
      )}
    </Stage>
  );
}

/** sosyal-5 Orta Asya; 6–7 İslam / Türk-İslam tarih şeridi. */
export function HistoryScene({ beat, caption }: { beat: number; caption: string }) {
  const text = caption.toLocaleLowerCase("tr-TR");
  const islam = /mekke|medine|hicret|vahiy|halife|emevi|abbasi/.test(text);
  const turkishIslam = /talas|karahan|selçuk|malazgirt|gazne|islamiyet'i kabul/.test(text);
  const mode = islam ? "islam" : turkishIslam ? "turk-islam" : "orta-asya";
  const title =
    mode === "islam"
      ? "İslamiyet tarih şeridi"
      : mode === "turk-islam"
        ? "Türk-İslam tarih şeridi"
        : "Orta Asya Türk devletleri";
  const stops =
    mode === "islam"
      ? ["Mekke 610", "Medine 622", "Yayılış"]
      : mode === "turk-islam"
        ? ["Talas 751", "Karahanlı", "Malazgirt"]
        : ["Asya Hun", "Göktürk", "Uygur"];
  const note =
    mode === "islam"
      ? "Hicret, Hicri takvimin başıdır."
      : mode === "turk-islam"
        ? "Malazgirt, Anadolu kapısıdır."
        : "Mete Han · Orhun · yerleşik hayat";
  const shown = Math.min(stops.length, Math.max(1, beat >= 4 ? 3 : beat >= 2 ? 2 : 1));
  return (
    <Stage scene="history">
      <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {title}
      </text>
      <path d="M40 120 H320" stroke="#b45309" strokeWidth="3" />
      {stops.slice(0, shown).map((name, index) => (
        <g key={name}>
          <circle cx={70 + index * 100} cy={120} r="14" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
          <text x={70 + index * 100} y={158} textAnchor="middle" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
            {name}
          </text>
        </g>
      ))}
      <text x="16" y="188" fill="#0369a1" fontSize="12" fontFamily="inherit">
        {note}
      </text>
    </Stage>
  );
}

/** sosyal-8 İpek Yolu; 20 uluslararası ticaret köprüsü. */
export function CaravanScene({ beat, caption }: { beat: number; caption: string }) {
  const trade = /ithalat|ihracat|sattık|aldık|dış ticaret|liman/iu.test(caption);
  const goods = trade ? ["İhracat", "İthalat", "Kültür"] : ["İpek", "Kâğıt", "Fikir"];
  return (
    <Stage scene="caravan">
      <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {trade ? "Uluslararası ticaret köprüsü" : "İpek Yolu"}
      </text>
      <path d="M28 130 C90 90 160 150 240 100 C280 80 310 90 340 84" fill="none" stroke="#b45309" strokeWidth="3" />
      <rect x="48" y="78" width="70" height="36" rx="8" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx="64" cy="122" r="8" fill="#0f172a" />
      <circle cx="100" cy="122" r="8" fill="#0f172a" />
      {trade ? (
        <>
          <rect x="210" y="48" width="48" height="28" rx="4" fill="#bae6fd" stroke="#cbd5e1" strokeWidth="2" />
          <text x="218" y="68" fill="#0f172a" fontSize="11" fontFamily="inherit" fontWeight="700">
            Liman
          </text>
        </>
      ) : null}
      {goods.slice(0, beat >= 4 ? goods.length : 1).map((name, index) => (
        <text key={name} x={150 + index * 68} y={70} fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
          {name}
        </text>
      ))}
      <text x="16" y="176" fill="#0369a1" fontSize="13" fontFamily="inherit">
        {trade ? "Sattık ihracat, aldık ithalat." : "Kervan mal ile birlikte fikir de taşır."}
      </text>
    </Stage>
  );
}

/**
 * sosyal-4 hak-sorumluluk terazisi; 14 vergi; 15 meslek;
 * 16 demokrasi meclis; 17 anayasa; 18 organlar.
 */
export function AssemblyScene({ beat, caption }: { beat: number; caption: string }) {
  const text = caption.toLocaleLowerCase("tr-TR");
  const tax = /vergi|fiş\b/.test(text);
  const job = /meslek|yetenek|nitelikli/.test(text);
  const law = /anayasa|temel kanun|kural kart/.test(text);
  const democracy = /demokrasi|cumhuriyet|monarşi|29 ekim/.test(text) && !law && !tax && !job;
  const rights = /özgürlük|sorumluluk|yetki|kanat|\bhak\b/.test(text) && !law && !tax && !job && !democracy;

  if (rights) {
    return (
      <Stage scene="assembly">
        <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Hak–sorumluluk terazisi
        </text>
        <line x1="180" y1="48" x2="180" y2="78" stroke="#cbd5e1" strokeWidth="4" />
        <circle cx="180" cy="48" r="6" fill="#0f172a" />
        <line
          x1="70"
          y1={beat >= 3 ? 92 : 86}
          x2="290"
          y2={beat >= 3 ? 86 : 92}
          stroke="#cbd5e1"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <rect x="48" y="96" width="100" height="52" rx="10" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="98" y="128" textAnchor="middle" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
          Hak
        </text>
        <rect x="212" y="96" width="100" height="52" rx="10" fill="#fde68a" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="262" y="128" textAnchor="middle" fill="#0f172a" fontSize="14" fontFamily="inherit" fontWeight="700">
          Sorumluluk
        </text>
        {beat >= 4 ? (
          <text x="180" y="176" textAnchor="middle" fill="#0369a1" fontSize="13" fontFamily="inherit" fontWeight="700">
            Özgürlük, başkasının hakkıyla sınırlanır
          </text>
        ) : (
          <text x="180" y="176" textAnchor="middle" fill="#64748b" fontSize="13" fontFamily="inherit">
            İki kanat birlikte uçar
          </text>
        )}
      </Stage>
    );
  }

  if (democracy) {
    return (
      <Stage scene="assembly">
        <text x="16" y="26" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
          Demokrasi meclis binası
        </text>
        <polygon points="180,48 70,88 290,88" fill="#e0f2fe" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="90" y="88" width="180" height="70" fill="#fff" stroke="#cbd5e1" strokeWidth="1.5" />
        <rect x="150" y="110" width="60" height="48" fill="#fde68a" stroke="#cbd5e1" strokeWidth="2" />
        <text x="180" y="140" textAnchor="middle" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
          TBMM
        </text>
        {beat >= 2 ? (
          <>
            <text x="40" y="188" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
              Seçmek
            </text>
            <text x="148" y="188" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
              Seçilmek
            </text>
            <text x="256" y="188" fill="#0f172a" fontSize="12" fontFamily="inherit" fontWeight="700">
              Söylemek
            </text>
          </>
        ) : (
          <text x="180" y="188" textAnchor="middle" fill="#0369a1" fontSize="12" fontFamily="inherit">
            29 Ekim 1923 · Cumhuriyet
          </text>
        )}
      </Stage>
    );
  }

  const columns = tax
    ? ["Okul", "Yol", "Hastane"]
    : job
      ? ["İlgi", "Yetenek", "Öğrenme"]
      : law
        ? ["Anayasa", "Kanun", "Kural"]
        : ["Yasama", "Yürütme", "Yargı"];
  const title = tax
    ? "Vergi ve vatandaşlık paneli"
    : job
      ? "Meslek seçimi"
      : law
        ? "Anayasa güvencesi"
        : "Devletin organları";
  const foot = tax
    ? "Vergi ceza değildir; ortak paydır."
    : job
      ? "Her meslek kutsaldır."
      : law
        ? "Hiçbir kural anayasaya aykırı olamaz."
        : "Yasama · Yürütme · Yargı ayrıdır.";
  const shown = beat >= 3 ? 3 : beat >= 1 ? 2 : 1;
  return (
    <Stage scene="assembly">
      <text x="16" y="28" fill="#0f172a" fontSize="15" fontFamily="inherit" fontWeight="700">
        {title}
      </text>
      {columns.slice(0, shown).map((name, index) => (
        <g key={name}>
          <rect
            x={36 + index * 108}
            y="58"
            width="88"
            height="78"
            rx="10"
            fill={index === 1 ? "#fde68a" : "#fff"}
            stroke="#cbd5e1"
            strokeWidth="3"
          />
          <text x={80 + index * 108} y="102" textAnchor="middle" fill="#0f172a" fontSize="13" fontFamily="inherit" fontWeight="700">
            {name}
          </text>
        </g>
      ))}
      <text x="16" y="176" fill="#0369a1" fontSize="13" fontFamily="inherit">
        {foot}
      </text>
    </Stage>
  );
}

export function SocialSceneArt({
  scene,
  beat,
  caption,
}: {
  scene: SocialJuniorScene;
  beat: number;
  caption: string;
}) {
  if (scene === "place") return <PlaceScene beat={beat} caption={caption} />;
  if (scene === "culture") return <CultureScene beat={beat} caption={caption} />;
  if (scene === "globe") return <GlobeScene beat={beat} caption={caption} />;
  if (scene === "grid") return <GridScene beat={beat} caption={caption} />;
  if (scene === "history") return <HistoryScene beat={beat} caption={caption} />;
  if (scene === "caravan") return <CaravanScene beat={beat} caption={caption} />;
  return <AssemblyScene beat={beat} caption={caption} />;
}
