import Link from "next/link";
import { ACADEMY_KVKK_DELETE_BUTTON_SUMMARY } from "@/lib/academy/kvkk-workspace";
import { ACADEMY_CHAT_MODEL_LIST } from "@/lib/academy/model-tendency-card";
import { OFFICE_AI_SEAL_PROOF } from "@/lib/copy/sem-keywords";

/**
 * SEO Tedavi (P1) — 01_office_ai kamuya açık "Eğitim Rehberi ve Önizleme" bloğu.
 * SSR Server Component: satın alma duvarını ihlal etmez.
 * Ders 1'in ilk %20'lik önizleme özeti + 5 altın KVKK kuralı + sınav/sertifika rehberi.
 * Tam ders gövdeleri, sesli anlatım ve sınav havuzu ödeme sonrası açılır.
 * H2'ler amiral niyet dizgilerini taşır (Kalite Puanı tutarlılığı).
 * T-01 — kamu vaadi mühürlü müfredat kapılarıyla aynıdır.
 * T-02 — mühür izleme + barajdır; saha dosyası sunucuda kontrol edilmez.
 */
export function OfficeAiGuidePreview() {
  return (
    <section
      aria-labelledby="office-ai-guide-heading"
      data-office-ai-guide=""
      className="space-y-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8"
    >
      <div className="max-w-3xl space-y-3">
        <p className="room-kicker text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--safir-deep)]">
          Eğitim rehberi ve önizleme
        </p>
        <h2
          id="office-ai-guide-heading"
          className="text-pretty text-2xl font-semibold tracking-tight text-[var(--foreground)]"
        >
          Excel yapay zeka eğitimi: A1&apos;den temiz tabloya (Ders 1 önizleme)
        </h2>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Bu rehber, iş hayatında yapay zekâ eğitiminin kamuya açık özetidir. Ofiste her gün karşına
          çıkan dağınık Excel tabloları, bitmeyen e-postalar, slayt yetiştirme telaşı ve Word
          belgeleri sekiz derste adım adım işlenir. Excel&apos;de temiz veri ve Copilot/ataş,
          Gmail&apos;de yerleşik Gemini, Word belgesi inceleme, KVKK maskeleme ve haftalık Cuma
          rutini sesli anlatımla kilitlenir. Aşağıdaki önizleme, birinci dersin giriş bölümünün kısa
          bir özetidir; tam ders metinleri, sesli anlatım ve sınav soruları satın alma sonrasında açılır. Rehberi okuduktan sonra müfredatın sana uygun olduğuna karar verirsen sayfadaki
          satın alma alanından eğitimi başlatabilirsin. Satın alma sonrası oynatma listesinin
          tepesinde «Başlamadan Önce» rozetli bir hazırlık şeridi durur: hesap açma, ücretsiz ile
          ücretli farkı, sohbet ekranı, ilk istem ve Türkçe mi İngilizce mi yazılacağı. Bu şerit
          sekiz mühürlü dersin ve sınav yolunun dışındadır.
        </p>
      </div>

      <div className="max-w-3xl space-y-4">
        <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
          Dağınık tablo neden seni yavaşlatır?
        </h3>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Ofiste saatlerini alan o rutin işi düşün. Bir rapordan kopyalanıp sana iletilen bir liste
          gelir ve senden acil bir analiz istenir. Ancak sayfayı açtığında hiçbir şey yerli yerinde
          değildir: birkaç satır boş bırakılmış, bazı başlıklar hücre birleştirme sevdası yüzünden
          kaymış, sayılar sola yaslanmış, tarihler birbirine karışmıştır. Böyle bir tablo gördüğünde
          genellikle tek tek hücreleri düzeltmeye çalışırsın. Oysa bu yaklaşım saatleri yer, çünkü
          yapay zekâ hücre hücre değil, başlık ve sütun düzenini arayarak okur. Tablonun dilini
          biraz sadeleştirirsen, o karmaşayı bir çırpıda anlar. Birbirine girmiş hücreler modelin
          mantığını bozar, aralardaki boş satırlar ise satırların devamlılığını keser. Bu yüzden
          dağınık tabloyu yapay zekâya aktarmadan önce her verinin ait olduğu yer belli olmalıdır.
          Bu dersteki yükleme, kişi adı ve IBAN taşımayan, anonimize edilmiş temiz bir örnek tablo
          üzerinden yapılır; gerçek müşteri dosyanı henüz yüklemezsin.
        </p>
        <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
          A1 kuralı: tablonun kapısı nerede başlar?
        </h3>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Bir tablonun okunması her zaman en sol üst köşeden kurulur. A1 hücresi boşsa ya da
          alakasız bir genel başlıkla birleştirilmişse, yapay zekâ tablonun nereden başladığını
          çözemez. Yapman gereken ilk şey, sayfanın en tepesindeki birleştirilmiş başlıkları
          kaldırıp A1 hücresine ilk gerçek sütun adını yazmaktır. Oraya Müşteri Adı ya da Sipariş No
          gibi net bir sütun başlığı yerleştirdiğinde, model tüm tabloyu doğru okumaya başlar. Ürün,
          Tarih ve Tutar gibi başlıkların hepsi birinci satırda yan yana dizilmelidir. A1 hücresi
          doğru kurgulanmamış bir yapıya ne kadar gelişmiş bir komut verirsen ver, alacağın sonuç
          eksik kalır; çünkü yapay zekâ veriyi satır ve sütun hiyerarşisiyle tartar. A1 kuralı
          kurulduğunda dakikalarca sürecek kafa karışıklığı baştan düşer ve veri komuta hazır hale
          gelir. Şüpheli bir hücreye gelip F2 tuşuna basarak gizli kesme işaretini kontrol etmek de
          bu düzenin parçasıdır; ayrıca her zaman orijinal dosyayı koruyup temiz kopyanı yan
          sekmede oluşturursun.
        </p>
        <h3 className="text-base font-semibold tracking-tight text-[var(--foreground)]">
          Üç kapı: dosyayı modele nasıl verirsin?
        </h3>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Veriyi yapay zekâya vermenin sırası sabittir, çünkü önce en yerinde yolu denersin.
          Birinci kapı, Copilot lisansın varsa Excel şeridinden doğrudan okutmaktır. Copilot
          düğmesi varsa Excel dosyanın içindeki hücreleri doğrudan düzenler. İkinci kapı, lisans
          yoksa dosyayı ataş simgesinden {ACADEMY_CHAT_MODEL_LIST} sohbetine yüklemektir.
          Copilot&apos;ın yoksa dosyayı ataşla sohbete yüklersin; yapay zekâ orijinal dosyanı
          değiştiremez, ancak sana verileri temizlenmiş yepyeni bir tablo verir. Sen de o tabloyu
          kopyalar, Excel&apos;ine yapıştırırsın. Üçüncü kapı ise son çaredir: isim ve telefonu maskeleyip kısa bir özeti yapıştırmak. Ham
          tabloyu ekran görüntüsüyle taşımak öğretilen yol değildir; çünkü ekran görüntüsü hücreleri
          bozar ve A1 kuralını kaybettirir. Tür karmaşasını ortadan kaldırmak da bu adımın parçasıdır:
          aynı sütunun içinde hem 1.200 TL, hem 1200, hem de metin şeklinde yazılmış bin iki yüz
          durursa model hangisinin tutar olduğunu karıştırır. Modele günlük konuşma diliyle, Tutar
          sütunundaki tüm değerleri yalnızca sayı olacak şekilde tek tip yap dediğinde, tüm bu
          farklılıklar tek bir standarda oturur. Fazladan boşluklar temizlenir, tarihler gün-ay-yıl
          düzenine girer. Önizleme burada biter; birleştirilmiş hücreleri çözme, boş satırları silme
          ve sayı formatını standartlaştırma komutlarının tam uygulaması dersin devamındadır.
        </p>
      </div>

      <div className="max-w-3xl space-y-4">
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-[var(--foreground)]">
          Ofiste ChatGPT kullanımı: 5 altın KVKK kuralı
        </h2>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Tabloyu düzenlemiş olman, onu yapay zekâya yükleyebileceğin anlamına gelmez. Hücreler
          düzgün dizilmiş olsa bile satırların içinde hâlâ gerçek insanların adı, telefonu ve IBAN
          bilgisi duruyor olabilir. İkinci dersin tamamı bu sınıra ayrılmıştır; aşağıdaki beş kural
          o dersin kamuya açık özetidir ve ofiste chatgpt kullanımı için her gün uygulayacağın
          refleksleri kurar.
        </p>
        <ol className="list-decimal space-y-3 pl-5 text-sm leading-7 text-[var(--muted)]">
          <li>
            <strong className="font-semibold text-[var(--foreground)]">
              Ham liste asla yüklenmez.
            </strong>{" "}
            Müşteri adı ve telefonu birlikte, açık IBAN, maaş tablosu ve prim, T.C. Kimlik No, hasta
            veya öğrenci kaydı, sözleşmedeki ceza maddesiyle birlikte kişi adı ve CRM ekran
            görüntüsü; bunların hiçbiri açık yapay zekâ ekranına ham haliyle gitmez. ChatGPT,
            Gemini, Grok ve benzeri ister ücretsiz ister ücretli tüm açık sohbet ekranlarına
            müşteri listesi, IBAN, T.C. kimlik numarası gibi ham verileri yükleyemezsin.
            Aboneliğin ücretli (Plus/Pro/Team) olsa bile açık sohbete ham kişisel veri ve şirket
            sırrı atılamaz. Ücretli üyelik modeli eğitmese de veri sunucuya gider. Yüklemeden önce
            her zaman maskeliyoruz. Kapı yalnız
            aktarım yoludur: yerleşik panelde de, ataşla da, dış sohbette de kural aynıdır. Şirket
            sırrı da aynı masadadır; fiyat listesi, maliyet, henüz açıklanmamış kampanya ve rakip
            notu kişisel veri değildir ama rakipten sakladığın bilgidir ve ham haliyle açık sohbete
            gitmez. Kamu kataloğu, yani ürün adı ve genel stok cümlesi gidebilir; aynı satırda kişi
            adı belirdiği anda durursun.
          </li>
          <li>
            <strong className="font-semibold text-[var(--foreground)]">
              Yüklemeden önce maskele.
            </strong>{" "}
            Maskelemek silmek değildir. Satırı tamamen silersen yapay zekâ tablonun mantığını da
            kaybeder; oysa takma değerle değiştirirsen model sütun mantığını görür, gerçek kimliği
            görmez. Ayşe Kaya yerine Müşteri A yaz, IBAN yerine MASKELİ_IBAN yaz, telefonu kırp,
            soruyu bırak. Modele şunu söylersin: bu üç satır maskelidir, ad yok, telefon yok; Bölge
            bazında üç maddelik özet iste. Sınır komutun içinde durur ve model neyi bilmediğini net
            duyar.
          </li>
          <li>
            <strong className="font-semibold text-[var(--foreground)]">
              Maskeleme ile örnek satır ayrı tekniktir.
            </strong>{" "}
            Maskeleme, gerçek satırda adı ve IBAN’ı takma değerle değiştirmektir. Tutar yerinde
            kalırsa özeti o maskeli tablodan alırsın. Örnek satır başka iştir: uydurulmuş üç satır
            yalnız sütun şeklini öğretir, bin satırın toplamını ve yönünü vermez. Ham müşteri
            dökümü de gerekmez. Fazla gerçek isim modeli daha zeki yapmaz; daha fazla insanı
            riske atar.
          </li>
          <li>
            <strong className="font-semibold text-[var(--foreground)]">
              Önce şirket, sonra veri, sonra yol.
            </strong>{" "}
            Şirketinin onayladığı araç varken ham listeyi dış sohbete taşımana gerek yoktur.
            Onaylı araç yoksa kutuyu kişisel hesaba taşıma. Maskeli kısa özet yaz; bütün listeyi
            değil. Ham kutu yapıştırmak bu özet değildir. Ekran görüntüsü zinciri de değildir.
            İkisi de maske koymadan ham kimliği dışarı taşır.
          </li>
          <li>
            <strong className="font-semibold text-[var(--foreground)]">
              Silmek, yüklemiş olmanı geri almaz.
            </strong>{" "}
            {ACADEMY_KVKK_DELETE_BUTTON_SUMMARY} Lisans ve veri işleme sözleşmesi tek
            başına yeterli değildir; aydınlatma, açık rıza ve VERBIS zeminini kurmadan ham kimlik
            hiçbir panele girmez. Bu yüzden yüklemeden önce maske kuralını en başta kilitlersin; aksi
            halde ataş refleksi ham kimliği de götürür.
          </li>
        </ol>
      </div>

      <div className="max-w-3xl space-y-4">
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-[var(--foreground)]">
          Word yapay zeka, Gmail ve PowerPoint: dilekçe, rapor ve slayt
        </h2>
        <p className="text-sm leading-7 text-[var(--muted)]">
          Excel ve KVKK adımlarından sonra müfredat ofisin geri kalanına açılır. Word yapay zeka
          dersinde Word ataş ile belge analizi yapılır: uzun belgeyi ataşla yükleyip sözleşme,
          dilekçe ve rapor işini ayrı istemlerle çözersin; tek dev komut yerine her belge türüne
          kendi sorusunu sorarsın. Temiz ve maskeli tablodan üç maddelik yönetim özeti çıkarma
          dersi, sayfalarca dökümü yöneticinin tek bakışta okuyacağı eylem cümlesine indirmeyi
          öğretir. Metinden slayta dersinde düz metni slayt başına tek fikir ve görsel yönlendirme
          kuralıyla aktarırsın; kalabalık paragraflar yerine konuşan başlıklar kurarsın. E-posta
          tarafında önce gelen kutusu sıfırlama ritüeli gelir: etiketle, taslağı hazırla, insan
          onayı al, arşivle. Sonra Gmail&apos;de yerleşik Gemini ile yerinde aksiyon listesi
          çıkarma ve Outlook Copilot ile aynı disiplini kurma adımları izler. Yapay zekâ
          yanıldığında ise hata avı refleksi devreye girer: TOPLA ile sayıyı kilitler, kaynak
          evrakla çapraz kontrol eder, modele körü körüne güvenmezsin. Kapanış dersi olan haftalık
          Cuma rutini, haftada otuz dakikayı takvime bağlar: on dakika Excel, on dakika slayt, on
          dakika kutu. Böylece eğitim bitince elinde tek seferlik bir heves değil, her hafta işleyen
          bir sistem kalır.
        </p>
      </div>

      <div className="max-w-3xl space-y-4">
        <h2 className="text-pretty text-xl font-semibold tracking-tight text-[var(--foreground)]">
          Sertifika ve sınav: 70+ baraj nasıl geçilir?
        </h2>
        <p className="text-sm leading-7 text-[var(--muted)]">
          {OFFICE_AI_SEAL_PROOF} Sınav, sekiz dersin tamamı bitirilmeden açılmaz; baraj 70 puandır ve
          satın alma tek başına belge basmaz. Sınav otuz dakika sürer, on sorudan oluşur ve süre
          dolduğunda son gönderim alınır. Barajı geçtiğinde belgen Kariyer sayfana işlenir ve herkese
          açık doğrulama sicilinden kontrol edilebilir. Not: arama motoruna{" "}
          <span>yanlışlıkla &quot;yapay zeka sertifikasi&quot; yazanlar da aynı belgeyi arıyor;</span>{" "}
          sicildeki resmi ad yapay zeka sertifikasıdır ve doğrulama sayfasında bu adla görünür.
          Satın aldığın eğitim kütüphanende 365 gün kalır; dersleri kendi tempoda bitirir, hazır
          olduğunda testi başlatırsın. Barajın altında kalırsan belge basılmaz ama yeniden
          deneyebilirsin; kimseye sahte rozet eklenmez. Sertifikan doğrulandığında kariyer vizesi
          damgan da Pasaport siciline işlenir. Hazırsan sayfadaki satın alma alanına dönüp eğitimi
          başlatabilirsin; soruların için aşağıdaki sık sorulanlar bölümü ve doğrulama sayfası her
          zaman açıktır.
        </p>
        <p className="text-sm leading-7">
          <a href="#satin-al" className="font-semibold text-[var(--safir)] hover:underline">
            Eğitimi başlatmak için satın alma alanına dön
          </a>{" "}
          <span className="text-[var(--muted)]">
            veya{" "}
            <Link href="/academy/dogrula" className="text-[var(--safir)] hover:underline">
              sertifika doğrulama sicilini incele
            </Link>
            .
          </span>
        </p>
      </div>
    </section>
  );
}
