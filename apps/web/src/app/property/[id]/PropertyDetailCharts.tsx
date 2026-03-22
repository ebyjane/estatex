'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export function TrendLineChart({ data }: { data: { label: string; avgAsk: number }[] }) {
  return (
    <div className="h-56 w-full min-h-[14rem]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="label" stroke="#94a3b8" tick={{ fontSize: 10 }} />
          <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
            formatter={(v: number) => [v.toLocaleString(), 'Avg ask']}
          />
          <Line type="monotone" dataKey="avgAsk" stroke="#a78bfa" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ProjectionAreaChart({
  data,
  currency,
}: {
  data: { year: string; value: number }[];
  currency: string;
}) {
  return (
    <div className="h-64 w-full min-h-[16rem]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="year" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
          <Tooltip
            contentStyle={{ background: '#0f172a', border: '1px solid #334155' }}
            formatter={(v: number) => [`${currency} ${v?.toLocaleString()}`, 'Est. value']}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#22d3ee"
            fill="#0891b2"
            fillOpacity={0.3}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
