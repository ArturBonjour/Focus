'use client';

import { useEffect, useState } from 'react';

interface TrendItem {
  label: string;
  emoji: string;
  current: number;
  previous: number;
  changePercent: number;
  color: string;
}

interface WeeklyTrendsCardProps {
  apiUrl?: string;
  token?: string;
  /** Demo values shown when no API call can be made */
  demo?: {
    completedTasks: { current: number; previous: number; changePercent: number };
    totalTasks: { current: number; previous: number; changePercent: number };
    habitCompletions: { current: number; previous: number; changePercent: number };
    trend: 'up' | 'down' | 'neutral';
  };
}

function TrendRow({ item }: { item: TrendItem }) {
  const positive = item.changePercent >= 0;
  const absChg = Math.abs(item.changePercent);
  // bar width relative to max of current/previous
  const maxVal = Math.max(item.current, item.previous, 1);
  const currentW = (item.current / maxVal) * 100;
  const previousW = (item.previous / maxVal) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
          {item.emoji} {item.label}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {item.current}
          </span>
          {absChg > 0 && (
            <span style={{
              fontSize: '0.68rem', fontWeight: 700,
              color: positive ? '#10b981' : '#ef4444',
              background: positive ? 'rgba(16,185,129,0.10)' : 'rgba(239,68,68,0.10)',
              borderRadius: 6, padding: '1px 6px',
            }}>
              {positive ? '↑' : '↓'} {absChg}%
            </span>
          )}
          {absChg === 0 && (
            <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', padding: '1px 6px' }}>→ 0%</span>
          )}
        </div>
      </div>

      {/* Bar comparison */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* This week */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', width: 36, textAlign: 'right', flexShrink: 0 }}>эта</span>
          <div style={{ flex: 1, height: 7, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: item.color,
              width: `${currentW}%`,
              transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', width: 18, textAlign: 'left' }}>{item.current}</span>
        </div>
        {/* Previous week */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.6rem', color: 'var(--text-tertiary)', width: 36, textAlign: 'right', flexShrink: 0 }}>пред.</span>
          <div style={{ flex: 1, height: 7, borderRadius: 99, background: 'var(--border)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 99,
              background: `${item.color}50`,
              width: `${previousW}%`,
              transition: 'width 0.8s cubic-bezier(0.4,0,0.2,1)',
            }} />
          </div>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', width: 18, textAlign: 'left' }}>{item.previous}</span>
        </div>
      </div>
    </div>
  );
}

type TrendsData = NonNullable<WeeklyTrendsCardProps['demo']>;

export function WeeklyTrendsCard({ apiUrl, token, demo }: WeeklyTrendsCardProps) {
  const [data, setData] = useState<TrendsData | null>(demo ?? null);
  const [fetched, setFetched] = useState(false);

  const hasCredentials = Boolean(token && apiUrl);
  const loading = hasCredentials && !fetched;

  useEffect(() => {
    if (!token || !apiUrl) {
      return;
    }

    let cancelled = false;
    fetch(`${apiUrl}/analytics/trends`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
      .then((r) => r.json())
      .then((d: TrendsData) => {
        if (!cancelled) {
          setData(d);
          setFetched(true);
        }
      })
      .catch(() => {
        if (!cancelled) setFetched(true);
      });

    return () => { cancelled = true; };
  }, [apiUrl, token]);

  const items: TrendItem[] = data
    ? [
        {
          label: 'Выполнено задач',
          emoji: '✅',
          color: '#6366f1',
          current: data.completedTasks.current,
          previous: data.completedTasks.previous,
          changePercent: data.completedTasks.changePercent,
        },
        {
          label: 'Всего задач',
          emoji: '📋',
          color: '#8b5cf6',
          current: data.totalTasks.current,
          previous: data.totalTasks.previous,
          changePercent: data.totalTasks.changePercent,
        },
        {
          label: 'Привычки',
          emoji: '🔥',
          color: '#f59e0b',
          current: data.habitCompletions.current,
          previous: data.habitCompletions.previous,
          changePercent: data.habitCompletions.changePercent,
        },
      ]
    : [];

  const overallTrend = data?.trend ?? 'neutral';
  const trendConfig = {
    up: { label: 'Рост', color: '#10b981', icon: '📈' },
    down: { label: 'Спад', color: '#ef4444', icon: '📉' },
    neutral: { label: 'Стабильно', color: '#f59e0b', icon: '➡️' },
  }[overallTrend];

  return (
    <div className="card glow-card animate-slide-up" style={{ padding: '22px', animationDelay: '220ms' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem', marginBottom: 2 }}>
            Неделя к неделе
          </h2>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Текущая vs прошлая неделя
          </p>
        </div>
        <span style={{
          fontSize: '0.72rem', fontWeight: 700,
          color: trendConfig.color,
          background: `${trendConfig.color}15`,
          borderRadius: 8, padding: '4px 10px',
          display: 'flex', alignItems: 'center', gap: 4,
        }}>
          {trendConfig.icon} {trendConfig.label}
        </span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton" style={{ height: 56, borderRadius: 10 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {items.map((item) => (
            <TrendRow key={item.label} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
