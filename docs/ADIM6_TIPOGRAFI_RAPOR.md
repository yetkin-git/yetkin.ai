# Adım 6 Raporu — Form Placeholder & Select Tipografisi

**Tarih:** 20 Kasım 2026  
**Kapsam:** `components/ui/input.tsx`, `textarea.tsx`, `smart-textarea.tsx`, `empty-aware-select.tsx`, `app/globals.css` + boş seçenekli formlar (`grant-eligibility-widget`, `project-desk`, `os-cockpit`, `workbench`, `grant-detail-wizard`, `product-create-form`, `job-create-form`, `interactive-task`) ve özel composer alanları.  
**Doğrulama:** `npx tsc --noEmit` geçti.

---

## Yönetici özeti

`font-medium` / `font-semibold` label mirası placeholder metnine kalınlık taşıyordu. Placeholder artık her form yüzeyinde **normal (400) + italik + slate-400**; kullanıcının yazdığı metin **italik değil**. Boş `select` (`value === ""`) aynı placeholder dilini kullanıyor; geçerli seçimde koyu düz `font-medium`’a dönüyor.

---

## 1. Ortak tipografi sözleşmesi

| Sembol | Değer |
|---|---|
| `PLACEHOLDER_TYPO_CLASS` | `not-italic placeholder:font-normal placeholder:italic placeholder:text-slate-400` |
| `selectValueTypoClass("")` | `font-normal italic text-slate-400` |
| `selectValueTypoClass(dolu)` | `not-italic font-medium text-slate-900` |

- `INPUT_SURFACE_CLASS` ve `Textarea` bu sınıfları varsayılan taşır.
- `SmartTextarea` aynı placeholder sınıflarını açıkça ekler.
- `EmptyAwareSelect` sunucu formlarındaki (ör. `os-cockpit`) uncontrolled select’ler için client ada sağlar.

---

## 2. Global CSS

`app/globals.css` içine eklendi:

```css
input::placeholder,
textarea::placeholder {
  font-weight: 400;
  font-style: italic;
}
```

Bileşen dışı ham `input` / `textarea` yüzeylerinde de ince italik placeholder garantilenir.

---

## 3. Select boş seçenek düzeltmeleri

| Dosya | Alanlar |
|---|---|
| `grant-eligibility-widget.tsx` | Sektör, İl |
| `project-desk.tsx` | İl, NACE |
| `os-cockpit.tsx` | NACE, İl (`EmptyAwareSelect`) |
| `workbench.tsx` | Tezgâh `select` alanları |
| `grant-detail-wizard.tsx` | Program, süre |
| `product-create-form.tsx` | Pazaryeri |
| `job-create-form.tsx` | Pathway |
| `interactive-task.tsx` | Slot seçimleri |

Filtre tarzı «Tümü» veya anlamlı boş değer (`Yeni mağaza`) dokunulmadı — bunlar placeholder değil, geçerli seçenek.

---

## 4. Ek composer yüzeyleri

`ai-chat-widget` ve `junior/live-tutor-panel` özel textarea class’larına aynı placeholder tipografisi uygulandı.

---

## Sonuç

Placeholder ve boş select metinleri artık ince italik; dolu alanlar düz ve okunaklı. Tip kontrolü temiz.
