/**
 * Siber Güvenlik Temel Seviye (SEC-101) — mühürlü müfredat.
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

export const SECURITY_TEMEL_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "security-temel-1",
    order: 1,
    title: "Siber güvenliğe giriş: CIA üçlüsü ve tehdit modelleri",
    intro: "Hoş geldiniz. Bu bölümde Siber güvenliğe giriş: CIA üçlüsü ve tehdit modelleri konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Sen bir kalenin kapısını çizdin mi. Nöbetçi, anahtar, perde. Üçü birden durmazsa kale kale değildir. Dijital tarafta da aynı üçlü mü duruyor. Duruyor. Gizlilik-bütünlük-erişilebilirlik üçlüsü (CIA) o kale tarifidir. Perde: bakılmaması gereken içeri bakılmaz. Mühür: yazı yolda değişmez. Nöbetçi uyanık: kapı meşru elde açılır. Biri düşerse kale yalan söyler.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ekran yine yeşil mi kalıyor. Yeşil kalır. Yedek alınmadan disk ölür: erişilebilirlik düşer, perde durur. Düz metin parola deftere yazılır: gizlilik düşer, kapı yine açılır. Log satırı sonradan silinir: bütünlük düşer, kimse fark etmez. Fail-closed (Hata Anında Kapalı) burada durur: üçlü net değilse işlem durur, «bir şekilde yürür» uydurulmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Tehdit modelini masaya koy. Kim, neyi, neden istiyor — yoksa her kapıyı aynı boya mı sürüyoruz. Tehdit modeli varlık, tehdit, etki üçlüsüdür. Varlık yoksa risk uydurulmaz. Fail-closed: varlık, tehdit veya etki boşsa kayıt basılmaz. «Herkes kötü» cümlesi model değildir; isim, niyet ve zarar yazılı durur. Boş varlıkla «orta risk» basarsak ne kırılır. Orta değer yalandır. Fail-closed boş kaydı reddeder. Kale tarifinde perde, mühür, nöbetçi ayrı durur; birini «ortalama» diye boyamak kapıyı açmaz, kapatır.",
    summary: "Bu dersle Siber güvenliğe giriş: CIA üçlüsü ve tehdit modelleri becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Kale tarifini ağ kapısına bağlarız. Bir sonraki bölümde seni İletim Kontrol Protokolü / İnternet Protokolü (TCP/IP), portlar ve paket inceleme mantığı bekliyor.",
    quiz: [
      mcq(
        "q_sec1_1",
        "Gizlilik-bütünlük-erişilebilirlik üçlüsü (CIA) hangisidir?",
        ["Hız, fiyat, renk", "Gizlilik, bütünlük, erişilebilirlik", "Yalnız şifre uzunluğu", "Yalnız güvenlik duvarı markası"],
        1,
      ),
      mcq(
        "q_sec1_2",
        "Fail-closed (Hata Anında Kapalı) varlık adı boşken ne yapar?",
        ["Orta risk basar", "İşlemi durdurur; kayıt uydurmaz", "Yeşil tik basar", "Log’u siler"],
        1,
      ),
      mcq(
        "q_sec1_3",
        "Tehdit modeli en az neyi ister?",
        ["Slogan", "Varlık, tehdit ve etki yazılı durur", "Yalnız marka adı", "Ekran yeşili"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "type CiaSutun = \"gizlilik\" | \"butunluk\" | \"erisilebilirlik\";\n\nfunction ciaKaydi(varlik: string, tehdit: string, etki: CiaSutun): string {\n  const v = varlik.trim();\n  const t = tehdit.trim();\n  if (!v || !t) {\n    throw new Error(\"varlık veya tehdit yok; işlem durur\");\n  }\n  return `${v}|${t}|${etki}`;\n}\n\nif (ciaKaydi(\"parola defteri\", \"düz metin sızıntı\", \"gizlilik\") !== \"parola defteri|düz metin sızıntı|gizlilik\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-temel-2",
    order: 2,
    title: "Ağ temelleri: TCP/IP, portlar, Wireshark ve paket inceleme mantığı",
    intro: "Hoş geldiniz. Bu bölümde Ağ temelleri: TCP/IP, portlar, Wireshark ve paket inceleme mantığı konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Kargo şubesinde paket üstünde sokak, kapı numarası ve daire yazmazsa kamyon nereye gider. Elin uzanır, durur. Ağda da paket böyle mi duruyor. Böyle. İletim Kontrol Protokolü / İnternet Protokolü (TCP/IP) o etikettir. Adres sokak numarasıdır, port daire kapısıdır. Wireshark o etiketi okuyan mercektir: başlık görünür, içeriğe saldırı tarifi yazılmaz. Etiket yoksa kamyona yükleme. Fail-closed: izin listesinde olmayan kapı açılmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Herkese açık 65535 daireyi açık bırakırsak saha nerede patlar. Paket inceleme neyi gösterir, neyi göstermez. Gereksiz açık port, bekçisiz daire gibidir. Paket inceleme mantığı başlığı okur: kaynak, hedef, port. Wireshark laboratuvarda o başlığı gösterir; canlı ağa saldırı tarifi burada yoktur. Fail-closed laboratuvarı: izinli port yoksa paket düşer, «bir bakayım» diye içeri alınmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, İzin listesini yaz. 443 ve 22 dışını bir kez kır. Varsayılan kapalıdır. Liste yazılı durur. Port tamsayı değilse veya listede yoksa işlem durur. Bu, güvenlik duvarının küçük hali: deny by default. 80 numarayı «herkes HTTP kullanır» diye açarsak. Açıklama kapı değildir. Fail-closed listede yoksa düşer. Paket inceleme başlığı okur, içeriği sömürmez; tarife burada biter.",
    summary: "Bu dersle Ağ temelleri: TCP/IP, portlar, Wireshark ve paket inceleme mantığı becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Etiket, daire, varsayılan kapalı. Sonraki adım kale içindeki vitrin mi. Ağ kapısı durunca vitrin katmanına ineriz. Bir sonraki bölümde seni Açık Web Uygulaması Güvenlik Projesi (OWASP) ve üç yaygın web kapısı bekliyor.",
    quiz: [
      mcq(
        "q_sec2_1",
        "Port bu derste neye benzer?",
        ["Renk kodu", "Daire kapısı; izin yoksa açılmaz", "DNS boyası", "Sertifika hash"],
        1,
      ),
      mcq(
        "q_sec2_2",
        "Fail-closed izin listesinde olmayan porta ne yapar?",
        ["İçeri alır", "Paketi düşürür; işlem durur", "Orta port uydurur", "Başlığı siler"],
        1,
      ),
      mcq(
        "q_sec2_3",
        "Paket inceleme mantığı bu derste neyi okur?",
        ["Sömürü tarifi", "Başlık: kaynak, hedef, port", "Canlı saldırı adımı", "Parola düz metni"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "const IZINLI_PORT = new Set([443, 22]);\n\nfunction paketKabul(port: number): \"kabul\" {\n  if (!Number.isInteger(port) || port < 1 || port > 65535) {\n    throw new Error(\"port yok; işlem durur\");\n  }\n  if (!IZINLI_PORT.has(port)) {\n    throw new Error(\"port listede yok; paket düşer\");\n  }\n  return \"kabul\";\n}\n\nif (paketKabul(443) !== \"kabul\") throw new Error(\"sözleşme kırıldı\");",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-temel-3",
    order: 3,
    title: "Web güvenliği: OWASP Top 10, SQL enjeksiyonu, XSS ve CSRF",
    intro: "Hoş geldiniz. Bu bölümde Web güvenliği: OWASP Top 10, SQL enjeksiyonu, XSS ve CSRF konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Gişede «hesap numaranızı söyleyin» dersin. Biri kâğıda kendi cümlesini yazıp vezneye uzatırsa, sen o kâğıdı deftere yapıştırır mısın. Yapıştırmazsın. Açık Web Uygulaması Güvenlik Projesi (OWASP) o gişe disiplinidir. Yapılandırılmış Sorgu Dili (SQL) enjeksiyonu, Siteler Arası Komut Çalıştırma (XSS) ve Siteler Arası İstek Sahteciliği (CSRF) üçü de aynı günah: kullanıcı metnini tarif sanmak.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ham string’i sorguya yapıştırmak veya innerHTML’e kullanıcı adı basmak sahada nasıl yeşil kalır. Ekran yeşil, defter yalan. Birleştirilmiş sorgu kapıyı söker; innerHTML vitrine yabancı işaret basar; jetonu olmayan POST başkasının gişesini çalıştırır. Fail-closed: parametre bağlanır, metin textContent ile basılır, CSRF jetonu yoksa istek durur. Sömürü cümlesi yazılmaz; kapı kapanır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Üç kapıyı yan yana göster. Hangisi önce durur. Üçü de aynı anda durur. Sorgu parametrelidir. Çıktı textContent’tir. Değiştiren istekte oturum jetonu sorulur. Biri eksikse teslim yoktur. «innerHTML hızlı» diye geçsek. Hız kapı değildir. Fail-closed vitrine kullanıcı metnini işaret olarak basmaz. OWASP listesi öncelik verir; bu ders üç kapıyı kapatmayı öğretir, sömürmeyi değil.",
    summary: "Bu dersle Web güvenliği: OWASP Top 10, SQL enjeksiyonu, XSS ve CSRF becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Gişe: parametre, textContent, jeton. Sonraki adım kimlik kapısı mı. Vitrin kapandı. Bir sonraki bölümde seni parola hash’leme — bcrypt / Argon2 — ve Çok Faktörlü Kimlik Doğrulama (MFA) bekliyor.",
    quiz: [
      mcq(
        "q_sec3_1",
        "Kullanıcı e-postasını SQL cümlesine `+` ile eklemek?",
        ["Hızlı teslim", "Yasak; parametreli sorgu Fail-closed durur", "Yalnız GET’te doğru", "ORM zorunlu değil"],
        1,
      ),
      mcq(
        "q_sec3_2",
        "Kullanıcı adını DOM’a basarken dürüst yol hangisidir?",
        ["innerHTML", "textContent; innerHTML kapıyı açar", "eval", "document.write"],
        1,
      ),
      mcq(
        "q_sec3_3",
        "CSRF jetonu yokken değiştiren istek?",
        ["200 yeter", "Fail-closed; istek durur", "Cookie yeter", "GET aynı"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function okuKullanici(\n  db: { query: (sql: string, p: string[]) => { id: string } | null },\n  email: string,\n) {\n  const temiz = email.trim();\n  if (!temiz) throw new Error(\"e-posta yok; işlem durur\");\n  return db.query(\"SELECT id FROM users WHERE email = $1\", [temiz]);\n}\n\nfunction basAd(el: { textContent: string }, ad: string) {\n  el.textContent = ad;\n}\n\nfunction csrfKabul(gelen: string | undefined, oturum: string): true {\n  if (!gelen || gelen !== oturum) {\n    throw new Error(\"jeton yok; istek durur\");\n  }\n  return true;\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-temel-4",
    order: 4,
    title: "Kimlik kapısı: parola hash’leme, bcrypt, Argon2 ve MFA",
    intro: "Hoş geldiniz. Bu bölümde Kimlik kapısı: parola hash’leme, bcrypt, Argon2 ve MFA konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Vestiyerde paltona isim yazıp asarsan, gece gelen herkes o ismi okur. Fiş verirsen palto fişle çıkar. Parola defteri hangisine benziyor. Fişe benzemeli. Düz metin parola vestiyer kâğıdıdır: sızınca her kapı açılır. bcrypt ve Argon2 o fiştir — tek yönlü, yavaş, tuzlu. Çok Faktörlü Kimlik Doğrulama (MFA) ikinci kapıdır: fiş yetmez, ikinci kanıt ister.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Veritabanında düz metin durursa saha nasıl patlar. Hash «şifreleme» midir. Sızıntıda bütün hesaplar açık kalır. Hash şifreleme değildir; geri çevrilemez özetdir. «MD5 yeter» yalandır. Fail-closed: boş parola, kısa parola, düz metin INSERT — üçü de durur. MFA bayrağı yoksa oturum yeşil basılmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Hash kapısını yaz. Boş ve kısa parolayı bir kez kır. Uzunluk ve boşluk önce sorulur. Hash kütüphanesi tuzu kendi basar. Karşılaştırma zaman sabit tutulur; `===` ile ham metin kıyaslanmaz. MFA kapısı ayrı bayraktır: yoksa oturum durur. Hash’i veri tabanına yazmadan log’a basarsak. Log da vestiyer kâğıdıdır. Fail-closed sır ve hash’i günlükte gezdirmez. Argon2 bellek maliyeti bcrypt’ten ayrı bir tarif; ikisi de düz metinden üstündür, boş parolayı kurtarmaz.",
    summary: "Bu dersle Kimlik kapısı: parola hash’leme, bcrypt, Argon2 ve MFA becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Fiş, tuz, ikinci kapı. Sonraki adım kale duvarı ve izin kâğıdı mı. Kimlik kapısı durunca duvar ve etik durur. Bir sonraki bölümde seni güvenlik duvarı ve sızma testi etkileşim kuralları bekliyor.",
    quiz: [
      mcq(
        "q_sec4_1",
        "Parolayı veritabanında düz metin saklamak?",
        ["Hızlı login", "Yasak; hash (bcrypt/Argon2) Fail-closed ister", "MD5 yeter", "Log’a yazılır"],
        1,
      ),
      mcq(
        "q_sec4_2",
        "Boş veya 12 karakterden kısa parolada dürüst yol hangisidir?",
        ["Hash yine basılır", "İşlem durur; kayıt yok", "Varsayılan parola", "MFA kapatılır"],
        1,
      ),
      mcq(
        "q_sec4_3",
        "Çok Faktörlü Kimlik Doğrulama (MFA) yokken oturum?",
        ["Parola yeter", "Fail-closed; ikinci kapı yoksa oturum durur", "Cookie yeter", "Hash yeter"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "async function parolaHash(\n  parola: string,\n  hashFn: (p: string, cost: number) => Promise<string>,\n) {\n  const temiz = parola.trim();\n  if (!temiz || temiz.length < 12) {\n    throw new Error(\"parola yok veya kısa; işlem durur\");\n  }\n  return hashFn(temiz, 12);\n}\n\nfunction mfaOturum(parolaOk: boolean, mfaOk: boolean): \"acil\" {\n  if (!parolaOk || !mfaOk) {\n    throw new Error(\"ikinci kapı yok; oturum durur\");\n  }\n  return \"acil\";\n}\n\nif (mfaOturum(true, true) !== \"acil\") throw new Error(\"sözleşme kırıldı\");",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-temel-5",
    order: 5,
    title: "Sistem güvenliği: güvenlik duvarı ve sızma testi etikleri",
    intro: "Hoş geldiniz. Bu bölümde Sistem güvenliği: güvenlik duvarı ve sızma testi etikleri konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Gece kulübünde bekçi «tanımıyorum, giremezsin» der. Liste yoksa herkes girer. Güvenlik duvarı o bekçi midir. Öyledir. Varsayılan kapalı, izin listesi yazılı. «Bir bakayım» diye her portu açmak bekçiyi evine göndermektir. Fail-closed: kural yoksa paket düşer.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Sızma testi izinsiz yapılırsa ne kırılır. Etkileşim kuralları (RoE) yokken «lab» demek yeter mi. Yeter değil. Yazılı izin, kapsam, süre ve yasak yoksa test durur. Bu ders saldırı tarifi vermez; etik kapıyı öğretir. Fail-closed: RoE yoksa el uzamaz. Canlı sistem «merak» ile yoklanırsa hem yasa hem güven kırılır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Duvar kuralını ve izin kâğıdını yan yana yaz. Güvenlik duvarı deny-by-default. RoE yazılı değilse test fonksiyonu çağrılmaz. Kapsam boşsa durur. Laboratuvar hedefi cümlede durur; canlı adres uydurulmaz. «İzin sözlüydü» diye geçersek. Söz kapı değildir. Fail-closed yazılı RoE ister. Duvar ve etik aynı disiplindir: varsayılan kapalı, açık cümle yoksa dur.",
    summary: "Bu dersle Sistem güvenliği: güvenlik duvarı ve sızma testi etikleri becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Bekçi ve izin kâğıdı. Mini projede kapıları tek tek kapatacak mıyız. Kapatacağız. Bir sonraki bölümde seni zafiyetli bir web iskeletini analiz edip Fail-closed kapılarla kapatma bekliyor.",
    quiz: [
      mcq(
        "q_sec5_1",
        "Güvenlik duvarı varsayılanı nedir?",
        ["Tüm port açık", "Kapalı; listede yoksa paket düşer", "HTTP her zaman", "Sözlü izin"],
        1,
      ),
      mcq(
        "q_sec5_2",
        "Etkileşim kuralları (RoE) yokken sızma testi?",
        ["Lab yeter", "Fail-closed; yazılı izin yoksa test durur", "Sözlü yeter", "Canlı sistem serbest"],
        1,
      ),
      mcq(
        "q_sec5_3",
        "Bu ders sömürü tarifi verir mi?",
        ["Evet, zorunlu", "Hayır; kapıyı ve etiği öğretir", "Yalnız Wireshark ile", "PoC zorunlu"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "type Roe = { yazili: boolean; kapsam: string };\n\nfunction duvarKabul(port: number, izin: ReadonlySet<number>): \"kabul\" {\n  if (!izin.has(port)) throw new Error(\"kural yok; paket düşer\");\n  return \"kabul\";\n}\n\nfunction testBaslat(roe: Roe): \"lab\" {\n  const kapsam = roe.kapsam.trim();\n  if (!roe.yazili || !kapsam) {\n    throw new Error(\"izin yok; test durur\");\n  }\n  return \"lab\";\n}\n\nif (duvarKabul(443, new Set([443])) !== \"kabul\") throw new Error(\"sözleşme kırıldı\");\nif (testBaslat({ yazili: true, kapsam: \"lab-hedef\" }) !== \"lab\") throw new Error(\"sözleşme kırıldı\");",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-temel-6",
    order: 6,
    title: "Mini proje: zafiyetli web uygulamasını analiz edip kapatma",
    intro: "Hoş geldiniz. Bu bölümde Mini proje: zafiyetli web uygulamasını analiz edip kapatma konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Kalenin dört kapısı ardına kadar açık: defter yapıştırması, vitrin işareti, düz metin fiş, bekçisiz port. Sen hangisinden başlarsın. Dördünden birden. Mini proje sömürü labı değildir. Analiz: kapı nerede açık. Kapatma: parametre, textContent, hash+MFA, varsayılan deny. Fail-closed bir kapı açıkken teslim basmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ekran «giriş başarılı» deyince iş bitmiş mi sayılıyor. Dört kapıdan biri açık kalsa. Yeşil yalandır. Ham SQL birleştirme, innerHTML, düz metin parola, RoE’süz «test» — biri duruyorsa mühür vurulmaz. Bu derste kapatılan iskelet sahte canlı iddiası taşımaz; kapı sözleşmesini gösterir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Tek fonksiyon: e-posta, parola, jeton, port. Biri kırıkken dur. `kapat` dört kapıyı sırayla sorar. E-posta boşsa durur. Parola kısa ise durur. CSRF jetonu yoksa durur. Port listede yoksa durur. Hepsi durunca «kapali» basılır. Sömürü cümlesi yok. Bu iskelet canlı modele veya gerçek ağa bağlı mı. Sınavda ne ölçülür. Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Dört kapı: parametre, textContent, hash+MFA, varsayılan deny.",
    summary: "Bu dersle Mini proje: zafiyetli web uygulamasını analiz edip kapatma becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Temel kapanış bu mu: üçlü, ağ, OWASP, fiş, duvar, kapat, sınava gir. Kale tarifinden kapatmaya kadar Fail-closed durur. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
    quiz: [
      mcq(
        "q_sec6_1",
        "Mini projedeki kapatma sömürü labı mıdır?",
        ["Evet, zorunlu PoC", "Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur", "Yalnız SQLmap", "Canlı hedef"],
        1,
      ),
      mcq(
        "q_sec6_2",
        "Dört kapıdan biri açıkken teslim?",
        ["Yeşil basılır", "Fail-closed; mühür vurulmaz", "Üçü yeter", "Port yeter"],
        1,
      ),
      mcq(
        "q_sec6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Firewall açılınca"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function kapat(girdi: {\n  email: string;\n  parola: string;\n  csrf: string | undefined;\n  oturumCsrf: string;\n  port: number;\n}): \"kapali\" {\n  const email = girdi.email.trim();\n  const parola = girdi.parola.trim();\n  if (!email) throw new Error(\"e-posta yok; işlem durur\");\n  if (!parola || parola.length < 12) throw new Error(\"parola kapısı; işlem durur\");\n  if (!girdi.csrf || girdi.csrf !== girdi.oturumCsrf) {\n    throw new Error(\"jeton yok; istek durur\");\n  }\n  if (![443, 22].includes(girdi.port)) throw new Error(\"port düşer\");\n  return \"kapali\";\n}\n\nif (\n  kapat({\n    email: \"a@b.co\",\n    parola: \"onikikaraktr\",\n    csrf: \"t1\",\n    oturumCsrf: \"t1\",\n    port: 443,\n  }) !== \"kapali\"\n) {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
] as const;

const SECURITY_TEMEL_LESSON_QUIZZES: AcademyExamQuestion[] = SECURITY_TEMEL_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları (30–50 bandı). */
export const SECURITY_TEMEL_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...SECURITY_TEMEL_LESSON_QUIZZES,
  mcq("q_sec_p1", "CIA üçlüsünde bütünlük neyi korur?", ["Hızı", "Yazının yolda değişmemesini", "Renk", "Fiyatı"], 1),
  mcq("q_sec_p2", "Erişilebilirlik düşünce üçlü durur mu?", ["Evet her zaman", "Hayır; nöbetçi uyanık değilse kale yalan söyler", "Yalnız gizlilik yeter", "Hash yeter"], 1),
  mcq("q_sec_p3", "TCP/IP bu derste nedir?", ["Renk", "Paket etiketi: adres ve kapı", "Parola", "JWT"], 1),
  mcq("q_sec_p4", "Varsayılan açık port politikası?", ["Güvenli", "Yasak; deny-by-default", "HTTP zorunlu", "RoE yerine geçer"], 1),
  mcq("q_sec_p5", "OWASP neyin listesidir?", ["Fiyat", "Web uygulama risk sınıfları", "DNS boyası", "TTS sesi"], 1),
  mcq("q_sec_p6", "Parametre bağlama ne keser?", ["CSS", "Ham sorgu birleştirmeyi", "MFA’yı", "Hash’i"], 1),
  mcq("q_sec_p7", "textContent neden durur?", ["Hız", "Kullanıcı metnini işaret olarak basmamak", "SQL hızlanır", "Port açar"], 1),
  mcq("q_sec_p8", "CSRF jetonu neyi kanıtlar?", ["DNS", "İsteğin oturumdaki formdan geldiğini", "Hash algoritmasını", "CIA gizliliğini"], 1),
  mcq("q_sec_p9", "bcrypt / Argon2 düz metinden neden üstündür?", ["Daha kısa", "Tek yönlü, tuzlu, yavaş özet", "Geri çevrilir", "Log’a yazılır"], 1),
  mcq("q_sec_p10", "MFA ikinci kapı mıdır?", ["Hayır, süs", "Evet; parola yetmez, ikinci kanıt ister", "Hash yerine geçer", "Firewall’dır"], 1),
  mcq("q_sec_p11", "RoE yazılı değilse?", ["Söz yeter", "Test durur", "Canlı sistem serbest", "Nmap zorunlu"], 1),
  mcq("q_sec_p12", "Güvenlik duvarı kuralı yoksa?", ["Paket girer", "Paket düşer", "Orta kural", "HTTP 200"], 1),
  mcq("q_sec_p13", "Mini proje teslimi ne zaman basılır?", ["Bir kapı yetince", "Dört kapı durunca", "Satın alınca", "Log yeşilince"], 1),
  mcq("q_sec_p14", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
];
