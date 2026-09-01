/**
 * Full-Stack Web Geliştirme İleri Seviye (FS-103) — mühürlü müfredat.
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

export const FULLSTACK_ILERI_LESSONS: readonly AcademyLessonDraft[] = [
  academyInstructorLessonDraft({
    key: "fullstack-ileri-1",
    order: 1,
    title: "Next.js App Router & Server Components (RSC) Mimarisi ve Server Actions",
    intro: "Hoş geldiniz. Bu bölümde Next.js App Router & Server Components (RSC) Mimarisi ve Server Actions konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Fabrikada vitrin camı müşteriye bakar; reçete odası camın arkasındadır. Vitrine sır defterini koyarsan gece çalınır. Uygulama Yönlendiricisi (App Router) bu ayrım mı. Next.js (tam yığın çerçeve) App Router’da sayfa varsayılanı React Sunucu Bileşenleri (RSC)dır: reçete odası. `use client` vitrindir; tıklama ve durum orada durur. Fail-closed (Hata Anında Kapalı): `process.env` sırrı vitrine inmez.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Sunucu Eylemi (Server Actions) doğrulamasız form alırsa fabrika nerede çöker. İstemci tarafı kesilir, eylem yine koşar. Boş sku, eksi adet, sır sızıntısı. Fail-closed eylem gövdesinde durur: trim boşsa throw; yeşil `{ok:true}` uydurulmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Reçete odasını yaz. Sır vitrine inmesin; boş sku dursun. Sayfa sunucuda kalır. Eylem `use server` damgası taşır. `STOK_ANAHTAR` yoksa sayfa açılmaz. `use client` sayfada secret okursa. Vitrin paketi tarayıcıya iner; sır da iner. Fail-closed: secret yalnız sunucu fonksiyonunda. Bir sonraki bölümde seni monolitten mikroservise geçiş bekliyor.",
    summary: "Bu dersle Next.js App Router & Server Components (RSC) Mimarisi ve Server Actions becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. RSC reçete, eylem kapı. Zincir tek bantta mı kalır. App Router sunucuyu varsayılan tutar; eylem doğrulamadan yeşil basmaz. Bir sonraki bölümde seni monolit yapıdan mikroservis mimarisine geçiş bekliyor.",
    quiz: [
      mcq(
        "q_fsi1_1",
        "App Router’da sayfa varsayılanı nedir?",
        ["use client zorunlu", "React Sunucu Bileşenleri (RSC); vitrin ayrıca damgalanır", "yalnız Express", "Redis"],
        1,
      ),
      mcq(
        "q_fsi1_2",
        "Server Action boş sku ile Fail-closed ne yapar?",
        ["{ok:true} basar", "throw; işlem durur", "istemci düzeltir", "200 boş"],
        1,
      ),
      mcq(
        "q_fsi1_3",
        "process.env sırrı istemci bileşeninde?",
        ["Güvenli", "Yasak; vitrine iner, Fail-closed sunucuda tutar", "RSC aynı", "Docker yeter"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "\"use server\";\n\nasync function stokAnahtari(): Promise<string> {\n  const secret = process.env.STOK_ANAHTAR;\n  if (typeof secret !== \"string\" || secret.trim() === \"\") {\n    throw new Error(\"anahtar yok; işlem durur\");\n  }\n  return secret;\n}\n\nexport async function siparisAl(skuHam: string, adetHam: unknown): Promise<{ sku: string; adet: number }> {\n  const sku = skuHam.trim();\n  if (sku === \"\") {\n    throw new Error(\"sku yok; işlem durur\");\n  }\n  const adet = typeof adetHam === \"number\" ? adetHam : Number(adetHam);\n  if (!Number.isInteger(adet) || adet < 1) {\n    throw new Error(\"adet yok; işlem durur\");\n  }\n  await stokAnahtari();\n  return { sku, adet };\n}\n\nconst ok = await siparisAl(\"SOMUN\", 2);\nif (ok.adet !== 2) {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "fullstack-ileri-2",
    order: 2,
    title: "Monolit Yapıdan Mikroservis (Microservices) Mimarisine Geçiş ve Event-Driven İletişim",
    intro: "Hoş geldiniz. Bu bölümde Monolit Yapıdan Mikroservis (Microservices) Mimarisine Geçiş ve Event-Driven İletişim konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Fabrikada bütün yük tek banda binince bir rulo durunca hat durur. Bantları ayırıp fişle konuşursan aynı duruş mu. Tek bant monolit. Mikroservis (Microservices) ayrı banttır; olay güdümlü (Event-Driven) fiş kuyruğudur. Fail-closed (Hata Anında Kapalı): bilinmeyen olay tipi içeri girmez. Zincirleme çöküş (Cascading Failure) tek bantın bütün fabrikayı durdurmasıdır.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Stok servisi 500 olunca ödeme hâlâ 201 basarsa ne kırılır. Sahte yeşil. Ödeme fişi stoksuz kalır. Fail-closed: kuyruk boşsa tüketim durur; devre açıkken çağrı çıkmaz. Sessiz retry sonsuz nezaket değildir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Fiş sözleşmesini yaz. Tip yoksa dur; üç hata devreyi açsın. `yayinla` tipi tarar. `tuket` boş kuyruğu uydurmaz. Devre üç hatada açılır; zincir durur.",
    summary: "Bu dersle Monolit Yapıdan Mikroservis (Microservices) Mimarisine Geçiş ve Event-Driven İletişim becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Bantlar ayrı, fiş sözleşmeli. Depo fişi her seferinde fabrikaya mı sorulur. Bilinmeyen olay ve açık devre zinciri keser. Bir sonraki bölümde seni Redis önbelleği ve istek sınırlama bekliyor.",
    quiz: [
      mcq(
        "q_fsi2_1",
        "Cascading Failure nedir?",
        ["Tek servis yavaşlar", "Bir servis düşünce zincir bütün fabrikayı durdurur", "Redis dolu", "RSC hatası"],
        1,
      ),
      mcq(
        "q_fsi2_2",
        "Bilinmeyen olay tipinde Fail-closed?",
        ["Kuyruğa yazar", "throw; işlem durur", "201 basar", "retry sonsuz"],
        1,
      ),
      mcq(
        "q_fsi2_3",
        "Devre üç hatada?",
        ["Yine çağırır", "Açık; zincir durur", "201 uydurur", "monolit açılır"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "type Olay = { tip: \"siparis.alindi\"; sku: string };\n\nfunction yayinla(kuyruk: readonly Olay[], olay: Olay): Olay[] {\n  if (olay.tip !== \"siparis.alindi\") {\n    throw new Error(\"bilinmeyen olay; işlem durur\");\n  }\n  if (olay.sku.trim() === \"\") {\n    throw new Error(\"sku yok; işlem durur\");\n  }\n  return [...kuyruk, olay];\n}\n\nfunction tuket(kuyruk: readonly Olay[]): Olay {\n  const ilk = kuyruk[0];\n  if (!ilk) {\n    throw new Error(\"kuyruk boş; işlem durur\");\n  }\n  return ilk;\n}\n\nfunction cagir(hataSayisi: number): \"stok\" {\n  if (!Number.isInteger(hataSayisi) || hataSayisi < 0) {\n    throw new Error(\"sayaç yok; işlem durur\");\n  }\n  if (hataSayisi >= 3) {\n    throw new Error(\"devre açık; zincir durur\");\n  }\n  return \"stok\";\n}\n\nconst kuyruk = yayinla([], { tip: \"siparis.alindi\", sku: \"SOMUN\" });\nif (tuket(kuyruk).sku !== \"SOMUN\") {\n  throw new Error(\"sözleşme kırıldı\");\n}\nif (cagir(0) !== \"stok\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
  academyInstructorLessonDraft({
    key: "fullstack-ileri-3",
    order: 3,
    title: "Performans ve Önbellek: Redis Caching ve Rate Limiting (İstek Sınırlama)",
    intro: "Hoş geldiniz. Bu bölümde Performans ve Önbellek: Redis Caching ve Rate Limiting (İstek Sınırlama) konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Fabrika her vidayı tezgâhtan mı çeker, yoksa raf etiketine mi bakar. Raf yokken «var» dersen tezgâh yalan söyler. Raf bellek içi sözlük (Redis) önbelleğidir. İstek sınırlama (Rate Limiting) kapıdaki turnikedir. Fail-closed (Hata Anında Kapalı): anahtar boşsa okuma durur; tavan dolunca 429, 200 değil.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Önbellek düşünce kaynak 200 boş basarsa. Sınırsız istek. Stampede: herkes tezgâha hücum eder. Fail-closed Redis yoksa sağlık kırmızı; yazma yeşil uydurmaz. Tavan yoksa Saniye Başına İstek (RPS) tezgâhı ezer.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Rafı ve turnikeyi yaz. Kaçış 429 olsun. `oku` kaçırmayı «yok» diye yalanlamaz; throw ile kaynağa iter. `sinirla` tavanı tam sayı ister.",
    summary: "Bu dersle Performans ve Önbellek: Redis Caching ve Rate Limiting (İstek Sınırlama) becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Raf etiket, turnike tavan. Kutular nasıl taşınır. Redis kaçırmayı 200 boş saymaz; tavan 429 basar. Bir sonraki bölümde seni Docker ve Docker Compose bekliyor.",
    quiz: [
      mcq(
        "q_fsi3_1",
        "Redis kaçırınca Fail-closed okuma?",
        ["200 boş", "throw; kaynak sor, yeşil uydurma yok", "eski değeri sonsuz tutar", "RSC düzeltir"],
        1,
      ),
      mcq(
        "q_fsi3_2",
        "Rate limit tavanı dolunca?",
        ["200 geçer", "429; istek durur", "kuyruğa 201", "retry sessiz"],
        1,
      ),
      mcq(
        "q_fsi3_3",
        "Boş anahtar yazmak?",
        ["Map’e \"\" basar", "Fail-closed; kayıt yok", "Redis düzeltir", "tavan yeter"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "const ONBELLEK = new Map<string, string>();\n\nfunction oku(anahtar: string): string {\n  if (anahtar.trim() === \"\") {\n    throw new Error(\"anahtar yok; işlem durur\");\n  }\n  const deger = ONBELLEK.get(anahtar);\n  if (deger === undefined) {\n    throw new Error(\"onbellek yok; kaynak sor\");\n  }\n  return deger;\n}\n\nfunction yaz(anahtar: string, deger: string): void {\n  if (anahtar.trim() === \"\" || deger.trim() === \"\") {\n    throw new Error(\"kayit yok; işlem durur\");\n  }\n  ONBELLEK.set(anahtar, deger);\n}\n\nfunction sinirla(sayac: number, tavan: number): void {\n  if (!Number.isInteger(tavan) || tavan < 1) {\n    throw new Error(\"tavan yok; işlem durur\");\n  }\n  if (!Number.isInteger(sayac) || sayac < 0) {\n    throw new Error(\"sayaç yok; işlem durur\");\n  }\n  if (sayac >= tavan) {\n    throw new Error(\"429; istek durur\");\n  }\n}\n\nyaz(\"sku:SOMUN\", \"18\");\nif (oku(\"sku:SOMUN\") !== \"18\") {\n  throw new Error(\"sözleşme kırıldı\");\n}\nsinirla(0, 3);",
    },
  }),
  academyInstructorLessonDraft({
    key: "fullstack-ileri-4",
    order: 4,
    title: "Konteynerizasyon: Docker ve Docker Compose ile Çoklu Servis Yönetimi",
    intro: "Hoş geldiniz. Bu bölümde Konteynerizasyon: Docker ve Docker Compose ile Çoklu Servis Yönetimi konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Fabrika kamyonu «benim tezgahta çalışıyordu» diye yola çıkarırsa gece durur. Kutuya etiket, sağlık lambası koyarsan aynı kamyon mu. Konteyner (Docker) o kutudur. Docker Compose çoklu kutu planıdır. Fail-closed (Hata Anında Kapalı): Redis sağlıksızken web ayağa kalkmaz. `REDIS_URL` yoksa süreç durur; localhost uydurulmaz.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. depends_on yalnız başlatır, sağlık sormazsa. Kök kullanıcı. Web, Redis’e PONG almadan bağlanır; bağlantı kopar, 500 yeşil görünür. Kök imaj sızıntıdır. Fail-closed: `condition: service_healthy` ve `USER node`.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Planı bas. Redis sağlıklı olmadan web kalkmasın. Compose sözleşmesi: sağlık yoksa bağımlılık durur. Sır imaja gömülmez; ortamdan okunur. Süreç REDIS_URL boşsa. Açılmaz. Fail-closed ortam kapısı: boş URL ile dinleme yok.",
    summary: "Bu dersle Konteynerizasyon: Docker ve Docker Compose ile Çoklu Servis Yönetimi becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Kutu sağlıklı, sır imajda yok. Kamyon kapıdan nasıl çıkar. Compose sağlık lambası yanmadan web kalkmaz. Bir sonraki bölümde seni GitHub Actions ile CI/CD boru hattı bekliyor.",
    quiz: [
      mcq(
        "q_fsi4_1",
        "Redis sağlıksızken web?",
        ["Yine kalkar", "Fail-closed; service_healthy olmadan kalkmaz", "localhost uydurur", "kök USER yeter"],
        1,
      ),
      mcq(
        "q_fsi4_2",
        "REDIS_URL boş?",
        ["redis://localhost", "Süreç durur; uydurma URL yok", "Compose düzeltir", "PONG uydurur"],
        1,
      ),
      mcq(
        "q_fsi4_3",
        "Sır Dockerfile’a yazılır mı?",
        ["Evet, hız", "Yasak; ortamdan okunur, imaja gömülmez", "ENV SECRET yeter", "kök USER gizler"],
        1,
      ),
    ],
    code: {
      language: "yaml",
      source: "services:\n  web:\n    build: .\n    depends_on:\n      redis:\n        condition: service_healthy\n    environment:\n      REDIS_URL: redis://redis:6379\n    user: node\n  redis:\n    image: redis:7-alpine\n    healthcheck:\n      test: [\"CMD\", \"redis-cli\", \"ping\"]\n      interval: 5s\n      retries: 5",
    },
  }),
  academyInstructorLessonDraft({
    key: "fullstack-ileri-5",
    order: 5,
    title: "Otomatize Dağıtım: GitHub Actions ile CI/CD Pipeline ve Sunucu Yayını",
    intro: "Hoş geldiniz. Bu bölümde Otomatize Dağıtım: GitHub Actions ile CI/CD Pipeline ve Sunucu Yayını konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Kamyon kapıdan çıkmadan kalite gişesi kırmızı lamba yakmazsa bozuk somun sahaya iner. Gişe kırmızıysa kamyon durur mu. gişe Sürekli Entegrasyon ve Sürekli Teslimat (CI/CD)dır. GitHub Actions o banttır. Fail-closed (Hata Anında Kapalı): test kırıkken `yayin` işi koşmaz. `continue-on-error: true` testte ihanettir.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. `needs: test` yokken yayin paralel koşarsa. Sır depoda. Kırmızı test yeşil kamyonla çıkar. Fail-closed: `needs: test` ve `if: success()`. Sır `secrets` bağlamındadır; YAML’a yapışmaz.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Boru hattını yaz. Test kırıkken yayın yok. `yayin` `test`e bağlıdır. `continue-on-error` bu tezgâhta yoktur. Kod kapısı: testGecti false iken. Yayın adı basılmaz. Fail-closed fonksiyon aynı sözleşmeyi taşır.",
    summary: "Bu dersle Otomatize Dağıtım: GitHub Actions ile CI/CD Pipeline ve Sunucu Yayını becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Gişe kırmızı, kamyon durur. Mini fabrikada hepsi bir arada mı. CI/CD test kırığını sahaya indirmez. Bir sonraki bölümde seni Docker üzerinde Redis destekli otomatik dağıtılan servis bekliyor.",
    quiz: [
      mcq(
        "q_fsi5_1",
        "Test kırıkken yayin işi?",
        ["Paralel koşar", "Fail-closed; needs: test ile durur", "continue-on-error yeter", "manuel SSH"],
        1,
      ),
      mcq(
        "q_fsi5_2",
        "continue-on-error: true testte?",
        ["Hızlı teslim", "İhanet; kırmızı yeşil görünür", "Compose zorunlu", "RSC düzeltir"],
        1,
      ),
      mcq(
        "q_fsi5_3",
        "Yayın sırrı YAML’da?",
        ["Evet", "Yasak; secrets bağlamı, metne yapışmaz", "ENV README yeter", "echo secret"],
        1,
      ),
    ],
    code: {
      language: "yaml",
      source: "name: dagitim\non:\n  push:\n    branches: [main]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm test\n  yayin:\n    needs: test\n    if: success()\n    runs-on: ubuntu-latest\n    steps:\n      - run: echo \"yayin\"",
    },
  }),
  academyInstructorLessonDraft({
    key: "fullstack-ileri-6",
    order: 6,
    title: "Mini Proje: Docker Üzerinde Çalışan, Redis Destekli ve CI/CD İle Otomatik Dağıtılan İleri Düzey Web Servisi",
    intro: "Hoş geldiniz. Bu bölümde Mini Proje: Docker Üzerinde Çalışan, Redis Destekli ve CI/CD İle Otomatik Dağıtılan İleri Düzey Web Servisi konusunu ve neden ihtiyaç duyduğunuzu ele alacağız. Fabrika: reçete odası, ayrı bant, raf, kutu, kalite gişesi. Bir somun bu beş kapıdan geçmeden kamyona biner mi. Binmez. Mini servis: RSC/eylem kapısı, olay fişi, Redis rafı, Compose sağlığı, CI/CD gişesi. Fail-closed (Hata Anında Kapalı): biri kırmızıysa yayın yok.",
    problem: "Geleneksel yapılarda doğrulanmayan çıktı ve kapısız ilerleme yaşanır. Bu yüzden bu mimariyi kullanırız. Redis PONG değilken /saglik 200. Test kırıkken kamyon. Sahte yeşil. Fail-closed sağlık Redis’e bağlıdır; yayın `testGecti && redisOk` ister. 200 boş teslim değildir.",
    application: "Ekrandaki kod bloğunda gördüğünüz üzere, Beş kapıyı tek motorda bas. Kırmızıda dur. Sözleşme üretimle aynıdır: sku, Redis PONG, tavan, test. Canlı Docker yarın aynı kapıyı doldurur.",
    summary: "Bu dersle Mini Proje: Docker Üzerinde Çalışan, Redis Destekli ve CI/CD İle Otomatik Dağıtılan İleri Düzey Web Servisi becerisini kazandınız. Şimdi bölüm sonu değerlendirmesine geçebilirsiniz. Reçete, bant, raf, kutu, gişe. İleri kapanış bu mu. RSC sırrı vitrine indirmez, olay sözleşmeli akar, Redis ve 429 dürüst kalır, Compose sağlık sormadan kalkmaz, CI/CD kırmızı testi sahaya indirmez. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
    quiz: [
      mcq(
        "q_fsi6_1",
        "Redis PONG değilken /saglik?",
        ["200 ok", "Fail-closed; işlem durur", "eski PONG", "Compose gizler"],
        1,
      ),
      mcq(
        "q_fsi6_2",
        "Test kırık veya Redis yokken yayın?",
        ["Yine çıkar", "kapı kırmızı; yayın yok", "manuel SSH", "continue-on-error"],
        1,
      ),
      mcq(
        "q_fsi6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "Docker build deyince", "İlk derste"],
        1,
      ),
    ],
    code: {
      language: "ts",
      source: "function skuDogrula(ham: string): string {\n  const sku = ham.trim();\n  if (sku === \"\") {\n    throw new Error(\"sku yok; işlem durur\");\n  }\n  return sku;\n}\n\nfunction saglik(pong: string): \"ok\" {\n  if (pong !== \"PONG\") {\n    throw new Error(\"redis yok; işlem durur\");\n  }\n  return \"ok\";\n}\n\nfunction sinirla(sayac: number, tavan: number): void {\n  if (!Number.isInteger(tavan) || tavan < 1 || sayac >= tavan) {\n    throw new Error(\"429 veya tavan yok; işlem durur\");\n  }\n}\n\nfunction yayinKapisi(testGecti: boolean, redisOk: boolean): \"yayin\" {\n  if (!testGecti || !redisOk) {\n    throw new Error(\"kapı kırmızı; yayın yok\");\n  }\n  return \"yayin\";\n}\n\nif (skuDogrula(\"SOMUN\") !== \"SOMUN\") {\n  throw new Error(\"sözleşme kırıldı\");\n}\nif (saglik(\"PONG\") !== \"ok\") {\n  throw new Error(\"sözleşme kırıldı\");\n}\nsinirla(0, 3);\nif (yayinKapisi(true, true) !== \"yayin\") {\n  throw new Error(\"sözleşme kırıldı\");\n}",
    },
  }),
] as const;

const FULLSTACK_ILERI_LESSON_QUIZZES: AcademyExamQuestion[] = FULLSTACK_ILERI_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları. */
export const FULLSTACK_ILERI_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...FULLSTACK_ILERI_LESSON_QUIZZES,
  mcq("q_fsi_p1", "RSC varsayılanı nerede koşar?", ["Tarayıcı", "Sunucu; vitrin use client", "Redis", "YAML"], 1),
  mcq("q_fsi_p2", "Server Action doğrulama yoksa?", ["İstemci yeter", "Fail-closed eylemde throw ister", "RSC gizler", "JWT yeter"], 1),
  mcq("q_fsi_p3", "Monolit tek bant riski?", ["Hız", "Cascading Failure; bir duruş hepsini durdurur", "RSC yok", "YAML yok"], 1),
  mcq("q_fsi_p4", "Bilinmeyen olay?", ["Kuyruğa 201", "Fail-closed; tip sözleşmesi", "retry sonsuz", "monolit açılır"], 1),
  mcq("q_fsi_p5", "Redis kaçırma 200 boş?", ["Teslim", "Yalan; kaynak sor veya dur", "RSC doldurur", "CI düzeltir"], 1),
  mcq("q_fsi_p6", "Rate limit tavanı?", ["200", "429", "201", "302"], 1),
  mcq("q_fsi_p7", "Compose healthcheck neden durur?", ["Süs", "Bağımlı servis sağlıksızken kalkmasın", "YAML zorunlu değil", "kök USER"], 1),
  mcq("q_fsi_p8", "Sır imajda?", ["ENV SECRET", "Yasak; ortam / secrets", "Dockerfile ARG yeter", "kök gizler"], 1),
  mcq("q_fsi_p9", "CI test kırık, CD yayın?", ["Evet paralel", "Hayır; needs: test Fail-closed", "SSH yeter", "Redis yeter"], 1),
  mcq("q_fsi_p10", "GitHub secret YAML’a?", ["Evet", "Yasak; secrets bağlamı", "echo yeter", "compose gizler"], 1),
  mcq("q_fsi_p11", "use client içinde process.env sır?", ["Güvenli", "Vitrine iner; Fail-closed sunucuda tutar", "RSC aynı", "Docker yeter"], 1),
  mcq("q_fsi_p12", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_fsi_p13", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet hash", "Docker belge"], 1),
  mcq("q_fsi_p14", "Bu İleri kapanış özeti nedir?", ["Yalnız HTML", "RSC + mikroservis + Redis + Docker + CI/CD Fail-closed", "Yalnız Figma", "Yalnız DNS"], 1),
];
