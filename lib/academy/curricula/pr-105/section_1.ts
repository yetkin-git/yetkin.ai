import type { Section } from "../types";
import { pr105Section } from "./spoken-body";

/**
 * PR-105 ders 1.
 * Konuşma metni bu dosyanın spokenScript alanındadır.
 * API isteği yok.
 */
const spokenScript = `
Merhaba, ben Oğuz.

Neredeyiz? Yapay Zekâ Promt Mühendisliği eğitimindeyiz. Toplam altı ders var, bu da ilk dersimiz. Bu seride ne yapacağız? Sohbet kutusundaki yapay zekâya, yani büyük dil modeline, ne istediğini doğru anlatmayı öğreneceğiz. Ona bir rol vereceğiz, düşünürken adım adım gitmesini isteyeceğiz, çıktıyı satır satır kontrol edeceğiz. Amacımız şu: müşteriye uydurma tek bir cümle bile gitmesin. Bugün bu derste elimize ne geçecek? İstemin dört parçasını birbirinden ayırmayı öğreneceksin. Ders bitince gerçek bir müşteri cevabı için kendi şablonunu yazmış olacaksın.

## Saha

Önce küçük bir itiraf yapayım. Ben de sohbet kutusuna ilk yazdığım istemde «güzel bir cevap yaz» demiştim. Kutu bana süslü bir paragraf döndü. Baktım, çok hoş duruyor ama benim işime yaramıyor. Gelin dürüst olalım, çoğumuz ilk bunu yazıyoruz. Bunda kötü bir şey yok. Sadece kutunun bizim kafamızdaki resmi göremediğini unutuyoruz.

Şimdi somut bir iş koyalım masaya. Sabah dükkânı açtın. Ekranda bir müşteri mesajı var: «Siparişim hâlâ gelmedi, ne zaman gelir?» Yanında kendi notların duruyor. Sipariş dün çıkmış. Kargo firması bugün teslim edememiş. Yeni teslim günü ise sende yok, henüz kimse söylememiş. İş şu: müşteriye kısa ve dürüst bir cevap yazacaksın. En fazla dört cümle olacak. Fiyat yazmayacaksın. Teslim günü uydurmayacaksın.

Bir şeyi baştan söyleyeyim. Kutunun bildiği her şey, senin ona yazdığındır. Notunda olmayan günü kutu bilmez. Bilmediği yerde de boşluğu kendi doldurur. Bütün mesele bu.

## Yanlış ve doğru

Yanlış istem şöyle: «Müşteriye harika bir cevap yaz, ikna edici olsun.» Bu satırda kimin ağzından yazılacağı yok. Kaç cümle olacağı yok. Neyin yazılmayacağı da yok. Kutu da boşluğu kendi bildiği gibi doldurur. Geriye şuna benzer cümleler kalır: «Paketiniz cuma günü elinizde olur.» Cumayı kim söyledi? Kimse. Notunda öyle bir gün yok. Ya da: «Anlayışınız için yüzde on indirim tanımladık.» İndirimi de kimse konuşmadı. Bu iki cümle müşteriye giderse müşteri cumayı bekler, indirimi sorar. Cuma gelmeyince de iade konuşması başlar. O konuşmanın kaynağı senin yazmadığın bir istemdir.

Doğru istem dört parçadan oluşur. Rol, görev, biçim ve kısıt. Hemen tek tek bakalım.

Rol, kutuya kimin ağzından yazacağını söyler: «Sen bir mağaza yazışma asistanısın.»

Görev, tek bir işi söyler: «Geciken kargo için müşteriye cevap yaz.»

Biçim, cevabın şeklini söyler: «Dört cümle yaz. Müşteriye siz diye hitap et.»

Kısıt, yazılmayacak şeyleri söyler: «Fiyat yazma. Teslim günü yazma. Bilmediğin tarihi uydurma.»

Bu dördü yan yana durunca kutunun boşluk doldurma şansı kalmıyor. Biri eksik kalırsa boşluk geri geliyor. Ben ilk zamanlar kısıtı yazmayı hep unuturdum. Sonra müşteriye giden cevaplarda bana ait olmayan sözler görünce kısıtın en önemli parça olduğunu anladım.

Aynı mesajda müşteri fiyatı da sormuş olabilir. Fiyat senin notunda yok. Doğru cevap fiyatı atlar. Yanlış cevap, notta olmayan bir tutarı kendiliğinden uydurur. Fiyatı sen biliyorsan sen yazarsın. Kutunun uydurduğu rakamı müşteriye yapıştırmazsın.

## Şablon

Şimdi bunu kendi şablonuna çevir. Köşeli yerleri kendi işinle değiştir:

Rol: Sen bir mağaza yazışma asistanısın.
Görev: [işi tek cümleyle yaz].
Biçim: Dört cümle. Hitap siz.
Kısıt: Fiyat yazma. Tarih uydurma. Kaynakta olmayan söz verme.

Bugünün işi için köşeli yere şunu yaz: «Geciken kargo için müşteriye cevap yaz.» Yanına ikinci bir iş ekleme. İkinci iş, ikinci istem demektir. Tek kutuda iki iş yazarsan ikisi de birbirine karışır.

Göndermeden önce dört parçayı parmağınla say. Başparmak rol, işaret parmağı görev, orta parmak biçim, yüzük parmağı kısıt. Biri eksikse gönderme. Sayarken biraz gülünç duruyor biliyorum. Ama işe yarıyor.

Cevap gelince yüksek sesle oku. İlk cümle özür diliyor mu? İkinci cümle siparişin dün çıktığını söylüyor mu? Üçüncü cümle bugün teslim edilemediğini söylüyor mu? Dördüncü cümle yeni günü öğrenince haber vereceğini söylüyor mu? Beşinci cümle çıktıysa sil. İçinde fiyat varsa o cümleyi sil. İçinde gün adı varsa o cümleyi de sil. Gerçek tarihi sen biliyorsan sen yazarsın.

## Özet

Kutu cümleyi kurar, sözü sen verirsin. Gönder düğmesi senin düğmendir. Bugün dört parçayı ayırdın ve ilk şablonunu yazdın. Bir de kutunun uydurduğu cümleyi silme alışkanlığını edindin. Bu alışkanlık seni sonraki dersler boyunca da koruyacak.

Bir sonraki derste bu dört parçaya bir satır daha ekleyeceğiz: bağlam. Müşteriye yazılan cevapla ekibe yazılan notun neden aynı olmaması gerektiğini de orada konuşacağız.

Zihnine sağlık. Bir sonraki derste görüşürüz, kendine iyi bak.
`;

export const section1: Section = pr105Section({
  sectionNumber: 1,
  lessonKey: "05_prompt_practice-1",
  title: "İstem Mimarisinin Anatomisi",
  pedagogicalObjective:
    "Öğrenci selamdan sonra eğitimin adını, serinin işini ve bugünün çıktısını duyar. İstemin dört parçasını ayırır ve geciken kargo cevabı için ilk şablonunu yazar.",
  spokenScript,
});
