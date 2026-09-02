import { describe, expect, it } from 'vitest';
import {
  formatArea,
  formatListingPrice,
  formatPrice,
  getStatusLabel,
  getTypeLabel,
} from './format';

describe('formatPrice', () => {
  it('formats whole-dollar USD amounts with no cents', () => {
    expect(formatPrice(450_000)).toBe('$450,000');
  });
});

describe('formatListingPrice', () => {
  it('appends a per-month suffix in the requested language', () => {
    expect(formatListingPrice(1_500, 'month', 'en')).toBe('$1,500/mo');
    expect(formatListingPrice(1_500, 'month', 'es')).toBe('$1,500/mes');
  });

  it('omits the suffix for a total (sale) price', () => {
    expect(formatListingPrice(450_000, 'total', 'en')).toBe('$450,000');
  });
});

describe('formatArea', () => {
  it('uses m² for Spanish and sq ft for English', () => {
    expect(formatArea(120, 'es')).toBe('120 m²');
    expect(formatArea(120, 'en')).toBe('120 sq ft');
  });
});

describe('getStatusLabel / getTypeLabel', () => {
  it('falls back to the raw value for an unknown key instead of throwing', () => {
    expect(getStatusLabel('unknown-status', 'en')).toBe('unknown-status');
    expect(getTypeLabel('unknown-type', 'es')).toBe('unknown-type');
  });

  it('translates known keys per language', () => {
    expect(getStatusLabel('for-sale', 'es')).toBe('En venta');
    expect(getStatusLabel('for-sale', 'en')).toBe('For sale');
    expect(getTypeLabel('villa', 'es')).toBe('Villa');
  });
});
