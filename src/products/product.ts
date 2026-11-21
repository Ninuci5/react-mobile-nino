export type Product = {
  id: number;
  title: string;
  price: number;
  image: string;
};

export type ProductDetail = Product & {
  description: string;
  category: string;
  rating: { rate: number; count: number };
};

export function isProduct(value: unknown): value is Product {
  if (typeof value !== "object" || value === null) return false;
  const product = value as Record<string, unknown>;
  return typeof product.id === "number" && Number.isFinite(product.id)
    && typeof product.title === "string" && product.title.trim().length > 0
    && typeof product.price === "number" && Number.isFinite(product.price) && product.price >= 0
    && typeof product.image === "string" && product.image.startsWith("https://");
}

export function isProductDetail(value: unknown): value is ProductDetail {
  if (!isProduct(value)) return false;
  const product = value as Product & Record<string, unknown>;
  if (typeof product.description !== "string" || typeof product.category !== "string") return false;
  const rating = product.rating;
  if (typeof rating !== "object" || rating === null) return false;
  const fields = rating as Record<string, unknown>;
  return typeof fields.rate === "number" && Number.isFinite(fields.rate)
    && typeof fields.count === "number" && Number.isFinite(fields.count);
}
