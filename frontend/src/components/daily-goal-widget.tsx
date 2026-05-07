'use client';

import { useState } from 'react';

const STORAGE_KEY = 'nt-daily-goal';

function getRingPath(pct: number, size: number, strokeWidth: number) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - Math.min(pct, 1));
  return { circumference, dashOffset, r, cx, cy };
}

interface DailyGoalWidgetProps {
  completedToday: number;
  totalTasks: number;
}

export function DailyGoalWidget({ completedToday, totalTasks }: DailyGoalWidgetProps) {
  const [goal, setGoal] = useState<number>(() => {
    if (typeof document === 'undefined') return 5;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? Math.max(1, Math.min(20, parseInt(stored, 10))) : 5;
    } catch {
      return 5;
    }
  });

  function updateGoal(delta: number) {
    setGoal((prev) => {
      const next = Math.max(1, Math.min(20, prev + delta));
      try { localStorage.setItem(STORAGE_KEY, String(next)); } catch { /* noop */ }
      return next;
    });
  }

  const done = Math.min(completedToday, goal);
  const pct = goal > 0 ? done / goal : 0;
  const size = 96;
  const strokeW = 7;
  const { circumference, dashOffset, r, cx, cy } = getRingPath(pct, size, strokeW);
  const isComplete = done >= goal;

  const accentColor = isComplete ? '#10b981' : '#6366f1';
  const bgColor = isComplete ? 'rgba(16,185,129,0.08)' : 'rgba(99,102,241,0.06)';

  return (
    <div
      style={{
        padding: '18px 20px',
        background: bgColor,
        border: `1px solid ${accentColor}22`,
        borderRadius: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 10,
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s var(--ease)',
      }}
    >
      {/* Heading */}
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: '0.73rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Цель дня
          </p>
          {isComplete && (
            <p style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, marginTop: 2 }}>
              🎉 Цель достигнута!
            </p>
          )}
        </div>
        {/* +/- controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            onClick={() => updateGoal(-1)}
            style={{
              width: 22, height: 22, borderRadius: 6,
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-elevated)',
              cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1,
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.1s',
            }}
            aria-label="Уменьшить цель"
          >
            −
          </button>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: 14, textAlign: 'center' }}>
            {goal}
          </span>
          <button
            onClick={() => updateGoal(1)}
            style={{
              width: 22, height: 22, borderRadius: 6,
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-elevated)',
              cursor: 'pointer', fontSize: '0.9rem', lineHeight: 1,
              color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.1s',
            }}
            aria-label="Увеличить цель"
          >
            +
          </button>
        </div>
      </div>

      {/* Ring */}
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeW}
          />
          {/* Progress */}
          <circle
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={accentColor}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.4,0,0.2,1), stroke 0.3s' }}
          />
        </svg>
        {/* Center text */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 0,
        }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>
            {done}
          </span>
          <span style={{ fontSize: '0.62rem', color: 'var(--text-tertiary)', lineHeight: 1.2 }}>
            / {goal}
          </span>
        </div>
      </div>

      {/* Stats below ring */}
      <div style={{ display: 'flex', gap: 14, fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
        <span>
          <span style={{ fontWeight: 700, color: accentColor }}>
            {Math.round(pct * 100)}%
          </span>
          {' '}выполнено
        </span>
        <span>
          {goal - done > 0
            ? <><span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>{goal - done}</span> осталось</>
            : <span style={{ color: '#10b981', fontWeight: 700 }}>Готово! ✓</span>
          }
        </span>
      </div>

      {/* Total tasks context */}
      <p style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginTop: -4 }}>
        Всего задач: {totalTasks}
      </p>
    </div>
  );
}
