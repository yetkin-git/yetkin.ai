import { describe, expect, it } from "vitest";
import { ACADEMY_MODERATOR, ACADEMY_INSTRUCTORS_BY_VOICE } from "@/lib/academy/instructors";
import {
  ACADEMY_ANNOUNCER_PLAYBACK_RATE,
  ACADEMY_LESSON_LISTEN_PLAYBACK_RATE,
  ACADEMY_MODERATOR_PLAYBACK_RATE,
  academyAnnouncerLessonCue,
  academyInstructorCourtesyHandoff,
  academyLessonListenSpeechSlices,
  academyListenPlaybackRateForSpeaker,
  ensureAcademyInstructorCourtesyTurns,
  insertAcademyLessonTitleAfterCourtesy,
} from "@/archived/lib/academy-studio/lesson-listen";

describe("dersi dinle nezaket ve tempo mühürü", () => {
  it("moderatör sonrası eğitmen teşekkür/selam taşır; başlık nezaketten sonra gelir", () => {
    const courtesy = academyInstructorCourtesyHandoff(ACADEMY_MODERATOR.name);
    expect(courtesy).toContain(`Teşekkürler ${ACADEMY_MODERATOR.name}`);
    expect(courtesy).toContain("herkese merhaba");

    const ensured = ensureAcademyInstructorCourtesyTurns([
      { speaker: "moderator", text: "Mikrofonu devrediyorum..." },
      { speaker: "instructor", text: "Hak belirsizken kare basılmaz." },
    ]);
    expect(ensured[1]!.text.startsWith(courtesy)).toBe(true);
    expect(ensured[1]!.text).toContain("Hak belirsizken kare basılmaz.");

    const titled = insertAcademyLessonTitleAfterCourtesy(courtesy, "Tam Türkçe Tarif");
    expect(titled.indexOf("Teşekkürler")).toBe(0);
    expect(titled.indexOf("Tam Türkçe Tarif")).toBeGreaterThan(titled.indexOf("..."));
  });

  it("hazır nezaket varsa ikinci kez enjekte etmez", () => {
    const handback =
      "Teşekkürler Koray, herkese merhaba. Sağ ol, hoş bulduk. Masayı kurduk, doğrudan sahaya iniyoruz...";
    const ensured = ensureAcademyInstructorCourtesyTurns([
      { speaker: "moderator", text: "Mikrofonu kendisine bırakıyorum..." },
      { speaker: "instructor", text: `${handback} Sahada devam.` },
    ]);
    expect(ensured[1]!.text.startsWith("Teşekkürler Koray")).toBe(true);
    expect(ensured[1]!.text.match(/Teşekkürler Koray/gu)?.length).toBe(1);
  });

  it("senaryo dilimleri anons → moderatör → nezaketli eğitmen sırası taşır", () => {
    const instructor = ACADEMY_INSTRUCTORS_BY_VOICE.Zephyr;
    const body = [
      "Merhaba, yetkin.ai Akademi stüdyosundan selam. Bu yayın senin için. Bugün sahadaki başlığımız: Deneme. Yanımızda alanında uzman Deniz Bey. Mikrofonu kendisine bırakıyorum...",
      "Doğrudan üçüncü paragraf içeriği burada.",
    ].join(" ");
    const slices = academyLessonListenSpeechSlices("Deneme Dersi", body, instructor);
    expect(slices[0]!.speaker).toBe("announcer");
    expect(slices[0]!.text).toContain("Yetkin Akademi.");
    expect(slices[0]!.text).toContain("Deneme Dersi");
    const withCode = academyLessonListenSpeechSlices(
      "Kurulum ve ilk program",
      body,
      instructor,
      "python-temel",
    );
    expect(withCode[0]!.text).toBe(
      academyAnnouncerLessonCue("Kurulum ve ilk program", "python-temel"),
    );
    expect(withCode[0]!.text).toContain("Bölüm Python yüz bir");
    expect(withCode[0]!.text).toContain("Kurulum ve ilk program");
    expect(
      academyAnnouncerLessonCue(
        "Dart dili: tip, boş değer güvenliği ve dürüst derleme",
        "flutter-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Mobil yüz bir. Dart dili: tip, boş değer güvenliği ve dürüst derleme. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Çapraz platform pasaportu: iki ülkeye tek belge",
        "rn-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Çapraz Mobil yüz bir. Çapraz platform pasaportu: iki ülkeye tek belge. Başlıyoruz.",
    );
    expect(academyAnnouncerLessonCue("Ekran koridoru: yığın gezinme ve geri tuşu", "rn-orta")).toBe(
      "Yetkin Akademi. Bölüm Çapraz Mobil yüz iki. Ekran koridoru: yığın gezinme ve geri tuşu. Başlıyoruz.",
    );
    expect(academyAnnouncerLessonCue("Gümrük tercümanı: yerel köprü sözleşmesi", "rn-ileri")).toBe(
      "Yetkin Akademi. Bölüm Çapraz Mobil yüz üç. Gümrük tercümanı: yerel köprü sözleşmesi. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Tiyatro sahnesi: Unity editör ve hiyerarşi perdesi",
        "gam-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Oyun Geliştirme yüz bir. Tiyatro sahnesi: Unity editör ve hiyerarşi perdesi. Başlıyoruz.",
    );
    expect(academyAnnouncerLessonCue("Sahne üstü afiş: Kullanıcı Arayüzü tuvali", "gam-orta")).toBe(
      "Yetkin Akademi. Bölüm Oyun Geliştirme yüz iki. Sahne üstü afiş: Kullanıcı Arayüzü tuvali. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Canlı tiyatro dekor değişimi: adreslenebilir varlık",
        "gam-ileri",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Oyun Geliştirme yüz üç. Canlı tiyatro dekor değişimi: adreslenebilir varlık. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Üretim defteri: model işletmesi ve fırın parti satırı",
        "mlo-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Model İşletmesi yüz bir. Üretim defteri: model işletmesi ve fırın parti satırı. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Ölçek masası: kodun sınırı ve yükün sınırı",
        "sys-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Sistem Tasarımı yüz bir. Ölçek masası: kodun sınırı ve yükün sınırı. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Şablon evdir: boş sayfaya boya dökülmez",
        "canva-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Canva yüz bir. Şablon evdir: boş sayfaya boya dökülmez. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Kapı tabelası: profil bir vitrindir, günlük değil",
        "linkedin-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm LinkedIn yüz bir. Kapı tabelası: profil bir vitrindir, günlük değil. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Plan bir ev haritasıdır, tablo resmi değil",
        "cad-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm AutoCAD yüz bir. Plan bir ev haritasıdır, tablo resmi değil. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Komşu hızlı yazar, bazen uydurur",
        "pra-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Pratik Asistan yüz bir. Komşu hızlı yazar, bazen uydurur. Başlıyoruz.",
    );
    expect(academyAnnouncerLessonCue("Etik güvenlik değerlendirmesi", "sec-temel")).toBe(
      "Yetkin Akademi. Bölüm Siber Güvenlik yüz bir. Etik güvenlik değerlendirmesi. Başlıyoruz.",
    );
    expect(academyAnnouncerLessonCue("Sızma testi metodolojisi", "sec-orta")).toBe(
      "Yetkin Akademi. Bölüm Siber Güvenlik yüz iki. Sızma testi metodolojisi. Başlıyoruz.",
    );
    expect(academyAnnouncerLessonCue("Bellek düzeni", "sec-ileri")).toBe(
      "Yetkin Akademi. Bölüm Siber Güvenlik yüz üç. Bellek düzeni. Başlıyoruz.",
    );
    expect(academyAnnouncerLessonCue("İlişkisel model, tablo ve anahtar", "db-temel")).toBe(
      "Yetkin Akademi. Bölüm Veritabanı yüz bir. İlişkisel model, tablo ve anahtar. Başlıyoruz.",
    );
    expect(academyAnnouncerLessonCue("PostgreSQL mimarisi ve sorgu planı dökümü", "db-orta")).toBe(
      "Yetkin Akademi. Bölüm Veritabanı yüz iki. PostgreSQL mimarisi ve sorgu planı dökümü. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Çok dilli kalıcılık ve Tutarlılık-Erişilebilirlik-Bölünme Toleransı",
        "db-ileri",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Veritabanı yüz üç. Çok dilli kalıcılık ve Tutarlılık-Erişilebilirlik-Bölünme Toleransı. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Blokzincir nedir — dağıtık defter, blok ve zincir bağı",
        "w3-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Web Üç yüz bir. Blokzincir nedir — dağıtık defter, blok ve zincir bağı. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "İleri Solidity — kalıtım, değiştirici ve kütüphane",
        "w3-orta",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Web Üç yüz iki. İleri Solidity — kalıtım, değiştirici ve kütüphane. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Dağıtık Uygulama mimarisi — ön yüz, uygulama ikili arayüzü ve sözleşme sınırı",
        "w3-ileri",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Web Üç yüz üç. Dağıtık Uygulama mimarisi — ön yüz, uygulama ikili arayüzü ve sözleşme sınırı. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Kullanıcı Deneyimi ve Kullanıcı Arayüzü — görev odaklı tasarım",
        "ux-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Tasarım usta sınıfı. Kullanıcı Deneyimi ve Kullanıcı Arayüzü — görev odaklı tasarım. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue("Görsel hiyerarşi ve sekiz piksel ızgara", "ux-orta"),
    ).toBe(
      "Yetkin Akademi. Bölüm Tasarım yüz iki. Görsel hiyerarşi ve sekiz piksel ızgara. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Figma Geliştirici Kipi ve el teslimi disiplini",
        "ux-ileri",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Tasarım yüz üç. Figma Geliştirici Kipi ve el teslimi disiplini. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Ürün yönetimi rolleri — ürün yöneticisi, ürün sahibi, iş analisti",
        "pm-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Ürün Yönetimi yüz bir. Ürün yönetimi rolleri — ürün yöneticisi, ürün sahibi, iş analisti. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue("Çevik manifesto ve çerçeve seçimi", "pm-orta"),
    ).toBe(
      "Yetkin Akademi. Bölüm Ürün Yönetimi yüz iki. Çevik manifesto ve çerçeve seçimi. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Ürün analitiği temelleri — huni ve geri dönüş",
        "pm-ileri",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Ürün Yönetimi yüz üç. Ürün analitiği temelleri — huni ve geri dönüş. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Meta Piksel, Olay Yöneticisi ve ölçüm temeli",
        "mkt-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Pazarlama yüz bir. Meta Piksel, Olay Yöneticisi ve ölçüm temeli. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Google Reklamları hesap ve kampanya türleri haritası",
        "mkt-orta",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Pazarlama yüz iki. Google Reklamları hesap ve kampanya türleri haritası. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Arama Motoru Optimizasyonu temeli — niyet ve sonuç sayfası okuma",
        "mkt-ileri",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Pazarlama yüz üç. Arama Motoru Optimizasyonu temeli — niyet ve sonuç sayfası okuma. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Niş seçimi ve kanal konumlandırma",
        "mnt-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Dijital İçerik yüz bir. Niş seçimi ve kanal konumlandırma. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Kurgu iş akışı ve zaman çizelgesi disiplini",
        "mnt-orta",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Dijital İçerik yüz iki. Kurgu iş akışı ve zaman çizelgesi disiplini. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Ürün araştırması ve talep doğrulama",
        "mnt-ileri",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Dijital İçerik yüz üç. Ürün araştırması ve talep doğrulama. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Excel çalışma kitabı — sayfa, hücre ve adlandırma disiplini",
        "ex-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm İş Zekâsı yüz bir. Excel çalışma kitabı — sayfa, hücre ve adlandırma disiplini. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Power Query ile veri alma, birleştirme ve dönüştürme",
        "ex-orta",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm İş Zekâsı yüz iki. Power Query ile veri alma, birleştirme ve dönüştürme. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Google E-Tablolar formülleri — dizi formülü ve dinamik aralık",
        "ex-ileri",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm İş Zekâsı yüz üç. Google E-Tablolar formülleri — dizi formülü ve dinamik aralık. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "İkna etiği — rıza, şeffaflık ve hata anında kapalı",
        "pd-temel",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Kişisel Gelişim yüz bir. İkna etiği — rıza, şeffaflık ve hata anında kapalı. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Duygusal zekâ haritası — öz farkındalık",
        "pd-orta",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Kişisel Gelişim yüz iki. Duygusal zekâ haritası — öz farkındalık. Başlıyoruz.",
    );
    expect(
      academyAnnouncerLessonCue(
        "Nöro-Dilsel Programlama’ya etik giriş — manipülasyon değil çerçeve",
        "pd-ileri",
      ),
    ).toBe(
      "Yetkin Akademi. Bölüm Kişisel Gelişim yüz üç. Nöro-Dilsel Programlama’ya etik giriş — manipülasyon değil çerçeve. Başlıyoruz.",
    );
    expect(slices.some((slice) => slice.speaker === "moderator")).toBe(true);
    const firstInstructor = slices.find((slice) => slice.speaker === "instructor");
    expect(firstInstructor).toBeTruthy();
    expect(firstInstructor!.text).toContain("Teşekkürler Koray");
    expect(firstInstructor!.text).toContain("herkese merhaba");
    expect(firstInstructor!.prompt).toBe(firstInstructor!.text);
    // NO META IN AUDIO: yönerge / anayasa ses metninde yok.
    expect(firstInstructor!.text).not.toContain("SESLENDİRİLECEK METİN");
    expect(firstInstructor!.text).not.toContain("le-le-me");
    expect(firstInstructor!.text).not.toContain("çayını yudumlarken");
    expect(firstInstructor!.instruction).toContain("çayını yudumlarken");
    expect(firstInstructor!.instruction).toContain("le-le-me");
  });

  it("rol temposu: moderatör 1, eğitmen 0.94, anons 0.96", () => {
    expect(ACADEMY_MODERATOR_PLAYBACK_RATE).toBe(1);
    expect(ACADEMY_LESSON_LISTEN_PLAYBACK_RATE).toBe(0.94);
    expect(ACADEMY_ANNOUNCER_PLAYBACK_RATE).toBe(0.96);
    expect(academyListenPlaybackRateForSpeaker("moderator")).toBe(1);
    expect(academyListenPlaybackRateForSpeaker("instructor")).toBe(0.94);
    expect(academyListenPlaybackRateForSpeaker("announcer")).toBe(0.96);
  });
});
