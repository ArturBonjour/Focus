'use client';

import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import type { ProductivityPoint } from '@/lib/api';

interface ProductivityChartProps {
  data: ProductivityPoint[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 12,
      padding: '10px 14px',
      boxShadow: 'var(--shadow-lg)',
      fontSize: '0.8rem',
    }}>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color, fontWeight: 600 }}>
          {entry.name}: {entry.value}
        </p>
      ))}
    </div>
  );
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  return (
    <div style={{ height: 220, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradCompleted" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fill: 'var(--text-tertiary)' }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            fontSize={11}
            tick={{ fill: 'var(--text-tertiary)' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="totalTasksCount"
            stroke="#8b5cf6"
            strokeWidth={2}
            fill="url(#gradTotal)"
            dot={false}
            name="Всего"
          />
          <Area
            type="monotone"
            dataKey="completedTasksCount"
            stroke="#6366f1"
            strokeWidth={2.5}
            fill="url(#gradCompleted)"
            dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: '#6366f1', strokeWidth: 2, stroke: '#fff' }}
            name="Выполнено"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
