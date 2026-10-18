import { juniorLessonFromScenario, type JuniorLessonScenario } from "@/lib/junior/scenario";

/**
 * 6. Sınıf Fen Bilimleri. Alınan yol ve yer değiştirme. FB.6.2.2 fiil cümlesi pakette unverified kalır.
 * Film `resolveJuniorPlayback` grafiğidir. Yol ve yer değiştirme parametredir.
 * `SpeedScene` bu dersi çizmez.
 */
export const JUNIOR_FEN_21_SCENARIO: JuniorLessonScenario = {
  key: "jr_06_fen-21",
  title: "Alınan yol ve yer değiştirme",
  teaser:
    "Alınan yol, gidilen bütün izlerin uzunluğudur. Yer değiştirme, başlangıçtan bitişe doğru çizilen yönlü uzaklıktır. Kavramsal Anlayış, ikisini birbirine karıştırmaz. İfade Gücü, aynı gezintide ikisini ayrı sayı ve yönle söylemektir.",
  welcome:
    "Merhaba sevgili çocuklar! Parkta bir tur atıp yine aynı banka oturduğunda çok yol yürümüşsündür; ama yerin değişmemiştir. Okula giderken ise ev ile okul kapısı arasındaki düz uzaklık başka bir sayıdır. Bugün alınan yol ile yer değiştirmeyi ölçeceğiz. Bir yürüyüşü gözlemlemek, toplam iz ile net sonucu ayırır.",
  concept:
    "Alınan yol, hareket boyunca gidilen bütün parçaların uzunluklarının toplamıdır. Yön aramaz; metre cinsinden bir uzunluktur. Yer değiştirme ise başlangıç noktası ile bitiş noktası arasındaki en kısa doğrultudur ve yönü vardır. Başladığın yere dönersen alınan yol sıfırdan büyük olabilir, yer değiştirme ise sıfırdır. Yön değiştirmeden düz gidersen alınan yol ile yer değiştirmenin büyüklüğü eşit olur. Yol zaman grafiğinde alınan yol zaman geçtikçe artar; yer değiştirme yön değişince küçülebilir. Pratik kural: Alınan yol izlerin toplamı, yer değiştirme başlangıçtan bitişe oklu uzaklıktır.",
  example:
    "Parkta 400 metre tur atıp aynı banka dönersen alınan yol 400 metredir, yer değiştirme 0 metredir. Okula doğru 80 metre doğu, sonra 30 metre batı yürürsen alınan yol 80 artı 30, yani 110 metredir. Yer değiştirme 80 eksi 30, yani 50 metre doğudur. Düz bir koridorda 120 metre yürüyüp durursan alınan yol da yer değiştirme de 120 metredir; yön koridorun doğrultusudur. Cetvelle ölçmek bu üç durumu sayıya bağlar.",
  hint: "trap",
  warning:
    "Şimdi sevgili arkadaşım, işte tam bu noktada dikkat etmen gereken kilit nokta. Başa dönünce yer değiştirmeyi alınan yola eşitlemek tuzaktır; o durumda yer değiştirme 0 olur. Yer değiştirmeyi söylerken yönü yazmamak da eksik bırakır. Grafikte yükselen çizgi her zaman yer değiştirme değildir; alınan yol birikerek artar. Alınan yol ve yer değiştirme konusunda kuralın tersini sanmak tuzaktır; ters cümle yanlıştır.",
  life:
    "Bunu sabah evden okul kapısına yürürken deneyebilirsin. Adımlarını sayıp metreye çevirirsen alınan yolu bulursun. Aynı yoldan eve dönünce yer değiştirmen yine eve göredir. Bisikletle parkın çevresini dönüp başa gelirsen yer değiştirme sıfırdır. Defterine küçük bir yol zaman grafiği çizmek iki sayıyı yan yana tutar.",
  recap: [
    "Alınan yol, gidilen bütün parçaların uzunluk toplamıdır.",
    "Yer değiştirme, başlangıçtan bitişe yönlü en kısa uzaklıktır.",
    "Başlangıç noktasına dönünce yer değiştirme sıfır olur.",
  ],
  conceptSeal: "Alınan yol toplam iz, yer değiştirme yönlü net sonuçtur.",
  voiceSeal: "Aynı yürüyüşte alınan yolu ve yer değiştirmeyi sayı ve yönle ayrı söylersin.",
  outcomes: [
    "Alınan yol, izlerin uzunluk toplamıdır.",
    "Yer değiştirme yönlüdür ve başlangıçla bitiş arasındadır.",
    "Başa dönünce yer değiştirme sıfırdır.",
  ],
  scene: "speed",
  parentNote:
    "Çocuğunuz alınan yolu toplam uzunluk, yer değiştirmeyi yönlü net uzaklık diye ayırır. Park turunda yer değiştirmenin sıfır olabileceğini anlatması beklenir. Resmî fiil cümlesi bu derste yeniden doğrulanmış sayılmaz.",
};

export const JUNIOR_FEN_21 = juniorLessonFromScenario(JUNIOR_FEN_21_SCENARIO);
