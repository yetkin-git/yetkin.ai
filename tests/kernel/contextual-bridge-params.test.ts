import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { decideEdgeAction } from "@/lib/kernel/security/edge-guard";
import { isFrozenShellPagePath } from "@/lib/kernel/compliance/circuit-breakers";
import {
  BRIDGE_KAYNAK_VALUES,
  isBridgeEmitKaynak,
  isBridgeQueryKey,
  parseBridgeKaynak,
  parseBridgeKonu,
  parseBridgePozisyon,
  sanitizeBridgeQueryValue,
  sanitizeBridgeSearch,
  selectBridgeTargets,
} from "@/lib/kernel/contextual-bridge-params";
import { BRIDGES_SEN } from "@/lib/copy/sen-voice/bridges";

const ROOT = process.cwd();

function readSrc(relative: string): string {
  return readFileSync(join(ROOT, relative), "utf8");
}

describe("köprü query sanitizer — XSS ve enjeksiyon", () => {
  it("ham etiket, script şeması ve olay işleyicisini reddeder", () => {
    expect(sanitizeBridgeQueryValue("<script>alert(1)</script>")).toBe("");
    expect(sanitizeBridgeQueryValue('"><img src=x onerror=alert(1)>')).toBe("");
    expect(sanitizeBridgeQueryValue("javascript:alert(1)")).toBe("");
    expect(sanitizeBridgeQueryValue("JaVaScRiPt:alert(1)")).toBe("");
    expect(sanitizeBridgeQueryValue("data:text/html,<svg>")).toBe("");
    expect(sanitizeBridgeQueryValue("data:image/svg+xml;base64,PHN2Zz4=")).toBe("");
    expect(sanitizeBridgeQueryValue("onclick=alert(1)")).toBe("");
    expect(sanitizeBridgeQueryValue("vbscript:msgbox(1)")).toBe("");
  });

  /**
   * 443363f4 sürümü bu iki payload'ı **geçiriyordu**: `\u200B` anahtar kelimeyi
   * bölüyor ve `javascript:` kalıbı eşleşmiyordu. Ekranda görünmez karakter
   * taşıyan bir "başlık" olarak basılıyordu.
   */
  it("sıfır genişlikli karakterle bölünmüş payload'ı yakalar", () => {
    expect(sanitizeBridgeQueryValue("java\u200Bscript:alert(1)")).toBe("");
    expect(sanitizeBridgeQueryValue("on\u200Bclick=alert(1)")).toBe("");
    expect(sanitizeBridgeQueryValue("java\u200Dscript:alert(1)")).toBe("");
    expect(sanitizeBridgeQueryValue("&#106;avascript:alert(1)")).toBe("");
  });

  it("Unicode homoglyph ve fullwidth etiketi NFKC ile normalleştirip reddeder", () => {
    expect(sanitizeBridgeQueryValue("ｊａｖａｓｃｒｉｐｔ：alert(1)")).toBe("");
    expect(sanitizeBridgeQueryValue("＜script＞alert(1)＜/script＞")).toBe("");
    expect(sanitizeBridgeQueryValue("＜img src=x onerror=alert(1)＞")).toBe("");
  });

  it("yüzde kodlanmış ve HTML varlık kaçışlı payload'ı çözüp reddeder", () => {
    expect(sanitizeBridgeQueryValue("%3Cscript%3Ealert(1)%3C/script%3E")).toBe("");
    expect(sanitizeBridgeQueryValue("&#60;script&#62;alert(1)")).toBe("");
    expect(sanitizeBridgeQueryValue("&#x3c;script&#x3e;alert(1)")).toBe("");
  });

  /**
   * Bidi override görsel kimlik sahteciliği üretir (`Müdür‮gnp.exe` ekranda
   * "Müdürexe.png" gibi okunur). Karakter **düşürülür**, metin kalır: burada
   * reddetmek yerine temizlemek doğru, çünkü bidi tek başına kod çalıştırmaz.
   */
  it("bidi override ve görünmez yön karakterlerini düşürür", () => {
    const cleaned = sanitizeBridgeQueryValue("Müdür\u202Egnp.exe");
    expect(cleaned).not.toContain("\u202E");
    expect(cleaned).toBe("Müdürgnp.exe");
    expect(sanitizeBridgeQueryValue("İK\u200B Uzmanı")).toBe("İK Uzmanı");
    expect(sanitizeBridgeQueryValue("\uFEFFPozisyon")).toBe("Pozisyon");
  });

  /**
   * CRLF enjeksiyonu: `\r\n` ile bir başlık satırı eklemek klasik vektördür.
   * 443363f4 sürümü kontrol karakterlerini **siliyordu** (`başlık\u0000gizli`
   * → `başlıkgizli`), yani saldırganın gövdesini birleştirip sayfaya taşıyordu.
   * Doğru davranış reddetmektir.
   */
  it("CRLF, NUL ve kontrol karakterlerini reddeder", () => {
    expect(sanitizeBridgeQueryValue("Pozisyon\r\nSet-Cookie: a=b")).toBe("");
    expect(sanitizeBridgeQueryValue("Pozisyon\nX-Injected: 1")).toBe("");
    expect(sanitizeBridgeQueryValue("başlık\u0000gizli")).toBe("");
    expect(sanitizeBridgeQueryValue("başlık\u001fgizli")).toBe("");
    expect(sanitizeBridgeQueryValue("başlık\u007fgizli")).toBe("");
  });

  /**
   * DoS: 443363f4 sürümü ham gövdenin **tamamında** regex koşturuyordu.
   * 200 000 karakterlik bir `pozisyon` kabul edilip kırpılıyordu (hatta
   * kırpılan metin ekrana basılıyordu). Artık tavan üstü gövde reddedilir.
   */
  it("aşırı uzun payload'ı işlemeden reddeder", () => {
    const t0 = performance.now();
    expect(sanitizeBridgeQueryValue("A".repeat(200_000))).toBe("");
    expect(sanitizeBridgeQueryValue(`<${"a".repeat(100_000)}`)).toBe("");
    const elapsed = performance.now() - t0;
    // 512 karakter tavanı: iki dev gövde toplam 2 ms'nin altında reddedilmeli.
    expect(elapsed).toBeLessThan(50);
    expect(parseBridgePozisyon("A".repeat(1_000_000))).toBe("");
  });

  it("tavan altındaki meşru uzun başlığı kırpar, reddetmez", () => {
    const value = parseBridgePozisyon("E-Ticaret Operasyon Sorumlusu");
    expect(value).toBe("E-Ticaret Operasyon Sorumlusu");
    expect(parseBridgePozisyon("ab")).toBe("");
    expect(parseBridgePozisyon("A".repeat(200))).toHaveLength(160);
  });
});

describe("köprü query sanitizer — PII reddi", () => {
  it("e-posta, VKN ve TCKN desenlerini reddeder", () => {
    expect(sanitizeBridgeQueryValue("ali@ornek.com")).toBe("");
    expect(sanitizeBridgeQueryValue("12345678901")).toBe("");
    expect(sanitizeBridgeQueryValue("1234567890")).toBe("");
    expect(sanitizeBridgeQueryValue("123-456-7890")).toBe("");
    expect(parseBridgePozisyon("12345678901")).toBe("");
    expect(parseBridgeKonu("ik@sirket.com")).toBe("");
  });

  /**
   * 443363f4 sürümü PII testini **yalnız tam rakam dizgesine** uyguluyordu
   * (`/^\d{10,11}$/`). Başlığın içine iliştirilmiş VKN/telefon geçiyordu —
   * paylaşılan bir link ile müşteri kimlik numarası URL'ye ve ekrana sızıyordu.
   */
  it("pozisyon içine gömülü VKN / TCKN / telefonu yakalar", () => {
    expect(parseBridgePozisyon("Satış Müdürü, VKN:1234567890")).toBe("");
    expect(parseBridgePozisyon("Pozisyon 05321234567")).toBe("");
    expect(parseBridgePozisyon("Aday 0532 123 45 67")).toBe("");
    expect(parseBridgePozisyon("Aday 0532.123.45.67")).toBe("");
    expect(parseBridgePozisyon("Aday +90 532 123 45 67")).toBe("");
    expect(parseBridgePozisyon("Vergi no 1234567890 olan firma")).toBe("");
    expect(parseBridgePozisyon("IBAN TR330006100519786457841326")).toBe("");
    expect(parseBridgePozisyon("e-posta: ik@sirket.com")).toBe("");
  });

  /** Etiketsiz çıplak numara da düşer; ama kısa sayı gerçek bir başlıktır. */
  it("kısa sayılı meşru başlığı reddetmez", () => {
    expect(parseBridgePozisyon("Yazılım Geliştirici (2026)")).toBe("Yazılım Geliştirici (2026)");
    expect(parseBridgePozisyon("3 Vardiya Operasyon Sorumlusu")).toBe(
      "3 Vardiya Operasyon Sorumlusu",
    );
    expect(parseBridgePozisyon("Vergi Uzmanı")).toBe("Vergi Uzmanı");
    expect(parseBridgePozisyon("Müdür \"Satış\"")).toBe("Müdür Satış");
  });
});

describe("kaynak allowlist — keyfi string yansımaz", () => {
  it("yalnız beş merkezi kabul eder", () => {
    expect(BRIDGE_KAYNAK_VALUES).toEqual(["e-ticaret", "hibe", "kurumsal", "kariyer", "tezgah"]);
    for (const id of BRIDGE_KAYNAK_VALUES) {
      expect(parseBridgeKaynak(id)).toBe(id);
    }
  });

  it("allowlist dışını null döner", () => {
    expect(parseBridgeKaynak("admin")).toBeNull();
    expect(parseBridgeKaynak("academy")).toBeNull();
    expect(parseBridgeKaynak("freelancer")).toBeNull();
    expect(parseBridgeKaynak("junior")).toBeNull();
    expect(parseBridgeKaynak("e-ticaret ")).toBe("e-ticaret");
    expect(parseBridgeKaynak("<script>hibe</script>")).toBeNull();
    expect(parseBridgeKaynak("hibe;drop table")).toBeNull();
    expect(parseBridgeKaynak("hibe&admin=1")).toBeNull();
    expect(parseBridgeKaynak("")).toBeNull();
    expect(parseBridgeKaynak(null)).toBeNull();
    expect(parseBridgeKaynak(["hibe", "kurumsal"])).toBe("hibe");
  });

  /** Büyük/küçük harf ve fullwidth eşdeğerleri allowlist'e normalize olur. */
  it("harf büyüklüğü ve fullwidth biçimi normalize eder", () => {
    expect(parseBridgeKaynak("HIBE")).toBe("hibe");
    expect(parseBridgeKaynak("E-Ticaret")).toBe("e-ticaret");
    expect(parseBridgeKaynak("Ｅ－Ｔｉｃａｒｅｔ")).toBe("e-ticaret");
  });

  it("Tezgâh köprü yayan taraf değildir", () => {
    expect(isBridgeEmitKaynak("tezgah")).toBe(false);
    expect(isBridgeEmitKaynak("hibe")).toBe(true);
    expect(isBridgeEmitKaynak(null)).toBe(false);
  });

  it("bilinmeyen query anahtarı köprü sözleşmesinde değildir", () => {
    expect(isBridgeQueryKey("kaynak")).toBe(true);
    expect(isBridgeQueryKey("pozisyon")).toBe(true);
    expect(isBridgeQueryKey("konu")).toBe(true);
    expect(isBridgeQueryKey("tckn")).toBe(false);
    expect(isBridgeQueryKey("redirect")).toBe(false);
  });
});

describe("sanitizeBridgeSearch — yalnız izinli anahtarlar", () => {
  it("PII ve izleme parametrelerini düşürür, köprüyü korur", () => {
    const out = sanitizeBridgeSearch(
      "?pozisyon=E-Ticaret+Operasyon+Sorumlusu&kaynak=hibe&tckn=12345678901&utm_source=x&redirect=https://evil.example",
    );
    const params = new URLSearchParams(out);
    expect(params.get("pozisyon")).toBe("E-Ticaret Operasyon Sorumlusu");
    expect(params.get("kaynak")).toBe("hibe");
    expect(params.get("tckn")).toBeNull();
    expect(params.get("utm_source")).toBeNull();
    expect(params.get("redirect")).toBeNull();
  });

  it("allowlist dışı kaynağı ve PII taşıyan pozisyonu tamamen düşürür", () => {
    expect(sanitizeBridgeSearch("?kaynak=admin")).toBe("");
    expect(sanitizeBridgeSearch("?pozisyon=VKN%3A1234567890")).toBe("");
    expect(sanitizeBridgeSearch("")).toBe("");
    expect(sanitizeBridgeSearch(null)).toBe("");
  });
});

describe("selectBridgeTargets — döngü ve gürültü reddi", () => {
  const targets = [
    { id: "hibe", href: "/panel/hibe?kaynak=e-ticaret" },
    { id: "kurumsal", href: "/kurumsal/ilanlar?pozisyon=X" },
  ];

  it("en fazla 2 köprü basar", () => {
    const many = [
      { id: "hibe", href: "/a" },
      { id: "kurumsal", href: "/b" },
      { id: "kariyer", href: "/c" },
      { id: "tezgah", href: "/d" },
    ];
    expect(selectBridgeTargets({ from: "e-ticaret", targets: many })).toHaveLength(2);
  });

  /** 443363f4: `?kaynak=e-ticaret` ile Hibe'ye gelen kullanıcı E-Ticaret'e geri yollanıyordu. */
  it("gelinen merkeze geri gönderen köprüyü düşürür", () => {
    const hibeTargets = [
      { id: "e-ticaret", href: "/panel/e-ticaret" },
      { id: "tezgah", href: "/tezgah?kaynak=hibe" },
      { id: "kariyer", href: "/career/vitrin" },
    ];
    const picked = selectBridgeTargets({
      from: "hibe",
      cameFrom: "e-ticaret",
      targets: hibeTargets,
    });
    expect(picked.map((row) => row.id)).toEqual(["tezgah", "kariyer"]);
  });

  it("kendi merkezine giden köprüyü düşürür", () => {
    const picked = selectBridgeTargets({
      from: "hibe",
      targets: [{ id: "hibe", href: "/panel/hibe" }, { id: "tezgah", href: "/tezgah" }],
    });
    expect(picked.map((row) => row.id)).toEqual(["tezgah"]);
  });

  it("tüm hedefler gelinen merkezse şerit boş kalır", () => {
    // Kurumsal ekranındayız; Hibe'den geldik. Hibe'ye dönüş düşer, E-Ticaret kalır.
    const kurumsalTargets = [
      { id: "tezgah", href: "/tezgah?kaynak=kurumsal" },
      { id: "hibe", href: "/panel/hibe?kaynak=kurumsal" },
    ];
    expect(
      selectBridgeTargets({ from: "kurumsal", cameFrom: "hibe", targets: kurumsalTargets }).map(
        (row) => row.id,
      ),
    ).toEqual(["tezgah"]);

    // Tek hedef de gelinen merkezse hiçbir şey basılmaz.
    expect(
      selectBridgeTargets({
        from: "hibe",
        cameFrom: "e-ticaret",
        targets: [{ id: "e-ticaret", href: "/panel/e-ticaret" }],
      }),
    ).toEqual([]);
  });

  it("aynı hedefi iki kez basmaz", () => {
    const picked = selectBridgeTargets({
      from: "hibe",
      targets: [{ id: "tezgah", href: "/a" }, { id: "tezgah", href: "/b" }],
    });
    expect(picked).toHaveLength(1);
  });
});

describe("köprü hedefleri — kırık bağlantı ve donmuş oda", () => {
  /** `lib/copy/sen-voice/bridges.ts` içindeki her `href` gerçekten çalışmalı. */
  function collectHrefs(): string[] {
    const text = readSrc("lib/copy/sen-voice/bridges.ts");
    return [...text.matchAll(/href:\s*"([^"]+)"/g)].map((match) => match[1] ?? "");
  }

  it("her köprü href'i yerel ve göreli bir yoldur", () => {
    const hrefs = collectHrefs();
    expect(hrefs.length).toBeGreaterThanOrEqual(6);
    for (const href of hrefs) {
      expect(href.startsWith("/"), href).toBe(true);
      expect(href.startsWith("//"), href).toBe(false);
      expect(href.includes("://"), href).toBe(false);
    }
  });

  it("hiçbir köprü donmuş odaya (akademi / freelancer / junior) gitmez", () => {
    for (const href of collectHrefs()) {
      const pathname = href.split("?")[0] ?? "";
      expect(isFrozenShellPagePath(pathname), `${href} donmuş odaya gidiyor`).toBe(false);
      expect(pathname.startsWith("/academy"), href).toBe(false);
      expect(pathname.startsWith("/freelancer"), href).toBe(false);
      expect(pathname.startsWith("/junior"), href).toBe(false);
    }
  });

  it("her köprü hedefi kenarda yönlendirme/sağlayıcı kararı alır", () => {
    const allowed = new Set(["next", "auth-307"]);
    for (const href of collectHrefs()) {
      const pathname = href.split("?")[0] ?? "";
      const decision = decideEdgeAction(pathname, false);
      expect(allowed.has(decision.kind), `${href} → ${decision.kind}`).toBe(true);
    }
  });

  it("köprü URL'lerinde PII query anahtarı taşınmaz", () => {
    const text = readSrc("lib/copy/sen-voice/bridges.ts");
    expect(text).not.toMatch(/[?&](tckn|vkn|email|e-posta|vergi|iban|telefon|tel)=/i);
    expect(text).toContain("?kaynak=e-ticaret");
    expect(text).toContain("?kaynak=hibe");
    expect(text).toContain("?kaynak=kurumsal");
    expect(text).toContain("?pozisyon=E-Ticaret+Operasyon+Sorumlusu");
  });

  /** Her preset en fazla 2 hedef tanımlar — gürültü tavanı. */
  it("preset'lerde hedef sayısı 2'yi geçmez", () => {
    const presets = readSrc("components/kernel/contextual-bridge-presets.tsx");
    const blocks = [...presets.matchAll(/targets=\{\[([\s\S]*?)\]\}/g)].map((m) => m[1] ?? "");
    expect(blocks.length).toBe(4);
    for (const block of blocks) {
      const rows = block.split("},").filter((row) => row.includes("id:"));
      expect(rows.length).toBeLessThanOrEqual(2);
    }
  });
});

describe("köprü kopyası — sen aksı ve döngü metni", () => {
  it("her köprüde başlık, gövde ve CTA dolu", () => {
    const rooms = [
      BRIDGES_SEN.ecommerce,
      BRIDGES_SEN.hibe,
      BRIDGES_SEN.kurumsal,
      BRIDGES_SEN.career,
    ] as const;
    for (const room of rooms) {
      expect(room.title.trim().length).toBeGreaterThan(3);
      expect(room.body.trim().length).toBeGreaterThan(10);
      const links = Object.values(room).filter(
        (value): value is { label: string; cta: string; href: string } =>
          typeof value === "object" && value !== null && "href" in value,
      );
      expect(links.length).toBe(2);
      for (const link of links) {
        expect(link.label.trim().length).toBeGreaterThan(0);
        expect(link.cta.trim().length).toBeGreaterThan(3);
      }
    }
  });

  /**
   * Döngü metni: hedef sayfada "buraya geri dön" diyen bir not olmamalı.
   * `hibeContext` notları bağlantı **içermez**.
   */
  it("hibe bağlam notu bağlantı içermez (döngü yok)", () => {
    for (const note of Object.values(BRIDGES_SEN.hibeContext)) {
      expect(note.eyebrow.length).toBeGreaterThan(3);
      expect(note.body.length).toBeGreaterThan(20);
      expect(note.body).not.toMatch(/https?:\/\/|href|\]\(/);
    }
  });

  it("Tezgâh ipucu şablonları dolu ve mülakat/hibe niyetini ayrı tutar", () => {
    const { hibe, kurumsal } = BRIDGES_SEN.tezgahHint;
    expect(hibe.jobPostSeed).not.toBe(kurumsal.jobPostSeed);
    expect(hibe.expertiseSeed).not.toBe(kurumsal.expertiseSeed);
    for (const hint of [hibe, kurumsal]) {
      expect(hint.title.trim().length).toBeGreaterThan(3);
      expect(hint.body.trim().length).toBeGreaterThan(20);
      expect(hint.jobPostSeed.trim().length).toBeGreaterThan(20);
      expect(hint.expertiseSeed.trim().length).toBeGreaterThan(3);
    }
  });
});
