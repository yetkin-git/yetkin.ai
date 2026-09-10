<!--
  Stüdyo konuşma metni — 04_chatbot_nocode-2
  Duvar saati: 600 sn (10 dk). Cue SSOT: lesson-cues/04_chatbot_nocode-2.json
  Ses: Kaan / Puck. Kod çiti yok. SEN aksı.
  Dört adım: Isınma 90s → Temel Yöntem 210s → İstisna 210s → Özet 90s.
  TTS: 12 doğal nefes bloğu; parça arası 0.3–0.5 sn taze nefes. Tek parça devasa blok yok.
  Karaoke: kısa cümle; her blok 3–4 satır (maks ~36 kelime / 220 karakter).
-->

<!-- cue:cue-01 start:0 end:90 section:Isınma & İş Problemi -->

Tekrar selam. Ben Kaan. İkinci istasyon: Voiceflow tuvali. Dün zihni değiştirdik. Bugün fareyi hareket ettiriyoruz. Kod yok. Lego kutuları var. Ok çekersin. Cümle yazarsın. Web sitesinin sağ altında asistan uyanır. Müşteri prototipi görmeden sözleşme imzalamaz. Tuval kilitliyse satış durur. Sen yorgunsun. Bant bekler. Prototip on beş dakikadır. Sözleşme ondan sonra gelir.

Erişim net. Tarayıcıdan voiceflow.com. Ücretsiz hesap. New Assistant. Boş tuval. Sol çubukta Talk, Capture, Choice, Condition, API. Kartı bırak. Çizgi çek. Gözün korkmasın. Bu Figma değil, diyalog stüdyosu. Kahvenden bir yudum al. Derin bir nefes al. NovaDent karşılama botunu bugün çizeceğiz. Start'tan isme. İsimden vitrine. Vitrinden telefona. Test panelinde kendi adın. Başlıyoruz.

Kapı kapanırsa bant durur. Hesap yoksa bugün bir tane aç. Ücretli plan şart değil. Ücretsiz kotayla ilk oku görmen yeter. Link ezberi yok. Kapı adı yeter. voiceflow.com. New Assistant. Run. Kendi adını yaz. Botun seni selamladığını gör. Sonra ölçekle. Publish sonra. Önce ok.

<!-- cue:cue-02 start:90 end:300 section:Temel Yöntem -->

Soyut tanımları bir kenara bırakıyoruz; doğrudan tuvaldeki üç taşa bakıyoruz. Intent niyettir. Randevu almak. Fiyat sormak. Acil ağrı. Utterance aynı niyetin farklı cümleleridir. Yarın sıra alabilir miyim. Diş hekimine görünmek istiyorum. Acil randevu. Beş cümle yeter. Model gerisini tanır. Entity cımbızdır. Tarih. Saat. Tedavi türü. İmplant. Zirkonyum. Beyazlatma. Voiceflow hazır varlıkları bilir. Özel varlığı sen eklersin. Restoran garsonu da böyle not alır.

Değişken botun cebidir. kullanici_adi. kullanici_telefon. secilen_tedavi. randevu_tarihi. İsim Capture ile kutuya girer. Sonra isimle konuşursun. Skor da kurulur. Çapraşıklık var mı. Tel tedavisi gördün mü. On puan. Şeffaf plak uygun. Condition yol ayırır. İmplant ise implant bloğu. Acil ağrı ise nöbetçi hat. Değilse menü. Telefon on hane değilse geri yolla. Sahte numara kliniğe düşmez. Format kalkanı burada başlar.

Canlı akış altı adım. Start'tan Text: merhaba, adınız. Capture Entire User Response, kullanici_adi. Carousel: üç hekim kartı, randevu butonu. Seçim Condition'a gider. Telefon Capture Phone Number. Kapanış: teşekkürler, numaranıza konum. Run ile test. Widget Settings: logo, turkuaz, karşılama balonu. Publish. Embed kodu üç satır. WordPress veya HTML body kapanışının üstüne yapıştır. Sayfa yenilenir. Sağ altta asistan parlar. Kod ezberi yok. Yapıştır, yenile.

OpenAI burada şart değil. Voiceflow kendi NLU'sunu kullanır. İleride API kartına OpenAI anahtarı takılır. platform.openai.com. Create key. Kutuya yapıştır. Bugün tuval yeter. Kapıyı karıştırma. Önce ok. Sonra beyin. Botpress yarın. Bugün Start, Capture, Carousel, telefon kalkanı. Serbest tıbbi soru yarın belgeye gider. Kapı sırası bozulursa bant karışır. Tuvali bitirmeden belgeye atlama.

<!-- cue:cue-03 start:300 end:510 section:İstisna & Kritik Durum -->

Kritik durum burada başlar. Tuvale şiir yazıp yayınlama. Karşılama uzunsa kimse okumaz. İkinci tuzak: telefonu serbest metin almak. On hane kalkanı yoksa çöp düşer. Üçüncü tuzak: tıbbi cevap. Voiceflow rayıdır. Serbest tıbbi soru yarın Botpress Knowledge Base'de. Dördüncü tuzak: gömme kodu başlığa yapıştırmak. Body kapanışının üstü. Onay sende kalır. Test etmeden Publish basma. Run yeşil değilse yayın yok.

Embed kodunu slayta, WhatsApp'a, GitHub'a basma. Proje kimliği sızmasın. Widget rengi marka. Balon spam olmasın. Her girişte fırlayan balon ziyaretçiyi küstürür. Bir kez. Net cümle. Randevu. Kişisel veriyi testte sahte tut. Gerçek hasta adı yok. KVKK kalkanı. Sen yönetici kal. İlk oku gör. Sonra vitrin. Stajyer her alanı basar. Sen gerekeni basarsın.

Aynı kalkanı erişimde kuruyorsun. voiceflow.com açılmazsa tarayıcıyı değiştir. Hesap doğrulamazsa iş e-postasını dene. Publish griyse Run'da akışı bitir. Embed görünmezse önbelleği kır. Kapı adı yeter. voiceflow.com. New Assistant. Run. Publish. Panik yok. Kapıyı aç. Kendi adınla konuşan botu gör. Üçüncü bölüm belge beynine geçer. Şeker hastasına implant gibi serbest soru orada.

<!-- cue:cue-04 start:510 end:600 section:Özet & Saha Görevi -->

Üç anahtarı cebine koy. Bir: Intent niyet, Utterance cümle, Entity cımbız. İki: değişken cebi ve Condition yol ayırır. Üç: Start, Capture, Carousel, telefon kalkanı, Publish, embed. Kapı voiceflow.com. New Assistant. Run. Kendi adınla konuşan bot görmeden üçüncü bölüme geçme. Orada Botpress belge okur. WhatsApp yarın. Make.com öbür gün. Omurga sırayla kurulur.

Şimdi iki dakikalık kanıt. voiceflow.com'da hesap aç. Start'a tek karşılama yaz. Capture bağla. Yanıtı kullanici_adi'ye kaydet. Test panelinde kendi adını yaz. Botun seni isminle çağırdığını gör. İlk akış okunu çizip kendi adınla konuşan botu görmeden üçüncü bölüme geçme. Kahveni tazele. Bugün tuvalin ilk dilimini geri aldın. Yarın aynı ok masanda olacak. Başladık.
