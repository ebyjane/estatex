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

export type RentVsBuyChartRow = { year: string; rent: number; buy: number };

export function RentVsBuyAreaChart({
  data,
  displayCurrency,
}: {
  data: RentVsBuyChartRow[];
  displayCurrency: string;
}) {
  return (
    <div className="mt-4 h-64 w-full min-h-[16rem]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="year" stroke="#94a3b8" />
          <YAxis
            stroke="#94a3b8"
            tickFormatter={(v) => `${displayCurrency} ${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ background: '#1e293b', border: '1px solid #334155' }}
            formatter={(v: number) => [`${displayCurrency} ${v.toLocaleString()}`, '']}
          />
          <Area
            type="monotone"
            dataKey="rent"
            stroke="#94a3b8"
            fill="#64748b"
            fillOpacity={0.3}
            name="Rent"
          />
          <Area
            type="monotone"
            dataKey="buy"
            stroke="#22d3ee"
            fill="#0891b2"
            fillOpacity={0.3}
            name="Buy"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
