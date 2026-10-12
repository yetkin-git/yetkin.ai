/**
 * Yıldız panelinin mikro sorusu.
 * Jenerik zamir («bunu», «bu parçayı») çocuk yüzüne çıkmaz.
 * Senaryodaki echoPrompt özgünse o okunur; değilse dersin voiceSeal cümlesi.
 */

export type JuniorMicroQuestionSource = {
  title: string;
  voiceSeal: string;
  echoPrompt?: string;
};

function clean(text: string | undefined): string {
  return (text ?? "").replace(/\s+/g, " ").trim();
}

function folded(text: string): string {
  return text.toLocaleLowerCase("tr-TR");
}

/** Panelde durmaması gereken zamir kalıpları. */
export function juniorMicroQuestionIsGeneric(text: string): boolean {
  const line = folded(clean(text));
  if (!line) {
    return true;
  }
  return (
    line.includes("bu parçayı kendi cümlenle söyle") ||
    line.includes("bunu kendi cümlenle tek bir cümleyle söyle") ||
    line.includes("bunu kendi cümlenle söyle")
  );
}

function withStop(text: string): string {
  if (/[.!?…]$/u.test(text)) {
    return text;
  }
  return `${text}.`;
}

export function juniorMicroQuestion(source: JuniorMicroQuestionSource): string {
  const echo = clean(source.echoPrompt);
  if (echo && !juniorMicroQuestionIsGeneric(echo)) {
    return withStop(echo);
  }
  const seal = clean(source.voiceSeal);
  if (seal && !juniorMicroQuestionIsGeneric(seal)) {
    return withStop(seal);
  }
  const title = clean(source.title);
  if (!title) {
    return "";
  }
  return withStop(`${title} konusunu kendi cümlelerinle anlat`);
}
