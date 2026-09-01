/**
 * Siber Güvenlik Temel Seviye (SEC-101) — mühürlü müfredat.
 * PEDAGOJI.md: 5 perde, DialogueTurn[], Ece %95 / Can %100, Fail-Closed.
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

export const SECURITY_TEMEL_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "security-temel-1",
    order: 1,
    title: "Siber güvenliğe giriş: CIA üçlüsü ve tehdit modelleri",
    dialogue: {
      warmup: [
        can(
          "Sen bir kalenin kapısını çizdin mi? Nöbetçi, anahtar, perde. Üçü birden durmazsa kale kale değildir. Dijital tarafta da aynı üçlü mü duruyor?",
        ),
        ece(
          "Duruyor. Gizlilik-bütünlük-erişilebilirlik üçlüsü (CIA) o kale tarifidir. Perde: bakılmaması gereken içeri bakılmaz. Mühür: yazı yolda değişmez. Nöbetçi uyanık: kapı meşru elde açılır. Biri düşerse kale yalan söyler.",
        ),
      ],
      problem: [
        can("Saha tarafında bu üçlü nasıl sessizce kırılıyor? Ekran yine yeşil mi kalıyor?"),
        ece(
          "Yeşil kalır. Yedek alınmadan disk ölür: erişilebilirlik düşer, perde durur. Düz metin parola deftere yazılır: gizlilik düşer, kapı yine açılır. Log satırı sonradan silinir: bütünlük düşer, kimse fark etmez. Fail-closed (Hata Anında Kapalı) burada durur: üçlü net değilse işlem durur, «bir şekilde yürür» uydurulmaz.",
        ),
      ],
      development: [
        can("Tehdit modelini masaya koy. Kim, neyi, neden istiyor — yoksa her kapıyı aynı boya mı sürüyoruz?"),
        ece(
          "Tehdit modeli varlık, tehdit, etki üçlüsüdür. Varlık yoksa risk uydurulmaz. Fail-closed: varlık, tehdit veya etki boşsa kayıt basılmaz. «Herkes kötü» cümlesi model değildir; isim, niyet ve zarar yazılı durur.",
          {
            language: "ts",
            source: `type CiaSutun = "gizlilik" | "butunluk" | "erisilebilirlik";

function ciaKaydi(varlik: string, tehdit: string, etki: CiaSutun): string {
  const v = varlik.trim();
  const t = tehdit.trim();
  if (!v || !t) {
    throw new Error("varlık veya tehdit yok; işlem durur");
  }
  return \`\${v}|\${t}|\${etki}\`;
}

if (ciaKaydi("parola defteri", "düz metin sızıntı", "gizlilik") !== "parola defteri|düz metin sızıntı|gizlilik") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        can("Boş varlıkla «orta risk» basarsak ne kırılır?"),
        ece(
          "Orta değer yalandır. Fail-closed boş kaydı reddeder. Kale tarifinde perde, mühür, nöbetçi ayrı durur; birini «ortalama» diye boyamak kapıyı açmaz, kapatır.",
        ),
      ],
      conclusion: [
        can("Kafamda oturdu: üçlü yazılı, tehdit isimli, boş kayıt yok. Sonraki adımda ne duruyor?"),
        ece(
          "Kale tarifini ağ kapısına bağlarız. Bir sonraki bölümde seni İletim Kontrol Protokolü / İnternet Protokolü (TCP/IP), portlar ve paket inceleme mantığı bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_sec1_1",
        "Gizlilik-bütünlük-erişilebilirlik üçlüsü (CIA) hangisidir?",
        [
          "Hız, fiyat, renk",
          "Gizlilik, bütünlük, erişilebilirlik",
          "Yalnız şifre uzunluğu",
          "Yalnız güvenlik duvarı markası",
        ],
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
  }),
  academyFiveActLessonDraft({
    key: "security-temel-2",
    order: 2,
    title: "Ağ temelleri: TCP/IP, portlar, Wireshark ve paket inceleme mantığı",
    dialogue: {
      warmup: [
        can(
          "Kargo şubesinde paket üstünde sokak, kapı numarası ve daire yazmazsa kamyon nereye gider? Elin uzanır, durur. Ağda da paket böyle mi duruyor?",
        ),
        ece(
          "Böyle. İletim Kontrol Protokolü / İnternet Protokolü (TCP/IP) o etikettir. Adres sokak numarasıdır, port daire kapısıdır. Wireshark o etiketi okuyan mercektir: başlık görünür, içeriğe saldırı tarifi yazılmaz. Etiket yoksa kamyona yükleme. Fail-closed: izin listesinde olmayan kapı açılmaz.",
        ),
      ],
      problem: [
        can("Herkese açık 65535 daireyi açık bırakırsak saha nerede patlar? Paket inceleme neyi gösterir, neyi göstermez?"),
        ece(
          "Gereksiz açık port, bekçisiz daire gibidir. Paket inceleme mantığı başlığı okur: kaynak, hedef, port. Wireshark laboratuvarda o başlığı gösterir; canlı ağa saldırı tarifi burada yoktur. Fail-closed laboratuvarı: izinli port yoksa paket düşer, «bir bakayım» diye içeri alınmaz.",
        ),
      ],
      development: [
        can("İzin listesini yaz. 443 ve 22 dışını bir kez kır."),
        ece(
          "Varsayılan kapalıdır. Liste yazılı durur. Port tamsayı değilse veya listede yoksa işlem durur. Bu, güvenlik duvarının küçük hali: deny by default.",
          {
            language: "ts",
            source: `const IZINLI_PORT = new Set([443, 22]);

function paketKabul(port: number): "kabul" {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("port yok; işlem durur");
  }
  if (!IZINLI_PORT.has(port)) {
    throw new Error("port listede yok; paket düşer");
  }
  return "kabul";
}

if (paketKabul(443) !== "kabul") throw new Error("sözleşme kırıldı");`,
          },
        ),
        can("80 numarayı «herkes HTTP kullanır» diye açarsak?"),
        ece(
          "Açıklama kapı değildir. Fail-closed listede yoksa düşer. Paket inceleme başlığı okur, içeriği sömürmez; tarife burada biter.",
        ),
      ],
      conclusion: [
        can("Etiket, daire, varsayılan kapalı. Sonraki adım kale içindeki vitrin mi?"),
        ece(
          "Ağ kapısı durunca vitrin katmanına ineriz. Bir sonraki bölümde seni Açık Web Uygulaması Güvenlik Projesi (OWASP) ve üç yaygın web kapısı bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "security-temel-3",
    order: 3,
    title: "Web güvenliği: OWASP Top 10, SQL enjeksiyonu, XSS ve CSRF",
    dialogue: {
      warmup: [
        can(
          "Gişede «hesap numaranızı söyleyin» dersin. Biri kâğıda kendi cümlesini yazıp vezneye uzatırsa, sen o kâğıdı deftere yapıştırır mısın?",
        ),
        ece(
          "Yapıştırmazsın. Açık Web Uygulaması Güvenlik Projesi (OWASP) o gişe disiplinidir. Yapılandırılmış Sorgu Dili (SQL) enjeksiyonu, Siteler Arası Komut Çalıştırma (XSS) ve Siteler Arası İstek Sahteciliği (CSRF) üçü de aynı günah: kullanıcı metnini tarif sanmak.",
        ),
      ],
      problem: [
        can("Ham string’i sorguya yapıştırmak veya innerHTML’e kullanıcı adı basmak sahada nasıl yeşil kalır?"),
        ece(
          "Ekran yeşil, defter yalan. Birleştirilmiş sorgu kapıyı söker; innerHTML vitrine yabancı işaret basar; jetonu olmayan POST başkasının gişesini çalıştırır. Fail-closed: parametre bağlanır, metin textContent ile basılır, CSRF jetonu yoksa istek durur. Sömürü cümlesi yazılmaz; kapı kapanır.",
        ),
      ],
      development: [
        can("Üç kapıyı yan yana göster. Hangisi önce durur?"),
        ece(
          "Üçü de aynı anda durur. Sorgu parametrelidir. Çıktı textContent’tir. Değiştiren istekte oturum jetonu sorulur. Biri eksikse teslim yoktur.",
          {
            language: "ts",
            source: `function okuKullanici(
  db: { query: (sql: string, p: string[]) => { id: string } | null },
  email: string,
) {
  const temiz = email.trim();
  if (!temiz) throw new Error("e-posta yok; işlem durur");
  return db.query("SELECT id FROM users WHERE email = $1", [temiz]);
}

function basAd(el: { textContent: string }, ad: string) {
  el.textContent = ad;
}

function csrfKabul(gelen: string | undefined, oturum: string): true {
  if (!gelen || gelen !== oturum) {
    throw new Error("jeton yok; istek durur");
  }
  return true;
}`,
          },
        ),
        can("«innerHTML hızlı» diye geçsek?"),
        ece(
          "Hız kapı değildir. Fail-closed vitrine kullanıcı metnini işaret olarak basmaz. OWASP listesi öncelik verir; bu ders üç kapıyı kapatmayı öğretir, sömürmeyi değil.",
        ),
      ],
      conclusion: [
        can("Gişe: parametre, textContent, jeton. Sonraki adım kimlik kapısı mı?"),
        ece(
          "Vitrin kapandı. Bir sonraki bölümde seni parola hash’leme — bcrypt / Argon2 — ve Çok Faktörlü Kimlik Doğrulama (MFA) bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "security-temel-4",
    order: 4,
    title: "Kimlik kapısı: parola hash’leme, bcrypt, Argon2 ve MFA",
    dialogue: {
      warmup: [
        can(
          "Vestiyerde paltona isim yazıp asarsan, gece gelen herkes o ismi okur. Fiş verirsen palto fişle çıkar. Parola defteri hangisine benziyor?",
        ),
        ece(
          "Fişe benzemeli. Düz metin parola vestiyer kâğıdıdır: sızınca her kapı açılır. bcrypt ve Argon2 o fiştir — tek yönlü, yavaş, tuzlu. Çok Faktörlü Kimlik Doğrulama (MFA) ikinci kapıdır: fiş yetmez, ikinci kanıt ister.",
        ),
      ],
      problem: [
        can("Veritabanında düz metin durursa saha nasıl patlar? Hash «şifreleme» midir?"),
        ece(
          "Sızıntıda bütün hesaplar açık kalır. Hash şifreleme değildir; geri çevrilemez özetdir. «MD5 yeter» yalandır. Fail-closed: boş parola, kısa parola, düz metin INSERT — üçü de durur. MFA bayrağı yoksa oturum yeşil basılmaz.",
        ),
      ],
      development: [
        can("Hash kapısını yaz. Boş ve kısa parolayı bir kez kır."),
        ece(
          "Uzunluk ve boşluk önce sorulur. Hash kütüphanesi tuzu kendi basar. Karşılaştırma zaman sabit tutulur; `===` ile ham metin kıyaslanmaz. MFA kapısı ayrı bayraktır: yoksa oturum durur.",
          {
            language: "ts",
            source: `async function parolaHash(
  parola: string,
  hashFn: (p: string, cost: number) => Promise<string>,
) {
  const temiz = parola.trim();
  if (!temiz || temiz.length < 12) {
    throw new Error("parola yok veya kısa; işlem durur");
  }
  return hashFn(temiz, 12);
}

function mfaOturum(parolaOk: boolean, mfaOk: boolean): "acil" {
  if (!parolaOk || !mfaOk) {
    throw new Error("ikinci kapı yok; oturum durur");
  }
  return "acil";
}

if (mfaOturum(true, true) !== "acil") throw new Error("sözleşme kırıldı");`,
          },
        ),
        can("Hash’i veri tabanına yazmadan log’a basarsak?"),
        ece(
          "Log da vestiyer kâğıdıdır. Fail-closed sır ve hash’i günlükte gezdirmez. Argon2 bellek maliyeti bcrypt’ten ayrı bir tarif; ikisi de düz metinden üstündür, boş parolayı kurtarmaz.",
        ),
      ],
      conclusion: [
        can("Fiş, tuz, ikinci kapı. Sonraki adım kale duvarı ve izin kâğıdı mı?"),
        ece(
          "Kimlik kapısı durunca duvar ve etik durur. Bir sonraki bölümde seni güvenlik duvarı ve sızma testi etkileşim kuralları bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "security-temel-5",
    order: 5,
    title: "Sistem güvenliği: güvenlik duvarı ve sızma testi etikleri",
    dialogue: {
      warmup: [
        can(
          "Gece kulübünde bekçi «tanımıyorum, giremezsin» der. Liste yoksa herkes girer. Güvenlik duvarı o bekçi midir?",
        ),
        ece(
          "Öyledir. Varsayılan kapalı, izin listesi yazılı. «Bir bakayım» diye her portu açmak bekçiyi evine göndermektir. Fail-closed: kural yoksa paket düşer.",
        ),
      ],
      problem: [
        can("Sızma testi izinsiz yapılırsa ne kırılır? Etkileşim kuralları (RoE) yokken «lab» demek yeter mi?"),
        ece(
          "Yeter değil. Yazılı izin, kapsam, süre ve yasak yoksa test durur. Bu ders saldırı tarifi vermez; etik kapıyı öğretir. Fail-closed: RoE yoksa el uzamaz. Canlı sistem «merak» ile yoklanırsa hem yasa hem güven kırılır.",
        ),
      ],
      development: [
        can("Duvar kuralını ve izin kâğıdını yan yana yaz."),
        ece(
          "Güvenlik duvarı deny-by-default. RoE yazılı değilse test fonksiyonu çağrılmaz. Kapsam boşsa durur. Laboratuvar hedefi cümlede durur; canlı adres uydurulmaz.",
          {
            language: "ts",
            source: `type Roe = { yazili: boolean; kapsam: string };

function duvarKabul(port: number, izin: ReadonlySet<number>): "kabul" {
  if (!izin.has(port)) throw new Error("kural yok; paket düşer");
  return "kabul";
}

function testBaslat(roe: Roe): "lab" {
  const kapsam = roe.kapsam.trim();
  if (!roe.yazili || !kapsam) {
    throw new Error("izin yok; test durur");
  }
  return "lab";
}

if (duvarKabul(443, new Set([443])) !== "kabul") throw new Error("sözleşme kırıldı");
if (testBaslat({ yazili: true, kapsam: "lab-hedef" }) !== "lab") throw new Error("sözleşme kırıldı");`,
          },
        ),
        can("«İzin sözlüydü» diye geçersek?"),
        ece(
          "Söz kapı değildir. Fail-closed yazılı RoE ister. Duvar ve etik aynı disiplindir: varsayılan kapalı, açık cümle yoksa dur.",
        ),
      ],
      conclusion: [
        can("Bekçi ve izin kâğıdı. Mini projede kapıları tek tek kapatacak mıyız?"),
        ece(
          "Kapatacağız. Bir sonraki bölümde seni zafiyetli bir web iskeletini analiz edip Fail-closed kapılarla kapatma bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "security-temel-6",
    order: 6,
    title: "Mini proje: zafiyetli web uygulamasını analiz edip kapatma",
    dialogue: {
      warmup: [
        can(
          "Kalenin dört kapısı ardına kadar açık: defter yapıştırması, vitrin işareti, düz metin fiş, bekçisiz port. Sen hangisinden başlarsın?",
        ),
        ece(
          "Dördünden birden. Mini proje sömürü labı değildir. Analiz: kapı nerede açık. Kapatma: parametre, textContent, hash+MFA, varsayılan deny. Fail-closed bir kapı açıkken teslim basmaz.",
        ),
      ],
      problem: [
        can("Ekran «giriş başarılı» deyince iş bitmiş mi sayılıyor? Dört kapıdan biri açık kalsa?"),
        ece(
          "Yeşil yalandır. Ham SQL birleştirme, innerHTML, düz metin parola, RoE’süz «test» — biri duruyorsa mühür vurulmaz. Bu derste kapatılan iskelet sahte canlı iddiası taşımaz; kapı sözleşmesini gösterir.",
        ),
      ],
      development: [
        can("Tek fonksiyon: e-posta, parola, jeton, port. Biri kırıkken dur."),
        ece(
          "`kapat` dört kapıyı sırayla sorar. E-posta boşsa durur. Parola kısa ise durur. CSRF jetonu yoksa durur. Port listede yoksa durur. Hepsi durunca «kapali» basılır. Sömürü cümlesi yok.",
          {
            language: "ts",
            source: `function kapat(girdi: {
  email: string;
  parola: string;
  csrf: string | undefined;
  oturumCsrf: string;
  port: number;
}): "kapali" {
  const email = girdi.email.trim();
  const parola = girdi.parola.trim();
  if (!email) throw new Error("e-posta yok; işlem durur");
  if (!parola || parola.length < 12) throw new Error("parola kapısı; işlem durur");
  if (!girdi.csrf || girdi.csrf !== girdi.oturumCsrf) {
    throw new Error("jeton yok; istek durur");
  }
  if (![443, 22].includes(girdi.port)) throw new Error("port düşer");
  return "kapali";
}

if (
  kapat({
    email: "a@b.co",
    parola: "onikikaraktr",
    csrf: "t1",
    oturumCsrf: "t1",
    port: 443,
  }) !== "kapali"
) {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        can("Bu iskelet canlı modele veya gerçek ağa bağlı mı? Sınavda ne ölçülür?"),
        ece(
          "Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Dört kapı: parametre, textContent, hash+MFA, varsayılan deny.",
        ),
      ],
      conclusion: [
        can("Temel kapanış bu mu: üçlü, ağ, OWASP, fiş, duvar, kapat, sınava gir?"),
        ece(
          "Kale tarifinden kapatmaya kadar Fail-closed durur. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
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
