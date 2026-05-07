'use client';

import { useMemo } from 'react';

interface ActivityHeatmapProps {
  completedDays: string[];
  habitName: string;
}

function getDayLabel(dayIndex: number) {
  return ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][dayIndex];
}

function getMonthLabel(monthIndex: number) {
  return ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'][monthIndex];
}

export function ActivityHeatmap({ completedDays, habitName }: ActivityHeatmapProps) {
  const WEEKS = 18;

  const { cells, monthLabels } = useMemo(() => {
    const today = new Date();
    const completedSet = new Set(completedDays);

    // Align to Sunday
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + (6 - today.getDay()));

    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - WEEKS * 7 + 1);

    const allCells: { date: string; level: number; label: string }[] = [];
    const seen = new Set<string>();
    const monthLabelList: { week: number; label: string }[] = [];

    for (let w = 0; w < WEEKS; w++) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + w * 7 + d);
        const iso = date.toISOString().slice(0, 10);
        const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
        if (!seen.has(monthKey) && date.getDate() <= 7) {
          seen.add(monthKey);
          monthLabelList.push({ week: w, label: getMonthLabel(date.getMonth()) });
        }
        allCells.push({
          date: iso,
          level: completedSet.has(iso) ? 4 : 0,
          label: `${iso} · ${getDayLabel(date.getDay())}`,
        });
      }
    }

    return { cells: allCells, monthLabels: monthLabelList };
  }, [completedDays]);

  const totalDone = completedDays.length;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{habitName}</span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
          {totalDone} дн. всего
        </span>
      </div>

      {/* Month labels */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${WEEKS}, 12px)`, gap: 2, marginBottom: 2, paddingLeft: 22 }}>
        {Array.from({ length: WEEKS }).map((_, w) => {
          const ml = monthLabels.find((m) => m.week === w);
          return (
            <div key={w} style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', overflow: 'hidden' }}>
              {ml ? ml.label : ''}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 4 }}>
        {/* Day labels */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {[0,1,2,3,4,5,6].map((d) => (
            <div key={d} style={{ height: 12, fontSize: '0.6rem', color: 'var(--text-tertiary)', lineHeight: '12px', width: 16 }}>
              {d % 2 === 1 ? getDayLabel(d) : ''}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${WEEKS}, 12px)`, gridTemplateRows: 'repeat(7, 12px)', gap: 2 }}>
          {cells.map((cell) => (
            <div
              key={cell.date}
              title={cell.label}
              className={`heatmap-cell heatmap-${cell.level}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
