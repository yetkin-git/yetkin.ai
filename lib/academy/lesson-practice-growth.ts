/**
 * Büyüme SKU laboratuvarları — dört yetkinlik yolu.
 */

import type { AcademyLessonPractice } from "@/lib/academy/lesson-body";
import { PYTHON_PATHWAY_PRACTICE } from "@/lib/academy/lesson-practice-python";

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

const PYTHON_GROWTH_PRACTICE: Record<string, AcademyLessonPractice> = {
  "python-temel-7": pack(
    [
      ["liste", "[a, b, c]"],
      ["indeks", "0 tabanlı"],
      ["son", "sepet[-1]"],
      ["yasak", "sepet[len(sepet)]"],
    ],
    ["sepet = [\"elma\", \"armut\", \"ayva\"] yaz.", "sepet[-1] ile son elemanı oku.", "IndexError üreten satırı yorum satırına al."],
    "py",
    `sepet = ["elma", "armut", "ayva"]
assert sepet[0] == "elma"
assert sepet[-1] == "ayva"
# sepet[len(sepet)]  → IndexError`,
  ),
  "python-temel-8": pack(
    [
      ["sözlük", "{anahtar: değer}"],
      ["yokluk", ".get"],
      ["üyelik", "in"],
      ["yasak", "eksik anahtarda []"],
    ],
    ["stok sözlüğünü yaz.", "stok.get(\"armut\", 0) dene.", "KeyError üreten satırı yorumla."],
    "py",
    `stok = {"elma": 4}
assert stok.get("armut", 0) == 0
assert "elma" in stok
# stok["armut"]  → KeyError`,
  ),
  "python-temel-9": PYTHON_PATHWAY_PRACTICE["python-orta-5"]!,
  "python-temel-10": PYTHON_PATHWAY_PRACTICE["python-orta-1"]!,
  "python-temel-11": PYTHON_PATHWAY_PRACTICE["python-orta-4"]!,
  "python-temel-12": PYTHON_PATHWAY_PRACTICE["python-orta-8"]!,
};

const FULLSTACK_PRACTICE: Record<string, AcademyLessonPractice> = {
  "fullstack-temel-1": pack(
    [["yöntem", "GET"], ["durum", "200 / 4xx / 5xx"], ["gövde", "JSON"], ["yasak", "fişsiz yeşil tik"]],
    ["Ağ sekmesinde bir GET’in durum kodunu oku.", "2xx ile 5xx farkını tek cümlede yaz.", "Ekran yeşilken 5xx varsa yalanı işaretle."],
    "http",
    `GET /api/cart
HTTP/1.1 200 OK
{"items":[]}`,
  ),
  "fullstack-temel-2": pack(
    [["adet", "number"], ["metin adet", "string"], ["dönüşüm", "Number"], ["yasak", "\"3\" + 1"]],
    ["adet = \"3\" tuzağını yaz.", "Number(adet) ile düzelt.", "typeof ile cins doğrula."],
    "ts",
    `const adetMetin = "3";
const adet = Number(adetMetin);
if (!Number.isFinite(adet)) throw new Error("geçersiz adet");`,
  ),
  "fullstack-temel-3": pack(
    [["arayüz", "interface"], ["qty", "number"], ["derleme", "tsc"], ["yasak", "as any"]],
    ["CartItem interface yaz.", "string qty’yi reddet.", "as any kullanma."],
    "ts",
    `interface CartItem { sku: string; qty: number }
const item: CartItem = { sku: "A1", qty: 2 };`,
  ),
  "fullstack-temel-4": pack(
    [["olay", "click"], ["meşgul", "disabled"], ["metin", "textContent"], ["yasak", "çift tıklama"]],
    ["loading iken disabled = true yap.", "Tek durum metni bas.", "İkinci tıklamanın yutulduğunu not et."],
    "ts",
    `button.disabled = loading;
status.textContent = loading ? "Gönderiliyor" : "Hazır";`,
  ),
  "fullstack-temel-5": pack(
    [["fetch", "await"], ["kapı", "res.ok"], ["hata", "dürüst cümle"], ["yasak", "503’te yeşil"]],
    ["!res.ok dalını yaz.", "Durum kodunu ekrana bas.", "Yeşil sınıf ekleme."],
    "ts",
    `const res = await fetch("/api/cart", { method: "POST" });
if (!res.ok) {
  status.textContent = \`Sunucu \${res.status}\`;
}`,
  ),
  "fullstack-temel-6": pack(
    [["qty", "finite number"], ["form", "controlled"], ["istek", "yalnız geçerli"], ["yasak", "boş Post"]],
    ["Boş qty’de return.", "Number.isFinite kontrolü koy.", "!res.ok dürüst bas."],
    "ts",
    `if (!Number.isFinite(qty) || qty < 1) return;
const res = await fetch("/api/cart/items", { method: "POST" });
if (!res.ok) throw new Error(String(res.status));`,
  ),
  "fullstack-temel-7": pack(
    [["props", "salt okunur"], ["ebeveyn", "state"], ["çocuk", "gösterim"], ["yasak", "props mutasyonu"]],
    ["ProductCard Props tipi yaz.", "title’ı çocukta atama.", "onRename yukarı taşı."],
    "tsx",
    `type Props = { title: string; onRename: (v: string) => void };
function Card({ title, onRename }: Props) {
  return <button type="button" onClick={() => onRename(title)}>{title}</button>;
}`,
  ),
  "fullstack-temel-8": pack(
    [["faz", "idle|submitting|success|error"], ["SSOT", "tek değer"], ["yasak", "üç bayrak"]],
    ["Faz birliğini yaz.", "SUBMIT yalnız idle’dan çıksın.", "Çelişen bayrağı reddet."],
    "ts",
    `type Phase = "idle" | "submitting" | "success" | "error";
function canSubmit(phase: Phase) { return phase === "idle"; }`,
  ),
  "fullstack-temel-9": pack(
    [["adres", "/cart"], ["sayfa", "app/cart/page"], ["boş", "dürüst"], ["yasak", "boşken başarı"]],
    ["Boş sepet metnini yaz.", "Ödeme başarılı şablonunu reddet.", "Link ile /cart bağla."],
    "tsx",
    `export default function CartPage({ empty }: { empty: boolean }) {
  if (empty) return <p>Sepet boş.</p>;
  return <p>Satırlar duruyor.</p>;
}`,
  ),
  "fullstack-temel-10": pack(
    [["sıra", "json → validate → handler"], ["Zod", "safeParse"], ["400", "issues"], ["yasak", "şemasız 200"]],
    ["safeParse başarısızken 400 dön.", "qty: -1 örneğini yaz.", "Handler’ı şemadan sonraya koy."],
    "ts",
    `const parsed = schema.safeParse(req.body);
if (!parsed.success) return res.status(400).json({ issues: parsed.error.issues });`,
  ),
  "fullstack-temel-11": pack(
    [["parametre", "$1"], ["bağ", "params"], ["yasak", "birleştirmeli SQL"], ["CHECK", "qty > 0"]],
    ["$1 örnek satırı yaz.", "Birleştirmeli sorguyu reddet.", "Repo katmanına taşı."],
    "sql",
    `SELECT * FROM cart_items WHERE user_id = $1`,
  ),
  "fullstack-temel-12": pack(
    [["Zod", "şema"], ["tx", "BEGIN"], ["test", "TestClient"], ["yasak", "ok:true 5xx"]],
    ["Dört kapanış maddesini listele.", "5xx’te ok:true reddet.", "Test üçlüsünü yaz."],
    "ts",
    `// Zod + parametre + işlem birimi + TestClient
expect(res.status).not.toBe(500);`,
  ),
};

const AI_PRACTICE: Record<string, AcademyLessonPractice> = {
  "ai-temel-1": pack(
    [["token", "parça"], ["pencere", "tavan"], ["yasak", "sessiz özet"], ["iş", "böl veya yaz"]],
    ["Pencere dolunca ne yapılmayacağını yaz.", "İş bölme cümlesi ekle.", "Sessiz özeti reddet."],
    "txt",
    `tavan doldu → özet uydurma
tavan doldu → işi böl veya belleği dışarı yaz`,
  ),
  "ai-temel-2": pack(
    [["sistem", "yasa"], ["kullanıcı", "iş"], ["biçim", "kalıp"], ["yasak", "tek paragrafa yığmak"]],
    ["Üç katmanı ayrı satır yaz.", "Sır yasağını sisteme koy.", "İş cümlesini kullanıcıya koy."],
    "txt",
    `sistem: sır yapıştırma
kullanıcı: tabloyu özetle
biçim: üç madde + kaynak`,
  ),
  "ai-temel-3": pack(
    [["JSON", "şema"], ["parse", "kapı"], ["yasak", "JSON gibi yaz"], ["FAIL", "geçersiz ceyson"]],
    ["Şema satırı yaz.", "Parse başarısızken dur.", "«JSON gibi» cümlesini reddet."],
    "json",
    `{"ok": true, "items": []}`,
  ),
  "ai-temel-4": pack(
    [["örnek", "sabit"], ["kabul", "ölçü"], ["yasak", "değişen ilham"], ["beğeni", "tur değil"]],
    ["İki sabit örnek yaz.", "Kabul ölçütünü bir satırda yaz.", "Beğeniyi tur sayma."],
    "txt",
    `örnek1: {sku, qty}
örnek2: {sku, qty}
kabul: alanlar dolu, yasak yok`,
  ),
  "ai-temel-5": pack(
    [["sır", "anahtar/PII"], ["FAIL", "üretim yok"], ["yasak", "ortasını uydur"], ["log", "sır yok"]],
    ["Tarife anahtar yapıştırma kuralını yaz.", "Yasak iğnede dur.", "Log’a sır koyma."],
    "txt",
    `sır görünce üretim = kapalı
orta değer uydurma = yasak`,
  ),
  "ai-temel-6": pack(
    [["girdi", "doğrula"], ["parse", "try"], ["yeniden", "sor"], ["yasak", "çök"]],
    ["Geçersiz ceyson’da mesaj bas.", "Döngüyle yeniden sor.", "Boş girdide üretme."],
    "py",
    `import json
ham = input("ceyson: ")
try:
    json.loads(ham)
except json.JSONDecodeError:
    print("Lütfen şemaya uyan çıktı ver.")`,
  ),
  "ai-temel-7": pack(
    [["birim", "yazılı"], ["payda", "yazılı"], ["FAIL", "tablo yok"], ["yasak", "uydurma yüzde"]],
    ["Soru sözleşmesini üç satır yaz.", "Tablo yokken üretimi kes.", "Paydasız yüzde reddet."],
    "txt",
    `birim: kuruş
payda: tamamlanan sipariş
FAIL: tablo yok`,
  ),
  "ai-temel-8": pack(
    [["eksik", "cehalet"], ["sıfır", "iddiadır"], ["tip", "int64"], ["yasak", "fillna(0) kör"]],
    ["Boş tutarı 0 yapmama gerekçesi yaz.", "dtype kontrolü ekle.", "Tekrar satırı düş."],
    "py",
    `eksik = df["amount_kurus"].isna().sum()
assert df["amount_kurus"].dtype == "int64" or eksik > 0`,
  ),
  "ai-temel-9": pack(
    [["n", "dipnot"], ["payda", "yazılı"], ["3D pasta", "red"], ["yasak", "küçük n yüzde"]],
    ["n=8 yüzde yasağını yaz.", "Payda satırı ekle.", "Süs grafiği reddet."],
    "txt",
    `metrik: tamamlanma_orani
payda: assigned_count
n: dipnot`,
  ),
  "ai-temel-10": pack(
    [["getirici", "önce"], ["üretim", "sonra"], ["boş", "sus"], ["yasak", "genel bilgi doldur"]],
    ["Getirici boşken dur.", "Kaynak satırı iste.", "Wikipedia üslubunu reddet."],
    "txt",
    `retriever boş → "belgede yok"
kaynak yok → üretim yok`,
  ),
  "ai-temel-11": pack(
    [["eşik", "skor"], ["alıntı", "parça id"], ["FAIL", "eşik altı"], ["yasak", "benzer bir şey vardı"]],
    ["Eşik altı kuralını yaz.", "Alıntı kimliği ekle.", "Tahmini doldurmayı reddet."],
    "txt",
    `skor < eşik → belgede yok
alıntı yok → iddia yok`,
  ),
  "ai-temel-12": pack(
    [["PDF", "yükle"], ["RAG", "getir"], ["alıntı", "zorunlu"], ["PII", "tarife girmez"]],
    ["Dört kabul maddesini yaz.", "Kaynaksız özeti reddet.", "Sır yasağını tekrarla."],
    "txt",
    `şema + temizlik + getiri + alıntı
eksik halka → teslim yok`,
  ),
};

const UX_PRACTICE: Record<string, AcademyLessonPractice> = {
  "ux-temel-1": pack(
    [["UX", "yol/acı"], ["UI", "yüz"], ["yasak", "beğeniyi kabul saymak"], ["görev", "tamamlanır"]],
    ["Bir görev cümlesi yaz.", "Bir süs cümlesi yaz.", "Hangisinin UX olduğunu işaretle."],
    "txt",
    `görev: üç adımda ödemeyi bitir
süs: mor gölge hoş`,
  ),
  "ux-temel-2": pack(
    [["soru", "yönsüz"], ["görüşme", "dinle"], ["bulgu", "not"], ["yasak", "içerideki zevk"]],
    ["Yönlendirici olmayan bir soru yaz.", "«güzel değil mi» tuzağını reddet.", "Bir bulgu satırı ekle."],
    "txt",
    `soru: ödemeyi nerede aradın?
bulgu: fiyat menüde yok`,
  ),
  "ux-temel-3": pack(
    [["persona", "kanıtlı yüz"], ["yolculuk", "adımlar"], ["acı", "kırılan iş"], ["yasak", "stok fotoğraf masalı"]],
    ["Acı noktasını bir cümlede yaz.", "Yolculukta ödeme adımını atlama.", "Sahte yaşı sil."],
    "txt",
    `yüz: kasiyer, gece vardiyası
acı: ödeme üç dakikada bulunmuyor`,
  ),
  "ux-temel-4": pack(
    [["etiket", "kullanıcı dili"], ["grup", "raf"], ["kart", "sıralama"], ["yasak", "organigram menü"]],
    ["İnsan dilinde bir etiket yaz.", "Şirket jargonunu reddet.", "Bir grup adı ekle."],
    "txt",
    `etiket: Fiyat
yasak: Teklif yönetimi`,
  ),
  "ux-temel-5": pack(
    [["tel", "gri kutu"], ["öncelik", "birincil eylem"], ["yasak", "erken palet"], ["sadakat", "düşük"]],
    ["Birincil eylemi yaz.", "Rengi tel çerçeveden çıkar.", "Akış sorusunu not et."],
    "txt",
    `birincil: Satın Al
iskelet: gri kutu, palet yok`,
  ),
  "ux-temel-6": pack(
    [["frame", "sahne"], ["auto layout", "dizilim"], ["component", "kalıp"], ["yasak", "kopyala-yapıştır düğme"]],
    ["Üç Figma kuralı yaz.", "Ana bileşen güncellemesini not et.", "El ile piksel itmeyi reddet."],
    "txt",
    `frame + auto layout + component
kopyalanmış düğme = borç`,
  ),
  "ux-temel-7": pack(
    [["bulgu", "defter"], ["IA", "raf"], ["wire", "iskelet"], ["Figma", "kalıp"]],
    ["Dört halkayı sırayla yaz.", "Figma-only teslimi reddet.", "Bir işe bağla."],
    "txt",
    `bulgu → bilgi mimarisi → tel çerçeve → Figma
eksik halka → teslim yok`,
  ),
  "ux-temel-8": pack(
    [["odak", "tek birincil"], ["ızgara", "8px"], ["yasak", "her kutu bağırır"], ["ritim", "yazılı"]],
    ["Birincil / ikincil / üçüncül yaz.", "Üç birincil düğmeyi reddet.", "8px ritmini not et."],
    "txt",
    `birincil: Satın Al
ikincil: İncele
üçüncül: Paylaş`,
  ),
  "ux-temel-9": pack(
    [["renk", "token"], ["boşluk", "token"], ["tipo", "token"], ["yasak", "ekrana özel hex"]],
    ["Üç jeton adı yaz.", "Serbest hex’i reddet.", "Tema değişimini not et."],
    "txt",
    `color-text
space-4
font-lg`,
  ),
  "ux-temel-10": pack(
    [["prototype", "tıklanır"], ["görev", "ölçülür"], ["yasak", "statik slayt akış"], ["hata", "not"]],
    ["Üç ekranlı senaryo yaz.", "Bir görev ölçütü ekle.", "Slaytı akış sayma."],
    "txt",
    `görev: sepete ekle, öde
ölçüt: süre + hata sayısı`,
  ),
  "ux-temel-11": pack(
    [["kontrast", "eşik"], ["odak", "halka"], ["etiket", "ad"], ["yasak", "ikon-only"]],
    ["Üç kontrol maddesi yaz.", "Açık gri metni reddet.", "Odak halkasını silme."],
    "txt",
    `kontrast ≥ eşik
odak görünür
düğmenin adı var`,
  ),
  "ux-temel-12": pack(
    [["aralık", "yazılı"], ["tipo", "yazılı"], ["durum", "hover/disabled"], ["yasak", "link yeter"]],
    ["Üç satırlık el teslimi yaz.", "«Figma’da var» cümlesini reddet.", "Hover durumunu ekle."],
    "txt",
    `aralık: space-4
tipo: font-lg
durum: default / hover / disabled`,
  ),
};

export const ACADEMY_GROWTH_LESSON_PRACTICE: Record<string, AcademyLessonPractice> = {
  ...PYTHON_GROWTH_PRACTICE,
  ...FULLSTACK_PRACTICE,
  ...AI_PRACTICE,
  ...UX_PRACTICE,
};
