export const DEFAULT_CURRENCY = 'INR'

export const CURRENCY_SYMBOL = '₹'

export function currencySymbol() {
  return CURRENCY_SYMBOL
}

export function formatPrice(amount) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return `${CURRENCY_SYMBOL}0`
  return `${CURRENCY_SYMBOL}${Math.round(value * 100) / 100}`
}

export function normalizeDiscount(discount) {
  const enabled = Boolean(discount?.enabled)
  const rawPercent = Number(discount?.percent)
  const percent = enabled && Number.isFinite(rawPercent)
    ? Math.min(100, Math.max(0, rawPercent))
    : 0
  return { enabled, percent }
}

export function applyDiscount(amount, discount) {
  const value = Number(amount)
  if (!Number.isFinite(value)) return 0
  const { percent } = normalizeDiscount(discount)
  if (!percent) return value
  return Math.round(value * (1 - percent / 100) * 100) / 100
}

export function formatDiscountedPrice(amount, discount) {
  return formatPrice(applyDiscount(amount, discount))
}
