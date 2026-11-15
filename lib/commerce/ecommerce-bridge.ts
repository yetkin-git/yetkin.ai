const TITLE_MAX = 200;
const CATEGORY_MAX = 80;
const DESCRIPTION_MAX = 4_000;

export function ecommerceCardToDraftProduct(input: {
  title: string;
  category: string;
  description: string;
}):
  | {
      ok: true;
      trimmed: boolean;
      body: {
        mode: "draft";
        title: string;
        description: string;
        category: string;
        attributes: [];
        other: "";
        sku: null;
        onHandQty: 0;
        safetyBuffer: 0;
      };
    }
  | { ok: false; error: string } {
  const title = input.title.trim();
  const category = input.category.trim();
  const rawDescription = input.description.trim();
  if (title.length < 1 || category.length < 1 || rawDescription.length < 1) {
    return { ok: false, error: "Başlık, açıklama ve kategori zorunludur." };
  }
  if (title.length > TITLE_MAX) {
    return { ok: false, error: "Ürün adı en çok 200 karakter olmalıdır." };
  }
  if (category.length > CATEGORY_MAX) {
    return { ok: false, error: "Kategori en çok 80 karakter olmalıdır." };
  }
  const description = rawDescription.slice(0, DESCRIPTION_MAX);
  return {
    ok: true,
    trimmed: rawDescription.length > description.length,
    body: {
      mode: "draft",
      title,
      description,
      category,
      attributes: [],
      other: "",
      sku: null,
      onHandQty: 0,
      safetyBuffer: 0,
    },
  };
}
