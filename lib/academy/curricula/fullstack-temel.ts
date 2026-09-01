/**
 * Full-Stack Web Geliştirme Temel Seviye (FS-101) — mühürlü müfredat.
 * PEDAGOJI.md: 4 perde, tek eğitmen, Fail-Closed.
 */

import type { AcademyExamQuestion } from "@/lib/academy/types";
import {
  academyFiveActLessonDraft,
  dialogueTurn,
  type AcademyLessonDraft,
} from "@/lib/academy/curricula/types";

function mcq(
  id: string,
  prompt: string,
  choices: readonly [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
): AcademyExamQuestion {
  return { id, prompt, choices: [...choices], correctIndex };
}

const koray = (text: string, code?: { language: string; source: string }) =>
  dialogueTurn("koray", text, code);
const maya = (text: string, code?: { language: string; source: string }) =>
  dialogueTurn("maya", text, code);

export const FULLSTACK_TEMEL_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "fullstack-temel-1",
    order: 1,
    title: "İnternet ve Web Nasıl Çalışır? HTTP, DNS ve İstek-Yanıt Döngüsü",
    dialogue: {
      warmup: [
        koray(
          "Sen bir web sitesini bina inşaatı gibi düşündün mü? İskelet, boya, tesisat, imar ruhsatı — hepsi aynı arsada durur. Peki tarayıcı o arsayı nasıl buluyor? Kapı numarası mı, yoksa sitedeki tabela mı?",
        ),
        maya(
          "Tabela isimdir, kapı numarası adrestir. Alan Adı Sistemi (DNS) o tabelayı sokak numarasına çevirir: magaza.ornek yazarsın, rehber 203.0.113.10 der. Hipermetin Aktarım Protokolü (HTTP) ise o kapıya giden kargo fişidir — yöntem, yol, durum kodu, gövde. Fiş dönmeden «yemek geldi» denmez.",
        ),
      ],
      problem: [
        koray("Saha tarafında ekran yeşil yanınca iş bitmiş mi sayılıyor? Ağda ne duruyor?"),
        maya(
          "Bitmiş sayılmıyor. Düğme «sepete eklendi» basar, ağ sekmesinde 503 durur. İstek gitti, mutfak reddetti. Fail-closed (Hata Anında Kapalı) burada durur: durum kodu okunmadan yeşil tik yalandır. Tipi gevşek JavaScript’te aynı yalan `undefined is not a function` diye üretimde patlar — fiş yokken kutlama.",
        ),
      ],
      development: [
        koray("GET ile POST’u, 2xx ile 5xx’i bir fişte ayır. Ben hâlâ «ağ kuruldu = iş bitti» diye bakıyorum."),
        maya(
          "GET okur, POST yazar. 2xx mutfak kabul etti, 4xx fiş eksik, 5xx ocak yandı. Tarayıcı önce DNS sorar, sonra TCP kapısını çalar, sonra HTTP fişini basar. Yanıt gelmeden DOM’a «bitti» yazılmaz.",
          {
            language: "ts",
            source: `type HttpSinif = "2xx" | "4xx" | "5xx";

function httpSinif(durum: number): HttpSinif {
  if (!Number.isInteger(durum) || durum < 100 || durum > 599) {
    throw new Error("durum kodu yok; işlem durur");
  }
  if (durum >= 500) return "5xx";
  if (durum >= 400) return "4xx";
  if (durum >= 200 && durum < 300) return "2xx";
  throw new Error("bu fiş kutlama değildir; işlem durur");
}

function yesilTikYasak(durum: number): string {
  const sinif = httpSinif(durum);
  if (sinif !== "2xx") {
    throw new Error(\`sunucu \${durum}; yeşil tik yasak\`);
  }
  return "mutfak kabul etti";
}

const ok = yesilTikYasak(200);
if (ok !== "mutfak kabul etti") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        koray("DNS çözülmezse tarayıcı ne yapar? Ben yine de sayfayı çizer miyim?"),
        maya(
          "Çizmezsin. Rehber «bu isim yok» derse sokak numarası doğmaz; HTTP fişi yola çıkmaz. Fail-closed: isim çözülmeden istek atılmaz, uydurma IP basılmaz.",
        ),
      ],
      conclusion: [
        koray("Kafamda oturdu: tabela, kapı, fiş. Sonraki adımda iskelet mi duruyor?"),
        maya(
          "DNS ismi numaraya çevirir, HTTP fişi istekle yanıtı bağlar, durum kodu mührüdür. Bir sonraki bölümde seni semantik Hipermetin İşaretleme Dili (HTML) ve Basamaklı Stil Sayfaları (CSS) ızgarası bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_fs1_1",
        "Alan Adı Sistemi (DNS) ne işe yarar?",
        [
          "Sayfayı boyar",
          "Alan adını sokak numarasına (IP) çevirir",
          "Durum kodu basar",
          "TypeScript derler",
        ],
        1,
      ),
      mcq(
        "q_fs1_2",
        "HTTP 503 iken ekranda yeşil «sepete eklendi» ne anlama gelir?",
        ["İş bitti", "Yalan; fiş reddedildi, Fail-closed durur", "DNS çözüldü yeter", "Yalnız GET’te doğru"],
        1,
      ),
      mcq(
        "q_fs1_3",
        "GET ile POST farkı nedir?",
        ["Aynıdır", "GET okur, POST yazar; fiş yöntemi yalan söylemez", "POST boyar", "GET sunucuyu kapatır"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "fullstack-temel-2",
    order: 2,
    title: "Semantik HTML5 ve Modern CSS: Flexbox ve Grid Mimarisi",
    dialogue: {
      warmup: [
        koray(
          "İnşaatta önce kolon, sonra boya. Web’de Hipermetin İşaretleme Dili (HTML) iskelet, Basamaklı Stil Sayfaları (CSS) dış cephe. Sen bir pazarda her tezgâhı «div» diye etiketlesen müşteri manavı nasıl bulur?",
        ),
        maya(
          "Bulamaz. Semantik HTML5 iskeleti dürüst adlandırır: header çatı, nav koridor, main salon, article tezgâh, footer basamak. div sessiz kutudur; anlam taşımaz. CSS Flexbox koridoru tek eksende dizer, Grid odayı satır-sütun tapusuna böler.",
        ),
      ],
      problem: [
        koray("Hepsi div olunca tarayıcı ve ekran okuyucu neyi kaçırıyor? Üretimde ne kırılır?"),
        maya(
          "Başlık yok, düğme yok, form yok — yalnız kutu. Ekran okuyucu «düğme» diyemez. `undefined is not a function` burada görünmez; görünür olan kör kapıdır. Fail-closed: anlamı olmayan iskelet teslim sayılmaz. Boya, kolonun yerini değiştirmez.",
        ),
      ],
      development: [
        koray("Aynı vitrini semantik iskelet ve ızgarayla göster. Flex nereye, Grid nereye?"),
        maya(
          "İskelet anlam taşır. Grid vitrin tapusudur — iki sütun, yazılı boşluk. Flex şerit dizilimidir — logo solda, menü sağda. `innerHTML` ile iskelet uydurulmaz; etiket dosyada durur.",
          {
            language: "html",
            source: `<header>
  <p>Mahalle fırını</p>
  <nav>
    <a href="/ekmek">Ekmek</a>
    <a href="/sepet">Sepet</a>
  </nav>
</header>
<main>
  <article>
    <h1>Günün somunu</h1>
    <p>Taze tapu: stok yazılı durur.</p>
  </article>
</main>
<footer>
  <p>İmar ruhsatı görünür; gizli div yok.</p>
</footer>`,
          },
        ),
        koray("CSS tarafında wrap yoksa dar ekranda ne olur?"),
        maya(
          "Şerit taşar, düğme kaybolur. Fail-closed: `flex-wrap: wrap` ve Grid `minmax` dar alanda kırılmayı yazar. Sabit piksel tapu değildir.",
          {
            language: "css",
            source: `.serit {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}
.vitrin {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
}`,
          },
        ),
      ],
      conclusion: [
        koray("İskelet anlam, cephe ızgara. Sonraki adım elektrik mi?"),
        maya(
          "Semantik etiket iskeleti okunur kılar; Flex ve Grid yerleşimi tapuya bağlar. Bir sonraki bölümde seni JavaScript değişkeni, fonksiyonu ve Belge Nesne Modeli (DOM) bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_fs2_1",
        "Semantik HTML5’te `article` ne taşır?",
        ["Sessiz kutu", "Kendi başına duran içerik tezgâhı", "Yalnız renk", "DNS kaydı"],
        1,
      ),
      mcq(
        "q_fs2_2",
        "Flexbox ile Grid farkı nedir?",
        [
          "Aynıdır",
          "Flex tek eksen şeridi, Grid satır-sütun tapusu",
          "Grid yalnız renk",
          "Flex sunucuyu durdurur",
        ],
        1,
      ),
      mcq(
        "q_fs2_3",
        "Dar ekranda taşan şerit için dürüst CSS hangisidir?",
        ["overflow gizle yeter", "flex-wrap veya minmax ile kırılma yazılı durur", "position:fixed", "div çoğalt"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "fullstack-temel-3",
    order: 3,
    title: "JavaScript Temelleri: Değişken, Fonksiyon ve DOM Manipülasyonu",
    dialogue: {
      warmup: [
        koray(
          "Binada elektrik ve su tesisatı iskeleti canlı kılar. JavaScript o tesisattır. Sen etiketi olmayan kabloya mı el uzatırsın, yoksa kutunun üstüne «220 volt» mu yazarsın?",
        ),
        maya(
          "Yazarsın. `const` kutu kapağı mühürler, `let` yeniden atanır, `var` eski tezgâhtır — bu laboratuvarda yok. Fonksiyon tarifdir: alır, verir, salonu kirletmez. Belge Nesne Modeli (DOM) düğmeleri ve metin yuvalarını tutar.",
        ),
      ],
      problem: [
        koray("`undefined is not a function` sahada nasıl patlıyor? Ekran yine yeşil mi?"),
        maya(
          "Patlıyor çünkü `getElementById` null döner, sen `.addEventListener` çağırırsın. Tesisat yok, el prizde. Tipi gevşek JS üretimde çöker. Fail-closed: düğüm yoksa işlem durur; `innerHTML` ile kullanıcı metni yapıştırılmaz — Siteler Arası Komut Çalıştırma (XSS) kapısı açılır. `textContent` dürüst cümledir.",
        ),
      ],
      development: [
        koray("Adeti kutuya bas, boşsa dur, tıklamada tek cümle yaz. innerHTML’e el uzatma."),
        maya(
          "`Number(\"\")` 0 üretir; boş kutu sıfır ürün değildir. `Number.isFinite` ve tamsayı kapısı kapanmadan DOM’a yazılmaz. Yuvası yoksa throw.",
          {
            language: "ts",
            source: `function okuAdet(ham: string): number {
  const temiz = ham.trim();
  if (temiz === "") {
    throw new Error("boş adet; işlem durur");
  }
  const adet = Number(temiz);
  if (!Number.isFinite(adet) || !Number.isInteger(adet) || adet < 1) {
    throw new Error("geçersiz adet; işlem durur");
  }
  return adet;
}

function durumYaz(yuvaninId: string, cumle: string): void {
  const yuva = document.getElementById(yuvaninId);
  if (!(yuva instanceof HTMLElement)) {
    throw new Error("durum yuvası yok; işlem durur");
  }
  yuva.textContent = cumle;
}

const dugme = document.getElementById("ekle");
if (!(dugme instanceof HTMLButtonElement)) {
  throw new Error("düğme yok; işlem durur");
}
dugme.addEventListener("click", () => {
  durumYaz("durum", "Hazır");
});`,
          },
        ),
        koray("`\"3\" + 1` neden 31 basıyor? Ben 4 bekliyorum."),
        maya(
          "Metin birleşir, sayı toplanmaz. `typeof` cins sorar. Fail-closed: cins net değilse işlem durur — `\"3\" + 1` fişi yalandır.",
        ),
      ],
      conclusion: [
        koray("Tesisat: kutu, tarif, yuva. Sonraki adım kargonun yolda beklemesi mi?"),
        maya(
          "Değişken etiketlidir, fonksiyon poşettir, DOM tek dürüst cümle taşır. Bir sonraki bölümde seni asenkron JavaScript: Promise, async/await ve fetch bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_fs3_1",
        "`document.getElementById` null dönünce `.addEventListener` ne üretir?",
        ["Sessiz geçer", "`undefined is not a function`; Fail-closed önce yuvayı sorar", "Otomatik düğme", "CSS boyar"],
        1,
      ),
      mcq(
        "q_fs3_2",
        "Kullanıcı metnini DOM’a basarken dürüst yol hangisidir?",
        ["innerHTML", "textContent; innerHTML XSS kapısı açar", "eval", "document.write"],
        1,
      ),
      mcq(
        "q_fs3_3",
        "`Number(\"\")` tuzağı nedir?",
        ["NaN her zaman", "0 olabilir; boş adet geçerli değildir", "Hata zorunlu", "Infinity"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "fullstack-temel-4",
    order: 4,
    title: "Asenkron JavaScript: Fetch API, Promise ve async/await",
    dialogue: {
      warmup: [
        koray(
          "Kargo uygulaması «yolda» iken sen «teslim edildi» yazar mısın? fetch de öyle bir kurye: söz verir, kutu sonra gelir. Sen kuryeyi kapıda beklerken gişeyi kilitler misin?",
        ),
        maya(
          "Kilitlersen salon donar. Promise (söz) «bitecek» der, `await` gişeyi boşaltır. Getirme Uygulama Programlama Arayüzü (Fetch API) HTTP fişini tarayıcıdan yollar. Söz tutulmadan yeşil tik basılmaz.",
        ),
      ],
      problem: [
        koray("fetch «başarılı» deyince res.ok true mu sanılıyor? `undefined is not a function` nerede doğar?"),
        maya(
          "Ağ kurulması iş bitmesi değildir. `res.ok` false iken `res.json()` yine çalışır; sen gövdedeki `kalemler.map` çağırırsın, `kalemler` yoktur — `undefined is not a function`. Fail-closed: önce durum, sonra tip, sonra liste. 503’te yeşil yasaktır.",
        ),
      ],
      development: [
        koray("await ile fişi oku, ok değilse dur, gövde dizi değilse dur. then zincirini bir kez de göster."),
        maya(
          "`async function` korutindir. `await fetch` sözü çözer. try/catch ağ kopunca insan cümlesi basar. `.then` aynı kapıdır; iç içe then okunmaz, await okunur.",
          {
            language: "ts",
            source: `type SepetGovde = { kalemler: readonly string[] };

function sepetOku(ham: unknown): SepetGovde {
  if (!ham || typeof ham !== "object" || !("kalemler" in ham)) {
    throw new Error("beklenmeyen yanıt; işlem durur");
  }
  const kalemler = (ham as { kalemler: unknown }).kalemler;
  if (!Array.isArray(kalemler)) {
    throw new Error("liste yok; işlem durur");
  }
  return { kalemler };
}

async function sepetGetir(url: string): Promise<SepetGovde> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new Error("ağ koptu; işlem durur");
  }
  if (!res.ok) {
    throw new Error(\`sunucu \${res.status}; yeşil tik yasak\`);
  }
  const ham: unknown = await res.json();
  return sepetOku(ham);
}`,
          },
        ),
        koray("Promise reddedilince await ne yapar? Ben yine map’e geçer miyim?"),
        maya(
          "Geçmezsin. Red istisna olur, catch yakalar. Fail-closed: reddedilen söz orta değer basmaz, boş dizi uydurmaz.",
        ),
      ],
      conclusion: [
        koray("Kurye sözü, fiş, sonra kutu. Sonraki adım imar ruhsatı mı?"),
        maya(
          "fetch fişi getirir, Promise söz tutar, await gişeyi boşaltır; ok ve şema kapanmadan kutlama yok. Bir sonraki bölümde seni TypeScript tip güvenliği ve arayüz sözleşmesi bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_fs4_1",
        "fetch ağı kuruldu diye iş bitti mi?",
        ["Evet", "Hayır; res.ok ve gövde okunur", "Evet GET’te", "Yalnız 201"],
        1,
      ),
      mcq(
        "q_fs4_2",
        "`res.ok` false iken `kalemler.map` çağırmak ne doğurur?",
        ["Boş liste", "`undefined is not a function` riski; Fail-closed önce şemayı sorar", "Otomatik retry", "CSS hatası"],
        1,
      ),
      mcq(
        "q_fs4_3",
        "`await` reddedilen Promise’de ne yapar?",
        ["undefined döner", "İstisna fırlatır; catch durur", "Boş dizi basar", "res.ok true sanır"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "fullstack-temel-5",
    order: 5,
    title: "TypeScript'e Giriş: Tip Güvenliği ve Arayüz Sözleşmeleri",
    dialogue: {
      warmup: [
        koray(
          "Belediye imar ruhsatı olmadan kolon dökülmez. TypeScript o ruhsattır: iskelet HTML, cephe CSS, tesisat JS — ruhsat derlemede mühürlenir. Sen «as any» ile görevlinin gözünü kapatsan ruhsat basılmış mı sayılır?",
        ),
        maya(
          "Sayılmaz. Tip güvenliği (type safety) derleyicinin kapısıdır. `interface` sözleşme kalıbıdır: sku metin, adet tamsayı. `tsc` kırmızıysa tarayıcıya basılmaz. `as any` hatayı erteler, kapıyı açmaz.",
        ),
      ],
      problem: [
        koray("Gevşek JS üretimde neden `undefined is not a function` basıyor? Derleme yok mu?"),
        maya(
          "Yok. `adet` string gelir, sen `adet.toFixed` çağırırsın — metinde o fonksiyon yoktur. Fail-closed: `interface SepetKalemi { adet: number }` bu çağrıyı derlemede keser. Optional `?` yokluğu dürüst yazar; sessiz undefined yasaktır.",
        ),
      ],
      development: [
        koray("SepetKalemi sözleşmesini yaz. Metin adeti reddet. any kullanma."),
        maya(
          "`interface` fiş kalıbıdır. `unknown` şüphedir: önce daralt, sonra kullan. `as SepetKalemi` kör dökümdür — Fail-closed `typeof` ve `Number.isInteger` ile kapı açar.",
          {
            language: "ts",
            source: `interface SepetKalemi {
  sku: string;
  adet: number;
}

function kalemOku(ham: unknown): SepetKalemi {
  if (!ham || typeof ham !== "object") {
    throw new Error("gövde yok; işlem durur");
  }
  const kayit = ham as Record<string, unknown>;
  if (typeof kayit.sku !== "string" || kayit.sku.trim() === "") {
    throw new Error("sku yok; işlem durur");
  }
  if (typeof kayit.adet !== "number" || !Number.isInteger(kayit.adet) || kayit.adet < 1) {
    throw new Error("adet sayı değil; işlem durur");
  }
  return { sku: kayit.sku, adet: kayit.adet };
}

const kalem = kalemOku({ sku: "EKM-1", adet: 2 });
if (kalem.adet !== 2) {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        koray("`as any` ile kırmızı gidince teslim mi?"),
        maya(
          "Teslim değil. Görevlinin gözü kapalı, kamyon yine gider; varışta kutu patlar. Ruhsat derlemede yeşil kalır.",
        ),
      ],
      conclusion: [
        koray("Ruhsat: interface, unknown, dur. Mini proje bu sözleşmeyle mi kapanır?"),
        maya(
          "Sözleşme derlemede mühürlenir; any mühür sökmektir. Bir sonraki bölümde seni TypeScript ile güvenli form doğrulama ve dinamik liste laboratuvarı bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_fs5_1",
        "TypeScript `as any` ne yapar?",
        ["Kapıyı kapatır", "Hatayı erteler; kapı açmaz", "Zod yerine geçer", "DNS çözer"],
        1,
      ),
      mcq(
        "q_fs5_2",
        "`unknown` gövdeyi doğrudan `kalem.adet` diye okumak?",
        ["Doğru", "Yasak; önce daralt, Fail-closed durur", "as any yeter", "JSON yeter"],
        1,
      ),
      mcq(
        "q_fs5_3",
        "`interface` ne işe yarar?",
        ["CSS sınıfı", "Alanların cinsini yazılı sözleşmeye bağlar", "HTTP fişi", "DNS rehberi"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "fullstack-temel-6",
    order: 6,
    title: "Mini Proje: TypeScript ile Güvenli Form Doğrulama ve Dinamik Liste",
    dialogue: {
      warmup: [
        koray(
          "Bina tesliminde iskelet, cephe, tesisat ve ruhsat bir arada durur. Bu laboratuvarda form kasa, liste vitrin. Barkod okutulmadan fiş basılır mı?",
        ),
        maya(
          "Basılmaz. TypeScript sözleşmesi adeti tartar, DOM yuvası yoksa durur, fetch fişi `res.ok` değilse yeşil yakmaz. Dört kapı aynı masada: doğrula, yaz, iste, listele.",
        ),
      ],
      problem: [
        koray("Boş adetle POST atılırsa, ikinci tıklama ikinci kurye yollarsa, 503’te liste dolarsa ne kırılır?"),
        maya(
          "`Number(\"\")` 0 olur, istek gider. `undefined is not a function` listede `map` çağrılınca patlar. Fail-closed: boş kutu, meşgul düğme, `!res.ok`, şemasız gövde — dördü de durur. innerHTML ile satır basılmaz.",
        ),
      ],
      development: [
        koray("Formu tart, fetch at, listeyi textContent ile çiz. Hata olursa tek cümle."),
        maya(
          "Kontrollü girdi: value okunur, doğrulanır, ancak o zaman fetch çıkar. `disabled` ikinci tıklamayı yutar. Liste `ul` içine `li` ile durur; kullanıcı metni `textContent`.",
          {
            language: "ts",
            source: `interface Urun {
  sku: string;
  ad: string;
}

function adetDogrula(ham: string): number {
  const temiz = ham.trim();
  if (temiz === "") {
    throw new Error("boş adet; işlem durur");
  }
  const adet = Number(temiz);
  if (!Number.isFinite(adet) || !Number.isInteger(adet) || adet < 1) {
    throw new Error("geçersiz adet; işlem durur");
  }
  return adet;
}

function urunleriOku(ham: unknown): readonly Urun[] {
  if (!Array.isArray(ham)) {
    throw new Error("liste yok; işlem durur");
  }
  return ham.map((satir) => {
    if (!satir || typeof satir !== "object") {
      throw new Error("satır yok; işlem durur");
    }
    const kayit = satir as Record<string, unknown>;
    if (typeof kayit.sku !== "string" || typeof kayit.ad !== "string") {
      throw new Error("sözleşme kırıldı; işlem durur");
    }
    return { sku: kayit.sku, ad: kayit.ad };
  });
}

async function sepeteEkle(adetHam: string, dugme: HTMLButtonElement, liste: HTMLElement, durum: HTMLElement): Promise<void> {
  let adet: number;
  try {
    adet = adetDogrula(adetHam);
  } catch (hata) {
    durum.textContent = hata instanceof Error ? hata.message : "işlem durur";
    return;
  }
  dugme.disabled = true;
  durum.textContent = "Gönderiliyor";
  try {
    const res = await fetch("/api/sepet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adet }),
    });
    if (!res.ok) {
      throw new Error(\`sunucu \${res.status}; yeşil tik yasak\`);
    }
    const urunler = urunleriOku(await res.json());
    liste.replaceChildren();
    for (const urun of urunler) {
      const satir = document.createElement("li");
      satir.textContent = \`\${urun.sku} — \${urun.ad}\`;
      liste.append(satir);
    }
    durum.textContent = "Kasa kabul etti";
  } catch (hata) {
    durum.textContent = hata instanceof Error ? hata.message : "işlem durur";
  } finally {
    dugme.disabled = false;
  }
}`,
          },
        ),
        koray("Bu mini proje canlı sunucuya mı bağlı? Sınavda ne ölçülür?"),
        maya(
          "Kapılar tarayıcıda görünür; sahte yeşil yok. Canlı mutfak yarın aynı sözleşmeyi doldurur. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
      conclusion: [
        koray("Temel kapanış: fiş, iskelet, tesisat, ruhsat, kasa. Sınava girebilir miyim?"),
        maya(
          "İstek-yanıt dürüst okunur, iskelet semantik durur, DOM ve fetch Fail-closed kapanır, TypeScript sözleşmesi derlemede mühürlenir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_fs6_1",
        "Boş adet kutusunda `Number(\"\")` ile POST atmak?",
        ["Geçerli sıfır", "Yasak; trim sonrası boşluk reddedilir", "fetch düzeltir", "DNS çözer"],
        1,
      ),
      mcq(
        "q_fs6_2",
        "Liste satırına kullanıcı metni nasıl basılır?",
        ["innerHTML birleştir", "textContent; XSS kapısı kapanır", "eval", "document.write"],
        1,
      ),
      mcq(
        "q_fs6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "fetch 200 deyince"],
        1,
      ),
    ],
  }),
] as const;

const FULLSTACK_TEMEL_LESSON_QUIZZES: AcademyExamQuestion[] = FULLSTACK_TEMEL_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları. */
export const FULLSTACK_TEMEL_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...FULLSTACK_TEMEL_LESSON_QUIZZES,
  mcq("q_fs_p1", "HTTP durum kodu ne işe yarar?", ["Süs", "İstek-yanıt durumunu bildirir", "CSS sınıfı", "DNS boyası"], 1),
  mcq("q_fs_p2", "DNS çözülmeden HTTP fişi?", ["Atılır", "Fail-closed; isim yoksa istek yok", "IP uydurulur", "GET zorunlu"], 1),
  mcq("q_fs_p3", "Semantik olmayan div ormanı?", ["Yeter", "Anlam yok; iskelet teslim sayılmaz", "Grid zorunlu", "fetch boyar"], 1),
  mcq("q_fs_p4", "Flex wrap neden durur?", ["Renk", "Dar ekranda şerit taşmasın", "HTTP 200", "any"], 1),
  mcq("q_fs_p5", "`const` ne mühürler?", ["Fonksiyonu", "Yeniden atamayı", "DNS’i", "Grid’i"], 1),
  mcq("q_fs_p6", "DOM yuvası yokken tıklama?", ["Sessiz", "Fail-closed throw; undefined is not a function önlenir", "innerHTML", "POST"], 1),
  mcq("q_fs_p7", "Promise nedir?", ["CSS", "Sonra tutulacak söz", "DNS kaydı", "imar ruhsatı"], 1),
  mcq("q_fs_p8", "async/await neyi bekler?", ["Yalnız CPU", "Sözün çözülmesini; gişeyi boşaltır", "tsc’yi", "Grid’i"], 1),
  mcq("q_fs_p9", "Gövde dizi değilken map?", ["Boş dizi", "undefined is not a function; şema önce", "retry", "any"], 1),
  mcq("q_fs_p10", "TypeScript interface ne zaman keser?", ["Çalışma anı yalnız", "Derlemede yanlış cinsi", "DNS’te", "fetch’te her zaman"], 1),
  mcq("q_fs_p11", "Düğme disabled iken ikinci tıklama?", ["İkinci POST atılır", "Çift tıklama yutulur", "Zod açılır", "SQL bağlanır"], 1),
  mcq("q_fs_p12", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_fs_p13", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet hash", "Yalnız satın alma"], 1),
  mcq("q_fs_p14", "Bu Temel kapanış özeti nedir?", ["Yalnız React", "HTTP + semantik iskelet + DOM/fetch + TypeScript sözleşmesi", "Yalnız SQL", "Yalnız Figma"], 1),
];
