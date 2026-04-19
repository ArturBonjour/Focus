'use client';

import { useEffect, useState } from 'react';

interface AnalyticsSummary {
  tasks: {
    total: number;
    done: number;
    inProgress: number;
    todo: number;
    overdue: number;
    completionRate: number;
    avgCompletionDays: number | null;
  };
  habits: {
    total: number;
    totalStreakDays: number;
    longestStreak: number;
    avgStreak: number;
  };
  productivity: {
    bestDayOfWeek: string | null;
    avgDailyCompleted: number;
    peakHour: string | null;
  };
}

const DEMO: AnalyticsSummary = {
  tasks: {
    total: 47,
    done: 31,
    inProgress: 8,
    todo: 8,
    overdue: 3,
    completionRate: 66,
    avgCompletionDays: 2,
  },
  habits: {
    total: 3,
    totalStreakDays: 20,
    longestStreak: 11,
    avgStreak: 7,
  },
  productivity: {
    bestDayOfWeek: 'Вт',
    avgDailyCompleted: 2.3,
    peakHour: '10:00–11:00',
  },
};

interface MetricProps {
  label: string;
  value: string | number;
  sub?: string;
  icon: string;
  color: string;
}

function Metric({ label, value, sub, icon, color }: MetricProps) {
  return (
    <div style={{
      padding: '14px 16px',
      borderRadius: 14,
      background: 'var(--bg-base)',
      border: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column', gap: 6,
      transition: 'transform 0.18s var(--ease), box-shadow 0.18s var(--ease)',
    }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <span style={{
          fontSize: '1rem',
          width: 30, height: 30, borderRadius: 8,
          background: `${color}20`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>{icon}</span>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', lineHeight: 1.3 }}>{label}</span>
      </div>
      <p style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </p>
      {sub && <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)' }}>{sub}</p>}
    </div>
  );
}

interface AnalyticsSummaryCardProps {
  apiUrl?: string;
  token?: string;
}

export function AnalyticsSummaryCard({ apiUrl, token }: AnalyticsSummaryCardProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [fetched, setFetched] = useState(false);

  const hasCredentials = Boolean(token && apiUrl);
  const loading = hasCredentials && !fetched;

  useEffect(() => {
    if (!token || !apiUrl) return;
    let cancelled = false;
    fetch(`${apiUrl}/analytics/summary`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((d: AnalyticsSummary) => {
        if (!cancelled) { setData(d); setFetched(true); }
      })
      .catch(() => { if (!cancelled) setFetched(true); });
    return () => { cancelled = true; };
  }, [apiUrl, token]);

  const d = data ?? (hasCredentials ? null : DEMO);

  const metrics: MetricProps[] = d ? [
    {
      label: 'Completion Rate',
      value: `${d.tasks.completionRate}%`,
      sub: `${d.tasks.done} из ${d.tasks.total} задач`,
      icon: '🎯',
      color: '#10b981',
    },
    {
      label: 'Avg. время выполнения',
      value: d.tasks.avgCompletionDays !== null ? `${d.tasks.avgCompletionDays}д` : '—',
      sub: 'от создания до DONE',
      icon: '⏱',
      color: '#6366f1',
    },
    {
      label: 'Лучший день недели',
      value: d.productivity.bestDayOfWeek ?? '—',
      sub: `Пик продуктивности`,
      icon: '📅',
      color: '#8b5cf6',
    },
    {
      label: 'Пиковое время',
      value: d.productivity.peakHour ?? '—',
      sub: 'Лучший час для фокуса',
      icon: '🌅',
      color: '#f59e0b',
    },
    {
      label: 'Темп / день',
      value: d.productivity.avgDailyCompleted,
      sub: 'задач в среднем (30д)',
      icon: '📈',
      color: '#06b6d4',
    },
    {
      label: 'Рекорд streak',
      value: `${d.habits.longestStreak}д`,
      sub: `Avg ${d.habits.avgStreak}д по привычкам`,
      icon: '🔥',
      color: '#ef4444',
    },
    {
      label: 'Просрочено',
      value: d.tasks.overdue,
      sub: 'задач с истёкшим дедлайном',
      icon: '⚠️',
      color: d.tasks.overdue > 0 ? '#ef4444' : '#10b981',
    },
    {
      label: 'Суммарный streak',
      value: `${d.habits.totalStreakDays}д`,
      sub: `по ${d.habits.total} привычкам`,
      icon: '⚡',
      color: '#f59e0b',
    },
  ] : [];

  return (
    <div id="ai-section" className="card glow-card animate-slide-up" style={{ padding: '22px', animationDelay: '300ms', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'var(--accent-gradient)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem',
          boxShadow: '0 4px 16px rgba(99,102,241,0.3)',
          flexShrink: 0,
        }}>
          📊
        </div>
        <div>
          <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>
            Сводка аналитики
          </h2>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            Интеллектуальный анализ вашей продуктивности
          </p>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="skeleton" style={{ height: 90, borderRadius: 14 }} />
          ))}
        </div>
      ) : (
        <div className="stagger" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {metrics.map((m) => (
            <div key={m.label} className="animate-scale-in">
              <Metric {...m} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
