/** İstemciye giden etkinlik. Anahtar ve kabul edilen yazılış bu dosyada durmaz. */

export type JuniorActivityMatchPublic = {
  id: string;
  kind: "match";
  prompt: string;
  left: { id: string; label: string }[];
  right: { id: string; label: string }[];
};

export type JuniorActivityClozeGapPublic = {
  id: string;
  before: string;
  after: string;
};

export type JuniorActivityClozePublic = {
  id: string;
  kind: "cloze";
  prompt: string;
  before: string;
  after: string;
  /** Çoklu boşluk doldurma cümleleri (örn. `jr_06_mat-5`). */
  gaps?: JuniorActivityClozeGapPublic[];
  /** Tıklanabilir / sürüklenebilir kelime bankası ipuçları. */
  wordBank?: string[];
};

export type JuniorActivityRocketPublic = {
  id: string;
  label: string;
  ruleHint: string;
};

export type JuniorActivityPuzzlePublic = {
  title: string;
  prompt: string;
  rockets: JuniorActivityRocketPublic[];
};

export type JuniorActivityOrderPublic = {
  id: string;
  kind: "order";
  prompt: string;
  /** Ekranda görünen sıra veya dedektif sayı kartları. Doğru sıra bu dizide durmaz. */
  tiles: { id: string; label: string }[];
  /** Dedektif roket sınıflandırma bulmacası (örn. `jr_06_mat-5`). */
  puzzle?: JuniorActivityPuzzlePublic;
};

export type JuniorActivityPublic =
  | JuniorActivityMatchPublic
  | JuniorActivityClozePublic
  | JuniorActivityOrderPublic;
