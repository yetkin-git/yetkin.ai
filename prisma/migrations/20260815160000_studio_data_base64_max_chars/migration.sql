-- Paket B — Studio görsel TEXT Base64 satır tavanı (fail-closed).
-- char_length = Base64 karakter; 2097152 = STUDIO_IMAGE_DATA_BASE64_MAX_CHARS.
-- Nesne depo (imzalı yükleme) sonraki mühürdür; service_role JS yoktur.

ALTER TABLE "studio_digital_assets"
  ADD CONSTRAINT "studio_digital_assets_data_base64_max_chars"
  CHECK (char_length("data_base64") <= 2097152);
