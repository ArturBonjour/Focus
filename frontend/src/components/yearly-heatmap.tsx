'use client';

import { useEffect, useMemo, useState } from 'react';

interface HeatmapDay {
  date: string;
  count: number;
  tasksDone: number;
  habitsDone: number;
}

const MONTH_LABELS = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
const DAY_LABELS   = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];

function levelFromCount(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count === 1) return 1;
  if (count <= 3)  return 2;
  if (count <= 5)  return 3;
  return 4;
}

function buildGrid(data: HeatmapDay[]) {
  const map = new Map<string, HeatmapDay>(data.map((d) => [d.date, d]));

  const today = new Date();
  // End on the next Saturday after today (inclusive)
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - today.getDay()));

  // Start: 52 full weeks back from the end
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - 52 * 7 + 1);

  // Align start to Sunday
  const adjustedStart = new Date(startDate);
  adjustedStart.setDate(startDate.getDate() - startDate.getDay());

  const weeks: { date: string; level: 0 | 1 | 2 | 3 | 4; count: number; tasksDone: number; habitsDone: number; isFuture: boolean }[][] = [];
  const monthLabels: { col: number; label: string }[] = [];
  const todayStr = today.toISOString().slice(0, 10);
  const seenMonths = new Set<string>();

  let col = 0;
  const cursor = new Date(adjustedStart);
  while (cursor <= endDate) {
    const week: typeof weeks[number] = [];
    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      const dayData = map.get(iso);
      const isFuture = iso > todayStr;

      // Month label at first day of month that appears on Sunday
      if (d === 0) {
        const monthKey = `${cursor.getFullYear()}-${cursor.getMonth()}`;
        if (!seenMonths.has(monthKey)) {
          seenMonths.add(monthKey);
          monthLabels.push({ col, label: MONTH_LABELS[cursor.getMonth()] });
        }
      }

      week.push({
        date: iso,
        level: isFuture ? 0 : levelFromCount(dayData?.count ?? 0),
        count: dayData?.count ?? 0,
        tasksDone: dayData?.tasksDone ?? 0,
        habitsDone: dayData?.habitsDone ?? 0,
        isFuture,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
    col++;
  }

  return { weeks, monthLabels };
}

// Demo fallback: scatter some activity over past 365 days
function buildDemoData(): HeatmapDay[] {
  const today = new Date();
  return Array.from({ length: 365 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (364 - i));
    const iso = d.toISOString().slice(0, 10);
    const rand = Math.random();
    const count = rand < 0.45 ? 0 : rand < 0.65 ? 1 : rand < 0.8 ? 2 : rand < 0.9 ? 3 : rand < 0.96 ? 4 : 6;
    const tasksDone = Math.floor(count * 0.6);
    const habitsDone = count - tasksDone;
    return { date: iso, count, tasksDone, habitsDone };
  });
}

interface YearlyHeatmapProps {
  apiUrl?: string;
  token?: string;
}

export function YearlyHeatmap({ apiUrl, token }: YearlyHeatmapProps) {
  const [data, setData] = useState<HeatmapDay[] | null>(null);
  const [fetched, setFetched] = useState(false);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; day: typeof grid['weeks'][0][0] } | null>(null);

  const hasCredentials = Boolean(token && apiUrl);
  const loading = hasCredentials && !fetched;

  useEffect(() => {
    if (!token || !apiUrl) {
      return;
    }
    let cancelled = false;
    fetch(`${apiUrl}/analytics/heatmap`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((d: HeatmapDay[]) => { if (!cancelled) { setData(d); setFetched(true); } })
      .catch(() => { if (!cancelled) setFetched(true); });
    return () => { cancelled = true; };
  }, [apiUrl, token]);

  const displayData = data ?? (hasCredentials ? null : buildDemoData());
  const grid = useMemo(() => buildGrid(displayData ?? []), [displayData]);

  const totalActivity = (displayData ?? []).reduce((s, d) => s + d.count, 0);
  const activeDays = (displayData ?? []).filter((d) => d.count > 0).length;

  const CELL = 13;
  const GAP = 2;
  const numWeeks = grid.weeks.length;
  const svgH = 7 * (CELL + GAP);

  const COLORS = {
    0: 'var(--border)',
    1: 'rgba(99,102,241,0.20)',
    2: 'rgba(99,102,241,0.45)',
    3: 'rgba(99,102,241,0.72)',
    4: 'rgba(99,102,241,1.00)',
  };

  return (
    <div className="card glow-card animate-slide-up" style={{ padding: '22px', animationDelay: '260ms', marginBottom: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: 2 }}>
            Карта активности за год
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Задачи + привычки за последние 12 месяцев
          </p>
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)', lineHeight: 1 }}>{totalActivity}</p>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>активностей</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--accent-1)', lineHeight: 1 }}>{activeDays}</p>
            <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>активных дней</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: svgH + 30, borderRadius: 10 }} />
      ) : (
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          {/* Month labels */}
          <div style={{ display: 'flex', gap: 0, marginBottom: 4, paddingLeft: 22 }}>
            {Array.from({ length: numWeeks }, (_, colIdx) => {
              const ml = grid.monthLabels.find((m) => m.col === colIdx);
              return (
                <div
                  key={colIdx}
                  style={{ width: CELL + GAP, fontSize: '0.6rem', color: 'var(--text-tertiary)', flexShrink: 0, overflow: 'hidden' }}
                >
                  {ml?.label ?? ''}
                </div>
              );
            })}
          </div>

          <div style={{ display: 'flex', gap: 4 }}>
            {/* Day labels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: GAP, flexShrink: 0, marginTop: 1 }}>
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <div key={d} style={{ height: CELL, fontSize: '0.58rem', color: 'var(--text-tertiary)', lineHeight: `${CELL}px`, width: 18 }}>
                  {d % 2 === 1 ? DAY_LABELS[d] : ''}
                </div>
              ))}
            </div>

            {/* Grid */}
            <div
              style={{ display: 'grid', gridTemplateColumns: `repeat(${numWeeks}, ${CELL}px)`, gridTemplateRows: `repeat(7, ${CELL}px)`, gap: GAP, position: 'relative' }}
              onMouseLeave={() => setTooltip(null)}
            >
              {grid.weeks.map((week, wIdx) =>
                week.map((cell, dIdx) => (
                  <div
                    key={cell.date}
                    style={{
                      gridColumn: wIdx + 1,
                      gridRow: dIdx + 1,
                      width: CELL,
                      height: CELL,
                      borderRadius: 3,
                      background: cell.isFuture ? 'transparent' : COLORS[cell.level],
                      cursor: cell.count > 0 ? 'pointer' : 'default',
                      transition: 'transform 0.1s, opacity 0.1s',
                      opacity: cell.isFuture ? 0 : 1,
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.35)';
                      if (cell.count > 0 || !cell.isFuture) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setTooltip({ x: rect.left + rect.width / 2, y: rect.top, day: cell });
                      }
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
                    }}
                  />
                ))
              )}
            </div>
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, justifyContent: 'flex-end' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Меньше</span>
            {([0, 1, 2, 3, 4] as const).map((l) => (
              <div key={l} style={{ width: CELL, height: CELL, borderRadius: 3, background: COLORS[l] }} />
            ))}
            <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)' }}>Больше</span>
          </div>
        </div>
      )}

      {/* Floating tooltip */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-strong)',
            borderRadius: 8,
            padding: '7px 10px',
            fontSize: '0.72rem',
            color: 'var(--text-primary)',
            pointerEvents: 'none',
            zIndex: 100,
            boxShadow: 'var(--shadow-lg)',
            whiteSpace: 'nowrap',
          }}
        >
          <p style={{ fontWeight: 600 }}>{tooltip.day.date}</p>
          {tooltip.day.count === 0 ? (
            <p style={{ color: 'var(--text-tertiary)' }}>Нет активности</p>
          ) : (
            <>
              <p style={{ color: '#6366f1' }}>✅ {tooltip.day.tasksDone} задач выполнено</p>
              <p style={{ color: '#f59e0b' }}>🔥 {tooltip.day.habitsDone} привычек</p>
              <p style={{ fontWeight: 600, marginTop: 2 }}>Итого: {tooltip.day.count}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
