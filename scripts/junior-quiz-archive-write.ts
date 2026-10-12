/**
 * Beş Junior quiz üreticisinin ortak yazıcısı.
 * Paket içeriği üreticidedir. Canlı klasöre yazmak `junior-quiz-live-guard` ister.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { JUNIOR_SEALED_ROSTER } from "../packages/junior-content/src/sealed-roster";
import { assertJuniorQuizTargetWritable } from "./junior-quiz-live-guard";

export type JuniorQuizArchiveQuestion = {
  id: string;
  level: "concept" | "apply" | "skill";
  question: string;
  options: [string, string, string, string];
  correctAnswerIndex: 0 | 1 | 2 | 3;
  hint: string;
  explanation: string;
};

export type JuniorQuizArchivePack = {
  n: number;
  title: string;
  tellGuides: [string, string] | [string, string, string];
  questions: [JuniorQuizArchiveQuestion, JuniorQuizArchiveQuestion, JuniorQuizArchiveQuestion];
};

function renderPack(
  pack: JuniorQuizArchivePack,
  input: { lessonKeyPrefix: string; constPrefix: string; packComment: string },
): string {
  const guides = pack.tellGuides.map((guide) => `    ${JSON.stringify(guide)},`).join("\n");
  const questions = pack.questions
    .map((question) => {
      const options = question.options.map((option) => `      ${JSON.stringify(option)},`).join("\n");
      return `    {
      id: ${JSON.stringify(question.id)},
      level: ${JSON.stringify(question.level)},
      question: ${JSON.stringify(question.question)},
      options: [
${options}
      ],
      correctAnswerIndex: ${question.correctAnswerIndex},
      hint: ${JSON.stringify(question.hint)},
      explanation: ${JSON.stringify(question.explanation)},
    },`;
    })
    .join("\n");

  return `import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** ${input.packComment} */
export const ${input.constPrefix}_${pack.n} = {
  lessonKey: "${input.lessonKeyPrefix}-${pack.n}",
  title: ${JSON.stringify(pack.title)},
  tellGuides: [
${guides}
  ],
  questions: [
${questions}
  ],
} as const satisfies JuniorLessonQuizPack;
`;
}

function assertPacksCannotReviveRetiredLessons(
  folder: string,
  packs: readonly JuniorQuizArchivePack[],
): void {
  const course = JUNIOR_SEALED_ROSTER.find((row) => row.quizDir === folder);
  if (!course) {
    throw new Error(`Quiz üretici klasörü kadroda yok: ${folder}`);
  }
  const allowed = new Set(course.numbers);
  const illegal = packs.map((pack) => pack.n).filter((n) => !allowed.has(n));
  if (illegal.length > 0) {
    throw new Error(
      `Quiz üretici kadro dışı numara yazamaz (${folder}: ${illegal.join(", ")}). Silinmiş ders dirilmez.`,
    );
  }
  const indexPath = join(process.cwd(), "lib", "junior", "quiz", folder, "index.ts");
  if (existsSync(indexPath) && readFileSync(indexPath, "utf8").includes("juniorSealedQuizPacks")) {
    throw new Error(
      `Quiz üretici ${folder}/index.ts adaptörünü ezemez. Canlı dizi content-source kapısındadır.`,
    );
  }
}

export function writeJuniorQuizArchive(input: {
  folder: string;
  lessonKeyPrefix: string;
  constPrefix: string;
  subjectPackComment: (packNumber: number, total: number) => string;
  indexComment: string;
  packs: readonly JuniorQuizArchivePack[];
}): void {
  assertPacksCannotReviveRetiredLessons(input.folder, input.packs);
  const outDir = join(process.cwd(), "lib", "junior", "quiz", input.folder);
  assertJuniorQuizTargetWritable(outDir);
  mkdirSync(outDir, { recursive: true });
  const total = input.packs.length;
  for (const pack of input.packs) {
    const file = join(outDir, `${pack.n}.ts`);
    writeFileSync(
      file,
      renderPack(pack, {
        lessonKeyPrefix: input.lessonKeyPrefix,
        constPrefix: input.constPrefix,
        packComment: input.subjectPackComment(pack.n, total),
      }),
      "utf8",
    );
    console.log("wrote", file);
  }

  const imports = Array.from({ length: total }, (_, index) => {
    const n = index + 1;
    return `import { ${input.constPrefix}_${n} } from "@/lib/junior/quiz/${input.folder}/${n}";`;
  }).join("\n");
  const packList = Array.from({ length: total }, (_, index) => `  ${input.constPrefix}_${index + 1},`).join("\n");
  const exportList = Array.from({ length: total }, (_, index) => `  ${input.constPrefix}_${index + 1},`).join("\n");
  const index = `${imports}
import type { JuniorLessonQuizPack } from "@/lib/junior/quiz/types";

/** ${input.indexComment} */
export const ${input.constPrefix}_PACKS = [
${packList}
] as const satisfies readonly JuniorLessonQuizPack[];

export {
${exportList}
};
`;
  writeFileSync(join(outDir, "index.ts"), index, "utf8");
  console.log("wrote index.ts", total, "packs,", total * 3, "questions");
}
