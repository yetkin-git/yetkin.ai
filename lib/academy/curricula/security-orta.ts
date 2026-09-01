/**
 * Siber Güvenlik Orta Seviye (SEC-102) — mühürlü müfredat.
 * PEDAGOJI.md: 5 perde, DialogueTurn[], Ece %95 / Can %98 (uygulamacı uzman), Fail-Closed.
 * Denetim: güvenlik mantığı varsayılan kapalı; sömürü tarifi yok.
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

const can = (text: string, code?: { language: string; source: string }) =>
  dialogueTurn("can", text, code);
const ece = (text: string, code?: { language: string; source: string }) =>
  dialogueTurn("ece", text, code);

export const SECURITY_ORTA_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "security-orta-1",
    order: 1,
    title: "Sızma Testi Metodolojisi ve Bilgi Toplama (Reconnaissance & OSINT)",
    dialogue: {
      warmup: [
        can(
          "Belediye müfettişi kapı sayısına bakmadan önce izin kâğıdını gösterir. Kâğıt yoksa merdiven bile kurulmaz. Sızma testinde keşif de böyle mi durur, yoksa «bir bakayım» yeter mi?",
        ),
        ece(
          "Kâğıt olmadan merdiven yok. Etkileşim kuralları (RoE) o müfettiş kâğıdıdır: kapsam, süre, yasak yazılı durur. Açık kaynak istihbaratı (OSINT) ise vitrindeki tabelayı okumaktır — kilit deliğine tel sokmak değil. Fail-closed (Hata Anında Kapalı): yazılı kapsam yoksa keşif fonksiyonu çağrılmaz.",
        ),
      ],
      problem: [
        can(
          "Kapsam boşken «herkese açık kayıtta ne varsa çek» dersek saha nerede patlar? Pasif keşif ile izinsiz yoklama aynı kapı mı?",
        ),
        ece(
          "Aynı kapı değildir. Pasif keşif kamu kaydıdır: alan adı, iş ilanı, sızmış olmayan açık belge. Hedef listede yokken tarama başlatmak müfettiş kâğıdını yırtmaktır. Fail-closed: hedef cümlesi izin listesinde değilse işlem durur. Sömürü tarifi burada yoktur; kapı kapanır.",
        ),
      ],
      development: [
        can("Kapsam kapısını yaz. Boş RoE ve listede olmayan hedefi bir kez kır."),
        ece(
          "Önce kâğıt, sonra hedef. `kesif` yazılı izin ve dolu kapsam ister. Hedef trim edilmemişse veya kümede yoksa durur. Kamu kaydı yalnızca izinli alan adından okunur; canlı adres uydurulmaz.",
          {
            language: "ts",
            source: `type Roe = { yazili: boolean; kapsam: string };
const IZINLI_HEDEF = new Set(["lab.ornek.test"]);

function kesif(roe: Roe, hedef: string): "pasif" {
  const kapsam = roe.kapsam.trim();
  const h = hedef.trim().toLowerCase();
  if (!roe.yazili || !kapsam) {
    throw new Error("izin yok; keşif durur");
  }
  if (!h || !IZINLI_HEDEF.has(h)) {
    throw new Error("hedef listede yok; işlem durur");
  }
  return "pasif";
}

if (kesif({ yazili: true, kapsam: "lab-osint" }, "lab.ornek.test") !== "pasif") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        can("«Kamu kaydı herkese açık, RoE gerekmez» diye geçersek?"),
        ece(
          "Açıklık izin kâğıdı değildir. Fail-closed kamu kaydını bile yazılı kapsama bağlar. Sen bu derste keşfi kapatmayı öğreniyorsun; sonraki bölümde seni paket merceği ve laboratuvar envanteri bekliyor.",
        ),
      ],
      conclusion: [
        can("Müfettiş kâğıdı, izinli hedef, pasif kayıt. Sonraki adım ağ merceği mi?"),
        ece(
          "Keşif kapısı durunca trafik katmanına ineriz. Bir sonraki bölümde seni Wireshark, Nmap ve trafik dinleme güvenliği bekliyor: laboratuvar dışı arayüz düşer.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_seco1_1",
        "Yazılı etkileşim kuralları (RoE) yokken keşif?",
        ["Kamu kaydı yeter", "Fail-closed; izin yoksa keşif durur", "Sözlü kapsam yeter", "Tüm alan adları serbest"],
        1,
      ),
      mcq(
        "q_seco1_2",
        "Açık kaynak istihbaratı (OSINT) bu derste nedir?",
        ["Kilit deliğine tel", "Kamu tabelasını okumak; sömürü tarifi yok", "Canlı port tarama", "Parola kırma"],
        1,
      ),
      mcq(
        "q_seco1_3",
        "Hedef izin listesinde yoksa dürüst yol hangisidir?",
        ["Yine tara", "İşlem durur; hedef düşer", "Orta hedef uydur", "Nmap zorunlu"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "security-orta-2",
    order: 2,
    title: "Derinlikli Ağ Analizi: Wireshark, Nmap ve Trafik Dinleme Güvenliği",
    dialogue: {
      warmup: [
        can(
          "PTT gişesinde zarfın üstünde mahalle ve daire yazar. Memur etiketi okur, zarfı yırtmaz. Wireshark o etiket merceği mi, yoksa başkasının mektubunu açma tarifi mi?",
        ),
        ece(
          "Etiket merceğidir. Wireshark laboratuvarda başlığı gösterir: kaynak, hedef, kapı. Nmap ise kendi lab rafının envanteridir — izinsiz komşu binayı yoklamak değil. Fail-closed: arayüz laboratuvar listesinde değilse paket düşer; hedef kümede değilse envanter durur.",
        ),
      ],
      problem: [
        can(
          "Üretim arayüzünü «bir bakayım» diye dinlersek veya laboratuvar dışı adresi envantere alırsak saha nerede kırılır?",
        ),
        ece(
          "Dinleme izinsiz mektup açmaktır. Envanter izinsiz kapı yoklamaktır. Bu ders saldırı bayrağı öğretmez. Fail-closed laboratuvarı: izinli arayüz yoksa yakalama yok; izinli lab adresi yoksa port listesi basılmaz. Başlık okunur, içerik sömürülmez.",
        ),
      ],
      development: [
        can("Arayüz ve lab hedefi kapısını yan yana yaz. İkisini de bir kez kır."),
        ece(
          "Varsayılan kapalıdır. `yakala` yalnız `lab0` kabul eder. `envanter` yalnız `lab.ornek.test` için kapı listesi basar. Port tamsayı değilse durur. Bu, güvenlik duvarının küçük hali: deny by default.",
          {
            language: "ts",
            source: `const LAB_ARAYUZ = new Set(["lab0"]);
const LAB_HEDEF = new Set(["lab.ornek.test"]);
const IZINLI_PORT = new Set([443, 22]);

function yakala(arayuz: string): "baslik" {
  if (!LAB_ARAYUZ.has(arayuz.trim())) {
    throw new Error("arayüz yok; paket düşer");
  }
  return "baslik";
}

function envanter(hedef: string, port: number): "envanter" {
  if (!LAB_HEDEF.has(hedef.trim().toLowerCase())) {
    throw new Error("hedef lab değil; envanter durur");
  }
  if (!Number.isInteger(port) || !IZINLI_PORT.has(port)) {
    throw new Error("port listede yok; düşer");
  }
  return "envanter";
}

if (yakala("lab0") !== "baslik") throw new Error("sözleşme kırıldı");
if (envanter("lab.ornek.test", 443) !== "envanter") throw new Error("sözleşme kırıldı");`,
          },
        ),
        can("80 numarayı «herkes HTTP kullanır» diye envantere eklersek?"),
        ece(
          "Açıklama kapı değildir. Fail-closed listede yoksa düşer. Paket inceleme başlığı okur, içeriği sömürmez; tarife burada biter.",
        ),
      ],
      conclusion: [
        can("Etiket, lab arayüzü, varsayılan kapalı. Sonraki adım vitrin kimliği mi?"),
        ece(
          "Ağ merceği durunca nesne kapısına ineriz. Bir sonraki bölümde seni kırık erişim kontrolü, güvensiz doğrudan nesne referansı (IDOR) ve sunucu taraflı istek sahteciliği (SSRF) bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_seco2_1",
        "Wireshark bu derste neyi okur?",
        ["Sömürü yükü", "Başlık: kaynak, hedef, kapı", "Canlı parola düz metni", "Üretim tüneli tarifi"],
        1,
      ),
      mcq(
        "q_seco2_2",
        "Laboratuvar dışı arayüzde yakalama?",
        ["Bir bakayım yeter", "Fail-closed; paket düşer", "Nmap zorunlu", "HTTP 80 açılır"],
        1,
      ),
      mcq(
        "q_seco2_3",
        "Nmap bu derste nedir?",
        ["Saldırı bayrağı", "Kendi lab rafının envanteri; listede yoksa durur", "Komşu tarama tarifi", "PoC zorunlu"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "security-orta-3",
    order: 3,
    title: "İleri Düzey Web Zafiyetleri: Broken Access Control, IDOR ve SSRF",
    dialogue: {
      warmup: [
        can(
          "Otel emanet dolabında sen 12 yazarsın, gişe herhangi bir numarayı açarsa komşunun çantası çıkar. Uygulama Programlama Arayüzü (API) uç noktasında kayıt numarası da böyle mi duruyor?",
        ),
        ece(
          "Böyle durursa kale yalan söyler. Güvensiz doğrudan nesne referansı (IDOR) o yanlış gişedir: kimlik sordu, nesnenin sahibini sormadı. Kırık erişim kontrolü (Broken Access Control) aynı günahın çatısıdır. Sunucu taraflı istek sahteciliği (SSRF) ise gişenin senin yerine herhangi bir adrese mektup göndermesidir. Fail-closed: sahip eşleşmezse kayıt durur; adres izin listesinde değilse getir durur.",
        ),
      ],
      problem: [
        can(
          "Yetki kontrolü yapılmayan API uç noktasında kayıt kimliğini değiştirince veri sızıntısı nasıl yeşil kalır? SSRF’de «iç ağa bir bakayım» ne kırar?",
        ),
        ece(
          "Ekran 200 basar, defter yalan. Oturum var diye her `kayitId` açılmaz. Sunucu her URL’yi getirmez: özel ağ, bağlantı-yerel, listede olmayan konak — üçü de kapı dışıdır. Fail-closed sahip kimliğini ve konak listesini sorar. Sömürü cümlesi yazılmaz; kapı kapanır.",
        ),
      ],
      development: [
        can("Sahip kapısını ve getir kapısını yan yana göster. Hangisi önce durur?"),
        ece(
          "İkisi de aynı anda durur. `okuKayit` oturum sahibi ile defter sahibini kıyaslar; boş veya yabancıysa durur. `sunucuGetir` yalnız `https` ve izinli konak kabul eder; özel önek düşer.",
          {
            language: "ts",
            source: `const IZINLI_KONAK = new Set(["api.ornek.test"]);

function okuKayit(oturumSahibi: string, kayit: { id: string; sahipId: string }): string {
  const sahip = oturumSahibi.trim();
  if (!sahip || !kayit.id.trim()) {
    throw new Error("kimlik yok; işlem durur");
  }
  if (kayit.sahipId !== sahip) {
    throw new Error("nesne senin değil; kayıt durur");
  }
  return kayit.id;
}

function sunucuGetir(url: string): "getir" {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("adres yok; getir durur");
  }
  const host = parsed.hostname.toLowerCase();
  if (parsed.protocol !== "https:") throw new Error("protokol yok; getir durur");
  if (host.startsWith("10.") || host.startsWith("127.") || host.startsWith("169.254.")) {
    throw new Error("özel ağ; getir durur");
  }
  if (!IZINLI_KONAK.has(host)) throw new Error("konak listede yok; getir durur");
  return "getir";
}

if (okuKayit("u1", { id: "f1", sahipId: "u1" }) !== "f1") throw new Error("sözleşme kırıldı");
if (sunucuGetir("https://api.ornek.test/v1") !== "getir") throw new Error("sözleşme kırıldı");`,
          },
        ),
        can("«ID doğrulandı, sahip ayrı mesele» diye geçersek?"),
        ece(
          "Kimlik kapısı nesne kapısı değildir. Fail-closed ikisini de ister. IDOR ve SSRF aynı disiplindir: varsayılan kapalı, açık cümle yoksa dur.",
        ),
      ],
      conclusion: [
        can("Emanet dolabı: sahip, izinli konak. Sonraki adım jeton mührü mü?"),
        ece(
          "Nesne kapısı durunca jeton katmanına ineriz. Bir sonraki bölümde seni Açık Yetkilendirme 2 (OAuth2), JavaScript Nesne Gösterimi Web Jetonu (JWT) ve güvenli tasarım bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_seco3_1",
        "Güvensiz doğrudan nesne referansı (IDOR) neyi atlar?",
        ["DNS kaydını", "Nesnenin sahibini; kimlik yetmez", "TLS sürümünü", "Wireshark başlığını"],
        1,
      ),
      mcq(
        "q_seco3_2",
        "Yetki kontrolü olmayan API uç noktasında yabancı kayıt?",
        ["200 yeter", "Fail-closed; sahip eşleşmezse kayıt durur", "GET serbest", "ID sayıysa doğru"],
        1,
      ),
      mcq(
        "q_seco3_3",
        "Sunucu taraflı istek sahteciliği (SSRF) kapısı ne ister?",
        ["Her URL", "https ve izinli konak; özel ağ düşer", "http yeter", "IP her zaman"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "security-orta-4",
    order: 4,
    title: "API ve Token Güvenliği: OAuth2, JWT Zafiyetleri ve Güvenli Tasarım",
    dialogue: {
      warmup: [
        can(
          "Müzede ziyaretçi kartının fotokopisini gişeye uzatırsan bekçi bakar mı, yoksa hologram ve süre mi ister? Jeton da o kart mı?",
        ),
        ece(
          "Hologram ister. Açık Yetkilendirme 2 (OAuth2) o gişe disiplinidir: yönlendirme adresi izin listesinde durur, kod kopyası yetmez. JavaScript Nesne Gösterimi Web Jetonu (JWT) hologramlı karttır — imza, algoritma, süre, kitle yazılı durur. Fail-closed: algoritma listede yoksa, imza yoksa, süre dolduysa jeton durur.",
        ),
      ],
      problem: [
        can(
          "İmzasız jetonu veya «alg yok» başlığını kabul edersek saha nasıl yeşil kalır? Yenileme jetonunu adrese yazmak?",
        ),
        ece(
          "Ekran giriş basar, kale yalan söyler. İmzasız kart fotokopidir. Algoritma izin listesi dışındaysa kapı açılmaz. Jeton sorgu dizisine yazılırsa günlük ve referrer sızdırır. Fail-closed: `none` yok, imza yok, kitle uymaz, süre geçti — dördü de durur. Sömürü tarifi yok; kapı kapanır.",
        ),
      ],
      development: [
        can("Jeton ve yönlendirme kapısını yaz. İmzasız ve yabancı adresi bir kez kır."),
        ece(
          "`jwtKabul` yalnız izinli imza algoritmasını ister, imza bayrağı ve gelecek süre ister. `yonlendirmeKabul` kümede olmayan adresi düşürür. Decode kapı değildir; doğrulama kapıdır.",
          {
            language: "ts",
            source: `const IZINLI_ALG = new Set(["RS256"]);
const IZINLI_YONLENDIRME = new Set(["https://uygulama.ornek.test/geri"]);

function jwtKabul(girdi: { alg?: string; imzaVar: boolean; exp: number; aud: string }, now: number): "kabul" {
  const alg = (girdi.alg ?? "").trim();
  if (!alg || !IZINLI_ALG.has(alg)) {
    throw new Error("algoritma yok; jeton durur");
  }
  if (!girdi.imzaVar) throw new Error("imza yok; jeton durur");
  if (!Number.isFinite(girdi.exp) || girdi.exp <= now) {
    throw new Error("süre doldu; jeton durur");
  }
  if (girdi.aud !== "api.ornek.test") throw new Error("kitle yok; jeton durur");
  return "kabul";
}

function yonlendirmeKabul(adres: string): "kabul" {
  const temiz = adres.trim();
  if (!IZINLI_YONLENDIRME.has(temiz)) {
    throw new Error("yönlendirme yok; işlem durur");
  }
  return "kabul";
}

if (
  jwtKabul({ alg: "RS256", imzaVar: true, exp: 2, aud: "api.ornek.test" }, 1) !== "kabul"
) {
  throw new Error("sözleşme kırıldı");
}
if (yonlendirmeKabul("https://uygulama.ornek.test/geri") !== "kabul") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        can("«HS256 her yerde var, listeye ekleyelim» diye geçersek?"),
        ece(
          "Popülerlik kapı değildir. Fail-closed bu derste izinli imza algoritmasını ister; listede yoksa durur. OAuth2 yönlendirmesi de aynı: küme dışı adres açılmaz.",
        ),
      ],
      conclusion: [
        can("Hologram, süre, izinli geri adres. Sonraki adım tarama gişesi mi?"),
        ece(
          "Jeton kapısı durunca kaynak tarama durur. Bir sonraki bölümde seni Statik Uygulama Güvenlik Testi (SAST) ve zafiyet tarama araçlarının kullanımı bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_seco4_1",
        "İmzasız JWT bu derste neye benzer?",
        ["Hologramlı kart", "Fotokopi; Fail-closed jetonu durdurur", "OAuth zorunlu başarı", "Cookie yeter"],
        1,
      ),
      mcq(
        "q_seco4_2",
        "Algoritma izin listesinde yokken dürüst yol hangisidir?",
        ["Yine decode", "İşlem durur; jeton kabul edilmez", "none varsayılan", "HS256 her zaman"],
        1,
      ),
      mcq(
        "q_seco4_3",
        "OAuth2 yönlendirme adresi listede değilse?",
        ["200 yeter", "Fail-closed; işlem durur", "Sorgu dizisi yeter", "Yenileme jetonu URL’ye yazılır"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "security-orta-5",
    order: 5,
    title: "Statik Kod Analizi (SAST) ve Zafiyet Tarama Araçlarının Kullanımı",
    dialogue: {
      warmup: [
        can(
          "Yapı denetçisi beton dökülmeden demir çapını listeden okur. Çekiçle duvarı yıkmaz; kırmızı maddeyi fişe yazar. Statik tarama o denetçi mi, yoksa kırmızı çıktıyı saldırı tarifi sanmak mı?",
        ),
        ece(
          "Denetçidir. Statik Uygulama Güvenlik Testi (SAST) kaynağı okur, çalıştırmadan kapı arar. Zafiyet tarayıcısı da yeşil ekran değildir: bulgu sahipsizse, ortak zafiyet puanı yoksa fiş basılmaz. Fail-closed: sır kalıbı duruyorsa derleme durur; sahibi olmayan bulgu bilete dönmez.",
        ),
      ],
      problem: [
        can(
          "Tarayıcı «temiz» deyince iş bitmiş mi sayılıyor? Sır anahtarını depoya yazıp taramayı kapatırsak?",
        ),
        ece(
          "Yeşil yalandır. SAST kapısı sır kalıbını görür görmez durur. Bulguyu «sonra bakarız» diye yığmak denetçiyi evine göndermektir. Bu ders tarayıcı çıktısını sömürü labına çevirmez. Fail-closed: CWE’siz, sahipsiz, şiddetsiz satır kayıt değildir.",
        ),
      ],
      development: [
        can("Sır kapısını ve bulgu fişini yaz. İkisini de bir kez kır."),
        ece(
          "`sastKapisi` kaynakta `AK:` kalıbı görürse durur. `bulguFis` sahip, CWE ve şiddet olmadan basılmaz. Tarayıcı yeşili mühür değildir.",
          {
            language: "ts",
            source: `function sastKapisi(kaynak: string): "temiz" {
  const metin = kaynak.trim();
  if (!metin) throw new Error("kaynak yok; tarama durur");
  if (metin.includes("AK:")) {
    throw new Error("sır kalıbı; derleme durur");
  }
  return "temiz";
}

function bulguFis(girdi: { cwe: string; sahip: string; siddet: "yuksek" | "orta" | "dusuk" }): "fis" {
  if (!girdi.cwe.trim() || !girdi.sahip.trim()) {
    throw new Error("fiş eksik; kayıt durur");
  }
  return "fis";
}

if (sastKapisi("const x = 1") !== "temiz") throw new Error("sözleşme kırıldı");
if (bulguFis({ cwe: "CWE-639", sahip: "ece", siddet: "yuksek" }) !== "fis") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        can("«Düşük şiddet, yarına bırak» diye geçersek?"),
        ece(
          "Şiddet kapıyı silmez; fişi sahipsiz bırakır. Fail-closed sahipsiz satırı bilete çevirmez. Tarayıcı araçtır, mühür değildir.",
        ),
      ],
      conclusion: [
        can("Denetçi, sır kalıbı, sahipli fiş. Mini projede kapıları tek tek kapatacak mıyız?"),
        ece(
          "Kapatacağız. Bir sonraki bölümde seni güvensiz bir API ve web servisinin zafiyet haritasını çıkarıp Fail-closed kapılarla kapatma bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_seco5_1",
        "Statik Uygulama Güvenlik Testi (SAST) neyi okur?",
        ["Canlı sömürü yükü", "Kaynağı; çalıştırmadan kapı arar", "Üretim trafiğini", "JWT fotokopisini"],
        1,
      ),
      mcq(
        "q_seco5_2",
        "Kaynakta sır kalıbı dururken dürüst yol hangisidir?",
        ["Yeşil basılır", "Derleme durur; Fail-closed", "Düşük şiddete indirilir", "Log’a yazılır yeter"],
        1,
      ),
      mcq(
        "q_seco5_3",
        "Sahipsiz, CWE’siz tarayıcı satırı?",
        ["Otomatik bilet", "Fail-closed; fiş basılmaz", "PoC zorunlu", "Nmap yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "security-orta-6",
    order: 6,
    title: "Mini Proje: Güvensiz Bir API ve Web Servisinin Zafiyet Haritasını Çıkarma ve Kapatma",
    dialogue: {
      warmup: [
        can(
          "Kasada dört kapı ardına kadar açık: izinsiz keşif, yabancı kayıt, imzasız jeton, sır kalıbı. Sen hangisinden başlarsın?",
        ),
        ece(
          "Dördünden birden. Mini proje sömürü labı değildir. Harita: kapı nerede açık. Kapatma: RoE, sahip, imza, SAST. Fail-closed bir kapı açıkken teslim basmaz.",
        ),
      ],
      problem: [
        can("Ekran «API ayakta» deyince iş bitmiş mi sayılıyor? Dört kapıdan biri açık kalsa?"),
        ece(
          "Yeşil yalandır. RoE’süz keşif, IDOR, imzasız JWT, sır kalıbı — biri duruyorsa mühür vurulmaz. Bu derste kapatılan iskelet sahte canlı iddiası taşımaz; kapı sözleşmesini gösterir.",
        ),
      ],
      development: [
        can("Tek fonksiyon: RoE, sahip, jeton, kaynak. Biri kırıkken dur."),
        ece(
          "`kapat` dört kapıyı sırayla sorar. Yazılı izin yoksa durur. Sahip eşleşmezse durur. Algoritma veya imza yoksa durur. Sır kalıbı varsa durur. Hepsi durunca «kapali» basılır. Sömürü cümlesi yok.",
          {
            language: "ts",
            source: `function kapat(girdi: {
  roeYazili: boolean;
  oturumSahibi: string;
  kayitSahibi: string;
  alg: string;
  imzaVar: boolean;
  kaynak: string;
}): "kapali" {
  if (!girdi.roeYazili) throw new Error("izin yok; harita durur");
  const sahip = girdi.oturumSahibi.trim();
  if (!sahip || sahip !== girdi.kayitSahibi.trim()) {
    throw new Error("nesne senin değil; kayıt durur");
  }
  if (girdi.alg !== "RS256" || !girdi.imzaVar) {
    throw new Error("jeton yok; işlem durur");
  }
  if (girdi.kaynak.includes("AK:")) throw new Error("sır kalıbı; derleme durur");
  return "kapali";
}

if (
  kapat({
    roeYazili: true,
    oturumSahibi: "u1",
    kayitSahibi: "u1",
    alg: "RS256",
    imzaVar: true,
    kaynak: "const x = 1",
  }) !== "kapali"
) {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        can("Bu iskelet canlı modele veya gerçek ağa bağlı mı? Sınavda ne ölçülür?"),
        ece(
          "Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Dört kapı: RoE, sahip, imzalı jeton, SAST sır kapısı.",
        ),
      ],
      conclusion: [
        can("Orta kapanış bu mu: keşif, mercek, IDOR, jeton, SAST, kapat, sınava gir?"),
        ece(
          "Müfettiş kâğıdından kapatmaya kadar Fail-closed durur. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_seco6_1",
        "Mini projedeki harita sömürü labı mıdır?",
        ["Evet, zorunlu PoC", "Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur", "Yalnız Nmap", "Canlı hedef"],
        1,
      ),
      mcq(
        "q_seco6_2",
        "Dört kapıdan biri açıkken teslim?",
        ["Yeşil basılır", "Fail-closed; mühür vurulmaz", "Üçü yeter", "SAST yeter"],
        1,
      ),
      mcq(
        "q_seco6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Tarayıcı yeşilince"],
        1,
      ),
    ],
  }),
] as const;

const SECURITY_ORTA_LESSON_QUIZZES: AcademyExamQuestion[] = SECURITY_ORTA_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları (30–50 bandı). */
export const SECURITY_ORTA_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...SECURITY_ORTA_LESSON_QUIZZES,
  mcq("q_seco_p1", "Keşif önce ne ister?", ["Nmap bayrağı", "Yazılı RoE ve izinli hedef", "Canlı IP", "PoC"], 1),
  mcq("q_seco_p2", "OSINT kilit deliğine tel midir?", ["Evet", "Hayır; kamu tabelasını okur", "Wireshark zorunlu", "JWT yeter"], 1),
  mcq("q_seco_p3", "Wireshark üretim arayüzünde?", ["Serbest", "Fail-closed; lab dışı paket düşer", "HTTP 80", "RoE yerine geçer"], 1),
  mcq("q_seco_p4", "Nmap bu orta derste nedir?", ["Saldırı", "Lab envanteri; listede yoksa durur", "SSRF aracı", "OAuth gişesi"], 1),
  mcq("q_seco_p5", "IDOR neyi atlar?", ["TLS", "Nesne sahibini", "DNS", "SAST"], 1),
  mcq("q_seco_p6", "Yabancı kayitId ile GET?", ["200 doğru", "Fail-closed; sahip eşleşmezse durur", "GET her zaman", "OAuth yeter"], 1),
  mcq("q_seco_p7", "SSRF özel ağa giderse?", ["İçeriden bakılır", "Getir durur; konak listede yok", "http yeter", "Nmap açar"], 1),
  mcq("q_seco_p8", "JWT decode kapı mıdır?", ["Evet", "Hayır; imza ve algoritma doğrulanır", "Cookie yeter", "none varsayılan"], 1),
  mcq("q_seco_p9", "OAuth2 yabancı yönlendirme?", ["Açılır", "Fail-closed; küme dışı durur", "Sorgu dizisi", "Yenileme URL’de"], 1),
  mcq("q_seco_p10", "SAST sır kalıbında?", ["Uyarı yeter", "Derleme durur", "Düşük şiddet", "Log yeşili"], 1),
  mcq("q_seco_p11", "Sahipsiz tarayıcı satırı bilet midir?", ["Evet", "Hayır; CWE ve sahip olmadan fiş yok", "PoC zorunlu", "Nmap yeter"], 1),
  mcq("q_seco_p12", "Mini proje teslimi ne zaman basılır?", ["Bir kapı yetince", "Dört kapı durunca", "Satın alınca", "API ayaktayken"], 1),
  mcq("q_seco_p13", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_seco_p14", "Bu kurs sömürü tarifi verir mi?", ["Evet, zorunlu", "Hayır; kapıyı kapatmayı öğretir", "Yalnız SSRF ile", "PoC zorunlu"], 1),
];
