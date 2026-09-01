/**
 * Siber Güvenlik İleri Seviye (SEC-103) — mühürlü müfredat.
 * PEDAGOJI.md: 4 perde, tek eğitmen, Fail-Closed.
 * Denetim: güvenlik mantığı varsayılan kapalı; sömürü tarifi yok.
 * Üretim: Grok 4.6. Denetim: Gemini 3.7 Flash — kapı açıkken yeşil yok.
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

export const SECURITY_ILERI_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "security-ileri-1",
    order: 1,
    title: "DevSecOps Mimarisi: CI/CD Pipeline'ına Otomatik Güvenlik Testleri (SAST/DAST/SCA) Ekleme",
    intro: "Hoş geldiniz. Bu bölümde DevSecOps Mimarisi: CI/CD Pipeline'ına Otomatik Güvenlik Testleri (SAST/DAST/SCA) Ekleme konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Kalite damgası basılmadan kamyon rampadan iner mi. İnmez. Geliştirme-Güvenlik-İşletme (DevSecOps) o damga gişesidir: Statik Uygulama Güvenlik Testi (SAST), Dinamik Uygulama Güvenlik Testi (DAST) ve Yazılım Bileşen Analizi (SCA) sırayla basılır. Damga yoksa kamyon çıkmaz. Fail-closed (Hata Anında Kapalı): bir gişe kırmızıysa yayın durur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Root sızdı, boru hattı yine yeşil. Kapı nerede kırıldı. Yeşil yalandır. SAST sır kalıbını görmeden, DAST oturumsuz, SCA lisans/CVE tavanı aşılmışken «geç» basmak kamyonu damgasız göndermektir. Fail-closed: üç damga durmadan `yayin` çağrılmaz. Sömürü tarifi burada yoktur; kapı kapanır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Üç damgayı yaz. Birini kır. Varsayılan kapalıdır. `boruHatti` SAST temiz, DAST oturumlu, SCA tavan altında ister. Biri kırıkken yayın durur. CVE sayısı tamsayı değilse durur. «Uyarı yeter, kamyon çıksın» dersek. Uyarı damga değildir. Fail-closed kırmızıda kamyonu tutar. Sen bu derste boru hattını kapatmayı öğreniyorsun; sonraki bölümde seni Kimlik ve Erişim Yönetimi (IAM) ve Anahtar Yönetim Servisi (KMS) bekliyor.",
    summary: "Bu dersle DevSecOps Mimarisi: CI/CD Pipeline'ına Otomatik Güvenlik Testleri (SAST/DAST/SCA) Ekleme becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Üç damga, tavan sıfır, yeşil yalan. Sonraki kapı nedir. Boru hattı durunca bulut anahtarına ineriz. Bir sonraki bölümde seni Amazon Web Servisleri / Azure IAM, en az yetki ve KMS ile veri şifreleme bekliyor.",
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
    code: {
      language: "ts",
      source: "type Damga = { sastTemiz: boolean; dastOturum: boolean; scaCve: number };\nconst CVE_TAVAN = 0;\n\nfunction boruHatti(damga: Damga): \"yayin\" {\n  if (!damga.sastTemiz) throw new Error(\"SAST kırmızı; yayın durur\");\n  if (!damga.dastOturum) throw new Error(\"DAST oturumsuz; yayın durur\");\n  if (!Number.isInteger(damga.scaCve) || damga.scaCve > CVE_TAVAN) {\n    throw new Error(\"SCA tavan aşıldı; yayın durur\");\n  }\n  return \"yayin\";\n}\n\nif (boruHatti({ sastTemiz: true, dastOturum: true, scaCve: 0 }) !== \"yayin\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-ileri-2",
    order: 2,
    title: "Bulut Güvenliği ve Erişim Yönetimi: AWS/Azure IAM, Least Privilege ve KMS İle Veri Şifreleme",
    intro: "Hoş geldiniz. Bu bölümde Bulut Güvenliği ve Erişim Yönetimi: AWS/Azure IAM, Least Privilege ve KMS İle Veri Şifreleme konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Otelde her kapıya usta anahtar mı verilir, yoksa oda fişi mi. Oda fişi. Kimlik ve Erişim Yönetimi (IAM) o fiştir: en az yetki, isimli rol, süre. Anahtar Yönetim Servisi (KMS) kasanın mühürüdür — veri düz metin rafta durmaz. Fail-closed: joker (`*`) veya root kalıcı anahtar varsa işlem durur.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Root sızınca günlükler de silinir. Fiş nerede yoktu. Usta anahtar her çekmeceyi açar; sızınca kasa da boşalır. Fail-closed: eylem izin listesinde değilse durur. KMS anahtarı yoksa şifreleme uydurulmaz. Bu ders sızma tarifi vermez; fişi daraltmayı öğretir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Rol, eylem, KMS. Joker ve boş anahtarı kır. `iamKapi` rolü ve eylemi kümede ister. Joker eylem düşer. `kmsMuhur` anahtar kimliği boşsa durur. Varsayılan kapalıdır. «Geçici root, sonra sileriz» dersek. Geçici usta anahtar da usta anahtardır. Fail-closed joker ve root’u reddeder. Sen fişi daraltıyorsun; sonraki bölümde seni olay müdahalesi ve günlük bütünlüğü bekliyor.",
    summary: "Bu dersle Bulut Güvenliği ve Erişim Yönetimi: AWS/Azure IAM, Least Privilege ve KMS İle Veri Şifreleme becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. İsimli rol, liste, KMS. Sonraki kapı nedir. Fiş daralınca sızma anına ineriz. Bir sonraki bölümde seni Olay Müdahalesi ve dijital adli bilişim mimarisi bekliyor: günlük silinmez.",
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
    code: {
      language: "ts",
      source: "const IZINLI_ROL = new Set([\"okur\", \"yazici\"]);\nconst IZINLI_EYLEM = new Set([\"s3:GetObject\", \"kms:Decrypt\"]);\n\nfunction iamKapi(rol: string, eylem: string): \"kabul\" {\n  const r = rol.trim();\n  const e = eylem.trim();\n  if (!IZINLI_ROL.has(r) || e === \"*\" || !IZINLI_EYLEM.has(e)) {\n    throw new Error(\"yetki yok; işlem durur\");\n  }\n  return \"kabul\";\n}\n\nfunction kmsMuhur(anahtarId: string): \"sifreli\" {\n  if (!anahtarId.trim()) throw new Error(\"KMS yok; şifreleme durur\");\n  return \"sifreli\";\n}\n\nif (iamKapi(\"okur\", \"s3:GetObject\") !== \"kabul\") throw new Error(\"sözleşme kırıldı\");\nif (kmsMuhur(\"arn:kms:lab\") !== \"sifreli\") throw new Error(\"sözleşme kırıldı\");",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-ileri-3",
    order: 3,
    title: "Olay Müdahalesi (Incident Response) ve Dijital Adli Bilişim (Digital Forensics) Mimarisi",
    intro: "Hoş geldiniz. Bu bölümde Olay Müdahalesi (Incident Response) ve Dijital Adli Bilişim (Digital Forensics) Mimarisi konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Yangında itfaiye hortumu basmadan önce mühürlü torba durur mu. Durur. Olay Müdahalesi (IR) hortum sırasıdır: hazırlık, tespit, çevreleme, kök, toparlanma. Dijital adli bilişim mühürlü torbadadır — günlük hash’lenir, zincir yazılı durur. Fail-closed: torba boş veya hash kopuksa rapor basılmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Sızma anında günlükler silinirse mahkeme neyi görür. Boş sahne görür. Silinen günlük bütünlüğü kırar. Fail-closed: ekleme-yalnız raf, hash zinciri, imza. Silme eylemi listede yoktur; çağrılırsa işlem durur. Bu ders silme tarifi vermez; torbayı kapatmayı öğretir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Zinciri yaz. Silme ve kopuk hash’i kır. `gunlukEkle` imza ve önceki hash ister. Eylem `sil` ise durur. Hash boşsa durur. `zincirDogrula` kopuk halkada rapor basmaz. «Önce hortum, torba sonra» dersek. Torbayı yırtmak kanıtı yok eder. Fail-closed önce zinciri kilitler, sonra çevreleme. Sen torbayı kilitliyorsun; sonraki bölümde seni Güvenlik Bilgisi ve Olay Yönetimi (SIEM) bekliyor.",
    summary: "Bu dersle Olay Müdahalesi (Incident Response) ve Dijital Adli Bilişim (Digital Forensics) Mimarisi becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. İmza, hash, silme yok. Sonraki kapı nedir. Torba durunca kontrol odasına çıkarız. Bir sonraki bölümde seni SIEM, Güvenlik Operasyon Merkezi (SOC) ve anomali tespiti bekliyor.",
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
    code: {
      language: "ts",
      source: "type Halka = { eylem: string; imza: boolean; oncekiHash: string; hash: string };\n\nfunction gunlukEkle(halka: Halka): \"eklendi\" {\n  const e = halka.eylem.trim();\n  if (!e || e === \"sil\") throw new Error(\"silme yok; torba durur\");\n  if (!halka.imza || !halka.hash.trim() || !halka.oncekiHash.trim()) {\n    throw new Error(\"zincir kopuk; kayıt durur\");\n  }\n  return \"eklendi\";\n}\n\nfunction zincirDogrula(onceki: string, gelen: string): \"saglam\" {\n  if (!onceki.trim() || onceki !== gelen) throw new Error(\"hash kopuk; rapor durur\");\n  return \"saglam\";\n}\n\nif (gunlukEkle({ eylem: \"yaz\", imza: true, oncekiHash: \"a\", hash: \"b\" }) !== \"eklendi\") {\n  throw new Error(\"sözleşme kırıldı\");\n}\nif (zincirDogrula(\"a\", \"a\") !== \"saglam\") throw new Error(\"sözleşme kırıldı\");",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-ileri-4",
    order: 4,
    title: "SIEM, SOC ve Günlük (Log) Analizi: Tehdit Avcılığı ve Anomali Tespiti",
    intro: "Hoş geldiniz. Bu bölümde SIEM, SOC ve Günlük (Log) Analizi: Tehdit Avcılığı ve Anomali Tespiti konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Kontrol odasında kamera kaydı yoksa nöbetçi neyi avlar. Boş duvarı. Güvenlik Bilgisi ve Olay Yönetimi (SIEM) o kaydı toplar; Güvenlik Operasyon Merkezi (SOC) nöbetçidir. Tehdit avcılığı izinli kaynaktan anomali arar — izinsiz ağa girmek değil. Fail-closed: kaynak listede yoksa veya imza yoksa olay düşer.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Root sızdı, kayıt silindi, ekran yine yeşil. Av nerede kör. Kaynak yok, taban yok, imza yok. Fail-closed: imzasız veya boş gövde olay basmaz. «Her sapma saldırı» modeli değildir; taban yazılı durur. Sömürü tarifi yoktur; kapı kapanır.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Kaynak, imza, taban. Üçünü de kır. `siemOlay` izinli kaynak ve imza ister. Taban sıfır veya sapma tanımsızsa durur. Anomali yalnız tabanın üstünde ve imzalı kayıttan basılır. «Tabanı sonra koyarız» dersek. Tabansız av uydurmadır. Fail-closed boş tabanda durur. Sen kaydı kilitleyorsun; sonraki bölümde seni Sıfır Güven ve mikro-segmentasyon bekliyor.",
    summary: "Bu dersle SIEM, SOC ve Günlük (Log) Analizi: Tehdit Avcılığı ve Anomali Tespiti becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. İzinli kaynak, imza, taban. Sonraki kapı nedir. Nöbetçi durunca iç ağa ineriz. Bir sonraki bölümde seni Sıfır Güven mimarisi ve ağ mikro-segmentasyonu bekliyor.",
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
    code: {
      language: "ts",
      source: "const IZINLI_KAYNAK = new Set([\"lab-vpc-flow\", \"lab-cloudtrail\"]);\n\nfunction siemOlay(girdi: {\n  kaynak: string;\n  imza: boolean;\n  taban: number;\n  deger: number;\n}): \"anomali\" | \"normal\" {\n  const k = girdi.kaynak.trim();\n  if (!IZINLI_KAYNAK.has(k) || !girdi.imza) throw new Error(\"kayıt yok; olay düşer\");\n  if (!Number.isFinite(girdi.taban) || girdi.taban <= 0) {\n    throw new Error(\"taban yok; av durur\");\n  }\n  if (!Number.isFinite(girdi.deger) || girdi.deger < 0) {\n    throw new Error(\"geçersiz değer; av durur\");\n  }\n  if (girdi.deger > girdi.taban) return \"anomali\";\n  return \"normal\";\n}\n\nif (siemOlay({ kaynak: \"lab-vpc-flow\", imza: true, taban: 10, deger: 12 }) !== \"anomali\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-ileri-5",
    order: 5,
    title: "Zero Trust (Sıfır Güven Mimarisi) ve Ağ Mikro-Segmentasyonu",
    intro: "Hoş geldiniz. Bu bölümde Zero Trust (Sıfır Güven Mimarisi) ve Ağ Mikro-Segmentasyonu konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Binanın içindeyken her kapı yine rozet ister mi. İster. Sıfır Güven (Zero Trust) o kuraldır: konum güven değildir. Kimlik, cihaz, segment üçlüsü her istekte sorulur. Mikro-segmentasyon koridoru odalara böler. Fail-closed: üçlüden biri boşsa paket düşer.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Root bir odaya girdi, bütün kat açık. Segment nerede yoktu. Düz ağ usta anahtardır. Fail-closed: kimlik, cihaz onayı ve segment etiketi yazılı durur. «İçerideyim» cümlesi kapı değildir. Bu ders yanal hareket tarifi vermez; koridoru kapatmayı öğretir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Üçlüyü yaz. Birini kır. `sifirGuven` kimlik, cihaz ve segment kümesinde ister. Boş veya listede yoksa paket düşer. Varsayılan kapalıdır: deny by default. «VPN içeri aldı, yeter» dersek. VPN konumdur, rozet değildir. Fail-closed her kapıda üçlüyü sorar. Sen koridoru kapatıyorsun; sonraki bölümde seni otomatize boru hattı ve olay müdahale senaryosu bekliyor.",
    summary: "Bu dersle Zero Trust (Sıfır Güven Mimarisi) ve Ağ Mikro-Segmentasyonu becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Kimlik, cihaz, segment. Mini proje bu üçlüyü mi bağlar. Üçlü durunca fabrikayı kurarız. Bir sonraki bölümde seni bulut üzerinde otomatize DevSecOps boru hattı ve olay müdahale senaryosu bekliyor.",
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
    code: {
      language: "ts",
      source: "const IZINLI_KIMLIK = new Set([\"rol-okur\"]);\nconst IZINLI_CIHAZ = new Set([\"mdm-lab\"]);\nconst IZINLI_SEGMENT = new Set([\"app-a\"]);\n\nfunction sifirGuven(girdi: { kimlik: string; cihaz: string; segment: string }): \"gec\" {\n  const k = girdi.kimlik.trim();\n  const c = girdi.cihaz.trim();\n  const s = girdi.segment.trim();\n  if (!IZINLI_KIMLIK.has(k) || !IZINLI_CIHAZ.has(c) || !IZINLI_SEGMENT.has(s)) {\n    throw new Error(\"üçlü yok; paket düşer\");\n  }\n  return \"gec\";\n}\n\nif (sifirGuven({ kimlik: \"rol-okur\", cihaz: \"mdm-lab\", segment: \"app-a\" }) !== \"gec\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "security-ileri-6",
    order: 6,
    title: "Mini Proje: Bulut Üzerinde Otomatize DevSecOps Boru Hattı ve Olay Müdahale Senaryosu İnşası",
    intro: "Hoş geldiniz. Bu bölümde Mini Proje: Bulut Üzerinde Otomatize DevSecOps Boru Hattı ve Olay Müdahale Senaryosu İnşası konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Beş kapı ardına kadar açık: damgasız kamyon, usta anahtar, silinen günlük, kör av, düz koridor. Hangisinden başlarsın. Beşinden birden. Mini proje sömürü labı değildir. Senaryo: boru hattı, IAM/KMS, günlük zinciri, SIEM tabanı, Sıfır Güven. Fail-closed bir kapı açıkken teslim basmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Ekran «bulut ayakta» deyince iş bitmiş mi. Root sızdı, log silindi. Yeşil yalandır. Damgasız yayın, joker yetki, kopuk hash, tabansız av, rozetsiz segment — biri duruyorsa mühür vurulmaz. Bu iskelet sahte canlı iddiası taşımaz; kapı sözleşmesini gösterir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Tek fonksiyon: beş kapı. Biri kırıkken dur. `kapat` sırayla sorar. SAST/DAST/SCA kırıkken durur. Joker eylem durur. Silme veya kopuk hash durur. Kaynak/taban yoksa durur. Üçlü yoksa durur. Hepsi durunca «kapali» basılır. Bu iskelet canlı buluta bağlı mı. Sınavda ne ölçülür. Bağlı değildir. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır. Beş kapı: damga, fiş, torba, av, üçlü.",
    summary: "Bu dersle Mini Proje: Bulut Üzerinde Otomatize DevSecOps Boru Hattı ve Olay Müdahale Senaryosu İnşası becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. İleri kapanış bu mu: damga, fiş, torba, av, üçlü, sınava gir. Boru hattından Sıfır Güven’e kadar Fail-closed durur. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
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
    code: {
      language: "ts",
      source: "function kapat(girdi: {\n  sastTemiz: boolean;\n  dastOturum: boolean;\n  scaCve: number;\n  eylem: string;\n  kmsId: string;\n  logEylem: string;\n  hashVar: boolean;\n  siemKaynak: string;\n  taban: number;\n  kimlik: string;\n  cihaz: string;\n  segment: string;\n}): \"kapali\" {\n  if (!girdi.sastTemiz || !girdi.dastOturum || girdi.scaCve !== 0) {\n    throw new Error(\"damga yok; yayın durur\");\n  }\n  if (!girdi.eylem.trim() || girdi.eylem === \"*\" || !girdi.kmsId.trim()) {\n    throw new Error(\"yetki yok; işlem durur\");\n  }\n  if (!girdi.logEylem.trim() || girdi.logEylem === \"sil\" || !girdi.hashVar) {\n    throw new Error(\"torba durur\");\n  }\n  if (!girdi.siemKaynak.trim() || !Number.isFinite(girdi.taban) || girdi.taban <= 0) {\n    throw new Error(\"av durur\");\n  }\n  if (!girdi.kimlik.trim() || !girdi.cihaz.trim() || !girdi.segment.trim()) {\n    throw new Error(\"üçlü yok; paket düşer\");\n  }\n  return \"kapali\";\n}\n\nif (\n  kapat({\n    sastTemiz: true,\n    dastOturum: true,\n    scaCve: 0,\n    eylem: \"s3:GetObject\",\n    kmsId: \"arn:kms:lab\",\n    logEylem: \"yaz\",\n    hashVar: true,\n    siemKaynak: \"lab-vpc-flow\",\n    taban: 10,\n    kimlik: \"rol-okur\",\n    cihaz: \"mdm-lab\",\n    segment: \"app-a\",\n  }) !== \"kapali\"\n) {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
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
