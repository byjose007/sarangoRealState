'use client';

import * as React from 'react';
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { calculateMortgage } from '@/lib/mortgage';
import { formatMoney, formatPrice } from '@/lib/format';
import { Input, Label } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CalculatorProps {
  price: number;
  propertyTax?: number;
  hoa?: number;
  className?: string;
}

export function MortgageCalculator({ price, propertyTax = 0, hoa = 0, className }: CalculatorProps) {
  const [downPct, setDownPct] = React.useState(20);
  const [years, setYears] = React.useState(30);
  const [rate, setRate] = React.useState(6.4);
  const [insurance, setInsurance] = React.useState(1450);

  const downPayment = Math.round((price * downPct) / 100);
  const result = React.useMemo(
    () =>
      calculateMortgage({
        price,
        downPayment,
        years,
        rate,
        propertyTax,
        insurance,
        hoa,
      }),
    [price, downPayment, years, rate, propertyTax, insurance, hoa],
  );

  const rows = [
    ['Principal & interest', result.principalAndInterest],
    ['Property tax', result.monthlyTax],
    ['Insurance', result.monthlyInsurance],
    ['HOA', result.monthlyHoa],
  ] as const;

  return (
    <div className={cn('rounded-lg border border-border bg-card', className)}>
      <div className="grid lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-5 border-b border-border p-6 lg:border-b-0 lg:border-r">
          <div>
            <Label htmlFor="down">Down payment · {downPct}%</Label>
            <input
              id="down"
              type="range"
              min={0}
              max={60}
              step={1}
              value={downPct}
              onChange={(event) => setDownPct(Number(event.target.value))}
              className="mt-2 w-full accent-[hsl(var(--primary))]"
            />
            <p className="mt-1 font-mono text-sm">{formatPrice(downPayment)}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="term">Term (years)</Label>
              <Input
                id="term"
                type="number"
                min={5}
                max={40}
                value={years}
                onChange={(event) => setYears(Math.max(Number(event.target.value) || 1, 1))}
              />
            </div>
            <div>
              <Label htmlFor="rate">Interest rate %</Label>
              <Input
                id="rate"
                type="number"
                step="0.05"
                min={0}
                max={20}
                value={rate}
                onChange={(event) => setRate(Number(event.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="insurance">Insurance / year</Label>
              <Input
                id="insurance"
                type="number"
                min={0}
                value={insurance}
                onChange={(event) => setInsurance(Number(event.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="loan">Loan amount</Label>
              <Input id="loan" readOnly value={formatPrice(result.loanAmount)} className="bg-muted" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <p className="font-mono text-eyebrow uppercase text-muted-foreground">Estimated monthly</p>
          <p className="mt-2 font-display text-4xl tracking-tight">
            {formatMoney(result.monthlyTotal)}
          </p>

          <ul className="mt-5 divide-y divide-border border-y border-border">
            {rows.map(([label, value]) => (
              <li key={label} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-mono">{formatMoney(value)}</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 text-xs text-muted-foreground">
            Total interest over {years} years: {formatPrice(result.totalInterest)}. Figures are an
            estimate, not a lending offer.
          </p>

          <div className="mt-5 h-36">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={result.schedule} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                <defs>
                  <linearGradient id="balanceFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="year"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--surface))',
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [formatPrice(value), 'Balance']}
                  labelFormatter={(label) => `Year ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#balanceFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
