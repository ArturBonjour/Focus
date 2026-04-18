'use client';

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { ProductivityPoint } from '@/lib/api';

interface ProductivityChartProps {
  data: ProductivityPoint[];
}

export function ProductivityChart({ data }: ProductivityChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="date" tickLine={false} axisLine={false} fontSize={12} stroke="#71717a" />
          <YAxis tickLine={false} axisLine={false} fontSize={12} stroke="#71717a" />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              borderColor: '#e4e4e7',
            }}
          />
          <Line
            type="monotone"
            dataKey="completedTasksCount"
            stroke="#0f172a"
            strokeWidth={2.5}
            dot={{ r: 3, strokeWidth: 2 }}
            activeDot={{ r: 5 }}
            name="Выполнено"
          />
          <Line
            type="monotone"
            dataKey="totalTasksCount"
            stroke="#94a3b8"
            strokeWidth={2}
            dot={false}
            name="Всего"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
