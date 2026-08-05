import type { MortgageInput, MortgageResult } from '@/types';

/**
 * Standard amortising mortgage (fixed rate, monthly compounding).
 * Returns the monthly breakdown plus a yearly schedule for the chart.
 */
export function calculateMortgage(input: MortgageInput): MortgageResult {
  const { price, downPayment, years, rate, propertyTax, insurance, hoa } = input;
  const loanAmount = Math.max(price - downPayment, 0);
  const monthlyRate = rate / 100 / 12;
  const payments = Math.max(years * 12, 1);

  const principalAndInterest =
    monthlyRate === 0
      ? loanAmount / payments
      : (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -payments));

  const monthlyTax = propertyTax / 12;
  const monthlyInsurance = insurance / 12;
  const monthlyHoa = hoa;

  let balance = loanAmount;
  let totalInterest = 0;
  const schedule: MortgageResult['schedule'] = [];

  for (let year = 1; year <= years; year += 1) {
    let yearInterest = 0;
    let yearPrincipal = 0;
    for (let month = 0; month < 12; month += 1) {
      const interest = balance * monthlyRate;
      const principal = Math.min(principalAndInterest - interest, balance);
      balance = Math.max(balance - principal, 0);
      yearInterest += interest;
      yearPrincipal += principal;
    }
    totalInterest += yearInterest;
    schedule.push({
      year,
      balance: Math.round(balance),
      interest: Math.round(yearInterest),
      principal: Math.round(yearPrincipal),
    });
  }

  return {
    loanAmount,
    principalAndInterest,
    monthlyTax,
    monthlyInsurance,
    monthlyHoa,
    monthlyTotal: principalAndInterest + monthlyTax + monthlyInsurance + monthlyHoa,
    totalInterest,
    schedule,
  };
}
