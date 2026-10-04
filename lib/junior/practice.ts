import "server-only";

import type { JuniorPracticeAnswer, JuniorPracticeItem } from "@/lib/junior/types";

type ChoiceKey = {
  id: string;
  kind: "choice";
  prompt: string;
  choices: readonly string[];
  correctIndex: number;
  explanation: string;
};

type MatchKey = {
  id: string;
  kind: "match";
  prompt: string;
  left: readonly { id: string; label: string }[];
  right: readonly { id: string; label: string }[];
  pairs: Readonly<Record<string, string>>;
  explanation: string;
};

type PracticeKey = ChoiceKey | MatchKey;

const PRACTICE_BY_LESSON: Readonly<Record<string, readonly PracticeKey[]>> = {
  "jr_06_mat-1": [
    {
      id: "payda-ne",
      kind: "choice",
      prompt: "Payda neyi söyler?",
      choices: [
        "Bütünün kaç eşit parçaya bölündüğünü",
        "Kaç parça alındığını",
        "Parçaların eşit olmadığını",
      ],
      correctIndex: 0,
      explanation: "Payda, bütünün kaç eşit parçaya bölündüğünü söyler.",
    },
    {
      id: "pay-nerede",
      kind: "choice",
      prompt: "Pay kesrin neresindedir?",
      choices: ["Üstte", "Altta", "Ortada"],
      correctIndex: 0,
      explanation: "Pay üstteki sayıdır. Payda altta durur.",
    },
    {
      id: "esle",
      kind: "match",
      prompt: "Soldaki kesri sağdaki sözle eşleştir.",
      left: [
        { id: "l-yarim", label: "1/2" },
        { id: "l-ceyrek", label: "1/4" },
        { id: "l-ucte", label: "1/3" },
      ],
      right: [
        { id: "r-ucte", label: "Üçte bir" },
        { id: "r-yarim", label: "Yarım" },
        { id: "r-ceyrek", label: "Çeyrek" },
      ],
      pairs: {
        "l-yarim": "r-yarim",
        "l-ceyrek": "r-ceyrek",
        "l-ucte": "r-ucte",
      },
      explanation: "1/2 yarımdır. 1/4 çeyrektir. 1/3 üçte birdir.",
    },
  ],
  "jr_06_fen-1": [
    {
      id: "kuvvet-ne",
      kind: "choice",
      prompt: "Kuvvet nedir?",
      choices: ["Bir cismi iten veya çeken etki", "Cismin rengi", "Cismin ağırlık sayısı"],
      correctIndex: 0,
      explanation: "Kuvvet, bir cismi iten veya çeken etkidir.",
    },
    {
      id: "yon-var",
      kind: "choice",
      prompt: "İtmek ve çekmek için doğru olan hangisidir?",
      choices: ["İkisi de kuvvettir ve yönleri terstir", "Yalnız itmek kuvvettir", "Kuvvetin yönü yoktur"],
      correctIndex: 0,
      explanation: "İtmek ve çekmek kuvvettir. Yönleri terstir.",
    },
    {
      id: "esle",
      kind: "match",
      prompt: "Soldaki işi sağdaki kuvvet sözüyle eşleştir.",
      left: [
        { id: "l-kapi", label: "Kapıyı itmek" },
        { id: "l-cekmece", label: "Çekmeceyi çekmek" },
        { id: "l-durmak", label: "Durmakta olan cisim" },
      ],
      right: [
        { id: "r-hareket", label: "Kuvvet uygulanınca hareket edebilir" },
        { id: "r-itme", label: "İtme kuvveti" },
        { id: "r-cekme", label: "Çekme kuvveti" },
      ],
      pairs: {
        "l-kapi": "r-itme",
        "l-cekmece": "r-cekme",
        "l-durmak": "r-hareket",
      },
      explanation: "İtmek ve çekmek kuvvettir. Duran cisim, kuvvetle hareket edebilir.",
    },
  ],
  "jr_06_turkce-1": [
    {
      id: "ana-fikir",
      kind: "choice",
      prompt: "Ana fikir nedir?",
      choices: [
        "Yazarın okura asıl söylemek istediği",
        "Metindeki ilk sayı",
        "Metindeki bütün örnekler",
      ],
      correctIndex: 0,
      explanation: "Ana fikir, yazarın asıl söylemek istediğidir.",
    },
    {
      id: "ayrinti",
      kind: "choice",
      prompt: "Ayrıntı ne işe yarar?",
      choices: ["Ana fikri destekler", "Ana fikrin yerine geçer", "Metni siler"],
      correctIndex: 0,
      explanation: "Ayrıntı ana fikri destekler. Ana fikrin kendisi değildir.",
    },
    {
      id: "esle",
      kind: "match",
      prompt: "Soldaki sözü sağdaki işle eşleştir.",
      left: [
        { id: "l-ana", label: "Ana fikir" },
        { id: "l-cumle", label: "Tek cümle" },
        { id: "l-ornek", label: "Örnek ve sayı" },
      ],
      right: [
        { id: "r-ayrinti", label: "Ayrıntıdır" },
        { id: "r-asil", label: "Yazarın asıl sözüdür" },
        { id: "r-kisaca", label: "Ana fikir çoğu kez böyle söylenir" },
      ],
      pairs: {
        "l-ana": "r-asil",
        "l-cumle": "r-kisaca",
        "l-ornek": "r-ayrinti",
      },
      explanation: "Ana fikir asıl sözdür. Örnek ayrıntıdır.",
    },
  ],
};

export function publicJuniorPractice(lessonKey: string): JuniorPracticeItem[] {
  const rows = PRACTICE_BY_LESSON[lessonKey] ?? [];
  return rows.map((row) => {
    if (row.kind === "choice") {
      return {
        id: row.id,
        kind: "choice",
        prompt: row.prompt,
        choices: [...row.choices],
      };
    }
    return {
      id: row.id,
      kind: "match",
      prompt: row.prompt,
      left: row.left.map((item) => ({ ...item })),
      right: row.right.map((item) => ({ ...item })),
    };
  });
}

export type JuniorPracticeGrade = {
  score: number;
  correct: number;
  total: number;
  notes: { id: string; ok: boolean; explanation: string }[];
};

export function gradeJuniorPractice(
  lessonKey: string,
  answers: readonly JuniorPracticeAnswer[],
): JuniorPracticeGrade | null {
  const keys = PRACTICE_BY_LESSON[lessonKey];
  if (!keys || keys.length === 0) {
    return null;
  }
  const byId = new Map(answers.map((answer) => [answer.id, answer]));
  const notes = keys.map((key) => {
    const answer = byId.get(key.id);
    const ok = answer ? answerMatches(key, answer) : false;
    return { id: key.id, ok, explanation: key.explanation };
  });
  const correct = notes.filter((note) => note.ok).length;
  const score = Math.round((correct / keys.length) * 100);
  return { score, correct, total: keys.length, notes };
}

function answerMatches(key: PracticeKey, answer: JuniorPracticeAnswer): boolean {
  if (key.kind === "choice") {
    return answer.choiceIndex === key.correctIndex;
  }
  const matches = answer.matches ?? {};
  const leftIds = Object.keys(key.pairs);
  return leftIds.every((leftId) => matches[leftId] === key.pairs[leftId]);
}
