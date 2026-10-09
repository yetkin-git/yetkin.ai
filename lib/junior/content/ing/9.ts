import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf İngilizce, Ünite 5 At the Fair. Oyuncaklar ve görüş. */
export const JUNIOR_ING_MAIN_9_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_ing_main-9",
  title: "Lunaparkta rides ve fun",
  teaser:
    "Dönme dolap ferris wheel, çarpışan araba bumper cars adını alır. Görüş I think it is fun ile söylenir. Kavramsal Anlayış, oyunun adını görüşten ayırır. İfade Gücü, bir oyuncak için bence cümlesi kurmandır.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün İngilizcede önümüzde nasıl bir yolculuk var, çünkü rengarenk ışıklarıyla bizi çağıran lunaparka doğru neşeli bir adım atıyoruz! Dönme dolabın dev çemberi gökyüzüne uzanıyor, çarpışan arabalardan kahkahalar yükseliyor, atlı karınca ise tatlı bir melodiyle dönüyor. Bugün seninle lunaparktaki oyuncakların İngilizce isimlerini öğrenecek ve onlar hakkında 'Bence çok eğlenceli!' demenin yolunu keşfedeceğiz. Kendi düşünceni söylerken kullanacağın 'I think' kalıbı İngilizcede en güçlü yardımcın olacak.",
  concept:
    "Lunaparktaki oyuncaklara genel olarak 'rides' deriz. Gökyüzünü ayaklarının altına seren dönme dolaba 'ferris wheel', birbirine neşeyle çarpan küçük araçlara 'bumper cars', sevimli atlarıyla dönen oyuncağa 'carousel', raylarda hızla kayan trene ise 'roller coaster' denir. Bir oyuncak hakkındaki kişisel fikrini söylerken 'I think it is fun' yani 'Bence o eğlencelidir' dersin. 'Exciting' heyecan verici, 'amazing' harika, 'boring' ise sıkıcı anlamına gelir. Şurası aklında kalsın tamam mı: 'Fun' eğlenceli demektir, 'funny' ise güldürücü ve komik demektir; hız treni seni güldürmez ama sana büyük bir eğlence sunar.",
  example:
    "Lunaparkın meydanında durup etrafımıza bakalım: 'The ferris wheel is amazing and big!' Çarpışan arabalara binen arkadaşını görüp 'I think bumper cars are very exciting' dersin. Küçük kardeşin atlı karıncayı çok seviyorsa 'The carousel is fun for children' cümlesini kurarsın. Çok yavaş hareket eden bir oyuncaktan sıkıldıysan 'I think this ride is boring' diyebilirsin. Bir arkadaşına fikrini sormak için 'What do you think about the roller coaster?' dersin; o da sana 'In my opinion, it is fantastic!' diyerek kendi görüşünü söyler.",
  hint: "gold",
  warning:
    "Bir oyuncağın eğlenceli olduğunu söylerken 'funny' yerine 'fun' sözcüğünü kullanmayı hatırla; çünkü palyaço komiktir yani 'funny'dir, lunapark oyuncağı ise eğlencelidir yani 'fun'dır. Kendi fikrini belirtirken 'I think it is fun' diyerek küçük 'it' veya 'is' sözcüklerini cümlenin içinde tutmak anlatımını tam ve kusursuz bir İngilizce seviyesine taşır.",
  life:
    "Hafta sonu lunaparka veya panayıra gittiğinde bilet alırken dönme dolabı işaret edip 'I think the ferris wheel is wonderful' de. Arkadaşlarınla hız trenine binerken 'It is very exciting!' diyerek heyecanını paylaş. Eve döndüğünde ailene o günü anlatırken 'My favourite ride is the bumper cars because it is fun' diyerek günün özetini İngilizce yap.",
  recap: [
    "Ferris wheel dönme dolap, bumper cars çarpışan araba, roller coaster hız trenidir.",
    "Kişisel görüş I think it is fun veya I think it is exciting kalıbıyla söylenir.",
    "Fun eğlenceli olanı, funny ise komik ve güldürücü olanı anlatır.",
  ],
  conceptSeal: "Oyunun adı ile görüş ayrıdır. Görüş I think ile başlar.",
  voiceSeal: "Bir lunapark oyuncağı için bence cümlesi kurarsın.",
  outcomes: [
    "Ferris wheel ve bumper cars lunapark adlarıdır.",
    "I think it is fun bir görüştür.",
    "Fun ile funny aynı anlama gelmez.",
  ],
  scene: "fair",
  parentNote:
    "Çocuğunuz dönme dolabı ferris wheel, çarpışan arabayı bumper cars diye adlandırır. Görüşünü I think it is fun ile kurar. Fun eğlence, funny komik demektir.",

};

export const JUNIOR_ING_MAIN_9 = juniorLessonFromScenario(JUNIOR_ING_MAIN_9_SCENARIO);
