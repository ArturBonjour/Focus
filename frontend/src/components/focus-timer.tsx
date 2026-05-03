'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from './toast';

type Phase = 'focus' | 'short-break' | 'long-break';

const PHASE_SECS: Record<Phase, number> = {
  'focus':       25 * 60,
  'short-break':  5 * 60,
  'long-break':  15 * 60,
};

const PHASE_LABEL: Record<Phase, string> = {
  'focus':       '🎯 Фокус',
  'short-break': '☕ Пауза',
  'long-break':  '🌴 Длинная',
};

const PHASE_COLOR: Record<Phase, string> = {
  'focus':       '#6366f1',
  'short-break': '#10b981',
  'long-break':  '#f59e0b',
};

export function FocusTimer() {
  const [phase, setPhase] = useState<Phase>('focus');
  const [timeLeft, setTimeLeft] = useState(PHASE_SECS['focus']);
  const [running, setRunning] = useState(false);
  // sessions = completed focus sessions in current cycle (resets after long break)
  const [sessionsDone, setSessionsDone] = useState(0);
  const [totalPomodoros, setTotalPomodoros] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = PHASE_SECS[phase];
  const progress = (total - timeLeft) / total;
  const circumference = 2 * Math.PI * 52;
  const dashOffset = circumference * (1 - progress);
  const accentColor = PHASE_COLOR[phase];

  const stopInterval = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  const switchPhase = useCallback((next: Phase) => {
    stopInterval();
    setRunning(false);
    setPhase(next);
    setTimeLeft(PHASE_SECS[next]);
  }, [stopInterval]);

  const handleReset = useCallback(() => {
    stopInterval();
    setRunning(false);
    setTimeLeft(PHASE_SECS[phase]);
  }, [phase, stopInterval]);

  // Auto-advance phase on timer completion
  useEffect(() => {
    if (!running) { stopInterval(); return stopInterval; }

    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t > 1) return t - 1;

        // Timer reached 0
        if (phase === 'focus') {
          const newDone = sessionsDone + 1;
          setSessionsDone(newDone);
          setTotalPomodoros((p) => p + 1);

          if (newDone >= 4) {
            // Time for long break
            setSessionsDone(0);
            toast.success('🌴 Длинный перерыв!', '4 pomodoro завершено — заслуженный отдых 15 мин.');
            switchPhase('long-break');
            return PHASE_SECS['long-break'];
          } else {
            toast.info('☕ Короткий перерыв', `Сессия ${newDone}/4 завершена`);
            switchPhase('short-break');
            return PHASE_SECS['short-break'];
          }
        } else {
          toast.success('🎯 Время фокуса!', 'Перерыв закончился. Начинаем!');
          switchPhase('focus');
          return PHASE_SECS['focus'];
        }
      });
    }, 1000);

    return stopInterval;
  // sessionsDone intentionally excluded to avoid resetting interval mid-session
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, phase, stopInterval, switchPhase]);

  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');

  // Update document title with timer countdown
  useEffect(() => {
    if (running) {
      document.title = `${mm}:${ss} ${PHASE_LABEL[phase]} | NeuroTrack`;
    } else {
      document.title = 'NeuroTrack';
    }
    return () => {
      document.title = 'NeuroTrack';
    };
  }, [mm, ss, running, phase]);

  // Space key toggles play/pause
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === ' ' && e.target === document.body) {
        e.preventDefault();
        setRunning((r) => !r);
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, width: '100%' }}>
      {/* Phase switch tabs */}
      <div style={{ display: 'flex', gap: 3, background: 'var(--border)', borderRadius: 10, padding: 3, width: '100%' }}>
        {(['focus', 'short-break', 'long-break'] as Phase[]).map((p) => (
          <button
            key={p}
            onClick={() => switchPhase(p)}
            style={{
              flex: 1, padding: '5px 6px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: '0.72rem', fontWeight: 600,
              background: phase === p ? 'var(--bg-elevated)' : 'transparent',
              color: phase === p ? 'var(--text-primary)' : 'var(--text-tertiary)',
              boxShadow: phase === p ? 'var(--shadow-sm)' : 'none',
              transition: 'all 0.2s var(--ease)',
              whiteSpace: 'nowrap',
            }}
          >
            {PHASE_LABEL[p]}
          </button>
        ))}
      </div>

      {/* Ring */}
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <svg width="120" height="120" viewBox="0 0 130 130" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="65" cy="65" r="52" fill="none" stroke="var(--border)" strokeWidth="8" />
          <circle
            cx="65" cy="65" r="52" fill="none"
            stroke={accentColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s var(--ease)' }}
          />
        </svg>
        {/* Pulsing dot when running */}
        {running && (
          <div style={{
            position: 'absolute', top: 8, right: 8,
            width: 8, height: 8, borderRadius: '50%',
            background: accentColor,
            animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
          }} />
        )}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{
            fontSize: '1.65rem', fontWeight: 800, fontVariantNumeric: 'tabular-nums',
            color: running ? 'var(--text-primary)' : 'var(--text-secondary)',
            lineHeight: 1,
            transition: 'color 0.3s',
          }}>
            {mm}:{ss}
          </span>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-tertiary)', marginTop: 3, fontWeight: 500 }}>
            {phase === 'focus' ? 'фокус' : phase === 'short-break' ? 'пауза' : 'длинный отдых'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <button
          onClick={() => setRunning((r) => !r)}
          className="btn btn-primary"
          style={{ minWidth: 84, fontSize: '0.82rem' }}
        >
          {running ? '⏸ Пауза' : '▶ Старт'}
        </button>
        <button onClick={handleReset} className="btn btn-ghost" style={{ padding: '8px 10px' }} title="Сбросить">
          ↺
        </button>
      </div>

      {/* Session dots (4 per cycle) */}
      <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{
            width: i < sessionsDone ? 10 : 8,
            height: i < sessionsDone ? 10 : 8,
            borderRadius: '50%',
            background: i < sessionsDone ? accentColor : 'var(--border)',
            boxShadow: i < sessionsDone ? `0 0 6px ${accentColor}88` : 'none',
            transition: 'all 0.3s var(--ease)',
          }} />
        ))}
        <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', marginLeft: 4 }}>
          {sessionsDone}/4 · {totalPomodoros} всего
        </span>
      </div>

      {/* Space shortcut hint */}
      <p style={{ fontSize: '0.63rem', color: 'var(--text-tertiary)', opacity: 0.7 }}>
        <kbd style={{ fontFamily: 'monospace', background: 'var(--border)', borderRadius: 3, padding: '1px 4px' }}>Space</kbd> старт / пауза
      </p>
    </div>
  );
}
