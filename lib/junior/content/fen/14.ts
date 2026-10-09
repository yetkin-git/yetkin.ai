import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Sesin yayılması. */
export const JUNIOR_FEN_14_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-14",
  title: "Sesin yayılması",
  teaser:
    "Ses, titreşen bir kaynaktan maddesel ortamda yayılır. Boşlukta yayılmaz. Kavramsal Anlayış, katı, sıvı ve gazdaki farkı söyler. İfade Gücü, uzayda neden ses duyulmadığını anlatmandır.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün önümüzde merak uyandıran ne var, çünkü çevremizi saran seslerin havadaki, sudaki ve katılardaki gizemli yolculuğunu inceleyeceğiz. Sınıfta sıranın bir ucuna kulağını dayadığında, arkadaşının diğer uçtaki minik tıkırtısını havadan çok daha önce ve net duyduğunu fark etmiş miydin? Ses her ortamda aynı hızla ilerlemez. Bugün seninle sesin nasıl yayıldığını, neden bir maddeye ihtiyaç duyduğunu ve uzayda sesin neden duyulmadığını öğreneceğiz.",
  concept:
    "Ses, titreşen bir kaynaktan çıkan mekanik bir dalgadır. Sesin yayılabilmesi için mutlaka katı, sıvı ya da gaz gibi maddesel bir ortama ihtiyaç vardır. Titreşen kaynak yanındaki tanecikleri iter, o tanecikler de komşularını iterek titreşimi dalgalar halinde taşır. Maddesel taneciklerin bulunmadığı uzay boşluğunda ses asla yayılamaz. Taneciklerin birbirine en yakın olduğu katı ortamlarda ses en hızlı yayılır. Sıvılarda biraz daha yavaş, taneciklerin birbirinden çok uzak olduğu gazlarda ise en yavaş yayılır. Şurası aklında kalsın tamam mı: Işık boşlukta yayılabilir ve saniyede üç yüz bin kilometre hızla gider; oysa ses boşlukta kesinlikle ilerleyemez.",
  example:
    "Plastik bir cetveli masanın kenarına sıkıştırıp ucunu aşağı çekip bırakalım. Cetvel hızla titreşir ve bir ses çıkarır; cetvel burada ses kaynağıdır. Cetvelin titreştirdiği hava tanecikleri dalga dalga kulağına ulaşır. Şimdi kulağını masaya daya ve cetvele hafifçe dokun; ses tahta masanın içinden kulağına çok daha berrak ve hızlı gelir. Çünkü masa katıdır ve tanecikleri dip dibedir. Denizde yüzerken suyun altına daldığında iki taşı birbirine vuran birinin sesini rahatça duyarsın; çünkü sıvılar da sesi iletir. Ancak uzay boşluğunda dev bir meteor bir gezegene çarpsa bile yanında dursan çıt sesi duyamazsın; çünkü orada titreşimi taşıyacak hiçbir hava taneciği yoktur.",
  hint: "trap",
  warning:
    "Filmlerde gördüğümüz uzay patlamalarının ses çıkardığını sanabiliriz; oysa uzay boşluğunda tanecik olmadığı için ses asla yayılmaz. Işık boşlukta yol alabilirken, ses mutlaka titreşecek maddesel bir ortama ihtiyaç duyar.",
  life:
    "Bunu gök gürültülü yağmurlu bir günde pencerenden bakarken hemen test edebilirsin. Şimşek çaktığında önce göz kamaştıran ışığı görürsün, birkaç saniye sonra ise gök gürültüsünün sesi kulağına gelir. Bunun sebebi ışığın sesten çok daha hızlı olmasıdır. Tren raylarına kulağını dayayan eski demir yolcuları da trenin sesini havadan önce raydaki katı demirden duyarlardı. Yüksek sesle kulaklık dinlememeye özen göstermek de kulak zarı titreşimlerimizi ömür boyu korur.",
  recap: [
    "Ses, titreşen bir kaynaktan doğar ve sadece maddesel ortamda yayılır.",
    "Uzay boşluğunda ses yayılmaz; çünkü titreşimi iletecek tanecik yoktur.",
    "Ses en hızlı katılarda, sonra sıvılarda, en yavaş ise gazlarda yayılır.",
  ],
  conceptSeal: "Sesin yayılması, taneciklerin titreşimi birbirine iletmesidir.",
  voiceSeal: "Boşlukta neden ses duyulmadığını ve üç ortamın sırasını söylersin.",
  outcomes: [
    "Ses maddesel ortamda yayılır.",
    "Ses boşlukta yayılmaz.",
    "Ses farklı ortamlarda farklı hızla iletilir.",
  ],
  scene: "sound",
  parentNote:
    "Çocuğunuz sesin titreşimle oluştuğunu ve boşlukta yayılmadığını anlatır. Katı, sıvı ve gaz sırasını sıra tıkırtısı örneğiyle pekiştirebilir. Şiddetli sesten kulağı korumak da bu konuya bağlıdır.",

};

export const JUNIOR_FEN_14 = juniorLessonFromScenario(JUNIOR_FEN_14_SCENARIO);
