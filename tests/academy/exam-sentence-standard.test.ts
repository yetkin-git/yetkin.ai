import { describe, expect, it } from "vitest";
import { officeAiSections } from "@/lib/academy/curricula/office_ai";
import { curriculumForCourseSlug } from "@/lib/academy/curriculum";
import { ACADEMY_EXAM_PASS_SCORE } from "@/lib/academy/exam";
import { OFFICE_AI_EXAM_QUESTIONS } from "@/lib/academy/exam-pools";
import {
  ACADEMY_LESSON_EXAM_PASS_SCORE,
  loadAcademyLessonExam,
} from "@/lib/academy/lesson-exams";

/**
 * TEDAVİ-01 — vatandaş kapanış cümlesi + baraj sabiti + yasaklı jargon.
 * Mühürlü kaset (TTS) değişmez; yalnız compact makale ve ölçme metni kilitlenir.
 */
const LAST_LESSON_KEY = "01_office_ai-6";
const PENDING_EXAM_SENTENCE =
  `Sınav, 9. ders bitince açılır. Baraj ${ACADEMY_EXAM_PASS_SCORE} puandır.`;
const OPENED_EXAM_SENTENCE =
  `Sınav şimdi açıldı. Baraj ${ACADEMY_EXAM_PASS_SCORE} puandır.`;

const FORBIDDEN_BODY_JARGON = [
  /\bscore\b/iu,
  /prompt terminali/iu,
  /özel API/iu,
  /Şirket API/iu,
] as const;

function citizenExamSurface(question: { prompt: string; choices: readonly string[] }): string {
  return `${question.prompt}\n${question.choices.join("\n")}`;
}

function officeAiLessonKey(section: { lessonKey?: string }): string {
  const key = section.lessonKey?.trim();
  if (!key) {
    throw new Error("Office AI bölümü lessonKey taşımaz.");
  }
  return key;
}

describe("sınav cümle standardı — 9 ders kapanışı", () => {
  it("ders 1–8 bekleyen kapıyı, kapanış dersi açık kapıyı basar", () => {
    expect(officeAiSections).toHaveLength(9);
    const lessons = curriculumForCourseSlug("01_office_ai");
    expect(lessons).toHaveLength(9);

    for (const section of officeAiSections) {
      const lesson = lessons.find((row) => row.key === section.lessonKey);
      expect(lesson, section.lessonKey).toBeTruthy();
      const sources = [
        ["makale", section.contentMarkdown],
        ["oyuncu", lesson!.body],
      ] as const;
      for (const [label, text] of sources) {
        if (section.lessonKey === LAST_LESSON_KEY) {
          expect(text, `${section.lessonKey}:${label}`).toContain(OPENED_EXAM_SENTENCE);
          expect(text, `${section.lessonKey}:${label}`).not.toContain(
            "Sınav, 9. ders bitince açılır.",
          );
        } else {
          expect(text, `${section.lessonKey}:${label}`).toContain(PENDING_EXAM_SENTENCE);
          expect(text, `${section.lessonKey}:${label}`).not.toContain("Sınav şimdi açıldı.");
        }
      }
    }
  });

  it("ders gövdesindeki baraj puanı ACADEMY_EXAM_PASS_SCORE ile örtüşür", () => {
    expect(ACADEMY_LESSON_EXAM_PASS_SCORE).toBe(ACADEMY_EXAM_PASS_SCORE);
    const barajNumber = new RegExp(String.raw`Baraj\s+(\d+)`, "gu");
    for (const section of officeAiSections) {
      const blob = `${section.contentMarkdown}\n${section.pedagogicalObjective}`;
      const hits = [...blob.matchAll(barajNumber)];
      expect(hits.length, section.lessonKey).toBeGreaterThan(0);
      for (const hit of hits) {
        expect(Number(hit[1]), `${section.lessonKey}:${hit[0]}`).toBe(
          ACADEMY_EXAM_PASS_SCORE,
        );
      }
      const exam = loadAcademyLessonExam(officeAiLessonKey(section));
      expect(exam?.passScore, section.lessonKey).toBe(ACADEMY_EXAM_PASS_SCORE);
    }
  });
});

describe("Office AI vatandaş lisanı — yasaklı jargon kilidi", () => {
  it("ders gövdesinde score / prompt terminali / özel API geçmez", () => {
    for (const section of officeAiSections) {
      const blob = `${section.contentMarkdown}\n${section.pedagogicalObjective}`;
      for (const pattern of FORBIDDEN_BODY_JARGON) {
        expect(blob, `${section.lessonKey}:${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it("halüsinasyon yalnız ilk geçişte parantezli teknik addır", () => {
    const bodies = officeAiSections.map((section) => section.contentMarkdown).join("\n");
    const hits = bodies.match(/halüsinasyon/giu) ?? [];
    expect(hits).toHaveLength(1);
    expect(bodies).toContain("uydurma (teknik adıyla halüsinasyon)");
  });

  it("F2 ilk geçişte Mac karşılığı ve hücre düzenleme açıklamasını taşır", () => {
    const first = officeAiSections[0];
    expect(first?.lessonKey).toBe("01_office_ai-1");
    expect(first?.contentMarkdown).toMatch(
      /hücreye tıkla, klavyenin üstündeki F2 tuşuna bas \(Mac'te Fn\+F2\) — hücre düzenleme açılır/u,
    );
  });

  it("mühür havuzu ve mini sınav vatandaş lisanı taşır (prompt / temperature / SUM yok)", () => {
    const questions = [
      ...OFFICE_AI_EXAM_QUESTIONS,
      ...officeAiSections.flatMap(
        (section) => loadAcademyLessonExam(officeAiLessonKey(section))?.questions ?? [],
      ),
    ];
    expect(questions.length).toBeGreaterThan(40);
    for (const question of questions) {
      const surface = citizenExamSurface(question);
      expect(surface, question.id).not.toMatch(/\bprompt\b/iu);
      expect(surface, question.id).not.toMatch(/\btemperature\b/iu);
      expect(surface, question.id).not.toMatch(/\bSUM\b/u);
      expect(surface, question.id).not.toMatch(/gemini\.google\.com/iu);
    }
  });

  it("Ders 1 mini sınav ve havuz soruları SEN dili, A1 kuralı ve kesme işareti taşır", () => {
    const lessonOne = loadAcademyLessonExam("01_office_ai-1");
    expect(lessonOne).toBeTruthy();
    for (const question of lessonOne!.questions) {
      const surface = citizenExamSurface(question);
      expect(surface, question.id).not.toMatch(/yer almaktadır/u);
      expect(surface, question.id).not.toMatch(/gözlenmiştir|uygulanmalıdır/u);
      expect(surface, question.id).not.toMatch(/A1 eşiği/u);
      expect(surface, question.id).not.toMatch(/yapay zeka\b/u);
      expect(surface, question.id).not.toMatch(/\(Hide\)/u);
      expect(surface, question.id).not.toMatch(/apostrof/iu);
      expect(surface, question.id).not.toMatch(/metin ayracı/u);
      expect(surface, question.id).not.toMatch(/çalışma sayfas/u);
    }
    expect(citizenExamSurface(lessonOne!.questions[0]!)).toMatch(/A1 kuralı/u);
    expect(citizenExamSurface(lessonOne!.questions[1]!)).toMatch(/Fn\+F2/u);
    expect(citizenExamSurface(lessonOne!.questions[1]!)).toMatch(/kesme işareti/u);
    expect(citizenExamSurface(lessonOne!.questions[2]!)).toMatch(/dağınık tablo/u);

    const pool = Object.fromEntries(OFFICE_AI_EXAM_QUESTIONS.map((row) => [row.id, row]));
    expect(citizenExamSurface(pool.q_off_1!)).toMatch(/masadaki asistan/iu);
    expect(citizenExamSurface(pool.q_off_1!)).not.toMatch(/dijital stajyer/u);
    expect(citizenExamSurface(pool.q_off_2!)).toMatch(/A1 kuralı/u);
    expect(citizenExamSurface(pool.q_off_3!)).toMatch(/Fn\+F2/u);
    expect(citizenExamSurface(pool.q_off_3!)).toMatch(/kesme işareti/u);
    expect(citizenExamSurface(pool.q_off_13!)).toMatch(/masadaki asistan/iu);
    expect(citizenExamSurface(pool.q_off_13!)).toMatch(/zayıf bir istemdir/u);
    expect(citizenExamSurface(pool.q_off_16!)).toMatch(/hangi istemi yazarsın/u);
    expect(citizenExamSurface(pool.q_off_26!)).toMatch(/istemine yazıp/u);
  });

  it("Ders 2 mini sınav ve havuz soruları SEN dili, ham kimlik ve dış sohbet taşır", () => {
    const lessonTwo = loadAcademyLessonExam("01_office_ai-k1");
    expect(lessonTwo).toBeTruthy();
    for (const question of lessonTwo!.questions) {
      const surface = citizenExamSurface(question);
      expect(surface, question.id).not.toMatch(/yer almaktadır/u);
      expect(surface, question.id).not.toMatch(/gözlenmiştir|uygulanmalıdır/u);
      expect(surface, question.id).not.toMatch(/kiracı/u);
      expect(surface, question.id).not.toMatch(/bekçi/u);
      expect(surface, question.id).not.toMatch(/yapay zeka\b/u);
      expect(surface, question.id).not.toMatch(/soruyu bırak/iu);
      expect(surface, question.id).not.toMatch(/kamu cümlesi|kamu katalog/u);
    }
    expect(citizenExamSurface(lessonTwo!.questions[0]!)).toMatch(/maskeleyip kısa sorunu yazmak/u);
    expect(citizenExamSurface(lessonTwo!.questions[0]!)).toMatch(/müşteri programı \(CRM\)/iu);
    expect(citizenExamSurface(lessonTwo!.questions[1]!)).toMatch(/dış sohbet/iu);
    expect(citizenExamSurface(lessonTwo!.questions[2]!)).toMatch(/açık katalog bilgisi/iu);

    const pool = Object.fromEntries(OFFICE_AI_EXAM_QUESTIONS.map((row) => [row.id, row]));
    expect(citizenExamSurface(pool.q_off_24!)).toMatch(/müşteri programı \(CRM\)/iu);
    expect(citizenExamSurface(pool.q_off_37!)).toMatch(/kısa sorunu yazmak/u);
    expect(citizenExamSurface(pool.q_off_38!)).toMatch(/açık katalog bilgisi/iu);
    expect(citizenExamSurface(pool.q_off_39!)).not.toMatch(/kiracı/u);
    expect(citizenExamSurface(pool.q_off_40!)).toMatch(/açık katalog bilgisi/iu);
    expect(citizenExamSurface(pool.q_off_41!)).not.toMatch(/bekçi/u);
    expect(citizenExamSurface(pool.q_off_42!)).toMatch(/sorunu yazmak/u);
    expect(citizenExamSurface(pool.q_off_42!)).not.toMatch(/soruyu bırak/iu);
  });

  it("Ders 3 mini sınav ve havuz soruları SEN dili, yönetim özeti ve karar cümlesi taşır", () => {
    const lessonThree = loadAcademyLessonExam("01_office_ai-2");
    expect(lessonThree).toBeTruthy();
    for (const question of lessonThree!.questions) {
      const surface = citizenExamSurface(question);
      expect(surface, question.id).not.toMatch(/gerekmektedir|karşılaşılabilecek/u);
      expect(surface, question.id).not.toMatch(/gözlenmiştir|uygulanmalıdır/u);
      expect(surface, question.id).not.toMatch(/yapay zeka\b/u);
      expect(surface, question.id).not.toMatch(/anomali|aksiyon|trend hesap/u);
    }
    expect(citizenExamSurface(lessonThree!.questions[0]!)).toMatch(/yönetim özeti/u);
    expect(citizenExamSurface(lessonThree!.questions[0]!)).toMatch(/karar cümlesi/u);
    expect(citizenExamSurface(lessonThree!.questions[1]!)).toMatch(/Gözlem tabloyu anlatır/u);
    expect(citizenExamSurface(lessonThree!.questions[2]!)).toMatch(/A1 kuralıyla/u);
    expect(citizenExamSurface(lessonThree!.questions[2]!)).toMatch(/Ham tabloyu sohbete yüklersin/u);

    const pool = Object.fromEntries(OFFICE_AI_EXAM_QUESTIONS.map((row) => [row.id, row]));
    expect(citizenExamSurface(pool.q_off_10!)).toMatch(/kaynak hücreden/u);
    expect(citizenExamSurface(pool.q_off_10!)).not.toMatch(/evrattan|evraktan/u);
    expect(citizenExamSurface(pool.q_off_11!)).toMatch(/kaynak hücreden veya TOPLA/u);
    expect(citizenExamSurface(pool.q_off_13!)).toMatch(/Format ve kısıt/u);
    expect(citizenExamSurface(pool.q_off_18!)).toMatch(/yönetim özeti/u);
    expect(citizenExamSurface(pool.q_off_18!)).toMatch(/yazarsın/u);
    expect(citizenExamSurface(pool.q_off_18!)).toMatch(/finans müdürü/u);
    expect(citizenExamSurface(pool.q_off_29!)).toMatch(/isteme/u);
    expect(citizenExamSurface(pool.q_off_29!)).toMatch(/tek karar cümlesi/u);
    expect(citizenExamSurface(pool.q_off_6!)).not.toMatch(/VBA|Gamma|Marp/u);
    expect(citizenExamSurface(pool.q_off_36!)).not.toMatch(/VBA|Gamma|Marp/u);
  });

  it("Ders 3 compact makale vatandaş lisanı taşır (A1 kuralı / istem / yönetim özeti)", () => {
    const third = officeAiSections[2];
    expect(third?.lessonKey).toBe("01_office_ai-2");
    const blob = `${third!.contentMarkdown}\n${third!.pedagogicalObjective}`;
    expect(blob).toMatch(/A1 kuralıyla/u);
    expect(blob).toMatch(/KVKK kuralını kilitledik/u);
    expect(blob).toMatch(/yönetim özeti/u);
    expect(blob).toMatch(/karar cümlesi/u);
    expect(blob).toMatch(/maskeli temiz tablo olarak/u);
    expect(blob).toMatch(/Bu temiz tablodan toplamı ve yönü çıkar/u);
    expect(blob).toMatch(/Grafik bu derste yok; grafikleri Excel Formül dersinde/u);
    expect(blob).not.toMatch(/A1 eşiği/u);
    expect(blob).not.toMatch(/KVKK bekçisi/u);
    expect(blob).not.toMatch(/yönetici özeti/u);
    expect(blob).not.toMatch(/eylem cümlesi/u);
    expect(blob).not.toMatch(/Grafik vaadi/u);
    expect(blob).not.toMatch(/\bkomut/u);
    expect(blob).not.toMatch(/matris halinde/u);
  });

  it("Ders 4 mini sınav ve havuz soruları SEN dili, istem, taslak ve konuşmacı notu taşır", () => {
    const lessonFour = loadAcademyLessonExam("01_office_ai-3");
    expect(lessonFour).toBeTruthy();
    for (const question of lessonFour!.questions) {
      const surface = citizenExamSurface(question);
      expect(surface, question.id).not.toMatch(/sunulmak üzere|çıkarılırken|verilmelidir/u);
      expect(surface, question.id).not.toMatch(/gözlenmiştir|uygulanmalıdır/u);
      expect(surface, question.id).not.toMatch(/yapay zeka\b/u);
      expect(surface, question.id).not.toMatch(/speaker notes/iu);
      expect(surface, question.id).not.toMatch(/bilişsel yük/u);
    }
    expect(citizenExamSurface(lessonFour!.questions[0]!)).toMatch(/İsteme ne yazarsın/u);
    expect(citizenExamSurface(lessonFour!.questions[0]!)).toMatch(/tek fikir/u);
    expect(citizenExamSurface(lessonFour!.questions[0]!)).toMatch(/ham metni aynen sohbete yapıştırmak/u);
    expect(citizenExamSurface(lessonFour!.questions[1]!)).toMatch(/Görsel yönlendirmeyi neden yazarsın/u);
    expect(citizenExamSurface(lessonFour!.questions[1]!)).toMatch(/başlık-madde sırası/u);
    expect(citizenExamSurface(lessonFour!.questions[2]!)).toMatch(/detayı nereye koyarsın/u);
    expect(citizenExamSurface(lessonFour!.questions[2]!)).toMatch(/konuşmacı notuna yazarsın/u);

    const pool = Object.fromEntries(OFFICE_AI_EXAM_QUESTIONS.map((row) => [row.id, row]));
    expect(citizenExamSurface(pool.q_off_19!)).toMatch(/ne istersin/u);
    expect(citizenExamSurface(pool.q_off_19!)).toMatch(/konuşma taslağı/u);
    expect(citizenExamSurface(pool.q_off_19!)).not.toMatch(/iskelet/u);
    expect(citizenExamSurface(pool.q_off_20!)).toMatch(/isteme ne koyarsın/u);
    expect(citizenExamSurface(pool.q_off_20!)).toMatch(/Tek fikir, görsel yönlendirme ve konuşmacı notu/u);
    expect(citizenExamSurface(pool.q_off_20!)).not.toMatch(/sendrom|tarife|süre, kitle/u);
    expect(citizenExamSurface(pool.q_off_23!)).toMatch(/neden yazarsın/u);
    expect(citizenExamSurface(pool.q_off_23!)).toMatch(/başlık-madde sırası/u);
    expect(citizenExamSurface(pool.q_off_23!)).not.toMatch(/hiyerarşi/u);
    expect(citizenExamSurface(pool.q_off_30!)).toMatch(/detayı nereye koyarsın/u);
    expect(citizenExamSurface(pool.q_off_30!)).toMatch(/konuşmacı notuna yazarsın/u);
  });

  it("Ders 4 compact makale vatandaş lisanı taşır (yönetim özeti / istem / bakma sırası)", () => {
    const fourth = officeAiSections[3];
    expect(fourth?.lessonKey).toBe("01_office_ai-3");
    const blob = `${fourth!.contentMarkdown}\n${fourth!.pedagogicalObjective}`;
    expect(blob).toMatch(/yönetim özeti/u);
    expect(blob).toMatch(/karar cümlesi/u);
    expect(blob).toMatch(/İsteminde başlıkları/u);
    expect(blob).toMatch(/bakma sırası/u);
    expect(blob).toMatch(/görsel hiyerarşi \(gözün bakma sırası\)/u);
    expect(blob).toMatch(/grafik veya resim/u);
    expect(blob).toMatch(/boş bir slayta/u);
    expect(blob).toMatch(/Kişi adı, IBAN veya şirket sırrı varsa önce maskele/u);
    expect(blob).toMatch(/yapay zekâ yönlendirmesi/iu);
    expect(blob).not.toMatch(/yönetici özeti/u);
    expect(blob).not.toMatch(/\bkomut/u);
    expect(blob).not.toMatch(/infografik/u);
    expect(blob).not.toMatch(/kıdemli bir sunum tasarımcısı/u);
    expect(blob).not.toMatch(/talep etmeliyiz/u);
    expect(blob).not.toMatch(/beyaz bir çalışma sayfasına/u);
    expect(blob).not.toMatch(/görsel dille/u);
  });

  it("Ders 1 compact makale vatandaş lisanı taşır (anonimize / A1 eşiği / kiracı yok)", () => {
    const first = officeAiSections[0];
    expect(first?.lessonKey).toBe("01_office_ai-1");
    const blob = `${first!.contentMarkdown}\n${first!.pedagogicalObjective}`;
    expect(blob).toMatch(/kimliği gizlenmiş örnek tablo/u);
    expect(blob).toMatch(/A1 kuralı/u);
    expect(blob).toMatch(/A1 düzeni/u);
    expect(blob).toMatch(/Copilot düğmesinden/u);
    expect(blob).not.toMatch(/anonimize/u);
    expect(blob).not.toMatch(/A1 eşiği/u);
    expect(blob).not.toMatch(/A1 hijyen/u);
    expect(blob).not.toMatch(/kiracı/u);
    expect(blob).not.toMatch(/kusursuz/u);
    expect(blob).not.toMatch(/potansiyel hata/u);
    expect(blob).not.toMatch(/özet tabloya/u);
    expect(blob).not.toMatch(/üç altın kural/u);
  });

  it("Ders 2 compact makale vatandaş lisanı taşır (A1 kuralı / dış sohbet / açık katalog)", () => {
    const second = officeAiSections[1];
    expect(second?.lessonKey).toBe("01_office_ai-k1");
    const blob = `${second!.contentMarkdown}\n${second!.pedagogicalObjective}`;
    expect(blob).toMatch(/A1 kuralı/u);
    expect(blob).toMatch(/dış sohbet/u);
    expect(blob).toMatch(/açık katalog bilgisi/iu);
    expect(blob).toMatch(/müşteri programı \(CRM\)/iu);
    expect(blob).toMatch(/hangi satırın sohbete gitmeyeceğini tek başına ayıracaksın/u);
    expect(blob).toMatch(/Aynı kural Copilot şeridinde de, Gemini ataşında da durur/u);
    expect(blob).not.toMatch(/A1 eşiği/u);
    expect(blob).not.toMatch(/hijyen/iu);
    expect(blob).not.toMatch(/Telefonu kırp/u);
    expect(blob).not.toMatch(/Soruyu bırak/u);
    expect(blob).not.toMatch(/tüketici modeli/u);
    expect(blob).not.toMatch(/kamu cümlesi|kamu kataloğu/u);
    expect(blob).not.toMatch(/0555 111 22 33/u);
    expect(blob).not.toMatch(/kiracı/u);
    expect(blob).not.toMatch(/bekçi/u);
  });

  it("Ders 5 mini sınav ve havuz soruları SEN dili, Excel TOPLA ve insan gözü taşır", () => {
    const lessonFive = loadAcademyLessonExam("01_office_ai-5");
    expect(lessonFive).toBeTruthy();
    for (const question of lessonFive!.questions) {
      const surface = citizenExamSurface(question);
      expect(surface, question.id).not.toMatch(/yer almakta|izlenmesi gereken/u);
      expect(surface, question.id).not.toMatch(/gözlenmiştir|uygulanmalıdır/u);
      expect(surface, question.id).not.toMatch(/yapay zeka\b/u);
      expect(surface, question.id).not.toMatch(/e-tablo|rastgelelik|mutabakat|özet tablo/u);
      expect(surface, question.id).not.toMatch(/bölge satır/iu);
    }
    expect(citizenExamSurface(lessonFive!.questions[0]!)).toMatch(/kilitlersin/u);
    expect(citizenExamSurface(lessonFive!.questions[0]!)).toMatch(/Excel TOPLA/u);
    expect(citizenExamSurface(lessonFive!.questions[0]!)).toMatch(/ham tabloyu aynen sohbete yapıştırırsın/u);
    expect(citizenExamSurface(lessonFive!.questions[1]!)).toMatch(/Ne yaparsın/u);
    expect(citizenExamSurface(lessonFive!.questions[1]!)).toMatch(/kaynak evraktan insan gözüyle/u);
    expect(citizenExamSurface(lessonFive!.questions[2]!)).toMatch(/neden insan gözüyle kilitlersin/u);
    expect(citizenExamSurface(lessonFive!.questions[2]!)).toMatch(/kaynak evraktaki sayıyı kilitlersin/u);

    const pool = Object.fromEntries(OFFICE_AI_EXAM_QUESTIONS.map((row) => [row.id, row]));
    expect(citizenExamSurface(pool.q_off_10!)).toMatch(/ne yaparsın/u);
    expect(citizenExamSurface(pool.q_off_10!)).toMatch(/kilitlersin/u);
    expect(citizenExamSurface(pool.q_off_10!)).toMatch(/kaynak hücreden/u);
    expect(citizenExamSurface(pool.q_off_11!)).toMatch(/ilk neyi kilitlersin/u);
    expect(citizenExamSurface(pool.q_off_11!)).toMatch(/kilitlersin/u);
    expect(citizenExamSurface(pool.q_off_11!)).not.toMatch(/rastgelelik/iu);
    expect(citizenExamSurface(pool.q_off_15!)).toMatch(/Cari satırları/u);
    expect(citizenExamSurface(pool.q_off_15!)).toMatch(/ne yaparsın/u);
    expect(citizenExamSurface(pool.q_off_15!)).toMatch(/Excel TOPLA/u);
    expect(citizenExamSurface(pool.q_off_15!)).not.toMatch(/e-tablo|rastgelelik|Bölge satır/u);
    expect(citizenExamSurface(pool.q_off_25!)).toMatch(/neden insan gözüyle kilitlersin/u);
    expect(citizenExamSurface(pool.q_off_25!)).toMatch(/Kaynak evraktan insan gözüyle/u);
    expect(citizenExamSurface(pool.q_off_25!)).toMatch(/sabitlersin/u);
  });

  it("Ders 5 compact makale vatandaş lisanı taşır (istem / uydurma / Hata dedektifi)", () => {
    const fifth = officeAiSections[4];
    expect(fifth?.lessonKey).toBe("01_office_ai-5");
    const blob = `${fifth!.contentMarkdown}\n${fifth!.pedagogicalObjective}`;
    expect(blob).toMatch(/açık istem/u);
    expect(blob).toMatch(/denetim istemi/u);
    expect(blob).toMatch(/İsteminde bu farkı/u);
    expect(blob).toMatch(/dedektife çevirirsin/u);
    expect(blob).toMatch(/İkinci satır Demir Lojistik 17\.300/u);
    expect(blob).toMatch(/uydurma \(teknik adıyla halüsinasyon\)/u);
    expect(blob).toMatch(/yapay zekâ çıktısına/iu);
    expect(blob).toMatch(/Örnek sayılar|kendi tablondaki sayıyı koy|TOPLA formülü/u);
    expect(blob).not.toMatch(/\bkomut/u);
    expect(blob).not.toMatch(/direktif/u);
    expect(blob).not.toMatch(/söyleyeceğiz/u);
    expect(blob).not.toMatch(/çevireceğiz|getireceğiz/u);
    expect(blob).not.toMatch(/yönetici özeti/u);
    expect(blob).not.toMatch(/kontrol uzmanına/u);
    expect(blob).not.toMatch(/Üçüncü satır Demir Lojistik/u);
    expect(blob).not.toMatch(/doğrulat|kilitlesin/u);
  });

  it("Ders 6 mini sınav ve havuz soruları SEN dili, yapay zekâ ve üç etiket taşır", () => {
    const lessonSix = loadAcademyLessonExam("01_office_ai-4");
    expect(lessonSix).toBeTruthy();
    for (const question of lessonSix!.questions) {
      const surface = citizenExamSurface(question);
      expect(surface, question.id).not.toMatch(/\bAI\b/u);
      expect(surface, question.id).not.toMatch(/yer almakta|atılması gereken|çıkart/u);
      expect(surface, question.id).not.toMatch(/Düşük Öncelik|manuel|operasyon yöneticisi/u);
    }
    expect(citizenExamSurface(lessonSix!.questions[0]!)).toMatch(/İlk ne yaparsın/u);
    expect(citizenExamSurface(lessonSix!.questions[0]!)).toMatch(/Arşivlik/u);
    expect(citizenExamSurface(lessonSix!.questions[0]!)).toMatch(/ham kutuyu aynen sohbete yapıştırırsın/u);
    expect(citizenExamSurface(lessonSix!.questions[1]!)).toMatch(/Taslağı nasıl istersin/u);
    expect(citizenExamSurface(lessonSix!.questions[1]!)).toMatch(/Tarih ve tutarı verip taslak istersin/u);
    expect(citizenExamSurface(lessonSix!.questions[2]!)).toMatch(/neden arşive alırsın/u);
    expect(citizenExamSurface(lessonSix!.questions[2]!)).toMatch(/eski yazışma aramada durur/u);
    const miniBlob = lessonSix!.questions.map((question) => citizenExamSurface(question)).join("\n");
    expect(miniBlob.match(/Arşivlik/gu)?.length).toBeGreaterThanOrEqual(3);

    const pool = Object.fromEntries(OFFICE_AI_EXAM_QUESTIONS.map((row) => [row.id, row]));
    expect(citizenExamSurface(pool.q_off_7!)).toMatch(/ne yaparsın/u);
    expect(citizenExamSurface(pool.q_off_7!)).toMatch(/ayırırsın/u);
    expect(citizenExamSurface(pool.q_off_7!)).toMatch(/taslak istersin/u);
    expect(citizenExamSurface(pool.q_off_7!)).not.toMatch(/ayırtmak|hazırlatmak/u);
    expect(citizenExamSurface(pool.q_off_14!)).toMatch(/hangi sırayla kapatırsın/u);
    expect(citizenExamSurface(pool.q_off_21!)).toMatch(/sıralarken/u);
    expect(citizenExamSurface(pool.q_off_21!)).toMatch(/Aksiyon/u);
    expect(citizenExamSurface(pool.q_off_21!)).toMatch(/Arşivlik/u);
    expect(citizenExamSurface(pool.q_off_21!)).not.toMatch(/kova|önceliklendir|bu hafta|bilgi amaçlı/u);
    expect(citizenExamSurface(pool.q_off_22!)).toMatch(/ne yaparsın/u);
    expect(citizenExamSurface(pool.q_off_22!)).toMatch(/Tarih ve tutarı/u);
    expect(citizenExamSurface(pool.q_off_22!)).toMatch(/onaylarsın/u);
    expect(citizenExamSurface(pool.q_off_22!)).not.toMatch(/parametre|aldırmak/iu);
    expect(citizenExamSurface(pool.q_off_12!)).toMatch(/nasıl bölersin/u);
    expect(citizenExamSurface(pool.q_off_17!)).toMatch(/ne işe yarar/u);
    expect(citizenExamSurface(pool.q_off_17!)).toMatch(/takvime yazdığın/u);
    expect(citizenExamSurface(pool.q_off_17!)).not.toMatch(/Sınavı Cuma 30 kapanış/u);
    expect(citizenExamSurface(pool.q_off_27!)).toMatch(/hangi kutuda hangisidir/u);
    expect(citizenExamSurface(pool.q_off_27!)).toMatch(/PowerPoint Copilot/u);
  });

  it("Ders 6 compact makale vatandaş lisanı taşır (istem / gelen kutusu / KUTU KAOSU)", () => {
    const sixth = officeAiSections[5];
    expect(sixth?.lessonKey).toBe("01_office_ai-4");
    const blob = `${sixth!.contentMarkdown}\n${sixth!.pedagogicalObjective}`;
    expect(blob).toMatch(/istemi panele nasıl yazacağını/u);
    expect(blob).toMatch(/e-posta triyajı/u);
    expect(blob).toMatch(/gelen kutusu/u);
    expect(blob).toMatch(/KUTU KAOSU/u);
    expect(blob).toMatch(/bir sonraki derste/u);
    expect(blob).toMatch(/sıfır kutu/u);
    expect(blob).not.toMatch(/\bkomut/u);
    expect(blob).not.toMatch(/yapıştıracağını/u);
    expect(blob).not.toMatch(/G1 dersinde/u);
    expect(blob).not.toMatch(/INBOX/u);
    expect(blob).not.toMatch(/sıfır yapı|sıfır bildirim/u);
    expect(blob).not.toMatch(/mail triyajı/u);
    expect(blob).not.toMatch(/üslubunla/u);
  });

  it("Teknik Ders 6 compact makale karar cümlesi ve FARK başlığı taşır", () => {
    const friday = officeAiSections[8];
    expect(friday?.lessonKey).toBe("01_office_ai-6");
    const blob = `${friday!.contentMarkdown}\n${friday!.pedagogicalObjective}`;
    expect(blob).toMatch(/karar cümlesi/u);
    expect(blob).toMatch(/## FARK ORTADA/u);
    expect(blob).not.toMatch(/eylem cümlesi/u);
    expect(blob).toMatch(/bağlayacaksın/u);
    expect(blob).not.toMatch(/bağlayacağız/u);
    expect(blob).toMatch(/yan sayfada/u);
    expect(blob).not.toMatch(/yeni sayfa/u);
    expect(blob).toMatch(/Üç Kapı yığılırsa/u);
    expect(blob).toMatch(/satın alma kartı basmaz/u);
  });

  it("Ders 9 mini sınav SEN dili, Tabloyu ve dış sohbet taşır", () => {
    const lessonFriday = loadAcademyLessonExam("01_office_ai-6");
    expect(lessonFriday).toBeTruthy();
    for (const question of lessonFriday!.questions) {
      const surface = citizenExamSurface(question);
      expect(surface, question.id).not.toMatch(/hangisidir|Hangisi/u);
      expect(surface, question.id).not.toMatch(/harici/u);
      expect(surface, question.id).not.toMatch(/\bDosyayı\b/u);
      expect(surface, question.id).not.toMatch(/düğmeden/u);
    }
    expect(citizenExamSurface(lessonFriday!.questions[0]!)).toMatch(/nasıl verirsin/u);
    expect(citizenExamSurface(lessonFriday!.questions[0]!)).toMatch(/Tabloyu ataş ile yüklemek/u);
    expect(citizenExamSurface(lessonFriday!.questions[0]!)).toMatch(/dış sohbete/u);
    expect(citizenExamSurface(lessonFriday!.questions[0]!)).toMatch(/şeritten okutmak/u);
    expect(citizenExamSurface(lessonFriday!.questions[1]!)).toMatch(/nasıl bölersin/u);
    expect(citizenExamSurface(lessonFriday!.questions[1]!)).toMatch(/10 dakika kutu/u);
    expect(citizenExamSurface(lessonFriday!.questions[2]!)).toMatch(/3\. Kapı açılırsa ne yaparsın/u);
    expect(citizenExamSurface(lessonFriday!.questions[2]!)).toMatch(/maskelenmiş kısa özet yazmak/u);

    const pool = Object.fromEntries(OFFICE_AI_EXAM_QUESTIONS.map((row) => [row.id, row]));
    expect(citizenExamSurface(pool.q_off_12!)).toMatch(/nasıl bölersin/u);
    expect(citizenExamSurface(pool.q_off_17!)).toMatch(/ne işe yarar/u);
    expect(citizenExamSurface(pool.q_off_17!)).toMatch(/takvime yazdığın/u);
  });

  it("Ders 7 mini sınav ve havuz soruları SEN dili, ileti ve sıra taşır", () => {
    const lessonSeven = loadAcademyLessonExam("01_office_ai-g1");
    expect(lessonSeven).toBeTruthy();
    for (const question of lessonSeven!.questions) {
      const surface = citizenExamSurface(question);
      expect(surface, question.id).not.toMatch(/hiyerarşi|hangisidir|harici/u);
      expect(surface, question.id).not.toMatch(/\bmail/iu);
      expect(surface, question.id).not.toMatch(/\bkomut/u);
      expect(surface, question.id).not.toMatch(/PDF'e|basarsın|basıp/u);
      expect(surface, question.id).not.toMatch(/yapıştırmak|yüklemek|taramak|vermek/u);
    }
    expect(citizenExamSurface(lessonSeven!.questions[0]!)).toMatch(/nasıl süzersin/u);
    expect(citizenExamSurface(lessonSeven!.questions[0]!)).toMatch(/yazarsın/u);
    expect(citizenExamSurface(lessonSeven!.questions[0]!)).toMatch(/tararsın/u);
    expect(citizenExamSurface(lessonSeven!.questions[1]!)).toMatch(/nasıl kilitlersin/u);
    expect(citizenExamSurface(lessonSeven!.questions[1]!)).toMatch(/istemi nasıl yazarsın/u);
    expect(citizenExamSurface(lessonSeven!.questions[2]!)).toMatch(/hangi yolu seçmezsin/u);
    expect(citizenExamSurface(lessonSeven!.questions[2]!)).toMatch(/İletiyi kopyalayıp/u);

    const pool = Object.fromEntries(OFFICE_AI_EXAM_QUESTIONS.map((row) => [row.id, row]));
    expect(citizenExamSurface(pool.q_off_31!)).toMatch(/nasıl süzersin/u);
    expect(citizenExamSurface(pool.q_off_31!)).toMatch(/Yerleşik Gemini paneline/u);
    expect(citizenExamSurface(pool.q_off_31!)).not.toMatch(/hiyerarşi|harici|PDF'e|Maili/u);
    expect(citizenExamSurface(pool.q_off_32!)).toMatch(/atlanmış kapı sayarsın/u);
    expect(citizenExamSurface(pool.q_off_32!)).toMatch(/şeritten okutursun/u);
    expect(citizenExamSurface(pool.q_off_32!)).not.toMatch(/hiyerarşi|hangisidir/u);
    expect(citizenExamSurface(pool.q_off_34!)).toMatch(/son çarede ne yaparsın/u);
    expect(citizenExamSurface(pool.q_off_34!)).toMatch(/maskelenmiş kısa özet yapıştırırsın/u);
    expect(citizenExamSurface(pool.q_off_34!)).toMatch(/Ham dekontları/u);
    expect(citizenExamSurface(pool.q_off_34!)).not.toMatch(/hangisidir|bilanço|yapıştırmak/u);
    expect(lessonSeven!.questions[0]!.prompt).not.toBe(pool.q_off_31!.prompt);
    expect(lessonSeven!.questions[2]!.prompt).not.toBe(pool.q_off_32!.prompt);
  });

  it("Ders 7 compact makale vatandaş lisanı taşır (istem / ileti / panel)", () => {
    const seventh = officeAiSections[6];
    expect(seventh?.lessonKey).toBe("01_office_ai-g1");
    const blob = `${seventh!.contentMarkdown}\n${seventh!.pedagogicalObjective}`;
    expect(blob).toMatch(/İstem kutusunda duran istem/u);
    expect(blob).toMatch(/iletiyi ChatGPT/u);
    expect(blob).toMatch(/Gemini panelini aç/u);
    expect(blob).toMatch(/kopyalıyorsun/u);
    expect(blob).toMatch(/yazıyorsun/u);
    expect(blob).toMatch(/göreceksin/u);
    expect(blob).toMatch(/dürüstçe yazar/u);
    expect(blob).toMatch(/yerleşik Gemini paneli/u);
    expect(blob).not.toMatch(/\bkomut/u);
    expect(blob).not.toMatch(/\bmail/iu);
    expect(blob).not.toMatch(/eklenti|özetdir|entegrasyonu/u);
    expect(blob).not.toMatch(/kopyalıyoruz|yazıyoruz|bölelim|göreceğiz/u);
    expect(blob).not.toMatch(/@Gmail/u);
    expect(blob).not.toMatch(/hamal/u);
  });

  it("Ders 8 mini sınav ve havuz soruları SEN dili, ataş ve üç iş taşır", () => {
    const lessonEight = loadAcademyLessonExam("01_office_ai-w1");
    expect(lessonEight).toBeTruthy();
    for (const question of lessonEight!.questions) {
      const surface = citizenExamSurface(question);
      expect(surface, question.id).not.toMatch(/hangisidir|Hangisi/u);
      expect(surface, question.id).not.toMatch(/inceletmek|basmak|imzalatmak/u);
      expect(surface, question.id).not.toMatch(/yapay zeka\b/u);
      expect(surface, question.id).not.toMatch(/yapıştırmak|yüklemek|bırakmak|silmek|kopyalamak|birleştirmek/u);
    }
    expect(citizenExamSurface(lessonEight!.questions[0]!)).toMatch(/4\. sayfada/u);
    expect(citizenExamSurface(lessonEight!.questions[0]!)).toMatch(/yüklersin/u);
    expect(citizenExamSurface(lessonEight!.questions[0]!)).toMatch(/taşırsın/u);
    expect(citizenExamSurface(lessonEight!.questions[1]!)).toMatch(/Ne yaparsın/u);
    expect(citizenExamSurface(lessonEight!.questions[1]!)).toMatch(/sen yazarsın/u);
    expect(citizenExamSurface(lessonEight!.questions[2]!)).toMatch(/ne yaparsın/u);
    expect(citizenExamSurface(lessonEight!.questions[2]!)).toMatch(/onay ister/u);
    expect(citizenExamSurface(lessonEight!.questions[2]!)).toMatch(/imzayı sen atarsın/u);

    const pool = Object.fromEntries(OFFICE_AI_EXAM_QUESTIONS.map((row) => [row.id, row]));
    expect(citizenExamSurface(pool.q_off_5!)).toMatch(/ne yaparsın/u);
    expect(citizenExamSurface(pool.q_off_5!)).toMatch(/istersin/u);
    expect(citizenExamSurface(pool.q_off_5!)).not.toMatch(/ettirirken|hangisidir|talep etmek/u);
    expect(citizenExamSurface(pool.q_off_28!)).toMatch(/neden sen yazarsın/u);
    expect(citizenExamSurface(pool.q_off_28!)).toMatch(/sendedir/u);
    expect(citizenExamSurface(pool.q_off_28!)).not.toMatch(/hangisidir|Hangisi/u);
    expect(citizenExamSurface(pool.q_off_33!)).toMatch(/nasıl incelersin/u);
    expect(citizenExamSurface(pool.q_off_33!)).toMatch(/bütününü incelersin/u);
    expect(citizenExamSurface(pool.q_off_33!)).toMatch(/taşırsın/u);
    expect(citizenExamSurface(pool.q_off_33!)).not.toMatch(/hangisidir|inceletmek|basmak/u);
    expect(citizenExamSurface(pool.q_off_35!)).toMatch(/ayrı ayrı mı/u);
    expect(citizenExamSurface(pool.q_off_35!)).toMatch(/sorarsın/u);
    expect(citizenExamSurface(pool.q_off_35!)).not.toMatch(/hangisidir|karıştırmak/u);
    expect(lessonEight!.questions[0]!.prompt).not.toBe(pool.q_off_33!.prompt);
    expect(lessonEight!.questions[0]!.choices.join("\n")).not.toBe(pool.q_off_33!.choices.join("\n"));
    expect(lessonEight!.questions[1]!.prompt).not.toBe(pool.q_off_28!.prompt);
    expect(lessonEight!.questions[1]!.choices.join("\n")).not.toBe(pool.q_off_28!.choices.join("\n"));
  });

  it("Ders 8 compact makale vatandaş lisanı taşır (istem / belge / yazıyorsun)", () => {
    const eighth = officeAiSections[7];
    expect(eighth?.lessonKey).toBe("01_office_ai-w1");
    const blob = `${eighth!.contentMarkdown}\n${eighth!.pedagogicalObjective}`;
    expect(blob).toMatch(/Word ve uzun belge incelemesi/u);
    expect(blob).toMatch(/belirli bir paragraf/u);
    expect(blob).toMatch(/yazıyorsun/u);
    expect(blob).toMatch(/Dosya adını pratikte kendi dosyanla değiştir/u);
    expect(blob).toMatch(/İstem dosyanın bütününe gider/u);
    expect(blob).toMatch(/Gemini yoksa aynı dosyayı ChatGPT veya Claude'a yüklersin/u);
    expect(blob).toMatch(/Örnek oran|kendi oranını dosyandan oku|Gizlilik sayfa on sekizdedir/u);
    expect(blob).not.toMatch(/\bkomut/u);
    expect(blob).not.toMatch(/doküman/iu);
    expect(blob).not.toMatch(/spesifik/iu);
    expect(blob).not.toMatch(/yazıyoruz|bölelim/u);
    expect(blob).not.toMatch(/yönetici özeti/u);
    expect(blob).not.toMatch(/Dosya adı pratikte yanar/u);
    expect(blob).not.toMatch(/mercek altına/u);
  });
});
