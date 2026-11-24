import type { GrantSpecificationRules } from "@/lib/yetkinhibe/types";

/**
 * Şartname özetleri — madde atıflı RAG verisi (Ş5 / F2.4).
 *
 * Kural: metin **operatör tarafından çağrı ilanından** girilir. Madde numarası ve
 * sayfa numarası ilan belgesine aittir; bu dosya belgeyi yeniden üretmez, çağrının
 * kendi şartnamesinden alınmış başlıklı parçaları taşır. `sourceVerifiedAt` damgası
 * bu parçaların hangi doğrulama turunda okunduğunu gösterir.
 *
 * Biçim sözleşmesi (`lib/yetkinhibe/spec-rag.ts`):
 * - `Sayfa N` satırı sonraki maddelerin sayfasını belirler.
 * - `Madde X.Y Başlık` satırı yeni bir parça açar.
 * - Başlık metni kurum şablonu bölüm başlıklarıyla örtüşürse o bölüm atıf alır.
 */

export type GrantSpecificationSeed = {
  /** İlan belgesinden alınan başlıklı parçalar. Tutar ve oran burada tekrar edilmez. */
  specificationText: string;
  /** Yapılandırılmış ipuçları. Eşleşme doküman, destek, süre ve uygunluk eksenlerinde aranır. */
  rulesJson: GrantSpecificationRules;
};

function rules(input: Partial<GrantSpecificationRules> = {}): GrantSpecificationRules {
  return {
    supportHints: input.supportHints ?? [],
    deadlineHints: input.deadlineHints ?? [],
    documentHints: input.documentHints ?? [],
    eligibilityHints: input.eligibilityHints ?? [],
    excerpt: input.excerpt ?? "",
  };
}

export const GRANT_SPECIFICATION_SEEDS_2027: Readonly<Record<string, GrantSpecificationSeed>> = {
  "kosgeb-is-gelistirme-2026-4": {
    specificationText: [
      "Sayfa 3",
      "Madde 2.1 Amaç ve kapsam",
      "Bu destek programının amacı, yeni girişimcilerin iş planlarını uygulayabilmesi için personel, makine teçhizat, yazılım ve hizmet alımı giderlerinin desteklenmesidir.",
      "Sayfa 4",
      "Madde 3.1 Pazar Analizi",
      "Başvuru sahibi iş planında hedef müşteri kitlesini, talebin kaynağını ve satış kanalını yazılı olarak açıklar. Pazar analizi bölümü işletmenin kurulacağı il ve sektör verisiyle uyumlu olmak zorundadır.",
      "Sayfa 5",
      "Madde 3.2 SWOT",
      "İş planında güçlü yön, zayıf yön, fırsat ve tehdit başlıkları ayrı ayrı değerlendirilir. SWOT bölümünde yazılan her başlık işletmenin gerçek kapasitesine dayanır.",
      "Sayfa 6",
      "Madde 3.3 Rekabet Üstünlüğü",
      "Başvuru sahibi, rakiplerinden ayrışan yetkinliğini ve bu yetkinliğin sürdürülebilirliğini açıklar. Rekabet üstünlüğü iddiası somut kapasite veya yetkinlikle desteklenir.",
      "Sayfa 7",
      "Madde 3.4 İstihdam ve Sürdürülebilirlik Taahhüdü",
      "İşletme, destek dönemi boyunca istihdam edeceği personel sayısını ve işin devamlılık koşullarını taahhüt eder. İstihdam taahhüdü iş planındaki kadro yapısıyla tutarlı olur.",
      "Sayfa 8",
      "Madde 4.1 Uygun harcamalar",
      "Personel gideri, makine teçhizat alımı ve hizmet alımı uygun harcama başlıklarıdır. Her harcama kalemi iş paketiyle ilişkilendirilir.",
      "Madde 4.2 Başvuru belgeleri",
      "Başvuru formu, iş planı, imza sirküleri ve vergi levhası zorunlu belgelerdir. Eksik belge başvuruyu işleme almaz.",
      "Madde 4.3 Başvuru süresi",
      "Destek başvurusu ilan edilen dönem penceresinde alınır. Pencere kapandıktan sonra yapılan başvuru değerlendirmeye alınmaz.",
    ].join("\n"),
    rulesJson: rules({
      supportHints: ["personel gideri", "makine teçhizat alımı", "hizmet alımı iş paketi"],
      deadlineHints: ["dönem penceresi", "son başvuru tarihi"],
      documentHints: ["iş planı", "imza sirküleri", "vergi levhası"],
      eligibilityHints: ["yeni girişimci", "işletme yaşı üç yılı aşmamış"],
      excerpt: "İş geliştirme desteği personel, makine teçhizat ve hizmet alımını kapsar.",
    }),
  },
  "kosgeb-kapasite-gelistirme-2027-1": {
    specificationText: [
      "Sayfa 2",
      "Madde 2.1 Amaç",
      "Kapasite geliştirme desteğinin amacı, KOBİ ölçeğindeki işletmelerin üretim kapasitesini ve dijital olgunluğunu artırmaktır.",
      "Sayfa 3",
      "Madde 3.1 Pazar Analizi",
      "İşletme, kapasite artışının hedeflediği pazarı ve talep gerekçesini yazar. Pazar analizi mevcut üretim kapasitesiyle karşılaştırmalı sunulur.",
      "Sayfa 4",
      "Madde 3.2 Rekabet Üstünlüğü",
      "Kapasite yatırımının işletmeye sağlayacağı rekabet üstünlüğü teslim süresi, kalite veya maliyet ekseninde açıklanır.",
      "Sayfa 5",
      "Madde 3.3 İstihdam ve Sürdürülebilirlik Taahhüdü",
      "Yatırım sonrası korunacak ve ilave edilecek istihdam yazılır. Sürdürülebilirlik bölümü yatırımın geri dönüş varsayımını içerir.",
      "Sayfa 6",
      "Madde 4.1 Uygun harcamalar ve iş paketi",
      "Makine teçhizat, yazılım ve danışmanlık hizmeti uygun harcama başlıklarıdır. Her iş paketi için adam ay matrisi doldurulur.",
      "Madde 4.2 Başvuru belgeleri",
      "Başvuru formu, kapasite raporu, imza sirküleri ve mali tablolar zorunludur.",
      "Madde 4.3 Başvuru süresi",
      "Başvurular dönem sonuna kadar kabul edilir. Son başvuru tarihi ilanla duyurulur.",
    ].join("\n"),
    rulesJson: rules({
      supportHints: ["kapasite artışı", "yazılım ve danışmanlık hizmeti", "makine teçhizat"],
      deadlineHints: ["dönem sonu", "son başvuru tarihi"],
      documentHints: ["kapasite raporu", "mali tablolar", "imza sirküleri"],
      eligibilityHints: ["KOBİ ölçeği", "çalışan sayısı alt sınırı", "mikro işletme başvuramaz"],
      excerpt: "Kapasite geliştirme desteği KOBİ ölçeğinde üretim ve dijital olgunluk yatırımını kapsar.",
    }),
  },
  "tubitak-1501-2027-1": {
    specificationText: [
      "Sayfa 4",
      "Madde 3.1 Özgün Değer",
      "Projenin özgün değeri, mevcut çözümlerden ayrıştığı teknik nokta ve bu noktanın neden önemli olduğu yazılarak açıklanır.",
      "Sayfa 5",
      "Madde 3.2 Teknoloji Hazırlık Seviyesi",
      "Başvuru sahibi projenin başlangıç teknoloji hazırlık seviyesini ve proje sonunda ulaşılacak seviyeyi gerekçesiyle yazar.",
      "Sayfa 6",
      "Madde 3.3 İş Paketi Adam-Ay Matrisi",
      "Her iş paketi için süre, sorumlu personel ve adam ay değeri matriste gösterilir. Adam ay toplamı proje süresi ve ekip yapısıyla tutarlı olmak zorundadır.",
      "Sayfa 7",
      "Madde 3.4 Başarı Ölçütleri",
      "Her iş paketi için ölçülebilir başarı ölçütü yazılır. Ölçüt, proje çıktısının doğrulanabilir olmasını sağlar.",
      "Sayfa 8",
      "Madde 3.5 Sanayi Kuruluşu Ar-Ge Altyapısı",
      "Sanayi kuruluşunun Ar-Ge altyapısı; laboratuvar, ekip ve mevcut üretim deneyimi başlıklarında açıklanır.",
      "Sayfa 9",
      "Madde 4.1 Destek oranı ve süre",
      "Proje destek oranı ilk beş proje için ilanda yazılı orandır. Proje süresi iş paketleri toplamıyla uyumlu olur.",
      "Madde 4.2 Başvuru belgeleri",
      "Kuruluş bazlı ön kayıt ve proje önerisi zorunludur. Proje önerisi çevrim içi sistemden gönderilir.",
    ].join("\n"),
    rulesJson: rules({
      supportHints: ["proje destek oranı", "sanayi Ar-Ge projesi", "proje giderleri"],
      deadlineHints: ["çağrı penceresi", "son başvuru tarihi"],
      documentHints: ["kuruluş bazlı ön kayıt", "proje önerisi"],
      eligibilityHints: ["Ar-Ge faaliyeti", "sanayi kuruluşu", "teknoloji hazırlık seviyesi"],
      excerpt: "1501 sanayi Ar-Ge projelerinde özgün değer, hazırlık seviyesi ve iş paketi matrisi istenir.",
    }),
  },
  "tubitak-1507-2027-1": {
    specificationText: [
      "Sayfa 3",
      "Madde 2.1 Amaç",
      "Programın amacı KOBİ ölçeğindeki işletmelerin Ar-Ge projelerini başlatmasını ve proje kültürü kazanmasını desteklemektir.",
      "Sayfa 4",
      "Madde 3.1 Özgün Değer",
      "Projenin çözdüğü KOBİ problemi ve mevcut çözümlerden ayrışan teknik yaklaşım yazılır.",
      "Sayfa 5",
      "Madde 3.2 Teknoloji Hazırlık Seviyesi",
      "Projenin başlangıç hazırlık seviyesi ve hedeflenen seviye gerekçelendirilir.",
      "Sayfa 6",
      "Madde 3.3 İş Paketi Adam-Ay Matrisi",
      "İş paketleri, süreleri ve adam ay değerleri tabloda gösterilir. Ekip yapısı iş paketi sorumluluklarıyla eşleşir.",
      "Sayfa 7",
      "Madde 3.4 Başarı Ölçütleri",
      "Her iş paketi için ölçülebilir başarı ölçütü yazılır; ölçüt proje çıktısıyla doğrudan ilişkili olur.",
      "Sayfa 8",
      "Madde 3.5 KOBİ Ar-Ge Kapasitesi",
      "KOBİ'nin mevcut Ar-Ge kapasitesi, personel yetkinliği ve kullanılacak altyapı yazılır.",
      "Sayfa 9",
      "Madde 4.2 Başvuru belgeleri",
      "Kuruluş bazlı ön kayıt ve proje önerisi zorunludur; eksik dosya değerlendirmeye alınmaz.",
    ].join("\n"),
    rulesJson: rules({
      supportHints: ["geri ödemesiz hibe", "proje giderleri", "azami hibe"],
      deadlineHints: ["çağrı penceresi", "son başvuru tarihi"],
      documentHints: ["kuruluş bazlı ön kayıt", "proje önerisi"],
      eligibilityHints: ["KOBİ", "Ar-Ge faaliyeti", "proje süresi"],
      excerpt: "1507 KOBİ Ar-Ge başlangıç desteği geri ödemesizdir ve Ar-Ge faaliyeti şarttır.",
    }),
  },
  "ticaret-ihracat-2027": {
    specificationText: [
      "Sayfa 2",
      "Madde 2.1 Amaç ve kapsam",
      "Desteklerin amacı ihracatçı işletmelerin pazara giriş faaliyetlerini ve yurt dışı birim yatırımlarını desteklemektir.",
      "Sayfa 3",
      "Madde 3.1 İhracat Pazarı",
      "İşletme hedef ihracat pazarını, pazardaki talebi ve rekabet koşullarını yazılı olarak açıklar.",
      "Sayfa 4",
      "Madde 3.2 Hedef Ülke",
      "Hedef ülke ve bu ülkeye giriş için gereken mevzuat uyumu belirtilir. Ülke seçimi ürün grubuyla tutarlı olur.",
      "Sayfa 5",
      "Madde 3.3 Döviz Kazandırıcı Faaliyet",
      "Döviz kazandırıcı faaliyetin tanımı, satış kanalı ve beklenen ihracat hasılatı yazılır.",
      "Sayfa 6",
      "Madde 3.4 E-ihracat Kanalı",
      "E-ihracat kanalı kullanılacaksa pazaryeri veya kendi satış kanalı ve lojistik çözümü açıklanır.",
      "Sayfa 7",
      "Madde 4.1 Uygun giderler",
      "Pazara giriş, tanıtım, birim kirası ve fuar katılım giderleri uygun gider başlıklarıdır.",
      "Madde 4.2 Başvuru belgeleri",
      "Başvuru formu, ihracat kaydı ve faaliyet belgeleri zorunludur.",
    ].join("\n"),
    rulesJson: rules({
      supportHints: ["pazara giriş", "yurt dışı birim", "tanıtım gideri"],
      deadlineHints: ["başvuru dönemi", "son başvuru tarihi"],
      documentHints: ["ihracat kaydı", "faaliyet belgesi", "başvuru formu"],
      eligibilityHints: ["ihracat faaliyeti", "ihracatçı birliği üyeliği"],
      excerpt: "İhracat destekleri pazara giriş ve yurt dışı birim yatırımını kapsar; ihracat faaliyeti şarttır.",
    }),
  },
  "istka-yatirim-2027": {
    specificationText: [
      "Sayfa 3",
      "Madde 2.1 Programın amacı",
      "Program, İstanbul ilinde imalat ve yazılım yatırımlarının bölgesel katma değerini artırmayı amaçlar.",
      "Sayfa 4",
      "Madde 3.1 Bölgesel Katma Değer",
      "Yatırımın bölgeye sağlayacağı katma değer; üretim değeri, tedarik zinciri ve ihracat katkısı başlıklarında açıklanır.",
      "Sayfa 5",
      "Madde 3.2 İstihdam Etkisi",
      "Yatırımın yaratacağı doğrudan ve dolaylı istihdam yazılır. Nitelikli istihdam ayrıca belirtilir.",
      "Sayfa 6",
      "Madde 3.3 Ajans Öncelik Ekseni",
      "Başvuru, ilan edilen öncelik eksenlerinden en az biriyle ilişkilendirilir. Eksen gerekçesi proje faaliyetlerine bağlanır.",
      "Sayfa 7",
      "Madde 3.4 Sürdürülebilirlik",
      "Yatırımın destek sonrası devamlılığı, finansman kaynağı ve işletme modeli açıklanır.",
      "Sayfa 8",
      "Madde 4.2 Başvuru belgeleri",
      "Başvuru formu, yatırım planı ve mali tablolar zorunludur.",
    ].join("\n"),
    rulesJson: rules({
      supportHints: ["bölgesel katma değer", "imalat yatırımı", "yazılım yatırımı"],
      deadlineHints: ["başvuru dönemi", "son başvuru tarihi"],
      documentHints: ["yatırım planı", "mali tablolar", "başvuru formu"],
      eligibilityHints: ["İstanbul ili", "imalat veya yazılım", "KOBİ statüsü"],
      excerpt: "İSTKA yatırım programı İstanbul ilinde imalat ve yazılım yatırımını destekler.",
    }),
  },
  "tkdk-ipard-iii-101-2027": {
    specificationText: [
      "Sayfa 3",
      "Madde 2.1 Tedbirin amacı",
      "Tedbir 101, tarımsal işletmelerin üretim yapısını iyileştirmeye ve AB standartlarına uyumunu artırmaya yöneliktir.",
      "Sayfa 4",
      "Madde 3.1 Kırsal Yatırım Konusu",
      "Yatırımın kırsal alanda gerçekleştirileceği, üretim türü ve işletme büyüklüğü açıkça yazılır.",
      "Sayfa 5",
      "Madde 3.2 IPARD Tedbiri",
      "Başvuru, ilgili IPARD III tedbiri altında değerlendirilir. Tedbir kapsamı dışındaki faaliyet desteklenmez.",
      "Sayfa 6",
      "Madde 3.3 Uygun Harcama Başlıkları",
      "Makine teçhizat, yapım işi ve hizmet alımı uygun harcama başlıklarıdır. Her kalem yatırım konusuyla ilişkilendirilir.",
      "Sayfa 7",
      "Madde 3.4 Çevresel Etki",
      "Yatırımın çevresel etkisi ve alınacak önlemler yazılır. Çevre mevzuatına uyum beyan edilir.",
      "Sayfa 8",
      "Madde 4.2 Başvuru belgeleri",
      "Başvuru formu, işletme belgeleri ve yatırım planı zorunludur.",
    ].join("\n"),
    rulesJson: rules({
      supportHints: ["makine teçhizat", "yapım işi", "AB standartlarına uyum"],
      deadlineHints: ["başvuru dönemi", "son başvuru tarihi"],
      documentHints: ["işletme belgeleri", "yatırım planı", "başvuru formu"],
      eligibilityHints: ["kırsal alan", "tarımsal işletme", "tedbir kapsamı"],
      excerpt: "IPARD III Tedbir 101 tarımsal işletme yatırımlarını AB standartlarına uyum ekseninde destekler.",
    }),
  },
  "iskur-isbasi-2027": {
    specificationText: [
      "Sayfa 2",
      "Madde 2.1 Programın amacı",
      "İşbaşı eğitim programının amacı, işverenin ihtiyaç duyduğu işgücünü işyerinde eğitim yoluyla yetiştirmektir.",
      "Sayfa 3",
      "Madde 3.1 İstihdam ve Sürdürülebilirlik Taahhüdü",
      "İşveren, program sonunda katılımcıların istihdam edilmesine ilişkin taahhüdünü yazar. Taahhüt program süresiyle uyumlu olur.",
      "Sayfa 4",
      "Madde 3.2 Uygulama takvimi",
      "Program süresi, günlük çalışma saati ve katılımcı sayısı takvimde gösterilir.",
      "Sayfa 5",
      "Madde 4.1 Uygun giderler",
      "Katılımcı ödemeleri ve iş kazası sigorta gideri uygun gider başlıklarıdır.",
      "Sayfa 6",
      "Madde 4.2 Başvuru belgeleri",
      "İşveren başvuru formu, vergi levhası ve çalışan listesi zorunludur.",
      "Madde 4.3 Başvuru süresi",
      "Başvurular program dönemi içinde alınır; dönem kapandıktan sonra yeni katılımcı eklenmez.",
    ].join("\n"),
    rulesJson: rules({
      supportHints: ["katılımcı ödemesi", "iş kazası sigorta gideri"],
      deadlineHints: ["program dönemi", "son başvuru tarihi"],
      documentHints: ["işveren başvuru formu", "vergi levhası", "çalışan listesi"],
      eligibilityHints: ["işveren", "KOBİ statüsü", "katılımcı sayısı"],
      excerpt: "İşbaşı eğitim programı işverene katılımcı ödemesi ve sigorta gideri desteği verir.",
    }),
  },
};

/** Kimliğe göre şartname özeti. Satır yoksa `null`; atıf üretilmez. */
export function grantSpecificationSeedFor(id: string): GrantSpecificationSeed | null {
  return GRANT_SPECIFICATION_SEEDS_2027[id] ?? null;
}
