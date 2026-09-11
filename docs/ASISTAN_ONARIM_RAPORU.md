# Asistan Onarım Raporu — Kariyer Danışmanı

| Alan | Değer |
|------|--------|
| Tarih | 11 Eylül 2026 |
| Kapsam | Panel kabuğundaki yetkin.ai Asistanı (`Şu an yanıt veremedim…` / iletişim e-postası) |
| Yöntem | Kaynak okuma + birim testi + oturumsuz HTTP + tarayıcı. Tahmin yok. |
| Karar | İletişim / Akademi / Kariyer SSOT yerel yanıt; gümrük çökünce dürüst yönlendirme. Uydurma yok. |

Bu rapor `docs/` altındadır. `/docs` build fixture değildir.

---

## Adım 1 — Sohbet API rotası ve context

### 1.1 Rota ve bileşen (kesin)

| Parça | Konum |
|-------|--------|
| Vatandaş widget | `components/kernel/ai-chat-widget.tsx` (`AiChatWidget`) |
| Montaj | `components/shell/app-shell-switch.tsx` — oturumlu kabuk, sağ alt FAB |
| Panel sayfası | `app/dashboard/page.tsx` widget **içermez**; kabuktan gelir |
| İstemci yol | `ASSISTANT_CHAT_PATH` = `/api/ai/chat` (`lib/kernel/ai/assistant-chat-client.ts`) |
| Rota | `app/api/(kernel)/ai/chat/route.ts` — `auth = "session"` |
| Motor | `lib/kernel/ai/assistant-chat.ts` → `answerAssistantChat` |
| Gümrük | `invokeLlm` (`role: "LITE_STREAM"`) → Gemini (`GEMINI_API_KEY`) |

İstemci `POST /api/ai/chat` çağırır; gövde `{ message, history }`. Kenar hız sınırı `HTTP_RATE_LIMITS.llmUser` (12 / 10 dk); sohbet kotası `aiChatUser` (5 / gün).

### 1.2 Sistem prompt (onarım öncesi)

`ASSISTANT_SEN.system` Akademi (`/academy`) ve Kariyer (`/career`) yönlendirmesini taşıyordu. **`destek@yetkin.ai` yoktu.** Hukuk SSOT (`LEGAL_SUPPORT_EMAIL` / `lib/copy/legal-launch.ts`) asistan bağlamına bağlı değildi. «Mail adresiniz var mı?» modelin uydurmaması gereken bir olguydu; anahtar yoksa veya gümrük `null` dönerse motor 503 basıyordu.

### 1.3 Hata metninin tek kaynağı

Vatandaşın gördüğü «Şu an yanıt veremedim. Uydurma bilgi paylaşmam…» yalnız `ASSISTANT_SEN.unavailable` idi. Motor bunu **yalnız** `invokeLlm` `null` / boş metin döndüğünde `status: 503` ile basıyordu.

Bu metin **Zod 400 değildir.** Zod / boş gövde:

- Rota: `400` «Soru gövdesi geçersiz.»
- Motor: `400` `ASSISTANT_SEN.empty` («Bir soru yaz.»)

Oturum yok: `401` «Oturum gerekli.» (doğrulandı: `POST /api/ai/chat` oturumsuz → HTTP 401).

Gümrük `null` nedenleri (hepsi aynı 503 yoluna düşüyordu):

1. `GEMINI_API_KEY` yok / kısa / kullanılamaz (`sanitizeGeminiApiKey`)
2. Bütçe zırhı fail-closed (`guard-unavailable`, kota, platform tavanı) — Prisma `AiTokenUsage` sorgusu
3. Sağlayıcı zaman aşımı (30 sn × 2 deneme) veya boş yanıt
4. Model rolü çözülemez

---

## Adım 2 — Onarım ve fail-safe

### 2.1 Sistem prompt SSOT

`lib/copy/sen-voice/assistant.ts` hukuk e-postasını ve oda yollarını taşır:

- Destek e-posta: `LEGAL_SUPPORT_EMAIL` → `destek@yetkin.ai`
- Akademi: `/academy`
- Kariyer: `/career`
- İletişim: `/iletisim`

LLM çalışırsa da başka adres uydurmaz; talimat SSOT’u basar.

### 2.2 Yerel fact katmanı (API anahtarı gerekmez)

`lib/kernel/ai/assistant-facts.ts` kullanıcı metnini eşler:

| Eşleşme | Kaynak | Örnek |
|---------|--------|--------|
| `contact` | mail / e-posta / email / iletişim | «Selam. Mail adresiniz var mı?» |
| `academy` | akademi / eğitim / sertifika / sınav / ders / kurs | «Akademi belgesi nasıl alınır?» |
| `career` | kariyer / rozet / hedef rol | «Kariyer planımı nasıl kurarım?» |

Eşleşen soru **LLM ve bütçe zırhına gitmez.** Kota yine düşer (5/gün). Yanıt `ASSISTANT_SEN.facts.*` — uydurma değil, copy SSOT.

Test sorusunun kanonik yanıtı:

> Evet. Destek e-postamız destek@yetkin.ai. Eğitim ve sertifika için Akademi (/academy), kariyer planı için Kariyer (/career) odasına bakabilirsin.

### 2.3 Gümrük çökünce dürüst akış

Eşleşmeyen soruda LLM `null` ise artık 503 + ölü mesaj yok. Motor `ok: true`, `source: "fail-safe"`, HTTP 200:

> Şu an model yanıtına ulaşamadım. Uydurma bilgi paylaşmam. Destek e-postamız destek@yetkin.ai. Eğitim için Akademi (/academy), kariyer için Kariyer (/career).

Widget bunu asistan turu olarak basar; hata bandı açılmaz. Rota `assistant.chat.fail_safe` (warn) yazar. Sahte konu bilgisi (ör. freelancer emanet) **yazılmaz.**

`ASSISTANT_SEN.unavailable` aynı fail-safe metnine bağlandı (boş LLM gövdesi yedek yolu).

### 2.4 Değişen dosyalar

| Dosya | Rol |
|-------|-----|
| `lib/copy/sen-voice/assistant.ts` | SSOT facts, sistem prompt, fail-safe |
| `lib/kernel/ai/assistant-facts.ts` | Yerel eşleyici (yeni) |
| `lib/kernel/ai/assistant-chat.ts` | local-fact → LLM → fail-safe |
| `app/api/(kernel)/ai/chat/route.ts` | `fail_safe` log; 503 motor yolu kalktı |
| `tests/kernel/assistant-chat.test.ts` | Mail / oda / fail-safe / yüzey |

---

## Adım 3 — Test ve tarayıcı

### 3.1 Birim / yüzey

```
npx vitest run tests/kernel/assistant-chat.test.ts tests/dashboard/citizen-surface.test.ts
```

| Sonuç | Değer |
|-------|--------|
| `tests/kernel/assistant-chat.test.ts` | **10/10 geçti** |
| `tests/dashboard/citizen-surface.test.ts` | **5/5 geçti** |
| `npx tsx scripts/verify-sen-axis.ts` | **OK** (287 dosya) |

«Selam. Mail adresiniz var mı?» motor testi: `source: "local-fact"`, yanıt `LEGAL_SUPPORT_EMAIL` içerir, `invokeLlm` **çağrılmaz**.

Gümrük `null` + «Freelancer emanet nedir?»: `source: "fail-safe"`, e-posta var, emanet/escrow yok.

### 3.2 Dev HTTP

| Çağrı | Sonuç |
|-------|--------|
| `POST /api/ai/chat` oturumsuz, gövde test sorusu | **401** `{ ok: false, error: "Oturum gerekli." }` |
| `GET /dashboard` tarayıcı | **`/login?next=/dashboard`** — asistan FAB oturumlu kabukta |

Sohbet penceresi `AppShellSwitch` + `requireSession` arkasındadır. Bu oturumda kayıtlı test hesabı kullanılmadı (kimlik dosyası okunmaz). Widget yolu, girişten sonra aynı `answerAssistantChat` motorudur; mail sorusu LLM’siz SSOT basar.

### 3.3 Kabul

| Kriter | Durum |
|--------|--------|
| İletişim e-postası SSOT’ta ve sistem prompt’ta | **OK** — `destek@yetkin.ai` |
| Akademi / Kariyer yönlendirmesi kesintisiz | **OK** — yerel fact + fail-safe |
| Anahtar / gümrük yokken uydurma yok, yönlendirme var | **OK** — HTTP 200 fail-safe |
| «Selam. Mail adresiniz var mı?» doğru yanıt | **OK** — birim motoru |
| Eski 503 «Şu an yanıt veremedim…» (yönlendirmesiz) | **Kaldı** |

Onarım tamam.
