/**
 * Builds the full gallery list for a product.
 * Keeps image_url as the primary image; additional images come from the optional images array.
 * Existing products without an images field behave exactly as before (single image only).
 */
export function getProductImages(product) {
  if (!product) return [];

  const extras = Array.isArray(product.images)
    ? product.images.filter((url) => typeof url === "string" && url.trim() !== "")
    : [];

  if (product.image_url) {
    return [
      product.image_url,
      ...extras.filter((url) => url !== product.image_url),
    ];
  }

  return extras;
}
