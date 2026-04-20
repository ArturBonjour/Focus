'use client';

import { useEffect, useState } from 'react';

interface UserStats {
  xp: number;
  level: number;
  levelTitle: string;
  totalTasksCompleted: number;
  bestHabitStreak: number;
  achievements: { id: string; unlocked: boolean }[];
}

interface UserProfile {
  email: string;
  name: string | null;
}

const LEVEL_COLORS = [
  '#6b7280', // L1 gray
  '#10b981', // L2 emerald
  '#3b82f6', // L3 blue
  '#8b5cf6', // L4 violet
  '#f59e0b', // L5 amber
  '#ef4444', // L6 red
  '#ec4899', // L7 pink
  '#6366f1', // L8 indigo
  '#14b8a6', // L9 teal
  '#f97316', // L10 orange
];

function xpForLevel(level: number): number {
  // XP needed to reach this level: sum of 1..level * 100
  return (level * (level + 1) * 100) / 2;
}

function xpForNextLevel(level: number): number {
  return (level + 1) * 100;
}

export function UserProfileWidget() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [pRes, sRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/user/stats'),
        ]);
        if (!cancelled) {
          if (pRes.ok) setProfile((await pRes.json()) as UserProfile);
          if (sRes.ok) setStats((await sRes.json()) as UserStats);
        }
      } catch {
        // ignore — user may be in demo mode
      }
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  if (!profile || !stats) return null;

  const displayName = profile.name ?? profile.email.split('@')[0];
  const initials = displayName
    .split(/[\s_-]+/)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase() ?? '')
    .join('');

  const levelColor = LEVEL_COLORS[Math.min(stats.level - 1, LEVEL_COLORS.length - 1)];
  const xpInCurrentLevel = stats.xp - xpForLevel(stats.level - 1);
  const xpNeeded = xpForNextLevel(stats.level - 1);
  const xpPercent = Math.min(100, Math.round((xpInCurrentLevel / xpNeeded) * 100));
  const unlockedCount = stats.achievements.filter((a) => a.unlocked).length;

  return (
    <div
      style={{
        margin: '12px 12px 0',
        padding: '14px',
        borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.06) 0%, rgba(139,92,246,0.04) 100%)',
        border: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute', top: -20, right: -20,
          width: 80, height: 80,
          borderRadius: '50%',
          background: levelColor,
          opacity: 0.08,
          filter: 'blur(20px)',
          pointerEvents: 'none',
        }}
      />

      {/* Avatar + Name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, position: 'relative' }}>
        {/* Avatar */}
        <div
          style={{
            width: 38, height: 38, borderRadius: 12, flexShrink: 0,
            background: `linear-gradient(135deg, ${levelColor}cc, ${levelColor}88)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.85rem', fontWeight: 800, color: '#fff',
            boxShadow: `0 2px 8px ${levelColor}40`,
            border: `2px solid ${levelColor}30`,
          }}
        >
          {initials || '?'}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: '0.82rem', fontWeight: 700,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              lineHeight: 1.2, marginBottom: 2,
            }}
          >
            {displayName}
          </p>
          {/* Level badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span
              style={{
                display: 'inline-flex', alignItems: 'center',
                fontSize: '0.65rem', fontWeight: 700,
                color: levelColor,
                background: `${levelColor}18`,
                borderRadius: 999, padding: '1px 7px',
                border: `1px solid ${levelColor}30`,
                letterSpacing: '0.02em',
              }}
            >
              ⭐ LVL {stats.level}
            </span>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
              {stats.levelTitle}
            </span>
          </div>
        </div>
      </div>

      {/* XP Progress bar */}
      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', fontWeight: 600 }}>
            XP {stats.xp}
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)' }}>
            {xpPercent}% до LVL {stats.level + 1}
          </span>
        </div>
        <div
          style={{
            height: 5, background: 'var(--border)',
            borderRadius: 99, overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${xpPercent}%`,
              background: `linear-gradient(90deg, ${levelColor}, ${levelColor}bb)`,
              borderRadius: 99,
              transition: 'width 1s cubic-bezier(0.4,0,0.2,1)',
            }}
          />
        </div>
      </div>

      {/* Mini stats row */}
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', borderRadius: 8, background: 'var(--border)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
            {stats.totalTasksCompleted}
          </p>
          <p style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1 }}>
            задач
          </p>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', borderRadius: 8, background: 'var(--border)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-1)', lineHeight: 1 }}>
            🔥{stats.bestHabitStreak}
          </p>
          <p style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1 }}>
            streak
          </p>
        </div>
        <div style={{ flex: 1, textAlign: 'center', padding: '6px 4px', borderRadius: 8, background: 'var(--border)' }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f59e0b', lineHeight: 1 }}>
            🏆{unlockedCount}
          </p>
          <p style={{ fontSize: '0.58rem', color: 'var(--text-tertiary)', marginTop: 2, lineHeight: 1 }}>
            ачивок
          </p>
        </div>
      </div>
    </div>
  );
}
