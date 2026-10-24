// Keep catalog access in one place while the storefront displays sample products.
// The TypeScript contracts for the backend API are in ../interface/product.ts.
export {
  B2B_DISCOUNT_TIERS,
  BOUTIQUE_LOCATIONS,
  BOX_STYLES,
  CAKE_FLAVORS,
  CLIENT_TESTIMONIALS,
  PRODUCT_BOXES,
  TEAS,
} from './mockCatalog.js';

import { PRODUCT_BOXES } from './mockCatalog.js';

export function findProductBox(id) {
  return PRODUCT_BOXES.find((box) => box.id === id);
}

export function getWishlistProducts(ids) {
  return PRODUCT_BOXES.filter((box) => ids.includes(box.id));
}
