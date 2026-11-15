import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { LinkButton } from "@/components/ui/link-button";
import { loadPublicStorefront } from "@/lib/commerce/storefront-load";
import { formatTryMinor } from "@/lib/commerce/storefront";
import { pageMetadata } from "@/lib/copy/seo";

function StorefrontExit() {
  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <LinkButton href="/" variant="outline" size="sm">
        Ana sayfaya dön
      </LinkButton>
      <LinkButton href="/tezgah" variant="secondary" size="sm">
        Tezgâha dön
      </LinkButton>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const view = await loadPublicStorefront(slug);
  return pageMetadata({
    title: view ? view.name : "Mağaza",
    description: view ? `${view.name} vitrini` : "Bu adreste açık bir vitrin yok.",
    path: `/magaza/${slug}`,
  });
}

export default async function MagazaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const view = await loadPublicStorefront(slug);
  if (!view) {
    return (
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-16">
        <h1 className="text-3xl font-semibold tracking-tight">Mağaza</h1>
        <Card className="mt-6">
          <p>Bu adreste açık bir vitrin yok. Vitrin, mağaza yayına alınınca burada durur.</p>
          <StorefrontExit />
        </Card>
      </main>
    );
  }
  return (
    <main className="mx-auto max-w-3xl px-6 pb-20 pt-16">
      <h1 className="text-3xl font-semibold tracking-tight">{view.name}</h1>
      {view.lines.length === 0 ? (
        <Card className="mt-6">
          <p>Rafta henüz satılabilir ürün yok. Fiyatı ve stoğu açılan ürün burada görünür.</p>
          <StorefrontExit />
        </Card>
      ) : (
        <ul className="mt-6 space-y-4">
          {view.lines.map((line) => (
            <li key={line.variantId}>
              <Card>
                <h2 className="text-xl font-semibold">{line.title}</h2>
                <p className="mt-2 text-sm text-neutral-600">{line.category}</p>
                <p className="mt-3">{line.description}</p>
                <p className="mt-3 font-medium">
                  {line.sku} · {formatTryMinor(line.amountMinor)} · Satılabilir {line.sellableQty}
                </p>
                {line.orderUrl ? (
                  <a className="mt-4 inline-block underline" href={line.orderUrl} target="_blank" rel="noopener noreferrer">
                    WhatsApp ile sipariş
                  </a>
                ) : null}
              </Card>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
