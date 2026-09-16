#!/usr/bin/env tsx
/**
 * Super Admin — eski akademi gövdesini nihai müfredat iskeletine sıfırlar.
 *
 *   npx tsx scripts/ops-reset-academy-ingest-skeleton.ts
 *
 * Yazar: docs/curriculum/*.md (NİHAİ başlık + 4-beat iskelet)
 *        lib/academy/curricula/<sku>/section_*.ts (ingest)
 *        boş cue JSON + boş bake timings
 * Silmez: vitrin SKU, sınav havuzu, satın alma.
 * Siler: kapak (*-1-eye.*), cue JPG, konuşma MD, demo MP4.
 */

import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  camelCaseExportPrefix,
  defaultOutFolderForSlug,
  ingestCourseSections,
} from "./ingest-course-sections";

const ROOT = process.cwd();

type SkeletonSection = {
  title: string;
  minutesLow: number;
  minutesHigh: number;
  screen: string;
  punchcards: readonly string[];
  siraSende: string;
  objective: string;
};

type SkeletonCourse = {
  slug: string;
  masteryFile: string;
  moduleCode: string;
  title: string;
  instructor: string;
  category: string;
  audience: readonly string[];
  methodology: string;
  voice: string;
  voiceGender: "female" | "male";
  voiceStyle: string;
  examPrefix: string;
  poolRef: string;
  sections: readonly SkeletonSection[];
};

function midpoint(low: number, high: number): number {
  return Math.round(((low + high) / 2) * 10) / 10;
}

function estimatedWords(minutes: number): number {
  return Math.max(200, Math.round(minutes * 140));
}

function sectionBody(_section: SkeletonSection): string {
  return `Bu ders gövdesi taze ingest bekler. Eski makale metni, punchcard şablonu, canlı ekran tarifi ve donuk görsel bağları burada durmaz.

Yayın bandı compact makaledir. Tam gövde taze ingest ile basılacaktır. Ses mührü taze bake sonrası açılır. Vatandaş karaoke cue ve WAV olmadan bağlanmaz.`;
}

const COURSES: readonly SkeletonCourse[] = [
  {
    slug: "01_office_ai",
    masteryFile: "01_office_ai_mastery.md",
    moduleCode: "CURR-OFFICE-AI-101",
    title: "İş Hayatında ve Ofiste Yapay Zekâ (Excel, Word, PowerPoint & E-Posta Otomasyonu)",
    instructor: "Eğitmen",
    category: "KATMAN 1.1 — Ekmek Teknesi / Kitlesel Eğitim Serisi (Pazarın %80'i / Temel & Başlangıç Seviyesi)",
    audience: [
      "Beyaz yakalı ofis çalışanları",
      "Muhasebe ve finans uzmanları",
      "İnsan kaynakları uzmanları",
      "Yönetici asistanları",
      "Kamu personeli",
      "KOBİ çalışanları",
      "İş hayatına hazırlanan üniversite öğrencileri",
    ],
    methodology:
      "Canlı diyalog ve sen dili, sakin ve adım adım ekran rehberliği, sıfır kodlama, yüksek verim odaklı pratik ofis çözümleri.",
    voice: "Callirrhoe",
    voiceGender: "female",
    voiceStyle: "Canlı diyalog ve sen dili, sakin ve adım adım ekran rehberliği",
    examPrefix: "q_off_",
    poolRef: "lib/academy/exam-pools.ts#OFFICE_AI_EXAM_QUESTIONS",
    sections: [
      {
        title: "Tablonu Konuştur: Düzensiz Excel → Düzenli Tablo",
        minutesLow: 9,
        minutesHigh: 10,
        screen: "Gerçek muhasebe dökümü: birleştirilmiş hücre, boş satır, tarih karmaşası; AI ile formül yazdırma (F2, Alt+F11).",
        punchcards: ["Düzensiz Tablo", "Temizle Şimdi", "Formülü Sor"],
        siraSende: "Kendi dosyandan 50 satırlık düzensiz tabloyu düzenle, ekran görüntüsünü sakla.",
        objective:
          "Düzensiz Excel tablosunu düzenleyip AI ile formül yazdırmayı göstermek; F2 ve Alt+F11 cue kilidini canlı ekranda oturtmak.",
      },
      {
        title: "Rapor Otomasyonu: Tablodan Yönetim Özetine",
        minutesLow: 10,
        minutesHigh: 11,
        screen: "Aynı tablodan özet tablo + grafik + 5 maddelik yönetici özeti; Word'e tek tık aktarım.",
        punchcards: ["Özet Çıkar", "Grafik Kur", "Rapora Dök"],
        siraSende: "Bu haftaki işinden 1 sayfalık özet rapor üret.",
        objective: "Temiz tablodan yönetici özeti ve grafik üretip Word'e aktarma akışını göstermek.",
      },
      {
        title: "Sunum Fabrikası: Metinden Slayta",
        minutesLow: 8,
        minutesHigh: 10,
        screen: "Uzun rapordan 8 slaytlık taslak; tasarım tutarlılığı + konuşmacı notları.",
        punchcards: ["Taslak Çıkar", "Not Ekle", "Sadeleştir"],
        siraSende: "1 sunumunu 8 slayta indir, notlarını yazdır.",
        objective: "Uzun metinden tutarlı slayt taslağı ve konuşmacı notu üretmeyi göstermek.",
      },
      {
        title: "E-Posta Akışı: Gelen Kutusu Sıfırlama",
        minutesLow: 7,
        minutesHigh: 9,
        screen: "47 okunmamış e-posta: tasnif → taslak cevap → takip listesi; nazik-red + bilgi-istek şablonları.",
        punchcards: ["Tasnifle", "Taslak Yaz", "Takibe Al"],
        siraSende: "Gelen kutunu 30 dakikada sıfırla (şablonla).",
        objective: "Gelen kutusunu tasnif, taslak ve takip şablonlarıyla sıfırlama rutinini göstermek.",
      },
      {
        title: "İstisnalar & Hata Avı: AI Yanılınca",
        minutesLow: 9,
        minutesHigh: 11,
        screen: "Halüsinasyon gören formül, yanlış tarih, uydurma toplama: 3 gerçek hata + yakalama checklist'i.",
        punchcards: ["Kontrol Et", "Kaynağa Sor", "Kilit Vur"],
        siraSende: "Ders 1'deki tabloda 3 olası hatayı işaretle.",
        objective: "AI yanılınca formül/tarih/toplama hatalarını yakalama checklist'ini göstermek.",
      },
      {
        title: "Haftalık Sistem: 30 Dakikalık Rutin",
        minutesLow: 8,
        minutesHigh: 10,
        screen: "Pazartesi–Cuma tekrarlanabilir rutin; 3 hazır şablonun kurulumu; sınav formatı tanıtımı.",
        punchcards: ["Rutin Kur", "Şablon Sakla", "Sınava Gir"],
        siraSende: "Rutinini 5 iş günü uygula, süre kazancını not et.",
        objective: "Haftalık 30 dakikalık ofis rutinini kapanış dersi olarak kurmak; sınav bu dersten sonra açılır.",
      },
    ],
  },
  {
    slug: "02_ecommerce_ai",
    masteryFile: "02_ecommerce_ai_mastery.md",
    moduleCode: "CURR-ECOMMERCE-AI-102",
    title: "E-Ticaret ve Pazaryeri Yapay Zekâ Asistanlığı (Trendyol, Hepsiburada, Amazon & Shopify)",
    instructor: "Eğitmen",
    category: "KATMAN 1.2 — Ekmek Teknesi / Kitlesel Eğitim Serisi (Pazarın %80'i / Temel & Başlangıç Seviyesi)",
    audience: [
      "Pazaryeri satıcıları",
      "KOBİ sahipleri",
      "E-ticaret operasyon sorumluları",
      "Dropshipping girişimcileri",
      "Evden satış yapanlar",
    ],
    methodology:
      "Canlı diyalog ve sen dili, adım adım ekran rehberliği, sıfır kodlama, satış ve verimlilik odaklı pratik çözümler",
    voice: "Kore",
    voiceGender: "female",
    voiceStyle: "Canlı diyalog ve sen dili, sakin ekran rehberliği",
    examPrefix: "q_ec_",
    poolRef: "lib/academy/exam-pools.ts#ECOMMERCE_AI_EXAM_QUESTIONS",
    sections: [
      {
        title: "Mağaza Röntgeni: Nerede Kan Kaybediyorsun",
        minutesLow: 8,
        minutesHigh: 10,
        screen: "Gerçek satıcı paneli: iade nedeni, düşük dönüşen liste, cevapsız soru analizi.",
        punchcards: ["Röntgen Çek", "Kaybı Bul", "Öncelik Diz"],
        siraSende: "Kendi/örnek mağazada 3 kayıp noktası işaretle.",
        objective: "Mağaza panelinde iade, düşük dönüşüm ve cevapsız soru kayıplarını önceliklendirmeyi göstermek.",
      },
      {
        title: "Liste Hızlandırma: Başlık + Açıklama Sistemi",
        minutesLow: 9,
        minutesHigh: 11,
        screen: "10 ürünü 30 dakikada: SEO başlık kalıbı + açıklama iskeleti + varyant dili.",
        punchcards: ["Başlık Kur", "Açıkla", "Varyant Yaz"],
        siraSende: "5 ürününü kalıpla yeniden yaz.",
        objective: "Pazaryeri başlık ve açıklama kalıbıyla listeleme hızını artırmayı göstermek.",
      },
      {
        title: "Yorum & Soru Madeni: İade Düşürme",
        minutesLow: 9,
        minutesHigh: 10,
        screen: "200 yorumun tasnifi: beden/renk/kargo şikâyeti → liste düzeltmesi.",
        punchcards: ["Yorum Tara", "Örüntü Bul", "Listeyi Düzelt"],
        siraSende: "50 yorumunu tasnifle, 3 düzeltme yap.",
        objective: "Yorum ve sorulardan iade örüntüsü çıkarıp listeyi düzeltmeyi göstermek.",
      },
      {
        title: "Rakip & Fiyat Radarı: Kör Uçma",
        minutesLow: 8,
        minutesHigh: 10,
        screen: "Rakip liste + fiyat + kampanya takibi; BuyBox/reklam kararı.",
        punchcards: ["Rakibi İzle", "Fiyatı Gör", "Karar Ver"],
        siraSende: "5 rakibi tabloya diz, haftalık takip kur.",
        objective: "Rakip fiyat ve BuyBox kararını kör uçmadan tabloya dökmeyi göstermek.",
      },
      {
        title: "Kampanya & Reklam Metni: Tıklatan Dil",
        minutesLow: 8,
        minutesHigh: 10,
        screen: "Aynı ürün 3 kampanya dili; reklam metni A/B iskeleti.",
        punchcards: ["Kampanya Yaz", "Test Kur", "Ölç"],
        siraSende: "1 kampanyana 3 metin varyantı yaz.",
        objective: "Kampanya ve reklam metni varyantlarını ölçülebilir iskelete oturtmak.",
      },
      {
        title: "Haftalık Operasyon Rutini + Sınav Köprüsü",
        minutesLow: 8,
        minutesHigh: 10,
        screen: "90 dakikalık haftalık bakım rutini; 3 şablon; sınav köprüsü.",
        punchcards: ["Rutin Kur", "Şablon Sakla", "Sınava Gir"],
        siraSende: "Rutini 2 hafta uygula, listeleme süreni ölç.",
        objective: "Haftalık mağaza bakım rutinini kurup sınav köprüsünü açmak.",
      },
    ],
  },
  {
    slug: "03_social_media_ai",
    masteryFile: "03_social_media_factory.md",
    moduleCode: "CURR-SOCIAL-MEDIA-AI-103",
    title:
      "Yapay Zekâ ile Sosyal Medya İçerik Üretimi ve Görsel/Video Fabrikası (Midjourney, Runway, Kling & CapCut)",
    instructor: "Eğitmen",
    category: "KATMAN 1.3 — Sosyal Medya, Görsel ve Video Otomasyonu (Uçtan Uca Dijital İçerik Fabrikası)",
    audience: [
      "İçerik üreticileri",
      "Sosyal medya yöneticileri",
      "KOBİ sahipleri",
      "Dijital pazarlamacılar",
      "E-ticaret markaları",
      "Müşterilerine yeni nesil video içerik hizmeti satmak isteyen ajans girişimcileri",
    ],
    methodology:
      "Canlı diyalog ve sen dili, adım adım iş akışı rehberliği, sıfır kodlama, Midjourney, Canva AI, ElevenLabs, HeyGen, Runway, Kling ve CapCut ile entegre üretim hattı",
    voice: "Zephyr",
    voiceGender: "male",
    voiceStyle: "Genç, pratik, modern ajans ve sosyal medya dili",
    examPrefix: "q_sm_",
    poolRef: "lib/academy/exam-pools.ts#SOCIAL_MEDIA_AI_EXAM_QUESTIONS",
    sections: [
      {
        title: "İçerik Stoku: 1 Fikirden 10 Parça",
        minutesLow: 8,
        minutesHigh: 9,
        screen: "1 ürün/hizmet → 10'luk içerik takvimi (Reels + görsel + metin).",
        punchcards: ["Fikir Ver", "Çoğalt", "Takvime Diz"],
        siraSende: "1 haftalık 7'li takvim çıkar.",
        objective: "Tek fikirden 10 parçalık içerik takvimi üretmeyi göstermek.",
      },
      {
        title: "Görsel Hattı: Ürün Çekimi + Afiş",
        minutesLow: 9,
        minutesHigh: 11,
        screen: "Telefon fotoğrafı → temiz fon → afiş varyantları (canlı araç).",
        punchcards: ["Fonu Temizle", "Afiş Diz", "Varyant Çıkar"],
        siraSende: "3 ürününe 3'er görsel varyantı.",
        objective: "Ham ürün fotoğrafından temiz fon ve afiş varyantı hattını göstermek.",
      },
      {
        title: "Video Hattı: Reels Kurgu Sistemi",
        minutesLow: 10,
        minutesHigh: 12,
        screen: "Ham çekim → altyazı → kesit → kapak: 15 dakikalık hat (CapCut canlı).",
        punchcards: ["Kes", "Altyazı Bas", "Kapak Koy"],
        siraSende: "1 Reels'i hat ile baştan kurgula.",
        objective: "Reels kurgu hattını kesit, altyazı ve kapak ile göstermek.",
      },
      {
        title: "Metin Hattı: Açıklama + Hashtag + CTA",
        minutesLow: 7,
        minutesHigh: 9,
        screen: "Aynı video 3 açıklama dili; CTA ve sabit yorum şablonu.",
        punchcards: ["Açıkla", "CTA Koy", "Sabitle"],
        siraSende: "5 eski gönderine yeni açıklama yaz.",
        objective: "Açıklama, CTA ve sabit yorum şablonunu aynı videoya uygulamayı göstermek.",
      },
      {
        title: "Kalite Kapısı: AI Kokusu Temizliği",
        minutesLow: 8,
        minutesHigh: 10,
        screen: "6 parmak, bozuk logo, telifli yüz: 5 tipik hata + düzeltme.",
        punchcards: ["Hatayı Gör", "Temizle", "Onayla"],
        siraSende: "3 çıktındaki hatayı işaretle, düzelt.",
        objective: "AI görsel/video hatalarını kalite kapısından geçirmeyi göstermek.",
      },
      {
        title: "Yayın Rutini: Haftada 3 + Sınav Köprüsü",
        minutesLow: 8,
        minutesHigh: 10,
        screen: "Planlama aracına toplu yükleme; ölçüm tablosu; sınav köprüsü.",
        punchcards: ["Toplu Yükle", "Ölç", "Sınava Gir"],
        siraSende: "2 hafta × haftada 3 yayın yap.",
        objective: "Haftada 3 yayın rutinini kurup sınav köprüsünü açmak.",
      },
    ],
  },
  {
    slug: "04_chatbot_nocode",
    masteryFile: "04_chatbot_mastery.md",
    moduleCode: "CURR-CHATBOT-NOCODE-104",
    title: "Müşteri Hizmetleri ve Satış İçin Kodsuz WhatsApp / Web Chatbot Kurulumu (Voiceflow & Botpress)",
    instructor: "Eğitmen",
    category:
      "KATMAN 1.4 — Dijital Asistanlık ve Müşteri İletişim Otomasyonu (Pazarın En Çok Talep Ettiği Gelir Kapısı)",
    audience: [
      "KOBİ'ye kurulum satacak freelancer adayları",
      "Yeni mezunlar",
      "Ajans çalışanları",
      "Teknik meraklı işletme personeli",
    ],
    methodology:
      "Canlı diyalog ve sen dili, adım adım görsel akış tasarımı, sıfır kodlama, randevu ve teslim seti odaklı uygulamalar",
    voice: "Puck",
    voiceGender: "male",
    voiceStyle: "Teknik, net, otomasyon odaklı erkek sesi; adım adım görsel akış rehberliği",
    examPrefix: "q_bot_",
    poolRef: "lib/academy/exam-pools.ts#CHATBOT_NOCODE_EXAM_QUESTIONS",
    sections: [
      {
        title: "KOBİ Acısı: Kaçan Mesaj, Kaçan Randevu",
        minutesLow: 8,
        minutesHigh: 9,
        screen: "Gerçek işletme WhatsApp'ı: 23 cevapsız mesajın maliyeti; botun çözeceği 3 akış.",
        punchcards: ["Acıyı Gör", "Akışı Çiz", "Kapsamı Kapat"],
        siraSende: "1 tanıdık işletmenin mesaj yükünü 1 günde say.",
        objective: "Kaçan mesaj/randevu acısını 3 bot akışına indirmeyi göstermek.",
      },
      {
        title: "İlk Bot: Karşılama + SSS + Randevu",
        minutesLow: 10,
        minutesHigh: 12,
        screen: "Voiceflow'da sıfırdan: karşılama → SSS → randevu toplama → tabloya yazma.",
        punchcards: ["Karşıla", "SSS Kur", "Randevu Al"],
        siraSende: "Kendi demo botunu kur, 5 soruya cevap verdir.",
        objective: "Karşılama, SSS ve randevu düğümünü sıfırdan kurmayı göstermek.",
      },
      {
        title: "WhatsApp Bağlantısı: Canlıya Alma",
        minutesLow: 9,
        minutesHigh: 11,
        screen: "Test numarasına bağlama, onay akışı, düşme senaryosu (bot → insan devri).",
        punchcards: ["Bağla", "Test Et", "Devret"],
        siraSende: "Botunu 2 gerçek kişiye test ettir.",
        objective: "Botu WhatsApp test hattına bağlayıp insan-devret eşiğini göstermek.",
      },
      {
        title: "Bozulunca: Yanlış Anlama + Öfke Senaryosu",
        minutesLow: 9,
        minutesHigh: 10,
        screen: "Küfür/ısrar/konu dışı: guard cümleleri, insan-devret eşiği, log okuma.",
        punchcards: ["Sınırı Çiz", "Devret", "Log Oku"],
        siraSende: "5 saldırı cümlesi yaz, botun cevabını düzelt.",
        objective: "Öfke ve konu dışı senaryoda guard + insan-devret akışını göstermek.",
      },
      {
        title: "Teslim Seti: Keşif + Teklif + Kurulum Checklist",
        minutesLow: 10,
        minutesHigh: 12,
        screen: "1 sayfalık keşif formu + teklif şablonu + 15 maddelik canlıya-alım listesi.",
        punchcards: ["Keşif Yap", "Teklif Ver", "Teslim Et"],
        siraSende: "1 hayali KOBİ'ye keşif + teklif doldur.",
        objective: "Keşif, teklif ve teslim checklist'ini doldurulabilir sete çevirmek.",
      },
      {
        title: "İlk Müşteri Oyunu: Pilot Kapatma + Sınav Köprüsü",
        minutesLow: 8,
        minutesHigh: 10,
        screen: "Ücretsiz demo → pilot → bakım merdiveni; portföy kaydı; 06'ya köprü.",
        punchcards: ["Demo Ver", "Pilot Kapat", "Sınava Gir"],
        siraSende: "3 işletmeye demo mesajı at (şablonla).",
        objective: "Demo-pilot-bakım merdivenini kurup sınav köprüsünü açmak.",
      },
    ],
  },
  {
    slug: "05_prompt_practice",
    masteryFile: "05_prompt_engineering_mastery.md",
    moduleCode: "CURR-PROMPT-PRACTICE-105",
    title: "Pratik Prompt Mühendisliği ve Günlük Üretkenlik Rehberi (ChatGPT, Claude & Perplexity)",
    instructor: "Eğitmen",
    category: "KATMAN 1.5 — Pratik Prompt Mühendisliği ve Bilişsel Üretkenlik (Katman 1 Büyük Kapanış Modülü)",
    audience: ["Günlük işlerinde yapay zekâyı sistemli kullanmak isteyenler", "Öğrenciler", "Serbest çalışanlar"],
    methodology:
      "Canlı diyalog ve doğrudan sen hitabı, uygulamalı prompt şablonları, rol + bağlam + format, sıfır kodlama",
    voice: "Callirrhoe",
    voiceGender: "female",
    voiceStyle: "Canlı diyalog ve sen dili, uygulamalı şablon odaklı anlatım",
    examPrefix: "q_pr_",
    poolRef: "lib/academy/exam-pools.ts#PROMPT_PRACTICE_EXAM_QUESTIONS",
    sections: [
      {
        title: "Neden Saçmalıyor: 5 Kötü İstem",
        minutesLow: 7,
        minutesHigh: 8,
        screen: "Aynı sorunun 5 kötü soruluşu + 5 cevabın çöküşü, yan yana.",
        punchcards: ["Kötüyü Gör", "Farkı Yakala"],
        siraSende: "Kendi 3 kötü istemini yaz, nedenini işaretle.",
        objective: "Kötü istemin neden saçmalattığını 5 yan yana örnekle göstermek.",
      },
      {
        title: "İyi İstem Reçetesi: Rol + Bağlam + Format",
        minutesLow: 8,
        minutesHigh: 10,
        screen: "1 reçete × 3 araç (ChatGPT/Claude/Perplexity) aynı görevde.",
        punchcards: ["Rol Ver", "Bağlam Koy", "Format İste"],
        siraSende: "Reçeteyle 1 ödev / 1 iş metni yazdır.",
        objective: "Rol + bağlam + format reçetesini üç araçta aynı görevde göstermek.",
      },
      {
        title: "Araştırma & Özet: Kaynakla Çalış",
        minutesLow: 7,
        minutesHigh: 9,
        screen: "Perplexity ile kaynaklı araştırma; alıntı doğrulama.",
        punchcards: ["Kaynak Sor", "Özet Çıkar", "Doğrula"],
        siraSende: "1 konuda 5 kaynaklı 1 sayfa özet.",
        objective: "Kaynaklı araştırma ve alıntı doğrulama akışını göstermek.",
      },
      {
        title: "Yazı & Çeviri: Ton Ayarı",
        minutesLow: 7,
        minutesHigh: 8,
        screen: "Aynı metin: resmi / samimi / satış tonu; TR↔EN çeviri kalite farkı.",
        punchcards: ["Ton Seç", "Çevir Bak", "Cilala"],
        siraSende: "1 e-postanı 3 tonda yeniden yazdır.",
        objective: "Aynı metni üç tonda ve çeviri kalite farkıyla göstermeyi göstermek.",
      },
      {
        title: "Tablo & Plan: Günlük Hayat Kısayolları",
        minutesLow: 7,
        minutesHigh: 9,
        screen: "Seyahat planı, bütçe tablosu, ders programı: 3 hazır kalıp.",
        punchcards: ["Kalıp Kullan", "Listele", "Plana Dök"],
        siraSende: "1 haftalık planını kalıpla çıkar.",
        objective: "Günlük plan ve tablo kalıplarını uygulamayı göstermek.",
      },
      {
        title: "10 Promptluk Cep Seti + Sınav Köprüsü",
        minutesLow: 7,
        minutesHigh: 9,
        screen: "Kopyala-yapıştır 10'luk setin kurulumu; 01'e köprü.",
        punchcards: ["Seti Kur", "Sınava Gir", "Ofise Geç"],
        siraSende: "Seti 7 gün kullan, en çok kullandığın 3'ünü işaretle.",
        objective: "10 promptluk cep setini kurup 01 ofis köprüsünü ve sınavı açmak.",
      },
    ],
  },
];

const LESSON_KEYS = COURSES.flatMap((course) =>
  course.sections.map((_, index) => `${course.slug}-${index + 1}`),
);

function renderMasterMarkdown(course: SkeletonCourse): string {
  const sectionRows = course.sections.map((section, index) => {
    const minutes = midpoint(section.minutesLow, section.minutesHigh);
    const words = estimatedWords(minutes);
    return `  - { sectionNumber: ${index + 1}, key: "s${index + 1}", title: ${JSON.stringify(section.title)}, targetDurationMinutes: ${minutes}, estimatedWordCount: ${words} }`;
  });
  const totalMinutes = course.sections.reduce(
    (sum, section) => sum + midpoint(section.minutesLow, section.minutesHigh),
    0,
  );
  const roundedTotal = Math.round(totalMinutes * 10) / 10;
  const audienceYaml = course.audience.map((row) => `  - ${JSON.stringify(row)}`).join("\n");
  const bodySections = course.sections
    .map((section, index) => {
      const n = index + 1;
      const minutes = midpoint(section.minutesLow, section.minutesHigh);
      const words = estimatedWords(minutes);
      const wordLabel = words.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
      return `# BÖLÜM ${n}: ${section.title}

**Tahmini Okuma / Anlatım Süresi:** ~${minutes} Dakika (~${wordLabel} Kelime)
**Eğitmen:** ${course.instructor.split(" (")[0]}
**Pedagojik Amaç:** ${section.objective}

---

${sectionBody(section)}
`;
    })
    .join("\n");

  return `---
slug: "${course.slug}"
moduleCode: "${course.moduleCode}"
title: ${JSON.stringify(course.title)}
instructor: ${JSON.stringify(course.instructor)}
category: ${JSON.stringify(course.category)}
layer: 1
targetAudience:
${audienceYaml}
methodology: ${JSON.stringify(course.methodology)}
estimatedTotalMinutes: ${roundedTotal}
format: "compact"
status: "skeleton-awaiting-ingest"
mediaSeal: "none"
voiceConfig:
  voice: "${course.voice}"
  gender: "${course.voiceGender}"
  style: ${JSON.stringify(course.voiceStyle)}
sections:
${sectionRows.join("\n")}
exam:
  passScore: 70
  drawCount: 10
  poolSize: 30
  poolRef: "${course.poolRef}"
  questionIdPrefix: "${course.examPrefix}"
version: "2.0.0-skeleton"
lang: "tr"
---

# ${course.title}

**Müfredat Kodu:** \`${course.moduleCode}\`
**Durum:** NİHAİ_AKADEMİ_MÜFREDAT_RAPORU iskeleti — tam gövde taze ingest bekler.

${bodySections}`;
}

function writeEmptyCue(lessonKey: string): void {
  writeFileSync(join(ROOT, "lib", "academy", "lesson-cues", `${lessonKey}.json`), "[]\n", "utf8");
}

function writeEmptyTimings(lessonKey: string): void {
  const payload = {
    lessonKey,
    pauseSec: 0.4,
    durationSec: 0,
    cacheV: 0,
    pieces: [] as const,
  };
  writeFileSync(
    join(ROOT, "lib", "academy", "lesson-audio-timings", `${lessonKey}.json`),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );
}

function deleteSpokenScripts(): void {
  const dir = join(ROOT, "lib", "academy", "spoken-scripts");
  for (const name of readdirSync(dir)) {
    if (name.endsWith(".md")) {
      unlinkSync(join(dir, name));
    }
  }
}

function deleteAcademyCinemaAndDemo(): void {
  const cinemaDir = join(ROOT, "public", "academy", "cinema");
  for (const name of readdirSync(cinemaDir)) {
    unlinkSync(join(cinemaDir, name));
  }
  const demoDir = join(ROOT, "public", "academy", "demo");
  try {
    for (const name of readdirSync(demoDir)) {
      if (/\.(?:mp4|webm|jpg|jpeg|png|webp|avif)$/iu.test(name)) {
        unlinkSync(join(demoDir, name));
      }
    }
  } catch {
    // demo klasörü yoksa sessiz
  }
}

function main(): void {
  mkdirSync(join(ROOT, "docs", "curriculum"), { recursive: true });
  for (const course of COURSES) {
    writeFileSync(join(ROOT, "docs", "curriculum", course.masteryFile), renderMasterMarkdown(course), "utf8");
    const outFolder = defaultOutFolderForSlug(course.slug);
    const result = ingestCourseSections({
      slug: course.slug,
      srcPath: join(ROOT, "docs", "curriculum", course.masteryFile),
      outDir: join(ROOT, "lib", "academy", "curricula", outFolder),
      exportPrefix: camelCaseExportPrefix(outFolder),
      expectedSections: course.sections.length,
      dryRun: false,
      module: {},
    });
    process.stdout.write(`${result.report}\nOK ${course.slug} skeleton ingest: ${result.sectionNumbers.join(",")}\n`);
  }
  for (const lessonKey of LESSON_KEYS) {
    writeEmptyCue(lessonKey);
    writeEmptyTimings(lessonKey);
  }
  deleteSpokenScripts();
  deleteAcademyCinemaAndDemo();
  process.stdout.write(
    `OK empty cues/timings=${LESSON_KEYS.length}; spoken-scripts, cinema kapak/cue ve demo silindi.\n`,
  );
}

main();
