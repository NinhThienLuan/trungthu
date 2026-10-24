/** Contracts for the backend product DTOs. These are types only; the sample catalog is separate. */
export type ProductType = 'LOOSE_CAKE' | 'BOX_SHELL' | 'GREETING_CARD' | 'ADDON_SERVICE';
export type ProductStatus = 'ACTIVE' | 'HIDDEN';

export interface ProductVariantResponse {
  id: string; // UUID
  variantName: string;
  sku: string;
  price: number; // JSON number from Java BigDecimal
  stockQuantity: number;
  weightGram: number | null;
  boxCapacity: number | null;
  status: string;
}

export interface ProductResponse {
  id: string; // UUID
  providerId: string; // UUID
  storeName: string | null;
  name: string;
  description: string | null;
  productType: ProductType;
  shelfLifeDays: number | null;
  status: string;
  createdAt: string; // Java LocalDateTime serialized as ISO text
  variants: ProductVariantResponse[];
}

export interface ProductRequest {
  name: string;
  description?: string | null;
  productType: ProductType;
  shelfLifeDays?: number | null;
  status?: ProductStatus | null;
}

export interface ProductVariantRequest {
  variantName: string;
  sku: string;
  price: number;
  stockQuantity: number;
  weightGram?: number | null;
  boxCapacity?: number | null;
  status?: ProductStatus | null;
}
