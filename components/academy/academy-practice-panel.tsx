"use client";

import { useState, useEffect } from "react";
import type { AcademyLessonPractice } from "@/lib/academy/lesson-body";
import { AcademyMarkdownRenderer } from "./academy-markdown-renderer";

interface SampleSolution {
  title: string;
  badge: string;
  outputMarkdown: string;
  tips?: string[];
}

const SECTION_SAMPLE_SOLUTIONS: Record<number, SampleSolution> = {
  1: {
    title: "Toplantı Notlarından Yönetici Özeti ve Aksiyon Planı",
    badge: "Bölüm 1 Çözümü",
    outputMarkdown: `### 📌 YÖNETİCİ ÖZETİ
1. **Lojistik Aksaması:** İzmir sevkiyatlarında depodaki barkod arızası sebebiyle 2 günlük gecikme yaşanmaktadır; sevkiyat zincirinin acil müdahaleye ihtiyacı vardır.
2. **Kritik Bütçe Takvimi:** Yeni satın alımların durmaması adına bütçe revizyonunun en geç cuma gününe kadar Mali İşler'e ulaştırılması zorunludur.
3. **Müşteri İade Dalgası:** Son 48 saatte çağrı merkezine ulaşan 45 adet iade talebi nedeniyle kamuoyuna ve müşterilere sunulacak acil bir açıklama metni beklenmektedir.

### 📋 ACİL AKSİYON TABLOSU
| Sorumlu Kişi / Departman | Yapılacak Görev | Kritik Teslim Tarihi / Durum |
|---|---|---|
| **Ahmet Bey (Lojistik)** | Depo barkod sistemindeki arızanın giderilmesi ve sevkiyatın açılması | Acil (Bugün) |
| **Zeynep Hanım (Finans)** | Bütçe revizyon dosyasının Mali İşler onayına sunulması | Cuma mesai bitimi |
| **Burak (Müşteri İlişkileri)** | İadeler için standart kriz açıklama metninin hazırlanması | Yarın 10:00 |
| **Tüm Ekip** | Haftalık operasyonel takip ve durum değerlendirme toplantısı | Gelecek Salı |`,
    tips: [
      "Gerçek müşteri ve çalışan isimlerini istem içine girmeden önce maskelemeyi unutma.",
      "Yapay zekâdan tablo formatında çıktı istediğinde sütun başlıklarını açıkça belirt.",
    ],
  },
  2: {
    title: "Excel ÇOKETOPLA & Formül Teşhis Çözümü",
    badge: "Bölüm 2 Çözümü",
    outputMarkdown: `### 🟢 Türkçe Excel İçin Formül:
\`\`\`excel
=ÇOKETOPLA(D:D; B:B; "İzmir"; D:D; ">5000")
\`\`\`

### 🔵 İngilizce Excel İçin Formül:
\`\`\`excel
=SUMIFS(D:D, B:B, "İzmir", D:D, ">5000")
\`\`\`

### 💡 Formülün Mantığı:
İlk parametre (\`D:D\`) toplanacak satış tutarlarını belirtir. 
Ardından gelen \`B:B; "İzmir"\` birinci koşulu (şube İzmir), \`D:D; ">5000"\` ise tutarın 5.000 TL'den büyük olmasını filtreler.`,
    tips: [
      "Türkçe Excel'de ayraç olarak noktalı virgül (;), İngilizce Excel'de virgül (,) kullanılır.",
      "#BAŞV! (#REF!) hatası alıyorsan aralık sütun sayısını kontrol et.",
    ],
  },
  3: {
    title: "Bozuk Verileri Ayrıştırma ve Kurumsal Tablo Çözümü",
    badge: "Bölüm 3 Çözümü",
    outputMarkdown: `### 📊 Ayrıştırılmış ve Temizlenmiş Tablo:

| Şube / Lokasyon | Yetkili Kişi | Fatura No | Tutar | İşlem / Konu |
|---|---|---|---|---|
| Kadıköy Bayisi | Selin Hanım | FTR-2024-8842 | 14.500 TL | Hatalı ürün iadesi |
| Çankaya Merkez | Ahmet Bey | FTR-2024-9103 | 3.200 TL | İskonto talebi |
| Bornova Deposu | Dr. Burak Bey | FTR-2024-7320 | 28.750 TL | Mükerrer tahsilat iadesi |

### 💡 Veri Cerrahlığı Notu:
Serbest metin içinden fatura desenleri (FTR-YYYY-XXXX) otomatik süzülmüş, tutarlar sayısal standarda kavuşturulmuştur.`,
    tips: [
      "Birkaç satırlık örnek veri vererek desen kuralını (Few-shot prompting) göster.",
      "Tarih ve telefonları tek tip formatta (örn. +90 5XX XXX XX XX) istemeyi unutma.",
    ],
  },
  4: {
    title: "Kurumsal Rapor, Bilgi Notu ve Risk Analiz Çözümü",
    badge: "Bölüm 4 Çözümü",
    outputMarkdown: `### 📌 YÖNETİCİ BİLGİ NOTU (ÖZET)
- **Konu:** Stratejik B2B İş Ortaklığı ve 2026 Hizmet Seviyesi Sözleşmesi
- **Amaç:** Tedarik zinciri risklerini en aza indirmek ve gecikme cezalarını sınırlandırmak.
- **Tavsiye:** Hukuki ihtarlar öncesinde mülayim diplomatik uzlaşı kanalı işletilmelidir.

### 📋 SÖZLEŞME RİSK ANALİZİ
| Madde No | Tespit Edilen Risk | Olasılık / Etki | Önerilen Aksiyon |
|---|---|---|---|
| Madde 4.2 | Gecikme durumunda günlük %1 cezai şart | Yüksek / Finansal | Üst sınır (%10 tavanı) eklenmeli |
| Madde 7.1 | Tek taraflı fesih hakkı bildirim süresi | Orta / Operasyonel | 30 günden 90 güne çıkarılmalı |`,
    tips: [
      "Word raporlarında ton ayarı (Mülayim, Dengeli Kurumsal, Hukuki/İhtari) belirtmeyi unutma.",
      "Yapay zekâdan 3 maddelik hap özet ve aksiyon tablosu iste.",
    ],
  },
  5: {
    title: "5 Slaytlık PowerPoint Sunum İskeleti ve Konuşmacı Notları",
    badge: "Bölüm 5 Çözümü",
    outputMarkdown: `### 🎯 Slayt 1: Yönetici Özeti ve Dönüşüm Hedefleri
- **Vurucu Başlık:** 2026 Ofis Otomasyonu: Haftada 10 Saat Tasarruf
- **3 Hap Madde:**
  1. Rutin veri kopyala-yapıştır işlerinin %80'i yapay zekâya devredildi.
  2. Raporlama ve sunum üretim süresi 4 saatten 20 dakikaya indi.
  3. KVKK ve ticari sır kalkanı ile %100 güvenli ofis standardı kuruldu.
- **Görsel Direktifi:** Sol tarafta dijital verimlilik infografiği, sağda 3 hap madde.
- **Konuşmacı Notu:** *"Değerli yöneticilerim, bugün size sadece yeni bir araç değil, departmanımıza yılda 500 saat kazandıracak operasyonel zihniyeti sunuyorum."*`,
    tips: [
      "Her slaytta en fazla 3 hap madde ve net bir görsel yerleşim direktifi kullan.",
      "PowerPoint'e tek tıkla aktarmak için yapay zekâdan VBA kodu ürettirebilirsin.",
    ],
  },
  6: {
    title: "Zorlu Müşteriye Diplomatik E-Posta Yanıtı ve Görev Matrisi",
    badge: "Bölüm 6 Çözümü",
    outputMarkdown: `### ✉️ Diplomatik Yanıt Taslağı
**Konu:** Re: Sistem Kesintisi ve Geciken Sevkiyat Durumu Hakkında Bilgilendirme

Sayın [Müşteri Yetkilisi],

Öncelikle yaşanan geçici sistem aksaklığının iş süreçlerinize getirdiği yükün farkında olduğumuzu ve bu durumdan ötürü derin üzüntü duyduğumuzu belirtmek isteriz.

Teknik ekiplerimiz depodaki sistemsel kesintiyi tamamen gidermiş olup, siparişiniz öncelikli sevkiyat listesine alınmıştır. Ürünleriniz yarın saat 11:00 itibarıyla adresinize teslim edilmek üzere yola çıkacaktır.

İş birliğimizin ve güveninizin bizim için taşıdığı değeri biliyor, aksaklığı telafi etmek adına bir sonraki sevkiyatınızda ek lojistik desteği sunmaktan memnuniyet duyacağımızı paylaşıyoruz.

Saygılarımızla,  
[Adınız Soyadınız]  
Operasyon Direktörlüğü

### 📋 AKSİYON MATRİSİ
| Görev | Sorumlu | Teslim Saati | Durum |
|---|---|---|---|
| İzmir Depo Sevkiyat Çıkışı | Ahmet Bey | Bugün 17:00 | Hazır |
| Müşteri Memnuniyet Araması | Burak Bey | Yarın 14:00 | Planlandı |`,
    tips: [
      "Öfkeli e-postalarda savunmaya geçmek yerine durumu kabullenip doğrudan çözümü sun.",
      "Şikayet e-postasındaki kişisel verileri ([Müşteri A]) maskelediğinden emin ol.",
    ],
  },
};

export function AcademyPracticePanel({
  sectionNumber,
  practice,
  className = "",
}: {
  sectionNumber: number;
  practice?: AcademyLessonPractice | null;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [userPrompt, setUserPrompt] = useState(practice?.code.source ?? "");
  const [showSolution, setShowSolution] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Sync userPrompt and state when section changes
  useEffect(() => {
    setUserPrompt(practice?.code.source ?? "");
    setCompletedSteps({});
    setShowSolution(false);
    setIsDone(false);
  }, [sectionNumber, practice?.code.source]);

  const initialSource = practice?.code.source ?? "";

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(userPrompt || initialSource);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const solution = SECTION_SAMPLE_SOLUTIONS[sectionNumber] ?? SECTION_SAMPLE_SOLUTIONS[1]!;

  return (
    <aside
      className={`rounded-2xl border border-white/[0.08] bg-slate-900/50 p-5 shadow-xl backdrop-blur-md ${className}`}
      aria-label="İstem ve Alıştırma Paneli"
    >
      {/* Panel Başlığı */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/[0.08] pb-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--safir)]/20 text-sm text-[var(--safir)]">
            ⚡
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-white">
              İstem & Alıştırma Paneli
            </h3>
            <p className="text-[11px] text-slate-400">
              Bölüm {sectionNumber} Pratik Konsolu
            </p>
          </div>
        </div>
        <span className="rounded-full border border-[var(--safir)]/30 bg-[var(--safir)]/10 px-2.5 py-0.5 text-[11px] font-medium text-[var(--safir)]">
          Canlı Simülasyon
        </span>
      </div>

      {/* 1. Parametreler (Varsa) */}
      {practice?.params && practice.params.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Hedef ve Kural Parametreleri
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {practice.params.map((param, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5 text-xs transition-colors hover:border-white/15 hover:bg-white/[0.04]"
              >
                <span className="block text-[10px] font-medium uppercase text-[var(--safir)]">
                  {param.label}
                </span>
                <span className="mt-0.5 block font-semibold text-white">
                  {param.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {/* 2. Uygulama Adımları (Checklist) */}
      {practice?.steps && practice.steps.length > 0 ? (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Uygulama Adım Adım Rehberi
          </p>
          <div className="space-y-2">
            {practice.steps.map((step, idx) => {
              const checked = Boolean(completedSteps[idx]);
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => toggleStep(idx)}
                  className={`flex w-full items-start gap-2.5 rounded-xl border p-2.5 text-left text-xs transition-all ${
                    checked
                      ? "border-emerald-500/30 bg-emerald-950/20 text-emerald-200"
                      : "border-white/[0.06] bg-white/[0.02] text-slate-300 hover:border-white/15 hover:bg-white/[0.04]"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                      checked
                        ? "border-emerald-500 bg-emerald-500 text-slate-950 text-[10px] font-bold"
                        : "border-slate-500 bg-transparent text-transparent"
                    }`}
                  >
                    ✓
                  </span>
                  <span className={checked ? "line-through opacity-75" : ""}>
                    <strong className="font-semibold text-white">{idx + 1}. Adım:</strong> {step}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* 3. Hazır İstem ve Test Konsolu */}
      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            Kullanıma Hazır İstem (Prompt Konsolu)
          </p>
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="inline-flex items-center gap-1 rounded-lg bg-[var(--safir)]/20 px-2.5 py-1 text-xs font-medium text-[var(--safir)] transition-colors hover:bg-[var(--safir)]/30 active:scale-95"
          >
            {copied ? "✓ Kopyalandı!" : "📋 İstemi Kopyala"}
          </button>
        </div>

        <div className="relative">
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            rows={5}
            className="w-full resize-y rounded-xl border border-white/10 bg-slate-950/80 p-3 font-mono text-xs leading-relaxed text-slate-200 shadow-inner focus:border-[var(--safir)] focus:ring-1 focus:ring-[var(--safir)] focus:outline-none"
            placeholder="İsteminizi buraya yazın veya düzenleyin..."
          />
          <button
            type="button"
            onClick={() => setUserPrompt(initialSource)}
            className="absolute right-2.5 bottom-3 text-[10px] text-slate-400 underline hover:text-white"
          >
            Sıfırla
          </button>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-400">
          💡 Bu istemi kopyalayıp ChatGPT, Microsoft Copilot veya Claude penceresine yapıştırarak hemen çalıştırabilirsiniz.
        </p>
      </div>

      {/* 4. Örnek Çözüm & Beklenen Çıktı Görünümü */}
      <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-semibold text-white">
              {solution.title}
            </h4>
            <span className="text-[11px] text-slate-400">{solution.badge}</span>
          </div>
          <button
            type="button"
            onClick={() => setShowSolution((prev) => !prev)}
            className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            {showSolution ? "Çözümü Gizle ▲" : "Örnek Çözümü Göster ▼"}
          </button>
        </div>

        {showSolution ? (
          <div className="mt-3 border-t border-white/[0.06] pt-3 text-xs">
            <div className="rounded-xl bg-slate-950/90 p-3.5 text-[12px] leading-relaxed text-slate-200">
              <AcademyMarkdownRenderer content={solution.outputMarkdown} tone="studio" />
            </div>

            {solution.tips && solution.tips.length > 0 ? (
              <div className="mt-2.5 space-y-1 rounded-lg bg-amber-500/10 p-2.5 text-[11px] text-amber-200 border border-amber-500/20">
                <span className="font-semibold">Önemli Çözüm İpuçları:</span>
                {solution.tips.map((tip, idx) => (
                  <p key={idx}>• {tip}</p>
                ))}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* 5. Alıştırmayı Tamamlama Durumu */}
      <div className="mt-5 flex items-center justify-between border-t border-white/[0.08] pt-3.5">
        <span className="text-xs text-slate-400">
          {isDone ? "🎉 Pratik çalışması uygulandı!" : "Pratik adımlarını tamamladınız mı?"}
        </span>
        <button
          type="button"
          onClick={() => setIsDone((prev) => !prev)}
          className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 ${
            isDone
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-white/10 text-slate-200 hover:bg-white/15 hover:text-white"
          }`}
        >
          {isDone ? "✓ Tamamlandı" : "Alıştırmayı Tamamla"}
        </button>
      </div>
    </aside>
  );
}
