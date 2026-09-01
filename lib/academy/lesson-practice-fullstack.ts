/**
 * Full-Stack Temel (FS-101), Orta (FS-102) ve İleri (FS-103) — kod laboratuvarı.
 * Tip sözleşmesi, Fail-closed kapı; innerHTML / as any / ham SQL birleştirme yok.
 */

import type { AcademyLessonPractice } from "@/lib/academy/lesson-body";

function pack(
  params: ReadonlyArray<readonly [string, string]>,
  steps: readonly string[],
  language: string,
  source: string,
): AcademyLessonPractice {
  return {
    params: params.map(([label, value]) => ({ label, value })),
    steps,
    code: { language, source: source.trim() },
  };
}

export const FULLSTACK_TEMEL_PRACTICE: Record<string, AcademyLessonPractice> = {
  "fullstack-temel-1": pack(
    [
      ["DNS", "isim → numara"],
      ["HTTP", "istek-yanıt fişi"],
      ["2xx", "mutfak kabul"],
      ["yasak", "503’te yeşil tik"],
    ],
    [
      "Durum 200 için 2xx sınıfını yaz.",
      "503’te yeşil tik yasağını not et.",
      "DNS çözülmeden istek atılmadığını yaz.",
    ],
    "ts",
    `function httpSinif(durum: number): "2xx" | "4xx" | "5xx" {
  if (!Number.isInteger(durum) || durum < 100 || durum > 599) {
    throw new Error("durum kodu yok; işlem durur");
  }
  if (durum >= 500) return "5xx";
  if (durum >= 400) return "4xx";
  if (durum >= 200 && durum < 300) return "2xx";
  throw new Error("bu fiş kutlama değildir; işlem durur");
}
if (httpSinif(200) !== "2xx") throw new Error("sözleşme kırıldı");
if (httpSinif(503) !== "5xx") throw new Error("sözleşme kırıldı");`,
  ),
  "fullstack-temel-2": pack(
    [
      ["iskelet", "header/main/article"],
      ["Flex", "tek eksen şerit"],
      ["Grid", "satır-sütun"],
      ["yasak", "anlamsız div ormanı"],
    ],
    [
      "Semantik iskeleti yaz.",
      "Flex wrap ve Grid minmax’i not et.",
      "Yalnız div ile teslimi reddet.",
    ],
    "html",
    `<main>
  <article>
    <h1>Günün somunu</h1>
    <p>Stok yazılı durur.</p>
  </article>
</main>`,
  ),
  "fullstack-temel-3": pack(
    [
      ["adet", "tamsayı ≥ 1"],
      ["yuva", "HTMLElement"],
      ["metin", "textContent"],
      ["yasak", "innerHTML + null düğüm"],
    ],
    [
      "Boş adeti reddet.",
      "Yuva yoksa throw yaz.",
      "textContent ile cümle bas.",
    ],
    "ts",
    `function okuAdet(ham: string): number {
  const temiz = ham.trim();
  if (temiz === "") throw new Error("boş adet; işlem durur");
  const adet = Number(temiz);
  if (!Number.isFinite(adet) || !Number.isInteger(adet) || adet < 1) {
    throw new Error("geçersiz adet; işlem durur");
  }
  return adet;
}
if (okuAdet("3") !== 3) throw new Error("sözleşme kırıldı");`,
  ),
  "fullstack-temel-4": pack(
    [
      ["fetch", "await"],
      ["kapı", "res.ok"],
      ["gövde", "unknown → dizi"],
      ["yasak", "map’siz şema"],
    ],
    [
      "!res.ok dalını yaz.",
      "Gövde dizi değilse dur.",
      "Ağ kopunca insan cümlesi bas.",
    ],
    "ts",
    `async function sepetGetir(res: { ok: boolean; status: number; json: () => Promise<unknown> }): Promise<readonly string[]> {
  if (!res.ok) throw new Error("sunucu " + String(res.status) + "; yeşil tik yasak");
  const ham: unknown = await res.json();
  if (!ham || typeof ham !== "object" || !("kalemler" in ham)) {
    throw new Error("beklenmeyen yanıt; işlem durur");
  }
  const kalemler = (ham as { kalemler: unknown }).kalemler;
  if (!Array.isArray(kalemler)) throw new Error("liste yok; işlem durur");
  return kalemler.map(String);
}`,
  ),
  "fullstack-temel-5": pack(
    [
      ["arayüz", "interface"],
      ["adet", "number"],
      ["daralt", "unknown"],
      ["yasak", "as any"],
    ],
    [
      "SepetKalemi interface yaz.",
      "string adeti reddet.",
      "as any kullanma.",
    ],
    "ts",
    `interface SepetKalemi { sku: string; adet: number }
function kalemOku(ham: unknown): SepetKalemi {
  if (!ham || typeof ham !== "object") throw new Error("gövde yok; işlem durur");
  const kayit = ham as Record<string, unknown>;
  if (typeof kayit.sku !== "string" || kayit.sku.trim() === "") {
    throw new Error("sku yok; işlem durur");
  }
  if (typeof kayit.adet !== "number" || !Number.isInteger(kayit.adet) || kayit.adet < 1) {
    throw new Error("adet sayı değil; işlem durur");
  }
  return { sku: kayit.sku, adet: kayit.adet };
}
if (kalemOku({ sku: "A1", adet: 2 }).adet !== 2) throw new Error("sözleşme kırıldı");`,
  ),
  "fullstack-temel-6": pack(
    [
      ["form", "trim + tamsayı"],
      ["meşgul", "disabled"],
      ["liste", "textContent"],
      ["yasak", "boş POST / innerHTML"],
    ],
    [
      "Boş adette return.",
      "disabled ile ikinci tıklamayı yut.",
      "Satırı textContent ile bas.",
    ],
    "ts",
    `function adetDogrula(ham: string): number {
  const temiz = ham.trim();
  if (temiz === "") throw new Error("boş adet; işlem durur");
  const adet = Number(temiz);
  if (!Number.isFinite(adet) || !Number.isInteger(adet) || adet < 1) {
    throw new Error("geçersiz adet; işlem durur");
  }
  return adet;
}
function satirYaz(ad: string): string {
  return ad;
}
if (adetDogrula("2") !== 2) throw new Error("sözleşme kırıldı");
if (satirYaz("somun") !== "somun") throw new Error("sözleşme kırıldı");`,
  ),
};

export const FULLSTACK_ORTA_PRACTICE: Record<string, AcademyLessonPractice> = {
  "fullstack-orta-1": pack(
    [
      ["oda", "bileşen"],
      ["poşet", "props salt okunur"],
      ["iskelet", "JSX"],
      ["yasak", "props.baslik ="],
    ],
    [
      "Boş başlığı reddet.",
      "Props’u yerinde yazma.",
      "Ebeveyn yeni poşet basar.",
    ],
    "ts",
    `function baslikDogrula(ham: string): string {
  const temiz = ham.trim();
  if (temiz === "") throw new Error("başlık yok; işlem durur");
  return temiz;
}
if (baslikDogrula("Kalıp dök") !== "Kalıp dök") throw new Error("sözleşme kırıldı");`,
  ),
  "fullstack-orta-2": pack(
    [
      ["pano", "useState"],
      ["nöbet", "useEffect + iptal"],
      ["form", "value = state"],
      ["yasak", "setN(n+1) bağımlılıkta n"],
    ],
    [
      "Sonsuz etki desenini reddet.",
      "Fonksiyonel setAdet yaz.",
      "Boş trim’de POST çıkarma.",
    ],
    "ts",
    `function baslikDogrula(ham: string): string {
  const temiz = ham.trim();
  if (temiz === "") throw new Error("boş başlık; işlem durur");
  return temiz;
}
function artir(adet: number): number {
  if (!Number.isInteger(adet) || adet < 0) throw new Error("adet yok; işlem durur");
  return adet + 1;
}
if (baslikDogrula("Kalıp") !== "Kalıp") throw new Error("sözleşme kırıldı");
if (artir(2) !== 3) throw new Error("sözleşme kırıldı");`,
  ),
  "fullstack-orta-3": pack(
    [
      ["sıra", "json → doğrula → işleyici"],
      ["POST", "201"],
      ["şema", "400"],
      ["yasak", "body’siz toUpperCase"],
    ],
    [
      "express.json sırasını yaz.",
      "Boş başlıkta 400 not et.",
      "201 oluşturma mührünü bas.",
    ],
    "ts",
    `function gorevOku(ham: unknown): { baslik: string } {
  if (!ham || typeof ham !== "object" || !("baslik" in ham)) {
    throw new Error("gövde yok; işlem durur");
  }
  const baslik = (ham as { baslik: unknown }).baslik;
  if (typeof baslik !== "string" || baslik.trim() === "") {
    throw new Error("başlık yok; işlem durur");
  }
  return { baslik: baslik.trim() };
}
if (gorevOku({ baslik: "Kalıp" }).baslik !== "Kalıp") throw new Error("sözleşme kırıldı");`,
  ),
  "fullstack-orta-4": pack(
    [
      ["defter", "Prisma findUnique"],
      ["parametre", "where: { id }"],
      ["yok", "kayıt yok; dur"],
      ["yasak", "SQL + id birleştirme"],
    ],
    [
      "Ham SQL birleştirmeyi reddet.",
      "findUnique boşsa throw yaz.",
      "create’de trim kapısını bas.",
    ],
    "ts",
    `function idDogrula(ham: unknown): string {
  if (typeof ham !== "string" || ham.trim() === "") {
    throw new Error("id yok; işlem durur");
  }
  return ham.trim();
}
function sqlYapistirYasak(id: string): never {
  throw new Error("ham SQL yasak; işlem durur");
}
if (idDogrula("g-1") !== "g-1") throw new Error("sözleşme kırıldı");
try {
  sqlYapistirYasak("g-1");
} catch (e) {
  if (!(e instanceof Error) || !e.message.includes("yasak")) throw new Error("sözleşme kırıldı");
}`,
  ),
  "fullstack-orta-5": pack(
    [
      ["yaka", "Bearer"],
      ["mühür", "jwt.verify"],
      ["secret", "boşsa dur"],
      ["yasak", "jwt.decode kapısı"],
    ],
    [
      "Secret yoksa throw yaz.",
      "Bearer değilse 401 not et.",
      "decode’u kimlik kapısı sayma.",
    ],
    "ts",
    `function imzaAnahtari(secret: unknown): string {
  if (typeof secret !== "string" || secret.trim() === "") {
    throw new Error("imza anahtarı yok; işlem durur");
  }
  return secret;
}
function bearerOku(header: unknown): string {
  if (typeof header !== "string" || !header.startsWith("Bearer ")) {
    throw new Error("jeton yok; işlem durur");
  }
  const jeton = header.slice("Bearer ".length).trim();
  if (jeton === "") throw new Error("jeton boş; işlem durur");
  return jeton;
}
if (imzaAnahtari("k-1") !== "k-1") throw new Error("sözleşme kırıldı");
if (bearerOku("Bearer abc") !== "abc") throw new Error("sözleşme kırıldı");`,
  ),
  "fullstack-orta-6": pack(
    [
      ["form", "trim + başlık"],
      ["kimlik", "Bearer"],
      ["401", "yeşil yok"],
      ["yasak", "boş POST / decode / ham SQL"],
    ],
    [
      "Boş başlıkta return.",
      "401’de liste uydurma.",
      "Dört kapıyı aynı teslimde tut.",
    ],
    "ts",
    `function baslikDogrula(ham: string): string {
  const temiz = ham.trim();
  if (temiz === "") throw new Error("boş başlık; işlem durur");
  return temiz;
}
function jetonDogrula(jeton: string): string {
  if (jeton.trim() === "") throw new Error("jeton yok; işlem durur");
  return jeton.trim();
}
if (baslikDogrula("Kalıp") !== "Kalıp") throw new Error("sözleşme kırıldı");
if (jetonDogrula("abc") !== "abc") throw new Error("sözleşme kırıldı");`,
  ),
};

export const FULLSTACK_ILERI_PRACTICE: Record<string, AcademyLessonPractice> = {
  "fullstack-ileri-1": pack(
    [
      ["RSC", "sunucu varsayılan"],
      ["eylem", "use server"],
      ["sku", "trim zorunlu"],
      ["yasak", "secret vitrinde"],
    ],
    [
      "Boş sku’da throw yaz.",
      "adet tam sayı < 1’i reddet.",
      "Sırrı istemci bileşenine koyma.",
    ],
    "ts",
    `function skuDogrula(ham: string): string {
  const sku = ham.trim();
  if (sku === "") throw new Error("sku yok; işlem durur");
  return sku;
}
function adetDogrula(adet: unknown): number {
  const n = typeof adet === "number" ? adet : Number(adet);
  if (!Number.isInteger(n) || n < 1) throw new Error("adet yok; işlem durur");
  return n;
}
if (skuDogrula("SOMUN") !== "SOMUN") throw new Error("sözleşme kırıldı");
if (adetDogrula(2) !== 2) throw new Error("sözleşme kırıldı");`,
  ),
  "fullstack-ileri-2": pack(
    [
      ["olay", "siparis.alindi"],
      ["kuyruk", "fiş sözleşmesi"],
      ["devre", "3 hata açık"],
      ["yasak", "bilinmeyen tip"],
    ],
    [
      "Bilinmeyen tipi reddet.",
      "Boş kuyrukta throw yaz.",
      "Üç hatada devreyi aç.",
    ],
    "ts",
    `function yayinla(tip: string, sku: string): string {
  if (tip !== "siparis.alindi") throw new Error("bilinmeyen olay; işlem durur");
  if (sku.trim() === "") throw new Error("sku yok; işlem durur");
  return sku.trim();
}
function cagir(hataSayisi: number): string {
  if (hataSayisi >= 3) throw new Error("devre açık; zincir durur");
  return "stok";
}
if (yayinla("siparis.alindi", "SOMUN") !== "SOMUN") throw new Error("sözleşme kırıldı");
if (cagir(0) !== "stok") throw new Error("sözleşme kırıldı");`,
  ),
  "fullstack-ileri-3": pack(
    [
      ["raf", "Redis Map"],
      ["kacirma", "kaynak sor"],
      ["tavan", "429"],
      ["yasak", "200 boş"],
    ],
    [
      "Boş anahtarı reddet.",
      "Kaçırmada throw yaz.",
      "Tavan dolunca 429 not et.",
    ],
    "ts",
    `const ONBELLEK = new Map<string, string>();
function oku(anahtar: string): string {
  if (anahtar.trim() === "") throw new Error("anahtar yok; işlem durur");
  const deger = ONBELLEK.get(anahtar);
  if (deger === undefined) throw new Error("onbellek yok; kaynak sor");
  return deger;
}
function sinirla(sayac: number, tavan: number): void {
  if (!Number.isInteger(tavan) || tavan < 1 || sayac >= tavan) {
    throw new Error("429 veya tavan yok; işlem durur");
  }
}
ONBELLEK.set("sku:SOMUN", "18");
if (oku("sku:SOMUN") !== "18") throw new Error("sözleşme kırıldı");
sinirla(0, 3);`,
  ),
  "fullstack-ileri-4": pack(
    [
      ["kutu", "Docker"],
      ["plan", "Compose"],
      ["saglik", "PONG"],
      ["yasak", "bos REDIS_URL"],
    ],
    [
      "REDIS_URL boşsa throw yaz.",
      "PONG değilse sağlık durur.",
      "Sırrı imaja gömme.",
    ],
    "ts",
    `function redisUrl(ham: unknown): string {
  if (typeof ham !== "string" || ham.trim() === "") {
    throw new Error("REDIS_URL yok; işlem durur");
  }
  return ham.trim();
}
function saglik(pong: string): "ok" {
  if (pong !== "PONG") throw new Error("redis yok; işlem durur");
  return "ok";
}
if (redisUrl("redis://redis:6379") !== "redis://redis:6379") throw new Error("sözleşme kırıldı");
if (saglik("PONG") !== "ok") throw new Error("sözleşme kırıldı");`,
  ),
  "fullstack-ileri-5": pack(
    [
      ["test", "npm test"],
      ["yayin", "needs: test"],
      ["sır", "secrets"],
      ["yasak", "continue-on-error"],
    ],
    [
      "testGecti false iken throw yaz.",
      "secret yoksa yayın durur.",
      "continue-on-error kullanma.",
    ],
    "ts",
    `function yayinKapisi(testGecti: boolean, secretVar: boolean): "yayin" {
  if (!testGecti) throw new Error("test kırık; yayın yok");
  if (!secretVar) throw new Error("sır yok; yayın yok");
  return "yayin";
}
if (yayinKapisi(true, true) !== "yayin") throw new Error("sözleşme kırıldı");`,
  ),
  "fullstack-ileri-6": pack(
    [
      ["sku", "trim"],
      ["saglik", "PONG"],
      ["tavan", "429"],
      ["yasak", "kırmızı yayın"],
    ],
    [
      "Boş sku’yu reddet.",
      "PONG değilse sağlık durur.",
      "test veya Redis kırmızıysa yayın yok.",
    ],
    "ts",
    `function skuDogrula(ham: string): string {
  const sku = ham.trim();
  if (sku === "") throw new Error("sku yok; işlem durur");
  return sku;
}
function saglik(pong: string): "ok" {
  if (pong !== "PONG") throw new Error("redis yok; işlem durur");
  return "ok";
}
function yayinKapisi(testGecti: boolean, redisOk: boolean): "yayin" {
  if (!testGecti || !redisOk) throw new Error("kapı kırmızı; yayın yok");
  return "yayin";
}
if (skuDogrula("SOMUN") !== "SOMUN") throw new Error("sözleşme kırıldı");
if (saglik("PONG") !== "ok") throw new Error("sözleşme kırıldı");
if (yayinKapisi(true, true) !== "yayin") throw new Error("sözleşme kırıldı");`,
  ),
};
