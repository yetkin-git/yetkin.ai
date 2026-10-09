import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Fen Bilimleri. Bileşke kuvvet. */
export const JUNIOR_FEN_9_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-9",
  title: "Bileşke kuvvet",
  teaser:
    "Kuvvetin doğrultusu, yönü ve büyüklüğü vardır. Aynı yönlü kuvvetler toplanır. Zıt yönlülerde büyükten küçük çıkar. Kavramsal Anlayış, dengelenmiş ile dengelenmemişi ayırır. İfade Gücü, bileşkeyi yönüyle söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün önümüzde merak uyandıran ne var, çünkü birlikte kuvvetlerin eğlenceli dünyasına adım atıyoruz. Arkadaşlarınla beraber ağır bir sandığı aynı yönde ittiğinde işinizin ne kadar kolaylaştığını, zıt yönlere çektiğinizde ise sandığın yerinde kaldığını gördün mü? Birden fazla kuvvet bir araya geldiğinde tek bir kuvvet gibi sonuç verir. Bugün seninle bileşke kuvveti, kuvvetlerin yönünü ve dengelenmiş hareketleri keşfedeceğiz.",
  concept:
    "Kuvvetin doğrultusu, yönü ve newton birimiyle ölçülen bir büyüklüğü vardır. Bir cisme etki eden birden çok kuvvetin yaptığı etkiyi tek başına yapan kuvvete bileşke kuvvet, yani net kuvvet denir. Aynı doğrultuda ve aynı yöndeki kuvvetler toplanır; bileşkenin yönü değişmez. Zıt yönlü kuvvetlerde ise büyük kuvvetten küçük kuvvet çıkarılır; bileşke kuvvet büyük olanın yönünde olur. Eğer zıt yönlü iki kuvvet birbirine eşitse bileşke kuvvet sıfır çıkar. Buna dengelenmiş kuvvetler denir. Bileşke sıfırdan farklıysa kuvvetler dengelenmemiştir. Şurası aklında kalsın tamam mı: Dengelenmiş kuvvet etkisindeki duran bir cisim durmaya, hareket halindeki cisim ise sabit süratle gitmeye devam eder.",
  example:
    "Ortadaki bir kutuya iki arkadaşının kuvvet uyguladığını düşünelim. Biri 5 newton, diğeri 3 newton büyüklüğünde ve ikisi de sağa doğru itiyor. İkisi aynı yönlü olduğu için toplarız: 5 artı 3, eşittir 8 newton sağa doğru olur. Şimdi biri 7 newton ile sağa, diğeri 4 newton ile sola çeksin. Kuvvetler zıt yönlüdür; farkını alırız: 7 eksi 4, eşittir 3 newton ve yön büyük olanın yönü, yani sağa doğrudur. Eğer 6 newton sağa ve 6 newton sola çekilirse fark sıfır olur; kuvvetler dengelenmiştir ve kutu yerinden kıpırdamaz. 8 newton sağa ve 2 newton sola olsaydı bileşke 6 newton sağa olurdu ve kutu sağa doğru hızlanırdı; bu da dengelenmemiş kuvvettir.",
  hint: "gold",
  warning:
    "Bileşke kuvvetin sıfır olması, cismin üzerinde hiçbir kuvvet olmadığı anlamına gelmez. Zıt yönlü ve eşit büyüklükteki kuvvetler birbirini dengeler; bu yüzden cisim ya durur ya da sabit süratle yoluna devam eder. Kuvveti anlatırken yönünü söylemeyi de asla unutmuyoruz.",
  life:
    "Bunu beden eğitimi dersindeki halat çekme oyununda çok net görebilirsin. İki takım eşit güçle asıldığında ipin ortasındaki kırmızı kurdele hiç kıpırdamaz; çünkü kuvvetler dengelenmiştir. Bir takım biraz daha güçlü çektiğinde bileşke o takımın yönüne döner ve ip o tarafa kayar. Evde ağır bir masayı çekerken arkadaşınla aynı yönde kuvvet uygularsanız bileşke kuvvet büyür ve işiniz hafifler.",
  recap: [
    "Aynı yönlü kuvvetler toplanır ve yön aynı kalır.",
    "Zıt yönlü kuvvetlerde fark alınır ve yön büyük kuvvetin yönüdür.",
    "Eşit ve zıt kuvvetlerde bileşke sıfırdır; kuvvetler dengelenmiştir.",
  ],
  conceptSeal: "Bileşke kuvvet, birden çok kuvvetin tek sonuç kuvvetidir.",
  voiceSeal: "Toplamı ya da farkı yönüyle birlikte söylersin.",
  outcomes: [
    "Kuvvetin doğrultusu, yönü ve büyüklüğü vardır.",
    "Aynı yönlü kuvvetler toplanır, zıt yönlülerde fark alınır.",
    "Bileşke sıfırsa kuvvetler dengelenmiştir.",
  ],
  scene: "force",
  parentNote:
    "Çocuğunuz aynı yönlü kuvvetleri toplar, zıt yönlülerde fark alır ve yönü büyük kuvvetten seçer. Eşit zıt kuvvetlerin dengelenmiş olduğunu ip çekme örneğiyle anlatabilir.",

};

export const JUNIOR_FEN_9 = juniorLessonFromScenario(JUNIOR_FEN_9_SCENARIO);
