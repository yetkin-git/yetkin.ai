import { academyLessonDraft, type AcademyLessonDraft } from "@/lib/academy/curricula/types";

type LessonSpec = {
  key: string;
  order: number;
  title: string;
  intro: string;
  trap: string;
  analogy: string;
  vaka: string;
  conclusion: string;
};

function lessons(specs: readonly LessonSpec[]): AcademyLessonDraft[] {
  return specs.map((spec) =>
    academyLessonDraft(
      spec.key,
      spec.order,
      spec.title,
      spec.intro,
      `${spec.trap}

Bu adımda acele etmek sessiz hata doğurur; gürültü kopmaz, fiş bozulur.

Bunu günlük hayattan bir örnekle ele alırsak... ${spec.analogy}

${spec.vaka}`,
      spec.conclusion,
    ),
  );
}

export const UX_TEMEL_LESSONS = lessons([
  {
    key: "ux-temel-1",
    order: 1,
    title: "Kullanıcı Deneyimi ile Kullanıcı Arayüzü sınırı",
    intro: `Pazarda yolun kendisi deneyim, vitrin camı arayüzdür. Kullanıcı Deneyimi (UX) araştırma, akış, acıdır. Kullanıcı Arayüzü (UI) piksel, tipo, düğmedir. Camı boyamak, yolu düzeltmez. Bu Masterclass’ta önce sınırı çizeriz.

«Güzel dursun» arayüz cümlesidir. «Kasiyer üç adımda tartıyı bitirsin» deneyim cümlesidir. İkisi karışınca Figma süs, iş kanıtı olmaz.`,
    trap: `Ekran güzel, görev tamamlanmaz. Kursiyer beğeniyi kabul sayar. Beğeni, görev süresi değildir.`,
    analogy: `restoran: masa örtüsü arayüz, servis süresi deneyimdir. Örtü ipek, yemek gelmezse deneyim kırılır.`,
    vaka: `vitrin parlar, ödeme üç dakikada bulunmaz. UX sınırı görev ve acıdır; UI o görevin yüzüdür.`,
    conclusion: `Deneyim yol, arayüz tabeladır. Tabela yolu değiştirmez.

Bir sonraki bölümde seni araştırma bekliyor.`,
  },
  {
    key: "ux-temel-2",
    order: 2,
    title: "Kullanıcı araştırması: soru, görüşme, bulgu",
    intro: `Tezgâhta «müşteri böyle ister» demek, komşunun sözünü kanun saymaktır. Araştırma soru yazar, görüşme dinler, bulgu not düşer. Beş kişilik kahve sohbeti referandum değildir; yine de uydurma personasından iyidir.

Soru yönlendirici olmaz. «Bu düğme güzel değil mi?» değil, «ödemeyi nerede aradın?» Figma’dan önce defter durur.`,
    trap: `İçerideki ekip kendi zevkini kullanıcı sanır. Görüşme yok, tel çerçeve başlar. Süs, kanıttan önce gelir.`,
    analogy: `doktor: muayene olmadan reçete yazmaz. Tasarımcı da görüşmesiz ekran basmaz.`,
    vaka: `görüşme yok, «kullanıcı mor ister» diye palet seçilir. Soru ve bulgu olmadan renk kararı düşer.`,
    conclusion: `Araştırma, defterdir. Deftersiz Figma tahminidir.

Bir sonraki bölümde seni persona ve yolculuk bekliyor.`,
  },
  {
    key: "ux-temel-3",
    order: 3,
    title: "Persona ve kullanıcı yolculuğu: acı haritası",
    intro: `Otobüste «herkes» diye tarif yazılmaz; durak ve çanta konuşulur. Persona, kanıtlı bir yüzdür: işi, kısıtı, acısı. Yolculuk (journey) adım adım: keşif, karar, ödeme, sonrası. Acı noktası sarı boya değil, kırılan iştir.

Sahte isim + stok fotoğraf, kanıt değildir. «Ayşe 28 yaşında, mor sever» araştırma yoksa masal durur.`,
    trap: `Persona süs dosyası olur, yolculuk slaytta kalır. Ekran kararı kişisiz alınır. Harita duvarda, yol yürünmez.`,
    analogy: `harita: nehir işaretli değilse köprü yanlış yere kurulur. Acı işaretlenmeden düğme konmaz.`,
    vaka: `persona stok fotoğraftır, acı yok. Yolculukta ödeme adımı «sıkıcı» diye atlanır; asıl kırılma oradadır.`,
    conclusion: `Yüz ve yol, kanıtla durur. Masal, Figma’ya girmez.

Bir sonraki bölümde seni bilgi mimarisi bekliyor.`,
  },
  {
    key: "ux-temel-4",
    order: 4,
    title: "Bilgi mimarisi: etiket, grup ve kart sıralama",
    intro: `Market rafında deterjanı manavın yanına koymak, müşteriyi kaybettirir. Bilgi mimarisi (IA) etiket, grup, dolaşımdır. Kart sıralama (card sorting) insanın zihnindeki rafı ortaya çıkarır. Şirket jargonu etiket olmaz.

«Çözümlerimiz» yerine insanın aradığı kelime durur. Dolaşım, hikâye değil yol işaretidir.`,
    trap: `Menü şirket organigramıdır. Kullanıcı «fiyat» arar, «teklif yönetimi» görür. Etiket kırılır.`,
    analogy: `otogar tabela: «peron 3» jargon değil, bilet dilidir. Yanlış tabela yanlış otobüstür.`,
    vaka: `menü organigram kopyasıdır, kart sıralama yoktur. Etiket kullanıcı diline çekilmeden tel çerçeve başlar.`,
    conclusion: `Raf düzeni, zihnin düzenidir. Jargon, kaybolmaktır.

Bir sonraki bölümde seni tel çerçeve bekliyor.`,
  },
  {
    key: "ux-temel-5",
    order: 5,
    title: "Düşük sadakat tel çerçeve: iskelet ve öncelik",
    intro: `İnşaatta önce kolon, sonra perde. Tel çerçeve (wireframe) gri kutu, öncelik, akıştır. Renk ve gölge bu perdede yasaktır; tartışma «güzel mi»ye kaymasın. Birincil eylem büyük, ikincil küçük durur.

Kağıt da Figma da olur. Sadakat düşükse patron «rengi beğenmedim» diyemez; «görev burada mı?» der.`,
    trap: `Tel çerçeveye palet ve stok fotoğraf girer. Toplantı süs konuşur, akış unutulur.`,
    analogy: `mimar krokisi: duvar yeri konuşulur, perde kumaşı değil. Erken kumaş, yanlış duvarı gizler.`,
    vaka: `gri kutu yerine tam görsel gelir, öncelik kaybolur. Tel çerçeve iskelet kalır; palet sonraki perdede durur.`,
    conclusion: `İskelet, önceliği korur. Süs, iskeleti ezmez.

Bir sonraki bölümde seni Figma temelleri bekliyor.`,
  },
  {
    key: "ux-temel-6",
    order: 6,
    title: "Figma temelleri: çerçeve, otomatik yerleşim, bileşen",
    intro: `Atölyede aletleri masaya savurmak gibi; çerçeve düzensizse iş kaybolur. Figma’da frame sahne, auto layout dizilim, component tekrarlanan parçadır. Constraints çerçevesi gerilince kırılmayan kuraldır.

El ile pikseli itmek, her dolaba ayrı menteşe uydurmaktır. Bileşen yoksa yarın aynı düğme üç boyda yaşar.`,
    trap: `Kopyala-yapıştır düğme, ana bileşeni güncellemeyi unutturur. Ekranlar dağılır.`,
    analogy: `kalıp: tek menteşe, yüz dolap. Kalıp yoksa her kapı ayrı marangoz işidir.`,
    vaka: `on ekranda on ayrı düğme. Frame + auto layout + component olmadan Masterclass laboratuvarı bitmez.`,
    conclusion: `Figma, atölye disiplinidir. Kalıp, tekrarı kurtarır.

Bir sonraki bölümde seni araştırma-tel-Figma laboratuvarı bekliyor.`,
  },
  {
    key: "ux-temel-7",
    order: 7,
    title: "Laboratuvar: araştırma, mimari, tel çerçeve, Figma",
    intro: `Keşifsiz, haritasız, iskeletsiz vitrin açmak gibi; laboratuvar uçtan uca kanıt ister. Bir bulgu, bir bilgi mimarisi kararı, bir tel çerçeve, bir Figma çerçevesi. Dördü aynı işe bağlıdır.

Bu bölüm Temel araştırma halkasını kapatır. Sonraki halka görsel sistem ve teslimdir.`,
    trap: `Figma ekranı vardır, bulgu notu yoktur. Kursiyer «tasarladım» der. Tasarı, kanıtsız süs olabilir.`,
    analogy: `inşaat ruhsatı: zemin etüdü yoksa kat çıkılmaz. Figma katıdır; etüt defterdedir.`,
    vaka: `güzel Figma, görüşme yok. Kontrol listesi: bulgu → IA → wire → frame. Eksik halka teslimi düşürür.`,
    conclusion: `Laboratuvar, zinciri gösterir. Kopuk halka, vitrin yalanıdır.

Bir sonraki bölümde seni görsel hiyerarşi bekliyor.`,
  },
  {
    key: "ux-temel-8",
    order: 8,
    title: "Görsel hiyerarşi: odak, ızgara ve sekiz piksel",
    intro: `Kavşakta her tabelayı neon yakmak gibi; göz nereye bakacağını bilmez. Hiyerarşi boyut, ağırlık, boşluktur. Sekiz piksel ızgara ritimdir; rastgele 11 px boşluk atölyeyi bozar.

Birincil eylem bir tane durur. İkincil ve üçüncül ses kısılır. Figma’da layout grid bu ritmi mühürler.`,
    trap: `Her kutu eşit bağırır. Kursiyer «hepsi önemli» der. Hepsi önemliyse hiçbiri yol göstermez.`,
    analogy: `gazete manşeti: bir başlık kral, diğerleri tebaadır. Beş manşet, gazete değildir.`,
    vaka: `üç birincil düğme yan yana. Odak tek kalır; ızgara ritmi yazılıdır.`,
    conclusion: `Göz, sırayı okur. Sıra yoksa görev kaybolur.

Bir sonraki bölümde seni tasarım jetonu bekliyor.`,
  },
  {
    key: "ux-temel-9",
    order: 9,
    title: "Tasarım jetonu: renk, boşluk, tipo sistemi",
    intro: `Fabrika kalıp makinesi her parçayı ayrı milimle keserse seri üretim dağılır. Tasarım jetonu (token) renk, boşluk, tipo adıdır. --color-text, --space-4, --font-lg. Tema değişince jeton değişir; her kutu ayrı kodlanmaz.

Figma variables veya stiller bu isimleri taşır. Rastgele hex, yarın paleti unutturur.`,
    trap: `Her ekranda yeni mor. Kursiyer «bu sayfa özel» der. Özel, sistemin ölümüdür.`,
    analogy: `fayans: tek kalıp, bütün banyo. Her duvara ayrı kesim, derz kaçırır.`,
    vaka: `on hex, sıfır jeton. Renk / boşluk / tipo üç adı olmadan palet teslim sayılmaz.`,
    conclusion: `Jeton, fabrikadır. İsmi olmayan renk, hurdadır.

Bir sonraki bölümde seni prototip bekliyor.`,
  },
  {
    key: "ux-temel-10",
    order: 10,
    title: "Prototip: tıklanır akış ve görev testi",
    intro: `Haritayı duvara asıp yolu yürümüş saymak gibi; tıklanmayan akış test edilmez. Figma prototype bağlantısı üç ekranı yürür kılar. Görev: «sepete ekle, öde.» Süre ve hata not edilir.

Beğeni turu, görev turu değildir. Prototype olmadan geliştirici tahmin eder.`,
    trap: `Statik slayt «akış» diye sunulur. Tıklama yok, tıkanma görünmez.`,
    analogy: `prova: sahne yürünecek. Kostüm fotoğrafı oyun değildir.`,
    vaka: `üç ekran bağlantısız durur. Tıklanır senaryo ve bir görev ölçütü olmadan prototip bitmez.`,
    conclusion: `Akış, yürünebilir olmalıdır. Duvar haritası yetmez.

Bir sonraki bölümde seni erişilebilirlik barajı bekliyor.`,
  },
  {
    key: "ux-temel-11",
    order: 11,
    title: "Erişilebilirlik: kontrast, odak, etiket barajı",
    intro: `Kapıyı yalnız görenler için yapmak gibi; kontrast ve odak yoksa erişim kapanır. Web İçeriği Erişilebilirlik Kılavuzu (WCAG) kontrast, klavye odak, ad (label) ister. İkon-only düğme, kör kapıdır.

Figma’da kontrast eklentisi tahmin değildir; eşik yazılıdır. Odak halkası süs diye silinmez.`,
    trap: `Açık gri yazı «şık» diye kalır. Kursiyer «ben okuyorum» der. Sen okuman, herkesin okuması değildir.`,
    analogy: `bina rampası: merdiven « ben çıkıyorum» gerekçesiyle kalkmaz. Baraj, kapı hakkıdır.`,
    vaka: `kontrast düşük, odak yok, etiket yok. Üç kontrol maddesi yeşil olmadan teslim düşer.`,
    conclusion: `Erişim, barajdır. Baraj altı vitrin, kırık kapıdır.

Bir sonraki bölümde seni el teslimi bekliyor.`,
  },
  {
    key: "ux-temel-12",
    order: 12,
    title: "El teslimi: ölçü, not, kariyer vizesi eşiği",
    intro: `Marangoz teslim tutanağı olmadan mobilya bitmiş sayılmaz. El teslimi (handoff) aralık, tipografi, durum notu, jeton adıdır. Geliştirici tahmini, atölye kaybıdır.

Bu kapanış araştırma, Figma, jeton, prototip ve erişilebilirliği tek pakette toplar. Paket yoksa «Figma linki» teslim değildir. Eşik, sınav kapısının önündedir.`,
    trap: `«Figma’da var, bakarsınız.» Ölçü yazılmaz, hover durumu unutulur. Kod başka kapı üretir.`,
    analogy: `mobilya faturası: milim ve menteşe yazılıdır. «Güzel duruyor» teslim tutanağı değildir.`,
    vaka: `link vardır, not yoktur. Aralık / tipo / durum üç satırı olmadan el teslimi düşer.`,
    conclusion: `On iki bölüm tek cümlede: kanıt, iskelet, kalıp, baraj, tutanak.

Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.`,
  },
]);
