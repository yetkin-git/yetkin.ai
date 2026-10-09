import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/** 6. Sınıf Matematik. Aritmetik ortalama ve açıklık. */
export const JUNIOR_MAT_19_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_mat-19",
  title: "Veri analizi",
  teaser:
    "Aritmetik ortalama, verilerin toplamının veri sayısına bölümüdür. Açıklık, en büyük veri ile en küçük verinin farkıdır. Kavramsal Anlayış, ortalamanın tek bir verinin yerine geçmediğini görmendir. İfade Gücü, 4, 6 ve 8 için hem ortalamayı hem açıklığı söylemektir.",
  welcome:
    "Günün güzel geçiyordur umarım! Gel bakalım bugün önümüzde ne var, birlikte keşfedelim. Hiç bir hafta boyunca her gün attığın adım sayılarını toplayıp bir güne eşit dağıtmayı düşündün mı? İşte o dengeli sayı aritmetik ortalamadır; en yüksek ile en düşük arasındaki fark ise açıklıktır. Bugün seninle verileri bu iki önemli ölçüyle okuyup analiz edeceğiz.",
  concept:
    "Aritmetik ortalama, gruptaki tüm verileri toplayıp veri adedine bölerek bulunur; böylece her verinin eşit paylaştığı ortak bir değer elde edilir. Açıklık ise verilerin en büyüğü ile en küçüğü arasındaki farktır ve grubun ne kadar dağıldığını gösterir. Şurası aklında kalsın tamam mı: Aritmetik ortalama, gruptaki sayılardan biriyle aynı olmak zorunda değildir. Açıklık da ortalamadan tamamen farklı bir kavramdır.",
  example:
    "Bir öğrencinin üç deneme sınavındaki puanları 4, 6 ve 8 olsun. Toplayalım: 4 artı 6 artı 8, 18 eder. Veri sayısı 3 olduğuna göre ortalama 18 bölü 3'ten 6 çıkar. Bu grupta en büyük puan 8, en küçük puan 4'tür; açıklık 8 eksi 4'ten 4 bulunur. Başka bir grupta puanlar 5, 5 ve 8 olsaydı toplam yine 18, ortalama yine 6 olurdu; fakat açıklık 8 eksi 5'ten 3 olurdu. Gördüğün gibi ortalamalar aynı olsa bile açıklıklar farklı olabilir.",
  hint: "trap",
  warning:
    "Tuzaklara Düşme! Ortalamayı bulmak için sadece en büyük ile en küçüğü toplayıp ikiye bölmek bu konunun en yaygın tuzağıdır! Grupta kaç veri varsa hepsini toplayıp veri sayısına bölmelisin. Ayrıca açıklık ile ortalamayı sakın karıştırma; 8 eksi 4 işlemi açıklıktır, ortalama ise 6'dır.",
  life:
    "Bunu haftalık su içme kaydında da kullanırsın. Üç günde 3, 5 ve 7 bardak içtiysen toplam 15 bardaktır. Ortalama 15 bölü 3, yani 5 bardaktır. En çok 7, en az 3 içmişsindir. Açıklık 4 bardaktır. Günler birbirine ne kadar benzediğini açıklık söyler. Tipik günü ise ortalama söyler.",
  recap: [
    "Aritmetik ortalama, toplamın veri sayısına bölümüdür.",
    "Açıklık, en büyük veri ile en küçük verinin farkıdır.",
    "4, 6 ve 8 için ortalama 6, açıklık 4'tür. Aynı ortalama, farklı açıklık taşıyabilir.",
  ],
  conceptSeal: "Ortalama tipik değeri, açıklık yayılmayı söyler.",
  voiceSeal: "Toplamı neden böldüğünü ve açıklığın neden fark olduğunu ayrı söylersin.",
  outcomes: [
    "Ortalama, toplam bölü veri sayısıdır.",
    "Açıklık, en büyük ile en küçüğün farkıdır.",
    "Ortalama listede görünmeyen bir sayı da olabilir.",
  ],
  scene: "chart",
  parentNote:
    "Çocuğunuz 4, 6 ve 8 puanın ortalamasını 6, açıklığını 4 diye hesaplar. Ortalama ile açıklık aynı işlem değildir. Evde üç günlük bardak sayısı yeter.",

};

export const JUNIOR_MAT_19 = juniorLessonFromScenario(JUNIOR_MAT_19_SCENARIO);
