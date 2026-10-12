/** İstemciye giden etkinlik. Anahtar ve kabul edilen yazılış bu dosyada durmaz. */

export type JuniorActivityMatchPublic = {
  id: string;
  kind: "match";
  prompt: string;
  left: { id: string; label: string }[];
  right: { id: string; label: string }[];
};

export type JuniorActivityClozePublic = {
  id: string;
  kind: "cloze";
  prompt: string;
  before: string;
  after: string;
};

export type JuniorActivityOrderPublic = {
  id: string;
  kind: "order";
  prompt: string;
  /** Ekranda görünen sıra. Doğru sıra bu dizide durmaz. */
  tiles: { id: string; label: string }[];
};

export type JuniorActivityPublic = JuniorActivityMatchPublic | JuniorActivityClozePublic | JuniorActivityOrderPublic;
