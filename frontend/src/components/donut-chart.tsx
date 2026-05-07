'use client';

import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface DonutSlice {
  name: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  data: DonutSlice[];
  label?: string;
  centerValue?: string | number;
}

interface CustomLabelProps {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
}

function CustomLabel({ cx = 0, cy = 0, midAngle = 0, innerRadius = 0, outerRadius = 0, percent = 0 }: CustomLabelProps) {
  if (percent < 0.07) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={700}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; payload: { color: string } }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div style={{
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border)',
      borderRadius: 10,
      padding: '8px 12px',
      boxShadow: 'var(--shadow-lg)',
      fontSize: '0.8rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.payload.color }} />
        <span style={{ color: 'var(--text-secondary)' }}>{item.name}:</span>
        <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.value}</span>
      </div>
    </div>
  );
}

export function DonutChart({ data, label, centerValue }: DonutChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const nonEmpty = data.filter((d) => d.value > 0);

  if (total === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
        Нет данных
      </div>
    );
  }

  return (
    <div style={{ height: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={nonEmpty}
            cx="50%"
            cy="45%"
            innerRadius={52}
            outerRadius={76}
            paddingAngle={3}
            dataKey="value"
            labelLine={false}
            label={CustomLabel}
            strokeWidth={0}
          >
            {nonEmpty.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>

          {/* Center text */}
          {centerValue !== undefined && (
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--text-primary)"
              fontSize={20}
              fontWeight={700}
            >
              {centerValue}
            </text>
          )}
          {label && (
            <text
              x="50%"
              y="45%"
              dy={18}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="var(--text-tertiary)"
              fontSize={10}
            >
              {label}
            </text>
          )}

          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            iconSize={8}
            formatter={(value: string) => (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
