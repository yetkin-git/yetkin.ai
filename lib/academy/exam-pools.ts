import type { AcademyExamQuestion } from "@/lib/academy/types";
import { ACADEMY_PILOT_SKU_SLUG } from "@/lib/academy/pilot-sku";
import {
  AI_TEMEL_QUESTIONS,
  FULLSTACK_TEMEL_QUESTIONS,
  UX_TEMEL_QUESTIONS,
} from "@/lib/academy/exam-pools-growth";

function mcq(
  id: string,
  prompt: string,
  choices: readonly [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
): AcademyExamQuestion {
  return { id, prompt, choices: [...choices], correctIndex };
}

function pythonMcq(
  id: string,
  prompt: string,
  choices: [string, string, string, string],
  correctIndex: 0 | 1 | 2 | 3,
): AcademyExamQuestion {
  return mcq(id, prompt, choices, correctIndex);
}

/** Amiral Ders (Pilot SKU) sınav havuzu. */
export const PYTHON_TEMEL_QUESTIONS: AcademyExamQuestion[] = [
  pythonMcq("q_python_temel_1", "print ne yapar?", ["Dosya siler", "Değeri standart çıktıya yazar", "Tip dönüştürür", "Döngü açar"], 1),
  pythonMcq("q_python_temel_2", "Tırnaksız Hello yazmak doğru mudur?", ["Evet", "Hayır; string tırnak ister", "Evet; Python tahmin eder", "Hayır; yalnız print yasak"], 1),
  pythonMcq("q_python_temel_3", "input() ne döner?", ["Her zaman int", "Her zaman str", "bool", "None"], 1),
  pythonMcq("q_python_temel_4", "type() ne işe yarar?", ["Dosya açar", "Değerin tipini gösterir", "Döngü kırar", "Modül yükler"], 1),
  pythonMcq("q_python_temel_5", "= ile == farkı nedir?", ["Aynıdır", "= atama, == karşılaştırma", "İkisi de karşılaştırma", "İkisi de atama"], 1),
  pythonMcq("q_python_temel_6", "if blogunu ne belirler?", ["Virgül", "Girinti (indentation)", "Noktalı virgül", "Büyük harf"], 1),
  pythonMcq("q_python_temel_7", "range(1, 6) hangi sayıları üretir?", ["1..6", "1..5", "0..5", "0..6"], 1),
  pythonMcq("q_python_temel_8", "return olmadan fonksiyon ne döner?", ["0", "None", "Boş string", "Hata zorunlu"], 1),
  pythonMcq("q_python_temel_9", "Metin «250,00» ile * 2 ne üretir?", ["500", "Birleştirilmiş metin", "Hata her zaman", "250"], 1),
  pythonMcq("q_python_temel_10", "try/except ValueError ne zaman işe yarar?", ["Her hatada", "int('üç') gibi dönüşüm hatalarında", "Yalnız dosyada", "Yalnız ağda"], 1),
  pythonMcq("q_python_temel_11", "bool hangi ikilidir?", ["1 ve 2", "True / False", "yes / no", "on / off string"], 1),
  pythonMcq("q_python_temel_12", "Anlamlı değişken adı neden iyidir?", ["Zorunlu sözdizimi", "Okunur sözleşme", "Daha hızlı CPU", "Garbage collector"], 1),
  pythonMcq("q_python_temel_13", "while True riski nedir?", ["Yavaşlık", "Çıkış yoksa sonsuz döngü", "Tip hatası", "Import hatası"], 1),
  pythonMcq("q_python_temel_14", "break ne yapar?", ["Fonksiyon siler", "Döngüyü erken bitirir", "Dosya kapatır", "Tip değiştirir"], 1),
  pythonMcq("q_python_temel_15", "def ne başlatır?", ["Sınıf", "Fonksiyon tanımı", "Modül", "Paket"], 1),
  pythonMcq("q_python_temel_16", "Kuruş dönüşümü için doğru yaklaşım?", ["float basmak", "int(round(lira * 100))", "str çarpmak", "hex"], 1),
  pythonMcq("q_python_temel_17", "elif ne işe yarar?", ["Import", "Ek koşul dalı", "Döngü", "Sınıf"], 1),
  pythonMcq("q_python_temel_18", "Boş girdi nasıl ele alınır?", ["Yoksay", "strip sonrası reddet / yeniden sor", "0 kabul et", "None bas"], 1),
  pythonMcq("q_python_temel_19", "Bu eğitim kaç bölüm?", ["5 sabit", "12 (Temel ve İleri kapanış)", "3", "6"], 1),
  pythonMcq("q_python_temel_20", "Baraj kaçtır?", ["50", "70+", "100", "Yok"], 1),
  pythonMcq("q_python_temel_21", "float lira ortalama tuzağı nedir?", ["Hızlanır", "Yaklaşık / yuvarlama hatası", "Daha doğru", "Tip gerekmez"], 1),
  pythonMcq("q_python_temel_22", "continue ne yapar?", ["Programı bitirir", "O turu atlar", "Dosya siler", "Import"], 1),
  pythonMcq("q_python_temel_23", "Yerel değişken dışarı sızar mı?", ["Evet her zaman", "Hayır; fonksiyon kapsamındadır", "Evet global olur", "Yalnız return ile aynı"], 1),
  pythonMcq("q_python_temel_24", "Docstring ne taşır?", ["Şifre", "Kısa amaç açıklaması", "SQL", "Token"], 1),
  pythonMcq("q_python_temel_25", "İlk geri bildirim nedir?", ["PDF", "Ekran çıktısı", "Sertifika", "Docker"], 1),
  pythonMcq("q_python_temel_26", "Karşılaştırma sonucu tipi?", ["str", "bool", "list", "dict"], 1),
  pythonMcq("q_python_temel_27", "Satın alma belge midir?", ["Evet", "Hayır; belge sınav barajından sonra", "Evet; hash", "Hayır; yalnız vize"], 1),
  pythonMcq("q_python_temel_28", "İleri halkada ne gelir?", ["Yalnız HTML", "Liste, dosya, Pandas ve parametreli sorgu", "Yalnız CSS", "Photoshop"], 1),
  pythonMcq("q_python_temel_29", "print parantezsiz Python 3’te?", ["Geçerli", "Sözdizimi hatası riski / doğru çağrı print(...)", "Zorunlu", "Yalnız REPL"], 1),
  pythonMcq("q_python_temel_30", "Etkileşimli betik özeti nedir?", ["Girdi→doğrula→hesapla→yazdır", "Yalnız print", "Yalnız import", "Yalnız class"], 1),
  pythonMcq("q_python_temel_31", "int('72') başarılı mı?", ["Hayır", "Evet", "Yalnız float", "Yalnız hex"], 1),
  pythonMcq("q_python_temel_32", "Öğretmen-öğrenci dilinde amaç nedir?", ["Korkutmak", "Adım adım kavratmak", "Manifesto okutmak", "5 ders zorlamak"], 1),
  pythonMcq("q_python_temel_33", "Liste indeksi nereden başlar?", ["1", "0", "len", "-2 zorunlu"], 1),
  pythonMcq("q_python_temel_34", "Eksik sözlük anahtarında dürüst yol?", ["Köşeli parantez", ".get veya in", "print şifre", "eval"], 1),
  pythonMcq("q_python_temel_35", "Yapılandırılmış Sorgu Dili değeri nasıl bağlanır?", ["f-string", "Parametre yer tutucusu", "eval", "pickle"], 1),
  pythonMcq("q_python_temel_36", "CareerVisaStamp ne zaman basılır?", ["Satın alınca", "Sınav barajı (≥70) üstünde", "İlk derste", "PDF indirince"], 1),
];

const POOL_BY_SLUG: Record<string, readonly AcademyExamQuestion[]> = {
  [ACADEMY_PILOT_SKU_SLUG]: PYTHON_TEMEL_QUESTIONS,
  "fullstack-temel": FULLSTACK_TEMEL_QUESTIONS,
  "ai-temel": AI_TEMEL_QUESTIONS,
  "ux-temel": UX_TEMEL_QUESTIONS,
};

export function academyExamPoolForSlug(slug: string): AcademyExamQuestion[] {
  return [...(POOL_BY_SLUG[slug] ?? [])];
}
