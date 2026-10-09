import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Veri toplama ve sıklık tablosu. */
export const JUNIOR_MAT_18_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-18",
  title: "Veri toplama ve değerlendirme",
  teaser:
    "Veri, bir soruya verilen cevapların toplanmış hâlidir. Sıklık, bir seçeneğin kaç kez çıktığını söyler. Kavramsal Anlayış, çetele ile sıklık tablosunu aynı sayının iki yazılışı diye görmendir. İfade Gücü, en çok seçileni tablodan okumandır.",
  welcome:
    "Selamlar! Bugün seninle çok keyifli bir konuyu keşfedeceğiz, çünkü araştırma yapıp topladığımız bilgileri düzenli bir tabloya dönüştüreceğiz. Hiç arkadaşlarına en sevdikleri rengi ya da meyveyi sorup yanıtları bir köşeye not ettin mi? Alınan her bir yanıt bir veridir. Bugün seninle veri toplamayı, çetele tutmayı ve sıklık tablosu oluşturmayı öğreneceğiz.",
  concept:
    "Veri toplamak için önce herkesin net anlayacağı tek bir araştırma sorusu sorulur. Seçenekler açık ve belirgin olmalıdır. Çetele tutarken her cevap için dik bir çizgi çizilir; beşinci cevapta ise dört çizginin üstünden yatay bir çizgi çekilerek beşli bir demet yapılır. Sıklık ise bir seçeneğe ait toplam çizgi sayısıdır. Şurası aklında kalsın tamam mı: Sıklık tablosundaki sayıların toplamı, ankete katılan toplam kişi sayısına daima eşittir.",
  example:
    "12 arkadaşına en sevdiği meyveyi sordun. Elmayı 5, muzu 4, üzümü ise 3 kişi seçti. Çetele tablosunda elmanın beşli bir demeti, muzun 4 çizgisi, üzümün 3 çizgisi olur. Sıklık tablosunda ise bu sayılar doğrudan rakamla yazılır. 5 artı 4 artı 3, toplam 12 eder. En yüksek sıklık 5 ile elmadır; en düşük sıklık 3 ile üzümdür. Tablo sayesinde en çok ve en az tercih edilenleri bir bakışta görürsün.",
  hint: "gold",
  warning:
    "Altın İpucu! Çetelede üstten çizgi çekilmiş beşli demeti 4 sanma yanılgısına sakın düşme. O üstteki bağlayıcı çizgi de beşinci kişiyi temsil eder. Sayıları topladığında kişi sayısına eşit çıkmıyorsa bir çizgiyi atlamış olabilirsin. Toplamı kişi sayısıyla her zaman doğrula.",
  life:
    "Bunu sınıf oylamasında da kullanırsın. Teneffüste bahçe, kütüphane ve koridor seçenek olsun. Her arkadaş bir yere bir çizgi koyar. En uzun çetele, en çok istenen yerdir. Çizgileri saymadan karar vermek, veriyi atlamak olur.",
  recap: [
    "Veri, belli bir soruya verilen cevaplardır. Sıklık, bir seçeneğin kaç kez çıktığıdır.",
    "Çeteledeki beşinci çizgi de bir sayıdır. Sıklıkların toplamı kişi sayısına eşittir.",
    "5, 4 ve 3 sıklığında en çok seçilen elmadır. Toplam 12 kişidir.",
  ],
  conceptSeal: "Sıklık tablosu, dağınık cevapları sayılabilir kılar.",
  voiceSeal: "En yüksek sıklığı ve toplamın neden kişi sayısına eşit olduğunu söylersin.",
  outcomes: [
    "Veri, tek bir sorunun cevaplarından oluşur.",
    "Sıklık, seçeneğin tekrar sayısıdır.",
    "Sıklık toplamı, cevap veren kişi sayısına eşittir.",
  ],
  scene: "chart",
  parentNote:
    "Çocuğunuz çetele ile sıklık tablosunu birbirine bağlar. Evde 5 elma, 4 muz ve 3 üzümün toplamının 12 kişi ettiğini konuşmak yeter. En çok seçilen elmadır.",

};

export const JUNIOR_MAT_18 = juniorLessonFromScenario(JUNIOR_MAT_18_SCENARIO);
