/**
 * Full-Stack Web Geliştirme Orta Seviye (FS-102) — mühürlü müfredat.
 * PEDAGOJI.md: 5 perde, DialogueTurn[], Maya %95 / Koray %98 (uygulamacı uzman), Fail-Closed.
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

export const FULLSTACK_ORTA_LESSONS: readonly AcademyLessonDraft[] = [
  academyFiveActLessonDraft({
    key: "fullstack-orta-1",
    order: 1,
    title: "Modern Frontend Mimarisi: React Component Yapısı, JSX ve Props Mantığı",
    dialogue: {
      warmup: [
        koray(
          "Şantiyede prefabrik oda kamyondan iner: kapı, pencere, iş emri poşette durur. Sen o poşeti odanın içinde yırtıp başlığı değiştirir misin, yoksa yeni poşet mi istersin?",
        ),
        maya(
          "Yeni poşet istersin. React bileşeni o odadır; JavaScript XML (JSX) odanın iskelet cümlesidir; props (özellik) poşettir — ebeveyn yazar, çocuk okur. Poşeti içeride yırtmak sözleşmeyi söker.",
        ),
      ],
      problem: [
        koray("Sahada `props.baslik = \"bitti\"` yazınca ekran bir an yeşil yanıyor. Teslim mi?"),
        maya(
          "Teslim değil. Çocuk poşeti yerinde değiştirince ebeveyn hâlâ eski iş emrini tutar; sonraki boyama eski başlığı basar. Fail-closed (Hata Anında Kapalı): props salt okunur kalır. Boş başlık da oda sayılmaz — trim sonrası boşsa işlem durur.",
        ),
      ],
      development: [
        koray("İş emri tipini yaz. Boş başlığı kes. JSX’te poşeti oku, yerinde yazma."),
        maya(
          "`type` poşet kalıbıdır. Bileşen fonksiyonu poşeti açar, JSX cümle basar. `props.baslik =` satırı bu laboratuvarda yoktur.",
          {
            language: "tsx",
            source: `type GorevKartiOzellik = {
  baslik: string;
  durum: "acik" | "kapali";
};

function baslikDogrula(ham: string): string {
  const temiz = ham.trim();
  if (temiz === "") {
    throw new Error("başlık yok; işlem durur");
  }
  return temiz;
}

function GorevKarti({ baslik, durum }: GorevKartiOzellik) {
  const yazi = baslikDogrula(baslik);
  return (
    <article>
      <h2>{yazi}</h2>
      <p>{durum}</p>
    </article>
  );
}

const kart = GorevKarti({ baslik: "Kalıp dök", durum: "acik" });
if (!kart) {
  throw new Error("oda yok; işlem durur");
}`,
          },
        ),
        koray("Ebeveyn başlığı değiştirmek isterse çocuk mu yazar, yoksa yeni poşet mi iner?"),
        maya(
          "Yeni poşet iner. Fail-closed: çocuk `setState` ile ebeveynin iş emrini çalmaz; ebeveyn yeni props basar. Şantiyede oda poşeti yırtmaz.",
        ),
      ],
      conclusion: [
        koray("Oda, poşet, iskelet. Sonraki adımda panodaki sayı mı duruyor?"),
        maya(
          "Bileşen oda, props poşet, JSX iskelettir; poşet içeride yazılmaz. Bir sonraki bölümde seni React durum kancası (useState), etki kancası (useEffect) ve kontrollü form bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_fso1_1",
        "React’te props (özellik) kim yazar?",
        [
          "Çocuk bileşen yerinde değiştirir",
          "Ebeveyn basar; çocuk okur, yazmaz",
          "JSX otomatik doldurur",
          "Prisma yazar",
        ],
        1,
      ),
      mcq(
        "q_fso1_2",
        "`props.baslik = \"bitti\"` Fail-closed (Hata Anında Kapalı) nedir?",
        ["Geçerli kısayol", "Yasak; poşet salt okunur kalır", "Yalnız TypeScript’te doğru", "HTTP 200 yeter"],
        1,
      ),
      mcq(
        "q_fso1_3",
        "Boş başlıkla kart basmak?",
        ["Ekran boş kalsın", "trim sonrası boşsa işlem durur", "div yeter", "innerHTML doldurur"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "fullstack-orta-2",
    order: 2,
    title: "React State Yönetimi (useState, useEffect) ve Form Elemanları",
    dialogue: {
      warmup: [
        koray(
          "Şantiyede duvardaki pano adeti yazar. Bir işçi her bakışta panoya +1 çizerse koridor ne olur? Sen o işçiyi kapıda tutar mısın?",
        ),
        maya(
          "Tutmazsan koridor donar. useState (durum kancası) o panodur: tek kutu, tek yazar. useEffect (etki kancası) kapı nöbetçisidir — bağımlılık değişince koşar. Form elemanı panodan okur, panoya yazar; serbest `defaultValue` ile kaçmaz.",
        ),
      ],
      problem: [
        koray("`useEffect(() => setSayac(sayac + 1), [sayac])` sahada ne yakıyor?"),
        maya(
          "Sonsuz boyama. Etki panoyu değiştirir, pano değişince etki yine koşar. Fail-closed: aynı kutuyu bağımlılıkta tutup içeride artırmak yasaktır. `fetch` de temizlik yoksa eski yanıt yeni listeyi ezer — yarış.",
        ),
      ],
      development: [
        koray("Kontrollü başlık, fonksiyonel artırım, etkiyi boş dizi ve iptalle yaz. Sonsuz döngü yok."),
        maya(
          "`setAdet(onceki => onceki + 1)` eski kopyayı ezmez. Etki `[]` ile bir kez koşar; `AbortController` ve `iptal` bayrağı eski kuryeyi düşürür. Boş trim’de POST çıkmaz.",
          {
            language: "tsx",
            source: `import { useEffect, useState, type FormEvent } from "react";

function baslikDogrula(ham: string): string {
  const temiz = ham.trim();
  if (temiz === "") {
    throw new Error("boş başlık; işlem durur");
  }
  return temiz;
}

function GorevFormu() {
  const [baslik, setBaslik] = useState("");
  const [adet, setAdet] = useState(0);
  const [hata, setHata] = useState("");

  useEffect(() => {
    const ac = new AbortController();
    let iptal = false;
    fetch("/api/gorev-sayisi", { signal: ac.signal })
      .then((res) => {
        if (!res.ok) {
          throw new Error("sunucu reddetti; işlem durur");
        }
        return res.json();
      })
      .then((ham: unknown) => {
        if (iptal || !ham || typeof ham !== "object" || !("adet" in ham)) {
          return;
        }
        const n = (ham as { adet: unknown }).adet;
        if (typeof n === "number" && Number.isInteger(n) && n >= 0) {
          setAdet(n);
        }
      })
      .catch((err: unknown) => {
        if (iptal) return;
        setHata(err instanceof Error ? err.message : "işlem durur");
      });
    return () => {
      iptal = true;
      ac.abort();
    };
  }, []);

  function gonder(e: FormEvent) {
    e.preventDefault();
    try {
      baslikDogrula(baslik);
    } catch (err) {
      setHata(err instanceof Error ? err.message : "işlem durur");
      return;
    }
    setAdet((onceki) => onceki + 1);
  }

  return (
    <form onSubmit={gonder}>
      <input value={baslik} onChange={(ev) => setBaslik(ev.target.value)} />
      <p>{adet}</p>
      <p>{hata}</p>
    </form>
  );
}`,
          },
        ),
        koray("Yani etki içinde `setSayac(sayac + 1)` ve `[sayac]` birlikte durursa şantiye donar mı?"),
        maya(
          "Donar. Fail-closed: bağımlılık listesi yalan söylemez; temizlik yoksa eski yanıt durmaz. Kontrollü `value={baslik}` pano ile girdiyi tek tutar.",
        ),
      ],
      conclusion: [
        koray("Pano, nöbetçi, form. Sonraki adım şantiye ofisi mi?"),
        maya(
          "Durum tek kutu, etki temizlikle kapanır, form panodan okur. Bir sonraki bölümde seni Node.js ve Express.js ile Temsili Durum Transferi (REST) kapısı bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_fso2_1",
        "`useEffect(() => setN(n + 1), [n])` ne üretir?",
        ["Tek boyama", "Sonsuz re-render; Fail-closed bu deseni keser", "Yalnız ilk kare", "Prisma satırı"],
        1,
      ),
      mcq(
        "q_fso2_2",
        "Kontrollü formda `value` nereden gelir?",
        ["DOM’un aklından", "useState kutusundan; serbest defaultValue kaçaktır", "JWT’den", "CSS’ten"],
        1,
      ),
      mcq(
        "q_fso2_3",
        "fetch etkisinde temizlik yoksa risk nedir?",
        ["Yoktur", "Yarış: eski yanıt yeni listeyi ezer", "Yalnız CORS", "Otomatik 401"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "fullstack-orta-3",
    order: 3,
    title: "Backend Service Mimarisi: Node.js ve Express.js ile REST API Tasarımı",
    dialogue: {
      warmup: [
        koray(
          "Şantiye ofisinin penceresi sıra ister: fiş, damga, teslim. Sen damgasız kamyonu arka kapıdan içeri alır mısın?",
        ),
        maya(
          "Almazsın. Express.js o penceredir. Temsili Durum Transferi (REST) kaynağı isimlendirir: `/gorevler` koleksiyon, `POST` yazar, `GET` okur. Ara katman (middleware) damga sırasıdır — gövde, doğrulama, işleyici.",
        ),
      ],
      problem: [
        koray("Gövde okunmadan `req.body.baslik` deyince, 500’de 200 basınca saha ne yalan söylüyor?"),
        maya(
          "`undefined` gelir, `toUpperCase` patlar. Fail-closed: `express.json()` önce durur; şema yoksa 400; işleyici hata basarsa 5xx yeşil değildir. Sırasız `next` kapıyı açık unutur.",
        ),
      ],
      development: [
        koray("JSON ara katmanı, gövde kapısı, POST 201. Şemasız 400. Ham string birleştirme yok."),
        maya(
          "Sıra yazılı durur: json → doğrula → işleyici. `baslik` metin değilse 400. Başarı 201 ve `Location`. `app.all` ile her yola açık kapı yok.",
          {
            language: "ts",
            source: `import express, { type NextFunction, type Request, type Response } from "express";

type GorevGirdi = { baslik: string };

function gorevOku(ham: unknown): GorevGirdi {
  if (!ham || typeof ham !== "object" || !("baslik" in ham)) {
    throw new Error("gövde yok; işlem durur");
  }
  const baslik = (ham as { baslik: unknown }).baslik;
  if (typeof baslik !== "string" || baslik.trim() === "") {
    throw new Error("başlık yok; işlem durur");
  }
  return { baslik: baslik.trim() };
}

function dogrulaGorev(req: Request, res: Response, next: NextFunction): void {
  try {
    req.body = gorevOku(req.body);
    next();
  } catch (err) {
    res.status(400).json({
      hata: err instanceof Error ? err.message : "işlem durur",
    });
  }
}

const app = express();
app.use(express.json());
app.post("/gorevler", dogrulaGorev, (_req, res) => {
  res.status(201).json({ id: "g-1" });
});`,
          },
        ),
        koray("Doğrulama işleyiciden sonra durursa ne kırılır?"),
        maya(
          "İşleyici çöp gövdeyi yazar. Fail-closed: ara katman sırası sözleşmedir; `next` atlanırsa yanıt basılmaz, kapı açık kalmaz — 400 erken döner.",
        ),
      ],
      conclusion: [
        koray("Pencere, damga, 201. Defter henüz yok. Sonraki adım malzeme defteri mi?"),
        maya(
          "REST kaynağı isimlendirir, Express sırayı mühürler, şemasız gövde 400 durur. Bir sonraki bölümde seni PostgreSQL ve Prisma nesne-ilişkisel eşleme (ORM) defteri bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_fso3_1",
        "Express’te `express.json()` nereye konur?",
        ["İşleyiciden sonra", "Gövde okunmadan önce; Fail-closed sıra ister", "Yalnız GET’te", "Prisma içine"],
        1,
      ),
      mcq(
        "q_fso3_2",
        "Şemasız POST gövdesi ne basar?",
        ["201 ve uydurma id", "400; işlem durur", "200 boş", "302"],
        1,
      ),
      mcq(
        "q_fso3_3",
        "REST’te POST /gorevler başarısında dürüst kod?",
        ["200 her zaman", "201 oluşturma mührü", "204 silindi", "500 yeşil"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "fullstack-orta-4",
    order: 4,
    title: "İlişkisel Veritabanı ve ORM: PostgreSQL ve Prisma ORM Bağlantısı",
    dialogue: {
      warmup: [
        koray(
          "Şantiye malzeme defteri satır satır mühürlüdür. Sen müşteri adını defter cümlesine yapıştırıp «SELECT … WHERE ad = '» diye açık bırakır mısın?",
        ),
        maya(
          "Bırakmazsın. PostgreSQL ilişkisel defterdir. Prisma nesne-ilişkisel eşleme (ORM) o deftere parametreli kapı açar. Yapılandırılmış Sorgu Dili (SQL) birleştirmesi enjeksiyon kapısıdır — Fail-closed o kapıyı yok saymaz; hiç açmaz.",
        ),
      ],
      problem: [
        koray("`$queryRawUnsafe(\"… WHERE id = \" + id)` neden üretimde şantiyeyi yakar?"),
        maya(
          "Çünkü `id` içine `1; DELETE FROM gorev` sızar. Ham birleştirme güvensiz sorgudur. Fail-closed: Prisma `findUnique` / `create` veya etiketli `$queryRaw` — kullanıcı metni SQL cümlesine yapışmaz.",
        ),
      ],
      development: [
        koray("Modeli yaz, findUnique ile oku, yoksa dur. Raw birleştirme yok. create baslik trim ister."),
        maya(
          "`model Gorev` tapudur. `findUnique` parametreli arar. Kayıt yoksa 404 cümlesi, uydurma satır değil. `$queryRawUnsafe` bu tezgâhta yoktur.",
          {
            language: "ts",
            source: `import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function idDogrula(ham: unknown): string {
  if (typeof ham !== "string" || ham.trim() === "") {
    throw new Error("id yok; işlem durur");
  }
  return ham.trim();
}

async function gorevGetir(hamId: unknown) {
  const id = idDogrula(hamId);
  const kayit = await prisma.gorev.findUnique({ where: { id } });
  if (!kayit) {
    throw new Error("kayıt yok; işlem durur");
  }
  return kayit;
}

async function gorevYaz(baslikHam: string) {
  const baslik = baslikHam.trim();
  if (baslik === "") {
    throw new Error("başlık yok; işlem durur");
  }
  return prisma.gorev.create({ data: { baslik, durum: "acik" } });
}`,
          },
        ),
        koray("Etiketli `$queryRaw` ile Unsafe farkı nedir? Ben yine + ile birleştirsem?"),
        maya(
          "Etiketli şablon parametre bağlar; Unsafe cümleyi olduğu gibi koşturur. Fail-closed: `+ id` yok. Prisma istemcisi yoksa işlem başlamaz — sessiz bellek uydurması yok.",
        ),
      ],
      conclusion: [
        koray("Defter parametreli, ham yapıştırma yok. Sonraki adım yaka kartı mı?"),
        maya(
          "Prisma satırı parametreyle arar; SQL birleştirme enjeksiyon kapısıdır. Bir sonraki bölümde seni JavaScript Nesne Gösterimi Web Jetonu (JWT) ve ara katman kimliği bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_fso4_1",
        "Kullanıcı id’sini SQL cümlesine `+` ile eklemek?",
        ["Hızlıdır, yeter", "Yasak; enjeksiyon kapısı, Fail-closed Prisma API kullanır", "Yalnız GET’te doğru", "ORM zorunlu değil"],
        1,
      ),
      mcq(
        "q_fso4_2",
        "`findUnique` boş dönünce ne yapılır?",
        ["Boş nesne uydurulur", "Kayıt yok; işlem durur", "İlk satır çalınır", "201 basılır"],
        1,
      ),
      mcq(
        "q_fso4_3",
        "`$queryRawUnsafe` bu derste neden yok?",
        ["Yavaş", "Ham cümle Fail-closed kapıyı söker", "Prisma sevmez", "Yalnız MySQL’de"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "fullstack-orta-5",
    order: 5,
    title: "Güvenli API: JWT (JSON Web Token) ve Middleware Tabanlı Kimlik Doğrulama",
    dialogue: {
      warmup: [
        koray(
          "Şantiye kapısında yaka kartı manyetik okunur. Sen kartın üzerindeki isme bakıp imzaya bakmadan içeri alır mısın?",
        ),
        maya(
          "Almazsın. JavaScript Nesne Gösterimi Web Jetonu (JWT) o yaka kartıdır: başlık, yük, imza. `decode` isme bakar; `verify` mührü sorar. Ara katman kapı nöbetçisidir — Bearer yoksa 401, imza yoksa 401.",
        ),
      ],
      problem: [
        koray("`jwt.decode` ile `sub` okuyup içeri almak neden yalan? Gizli anahtar yoksa?"),
        maya(
          "Çünkü sahte kart da `sub` basar. Fail-closed: `JWT_SECRET` yoksa sunucu hiç açılmaz; `verify` fırlatırsa 401, 200 değil. `decode` imza sormaz — kapı açık sayılmaz.",
        ),
      ],
      development: [
        koray("Secret yoksa dur. Bearer oku. verify. sub yoksa 401. next yalnız mühürden sonra."),
        maya(
          "Ara katman sırası: json zaten geçmiş olabilir; kimlik rotadan önce durur. `catch` 401 basar, `next(err)` ile 500 yeşile çevrilmez. Yük `sub` metin değilse işlem durur.",
          {
            language: "ts",
            source: `import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";

function imzaAnahtari(): string {
  const secret = process.env.JWT_SECRET;
  if (typeof secret !== "string" || secret.trim() === "") {
    throw new Error("imza anahtarı yok; işlem durur");
  }
  return secret;
}

function bearerOku(header: unknown): string {
  if (typeof header !== "string" || !header.startsWith("Bearer ")) {
    throw new Error("jeton yok; işlem durur");
  }
  const jeton = header.slice("Bearer ".length).trim();
  if (jeton === "") {
    throw new Error("jeton boş; işlem durur");
  }
  return jeton;
}

export function kimlikAraKatmani(req: Request, res: Response, next: NextFunction): void {
  let secret: string;
  try {
    secret = imzaAnahtari();
  } catch (err) {
    res.status(500).json({ hata: err instanceof Error ? err.message : "işlem durur" });
    return;
  }
  try {
    const jeton = bearerOku(req.headers.authorization);
    const yuk = jwt.verify(jeton, secret);
    if (!yuk || typeof yuk !== "object" || typeof yuk.sub !== "string" || yuk.sub.trim() === "") {
      throw new Error("yük yok; işlem durur");
    }
    (req as Request & { kullaniciId: string }).kullaniciId = yuk.sub;
    next();
  } catch {
    res.status(401).json({ hata: "imza geçersiz; işlem durur" });
  }
}`,
          },
        ),
        koray("`jwt.decode` ile `verify`’i karıştırsam kapı açılır mı? Süresi dolmuş kart?"),
        maya(
          "Açılmaz. Fail-closed: decode imza sormaz, bu tezgâhta yoktur. `verify` süre dolunca fırlatır — 401, sessiz uzatma yok.",
        ),
      ],
      conclusion: [
        koray("Yaka, mühür, 401. Mini proje bu kapıları bir şantiyede mi toplar?"),
        maya(
          "Bearer okunur, verify mührü sorar, secret yoksa sunucu durur. Bir sonraki bölümde seni React + Express + Prisma görev takip kapanışı bekliyor.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_fso5_1",
        "`jwt.decode` kimlik kapısı mıdır?",
        ["Evet, sub yeter", "Hayır; imza sormaz, Fail-closed verify ister", "Yalnız GET’te", "Prisma doğrular"],
        1,
      ),
      mcq(
        "q_fso5_2",
        "`JWT_SECRET` boşken sunucu ne yapar?",
        ["Varsayılan secret uydurur", "Fail-closed; işlem durur, kapı açılmaz", "decode’a düşer", "401 yerine 200"],
        1,
      ),
      mcq(
        "q_fso5_3",
        "Bearer yokken dürüst yanıt?",
        ["200 ve boş kullanıcı", "401; jeton yok, işlem durur", "403 her zaman", "302 login HTML"],
        1,
      ),
    ],
  }),
  academyFiveActLessonDraft({
    key: "fullstack-orta-6",
    order: 6,
    title: "Mini Proje: Full-Stack Görev/Proje Takip Uygulaması (React + Express + Prisma)",
    dialogue: {
      warmup: [
        koray(
          "Şantiye tesliminde oda, pano, ofis penceresi, malzeme defteri ve yaka kartı aynı günde durur. Sen yakasız kamyona defteri açar mısın?",
        ),
        maya(
          "Açmazsın. Bu laboratuvarda React form panoyu tartar, Express sırayı basar, Prisma parametreli yazar, JWT kapıyı kapatır. Dört kapı aynı teslim: doğrula, kimlik, defter, dürüst UI.",
        ),
      ],
      problem: [
        koray(
          "Boş başlıkla POST, decode ile içeri, `+ id` SQL, etkide sonsuz `setAdet` — dördü bir arada ne kırar?",
        ),
        maya(
          "Şantiyeyi. Fail-closed dördünü keser: trim boşsa fetch çıkmaz; verify yoksa 401; Prisma `create` parametreli kalır; etki `[]` ve iptal. 401’de yeşil liste yasaktır.",
        ),
      ],
      development: [
        koray("İstemci tartsın, Bearer taksın, 401’de listeyi silsin. Sunucu verify + Prisma create. Ham SQL yok."),
        maya(
          "Mini proje canlı mutfak iddiası taşımaz; kapılar tarayıcıda ve işleyicide görünür. `res.ok` değilse `setListe([])`. `kullaniciId` yoksa create durur.",
          {
            language: "ts",
            source: `function baslikDogrula(ham: string): string {
  const temiz = ham.trim();
  if (temiz === "") {
    throw new Error("boş başlık; işlem durur");
  }
  return temiz;
}

async function gorevEkle(baslikHam: string, jeton: string): Promise<readonly { id: string }[]> {
  const baslik = baslikDogrula(baslikHam);
  if (jeton.trim() === "") {
    throw new Error("jeton yok; işlem durur");
  }
  const res = await fetch("/api/gorevler", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + jeton,
    },
    body: JSON.stringify({ baslik }),
  });
  if (res.status === 401) {
    throw new Error("imza geçersiz; işlem durur");
  }
  if (!res.ok) {
    throw new Error("sunucu " + String(res.status) + "; yeşil tik yasak");
  }
  const ham: unknown = await res.json();
  if (!Array.isArray(ham)) {
    throw new Error("liste yok; işlem durur");
  }
  return ham.map((satir) => {
    if (!satir || typeof satir !== "object" || !("id" in satir)) {
      throw new Error("satır yok; işlem durur");
    }
    const id = (satir as { id: unknown }).id;
    if (typeof id !== "string") {
      throw new Error("id yok; işlem durur");
    }
    return { id };
  });
}`,
          },
        ),
        koray("Bu mini proje canlı PostgreSQL’e mi bağlı? Sınavda ne ölçülür?"),
        maya(
          "Kapılar sözleşmede görünür; sahte yeşil yok. Canlı defter yarın aynı Prisma ve JWT kapısını doldurur. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
      conclusion: [
        koray("Orta kapanış: oda, pano, pencere, defter, yaka. Sınava girebilir miyim?"),
        maya(
          "Props salt okunur, durum sonsuz döngüsüz, Express şemalı, Prisma parametreli, JWT verify fail-closed durur. Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.",
        ),
      ],
    },
    quiz: [
      mcq(
        "q_fso6_1",
        "Boş başlıkla POST /gorevler?",
        ["201 uydurma", "Yasak; trim sonrası boşluk reddedilir", "Prisma düzeltir", "JWT yeter"],
        1,
      ),
      mcq(
        "q_fso6_2",
        "401 gelince istemci listeyi nasıl basar?",
        ["Eski listeyi yeşil tutar", "Fail-closed; yeşil tik yok, hata cümlesi", "Boş id uydurur", "decode ile geçer"],
        1,
      ),
      mcq(
        "q_fso6_3",
        "Sertifika ne zaman basılır?",
        ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "Prisma migrate deyince"],
        1,
      ),
    ],
  }),
] as const;

const FULLSTACK_ORTA_LESSON_QUIZZES: AcademyExamQuestion[] = FULLSTACK_ORTA_LESSONS.flatMap(
  (lesson) => [...(lesson.quiz ?? [])],
);

/** Kurs sınav havuzu — ders quiz’i + sentez soruları. */
export const FULLSTACK_ORTA_EXAM_QUESTIONS: AcademyExamQuestion[] = [
  ...FULLSTACK_ORTA_LESSON_QUIZZES,
  mcq("q_fso_p1", "JSX neyi basar?", ["SQL", "Bileşenin iskelet cümlesini", "JWT imzası", "Prisma şeması"], 1),
  mcq("q_fso_p2", "Props’u çocuk değiştirirse?", ["SSOT korunur", "Sözleşme kırılır; ebeveyn yeni poşet basar", "Express düzeltir", "201 basılır"], 1),
  mcq("q_fso_p3", "useState tek kutu mudur?", ["Hayır, her render yeni kasa", "Evet; tek yazar pano", "Yalnız formda", "Prisma state’tir"], 1),
  mcq("q_fso_p4", "useEffect temizlik ne keser?", ["CSS", "Yarış ve iptal edilmemiş fetch", "JWT decode", "Grid"], 1),
  mcq("q_fso_p5", "express.json() yokken body?", ["Otomatik nesne", "undefined; Fail-closed önce json", "Prisma doldurur", "JWT yükü"], 1),
  mcq("q_fso_p6", "REST POST başarı kodu?", ["200 zorunlu", "201 oluşturma", "204", "302"], 1),
  mcq("q_fso_p7", "Prisma findUnique parametre midir?", ["Hayır, string birleştirir", "Evet; id bağlanır, SQL yapışmaz", "Yalnız Unsafe", "GET’te hayır"], 1),
  mcq("q_fso_p8", "Ham SQL + kullanıcı metni?", ["Hızlı teslim", "Enjeksiyon; yasak", "ORM aynı", "401 yeter"], 1),
  mcq("q_fso_p9", "jwt.verify ne sorar?", ["Yalnız sub yazısı", "İmza ve süre; decode yetmez", "Prisma satırı", "CSS sınıfı"], 1),
  mcq("q_fso_p10", "Bearer yok?", ["200 misafir", "401; kapı kapalı", "403 her zaman", "500 yeşil"], 1),
  mcq("q_fso_p11", "JWT_SECRET boş?", ["demo secret", "Sunucu durur; uydurma anahtar yok", "decode açar", "client secret yeter"], 1),
  mcq("q_fso_p12", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  mcq("q_fso_p13", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet hash", "Yalnız satın alma"], 1),
  mcq("q_fso_p14", "Bu Orta kapanış özeti nedir?", ["Yalnız HTML", "React + Express + Prisma + JWT Fail-closed", "Yalnız Figma", "Yalnız DNS"], 1),
];
