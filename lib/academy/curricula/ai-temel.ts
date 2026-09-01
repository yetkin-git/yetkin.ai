import {
  academyInstructorApplication,
  academyInstructorIntro,
  academyInstructorProblem,
  academyInstructorSummary,
  academyLessonDraft,
  type AcademyLessonDraft,
} from "@/lib/academy/curricula/types";

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
  return specs.map((spec) => {
    const intro = academyInstructorIntro(spec.title, spec.intro);
    const problem = academyInstructorProblem(spec.trap);
    const application = academyInstructorApplication(`${spec.analogy} ${spec.vaka}`);
    const summary = academyInstructorSummary(
      `${spec.title} becerisini`,
      spec.conclusion,
      spec.order >= 12 || /kapanış/iu.test(spec.title),
    );
    return academyLessonDraft(
      spec.key,
      spec.order,
      spec.title,
      `Giriş & Bağlam\n${intro}`,
      `Problem\n${problem}\n\nKod & Uygulama Mantığı\n${application}`,
      `Özet & Kazanım\n${summary}`,
    );
  }).map((draft) => ({ ...draft, format: "compact" as const }));
}

export const AI_TEMEL_LESSONS = lessons([
  {
    key: "ai-temel-1",
    order: 1,
    title: "Büyük Dil Modeli, token ve bağlam penceresi",
    intro: `Pazar tezgâhında tartının üst sınırı vardır; fazla malzeme sessizce yere düşmez, tartı «olmuyor» der. Büyük Dil Modeli (LLM) metni token’lara böler. Bağlam penceresi o tartının kefesidir. Pencere dolunca sessiz özet uydurmak, yere düşen kiloyu «tarttım» diye yazmaktır.

ChatGPT, Claude veya Gemini aynı fizik: tavan dolunca eski cümle kayar. Bu derste token ve pencereyi konuşuyoruz — sihir değil, kasa fişi gibi sayılır.`,
    trap: `Uzun sohbetin başını model «hatırlıyor» sanılır. Pencere taşınca unutur veya uydurur. Kursiyer sessiz özetle devam eder, kaynak kaybolur.`,
    analogy: `otobüs: koltuk dolunca ayakta kalan iner sanılmaz, inmek zorunda kalır. Pencere dolunca da eski koltuk boşalır.`,
    vaka: `bağlam dolunca model önceki kısıtı unutup serbest cevap basar. Tavan aşılınca özet uydurulmaz; iş bölünür veya bellek dışarı yazılır.`,
    conclusion: `Token sayılır, pencere sınırdır. Sınır dolunca dürüstçe durulur.

Bir sonraki bölümde seni üretim tarifi katmanları bekliyor.`,
  },
  {
    key: "ai-temel-2",
    order: 2,
    title: "Üretim tarifi katmanları: sistem, kullanıcı, biçim",
    intro: `Mutfakta aşçıbaşı kuralı, garson siparişi, tabak sunumu ayrıdır. Üretim tarifinde (prompt) sistem katmanı meslek ve yasak, kullanıcı katmanı iş, biçim katmanı çıktı kalıbıdır. Üçü tek paragrafa yığılırsa yasağı kimsenin duymadığı bir bağırış olur.

Sistem: «sır yapıştırma, uydurma». Kullanıcı: «bu tabloyu özetle». Biçim: «üç madde, kaynak satırı». ChatGPT veya Gemini kutusunda katmanlar ayrı durur.`,
    trap: `Tek kutuya hem yasak hem iş hem şema yazılır. Model yasağı iş sanır veya işi yasak sanır. Katman kayınca tarife yabancı el karışır.`,
    analogy: `noter: kanun maddesi, dilekçe, mühür ayrı kâğıtlarda durur. Tek kâğıda hepsini karalamak mührü bozar.`,
    vaka: `kursiyer tek paragrafta «JSON yaz ve şifre de ekle» der. Sistem yasağı ayrı, kullanıcı işi ayrı, biçim ayrı kalır.`,
    conclusion: `Tarif katmanlıdır. Yasağı işe karıştırmak mutfağı yakar.

Bir sonraki bölümde seni yapılandırılmış çıktı bekliyor.`,
  },
  {
    key: "ai-temel-3",
    order: 3,
    title: "Yapılandırılmış çıktı: JSON modu ve şema kapısı",
    intro: `Kasada fiş serbest cümle olmaz; kalem kalıba basar. JavaScript Nesne Gösterimi (JSON) modu ve şema, modelin «güzel cümle» kaçışını keser. «JSON gibi yaz» demek mod açmak değildir; şema satırı ve parse kapısı gerekir.

Geçersiz ceyson’da üretim kabul edilmez. required alan yoksa iş durur. OpenAI Playground veya API şema alanı, dilekçe değil kapıdır.`,
    trap: `«JSON gibi yaz» ile gelen metin tırnak kaçırır, parse patlar. Kursiyer «neredeyse JSON» deyince teslim sanır. Neredeyse, fiş değildir.`,
    analogy: `gişe: karekod okunmazsa bilet geçmez. «Karekod gibi bir şekil» turnikeyi açmaz.`,
    vaka: `model düz metin basar, JSON.parse kırılır. Şema modu ve parse başarısı olmadan sonraki adım çalışmaz.`,
    conclusion: `Şema kapıdır. Kapı açık değilse mutfak çalışmaz.

Bir sonraki bölümde seni few-shot ve ölçülebilir kabul bekliyor.`,
  },
  {
    key: "ai-temel-4",
    order: 4,
    title: "Few-shot: sabit örnek ve ölçülebilir kabul",
    intro: `Çırak üç doğru poşet görünce dördüncüyü uydurmaz, tarife bakar. Few-shot, işe birkaç mühürlü örnek bağlamaktır. Örnekler sabit durur; her seferinde değişen «ilham» regresyon doğurur.

Kabul ölçütü yazılıdır: alanlar, yasaklar, uzunluk. Beğeni tur tüketmez. Aynı girdi yarın aynı şemayı ister. Ölçü yoksa «güzel oldu» teslim değildir.`,
    trap: `Her istekte farklı örnek yapıştırılır. Model dünün yasağını unutur. Kursiyer «daha yaratıcı» der; kabul kayar.`,
    analogy: `okul karnesi: baraj 70 yazılıdır. Öğretmen «bugün 50 de yeter» derse belge yalan olur.`,
    vaka: `örnekler rastgele değişir, çıktı şeması kayar. Sabit few-shot + yazılı kabul olmadan tur sayılmaz.`,
    conclusion: `Örnek sabit, kabul ölçülür. İlham, kapı değildir.

Bir sonraki bölümde seni sır ve kişisel veri yasağı bekliyor.`,
  },
  {
    key: "ai-temel-5",
    order: 5,
    title: "Sır ve kişisel veri: hata anında kapalı üretim",
    intro: `Hastane kimlik fotokopisini herkese dağıtmaz. Uygulama Programlama Arayüzü anahtarı, T.C. kimlik, kart numarası tarife girmez. Hata anında emniyet (fail-closed): yasak düşünce üretim durur, «ortasını uydurayım» denmez.

ChatGPT kutusuna anahtar yapıştırmak, cüzdanı vitrine bırakmaktır. Reddetme cümlesi yazılıdır. Log’a sır düşmez.`,
    trap: `«Bir kere yapıştıralım, sonra sileriz.» Silmek, tarifenin geçmişini silmez. Kursiyer hata görünce boş çıktı yerine tahmin basar.`,
    analogy: `bankamatik: şifre ekranda kalmaz. Kalan şifre, sır tariftir.`,
    vaka: `tarif kutusuna anahtar yapışır, model üretir. Yasak iğne görünce üretim kapanır; uydurma orta değer yoktur.`,
    conclusion: `Sır tarife girmez. Şüphede üretim durur.

Bir sonraki bölümde seni etkileşimli tarif betiği bekliyor.`,
  },
  {
    key: "ai-temel-6",
    order: 6,
    title: "Etkileşimli tarif laboratuvarı: doğrula, üret, yeniden sor",
    intro: `Mutfakta tartıp pişirmek gibi: betik girdi alır, şemayı doğrular, sonucu yazar. Geçersiz ceyson’da çökmez; «Lütfen şemaya uyan çıktı ver.» diye yeniden sorar. Girdi boşsa üretim başlamaz.

Bu laboratuvar Temel tarifi kapatır: katman, şema, few-shot, sır yasağı tek döngüde. İnsan cümlesi, yığın izi değildir.`,
    trap: `Parse hatasında program iner. Kursiyer «bir daha çalıştır» der. Döngü yoksa gişe kepenk indirir.`,
    analogy: `gişe: «üç» deyince kızılmaz, sayı istenir. Şema hatası da kibarca yeniden sorulur.`,
    vaka: `geçersiz ceyson’da süreç çöker. try/parse, dürüst mesaj, yeniden sor — çökmek nezaket değildir.`,
    conclusion: `Laboratuvar, tarifi insana bağlar. Doğrulanmayan çıktı teslim değildir.

Bir sonraki bölümde seni tablo ve veri sözleşmesi bekliyor.`,
  },
  {
    key: "ai-temel-7",
    order: 7,
    title: "Veri sorusu: birim, payda ve tablo sözleşmesi",
    intro: `Pazarda tartısız tezgâha yüzde yetmiş asılmaz. Veri biliminde önce soru sözleşmesi durur: birim nedir, payda nedir, FAIL nedir. Tablo yokken modelden «ortalama» istemek, boş tezgâhtan kilo almaktır.

Pandas veya virgülle ayrılmış değer gelmeden üretim tarifi istatistik basmaz. Kimlik sütunu soruya girmez. «Yüzde» paydasız basılmaz.`,
    trap: `Model «yaklaşık yüzde 70» uydurur, tablo yoktur. Kursiyer cümleyi rapora yapıştırır. Kanıt satırı olmadan yüzde yalandır.`,
    analogy: `seçim sandığı: oy sayısı yazılmadan yüzde asılmaz. Payda yoksa manşet vitrin mankenidir.`,
    vaka: `soru belirsiz, tablo yok, model yüzde basar. Sözleşme: birim, payda, FAIL yazılı olmadan üretim durur.`,
    conclusion: `Soru, tabloyu çağırır. Tablo yoksa model susar.

Bir sonraki bölümde seni tablo temizliği bekliyor.`,
  },
  {
    key: "ai-temel-8",
    order: 8,
    title: "Tablo temizliği: eksik, tip ve tekrar",
    intro: `Kirli tabloyla güzel grafik, yanlış kararın süslü hâlidir. Eksik değer sıfır değildir; boşluk cehaleti itiraf eder. Tip object iken ortalama yalandır. Tekrar satır, aynı kiloyu iki kez tartmaktır.

Temizlik, üretim tarifinden önce gelir. Model kirli satırı «düzeltirim» diye uydurmaz; kural yazılı durur.`,
    trap: `Boş tutarı 0 yapmak, tartılmamış tezgâhı «bedava» yazmaktır. Kursiyer fillna(0) ile ortalama şişirir.`,
    analogy: `defter: boş satır «satmadım» demektir, «sıfır sattım» değil. Sıfır, iddiadır.`,
    vaka: `boş tutar 0 yapılır, ortalama düşer. Eksik ayrı işaretlenir; 0 yalnız gerçek sıfır satışta durur.`,
    conclusion: `Temizlik, rapordan önce gelir. Model, kiri gizlemez.

Bir sonraki bölümde seni dürüst özet ve grup bekliyor.`,
  },
  {
    key: "ai-temel-9",
    order: 9,
    title: "Dürüst özet: groupby, payda ve süs grafik yasağı",
    intro: `Mahalle kahvesini referandum sanmak gibi: n=8 iken yüzde yetmiş asılmaz. groupby özet çıkarır; payda yazılıdır. 3D pasta kanıt değildir. Model «etkileyici slayt» isterse payda yine sorulur.

Grafik kaynak satırı taşır. Metrik adı + formül + payda üçlüsü yoksa slayt düşer.`,
    trap: `Küçük n ile yüzde, vitrin mankenidir. Kursiyer modeli «daha çarpıcı yaz» diye zorlar. Çarpıcı, kanıt değildir.`,
    analogy: `anket: sekiz komşu, ülke kararı değildir. Payda konuşulmadan manşet asılmaz.`,
    vaka: `n=8 yüzde 70 basılır. Payda ve n yazılı olmadan özet yayımlanmaz; süs grafik reddedilir.`,
    conclusion: `Özet, paydayı konuşur. Süs, kapı değildir.

Bir sonraki bölümde seni kaynaklı getiri bekliyor.`,
  },
  {
    key: "ai-temel-10",
    order: 10,
    title: "Kaynaklı getiri: arama ile üretimi ayırmak",
    intro: `Arşivde önce dosyayı bulup sonra özet yazmak gibi: Artırılmış Geri Çapraz Sorgulama (RAG) aramayı üretimden ayırır. Getirici boş dönünce model genel bilgiyle doldurmaz. Kaynak satırı olmayan cevap teslim değildir.

Parça (chunk) ve örtüşme yazılıdır. «Ben biliyorum» uydurması, arşiv memurunun evrak uydurmasıdır.`,
    trap: `Getirici boş, model Wikipedia üslubu basar. Kursiyer «yine de cevap» der. Boş getiri, dürüst «belgede yok» ister.`,
    analogy: `noter arşivi: dosya yoksa «yok» yazılır, sahte evrak basılmaz.`,
    vaka: `retriever boş, model genel cümle basar. Üretim, kaynak yoksa durur.`,
    conclusion: `Önce getir, sonra konuş. Getiri yoksa sus.

Bir sonraki bölümde seni uydurma kesici bekliyor.`,
  },
  {
    key: "ai-temel-11",
    order: 11,
    title: "Uydurma kesici: kanıt satırı ve alıntı kapısı",
    intro: `Kaynaksız manşet güvenmez. Kaynaklı cevap da alıntısız basılmaz. Eşik altı skor, hata anında kapalıdır. «Belgede yok» dürüst cevaptır; tahmini doldurmak sahte evraktır.

Alıntı, sayfa veya parça kimliği taşır. Model «benzer bir şey vardı» deyince kapı kapanır.`,
    trap: `Düşük benzerlik skoru yine de cümle basar. Kursiyer eşiği «esnek tutalım» der. Esnek eşik, sahte mühürdür.`,
    analogy: `mahkeme: tanık yoksa hüküm uydurulmaz. Kanıt satırı olmadan iddia düşer.`,
    vaka: `skor eşiğin altında, model yine iddia basar. Eşik altı üretim durur; «belgede yok» yazılır.`,
    conclusion: `Kanıt yoksa cümle yoktur. Uydurma, kapı dışıdır.

Bir sonraki bölümde seni kapanış asistanı bekliyor.`,
  },
  {
    key: "ai-temel-12",
    order: 12,
    title: "Kapanış: kaynaklı asistan, tablo disiplini ve sınav",
    intro: `Arşiv memurunun evrak numarasıyla cevap vermesi gibi: kapanış asistanı tarif katmanı, şema, tablo temizliği ve kaynaklı getiri ile konuşur. Taşınabilir belge (PDF) yüklenir, parça bölünür, cevap alıntılıdır.

Kişisel veri tarife girmez. Paydasız yüzde basılmaz. Bu paket, sınav kapısının eşiğidir.`,
    trap: `PDF yüklenir, RAG yok, model genel özet basar. Kursiyer «okudu» sanır. Okumak, getiri ve alıntıdır.`,
    analogy: `memur: evrak numarası olmadan «biliyorum» demez. Asistan da numarası olmadan konuşmaz.`,
    vaka: `belge var, kaynak satırı yok, özet uçuşur. Kabul: şema, temizlik, getiri, alıntı. Dördü yoksa teslim yoktur.`,
    conclusion: `On iki bölüm tek cümlede: tarif dürüst, veri yazılı, cevap kaynaklıdır.

Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.`,
  },
]);
