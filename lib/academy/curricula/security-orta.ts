/**
 * Siber Güvenlik Orta Seviye (SEC-102) — mühürlü müfredat.
 * PEDAGOJI.md: 4 perde, tek eğitmen, Fail-Closed.
 * Denetim: güvenlik mantığı varsayılan kapalı; sömürü tarifi yok.
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

export const SECURITY_ORTA_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "security-orta-1",
    order: 1,
    title: "Sızma Testi Metodolojisi ve Bilgi Toplama (Reconnaissance & OSINT)",
    intro: "Hoş geldiniz. Bu bölümde Sızma Testi Metodolojisi ve Bilgi Toplama (Reconnaissance & OSINT) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Belediye müfettişi kapı sayısına bakmadan önce izin kâğıdını gösterir. Kâğıt yoksa merdiven bile kurulmaz. Sızma testinde keşif de böyle mi durur, yoksa «bir bakayım» yeter mi. Kâğıt olmadan merdiven yok. Etkileşim kuralları (RoE) o müfettiş kâğıdıdır: kapsam, süre, yasak yazılı durur. Açık kaynak istihbaratı (OSINT) ise vitrindeki tabelayı okumaktır — kilit deliğine tel sokmak değil. Fail-closed (Hata Anında Kapalı): yazılı kapsam yoksa keşif fonksiyonu çağrılmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Kapsam boşken «herkese açık kayıtta ne varsa çek» dersek saha nerede patlar. Pasif keşif ile izinsiz yoklama aynı kapı mı. Aynı kapı değildir. Pasif keşif kamu kaydıdır: alan adı, iş ilanı, sızmış olmayan açık belge. Hedef listede yokken tarama başlatmak müfettiş kâğıdını yırtmaktır. Fail-closed: hedef cümlesi izin listesinde değilse işlem durur. Sömürü tarifi burada yoktur; kapı kapanır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Kapsam kapısını yaz. Boş RoE ve listede olmayan hedefi bir kez kır. Önce kâğıt, sonra hedef. `kesif` yazılı izin ve dolu kapsam ister. Hedef trim edilmemişse veya kümede yoksa durur. Kamu kaydı yalnızca izinli alan adından okunur; canlı adres uydurulmaz. «Kamu kaydı herkese açık, RoE gerekmez» diye geçersek. Açıklık izin kâğıdı değildir. Fail-closed kamu kaydını bile yazılı kapsama bağlar. Sen bu derste keşfi kapatmayı öğreniyorsun; sonraki bölümde seni paket merceği ve laboratuvar envanteri bekliyor.",
    summary: "Bu dersle Sızma Testi Metodolojisi ve Bilgi Toplama (Reconnaissance & OSINT) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Müfettiş kâğıdı, izinli hedef, pasif kayıt. Sonraki adım ağ merceği mi. Keşif kapısı durunca trafik katmanına ineriz. Bir sonraki bölümde seni Wireshark, Nmap ve trafik dinleme güvenliği bekliyor: laboratuvar dışı arayüz düşer.",
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
    code: {
      language: "ts",
      source: "type Roe = { yazili: boolean; kapsam: string };\nconst IZINLI_HEDEF = new Set([\"lab.ornek.test\"]);\n\nfunction kesif(roe: Roe, hedef: string): \"pasif\" {\n  const kapsam = roe.kapsam.trim();\n  const h = hedef.trim().toLowerCase();\n  if (!roe.yazili || !kapsam) {\n    throw new Error(\"izin yok; keşif durur\");\n  }\n  if (!h || !IZINLI_HEDEF.has(h)) {\n    throw new Error(\"hedef listede yok; işlem durur\");\n  }\n  return \"pasif\";\n}\n\nif (kesif({ yazili: true, kapsam: \"lab-osint\" }, \"lab.ornek.test\") !== \"pasif\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-orta-2",
    order: 2,
    title: "Derinlikli Ağ Analizi: Wireshark, Nmap ve Trafik Dinleme Güvenliği",
    intro: "Hoş geldiniz. Bu bölümde Derinlikli Ağ Analizi: Wireshark, Nmap ve Trafik Dinleme Güvenliği konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. PTT gişesinde zarfın üstünde mahalle ve daire yazar. Memur etiketi okur, zarfı yırtmaz. Wireshark o etiket merceği mi, yoksa başkasının mektubunu açma tarifi mi. Etiket merceğidir. Wireshark laboratuvarda başlığı gösterir: kaynak, hedef, kapı. Nmap ise kendi lab rafının envanteridir — izinsiz komşu binayı yoklamak değil. Fail-closed: arayüz laboratuvar listesinde değilse paket düşer; hedef kümede değilse envanter durur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Üretim arayüzünü «bir bakayım» diye dinlersek veya laboratuvar dışı adresi envantere alırsak saha nerede kırılır. Dinleme izinsiz mektup açmaktır. Envanter izinsiz kapı yoklamaktır. Bu ders saldırı bayrağı öğretmez. Fail-closed laboratuvarı: izinli arayüz yoksa yakalama yok; izinli lab adresi yoksa port listesi basılmaz. Başlık okunur, içerik sömürülmez.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Arayüz ve lab hedefi kapısını yan yana yaz. İkisini de bir kez kır. Varsayılan kapalıdır. `yakala` yalnız `lab0` kabul eder. `envanter` yalnız `lab.ornek.test` için kapı listesi basar. Port tamsayı değilse durur. Bu, güvenlik duvarının küçük hali: deny by default. 80 numarayı «herkes HTTP kullanır» diye envantere eklersek. Açıklama kapı değildir. Fail-closed listede yoksa düşer. Paket inceleme başlığı okur, içeriği sömürmez; tarife burada biter.",
    summary: "Bu dersle Derinlikli Ağ Analizi: Wireshark, Nmap ve Trafik Dinleme Güvenliği becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Etiket, lab arayüzü, varsayılan kapalı. Sonraki adım vitrin kimliği mi. Ağ merceği durunca nesne kapısına ineriz. Bir sonraki bölümde seni kırık erişim kontrolü, güvensiz doğrudan nesne referansı (IDOR) ve sunucu taraflı istek sahteciliği (SSRF) bekliyor.",
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
    code: {
      language: "ts",
      source: "const LAB_ARAYUZ = new Set([\"lab0\"]);\nconst LAB_HEDEF = new Set([\"lab.ornek.test\"]);\nconst IZINLI_PORT = new Set([443, 22]);\n\nfunction yakala(arayuz: string): \"baslik\" {\n  if (!LAB_ARAYUZ.has(arayuz.trim())) {\n    throw new Error(\"arayüz yok; paket düşer\");\n  }\n  return \"baslik\";\n}\n\nfunction envanter(hedef: string, port: number): \"envanter\" {\n  if (!LAB_HEDEF.has(hedef.trim().toLowerCase())) {\n    throw new Error(\"hedef lab değil; envanter durur\");\n  }\n  if (!Number.isInteger(port) || !IZINLI_PORT.has(port)) {\n    throw new Error(\"port listede yok; düşer\");\n  }\n  return \"envanter\";\n}\n\nif (yakala(\"lab0\") !== \"baslik\") throw new Error(\"sözleşme kırıldı\");\nif (envanter(\"lab.ornek.test\", 443) !== \"envanter\") throw new Error(\"sözleşme kırıldı\");",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-orta-3",
    order: 3,
    title: "İleri Düzey Web Zafiyetleri: Broken Access Control, IDOR ve SSRF",
    intro: "Hoş geldiniz. Bu bölümde İleri Düzey Web Zafiyetleri: Broken Access Control, IDOR ve SSRF konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Otel emanet dolabında sen 12 yazarsın, gişe herhangi bir numarayı açarsa komşunun çantası çıkar. Uygulama Programlama Arayüzü (API) uç noktasında kayıt numarası da böyle mi duruyor. Böyle durursa kale yalan söyler. Güvensiz doğrudan nesne referansı (IDOR) o yanlış gişedir: kimlik sordu, nesnenin sahibini sormadı. Kırık erişim kontrolü (Broken Access Control) aynı günahın çatısıdır. Sunucu taraflı istek sahteciliği (SSRF) ise gişenin senin yerine herhangi bir adrese mektup göndermesidir. Fail-closed: sahip eşleşmezse kayıt durur; adres izin listesinde değilse getir durur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Yetki kontrolü yapılmayan API uç noktasında kayıt kimliğini değiştirince veri sızıntısı nasıl yeşil kalır. SSRF’de «iç ağa bir bakayım» ne kırar. Ekran 200 basar, defter yalan. Oturum var diye her `kayitId` açılmaz. Sunucu her URL’yi getirmez: özel ağ, bağlantı-yerel, listede olmayan konak — üçü de kapı dışıdır. Fail-closed sahip kimliğini ve konak listesini sorar. Sömürü cümlesi yazılmaz; kapı kapanır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Sahip kapısını ve getir kapısını yan yana göster. Hangisi önce durur. İkisi de aynı anda durur. `okuKayit` oturum sahibi ile defter sahibini kıyaslar; boş veya yabancıysa durur. `sunucuGetir` yalnız `https` ve izinli konak kabul eder; özel önek düşer. «ID doğrulandı, sahip ayrı mesele» diye geçersek. Kimlik kapısı nesne kapısı değildir. Fail-closed ikisini de ister. IDOR ve SSRF aynı disiplindir: varsayılan kapalı, açık cümle yoksa dur.",
    summary: "Bu dersle İleri Düzey Web Zafiyetleri: Broken Access Control, IDOR ve SSRF becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Emanet dolabı: sahip, izinli konak. Sonraki adım jeton mührü mü. Nesne kapısı durunca jeton katmanına ineriz. Bir sonraki bölümde seni Açık Yetkilendirme 2 (OAuth2), JavaScript Nesne Gösterimi Web Jetonu (JWT) ve güvenli tasarım bekliyor.",
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
    code: {
      language: "ts",
      source: "const IZINLI_KONAK = new Set([\"api.ornek.test\"]);\n\nfunction okuKayit(oturumSahibi: string, kayit: { id: string; sahipId: string }): string {\n  const sahip = oturumSahibi.trim();\n  if (!sahip || !kayit.id.trim()) {\n    throw new Error(\"kimlik yok; işlem durur\");\n  }\n  if (kayit.sahipId !== sahip) {\n    throw new Error(\"nesne senin değil; kayıt durur\");\n  }\n  return kayit.id;\n}\n\nfunction sunucuGetir(url: string): \"getir\" {\n  let parsed: URL;\n  try {\n    parsed = new URL(url);\n  } catch {\n    throw new Error(\"adres yok; getir durur\");\n  }\n  const host = parsed.hostname.toLowerCase();\n  if (parsed.protocol !== \"https:\") throw new Error(\"protokol yok; getir durur\");\n  if (host.startsWith(\"10.\") || host.startsWith(\"127.\") || host.startsWith(\"169.254.\")) {\n    throw new Error(\"özel ağ; getir durur\");\n  }\n  if (!IZINLI_KONAK.has(host)) throw new Error(\"konak listede yok; getir durur\");\n  return \"getir\";\n}\n\nif (okuKayit(\"u1\", { id: \"f1\", sahipId: \"u1\" }) !== \"f1\") throw new Error(\"sözleşme kırıldı\");\nif (sunucuGetir(\"https://api.ornek.test/v1\") !== \"getir\") throw new Error(\"sözleşme kırıldı\");",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-orta-4",
    order: 4,
    title: "API ve Token Güvenliği: OAuth2, JWT Zafiyetleri ve Güvenli Tasarım",
    intro: "Hoş geldiniz. Bu bölümde API ve Token Güvenliği: OAuth2, JWT Zafiyetleri ve Güvenli Tasarım konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Müzede ziyaretçi kartının fotokopisini gişeye uzatırsan bekçi bakar mı, yoksa hologram ve süre mi ister. Jeton da o kart mı. Hologram ister. Açık Yetkilendirme 2 (OAuth2) o gişe disiplinidir: yönlendirme adresi izin listesinde durur, kod kopyası yetmez. JavaScript Nesne Gösterimi Web Jetonu (JWT) hologramlı karttır — imza, algoritma, süre, kitle yazılı durur. Fail-closed: algoritma listede yoksa, imza yoksa, süre dolduysa jeton durur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. İmzasız jetonu veya «alg yok» başlığını kabul edersek saha nasıl yeşil kalır. Yenileme jetonunu adrese yazmak. Ekran giriş basar, kale yalan söyler. İmzasız kart fotokopidir. Algoritma izin listesi dışındaysa kapı açılmaz. Jeton sorgu dizisine yazılırsa günlük ve referrer sızdırır. Fail-closed: `none` yok, imza yok, kitle uymaz, süre geçti — dördü de durur. Sömürü tarifi yok; kapı kapanır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Jeton ve yönlendirme kapısını yaz. İmzasız ve yabancı adresi bir kez kır. `jwtKabul` yalnız izinli imza algoritmasını ister, imza bayrağı ve gelecek süre ister. `yonlendirmeKabul` kümede olmayan adresi düşürür. Decode kapı değildir; doğrulama kapıdır. «HS256 her yerde var, listeye ekleyelim» diye geçersek. Popülerlik kapı değildir. Fail-closed bu derste izinli imza algoritmasını ister; listede yoksa durur. OAuth2 yönlendirmesi de aynı: küme dışı adres açılmaz.",
    summary: "Bu dersle API ve Token Güvenliği: OAuth2, JWT Zafiyetleri ve Güvenli Tasarım becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Hologram, süre, izinli geri adres. Sonraki adım tarama gişesi mi. Jeton kapısı durunca kaynak tarama durur. Bir sonraki bölümde seni Statik Uygulama Güvenlik Testi (SAST) ve zafiyet tarama araçlarının kullanımı bekliyor.",
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
    code: {
      language: "ts",
      source: "const IZINLI_ALG = new Set([\"RS256\"]);\nconst IZINLI_YONLENDIRME = new Set([\"https://uygulama.ornek.test/geri\"]);\n\nfunction jwtKabul(girdi: { alg?: string; imzaVar: boolean; exp: number; aud: string }, now: number): \"kabul\" {\n  const alg = (girdi.alg ?? \"\").trim();\n  if (!alg || !IZINLI_ALG.has(alg)) {\n    throw new Error(\"algoritma yok; jeton durur\");\n  }\n  if (!girdi.imzaVar) throw new Error(\"imza yok; jeton durur\");\n  if (!Number.isFinite(girdi.exp) || girdi.exp <= now) {\n    throw new Error(\"süre doldu; jeton durur\");\n  }\n  if (girdi.aud !== \"api.ornek.test\") throw new Error(\"kitle yok; jeton durur\");\n  return \"kabul\";\n}\n\nfunction yonlendirmeKabul(adres: string): \"kabul\" {\n  const temiz = adres.trim();\n  if (!IZINLI_YONLENDIRME.has(temiz)) {\n    throw new Error(\"yönlendirme yok; işlem durur\");\n  }\n  return \"kabul\";\n}\n\nif (\n  jwtKabul({ alg: \"RS256\", imzaVar: true, exp: 2, aud: \"api.ornek.test\" }, 1) !== \"kabul\"\n) {\n  throw new Error(\"sözleşme kırıldı\");\n}\nif (yonlendirmeKabul(\"https://uygulama.ornek.test/geri\") !== \"kabul\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-orta-5",
    order: 5,
    title: "Statik Kod Analizi (SAST) ve Zafiyet Tarama Araçlarının Kullanımı",
    intro: "Hoş geldiniz. Bu bölümde Statik Kod Analizi (SAST) ve Zafiyet Tarama Araçlarının Kullanımı konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Yapı denetçisi beton dökülmeden demir çapını listeden okur. Çekiçle duvarı yıkmaz; kırmızı maddeyi fişe yazar. Statik tarama o denetçi mi, yoksa kırmızı çıktıyı saldırı tarifi sanmak mı. Denetçidir. Statik Uygulama Güvenlik Testi (SAST) kaynağı okur, çalıştırmadan kapı arar. Zafiyet tarayıcısı da yeşil ekran değildir: bulgu sahipsizse, ortak zafiyet puanı yoksa fiş basılmaz. Fail-closed: sır kalıbı duruyorsa derleme durur; sahibi olmayan bulgu bilete dönmez.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Tarayıcı «temiz» deyince iş bitmiş mi sayılıyor. Sır anahtarını depoya yazıp taramayı kapatırsak. Yeşil yalandır. SAST kapısı sır kalıbını görür görmez durur. Bulguyu «sonra bakarız» diye yığmak denetçiyi evine göndermektir. Bu ders tarayıcı çıktısını sömürü labına çevirmez. Fail-closed: CWE’siz, sahipsiz, şiddetsiz satır kayıt değildir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Sır kapısını ve bulgu fişini yaz. İkisini de bir kez kır. `sastKapisi` kaynakta `AK:` kalıbı görürse durur. `bulguFis` sahip, CWE ve şiddet olmadan basılmaz. Tarayıcı yeşili mühür değildir. «Düşük şiddet, yarına bırak» diye geçersek. Şiddet kapıyı silmez; fişi sahipsiz bırakır. Fail-closed sahipsiz satırı bilete çevirmez. Tarayıcı araçtır, mühür değildir.",
    summary: "Bu dersle Statik Kod Analizi (SAST) ve Zafiyet Tarama Araçlarının Kullanımı becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Denetçi, sır kalıbı, sahipli fiş. Mini projede kapıları tek tek kapatacak mıyız. Kapatacağız. Bir sonraki bölümde seni güvensiz bir API ve web servisinin zafiyet haritasını çıkarıp Fail-closed kapılarla kapatma bekliyor.",
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
    code: {
      language: "ts",
      source: "function sastKapisi(kaynak: string): \"temiz\" {\n  const metin = kaynak.trim();\n  if (!metin) throw new Error(\"kaynak yok; tarama durur\");\n  if (metin.includes(\"AK:\")) {\n    throw new Error(\"sır kalıbı; derleme durur\");\n  }\n  return \"temiz\";\n}\n\nfunction bulguFis(girdi: { cwe: string; sahip: string; siddet: \"yuksek\" | \"orta\" | \"dusuk\" }): \"fis\" {\n  if (!girdi.cwe.trim() || !girdi.sahip.trim()) {\n    throw new Error(\"fiş eksik; kayıt durur\");\n  }\n  return \"fis\";\n}\n\nif (sastKapisi(\"const x = 1\") !== \"temiz\") throw new Error(\"sözleşme kırıldı\");\nif (bulguFis({ cwe: \"CWE-639\", sahip: \"ece\", siddet: \"yuksek\" }) !== \"fis\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-orta-6",
    order: 6,
    title: "Mini Proje: Güvensiz Bir API ve Web Servisinin Zafiyet Haritasını Çıkarma ve Kapatma",
    intro: "Hoş geldiniz. Bu bölümde Mini Proje: Güvensiz Bir API ve Web Servisinin Zafiyet Haritasını Çıkarma ve Kapatma konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Kasada dört kapı ardına kadar açık: izinsiz keşif, yabancı kayıt, imzasız jeton, sır kalıbı. Sen hangisinden başlarsın. Dördünden birden. Mini proje sömürü labı değildir. Harita: kapı nerede açık. Kapatma: RoE, sahip, imza, SAST. Fail-closed bir kapı açıkken teslim basmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ekran «API ayakta» deyince iş bitmiş mi sayılıyor. Dört kapıdan biri açık kalsa. Yeşil yalandır. RoE’süz keşif, IDOR, imzasız JWT, sır kalıbı — biri duruyorsa mühür vurulmaz. Bu derste kapatılan iskelet sahte canlı iddiası taşımaz; kapı sözleşmesini gösterir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Tek fonksiyon: RoE, sahip, jeton, kaynak. Biri kırıkken dur. `kapat` dört kapıyı sırayla sorar. Yazılı izin yoksa durur. Sahip eşleşmezse durur. Algoritma veya imza yoksa durur. Sır kalıbı varsa durur. Hepsi durunca «kapali» basılır. Sömürü cümlesi yok. Bu iskelet canlı modele veya gerçek ağa bağlı mı. Sınavda ne ölçülür. Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Dört kapı: RoE, sahip, imzalı jeton, SAST sır kapısı.",
    summary: "Bu dersle Mini Proje: Güvensiz Bir API ve Web Servisinin Zafiyet Haritasını Çıkarma ve Kapatma becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Orta kapanış bu mu: keşif, mercek, IDOR, jeton, SAST, kapat, sınava gir. Müfettiş kâğıdından kapatmaya kadar Fail-closed durur. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
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
    code: {
      language: "ts",
      source: "function kapat(girdi: {\n  roeYazili: boolean;\n  oturumSahibi: string;\n  kayitSahibi: string;\n  alg: string;\n  imzaVar: boolean;\n  kaynak: string;\n}): \"kapali\" {\n  if (!girdi.roeYazili) throw new Error(\"izin yok; harita durur\");\n  const sahip = girdi.oturumSahibi.trim();\n  if (!sahip || sahip !== girdi.kayitSahibi.trim()) {\n    throw new Error(\"nesne senin değil; kayıt durur\");\n  }\n  if (girdi.alg !== \"RS256\" || !girdi.imzaVar) {\n    throw new Error(\"jeton yok; işlem durur\");\n  }\n  if (girdi.kaynak.includes(\"AK:\")) throw new Error(\"sır kalıbı; derleme durur\");\n  return \"kapali\";\n}\n\nif (\n  kapat({\n    roeYazili: true,\n    oturumSahibi: \"u1\",\n    kayitSahibi: \"u1\",\n    alg: \"RS256\",\n    imzaVar: true,\n    kaynak: \"const x = 1\",\n  }) !== \"kapali\"\n) {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
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
