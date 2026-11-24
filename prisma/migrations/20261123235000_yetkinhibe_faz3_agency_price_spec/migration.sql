-- YetkinHibe Faz 3 — ajans yatırım odağı, ajans paketi hakkı, tek fiyat kaynağı.
-- Idempotent: kolon/tablo/index/politika varsa dokunmaz. Tutar kuruş tamsayıdır (A1).
-- Super Admin tutarı yazdıysa (updated_by dolu) tohum ezilmez.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. hibe_clients.investment_focus — ajans matrisinin yatırım odağı ekseni (Ş7)
--    Varsayılan "genel": kart beyan vermedi. "genel" hiçbir kapalı listeye girmez,
--    bu yüzden yatırım odağı kısıtlı çağrı eşleşmez (dürüst körlük yerine beyan).
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE "hibe_clients"
  ADD COLUMN IF NOT EXISTS "investment_focus" VARCHAR(40) NOT NULL DEFAULT 'genel';

COMMENT ON COLUMN "hibe_clients"."investment_focus" IS
  'Müşteri kartının yatırım odağı. genel = beyan yok; makine_techizat|yazilim_dijital|arge|ihracat kapalı liste.';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. hibe_agency_packages — ajans paketi hakkı (Ş6). Sahiplik user_id.
--    CLEARED ödeme başına tek satır; applied_merchant_oids tekrarı engeller.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "hibe_agency_packages" (
  "id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "status" VARCHAR(20) NOT NULL,
  "list_price_minor" INTEGER NOT NULL,
  "applied_merchant_oids" TEXT NOT NULL DEFAULT '[]',
  "activated_at" TIMESTAMPTZ(6) NOT NULL,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "hibe_agency_packages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "hibe_agency_packages_user_id_key"
  ON "hibe_agency_packages"("user_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_agency_packages_user_id_fkey') THEN
    ALTER TABLE "hibe_agency_packages"
      ADD CONSTRAINT "hibe_agency_packages_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_agency_packages_status_check') THEN
    ALTER TABLE "hibe_agency_packages"
      ADD CONSTRAINT "hibe_agency_packages_status_check"
      CHECK ("status" IN ('ACTIVE', 'EXPIRED', 'REVOKED'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_agency_packages_price_check') THEN
    ALTER TABLE "hibe_agency_packages"
      ADD CONSTRAINT "hibe_agency_packages_price_check"
      CHECK ("list_price_minor" > 0);
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. FORCE RLS + kapsamsız deny + sahip politikası. Kullanıcı tablosudur.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  ALTER TABLE public."hibe_agency_packages" ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public."hibe_agency_packages" FORCE ROW LEVEL SECURITY;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon')
     AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated')
     AND NOT EXISTS (
       SELECT 1 FROM pg_policies
       WHERE schemaname = 'public'
         AND tablename = 'hibe_agency_packages'
         AND policyname = 'rls_deny_unscoped'
     ) THEN
    CREATE POLICY rls_deny_unscoped ON public."hibe_agency_packages"
      FOR SELECT TO anon, authenticated USING (false);
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.proname = 'yetkin_apply_rls_owner_policies'
  ) THEN
    PERFORM public.yetkin_apply_rls_owner_policies('hibe_agency_packages');
  END IF;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Tek fiyat kaynağı — PriceCatalogEntry. hibe/dossier 149.000, hibe/agency 499.000.
--    Aynı ürün için ikinci satır açılmaz; karar defteri tek kez yazılır.
--    Super Admin (updated_by dolu) tutarı korunur.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  seed record;
  existing record;
  v_catalog_id text;
BEGIN
  FOR seed IN
    SELECT *
    FROM (
      VALUES
        (
          'cat_hibe_dossier',
          'hibe',
          'dossier',
          149000,
          'YetkinHibe tam proje dosyası. Katalog satırıdır; satır yoksa dosya üretilmez.'
        ),
        (
          'cat_hibe_agency',
          'hibe',
          'agency',
          499000,
          'YetkinHibe ajans paketi. Katalog satırıdır; satır yoksa ajans satın alınamaz.'
        )
    ) AS v(id, module_key, unit_key, amount_minor, description)
  LOOP
    SELECT e.id AS id, e.amount_minor AS amount_minor, e.updated_by AS updated_by
      INTO existing
      FROM "price_catalog_entries" e
      WHERE e.module_key = seed.module_key
        AND e.unit_key = seed.unit_key;

    IF NOT FOUND THEN
      INSERT INTO "price_catalog_entries" (
        "id",
        "module_key",
        "unit_key",
        "unit_type",
        "amount_minor",
        "currency_code",
        "is_active",
        "min_minor",
        "max_minor",
        "description",
        "created_at",
        "updated_at"
      ) VALUES (
        seed.id,
        seed.module_key,
        seed.unit_key,
        'MINOR',
        seed.amount_minor,
        'TRY',
        true,
        1,
        50000000,
        seed.description,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      );
      v_catalog_id := seed.id;

      INSERT INTO "price_catalog_decision_ledger" (
        "id",
        "catalog_entry_id",
        "module_key",
        "unit_key",
        "unit_type",
        "reason_code",
        "reason",
        "old_minor",
        "new_minor",
        "currency_code",
        "actor_user_id",
        "created_at"
      )
      SELECT
        'pcl_open_' || seed.module_key || '_' || replace(seed.unit_key, '-', '_'),
        v_catalog_id,
        seed.module_key,
        seed.unit_key,
        'MINOR',
        'ADMIN_MANUAL',
        'YetkinHibe Faz 3 katalog açılışı. Tutar amount_minor kuruştur. Super Admin yazdıysa bu tohum ezmez.',
        0,
        seed.amount_minor,
        'TRY',
        'migration:20261123235000',
        CURRENT_TIMESTAMP
      WHERE NOT EXISTS (
        SELECT 1
        FROM "price_catalog_decision_ledger" d
        WHERE d.id = 'pcl_open_' || seed.module_key || '_' || replace(seed.unit_key, '-', '_')
      );
    ELSIF existing.updated_by IS NOT NULL THEN
      -- Super Admin tutarı tohum ezmez.
      CONTINUE;
    ELSE
      UPDATE "price_catalog_entries"
      SET
        "unit_type" = 'MINOR',
        "currency_code" = 'TRY',
        "is_active" = true,
        "min_minor" = 1,
        "max_minor" = 50000000,
        "description" = seed.description,
        "updated_at" = CURRENT_TIMESTAMP
      WHERE "id" = existing.id
        AND "updated_by" IS NULL;
    END IF;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Şartname metni ve madde atıfları (Ş5 / F2.4). Kolon faz 2'de açıldı;
--    burada yalnız sekiz ana çağrının ilan şartnamesi işlenir. Idempotent:
--    dolu `specification_text` ezilmez, yalnız boş satır doldurulur.
--    Madde numarası ve sayfa numarası ilan belgesine aittir.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
DECLARE
  spec record;
  v_version integer;
BEGIN
  FOR spec IN
    SELECT *
    FROM (
      VALUES
        (
          'kosgeb-is-gelistirme-2026-4',
          E'Sayfa 3\nMadde 2.1 Amaç ve kapsam\nBu destek programının amacı, yeni girişimcilerin iş planlarını uygulayabilmesi için personel, makine teçhizat, yazılım ve hizmet alımı giderlerinin desteklenmesidir.\nSayfa 4\nMadde 3.1 Pazar Analizi\nBaşvuru sahibi iş planında hedef müşteri kitlesini, talebin kaynağını ve satış kanalını yazılı olarak açıklar. Pazar analizi bölümü işletmenin kurulacağı il ve sektör verisiyle uyumlu olmak zorundadır.\nSayfa 5\nMadde 3.2 SWOT\nİş planında güçlü yön, zayıf yön, fırsat ve tehdit başlıkları ayrı ayrı değerlendirilir. SWOT bölümünde yazılan her başlık işletmenin gerçek kapasitesine dayanır.\nSayfa 6\nMadde 3.3 Rekabet Üstünlüğü\nBaşvuru sahibi, rakiplerinden ayrışan yetkinliğini ve bu yetkinliğin sürdürülebilirliğini açıklar. Rekabet üstünlüğü iddiası somut kapasite veya yetkinlikle desteklenir.\nSayfa 7\nMadde 3.4 İstihdam ve Sürdürülebilirlik Taahhüdü\nİşletme, destek dönemi boyunca istihdam edeceği personel sayısını ve işin devamlılık koşullarını taahhüt eder. İstihdam taahhüdü iş planındaki kadro yapısıyla tutarlı olur.\nSayfa 8\nMadde 4.1 Uygun harcamalar\nPersonel gideri, makine teçhizat alımı ve hizmet alımı uygun harcama başlıklarıdır. Her harcama kalemi iş paketiyle ilişkilendirilir.\nMadde 4.2 Başvuru belgeleri\nBaşvuru formu, iş planı, imza sirküleri ve vergi levhası zorunlu belgelerdir. Eksik belge başvuruyu işleme almaz.',
          '{"supportHints":["personel gideri","makine teçhizat alımı","hizmet alımı iş paketi"],"deadlineHints":["dönem penceresi","son başvuru tarihi"],"documentHints":["iş planı","imza sirküleri","vergi levhası"],"eligibilityHints":["yeni girişimci","işletme yaşı üç yılı aşmamış"],"excerpt":"İş geliştirme desteği personel, makine teçhizat ve hizmet alımını kapsar."}'::jsonb
        ),
        (
          'kosgeb-kapasite-gelistirme-2027-1',
          E'Sayfa 2\nMadde 2.1 Amaç\nKapasite geliştirme desteğinin amacı, KOBİ ölçeğindeki işletmelerin üretim kapasitesini ve dijital olgunluğunu artırmaktır.\nSayfa 3\nMadde 3.1 Pazar Analizi\nİşletme, kapasite artışının hedeflediği pazarı ve talep gerekçesini yazar. Pazar analizi mevcut üretim kapasitesiyle karşılaştırmalı sunulur.\nSayfa 4\nMadde 3.2 Rekabet Üstünlüğü\nKapasite yatırımının işletmeye sağlayacağı rekabet üstünlüğü teslim süresi, kalite veya maliyet ekseninde açıklanır.\nSayfa 5\nMadde 3.3 İstihdam ve Sürdürülebilirlik Taahhüdü\nYatırım sonrası korunacak ve ilave edilecek istihdam yazılır. Sürdürülebilirlik bölümü yatırımın geri dönüş varsayımını içerir.\nSayfa 6\nMadde 4.1 Uygun harcamalar ve iş paketi\nMakine teçhizat, yazılım ve danışmanlık hizmeti uygun harcama başlıklarıdır. Her iş paketi için adam ay matrisi doldurulur.\nMadde 4.2 Başvuru belgeleri\nBaşvuru formu, kapasite raporu, imza sirküleri ve mali tablolar zorunludur.',
          '{"supportHints":["kapasite artışı","yazılım ve danışmanlık hizmeti","makine teçhizat"],"deadlineHints":["dönem sonu","son başvuru tarihi"],"documentHints":["kapasite raporu","mali tablolar","imza sirküleri"],"eligibilityHints":["KOBİ ölçeği","çalışan sayısı alt sınırı","mikro işletme başvuramaz"],"excerpt":"Kapasite geliştirme desteği KOBİ ölçeğinde üretim ve dijital olgunluk yatırımını kapsar."}'::jsonb
        ),
        (
          'tubitak-1501-2027-1',
          E'Sayfa 4\nMadde 3.1 Özgün Değer\nProjenin özgün değeri, mevcut çözümlerden ayrıştığı teknik nokta ve bu noktanın neden önemli olduğu yazılarak açıklanır.\nSayfa 5\nMadde 3.2 Teknoloji Hazırlık Seviyesi\nBaşvuru sahibi projenin başlangıç teknoloji hazırlık seviyesini ve proje sonunda ulaşılacak seviyeyi gerekçesiyle yazar.\nSayfa 6\nMadde 3.3 İş Paketi Adam-Ay Matrisi\nHer iş paketi için süre, sorumlu personel ve adam ay değeri matriste gösterilir. Adam ay toplamı proje süresi ve ekip yapısıyla tutarlı olmak zorundadır.\nSayfa 7\nMadde 3.4 Başarı Ölçütleri\nHer iş paketi için ölçülebilir başarı ölçütü yazılır. Ölçüt, proje çıktısının doğrulanabilir olmasını sağlar.\nSayfa 8\nMadde 3.5 Sanayi Kuruluşu Ar-Ge Altyapısı\nSanayi kuruluşunun Ar-Ge altyapısı; laboratuvar, ekip ve mevcut üretim deneyimi başlıklarında açıklanır.\nSayfa 9\nMadde 4.2 Başvuru belgeleri\nKuruluş bazlı ön kayıt ve proje önerisi zorunludur. Proje önerisi çevrim içi sistemden gönderilir.',
          '{"supportHints":["proje destek oranı","sanayi Ar-Ge projesi","proje giderleri"],"deadlineHints":["çağrı penceresi","son başvuru tarihi"],"documentHints":["kuruluş bazlı ön kayıt","proje önerisi"],"eligibilityHints":["Ar-Ge faaliyeti","sanayi kuruluşu","teknoloji hazırlık seviyesi"],"excerpt":"1501 sanayi Ar-Ge projelerinde özgün değer, hazırlık seviyesi ve iş paketi matrisi istenir."}'::jsonb
        ),
        (
          'tubitak-1507-2027-1',
          E'Sayfa 3\nMadde 2.1 Amaç\nProgramın amacı KOBİ ölçeğindeki işletmelerin Ar-Ge projelerini başlatmasını ve proje kültürü kazanmasını desteklemektir.\nSayfa 4\nMadde 3.1 Özgün Değer\nProjenin çözdüğü KOBİ problemi ve mevcut çözümlerden ayrışan teknik yaklaşım yazılır.\nSayfa 5\nMadde 3.2 Teknoloji Hazırlık Seviyesi\nProjenin başlangıç hazırlık seviyesi ve hedeflenen seviye gerekçelendirilir.\nSayfa 6\nMadde 3.3 İş Paketi Adam-Ay Matrisi\nİş paketleri, süreleri ve adam ay değerleri tabloda gösterilir. Ekip yapısı iş paketi sorumluluklarıyla eşleşir.\nSayfa 7\nMadde 3.4 Başarı Ölçütleri\nHer iş paketi için ölçülebilir başarı ölçütü yazılır; ölçüt proje çıktısıyla doğrudan ilişkili olur.\nSayfa 8\nMadde 3.5 KOBİ Ar-Ge Kapasitesi\nKOBİ''nin mevcut Ar-Ge kapasitesi, personel yetkinliği ve kullanılacak altyapı yazılır.\nSayfa 9\nMadde 4.2 Başvuru belgeleri\nKuruluş bazlı ön kayıt ve proje önerisi zorunludur; eksik dosya değerlendirmeye alınmaz.',
          '{"supportHints":["geri ödemesiz hibe","proje giderleri","azami hibe"],"deadlineHints":["çağrı penceresi","son başvuru tarihi"],"documentHints":["kuruluş bazlı ön kayıt","proje önerisi"],"eligibilityHints":["KOBİ","Ar-Ge faaliyeti","proje süresi"],"excerpt":"1507 KOBİ Ar-Ge başlangıç desteği geri ödemesizdir ve Ar-Ge faaliyeti şarttır."}'::jsonb
        ),
        (
          'ticaret-ihracat-2027',
          E'Sayfa 2\nMadde 2.1 Amaç ve kapsam\nDesteklerin amacı ihracatçı işletmelerin pazara giriş faaliyetlerini ve yurt dışı birim yatırımlarını desteklemektir.\nSayfa 3\nMadde 3.1 İhracat Pazarı\nİşletme hedef ihracat pazarını, pazardaki talebi ve rekabet koşullarını yazılı olarak açıklar.\nSayfa 4\nMadde 3.2 Hedef Ülke\nHedef ülke ve bu ülkeye giriş için gereken mevzuat uyumu belirtilir. Ülke seçimi ürün grubuyla tutarlı olur.\nSayfa 5\nMadde 3.3 Döviz Kazandırıcı Faaliyet\nDöviz kazandırıcı faaliyetin tanımı, satış kanalı ve beklenen ihracat hasılatı yazılır.\nSayfa 6\nMadde 3.4 E-ihracat Kanalı\nE-ihracat kanalı kullanılacaksa pazaryeri veya kendi satış kanalı ve lojistik çözümü açıklanır.\nSayfa 7\nMadde 4.1 Uygun giderler\nPazara giriş, tanıtım, birim kirası ve fuar katılım giderleri uygun gider başlıklarıdır.\nMadde 4.2 Başvuru belgeleri\nBaşvuru formu, ihracat kaydı ve faaliyet belgeleri zorunludur.',
          '{"supportHints":["pazara giriş","yurt dışı birim","tanıtım gideri"],"deadlineHints":["başvuru dönemi","son başvuru tarihi"],"documentHints":["ihracat kaydı","faaliyet belgesi","başvuru formu"],"eligibilityHints":["ihracat faaliyeti","ihracatçı birliği üyeliği"],"excerpt":"İhracat destekleri pazara giriş ve yurt dışı birim yatırımını kapsar; ihracat faaliyeti şarttır."}'::jsonb
        ),
        (
          'istka-yatirim-2027',
          E'Sayfa 3\nMadde 2.1 Programın amacı\nProgram, İstanbul ilinde imalat ve yazılım yatırımlarının bölgesel katma değerini artırmayı amaçlar.\nSayfa 4\nMadde 3.1 Bölgesel Katma Değer\nYatırımın bölgeye sağlayacağı katma değer; üretim değeri, tedarik zinciri ve ihracat katkısı başlıklarında açıklanır.\nSayfa 5\nMadde 3.2 İstihdam Etkisi\nYatırımın yaratacağı doğrudan ve dolaylı istihdam yazılır. Nitelikli istihdam ayrıca belirtilir.\nSayfa 6\nMadde 3.3 Ajans Öncelik Ekseni\nBaşvuru, ilan edilen öncelik eksenlerinden en az biriyle ilişkilendirilir. Eksen gerekçesi proje faaliyetlerine bağlanır.\nSayfa 7\nMadde 3.4 Sürdürülebilirlik\nYatırımın destek sonrası devamlılığı, finansman kaynağı ve işletme modeli açıklanır.\nSayfa 8\nMadde 4.2 Başvuru belgeleri\nBaşvuru formu, yatırım planı ve mali tablolar zorunludur.',
          '{"supportHints":["bölgesel katma değer","imalat yatırımı","yazılım yatırımı"],"deadlineHints":["başvuru dönemi","son başvuru tarihi"],"documentHints":["yatırım planı","mali tablolar","başvuru formu"],"eligibilityHints":["İstanbul ili","imalat veya yazılım","KOBİ statüsü"],"excerpt":"İSTKA yatırım programı İstanbul ilinde imalat ve yazılım yatırımını destekler."}'::jsonb
        ),
        (
          'tkdk-ipard-iii-101-2027',
          E'Sayfa 3\nMadde 2.1 Tedbirin amacı\nTedbir 101, tarımsal işletmelerin üretim yapısını iyileştirmeye ve AB standartlarına uyumunu artırmaya yöneliktir.\nSayfa 4\nMadde 3.1 Kırsal Yatırım Konusu\nYatırımın kırsal alanda gerçekleştirileceği, üretim türü ve işletme büyüklüğü açıkça yazılır.\nSayfa 5\nMadde 3.2 IPARD Tedbiri\nBaşvuru, ilgili IPARD III tedbiri altında değerlendirilir. Tedbir kapsamı dışındaki faaliyet desteklenmez.\nSayfa 6\nMadde 3.3 Uygun Harcama Başlıkları\nMakine teçhizat, yapım işi ve hizmet alımı uygun harcama başlıklarıdır. Her kalem yatırım konusuyla ilişkilendirilir.\nSayfa 7\nMadde 3.4 Çevresel Etki\nYatırımın çevresel etkisi ve alınacak önlemler yazılır. Çevre mevzuatına uyum beyan edilir.\nSayfa 8\nMadde 4.2 Başvuru belgeleri\nBaşvuru formu, işletme belgeleri ve yatırım planı zorunludur.',
          '{"supportHints":["makine teçhizat","yapım işi","AB standartlarına uyum"],"deadlineHints":["başvuru dönemi","son başvuru tarihi"],"documentHints":["işletme belgeleri","yatırım planı","başvuru formu"],"eligibilityHints":["kırsal alan","tarımsal işletme","tedbir kapsamı"],"excerpt":"IPARD III Tedbir 101 tarımsal işletme yatırımlarını AB standartlarına uyum ekseninde destekler."}'::jsonb
        ),
        (
          'iskur-isbasi-2027',
          E'Sayfa 2\nMadde 2.1 Programın amacı\nİşbaşı eğitim programının amacı, işverenin ihtiyaç duyduğu işgücünü işyerinde eğitim yoluyla yetiştirmektir.\nSayfa 3\nMadde 3.1 İstihdam ve Sürdürülebilirlik Taahhüdü\nİşveren, program sonunda katılımcıların istihdam edilmesine ilişkin taahhüdünü yazar. Taahhüt program süresiyle uyumlu olur.\nSayfa 4\nMadde 3.2 Uygulama takvimi\nProgram süresi, günlük çalışma saati ve katılımcı sayısı takvimde gösterilir.\nSayfa 5\nMadde 4.1 Uygun giderler\nKatılımcı ödemeleri ve iş kazası sigorta gideri uygun gider başlıklarıdır.\nSayfa 6\nMadde 4.2 Başvuru belgeleri\nİşveren başvuru formu, vergi levhası ve çalışan listesi zorunludur.\nMadde 4.3 Başvuru süresi\nBaşvurular program dönemi içinde alınır; dönem kapandıktan sonra yeni katılımcı eklenmez.',
          '{"supportHints":["katılımcı ödemesi","iş kazası sigorta gideri"],"deadlineHints":["program dönemi","son başvuru tarihi"],"documentHints":["işveren başvuru formu","vergi levhası","çalışan listesi"],"eligibilityHints":["işveren","KOBİ statüsü","katılımcı sayısı"],"excerpt":"İşbaşı eğitim programı işverene katılımcı ödemesi ve sigorta gideri desteği verir."}'::jsonb
        )
    ) AS v(call_id, specification_text, rules_json)
  LOOP
    SELECT c."data_version"
      INTO v_version
      FROM "yetkinhibe_grant_calls" c
      WHERE c."id" = spec.call_id;

    IF NOT FOUND THEN
      CONTINUE;
    END IF;

    -- Dolu şartname operatör emeğidir; ezilmez.
    UPDATE "yetkinhibe_grant_calls"
    SET
      "specification_text" = spec.specification_text,
      "rules_json" = spec.rules_json,
      "data_version" = v_version + 1,
      "updated_at" = CURRENT_TIMESTAMP
    WHERE "id" = spec.call_id
      AND ("specification_text" IS NULL OR length(btrim("specification_text")) < 12);

    IF FOUND THEN
      INSERT INTO "hibe_grant_call_revisions" (
        "id",
        "call_id",
        "data_version",
        "action",
        "actor_user_id",
        "snapshot_json",
        "created_at"
      ) VALUES (
        'rev_spec_seed_' || replace(spec.call_id, '-', '_'),
        spec.call_id,
        v_version + 1,
        'UPDATE',
        NULL,
        jsonb_build_object(
          'id', spec.call_id,
          'dataVersion', v_version + 1,
          'action', 'SPECIFICATION_SEED',
          'migration', '20261123235000'
        ),
        CURRENT_TIMESTAMP
      )
      ON CONFLICT ("id") DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Yatırım odağı kapalı liste denetimi. Var olan satırlar "genel" ile geçer.
-- ─────────────────────────────────────────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'hibe_clients_investment_focus_check') THEN
    ALTER TABLE "hibe_clients"
      ADD CONSTRAINT "hibe_clients_investment_focus_check"
      CHECK ("investment_focus" IN ('genel', 'makine_techizat', 'yazilim_dijital', 'arge', 'ihracat'));
  END IF;
END $$;
