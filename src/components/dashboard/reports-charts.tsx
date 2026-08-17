'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';

const GOLD = '#B4923F';
const CHARCOAL = '#26282D';

export function ReportsCharts({
  revenueByMonth,
  casesByType,
}: {
  revenueByMonth: { name: string; value: number }[];
  casesByType: { name: string; value: number }[];
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="ds-card p-6">
        <h2 className="mb-5 font-display text-base font-bold text-charcoal-900">الإيرادات الشهرية</h2>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={revenueByMonth}>
            <defs>
              <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={GOLD} stopOpacity={0.35} />
                <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFEFED" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#7E7D75' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#7E7D75' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ direction: 'rtl', fontSize: 12, borderRadius: 8, border: '1px solid #EFEFED' }} />
            <Area type="monotone" dataKey="value" stroke={GOLD} strokeWidth={2} fill="url(#goldFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </section>

      <section className="ds-card p-6">
        <h2 className="mb-5 font-display text-base font-bold text-charcoal-900">القضايا حسب التخصص</h2>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={casesByType} layout="vertical" margin={{ left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EFEFED" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 12, fill: '#7E7D75' }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#454440' }} axisLine={false} tickLine={false} width={100} />
            <Tooltip contentStyle={{ direction: 'rtl', fontSize: 12, borderRadius: 8, border: '1px solid #EFEFED' }} />
            <Bar dataKey="value" fill={CHARCOAL} radius={[0, 4, 4, 0]} barSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
}
