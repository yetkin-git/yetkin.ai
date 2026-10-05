export function CheckoutForm({ alreadyActive }: { alreadyActive: boolean }) {
  if (alreadyActive) {
    return (
      <p className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm leading-6">
        Yıllık paket açık. Üç seçmeli ders hakkın duruyor. Kilitli konular, seçtiğin derslerde açılır.
      </p>
    );
  }

  return (
    <section className="grid gap-2 rounded-2xl border border-[var(--border)] bg-white p-4 text-sm leading-6">
      <h2 className="text-lg font-semibold">Ödeme hattı kapalı</h2>
      <p>
        Gerçek PayTR mağaza hattı bağlanana kadar yıllık paket satışı açılmaz. Deneme mağaza anahtarı satışı açmaz.
        Canlı ödeme anahtarı olmadan tahsilat yoktur. Kart numarası, güvenlik kodu ve kimlik numarası bu ekranda
        alınmaz.
      </p>
    </section>
  );
}
