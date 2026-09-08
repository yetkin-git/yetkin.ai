#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
yetkin.ai — Ofis Yapay Zekâ Eğitimi TTS Seslendirme Scripti (Python Runner)
Model: gemini-3.1-flash-tts-preview
Ses Karakteri: Callirrhoe (Eğitmen Gözde Hanım - Kadın Sesi)

MALİYET KALKANI & BÖLÜM BAZLI ÇALIŞMA:
- Yalnızca tek bir bölüm kabul eder (--section=1 .. 6).
- Sadece ilgili bölüm dosyasını okur (lib/academy/curricula/office_ai/section_X.ts).
- Her parça üretildiği an diske (.chunks) kaydedilir.
- Kesinti durumunda kalınan parçadan devam eder; üretilmiş parça asla ikinci kez istenmez.
- İstek öncesi ve sonrası detaylı karakter/token loglaması yapar.
"""

import os
import sys
import re
import json
import base64
import struct
import subprocess
import urllib.request
import urllib.error
import time
from pathlib import Path

# Sabitler
MODEL_NAME = "gemini-3.1-flash-tts-preview"
VOICE_NAME = "Callirrhoe"  # Eğitmen Gözde Hanım (Kadın Sesi) — index.ts voiceConfig ile aynı
SAMPLE_RATE = 24000
CHANNELS = 1
BITS_PER_SAMPLE = 16

# Gemini TTS modeline tek seferde 13 dakikalık blok göndermemek için
# metin paragraf paragraf (~1500 karakter) sentezlenir.
CHUNK_CHAR_BUDGET = 1500


def find_repo_root() -> Path:
    """Proje kök dizinini belirler."""
    current = Path(__file__).resolve().parent
    while current.parent != current:
        if (current / "package.json").exists() or (current / "lib").exists():
            return current
        current = current.parent
    return Path.cwd()


def load_env_gemini_key(root: Path) -> str:
    """Ortam değişkenlerinden veya .env / .env.local dosyalarından GEMINI_API_KEY okur."""
    key = os.environ.get("GEMINI_API_KEY")
    if key and len(key.strip()) > 8:
        return key.strip()

    env_files = [root / ".env.local", root / ".env"]
    for env_path in env_files:
        if not env_path.exists():
            continue
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if not line or line.startswith("#") or "=" not in line:
                        continue
                    k, v = line.split("=", 1)
                    k = k.strip()
                    v = v.strip().strip("'\"`")
                    if k == "GEMINI_API_KEY" and len(v) > 8:
                        os.environ["GEMINI_API_KEY"] = v
                        return v
        except Exception:
            pass

    return ""


def clean_markdown_for_tts(md: str) -> str:
    """Markdown içeriğini TTS için temiz, akıcı konuşma diline çevirir."""
    text = md

    # Kod bloklarını ayıkla: ```text ... ``` -> içeriği koru
    text = re.sub(r"```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)```", r"\n\1\n", text)

    # Markdown başlıklarını (### vb.) metin olarak sese gitmemesi için temizle
    text = re.sub(r"^#{1,6}\s+.*$", "", text, flags=re.MULTILINE)

    # Satır içi kod sembollerini (`kod`) temizle
    text = re.sub(r"`([^`]+)`", r"\1", text)

    # Kalın ve italik sembollerini temizle
    text = re.sub(r"\*\*([^*]+)\*\*", r"\1", text)
    text = re.sub(r"(?<!\w)\*([^*]+)\*(?!\w)", r"\1", text)
    text = re.sub(r"__([^_]+)__", r"\1", text)
    text = re.sub(r"(?<=\s|^)_([^_]+)_(?=\s|$|[.,!?;:])", r"\1", text)

    # Blok alıntıları temizle
    text = re.sub(r"^>\s*", "", text, flags=re.MULTILINE)

    # Yatay çizgileri temizle
    text = re.sub(r"^[-*_]{3,}\s*$", "", text, flags=re.MULTILINE)

    # Tablo ayırıcı çizgilerini temizle
    text = re.sub(r"^\|?[\s-:|]+\|?$", "", text, flags=re.MULTILINE)

    # Tablo satırlarını konuşma diline çevir
    def _clean_table_row(match):
        row = match.group(1)
        cols = [c.strip() for c in row.split("|") if c.strip()]
        return f"{'. '.join(cols)}.\n" if cols else ""

    text = re.sub(r"^\|(.+)\|$", _clean_table_row, text, flags=re.MULTILINE)

    # Liste işaretlerini temizle
    text = re.sub(r"^[\s]*[-*+]\s+", "", text, flags=re.MULTILINE)

    # Emojileri temizle
    emoji_pattern = re.compile(
        "[\U0001f300-\U0001f9ff\U00002600-\U000026ff\U00002700-\U000027bf"
        "\U0001fa00-\U0001faff\U0000fe00-\U0000fe0f\U0001f1e6-\U0001f1ff]",
        flags=re.UNICODE,
    )
    text = emoji_pattern.sub("", text)

    # Fazla boşlukları temizle
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\r?\n\s*\r?\n", "\n\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)

    return text.strip()


def split_text_into_chunks(text: str, budget: int = CHUNK_CHAR_BUDGET) -> list[str]:
    """Metni paragraf ve anlam sınırlarına sadık kalarak ~1500 karakterlik parçalara ayırır."""
    trimmed = text.strip()
    if len(trimmed) <= budget:
        return [trimmed]

    raw_paragraphs = [p.strip() for p in re.split(r"(?:\r?\n){2,}", trimmed) if p.strip()]
    chunks = []
    current_chunk = ""

    for para in raw_paragraphs:
        if len(para) > budget:
            if current_chunk:
                chunks.append(current_chunk)
                current_chunk = ""
            sentences = [s.strip() for s in re.split(r"(?<=[.!?…])\s+", para) if s.strip()]
            for sentence in sentences:
                if not current_chunk:
                    current_chunk = sentence
                elif len(current_chunk) + len(sentence) + 1 <= budget:
                    current_chunk += f" {sentence}"
                else:
                    chunks.append(current_chunk)
                    current_chunk = sentence
        else:
            if not current_chunk:
                current_chunk = para
            elif len(current_chunk) + len(para) + 2 <= budget:
                current_chunk += f"\n\n{para}"
            else:
                chunks.append(current_chunk)
                current_chunk = para

    if current_chunk:
        chunks.append(current_chunk)

    if len(chunks) == 1 and len(chunks[0]) > budget:
        single = chunks[0]
        sentences = [s.strip() for s in re.split(r"(?<=[.!?…])\s+", single) if s.strip()]
        sub_chunks = []
        sub = ""
        for sent in sentences:
            if not sub:
                sub = sent
            elif len(sub) + len(sent) + 1 <= budget:
                sub += f" {sent}"
            else:
                sub_chunks.append(sub)
                sub = sent
        if sub:
            sub_chunks.append(sub)
        return sub_chunks

    return chunks


def call_gemini_tts(text: str, api_key: str) -> bytes:
    """Google Gemini TTS API'sine istek atarak ham PCM ses verisini alır."""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL_NAME}:generateContent?key={api_key}"

    payload = {
        "contents": [{"parts": [{"text": text}]}],
        "generationConfig": {
            "responseModalities": ["AUDIO"],
            "speechConfig": {
                "voiceConfig": {
                    "prebuiltVoiceConfig": {"voiceName": VOICE_NAME}
                }
            },
        },
    }

    req_data = json.dumps(payload).encode("utf-8")
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(url, data=req_data, headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            resp_body = resp.read().decode("utf-8")
            data = json.loads(resp_body)
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"Gemini API Hatası ({e.code}): {error_msg}")

    candidates = data.get("candidates", [])
    if not candidates:
        raise RuntimeError(f"Gemini yanıtında candidate bulunamadı: {data}")

    parts = candidates[0].get("content", {}).get("parts", [])
    for part in parts:
        inline_data = part.get("inlineData", {})
        if inline_data.get("mimeType", "").startswith("audio/"):
            b64_str = inline_data.get("data", "")
            return base64.b64decode(b64_str)

    raise RuntimeError("Gemini yanıtında ses verisi bulunamadı.")


def pcm_to_wav_bytes(
    pcm_data: bytes,
    sample_rate: int = SAMPLE_RATE,
    channels: int = CHANNELS,
    bits_per_sample: int = BITS_PER_SAMPLE,
) -> bytes:
    """Ham PCM verisine 44 baytlık RIFF WAV başlığı ekler."""
    byte_rate = sample_rate * channels * (bits_per_sample // 8)
    block_align = channels * (bits_per_sample // 8)
    data_size = len(pcm_data)
    chunk_size = 36 + data_size

    header = struct.pack(
        "<4sI4s4sIHHIIHH4sI",
        b"RIFF",
        chunk_size,
        b"WAVE",
        b"fmt ",
        16,
        1,
        channels,
        sample_rate,
        byte_rate,
        block_align,
        bits_per_sample,
        b"data",
        data_size,
    )
    return header + pcm_data


def save_audio_file(pcm_data: bytes, output_path: Path):
    """Ses dosyasını kaydeder (ffmpeg varsa gerçek mp3 yapar, yoksa wav kapsayıcılı yazar)."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    wav_bytes = pcm_to_wav_bytes(pcm_data)

    has_ffmpeg = False
    try:
        proc = subprocess.run(["ffmpeg", "-version"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        has_ffmpeg = proc.returncode == 0
    except FileNotFoundError:
        has_ffmpeg = False

    if has_ffmpeg:
        temp_wav = output_path.with_suffix(".tmp.wav")
        try:
            with open(temp_wav, "wb") as f:
                f.write(wav_bytes)
            subprocess.run(
                ["ffmpeg", "-y", "-i", str(temp_wav), "-b:a", "128k", str(output_path)],
                check=True,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
            )
        finally:
            if temp_wav.exists():
                temp_wav.unlink(missing_ok=True)
    else:
        with open(output_path, "wb") as f:
            f.write(wav_bytes)


def load_section_content(root: Path, sec_num: int) -> tuple[str, str]:
    """Sadece ilgili bölümün ts dosyasından (section_X.ts) başlık ve markdown metnini çeker."""
    section_file = root / "lib" / "academy" / "curricula" / "office_ai" / f"section_{sec_num}.ts"
    if not section_file.exists():
        raise FileNotFoundError(f"Bölüm dosyası bulunamadı: {section_file}")

    content = section_file.read_text(encoding="utf-8")

    title_match = re.search(r'title:\s*["\']([^"\']+)["\']', content)
    title = title_match.group(1) if title_match else f"Bölüm {sec_num}"

    # contentMarkdown: `...`
    # DİKKAT: Gövdede satır içi kod için backtick (`kod`) kullanıldığından lazy
    # eşleşme ilk inline-code backtick'inde durur ve metnin %70-97'sini kaybeder.
    # Bu yüzden greedy eşleşme + dosya sonundaki kapanış backtick'ine çapa atılır:
    # contentMarkdown nesnenin son alanıdır; kapanışı "`," + "};" ile biter.
    md_match = re.search(
        r'contentMarkdown:\s*`([\s\S]*)`\s*[,;]?\s*\}\s*;?\s*$',
        content,
    )
    if not md_match:
        raise ValueError(f"contentMarkdown alanı {section_file} içinde bulunamadı.")

    return title, md_match.group(1)


def main():
    args = sys.argv[1:]
    force = "--force" in args

    section_num = None
    for arg in args:
        if arg.startswith("--section="):
            try:
                section_num = int(arg.split("=")[1])
            except ValueError:
                pass
        elif arg == "--section":
            next_idx = args.index(arg) + 1
            if next_idx < len(args):
                try:
                    section_num = int(args[next_idx])
                except ValueError:
                    pass

    # 1. MALİYET KALKANI: Tek bölüm zorunluluğu
    if not section_num or section_num < 1 or section_num > 6:
        print("\n" + "=" * 74)
        print("🛑 [MALİYET KALKANI AKTİF] — GEÇERSİZ VEYA EKSİK BÖLÜM PARAMETRESİ!")
        print("=" * 74)
        print("Bu script maliyet ve kota güvenliği gereği yalnızca TEK BİR BÖLÜM kabul eder.")
        print("Tüm bölümleri tek seferde çalıştırmak engellenmiştir.\n")
        print("Kullanım Örneği:")
        print("  python scripts/generate_office_ai_tts.py --section=1")
        print("  python scripts/generate_office_ai_tts.py --section=2 --force\n")
        print("Geçerli Bölümler: 1, 2, 3, 4, 5, 6")
        print("=" * 74 + "\n")
        sys.exit(1)

    root = find_repo_root()
    output_dir = root / "public" / "audio" / "01_office_ai"
    output_dir.mkdir(parents=True, exist_ok=True)

    chunk_dir = output_dir / ".chunks" / f"sec_{section_num}"
    chunk_dir.mkdir(parents=True, exist_ok=True)

    api_key = load_env_gemini_key(root)
    if not api_key:
        print("[HATA] GEMINI_API_KEY bulunamadı! Lütfen .env.local veya .env içine ekleyin.")
        sys.exit(1)

    print("=" * 74)
    print(" yetkin.ai — Ofis Yapay Zekâ Eğitimi (TTS Üretim Hattı - Python)")
    print(f" Model: {MODEL_NAME} | Ses: {VOICE_NAME}")
    print(f" Hedef Bölüm: Bölüm {section_num} (--section={section_num})")
    print(f" Parça Önbelleği: {chunk_dir}")
    print(f" Çıktı Dosyası: {output_dir / f'bolum_{section_num}.mp3'}")
    print("=" * 74)

    # 2. Yalın metin yükleme
    title, raw_markdown = load_section_content(root, section_num)
    cleaned_text = clean_markdown_for_tts(raw_markdown)
    total_est_tokens = (len(cleaned_text) + 3) // 4
    out_file = output_dir / f"bolum_{section_num}.mp3"

    print(f"\n📂 [YÜKLENDİ] lib/academy/curricula/office_ai/section_{section_num}.ts")
    print(f"   Başlık: \"{title}\"")
    print(f"   TTS Temiz Metin: {len(cleaned_text)} karakter (~{total_est_tokens} token)")

    # 3. Tam dosya önbellek kontrolü
    if not force and out_file.exists() and out_file.stat().st_size > 1024:
        size_kb = out_file.stat().st_size / 1024
        print("\n" + "=" * 74)
        print("⏩ [MALİYET KALKANI / TAM DOSYA ÖNBELLEKTE]")
        print(f"   {out_file.name} zaten mevcut ({size_kb:.1f} KB).")
        print("   Tekrar üretmek için '--force' bayrağı kullanabilirsiniz.")
        print("   HİÇBİR API İSTEĞİ YAPILMADI, SIFIR MALİYET.")
        print("=" * 74 + "\n")
        return

    # 4. Parçaları işle ve diske anlık yaz
    chunks = split_text_into_chunks(cleaned_text)
    print(f"\n🧩 Bölüm {len(chunks)} parçaya bölündü (Parça bütçesi: {CHUNK_CHAR_BUDGET} karakter).")

    pcm_parts = []
    api_chars_sent = 0
    cached_chars_used = 0

    for idx, chunk in enumerate(chunks, 1):
        chunk_file = chunk_dir / f"chunk_{idx}_of_{len(chunks)}.pcm"
        chunk_est_tokens = (len(chunk) + 3) // 4

        print("\n" + "-" * 74)
        print(f"🔹 PARÇA [{idx}/{len(chunks)}]")

        # Diskten kontrol et
        if not force and chunk_file.exists() and chunk_file.stat().st_size > 0:
            part_pcm = chunk_file.read_bytes()
            pcm_parts.append(part_pcm)
            cached_chars_used += len(chunk)
            print("⏩ [PARÇA ÖNBELLEĞİNDEN YÜKLENDİ]")
            print(f"   Dosya: {chunk_file.name} ({len(part_pcm) / 1024:.1f} KB PCM)")
            print(f"   API çağrısı ATLANDI (0 Token harcandı).")
            continue

        # İstek öncesi log
        print("📡 [API İSTEĞİ BAŞLATILIYOR]")
        print(f"   Gönderilen Karakter: {len(chunk)} karakter (~{chunk_est_tokens} token)")
        print(f"   Metin Önizleme: \"{chunk[:90].replace(chr(10), ' ')}...\"")

        t0 = time.time()
        try:
            part_pcm = call_gemini_tts(chunk, api_key)
        except Exception as e:
            print(f"\n❌ [API HATA] Parça {idx} başarısız oldu!")
            print(f"   Önceki parçalar diskte saklandı: {chunk_dir}")
            raise e

        elapsed = time.time() - t0
        api_chars_sent += len(chunk)

        # ANINDA DİSKE KAYDET
        chunk_file.write_bytes(part_pcm)
        pcm_parts.append(part_pcm)

        print("✅ [API İSTEĞİ TAMAMLANDI VE DİSKE YAZILDI]")
        print(f"   Yanıt Süresi: {elapsed:.2f} saniye")
        print(f"   Gelen Ses: {len(part_pcm) / 1024:.1f} KB PCM")
        print(f"   Diske Kaydedildi: {chunk_file.name}")

        if idx < len(chunks):
            time.sleep(2)

    # 5. Birleştir ve kaydet
    combined_pcm = b"".join(pcm_parts)
    save_audio_file(combined_pcm, out_file)
    file_size_kb = out_file.stat().st_size / 1024
    duration_sec = len(combined_pcm) / (SAMPLE_RATE * CHANNELS * (BITS_PER_SAMPLE // 8))

    print("\n" + "=" * 74)
    print("🎉 BÖLÜM SESLENDİRMESİ BAŞARIYLA TAMAMLANDI!")
    print(f" Dosya: {out_file.name} ({file_size_kb:.1f} KB, ~{duration_sec:.1f} sn)")
    print(f" - API'den Alınan: {api_chars_sent} karakter")
    print(f" - Önbellekten Kullanılan: {cached_chars_used} karakter")
    print("=" * 74 + "\n")


if __name__ == "__main__":
    main()
