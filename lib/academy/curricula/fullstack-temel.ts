import { academyGrowthLessons } from "@/lib/academy/curricula/growth-draft";

export const FULLSTACK_TEMEL_LESSONS = academyGrowthLessons([
  {
    key: "fullstack-temel-1",
    order: 1,
    title: "İstemci-sunucu ve Hipermetin Aktarım Protokolü sözleşmesi",
    intro: `Restoranda garson siparişi alır, mutfak pişirir; fiş dönmeden «yemek geldi» denmez. Tarayıcıdaki düğme de odur: istemci (client) ister, sunucu (server) yanıt basar. Hipermetin Aktarım Protokolü (HTTP) o fiştir — yöntem, adres, durum kodu, gövde. İki yüzler «mutfak kabul etti», dört yüzler «fiş eksik», beş yüzler «ocak yandı».

Ağ sekmesi kasa kamerasıdır. Durum kodunu okumadan yeşil tik, müşteriye yalan söylemektir. Bu ilk bölümde istek-yanıt çiftini dürüst okumayı konuşuyoruz.`,
    trap: `Ekran «sepete eklendi» der, ağda beş yüz üç durur. Kursiyer arayüze bakar, fişi okumaz. Sözleşme kırılmıştır.`,
    analogy: `kasa fişi: tutar ve fiş numarası birlikte durur. Fişsiz «ödedim» sözü, restoranın defterini bozar.`,
    vaka: `düğme yeşil basar, ağ sekmesinde 503 durur. Durum kodu ve gövde birlikte okunmadan «iş bitti» denmez.`,
    conclusion: `İstek ve yanıt bir çifttir. Durum kodu, kasa fişindeki mühürdür.

Bir sonraki bölümde seni JavaScript değişken ve fonksiyon bekliyor.`,
  },
  {
    key: "fullstack-temel-2",
    order: 2,
    title: "JavaScript: değişken, tip ve dürüst fonksiyon",
    intro: `Sipariş fişindeki «üç» yazısı üç porsiyon değildir; etiket metindir. JavaScript’te let ve const kutu açar. const yeniden atanmaz. typeof cins sorar. adet = "3" iken çarpım birleştirme veya NaN tuzağına düşer; Number veya parseInt dürüst dönüştürür.

function toplam(a, b) { return a + b; } tarifdir. return yoksa undefined döner. İsimler: qty, priceKurus, cartItem. var eski tezgâhtır; bu laboratuvarda kullanılmaz.`,
    trap: `"3" * 2 bazen 6 basar, "3" + 2 "32" basar. Kursiyer «çalıştı» deyince tipi sorgulamaz. Metro kartındaki bakiye sayı, uyarı yazısı metindir.`,
    analogy: `etiketsiz kavanoz: recel mi tuz mu bilmeden karıştırmazsın. typeof ve Number, kapağı açmadan cins sorar.`,
    vaka: `adet = "3" iken adet + 1 "31" üretir. Number(adet) ile tamsayıya çevrilmeden istek atılmaz.`,
    conclusion: `Tip, etikettir. Fonksiyon, poşettir: alır, verir, tezgâhı kirletmez.

Bir sonraki bölümde seni TypeScript derleme kapısı bekliyor.`,
  },
  {
    key: "fullstack-temel-3",
    order: 3,
    title: "TypeScript: arayüz, derleme ve as any yasağı",
    intro: `Menüde çorba yazıp mutfağa sütlaç gitmek gibi; TypeScript derlemede sözleşmeyi mühürler. interface CartItem { qty: number; sku: string } fiş kalıbıdır. tsc kapıdadır: yanlış tip paketlenmez. «as any» ile susturmak kapıyı açmaz, hatayı erteler.

string qty, number bekleyen yere girmez. Optional alan ? ile dürüstçe yokluğu yazar. Derleme yeşil değilse tarayıcıya basılmaz.`,
    trap: `as any, görevlinin gözünü kapatmaktır. Kursiyer «kırmızı gitti» deyince teslim sanır. Kırmızı, müşteriyi koruyan ışıktır.`,
    analogy: `noter mührü: eksik kimlikle pasaport basılmaz. Derleyici, o noterdır.`,
    vaka: `CartItem.qty string gelir, tsc kızar. as any ile susturulur, çalışma anında NaN doğar. qty: number zorunlu kalır.`,
    conclusion: `Sözleşme derlemede mühürlenir. any, mühür sökmektir.

Bir sonraki bölümde seni Belge Nesne Modeli ve dürüst geri bildirim bekliyor.`,
  },
  {
    key: "fullstack-temel-4",
    order: 4,
    title: "Belge Nesne Modeli: olay, durum ve dürüst geri bildirim",
    intro: `Garson salona hem «pişiyor» hem «afiyet» diye bağırmaz. Belge Nesne Modeli (DOM) düğmeleri, metinleri, disabled bayrağını tutar. addEventListener tıklamayı duyar. loading iken button.disabled = true ikinci siparişi yutar.

textContent dürüst cümle basar. Hem başarı hem hata sınıfını aynı anda yakmak, sarı ve kırmızı ışığı birlikte yakmaktır. Meşgulken tıklama yutulur, kuyruk şişmez.`,
    trap: `Hata olunca eski «sepete eklendi» yazısı yerinde kalır. Kursiyer durumu silmez. Tek metin yuvası, tek gerçek cümle taşır.`,
    analogy: `trafik ışığı: kırmızı ve yeşil birden yanmaz. Ekran da tek cümle konuşur.`,
    vaka: `loading iken ikinci tıklama ikinci Post atar. disabled ve tek durum metni olmadan arayüz yalan söyler.`,
    conclusion: `Arayüz, tek cümle ve tek meşgul bayrağı ile konuşur.

Bir sonraki bölümde seni fetch ve hata yansıtma bekliyor.`,
  },
  {
    key: "fullstack-temel-5",
    order: 5,
    title: "fetch: yanıt okuma ve dürüst hata yansıtma",
    intro: `Kargo takip «yolda» iken «teslim edildi» yazmak alıcıyı kandırır. fetch adres ister, Promise döner. res.ok false iken yeşil basılmaz. await res.json() gövdeyi okur; boş gövdede parse patlar, try/catch insan cümlesi basar.

HTTP 503’te «sepete eklendi» yalandır. Durum kodu ekrana yansır: «Sunucu meşgul, tekrar dene.» Ağ hatası ile iş kuralı hatası ayrılır.`,
    trap: `fetch başarılı diye res.ok true sanılır. Ağ bağlantısı kuruldu, mutfak reddetti. ok kontrolü olmadan json okumak, fişsiz yemek iddiasıdır.`,
    analogy: `kargo uygulaması: «yolda» ve «teslim» aynı anda yazılmaz. !res.ok iken yeşil tik yasaktır.`,
    vaka: `sahte 503’te ekran yeşil basar. res.ok false iken dürüst hata metni durur; başarı sınıfı eklenmez.`,
    conclusion: `fetch, fişi getirir. ok kapısı kapanmadan kutlama olmaz.

Bir sonraki bölümde seni tip güvenli istemci laboratuvarı bekliyor.`,
  },
  {
    key: "fullstack-temel-6",
    order: 6,
    title: "Tip güvenli istemci laboratuvarı: form, fetch, dürüst yanıt",
    intro: `Kasada barkod okutulmadan fiş basılmaz. Bu laboratuvar TypeScript qty, Belge Nesne Modeli ve fetch’i birleştirir. Boş adetle istek atılmaz. Number.isFinite kontrolü Sayı Değil değerini keser. !res.ok’ta durum kodu yazılır.

Kontrollü girdi: value ve onChange. Çift tıklama disabled ile yutulur. Başarı gövdesi şemaya uymazsa «beklenmeyen yanıt» denir, uydurma sepet çizilmez.`,
    trap: `qty boş string iken Number("") 0 olur, istek gider. Kursiyer sıfır adedi «geçerli» sanır. trim sonrası boşluk reddedilir.`,
    analogy: `kasa: barkod yoksa fiş yok. Boş kutu, sıfır ürün değildir; henüz tartılmamış tezgâhtır.`,
    vaka: `qty boşken Post atılır. İstek ancak geçerli tamsayı adette çıkar; !res.ok dürüst kod basar.`,
    conclusion: `İstemci laboratuvarı, sözleşmeyi tarayıcıda mühürler.

Bir sonraki bölümde seni React bileşen ve props bekliyor.`,
  },
  {
    key: "fullstack-temel-7",
    order: 7,
    title: "React bileşen ve props: tek yönlü veri sözleşmesi",
    intro: `Restoran menü kartındaki fiyat kutunun içinden uydurulmaz; ebeveyn verir, çocuk okur. React fonksiyon bileşeni JSX döner. props ebeveynin fiyatisidir. TypeScript Props tipi title: string, priceKurus: number zorunlu kılar. Çocuk title’ı mutasyona uğratmaz; onChange ile yukarı haber verir.

Tek yönlü veri, gizli yan kapı yok. Aynı kart üç yerde duruyorsa üç kez yalan uydurulmaz; tek kaynak ebeveyndedir.`,
    trap: `Çocuk props.title = "x" yazar. React bunu yasaklamaya çalışır; kaçırılırsa kaynak dağılır. Dürüst yol: ebeveyn state, çocuk gösterim.`,
    analogy: `menü kartı: fiyat mutfaktan gelir, garson kartı silmez. Silmek, salonda ayrı bir tarife açmaktır.`,
    vaka: `ProductCard içinde title mutasyonu. Props salt okunur kalır; değişiklik onRename ile yukarı çıkar.`,
    conclusion: `Bileşen, verilen sözü gösterir. Söz ebeveyndedir.

Bir sonraki bölümde seni durum makinesi ve çelişen bayrak tuzağı bekliyor.`,
  },
  {
    key: "fullstack-temel-8",
    order: 8,
    title: "Durum makinesi: çelişen bayrak yerine tek faz",
    intro: `Aynı masada hem «ödeme alındı» hem «kart reddedildi» fişi basılmaz. useState ile üç doğru-yanlış (isLoading, isError, isSuccess) birden tutulursa yasak birleşimler doğar. Tek Gerçek Kaynak (SSOT) bir fazdır: idle | submitting | success | error.

useReducer geçişi yazılı kılar: SUBMIT yalnız idle’dan çıkar. submitting iken ikinci dispatch yutulur. Ekran fazı okur, üç ışığı birden yakmaz.`,
    trap: `isLoading true ve isSuccess true aynı anda. Kursiyer «ikisi de lazım» der. Işık çelişir, kullanıcı ne yapacağını bilemez.`,
    analogy: `kasa fişi tek kutu: boş, alındı, pişti, iptal. Hem pişti hem iptal yazılmaz.`,
    vaka: `üç bayrak çelişir, hem spinner hem yeşil tik. Faz makinesi tek değer taşır; reducer yasağı yazılıdır.`,
    conclusion: `Durum, tek fazdır. Çelişen bayrak, kırık fiştir.

Bir sonraki bölümde seni Next.js sayfa yönlendirmesi bekliyor.`,
  },
  {
    key: "fullstack-temel-9",
    order: 9,
    title: "Next.js App Router: adres, sayfa ve dürüst boş hata",
    intro: `Masa numarası adrestir; «aşağıdayım» iddiası bilet değildir. Next.js App Router dosya yolunu adrese bağlar. app/cart/page.tsx /cart sayfasıdır. Link istemci geçişidir; ham <a> tam yenileme olabilir. params kimliği adresten okur.

Boş sepet «ödeme başarılı» iskeleti basmaz. bulunamayan sku dürüst 404 sayfasıdır. loading.tsx iskelet, error.tsx düşüş — ikisi birden yeşil kutlama değildir.`,
    trap: `/cart boşken ödeme başarılı şablonu. Kursiyer «güzel dursun» der. Adres yalan söyler.`,
    analogy: `bilet: koltuk numarası kapıdadır. «Ben içerideyim» sözü turnikeyi açmaz.`,
    vaka: `boş sepet ödeme başarılı çizer. Sayfa sözleşmesi boş ve hata durumunu ayrı basar.`,
    conclusion: `Adres çubuğu, masanın numarasıdır. Sayfa o numaraya sadık kalır.

Bir sonraki bölümde seni Express ve Zod kapısı bekliyor.`,
  },
  {
    key: "fullstack-temel-10",
    order: 10,
    title: "Express ve Zod: ara katman sırası ve şema kapısı",
    intro: `Mutfakta fiş önce, ocak sonra gelir. Express’te json gövde ayrıştırıcısı, sonra doğrulama, sonra işleyici durur. Sıra tersine çevrilirse tencere boş kalır. Zod safeParse şüphede reddeder; qty: -1 dört yüz ve issues döner.

next(err) hata ara katmanına düşer. İki yüz, şemasız gövdeye basılmaz. Node.js burada kapı görevlisidir; React vitrindir.`,
    trap: `handler gövdeyi doğrulamadan yazar. Şemasız 200 açık kapıdır. Kursiyer «hızlı prototip» der; üretim o kapıdan hırsız alır.`,
    analogy: `eksik sipariş fişi mutfağa girmez. Zod, o fiş kontrolüdür.`,
    vaka: `qty: -1 iki yüz döner. safeParse başarısızken 400 + issues durur; işleyici çalışmaz.`,
    conclusion: `Kapı sırası ve şema, mutfağı korur.

Bir sonraki bölümde seni parametreli PostgreSQL bekliyor.`,
  },
  {
    key: "fullstack-temel-11",
    order: 11,
    title: "PostgreSQL: parametreli sorgu ve enjeksiyon yasağı",
    intro: `Tarif ayrı, malzeme ayrı durur. PostgreSQL’de $1 yer tutucusu malzeme kutusudur. Dizgi birleştirmeli Yapılandırılmış Sorgu Dili enjeksiyon kapısı açar. Şema CHECK ile negatif adedi reddeder.

Repository katmanı sorguyu rotadan saklar. Rotaya ham SQL yapıştırmak, hesabı tezgâhta kesmektir. user_id oturumdan gelir, gövdeden «ben şu kişiyim» iddiası yetmez.`,
    trap: `Kullanıcı kimliğini sorgu metnine yapıştırmak enjeksiyon kapısı açar. Kursiyer «benim testimde çalıştı» der. Parametre bağlanmadan yeşil tik yoktur.`,
    analogy: `noter: kalıp metin ayrı, kimlik kutusu ayrı. Kutuya yazılan cümleyi değiştirmez.`,
    vaka: `kullanıcı kimliği birleştirmeli sorguya girer. $1 bağlanır; birleştirmeli cümle reddedilir.`,
    conclusion: `Sorgu tariftir, değer parametredir. Depo, tezgâhı kirletmez.

Bir sonraki bölümde seni mühürlü sepet teslimi bekliyor.`,
  },
  {
    key: "fullstack-temel-12",
    order: 12,
    title: "Kapanış: sepet API’si, dürüst hata ve sınav eşiği",
    intro: `Marketin kasa, stok ve fişi aynı defterde kapanmadan «sattık» denmez. Bu kapanış Zod, jeton kapısı, parametreli yazma ve TestClient’ı bir araya getirir. BEGIN ile iki yazma ya hep ya hiç. Beş yüzde ok:true basılmaz.

İstemci faz makinesi, sunucu şema kapısı, depo parametresi aynı sözü konuşur. Yeşil tik ancak bu üçü hizalanınca basılır. Bu eşik, sınav kapısının önündedir.`,
    trap: `«Benim makinemde geçti» sürekli entegrasyon değildir. TestClient dört yüz / dört yüz bir / iki yüz bir üçlüsünü her sabah koşmazsa teslim sözdür.`,
    analogy: `akşam kasası: stok ve fiş aynı defterde kapanır. Biri eksikse «sattık» yalandır.`,
    vaka: `Zod yok, jeton yok, birleştirmeli sorgu var, ekran yeşil. Ustalık paketi dört kapı ister: şema, kimlik, işlem, test.`,
    conclusion: `On iki bölüm tek cümlede: dürüst HTTP, tip, React, Next, Express, parametreli depo.

Sınavda seni baraj 70 bekler; belge yalnız o kapıdan basılır.`,
  },
]);
