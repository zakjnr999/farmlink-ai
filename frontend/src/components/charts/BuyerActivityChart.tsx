'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface BuyerActivityChartProps {
  data: Array<{ week: string; offers: number; transactions: number }>;
}

export function BuyerActivityChart({ data }: BuyerActivityChartProps) {
  return (
    <div className="mt-2">
      <p className="exchange-label mb-2">Procurement activity (4 weeks)</p>
      <div className="h-32 w-full" aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--soft-border)" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--ledger-grey)" />
            <YAxis tick={{ fontSize: 11 }} stroke="var(--ledger-grey)" allowDecimals={false} />
            <Tooltip />
            <Area
              type="monotone"
              dataKey="offers"
              stackId="1"
              stroke="#2F6B45"
              fill="#2F6B45"
              fillOpacity={0.2}
              name="Offers"
            />
            <Area
              type="monotone"
              dataKey="transactions"
              stackId="1"
              stroke="#D4A13B"
              fill="#D4A13B"
              fillOpacity={0.25}
              name="Transactions"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      <p className="sr-only">
        Chart showing offers and transactions over the last four weeks. Latest week:{' '}
        {data[data.length - 1]?.offers ?? 0} offers, {data[data.length - 1]?.transactions ?? 0}{' '}
        transactions.
      </p>
    </div>
  );
}
