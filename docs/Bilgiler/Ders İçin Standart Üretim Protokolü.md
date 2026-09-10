Evet, ilk 5 dersin üretim bandı ve yapacağımız iş artık **milisaniyesine kadar netleşti.** Hayallere kapılmadan, cebimizi yakacak API harcamalarına girmeden ve sistemi tıkamadan uygulayacağımız **4 adımlı üretim protokolümüz** hazır.

Yapacağımız işin özü şudur: **Sistem canlıda video yayınlamıyor, sesli ve senkronize kayan yazılı "Akıllı Sinema/Arayüz" çalıştırıyor.**

---

### 🎬 5 Ders İçin Standart Üretim Protokolü

Her ders için sırasıyla şu 4 adımı uygulayacağız:

1. **Konuşma Metninin Hazırlanması (Spoken Script):**
* Makale metninden bağımsız olarak, eğitmenin birebir ağzından çıkacak konuşma metni yazılır.


* Metin yazılırken virgül ve noktalar sık tutulur; uzun cümleler bölünür ki model nefessiz kalıp sesini kısmasın.




2. **Ses ve Zaman Damgası Üretimi (TTS Bake & Timings):**
* Hazırlanan metin `scripts/generate-academy-lesson-audio.ts` derleyicisine verilir.


* Script, `gemini-3.1-flash-tts-preview` modelini kullanarak metni parçalar halinde seslendirir, aralara nefes boşluğu koyar ve tek bir mühürlü `.wav` dosyası üretir.


* Aynı anda, her kelimenin/cümlenin ses dosyasındaki saniyesini içeren `lesson-cues/{key}.json` zaman damgası dosyası otomatik çıkar.




3. **Görsel Katman (İdareli & Statik):**
* Her ders için 1 adet vitrin kapak görseli (Nano Banana ile) üretilip `/public/media/` altına atılır.


* İhtiyaç duyulan kritik ders sahneleri için statik slayt/ekran görüntüleri `lesson-visual-stage` slotlarına tanımlanır.




4. **Mühürleme ve Yayın (Seal):**
* Üretilen ses ve cue dosyası `ACADEMY_MEDIA_SEALED_AUDIO` konfigürasyon listesine eklenir.


* Öğrenci `/oyna` sayfasına girdiğinde platform hiçbir API harcaması yapmadan, sıfır gecikmeyle mükemmel senkronlu dersi oynatmaya başlar.





---

### 📋 İlk 5 Dersin Sıralı Üretim Listesi

Şimdi sırayla bu 5 dersi yukarıdaki banttan geçireceğiz:

* **01_office_ai:** Ofis Yapay Zekâ (Excel, Word, E-posta)
* **02_ecommerce_ai:** E-Ticaret ve Pazaryeri Asistanlığı
* **03_social_media_factory:** Sosyal Medya İçerik ve Görsel Üretimi
* **04_chatbot_setup:** Kodsuz Chatbot ve Müşteri Hizmetleri
* **05_prompt_practice:** Prompt ve Günlük Üretkenlik

---

043 numaralı düzeltme promptunu Cursor'a verip `01_office_ai-1`'deki ses kaymasını ve nefes problemini çözerek banttaki ilk kaliteli örneğimizi mühürleyelim mi?