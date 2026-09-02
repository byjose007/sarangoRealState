import { describe, expect, it } from 'vitest';
import { calculateMortgage } from './mortgage';

describe('calculateMortgage', () => {
  it('amortises a standard loan to a zero balance by the final year', () => {
    const result = calculateMortgage({
      price: 300_000,
      downPayment: 60_000,
      years: 30,
      rate: 6,
      propertyTax: 3_600,
      insurance: 1_200,
      hoa: 50,
    });

    expect(result.loanAmount).toBe(240_000);
    expect(result.schedule).toHaveLength(30);
    expect(result.schedule.at(-1)?.balance).toBe(0);
    expect(result.monthlyTotal).toBeCloseTo(
      result.principalAndInterest + result.monthlyTax + result.monthlyInsurance + result.monthlyHoa,
      6,
    );
  });

  it('never lets the down payment push the loan amount negative', () => {
    const result = calculateMortgage({
      price: 200_000,
      downPayment: 250_000,
      years: 15,
      rate: 5,
      propertyTax: 0,
      insurance: 0,
      hoa: 0,
    });

    expect(result.loanAmount).toBe(0);
    expect(result.principalAndInterest).toBe(0);
    expect(result.schedule.every((year) => year.balance === 0)).toBe(true);
  });

  it('falls back to straight-line principal when the rate is zero', () => {
    const result = calculateMortgage({
      price: 120_000,
      downPayment: 0,
      years: 10,
      rate: 0,
      propertyTax: 0,
      insurance: 0,
      hoa: 0,
    });

    expect(result.principalAndInterest).toBeCloseTo(120_000 / 120, 6);
    expect(result.totalInterest).toBeCloseTo(0, 6);
    expect(result.schedule.at(-1)?.balance).toBe(0);
  });
});
