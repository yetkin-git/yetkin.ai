import { describe, expect, it } from "vitest";

import {
  collectCliches,
  scanLessonText,
  scoreDepthBand,
  scoreWrittenLesson,
  type WrittenLesson,
} from "../../packages/junior-content/src/content-quality";

function lesson(patch: Partial<WrittenLesson> & Pick<WrittenLesson, "key" | "title" | "concept" | "fields">): WrittenLesson {
  return {
    course: "mat",
    band: "legacy-2018",
    hours: 0,
    outcomeCodes: [],
    example: "2 üssü 3, 8 eder. 10 üssü 2 ise 100 eder. İki örnek de tekrarlı çarpımdır ve sonuç baştan söylenir.",
    warning: "Dikkatli ol.",
    recap: "Üslü ifade tekrarlı çarpımdır.",
    life: "Elimize bir kâğıt alalım. Kâğıdı önce ortadan 2'ye katlıyoruz. Sonra üçüncü kez tekrar 2'ye katlıyoruz. 2³ = 8 demektir.",
    skill: null,
    quizQuestions: [
      { level: "concept", question: "2 üssü 3 ifadesinde taban hangisidir?" },
      { level: "apply", question: "2 üssü 3 kaç eder?" },
    ],
    ...patch,
  };
}

describe("içerik kalite doğrulayıcı", () => {
  it("üslü ifadede Lego kulesini toplama algısı diye işaretler", () => {
    const welcome =
      "Odanda 2'şerli Lego'lardan 3 kat kule yaptığında aslında matematiksel bir üslü ifade oluşturursun.";
    const findings = scanLessonText(
      lesson({
        key: "jr_06_mat-1",
        title: "Üslü ifadede taban ve üs",
        concept: "Üslü ifade, aynı sayının kendisiyle tekrarlı çarpımıdır. Taban çarpılan sayıdır. Üs, kaç kez çarpıldığını söyler.",
        fields: [{ name: "welcome", text: welcome }],
      }),
    );
    expect(findings.map((finding) => finding.code)).toContain("uslu-lego-kule");
    expect(findings[0]?.message).toContain("2×3");
  });

  it("kâğıt katlamayı üslü ifadede doğru model sayar", () => {
    const findings = scanLessonText(
      lesson({
        key: "jr_06_mat-1",
        title: "Üslü ifadede taban ve üs",
        concept: "Üslü ifade tekrarlı çarpımdır. Taban alttaki sayıdır. Üs çarpım sayısını söyler.",
        fields: [
          {
            name: "life",
            text: "Kâğıdı önce ortadan 2'ye katlıyoruz. Sonra üçüncü kez tekrar 2'ye katlıyoruz. Bu 2³ = 8 demektir.",
          },
        ],
      }),
    );
    expect(findings).toEqual([]);
  });

  it("paydaları toplama kuralını kavramda yakalar, tuzak cümlesinde geçmez", () => {
    const concept = "Kesir toplarken paydaları topla ve payları yanına yaz.";
    const caught = scanLessonText(
      lesson({
        key: "jr_06_mat-11",
        title: "Kesirlerde toplama",
        concept,
        fields: [{ name: "concept", text: concept }],
      }),
    );
    expect(caught.map((finding) => finding.code)).toContain("payda-topla");

    const warning = "Paydaları toplamak tuzaktır. Payda eşitlenir, toplanmaz.";
    const spared = scanLessonText(
      lesson({
        key: "jr_06_mat-11",
        title: "Kesirlerde toplama",
        concept: "Paydası eşit kesirlerde paylar toplanır. Payda aynı kalır. Sonuç sadeleştirilir.",
        fields: [{ name: "warning", text: warning }],
      }),
    );
    expect(spared.map((finding) => finding.code)).not.toContain("payda-topla");
  });

  it("aynı sayısal sonucu saran beceri sorusunu yüzeysel sayar", () => {
    const scored = scoreWrittenLesson(
      lesson({
        key: "jr_06_mat-1",
        title: "Üslü ifadede taban ve üs",
        concept:
          "Üslü ifade, aynı sayının kendisiyle tekrarlı çarpımıdır. Taban hangi sayının çarpılacağını söyler. Üs, kaç kez çarpılacağını söyler. 2 üssü 3 ile 2 çarpı 3 aynı iş değildir.",
        skill: {
          question: "Ela oyununda skor her tur ikiye katlanıyor. Üç tur sonra skor 2 üssü 3 kadar büyüyor. Kaç kat büyümüştür?",
          correctOption: "8 kat",
          explanation: "Adım 1: 2 çarpı 2 çarpı 2. Adım 2: Sonuç 8.",
          applyCorrectOption: "8",
        },
      }),
      [],
    );
    expect(scored.beceri).toBe("yüzeysel");
    expect(scored.alignment).toBe("çıktı-dışı");
  });

  it("bağlamlı iki adımlı beceri sorusunu tam sayar", () => {
    const scored = scoreWrittenLesson(
      lesson({
        key: "jr_06_mat-6",
        title: "Asal sayılar",
        band: "tymm",
        hours: 2,
        outcomeCodes: ["MAT.6.1.3"],
        concept:
          "Asal sayı 1'den büyüktür ve yalnız 1 ile kendisine kalansız bölünür. 1 asal sayılmaz çünkü tek böleni kendisidir. 2 en küçük asal sayıdır ve çift olan tek asaldır. Asal çarpan, bir sayının çarpan ağacında asal kalan parçasıdır.",
        example:
          "12 sayısı önce 2 çarpı 6 diye açılır ve 6 asal olmadığı için yeniden bölünür. İkinci örnekte 15 sayısı 3 çarpı 5 diye ayrılır ve her iki çarpan da asaldır.",
        life: "Okul numarası 18 olan bir dolabı asal çarpanlarına ayır. 18, 2 çarpı 3 çarpı 3 eder. Çarpan ağacını deftere çiz.",
        skill: {
          question: "Okulda 12 öğrenci var. Öğretmen onları eşit gruplara ayırırken asal olmayan ara çarpan kullanmadan ayırmak istiyor. Hangi ayrım asal çarpanlara uygundur?",
          correctOption: "2 çarpı 2 çarpı 3",
          explanation: "Adım 1: 12, 2 çarpı 6 açılır. Adım 2: 6 asal değildir, 2 çarpı 3 diye bölünür. Adım 3: 2 çarpı 2 çarpı 3 kalır.",
          applyCorrectOption: "4 çarpı 3",
        },
      }),
      [
        {
          course: "mat",
          outcomeCode: "MAT.6.1.3",
          outcomeTitle: "Asal sayı ve asal çarpan",
          hours: 2,
          processOpen: false,
        },
      ],
    );
    expect(scored.kavram).toBe("tam");
    expect(scored.uygulama).toBe("tam");
    expect(scored.beceri).toBe("tam");
    expect(scored.alignment).toBe("üç-aşama");
  });

  it("üç derste birden geçen koç kalıbını sayar", () => {
    const hits = collectCliches(
      ["jr_06_mat-1", "jr_06_mat-2", "jr_06_fen-1"].map((key) =>
        lesson({
          key,
          title: "Deneme",
          concept: "Kavram cümlesi burada durur ve tanımdır.",
          fields: [{ name: "concept", text: "Şurası aklında kalsın tamam mı: bu bir tanım cümlesidir ve sınırını da söyler." }],
        }),
      ),
    );
    expect(hits.find((hit) => hit.label.startsWith("Şurası"))?.count).toBe(3);
  });

  it("tanım ve günlük örnekte kalan dersi Katman 1 sayar", () => {
    const scored = scoreDepthBand(
      lesson({
        key: "jr_06_mat-1",
        title: "Üslü ifadede taban ve üs",
        concept: "Üslü ifade, aynı sayının kendisiyle tekrarlı çarpımıdır. Taban çarpılan sayıdır. Üs, kaç kez çarpıldığını söyler.",
        fields: [{ name: "concept", text: "Üslü ifade tekrarlı çarpımdır." }],
        example: "2 üssü 3, 8 eder.",
        warning: "Dikkatli ol.",
        quizQuestions: [
          { level: "concept", question: "Taban nedir?" },
          { level: "apply", question: "Üs nedir?" },
        ],
      }),
    );
    expect(scored.layer1).toBe("tam");
    expect(scored.layer2).toBe("yok");
    expect(scored.ceiling).toBe("katman-1");
    expect(scored.gaps.join(" ")).toContain("Pratik kural");
    expect(scored.gaps.join(" ")).toContain("Soru tipi");
  });

  it("dört direk tamamsa dersi Katman 2 omurgasına alır", () => {
    const scored = scoreDepthBand(
      lesson({
        key: "jr_06_mat-1",
        title: "Üslü ifadede taban ve üs",
        concept:
          "Üslü ifade, aynı sayının kendisiyle tekrarlı çarpımıdır. Taban hangi sayının çarpılacağını söyler. Üs, kaç kez çarpılacağını söyler. Pratik kural: önce tabanı, sonra üssü söyle.",
        example:
          "Birinci örnekte 2 üssü 3, 2 çarpı 2 çarpı 2 diye açılır ve 8 eder. İkinci örnekte 10 üssü 2, 10 çarpı 10 diye açılır ve 100 eder. Üçüncü örnekte 5 üssü 1, sayının kendisidir ve 5 eder.",
        warning: "2 üssü 3 ifadesini 2 çarpı 3 sanmak tuzaktır. Önce tekrarlı çarpımı kur, sonra sonucu söyle.",
        fields: [{ name: "warning", text: "Tuzak: 2 çarpı 3." }],
        quizQuestions: [
          { level: "concept", question: "2 üssü 3 ifadesinde taban ve üs hangisidir?" },
          {
            level: "apply",
            question: "Marketten alınan 2 paket üç kez üst üste çarpılıyor ancak kasiyer bunu 2 çarpı 3 sanıyor. Doğru sonuç kaçtır?",
          },
        ],
      }),
    );
    expect(scored.layer2).toBe("tam");
    expect(scored.ceiling).toBe("katman-2");
  });

  it("omurga ve bağlamlı beceri sorusu varsa Katman 3 sayar", () => {
    const scored = scoreDepthBand(
      lesson({
        key: "jr_06_mat-6",
        title: "Asal sayılar",
        concept:
          "Asal sayı 1'den büyüktür ve yalnız 1 ile kendisine kalansız bölünür. 1 asal sayılmaz. Pratik kural: önce bölenleri say, sonra asalları ayır.",
        example:
          "Birinci örnekte 12, 2 çarpı 2 çarpı 3 diye açılır. İkinci örnekte 15, 3 çarpı 5 diye ayrılır. Üçüncü örnekte 9, 3 çarpı 3 kalır ve 9 asal değildir.",
        warning: "1'i asal sanmak tuzaktır. Önce 1'i ele, sonra çarpan ağacını kur.",
        life: "Okul numarası 18 olan bir dolabı asal çarpanlarına ayır. 18, 2 çarpı 3 çarpı 3 eder. Çarpan ağacını deftere çiz.",
        fields: [{ name: "warning", text: "1 asal değildir." }],
        quizQuestions: [
          { level: "concept", question: "Asal sayı nedir?" },
          {
            level: "apply",
            question: "Okuldaki 12 öğrenci eşit gruplara ayrılacak ancak asal olmayan ara çarpan kullanılmayacak. Hangi çarpım doğrudur ve sonuç kaçtır?",
          },
        ],
        skill: {
          question:
            "Okulda 12 öğrenci var. Öğretmen onları eşit gruplara ayırırken asal olmayan ara çarpan kullanmadan ayırmak istiyor. Hangi ayrım asal çarpanlara uygundur?",
          correctOption: "2 çarpı 2 çarpı 3",
          explanation: "Adım 1: 12, 2 çarpı 6 açılır. Adım 2: 6 asal değildir, 2 çarpı 3 diye bölünür.",
          applyCorrectOption: "4 çarpı 3",
        },
      }),
    );
    expect(scored.layer2).toBe("tam");
    expect(scored.layer3).toBe("tam");
    expect(scored.ceiling).toBe("katman-3");
    expect(scored.gaps).toEqual([]);
  });
});
