/**
 * Full-Stack Web Geliştirme İleri Seviye (FS-103) — mühürlü müfredat.
 * PEDAGOJI.md: 5 perde, DialogueTurn[], Maya %95 / Koray %96 (tecrübeli partner), Fail-Closed.
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

export const FULLSTACK_ILERI_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "fullstack-ileri-1",
    order: 1,
    title: "Next.js App Router & Server Components (RSC) Mimarisi ve Server Actions",
    dialogue: {
      warmup: [
        koray(
          "Fabrikada vitrin camı müşteriye bakar; reçete odası camın arkasındadır. Vitrine sır defterini koyarsan gece çalınır. Uygulama Yönlendiricisi (App Router) bu ayrım mı?",
        ),
        maya(
          "O. Next.js (tam yığın çerçeve) App Router’da sayfa varsayılanı React Sunucu Bileşenleri (RSC)dır: reçete odası. `use client` vitrindir; tıklama ve durum orada durur. Fail-closed (Hata Anında Kapalı): `process.env` sırrı vitrine inmez.",
        ),
      ],
      problem: [
        koray("Sunucu Eylemi (Server Actions) doğrulamasız form alırsa fabrika nerede çöker?"),
        maya(
          "İstemci tarafı kesilir, eylem yine koşar. Boş sku, eksi adet, sır sızıntısı. Fail-closed eylem gövdesinde durur: trim boşsa throw; yeşil `{ok:true}` uydurulmaz.",
        ),
      ],
      development: [
        koray("Reçete odasını yaz. Sır vitrine inmesin; boş sku dursun."),
        maya(
          "Sayfa sunucuda kalır. Eylem `use server` damgası taşır. `STOK_ANAHTAR` yoksa sayfa açılmaz.",
          {
            language: "ts",
            source: `"use server";

async function stokAnahtari(): Promise<string> {
  const secret = process.env.STOK_ANAHTAR;
  if (typeof secret !== "string" || secret.trim() === "") {
    throw new Error("anahtar yok; işlem durur");
  }
  return secret;
}

export async function siparisAl(skuHam: string, adetHam: unknown): Promise<{ sku: string; adet: number }> {
  const sku = skuHam.trim();
  if (sku === "") {
    throw new Error("sku yok; işlem durur");
  }
  const adet = typeof adetHam === "number" ? adetHam : Number(adetHam);
  if (!Number.isInteger(adet) || adet < 1) {
    throw new Error("adet yok; işlem durur");
  }
  await stokAnahtari();
  return { sku, adet };
}

const ok = await siparisAl("SOMUN", 2);
if (ok.adet !== 2) {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
        koray("`use client` sayfada secret okursa?"),
        maya(
          "Vitrin paketi tarayıcıya iner; sır da iner. Fail-closed: secret yalnız sunucu fonksiyonunda. Bir sonraki bölümde seni monolitten mikroservise geçiş bekliyor.",
        ),
      ],
      conclusion: [
        koray("RSC reçete, eylem kapı. Zincir tek bantta mı kalır?"),
        maya(
          "App Router sunucuyu varsayılan tutar; eylem doğrulamadan yeşil basmaz. Bir sonraki bölümde seni monolit yapıdan mikroservis mimarisine geçiş bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "fullstack-ileri-2",
    order: 2,
    title: "Monolit Yapıdan Mikroservis (Microservices) Mimarisine Geçiş ve Event-Driven İletişim",
    dialogue: {
      warmup: [
        koray(
          "Fabrikada bütün yük tek banda binince bir rulo durunca hat durur. Bantları ayırıp fişle konuşursan aynı duruş mu?",
        ),
        maya(
          "Tek bant monolit. Mikroservis (Microservices) ayrı banttır; olay güdümlü (Event-Driven) fiş kuyruğudur. Fail-closed (Hata Anında Kapalı): bilinmeyen olay tipi içeri girmez. Zincirleme çöküş (Cascading Failure) tek bantın bütün fabrikayı durdurmasıdır.",
        ),
      ],
      problem: [
        koray("Stok servisi 500 olunca ödeme hâlâ 201 basarsa ne kırılır?"),
        maya(
          "Sahte yeşil. Ödeme fişi stoksuz kalır. Fail-closed: kuyruk boşsa tüketim durur; devre açıkken çağrı çıkmaz. Sessiz retry sonsuz nezaket değildir.",
        ),
      ],
      development: [
        koray("Fiş sözleşmesini yaz. Tip yoksa dur; üç hata devreyi açsın."),
        maya(
          "`yayinla` tipi tarar. `tuket` boş kuyruğu uydurmaz. Devre üç hatada açılır; zincir durur.",
          {
            language: "ts",
            source: `type Olay = { tip: "siparis.alindi"; sku: string };

function yayinla(kuyruk: readonly Olay[], olay: Olay): Olay[] {
  if (olay.tip !== "siparis.alindi") {
    throw new Error("bilinmeyen olay; işlem durur");
  }
  if (olay.sku.trim() === "") {
    throw new Error("sku yok; işlem durur");
  }
  return [...kuyruk, olay];
}

function tuket(kuyruk: readonly Olay[]): Olay {
  const ilk = kuyruk[0];
  if (!ilk) {
    throw new Error("kuyruk boş; işlem durur");
  }
  return ilk;
}

function cagir(hataSayisi: number): "stok" {
  if (!Number.isInteger(hataSayisi) || hataSayisi < 0) {
    throw new Error("sayaç yok; işlem durur");
  }
  if (hataSayisi >= 3) {
    throw new Error("devre açık; zincir durur");
  }
  return "stok";
}

const kuyruk = yayinla([], { tip: "siparis.alindi", sku: "SOMUN" });
if (tuket(kuyruk).sku !== "SOMUN") {
  throw new Error("sözleşme kırıldı");
}
if (cagir(0) !== "stok") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
      ],
      conclusion: [
        koray("Bantlar ayrı, fiş sözleşmeli. Depo fişi her seferinde fabrikaya mı sorulur?"),
        maya(
          "Bilinmeyen olay ve açık devre zinciri keser. Bir sonraki bölümde seni Redis önbelleği ve istek sınırlama bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "fullstack-ileri-3",
    order: 3,
    title: "Performans ve Önbellek: Redis Caching ve Rate Limiting (İstek Sınırlama)",
    dialogue: {
      warmup: [
        koray(
          "Fabrika her vidayı tezgâhtan mı çeker, yoksa raf etiketine mi bakar? Raf yokken «var» dersen tezgâh yalan söyler.",
        ),
        maya(
          "Raf bellek içi sözlük (Redis) önbelleğidir. İstek sınırlama (Rate Limiting) kapıdaki turnikedir. Fail-closed (Hata Anında Kapalı): anahtar boşsa okuma durur; tavan dolunca 429, 200 değil.",
        ),
      ],
      problem: [
        koray("Önbellek düşünce kaynak 200 boş basarsa? Sınırsız istek?"),
        maya(
          "Stampede: herkes tezgâha hücum eder. Fail-closed Redis yoksa sağlık kırmızı; yazma yeşil uydurmaz. Tavan yoksa Saniye Başına İstek (RPS) tezgâhı ezer.",
        ),
      ],
      development: [
        koray("Rafı ve turnikeyi yaz. Kaçış 429 olsun."),
        maya(
          "`oku` kaçırmayı «yok» diye yalanlamaz; throw ile kaynağa iter. `sinirla` tavanı tam sayı ister.",
          {
            language: "ts",
            source: `const ONBELLEK = new Map<string, string>();

function oku(anahtar: string): string {
  if (anahtar.trim() === "") {
    throw new Error("anahtar yok; işlem durur");
  }
  const deger = ONBELLEK.get(anahtar);
  if (deger === undefined) {
    throw new Error("onbellek yok; kaynak sor");
  }
  return deger;
}

function yaz(anahtar: string, deger: string): void {
  if (anahtar.trim() === "" || deger.trim() === "") {
    throw new Error("kayit yok; işlem durur");
  }
  ONBELLEK.set(anahtar, deger);
}

function sinirla(sayac: number, tavan: number): void {
  if (!Number.isInteger(tavan) || tavan < 1) {
    throw new Error("tavan yok; işlem durur");
  }
  if (!Number.isInteger(sayac) || sayac < 0) {
    throw new Error("sayaç yok; işlem durur");
  }
  if (sayac >= tavan) {
    throw new Error("429; istek durur");
  }
}

yaz("sku:SOMUN", "18");
if (oku("sku:SOMUN") !== "18") {
  throw new Error("sözleşme kırıldı");
}
sinirla(0, 3);`,
          },
        ),
      ],
      conclusion: [
        koray("Raf etiket, turnike tavan. Kutular nasıl taşınır?"),
        maya(
          "Redis kaçırmayı 200 boş saymaz; tavan 429 basar. Bir sonraki bölümde seni Docker ve Docker Compose bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "fullstack-ileri-4",
    order: 4,
    title: "Konteynerizasyon: Docker ve Docker Compose ile Çoklu Servis Yönetimi",
    dialogue: {
      warmup: [
        koray(
          "Fabrika kamyonu «benim tezgahta çalışıyordu» diye yola çıkarırsa gece durur. Kutuya etiket, sağlık lambası koyarsan aynı kamyon mu?",
        ),
        maya(
          "Konteyner (Docker) o kutudur. Docker Compose çoklu kutu planıdır. Fail-closed (Hata Anında Kapalı): Redis sağlıksızken web ayağa kalkmaz. `REDIS_URL` yoksa süreç durur; localhost uydurulmaz.",
        ),
      ],
      problem: [
        koray("depends_on yalnız başlatır, sağlık sormazsa? Kök kullanıcı?"),
        maya(
          "Web, Redis’e PONG almadan bağlanır; bağlantı kopar, 500 yeşil görünür. Kök imaj sızıntıdır. Fail-closed: `condition: service_healthy` ve `USER node`.",
        ),
      ],
      development: [
        koray("Planı bas. Redis sağlıklı olmadan web kalkmasın."),
        maya(
          "Compose sözleşmesi: sağlık yoksa bağımlılık durur. Sır imaja gömülmez; ortamdan okunur.",
          {
            language: "yaml",
            source: `services:
  web:
    build: .
    depends_on:
      redis:
        condition: service_healthy
    environment:
      REDIS_URL: redis://redis:6379
    user: node
  redis:
    image: redis:7-alpine
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      retries: 5`,
          },
        ),
        koray("Süreç REDIS_URL boşsa?"),
        maya(
          "Açılmaz. Fail-closed ortam kapısı: boş URL ile dinleme yok.",
          {
            language: "ts",
            source: `function redisUrl(ham: unknown): string {
  if (typeof ham !== "string" || ham.trim() === "") {
    throw new Error("REDIS_URL yok; işlem durur");
  }
  return ham.trim();
}

function saglik(pong: string): "ok" {
  if (pong !== "PONG") {
    throw new Error("redis yok; işlem durur");
  }
  return "ok";
}

if (redisUrl("redis://redis:6379") !== "redis://redis:6379") {
  throw new Error("sözleşme kırıldı");
}
if (saglik("PONG") !== "ok") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
      ],
      conclusion: [
        koray("Kutu sağlıklı, sır imajda yok. Kamyon kapıdan nasıl çıkar?"),
        maya(
          "Compose sağlık lambası yanmadan web kalkmaz. Bir sonraki bölümde seni GitHub Actions ile CI/CD boru hattı bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "fullstack-ileri-5",
    order: 5,
    title: "Otomatize Dağıtım: GitHub Actions ile CI/CD Pipeline ve Sunucu Yayını",
    dialogue: {
      warmup: [
        koray(
          "Kamyon kapıdan çıkmadan kalite gişesi kırmızı lamba yakmazsa bozuk somun sahaya iner. Gişe kırmızıysa kamyon durur mu?",
        ),
        maya(
          "O gişe Sürekli Entegrasyon ve Sürekli Teslimat (CI/CD)dır. GitHub Actions o banttır. Fail-closed (Hata Anında Kapalı): test kırıkken `yayin` işi koşmaz. `continue-on-error: true` testte ihanettir.",
        ),
      ],
      problem: [
        koray("`needs: test` yokken yayin paralel koşarsa? Sır depoda?"),
        maya(
          "Kırmızı test yeşil kamyonla çıkar. Fail-closed: `needs: test` ve `if: success()`. Sır `secrets` bağlamındadır; YAML’a yapışmaz.",
        ),
      ],
      development: [
        koray("Boru hattını yaz. Test kırıkken yayın yok."),
        maya(
          "`yayin` `test`e bağlıdır. `continue-on-error` bu tezgâhta yoktur.",
          {
            language: "yaml",
            source: `name: dagitim
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
  yayin:
    needs: test
    if: success()
    runs-on: ubuntu-latest
    steps:
      - run: echo "yayin"`,
          },
        ),
        koray("Kod kapısı: testGecti false iken?"),
        maya(
          "Yayın adı basılmaz. Fail-closed fonksiyon aynı sözleşmeyi taşır.",
          {
            language: "ts",
            source: `function yayinKapisi(testGecti: boolean, secretVar: boolean): "yayin" {
  if (!testGecti) {
    throw new Error("test kırık; yayın yok");
  }
  if (!secretVar) {
    throw new Error("sır yok; yayın yok");
  }
  return "yayin";
}

if (yayinKapisi(true, true) !== "yayin") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
      ],
      conclusion: [
        koray("Gişe kırmızı, kamyon durur. Mini fabrikada hepsi bir arada mı?"),
        maya(
          "CI/CD test kırığını sahaya indirmez. Bir sonraki bölümde seni Docker üzerinde Redis destekli otomatik dağıtılan servis bekliyor.",
        ),
      ],
    },
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
  }),
  academyFiveActLessonDraft({
    key: "fullstack-ileri-6",
    order: 6,
    title:
      "Mini Proje: Docker Üzerinde Çalışan, Redis Destekli ve CI/CD İle Otomatik Dağıtılan İleri Düzey Web Servisi",
    dialogue: {
      warmup: [
        koray(
          "Fabrika: reçete odası, ayrı bant, raf, kutu, kalite gişesi. Bir somun bu beş kapıdan geçmeden kamyona biner mi?",
        ),
        maya(
          "Binmez. Mini servis: RSC/eylem kapısı, olay fişi, Redis rafı, Compose sağlığı, CI/CD gişesi. Fail-closed (Hata Anında Kapalı): biri kırmızıysa yayın yok.",
        ),
      ],
      problem: [
        koray("Redis PONG değilken /saglik 200? Test kırıkken kamyon?"),
        maya(
          "Sahte yeşil. Fail-closed sağlık Redis’e bağlıdır; yayın `testGecti && redisOk` ister. 200 boş teslim değildir.",
        ),
      ],
      development: [
        koray("Beş kapıyı tek motorda bas. Kırmızıda dur."),
        maya(
          "Sözleşme üretimle aynıdır: sku, Redis PONG, tavan, test. Canlı Docker yarın aynı kapıyı doldurur.",
          {
            language: "ts",
            source: `function skuDogrula(ham: string): string {
  const sku = ham.trim();
  if (sku === "") {
    throw new Error("sku yok; işlem durur");
  }
  return sku;
}

function saglik(pong: string): "ok" {
  if (pong !== "PONG") {
    throw new Error("redis yok; işlem durur");
  }
  return "ok";
}

function sinirla(sayac: number, tavan: number): void {
  if (!Number.isInteger(tavan) || tavan < 1 || sayac >= tavan) {
    throw new Error("429 veya tavan yok; işlem durur");
  }
}

function yayinKapisi(testGecti: boolean, redisOk: boolean): "yayin" {
  if (!testGecti || !redisOk) {
    throw new Error("kapı kırmızı; yayın yok");
  }
  return "yayin";
}

if (skuDogrula("SOMUN") !== "SOMUN") {
  throw new Error("sözleşme kırıldı");
}
if (saglik("PONG") !== "ok") {
  throw new Error("sözleşme kırıldı");
}
sinirla(0, 3);
if (yayinKapisi(true, true) !== "yayin") {
  throw new Error("sözleşme kırıldı");
}`,
          },
        ),
      ],
      conclusion: [
        koray("Reçete, bant, raf, kutu, gişe. İleri kapanış bu mu?"),
        maya(
          "RSC sırrı vitrine indirmez, olay sözleşmeli akar, Redis ve 429 dürüst kalır, Compose sağlık sormadan kalkmaz, CI/CD kırmızı testi sahaya indirmez. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
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
