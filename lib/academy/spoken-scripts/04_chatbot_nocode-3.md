<!--
  Stüdyo konuşma metni — 04_chatbot_nocode-3
  Duvar saati: 600 sn (10 dk). Cue SSOT: lesson-cues/04_chatbot_nocode-3.json
  Ses: Kaan / Puck. Kod çiti yok. SEN aksı.
  Dört adım: Isınma 90s → Temel Yöntem 210s → İstisna 210s → Özet 90s.
  TTS: 12 doğal nefes bloğu; parça arası 0.3–0.5 sn taze nefes. Tek parça devasa blok yok.
  Karaoke: kısa cümle; her blok 3–4 satır (maks ~36 kelime / 220 karakter).
-->

<!-- cue:cue-01 start:0 end:90 section:Isınma & İş Problemi -->

Tekrar selam. Ben Kaan. Üçüncü istasyon: Botpress ve belge beyni. Voiceflow ray çizdi. Hasta raydan çıkar. Yirmi yaş diş, yanağım şişti, antibiyotik alınır mı. SGK zirkonyumu karşılar mı. Emziren anneye anestezi. Turist İngilizce sorar. Her cümleyi kodlamak aylar sürer. Yine eksik kalır. Bu çileyi bugün kapatıyoruz. Bota soru ezberletmiyoruz. Ders kitabı okutuyoruz. Ray yetmez. Beyin gerekir. Belge sadık kalsın.

Erişim net. botpress.com. Studio hesabı. Yeni bot. Sol menüde Knowledge Base, kitap ikonu. Kahvenden bir yudum al. Derin bir nefes al. Bota ders kitabı okutacağız. PDF. Web. SSS. Kod yok. Uydurma kalkanı var. Fallback insana. Eşik yüzde yetmiş. Başlıyoruz.

Kapı kilitliyse bant durur. Hesap yoksa bugün bir tane aç. Ücretsiz kotayla tek sayfa SSS yeter. OpenAI anahtarı da ayrı kapı. platform.openai.com. API keys. Create. Botpress LLM kutusuna yapıştır. Sıcaklık düşük. Bugün belge. Yarın WhatsApp. Make.com öbür gün. Kapı sırası: belge, kalkan, hat. Tersine gitme.

<!-- cue:cue-02 start:90 end:300 section:Temel Yöntem -->

Soyut tanımları bir kenara bırakıyoruz; doğrudan RAG masasına bakıyoruz. RAG restoran gibidir. LLM şeftir. Güzel konuşur. Menüyü uydurabilir. Buna halüsinasyon denir. Retrieval kütüphanecidir. Belgeyi çeker. Şefe uzatır. Bu kağıda sadık kal. Botpress belgeyi parçalar. Sayıya çevirir. Eşik koyarsın. Yüzde yetmiş uyuşmazsa uydurma. Fallback. Bu kalkan hayatı kurtarır. Şef yaratıcıdır. Kütüphaneci titizdir. İkisi birlikte çalışır.

Knowledge Base üç kapı. Documents: temiz metin PDF, Word. Taranmış resim değil. Başlık hiyerarşisi. Web Crawler: site adresini yaz, gezsin. Text FAQ: soru cevap yapıştır. Test: zirkonyum ile lamine farkı. Bot sayfadan damıtır. İngilizce hotel package sorusu sağlık turizminden cevaplar. Tek satır kod yok. Tek PDF. Çok dilli danışman. Sonra eylem: randevu ister misiniz. Beyin konuşur. Satış yine kapanır. Wikipedia maddesi değil. Belge konuşur. Sen kalkanı tutarsın. Uydurma cümle çöptür.

Guardrails emniyet kalkanıdır. Antibiyotik adı isteme. Bot ilaç yazmaz. Teşhis koymaz. Fiyatı kesin vaat etmez. Röntgen olmadan net rakam yok. Sistem prompt: sen klinik asistanısın. Teşhis yok. İlaç yok. Bilinmiyorsa Fallback. Öfkeli cümlede empati, numara al, insana devret. Endişede ağrısız yöntem, randevu. Eşik. Fallback. Duygu. Üç kalkan. Sen mimarsın. Model stajyer. Kontrol sende.

OpenAI kutusu Botpress'te LLM seçimidir. platform.openai.com'dan anahtar. Model: güncel küçük veya orta. Sıcaklık sıfır üç. Sistem talimatı kısa. Kendi belgene sadık kal. Bilmiyorsan uydurma. Anahtarı ekran görüntüsüne koyma. Git'e basma. Kota bitince sessiz düşme. Fallback insana. Sen yönetici kal. Anahtar sızarsa iptal et, yenisini bas. Belge yoksa şef menü uydurur. Önce PDF. Sonra anahtar.

<!-- cue:cue-03 start:300 end:510 section:İstisna & Kritik Durum -->

Kritik durum burada başlar. Kirli PDF okutma. Taranmış resim, karmaşık tablo, silik fiyat. Bot uydurur. İkinci tuzak: eşiği sıfırlamak. Her soruya cevap. Teşhis sızar. Üçüncü tuzak: gerçek hasta dosyasını açık modele yüklemek. Kimlik, röntgen, telefon yok. Maskele. Dördüncü tuzak: Guardrails olmadan canlı. İlaç cümlesi hukuktur. Onay sende kalır. Uç soruyu test et. Fallback düşmezse kalkan yok demektir. Yayın yok.

Aynı kalkanı erişimde kuruyorsun. botpress.com. Studio. Knowledge Base. OpenAI için platform.openai.com. Anahtar kopyala, bir yere yapıştır, kapat. Make.com henüz değil. WhatsApp yarın. Bugün belge ve Fallback. Panik yok. Kapıyı aç. Metinde olan soruyu sor. Metinde olmayanı sor. Uydurmadan düştüğünü gör. Sonra ölçekle. Üç yeşil test olmadan canlı yok. Uydurma cümle bir gecede itibar yer. Kalkan yoksa yayın yok.

Canlıya basmadan üç test. Bilinen soru: doğru sayfa, eylem çağrısı. Uç soru: Fallback, insan adı. Yasak soru: ilaç, teşhis, net fiyat. Bot reddeder, randevu önerir. Üçü yeşil değilse yayın yok. Sen kalkanı tutarsın. Stajyer üretir. Sen silersin. Hukuk ve itibar aynı masada.

<!-- cue:cue-04 start:510 end:600 section:Özet & Saha Görevi -->

Üç anahtarı cebine koy. Bir: RAG belgeye sadık konuşur. Şef uydurmasın. İki: Knowledge Base PDF, web, SSS. Eşik yüzde yetmiş. Üç: Guardrails. Teşhis yok. İlaç yok. Fallback insana. Kapı botpress.com ve platform.openai.com. Kendi belgenle konuşan botu görmeden dördüncü bölüme geçme. Orada Meta WhatsApp Cloud API. Ticaretin kalbi orada atar.

Şimdi iki dakikalık kanıt. Botpress Studio'da boş proje. Knowledge Base'e kendi işinden tek sayfa hizmet veya SSS yapıştır. Önce belgede olan soru. Sonra belgede olmayan uç soru. Uydurmadan Fallback'e düştüğünü izle. Kendi belgenle konuşan botu görmeden dördüncü bölüme geçme. Kahveni tazele. Bugün beynin ilk dilimini geri aldın. Yarın hat resmi olacak. Başladık.
