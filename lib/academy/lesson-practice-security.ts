/**
 * Siber Güvenlik Temel (SEC-101), Orta (SEC-102) ve İleri (SEC-103) — kod laboratuvarı.
 * Fail-closed kapı; sömürü yükü / ham SQL birleştirme / innerHTML yok.
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

export const SECURITY_TEMEL_PRACTICE: Record<string, AcademyLessonPractice> = {
  "security-temel-1": pack(
    [
      ["varlık", "parola defteri"],
      ["tehdit", "düz metin sızıntı"],
      ["etki", "gizlilik"],
      ["yasak", "boş kayıt / orta risk"],
    ],
    [
      "ciaKaydi ile varlık ve tehdidi yaz.",
      "Boş varlıkta throw bekler.",
      "Gizlilik sütununu doğrula.",
    ],
    "ts",
    `function ciaKaydi(varlik, tehdit, etki) {
  if (!String(varlik).trim() || !String(tehdit).trim()) {
    throw new Error("varlık veya tehdit yok; işlem durur");
  }
  return varlik.trim() + "|" + tehdit.trim() + "|" + etki;
}
if (ciaKaydi("parola defteri", "düz metin sızıntı", "gizlilik").split("|")[2] !== "gizlilik") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
  "security-temel-2": pack(
    [
      ["izin", "443 / 22"],
      ["varsayılan", "kapalı"],
      ["başlık", "kaynak, hedef, port"],
      ["yasak", "listede yokken kabul"],
    ],
    [
      "IZINLI_PORT kümesini aç.",
      "443 kabulünü yaz.",
      "Listede olmayan portta throw yaz.",
    ],
    "ts",
    `const IZINLI_PORT = new Set([443, 22]);
function paketKabul(port) {
  if (!IZINLI_PORT.has(port)) throw new Error("port listede yok; paket düşer");
  return "kabul";
}
if (paketKabul(443) !== "kabul") throw new Error("sözleşme kırıldı");`,
  ),
  "security-temel-3": pack(
    [
      ["SQL", "parametre $1"],
      ["DOM", "textContent"],
      ["CSRF", "jeton eşleşir"],
      ["yasak", "ham birleştirme / innerHTML"],
    ],
    [
      "E-postayı trim et, boşsa dur.",
      "query parametreli yaz.",
      "Jeton yoksa throw yaz.",
    ],
    "ts",
    `function okuKullanici(db, email) {
  const temiz = String(email).trim();
  if (!temiz) throw new Error("e-posta yok; işlem durur");
  return db.query("SELECT id FROM users WHERE email = $1", [temiz]);
}
function csrfKabul(gelen, oturum) {
  if (!gelen || gelen !== oturum) throw new Error("jeton yok; istek durur");
  return true;
}`,
  ),
  "security-temel-4": pack(
    [
      ["parola", "en az 12"],
      ["hash", "bcrypt / Argon2"],
      ["MFA", "ikinci kapı"],
      ["yasak", "düz metin INSERT"],
    ],
    [
      "Kısa parolayı reddet.",
      "hashFn(temiz, 12) çağır.",
      "MFA yoksa oturumu durdur.",
    ],
    "ts",
    `function mfaOturum(parolaOk, mfaOk) {
  if (!parolaOk || !mfaOk) throw new Error("ikinci kapı yok; oturum durur");
  return "acil";
}
if (mfaOturum(true, true) !== "acil") throw new Error("sözleşme kırıldı");`,
  ),
  "security-temel-5": pack(
    [
      ["duvar", "deny-by-default"],
      ["RoE", "yazılı kapsam"],
      ["hedef", "lab cümlesi"],
      ["yasak", "izinsiz test"],
    ],
    [
      "Listede olmayan portu düşür.",
      "yazili veya kapsam boşsa testBaslat durur.",
      "lab-hedef ile «lab» bekle.",
    ],
    "ts",
    `function testBaslat(roe) {
  if (!roe.yazili || !String(roe.kapsam).trim()) {
    throw new Error("izin yok; test durur");
  }
  return "lab";
}
if (testBaslat({ yazili: true, kapsam: "lab-hedef" }) !== "lab") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
  "security-temel-6": pack(
    [
      ["e-posta", "trim, boş yasak"],
      ["parola", "≥ 12"],
      ["CSRF", "eşleşen jeton"],
      ["port", "443 veya 22"],
    ],
    [
      "Dört kapıyı sırayla sor.",
      "Biri kırıkken throw yaz.",
      "Hepsi durunca «kapali» bas.",
    ],
    "ts",
    `function kapat(girdi) {
  if (!String(girdi.email).trim()) throw new Error("e-posta yok; işlem durur");
  if (!girdi.parola || girdi.parola.length < 12) throw new Error("parola kapısı; işlem durur");
  if (!girdi.csrf || girdi.csrf !== girdi.oturumCsrf) throw new Error("jeton yok; istek durur");
  if (![443, 22].includes(girdi.port)) throw new Error("port düşer");
  return "kapali";
}
if (kapat({ email: "a@b.co", parola: "onikikaraktr", csrf: "t1", oturumCsrf: "t1", port: 443 }) !== "kapali") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
};

/** Siber Güvenlik Orta (SEC-102) — kapı laboratuvarı; sömürü yükü yok. */
export const SECURITY_ORTA_PRACTICE: Record<string, AcademyLessonPractice> = {
  "security-orta-1": pack(
    [
      ["RoE", "yazılı kapsam"],
      ["hedef", "lab.ornek.test"],
      ["OSINT", "kamu tabela"],
      ["yasak", "listede yokken keşif"],
    ],
    [
      "yazili veya kapsam boşsa kesif durur.",
      "IZINLI_HEDEF kümesini aç.",
      "lab.ornek.test ile «pasif» bekle.",
    ],
    "ts",
    `const IZINLI_HEDEF = new Set(["lab.ornek.test"]);
function kesif(roe, hedef) {
  if (!roe.yazili || !String(roe.kapsam).trim()) {
    throw new Error("izin yok; keşif durur");
  }
  if (!IZINLI_HEDEF.has(String(hedef).trim().toLowerCase())) {
    throw new Error("hedef listede yok; işlem durur");
  }
  return "pasif";
}
if (kesif({ yazili: true, kapsam: "lab-osint" }, "lab.ornek.test") !== "pasif") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
  "security-orta-2": pack(
    [
      ["arayüz", "lab0"],
      ["hedef", "lab.ornek.test"],
      ["port", "443 / 22"],
      ["yasak", "lab dışı yakalama"],
    ],
    [
      "lab0 ile başlık kabulünü yaz.",
      "Listede olmayan arayüzde throw yaz.",
      "443 envanterini doğrula.",
    ],
    "ts",
    `const LAB_ARAYUZ = new Set(["lab0"]);
function yakala(arayuz) {
  if (!LAB_ARAYUZ.has(String(arayuz).trim())) throw new Error("arayüz yok; paket düşer");
  return "baslik";
}
if (yakala("lab0") !== "baslik") throw new Error("sözleşme kırıldı");`,
  ),
  "security-orta-3": pack(
    [
      ["sahip", "oturum = kayıt"],
      ["IDOR", "yabancı id durur"],
      ["SSRF", "izinli konak"],
      ["yasak", "özel ağ getirisi"],
    ],
    [
      "Sahip eşleşmezse throw yaz.",
      "https ve izinli konağı doğrula.",
      "Özel önekte getir durur.",
    ],
    "ts",
    `function okuKayit(oturumSahibi, kayit) {
  if (!String(oturumSahibi).trim() || kayit.sahipId !== oturumSahibi) {
    throw new Error("nesne senin değil; kayıt durur");
  }
  return kayit.id;
}
if (okuKayit("u1", { id: "f1", sahipId: "u1" }) !== "f1") throw new Error("sözleşme kırıldı");`,
  ),
  "security-orta-4": pack(
    [
      ["alg", "izinli imza"],
      ["imza", "zorunlu"],
      ["OAuth2", "izinli geri adres"],
      ["yasak", "imzasız / none"],
    ],
    [
      "Algoritma listede değilse dur.",
      "imzaVar false iken throw yaz.",
      "RS256 + imza ile «kabul» bekle.",
    ],
    "ts",
    `const IZINLI_ALG = new Set(["RS256"]);
function jwtKabul(girdi, now) {
  if (!IZINLI_ALG.has(girdi.alg) || !girdi.imzaVar || girdi.exp <= now) {
    throw new Error("jeton durur");
  }
  return "kabul";
}
if (jwtKabul({ alg: "RS256", imzaVar: true, exp: 2 }, 1) !== "kabul") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
  "security-orta-5": pack(
    [
      ["SAST", "kaynak okur"],
      ["sır", "AK: kalıbı"],
      ["fiş", "CWE + sahip"],
      ["yasak", "sahipsiz yeşil"],
    ],
    [
      "AK: kalıbında throw yaz.",
      "CWE veya sahip boşsa fiş durur.",
      "temiz kaynakta «temiz» bekle.",
    ],
    "ts",
    `function sastKapisi(kaynak) {
  if (String(kaynak).includes("AK:")) throw new Error("sır kalıbı; derleme durur");
  return "temiz";
}
if (sastKapisi("const x = 1") !== "temiz") throw new Error("sözleşme kırıldı");`,
  ),
  "security-orta-6": pack(
    [
      ["RoE", "yazılı"],
      ["sahip", "eşleşir"],
      ["JWT", "RS256 + imza"],
      ["SAST", "sır yok"],
    ],
    [
      "Dört kapıyı sırayla sor.",
      "Biri kırıkken throw yaz.",
      "Hepsi durunca «kapali» bas.",
    ],
    "ts",
    `function kapat(girdi) {
  if (!girdi.roeYazili) throw new Error("izin yok; harita durur");
  if (girdi.oturumSahibi !== girdi.kayitSahibi) throw new Error("nesne senin değil; kayıt durur");
  if (girdi.alg !== "RS256" || !girdi.imzaVar) throw new Error("jeton yok; işlem durur");
  if (String(girdi.kaynak).includes("AK:")) throw new Error("sır kalıbı; derleme durur");
  return "kapali";
}
if (kapat({ roeYazili: true, oturumSahibi: "u1", kayitSahibi: "u1", alg: "RS256", imzaVar: true, kaynak: "const x = 1" }) !== "kapali") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
};

/** Siber Güvenlik İleri (SEC-103) — mimari kapı laboratuvarı; sömürü yükü yok. */
export const SECURITY_ILERI_PRACTICE: Record<string, AcademyLessonPractice> = {
  "security-ileri-1": pack(
    [
      ["SAST", "temiz damga"],
      ["DAST", "oturumlu"],
      ["SCA", "CVE tavan 0"],
      ["yasak", "kırmızıda yayın"],
    ],
    [
      "sastTemiz false iken throw yaz.",
      "scaCve tavan üstünde durur.",
      "Üç damga ile «yayin» bekle.",
    ],
    "ts",
    `function boruHatti(damga) {
  if (!damga.sastTemiz) throw new Error("SAST kırmızı; yayın durur");
  if (!damga.dastOturum) throw new Error("DAST oturumsuz; yayın durur");
  if (damga.scaCve !== 0) throw new Error("SCA tavan aşıldı; yayın durur");
  return "yayin";
}
if (boruHatti({ sastTemiz: true, dastOturum: true, scaCve: 0 }) !== "yayin") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
  "security-ileri-2": pack(
    [
      ["rol", "okur / yazici"],
      ["eylem", "izin listesi"],
      ["KMS", "anahtar kimliği"],
      ["yasak", "joker * / boş anahtar"],
    ],
    [
      "Joker eylemde throw yaz.",
      "Boş kmsId ile dur.",
      "okur + s3:GetObject «kabul» bekle.",
    ],
    "ts",
    `const IZINLI_EYLEM = new Set(["s3:GetObject", "kms:Decrypt"]);
function iamKapi(rol, eylem) {
  if (eylem === "*" || !IZINLI_EYLEM.has(eylem)) throw new Error("yetki yok; işlem durur");
  return "kabul";
}
if (iamKapi("okur", "s3:GetObject") !== "kabul") throw new Error("sözleşme kırıldı");`,
  ),
  "security-ileri-3": pack(
    [
      ["eylem", "yaz; sil yasak"],
      ["imza", "zorunlu"],
      ["hash", "zincir"],
      ["yasak", "silme / kopuk halka"],
    ],
    [
      "eylem sil iken throw yaz.",
      "Hash boşsa dur.",
      "yaz + imza ile «eklendi» bekle.",
    ],
    "ts",
    `function gunlukEkle(halka) {
  const e = String(halka.eylem).trim();
  if (!e || e === "sil") throw new Error("silme yok; torba durur");
  if (!halka.imza || !halka.hash) throw new Error("zincir kopuk; kayıt durur");
  return "eklendi";
}
if (gunlukEkle({ eylem: "yaz", imza: true, hash: "b" }) !== "eklendi") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
  "security-ileri-4": pack(
    [
      ["kaynak", "lab-vpc-flow"],
      ["imza", "zorunlu"],
      ["taban", "pozitif"],
      ["yasak", "listede yokken av"],
    ],
    [
      "İmzasız kayıtta throw yaz.",
      "taban <= 0 iken av durur.",
      "İmzalı kaynakta anomali doğrula.",
    ],
    "ts",
    `const IZINLI_KAYNAK = new Set(["lab-vpc-flow", "lab-cloudtrail"]);
function siemOlay(girdi) {
  if (!IZINLI_KAYNAK.has(girdi.kaynak) || !girdi.imza) throw new Error("kayıt yok; olay düşer");
  if (!(girdi.taban > 0) || !(girdi.deger >= 0)) throw new Error("taban yok; av durur");
  return girdi.deger > girdi.taban ? "anomali" : "normal";
}
if (siemOlay({ kaynak: "lab-vpc-flow", imza: true, taban: 10, deger: 12 }) !== "anomali") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
  "security-ileri-5": pack(
    [
      ["kimlik", "rol-okur"],
      ["cihaz", "mdm-lab"],
      ["segment", "app-a"],
      ["yasak", "üçlü yokken geçiş"],
    ],
    [
      "Segment yoksa throw yaz.",
      "Kimlik listede değilse dur.",
      "Üçlü ile «gec» bekle.",
    ],
    "ts",
    `const IZINLI_SEGMENT = new Set(["app-a"]);
function sifirGuven(girdi) {
  if (!girdi.kimlik || !girdi.cihaz || !IZINLI_SEGMENT.has(girdi.segment)) {
    throw new Error("üçlü yok; paket düşer");
  }
  return "gec";
}
if (sifirGuven({ kimlik: "rol-okur", cihaz: "mdm-lab", segment: "app-a" }) !== "gec") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
  "security-ileri-6": pack(
    [
      ["damga", "SAST/DAST/SCA"],
      ["fiş", "IAM + KMS"],
      ["torba", "hash; silme yok"],
      ["üçlü", "kimlik, cihaz, segment"],
    ],
    [
      "Beş kapıyı sırayla sor.",
      "Biri kırıkken throw yaz.",
      "Hepsi durunca «kapali» bas.",
    ],
    "ts",
    `function kapat(girdi) {
  if (!girdi.sastTemiz || !girdi.dastOturum || girdi.scaCve !== 0) throw new Error("damga yok; yayın durur");
  if (!girdi.eylem || girdi.eylem === "*" || !girdi.kmsId) throw new Error("yetki yok; işlem durur");
  if (!girdi.logEylem || girdi.logEylem === "sil" || !girdi.hashVar) throw new Error("torba durur");
  if (!girdi.siemKaynak || girdi.taban <= 0) throw new Error("av durur");
  if (!girdi.kimlik || !girdi.cihaz || !girdi.segment) throw new Error("üçlü yok; paket düşer");
  return "kapali";
}
if (kapat({ sastTemiz: true, dastOturum: true, scaCve: 0, eylem: "s3:GetObject", kmsId: "arn:kms:lab", logEylem: "yaz", hashVar: true, siemKaynak: "lab-vpc-flow", taban: 10, kimlik: "rol-okur", cihaz: "mdm-lab", segment: "app-a" }) !== "kapali") {
  throw new Error("sözleşme kırıldı");
}`,
  ),
};
