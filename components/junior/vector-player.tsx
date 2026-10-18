"use client";

import { useCallback, useEffect, useRef, useState, type ReactElement } from "react";
import { JuniorHintBox } from "@/components/junior/hint-box";
import { JuniorPilotPlayer } from "@/components/junior/pilot-player/JuniorPilotPlayer";
import { JuniorPlayerControls } from "@/components/junior/player/controls";
import { resolveJuniorPlayback } from "@/lib/junior/pilot-engine/playback";
import { JuniorLessonDecision } from "@/components/junior/player/lesson-decision";
import { JuniorPauseBanner, JuniorStarQuestion } from "@/components/junior/player/pause-banner";
import { JuniorStepArt } from "@/components/junior/player/step-art";
import { useJuniorPlayback } from "@/components/junior/player/use-junior-playback";
import { useJuniorWarmupGate } from "@/components/junior/player/use-junior-warmup-gate";
import { JuniorWarmupCassette } from "@/components/junior/player/warmup-cassette";
import {
  JuniorScenePropProvider,
  juniorSceneProps,
} from "@/components/junior/player/scene-ui";
import {
  applyJuniorNicknameOpening,
  juniorHintBody,
  juniorHintKindFromCaption,
  juniorLessonGreeting,
} from "@/lib/junior/content-rules";
import {
  completeMicroStep,
  mergeWatchedScenes,
  readMicroProgress,
  writeMicroProgress,
  type MicroProgressRecord,
} from "@/lib/junior/micro-progress";
import { playJuniorHintEffect } from "@/lib/junior/hint-effect";
import { juniorLessonNote } from "@/lib/junior/lesson-note";
import type { MicroLessonPause } from "@/lib/junior/micro-lesson";
import { juniorMarkerAt } from "@/lib/junior/player-clock";
import type { JuniorVectorScene } from "@/lib/junior/types";
import {
  JUNIOR_VOICE_PREPARING_LABEL,
  juniorLessonAudioSrc,
  juniorLessonLocalLockedAudioPath,
} from "@/lib/junior/voice";

type Beat = { caption: string };

const MATH_FALLBACK: readonly Beat[] = [
  { caption: "Merhaba. Bugünkü matematik sahnesi açıldı." },
  { caption: "Günlük örnekle konu bağlandı." },
  { caption: "Kavram bir cümleyle söylendi." },
  { caption: "Tanım parçaları ekranda durdu." },
  { caption: "Çizim adım adım kuruldu." },
  { caption: "Örnek sayı ile işlendi." },
  { caption: "İkinci örnek pekiştirdi." },
  { caption: "Dikkat noktası veya altın ipucu ayrıldı." },
  { caption: "Günlük kullanımla bağ kuruldu." },
  { caption: "Bugün Neler Öğrendik? İlk özet." },
  { caption: "Bugün Neler Öğrendik? İkinci özet." },
  { caption: "Bugün Neler Öğrendik? Üçüncü özet." },
];

const BEATS: Record<JuniorVectorScene, readonly Beat[]> = {
  fraction: [
    { caption: "Bir bütün duruyor. Henüz bölünmedi." },
    { caption: "Kesir, bütünün eşit parçasıdır." },
    { caption: "Bütün dört eşit parçaya ayrıldı." },
    { caption: "Dört parçanın boyu aynıdır." },
    { caption: "Bir parça seçildi. Seçilen parça paydır." },
    { caption: "Pay 1 üstte durur. Payda 4 altta durur." },
    { caption: "Soru: Dört dilimden biri alındı. Kesir nedir?" },
    { caption: "Çözüm: Pay 1, payda 4. Sonuç dörtte birdir." },
    { caption: "Dikkat Noktası! Eşit değilse kesir olmaz. Okunuş dörtte birdir." },
  ],
  "fraction-sum": [
    { caption: "Solda dörtte bir duruyor." },
    { caption: "Sağa dörtte iki geldi." },
    { caption: "İki kesrin paydası da 4." },
    { caption: "Paylar 1 ve 2 toplanacak." },
    { caption: "Kural: Aynı paydada paylar toplanır." },
    { caption: "Toplam pay 1 artı 2, yani 3." },
    { caption: "Payda 4 yerinde kaldı." },
    { caption: "Sonuç dörtte üçtür." },
    { caption: "Dikkat Noktası! Paydaları toplama. 3/8 bu işlemin sonucu değildir." },
  ],
  exponent: MATH_FALLBACK,
  "ops-order": MATH_FALLBACK,
  distribute: MATH_FALLBACK,
  "number-ops": MATH_FALLBACK,
  sets: MATH_FALLBACK,
  "number-line": MATH_FALLBACK,
  decimal: MATH_FALLBACK,
  ratio: MATH_FALLBACK,
  algebra: MATH_FALLBACK,
  chart: MATH_FALLBACK,
  angles: MATH_FALLBACK,
  area: MATH_FALLBACK,
  circle: MATH_FALLBACK,
  prism: MATH_FALLBACK,
  force: [
    { caption: "Cisim duruyor. Üstünde ok yok." },
    { caption: "Kuvvet, itme veya çekmedir." },
    { caption: "İtme oku sağa doğru uzar." },
    { caption: "Cisim okun baktığı yöne kayar." },
    { caption: "Çekme oku ters yöne döner." },
    { caption: "Cisim bu kez sola gelir." },
    { caption: "Ok, kuvvetin yönünü gösterir." },
    { caption: "Örnek: Kapı sağa itilir. Çekmece ters yöne çekilir." },
    { caption: "Dikkat Noktası! Yön yazılmazsa cevap eksik kalır. Çekme de kuvvettir." },
  ],
  speed: [
    { caption: "Hareket eşit adımlarla ilerler." },
    { caption: "Sürat, alınan yolun geçen zamana bölümüdür." },
    { caption: "Eşit zamanda eşit yol alınır." },
    { caption: "Yol zaman grafiği eğimli bir doğrudur." },
    { caption: "120 metre bölü 40 saniye 3 metre bölü saniyedir." },
    { caption: "Sürat zaman grafiği yatay kalır." },
    { caption: "Birimler metre ile saniyeyi eşleştirir." },
    { caption: "Örnek: Serviste sabit gösterge sabit sürattir." },
    { caption: "Dikkat Noktası! Yolla zamanı çarpma; sürat bölme ile bulunur." },
  ],
  friction: [
    { caption: "Cisim pürüzlü yerde duruyor." },
    { caption: "Hareket oku sağa bakar." },
    { caption: "Sürtünme oku ters yöne bakar." },
    { caption: "Pürüz artınca ters ok uzar." },
    { caption: "Yer düzleşince sürtünme oku kısalır." },
    { caption: "Buzda ok kısadır. Sürtünme sıfır değildir." },
    { caption: "Pürüzlü taban tutuşu artırır." },
    { caption: "Örnek: Buzda kaymak kolaydır. Sürtünme azdır." },
    { caption: "Dikkat Noktası! Buzda sürtünme azdır. Yok değildir ve bir kuvvettir." },
  ],
  planets: [
    { caption: "Güneş ortada bir yıldızdır." },
    { caption: "Çevresinde sekiz gezegen dolanır." },
    { caption: "İç gezegenler Merkür, Venüs, Dünya ve Mars'tır." },
    { caption: "Dünya üçüncü sıradadır." },
    { caption: "Dış gezegenler daha büyüktür." },
    { caption: "Jüpiter en büyük gezegendir." },
    { caption: "Ay bir uydudur." },
    { caption: "Sıra Güneş'ten dışa doğrudur." },
    { caption: "Altın İpucu! Ay'ı sekiz gezegenin arasına yazma." },
  ],
  eclipse: [
    { caption: "Üç gök cismi aynı çizgiye gelir." },
    { caption: "Güneş tutulmasında arada Ay vardır." },
    { caption: "Bu olay gündüz olur." },
    { caption: "Ay'ın gölgesi Dünya'ya düşer." },
    { caption: "Ay tutulmasında arada Dünya vardır." },
    { caption: "Bu olay gece olur." },
    { caption: "Her yeni ay tutulma değildir." },
    { caption: "Örnek: Fener, el ve top dizilimi." },
    { caption: "Dikkat Noktası! Güneş'e çıplak gözle bakma." },
  ],
  body: [
    { caption: "Vücut sistemleri birlikte çalışır." },
    { caption: "Kemik destekler. Kas hareket ettirir." },
    { caption: "Sindirim besini yapıtaşına ayırır." },
    { caption: "Soluk alınca diyafram kasılır." },
    { caption: "Böbrek kanı süzer." },
    { caption: "Sinir haberi hızlı taşır." },
    { caption: "Duyu organı haberi alır." },
    { caption: "Kazada önce güvenlik, sonra 112." },
    { caption: "Dikkat Noktası! Bilinci kapalıya su verme." },
  ],
  blood: [
    { caption: "Kan hücreleri damarda dolaşır." },
    { caption: "Alyuvar oksijen taşır." },
    { caption: "Akyuvar korur. Pulcuklar pıhtıya yardım eder." },
    { caption: "Kalbin dört odacığı vardır." },
    { caption: "Büyük dolaşım vücuda gider." },
    { caption: "Küçük dolaşım akciğere gider." },
    { caption: "Kan grupları A, B, AB ve 0'dır." },
    { caption: "0 eksi en genel verici sayılır." },
    { caption: "Dikkat Noktası! Akciğer atardamarı oksijence fakir kan taşır." },
  ],
  particles: [
    { caption: "Madde taneciklerden oluşur." },
    { caption: "Katıda tanecikler sıkı titreşir." },
    { caption: "Sıvıda tanecikler kayar." },
    { caption: "Gazda tanecikler dağılır." },
    { caption: "Sıcaklık artınca hareket hızlanır." },
    { caption: "Yoğunluk, kütle bölü hacimdir." },
    { caption: "Isı enerji aktarımıdır." },
    { caption: "Metal iletir. Tahta yalıtır." },
    { caption: "Altın İpucu! Görmemek yok demek değildir." },
  ],
  sound: [
    { caption: "Ses bir titreşimdir." },
    { caption: "Maddesel ortamda yayılır." },
    { caption: "Boşlukta ses yayılmaz." },
    { caption: "Katıda en hızlı gider." },
    { caption: "Sert duvar sesi yansıtır." },
    { caption: "Yankı geri gelen sestir." },
    { caption: "Perde ve halı sesi soğurur." },
    { caption: "Sürat ortama bağlıdır." },
    { caption: "Dikkat Noktası! Uzay boşluğunda patlama sesi duyulmaz." },
  ],
  circuit: [
    { caption: "Devrede pil, kablo ve lamba vardır." },
    { caption: "Metal iletkendir. Lamba yanar." },
    { caption: "Plastik yalıtkandır. Lamba söner." },
    { caption: "Tuzlu su iletir. Saf su iletmez." },
    { caption: "Uzun telin direnci büyüktür." },
    { caption: "Kalın telin direnci küçüktür." },
    { caption: "Madde cinsi direnci değiştirir." },
    { caption: "İnsan vücudu da iletkendir." },
    { caption: "Dikkat Noktası! Kalın telin direnci daha büyük değildir." },
  ],
  mirror: [
    { caption: "Işık düz bir yüzeye çarpar." },
    { caption: "Gelen ışın, yansıyan ışın ve normal vardır." },
    { caption: "Normal, yüzeye dik çizilir." },
    { caption: "Gelme açısı yansıma açısına eşittir." },
    { caption: "Düz ayna görüntüyü aynı boyda gösterir." },
    { caption: "Çukur ayna yakınken büyütür." },
    { caption: "Tümsek ayna geniş alan gösterir." },
    { caption: "Beyaz ışık prizmada renklere ayrılır." },
    { caption: "Dikkat Noktası! Normal, ışının kendisi değildir." },
  ],
  meaning: [
    { caption: "Aynı sözcük üç kutuda duruyor." },
    { caption: "Gerçek anlam somut ilk anlamdır." },
    { caption: "Mecaz anlam benzetmeyle kurulur." },
    { caption: "Terim anlam bir bilimin özel sözüdür." },
    { caption: "Benzetmede gibi ve kadar aranır." },
    { caption: "Öznel cümle kişiye göre değişir." },
    { caption: "Neden, amaç ve koşul ayrı bağdır." },
    { caption: "Örtülü anlam sezdirilir, uydurulmaz." },
    { caption: "Dikkat Noktası! Anlamı sözcük değil, cümle seçer." },
  ],
  "word-tree": [
    { caption: "Kökten dallar açılıyor." },
    { caption: "Eş anlamlı aynı işi söyler." },
    { caption: "Zıt anlamlı karşı kutudadır." },
    { caption: "Yakın anlamlı her yerde değişmez." },
    { caption: "Çok anlamlıda anlamlar ilişkilidir." },
    { caption: "Sesteşte anlamlar ilişkisizdir." },
    { caption: "Deyim kalıptır. Atasözü öğüttür." },
    { caption: "Söz varlığı okudukça büyür." },
    { caption: "Altın İpucu! Yakın anlamlıyı eş anlamlı sanma." },
  ],
  affix: [
    { caption: "Kök parça masada duruyor." },
    { caption: "İsim kökü bir adı taşır." },
    { caption: "Fiil kökü bir işi taşır." },
    { caption: "Yapım eki yeni sözcük türetir." },
    { caption: "Çekim eki görev verir, türü değiştirmez." },
    { caption: "Çoğul eki ler ve lar dır." },
    { caption: "Hal, iyelik ve ilgi ekleri çekimdir." },
    { caption: "Parçalar yerine oturdu." },
    { caption: "Dikkat Noktası! Gözlük bir kök değildir. Kök göz dür." },
  ],
  book: [
    { caption: "Kitap sayfası açıldı." },
    { caption: "Giriş konuyu tanıtır." },
    { caption: "Gelişme açıklar. Sonuç toparlar." },
    { caption: "Akışı bozan cümle bağlanmaz." },
    { caption: "Öyküleme olay anlatır. Betimleme gösterir." },
    { caption: "Hikâye, anı, mektup, tiyatro ve gezi ayrıdır." },
    { caption: "Büyük harf ve sayı kendi yerini bilir." },
    { caption: "Nokta bitirir. Virgül ayırır. Kesme eki ayırır." },
    { caption: "Altın İpucu! Ay ve gün adları cümle ortasında küçük yazılır." },
  ],
  "main-idea": [
    { caption: "Metin sayfası açıldı." },
    { caption: "Satırlar geldi. Henüz seçim yok." },
    { caption: "Ortadaki cümle öne çıktı." },
    { caption: "Bu cümle ana fikirdir." },
    { caption: "Alttaki satırlar ayrıntıdır." },
    { caption: "Ana fikir tek cümleyle söylenir." },
    { caption: "Soru: Yazar ağaç hakkında ne demek istiyor?" },
    { caption: "Çözüm: Ağaçlar canlılara yarar sağlar." },
    { caption: "Dikkat Noktası! Örnek cümle ana fikir değildir. Konu da ana fikir değildir." },
  ],
  "support-idea": [
    { caption: "Ana fikir tek cümle olarak duruyor." },
    { caption: "İlk yardımcı fikir alta geldi." },
    { caption: "İkinci yardımcı fikir de geldi." },
    { caption: "İkisi de ana fikre bağlandı." },
    { caption: "Yardımcı fikir taşır. Yerine geçmez." },
    { caption: "İki cümle de aynı ana fikri besler." },
    { caption: "Soru: Gölge ve yuva cümleleri hangi fikirdir?" },
    { caption: "Çözüm: İkisi de yardımcı fikirdir." },
    { caption: "Altın İpucu! Yardımcı cümleyi ikinci ana fikir sanma." },
  ],
  place: [
    { caption: "Aynı gün içinde üç rol duruyor." },
    { caption: "Değer, birlikte yaşamayı kolaylaştıran ilkedir." },
    { caption: "Saygı ve dürüstlük değerdir." },
    { caption: "Rol, bir yerde üstlendiğin görevdir." },
    { caption: "Öğrenci, kardeş ve oyuncu ayrı rollerdir." },
    { caption: "Rol değişir. Değer yanında kalır." },
    { caption: "Soru: Saygı bir rol müdür?" },
    { caption: "Çözüm: Saygı bir değerdir. Öğrenci bir roldür." },
    { caption: "Dikkat Noktası! Rol bitince sen yok olmazsın." },
  ],
  culture: [
    { caption: "Farklı insanlar aynı sokakta yaşar." },
    { caption: "Toplumsal uyum, birlikte yaşayabilmektir." },
    { caption: "Yardımlaşma bu uyumu güçlendirir." },
    { caption: "Herkesin aynı olması gerekmez." },
    { caption: "Önyargı, tanımadan karar vermektir." },
    { caption: "Tanıyınca duvar incelir." },
    { caption: "Soru: Dış görünüşten karar vermek nedir?" },
    { caption: "Çözüm: Bu bir önyargıdır. Tanımak onu kırar." },
    { caption: "Altın İpucu! Uyum, herkesin aynı olması değildir." },
  ],
  globe: [
    { caption: "Türkiye üç tarafı deniz olan bir ülkedir." },
    { caption: "Asya ile Avrupa'yı birbirine bağlar." },
    { caption: "Karadeniz, Akdeniz ve karasal iklim birlikte görülür." },
    { caption: "Dağ, ova ve plato yeryüzünü kurar." },
    { caption: "Bitki örtüsü iklime ve yükseltiye bağlıdır." },
    { caption: "Tarım, sanayi ve turizm bölgeye göre değişir." },
    { caption: "Sekiz kara komşu vardır." },
    { caption: "Güneş ve rüzgar yenilenebilir kaynaktır." },
    { caption: "Altın İpucu! Türkiye'de tek iklim yoktur." },
  ],
  grid: [
    { caption: "Yer kürede bir adres aranıyor." },
    { caption: "Paralel çizgiler enlemi gösterir." },
    { caption: "Enlem, ekvatora olan uzaklıktır." },
    { caption: "Meridyen çizgileri boylamı gösterir." },
    { caption: "Boylam, başlangıç meridyenine olan uzaklıktır." },
    { caption: "İkisi birlikte mutlak konumu kurar." },
    { caption: "Göreceli konum bir yeri başka yere göre anlatır." },
    { caption: "Soru: İki sokak kuzeyde demek hangi konumdur?" },
    { caption: "Dikkat Noktası! Yakın sözünü enlem sanma." },
  ],
  history: [
    { caption: "Orta Asya'dan Anadolu'ya bir yol uzanıyor." },
    { caption: "Asya Hun, Göktürk ve Uygur ilk Türk devletlerindendir." },
    { caption: "Töre ve kurultay yönetimi düzenler." },
    { caption: "İslamiyet Mekke'de doğmuş, Medine'ye hicretle yayılmıştır." },
    { caption: "Talas Savaşı Türklerin İslamiyet'i tanıdığı eşiktir." },
    { caption: "Karahanlılar ilk Müslüman Türk devletidir." },
    { caption: "1071 Malazgirt Anadolu'nun kapısını açar." },
    { caption: "Soru: Malazgirt kabul tarihi midir?" },
    { caption: "Dikkat Noktası! Malazgirt, İslamiyet'in kabul tarihi değildir." },
  ],
  caravan: [
    { caption: "Kervan Çin'den Akdeniz'e doğru gider." },
    { caption: "İpek Yolu mal taşır." },
    { caption: "Kâğıt, baharat ve porselen de bu yoldadır." },
    { caption: "Din, dil ve bilim kervanla gelir." },
    { caption: "Kervansaray yolcuyu konuk eder." },
    { caption: "İhracat, başka ülkeye sattığımızdır." },
    { caption: "İthalat, başka ülkeden aldığımızdır." },
    { caption: "Soru: Aldığımız mala ne denir?" },
    { caption: "Altın İpucu! İpek Yolu yalnız ipek taşımaz." },
  ],
  assembly: [
    { caption: "Üç sütun yan yana duruyor." },
    { caption: "Yasama kanun yapar. Bu iş TBMM'nindir." },
    { caption: "Yürütme kanunları uygular. Başında Cumhurbaşkanı vardır." },
    { caption: "Yargı bağımsız mahkemelerdir." },
    { caption: "Anayasa hakların güvencesidir." },
    { caption: "Vergi, okul ve yol gibi ortak giderdir." },
    { caption: "Meslek seçiminde ilgi ve yetenek birlikte durur." },
    { caption: "Demokrasi, halkın yönetime katılmasıdır." },
    { caption: "Dikkat Noktası! Üç organın işini tek elde toplama." },
  ],
  clock: [
    { caption: "Saat ve günlük sıra yan yana duruyor." },
    { caption: "Daily routine her gün tekrar eden iştir." },
    { caption: "Tam saat o'clock ile söylenir." },
    { caption: "Yarım saat half past ile söylenir." },
    { caption: "Çeyrek geçe quarter past, çeyrek kala quarter to gelir." },
    { caption: "I wake up at seven o'clock." },
    { caption: "What time is it sorusuna It is ile cevap verilir." },
    { caption: "İş, at ile saate bağlanır." },
    { caption: "Altın İpucu! Tam saatte o'clock unutulmaz." },
  ],
  tray: [
    { caption: "Kahvaltı tepsisi masada duruyor." },
    { caption: "I like sevdiğini söyler." },
    { caption: "I don't like sevmediğini söyler." },
    { caption: "Do you like sorusu Yes, I do ile açılır." },
    { caption: "Olumlu cümlede some gelir." },
    { caption: "Soru ve olumsuzda any gelir." },
    { caption: "Can I have some bread, please bir ricadır." },
    { caption: "Please sözü ricayı yumuşatır." },
    { caption: "Dikkat Noktası! I don't have some bu kalıpta durmaz." },
  ],
  skyline: [
    { caption: "Şehir siluetinde insanlar hareket ediyor." },
    { caption: "Şu an olan iş present continuous ile söylenir." },
    { caption: "am, is ve are fiile ing ekler." },
    { caption: "She is walking şu anda yürüyor demektir." },
    { caption: "Her gün olan iş simple present ile kalır." },
    { caption: "Karşılaştırmada kısa sıfata er gelir." },
    { caption: "Bigger, bigger than ile kurulur." },
    { caption: "Cheaper, more cheap değildir." },
    { caption: "Altın İpucu! Uzun sıfatta more gelir." },
  ],
  weather: [
    { caption: "Gökyüzünde güneş, bulut ve yağmur duruyor." },
    { caption: "It is sunny güneşli demektir." },
    { caption: "It is rainy yağmurlu demektir." },
    { caption: "It is cold soğuk demektir." },
    { caption: "What's the weather like hava sorusudur." },
    { caption: "I am happy mutlu demektir." },
    { caption: "Anxious kaygılı, scared korkmuş demektir." },
    { caption: "How do you feel duygu sorusudur." },
    { caption: "Dikkat Noktası! It is sun yazılmaz. It is sunny yazılır." },
  ],
  fair: [
    { caption: "Dönme dolap ve çarpışan arabalar duruyor." },
    { caption: "Ferris wheel dönme dolaptır." },
    { caption: "Bumper cars çarpışan arabalardır." },
    { caption: "I think it is fun bence eğlenceli demektir." },
    { caption: "Exciting heyecanlı, boring sıkıcı demektir." },
    { caption: "I am excited about bir etkinlik için heyecanlıdır." },
    { caption: "I am scared of korkulan şeyi söyler." },
    { caption: "Duygu, oyunun adıyla birlikte söylenir." },
    { caption: "Altın İpucu! Fun sıfattır. Funny komik demektir." },
  ],
  badge: [
    { caption: "Üç meslek rozeti yan yana duruyor." },
    { caption: "A doctor hastalara yardım eder." },
    { caption: "An architect bina tasarlar." },
    { caption: "A vet hayvanlara bakar." },
    { caption: "What does a doctor do işi sorar." },
    { caption: "Meslek adının önüne a veya an gelir." },
    { caption: "An architect sesli harfle başlar." },
    { caption: "She is a doctor. He is an architect." },
    { caption: "Altın İpucu! Sesli harfle başlayan meslekte an kullanılır." },
  ],
  shelf: [
    { caption: "Kitaplıkta kitaplar sırada duruyor." },
    { caption: "I like reading okumayı severim demektir." },
    { caption: "Favourite book en sevilen kitaptır." },
    { caption: "On, yüzeyin üstüdür." },
    { caption: "In, bir şeyin içidir." },
    { caption: "Under, altındır." },
    { caption: "Behind arkada, next to yanında demektir." },
    { caption: "Yer, gözle kontrol edilir." },
    { caption: "Altın İpucu! İçerde olan eşya on ile değil, in ile söylenir." },
  ],
  holiday: [
    { caption: "Bavul, deniz ve güneş tatili anlatıyor." },
    { caption: "I was at school yesterday. They were at the library." },
    { caption: "Was tekil, were çoğul özneler içindir." },
    { caption: "Visited, ziyaret ettim demektir." },
    { caption: "Swam, yüzdüm demektir. Swimmed yazılmaz." },
    { caption: "Played, oynadım demektir." },
    { caption: "It was sunny hava güneşliydi demektir." },
    { caption: "We had a picnic piknik yaptık demektir." },
    { caption: "Dikkat Noktası! They was yazılmaz. They were yazılır." },
  ],
  recycle: [
    { caption: "Kâğıt, cam ve plastik kutuları duruyor." },
    { caption: "Recycle geri dönüştürmek demektir." },
    { caption: "Işıkları kapatmak enerjiyi korur." },
    { caption: "Çöpü yere atmamak çevreyi korur." },
    { caption: "Should, yapılmasını önerir." },
    { caption: "Shouldn't, yapılmamasını önerir." },
    { caption: "Should yalın fiilin önünde durur." },
    { caption: "You should recycle paper." },
    { caption: "Altın İpucu! Should to recycle yazılmaz." },
  ],
  ballot: [
    { caption: "Oy kutusu ve aday kartları duruyor." },
    { caption: "Vote, oy vermek demektir." },
    { caption: "Class president sınıf başkanıdır." },
    { caption: "Her kişinin bir oyu vardır." },
    { caption: "Right, haktır." },
    { caption: "Responsibility, sorumluluktur." },
    { caption: "Sınıf kuralı birlikte yaşamayı düzenler." },
    { caption: "Söz hakkı ve dinleme sorumluluğu yan yanadır." },
    { caption: "Dikkat Noktası! Hak, sorumluluğu silmez." },
  ],
  family: [
    { caption: "Family Life: aile üyeleri bir arada duruyor." },
    { caption: "Mother anne, father baba demektir." },
    { caption: "Sister kız kardeş, brother erkek kardeştir." },
    { caption: "I, you, we, they ile have got kullanılır." },
    { caption: "He, she, it ile has got kullanılır." },
    { caption: "I have got a sister." },
    { caption: "She has got a brother." },
    { caption: "Aile üyeleri ve sahiplik birlikte söylenir." },
    { caption: "Altın İpucu! Özneye göre have got veya has got seçilir." },
  ],
  universe: [
    { caption: "Universe: Güneş, Ay, yıldız ve gezegenler duruyor." },
    { caption: "Sun Güneş, Moon Ay demektir." },
    { caption: "Star yıldız, planet gezegendir." },
    { caption: "Tekil varlıkta there is kullanılır." },
    { caption: "Çoğul varlıklarda there are kullanılır." },
    { caption: "There is one Sun. There are eight planets." },
    { caption: "Gelecek tahmini will ve won't ile kurulur." },
    { caption: "We will visit the planetarium." },
    { caption: "Altın İpucu! Tekilde there is, çoğulda there are seçilir." },
  ],
  world: [
    { caption: "World and Culture: ülke ve milliyet kartları duruyor." },
    { caption: "Turkey ülke, Turkish milliyettir." },
    { caption: "Japan ülke, Japanese milliyettir." },
    { caption: "England ülke, English milliyettir." },
    { caption: "Ülke adının önüne from gelir." },
    { caption: "I am from Turkey. I am Turkish." },
    { caption: "She is from Japan. She is Japanese." },
    { caption: "He is from England. He is English." },
    { caption: "Altın İpucu! from + Ülke, I am + Milliyet kalıbı karıştırılmaz." },
  ],
  rules: [
    { caption: "Classroom Rules: hak ve sorumluluk tablosu duruyor." },
    { caption: "Right hak, responsibility sorumluluktur." },
    { caption: "Speak in turn söz hakkıdır." },
    { caption: "Raise hand parmak kaldırmaktır." },
    { caption: "Listen and respect dinlemek ve saygı duymaktır." },
    { caption: "Keep the class clean sınıfı temiz tutmaktır." },
    { caption: "I have the right to speak." },
    { caption: "We listen to our friends." },
    { caption: "Altın İpucu! Hak ve sorumluluk sınıfta yan yana durur." },
  ],
  elective: [
    { caption: "Seçmeli ders açıldı." },
    { caption: "Kavram söylendi." },
    { caption: "Örnek ekrana geldi." },
    { caption: "Örnek adım adım durdu." },
    { caption: "Kural bir cümleyle söylendi." },
    { caption: "Aynı kural bir kez daha söylendi." },
    { caption: "Soru soruldu." },
    { caption: "Çözüm söylendi." },
    { caption: "Dikkat Noktası! Bu adımda ipucu ayrıca durur." },
  ],
};

const ANON_RESUME: MicroProgressRecord = { completed: [], holding: null };

type VectorPlayerProps = {
  scene: JuniorVectorScene;
  mebNote: string;
  lifeUse: string;
  steps?: readonly string[];
  /** Dinleme metni. Ders notu boşsa anlatım buna düşer. */
  narration?: string;
  lessonKey?: string;
  /** Mikro-adım izi bu profile yazılır. Boşsa anonim anahtar. */
  profileId?: string;
  /** Profil rumuzu. Yoksa sıcak açılış listesi kalır. Ders dosyasına yazılmaz. */
  nickname?: string | null;
  /** Geniş ekranda odak sahnesi kalan yüksekliği doldurur. */
  fill?: boolean;
  /** Son adımda mikrofon pekiştirmesine geçer. */
  onReadyToTell?: () => void;
  /** Kaset %100 (`playback.complete`) — tell-guides bandı bununla açılır. */
  onPlaybackComplete?: (complete: boolean) => void;
  /** Mikrofon öncesi kaset kanalını bırakmak için stop bağla. */
  onBindStop?: (stop: () => void) => void;
  /** Kilitli dersin imzalı adresi. Boş dize kamu yolu değildir. */
  grantedAudioUrl?: string | null;
  grantedWarmupUrl?: string | null;
  lockPublicMedia?: boolean;
  /** Senaryodaki özgün mikro soru. Yıldız paneli bunu basar. */
  microQuestion?: string;
};

/**
 * Pilot dalı pre-roll shell: ısınma kaseti PCM saatine ofset yazmaz.
 * gate finish → anlatı timeline 0 ms'den başlar (sealed ile aynı sözleşme).
 */
function PilotPlayerWithWarmupShell(props: VectorPlayerProps): ReactElement {
  const playback = resolveJuniorPlayback(props.lessonKey ?? "");
  const startNarrationRef = useRef<() => void>(() => undefined);
  const watchedRef = useRef<string>("");
  const warmup = useJuniorWarmupGate(
    props.lessonKey ?? "",
    () => startNarrationRef.current(),
    props.grantedWarmupUrl ?? null,
    props.lockPublicMedia ?? false,
  );

  const persistWatchedCues = useCallback(
    (watchedIndices: readonly number[]) => {
      const lessonKey = props.lessonKey ?? "";
      if (!lessonKey || watchedIndices.length === 0) {
        return;
      }
      const token = watchedIndices.join(",");
      if (token === watchedRef.current) {
        return;
      }
      watchedRef.current = token;
      const profileId = props.profileId ?? "";
      const current = readMicroProgress("junior", profileId, lessonKey);
      const next = mergeWatchedScenes(current, watchedIndices);
      if (next === current) {
        return;
      }
      writeMicroProgress("junior", profileId, lessonKey, next);
    },
    [props.lessonKey, props.profileId],
  );

  return (
    <div
      className={`relative flex min-h-0 w-full flex-1 flex-col ${props.fill ? "h-full" : "h-auto"}`}
      data-junior-warmup-gate={warmup.gate}
      data-junior-pilot-warmup-shell=""
    >
      <JuniorPilotPlayer
        timeline={playback.timeline}
        grantedAudioUrl={props.grantedAudioUrl}
        fill={props.fill}
        onBindStop={props.onBindStop}
        onPlaybackComplete={props.onPlaybackComplete}
        onReadyToTell={props.onReadyToTell}
        narrationHold={warmup.gate === "cassette"}
        controlsLocked={warmup.orienting}
        onBindStartNarration={(start) => {
          startNarrationRef.current = start;
        }}
        onWatchedCuesChange={persistWatchedCues}
      />
      {warmup.src && warmup.gate !== "scene" ? (
        <JuniorWarmupCassette
          src={warmup.src}
          fading={warmup.gate === "fade"}
          onEnded={warmup.onEnded}
          onSkip={warmup.onSkip}
          onError={warmup.onError}
        />
      ) : null}
    </div>
  );
}

export function VectorPlayer(props: VectorPlayerProps) {
  const playback = resolveJuniorPlayback(props.lessonKey ?? "");
  if (playback.engine === "pilot") {
    return <PilotPlayerWithWarmupShell {...props} />;
  }
  return <SealedVectorPlayer {...props} />;
}

function SealedVectorPlayer({
  scene,
  mebNote,
  lifeUse,
  steps,
  narration = "",
  lessonKey = "",
  profileId = "",
  nickname = null,
  fill = false,
  onReadyToTell,
  onPlaybackComplete,
  onBindStop,
  grantedAudioUrl = null,
  grantedWarmupUrl = null,
  lockPublicMedia = false,
  microQuestion = "",
}: VectorPlayerProps) {
  const beats =
    steps && steps.length > 0 ? steps.map((caption) => ({ caption })) : BEATS[scene];
  const note = juniorLessonNote(mebNote, lifeUse);
  // Cue SSOT = fırınlanmış kaset metni (listenText/narration). mebNote yalnız yedek.
  // audio.currentTime → SoftStage + (CC açıkken) liveCaption. Ham transkript sayfada durmaz.
  const spoken = narration.trim().length > 0 ? narration.trim() : note;
  const sealedVoice = lockPublicMedia
    ? Boolean(grantedAudioUrl)
    : Boolean(juniorLessonAudioSrc(lessonKey) ?? juniorLessonLocalLockedAudioPath(lessonKey));
  // Ekran selamı sesle aynı: mühürlü kasetin açılışı sabittir; rumuz yalnız sesi olmayan yolda okunur.
  const greeting = juniorLessonGreeting({ lessonKey, nickname, sealedVoice });
  const spokenForPlay =
    greeting && !sealedVoice ? applyJuniorNicknameOpening(spoken, nickname) : spoken;
  const [trace, setTrace] = useState<MicroProgressRecord>({ completed: [], holding: null });
  const [traceReady, setTraceReady] = useState(false);
  useEffect(() => {
    setTraceReady(false);
    setTrace(readMicroProgress("junior", profileId, lessonKey));
    setTraceReady(true);
  }, [profileId, lessonKey]);
  const namedProfile = profileId.trim().length > 0;
  const playback = useJuniorPlayback({
    lessonKey,
    note: spokenForPlay,
    beatCount: beats.length,
    stepCaptions: beats.map((row) => row.caption),
    grantedAudioUrl,
    lockPublicMedia,
    // Profil yokken anonim iz bir dikkat durağında oynatıcıyı kilitlemesin.
    resumeRecord: namedProfile ? trace : ANON_RESUME,
    resumeReady: namedProfile ? traceReady : true,
    onHardResume: (pause) => {
      setTrace((current) => {
        const next = completeMicroStep(current, pause.stepIndex);
        writeMicroProgress("junior", profileId, lessonKey, next);
        return next;
      });
    },
  });
  const thinkButtonRef = useRef<HTMLButtonElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const warmup = useJuniorWarmupGate(lessonKey, playback.replay, grantedWarmupUrl, lockPublicMedia);
  const beat = playback.beat;
  const chimeKey = useRef("");
  /** Canlı altyazı bandı varsayılan kapalı — bilişsel yük düşük; CC ile açılır. */
  const [captionsVisible, setCaptionsVisible] = useState(false);
  /**
   * Karar overlay kilidi: «Hazırım…» sonrası karar paneli kapanır.
   * `playback.complete` elapsed koruduğu için tek başına overlay’i düşürmez;
   * tekrar dinle (`!complete`) paneli yeniden açar.
   */
  const [decisionTaken, setDecisionTaken] = useState(false);
  /** Yıldız, dikkat veya not kartı. Yalnız dokunuşta veya kullanıcının durdurmasında açılır. */
  const [openedMarker, setOpenedMarker] = useState<MicroLessonPause | null>(null);
  /** SoftStage + (CC açıkken) karaoke altyazı: MP3 cümlesi; adım metni yalnız yedek. */
  const stepCaption = beats[beat]?.caption ?? beats[0]?.caption ?? "";
  const caption = playback.liveCaption.trim().length > 0 ? playback.liveCaption : stepCaption;
  /**
   * Özet (beat ≥ 9): SoftStage art'ı steps maddesinden beslenir — kaset `4.` önekleri DOM'a girmez.
   * Karaoke altyazı yalnız CC açıkken `caption` (liveCaption) basar.
   */
  const artCaption = beat >= 9 ? stepCaption : caption;
  /**
   * Sticky Scene Trail — 0..aktif cümle (dahil).
   * Parser eşleşmesi yokken son geçerli görsel kalır; 1 nolu varsayılana bounce yok.
   * Scrub geri/ileri de aynı fold ile tutarlıdır.
   * Özet modunda trail boş: önceki üs/taban yapışkan durumu sahnede kalmaz.
   */
  const captionTrail =
    beat >= 9
      ? []
      : playback.pieces.length > 0 && playback.activePiece >= 0
        ? playback.pieces.slice(0, playback.activePiece + 1).map((piece) => piece.text)
        : beats.slice(0, Math.max(0, beat) + 1).map((row) => row.caption);
  const markerBody =
    openedMarker?.kind === "attention" ? openedMarker.attentionText || caption : caption;
  const markerHintKind =
    openedMarker?.kind === "attention" ? (juniorHintKindFromCaption(markerBody) ?? "trap") : null;

  useEffect(() => {
    if (warmup.orienting || !markerHintKind || openedMarker?.kind !== "attention") {
      chimeKey.current = "";
      return;
    }
    const token = `${scene}:${openedMarker.endMs}:${markerHintKind}`;
    if (chimeKey.current === token) {
      return;
    }
    chimeKey.current = token;
    playJuniorHintEffect("box-open");
  }, [scene, markerHintKind, openedMarker, warmup.orienting]);

  useEffect(() => {
    onPlaybackComplete?.(playback.complete);
  }, [playback.complete, onPlaybackComplete]);

  useEffect(() => {
    if (!playback.complete || !traceReady) {
      return;
    }
    const last = playback.microSteps.length - 1;
    if (last < 0) {
      return;
    }
    setTrace((current) => {
      if (current.completed.includes(last)) {
        return current;
      }
      const next = completeMicroStep(current, last);
      writeMicroProgress("junior", profileId, lessonKey, next);
      return next;
    });
  }, [playback.complete, playback.microSteps.length, traceReady, profileId, lessonKey]);

  useEffect(() => {
    if (openedMarker?.kind !== "notebook" && openedMarker?.kind !== "attention") {
      return;
    }
    thinkButtonRef.current?.focus({ preventScroll: true });
  }, [openedMarker]);

  useEffect(() => {
    if (!playback.complete) {
      setDecisionTaken(false);
    }
  }, [playback.complete]);

  useEffect(() => {
    setOpenedMarker(null);
  }, [lessonKey]);

  useEffect(() => {
    onBindStop?.(playback.stop);
  }, [onBindStop, playback.stop]);

  useEffect(() => {
    function onFullscreenChange() {
      setFullscreen(document.fullscreenElement === stageRef.current);
    }
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  function openMarker(endMs: number) {
    const pause = playback.microPauses.find((row) => Math.abs(row.endMs - endMs) < 80) ?? null;
    setOpenedMarker(pause);
  }

  function togglePlayback() {
    if (warmup.orienting) {
      return;
    }
    const pausing = playback.playing;
    playback.toggle();
    if (!pausing) {
      return;
    }
    const marker = juniorMarkerAt(playback.microPauses, playback.elapsedMs);
    if (marker) {
      setOpenedMarker(marker);
    }
  }

  function toggleFullscreen() {
    const node = stageRef.current;
    if (!node) {
      return;
    }
    if (document.fullscreenElement === node) {
      void document.exitFullscreen();
      return;
    }
    void node.requestFullscreen().catch(() => undefined);
  }

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "f" && event.key !== "F") {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target;
      if (target instanceof HTMLElement) {
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || target.isContentEditable) {
          return;
        }
      }
      event.preventDefault();
      toggleFullscreen();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  /**
   * Normal mod: tuval kalan viewport yüksekliğini doldurur (`flex-1`).
   * Video ve SVG mutlak konumludur; yükseklik ebeveynden gelir.
   * Tam ekranda board aynı esnek sütunu ekrana yayar.
   */
  const boardClass = fullscreen
    ? "min-h-0 flex-1 overflow-hidden"
    : "min-h-0 w-full flex-1 overflow-hidden";

  return (
    <div
      className={`flex min-h-0 w-full flex-1 flex-col gap-1 ${fill ? "h-full" : "h-auto"}`}
      data-junior-focus-player=""
      data-junior-zero-scroll={fill ? "true" : undefined}
      data-junior-captions={captionsVisible ? "on" : "off"}
    >
      <div
        ref={stageRef}
        className={`flex w-full max-w-none flex-col gap-1 overflow-hidden border border-[var(--border)] bg-white ${
          fullscreen ? "h-screen w-screen max-h-none rounded-none" : "h-full min-h-0 flex-1 rounded-xl"
        } ${fullscreen ? "min-h-0 flex-1" : ""}`}
        data-junior-cinema-stage=""
        data-junior-fullscreen={fullscreen ? "true" : "false"}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-[var(--border)] px-2 py-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--safir-deep)]">
            Video / Görsel Oynatıcı
          </p>
        </div>
        <ol
          data-junior-micro-steps=""
          className="flex shrink-0 gap-1 overflow-x-auto px-2 py-1"
        >
          {playback.microSteps.map((step) => {
            const done = trace.completed.includes(step.index);
            return (
              <li
                key={step.id}
                data-junior-micro-step={step.index}
                data-junior-micro-done={done ? "true" : "false"}
                className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-xs font-semibold ${
                  done
                    ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                    : "border-[var(--border)] text-[var(--safir-deep)]"
                }`}
              >
                {done ? (
                  <span aria-label="Tamamlandı" className="text-emerald-700">
                    ✓
                  </span>
                ) : null}
                {step.title}
              </li>
            );
          })}
        </ol>

        {/* Üst: dinamik karatahta — altyazı kapalıyken tüm dikey bütçe SoftStage’te. */}
        <div
          className={`relative w-full bg-white ${boardClass}`}
          data-junior-warmup-gate={warmup.gate}
          data-junior-cinema-board=""
          data-junior-clean-stage={captionsVisible ? undefined : "true"}
        >
          <div
            className={`absolute inset-0 h-full min-h-[300px] w-full transition-opacity duration-500 ${
              warmup.gate === "cassette" ? "pointer-events-none opacity-0" : "opacity-100"
            }`}
          >
            <div
              key={beat >= 9 ? `${scene}-recap` : scene}
              className="pointer-events-none absolute inset-0 h-full min-h-[300px] w-full"
              data-junior-step-art={beat}
              data-junior-sticky-trail={captionTrail.length}
              data-junior-recap-stage={beat >= 9 ? "clean" : undefined}
            >
              <JuniorScenePropProvider value={juniorSceneProps(lessonKey, scene)}>
                <Scene
                  scene={scene}
                  beat={beat}
                  caption={artCaption}
                  captionTrail={captionTrail}
                  lessonKey={lessonKey}
                />
              </JuniorScenePropProvider>
            </div>
            {/* Bitiş CTA: son adım (12/12) değil — yalnız kaset %100 (playback.complete). */}
            {playback.complete && !decisionTaken && beats.length > 1 ? (
              <JuniorLessonDecision
                onTell={() => {
                  // Overlay kapanır → ListenAndTell armTellFromDecision (scroll + mik).
                  // SoftStage boyutu korunur; sıkıştırma yok.
                  // stop(): kaset düşer, BGM ambient hacimde akar (ortam sessizleşmez).
                  playback.stop();
                  setDecisionTaken(true);
                  onReadyToTell?.();
                }}
                onReplay={playback.replay}
              />
            ) : null}
          </div>
          {warmup.src && warmup.gate !== "scene" ? (
            <JuniorWarmupCassette
              src={warmup.src}
              fading={warmup.gate === "fade"}
              onEnded={warmup.onEnded}
              onSkip={warmup.onSkip}
              onError={warmup.onError}
            />
          ) : null}
        </div>

        {/* Alt şerit: ipucu (varsa) + isteğe bağlı CC altyazı + kontroller — board altında. */}
        <div
          className="flex w-full shrink-0 flex-col gap-1 border-t border-[var(--border)] px-2 py-1.5"
          data-junior-caption-rail=""
        >
          {openedMarker?.kind === "notebook" ? (
            <JuniorPauseBanner
              kind="notebook"
              buttonRef={thinkButtonRef}
              actionLabel="Kapat"
              onResume={() => setOpenedMarker(null)}
            />
          ) : null}
          {openedMarker?.kind === "turn" && microQuestion ? (
            <JuniorStarQuestion question={microQuestion} onClose={() => setOpenedMarker(null)} />
          ) : null}
          {!warmup.orienting && openedMarker?.kind === "attention" && markerHintKind ? (
            <JuniorHintBox
              kind={markerHintKind}
              body={juniorHintBody(markerBody)}
              holding={false}
              buttonRef={thinkButtonRef}
              onAcknowledge={() => setOpenedMarker(null)}
            />
          ) : null}
          {greeting ? (
            <p data-junior-nickname-opening="" className="text-sm font-semibold text-[var(--safir-deep)]">
              {greeting}
            </p>
          ) : null}
          {playback.voicePreparing ? (
            <p role="status" data-junior-voice-preparing="" className="text-sm font-semibold text-[var(--muted)]">
              {JUNIOR_VOICE_PREPARING_LABEL}
            </p>
          ) : null}
          {!namedProfile ? (
            <p role="status" data-junior-profile-missing="" className="text-sm font-semibold text-[var(--muted)]">
              Profil seçilmedi. Ders kilitlenmeden oynar. Puan ve anlatış için profil gerekir.
            </p>
          ) : null}
          {captionsVisible ? (
            <p
              data-junior-live-caption=""
              aria-live="polite"
              className="flex w-full min-h-[2.25rem] items-center justify-center rounded-lg bg-[linear-gradient(180deg,#0f172a_0%,#1e293b_100%)] px-3 py-1.5 text-center text-sm font-medium leading-5 tracking-wide text-[#f8fafc] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
            >
              {warmup.orienting ? "Oryantasyon" : caption || "\u00a0"}
            </p>
          ) : null}
          <JuniorPlayerControls
            playing={playback.playing}
            scrubbing={playback.scrubbing}
            elapsedMs={playback.elapsedMs}
            durationMs={playback.durationMs}
            beat={beat}
            beatCount={beats.length}
            orientation={warmup.orienting}
            captionsVisible={captionsVisible}
            onToggleCaptions={() => setCaptionsVisible((open) => !open)}
            onToggle={togglePlayback}
            bgmMuted={playback.bgmMuted}
            onToggleBgm={playback.toggleBgm}
            fullscreen={fullscreen}
            onToggleFullscreen={toggleFullscreen}
            onReplay={warmup.orienting ? () => undefined : playback.replay}
            onStep={warmup.orienting ? undefined : playback.stepBy}
            onScrubStart={warmup.orienting ? () => undefined : playback.beginScrub}
            onScrub={warmup.orienting ? () => undefined : playback.scrubTo}
            onScrubEnd={warmup.orienting ? () => undefined : playback.endScrub}
            pauses={playback.microPauses}
            starGlowEndMs={playback.starGlowEndMs}
            onOpenStar={openMarker}
          />
        </div>
      </div>
    </div>
  );
}

function Scene({
  scene,
  beat,
  caption,
  captionTrail,
  lessonKey,
}: {
  scene: JuniorVectorScene;
  beat: number;
  caption: string;
  captionTrail: readonly string[];
  lessonKey: string;
}) {
  return (
    <JuniorStepArt
      scene={scene}
      beat={beat}
      caption={caption}
      captionTrail={captionTrail}
      lessonKey={lessonKey}
    />
  );
}
