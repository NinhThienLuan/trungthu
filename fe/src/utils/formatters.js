import { B2B_DISCOUNT_TIERS } from '../services/catalogService.js';

export function formatCurrency(amount, currency = 'VND') {
  if (currency === 'USD') {
    const usd = Math.round(amount / 25400);
    return `$${usd.toLocaleString('en-US')}`;
  }
  return `${amount.toLocaleString('vi-VN')} ₫`;
}

export function getDiscountForQuantity(quantity) {
  if (quantity < 10) return 0;
  for (const tier of B2B_DISCOUNT_TIERS) {
    if (tier.maxQty === null) {
      if (quantity >= tier.minQty) return tier.discountPercent;
    } else if (quantity >= tier.minQty && quantity <= tier.maxQty) {
      return tier.discountPercent;
    }
  }
  return 25;
}

export function generateOrderNumber(prefix = 'NVD') {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${dateStr}-${random}`;
}
