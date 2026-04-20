'use client';

import { useEffect, useState } from 'react';

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: string;
}

interface UserStats {
  xp: number;
  level: number;
  levelTitle: string;
  totalTasksCompleted: number;
  totalHabitsTracked: number;
  bestHabitStreak: number;
  achievements: Achievement[];
}

export function AchievementsCard() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/user/stats');
        if (!cancelled && res.ok) {
          setStats((await res.json()) as UserStats);
        }
      } catch {
        // ignore — demo mode
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (!stats) return null;

  const unlocked = stats.achievements.filter((a) => a.unlocked);
  const locked = stats.achievements.filter((a) => !a.unlocked);
  const shown = expanded ? stats.achievements : stats.achievements.slice(0, 6);

  return (
    <div
      className="card animate-slide-up"
      style={{ padding: '20px 22px', animationDelay: '300ms' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h3
            style={{
              fontSize: '0.88rem', fontWeight: 700,
              color: 'var(--text-primary)', marginBottom: 2,
            }}
          >
            🏆 Достижения
          </h3>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>
            {unlocked.length} из {stats.achievements.length} открыто
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-1)', lineHeight: 1 }}>
            {stats.xp}
          </p>
          <p style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>XP всего</p>
        </div>
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            height: 4, background: 'var(--border)',
            borderRadius: 99, overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${Math.round((unlocked.length / stats.achievements.length) * 100)}%`,
              background: 'linear-gradient(90deg, #f59e0b, #f97316)',
              borderRadius: 99,
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
      </div>

      {/* Achievement badges grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
          gap: 8,
        }}
      >
        {shown.map((a) => (
          <div
            key={a.id}
            title={a.description}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 4, padding: '10px 6px',
              borderRadius: 12,
              background: a.unlocked
                ? 'linear-gradient(135deg, rgba(245,158,11,0.10), rgba(249,115,22,0.07))'
                : 'var(--border)',
              border: `1px solid ${a.unlocked ? 'rgba(245,158,11,0.20)' : 'transparent'}`,
              opacity: a.unlocked ? 1 : 0.45,
              transition: 'all 0.2s',
              cursor: 'default',
            }}
          >
            <span
              style={{
                fontSize: '1.4rem', lineHeight: 1,
                filter: a.unlocked ? 'none' : 'grayscale(1)',
              }}
            >
              {a.emoji}
            </span>
            <p
              style={{
                fontSize: '0.6rem', fontWeight: 600,
                color: a.unlocked ? 'var(--text-primary)' : 'var(--text-tertiary)',
                textAlign: 'center', lineHeight: 1.3,
              }}
            >
              {a.title}
            </p>
            {a.unlocked && (
              <span
                style={{
                  fontSize: '0.55rem', fontWeight: 700,
                  color: '#f59e0b',
                  background: 'rgba(245,158,11,0.15)',
                  borderRadius: 999, padding: '1px 5px',
                }}
              >
                ✓ Открыто
              </span>
            )}
          </div>
        ))}
      </div>

      {stats.achievements.length > 6 && (
        <button
          onClick={() => setExpanded((p) => !p)}
          style={{
            marginTop: 12, width: '100%',
            padding: '7px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'transparent', cursor: 'pointer',
            fontSize: '0.75rem', color: 'var(--text-secondary)',
            fontWeight: 600, transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--border)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
        >
          {expanded ? '↑ Свернуть' : `↓ Показать все (${locked.length} заблокировано)`}
        </button>
      )}
    </div>
  );
}
