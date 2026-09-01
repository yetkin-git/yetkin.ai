/**
 * Siber Güvenlik İleri Seviye (SEC-103) — mühürlü müfredat.
 * PEDAGOJI.md: 4 perde, tek eğitmen, Fail-Closed.
 * Denetim: güvenlik mantığı varsayılan kapalı; sömürü tarifi yok.
 * Üretim: Grok 4.6. Denetim: Gemini 3.7 Flash — kapı açıkken yeşil yok.
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

export const SECURITY_ILERI_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "security-ileri-1",
    order: 1,
    title: "DevSecOps Mimarisi: CI/CD Pipeline'ına Otomatik Güvenlik Testleri (SAST/DAST/SCA) Ekleme",
    dialogue: {
      warmup: [
        can("Kalite damgası basılmadan kamyon rampadan iner mi?"),
        ece(
          "İnmez. Geliştirme-Güvenlik-İşletme (DevSecOps) o damga gişesidir: Statik Uygulama Güvenlik Testi (SAST), Dinamik Uygulama Güvenlik Testi (DAST) ve Yazılım Bileşen Analizi (SCA) sırayla basılır. Damga yoksa kamyon çıkmaz. Fail-closed (Hata Anında Kapalı): bir gişe kırmızıysa yayın durur.",
        ),
      ],
      problem: [
        can("Root sızdı, boru hattı yine yeşil. Kapı nerede kırıldı?"),
        ece(
          "Yeşil yalandır. SAST sır kalıbını görmeden, DAST oturumsuz, SCA lisans/CVE tavanı aşılmışken «geç» basmak kamyonu damgasız göndermektir. Fail-closed: üç damga durmadan `yayin` çağrılmaz. Sömürü tarifi burada yoktur; kapı kapanır.",
        ),
      ],
      development: [
        can("Üç damgayı yaz. Birini kır."),
        ece(
          "Varsayılan kapalıdır. `boruHatti` SAST temiz, DAST oturumlu, SCA tavan altında ister. Biri kırıkken yayın durur. CVE sayısı tamsayı değilse durur.",
          {
            language: "ts",
            source: `type Damga = { sastTemiz: boolean; dastOturum: boolean; scaCve: number };
const CVE_TAVAN = 0;

function boruHatti(damga: Damga): "yayin" {
  if (!damga.sastTemiz) throw new Error("SAST kırmızı; yayın durur");
  if (!damga.dastOturum) throw new Error("DAST oturumsuz; yayın durur");
  if (!Number.isInteger(damga.scaCve) || damga.scaCve > CVE_TAVAN) {
    throw new Error("SCA tavan aşıldı; yayın durur");
  }
  return "yayin";
}

if (boruHatti({ sastTemiz: true, dastOturum: true, scaCve: 0 }) !== "yayin") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        can("«Uyarı yeter, kamyon çıksın» dersek?"),
        ece(
          "Uyarı damga değildir. Fail-closed kırmızıda kamyonu tutar. Sen bu derste boru hattını kapatmayı öğreniyorsun; sonraki bölümde seni Kimlik ve Erişim Yönetimi (IAM) ve Anahtar Yönetim Servisi (KMS) bekliyor.",
        ),
      ],
      conclusion: [
        can("Üç damga, tavan sıfır, yeşil yalan. Sonraki kapı nedir?"),
        ece(
          "Boru hattı durunca bulut anahtarına ineriz. Bir sonraki bölümde seni Amazon Web Servisleri / Azure IAM, en az yetki ve KMS ile veri şifreleme bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_seci1_1",
        "Geliştirme-Güvenlik-İşletme (DevSecOps) boru hattında üç damga hangisidir?",
        ["Renk, hız, fiyat", "SAST, DAST ve SCA yazılı durur", "Yalnız log boyası", "Root her zaman"],
        1,
      ),
      mcq(
        "q_seci1_2",
        "SAST kırmızı iken dürüst yol hangisidir?",
        ["Uyarı ile yayın", "Fail-closed; yayın durur", "DAST yeter", "SCA tavanı yükseltilir"],
        1,
      ),
      mcq(
        "q_seci1_3",
        "SCA CVE tavanı aşılınca?",
        ["Yeşil basılır", "Yayın durur; kamyon çıkmaz", "Orta CVE uydurulur", "Root açılır"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "security-ileri-2",
    order: 2,
    title: "Bulut Güvenliği ve Erişim Yönetimi: AWS/Azure IAM, Least Privilege ve KMS İle Veri Şifreleme",
    dialogue: {
      warmup: [
        can("Otelde her kapıya usta anahtar mı verilir, yoksa oda fişi mi?"),
        ece(
          "Oda fişi. Kimlik ve Erişim Yönetimi (IAM) o fiştir: en az yetki, isimli rol, süre. Anahtar Yönetim Servisi (KMS) kasanın mühürüdür — veri düz metin rafta durmaz. Fail-closed: joker (`*`) veya root kalıcı anahtar varsa işlem durur.",
        ),
      ],
      problem: [
        can("Root sızınca günlükler de silinir. Fiş nerede yoktu?"),
        ece(
          "Usta anahtar her çekmeceyi açar; sızınca kasa da boşalır. Fail-closed: eylem izin listesinde değilse durur. KMS anahtarı yoksa şifreleme uydurulmaz. Bu ders sızma tarifi vermez; fişi daraltmayı öğretir.",
        ),
      ],
      development: [
        can("Rol, eylem, KMS. Joker ve boş anahtarı kır."),
        ece(
          "`iamKapi` rolü ve eylemi kümede ister. Joker eylem düşer. `kmsMuhur` anahtar kimliği boşsa durur. Varsayılan kapalıdır.",
          {
            language: "ts",
            source: `const IZINLI_ROL = new Set(["okur", "yazici"]);
const IZINLI_EYLEM = new Set(["s3:GetObject", "kms:Decrypt"]);

function iamKapi(rol: string, eylem: string): "kabul" {
  const r = rol.trim();
  const e = eylem.trim();
  if (!IZINLI_ROL.has(r) || e === "*" || !IZINLI_EYLEM.has(e)) {
    throw new Error("yetki yok; işlem durur");
  }
  return "kabul";
}

function kmsMuhur(anahtarId: string): "sifreli" {
  if (!anahtarId.trim()) throw new Error("KMS yok; şifreleme durur");
  return "sifreli";
}

if (iamKapi("okur", "s3:GetObject") !== "kabul") throw new Error("sözleşme kırıldı");
if (kmsMuhur("arn:kms:lab") !== "sifreli") throw new Error("sözleşme kırıldı");`,
          },
        ),
        can("«Geçici root, sonra sileriz» dersek?"),
        ece(
          "Geçici usta anahtar da usta anahtardır. Fail-closed joker ve root’u reddeder. Sen fişi daraltıyorsun; sonraki bölümde seni olay müdahalesi ve günlük bütünlüğü bekliyor.",
        ),
      ],
      conclusion: [
        can("İsimli rol, liste, KMS. Sonraki kapı nedir?"),
        ece(
          "Fiş daralınca sızma anına ineriz. Bir sonraki bölümde seni Olay Müdahalesi ve dijital adli bilişim mimarisi bekliyor: günlük silinmez.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_seci2_1",
        "En az yetki (least privilege) bu derste nedir?",
        ["Root her işte", "İsimli rol; eylem listede yoksa durur", "Joker * yeter", "KMS isteğe bağlı"],
        1,
      ),
      mcq(
        "q_seci2_2",
        "IAM eylemi `*` iken dürüst yol hangisidir?",
        ["Geçici kabul", "Fail-closed; işlem durur", "KMS yeter", "Azure her zaman"],
        1,
      ),
      mcq(
        "q_seci2_3",
        "KMS anahtar kimliği boşken şifreleme?",
        ["Düz metin yeter", "Fail-closed; şifreleme durur", "Root açar", "Log silinir"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "security-ileri-3",
    order: 3,
    title: "Olay Müdahalesi (Incident Response) ve Dijital Adli Bilişim (Digital Forensics) Mimarisi",
    dialogue: {
      warmup: [
        can("Yangında itfaiye hortumu basmadan önce mühürlü torba durur mu?"),
        ece(
          "Durur. Olay Müdahalesi (IR) hortum sırasıdır: hazırlık, tespit, çevreleme, kök, toparlanma. Dijital adli bilişim mühürlü torbadadır — günlük hash’lenir, zincir yazılı durur. Fail-closed: torba boş veya hash kopuksa rapor basılmaz.",
        ),
      ],
      problem: [
        can("Sızma anında günlükler silinirse mahkeme neyi görür?"),
        ece(
          "Boş sahne görür. Silinen günlük bütünlüğü kırar. Fail-closed: ekleme-yalnız raf, hash zinciri, imza. Silme eylemi listede yoktur; çağrılırsa işlem durur. Bu ders silme tarifi vermez; torbayı kapatmayı öğretir.",
        ),
      ],
      development: [
        can("Zinciri yaz. Silme ve kopuk hash’i kır."),
        ece(
          "`gunlukEkle` imza ve önceki hash ister. Eylem `sil` ise durur. Hash boşsa durur. `zincirDogrula` kopuk halkada rapor basmaz.",
          {
            language: "ts",
            source: `type Halka = { eylem: string; imza: boolean; oncekiHash: string; hash: string };

function gunlukEkle(halka: Halka): "eklendi" {
  const e = halka.eylem.trim();
  if (!e || e === "sil") throw new Error("silme yok; torba durur");
  if (!halka.imza || !halka.hash.trim() || !halka.oncekiHash.trim()) {
    throw new Error("zincir kopuk; kayıt durur");
  }
  return "eklendi";
}

function zincirDogrula(onceki: string, gelen: string): "saglam" {
  if (!onceki.trim() || onceki !== gelen) throw new Error("hash kopuk; rapor durur");
  return "saglam";
}

if (gunlukEkle({ eylem: "yaz", imza: true, oncekiHash: "a", hash: "b" }) !== "eklendi") {
  throw new Error("sözleşme kırıldı");
}
if (zincirDogrula("a", "a") !== "saglam") throw new Error("sözleşme kırıldı");`,
          },
        ),
        can("«Önce hortum, torba sonra» dersek?"),
        ece(
          "Torbayı yırtmak kanıtı yok eder. Fail-closed önce zinciri kilitler, sonra çevreleme. Sen torbayı kilitliyorsun; sonraki bölümde seni Güvenlik Bilgisi ve Olay Yönetimi (SIEM) bekliyor.",
        ),
      ],
      conclusion: [
        can("İmza, hash, silme yok. Sonraki kapı nedir?"),
        ece(
          "Torba durunca kontrol odasına çıkarız. Bir sonraki bölümde seni SIEM, Güvenlik Operasyon Merkezi (SOC) ve anomali tespiti bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_seci3_1",
        "Olay müdahalesinde mühürlü torba nedir?",
        ["Sızma tarifi", "Hash’li günlük zinciri; silme durur", "Root açma", "Kamyon damgası"],
        1,
      ),
      mcq(
        "q_seci3_2",
        "Günlük silme eylemi gelince dürüst yol hangisidir?",
        ["Önce sil, sonra yedek", "Fail-closed; torba durur", "SOC yeter", "SAST yeter"],
        1,
      ),
      mcq(
        "q_seci3_3",
        "Hash zinciri kopukken rapor?",
        ["Yeşil basılır", "Fail-closed; rapor durur", "Orta hash uydurulur", "Root imza yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "security-ileri-4",
    order: 4,
    title: "SIEM, SOC ve Günlük (Log) Analizi: Tehdit Avcılığı ve Anomali Tespiti",
    dialogue: {
      warmup: [
        can("Kontrol odasında kamera kaydı yoksa nöbetçi neyi avlar?"),
        ece(
          "Boş duvarı. Güvenlik Bilgisi ve Olay Yönetimi (SIEM) o kaydı toplar; Güvenlik Operasyon Merkezi (SOC) nöbetçidir. Tehdit avcılığı izinli kaynaktan anomali arar — izinsiz ağa girmek değil. Fail-closed: kaynak listede yoksa veya imza yoksa olay düşer.",
        ),
      ],
      problem: [
        can("Root sızdı, kayıt silindi, ekran yine yeşil. Av nerede kör?"),
        ece(
          "Kaynak yok, taban yok, imza yok. Fail-closed: imzasız veya boş gövde olay basmaz. «Her sapma saldırı» modeli değildir; taban yazılı durur. Sömürü tarifi yoktur; kapı kapanır.",
        ),
      ],
      development: [
        can("Kaynak, imza, taban. Üçünü de kır."),
        ece(
          "`siemOlay` izinli kaynak ve imza ister. Taban sıfır veya sapma tanımsızsa durur. Anomali yalnız tabanın üstünde ve imzalı kayıttan basılır.",
          {
            language: "ts",
            source: `const IZINLI_KAYNAK = new Set(["lab-vpc-flow", "lab-cloudtrail"]);

function siemOlay(girdi: {
  kaynak: string;
  imza: boolean;
  taban: number;
  deger: number;
}): "anomali" | "normal" {
  const k = girdi.kaynak.trim();
  if (!IZINLI_KAYNAK.has(k) || !girdi.imza) throw new Error("kayıt yok; olay düşer");
  if (!Number.isFinite(girdi.taban) || girdi.taban <= 0) {
    throw new Error("taban yok; av durur");
  }
  if (!Number.isFinite(girdi.deger) || girdi.deger < 0) {
    throw new Error("geçersiz değer; av durur");
  }
  if (girdi.deger > girdi.taban) return "anomali";
  return "normal";
}

if (siemOlay({ kaynak: "lab-vpc-flow", imza: true, taban: 10, deger: 12 }) !== "anomali") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        can("«Tabanı sonra koyarız» dersek?"),
        ece(
          "Tabansız av uydurmadır. Fail-closed boş tabanda durur. Sen kaydı kilitleyorsun; sonraki bölümde seni Sıfır Güven ve mikro-segmentasyon bekliyor.",
        ),
      ],
      conclusion: [
        can("İzinli kaynak, imza, taban. Sonraki kapı nedir?"),
        ece(
          "Nöbetçi durunca iç ağa ineriz. Bir sonraki bölümde seni Sıfır Güven mimarisi ve ağ mikro-segmentasyonu bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_seci4_1",
        "SIEM bu derste nedir?",
        ["Sızma aracı", "İzinli kaynaktan imzalı olay toplama", "Root açma", "Joker IAM"],
        1,
      ),
      mcq(
        "q_seci4_2",
        "Kaynak listede yokken olay?",
        ["Yine avlanır", "Fail-closed; olay düşer", "SOC sözlü yeter", "Taban uydurulur"],
        1,
      ),
      mcq(
        "q_seci4_3",
        "Taban sıfır veya tanımsızken anomali?",
        ["Her sapma saldırı", "Fail-closed; av durur", "Yeşil basılır", "DAST yeter"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "security-ileri-5",
    order: 5,
    title: "Zero Trust (Sıfır Güven Mimarisi) ve Ağ Mikro-Segmentasyonu",
    dialogue: {
      warmup: [
        can("Binanın içindeyken her kapı yine rozet ister mi?"),
        ece(
          "İster. Sıfır Güven (Zero Trust) o kuraldır: konum güven değildir. Kimlik, cihaz, segment üçlüsü her istekte sorulur. Mikro-segmentasyon koridoru odalara böler. Fail-closed: üçlüden biri boşsa paket düşer.",
        ),
      ],
      problem: [
        can("Root bir odaya girdi, bütün kat açık. Segment nerede yoktu?"),
        ece(
          "Düz ağ usta anahtardır. Fail-closed: kimlik, cihaz onayı ve segment etiketi yazılı durur. «İçerideyim» cümlesi kapı değildir. Bu ders yanal hareket tarifi vermez; koridoru kapatmayı öğretir.",
        ),
      ],
      development: [
        can("Üçlüyü yaz. Birini kır."),
        ece(
          "`sifirGuven` kimlik, cihaz ve segment kümesinde ister. Boş veya listede yoksa paket düşer. Varsayılan kapalıdır: deny by default.",
          {
            language: "ts",
            source: `const IZINLI_KIMLIK = new Set(["rol-okur"]);
const IZINLI_CIHAZ = new Set(["mdm-lab"]);
const IZINLI_SEGMENT = new Set(["app-a"]);

function sifirGuven(girdi: { kimlik: string; cihaz: string; segment: string }): "gec" {
  const k = girdi.kimlik.trim();
  const c = girdi.cihaz.trim();
  const s = girdi.segment.trim();
  if (!IZINLI_KIMLIK.has(k) || !IZINLI_CIHAZ.has(c) || !IZINLI_SEGMENT.has(s)) {
    throw new Error("üçlü yok; paket düşer");
  }
  return "gec";
}

if (sifirGuven({ kimlik: "rol-okur", cihaz: "mdm-lab", segment: "app-a" }) !== "gec") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        can("«VPN içeri aldı, yeter» dersek?"),
        ece(
          "VPN konumdur, rozet değildir. Fail-closed her kapıda üçlüyü sorar. Sen koridoru kapatıyorsun; sonraki bölümde seni otomatize boru hattı ve olay müdahale senaryosu bekliyor.",
        ),
      ],
      conclusion: [
        can("Kimlik, cihaz, segment. Mini proje bu üçlüyü mi bağlar?"),
        ece(
          "Üçlü durunca fabrikayı kurarız. Bir sonraki bölümde seni bulut üzerinde otomatize DevSecOps boru hattı ve olay müdahale senaryosu bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_seci5_1",
        "Sıfır Güven (Zero Trust) konum güveni midir?",
        ["Evet, içeride yeter", "Hayır; kimlik, cihaz, segment her istekte sorulur", "VPN yeter", "Root yeter"],
        1,
      ),
      mcq(
        "q_seci5_2",
        "Segment listede yokken paket?",
        ["İç ağ serbest", "Fail-closed; paket düşer", "IAM joker yeter", "SIEM yeter"],
        1,
      ),
      mcq(
        "q_seci5_3",
        "Mikro-segmentasyon neyi böler?",
        ["Yalnız fiyatı", "Düz ağı odalara; yanal geçiş durur", "KMS’i", "SAST damgasını"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "security-ileri-6",
    order: 6,
    title: "Mini Proje: Bulut Üzerinde Otomatize DevSecOps Boru Hattı ve Olay Müdahale Senaryosu İnşası",
    dialogue: {
      warmup: [
        can("Beş kapı ardına kadar açık: damgasız kamyon, usta anahtar, silinen günlük, kör av, düz koridor. Hangisinden başlarsın?"),
        ece(
          "Beşinden birden. Mini proje sömürü labı değildir. Senaryo: boru hattı, IAM/KMS, günlük zinciri, SIEM tabanı, Sıfır Güven. Fail-closed bir kapı açıkken teslim basmaz.",
        ),
      ],
      problem: [
        can("Ekran «bulut ayakta» deyince iş bitmiş mi? Root sızdı, log silindi?"),
        ece(
          "Yeşil yalandır. Damgasız yayın, joker yetki, kopuk hash, tabansız av, rozetsiz segment — biri duruyorsa mühür vurulmaz. Bu iskelet sahte canlı iddiası taşımaz; kapı sözleşmesini gösterir.",
        ),
      ],
      development: [
        can("Tek fonksiyon: beş kapı. Biri kırıkken dur."),
        ece(
          "`kapat` sırayla sorar. SAST/DAST/SCA kırıkken durur. Joker eylem durur. Silme veya kopuk hash durur. Kaynak/taban yoksa durur. Üçlü yoksa durur. Hepsi durunca «kapali» basılır.",
          {
            language: "ts",
            source: `function kapat(girdi: {
  sastTemiz: boolean;
  dastOturum: boolean;
  scaCve: number;
  eylem: string;
  kmsId: string;
  logEylem: string;
  hashVar: boolean;
  siemKaynak: string;
  taban: number;
  kimlik: string;
  cihaz: string;
  segment: string;
}): "kapali" {
  if (!girdi.sastTemiz || !girdi.dastOturum || girdi.scaCve !== 0) {
    throw new Error("damga yok; yayın durur");
  }
  if (!girdi.eylem.trim() || girdi.eylem === "*" || !girdi.kmsId.trim()) {
    throw new Error("yetki yok; işlem durur");
  }
  if (!girdi.logEylem.trim() || girdi.logEylem === "sil" || !girdi.hashVar) {
    throw new Error("torba durur");
  }
  if (!girdi.siemKaynak.trim() || !Number.isFinite(girdi.taban) || girdi.taban <= 0) {
    throw new Error("av durur");
  }
  if (!girdi.kimlik.trim() || !girdi.cihaz.trim() || !girdi.segment.trim()) {
    throw new Error("üçlü yok; paket düşer");
  }
  return "kapali";
}

if (
  kapat({
    sastTemiz: true,
    dastOturum: true,
    scaCve: 0,
    eylem: "s3:GetObject",
    kmsId: "arn:kms:lab",
    logEylem: "yaz",
    hashVar: true,
    siemKaynak: "lab-vpc-flow",
    taban: 10,
    kimlik: "rol-okur",
    cihaz: "mdm-lab",
    segment: "app-a",
  }) !== "kapali"
) {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        can("Bu iskelet canlı buluta bağlı mı? Sınavda ne ölçülür?"),
        ece(
          "Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Beş kapı: damga, fiş, torba, av, üçlü.",
        ),
      ],
      conclusion: [
        can("İleri kapanış bu mu: damga, fiş, torba, av, üçlü, sınava gir?"),
        ece(
          "Boru hattından Sıfır Güven’e kadar Fail-closed durur. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_seci6_1",
        "Mini projedeki senaryo sömürü labı mıdır?",
        ["Evet, zorunlu PoC", "Hayır; kapı sözleşmesi, sahte canlı iddiası yoktur", "Yalnız root", "Canlı hesap"],
        1,
      ),
      mcq(
        "q_seci6_2",
        "Beş kapıdan biri açıkken teslim?",
        ["Yeşil basılır", "Fail-closed; mühür vurulmaz", "Dördü yeter", "SIEM yeter"],
        1,
      ),
      mcq(
        "q_seci6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Bulut ayaktayken"],
        1,
      ),
    ],
  }),
] as const;

const SECURITY_ILERI_LESSON_QUIZZES: AcademyExamQuestion[] = SECURITY_ILERI_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları (30–50 bandı). */
export const SECURITY_ILERI_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...SECURITY_ILERI_LESSON_QUIZZES,
  mcq("q_seci_p1", "DevSecOps boru hattı önce ne ister?", ["Root", "SAST, DAST ve SCA damgası", "Canlı IP", "PoC"], 1),
  mcq("q_seci_p2", "SAST kırmızı iken yayın?", ["Uyarı yeter", "Fail-closed; yayın durur", "DAST yeter", "SCA yeter"], 1),
  mcq("q_seci_p3", "IAM joker eylem (`*`)?", ["Geçici root", "Fail-closed; işlem durur", "KMS yeter", "VPN yeter"], 1),
  mcq("q_seci_p4", "KMS anahtarı boşken?", ["Düz metin", "Şifreleme durur", "Root açar", "Log silinir"], 1),
  mcq("q_seci_p5", "Günlük silme olay müdahalesinde?", ["Önce sil", "Fail-closed; torba durur", "SOC yeter", "SAST yeter"], 1),
  mcq("q_seci_p6", "Hash zinciri kopukken rapor?", ["Yeşil", "Rapor durur", "Orta hash", "Root imza"], 1),
  mcq("q_seci_p7", "SIEM izinsiz kaynakta?", ["Yine avlanır", "Olay düşer; kaynak listede yok", "Taban uydurulur", "Nmap açar"], 1),
  mcq("q_seci_p8", "Tabansız anomali?", ["Her sapma saldırı", "Fail-closed; av durur", "Yeşil", "DAST yeter"], 1),
  mcq("q_seci_p9", "Sıfır Güven konum güveni midir?", ["Evet", "Hayır; kimlik, cihaz, segment sorulur", "VPN yeter", "IAM joker"], 1),
  mcq("q_seci_p10", "Segment yokken paket?", ["İç ağ serbest", "Paket düşer", "SIEM yeter", "Root yeter"], 1),
  mcq("q_seci_p11", "Mini proje teslimi ne zaman basılır?", ["Bir kapı yetince", "Beş kapı durunca", "Satın alınca", "Bulut ayaktayken"], 1),
  mcq("q_seci_p12", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_seci_p13", "Bu kurs sömürü tarifi verir mi?", ["Evet, zorunlu", "Hayır; kapıyı kapatmayı öğretir", "Yalnız IR ile", "PoC zorunlu"], 1),
  mcq("q_seci_p14", "En az yetki neyi reddeder?", ["İsimli rolü", "Joker ve kalıcı root’u", "KMS’i", "SAST’i"], 1),
];
