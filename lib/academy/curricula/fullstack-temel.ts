/**
 * Full-Stack Web Geliştirme Temel Seviye (FS-101) — mühürlü müfredat.
 * PEDAGOJI.md: 4 perde, tek eğitmen, Fail-Closed.
 */

import type { AcademyExamQuestion } from "@/lib/academy/types";
import {
  academyInstructorLessonDraft,
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

export const FULLSTACK_TEMEL_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "fullstack-temel-1",
    order: 1,
    title: "İnternet ve Web Nasıl Çalışır? HTTP, DNS ve İstek-Yanıt Döngüsü",
    intro: "Hoş geldiniz. Bu bölümde İnternet ve Web Nasıl Çalışır? HTTP, DNS ve İstek-Yanıt Döngüsü konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Sen bir web sitesini bina inşaatı gibi düşündün mü. İskelet, boya, tesisat, imar ruhsatı — hepsi aynı arsada durur. Peki tarayıcı o arsayı nasıl buluyor. Kapı numarası mı, yoksa sitedeki tabela mı. Tabela isimdir, kapı numarası adrestir. Alan Adı Sistemi (DNS) o tabelayı sokak numarasına çevirir: magaza.ornek yazarsın, rehber 203.0.113.10 der. Hipermetin Aktarım Protokolü (HTTP) ise o kapıya giden kargo fişidir — yöntem, yol, durum kodu, gövde. Fiş dönmeden «yemek geldi» denmez.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ağda ne duruyor. Bitmiş sayılmıyor. Düğme «sepete eklendi» basar, ağ sekmesinde 503 durur. İstek gitti, mutfak reddetti. Fail-closed (Hata Anında Kapalı) burada durur: durum kodu okunmadan yeşil tik yalandır. Tipi gevşek JavaScript’te aynı yalan `undefined is not a function` diye üretimde patlar — fiş yokken kutlama.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, GET ile POST’u, 2xx ile 5xx’i bir fişte ayır. GET okur, POST yazar. 2xx mutfak kabul etti, 4xx fiş eksik, 5xx ocak yandı. Tarayıcı önce DNS sorar, sonra TCP kapısını çalar, sonra HTTP fişini basar. Yanıt gelmeden DOM’a «bitti» yazılmaz. DNS çözülmezse tarayıcı ne yapar. Ben yine de sayfayı çizer miyim. Çizmezsin. Rehber «bu isim yok» derse sokak numarası doğmaz; HTTP fişi yola çıkmaz. Fail-closed: isim çözülmeden istek atılmaz, uydurma IP basılmaz.",
    summary: "Bu dersle İnternet ve Web Nasıl Çalışır? HTTP, DNS ve İstek-Yanıt Döngüsü becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Sonraki adımda iskelet mi duruyor. DNS ismi numaraya çevirir, HTTP fişi istekle yanıtı bağlar, durum kodu mührüdür. Bir sonraki bölümde seni semantik Hipermetin İşaretleme Dili (HTML) ve Basamaklı Stil Sayfaları (CSS) ızgarası bekliyor.",
    quiz: [
      mcq(
        "q_fs1_1",
        "Alan Adı Sistemi (DNS) ne işe yarar?",
        ["Sayfayı boyar", "Alan adını sokak numarasına (IP) çevirir", "Durum kodu basar", "TypeScript derler"],
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
    code: {
      language: "ts",
      source: "type HttpSinif = \"2xx\" | \"4xx\" | \"5xx\";\n\nfunction httpSinif(durum: number): HttpSinif {\n  if (!Number.isInteger(durum) || durum < 100 || durum > 599) {\n    throw new Error(\"durum kodu yok; işlem durur\");\n  }\n  if (durum >= 500) return \"5xx\";\n  if (durum >= 400) return \"4xx\";\n  if (durum >= 200 && durum < 300) return \"2xx\";\n  throw new Error(\"bu fiş kutlama değildir; işlem durur\");\n}\n\nfunction yesilTikYasak(durum: number): string {\n  const sinif = httpSinif(durum);\n  if (sinif !== \"2xx\") {\n    throw new Error(`sunucu ${durum}; yeşil tik yasak`);\n  }\n  return \"mutfak kabul etti\";\n}\n\nconst ok = yesilTikYasak(200);\nif (ok !== \"mutfak kabul etti\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "fullstack-temel-2",
    order: 2,
    title: "Semantik HTML5 ve Modern CSS: Flexbox ve Grid Mimarisi",
    intro: "Hoş geldiniz. Bu bölümde Semantik HTML5 ve Modern CSS: Flexbox ve Grid Mimarisi konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. İnşaatta önce kolon, sonra boya. Web’de Hipermetin İşaretleme Dili (HTML) iskelet, Basamaklı Stil Sayfaları (CSS) dış cephe. Sen bir pazarda her tezgâhı «div» diye etiketlesen müşteri manavı nasıl bulur. Bulamaz. Semantik HTML5 iskeleti dürüst adlandırır: header çatı, nav koridor, main salon, article tezgâh, footer basamak. div sessiz kutudur; anlam taşımaz. CSS Flexbox koridoru tek eksende dizer, Grid odayı satır-sütun tapusuna böler.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Hepsi div olunca tarayıcı ve ekran okuyucu neyi kaçırıyor. Üretimde ne kırılır. Başlık yok, düğme yok, form yok — yalnız kutu. Ekran okuyucu «düğme» diyemez. `undefined is not a function` burada görünmez; görünür olan kör kapıdır. Fail-closed: anlamı olmayan iskelet teslim sayılmaz. Boya, kolonun yerini değiştirmez.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Aynı vitrini semantik iskelet ve ızgarayla göster. Flex nereye, Grid nereye. İskelet anlam taşır. Grid vitrin tapusudur — iki sütun, yazılı boşluk. Flex şerit dizilimidir — logo solda, menü sağda. `innerHTML` ile iskelet uydurulmaz; etiket dosyada durur. CSS tarafında wrap yoksa dar ekranda ne olur. Şerit taşar, düğme kaybolur. Fail-closed: `flex-wrap: wrap` ve Grid `minmax` dar alanda kırılmayı yazar. Sabit piksel tapu değildir.",
    summary: "Bu dersle Semantik HTML5 ve Modern CSS: Flexbox ve Grid Mimarisi becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. İskelet anlam, cephe ızgara. Sonraki adım elektrik mi. Semantik etiket iskeleti okunur kılar; Flex ve Grid yerleşimi tapuya bağlar. Bir sonraki bölümde seni JavaScript değişkeni, fonksiyonu ve Belge Nesne Modeli (DOM) bekliyor.",
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
        ["Aynıdır", "Flex tek eksen şeridi, Grid satır-sütun tapusu", "Grid yalnız renk", "Flex sunucuyu durdurur"],
        1,
      ),
      mcq(
        "q_fs2_3",
        "Dar ekranda taşan şerit için dürüst CSS hangisidir?",
        ["overflow gizle yeter", "flex-wrap veya minmax ile kırılma yazılı durur", "position:fixed", "div çoğalt"],
        1,
      ),
    ],
    code: {
      language: "html",
      source: "<header>\n  <p>Mahalle fırını</p>\n  <nav>\n    <a href=\"/ekmek\">Ekmek</a>\n    <a href=\"/sepet\">Sepet</a>\n  </nav>\n</header>\n<main>\n  <article>\n    <h1>Günün somunu</h1>\n    <p>Taze tapu: stok yazılı durur.</p>\n  </article>\n</main>\n<footer>\n  <p>İmar ruhsatı görünür; gizli div yok.</p>\n</footer>",
    },
  }),
  academyInstructorLessonDraft({
    key: "fullstack-temel-3",
    order: 3,
    title: "JavaScript Temelleri: Değişken, Fonksiyon ve DOM Manipülasyonu",
    intro: "Hoş geldiniz. Bu bölümde JavaScript Temelleri: Değişken, Fonksiyon ve DOM Manipülasyonu konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Binada elektrik ve su tesisatı iskeleti canlı kılar. JavaScript o tesisattır. Sen etiketi olmayan kabloya mı el uzatırsın, yoksa kutunun üstüne «220 volt» mu yazarsın. Yazarsın. `const` kutu kapağı mühürler, `let` yeniden atanır, `var` eski tezgâhtır — bu laboratuvarda yok. Fonksiyon tarifdir: alır, verir, salonu kirletmez. Belge Nesne Modeli (DOM) düğmeleri ve metin yuvalarını tutar.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. `undefined is not a function` sahada nasıl patlıyor. Ekran yine yeşil mi. Patlıyor çünkü `getElementById` null döner, sen `.addEventListener` çağırırsın. Tesisat yok, el prizde. Tipi gevşek JS üretimde çöker. Fail-closed: düğüm yoksa işlem durur; `innerHTML` ile kullanıcı metni yapıştırılmaz — Siteler Arası Komut Çalıştırma (XSS) kapısı açılır. `textContent` dürüst cümledir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Adeti kutuya bas, boşsa dur, tıklamada tek cümle yaz. innerHTML’e el uzatma. `Number(\"\")` 0 üretir; boş kutu sıfır ürün değildir. `Number.isFinite` ve tamsayı kapısı kapanmadan DOM’a yazılmaz. Yuvası yoksa throw. `\"3\" + 1` neden 31 basıyor. Ben 4 bekliyorum. Metin birleşir, sayı toplanmaz. `typeof` cins sorar. Fail-closed: cins net değilse işlem durur — `\"3\" + 1` fişi yalandır.",
    summary: "Bu dersle JavaScript Temelleri: Değişken, Fonksiyon ve DOM Manipülasyonu becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Tesisat: kutu, tarif, yuva. Sonraki adım kargonun yolda beklemesi mi. Değişken etiketlidir, fonksiyon poşettir, DOM tek dürüst cümle taşır. Bir sonraki bölümde seni asenkron JavaScript: Promise, async/await ve fetch bekliyor.",
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
    code: {
      language: "ts",
      source: "function okuAdet(ham: string): number {\n  const temiz = ham.trim();\n  if (temiz === \"\") {\n    throw new Error(\"boş adet; işlem durur\");\n  }\n  const adet = Number(temiz);\n  if (!Number.isFinite(adet) || !Number.isInteger(adet) || adet < 1) {\n    throw new Error(\"geçersiz adet; işlem durur\");\n  }\n  return adet;\n}\n\nfunction durumYaz(yuvaninId: string, cumle: string): void {\n  const yuva = document.getElementById(yuvaninId);\n  if (!(yuva instanceof HTMLElement)) {\n    throw new Error(\"durum yuvası yok; işlem durur\");\n  }\n  yuva.textContent = cumle;\n}\n\nconst dugme = document.getElementById(\"ekle\");\nif (!(dugme instanceof HTMLButtonElement)) {\n  throw new Error(\"düğme yok; işlem durur\");\n}\ndugme.addEventListener(\"click\", () => {\n  durumYaz(\"durum\", \"Hazır\");\n});",
    },
  }),
  academyInstructorLessonDraft({
    key: "fullstack-temel-4",
    order: 4,
    title: "Asenkron JavaScript: Fetch API, Promise ve async/await",
    intro: "Hoş geldiniz. Bu bölümde Asenkron JavaScript: Fetch API, Promise ve async/await konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Kargo uygulaması «yolda» iken sen «teslim edildi» yazar mısın. fetch de öyle bir kurye: söz verir, kutu sonra gelir. Sen kuryeyi kapıda beklerken gişeyi kilitler misin. Kilitlersen salon donar. Promise (söz) «bitecek» der, `await` gişeyi boşaltır. Getirme Uygulama Programlama Arayüzü (Fetch API) HTTP fişini tarayıcıdan yollar. Söz tutulmadan yeşil tik basılmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. fetch «başarılı» deyince res.ok true mu sanılıyor. `undefined is not a function` nerede doğar. Ağ kurulması iş bitmesi değildir. `res.ok` false iken `res.json()` yine çalışır; sen gövdedeki `kalemler.map` çağırırsın, `kalemler` yoktur — `undefined is not a function`. Fail-closed: önce durum, sonra tip, sonra liste. 503’te yeşil yasaktır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, await ile fişi oku, ok değilse dur, gövde dizi değilse dur. then zincirini bir kez de göster. `async function` korutindir. `await fetch` sözü çözer. try/catch ağ kopunca insan cümlesi basar. `.then` aynı kapıdır; iç içe then okunmaz, await okunur. Promise reddedilince await ne yapar. Ben yine map’e geçer miyim. Geçmezsin. Red istisna olur, catch yakalar. Fail-closed: reddedilen söz orta değer basmaz, boş dizi uydurmaz.",
    summary: "Bu dersle Asenkron JavaScript: Fetch API, Promise ve async/await becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Kurye sözü, fiş, sonra kutu. Sonraki adım imar ruhsatı mı. fetch fişi getirir, Promise söz tutar, await gişeyi boşaltır; ok ve şema kapanmadan kutlama yok. Bir sonraki bölümde seni TypeScript tip güvenliği ve arayüz sözleşmesi bekliyor.",
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
    code: {
      language: "ts",
      source: "type SepetGovde = { kalemler: readonly string[] };\n\nfunction sepetOku(ham: unknown): SepetGovde {\n  if (!ham || typeof ham !== \"object\" || !(\"kalemler\" in ham)) {\n    throw new Error(\"beklenmeyen yanıt; işlem durur\");\n  }\n  const kalemler = (ham as { kalemler: unknown }).kalemler;\n  if (!Array.isArray(kalemler)) {\n    throw new Error(\"liste yok; işlem durur\");\n  }\n  return { kalemler };\n}\n\nasync function sepetGetir(url: string): Promise<SepetGovde> {\n  let res: Response;\n  try {\n    res = await fetch(url);\n  } catch {\n    throw new Error(\"ağ koptu; işlem durur\");\n  }\n  if (!res.ok) {\n    throw new Error(`sunucu ${res.status}; yeşil tik yasak`);\n  }\n  const ham: unknown = await res.json();\n  return sepetOku(ham);\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "fullstack-temel-5",
    order: 5,
    title: "TypeScript'e Giriş: Tip Güvenliği ve Arayüz Sözleşmeleri",
    intro: "Hoş geldiniz. Bu bölümde TypeScript'e Giriş: Tip Güvenliği ve Arayüz Sözleşmeleri konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Belediye imar ruhsatı olmadan kolon dökülmez. TypeScript o ruhsattır: iskelet HTML, cephe CSS, tesisat JS — ruhsat derlemede mühürlenir. Sen «as any» ile görevlinin gözünü kapatsan ruhsat basılmış mı sayılır. Sayılmaz. Tip güvenliği (type safety) derleyicinin kapısıdır. `interface` sözleşme kalıbıdır: sku metin, adet tamsayı. `tsc` kırmızıysa tarayıcıya basılmaz. `as any` hatayı erteler, kapıyı açmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Gevşek JS üretimde neden `undefined is not a function` basıyor. Derleme yok mu. Yok. `adet` string gelir, sen `adet.toFixed` çağırırsın — metinde o fonksiyon yoktur. Fail-closed: `interface SepetKalemi { adet: number }` bu çağrıyı derlemede keser. Optional `?` yokluğu dürüst yazar; sessiz undefined yasaktır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, SepetKalemi sözleşmesini yaz. Metin adeti reddet. any kullanma. `interface` fiş kalıbıdır. `unknown` şüphedir: önce daralt, sonra kullan. `as SepetKalemi` kör dökümdür — Fail-closed `typeof` ve `Number.isInteger` ile kapı açar. `as any` ile kırmızı gidince teslim mi. Teslim değil. Görevlinin gözü kapalı, kamyon yine gider; varışta kutu patlar. Ruhsat derlemede yeşil kalır.",
    summary: "Bu dersle TypeScript'e Giriş: Tip Güvenliği ve Arayüz Sözleşmeleri becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Ruhsat: interface, unknown, dur. Mini proje bu sözleşmeyle mi kapanır. Sözleşme derlemede mühürlenir; any mühür sökmektir. Bir sonraki bölümde seni TypeScript ile güvenli form doğrulama ve dinamik liste laboratuvarı bekliyor.",
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
    code: {
      language: "ts",
      source: "interface SepetKalemi {\n  sku: string;\n  adet: number;\n}\n\nfunction kalemOku(ham: unknown): SepetKalemi {\n  if (!ham || typeof ham !== \"object\") {\n    throw new Error(\"gövde yok; işlem durur\");\n  }\n  const kayit = ham as Record<string, unknown>;\n  if (typeof kayit.sku !== \"string\" || kayit.sku.trim() === \"\") {\n    throw new Error(\"sku yok; işlem durur\");\n  }\n  if (typeof kayit.adet !== \"number\" || !Number.isInteger(kayit.adet) || kayit.adet < 1) {\n    throw new Error(\"adet sayı değil; işlem durur\");\n  }\n  return { sku: kayit.sku, adet: kayit.adet };\n}\n\nconst kalem = kalemOku({ sku: \"EKM-1\", adet: 2 });\nif (kalem.adet !== 2) {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "fullstack-temel-6",
    order: 6,
    title: "Mini Proje: TypeScript ile Güvenli Form Doğrulama ve Dinamik Liste",
    intro: "Hoş geldiniz. Bu bölümde Mini Proje: TypeScript ile Güvenli Form Doğrulama ve Dinamik Liste konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Bina tesliminde iskelet, cephe, tesisat ve ruhsat bir arada durur. Bu laboratuvarda form kasa, liste vitrin. Barkod okutulmadan fiş basılır mı. Basılmaz. TypeScript sözleşmesi adeti tartar, DOM yuvası yoksa durur, fetch fişi `res.ok` değilse yeşil yakmaz. Dört kapı aynı masada: doğrula, yaz, iste, listele.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Boş adetle POST atılırsa, ikinci tıklama ikinci kurye yollarsa, 503’te liste dolarsa ne kırılır. `Number(\"\")` 0 olur, istek gider. `undefined is not a function` listede `map` çağrılınca patlar. Fail-closed: boş kutu, meşgul düğme, `!res.ok`, şemasız gövde — dördü de durur. innerHTML ile satır basılmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Formu tart, fetch at, listeyi textContent ile çiz. Hata olursa tek cümle. Kontrollü girdi: value okunur, doğrulanır, ancak o zaman fetch çıkar. `disabled` ikinci tıklamayı yutar. Liste `ul` içine `li` ile durur; kullanıcı metni `textContent`. Bu mini proje canlı sunucuya mı bağlı. Sınavda ne ölçülür. Kapılar tarayıcıda görünür; sahte yeşil yok. Canlı mutfak yarın aynı sözleşmeyi doldurur. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
    summary: "Bu dersle Mini Proje: TypeScript ile Güvenli Form Doğrulama ve Dinamik Liste becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Temel kapanış: fiş, iskelet, tesisat, ruhsat, kasa. Sınava girebilir miyim. İstek-yanıt dürüst okunur, iskelet semantik durur, DOM ve fetch Fail-closed kapanır, TypeScript sözleşmesi derlemede mühürlenir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
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
    code: {
      language: "ts",
      source: "interface Urun {\n  sku: string;\n  ad: string;\n}\n\nfunction adetDogrula(ham: string): number {\n  const temiz = ham.trim();\n  if (temiz === \"\") {\n    throw new Error(\"boş adet; işlem durur\");\n  }\n  const adet = Number(temiz);\n  if (!Number.isFinite(adet) || !Number.isInteger(adet) || adet < 1) {\n    throw new Error(\"geçersiz adet; işlem durur\");\n  }\n  return adet;\n}\n\nfunction urunleriOku(ham: unknown): readonly Urun[] {\n  if (!Array.isArray(ham)) {\n    throw new Error(\"liste yok; işlem durur\");\n  }\n  return ham.map((satir) => {\n    if (!satir || typeof satir !== \"object\") {\n      throw new Error(\"satır yok; işlem durur\");\n    }\n    const kayit = satir as Record<string, unknown>;\n    if (typeof kayit.sku !== \"string\" || typeof kayit.ad !== \"string\") {\n      throw new Error(\"sözleşme kırıldı; işlem durur\");\n    }\n    return { sku: kayit.sku, ad: kayit.ad };\n  });\n}\n\nasync function sepeteEkle(adetHam: string, dugme: HTMLButtonElement, liste: HTMLElement, durum: HTMLElement): Promise<void> {\n  let adet: number;\n  try {\n    adet = adetDogrula(adetHam);\n  } catch (hata) {\n    durum.textContent = hata instanceof Error ? hata.message : \"işlem durur\";\n    return;\n  }\n  dugme.disabled = true;\n  durum.textContent = \"Gönderiliyor\";\n  try {\n    const res = await fetch(\"/api/sepet\", {\n      method: \"POST\",\n      headers: { \"Content-Type\": \"application/json\" },\n      body: JSON.stringify({ adet }),\n    });\n    if (!res.ok) {\n      throw new Error(`sunucu ${res.status}; yeşil tik yasak`);\n    }\n    const urunler = urunleriOku(await res.json());\n    liste.replaceChildren();\n    for (const urun of urunler) {\n      const satir = document.createElement(\"li\");\n      satir.textContent = `${urun.sku} — ${urun.ad}`;\n      liste.append(satir);\n    }\n    durum.textContent = \"Kasa kabul etti\";\n  } catch (hata) {\n    durum.textContent = hata instanceof Error ? hata.message : \"işlem durur\";\n  } finally {\n    dugme.disabled = false;\n  }\n}",
    },
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
