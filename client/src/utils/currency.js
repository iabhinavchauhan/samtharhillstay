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
