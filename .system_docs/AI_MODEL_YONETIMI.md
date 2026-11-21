# AI model yönetimi — 6 yuvalı ürün masası

Super Admin (`/admin`) ürün çağrılarının modelini altı yuvadan seçer. Kayıt `AiProductModelSetting` satırıdır (`id = product`, tablo `ai_product_model_settings`).

Bu masa Akademi fırın mühürlerini değiştirmez. **Yuvadan görsel veya ses seçmek Akademi fırınını değiştirmez.**

## Yuvalar

Kod evi `lib/kernel/ai/product-models.ts`. Kolon boşsa veya satır yoksa kod varsayılanı geçerlidir.

| Yuva | Kolon | Kod varsayılanı | Canlı bağ |
|------|-------|-----------------|-----------|
| `textEasy` | `textEasyModelId` | `gemini-3.5-flash-lite` | Kısa metin işleri |
| `textDeep` | `textDeepModelId` | `gemini-4-hydrogen` | Web Site Analizi anlatısı ve derin metin |
| `imageEasy` | `imageEasyModelId` | `gemini-3.1-flash-lite-image` | Hafif görsel |
| `imageDeep` | `imageDeepModelId` | `gemini-3.1-flash-image` | Ayrıntılı görsel |
| `voiceEasy` | `voiceEasyModelId` | `gemini-3.8-flash-lite-tts` | Hafif ses |
| `voiceDeep` | `voiceDeepModelId` | `gemini-3.8-flash-tts` | Uzun ses |

Web Site Analizi skoru deterministiktir (`lib/tezgah/tetkik/analysis.ts`). Anlatı metni `resolveProductModel("textDeep")` ile gider. Hydrogen kimliği `GEMINI_HYDROGEN_MODEL` dir (`lib/kernel/ai/model-roles.ts`). Yuva boşsa bu varsayılan kullanılır.

## Çağrı anı

`resolveProductModel(slot)` sırası:

1. Süreç içi önbellek 20 saniyedir (`PRODUCT_MODEL_CACHE_MS`).
2. Satır okunur. Satır yok, kolon boş veya okuma hatası olursa yuvanın kod varsayılanı döner.
3. Yazma `invalidateProductModelCache` çağırır.

`parseProductModelPatch` altı yuvayı **birlikte** ister. Eksik kolon 400 döner. Boş dize `null` yazılır; çağrı anında kod varsayılanına düşer.

## Dokunulmazlık

Ürün yuvaları ile mühürlü roller ayrı nesnelerdir.

* `AI_MODEL_ROLE_KEYS` sekiz kanonik roldür (yedi canlı, `VIDEO_GEN` mühürlü-ölü). Ev `lib/kernel/ai/model-roles.ts`.
* `ACADEMY_SEALED_MEDIA_MODEL` Akademi fırınının kilitli kimliğidir. Harita `.system_docs/AKADEMI_URETIM_ANAYASASI.md` içindedir. Uyumsuzlukta kod haritaya eşitlenir.
* `generateImage` ve `generateSpeech` sabit mühre gider. İstenen model mühürle kıyaslanır; fırın yuvayı okumaz.
* Fırın betikleri (`scripts/generate-academy-lesson-*.ts`) bu masayı okumaz.

## Kapı

* Rota `POST` değil, `GET` ve `PATCH /api/admin/ai-models`. `auth: "admin"`.
* `requireSuperAdmin` oturumu zorunludur.
* Yazma `ai_model_bind` denetim satırı bırakır (`lib/kernel/admin/ai-model-write.ts`).
* `SUPER_ADMIN_AUDIT_SEAL_MISSED` olursa upsert geri alınır.

## Migration

`prisma/migrations/20261120223000_ai_product_model_settings`. `ops:migrate` uygulanmadan tablo yoktur; `PATCH` bu durumda 503 döner. PostgREST bu tabloyu vatandaşa açmaz.
