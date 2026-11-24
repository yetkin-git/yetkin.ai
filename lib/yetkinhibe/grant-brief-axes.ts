/**
 * Proje dosyası uygunluk eksenleri. Kapalı listeler; serbest program adı yoktur.
 * `eligibility_json` içindeki il, kitle, yatırım odağı ve NACE anahtarları bu listeye uymazsa
 * katalog satırı reddedilir. Anahtar yoksa o eksende kısıt yoktur.
 */

export const GRANT_AUDIENCES = [
  { id: "yeni_girisimci", label: "Yeni girişimci" },
  { id: "mevcut_kobi", label: "Mevcut KOBİ" },
] as const;

export const GRANT_INVESTMENT_FOCI = [
  { id: "makine_techizat", label: "Makine ve teçhizat" },
  { id: "yazilim_dijital", label: "Yazılım / dijitalleşme" },
  { id: "arge", label: "Ar-Ge" },
  { id: "ihracat", label: "İhracat" },
] as const;

export const GRANT_RD_LEVELS = [
  { id: "NONE", label: "Ar-Ge yok" },
  { id: "EARLY", label: "Erken" },
  { id: "ESTABLISHED", label: "Yerleşik" },
  { id: "ADVANCED", label: "İleri" },
] as const;

/** İki haneli NACE Rev.2 grubu; etiket `kod — açıklama`. `sectorCode` eski sektör anahtarına köprü. */
export const GRANT_NACE_GROUPS = [
  { id: "01", label: "01 — Tarım, hayvancılık ve ormancılık", sectorCode: "tarim" },
  { id: "10", label: "10 — Gıda ürünleri imalatı", sectorCode: "uretim" },
  { id: "13", label: "13 — Tekstil ve giyim imalatı", sectorCode: "uretim" },
  { id: "22", label: "22 — Plastik, kauçuk ve kimya ürünleri imalatı", sectorCode: "uretim" },
  { id: "25", label: "25 — Fabrikasyon metal ürünleri imalatı", sectorCode: "uretim" },
  { id: "28", label: "28 — Makine ve ekipman imalatı", sectorCode: "uretim" },
  { id: "41", label: "41 — Bina ve özel inşaat faaliyetleri", sectorCode: "insaat" },
  { id: "46", label: "46 — Toptan ticaret", sectorCode: "ticaret" },
  { id: "47", label: "47 — Perakende ticaret ve e-ticaret", sectorCode: "ticaret" },
  { id: "49", label: "49 — Taşımacılık, kargo ve depolama", sectorCode: "lojistik" },
  { id: "55", label: "55 — Konaklama ve turizm", sectorCode: "turizm" },
  { id: "56", label: "56 — Yiyecek ve içecek hizmeti (kafe, restoran)", sectorCode: "turizm" },
  { id: "62", label: "62 — Yazılım, bilişim ve bilgisayar programlama", sectorCode: "yazilim" },
  { id: "70", label: "70 — Yönetim danışmanlığı ve mühendislik hizmetleri", sectorCode: "danismanlik" },
  { id: "72", label: "72 — Bilimsel araştırma ve geliştirme (Ar-Ge)", sectorCode: "arge" },
  { id: "86", label: "86 — İnsan sağlığı ve medikal hizmetler", sectorCode: "saglik" },
] as const;

/** Plaka kodu 01–81. İl adı serbest metin olarak kabul edilmez. */
export const GRANT_PROVINCES = [
  { code: "01", name: "Adana" },
  { code: "02", name: "Adıyaman" },
  { code: "03", name: "Afyonkarahisar" },
  { code: "04", name: "Ağrı" },
  { code: "05", name: "Amasya" },
  { code: "06", name: "Ankara" },
  { code: "07", name: "Antalya" },
  { code: "08", name: "Artvin" },
  { code: "09", name: "Aydın" },
  { code: "10", name: "Balıkesir" },
  { code: "11", name: "Bilecik" },
  { code: "12", name: "Bingöl" },
  { code: "13", name: "Bitlis" },
  { code: "14", name: "Bolu" },
  { code: "15", name: "Burdur" },
  { code: "16", name: "Bursa" },
  { code: "17", name: "Çanakkale" },
  { code: "18", name: "Çankırı" },
  { code: "19", name: "Çorum" },
  { code: "20", name: "Denizli" },
  { code: "21", name: "Diyarbakır" },
  { code: "22", name: "Edirne" },
  { code: "23", name: "Elazığ" },
  { code: "24", name: "Erzincan" },
  { code: "25", name: "Erzurum" },
  { code: "26", name: "Eskişehir" },
  { code: "27", name: "Gaziantep" },
  { code: "28", name: "Giresun" },
  { code: "29", name: "Gümüşhane" },
  { code: "30", name: "Hakkari" },
  { code: "31", name: "Hatay" },
  { code: "32", name: "Isparta" },
  { code: "33", name: "Mersin" },
  { code: "34", name: "İstanbul" },
  { code: "35", name: "İzmir" },
  { code: "36", name: "Kars" },
  { code: "37", name: "Kastamonu" },
  { code: "38", name: "Kayseri" },
  { code: "39", name: "Kırklareli" },
  { code: "40", name: "Kırşehir" },
  { code: "41", name: "Kocaeli" },
  { code: "42", name: "Konya" },
  { code: "43", name: "Kütahya" },
  { code: "44", name: "Malatya" },
  { code: "45", name: "Manisa" },
  { code: "46", name: "Kahramanmaraş" },
  { code: "47", name: "Mardin" },
  { code: "48", name: "Muğla" },
  { code: "49", name: "Muş" },
  { code: "50", name: "Nevşehir" },
  { code: "51", name: "Niğde" },
  { code: "52", name: "Ordu" },
  { code: "53", name: "Rize" },
  { code: "54", name: "Sakarya" },
  { code: "55", name: "Samsun" },
  { code: "56", name: "Siirt" },
  { code: "57", name: "Sinop" },
  { code: "58", name: "Sivas" },
  { code: "59", name: "Tekirdağ" },
  { code: "60", name: "Tokat" },
  { code: "61", name: "Trabzon" },
  { code: "62", name: "Tunceli" },
  { code: "63", name: "Şanlıurfa" },
  { code: "64", name: "Uşak" },
  { code: "65", name: "Van" },
  { code: "66", name: "Yozgat" },
  { code: "67", name: "Zonguldak" },
  { code: "68", name: "Aksaray" },
  { code: "69", name: "Bayburt" },
  { code: "70", name: "Karaman" },
  { code: "71", name: "Kırıkkale" },
  { code: "72", name: "Batman" },
  { code: "73", name: "Şırnak" },
  { code: "74", name: "Bartın" },
  { code: "75", name: "Ardahan" },
  { code: "76", name: "Iğdır" },
  { code: "77", name: "Yalova" },
  { code: "78", name: "Karabük" },
  { code: "79", name: "Kilis" },
  { code: "80", name: "Osmaniye" },
  { code: "81", name: "Düzce" },
] as const;

export type GrantAudience = (typeof GRANT_AUDIENCES)[number]["id"];
export type GrantInvestmentFocus = (typeof GRANT_INVESTMENT_FOCI)[number]["id"];
export type GrantNaceGroup = (typeof GRANT_NACE_GROUPS)[number]["id"];
export type GrantRdLevel = (typeof GRANT_RD_LEVELS)[number]["id"];

export function isGrantAudience(value: string): value is GrantAudience {
  return GRANT_AUDIENCES.some((row) => row.id === value);
}

export function isGrantInvestmentFocus(value: string): value is GrantInvestmentFocus {
  return GRANT_INVESTMENT_FOCI.some((row) => row.id === value);
}

export function isGrantNaceGroup(value: string): value is GrantNaceGroup {
  return GRANT_NACE_GROUPS.some((row) => row.id === value);
}

export function isGrantRdLevel(value: string): value is GrantRdLevel {
  return GRANT_RD_LEVELS.some((row) => row.id === value);
}

export function isProvinceCode(value: string): boolean {
  return GRANT_PROVINCES.some((row) => row.code === value);
}

export function sectorCodeForNace(id: string): string | null {
  return GRANT_NACE_GROUPS.find((row) => row.id === id)?.sectorCode ?? null;
}

export function grantProvinceLabel(code: string): string | null {
  return GRANT_PROVINCES.find((item) => item.code === code)?.name ?? null;
}

export function grantAudienceLabel(id: string): string | null {
  return GRANT_AUDIENCES.find((row) => row.id === id)?.label ?? null;
}

export function grantNaceLabel(id: string): string | null {
  return GRANT_NACE_GROUPS.find((row) => row.id === id)?.label ?? null;
}

export function grantInvestmentLabel(id: string): string | null {
  return GRANT_INVESTMENT_FOCI.find((row) => row.id === id)?.label ?? null;
}

export function grantRdLabel(id: string): string | null {
  return GRANT_RD_LEVELS.find((row) => row.id === id)?.label ?? null;
}
