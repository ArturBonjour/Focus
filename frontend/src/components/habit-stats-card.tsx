'use client';

import { useEffect, useState } from 'react';

interface HabitStats {
  id: string;
  name: string;
  streak: number;
  longestStreak: number;
  totalDays: number;
  completionRate30d: number;
  completedLast7: number;
  completedToday: boolean;
}

export function HabitStatsCard() {
  const [stats, setStats] = useState<HabitStats[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/habits/stats').then(async (r) => {
      if (!r.ok || cancelled) return;
      const data = (await r.json()) as HabitStats[];
      if (!cancelled) setStats(data);
    }).catch(() => null);
    return () => { cancelled = true; };
  }, []);

  if (!stats) return null;
  if (stats.length === 0) return null;

  return (
    <section className="card glow-card animate-slide-up" style={{ padding: '22px', animationDelay: '200ms' }}>
      <h2 style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: 2 }}>
        Статистика привычек
      </h2>
      <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginBottom: 16 }}>
        Детальный анализ каждой привычки
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {stats.map((h) => {
          const rate = h.completionRate30d;
          const rateColor = rate >= 80 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444';
          return (
            <div key={h.id} style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto auto auto auto',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 12,
              background: 'var(--border)',
              flexWrap: 'wrap',
            }}>
              {/* Name + today indicator */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{
                    width: 7, height: 7, borderRadius: '50%',
                    background: h.completedToday ? '#10b981' : 'var(--text-tertiary)',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    fontWeight: 600, fontSize: '0.82rem', color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {h.name}
                  </span>
                  {h.completedToday && (
                    <span style={{
                      fontSize: '0.65rem', color: '#059669', fontWeight: 700,
                      background: 'rgba(16,185,129,0.12)', borderRadius: 6,
                      padding: '1px 6px', flexShrink: 0,
                    }}>
                      ✓ сегодня
                    </span>
                  )}
                </div>
                {/* Progress bar 30d */}
                <div style={{ marginTop: 6, height: 4, background: 'var(--bg-base)', borderRadius: 99, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 99,
                    background: rateColor,
                    width: `${rate}%`,
                    transition: 'width 0.7s ease',
                  }} />
                </div>
              </div>

              {/* Streak */}
              <div style={{ textAlign: 'center', minWidth: 48 }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>{h.streak}</p>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: 1 }}>streak</p>
              </div>

              {/* Best streak */}
              <div style={{ textAlign: 'center', minWidth: 52 }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#8b5cf6', lineHeight: 1 }}>{h.longestStreak}</p>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: 1 }}>рекорд</p>
              </div>

              {/* Last 7 days */}
              <div style={{ textAlign: 'center', minWidth: 48 }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366f1', lineHeight: 1 }}>{h.completedLast7}</p>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: 1 }}>из 7</p>
              </div>

              {/* 30d rate */}
              <div style={{ textAlign: 'center', minWidth: 52 }}>
                <p style={{ fontSize: '1.1rem', fontWeight: 800, color: rateColor, lineHeight: 1 }}>{rate}%</p>
                <p style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', marginTop: 1 }}>30 дней</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
