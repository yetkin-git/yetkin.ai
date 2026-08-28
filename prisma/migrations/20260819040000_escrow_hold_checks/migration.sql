-- Faz 1 tedavi: EscrowHold tutar ve BPS invariantları DB CHECK ile mühürlenir.
-- Uygulama kodu aynı hesabı yapar; CHECK kör SQL ve ikinci yazıcıyı keser.

ALTER TABLE "escrow_holds"
  ADD CONSTRAINT "escrow_holds_amounts_positive"
  CHECK ("gross_minor" > 0 AND "hold_minor" >= 0 AND "net_minor" > 0);

ALTER TABLE "escrow_holds"
  ADD CONSTRAINT "escrow_holds_gross_equals_hold_plus_net"
  CHECK ("gross_minor" = "hold_minor" + "net_minor");

ALTER TABLE "escrow_holds"
  ADD CONSTRAINT "escrow_holds_hold_bps_range"
  CHECK ("hold_bps" >= 0 AND "hold_bps" <= 10000);
