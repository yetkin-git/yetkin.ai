import fs from "node:fs";

let t = fs.readFileSync("lib/academy/lesson-body.ts", "utf8");
if (t.includes("cleanAcademySpokenTextForTts")) {
  console.log("body already patched");
} else {
  const cleanFn = `/** TTS gümrüğü — sistem/prompt/sahne talimatlarını konuşulan metinden siler. */
export function cleanAcademySpokenTextForTts(text: string): string {
  let out = text.replace(/\\r\\n/g, "\\n");
  out = out.replace(/【[^】]*】/gu, " ");
  out = out.replace(/\\[[^\\]]*(?:sistem|system|prompt|tts|geliştirici|developer|internal|TODO|FIXME|yönerge|talimat)[^\\]]*\\]/giu, " ");
  out = out.replace(/\\b[\\p{L}'’]+\\s+yerine\\s+[\\p{L}'’\\s]+?\\s+(?:de|söyle|oku|hitap\\s+et|seslen)\\b[.!]*/giu, " ");
  out = out.replace(/\\(([^)]*)\\)/gu, (full, inner) => {
    const folded = String(inner).toLocaleLowerCase("tr-TR");
    if (
      /\\b(?:yerine|hitap|seslen|söyle|tts|prompt|sistem|geliştirici|talimat|yönerge|instruction|developer|internal|todo|fix)\\b/u.test(folded) ||
      /^(?:not|nb|dikkat|önemli|sistem|prompt|tts)\\b/u.test(folded.trim()) ||
      /\\b(?:yavaş|hızlı|yavaşça|nefes|durakla|pause|slow|fast)\\s+(?:oku|konuş|seslendir)/u.test(folded) ||
      /\\bde\\b.*\\b(?:hanım|bey)\\b|\\b(?:hanım|bey)\\b.*\\bde\\b/u.test(folded)
    ) {
      return " ";
    }
    return full;
  });
  out = out.replace(/<\\/?[A-Za-z][^>]*>/gu, " ");
  out = out.replace(/^\\s*(?:Sistem|Prompt|TTS|Geliştirici|Developer)\\s*:[^\\n]*/gimu, " ");
  return out.replace(/\\s+/gu, " ").trim();
}

`;

  t = t.replace(
    "export function spokenAcademyLessonSegment",
    `${cleanFn}export function spokenAcademyLessonSegment`,
  );

  t = t.replace(
    /export function spokenAcademyLessonSegment\(segment: AcademyLessonSegment\): string \{[\s\S]*?\r?\n\}/,
    `export function spokenAcademyLessonSegment(segment: AcademyLessonSegment): string {
  if (segment.kind === "text") {
    const parsed = parseAcademyLessonActText(segment.text);
    if (parsed.act) {
      const bridge = spokenAcademyLessonActBridge(parsed.act, parsed.body);
      const collapsed = parsed.body.replace(/\\s+/gu, " ").trim();
      const dialogue = splitAcademyStudioDialogue(collapsed);
      if (dialogue) {
        if (parsed.act === "giris") {
          return cleanAcademySpokenTextForTts(
            \`\${dialogue.moderator} \${bridge} \${dialogue.instructor}\`,
          );
        }
        return cleanAcademySpokenTextForTts(
          \`\${bridge} \${dialogue.moderator} \${dialogue.instructor}\`,
        );
      }
      if (isAcademyModeratorProse(collapsed) && !isAcademyInstructorStudioReplyProse(collapsed)) {
        return cleanAcademySpokenTextForTts(collapsed);
      }
      return cleanAcademySpokenTextForTts(\`\${bridge} \${parsed.body}\`);
    }
    return cleanAcademySpokenTextForTts(segment.text);
  }
  if (segment.kind === "steps") {
    const items = segment.items.map((item, index) => \`\${index + 1}. \${item}\`).join(" ");
    return cleanAcademySpokenTextForTts(\`\${ACADEMY_LESSON_SPOKEN_STEP_LEAD} \${items}\`);
  }
  if (segment.kind === "params") {
    const rows = segment.rows.map((row) => \`\${row.label}: \${row.value}.\`).join(" ");
    return cleanAcademySpokenTextForTts(\`\${ACADEMY_LESSON_SPOKEN_PARAM_LEAD} \${rows}\`);
  }
  return "";
}`,
  );

  t = t.replace(
    /export function spokenAcademyLessonBody\(body: string\): string \{[\s\S]*?\r?\n\}/,
    `export function spokenAcademyLessonBody(body: string): string {
  const parts: string[] = [];
  for (const chunk of splitAcademyLessonChunks(body)) {
    const spoken = spokenAcademyLessonSegment(classifyAcademyLessonChunk(chunk));
    if (spoken) {
      parts.push(spoken);
    }
  }
  return cleanAcademySpokenTextForTts(parts.join(" "));
}`,
  );

  fs.writeFileSync("lib/academy/lesson-body.ts", t);
  console.log("patched body", (t.match(/cleanAcademySpokenTextForTts/g) || []).length);
}
