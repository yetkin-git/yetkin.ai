/**
 * Python dikeyi kod laboratuvarları — Temel / Orta / İleri.
 * Öğretmen-öğrenci odaklı, çalışan örnek + adım listesi.
 */

import type { AcademyLessonPractice } from "@/lib/academy/lesson-body";

function pack(
  params: ReadonlyArray<readonly [string, string]>,
  steps: readonly string[],
  language: string,
  source: string,
): AcademyLessonPractice {
  return {
    params: params.map(([label, value]) => ({ label, value })),
    steps,
    code: { language, source: source.trim() },
  };
}

export const PYTHON_PATHWAY_PRACTICE: Record<string, AcademyLessonPractice> = {
  "python-temel-1": pack(
    [
      ["çağrı", "print(...)"],
      ["metin", "tırnak içinde string"],
      ["çıktı", "standart çıktı"],
      ["yasak", "tırnaksız Hello yazmak"],
    ],
    [
      "Boş bir .py dosyası aç.",
      'print("Merhaba, Yetkin") satırını yaz.',
      "Dosyayı çalıştırıp çıktıyı oku.",
    ],
    "py",
    `print("Merhaba, Yetkin")
# Beklenen çıktı: Merhaba, Yetkin`,
  ),
  "python-temel-2": pack(
    [
      ["tutar", "kuruş tamsayı (int)"],
      ["metin tutar", "str — çarpılmaz"],
      ["kontrol", "type(deger)"],
      ["isim", "anlamlı etiket"],
    ],
    [
      "tutar_kurus = 25000 ata.",
      "type(tutar_kurus) ile int olduğunu doğrula.",
      "Metin «250,00» ile çarpma deneme.",
    ],
    "py",
    `tutar_kurus = 25000
assert type(tutar_kurus) is int
# yanlis = "250,00" * 2  → '250,00250,00'`,
  ),
  "python-temel-3": pack(
    [
      ["karşılaştırma", "==  /  >="],
      ["atama", "= (karıştırma)"],
      ["dal", "if / elif / else"],
      ["baraj", "70"],
    ],
    [
      "not_ort değişkenini 68 ve 72 ile dene.",
      "if not_ort >= 70: «geçti» yazdır.",
      "else dalında «tekrar» yazdır.",
    ],
    "py",
    `not_ort = 72
if not_ort >= 70:
    print("geçti")
else:
    print("tekrar")`,
  ),
  "python-temel-4": pack(
    [
      ["for", "range ile bilinen tur"],
      ["while", "koşul doğruysa sür"],
      ["break", "erken çıkış"],
      ["toplam", "akkümülatör"],
    ],
    [
      "1’den 5’e range(1, 6) kur.",
      "toplam += i ile biriktir.",
      "Sonucu print et.",
    ],
    "py",
    `toplam = 0
for i in range(1, 6):
    toplam += i
print(toplam)  # 15`,
  ),
  "python-temel-5": pack(
    [
      ["tanım", "def ad(...):"],
      ["dönüş", "return"],
      ["yerel", "fonksiyon içi değişken"],
      ["kuruş", "int(round(lira * 100))"],
    ],
    [
      "lira_to_kurus fonksiyonunu yaz.",
      "1.845 ile çağırıp 1845 bekle.",
      "return olmadan None geldiğini gör.",
    ],
    "py",
    `def lira_to_kurus(lira: float) -> int:
    return int(round(lira * 100))

assert lira_to_kurus(1.845) == 1845`,
  ),
  "python-temel-6": pack(
    [
      ["girdi", "input() → str"],
      ["doğrulama", "try / except ValueError"],
      ["boş", "reddeder"],
      ["özet", "sonuç satırı"],
    ],
    [
      "Kullanıcıdan adet iste.",
      "int’e çevir; hata olursa yeniden sor.",
      "Geçerli adedi yazdır.",
    ],
    "py",
    `while True:
    ham = input("kaç adet? ").strip()
    try:
        adet = int(ham)
        break
    except ValueError:
        print("Lütfen tamsayı gir.")
print(f"adet={adet}")`,
  ),
  "python-orta-1": pack(
    [
      ["okuma", "pd.read_csv"],
      ["teşhis", "dtypes / info"],
      ["tutar", "int64 kuruş"],
      ["kimlik", "rapora girmez"],
    ],
    [
      "Virgülle ayrılmış değerleri DataFrame’e oku.",
      "dtypes ile sütun tiplerini yazdır.",
      "Kimlik sütununu çıktı şemasından çıkar.",
    ],
    "py",
    `import pandas as pd
df = pd.read_csv("satis.csv")
assert df["amount_kurus"].dtype == "int64"
rapor = df.drop(columns=["national_id"], errors="ignore")`,
  ),
  "python-orta-2": pack(
    [
      ["seçim", "loc / sütun listesi"],
      ["süzgeç", "boolean mask"],
      ["türetim", "yeni sütun"],
      ["kopya", ".copy() niyeti"],
    ],
    [
      "status == 'done' satırlarını süz.",
      "İhtiyacın olan sütunları seç.",
      "Türetilmiş oran sütunu ekle.",
    ],
    "py",
    `done = df.loc[df["status"] == "done"].copy()
done["oran"] = done["done_count"] / done["assigned_count"]`,
  ),
  "python-orta-3": pack(
    [
      ["payda", "yazılı grup paydası"],
      ["birleştirme", "validate='1:1'"],
      ["sızıntı", "hedef özellikteyse dur"],
      ["şişme", "sessiz kabul yok"],
    ],
    [
      "groupby ile özet çıkar.",
      "merge’i validate=1:1 ile doğrula.",
      "Paydayı satır notuna yaz.",
    ],
    "py",
    `ozet = df.groupby("hafta", as_index=False).agg(adet=("id", "count"))
birlesik = sol.merge(sag, on="person_id", validate="1:1")`,
  ),
  "python-orta-4": pack(
    [
      ["bağlantı", "sqlite3 / SQLAlchemy"],
      ["parametre", "? veya :name"],
      ["yasak", "f-string Yapılandırılmış Sorgu Dili"],
      ["sonuç", "DataFrame"],
    ],
    [
      "Parametreli SELECT yaz.",
      "read_sql ile DataFrame al.",
      "Bağlantıyı kapat.",
    ],
    "py",
    `import sqlite3
import pandas as pd
with sqlite3.connect("app.db") as conn:
    df = pd.read_sql("SELECT * FROM orders WHERE user_id = ?", conn, params=(user_id,))`,
  ),
  "python-orta-5": pack(
    [
      ["yol", "pathlib.Path"],
      ["liste", "glob('*.csv')"],
      ["yazım", "index=False"],
      ["atomik", "geçici → rename"],
    ],
    [
      "girdi klasöründeki virgülle ayrılmış değerleri listele.",
      "İşlenmiş çıktıyı ayrı klasöre yaz.",
      "Kaynağın üstüne yazma.",
    ],
    "py",
    `from pathlib import Path
girdi = Path("girdi")
for yol in girdi.glob("*.csv"):
    print(yol.name)
# cikti.to_csv(tmp); tmp.replace(hedef)`,
  ),
  "python-orta-6": pack(
    [
      ["eksik", "isna / bilinçli fill"],
      ["tekrar", "drop_duplicates"],
      ["aykırı", "iş kuralı"],
      ["log", "adım kaydı"],
    ],
    [
      "Boş tutarı 0 yapmadan önce kural yaz.",
      "Anahtar sütunlarla tekrarları düşür.",
      "Her adımı print/log ile bırak.",
    ],
    "py",
    `temiz = df.drop_duplicates(subset=["order_id"]).copy()
eksik = temiz["amount_kurus"].isna().sum()
print({"eksik_tutar": int(eksik)})`,
  ),
  "python-orta-7": pack(
    [
      ["metrik", "ad+formül+payda+dönem+filtre"],
      ["grafik", "eksen, birim, kaynak"],
      ["3D pasta", "red"],
      ["n", "dipnot"],
    ],
    [
      "Metrik tanımını dict olarak yaz.",
      "Çubuk grafik için eksen etiketle.",
      "n ve kaynağı başlığa ekle.",
    ],
    "json",
    `{
  "name": "completion_rate",
  "formula": "done / assigned",
  "period": "ISO-week",
  "n": 42,
  "source": "exam-sittings"
}`,
  ),
  "python-orta-8": pack(
    [
      ["giriş", "main() sırası"],
      ["adımlar", "oku→temizle→metrik→yaz"],
      ["parametre", "dönem / süzgeç"],
      ["teslim", "betik; PNG değil"],
    ],
    [
      "Pipeline fonksiyonlarını sırayla çağır.",
      "Çıktı özetini yazdır.",
      "Ekran görüntüsü gönderme.",
    ],
    "py",
    `def main(donem: str) -> None:
    ham = oku()
    temiz = temizle(ham)
    metrik = olc(temiz, donem=donem)
    yaz(metrik)
    print({"donem": donem, "satir": len(temiz)})`,
  ),
  "python-ileri-1": pack(
    [
      ["çerçeve", "FastAPI"],
      ["rota", "@app.get"],
      ["yanıt", "ceyson sözlük"],
      ["sözleşme", "/docs açık arayüz"],
    ],
    [
      "FastAPI uygulaması oluştur.",
      "/saglik ucunu yaz.",
      "200 ve {\"ok\": true} doğrula.",
    ],
    "py",
    `from fastapi import FastAPI
app = FastAPI()

@app.get("/saglik")
def saglik():
    return {"ok": True}`,
  ),
  "python-ileri-2": pack(
    [
      ["şema", "BaseModel"],
      ["alan", "tip anotasyonu"],
      ["hata", "422 ValidationError"],
      ["yasak", "elle sözlük parçalama"],
    ],
    [
      "amount_kurus: int modeli yaz.",
      "str gönderip 422 bekle.",
      "Geçerli gövdeyi kabul et.",
    ],
    "py",
    `from pydantic import BaseModel, Field

class Kalem(BaseModel):
    amount_kurus: int = Field(ge=0)
    currency: str = "TRY"`,
  ),
  "python-ileri-3": pack(
    [
      ["Depends", "ortak kaynak"],
      ["servis", "iş kuralı"],
      ["rota", "Hipermetin Aktarım Protokolü çevirmeni"],
      ["test", "override"],
    ],
    [
      "get_db benzeri bağımlılık yaz.",
      "Serviste fiyat kuralını tut.",
      "Rotada yalnız çağır.",
    ],
    "py",
    `from fastapi import Depends

def get_service():
    return PricingService()

@app.post("/fiyat")
def fiyat(svc=Depends(get_service)):
    return svc.quote()`,
  ),
  "python-ileri-4": pack(
    [
      ["async def", "korutin"],
      ["await", "giriş-çıkış bekler"],
      ["gather", "eşzamanlı"],
      ["yasak", "time.sleep async’te"],
    ],
    [
      "Üç async çağrıyı gather ile birleştir.",
      "asyncio.sleep ile beklemeyi simüle et.",
      "Toplam süreyi gözlemle.",
    ],
    "py",
    `import asyncio

async def fetch(i: int) -> int:
    await asyncio.sleep(0.3)
    return i

async def main():
    return await asyncio.gather(fetch(1), fetch(2), fetch(3))`,
  ),
  "python-ileri-5": pack(
    [
      ["Bearer", "Authorization başlığı"],
      ["401", "geçersiz token"],
      ["403", "yetkisiz"],
      ["sır", ".env — koda gömme"],
    ],
    [
      "HTTPBearer bağımlılığı ekle.",
      "Geçersiz tokenda 401 dön.",
      "Log’a token yazma.",
    ],
    "py",
    `from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

def require_token(cred=Depends(security)):
    if cred.credentials != "secret":
        raise HTTPException(status_code=401, detail="unauthorized")
    return cred`,
  ),
  "python-ileri-6": pack(
    [
      ["404", "kaynak yok"],
      ["422", "şema bozuk"],
      ["500", "beklenmeyen"],
      ["yasak", "hep 200 + error"],
    ],
    [
      "Bulunamayan kayıt için 404 fırlat.",
      "İstemciye stack trace sızdırma.",
      "Korelasyon kimliğini logla.",
    ],
    "py",
    `from fastapi import HTTPException

def get_order(order_id: str):
    row = repo.find(order_id)
    if row is None:
        raise HTTPException(status_code=404, detail="not_found")
    return row`,
  ),
  "python-ileri-7": pack(
    [
      ["TestClient", "sözleşme testi"],
      ["mutlu yol", "200"],
      ["eksik alan", "422"],
      ["sürekli entegrasyon", "kırmadan imaj yok"],
    ],
    [
      "TestClient ile /saglik çağır.",
      "Eksik gövde için 422 bekle.",
      "Fixture ile app’i paylaş.",
    ],
    "py",
    `from fastapi.testclient import TestClient

client = TestClient(app)
assert client.get("/saglik").status_code == 200
assert client.post("/kalemler", json={}).status_code == 422`,
  ),
  "python-ileri-8": pack(
    [
      ["Dockerfile", "çok aşamalı"],
      ["ENV", "yapılandırma"],
      ["healthcheck", "/saglik"],
      ["yasak", "sır BUILD arg"],
    ],
    [
      "İnce runtime imajı yaz.",
      "HEALTHCHECK ekle.",
      ".env’i imaja kopyalama.",
    ],
    "dockerfile",
    `FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]`,
  ),
  "python-ileri-9": pack(
    [
      ["request_id", "middleware"],
      ["log", "yapısal ceyson"],
      ["kişisel gizli veri", "log’a girmez"],
      ["metrik", "gecikme"],
    ],
    [
      "Her isteğe request_id ekle.",
      "Hata log’unda e-posta yazma.",
      "Latency’yi ölç.",
    ],
    "py",
    `import logging, time, uuid
log = logging.getLogger("api")

@app.middleware("http")
async def add_request_id(request, call_next):
    rid = str(uuid.uuid4())
    started = time.perf_counter()
    response = await call_next(request)
    log.info({"request_id": rid, "ms": (time.perf_counter() - started) * 1000})
    response.headers["X-Request-Id"] = rid
    return response`,
  ),
  "python-ileri-10": pack(
    [
      ["CRUD iskeleti", "/kalemler"],
      ["doğrulama", "Pydantic"],
      ["test", "TestClient yeşil"],
      ["paket", "Dockerfile + README"],
    ],
    [
      "Korumalı okuma + şemalı yazma birleştir.",
      "Testleri çalıştır.",
      "İmaj build et; yalnız main.py gönderme.",
    ],
    "py",
    `# Teslim kontrol listesi
checks = {
    "schema": True,
    "auth": True,
    "tests": True,
    "dockerfile": True,
}
assert all(checks.values())`,
  ),
};
