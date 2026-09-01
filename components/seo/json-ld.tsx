import { serializeJsonLd } from "@/lib/copy/json-ld";

/** schema.org JSON-LD — CSP `application/ld+json` çalıştırılmaz; nonce gerekmez. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
