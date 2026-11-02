// Money is numeric(12,2) in the database and always paired with the business's
// ISO 4217 `currency` (EGP, PLN, …) — never assume a currency.
export function formatMoney(amount: number, currency: string, locale?: string): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      // Whole amounts read better without ".00" (300 EGP, not 300.00 EGP).
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  } catch {
    // An unrecognised currency code makes Intl throw a RangeError.
    return `${amount} ${currency}`;
  }
}
