'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

type Phase = 'focus' | 'break';

const FOCUS_SECS = 25 * 60;
const BREAK_SECS = 5 * 60;

function secsForPhase(p: Phase) {
  return p === 'focus' ? FOCUS_SECS : BREAK_SECS;
}

export function FocusTimer() {
  const [phase, setPhase] = useState<Phase>('focus');
  const [timeLeft, setTimeLeft] = useState(FOCUS_SECS);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = secsForPhase(phase);

  const progress = (total - timeLeft) / total;
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - progress);

  const stopInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Switch phase and reset
  const switchPhase = useCallback((next: Phase) => {
    stopInterval();
    setRunning(false);
    setPhase(next);
    setTimeLeft(secsForPhase(next));
    if (next === 'focus') setSessions((s) => s + 1);
  }, [stopInterval]);

  const handleReset = useCallback(() => {
    stopInterval();
    setRunning(false);
    setTimeLeft(secsForPhase(phase));
  }, [phase, stopInterval]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            const next: Phase = phase === 'focus' ? 'break' : 'focus';
            switchPhase(next);
            return secsForPhase(next);
          }
          return t - 1;
        });
      }, 1000);
    } else {
      stopInterval();
    }
    return stopInterval;
  }, [running, phase, switchPhase, stopInterval]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  const accentColor = phase === 'focus' ? '#6366f1' : '#10b981';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      {/* Phase switch */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--border)', borderRadius: 10, padding: 3 }}>
        {(['focus', 'break'] as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => switchPhase(p)}
            style={{
              padding: '5px 14px',
              borderRadius: 8,
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.78rem',
              fontWeight: 600,
              background: phase === p ? 'var(--bg-elevated)' : 'transparent',
              color: phase === p ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: phase === p ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s var(--ease)',
            }}
          >
            {p === 'focus' ? '🎯 Фокус' : '☕ Пауза'}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div style={{ position: 'relative', width: 130, height: 130 }}>
        <svg width="130" height="130" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="65" cy="65" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle
            className="timer-ring"
            cx="65" cy="65" r="52"
            fill="none"
            stroke={accentColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontSize: '1.7rem', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: 'var(--text-primary)', lineHeight: 1 }}>
            {mm}:{ss}
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', marginTop: 2 }}>
            {phase === 'focus' ? 'фокус' : 'пауза'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => setRunning((r) => !r)}
          className="btn btn-primary"
          style={{ minWidth: 80 }}
        >
          {running ? '⏸ Пауза' : '▶ Старт'}
        </button>
        <button onClick={handleReset} className="btn btn-ghost" style={{ padding: '8px 12px' }}>
          ↺
        </button>
      </div>

      {/* Sessions */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {Array.from({ length: Math.max(sessions, 4) }).map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            background: i < sessions ? '#6366f1' : 'var(--border)',
            transition: 'background 0.3s var(--ease)',
          }} />
        ))}
        <span style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)', marginLeft: 4 }}>
          {sessions} сессий
        </span>
      </div>
    </div>
  );
}
