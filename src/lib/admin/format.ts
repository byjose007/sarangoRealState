const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

/** Property.pricePeriod comes from Prisma as 'MONTH' | 'TOTAL' — uppercase, unlike the frontend's lowercase union. */
export function formatPrice(price: number, period: string) {
  return period === 'MONTH' ? `${currency.format(price)}/mo` : currency.format(price);
}
